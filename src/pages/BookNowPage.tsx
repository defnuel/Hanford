import React, { useState, useEffect } from 'react';
import { Property, BookingInquiry, BookOption, EventAddonOption } from '../types';
import { fetchLocations, submitBooking } from '../services/dataService';
import { CheckCircle2, Send, AlertCircle, Sparkles, Building2, ExternalLink, Hotel, PartyPopper, Layers, AtSign, User, Users, Utensils } from 'lucide-react';

interface BookNowPageProps {
  initialPropertySlug?: string;
  onNavigate: (path: string) => void;
}

export const BookNowPage: React.FC<BookNowPageProps> = ({ initialPropertySlug, onNavigate }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Form State with individual numeric inputs
  const [formData, setFormData] = useState<BookingInquiry>({
    propertySlug: initialPropertySlug || '',
    propertyName: '',
    guestName: '',
    xUsername: '',
    bookOption: 'room',
    standardRooms: 0,
    deluxeRooms: 1,
    presidentialSuites: 0,
    privateVillas: 0,
    roomsCount: 1,
    eventAttendees: 50,
    eventAddons: 'both',
    cateringPax: 50,
    checkInDate: '',
    checkOutDate: '',
    eventDate: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    source?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations().then((res) => {
      setProperties(res.data);
      setLoadingLocations(false);

      if (initialPropertySlug) {
        const matched = res.data.find(
          (p) => p.slug.toLowerCase() === initialPropertySlug.toLowerCase()
        );
        if (matched) {
          setFormData((prev) => ({
            ...prev,
            propertySlug: matched.slug,
            propertyName: matched.name
          }));
        }
      } else if (res.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          propertySlug: res.data[0].slug,
          propertyName: res.data[0].name
        }));
      }
    });
  }, [initialPropertySlug]);

  const handlePropertyChange = (slug: string) => {
    const matched = properties.find((p) => p.slug === slug);
    const isGrand = matched ? matched.name.toLowerCase().includes('grand hotel') : slug.toLowerCase().includes('grand-hotel');
    
    setFormData((prev) => {
      const updatedPrivateVillas = isGrand ? 0 : (prev.privateVillas || 0);
      const total = (prev.standardRooms || 0) + (prev.deluxeRooms || 0) + (prev.presidentialSuites || 0) + updatedPrivateVillas;
      return {
        ...prev,
        propertySlug: slug,
        propertyName: matched ? matched.name : slug,
        privateVillas: updatedPrivateVillas,
        roomsCount: total
      };
    });
  };

  const selectedProperty = properties.find((p) => p.slug === formData.propertySlug);
  const isGrandHotel = selectedProperty
    ? selectedProperty.name.toLowerCase().includes('grand hotel')
    : formData.propertyName.toLowerCase().includes('grand hotel');

  // Auto-calculate total rooms
  const handleRoomCountChange = (field: 'standardRooms' | 'deluxeRooms' | 'presidentialSuites' | 'privateVillas', val: number) => {
    const parsed = Math.max(0, val || 0);
    setFormData((prev) => {
      const updated = { ...prev, [field]: parsed };
      const total = (updated.standardRooms || 0) + (updated.deluxeRooms || 0) + (updated.presidentialSuites || 0) + (updated.privateVillas || 0);
      return { ...updated, roomsCount: total };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.guestName || !formData.xUsername || !formData.propertySlug) {
      setErrorMessage('Please complete all required fields: Name, X Username, and Location. / Mohon lengkapi seluruh field wajib.');
      return;
    }

    if (formData.bookOption === 'room' || formData.bookOption === 'both' || formData.bookOption === 'room_meeting') {
      const totalRooms = (formData.standardRooms || 0) + (formData.deluxeRooms || 0) + (formData.presidentialSuites || 0) + (formData.privateVillas || 0);
      if (totalRooms <= 0) {
        setErrorMessage('Please specify at least 1 room in one of the room categories. / Mohon isi setidaknya 1 kamar.');
        return;
      }
      if (!formData.checkInDate || !formData.checkOutDate) {
        setErrorMessage('Please select Check-In and Check-Out dates for Room booking. / Mohon pilih tanggal Check-In dan Check-Out.');
        return;
      }
    }

    if (formData.bookOption === 'event' || formData.bookOption === 'both' || formData.bookOption === 'meeting' || formData.bookOption === 'room_meeting') {
      if (!formData.eventDate) {
        setErrorMessage('Please select Event / Meeting Date. / Mohon pilih Tanggal Event / Meeting.');
        return;
      }
      if (!formData.eventAttendees || formData.eventAttendees <= 0) {
        setErrorMessage('Please enter valid number of Event / Meeting Attendees (Pax). / Mohon masukkan jumlah orang dalam event / meeting.');
        return;
      }
      if ((formData.eventAddons === 'catering' || formData.eventAddons === 'both') && (!formData.cateringPax || formData.cateringPax <= 0)) {
        setErrorMessage('Please enter valid Catering Pax Count. / Mohon masukkan jumlah pax katering.');
        return;
      }
    }

    setSubmitting(true);
    const result = await submitBooking(formData);
    setSubmitting(false);

    if (result.success) {
      setSuccessResult({
        message: result.message,
        source: result.source
      });
    } else {
      setErrorMessage(result.message || 'Failed to submit reservation. Please try again.');
    }
  };

  const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1a2WN_AqaV9WS15h-37FDCyVV_ZpLB1IaBDbvb2VYzeU/edit?gid=0#gid=0';

  return (
    <div className="bg-[#FFFFFF] text-[#2C3744] pt-32 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#3A4F67] text-[#EAF2F1] rounded-full text-[10px] font-bold tracking-[0.3em] uppercase shadow border border-[#88B2AB]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#88B2AB]" />
            <span>CENTRAL RESERVATIONS</span>
          </div>
          <h1 className="font-serif italic text-4xl sm:text-6xl text-[#3A4F67] font-light">
            Reserve Your Experience
          </h1>
          <p className="text-xs sm:text-sm text-[#2C3744] max-w-xl mx-auto font-light leading-relaxed">
            Automated booking form synchronized directly with Hanford Central Reservations Google Sheets.
            <span className="block text-[11px] text-[#3A4F67] font-medium italic mt-0.5">
              Formulir pendaftaran reservasi terhubung langsung ke Google Sheets Central Register.
            </span>
          </p>

          <div className="pt-2">
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[11px] font-medium text-[#3A4F67] bg-[#EAF2F1] hover:bg-[#EAF2F1]/80 px-4 py-2 rounded-full border border-[#88B2AB]/30 shadow-sm transition-all hover:shadow"
            >
              <Building2 className="w-3.5 h-3.5 text-[#3A4F67]" />
              <span>Google Sheet Ready (Bookings Register)</span>
              <ExternalLink className="w-3 h-3 text-[#3A4F67]" />
            </a>
          </div>
        </div>

        {/* Success Confirmation View */}
        {successResult ? (
          <div className="info-panel bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-[#3A4F67] text-[#88B2AB] rounded-full flex items-center justify-center mx-auto border border-[#88B2AB]/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#3A4F67] uppercase block">
                RESERVATION RECORDED / RESERVASI TERCATAT
              </span>
              <h2 className="font-serif italic text-3xl text-[#3A4F67]">
                Thank You, {formData.guestName}
              </h2>
            </div>

            <p className="text-xs text-[#2C3744] max-w-md mx-auto leading-relaxed font-light">
              Your reservation inquiry has been saved and appended to our Google Sheet Booking Register.
            </p>

            <div className="bg-white p-6 border border-[#88B2AB]/30 rounded-2xl text-left text-xs space-y-3 max-w-lg mx-auto">
              <div className="flex justify-between border-b border-[#88B2AB]/20 pb-2">
                <span className="text-[#3A4F67] font-medium">Hotel Location / Lokasi:</span>
                <strong className="text-[#3A4F67]">{formData.propertyName}</strong>
              </div>
              <div className="flex justify-between border-b border-[#88B2AB]/20 pb-2">
                <span className="text-[#3A4F67] font-medium">Guest Name / Nama:</span>
                <span className="text-[#2C3744] font-semibold">{formData.guestName}</span>
              </div>
              <div className="flex justify-between border-b border-[#88B2AB]/20 pb-2">
                <span className="text-[#3A4F67] font-medium">X Username / Akun X:</span>
                <span className="text-[#51867E] font-medium">{formData.xUsername}</span>
              </div>
              <div className="flex justify-between border-b border-[#88B2AB]/20 pb-2">
                <span className="text-[#3A4F67] font-medium">Book Option / Opsi:</span>
                <span className="text-[#2C3744] font-medium capitalize">
                  {formData.bookOption === 'room' && 'For Room Only'}
                  {formData.bookOption === 'event' && 'For Event Location Only'}
                  {formData.bookOption === 'both' && 'Both Room & Events'}
                  {formData.bookOption === 'meeting' && 'For Meeting Only'}
                  {formData.bookOption === 'room_meeting' && 'Both Room & Meeting'}
                </span>
              </div>

              {(formData.bookOption === 'room' || formData.bookOption === 'both' || formData.bookOption === 'room_meeting') && (
                <>
                  <div className="border-b border-[#88B2AB]/20 pb-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#3A4F67] font-medium">Rooms Breakdown / Rincian Kamar:</span>
                      <strong className="text-[#3A4F67]">{formData.roomsCount} Total Room(s)</strong>
                    </div>
                    <div className="text-[11px] text-[#2C3744] pl-2 space-y-0.5">
                      {formData.standardRooms! > 0 && <div>• Standard Room: {formData.standardRooms}</div>}
                      {formData.deluxeRooms! > 0 && <div>• Deluxe Room: {formData.deluxeRooms}</div>}
                      {formData.presidentialSuites! > 0 && <div>• Presidential Suite: {formData.presidentialSuites}</div>}
                      {!isGrandHotel && formData.privateVillas! > 0 && <div>• Private Villa: {formData.privateVillas}</div>}
                    </div>
                  </div>
                  <div className="flex justify-between border-b border-[#88B2AB]/20 pb-2">
                    <span className="text-[#3A4F67] font-medium">Stay Dates / Tanggal Inap:</span>
                    <span className="text-[#2C3744] font-medium">{formData.checkInDate} to {formData.checkOutDate}</span>
                  </div>
                </>
              )}

              {(formData.bookOption === 'event' || formData.bookOption === 'both' || formData.bookOption === 'meeting' || formData.bookOption === 'room_meeting') && (
                <>
                  <div className="flex justify-between border-b border-[#88B2AB]/20 pb-2">
                    <span className="text-[#3A4F67] font-medium">Attendees / Jumlah Tamu:</span>
                    <span className="text-[#3A4F67] font-semibold">{formData.eventAttendees} Pax</span>
                  </div>
                  <div className="flex justify-between border-b border-[#88B2AB]/20 pb-2">
                    <span className="text-[#3A4F67] font-medium">Services / Opsi Tambahan:</span>
                    <span className="text-[#2C3744] font-medium">
                      {formData.eventAddons === 'both' && 'With Catering & Decoration'}
                      {formData.eventAddons === 'catering' && 'With Catering Only'}
                      {formData.eventAddons === 'decoration' && 'With Decoration Only'}
                      {formData.eventAddons === 'none' && 'Venue / Room Only (No Catering/Decoration)'}
                    </span>
                  </div>
                  {(formData.eventAddons === 'catering' || formData.eventAddons === 'both') && (
                    <div className="flex justify-between border-b border-[#88B2AB]/20 pb-2">
                      <span className="text-[#3A4F67] font-medium">Catering Pax / Porsi Katering:</span>
                      <span className="text-[#3A4F67] font-semibold">{formData.cateringPax} Pax</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-[#88B2AB]/20 pb-2">
                    <span className="text-[#3A4F67] font-medium">Event / Meeting Date:</span>
                    <span className="text-[#2C3744] font-medium">{formData.eventDate}</span>
                  </div>
                </>
              )}

              {formData.notes && (
                <div className="pt-1">
                  <span className="text-[#3A4F67] font-medium block mb-1">Remarks / Keterangan:</span>
                  <p className="text-[#2C3744] italic bg-[#EAF2F1]/50 p-3 rounded-lg border border-[#88B2AB]/20">
                    "{formData.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setSuccessResult(null);
                  setFormData({
                    propertySlug: properties[0]?.slug || '',
                    propertyName: properties[0]?.name || '',
                    guestName: '',
                    xUsername: '',
                    bookOption: 'room',
                    standardRooms: 0,
                    deluxeRooms: 1,
                    presidentialSuites: 0,
                    privateVillas: 0,
                    roomsCount: 1,
                    eventAttendees: 50,
                    eventAddons: 'both',
                    cateringPax: 50,
                    checkInDate: '',
                    checkOutDate: '',
                    eventDate: '',
                    notes: ''
                  });
                }}
                className="px-6 py-3 border border-[#88B2AB]/40 text-[#3A4F67] rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#51867E]/10 transition-colors cursor-pointer"
              >
                NEW RESERVATION / INQUIRY BARU
              </button>

              <a
                href={SPREADSHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#51867E] text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#3f6d66] transition-colors border border-[#88B2AB]/30 flex items-center gap-2"
              >
                <span>OPEN GOOGLE SHEET</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Main Interactive Form */
          <form
            onSubmit={handleSubmit}
            className="info-panel bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl p-6 sm:p-10 shadow-xl space-y-8"
          >
            {errorMessage && (
              <div className="p-4 bg-rose-100 border border-rose-300 text-rose-900 text-xs rounded-xl flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Location Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                1. HOTEL / RESORT LOCATION *
                <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  pilih lokasi hotel atau resort hanford
                </span>
              </label>

              {loadingLocations ? (
                <div className="h-11 bg-[#88B2AB]/20 animate-pulse rounded-full" />
              ) : (
                <div className="relative">
                  <select
                    value={formData.propertySlug}
                    onChange={(e) => handlePropertyChange(e.target.value)}
                    required
                    className="w-full px-5 py-3.5 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] font-semibold focus:outline-none focus:border-[#51867E] appearance-none"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.name} ({p.country})
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-[#51867E] absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            {/* 2. Contact / Personal Details */}
            <div className="space-y-4 pt-4 border-t border-[#88B2AB]/30">
              <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                2. GUEST INFORMATION *
                <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  informasi data pemesan
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#51867E]" />
                      Full Name *
                    </span>
                    <span className="block text-[10px] text-[#3A4F67] font-medium italic">
                      nama lengkap
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
                    <span className="flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-[#51867E]" />
                      X / Twitter Username *
                    </span>
                    <span className="block text-[10px] text-[#3A4F67] font-medium italic">
                      username akun x (tanpa @)
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@username"
                    value={formData.xUsername}
                    onChange={(e) => setFormData({ ...formData, xUsername: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 3. Book Option Choice */}
            <div className="space-y-4 pt-4 border-t border-[#88B2AB]/30">
              <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                3. BOOKING CATEGORY *
                <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  kategori jenis pemesanan
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Option: Room */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'room' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                    formData.bookOption === 'room'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Hotel className={`w-4 h-4 ${formData.bookOption === 'room' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'room' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      ROOM
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'room' ? 'text-white' : 'text-[#3A4F67]'}`}>ROOM</h3>
                    <p className={`text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'room' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
                      Pemesanan kamar & suite menginap
                    </p>
                  </div>
                </button>

                {/* Option: Event Location */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'event' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                    formData.bookOption === 'event'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <PartyPopper className={`w-4 h-4 ${formData.bookOption === 'event' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'event' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      EVENT
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'event' ? 'text-white' : 'text-[#3A4F67]'}`}>Event Location</h3>
                    <p className={`text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'event' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
                      Penyewaan venue acara & galeri
                    </p>
                  </div>
                </button>

                {/* Option: Both Room & Events */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'both' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                    formData.bookOption === 'both'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Layers className={`w-4 h-4 ${formData.bookOption === 'both' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'both' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      BOTH
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'both' ? 'text-white' : 'text-[#3A4F67]'}`}>Room & Event</h3>
                    <p className={`text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'both' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
                      Kombinasi kamar & venue acara
                    </p>
                  </div>
                </button>

                {/* Option: Meeting */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'meeting' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                    formData.bookOption === 'meeting'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Users className={`w-4 h-4 ${formData.bookOption === 'meeting' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'meeting' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      MEETING
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'meeting' ? 'text-white' : 'text-[#3A4F67]'}`}>Meeting</h3>
                    <p className={`text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'meeting' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
                      Penyewaan ruang meeting
                    </p>
                  </div>
                </button>

                {/* Option: Room & Meeting */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookOption: 'room_meeting' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                    formData.bookOption === 'room_meeting'
                      ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md ring-2 ring-[#88B2AB]/50'
                      : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 className={`w-4 h-4 ${formData.bookOption === 'room_meeting' ? 'text-white' : 'text-[#51867E]'}`} />
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      formData.bookOption === 'room_meeting' ? 'bg-[#88B2AB] text-[#1E293B]' : 'bg-[#3A4F67]/15 text-[#3A4F67]'
                    }`}>
                      ROOM & MEETING
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${formData.bookOption === 'room_meeting' ? 'text-white' : 'text-[#3A4F67]'}`}>Room & Meeting</h3>
                    <p className={`text-[10px] mt-0.5 font-medium leading-tight ${formData.bookOption === 'room_meeting' ? 'text-[#EAF2F1]' : 'text-[#3A4F67]'}`}>
                      Kamar & ruang meeting
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 4. Room Category Breakdown (Input Numbers) */}
            {(formData.bookOption === 'room' || formData.bookOption === 'both' || formData.bookOption === 'room_meeting') && (
              <div className="space-y-4 pt-4 border-t border-[#88B2AB]/30 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                    REQUIRED ROOM QUANTITIES *
                    <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                      opsi jumlah kamar tiap tipe kamar (masukkan angka)
                    </span>
                  </label>

                  <span className="text-[10px] font-bold text-[#3A4F67] bg-white px-3 py-1 rounded-full border border-[#88B2AB]/30">
                    Total: {(formData.standardRooms || 0) + (formData.deluxeRooms || 0) + (formData.presidentialSuites || 0) + (formData.privateVillas || 0)} Room(s)
                  </span>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${isGrandHotel ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
                  {/* Standard Room */}
                  <div className="bg-white p-4 rounded-2xl border border-[#88B2AB]/30 space-y-2">
                    <label className="block text-xs font-bold text-[#3A4F67]">
                      Standard Room
                      <span className="block text-[10px] text-[#3A4F67] font-medium italic">
                        kamar tipe standar
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.standardRooms ?? 0}
                      onChange={(e) => handleRoomCountChange('standardRooms', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-[#EAF2F1]/30 border border-[#88B2AB]/30 rounded-xl text-xs font-bold text-[#2C3744] focus:outline-none focus:border-[#51867E]"
                    />
                  </div>

                  {/* Deluxe Room */}
                  <div className="bg-white p-4 rounded-2xl border border-[#88B2AB]/30 space-y-2">
                    <label className="block text-xs font-bold text-[#3A4F67]">
                      Deluxe Room
                      <span className="block text-[10px] text-[#3A4F67] font-medium italic">
                        kamar tipe deluxe
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.deluxeRooms ?? 0}
                      onChange={(e) => handleRoomCountChange('deluxeRooms', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-[#EAF2F1]/30 border border-[#88B2AB]/30 rounded-xl text-xs font-bold text-[#2C3744] focus:outline-none focus:border-[#51867E]"
                    />
                  </div>

                  {/* Presidential Suite */}
                  <div className="bg-white p-4 rounded-2xl border border-[#88B2AB]/30 space-y-2">
                    <label className="block text-xs font-bold text-[#3A4F67]">
                      Presidential Suite
                      <span className="block text-[10px] text-[#3A4F67] font-medium italic">
                        kamar presidential suite
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.presidentialSuites ?? 0}
                      onChange={(e) => handleRoomCountChange('presidentialSuites', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-[#EAF2F1]/30 border border-[#88B2AB]/30 rounded-xl text-xs font-bold text-[#2C3744] focus:outline-none focus:border-[#51867E]"
                    />
                  </div>

                  {/* Private Villa (Only shown for Resorts, hidden for Grand Hotel) */}
                  {!isGrandHotel && (
                    <div className="bg-white p-4 rounded-2xl border border-[#88B2AB]/30 space-y-2 animate-in fade-in duration-300">
                      <label className="block text-xs font-bold text-[#3A4F67]">
                        Private Villa
                        <span className="block text-[10px] text-[#3A4F67] font-medium italic">
                          private villa (resort only)
                        </span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.privateVillas ?? 0}
                        onChange={(e) => handleRoomCountChange('privateVillas', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 bg-[#EAF2F1]/30 border border-[#88B2AB]/30 rounded-xl text-xs font-bold text-[#2C3744] focus:outline-none focus:border-[#51867E]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Event / Meeting Attendees & Services */}
            {(formData.bookOption === 'event' || formData.bookOption === 'both' || formData.bookOption === 'meeting' || formData.bookOption === 'room_meeting') && (
              <div className="space-y-6 pt-4 border-t border-[#88B2AB]/30 animate-in fade-in duration-300">
                
                {/* Event / Meeting Attendees Pax Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                    {formData.bookOption === 'meeting' || formData.bookOption === 'room_meeting' ? 'MEETING ATTENDEES (PAX) *' : 'EVENT ATTENDEES (PAX) *'}
                    <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                      jumlah peserta / tamu {formData.bookOption === 'meeting' || formData.bookOption === 'room_meeting' ? 'meeting' : 'event'}
                    </span>
                  </label>

                  <div className="relative max-w-sm">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 50"
                      value={formData.eventAttendees ?? ''}
                      onChange={(e) => setFormData({ ...formData, eventAttendees: parseInt(e.target.value) || 0 })}
                      className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs font-bold text-[#2C3744] focus:outline-none focus:border-[#51867E]"
                    />
                    <Users className="w-4 h-4 text-[#51867E] absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Event / Meeting Services (Catering & Venue Only Options) */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                    SERVICES & ADD-ONS *
                    <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                      pilih opsi dengan katering atau hanya venue / room
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, eventAddons: 'catering' })}
                      className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        formData.eventAddons === 'catering'
                          ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md'
                          : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                      }`}
                    >
                      <div>
                        <span className={formData.eventAddons === 'catering' ? 'text-white font-bold' : 'text-[#3A4F67] font-bold'}>With Catering</span>
                        <span className={`block text-[10px] ${formData.eventAddons === 'catering' ? 'text-[#EAF2F1] font-medium' : 'text-[#3A4F67] font-normal'}`}>Dengan fasilitas katering</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, eventAddons: 'none' })}
                      className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        formData.eventAddons === 'none'
                          ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md'
                          : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                      }`}
                    >
                      <div>
                        <span className={formData.eventAddons === 'none' ? 'text-white font-bold' : 'text-[#3A4F67] font-bold'}>Venue / Room Only</span>
                        <span className={`block text-[10px] ${formData.eventAddons === 'none' ? 'text-[#EAF2F1] font-medium' : 'text-[#3A4F67] font-normal'}`}>Hanya sewa tempat (tanpa katering)</span>
                      </div>
                    </button>

                    {(formData.bookOption === 'event' || formData.bookOption === 'both') && (
                      <>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, eventAddons: 'decoration' })}
                          className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            formData.eventAddons === 'decoration'
                              ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md'
                              : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                          }`}
                        >
                          <div>
                            <span className={formData.eventAddons === 'decoration' ? 'text-white font-bold' : 'text-[#3A4F67] font-bold'}>With Decoration Only</span>
                            <span className={`block text-[10px] ${formData.eventAddons === 'decoration' ? 'text-[#EAF2F1] font-medium' : 'text-[#3A4F67] font-normal'}`}>Dengan dekorasi saja</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, eventAddons: 'both' })}
                          className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            formData.eventAddons === 'both'
                              ? 'bg-[#51867E] text-white border-[#88B2AB] shadow-md'
                              : 'bg-white text-[#3A4F67] border-[#88B2AB]/30 hover:border-[#51867E]'
                          }`}
                        >
                          <div>
                            <span className={formData.eventAddons === 'both' ? 'text-white font-bold' : 'text-[#3A4F67] font-bold'}>With Catering & Decoration</span>
                            <span className={`block text-[10px] ${formData.eventAddons === 'both' ? 'text-[#EAF2F1] font-medium' : 'text-[#3A4F67] font-normal'}`}>Dengan katering & dekorasi</span>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Conditional Catering Pax Input */}
                {(formData.eventAddons === 'catering' || formData.eventAddons === 'both') && (
                  <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#88B2AB]/30 animate-in fade-in duration-300 max-w-sm">
                    <label className="block text-xs font-bold tracking-[0.1em] text-[#3A4F67] uppercase">
                      CATERING PAX COUNT *
                      <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                        jumlah pax porsi katering yang dibutuhkan
                      </span>
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="e.g. 50"
                        value={formData.cateringPax ?? ''}
                        onChange={(e) => setFormData({ ...formData, cateringPax: parseInt(e.target.value) || 0 })}
                        className="w-full px-5 py-3 bg-[#EAF2F1]/30 border border-[#88B2AB]/30 rounded-full text-xs font-bold text-[#2C3744] focus:outline-none focus:border-[#51867E]"
                      />
                      <Utensils className="w-4 h-4 text-[#51867E] absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. Dates Section */}
            <div className="space-y-4 pt-4 border-t border-[#88B2AB]/30">
              <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                4. RESERVATION DATES *
                <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  pilih tanggal pelaksanaan reservasi
                </span>
              </label>

              {/* Case 1: Room Only */}
              {formData.bookOption === 'room' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
                      Check-In Date *
                      <span className="block text-[10px] text-[#3A4F67] font-medium italic">
                        tanggal check-in
                      </span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.checkInDate}
                      onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                      className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
                      Check-Out Date *
                      <span className="block text-[10px] text-[#3A4F67] font-medium italic">
                        tanggal check-out
                      </span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.checkOutDate}
                      onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                      className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Case 2: Event or Meeting Only */}
              {(formData.bookOption === 'event' || formData.bookOption === 'meeting') && (
                <div className="animate-in fade-in duration-300 max-w-sm">
                  <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
                    {formData.bookOption === 'meeting' ? 'Meeting Date *' : 'Event Date *'}
                    <span className="block text-[10px] text-[#3A4F67] font-medium italic">
                      tanggal pelaksanaan {formData.bookOption === 'meeting' ? 'meeting' : 'event'}
                    </span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                  />
                </div>
              )}

              {/* Case 3: Both Room and Event / Room & Meeting */}
              {(formData.bookOption === 'both' || formData.bookOption === 'room_meeting') && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
                      Room Check-In *
                      <span className="block text-[10px] text-[#3A4F67] font-medium italic">
                        tanggal check-in
                      </span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.checkInDate}
                      onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                      className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
                      Room Check-Out *
                      <span className="block text-[10px] text-[#3A4F67] font-medium italic">
                        tanggal check-out
                      </span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.checkOutDate}
                      onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                      className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#3A4F67] mb-1">
                      {formData.bookOption === 'room_meeting' ? 'Meeting Date *' : 'Event Date *'}
                      <span className="block text-[10px] text-[#3A4F67] font-medium italic">
                        tanggal pelaksanaan {formData.bookOption === 'room_meeting' ? 'meeting' : 'event'}
                      </span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-5 py-3 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 7. Keterangan / Remarks & Special Requests */}
            <div className="space-y-2 pt-4 border-t border-[#88B2AB]/30">
              <label className="block text-xs font-bold tracking-[0.2em] text-[#3A4F67] uppercase">
                5. REMARKS & SPECIAL REQUESTS
                <span className="block text-[10px] text-[#3A4F67] font-medium italic lowercase tracking-normal">
                  keterangan: tuliskan alasan booking dan detail kebutuhan khusus yang perlu kami ketahui
                </span>
              </label>

              <textarea
                rows={4}
                placeholder="Please describe the purpose of your reservation (e.g. vacation stay, private event, brand launch, wedding, photo shoot) and any special arrangements required / Tuliskan alasan booking dan detail khusus..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-5 py-4 bg-white border border-[#88B2AB]/30 rounded-2xl text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E] font-light leading-relaxed"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-6 border-t border-[#88B2AB]/30 space-y-4">
              <button
                type="submit"
                disabled={submitting}
                className="book-now-button cta-button w-full py-4 bg-[#51867E] text-white hover:bg-[#3f6d66] rounded-full text-xs font-bold tracking-[0.25em] uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 border border-[#88B2AB]/30 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>SUBMITTING TO GOOGLE SHEETS...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>SUBMIT RESERVATION TO HANFORD REGISTER</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[#3A4F67] italic font-medium">
                * Form submissions are recorded and synchronized to Hanford Central Reservations Google Sheets.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
