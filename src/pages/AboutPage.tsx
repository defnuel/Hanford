import React, { useState, useEffect } from 'react';
import { Award, Building2, Trees, HeartHandshake, Sparkles, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { fetchLocations } from '../services/dataService';
import { Property } from '../types';

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
    <div className="bg-[#FFFFFF] text-[#2C3744]">
      {/* Full Picture Gallery Slide Hero Header */}
      <section className="relative w-full min-h-[70vh] sm:min-h-[85vh] bg-[#3A4F67] text-white flex flex-col justify-between overflow-hidden pt-20 sm:pt-28 pb-6 sm:pb-8 border-b border-[#88B2AB]/30">
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
              <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B]/90 via-[#2C3744]/75 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/95 via-[#2C3744]/50 to-black/40" />
            </div>
          ))}
        </div>

        {/* Hero Text Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center my-auto py-8 sm:py-12">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-[#1E293B]/90 backdrop-blur-md border border-[#88B2AB]/60 rounded-full shadow-lg mb-4 sm:mb-6">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#88B2AB]" />
            <span className="text-[9px] sm:text-[11px] font-bold tracking-[0.25em] sm:tracking-[0.35em] uppercase text-white">
              EST. 1920 • VANCOUVER, CANADA
            </span>
          </div>

          <h1 className="font-serif italic text-2xl sm:text-5xl lg:text-6xl text-white font-light mb-4 sm:mb-6 leading-tight drop-shadow-md">
            Hanford Hotels & Resorts
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-lg text-white font-normal leading-relaxed drop-shadow-md">
            A tradition of warmth, elegance, and genuine hospitality to create unforgettable stays.
          </p>
        </div>

        {/* Bottom Gallery Slide Indicators & Controls */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full flex items-center justify-between border-t border-[#88B2AB]/30 pt-3 sm:pt-4">
          <span className="text-xs font-serif italic text-[#88B2AB] hidden sm:block">
            {activeSlide.title} • {activeSlide.caption}
          </span>

          <div className="flex items-center gap-2 mx-auto sm:mx-0 overflow-x-auto max-w-full py-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide ? 'w-8 bg-[#88B2AB]' : 'w-2 bg-[#EAF2F1]/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 hidden sm:flex">
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
              className="w-8 h-8 rounded-full bg-[#3A4F67]/90 border border-[#88B2AB]/60 text-[#EAF2F1] hover:bg-[#51867E] hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="w-8 h-8 rounded-full bg-[#3A4F67]/90 border border-[#88B2AB]/60 text-[#EAF2F1] hover:bg-[#51867E] hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Heritage & Brand Story */}
      <section className="py-12 sm:py-20 bg-[#EAF2F1] border-b border-[#88B2AB]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 text-center sm:text-left">
          <div className="text-center">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] text-[#51867E] uppercase block mb-1.5 sm:mb-2">
              OUR STORY
            </span>
            <h2 className="font-serif italic text-2xl sm:text-5xl text-[#3A4F67] font-light">
              Over a Century of Timeless Hospitality
            </h2>
            <div className="w-12 sm:w-16 h-[1px] bg-[#51867E] mx-auto mt-3 sm:mt-4" />
          </div>

          <div className="space-y-4 sm:space-y-6 text-[#2C3744] font-light leading-relaxed text-xs sm:text-base">
            <p>
              A tradition of warmth, elegance, and genuine hospitality to create unforgettable stays. What started as a single grand hotel has grown over more than a century into an international collection of luxury hotels and destination resorts, guided by four generations of the Hanford family.
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
      <section className="py-10 sm:py-20 max-w-6xl mx-auto px-4 sm:px-8 my-6 sm:my-12">
        <div className="bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-3xl p-6 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
            {/* CEO Portrait Column */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group">
                <a
                  href="https://drive.google.com/file/d/14KNJPGrt7V0li_E4_-HOqpyODonQy0zX/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-56 sm:w-72 h-72 sm:h-96 rounded-2xl overflow-hidden border-2 border-[#88B2AB] shadow-xl relative z-10 bg-[#3A4F67]"
                  title="View Trevor Finn Hanford portrait on Google Drive"
                >
                  <img
                    src="https://lh3.googleusercontent.com/d/14KNJPGrt7V0li_E4_-HOqpyODonQy0zX"
                    alt="Trevor Finn Hanford"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3A4F67]/60 via-transparent to-transparent" />
                </a>
                {/* Decorative Frame Underlay */}
                <div className="absolute -bottom-4 -right-4 w-56 sm:w-72 h-72 sm:h-96 rounded-2xl border border-[#3A4F67]/30 bg-[#3A4F67]/10 z-0 hidden sm:block" />
              </div>
            </div>

            {/* CEO Bio Column */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#51867E] uppercase bg-[#51867E]/10 px-3 py-1 rounded-full border border-[#51867E]/20">
                <UserCheck className="w-3.5 h-3.5 text-[#51867E]" />
                <span>EXECUTIVE LEADERSHIP</span>
              </div>

              <div>
                <h2 className="font-serif italic text-2xl sm:text-4xl text-[#3A4F67] font-light">
                  Trevor Finn Hanford
                </h2>
                <p className="text-xs sm:text-sm font-bold tracking-widest text-[#51867E] uppercase mt-1">
                  Chief Executive Officer, Hanford Hotels & Resorts
                </p>
              </div>

              <div className="w-12 sm:w-16 h-[1px] bg-[#88B2AB] mx-auto lg:mx-0" />

              <p className="text-xs sm:text-base text-[#2C3744] font-light leading-relaxed">
                Trevor Finn Hanford serves as the Chief Executive Officer of Hanford Hotels & Resorts, leading the group’s vision for thoughtful hospitality, distinctive destinations, and sustainable growth. With a background that bridges science, innovation, and hospitality, Trevor brings a forward-thinking perspective to the development of Hanford’s growing portfolio of luxury hotels and eco-resorts across the world.
              </p>

              <div className="pt-2 flex items-center justify-center lg:justify-start gap-3 text-xs font-serif italic text-[#3A4F67]">
                <span className="w-2 h-2 rounded-full bg-[#88B2AB] shrink-0" />
                <span>Steering the global expansion of Hanford Grand Hotels & Eco Resorts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Collections Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mb-16 sm:mb-24">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] text-[#51867E] uppercase block mb-1.5 sm:mb-2">
            PORTFOLIO ARCHITECTURE
          </span>
          <h2 className="font-serif italic text-2xl sm:text-5xl text-[#3A4F67] font-light">
            Our Collections
          </h2>
          <p className="text-xs text-[#2C3744] font-medium mt-1.5 sm:mt-2">
            Today, Hanford Hotels & Resorts operates two distinct collections tailored to every traveler.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
          {/* Hanford Grand Hotel */}
          <div className="p-6 sm:p-10 bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl space-y-4 sm:space-y-6 flex flex-col justify-between shadow-sm hover:border-[#51867E] transition-colors">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#88B2AB]/40 flex items-center justify-center text-[#88B2AB] bg-[#51867E]">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.25em] text-[#3A4F67] uppercase block">
                CITY LANDMARKS
              </span>
              <h3 className="font-serif italic text-2xl sm:text-3xl text-[#3A4F67] font-light">
                Hanford Grand Hotel
              </h3>
              <p className="text-xs sm:text-sm text-[#2C3744] font-light leading-relaxed">
                A collection of luxury five-star hotels located in the world's leading cities. Positioned within prestigious business districts and cultural landmarks, each property offers refined accommodations, award-winning dining, grand event venues, wellness facilities, and personalized service for business and leisure travelers alike.
              </p>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-[#88B2AB]/20 flex items-center justify-end text-xs font-medium text-[#3A4F67]">
              <span className="font-mono text-[10px] uppercase text-[#3A4F67] font-semibold">5-Star Urban Luxury</span>
            </div>
          </div>

          {/* Hanford Eco Resort */}
          <div className="p-6 sm:p-10 bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl space-y-4 sm:space-y-6 flex flex-col justify-between shadow-sm hover:border-[#51867E] transition-colors">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#88B2AB]/40 flex items-center justify-center text-[#88B2AB] bg-[#51867E]">
                <Trees className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.25em] text-[#3A4F67] uppercase block">
                NATURAL SANCTUARIES
              </span>
              <h3 className="font-serif italic text-2xl sm:text-3xl text-[#3A4F67] font-light">
                Hanford Eco Resort
              </h3>
              <p className="text-xs sm:text-sm text-[#2C3744] font-light leading-relaxed">
                A collection of sustainable luxury resorts set within remarkable coastal destinations. Designed to immerse guests in nature while preserving the surrounding environment, each resort features private accommodations, locally inspired experiences, wellness programs, and unforgettable connections with the landscape.
              </p>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-[#88B2AB]/20 flex items-center justify-end text-xs font-medium text-[#3A4F67]">
              <span className="font-mono text-[10px] uppercase text-[#3A4F67] font-semibold">Sustainable Coastal Retreats</span>
            </div>
          </div>
        </div>

        {/* Explore Button before Our Commitment Section */}
        <div className="mt-8 sm:mt-12 text-center">
          <button
            onClick={() => onNavigate('/locations')}
            className="px-6 sm:px-8 py-3 sm:py-3.5 bg-[#51867E] text-white hover:bg-[#3f6d66] text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors rounded-full shadow-lg border border-[#88B2AB]/30 cursor-pointer"
          >
            EXPLORE OUR SANCTUARIES
          </button>
        </div>
      </section>

      {/* The Hanford Promise Banner */}
      <section className="bg-[#3A4F67] text-[#EAF2F1] py-12 sm:py-20 border-y border-[#88B2AB]/30 mb-16 sm:mb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <HeartHandshake className="w-8 h-8 sm:w-10 sm:h-10 text-[#88B2AB] mx-auto" />
          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] text-[#88B2AB] uppercase block">
            OUR COMMITMENT
          </span>
          <h2 className="font-serif italic text-2xl sm:text-5xl font-light text-white">
            The Hanford Promise
          </h2>
          <div className="w-12 sm:w-16 h-[1px] bg-[#88B2AB] mx-auto" />
          <p className="font-serif italic text-base sm:text-2xl text-white font-normal leading-relaxed max-w-3xl mx-auto drop-shadow-sm">
            "For more than a century, Hanford Hotels & Resorts has remained dedicated to creating places where every journey feels meaningful. From vibrant city skylines to breathtaking coastlines, every Hanford destination reflects a legacy of hospitality that continues to grow while staying true to the values on which it was founded in 1920."
          </p>
        </div>
      </section>

      {/* Legacy Honors */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 sm:space-y-12 pb-12 sm:pb-20">
        <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] text-[#51867E] uppercase block">
          CENTURY OF RECOGNITION
        </span>
        <h2 className="font-serif italic text-2xl sm:text-5xl font-light text-[#3A4F67]">
          Global Honors & Accolades
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center border-t border-b border-[#88B2AB]/30 py-8 sm:py-10">
          <div>
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-[#51867E] mx-auto mb-2 sm:mb-3" />
            <h4 className="font-serif italic text-base sm:text-lg text-[#3A4F67]">World Luxury Hotel Awards</h4>
            <p className="text-xs text-[#2C3744] font-medium mt-1">Best Heritage & Luxury Resort Collection</p>
          </div>

          <div>
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-[#51867E] mx-auto mb-2 sm:mb-3" />
            <h4 className="font-serif italic text-base sm:text-lg text-[#3A4F67]">Condé Nast Traveler</h4>
            <p className="text-xs text-[#2C3744] font-medium mt-1">Gold List Top 10 International Collections</p>
          </div>

          <div>
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-[#51867E] mx-auto mb-2 sm:mb-3" />
            <h4 className="font-serif italic text-base sm:text-lg text-[#3A4F67]">Michelin Key Guide</h4>
            <p className="text-xs text-[#2C3744] font-medium mt-1">Recognized for Excellence in Service & Sustainability</p>
          </div>
        </div>
      </section>
    </div>
  );
};

