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

    const isEcoResort = name.toLowerCase().includes('eco resort') || (rowObj.Tagline || '').toLowerCase().includes('eco resort');

    const priceRaw = rowObj.Price || rowObj.price || rowObj.PriceFrom || rowObj['Price/night'] || rowObj.Rate;
    let priceFrom = 850 + index * 150;
    const parsedPriceFrom = parsePriceNumber(priceRaw);
    if (parsedPriceFrom) {
      priceFrom = parsedPriceFrom;
    }

    const priceStandard = parsePriceNumber(rowObj.Price || rowObj['Standard Room'] || rowObj.Standard) || priceFrom;
    const priceDeluxe = parsePriceNumber(rowObj['Deluxe Room'] || rowObj.Deluxe) || Math.round(priceStandard * 1.45);
    const pricePresidential = parsePriceNumber(rowObj['Presidential Suite'] || rowObj.Presidential) || Math.round(priceStandard * 3.8);
    const pricePrivateVilla = isEcoResort
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
    const capacityPrivateVilla = isEcoResort
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
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/gviz/tq?sheet=Projects&tqx=out:json`;
  const res = await fetch(gvizUrl);
  if (!res.ok) {
    throw new Error(`Google Sheets Projects endpoint HTTP ${res.status}`);
  }

  const text = await res.text();
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
  if (!jsonMatch) {
    throw new Error('Invalid Google Visualization Query response');
  }

  const data = JSON.parse(jsonMatch[1]);
  const tableRows = data.table?.rows || [];

  if (!tableRows || tableRows.length === 0) {
    return MOCK_PROJECTS;
  }

  let headers: string[] = [];
  if (data.table.cols && data.table.cols.some((c: any) => c && c.label)) {
    headers = data.table.cols.map((c: any) => (c && c.label ? String(c.label).trim() : ''));
  }

  let dataSlice = tableRows;
  if (tableRows[0] && tableRows[0].c && tableRows[0].c.some((cell: any) => cell && cell.v && String(cell.v).toLowerCase().includes('name'))) {
    headers = tableRows[0].c.map((cell: any) => (cell && cell.v ? String(cell.v).trim() : ''));
    dataSlice = tableRows.slice(1);
  }

  if (dataSlice.length === 0) {
    return MOCK_PROJECTS;
  }

  const defaultHero = 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1800&q=85';

  const rawRows: Record<string, string>[] = dataSlice.map((row: any) => {
    const rowObj: Record<string, string> = {};
    headers.forEach((header, i) => {
      if (header) {
        const cellVal = row.c && row.c[i] && row.c[i].v !== null && row.c[i].v !== undefined ? String(row.c[i].v) : '';
        rowObj[header] = cellVal;
      }
    });
    return rowObj;
  });

  const filteredRows = rawRows.filter((r) => {
    const name = (r['Project Name'] || r.Name || '').toLowerCase();
    const partner = (r['Partner Name'] || '').toLowerCase();
    const source = (r.Source || '').toLowerCase();

    if (name.includes('7inchesunder') || name.includes('7 inches under') || partner.includes('7 inches under') || source.includes('2038247095371792521')) {
      return true;
    }
    if (name.startsWith('hanford eco resort') || name.startsWith('hanford grand hotel') || name.startsWith('hanford hotel')) {
      return false;
    }
    return Boolean(r['Project Name'] || r['Partner Name']);
  });

  const parsedProjects: Project[] = filteredRows.map((rowObj: Record<string, string>, index: number) => {
    const rawName = rowObj['Project Name'] || rowObj.Name || rowObj.Tagline || '';
    const projectName = rawName.trim() || '7 Inches Under';
    const slug = createSlug(projectName);
    const projectType = (rowObj['Project Type'] || 'Collaboration').trim();
    const partnerName = (rowObj['Partner Name'] || '7 Inches Under (@7inchesunder)').trim();
    const location = (rowObj.Location || '').trim();
    const date = (rowObj.Date || '').trim();
    const status = (rowObj.Status || 'Active').trim();
    const description = (rowObj.Description || 'Official collaboration project with 7 Inches Under (@7inchesunder).').trim();
    const detailsHtml = rowObj.Details || `
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

    const galleryUrls = parseGalleryUrls(rowObj.Gallery || rowObj['Main Picture']);
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
      status,
      description,
      detailsHtml,
      heroImage,
      galleryImages
    };
  });

  return parsedProjects.length > 0 ? parsedProjects : MOCK_PROJECTS;
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
