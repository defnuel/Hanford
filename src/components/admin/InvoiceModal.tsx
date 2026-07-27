import React from 'react';
import { BookingInquiry } from '../../types';
import { X, Printer, CheckCircle, Clock, FileText, Send, Building } from 'lucide-react';

interface InvoiceModalProps {
  booking: BookingInquiry;
  onClose: () => void;
  onTogglePaymentStatus: (bookingId: string, currentStatus: 'UNPAID' | 'PAID') => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  booking,
  onClose,
  onTogglePaymentStatus
}) => {
  const isPaid = booking.paymentStatus === 'PAID';
  const bookingId = booking.bookingId || booking.id || 'HNF-2026-INV';
  const dateStr = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const totalRooms = (booking.standardRooms || 0) + (booking.deluxeRooms || 0) + (booking.presidentialSuites || 0) + (booking.privateVillas || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
        
        {/* Modal Action Controls (Hidden during print) */}
        <div className="p-4 bg-[#3A4F67] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#88B2AB]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              INVOICE MANAGEMENT &bull; #{bookingId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTogglePaymentStatus(bookingId, isPaid ? 'PAID' : 'UNPAID')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isPaid
                  ? 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border border-amber-400/30'
                  : 'bg-[#51867E] text-white hover:bg-[#3f6d66] border border-white/20'
              }`}
            >
              Mark as {isPaid ? 'UNPAID' : 'PAID'}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Sheet */}
        <div className="p-6 sm:p-10 bg-white text-[#2C3744] print:p-8" id="printable-invoice">
          
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
                Global Luxury Sanctuaries & Executive Accommodations
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

            {/* Sanctuary Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider block">
                Sanctuary / Location
              </span>
              <div className="font-bold text-sm text-[#3A4F67] flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#51867E]" />
                <span>{booking.propertyName}</span>
              </div>
              <div className="text-slate-600">
                Booking Type: <strong className="capitalize text-slate-800">{booking.bookOption.replace('_', ' ')}</strong>
              </div>
              {booking.checkInDate && (
                <div className="text-slate-600">
                  Stay Dates: <strong>{booking.checkInDate}</strong> to <strong>{booking.checkOutDate || 'TBD'}</strong>
                  {booking.numberOfNights ? ` (${booking.numberOfNights} night${booking.numberOfNights > 1 ? 's' : ''})` : ''}
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
                  <th className="py-3 px-4 text-center">Qty / Pax</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {booking.standardRooms ? (
                  <tr>
                    <td className="py-3 px-4">Standard Room Accommodation</td>
                    <td className="py-3 px-4 text-center">{booking.standardRooms} Room(s)</td>
                    <td className="py-3 px-4 text-right font-mono">Included</td>
                  </tr>
                ) : null}

                {booking.deluxeRooms ? (
                  <tr>
                    <td className="py-3 px-4">Deluxe Suite Sanctuary</td>
                    <td className="py-3 px-4 text-center">{booking.deluxeRooms} Room(s)</td>
                    <td className="py-3 px-4 text-right font-mono">Included</td>
                  </tr>
                ) : null}

                {booking.presidentialSuites ? (
                  <tr>
                    <td className="py-3 px-4">Presidential Suite Luxury Sanctuary</td>
                    <td className="py-3 px-4 text-center">{booking.presidentialSuites} Room(s)</td>
                    <td className="py-3 px-4 text-right font-mono">Included</td>
                  </tr>
                ) : null}

                {booking.privateVillas ? (
                  <tr>
                    <td className="py-3 px-4">Private Villa Eco Resort Estate</td>
                    <td className="py-3 px-4 text-center">{booking.privateVillas} Villa(s)</td>
                    <td className="py-3 px-4 text-right font-mono">Included</td>
                  </tr>
                ) : null}

                {booking.eventAttendees ? (
                  <tr>
                    <td className="py-3 px-4">Event Space Rental & Venue Hosting</td>
                    <td className="py-3 px-4 text-center">{booking.eventAttendees} Attendees</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {booking.eventSubtotal ? `$${booking.eventSubtotal.toLocaleString()}` : 'Included'}
                    </td>
                  </tr>
                ) : null}

                {booking.cateringPax ? (
                  <tr>
                    <td className="py-3 px-4">Bespoke Catering Service</td>
                    <td className="py-3 px-4 text-center">{booking.cateringPax} Pax</td>
                    <td className="py-3 px-4 text-right font-mono">Included</td>
                  </tr>
                ) : null}

                {totalRooms === 0 && !booking.eventAttendees && (
                  <tr>
                    <td className="py-3 px-4">Sanctuary Stay & Reservation Service</td>
                    <td className="py-3 px-4 text-center">1 Reservation</td>
                    <td className="py-3 px-4 text-right font-mono">Included</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-6">
            <div className="text-xs text-slate-500 space-y-1 max-w-xs">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Notes / Instructions:</div>
              <p>{booking.notes || 'Reservation is processed under Hanford Central Hospitality & Sanctuaries guidelines.'}</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">${(booking.roomSubtotal || 0) + (booking.eventSubtotal || 0) || (booking.totalAmount ? Math.round(booking.totalAmount / 1.1) : 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Fees (10%):</span>
                <span className="font-mono font-semibold">${booking.taxAmount || (booking.totalAmount ? Math.round(booking.totalAmount * 0.1) : 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#3A4F67] border-t border-slate-200 pt-2">
                <span>Total Amount:</span>
                <span className="font-mono text-[#51867E] text-base">
                  ${booking.totalAmount ? booking.totalAmount.toLocaleString() : '0'}
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
