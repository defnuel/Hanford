import React, { useRef, useState } from 'react';
import { Download, Printer, CheckCircle2, Utensils, X, Clock, MapPin, User, FileText } from 'lucide-react';
import { DiningOrder } from '../../data/menuData';
import { exportInvoiceAsImage } from '../../utils/exportInvoiceImage';

interface DiningReceiptModalProps {
  order: DiningOrder;
  onClose: () => void;
  onNewOrder: () => void;
}

export const DiningReceiptModal: React.FC<DiningReceiptModalProps> = ({
  order,
  onClose,
  onNewOrder,
}) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const onscreenRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDownloadImage = async () => {
    if (!exportRef.current && !onscreenRef.current) return;
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      const fileName = `Receipt-${order.orderId}.png`;
      const result = await exportInvoiceAsImage(
        exportRef.current,
        onscreenRef.current,
        fileName
      );
      if (result.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to export dining receipt image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const destinationLabel =
    order.destinationType === 'in-room'
      ? `In-Room Dining • ${order.roomOrTableNumber}`
      : order.destinationType === 'poolside'
      ? `Poolside Cabana • ${order.roomOrTableNumber}`
      : `The Lounge & Bar • ${order.roomOrTableNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAFBF9] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#3A4F67] px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#51867E] flex items-center justify-center text-white shadow-inner">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold tracking-wide">
                Order Confirmed &amp; Receipt Ready
              </h3>
              <p className="text-[11px] text-slate-200">
                Order Ref: <span className="font-mono font-bold text-white">{order.orderId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body (Visible On-Screen) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs flex-1">
          {/* Status Banner */}
          <div className="bg-[#F2F7F6] border border-[#88B2AB]/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Utensils className="w-4 h-4 text-[#51867E] shrink-0" />
              <div>
                <p className="font-bold text-[#3A4F67] text-xs">
                  Your kitchen order is being prepared
                </p>
                <p className="text-[11px] text-slate-600">
                  {order.diningTime === 'immediate'
                    ? 'Estimated delivery: 25 – 35 minutes'
                    : `Scheduled for: ${order.scheduledTime || 'Selected Time'}`}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-[#51867E] text-white font-mono font-bold text-[10px] tracking-wider uppercase rounded-full shrink-0">
              {order.status}
            </span>
          </div>

          {/* Onscreen Receipt Preview Card */}
          <div ref={onscreenRef} className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            {/* Header / Brand */}
            <div className="text-center border-b border-slate-100 pb-3">
              <div className="text-base font-medium tracking-[0.25em] text-[#3A4F67] uppercase font-serif">
                Hanford Hotels &amp; Resorts
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#51867E] font-semibold mt-0.5">
                The Lounge &amp; In-Room Dining
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Official Dining Folio Receipt • {formattedDate} at {formattedTime}
              </div>
            </div>

            {/* Guest & Destination Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Guest Name
                </span>
                <span className="font-bold text-[#3A4F67] text-sm">{order.guestName}</span>
                {order.xHandle && (
                  <span className="text-[11px] text-[#51867E] block font-medium">@{order.xHandle.replace(/^@/, '')}</span>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Service Destination
                </span>
                <span className="font-bold text-[#3A4F67] text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#51867E]" />
                  {destinationLabel}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Payment: Room Folio / House Charge
                </span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-[#3A4F67] text-white px-3 py-2 text-[11px] font-bold tracking-wider uppercase grid grid-cols-12">
                <div className="col-span-7">Item Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-3 text-right">Amount</div>
              </div>
              <div className="divide-y divide-slate-100 text-xs bg-white">
                {order.items.map((cartItem, idx) => (
                  <div key={idx} className="px-3 py-2.5 grid grid-cols-12 items-center">
                    <div className="col-span-7 pr-2">
                      <p className="font-bold text-slate-800 leading-snug">{cartItem.item.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        ${cartItem.item.price.toFixed(2)} each
                      </p>
                      {cartItem.specialNotes && (
                        <p className="text-[10px] text-amber-700 italic mt-0.5">
                          Note: {cartItem.specialNotes}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 text-center font-mono font-medium text-slate-700">
                      ×{cartItem.quantity}
                    </div>
                    <div className="col-span-3 text-right font-mono font-bold text-slate-900">
                      ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-1.5 pt-2 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Food &amp; Beverage Subtotal</span>
                <span className="font-mono font-semibold text-slate-800">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge (10%)</span>
                <span className="font-mono">${order.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Local Hospitality Tax (10%)</span>
                <span className="font-mono">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-[#3A4F67] pt-2 border-t border-slate-200">
                <span>Total Folio Amount</span>
                <span className="font-mono text-[#51867E]">${order.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {order.specialInstructions && (
              <div className="bg-amber-50 border border-amber-200/70 p-2.5 rounded-lg text-[11px] text-amber-900">
                <span className="font-bold block uppercase tracking-wider text-[10px]">Special Instructions:</span>
                {order.specialInstructions}
              </div>
            )}

            <div className="text-center pt-2 text-[10px] text-slate-400 italic">
              Thank you for dining with Hanford Hotels &amp; Resorts. Charges will be posted directly to your guest folio.
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              onClick={onNewOrder}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Order More
            </button>
          </div>

          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="px-6 py-2.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PNG...' : 'Download Receipt (PNG)'}</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="bg-emerald-600 text-white text-xs font-medium py-2 px-4 text-center">
            Official receipt image downloaded successfully!
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* Hidden Offscreen 800px Container for High-DPI Desktop Capture  */}
      {/* ============================================================== */}
      <div
        className="fixed -left-[9999px] top-0 pointer-events-none opacity-100 z-[-9999] overflow-hidden"
        aria-hidden="true"
      >
        <div
          ref={exportRef}
          className="bg-white border-2 border-[#3A4F67]/30 rounded-2xl p-8 space-y-5 relative w-[800px] min-w-[800px] box-border text-left font-sans"
        >
          {/* Header */}
          <div className="border-b border-slate-200 pb-5 flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-[0.2em] uppercase text-[#3A4F67] font-serif">
                Hanford Hotels &amp; Resorts
              </div>
              <div className="text-xs uppercase tracking-widest text-[#51867E] font-semibold">
                The Lounge &amp; In-Room Dining Service
              </div>
              <div className="text-xs text-slate-400">
                Official Culinary Folio Voucher &amp; Dining Receipt
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                ORDER NUMBER
              </div>
              <div className="text-lg font-mono font-bold text-[#3A4F67]">
                {order.orderId}
              </div>
              <div className="inline-block bg-[#F2F7F6] border border-[#88B2AB]/50 text-[#51867E] font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {order.status}
              </div>
            </div>
          </div>

          {/* Meta Details 2-Columns */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-[#FAFBF9] p-4 rounded-xl border border-slate-200">
            <div className="space-y-1.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Guest Information
                </span>
                <span className="font-bold text-slate-900 text-sm">{order.guestName}</span>
                {order.xHandle && (
                  <span className="text-xs text-[#51867E] font-medium block">
                    X: @{order.xHandle.replace(/^@/, '')}
                  </span>
                )}
                {order.phone && (
                  <span className="text-xs text-slate-500 block">Phone: {order.phone}</span>
                )}
              </div>
              <div className="pt-1 text-[11px] text-slate-500">
                <span>Date &amp; Time: </span>
                <strong className="text-slate-800">{formattedDate} • {formattedTime}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Service Destination
                </span>
                <span className="font-bold text-slate-900 text-sm block">{destinationLabel}</span>
              </div>
              <div className="text-xs text-slate-600">
                <span>Service Timing: </span>
                <strong className="text-slate-800">
                  {order.diningTime === 'immediate'
                    ? 'Immediate Service (25–35 mins)'
                    : `Scheduled for ${order.scheduledTime}`}
                </strong>
              </div>
              <div className="text-xs text-slate-600">
                <span>Settlement: </span>
                <strong className="text-[#51867E]">Room Folio Charge (Post to Room)</strong>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-[#3A4F67] text-white px-4 py-2.5 text-xs font-bold tracking-wider uppercase grid grid-cols-12 items-center">
              <div className="col-span-7">Item Description / Dietary</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3 text-right">Amount (USD)</div>
            </div>

            <div className="divide-y divide-slate-100 text-xs bg-white">
              {order.items.map((cartItem, idx) => (
                <div key={idx} className="px-4 py-3 grid grid-cols-12 items-center">
                  <div className="col-span-7 pr-3">
                    <div className="font-bold text-slate-800 text-sm leading-snug">
                      {cartItem.item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ${cartItem.item.price.toFixed(2)} each • {cartItem.item.subcategory}
                    </div>
                    {cartItem.specialNotes && (
                      <div className="text-[11px] text-amber-700 italic mt-0.5">
                        Instructions: {cartItem.specialNotes}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 text-center font-mono font-bold text-slate-700 text-sm">
                    {cartItem.quantity}
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-slate-900 text-sm">
                    ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-[#FAFBF9] p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Culinary &amp; Beverage Subtotal</span>
              <span className="font-mono font-bold text-slate-800">
                ${order.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Service Charge (10%)</span>
              <span className="font-mono">${order.serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Local Hospitality &amp; State Tax (10%)</span>
              <span className="font-mono">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-300 text-base font-bold text-[#3A4F67]">
              <span>GRAND TOTAL (USD)</span>
              <span className="font-mono text-xl text-[#51867E]">
                ${order.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {order.specialInstructions && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900">
              <strong className="block uppercase tracking-wider text-[10px]">Guest Chef Note:</strong>
              {order.specialInstructions}
            </div>
          )}

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-200 text-center space-y-1 text-slate-400 text-xs">
            <p className="italic">
              Thank you for choosing Hanford Hotels &amp; Resorts. For immediate dining room assistance, dial extension 4 from your suite.
            </p>
            <p className="text-[10px] uppercase tracking-wider font-semibold">
              © 2026 Hanford Hotels &amp; Resorts • Official Dining Folio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
