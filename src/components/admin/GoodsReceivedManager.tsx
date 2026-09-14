import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  Eye,
  Building2,
  Calendar,
  Sparkles,
  ClipboardPaste,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { GoodsReceivedNote, Property } from '../../types';
import { getGoodsReceivedNotes, saveGoodsReceivedNote, deleteGoodsReceivedNote } from '../../services/dataService';
import { GRNModal } from './GRNModal';
import { CreateGRNModal } from './CreateGRNModal';

interface GoodsReceivedManagerProps {
  properties: Property[];
}

export const GoodsReceivedManager: React.FC<GoodsReceivedManagerProps> = ({ properties }) => {
  const [grnList, setGrnList] = useState<GoodsReceivedNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [propertyFilter, setPropertyFilter] = useState<string>('ALL');

  // Modals
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceivedNote | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = () => {
    const list = getGoodsReceivedNotes();
    setGrnList(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyGrnNumber = (grnNumber: string) => {
    navigator.clipboard.writeText(grnNumber);
    setCopiedId(grnNumber);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, grnNumber: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus dokumen GRN: ${grnNumber}?`)) {
      deleteGoodsReceivedNote(id);
      loadData();
      if (selectedGRN?.id === id) {
        setSelectedGRN(null);
      }
    }
  };

  const handleSaveNewGRN = (newGRN: GoodsReceivedNote) => {
    saveGoodsReceivedNote(newGRN);
    loadData();
    setIsCreateOpen(false);
    // Immediately open the newly generated GRN document for view/print!
    setSelectedGRN(newGRN);
  };

  // Filtered List
  const filteredGRNs = grnList.filter((grn) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      grn.grnNumber.toLowerCase().includes(q) ||
      grn.supplierName.toLowerCase().includes(q) ||
      grn.invoiceNumber.toLowerCase().includes(q) ||
      grn.purchaseOrderRef.toLowerCase().includes(q) ||
      grn.receivingProperty.toLowerCase().includes(q) ||
      grn.items.some((item) => item.description.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' || grn.status.toUpperCase() === statusFilter.toUpperCase();

    const matchesProperty =
      propertyFilter === 'ALL' ||
      grn.receivingProperty.toLowerCase().includes(propertyFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesProperty;
  });

  // Aggregate Metrics
  const totalGRNs = grnList.length;
  const totalValuation = grnList.reduce((sum, g) => sum + (g.grandTotal || 0), 0);
  const totalUnitsReceived = grnList.reduce((sum, g) => sum + (g.totalReceivedUnits || 0), 0);
  const totalItemsCount = grnList.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#2C3744] to-[#3A4F67] text-white rounded-2xl shadow-lg border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#51867E]/30 text-[#88B2AB] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#51867E]/40">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Goods Receiving & Warehouse QA Inspection</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-light text-white tracking-wide">
            Goods Received Notes (GRN)
          </h2>
          <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
            Internal receiving documents confirming physical delivery, cold chain temperature checks, and quality inspections of goods supplied to Hanford Hotels & Resorts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-[#51867E] hover:bg-[#43726a] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>+ Create GRN from Text / Invoice</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total GRN Issued</span>
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalGRNs}</div>
          <p className="text-[11px] text-slate-500">Documented warehouse receipts</p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Value Received</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-[#51867E]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#51867E]">
            ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500">Verified inventory valuation</p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Physical Volume</span>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {totalUnitsReceived.toLocaleString()} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-slate-500">Across {totalItemsCount} verified line items</p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Inspection Standard</span>
            <div className="p-1.5 bg-teal-50 rounded-lg text-teal-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">100%</div>
          <p className="text-[11px] text-emerald-600 font-medium">HACCP & Freshness compliant</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search GRN#, PO#, Invoice#, Supplier..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#51867E]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Inspection Statuses</option>
            <option value="INSPECTED & ACCEPTED">Inspected & Accepted</option>
            <option value="PARTIALLY ACCEPTED">Partially Accepted</option>
            <option value="UNDER INSPECTION">Under Inspection</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Property Filter */}
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Destinations</option>
            <option value="Jakarta">Hanford Grand Hotel Jakarta</option>
            <option value="Bali">Hanford Resort Bali</option>
            <option value="Bandung">Hanford Heritage Bandung</option>
            <option value="Lombok">Hanford Sanctuary Lombok</option>
          </select>

          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* GRN Table / Cards List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredGRNs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Tidak ada dokumen GRN ditemukan</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Klik tombol di bawah untuk membuat Goods Received Note otomatis dari teks invoice supplier.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-[#51867E] hover:bg-[#43726a] text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Buat GRN Baru dari Teks</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">GRN Document #</th>
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4">PO & Invoice Ref</th>
                  <th className="py-3 px-4">Receiving Destination</th>
                  <th className="py-3 px-4 text-center">Items & Units</th>
                  <th className="py-3 px-4 text-right">Total GRN Value</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredGRNs.map((grn) => (
                  <tr key={grn.id} className="hover:bg-slate-50 transition-colors">
                    {/* GRN Number */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {grn.grnNumber}
                        </span>
                        <button
                          onClick={() => handleCopyGrnNumber(grn.grnNumber)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                          title="Copy GRN Number"
                        >
                          {copiedId === grn.grnNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Received: {grn.receivedDate}
                      </span>
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{grn.supplierName}</div>
                      {grn.supplierContactPerson && (
                        <div className="text-[10px] text-slate-500">
                          {grn.supplierContactPerson}
                        </div>
                      )}
                    </td>

                    {/* PO & Invoice */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-sans">PO: </span>
                        <strong className="text-slate-700">{grn.purchaseOrderRef || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-sans">INV: </span>
                        <strong className="text-slate-700">{grn.invoiceNumber || 'N/A'}</strong>
                      </div>
                    </td>

                    {/* Property */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700 text-xs">
                        {grn.receivingProperty}
                      </div>
                      <div className="text-[10px] text-slate-500">{grn.receivedBy}</div>
                    </td>

                    {/* Items & Units */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-bold text-slate-700 text-xs">
                        {grn.items.length} lines
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {grn.totalReceivedUnits.toLocaleString()} units
                      </span>
                    </td>

                    {/* Value */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-bold text-[#51867E] text-sm">
                        ${grn.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Net: ${grn.subtotalNet.toLocaleString()}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          grn.status === 'Inspected & Accepted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : grn.status === 'Partially Accepted'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {grn.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedGRN(grn)}
                          className="px-2.5 py-1.5 bg-[#51867E] hover:bg-[#43726a] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          title="View & Print Official GRN Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View GRN</span>
                        </button>

                        <button
                          onClick={() => handleDelete(grn.id, grn.grnNumber)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Hapus GRN"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: View & Print GRN Document */}
      {selectedGRN && (
        <GRNModal grn={selectedGRN} onClose={() => setSelectedGRN(null)} />
      )}

      {/* MODAL: Create GRN from Text / Invoice */}
      {isCreateOpen && (
        <CreateGRNModal
          onClose={() => setIsCreateOpen(false)}
          onSave={handleSaveNewGRN}
        />
      )}
    </div>
  );
};
