import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, MapPin, Calendar, Tag, ChevronLeft, ChevronRight, Share2, Compass, CheckCircle2, MessageSquare } from 'lucide-react';
import { Project } from '../types';
import { fetchProjectBySlug } from '../services/dataService';
import { CleanPropertyDetails } from '../components/CleanPropertyDetails';
import { DataIntegrationBadge } from '../components/DataIntegrationBadge';

interface ProjectDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ slug, onNavigate }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      const res = await fetchProjectBySlug(slug);
      if (isMounted) {
        if (res.data) {
          setProject(res.data);
        }
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#51867E] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest font-serif text-[#3A4F67]">
          Loading Collaboration Details...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center space-y-6 px-6 text-center">
        <h2 className="text-3xl font-serif font-light text-[#3A4F67]">Collaboration Not Found</h2>
        <p className="text-xs text-[#2C3744] max-w-md">
          The requested collaboration project could not be located in the Hanford database.
        </p>
        <button
          onClick={() => onNavigate('/collaborations')}
          className="px-8 py-3 bg-[#51867E] text-white rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-[#3f6d66]"
        >
          Return to Collaborations
        </button>
      </div>
    );
  }

  const allImages = project.galleryImages && project.galleryImages.length > 0 ? project.galleryImages : [project.heroImage];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#FFFFFF] text-[#2C3744]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
        {/* Navigation Breadcrumb & Back Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#88B2AB]/30">
          <button
            onClick={() => onNavigate('/collaborations')}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#3A4F67] hover:text-[#51867E] transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Collaborations</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] font-medium text-[#2C3744] uppercase tracking-wider">
            <span>Home</span>
            <span>/</span>
            <button onClick={() => onNavigate('/collaborations')} className="hover:text-[#51867E]">Collaborations</button>
            <span>/</span>
            <span className="text-[#3A4F67] font-bold truncate max-w-[200px]">{project.projectName}</span>
          </div>
        </div>

        {/* Project Header Banner */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 bg-[#3A4F67] text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-full">
              {project.projectType}
            </span>
            <span className="px-3.5 py-1 bg-[#51867E] text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-full">
              {project.status}
            </span>
            <DataIntegrationBadge />
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-light text-[#3A4F67] tracking-wide leading-tight">
            {project.projectName}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#3A4F67] font-medium pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#51867E]" />
              <span>Partner: <strong className="font-serif italic text-[#3A4F67]">{project.partnerName}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#51867E]" />
              <span>{project.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#51867E]" />
              <span>{project.date}</span>
            </div>
          </div>
        </div>

        {/* Main Gallery Showcase (Landscape on all views) */}
        <div className="space-y-4">
          <div className="relative w-full aspect-[16/10] sm:aspect-video sm:h-[480px] bg-[#510F23] border border-[#8C8C8C]/30 rounded-2xl overflow-hidden shadow-xl group">
            <img
              src={allImages[activeImageIndex]}
              alt={`${project.projectName} view ${activeImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-500"
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

            {/* Slide Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-[#510F23] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-lg focus:outline-none"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-[#510F23] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-lg focus:outline-none"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            <div className="absolute bottom-4 right-4 px-4 py-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase rounded-full border border-white/20">
              {activeImageIndex + 1} / {allImages.length}
            </div>
          </div>

          {/* Horizontal Single-Row Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#510F23]">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all focus:outline-none ${
                    idx === activeImageIndex
                      ? 'border-[#510F23] ring-2 ring-[#C19F6A] scale-105 shadow-md'
                      : 'border-[#8C8C8C]/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Layout: Left HTML Details, Right Metadata Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-6">
          {/* Main Content Details */}
          <div className="lg:col-span-2 space-y-8">
            <CleanPropertyDetails detailsHtml={project.detailsHtml} propertyName={project.projectName} />
          </div>

          {/* Right Sidebar Metadata Card */}
          <div className="space-y-6">
            <div className="info-panel bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl p-8 space-y-6 shadow-md sticky top-32">
              <div className="border-b border-[#88B2AB]/30 pb-4 space-y-1">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#51867E] uppercase block">
                  COLLABORATION SNAPSHOT
                </span>
                <h3 className="font-serif text-xl font-light text-[#3A4F67]">
                  {project.projectName}
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start justify-between border-b border-[#88B2AB]/20 pb-3">
                  <span className="text-[#3A4F67] font-semibold uppercase tracking-wider">Partner</span>
                  <span className="font-semibold text-[#51867E] text-right">{project.partnerName}</span>
                </div>

                <div className="flex items-start justify-between border-b border-[#88B2AB]/20 pb-3">
                  <span className="text-[#3A4F67] font-semibold uppercase tracking-wider">Type</span>
                  <span className="font-semibold text-[#2C3744] text-right">{project.projectType}</span>
                </div>

                <div className="flex items-start justify-between border-b border-[#88B2AB]/20 pb-3">
                  <span className="text-[#3A4F67] font-semibold uppercase tracking-wider">Location</span>
                  <span className="font-semibold text-[#2C3744] text-right">{project.location}</span>
                </div>

                <div className="flex items-start justify-between border-b border-[#88B2AB]/20 pb-3">
                  <span className="text-[#3A4F67] font-semibold uppercase tracking-wider">Date</span>
                  <span className="font-semibold text-[#2C3744] text-right">{project.date}</span>
                </div>

                <div className="flex items-start justify-between pb-1">
                  <span className="text-[#3A4F67] font-semibold uppercase tracking-wider">Status</span>
                  <span className="px-2.5 py-0.5 bg-[#51867E] text-white font-bold rounded-full text-[10px] uppercase">
                    {project.status}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={() => onNavigate('/book-now')}
                  className="w-full py-3.5 bg-[#51867E] text-white hover:bg-[#3f6d66] rounded-full text-xs font-semibold tracking-widest uppercase transition-colors shadow-md border border-[#88B2AB]/30 text-center block cursor-pointer"
                >
                  Book Stay At Sanctuary
                </button>

                <a
                  href="https://x.com/Hanford_HnR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-white text-[#3A4F67] hover:bg-[#EAF2F1] rounded-full text-xs font-semibold tracking-wider uppercase transition-colors border border-[#88B2AB]/40 text-center flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#51867E]" />
                  <span>Inquire For Partnerships</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
