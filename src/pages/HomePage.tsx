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
    <div className="bg-[#FFFFFF] text-[#2C3744]">
      {/* Full Picture Gallery Slide Hero Section */}
      <section className="relative w-full min-h-[75vh] sm:min-h-[90vh] bg-[#3A4F67] text-white flex flex-col justify-between overflow-hidden pt-20 sm:pt-28 pb-6 sm:pb-8 border-b border-[#88B2AB]/30">
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
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B]/90 via-[#2C3744]/75 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/95 via-[#2C3744]/50 to-black/40" />
              </div>
            ))
          ) : (
            <div className="absolute inset-0 bg-[#3A4F67]" />
          )}
        </div>

        {/* Hero Content Layer */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full my-auto py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left/Center Main Column */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-[#1E293B]/90 backdrop-blur-md border border-[#88B2AB]/80 rounded-full shadow-lg">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#88B2AB]" />
                <span className="text-[9px] sm:text-[11px] font-bold tracking-[0.25em] sm:tracking-[0.35em] uppercase text-white">
                  Est. 1920
                </span>
              </div>

              {/* Title */}
              <h1 className="text-[38px] min-[375px]:text-[44px] min-[414px]:text-[48px] sm:text-7xl md:text-[88px] lg:text-[100px] leading-[0.92] sm:leading-[0.88] font-light italic font-serif text-white tracking-tight drop-shadow-2xl">
                Refined<br />Sanctuary
              </h1>

              {/* Description */}
              <p className="max-w-xl text-xs sm:text-lg leading-relaxed text-[#EAF2F1] font-normal font-sans drop-shadow-lg">
                Hanford Hotels & Resorts operates two distinct collections — Hanford Grand Hotel in leading city capitals and Hanford Eco Resort in extraordinary natural coastal landscapes.
              </p>

              {/* Primary Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
                <button
                  onClick={() => onNavigate('/locations')}
                  className="bg-[#51867E] text-white hover:bg-[#3f6d66] px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-widest uppercase shadow-lg border border-[#88B2AB]/50 inline-flex items-center gap-2 group transition-all cursor-pointer"
                >
                  <span>EXPLORE ALL COLLECTIONS</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#88B2AB] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('/book-now')}
                  className="cta-button book-now-button bg-[#51867E] text-white hover:bg-[#3f6d66] px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-widest uppercase inline-flex items-center gap-2 transition-all shadow-md cursor-pointer border border-[#88B2AB]/30"
                >
                  <Calendar className="w-3.5 h-3.5 text-white" />
                  <span>BOOK NOW</span>
                </button>
              </div>
            </div>

            {/* Right Column: 98% Guest Satisfaction Badge */}
          
          </div>
        </div>

        {/* Bottom Gallery Controls & Slide Bar */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-t border-[#88B2AB]/30 pt-3 sm:pt-4">
          {/* Active Sanctuary Name & Country Caption */}
          {activeSlide && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#3A4F67]/90 backdrop-blur-md rounded-full border border-[#88B2AB]/40 text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#88B2AB]" />
              <span className="font-serif italic text-white font-light">{activeSlide.name}</span>
              <span className="text-[#88B2AB] font-bold text-[10px] uppercase tracking-wider">• {activeSlide.country}</span>
            </div>
          )}

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full py-1">
            {slideList.map((s, idx) => (
              <button
                key={s.id || idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide
                    ? 'w-6 sm:w-8 bg-[#88B2AB]'
                    : 'w-1.5 sm:w-2 bg-[#EAF2F1]/40 hover:bg-[#EAF2F1]/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows & Counter */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? slideList.length - 1 : prev - 1))}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3A4F67]/90 border border-[#88B2AB]/60 text-[#EAF2F1] hover:bg-[#51867E] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-[#88B2AB]">
              {String(currentSlide + 1).padStart(2, '0')} / {String(slideList.length).padStart(2, '0')}
            </span>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slideList.length)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#3A4F67]/90 border border-[#88B2AB]/60 text-[#EAF2F1] hover:bg-[#51867E] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Destinations Section */}
      <section className="py-12 sm:py-24 border-t border-[#666666]/20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-16 border-b border-[#666666]/20 pb-6 sm:pb-8">
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#51867E] block mb-1.5 sm:mb-2">
              CURATED PORTFOLIO
            </span>
            <h2 className="font-serif text-3xl sm:text-6xl font-light italic text-[#3A4F67]">
              Featured Sanctuaries
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/locations')}
            className="mt-4 md:mt-0 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#51867E] hover:text-[#3A4F67] inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>EXPLORE ALL LOCATIONS</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#51867E]" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 sm:h-96 bg-[#EAF2F1] animate-pulse rounded-t-[40px] sm:rounded-t-[50px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => onNavigate(`/locations/${property.slug}`)}
                className="group cursor-pointer bg-white border border-[#666666]/30 rounded-t-[40px] sm:rounded-t-[60px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col hover:border-[#51867E]"
              >
                <div className="relative h-48 sm:h-72 overflow-hidden bg-[#3A4F67]">
                  <img
                    src={property.heroImage}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 inset-x-0 flex justify-center z-10 px-4">
                    <span className="bg-[#3A4F67]/95 backdrop-blur-md text-[#EAF2F1] px-3.5 py-1 text-[10px] uppercase font-bold tracking-[0.2em] rounded-full border border-[#88B2AB]/40 shadow-md whitespace-nowrap">
                      {property.country}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-8 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#3A4F67] uppercase block mb-1">
                      {property.continent}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-light italic text-[#3A4F67] mb-2 group-hover:text-[#51867E] transition-colors">
                      {property.name}
                    </h3>
                    <p className="text-xs text-[#2C3744] font-light leading-relaxed mb-4 sm:mb-6 italic">
                      "{property.tagline}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#666666]/20 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-[#3A4F67]">
                      From ${property.priceFrom} <span className="text-[#3A4F67] font-medium">/ night</span>
                    </span>
                    <button
                      className="cta-button bg-[#51867E] text-white px-4 sm:px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-[#3f6d66] transition-colors inline-flex items-center gap-1 border border-[#51867E]/30 cursor-pointer"
                    >
                      <span>VIEW</span>
                      <ArrowRight className="w-3 h-3 text-white" />
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
              className="cta-button inline-flex items-center gap-3 px-8 py-4 bg-[#51867E] text-white hover:bg-[#3f6d66] rounded-full text-xs font-bold tracking-[0.25em] uppercase transition-all shadow-md hover:shadow-xl border border-[#51867E]/30 cursor-pointer"
            >
              <span>EXPLORE ALL LOCATIONS</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </section>

      {/* Brand Philosophy Banner */}
      <section className="testimonial-section bg-[#EAF2F1] text-[#2C3744] py-12 sm:py-24 border-y border-[#88B2AB]/30 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] text-[#51867E] uppercase block">
            THE HANFORD PHILOSOPHY
          </span>
          <h2 className="luxury-emphasis font-serif text-2xl sm:text-5xl font-light italic leading-snug sm:leading-tight text-[#3A4F67]">
            "Every destination shares the same commitment to thoughtful service, timeless elegance, and experiences that celebrate both the people and the places."
          </h2>
          <div className="w-12 sm:w-16 h-[1px] bg-[#51867E] mx-auto" />
          <p className="text-xs sm:text-sm font-light text-[#2C3744] leading-relaxed max-w-2xl mx-auto font-sans">
            Guiding business travelers, families, dignitaries, and leisure guests through a century-long legacy built on trust, excellence, and enduring relationships since 1920.
          </p>
          <div className="pt-2 sm:pt-4">
            <button
              onClick={() => onNavigate('/about')}
              className="cta-button px-6 sm:px-8 py-3 sm:py-3.5 bg-[#51867E] text-white hover:bg-[#3f6d66] text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors rounded-full shadow-lg border border-[#51867E]/30 cursor-pointer"
            >
              DISCOVER OUR STORY
            </button>
          </div>
        </div>
      </section>

      {/* Pillars of Hospitality Grid */}
      <section className="py-12 sm:py-24 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#51867E] block mb-1.5 sm:mb-2">
            UNRIVALED STANDARD
          </span>
          <h2 className="font-serif text-2xl sm:text-5xl font-light italic text-[#3A4F67]">
            Bespoke Elements of Hanford
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          <div className="info-panel p-5 sm:p-8 bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl text-center space-y-3 sm:space-y-4 shadow-sm hover:border-[#51867E] transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#51867E] border border-[#88B2AB]/30 flex items-center justify-center mx-auto text-[#88B2AB]">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-light italic text-[#3A4F67]">St. James Butler Service</h3>
            <p className="text-xs text-[#2C3744] leading-relaxed font-light">
              Intuitive 24-hour white-glove attention trained in the traditions of British and Japanese hospitality.
            </p>
          </div>

          <div className="info-panel p-5 sm:p-8 bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl text-center space-y-3 sm:space-y-4 shadow-sm hover:border-[#51867E] transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#51867E] border border-[#88B2AB]/30 flex items-center justify-center mx-auto text-[#88B2AB]">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-light italic text-[#3A4F67]">Michelin-Starred Dining</h3>
            <p className="text-xs text-[#2C3744] leading-relaxed font-light">
              Hyper-local seasonal gastronomy crafted by renowned international master chefs and master sommelier pairings.
            </p>
          </div>

          <div className="info-panel p-5 sm:p-8 bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl text-center space-y-3 sm:space-y-4 shadow-sm hover:border-[#51867E] transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#51867E] border border-[#88B2AB]/30 flex items-center justify-center mx-auto text-[#88B2AB]">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-light italic text-[#3A4F67]">Holistic Thermal Spas</h3>
            <p className="text-xs text-[#2C3744] leading-relaxed font-light">
              Natural thermal springs, hydrotherapy marble pools, and bespoke herbal wellness treatments.
            </p>
          </div>

          <div className="info-panel p-5 sm:p-8 bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl text-center space-y-3 sm:space-y-4 shadow-sm hover:border-[#51867E] transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#51867E] border border-[#88B2AB]/30 flex items-center justify-center mx-auto text-[#88B2AB]">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-light italic text-[#3A4F67]">Rare Global Sanctuaries</h3>
            <p className="text-xs text-[#2C3744] leading-relaxed font-light">
              Carefully chosen locations offering maximum privacy, breathtaking natural beauty, and cultural resonance.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="testimonial-section info-panel bg-[#EAF2F1] text-[#2C3744] py-12 sm:py-20 border-t border-[#88B2AB]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-center md:text-left">
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#3A4F67] block mb-1">
              RESERVATIONS REGISTER
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-light italic text-[#3A4F67]">
              Ready to Reserve Your Sanctuary?
            </h3>
            <p className="text-xs text-[#2C3744] font-light tracking-wider mt-1">
              Submit your itinerary directly to Hanford Central Reservations.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/book-now')}
            className="book-now-button cta-button px-6 sm:px-8 py-3.5 sm:py-4 bg-[#51867E] text-white hover:bg-[#3f6d66] text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors whitespace-nowrap shadow-lg rounded-full border border-[#51867E]/30 cursor-pointer"
          >
            BOOK NOW
          </button>
        </div>
      </section>
    </div>
  );
};
