import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Property } from '../types';
import { fetchPropertyBySlug } from '../services/dataService';
import { MapPin, Calendar, ArrowLeft, Star, ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from 'lucide-react';
import { CleanPropertyDetails } from '../components/CleanPropertyDetails';

interface PropertyDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ slug, onNavigate }) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetchPropertyBySlug(slug).then((res) => {
      setProperty(res.data);
      setLoading(false);
      setActiveImageIndex(0);
    });
  }, [slug]);

  // Unique gallery images array removing any duplicates
  const allGalleryImages = useMemo(() => {
    if (!property) return [];
    const combined = [property.heroImage, ...(property.galleryImages || [])].filter(Boolean);
    return Array.from(new Set(combined));
  }, [property]);

  const cityLabel = useMemo(() => {
    if (!property) return '';
    const cleaned = property.name
      .replace(
        /^hanford\s+(?:grand\s+hotel\s*&\s*resorts?|hotel\s*&\s*resorts?|eco\s+resorts?|grand\s+hotel|hotel|resorts?|sanctuary|residences)\s+/i,
        ''
      )
      .trim();
    const primaryCity = cleaned.split(',')[0].trim();
    return (primaryCity || property.country || property.name).toUpperCase();
  }, [property]);

  // Handle keyboard navigation for gallery & lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
      if (isLightboxOpen && allGalleryImages.length > 1) {
        if (e.key === 'ArrowLeft') {
          setActiveImageIndex((prev) => (prev === 0 ? allGalleryImages.length - 1 : prev - 1));
        } else if (e.key === 'ArrowRight') {
          setActiveImageIndex((prev) => (prev === allGalleryImages.length - 1 ? 0 : prev + 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allGalleryImages.length]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailContainerRef.current && allGalleryImages.length > 0) {
      const activeThumb = thumbnailContainerRef.current.children[activeImageIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeImageIndex, allGalleryImages.length]);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      thumbnailContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#3A4F67] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-serif italic tracking-widest text-[#3A4F67] uppercase">
            Loading Sanctuary Details...
          </p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-[#FFFFFF] pt-32 pb-24 min-h-screen text-[#2C3744]">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <MapPin className="w-12 h-12 text-[#3A4F67] mx-auto" />
          <h1 className="font-serif italic text-3xl text-[#3A4F67]">Sanctuary Not Found</h1>
          <p className="text-xs text-[#2C3744] font-light">
            We could not locate the requested Hanford property details.
          </p>
          <button
            onClick={() => onNavigate('/locations')}
            className="cta-button px-6 py-3 bg-[#51867E] text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#3f6d66] transition-colors border border-[#88B2AB]/30 cursor-pointer"
          >
            RETURN TO ALL LOCATIONS
          </button>
        </div>
      </div>
    );
  }

  const formatStatus = (statusStr: string) => {
    const s = (statusStr || '').trim().toLowerCase();
    if (s === 'live' || s === 'active' || s === 'available') return 'Available';
    if (s === 'coming soon' || s === 'coming-soon' || s === 'fully booked' || s === 'draft') return 'Fully Booked';
    return statusStr;
  };

  const displayStatus = formatStatus(property.status);

  return (
    <div className="bg-[#FFFFFF] pt-20 sm:pt-24 pb-16 sm:pb-24 text-[#2C3744]">
      {/* Breadcrumb Navigation Bar */}
      <div className="bg-[#FFFFFF] border-b border-[#88B2AB]/30 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between text-xs gap-2">
          <button
            onClick={() => onNavigate('/locations')}
            className="inline-flex items-center gap-1.5 text-[#3A4F67] hover:text-[#51867E] font-bold tracking-wider transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#3A4F67]" />
            <span className="text-[10px] sm:text-xs">BACK</span>
          </button>
        </div>
      </div>

      {/* Main Hero Header */}
      <section className="relative bg-gradient-to-br from-[#1E293B] via-[#24354A] to-[#1E293B] text-[#EAF2F1] py-8 sm:py-12 lg:py-14 overflow-hidden border-b border-[#88B2AB]/30 shadow-sm">
        {/* Ambient Glow Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#51867E]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#3A4F67]/30 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="space-y-3 sm:space-y-4 max-w-4xl">
            {/* Badges Bar (Matches Card Badges Aesthetic) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border shadow-xs backdrop-blur-md ${
                  displayStatus === 'Available'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400/30'
                    : 'bg-[#1E293B]/80 text-[#88B2AB] border-white/20'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${displayStatus === 'Available' ? 'bg-emerald-400 animate-pulse' : 'bg-[#88B2AB]'}`} />
                {displayStatus}
              </span>

              <span className="bg-[#1E293B]/70 backdrop-blur-md text-[#EAF2F1] px-3 sm:px-3.5 py-1 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border border-white/15 shadow-xs">
                {property.continent} • {property.country}
              </span>
            </div>

            {/* Property Title */}
            <h1 className="font-serif italic text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.15]">
              {property.name}
            </h1>

            {/* Tagline */}
            <p className="text-sm sm:text-base lg:text-lg font-serif italic text-[#EAF2F1]/90 leading-relaxed border-l-2 border-[#88B2AB]/50 pl-3.5 py-0.5">
              "{property.tagline}"
            </p>

            {/* Address Badge */}
            <div className="pt-1">
              <span className="inline-flex items-center gap-2 bg-[#1E293B]/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#88B2AB]/30 text-xs text-[#EAF2F1] shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-[#88B2AB] shrink-0" />
                <span className="font-medium">{property.address}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Left 2 Columns: Gallery & HTML Details Content */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-12">
            {/* Gallery Viewer */}
            <div className="space-y-3.5 sm:space-y-4">
              {/* Main Architectural Stage */}
              <div className="relative w-full aspect-[16/10] sm:aspect-video sm:h-[480px] bg-[#1E293B] border border-[#88B2AB]/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_16px_36px_rgba(58,79,103,0.12)] group hover:border-[#51867E] transition-all">
                <img
                  src={allGalleryImages[activeImageIndex] || property.heroImage}
                  alt={`${property.name} photograph ${activeImageIndex + 1}`}
                  onClick={() => setIsLightboxOpen(true)}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out cursor-pointer group-hover:scale-[1.02] select-none"
                  referrerPolicy="no-referrer"
                />

                {/* Top Floating Badges */}
                <div className="absolute top-3.5 sm:top-5 left-3.5 sm:left-5 right-3.5 sm:right-5 flex items-center justify-between gap-2 z-20 pointer-events-none">
                  <span className="bg-[#1E293B]/80 backdrop-blur-md text-[#EAF2F1] px-3 sm:px-3.5 py-1 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border border-white/20 shadow-md whitespace-nowrap">
                    {cityLabel}
                  </span>

                  {allGalleryImages.length > 0 && (
                    <span className="bg-[#1E293B]/80 backdrop-blur-md text-[#88B2AB] px-3 sm:px-3.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase border border-white/20 shadow-md whitespace-nowrap shrink-0">
                      {activeImageIndex + 1} / {allGalleryImages.length}
                    </span>
                  )}
                </div>

                {/* Smooth Gradient Vignette at Bottom */}
                <div className="absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-gradient-to-t from-[#1E293B]/85 via-[#1E293B]/25 to-transparent pointer-events-none z-10" />

                {/* Bottom Overlay Pill & Fullscreen Button */}
                <div className="absolute bottom-3.5 sm:bottom-4 left-3.5 sm:left-5 right-3.5 sm:right-5 flex items-center justify-between z-20">
                  <div className="pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 bg-[#3A4F67]/85 backdrop-blur-md px-3 py-1 rounded-full text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#EAF2F1] border border-[#88B2AB]/30 shadow-xs">
                      <ImageIcon className="w-3 h-3 text-[#88B2AB] shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-xs">{property.name}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="p-2 sm:p-2.5 rounded-full bg-[#1E293B]/80 hover:bg-[#51867E] text-white backdrop-blur-md border border-white/20 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="View fullscreen"
                    aria-label="View fullscreen image"
                  >
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#88B2AB] hover:text-white" />
                  </button>
                </div>

                {/* Main image Prev/Next arrows overlay */}
                {allGalleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === 0 ? allGalleryImages.length - 1 : prev - 1));
                      }}
                      className="absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#1E293B]/80 hover:bg-[#51867E] text-[#88B2AB] hover:text-white backdrop-blur-md transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 border border-white/20 shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 z-20"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#88B2AB] hover:text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === allGalleryImages.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-3.5 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#1E293B]/80 hover:bg-[#51867E] text-[#88B2AB] hover:text-white backdrop-blur-md transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 border border-white/20 shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 z-20"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#88B2AB] hover:text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Horizontal Single Row Thumbnail Carousel Dock with Navigation Arrows */}
              <div className="bg-[#F4F8F7] border border-[#88B2AB]/30 rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3 shadow-xs">
                <button
                  type="button"
                  onClick={() => scrollThumbnails('left')}
                  className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-[#51867E] text-[#3A4F67] hover:text-white transition-all border border-[#88B2AB]/30 shrink-0 shadow-xs cursor-pointer active:scale-95 group"
                  aria-label="Scroll thumbnails left"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#51867E] group-hover:text-white" />
                </button>

                <div
                  ref={thumbnailContainerRef}
                  className="flex flex-1 gap-2 sm:gap-2.5 overflow-x-auto scroll-smooth py-0.5 px-0.5 scrollbar-none"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {allGalleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-14 w-20 sm:h-18 sm:w-26 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer group ${
                        activeImageIndex === idx
                          ? 'border-[#51867E] ring-2 ring-[#88B2AB]/60 shadow-md scale-[0.98]'
                          : 'border-slate-200/80 opacity-60 hover:opacity-100 hover:border-[#88B2AB]/50'
                      }`}
                      aria-label={`Select photo ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {activeImageIndex === idx && (
                        <div className="absolute inset-0 bg-[#51867E]/10 pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scrollThumbnails('right')}
                  className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-[#51867E] text-[#3A4F67] hover:text-white transition-all border border-[#88B2AB]/30 shrink-0 shadow-xs cursor-pointer active:scale-95 group"
                  aria-label="Scroll thumbnails right"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#51867E] group-hover:text-white" />
                </button>
              </div>

              {/* Fullscreen Lightbox Modal */}
              {isLightboxOpen && (
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Fullscreen Gallery"
                  className="fixed inset-0 z-50 bg-[#1E293B]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
                  onClick={() => setIsLightboxOpen(false)}
                >
                  {/* Lightbox Top Bar */}
                  <div className="flex items-center justify-between gap-3 text-white pb-4 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-sm sm:text-base font-bold tracking-[0.2em] uppercase text-white">
                      {cityLabel}
                    </h3>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-[#88B2AB] font-bold tracking-widest uppercase whitespace-nowrap">
                        {activeImageIndex + 1} / {allGalleryImages.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLightboxOpen(false)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        aria-label="Close fullscreen gallery"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Lightbox Main Stage */}
                  <div className="relative flex-1 flex items-center justify-center py-4 sm:py-6 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <img
                      src={allGalleryImages[activeImageIndex] || property.heroImage}
                      alt={`${property.name} slide ${activeImageIndex + 1}`}
                      className="max-h-[65vh] sm:max-h-[72vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                      referrerPolicy="no-referrer"
                    />

                    {/* Lightbox Prev/Next buttons */}
                    {allGalleryImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allGalleryImages.length - 1 : prev - 1))}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1E293B]/80 hover:bg-[#51867E] text-white border border-white/20 backdrop-blur-md shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#88B2AB] hover:text-white" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveImageIndex((prev) => (prev === allGalleryImages.length - 1 ? 0 : prev + 1))}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1E293B]/80 hover:bg-[#51867E] text-white border border-white/20 backdrop-blur-md shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#88B2AB] hover:text-white" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Lightbox Bottom Thumbnail Strip */}
                  <div className="pt-3 border-t border-white/10 flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 overflow-x-auto max-w-2xl py-1 px-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                      {allGalleryImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            activeImageIndex === idx
                              ? 'border-[#88B2AB] ring-2 ring-[#51867E] scale-105 opacity-100'
                              : 'border-transparent opacity-50 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clean Editorial Content parsed from Google Sheets text */}
            <CleanPropertyDetails detailsHtml={property.detailsHtml} propertyName={property.name} amenities={property.amenities} />
          </div>

          {/* Right Column: Reservation Card */}
          <div className="space-y-6 sm:space-y-8">
            {/* Direct Reservation Non-Floating Static Card */}
            <div className="bg-[#3A4F67] text-[#EAF2F1] p-5 sm:p-8 border border-[#88B2AB]/30 rounded-2xl shadow-2xl space-y-5 sm:space-y-6">
              <div className="border-b border-[#88B2AB]/30 pb-4 sm:pb-6 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#88B2AB] block">
                    Starting From
                  </span>
                  <span className="font-serif italic text-2xl sm:text-3xl text-white font-semibold">
                    ${(property.priceStandard || property.priceFrom)?.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#EAF2F1]/80 font-normal"> / night</span>
                </div>
                <div className="flex items-center gap-1 text-[#EAF2F1] text-xs">
                  <Star className="w-4 h-4 fill-[#88B2AB] text-[#88B2AB]" />
                  <span className="font-bold">{property.rating}</span>
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-3 text-xs text-[#EAF2F1]/80 font-light">
                <div className="flex justify-between py-1.5 sm:py-2 border-b border-[#88B2AB]/20">
                  <span className="text-[#88B2AB]">Status</span>
                  <span className={displayStatus === 'Available' ? 'text-emerald-300 font-medium' : 'text-amber-300 font-medium'}>
                    {displayStatus}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 border-b border-[#88B2AB]/20">
                  <span className="text-[#88B2AB]">Country</span>
                  <span className="text-white">{property.country}</span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 border-b border-[#88B2AB]/20">
                  <span className="text-[#88B2AB]">Continent</span>
                  <span className="text-white">{property.continent}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate(`/book-now?property=${property.slug}`)}
                className="w-full py-3.5 sm:py-4 bg-[#51867E] text-white hover:bg-[#3f6d66] rounded-full text-xs font-bold tracking-widest uppercase transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>BOOK NOW</span>
              </button>

              <p className="text-[10px] text-white font-medium text-center leading-relaxed">
                Inquiries are transmitted directly to Hanford Central Reservations in real time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
