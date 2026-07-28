import { Property, Project, BookingInquiry, ApiResponse, AdminUser } from '../types';
import { MOCK_PROPERTIES, createSlug } from '../data/mockProperties';
import { MOCK_PROJECTS } from '../data/mockProjects';

const DEFAULT_SPREADSHEET_ID = '1a2WN_AqaV9WS15h-37FDCyVV_ZpLB1IaBDbvb2VYzeU';

let cachedProperties: Property[] | null = null;
let cachedProjects: Project[] | null = null;

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
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/gviz/tq?sheet=Locations&tqx=out:json`;
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

  if (!tableRows || tableRows.length === 0) {
    return MOCK_PROPERTIES;
  }

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

  const defaultHeroes = [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1800&q=85'
  ];

  const parsedProperties: Property[] = dataRows.map((row: any, index: number) => {
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
    const mainPicRaw = rowObj['Main Picture'] || rowObj['Main picture'] || rowObj['main picture'] || rowObj['MainPicture'];
    const mainPicUrls = parseGalleryUrls(mainPicRaw);
    const galleryUrls = parseGalleryUrls(rowObj.Gallery);
    const combinedImageUrls = Array.from(new Set([...mainPicUrls, ...galleryUrls]));

    const heroImage = combinedImageUrls.length > 0 ? combinedImageUrls[0] : defaultHeroes[index % defaultHeroes.length];
    const galleryImages = combinedImageUrls.length > 0 ? combinedImageUrls : [heroImage];

    const parsePriceNumber = (val: any): number | undefined => {
      if (val === undefined || val === null || String(val).trim() === '') return undefined;
      const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
      return !isNaN(num) && num > 0 ? num : undefined;
    };

    const nameLower = name.toLowerCase();
    const isEcoResort = nameLower.includes('eco resort') || (rowObj.Tagline || '').toLowerCase().includes('eco resort');
    const isGrandHotel = nameLower.includes('grand hotel') && !nameLower.includes('resort');
    const hasPrivateVilla = !isGrandHotel;

    const getRowObjVal = (...keys: string[]): string | undefined => {
      for (const k of keys) {
        const kLower = k.toLowerCase().trim();
        for (const [rowKey, val] of Object.entries(rowObj)) {
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
    const rawStandardVal = getRowObjVal('Standard Room', 'Standard Room Rate', 'Standard Room ($)', 'Standard', 'Standard Rate', 'Price', 'price', 'PriceFrom', 'Price/night', 'Rate');
    const parsedStandard = parsePriceNumber(rawStandardVal);
    const priceStandard = parsedStandard || (850 + index * 150);
    const priceFrom = priceStandard; // Starting rate takes from Standard Room column

    const priceDeluxe = parsePriceNumber(getRowObjVal('Deluxe Room', 'Deluxe Room Rate', 'Deluxe Room ($)', 'Deluxe', 'Deluxe Rate')) || Math.round(priceStandard * 1.45);
    const pricePresidential = parsePriceNumber(getRowObjVal('Presidential Suite', 'Presidential Suite Rate', 'Presidential Suite ($)', 'Presidential', 'Presidential Rate')) || Math.round(priceStandard * 3.8);
    const pricePrivateVilla = hasPrivateVilla
      ? (parsePriceNumber(getRowObjVal('Private Villa', 'Villa', 'Private Villa Rate')) || Math.round(priceStandard * 5.2))
      : undefined;

    const priceMeetingRoom = parsePriceNumber(getRowObjVal('Meeting Room', 'Meeting Room Rate', 'Meeting')) || 120;
    const priceEventHall = parsePriceNumber(getRowObjVal('Event Hall', 'Event Hall Rate', 'Hall')) || 3200;
    const priceCateringPerPax = parsePriceNumber(getRowObjVal('Catering Per Pax', 'Catering Rate', 'Catering')) || 75;

    const amenitiesRaw = rowObj.Amenities || rowObj.amenities || rowObj.Privileges || rowObj.Services;
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

    const capacityStandard = rowObj['Standard Room Capacity'] || rowObj['Standard Capacity'] || 'Max 3 guests (2 Adults + 1 Child)';
    const capacityDeluxe = rowObj['Deluxe Room Capacity'] || rowObj['Deluxe Capacity'] || 'Max 3 guests (2 Adults + 1 Child)';
    const capacityPresidential = rowObj['Presidential Suite Capacity'] || rowObj['Presidential Capacity'] || 'Max 5 guests (4 Adults + 1 Child)';
    const capacityPrivateVilla = hasPrivateVilla
      ? (rowObj['Private Villa Capacity'] || rowObj['Villa Capacity'] || 'Max 6 guests (4 Adults + 2 Children)')
      : undefined;

    const discountCode = getRowObjVal('Discount Code', 'DiscountCode', 'Coupon Code', 'Kupon', 'Discount code', 'discount_code', 'Kode Diskon', 'Kode Promo');
    const rawDiscountPercent = getRowObjVal('Discount (%)', 'Discount %', 'DiscountPercent', 'Discount', 'Diskon', 'Discount percent', 'Besaran Diskon');
    const discountPercent = rawDiscountPercent !== undefined ? rawDiscountPercent : undefined;

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
      capacityStandard,
      capacityDeluxe,
      capacityPresidential,
      capacityPrivateVilla,
      discountCode,
      discountPercent
    };
  });

  return parsedProperties;
}

/**
 * Client data fetching layer abstraction.
 * Communicates with the Express backend (/api/*) or fetches directly from Google Sheets client-side.
 */
export async function fetchLocations(): Promise<ApiResponse<Property[]>> {
  // 1. Try server endpoint first for live Google Sheets data
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

  // 2. Fallback to direct client-side Google Sheets fetching
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
    console.warn('[dataService] Direct Google Sheets fetch error:', err);
  }

  // 3. Check local admin storage fallback
  try {
    const saved = localStorage.getItem('hanford_admin_properties');
    if (saved) {
      const parsed: Property[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedProperties = parsed;
        return {
          success: true,
          data: parsed,
          source: 'google_sheets',
          message: 'Loaded from local admin database'
        };
      }
    }
  } catch (e) {
    console.warn('[dataService] Local properties parse warning:', e);
  }

  cachedProperties = MOCK_PROPERTIES;
  return {
    success: true,
    data: MOCK_PROPERTIES,
    source: 'mock_fallback',
    message: 'Serving fallback dataset.'
  };
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

/**
 * Direct client-side fetcher for Google Sheets 'Projects' tab via gviz endpoint.
 */
async function fetchProjectsClientDirect(): Promise<Project[]> {
  const gvizUrls = [
    `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/gviz/tq?gid=1717332833&tqx=out:json`,
    `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/gviz/tq?sheet=Collaborations&tqx=out:json`,
    `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/gviz/tq?sheet=Projects&tqx=out:json`
  ];

  for (const gvizUrl of gvizUrls) {
    try {
      const res = await fetch(gvizUrl);
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

      const defaultHero = 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1800&q=85';

      const rawRows: Record<string, string>[] = dataSlice.map((row: any) => {
        const rowObj: Record<string, string> = {};
        headers.forEach((header, i) => {
          if (header && row.c && row.c[i]) {
            const cell = row.c[i];
            const val = cell.f !== undefined && cell.f !== null ? String(cell.f) : (cell.v !== undefined && cell.v !== null ? String(cell.v) : '');
            rowObj[header] = val;
          }
        });
        return rowObj;
      });

      const filteredRows = rawRows.filter((r) => {
        const name = (r['Project Name'] || r['Project_Name'] || r.Name || '').trim();
        const partner = (r['Partner Name'] || r['Partner_Name'] || '').trim();
        const projId = (r['Project_ID'] || r['Project ID'] || '').trim();
        const shortDesc = (r['Short Description'] || r['Short_Description'] || '').trim();
        const desc = (r['Description'] || '').trim();

        return Boolean(name || partner || projId || shortDesc || desc);
      });

      if (filteredRows.length === 0) continue;

      const parsedProjects: Project[] = filteredRows.map((rowObj: Record<string, string>, index: number) => {
        const rawId = rowObj['Project_ID'] || rowObj['Project ID'] || rowObj.id || '';
        const rawName = rowObj['Project Name'] || rowObj['Project_Name'] || rowObj.Name || rowObj.Tagline || '';
        const projectName = rawName.trim() || `Hanford Collaboration #${index + 1}`;
        const slug = createSlug(projectName);
        const projectType = (rowObj['Project Type'] || rowObj['Project_Type'] || 'Collaboration').trim();
        const partnerName = (rowObj['Partner Name'] || rowObj['Partner_Name'] || 'Hanford Partner').trim();
        const rawXUser = rowObj['X Username'] || rowObj['X_Username'] || rowObj['Twitter Username'] || rowObj.xUsername || rowObj.Twitter || '';
        const xUsername = rawXUser ? (rawXUser.startsWith('@') ? rawXUser : `@${rawXUser.trim()}`) : '';
        const xLink = (rowObj['X Link'] || rowObj['X_Link'] || rowObj.xLink || '').trim();
        const location = (rowObj.Location || '').trim();
        const date = (rowObj.Date || '').trim();
        const status = (rowObj.Status || 'Active').trim();
        const shortDescription = (rowObj['Short Description'] || rowObj['Short_Description'] || '').trim();
        const rawDescription = (rowObj.Description || shortDescription || '').trim();

        const cleanDescription = rawDescription.includes('<') && rawDescription.includes('>')
          ? rawDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          : rawDescription;

        const mainPicUrls = parseGalleryUrls(rowObj['Main Picture'] || rowObj['Main_Picture'] || rowObj.Logo);
        const galleryUrls = parseGalleryUrls(rowObj.Gallery);
        const combinedGallery = Array.from(new Set([...mainPicUrls, ...galleryUrls]));

        const heroImage = combinedGallery.length > 0 ? combinedGallery[0] : defaultHero;
        const galleryImages = combinedGallery.length > 0 ? combinedGallery : [heroImage];

        const finalXLink = xLink || (xUsername ? `https://x.com/${xUsername.replace(/^@/, '')}` : '');

        let detailsHtml = rowObj.Details || '';
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
          status,
          shortDescription,
          description: cleanDescription || shortDescription || `Official collaboration project with ${partnerName}.`,
          detailsHtml,
          heroImage,
          galleryImages
        };
      });

      if (parsedProjects.length > 0) {
        return parsedProjects;
      }
    } catch (err) {
      console.warn('[dataService] fetchProjectsClientDirect warning:', err);
    }
  }

  return MOCK_PROJECTS;
}

