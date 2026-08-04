import React, { useState, useEffect } from 'react';
import { Property, BookingInquiry, BookOption, EventAddonOption, InvoiceLineItem } from '../../types';
import { X, Plus, Calculator, Building, Calendar, User, Tag, Sparkles, CheckCircle2, ShieldCheck, GripVertical, Trash2, FileText, ArrowLeft } from 'lucide-react';
import { submitBooking, fetchLocations } from '../../services/dataService';
import { PropertySearchSelect } from '../PropertySearchSelect';

interface CreateInvoiceModalProps {
  properties: Property[];
  onClose: () => void;
  onSuccess: () => void;
  inline?: boolean;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  properties,
  onClose,
  onSuccess,
  inline = false
}) => {
  const [loadedProperties, setLoadedProperties] = useState<Property[]>(properties || []);

  useEffect(() => {
    if (properties && properties.length > 0) {
      setLoadedProperties(properties);
    } else {
      fetchLocations().then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setLoadedProperties(res.data);
        }
      });
    }
  }, [properties]);

  const defaultProperty = loadedProperties[0] || {
    id: 'prop-1',
    name: 'Hanford Residence Los Angeles',
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

  useEffect(() => {
    if (loadedProperties.length > 0 && !selectedPropertySlug) {
      setSelectedPropertySlug(loadedProperties[0].slug);
    }
  }, [loadedProperties]);
  
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

  // Custom Product or Service Line Items (QuickBooks style)
  const [customLineItems, setCustomLineItems] = useState<InvoiceLineItem[]>([]);
  const [noteToCustomer, setNoteToCustomer] = useState('');
  const [memoOnStatement, setMemoOnStatement] = useState('');
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');

  // Financials & Notes
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'UNPAID' | 'PAID'>('UNPAID');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Line item actions
  const handleAddLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      serviceDate: new Date().toISOString().split('T')[0],
      productService: '',
      description: '',
      qty: 1,
      rate: 0,
      amount: 0
    };
    setCustomLineItems((prev) => [...prev, newItem]);
  };

  const handleUpdateLineItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setCustomLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          const q = Number(field === 'qty' ? value : item.qty) || 0;
          const r = Number(field === 'rate' ? value : item.rate) || 0;
          updated.amount = Math.round(q * r * 100) / 100;
        }
        return updated;
      })
    );
  };

  const handleRemoveLineItem = (id: string) => {
    setCustomLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllLines = () => {
    setCustomLineItems([]);
  };

  // Active property object
  const activeProperty = loadedProperties.find((p) => p.slug === selectedPropertySlug) || defaultProperty;

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

  // Custom Product or Service Subtotal
  const customItemsSubtotal = customLineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const subtotalBeforeDiscount = roomSubtotal + eventSubtotal + customItemsSubtotal;

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = Math.round((subtotalBeforeDiscount * (discountPercent || 0)) / 100);
  } else {
    discountAmount = Math.min(subtotalBeforeDiscount, Number(discountPercent) || 0);
  }

  const shipping = Math.max(0, Number(shippingFee) || 0);
  const subtotalAfterDiscount = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const taxAmount = Math.round((subtotalAfterDiscount + shipping) * 0.1);
  const grandTotal = subtotalAfterDiscount + shipping + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMsg('Please enter Guest Full Name.');
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
    if (customLineItems.length > 0) {
      customLineItems.forEach((item) => {
        if (item.productService.trim() || item.amount > 0) {
          itemRatesArr.push(`${item.productService || 'Service'}: $${item.amount}`);
        }
      });
    }

    const validCustomItems = customLineItems.filter(
      (item) => item.productService.trim() !== '' || item.amount > 0
    );

    const newInquiry: BookingInquiry = {
      id: bookingId,
      bookingId: bookingId,
      propertyName: activeProperty.name || (activeProperty as any).propertyName || 'Hanford Sanctuary',
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
      customLineItems: validCustomItems.length > 0 ? validCustomItems : undefined,
      noteToCustomer: noteToCustomer.trim() || undefined,
      memoOnStatement: memoOnStatement.trim() || undefined,
      shippingFee: shipping > 0 ? shipping : undefined,
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
      setErrorMsg('Failed to save invoice. Please try again.');
      setSubmitting(false);
    }
  };

  const formContent = (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 w-full flex flex-col overflow-hidden">
      {/* Invoice Generator Header */}
      <div className="bg-[#3A4F67] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
            <Calculator className="w-5 h-5 text-[#88B2AB]" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-[#88B2AB] uppercase tracking-widest flex items-center gap-2">
              <span>INVOICE GENERATOR</span>
            </div>
            <h3 className="text-base sm:text-lg font-serif font-light tracking-wide text-white">
              Create New Official Invoice
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {inline ? (
            <>
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Invoices</span>
            </>
          ) : (
            <X className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Modal Body Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 text-xs text-slate-700">
        
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
                Select Sanctuary / Property (SELECT FROM location name tab) *
              </label>
              <PropertySearchSelect
                properties={loadedProperties}
                selectedSlug={selectedPropertySlug}
                onSelect={(slug) => setSelectedPropertySlug(slug)}
              />
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
                  placeholder="e.g. John Doe"
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
                  placeholder="e.g. Hanford Group Corp"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">X Handle / Twitter</label>
                <input
                  type="text"
                  placeholder="e.g. @johndoe"
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
                  <option value="UNPAID">UNPAID</option>
                  <option value="PAID">PAID</option>
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
                { id: 'room', label: 'Room Stay', desc: 'Room accommodation' },
                { id: 'event', label: 'Event Hall', desc: 'Event venue & ballroom' },
                { id: 'both', label: 'Room & Event', desc: 'Room stay & event' },
                { id: 'meeting', label: 'Meeting Room', desc: 'Meeting room per pax' },
                { id: 'room_meeting', label: 'Room & Meeting', desc: 'Room stay & meeting' }
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

          {/* Section 5: Product or service (QuickBooks Style Table) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#51867E]" />
                Product or service
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">
                Add extra services outside room & venue reservation
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#3A4F67]/5 text-slate-700 font-bold uppercase text-[9.5px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-2 text-center w-8"></th>
                      <th className="py-2.5 px-2 text-center w-8">#</th>
                      <th className="py-2.5 px-3 min-w-[130px]">Service Date</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Product/service *</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Description</th>
                      <th className="py-2.5 px-3 text-center w-20">Qty</th>
                      <th className="py-2.5 px-3 text-right w-28">Rate ($)</th>
                      <th className="py-2.5 px-3 text-right w-28">Amount ($)</th>
                      <th className="py-2.5 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {customLineItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-slate-400 text-xs italic">
                          No extra products or services added yet. Click &quot;Add product or service&quot; below.
                        </td>
                      </tr>
                    ) : (
                      customLineItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-2 text-center text-slate-300">
                            <GripVertical className="w-3.5 h-3.5 mx-auto cursor-grab" />
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-slate-400 font-bold text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="date"
                              value={item.serviceDate || ''}
                              onChange={(e) => handleUpdateLineItem(item.id, 'serviceDate', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#51867E]"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              placeholder="e.g. Airport Transfer, Spa, Yacht"
                              value={item.productService}
                              onChange={(e) => handleUpdateLineItem(item.id, 'productService', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#51867E]"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              placeholder="Description of service"
                              value={item.description || ''}
                              onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#51867E]"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleUpdateLineItem(item.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-center font-bold outline-none focus:border-[#51867E]"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="0.00"
                              value={item.rate || ''}
                              onChange={(e) => handleUpdateLineItem(item.id, 'rate', Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-right font-mono font-medium outline-none focus:border-[#51867E]"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#3A4F67]">
                            ${(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(item.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add & Clear Actions */}
              <div className="p-2.5 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-[#51867E] hover:text-[#51867E] text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add product or service</span>
                </button>

                {customLineItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllLines}
                    className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  >
                    Clear all lines
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Customer payment options & Notes + Financial Calculation Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* Left: Customer payment options */}
            <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <FileText className="w-3.5 h-3.5 text-[#51867E]" />
                Customer payment options & notes
              </h4>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Note to customer
                </label>
                <textarea
                  rows={2}
                  placeholder="Thank you for your business."
                  value={noteToCustomer}
                  onChange={(e) => setNoteToCustomer(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#51867E] resize-y"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Memo on statement (hidden)
                </label>
                <textarea
                  rows={2}
                  placeholder="This memo will not show up on your invoice, but will appear on the statement."
                  value={memoOnStatement}
                  onChange={(e) => setMemoOnStatement(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#51867E] resize-y"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Special Notes / Requests (Internal)
                </label>
                <input
                  type="text"
                  placeholder="e.g. High floor, quiet room away from elevator"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#51867E]"
                />
              </div>
            </div>

            {/* Right: QuickBooks Style Financial Summary Box */}
            <div className="bg-[#3A4F67] text-white p-5 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#88B2AB] border-b border-slate-600 pb-2 flex items-center justify-between">
                  <span>Financial Calculation Summary</span>
                  <span>USD ($)</span>
                </div>

                <div className="space-y-2 text-xs pt-3">
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
                  {customItemsSubtotal > 0 && (
                    <div className="flex justify-between text-emerald-300 font-semibold">
                      <span>Custom Products & Services ({customLineItems.length} items):</span>
                      <span className="font-mono">${customItemsSubtotal.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-200 pt-1.5 border-t border-slate-600/60 font-medium">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold">${subtotalBeforeDiscount.toLocaleString()}</span>
                  </div>

                  {/* Discount row with toggle */}
                  <div className="flex items-center justify-between text-amber-300 text-xs">
                    <div className="flex items-center gap-2">
                      <span>Discount:</span>
                      <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-600">
                        <button
                          type="button"
                          onClick={() => setDiscountType('percent')}
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${discountType === 'percent' ? 'bg-[#51867E] text-white' : 'text-slate-400'}`}
                        >
                          %
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType('fixed')}
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${discountType === 'fixed' ? 'bg-[#51867E] text-white' : 'text-slate-400'}`}
                        >
                          $
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={discountPercent || ''}
                        onChange={(e) => setDiscountPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-16 px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-center text-xs font-bold text-white outline-none"
                      />
                    </div>
                    <span className="font-mono font-bold">-${discountAmount.toLocaleString()}</span>
                  </div>

                  {/* Shipping Fee */}
                  <div className="flex items-center justify-between text-slate-300 text-xs">
                    <div className="flex items-center gap-2">
                      <span>Shipping / Extra Fee:</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={shippingFee || ''}
                        onChange={(e) => setShippingFee(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-20 px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-right text-xs font-mono text-white outline-none"
                      />
                    </div>
                    <span className="font-mono">${shipping.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Tax & Service Charge (10%):</span>
                    <span className="font-mono">${taxAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-base font-bold text-[#88B2AB] pt-3 border-t border-slate-500">
                <span>Invoice Total:</span>
                <span className="font-mono text-2xl font-bold text-white">${grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer uppercase tracking-wider"
            >
              Cancel
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
  );

  if (inline) {
    return formContent;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="max-w-4xl w-full max-h-[92vh] flex flex-col overflow-y-auto rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {formContent}
      </div>
    </div>
  );
};
