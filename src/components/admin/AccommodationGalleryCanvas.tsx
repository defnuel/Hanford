import React from 'react';
import { Building, Calendar, User, Sparkles, CheckCircle2, ShieldCheck, MapPin, Layers } from 'lucide-react';

export interface GalleryPhotoItem {
  id: string;
  url: string;
  title: string;
}

interface AccommodationGalleryCanvasProps {
  guestName: string;
  xUsername?: string;
  propertyName: string;
  roomType: string;
  stayDates: string;
  bookingRef?: string;
  photos: GalleryPhotoItem[];
  brandLogoUrl?: string;
  canvasRef?: React.Ref<HTMLDivElement>;
  id?: string;
  fixedWidth?: boolean;
}

export const AccommodationGalleryCanvas: React.FC<AccommodationGalleryCanvasProps> = ({
  guestName,
  xUsername = '@pendxnts',
  propertyName,
  roomType,
  stayDates,
  bookingRef = 'REF: HNF-ACCOM-2026',
  photos = [],
  brandLogoUrl = 'https://lh3.googleusercontent.com/d/1F-m9SWOLAD63pO-tzJIzOCUSv4heXHLk',
  canvasRef,
  id = 'hanford-gallery-card-canvas',
  fixedWidth = false,
}) => {
  const displayGuestName = guestName.trim() || 'Agatha Madeleine';
  const displayXUser = xUsername.trim()
    ? xUsername.startsWith('@')
      ? xUsername
      : `@${xUsername}`
    : '@pendxnts';
  const displayProperty = propertyName.trim() || 'Hanford Hotel & Resort Uluwatu, Bali';
  const displayRoomType = roomType.trim() || 'Private Pool Villa • 3 Bedroom Ocean Suite';
  const displayStayDates = stayDates.trim() || '2026-09-01 to 2026-09-02 (1 night)';
  const displayRef = bookingRef.trim() || 'REF: HNF-ACCOM-2026';

  // Ensure we have up to 15 photos, with elegant fallback if empty
  const displayPhotos = photos.length > 0 ? photos.slice(0, 15) : [
    { id: '1', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', title: 'Main Villa Exterior & Infinity Pool' },
    { id: '2', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', title: 'Master Bedroom & Ocean View' },
    { id: '3', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', title: 'Living Pavilion & Sunken Lounge' },
    { id: '4', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', title: 'Open-Air Marble En-Suite Bathroom' },
    { id: '5', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', title: 'Private Sun Deck & Daybeds' },
    { id: '6', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', title: 'Sunset Clifftop Terrace' },
    { id: '7', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', title: 'Private Dining Gazebo' },
    { id: '8', url: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80', title: 'Tropical Garden Sanctuary' },
    { id: '9', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', title: 'In-Villa Spa & Soaking Tub' },
    { id: '10', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', title: 'Private Lagoon & Beach Access' },
    { id: '11', url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80', title: 'Japanese Tea & Relaxation Deck' },
    { id: '12', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', title: 'Private Courtyard & Water Feature' },
    { id: '13', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80', title: 'Sunrise Meditation Pavilion' },
    { id: '14', url: 'https://images.unsplash.com/photo-1528164344705-475426879e0d?auto=format&fit=crop&w=1200&q=80', title: 'Ocean Cliff Observation Point' },
    { id: '15', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', title: 'Grand Entry & Private Foyer' },
  ];

  const totalCount = displayPhotos.length;

  return (
    <div
      id={id}
      ref={canvasRef as any}
      className={`relative mx-auto select-none overflow-hidden rounded-2xl text-[#1E293B] font-sans bg-white flex flex-col justify-between ${
        fixedWidth
          ? 'w-[960px] min-w-[960px] max-w-[960px] min-h-[1358px] p-8'
          : 'w-full max-w-[960px] min-h-[1358px] p-6 sm:p-8'
      }`}
      style={{
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05)',
        aspectRatio: '1 / 1.4142', // Standard ISO A4 Ratio (210 x 297 mm)
        ...(fixedWidth ? { width: '960px', minWidth: '960px', maxWidth: '960px' } : {}),
      }}
    >
      {/* Luxury Inner Border Outline */}
      <div className="absolute inset-3.5 border border-[#E2E8F0] pointer-events-none rounded-xl" />

      {/* Top Header Section */}
      <div className="relative z-10">
        
        {/* Header: Brand Identity & Reserved Accommodation Title */}
        <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-3.5 gap-4">
          
          {/* Logo & Main Title in English */}
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 p-1.5 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
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
              
              {/* JUDUL: RESERVED ACCOMMODATION */}
              <div className="mt-0.5">
                <h1 className="text-2xl sm:text-[25px] text-[#1E293B] font-bold tracking-tight uppercase leading-snug">
                  RESERVED ACCOMMODATION
                </h1>
                
                {/* BAWAHNYA: ROOM TYPE */}
                <div className="text-sm sm:text-[14px] font-semibold text-[#51867E] tracking-normal mt-1 flex items-center gap-2">
                  <span className="inline-block px-2.5 py-0.5 bg-[#EBF3F1] border border-[#CDE1DC] rounded-md font-bold uppercase text-[11px] text-[#2D5A53]">
                    ROOM TYPE
                  </span>
                  <span className="text-[#1E293B] font-bold uppercase tracking-tight truncate max-w-[500px]">
                    {displayRoomType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Stamp */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[#3A4F67] font-mono text-xs font-bold uppercase tracking-wider">
              {displayRef}
            </div>
            <div className="text-[10.5px] text-slate-500 font-medium tracking-wide">
              Accommodation Gallery
            </div>
          </div>
        </div>

        {/* Guest & Reservation Quick Summary Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-row items-center justify-between gap-3 text-xs mt-3">
          <div className="flex items-center gap-2.5">
            <User className="w-4.5 h-4.5 text-[#51867E] shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider leading-none">Guest Name</span>
              <span className="font-bold text-[#1E293B] text-[14px]">{displayGuestName}</span>
              <span className="text-xs font-mono text-[#51867E] ml-1.5 font-semibold">({displayXUser})</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Building className="w-4.5 h-4.5 text-[#51867E] shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider leading-none">Property Destination</span>
              <span className="font-bold text-[#1E293B] text-[13px] uppercase">{displayProperty}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-right">
            <Calendar className="w-4.5 h-4.5 text-[#51867E] shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider leading-none">Stay Period</span>
              <span className="font-bold text-[#3A4F67] text-[13px]">{displayStayDates}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Accommodation Visual Photo Gallery - Optimized Landscape Aspect Ratio & Whitespace Filling */}
      <div className="relative z-10 flex-1 flex flex-col justify-center my-2.5">
        {totalCount >= 13 ? (
          /* 13 to 15 Photos: 3 Columns Grid (5 Rows x 3 = 15 Photos), Large Landscape Ratio (16:10) */
          <div className="grid grid-cols-3 gap-2.5">
            {displayPhotos.map((photo, idx) => (
              <div
                key={photo.id || `grid-${idx}`}
                className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-xs"
              >
                <div className="aspect-[16/10.2] w-full relative overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title || `Photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  
                  {/* Photo Index Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/65 backdrop-blur-md rounded text-[9.5px] font-mono text-white font-bold tracking-wider border border-white/20">
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  {/* Photo Title Caption */}
                  <div className="absolute bottom-2 left-2.5 right-2.5">
                    <p className="text-white text-xs font-bold tracking-wide drop-shadow-sm truncate">
                      {photo.title || `Suite Area ${idx + 1}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : totalCount === 10 ? (
          /* 10 Photos: 2 Large Hero Photos on Top + 8 Photos in 2 Rows of 4 below */
          <div className="space-y-3">
            {/* Top Row: 2 Hero Photos */}
            <div className="grid grid-cols-2 gap-3">
              {displayPhotos.slice(0, 2).map((photo, idx) => (
                <div
                  key={photo.id || `hero-${idx}`}
                  className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-sm"
                >
                  <div className="aspect-[16/9.5] w-full relative overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title || `Hero Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-black/65 backdrop-blur-md rounded text-[10.5px] font-mono text-white font-bold tracking-wider border border-white/20">
                      {String(idx + 1).padStart(2, '0')}
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3">
                      <p className="text-white text-sm font-bold tracking-wide drop-shadow-sm truncate">
                        {photo.title || `Main Suite View ${idx + 1}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Rows: 8 Photos in 4 Columns x 2 Rows */}
            <div className="grid grid-cols-4 gap-2.5">
              {displayPhotos.slice(2, 10).map((photo, idx) => {
                const photoNumber = idx + 3;
                return (
                  <div
                    key={photo.id || `grid-${idx}`}
                    className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-xs"
                  >
                    <div className="aspect-[16/10.5] w-full relative overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.title || `Photo ${photoNumber}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                      
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/65 backdrop-blur-md rounded text-[8.5px] font-mono text-white font-bold border border-white/20">
                        {String(photoNumber).padStart(2, '0')}
                      </div>

                      <div className="absolute bottom-1.5 left-2 right-2">
                        <p className="text-white text-[10px] font-semibold leading-tight drop-shadow-xs truncate">
                          {photo.title || `Suite Area ${photoNumber}`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Dynamic 3 Columns for 6, 9, 12 Photos or other counts */
          <div className="grid grid-cols-3 gap-3">
            {displayPhotos.map((photo, idx) => (
              <div
                key={photo.id || `grid-${idx}`}
                className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-xs"
              >
                <div className="aspect-[16/10.2] w-full relative overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title || `Photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/65 backdrop-blur-md rounded text-[9.5px] font-mono text-white font-bold tracking-wider border border-white/20">
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  <div className="absolute bottom-2 left-2.5 right-2.5">
                    <p className="text-white text-xs font-bold tracking-wide drop-shadow-sm truncate">
                      {photo.title || `Suite Area ${idx + 1}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Left-aligned Issuer info & Verification (Clean A4 layout) */}
      <div className="relative z-10 flex flex-row items-center justify-between border-t border-slate-200 pt-3.5 mt-2 shrink-0">
        <div className="text-left space-y-0.5">
          <div className="text-[11px] tracking-[0.2em] text-[#51867E] uppercase font-bold">
            ISSUED BY HANFORD HNR CONCIERGE
          </div>
          <div className="text-xs text-slate-600 font-medium">
            Central Reservations • Hanford Hotels &amp; Resorts
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#51867E] bg-[#EBF3F1] border border-[#CDE1DC] px-3.5 py-1.5 rounded-lg">
          <ShieldCheck className="w-4.5 h-4.5 text-[#51867E]" />
          <span className="uppercase tracking-wider text-[11px]">Official Reserved Suite</span>
        </div>
      </div>
    </div>
  );
};
