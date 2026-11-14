import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronDown, X, Check } from 'lucide-react';
import { Property } from '../types';

interface PropertySearchSelectProps {
  properties: Property[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  disabled?: boolean;
  hidePrice?: boolean;
}

export const PropertySearchSelect: React.FC<PropertySearchSelectProps> = ({
  properties,
  selectedSlug,
  onSelect,
  disabled = false,
  hidePrice = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected property
  const selectedProperty = properties.find((p) => p.slug === selectedSlug);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsTyping(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsTyping(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter properties by search query (name, country, address, continent, or tagline)
  const filteredProperties = properties.filter((p) => {
    if (!isTyping || !searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(query) ||
      p.country.toLowerCase().includes(query) ||
      p.continent.toLowerCase().includes(query) ||
      p.tagline.toLowerCase().includes(query) ||
      (p.address && p.address.toLowerCase().includes(query))
    );
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery('');
    setIsTyping(false);
    onSelect('');
    setIsOpen(true);
    searchInputRef.current?.focus();
  };

  const inputValue = isTyping
    ? searchQuery
    : selectedProperty
    ? `${selectedProperty.name}${selectedProperty.country ? `, ${selectedProperty.country}` : ''}`
    : searchQuery;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Search Input Box with identical style to Our Locations */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-4 text-[#51867E] pointer-events-none z-10" />
        <input
          ref={searchInputRef}
          type="text"
          value={inputValue}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
            }
          }}
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
            }
          }}
          onChange={(e) => {
            if (!disabled) {
              setIsTyping(true);
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }
          }}
          placeholder="Search location by property name, country, or city..."
          disabled={disabled}
          className={`w-full pl-11 pr-20 py-3 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#51867E] focus:ring-2 focus:ring-[#51867E]/20 font-medium transition-all shadow-2xs ${
            disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'cursor-text'
          }`}
        />

        <div className="absolute right-3 flex items-center gap-1.5 z-10">
          {(inputValue || selectedProperty) && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear search or selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) {
                setIsOpen(!isOpen);
                if (!isOpen) {
                  searchInputRef.current?.focus();
                }
              }
            }}
            className="p-1 rounded-full text-[#51867E] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Dropdown Results List with identical style to Our Locations */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header info bar */}
          <div className="px-4 py-2.5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between text-[10.5px] font-bold text-[#3A4F67] uppercase tracking-wider">
            <span>Matched Sanctuaries ({filteredProperties.length})</span>
            <span className="text-[9.5px] text-[#51867E] font-medium lowercase italic">click location to select</span>
          </div>

          {/* Properties List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1.5">
            {filteredProperties.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-700 space-y-1">
                <MapPin className="w-6 h-6 text-[#51867E] mx-auto opacity-70" />
                <p className="font-bold text-[#3A4F67]">No locations found</p>
                <p className="text-[11px] text-slate-500">
                  Try searching for a different country or hotel name (e.g. "Greece", "Jeju", "Jakarta").
                </p>
              </div>
            ) : (
              filteredProperties.map((property) => {
                const isSelected = property.slug === selectedSlug;
                const startPrice = property.priceStandard || property.priceFrom;

                return (
                  <button
                    key={property.id || property.slug}
                    type="button"
                    onClick={() => {
                      onSelect(property.slug);
                      setIsOpen(false);
                      setIsTyping(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2.5 group cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100/80 border border-slate-200 shadow-2xs'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Compact Property Thumbnail */}
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[#3A4F67] border border-slate-200 shadow-2xs mt-0.5">
                        <img
                          src={property.heroImage}
                          alt={property.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Property Info with clean word wrap */}
                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-bold text-xs sm:text-[13px] whitespace-normal break-words leading-snug transition-colors ${
                            isSelected ? 'text-[#51867E]' : 'text-[#2C3744] group-hover:text-[#51867E]'
                          }`}
                        >
                          {property.name}
                        </div>
                        <div className="text-[10.5px] text-[#51867E] font-medium flex items-center gap-1.5 flex-wrap leading-snug mt-0.5">
                          <span className="font-semibold">📍 {property.country}</span>
                          <span className="text-gray-300 font-light">•</span>
                          <span className="text-[#3A4F67] font-normal">{property.continent}</span>
                          {!hidePrice && startPrice ? (
                            <>
                              <span className="text-gray-300 font-light">•</span>
                              <span className="text-[#2C3744] font-bold">From ${startPrice.toLocaleString()} / night</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#51867E] shrink-0 mt-1" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
