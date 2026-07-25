import React, { useState, useEffect } from 'react';
import { Award, Building2, Trees, HeartHandshake, Sparkles, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { fetchLocations } from '../services/dataService';
import { Property } from '../types';
import trevorPhoto from '../assets/images/trevor_hanford_pinterest.jpg';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

const fallbackGallery = [
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85',
    title: 'Heritage Estate Architecture',
    caption: 'Vancouver Flagship Headquarters',
  },
  {
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85',
    title: 'Coastal Eco Sanctuaries',
    caption: 'Jeju & Santa Barbara Havens',
  },
  {
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85',
    title: 'Urban Luxury Collections',
    caption: 'Capitals of Distinction',
  },
];

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;
    fetchLocations().then((res) => {
      if (isMounted && res.data && res.data.length > 0) {
        setProperties(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Slide list derived directly from Google Sheets "Main Picture" column
  const slides =
    properties.length > 0
      ? properties.map((p) => ({
          url: p.heroImage,
          title: p.name,
          caption: `${p.country} • ${p.continent}`,
        }))
      : fallbackGallery;

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[currentSlide] || slides[0];

  return (
    <div className="bg-[#E8DAC1] text-[#1A1A1A]">
      {/* Full Picture Gallery Slide Hero Header */}
      <section className="relative w-full min-h-[75vh] sm:min-h-[85vh] bg-[#510F23] text-white flex flex-col justify-between overflow-hidden pt-28 pb-8 border-b border-[#C19F6A]/30">
        {/* Gallery Image Slides Background from Google Sheets Main Picture */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <img
                src={slide.url}
                alt={slide.title}
                className="w-full h-full object-cover object-center filter brightness-[0.75]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#510F23]/80 via-[#510F23]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#510F23]/90 via-transparent to-black/40" />
            </div>
          ))}
        </div>

        {/* Hero Text Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center my-auto py-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#510F23]/80 backdrop-blur-md border border-[#C19F6A]/50 rounded-full shadow-lg mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#C19F6A]" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.35em] uppercase text-[#E8DAC1]">
              EST. 1920 • VANCOUVER, CANADA
            </span>
          </div>

          <h1 className="font-serif italic text-3xl sm:text-5xl lg:text-6xl text-white font-light mb-6 leading-tight drop-shadow-md">
            Hanford Hotels & Resorts
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-[#E8DAC1]/90 font-light leading-relaxed drop-shadow">
            Founded in Vancouver, Canada, Hanford Hotels & Resorts began as a family-owned hospitality company with a simple belief: every guest should feel welcomed with warmth, comfort, and genuine care.
          </p>
        </div>

        {/* Bottom Gallery Slide Indicators & Controls */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full flex items-center justify-between border-t border-[#C19F6A]/30 pt-4">
          <span className="text-xs font-serif italic text-[#C19F6A] hidden sm:block">
            {activeSlide.title} • {activeSlide.caption}
          </span>

          <div className="flex items-center gap-2 mx-auto sm:mx-0 overflow-x-auto max-w-full py-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide ? 'w-8 bg-[#C19F6A]' : 'w-2 bg-[#E8DAC1]/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 hidden sm:flex">
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
              className="w-8 h-8 rounded-full bg-[#510F23]/90 border border-[#C19F6A]/60 text-[#E8DAC1] hover:bg-[#C19F6A] hover:text-[#1A1A1A] flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="w-8 h-8 rounded-full bg-[#510F23]/90 border border-[#C19F6A]/60 text-[#E8DAC1] hover:bg-[#C19F6A] hover:text-[#1A1A1A] flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Heritage & Brand Story */}
      <section className="py-20 bg-[#E8DAC1] border-b border-[#8C8C8C]/30">
        <div className="max-w-4xl mx-auto px-6 space-y-8 text-center sm:text-left">
          <div className="text-center">
            <span className="text-[10px] font-bold tracking-[0.4em] text-[#510F23] uppercase block mb-2">
              OUR STORY
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl text-[#510F23] font-light">
              Over a Century of Timeless Hospitality
            </h2>
            <div className="w-16 h-[1px] bg-[#C19F6A] mx-auto mt-4" />
          </div>

          <div className="space-y-6 text-[#1A1A1A]/85 font-light leading-relaxed text-sm sm:text-base">
            <p>
              Founded in Vancouver, Canada, Hanford Hotels & Resorts began as a family-owned hospitality company with a simple belief: every guest should feel welcomed with warmth, comfort, and genuine care. What started as a single grand hotel has grown over more than a century into an international collection of luxury hotels and destination resorts, guided by four generations of the Hanford family.
            </p>
            <p>
              Throughout its history, Hanford Hotels & Resorts has remained committed to timeless hospitality while embracing the evolving needs of modern travelers. Each property reflects the culture, architecture, and character of its destination, combining refined accommodations, exceptional service, and thoughtfully curated experiences that create lasting memories for guests from around the world.
            </p>
            <p>
              With properties spanning North America, Europe, and Asia, Hanford Hotels & Resorts continues to welcome business travelers, families, dignitaries, and leisure guests through a legacy built on trust, excellence, and enduring relationships. Every destination shares the same commitment to thoughtful service, timeless elegance, and experiences that celebrate both the people and the places that make each journey unique.
            </p>
          </div>
        </div>
      </section>

      {/* Executive Leadership Section - Trevor Finn Hanford */}
      <section className="py-20 max-w-6xl mx-auto px-6 sm:px-8 my-12">
        <div className="bg-[#E8DAC1] border border-[#8C8C8C]/40 rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* CEO Portrait Column */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group">
                <a
                  href="https://id.pinterest.com/pin/1146588386407379367/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-64 sm:w-72 h-80 sm:h-96 rounded-2xl overflow-hidden border-2 border-[#C19F6A] shadow-xl relative z-10 bg-[#510F23]"
                  title="View Trevor Finn Hanford portrait on Pinterest"
                >
                  <img
                    src={trevorPhoto}
                    alt="Trevor Finn Hanford"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#510F23]/60 via-transparent to-transparent" />
                </a>
                {/* Decorative Frame Underlay */}
                <div className="absolute -bottom-4 -right-4 w-64 sm:w-72 h-80 sm:h-96 rounded-2xl border border-[#510F23]/30 bg-[#510F23]/10 z-0 hidden sm:block" />
              </div>
            </div>

            {/* CEO Bio Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-[#510F23] uppercase bg-[#510F23]/10 px-3 py-1 rounded-full border border-[#510F23]/20">
                <UserCheck className="w-3.5 h-3.5 text-[#510F23]" />
                <span>EXECUTIVE LEADERSHIP</span>
              </div>

              <div>
                <h2 className="font-serif italic text-3xl sm:text-4xl text-[#510F23] font-light">
                  Trevor Finn Hanford
                </h2>
                <p className="text-xs sm:text-sm font-bold tracking-widest text-[#C19F6A] uppercase mt-1">
                  Chief Executive Officer, Hanford Hotels & Resorts
                </p>
              </div>

              <div className="w-16 h-[1px] bg-[#C19F6A]" />

              <p className="text-sm sm:text-base text-[#1A1A1A]/85 font-light leading-relaxed">
                Trevor Finn Hanford serves as the Chief Executive Officer of Hanford Hotels & Resorts, leading the group’s vision for thoughtful hospitality, distinctive destinations, and sustainable growth. With a background that bridges science, innovation, and hospitality, Trevor brings a forward-thinking perspective to the development of Hanford’s growing portfolio of luxury hotels and eco-resorts across the world.
              </p>

              <div className="pt-2 flex items-center gap-3 text-xs font-serif italic text-[#510F23]">
                <span className="w-2 h-2 rounded-full bg-[#C19F6A]" />
                <span>Steering the global expansion of Hanford Grand Hotels & Eco Resorts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Collections Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-bold tracking-[0.4em] text-[#510F23] uppercase block mb-2">
            PORTFOLIO ARCHITECTURE
          </span>
          <h2 className="font-serif italic text-3xl sm:text-5xl text-[#510F23] font-light">
            Our Collections
          </h2>
          <p className="text-xs text-[#8C8C8C] font-light mt-2">
            Today, Hanford Hotels & Resorts operates two distinct collections tailored to every traveler.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Hanford Grand Hotel */}
          <div className="p-10 bg-[#E8DAC1] border border-[#8C8C8C]/40 rounded-2xl space-y-6 flex flex-col justify-between shadow-sm hover:border-[#C19F6A] transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full border border-[#C19F6A]/40 flex items-center justify-center text-[#C19F6A] bg-[#510F23]">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C8C8C] uppercase block">
                CITY LANDMARKS
              </span>
              <h3 className="font-serif italic text-3xl text-[#510F23] font-light">
                Hanford Grand Hotel
              </h3>
              <p className="text-xs sm:text-sm text-[#1A1A1A]/80 font-light leading-relaxed">
                A collection of luxury five-star hotels located in the world's leading cities. Positioned within prestigious business districts and cultural landmarks, each property offers refined accommodations, award-winning dining, grand event venues, wellness facilities, and personalized service for business and leisure travelers alike.
              </p>
            </div>
            <div className="pt-4 border-t border-[#8C8C8C]/30 flex items-center justify-end text-xs font-medium text-[#510F23]">
              <span className="font-mono text-[10px] uppercase text-[#8C8C8C]">5-Star Urban Luxury</span>
            </div>
          </div>

          {/* Hanford Eco Resort */}
          <div className="p-10 bg-[#E8DAC1] border border-[#8C8C8C]/40 rounded-2xl space-y-6 flex flex-col justify-between shadow-sm hover:border-[#C19F6A] transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full border border-[#C19F6A]/40 flex items-center justify-center text-[#C19F6A] bg-[#510F23]">
                <Trees className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C8C8C] uppercase block">
                NATURAL SANCTUARIES
              </span>
              <h3 className="font-serif italic text-3xl text-[#510F23] font-light">
                Hanford Eco Resort
              </h3>
              <p className="text-xs sm:text-sm text-[#1A1A1A]/80 font-light leading-relaxed">
                A collection of sustainable luxury resorts set within remarkable coastal destinations. Designed to immerse guests in nature while preserving the surrounding environment, each resort features private accommodations, locally inspired experiences, wellness programs, and unforgettable connections with the landscape.
              </p>
            </div>
            <div className="pt-4 border-t border-[#8C8C8C]/30 flex items-center justify-end text-xs font-medium text-[#510F23]">
              <span className="font-mono text-[10px] uppercase text-[#8C8C8C]">Sustainable Coastal Retreats</span>
            </div>
          </div>
        </div>

        {/* Explore Button before Our Commitment Section */}
        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigate('/locations')}
            className="px-8 py-3.5 bg-[#510F23] text-white hover:bg-[#3d0b1a] text-xs font-bold tracking-widest uppercase transition-colors rounded-full shadow-lg border border-[#C19F6A]/30 cursor-pointer"
          >
            EXPLORE OUR SANCTUARIES
          </button>
        </div>
      </section>

      {/* The Hanford Promise Banner */}
      <section className="bg-[#510F23] text-[#E8DAC1] py-20 border-y border-[#C19F6A]/30 mb-24">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <HeartHandshake className="w-10 h-10 text-[#C19F6A] mx-auto" />
          <span className="text-[10px] font-bold tracking-[0.4em] text-[#C19F6A] uppercase block">
            OUR COMMITMENT
          </span>
          <h2 className="font-serif italic text-3xl sm:text-5xl font-light text-white">
            The Hanford Promise
          </h2>
          <div className="w-16 h-[1px] bg-[#C19F6A] mx-auto" />
          <p className="font-serif italic text-lg sm:text-2xl text-[#E8DAC1]/90 leading-relaxed max-w-3xl mx-auto">
            "For more than a century, Hanford Hotels & Resorts has remained dedicated to creating places where every journey feels meaningful. From vibrant city skylines to breathtaking coastlines, every Hanford destination reflects a legacy of hospitality that continues to grow while staying true to the values on which it was founded in 1920."
          </p>
        </div>
      </section>

      {/* Legacy Honors */}
      <section className="max-w-5xl mx-auto px-6 text-center space-y-12 pb-20">
        <span className="text-[10px] font-bold tracking-[0.4em] text-[#510F23] uppercase block">
          CENTURY OF RECOGNITION
        </span>
        <h2 className="font-serif italic text-3xl sm:text-5xl font-light text-[#510F23]">
          Global Honors & Accolades
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center border-t border-b border-[#8C8C8C]/30 py-10">
          <div>
            <Award className="w-8 h-8 text-[#C19F6A] mx-auto mb-3" />
            <h4 className="font-serif italic text-lg text-[#510F23]">World Luxury Hotel Awards</h4>
            <p className="text-xs text-[#8C8C8C] font-light mt-1">Best Heritage & Luxury Resort Collection</p>
          </div>

          <div>
            <Award className="w-8 h-8 text-[#C19F6A] mx-auto mb-3" />
            <h4 className="font-serif italic text-lg text-[#510F23]">Condé Nast Traveler</h4>
            <p className="text-xs text-[#8C8C8C] font-light mt-1">Gold List Top 10 International Collections</p>
          </div>

          <div>
            <Award className="w-8 h-8 text-[#C19F6A] mx-auto mb-3" />
            <h4 className="font-serif italic text-lg text-[#510F23]">Michelin Key Guide</h4>
            <p className="text-xs text-[#8C8C8C] font-light mt-1">Recognized for Excellence in Service & Sustainability</p>
          </div>
        </div>
      </section>
    </div>
  );
};

