import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Building2,
  FileCheck2,
  ShieldCheck,
  Calendar,
  Truck,
  Copy,
  Check,
  Layers,
  FileImage,
  Loader2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { GoodsReceivedNote, GRNItem } from '../../types';

interface GRNModalProps {
  grn: GoodsReceivedNote | null;
  onClose: () => void;
}

export const GRNModal: React.FC<GRNModalProps> = ({ grn, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadingPage, setDownloadingPage] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Array of refs for each A4 page sheet
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!grn) return null;

  // Enforce requested adjustments
  const displayReceivedDate =
    grn.grnNumber === 'GRN-HGH-2026-0801'
      ? '07 September 2026'
      : (grn.receivedDate || '07 September 2026');

  const displayInspectionDate =
    grn.grnNumber === 'GRN-HGH-2026-0801'
      ? '07 September 2026'
      : (grn.inspectionDate || '07 September 2026');

  // Currency formatting: ALWAYS formatted with $ symbol
  const formatCurrency = (amount: number) => {
    const num = Number(amount) || 0;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Split items across A4 pages
  // Page 1 contains Upper Metadata + Inspection Protocol + Items (up to 7)
  // Page 2 contains Remaining Items + Totals & Financials + 3 Signatures
  const items = grn.items || [];
  let pageChunks: GRNItem[][] = [];

  if (items.length <= 6) {
    pageChunks = [items];
  } else if (items.length <= 14) {
    pageChunks = [items.slice(0, 7), items.slice(7)];
  } else {
    // For > 14 items, split first 7, then chunks of 8
    pageChunks.push(items.slice(0, 7));
    let idx = 7;
    while (idx < items.length) {
      const remaining = items.length - idx;
      if (remaining <= 8) {
        pageChunks.push(items.slice(idx));
        break;
      } else {
        pageChunks.push(items.slice(idx, idx + 8));
        idx += 8;
      }
    }
  }

  const totalPages = pageChunks.length;

  const handlePrint = () => {
    window.print();
  };

  // Download a single page by index
  const handleDownloadSinglePage = async (pageIndex: number) => {
    const el = pageRefs.current[pageIndex];
    if (!el) return;
    try {
      setDownloadingPage(pageIndex);
      const dataUrl = await toPng(el, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
        cacheBust: true
      });
      const link = document.createElement('a');
      const suffix = totalPages > 1 ? `-Page-${pageIndex + 1}` : '';
      link.download = `${grn.grnNumber || 'GRN'}${suffix}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(`Failed to export GRN page ${pageIndex + 1}:`, err);
    } finally {
      setDownloadingPage(null);
    }
  };

  // Download all pages sequentially
  const handleDownloadAllPages = async () => {
    try {
      setDownloading(true);
      for (let i = 0; i < totalPages; i++) {
        const el = pageRefs.current[i];
        if (el) {
          const dataUrl = await toPng(el, {
            quality: 0.98,
            pixelRatio: 2,
            backgroundColor: '#FFFFFF',
            cacheBust: true
          });
          const link = document.createElement('a');
          link.download = `${grn.grnNumber || 'GRN'}-Page-${i + 1}.png`;
          link.href = dataUrl;
          link.click();
          // Short pause between downloads to let browser process
          if (i < totalPages - 1) {
            await new Promise((resolve) => setTimeout(resolve, 600));
          }
        }
      }
    } catch (err) {
      console.error('Failed to export all GRN pages:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopySummary = () => {
    const text = `GOODS RECEIVED NOTE (GRN)
Ref: ${grn.grnNumber}
Supplier: ${grn.supplierName}
PO Ref: ${grn.purchaseOrderRef}
Invoice Ref: ${grn.invoiceNumber}
Property: ${grn.receivingProperty}
Received Date: ${displayReceivedDate}
Total Items: ${grn.items.length} lines (${grn.totalReceivedUnits} units)
Grand Total Value: ${formatCurrency(grn.grandTotal)}
Status: ${grn.status}
Received By: ${grn.receivedBy}
Inspected By: ${grn.inspectedBy}
Acknowledged & Approved By: Bramantyo Wardhana (Corporate F&B Purchasing Director)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reusable official Header matching Invoice layout
  const renderHeader = (pageIndex: number) => (
    <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#3A4F67] pb-6 gap-6">
      <div>
        <div className="text-2xl sm:text-3xl font-serif font-semibold text-[#3A4F67] tracking-[0.2em] uppercase flex items-center gap-2">
          <span>HANFORD</span>
          <span className="w-2 h-2 rounded-full bg-[#51867E]" />
        </div>
        <p className="text-[11px] font-semibold text-[#51867E] uppercase tracking-widest mt-1.5">
          HOTELS & RESORTS &bull; CENTRAL PROCUREMENT & SUPPLY CHAIN OPERATIONS
        </p>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#2C3744] mt-2 tracking-wide">
          GOODS RECEIVED NOTE (GRN)
        </h1>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-medium">
          <svg className="w-3.5 h-3.5 fill-current text-slate-800 shrink-0" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>x.com/Hanford_HnR</span>
        </div>
      </div>

      <div className="sm:text-right space-y-1.5 shrink-0 sm:self-center">
        <div className="inline-block px-3.5 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded tracking-wider shadow-xs">
          {grn.grnNumber}
        </div>
        <div className="text-xs font-bold text-[#3A4F67]">
          PO Ref: <span className="font-mono">{grn.purchaseOrderRef || 'PO-HGH-2026-0801'}</span>
        </div>
        <div className="text-xs text-slate-500">
          Date Received: <strong className="text-slate-800 font-semibold">{displayReceivedDate}</strong>
        </div>
        <div className="text-xs text-slate-500">
          Inspection: <strong className="text-slate-800 font-semibold">{displayInspectionDate}</strong>
        </div>
        <div className="pt-1 flex sm:justify-end items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#51867E]/10 border border-[#51867E] text-[#51867E] rounded-md font-bold text-[10px] uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-[#51867E]" />
            <span>{grn.status}</span>
          </span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono font-medium pt-0.5">
          Sheet: Page {pageIndex + 1} of {totalPages}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      {/* CSS Styles for Clean Multi-page A4 Printing */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 10mm 10mm 10mm;
          }
          body {
            background: #ffffff !important;
          }
          body * {
            visibility: hidden;
          }
          #grn-modal-printable-container, #grn-modal-printable-container * {
            visibility: visible;
          }
          #grn-modal-printable-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .grn-a4-page {
            page-break-after: always;
            break-after: page;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 0 20mm 0 !important;
            width: 100% !important;
            min-height: auto !important;
          }
          .grn-a4-page:last-child {
            page-break-after: auto;
            break-after: auto;
            margin-bottom: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">
        
        {/* Modal Toolbar Header */}
        <div className="p-4 px-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#51867E] text-white rounded-lg">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide text-white">
                  Goods Received Note: {grn.grnNumber}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border bg-[#51867E]/20 text-[#88B2AB] border-[#51867E]/30">
                  {totalPages > 1 ? `${totalPages} A4 Pages` : '1 A4 Page'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official receiving & quality inspection document &bull; Hanford Hotels & Resorts
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Summary text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print document or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* If multiple pages, provide page-specific download buttons */}
            {totalPages > 1 ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDownloadSinglePage(0)}
                  disabled={downloading || downloadingPage !== null}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  title="Download Page 1 as PNG"
                >
                  {downloadingPage === 0 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileImage className="w-3.5 h-3.5" />}
                  <span>Page 1</span>
                </button>

                <button
                  onClick={() => handleDownloadSinglePage(1)}
                  disabled={downloading || downloadingPage !== null}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  title="Download Page 2 as PNG"
                >
                  {downloadingPage === 1 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileImage className="w-3.5 h-3.5" />}
                  <span>Page 2</span>
                </button>

                <button
                  onClick={handleDownloadAllPages}
                  disabled={downloading || downloadingPage !== null}
                  className="px-3.5 py-1.5 bg-[#51867E] hover:bg-[#43726a] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  title="Download both A4 pages as high-resolution PNG images"
                >
                  {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Download All ({totalPages} PNGs)</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleDownloadSinglePage(0)}
                disabled={downloadingPage !== null}
                className="px-3.5 py-1.5 bg-[#51867E] hover:bg-[#43726a] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {downloadingPage === 0 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Download PNG</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="overflow-y-auto flex-grow p-4 sm:p-8 bg-slate-200/80 flex flex-col items-center gap-8">
          <div id="grn-modal-printable-container" className="w-full flex flex-col items-center gap-8">
            
            {/* PAGE 1: Upper Details, QA Protocol, Items Part 1 */}
            <div
              ref={(el) => { pageRefs.current[0] = el; }}
              className="grn-a4-page w-full max-w-4xl bg-white p-6 sm:p-10 shadow-xl border border-slate-200 text-slate-800 text-xs font-sans space-y-6 rounded-xl relative"
              style={{ minHeight: totalPages > 1 ? '1080px' : 'auto' }}
            >
              {/* Official Invoice-Styled Header */}
              {renderHeader(0)}

              {/* 2-Column Info: Supplier vs Receiving Facility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* Supplier Info */}
                <div className="space-y-1.5 pr-2 md:border-r md:border-slate-200">
                  <div className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider">
                    Supplier / Vendor Details:
                  </div>
                  <div className="font-bold text-sm text-[#2C3744]">{grn.supplierName}</div>
                  {grn.supplierContactPerson && (
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-500">Contact:</span> {grn.supplierContactPerson}
                    </div>
                  )}
                  {grn.supplierAddress && (
                    <div className="text-slate-600 text-[11px] leading-relaxed">
                      <span className="font-semibold text-slate-500">Address:</span> {grn.supplierAddress}
                    </div>
                  )}
                  {grn.supplierPhoneOrEmail && (
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-500">Tel/Email:</span> {grn.supplierPhoneOrEmail}
                    </div>
                  )}
                </div>

                {/* Receiving Destination Info */}
                <div className="space-y-1.5 pl-0 md:pl-2">
                  <div className="text-[10px] font-bold text-[#51867E] uppercase tracking-wider">
                    Receiving Destination & Department:
                  </div>
                  <div className="font-bold text-sm text-[#2C3744]">{grn.receivingProperty}</div>
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-500">Department:</span> {grn.receivingDepartment}
                  </div>
                  {grn.receivingAddress && (
                    <div className="text-slate-600 text-[11px] leading-relaxed">
                      <span className="font-semibold text-slate-500">Location:</span> {grn.receivingAddress}
                    </div>
                  )}
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-500">Received By:</span> {grn.receivedBy}
                  </div>
                </div>
              </div>

              {/* Document Cross-References Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Supplier Invoice No</span>
                  <strong className="text-slate-800 font-mono text-xs">{grn.invoiceNumber || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Purchase Order Ref</span>
                  <strong className="text-slate-800 font-mono text-xs">{grn.purchaseOrderRef || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Delivery Note / Waybill</span>
                  <strong className="text-slate-800 font-mono text-xs">{grn.deliveryNoteRef || 'DN-VERIFIED'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Carrier / Vehicle Plate</span>
                  <strong className="text-slate-800 font-mono text-xs">{grn.vehicleNumber || 'Refrigerated Carrier'}</strong>
                </div>
              </div>

              {/* Quality & Physical Verification Checklist */}
              <div className="p-3.5 bg-[#EAF2F1] rounded-xl border border-[#51867E]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#3A4F67] font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-[#51867E]" />
                    <span>Quality Assurance & Receiving Inspection Protocol</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#51867E] text-white px-2.5 py-0.5 rounded-full uppercase">
                    100% QA Inspection Verified
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#51867E] shrink-0" />
                    <span>Packaging Intact & Clean</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#51867E] shrink-0" />
                    <span>Cold-Chain Temp Met</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#51867E] shrink-0" />
                    <span>Expiry & Freshness OK</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#51867E] shrink-0" />
                    <span>Weights & Counts Verified</span>
                  </div>
                </div>
              </div>

              {/* Itemized Table - Page 1 Items */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3">Item / Description</th>
                      <th className="py-2.5 px-3 text-right">Ordered</th>
                      <th className="py-2.5 px-3 text-right">Received</th>
                      <th className="py-2.5 px-3 text-right">Accepted</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                      <th className="py-2.5 px-3">Allocated Storage Bin</th>
                      <th className="py-2.5 px-3 text-center">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-normal">
                    {pageChunks[0].map((item, idx) => (
                      <tr
                        key={item.id || idx}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {item.description}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                          {item.quantityOrdered.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                          {item.quantityReceived.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                          {item.quantityAccepted.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                          {formatCurrency(item.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[10px]">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
                            {item.storageLocation || 'Central Store'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            item.quantityRejected > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.quantityRejected > 0 ? 'Discrepancy' : 'Good / QC OK'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* If Multi-page, show continuation note */}
              {totalPages > 1 && (
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-[11px] text-slate-500 font-medium">
                  &bull; Showing items 1 to {pageChunks[0].length} of {items.length}. &bull;
                </div>
              )}

              {/* If Single-page, render totals & signatures here directly */}
              {totalPages === 1 && (
                <>
                  {/* Financials & Volume Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                      <strong className="text-slate-700 block font-semibold">Warehouse Receiving Notes:</strong>
                      <p className="text-slate-600 leading-relaxed italic">
                        &ldquo;{grn.notes || 'All delivery items inspected upon arrival at Hanford Grand Hotel Jakarta. Physical counts, cold chain temperature readings, and supplier seals verified in accordance with corporate standards.'}&rdquo;
                      </p>
                      {grn.bankDetails && grn.bankDetails.bankName && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                          <div><span className="font-semibold">Settlement:</span> {grn.bankDetails.bankName} - {grn.bankDetails.accountNumber} ({grn.bankDetails.accountName})</div>
                          <div><span className="font-semibold">Terms:</span> {grn.bankDetails.paymentTerms || 'Net 30 Days'}</div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Total Line Items:</span>
                        <span className="font-mono font-bold text-slate-800">{grn.items.length} items</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Total Physical Units Received:</span>
                        <span className="font-mono font-bold text-slate-800">{grn.totalReceivedUnits.toLocaleString()} units</span>
                      </div>
                      <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                        <span>Subtotal Net:</span>
                        <span className="font-mono font-semibold text-slate-800">{formatCurrency(grn.subtotalNet)}</span>
                      </div>
                      {grn.taxAmount !== undefined && grn.taxAmount > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>VAT / Tax ({grn.taxPercent || 11}%):</span>
                          <span className="font-mono text-slate-800">{formatCurrency(grn.taxAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold pt-2 border-t-2 border-slate-300 text-[#2C3744]">
                        <span>Total Invoice / GRN Value:</span>
                        <span className="font-mono text-[#51867E] text-base">{formatCurrency(grn.grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Tier Signatures */}
                  <div className="pt-6 border-t border-slate-300">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-4">
                      Authorization Signatures:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-[11px]">
                      {/* 1. Receiving Officer */}
                      <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-3">
                        <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          1. Received By (Warehouse)
                        </div>
                        <div className="h-10 flex items-center justify-center">
                          <span className="font-serif italic text-base text-slate-700 tracking-widest">
                            Aris Munandar
                          </span>
                        </div>
                        <div className="border-t border-slate-300 pt-1.5 space-y-0.5">
                          <div className="font-bold text-slate-800">{grn.receivedBy || 'Aris Munandar'}</div>
                          <div className="text-[10px] text-slate-500">Receiving & Warehouse Bay</div>
                          <div className="text-[9px] text-slate-400">{displayReceivedDate}</div>
                        </div>
                      </div>

                      {/* 2. QA Inspector */}
                      <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-3">
                        <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          2. Inspected & Verified By (QA)
                        </div>
                        <div className="h-10 flex items-center justify-center">
                          <span className="font-serif italic text-base text-[#51867E] tracking-widest font-semibold">
                            Marco Valentino
                          </span>
                        </div>
                        <div className="border-t border-slate-300 pt-1.5 space-y-0.5">
                          <div className="font-bold text-slate-800">{grn.inspectedBy || 'Chef Marco Valentino'}</div>
                          <div className="text-[10px] text-slate-500">Executive Sous Chef / Quality Lead</div>
                          <div className="text-[9px] text-slate-400">{displayInspectionDate}</div>
                        </div>
                      </div>

                      {/* 3. Acknowledged & Approved By: F&B Purchasing */}
                      <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-3">
                        <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          3. Acknowledged & Approved By
                        </div>
                        <div className="h-10 flex items-center justify-center">
                          <span className="font-serif italic text-base text-[#3A4F67] tracking-widest font-bold">
                            B. Wardhana
                          </span>
                        </div>
                        <div className="border-t border-slate-300 pt-1.5 space-y-0.5">
                          <div className="font-bold text-slate-800">
                            Bramantyo Wardhana, M.M.
                          </div>
                          <div className="text-[10px] font-semibold text-[#51867E]">
                            F&B Purchasing
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Corporate F&B Purchasing Director
                          </div>
                          <div className="text-[9px] text-slate-400">
                            {displayReceivedDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Clean Corporate Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-[10px] text-slate-400">
                <span>Hanford Hotels & Resorts Office</span>
                <span>Official Internal Record &bull; Page 1 of {totalPages}</span>
              </div>
            </div>

            {/* PAGE 2 (If multi-page): Remaining items, Financial calculations, and Signatures */}
            {totalPages > 1 && (
              <>
                {/* Visual Separator on Screen (Hidden on Print) */}
                <div className="no-print flex items-center justify-center gap-3 w-full max-w-4xl py-1">
                  <div className="h-px bg-slate-300 flex-grow" />
                  <span className="px-4 py-1.5 bg-slate-800 text-slate-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                    <Layers className="w-3.5 h-3.5 text-[#51867E]" />
                    <span>Page 2 Continuation</span>
                  </span>
                  <div className="h-px bg-slate-300 flex-grow" />
                </div>

                <div
                  ref={(el) => { pageRefs.current[1] = el; }}
                  className="grn-a4-page w-full max-w-4xl bg-white p-6 sm:p-10 shadow-xl border border-slate-200 text-slate-800 text-xs font-sans space-y-6 rounded-xl relative"
                  style={{ minHeight: '1080px' }}
                >
                  {/* Same Official Invoice-Styled Header */}
                  {renderHeader(1)}

                  {/* Itemized Table - Page 2 Items */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 w-8 text-center">#</th>
                          <th className="py-2.5 px-3">Item / Description</th>
                          <th className="py-2.5 px-3 text-right">Ordered</th>
                          <th className="py-2.5 px-3 text-right">Received</th>
                          <th className="py-2.5 px-3 text-right">Accepted</th>
                          <th className="py-2.5 px-3 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">Total Amount</th>
                          <th className="py-2.5 px-3">Allocated Storage Bin</th>
                          <th className="py-2.5 px-3 text-center">Condition</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-normal">
                        {pageChunks[1].map((item, idx) => {
                          const itemIndex = pageChunks[0].length + idx + 1;
                          return (
                            <tr
                              key={item.id || idx}
                              className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                            >
                              <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[10px]">
                                {itemIndex}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">
                                {item.description}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                                {item.quantityOrdered.toLocaleString()} {item.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                                {item.quantityReceived.toLocaleString()} {item.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                                {item.quantityAccepted.toLocaleString()} {item.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                                {formatCurrency(item.totalAmount)}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 text-[10px]">
                                <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
                                  {item.storageLocation || 'Central Store'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  item.quantityRejected > 0
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {item.quantityRejected > 0 ? 'Discrepancy' : 'Good / QC OK'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Financials & Volume Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
                    {/* Warehouse Receiving Notes */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                      <strong className="text-slate-700 block font-semibold">Warehouse Receiving Notes:</strong>
                      <p className="text-slate-600 leading-relaxed italic">
                        &ldquo;{grn.notes || 'All delivery items inspected upon arrival at Hanford Grand Hotel Jakarta. Physical counts, cold chain temperature readings, and supplier seals verified in accordance with corporate standards.'}&rdquo;
                      </p>
                      {grn.bankDetails && grn.bankDetails.bankName && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                          <div><span className="font-semibold">Settlement:</span> {grn.bankDetails.bankName} - {grn.bankDetails.accountNumber} ({grn.bankDetails.accountName})</div>
                          <div><span className="font-semibold">Terms:</span> {grn.bankDetails.paymentTerms || 'Net 30 Days'}</div>
                        </div>
                      )}
                    </div>

                    {/* Financial Calculation Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Total Line Items:</span>
                        <span className="font-mono font-bold text-slate-800">{grn.items.length} items</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Total Physical Units Received:</span>
                        <span className="font-mono font-bold text-slate-800">{grn.totalReceivedUnits.toLocaleString()} units</span>
                      </div>
                      <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                        <span>Subtotal Net:</span>
                        <span className="font-mono font-semibold text-slate-800">{formatCurrency(grn.subtotalNet)}</span>
                      </div>
                      {grn.taxAmount !== undefined && grn.taxAmount > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>VAT / Tax ({grn.taxPercent || 11}%):</span>
                          <span className="font-mono text-slate-800">{formatCurrency(grn.taxAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold pt-2 border-t-2 border-slate-300 text-[#2C3744]">
                        <span>Total Invoice / GRN Value:</span>
                        <span className="font-mono text-[#51867E] text-base">{formatCurrency(grn.grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Tier Official Signature & Verification Sign-Off Blocks */}
                  <div className="pt-6 border-t border-slate-300">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-4">
                      Authorization Signatures:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-[11px]">
                      {/* 1. Receiving Officer */}
                      <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-3">
                        <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          1. Received By (Warehouse)
                        </div>
                        <div className="h-10 flex items-center justify-center">
                          <span className="font-serif italic text-base text-slate-700 tracking-widest">
                            Aris Munandar
                          </span>
                        </div>
                        <div className="border-t border-slate-300 pt-1.5 space-y-0.5">
                          <div className="font-bold text-slate-800">{grn.receivedBy || 'Aris Munandar'}</div>
                          <div className="text-[10px] text-slate-500">Receiving & Warehouse Bay</div>
                          <div className="text-[9px] text-slate-400">{displayReceivedDate}</div>
                        </div>
                      </div>

                      {/* 2. QA Inspector */}
                      <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-3">
                        <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          2. Inspected & Verified By (QA)
                        </div>
                        <div className="h-10 flex items-center justify-center">
                          <span className="font-serif italic text-base text-[#51867E] tracking-widest font-semibold">
                            Marco Valentino
                          </span>
                        </div>
                        <div className="border-t border-slate-300 pt-1.5 space-y-0.5">
                          <div className="font-bold text-slate-800">{grn.inspectedBy || 'Chef Marco Valentino'}</div>
                          <div className="text-[10px] text-slate-500">Executive Sous Chef / Quality Lead</div>
                          <div className="text-[9px] text-slate-400">{displayInspectionDate}</div>
                        </div>
                      </div>

                      {/* 3. Acknowledged & Approved By: F&B Purchasing */}
                      <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-3">
                        <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          3. Acknowledged & Approved By
                        </div>
                        <div className="h-10 flex items-center justify-center">
                          <span className="font-serif italic text-base text-[#3A4F67] tracking-widest font-bold">
                            B. Wardhana
                          </span>
                        </div>
                        <div className="border-t border-slate-300 pt-1.5 space-y-0.5">
                          <div className="font-bold text-slate-800">
                            Bramantyo Wardhana, M.M.
                          </div>
                          <div className="text-[10px] font-semibold text-[#51867E]">
                            F&B Purchasing
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Corporate F&B Purchasing Director
                          </div>
                          <div className="text-[9px] text-slate-400">
                            {displayReceivedDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clean Corporate Footer */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-[10px] text-slate-400">
                    <span>Hanford Hotels & Resorts Office</span>
                    <span>Official Internal Record &bull; Page 2 of {totalPages}</span>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Internal Goods Received Note &bull; Ready for accounting settlement & inventory stock update.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
