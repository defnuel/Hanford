import React, { useEffect, useState } from 'react';
import { Property } from '../types';
import { fetchLocations } from '../services/dataService';
import { Calendar, ArrowRight, ShieldCheck, Sparkles, MapPin, Award, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchLocations().then((res) => {
      setProperties(res.data);
      setLoading(false);
    });
  }, []);

  const slideList = properties.length > 0 ? properties : [];

  // Auto-advance slide every 6 seconds
  useEffect(() => {
    if (slideList.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slideList.length]);

  const activeSlide = slideList[currentSlide];
  const featuredProperties = properties.slice(0, 3);

  return (
    <div className="bg-[#E8DAC1] text-[#1A1A1A]">
      {/* Full Picture Gallery Slide Hero Section */}
      <section className="relative w-full min-h-[85vh] sm:min-h-[90vh] bg-[#510F23] text-white flex flex-col justify-between overflow-hidden pt-28 pb-8 border-b border-[#C19F6A]/30">
        {/* Gallery Image Slides Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {slideList.length > 0 ? (
            slideList.map((slide, index) => (
              <div
                key={slide.id || index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                } transition-transform duration-10000`}
              >
                <img
                  src={slide.heroImage}
                  alt={slide.name}
                  className="w-full h-full object-cover object-center filter brightness-[0.80]"
                  referrerPolicy="no-referrer"
                />
                {/* Gradient Overlays (1/3 lighter/more transparent for crystal-clear image visibility) */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#510F23]/60 via-[#510F23]/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#510F23]/60 via-transparent to-black/30" />
              </div>
            ))
          ) : (
            <div className="absolute inset-0 bg-[#510F23]" />
          )}
        </div>

        {/* Hero Content Layer */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full my-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left/Center Main Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#510F23]/80 backdrop-blur-md border border-[#C19F6A]/50 rounded-full shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-[#C19F6A]" />
                <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.35em] uppercase text-[#E8DAC1]">
                  Est. 1920
                </span>
              </div>

              {/* Title */}
              <h1 className="text-5xl sm:text-7xl md:text-[88px] lg:text-[100px] leading-[0.88] font-light italic font-serif text-white tracking-tight drop-shadow-md">
                Refined<br />Sanctuary
              </h1>

              {/* Description */}
              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[#E8DAC1]/90 font-light font-sans drop-shadow">
                Founded in Vancouver, Canada in 1920, Hanford Hotels & Resorts operates two distinct collections — Hanford Grand Hotel in leading city capitals and Hanford Eco Resort in extraordinary natural coastal landscapes.
              </p>

              {/* Primary Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/locations')}
                  className="bg-[#510F23] text-white hover:bg-[#3d0b1a] px-7 py-3.5 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-lg border border-[#C19F6A]/50 inline-flex items-center gap-2 group transition-all"
                >
                  <span>EXPLORE ALL COLLECTIONS</span>
                  <ArrowRight className="w-4 h-4 text-[#C19F6A] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('/book-now')}
                  className="bg-[#C19F6A] text-[#1A1A1A] hover:bg-[#d4b17c] px-7 py-3.5 rounded-full text-[11px] font-bold tracking-widest uppercase inline-flex items-center gap-2 transition-all shadow-md font-bold"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  <span>BOOK NOW</span>
                </button>
              </div>
            </div>

            {/* Right Column: 98% Guest Satisfaction Badge */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center pt-4 lg:pt-0">
              <div className="bg-[#510F23]/75 backdrop-blur-md border border-[#C19F6A] text-[#E8DAC1] p-4 sm:p-5 rounded-2xl shadow-xl max-w-[230px] text-center space-y-2.5 hover:border-amber-300 transition-all">
                <div className="w-8 h-8 rounded-full bg-[#C19F6A]/20 border border-[#C19F6A] flex items-center justify-center mx-auto text-[#C19F6A]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-serif italic text-white font-bold block leading-none">
                    98%
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.18em] text-[#C19F6A] uppercase block mt-1">
                    GUEST SATISFACTION INDEX
                  </span>
                </div>
                <div className="flex justify-center gap-1 text-[#C19F6A]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#C19F6A]" />
                  ))}
                </div>
                <p className="text-[9px] font-light text-[#E8DAC1]/80 leading-snug border-t border-[#C19F6A]/30 pt-2">
                  Awarded top rating by Forbes Travel Guide & international luxury hospitality registers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gallery Controls & Slide Bar */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#C19F6A]/30 pt-4">
          {/* Active Sanctuary Name & Country Caption */}
          {activeSlide && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#510F23]/80 backdrop-blur-md rounded-full border border-[#C19F6A]/40 text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#C19F6A]" />
              <span className="font-serif italic text-white font-light">{activeSlide.name}</span>
              <span className="text-[#C19F6A] font-bold text-[10px] uppercase tracking-wider">• {activeSlide.country}</span>
            </div>
          )}

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
            {slideList.map((s, idx) => (
              <button
                key={s.id || idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide
                    ? 'w-8 bg-[#C19F6A]'
                    : 'w-2 bg-[#E8DAC1]/40 hover:bg-[#E8DAC1]/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows & Counter */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? slideList.length - 1 : prev - 1))}
              className="w-10 h-10 rounded-full bg-[#510F23]/90 border border-[#C19F6A]/60 text-[#E8DAC1] hover:bg-[#C19F6A] hover:text-[#1A1A1A] flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs font-mono font-bold tracking-widest text-[#C19F6A]">
              {String(currentSlide + 1).padStart(2, '0')} / {String(slideList.length).padStart(2, '0')}
            </span>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slideList.length)}
              className="w-10 h-10 rounded-full bg-[#510F23]/90 border border-[#C19F6A]/60 text-[#E8DAC1] hover:bg-[#C19F6A] hover:text-[#1A1A1A] flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
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
              <div key={n} className="h-96 bg-[#dcd0b8] animate-pulse rounded-t-[50px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => onNavigate(`/locations/${property.slug}`)}
                className="group cursor-pointer bg-[#E8DAC1] border border-[#8C8C8C]/30 rounded-t-[60px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col hover:border-[#C19F6A]"
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

        {!loading && (
          <div className="mt-14 text-center">
            <button
              onClick={() => onNavigate('/locations')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#510F23] text-white hover:bg-[#3d0b1a] rounded-full text-xs font-bold tracking-[0.25em] uppercase transition-all shadow-md hover:shadow-xl border border-[#C19F6A]/40"
            >
              <span>EXPLORE ALL LOCATIONS</span>
              <ArrowRight className="w-4 h-4 text-[#C19F6A]" />
            </button>
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
