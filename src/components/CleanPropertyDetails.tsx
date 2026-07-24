import React from 'react';
import { Compass, Sparkles, Eye, UtensilsCrossed, Info, BedDouble } from 'lucide-react';

interface CleanPropertyDetailsProps {
  detailsHtml: string;
  propertyName: string;
}

interface ParsedSection {
  title: string;
  items: string[];
}

export const CleanPropertyDetails: React.FC<CleanPropertyDetailsProps> = ({ detailsHtml }) => {
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

    if (rawTitle && (items.length > 0 || bodyHtml.trim().length > 0)) {
      sections.push({
        title: rawTitle,
        items: items
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      {overviewParagraphs.length > 0 && (
        <div className="bg-[#e8e4de] p-8 sm:p-10 border border-black/10 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-[#1a1a1a]/60 uppercase">
            <Compass className="w-4 h-4 text-[#1a1a1a]" />
            <span>SANCTUARY OVERVIEW</span>
          </div>

          <div className="space-y-4 text-black/80 font-light leading-relaxed text-sm sm:text-base">
            {overviewParagraphs.map((para, idx) => (
              <p key={idx} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Sections from Content */}
      {sections.map((sec, idx) => {
        const titleLower = sec.title.toLowerCase();
        let Icon = Sparkles;
        if (titleLower.includes('look') || titleLower.includes('design')) Icon = Eye;
        if (titleLower.includes('restaurant') || titleLower.includes('dining')) Icon = UtensilsCrossed;
        if (titleLower.includes('know') || titleLower.includes('info')) Icon = Info;
        if (titleLower.includes('room') || titleLower.includes('suite')) Icon = BedDouble;

        return (
          <div key={idx} className="bg-[#e8e4de] p-8 sm:p-10 border border-black/10 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white shrink-0">
                <Icon className="w-3.5 h-3.5 text-amber-200" />
              </div>
              <h3 className="font-serif italic text-xl sm:text-2xl text-[#1a1a1a]">
                {sec.title}
              </h3>
            </div>

            {sec.items.length > 0 ? (
              <ul className="space-y-3.5">
                {sec.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-black/80 font-light leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
