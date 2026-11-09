import React, { useState } from 'react';
import { BookingInquiry, Property } from '../../types';
import { Search, Printer, CheckCircle, Clock, Trash2, FileText, Building, Plus, AlertTriangle, CheckCircle2, X, ExternalLink, FileSpreadsheet, KeyRound, Mail, LayoutGrid, Edit3, ArrowUpDown, ChevronDown, Calendar } from 'lucide-react';
import { updateBookingPaymentStatus, deleteBookingInquiry } from '../../services/dataService';
import { getBookingTypeLabel } from '../../utils/bookingUtils';
import { InvoiceModal } from './InvoiceModal';
import { CreateInvoiceModal } from './CreateInvoiceModal';

interface BookingsManagerProps {
  bookings: BookingInquiry[];
  properties?: Property[];
  onRefreshData: () => void;
  onOpenCardGenerator?: (booking: BookingInquiry, type: 'keycard' | 'welcomecard' | 'gallery') => void;
}

export const BookingsManager: React.FC<BookingsManagerProps> = ({
  bookings,
  properties = [],
  onRefreshData,
  onOpenCardGenerator
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low' | 'name_asc' | 'name_desc'>('newest');
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<BookingInquiry | null>(null);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingInquiry | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

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

  // Robust parser for booking timestamps (supports ISO string, YYYY-MM-DD, DD/MM/YYYY, or fallbacks)
  const parseBookingTimestamp = (b: BookingInquiry): number => {
    if (b.createdAt) {
      const t = new Date(b.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (b.checkInDate) {
      const t = new Date(b.checkInDate).getTime();
      if (!isNaN(t) && t > 0) return t;
      const parts = b.checkInDate.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
      if (parts) {
        const d = new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1])).getTime();
        if (!isNaN(d) && d > 0) return d;
      }
    }
    if (b.eventDate && b.eventDate.toUpperCase() !== 'N/A') {
      const t = new Date(b.eventDate).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    return 0;
  };

  // Sort bookings: Default is strictly Newest to Oldest
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'oldest') {
      const timeA = parseBookingTimestamp(a);
      const timeB = parseBookingTimestamp(b);
      if (timeA !== timeB && timeA > 0 && timeB > 0) return timeA - timeB;
      return (a.bookingId || a.id || '').localeCompare(b.bookingId || b.id || '');
    }
    if (sortBy === 'amount_high') {
      return (b.totalAmount || 0) - (a.totalAmount || 0);
    }
    if (sortBy === 'amount_low') {
      return (a.totalAmount || 0) - (b.totalAmount || 0);
    }
    if (sortBy === 'name_asc') {
      return a.guestName.localeCompare(b.guestName);
    }
    if (sortBy === 'name_desc') {
      return b.guestName.localeCompare(a.guestName);
    }
    // Default: 'newest' (From newest to oldest)
    const timeA = parseBookingTimestamp(a);
    const timeB = parseBookingTimestamp(b);
    if (timeA !== timeB && timeA > 0 && timeB > 0) return timeB - timeA;
    return (b.bookingId || b.id || '').localeCompare(a.bookingId || a.id || '');
  });

  const filteredIds = sortedBookings.map((b) => b.bookingId || b.id || '').filter(Boolean);
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
          initialBooking={editingBooking || undefined}
          properties={properties}
          onClose={() => {
            setIsCreateInvoiceOpen(false);
            setEditingBooking(null);
          }}
          onSuccess={() => {
            setIsCreateInvoiceOpen(false);
            setEditingBooking(null);
            onRefreshData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header: Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-semibold text-[#3A4F67]">
            Reservations &amp; Invoices ({bookings.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review incoming reservations, update payment status, manage invoice records, or create custom invoices.
          </p>
        </div>

        {/* Action Buttons: Wrapped to prevent overflow on mobile and overlapping on desktop */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreateInvoiceOpen(true)}
            className="px-3.5 py-2 bg-[#51867E] hover:bg-[#3f6d66] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Invoice</span>
          </button>
        </div>
      </div>

      {/* Control Toolbar: Status Filter, Sort Selector, and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/80 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL' ? 'bg-[#3A4F67] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setStatusFilter('UNPAID')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'UNPAID' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unpaid ({bookings.filter((b) => b.paymentStatus !== 'PAID').length})
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'PAID' ? 'bg-[#51867E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paid ({bookings.filter((b) => b.paymentStatus === 'PAID').length})
          </button>
        </div>

        {/* Right Controls: Sort & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-grow lg:flex-grow-0">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-2.5 py-1.5 border border-slate-200/80 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#51867E] shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer py-0.5 w-full sm:w-auto"
            >
              <option value="newest">Newest to Oldest</option>
              <option value="oldest">Oldest to Newest</option>
              <option value="amount_high">Highest Total Amount</option>
              <option value="amount_low">Lowest Total Amount</option>
              <option value="name_asc">Guest Name (A - Z)</option>
              <option value="name_desc">Guest Name (Z - A)</option>
            </select>
          </div>

          {/* Search bar */}
          <div className="relative flex-grow sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search guest, property, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#51867E] rounded-xl text-xs text-slate-800 outline-none transition-colors"
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
      {sortedBookings.length === 0 ? (
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
          {openDropdownId && (
            <div
              className="fixed inset-0 z-20"
              onClick={() => setOpenDropdownId(null)}
            />
          )}
          {/* Mobile Card List View (For screens < md) */}
          <div className="md:hidden space-y-3">
            {sortedBookings.map((b) => {
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
                      {b.businessName && b.businessName.trim() && b.businessName.trim().toUpperCase() !== 'HANFORD' && (
                        <div className="text-xs text-slate-600 font-medium">{b.businessName.trim()}</div>
                      )}
                      {b.xUsername && (
                        <div className="text-[11px] text-[#51867E] pt-0.5">
                          <span>X: {b.xUsername}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                        <Building className="w-3.5 h-3.5 text-[#51867E] shrink-0" />
                        <span>{b.propertyName}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        {getBookingTypeLabel(b)}
                      </div>
                      {(b.checkInDate || b.checkOutDate || b.eventDate) && (
                        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 pt-0.5">
                          <Calendar className="w-3 h-3 text-[#51867E] shrink-0" />
                          <span>
                            {b.checkInDate && b.checkOutDate
                              ? `${b.checkInDate} • ${b.checkOutDate}`
                              : (b.checkInDate
                                  ? `${b.checkInDate}`
                                  : (b.eventDate ? `${b.eventDate}` : ''))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total & Action Buttons */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <div>
                      <div className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Total Amount</div>
                      <div className="font-mono font-bold text-sm text-[#3A4F67]">
                        ${b.totalAmount ? b.totalAmount.toLocaleString() : '0'}
                      </div>
                      {(() => {
                        const hasCode = b.discountCode && b.discountCode.trim().toUpperCase() !== 'N/A';
                        const hasPercent = (b.discountPercent || 0) > 0;
                        if (!hasCode && !hasPercent) return null;
                        return (
                          <div className="text-[10px] font-semibold text-[#51867E]">
                            {hasCode ? `${b.discountCode} (${b.discountPercent || 0}% OFF)` : `${b.discountPercent}% OFF`}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 relative">
                      <button
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="px-2.5 py-1.5 bg-[#3A4F67] hover:bg-[#2C3744] text-white rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        title="View / Print Official Invoice"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#88B2AB]" />
                        <span>Invoice</span>
                      </button>

                      {onOpenCardGenerator && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenDropdownId(openDropdownId === id ? null : id)}
                            className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                            title="Guest Assets"
                          >
                            <span>Cards</span>
                            <ChevronDown className="w-3 h-3 text-slate-500" />
                          </button>
                          {openDropdownId === id && (
                            <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-left animate-in fade-in zoom-in-95 duration-100">
                              <div className="px-3 py-1 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                                Guest Assets
                              </div>
                              <button
                                type="button"
                                onClick={() => { onOpenCardGenerator(b, 'keycard'); setOpenDropdownId(null); }}
                                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-xs font-medium"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Key Card</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { onOpenCardGenerator(b, 'welcomecard'); setOpenDropdownId(null); }}
                                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-xs font-medium"
                              >
                                <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Welcoming Card</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { onOpenCardGenerator(b, 'gallery'); setOpenDropdownId(null); }}
                                className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-xs font-medium"
                              >
                                <LayoutGrid className="w-3.5 h-3.5 text-[#51867E] shrink-0" />
                                <span>Room Gallery</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setEditingBooking(b);
                          setIsCreateInvoiceOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-[#3A4F67] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Invoice"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => requestDelete(id, b.guestName)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
              <table className="w-full text-left text-xs min-w-[960px]">
                <thead className="bg-[#3A4F67] text-white uppercase tracking-wider text-[9px]">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-[#51867E] focus:ring-[#51867E] cursor-pointer"
                        title="Select or Deselect All Filtered Invoices"
                      />
                    </th>
                    <th
                      className="py-3 px-3 w-32 min-w-[125px] cursor-pointer hover:bg-slate-700/80 transition-colors select-none text-[9px]"
                      onClick={() => setSortBy((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
                      title="Click to sort by newest / oldest date"
                    >
                      <div className="flex items-center gap-1">
                        <span>Booking ID &amp; Date</span>
                        <ArrowUpDown className={`w-2.5 h-2.5 ${sortBy === 'newest' || sortBy === 'oldest' ? 'text-[#88B2AB]' : 'opacity-40'}`} />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 w-44 min-w-[160px] max-w-[190px] cursor-pointer hover:bg-slate-700/80 transition-colors select-none text-[9px]"
                      onClick={() => setSortBy((prev) => (prev === 'name_asc' ? 'name_desc' : 'name_asc'))}
                      title="Click to sort by guest name A-Z / Z-A"
                    >
                      <div className="flex items-center gap-1">
                        <span>Guest Details</span>
                        <ArrowUpDown className={`w-2.5 h-2.5 ${sortBy === 'name_asc' || sortBy === 'name_desc' ? 'text-[#88B2AB]' : 'opacity-40'}`} />
                      </div>
                    </th>
                    <th className="py-3 px-4 min-w-[270px] text-[9px]">Sanctuary &amp; Option</th>
                    <th
                      className="py-3 px-3 text-right w-28 min-w-[100px] cursor-pointer hover:bg-slate-700/80 transition-colors select-none text-[9px]"
                      onClick={() => setSortBy((prev) => (prev === 'amount_high' ? 'amount_low' : 'amount_high'))}
                      title="Click to sort by total invoice amount"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Total Amount</span>
                        <ArrowUpDown className={`w-2.5 h-2.5 ${sortBy === 'amount_high' || sortBy === 'amount_low' ? 'text-[#88B2AB]' : 'opacity-40'}`} />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center w-28 min-w-[100px] text-[9px]">Invoice Status</th>
                    <th className="py-3 px-4 text-right w-44 min-w-[170px] text-[9px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {sortedBookings.map((b, idx) => {
                    const id = b.bookingId || b.id || 'N/A';
                    const isPaid = b.paymentStatus === 'PAID';
                    const isSelected = selectedBookingIds.includes(id);

                    return (
                      <tr key={id} className={`${isSelected ? 'bg-rose-50/40' : 'hover:bg-slate-50/80'} transition-colors`}>
                        <td className="py-3 px-3 text-center w-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectBooking(id)}
                            className="w-4 h-4 rounded text-[#51867E] focus:ring-[#51867E] cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-3 space-y-0.5 w-32 min-w-[125px]">
                          <div className="font-mono font-bold text-[#3A4F67] text-[10px]">#{id}</div>
                          <div className="text-[8.5px] text-slate-400">
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Recent'}
                          </div>
                        </td>

                        <td className="py-3 px-3 space-y-0.5 w-44 min-w-[160px] max-w-[190px]">
                          <div className="font-bold text-slate-900 text-xs truncate" title={b.guestName}>{b.guestName}</div>
                          {b.businessName && b.businessName.trim() && b.businessName.trim().toUpperCase() !== 'HANFORD' && (
                            <div className="text-[10px] text-slate-600 font-medium truncate" title={b.businessName.trim()}>{b.businessName.trim()}</div>
                          )}
                          {b.xUsername && (
                            <div className="text-[10.5px] text-[#51867E] truncate">X: {b.xUsername}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 space-y-1 min-w-[270px]">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                            <Building className="w-3.5 h-3.5 text-[#51867E] shrink-0" />
                            <span>{b.propertyName}</span>
                          </div>
                          <div className="text-[10.5px] text-slate-600 font-medium">
                            {getBookingTypeLabel(b)}
                          </div>
                          {(b.checkInDate || b.checkOutDate || b.eventDate) && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-0.5">
                              <Calendar className="w-3 h-3 text-[#51867E] shrink-0" />
                              <span>
                                {b.checkInDate && b.checkOutDate
                                  ? `${b.checkInDate} • ${b.checkOutDate}`
                                  : (b.checkInDate
                                      ? `${b.checkInDate}`
                                      : (b.eventDate ? `${b.eventDate}` : ''))}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right w-28 min-w-[100px]">
                          <div className="font-mono font-bold text-xs text-[#3A4F67]">
                            ${b.totalAmount ? b.totalAmount.toLocaleString() : '0'}
                          </div>
                          {(() => {
                            const hasCode = b.discountCode && b.discountCode.trim().toUpperCase() !== 'N/A';
                            const hasPercent = (b.discountPercent || 0) > 0;
                            if (!hasCode && !hasPercent) return null;
                            return (
                              <div className="text-[9.5px] font-semibold text-[#51867E]">
                                {hasCode ? `${b.discountCode} (${b.discountPercent || 0}% OFF)` : `${b.discountPercent}% OFF`}
                              </div>
                            );
                          })()}
                        </td>

                        <td className="py-3 px-3 text-center w-28 min-w-[100px]">
                          <button
                            onClick={() => requestToggleStatus(id, b.guestName, b.paymentStatus)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
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

                        <td className="py-3 px-4 text-right w-44 min-w-[170px]">
                          <div className="flex items-center justify-end gap-1.5 relative">
                            <button
                              onClick={() => setSelectedInvoiceBooking(b)}
                              className="px-2.5 py-1.5 bg-[#3A4F67] hover:bg-[#2C3744] text-white rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              title="View / Print Official Invoice"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#88B2AB]" />
                              <span>Invoice</span>
                            </button>

                            {onOpenCardGenerator && (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setOpenDropdownId(openDropdownId === id ? null : id)}
                                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Guest Assets & Cards"
                                >
                                  <span>Cards</span>
                                  <ChevronDown className="w-3 h-3 text-slate-500" />
                                </button>
                                {openDropdownId === id && (
                                  <div className={`absolute right-0 ${idx >= sortedBookings.length - 2 && sortedBookings.length > 2 ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-left animate-in fade-in zoom-in-95 duration-100`}>
                                    <div className="px-3 py-1 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                                      Guest Assets
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => { onOpenCardGenerator(b, 'keycard'); setOpenDropdownId(null); }}
                                      className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-xs font-medium"
                                    >
                                      <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span>Key Card</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { onOpenCardGenerator(b, 'welcomecard'); setOpenDropdownId(null); }}
                                      className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-xs font-medium"
                                    >
                                      <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>Welcoming Card</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { onOpenCardGenerator(b, 'gallery'); setOpenDropdownId(null); }}
                                      className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-xs font-medium"
                                    >
                                      <LayoutGrid className="w-3.5 h-3.5 text-[#51867E] shrink-0" />
                                      <span>Room Gallery</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            <button
                              onClick={() => {
                                setEditingBooking(b);
                                setIsCreateInvoiceOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-[#3A4F67] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Invoice"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => requestDelete(id, b.guestName)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
          onOpenCardGenerator={onOpenCardGenerator}
          onEditInvoice={(bookingToEdit) => {
            setSelectedInvoiceBooking(null);
            setEditingBooking(bookingToEdit);
            setIsCreateInvoiceOpen(true);
          }}
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
