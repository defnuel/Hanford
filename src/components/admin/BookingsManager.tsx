import React, { useState } from 'react';
import { BookingInquiry, Property } from '../../types';
import { Search, Printer, CheckCircle, Clock, Trash2, FileText, Building, Plus, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { updateBookingPaymentStatus, deleteBookingInquiry } from '../../services/dataService';
import { InvoiceModal } from './InvoiceModal';
import { CreateInvoiceModal } from './CreateInvoiceModal';

interface BookingsManagerProps {
  bookings: BookingInquiry[];
  properties?: Property[];
  onRefreshData: () => void;
}

export const BookingsManager: React.FC<BookingsManagerProps> = ({ bookings, properties = [], onRefreshData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<BookingInquiry | null>(null);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  // Status Change Confirmation Popup State
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<{
    bookingId: string;
    guestName: string;
    currentStatus: 'UNPAID' | 'PAID';
  } | null>(null);

  // Delete Confirmation Popup State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    bookingId: string;
    guestName: string;
  } | null>(null);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.bookingId || b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.xUsername || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'PAID') {
      return matchesSearch && b.paymentStatus === 'PAID';
    }
    if (statusFilter === 'UNPAID') {
      return matchesSearch && b.paymentStatus !== 'PAID';
    }
    return matchesSearch;
  });

  // Requests confirmation pop up before changing status
  const requestToggleStatus = (bookingId: string, guestName: string, currentStatus?: 'UNPAID' | 'PAID') => {
    setStatusConfirmTarget({
      bookingId,
      guestName,
      currentStatus: currentStatus === 'PAID' ? 'PAID' : 'UNPAID'
    });
  };

  // Confirms and executes status change
  const confirmToggleStatus = () => {
    if (!statusConfirmTarget) return;
    const { bookingId, currentStatus } = statusConfirmTarget;
    const nextStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';

    const updated = updateBookingPaymentStatus(bookingId, nextStatus);
    onRefreshData();

    if (selectedInvoiceBooking && (selectedInvoiceBooking.bookingId === bookingId || selectedInvoiceBooking.id === bookingId)) {
      setSelectedInvoiceBooking(updated || { ...selectedInvoiceBooking, paymentStatus: nextStatus });
    }

    setStatusConfirmTarget(null);
  };

  // Requests confirmation pop up before deleting
  const requestDelete = (bookingId: string, guestName: string) => {
    setDeleteConfirmTarget({ bookingId, guestName });
  };

  // Confirms and executes delete
  const confirmDelete = () => {
    if (!deleteConfirmTarget) return;
    const { bookingId } = deleteConfirmTarget;

    deleteBookingInquiry(bookingId);
    onRefreshData();

    if (selectedInvoiceBooking && (selectedInvoiceBooking.bookingId === bookingId || selectedInvoiceBooking.id === bookingId)) {
      setSelectedInvoiceBooking(null);
    }

    setDeleteConfirmTarget(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl font-serif font-light text-[#3A4F67]">
              Reservations & Invoices ({bookings.length})
            </h2>
            <button
              onClick={() => setIsCreateInvoiceOpen(true)}
              className="px-3.5 py-2 bg-[#51867E] hover:bg-[#3f6d66] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Invoice Baru</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tinjau booking masuk, ubah status invoice, hapus data, atau buat invoice baru (QuickBooks style).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Status Filter */}
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL' ? 'bg-[#3A4F67] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({bookings.length})
            </button>
            <button
              onClick={() => setStatusFilter('UNPAID')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'UNPAID' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unpaid ({bookings.filter((b) => b.paymentStatus !== 'PAID').length})
            </button>
            <button
              onClick={() => setStatusFilter('PAID')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'PAID' ? 'bg-[#51867E] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paid ({bookings.filter((b) => b.paymentStatus === 'PAID').length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-grow sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari guest/properti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#51867E]"
            />
          </div>
        </div>
      </div>

      {/* Bookings Display Container */}
      {filteredBookings.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">Belum Ada Data Booking</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Belum ada invoice/booking yang sesuai. Anda dapat membuat invoice baru menggunakan tombol "Buat Invoice Baru" di atas.
          </p>
          <button
            onClick={() => setIsCreateInvoiceOpen(true)}
            className="px-4 py-2 bg-[#51867E] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#3f6d66] transition-colors cursor-pointer inline-flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Invoice Baru Sekarang</span>
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card List View (For screens < md) */}
          <div className="md:hidden space-y-3">
            {filteredBookings.map((b) => {
              const id = b.bookingId || b.id || 'N/A';
              const isPaid = b.paymentStatus === 'PAID';

              return (
                <div key={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                  {/* Top Header: ID & Status */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div>
                      <div className="font-mono font-bold text-[#3A4F67] text-xs">#{id}</div>
                      <div className="text-[10px] text-slate-400">
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                    <button
                      onClick={() => requestToggleStatus(id, b.guestName, b.paymentStatus)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-amber-50 text-amber-700 border border-amber-300'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>PAID</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>UNPAID</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Guest & Sanctuary Details */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{b.guestName}</div>
                      {b.businessName && <div className="text-xs text-slate-600 font-medium">{b.businessName}</div>}
                      <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500 pt-0.5">
                        {b.xUsername && <span className="text-[#51867E]">X: {b.xUsername}</span>}
                        {b.guestEmail && <span>{b.guestEmail}</span>}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                        <Building className="w-3.5 h-3.5 text-[#51867E] shrink-0" />
                        <span>{b.propertyName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {b.bookOption === 'both' ? 'Room & Event' : b.bookOption === 'room_meeting' ? 'Room & Meeting' : b.bookOption.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        {b.checkInDate ? ` (${b.checkInDate})` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Total & Action Buttons */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <div>
                      <div className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Total Amount</div>
                      <div className="font-mono font-bold text-sm text-[#3A4F67]">
                        ${b.totalAmount ? b.totalAmount.toLocaleString() : '0'}
                      </div>
                      {b.discountCode && (
                        <div className="text-[10px] font-semibold text-[#51867E]">
                          {b.discountCode} ({b.discountPercent || 0}% OFF)
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="px-3 py-1.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={() => requestDelete(id, b.guestName)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Booking & Invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (For screens >= md) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead className="bg-[#3A4F67] text-white uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Booking ID & Date</th>
                    <th className="py-3.5 px-4">Guest Details</th>
                    <th className="py-3.5 px-4">Sanctuary & Option</th>
                    <th className="py-3.5 px-4 text-right">Total Amount</th>
                    <th className="py-3.5 px-4 text-center">Invoice Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredBookings.map((b) => {
                    const id = b.bookingId || b.id || 'N/A';
                    const isPaid = b.paymentStatus === 'PAID';

                    return (
                      <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="font-mono font-bold text-[#3A4F67] text-xs">#{id}</div>
                          <div className="text-[10px] text-slate-400">
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Recent'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-bold text-slate-900 text-xs">{b.guestName}</div>
                          {b.businessName && (
                            <div className="text-[10.5px] text-slate-600 font-medium">{b.businessName}</div>
                          )}
                          {b.xUsername && (
                            <div className="text-[11px] text-[#51867E]">X: {b.xUsername}</div>
                          )}
                          {b.guestEmail && (
                            <div className="text-[10px] text-slate-500">{b.guestEmail}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-[#51867E]" />
                            <span>{b.propertyName}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {b.bookOption === 'both' ? 'Room & Event' : b.bookOption === 'room_meeting' ? 'Room & Meeting' : b.bookOption.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            {b.checkInDate ? ` (${b.checkInDate})` : ''}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="font-mono font-bold text-xs text-[#3A4F67]">
                            ${b.totalAmount ? b.totalAmount.toLocaleString() : '0'}
                          </div>
                          {b.discountCode && (
                            <div className="text-[9.5px] font-semibold text-[#51867E]">
                              {b.discountCode} ({b.discountPercent || 0}% OFF)
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => requestToggleStatus(id, b.guestName, b.paymentStatus)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100'
                            }`}
                            title="Klik untuk mengubah status invoice"
                          >
                            {isPaid ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>PAID</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>UNPAID</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedInvoiceBooking(b)}
                              className="px-3 py-1.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Invoice</span>
                            </button>

                            <button
                              onClick={() => requestDelete(id, b.guestName)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Booking & Invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal for Payment Status Change */}
      {statusConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-800 text-base">
                  Konfirmasi Ubah Status
                </h3>
                <p className="text-xs text-slate-500">Invoice #{statusConfirmTarget.bookingId}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              Apakah Anda yakin ingin mengubah status pembayaran untuk <strong>"{statusConfirmTarget.guestName}"</strong> dari{' '}
              <span className={`font-bold ${statusConfirmTarget.currentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {statusConfirmTarget.currentStatus}
              </span>{' '}
              menjadi{' '}
              <span className={`font-bold ${statusConfirmTarget.currentStatus === 'PAID' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {statusConfirmTarget.currentStatus === 'PAID' ? 'UNPAID' : 'PAID'}
              </span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setStatusConfirmTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                onClick={confirmToggleStatus}
                className="px-4 py-2 bg-[#51867E] hover:bg-[#3f6d66] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ya, Ubah Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-800 text-base">
                  Konfirmasi Hapus Invoice
                </h3>
                <p className="text-xs text-slate-500">Invoice #{deleteConfirmTarget.bookingId}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
              Apakah Anda yakin ingin menghapus data booking & invoice untuk guest <strong>"{deleteConfirmTarget.guestName}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QuickBooks Style Create Invoice Modal */}
      {isCreateInvoiceOpen && (
        <CreateInvoiceModal
          properties={properties}
          onClose={() => setIsCreateInvoiceOpen(false)}
          onSuccess={() => {
            setIsCreateInvoiceOpen(false);
            onRefreshData();
          }}
        />
      )}

      {/* Invoice Modal Window for Print/View */}
      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
          onTogglePaymentStatus={(id, currentStatus) => {
            const nextStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';
            const updated = updateBookingPaymentStatus(id, nextStatus);
            onRefreshData();
            if (updated) {
              setSelectedInvoiceBooking(updated);
            } else {
              setSelectedInvoiceBooking({ ...selectedInvoiceBooking, paymentStatus: nextStatus });
            }
          }}
        />
      )}
    </div>
  );
};
