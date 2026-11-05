import React, { useState, useEffect, useRef } from 'react';
import { Search, Handshake, MapPin, Calendar, Tag, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { Project } from '../types';
import { fetchProjects } from '../services/dataService';

interface CollaborationsPageProps {
  onNavigate: (path: string) => void;
}

const CollaborationCardImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const checkDimensions = (img: HTMLImageElement) => {
    if (img.naturalHeight && img.naturalWidth) {
      if (img.naturalHeight > img.naturalWidth * 1.05) {
        setIsPortrait(true);
      } else {
        setIsPortrait(false);
      }
    }
  };

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      checkDimensions(imgRef.current);
    }
  }, [src]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background layer: Always fills edge-to-edge full width & height like Card Location */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover ${
          isPortrait
            ? 'blur-md scale-110 opacity-60 filter brightness-90'
            : 'transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100'
        }`}
        referrerPolicy="no-referrer"
      />

      {/* Foreground layer for portrait photos: Display full uncropped image centered */}
      {isPortrait ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-1">
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            onLoad={(e) => checkDimensions(e.currentTarget)}
            className="h-full w-auto max-w-full object-contain group-hover:scale-105 transition-transform duration-500 rounded drop-shadow-md"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={(e) => checkDimensions(e.currentTarget)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
};

export const CollaborationsPage: React.FC<CollaborationsPageProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'google_sheets' | 'mock_fallback'>('google_sheets');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      const res = await fetchProjects();
      if (isMounted) {
        setProjects(res.data);
        setDataSource(res.source);
        setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter projects by search query
  const filteredProjects = projects.filter((project) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      project.projectName.toLowerCase().includes(q) ||
      project.projectType.toLowerCase().includes(q) ||
      project.partnerName.toLowerCase().includes(q) ||
      project.location.toLowerCase().includes(q) ||
      (project.description && project.description.toLowerCase().includes(q))
    );
  });

  // Dropdown list matching results
  const searchDropdownResults = projects.filter((project) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      project.projectName.toLowerCase().includes(q) ||
      project.projectType.toLowerCase().includes(q) ||
      project.partnerName.toLowerCase().includes(q) ||
      project.location.toLowerCase().includes(q)
    );
  });

  const handleSelectProject = (slug: string) => {
    setIsDropdownOpen(false);
    onNavigate(`/collaborations/${slug}`);
  };

  return (
    <div className="pt-20 sm:pt-28 pb-16 sm:pb-24 min-h-screen bg-[#FFFFFF] text-[#2C3744]">
      {/* Editorial Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6 pb-8 sm:pb-12">
        <div className="border-b border-[#88B2AB]/30 pb-8 sm:pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-[#51867E]/10 border border-[#51867E]/20 text-[#51867E] text-[9px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase">
                <Handshake className="w-3.5 h-3.5 text-[#51867E]" />
                <span>Collaborations</span>
              </div>
              <h1 className="text-2xl sm:text-5xl font-serif font-semibold text-[#3A4F67] tracking-wide leading-tight italic">
                Collaborations, Projects, and News
              </h1>
              <p className="text-sm sm:text-base text-[#2C3744]/80 font-light leading-relaxed">
                Explore Hanford’s partnerships with world-renowned artists, models, fashion houses, master artisans, and visionary brands across our global properties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mb-8 sm:mb-12">
        <div className="bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input with Interactive Dropdown */}
            <div ref={searchContainerRef} className="relative w-full md:max-w-xl">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#3A4F67]" />
              <input
                type="text"
                placeholder="Search collaborations by event name, category, or location..."
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full pl-11 pr-20 py-2.5 sm:py-3 bg-white border border-[#88B2AB]/40 rounded-full text-xs sm:text-sm text-[#2C3744] placeholder-slate-400 focus:outline-none focus:border-[#51867E] focus:ring-2 focus:ring-[#51867E]/20 font-medium transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-[#51867E] font-semibold cursor-pointer px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}

              {/* Direct Clickable Dropdown List */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#88B2AB]/40 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 sm:max-h-96 overflow-y-auto">
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between text-[11px] text-slate-500 font-medium px-4">
                    <span>
                      {searchQuery.trim()
                        ? `Search Results (${searchDropdownResults.length})`
                        : `All Collaborations (${projects.length})`}
                    </span>
                    <span className="text-[10px] text-slate-400">Click to view details</span>
                  </div>

                  {searchDropdownResults.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No collaboration events found matching "{searchQuery}".
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {searchDropdownResults.map((project, idx) => (
                        <div
                          key={`${project.id || project.slug}-${idx}`}
                          onClick={() => handleSelectProject(project.slug)}
                          className="p-3 hover:bg-[#EAF2F1] cursor-pointer transition-colors flex items-center gap-3 group text-left"
                        >
                          {/* Foto kecil di kiri */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200 shadow-2xs relative">
                            <img
                              src={project.heroImage || (project.galleryImages && project.galleryImages[0]) || ''}
                              alt={project.projectName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80';
                              }}
                            />
                          </div>

                          {/* Nama event dan category dibawahnya */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-serif font-semibold text-[#3A4F67] group-hover:text-[#51867E] transition-colors truncate">
                              {project.projectName}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="inline-block text-[10px] sm:text-[11px] font-bold text-[#51867E] uppercase tracking-wider">
                                {project.projectType || 'Collaboration'}
                              </span>
                              {project.location && (
                                <>
                                  <span className="text-slate-300 text-xs">&bull;</span>
                                  <span className="text-[11px] text-slate-500 truncate">
                                    {project.location}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#51867E] group-hover:translate-x-0.5 transition-all shrink-0 mr-1" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Total Collaborations Count */}
            <div className="flex items-center gap-3 w-full md:w-auto text-xs text-[#3A4F67]">
              <span className="font-medium tracking-wider uppercase text-[10px]">
                Showing {filteredProjects.length} of {projects.length} Collaborations
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        {loading ? (
          <div className="py-16 sm:py-24 text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-[#51867E] mx-auto" />
            <p className="text-xs sm:text-sm text-[#3A4F67] font-serif tracking-widest uppercase">
              Retrieving Collaborations...
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-12 sm:py-20 text-center bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl p-6 sm:p-8 space-y-4">
            <p className="text-base sm:text-lg font-serif text-[#3A4F67]">No collaborations matched your search parameters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-[#51867E] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#3f6d66] cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map((project, idx) => (
              <div
                key={`${project.id || project.slug}-${idx}`}
                onClick={() => onNavigate(`/collaborations/${project.slug}`)}
                className="group cursor-pointer bg-white border border-[#88B2AB]/30 rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-[0_12px_32px_rgba(58,79,103,0.08)] hover:shadow-[0_24px_48px_rgba(58,79,103,0.18)] transition-all duration-500 flex flex-col justify-between hover:border-[#51867E]"
              >
                <div>
                  {/* Card Image Wrapper with Full Bleed & Portrait Crop Protection */}
                  <div className="relative h-56 sm:h-64 overflow-hidden bg-[#3A4F67]">
                    <CollaborationCardImage
                      src={project.heroImage}
                      alt={project.projectName}
                    />

                    {/* Top Floating Badges (Category on Left, Date on Right) */}
                    <div className="absolute top-3.5 sm:top-4 left-3.5 sm:left-4 right-3.5 sm:right-4 flex items-center justify-between gap-2 z-20 pointer-events-none">
                      <span className="bg-[#1E293B]/80 backdrop-blur-md text-[#EAF2F1] px-3 sm:px-3.5 py-1 text-[9px] sm:text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase rounded-full border border-white/20 shadow-md whitespace-nowrap">
                        {project.projectType}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-[#1E293B]/80 backdrop-blur-md text-[#EAF2F1] px-3 sm:px-3.5 py-1 text-[9px] sm:text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase rounded-full border border-white/20 shadow-md whitespace-nowrap shrink-0">
                        <Calendar className="w-3 h-3 text-[#88B2AB] shrink-0" />
                        <span>{project.date}</span>
                      </span>
                    </div>

                    {/* Smooth Gradient Fade at Bottom of Image into Card Body */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />

                    {/* Bottom Metadata Overlay (Location Centered & Extended) */}
                    <div className="absolute bottom-2.5 sm:bottom-3 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-center z-20 pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 bg-[#3A4F67]/85 backdrop-blur-md px-3.5 py-1 rounded-full text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#EAF2F1] truncate max-w-full border border-[#88B2AB]/30 shadow-xs">
                        <MapPin className="w-3 h-3 text-[#88B2AB] shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="px-6 sm:px-8 pb-4 pt-2 space-y-3 sm:space-y-4 bg-white">
                    <div className="space-y-1.5">
                      <h3 className="text-lg sm:text-xl font-serif font-medium text-[#3A4F67] group-hover:text-[#51867E] transition-colors leading-snug">
                        {project.projectName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#51867E]">
                        <Handshake className="w-3.5 h-3.5" />
                        <span>with: {project.partnerName}</span>
                        {project.xUsername && (
                          <span className="text-[11px] font-normal text-[#3A4F67]">({project.xUsername})</span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-[13px] text-[#2C3744]/80 font-normal leading-relaxed line-clamp-3">
                      {project.shortDescription || project.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer / Action */}
                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 border-t border-[#88B2AB]/20 bg-white">
                  <div className="w-full py-3 px-6 bg-[#51867E] text-white hover:bg-[#3f6d66] rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-between border border-[#51867E]/30 shadow-sm hover:shadow-md group">
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
