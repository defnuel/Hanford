import React from 'react';
import { Calendar, User, Building, CheckCircle } from 'lucide-react';

interface WelcomingCardCanvasProps {
  guestName: string;
  xUsername?: string;
  propertyName: string;
  bookingType: string;
  stayDates: string; // e.g. "2026-09-01 to 2026-09-02 (1 night)"
  eventDate?: string; // e.g. "N/A" or "2026-08-15"
  heroImageUrl?: string;
  roomDetails?: string;
  customWelcomeNote?: string;
  bookingRef?: string;
  id?: string;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  fixedWidth?: boolean;
}

export const WelcomingCardCanvas: React.FC<WelcomingCardCanvasProps> = ({
  guestName,
  xUsername,
  propertyName,
  bookingType,
  stayDates,
  eventDate = 'N/A',
  heroImageUrl,
  roomDetails,
  customWelcomeNote,
  bookingRef,
  id = 'hanford-welcome-card-canvas',
  canvasRef,
  fixedWidth = false,
}) => {
  const displayGuestName = guestName.trim() || 'Agatha Madeleine';
  const displayXUser = xUsername?.trim()
    ? xUsername.startsWith('@')
      ? xUsername
      : `@${xUsername}`
    : '@pendxnts';
  const displayProperty = propertyName.trim() || 'Hanford Hotel & Resort Uluwatu, Bali';
  const displayBookingType = bookingType.trim() || 'Room Reservation';
  const displayStayDates = stayDates.trim() || '2026-09-01 to 2026-09-02 (1 night)';
  const displayEventDate = eventDate.trim() || 'N/A';
  const displayRef = bookingRef && bookingRef.trim()
    ? bookingRef.trim()
    : 'Ref No: HNF-2026-INV';

  const defaultHeroImage =
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?fm=jpg&fit=crop&w=1200&q=85';
  const imageSource = heroImageUrl && heroImageUrl.trim() ? heroImageUrl.trim() : defaultHeroImage;

  return (
    <div
      id={id}
      ref={canvasRef as any}
      className={`relative mx-auto select-none overflow-hidden rounded-2xl text-[#1E293B] font-sans bg-white flex flex-col justify-between ${
        fixedWidth
          ? 'w-[960px] min-w-[960px] max-w-[960px] min-h-[1358px] p-10'
          : 'w-full max-w-[960px] min-h-[1358px] p-6 sm:p-10'
      }`}
      style={{
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05)',
        border: '1px solid #E2E8F0',
        aspectRatio: '1 / 1.4142',
        ...(fixedWidth ? { width: '960px', minWidth: '960px', maxWidth: '960px' } : {}),
      }}
    >
      {/* Decorative Outer Border (Invoice Style) */}
      <div className="absolute inset-4 border border-[#E2E8F0] pointer-events-none rounded-xl" />

      {/* Top Container */}
      <div className="relative z-10 space-y-7">
        {/* Card Header & Brand Identity - ALWAYS Horizontal Row */}
        <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-5 gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-4 text-left">
            {/* Logo container matching invoice elegance with robust inline SVG */}
            <div className="w-16 h-16 p-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain">
                <defs>
                  <linearGradient id="welcomingGoldLinear" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F9E2A8" />
                    <stop offset="35%" stopColor="#D4AF37" />
                    <stop offset="70%" stopColor="#ECC876" />
                    <stop offset="100%" stopColor="#B38A28" />
                  </linearGradient>
                </defs>
                <rect x="12" y="12" width="176" height="276" rx="88" ry="88" stroke="url(#welcomingGoldLinear)" strokeWidth="3.2" fill="none"/>
                <rect x="20" y="20" width="160" height="260" rx="80" ry="80" stroke="url(#welcomingGoldLinear)" strokeWidth="1.8" strokeOpacity="0.85" fill="none"/>
                <g id="HR-monogram">
                  <path d="M 52 110 L 74 110 L 74 114 L 66 114 L 66 186 L 74 186 L 74 190 L 52 190 L 52 186 L 60 186 L 60 114 L 52 114 Z" fill="url(#welcomingGoldLinear)" />
                  <path d="M 82 110 L 104 110 L 104 114 L 96 114 L 96 186 L 104 186 L 104 190 L 82 190 L 82 186 L 90 186 L 90 114 L 82 114 Z" fill="url(#welcomingGoldLinear)" />
                  <rect x="60" y="147" width="55" height="6" fill="url(#welcomingGoldLinear)" />
                  <path d="M 96 110 L 126 110 C 142 110 148 119 148 131 C 148 143 140 152 125 152 L 96 152 L 96 146 L 124 146 C 135 146 141 140 141 131 C 141 122 135 116 124 116 L 96 116 Z" fill="url(#welcomingGoldLinear)" />
                  <path d="M 116 150 C 122 150 128 155 132 163 L 144 186 C 146 189 149 190 153 190 L 158 190 L 158 186 C 154 186 150 183 147 178 L 136 157 C 132 150 125 147 116 147 Z" fill="url(#welcomingGoldLinear)" />
                </g>
              </svg>
            </div>

            <div className="space-y-1">
              <div className="text-xs tracking-[0.18em] font-bold text-[#51867E] uppercase flex items-center gap-1.5 whitespace-nowrap leading-none">
                <span className="whitespace-nowrap">HANFORD HOTELS &amp; RESORTS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#51867E] shrink-0 inline-block" />
              </div>
              
              {/* WELCOME TO: with newline for Location Name */}
              <div className="pt-1">
                <div className="text-[13px] text-[#1E293B] font-bold tracking-[0.14em] uppercase whitespace-nowrap leading-none">
                  WELCOME TO :
                </div>
                <h1 className="text-[25px] text-[#1E293B] font-bold tracking-tight uppercase leading-snug mt-1.5">
                  {displayProperty}
                </h1>
              </div>

              <div className="text-[11.5px] tracking-[0.08em] text-slate-500 uppercase font-medium whitespace-nowrap leading-normal pt-0.5">
                WE HOPE YOU ENJOY YOUR EXCEPTIONAL STAY &amp; LUXURIOUS EXPERIENCE
              </div>
            </div>
          </div>

          {/* Right Reference Stamp (Matching Invoice Style) */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-[#3A4F67] font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              {displayRef}
            </div>
            <div className="text-[11px] text-slate-500 font-medium tracking-wide whitespace-nowrap">
              Exclusive Stay Confirmation
            </div>
          </div>
        </div>

        {/* 1st Picture: Hero Picture of the Location (Proportional A4 Photo Banner with explicit height for mobile canvas export) */}
        <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 bg-[#0F172A] relative">
          <div className="w-full h-[568px] min-h-[568px] max-h-[568px] relative overflow-hidden">
            <img
              src={imageSource}
              alt={displayProperty}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = defaultHeroImage;
              }}
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/30 to-transparent pointer-events-none" />

            {/* Overlay Details */}
            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between pointer-events-none">
              <div className="text-white space-y-1.5">
                <div className="text-[10px] font-bold tracking-[0.14em] text-[#51867E] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded uppercase inline-flex items-center gap-1.5 mb-1 shadow-xs whitespace-nowrap shrink-0 leading-none">
                  <Building className="w-3.5 h-3.5 text-[#51867E] shrink-0" />
                  <span className="whitespace-nowrap leading-none">FEATURED PROPERTY LOCATION</span>
                </div>
                <div className="text-2xl text-white font-bold tracking-wide drop-shadow-md leading-snug">
                  {displayProperty}
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 backdrop-blur-md border border-white/30 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase whitespace-nowrap shrink-0 leading-none">
                <CheckCircle className="w-4 h-4 text-[#51867E] shrink-0" />
                <span className="whitespace-nowrap leading-none">VERIFIED DESTINATION</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Guest Info & Stay Details - ALWAYS 2 COLUMNS */}
        <div className="grid grid-cols-2 gap-6">
          {/* Box 1: Guest Information (Invoice Style) */}
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#51867E] font-bold text-[11px] tracking-[0.18em] uppercase border-b border-slate-200 pb-2.5 whitespace-nowrap">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">GUEST INFORMATION</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold whitespace-nowrap">
                  GUEST FULL NAME
                </div>
                <div className="text-xl text-[#1E293B] font-bold tracking-tight mt-0.5 leading-snug">
                  {displayGuestName}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 gap-4">
                <div className="shrink-0">
                  <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold whitespace-nowrap">
                    X USERNAME
                  </div>
                  <div className="font-mono text-base text-[#51867E] font-bold flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                    <span className="w-4 h-4 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                      𝕏
                    </span>
                    <span className="whitespace-nowrap">{displayXUser}</span>
                  </div>
                </div>

                {roomDetails && (
                  <div className="text-right shrink-0">
                    <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold whitespace-nowrap">
                      ALLOCATED ROOM
                    </div>
                    <div className="text-base text-[#1E293B] font-bold mt-0.5 whitespace-nowrap">
                      {roomDetails}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Box 2: Reservation & Stay Details (Invoice Style) */}
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#51867E] font-bold text-[11px] tracking-[0.18em] uppercase border-b border-slate-200 pb-2.5 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">RESERVATION DETAILS</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold whitespace-nowrap">
                  BOOKING TYPE
                </div>
                <div className="font-semibold text-[#1E293B] text-sm mt-0.5 whitespace-nowrap">
                  {displayBookingType}
                </div>
              </div>

              <div>
                <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold whitespace-nowrap">
                  EVENT DATE
                </div>
                <div className="font-semibold text-[#1E293B] text-sm mt-0.5 whitespace-nowrap">
                  {displayEventDate}
                </div>
              </div>

              <div className="col-span-2 pt-3 border-t border-slate-200">
                <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold whitespace-nowrap">
                  STAY DATES
                </div>
                <div className="font-bold text-[#3A4F67] text-sm mt-0.5 whitespace-nowrap">
                  {displayStayDates}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Butler / Concierge Welcome Greeting Message */}
        <div className="p-7 bg-[#EBF3F1]/80 rounded-xl border border-[#CDE1DC] text-base leading-relaxed text-[#2C3744] italic relative">
          <span className="text-3xl text-[#51867E] font-serif leading-none mr-2">&ldquo;</span>
          {customWelcomeNote || `Dear ${displayGuestName}, on behalf of the management and our hospitality team at ${displayProperty}, we warmly welcome you to your retreat. Every arrangement has been made to ensure your stay is seamless, relaxing, and unforgettable. Our dedicated concierge and butler service remain at your complete disposal.`}
          <span className="text-3xl text-[#51867E] font-serif leading-none ml-2">&rdquo;</span>
        </div>
      </div>

      {/* Card Footer: Left-aligned Issuer info (Clean A4 layout without redundant right signature) */}
      <div className="relative z-10 flex flex-row items-center justify-between border-t border-slate-200 pt-5 mt-5">
        <div className="text-left space-y-1">
          <div className="text-xs tracking-[0.16em] text-[#51867E] uppercase font-bold whitespace-nowrap leading-none">
            ISSUED BY HANFORD HNR CONCIERGE
          </div>
          <div className="text-[13px] text-slate-600 font-medium whitespace-nowrap leading-normal pt-0.5">
            Central Reservations &bull; Hanford Hotels &amp; Resorts
          </div>
        </div>
      </div>
    </div>
  );
};

