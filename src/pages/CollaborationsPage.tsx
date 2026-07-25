import React, { useState, useEffect } from 'react';
import { Search, Sparkles, MapPin, Calendar, Tag, ArrowRight, Filter, ExternalLink, RefreshCw } from 'lucide-react';
import { Project } from '../types';
import { fetchProjects } from '../services/dataService';

interface CollaborationsPageProps {
  onNavigate: (path: string) => void;
}

export const CollaborationsPage: React.FC<CollaborationsPageProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'google_sheets' | 'mock_fallback'>('google_sheets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

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

  // Extract unique project types for filter pills
  const availableTypes: string[] = ['ALL', ...Array.from(new Set(projects.map((p) => p.projectType))).filter((t): t is string => Boolean(t))];
  const availableStatuses: string[] = ['ALL', ...Array.from(new Set(projects.map((p) => p.status))).filter((s): s is string => Boolean(s))];

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === 'ALL' || project.projectType.toLowerCase() === selectedType.toLowerCase();

    const matchesStatus =
      selectedStatus === 'ALL' || project.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#E8DAC1] text-[#1A1A1A]">
      {/* Editorial Page Header */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-6 pb-12">
        <div className="border-b border-[#8C8C8C]/30 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#510F23]/10 border border-[#510F23]/20 text-[#510F23] text-[10px] font-bold tracking-[0.25em] uppercase">
                <Sparkles className="w-3 h-3 text-[#C19F6A]" />
                <span>Executive Partnerships & Creative Initiatives</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-light text-[#510F23] tracking-wide leading-tight">
                Collaborations & Creative Projects
              </h1>
              <p className="text-base text-[#1A1A1A]/80 font-light leading-relaxed">
                Explore bespoke partnerships with world-renowned models, fashion houses, master artisans, artists, and visionary brands across our global Hanford sanctuaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 mb-12">
        <div className="bg-[#FCF7F0] border border-[#8C8C8C]/30 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Top Row: Search Input & Quick Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
              <input
                type="text"
                placeholder="Search project, partner, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#E8DAC1]/40 border border-[#8C8C8C]/30 rounded-full text-xs text-[#1A1A1A] placeholder-[#8C8C8C] focus:outline-none focus:border-[#510F23] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8C8C8C] hover:text-[#510F23]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto text-xs text-[#510F23]">
              <span className="font-medium tracking-wider uppercase text-[10px]">
                Showing {filteredProjects.length} of {projects.length} Collaborations
              </span>
            </div>
          </div>

          {/* Project Type Filter Pills */}
          <div className="space-y-2 pt-2 border-t border-[#8C8C8C]/20">
            <label className="text-[10px] font-bold tracking-[0.2em] text-[#510F23] uppercase block">
              Filter by Category / Type
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {availableTypes.map((type) => {
                const isActive = selectedType.toLowerCase() === type.toLowerCase();
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-full text-[11px] font-medium tracking-wider transition-all focus:outline-none ${
                      isActive
                        ? 'bg-[#510F23] text-white shadow-md'
                        : 'bg-[#E8DAC1]/50 text-[#1A1A1A]/80 hover:bg-[#E8DAC1] hover:text-[#510F23] border border-[#8C8C8C]/30'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-[0.2em] text-[#510F23] uppercase block">
              Filter by Status
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {availableStatuses.map((status) => {
                const isActive = selectedStatus.toLowerCase() === status.toLowerCase();
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-semibold tracking-wider transition-all focus:outline-none uppercase ${
                      isActive
                        ? 'bg-[#C19F6A] text-[#1A1A1A] font-bold shadow-sm'
                        : 'bg-[#E8DAC1]/30 text-[#1A1A1A]/70 hover:bg-[#E8DAC1] border border-[#8C8C8C]/20'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-[#510F23] mx-auto" />
            <p className="text-sm text-[#510F23] font-serif tracking-widest uppercase">
              Retrieving Collaborations from Hanford Google Sheets...
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center bg-[#FCF7F0] border border-[#8C8C8C]/30 rounded-2xl p-8 space-y-4">
            <p className="text-lg font-serif text-[#510F23]">No collaborations matched your search parameters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-6 py-2.5 bg-[#510F23] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#3d0b1a]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onNavigate(`/collaborations/${project.slug}`)}
                className="group cursor-pointer bg-[#FCF7F0] border border-[#8C8C8C]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Image Wrapper */}
                  <div className="relative aspect-[16/10] bg-[#510F23] overflow-hidden">
                    <img
                      src={project.heroImage}
                      alt={project.projectName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                      <span className="px-3 py-1 bg-[#FCF7F0]/90 backdrop-blur-md text-[#510F23] text-[9px] font-bold tracking-widest uppercase rounded-full shadow-sm border border-[#8C8C8C]/30">
                        {project.projectType}
                      </span>
                      <span className={`px-3 py-1 text-[9px] font-bold tracking-widest uppercase rounded-full shadow-sm border ${
                        project.status.toLowerCase() === 'completed'
                          ? 'bg-[#510F23] text-white border-[#C19F6A]/40'
                          : 'bg-[#C19F6A] text-[#1A1A1A] border-[#1A1A1A]/20'
                      }`}>
                        {project.status}
                      </span>
                    </div>

                    {/* Bottom Metadata Overlay */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-[11px] font-light">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C19F6A]" />
                        <span className="truncate">{project.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C19F6A]" />
                        <span>{project.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-serif font-medium text-[#510F23] group-hover:text-[#C19F6A] transition-colors leading-snug">
                        {project.projectName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#C19F6A]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Partner: {project.partnerName}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#1A1A1A]/80 font-light leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6 pt-2 border-t border-[#8C8C8C]/20 flex items-center justify-between text-xs font-semibold tracking-wider text-[#510F23] group-hover:text-[#C19F6A] transition-colors">
                  <span className="uppercase text-[10px]">View Collaboration Details</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
