import React from 'react';
import { Building2, FolderGit2, CalendarCheck, FileCheck, FileX, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Property, Project, BookingInquiry, AdminUser } from '../../types';

interface AdminOverviewProps {
  properties: Property[];
  projects: Project[];
  bookings: BookingInquiry[];
  adminUsers: AdminUser[];
  onNavigateTab: (tab: 'locations' | 'collaborations' | 'bookings' | 'users') => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  properties,
  projects,
  bookings,
  adminUsers,
  onNavigateTab
}) => {
  const unpaidBookings = bookings.filter((b) => b.paymentStatus !== 'PAID');
  const paidBookings = bookings.filter((b) => b.paymentStatus === 'PAID');
  const pendingUsers = adminUsers.filter((u) => u.status === 'Pending');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-[#3A4F67] to-[#2C3744] text-white rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#51867E]/30 text-[#88B2AB] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#51867E]/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Central Admin Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-light tracking-wide">
            Hanford Management Portal
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Manage your luxury sanctuaries, brand collaboration projects, booking inquiries, and guest paid invoices from one central console.
          </p>
        </div>
      </div>

      {/* Pending Admin Alert Banner if any */}
      {pendingUsers.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-700 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <strong className="font-bold block">Ada {pendingUsers.length} Permohonan Akun Admin Baru (Pending)</strong>
              <span>Tinjau dan setujui (Accept) pendaftaran admin di menu Manajemen Admin Users.</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('users')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg uppercase tracking-wider text-[11px] shrink-0 cursor-pointer transition-colors"
          >
            Review Pending ({pendingUsers.length})
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Locations Stat */}
        <div
          onClick={() => onNavigateTab('locations')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#3A4F67] uppercase tracking-wider">Sanctuaries & Locations</span>
            <div className="p-2 bg-[#EAF2F1] text-[#51867E] rounded-xl group-hover:bg-[#51867E] group-hover:text-white transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-light text-[#2C3744]">{properties.length}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium group-hover:text-[#51867E]">
            <span>Manage Locations & Pricing</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Collaborations Stat */}
        <div
          onClick={() => onNavigateTab('collaborations')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#3A4F67] uppercase tracking-wider">Collaborations</span>
            <div className="p-2 bg-[#EAF2F1] text-[#51867E] rounded-xl group-hover:bg-[#51867E] group-hover:text-white transition-colors">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-light text-[#2C3744]">{projects.length}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium group-hover:text-[#51867E]">
            <span>Manage Projects & Content</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Unpaid Invoices Stat */}
        <div
          onClick={() => onNavigateTab('bookings')}
          className="p-5 bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Unpaid Invoices</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <FileX className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-light text-amber-700">{unpaidBookings.length}</div>
          <div className="text-[11px] text-amber-800 flex items-center gap-1 font-medium">
            <span>Mark as PAID & Print</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Paid Invoices Stat */}
        <div
          onClick={() => onNavigateTab('bookings')}
          className="p-5 bg-white rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Paid Invoices</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-light text-emerald-700">{paidBookings.length}</div>
          <div className="text-[11px] text-emerald-800 flex items-center gap-1 font-medium">
            <span>Print Official Receipts</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Quick Access Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#3A4F67]">
          Quick Access & Operations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigateTab('locations')}
            className="p-4 bg-slate-50 hover:bg-[#EAF2F1] rounded-xl text-left border border-slate-200 transition-colors space-y-1 cursor-pointer group"
          >
            <strong className="text-xs font-bold text-[#3A4F67] group-hover:text-[#51867E] block">
              + Edit Sanctuaries (Locations)
            </strong>
            <p className="text-[11px] text-slate-500">Ubah nama, harga kamar, foto, dan status properti.</p>
          </button>

          <button
            onClick={() => onNavigateTab('collaborations')}
            className="p-4 bg-slate-50 hover:bg-[#EAF2F1] rounded-xl text-left border border-slate-200 transition-colors space-y-1 cursor-pointer group"
          >
            <strong className="text-xs font-bold text-[#3A4F67] group-hover:text-[#51867E] block">
              + Edit Collaborations
            </strong>
            <p className="text-[11px] text-slate-500">Kelola daftar projek, partner, link X, dan galeri.</p>
          </button>

          <button
            onClick={() => onNavigateTab('bookings')}
            className="p-4 bg-slate-50 hover:bg-[#EAF2F1] rounded-xl text-left border border-slate-200 transition-colors space-y-1 cursor-pointer group"
          >
            <strong className="text-xs font-bold text-[#3A4F67] group-hover:text-[#51867E] block">
              + Bookings & Print Invoice Paid
            </strong>
            <p className="text-[11px] text-slate-500">Cetak invoice paid dan ubah status booking guest.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
