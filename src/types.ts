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
  "Deluxe Room"?: string | number;
  "Deluxe"?: string | number;
  "Presidential Suite"?: string | number;
  "Presidential"?: string | number;
  "Private Villa"?: string | number;
  "Villa"?: string | number;
  "Meeting Room"?: string | number;
  "Meeting"?: string | number;
  "Event Hall"?: string | number;
  "Hall"?: string | number;
  "Catering Per Pax"?: string | number;
  "Catering"?: string | number;
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
  // Pricing breakdown per category
  priceStandard?: number;
  priceDeluxe?: number;
  pricePresidential?: number;
  pricePrivateVilla?: number; // Only for Eco Resorts
  priceMeetingRoom?: number; // Per person per day
  priceEventHall?: number; // Hall rental per day
  priceCateringPerPax?: number; // Catering per person
  isEcoResort?: boolean;

  // Capacity information
  capacityStandard?: string;
  capacityDeluxe?: string;
  capacityPresidential?: string;
  capacityPrivateVilla?: string;
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

export type BookOption = 'room' | 'event' | 'both' | 'meeting' | 'room_meeting';
export type EventTypeOption = 'hall' | 'meeting';
export type EventAddonOption = 'none' | 'catering' | 'decoration' | 'both';

export interface BookingInquiry {
  id?: string;
  bookingId?: string;
  propertySlug: string;
  propertyName: string;
  guestName: string;
  xUsername: string; // X / Twitter handle
  businessName?: string; // Optional Business Name
  guestEmail?: string;
  guestPhone?: string;
  totalGuests?: number;
  bookOption: BookOption; // 'room' | 'event' | 'both' | 'meeting' | 'room_meeting'
  
  // Meeting Room Options
  accommodationOption?: 'without' | 'with';
  venueRentalRate?: 'half_day' | 'full_day' | 'full_board';
  standardRooms?: number;
  deluxeRooms?: number;
  presidentialSuites?: number;
  privateVillas?: number;
  roomsCount?: number; // Total rooms count

  // Event & Catering Details
  eventType?: EventTypeOption; // 'hall' | 'meeting'
  eventAttendees?: number; // Jumlah orang dalam event
  eventAddons?: EventAddonOption; // 'none' | 'catering' | 'decoration' | 'both'
  cateringPax?: number; // Jumlah Pax untuk catering
  includeCatering?: boolean;

  checkInDate?: string;
  checkOutDate?: string;
  eventDate?: string;
  notes?: string; // Keterangan & booking details
  
  // Calculation breakdown
  numberOfNights?: number;
  roomSubtotal?: number;
  eventSubtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  paymentStatus?: 'UNPAID' | 'PAID';

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
