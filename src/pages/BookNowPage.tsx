import React, { useState, useEffect, useRef } from 'react';
import { Property, BookingInquiry, BookOption, EventAddonOption } from '../types';
import { fetchLocations, submitBooking } from '../services/dataService';
import { validatePropertyCoupon } from '../utils/couponUtils';
import { getBookingCategoryLabel } from '../utils/bookingUtils';
import { PropertySearchSelect } from '../components/PropertySearchSelect';
import { toPng } from 'html-to-image';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  ExternalLink,
  Hotel,
  PartyPopper,
  Layers,
  AtSign,
  User,
  Users,
  Utensils,
  Download,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  ShieldCheck,
  DollarSign,
  Briefcase,
  Tag,
  MapPin
} from 'lucide-react';

interface BookNowPageProps {
  initialPropertySlug?: string;
  onNavigate: (path: string) => void;
}

export const BookNowPage: React.FC<BookNowPageProps> = ({ initialPropertySlug, onNavigate }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Form State
  const [formData, setFormData] = useState<BookingInquiry>({
    propertySlug: initialPropertySlug || '',
    propertyName: '',
    guestName: '',
    xUsername: '',
    businessName: '',
    totalGuests: undefined,
    bookOption: 'room',
    accommodationOption: 'without',
    venueRentalRate: 'full_day',
    standardRooms: undefined,
    deluxeRooms: undefined,
    presidentialSuites: undefined,
    privateVillas: undefined,
    roomsCount: undefined,
    eventAttendees: undefined,
    eventAddons: '' as EventAddonOption,
    cateringPax: undefined,
    checkInDate: '',
    checkOutDate: '',
    eventDate: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingId: string;
    inquiry: BookingInquiry;
    property: Property;
    nights: number;
    roomSubtotal: number;
    eventSubtotal: number;
    taxAmount: number;
    grandTotal: number;
    source?: string;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const exportInvoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLocations().then((res) => {
      setProperties(res.data);
      setLoadingLocations(false);

      if (initialPropertySlug) {
        const rawTarget = decodeURIComponent(initialPropertySlug).toLowerCase().trim();

        // 1. Exact slug match
        let matched = res.data.find(
          (p) => p.slug.toLowerCase() === rawTarget
        );

        // 2. Exact property name match
        if (!matched) {
          matched = res.data.find(
            (p) => p.name.toLowerCase() === rawTarget
          );
        }

        // 3. Name or slug partial match
        if (!matched) {
          matched = res.data.find(
            (p) =>
              p.name.toLowerCase().includes(rawTarget) ||
              rawTarget.includes(p.name.toLowerCase()) ||
              p.slug.toLowerCase().includes(rawTarget) ||
              rawTarget.includes(p.slug.toLowerCase())
          );
        }

        // 4. Keyword / Location / Address word overlap
        if (!matched) {
          const targetWords = rawTarget
            .split(/[\s,:-]+/)
            .filter((w) => w.length > 2 && !['and', 'the', 'resort', 'hotel', 'sanctuary', 'hanford', 'usa', 'california'].includes(w));

          if (targetWords.length > 0) {
            matched = res.data.find((p) => {
              const propText = `${p.name} ${p.address || ''} ${p.country || ''}`.toLowerCase();
              return targetWords.some((word) => propText.includes(word));
            });
          }
        }

        // 5. Fallback: match any city/location word
        if (!matched) {
          matched = res.data.find((p) => {
            const propText = `${p.name} ${p.address || ''} ${p.country || ''}`.toLowerCase();
            return rawTarget.split(/[\s,:-]+/).some((w) => w.length > 3 && propText.includes(w));
          });
        }

        if (matched) {
          setFormData((prev) => ({
            ...prev,
            propertySlug: matched.slug,
            propertyName: matched.name
          }));
        }
      }
    });
  }, [initialPropertySlug]);

  const selectedProperty = properties.find((p) => p.slug === formData.propertySlug);

  const propNameLower = (selectedProperty?.name || formData.propertyName || '').toLowerCase();

  const isEcoResort = selectedProperty
    ? Boolean(selectedProperty.isEcoResort || propNameLower.includes('eco resort'))
    : propNameLower.includes('eco resort');

  const isHotelAndResort = propNameLower.includes('hotel & resort') || propNameLower.includes('hotels & resort') || (propNameLower.includes('resort') && !isEcoResort);

  const isGrandHotel = propNameLower.includes('grand hotel') && !propNameLower.includes('resort');

  // Private Villa is available for Eco Resort AND Hotel & Resort (only inactive for Grand Hotel)
  const hasPrivateVilla = !isGrandHotel;

  const propertyTypeLabel = isEcoResort ? 'Eco Resort' : isHotelAndResort ? 'Hotel & Resort' : 'Grand Hotel';

  const priceStandard = selectedProperty?.priceStandard || selectedProperty?.priceFrom || 850;
  const priceDeluxe = selectedProperty?.priceDeluxe || Math.round(priceStandard * 1.45);
  const pricePresidential = selectedProperty?.pricePresidential || Math.round(priceStandard * 3.8);
  const pricePrivateVilla = hasPrivateVilla
    ? (selectedProperty?.pricePrivateVilla || Math.round(priceStandard * 5.2))
    : undefined;

  const priceMeetingRoom = selectedProperty?.priceMeetingRoom || 120;
  const priceEventHall = selectedProperty?.priceEventHall || 3200;
  const priceCateringPerPax = selectedProperty?.priceCateringPerPax || 75;

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = getTodayString();

  const handlePropertyChange = (slug: string) => {
    if (!slug) {
      setFormData((prev) => ({
        ...prev,
        propertySlug: '',
        propertyName: ''
      }));
      return;
    }
    const matched = properties.find((p) => p.slug === slug);
    const matchedNameLower = (matched ? matched.name : slug).toLowerCase();
    const matchedIsGrand = matchedNameLower.includes('grand hotel') && !matchedNameLower.includes('resort');
    const matchedHasVilla = !matchedIsGrand;

    setFormData((prev) => {
      const updatedPrivateVillas = matchedHasVilla ? prev.privateVillas : undefined;
      const total =
        (prev.standardRooms || 0) +
        (prev.deluxeRooms || 0) +
        (prev.presidentialSuites || 0) +
        (updatedPrivateVillas || 0);

      return {
        ...prev,
        propertySlug: slug,
        propertyName: matched ? matched.name : slug,
        privateVillas: updatedPrivateVillas,
        roomsCount: total > 0 ? total : undefined
      };
    });
  };

  const handleRoomCountChange = (
    field: 'standardRooms' | 'deluxeRooms' | 'presidentialSuites' | 'privateVillas',
    val: number | undefined
  ) => {
    const parsed = val === undefined || isNaN(val as number) ? undefined : Math.max(0, val);
    setFormData((prev) => {
      const updated = { ...prev, [field]: parsed };
      const total =
        (updated.standardRooms || 0) +
        (updated.deluxeRooms || 0) +
        (updated.presidentialSuites || 0) +
        (updated.privateVillas || 0);
      return { ...updated, roomsCount: total > 0 ? total : undefined };
    });
  };

  // Helper: venue rental multiplier (Half Day = 40%, Full Day = 100%, Full Board = 120%)
  const getVenueMultiplier = (rate?: string) => {
    if (rate === 'half_day') return 0.4;
    if (rate === 'full_board') return 1.2;
    return 1.0; // full_day
  };

  const getVenueRateLabel = (rate?: string) => {
    if (rate === 'half_day') return 'HALF DAY (Max 4–5 hrs)';
    if (rate === 'full_board') return 'FULL BOARD (Max 10–12 hrs)';
    return 'FULL DAY (Max 8–9 hrs)';
  };

  // Calculate nights
  const calculateNights = (inDate?: string, outDate?: string): number => {
    if (!inDate || !outDate) return 1;
    const start = new Date(inDate);
    const end = new Date(outDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const currentNights = calculateNights(formData.checkInDate, formData.checkOutDate);

  // Condition to show room stay selection & checkin/checkout dates
  const showRoomsAndDates =
    formData.bookOption === 'room' ||
    formData.bookOption === 'both' ||
    formData.bookOption === 'room_meeting' ||
    (formData.bookOption === 'meeting' && formData.accommodationOption === 'with');

  // Condition to show venue settings (attendees, venue rate, etc)
  const showVenueSettings =
    formData.bookOption === 'event' ||
    formData.bookOption === 'both' ||
    formData.bookOption === 'meeting' ||
    formData.bookOption === 'room_meeting';

  // Effective rate per pax for catering & meeting based on selected package rate
  const cateringMultiplier = getVenueMultiplier(formData.venueRentalRate);
  const effectiveCateringPerPax = Math.round(priceCateringPerPax * cateringMultiplier);
  const effectiveMeetingRoomRate = Math.round(priceMeetingRoom * cateringMultiplier);

  // Calculate live room subtotal
  let currentRoomSubtotal = 0;
  if (showRoomsAndDates) {
    const stdCost = (formData.standardRooms || 0) * priceStandard;
    const delCost = (formData.deluxeRooms || 0) * priceDeluxe;
    const presCost = (formData.presidentialSuites || 0) * pricePresidential;
    const villaCost = isEcoResort ? (formData.privateVillas || 0) * (pricePrivateVilla || 0) : 0;
    currentRoomSubtotal = (stdCost + delCost + presCost + villaCost) * currentNights;
  }

  // Calculate live event / meeting subtotal
  let currentEventSubtotal = 0;
  if (showVenueSettings) {
    if (formData.bookOption === 'meeting') {
      currentEventSubtotal = Math.round((formData.eventAttendees || 1) * effectiveMeetingRoomRate);
    } else {
      const venueCost = priceEventHall;
      const hasCatering = formData.eventAddons === 'catering' || formData.eventAddons === 'both';
      const cateringCost = hasCatering
        ? (formData.cateringPax || formData.eventAttendees || 1) * effectiveCateringPerPax
        : 0;
      currentEventSubtotal = venueCost + cateringCost;
    }
  }

  const currentRawSubtotal = currentRoomSubtotal + currentEventSubtotal;

  // Rates snapshot string
  const snapshotRatesArr: string[] = [];
  if (showRoomsAndDates) {
    if (formData.standardRooms) snapshotRatesArr.push(`Standard: $${priceStandard}/night`);
    if (formData.deluxeRooms) snapshotRatesArr.push(`Deluxe: $${priceDeluxe}/night`);
    if (formData.presidentialSuites) snapshotRatesArr.push(`Presidential: $${pricePresidential}/night`);
    if (isEcoResort && formData.privateVillas) snapshotRatesArr.push(`Villa: $${pricePrivateVilla}/night`);
  }
  if (showVenueSettings) {
    if (formData.bookOption === 'meeting') {
      snapshotRatesArr.push(`Meeting Package (${getVenueRateLabel(formData.venueRentalRate)}): $${effectiveMeetingRoomRate}/pax`);
    } else {
      snapshotRatesArr.push(`Event Hall: $${priceEventHall}/event`);
      if (formData.eventAddons === 'catering' || formData.eventAddons === 'both') {
        snapshotRatesArr.push(`Catering (${getVenueRateLabel(formData.venueRentalRate)}): $${effectiveCateringPerPax}/pax`);
      }
    }
  }
  const itemRatesSnapshotStr = snapshotRatesArr.join(' | ') || `Standard: $${priceStandard}/night`;

  // Discount Code & Calculation (Validated against selected property's active coupons)
  const couponResult = validatePropertyCoupon(selectedProperty, formData.discountCode);
  const appliedDiscountPercent = couponResult.percent;
  const appliedDiscountCode = couponResult.isValid
    ? couponResult.matchedCode!
    : (formData.discountCode?.trim() ? formData.discountCode.trim().toUpperCase() : '');
  const currentDiscountAmount = appliedDiscountPercent > 0 ? Math.round(currentRawSubtotal * (appliedDiscountPercent / 100)) : 0;
  const currentSubtotalBeforeTax = Math.max(0, currentRawSubtotal - currentDiscountAmount);
  const currentTaxAmount = Math.round(currentSubtotalBeforeTax * 0.1);
  const currentGrandTotal = currentSubtotalBeforeTax + currentTaxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validations
    if (!formData.guestName || !formData.xUsername || !formData.propertySlug) {
      setErrorMessage(
        'Please complete all required guest fields: Full Name, X Username, and Hotel Location.'
      );
      return;
    }

    if (showRoomsAndDates) {
      const totalRooms =
        (formData.standardRooms || 0) +
        (formData.deluxeRooms || 0) +
        (formData.presidentialSuites || 0) +
        (formData.privateVillas || 0);

      if (totalRooms <= 0) {
        setErrorMessage('Please select at least 1 room in standard, deluxe, suite, or villa.');
        return;
      }
      if (!formData.checkInDate || !formData.checkOutDate) {
        setErrorMessage('Please specify valid Check-In and Check-Out dates for room stay.');
        return;
      }
      if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
        setErrorMessage('Check-Out date must be after Check-In date.');
        return;
      }
    }

    if (showVenueSettings) {
      if (!formData.eventDate) {
        setErrorMessage('Please select an Event or Meeting date.');
        return;
      }
      if (!formData.eventAttendees || formData.eventAttendees <= 0) {
        setErrorMessage('Please enter the number of attendees for your venue booking.');
        return;
      }
      if (formData.bookOption === 'meeting' && !formData.venueRentalRate) {
        setErrorMessage('Please select a Venue Rental Rate.');
        return;
      }
      if (
        (formData.bookOption === 'event' || formData.bookOption === 'both') &&
        !formData.eventAddons
      ) {
        setErrorMessage('Please select a Catering Add-On option.');
        return;
      }
      if (
        (formData.bookOption === 'event' || formData.bookOption === 'both') &&
        (formData.eventAddons === 'catering' || formData.eventAddons === 'both') &&
        (!formData.cateringPax || formData.cateringPax <= 0)
      ) {
        setErrorMessage('Please specify the catering pax count.');
        return;
      }
    }

    // Generate Booking ID
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const bookingId = `HNF-2026-${randomHex}`;

    const submissionPayload: BookingInquiry = {
      ...formData,
      bookingId,
      roomSubtotal: currentRoomSubtotal,
      eventSubtotal: currentEventSubtotal,
      priceStandardRoom: priceStandard,
      priceDeluxeRoom: priceDeluxe,
      pricePresidentialSuite: pricePresidential,
      pricePrivateVilla: isEcoResort ? pricePrivateVilla : undefined,
      priceMeetingRoom: effectiveMeetingRoomRate,
      priceEventHall: priceEventHall,
      priceCateringPerPax: effectiveCateringPerPax,
      itemRatesSnapshot: itemRatesSnapshotStr,
      discountCode: appliedDiscountCode || undefined,
      discountPercent: appliedDiscountPercent || undefined,
      discountAmount: currentDiscountAmount || undefined,
      subtotalBeforeDiscount: currentRawSubtotal,
      subtotalBeforeTax: currentSubtotalBeforeTax,
      taxAmount: currentTaxAmount,
      totalAmount: currentGrandTotal,
      numberOfNights: showRoomsAndDates ? currentNights : 0,
      paymentStatus: 'UNPAID'
    };

    setSubmitting(true);
    const result = await submitBooking(submissionPayload);
    setSubmitting(false);

    if (result.success) {
      setConfirmedBooking({
        bookingId,
        inquiry: submissionPayload,
        property: selectedProperty || {
          id: 'selected',
          slug: formData.propertySlug,
          name: formData.propertyName,
          tagline: 'Hanford Luxury Destination',
          address: 'Exclusive Location',
          country: 'International',
          continent: 'Global',
          status: 'Live',
          detailsHtml: '',
          driveFolderUrl: '',
          heroImage: '',
          galleryImages: [],
          priceFrom: priceStandard,
          rating: 4.98,
          amenities: []
        },
        nights: showRoomsAndDates ? currentNights : 0,
        roomSubtotal: currentRoomSubtotal,
        eventSubtotal: currentEventSubtotal,
        taxAmount: currentTaxAmount,
        grandTotal: currentGrandTotal,
        source: result.source
      });
    } else {
      setErrorMessage(result.message || 'Failed to register booking. Please try again.');
    }
  };

  const handleDownloadInvoice = async () => {
    const targetEl = exportInvoiceRef.current || invoiceRef.current;
    if (!targetEl) return;
    try {
      setIsGeneratingImage(true);
      const dataUrl = await toPng(targetEl, {
        cacheBust: true,
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
        skipFonts: true,
        fontEmbedCSS: ''
      });
      const link = document.createElement('a');
      link.download = `Hanford_Invoice_${confirmedBooking?.bookingId || 'HNF-2026'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Invoice image download error:', err);
      alert('Could not generate invoice image. You can take a screenshot or try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const SPREADSHEET_URL =
    'https://docs.google.com/spreadsheets/d/1a2WN_AqaV9WS15h-37FDCyVV_ZpLB1IaBDbvb2VYzeU/edit?gid=0#gid=0';

  return (
    <div className="bg-[#FFFFFF] text-[#2C3744] pt-20 sm:pt-28 pb-16 sm:pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-[#3A4F67] text-[#EAF2F1] rounded-full text-[9px] sm:text-[10px] font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase shadow border border-[#88B2AB]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#88B2AB]" />
            <span>CENTRAL RESERVATIONS & BOOKING SYSTEM</span>
          </div>
          <h1 className="font-serif italic text-3xl sm:text-6xl text-[#3A4F67] font-light">
            Book Your Experience
          </h1>
          <p className="text-xs sm:text-sm text-[#2C3744] max-w-xl mx-auto font-light leading-relaxed">
            Real-time hotel booking application.
            <span className="block text-[10px] sm:text-[11px] text-[#3A4F67] font-medium italic mt-0.5">
              Sistem reservasi hotel real-time.
            </span>
          </p>

          {/* Remove Live Central Register button per user request */}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* INVOICE & CONFIRMATION VIEW */}
        {/* ------------------------------------------------------------------ */}
        {confirmedBooking ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Download Action Bar */}
            <div className="bg-[#3A4F67] p-4 rounded-2xl border border-[#88B2AB]/30 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2.5 bg-[#51867E] text-white rounded-xl shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif italic text-base sm:text-lg text-white">Booking Registered Successfully</h3>
                  <p className="text-[11px] text-[#EAF2F1]">
                    Invoice saved to Central Register. Download your PNG invoice below.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDownloadInvoice}
                  disabled={isGeneratingImage}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-[#88B2AB]/40"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGeneratingImage ? 'Generating PNG...' : 'DOWNLOAD INVOICE (PNG)'}</span>
                </button>

                <button
                  onClick={() => setConfirmedBooking(null)}
                  className="px-4 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer"
                >
                  New Booking
                </button>
              </div>
            </div>

            {/* Downloadable Invoice Card */}
            <div
              ref={invoiceRef}
              className="bg-[#FFFFFF] border-2 border-[#3A4F67]/30 rounded-2xl p-4 sm:p-8 shadow-2xl space-y-3 sm:space-y-4 relative overflow-hidden w-full text-left"
            >
              {/* Invoice Header */}
              <div className="border-b border-slate-200 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-[#3A4F67]">
                      HANFORD
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#51867E] inline-block"></span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#51867E] uppercase">
                    HOTELS & RESORTS • CENTRAL RESERVATIONS
                  </div>
                  <div className="text-xs sm:text-sm italic font-serif text-slate-500 pt-0.5">
                    An Elevated Way of Staying
                  </div>
                  <a
                    href="https://x.com/Hanford_HnR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#51867E] pt-0.5 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-slate-700 shrink-0" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="underline font-medium">x.com/Hanford_HnR</span>
                  </a>
                </div>

                <div className="flex flex-col sm:items-end space-y-1">
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider inline-block self-start sm:self-auto">
                    OFFICIAL RECEIPT / INVOICE
                  </span>
                  <div className="text-sm sm:text-base font-bold text-[#3A4F67]">
                    Invoice No: <span className="font-mono text-[#3A4F67]">{confirmedBooking.bookingId}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Date Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  <div className="px-3 py-1 bg-amber-50/80 border border-amber-500/80 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs mt-1 self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>UNPAID - INVOICE PENDING</span>
                  </div>
                </div>
              </div>

              {/* Guest Details & Property / Location Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-3 text-xs">
                {/* Guest Details */}
                <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider block">
                    GUEST DETAILS
                  </span>
                  <div className="font-bold text-sm text-[#3A4F67] uppercase tracking-wide">
                    {confirmedBooking.inquiry.guestName || 'TREVOR'}
                  </div>
                  <div className="space-y-0.5 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 fill-current text-slate-700 shrink-0" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>X Handle: <strong className="text-[#51867E]">@{confirmedBooking.inquiry.xUsername ? confirmedBooking.inquiry.xUsername.replace(/^@/, '') : 'def'}</strong></span>
                    </div>
                    {confirmedBooking.inquiry.businessName && confirmedBooking.inquiry.businessName.trim() !== '' && (
                      <div>Business Name: <strong className="text-slate-700">{confirmedBooking.inquiry.businessName.trim()}</strong></div>
                    )}
                    {confirmedBooking.inquiry.guestEmail && (
                      <div>Email: <span className="text-slate-600">{confirmedBooking.inquiry.guestEmail}</span></div>
                    )}
                  </div>
                </div>

                {/* Property / Location Details */}
                <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider block">
                    PROPERTY / LOCATION
                  </span>
                  <div className="font-bold text-sm text-[#3A4F67] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#51867E] shrink-0" />
                    <span>{confirmedBooking.property.name}</span>
                  </div>
                  <div className="text-slate-500 text-xs flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{confirmedBooking.property.address || confirmedBooking.property.country}</span>
                  </div>
                  <div className="space-y-0.5 pt-1 text-slate-600 border-t border-slate-100 mt-1">
                    <div>Booking Type: <strong className="text-[#3A4F67]">{getBookingCategoryLabel(confirmedBooking.inquiry)}</strong></div>
                    <div>
                      Stay Dates: <strong className="text-[#3A4F67]">{confirmedBooking.inquiry.checkInDate}</strong> to <strong className="text-[#3A4F67]">{confirmedBooking.inquiry.checkOutDate}</strong> ({confirmedBooking.nights} night{confirmedBooking.nights !== 1 ? 's' : ''})
                    </div>
                    {showVenueSettings && confirmedBooking.inquiry.eventDate && (
                      <div>Event Date: <strong className="text-[#3A4F67]">{confirmedBooking.inquiry.eventDate}</strong></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Itemized Price Breakdown Table */}
              <div className="rounded-xl overflow-hidden border border-slate-200 my-3 shadow-2xs w-full">
                <div className="bg-[#3A4F67] text-white px-3 sm:px-4 py-2 font-bold grid grid-cols-12 text-left items-center tracking-wider text-[10px] sm:text-xs uppercase gap-1">
                  <div className="col-span-6 min-w-0 leading-tight">ITEM / SERVICE DESCRIPTION</div>
                  <div className="col-span-3 text-center min-w-0 leading-tight">QTY / PAX</div>
                  <div className="col-span-3 text-right min-w-0 leading-tight">AMOUNT</div>
                </div>

                <div className="divide-y divide-slate-100 bg-white text-xs">
                  {/* Room Breakdown */}
                  {confirmedBooking.inquiry.standardRooms! > 0 && (
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 grid grid-cols-12 text-left items-center hover:bg-slate-50/50 transition-colors gap-1">
                      <div className="col-span-6 min-w-0 pr-1">
                        <div className="font-semibold text-slate-800 leading-snug break-words">Standard Room</div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono leading-tight mt-0.5">${priceStandard.toLocaleString()} / night</div>
                      </div>
                      <div className="col-span-3 text-center min-w-0 text-slate-600 font-mono text-xs sm:text-xs leading-snug break-words">
                        {confirmedBooking.inquiry.standardRooms} Room(s) × {confirmedBooking.nights} Night(s)
                      </div>
                      <div className="col-span-3 text-right min-w-0 font-bold text-slate-900 font-mono text-xs sm:text-sm leading-snug break-words">
                        ${((confirmedBooking.inquiry.standardRooms || 0) * priceStandard * confirmedBooking.nights).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {confirmedBooking.inquiry.deluxeRooms! > 0 && (
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 grid grid-cols-12 text-left items-center hover:bg-slate-50/50 transition-colors gap-1">
                      <div className="col-span-6 min-w-0 pr-1">
                        <div className="font-semibold text-slate-800 leading-snug break-words">Deluxe Room</div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono leading-tight mt-0.5">${priceDeluxe.toLocaleString()} / night</div>
                      </div>
                      <div className="col-span-3 text-center min-w-0 text-slate-600 font-mono text-xs sm:text-xs leading-snug break-words">
                        {confirmedBooking.inquiry.deluxeRooms} Room(s) × {confirmedBooking.nights} Night(s)
                      </div>
                      <div className="col-span-3 text-right min-w-0 font-bold text-slate-900 font-mono text-xs sm:text-sm leading-snug break-words">
                        ${((confirmedBooking.inquiry.deluxeRooms || 0) * priceDeluxe * confirmedBooking.nights).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {confirmedBooking.inquiry.presidentialSuites! > 0 && (
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 grid grid-cols-12 text-left items-center hover:bg-slate-50/50 transition-colors gap-1">
                      <div className="col-span-6 min-w-0 pr-1">
                        <div className="font-semibold text-slate-800 leading-snug break-words">Presidential Suite</div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono leading-tight mt-0.5">${pricePresidential.toLocaleString()} / night</div>
                      </div>
                      <div className="col-span-3 text-center min-w-0 text-slate-600 font-mono text-xs sm:text-xs leading-snug break-words">
                        {confirmedBooking.inquiry.presidentialSuites} Suite(s) × {confirmedBooking.nights} Night(s)
                      </div>
                      <div className="col-span-3 text-right min-w-0 font-bold text-slate-900 font-mono text-xs sm:text-sm leading-snug break-words">
                        ${((confirmedBooking.inquiry.presidentialSuites || 0) * pricePresidential * confirmedBooking.nights).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {confirmedBooking.inquiry.privateVillas! > 0 && pricePrivateVilla && (
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 grid grid-cols-12 text-left items-center hover:bg-slate-50/50 transition-colors gap-1">
                      <div className="col-span-6 min-w-0 pr-1">
                        <div className="font-semibold text-slate-800 leading-snug break-words">Private Villa</div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono leading-tight mt-0.5">${pricePrivateVilla.toLocaleString()} / night</div>
                      </div>
                      <div className="col-span-3 text-center min-w-0 text-slate-600 font-mono text-xs sm:text-xs leading-snug break-words">
                        {confirmedBooking.inquiry.privateVillas} Villa(s) × {confirmedBooking.nights} Night(s)
                      </div>
                      <div className="col-span-3 text-right min-w-0 font-bold text-slate-900 font-mono text-xs sm:text-sm leading-snug break-words">
                        ${((confirmedBooking.inquiry.privateVillas || 0) * pricePrivateVilla * confirmedBooking.nights).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Event / Meeting Venue Breakdown */}
                  {confirmedBooking.eventSubtotal > 0 && (
                    <>
                      {confirmedBooking.inquiry.bookOption === 'meeting' ? (
                        <div className="px-3 sm:px-4 py-2 sm:py-2.5 grid grid-cols-12 text-left items-center hover:bg-slate-50/50 transition-colors gap-1">
                          <div className="col-span-6 min-w-0 pr-1">
                            <div className="font-semibold text-slate-800 leading-snug break-words">
                              Meeting Package ({getVenueRateLabel(confirmedBooking.inquiry.venueRentalRate)})
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono leading-tight mt-0.5">
                              ${Math.round(priceMeetingRoom * getVenueMultiplier(confirmedBooking.inquiry.venueRentalRate)).toLocaleString()} / pax
                            </div>
                          </div>
                          <div className="col-span-3 text-center min-w-0 text-slate-600 font-mono text-xs sm:text-xs leading-snug break-words">
                            {confirmedBooking.inquiry.eventAttendees} Pax
                          </div>
                          <div className="col-span-3 text-right min-w-0 font-bold text-slate-900 font-mono text-xs sm:text-sm leading-snug break-words">
                            ${confirmedBooking.eventSubtotal.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="px-3 sm:px-4 py-2 sm:py-2.5 grid grid-cols-12 text-left items-center hover:bg-slate-50/50 transition-colors gap-1">
                            <div className="col-span-6 min-w-0 pr-1">
                              <div className="font-semibold text-slate-800 leading-snug break-words">
                                Event Space Rental
                              </div>
                              <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono leading-tight mt-0.5">
                                ${priceEventHall.toLocaleString()} / hall
                              </div>
                            </div>
                            <div className="col-span-3 text-center min-w-0 text-slate-600 font-mono text-xs sm:text-xs leading-snug break-words">
                              {confirmedBooking.inquiry.eventAttendees} Attendees
                            </div>
                            <div className="col-span-3 text-right min-w-0 font-bold text-slate-900 font-mono text-xs sm:text-sm leading-snug break-words">
                              ${priceEventHall.toLocaleString()}
                            </div>
                          </div>

                          {(confirmedBooking.inquiry.eventAddons === 'catering' || confirmedBooking.inquiry.eventAddons === 'both') && (
                            <div className="px-3 sm:px-4 py-2 sm:py-2.5 grid grid-cols-12 text-left items-center hover:bg-slate-50/50 transition-colors gap-1">
                              <div className="col-span-6 min-w-0 pr-1">
                                <div className="font-semibold text-slate-800 leading-snug break-words">
                                  Catering Service
                                </div>
                                <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono leading-tight mt-0.5">
                                  ${(confirmedBooking.inquiry.priceCateringPerPax || effectiveCateringPerPax).toLocaleString()} / pax
                                </div>
                              </div>
                              <div className="col-span-3 text-center min-w-0 text-slate-600 font-mono text-xs sm:text-xs leading-snug break-words">
                                {confirmedBooking.inquiry.cateringPax || confirmedBooking.inquiry.eventAttendees} Pax
                              </div>
                              <div className="col-span-3 text-right min-w-0 font-bold text-slate-900 font-mono text-xs sm:text-sm leading-snug break-words">
                                ${((confirmedBooking.inquiry.cateringPax || confirmedBooking.inquiry.eventAttendees || 1) * (confirmedBooking.inquiry.priceCateringPerPax || effectiveCateringPerPax)).toLocaleString()}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Notes & Totals Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 my-3 text-left items-start">
                {/* Notes / Instructions */}
                <div className="sm:col-span-6 space-y-1">
                  <span className="text-[10px] font-bold text-[#3A4F67] uppercase tracking-wider block">
                    NOTES / INSTRUCTIONS:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {confirmedBooking.inquiry.notes && confirmedBooking.inquiry.notes.trim() !== ''
                      ? confirmedBooking.inquiry.notes.trim()
                      : 'Lets play'}
                  </p>
                </div>

                {/* Summary Calculation */}
                <div className="sm:col-span-6 space-y-1.5 text-xs font-medium text-slate-600 text-right">
                  <div className="flex justify-between items-center sm:justify-end sm:gap-8">
                    <span>Subtotal Before Discount:</span>
                    <span className="font-mono text-slate-800 font-semibold">${(confirmedBooking.roomSubtotal + confirmedBooking.eventSubtotal).toLocaleString()}</span>
                  </div>

                  {confirmedBooking.inquiry.discountAmount! > 0 && (
                    <div className="flex justify-between items-center sm:justify-end sm:gap-8 text-emerald-600 font-semibold">
                      <span>Discount ({confirmedBooking.inquiry.discountCode || 'PROMO'} - {confirmedBooking.inquiry.discountPercent}%):</span>
                      <span className="font-mono">-${confirmedBooking.inquiry.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center sm:justify-end sm:gap-8">
                    <span>Subtotal Before Tax:</span>
                    <span className="font-mono text-slate-800 font-semibold">${(confirmedBooking.roomSubtotal + confirmedBooking.eventSubtotal - (confirmedBooking.inquiry.discountAmount || 0)).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center sm:justify-end sm:gap-8">
                    <span>Taxes & Fees (10%):</span>
                    <span className="font-mono text-slate-800 font-semibold">${confirmedBooking.taxAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center sm:justify-end sm:gap-8 pt-2 border-t border-slate-200 text-sm sm:text-base font-bold text-[#3A4F67]">
                    <span className="uppercase tracking-wider">Total Invoice:</span>
                    <span className="font-mono text-lg sm:text-xl text-[#3A4F67]">${confirmedBooking.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Thank you note */}
              <div className="py-2 border-t border-slate-100 text-center text-[11px] text-slate-400 italic">
                Thank you for choosing Hanford Hotels & Resorts. For questions regarding this invoice, contact central reservations at @Hanford_HnR on X.
              </div>

              {/* Payment Details / Detail Pembayaran Card */}
              <div className="bg-[#F2F7F6] border border-[#88B2AB]/30 p-3.5 sm:p-4 rounded-xl text-left space-y-2 mt-3 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-[#88B2AB]/20 pb-1.5">
                  <CreditCard className="w-4 h-4 text-[#51867E]" />
                  <span className="text-xs font-bold text-[#3A4F67] uppercase tracking-wider">
                    PAYMENT DETAILS / DETAIL PEMBAYARAN
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  Please process your payment to / Silakan lakukan pembayaran ke:
                </p>

                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs items-center shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      BANK TRANSFER
                    </span>
                    <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                      Bank Name: <strong className="text-[#3A4F67] font-bold">CHOBANK</strong>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Account Name:
                    </span>
                    <span className="text-xs sm:text-sm text-[#3A4F67] font-bold">
                      Hanford Hotels and Resorts
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Account Number:
                    </span>
                    <span className="text-[#51867E] font-mono font-bold text-sm sm:text-base tracking-wider">
                      3076 6324 4788 9928
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-3 border-t border-slate-200/80 mt-3 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>© 2026 Hanford Hotels & Resorts Central Register</span>
                <span className="flex items-center gap-1.5 font-semibold text-[#51867E]">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Reservation
                </span>
              </div>
            </div>

            {/* Hidden Offscreen Container for High-Res Desktop-Width PNG Download */}
            <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0 overflow-hidden" aria-hidden="true">
              <div
                ref={exportInvoiceRef}
                className="bg-[#FFFFFF] border-2 border-[#3A4F67]/30 rounded-2xl p-8 space-y-4 relative w-[800px] text-left"
              >
                {/* Invoice Header (Desktop Side-by-Side) */}
                <div className="border-b border-slate-200 pb-4 flex flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-3xl font-bold tracking-wider text-[#3A4F67]">
                        HANFORD
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#51867E] inline-block"></span>
                    </div>
                    <div className="text-[11px] font-bold tracking-[0.2em] text-[#51867E] uppercase">
                      HOTELS & RESORTS • CENTRAL RESERVATIONS
                    </div>
                    <div className="text-sm italic font-serif text-slate-500 pt-0.5">
                      An Elevated Way of Staying
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                      <svg className="w-3.5 h-3.5 fill-current text-slate-700 shrink-0" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="underline font-medium">x.com/Hanford_HnR</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1 text-right">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block">
                      OFFICIAL RECEIPT / INVOICE
                    </span>
                    <div className="text-base font-bold text-[#3A4F67]">
                      Invoice No: <span className="font-mono text-[#3A4F67]">{confirmedBooking.bookingId}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Date Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    <div className="px-3 py-1 bg-amber-50/80 border border-amber-500/80 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs mt-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>UNPAID - INVOICE PENDING</span>
                    </div>
                  </div>
                </div>

                {/* Guest Details & Property / Location Cards Grid (Desktop 2 Columns) */}
                <div className="grid grid-cols-2 gap-4 my-3 text-xs">
                  {/* Guest Details */}
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider block">
                      GUEST DETAILS
                    </span>
                    <div className="font-bold text-sm text-[#3A4F67] uppercase tracking-wide">
                      {confirmedBooking.inquiry.guestName || 'TREVOR'}
                    </div>
                    <div className="space-y-0.5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-current text-slate-700 shrink-0" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span>X Handle: <strong className="text-[#51867E]">@{confirmedBooking.inquiry.xUsername ? confirmedBooking.inquiry.xUsername.replace(/^@/, '') : 'def'}</strong></span>
                      </div>
                      {confirmedBooking.inquiry.businessName && confirmedBooking.inquiry.businessName.trim() !== '' && (
                        <div>Business Name: <strong className="text-slate-700">{confirmedBooking.inquiry.businessName.trim()}</strong></div>
                      )}
                      {confirmedBooking.inquiry.guestEmail && (
                        <div>Email: <span className="text-slate-600">{confirmedBooking.inquiry.guestEmail}</span></div>
                      )}
                    </div>
                  </div>

                  {/* Property / Location Details */}
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider block">
                      PROPERTY / LOCATION
                    </span>
                    <div className="font-bold text-sm text-[#3A4F67] flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#51867E] shrink-0" />
                      <span>{confirmedBooking.property.name}</span>
                    </div>
                    <div className="text-slate-500 text-xs flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{confirmedBooking.property.address || confirmedBooking.property.country}</span>
                    </div>
                    <div className="space-y-0.5 pt-1 text-slate-600 border-t border-slate-100 mt-1">
                      <div>Booking Type: <strong className="text-[#3A4F67]">{getBookingCategoryLabel(confirmedBooking.inquiry)}</strong></div>
                      <div>
                        Stay Dates: <strong className="text-[#3A4F67]">{confirmedBooking.inquiry.checkInDate}</strong> to <strong className="text-[#3A4F67]">{confirmedBooking.inquiry.checkOutDate}</strong> ({confirmedBooking.nights} night{confirmedBooking.nights !== 1 ? 's' : ''})
                      </div>
                      {showVenueSettings && confirmedBooking.inquiry.eventDate && (
                        <div>Event Date: <strong className="text-[#3A4F67]">{confirmedBooking.inquiry.eventDate}</strong></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Itemized Price Breakdown Table */}
                <div className="rounded-xl overflow-hidden border border-slate-200 my-3 shadow-2xs w-full">
                  <div className="bg-[#3A4F67] text-white px-4 py-2 font-bold grid grid-cols-12 text-left items-center tracking-wider text-xs uppercase gap-1">
                    <div className="col-span-6 min-w-0 leading-tight">ITEM / SERVICE DESCRIPTION</div>
                    <div className="col-span-3 text-center min-w-0 leading-tight">QTY / PAX</div>
                    <div className="col-span-3 text-right min-w-0 leading-tight">AMOUNT</div>
                  </div>

                  <div className="divide-y divide-slate-100 bg-white text-xs">
                    {confirmedBooking.inquiry.standardRooms! > 0 && (
                      <div className="px-4 py-2.5 grid grid-cols-12 text-left items-center gap-1">
                        <div className="col-span-6 min-w-0 pr-1">
                          <div className="font-semibold text-slate-800 leading-snug">Standard Room</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">${priceStandard.toLocaleString()} / night</div>
                        </div>
                        <div className="col-span-3 text-center text-slate-600 font-mono">
                          {confirmedBooking.inquiry.standardRooms} Room(s) × {confirmedBooking.nights} Night(s)
                        </div>
                        <div className="col-span-3 text-right font-bold text-slate-900 font-mono text-sm">
                          ${((confirmedBooking.inquiry.standardRooms || 0) * priceStandard * confirmedBooking.nights).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {confirmedBooking.inquiry.deluxeRooms! > 0 && (
                      <div className="px-4 py-2.5 grid grid-cols-12 text-left items-center gap-1">
                        <div className="col-span-6 min-w-0 pr-1">
                          <div className="font-semibold text-slate-800 leading-snug">Deluxe Room</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">${priceDeluxe.toLocaleString()} / night</div>
                        </div>
                        <div className="col-span-3 text-center text-slate-600 font-mono">
                          {confirmedBooking.inquiry.deluxeRooms} Room(s) × {confirmedBooking.nights} Night(s)
                        </div>
                        <div className="col-span-3 text-right font-bold text-slate-900 font-mono text-sm">
                          ${((confirmedBooking.inquiry.deluxeRooms || 0) * priceDeluxe * confirmedBooking.nights).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {confirmedBooking.inquiry.presidentialSuites! > 0 && (
                      <div className="px-4 py-2.5 grid grid-cols-12 text-left items-center gap-1">
                        <div className="col-span-6 min-w-0 pr-1">
                          <div className="font-semibold text-slate-800 leading-snug">Presidential Suite</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">${pricePresidential.toLocaleString()} / night</div>
                        </div>
                        <div className="col-span-3 text-center text-slate-600 font-mono">
                          {confirmedBooking.inquiry.presidentialSuites} Suite(s) × {confirmedBooking.nights} Night(s)
                        </div>
                        <div className="col-span-3 text-right font-bold text-slate-900 font-mono text-sm">
                          ${((confirmedBooking.inquiry.presidentialSuites || 0) * pricePresidential * confirmedBooking.nights).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {confirmedBooking.inquiry.privateVillas! > 0 && pricePrivateVilla && (
                      <div className="px-4 py-2.5 grid grid-cols-12 text-left items-center gap-1">
                        <div className="col-span-6 min-w-0 pr-1">
                          <div className="font-semibold text-slate-800 leading-snug">Private Villa</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">${pricePrivateVilla.toLocaleString()} / night</div>
                        </div>
                        <div className="col-span-3 text-center text-slate-600 font-mono">
                          {confirmedBooking.inquiry.privateVillas} Villa(s) × {confirmedBooking.nights} Night(s)
                        </div>
                        <div className="col-span-3 text-right font-bold text-slate-900 font-mono text-sm">
                          ${((confirmedBooking.inquiry.privateVillas || 0) * pricePrivateVilla * confirmedBooking.nights).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {confirmedBooking.eventSubtotal > 0 && (
                      <>
                        {confirmedBooking.inquiry.bookOption === 'meeting' ? (
                          <div className="px-4 py-2.5 grid grid-cols-12 text-left items-center gap-1">
                            <div className="col-span-6 min-w-0 pr-1">
                              <div className="font-semibold text-slate-800 leading-snug">
                                Meeting Package ({getVenueRateLabel(confirmedBooking.inquiry.venueRentalRate)})
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                ${Math.round(priceMeetingRoom * getVenueMultiplier(confirmedBooking.inquiry.venueRentalRate)).toLocaleString()} / pax
                              </div>
                            </div>
                            <div className="col-span-3 text-center text-slate-600 font-mono">
                              {confirmedBooking.inquiry.eventAttendees} Pax
                            </div>
                            <div className="col-span-3 text-right font-bold text-slate-900 font-mono text-sm">
                              ${confirmedBooking.eventSubtotal.toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="px-4 py-2.5 grid grid-cols-12 text-left items-center gap-1">
                              <div className="col-span-6 min-w-0 pr-1">
                                <div className="font-semibold text-slate-800 leading-snug">
                                  Event Space Rental
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                  ${priceEventHall.toLocaleString()} / hall
                                </div>
                              </div>
                              <div className="col-span-3 text-center text-slate-600 font-mono">
                                {confirmedBooking.inquiry.eventAttendees} Attendees
                              </div>
                              <div className="col-span-3 text-right font-bold text-slate-900 font-mono text-sm">
                                ${priceEventHall.toLocaleString()}
                              </div>
                            </div>

                            {(confirmedBooking.inquiry.eventAddons === 'catering' || confirmedBooking.inquiry.eventAddons === 'both') && (
                              <div className="px-4 py-2.5 grid grid-cols-12 text-left items-center gap-1">
                                <div className="col-span-6 min-w-0 pr-1">
                                  <div className="font-semibold text-slate-800 leading-snug">
                                    Catering Service
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                    ${(confirmedBooking.inquiry.priceCateringPerPax || effectiveCateringPerPax).toLocaleString()} / pax
                                  </div>
                                </div>
                                <div className="col-span-3 text-center text-slate-600 font-mono">
                                  {confirmedBooking.inquiry.cateringPax || confirmedBooking.inquiry.eventAttendees} Pax
                                </div>
                                <div className="col-span-3 text-right font-bold text-slate-900 font-mono text-sm">
                                  ${((confirmedBooking.inquiry.cateringPax || confirmedBooking.inquiry.eventAttendees || 1) * (confirmedBooking.inquiry.priceCateringPerPax || effectiveCateringPerPax)).toLocaleString()}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Notes & Totals Calculation */}
                <div className="grid grid-cols-12 gap-6 my-3 text-left items-start">
                  <div className="col-span-6 space-y-1">
                    <span className="text-[10px] font-bold text-[#3A4F67] uppercase tracking-wider block">
                      NOTES / INSTRUCTIONS:
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {confirmedBooking.inquiry.notes && confirmedBooking.inquiry.notes.trim() !== ''
                        ? confirmedBooking.inquiry.notes.trim()
                        : 'Lets play'}
                    </p>
                  </div>

                  <div className="col-span-6 space-y-1.5 text-xs font-medium text-slate-600 text-right">
                    <div className="flex justify-between items-center gap-8">
                      <span>Subtotal Before Discount:</span>
                      <span className="font-mono text-slate-800 font-semibold">${(confirmedBooking.roomSubtotal + confirmedBooking.eventSubtotal).toLocaleString()}</span>
                    </div>

                    {confirmedBooking.inquiry.discountAmount! > 0 && (
                      <div className="flex justify-between items-center gap-8 text-emerald-600 font-semibold">
                        <span>Discount ({confirmedBooking.inquiry.discountCode || 'PROMO'} - {confirmedBooking.inquiry.discountPercent}%):</span>
                        <span className="font-mono">-${confirmedBooking.inquiry.discountAmount?.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center gap-8">
                      <span>Subtotal Before Tax:</span>
                      <span className="font-mono text-slate-800 font-semibold">${(confirmedBooking.roomSubtotal + confirmedBooking.eventSubtotal - (confirmedBooking.inquiry.discountAmount || 0)).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center gap-8">
                      <span>Taxes & Fees (10%):</span>
                      <span className="font-mono text-slate-800 font-semibold">${confirmedBooking.taxAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center gap-8 pt-2 border-t border-slate-200 text-base font-bold text-[#3A4F67]">
                      <span className="uppercase tracking-wider">Total Invoice:</span>
                      <span className="font-mono text-xl text-[#3A4F67]">${confirmedBooking.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Thank you note */}
                <div className="py-2 border-t border-slate-100 text-center text-[11px] text-slate-400 italic">
                  Thank you for choosing Hanford Hotels & Resorts. For questions regarding this invoice, contact central reservations at @Hanford_HnR on X.
                </div>

                {/* Payment Details Card */}
                <div className="bg-[#F2F7F6] border border-[#88B2AB]/30 p-4 rounded-xl text-left space-y-2 mt-3 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-[#88B2AB]/20 pb-1.5">
                    <CreditCard className="w-4 h-4 text-[#51867E]" />
                    <span className="text-xs font-bold text-[#3A4F67] uppercase tracking-wider">
                      PAYMENT DETAILS / DETAIL PEMBAYARAN
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    Please process your payment to / Silakan lakukan pembayaran ke:
                  </p>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 grid grid-cols-3 gap-4 text-xs items-center shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        BANK TRANSFER
                      </span>
                      <span className="text-sm text-slate-700 font-semibold">
                        Bank Name: <strong className="text-[#3A4F67] font-bold">CHOBANK</strong>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Account Name:
                      </span>
                      <span className="text-sm text-[#3A4F67] font-bold">
                        Hanford Hotels and Resorts
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Account Number:
                      </span>
                      <span className="text-[#51867E] font-mono font-bold text-base tracking-wider">
                        3076 6324 4788 9928
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Stamp */}
                <div className="pt-3 border-t border-slate-200/80 mt-3 text-center text-xs text-slate-400 flex flex-row items-center justify-between gap-2">
                  <span>© 2026 Hanford Hotels & Resorts Central Register</span>
                  <span className="flex items-center gap-1.5 font-semibold text-[#51867E]">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Reservation
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons below Invoice (Side-by-side) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={handleDownloadInvoice}
                disabled={isGeneratingImage}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-full text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingImage ? 'GENERATING INVOICE...' : 'SAVE / DOWNLOAD INVOICE (PNG)'}</span>
              </button>

              <button
                onClick={() => setConfirmedBooking(null)}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-[#3A4F67] text-[#3A4F67] hover:bg-[#3A4F67]/10 rounded-full text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-colors cursor-pointer"
              >
                CREATE NEW RESERVATION
              </button>
            </div>

            {/* Full Payment Instructions placed BELOW the action buttons */}
            <div className="bg-white border-2 border-[#88B2AB]/40 p-4 sm:p-6 rounded-2xl shadow-lg text-left space-y-4">
              <div>
                <h4 className="font-bold text-[#3A4F67] uppercase tracking-wider flex items-center gap-2 border-b border-[#88B2AB]/30 pb-1.5 text-xs sm:text-sm">
                  <CreditCard className="w-4 h-4 text-[#51867E]" />
                  Payment & Confirmation Instructions
                </h4>
                <p className="text-[11px] text-[#5A6E82] italic leading-tight mt-1">
                  Instruksi Pembayaran dan Konfirmasi Booking
                </p>
              </div>

              <div className="space-y-3 text-xs text-[#2C3744]">
                <div className="bg-[#EAF2F1]/30 p-2.5 rounded-lg border border-[#88B2AB]/20">
                  <p className="font-semibold text-[#3A4F67] text-xs">
                    Please complete payment within 48 hours to confirm your reservation.
                  </p>
                  <p className="text-[10.5px] text-[#5A6E82] italic leading-tight mt-0.5">
                    (Silakan lakukan pembayaran dalam waktu 48 jam untuk mengonfirmasi reservasi Anda.)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {/* Step 1 */}
                  <div className="bg-[#EAF2F1]/50 p-3.5 rounded-xl border border-[#88B2AB]/30 space-y-2 flex flex-col justify-between">
                    <div>
                      <strong className="text-[#3A4F67] block font-bold text-xs uppercase tracking-wider leading-snug">
                        1. Send your payment to our Bank Account:
                      </strong>
                      <span className="text-[10px] text-[#5A6E82] italic block leading-tight mt-0.5">
                        (Transfer pembayaran anda ke Rekening Bank kami:)
                      </span>

                      <div className="space-y-1 text-xs pt-2.5 border-t border-[#88B2AB]/20 mt-2">
                        <div>Bank Name: <strong className="text-[#3A4F67]">CHOBANK</strong></div>
                        <div>Account Name: <strong className="text-[#3A4F67]">Hanford Hotels and Resorts</strong></div>
                        <div>Account Number: <strong className="text-[#51867E] font-mono font-bold text-sm">3076 6324 4788 9928</strong></div>
                      </div>
                    </div>
                    <div className="text-[10.5px] text-[#5A6E82] italic pt-1 border-t border-[#88B2AB]/20">
                      Reference: Booking ID <strong className="text-[#3A4F67]">{confirmedBooking.bookingId}</strong>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-[#EAF2F1]/50 p-3.5 rounded-xl border border-[#88B2AB]/30 space-y-2 flex flex-col justify-between">
                    <div>
                      <strong className="text-[#3A4F67] block font-bold text-xs uppercase tracking-wider leading-snug">
                        2. Follow us on @Hanford_HnR
                      </strong>
                      <span className="text-[10px] text-[#5A6E82] italic block leading-tight mt-0.5">
                        (Ikuti akun resmi kami di @Hanford_HnR)
                      </span>

                      <div className="space-y-1.5 text-xs pt-2.5 border-t border-[#88B2AB]/20 mt-2">
                        <div>Official Account: <a href="https://x.com/Hanford_HnR" target="_blank" rel="noopener noreferrer" className="text-[#51867E] underline font-bold">@Hanford_HnR</a></div>
                        <p className="text-[11px] text-[#2C3744] leading-relaxed">
                          Follow our official X account to receive direct updates & confirmation.
                        </p>
                        <p className="text-[10px] text-[#5A6E82] italic leading-tight">
                          (Ikuti akun X resmi kami untuk mendapatkan pembaruan & konfirmasi langsung.)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-[#EAF2F1]/50 p-3.5 rounded-xl border border-[#88B2AB]/30 space-y-2 flex flex-col justify-between">
                    <div>
                      <strong className="text-[#3A4F67] block font-bold text-xs uppercase tracking-wider leading-snug">
                        3. Send your Confirmation on X (Twitter)
                      </strong>
                      <span className="text-[10px] text-[#5A6E82] italic block leading-tight mt-0.5">
                        (Kirim Konfirmasi Anda melalui X (Twitter))
                      </span>

                      <div className="space-y-1.5 text-xs pt-2.5 border-t border-[#88B2AB]/20 mt-2">
                        <p className="text-[11px] text-[#2C3744] leading-snug">
                          Send a DM or post a tweet mentioning <strong className="text-[#51867E]">@Hanford_HnR</strong> with your Invoice & Transfer Proof.
                        </p>
                        <p className="text-[10px] text-[#5A6E82] italic leading-tight">
                          (Kirim DM atau unggah tweet dengan menyebut @Hanford_HnR beserta Invoice & Bukti Transfer Anda.)
                        </p>
                      </div>
                    </div>
                    <div className="text-[10.5px] text-[#5A6E82] italic pt-1 border-t border-[#88B2AB]/20">
                      Booking ID: <strong className="text-[#3A4F67]">{confirmedBooking.bookingId}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------------ */
          /* MAIN INTERACTIVE BOOKING FORM */
          /* ------------------------------------------------------------------ */
          <form
            onSubmit={handleSubmit}
            className="info-panel bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-10 shadow-xl space-y-4 sm:space-y-8 text-left pb-16 sm:pb-10 w-full max-w-full overflow-hidden"
          >
            {errorMessage && (
              <div className="p-3.5 bg-rose-100 border border-rose-300 text-rose-900 text-xs rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Location Selection & Live Pricing Card */}
            <div className="space-y-2.5 sm:space-y-3">
              <label className="block text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] text-[#3A4F67] uppercase">
                1. HOTEL / RESORT LOCATION *
                <span className="block text-[9.5px] sm:text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  pilih lokasi hotel atau resort hanford
                </span>
              </label>

              {loadingLocations ? (
                <div className="h-10 sm:h-12 bg-[#88B2AB]/20 animate-pulse rounded-full" />
              ) : (
                <PropertySearchSelect
                  properties={properties}
                  selectedSlug={formData.propertySlug}
                  onSelect={(slug) => handlePropertyChange(slug)}
                />
              )}

              {/* Dynamic Rates Banner */}
              {selectedProperty && (
                <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#88B2AB]/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#88B2AB]/20 pb-2">
                    <span className="font-bold text-[#3A4F67] flex items-center gap-1.5 text-[11px] sm:text-xs">
                      <DollarSign className="w-3.5 h-3.5 text-[#51867E]" />
                      Rates & Pricing
                    </span>
                    <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#EAF2F1] text-[#3A4F67] border border-[#88B2AB]/30 uppercase">
                      {propertyTypeLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px] sm:text-[11px] pt-0.5">
                    <div>
                      <span className="text-[#3A4F67] block font-medium">Standard Room:</span>
                      <strong className="text-[#2C3744]">${priceStandard.toLocaleString()} / night</strong>
                    </div>

                    <div>
                      <span className="text-[#3A4F67] block font-medium">Deluxe Room:</span>
                      <strong className="text-[#2C3744]">${priceDeluxe.toLocaleString()} / night</strong>
                    </div>

                    <div>
                      <span className="text-[#3A4F67] block font-medium">Presidential Suite:</span>
                      <strong className="text-[#2C3744]">${pricePresidential.toLocaleString()} / night</strong>
                    </div>

                    {hasPrivateVilla && pricePrivateVilla ? (
                      <div>
                        <span className="text-[#3A4F67] block font-medium">Private Villa:</span>
                        <strong className="text-[#51867E]">${pricePrivateVilla.toLocaleString()} / night</strong>
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">
                        <span className="block font-medium">Private Villa:</span>
                        <span>Not Available (Grand Hotel)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Customer Information */}
            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-[#88B2AB]/30">
              <label className="block text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] text-[#3A4F67] uppercase">
                2. GUEST INFORMATION *
                <span className="block text-[9.5px] sm:text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  informasi data lengkap pemesan
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
                <div className="min-w-0 w-full">
                  <label className="block text-[10.5px] sm:text-[11px] font-bold text-[#3A4F67] mb-1">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#51867E]" />
                      Full Name *
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="box-border w-full max-w-full min-w-0 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-white border border-[#88B2AB]/30 rounded-xl sm:rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                  />
                </div>

                <div className="min-w-0 w-full">
                  <label className="block text-[10.5px] sm:text-[11px] font-bold text-[#3A4F67] mb-1">
                    <span className="flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-[#51867E]" />
                      X / Twitter Username *
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@username"
                    value={formData.xUsername}
                    onChange={(e) => setFormData({ ...formData, xUsername: e.target.value })}
                    className="box-border w-full max-w-full min-w-0 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-white border border-[#88B2AB]/30 rounded-xl sm:rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                  />
                </div>

                <div className="min-w-0 w-full">
                  <label className="block text-[10.5px] sm:text-[11px] font-bold text-[#3A4F67] mb-1">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#51867E]" />
                      Business Name (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corporation"
                    value={formData.businessName || ''}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="box-border w-full max-w-full min-w-0 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-white border border-[#88B2AB]/30 rounded-xl sm:rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 3. Booking Category Selection */}
            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-[#88B2AB]/30">
              <label className="block text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] text-[#3A4F67] uppercase">
                3. BOOKING CATEGORY *
                <span className="block text-[9.5px] sm:text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  pilih kategori jenis pemesanan
                </span>
              </label>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {/* Category: ROOM */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'room' })}
                  className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1.5 sm:space-y-2 cursor-pointer ${
                    formData.bookOption === 'room'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Hotel className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${formData.bookOption === 'room' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[8.5px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'room' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      ROOM
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'room' ? 'text-white' : 'text-[#3A4F67]'}`}>ROOM STAY</h3>
                    <p className={`text-[9px] sm:text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'room' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
                      Standard, Deluxe, Suite, Villa
                    </p>
                  </div>
                </button>

                {/* Category: EVENT LOCATION */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'event' })}
                  className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1.5 sm:space-y-2 cursor-pointer ${
                    formData.bookOption === 'event'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <PartyPopper className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${formData.bookOption === 'event' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[8.5px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'event' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      EVENT
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'event' ? 'text-white' : 'text-[#3A4F67]'}`}>EVENT LOCATION</h3>
                    <p className={`text-[9px] sm:text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'event' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
                      Hall / Ballroom rental & Catering
                    </p>
                  </div>
                </button>

                {/* Category: BOTH ROOM & EVENT */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'both' })}
                  className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1.5 sm:space-y-2 cursor-pointer ${
                    formData.bookOption === 'both'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Layers className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${formData.bookOption === 'both' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[8.5px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'both' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      BOTH
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'both' ? 'text-white' : 'text-[#3A4F67]'}`}>ROOM & EVENT</h3>
                    <p className={`text-[9px] sm:text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'both' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
                      Combined stay & event venue
                    </p>
                  </div>
                </button>

                {/* Category: MEETING */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'meeting' })}
                  className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1.5 sm:space-y-2 cursor-pointer ${
                    formData.bookOption === 'meeting'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Users className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${formData.bookOption === 'meeting' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[8.5px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'meeting' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      MEETING
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'meeting' ? 'text-white' : 'text-[#3A4F67]'}`}>MEETING ROOM</h3>
                    <p className={`text-[9px] sm:text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'meeting' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
                      Meeting room per pax
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 3.1 MEETING ROOM ACCOMMODATION OPTION (Only for Meeting Room Category) */}
            {formData.bookOption === 'meeting' && (
              <div className="space-y-3 pt-4 border-t border-[#88B2AB]/30 animate-in fade-in duration-300">
                <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                  ACCOMMODATION OPTION *
                  <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                    pilih opsi penginapan untuk pemesanan meeting room
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accommodationOption: 'without' })}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 cursor-pointer ${
                      formData.accommodationOption === 'without'
                        ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                        : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider">WITHOUT ACCOMMODATION</span>
                      {formData.accommodationOption === 'without' && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <p className={`text-[11px] font-light leading-snug ${formData.accommodationOption === 'without' ? 'text-[#EAF2F1]' : 'text-[#2C3744]'}`}>
                      Meeting room / venue rental only. No overnight accommodation included.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accommodationOption: 'with' })}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 cursor-pointer ${
                      formData.accommodationOption === 'with'
                        ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                        : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider">WITH ACCOMMODATION</span>
                      {formData.accommodationOption === 'with' && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <p className={`text-[11px] font-light leading-snug ${formData.accommodationOption === 'with' ? 'text-[#EAF2F1]' : 'text-[#2C3744]'}`}>
                      Meeting room / venue rental with overnight accommodation.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* 3.2 MEETING PACKAGE PER PAX (Only for Meeting Room) */}
            {formData.bookOption === 'meeting' && (
              <div className="space-y-3 pt-3 sm:pt-4 border-t border-[#88B2AB]/30 animate-in fade-in duration-300">
                <label className="block text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] text-[#3A4F67] uppercase">
                  MEETING PACKAGE PER PAX *
                  <span className="block text-[9.5px] sm:text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                    pilih paket durasi dan layanan venue meeting room
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {/* HALF DAY */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, venueRentalRate: 'half_day' })}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all space-y-1 sm:space-y-1.5 cursor-pointer ${
                      formData.venueRentalRate === 'half_day'
                        ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                        : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                        HALF DAY (${Math.round(priceMeetingRoom * 0.4).toLocaleString()} / pax)
                      </span>
                      {formData.venueRentalRate === 'half_day' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white" />}
                    </div>
                    <p className={`text-[10.5px] sm:text-[11px] font-bold ${formData.venueRentalRate === 'half_day' ? 'text-white' : 'text-[#3A4F67]'}`}>
                      Maximum 4–5 hours
                    </p>
                    <p className={`text-[9.5px] sm:text-[10px] font-light leading-snug ${formData.venueRentalRate === 'half_day' ? 'text-[#EAF2F1]' : 'text-[#2C3744]'}`}>
                      Includes 1× coffee break or 1× meal
                    </p>
                  </button>

                  {/* FULL DAY */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, venueRentalRate: 'full_day' })}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all space-y-1 sm:space-y-1.5 cursor-pointer ${
                      formData.venueRentalRate === 'full_day'
                        ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                        : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                        FULL DAY (${Math.round(priceMeetingRoom * 1.0).toLocaleString()} / pax)
                      </span>
                      {formData.venueRentalRate === 'full_day' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white" />}
                    </div>
                    <p className={`text-[10.5px] sm:text-[11px] font-bold ${formData.venueRentalRate === 'full_day' ? 'text-white' : 'text-[#3A4F67]'}`}>
                      Maximum 8–9 hours
                    </p>
                    <p className={`text-[9.5px] sm:text-[10px] font-light leading-snug ${formData.venueRentalRate === 'full_day' ? 'text-[#EAF2F1]' : 'text-[#2C3744]'}`}>
                      Includes 2× coffee breaks and 1× meal
                    </p>
                  </button>

                  {/* FULL BOARD */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, venueRentalRate: 'full_board' })}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all space-y-1 sm:space-y-1.5 cursor-pointer ${
                      formData.venueRentalRate === 'full_board'
                        ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                        : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                        FULL BOARD (${Math.round(priceMeetingRoom * 1.2).toLocaleString()} / pax)
                      </span>
                      {formData.venueRentalRate === 'full_board' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white" />}
                    </div>
                    <p className={`text-[10.5px] sm:text-[11px] font-bold ${formData.venueRentalRate === 'full_board' ? 'text-white' : 'text-[#3A4F67]'}`}>
                      Maximum 10–12 hours
                    </p>
                    <p className={`text-[9.5px] sm:text-[10px] font-light leading-snug ${formData.venueRentalRate === 'full_board' ? 'text-[#EAF2F1]' : 'text-[#2C3744]'}`}>
                      Includes 2× coffee breaks, 1× lunch, and 1× dinner
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* 3.3 EVENT HALL RENTAL PRICE (For Event Location or Room & Event) */}
            {(formData.bookOption === 'event' || formData.bookOption === 'both') && (
              <div className="space-y-3 pt-4 border-t border-[#88B2AB]/30 animate-in fade-in duration-300">
                <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                  EVENT HALL RENTAL PRICE *
                  <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                    biaya sewa venue gedung / ballroom acara
                  </span>
                </label>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#88B2AB]/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#EAF2F1] text-[#51867E] rounded-xl border border-[#88B2AB]/30 shrink-0">
                      <PartyPopper className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#3A4F67] uppercase tracking-wider">Grand Event Hall & Ballroom Rental</h4>
                      <p className="text-[11px] text-[#2C3744] font-light mt-0.5">
                        Includes full venue access, stage, AV system, and dedicated event management team.
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#EAF2F1] px-4 py-2.5 rounded-xl border border-[#88B2AB]/40 text-left sm:text-right w-full sm:w-auto shrink-0">
                    <span className="text-[10px] font-bold text-[#3A4F67] uppercase tracking-wider block">Standard Rate</span>
                    <span className="text-base sm:text-lg font-serif font-bold text-[#51867E]">${priceEventHall.toLocaleString()} USD</span>
                    <span className="text-[10px] text-[#3A4F67] block italic font-normal">flat rate / venue rental</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Dates Selection (Conditional based on showRoomsAndDates or showVenueSettings) */}
            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-[#88B2AB]/30">
              <label className="block text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] text-[#3A4F67] uppercase">
                4. SCHEDULE & DATES *
                <span className="block text-[9.5px] sm:text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  tentukan tanggal reservasi stay / event
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
                {showRoomsAndDates && (
                  <>
                    <div className="min-w-0 w-full">
                      <label className="block text-[10.5px] sm:text-[11px] font-bold text-[#3A4F67] mb-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#51867E]" />
                          Check-In Date *
                        </span>
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={formData.checkInDate}
                        onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                        className="box-border w-full max-w-full min-w-0 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-white border border-[#88B2AB]/30 rounded-xl sm:rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium cursor-pointer"
                      />
                    </div>

                    <div className="min-w-0 w-full">
                      <label className="block text-[10.5px] sm:text-[11px] font-bold text-[#3A4F67] mb-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#51867E]" />
                          Check-Out Date *
                        </span>
                      </label>
                      <input
                        type="date"
                        required
                        min={formData.checkInDate || todayStr}
                        value={formData.checkOutDate}
                        onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                        className="box-border w-full max-w-full min-w-0 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-white border border-[#88B2AB]/30 rounded-xl sm:rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {showVenueSettings && (
                  <div className="min-w-0 w-full">
                    <label className="block text-[10.5px] sm:text-[11px] font-bold text-[#3A4F67] mb-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#51867E]" />
                        Event / Meeting Date *
                      </span>
                    </label>
                    <input
                      type="date"
                      required
                      min={todayStr}
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="box-border w-full max-w-full min-w-0 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-white border border-[#88B2AB]/30 rounded-xl sm:rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 5. Venue Attendees & Event Addons (Only for Event or Meeting) */}
            {showVenueSettings && (
              <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-[#88B2AB]/30 animate-in fade-in duration-300">
                <label className="block text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] text-[#3A4F67] uppercase">
                  5. VENUE & ATTENDEES CONFIGURATION *
                  <span className="block text-[9.5px] sm:text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                    konfigurasi kapasitas tamu dan fasilitas tambahan
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="min-w-0 w-full">
                    <label className="block text-[10.5px] sm:text-[11px] font-bold text-[#3A4F67] mb-1">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#51867E]" />
                        ATTENDEES / GUESTS COUNT *
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.eventAttendees ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const val = raw === '' ? undefined : parseInt(raw, 10);
                        setFormData({
                          ...formData,
                          eventAttendees: val,
                          cateringPax: val
                        });
                      }}
                      placeholder=""
                      className="box-border w-full max-w-full min-w-0 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-white border border-[#88B2AB]/30 rounded-xl sm:rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-bold"
                    />
                    <span className="text-[10px] text-[#3A4F67] mt-1 block">
                      Rate:{' '}
                      {formData.bookOption === 'meeting'
                        ? `$${Math.round(priceMeetingRoom * getVenueMultiplier(formData.venueRentalRate))} / pax`
                        : `$${Math.round(priceEventHall * getVenueMultiplier(formData.venueRentalRate))} flat venue rental`}
                    </span>
                  </div>

                  {/* CATERING ADD-ON (Only for Event Hall bookings, NOT for Meeting Room) */}
                  {(formData.bookOption === 'event' || formData.bookOption === 'both') && (
                    <div className="min-w-0 w-full">
                      <label className="block text-[10.5px] sm:text-[11px] font-bold text-[#3A4F67] mb-1">
                        <span className="flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-[#51867E]" />
                          CATERING ADD-ON *
                        </span>
                      </label>
                      <select
                        required
                        value={formData.eventAddons || ''}
                        onChange={(e) => setFormData({ ...formData, eventAddons: e.target.value as EventAddonOption })}
                        className="box-border w-full max-w-full min-w-0 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-white border border-[#88B2AB]/30 rounded-xl sm:rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-semibold cursor-pointer"
                      >
                        <option value="" disabled hidden>-- Select Catering Option --</option>
                        <option value="none">Venue Only (No Catering)</option>
                        <option value="catering">Include Gourmet Catering (+${effectiveCateringPerPax}/pax)</option>
                        <option value="both">Include Catering & Deluxe Decoration (+${effectiveCateringPerPax}/pax)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. Room Quantities & Capacity Info (If ROOM, BOTH, or MEETING WITH ACCOMMODATION) */}
            {showRoomsAndDates && (
              <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-[#88B2AB]/30 animate-in fade-in duration-300">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] text-[#3A4F67] uppercase">
                    ROOM QUANTITIES & SELECTION *
                    <span className="block text-[9.5px] sm:text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                      pilih jumlah unit untuk setiap tipe kamar
                    </span>
                  </label>

                  <span className="text-[9px] sm:text-[10px] font-bold text-[#3A4F67] bg-white px-2.5 py-1 rounded-full border border-[#88B2AB]/30 shrink-0">
                    Total: {(formData.standardRooms || 0) + (formData.deluxeRooms || 0) + (formData.presidentialSuites || 0) + (formData.privateVillas || 0)} Room(s)
                  </span>
                </div>

                <div className={`grid grid-cols-2 ${hasPrivateVilla ? 'lg:grid-cols-4' : 'sm:grid-cols-3'} gap-2 sm:gap-3.5`}>
                  {/* Standard Room */}
                  <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#88B2AB]/30 flex flex-col justify-between space-y-2 shadow-xs">
                    <div>
                      <h4 className="text-[11px] sm:text-xs font-bold text-[#3A4F67] leading-tight">Standard Room</h4>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#51867E] block mt-0.5">
                        ${priceStandard.toLocaleString()} / night
                      </span>

                      {/* Room Capacity Note */}
                      <div className="text-[8.5px] sm:text-[10px] text-[#51867E] font-medium bg-[#EAF2F1] px-1.5 sm:px-2.5 py-1 rounded-md sm:rounded-lg border border-[#88B2AB]/20 flex items-start gap-1 mt-1.5 leading-tight">
                        <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 mt-0.5" />
                        <span>{selectedProperty?.capacityStandard || 'Max 3 guests (2 Adults + 1 Child)'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#EAF2F1]/50 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-[#88B2AB]/20 mt-1.5">
                      <button
                        type="button"
                        onClick={() => handleRoomCountChange('standardRooms', (formData.standardRooms || 0) - 1)}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-white border border-[#88B2AB]/40 font-bold text-xs sm:text-sm text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer shrink-0"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={formData.standardRooms ?? ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const num = raw === '' ? undefined : parseInt(raw, 10);
                          handleRoomCountChange('standardRooms', num);
                        }}
                        placeholder="0"
                        className="w-8 sm:w-16 text-center bg-transparent border-0 py-0.5 text-xs font-bold text-[#3A4F67] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRoomCountChange('standardRooms', (formData.standardRooms || 0) + 1)}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-white border border-[#88B2AB]/40 font-bold text-xs sm:text-sm text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer shrink-0"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Deluxe Room */}
                  <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#88B2AB]/30 flex flex-col justify-between space-y-2 shadow-xs">
                    <div>
                      <h4 className="text-[11px] sm:text-xs font-bold text-[#3A4F67] leading-tight">Deluxe Room</h4>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#51867E] block mt-0.5">
                        ${priceDeluxe.toLocaleString()} / night
                      </span>

                      {/* Room Capacity Note */}
                      <div className="text-[8.5px] sm:text-[10px] text-[#51867E] font-medium bg-[#EAF2F1] px-1.5 sm:px-2.5 py-1 rounded-md sm:rounded-lg border border-[#88B2AB]/20 flex items-start gap-1 mt-1.5 leading-tight">
                        <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 mt-0.5" />
                        <span>{selectedProperty?.capacityDeluxe || 'Max 3 guests (2 Adults + 1 Child)'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#EAF2F1]/50 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-[#88B2AB]/20 mt-1.5">
                      <button
                        type="button"
                        onClick={() => handleRoomCountChange('deluxeRooms', (formData.deluxeRooms || 0) - 1)}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-white border border-[#88B2AB]/40 font-bold text-xs sm:text-sm text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer shrink-0"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={formData.deluxeRooms ?? ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const num = raw === '' ? undefined : parseInt(raw, 10);
                          handleRoomCountChange('deluxeRooms', num);
                        }}
                        placeholder="0"
                        className="w-8 sm:w-16 text-center bg-transparent border-0 py-0.5 text-xs font-bold text-[#3A4F67] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRoomCountChange('deluxeRooms', (formData.deluxeRooms || 0) + 1)}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-white border border-[#88B2AB]/40 font-bold text-xs sm:text-sm text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer shrink-0"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Presidential Suite */}
                  <div className={`bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#88B2AB]/30 flex flex-col justify-between space-y-2 shadow-xs ${!hasPrivateVilla ? 'col-span-2 sm:col-span-1' : ''}`}>
                    <div>
                      <h4 className="text-[11px] sm:text-xs font-bold text-[#3A4F67] leading-tight">Presidential Suite</h4>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#51867E] block mt-0.5">
                        ${pricePresidential.toLocaleString()} / night
                      </span>

                      {/* Room Capacity Note */}
                      <div className="text-[8.5px] sm:text-[10px] text-[#51867E] font-medium bg-[#EAF2F1] px-1.5 sm:px-2.5 py-1 rounded-md sm:rounded-lg border border-[#88B2AB]/20 flex items-start gap-1 mt-1.5 leading-tight">
                        <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 mt-0.5" />
                        <span>{selectedProperty?.capacityPresidential || 'Max 5 guests (4 Adults + 1 Child)'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#EAF2F1]/50 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-[#88B2AB]/20 mt-1.5">
                      <button
                        type="button"
                        onClick={() => handleRoomCountChange('presidentialSuites', (formData.presidentialSuites || 0) - 1)}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-white border border-[#88B2AB]/40 font-bold text-xs sm:text-sm text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer shrink-0"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={formData.presidentialSuites ?? ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const num = raw === '' ? undefined : parseInt(raw, 10);
                          handleRoomCountChange('presidentialSuites', num);
                        }}
                        placeholder="0"
                        className="w-8 sm:w-16 text-center bg-transparent border-0 py-0.5 text-xs font-bold text-[#3A4F67] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRoomCountChange('presidentialSuites', (formData.presidentialSuites || 0) + 1)}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-white border border-[#88B2AB]/40 font-bold text-xs sm:text-sm text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer shrink-0"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Private Villa (Eco Resort & Hotel & Resort) */}
                  {hasPrivateVilla && pricePrivateVilla && (
                    <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#51867E]/40 flex flex-col justify-between space-y-2 shadow-xs">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <h4 className="text-[11px] sm:text-xs font-bold text-[#3A4F67] leading-tight">Private Villa</h4>
                            <span className="text-[10px] sm:text-[11px] font-semibold text-[#51867E] block mt-0.5">
                              ${pricePrivateVilla.toLocaleString()} / night
                            </span>
                          </div>
                          <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#51867E] text-white shrink-0">
                            {isEcoResort ? 'ECO' : 'RESORT'}
                          </span>
                        </div>

                        {/* Room Capacity Note */}
                        <div className="text-[8.5px] sm:text-[10px] text-[#51867E] font-medium bg-[#EAF2F1] px-1.5 sm:px-2.5 py-1 rounded-md sm:rounded-lg border border-[#88B2AB]/20 flex items-start gap-1 mt-1.5 leading-tight">
                          <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 mt-0.5" />
                          <span>{selectedProperty?.capacityPrivateVilla || 'Max 6 guests (4 Adults + 2 Children)'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-[#EAF2F1]/50 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-[#88B2AB]/20 mt-1.5">
                        <button
                          type="button"
                          onClick={() => handleRoomCountChange('privateVillas', (formData.privateVillas || 0) - 1)}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-white border border-[#88B2AB]/40 font-bold text-xs sm:text-sm text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer shrink-0"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={formData.privateVillas ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const num = raw === '' ? undefined : parseInt(raw, 10);
                            handleRoomCountChange('privateVillas', num);
                          }}
                          placeholder="0"
                          className="w-8 sm:w-16 text-center bg-transparent border-0 py-0.5 text-xs font-bold text-[#3A4F67] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRoomCountChange('privateVillas', (formData.privateVillas || 0) + 1)}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-white border border-[#88B2AB]/40 font-bold text-xs sm:text-sm text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer shrink-0"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. Live Calculation & Total Display */}
            <div className="bg-[#3A4F67] text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#88B2AB]/30 space-y-3 sm:space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#88B2AB]/30 pb-2.5 sm:pb-3">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#EAF2F1] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#88B2AB]" />
                  Live Estimation Summary
                </span>
                <span className="text-[9px] sm:text-[10px] bg-[#88B2AB] text-[#1E293B] font-bold px-2.5 py-0.5 sm:py-1 rounded-full uppercase">
                  10% Tax Included
                </span>
              </div>

              {/* Discount / Coupon Code Input */}
              <div className="bg-[#2C3744]/70 p-2.5 sm:p-3 rounded-xl border border-[#88B2AB]/30 space-y-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Tag className="w-4 h-4 text-[#88B2AB] shrink-0" />
                    <div>
                      <span className="font-bold text-white block text-[11px] sm:text-xs">Coupon Code (for discount)</span>
                      <span className="text-[9.5px] text-[#88B2AB] block">
                        Put your coupon code here
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="text"
                      placeholder="Enter coupon code..."
                      value={formData.discountCode || ''}
                      onChange={(e) => {
                        const code = e.target.value;
                        setFormData({
                          ...formData,
                          discountCode: code
                        });
                      }}
                      className="w-28 sm:w-36 px-3 py-1.5 bg-white text-[#2C3744] font-bold text-xs uppercase rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88B2AB]"
                    />
                    {couponResult.isValid && (
                      <span className="bg-[#88B2AB] text-[#1E293B] font-extrabold text-[10px] px-2 py-1 rounded-lg shrink-0">
                        -{couponResult.percent}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {formData.discountCode && formData.discountCode.trim() !== '' && (
                  <div className={`text-[10px] font-semibold px-2 py-1 rounded-md ${
                    couponResult.isValid 
                      ? 'bg-[#88B2AB]/20 text-[#88B2AB] border border-[#88B2AB]/40' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {couponResult.message}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-[11px] sm:text-xs">
                {showRoomsAndDates && currentRoomSubtotal > 0 && (
                  <div className="flex justify-between text-[#EAF2F1]">
                    <span>Room Accommodation ({currentNights} Night/s):</span>
                    <strong className="font-mono text-white">${currentRoomSubtotal.toLocaleString()}</strong>
                  </div>
                )}

                {showVenueSettings && currentEventSubtotal > 0 && (
                  <div className="flex justify-between text-[#EAF2F1]">
                    <span className="truncate pr-2">
                      {formData.bookOption === 'meeting'
                        ? `Venue Rental & Meeting Package (${getVenueRateLabel(formData.venueRentalRate)}):`
                        : `Event Hall Rental ($${priceEventHall.toLocaleString()} Flat Rate):`}
                    </span>
                    <strong className="font-mono text-white shrink-0">${currentEventSubtotal.toLocaleString()}</strong>
                  </div>
                )}

                <div className="flex justify-between text-[#EAF2F1]">
                  <span>Subtotal Before Discount & Tax:</span>
                  <strong className="font-mono text-white">${currentRawSubtotal.toLocaleString()}</strong>
                </div>

                {appliedDiscountPercent > 0 && (
                  <div className="flex justify-between text-[#88B2AB] font-semibold">
                    <span>Discount Coupon ({appliedDiscountCode || 'PROMO'} - {appliedDiscountPercent}%):</span>
                    <strong className="font-mono text-[#88B2AB]">-${currentDiscountAmount.toLocaleString()}</strong>
                  </div>
                )}

                <div className="flex justify-between text-[#EAF2F1]">
                  <span>Subtotal Before Tax:</span>
                  <strong className="font-mono text-white">${currentSubtotalBeforeTax.toLocaleString()}</strong>
                </div>

                <div className="flex justify-between text-[#EAF2F1]">
                  <span>Tax & Service Fee (10%):</span>
                  <strong className="font-mono text-white">${currentTaxAmount.toLocaleString()}</strong>
                </div>

                <div className="pt-2.5 sm:pt-3 border-t border-[#88B2AB]/30 flex items-center justify-between gap-2">
                  <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#EAF2F1] shrink-0">
                    Estimated Grand Total
                  </span>
                  <span className="text-base sm:text-xl font-serif font-bold text-[#88B2AB] text-right">
                    ${currentGrandTotal.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>

            {/* 8. Additional Notes / Special Instructions */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] text-[#3A4F67] uppercase">
                Special Requirements & Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder={
                  formData.bookOption === 'event' || formData.bookOption === 'meeting' || formData.bookOption === 'both'
                    ? "Sebutkan jam acara / event hours (contoh: 09:00 - 17:00), susunan acara, preferensi katering/makanan, atau instruksi khusus lainnya..."
                    : "Mention arrival times, dietary preferences, room requests, or special instructions..."
                }
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 sm:p-4 bg-white border border-[#88B2AB]/30 rounded-xl sm:rounded-2xl text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 sm:py-4 px-3 sm:px-6 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-full text-[11px] sm:text-xs font-bold tracking-[0.08em] sm:tracking-[0.2em] uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-[#88B2AB]/40"
            >
              {submitting ? (
                <span>Registering Reservation...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white shrink-0" />
                  <span className="text-center">CONFIRM & REGISTER RESERVATION</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STICKY BOTTOM SUMMARY BAR FOR MOBILE FORM */}
        {!confirmedBooking && (
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#3A4F67]/95 backdrop-blur-md border-t border-[#88B2AB]/30 px-4 py-2.5 shadow-2xl flex items-center justify-between text-white">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-[#88B2AB] font-semibold">Total Estimated</span>
              <span className="text-lg font-serif font-bold text-white">${currentGrandTotal.toLocaleString()} USD</span>
            </div>
            <button
              onClick={(e) => {
                const formEl = document.querySelector('form');
                if (formEl) {
                  formEl.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }}
              disabled={submitting}
              className="px-5 py-2 bg-[#51867E] active:bg-[#3f6d66] text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow border border-[#88B2AB]/40 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Book Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
