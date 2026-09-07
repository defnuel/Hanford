import React, { useState, useRef, useEffect } from 'react';
import {
  KeyRound,
  Mail,
  Download,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Building,
  User,
  Calendar,
  Layers,
  Info,
  RotateCcw,
  Upload,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Bed,
  CheckCircle2,
} from 'lucide-react';
import { BookingInquiry, Property } from '../../types';
import { GuestKeyCardCanvas } from './GuestKeyCardCanvas';
import { WelcomingCardCanvas } from './WelcomingCardCanvas';
import { AccommodationGalleryCanvas, GalleryPhotoItem } from './AccommodationGalleryCanvas';
import { ResponsiveCardViewport } from './ResponsiveCardViewport';
import { exportCardAsImage } from '../../utils/exportCardImage';

const DEFAULT_GALLERY_PHOTOS: GalleryPhotoItem[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', title: 'Main Villa Exterior & Infinity Pool' },
  { id: '2', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', title: 'Master Bedroom & Ocean View' },
  { id: '3', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', title: 'Living Pavilion & Sunken Lounge' },
  { id: '4', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', title: 'Open-Air Marble En-Suite Bathroom' },
  { id: '5', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', title: 'Private Sun Deck & Daybeds' },
  { id: '6', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', title: 'Sunset Clifftop Terrace' },
  { id: '7', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', title: 'Private Dining Gazebo' },
  { id: '8', url: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80', title: 'Tropical Garden Sanctuary' },
  { id: '9', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', title: 'In-Villa Spa & Soaking Tub' },
  { id: '10', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', title: 'Private Lagoon & Beach Access' },
  { id: '11', url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80', title: 'Japanese Tea & Relaxation Deck' },
  { id: '12', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', title: 'Private Courtyard & Water Feature' },
  { id: '13', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80', title: 'Sunrise Meditation Pavilion' },
  { id: '14', url: 'https://images.unsplash.com/photo-1528164344705-475426879e0d?auto=format&fit=crop&w=1200&q=80', title: 'Ocean Cliff Observation Point' },
  { id: '15', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', title: 'Grand Entry & Private Foyer' },
];

const PRESET_COLLECTIONS: Record<string, GalleryPhotoItem[]> = {
  uluwatu: [
    { id: 'u1', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', title: 'Private Cliffside Infinity Pool' },
    { id: 'u2', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', title: 'Master Bedroom Oceanfront Panorama' },
    { id: 'u3', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', title: 'Open-Air Balinese Living Pavilion' },
    { id: 'u4', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', title: 'Handcrafted Stone En-Suite Bathroom' },
    { id: 'u5', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', title: 'Sunset Daybed & Poolside Deck' },
    { id: 'u6', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', title: 'Private Beach Trail & Indian Ocean' },
    { id: 'u7', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', title: 'Dining Terrace with Candlelit View' },
    { id: 'u8', url: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80', title: 'Tropical Flora Courtyard' },
    { id: 'u9', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', title: 'Deep Soaking Marble Jacuzzi' },
    { id: 'u10', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', title: 'Villa Entrance Aling-Aling Gate' },
    { id: 'u11', url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80', title: 'Private Clifftop Garden Bar' },
    { id: 'u12', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', title: 'Private Chef Kitchenette' },
    { id: 'u13', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80', title: 'Balinese Yoga Bale Pavilion' },
    { id: 'u14', url: 'https://images.unsplash.com/photo-1528164344705-475426879e0d?auto=format&fit=crop&w=1200&q=80', title: 'Ocean Horizon Sunset Deck' },
    { id: 'u15', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', title: 'Tropical Waterfalls & Koi Pond' },
  ],
  jeju: [
    { id: 'j1', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', title: 'Jeju Volcanic Cliff Ocean Suite' },
    { id: 'j2', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', title: 'Hanok-Inspired Minimalist Bedroom' },
    { id: 'j3', url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80', title: 'Natural Hot Spring Onsen Bath' },
    { id: 'j4', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80', title: 'Zen Tea Garden Sunken Lounge' },
    { id: 'j5', url: 'https://images.unsplash.com/photo-1528164344705-475426879e0d?auto=format&fit=crop&w=1200&q=80', title: 'Panoramic Volcanic Coastline View' },
    { id: 'j6', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', title: 'Private Heated Plunge Pool' },
    { id: 'j7', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', title: 'Timber Terrace & Fire Pit' },
    { id: 'j8', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', title: 'Gourmet In-Room Dining Alcove' },
    { id: 'j9', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', title: 'Forest Path & Olle Trail Access' },
    { id: 'j10', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', title: 'Marble Jjimjilbang Soaking Tub' },
    { id: 'j11', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', title: 'Camellia Garden Private Courtyard' },
    { id: 'j12', url: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80', title: 'Cedar Wood Aromatherapy Suite' },
    { id: 'j13', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', title: 'Korean Ceramic Tea Corner' },
    { id: 'j14', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', title: 'Seongsan Sunrise Observation Deck' },
    { id: 'j15', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', title: 'Basalt Stone Courtyard Gate' },
  ],
  santorini: [
    { id: 's1', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', title: 'Whitewashed Caldera Suite Horizon' },
    { id: 's2', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', title: 'Cave Style Master Bedroom' },
    { id: 's3', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', title: 'Aegean Private Heated Jacuzzi' },
    { id: 's4', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', title: 'Sunken Cycladic Bathroom' },
    { id: 's5', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', title: 'Oia Sunset Observation Balcony' },
    { id: 's6', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', title: 'Infinity Pool Above Aegean Sea' },
    { id: 's7', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', title: 'Private Alfresco Dining Pergola' },
    { id: 's8', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', title: 'Sun Loungers on Stone Deck' },
    { id: 's9', url: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80', title: 'Indigenous Wine Cellar Bar' },
    { id: 's10', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', title: 'Private Courtyard Entry' },
    { id: 's11', url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80', title: 'Santorini Sunset Lounge Veranda' },
    { id: 's12', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', title: 'Greek Cave Spa Soaking Tub' },
    { id: 's13', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80', title: 'Caldera Cliff Morning Breakfast Nook' },
    { id: 's14', url: 'https://images.unsplash.com/photo-1528164344705-475426879e0d?auto=format&fit=crop&w=1200&q=80', title: 'Private Horizon Plunge Pool' },
    { id: 's15', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', title: 'Traditional Blue Dome Terrace' },
  ],
};

interface GuestCardsManagerProps {
  properties: Property[];
  bookings: BookingInquiry[];
  initialBooking?: BookingInquiry | null;
  initialTab?: 'keycard' | 'welcomecard' | 'gallery';
}

export const GuestCardsManager: React.FC<GuestCardsManagerProps> = ({
  properties,
  bookings,
  initialBooking,
  initialTab = 'keycard',
}) => {
  const [activeCardType, setActiveCardType] = useState<'keycard' | 'welcomecard' | 'gallery'>(initialTab);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    initialBooking?.bookingId || initialBooking?.id || ''
  );

  // Key Card Form State
  const [keyGuestName, setKeyGuestName] = useState<string>('Gavin Elian Baskoro');
  const [keyLocationName, setKeyLocationName] = useState<string>(
    'Hanford Hotel & Resort Uluwatu, Bali'
  );
  const [keyLocationShort, setKeyLocationShort] = useState<string>('ULUWATU');
  const [roomNumbers, setRoomNumbers] = useState<string[]>([]);
  const [customRoomInput, setCustomRoomInput] = useState<string>('');

  // Welcoming Card Form State
  const [welcomeGuestName, setWelcomeGuestName] = useState<string>('Agatha Madeleine');
  const [welcomeXUser, setWelcomeXUser] = useState<string>('@pendxnts');
  const [welcomeProperty, setWelcomeProperty] = useState<string>(
    'Hanford Hotel & Resort Uluwatu, Bali'
  );
  const [welcomeBookingType, setWelcomeBookingType] = useState<string>('Room & Event');
  const [welcomeStayDates, setWelcomeStayDates] = useState<string>(
    '2026-09-01 to 2026-09-02 (1 night)'
  );
  const [welcomeEventDate, setWelcomeEventDate] = useState<string>('N/A');
  const [welcomeHeroImage, setWelcomeHeroImage] = useState<string>(
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1800&q=85'
  );
  const [welcomeRoomDetails, setWelcomeRoomDetails] = useState<string>('Private Pool Villa');
  const [welcomeCustomNote, setWelcomeCustomNote] = useState<string>('');
  const [welcomeRef, setWelcomeRef] = useState<string>(() => {
    const b = initialBooking || (bookings && bookings.length > 0 ? bookings[0] : null);
    const bId = (b?.bookingId || b?.id || '').trim();
    return bId ? `Ref No: ${bId}` : 'Ref No: HNF-2026-INV';
  });

  // Accommodation Gallery Form State (New Feature)
  const [galleryGuestName, setGalleryGuestName] = useState<string>('Agatha Madeleine');
  const [galleryXUser, setGalleryXUser] = useState<string>('@pendxnts');
  const [galleryProperty, setGalleryProperty] = useState<string>('Hanford Hotel & Resort Uluwatu, Bali');
  const [galleryRoomType, setGalleryRoomType] = useState<string>('Private Pool Villa • 3 Bedroom Ocean Suite');
  const [galleryStayDates, setGalleryStayDates] = useState<string>('2026-09-01 to 2026-09-02 (1 night)');
  const [galleryRef, setGalleryRef] = useState<string>(() => {
    const b = initialBooking || (bookings && bookings.length > 0 ? bookings[0] : null);
    const bId = (b?.bookingId || b?.id || '').trim();
    return bId ? `Ref No: ${bId}` : 'Ref No: HNF-2026-INV';
  });
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>(DEFAULT_GALLERY_PHOTOS);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [newPhotoTitle, setNewPhotoTitle] = useState<string>('');

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const keyCardRef = useRef<HTMLDivElement>(null);
  const welcomeCardRef = useRef<HTMLDivElement>(null);
  const galleryCardRef = useRef<HTMLDivElement>(null);

  const keyExportRef = useRef<HTMLDivElement>(null);
  const welcomeExportRef = useRef<HTMLDivElement>(null);
  const galleryExportRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to dynamically calculate nights between dates
  const calculateDynamicNights = (inDate?: string, outDate?: string, fallback = 1): number => {
    if (inDate && outDate) {
      try {
        const d1 = new Date(inDate);
        const d2 = new Date(outDate);
        const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        if (!isNaN(diffDays) && diffDays > 0) return diffDays;
      } catch {
        // ignore
      }
    }
    return fallback > 0 ? fallback : 1;
  };

  // Load Initial Booking if provided
  useEffect(() => {
    if (initialBooking) {
      applyBookingData(initialBooking);
    }
  }, [initialBooking]);

  const applyBookingData = (b: BookingInquiry) => {
    setSelectedBookingId(b.bookingId || b.id || '');

    // Key card fields
    setKeyGuestName(b.guestName || 'Agatha Madeleine');
    const propName = b.propertyName || b.propertySlug || 'Hanford Hotel & Resort Uluwatu, Bali';
    setKeyLocationName(propName);
    setKeyLocationShort(extractShortCity(propName));

    // Determine rooms based on inquiry
    const rooms: string[] = [];
    if (b.privateVillas && b.privateVillas > 1) {
      for (let i = 1; i <= b.privateVillas; i++) {
        rooms.push(`VILLA ${String(i).padStart(2, '0')}`);
      }
    } else if (b.privateVillas && b.privateVillas === 1) {
      rooms.push('VILLA 01');
    } else if (b.standardRooms || b.deluxeRooms || b.presidentialSuites) {
      if (b.presidentialSuites) rooms.push('PRESIDENTIAL SUITE 01');
      if (b.deluxeRooms) rooms.push('DELUXE ROOM 204');
      if (b.standardRooms) rooms.push('STANDARD ROOM 102');
    }
    setRoomNumbers(rooms);

    // Welcoming card fields
    setWelcomeGuestName(b.guestName || 'Agatha Madeleine');
    setWelcomeXUser(b.xUsername || '@pendxnts');
    setWelcomeProperty(propName);

    let typeStr = 'Room Reservation';
    if (b.bookOption === 'both') typeStr = 'Room & Event';
    else if (b.bookOption === 'event') typeStr = 'Event & Catering';
    else if (b.bookOption === 'meeting') typeStr = 'Meeting Room';
    else if (b.bookOption === 'room_meeting') typeStr = 'Room & Meeting';
    else if (b.bookOption === 'room') typeStr = 'Room Reservation';
    setWelcomeBookingType(typeStr);

    // Dynamic Nights Calculation based on actual dates
    const nights = calculateDynamicNights(b.checkInDate, b.checkOutDate, b.numberOfNights || 1);
    const nightLabel = nights === 1 ? '1 night' : `${nights} nights`;

    if (b.checkInDate && b.checkOutDate) {
      setWelcomeStayDates(`${b.checkInDate} to ${b.checkOutDate} (${nightLabel})`);
      setGalleryStayDates(`${b.checkInDate} to ${b.checkOutDate} (${nightLabel})`);
    } else {
      setWelcomeStayDates(`2026-09-01 to 2026-09-02 (1 night)`);
      setGalleryStayDates(`2026-09-01 to 2026-09-02 (1 night)`);
    }

    setWelcomeEventDate(b.eventDate || 'N/A');

    // Gallery fields
    setGalleryGuestName(b.guestName || 'Agatha Madeleine');
    setGalleryXUser(b.xUsername || '@pendxnts');
    setGalleryProperty(propName);
    const resolvedRoom =
      (b as any).allocatedRoom ||
      (b.privateVillas ? `Private Pool Villa (${b.privateVillas} Unit)` : '') ||
      (b.presidentialSuites ? 'Presidential Ocean Suite' : '') ||
      (b.deluxeRooms ? 'Deluxe Ocean View Room' : '') ||
      (b.standardRooms ? 'Standard Premium Room' : '') ||
      'Private Pool Villa • 3 Bedroom Ocean Suite';
    setGalleryRoomType(resolvedRoom);
    const bRefCode = (b.bookingId || b.id || '').trim();
    const formattedRef = bRefCode ? `Ref No: ${bRefCode}` : 'Ref No: HNF-2026-INV';
    setWelcomeRef(formattedRef);
    setGalleryRef(formattedRef);

    // Auto-select preset photos if matching property
    const pLower = propName.toLowerCase();
    if (pLower.includes('uluwatu')) {
      setGalleryPhotos(PRESET_COLLECTIONS.uluwatu);
    } else if (pLower.includes('jeju')) {
      setGalleryPhotos(PRESET_COLLECTIONS.jeju);
    } else if (pLower.includes('santorini')) {
      setGalleryPhotos(PRESET_COLLECTIONS.santorini);
    }

    // Find image for property hero
    const matchedProp = properties.find(
      (p) =>
        p.name.toLowerCase() === propName.toLowerCase() ||
        p.slug.toLowerCase() === (b.propertySlug || '').toLowerCase()
    );
    if (matchedProp && matchedProp.heroImage) {
      setWelcomeHeroImage(matchedProp.heroImage);
    }
  };

  const extractShortCity = (name: string): string => {
    if (!name) return 'ULUWATU';
    const clean = name
      .replace(/Hanford\s+(Eco\s+Resort|Grand\s+Hotel|Hotel\s+&\s+Resort|Resort\s+&\s+Spa)?/gi, '')
      .replace(/,\s*Indonesia|,\s*Bali|,\s*South\s*Korea|,\s*United\s*States|,\s*Greece/gi, '')
      .trim()
      .toUpperCase();
    return clean || 'ULUWATU';
  };

  // Helper to extract clean raw Booking / Invoice ID for presets
  const getRawBookingCode = (refVal: string): string => {
    const matched = bookings.find((b) => (b.bookingId || b.id) === selectedBookingId);
    if (matched && (matched.bookingId || matched.id)) {
      return (matched.bookingId || matched.id).trim();
    }
    const cleaned = refVal.replace(/^(REF\s*NO|REF|INVOICE\s*NO|INV\s*NO|INV)\s*[:#]?\s*/i, '').trim();
    return cleaned || 'HNF-2026-INV';
  };

  const handleBookingSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bId = e.target.value;
    setSelectedBookingId(bId);
    if (!bId) return;

    const found = bookings.find((b) => (b.bookingId || b.id) === bId);
    if (found) {
      applyBookingData(found);
    }
  };

  const handleAddRoom = () => {
    if (!customRoomInput.trim()) return;
    const items = customRoomInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setRoomNumbers((prev) => [...prev, ...items]);
    setCustomRoomInput('');
  };

  const handleRemoveRoom = (index: number) => {
    setRoomNumbers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePropertySelectForWelcome = (propName: string) => {
    setWelcomeProperty(propName);
    const matched = properties.find((p) => p.name.toLowerCase() === propName.toLowerCase());
    if (matched && matched.heroImage) {
      setWelcomeHeroImage(matched.heroImage);
    }
  };

  const handlePropertySelectForGallery = (propName: string) => {
    setGalleryProperty(propName);
    const pLower = propName.toLowerCase();
    if (pLower.includes('uluwatu')) {
      setGalleryPhotos(PRESET_COLLECTIONS.uluwatu);
    } else if (pLower.includes('jeju')) {
      setGalleryPhotos(PRESET_COLLECTIONS.jeju);
    } else if (pLower.includes('santorini')) {
      setGalleryPhotos(PRESET_COLLECTIONS.santorini);
    }
  };

  const handlePropertySelectForKeyCard = (propName: string) => {
    setKeyLocationName(propName);
    setKeyLocationShort(extractShortCity(propName));
  };

  // Upload Local Images (Up to 15 photos)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    const remainingSlots = 15 - galleryPhotos.length;
    const filesToRead = fileList.slice(0, Math.max(remainingSlots, 15));

    filesToRead.forEach((file: File, idx: number) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        if (resultUrl) {
          const autoTitle = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          setGalleryPhotos((prev) => {
            if (prev.length >= 15) return prev;
            return [
              ...prev,
              {
                id: `upload-${Date.now()}-${idx}-${Math.random()}`,
                url: resultUrl,
                title: autoTitle || `Uploaded Photo ${prev.length + 1}`,
              },
            ];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddPhotoByUrl = () => {
    if (!newPhotoUrl.trim()) return;
    if (galleryPhotos.length >= 15) {
      alert('Maksimal 15 foto dalam galeri visual akomodasi.');
      return;
    }
    setGalleryPhotos((prev) => [
      ...prev,
      {
        id: `url-${Date.now()}`,
        url: newPhotoUrl.trim(),
        title: newPhotoTitle.trim() || `Accommodation Photo ${prev.length + 1}`,
      },
    ]);
    setNewPhotoUrl('');
    setNewPhotoTitle('');
  };

  const handleRemovePhoto = (index: number) => {
    setGalleryPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    setGalleryPhotos((prev) => {
      const copy = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleUpdatePhotoTitle = (index: number, title: string) => {
    setGalleryPhotos((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, title } : item))
    );
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    setExportSuccess(null);
    setExportError(null);

    try {
      if (activeCardType === 'keycard') {
        const exportElem = keyExportRef.current || document.getElementById('hanford-key-card-export');
        const onscreenElem = keyCardRef.current || document.getElementById('hanford-key-card-canvas');
        if (!exportElem && !onscreenElem) throw new Error('Elemen Key Card Canvas tidak ditemukan.');
        const cleanName = (keyGuestName || 'Guest').replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `Hanford_KeyCard_${cleanName}.png`;
        await exportCardAsImage(exportElem as HTMLElement, onscreenElem as HTMLElement, fileName);
        setExportSuccess(`Key Card untuk ${keyGuestName} berhasil diunduh sebagai PNG!`);
      } else if (activeCardType === 'welcomecard') {
        const exportElem = welcomeExportRef.current || document.getElementById('hanford-welcome-card-export');
        const onscreenElem = welcomeCardRef.current || document.getElementById('hanford-welcome-card-canvas');
        if (!exportElem && !onscreenElem) throw new Error('Elemen Welcoming Card Canvas tidak ditemukan.');
        const cleanName = (welcomeGuestName || 'Guest').replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `Hanford_WelcomingCard_${cleanName}.png`;
        await exportCardAsImage(exportElem as HTMLElement, onscreenElem as HTMLElement, fileName);
        setExportSuccess(`Welcoming Card untuk ${welcomeGuestName} berhasil diunduh sebagai PNG ukuran A4!`);
      } else {
        const exportElem = galleryExportRef.current || document.getElementById('hanford-gallery-card-export');
        const onscreenElem = galleryCardRef.current || document.getElementById('hanford-gallery-card-canvas');
        if (!exportElem && !onscreenElem) throw new Error('Elemen Accommodation Gallery Canvas tidak ditemukan.');
        const cleanName = (galleryGuestName || 'Guest').replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `Hanford_AccomGallery_${cleanName}.png`;
        await exportCardAsImage(exportElem as HTMLElement, onscreenElem as HTMLElement, fileName);
        setExportSuccess(`Accommodation Gallery untuk ${galleryGuestName} berhasil diunduh sebagai PNG ukuran A4!`);
      }
    } catch (err: any) {
      console.error('Download card error:', err);
      setExportError(err.message || 'Gagal mengunduh gambar. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
      setTimeout(() => {
        setExportSuccess(null);
      }, 5000);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#182233] to-[#253347] p-6 sm:p-8 rounded-2xl text-white shadow-xl border border-slate-700">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/20 text-[#F3D796] rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#D4AF37]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hanford Guest Visual Assets Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-light tracking-wide text-white">
            Guest Cards & Visual Gallery Generator
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Generate high-resolution PNG luxury Key Cards, official Welcoming Cards, and 15-Photo Accommodation Visual Galleries in standard A4 format for your VIP guests.
          </p>
        </div>

        {/* 3 Tab Switcher */}
        <div className="flex flex-wrap items-center bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/60 shrink-0 self-start md:self-auto gap-1">
          <button
            onClick={() => setActiveCardType('keycard')}
            className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeCardType === 'keycard'
                ? 'bg-[#51867E] text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>1. Key Card</span>
          </button>
          
          <button
            onClick={() => setActiveCardType('welcomecard')}
            className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeCardType === 'welcomecard'
                ? 'bg-[#51867E] text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>2. Welcoming Card</span>
          </button>

          <button
            onClick={() => setActiveCardType('gallery')}
            className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeCardType === 'gallery'
                ? 'bg-[#51867E] text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>3. Accommodation Gallery</span>
          </button>
        </div>
      </div>

      {/* Quick Booking Autofill Banner */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 bg-[#EAF2F1] text-[#51867E] rounded-xl shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#2C3744] uppercase tracking-wider">
              Autofill Booking Data Dari Excel / Inquiries
            </div>
            <div className="text-[11px] text-slate-500">
              Pilih data reservasi untuk otomatis mengisi nama tamu, destinasi properti, tipe kamar, dan periode menginap.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedBookingId}
            onChange={handleBookingSelect}
            className="w-full md:w-80 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#51867E] focus:bg-white cursor-pointer"
          >
            <option value="">-- Pilih Reservasi Tamu (Excel Data) --</option>
            {bookings.map((b) => (
              <option key={b.bookingId || b.id} value={b.bookingId || b.id}>
                {b.guestName} ({b.propertyName || b.propertySlug}) - {b.bookOption || 'Stay'}
              </option>
            ))}
          </select>

          {/* Reset / Clear Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedBookingId('');
              setKeyGuestName('');
              setRoomNumbers([]);
              setWelcomeGuestName('');
              setWelcomeXUser('');
              setWelcomeRoomDetails('');
              setWelcomeCustomNote('');
              setWelcomeRef('REF: HNF-2026-INV');
              setGalleryGuestName('');
              setGalleryXUser('');
              setGalleryRoomType('');
              setGalleryRef('REF: HNF-ACCOM-2026');
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1"
            title="Reset Form Fields"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Form Controls (Left) + Live Canvas Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: EDIT CONTROLS FORM (4 COLS)                  */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#51867E]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#2C3744]">
                {activeCardType === 'keycard'
                  ? 'Key Card Settings'
                  : activeCardType === 'welcomecard'
                  ? 'Welcome Card Settings'
                  : 'Gallery Visualization Settings'}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EAF2F1] text-[#51867E] rounded-full uppercase">
              {activeCardType === 'keycard' ? 'PNG 16:9' : 'A4 Portrait (300 DPI)'}
            </span>
          </div>

          {/* Form Content: KEY CARD */}
          {activeCardType === 'keycard' && (
            <div className="space-y-4 text-xs">
              
              {/* Guest Name */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                  Guest Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={keyGuestName}
                    onChange={(e) => setKeyGuestName(e.target.value)}
                    placeholder="e.g. GAVIN ELIAN BASKORO"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Property / Location Selector */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                  Property / Location
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <select
                    value={keyLocationName}
                    onChange={(e) => handlePropertySelectForKeyCard(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none cursor-pointer"
                  >
                    <option value="Hanford Hotel & Resort Uluwatu, Bali">Hanford Hotel & Resort Uluwatu, Bali</option>
                    <option value="Hanford Eco Resort Jeju">Hanford Eco Resort Jeju</option>
                    <option value="Hanford Grand Hotel Jakarta">Hanford Grand Hotel Jakarta</option>
                    <option value="Hanford Eco Resort Santa Barbara">Hanford Eco Resort Santa Barbara</option>
                    <option value="Hanford Eco Resort Santorini">Hanford Eco Resort Santorini</option>
                    <option value="Hanford Grand Hotel Seoul">Hanford Grand Hotel Seoul</option>
                    <option value="Hanford Grand Hotel Tokyo">Hanford Grand Hotel Tokyo</option>
                    <option value="Hanford Resort & Spa Aspen">Hanford Resort & Spa Aspen</option>
                    {properties
                      .filter(
                        (p) =>
                          !['Uluwatu', 'Jeju', 'Jakarta', 'Santa Barbara', 'Santorini', 'Seoul', 'Tokyo', 'Aspen'].some(
                            (k) => p.name.includes(k)
                          )
                      )
                      .map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Short Location Tag on RFID Card */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                  RFID Card Location Label (Gold Header)
                </label>
                <input
                  type="text"
                  value={keyLocationShort}
                  onChange={(e) => setKeyLocationShort(e.target.value.toUpperCase())}
                  placeholder="e.g. ULUWATU or BALI"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 font-bold uppercase focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  Appears below &quot;HANFORD HOTEL &amp; RESORT&quot; on the smart card.
                </p>
              </div>

              {/* Room Numbers (Multi-room support for Villas) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Room Number(s)
                  </label>
                  <span className="text-[10px] text-[#51867E] font-bold">
                    {roomNumbers.length} Room{roomNumbers.length !== 1 ? 's' : ''} (Supports Villas)
                  </span>
                </div>

                {/* Current Room Badges */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
                  {roomNumbers.map((rm, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 text-[11px] font-bold shadow-xs"
                    >
                      <span>{rm}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRoom(idx)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer ml-1"
                        title="Remove room"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  {roomNumbers.length === 0 && (
                    <span className="text-slate-400 text-[11px] italic py-1">
                      No room numbers added yet. Add room below.
                    </span>
                  )}
                </div>

                {/* Add Custom Room Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRoomInput}
                    onChange={(e) => setCustomRoomInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRoom())}
                    placeholder="e.g. VILLA 01, SUITE 204"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-[11px] focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleAddRoom}
                    className="px-3 py-1.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Form Content: WELCOMING CARD */}
          {activeCardType === 'welcomecard' && (
            <div className="space-y-4 text-xs">
              
              {/* Guest Name & X Username */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    value={welcomeGuestName}
                    onChange={(e) => setWelcomeGuestName(e.target.value)}
                    placeholder="e.g. Agatha Madeleine"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    X / Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={welcomeXUser}
                    onChange={(e) => setWelcomeXUser(e.target.value)}
                    placeholder="e.g. @pendxnts"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Reference Stamp / Invoice Ref */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Reference Stamp / Invoice Ref
                  </label>
                  <span className="text-[10px] text-[#51867E] font-medium font-mono">
                    Matches Invoice #{getRawBookingCode(welcomeRef)}
                  </span>
                </div>
                <input
                  type="text"
                  value={welcomeRef}
                  onChange={(e) => setWelcomeRef(e.target.value)}
                  placeholder="e.g. REF: HNF-2026-U8821"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                />
                {/* Format Presets to exactly match Invoice / Card requirements */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Format:</span>
                  <button
                    type="button"
                    onClick={() => setWelcomeRef(`Ref No: ${getRawBookingCode(welcomeRef)}`)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                      welcomeRef.toLowerCase().startsWith('ref no:')
                        ? 'bg-[#51867E] text-white border-[#51867E]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Exact Ref No format matching Invoice"
                  >
                    Ref No: {getRawBookingCode(welcomeRef)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWelcomeRef(`Invoice No: ${getRawBookingCode(welcomeRef)}`)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                      welcomeRef.toLowerCase().startsWith('invoice no:')
                        ? 'bg-[#51867E] text-white border-[#51867E]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Exact Invoice No format"
                  >
                    Invoice No: {getRawBookingCode(welcomeRef)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWelcomeRef(`REF: ${getRawBookingCode(welcomeRef)}`)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                      welcomeRef.toLowerCase().startsWith('ref:') && !welcomeRef.toLowerCase().startsWith('ref no:')
                        ? 'bg-[#51867E] text-white border-[#51867E]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="REF prefix format"
                  >
                    REF: {getRawBookingCode(welcomeRef)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWelcomeRef(`#${getRawBookingCode(welcomeRef)}`)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                      welcomeRef.startsWith('#')
                        ? 'bg-[#51867E] text-white border-[#51867E]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Hash prefix format"
                  >
                    #{getRawBookingCode(welcomeRef)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWelcomeRef(getRawBookingCode(welcomeRef))}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                      welcomeRef === getRawBookingCode(welcomeRef)
                        ? 'bg-[#51867E] text-white border-[#51867E]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Plain ID format"
                  >
                    {getRawBookingCode(welcomeRef)}
                  </button>
                </div>
              </div>

              {/* Property Selector */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                  Property Name
                </label>
                <select
                  value={welcomeProperty}
                  onChange={(e) => handlePropertySelectForWelcome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none cursor-pointer"
                >
                  <option value="Hanford Hotel & Resort Uluwatu, Bali">Hanford Hotel & Resort Uluwatu, Bali</option>
                  <option value="Hanford Eco Resort Jeju">Hanford Eco Resort Jeju</option>
                  <option value="Hanford Grand Hotel Jakarta">Hanford Grand Hotel Jakarta</option>
                  <option value="Hanford Eco Resort Santa Barbara">Hanford Eco Resort Santa Barbara</option>
                  <option value="Hanford Eco Resort Santorini">Hanford Eco Resort Santorini</option>
                  <option value="Hanford Grand Hotel Seoul">Hanford Grand Hotel Seoul</option>
                  <option value="Hanford Grand Hotel Tokyo">Hanford Grand Hotel Tokyo</option>
                  <option value="Hanford Resort & Spa Aspen">Hanford Resort & Spa Aspen</option>
                  {properties
                    .filter(
                      (p) =>
                        !['Uluwatu', 'Jeju', 'Jakarta', 'Santa Barbara', 'Santorini', 'Seoul', 'Tokyo', 'Aspen'].some(
                          (k) => p.name.includes(k)
                        )
                    )
                    .map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Booking Type & Room Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Booking Type
                  </label>
                  <select
                    value={welcomeBookingType}
                    onChange={(e) => setWelcomeBookingType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none cursor-pointer"
                  >
                    <option value="Room Reservation">Room Reservation</option>
                    <option value="Room & Event">Room &amp; Event</option>
                    <option value="Event & Catering">Event &amp; Catering</option>
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Room & Meeting">Room &amp; Meeting</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Room Category
                  </label>
                  <input
                    type="text"
                    value={welcomeRoomDetails}
                    onChange={(e) => setWelcomeRoomDetails(e.target.value)}
                    placeholder="e.g. Private Pool Villa"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Stay Dates & Event Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Stay Dates
                  </label>
                  <input
                    type="text"
                    value={welcomeStayDates}
                    onChange={(e) => setWelcomeStayDates(e.target.value)}
                    placeholder="e.g. 2026-09-01 to 2026-09-02 (1 night)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none text-[11px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Event Date
                  </label>
                  <input
                    type="text"
                    value={welcomeEventDate}
                    onChange={(e) => setWelcomeEventDate(e.target.value)}
                    placeholder="e.g. 2026-09-01 or N/A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none text-[11px]"
                  />
                </div>
              </div>

              {/* Hero Image URL */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                  Hero Property Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={welcomeHeroImage}
                    onChange={(e) => setWelcomeHeroImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Custom Concierge Welcome Message */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                  Custom Concierge Welcome Note
                </label>
                <textarea
                  rows={2}
                  value={welcomeCustomNote}
                  onChange={(e) => setWelcomeCustomNote(e.target.value)}
                  placeholder="Leave empty for official default Hanford concierge greeting..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-[11px] focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                />
              </div>

            </div>
          )}

          {/* Form Content: ACCOMMODATION GALLERY (NEW FEATURE) */}
          {activeCardType === 'gallery' && (
            <div className="space-y-4 text-xs">
              
              {/* Judul & Room Type Info Header */}
              <div className="p-3 bg-[#EAF2F1] border border-[#CDE1DC] rounded-xl space-y-1">
                <div className="font-bold text-[#2D5A53] text-xs uppercase flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Judul: RESERVED ACCOMMODATION (English)</span>
                </div>
                <div className="text-[11px] text-[#3A635D]">
                  Room Type dicantumkan tepat di bawah judul pada dokumen A4 PNG visual gallery.
                </div>
              </div>

              {/* Room Type (Bawah Judul) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                  Room Type (Tercantum di Bawah Judul)
                </label>
                <div className="relative">
                  <Bed className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={galleryRoomType}
                    onChange={(e) => setGalleryRoomType(e.target.value)}
                    placeholder="e.g. Private Pool Villa • 3 Bedroom Ocean Suite"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Guest Name & X Username */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Guest Full Name
                  </label>
                  <input
                    type="text"
                    value={galleryGuestName}
                    onChange={(e) => setGalleryGuestName(e.target.value)}
                    placeholder="e.g. Agatha Madeleine"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    X / Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={galleryXUser}
                    onChange={(e) => setGalleryXUser(e.target.value)}
                    placeholder="e.g. @pendxnts"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Reference Stamp / Invoice Ref */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Reference Stamp / Invoice Ref
                  </label>
                  <span className="text-[10px] text-[#51867E] font-medium font-mono">
                    Matches Invoice #{getRawBookingCode(galleryRef)}
                  </span>
                </div>
                <input
                  type="text"
                  value={galleryRef}
                  onChange={(e) => setGalleryRef(e.target.value)}
                  placeholder="e.g. REF: HNF-2026-U8821"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                />
                {/* Format Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Format:</span>
                  <button
                    type="button"
                    onClick={() => setGalleryRef(`Ref No: ${getRawBookingCode(galleryRef)}`)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                      galleryRef.toLowerCase().startsWith('ref no:')
                        ? 'bg-[#51867E] text-white border-[#51867E]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Exact Ref No format matching Invoice"
                  >
                    Ref No: {getRawBookingCode(galleryRef)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryRef(`Invoice No: ${getRawBookingCode(galleryRef)}`)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                      galleryRef.toLowerCase().startsWith('invoice no:')
                        ? 'bg-[#51867E] text-white border-[#51867E]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Exact Invoice No format"
                  >
                    Invoice No: {getRawBookingCode(galleryRef)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryRef(`REF: ${getRawBookingCode(galleryRef)}`)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                      galleryRef.toLowerCase().startsWith('ref:') && !galleryRef.toLowerCase().startsWith('ref no:')
                        ? 'bg-[#51867E] text-white border-[#51867E]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="REF prefix format"
                  >
                    REF: {getRawBookingCode(galleryRef)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryRef(`#${getRawBookingCode(galleryRef)}`)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                      galleryRef.startsWith('#')
                        ? 'bg-[#51867E] text-white border-[#51867E]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Hash prefix format"
                  >
                    #{getRawBookingCode(galleryRef)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryRef(getRawBookingCode(galleryRef))}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                      galleryRef === getRawBookingCode(galleryRef)
                        ? 'bg-[#51867E] text-white border-[#51867E]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="Plain ID format"
                  >
                    {getRawBookingCode(galleryRef)}
                  </button>
                </div>
              </div>

              {/* Property & Stay Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Property Location
                  </label>
                  <select
                    value={galleryProperty}
                    onChange={(e) => handlePropertySelectForGallery(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none cursor-pointer"
                  >
                    <option value="Hanford Hotel & Resort Uluwatu, Bali">Hanford Hotel & Resort Uluwatu, Bali</option>
                    <option value="Hanford Eco Resort Jeju">Hanford Eco Resort Jeju</option>
                    <option value="Hanford Grand Hotel Jakarta">Hanford Grand Hotel Jakarta</option>
                    <option value="Hanford Eco Resort Santa Barbara">Hanford Eco Resort Santa Barbara</option>
                    <option value="Hanford Eco Resort Santorini">Hanford Eco Resort Santorini</option>
                    <option value="Hanford Grand Hotel Seoul">Hanford Grand Hotel Seoul</option>
                    <option value="Hanford Grand Hotel Tokyo">Hanford Grand Hotel Tokyo</option>
                    <option value="Hanford Resort & Spa Aspen">Hanford Resort & Spa Aspen</option>
                    {properties
                      .filter(
                        (p) =>
                          !['Uluwatu', 'Jeju', 'Jakarta', 'Santa Barbara', 'Santorini', 'Seoul', 'Tokyo', 'Aspen'].some(
                            (k) => p.name.includes(k)
                          )
                      )
                      .map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Stay Dates
                  </label>
                  <input
                    type="text"
                    value={galleryStayDates}
                    onChange={(e) => setGalleryStayDates(e.target.value)}
                    placeholder="e.g. 2026-09-01 to 2026-09-02 (1 night)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none text-[11px]"
                  />
                </div>
              </div>

              {/* Photo Collection Preset Loaders */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Preset 15-Foto Hotel
                  </label>
                  <span className="text-[10px] text-[#51867E] font-bold">
                    {galleryPhotos.length}/15 Foto Aktif
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGalleryPhotos(PRESET_COLLECTIONS.uluwatu)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10.5px] font-semibold cursor-pointer transition-colors"
                  >
                    🏝️ 15 Foto Uluwatu
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryPhotos(PRESET_COLLECTIONS.jeju)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10.5px] font-semibold cursor-pointer transition-colors"
                  >
                    ⛰️ 15 Foto Jeju
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryPhotos(PRESET_COLLECTIONS.santorini)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10.5px] font-semibold cursor-pointer transition-colors"
                  >
                    🏛️ 15 Foto Santorini
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryPhotos(DEFAULT_GALLERY_PHOTOS)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10.5px] font-semibold cursor-pointer transition-colors"
                  >
                    ✨ Default Pack (15 Foto)
                  </button>
                </div>
              </div>

              {/* Upload Multiple Local Photos (Up to 15) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                  Upload Foto dari Perangkat (Bisa Pilih hingga 15 File)
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="hanford-gallery-file-input"
                />

                <label
                  htmlFor="hanford-gallery-file-input"
                  className="w-full py-2.5 px-3 border-2 border-dashed border-[#51867E]/40 hover:border-[#51867E] bg-[#51867E]/5 hover:bg-[#51867E]/10 text-[#51867E] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all font-bold text-[11px]"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pilih &amp; Upload Foto (PNG/JPG, Maks 15)</span>
                </label>
              </div>

              {/* Add Single Image by URL */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                  Tambah Foto Melalui Link URL
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPhotoTitle}
                      onChange={(e) => setNewPhotoTitle(e.target.value)}
                      placeholder="Judul / Keterangan Foto..."
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#51867E] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoByUrl}
                      disabled={!newPhotoUrl.trim() || galleryPhotos.length >= 15}
                      className="px-3 py-1.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Manage Active Gallery Photos List (Reorder, Edit Title, Delete) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
                    Daftar Foto Galeri ({galleryPhotos.length}/15)
                  </label>
                  {galleryPhotos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setGalleryPhotos([])}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      Hapus Semua
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {galleryPhotos.map((photo, idx) => (
                    <div
                      key={photo.id || idx}
                      className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[10px] text-[#51867E]">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={photo.title}
                            onChange={(e) => handleUpdatePhotoTitle(idx, e.target.value)}
                            className="w-full px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#51867E]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMovePhoto(idx, 'up')}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                          title="Pindah ke Atas"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === galleryPhotos.length - 1}
                          onClick={() => handleMovePhoto(idx, 'down')}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                          title="Pindah ke Bawah"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1 hover:bg-rose-100 rounded text-rose-500 cursor-pointer"
                          title="Hapus Foto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {galleryPhotos.length === 0 && (
                    <div className="p-4 text-center text-slate-400 italic text-[11px] bg-slate-50 rounded-xl">
                      Belum ada foto. Upload foto atau klik tombol Preset di atas untuk memuat 10 foto.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Action Download Button */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPng}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#51867E] to-[#3A635D] hover:from-[#437069] hover:to-[#2D4E49] text-white font-bold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2 uppercase tracking-wider text-xs cursor-pointer transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Rendering High-Res PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>
                    Download {activeCardType === 'keycard' ? 'Key Card' : activeCardType === 'welcomecard' ? 'Welcoming Card (A4)' : 'Accommodation Gallery (A4)'} as PNG
                  </span>
                </>
              )}
            </button>

            {/* Notification Messages */}
            {exportSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{exportSuccess}</span>
              </div>
            )}

            {exportError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{exportError}</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: LIVE CANVAS PREVIEW (8 COLS)               */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 bg-slate-900/5 rounded-2xl border border-slate-200 p-4 sm:p-6 flex flex-col items-center justify-center space-y-4">
          
          <div className="flex items-center justify-between w-full text-xs text-slate-500 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-[#2C3744]">
                Live Preview (Web &amp; Mobile Responsive Viewport)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">
              {activeCardType === 'gallery' ? 'A4 Visual Gallery' : activeCardType === 'welcomecard' ? 'A4 Portrait' : '16:9 RFID Layout'}
            </span>
          </div>

          {/* Active Canvas Display Wrapped in Mobile-Friendly Responsive Viewport */}
          <div className="w-full flex items-center justify-center py-2">
            {activeCardType === 'keycard' ? (
              <ResponsiveCardViewport nativeWidth={960}>
                <div className="w-[960px] max-w-[960px]">
                  <GuestKeyCardCanvas
                    guestName={keyGuestName}
                    roomNumbers={roomNumbers}
                    locationName={keyLocationName}
                    locationShort={keyLocationShort}
                    canvasRef={keyCardRef}
                    id="hanford-key-card-canvas"
                  />
                </div>
              </ResponsiveCardViewport>
            ) : activeCardType === 'welcomecard' ? (
              <ResponsiveCardViewport nativeWidth={960}>
                <div className="w-[960px] max-w-[960px]">
                  <WelcomingCardCanvas
                    guestName={welcomeGuestName}
                    xUsername={welcomeXUser}
                    propertyName={welcomeProperty}
                    bookingType={welcomeBookingType}
                    stayDates={welcomeStayDates}
                    eventDate={welcomeEventDate}
                    heroImageUrl={welcomeHeroImage}
                    roomDetails={welcomeRoomDetails}
                    customWelcomeNote={welcomeCustomNote}
                    bookingRef={welcomeRef}
                    canvasRef={welcomeCardRef}
                    id="hanford-welcome-card-canvas"
                    fixedWidth={true}
                  />
                </div>
              </ResponsiveCardViewport>
            ) : (
              <ResponsiveCardViewport nativeWidth={960}>
                <div className="w-[960px] max-w-[960px]">
                  <AccommodationGalleryCanvas
                    guestName={galleryGuestName}
                    xUsername={galleryXUser}
                    propertyName={galleryProperty}
                    roomType={galleryRoomType}
                    stayDates={galleryStayDates}
                    bookingRef={galleryRef}
                    photos={galleryPhotos}
                    canvasRef={galleryCardRef}
                    id="hanford-gallery-card-canvas"
                    fixedWidth={true}
                  />
                </div>
              </ResponsiveCardViewport>
            )}
          </div>

          {/* Hint / Helper Tip */}
          <div className="text-center text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#51867E]" />
            <span>
              Dokumen diformat dengan tipografi resmi kemewahan Hanford. Klik &quot;Download&quot; untuk mengunduh berkas PNG kualitas tinggi ukuran A4.
            </span>
          </div>
        </div>

      </div>

      {/* Offscreen Hidden Containers for Pixel-Perfect 960px Desktop & A4 Export on Mobile & Desktop */}
      <div
        className="fixed -left-[9999px] top-0 pointer-events-none opacity-100 z-[-9999] overflow-hidden"
        aria-hidden="true"
      >
        {/* Offscreen Accommodation Gallery (A4 2480x3508 export) */}
        <div className="w-[960px] bg-white text-[#1E293B]">
          <AccommodationGalleryCanvas
            guestName={galleryGuestName}
            xUsername={galleryXUser}
            propertyName={galleryProperty}
            roomType={galleryRoomType}
            stayDates={galleryStayDates}
            bookingRef={galleryRef}
            photos={galleryPhotos}
            canvasRef={galleryExportRef}
            id="hanford-gallery-card-export"
            fixedWidth={true}
          />
        </div>

        {/* Offscreen Welcoming Card */}
        <div className="w-[960px] bg-white text-[#1E293B]">
          <WelcomingCardCanvas
            guestName={welcomeGuestName}
            xUsername={welcomeXUser}
            propertyName={welcomeProperty}
            bookingType={welcomeBookingType}
            stayDates={welcomeStayDates}
            eventDate={welcomeEventDate}
            heroImageUrl={welcomeHeroImage}
            roomDetails={welcomeRoomDetails}
            customWelcomeNote={welcomeCustomNote}
            bookingRef={welcomeRef}
            canvasRef={welcomeExportRef}
            id="hanford-welcome-card-export"
            fixedWidth={true}
          />
        </div>

        {/* Offscreen Key Card */}
        <div className="w-[1000px] bg-[#101726]">
          <GuestKeyCardCanvas
            guestName={keyGuestName}
            roomNumbers={roomNumbers}
            locationName={keyLocationName}
            locationShort={keyLocationShort}
            canvasRef={keyExportRef}
            id="hanford-key-card-export"
          />
        </div>
      </div>
    </div>
  );
};
