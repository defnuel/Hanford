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
  const [selectedStatus, setSelectedStatus] = useState('All');

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

      const isLiveProperty = p.status === 'Live' || p.status === 'Active';
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Live' && isLiveProperty) ||
        (selectedStatus === 'Coming Soon' && p.status === 'Coming Soon');

      return matchesSearch && matchesContinent && matchesStatus;
    });
  }, [properties, searchQuery, selectedContinent, selectedStatus]);

  const continents = ['All', 'Asia', 'Europe', 'America', 'Australia'];
  const statuses = ['All', 'Live', 'Coming Soon'];

  return (
    <div className="bg-[#E8DAC1] text-[#1A1A1A] pt-32 pb-24 min-h-screen">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mb-12">
        <div className="border-b border-[#8C8C8C]/30 pb-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.4em] uppercase text-[#510F23] mb-2">
              <span>GLOBAL FOOTPRINT</span>
            </div>
            <h1 className="font-serif italic text-4xl sm:text-6xl text-[#510F23] font-light">
              Sanctuaries & Destinations
            </h1>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mb-12">
        <div className="bg-[#E8DAC1] p-6 border border-[#8C8C8C]/40 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by property name, tagline, or country..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#FAF8F5] border border-[#8C8C8C]/30 rounded-full text-xs text-[#1A1A1A] placeholder-[#8C8C8C] focus:outline-none focus:border-[#510F23]"
            />
          </div>

          {/* Continent Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-[#8C8C8C] uppercase">
              Continent:
            </span>
            <div className="flex flex-wrap gap-1">
              {continents.map((continent) => (
                <button
                  key={continent}
                  onClick={() => setSelectedContinent(continent)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full tracking-wider transition-colors ${
                    selectedContinent === continent
                      ? 'bg-[#510F23] text-white'
                      : 'bg-[#FAF8F5] text-[#1A1A1A] hover:bg-[#510F23]/10 border border-[#8C8C8C]/20'
                  }`}
                >
                  {continent}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-[#8C8C8C] uppercase">
              Status:
            </span>
            <div className="flex gap-1">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full tracking-wider transition-colors ${
                    selectedStatus === status
                      ? 'bg-[#510F23] text-white'
                      : 'bg-[#FAF8F5] text-[#1A1A1A] hover:bg-[#510F23]/10 border border-[#8C8C8C]/20'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Locations Directory Grid */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-[#dcd0b8] animate-pulse rounded-t-[100px]" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-[#E8DAC1] border border-[#8C8C8C]/40 rounded-2xl p-16 text-center space-y-4 shadow-sm">
            <MapPin className="w-10 h-10 text-[#510F23] mx-auto" />
            <h3 className="font-serif italic text-2xl text-[#510F23]">No Sanctuaries Matched</h3>
            <p className="text-xs text-[#1A1A1A]/80 max-w-md mx-auto font-light">
              No Hanford properties found matching your search criteria. Try selecting another continent or clearing filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedContinent('All');
                setSelectedStatus('All');
              }}
              className="px-6 py-2.5 bg-[#510F23] text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#3d0b1a] transition-colors border border-[#C19F6A]/30"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProperties.map((property) => {
              const isLive = property.status === 'Live' || property.status === 'Active';

              return (
                <div
                  key={property.id}
                  className="bg-[#E8DAC1] border border-[#8C8C8C]/30 rounded-t-[120px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group hover:border-[#C19F6A]"
                >
                  {/* Property Hero Image */}
                  <div
                    onClick={() => isLive && onNavigate(`/locations/${property.slug}`)}
                    className={`relative h-64 overflow-hidden bg-[#510F23] ${
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
                    <div className="absolute top-4 inset-x-0 flex items-center justify-center gap-2 z-10 px-4 pointer-events-none">
                      <span className="bg-[#510F23]/95 backdrop-blur-md text-[#E8DAC1] px-3.5 py-1 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border border-[#C19F6A]/40 shadow-md whitespace-nowrap">
                        {property.country}
                      </span>
                      <span
                        className={`px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border shadow-md whitespace-nowrap ${
                          isLive
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30'
                            : 'bg-[#510F23]/90 text-[#C19F6A] border-[#C19F6A]/30'
                        }`}
                      >
                        {isLive ? 'LIVE' : 'COMING SOON'}
                      </span>
                    </div>

                    {/* Continent / Country Pill */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-[11px] font-medium tracking-wider pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 bg-[#510F23]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider text-[#E8DAC1]">
                        <MapPin className="w-3 h-3 text-[#C19F6A]" />
                        {property.address}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.25em] text-[#8C8C8C] uppercase block mb-1">
                        {property.continent} • {property.country}
                      </span>
                      <h3
                        onClick={() => isLive && onNavigate(`/locations/${property.slug}`)}
                        className={`font-serif italic text-2xl text-[#510F23] hover:text-[#C19F6A] transition-colors mb-2 ${
                          isLive ? 'cursor-pointer' : ''
                        }`}
                      >
                        {property.name}
                      </h3>
                      <p className="text-xs text-[#1A1A1A]/80 font-light leading-relaxed italic">
                        "{property.tagline}"
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-[#8C8C8C]/30 flex items-center justify-between">
                      {isLive ? (
                        <button
                          onClick={() => onNavigate(`/locations/${property.slug}`)}
                          className="w-full py-3 bg-[#510F23] text-white hover:bg-[#3d0b1a] rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 border border-[#C19F6A]/30 group"
                        >
                          <span>VIEW SANCTUARY</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C19F6A] group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-3 bg-[#8C8C8C]/20 text-[#8C8C8C] rounded-full text-[10px] font-bold tracking-[0.2em] uppercase cursor-not-allowed flex items-center justify-center gap-2"
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