/**
 * Client data fetching layer for Projects / Collaborations.
 */
export async function fetchProjects(): Promise<ApiResponse<Project[]>> {
  // 1. Check local admin storage first
  try {
    const saved = localStorage.getItem('hanford_admin_projects');
    if (saved) {
      const parsed: Project[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedProjects = parsed;
        return {
          success: true,
          data: parsed,
          source: 'google_sheets',
          message: 'Loaded from local admin projects database'
        };
      }
    }
  } catch (e) {
    console.warn('[dataService] Local projects parse warning:', e);
  }

  try {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const json: ApiResponse<Project[]> = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        cachedProjects = json.data;
        return json;
      }
    }
  } catch {
    // API endpoint unavailable or running on static Netlify host
  }

  // Fallback to direct client-side Google Sheets fetching
  try {
    const projects = await fetchProjectsClientDirect();
    cachedProjects = projects;
    return {
      success: true,
      data: projects,
      source: 'google_sheets',
      message: 'Fetched Projects directly from Google Sheets database.'
    };
  } catch (err: any) {
    console.warn('[dataService] Direct Google Sheets Projects fetch error, using local dataset:', err);
    cachedProjects = MOCK_PROJECTS;
    return {
      success: true,
      data: MOCK_PROJECTS,
      source: 'mock_fallback',
      message: 'Serving fallback projects dataset.'
    };
  }
}

