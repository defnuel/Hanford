import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Clock,
  ArrowLeft,
  X,
  Check,
  ChevronRight,
  Sparkles,
  Info,
  Coffee,
  Wine,
  Sunrise,
  Moon
} from 'lucide-react';
import { MENU_ITEMS, MenuItem, CartItem, DiningOrder } from '../data/menuData';
import { DiningReceiptModal } from '../components/dining/DiningReceiptModal';

interface MenuPageProps {
  onNavigate: (path: string) => void;
}

type CategoryTab = 'all' | 'breakfast' | 'lunch-dinner' | 'beverages';

export const MenuPage: React.FC<MenuPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout Form State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [phone, setPhone] = useState('');
  const [destinationType, setDestinationType] = useState<'in-room' | 'lounge-table' | 'poolside'>('in-room');
  const [roomOrTableNumber, setRoomOrTableNumber] = useState('');
  const [diningTime, setDiningTime] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledTime, setScheduledTime] = useState('19:30');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Confirmed order for receipt display
  const [confirmedOrder, setConfirmedOrder] = useState<DiningOrder | null>(null);

  // Subcategories available for activeTab
  const availableSubcategories = useMemo(() => {
    const items = activeTab === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter((i) => i.category === activeTab);
    const set = new Set<string>();
    items.forEach((item) => set.add(item.subcategory));
    return ['all', ...Array.from(set)];
  }, [activeTab]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // Category filter
      if (activeTab !== 'all' && item.category !== activeTab) return false;

      // Subcategory filter
      if (selectedSubcategory !== 'all' && item.subcategory !== selectedSubcategory) return false;

      // Dietary filter
      if (selectedDietary !== 'all') {
        const matchesDiet = item.tags.some((tag) =>
          tag.toLowerCase().includes(selectedDietary.toLowerCase())
        );
        if (!matchesDiet) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesSubcat = item.subcategory.toLowerCase().includes(q);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesSubcat && !matchesTag) return false;
      }

      return true;
    });
  }, [activeTab, selectedSubcategory, selectedDietary, searchQuery]);

  // Cart operations
  const getItemQuantity = (itemId: string): number => {
    const found = cart.find((c) => c.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((c) => c.item.id !== itemId);
      }
      return prev.map((c) =>
        c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
      );
    });
  };

  const handleUpdateItemNote = (itemId: string, note: string) => {
    setCart((prev) =>
      prev.map((c) => (c.item.id === itemId ? { ...c, specialNotes: note } : c))
    );
  };

  const totalItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  const serviceCharge = Math.round(subtotal * 0.1 * 100) / 100;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const grandTotal = subtotal + serviceCharge + tax;

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutError(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!guestName.trim()) {
      setCheckoutError('Please enter the guest full name.');
      return;
    }

    if (!roomOrTableNumber.trim()) {
      setCheckoutError(
        destinationType === 'in-room'
          ? 'Please enter your Room / Suite Number.'
          : destinationType === 'poolside'
          ? 'Please enter your Cabana Number.'
          : 'Please enter your Lounge Table Number.'
      );
      return;
    }

    // Generate Order ID
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `HNF-DINE-2026-${randomHex}`;

    const newOrder: DiningOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      guestName: guestName.trim(),
      xHandle: xHandle.trim() || undefined,
      phone: phone.trim() || undefined,
      destinationType,
      roomOrTableNumber: roomOrTableNumber.trim(),
      diningTime,
      scheduledTime: diningTime === 'scheduled' ? scheduledTime : undefined,
      items: [...cart],
      subtotal,
      serviceCharge,
      tax,
      grandTotal,
      specialInstructions: specialInstructions.trim() || undefined,
      paymentMethod: 'room-folio',
      status: 'CONFIRMED',
    };

    setConfirmedOrder(newOrder);
    setIsCheckoutOpen(false);
    setCart([]); // Clear cart
  };

  const handleResetForNewOrder = () => {
    setConfirmedOrder(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-800 font-sans antialiased flex flex-col">
      {/* ============================================================== */}
      {/* DEDICATED DINING HEADER (Clean, Independent Luxury Top Bar)    */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
          {/* Left: Return & Brand Title */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <button
              onClick={() => onNavigate('/')}
              className="group flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-[#51867E] transition-colors shrink-0 py-1"
              title="Return to Hotel Website"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Hotel Resort</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-serif font-bold tracking-[0.18em] uppercase text-[#3A4F67] truncate">
                  The Hanford Lounge
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#51867E] shrink-0" />
              </div>
              <p className="text-[10.5px] uppercase tracking-widest text-[#51867E] font-medium hidden sm:block">
                All-Day Dining &amp; In-Room Hospitality
              </p>
            </div>
          </div>

          {/* Right: Cart Drawer Trigger Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-3.5 sm:px-5 py-2.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-full text-xs font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden xs:inline">Order Tray</span>
              {totalItemsCount > 0 && (
                <span className="bg-white text-[#51867E] font-mono font-bold text-xs px-2 py-0.5 rounded-full shadow-inner">
                  {totalItemsCount}
                </span>
              )}
              {totalItemsCount > 0 && (
                <span className="font-mono hidden md:inline ml-1 border-l border-white/30 pl-2">
                  ${subtotal.toFixed(0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* SERVICE SCHEDULE & HERO BANNER                                 */}
      {/* ============================================================== */}
      <section className="bg-white border-b border-slate-200/80 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#51867E] block">
              International Dining &amp; Lounge Selection
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#3A4F67] tracking-tight">
              Curated Culinary &amp; Beverage Menu
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Artisan breakfast sets, handcrafted afternoon sandwiches, prime cuts, signature pastries, and private-cellar beverages prepared fresh for in-room suites and the lounge terrace.
            </p>
          </div>

          {/* Dining Hours Badges (Clean, no decorative fluff) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 max-w-3xl mx-auto mt-6 pt-5 border-t border-slate-100 text-xs text-slate-600">
            <div className="bg-[#FAFBF9] border border-slate-200/80 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-[#51867E] tracking-wider block">
                Breakfast
              </span>
              <span className="font-semibold text-slate-800">07:00 AM – 11:30 AM</span>
            </div>
            <div className="bg-[#FAFBF9] border border-slate-200/80 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-[#3A4F67] tracking-wider block">
                Lunch &amp; Dinner
              </span>
              <span className="font-semibold text-slate-800">12:00 PM – 10:30 PM</span>
            </div>
            <div className="bg-[#FAFBF9] border border-slate-200/80 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-[#51867E] tracking-wider block">
                Beverages &amp; Cellar
              </span>
              <span className="font-semibold text-slate-800">Available All Day</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* FILTER & CATEGORY NAVIGATION BAR                              */}
      {/* ============================================================== */}
      <section className="sticky top-[57px] sm:top-[65px] z-30 bg-[#FAFBF9]/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {/* Main Category Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedSubcategory('all');
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#3A4F67] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              All Offerings
            </button>
            <button
              onClick={() => {
                setActiveTab('breakfast');
                setSelectedSubcategory('all');
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'breakfast'
                  ? 'bg-[#51867E] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Sunrise className="w-3.5 h-3.5" />
              <span>Breakfast</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('lunch-dinner');
                setSelectedSubcategory('all');
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lunch-dinner'
                  ? 'bg-[#51867E] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Lunch &amp; Dinner</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('beverages');
                setSelectedSubcategory('all');
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'beverages'
                  ? 'bg-[#51867E] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Wine className="w-3.5 h-3.5" />
              <span>Beverages</span>
            </button>
          </div>

          {/* Search & Subcategory Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes, drinks, ingredients..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#51867E] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dietary Tags Quick Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Filter:
              </span>
              {['all', 'Signature', 'Vegetarian', 'Gluten-Free', 'Healthy', 'Zero-Proof'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedDietary(tag === selectedDietary ? 'all' : tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    selectedDietary === tag
                      ? 'bg-[#EAF2F1] text-[#51867E] font-bold border border-[#88B2AB]/40'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {tag === 'all' ? 'All' : tag}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories Selector (if specific category selected) */}
          {availableSubcategories.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-2 no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                Section:
              </span>
              {availableSubcategories.map((subcat) => (
                <button
                  key={subcat}
                  onClick={() => setSelectedSubcategory(subcat)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSubcategory === subcat
                      ? 'bg-[#3A4F67] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {subcat === 'all' ? 'All Sections' : subcat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* MENU ITEMS GRID                                                */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-base font-serif font-bold text-[#3A4F67]">
              No menu items match your selection
            </h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or clearing active filters.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedSubcategory('all');
                setSelectedDietary('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#51867E] text-white rounded-full text-xs font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#88B2AB]/60 transition-all p-5 shadow-2xs flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    {/* Header Row: Subcategory & Price */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#51867E] bg-[#F2F7F6] px-2 py-0.5 rounded">
                          {item.subcategory}
                        </span>
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded ${
                              tag.includes('Signature')
                                ? 'bg-[#3A4F67] text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-base text-[#3A4F67]">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Dish / Beverage Title */}
                    <h3 className="font-serif font-bold text-slate-900 text-base leading-snug group-hover:text-[#3A4F67] transition-colors">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Action: Add to Order / Quantity Stepper */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.availableHours}
                    </span>

                    {qty === 0 ? (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="px-4 py-2 bg-[#F2F7F6] hover:bg-[#51867E] text-[#3A4F67] hover:text-white border border-[#88B2AB]/40 hover:border-transparent rounded-full text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#F2F7F6] border border-[#88B2AB]/40 rounded-full px-2 py-1">
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="w-6 h-6 rounded-full bg-white text-slate-700 hover:text-red-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs text-[#3A4F67] px-1 min-w-[18px] text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-6 h-6 rounded-full bg-[#51867E] text-white hover:bg-[#3f6d66] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* FLOATING CART BAR (Mobile Sticky Footer when cart has items)   */}
      {/* ============================================================== */}
      {totalItemsCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#51867E] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs tracking-wider uppercase cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{totalItemsCount} item{totalItemsCount > 1 ? 's' : ''} in Tray</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">${grandTotal.toFixed(2)}</span>
              <span>Review →</span>
            </div>
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* CART DRAWER                                                    */}
      {/* ============================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="bg-[#3A4F67] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#88B2AB]" />
                <h3 className="font-serif font-bold text-base tracking-wide">
                  Your Dining Order Tray
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto stroke-1" />
                  <p className="text-xs">Your order tray is empty.</p>
                  <p className="text-[11px] text-slate-400">
                    Select culinary items or beverages from the menu to add.
                  </p>
                </div>
              ) : (
                cart.map((cartItem) => (
                  <div key={cartItem.item.id} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 text-xs leading-snug">
                          {cartItem.item.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ${cartItem.item.price.toFixed(2)} each
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#3A4F67] shrink-0">
                        ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-[#F2F7F6] border border-[#88B2AB]/40 rounded-full px-2 py-0.5">
                        <button
                          onClick={() => handleRemoveFromCart(cartItem.item.id)}
                          className="w-5 h-5 rounded-full bg-white text-slate-700 hover:text-red-600 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs text-[#3A4F67] min-w-[16px] text-center">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => handleAddToCart(cartItem.item)}
                          className="w-5 h-5 rounded-full bg-[#51867E] text-white hover:bg-[#3f6d66] flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Special Note Input */}
                      <input
                        type="text"
                        value={cartItem.specialNotes || ''}
                        onChange={(e) => handleUpdateItemNote(cartItem.item.id, e.target.value)}
                        placeholder="Kitchen note (e.g. no onions)"
                        className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-[#51867E] flex-1 min-w-0"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Calculations & Checkout Button */}
            {cart.length > 0 && (
              <div className="bg-[#FAFBF9] border-t border-slate-200 p-5 space-y-3 shrink-0">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold text-slate-800">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charge (10%)</span>
                    <span className="font-mono">${serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local Hospitality Tax (10%)</span>
                    <span className="font-mono">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#3A4F67] pt-2 border-t border-slate-200">
                    <span>Total Folio Amount</span>
                    <span className="font-mono text-base text-[#51867E]">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-3.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Guest Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CHECKOUT MODAL                                                 */}
      {/* ============================================================== */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#FAFBF9] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Header */}
            <div className="bg-[#3A4F67] px-5 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base tracking-wide">
                  Dining Checkout &amp; Room Folio
                </h3>
                <p className="text-[11px] text-slate-200">
                  Total: <span className="font-mono font-bold text-[#88B2AB]">${grandTotal.toFixed(2)}</span>
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSubmitOrder} className="p-5 space-y-4 text-xs">
              {checkoutError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs">
                  {checkoutError}
                </div>
              )}

              {/* Destination Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Service Destination *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDestinationType('in-room')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      destinationType === 'in-room'
                        ? 'bg-[#EAF2F1] border-[#51867E] text-[#51867E] font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    In-Room Dining
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestinationType('lounge-table')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      destinationType === 'lounge-table'
                        ? 'bg-[#EAF2F1] border-[#51867E] text-[#51867E] font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    The Lounge Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestinationType('poolside')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      destinationType === 'poolside'
                        ? 'bg-[#EAF2F1] border-[#51867E] text-[#51867E] font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Poolside Cabana
                  </button>
                </div>
              </div>

              {/* Room / Table Number */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  {destinationType === 'in-room'
                    ? 'Room or Suite Number *'
                    : destinationType === 'poolside'
                    ? 'Cabana Number *'
                    : 'Table Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={roomOrTableNumber}
                  onChange={(e) => setRoomOrTableNumber(e.target.value)}
                  placeholder={
                    destinationType === 'in-room'
                      ? 'e.g. Suite 402'
                      : destinationType === 'poolside'
                      ? 'e.g. Cabana 5'
                      : 'e.g. Table 14 - Courtyard'
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#51867E]"
                />
              </div>

              {/* Guest Full Name & X Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                    Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Evelyn Vance"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#51867E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                    X (Twitter) Username (Optional)
                  </label>
                  <input
                    type="text"
                    value={xHandle}
                    onChange={(e) => setXHandle(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#51867E]"
                  />
                </div>
              </div>

              {/* Timing Preference */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Serving Timing
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiningTime('immediate')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      diningTime === 'immediate'
                        ? 'bg-[#EAF2F1] border-[#51867E] text-[#51867E] font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Immediate (25–35 mins)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiningTime('scheduled')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      diningTime === 'scheduled'
                        ? 'bg-[#EAF2F1] border-[#51867E] text-[#51867E] font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Schedule for Later
                  </button>
                </div>

                {diningTime === 'scheduled' && (
                  <div className="pt-2">
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#51867E]"
                    />
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Dietary Preferences / Kitchen Instructions
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Allergies, extra napkins, cutlery preferences, etc."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#51867E]"
                />
              </div>

              {/* Billing Notice */}
              <div className="bg-[#F2F7F6] border border-[#88B2AB]/40 p-3 rounded-xl text-[11px] text-slate-600">
                <strong className="text-[#3A4F67] block">Settlement Method:</strong>
                All items and charges will be billed directly to your Hanford Guest Folio upon checkout.
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-100 uppercase tracking-wider text-[11px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-xl uppercase tracking-widest text-xs font-bold shadow-md cursor-pointer"
                >
                  Confirm &amp; Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CONFIRMED RECEIPT MODAL                                        */}
      {/* ============================================================== */}
      {confirmedOrder && (
        <DiningReceiptModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onNewOrder={handleResetForNewOrder}
        />
      )}

      {/* ============================================================== */}
      {/* CLEAN FOOTER                                                   */}
      {/* ============================================================== */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-400 space-y-1">
        <p className="tracking-widest uppercase text-[10.5px] font-semibold text-[#3A4F67]">
          Hanford Hotels &amp; Resorts • The Lounge
        </p>
        <p className="text-[11px]">
          In-Room &amp; Terrace Dining Service • Dial 4 for Culinary Concierge
        </p>
      </footer>
    </div>
  );
};
