import React, { useState, useEffect, useRef } from 'react';
import { BookingInquiry, Property } from '../../types';
import { fetchLocations } from '../../services/dataService';
import { X, CheckCircle, Clock, FileText, Building, Download, Image as ImageIcon, Loader2, MapPin } from 'lucide-react';
import { toPng } from 'html-to-image';

interface InvoiceModalProps {
  booking: BookingInquiry;
  onClose: () => void;
  onTogglePaymentStatus: (bookingId: string, currentStatus: 'UNPAID' | 'PAID') => void;
}

function getBookingTypeLabel(booking: BookingInquiry): string {
  const opt = (booking.bookOption || '').toLowerCase().trim();
  const totalRooms = (booking.standardRooms || 0) + (booking.deluxeRooms || 0) + (booking.presidentialSuites || 0) + (booking.privateVillas || 0);
  const hasRooms = totalRooms > 0;
  const hasEvents = Boolean(booking.eventAttendees || booking.cateringPax);

  if (opt === 'both' || opt.includes('both') || opt.includes('keduanya') || (opt.includes('room') && opt.includes('event')) || opt.includes('& event') || opt.includes('+ event') || (hasRooms && hasEvents)) {
    return 'Room & Event';
  }
  if (opt === 'room_meeting' || (opt.includes('room') && opt.includes('meeting'))) {
    return 'Room & Meeting';
  }
  if (opt === 'meeting') {
    return 'Meeting';
  }
  if (opt === 'event') {
    return 'Event';
  }
  if (opt === 'room') {
    return 'Room';
  }
  if (opt) {
    return opt.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return 'Room';
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
  const priceMeetingRoom = booking.priceMeetingRoom || matchedProperty?.priceMeetingRoom || 120;
  const priceEventHall = booking.priceEventHall || matchedProperty?.priceEventHall || 3200;
  const priceCateringPerPax = booking.priceCateringPerPax || matchedProperty?.priceCateringPerPax || 75;

  const nights = booking.numberOfNights || calculateNights(booking.checkInDate, booking.checkOutDate);

  const standardAmt = (booking.standardRooms || 0) * priceStandard * nights;
  const deluxeAmt = (booking.deluxeRooms || 0) * priceDeluxe * nights;
  const presidentialAmt = (booking.presidentialSuites || 0) * pricePresidential * nights;
  const villaAmt = (booking.privateVillas || 0) * pricePrivateVilla * nights;

  let eventAmt = 0;
  if (booking.eventAttendees || booking.bookOption === 'event' || booking.bookOption === 'both' || booking.bookOption === 'meeting') {
    if (booking.eventSubtotal && booking.eventSubtotal > 0) {
      eventAmt = booking.eventSubtotal;
    } else if (booking.bookOption === 'meeting') {
      eventAmt = (booking.eventAttendees || 1) * priceMeetingRoom;
    } else {
      eventAmt = priceEventHall;
    }
  }

  let cateringAmt = 0;
  if (booking.cateringPax || booking.eventAddons === 'catering' || booking.eventAddons === 'both') {
    const pax = booking.cateringPax || booking.eventAttendees || 1;
    cateringAmt = pax * priceCateringPerPax;
  }

  const calculatedSubtotal = standardAmt + deluxeAmt + presidentialAmt + villaAmt + eventAmt + cateringAmt;
  const rawSubtotal =
    booking.subtotalBeforeDiscount ||
    (calculatedSubtotal > 0
      ? calculatedSubtotal
      : booking.totalAmount
      ? Math.round(booking.totalAmount / 1.1)
      : 0);

  const discountCode = booking.discountCode || matchedProperty?.discountCode || '';
  const discountPercent = booking.discountPercent || (discountCode ? matchedProperty?.discountPercent || 0 : 0);
  const discountAmount =
    booking.discountAmount !== undefined
      ? booking.discountAmount
      : discountPercent > 0
      ? Math.round(rawSubtotal * (discountPercent / 100))
      : 0;

  const subtotalBeforeTax =
    booking.subtotalBeforeTax !== undefined
      ? booking.subtotalBeforeTax
      : Math.max(0, rawSubtotal - discountAmount);

  const finalTax =
    booking.taxAmount !== undefined
      ? booking.taxAmount
      : Math.round(subtotalBeforeTax * 0.1);

  const finalGrandTotal =
    booking.totalAmount !== undefined
      ? booking.totalAmount
      : subtotalBeforeTax + finalTax;

  const handleDownloadImage = async () => {
    if (!invoiceRef.current) return;
    try {
      setIsDownloadingImage(true);
      const dataUrl = await toPng(invoiceRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `Invoice-${bookingId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download invoice image:', err);
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
              <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
                Global Luxury Accommodations & Event Venues
                <br />
                x.com/Hanford_HnR
              </p>
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
            {/* Bill To */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider block">
                Billed To (Guest Details)
              </span>
              <div className="font-bold text-sm text-[#3A4F67]">{booking.guestName}</div>
              {booking.xUsername && (
                <div className="text-slate-600">X Handle: <strong className="text-[#51867E]">{booking.xUsername}</strong></div>
              )}
              {booking.guestEmail && (
                <div className="text-slate-600">Email: {booking.guestEmail}</div>
              )}
              {booking.guestPhone && (
                <div className="text-slate-600">Phone: {booking.guestPhone}</div>
              )}
              {booking.businessName && (
                <div className="text-slate-600">Organization: {booking.businessName}</div>
              )}
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

          {/* Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#3A4F67] text-white uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item / Service Description</th>
                  <th className="py-3 px-4 text-center">Rate / Unit</th>
                  <th className="py-3 px-4 text-center">Qty / Pax</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {booking.standardRooms ? (
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800">Standard Room</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">${priceStandard.toLocaleString()} / night</td>
                    <td className="py-3 px-4 text-center">{booking.standardRooms} Room(s) × {nights} N</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${standardAmt.toLocaleString()}</td>
                  </tr>
                ) : null}

                {booking.deluxeRooms ? (
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800">Deluxe Room</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">${priceDeluxe.toLocaleString()} / night</td>
                    <td className="py-3 px-4 text-center">{booking.deluxeRooms} Room(s) × {nights} N</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${deluxeAmt.toLocaleString()}</td>
                  </tr>
                ) : null}

                {booking.presidentialSuites ? (
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800">Presidential Suite</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">${pricePresidential.toLocaleString()} / night</td>
                    <td className="py-3 px-4 text-center">{booking.presidentialSuites} Suite(s) × {nights} N</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${presidentialAmt.toLocaleString()}</td>
                  </tr>
                ) : null}

                {booking.privateVillas ? (
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800">Private Villa</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">${pricePrivateVilla.toLocaleString()} / night</td>
                    <td className="py-3 px-4 text-center">{booking.privateVillas} Villa(s) × {nights} N</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${villaAmt.toLocaleString()}</td>
                  </tr>
                ) : null}

                {booking.eventAttendees ? (
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800">Event Space Rental</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {booking.bookOption === 'meeting' ? `$${priceMeetingRoom.toLocaleString()} / pax` : `$${priceEventHall.toLocaleString()} / hall`}
                    </td>
                    <td className="py-3 px-4 text-center">{booking.eventAttendees} Attendees</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${eventAmt.toLocaleString()}</td>
                  </tr>
                ) : null}

                {booking.cateringPax ? (
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800">Catering Service</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">${priceCateringPerPax.toLocaleString()} / pax</td>
                    <td className="py-3 px-4 text-center">{booking.cateringPax} Pax</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">${cateringAmt.toLocaleString()}</td>
                  </tr>
                ) : null}

                {totalRooms === 0 && !booking.eventAttendees && (
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-800">Room Reservation</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">${priceStandard.toLocaleString()} / night</td>
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
            <div className="text-xs text-slate-500 space-y-1 max-w-xs">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Notes / Instructions:</div>
              <p>{booking.notes || 'Reservation is processed under Hanford Central Hospitality guidelines.'}</p>
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
  );
};


