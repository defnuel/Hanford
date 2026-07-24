import React from 'react';
import { Award, Shield, Sparkles, Building2, Trees, History, HeartHandshake } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#E8DAC1] pt-32 pb-24 text-[#1A1A1A]">
      {/* Editorial Header */}
      <section className="max-w-5xl mx-auto px-6 text-center mb-20">
        <span className="text-[10px] font-bold tracking-[0.4em] text-[#510F23] uppercase block mb-3">
          EST. 1920 • VANCOUVER, CANADA
        </span>
        <h1 className="font-serif italic text-4xl sm:text-7xl text-[#510F23] font-light mb-6 leading-tight">
          Hanford Hotels & Resorts
        </h1>
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-[#1A1A1A]/80 font-light leading-relaxed">
          Founded in Vancouver, Canada, Hanford Hotels & Resorts began as a family-owned hospitality company with a simple belief: every guest should feel welcomed with warmth, comfort, and genuine care.
        </p>
      </section>

      {/* Main Image Banner */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mb-24">
        <div className="relative h-[480px] overflow-hidden border border-[#8C8C8C]/30 rounded-t-[160px] shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85"
            alt="Hanford Estate Architecture"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#510F23]/95 via-[#510F23]/30 to-transparent flex items-end p-8 sm:p-12">
            <div className="text-[#E8DAC1] max-w-3xl">
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#C19F6A] block mb-1">
                A CENTURY OF EXCELLENCE
              </span>
              <h2 className="font-serif italic text-2xl sm:text-4xl font-light text-white">
                Guided by four generations of the Hanford family since 1920.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage & Brand Story */}
      <section className="py-20 bg-[#E8DAC1] border-y border-[#8C8C8C]/30 mb-24">
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
            <div className="pt-4 border-t border-[#8C8C8C]/30 flex items-center justify-between text-xs font-medium text-[#510F23]">
              <span>Jakarta • Seoul</span>
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
            <div className="pt-4 border-t border-[#8C8C8C]/30 flex items-center justify-between text-xs font-medium text-[#510F23]">
              <span>Jeju • Santa Barbara • Santorini</span>
              <span className="font-mono text-[10px] uppercase text-[#8C8C8C]">Sustainable Coastal Retreats</span>
            </div>
          </div>
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
      <section className="max-w-5xl mx-auto px-6 text-center space-y-12">
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

        <div className="pt-4">
          <button
            onClick={() => onNavigate('/locations')}
            className="px-8 py-3.5 bg-[#510F23] text-white hover:bg-[#3d0b1a] text-xs font-bold tracking-widest uppercase transition-colors rounded-full shadow-lg border border-[#C19F6A]/30"
          >
            EXPLORE OUR SANCTUARIES
          </button>
        </div>
      </section>
    </div>
  );
};
