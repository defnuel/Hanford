import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Property } from '../types';
import { fetchPropertyBySlug } from '../services/dataService';
import { MapPin, Calendar, ArrowLeft, Star, ChevronLeft, ChevronRight } from 'lucide-react';
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
      <div className="bg-[#E8DAC1] pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#510F23] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-serif italic tracking-widest text-[#510F23] uppercase">
            Loading Sanctuary Details...
          </p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-[#E8DAC1] pt-32 pb-24 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <MapPin className="w-12 h-12 text-[#510F23] mx-auto" />
          <h1 className="font-serif italic text-3xl text-[#510F23]">Sanctuary Not Found</h1>
          <p className="text-xs text-[#1A1A1A]/80 font-light">
            We could not locate the requested Hanford property details.
          </p>
          <button
            onClick={() => onNavigate('/locations')}
            className="px-6 py-3 bg-[#510F23] text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#3d0b1a] transition-colors border border-[#C19F6A]/30"
          >
            RETURN TO ALL LOCATIONS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#E8DAC1] pt-24 pb-24 text-[#1A1A1A]">
      {/* Breadcrumb Navigation Bar */}
      <div className="bg-[#E8DAC1] border-b border-[#8C8C8C]/30 py-4">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between text-xs">
          <button
            onClick={() => onNavigate('/locations')}
            className="inline-flex items-center gap-2 text-[#510F23] hover:text-[#C19F6A] font-bold tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#510F23]" />
            <span>BACK TO ALL LOCATIONS</span>
          </button>

          <span className="text-[#8C8C8C] font-light">
            {property.continent} / {property.country} / <strong className="text-[#510F23]">{property.name}</strong>
          </span>
        </div>
      </div>

      {/* Main Hero Header */}
      <section className="relative bg-[#510F23] text-[#E8DAC1] py-16 overflow-hidden border-b border-[#C19F6A]/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#C19F6A] text-[#1A1A1A] text-[10px] font-bold tracking-[0.2em] uppercase rounded-full">
                {property.status}
              </span>
              <span className="text-xs font-bold tracking-[0.25em] text-[#C19F6A] uppercase">
                {property.continent} • {property.country}
              </span>
            </div>

            <h1 className="font-serif italic text-4xl sm:text-6xl font-light text-white leading-tight">
              {property.name}
            </h1>

            <p className="text-base sm:text-lg font-light text-[#E8DAC1]/80 italic">
              "{property.tagline}"
            </p>

            <div className="flex items-center gap-2 text-xs text-[#E8DAC1]/80 pt-2 font-light">
              <MapPin className="w-4 h-4 text-[#C19F6A]" />
              <span>{property.address}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left 2 Columns: Gallery & HTML Details Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Gallery Viewer */}
            <div className="space-y-4">
              <div className="relative w-full aspect-[16/10] sm:aspect-video sm:h-[480px] bg-[#510F23] border border-[#8C8C8C]/30 rounded-t-[40px] sm:rounded-t-[100px] overflow-hidden shadow-xl group">
                <img
                  src={allGalleryImages[activeImageIndex] || property.heroImage}
                  alt={`${property.name} slide ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Counter overlay */}
                {allGalleryImages.length > 0 && (
                  <div className="absolute bottom-4 right-6 bg-[#510F23]/80 backdrop-blur-md text-[#E8DAC1] px-3.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#C19F6A]/30">
                    {activeImageIndex + 1} / {allGalleryImages.length}
                  </div>
                )}

                {/* Main image Prev/Next arrows overlay */}
                {allGalleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allGalleryImages.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#510F23]/80 text-[#E8DAC1] hover:bg-[#510F23] transition-all opacity-0 group-hover:opacity-100 border border-[#C19F6A]/30 shadow-lg"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#C19F6A]" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === allGalleryImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#510F23]/80 text-[#E8DAC1] hover:bg-[#510F23] transition-all opacity-0 group-hover:opacity-100 border border-[#C19F6A]/30 shadow-lg"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-[#C19F6A]" />
                    </button>
                  </>
                )}
              </div>

              {/* Horizontal Single Row Thumbnail Carousel with Navigation Arrows */}
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => scrollThumbnails('left')}
                  className="p-2.5 rounded-full bg-[#510F23] text-[#E8DAC1] hover:bg-[#3d0b1a] transition-all border border-[#C19F6A]/30 shrink-0 shadow-sm"
                  aria-label="Scroll thumbnails left"
                >
                  <ChevronLeft className="w-4 h-4 text-[#C19F6A]" />
                </button>

                <div
                  ref={thumbnailContainerRef}
                  className="flex flex-1 gap-3 overflow-x-auto scroll-smooth py-1 px-1 scrollbar-none"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {allGalleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#510F23] scale-95 shadow-md ring-2 ring-[#C19F6A]'
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
                  className="p-2.5 rounded-full bg-[#510F23] text-[#E8DAC1] hover:bg-[#3d0b1a] transition-all border border-[#C19F6A]/30 shrink-0 shadow-sm"
                  aria-label="Scroll thumbnails right"
                >
                  <ChevronRight className="w-4 h-4 text-[#C19F6A]" />
                </button>
              </div>
            </div>

            {/* Clean Editorial Content parsed from Google Sheets text */}
            <CleanPropertyDetails detailsHtml={property.detailsHtml} propertyName={property.name} />
          </div>

          {/* Right Column: Reservation Card & Amenities Grid */}
          <div className="space-y-8">
            {/* Direct Reservation Sticky Card */}
            <div className="bg-[#510F23] text-[#E8DAC1] p-8 border border-[#C19F6A]/30 rounded-2xl shadow-2xl sticky top-28 space-y-6">
              <div className="border-b border-[#C19F6A]/30 pb-6 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C19F6A] block">
                    Starting From
                  </span>
                  <span className="font-serif italic text-3xl text-white font-light">
                    ${property.priceFrom}
                  </span>
                  <span className="text-xs text-[#E8DAC1]/80 font-light"> / night</span>
                </div>
                <div className="flex items-center gap-1 text-[#E8DAC1] text-xs">
                  <Star className="w-4 h-4 fill-[#C19F6A] text-[#C19F6A]" />
                  <span className="font-bold">{property.rating}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#E8DAC1]/80 font-light">
                <div className="flex justify-between py-2 border-b border-[#C19F6A]/20">
                  <span className="text-[#C19F6A]">Status</span>
                  <span className="text-emerald-300 font-medium">{property.status}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#C19F6A]/20">
                  <span className="text-[#C19F6A]">Country</span>
                  <span className="text-white">{property.country}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#C19F6A]/20">
                  <span className="text-[#C19F6A]">Continent</span>
                  <span className="text-white">{property.continent}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate(`/book-now?property=${property.slug}`)}
                className="w-full py-4 bg-[#C19F6A] text-[#1A1A1A] hover:bg-[#d4b17c] rounded-full text-xs font-bold tracking-widest uppercase transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#1A1A1A]" />
                <span>RESERVE THIS SANCTUARY</span>
              </button>

              <p className="text-[10px] text-[#E8DAC1]/70 text-center font-light leading-relaxed">
                Inquiries are transmitted directly to Hanford Central Reservations in real time.
              </p>
            </div>

            {/* Included Estate Amenities with Icons */}
            <div className="bg-[#E8DAC1] p-8 border border-[#8C8C8C]/40 rounded-2xl space-y-6 shadow-sm">
              <div>
                <h3 className="font-serif italic text-2xl text-[#510F23]">
                  Amenities & Privileges
                </h3>
                <p className="text-xs text-[#8C8C8C] font-light mt-1">
                  Complimentary estate services provided to all guests.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {property.amenities.map((amenity, i) => (
                  <AmenityBadge key={i} name={amenity} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
