import React, { useEffect, useState } from 'react';
import { Property } from '../types';
import { fetchPropertyBySlug } from '../services/dataService';
import { MapPin, Calendar, ArrowLeft, Star } from 'lucide-react';
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

  useEffect(() => {
    setLoading(true);
    fetchPropertyBySlug(slug).then((res) => {
      setProperty(res.data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[#f5f2ed] pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-serif italic tracking-widest text-[#1a1a1a] uppercase">
            Loading Sanctuary Details...
          </p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-[#f5f2ed] pt-32 pb-24 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <MapPin className="w-12 h-12 text-[#1a1a1a] mx-auto" />
          <h1 className="font-serif italic text-3xl text-[#1a1a1a]">Sanctuary Not Found</h1>
          <p className="text-xs text-black/70 font-light">
            We could not locate the requested Hanford property details.
          </p>
          <button
            onClick={() => onNavigate('/locations')}
            className="px-6 py-3 bg-[#1a1a1a] text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-black/80 transition-colors"
          >
            RETURN TO ALL LOCATIONS
          </button>
        </div>
      </div>
    );
  }

  const allGalleryImages = [property.heroImage, ...(property.galleryImages || [])];

  return (
    <div className="bg-[#f5f2ed] pt-24 pb-24 text-[#1a1a1a]">
      {/* Breadcrumb Navigation Bar */}
      <div className="bg-[#e8e4de] border-b border-black/10 py-4">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between text-xs">
          <button
            onClick={() => onNavigate('/locations')}
            className="inline-flex items-center gap-2 text-black/70 hover:text-black font-bold tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#1a1a1a]" />
            <span>BACK TO ALL LOCATIONS</span>
          </button>

          <span className="text-black/60 font-light">
            {property.continent} / {property.country} / <strong className="text-[#1a1a1a]">{property.name}</strong>
          </span>
        </div>
      </div>

      {/* Main Hero Header */}
      <section className="relative bg-[#1a1a1a] text-white py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white text-[#1a1a1a] text-[10px] font-bold tracking-[0.2em] uppercase rounded-full">
                {property.status}
              </span>
              <span className="text-xs font-bold tracking-[0.25em] text-[#d6d2cc] uppercase">
                {property.continent} • {property.country}
              </span>
            </div>

            <h1 className="font-serif italic text-4xl sm:text-6xl font-light text-white leading-tight">
              {property.name}
            </h1>

            <p className="text-base sm:text-lg font-light text-gray-300 italic">
              "{property.tagline}"
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-300 pt-2 font-light">
              <MapPin className="w-4 h-4 text-[#d6d2cc]" />
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
              <div className="relative h-[450px] bg-[#1a1a1a] border border-black/10 rounded-t-[100px] overflow-hidden shadow-xl">
                <img
                  src={allGalleryImages[activeImageIndex]}
                  alt={`${property.name} slide`}
                  className="w-full h-full object-cover transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Gallery Thumbnails */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {allGalleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-20 overflow-hidden rounded-xl border-2 transition-all ${
                      activeImageIndex === idx ? 'border-black scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Editorial Content parsed from Google Sheets text */}
            <CleanPropertyDetails detailsHtml={property.detailsHtml} propertyName={property.name} />
          </div>

          {/* Right Column: Reservation Card & Amenities Grid */}
          <div className="space-y-8">
            {/* Direct Reservation Sticky Card */}
            <div className="bg-[#1a1a1a] text-white p-8 border border-black/10 rounded-2xl shadow-2xl sticky top-28 space-y-6">
              <div className="border-b border-white/20 pb-6 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
                    Starting From
                  </span>
                  <span className="font-serif italic text-3xl text-white font-light">
                    ${property.priceFrom}
                  </span>
                  <span className="text-xs text-gray-400 font-light"> / night</span>
                </div>
                <div className="flex items-center gap-1 text-white text-xs">
                  <Star className="w-4 h-4 fill-white text-amber-300" />
                  <span className="font-bold">{property.rating}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-gray-300 font-light">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Status</span>
                  <span className="text-emerald-400 font-medium">{property.status}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Country</span>
                  <span className="text-white">{property.country}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Continent</span>
                  <span className="text-white">{property.continent}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate(`/book-now?property=${property.slug}`)}
                className="w-full py-4 bg-white text-[#1a1a1a] hover:bg-[#d6d2cc] rounded-full text-xs font-bold tracking-widest uppercase transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>RESERVE THIS SANCTUARY</span>
              </button>

              <p className="text-[10px] text-gray-400 text-center font-light leading-relaxed">
                Inquiries are transmitted directly to Hanford Central Reservations in real time.
              </p>
            </div>

            {/* Included Estate Amenities with Icons */}
            <div className="bg-[#e8e4de] p-8 border border-black/10 rounded-2xl space-y-6">
              <div>
                <h3 className="font-serif italic text-2xl text-[#1a1a1a]">
                  Amenities & Privileges
                </h3>
                <p className="text-xs text-black/60 font-light mt-1">
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
