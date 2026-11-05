import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Handshake, MapPin, Calendar, Tag, ChevronLeft, ChevronRight, Share2, Compass, CheckCircle2, MessageSquare, ExternalLink, Maximize2, X, Image as ImageIcon } from 'lucide-react';
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

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

  // Unique gallery images array removing duplicates
  const allImages = useMemo(() => {
    if (!project) return [];
    const list = project.galleryImages && project.galleryImages.length > 0
      ? [project.heroImage, ...project.galleryImages]
      : [project.heroImage];
    return Array.from(new Set(list.filter(Boolean)));
  }, [project]);

  const handleNextImage = () => {
    if (allImages.length === 0) return;
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    if (allImages.length === 0) return;
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailContainerRef.current && allImages.length > 0) {
      const activeThumb = thumbnailContainerRef.current.children[activeImageIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeImageIndex, allImages.length]);

  // Handle keyboard navigation for gallery & lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
      if (isLightboxOpen && allImages.length > 1) {
        if (e.key === 'ArrowLeft') {
          handlePrevImage();
        } else if (e.key === 'ArrowRight') {
          handleNextImage();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allImages.length]);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      thumbnailContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
        <h2 className="text-3xl font-serif font-semibold text-[#3A4F67]">Collaboration Not Found</h2>
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

          <h1 className="text-3xl sm:text-5xl font-serif font-semibold text-[#3A4F67] tracking-wide leading-tight">
            {project.projectName}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#3A4F67] font-medium pt-2">
            <div className="flex items-center gap-2">
              <Handshake className="w-4 h-4 text-[#51867E]" />
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

        {/* Gallery Viewer */}
        <div className="space-y-3.5 sm:space-y-4">
          {/* Main Architectural Stage */}
          <div className="relative w-full aspect-[16/10] sm:aspect-video sm:h-[480px] bg-[#1E293B] border border-[#88B2AB]/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_16px_36px_rgba(58,79,103,0.12)] group hover:border-[#51867E] transition-all">
            <img
              src={allImages[activeImageIndex] || project.heroImage}
              alt={`${project.projectName} photograph ${activeImageIndex + 1}`}
              onClick={() => setIsLightboxOpen(true)}
              className="w-full h-full object-cover transition-transform duration-700 ease-out cursor-pointer group-hover:scale-[1.02] select-none"
              referrerPolicy="no-referrer"
            />

            {/* Top Floating Badges (Matching Location Details Gallery Aesthetic) */}
            <div className="absolute top-3.5 sm:top-5 left-3.5 sm:left-5 right-3.5 sm:right-5 flex items-center justify-between gap-2 z-20 pointer-events-none">
              <span className="bg-[#1E293B]/80 backdrop-blur-md text-[#EAF2F1] px-3 sm:px-3.5 py-1 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border border-white/20 shadow-md">
                COLLABORATION GALLERY
              </span>

              {allImages.length > 0 && (
                <span className="bg-[#1E293B]/80 backdrop-blur-md text-[#88B2AB] px-3 sm:px-3.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase border border-white/20 shadow-md">
                  {activeImageIndex + 1} / {allImages.length}
                </span>
              )}
            </div>

            {/* Smooth Gradient Vignette at Bottom */}
            <div className="absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-gradient-to-t from-[#1E293B]/85 via-[#1E293B]/25 to-transparent pointer-events-none z-10" />

            {/* Bottom Overlay Pill & Fullscreen Button */}
            <div className="absolute bottom-3.5 sm:bottom-4 left-3.5 sm:left-5 right-3.5 sm:right-5 flex items-center justify-between z-20">
              <div className="pointer-events-none">
                <span className="inline-flex items-center gap-1.5 bg-[#3A4F67]/85 backdrop-blur-md px-3 py-1 rounded-full text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#EAF2F1] border border-[#88B2AB]/30 shadow-xs">
                  <ImageIcon className="w-3 h-3 text-[#88B2AB] shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{project.projectName}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="p-2 sm:p-2.5 rounded-full bg-[#1E293B]/80 hover:bg-[#51867E] text-white backdrop-blur-md border border-white/20 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="View fullscreen"
                aria-label="View fullscreen image"
              >
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#88B2AB] hover:text-white" />
              </button>
            </div>

            {/* Main image Prev/Next arrows overlay */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#1E293B]/80 hover:bg-[#51867E] text-[#88B2AB] hover:text-white backdrop-blur-md transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 border border-white/20 shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 z-20"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#88B2AB] hover:text-white" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-3.5 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#1E293B]/80 hover:bg-[#51867E] text-[#88B2AB] hover:text-white backdrop-blur-md transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 border border-white/20 shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 z-20"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#88B2AB] hover:text-white" />
                </button>
              </>
            )}
          </div>

          {/* Horizontal Single Row Thumbnail Carousel Dock with Navigation Arrows */}
          <div className="bg-[#F4F8F7] border border-[#88B2AB]/30 rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3 shadow-xs">
            <button
              type="button"
              onClick={() => scrollThumbnails('left')}
              className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-[#51867E] text-[#3A4F67] hover:text-white transition-all border border-[#88B2AB]/30 shrink-0 shadow-xs cursor-pointer active:scale-95 group"
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#51867E] group-hover:text-white" />
            </button>

            <div
              ref={thumbnailContainerRef}
              className="flex flex-1 gap-2 sm:gap-2.5 overflow-x-auto scroll-smooth py-0.5 px-0.5 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-14 w-20 sm:h-18 sm:w-26 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer group ${
                    activeImageIndex === idx
                      ? 'border-[#51867E] ring-2 ring-[#88B2AB]/60 shadow-md scale-[0.98]'
                      : 'border-slate-200/80 opacity-60 hover:opacity-100 hover:border-[#88B2AB]/50'
                  }`}
                  aria-label={`Select photo ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {activeImageIndex === idx && (
                    <div className="absolute inset-0 bg-[#51867E]/10 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollThumbnails('right')}
              className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-[#51867E] text-[#3A4F67] hover:text-white transition-all border border-[#88B2AB]/30 shrink-0 shadow-xs cursor-pointer active:scale-95 group"
              aria-label="Scroll thumbnails right"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#51867E] group-hover:text-white" />
            </button>
          </div>

          {/* Fullscreen Lightbox Modal */}
          {isLightboxOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Fullscreen Gallery"
              className="fixed inset-0 z-50 bg-[#1E293B]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
              onClick={() => setIsLightboxOpen(false)}
            >
              {/* Lightbox Top Bar */}
              <div className="flex items-center justify-between text-white pb-4 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="bg-[#51867E] text-white px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase">
                    HANFORD ARCHIVE
                  </span>
                  <h3 className="font-serif italic text-base sm:text-xl text-white truncate max-w-[200px] sm:max-w-md">
                    {project.projectName}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#88B2AB] font-bold tracking-widest uppercase">
                    {activeImageIndex + 1} / {allImages.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    aria-label="Close fullscreen gallery"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Lightbox Main Stage */}
              <div className="relative flex-1 flex items-center justify-center py-4 sm:py-6 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <img
                  src={allImages[activeImageIndex] || project.heroImage}
                  alt={`${project.projectName} slide ${activeImageIndex + 1}`}
                  className="max-h-[65vh] sm:max-h-[72vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                  referrerPolicy="no-referrer"
                />

                {/* Lightbox Prev/Next buttons */}
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePrevImage()}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1E293B]/80 hover:bg-[#51867E] text-white border border-white/20 backdrop-blur-md shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#88B2AB] hover:text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNextImage()}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1E293B]/80 hover:bg-[#51867E] text-white border border-white/20 backdrop-blur-md shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#88B2AB] hover:text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Lightbox Bottom Thumbnail Strip */}
              <div className="pt-3 border-t border-white/10 flex justify-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2 overflow-x-auto max-w-2xl py-1 px-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#88B2AB] ring-2 ring-[#51867E] scale-105 opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>
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
                <h3 className="font-serif text-xl font-semibold text-[#3A4F67]">
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
                    className="w-full px-5 py-3.5 bg-[#3A4F67] text-white hover:bg-[#2C3744] rounded-full text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm text-center border border-white/10"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[#88B2AB]" />
                    <span className="truncate max-w-full">
                      View Post
                    </span>
                  </a>
                )}

                <button
                  onClick={() => {
                    const targetQuery = matchedPropertySlug || project.location || project.projectName;
                    onNavigate(`/book-now?property=${encodeURIComponent(targetQuery)}`);
                  }}
                  className="w-full px-5 py-3.5 bg-[#51867E] text-white hover:bg-[#3f6d66] rounded-full text-xs font-bold tracking-widest uppercase transition-colors shadow-md border border-[#88B2AB]/30 text-center block cursor-pointer"
                >
                  Book Stay At Sanctuary
                </button>

                <a
                  href="https://x.com/Hanford_HnR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-5 py-3.5 bg-white text-[#3A4F67] hover:bg-[#EAF2F1] rounded-full text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-colors border border-[#88B2AB]/40 text-center flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-[#51867E]" />
                  <span className="truncate">Inquire For Partnerships</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
