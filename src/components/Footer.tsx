import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#3A4F67] text-[#EAF2F1] border-t border-[#88B2AB]/30 pt-12 sm:pt-20 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 pb-10 sm:pb-16 border-b border-[#88B2AB]/30">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Hanford HR Logo"
                className="h-8 sm:h-9 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] sm:tracking-[0.25em] text-[#88B2AB] font-light uppercase">
                HANFORD
              </span>
            </div>
            <p className="text-xs text-[#EAF2F1] leading-relaxed font-normal">
              Hanford Hotels & Resorts has remained committed to timeless hospitality while embracing the evolving needs of modern travelers.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="text-left">
            <h4 className="text-[10px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#88B2AB] mb-3 sm:mb-4 uppercase text-left">
              Brand Navigation
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs text-[#EAF2F1] font-normal tracking-wider text-left">
              <li className="text-left">
                <button onClick={() => onNavigate('/')} className="hover:text-[#88B2AB] font-semibold transition-colors cursor-pointer text-left">
                  HOME
                </button>
              </li>
              <li className="text-left">
                <button onClick={() => onNavigate('/locations')} className="hover:text-[#88B2AB] transition-colors cursor-pointer text-left">
                  LOCATIONS
                </button>
              </li>
              <li className="text-left">
                <button onClick={() => onNavigate('/collaborations')} className="hover:text-[#88B2AB] transition-colors cursor-pointer text-left">
                  COLLABORATIONS
                </button>
              </li>
              <li className="text-left">
                <button onClick={() => onNavigate('/about')} className="hover:text-[#88B2AB] transition-colors cursor-pointer text-left">
                  ABOUT HANFORD
                </button>
              </li>
              <li className="text-left">
                <button onClick={() => onNavigate('/book-now')} className="hover:text-white transition-colors font-bold text-[#88B2AB] cursor-pointer text-left">
                  RESERVATIONS
                </button>
              </li>
            </ul>
          </div>

          {/* Global Sanctuaries */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#88B2AB] mb-3 sm:mb-4 uppercase">
              Featured Chains
            </h4>
            <ul className="space-y-2 text-xs text-[#EAF2F1] font-normal tracking-wider">
              <li>
                <strong className="font-bold text-white">Hanford Grand Hotel</strong>
              </li>
              <li>
                <strong className="font-bold text-white">Hanford Hotel & Resort</strong>
              </li>
              <li>
                <strong className="font-bold text-white">Hanford Eco Resort</strong>
              </li>
            </ul>
          </div>

          {/* Contact / Inquiries */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#88B2AB] mb-3 sm:mb-4 uppercase">
              Inquiries & Contact
            </h4>
            <p className="text-xs text-[#EAF2F1] mb-3 sm:mb-4 font-normal leading-relaxed">
              For further inquiries, contact us on X:
            </p>
            <a
              href="https://x.com/Hanford_HnR"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#51867E] text-white hover:bg-[#3f6d66] transition-colors rounded-full text-xs font-semibold tracking-wider shadow-md group"
            >
              <svg className="w-3.5 h-3.5 fill-current text-white group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>@Hanford_HnR</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#EAF2F1]/90 font-light tracking-widest gap-4 sm:gap-6 text-center md:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#88B2AB] block">GLOBAL HEADQUARTERS</span>
              <p className="text-xs font-medium uppercase tracking-tight text-[#EAF2F1]">Canada • South Korea • Indonesia</p>
            </div>
            <span className="hidden sm:inline text-[#88B2AB]/50">|</span>
            <p className="text-[#EAF2F1]">© 2026 Hanford Hotels & Resorts.</p>
          </div>
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#88B2AB] bg-[#88B2AB]/10 border border-[#88B2AB]/20 px-3 py-1.5 rounded-full">
            Only for Roleplayer Purpose
          </div>
        </div>
      </div>
    </footer>
  );
};
