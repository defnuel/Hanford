import React, { useState, useEffect } from 'react';
import { Menu, X, Compass, Calendar } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'LOCATIONS', path: '/locations' },
    { name: 'COLLABORATIONS', path: '/collaborations' },
    { name: 'ABOUT US', path: '/about' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#8C8C8C]/30 py-3.5 sm:py-5 shadow-sm'
          : 'bg-white/85 backdrop-blur-sm border-b border-[#8C8C8C]/20 py-4 sm:py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleLinkClick('/')}
          className="text-left group flex items-center gap-2.5 sm:gap-3 focus:outline-none"
        >
          <img
            src="/logo.png"
            alt="Hanford HR Logo"
            className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div className="site-logo text-xl sm:text-3xl font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#3A4F67] font-serif flex items-center gap-1.5 sm:gap-2">
            <span>Hanford</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#88B2AB]" />
          </div>
        </button>

        {/* Primary Desktop Navigation: HOME | LOCATIONS | COLLABORATIONS | ABOUT US */}
        <nav className="hidden md:flex items-center space-x-10">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.path);

            return (
              <button
                key={item.name}
                onClick={() => handleLinkClick(item.path)}
                className={`nav-link text-[11px] font-semibold tracking-widest uppercase transition-all py-1 focus:outline-none ${
                  isActive
                    ? 'text-[#51867E] border-b-2 border-[#51867E]'
                    : 'text-[#2C3744] hover:text-[#51867E]'
                }`}
              >
                {item.name}
              </button>
            );
          })}

          {/* BOOK NOW - Pantone Teal CTA Pill Button */}
          <button
            onClick={() => handleLinkClick('/book-now')}
            className="book-now-button cta-button bg-[#51867E] text-white hover:bg-[#3f6d66] px-8 py-3 rounded-full transition-all text-[11px] font-bold tracking-widest uppercase focus:outline-none shadow-md border border-[#51867E]/30 flex items-center gap-2 group cursor-pointer"
          >
            <span>Book Now</span>
            <span className="text-white group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#3A4F67] hover:opacity-60 p-2 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-[#88B2AB]/30 px-6 py-6 space-y-5 shadow-2xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.path);

              return (
                <button
                  key={item.name}
                  onClick={() => handleLinkClick(item.path)}
                  className={`nav-link text-left text-xs font-semibold tracking-[0.2em] py-3 px-3 rounded-xl uppercase transition-all flex items-center justify-between ${
                    isActive ? 'text-[#51867E] bg-[#EAF2F1] font-bold' : 'text-[#2C3744] hover:bg-gray-50'
                  }`}
                >
                  <span>{item.name}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#51867E]" />}
                </button>
              );
            })}

            {/* Mobile BOOK NOW */}
            <div className="pt-2">
              <button
                onClick={() => handleLinkClick('/book-now')}
                className="book-now-button cta-button w-full py-3 px-6 text-center text-xs font-bold tracking-[0.2em] uppercase text-white bg-[#51867E] active:bg-[#3f6d66] rounded-full shadow-md border border-[#88B2AB]/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Now</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
