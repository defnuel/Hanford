import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ClipboardPaste,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Building2,
  Truck,
  ShieldCheck,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';
import { GoodsReceivedNote, GRNItem } from '../../types';
import { parseInvoiceToGRN, SAMPLE_KEBUN_ASAP_INVOICE_TEXT, determineStorageLocation } from '../../utils/grnParser';

interface CreateGRNModalProps {
  onClose: () => void;
  onSave: (grn: GoodsReceivedNote) => void;
}

export const CreateGRNModal: React.FC<CreateGRNModalProps> = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'review'>('paste');
  const [rawText, setRawText] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Form State initialized from parser or defaults
  const [supplierName, setSupplierName] = useState('Kebun Asap Group');
  const [supplierAddress, setSupplierAddress] = useState('Kebun Estate, Lembang, West Java, Indonesia');
  const [supplierContactPerson, setSupplierContactPerson] = useState('Satyendra Pranata Dirgantara');
  
  const [receivingProperty, setReceivingProperty] = useState('Hanford Grand Hotel Jakarta');
  const [receivingDepartment, setReceivingDepartment] = useState('Central Receiving Bay & F&B Stores');
  const [receivedBy, setReceivedBy] = useState('Aris Munandar (Receiving Officer)');
  const [inspectedBy, setInspectedBy] = useState('Chef Marco Valentino (Executive Sous Chef & QA)');
  const [approvedBy, setApprovedBy] = useState('Bramantyo Wardhana (Corporate F&B Purchasing Director)');

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseOrderRef, setPurchaseOrderRef] = useState('');
  const [issuanceDate, setIssuanceDate] = useState('');
  const [receivedDate, setReceivedDate] = useState(
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  );
  const [vehicleNumber, setVehicleNumber] = useState('B 9482 KBA (Refrigerated Truck)');
  const [currency, setCurrency] = useState('USD');
  const [taxPercent, setTaxPercent] = useState<number>(11);
  const [notes, setNotes] = useState('Physical delivery verified and accepted in good order.');

  const [items, setItems] = useState<GRNItem[]>([]);

  const [checks, setChecks] = useState({
    packagingIntact: true,
    temperatureCompliant: true,
    expiryDateVerified: true,
    weightCountVerified: true,
    foodSafetyHACCP: true
  });

  // Action: Load sample invoice text
  const handleLoadSample = () => {
    setRawText(SAMPLE_KEBUN_ASAP_INVOICE_TEXT);
    setParseError(null);
  };

  // Action: Parse raw text into structured GRN form
  const handleAutoParse = async () => {
    if (!rawText.trim()) {
      setParseError('Silakan masukkan atau tempel teks invoice/dokumen pengiriman terlebih dahulu.');
      return;
    }

    try {
      setParsing(true);
      setParseError(null);

      // Deterministic & robust parser
      const parsed = parseInvoiceToGRN(rawText);

      setSupplierName(parsed.supplierName || 'Kebun Asap Group');
      setSupplierAddress(parsed.supplierAddress || 'Kebun Estate, Lembang, West Java, Indonesia');
      setSupplierContactPerson(parsed.supplierContactPerson || 'Satyendra Pranata Dirgantara');
      
      setReceivingProperty(parsed.receivingProperty || 'Hanford Grand Hotel Jakarta');
      setReceivingDepartment(parsed.receivingDepartment || 'Central Receiving Bay & F&B Stores');
      setReceivedBy(parsed.receivedBy || 'Aris Munandar (Receiving Officer)');
      setInspectedBy(parsed.inspectedBy || 'Chef Marco Valentino (Executive Sous Chef & QA)');
      setApprovedBy(parsed.approvedBy || 'Bramantyo Wardhana (Corporate F&B Purchasing Director)');

      setInvoiceNumber(parsed.invoiceNumber || 'INV-KA-HGH-2026-001');
      setPurchaseOrderRef(parsed.purchaseOrderRef || 'PO-HGH-2026-0801');
      setIssuanceDate(parsed.issuanceDate || '07 September 2026');
      setReceivedDate(parsed.receivedDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }));
      setVehicleNumber(parsed.vehicleNumber || 'B 9482 KBA (Refrigerated Truck)');
      setCurrency(parsed.currency || 'USD');
      setTaxPercent(parsed.taxPercent || 11);
      setNotes(parsed.notes || 'Inspected & accepted in pristine fresh condition.');

      setItems(parsed.items);
      setChecks(parsed.inspectionChecks);

      // Automatically switch to review tab
      setActiveTab('review');
    } catch (err: any) {
      console.error('Parsing error:', err);
      setParseError('Gagal memproses teks invoice: ' + (err?.message || String(err)));
    } finally {
      setParsing(false);
    }
  };

  // Action: Item quantity adjustments
  const handleItemChange = (index: number, field: keyof GRNItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: value };

      if (field === 'quantityReceived' || field === 'quantityAccepted') {
        const received = field === 'quantityReceived' ? Number(value) : target.quantityReceived;
        const accepted = field === 'quantityAccepted' ? Number(value) : target.quantityAccepted;
        target.quantityRejected = Math.max(0, received - accepted);
        target.totalAmount = accepted * target.unitPrice;
      }

      if (field === 'unitPrice') {
        target.totalAmount = target.quantityAccepted * Number(value);
      }

      copy[index] = target;
      return copy;
    });
  };

  // Action: Add blank item line
  const handleAddItem = () => {
    const itemNum = items.length + 1;
    const newItem: GRNItem = {
      id: `grn-manual-${Date.now()}-${itemNum}`,
      itemNumber: itemNum,
      description: 'New Supply Item',
      quantityOrdered: 10,
      quantityReceived: 10,
      quantityAccepted: 10,
      quantityRejected: 0,
      unit: 'KG',
      unitPrice: 5.0,
      totalAmount: 50.0,
      storageLocation: 'Central Warehouse / Receiving Bay',
      inspectionCondition: 'Passed QC / Good Condition',
      remarks: 'Verified'
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotalNet = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const taxAmount = Math.round(subtotalNet * (taxPercent / 100) * 100) / 100;
  const grandTotal = Math.round((subtotalNet + taxAmount) * 100) / 100;
  const totalOrderedUnits = items.reduce((sum, item) => sum + (item.quantityOrdered || 0), 0);
  const totalReceivedUnits = items.reduce((sum, item) => sum + (item.quantityReceived || 0), 0);
  const totalAcceptedUnits = items.reduce((sum, item) => sum + (item.quantityAccepted || 0), 0);
  const totalRejectedUnits = items.reduce((sum, item) => sum + (item.quantityRejected || 0), 0);

  // Final submit
  const handleSaveGRN = () => {
    const cleanPoTag = purchaseOrderRef.replace(/[^A-Za-z0-9]/g, '').slice(-4) || '0801';
    const finalGrnNumber = `GRN-HGH-2026-${cleanPoTag}`;

    const newGRN: GoodsReceivedNote = {
      id: `grn-${Date.now()}`,
      grnNumber: finalGrnNumber,
      status: totalRejectedUnits > 0 ? 'Partially Accepted' : 'Inspected & Accepted',
      supplierName: supplierName.trim() || 'Supplier Partner',
      supplierAddress: supplierAddress.trim(),
      supplierContactPerson: supplierContactPerson.trim(),
      receivingProperty: receivingProperty.trim() || 'Hanford Grand Hotel Jakarta',
      receivingDepartment: receivingDepartment.trim() || 'Central Receiving Bay',
      receivedBy: receivedBy.trim(),
      inspectedBy: inspectedBy.trim(),
      approvedBy: approvedBy.trim(),
      invoiceNumber: invoiceNumber.trim() || `INV-${Date.now().toString().slice(-6)}`,
      purchaseOrderRef: purchaseOrderRef.trim() || `PO-HGH-2026-${cleanPoTag}`,
      deliveryNoteRef: `DN-${cleanPoTag}`,
      vehicleNumber: vehicleNumber.trim(),
      issuanceDate: issuanceDate.trim() || receivedDate,
      receivedDate: receivedDate.trim(),
      inspectionDate: receivedDate.trim(),
      items,
      currency,
      subtotalNet,
      taxPercent,
      taxAmount,
      grandTotal,
      totalOrderedUnits,
      totalReceivedUnits,
      totalAcceptedUnits,
      totalRejectedUnits,
      inspectionChecks: checks,
      notes: notes.trim(),
      rawSourceText: rawText,
      createdAt: new Date().toISOString()
    };

    onSave(newGRN);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#51867E] text-white rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                <span>Create Goods Received Note (GRN)</span>
                <span className="text-[10px] bg-[#51867E]/30 text-[#88B2AB] px-2 py-0.5 rounded border border-[#51867E]/40 uppercase tracking-widest font-mono">
                  Smart Auto-Parser
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Paste supplier commercial invoice or delivery order to automatically generate and separate all items into GRN.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Stepper Nav */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'paste'
                  ? 'bg-white text-[#51867E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardPaste className="w-4 h-4" />
              <span>1. Paste Invoice / Delivery Text</span>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'review'
                  ? 'bg-white text-[#51867E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>2. Review & Inspect Items ({items.length})</span>
            </button>
          </div>

          {activeTab === 'paste' && (
            <button
              onClick={handleLoadSample}
              className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Load Sample Invoice (Kebun Asap Group)</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-grow p-5 sm:p-6 space-y-6">
          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* TAB 1: PASTE INVOICE TEXT */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Paste Commercial Invoice or Delivery Note Text
                  </h4>
                  <p className="text-xs text-slate-500">
                    Supports ASCII tables, text lists, tab-delimited copied spreadsheets, or invoices from suppliers.
                  </p>
                </div>
                <div className="text-[11px] text-slate-400">
                  {rawText.length > 0 ? `${rawText.split('\n').length} lines pasted` : 'Ready to paste'}
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste your supplier invoice here... (e.g. Kebun Asap Group commercial invoice with items, quantities, and prices)"
                  rows={14}
                  className="w-full font-mono text-xs p-4 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51867E] text-slate-800 placeholder:text-slate-400 leading-relaxed shadow-inner"
                />
              </div>

              {/* Instructions & Help */}
              <div className="p-3 bg-[#EAF2F1] rounded-xl border border-[#51867E]/30 text-xs text-[#2C3744] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#51867E] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-semibold block text-[#3A4F67]">Automatic Field Separation:</strong>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    The engine automatically identifies: Supplier Name, Billed Property, Invoice No, PO Ref, Issuance Date, line items with units (KG, L, Trays, Uts), unit prices, subtotal, VAT 11%, and bank details. It also automatically assigns logical hotel storage locations (Walk-in Freezers, Dairy Cold Rooms, Dry Pantries).
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleLoadSample();
                    setTimeout(() => handleAutoParse(), 100);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Quick Test with Kebun Asap Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoParse}
                  disabled={parsing || !rawText.trim()}
                  className="px-6 py-2.5 bg-[#51867E] hover:bg-[#43726a] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{parsing ? 'Separating Items into GRN...' : 'Auto-Separate & Review GRN →'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REVIEW & VERIFY SEPARATED ITEMS */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              {/* Header Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* Supplier */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Supplier / Vendor Details
                  </span>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Company Name</label>
                    <input
                      type="text"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#51867E]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Contact Person</label>
                      <input
                        type="text"
                        value={supplierContactPerson}
                        onChange={(e) => setSupplierContactPerson(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Address / Origin</label>
                      <input
                        type="text"
                        value={supplierAddress}
                        onChange={(e) => setSupplierAddress(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Receiving Info */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Receiving Facility & Staff
                  </span>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Receiving Property</label>
                    <input
                      type="text"
                      value={receivingProperty}
                      onChange={(e) => setReceivingProperty(e.target.value)}
                      className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">Receiving Officer</label>
                      <input
                        type="text"
                        value={receivedBy}
                        onChange={(e) => setReceivedBy(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">QA Inspector</label>
                      <input
                        type="text"
                        value={inspectedBy}
                        onChange={(e) => setInspectedBy(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference Numbers Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block">Supplier Invoice No</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block">Purchase Order Ref</label>
                  <input
                    type="text"
                    value={purchaseOrderRef}
                    onChange={(e) => setPurchaseOrderRef(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block">Delivery Date</label>
                  <input
                    type="text"
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block">Vehicle / Logistics Plate</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Quality & Physical Inspection Checklist */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#51867E]" />
                  <span>Physical Inspection & QA Checklist Verification:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checks.packagingIntact}
                      onChange={(e) => setChecks({ ...checks, packagingIntact: e.target.checked })}
                      className="rounded text-[#51867E] focus:ring-[#51867E]"
                    />
                    <span>Packaging Intact & Clean</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checks.temperatureCompliant}
                      onChange={(e) => setChecks({ ...checks, temperatureCompliant: e.target.checked })}
                      className="rounded text-[#51867E] focus:ring-[#51867E]"
                    />
                    <span>Cold-Chain Temp Met</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checks.expiryDateVerified}
                      onChange={(e) => setChecks({ ...checks, expiryDateVerified: e.target.checked })}
                      className="rounded text-[#51867E] focus:ring-[#51867E]"
                    />
                    <span>Expiry & Freshness OK</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checks.weightCountVerified}
                      onChange={(e) => setChecks({ ...checks, weightCountVerified: e.target.checked })}
                      className="rounded text-[#51867E] focus:ring-[#51867E]"
                    />
                    <span>Physical Counts Verified</span>
                  </label>
                </div>
              </div>

              {/* Separated Item Breakdown Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-800">
                      Separated Delivery Line Items ({items.length} items)
                    </h4>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                      {totalReceivedUnits.toLocaleString()} Total Units
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-8 text-center">#</th>
                        <th className="py-2.5 px-3 min-w-[180px]">Item Description</th>
                        <th className="py-2.5 px-2 text-right w-20">Ordered</th>
                        <th className="py-2.5 px-2 text-right w-20">Received</th>
                        <th className="py-2.5 px-2 text-right w-20">Accepted</th>
                        <th className="py-2.5 px-2 w-16">Unit</th>
                        <th className="py-2.5 px-2 text-right w-24">Unit Price</th>
                        <th className="py-2.5 px-2 text-right w-24">Total ($)</th>
                        <th className="py-2.5 px-3 min-w-[160px]">Allocated Storage Bin</th>
                        <th className="py-2.5 px-2 w-8 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {items.map((item, idx) => (
                        <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="py-2 px-3 text-center text-slate-400 font-mono text-[10px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              className="w-full p-1 text-xs font-semibold bg-transparent border-b border-transparent focus:border-[#51867E] focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              value={item.quantityOrdered}
                              onChange={(e) => handleItemChange(idx, 'quantityOrdered', parseFloat(e.target.value) || 0)}
                              className="w-full p-1 text-right text-xs font-mono bg-transparent border-b border-transparent focus:border-[#51867E] focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              value={item.quantityReceived}
                              onChange={(e) => handleItemChange(idx, 'quantityReceived', parseFloat(e.target.value) || 0)}
                              className="w-full p-1 text-right text-xs font-mono font-bold bg-transparent border-b border-transparent focus:border-[#51867E] focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              value={item.quantityAccepted}
                              onChange={(e) => handleItemChange(idx, 'quantityAccepted', parseFloat(e.target.value) || 0)}
                              className="w-full p-1 text-right text-xs font-mono font-bold text-emerald-700 bg-transparent border-b border-transparent focus:border-[#51867E] focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                              className="w-full p-1 text-xs text-slate-600 font-mono bg-transparent border-b border-transparent focus:border-[#51867E] focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              step="0.1"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full p-1 text-right text-xs font-mono bg-transparent border-b border-transparent focus:border-[#51867E] focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                            ${(item.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.storageLocation || ''}
                              onChange={(e) => handleItemChange(idx, 'storageLocation', e.target.value)}
                              className="w-full p-1 text-[11px] text-slate-700 bg-transparent border-b border-transparent focus:border-[#51867E] focus:bg-white focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-full sm:max-w-md space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-semibold block">Warehouse Receiving Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                    placeholder="Notes on delivery condition, temperature, packaging, etc."
                  />
                </div>

                <div className="w-full sm:w-72 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Net:</span>
                    <span className="font-mono font-bold text-slate-800">${subtotalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VAT / Tax (11%):</span>
                    <span className="font-mono text-slate-800">${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-300 text-slate-900">
                    <span>Grand Total Value:</span>
                    <span className="font-mono text-[#51867E] text-base">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'review') {
                setActiveTab('paste');
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            {activeTab === 'review' ? '← Back to Paste' : 'Cancel'}
          </button>

          {activeTab === 'paste' ? (
            <button
              type="button"
              onClick={handleAutoParse}
              disabled={!rawText.trim()}
              className="px-5 py-2.5 bg-[#51867E] hover:bg-[#43726a] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Separate & Review ({rawText ? 'Ready' : 'Paste Text First'}) →</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveGRN}
              disabled={items.length === 0}
              className="px-6 py-2.5 bg-[#51867E] hover:bg-[#43726a] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Generate Official GRN ({items.length} Items)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
