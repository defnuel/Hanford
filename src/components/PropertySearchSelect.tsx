import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronDown, X, ArrowRight, Check } from 'lucide-react';
import { Property } from '../types';

interface PropertySearchSelectProps {
  properties: Property[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  disabled?: boolean;
}

export const PropertySearchSelect: React.FC<PropertySearchSelectProps> = ({
  properties,
  selectedSlug,
  onSelect,
  disabled = false,
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
          className={`w-full pl-11 pr-20 py-3 bg-white border border-[#88B2AB]/40 rounded-full text-xs text-[#2C3744] placeholder-[#4A5568] focus:outline-none focus:border-[#51867E] focus:ring-2 focus:ring-[#51867E]/20 font-medium transition-all shadow-xs ${
            disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-text'
          }`}
        />

        <div className="absolute right-3 flex items-center gap-1.5 z-10">
          {(inputValue || selectedProperty) && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors cursor-pointer"
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
            className="p-1 rounded-full text-[#51867E] hover:bg-gray-100 transition-colors cursor-pointer"
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
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#88B2AB]/40 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header info bar */}
          <div className="px-4 py-2.5 border-b border-[#88B2AB]/20 bg-[#EAF2F1]/60 flex items-center justify-between text-[10.5px] font-bold text-[#3A4F67] uppercase tracking-wider">
            <span>Matched Sanctuaries ({filteredProperties.length})</span>
            <span className="text-[9.5px] text-[#51867E] font-medium lowercase italic">click location to select</span>
          </div>

          {/* Properties List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#88B2AB]/15 p-1.5">
            {filteredProperties.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#2C3744] space-y-1">
                <MapPin className="w-6 h-6 text-[#51867E] mx-auto opacity-70" />
                <p className="font-bold text-[#3A4F67]">No locations found</p>
                <p className="text-[11px] text-gray-500">
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
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF2F1] border border-[#88B2AB]/40 shadow-2xs'
                        : 'hover:bg-[#EAF2F1]/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Property Thumbnail */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 bg-[#3A4F67] border border-[#88B2AB]/30 shadow-xs">
                        <img
                          src={property.heroImage}
                          alt={property.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Property Info */}
                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-bold text-xs sm:text-sm transition-colors truncate ${
                            isSelected ? 'text-[#51867E]' : 'text-[#2C3744] group-hover:text-[#51867E]'
                          }`}
                        >
                          {property.name}
                        </div>
                        <div className="text-[10.5px] sm:text-[11px] text-[#51867E] font-medium flex items-center gap-1.5 flex-wrap truncate mt-0.5">
                          <span className="font-semibold">📍 {property.country}</span>
                          <span className="text-gray-300 font-light">•</span>
                          <span className="text-[#3A4F67] font-normal">{property.continent}</span>
                          {startPrice ? (
                            <>
                              <span className="text-gray-300 font-light">•</span>
                              <span className="text-[#2C3744] font-bold">From ${startPrice.toLocaleString()} / night</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Action badge */}
                    {isSelected ? (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-wider shrink-0 bg-[#51867E] px-3 py-1.5 rounded-full border border-[#51867E] shadow-xs">
                        <Check className="w-3 h-3" />
                        <span>Selected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#51867E] uppercase tracking-wider shrink-0 bg-white px-3 py-1.5 rounded-full border border-[#88B2AB]/30 group-hover:bg-[#51867E] group-hover:text-white transition-all shadow-xs">
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
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
