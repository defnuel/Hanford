import React, { useState } from 'react';
import { AdminUser } from '../../types';
import { Users, CheckCircle2, XCircle, ShieldCheck, UserPlus, Clock, Sparkles, Check, Trash2 } from 'lucide-react';
import { approveAdminUser, rejectAdminUser, registerAdminRequest } from '../../services/dataService';

interface AdminUsersManagerProps {
  currentUser: AdminUser;
  adminUsers: AdminUser[];
  onRefreshData: () => void;
}

export const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({
  currentUser,
  adminUsers,
  onRefreshData
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [formError, setFormError] = useState('');

  const pendingUsers = adminUsers.filter((u) => u.status === 'Pending');
  const approvedUsers = adminUsers.filter((u) => u.status === 'Approved');

  const handleApprove = (userId: string, name: string) => {
    approveAdminUser(userId);
    onRefreshData();
    setToastMsg(`Akun Admin "${name}" telah disetujui (Approved)!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleReject = (userId: string, name: string) => {
    if (window.confirm(`Tolak pendaftaran akun admin untuk "${name}"?`)) {
      rejectAdminUser(userId);
      onRefreshData();
      setToastMsg(`Pendaftaran admin "${name}" telah ditolak/dihapus.`);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleCreateAdminDirect = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName || !email || !username || !password) {
      setFormError('Harap lengkapi seluruh field yang wajib.');
      return;
    }

    const res = registerAdminRequest({
      fullName,
      email,
      username,
      password,
      department: department || 'Central Admin'
    });

    if (res.success) {
      // Auto approve since created by super admin
      const allUsers = adminUsers;
      const created = allUsers.find((u) => u.username === username);
      if (created) {
        approveAdminUser(created.id);
      }
      onRefreshData();
      setShowAddModal(false);
      setFullName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setDepartment('');
      setToastMsg(`Akun admin baru "${fullName}" berhasil dibuat & langsung aktif!`);
      setTimeout(() => setToastMsg(''), 3000);
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-light text-[#3A4F67]">
            Admin Users & Approvals ({adminUsers.length})
          </h2>
          <p className="text-xs text-slate-500">
            Kelola akses staf admin dan setujui (Accept) pendaftaran email admin baru.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#51867E] hover:bg-[#3f6d66] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Buat Admin Baru</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* PENDING APPROVALS SECTION */}
      {pendingUsers.length > 0 && (
        <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold uppercase tracking-wider text-xs">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Permohonan Pendaftaran Admin (Pending - {pendingUsers.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 bg-white rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{user.fullName}</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                      PENDING
                    </span>
                  </div>
                  <div className="text-xs text-[#51867E] font-medium">{user.email}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Username: <strong>{user.username}</strong>
                  </div>
                  {user.department && (
                    <div className="text-[10px] text-slate-400">Divisi: {user.department}</div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleReject(user.id, user.fullName)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                  <button
                    onClick={() => handleApprove(user.id, user.fullName)}
                    className="px-3.5 py-1.5 bg-[#51867E] hover:bg-[#3f6d66] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept / Setujui</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPROVED ADMINS LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <h3 className="font-bold text-sm uppercase tracking-wider text-[#3A4F67] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#51867E]" />
          <span>Akun Admin Aktif ({approvedUsers.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Lengkap & Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Divisi / Dept</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {approvedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 space-y-0.5">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>{u.fullName}</span>
                      {u.role === 'Super Admin' && (
                        <span className="px-1.5 py-0.5 bg-[#51867E]/10 text-[#51867E] text-[9px] font-bold uppercase rounded">
                          Default Super Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">@{u.username}</div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>

                  <td className="py-3 px-4">
                    <span className={`font-bold ${u.role === 'Super Admin' ? 'text-[#51867E]' : 'text-slate-700'}`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500">{u.department || 'Central'}</td>

                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Approved</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#3A4F67]">
                Tambah Admin Baru (Langsung Aktif)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAdminDirect} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Eleanor Vance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eleanor@hanfordresorts.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="eleanor"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Divisi / Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Front Office & Guest Services"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#51867E] hover:bg-[#3f6d66] text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Buat Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
