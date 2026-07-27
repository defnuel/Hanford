import React, { useState } from 'react';
import { Property, PropertyStatus } from '../../types';
import { Plus, Edit2, Trash2, Save, X, Search, Building2, Check, Image as ImageIcon } from 'lucide-react';
import { saveAdminProperties } from '../../services/dataService';
import { createSlug } from '../../data/mockProperties';

interface LocationsEditorProps {
  properties: Property[];
  onRefreshData: () => void;
}

export const LocationsEditor: React.FC<LocationsEditorProps> = ({ properties, onRefreshData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form Fields
  const [formData, setFormData] = useState<Partial<Property>>({});
  const [galleryText, setGalleryText] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');

  const filteredProperties = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartEdit = (property: Property) => {
    setEditingProperty(property);
    setIsCreating(false);
    setFormData({ ...property });
    setGalleryText(property.galleryImages ? property.galleryImages.join('\n') : '');
    setAmenitiesText(property.amenities ? property.amenities.join(', ') : '');
  };

  const handleStartCreate = () => {
    const newProp: Partial<Property> = {
      id: `prop-custom-${Date.now()}`,
      name: '',
      tagline: 'Exclusive Luxury Sanctuary',
      address: 'Hanford Estate Road',
      country: 'United States',
      continent: 'North America',
      status: 'Live',
      priceFrom: 1200,
      priceStandard: 1200,
      priceDeluxe: 1800,
      pricePresidential: 4200,
      pricePrivateVilla: 6500,
      priceMeetingRoom: 150,
      priceEventHall: 3500,
      priceCateringPerPax: 85,
      heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=85',
      galleryImages: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=85'],
      amenities: ['Private Butler', 'Thermal Spa', 'Concierge Fleet'],
      detailsHtml: '<p>A timeless luxury sanctuary with world-class amenities.</p>'
    };
    setEditingProperty(newProp as Property);
    setIsCreating(true);
    setFormData(newProp);
    setGalleryText(newProp.heroImage || '');
    setAmenitiesText('Private Butler, Thermal Spa, Concierge Fleet');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const slug = formData.slug || createSlug(formData.name);
    const galleryArr = galleryText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const amenitiesArr = amenitiesText
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedProp: Property = {
      id: formData.id || `prop-${Date.now()}`,
      slug,
      name: formData.name,
      tagline: formData.tagline || 'Exclusive Luxury Sanctuary',
      address: formData.address || 'Exclusive Address',
      country: formData.country || 'International Destination',
      continent: formData.continent || 'Global',
      status: (formData.status as PropertyStatus) || 'Live',
      detailsHtml: formData.detailsHtml || '<p>A timeless sanctuary.</p>',
      driveFolderUrl: formData.driveFolderUrl || '',
      heroImage: formData.heroImage || (galleryArr[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=85'),
      galleryImages: galleryArr.length > 0 ? galleryArr : [formData.heroImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=85'],
      priceFrom: Number(formData.priceFrom) || 1200,
      rating: formData.rating || 4.95,
      amenities: amenitiesArr,
      priceStandard: Number(formData.priceStandard) || 1200,
      priceDeluxe: Number(formData.priceDeluxe) || 1800,
      pricePresidential: Number(formData.pricePresidential) || 4200,
      pricePrivateVilla: Number(formData.pricePrivateVilla) || 6500,
      priceMeetingRoom: Number(formData.priceMeetingRoom) || 150,
      priceEventHall: Number(formData.priceEventHall) || 3500,
      priceCateringPerPax: Number(formData.priceCateringPerPax) || 85
    };

    let updatedList: Property[];
    if (isCreating) {
      updatedList = [updatedProp, ...properties];
    } else {
      updatedList = properties.map((p) => (p.id === updatedProp.id ? updatedProp : p));
    }

    saveAdminProperties(updatedList);
    onRefreshData();
    setEditingProperty(null);
    setToastMsg(`Property "${updatedProp.name}" berhasil disimpan!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus lokasi/properti "${name}"?`)) {
      const filtered = properties.filter((p) => p.id !== id);
      saveAdminProperties(filtered);
      onRefreshData();
      if (editingProperty?.id === id) {
        setEditingProperty(null);
      }
      setToastMsg(`Property "${name}" berhasil dihapus.`);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-light text-[#3A4F67]">
            Sanctuaries & Locations ({properties.length})
          </h2>
          <p className="text-xs text-slate-500">
            Kelola data properti, harga kamar, fasilitas, dan gambar galeri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-grow sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#51867E]"
            />
          </div>

          <button
            onClick={handleStartCreate}
            className="px-4 py-2 bg-[#51867E] hover:bg-[#3f6d66] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lokasi</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Editor Modal / Drawer Form */}
      {editingProperty && (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 text-[#3A4F67]">
              <Building2 className="w-5 h-5 text-[#51867E]" />
              <h3 className="font-bold text-sm uppercase tracking-wider">
                {isCreating ? 'Tambah Lokasi Baru' : `Edit: ${editingProperty.name}`}
              </h3>
            </div>
            <button
              onClick={() => setEditingProperty(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Properti / Sanctuary *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Hanford Hotel & Resort Bali"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Exclusive Coastal Sanctuary"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Santa Barbara, CA"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Negara / Destinasi</label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Benua / Region</label>
                <input
                  type="text"
                  value={formData.continent || ''}
                  onChange={(e) => setFormData({ ...formData, continent: e.target.value })}
                  placeholder="North America"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Properti</label>
                <select
                  value={formData.status || 'Live'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                >
                  <option value="Live">Live (Aktif)</option>
                  <option value="Active">Active</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="pt-2 border-t border-slate-200">
              <span className="font-bold text-[#3A4F67] uppercase tracking-wider text-[11px] block mb-3">
                Tarif Kamar & Layanan ($ USD / malam)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Price From ($)</label>
                  <input
                    type="number"
                    value={formData.priceFrom || 0}
                    onChange={(e) => setFormData({ ...formData, priceFrom: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Standard Room ($)</label>
                  <input
                    type="number"
                    value={formData.priceStandard || 0}
                    onChange={(e) => setFormData({ ...formData, priceStandard: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Deluxe Room ($)</label>
                  <input
                    type="number"
                    value={formData.priceDeluxe || 0}
                    onChange={(e) => setFormData({ ...formData, priceDeluxe: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Presidential Suite ($)</label>
                  <input
                    type="number"
                    value={formData.pricePresidential || 0}
                    onChange={(e) => setFormData({ ...formData, pricePresidential: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Private Villa ($)</label>
                  <input
                    type="number"
                    value={formData.pricePrivateVilla || 0}
                    onChange={(e) => setFormData({ ...formData, pricePrivateVilla: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Meeting Room ($/pax)</label>
                  <input
                    type="number"
                    value={formData.priceMeetingRoom || 0}
                    onChange={(e) => setFormData({ ...formData, priceMeetingRoom: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Event Hall ($/day)</label>
                  <input
                    type="number"
                    value={formData.priceEventHall || 0}
                    onChange={(e) => setFormData({ ...formData, priceEventHall: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block">Catering ($/pax)</label>
                  <input
                    type="number"
                    value={formData.priceCateringPerPax || 0}
                    onChange={(e) => setFormData({ ...formData, priceCateringPerPax: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Images & Amenities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hero Image URL</label>
                <input
                  type="text"
                  value={formData.heroImage || ''}
                  onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Amenities (pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={amenitiesText}
                  onChange={(e) => setAmenitiesText(e.target.value)}
                  placeholder="Bespoke Butler, Thermal Spa, Private Dining"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Gallery Image URLs (1 URL per baris atau pisahkan koma)</label>
                <textarea
                  rows={3}
                  value={galleryText}
                  onChange={(e) => setGalleryText(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#51867E] hover:bg-[#3f6d66] text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Properti</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Locations List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProperties.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative h-40 bg-slate-100 overflow-hidden">
              <img
                src={p.heroImage}
                alt={p.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                {p.status}
              </div>
            </div>

            <div className="p-4 space-y-2 flex-grow">
              <h4 className="font-serif font-bold text-base text-[#3A4F67] line-clamp-1">{p.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-1">{p.tagline}</p>
              <div className="text-[11px] text-slate-600 font-medium">
                📍 {p.address} &bull; {p.country}
              </div>
              <div className="text-xs font-bold text-[#51867E] pt-1">
                From ${p.priceFrom?.toLocaleString()} / night
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleStartEdit(p)}
                className="px-3 py-1.5 bg-[#3A4F67] hover:bg-[#2C3744] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDelete(p.id, p.name)}
                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
