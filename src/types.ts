export type PropertyStatus = 'Live' | 'Active' | 'Coming Soon' | 'Draft';

export interface RawGoogleSheetsPropertyRow {
  Name: string;
  Tagline: string;
  Address: string;
  Country: string;
  Continent: string;
  Status: PropertyStatus | string;
  Details: string; // May contain full HTML content
  Gallery?: string; // Comma-separated image links
  "Picture's folder"?: string; // Internal only
  Source?: string; // Internal only - MUST NEVER be displayed publicly
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
