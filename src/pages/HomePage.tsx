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
    <div className="bg-[#E8DAC1] text-[#1A1A1A]">
      {/* Bold Typography Hero Section */}
      <section className="pt-32 pb-20 min-h-screen flex items-center max-w-7xl mx-auto px-6 sm:px-8">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Bold Typography Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase mb-6 text-[#510F23]">
              Est. 1920 • Vancouver, Canada
            </span>

            <h1
              className="text-6xl sm:text-7xl md:text-[96px] lg:text-[112px] leading-[0.88] font-light italic mb-8 font-serif text-[#510F23] -ml-1 sm:-ml-2 tracking-tight"
            >
              Refined<br />Sanctuary
            </h1>

            <p className="max-w-md text-base sm:text-lg leading-relaxed text-[#1A1A1A]/80 mb-10 font-sans font-light">
              Founded in Vancouver, Canada in 1920, Hanford Hotels & Resorts operates two distinct collections — Hanford Grand Hotel in leading city capitals and Hanford Eco Resort in extraordinary natural coastal landscapes.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <div className="w-12 h-[1px] bg-[#C19F6A] hidden sm:block" />
              <button
                onClick={() => onNavigate('/locations')}
                className="bg-[#510F23] text-white px-8 py-3.5 rounded-full hover:bg-[#3d0b1a] transition-all text-[11px] font-bold tracking-widest uppercase shadow-lg border border-[#C19F6A]/30 inline-flex items-center gap-3 group"
              >
                <span>EXPLORE OUR COLLECTIONS</span>
                <ArrowRight className="w-4 h-4 text-[#C19F6A] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('/book-now')}
                className="border border-[#510F23]/40 text-[#510F23] px-8 py-3.5 rounded-full hover:bg-[#510F23] hover:text-white transition-all text-[11px] font-bold tracking-widest uppercase inline-flex items-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C19F6A]" />
                <span>BOOK NOW</span>
              </button>
            </div>
          </div>

          {/* Right Column: Arched Hero Frame & Floating Satisfaction Badge */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="w-full h-[500px] sm:h-[560px] bg-[#510F23] rounded-t-[200px] overflow-hidden shadow-2xl relative border border-[#C19F6A]/30 flex flex-col justify-between group">
              {/* Background Image with subtle overlay */}
              <img
                src={featuredHeroProperty?.heroImage || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85"}
                alt="Featured Sanctuary"
                className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#510F23]/95 via-[#510F23]/40 to-transparent" />

              {/* Top Watermark Letter */}
              <div className="relative z-10 p-8 text-center">
                <div className="text-[100px] sm:text-[120px] font-light leading-none text-[#C19F6A]/20 font-serif select-none">
                  H
                </div>
              </div>

              {/* Bottom Featured Details */}
              <div className="relative z-10 p-8 sm:p-10 text-center text-[#E8DAC1] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C19F6A] block">
                  {featuredHeroProperty?.country || "Maldives"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-light italic font-serif text-white">
                  {featuredHeroProperty?.name || "The Azure Cape"}
                </h3>
                <p className="text-[11px] uppercase tracking-widest text-[#E8DAC1]/80 font-light">
                  {featuredHeroProperty?.address || "South Malé Atoll, Maldives"}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() =>
                      onNavigate(
                        featuredHeroProperty ? `/locations/${featuredHeroProperty.slug}` : '/locations'
                      )
                    }
                    className="inline-block border border-[#C19F6A]/60 px-6 py-2 text-[10px] uppercase tracking-widest text-[#E8DAC1] hover:bg-[#C19F6A] hover:text-[#1A1A1A] transition-all rounded-full font-bold"
                  >
                    View Detail
                  </button>
                </div>
              </div>
            </div>

            {/* Circular Badge Overlay */}
            <div className="absolute -bottom-6 -left-4 sm:-left-10 w-40 h-40 sm:w-48 sm:h-48 bg-[#510F23] text-[#E8DAC1] rounded-full flex items-center justify-center text-center p-6 shadow-2xl border-2 border-[#C19F6A] z-20">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-tighter leading-tight">
                <span className="text-[#C19F6A]">98% GUEST</span><br />SATISFACTION<br />INDEX
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations Section */}
      <section className="py-24 border-t border-[#8C8C8C]/30 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-[#8C8C8C]/30 pb-8">
          <div>
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#510F23] block mb-2">
              CURATED PORTFOLIO
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl font-light italic text-[#510F23]">
              Featured Sanctuaries
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/locations')}
            className="mt-6 md:mt-0 text-[11px] font-bold tracking-widest uppercase text-[#510F23] hover:text-[#C19F6A] inline-flex items-center gap-2 transition-colors"
          >
            <span>EXPLORE ALL LOCATIONS</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C19F6A]" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-[#dcd0b8] animate-pulse rounded-t-[100px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {properties.map((property) => (
              <div
                key={property.id}
                onClick={() => onNavigate(`/locations/${property.slug}`)}
                className="group cursor-pointer bg-[#E8DAC1] border border-[#8C8C8C]/30 rounded-t-[120px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col hover:border-[#C19F6A]"
              >
                <div className="relative h-72 overflow-hidden bg-[#510F23]">
                  <img
                    src={property.heroImage}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 inset-x-0 flex justify-center z-10 px-4">
                    <span className="bg-[#510F23]/95 backdrop-blur-md text-[#E8DAC1] px-3.5 py-1 text-[10px] uppercase font-bold tracking-[0.2em] rounded-full border border-[#C19F6A]/40 shadow-md whitespace-nowrap">
                      {property.country}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#8C8C8C] uppercase block mb-1">
                      {property.continent}
                    </span>
                    <h3 className="font-serif text-2xl font-light italic text-[#510F23] mb-2 group-hover:text-[#C19F6A] transition-colors">
                      {property.name}
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/80 font-light leading-relaxed mb-6 italic">
                      "{property.tagline}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#8C8C8C]/30 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-[#510F23]">
                      From ${property.priceFrom} <span className="text-[#8C8C8C] font-normal">/ night</span>
                    </span>
                    <button
                      className="bg-[#510F23] text-white px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase group-hover:bg-[#3d0b1a] transition-colors inline-flex items-center gap-1 border border-[#C19F6A]/30"
                    >
                      <span>VIEW</span>
                      <ArrowRight className="w-3 h-3 text-[#C19F6A]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Brand Philosophy Banner */}
      <section className="bg-[#510F23] text-[#E8DAC1] py-24 border-y border-[#C19F6A]/30 relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <span className="text-[10px] font-bold tracking-[0.4em] text-[#C19F6A] uppercase block">
            THE HANFORD PHILOSOPHY
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light italic leading-tight text-white">
            "Every destination shares the same commitment to thoughtful service, timeless elegance, and experiences that celebrate both the people and the places."
          </h2>
          <div className="w-16 h-[1px] bg-[#C19F6A] mx-auto" />
          <p className="text-sm font-light text-[#E8DAC1]/80 leading-relaxed max-w-2xl mx-auto font-sans">
            Guiding business travelers, families, dignitaries, and leisure guests through a century-long legacy built on trust, excellence, and enduring relationships since 1920.
          </p>
          <div className="pt-4">
            <button
              onClick={() => onNavigate('/about')}
              className="px-8 py-3.5 bg-[#C19F6A] text-[#1A1A1A] hover:bg-[#d4b17c] text-xs font-bold tracking-widest uppercase transition-colors rounded-full shadow-lg"
            >
              DISCOVER OUR STORY
            </button>
          </div>
        </div>
      </section>

      {/* Pillars of Hospitality Grid */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#510F23] block mb-2">
            UNRIVALED STANDARD
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light italic text-[#510F23]">
            Bespoke Elements of Hanford
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="p-8 bg-[#E8DAC1] border border-[#8C8C8C]/40 rounded-2xl text-center space-y-4 shadow-sm hover:border-[#C19F6A] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#510F23] border border-[#C19F6A]/30 flex items-center justify-center mx-auto text-[#C19F6A]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-light italic text-[#510F23]">St. James Butler Service</h3>
            <p className="text-xs text-[#1A1A1A]/80 leading-relaxed font-light">
              Intuitive 24-hour white-glove attention trained in the traditions of British and Japanese hospitality.
            </p>
          </div>

          <div className="p-8 bg-[#E8DAC1] border border-[#8C8C8C]/40 rounded-2xl text-center space-y-4 shadow-sm hover:border-[#C19F6A] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#510F23] border border-[#C19F6A]/30 flex items-center justify-center mx-auto text-[#C19F6A]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-light italic text-[#510F23]">Michelin-Starred Dining</h3>
            <p className="text-xs text-[#1A1A1A]/80 leading-relaxed font-light">
              Hyper-local seasonal gastronomy crafted by renowned international master chefs and master sommelier pairings.
            </p>
          </div>

          <div className="p-8 bg-[#E8DAC1] border border-[#8C8C8C]/40 rounded-2xl text-center space-y-4 shadow-sm hover:border-[#C19F6A] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#510F23] border border-[#C19F6A]/30 flex items-center justify-center mx-auto text-[#C19F6A]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-light italic text-[#510F23]">Holistic Thermal Spas</h3>
            <p className="text-xs text-[#1A1A1A]/80 leading-relaxed font-light">
              Natural thermal springs, hydrotherapy marble pools, and bespoke herbal wellness treatments.
            </p>
          </div>

          <div className="p-8 bg-[#E8DAC1] border border-[#8C8C8C]/40 rounded-2xl text-center space-y-4 shadow-sm hover:border-[#C19F6A] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#510F23] border border-[#C19F6A]/30 flex items-center justify-center mx-auto text-[#C19F6A]">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-light italic text-[#510F23]">Rare Global Sanctuaries</h3>
            <p className="text-xs text-[#1A1A1A]/80 leading-relaxed font-light">
              Carefully chosen locations offering maximum privacy, breathtaking natural beauty, and cultural resonance.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="bg-[#E8DAC1] text-[#1A1A1A] py-20 border-t border-[#8C8C8C]/30">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#8C8C8C] block mb-1">
              RESERVATIONS REGISTER
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-light italic text-[#510F23]">
              Ready to Reserve Your Sanctuary?
            </h3>
            <p className="text-xs text-[#1A1A1A]/80 font-light tracking-wider mt-1">
              Submit your itinerary directly to Hanford Central Reservations.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/book-now')}
            className="px-8 py-4 bg-[#510F23] text-white hover:bg-[#3d0b1a] text-xs font-bold tracking-widest uppercase transition-colors whitespace-nowrap shadow-lg rounded-full border border-[#C19F6A]/30"
          >
            BOOK NOW
          </button>
        </div>
      </section>
    </div>
  );
};
