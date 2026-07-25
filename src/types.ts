export type PropertyStatus = 'Live' | 'Active' | 'Coming Soon' | 'Draft';
export type ProjectStatus = 'Completed' | 'Ongoing' | 'Upcoming' | 'Coming Soon' | string;

export interface RawGoogleSheetsPropertyRow {
  Name: string;
  Tagline: string;
  Address: string;
  Country: string;
  Continent: string;
  Status: PropertyStatus | string;
  Details: string; // May contain full HTML content
  Price?: string | number;
  Amenities?: string;
  Gallery?: string; // Comma-separated image links
  "Main Picture"?: string;
  "Main picture"?: string;
  "Picture's folder"?: string; // Internal only
  Source?: string; // Internal only - MUST NEVER be displayed publicly
}

export interface RawGoogleSheetsProjectRow {
  "Project Name"?: string;
  "Project Type"?: string;
  "Partner Name"?: string;
  Location?: string;
  Date?: string;
  Status?: ProjectStatus | string;
  Description?: string;
  Details?: string; // May contain full HTML content
  Gallery?: string;
  "Main Picture"?: string;
  "Picture's Folder"?: string;
  "Picture's folder"?: string;
  Source?: string; // Internal only - MUST NEVER be displayed publicly
  // Fallback property column names if sheet uses property headers:
  Name?: string;
  Tagline?: string;
  Country?: string;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  address: string;
  country: string;
  continent: string;
  status: PropertyStatus;
  detailsHtml: string;
  driveFolderUrl: string;
  heroImage: string;
  galleryImages: string[];
  priceFrom: number;
  rating: number;
  amenities: string[];
}

export interface Project {
  id: string;
  slug: string;
  projectName: string;
  projectType: string;
  partnerName: string;
  location: string;
  date: string;
  status: ProjectStatus;
  description: string;
  detailsHtml: string;
  heroImage: string;
  galleryImages: string[];
}

export interface BookingInquiry {
  id?: string;
  propertySlug: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  specialRequests?: string;
  createdAt?: string;
  status?: 'Pending' | 'Confirmed' | 'Reviewed';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  source: 'google_sheets' | 'mock_fallback';
  message?: string;
  sheetInfo?: {
    spreadsheetIdConfigured: boolean;
    activeTab: string;
  };
}
