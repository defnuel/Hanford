import React, { useState } from 'react';
import { BookingInquiry, Property } from '../../types';
import { Search, Printer, CheckCircle, Clock, Trash2, FileText, Building, Plus, AlertTriangle, CheckCircle2, X, ExternalLink, FileSpreadsheet } from 'lucide-react';
import { updateBookingPaymentStatus, deleteBookingInquiry } from '../../services/dataService';
import { getBookingTypeLabel } from '../../utils/bookingUtils';
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

  // Bulk Selection State
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

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

  const filteredIds = filteredBookings.map((b) => b.bookingId || b.id || '').filter(Boolean);
  const isAllSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedBookingIds.includes(id));

  const toggleSelectBooking = (id: string) => {
    setSelectedBookingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBookingIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedBookingIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const confirmBulkDelete = () => {
    selectedBookingIds.forEach((id) => {
      deleteBookingInquiry(id);
    });
    if (selectedInvoiceBooking) {
      const selectedId = selectedInvoiceBooking.bookingId || selectedInvoiceBooking.id;
      if (selectedId && selectedBookingIds.includes(selectedId)) {
        setSelectedInvoiceBooking(null);
      }
    }
    setSelectedBookingIds([]);
    setIsBulkDeleteModalOpen(false);
    onRefreshData();
  };

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

  if (isCreateInvoiceOpen) {
    return (
      <div className="space-y-4">
        <CreateInvoiceModal
          inline={true}
          properties={properties}
          onClose={() => setIsCreateInvoiceOpen(false)}
          onSuccess={() => {
            setIsCreateInvoiceOpen(false);
            onRefreshData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl font-serif font-light text-[#3A4F67]">
              Reservations & Invoices ({bookings.length})
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateInvoiceOpen(true)}
                className="px-3.5 py-2 bg-[#51867E] hover:bg-[#3f6d66] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Invoice</span>
              </button>
              <a
                href="https://docs.google.com/spreadsheets/d/1a2WN_AqaV9WS15h-37FDCyVV_ZpLB1IaBDbvb2VYzeU/edit#gid=1881675892"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                title="Open Google Sheets Central Register"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Google Sheet Register</span>
                <ExternalLink className="w-3 h-3 text-emerald-600 ml-0.5" />
              </a>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming reservations, update payment status, manage invoice records, or create custom invoices.
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
              All ({bookings.length})
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
              placeholder="Search guest, property, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#51867E]"
            />
          </div>
        </div>
      </div>

      {/* Bulk Delete Bar */}
      {selectedBookingIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 rounded-2xl animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-rose-900 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-rose-600" />
            <span>{selectedBookingIds.length} invoice(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedBookingIds([])}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedBookingIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Bookings Display Container */}
      {filteredBookings.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">No Reservation or Invoice Data Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No matching invoices found. You can create a new invoice using the "Create New Invoice" button above.
          </p>
          <button
            onClick={() => setIsCreateInvoiceOpen(true)}
            className="px-4 py-2 bg-[#51867E] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#3f6d66] transition-colors cursor-pointer inline-flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Invoice Now</span>
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card List View (For screens < md) */}
          <div className="md:hidden space-y-3">
            {filteredBookings.map((b) => {
              const id = b.bookingId || b.id || 'N/A';
              const isPaid = b.paymentStatus === 'PAID';
              const isSelected = selectedBookingIds.includes(id);

              return (
                <div key={id} className={`bg-white rounded-2xl border ${isSelected ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'} shadow-sm p-4 space-y-3`}>
                  {/* Top Header: Checkbox, ID & Status */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectBooking(id)}
                        className="w-4 h-4 rounded text-[#51867E] focus:ring-[#51867E] cursor-pointer"
                      />
                      <div>
                        <div className="font-mono font-bold text-[#3A4F67] text-xs">#{id}</div>
                        <div className="text-[10px] text-slate-400">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Recent'}
                        </div>
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
                        {getBookingTypeLabel(b)}
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
                        title="Delete Invoice"
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
                    <th className="py-3.5 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-[#51867E] focus:ring-[#51867E] cursor-pointer"
                        title="Select or Deselect All Filtered Invoices"
                      />
                    </th>
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
                    const isSelected = selectedBookingIds.includes(id);

                    return (
                      <tr key={id} className={`${isSelected ? 'bg-rose-50/40' : 'hover:bg-slate-50/80'} transition-colors`}>
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectBooking(id)}
                            className="w-4 h-4 rounded text-[#51867E] focus:ring-[#51867E] cursor-pointer"
                          />
                        </td>

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
                            {getBookingTypeLabel(b)}
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
                            title="Click to toggle invoice status"
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
                              title="Delete Invoice"
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
                  Confirm Status Change
                </h3>
                <p className="text-xs text-slate-500">Invoice #{statusConfirmTarget.bookingId}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              Are you sure you want to change payment status for <strong>"{statusConfirmTarget.guestName}"</strong> from{' '}
              <span className={`font-bold ${statusConfirmTarget.currentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {statusConfirmTarget.currentStatus}
              </span>{' '}
              to{' '}
              <span className={`font-bold ${statusConfirmTarget.currentStatus === 'PAID' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {statusConfirmTarget.currentStatus === 'PAID' ? 'UNPAID' : 'PAID'}
              </span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setStatusConfirmTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleStatus}
                className="px-4 py-2 bg-[#51867E] hover:bg-[#3f6d66] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Yes, Change Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Single Delete */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-800 text-base">
                  Confirm Delete Invoice
                </h3>
                <p className="text-xs text-slate-500">Invoice #{deleteConfirmTarget.bookingId}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
              Are you sure you want to delete the booking & invoice for guest <strong>"{deleteConfirmTarget.guestName}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Bulk Delete */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-800 text-base">
                  Confirm Bulk Delete
                </h3>
                <p className="text-xs text-slate-500">{selectedBookingIds.length} Invoice(s) Selected</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
              Are you sure you want to permanently delete <strong>{selectedBookingIds.length}</strong> selected invoice(s)? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete {selectedBookingIds.length} Invoice(s)</span>
              </button>
            </div>
          </div>
        </div>
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
