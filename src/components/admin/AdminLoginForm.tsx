import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck, UserPlus, LogIn, AlertCircle, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import { authenticateAdmin, registerAdminRequest } from '../../services/dataService';
import { AdminUser } from '../../types';

interface AdminLoginFormProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [regErrorMsg, setRegErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Harap isi Username/Email dan Password.');
      return;
    }

    const res = authenticateAdmin(loginIdentifier, loginPassword);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setLoginError(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg('');
    setRegSuccessMsg('');

    if (!regFullName.trim() || !regEmail.trim() || !regUsername.trim() || !regPassword.trim()) {
      setRegErrorMsg('Harap lengkapi semua bidang isian pendaftaran.');
      return;
    }

    const res = registerAdminRequest({
      fullName: regFullName,
      email: regEmail,
      username: regUsername,
      password: regPassword,
      department: regDept || 'Operations & Management'
    });

    if (res.success) {
      setRegSuccessMsg(res.message);
      setRegFullName('');
      setRegEmail('');
      setRegUsername('');
      setRegPassword('');
      setRegDept('');
    } else {
      setRegErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#51867E]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#3A4F67]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-[#51867E]/20 text-[#88B2AB] rounded-full mb-1 border border-[#51867E]/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-light tracking-[0.2em] text-white uppercase">
            HANFORD ADMIN
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Management Portal &bull; Sanctuaries, Projects & Invoices
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900/80 rounded-xl p-1 border border-slate-700/60">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#51867E] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setRegErrorMsg('');
              setRegSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#51867E] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Admin</span>
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
            
            {/* Super Admin Credentials Preset Card */}
            <div className="p-3 bg-[#51867E]/10 border border-[#51867E]/30 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#88B2AB] uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Default Super Admin Credentials:</span>
              </div>
              <div className="text-slate-300 font-mono text-[11px] flex justify-between pt-1">
                <span>Username: <strong className="text-white">admin</strong></span>
                <span>Password: <strong className="text-white">admin123</strong></span>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Username atau Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="admin atau email@hanford.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-[#51867E] rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-[#51867E] rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-[#51867E]/20 mt-4 cursor-pointer"
            >
              Masuk ke Portal Admin
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 pt-1">
            <p className="text-xs text-slate-400 leading-relaxed">
              Daftarkan email dan username Anda. Akun baru akan berada dalam status <strong className="text-amber-400">PENDING</strong> hingga disetujui (Accepted) oleh Super Admin.
            </p>

            {regSuccessMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{regSuccessMsg}</span>
              </div>
            )}

            {regErrorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{regErrorMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Contoh: Alexander Wright"
                className="w-full px-3.5 py-2 bg-slate-900/90 border border-slate-700 focus:border-[#51867E] rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block">
                Email
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="alexander@hanfordresorts.com"
                className="w-full px-3.5 py-2 bg-slate-900/90 border border-slate-700 focus:border-[#51867E] rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block">
                  Username
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="alexander"
                  className="w-full px-3.5 py-2 bg-slate-900/90 border border-slate-700 focus:border-[#51867E] rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-slate-900/90 border border-slate-700 focus:border-[#51867E] rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block">
                Departemen / Divisi (Opsional)
              </label>
              <input
                type="text"
                value={regDept}
                onChange={(e) => setRegDept(e.target.value)}
                placeholder="Contoh: Reservations & Front Office"
                className="w-full px-3.5 py-2 bg-slate-900/90 border border-slate-700 focus:border-[#51867E] rounded-xl text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#51867E] hover:bg-[#3f6d66] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-lg mt-3 cursor-pointer"
            >
              Ajukan Pendaftaran Admin
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-[10px] text-slate-500">
          Hanford Hotels & Resorts &bull; Central Management System
        </div>
      </div>
    </div>
  );
};