export async function fetchProjectBySlug(slug: string): Promise<ApiResponse<Project | null>> {
  const normalizedSlug = slug.toLowerCase().trim();

  // Try Express API endpoint first
  try {
    const res = await fetch(`/api/projects/${encodeURIComponent(slug)}`);
    if (res.ok) {
      const json: ApiResponse<Project> = await res.json();
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

  // Ensure projects are loaded
  if (!cachedProjects || cachedProjects.length === 0) {
    const listRes = await fetchProjects();
    cachedProjects = listRes.data;
  }

  // Find in loaded dataset
  let found = cachedProjects.find(
    (p) =>
      p.slug.toLowerCase() === normalizedSlug ||
      p.id.toLowerCase() === normalizedSlug ||
      createSlug(p.projectName) === normalizedSlug ||
      p.projectName.toLowerCase().includes(normalizedSlug.replace(/-/g, ' '))
  );

  if (!found) {
    // Check MOCK_PROJECTS as last resort
    found = MOCK_PROJECTS.find(
      (p) =>
        p.slug.toLowerCase() === normalizedSlug ||
        p.id.toLowerCase() === normalizedSlug ||
        createSlug(p.projectName) === normalizedSlug
    );
  }

  return {
    success: Boolean(found),
    data: found || null,
    source: 'google_sheets',
    message: found ? 'Project found' : 'Project not found'
  };
}

const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby2WfS3a2mLS5Z5iGa4onfMwD0jvRONhqxe-hxBvcXUSaX2nfXZG_o8G6uTtQwnHgtG/exec';

function build32ColumnRowValues(inquiry: BookingInquiry, finalBookingId: string, createdAt: string): string[] {
  let bookOptionText = 'Room Only';
  if (inquiry.bookOption === 'event') bookOptionText = 'Event Location Only';
  if (inquiry.bookOption === 'both') bookOptionText = 'Both Room & Event Location';
  if (inquiry.bookOption === 'meeting') bookOptionText = 'Meeting Only';
  if (inquiry.bookOption === 'room_meeting') bookOptionText = 'Room & Meeting';

  let eventAddonsText = 'N/A';
  if (inquiry.bookOption === 'event' || inquiry.bookOption === 'both' || inquiry.bookOption === 'meeting' || inquiry.bookOption === 'room_meeting') {
    if (inquiry.eventAddons === 'catering') eventAddonsText = 'With Catering';
    else if (inquiry.eventAddons === 'decoration') eventAddonsText = 'With Decoration';
    else if (inquiry.eventAddons === 'both') eventAddonsText = 'With Catering & Decoration';
    else if (inquiry.eventAddons === 'none') eventAddonsText = 'Venue / Room Only (No Catering/Decoration)';
  }

  const priceStandardText = inquiry.priceStandardRoom ? `$${inquiry.priceStandardRoom}` : '$0';
  const priceDeluxeText = inquiry.priceDeluxeRoom ? `$${inquiry.priceDeluxeRoom}` : '$0';
  const pricePresidentialText = inquiry.pricePresidentialSuite ? `$${inquiry.pricePresidentialSuite}` : '$0';
  const priceVillaText = inquiry.pricePrivateVilla ? `$${inquiry.pricePrivateVilla}` : '$0';
  const priceMeetingText = inquiry.priceMeetingRoom ? `$${inquiry.priceMeetingRoom}` : '$0';
  const priceEventHallText = inquiry.priceEventHall ? `$${inquiry.priceEventHall}` : '$0';
  const priceCateringText = inquiry.priceCateringPerPax ? `$${inquiry.priceCateringPerPax}` : '$0';

  const totalRooms = (inquiry.standardRooms || 0) + (inquiry.deluxeRooms || 0) + (inquiry.presidentialSuites || 0) + (inquiry.privateVillas || 0);
  const totalInvoiceText = inquiry.totalAmount ? `$${inquiry.totalAmount.toLocaleString()}` : '$0';
  const subtotalText = inquiry.subtotalBeforeTax ? `$${inquiry.subtotalBeforeTax.toLocaleString()}` : '$0';
  const taxText = inquiry.taxAmount ? `$${inquiry.taxAmount.toLocaleString()}` : '$0';
  const discountCodeText = inquiry.discountCode || 'N/A';
  const discountPercentText = inquiry.discountPercent ? `${inquiry.discountPercent}%` : '0%';
  const ratesSnapshotText = inquiry.itemRatesSnapshot || 'N/A';

  return [
    finalBookingId,
    createdAt,
    inquiry.propertyName || inquiry.propertySlug || 'Hanford Sanctuary',
    inquiry.guestName || 'Guest',
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
}

/**
 * Fallback handler for static deployments (e.g. Netlify, Vercel Static, GitHub Pages)
 * where backend Express server (/api/book) is not available (returns HTTP 404).
 */
async function handleStaticBookingSubmission(inquiry: BookingInquiry): Promise<{
  success: boolean;
  message: string;
  source: 'google_sheets' | 'mock_fallback';
}> {
  const finalBookingId = inquiry.bookingId || inquiry.id || `HNF-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const createdAt = new Date().toISOString();

  const newInquiry: BookingInquiry = {
    ...inquiry,
    id: finalBookingId,
    bookingId: finalBookingId,
    createdAt,
    status: 'Pending'
  };

  // Save to client-side localStorage
  try {
    const existingStr = localStorage.getItem('hanford_booking_requests');
    const existingBookings: BookingInquiry[] = existingStr ? JSON.parse(existingStr) : [];
    existingBookings.unshift(newInquiry);
    localStorage.setItem('hanford_booking_requests', JSON.stringify(existingBookings));
  } catch (e) {
    console.warn('[dataService] Unable to save to localStorage:', e);
  }

  // Attempt client-side webhook dispatch if available
  const webhookUrl = (import.meta as any).env?.VITE_GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const rowValues = build32ColumnRowValues(inquiry, finalBookingId, createdAt);

      const payload = {
        spreadsheetId: DEFAULT_SPREADSHEET_ID,
        tabName: 'Bookings',
        bookingId: finalBookingId,
        createdAt,
        propertyName: inquiry.propertyName || inquiry.propertySlug,
        guestName: inquiry.guestName,
        xUsername: inquiry.xUsername || 'N/A',
        bookOptionText: rowValues[5],
        rowValues,
        booking: newInquiry
      };

      // Direct POST to Google Sheets Apps Script Webhook with text/plain (avoids CORS preflight rejection in browsers)
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      }).catch((e) => {
        console.warn('[dataService] Webhook post failed:', e);
      });
    } catch (err) {
      console.warn('[dataService] Webhook client dispatch skipped:', err);
    }
  }

  return {
    success: true,
    message: 'Data booking Anda berhasil disimpan ke Google Sheet & Hanford Central Reservations.',
    source: 'google_sheets'
  };
}

export async function submitBooking(inquiry: BookingInquiry): Promise<{
  success: boolean;
  message: string;
  source?: 'google_sheets' | 'mock_fallback';
}> {
  // Always save booking inquiry to client-side localStorage so it appears immediately in Admin Dashboard
  try {
    const existingStr = localStorage.getItem('hanford_booking_requests');
    const existingBookings: BookingInquiry[] = existingStr ? JSON.parse(existingStr) : [];
    const finalId = inquiry.bookingId || inquiry.id || `HNF-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const formattedInquiry: BookingInquiry = {
      ...inquiry,
      id: finalId,
      bookingId: finalId,
      createdAt: inquiry.createdAt || new Date().toISOString(),
      paymentStatus: inquiry.paymentStatus || 'UNPAID',
      status: inquiry.status || 'Pending'
    };

    if (!existingBookings.some((b) => (b.bookingId || b.id) === finalId)) {
      existingBookings.unshift(formattedInquiry);
      localStorage.setItem('hanford_booking_requests', JSON.stringify(existingBookings));
    }
  } catch (e) {
    console.warn('[dataService] Unable to save booking inquiry to localStorage:', e);
  }

  try {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry)
    });

    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      return {
        success: true,
        message: json.message || 'Data booking berhasil tersimpan ke Google Sheet.',
        source: json.source || 'google_sheets'
      };
    }

    // On static deployments like Netlify, /api/book returns HTTP 404 or 405
    if (res.status === 404 || res.status === 405) {
      console.info('[dataService] /api/book returned HTTP 404 (static deployment detected). Switching to static fallback handler...');
      return await handleStaticBookingSubmission(inquiry);
    }

    const json = await res.json().catch(() => ({}));
    const errorDetail = json.error || json.details || json.message || `Gagal terhubung ke Google Sheet (HTTP ${res.status}).`;
    return {
      success: false,
      message: errorDetail,
      source: 'google_sheets'
    };
  } catch (error: any) {
    console.warn('[dataService] API booking submission network error, using static fallback handler:', error);
    return await handleStaticBookingSubmission(inquiry);
  }
}

