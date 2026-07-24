import React from 'react';
import { DataIntegrationBadge } from './DataIntegrationBadge';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#f5f2ed] text-[#1a1a1a] border-t border-black/10 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-black/10">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-serif text-3xl tracking-[0.25em] text-[#1a1a1a] font-light uppercase">
                HANFORD
              </span>
            </div>
            <p className="text-xs text-black/70 leading-relaxed font-light">
              Hanford Hotels & Resorts has remained committed to timeless hospitality while embracing the evolving needs of modern travelers.
            </p>
            <div className="pt-2">
              <DataIntegrationBadge />
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] text-[#1a1a1a] mb-4 uppercase opacity-60">
              Brand Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-black/70 font-light tracking-wider">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-black font-medium transition-colors">
                  HOME
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-black transition-colors">
                  ABOUT HANFORD
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/locations')} className="hover:text-black transition-colors">
                  LOCATIONS & SANCTUARIES
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/book-now')} className="hover:text-black transition-colors font-bold text-[#1a1a1a]">
                  RESERVATIONS & INQUIRIES
                </button>
              </li>
            </ul>
          </div>

          {/* Global Sanctuaries */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] text-[#1a1a1a] mb-4 uppercase opacity-60">
              Featured Locations
            </h4>
            <ul className="space-y-2 text-xs text-black/70 font-light tracking-wider">
              <li>
                <strong className="font-semibold text-[#1a1a1a]">Hanford Eco Resort</strong> — Jeju, South Korea
              </li>
              <li>
                <strong className="font-semibold text-[#1a1a1a]">Hanford Eco Resort</strong> — Santa Barbara, USA
              </li>
              <li>
                <strong className="font-semibold text-[#1a1a1a]">Hanford Eco Resort</strong> — Santorini, Greece
              </li>
              <li>
                <strong className="font-semibold text-[#1a1a1a]">Hanford Grand Hotel</strong> — Jakarta, Indonesia
              </li>
              <li>
                <strong className="font-semibold text-[#1a1a1a]">Hanford Grand Hotel</strong> — Seoul, South Korea
              </li>
            </ul>
          </div>

          {/* Contact / Inquiries */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] text-[#1a1a1a] mb-4 uppercase opacity-60">
              Inquiries & Contact
            </h4>
            <p className="text-xs text-black/70 mb-4 font-light leading-relaxed">
              For further inquiries, contact us on X:
            </p>
            <a
              href="https://x.com/Hanford_HnR"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#1a1a1a] text-white hover:bg-black/80 transition-colors rounded-full text-xs font-medium tracking-wider shadow-sm group"
            >
              <svg className="w-3.5 h-3.5 fill-current text-white group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>@Hanford_HnR</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-black/60 font-light tracking-widest gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-center sm:text-left">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-50 block">GLOBAL HEADQUARTERS</span>
              <p className="text-xs font-medium uppercase tracking-tighter text-[#1a1a1a]">Canada • South Korea • Indonesia</p>
            </div>
            <span className="hidden sm:inline text-black/20">|</span>
            <p>© {new Date().getFullYear()} Hanford Hotels & Resorts.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
