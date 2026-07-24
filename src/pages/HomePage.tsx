import React, { useEffect, useState } from 'react';
import { Property } from '../types';
import { fetchLocations } from '../services/dataService';
import { Compass, Calendar, ArrowRight, ShieldCheck, Sparkles, MapPin, Award } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations().then((res) => {
      setProperties(res.data.filter((p) => p.status === 'Live' || p.status === 'Active').slice(0, 3));
      setLoading(false);
    });
  }, []);

  const featuredHeroProperty = properties[0];

  return (
    <div className="bg-[#f5f2ed] text-[#1a1a1a]">
      {/* Bold Typography Hero Section */}
      <section className="pt-32 pb-20 min-h-screen flex items-center max-w-7xl mx-auto px-6 sm:px-8">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Bold Typography Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase mb-6 opacity-60 text-[#1a1a1a]">
              Est. 1920 • Vancouver, Canada
            </span>

            <h1
              className="text-6xl sm:text-7xl md:text-[96px] lg:text-[112px] leading-[0.88] font-light italic mb-8 font-serif text-[#1a1a1a] -ml-1 sm:-ml-2 tracking-tight"
            >
              Refined<br />Sanctuary
            </h1>

            <p className="max-w-md text-base sm:text-lg leading-relaxed text-black/70 mb-10 font-sans font-light">
              Founded in Vancouver, Canada in 1920, Hanford Hotels & Resorts operates two distinct collections — Hanford Grand Hotel in leading city capitals and Hanford Eco Resort in extraordinary natural coastal landscapes.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <div className="w-12 h-[1px] bg-black hidden sm:block" />
              <button
                onClick={() => onNavigate('/locations')}
                className="bg-[#1a1a1a] text-white px-8 py-3.5 rounded-full hover:bg-black/80 transition-all text-[11px] font-bold tracking-widest uppercase shadow-lg inline-flex items-center gap-3"
              >
                <span>EXPLORE OUR COLLECTIONS</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/book-now')}
                className="border border-black/30 text-[#1a1a1a] px-8 py-3.5 rounded-full hover:bg-[#e8e4de] transition-all text-[11px] font-bold tracking-widest uppercase inline-flex items-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>BOOK NOW</span>
              </button>
            </div>
          </div>

          {/* Right Column: Arched Hero Frame & Floating Satisfaction Badge */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="w-full h-[500px] sm:h-[560px] bg-[#e8e4de] rounded-t-[200px] overflow-hidden shadow-2xl relative border border-black/10 flex flex-col justify-between group">
              {/* Background Image with subtle overlay */}
              <img
                src={featuredHeroProperty?.heroImage || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85"}
                alt="Featured Sanctuary"
                className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/90 via-[#1a1a1a]/30 to-transparent" />

              {/* Top Watermark Letter */}
              <div className="relative z-10 p-8 text-center">
                <div className="text-[100px] sm:text-[120px] font-light leading-none text-white/20 font-serif select-none">
                  H
                </div>
              </div>

              {/* Bottom Featured Details */}
              <div className="relative z-10 p-8 sm:p-10 text-center text-white space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d6d2cc] block">
                  {featuredHeroProperty?.country || "Maldives"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-light italic font-serif">
                  {featuredHeroProperty?.name || "The Azure Cape"}
                </h3>
                <p className="text-[11px] uppercase tracking-widest text-gray-300 font-light">
                  {featuredHeroProperty?.address || "South Malé Atoll, Maldives"}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() =>
                      onNavigate(
                        featuredHeroProperty ? `/locations/${featuredHeroProperty.slug}` : '/locations'
                      )
                    }
                    className="inline-block border border-white/40 px-6 py-2 text-[10px] uppercase tracking-widest text-white hover:bg-white hover:text-[#1a1a1a] transition-all rounded-full"
                  >
                    View Detail
                  </button>
                </div>
              </div>
            </div>

            {/* Circular Badge Overlay */}
            <div className="absolute -bottom-6 -left-4 sm:-left-10 w-40 h-40 sm:w-48 sm:h-48 bg-[#d6d2cc] rounded-full flex items-center justify-center text-center p-6 shadow-2xl border border-black/10 z-20">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-tighter leading-tight text-[#1a1a1a]">
                98% GUEST<br />SATISFACTION<br />INDEX
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations Section */}
      <section className="py-24 border-t border-black/10 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-black/10 pb-8">
          <div>
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-black/60 block mb-2">
              CURATED PORTFOLIO
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl font-light italic text-[#1a1a1a]">
              Featured Sanctuaries
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/locations')}
            className="mt-6 md:mt-0 text-[11px] font-bold tracking-widest uppercase text-[#1a1a1a] hover:opacity-60 inline-flex items-center gap-2 transition-opacity"
          >
            <span>EXPLORE ALL LOCATIONS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-[#e8e4de] animate-pulse rounded-t-[100px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {properties.map((property) => (
              <div
                key={property.id}
                onClick={() => onNavigate(`/locations/${property.slug}`)}
                className="group cursor-pointer bg-[#e8e4de] border border-black/10 rounded-t-[120px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                <div className="relative h-72 overflow-hidden bg-[#1a1a1a]">
                  <img
                    src={property.heroImage}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 inset-x-0 flex justify-center z-10 px-4">
                    <span className="bg-[#1a1a1a]/90 backdrop-blur-md text-white px-3.5 py-1 text-[10px] uppercase font-bold tracking-[0.2em] rounded-full border border-white/20 shadow-md whitespace-nowrap">
                      {property.country}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-black/50 uppercase block mb-1">
                      {property.continent}
                    </span>
                    <h3 className="font-serif text-2xl font-light italic text-[#1a1a1a] mb-2 group-hover:opacity-70 transition-opacity">
                      {property.name}
                    </h3>
                    <p className="text-xs text-black/70 font-light leading-relaxed mb-6 italic">
                      "{property.tagline}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-[#1a1a1a]">
                      From ${property.priceFrom} <span className="text-black/50 font-normal">/ night</span>
                    </span>
                    <button
                      className="bg-[#1a1a1a] text-white px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase group-hover:bg-black/80 transition-colors inline-flex items-center gap-1"
                    >
                      <span>VIEW</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Brand Philosophy Banner */}
      <section className="bg-[#1a1a1a] text-white py-24 border-y border-black/10 relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <span className="text-[10px] font-bold tracking-[0.4em] text-[#d6d2cc] uppercase block">
            THE HANFORD PHILOSOPHY
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light italic leading-tight">
            "Every destination shares the same commitment to thoughtful service, timeless elegance, and experiences that celebrate both the people and the places."
          </h2>
          <div className="w-16 h-[1px] bg-[#d6d2cc] mx-auto" />
          <p className="text-sm font-light text-gray-300 leading-relaxed max-w-2xl mx-auto font-sans">
            Guiding business travelers, families, dignitaries, and leisure guests through a century-long legacy built on trust, excellence, and enduring relationships since 1920.
          </p>
          <div className="pt-4">
            <button
              onClick={() => onNavigate('/about')}
              className="px-8 py-3.5 bg-white text-[#1a1a1a] hover:bg-[#d6d2cc] text-xs font-bold tracking-widest uppercase transition-colors rounded-full shadow-lg"
            >
              DISCOVER OUR STORY
            </button>
          </div>
        </div>
      </section>

      {/* Pillars of Hospitality Grid */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-black/60 block mb-2">
            UNRIVALED STANDARD
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light italic text-[#1a1a1a]">
            Bespoke Elements of Hanford
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="p-8 bg-[#e8e4de] border border-black/10 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-black/20 flex items-center justify-center mx-auto text-[#1a1a1a]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-light italic text-[#1a1a1a]">St. James Butler Service</h3>
            <p className="text-xs text-black/70 leading-relaxed font-light">
              Intuitive 24-hour white-glove attention trained in the traditions of British and Japanese hospitality.
            </p>
          </div>

          <div className="p-8 bg-[#e8e4de] border border-black/10 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-black/20 flex items-center justify-center mx-auto text-[#1a1a1a]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-light italic text-[#1a1a1a]">Michelin-Starred Dining</h3>
            <p className="text-xs text-black/70 leading-relaxed font-light">
              Hyper-local seasonal gastronomy crafted by renowned international master chefs and master sommelier pairings.
            </p>
          </div>

          <div className="p-8 bg-[#e8e4de] border border-black/10 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-black/20 flex items-center justify-center mx-auto text-[#1a1a1a]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-light italic text-[#1a1a1a]">Holistic Thermal Spas</h3>
            <p className="text-xs text-black/70 leading-relaxed font-light">
              Natural thermal springs, hydrotherapy marble pools, and bespoke herbal wellness treatments.
            </p>
          </div>

          <div className="p-8 bg-[#e8e4de] border border-black/10 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-black/20 flex items-center justify-center mx-auto text-[#1a1a1a]">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-light italic text-[#1a1a1a]">Rare Global Sanctuaries</h3>
            <p className="text-xs text-black/70 leading-relaxed font-light">
              Carefully chosen locations offering maximum privacy, breathtaking natural beauty, and cultural resonance.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="bg-[#e8e4de] text-[#1a1a1a] py-20 border-t border-black/10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-black/50 block mb-1">
              RESERVATIONS REGISTER
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-light italic text-[#1a1a1a]">
              Ready to Reserve Your Sanctuary?
            </h3>
            <p className="text-xs text-black/70 font-light tracking-wider mt-1">
              Submit your itinerary directly to Hanford Central Reservations.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/book-now')}
            className="px-8 py-4 bg-[#1a1a1a] text-white hover:bg-black/80 text-xs font-bold tracking-widest uppercase transition-colors whitespace-nowrap shadow-lg rounded-full"
          >
            BOOK NOW
          </button>
        </div>
      </section>
    </div>
  );
};