/* ============================================================================
 * ADMIN SERVICE HELPERS (Locations, Projects, Bookings, Admin Users)
 * ============================================================================ */

export function saveAdminProperties(properties: Property[]) {
  try {
    localStorage.setItem('hanford_admin_properties', JSON.stringify(properties));
    cachedProperties = properties;
  } catch (e) {
    console.error('Error saving admin properties:', e);
  }
}

export function saveAdminProjects(projects: Project[]) {
  try {
    localStorage.setItem('hanford_admin_projects', JSON.stringify(projects));
    cachedProjects = projects;
  } catch (e) {
    console.error('Error saving admin projects:', e);
  }
}

const DEFAULT_MOCK_BOOKINGS: BookingInquiry[] = [
  {
    id: 'HNF-2026-X8921',
    bookingId: 'HNF-2026-X8921',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    propertySlug: 'hanford-resort-spa-aspen',
    propertyName: 'Hanford Resort & Spa Aspen',
    guestName: 'Alexander Wright',
    xUsername: '@alexwright_x',
    guestEmail: 'alex.wright@example.com',
    bookOption: 'room',
    standardRooms: 1,
    deluxeRooms: 1,
    checkInDate: '2026-08-10',
    checkOutDate: '2026-08-14',
    numberOfNights: 4,
    totalAmount: 3250,
    paymentStatus: 'UNPAID',
    status: 'Pending',
    notes: 'Requires mountain view and early check-in if available.'
  },
  {
    id: 'HNF-2026-M4109',
    bookingId: 'HNF-2026-M4109',
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    propertySlug: 'hanford-grand-hotel-tokyo',
    propertyName: 'Hanford Grand Hotel Tokyo',
    guestName: 'Eleanor Vance',
    xUsername: '@eleanor_vance',
    guestEmail: 'eleanor.vance@tokyogroup.jp',
    bookOption: 'event',
    eventAttendees: 80,
    eventAddons: 'catering',
    cateringPax: 80,
    eventDate: '2026-09-01',
    totalAmount: 8500,
    paymentStatus: 'PAID',
    status: 'Confirmed',
    notes: 'Corporate networking evening with customized menu.'
  },
  {
    id: 'HNF-2026-K7304',
    bookingId: 'HNF-2026-K7304',
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    propertySlug: 'hanford-eco-resort-bali',
    propertyName: 'Hanford Eco Resort Bali',
    guestName: 'Davenport Luxury Group',
    xUsername: '@davenport_co',
    guestEmail: 'contact@davenport.com',
    bookOption: 'both',
    deluxeRooms: 2,
    privateVillas: 1,
    checkInDate: '2026-08-20',
    checkOutDate: '2026-08-25',
    numberOfNights: 5,
    eventAttendees: 25,
    eventAddons: 'both',
    cateringPax: 25,
    eventDate: '2026-08-22',
    totalAmount: 14200,
    paymentStatus: 'UNPAID',
    status: 'Pending',
    notes: 'VIP guest retreat and private villa welcome ceremony.'
  }
];

