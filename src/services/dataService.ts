import { Property, Project, BookingInquiry, ApiResponse } from '../types';
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

    const priceRaw = rowObj.Price || rowObj.price || rowObj.PriceFrom || rowObj['Price/night'] || rowObj.Rate;
    let priceFrom = 850 + index * 150;
    const parsedPriceFrom = parsePriceNumber(priceRaw);
    if (parsedPriceFrom) {
      priceFrom = parsedPriceFrom;
    }

    const priceStandard = parsePriceNumber(rowObj.Price || rowObj['Standard Room'] || rowObj.Standard) || priceFrom;
    const priceDeluxe = parsePriceNumber(rowObj['Deluxe Room'] || rowObj.Deluxe) || Math.round(priceStandard * 1.45);
    const pricePresidential = parsePriceNumber(rowObj['Presidential Suite'] || rowObj.Presidential) || Math.round(priceStandard * 3.8);
    const pricePrivateVilla = hasPrivateVilla
      ? (parsePriceNumber(rowObj['Private Villa'] || rowObj.Villa) || Math.round(priceStandard * 5.2))
      : undefined;

    const priceMeetingRoom = parsePriceNumber(rowObj['Meeting Room'] || rowObj.Meeting) || 120;
    const priceEventHall = parsePriceNumber(rowObj['Event Hall'] || rowObj.Hall) || 3200;
    const priceCateringPerPax = parsePriceNumber(rowObj['Catering Per Pax'] || rowObj.Catering) || 75;

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
      capacityPrivateVilla
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
                    <a href="${finalXLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; background-color: #51867E; color: #ffffff; border-radius: 9999px; font-weight: 600; text-decoration: none; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase;">
                      View Official Account / Link on X ${xUsername ? `(${xUsername})` : ''} &rarr;
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
      const bookOptionText =
        inquiry.bookOption === 'both' ? 'Room + Event Space' : inquiry.bookOption === 'event' ? 'Event Space Only' : 'Room Only';
      const totalRooms =
        (inquiry.standardRooms || 0) + (inquiry.deluxeRooms || 0) + (inquiry.presidentialSuites || 0) + (inquiry.privateVillas || 0);

      const payload = {
        bookingId: finalBookingId,
        createdAt,
        propertyName: inquiry.propertyName || inquiry.propertySlug,
        guestName: inquiry.guestName,
        xUsername: inquiry.xUsername || 'N/A',
        bookOptionText,
        rowValues: [
          finalBookingId,
          createdAt,
          inquiry.propertyName || inquiry.propertySlug,
          inquiry.guestName,
          inquiry.xUsername || 'N/A',
          bookOptionText,
          String(inquiry.standardRooms || 0),
          String(inquiry.deluxeRooms || 0),
          String(inquiry.presidentialSuites || 0),
          String(inquiry.privateVillas || 0),
          `${totalRooms} Room(s)`,
          inquiry.eventAttendees ? String(inquiry.eventAttendees) : 'N/A',
          inquiry.eventAddons || 'N/A',
          inquiry.cateringPax ? String(inquiry.cateringPax) : 'N/A',
          inquiry.checkInDate || 'N/A',
          inquiry.checkOutDate || 'N/A',
          inquiry.eventDate || 'N/A',
          inquiry.notes || 'N/A',
          inquiry.totalAmount ? `$${inquiry.totalAmount.toLocaleString()}` : 'N/A'
        ]
      };

      // Direct POST to Google Sheets Apps Script Webhook
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
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
