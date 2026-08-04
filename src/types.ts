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
  "Project_ID"?: string;
  "Project ID"?: string;
  "Project Name"?: string;
  "Project_Name"?: string;
  "Project Type"?: string;
  "Project_Type"?: string;
  "Partner Name"?: string;
  "Partner_Name"?: string;
  "X Username"?: string;
  "X_Username"?: string;
  "Twitter Username"?: string;
  "Short Description"?: string;
  "Short_Description"?: string;
  Location?: string;
  Date?: string;
  Status?: ProjectStatus | string;
  Description?: string;
  Details?: string; // May contain full HTML content
  Gallery?: string;
  "Main Picture"?: string;
  "Main_Picture"?: string;
  Logo?: string;
  "X Link"?: string;
  "X_Link"?: string;
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

  // Discount code from location sheet
  discountCode?: string;
  discountPercent?: number | string;
}

export interface Project {
  id: string;
  slug: string;
  projectName: string;
  projectType: string;
  partnerName: string;
  xUsername?: string;
  xLink?: string;
  location: string;
  date: string;
  status: ProjectStatus | string;
  shortDescription?: string;
  description: string;
  detailsHtml: string;
  heroImage: string;
  galleryImages: string[];
}

export type BookOption = 'room' | 'event' | 'both' | 'meeting' | 'room_meeting';
export type EventTypeOption = 'hall' | 'meeting';
export type EventAddonOption = 'none' | 'catering' | 'decoration' | 'both';

export interface InvoiceLineItem {
  id: string;
  serviceDate?: string;
  productService: string;
  description?: string;
  qty: number;
  rate: number;
  amount: number;
}

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

  // Custom Products & Services Line Items (QuickBooks Style)
  customLineItems?: InvoiceLineItem[];
  noteToCustomer?: string;
  memoOnStatement?: string;
  shippingFee?: number;

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
  
  // Calculation breakdown & Price Snapshots
  numberOfNights?: number;
  roomSubtotal?: number;
  eventSubtotal?: number;
  priceStandardRoom?: number;
  priceDeluxeRoom?: number;
  pricePresidentialSuite?: number;
  pricePrivateVilla?: number;
  priceMeetingRoom?: number;
  priceEventHall?: number;
  priceCateringPerPax?: number;
  itemRatesSnapshot?: string;
  discountCode?: string;
  discountPercent?: number;
  discountAmount?: number;
  subtotalBeforeDiscount?: number;
  subtotalBeforeTax?: number;
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

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'Super Admin' | 'Admin';
  status: 'Approved' | 'Pending' | 'Rejected';
  createdAt: string;
  department?: string;
  password?: string;
}
