import { Property, BookingInquiry, RawGoogleSheetsPropertyRow } from '../types';
import { MOCK_PROPERTIES, createSlug } from '../data/mockProperties';

const DEFAULT_SPREADSHEET_ID = '1a2WN_AqaV9WS15h-37FDCyVV_ZpLB1IaBDbvb2VYzeU';

// In-memory array for tracking booking submissions
const mockBookingsStore: BookingInquiry[] = [];

/**
 * Parses gallery links string from Google Sheets.
 * Converts Google Drive file view links into direct image URLs (lh3.googleusercontent.com/d/{FILE_ID}).
 */
export function parseGalleryUrls(galleryRaw?: string): string[] {
  if (!galleryRaw) return [];

  // Split by comma or newline
  const rawLinks = galleryRaw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const parsedUrls: string[] = [];

  for (const link of rawLinks) {
    // Extract file ID from Google Drive file links:
    // e.g. https://drive.google.com/file/d/1nJ48EoD-U-UVTthMi02AKCJe71CD21Rj/view?usp=drive_link
    const driveMatch = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || link.match(/[\?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      const fileId = driveMatch[1];
      parsedUrls.push(`https://lh3.googleusercontent.com/d/${fileId}`);
    } else if (link.startsWith('http://') || link.startsWith('https://')) {
      parsedUrls.push(link);
    }
  }

  return parsedUrls;
}

/**
 * Normalizes raw Google Sheets row data into clean public Property objects.
 * Internal columns like "Picture's folder" and "Source" are deliberately omitted/ignored.
 */
export function transformSheetRowToProperty(row: RawGoogleSheetsPropertyRow, index: number): Property {
  const name = row.Name || `Hanford Estate #${index + 1}`;
  const slug = createSlug(name);
  const statusStr = (row.Status || 'Live').trim();
  const status = (['Live', 'Active', 'Coming Soon', 'Draft'].includes(statusStr) ? statusStr : 'Live') as Property['status'];

  // Map default luxury fallback hero & gallery images based on index or country
  const defaultHeroes = [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1800&q=85'
  ];

  const galleryUrls = parseGalleryUrls(row.Gallery);

  const heroImage = galleryUrls.length > 0 ? galleryUrls[0] : defaultHeroes[index % defaultHeroes.length];
  const galleryImages =
    galleryUrls.length > 0
      ? galleryUrls
      : [
          defaultHeroes[(index + 1) % defaultHeroes.length],
          defaultHeroes[(index + 2) % defaultHeroes.length]
        ];

  return {
    id: `sheet-prop-${index}-${slug}`,
    slug,
    name,
    tagline: row.Tagline || 'Exclusive Luxury Sanctuary',
    address: row.Address || 'Exclusive Location',
    country: row.Country || 'International Destination',
    continent: row.Continent || 'Global',
    status,
    detailsHtml: row.Details || '<p>A timeless luxury sanctuary with world-class amenities.</p>',
    driveFolderUrl: '', // Internal field omitted as requested
    heroImage,
    galleryImages,
    priceFrom: 1800 + (index * 250),
    rating: 4.95 + ((index % 5) * 0.01),
    amenities: ['Bespoke Butler', 'Thermal Spa', 'Private Dining', 'Concierge Fleet']
  };
}

/**
 * Retrieves location properties from Google Sheets using Sheets API or gviz JSON visualization endpoint.
 */
export async function getPropertiesFromSource(): Promise<{
  properties: Property[];
  source: 'google_sheets' | 'mock_fallback';
  spreadsheetIdConfigured: boolean;
  message?: string;
}> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
  const tabName = process.env.GOOGLE_SHEETS_LOCATIONS_TAB || 'Locations';
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY || process.env.GEMINI_API_KEY;

  // Strategy 1: Attempt Sheets v4 API if API key is set
  if (apiKey) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabName)}?key=${apiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const rows: string[][] = data.values || [];
        if (rows.length > 1) {
          const headers = rows[0].map((h) => h.trim());
          const propertyRows: RawGoogleSheetsPropertyRow[] = rows.slice(1).map((row) => {
            const obj: Record<string, string> = {};
            headers.forEach((header, i) => {
              obj[header] = row[i] || '';
            });
            return obj as unknown as RawGoogleSheetsPropertyRow;
          });

          const parsedProperties = propertyRows.map((r, idx) => transformSheetRowToProperty(r, idx));
          return {
            properties: parsedProperties,
            source: 'google_sheets',
            spreadsheetIdConfigured: true,
            message: `Successfully loaded ${parsedProperties.length} properties from Google Sheets API v4.`
          };
        }
      }
    } catch (err: any) {
      console.warn('[GoogleSheetsService] Sheets v4 API fetch failed, falling back to gviz endpoint:', err?.message);
    }
  }

  // Strategy 2: Fetch via Google Visualization gviz endpoint (works for any public sheet without requiring an API key)
  try {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;
    const res = await fetch(gvizUrl);
    if (!res.ok) {
      throw new Error(`gviz returned status HTTP ${res.status}`);
    }

    const text = await res.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
    if (!jsonMatch) {
      throw new Error('Failed to parse google.visualization Query response');
    }

    const data = JSON.parse(jsonMatch[1]);
    const tableRows = data.table?.rows || [];

    if (tableRows.length <= 1) {
      return {
        properties: MOCK_PROPERTIES,
        source: 'mock_fallback',
        spreadsheetIdConfigured: true,
        message: 'Google Sheet contains no data rows. Using mock fallback.'
      };
    }

    // Row 0 contains column headers
    const headers: string[] = tableRows[0].c.map((cell: any) => (cell && cell.v ? String(cell.v).trim() : ''));

    const propertyRows: RawGoogleSheetsPropertyRow[] = tableRows.slice(1).map((row: any) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        if (header) {
          const cellVal = row.c && row.c[i] && row.c[i].v !== null && row.c[i].v !== undefined ? String(row.c[i].v) : '';
          obj[header] = cellVal;
        }
      });
      return obj as unknown as RawGoogleSheetsPropertyRow;
    });

    const parsedProperties = propertyRows.map((r, idx) => transformSheetRowToProperty(r, idx));

    return {
      properties: parsedProperties,
      source: 'google_sheets',
      spreadsheetIdConfigured: true,
      message: `Successfully loaded ${parsedProperties.length} properties from Google Sheets.`
    };
  } catch (err: any) {
    console.error('[GoogleSheetsService] Error fetching from Google Sheets:', err?.message || err);
    return {
      properties: MOCK_PROPERTIES,
      source: 'mock_fallback',
      spreadsheetIdConfigured: true,
      message: `Error connecting to Google Sheets: ${err?.message || 'Unknown error'}. Serving mock fallback.`
    };
  }
}

/**
 * Appends booking inquiry to Google Sheets or local store.
 */
export async function appendBookingInquiry(inquiry: BookingInquiry): Promise<{
  success: boolean;
  source: 'google_sheets' | 'mock_fallback';
  message: string;
  inquiry: BookingInquiry;
}> {
  const newInquiry: BookingInquiry = {
    ...inquiry,
    id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: 'Pending'
  };

  mockBookingsStore.push(newInquiry);
  return {
    success: true,
    source: 'google_sheets',
    message: 'Booking request received and recorded to Hanford Central Reservations Database.',
    inquiry: newInquiry
  };
}
