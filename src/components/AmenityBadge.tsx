import React from 'react';
import {
  Clock,
  Wine,
  Dumbbell,
  Waves,
  Users,
  Utensils,
  Flower2,
  Car,
  Heart,
  Sun,
  Smile,
  Flag,
  Trophy,
  Wifi,
  Sparkles,
  BedDouble
} from 'lucide-react';

interface AmenityBadgeProps {
  name: string;
}

export const cleanAmenityName = (rawName: string) => {
  if (!rawName) return '';
  return rawName.replace(/\s*\([^)]*\)/g, '').trim();
};

export const getAmenityIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('24-hour') || lower.includes('room service') || lower.includes('clock') || lower.includes('butler')) return Clock;
  if (lower.includes('bar') || lower.includes('wine') || lower.includes('cocktail')) return Wine;
  if (lower.includes('gym') || lower.includes('fitness')) return Dumbbell;
  if (lower.includes('pool') || lower.includes('swim') || lower.includes('water')) return Waves;
  if (lower.includes('meeting') || lower.includes('conference') || lower.includes('public guest') || lower.includes('guest area')) return Users;
  if (lower.includes('restaurant') || lower.includes('dining') || lower.includes('breakfast')) return Utensils;
  if (lower.includes('spa') || lower.includes('massage') || lower.includes('wellness') || lower.includes('thermal')) return Flower2;
  if (lower.includes('car') || lower.includes('house car') || lower.includes('parking')) return Car;
  if (lower.includes('babysitting') || lower.includes('care')) return Heart;
  if (lower.includes('beach') || lower.includes('coastal') || lower.includes('sun')) return Sun;
  if (lower.includes('kids') || lower.includes('child')) return Smile;
  if (lower.includes('golf')) return Flag;
  if (lower.includes('tennis') || lower.includes('sport')) return Trophy;
  if (lower.includes('wi-fi') || lower.includes('wifi') || lower.includes('internet')) return Wifi;
  if (lower.includes('villa') || lower.includes('suite') || lower.includes('room')) return BedDouble;
  return Sparkles;
};

export const AmenityBadge: React.FC<AmenityBadgeProps> = ({ name }) => {
  const displayName = cleanAmenityName(name);
  const Icon = getAmenityIcon(displayName);

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F0F4F8] border border-slate-200/90 rounded-full text-xs sm:text-sm shadow-2xs hover:bg-slate-200/70 transition-colors">
      <Icon className="w-4 h-4 text-[#51867E] shrink-0" />
      <span className="font-semibold text-[#1E293B]">{displayName}</span>
    </div>
  );
};
