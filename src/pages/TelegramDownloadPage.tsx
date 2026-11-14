import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { BookingInquiry, Property, SignatureOrderReceipt } from '../types';
import {
  fetchBookings,
  fetchLocations,
  fetchSignatureOrderById
} from '../services/dataService';
import { getBookingTypeLabel } from '../utils/bookingUtils';
import { exportInvoiceAsImage } from '../utils/exportInvoiceImage';

interface TelegramDownloadPageProps {
  path: string;
}

type DocumentTarget =
  | { kind: 'receipt'; id: string }
  | { kind: 'invoice'; id: string; forcedStatus?: 'PAID' | 'UNPAID' };

function parseTargetFromLocation(path: string): DocumentTarget {
  const cleanPath = (path || window.location.pathname || '').split('?')[0].replace(/\/+$/, '');
  const lower = cleanPath.toLowerCase();
  const params = new URLSearchParams(
    path.includes('?') ? path.slice(path.indexOf('?')) : window.location.search
  );
  const statusParam = (params.get('status') || '').trim().toUpperCase();
  const forcedStatus: 'PAID' | 'UNPAID' | undefined =
    statusParam === 'PAID' ? 'PAID' : statusParam === 'UNPAID' ? 'UNPAID' : undefined;

  const extractLastSegment = (prefix: string) => {
    const raw = cleanPath.slice(prefix.length).replace(/^\/+/, '');
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  };

  if (lower.startsWith('/telegram/receipt')) {
    return { kind: 'receipt', id: extractLastSegment('/telegram/receipt') };
  }
  if (lower.startsWith('/api/hr-signature/receipt')) {
    return { kind: 'receipt', id: extractLastSegment('/api/hr-signature/receipt') };
  }
  if (lower.startsWith('/api/hf-signature/receipt')) {
    return { kind: 'receipt', id: extractLastSegment('/api/hf-signature/receipt') };
  }
  if (lower.startsWith('/telegram/invoice')) {
    return { kind: 'invoice', id: extractLastSegment('/telegram/invoice'), forcedStatus };
  }
  return { kind: 'invoice', id: extractLastSegment('/api/invoice'), forcedStatus };
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

function buildBarcodeBars(seedText: string) {
  const weights = [
    2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 1, 1, 2
  ];
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  const safeSeed = seedText || 'HRS2026';
  for (let i = 0; i < 42; i++) {
    const code = safeSeed.charCodeAt(i % safeSeed.length) || 65;
    const w = weights[(code + i) % weights.length];
    const gap = ((code >> 1) + i) % 2 === 0 ? 2 : 1;
    bars.push({ x, w });
    x += w + gap;
  }
  return { bars, totalWidth: x };
}

export const TelegramDownloadPage: React.FC<TelegramDownloadPageProps> = ({ path }) => {
  const target = useMemo(() => parseTargetFromLocation(path), [path]);

  const [loading, setLoading] = useState(true);
  const [retryToken, setRetryToken] = useState(0);
  const [receipt, setReceipt] = useState<SignatureOrderReceipt | null>(null);
  const [booking, setBooking] = useState<BookingInquiry | null>(null);
  const [matchedProperty, setMatchedProperty] = useState<Property | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const loadDocument = async () => {
      setLoading(true);
      setErrorMsg(null);
      setDownloadFeedback(null);

      if (!target.id) {
        if (!active) return;
        setErrorMsg('Document ID was not found in the notification link.');
        setLoading(false);
        return;
      }

      if (target.kind === 'receipt') {
        const found = await fetchSignatureOrderById(target.id);
        if (!active) return;
        if (!found) {
          setReceipt(null);
          setErrorMsg(
            `HR Signature receipt #${target.id} is not available in Google Sheets yet. Please wait a few seconds and click Refresh.`
          );
        } else {
          setReceipt(found);
        }
        setLoading(false);
        return;
      }

      try {
        const [allBookings, locationsRes] = await Promise.all([
          fetchBookings(),
          fetchLocations()
        ]);
        if (!active) return;

        const cleanId = target.id.trim().toUpperCase();
        const foundBooking = allBookings.find(
          (b) => (b.bookingId || b.id || '').trim().toUpperCase() === cleanId
        );

        if (!foundBooking) {
          setBooking(null);
          setErrorMsg(
            `Reservation invoice #${target.id} is not available in Google Sheets yet. Please wait a few seconds and click Refresh.`
          );
          setLoading(false);
          return;
        }

        const effectiveBooking: BookingInquiry = target.forcedStatus
          ? {
              ...foundBooking,
              paymentStatus: target.forcedStatus,
              status: target.forcedStatus === 'PAID' ? 'Confirmed' : 'Pending'
            }
          : foundBooking;

        const propsList = locationsRes.data || [];
        const prop =
          propsList.find(
            (p) =>
              p.slug === effectiveBooking.propertySlug ||
              p.name.toLowerCase() === (effectiveBooking.propertyName || '').toLowerCase()
          ) || null;

        setBooking(effectiveBooking);
        setMatchedProperty(prop);
        setLoading(false);
      } catch (err) {
        if (!active) return;
        console.error('[TelegramDownloadPage] Failed loading invoice:', err);
        setErrorMsg('Unable to load reservation invoice from records. Please try Refresh.');
        setLoading(false);
      }
    };

    loadDocument();
    return () => {
      active = false;
    };
  }, [target, retryToken]);

  const handleDownloadPicture = async () => {
    try {
      setDownloading(true);
      setDownloadFeedback(null);

      if (target.kind === 'receipt' && receipt) {
        const fileName = `HR_Signature_Receipt_${receipt.orderId}.png`;
        const res = await exportInvoiceAsImage(
          exportRef.current,
          previewRef.current,
          fileName,
          380
        );
        setDownloadFeedback(
          res.shared
            ? `Receipt ${fileName} ready to save/share.`
            : `Downloaded ${fileName}.`
        );
        return;
      }

      if (target.kind === 'invoice' && booking) {
        const bookingId = booking.bookingId || booking.id || target.id;
        const statusTag = booking.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID';
        const fileName = `Invoice-${bookingId}-${statusTag}.png`;
        const res = await exportInvoiceAsImage(
          exportRef.current,
          previewRef.current,
          fileName,
          800
        );
        setDownloadFeedback(
          res.shared
            ? `Invoice ${fileName} ready to save/share.`
            : `Downloaded ${fileName}.`
        );
      }
    } catch (err) {
      console.error('[TelegramDownloadPage] Download PNG error:', err);
      setDownloadFeedback('Failed to generate PNG image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const renderReceiptCard = (activeReceipt: SignatureOrderReceipt, isExport = false) => {
    const dt = new Date(activeReceipt.createdAt);
    const validDate = !isNaN(dt.getTime()) ? dt : new Date();
    const dd = String(validDate.getDate()).padStart(2, '0');
    const mm = String(validDate.getMonth() + 1).padStart(2, '0');
    const yyyy = validDate.getFullYear();
    const hh = String(validDate.getHours()).padStart(2, '0');
    const min = String(validDate.getMinutes()).padStart(2, '0');
    const formattedDate = `${dd}/${mm} ${yyyy} ${hh}.${min}`;
    const { bars, totalWidth } = buildBarcodeBars(activeReceipt.orderId);
    const receiptTaxAmount = activeReceipt.taxAmount ?? Math.round(activeReceipt.subtotal * 0.1);
    const serviceLabel =
      activeReceipt.serviceType === 'room_service' ? 'Room Service' : 'Dinner in Restaurant';

    return (
      <div
        className={`w-[380px] max-w-full mx-auto bg-[#FAFBF9] border border-slate-300 px-6 py-7 font-mono text-[#2C3744] text-left ${
          isExport ? 'shadow-none' : 'shadow-md'
        }`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between text-xs font-bold tracking-[0.08em] mb-4">
          <span className="text-[#51867E]">RECEIPT</span>
          <span className="text-[#2C3744]">No. {activeReceipt.orderId}</span>
        </div>

        {/* Center Brand Block */}
        <div className="text-center mb-3.5">
          <div className="font-serif italic text-3xl font-semibold text-[#51867E] leading-tight">
            HR Signature
          </div>
          <div className="font-sans text-[10px] font-bold tracking-[0.24em] text-[#3A4F67] uppercase mt-1">
            HANFORD HOTELS &amp; RESORTS
          </div>
          <div className="text-[10.5px] text-slate-600 mt-2.5">
            /An Elevated Way of Staying/
          </div>
        </div>

        <div className="border-t-2 border-dashed border-[#88B2AB] my-3.5" />

        {/* Date & Property / Guest Block */}
        <div className="text-center text-[11px] leading-relaxed space-y-0.5">
          <div className="font-bold tracking-[0.05em] text-[#2C3744]">
            DATE: {formattedDate}
          </div>
          <div className="font-semibold text-[#3A4F67] pt-0.5">
            {activeReceipt.propertyName}
          </div>
          <div className="text-slate-600">
            {serviceLabel}
            {activeReceipt.serviceType === 'room_service' && activeReceipt.roomOrTable
              ? ` · Room ${activeReceipt.roomOrTable}`
              : ''}
          </div>
          <div className="text-slate-600">
            Guest: {activeReceipt.guestName}
            {activeReceipt.xUsernameCode
              ? ` (@${activeReceipt.xUsernameCode.replace(/^@+/, '')})`
              : ''}
          </div>
        </div>

        <div className="border-t-2 border-dashed border-[#88B2AB] my-3.5" />

        {/* Itemized Dotted Lines */}
        <div className="py-1 space-y-3">
          {activeReceipt.items.map((item) => {
            const meta: string[] = [];
            if (item.selectedVariant) meta.push(item.selectedVariant);
            if (item.selectedSecondaryVariant) meta.push(item.selectedSecondaryVariant);
            if (item.selectedEnhancements && item.selectedEnhancements.length > 0) {
              meta.push(item.selectedEnhancements.map((e) => `+ ${e.label}`).join(', '));
            }
            const qtyPrefix = item.quantity > 1 ? `${item.quantity}x ` : '';

            return (
              <div key={item.id}>
                <div className="flex items-baseline text-xs text-[#2C3744]">
                  <span className="font-semibold max-w-[66%] break-words">
                    {qtyPrefix}
                    {item.name}
                  </span>
                  <span className="flex-1 border-b border-dotted border-[#88B2AB] mx-2 mb-0.5" />
                  <span className="font-bold text-[#3A4F67] whitespace-nowrap tabular-nums">
                    {item.lineTotal.toLocaleString()}$
                  </span>
                </div>
                {meta.length > 0 && (
                  <div className="text-[10.5px] text-[#666666] mt-0.5">
                    {meta.join(' · ')}
                  </div>
                )}
              </div>
            );
          })}

          <div className="border-t border-dotted border-slate-300 pt-2.5 mt-2 space-y-1.5 text-[11.5px] text-slate-600">
            <div className="flex items-baseline">
              <span>Subtotal</span>
              <span className="flex-1 border-b border-dotted border-slate-300 mx-2 mb-0.5" />
              <span className="font-semibold text-[#2C3744] whitespace-nowrap tabular-nums">
                {activeReceipt.subtotal.toLocaleString()}$
              </span>
            </div>
            <div className="flex items-baseline">
              <span>Tax &amp; Service (10%)</span>
              <span className="flex-1 border-b border-dotted border-slate-300 mx-2 mb-0.5" />
              <span className="font-semibold text-[#2C3744] whitespace-nowrap tabular-nums">
                {receiptTaxAmount.toLocaleString()}$
              </span>
            </div>
            {activeReceipt.isFreeDining && (
              <div className="flex items-baseline text-[#51867E]">
                <span className="font-bold">Guest Free Complimentary</span>
                <span className="flex-1 border-b border-dotted border-[#88B2AB] mx-2 mb-0.5" />
                <span className="font-bold whitespace-nowrap tabular-nums">
                  -{activeReceipt.discountAmount.toLocaleString()}$
                </span>
              </div>
            )}
          </div>
        </div>

        {activeReceipt.notes && (
          <div className="text-[10.5px] text-[#666666] border-t border-dotted border-slate-300 pt-2 mt-2">
            Note: {activeReceipt.notes}
          </div>
        )}

        <div className="border-t-2 border-dashed border-[#88B2AB] my-3.5" />

        {/* Total Row */}
        <div className="flex items-baseline justify-between text-base font-bold text-[#3A4F67] pb-4">
          <span>TOTAL:</span>
          <span className="tabular-nums">{activeReceipt.totalAmount.toLocaleString()}$</span>
        </div>

        {/* SVG Barcode */}
        <div className="my-2 flex justify-center">
          <svg
            viewBox={`0 0 ${totalWidth} 46`}
            className="w-full max-w-[240px] h-[46px]"
            aria-hidden="true"
          >
            {bars.map((bar, idx) => (
              <rect key={idx} x={bar.x} y={0} width={bar.w} height={46} fill="#2C3744" />
            ))}
          </svg>
        </div>

        {/* Thank You Accent */}
        <div className="text-center font-serif italic text-3xl font-semibold text-[#51867E] my-4">
          Thank You!
        </div>

        {/* Bottom Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 pt-2.5">
          <span>@Hanford_HnR</span>
          <span className="tracking-wider">HANFORD H&amp;R</span>
        </div>
      </div>
    );
  };

  const computeInvoiceMetrics = (b: BookingInquiry) => {
    const bookingId = b.bookingId || b.id || target.id || 'HNF-2026-INV';
    const isPaid = b.paymentStatus === 'PAID';
    const dateObj = b.createdAt ? new Date(b.createdAt) : new Date();
    const dateStr = (!isNaN(dateObj.getTime()) ? dateObj : new Date()).toLocaleDateString(
      'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );

    const totalRooms =
      (b.standardRooms || 0) +
      (b.deluxeRooms || 0) +
      (b.presidentialSuites || 0) +
      (b.privateVillas || 0);

    const priceStandard =
      b.priceStandardRoom || matchedProperty?.priceStandard || matchedProperty?.priceFrom || 850;
    const priceDeluxe =
      b.priceDeluxeRoom || matchedProperty?.priceDeluxe || Math.round(priceStandard * 1.45);
    const pricePresidential =
      b.pricePresidentialSuite ||
      matchedProperty?.pricePresidential ||
      Math.round(priceStandard * 3.8);
    const pricePrivateVilla =
      b.pricePrivateVilla ||
      matchedProperty?.pricePrivateVilla ||
      Math.round(priceStandard * 5.2);

    const getVenueMultiplier = (rate?: string) => {
      if (rate === 'half_day') return 0.4;
      if (rate === 'full_board') return 1.2;
      return 1.0;
    };

    const baseCatering = matchedProperty?.priceCateringPerPax || 75;
    const baseMeetingRoom = matchedProperty?.priceMeetingRoom || 120;

    const priceMeetingRoom =
      b.priceMeetingRoom !== undefined && b.priceMeetingRoom > 0
        ? b.priceMeetingRoom
        : Math.round(baseMeetingRoom * getVenueMultiplier(b.venueRentalRate));

    const priceCateringPerPax =
      b.priceCateringPerPax !== undefined && b.priceCateringPerPax > 0
        ? b.priceCateringPerPax
        : Math.round(baseCatering * getVenueMultiplier(b.venueRentalRate));
    const priceEventHall = b.priceEventHall || matchedProperty?.priceEventHall || 3200;

    const nights = b.numberOfNights || calculateNights(b.checkInDate, b.checkOutDate);

    const standardAmt = (b.standardRooms || 0) * priceStandard * nights;
    const deluxeAmt = (b.deluxeRooms || 0) * priceDeluxe * nights;
    const presidentialAmt = (b.presidentialSuites || 0) * pricePresidential * nights;
    const villaAmt = (b.privateVillas || 0) * pricePrivateVilla * nights;

    const isEventEnabled = b.bookOption === 'event' || b.bookOption === 'both';
    const isMeetingEnabled = b.bookOption === 'meeting' || b.bookOption === 'room_meeting';
    const isRoomEnabled =
      b.bookOption === 'room' ||
      b.bookOption === 'both' ||
      b.bookOption === 'room_meeting' ||
      (!b.bookOption && totalRooms > 0);

    let eventAmt = 0;
    if (isMeetingEnabled) {
      eventAmt = Math.max(1, b.eventAttendees || 1) * priceMeetingRoom;
    } else if (isEventEnabled) {
      eventAmt = priceEventHall;
    }

    let cateringAmt = 0;
    if (
      isEventEnabled &&
      (b.cateringPax || b.eventAddons === 'catering' || b.eventAddons === 'both')
    ) {
      const pax = b.cateringPax || b.eventAttendees || 1;
      cateringAmt = pax * priceCateringPerPax;
    }

    const customItems = b.customLineItems || [];
    const customItemsAmt = customItems.reduce((acc, item) => acc + (item.amount || 0), 0);

    const fallbackRoomAmt =
      totalRooms === 0 &&
      !isEventEnabled &&
      !isMeetingEnabled &&
      customItems.length === 0 &&
      b.bookOption !== 'custom_only'
        ? b.totalAmount
          ? Math.round(b.totalAmount / 1.1)
          : priceStandard
        : 0;

    const calculatedSubtotal =
      standardAmt +
      deluxeAmt +
      presidentialAmt +
      villaAmt +
      eventAmt +
      cateringAmt +
      customItemsAmt +
      fallbackRoomAmt;
    const shippingFee = b.shippingFee || 0;

    const rawSubtotal =
      calculatedSubtotal > 0
        ? calculatedSubtotal
        : b.subtotalBeforeDiscount || (b.totalAmount ? Math.round(b.totalAmount / 1.1) : 0);

    const cleanDiscountCode =
      b.discountCode && b.discountCode.trim() && b.discountCode.trim().toUpperCase() !== 'N/A'
        ? b.discountCode.trim()
        : '';

    const discountPercent =
      b.discountPercent !== undefined && b.discountPercent !== null
        ? Number(b.discountPercent)
        : 0;

    const discountAmount =
      b.discountAmount !== undefined && b.discountAmount >= 0
        ? b.discountAmount
        : discountPercent > 0
        ? Math.round(rawSubtotal * (discountPercent / 100))
        : 0;

    const discountLabel = cleanDiscountCode
      ? discountPercent > 0
        ? `Discount (${cleanDiscountCode} - ${discountPercent}%):`
        : `Discount (${cleanDiscountCode}):`
      : discountPercent > 0
      ? `Discount (${discountPercent}%):`
      : 'Discount:';

    const subtotalBeforeTax = Math.max(0, rawSubtotal - discountAmount);
    const finalTax = Math.round((subtotalBeforeTax + shippingFee) * 0.1);
    const finalGrandTotal = subtotalBeforeTax + shippingFee + finalTax;

    const cleanBookingNotes =
      b.notes && b.notes.trim().toUpperCase() !== 'N/A' ? b.notes.trim() : '';
    const cleanCustomerNote =
      b.noteToCustomer && b.noteToCustomer.trim().toUpperCase() !== 'N/A'
        ? b.noteToCustomer.trim()
        : '';
    const hasDistinctCustomerNote = Boolean(
      cleanCustomerNote && cleanCustomerNote !== cleanBookingNotes
    );
    const primaryNoteText = cleanBookingNotes || cleanCustomerNote || 'N/A';

    return {
      bookingId,
      isPaid,
      dateStr,
      totalRooms,
      priceStandard,
      priceDeluxe,
      pricePresidential,
      pricePrivateVilla,
      priceMeetingRoom,
      priceCateringPerPax,
      priceEventHall,
      nights,
      standardAmt,
      deluxeAmt,
      presidentialAmt,
      villaAmt,
      isEventEnabled,
      isMeetingEnabled,
      isRoomEnabled,
      eventAmt,
      cateringAmt,
      customItems,
      shippingFee,
      rawSubtotal,
      discountAmount,
      discountLabel,
      subtotalBeforeTax,
      finalTax,
      finalGrandTotal,
      cleanBookingNotes,
      cleanCustomerNote,
      hasDistinctCustomerNote,
      primaryNoteText
    };
  };

  const renderInvoiceDocument = (b: BookingInquiry, isExport = false) => {
    const m = computeInvoiceMetrics(b);

    return (
      <div
        className={`bg-white text-[#2C3744] text-left box-border ${
          isExport
            ? 'p-10 w-[800px] min-w-[800px]'
            : 'p-6 sm:p-10 border border-slate-200 rounded-2xl shadow-md'
        }`}
      >
        {/* Header & Logo */}
        <div
          className={`flex ${
            isExport ? 'flex-row' : 'flex-col sm:flex-row'
          } justify-between items-start border-b border-slate-200 pb-8 gap-6`}
        >
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-baseline">
              <span
                className={`${
                  isExport ? 'text-3xl' : 'text-2xl sm:text-3xl'
                } font-serif font-semibold text-[#3A4F67] tracking-[0.2em] uppercase`}
              >
                HANFORD
              </span>
              <span
                className={`${
                  isExport ? 'text-[13px] ml-5 pt-1' : 'text-[11px] sm:text-[13px] ml-4 sm:ml-5 pt-0.5 sm:pt-1'
                } font-sans font-bold tracking-normal text-[#3A4F67] self-start select-none`}
              >
                H&amp;R
              </span>
            </div>
            <p className="text-[10.5px] sm:text-[11px] font-semibold text-[#51867E] uppercase tracking-[0.14em] mt-1 leading-normal whitespace-nowrap">
              HOTELS &amp; RESORTS &bull; CENTRAL RESERVATIONS
            </p>
            <p className="text-xs text-slate-600 mt-1 font-medium italic leading-normal whitespace-nowrap">
              An Elevated Way of Staying
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium whitespace-nowrap">
              <svg className="w-3.5 h-3.5 fill-current text-slate-800 shrink-0" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Hanford_HnR</span>
            </div>
          </div>

          <div
            className={`${
              isExport ? 'text-right' : 'sm:text-right'
            } space-y-1 shrink-0 min-w-fit`}
          >
            <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-slate-600 font-mono text-xs font-bold uppercase tracking-wider mb-2 whitespace-nowrap">
              OFFICIAL INVOICE
            </div>
            <div className="text-sm font-bold text-[#3A4F67] whitespace-nowrap">
              Invoice No: <span className="font-mono">{m.bookingId}</span>
            </div>
            <div className="text-xs text-slate-500 whitespace-nowrap">
              Date Issued: {m.dateStr}
            </div>

            {/* Status Stamp */}
            <div className={`pt-2 flex ${isExport ? 'justify-end' : 'justify-start sm:justify-end'}`}>
              {m.isPaid ? (
                <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-[#51867E]/10 border-2 border-[#51867E] text-[#51867E] rounded-md font-bold text-xs uppercase tracking-wider whitespace-nowrap shrink-0 leading-none">
                  <CheckCircle className="w-4 h-4 text-[#51867E] shrink-0" />
                  <span className="whitespace-nowrap leading-none tracking-wider font-bold">
                    PAID IN FULL
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-amber-50 border-2 border-amber-500 text-amber-700 rounded-md font-bold text-xs uppercase tracking-wider whitespace-nowrap shrink-0 leading-none">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="whitespace-nowrap leading-none tracking-wider font-bold">
                    UNPAID - INVOICE PENDING
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guest & Property Grid */}
        <div
          className={`grid ${
            isExport ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
          } gap-6 my-8 text-xs`}
        >
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs text-left">
            <span className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider block">
              Guest Information
            </span>
            <div className="space-y-1 text-[#2C3744] leading-normal">
              <div>
                <strong>Name:</strong> {b.guestName || 'Guest'}
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current text-slate-700 shrink-0" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <strong className="text-[#51867E] font-medium font-mono">
                  @{b.xUsername ? b.xUsername.replace(/^@/, '') : 'DEF'}
                </strong>
              </div>
              {b.businessName &&
              b.businessName.trim() &&
              b.businessName.trim().toUpperCase() !== 'HANFORD' ? (
                <div>
                  <strong>Business Name:</strong> {b.businessName.trim()}
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs text-left">
            <span className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider block">
              Property / Location
            </span>
            <div className="font-bold text-sm text-[#3A4F67] flex items-start gap-1.5 leading-snug">
              <Building className="w-4 h-4 text-[#51867E] mt-0.5 shrink-0" />
              <span className="flex-1 break-words">{b.propertyName}</span>
            </div>
            <div className="text-slate-600 flex items-start gap-1.5 text-xs leading-normal">
              <MapPin className="w-3.5 h-3.5 text-[#51867E] mt-0.5 shrink-0" />
              <span className="flex-1 break-words">
                {matchedProperty?.address
                  ? `${matchedProperty.address}${
                      matchedProperty.country ? `, ${matchedProperty.country}` : ''
                    }`
                  : 'Hanford Central Estate & Hospitality Precinct'}
              </span>
            </div>
            <div className="text-slate-600 pt-1 border-t border-slate-100/80 space-y-1 leading-normal">
              <div>
                Booking Type: <strong className="text-slate-800">{getBookingTypeLabel(b)}</strong>
              </div>
              {b.checkInDate && (
                <div>
                  Stay Dates: <strong>{b.checkInDate}</strong> to{' '}
                  <strong>{b.checkOutDate || 'TBD'}</strong>
                  {m.nights ? ` (${m.nights} night${m.nights > 1 ? 's' : ''})` : ''}
                </div>
              )}
              {b.eventDate && (
                <div>
                  Event Date: <strong>{b.eventDate}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Breakdown (onscreen mobile only, never in 800px export) */}
        {!isExport && (
          <div className="sm:hidden space-y-2.5 mb-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200">
              Item &amp; Service Breakdown
            </div>

            {m.isRoomEnabled && b.standardRooms ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Standard Room</div>
                  <div className="text-[10px] text-slate-500">
                    ${m.priceStandard.toLocaleString()} / night &bull; {b.standardRooms} Room(s)
                    &times; {m.nights} Night(s)
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${m.standardAmt.toLocaleString()}
                </div>
              </div>
            ) : null}

            {m.isRoomEnabled && b.deluxeRooms ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Deluxe Room</div>
                  <div className="text-[10px] text-slate-500">
                    ${m.priceDeluxe.toLocaleString()} / night &bull; {b.deluxeRooms} Room(s)
                    &times; {m.nights} Night(s)
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${m.deluxeAmt.toLocaleString()}
                </div>
              </div>
            ) : null}

            {m.isRoomEnabled && b.presidentialSuites ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Presidential Suite</div>
                  <div className="text-[10px] text-slate-500">
                    ${m.pricePresidential.toLocaleString()} / night &bull; {b.presidentialSuites}{' '}
                    Suite(s) &times; {m.nights} Night(s)
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${m.presidentialAmt.toLocaleString()}
                </div>
              </div>
            ) : null}

            {m.isRoomEnabled && b.privateVillas ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Private Villa</div>
                  <div className="text-[10px] text-slate-500">
                    ${m.pricePrivateVilla.toLocaleString()} / night &bull; {b.privateVillas} Villa(s)
                    &times; {m.nights} Night(s)
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${m.villaAmt.toLocaleString()}
                </div>
              </div>
            ) : null}

            {(m.isEventEnabled || m.isMeetingEnabled) && b.eventAttendees ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Event Space Rental</div>
                  <div className="text-[10px] text-slate-500">
                    {b.bookOption === 'meeting'
                      ? `$${m.priceMeetingRoom.toLocaleString()} / pax`
                      : `$${m.priceEventHall.toLocaleString()} / hall`}{' '}
                    &bull; {b.eventAttendees} Attendees
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${m.eventAmt.toLocaleString()}
                </div>
              </div>
            ) : null}

            {m.isEventEnabled &&
            (b.cateringPax || b.eventAddons === 'catering' || b.eventAddons === 'both') ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Catering Service</div>
                  <div className="text-[10px] text-slate-500">
                    ${m.priceCateringPerPax.toLocaleString()} / pax &bull;{' '}
                    {b.cateringPax || b.eventAttendees || 1} Pax
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${m.cateringAmt.toLocaleString()}
                </div>
              </div>
            ) : null}

            {m.customItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800">
                    {item.productService || 'Custom Service'}
                  </div>
                  {item.description && (
                    <div className="text-[10px] text-slate-500">{item.description}</div>
                  )}
                  <div className="text-[10px] text-slate-400">
                    Qty: {item.qty} &bull; Rate: ${item.rate.toLocaleString()}
                  </div>
                </div>
                <div className="font-mono font-bold text-[#3A4F67] text-xs">
                  ${(item.amount || 0).toLocaleString()}
                </div>
              </div>
            ))}

            {m.totalRooms === 0 &&
              !b.eventAttendees &&
              m.customItems.length === 0 &&
              b.bookOption !== 'custom_only' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">Room Reservation</div>
                    <div className="text-[10px] text-slate-500">
                      ${m.priceStandard.toLocaleString()} / night &bull; 1 Reservation
                    </div>
                  </div>
                  <div className="font-mono font-bold text-[#3A4F67] text-xs">
                    ${(b.totalAmount ? Math.round(b.totalAmount / 1.1) : m.priceStandard).toLocaleString()}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Desktop Table Breakdown */}
        <div
          className={`${
            isExport ? 'block' : 'hidden sm:block'
          } border border-slate-200 rounded-xl overflow-hidden mb-8 w-full`}
        >
          <table className="w-full text-left text-xs">
            <thead className="bg-[#3A4F67] text-white uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-1/2">Item / Service Description</th>
                <th className="py-3 px-4 text-center w-1/4">Qty / Pax</th>
                <th className="py-3 px-4 text-right w-1/4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {m.isRoomEnabled && b.standardRooms ? (
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">Standard Room</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ${m.priceStandard.toLocaleString()} / night
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {b.standardRooms} Room(s) &times; {m.nights} Night(s)
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">
                    ${m.standardAmt.toLocaleString()}
                  </td>
                </tr>
              ) : null}

              {m.isRoomEnabled && b.deluxeRooms ? (
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">Deluxe Room</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ${m.priceDeluxe.toLocaleString()} / night
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {b.deluxeRooms} Room(s) &times; {m.nights} Night(s)
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">
                    ${m.deluxeAmt.toLocaleString()}
                  </td>
                </tr>
              ) : null}

              {m.isRoomEnabled && b.presidentialSuites ? (
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">Presidential Suite</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ${m.pricePresidential.toLocaleString()} / night
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {b.presidentialSuites} Suite(s) &times; {m.nights} Night(s)
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">
                    ${m.presidentialAmt.toLocaleString()}
                  </td>
                </tr>
              ) : null}

              {m.isRoomEnabled && b.privateVillas ? (
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">Private Villa</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ${m.pricePrivateVilla.toLocaleString()} / night
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {b.privateVillas} Villa(s) &times; {m.nights} Night(s)
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">
                    ${m.villaAmt.toLocaleString()}
                  </td>
                </tr>
              ) : null}

              {(m.isEventEnabled || m.isMeetingEnabled) && b.eventAttendees ? (
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">Event Space Rental</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {b.bookOption === 'meeting'
                        ? `$${m.priceMeetingRoom.toLocaleString()} / pax`
                        : `$${m.priceEventHall.toLocaleString()} / hall`}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">{b.eventAttendees} Attendees</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">
                    ${m.eventAmt.toLocaleString()}
                  </td>
                </tr>
              ) : null}

              {m.isEventEnabled &&
              (b.cateringPax || b.eventAddons === 'catering' || b.eventAddons === 'both') ? (
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">Catering Service</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ${m.priceCateringPerPax.toLocaleString()} / pax
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {b.cateringPax || b.eventAttendees || 1} Pax
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">
                    ${m.cateringAmt.toLocaleString()}
                  </td>
                </tr>
              ) : null}

              {m.customItems.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">
                      {item.productService || 'Custom Service'}
                    </div>
                    {item.description && (
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                        {item.description}
                      </div>
                    )}
                    {item.serviceDate && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Date: {item.serviceDate}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.qty} Item(s) &times; ${item.rate.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">
                    ${(item.amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}

              {m.totalRooms === 0 &&
                !m.isEventEnabled &&
                !m.isMeetingEnabled &&
                m.customItems.length === 0 &&
                b.bookOption !== 'custom_only' && (
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">Room Reservation</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        ${m.priceStandard.toLocaleString()} / night
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">1 Reservation</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#3A4F67]">
                      $
                      {(b.totalAmount
                        ? Math.round(b.totalAmount / 1.1)
                        : m.priceStandard
                      ).toLocaleString()}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div
          className={`flex ${
            isExport ? 'flex-row' : 'flex-col sm:flex-row'
          } justify-between items-start gap-6 border-t border-slate-200 pt-6`}
        >
          <div className="text-xs text-slate-500 space-y-2 max-w-xs text-left">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Notes:
            </div>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {m.primaryNoteText}
            </p>
            {m.hasDistinctCustomerNote && m.cleanBookingNotes && (
              <div className="p-2.5 bg-[#51867E]/5 border border-[#51867E]/20 rounded-xl text-xs">
                <div className="font-bold text-[#51867E] uppercase tracking-wider text-[9.5px]">
                  Note to Customer:
                </div>
                <p className="text-slate-700 italic mt-0.5 whitespace-pre-wrap leading-relaxed">
                  {m.cleanCustomerNote}
                </p>
              </div>
            )}
          </div>

          <div className={`${isExport ? 'w-80 shrink-0' : 'w-full sm:w-80'} text-xs`}>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr>
                  <td className="py-1 text-left text-slate-600 whitespace-nowrap pr-3">
                    Subtotal Before Discount:
                  </td>
                  <td className="py-1 text-right font-mono font-semibold text-slate-700 whitespace-nowrap">
                    ${m.rawSubtotal.toLocaleString()}
                  </td>
                </tr>
                {m.discountAmount > 0 && (
                  <tr>
                    <td className="py-1 text-left text-[#51867E] font-medium whitespace-nowrap pr-3">
                      {m.discountLabel}
                    </td>
                    <td className="py-1 text-right font-mono font-bold text-[#51867E] whitespace-nowrap">
                      -${m.discountAmount.toLocaleString()}
                    </td>
                  </tr>
                )}
                {m.shippingFee > 0 && (
                  <tr>
                    <td className="py-1 text-left text-slate-600 whitespace-nowrap pr-3">
                      Shipping / Extra Fee:
                    </td>
                    <td className="py-1 text-right font-mono font-semibold text-slate-700 whitespace-nowrap">
                      ${m.shippingFee.toLocaleString()}
                    </td>
                  </tr>
                )}
                {m.discountAmount > 0 && (
                  <tr>
                    <td className="py-1 text-left text-slate-600 whitespace-nowrap pr-3">
                      Subtotal Before Tax:
                    </td>
                    <td className="py-1 text-right font-mono font-semibold text-slate-700 whitespace-nowrap">
                      ${m.subtotalBeforeTax.toLocaleString()}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-1 text-left text-slate-600 whitespace-nowrap pr-3">
                    Taxes &amp; Fees (10%):
                  </td>
                  <td className="py-1 text-right font-mono font-semibold text-slate-700 whitespace-nowrap">
                    ${m.finalTax.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="pt-2.5 pb-1 text-left text-sm font-bold text-[#3A4F67] whitespace-nowrap pr-3">
                    Total Invoice:
                  </td>
                  <td className="pt-2.5 pb-1 text-right font-mono text-[#51867E] text-base font-bold whitespace-nowrap">
                    ${m.finalGrandTotal.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-10 pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 font-light tracking-wider leading-relaxed">
          Thank you for choosing Hanford Hotels &amp; Resorts.
          <br />
          For any inquiry, please contact central reservations at @Hanford_HnR on X.
        </div>
      </div>
    );
  };

  const documentReady =
    !loading && !errorMsg && ((target.kind === 'receipt' && receipt) || (target.kind === 'invoice' && booking));

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#2C3744] font-sans pb-14">
      {/* Standalone Top Bar */}
      <header className="bg-[#FFFFFF] border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline">
              <span className="font-serif text-xl sm:text-2xl tracking-[0.18em] text-[#3A4F67] uppercase leading-none">
                HANFORD
              </span>
              <span className="text-[11px] font-bold text-[#3A4F67] ml-3">H&amp;R</span>
            </div>
            <p className="text-[10.5px] font-bold tracking-[0.2em] text-[#51867E] uppercase mt-1">
              {target.kind === 'receipt'
                ? 'HR SIGNATURE RECEIPT'
                : 'OFFICIAL RESERVATION INVOICE'}
            </p>
          </div>

          {documentReady && (
            <button
              type="button"
              onClick={handleDownloadPicture}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#51867E] hover:bg-[#3A4F67] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {downloading
                  ? 'Preparing Picture...'
                  : target.kind === 'receipt'
                  ? 'Download Receipt PNG'
                  : 'Download Invoice PNG'}
              </span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {downloadFeedback && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-[#51867E]/10 border border-[#51867E]/30 text-xs font-medium text-[#3A4F67] text-center">
            {downloadFeedback}
          </div>
        )}

        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
            <Loader2 className="w-7 h-7 animate-spin text-[#51867E] mx-auto" />
            <div className="text-sm font-semibold text-[#3A4F67]">
              Loading {target.kind === 'receipt' ? 'Receipt' : 'Invoice'} #{target.id}...
            </div>
            <p className="text-xs text-slate-500">
              Retrieving record from Hanford Hotels &amp; Resorts.
            </p>
          </div>
        )}

        {!loading && errorMsg && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xs max-w-lg mx-auto">
            <div className="text-base font-serif font-semibold text-[#3A4F67]">
              {target.kind === 'receipt' ? 'Receipt Not Found Yet' : 'Invoice Not Found Yet'}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{errorMsg}</p>
            <button
              type="button"
              onClick={() => setRetryToken((t) => t + 1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#51867E] hover:bg-[#3A4F67] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        )}

        {documentReady && target.kind === 'receipt' && receipt && (
          <div className="space-y-6">
            <div ref={previewRef}>{renderReceiptCard(receipt)}</div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleDownloadPicture}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#51867E] hover:bg-[#3A4F67] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{downloading ? 'Preparing Picture...' : 'Download Receipt Picture (PNG)'}</span>
              </button>
            </div>

            {/* Offscreen 380px export node */}
            <div className="fixed -left-[9999px] top-0 w-[380px] bg-[#FAFBF9]" aria-hidden="true">
              <div ref={exportRef} className="w-[380px] bg-[#FAFBF9]">
                {renderReceiptCard(receipt, true)}
              </div>
            </div>
          </div>
        )}

        {documentReady && target.kind === 'invoice' && booking && (
          <div className="space-y-6">
            <div ref={previewRef}>{renderInvoiceDocument(booking)}</div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleDownloadPicture}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#51867E] hover:bg-[#3A4F67] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{downloading ? 'Preparing Picture...' : 'Download Invoice Picture (PNG)'}</span>
              </button>
            </div>

            {/* Offscreen 800px desktop-format export node */}
            <div
              className="fixed -left-[9999px] top-0 pointer-events-none opacity-100 z-[-9999] overflow-hidden"
              aria-hidden="true"
            >
              <div ref={exportRef} className="w-[800px] min-w-[800px] bg-white">
                {renderInvoiceDocument(booking, true)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
