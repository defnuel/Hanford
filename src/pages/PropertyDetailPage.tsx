import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Property } from '../types';
import { fetchPropertyBySlug } from '../services/dataService';
import { MapPin, Calendar, ArrowLeft, Star, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { CleanPropertyDetails } from '../components/CleanPropertyDetails';
import { AmenityBadge } from '../components/AmenityBadge';

interface PropertyDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ slug, onNavigate }) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
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
            <span className="text-[10px] sm:text-xs">BACK TO ALL LOCATIONS</span>
          </button>

          <span className="text-[#666666] font-light text-[10px] sm:text-xs truncate">
            {property.continent} / {property.country} / <strong className="text-[#3A4F67]">{property.name}</strong>
          </span>
        </div>
      </div>

      {/* Main Hero Header */}
      <section className="relative bg-[#3A4F67] text-[#EAF2F1] py-10 sm:py-16 overflow-hidden border-b border-[#88B2AB]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="px-3 py-0.5 sm:py-1 bg-[#51867E] text-white text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase rounded-full">
                {displayStatus}
              </span>
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.25em] text-[#88B2AB] uppercase">
                {property.continent} • {property.country}
              </span>
            </div>

            <h1 className="font-serif italic text-3xl sm:text-6xl font-light text-white leading-tight">
              {property.name}
            </h1>

            <p className="text-sm sm:text-lg font-normal text-[#EAF2F1] italic">
              "{property.tagline}"
            </p>

            <div className="flex items-center gap-2 text-xs text-[#EAF2F1] pt-1 sm:pt-2 font-medium">
              <MapPin className="w-4 h-4 text-[#88B2AB] shrink-0" />
              <span>{property.address}</span>
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
            <div className="space-y-4">
              <div className="relative w-full aspect-[16/10] sm:aspect-video sm:h-[480px] bg-[#3A4F67] border border-[#88B2AB]/30 rounded-t-[32px] sm:rounded-t-[100px] overflow-hidden shadow-xl group">
                <img
                  src={allGalleryImages[activeImageIndex] || property.heroImage}
                  alt={`${property.name} slide ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Counter overlay */}
                {allGalleryImages.length > 0 && (
                  <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 bg-[#3A4F67]/80 backdrop-blur-md text-[#EAF2F1] px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest uppercase border border-[#88B2AB]/30">
                    {activeImageIndex + 1} / {allGalleryImages.length}
                  </div>
                )}

                {/* Main image Prev/Next arrows overlay */}
                {allGalleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allGalleryImages.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-[#3A4F67]/80 text-[#EAF2F1] hover:bg-[#3A4F67] transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 border border-[#88B2AB]/30 shadow-lg cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#88B2AB]" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === allGalleryImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-[#3A4F67]/80 text-[#EAF2F1] hover:bg-[#3A4F67] transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 border border-[#88B2AB]/30 shadow-lg cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#88B2AB]" />
                    </button>
                  </>
                )}
              </div>

              {/* Horizontal Single Row Thumbnail Carousel with Navigation Arrows */}
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => scrollThumbnails('left')}
                  className="p-2 sm:p-2.5 rounded-full bg-[#3A4F67] text-[#EAF2F1] hover:bg-[#2C3744] transition-all border border-[#88B2AB]/30 shrink-0 shadow-sm cursor-pointer"
                  aria-label="Scroll thumbnails left"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#88B2AB]" />
                </button>

                <div
                  ref={thumbnailContainerRef}
                  className="flex flex-1 gap-2 sm:gap-3 overflow-x-auto scroll-smooth py-1 px-1 scrollbar-none"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {allGalleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-16 w-22 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#3A4F67] scale-95 shadow-md ring-2 ring-[#88B2AB]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => scrollThumbnails('right')}
                  className="p-2 sm:p-2.5 rounded-full bg-[#3A4F67] text-[#EAF2F1] hover:bg-[#2C3744] transition-all border border-[#88B2AB]/30 shrink-0 shadow-sm cursor-pointer"
                  aria-label="Scroll thumbnails right"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#88B2AB]" />
                </button>
              </div>
            </div>

            {/* Clean Editorial Content parsed from Google Sheets text */}
            <CleanPropertyDetails detailsHtml={property.detailsHtml} propertyName={property.name} />
          </div>

          {/* Right Column: Reservation Card & Amenities Grid */}
          <div className="space-y-6 sm:space-y-8">
            {/* Direct Reservation Non-Floating Static Card */}
            <div className="bg-[#3A4F67] text-[#EAF2F1] p-5 sm:p-8 border border-[#88B2AB]/30 rounded-2xl shadow-2xl space-y-5 sm:space-y-6">
              <div className="border-b border-[#88B2AB]/30 pb-4 sm:pb-6 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#88B2AB] block">
                    Starting From
                  </span>
                  <span className="font-serif italic text-2xl sm:text-3xl text-white font-light">
                    ${property.priceFrom}
                  </span>
                  <span className="text-xs text-[#EAF2F1]/80 font-light"> / night</span>
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
                <span>BOOK</span>
              </button>

              <p className="text-[10px] text-white font-medium text-center leading-relaxed">
                Inquiries are transmitted directly to Hanford Central Reservations in real time.
              </p>
            </div>

            {/* Included Estate Amenities with Icons */}
            <div className="bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
              <button
                type="button"
                onClick={() => setIsAmenitiesOpen(!isAmenitiesOpen)}
                className="w-full p-5 sm:p-8 flex items-center justify-between text-left hover:bg-[#88B2AB]/10 transition-colors focus:outline-none cursor-pointer group"
                aria-expanded={isAmenitiesOpen}
              >
                <div>
                  <h3 className="font-serif italic text-xl sm:text-2xl text-[#3A4F67]">
                    Amenities & Privileges
                  </h3>
                  <p className="text-xs text-[#3A4F67] font-medium mt-1">
                    Complimentary estate services provided to all guests.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#3A4F67] group-hover:text-[#51867E] transition-colors hidden sm:inline">
                    {isAmenitiesOpen ? 'Minimize' : 'Expand'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#3A4F67]/10 flex items-center justify-center text-[#3A4F67] group-hover:bg-[#3A4F67] group-hover:text-white transition-all">
                    {isAmenitiesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {isAmenitiesOpen && (
                <div className="px-5 pb-5 sm:px-8 sm:pb-8 pt-2 border-t border-[#88B2AB]/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 pt-2">
                    {property.amenities.map((amenity, i) => (
                      <AmenityBadge key={i} name={amenity} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
