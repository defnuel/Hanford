import React from 'react';
import { Award, Shield, Sparkles, Building2, Trees, History, HeartHandshake } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#f5f2ed] pt-32 pb-24 text-[#1a1a1a]">
      {/* Editorial Header */}
      <section className="max-w-5xl mx-auto px-6 text-center mb-20">
        <span className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase block mb-3">
          EST. 1920 • VANCOUVER, CANADA
        </span>
        <h1 className="font-serif italic text-4xl sm:text-7xl text-[#1a1a1a] font-light mb-6 leading-tight">
          Hanford Hotels & Resorts
        </h1>
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-black/70 font-light leading-relaxed">
          Founded in Vancouver, Canada, Hanford Hotels & Resorts began as a family-owned hospitality company with a simple belief: every guest should feel welcomed with warmth, comfort, and genuine care.
        </p>
      </section>

      {/* Main Image Banner */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mb-24">
        <div className="relative h-[480px] overflow-hidden border border-black/10 rounded-t-[160px] shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85"
            alt="Hanford Estate Architecture"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/90 via-transparent to-transparent flex items-end p-8 sm:p-12">
            <div className="text-white max-w-3xl">
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#d6d2cc] block mb-1">
                A CENTURY OF EXCELLENCE
              </span>
              <h2 className="font-serif italic text-2xl sm:text-4xl font-light">
                Guided by four generations of the Hanford family since 1920.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage & Brand Story */}
      <section className="py-20 bg-[#e8e4de] border-y border-black/10 mb-24">
        <div className="max-w-4xl mx-auto px-6 space-y-8 text-center sm:text-left">
          <div className="text-center">
            <span className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase block mb-2">
              OUR STORY
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl text-[#1a1a1a] font-light">
              Over a Century of Timeless Hospitality
            </h2>
            <div className="w-16 h-[1px] bg-black mx-auto mt-4" />
          </div>

          <div className="space-y-6 text-black/80 font-light leading-relaxed text-sm sm:text-base">
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
          <span className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase block mb-2">
            PORTFOLIO ARCHITECTURE
          </span>
          <h2 className="font-serif italic text-3xl sm:text-5xl text-[#1a1a1a] font-light">
            Our Collections
          </h2>
          <p className="text-xs text-black/60 font-light mt-2">
            Today, Hanford Hotels & Resorts operates two distinct collections tailored to every traveler.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Hanford Grand Hotel */}
          <div className="p-10 bg-[#e8e4de] border border-black/10 rounded-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full border border-black/20 flex items-center justify-center text-[#1a1a1a] bg-[#f5f2ed]">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-black/50 uppercase block">
                CITY LANDMARKS
              </span>
              <h3 className="font-serif italic text-3xl text-[#1a1a1a] font-light">
                Hanford Grand Hotel
              </h3>
              <p className="text-xs sm:text-sm text-black/75 font-light leading-relaxed">
                A collection of luxury five-star hotels located in the world's leading cities. Positioned within prestigious business districts and cultural landmarks, each property offers refined accommodations, award-winning dining, grand event venues, wellness facilities, and personalized service for business and leisure travelers alike.
              </p>
            </div>
            <div className="pt-4 border-t border-black/10 flex items-center justify-between text-xs font-medium text-black/60">
              <span>Jakarta • Seoul</span>
              <span className="font-mono text-[10px] uppercase">5-Star Urban Luxury</span>
            </div>
          </div>

          {/* Hanford Eco Resort */}
          <div className="p-10 bg-[#e8e4de] border border-black/10 rounded-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full border border-black/20 flex items-center justify-center text-[#1a1a1a] bg-[#f5f2ed]">
                <Trees className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-black/50 uppercase block">
                NATURAL SANCTUARIES
              </span>
              <h3 className="font-serif italic text-3xl text-[#1a1a1a] font-light">
                Hanford Eco Resort
              </h3>
              <p className="text-xs sm:text-sm text-black/75 font-light leading-relaxed">
                A collection of sustainable luxury resorts set within remarkable coastal destinations. Designed to immerse guests in nature while preserving the surrounding environment, each resort features private accommodations, locally inspired experiences, wellness programs, and unforgettable connections with the landscape.
              </p>
            </div>
            <div className="pt-4 border-t border-black/10 flex items-center justify-between text-xs font-medium text-black/60">
              <span>Jeju • Santa Barbara • Santorini</span>
              <span className="font-mono text-[10px] uppercase">Sustainable Coastal Retreats</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Hanford Promise Banner */}
      <section className="bg-[#1a1a1a] text-white py-20 border-y border-black/10 mb-24">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <HeartHandshake className="w-10 h-10 text-[#d6d2cc] mx-auto" />
          <span className="text-[10px] font-bold tracking-[0.4em] text-[#d6d2cc] uppercase block">
            OUR COMMITMENT
          </span>
          <h2 className="font-serif italic text-3xl sm:text-5xl font-light">
            The Hanford Promise
          </h2>
          <div className="w-16 h-[1px] bg-[#d6d2cc] mx-auto" />
          <p className="font-serif italic text-lg sm:text-2xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
            "For more than a century, Hanford Hotels & Resorts has remained dedicated to creating places where every journey feels meaningful. From vibrant city skylines to breathtaking coastlines, every Hanford destination reflects a legacy of hospitality that continues to grow while staying true to the values on which it was founded in 1920."
          </p>
        </div>
      </section>

      {/* Legacy Honors */}
      <section className="max-w-5xl mx-auto px-6 text-center space-y-12">
        <span className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase block">
          CENTURY OF RECOGNITION
        </span>
        <h2 className="font-serif italic text-3xl sm:text-5xl font-light">
          Global Honors & Accolades
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center border-t border-b border-black/10 py-10">
          <div>
            <Award className="w-8 h-8 text-[#1a1a1a] mx-auto mb-3 opacity-80" />
            <h4 className="font-serif italic text-lg text-[#1a1a1a]">World Luxury Hotel Awards</h4>
            <p className="text-xs text-black/60 font-light mt-1">Best Heritage & Luxury Resort Collection</p>
          </div>

          <div>
            <Award className="w-8 h-8 text-[#1a1a1a] mx-auto mb-3 opacity-80" />
            <h4 className="font-serif italic text-lg text-[#1a1a1a]">Condé Nast Traveler</h4>
            <p className="text-xs text-black/60 font-light mt-1">Gold List Top 10 International Collections</p>
          </div>

          <div>
            <Award className="w-8 h-8 text-[#1a1a1a] mx-auto mb-3 opacity-80" />
            <h4 className="font-serif italic text-lg text-[#1a1a1a]">Michelin Key Guide</h4>
            <p className="text-xs text-black/60 font-light mt-1">Recognized for Excellence in Service & Sustainability</p>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={() => onNavigate('/locations')}
            className="px-8 py-3.5 bg-[#1a1a1a] text-white hover:bg-black/80 text-xs font-bold tracking-widest uppercase transition-colors rounded-full shadow-lg"
          >
            EXPLORE OUR SANCTUARIES
          </button>
        </div>
      </section>
    </div>
  );
};
