import React, { useState } from 'react';
import { Compass, Sparkles, Eye, UtensilsCrossed, Info, BedDouble, ChevronDown, ChevronUp } from 'lucide-react';

interface CleanPropertyDetailsProps {
  detailsHtml: string;
  propertyName: string;
}

interface ParsedSection {
  title: string;
  items: string[];
  paragraphs: string[];
}

interface CollapsibleSectionCardProps {
  sec: ParsedSection;
}

const CollapsibleSectionCard: React.FC<CollapsibleSectionCardProps> = ({ sec }) => {
  const [isOpen, setIsOpen] = useState(false);

  const titleLower = sec.title.toLowerCase();
  let Icon = Sparkles;
  if (titleLower.includes('look') || titleLower.includes('design')) Icon = Eye;
  if (titleLower.includes('restaurant') || titleLower.includes('dining')) Icon = UtensilsCrossed;
  if (titleLower.includes('know') || titleLower.includes('info')) Icon = Info;
  if (titleLower.includes('room') || titleLower.includes('suite')) Icon = BedDouble;

  return (
    <div className="info-panel bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 sm:p-8 flex items-center justify-between text-left hover:bg-[#88B2AB]/15 transition-colors focus:outline-none cursor-pointer group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#51867E] flex items-center justify-center text-white shrink-0 border border-[#88B2AB]/30 group-hover:scale-105 transition-transform">
            <Icon className="w-4 h-4 text-[#88B2AB]" />
          </div>
          <h3 className="font-serif italic text-xl sm:text-2xl text-[#3A4F67]">
            {sec.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#666666] group-hover:text-[#51867E] transition-colors hidden sm:inline">
            {isOpen ? 'Minimize' : 'Expand'}
          </span>
          <div className="w-8 h-8 rounded-full bg-[#51867E]/10 flex items-center justify-center text-[#51867E] group-hover:bg-[#51867E] group-hover:text-white transition-all">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-2 border-t border-[#88B2AB]/20">
          {sec.items.length > 0 ? (
            <ul className="space-y-3.5 pt-2">
              {sec.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-[#2C3744] font-light leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#88B2AB] mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : sec.paragraphs.length > 0 ? (
            <div className="space-y-3 pt-2 text-xs sm:text-sm text-[#2C3744] font-light leading-relaxed">
              {sec.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export const CleanPropertyDetails: React.FC<CleanPropertyDetailsProps> = ({ detailsHtml }) => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);

  // Helper to strip HTML tags and decode basic entities cleanly
  const stripTags = (str: string) => {
    return str
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&eacute;/g, 'é')
      .replace(/&ucirc;/g, 'û')
      .replace(/&mdash;/g, '—')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Extract main overview paragraphs (paragraphs that appear before any H3)
  const paragraphMatches = detailsHtml.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
  const overviewParagraphs = paragraphMatches
    .map((p) => stripTags(p))
    .filter((p) => p.length > 25 && !p.toLowerCase().includes('address:'));

  // Extract structured sections based on <h3> tags
  const sections: ParsedSection[] = [];
  const h3Regex = /<h3[^>]*>(.*?)<\/h3>([\s\S]*?)(?=(<h3[^>]*>|$))/gi;
  let match;

  while ((match = h3Regex.exec(detailsHtml)) !== null) {
    const rawTitle = stripTags(match[1]);
    const bodyHtml = match[2];

    const liMatches = bodyHtml.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    const items = liMatches.map((li) => stripTags(li)).filter((item) => item.length > 5);

    const pMatches = bodyHtml.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
    const paragraphs = pMatches.map((p) => stripTags(p)).filter((p) => p.length > 10);

    if (rawTitle && (items.length > 0 || paragraphs.length > 0 || bodyHtml.trim().length > 0)) {
      sections.push({
        title: rawTitle,
        items,
        paragraphs
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      {overviewParagraphs.length > 0 && (
        <div className="info-panel bg-[#EAF2F1] border border-[#88B2AB]/30 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => setIsOverviewOpen(!isOverviewOpen)}
            className="w-full p-6 sm:p-8 flex items-center justify-between text-left hover:bg-[#88B2AB]/15 transition-colors focus:outline-none cursor-pointer group"
            aria-expanded={isOverviewOpen}
          >
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-[#51867E] uppercase">
              <Compass className="w-4 h-4 text-[#51867E]" />
              <span>SANCTUARY OVERVIEW</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#666666] group-hover:text-[#51867E] transition-colors hidden sm:inline">
                {isOverviewOpen ? 'Minimize' : 'Expand'}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#51867E]/10 flex items-center justify-center text-[#51867E] group-hover:bg-[#51867E] group-hover:text-white transition-all">
                {isOverviewOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {isOverviewOpen && (
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-2 border-t border-[#88B2AB]/20 space-y-4 text-[#2C3744] font-light leading-relaxed text-sm sm:text-base">
              {overviewParagraphs.map((para, idx) => (
                <p key={idx} className="leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dynamic Sections from Content */}
      {sections.map((sec, idx) => (
        <CollapsibleSectionCard key={idx} sec={sec} />
      ))}
    </div>
  );
};
