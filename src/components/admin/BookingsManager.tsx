import React, { useState } from 'react';
import { BookingInquiry } from '../../types';
import { Search, Printer, CheckCircle, Clock, Trash2, Calendar, User, FileText, AlertCircle, Building } from 'lucide-react';
import { updateBookingPaymentStatus, deleteBookingInquiry } from '../../services/dataService';
import { InvoiceModal } from './InvoiceModal';

interface BookingsManagerProps {
  bookings: BookingInquiry[];
  onRefreshData: () => void;
}

export const BookingsManager: React.FC<BookingsManagerProps> = ({ bookings, onRefreshData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<BookingInquiry | null>(null);

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

  const handleToggleStatus = (bookingId: string, currentStatus?: 'UNPAID' | 'PAID') => {
    const nextStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';
    const updated = updateBookingPaymentStatus(bookingId, nextStatus);
    onRefreshData();
    if (selectedInvoiceBooking && (selectedInvoiceBooking.bookingId === bookingId || selectedInvoiceBooking.id === bookingId)) {
      setSelectedInvoiceBooking(updated || { ...selectedInvoiceBooking, paymentStatus: nextStatus });
    }
  };

  const handleDelete = (bookingId: string, guestName: string) => {
    if (window.confirm(`Hapus data booking untuk guest "${guestName}"?`)) {
      deleteBookingInquiry(bookingId);
      onRefreshData();
      if (selectedInvoiceBooking && (selectedInvoiceBooking.bookingId === bookingId || selectedInvoiceBooking.id === bookingId)) {
        setSelectedInvoiceBooking(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-light text-[#3A4F67]">
            Reservations & Invoices ({bookings.length})
          </h2>
          <p className="text-xs text-slate-500">
            Tinjau booking masuk, ubah invoice status menjadi <strong className="text-[#51867E]">PAID</strong>, dan cetak official paid receipt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-[#3A4F67] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({bookings.length})
            </button>
            <button
              onClick={() => setStatusFilter('UNPAID')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === 'UNPAID' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unpaid ({bookings.filter((b) => b.paymentStatus !== 'PAID').length})
            </button>
            <button
              onClick={() => setStatusFilter('PAID')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
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

      {/* Bookings List Table */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">Belum Ada Data Booking</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Booking yang dilakukan oleh tamu di halaman web utama (/book-now) akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
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
                          onClick={() => handleToggleStatus(id, b.paymentStatus)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100'
                          }`}
                          title="Klik untuk mengubah status"
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
                            onClick={() => handleDelete(id, b.guestName)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Booking"
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
      )}

      {/* Invoice Modal Window */}
      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
          onTogglePaymentStatus={(id, status) => {
            handleToggleStatus(id, status);
          }}
        />
      )}
    </div>
  );
};
