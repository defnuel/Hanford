import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, MapPin, Calendar, Tag, ChevronLeft, ChevronRight, Share2, Compass, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import { Project } from '../types';
import { fetchProjectBySlug, fetchLocations } from '../services/dataService';
import { CleanPropertyDetails } from '../components/CleanPropertyDetails';

interface ProjectDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ slug, onNavigate }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [matchedPropertySlug, setMatchedPropertySlug] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      const res = await fetchProjectBySlug(slug);
      if (isMounted) {
        if (res.data) {
          const proj = res.data;
          setProject(proj);

          // Find matching property for book button
          try {
            const locRes = await fetchLocations();
            const locations = locRes.data || [];
            const projText = `${proj.projectName} ${proj.location || ''}`.toLowerCase();

            const matched = locations.find((p) => {
              const pName = p.name.toLowerCase();
              const pAddress = (p.address || '').toLowerCase();
              const pCountry = (p.country || '').toLowerCase();
              return (
                projText.includes(p.slug.toLowerCase()) ||
                projText.includes(pName) ||
                (pAddress && projText.includes(pAddress)) ||
                (pCountry && projText.includes(pCountry))
              );
            });

            if (matched) {
              setMatchedPropertySlug(matched.slug);
            } else if (proj.location) {
              setMatchedPropertySlug(proj.location);
            } else {
              setMatchedPropertySlug(proj.projectName);
            }
          } catch (err) {
            console.error('Error matching property location:', err);
          }
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
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-light text-[#3A4F67] tracking-wide leading-tight">
            {project.projectName}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#3A4F67] font-medium pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#51867E]" />
              <span>with: <strong className="font-serif italic text-[#3A4F67]">{project.partnerName}</strong> {project.xUsername && <span className="text-xs text-[#51867E] font-semibold">({project.xUsername})</span>}</span>
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

        {/* Main Gallery Showcase - Uncropped Full Aspect Ratio Display */}
        <div className="space-y-4">
          <div className="relative w-full min-h-[380px] max-h-[720px] h-[60vh] sm:h-[560px] bg-[#2C3744] border border-[#88B2AB]/30 rounded-2xl overflow-hidden shadow-2xl group flex items-center justify-center p-3 sm:p-6">
            {/* Soft Ambient Blurred Background matching the image colors */}
            <img
              src={allImages[activeImageIndex]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40 pointer-events-none transition-all duration-500"
              aria-hidden="true"
            />

            {/* Dark gradient overlay for UI contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

            {/* Foreground Main Image - Full Natural Aspect Ratio, zero cropping */}
            <img
              src={allImages[activeImageIndex]}
              alt={`${project.projectName} view ${activeImageIndex + 1}`}
              className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl transition-all duration-300"
            />

            {/* Slide Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-[#51867E] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-lg focus:outline-none cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-[#51867E] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-lg focus:outline-none cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            <div className="absolute bottom-4 right-4 z-20 px-4 py-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase rounded-full border border-white/20">
              {activeImageIndex + 1} / {allImages.length}
            </div>
          </div>

          {/* Horizontal Single-Row Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#51867E]">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative shrink-0 w-24 h-18 rounded-xl overflow-hidden border-2 transition-all focus:outline-none bg-[#2C3744] flex items-center justify-center p-1 cursor-pointer ${
                    idx === activeImageIndex
                      ? 'border-[#51867E] ring-2 ring-[#88B2AB] scale-105 shadow-md'
                      : 'border-[#88B2AB]/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30" aria-hidden="true" />
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain rounded-sm" />
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
                  <span className="text-[#3A4F67] font-semibold uppercase tracking-wider">with</span>
                  <div className="text-right">
                    <span className="font-semibold text-[#51867E] block">{project.partnerName}</span>
                    {project.xUsername && <span className="text-[11px] text-[#3A4F67] font-medium block">{project.xUsername}</span>}
                  </div>
                </div>

                <div className="flex items-start justify-between border-b border-[#88B2AB]/20 pb-3">
                  <span className="text-[#3A4F67] font-semibold uppercase tracking-wider">Location</span>
                  <span className="font-semibold text-[#2C3744] text-right">{project.location}</span>
                </div>

                <div className="flex items-start justify-between pb-1">
                  <span className="text-[#3A4F67] font-semibold uppercase tracking-wider">Date</span>
                  <span className="font-semibold text-[#2C3744] text-right">{project.date}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                {project.xLink && (
                  <a
                    href={project.xLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#3A4F67] text-white hover:bg-[#2C3744] rounded-full text-xs font-semibold tracking-wider uppercase transition-colors text-center flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Post on X {project.xUsername ? `(${project.xUsername})` : ''}</span>
                  </a>
                )}

                <button
                  onClick={() => {
                    const targetQuery = matchedPropertySlug || project.location || project.projectName;
                    onNavigate(`/book-now?property=${encodeURIComponent(targetQuery)}`);
                  }}
                  className="w-full py-3.5 bg-[#51867E] text-white hover:bg-[#3f6d66] rounded-full text-xs font-bold tracking-widest uppercase transition-colors shadow-md border border-[#88B2AB]/30 text-center block cursor-pointer"
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
