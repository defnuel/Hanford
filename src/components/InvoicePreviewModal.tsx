import React from 'react';
import { X, Download, ExternalLink, Info, CheckCircle2, FileImage } from 'lucide-react';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataUrl: string;
  blobUrl?: string;
  fileName: string;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  dataUrl,
  blobUrl,
  fileName,
}) => {
  if (!isOpen || !dataUrl) return null;

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = blobUrl || dataUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('Download link failed, opening in new tab:', err);
      window.open(blobUrl || dataUrl, '_blank');
    }
  };

  const handleOpenNewTab = () => {
    const targetUrl = blobUrl || dataUrl;
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/85 backdrop-blur-md overflow-y-auto p-3 sm:p-6 flex justify-center items-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto text-left">
        {/* Header */}
        <div className="p-4 bg-[#3A4F67] text-white flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#51867E] text-white rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>Invoice Gambar PNG (Format Desktop)</span>
                <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-100 rounded text-[10px] uppercase font-mono tracking-wider">PNG</span>
              </h3>
              <p className="text-[11px] text-[#EAF2F1]">File gambar invoice siap diunduh & disimpan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Instructions Notice */}
        <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block text-amber-950">Petunjuk Simpan Gambar (Mobile Chrome/Safari):</span>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Gunakan tombol <strong>Simpan PNG</strong> di bawah, atau <strong>Tekan & Tahan (Long-Press)</strong> gambar invoice di bawah ini lalu pilih <strong>"Simpan Gambar" / "Save Image"</strong>.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-100 flex flex-col items-center justify-center">
          <div className="bg-white p-2 sm:p-4 rounded-xl shadow-md border border-slate-200 w-full text-center">
            <div className="mb-2 text-slate-500 text-[11px] font-semibold flex items-center justify-center gap-1">
              <FileImage className="w-3.5 h-3.5 text-[#51867E]" />
              <span>Format Gambar PNG High-Res (800px Desktop Layout)</span>
            </div>
            <img
              src={dataUrl}
              alt="Invoice Hanford"
              className="w-full h-auto object-contain rounded-lg max-h-[50vh] mx-auto select-all shadow-sm"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Simpan Gambar PNG</span>
            </button>

            <button
              onClick={handleOpenNewTab}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-300/80"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka PNG di Tab Baru</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-full text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
