import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  HF_SIGNATURE_MENU,
  SIGNATURE_CATEGORY_TABS,
  SignatureMenuCategory,
  SignatureMenuItem,
  SignatureEnhancementOption
} from '../data/hfSignatureMenu';
import {
  DiningServiceType,
  Property,
  SignatureOrderItem,
  SignatureOrderReceipt
} from '../types';
import {
  fetchLocations,
  submitSignatureOrder
} from '../services/dataService';
import { PropertySearchSelect } from '../components/PropertySearchSelect';
import { exportInvoiceAsImage } from '../utils/exportInvoiceImage';
import { Download, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

interface ItemDraftState {
  variant?: string;
  secondaryVariant?: string;
  enhancements: SignatureEnhancementOption[];
}

export const HFSignaturePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<SignatureMenuCategory>('breakfast');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertySlug, setSelectedPropertySlug] = useState<string>('');
  const [serviceType, setServiceType] = useState<DiningServiceType>('restaurant');
  const [isHotelGuest, setIsHotelGuest] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // X Username input (no booking matching needed)
  const [xUsernameInput, setXUsernameInput] = useState<string>('');

  // Per-item draft options (variant, secondaryVariant, enhancements)
  const [itemDrafts, setItemDrafts] = useState<Record<string, ItemDraftState>>({});

  // Cart / Order Items
  const [cartItems, setCartItems] = useState<SignatureOrderItem[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<SignatureOrderReceipt | null>(null);
  const [downloadingPng, setDownloadingPng] = useState<boolean>(false);

  const receiptRef = useRef<HTMLDivElement>(null);
  const exportReceiptRef = useRef<HTMLDivElement>(null);
  const checkoutSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLocations().then((res) => {
      if (res.data && res.data.length > 0) {
        setProperties(res.data);
      }
    });
  }, []);

  const selectedProperty = useMemo(
    () => properties.find((p) => p.slug === selectedPropertySlug) || null,
    [properties, selectedPropertySlug]
  );

  const activeTabMeta = useMemo(
    () => SIGNATURE_CATEGORY_TABS.find((t) => t.id === activeCategory),
    [activeCategory]
  );

  // Group items by section preserving menu order
  const sections = useMemo(() => {
    const filtered = HF_SIGNATURE_MENU.filter((item) => item.category === activeCategory);
    const map = new Map<string, SignatureMenuItem[]>();
    filtered.forEach((item) => {
      const list = map.get(item.section) || [];
      list.push(item);
      map.set(item.section, list);
    });
    return Array.from(map.entries());
  }, [activeCategory]);

  const getDraft = (item: SignatureMenuItem): ItemDraftState => {
    const existing = itemDrafts[item.id];
    return {
      variant: existing?.variant ?? item.variants?.[0],
      secondaryVariant: existing?.secondaryVariant ?? item.secondaryVariants?.[0],
      enhancements: existing?.enhancements ?? []
    };
  };

  const setDraftVariant = (item: SignatureMenuItem, variant: string) => {
    setItemDrafts((prev) => ({
      ...prev,
      [item.id]: {
        ...getDraft(item),
        variant
      }
    }));
  };

  const setDraftSecondaryVariant = (item: SignatureMenuItem, secondaryVariant: string) => {
    setItemDrafts((prev) => ({
      ...prev,
      [item.id]: {
        ...getDraft(item),
        secondaryVariant
      }
    }));
  };

  const toggleDraftEnhancement = (
    item: SignatureMenuItem,
    enh: SignatureEnhancementOption
  ) => {
    setItemDrafts((prev) => {
      const current = getDraft(item);
      const exists = current.enhancements.some((e) => e.id === enh.id);
      const updated = exists
        ? current.enhancements.filter((e) => e.id !== enh.id)
        : [...current.enhancements, enh];
      return {
        ...prev,
        [item.id]: {
          ...current,
          enhancements: updated
        }
      };
    });
  };

  const buildCartKey = (
    menuItemId: string,
    variant?: string,
    secondaryVariant?: string,
    enhancements: SignatureEnhancementOption[] = []
  ) => {
    const enhKey = enhancements
      .map((e) => e.id)
      .sort()
      .join(',');
    return `${menuItemId}__${variant || ''}__${secondaryVariant || ''}__${enhKey}`;
  };

  const handleAddItem = (item: SignatureMenuItem) => {
    const draft = getDraft(item);
    const key = buildCartKey(
      item.id,
      draft.variant,
      draft.secondaryVariant,
      draft.enhancements
    );
    const enhTotal = draft.enhancements.reduce((sum, e) => sum + e.price, 0);
    const unitPrice = item.price + enhTotal;

    setCartItems((prev) => {
      const idx = prev.findIndex((c) => c.id === key);
      if (idx >= 0) {
        const next = [...prev];
        const qty = next[idx].quantity + 1;
        next[idx] = {
          ...next[idx],
          quantity: qty,
          lineTotal: qty * unitPrice
        };
        return next;
      }
      return [
        ...prev,
        {
          id: key,
          menuItemId: item.id,
          name: item.name,
          category: item.category,
          section: item.section,
          unitPrice,
          quantity: 1,
          selectedVariant: draft.variant,
          selectedSecondaryVariant: draft.secondaryVariant,
          selectedEnhancements:
            draft.enhancements.length > 0 ? draft.enhancements : undefined,
          lineTotal: unitPrice
        }
      ];
    });
  };

  const handleUpdateQty = (cartId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((c) => {
          if (c.id !== cartId) return c;
          const nextQty = c.quantity + delta;
          if (nextQty <= 0) return null;
          return {
            ...c,
            quantity: nextQty,
            lineTotal: nextQty * c.unitPrice
          };
        })
        .filter(Boolean) as SignatureOrderItem[]
    );
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((c) => c.id !== cartId));
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [cartItems]
  );

  const taxAmount = useMemo(() => Math.round(subtotal * 0.1), [subtotal]);
  const grossTotal = subtotal + taxAmount;

  // Guest free complimentary makes Total = $0 strictly based on Hotel Guest selection
  const isFreeDining = isHotelGuest;
  const finalTotal = isFreeDining ? 0 : grossTotal;
  const totalItemCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems]
  );

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (cartItems.length === 0) {
      setCheckoutError('Add at least one item from the menu.');
      return;
    }

    if (!selectedProperty) {
      setCheckoutError('Please select a property location.');
      return;
    }

    setSubmitting(true);
    const res = await submitSignatureOrder({
      items: cartItems,
      propertySlug: selectedProperty.slug,
      propertyName: selectedProperty.name,
      serviceType,
      isHotelGuest,
      guestName: guestName.trim() || undefined,
      roomOrTable: serviceType === 'room_service' ? roomNumber.trim() || undefined : undefined,
      xUsernameCode: xUsernameInput.trim() || undefined,
      notes: notes.trim() || undefined
    });
    setSubmitting(false);

    if (!res.success || !res.receipt) {
      setCheckoutError(res.error || 'Unable to complete checkout.');
      return;
    }

    setReceipt(res.receipt);
    setCartItems([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadReceiptPng = async () => {
    if (!receipt) return;
    try {
      setDownloadingPng(true);
      await exportInvoiceAsImage(
        exportReceiptRef.current,
        receiptRef.current,
        `HR_Signature_Receipt_${receipt.orderId}.png`,
        380
      );
    } catch (err) {
      console.error('Receipt download error:', err);
    } finally {
      setDownloadingPng(false);
    }
  };

  const startNewOrder = () => {
    setReceipt(null);
    setCheckoutError(null);
    setNotes('');
  };

  const formatServiceLabel = (s: DiningServiceType) =>
    s === 'room_service' ? 'Room Service' : 'Dinner in Restaurant';

  const buildBarcodeBars = (seedText: string) => {
    const weights = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 1, 1, 2];
    const bars: { x: number; w: number }[] = [];
    let x = 0;
    for (let i = 0; i < 42; i++) {
      const code = seedText.charCodeAt(i % seedText.length) || 65;
      const w = weights[(code + i) % weights.length];
      const gap = ((code >> 1) + i) % 2 === 0 ? 2 : 1;
      bars.push({ x, w });
      x += w + gap;
    }
    return { bars, totalWidth: x };
  };

  const renderReceiptBody = (activeReceipt: SignatureOrderReceipt, isExport = false) => {
    const dt = new Date(activeReceipt.createdAt);
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    const hh = String(dt.getHours()).padStart(2, '0');
    const min = String(dt.getMinutes()).padStart(2, '0');
    const formattedDate = `${dd}/${mm} ${yyyy} ${hh}.${min}`;
    const { bars, totalWidth } = buildBarcodeBars(activeReceipt.orderId);
    const receiptTaxAmount = activeReceipt.taxAmount ?? Math.round(activeReceipt.subtotal * 0.1);

    return (
      <div
        className={`w-[380px] max-w-full mx-auto bg-[#FAFBF9] border border-slate-300 px-6 py-7 font-mono text-[#2C3744] text-left print:w-[380px] print:min-w-[380px] print:max-w-[380px] print:mx-auto print:shadow-none ${
          isExport ? 'shadow-none' : 'shadow-md'
        }`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between text-xs font-bold tracking-[0.08em] mb-4">
          <span className="text-[#51867E]">RECEIPT</span>
          <span className="text-[#2C3744]">No. {activeReceipt.orderId}</span>
        </div>

        {/* Center Brand Block */}
        <div className="text-center mb-3.5">
          <div className="font-serif italic text-3xl font-semibold text-[#51867E] leading-tight">
            HR Signature
          </div>
          <div className="font-sans text-[10px] font-bold tracking-[0.24em] text-[#3A4F67] uppercase mt-1">
            HANFORD HOTELS &amp; RESORTS
          </div>
          <div className="text-[10.5px] text-slate-600 mt-2.5">
            /An Elevated Way of Staying/
          </div>
        </div>

        <div className="border-t-2 border-dashed border-[#88B2AB] my-3.5" />

        {/* Date & Property / Guest Block */}
        <div className="text-center text-[11px] leading-relaxed space-y-0.5">
          <div className="font-bold tracking-[0.05em] text-[#2C3744]">
            DATE: {formattedDate}
          </div>
          <div className="font-semibold text-[#3A4F67] pt-0.5">
            {activeReceipt.propertyName}
          </div>
          <div className="text-slate-600">
            {formatServiceLabel(activeReceipt.serviceType)}
            {activeReceipt.serviceType === 'room_service' && activeReceipt.roomOrTable
              ? ` · Room ${activeReceipt.roomOrTable}`
              : ''}
          </div>
          <div className="text-slate-600">
            Guest: {activeReceipt.guestName}
            {activeReceipt.xUsernameCode
              ? ` (@${activeReceipt.xUsernameCode.replace(/^@+/, '')})`
              : ''}
          </div>
        </div>

        <div className="border-t-2 border-dashed border-[#88B2AB] my-3.5" />

        {/* Itemized Dotted Lines */}
        <div className="py-1 space-y-3">
          {activeReceipt.items.map((item) => {
            const meta: string[] = [];
            if (item.selectedVariant) meta.push(item.selectedVariant);
            if (item.selectedSecondaryVariant) meta.push(item.selectedSecondaryVariant);
            if (item.selectedEnhancements && item.selectedEnhancements.length > 0) {
              meta.push(item.selectedEnhancements.map((e) => `+ ${e.label}`).join(', '));
            }
            const qtyPrefix = item.quantity > 1 ? `${item.quantity}x ` : '';

            return (
              <div key={item.id}>
                <div className="flex items-baseline text-xs text-[#2C3744]">
                  <span className="font-semibold max-w-[66%] break-words">
                    {qtyPrefix}
                    {item.name}
                  </span>
                  <span className="flex-1 border-b border-dotted border-[#88B2AB] mx-2 mb-0.5" />
                  <span className="font-bold text-[#3A4F67] whitespace-nowrap tabular-nums">
                    {item.lineTotal.toLocaleString()}$
                  </span>
                </div>
                {meta.length > 0 && (
                  <div className="text-[10.5px] text-[#666666] mt-0.5">
                    {meta.join(' · ')}
                  </div>
                )}
              </div>
            );
          })}

          <div className="border-t border-dotted border-slate-300 pt-2.5 mt-2 space-y-1.5 text-[11.5px] text-slate-600">
            <div className="flex items-baseline">
              <span>Subtotal</span>
              <span className="flex-1 border-b border-dotted border-slate-300 mx-2 mb-0.5" />
              <span className="font-semibold text-[#2C3744] whitespace-nowrap tabular-nums">
                {activeReceipt.subtotal.toLocaleString()}$
              </span>
            </div>
            <div className="flex items-baseline">
              <span>Tax &amp; Service (10%)</span>
              <span className="flex-1 border-b border-dotted border-slate-300 mx-2 mb-0.5" />
              <span className="font-semibold text-[#2C3744] whitespace-nowrap tabular-nums">
                {receiptTaxAmount.toLocaleString()}$
              </span>
            </div>
            {activeReceipt.isFreeDining && (
              <div className="flex items-baseline text-[#51867E]">
                <span className="font-bold">Guest Free Complimentary</span>
                <span className="flex-1 border-b border-dotted border-[#88B2AB] mx-2 mb-0.5" />
                <span className="font-bold whitespace-nowrap tabular-nums">
                  -{activeReceipt.discountAmount.toLocaleString()}$
                </span>
              </div>
            )}
          </div>
        </div>

        {activeReceipt.notes && (
          <div className="text-[10.5px] text-[#666666] border-t border-dotted border-slate-300 pt-2 mt-2">
            Note: {activeReceipt.notes}
          </div>
        )}

        <div className="border-t-2 border-dashed border-[#88B2AB] my-3.5" />

        {/* Total Row */}
        <div className="flex items-baseline justify-between text-base font-bold text-[#3A4F67] pb-4">
          <span>TOTAL:</span>
          <span className="tabular-nums">{activeReceipt.totalAmount.toLocaleString()}$</span>
        </div>

        {/* SVG Barcode */}
        <div className="my-2 flex justify-center">
          <svg
            viewBox={`0 0 ${totalWidth} 46`}
            className="w-full max-w-[240px] h-[46px]"
            aria-hidden="true"
          >
            {bars.map((bar, idx) => (
              <rect key={idx} x={bar.x} y={0} width={bar.w} height={46} fill="#2C3744" />
            ))}
          </svg>
        </div>

        {/* Thank You Accent */}
        <div className="text-center font-serif italic text-3xl font-semibold text-[#51867E] my-4">
          Thank You!
        </div>

        {/* Bottom Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 pt-2.5">
          <span>@Hanford_HnR</span>
          <span className="tracking-wider">HANFORD H&amp;R</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen bg-[#FAFBF9] text-[#2C3744] font-sans print:min-h-0 print:bg-white print:p-0 ${
        !receipt ? 'pb-24' : 'pb-12'
      }`}
    >
      {/* Minimal Top Bar (Separated from main website) */}
      <header className="bg-[#FFFFFF] border-b border-slate-200 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl tracking-[0.18em] text-[#3A4F67] uppercase leading-none">
              HR SIGNATURE
            </h1>
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#51867E] uppercase mt-1.5">
              HANFORD HOTELS &amp; RESORTS
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 print:max-w-none print:p-0 print:m-0">
        {receipt ? (
          <div className="max-w-xl mx-auto space-y-6 print:max-w-[380px] print:space-y-0">
            <div className="bg-[#FFFFFF] border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#3A4F67]">
                  Order Confirmed
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Receipt #{receipt.orderId} · {formatServiceLabel(receipt.serviceType)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadReceiptPng}
                  disabled={downloadingPng}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#51867E] hover:bg-[#3A4F67] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingPng ? 'Preparing PNG...' : 'Download Receipt'}</span>
                </button>
                <button
                  type="button"
                  onClick={startNewOrder}
                  className="px-4 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-[#2C3744] text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer"
                >
                  New Order
                </button>
              </div>
            </div>

            <div ref={receiptRef} className="print:w-[380px] print:mx-auto">
              {renderReceiptBody(receipt)}
            </div>

            {/* Hidden fixed-width 380px portrait receipt node with crisp outer box and zero shadow whitespace */}
            <div className="fixed -left-[9999px] top-0 w-[380px] bg-[#FAFBF9] print:hidden" aria-hidden="true">
              <div ref={exportReceiptRef} className="w-[380px] bg-[#FAFBF9]">
                {renderReceiptBody(receipt, true)}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* LEFT COLUMN: MENU */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* Menu Category Tabs — Non-sliding fixed grid for clean mobile view */}
              <div className="grid grid-cols-3 border-b border-slate-200 w-full">
                {SIGNATURE_CATEGORY_TABS.map((tab) => {
                  const active = tab.id === activeCategory;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCategory(tab.id)}
                      className={`py-3 px-1 sm:px-3 text-[11px] sm:text-sm font-bold uppercase tracking-[0.05em] sm:tracking-[0.14em] text-center leading-tight border-b-2 transition-colors cursor-pointer ${
                        active
                          ? 'border-[#51867E] text-[#3A4F67]'
                          : 'border-transparent text-slate-500 hover:text-[#3A4F67]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {activeTabMeta?.hours && (
                <div className="text-xs font-medium text-[#51867E] tracking-wide uppercase">
                  {activeTabMeta.hours}
                </div>
              )}

              {/* Menu Sections & Items */}
              <div className="space-y-8">
                {sections.map(([sectionTitle, items]) => (
                  <section key={sectionTitle} className="space-y-1">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#3A4F67] border-b border-[#88B2AB]/50 pb-2 mb-2">
                      {sectionTitle}
                    </h2>

                    <div className="divide-y divide-slate-200/80">
                      {items.map((item) => {
                        const draft = getDraft(item);
                        const enhTotal = draft.enhancements.reduce(
                          (sum, e) => sum + e.price,
                          0
                        );
                        const displayPrice = item.price + enhTotal;
                        const activeKey = buildCartKey(
                          item.id,
                          draft.variant,
                          draft.secondaryVariant,
                          draft.enhancements
                        );
                        const cartMatch = cartItems.find((c) => c.id === activeKey);

                        return (
                          <div key={item.id} className="py-4 space-y-2.5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1 min-w-0 flex-1">
                                <h3 className="text-sm sm:text-[15px] font-semibold text-[#2C3744]">
                                  {item.name}
                                </h3>
                                {item.description && (
                                  <p className="text-xs text-[#666666] leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-sm font-semibold text-[#3A4F67] tabular-nums">
                                  ${displayPrice}
                                </span>

                                {cartMatch ? (
                                  <div className="inline-flex items-center border border-[#51867E] rounded-md bg-white">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateQty(cartMatch.id, -1)}
                                      className="p-1.5 text-[#3A4F67] hover:bg-[#EAF2F1] transition-colors cursor-pointer"
                                      aria-label={`Decrease quantity of ${item.name}`}
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="px-2.5 text-xs font-bold text-[#3A4F67] tabular-nums">
                                      {cartMatch.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateQty(cartMatch.id, 1)}
                                      className="p-1.5 text-[#3A4F67] hover:bg-[#EAF2F1] transition-colors cursor-pointer"
                                      aria-label={`Increase quantity of ${item.name}`}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddItem(item)}
                                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-[#51867E] text-[#51867E] hover:bg-[#51867E] hover:text-white rounded-md transition-colors cursor-pointer"
                                  >
                                    Add
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Variants / Enhancements (only when defined by the menu) */}
                            {(item.variants || item.secondaryVariants || item.enhancements) && (
                              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                                {item.variants && (
                                  <label className="inline-flex items-center gap-1.5 text-slate-600">
                                    <span>{item.variantLabel || 'Option'}:</span>
                                    <select
                                      value={draft.variant}
                                      onChange={(e) => setDraftVariant(item, e.target.value)}
                                      className="border border-slate-200 bg-white rounded px-2 py-1 text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E]"
                                    >
                                      {item.variants.map((v) => (
                                        <option key={v} value={v}>
                                          {v}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                )}

                                {item.secondaryVariants && (
                                  <label className="inline-flex items-center gap-1.5 text-slate-600">
                                    <span>{item.secondaryVariantLabel || 'Choice'}:</span>
                                    <select
                                      value={draft.secondaryVariant}
                                      onChange={(e) =>
                                        setDraftSecondaryVariant(item, e.target.value)
                                      }
                                      className="border border-slate-200 bg-white rounded px-2 py-1 text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E]"
                                    >
                                      {item.secondaryVariants.map((v) => (
                                        <option key={v} value={v}>
                                          {v}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                )}

                                {item.enhancements &&
                                  item.enhancements.map((enh) => {
                                    const checked = draft.enhancements.some(
                                      (e) => e.id === enh.id
                                    );
                                    return (
                                      <label
                                        key={enh.id}
                                        className="inline-flex items-center gap-1.5 text-slate-600 cursor-pointer select-none"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => toggleDraftEnhancement(item, enh)}
                                          className="accent-[#51867E]"
                                        />
                                        <span>
                                          {enh.label} (+${enh.price})
                                        </span>
                                      </label>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER & CHECKOUT */}
            <aside
              ref={checkoutSectionRef}
              className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 bg-[#FFFFFF] border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="font-serif text-xl text-[#3A4F67]">Your Order</h2>
                <span className="text-xs font-semibold text-slate-500 tabular-nums">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Cart Items List */}
              {cartItems.length === 0 ? (
                <p className="text-xs text-[#666666] py-3">
                  Select items from the menu to start your order.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                  {cartItems.map((item) => {
                    const details: string[] = [];
                    if (item.selectedVariant) details.push(item.selectedVariant);
                    if (item.selectedSecondaryVariant) details.push(item.selectedSecondaryVariant);
                    if (item.selectedEnhancements) {
                      details.push(
                        item.selectedEnhancements.map((e) => `+ ${e.label}`).join(', ')
                      );
                    }
                    return (
                      <div key={item.id} className="py-2.5 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-[#2C3744]">
                            {item.name}
                          </div>
                          {details.length > 0 && (
                            <div className="text-[11px] text-[#666666]">
                              {details.join(' · ')}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="inline-flex items-center border border-slate-200 rounded bg-[#FAFBF9]">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, -1)}
                                className="p-1 text-slate-600 hover:text-[#3A4F67] cursor-pointer"
                                aria-label="Decrease item quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-[11px] font-bold text-[#3A4F67] tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, 1)}
                                className="p-1 text-slate-600 hover:text-[#3A4F67] cursor-pointer"
                                aria-label="Increase item quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCartItem(item.id)}
                              className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs font-semibold text-[#3A4F67] tabular-nums shrink-0">
                          ${item.lineTotal.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Checkout Form */}
              <form
                id="hr-signature-checkout-form"
                onSubmit={handleCheckout}
                className="space-y-4 border-t border-slate-200 pt-4"
              >
                {/* 1. Property Location (Searchable like Booking Room) */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3A4F67]">
                    Property Location
                  </label>
                  <PropertySearchSelect
                    properties={properties}
                    selectedSlug={selectedPropertySlug}
                    onSelect={(slug) => setSelectedPropertySlug(slug)}
                    hidePrice
                  />
                </div>

                {/* 2. Dining Option: Dinner in Restaurant or Room Service */}
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#3A4F67]">
                    Dining Option
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setServiceType('restaurant')}
                      className={`px-3 py-2.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                        serviceType === 'restaurant'
                          ? 'bg-[#3A4F67] border-[#3A4F67] text-white'
                          : 'bg-white border-slate-200 text-[#2C3744] hover:border-[#88B2AB]'
                      }`}
                    >
                      Dinner in Restaurant
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType('room_service')}
                      className={`px-3 py-2.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                        serviceType === 'room_service'
                          ? 'bg-[#3A4F67] border-[#3A4F67] text-white'
                          : 'bg-white border-slate-200 text-[#2C3744] hover:border-[#88B2AB]'
                      }`}
                    >
                      Room Service
                    </button>
                  </div>
                </div>

                {/* 3. Hotel Guest Status: I am a Hotel Guest or No */}
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#3A4F67]">
                    Hotel Guest
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsHotelGuest(true)}
                      className={`px-3 py-2.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                        isHotelGuest
                          ? 'bg-[#51867E] border-[#51867E] text-white'
                          : 'bg-white border-slate-200 text-[#2C3744] hover:border-[#88B2AB]'
                      }`}
                    >
                      I am a Hotel Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHotelGuest(false)}
                      className={`px-3 py-2.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                        !isHotelGuest
                          ? 'bg-[#3A4F67] border-[#3A4F67] text-white'
                          : 'bg-white border-slate-200 text-[#2C3744] hover:border-[#88B2AB]'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* 4. Guest Name & Room Number (Room Service only, Table/Note removed) */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="hr-guest-name"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#3A4F67]"
                    >
                      Guest Name
                    </label>
                    <input
                      id="hr-guest-name"
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Full name"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E]"
                    />
                  </div>

                  {serviceType === 'room_service' && (
                    <div className="space-y-1">
                      <label
                        htmlFor="hr-room-number"
                        className="block text-[11px] font-bold uppercase tracking-wider text-[#3A4F67]"
                      >
                        Room Number
                      </label>
                      <input
                        id="hr-room-number"
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="e.g. 402"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E]"
                      />
                    </div>
                  )}
                </div>

                {/* 5. X Username */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="hr-x-username"
                    className="block text-[11px] font-bold uppercase tracking-wider text-[#3A4F67]"
                  >
                    X Username
                  </label>
                  <input
                    id="hr-x-username"
                    type="text"
                    value={xUsernameInput}
                    onChange={(e) => setXUsernameInput(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E]"
                  />
                </div>

                {/* Optional Notes */}
                <div className="space-y-1">
                  <label
                    htmlFor="hr-notes"
                    className="block text-[11px] font-bold uppercase tracking-wider text-[#3A4F67]"
                  >
                    Dietary / Order Notes
                  </label>
                  <input
                    id="hr-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Allergies or preparation preference"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-xs text-[#2C3744] focus:outline-none focus:border-[#51867E]"
                  />
                </div>

                {/* Totals */}
                <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax &amp; Service (10%)</span>
                    <span className="font-mono tabular-nums">${taxAmount.toLocaleString()}</span>
                  </div>
                  {isFreeDining && (
                    <div className="flex justify-between text-[#51867E] font-semibold">
                      <span>Guest Free Complimentary</span>
                      <span className="font-mono tabular-nums">
                        {grossTotal > 0 ? `-$${grossTotal.toLocaleString()}` : '$0'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-[#3A4F67] pt-1">
                    <span>Total</span>
                    <span className="font-mono text-base tabular-nums">
                      ${finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {checkoutError && (
                  <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {checkoutError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="w-full py-3 bg-[#51867E] hover:bg-[#3A4F67] disabled:bg-slate-300 text-white text-xs font-bold uppercase tracking-[0.15em] rounded-md transition-colors cursor-pointer"
                >
                  {submitting ? 'Processing Order...' : 'Checkout Order'}
                </button>
              </form>
            </aside>
          </div>
        )}
      </main>

      {/* FLOATING BOTTOM TOTAL BAR (Matches Booking Form Style) */}
      {!receipt && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#3A4F67]/95 backdrop-blur-md border-t border-slate-700/80 px-4 sm:px-8 py-2.5 shadow-2xl flex items-center justify-between text-white">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-[#88B2AB] font-semibold">
              {isFreeDining ? 'Guest Free Complimentary' : 'Total Estimated'} · {totalItemCount}{' '}
              {totalItemCount === 1 ? 'item' : 'items'}
            </span>
            <span className="text-lg font-serif font-bold text-white tabular-nums">
              ${finalTotal.toLocaleString()} USD
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              checkoutSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
            className="px-5 py-2 bg-[#51867E] hover:bg-[#3f6d66] text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow border border-[#51867E] flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Your Order</span>
          </button>
        </div>
      )}
    </div>
  );
};
