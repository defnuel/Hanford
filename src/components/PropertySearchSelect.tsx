import React, { useState, useRef, useEffect } from 'react';
import { Search, Building2, ChevronDown, Check, X, MapPin } from 'lucide-react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected property object
  const selectedProperty = properties.find((p) => p.slug === selectedSlug);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter properties by search query (matches name, country, address, or continent)
  const filteredProperties = properties.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(query);
    const countryMatch = p.country?.toLowerCase().includes(query);
    const addressMatch = p.address?.toLowerCase().includes(query);
    const continentMatch = p.continent?.toLowerCase().includes(query);
    return nameMatch || countryMatch || addressMatch || continentMatch;
  });

  const getFormattedLabel = (p: Property) => {
    if (p.country) {
      return `${p.name}, ${p.country}`;
    }
    return p.name;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full px-4 sm:px-5 py-2.5 sm:py-3.5 bg-white border rounded-full text-xs text-left font-semibold transition-all flex items-center justify-between gap-2 shadow-xs cursor-pointer select-none ${
          isOpen
            ? 'border-[#51867E] ring-2 ring-[#51867E]/20 text-[#2C3744]'
            : 'border-[#88B2AB]/40 hover:border-[#51867E] text-[#2C3744]'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden truncate">
          <Building2 className="w-4 h-4 text-[#51867E] shrink-0" />
          {selectedProperty ? (
            <span className="truncate text-[#2C3744]">
              <span className="font-bold">{selectedProperty.name}</span>
              {selectedProperty.country && (
                <span className="text-[#51867E] font-medium">, {selectedProperty.country}</span>
              )}
            </span>
          ) : (
            <span className="text-gray-400 font-normal">-- Select Hotel / Resort Location --</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedProperty && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onSelect('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onSelect('');
                }
              }}
              className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors inline-flex items-center justify-center cursor-pointer"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[#51867E] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Searchable Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#88B2AB]/40 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box Header */}
          <div className="p-2.5 border-b border-[#88B2AB]/20 bg-[#EAF2F1]/30">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#51867E] absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hotel name or country (e.g., Greece, Jakarta)..."
                className="w-full pl-8 pr-8 py-2 bg-white border border-[#88B2AB]/40 rounded-xl text-xs text-[#2C3744] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#51867E] focus:ring-1 focus:ring-[#51867E]/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 sm:max-h-72 overflow-y-auto divide-y divide-[#88B2AB]/10 p-1">
            {filteredProperties.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500 space-y-1">
                <MapPin className="w-5 h-5 text-gray-400 mx-auto" />
                <p className="font-semibold text-[#3A4F67]">No hotels or resorts found</p>
                <p className="text-[11px] text-gray-400">
                  Try searching for a different country or hotel name.
                </p>
              </div>
            ) : (
              filteredProperties.map((p) => {
                const isSelected = p.slug === selectedSlug;
                return (
                  <button
                    key={p.id || p.slug}
                    type="button"
                    onClick={() => {
                      onSelect(p.slug);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#51867E] text-white font-semibold'
                        : 'hover:bg-[#EAF2F1]/60 text-[#2C3744]'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className={`text-xs ${isSelected ? 'font-bold text-white' : 'font-semibold text-[#2C3744]'}`}>
                        {p.name}
                      </span>
                      {p.country && (
                        <span className={`text-[10.5px] ${isSelected ? 'text-[#EAF2F1]' : 'text-[#51867E] font-medium'}`}>
                          📍 {p.country}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-white shrink-0" />
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
