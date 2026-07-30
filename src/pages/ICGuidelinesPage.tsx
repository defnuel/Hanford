import React from 'react';
import { 
  Compass, 
  Calendar, 
  Building2, 
  Sparkles, 
  Tag, 
  Share2, 
  Heart, 
  ArrowRight, 
  ExternalLink,
  BedDouble,
  Users,
  PartyPopper,
  CheckCircle2,
  Bookmark
} from 'lucide-react';

interface ICGuidelinesPageProps {
  onNavigate: (path: string) => void;
}

export const ICGuidelinesPage: React.FC<ICGuidelinesPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#FAFBF9] pt-24 sm:pt-32 pb-20">
      {/* Top Banner / Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#51867E]/10 border border-[#51867E]/20 text-[#51867E] rounded-full text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Roleplay & IC Guidelines</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-light text-[#3A4F67] tracking-tight">
          IC Guidelines
        </h1>

        <div className="w-16 h-0.5 bg-[#88B2AB] mx-auto rounded-full" />

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal pt-2">
          Selamat datang di <strong className="text-[#3A4F67] font-semibold">Hanford Hotels and Resorts (Hanford H&R)</strong>. Panduan ini dibuat untuk membantu kalian menggunakan berbagai properti dan fasilitas Hanford H&R untuk kebutuhan <strong className="text-[#51867E] font-semibold">In Character (IC)</strong> maupun plot.
        </p>
      </div>

      {/* Grid / Stack of Numbered Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">

        {/* 01 — EXPLORE OUR LOCATIONS */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#51867E]/5 rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
            {/* Number Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
              01
            </div>

            <div className="space-y-3.5 flex-grow">
              <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
                <Compass className="w-4 h-4" />
                <span>LOCATION EXPLORATION</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
                EXPLORE OUR LOCATIONS
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Seluruh informasi mengenai properti, fasilitas, suasana, dan visualisasi setiap lokasi dapat ditemukan melalui <strong className="text-slate-900 font-semibold">Gallery</strong> pada halaman masing-masing lokasi di website Hanford H&R.
              </p>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Gunakan informasi dan visualisasi tersebut sebagai referensi untuk kebutuhan <strong className="text-[#51867E] font-semibold">IC, plot, dan storytelling</strong> kalian.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/locations')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer group/btn"
                >
                  <span>Explore Our Locations</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 02 — OFFICIAL BOOKING */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3A4F67]/5 rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
            {/* Number Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
              02
            </div>

            <div className="space-y-4 flex-grow">
              <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
                <Calendar className="w-4 h-4" />
                <span>RESERVATIONS & EVENTS</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
                OFFICIAL BOOKING
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Untuk kebutuhan IC yang melibatkan penggunaan secara resmi atau terstruktur, Hanford H&R saat ini melayani sistem booking untuk:
              </p>

              {/* 3 Booking Types Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5 hover:border-[#51867E]/40 transition-colors">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#3A4F67]">
                    <BedDouble className="w-4 h-4 text-[#51867E]" />
                    <span>Room Booking</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Untuk kebutuhan menginap atau menggunakan kamar hotel dan resort.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5 hover:border-[#51867E]/40 transition-colors">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#3A4F67]">
                    <Users className="w-4 h-4 text-[#51867E]" />
                    <span>Meeting Room</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Untuk meeting, workshop, seminar, gathering, dan kebutuhan profesional lainnya.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5 hover:border-[#51867E]/40 transition-colors">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#3A4F67]">
                    <PartyPopper className="w-4 h-4 text-[#51867E]" />
                    <span>Event Hall / Ballroom</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Untuk wedding, gala dinner, celebration, reception, corporate event, dan acara lainnya.
                  </p>
                </div>
              </div>

              {/* Notice regarding @Deflictive */}
              <div className="p-3.5 bg-[#EAF2F1]/80 border border-[#88B2AB]/40 rounded-2xl text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                <Bookmark className="w-4 h-4 text-[#51867E] shrink-0 mt-0.5" />
                <div>
                  Untuk kebutuhan acara atau bentuk kolaborasi lain di luar pilihan booking tersebut, silakan menghubungi <a href="https://x.com/Deflictive" target="_blank" rel="noopener noreferrer" className="font-bold text-[#3A4F67] hover:text-[#51867E] underline decoration-dotted">@Deflictive</a> untuk informasi dan koordinasi lebih lanjut.
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => onNavigate('/book-now')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3A4F67] hover:bg-[#2C3744] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer group/btn"
                >
                  <span>Go to Booking Form</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 03 — OTHER FACILITIES */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#51867E]/5 rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
            {/* Number Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
              03
            </div>

            <div className="space-y-3.5 flex-grow">
              <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
                <Building2 className="w-4 h-4" />
                <span>FREE FACILITY USAGE</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
                OTHER FACILITIES
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ingin menggunakan fasilitas lain yang tersedia di lokasi Hanford H&R untuk kebutuhan IC atau plot?
              </p>

              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Tidak perlu melakukan booking atau meminta izin terlebih dahulu.</strong></span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Kalian dapat menggunakan fasilitas yang tersedia sesuai dengan informasi pada masing-masing lokasi, seperti:
              </p>

              {/* Facility Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'Golf Course',
                  'Villa',
                  'Spa',
                  'Swimming Pool',
                  'Restaurant',
                  'Beach Club',
                  'Fitness Class',
                  'dan fasilitas lainnya'
                ].map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-bold text-[#3A4F67]">
                  <Tag className="w-4 h-4 text-[#51867E]" />
                  <span>Ketentuan Tag & Mention</span>
                </div>
                <p className="leading-relaxed">
                  Untuk menggunakannya dalam IC/plot, cukup follow dan tag akun Hanford H&R (<a href="https://x.com/Hanford_HnR" target="_blank" rel="noopener noreferrer" className="font-bold text-[#51867E] hover:underline">@Hanford_HnR</a>) pada post atau plot kalian.
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  Pastikan penggunaan fasilitas tetap sesuai dengan konteks dan informasi yang tersedia pada lokasi terkait.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 04 — CONTENT & DOCUMENTATION */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3A4F67]/5 rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
            {/* Number Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#3A4F67] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm group-hover:bg-[#51867E] transition-colors">
              04
            </div>

            <div className="space-y-3.5 flex-grow">
              <div className="flex items-center gap-2 text-[#51867E] text-xs font-bold uppercase tracking-widest font-mono">
                <Share2 className="w-4 h-4" />
                <span>MEDIA & REPOST</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif text-[#3A4F67] font-semibold">
                CONTENT & DOCUMENTATION
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Dengan menggunakan lokasi dan fasilitas Hanford H&R dalam IC/plot, kalian memberikan kesempatan kepada Hanford H&R untuk mendokumentasikan dan menggunakan update atau post tersebut sebagai bagian dari dokumentasi dan konten akun Hanford H&R.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs text-slate-600">
                <p className="leading-relaxed">
                  Hanford H&R dapat melakukan <strong className="text-[#3A4F67]">repost, quote post, atau membagikan kembali</strong> konten yang menampilkan aktivitas IC/plot di properti Hanford H&R.
                </p>
                <div className="flex items-center gap-2 pt-1 font-semibold text-[#51867E] text-xs">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                  <span>Kami akan tetap menghargai konteks dan cerita yang dibuat oleh masing-masing roleplayer.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 05 — HAVE FUN & CREATE YOUR STORY */}
        <div className="bg-gradient-to-br from-[#3A4F67] to-[#2C3744] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#51867E]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 relative z-10">
            {/* Number Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#51867E] text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-md">
              05
            </div>

            <div className="space-y-4 flex-grow">
              <div className="flex items-center gap-2 text-[#88B2AB] text-xs font-bold uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4" />
                <span>WELCOME TO HANFORD Hotels & Resorts</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif text-white font-light tracking-wide">
                HAVE FUN & CREATE YOUR STORY
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                Gunakan Hanford H&R untuk mengembangkan cerita, membangun karakter, dan menciptakan pengalaman kalian sendiri.
              </p>

              <div className="py-2">
                <div className="inline-block px-6 py-3 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm text-center">
                  <span className="font-serif text-lg sm:text-xl text-[#88B2AB] tracking-[0.2em] font-light uppercase">
                    Stay. Dine. Gather. Explore.
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic font-serif pt-1 leading-snug">
                See you around,<br />
                <strong className="font-medium text-slate-100">Hanford Hotels & Resorts</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
