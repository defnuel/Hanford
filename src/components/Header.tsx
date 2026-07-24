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
    { name: 'ABOUT', path: '/about' },
    { name: 'LOCATIONS', path: '/locations' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#E8DAC1]/95 backdrop-blur-md border-b border-[#8C8C8C]/30 py-5 shadow-sm'
          : 'bg-[#E8DAC1]/85 backdrop-blur-sm border-b border-[#8C8C8C]/20 py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleLinkClick('/')}
          className="text-left group flex items-center gap-3 focus:outline-none"
        >
          <div className="text-2xl sm:text-3xl font-light tracking-[0.3em] uppercase text-[#510F23] font-serif flex items-center gap-2">
            <span>Hanford</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C19F6A]" />
          </div>
        </button>

        {/* Primary Desktop Navigation: HOME | ABOUT | LOCATIONS | BOOK NOW */}
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
                className={`text-[11px] font-semibold tracking-widest uppercase transition-all py-1 focus:outline-none ${
                  isActive
                    ? 'text-[#510F23] border-b-2 border-[#510F23]'
                    : 'text-[#1A1A1A]/80 hover:text-[#510F23]'
                }`}
              >
                {item.name}
              </button>
            );
          })}

          {/* BOOK NOW - Deep Burgundy Pill Button */}
          <button
            onClick={() => handleLinkClick('/book-now')}
            className="bg-[#510F23] text-white hover:bg-[#3d0b1a] px-8 py-3 rounded-full transition-all text-[11px] font-semibold tracking-widest uppercase focus:outline-none shadow-md border border-[#C19F6A]/30 flex items-center gap-2 group"
          >
            <span>Book Now</span>
            <span className="text-[#C19F6A] group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#510F23] hover:opacity-60 p-2 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#E8DAC1] border-b border-[#8C8C8C]/30 px-6 py-8 space-y-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.path);

              return (
                <button
                  key={item.name}
                  onClick={() => handleLinkClick(item.path)}
                  className={`text-left text-xs font-semibold tracking-widest py-2 border-b border-[#8C8C8C]/20 uppercase ${
                    isActive ? 'text-[#510F23] font-bold' : 'text-[#1A1A1A]/80'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}

            {/* Mobile BOOK NOW */}
            <button
              onClick={() => handleLinkClick('/book-now')}
              className="mt-4 w-full py-3.5 px-6 text-center text-xs font-semibold tracking-widest uppercase text-white bg-[#510F23] rounded-full hover:bg-[#3d0b1a] border border-[#C19F6A]/40 transition-colors"
            >
              BOOK NOW
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
