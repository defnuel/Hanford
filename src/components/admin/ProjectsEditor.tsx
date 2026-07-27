import React, { useState } from 'react';
import { Project, ProjectStatus } from '../../types';
import { Plus, Edit2, Trash2, Save, X, Search, FolderGit2, Check } from 'lucide-react';
import { saveAdminProjects } from '../../services/dataService';
import { createSlug } from '../../data/mockProperties';

interface ProjectsEditorProps {
  projects: Project[];
  onRefreshData: () => void;
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({ projects, onRefreshData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form Fields
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [galleryText, setGalleryText] = useState('');

  const filteredProjects = projects.filter(
    (p) =>
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartEdit = (project: Project) => {
    setEditingProject(project);
    setIsCreating(false);
    setFormData({ ...project });
    setGalleryText(project.galleryImages ? project.galleryImages.join('\n') : '');
  };

  const handleStartCreate = () => {
    const newProj: Partial<Project> = {
      id: `proj-custom-${Date.now()}`,
      projectName: '',
      projectType: 'High Luxury Photoshoot & Event',
      partnerName: '',
      xUsername: '@Hanford_HnR',
      xLink: 'https://x.com/Hanford_HnR',
      location: 'Hanford Sanctuary Estate',
      date: '2026',
      status: 'Ongoing',
      shortDescription: 'Exclusive luxury brand collaboration with Hanford Hotels & Resorts.',
      description: 'Official brand partnership and luxury showcase.',
      heroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=85',
      galleryImages: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=85']
    };
    setEditingProject(newProj as Project);
    setIsCreating(true);
    setFormData(newProj);
    setGalleryText(newProj.heroImage || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName?.trim()) return;

    const slug = formData.slug || createSlug(formData.projectName);
    const galleryArr = galleryText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const xUserClean = formData.xUsername ? (formData.xUsername.startsWith('@') ? formData.xUsername : `@${formData.xUsername}`) : '';
    const xLinkClean = formData.xLink || (xUserClean ? `https://x.com/${xUserClean.replace('@', '')}` : '');

    const updatedProj: Project = {
      id: formData.id || `proj-${Date.now()}`,
      slug,
      projectName: formData.projectName,
      projectType: formData.projectType || 'Brand Collaboration',
      partnerName: formData.partnerName || 'Hanford Partner',
      xUsername: xUserClean,
      xLink: xLinkClean,
      location: formData.location || 'Hanford Sanctuary',
      date: formData.date || '2026',
      status: (formData.status as ProjectStatus) || 'Ongoing',
      shortDescription: formData.shortDescription || '',
      description: formData.description || formData.shortDescription || 'Brand collaboration project.',
      detailsHtml: formData.detailsHtml || `<p>${formData.description || formData.shortDescription}</p>`,
      heroImage: formData.heroImage || (galleryArr[0] || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=85'),
      galleryImages: galleryArr.length > 0 ? galleryArr : [formData.heroImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=85']
    };

    let updatedList: Project[];
    if (isCreating) {
      updatedList = [updatedProj, ...projects];
    } else {
      updatedList = projects.map((p) => (p.id === updatedProj.id ? updatedProj : p));
    }

    saveAdminProjects(updatedList);
    onRefreshData();
    setEditingProject(null);
    setToastMsg(`Projek "${updatedProj.projectName}" berhasil disimpan!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus projek kolaborasi "${name}"?`)) {
      const filtered = projects.filter((p) => p.id !== id);
      saveAdminProjects(filtered);
      onRefreshData();
      if (editingProject?.id === id) {
        setEditingProject(null);
      }
      setToastMsg(`Projek "${name}" berhasil dihapus.`);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-light text-[#3A4F67]">
            Collaborations & Projects ({projects.length})
          </h2>
          <p className="text-xs text-slate-500">
            Kelola daftar projek kolaborasi, mitra/partner, akun X, dan galeri dokumentasi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-grow sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari projek..."
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
            <span>Tambah Projek</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Editor Modal / Form */}
      {editingProject && (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 text-[#3A4F67]">
              <FolderGit2 className="w-5 h-5 text-[#51867E]" />
              <h3 className="font-bold text-sm uppercase tracking-wider">
                {isCreating ? 'Tambah Projek Kolaborasi Baru' : `Edit: ${editingProject.projectName}`}
              </h3>
            </div>
            <button
              onClick={() => setEditingProject(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Projek *</label>
                <input
                  type="text"
                  required
                  value={formData.projectName || ''}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="Contoh: Hanford x Vogue Showcase"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Partner / Brand</label>
                <input
                  type="text"
                  value={formData.partnerName || ''}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  placeholder="Contoh: Vogue International"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipe Projek</label>
                <input
                  type="text"
                  value={formData.projectType || ''}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  placeholder="High Luxury Photoshoot & Event"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lokasi Execution</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Santa Barbara Sanctuary"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal / Timeline</label>
                <input
                  type="text"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="2026"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Projek</label>
                <select
                  value={formData.status || 'Ongoing'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                >
                  <option value="Ongoing">Ongoing (Berjalan)</option>
                  <option value="Completed">Completed (Selesai)</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">X / Twitter Username</label>
                <input
                  type="text"
                  value={formData.xUsername || ''}
                  onChange={(e) => setFormData({ ...formData, xUsername: e.target.value })}
                  placeholder="@Hanford_HnR"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Link Post / Profile di X</label>
                <input
                  type="text"
                  value={formData.xLink || ''}
                  onChange={(e) => setFormData({ ...formData, xLink: e.target.value })}
                  placeholder="https://x.com/Hanford_HnR"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#51867E]"
                />
              </div>
            </div>

            {/* Descriptions & Images */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Deskripsi singkat projek..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Lengkap / Details HTML</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi mendalam projek kolaborasi..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>

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
                <label className="font-bold text-slate-700 block mb-1">Gallery Image URLs (1 URL per baris)</label>
                <textarea
                  rows={3}
                  value={galleryText}
                  onChange={(e) => setGalleryText(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#51867E] hover:bg-[#3f6d66] text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Projek</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative h-40 bg-slate-100 overflow-hidden">
              <img
                src={p.heroImage}
                alt={p.projectName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                {p.status}
              </div>
            </div>

            <div className="p-4 space-y-2 flex-grow">
              <h4 className="font-serif font-bold text-base text-[#3A4F67] line-clamp-1">{p.projectName}</h4>
              <div className="text-[11px] font-bold text-[#51867E] uppercase tracking-wider">
                Partner: {p.partnerName}
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{p.shortDescription || p.description}</p>
              {p.xUsername && (
                <div className="text-[11px] text-slate-600">X: <strong>{p.xUsername}</strong></div>
              )}
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
                onClick={() => handleDelete(p.id, p.projectName)}
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