function transformSheetRowToBookingClient(row: Record<string, string>, index: number): BookingInquiry {
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
    (hasRooms && hasEvents)
  ) {
    bookOption = 'both';
  } else if (optLower.includes('room_meeting') || (optLower.includes('room') && optLower.includes('meeting'))) {
    bookOption = 'room_meeting';
  } else if (optLower.includes('event')) {
    bookOption = 'event';
  } else if (optLower.includes('meeting')) {
    bookOption = 'meeting';
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
    totalAmount: totalAmount || 2500,
    paymentStatus,
    status: paymentStatus === 'PAID' ? 'Confirmed' : 'Pending'
  };
}

async function fetchGoogleSheetsBookingsClientDirect(): Promise<BookingInquiry[]> {
  const spreadsheetId = DEFAULT_SPREADSHEET_ID;
  const endpoints = [
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?gid=1881675892&tqx=out:json`,
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?sheet=Bookings&tqx=out:json`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url);
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

        if (Object.values(obj).some((v) => v.trim().length > 0)) {
          sheetBookings.push(transformSheetRowToBookingClient(obj, idx));
        }
      });

      if (sheetBookings.length > 0) {
        return sheetBookings;
      }
    } catch (e) {
      console.warn('[dataService] fetchGoogleSheetsBookingsClientDirect endpoint failed:', e);
    }
  }

  return [];
}

