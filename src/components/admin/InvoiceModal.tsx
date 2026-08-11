import React, { useState, useEffect, useRef } from 'react';
import { BookingInquiry, Property } from '../../types';
import { fetchLocations } from '../../services/dataService';
import { getBookingTypeLabel } from '../../utils/bookingUtils';
import { exportInvoiceAsImage } from '../../utils/exportInvoiceImage';
import { X, CheckCircle, Clock, FileText, Building, Download, Image as ImageIcon, Loader2, MapPin } from 'lucide-react';

interface InvoiceModalProps {
  booking: BookingInquiry;
  onClose: () => void;
  onTogglePaymentStatus: (bookingId: string, currentStatus: 'UNPAID' | 'PAID') => void;
}

function calculateNights(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 1;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return 1;
  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  booking,
  onClose,
  onTogglePaymentStatus
}) => {
  const [matchedProperty, setMatchedProperty] = useState<Property | null>(null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const exportInvoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    fetchLocations().then((res) => {
      if (!isMounted) return;
      const propsList = res.data || [];
      const matched = propsList.find(
        (p) =>
          p.slug === booking.propertySlug ||
          p.name.toLowerCase() === (booking.propertyName || '').toLowerCase()
      );
      if (matched) {
        setMatchedProperty(matched);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [booking.propertySlug, booking.propertyName]);

  const isPaid = booking.paymentStatus === 'PAID';
  const bookingId = booking.bookingId || booking.id || 'HNF-2026-INV';
  const dateStr = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const totalRooms =
    (booking.standardRooms || 0) +
    (booking.deluxeRooms || 0) +
    (booking.presidentialSuites || 0) +
    (booking.privateVillas || 0);

  const priceStandard = booking.priceStandardRoom || matchedProperty?.priceStandard || matchedProperty?.priceFrom || 850;
  const priceDeluxe = booking.priceDeluxeRoom || matchedProperty?.priceDeluxe || Math.round(priceStandard * 1.45);
  const pricePresidential = booking.pricePresidentialSuite || matchedProperty?.pricePresidential || Math.round(priceStandard * 3.8);
  const pricePrivateVilla = booking.pricePrivateVilla || matchedProperty?.pricePrivateVilla || Math.round(priceStandard * 5.2);
  const getVenueMultiplier = (rate?: string) => {
    if (rate === 'half_day') return 0.4;
    if (rate === 'full_board') return 1.2;
    return 1.0;
  };

  const baseCatering = matchedProperty?.priceCateringPerPax || 75;
  const baseMeetingRoom = matchedProperty?.priceMeetingRoom || 120;

  const priceMeetingRoom = booking.priceMeetingRoom !== undefined && booking.priceMeetingRoom > 0
    ? booking.priceMeetingRoom
    : Math.round(baseMeetingRoom * getVenueMultiplier(booking.venueRentalRate));

  const priceCateringPerPax = booking.priceCateringPerPax !== undefined && booking.priceCateringPerPax > 0
    ? booking.priceCateringPerPax
    : Math.round(baseCatering * getVenueMultiplier(booking.venueRentalRate));
  const priceEventHall = booking.priceEventHall || matchedProperty?.priceEventHall || 3200;

  const nights = booking.numberOfNights || calculateNights(booking.checkInDate, booking.checkOutDate);

  const standardAmt = (booking.standardRooms || 0) * priceStandard * nights;
  const deluxeAmt = (booking.deluxeRooms || 0) * priceDeluxe * nights;
  const presidentialAmt = (booking.presidentialSuites || 0) * pricePresidential * nights;
  const villaAmt = (booking.privateVillas || 0) * pricePrivateVilla * nights;

  let eventAmt = 0;
  if (booking.bookOption === 'meeting' || booking.bookOption === 'room_meeting') {
    eventAmt = (booking.eventAttendees || 1) * priceMeetingRoom;
  } else if (booking.bookOption === 'event' || booking.bookOption === 'both' || booking.eventAttendees) {
    eventAmt = priceEventHall;
  }

  let cateringAmt = 0;
  if (booking.cateringPax || booking.eventAddons === 'catering' || booking.eventAddons === 'both') {
    const pax = booking.cateringPax || booking.eventAttendees || 1;
    cateringAmt = pax * priceCateringPerPax;
  }

  const customItems = booking.customLineItems || [];
  const customItemsAmt = customItems.reduce((acc, item) => acc + (item.amount || 0), 0);

  const fallbackRoomAmt = (totalRooms === 0 && !booking.eventAttendees && customItems.length === 0 && booking.bookOption !== 'custom_only')
    ? (booking.totalAmount ? Math.round(booking.totalAmount / 1.1) : priceStandard)
    : 0;

  const calculatedSubtotal = standardAmt + deluxeAmt + presidentialAmt + villaAmt + eventAmt + cateringAmt + customItemsAmt + fallbackRoomAmt;
  const shippingFee = booking.shippingFee || 0;

  const rawSubtotal = calculatedSubtotal > 0
    ? calculatedSubtotal
    : (booking.subtotalBeforeDiscount || (booking.totalAmount ? Math.round(booking.totalAmount / 1.1) : 0));

  const discountCode = booking.discountCode || matchedProperty?.discountCode || '';
  const discountPercent = booking.discountPercent || (discountCode ? matchedProperty?.discountPercent || 0 : 0);
  const discountAmount =
    booking.discountAmount !== undefined && booking.discountAmount >= 0
      ? booking.discountAmount
      : discountPercent > 0
      ? Math.round(rawSubtotal * (discountPercent / 100))
      : 0;

  const subtotalBeforeTax = Math.max(0, rawSubtotal - discountAmount);
  const finalTax = Math.round((subtotalBeforeTax + shippingFee) * 0.1);
  const finalGrandTotal = subtotalBeforeTax + shippingFee + finalTax;

  const handleDownloadImage = async () => {
    try {
      setIsDownloadingImage(true);
      const fileName = `Invoice-${bookingId}.png`;
      await exportInvoiceAsImage(
        exportInvoiceRef.current,
        invoiceRef.current,
        fileName
      );
    } catch (err) {
      console.error('Failed to download invoice image:', err);
      alert('Gagal mengunduh gambar invoice. Silakan coba lagi.');
    } finally {
      setIsDownloadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 flex justify-center items-start print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
        
        {/* Modal Action Controls (Hidden during print) */}
        <div className="p-3 sm:p-4 bg-[#3A4F67] text-white flex flex-wrap items-center justify-between gap-3 print:hidden sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#88B2AB]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              INVOICE MANAGEMENT &bull; #{bookingId}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onTogglePaymentStatus(bookingId, isPaid ? 'PAID' : 'UNPAID')}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isPaid
                  ? 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border border-amber-400/30'
                  : 'bg-[#51867E] text-white hover:bg-[#3f6d66] border border-white/20'
              }`}
            >
              Mark as {isPaid ? 'UNPAID' : 'PAID'}
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={isDownloadingImage}
              className="px-3.5 py-1.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              title="Download Invoice Image"
            >
              {isDownloadingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer ml-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Sheet */}
        <div className="p-6 sm:p-10 bg-white text-[#2C3744] print:p-8" id="printable-invoice" ref={invoiceRef}>
          
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-8 gap-6">
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-light text-[#3A4F67] tracking-[0.2em] uppercase flex items-center gap-2">
                <span>HANFORD</span>
                <span className="w-2 h-2 rounded-full bg-[#51867E]" />
              </div>
              <p className="text-[11px] font-semibold text-[#51867E] uppercase tracking-widest mt-1">
                HOTELS & RESORTS &bull; CENTRAL RESERVATIONS
              </p>
              <p className="text-xs text-slate-600 mt-1.5 font-medium italic">
                An Elevated Way of Staying
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
                <svg className="w-3.5 h-3.5 fill-current text-slate-800 shrink-0" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>x.com/Hanford_HnR</span>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-slate-600 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                OFFICIAL RECEIPT / INVOICE
              </div>
              <div className="text-sm font-bold text-[#3A4F67]">Invoice No: <span className="font-mono">{bookingId}</span></div>
              <div className="text-xs text-slate-500">Date Issued: {dateStr}</div>

              {/* Status Stamp */}
              <div className="pt-2">
                {isPaid ? (
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#51867E]/10 border-2 border-[#51867E] text-[#51867E] rounded-md font-bold text-xs uppercase tracking-widest">
                    <CheckCircle className="w-4 h-4 text-[#51867E]" />
                    <span>PAID IN FULL</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 border-2 border-amber-500 text-amber-700 rounded-md font-bold text-xs uppercase tracking-widest">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>UNPAID - INVOICE PENDING</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guest & Property Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8 text-xs">
            {/* Guest Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-left">
              <span className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider block">
                Guest Information
              </span>
              <div className="space-y-1 text-[#2C3744]">
                <div><strong>Name:</strong> {booking.guestName || 'Trevor'}</div>
                <div>
                  <strong>X Username:</strong>{' '}
                  <span className="text-[#51867E] font-medium font-mono">
                    @{booking.xUsername ? booking.xUsername.replace(/^@/, '') : 'DEF'}
                  </span>
                </div>
                {booking.businessName && booking.businessName.trim() && booking.businessName.trim().toUpperCase() !== 'HANFORD' ? (
                  <div>
                    <strong>Business Name:</strong> {booking.businessName.trim()}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider block">
                Property / Location
              </span>
              <div className="font-bold text-sm text-[#3A4F67] flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#51867E]" />
                <span>{booking.propertyName}</span>
              </div>
              <div className="text-slate-600 flex items-start gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#51867E] mt-0.5 shrink-0" />
                <span>
                  {matchedProperty?.address
                    ? `${matchedProperty.address}${matchedProperty.country ? `, ${matchedProperty.country}` : ''}`
                    : 'Hanford Central Estate & Hospitality Precinct'}
                </span>
              </div>
              <div className="text-slate-600 pt-0.5">
                Booking Type: <strong className="text-slate-800">{getBookingTypeLabel(booking)}</strong>
              </div>
              {booking.checkInDate && (
                <div className="text-slate-600">
                  Stay Dates: <strong>{booking.checkInDate}</strong> to <strong>{booking.checkOutDate || 'TBD'}</strong>
                  {nights ? ` (${nights} night${nights > 1 ? 's' : ''})` : ''}
                </div>
              )}
              {booking.eventDate && (
                <div className="text-slate-600">
                  Event Date: <strong>{booking.eventDate}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Breakdown List (No horizontal scroll on mobile) */}
          <div className="sm:hidden space-y-2.5 mb-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200">
              Breakdown Item & Layanan
            </div>

            {booking.standardRooms ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Standard Room</div>
                  <div className="text-[10px] text-slate-500">
                    ${priceStandard.toLocaleString()} / night &bull; {booking.standardRooms} Room(s) &times; {nights} Night(s)
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${standardAmt.toLocaleString()}
                </div>
              </div>
            ) : null}

            {booking.deluxeRooms ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Deluxe Room</div>
                  <div className="text-[10px] text-slate-500">
                    ${priceDeluxe.toLocaleString()} / night &bull; {booking.deluxeRooms} Room(s) &times; {nights} Night(s)
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${deluxeAmt.toLocaleString()}
                </div>
              </div>
            ) : null}

            {booking.presidentialSuites ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Presidential Suite</div>
                  <div className="text-[10px] text-slate-500">
                    ${pricePresidential.toLocaleString()} / night &bull; {booking.presidentialSuites} Suite(s) &times; {nights} Night(s)
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${presidentialAmt.toLocaleString()}
                </div>
              </div>
            ) : null}

            {booking.privateVillas ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Private Villa</div>
                  <div className="text-[10px] text-slate-500">
                    ${pricePrivateVilla.toLocaleString()} / night &bull; {booking.privateVillas} Villa(s) &times; {nights} Night(s)
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${villaAmt.toLocaleString()}
                </div>
              </div>
            ) : null}

            {booking.eventAttendees ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Event Space Rental</div>
                  <div className="text-[10px] text-slate-500">
                    {booking.bookOption === 'meeting' ? `$${priceMeetingRoom.toLocaleString()} / pax` : `$${priceEventHall.toLocaleString()} / hall`} &bull; {booking.eventAttendees} Attendees
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${eventAmt.toLocaleString()}
                </div>
              </div>
            ) : null}

            {booking.cateringPax ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Catering Service</div>
                  <div className="text-[10px] text-slate-500">
                    ${priceCateringPerPax.toLocaleString()} / pax &bull; {booking.cateringPax} Pax
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${cateringAmt.toLocaleString()}
                </div>
              </div>
            ) : null}

            {customItems.length > 0 && customItems.map((item, idx) => (
              <div key={item.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{item.productService || 'Custom Product / Service'}</div>
                  {item.description && <div className="text-[10px] text-slate-500">{item.description}</div>}
                  <div className="text-[10px] text-slate-400">
                    Qty: {item.qty} &bull; Rate: ${item.rate.toLocaleString()}
                    {item.serviceDate ? ` &bull; Date: ${item.serviceDate}` : ''}
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${(item.amount || 0).toLocaleString()}
                </div>
              </div>
            ))}

            {totalRooms === 0 && !booking.eventAttendees && customItems.length === 0 && booking.bookOption !== 'custom_only' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Room Reservation</div>
                  <div className="text-[10px] text-slate-500">
                    ${priceStandard.toLocaleString()} / night &bull; 1 Reservation
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${(booking.totalAmount ? Math.round(booking.totalAmount / 1.1) : priceStandard).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Breakdown Table */}
          <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden mb-8 w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#3A4F67] text-white uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-1/2">Item / Service Description</th>
                  <th className="py-3 px-4 text-center w-1/4">Qty / Pax</th>
                  <th className="py-3 px-4 text-right w-1/4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {booking.standardRooms ? (
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">Standard Room</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">${priceStandard.toLocaleString()} / night</div>
                    </td>
                    <td className="py-3 px-4 text-center">{booking.standardRooms} Room(s) × {nights} Night(s)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${standardAmt.toLocaleString()}</td>
                  </tr>
                ) : null}

                {booking.deluxeRooms ? (
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">Deluxe Room</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">${priceDeluxe.toLocaleString()} / night</div>
                    </td>
                    <td className="py-3 px-4 text-center">{booking.deluxeRooms} Room(s) × {nights} Night(s)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${deluxeAmt.toLocaleString()}</td>
                  </tr>
                ) : null}

                {booking.presidentialSuites ? (
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">Presidential Suite</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">${pricePresidential.toLocaleString()} / night</div>
                    </td>
                    <td className="py-3 px-4 text-center">{booking.presidentialSuites} Suite(s) × {nights} Night(s)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${presidentialAmt.toLocaleString()}</td>
                  </tr>
                ) : null}

                {booking.privateVillas ? (
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">Private Villa</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">${pricePrivateVilla.toLocaleString()} / night</div>
                    </td>
                    <td className="py-3 px-4 text-center">{booking.privateVillas} Villa(s) × {nights} Night(s)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${villaAmt.toLocaleString()}</td>
                  </tr>
                ) : null}

                {booking.eventAttendees ? (
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">Event Space Rental</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {booking.bookOption === 'meeting' ? `$${priceMeetingRoom.toLocaleString()} / pax` : `$${priceEventHall.toLocaleString()} / hall`}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{booking.eventAttendees} Attendees</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${eventAmt.toLocaleString()}</td>
                  </tr>
                ) : null}

                {booking.cateringPax ? (
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">Catering Service</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">${priceCateringPerPax.toLocaleString()} / pax</div>
                    </td>
                    <td className="py-3 px-4 text-center">{booking.cateringPax} Pax</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${cateringAmt.toLocaleString()}</td>
                  </tr>
                ) : null}

                {customItems.length > 0 && customItems.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.productService || 'Custom Service'}</div>
                      {item.description && <div className="text-[11px] text-slate-500 font-normal mt-0.5">{item.description}</div>}
                      {item.serviceDate && <div className="text-[10px] text-slate-400 font-mono mt-0.5">Date: {item.serviceDate}</div>}
                    </td>
                    <td className="py-3 px-4 text-center">{item.qty} Item(s) × ${item.rate.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${(item.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}

                {totalRooms === 0 && !booking.eventAttendees && customItems.length === 0 && booking.bookOption !== 'custom_only' && (
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">Room Reservation</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">${priceStandard.toLocaleString()} / night</div>
                    </td>
                    <td className="py-3 px-4 text-center">1 Reservation</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">
                      ${(booking.totalAmount ? Math.round(booking.totalAmount / 1.1) : priceStandard).toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-6">
            <div className="text-xs text-slate-500 space-y-2 max-w-xs text-left">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Notes / Instructions:</div>
              <p>{booking.notes || 'Reservation is processed under Hanford Central Hospitality guidelines.'}</p>
              {booking.noteToCustomer && (
                <div className="p-2.5 bg-[#51867E]/5 border border-[#51867E]/20 rounded-xl text-xs">
                  <div className="font-bold text-[#51867E] uppercase tracking-wider text-[9.5px]">Note to Customer:</div>
                  <p className="text-slate-700 italic mt-0.5">{booking.noteToCustomer}</p>
                </div>
              )}
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Before Discount:</span>
                <span className="font-mono font-semibold">${rawSubtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#51867E] font-medium">
                  <span>Discount ({discountCode || 'COUPON'} - {discountPercent}%):</span>
                  <span className="font-mono font-bold">-${discountAmount.toLocaleString()}</span>
                </div>
              )}
              {shippingFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Shipping / Extra Fee:</span>
                  <span className="font-mono font-semibold">${shippingFee.toLocaleString()}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Before Tax:</span>
                  <span className="font-mono font-semibold">${subtotalBeforeTax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Fees (10%):</span>
                <span className="font-mono font-semibold">${finalTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#3A4F67] border-t border-slate-200 pt-2">
                <span>Total Invoice:</span>
                <span className="font-mono text-[#51867E] text-base">
                  ${finalGrandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-10 pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 font-light tracking-wider">
            Thank you for choosing Hanford Hotels & Resorts. For questions regarding this invoice, contact central reservations at @Hanford_HnR on X.
          </div>

        </div>

        {/* Offscreen Hidden Container for Desktop-Width (800px) PNG Download */}
        <div className="fixed -left-[9999px] top-0 pointer-events-none opacity-100 z-[-9999] overflow-hidden" aria-hidden="true">
          <div className="p-10 bg-white text-[#2C3744] w-[800px] text-left" ref={exportInvoiceRef}>
            {/* Header & Logo */}
            <div className="flex flex-row justify-between items-start border-b border-slate-200 pb-8 gap-6">
              <div>
                <div className="text-3xl font-serif font-light text-[#3A4F67] tracking-[0.2em] uppercase flex items-center gap-2">
                  <span>HANFORD</span>
                  <span className="w-2 h-2 rounded-full bg-[#51867E]" />
                </div>
                <p className="text-[11px] font-semibold text-[#51867E] uppercase tracking-widest mt-1">
                  HOTELS & RESORTS &bull; CENTRAL RESERVATIONS
                </p>
                <p className="text-xs text-slate-600 mt-1.5 font-medium italic">
                  An Elevated Way of Staying
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
                  <svg className="w-3.5 h-3.5 fill-current text-slate-800 shrink-0" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>x.com/Hanford_HnR</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-slate-600 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                  OFFICIAL RECEIPT / INVOICE
                </div>
                <div className="text-sm font-bold text-[#3A4F67]">Invoice No: <span className="font-mono">{bookingId}</span></div>
                <div className="text-xs text-slate-500">Date Issued: {dateStr}</div>

                {/* Status Stamp */}
                <div className="pt-2">
                  {isPaid ? (
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#51867E]/10 border-2 border-[#51867E] text-[#51867E] rounded-md font-bold text-xs uppercase tracking-widest">
                      <CheckCircle className="w-4 h-4 text-[#51867E]" />
                      <span>PAID IN FULL</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 border-2 border-amber-500 text-amber-700 rounded-md font-bold text-xs uppercase tracking-widest">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>UNPAID - INVOICE PENDING</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Guest & Property Grid (2 columns) */}
            <div className="grid grid-cols-2 gap-8 my-8 text-xs">
              {/* Guest Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5 text-xs text-left">
                <span className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider block">
                  Guest Information
                </span>
                <div className="space-y-1 text-[#2C3744]">
                  <div><strong>Name:</strong> {booking.guestName || 'Trevor'}</div>
                  <div>
                    <strong>X Username:</strong>{' '}
                    <span className="text-[#51867E] font-medium font-mono">
                      @{booking.xUsername ? booking.xUsername.replace(/^@/, '') : 'DEF'}
                    </span>
                  </div>
                  {booking.businessName && booking.businessName.trim() && booking.businessName.trim().toUpperCase() !== 'HANFORD' ? (
                    <div>
                      <strong>Business Name:</strong> {booking.businessName.trim()}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Property Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider block">
                  Property / Location
                </span>
                <div className="font-bold text-sm text-[#3A4F67] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#51867E]" />
                  <span>{booking.propertyName}</span>
                </div>
                <div className="text-slate-600 flex items-start gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#51867E] mt-0.5 shrink-0" />
                  <span>
                    {matchedProperty?.address
                      ? `${matchedProperty.address}${matchedProperty.country ? `, ${matchedProperty.country}` : ''}`
                      : 'Hanford Central Estate & Hospitality Precinct'}
                  </span>
                </div>
                <div className="text-slate-600 pt-0.5">
                  Booking Type: <strong className="text-slate-800">{getBookingTypeLabel(booking)}</strong>
                </div>
                {booking.checkInDate && (
                  <div className="text-slate-600">
                    Stay Dates: <strong>{booking.checkInDate}</strong> to <strong>{booking.checkOutDate || 'TBD'}</strong>
                    {nights ? ` (${nights} night${nights > 1 ? 's' : ''})` : ''}
                  </div>
                )}
                {booking.eventDate && (
                  <div className="text-slate-600">
                    Event Date: <strong>{booking.eventDate}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Table Breakdown */}
            <div className="overflow-hidden rounded-xl border border-slate-200 my-6 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#3A4F67] text-white uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-1/2">Item / Service Description</th>
                    <th className="py-3 px-4 text-center w-1/4">Qty / Pax</th>
                    <th className="py-3 px-4 text-right w-1/4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {booking.standardRooms ? (
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">Standard Room</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">${priceStandard.toLocaleString()} / night</div>
                      </td>
                      <td className="py-3 px-4 text-center">{booking.standardRooms} Room(s) × {nights} Night(s)</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${standardAmt.toLocaleString()}</td>
                    </tr>
                  ) : null}

                  {booking.deluxeRooms ? (
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">Deluxe Room</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">${priceDeluxe.toLocaleString()} / night</div>
                      </td>
                      <td className="py-3 px-4 text-center">{booking.deluxeRooms} Room(s) × {nights} Night(s)</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${deluxeAmt.toLocaleString()}</td>
                    </tr>
                  ) : null}

                  {booking.presidentialSuites ? (
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">Presidential Suite</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">${pricePresidential.toLocaleString()} / night</div>
                      </td>
                      <td className="py-3 px-4 text-center">{booking.presidentialSuites} Suite(s) × {nights} Night(s)</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${presidentialAmt.toLocaleString()}</td>
                    </tr>
                  ) : null}

                  {booking.privateVillas ? (
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">Private Villa</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">${pricePrivateVilla.toLocaleString()} / night</div>
                      </td>
                      <td className="py-3 px-4 text-center">{booking.privateVillas} Villa(s) × {nights} Night(s)</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${villaAmt.toLocaleString()}</td>
                    </tr>
                  ) : null}

                  {booking.eventAttendees ? (
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">Event Space Rental</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {booking.bookOption === 'meeting' ? `$${priceMeetingRoom.toLocaleString()} / pax` : `$${priceEventHall.toLocaleString()} / hall`}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{booking.eventAttendees} Attendees</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${eventAmt.toLocaleString()}</td>
                    </tr>
                  ) : null}

                  {booking.cateringPax ? (
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">Catering Service</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">${priceCateringPerPax.toLocaleString()} / pax</div>
                      </td>
                      <td className="py-3 px-4 text-center">{booking.cateringPax} Pax</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${cateringAmt.toLocaleString()}</td>
                    </tr>
                  ) : null}

                  {customItems.length > 0 && customItems.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{item.productService || 'Custom Service'}</div>
                        {item.description && <div className="text-[11px] text-slate-500 font-normal mt-0.5">{item.description}</div>}
                        {item.serviceDate && <div className="text-[10px] text-slate-400 font-mono mt-0.5">Date: {item.serviceDate}</div>}
                      </td>
                      <td className="py-3 px-4 text-center">{item.qty} Item(s) × ${item.rate.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${(item.amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}

                  {totalRooms === 0 && !booking.eventAttendees && customItems.length === 0 && (
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">Room Reservation</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">${priceStandard.toLocaleString()} / night</div>
                      </td>
                      <td className="py-3 px-4 text-center">1 Reservation</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">
                        ${(booking.totalAmount ? Math.round(booking.totalAmount / 1.1) : priceStandard).toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pricing Summary */}
            <div className="flex flex-row justify-between items-start gap-6 border-t border-slate-200 pt-6">
              <div className="text-xs text-slate-500 space-y-2 max-w-xs text-left">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Notes / Instructions:</div>
                <p>{booking.notes || 'Reservation is processed under Hanford Central Hospitality guidelines.'}</p>
                {booking.noteToCustomer && (
                  <div className="p-2.5 bg-[#51867E]/5 border border-[#51867E]/20 rounded-xl text-xs">
                    <div className="font-bold text-[#51867E] uppercase tracking-wider text-[9.5px]">Note to Customer:</div>
                    <p className="text-slate-700 italic mt-0.5">{booking.noteToCustomer}</p>
                  </div>
                )}
              </div>

              <div className="w-72 space-y-2 text-xs text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Before Discount:</span>
                  <span className="font-mono font-semibold">${rawSubtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#51867E] font-medium">
                    <span>Discount ({discountCode || 'COUPON'} - {discountPercent}%):</span>
                    <span className="font-mono font-bold">-${discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {shippingFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping / Extra Fee:</span>
                    <span className="font-mono font-semibold">${shippingFee.toLocaleString()}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Before Tax:</span>
                    <span className="font-mono font-semibold">${subtotalBeforeTax.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Taxes & Fees (10%):</span>
                  <span className="font-mono font-semibold">${finalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#3A4F67] border-t border-slate-200 pt-2">
                  <span>Total Invoice:</span>
                  <span className="font-mono text-[#51867E] text-base">
                    ${finalGrandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-10 pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 font-light tracking-wider">
              Thank you for choosing Hanford Hotels & Resorts. For questions regarding this invoice, contact central reservations at @Hanford_HnR on X.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


