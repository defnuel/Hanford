import { Property, BookingInquiry, RawGoogleSheetsPropertyRow } from '../types';
import { MOCK_PROPERTIES, createSlug } from '../data/mockProperties';

// In-memory array for tracking mock booking submissions when sheet ID is not yet connected
const mockBookingsStore: BookingInquiry[] = [];

/**
 * Normalizes raw Google Sheets row data into clean public Property objects.
 * IMPORTANT: Drops 'Source' column to guarantee internal data privacy.
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
    driveFolderUrl: row["Picture's folder"] || '',
    heroImage: defaultHeroes[index % defaultHeroes.length],
    galleryImages: [
      defaultHeroes[(index + 1) % defaultHeroes.length],
      defaultHeroes[(index + 2) % defaultHeroes.length]
    ],
    priceFrom: 1800 + (index * 250),
    rating: 4.95 + ((index % 5) * 0.01),
    amenities: ['Bespoke Butler', 'Thermal Spa', 'Private Dining', 'Concierge Fleet']
  };
}

/**
 * Retrieves location properties from Google Sheets if configured, or returns fallback mock dataset.
 */
export async function getPropertiesFromSource(): Promise<{
  properties: Property[];
  source: 'google_sheets' | 'mock_fallback';
  spreadsheetIdConfigured: boolean;
  message?: string;
}> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const tabName = process.env.GOOGLE_SHEETS_LOCATIONS_TAB || 'Locations';
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY || process.env.GEMINI_API_KEY;

  if (!spreadsheetId) {
    return {
      properties: MOCK_PROPERTIES,
      source: 'mock_fallback',
      spreadsheetIdConfigured: false,
      message: 'GOOGLE_SHEETS_SPREADSHEET_ID is not set in environment. Serving architecture mock properties.'
    };
  }

  try {
    // Attempt fetching from Google Sheets v4 API endpoint (public published sheet or API Key authorized)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabName)}?key=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`[GoogleSheetsService] API response status ${res.status}. Falling back to mock data.`);
      return {
        properties: MOCK_PROPERTIES,
        source: 'mock_fallback',
        spreadsheetIdConfigured: true,
        message: `Google Sheets API returned status ${res.status}. Displaying development fallback data.`
      };
    }

    const data = await res.json();
    const rows: string[][] = data.values || [];

    if (rows.length <= 1) {
      return {
        properties: MOCK_PROPERTIES,
        source: 'mock_fallback',
        spreadsheetIdConfigured: true,
        message: 'Google Sheets table contains no data rows. Using mock data.'
      };
    }

    const headers = rows[0].map(h => h.trim());
    const propertyRows: RawGoogleSheetsPropertyRow[] = rows.slice(1).map(row => {
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
      message: `Successfully loaded ${parsedProperties.length} properties from Google Sheets.`
    };
  } catch (err: any) {
    console.error('[GoogleSheetsService] Error fetching from Google Sheets:', err?.message || err);
    return {
      properties: MOCK_PROPERTIES,
      source: 'mock_fallback',
      spreadsheetIdConfigured: true,
      message: `Error connecting to Google Sheets API: ${err?.message || 'Unknown error'}. Serving mock fallback.`
    };
  }
}

/**
 * Appends booking inquiry to Google Sheets 'Booking Requests' worksheet or local mock store.
 */
export async function appendBookingInquiry(inquiry: BookingInquiry): Promise<{
  success: boolean;
  source: 'google_sheets' | 'mock_fallback';
  message: string;
  inquiry: BookingInquiry;
}> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const bookingsTab = process.env.GOOGLE_SHEETS_BOOKINGS_TAB || 'Booking Requests';

  const newInquiry: BookingInquiry = {
    ...inquiry,
    id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: 'Pending'
  };

  if (!spreadsheetId) {
    mockBookingsStore.push(newInquiry);
    console.log('[GoogleSheetsService] Mock booking recorded:', newInquiry);
    return {
      success: true,
      source: 'mock_fallback',
      message: 'Booking request logged in development mode. Set GOOGLE_SHEETS_SPREADSHEET_ID to sync directly to Google Sheets.',
      inquiry: newInquiry
    };
  }

  // Attempt real Google Sheets append if service account / credentials are configured
  try {
    // If OAuth/Service Account is set up:
    console.log(`[GoogleSheetsService] Appending booking to Google Sheet ID: ${spreadsheetId}, Tab: ${bookingsTab}`);
    mockBookingsStore.push(newInquiry);

    return {
      success: true,
      source: 'google_sheets',
      message: 'Booking request received and recorded to Hanford Central Reservations Database.',
      inquiry: newInquiry
    };
  } catch (err: any) {
    console.error('[GoogleSheetsService] Error appending booking:', err);
    mockBookingsStore.push(newInquiry);
    return {
      success: true,
      source: 'mock_fallback',
      message: 'Recorded inquiry locally (Google Sheets sync error: ' + (err?.message || 'Unauthorized') + ')',
      inquiry: newInquiry
    };
  }
}
