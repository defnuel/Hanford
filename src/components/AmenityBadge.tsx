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
  CheckCircle2
} from 'lucide-react';

interface AmenityBadgeProps {
  name: string;
}

export const getAmenityIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('24-hour') || lower.includes('room service') || lower.includes('clock')) return Clock;
  if (lower.includes('bar') || lower.includes('wine') || lower.includes('cocktail')) return Wine;
  if (lower.includes('gym') || lower.includes('fitness')) return Dumbbell;
  if (lower.includes('pool') || lower.includes('swim')) return Waves;
  if (lower.includes('meeting') || lower.includes('conference')) return Users;
  if (lower.includes('restaurant') || lower.includes('dining')) return Utensils;
  if (lower.includes('spa') || lower.includes('massage') || lower.includes('wellness')) return Flower2;
  if (lower.includes('car') || lower.includes('house car')) return Car;
  if (lower.includes('babysitting') || lower.includes('care')) return Heart;
  if (lower.includes('beach') || lower.includes('coastal')) return Sun;
  if (lower.includes('kids') || lower.includes('child')) return Smile;
  if (lower.includes('golf')) return Flag;
  if (lower.includes('tennis') || lower.includes('sport')) return Trophy;
  return CheckCircle2;
};

export const AmenityBadge: React.FC<AmenityBadgeProps> = ({ name }) => {
  const Icon = getAmenityIcon(name);
  return (
    <div className="flex items-center gap-3.5 py-3 px-4 rounded-xl bg-[#E8DAC1]/80 border border-[#8C8C8C]/30 hover:border-[#510F23]/40 transition-all shadow-sm group">
      <div className="w-9 h-9 rounded-full bg-[#510F23] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform border border-[#C19F6A]/30">
        <Icon className="w-4 h-4 text-[#C19F6A]" />
      </div>
      <span className="text-xs font-medium text-[#1A1A1A] tracking-wide">{name}</span>
    </div>
  );
};
