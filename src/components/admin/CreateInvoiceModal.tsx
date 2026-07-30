import React, { useState } from 'react';
import { Property, BookingInquiry, BookOption, EventAddonOption } from '../../types';
import { X, Plus, Calculator, Building, Calendar, User, Tag, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { submitBooking } from '../../services/dataService';

interface CreateInvoiceModalProps {
  properties: Property[];
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  properties,
  onClose,
  onSuccess
}) => {
  const defaultProperty = properties[0] || {
    id: 'prop-1',
    propertyName: 'Hanford Residence Los Angeles',
    slug: 'los-angeles',
    priceStandard: 450,
    priceDeluxe: 650,
    pricePresidential: 1800,
    pricePrivateVilla: 2400,
    priceMeetingRoom: 120,
    priceEventHall: 3200,
    priceCateringPerPax: 85
  };

  const [bookingId, setBookingId] = useState(() => `HNF-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
  const [selectedPropertySlug, setSelectedPropertySlug] = useState(defaultProperty.slug || 'los-angeles');
  
  // Guest details
  const [guestName, setGuestName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [xUsername, setXUsername] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Booking category
  const [bookOption, setBookOption] = useState<BookOption>('room');

  // Stay / Room details
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [standardRooms, setStandardRooms] = useState(1);
  const [deluxeRooms, setDeluxeRooms] = useState(0);
  const [presidentialSuites, setPresidentialSuites] = useState(0);
  const [privateVillas, setPrivateVillas] = useState(0);

  // Meeting / Event details
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventAttendees, setEventAttendees] = useState(10);
  const [venueRentalRate, setVenueRentalRate] = useState<'half_day' | 'full_day' | 'full_board'>('full_day');
  const [eventAddons, setEventAddons] = useState<EventAddonOption>('none');
  const [cateringPax, setCateringPax] = useState(10);

  // Financials & Notes
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'UNPAID' | 'PAID'>('UNPAID');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Active property object
  const activeProperty = properties.find((p) => p.slug === selectedPropertySlug) || defaultProperty;

  // Nights calculation
  const calcNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calcNights();

  // Price calculations
  const priceStandard = activeProperty.priceStandard || 450;
  const priceDeluxe = activeProperty.priceDeluxe || 650;
  const pricePresidential = activeProperty.pricePresidential || 1800;
  const priceVilla = activeProperty.pricePrivateVilla || 2400;
  const baseMeetingRoom = activeProperty.priceMeetingRoom || 120;
  const priceEventHall = activeProperty.priceEventHall || 3200;
  const baseCatering = activeProperty.priceCateringPerPax || 85;

  const getVenueMultiplier = (rate: string) => {
    if (rate === 'half_day') return 0.4;
    if (rate === 'full_board') return 1.2;
    return 1.0;
  };

  const venueMultiplier = getVenueMultiplier(venueRentalRate);
  const effectiveMeetingRate = Math.round(baseMeetingRoom * venueMultiplier);
  const effectiveCateringRate = Math.round(baseCatering * venueMultiplier);

  // Calculates Subtotal
  let roomSubtotal = 0;
  if (bookOption === 'room' || bookOption === 'both' || bookOption === 'room_meeting') {
    roomSubtotal =
      (standardRooms * priceStandard +
        deluxeRooms * priceDeluxe +
        presidentialSuites * pricePresidential +
        privateVillas * priceVilla) *
      nights;
  }

  let eventSubtotal = 0;
  if (bookOption === 'meeting' || bookOption === 'room_meeting') {
    eventSubtotal = (eventAttendees || 1) * effectiveMeetingRate;
  } else if (bookOption === 'event' || bookOption === 'both') {
    const venueCost = priceEventHall;
    const cateringCost =
      eventAddons === 'catering' || eventAddons === 'both'
        ? (cateringPax || eventAttendees || 1) * effectiveCateringRate
        : 0;
    eventSubtotal = venueCost + cateringCost;
  }

  const subtotalBeforeDiscount = roomSubtotal + eventSubtotal;
  const discountAmount = Math.round((subtotalBeforeDiscount * (discountPercent || 0)) / 100);
  const subtotalAfterDiscount = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const taxAmount = Math.round(subtotalAfterDiscount * 0.1);
  const grandTotal = subtotalAfterDiscount + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMsg('Silakan isi Nama Guest / Tamu.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const itemRatesArr: string[] = [];
    if (roomSubtotal > 0) {
      if (standardRooms > 0) itemRatesArr.push(`Std: $${priceStandard}/nt (${standardRooms} rm)`);
      if (deluxeRooms > 0) itemRatesArr.push(`Dlx: $${priceDeluxe}/nt (${deluxeRooms} rm)`);
      if (presidentialSuites > 0) itemRatesArr.push(`Ste: $${pricePresidential}/nt (${presidentialSuites} rm)`);
      if (privateVillas > 0) itemRatesArr.push(`Villa: $${priceVilla}/nt (${privateVillas} rm)`);
    }
    if (eventSubtotal > 0) {
      if (bookOption === 'meeting' || bookOption === 'room_meeting') {
        itemRatesArr.push(`Meeting (${venueRentalRate}): $${effectiveMeetingRate}/pax`);
      } else {
        itemRatesArr.push(`Hall: $${priceEventHall}`);
        if (eventAddons === 'catering' || eventAddons === 'both') {
          itemRatesArr.push(`Catering: $${effectiveCateringRate}/pax`);
        }
      }
    }

    const newInquiry: BookingInquiry = {
      id: bookingId,
      bookingId: bookingId,
      propertyName: activeProperty.propertyName,
      propertySlug: activeProperty.slug,
      guestName: guestName.trim(),
      businessName: businessName.trim() || undefined,
      xUsername: xUsername.trim() ? (xUsername.startsWith('@') ? xUsername : `@${xUsername}`) : '',
      guestEmail: guestEmail.trim() || undefined,
      guestPhone: guestPhone.trim() || undefined,
      bookOption,
      venueRentalRate: bookOption === 'meeting' || bookOption === 'room_meeting' ? venueRentalRate : undefined,
      standardRooms: standardRooms || 0,
      deluxeRooms: deluxeRooms || 0,
      presidentialSuites: presidentialSuites || 0,
      privateVillas: privateVillas || 0,
      roomsCount: (standardRooms || 0) + (deluxeRooms || 0) + (presidentialSuites || 0) + (privateVillas || 0),
      eventAttendees: eventAttendees || 0,
      eventAddons: eventAddons,
      cateringPax: cateringPax || 0,
      checkInDate: bookOption === 'room' || bookOption === 'both' || bookOption === 'room_meeting' ? checkInDate : undefined,
      checkOutDate: bookOption === 'room' || bookOption === 'both' || bookOption === 'room_meeting' ? checkOutDate : undefined,
      eventDate: bookOption !== 'room' ? eventDate : undefined,
      numberOfNights: nights,
      priceStandardRoom: priceStandard,
      priceDeluxeRoom: priceDeluxe,
      pricePresidentialSuite: pricePresidential,
      pricePrivateVilla: priceVilla,
      priceMeetingRoom: effectiveMeetingRate,
      priceEventHall: priceEventHall,
      priceCateringPerPax: effectiveCateringRate,
      itemRatesSnapshot: itemRatesArr.join(' | '),
      discountCode: discountCode.trim() || undefined,
      discountPercent: discountPercent || 0,
      discountAmount,
      subtotalBeforeDiscount,
      subtotalBeforeTax: subtotalAfterDiscount,
      taxAmount,
      totalAmount: grandTotal,
      paymentStatus,
      status: paymentStatus === 'PAID' ? 'Confirmed' : 'Pending',
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      await submitBooking(newInquiry);
      setSubmitting(false);
      onSuccess();
    } catch (err) {
      console.error('Error creating invoice:', err);
      setErrorMsg('Gagal menyimpan invoice. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* QuickBooks Style Header */}
        <div className="bg-[#3A4F67] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <Calculator className="w-5 h-5 text-[#88B2AB]" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-[#88B2AB] uppercase tracking-widest flex items-center gap-2">
                <span>QUICKBOOKS STYLE INVOICE GENERATOR</span>
              </div>
              <h3 className="text-lg font-serif font-light tracking-wide text-white">
                Create New Official Invoice
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-grow text-xs text-slate-700">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Top Bar: Invoice ID & Property Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Invoice / Booking ID
              </label>
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-[#3A4F67] outline-none focus:border-[#51867E]"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Select Sanctuary / Property *
              </label>
              <select
                value={selectedPropertySlug}
                onChange={(e) => setSelectedPropertySlug(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none focus:border-[#51867E]"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.propertyName} ({p.location || 'Hanford Sanctuary'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 1: Guest Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#51867E] uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <User className="w-4 h-4 text-[#51867E]" />
              <span>1. Customer & Guest Details (Billed To)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  placeholder="Contoh: TREVOR / Defict"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:border-[#51867E]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Business / Company Name</label>
                <input
                  type="text"
                  placeholder="Contoh: Hanford Group Corp"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">X Handle / Twitter</label>
                <input
                  type="text"
                  placeholder="Contoh: @deflictive"
                  value={xUsername}
                  onChange={(e) => setXUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="guest@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-1234"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as 'UNPAID' | 'PAID')}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:border-[#51867E]"
                >
                  <option value="UNPAID">UNPAID (Belum Lunas)</option>
                  <option value="PAID">PAID (Sudah Lunas)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Booking Option / Service Category */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#51867E] uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <Building className="w-4 h-4 text-[#51867E]" />
              <span>2. Reservation Category & Service Type</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'room', label: 'Room Stay', desc: 'Penginapan ksh' },
                { id: 'event', label: 'Event Hall', desc: 'Sewa ballroom / venue' },
                { id: 'both', label: 'Room & Event', desc: 'Penginapan & Event' },
                { id: 'meeting', label: 'Meeting Room', desc: 'Meeting room per pax' },
                { id: 'room_meeting', label: 'Room & Meeting', desc: 'Inap + Meeting' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBookOption(opt.id as BookOption)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    bookOption === opt.id
                      ? 'bg-[#51867E] text-white border-[#51867E] shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-[#51867E]'
                  }`}
                >
                  <div className="font-bold text-[11px] uppercase tracking-wider">{opt.label}</div>
                  <div className={`text-[9.5px] mt-0.5 ${bookOption === opt.id ? 'text-slate-100' : 'text-slate-400'}`}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Room Inventory (If Room / Both / Room & Meeting) */}
          {(bookOption === 'room' || bookOption === 'both' || bookOption === 'room_meeting') && (
            <div className="space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#51867E]" />
                  Accommodation Rooms & Stay Dates
                </span>
                <span className="text-[10px] font-bold text-[#51867E] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {nights} Night(s) Stay
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Check-In Date</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:border-[#51867E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:border-[#51867E]"
                  />
                </div>
              </div>

              {/* Room Quantities */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-600">Standard Room</label>
                  <div className="text-[10px] text-slate-400 font-mono mb-1.5">${priceStandard}/night</div>
                  <input
                    type="number"
                    min="0"
                    value={standardRooms}
                    onChange={(e) => setStandardRooms(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-600">Deluxe Room</label>
                  <div className="text-[10px] text-slate-400 font-mono mb-1.5">${priceDeluxe}/night</div>
                  <input
                    type="number"
                    min="0"
                    value={deluxeRooms}
                    onChange={(e) => setDeluxeRooms(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-600">Presidential Suite</label>
                  <div className="text-[10px] text-slate-400 font-mono mb-1.5">${pricePresidential}/night</div>
                  <input
                    type="number"
                    min="0"
                    value={presidentialSuites}
                    onChange={(e) => setPresidentialSuites(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-600">Private Villa</label>
                  <div className="text-[10px] text-slate-400 font-mono mb-1.5">${priceVilla}/night</div>
                  <input
                    type="number"
                    min="0"
                    value={privateVillas}
                    onChange={(e) => setPrivateVillas(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Event / Meeting Details (If Event / Meeting / Both / Room & Meeting) */}
          {bookOption !== 'room' && (
            <div className="space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
              <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <Calendar className="w-3.5 h-3.5 text-[#51867E]" />
                Event & Meeting Services Configuration
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:border-[#51867E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Attendees / Attendees Pax</label>
                  <input
                    type="number"
                    min="1"
                    value={eventAttendees}
                    onChange={(e) => setEventAttendees(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold outline-none focus:border-[#51867E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                    Meeting Package Rate *
                  </label>
                  <select
                    value={venueRentalRate}
                    onChange={(e) => setVenueRentalRate(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold outline-none focus:border-[#51867E]"
                  >
                    <option value="half_day">HALF DAY (40% rate - ${effectiveMeetingRate}/pax)</option>
                    <option value="full_day">FULL DAY (100% rate - ${effectiveMeetingRate}/pax)</option>
                    <option value="full_board">FULL BOARD (120% rate - ${effectiveMeetingRate}/pax)</option>
                  </select>
                </div>
              </div>

              {(bookOption === 'event' || bookOption === 'both') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Event Catering Add-On</label>
                    <select
                      value={eventAddons}
                      onChange={(e) => setEventAddons(e.target.value as EventAddonOption)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:border-[#51867E]"
                    >
                      <option value="none">Venue Only (No Catering)</option>
                      <option value="catering">Include Gourmet Catering (+${effectiveCateringRate}/pax)</option>
                      <option value="both">Include Catering & Decoration (+${effectiveCateringRate}/pax)</option>
                    </select>
                  </div>

                  {(eventAddons === 'catering' || eventAddons === 'both') && (
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Catering Pax Count</label>
                      <input
                        type="number"
                        min="1"
                        value={cateringPax}
                        onChange={(e) => setCateringPax(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold outline-none focus:border-[#51867E]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section 5: Discount Code & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Discount Code</label>
              <input
                type="text"
                placeholder="e.g. VIP20"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono uppercase font-bold outline-none focus:border-[#51867E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Discount Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:border-[#51867E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Special Notes / Requests</label>
              <input
                type="text"
                placeholder="Keterangan tambahan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:border-[#51867E]"
              />
            </div>
          </div>

          {/* QuickBooks Style Line Item Summary Box */}
          <div className="bg-[#3A4F67] text-white p-5 rounded-2xl space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#88B2AB] border-b border-slate-600 pb-2 flex items-center justify-between">
              <span>Financial Calculation Summary</span>
              <span>USD ($)</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {roomSubtotal > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Room Accommodation ({nights} Nights):</span>
                  <span className="font-mono">${roomSubtotal.toLocaleString()}</span>
                </div>
              )}
              {eventSubtotal > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Venue & Meeting Service ({venueRentalRate.replace('_', ' ')}):</span>
                  <span className="font-mono">${eventSubtotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-600/50">
                <span>Subtotal:</span>
                <span className="font-mono">${subtotalBeforeDiscount.toLocaleString()}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-amber-300 font-semibold">
                  <span>Discount ({discountPercent}% OFF):</span>
                  <span className="font-mono">-${discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Tax & Service Charge (10%):</span>
                <span className="font-mono">${taxAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#88B2AB] pt-2 border-t border-slate-500">
                <span>Total Amount Due:</span>
                <span className="font-mono text-xl">${grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer uppercase tracking-wider"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#51867E] hover:bg-[#3f6d66] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Invoice...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Generate Invoice</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