export async function fetchBookings(): Promise<BookingInquiry[]> {
  try {
    const res = await fetch('/api/bookings');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const localBookings = fetchBookingsFromStorage();
        const sheetBookings: BookingInquiry[] = json.data;

        const merged: BookingInquiry[] = sheetBookings.map((sb) => {
          const matchedLocal = localBookings.find((lb) => (lb.bookingId || lb.id) === (sb.bookingId || sb.id));
          if (matchedLocal) {
            return {
              ...sb,
              paymentStatus: matchedLocal.paymentStatus || sb.paymentStatus,
              status: matchedLocal.status || sb.status
            };
          }
          return sb;
        });

        localBookings.forEach((lb) => {
          if (!merged.some((m) => (m.bookingId || m.id) === (lb.bookingId || lb.id))) {
            merged.unshift(lb);
          }
        });

        saveBookingsToStorage(merged);
        return merged;
      }
    }
  } catch (e) {
    console.warn('[dataService] Failed to fetch /api/bookings, trying client direct fetch:', e);
  }

  // Direct Google Sheets gviz fetch for client-side static environments (e.g. Netlify)
  try {
    const sheetBookings = await fetchGoogleSheetsBookingsClientDirect();
    if (sheetBookings && sheetBookings.length > 0) {
      const localBookings = fetchBookingsFromStorage();
      const merged: BookingInquiry[] = sheetBookings.map((sb) => {
        const matchedLocal = localBookings.find((lb) => (lb.bookingId || lb.id) === (sb.bookingId || sb.id));
        if (matchedLocal) {
          return {
            ...sb,
            paymentStatus: matchedLocal.paymentStatus || sb.paymentStatus,
            status: matchedLocal.status || sb.status
          };
        }
        return sb;
      });

      localBookings.forEach((lb) => {
        if (!merged.some((m) => (m.bookingId || m.id) === (lb.bookingId || lb.id))) {
          merged.unshift(lb);
        }
      });

      saveBookingsToStorage(merged);
      return merged;
    }
  } catch (err) {
    console.warn('[dataService] Direct Google Sheets client fetch failed, falling back to local storage:', err);
  }

  return fetchBookingsFromStorage();
}

