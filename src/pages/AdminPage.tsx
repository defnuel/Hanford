import React, { useState, useEffect } from 'react';
import { AdminUser, Property, Project, BookingInquiry } from '../types';
import {
  fetchLocations,
  fetchProjects,
  fetchBookings,
  getAdminUsers
} from '../services/dataService';
import { AdminLoginForm } from '../components/admin/AdminLoginForm';
import { AdminOverview } from '../components/admin/AdminOverview';
import { LocationsEditor } from '../components/admin/LocationsEditor';
import { ProjectsEditor } from '../components/admin/ProjectsEditor';
import { BookingsManager } from '../components/admin/BookingsManager';
import { AdminUsersManager } from '../components/admin/AdminUsersManager';
import { ShieldCheck, Building2, FolderGit2, FileText, Users, LogOut, ArrowLeft, LayoutDashboard } from 'lucide-react';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('hanford_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'collaborations' | 'bookings' | 'users'>('overview');

  // Data
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [bookings, setBookings] = useState<BookingInquiry[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const locs = await fetchLocations();
      setProperties(locs.data || []);

      const projs = await fetchProjects();
      setProjects(projs.data || []);

      const bks = await fetchBookings();
      setBookings(bks);

      const users = getAdminUsers();
      setAdminUsers(users);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAllAdminData();
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    sessionStorage.setItem('hanford_admin_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('hanford_admin_session');
  };

  if (!currentUser) {
    return <AdminLoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  const pendingCount = adminUsers.filter((u) => u.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-100 text-[#2C3744] font-sans flex flex-col">
      
      {/* Top Admin Header Bar */}
      <header className="bg-[#3A4F67] text-white border-b border-slate-700 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/')}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-slate-200 hover:text-white"
              title="Ke Website Utama"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="font-serif text-lg sm:text-xl font-light tracking-[0.2em] text-white uppercase flex items-center gap-2">
                <span>HANFORD</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#88B2AB]" />
                <span className="text-xs text-[#88B2AB] font-mono uppercase font-bold tracking-widest pl-1">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-300 tracking-wider">Central Operations & Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-white">{currentUser.fullName}</div>
              <div className="text-[10px] text-[#88B2AB] font-mono">
                {currentUser.role} &bull; {currentUser.department || 'Management'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Tab Nav */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[61px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-2 sm:gap-6 overflow-x-auto py-2">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#51867E] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#3A4F67] hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'locations'
                ? 'bg-[#51867E] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#3A4F67] hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Locations ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('collaborations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'collaborations'
                ? 'bg-[#51867E] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#3A4F67] hover:bg-slate-50'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Collaborations ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-[#51867E] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#3A4F67] hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Bookings & Invoices ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer relative ${
              activeTab === 'users'
                ? 'bg-[#51867E] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#3A4F67] hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Admin Users ({adminUsers.length})</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

        </div>
      </div>

      {/* Main Admin Content Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-8">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#51867E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Memuat data Admin Portal...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <AdminOverview
                properties={properties}
                projects={projects}
                bookings={bookings}
                adminUsers={adminUsers}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'locations' && (
              <LocationsEditor
                properties={properties}
                onRefreshData={loadAllAdminData}
              />
            )}

            {activeTab === 'collaborations' && (
              <ProjectsEditor
                projects={projects}
                onRefreshData={loadAllAdminData}
              />
            )}

            {activeTab === 'bookings' && (
              <BookingsManager
                bookings={bookings}
                onRefreshData={loadAllAdminData}
              />
            )}

            {activeTab === 'users' && (
              <AdminUsersManager
                currentUser={currentUser}
                adminUsers={adminUsers}
                onRefreshData={loadAllAdminData}
              />
            )}
          </>
        )}
      </main>

      {/* Admin Footer */}
      <footer className="bg-slate-200 border-t border-slate-300 py-4 text-center text-xs text-slate-500">
        Hanford Hotels & Resorts &bull; Private Admin Interface (/admin)
      </footer>
    </div>
  );
};
