import React, { useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  X,
  ArrowDown
} from 'lucide-react';

interface BookingGuideProps {
  isOpen: boolean;
  onToggle: () => void;
  onScrollToForm?: () => void;
}

export const BookingGuide: React.FC<BookingGuideProps> = ({
  isOpen,
  onToggle,
  onScrollToForm,
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('3076632447889928');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full mb-8 sm:mb-10 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="bg-white border-2 border-[#51867E]/40 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden text-left">
        {/* Header Bar */}
        <div className="bg-[#3A4F67] text-white px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3 border-b border-[#88B2AB]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#51867E] flex items-center justify-center text-white shrink-0 shadow-xs border border-white/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif italic text-base sm:text-lg text-white font-semibold leading-snug">
                How to Book &amp; Payment Instructions
              </h3>
              <p className="text-[11px] text-[#88B2AB] italic leading-tight">
                Tata Cara Pemesanan &amp; Pembayaran
              </p>
            </div>
          </div>

          {/* Minimize Button */}
          <button
            type="button"
            onClick={onToggle}
            className="px-2.5 sm:px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-white/20 shrink-0"
            title="Minimize guide"
          >
            <X className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Close / Tutup</span>
          </button>
        </div>

        {/* 3 Step Boxes Grid */}
        <div className="p-4 sm:p-6 bg-[#F8FAFC] space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            
            {/* STEP 1: ISI FORM */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:border-[#51867E] transition-all">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-[#3A4F67] text-white text-xs font-bold flex items-center justify-center font-mono">
                    1
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#51867E] bg-[#EAF2F1] px-2 py-0.5 rounded-md border border-[#88B2AB]/30">
                    STEP 1
                  </span>
                </div>

                <div>
                  <h4 className="font-serif italic text-lg text-[#3A4F67] font-semibold">
                    Fill Booking Form
                  </h4>
                  <p className="text-[11px] text-slate-500 italic">
                    Isi Form Booking
                  </p>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    Complete the hotel/resort location, guest details &amp; X handle, stay dates, and room or event selections in the form below.
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                    Lengkapi kolom lokasi hotel/resort, data diri &amp; akun X, tanggal, serta pilihan kamar atau acara pada formulir di bawah.
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 2: DOWNLOAD INVOICE */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:border-[#51867E] transition-all">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-[#3A4F67] text-white text-xs font-bold flex items-center justify-center font-mono">
                    2
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#51867E] bg-[#EAF2F1] px-2 py-0.5 rounded-md border border-[#88B2AB]/30">
                    STEP 2
                  </span>
                </div>

                <div>
                  <h4 className="font-serif italic text-lg text-[#3A4F67] font-semibold">
                    Download Invoice
                  </h4>
                  <p className="text-[11px] text-slate-500 italic">
                    Download Invoice
                  </p>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    After clicking submit booking, your Official Invoice is generated. Click the button to download it as a PNG image.
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                    Setelah menekan tombol submit booking, sistem akan menerbitkan Official Invoice. Klik tombol untuk mengunduh invoice dalam format PNG.
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 3: PAYMENT & DM / TWEET */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:border-[#51867E] transition-all">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-[#3A4F67] text-white text-xs font-bold flex items-center justify-center font-mono">
                    3
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#51867E] bg-[#EAF2F1] px-2 py-0.5 rounded-md border border-[#88B2AB]/30">
                    STEP 3
                  </span>
                </div>

                <div>
                  <h4 className="font-serif italic text-lg text-[#3A4F67] font-semibold">
                    Payment &amp; Send Proof
                  </h4>
                  <p className="text-[11px] text-slate-500 italic">
                    Payment &amp; Kirim Bukti Bayar
                  </p>
                </div>

                {/* CHOBANK Details Box */}
                <div className="bg-[#EAF2F1]/70 p-2.5 rounded-xl border border-[#88B2AB]/30 text-xs space-y-0.5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">
                    Bank: <strong className="text-[#3A4F67]">CHOBANK</strong> &bull; A/N: <strong className="text-[#3A4F67]">Hanford Hotels and Resorts</strong>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="font-mono font-bold text-sm text-[#3A4F67] tracking-wider">
                      3076 6324 4788 9928
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="px-2 py-1 bg-white hover:bg-[#51867E] hover:text-white text-[#3A4F67] border border-[#88B2AB]/40 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Salin No. Rekening"
                    >
                      {copiedAccount ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    Transfer to the CHOBANK account above. Ensure you follow <strong className="text-[#51867E]">@Hanford_HnR</strong>, then send a DM or tweet your payment proof with your invoice.
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                    Transfer ke rekening CHOBANK di atas. Pastikan follow akun <strong className="text-[#51867E]">@Hanford_HnR</strong>, lalu kirim DM atau tweet bukti bayar beserta invoice Anda.
                  </p>
                </div>
              </div>

              {/* Link button to @Hanford_HnR without the word "buka" */}
              <div className="pt-2 border-t border-slate-100">
                <a
                  href="https://x.com/Hanford_HnR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-3 bg-[#3A4F67] hover:bg-[#2C3744] text-white rounded-xl text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <svg className="w-3 h-3 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>@Hanford_HnR</span>
                  <ExternalLink className="w-3 h-3 text-[#88B2AB]" />
                </a>
              </div>
            </div>

          </div>

          {/* BOOK NOW Button at the bottom */}
          {onScrollToForm && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={onScrollToForm}
                className="px-8 py-2.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-md cursor-pointer border border-[#88B2AB]/30 inline-flex items-center gap-2"
              >
                <span>BOOK NOW</span>
                <ArrowDown className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
