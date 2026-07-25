import React, { useState, useEffect, useRef } from 'react';
import { Property, BookingInquiry, BookOption, EventAddonOption } from '../types';
import { fetchLocations, submitBooking } from '../services/dataService';
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
  Briefcase
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

  useEffect(() => {
    fetchLocations().then((res) => {
      setProperties(res.data);
      setLoadingLocations(false);

      if (initialPropertySlug) {
        const matched = res.data.find(
          (p) => p.slug.toLowerCase() === initialPropertySlug.toLowerCase()
        );
        if (matched) {
          setFormData((prev) => ({
            ...prev,
            propertySlug: matched.slug,
            propertyName: matched.name
          }));
        }
      } else if (res.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          propertySlug: res.data[0].slug,
          propertyName: res.data[0].name
        }));
      }
    });
  }, [initialPropertySlug]);

  const selectedProperty = properties.find((p) => p.slug === formData.propertySlug);

  const isEcoResort = selectedProperty
    ? Boolean(selectedProperty.isEcoResort || selectedProperty.name.toLowerCase().includes('eco resort'))
    : formData.propertyName.toLowerCase().includes('eco resort');

  const priceStandard = selectedProperty?.priceStandard || selectedProperty?.priceFrom || 850;
  const priceDeluxe = selectedProperty?.priceDeluxe || Math.round(priceStandard * 1.45);
  const pricePresidential = selectedProperty?.pricePresidential || Math.round(priceStandard * 3.8);
  const pricePrivateVilla = isEcoResort
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
    const matched = properties.find((p) => p.slug === slug);
    const matchedIsEco = matched
      ? Boolean(matched.isEcoResort || matched.name.toLowerCase().includes('eco resort'))
      : slug.toLowerCase().includes('eco-resort');

    setFormData((prev) => {
      const updatedPrivateVillas = matchedIsEco ? prev.privateVillas : undefined;
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

  // Helper: venue rental multiplier
  const getVenueMultiplier = (rate?: string) => {
    if (rate === 'half_day') return 0.6;
    if (rate === 'full_board') return 1.5;
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
      const multiplier = getVenueMultiplier(formData.venueRentalRate);
      const ratePerPax = priceMeetingRoom * multiplier;
      currentEventSubtotal = Math.round((formData.eventAttendees || 1) * ratePerPax);
    } else {
      const venueCost = priceEventHall;
      const hasCatering = formData.eventAddons === 'catering' || formData.eventAddons === 'both';
      const cateringCost = hasCatering
        ? (formData.cateringPax || formData.eventAttendees || 1) * priceCateringPerPax
        : 0;
      currentEventSubtotal = venueCost + cateringCost;
    }
  }

  const currentRawSubtotal = currentRoomSubtotal + currentEventSubtotal;
  const currentTaxAmount = Math.round(currentRawSubtotal * 0.1);
  const currentGrandTotal = currentRawSubtotal + currentTaxAmount;

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
    if (!invoiceRef.current) return;
    try {
      setIsGeneratingImage(true);
      const dataUrl = await toPng(invoiceRef.current, {
        cacheBust: true,
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF'
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
            Reserve Your Experience
          </h1>
          <p className="text-xs sm:text-sm text-[#2C3744] max-w-xl mx-auto font-light leading-relaxed">
            Real-time hotel booking application connected directly with Hanford Central Register.
            <span className="block text-[10px] sm:text-[11px] text-[#3A4F67] font-medium italic mt-0.5">
              Sistem reservasi hotel real-time terhubung langsung ke Google Sheets Central Register.
            </span>
          </p>

          <div className="pt-1">
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-[#3A4F67] bg-[#EAF2F1] hover:bg-[#EAF2F1]/80 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#88B2AB]/30 shadow-sm transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-[#3A4F67]" />
              <span>Google Sheet Live Database (Bookings Register)</span>
              <ExternalLink className="w-3 h-3 text-[#3A4F67]" />
            </a>
          </div>
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
                    Invoice saved to Google Sheets. Download your PNG invoice below.
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
              className="bg-[#FFFFFF] border-2 border-[#3A4F67] rounded-2xl p-4 sm:p-10 shadow-2xl space-y-5 sm:space-y-8 relative overflow-hidden w-full"
            >
              {/* Invoice Header */}
              <div className="border-b-2 border-[#3A4F67]/20 pb-4 sm:pb-6 text-left flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#3A4F67]">
                    <Sparkles className="w-4 h-4 text-[#51867E]" />
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase">
                      HANFORD HOTELS & RESORTS
                    </span>
                  </div>
                  <h2 className="font-serif italic text-2xl sm:text-3xl text-[#3A4F67]">Official Booking Invoice</h2>
                  <p className="text-[11px] sm:text-xs text-[#2C3744] font-medium">
                    Booking ID: <strong className="text-[#3A4F67]">{confirmedBooking.bookingId}</strong> | Date: {new Date().toLocaleDateString()}
                  </p>
                </div>

                {/* UNPAID Badge */}
                <div className="self-start sm:self-auto border-2 border-rose-600 text-rose-700 bg-rose-50/90 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-bold text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase shadow-sm flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>UNPAID</span>
                </div>
              </div>

              {/* Prominent Payment Callout */}
              <div className="bg-[#EAF2F1] border-2 border-[#88B2AB] p-4 sm:p-6 rounded-2xl text-center space-y-2 shadow-inner">
                <span className="text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.3em] text-[#3A4F67] uppercase block">
                  PAYMENT REQUIRED / AMOUNT DUE
                </span>
                <div className="text-2xl sm:text-5xl font-serif font-bold text-[#3A4F67] tracking-tight">
                  NEED TO PAY ${confirmedBooking.grandTotal.toLocaleString()}
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#2C3744] italic font-light">
                  Status: <strong className="text-rose-700 uppercase font-bold">UNPAID</strong> — Please complete payment via Bank Transfer or X DM Concierge.
                </p>
              </div>

              {/* Guest & Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-1">
                
                {/* Guest Details */}
                <div className="bg-[#EAF2F1]/40 border border-[#88B2AB]/30 p-4 sm:p-5 rounded-xl space-y-2 text-left">
                  <h4 className="text-xs font-bold text-[#3A4F67] uppercase tracking-wider border-b border-[#88B2AB]/20 pb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#51867E]" />
                    Guest Information
                  </h4>
                  <div className="text-[11px] sm:text-xs space-y-1 text-[#2C3744]">
                    <div><strong>Name:</strong> {confirmedBooking.inquiry.guestName}</div>
                    <div><strong>X Username:</strong> <span className="text-[#51867E] font-medium">@{confirmedBooking.inquiry.xUsername.replace(/^@/, '')}</span></div>
                    {confirmedBooking.inquiry.businessName && confirmedBooking.inquiry.businessName.trim() !== '' && (
                      <div><strong>Business Name:</strong> {confirmedBooking.inquiry.businessName.trim()}</div>
                    )}
                    <div><strong>Total Guests:</strong> {confirmedBooking.inquiry.totalGuests || 2} Person(s)</div>
                  </div>
                </div>

                {/* Property & Stay Details */}
                <div className="bg-[#EAF2F1]/40 border border-[#88B2AB]/30 p-4 sm:p-5 rounded-xl space-y-2 text-left">
                  <h4 className="text-xs font-bold text-[#3A4F67] uppercase tracking-wider border-b border-[#88B2AB]/20 pb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#51867E]" />
                    Reservation Details
                  </h4>
                  <div className="text-[11px] sm:text-xs space-y-1 text-[#2C3744]">
                    <div><strong>Destination:</strong> {confirmedBooking.property.name} ({confirmedBooking.property.country})</div>
                    <div><strong>Booking Category:</strong> <span className="uppercase font-semibold text-[#3A4F67]">{confirmedBooking.inquiry.bookOption.replace('_', ' ')}</span></div>
                    
                    {confirmedBooking.inquiry.bookOption === 'meeting' && (
                      <>
                        <div>
                          <strong>Accommodation:</strong>{' '}
                          <span className="uppercase font-semibold text-[#51867E]">
                            {confirmedBooking.inquiry.accommodationOption === 'with' ? 'WITH ACCOMMODATION' : 'WITHOUT ACCOMMODATION'}
                          </span>
                        </div>
                        <div>
                          <strong>Venue Rate:</strong>{' '}
                          <span className="uppercase font-medium text-[#3A4F67]">
                            {getVenueRateLabel(confirmedBooking.inquiry.venueRentalRate)}
                          </span>
                        </div>
                      </>
                    )}

                    {confirmedBooking.nights > 0 && (
                      <>
                        <div><strong>Dates:</strong> {confirmedBooking.inquiry.checkInDate} to {confirmedBooking.inquiry.checkOutDate}</div>
                        <div><strong>Duration:</strong> {confirmedBooking.nights} Night(s)</div>
                      </>
                    )}

                    {showVenueSettings && (
                      <>
                        <div><strong>Event Date:</strong> {confirmedBooking.inquiry.eventDate}</div>
                        <div><strong>Attendees:</strong> {confirmedBooking.inquiry.eventAttendees} Pax</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Itemized Price Breakdown Table */}
              <div className="space-y-2 sm:space-y-3 pt-1">
                <h4 className="text-xs font-bold text-[#3A4F67] uppercase tracking-wider text-left flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#51867E]" />
                  Itemized Pricing Breakdown
                </h4>

                <div className="border border-[#88B2AB]/40 rounded-xl overflow-hidden text-[10px] sm:text-xs w-full">
                  <div className="bg-[#3A4F67] text-white p-2.5 sm:p-3 font-bold grid grid-cols-12 text-left items-center">
                    <div className="col-span-5 sm:col-span-6">Description</div>
                    <div className="col-span-3 text-center">Qty / Days</div>
                    <div className="col-span-4 sm:col-span-3 text-right">Amount</div>
                  </div>

                  <div className="divide-y divide-[#88B2AB]/20 bg-white">
                    {/* Room Breakdown */}
                    {confirmedBooking.inquiry.standardRooms! > 0 && (
                      <div className="p-2.5 sm:p-3 grid grid-cols-12 text-left items-center">
                        <div className="col-span-5 sm:col-span-6 font-medium text-[#2C3744] pr-1">
                          Standard Room (${priceStandard.toLocaleString()} / night)
                        </div>
                        <div className="col-span-3 text-center text-[#3A4F67]">
                          {confirmedBooking.inquiry.standardRooms} Rm × {confirmedBooking.nights} N
                        </div>
                        <div className="col-span-4 sm:col-span-3 text-right font-semibold text-[#3A4F67]">
                          ${((confirmedBooking.inquiry.standardRooms || 0) * priceStandard * confirmedBooking.nights).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {confirmedBooking.inquiry.deluxeRooms! > 0 && (
                      <div className="p-2.5 sm:p-3 grid grid-cols-12 text-left items-center">
                        <div className="col-span-5 sm:col-span-6 font-medium text-[#2C3744] pr-1">
                          Deluxe Room (${priceDeluxe.toLocaleString()} / night)
                        </div>
                        <div className="col-span-3 text-center text-[#3A4F67]">
                          {confirmedBooking.inquiry.deluxeRooms} Rm × {confirmedBooking.nights} N
                        </div>
                        <div className="col-span-4 sm:col-span-3 text-right font-semibold text-[#3A4F67]">
                          ${((confirmedBooking.inquiry.deluxeRooms || 0) * priceDeluxe * confirmedBooking.nights).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {confirmedBooking.inquiry.presidentialSuites! > 0 && (
                      <div className="p-2.5 sm:p-3 grid grid-cols-12 text-left items-center">
                        <div className="col-span-5 sm:col-span-6 font-medium text-[#2C3744] pr-1">
                          Presidential Suite (${pricePresidential.toLocaleString()} / night)
                        </div>
                        <div className="col-span-3 text-center text-[#3A4F67]">
                          {confirmedBooking.inquiry.presidentialSuites} Ste × {confirmedBooking.nights} N
                        </div>
                        <div className="col-span-4 sm:col-span-3 text-right font-semibold text-[#3A4F67]">
                          ${((confirmedBooking.inquiry.presidentialSuites || 0) * pricePresidential * confirmedBooking.nights).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {confirmedBooking.inquiry.privateVillas! > 0 && pricePrivateVilla && (
                      <div className="p-2.5 sm:p-3 grid grid-cols-12 text-left items-center">
                        <div className="col-span-5 sm:col-span-6 font-medium text-[#2C3744] pr-1">
                          Private Villa (${pricePrivateVilla.toLocaleString()} / night)
                        </div>
                        <div className="col-span-3 text-center text-[#3A4F67]">
                          {confirmedBooking.inquiry.privateVillas} Villa × {confirmedBooking.nights} N
                        </div>
                        <div className="col-span-4 sm:col-span-3 text-right font-semibold text-[#3A4F67]">
                          ${((confirmedBooking.inquiry.privateVillas || 0) * pricePrivateVilla * confirmedBooking.nights).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* Event / Meeting Venue Breakdown */}
                    {confirmedBooking.eventSubtotal > 0 && (
                      <div className="p-2.5 sm:p-3 grid grid-cols-12 text-left items-center">
                        <div className="col-span-5 sm:col-span-6 font-medium text-[#2C3744] pr-1">
                          {confirmedBooking.inquiry.bookOption === 'meeting'
                            ? `Meeting Room Rental (${getVenueRateLabel(confirmedBooking.inquiry.venueRentalRate)})`
                            : `Event Hall Rental ($${priceEventHall.toLocaleString()} Flat Rate)`}
                        </div>
                        <div className="col-span-3 text-center text-[#3A4F67]">
                          {confirmedBooking.inquiry.eventAttendees} Pax
                        </div>
                        <div className="col-span-4 sm:col-span-3 text-right font-semibold text-[#3A4F67]">
                          ${confirmedBooking.eventSubtotal.toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* Service Tax */}
                    <div className="p-2.5 sm:p-3 grid grid-cols-12 text-left bg-[#EAF2F1]/20 items-center">
                      <div className="col-span-8 sm:col-span-9 font-medium text-[#3A4F67]">
                        Luxury Hospitality Tax & Service Fee (10%)
                      </div>
                      <div className="col-span-4 sm:col-span-3 text-right font-semibold text-[#3A4F67]">
                        ${confirmedBooking.taxAmount.toLocaleString()}
                      </div>
                    </div>

                    {/* Grand Total */}
                    <div className="p-3 sm:p-4 grid grid-cols-12 text-left bg-[#3A4F67] text-white font-bold text-xs sm:text-sm items-center">
                      <div className="col-span-6 uppercase tracking-wider">TOTAL AMOUNT DUE</div>
                      <div className="col-span-6 text-right text-sm sm:text-base text-[#88B2AB]">
                        ${confirmedBooking.grandTotal.toLocaleString()} USD
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="bg-[#EAF2F1]/60 border border-[#88B2AB]/30 p-4 sm:p-5 rounded-xl text-left space-y-3 text-xs">
                <h4 className="font-bold text-[#3A4F67] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#51867E]" />
                  Payment Instructions
                </h4>
                <p className="text-[#2C3744] font-light leading-relaxed">
                  Please remit payment using your preferred method below within 48 hours to confirm your reservation:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                  <div className="bg-white p-3 rounded-lg border border-[#88B2AB]/20">
                    <strong className="text-[#3A4F67] block">Bank Wire Transfer:</strong>
                    <div>Bank: Hanford Global Luxury Bank</div>
                    <div>Account: 8840-1920-7731</div>
                    <div>Swift: HNFGLXWW</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#88B2AB]/20">
                    <strong className="text-[#3A4F67] block">Direct Concierge Confirmation on X:</strong>
                    <div>Official Handle: <a href="https://x.com/7inchesunder" target="_blank" rel="noopener noreferrer" className="text-[#51867E] underline font-bold">@7inchesunder</a></div>
                    <div>Send Booking ID: <strong>{confirmedBooking.bookingId}</strong></div>
                  </div>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-3 sm:pt-4 border-t border-[#88B2AB]/20 text-center text-[10px] text-[#3A4F67] font-light flex items-center justify-between">
                <span>© 2026 Hanford Hotels & Resorts Central Register</span>
                <span className="flex items-center gap-1 font-semibold text-[#51867E]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Reservation
                </span>
              </div>
            </div>

            {/* Action Buttons below Invoice */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
              <button
                onClick={handleDownloadInvoice}
                disabled={isGeneratingImage}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-full text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>SAVE / DOWNLOAD INVOICE (PNG)</span>
              </button>

              <button
                onClick={() => setConfirmedBooking(null)}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 border border-[#3A4F67] text-[#3A4F67] hover:bg-[#3A4F67]/10 rounded-full text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-colors cursor-pointer"
              >
                CREATE NEW RESERVATION
              </button>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------------ */
          /* MAIN INTERACTIVE BOOKING FORM */
          /* ------------------------------------------------------------------ */
          <form
            onSubmit={handleSubmit}
            className="info-panel bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl p-4 sm:p-10 shadow-xl space-y-6 sm:space-y-8 text-left"
          >
            {errorMessage && (
              <div className="p-4 bg-rose-100 border border-rose-300 text-rose-900 text-xs rounded-xl flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Location Selection & Live Pricing Card */}
            <div className="space-y-3">
              <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                1. HOTEL / RESORT LOCATION *
                <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  pilih lokasi hotel atau resort hanford
                </span>
              </label>

              {loadingLocations ? (
                <div className="h-12 bg-[#88B2AB]/20 animate-pulse rounded-full" />
              ) : (
                <div className="relative">
                  <select
                    value={formData.propertySlug}
                    onChange={(e) => handlePropertyChange(e.target.value)}
                    required
                    className="w-full px-5 py-3.5 bg-white border border-[#88B2AB]/40 rounded-full text-xs text-[#2C3744] font-semibold focus:outline-none focus:border-[#51867E] appearance-none cursor-pointer"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-[#51867E] absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}

              {/* Dynamic Rates Banner */}
              {selectedProperty && (
                <div className="bg-white p-4 rounded-2xl border border-[#88B2AB]/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#88B2AB]/20 pb-2">
                    <span className="font-bold text-[#3A4F67] flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#51867E]" />
                      Dynamically Fetched Pricing (Google Sheets)
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#EAF2F1] text-[#3A4F67] border border-[#88B2AB]/30 uppercase">
                      {isEcoResort ? 'Eco Resort' : 'Grand Hotel'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
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

                    {isEcoResort && pricePrivateVilla ? (
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
            <div className="space-y-4 pt-4 border-t border-[#88B2AB]/30">
              <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                2. GUEST INFORMATION *
                <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  informasi data lengkap pemesan
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
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
                    className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
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
                    className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
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
                    className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 3. Booking Category Selection */}
            <div className="space-y-4 pt-4 border-t border-[#88B2AB]/30">
              <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                3. BOOKING CATEGORY *
                <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  pilih kategori jenis pemesanan
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Category: ROOM */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'room' })}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                    formData.bookOption === 'room'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Hotel className={`w-4 h-4 ${formData.bookOption === 'room' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'room' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      ROOM
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'room' ? 'text-white' : 'text-[#3A4F67]'}`}>ROOM STAY</h3>
                    <p className={`text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'room' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
                      Standard, Deluxe, Suite, Villa
                    </p>
                  </div>
                </button>

                {/* Category: EVENT LOCATION */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'event' })}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                    formData.bookOption === 'event'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <PartyPopper className={`w-4 h-4 ${formData.bookOption === 'event' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'event' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      EVENT
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'event' ? 'text-white' : 'text-[#3A4F67]'}`}>EVENT LOCATION</h3>
                    <p className={`text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'event' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
                      Hall / Ballroom rental & Catering
                    </p>
                  </div>
                </button>

                {/* Category: BOTH ROOM & EVENT */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'both' })}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                    formData.bookOption === 'both'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Layers className={`w-4 h-4 ${formData.bookOption === 'both' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'both' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      BOTH
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'both' ? 'text-white' : 'text-[#3A4F67]'}`}>ROOM & EVENT</h3>
                    <p className={`text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'both' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
                      Combined stay & event venue
                    </p>
                  </div>
                </button>

                {/* Category: MEETING */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'meeting' })}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                    formData.bookOption === 'meeting'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Users className={`w-4 h-4 ${formData.bookOption === 'meeting' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'meeting' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      MEETING
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'meeting' ? 'text-white' : 'text-[#3A4F67]'}`}>MEETING ROOM</h3>
                    <p className={`text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'meeting' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
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

            {/* 3.2 VENUE RENTAL RATE (Only for Meeting Room) */}
            {formData.bookOption === 'meeting' && (
              <div className="space-y-3 pt-4 border-t border-[#88B2AB]/30 animate-in fade-in duration-300">
                <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                  VENUE RENTAL RATE *
                  <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                    pilih paket durasi dan layanan venue meeting room
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* HALF DAY */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, venueRentalRate: 'half_day' })}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 cursor-pointer ${
                      formData.venueRentalRate === 'half_day'
                        ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                        : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider">HALF DAY</span>
                      {formData.venueRentalRate === 'half_day' && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <p className={`text-[11px] font-bold ${formData.venueRentalRate === 'half_day' ? 'text-white' : 'text-[#3A4F67]'}`}>
                      Maximum 4–5 hours
                    </p>
                    <p className={`text-[10px] font-light leading-snug ${formData.venueRentalRate === 'half_day' ? 'text-[#EAF2F1]' : 'text-[#2C3744]'}`}>
                      Includes 1× coffee break or 1× meal
                    </p>
                  </button>

                  {/* FULL DAY */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, venueRentalRate: 'full_day' })}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 cursor-pointer ${
                      formData.venueRentalRate === 'full_day'
                        ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                        : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider">FULL DAY</span>
                      {formData.venueRentalRate === 'full_day' && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <p className={`text-[11px] font-bold ${formData.venueRentalRate === 'full_day' ? 'text-white' : 'text-[#3A4F67]'}`}>
                      Maximum 8–9 hours
                    </p>
                    <p className={`text-[10px] font-light leading-snug ${formData.venueRentalRate === 'full_day' ? 'text-[#EAF2F1]' : 'text-[#2C3744]'}`}>
                      Includes 2× coffee breaks and 1× meal
                    </p>
                  </button>

                  {/* FULL BOARD */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, venueRentalRate: 'full_board' })}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 cursor-pointer ${
                      formData.venueRentalRate === 'full_board'
                        ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                        : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider">FULL BOARD</span>
                      {formData.venueRentalRate === 'full_board' && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <p className={`text-[11px] font-bold ${formData.venueRentalRate === 'full_board' ? 'text-white' : 'text-[#3A4F67]'}`}>
                      Maximum 10–12 hours
                    </p>
                    <p className={`text-[10px] font-light leading-snug ${formData.venueRentalRate === 'full_board' ? 'text-[#EAF2F1]' : 'text-[#2C3744]'}`}>
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
            <div className="space-y-4 pt-4 border-t border-[#88B2AB]/30">
              <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                4. SCHEDULE & DATES *
                <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  tentukan tanggal reservasi stay / event
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {showRoomsAndDates && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
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
                        className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
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
                        className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {showVenueSettings && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
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
                      className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 5. Venue Attendees & Event Addons (Only for Event or Meeting) */}
            {showVenueSettings && (
              <div className="space-y-4 pt-4 border-t border-[#88B2AB]/30 animate-in fade-in duration-300">
                <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                  5. VENUE & ATTENDEES CONFIGURATION *
                  <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                    konfigurasi kapasitas tamu dan fasilitas tambahan
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
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
                      className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-bold"
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
                    <div>
                      <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
                        <span className="flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-[#51867E]" />
                          CATERING ADD-ON *
                        </span>
                      </label>
                      <select
                        required
                        value={formData.eventAddons || ''}
                        onChange={(e) => setFormData({ ...formData, eventAddons: e.target.value as EventAddonOption })}
                        className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-semibold cursor-pointer"
                      >
                        <option value="" disabled hidden>-- Select Catering Option --</option>
                        <option value="none">Venue Only (No Catering)</option>
                        <option value="catering">Include Gourmet Catering (+${priceCateringPerPax}/pax)</option>
                        <option value="both">Include Catering & Deluxe Decoration (+${priceCateringPerPax}/pax)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. Room Quantities & Capacity Info (If ROOM, BOTH, or MEETING WITH ACCOMMODATION) */}
            {showRoomsAndDates && (
              <div className="space-y-4 pt-4 border-t border-[#88B2AB]/30 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                    ROOM QUANTITIES & SELECTION *
                    <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                      pilih jumlah unit untuk setiap tipe kamar
                    </span>
                  </label>

                  <span className="text-[10px] font-bold text-[#3A4F67] bg-white px-3 py-1 rounded-full border border-[#88B2AB]/30">
                    Total Selected: {(formData.standardRooms || 0) + (formData.deluxeRooms || 0) + (formData.presidentialSuites || 0) + (formData.privateVillas || 0)} Room(s)
                  </span>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${isEcoResort ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
                  {/* Standard Room */}
                  <div className="bg-white p-4 rounded-2xl border border-[#88B2AB]/30 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-[#3A4F67]">Standard Room</h4>
                          <span className="text-[11px] font-semibold text-[#51867E]">
                            ${priceStandard.toLocaleString()} / night
                          </span>
                        </div>
                      </div>

                      {/* Room Capacity Note */}
                      <div className="text-[10px] text-[#51867E] font-medium bg-[#EAF2F1] px-2.5 py-1.5 rounded-lg border border-[#88B2AB]/20 flex items-center gap-1.5 mt-2">
                        <Users className="w-3 h-3 shrink-0" />
                        <span>{selectedProperty?.capacityStandard || 'Max 3 guests per room (including adults and children)'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#EAF2F1]/50 p-2 rounded-xl border border-[#88B2AB]/20 mt-3">
                      <button
                        type="button"
                        onClick={() => handleRoomCountChange('standardRooms', (formData.standardRooms || 0) - 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-[#88B2AB]/40 font-bold text-base text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer"
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
                        placeholder=""
                        className="w-16 text-center bg-white border border-[#88B2AB]/30 rounded-lg py-1 text-xs font-bold text-[#3A4F67] focus:outline-none focus:border-[#51867E]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRoomCountChange('standardRooms', (formData.standardRooms || 0) + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-[#88B2AB]/40 font-bold text-base text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Deluxe Room */}
                  <div className="bg-white p-4 rounded-2xl border border-[#88B2AB]/30 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-[#3A4F67]">Deluxe Room</h4>
                          <span className="text-[11px] font-semibold text-[#51867E]">
                            ${priceDeluxe.toLocaleString()} / night
                          </span>
                        </div>
                      </div>

                      {/* Room Capacity Note */}
                      <div className="text-[10px] text-[#51867E] font-medium bg-[#EAF2F1] px-2.5 py-1.5 rounded-lg border border-[#88B2AB]/20 flex items-center gap-1.5 mt-2">
                        <Users className="w-3 h-3 shrink-0" />
                        <span>{selectedProperty?.capacityDeluxe || 'Max 3 guests per room (including adults and children)'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#EAF2F1]/50 p-2 rounded-xl border border-[#88B2AB]/20 mt-3">
                      <button
                        type="button"
                        onClick={() => handleRoomCountChange('deluxeRooms', (formData.deluxeRooms || 0) - 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-[#88B2AB]/40 font-bold text-base text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer"
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
                        placeholder=""
                        className="w-16 text-center bg-white border border-[#88B2AB]/30 rounded-lg py-1 text-xs font-bold text-[#3A4F67] focus:outline-none focus:border-[#51867E]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRoomCountChange('deluxeRooms', (formData.deluxeRooms || 0) + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-[#88B2AB]/40 font-bold text-base text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Presidential Suite */}
                  <div className="bg-white p-4 rounded-2xl border border-[#88B2AB]/30 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-[#3A4F67]">Presidential Suite</h4>
                          <span className="text-[11px] font-semibold text-[#51867E]">
                            ${pricePresidential.toLocaleString()} / night
                          </span>
                        </div>
                      </div>

                      {/* Room Capacity Note */}
                      <div className="text-[10px] text-[#51867E] font-medium bg-[#EAF2F1] px-2.5 py-1.5 rounded-lg border border-[#88B2AB]/20 flex items-center gap-1.5 mt-2">
                        <Users className="w-3 h-3 shrink-0" />
                        <span>{selectedProperty?.capacityPresidential || 'Max 5 guests per suite (including adults and children)'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#EAF2F1]/50 p-2 rounded-xl border border-[#88B2AB]/20 mt-3">
                      <button
                        type="button"
                        onClick={() => handleRoomCountChange('presidentialSuites', (formData.presidentialSuites || 0) - 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-[#88B2AB]/40 font-bold text-base text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer"
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
                        placeholder=""
                        className="w-16 text-center bg-white border border-[#88B2AB]/30 rounded-lg py-1 text-xs font-bold text-[#3A4F67] focus:outline-none focus:border-[#51867E]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRoomCountChange('presidentialSuites', (formData.presidentialSuites || 0) + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-[#88B2AB]/40 font-bold text-base text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Private Villa (Eco Resort Only) */}
                  {isEcoResort && pricePrivateVilla && (
                    <div className="bg-white p-4 rounded-2xl border border-[#51867E]/40 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-[#3A4F67]">Private Villa</h4>
                            <span className="text-[11px] font-semibold text-[#51867E]">
                              ${pricePrivateVilla.toLocaleString()} / night
                            </span>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#51867E] text-white">
                            ECO ONLY
                          </span>
                        </div>

                        {/* Room Capacity Note */}
                        <div className="text-[10px] text-[#51867E] font-medium bg-[#EAF2F1] px-2.5 py-1.5 rounded-lg border border-[#88B2AB]/20 flex items-center gap-1.5 mt-2">
                          <Users className="w-3 h-3 shrink-0" />
                          <span>{selectedProperty?.capacityPrivateVilla || 'Max 6 guests per villa (including adults and children)'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-[#EAF2F1]/50 p-2 rounded-xl border border-[#88B2AB]/20 mt-3">
                        <button
                          type="button"
                          onClick={() => handleRoomCountChange('privateVillas', (formData.privateVillas || 0) - 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-[#88B2AB]/40 font-bold text-base text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer"
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
                          placeholder=""
                          className="w-16 text-center bg-white border border-[#88B2AB]/30 rounded-lg py-1 text-xs font-bold text-[#3A4F67] focus:outline-none focus:border-[#51867E]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRoomCountChange('privateVillas', (formData.privateVillas || 0) + 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-[#88B2AB]/40 font-bold text-base text-[#3A4F67] flex items-center justify-center hover:bg-[#88B2AB]/10 cursor-pointer"
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
            <div className="bg-[#3A4F67] text-white p-6 rounded-2xl border border-[#88B2AB]/30 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#88B2AB]/30 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#EAF2F1] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#88B2AB]" />
                  Live Estimation Summary
                </span>
                <span className="text-[10px] bg-[#88B2AB] text-[#1E293B] font-bold px-3 py-1 rounded-full uppercase">
                  10% Tax Included
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                {showRoomsAndDates && currentRoomSubtotal > 0 && (
                  <div className="flex justify-between text-[#EAF2F1]">
                    <span>Room Accommodation ({currentNights} Night/s):</span>
                    <strong className="font-mono text-white">${currentRoomSubtotal.toLocaleString()}</strong>
                  </div>
                )}

                {showVenueSettings && currentEventSubtotal > 0 && (
                  <div className="flex justify-between text-[#EAF2F1]">
                    <span>
                      {formData.bookOption === 'meeting'
                        ? `Venue Rental & Meeting Package (${getVenueRateLabel(formData.venueRentalRate)}):`
                        : `Event Hall Rental ($${priceEventHall.toLocaleString()} Flat Rate):`}
                    </span>
                    <strong className="font-mono text-white">${currentEventSubtotal.toLocaleString()}</strong>
                  </div>
                )}

                <div className="flex justify-between text-[#EAF2F1]">
                  <span>Hospitality Tax & Service Fee (10%):</span>
                  <strong className="font-mono text-white">${currentTaxAmount.toLocaleString()}</strong>
                </div>

                <div className="pt-3 border-t border-[#88B2AB]/30 flex justify-between items-baseline">
                  <span className="text-sm font-bold uppercase tracking-wider text-white">Estimated Grand Total:</span>
                  <span className="text-2xl font-serif font-bold text-[#88B2AB]">${currentGrandTotal.toLocaleString()} USD</span>
                </div>
              </div>
            </div>

            {/* 8. Additional Notes / Special Instructions */}
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                Special Requirements & Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Mention dietary preferences, arrival times, or bespoke event setups..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-4 bg-white border border-[#88B2AB]/30 rounded-2xl text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-full text-xs font-bold tracking-[0.25em] uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-[#88B2AB]/40"
            >
              {submitting ? (
                <span>Registering Booking in Live Central Register...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>CONFIRM & REGISTER RESERVATION</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
