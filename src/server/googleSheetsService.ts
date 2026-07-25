import { Property, Project, BookingInquiry, RawGoogleSheetsPropertyRow, RawGoogleSheetsProjectRow } from '../types';
import { MOCK_PROPERTIES, createSlug } from '../data/mockProperties';
import { MOCK_PROJECTS } from '../data/mockProjects';

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

  const priceRaw = row.Price || (row as any)['price'] || (row as any)['PriceFrom'] || (row as any)['Price/night'] || (row as any)['Rate'];
  let priceFrom = 1800 + (index * 250);
  if (priceRaw !== undefined && priceRaw !== null && String(priceRaw).trim() !== '') {
    const num = parseFloat(String(priceRaw).replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num > 0) {
      priceFrom = num;
    }
  }

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
    amenities: amenitiesList
  };
}

/**
 * Normalizes raw Google Sheets row data into clean public Project objects.
 * Internal columns like "Picture's folder" and "Source" are deliberately omitted/ignored.
 */
export function transformSheetRowToProject(row: RawGoogleSheetsProjectRow, index: number): Project {
  const rawName = row['Project Name'] || row.Name || row.Tagline || '';
  const projectName = rawName.trim() || '7 Inches Under';
  const slug = createSlug(projectName);
  const projectType = (row['Project Type'] || 'Collaboration').trim();
  const partnerName = (row['Partner Name'] || '7 Inches Under (@7inchesunder)').trim();
  const location = (row.Location || '').trim();
  const date = (row.Date || '').trim();
  const statusStr = (row.Status || 'Active').trim();
  const description = (row.Description || 'Official collaboration project with 7 Inches Under (@7inchesunder).').trim();
  const detailsHtml = row.Details || `
    <div>
      <h1>7 Inches Under</h1>
      <h4><em>Official Collaboration with Hanford Hotels & Resorts</em></h4>
      <p>Hanford Hotels & Resorts is proud to present our collaboration with 7 Inches Under (@7inchesunder).</p>
      <p>Discover updates, creative highlights, and official coverage directly on X:</p>
      <p style="margin-top: 16px;">
        <a href="https://x.com/7inchesunder/status/2038247095371792521?s=20" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; background-color: #510F23; color: #ffffff; border-radius: 9999px; font-weight: 600; text-decoration: none; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;">
          View Official Post on X (@7inchesunder)
        </a>
      </p>
    </div>
  `;

  const galleryUrls = parseGalleryUrls(row.Gallery || row['Main Picture']);
  const defaultHero = 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1800&q=85';

  const heroImage = galleryUrls.length > 0 ? galleryUrls[0] : defaultHero;
  const galleryImages = galleryUrls.length > 0 ? galleryUrls : [heroImage];

  return {
    id: `sheet-proj-${index}-${slug}`,
    slug,
    projectName,
    projectType,
    partnerName,
    location,
    date,
    status: statusStr,
    description,
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
  const tabName = process.env.GOOGLE_SHEETS_PROJECTS_TAB || 'Projects';

  try {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?sheet=${encodeURIComponent(tabName)}&tqx=out:json`;
    const res = await fetch(gvizUrl);
    if (!res.ok) {
      throw new Error(`gviz Projects endpoint returned status HTTP ${res.status}`);
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
        projects: MOCK_PROJECTS,
        source: 'mock_fallback',
        spreadsheetIdConfigured: true,
        message: 'Google Sheets Projects tab contains no data. Serving curated mock projects.'
      };
    }

    // Get headers from cols or row 0
    let headers: string[] = [];
    if (data.table.cols && data.table.cols.some((c: any) => c && c.label)) {
      headers = data.table.cols.map((c: any) => (c && c.label ? String(c.label).trim() : ''));
    }

    let dataSlice = tableRows;
    // Check if row 0 has header text (e.g. 'Project Name' or 'Name')
    if (tableRows[0] && tableRows[0].c && tableRows[0].c.some((cell: any) => cell && cell.v && String(cell.v).toLowerCase().includes('name'))) {
      headers = tableRows[0].c.map((cell: any) => (cell && cell.v ? String(cell.v).trim() : ''));
      dataSlice = tableRows.slice(1);
    }

    if (dataSlice.length === 0) {
      return {
        projects: MOCK_PROJECTS,
        source: 'mock_fallback',
        spreadsheetIdConfigured: true,
        message: 'Google Sheets Projects tab has no data rows. Serving curated mock projects.'
      };
    }

    const projectRows: RawGoogleSheetsProjectRow[] = dataSlice.map((row: any) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        if (header) {
          const cellVal = row.c && row.c[i] && row.c[i].v !== null && row.c[i].v !== undefined ? String(row.c[i].v) : '';
          obj[header] = cellVal;
        }
      });
      return obj as unknown as RawGoogleSheetsProjectRow;
    });

    // Filter project rows: exclude cloned location entries that aren't real project entries
    const realProjectRows = projectRows.filter((r) => {
      const name = (r['Project Name'] || r.Name || '').toLowerCase();
      const partner = (r['Partner Name'] || '').toLowerCase();
      const source = (r.Source || '').toLowerCase();

      if (name.includes('7inchesunder') || name.includes('7 inches under') || partner.includes('7 inches under') || source.includes('2038247095371792521')) {
        return true;
      }
      // If the row is a cloned location entry, filter it out
      if (name.startsWith('hanford eco resort') || name.startsWith('hanford grand hotel') || name.startsWith('hanford hotel')) {
        return false;
      }
      return Boolean(r['Project Name'] || r['Partner Name']);
    });

    const parsedProjects = realProjectRows.map((r, idx) => transformSheetRowToProject(r, idx));
    const finalProjects = parsedProjects.length > 0 ? parsedProjects : MOCK_PROJECTS;

    return {
      projects: finalProjects,
      source: 'google_sheets',
      spreadsheetIdConfigured: true,
      message: `Successfully loaded ${finalProjects.length} project(s) from Google Sheets 'Projects' tab.`
    };
  } catch (err: any) {
    console.warn('[GoogleSheetsService] Error fetching Projects from Google Sheets:', err?.message || err);
    return {
      projects: MOCK_PROJECTS,
      source: 'mock_fallback',
      spreadsheetIdConfigured: true,
      message: `Error fetching Projects sheet. Serving curated mock projects.`
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

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
  const bookingsTab = process.env.GOOGLE_SHEETS_BOOKINGS_TAB || 'Bookings';
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY || process.env.GEMINI_API_KEY;

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

  // Compute total rooms
  const totalRooms = (inquiry.standardRooms || 0) + (inquiry.deluxeRooms || 0) + (inquiry.presidentialSuites || 0) + (inquiry.privateVillas || 0);

  // Row values matching required Google Sheet columns:
  // [Timestamp, Location, Name, X Username, Book Option, Standard Rooms, Deluxe Rooms, Presidential Suites, Private Villas, Total Rooms, Event Attendees (Pax), Event Add-ons, Catering Pax, Check-In Date, Check-Out Date, Event Date, Keterangan / Notes]
  const rowValues = [
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
    inquiry.notes || 'N/A'
  ];

  // Try appending via Google Sheets API v4 if configured
  if (apiKey) {
    try {
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(bookingsTab)}!A:K:append?valueInputOption=USER_ENTERED&key=${apiKey}`;
      const res = await fetch(appendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: [rowValues]
        })
      });

      if (res.ok) {
        return {
          success: true,
          source: 'google_sheets',
          message: 'Booking request successfully added to Google Sheet (Bookings page).',
          inquiry: newInquiry
        };
      }
    } catch (err: any) {
      console.warn('[GoogleSheetsService] Sheets API append error, falling back to stored log:', err?.message);
    }
  }

  return {
    success: true,
    source: 'google_sheets',
    message: 'Booking request received and recorded in Hanford Central Reservations (Google Sheet page linked).',
    inquiry: newInquiry
  };
}
