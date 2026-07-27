import React, { useEffect, useState, useMemo } from 'react';
import { Property } from '../types';
import { fetchLocations } from '../services/dataService';
import { Search, MapPin, ExternalLink, ArrowRight } from 'lucide-react';

interface LocationsPageProps {
  onNavigate: (path: string) => void;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({ onNavigate }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'google_sheets' | 'mock_fallback'>('mock_fallback');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');

  const loadProperties = async () => {
    setLoading(true);
    const response = await fetchLocations();
    setProperties(response.data);
    setDataSource(response.source);
    setLoading(false);
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Filter logic
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesContinent =
        selectedContinent === 'All' || p.continent.toLowerCase() === selectedContinent.toLowerCase();

      return matchesSearch && matchesContinent;
    });
  }, [properties, searchQuery, selectedContinent]);

  const continents = ['All', 'Asia', 'Europe', 'America', 'Australia'];

  return (
    <div className="bg-[#FFFFFF] text-[#2C3744] pt-24 sm:pt-32 pb-16 sm:pb-24 min-h-screen">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mb-8 sm:mb-12">
        <div className="border-b border-[#88B2AB]/30 pb-6 sm:pb-8">
          <div>
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#51867E] mb-1.5 sm:mb-2">
              <span>GLOBAL FOOTPRINT</span>
            </div>
            <h1 className="font-serif italic text-3xl sm:text-6xl text-[#3A4F67] font-light">
              Sanctuaries & Destinations
            </h1>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mb-8 sm:mb-12">
        <div className="bg-[#EAF2F1] p-4 sm:p-6 border border-[#88B2AB]/30 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6 shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#3A4F67]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by property name, tagline, or country..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#88B2AB]/30 rounded-full text-xs text-[#2C3744] placeholder-[#4A5568] focus:outline-none focus:border-[#51867E] font-medium"
            />
          </div>

          {/* Continent Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-[#3A4F67] uppercase shrink-0">
              Continent:
            </span>
            <div className="flex flex-wrap gap-1">
              {continents.map((continent) => (
                <button
                  key={continent}
                  onClick={() => setSelectedContinent(continent)}
                  className={`px-3 py-1 text-xs font-bold rounded-full tracking-wider transition-colors cursor-pointer ${
                    selectedContinent === continent
                      ? 'bg-[#51867E] text-white'
                      : 'bg-white text-[#2C3744] hover:bg-[#51867E]/10 border border-[#88B2AB]/30'
                  }`}
                >
                  {continent}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Locations Directory Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 sm:h-96 bg-[#EAF2F1] animate-pulse rounded-t-[40px] sm:rounded-t-[50px]" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl p-8 sm:p-16 text-center space-y-4 shadow-sm">
            <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-[#51867E] mx-auto" />
            <h3 className="font-serif italic text-xl sm:text-2xl text-[#3A4F67]">No Sanctuaries Matched</h3>
            <p className="text-xs text-[#2C3744]/80 max-w-md mx-auto font-light">
              No Hanford properties found matching your search criteria. Try selecting another continent or clearing filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedContinent('All');
              }}
              className="px-6 py-2.5 bg-[#51867E] text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#3f6d66] transition-colors border border-[#88B2AB]/30 cursor-pointer"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {filteredProperties.map((property) => {
              const isLive = property.status === 'Live' || property.status === 'Active';

              return (
                <div
                  key={property.id}
                  className="bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-t-[40px] sm:rounded-t-[60px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group hover:border-[#51867E]"
                >
                  {/* Property Hero Image */}
                  <div
                    onClick={() => isLive && onNavigate(`/locations/${property.slug}`)}
                    className={`relative h-48 sm:h-64 overflow-hidden bg-[#3A4F67] ${
                      isLive ? 'cursor-pointer' : ''
                    }`}
                  >
                    <img
                      src={property.heroImage}
                      alt={property.name}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        isLive ? 'group-hover:scale-105 opacity-90 group-hover:opacity-100' : 'opacity-60 grayscale-[30%]'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    {/* Upper Middle Badges (Country & Status) */}
                    <div className="absolute top-3 sm:top-4 inset-x-0 flex items-center justify-center gap-1.5 sm:gap-2 z-10 px-3 sm:px-4 pointer-events-none">
                      <span className="bg-[#3A4F67]/95 backdrop-blur-md text-[#EAF2F1] px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase rounded-full border border-[#88B2AB]/40 shadow-md whitespace-nowrap">
                        {property.country}
                      </span>
                      <span
                        className={`px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase rounded-full border shadow-md whitespace-nowrap ${
                          isLive
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30'
                            : 'bg-[#3A4F67]/90 text-[#88B2AB] border-[#88B2AB]/30'
                        }`}
                      >
                        {isLive ? 'LIVE' : 'COMING SOON'}
                      </span>
                    </div>

                    {/* Continent / Country Pill */}
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between text-white text-[11px] font-medium tracking-wider pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 bg-[#3A4F67]/90 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#EAF2F1] truncate max-w-full">
                        <MapPin className="w-3 h-3 text-[#88B2AB] shrink-0" />
                        <span className="truncate">{property.address}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-8 flex-1 flex flex-col justify-between space-y-4 sm:space-y-6">
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.25em] text-[#3A4F67] uppercase block mb-1">
                        {property.continent} • {property.country}
                      </span>
                      <h3
                        onClick={() => isLive && onNavigate(`/locations/${property.slug}`)}
                        className={`font-serif italic text-xl sm:text-2xl text-[#3A4F67] hover:text-[#51867E] transition-colors mb-2 ${
                          isLive ? 'cursor-pointer' : ''
                        }`}
                      >
                        {property.name}
                      </h3>
                      <p className="text-xs text-[#2C3744] font-light leading-relaxed italic">
                        "{property.tagline}"
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-[#88B2AB]/30 flex items-center justify-between">
                      {isLive ? (
                        <button
                          onClick={() => onNavigate(`/locations/${property.slug}`)}
                          className="w-full py-3 bg-[#51867E] text-white hover:bg-[#3f6d66] rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 border border-[#88B2AB]/30 group cursor-pointer"
                        >
                          <span>VIEW SANCTUARY</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-3 bg-[#3A4F67]/15 text-[#3A4F67] rounded-full text-[10px] font-bold tracking-[0.2em] uppercase cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <span>COMING SOON</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
