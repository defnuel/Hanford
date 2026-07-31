import crypto from 'crypto';
import { Property, Project, BookingInquiry, RawGoogleSheetsPropertyRow, RawGoogleSheetsProjectRow } from '../types';
import { MOCK_PROPERTIES, createSlug } from '../data/mockProperties';
import { MOCK_PROJECTS } from '../data/mockProjects';

const DEFAULT_SPREADSHEET_ID = '1a2WN_AqaV9WS15h-37FDCyVV_ZpLB1IaBDbvb2VYzeU';

// In-memory array for tracking booking submissions
const mockBookingsStore: BookingInquiry[] = [];

/**
 * Generates an OAuth2 access token for Google Sheets API using a Service Account private key.
 */
async function getGoogleSheetsAccessToken(email: string, privateKeyPem: string): Promise<string> {
  const formattedKey = privateKeyPem.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${b64(header)}.${b64(claimSet)}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer.sign(formattedKey, 'base64url');

  const jwt = `${unsignedToken}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error_description || errJson.error || `Token exchange status HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

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

  const mainPicRaw = row['Main Picture'] || row['Main picture'] || (row as any)['main picture'] || (row as any)['MainPicture'];
  const mainPicUrls = parseGalleryUrls(mainPicRaw);
  const galleryUrls = parseGalleryUrls(row.Gallery);

  const combinedImageUrls = Array.from(new Set([...mainPicUrls, ...galleryUrls]));

  const heroImage = combinedImageUrls.length > 0 ? combinedImageUrls[0] : defaultHeroes[index % defaultHeroes.length];
  const galleryImages =
    combinedImageUrls.length > 0
      ? combinedImageUrls
      : [
          defaultHeroes[(index + 1) % defaultHeroes.length],
          defaultHeroes[(index + 2) % defaultHeroes.length]
        ];

  const parsePriceNumber = (val: any): number | undefined => {
    if (val === undefined || val === null || String(val).trim() === '') return undefined;
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return !isNaN(num) && num > 0 ? num : undefined;
  };

  const nameLower = name.toLowerCase();
  const isEcoResort = nameLower.includes('eco resort') || (row.Tagline || '').toLowerCase().includes('eco resort');
  const isGrandHotel = nameLower.includes('grand hotel') && !nameLower.includes('resort');
  const hasPrivateVilla = !isGrandHotel;

  const getRowVal = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      const kLower = k.toLowerCase().trim();
      for (const [rowKey, val] of Object.entries(row)) {
        if (rowKey.toLowerCase().trim() === kLower) {
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            return String(val).trim();
          }
        }
      }
    }
    return undefined;
  };

  // Extract room and event specific pricing columns from row object
  // Standard Room column is the primary source for starting rate / cheapest room
  const rawStandardVal = getRowVal('Standard Room', 'Standard Room Rate', 'Standard Room ($)', 'Standard', 'Standard Rate', 'Price', 'price', 'PriceFrom', 'Price/night', 'Rate');
  const parsedStandard = parsePriceNumber(rawStandardVal);
  const priceStandard = parsedStandard || (850 + index * 150);
  const priceFrom = priceStandard; // Starting rate takes from Standard Room column

  const priceDeluxe = parsePriceNumber(getRowVal('Deluxe Room', 'Deluxe Room Rate', 'Deluxe Room ($)', 'Deluxe', 'Deluxe Rate')) || Math.round(priceStandard * 1.45);
  const pricePresidential = parsePriceNumber(getRowVal('Presidential Suite', 'Presidential Suite Rate', 'Presidential Suite ($)', 'Presidential', 'Presidential Rate')) || Math.round(priceStandard * 3.8);
  
  // Private Villa appears for Eco Resorts and Hotel & Resorts (only absent for Grand Hotels)
  const pricePrivateVilla = hasPrivateVilla
    ? (parsePriceNumber(getRowVal('Private Villa', 'Villa', 'Private Villa Rate')) || Math.round(priceStandard * 5.2))
    : undefined;

  const priceMeetingRoom = parsePriceNumber(getRowVal('Meeting Room', 'Meeting Room Rate', 'Meeting')) || 120;
  const priceEventHall = parsePriceNumber(getRowVal('Event Hall', 'Event Hall Rate', 'Hall')) || 3200;
  const priceCateringPerPax = parsePriceNumber(getRowVal('Catering Per Pax', 'Catering Rate', 'Catering')) || 75;

  const amenitiesRaw = row.Amenities || (row as any)['amenities'] || (row as any)['Privileges'] || (row as any)['Services'];
  let amenitiesList: string[] = [];
  if (amenitiesRaw) {
    amenitiesList = String(amenitiesRaw)
      .split(/[,;\n|•]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (amenitiesList.length === 0) {
    amenitiesList = ['Bespoke Butler', 'Thermal Spa', 'Private Dining', 'Concierge Fleet'];
  }

  const discountCode = getRowVal('Discount Code', 'DiscountCode', 'Coupon Code', 'Kupon', 'Discount code', 'discount_code', 'Kode Diskon', 'Kode Promo');
  const rawDiscountPercent = getRowVal('Discount (%)', 'Discount %', 'DiscountPercent', 'Discount', 'Diskon', 'Discount percent', 'Besaran Diskon');
  const discountPercent = rawDiscountPercent !== undefined ? rawDiscountPercent : undefined;

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
    priceFrom,
    rating: 4.95 + ((index % 5) * 0.01),
    amenities: amenitiesList,
    priceStandard,
    priceDeluxe,
    pricePresidential,
    pricePrivateVilla,
    priceMeetingRoom,
    priceEventHall,
    priceCateringPerPax,
    isEcoResort,
    capacityStandard: (row as any)['Standard Room Capacity'] || (row as any)['Standard Capacity'] || 'Max 3 guests (2 Adults + 1 Child)',
    capacityDeluxe: (row as any)['Deluxe Room Capacity'] || (row as any)['Deluxe Capacity'] || 'Max 3 guests (2 Adults + 1 Child)',
    capacityPresidential: (row as any)['Presidential Suite Capacity'] || (row as any)['Presidential Capacity'] || 'Max 5 guests (4 Adults + 1 Child)',
    capacityPrivateVilla: hasPrivateVilla
      ? ((row as any)['Private Villa Capacity'] || (row as any)['Villa Capacity'] || 'Max 6 guests (4 Adults + 2 Children)')
      : undefined,
    discountCode,
    discountPercent
  };
}

