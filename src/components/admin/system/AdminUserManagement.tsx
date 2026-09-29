import React, { useState, useEffect } from 'react';
import { AdminUser, AdminRole, AdminStatus } from '../../../types/admin';
import { AdminAuthService } from '../../../services/adminAuthService';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Lock,
  Key,
  Edit2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Crown,
  Search,
  X,
  Clock,
} from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);

  // Form states
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  
  // Add Admin form
  const [newAdminId, setNewAdminId] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRole, setNewRole] = useState<AdminRole>('admin');

  // Edit Admin form
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editRole, setEditRole] = useState<AdminRole>('admin');
  const [editStatus, setEditStatus] = useState<AdminStatus>('active');

  // Reset Password form
  const [resetPassValue, setResetPassValue] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchAdmins = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const list = await AdminAuthService.getAdmins();
      setAdmins(list);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load administrator accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminId.trim() || !newName.trim() || !newEmail.trim() || !newPassword) {
      setErrorMsg('All fields are required for creating an administrator account.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await AdminAuthService.createAdmin({
        admin_id: newAdminId.trim().toUpperCase(),
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
      });

      setSuccessMsg(`Administrator ${newAdminId.toUpperCase()} created successfully!`);
      setIsAddOpen(false);
      setNewAdminId('');
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      fetchAdmins();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create administrator.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setEditName(admin.name);
    setEditEmail(admin.email);
    setEditRole(admin.role);
    setEditStatus(admin.status);
    setIsEditOpen(true);
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await AdminAuthService.updateAdmin(selectedAdmin.admin_id, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        status: editStatus,
      });

      setSuccessMsg(`Administrator ${selectedAdmin.admin_id} updated successfully!`);
      setIsEditOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update administrator.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: AdminUser) => {
    const nextStatus: AdminStatus = admin.status === 'active' ? 'inactive' : 'active';
    try {
      await AdminAuthService.updateAdmin(admin.admin_id, { status: nextStatus });
      setSuccessMsg(`Administrator ${admin.admin_id} is now ${nextStatus}.`);
      fetchAdmins();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to toggle account status.');
    }
  };

  const handleOpenResetPass = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setResetPassValue('');
    setIsResetOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin || !resetPassValue || resetPassValue.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await AdminAuthService.resetAdminPassword(selectedAdmin.admin_id, resetPassValue);
      setSuccessMsg(`Password for ${selectedAdmin.admin_id} reset successfully.`);
      setIsResetOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeSessions = async (admin: AdminUser) => {
    try {
      await AdminAuthService.revokeSessions(admin.admin_id);
      setSuccessMsg(`Active sessions for ${admin.admin_id} successfully revoked.`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to revoke sessions.');
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.admin_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Admin Account Management</span>
              <Badge variant="amber" size="sm" icon={<Crown className="w-3 h-3 text-amber-400" />}>
                Super Admin Privilege
              </Badge>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage EVLab administrators, roles, active status, and password hash security.
            </p>
          </div>
        </div>

        <Button
          variant="amber"
          onClick={() => setIsAddOpen(true)}
          className="gap-2 shrink-0 font-semibold text-xs py-2.5 shadow-lg shadow-amber-950/40"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Administrator</span>
        </Button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Admin ID, name, or email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <Button variant="ghost" size="sm" onClick={fetchAdmins} className="gap-1.5 text-xs text-slate-400 hover:text-white">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Administrators Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <span>Loading Administrator Accounts from Local Database...</span>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No administrator accounts found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Admin ID</th>
                  <th className="p-4">Name & Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Login</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.admin_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-cyan-300">
                      {admin.admin_id}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-200">{admin.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{admin.email}</div>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        admin.role === 'super_admin'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {admin.role === 'super_admin' && <Crown className="w-3 h-3 text-amber-400" />}
                        {admin.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        admin.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : admin.status === 'locked'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {admin.status === 'active' ? (
                          <UserCheck className="w-3 h-3 text-emerald-400" />
                        ) : admin.status === 'locked' ? (
                          <Lock className="w-3 h-3 text-rose-400" />
                        ) : (
                          <UserX className="w-3 h-3 text-slate-400" />
                        )}
                        {admin.status}
                      </span>
                      {admin.failed_attempts && admin.failed_attempts > 0 ? (
                        <div className="text-[10px] text-rose-400 font-mono mt-0.5">
                          {admin.failed_attempts} failed attempt(s)
                        </div>
                      ) : null}
                    </td>

                    <td className="p-4 font-mono text-slate-400 text-[11px]">
                      {admin.last_login ? (
                        new Date(admin.last_login).toLocaleString()
                      ) : (
                        <span className="text-slate-600">Never</span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(admin)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit Admin"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenResetPass(admin)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
                        title="Reset Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleRevokeSessions(admin)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors"
                        title="Revoke Active Sessions"
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(admin)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          admin.status === 'active'
                            ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-400'
                            : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400'
                        }`}
                        title={admin.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {admin.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE ADMIN MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>Create Administrator Account</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Admin ID</label>
                <input
                  type="text"
                  value={newAdminId}
                  onChange={(e) => setNewAdminId(e.target.value)}
                  placeholder="EVL-ADMIN-002"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono tracking-wider focus:outline-none focus:border-amber-500 uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Initial Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="super_admin">super_admin (Full Control)</option>
                  <option value="admin">admin (Module Manager)</option>
                  <option value="editor">editor (Content Editor)</option>
                  <option value="viewer">viewer (Read Only)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="amber" disabled={submitting} className="gap-2 font-semibold">
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Create Account</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN MODAL */}
      {isEditOpen && selectedAdmin && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-400" />
                <span>Edit Admin {selectedAdmin.admin_id}</span>
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as AdminRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="super_admin">super_admin</option>
                  <option value="admin">admin</option>
                  <option value="editor">editor</option>
                  <option value="viewer">viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as AdminStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive (Deactivated)</option>
                  <option value="locked">locked</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="cyan" disabled={submitting} className="gap-2 font-semibold">
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetOpen && selectedAdmin && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Reset Password for {selectedAdmin.admin_id}</span>
              </h3>
              <button onClick={() => setIsResetOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={resetPassValue}
                  onChange={(e) => setResetPassValue(e.target.value)}
                  placeholder="Min 8 characters..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
                Resetting password will hash the new password and automatically unlock the account if previously locked.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsResetOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="amber" disabled={submitting} className="gap-2 font-semibold">
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  <span>Set New Password</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