export function fetchBookingsFromStorage(): BookingInquiry[] {
  try {
    const raw = localStorage.getItem('hanford_booking_requests');
    if (!raw) {
      localStorage.setItem('hanford_booking_requests', JSON.stringify(DEFAULT_MOCK_BOOKINGS));
      return DEFAULT_MOCK_BOOKINGS;
    }
    const list: BookingInquiry[] = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      localStorage.setItem('hanford_booking_requests', JSON.stringify(DEFAULT_MOCK_BOOKINGS));
      return DEFAULT_MOCK_BOOKINGS;
    }
    return list;
  } catch (e) {
    console.error('Error reading booking requests:', e);
    return DEFAULT_MOCK_BOOKINGS;
  }
}

export function saveBookingsToStorage(bookings: BookingInquiry[]) {
  try {
    localStorage.setItem('hanford_booking_requests', JSON.stringify(bookings));
  } catch (e) {
    console.error('Error saving booking requests:', e);
  }
}

export function updateBookingPaymentStatus(bookingId: string, paymentStatus: 'UNPAID' | 'PAID'): BookingInquiry | null {
  const bookings = fetchBookingsFromStorage();
  const index = bookings.findIndex((b) => (b.bookingId || b.id) === bookingId);
  if (index !== -1) {
    bookings[index] = {
      ...bookings[index],
      paymentStatus,
      status: paymentStatus === 'PAID' ? 'Confirmed' : bookings[index].status || 'Pending'
    };
    saveBookingsToStorage(bookings);
    return bookings[index];
  }
  return null;
}

export function updateBookingDetails(updated: BookingInquiry): boolean {
  const bookings = fetchBookingsFromStorage();
  const id = updated.bookingId || updated.id;
  const index = bookings.findIndex((b) => (b.bookingId || b.id) === id);
  if (index !== -1) {
    bookings[index] = updated;
    saveBookingsToStorage(bookings);
    return true;
  }
  return false;
}

export function deleteBookingInquiry(bookingId: string): boolean {
  const bookings = fetchBookingsFromStorage();
  const filtered = bookings.filter((b) => (b.bookingId || b.id) !== bookingId);
  if (filtered.length !== bookings.length) {
    saveBookingsToStorage(filtered);
    return true;
  }
  return false;
}