/**
 * Normalizes raw Google Sheets row data into clean public Project objects.
 * Internal columns like "Picture's folder" and "Source" are deliberately omitted/ignored.
 */
export function transformSheetRowToProject(row: RawGoogleSheetsProjectRow, index: number): Project {
  const rawId = row['Project_ID'] || row['Project ID'] || (row as any).id || '';
  const rawName = row['Project Name'] || row['Project_Name'] || row.Name || row.Tagline || '';
  const projectName = rawName.trim() || `Hanford Collaboration #${index + 1}`;
  const slug = createSlug(projectName);
  const projectType = (row['Project Type'] || row['Project_Type'] || 'Collaboration').trim();
  const partnerName = (row['Partner Name'] || row['Partner_Name'] || 'Hanford Partner').trim();
  const rawXUser = row['X Username'] || row['X_Username'] || row['Twitter Username'] || (row as any)['xUsername'] || (row as any)['Twitter'] || '';
  const xUsername = rawXUser ? (rawXUser.startsWith('@') ? rawXUser : `@${rawXUser.trim()}`) : '';
  const xLink = (row['X Link'] || row['X_Link'] || (row as any)['xLink'] || '').trim();
  const location = (row.Location || '').trim();
  const date = (row.Date || '').trim();
  const statusStr = (row.Status || 'Active').trim();
  const shortDescription = (row['Short Description'] || row['Short_Description'] || '').trim();
  const rawDescription = (row.Description || shortDescription || '').trim();

  // Strip HTML tags for clean card description preview
  const cleanDescription = rawDescription.includes('<') && rawDescription.includes('>')
    ? rawDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : rawDescription;

  const mainPicUrls = parseGalleryUrls(row['Main Picture'] || row['Main_Picture'] || row['Logo']);
  const galleryUrls = parseGalleryUrls(row.Gallery);
  const combinedGallery = Array.from(new Set([...mainPicUrls, ...galleryUrls]));

  const defaultHero = 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1800&q=85';
  const heroImage = combinedGallery.length > 0 ? combinedGallery[0] : defaultHero;
  const galleryImages = combinedGallery.length > 0 ? combinedGallery : [heroImage];

  const finalXLink = xLink || (xUsername ? `https://x.com/${xUsername.replace(/^@/, '')}` : '');

  let detailsHtml = row.Details || '';
  if (!detailsHtml) {
    if (rawDescription.includes('<p>') || rawDescription.includes('<div>') || rawDescription.includes('<h')) {
      detailsHtml = rawDescription;
    } else {
      detailsHtml = `
        <div style="font-family: inherit; color: #2C3744; line-height: 1.7;">
          <h1 style="font-family: serif; font-size: 28px; font-weight: 300; color: #3A4F67; margin-bottom: 8px;">${projectName}</h1>
          <h4 style="font-size: 14px; font-weight: 600; color: #51867E; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px;">
            ${projectType} &bull; ${partnerName} ${xUsername ? `(${xUsername})` : ''}
          </h4>

          ${shortDescription ? `
            <div style="padding: 16px 20px; background-color: #EAF2F1; border-left: 3px solid #51867E; border-radius: 8px; margin-bottom: 24px;">
              <p style="font-size: 14px; font-weight: 500; color: #3A4F67; margin: 0;">${shortDescription}</p>
            </div>
          ` : ''}

          <div style="font-size: 15px; color: #2C3744; margin-bottom: 28px;">
            <p style="white-space: pre-line;">${cleanDescription}</p>
          </div>

          ${location ? `<p style="font-size: 13px; color: #3A4F67; margin-bottom: 8px;"><strong>Location:</strong> ${location}</p>` : ''}
          ${date ? `<p style="font-size: 13px; color: #3A4F67; margin-bottom: 24px;"><strong>Date / Timeline:</strong> ${date}</p>` : ''}

          ${finalXLink ? `
            <p style="margin-top: 24px;">
              <a href="${finalXLink}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; max-width: 100%; padding: 12px 20px; background-color: #51867E; color: #ffffff; border-radius: 9999px; font-weight: 600; text-decoration: none; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; box-sizing: border-box; word-break: break-word;">
                <span>View Official Account / Link on X ${xUsername ? `(${xUsername})` : ''}</span>
                <span style="font-size: 14px; flex-shrink: 0;">&rarr;</span>
              </a>
            </p>
          ` : ''}
        </div>
      `;
    }
  }

  return {
    id: rawId || `sheet-proj-${index}-${slug}`,
    slug,
    projectName,
    projectType,
    partnerName,
    xUsername,
    xLink: finalXLink,
    location,
    date,
    status: statusStr,
    shortDescription,
    description: cleanDescription || shortDescription || `Official collaboration project with ${partnerName}.`,
    detailsHtml,
    heroImage,
    galleryImages
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
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?sheet=${encodeURIComponent(tabName)}&tqx=out:json`;
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

    if (!tableRows || tableRows.length === 0) {
      return {
        properties: MOCK_PROPERTIES,
        source: 'mock_fallback',
        spreadsheetIdConfigured: true,
        message: 'Google Sheet contains no data rows. Using mock fallback.'
      };
    }

    // Extract headers from data.table.cols
    let headers: string[] = [];
    if (data.table?.cols && data.table.cols.some((c: any) => c && c.label)) {
      headers = data.table.cols.map((c: any) => (c && c.label ? String(c.label).trim() : ''));
    }

    let dataRows = tableRows;
    if (tableRows.length > 0 && tableRows[0]?.c) {
      const row0Vals = tableRows[0].c.map((cell: any) => String(cell?.v || '').trim().toLowerCase());
      if (row0Vals.includes('name') && row0Vals.includes('country')) {
        headers = tableRows[0].c.map((cell: any) => (cell && cell.v ? String(cell.v).trim() : ''));
        dataRows = tableRows.slice(1);
      }
    }

    const propertyRows: RawGoogleSheetsPropertyRow[] = dataRows.map((row: any) => {
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
 * Retrieves projects/collaborations from Google Sheets 'Projects' tab using gviz endpoint or API.
 */
export async function getProjectsFromSource(): Promise<{
  projects: Project[];
  source: 'google_sheets' | 'mock_fallback';
  spreadsheetIdConfigured: boolean;
  message?: string;
}> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
  const configuredTab = process.env.GOOGLE_SHEETS_PROJECTS_TAB;
  const tabsToTry = configuredTab ? [configuredTab, 'Collaborations', 'Projects'] : ['Collaborations', 'Projects'];

  const endpointsToTry = [
    { url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?gid=1717332833&tqx=out:json`, name: 'GID 1717332833' },
    ...tabsToTry.map((tab) => ({
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?sheet=${encodeURIComponent(tab)}&tqx=out:json`,
      name: `Sheet '${tab}'`
    }))
  ];

  for (const endpoint of endpointsToTry) {
    try {
      const res = await fetch(endpoint.url);
      if (!res.ok) continue;

      const text = await res.text();
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
      if (!jsonMatch) continue;

      const data = JSON.parse(jsonMatch[1]);
      const tableRows = data.table?.rows || [];
      if (!tableRows || tableRows.length === 0) continue;

      // Determine headers and data rows cleanly
      let headers: string[] = [];
      let dataSlice = tableRows;

      const colsHasLabels = data.table?.cols && data.table.cols.some((c: any) => c && c.label && String(c.label).trim() !== '');
      if (colsHasLabels) {
        headers = data.table.cols.map((c: any) => (c && c.label ? String(c.label).trim() : ''));
        dataSlice = tableRows; // tableRows[0] is actual data row
      } else if (tableRows[0] && tableRows[0].c) {
        headers = tableRows[0].c.map((cell: any) => (cell && (cell.f || cell.v) ? String(cell.f || cell.v).trim() : ''));
        dataSlice = tableRows.slice(1);
      }

      if (headers.length === 0 || dataSlice.length === 0) continue;

      const projectRows: RawGoogleSheetsProjectRow[] = dataSlice.map((row: any) => {
        const obj: Record<string, string> = {};
        headers.forEach((header, i) => {
          if (header && row.c && row.c[i]) {
            const cell = row.c[i];
            const val = cell.f !== undefined && cell.f !== null ? String(cell.f) : (cell.v !== undefined && cell.v !== null ? String(cell.v) : '');
            obj[header] = val;
          }
        });
        return obj as unknown as RawGoogleSheetsProjectRow;
      });

      // Filter project rows: keep non-empty entries
      const realProjectRows = projectRows.filter((r) => {
        const name = (r['Project Name'] || r['Project_Name'] || r.Name || '').trim();
        const partner = (r['Partner Name'] || r['Partner_Name'] || '').trim();
        const projId = (r['Project_ID'] || r['Project ID'] || '').trim();
        const shortDesc = (r['Short Description'] || r['Short_Description'] || '').trim();
        const desc = (r['Description'] || '').trim();

        return Boolean(name || partner || projId || shortDesc || desc);
      });

      if (realProjectRows.length > 0) {
        const parsedProjects = realProjectRows.map((r, idx) => transformSheetRowToProject(r, idx));
        return {
          projects: parsedProjects,
          source: 'google_sheets',
          spreadsheetIdConfigured: true,
          message: `Successfully loaded ${parsedProjects.length} collaboration project(s) from Google Sheets (${endpoint.name}).`
        };
      }
    } catch (err: any) {
      console.warn(`[GoogleSheetsService] Failed fetching endpoint '${endpoint.name}':`, err?.message || err);
    }
  }

  return {
    projects: MOCK_PROJECTS,
    source: 'mock_fallback',
    spreadsheetIdConfigured: true,
    message: `Could not fetch data from Collaborations tab. Serving curated mock projects.`
  };
}

/**
 * Normalizes raw Google Sheets row data into clean BookingInquiry objects.
 */
export function transformSheetRowToBooking(row: Record<string, string>, index: number): BookingInquiry {
  const getVal = (...keys: string[]): string => {
    for (const key of keys) {
      const foundKey = Object.keys(row).find((k) => k.trim().toLowerCase() === key.toLowerCase());
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
        const val = String(row[foundKey]).trim();
        if (val) return val;
      }
    }
    return '';
  };

  const bookingId = getVal('booking id', 'booking_id', 'id', 'invoice id') || `HNF-2026-S${String(index + 1).padStart(4, '0')}`;
  const createdAt = getVal('timestamp', 'created at', 'createdat', 'tanggal', 'date') || new Date().toISOString();
  const propertyName = getVal('location', 'property', 'property name', 'nama properti', 'nama resort') || 'Hanford Estate';
  const guestName = getVal('name', 'guest name', 'nama', 'nama tamu', 'customer') || `Guest #${index + 1}`;
  const xUsername = getVal('x username', 'x_username', 'twitter', 'username', 'x handle') || 'N/A';
  const bookOptionRaw = getVal('book option', 'option', 'tipe booking', 'booking type') || 'room';

  const parseNum = (valStr: string): number => {
    const num = parseInt(valStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const parseMoney = (valStr: string): number => {
    const num = parseFloat(valStr.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const standardRooms = parseNum(getVal('standard rooms', 'standard'));
  const deluxeRooms = parseNum(getVal('deluxe rooms', 'deluxe'));
  const presidentialSuites = parseNum(getVal('presidential suites', 'presidential'));
  const privateVillas = parseNum(getVal('private villas', 'private villa', 'villa'));

  const eventAttendees = parseNum(getVal('event attendees (pax)', 'event attendees', 'pax', 'attendees'));
  const cateringPax = parseNum(getVal('catering pax', 'catering'));
  
  let eventAddons: 'none' | 'catering' | 'decoration' | 'both' = 'none';
  const addonsRaw = getVal('event add-ons', 'event addons', 'addons').toLowerCase();
  if (addonsRaw.includes('catering') && addonsRaw.includes('decor')) eventAddons = 'both';
  else if (addonsRaw.includes('catering')) eventAddons = 'catering';
  else if (addonsRaw.includes('decor')) eventAddons = 'decoration';
  else if (addonsRaw.includes('both')) eventAddons = 'both';

  const checkInDate = getVal('check-in date', 'check-in', 'checkin', 'check in') || '';
  const checkOutDate = getVal('check-out date', 'check-out', 'checkout', 'check out') || '';
  const eventDate = getVal('event date', 'tanggal event', 'eventdate') || '';
  const notes = getVal('keterangan / notes', 'keterangan', 'notes', 'catatan', 'pesan') || '';

  const priceStandardRoom = parseMoney(getVal('price standard room ($)', 'price standard room', 'standard room price', 'price standard'));
  const priceDeluxeRoom = parseMoney(getVal('price deluxe room ($)', 'price deluxe room', 'deluxe room price', 'price deluxe'));
  const pricePresidentialSuite = parseMoney(getVal('price presidential suite ($)', 'price presidential suite', 'presidential suite price', 'price presidential'));
  const pricePrivateVilla = parseMoney(getVal('price private villa ($)', 'price private villa', 'private villa price', 'price villa'));
  const priceMeetingRoom = parseMoney(getVal('price meeting room ($)', 'price meeting room', 'meeting room price', 'price meeting'));
  const priceEventHall = parseMoney(getVal('price event hall ($)', 'price event hall', 'event hall price', 'price event'));
  const priceCateringPerPax = parseMoney(getVal('price catering per pax ($)', 'price catering per pax', 'catering per pax price', 'price catering'));

  const itemRatesSnapshot = getVal('rates snapshot', 'item rates', 'rates', 'harga snapshot') || undefined;
  const discountCode = getVal('discount code', 'coupon code', 'kode diskon', 'kupon') || undefined;
  const discountPercent = parseNum(getVal('discount (%)', 'discount %', 'discount', 'diskon'));
  const subtotalBeforeTax = parseMoney(getVal('subtotal before tax ($)', 'subtotal before tax', 'subtotal'));
  const taxAmount = parseMoney(getVal('tax 10% ($)', 'tax 10%', 'tax', 'pajak'));
  const totalAmount = parseMoney(getVal('total invoice ($)', 'total invoice', 'total amount', 'total', 'invoice', 'harga'));
  const paymentStatusRaw = getVal('payment status', 'status payment', 'status', 'payment').toUpperCase();
  const paymentStatus: 'PAID' | 'UNPAID' = (paymentStatusRaw.includes('PAID') && !paymentStatusRaw.includes('UNPAID')) || paymentStatusRaw === 'CONFIRMED' || paymentStatusRaw === 'LUNAS' ? 'PAID' : 'UNPAID';

  let bookOption: 'room' | 'event' | 'both' | 'meeting' | 'room_meeting' = 'room';
  const optLower = bookOptionRaw.toLowerCase();
  const hasRooms = Boolean(standardRooms || deluxeRooms || presidentialSuites || privateVillas);
  const hasEvents = Boolean(eventAttendees || cateringPax);

  if (
    optLower.includes('both') ||
    optLower.includes('keduanya') ||
    optLower.includes('&') ||
    optLower.includes('+') ||
    optLower.includes('and') ||
    optLower.includes(',') ||
    (optLower.includes('room') && optLower.includes('event')) ||
    (optLower.includes('kamar') && optLower.includes('event')) ||
    (hasRooms && hasEvents)
  ) {
    bookOption = 'both';
  } else if (
    optLower.includes('room_meeting') ||
    (optLower.includes('room') && optLower.includes('meeting'))
  ) {
    bookOption = 'room_meeting';
  } else if (optLower.includes('event')) {
    bookOption = 'event';
  } else if (optLower.includes('meeting')) {
    bookOption = 'meeting';
  } else if (optLower.includes('room') || optLower.includes('kamar') || optLower.includes('stay')) {
    bookOption = 'room';
  }

  return {
    id: bookingId,
    bookingId,
    createdAt,
    propertySlug: createSlug(propertyName),
    propertyName,
    guestName,
    xUsername,
    guestEmail: `${guestName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
    bookOption,
    standardRooms: standardRooms || undefined,
    deluxeRooms: deluxeRooms || undefined,
    presidentialSuites: presidentialSuites || undefined,
    privateVillas: privateVillas || undefined,
    eventAttendees: eventAttendees || undefined,
    eventAddons,
    cateringPax: cateringPax || undefined,
    checkInDate,
    checkOutDate,
    eventDate,
    notes,
    priceStandardRoom: priceStandardRoom || undefined,
    priceDeluxeRoom: priceDeluxeRoom || undefined,
    pricePresidentialSuite: pricePresidentialSuite || undefined,
    pricePrivateVilla: pricePrivateVilla || undefined,
    priceMeetingRoom: priceMeetingRoom || undefined,
    priceEventHall: priceEventHall || undefined,
    priceCateringPerPax: priceCateringPerPax || undefined,
    itemRatesSnapshot,
    discountCode,
    discountPercent: discountPercent || undefined,
    subtotalBeforeTax: subtotalBeforeTax || undefined,
    taxAmount: taxAmount || undefined,
    totalAmount: totalAmount || 2500,
    paymentStatus,
    status: paymentStatus === 'PAID' ? 'Confirmed' : 'Pending'
  };
}

/**
 * Retrieves booking inquiries from Google Sheets 'Bookings' tab (gid=1881675892) or in-memory store.
 */
export async function getBookingsFromSource(): Promise<{
  bookings: BookingInquiry[];
  source: 'google_sheets' | 'mock_fallback';
  spreadsheetIdConfigured: boolean;
  message?: string;
}> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
  const configuredTab = process.env.GOOGLE_SHEETS_BOOKINGS_TAB || 'Bookings';
  
  const endpointsToTry = [
    { url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?gid=1881675892&tqx=out:json`, name: 'GID 1881675892 (Bookings)' },
    { url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?sheet=${encodeURIComponent(configuredTab)}&tqx=out:json`, name: `Sheet '${configuredTab}'` },
    { url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?sheet=Bookings&tqx=out:json`, name: "Sheet 'Bookings'" }
  ];

  for (const endpoint of endpointsToTry) {
    try {
      const res = await fetch(endpoint.url);
      if (!res.ok) continue;

      const text = await res.text();
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
      if (!jsonMatch) continue;

      const data = JSON.parse(jsonMatch[1]);
      const tableRows = data.table?.rows || [];
      if (!tableRows || tableRows.length === 0) continue;

      let headers: string[] = [];
      let dataSlice = tableRows;

      const colsHasLabels = data.table?.cols && data.table.cols.some((c: any) => c && c.label && String(c.label).trim() !== '');
      if (colsHasLabels) {
        headers = data.table.cols.map((c: any) => (c && c.label ? String(c.label).trim() : ''));
        dataSlice = tableRows;
      } else if (tableRows[0] && tableRows[0].c) {
        headers = tableRows[0].c.map((cell: any) => (cell && (cell.f || cell.v) ? String(cell.f || cell.v).trim() : ''));
        dataSlice = tableRows.slice(1);
      }

      if (headers.length === 0 || dataSlice.length === 0) continue;

      const sheetBookings: BookingInquiry[] = [];
      dataSlice.forEach((row: any, idx: number) => {
        const obj: Record<string, string> = {};
        headers.forEach((header, i) => {
          if (header && row.c && row.c[i]) {
            const cell = row.c[i];
            const val = cell.f !== undefined && cell.f !== null ? String(cell.f) : (cell.v !== undefined && cell.v !== null ? String(cell.v) : '');
            obj[header] = val;
          }
        });

        // Ensure row has at least guest name or booking ID
        if (Object.values(obj).some((v) => v.trim().length > 0)) {
          sheetBookings.push(transformSheetRowToBooking(obj, idx));
        }
      });

      if (sheetBookings.length > 0) {
        // Merge with in-memory mockBookingsStore
        const combined = [...sheetBookings];
        mockBookingsStore.forEach((mb) => {
          if (!combined.some((b) => (b.bookingId || b.id) === (mb.bookingId || mb.id))) {
            combined.unshift(mb);
          }
        });

        return {
          bookings: combined,
          source: 'google_sheets',
          spreadsheetIdConfigured: true,
          message: `Successfully loaded ${combined.length} booking request(s) from Google Sheets (${endpoint.name}).`
        };
      }
    } catch (err: any) {
      console.warn(`[GoogleSheetsService] Failed fetching bookings endpoint '${endpoint.name}':`, err?.message || err);
    }
  }

  return {
    bookings: mockBookingsStore,
    source: 'mock_fallback',
    spreadsheetIdConfigured: true,
    message: 'Could not fetch data directly from Google Sheets Bookings tab. Serving local bookings.'
  };
}

/**
 * Appends booking inquiry to Google Sheets or local store.
 */
export async function appendBookingInquiry(inquiry: BookingInquiry): Promise<{
  success: boolean;
  source: 'google_sheets' | 'mock_fallback';
  message: string;
  inquiry: BookingInquiry;
  error?: string;
}> {
  const finalBookingId = inquiry.bookingId || inquiry.id || `HNF-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const newInquiry: BookingInquiry = {
    ...inquiry,
    id: finalBookingId,
    bookingId: finalBookingId,
    createdAt: new Date().toISOString(),
    status: 'Pending'
  };

  mockBookingsStore.push(newInquiry);

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
  let rawTab = (process.env.GOOGLE_SHEETS_BOOKINGS_TAB || 'Bookings').trim();
  // If rawTab is purely digits (a GID like 1881675892), normalize it to the tab name 'Bookings'
  let bookingsTab = (/^\d+$/.test(rawTab) || !rawTab) ? 'Bookings' : rawTab;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  // Format book option string for readable Google Sheet row
  let bookOptionText = 'Room Only';
  if (inquiry.bookOption === 'event') bookOptionText = 'Event Location Only';
  if (inquiry.bookOption === 'both') bookOptionText = 'Both Room & Event Location';
  if (inquiry.bookOption === 'meeting') bookOptionText = 'Meeting Only';
  if (inquiry.bookOption === 'room_meeting') bookOptionText = 'Room & Meeting';

  // Format event add-ons string
  let eventAddonsText = 'N/A';
  if (inquiry.bookOption === 'event' || inquiry.bookOption === 'both' || inquiry.bookOption === 'meeting' || inquiry.bookOption === 'room_meeting') {
    if (inquiry.eventAddons === 'catering') eventAddonsText = 'With Catering';
    else if (inquiry.eventAddons === 'decoration') eventAddonsText = 'With Decoration';
    else if (inquiry.eventAddons === 'both') eventAddonsText = 'With Catering & Decoration';
    else if (inquiry.eventAddons === 'none') eventAddonsText = 'Venue / Room Only (No Catering/Decoration)';
  }

  // Price strings
  const priceStandardText = inquiry.priceStandardRoom ? `$${inquiry.priceStandardRoom}` : '$0';
  const priceDeluxeText = inquiry.priceDeluxeRoom ? `$${inquiry.priceDeluxeRoom}` : '$0';
  const pricePresidentialText = inquiry.pricePresidentialSuite ? `$${inquiry.pricePresidentialSuite}` : '$0';
  const priceVillaText = inquiry.pricePrivateVilla ? `$${inquiry.pricePrivateVilla}` : '$0';
  const priceMeetingText = inquiry.priceMeetingRoom ? `$${inquiry.priceMeetingRoom}` : '$0';
  const priceEventHallText = inquiry.priceEventHall ? `$${inquiry.priceEventHall}` : '$0';
  const priceCateringText = inquiry.priceCateringPerPax ? `$${inquiry.priceCateringPerPax}` : '$0';

  // Compute total rooms and formatted values
  const totalRooms = (inquiry.standardRooms || 0) + (inquiry.deluxeRooms || 0) + (inquiry.presidentialSuites || 0) + (inquiry.privateVillas || 0);
  const totalInvoiceText = inquiry.totalAmount ? `$${inquiry.totalAmount.toLocaleString()}` : '$0';
  const subtotalText = inquiry.subtotalBeforeTax ? `$${inquiry.subtotalBeforeTax.toLocaleString()}` : '$0';
  const taxText = inquiry.taxAmount ? `$${inquiry.taxAmount.toLocaleString()}` : '$0';
  const discountCodeText = inquiry.discountCode || 'N/A';
  const discountPercentText = inquiry.discountPercent ? `${inquiry.discountPercent}%` : '0%';
  const ratesSnapshotText = inquiry.itemRatesSnapshot || 'N/A';

  // Row values matching Google Sheet columns:
  // [Booking ID, Timestamp, Location, Name, X Username, Book Option, Standard Rooms, Deluxe Rooms, Presidential Suites, Private Villas, Total Rooms, Event Attendees (Pax), Event Add-ons, Catering Pax, Check-In Date, Check-Out Date, Event Date, Keterangan / Notes, Price Standard Room ($), Price Deluxe Room ($), Price Presidential Suite ($), Price Private Villa ($), Price Meeting Room ($), Price Event Hall ($), Price Catering Per Pax ($), Rates Snapshot, Discount Code, Discount (%), Subtotal Before Tax ($), Tax 10% ($), Total Invoice ($), Payment Status]
  const rowValues = [
    finalBookingId,
    newInquiry.createdAt,
    inquiry.propertyName || inquiry.propertySlug,
    inquiry.guestName,
    inquiry.xUsername || 'N/A',
    bookOptionText,
    inquiry.standardRooms ? `${inquiry.standardRooms}` : '0',
    inquiry.deluxeRooms ? `${inquiry.deluxeRooms}` : '0',
    inquiry.presidentialSuites ? `${inquiry.presidentialSuites}` : '0',
    inquiry.privateVillas ? `${inquiry.privateVillas}` : '0',
    totalRooms > 0 ? `${totalRooms} Room(s)` : (inquiry.roomsCount ? `${inquiry.roomsCount}` : '0'),
    inquiry.eventAttendees ? `${inquiry.eventAttendees} Pax` : 'N/A',
    eventAddonsText,
    inquiry.cateringPax ? `${inquiry.cateringPax} Pax` : 'N/A',
    inquiry.checkInDate || 'N/A',
    inquiry.checkOutDate || 'N/A',
    inquiry.eventDate || 'N/A',
    inquiry.notes || 'N/A',
    priceStandardText,
    priceDeluxeText,
    pricePresidentialText,
    priceVillaText,
    priceMeetingText,
    priceEventHallText,
    priceCateringText,
    ratesSnapshotText,
    discountCodeText,
    discountPercentText,
    subtotalText,
    taxText,
    totalInvoiceText,
    inquiry.paymentStatus || 'UNPAID'
  ];

  const errorsLogged: string[] = [];

  // Method 1: Google Service Account OAuth2 JWT to Google Sheets API v4
  if (serviceAccountEmail && serviceAccountPrivateKey) {
    try {
      const accessToken = await getGoogleSheetsAccessToken(serviceAccountEmail, serviceAccountPrivateKey);
      let targetTab = bookingsTab;
      let appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(targetTab)}:append?valueInputOption=USER_ENTERED`;

      let res = await fetch(appendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          values: [rowValues]
        })
      });

      let json = await res.json().catch(() => ({}));

      // Retry with 'Bookings' if initial tab name was unparseable or failed
      if (!res.ok && targetTab !== 'Bookings') {
        console.warn(`[GoogleSheetsService] Range ${targetTab} failed, retrying with fallback tab 'Bookings'...`);
        targetTab = 'Bookings';
        appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(targetTab)}:append?valueInputOption=USER_ENTERED`;
        res = await fetch(appendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            values: [rowValues]
          })
        });
        json = await res.json().catch(() => ({}));
      }

      if (res.ok) {
        return {
          success: true,
          source: 'google_sheets',
          message: 'Booking data successfully saved to Google Sheet.',
          inquiry: newInquiry
        };
      } else {
        const msg = json?.error?.message || json?.error || `HTTP ${res.status}`;
        console.warn(`[GoogleSheetsService] Sheets API append notice (${res.status}): ${msg}. Ensure your Google Sheet is shared with Editor access to '${serviceAccountEmail}'.`);
        errorsLogged.push(`Google Sheets API (${res.status}): ${msg}`);
      }
    } catch (err: any) {
      console.warn('[GoogleSheetsService] Service account auth/append notice:', err?.message);
      errorsLogged.push(`Service Account Error: ${err?.message || String(err)}`);
    }
  }

  // Method 2: Webhook URL fallback
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId,
          tabName: bookingsTab,
          rowValues,
          booking: newInquiry
        })
      });

      const text = await res.text().catch(() => '');
      if (res.ok && !text.includes('You need access') && !text.includes('<!DOCTYPE html>')) {
        return {
          success: true,
          source: 'google_sheets',
          message: 'Booking data successfully sent to Google Sheet via Webhook.',
          inquiry: newInquiry
        };
      } else {
        errorsLogged.push('Webhook Endpoint Error: Received permission/access denied or unhandled HTML response.');
      }
    } catch (err: any) {
      console.warn('[GoogleSheetsService] Webhook append error:', err?.message);
      errorsLogged.push(`Webhook Error: ${err?.message || String(err)}`);
    }
  }

  // Fallback: Booking is saved in local memory store and client storage
  const combinedError = errorsLogged.length > 0
    ? errorsLogged.join(' | ')
    : 'Google Service Account credentials or GOOGLE_SHEETS_WEBHOOK_URL are not configured or lack write access.';

  return {
    success: true,
    source: 'mock_fallback',
    message: 'Booking successfully registered in Hanford Central Reservations. (Note: To enable live Google Sheet sync, grant Editor access to ' + (serviceAccountEmail || 'your service account email') + ').',
    error: combinedError,
    inquiry: newInquiry
  };
}
