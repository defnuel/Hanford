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

  const defaultHeroImage =
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85';
  const imageSource = heroImageUrl && heroImageUrl.trim() ? heroImageUrl.trim() : defaultHeroImage;

  const brandLogoUrl = 'https://lh3.googleusercontent.com/d/1F-m9SWOLAD63pO-tzJIzOCUSv4heXHLk';

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
            {/* Logo container matching invoice elegance */}
            <div className="w-16 h-16 p-1.5 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
              <img
                src={brandLogoUrl}
                alt="Hanford Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://lh3.googleusercontent.com/d/1F-m9SWOLAD63pO-tzJIzOCUSv4heXHLk';
                }}
              />
            </div>

            <div>
              <div className="text-xs tracking-[0.22em] font-bold text-[#51867E] uppercase flex items-center gap-1.5 justify-start">
                <span>HANFORD HOTELS & RESORTS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#51867E]" />
              </div>
              
              {/* WELCOME TO: with newline for Location Name */}
              <div className="mt-1">
                <div className="text-[13px] text-[#1E293B] font-bold tracking-[0.18em] uppercase">
                  WELCOME TO :
                </div>
                <h1 className="text-2xl sm:text-[26px] text-[#1E293B] font-bold tracking-tight uppercase leading-snug mt-0.5">
                  {displayProperty}
                </h1>
              </div>

              <div className="text-[11.5px] tracking-[0.12em] text-slate-500 uppercase font-medium mt-1">
                WE HOPE YOU ENJOY YOUR EXCEPTIONAL STAY &amp; LUXURIOUS EXPERIENCE
              </div>
            </div>
          </div>

          {/* Right Reference Stamp (Matching Invoice Style) */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-[#3A4F67] font-mono text-xs font-bold uppercase tracking-wider">
              REF: HNF-WLCM-2026
            </div>
            <div className="text-[11px] text-slate-500 font-medium tracking-wide">
              Exclusive Stay Confirmation
            </div>
          </div>
        </div>

        {/* 1st Picture: Hero Picture of the Location (Proportional A4 Photo Banner) */}
        <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 bg-[#0F172A] group">
          <div className="aspect-[1.55/1] w-full relative overflow-hidden">
            <img
              src={imageSource}
              alt={displayProperty}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = defaultHeroImage;
              }}
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/30 to-transparent" />

            {/* Overlay Details */}
            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
              <div className="text-white space-y-1">
                <div className="text-[10px] font-bold tracking-[0.16em] text-[#51867E] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded uppercase inline-flex items-center gap-1.5 mb-1 shadow-xs">
                  <Building className="w-3.5 h-3.5 text-[#51867E]" />
                  <span>FEATURED PROPERTY LOCATION</span>
                </div>
                <div className="text-2xl sm:text-3xl text-white font-bold tracking-wide drop-shadow-md">
                  {displayProperty}
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 backdrop-blur-md border border-white/30 text-white rounded-lg text-[11px] font-bold tracking-wider uppercase">
                <CheckCircle className="w-4 h-4 text-[#51867E]" />
                <span>VERIFIED DESTINATION</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Guest Info & Stay Details - ALWAYS 2 COLUMNS */}
        <div className="grid grid-cols-2 gap-6">
          {/* Box 1: Guest Information (Invoice Style) */}
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#51867E] font-bold text-[11px] tracking-[0.2em] uppercase border-b border-slate-200 pb-2.5">
              <User className="w-3.5 h-3.5" />
              <span>GUEST INFORMATION</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold">
                  GUEST FULL NAME
                </div>
                <div className="text-xl sm:text-2xl text-[#1E293B] font-bold tracking-tight mt-0.5">
                  {displayGuestName}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold">
                    X USERNAME
                  </div>
                  <div className="font-mono text-base text-[#51867E] font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="w-4 h-4 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-[9px] font-bold">
                      𝕏
                    </span>
                    <span>{displayXUser}</span>
                  </div>
                </div>

                {roomDetails && (
                  <div className="text-right">
                    <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold">
                      ALLOCATED ROOM
                    </div>
                    <div className="text-base text-[#1E293B] font-bold mt-0.5">
                      {roomDetails}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Box 2: Reservation & Stay Details (Invoice Style) */}
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#51867E] font-bold text-[11px] tracking-[0.2em] uppercase border-b border-slate-200 pb-2.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>RESERVATION DETAILS</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold">
                  BOOKING TYPE
                </div>
                <div className="font-semibold text-[#1E293B] text-sm sm:text-base mt-0.5">
                  {displayBookingType}
                </div>
              </div>

              <div>
                <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold">
                  EVENT DATE
                </div>
                <div className="font-semibold text-[#1E293B] text-sm sm:text-base mt-0.5">
                  {displayEventDate}
                </div>
              </div>

              <div className="col-span-2 pt-3 border-t border-slate-200">
                <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold">
                  STAY DATES
                </div>
                <div className="font-bold text-[#3A4F67] text-sm sm:text-base mt-0.5">
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
        <div className="text-left space-y-0.5">
          <div className="text-xs tracking-[0.18em] text-[#51867E] uppercase font-bold">
            ISSUED BY HANFORD HNR CONCIERGE
          </div>
          <div className="text-[13px] text-slate-600 font-medium">
            Central Reservations • Hanford Hotels &amp; Resorts
          </div>
        </div>
      </div>
    </div>
  );
};

