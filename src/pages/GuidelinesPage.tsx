import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  Compass, 
  Calendar, 
  BedDouble, 
  Users, 
  PartyPopper, 
  Bookmark, 
  CheckCircle2, 
  Tag, 
  Share2, 
  Heart, 
  ArrowRight, 
  Clock, 
  Coffee, 
  ShieldCheck, 
  CreditCard, 
  AlertCircle, 
  HelpCircle,
  Dumbbell,
  Wifi,
  Car,
  Utensils,
  Baby,
  Smile,
  FileText,
  Flag,
  Waves,
  Sun,
  Activity,
  Anchor,
  MoreHorizontal
} from 'lucide-react';

interface GuidelinesPageProps {
  onNavigate: (path: string) => void;
  defaultTab?: 'guest-venue' | 'ic';
}

export const GuidelinesPage: React.FC<GuidelinesPageProps> = ({ onNavigate, defaultTab = 'guest-venue' }) => {
  const [activeTab, setActiveTab] = useState<'guest-venue' | 'ic'>(defaultTab);

  useEffect(() => {
    // Check url search params if any
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'ic') {
      setActiveTab('ic');
    } else if (tabParam === 'guest' || tabParam === 'guest-venue') {
      setActiveTab('guest-venue');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBF9] pt-24 sm:pt-32 pb-20">
      {/* Top Banner & Tab Toggle Selector */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6 mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#51867E]/10 border border-[#51867E]/20 text-[#51867E] rounded-full text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HANFORD H&R GUIDELINES</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-light text-[#3A4F67] tracking-tight">
          Guidelines
        </h1>

        <div className="w-16 h-0.5 bg-[#88B2AB] mx-auto rounded-full" />

        {/* Tab Selector Buttons */}
        <div className="pt-2 flex items-center justify-center w-full">
          <div className="grid grid-cols-2 p-1.5 bg-slate-200/70 border border-slate-300/80 rounded-2xl sm:rounded-full gap-1.5 shadow-inner w-full max-w-lg">
            <button
              onClick={() => setActiveTab('guest-venue')}
              className={`px-2 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 text-center ${
                activeTab === 'guest-venue'
                  ? 'bg-[#3A4F67] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#3A4F67] hover:bg-white/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#88B2AB] shrink-0" />
              <span className="leading-tight">Guest & Venue Guidelines</span>
            </button>

            <button
              onClick={() => setActiveTab('ic')}
              className={`px-2 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 text-center ${
                activeTab === 'ic'
                  ? 'bg-[#51867E] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#51867E] hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200 shrink-0" />
              <span className="leading-tight">Writer's Guidelines</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Render based on Active Tab */}
      {activeTab === 'guest-venue' ? (
        <GuestVenueGuidelinesSection onNavigate={onNavigate} />
      ) : (
        <ICGuidelinesSection onNavigate={onNavigate} />
      )}
    </div>
  );
};

/* =========================================================================
   GUEST & VENUE GUIDELINES SECTION
   ========================================================================= */
const GuestVenueGuidelinesSection: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Intro text */}
      <div className="text-center max-w-2xl mx-auto pb-2 space-y-1">
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
          Official guidelines and service policies for staying guests, event organizers, and facility visitors across all <strong className="text-[#3A4F67] font-semibold">Hanford Hotels & Resorts</strong> destinations.
        </p>
        <p className="text-xs sm:text-sm text-slate-500 italic leading-relaxed">
          Panduan resmi dan ketentuan pelayanan untuk para tamu penginapan, penyelenggara acara, dan pengunjung fasilitas di seluruh destinasi Hanford Hotels & Resorts.
        </p>
      </div>

      {/* 01 — ROOM STAY */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3A4F67]/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
            01
          </div>

          <div className="space-y-4 flex-grow">
            <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
              <BedDouble className="w-4 h-4" />
              <span>ACCOMMODATION & POLICY</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
              ROOM STAY
            </h2>

            {/* Check-In / Check-Out Grid Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3A4F67]">
                  <Clock className="w-4 h-4 text-[#51867E]" />
                  <span>Check-In Time</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">Standard check-in time: <strong className="text-slate-900 font-bold">3:00 PM</strong></p>
                <p className="text-[11px] text-slate-500 italic">Waktu check-in standar: 15.00 / 3:00 PM Local Time</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3A4F67]">
                  <Clock className="w-4 h-4 text-[#51867E]" />
                  <span>Check-Out Time</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">Standard check-out time: <strong className="text-slate-900 font-bold">12:00 PM</strong></p>
                <p className="text-[11px] text-slate-500 italic">Waktu check-out standar: 12.00 / 12:00 PM Local Time</p>
              </div>
            </div>

            <div className="space-y-3.5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div>
                <strong className="text-slate-800 font-semibold block">Early Check-In & Late Check-Out:</strong>
                <p className="text-slate-700">Subject to availability and may be available upon request. Additional charges may apply.</p>
                <p className="text-[11px] text-slate-500 italic pt-0.5">Tergantung ketersediaan dan dapat diajukan sesuai permintaan. Biaya tambahan dapat berlaku.</p>
              </div>

              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-emerald-900 text-xs leading-relaxed space-y-1">
                <div className="flex items-start gap-2.5">
                  <Coffee className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div>
                      <strong className="font-bold">Breakfast:</strong> Daily breakfast is <strong className="underline decoration-emerald-400">complimentary for registered hotel guests</strong> and is available at the designated restaurant or dining venue during breakfast hours.
                    </div>
                    <p className="text-[11px] text-emerald-700/80 italic pt-0.5">
                      Sarapan harian gratis untuk tamu hotel terdaftar dan tersedia di restoran atau tempat makan yang ditentukan selama jam sarapan.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <strong className="text-slate-800 font-semibold block">Room Occupancy:</strong>
                <p className="text-slate-700">Each room category has a maximum occupancy based on its room type and configuration. Additional guests may be subject to applicable charges and hotel policies.</p>
                <p className="text-[11px] text-slate-500 italic pt-0.5">Setiap kategori kamar memiliki kapasitas maksimum berdasarkan tipe dan konfigurasi kamar. Tamu tambahan dapat dikenakan biaya sesuai kebijakan hotel.</p>
              </div>

              <div>
                <strong className="text-slate-800 font-semibold block">Housekeeping:</strong>
                <p className="text-slate-700">Daily housekeeping service is provided during the guest's stay. Additional housekeeping requests may be arranged with the hotel.</p>
                <p className="text-[11px] text-slate-500 italic pt-0.5">Layanan pembersihan kamar harian disediakan selama tamu menginap. Permintaan pembersihan tambahan dapat diatur bersama pihak hotel.</p>
              </div>

              <div>
                <strong className="text-slate-800 font-semibold block">Guest Conduct:</strong>
                <p className="text-slate-700">Guests are expected to respect the comfort, privacy, and safety of other guests and hotel staff throughout their stay.</p>
                <p className="text-[11px] text-slate-500 italic pt-0.5">Tamu diharapkan menjaga kenyamanan, privasi, dan keselamatan tamu lain serta staf hotel sepanjang masa menginap.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 02 — MEETING ROOM */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#51867E]/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
            02
          </div>

          <div className="space-y-4 flex-grow">
            <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
              <Users className="w-4 h-4" />
              <span>CORPORATE & WORKSHOPS</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
              MEETING ROOM
            </h2>

            <div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Hanford meeting rooms are designed for <strong className="text-slate-900 font-semibold">corporate meetings, private gatherings, workshops, seminars, and professional events</strong>.
              </p>
              <p className="text-[11px] text-slate-500 italic pt-0.5">
                Ruang pertemuan Hanford dirancang untuk rapat perusahaan, acara pribadi, lokakarya, seminar, dan acara profesional lainnya.
              </p>
            </div>

            {/* Rental Options Grid */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3A4F67] block">Rental Options</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <span className="font-bold text-xs text-[#51867E] block uppercase tracking-wider">Half Day</span>
                  <p className="text-xs text-slate-700 font-medium">Maximum 4–5 hours</p>
                  <p className="text-[11px] text-slate-500">Includes 1 coffee break or 1 meal.</p>
                  <p className="text-[10px] text-slate-400 italic pt-0.5 border-t border-slate-200/60">Maks. 4–5 jam (1x coffee break/makan)</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <span className="font-bold text-xs text-[#51867E] block uppercase tracking-wider">Full Day</span>
                  <p className="text-xs text-slate-700 font-medium">Maximum 8–9 hours</p>
                  <p className="text-[11px] text-slate-500">Includes 2 coffee breaks & 1 meal.</p>
                  <p className="text-[10px] text-slate-400 italic pt-0.5 border-t border-slate-200/60">Maks. 8–9 jam (2x coffee break + 1x makan)</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <span className="font-bold text-xs text-[#51867E] block uppercase tracking-wider">Full Board</span>
                  <p className="text-xs text-slate-700 font-medium">Maximum 10–12 hours</p>
                  <p className="text-[11px] text-slate-500">Includes 2 coffee breaks, 1 lunch & 1 dinner.</p>
                  <p className="text-[10px] text-slate-400 italic pt-0.5 border-t border-slate-200/60">Maks. 10–12 jam (2x break + makan siang & malam)</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div>
                <strong className="text-slate-800 font-semibold block">Room & Accommodation:</strong>
                <p className="text-slate-700">Meeting room bookings may be combined with hotel accommodation, subject to availability.</p>
                <p className="text-[11px] text-slate-500 italic pt-0.5">Pemesanan ruang rapat dapat digabungkan dengan akomodasi hotel, tergantung ketersediaan.</p>
              </div>

              <div>
                <strong className="text-slate-800 font-semibold block">Additional Services:</strong>
                <p className="text-slate-700">Catering, decoration, AV equipment, and other event requirements may be arranged upon request and are subject to availability and additional charges.</p>
                <p className="text-[11px] text-slate-500 italic pt-0.5">Katering, dekorasi, peralatan AV, dan kebutuhan acara lainnya dapat diatur sesuai permintaan dan dapat dikenakan biaya tambahan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 03 — EVENT HALL & BALLROOM */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3A4F67]/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
            03
          </div>

          <div className="space-y-4 flex-grow">
            <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
              <PartyPopper className="w-4 h-4" />
              <span>GRAND CELEBRATIONS & GALAS</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
              EVENT HALL & BALLROOM
            </h2>

            <div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Hanford Event Halls and Ballrooms are available for <strong className="text-slate-900 font-semibold">weddings, gala dinners, conferences, celebrations, receptions, corporate events, and private occasions</strong>.
              </p>
              <p className="text-[11px] text-slate-500 italic pt-0.5">
                Event Hall & Ballroom Hanford tersedia untuk pernikahan, gala dinner, konferensi, perayaan, resepsi, acara perusahaan, dan acara pribadi.
              </p>
            </div>

            <div className="space-y-3.5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div>
                <strong className="text-slate-800 font-semibold block">Venue Rental:</strong>
                <p className="text-slate-700">Event Hall and Ballroom rental is based on the selected venue, event date, duration, and guest capacity.</p>
                <p className="text-[11px] text-slate-500 italic pt-0.5">Sewa Event Hall & Ballroom disesuaikan dengan lokasi yang dipilih, tanggal acara, durasi, serta kapasitas tamu.</p>
              </div>

              <div>
                <strong className="text-slate-800 font-semibold block mb-1.5">Event Packages May Include:</strong>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { en: 'Venue Rental', id: 'Sewa Tempat' },
                    { en: 'Catering', id: 'Katering' },
                    { en: 'Decoration', id: 'Dekorasi' },
                    { en: 'Event Setup', id: 'Penataan Acara' },
                    { en: 'Audio-Visual Equipment', id: 'Peralatan AV' },
                    { en: 'Event Support', id: 'Dukungan Acara' }
                  ].map((pkg) => (
                    <div key={pkg.en} className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-700 font-medium space-y-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#51867E] shrink-0" />
                        <span>{pkg.en}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic pl-5">{pkg.id}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <strong className="text-slate-800 font-semibold block">Customization:</strong>
                <p className="text-slate-700">Event packages can be customized according to the requirements and scale of each event.</p>
                <p className="text-[11px] text-slate-500 italic pt-0.5">Paket acara dapat disesuaikan dengan kebutuhan dan skala masing-masing acara.</p>
              </div>

              <div>
                <strong className="text-slate-800 font-semibold block">Accommodation & Booking Requirements:</strong>
                <p className="text-slate-700">Guests may arrange hotel accommodation in conjunction with their event, subject to room availability. A confirmed booking requires completion of the booking process and payment according to the applicable reservation terms.</p>
                <p className="text-[11px] text-slate-500 italic pt-0.5">Tamu dapat mengatur akomodasi hotel bersamaan dengan acara mereka, tergantung ketersediaan kamar. Pemesanan terkonfirmasi setelah menyelesaikan proses reservasi dan pembayaran.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 04 — GENERAL FACILITIES */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#51867E]/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
            04
          </div>

          <div className="space-y-4 flex-grow">
            <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
              <Building2 className="w-4 h-4" />
              <span>GUEST AMENITIES & EXPERIENCES</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
              GENERAL FACILITIES
            </h2>

            <div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Registered hotel guests may enjoy access to designated standard hotel facilities <strong className="text-emerald-700 font-semibold">at no additional charge</strong>, subject to each property's operating hours and policies.
              </p>
              <p className="text-[11px] text-slate-500 italic pt-0.5">
                Tamu hotel terdaftar dapat menikmati akses ke fasilitas standar hotel tanpa biaya tambahan, sesuai jam operasional dan kebijakan masing-masing properti.
              </p>
            </div>

            {/* Facilities Chips */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3A4F67] block">Complimentary Facilities May Include:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Swimming Pool', icon: Waves },
                  { name: 'Fitness Centre', icon: Dumbbell },
                  { name: 'Wi-Fi', icon: Wifi },
                  { name: 'Breakfast', icon: Utensils },
                  { name: 'Parking', icon: Car },
                  { name: "Kids' Facilities", icon: Baby },
                  { name: 'Public Guest Areas', icon: Users }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.name}
                      className="px-3.5 py-1.5 bg-[#F0F4F8] border border-slate-200/90 rounded-full flex items-center gap-2 text-xs sm:text-sm shadow-2xs hover:bg-slate-200/60 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-[#51867E] shrink-0" />
                      <span className="font-semibold text-[#1E293B]">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-slate-500 italic pt-1 leading-relaxed">
                * Additional facilities, premium services, spa treatments, private activities, transportation, and selected experiences may incur additional charges.
              </p>
              <p className="text-[11px] text-slate-400 italic leading-relaxed">
                * Fasilitas tambahan, layanan premium, perawatan spa, aktivitas privat, transportasi, dan pengalaman tertentu dapat dikenakan biaya tambahan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 05 — RESERVATION & PAYMENT */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3A4F67]/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
            05
          </div>

          <div className="space-y-4 flex-grow">
            <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
              <CreditCard className="w-4 h-4" />
              <span>TERMS & PAYMENT</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
              RESERVATION & PAYMENT
            </h2>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#51867E] shrink-0 mt-0.5" />
                <div>
                  <span>All room, meeting room, and event bookings are subject to availability.</span>
                  <p className="text-[11px] text-slate-500 italic pt-0.5">Seluruh pemesanan kamar, ruang rapat, dan acara tergantung pada ketersediaan.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#51867E] shrink-0 mt-0.5" />
                <div>
                  <span>Guests and event organizers are required to provide accurate booking information and complete payment within the specified payment period.</span>
                  <p className="text-[11px] text-slate-500 italic pt-0.5">Tamu dan penyelenggara acara wajib memberikan informasi pemesanan yang akurat serta menyelesaikan pembayaran dalam batas waktu yang ditentukan.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#51867E] shrink-0 mt-0.5" />
                <div>
                  <span>Reservations are considered confirmed only after the required booking and payment process has been completed.</span>
                  <p className="text-[11px] text-slate-500 italic pt-0.5">Reservasi dianggap terkonfirmasi hanya setelah proses pemesanan dan pembayaran selesai.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#51867E] shrink-0 mt-0.5" />
                <div>
                  <span>Cancellation, amendment, refund, and no-show policies may vary depending on the property, booking type, and selected package.</span>
                  <p className="text-[11px] text-slate-500 italic pt-0.5">Kebijakan pembatalan, perubahan, pengembalian dana (refund), dan no-show dapat bervariasi tergantung pada properti, jenis pemesanan, dan paket yang dipilih.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 06 — IMPORTANT NOTE */}
      <div className="bg-gradient-to-br from-[#3A4F67] to-[#2C3744] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#51867E]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#51867E] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-md">
            06
          </div>

          <div className="space-y-4 flex-grow">
            <div className="flex items-center gap-2 text-[#88B2AB] text-xs font-bold uppercase tracking-widest font-mono">
              <AlertCircle className="w-4 h-4" />
              <span>PROPERTY SPECIFIC DETAILS</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-white font-light tracking-wide">
              IMPORTANT NOTE
            </h2>

            <div className="space-y-2">
              <div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                  Guidelines, facilities, operating hours, room occupancy, event capacity, and applicable charges may vary between Hanford properties.
                </p>
                <p className="text-[11px] text-slate-400 italic pt-0.5">
                  Panduan, fasilitas, jam operasional, kapasitas kamar, kapasitas acara, dan biaya yang berlaku dapat bervariasi di setiap properti Hanford.
                </p>
              </div>

              <div className="pt-1">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                  For the most accurate information, guests are advised to review the details of their selected property before completing a reservation.
                </p>
                <p className="text-[11px] text-slate-400 italic pt-0.5">
                  Untuk informasi paling akurat, tamu disarankan untuk memeriksa detail properti yang dipilih sebelum menyelesaikan reservasi.
                </p>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onNavigate('/book-now')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer group/btn"
              >
                <span>For Reservations & Inquiries</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="py-1">
              <div className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm text-center">
                <span className="font-serif text-xs sm:text-sm text-[#88B2AB] tracking-[0.2em] font-light uppercase">
                  Stay. Dine. Gather. Explore.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

/* =========================================================================
   IC GUIDELINES SECTION
   ========================================================================= */
const ICGuidelinesSection: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Intro text */}
      <div className="text-center max-w-2xl mx-auto pb-2">
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Selamat datang di <strong className="text-[#3A4F67] font-semibold">Hanford Hotels and Resorts (Hanford H&R)</strong>. Panduan ini dibuat untuk membantu kalian menggunakan berbagai properti dan fasilitas Hanford H&R untuk kebutuhan <strong className="text-[#51867E] font-semibold">In Character (IC)</strong> maupun plot.
        </p>
      </div>

      {/* 01 — EXPLORE OUR LOCATIONS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#51867E]/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
            01
          </div>

          <div className="space-y-3.5 flex-grow">
            <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
              <Compass className="w-4 h-4" />
              <span>LOCATION EXPLORATION</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
              EXPLORE OUR LOCATIONS
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Seluruh informasi mengenai properti, fasilitas, suasana, dan visualisasi setiap lokasi dapat ditemukan melalui <strong className="text-slate-900 font-semibold">Gallery</strong> pada halaman masing-masing lokasi di website Hanford H&R.
            </p>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Gunakan informasi dan visualisasi tersebut sebagai referensi untuk kebutuhan <strong className="text-[#51867E] font-semibold">IC, plot, dan storytelling</strong> kalian.
            </p>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('/locations')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer group/btn"
              >
                <span>Explore Our Locations</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 02 — OFFICIAL BOOKING */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3A4F67]/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
            02
          </div>

          <div className="space-y-4 flex-grow">
            <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
              <Calendar className="w-4 h-4" />
              <span>RESERVATIONS & EVENTS</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
              OFFICIAL BOOKING
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Untuk kebutuhan IC yang melibatkan penggunaan secara resmi atau terstruktur, Hanford H&R saat ini melayani sistem booking untuk:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5 hover:border-[#51867E]/40 transition-colors">
                <div className="flex items-center gap-2 font-bold text-xs text-[#3A4F67]">
                  <BedDouble className="w-4 h-4 text-[#51867E]" />
                  <span>Room Booking</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Untuk kebutuhan menginap atau menggunakan kamar hotel dan resort.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5 hover:border-[#51867E]/40 transition-colors">
                <div className="flex items-center gap-2 font-bold text-xs text-[#3A4F67]">
                  <Users className="w-4 h-4 text-[#51867E]" />
                  <span>Meeting Room</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Untuk meeting, workshop, seminar, gathering, dan kebutuhan profesional lainnya.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5 hover:border-[#51867E]/40 transition-colors">
                <div className="flex items-center gap-2 font-bold text-xs text-[#3A4F67]">
                  <PartyPopper className="w-4 h-4 text-[#51867E]" />
                  <span>Event Hall / Ballroom</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Untuk wedding, gala dinner, celebration, reception, corporate event, dan acara lainnya.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#EAF2F1]/80 border border-[#88B2AB]/40 rounded-2xl text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
              <Bookmark className="w-4 h-4 text-[#51867E] shrink-0 mt-0.5" />
              <div>
                Untuk kebutuhan acara atau bentuk kolaborasi lain di luar pilihan booking tersebut, silakan menghubungi <a href="https://x.com/Deflictive" target="_blank" rel="noopener noreferrer" className="font-bold text-[#3A4F67] hover:text-[#51867E] underline decoration-dotted">@Deflictive</a> untuk informasi dan koordinasi lebih lanjut.
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => onNavigate('/book-now')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3A4F67] hover:bg-[#2C3744] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer group/btn"
              >
                <span>Go to Booking Form</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 03 — OTHER FACILITIES */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#51867E]/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
            03
          </div>

          <div className="space-y-3.5 flex-grow">
            <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
              <Building2 className="w-4 h-4" />
              <span>FREE FACILITY USAGE</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
              OTHER FACILITIES
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ingin menggunakan fasilitas lain yang tersedia di lokasi Hanford H&R untuk kebutuhan IC atau plot?
            </p>

            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Tidak perlu melakukan booking atau meminta izin terlebih dahulu.</strong></span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Kalian dapat menggunakan fasilitas yang tersedia sesuai dengan informasi pada masing-masing lokasi, seperti:
            </p>

            {/* Facility Pills */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5 pt-1">
              {[
                { name: 'Golf Course', icon: Flag },
                { name: 'Spa', icon: Sparkles },
                { name: 'Swimming Pool', icon: Waves },
                { name: 'Restaurant', icon: Utensils },
                { name: 'Beach Club', icon: Sun },
                { name: 'Fitness Class', icon: Dumbbell },
                { name: 'Pilates Class', icon: Activity },
                { name: 'Water Sport', icon: Anchor },
                { name: 'dan fasilitas lainnya', icon: MoreHorizontal }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="px-3.5 py-1.5 bg-[#F0F4F8] border border-slate-200/90 rounded-full flex items-center gap-2 text-xs sm:text-sm shadow-2xs hover:bg-slate-200/60 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[#51867E] shrink-0" />
                    <span className="font-semibold text-[#1E293B]">{item.name}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-[#3A4F67]">
                <Tag className="w-4 h-4 text-[#51867E]" />
                <span>Ketentuan Tag & Mention</span>
              </div>
              <p className="leading-relaxed">
                Untuk menggunakannya dalam IC/plot, cukup follow dan tag akun Hanford H&R (<a href="https://x.com/Hanford_HnR" target="_blank" rel="noopener noreferrer" className="font-bold text-[#51867E] hover:underline">@Hanford_HnR</a>) pada post atau plot kalian.
              </p>
              <p className="text-[11px] text-slate-500 italic">
                Pastikan penggunaan fasilitas tetap sesuai dengan konteks dan informasi yang tersedia pada lokasi terkait.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 04 — CONTENT & DOCUMENTATION */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3A4F67]/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
            04
          </div>

          <div className="space-y-3.5 flex-grow">
            <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
              <Share2 className="w-4 h-4" />
              <span>MEDIA & REPOST</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
              CONTENT & DOCUMENTATION
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dengan menggunakan lokasi dan fasilitas Hanford H&R dalam IC/plot, kalian memberikan kesempatan kepada Hanford H&R untuk mendokumentasikan dan menggunakan update atau post tersebut sebagai bagian dari dokumentasi dan konten akun Hanford H&R.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs text-slate-600">
              <p className="leading-relaxed">
                Hanford H&R dapat melakukan <strong className="text-[#3A4F67]">repost, quote post, atau membagikan kembali</strong> konten yang menampilkan aktivitas IC/plot di properti Hanford H&R.
              </p>
              <div className="flex items-center gap-2 pt-1 font-semibold text-[#51867E] text-xs">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                <span>Kami akan tetap menghargai konteks dan cerita yang dibuat oleh masing-masing roleplayer.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 05 — HAVE FUN & CREATE YOUR STORY */}
      <div className="bg-gradient-to-br from-[#3A4F67] to-[#2C3744] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#51867E]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#51867E] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-md">
            05
          </div>

          <div className="space-y-4 flex-grow">
            <div className="flex items-center gap-2 text-[#88B2AB] text-xs font-bold uppercase tracking-widest font-mono">
              <Sparkles className="w-4 h-4" />
              <span>WELCOME TO HANFORD Hotels & Resorts</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-white font-light tracking-wide">
              HAVE FUN & CREATE YOUR STORY
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
              Gunakan Hanford H&R untuk mengembangkan cerita, membangun karakter, dan menciptakan pengalaman kalian sendiri.
            </p>

            <div className="py-1">
              <div className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm text-center">
                <span className="font-serif text-xs sm:text-sm text-[#88B2AB] tracking-[0.2em] font-light uppercase">
                  Stay. Dine. Gather. Explore.
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 italic font-serif pt-1 leading-snug">
              See you around,<br />
              <strong className="font-medium text-slate-100">Hanford Hotels & Resorts</strong>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
