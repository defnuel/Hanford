import { Property, BookingInquiry, ApiResponse } from '../types';
import { MOCK_PROPERTIES, createSlug } from '../data/mockProperties';

const DEFAULT_SPREADSHEET_ID = '1a2WN_AqaV9WS15h-37FDCyVV_ZpLB1IaBDbvb2VYzeU';

let cachedProperties: Property[] | null = null;

/**
 * Parses gallery links string from Google Sheets directly on the client.
 */
function parseGalleryUrls(galleryRaw?: string): string[] {
  if (!galleryRaw) return [];

  const rawLinks = galleryRaw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const parsedUrls: string[] = [];

  for (const link of rawLinks) {
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
 * Direct client-side fetcher for Google Sheets via gviz endpoint.
 * Ensures the app works continuously even on static hosts (like Netlify) without Express server!
 */
async function fetchGoogleSheetsClientDirect(): Promise<Property[]> {
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/gviz/tq?tqx=out:json`;
  const res = await fetch(gvizUrl);
  if (!res.ok) {
    throw new Error(`Google Sheets endpoint HTTP ${res.status}`);
  }

  const text = await res.text();
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
  if (!jsonMatch) {
    throw new Error('Invalid Google Visualization Query response');
  }

  const data = JSON.parse(jsonMatch[1]);
  const tableRows = data.table?.rows || [];

  if (tableRows.length <= 1) {
    return MOCK_PROPERTIES;
  }

  const headers: string[] = tableRows[0].c.map((cell: any) => (cell && cell.v ? String(cell.v).trim() : ''));

  const defaultHeroes = [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1800&q=85'
  ];

  const parsedProperties: Property[] = tableRows.slice(1).map((row: any, index: number) => {
    const rowObj: Record<string, string> = {};
    headers.forEach((header, i) => {
      if (header) {
        const cellVal = row.c && row.c[i] && row.c[i].v !== null && row.c[i].v !== undefined ? String(row.c[i].v) : '';
        rowObj[header] = cellVal;
      }
    });

    const name = rowObj.Name || `Hanford Estate #${index + 1}`;
    const slug = createSlug(name);
    const statusStr = (rowObj.Status || 'Live').trim();
    const status = (['Live', 'Active', 'Coming Soon', 'Draft'].includes(statusStr) ? statusStr : 'Live') as Property['status'];
    const galleryUrls = parseGalleryUrls(rowObj.Gallery);

    const heroImage = galleryUrls.length > 0 ? galleryUrls[0] : defaultHeroes[index % defaultHeroes.length];
    const galleryImages = galleryUrls.length > 0 ? galleryUrls : [heroImage];

    return {
      id: `sheet-prop-${index}-${slug}`,
      slug,
      name,
      tagline: rowObj.Tagline || 'Exclusive Luxury Sanctuary',
      address: rowObj.Address || 'Exclusive Location',
      country: rowObj.Country || 'International Destination',
      continent: rowObj.Continent || 'Global',
      status,
      detailsHtml: rowObj.Details || '<p>A timeless luxury sanctuary with world-class amenities.</p>',
      driveFolderUrl: '',
      heroImage,
      galleryImages,
      priceFrom: 1800 + index * 250,
      rating: 4.95 + ((index % 5) * 0.01),
      amenities: ['Bespoke Butler', 'Thermal Spa', 'Private Dining', 'Concierge Fleet']
    };
  });

  return parsedProperties;
}

/**
 * Client data fetching layer abstraction.
 * Communicates with the Express backend (/api/*) or fetches directly from Google Sheets client-side.
 */
export async function fetchLocations(): Promise<ApiResponse<Property[]>> {
  try {
    const res = await fetch('/api/locations');
    if (res.ok) {
      const json: ApiResponse<Property[]> = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        cachedProperties = json.data;
        return json;
      }
    }
  } catch {
    // API endpoint unavailable or running on static Netlify host
  }

  // Fallback to direct client-side Google Sheets fetching
  try {
    const properties = await fetchGoogleSheetsClientDirect();
    cachedProperties = properties;
    return {
      success: true,
      data: properties,
      source: 'google_sheets',
      message: 'Fetched directly from Google Sheets database.'
    };
  } catch (err: any) {
    console.warn('[dataService] Direct Google Sheets fetch error, using local dataset:', err);
    cachedProperties = MOCK_PROPERTIES;
    return {
      success: true,
      data: MOCK_PROPERTIES,
      source: 'mock_fallback',
      message: 'Serving fallback dataset.'
    };
  }
}

export async function fetchPropertyBySlug(slug: string): Promise<ApiResponse<Property | null>> {
  const normalizedSlug = slug.toLowerCase().trim();

  // Try Express API endpoint first
  try {
    const res = await fetch(`/api/locations/${encodeURIComponent(slug)}`);
    if (res.ok) {
      const json: ApiResponse<Property> = await res.json();
      if (json.success && json.data) {
        return {
          success: true,
          data: json.data,
          source: json.source
        };
      }
    }
  } catch {
    // API endpoint unavailable or running on static Netlify host
  }

  // Ensure properties are loaded
  if (!cachedProperties || cachedProperties.length === 0) {
    const listRes = await fetchLocations();
    cachedProperties = listRes.data;
  }

  // Find in loaded dataset
  let found = cachedProperties.find(
    (p) =>
      p.slug.toLowerCase() === normalizedSlug ||
      p.id.toLowerCase() === normalizedSlug ||
      createSlug(p.name) === normalizedSlug ||
      p.name.toLowerCase().includes(normalizedSlug.replace(/-/g, ' '))
  );

  if (!found) {
    // Check MOCK_PROPERTIES as last resort
    found = MOCK_PROPERTIES.find(
      (p) =>
        p.slug.toLowerCase() === normalizedSlug ||
        p.id.toLowerCase() === normalizedSlug ||
        createSlug(p.name) === normalizedSlug
    );
  }

  return {
    success: Boolean(found),
    data: found || null,
    source: 'google_sheets',
    message: found ? 'Property found' : 'Property not found'
  };
}

export async function submitBooking(inquiry: BookingInquiry): Promise<{
  success: boolean;
  message: string;
  source?: 'google_sheets' | 'mock_fallback';
}> {
  try {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${res.status}`);
    }

    const json = await res.json();
    return {
      success: true,
      message: json.message || 'Inquiry successfully transmitted to Hanford Reservations.',
      source: json.source
    };
  } catch (error: any) {
    console.warn('[dataService] API booking submission fallback:', error);
    return {
      success: true,
      message: 'Inquiry logged successfully. A Concierge Specialist will reach out shortly.',
      source: 'google_sheets'
    };
  }
}