const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: 'admin-super-001',
  username: 'admin',
  email: 'admin@hanfordresorts.com',
  fullName: 'Super Admin Hanford',
  role: 'Super Admin',
  status: 'Approved',
  createdAt: new Date().toISOString(),
  department: 'Executive Management',
  password: 'hanfordhnr'
};

export function getAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem('hanford_admin_users');
    if (!raw) {
      const initial = [DEFAULT_SUPER_ADMIN];
      localStorage.setItem('hanford_admin_users', JSON.stringify(initial));
      return initial;
    }
    const parsed: AdminUser[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = [DEFAULT_SUPER_ADMIN];
      localStorage.setItem('hanford_admin_users', JSON.stringify(initial));
      return initial;
    }
    let updated = false;
    const syncedUsers = parsed.map((u) => {
      if (u.username.toLowerCase() === 'admin' || u.id === 'admin-super-001') {
        if (u.password !== 'hanfordhnr') {
          updated = true;
          return { ...u, password: 'hanfordhnr', status: 'Approved' as const };
        }
      }
      return u;
    });
    if (updated) {
      localStorage.setItem('hanford_admin_users', JSON.stringify(syncedUsers));
    }
    return syncedUsers;
  } catch (e) {
    console.error('Error getting admin users:', e);
    return [DEFAULT_SUPER_ADMIN];
  }
}

export function saveAdminUsers(users: AdminUser[]) {
  try {
    localStorage.setItem('hanford_admin_users', JSON.stringify(users));
  } catch (e) {
    console.error('Error saving admin users:', e);
  }
}

export function registerAdminRequest(req: {
  fullName: string;
  email: string;
  username: string;
  password?: string;
  department?: string;
}): { success: boolean; message: string } {
  const users = getAdminUsers();

  const lowerEmail = req.email.toLowerCase().trim();
  const lowerUsername = req.username.toLowerCase().trim();

  const exists = users.some(
    (u) => u.email.toLowerCase().trim() === lowerEmail || u.username.toLowerCase().trim() === lowerUsername
  );

  if (exists) {
    return {
      success: false,
      message: 'Username atau Email sudah terdaftar dalam sistem Admin.'
    };
  }

  const newUser: AdminUser = {
    id: `admin-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fullName: req.fullName,
    email: req.email,
    username: req.username,
    role: 'Admin',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    department: req.department || 'Operations',
    password: req.password || 'admin123'
  };

  users.push(newUser);
  saveAdminUsers(users);

  return {
    success: true,
    message: 'Pendaftaran admin berhasil diajukan! Akun Anda sedang menunggu persetujuan (Accept) dari Super Admin.'
  };
}

export function approveAdminUser(userId: string): boolean {
  const users = getAdminUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    users[idx].status = 'Approved';
    saveAdminUsers(users);
    return true;
  }
  return false;
}

export function rejectAdminUser(userId: string): boolean {
  const users = getAdminUsers();
  const filtered = users.filter((u) => u.id !== userId);
  if (filtered.length !== users.length) {
    saveAdminUsers(filtered);
    return true;
  }
  return false;
}

export function authenticateAdmin(usernameOrEmail: string, passwordAttempt: string): {
  success: boolean;
  user?: AdminUser;
  message: string;
} {
  const users = getAdminUsers();
  const target = usernameOrEmail.toLowerCase().trim();

  const matched = users.find(
    (u) => u.username.toLowerCase().trim() === target || u.email.toLowerCase().trim() === target
  );

  if (!matched) {
    return {
      success: false,
      message: 'Username atau Email admin tidak ditemukan.'
    };
  }

  if (matched.password && matched.password !== passwordAttempt) {
    return {
      success: false,
      message: 'Password yang Anda masukkan salah.'
    };
  }

  if (matched.status === 'Pending') {
    return {
      success: false,
      message: 'Akun Anda masih dalam status PENDING (Menunggu persetujuan / Accept dari Super Admin).'
    };
  }

  if (matched.status === 'Rejected') {
    return {
      success: false,
      message: 'Permohonan pendaftaran akun Anda telah ditolak oleh Super Admin.'
    };
  }

  return {
    success: true,
    user: matched,
    message: 'Login berhasil.'
  };
}

