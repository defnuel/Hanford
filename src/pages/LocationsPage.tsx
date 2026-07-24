import React, { useEffect, useState, useMemo } from 'react';
import { Property } from '../types';
import { fetchLocations } from '../services/dataService';
import { Search, MapPin, ExternalLink, ArrowRight, Database, RefreshCw, Folder } from 'lucide-react';

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
    <div className="bg-[#f5f2ed] text-[#1a1a1a] pt-32 pb-24 min-h-screen">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/10 pb-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.4em] uppercase text-black/60 mb-2">
              <span>GLOBAL FOOTPRINT</span>
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              <span>
                {dataSource === 'google_sheets' ? 'Google Sheets Dynamic' : 'Google Sheets Architecture Sync Ready'}
              </span>
            </div>
            <h1 className="font-serif italic text-4xl sm:text-6xl text-[#1a1a1a] font-light">
              Sanctuaries & Destinations
            </h1>
          </div>

          {/* Sync status button */}
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <button
              onClick={loadProperties}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1a1a1a] text-white rounded-full text-[11px] font-bold tracking-widest uppercase hover:bg-black/80 transition-colors shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>SYNC SHEET DATA</span>
            </button>
          </div>
        </div>

        {/* Integration Architecture Notification */}
        <div className="mt-6 p-4 bg-[#e8e4de] text-[#1a1a1a] text-xs border border-black/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-[#1a1a1a] shrink-0" />
            <p className="text-black/80 font-light">
              <strong>Google Sheets Integration Status:</strong>{' '}
              {dataSource === 'google_sheets'
                ? 'Properties dynamically mapped from active Google Sheet columns: Name, Tagline, Address, Country, Continent, Status, Details, Picture’s folder.'
                : 'Using structured development architecture. Configured to automatically ingest Google Sheets when GOOGLE_SHEETS_SPREADSHEET_ID is populated.'}
            </p>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-[#1a1a1a] text-white rounded-full whitespace-nowrap">
            {dataSource === 'google_sheets' ? 'LIVE SHEET' : 'MOCK READY'}
          </span>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mb-12">
        <div className="bg-[#e8e4de] p-6 border border-black/10 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by property name, tagline, or country..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-black/10 rounded-full text-xs text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-black"
            />
          </div>

          {/* Continent Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-black/50 uppercase">
              Continent:
            </span>
            <div className="flex flex-wrap gap-1">
              {continents.map((continent) => (
                <button
                  key={continent}
                  onClick={() => setSelectedContinent(continent)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full tracking-wider transition-colors ${
                    selectedContinent === continent
                      ? 'bg-[#1a1a1a] text-white'
                      : 'bg-white text-black/70 hover:bg-black/10 border border-black/5'
                  }`}
                >
                  {continent}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-black/50 uppercase">
              Status:
            </span>
            <div className="flex gap-1">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full tracking-wider transition-colors ${
                    selectedStatus === status
                      ? 'bg-[#1a1a1a] text-white'
                      : 'bg-white text-black/70 hover:bg-black/10 border border-black/5'
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
              <div key={i} className="h-96 bg-[#e8e4de] animate-pulse rounded-t-[100px]" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-[#e8e4de] border border-black/10 rounded-2xl p-16 text-center space-y-4">
            <MapPin className="w-10 h-10 text-[#1a1a1a] mx-auto" />
            <h3 className="font-serif italic text-2xl text-[#1a1a1a]">No Sanctuaries Matched</h3>
            <p className="text-xs text-black/70 max-w-md mx-auto font-light">
              No Hanford properties found matching your search criteria. Try selecting another continent or clearing filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedContinent('All');
                setSelectedStatus('All');
              }}
              className="px-6 py-2.5 bg-[#1a1a1a] text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-black/80 transition-colors"
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
                  className="bg-[#e8e4de] border border-black/10 rounded-t-[120px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col group"
                >
                  {/* Property Hero Image */}
                  <div className="relative h-64 overflow-hidden bg-[#1a1a1a]">
                    <img
                      src={property.heroImage}
                      alt={property.name}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        isLive ? 'group-hover:scale-105 opacity-90 group-hover:opacity-100' : 'opacity-60 grayscale-[30%]'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    {/* Upper Middle Badges (Country & Status) */}
                    <div className="absolute top-4 inset-x-0 flex items-center justify-center gap-2 z-10 px-4">
                      <span className="bg-[#1a1a1a]/90 backdrop-blur-md text-white px-3.5 py-1 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border border-white/20 shadow-md whitespace-nowrap">
                        {property.country}
                      </span>
                      <span
                        className={`px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border shadow-md whitespace-nowrap ${
                          isLive
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30'
                            : 'bg-black/80 text-amber-200 border-amber-500/30'
                        }`}
                      >
                        {isLive ? 'LIVE' : 'COMING SOON'}
                      </span>
                    </div>

                    {/* Continent / Country Pill */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-[11px] font-medium tracking-wider">
                      <span className="inline-flex items-center gap-1.5 bg-[#1a1a1a]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                        <MapPin className="w-3 h-3 text-[#d6d2cc]" />
                        {property.address}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.25em] text-black/50 uppercase block mb-1">
                        {property.continent} • {property.country}
                      </span>
                      <h3 className="font-serif italic text-2xl text-[#1a1a1a] group-hover:opacity-70 transition-opacity mb-2">
                        {property.name}
                      </h3>
                      <p className="text-xs text-black/70 font-light leading-relaxed italic">
                        "{property.tagline}"
                      </p>
                    </div>

                    {/* Google Drive Folder Indicator */}
                    {property.driveFolderUrl && isLive && (
                      <div className="pt-3 border-t border-black/10 flex items-center gap-2 text-[11px] text-black/60">
                        <Folder className="w-3.5 h-3.5 text-[#1a1a1a]" />
                        <span className="truncate font-mono text-[10px] text-black/50">
                          Mapped to Google Drive Assets
                        </span>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                      {isLive ? (
                        <button
                          onClick={() => onNavigate(`/locations/${property.slug}`)}
                          className="w-full py-3 bg-[#1a1a1a] text-white hover:bg-black/80 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2"
                        >
                          <span>VIEW SANCTUARY</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-3 bg-black/10 text-black/40 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase cursor-not-allowed flex items-center justify-center gap-2"
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
