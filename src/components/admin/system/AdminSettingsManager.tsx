import React, { useState, useEffect } from 'react';
import { AdminAuthService } from '../../../services/adminAuthService';
import { AdminSettings } from '../../../types/admin';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import {
  Settings,
  Key,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Save,
} from 'lucide-react';

export const AdminSettingsManager: React.FC = () => {
  // Password change state
  const [currentPass, setCurrentPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [confirmPass, setConfirmPass] = useState<string>('');
  const [passSubmitting, setPassSubmitting] = useState<boolean>(false);
  const [passError, setPassError] = useState<string>('');
  const [passSuccess, setPassSuccess] = useState<string>('');

  // Security Policy Settings state
  const [settings, setSettings] = useState<AdminSettings>({
    maxFailedAttempts: 5,
    lockoutMinutes: 15,
    sessionHours: 8,
  });
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);
  const [settingsSubmitting, setSettingsSubmitting] = useState<boolean>(false);
  const [settingsError, setSettingsError] = useState<string>('');
  const [settingsSuccess, setSettingsSuccess] = useState<string>('');

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const data = await AdminAuthService.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPass || !newPass || !confirmPass) {
      setPassError('All password fields are required.');
      return;
    }

    if (newPass.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassSubmitting(true);
    try {
      const res = await AdminAuthService.changePassword(currentPass, newPass);
      setPassSuccess(res.message || 'Password successfully updated.');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      setPassError(err?.message || 'Failed to change password.');
    } finally {
      setPassSubmitting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    setSettingsSubmitting(true);

    try {
      const updated = await AdminAuthService.saveSettings(settings);
      setSettings(updated);
      setSettingsSuccess('Security & Account Lockout Policy saved successfully.');
    } catch (err: any) {
      setSettingsError(err?.message || 'Failed to save settings.');
    } finally {
      setSettingsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-slate-100">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Security & Account Settings</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage administrator credentials, session duration, and automated account lockout thresholds.
            </p>
          </div>
        </div>

        <Badge variant="cyan" size="sm" icon={<Lock className="w-3 h-3 text-cyan-400" />}>
          SHA-256 Hashed Security
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION 1: CHANGE PASSWORD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Change Account Password</h2>
              <p className="text-[11px] text-slate-400">Update your administrator access credentials.</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="At least 8 characters..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-type new password..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {passError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <Button type="submit" variant="amber" disabled={passSubmitting} className="w-full justify-center font-semibold text-xs py-2.5">
              {passSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              <span>Update Password</span>
            </Button>
          </form>
        </div>

        {/* SECTION 2: SECURITY & LOCKOUT POLICY CONFIGURATION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Security & Lockout Policy</h2>
              <p className="text-[11px] text-slate-400">Configure attempt limits, lockout durations, and session lifetime</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Max Failed Attempts</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.maxFailedAttempts || 5}
                  onChange={(e) => setSettings({ ...settings, maxFailedAttempts: parseInt(e.target.value) || 5 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Consec. failures before lock.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Lockout Duration (Mins)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.lockoutMinutes || 15}
                  onChange={(e) => setSettings({ ...settings, lockoutMinutes: parseInt(e.target.value) || 15 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Minutes locked out.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Session Lifetime (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={settings.sessionHours || 8}
                  onChange={(e) => setSettings({ ...settings, sessionHours: parseInt(e.target.value) || 8 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Bearer token expiry.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="text-white font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Local Security Architecture Summary</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                <li>Passwords are hashed server-side using SHA-256 with cryptographic salt.</li>
                <li>Session tokens are validated on every API request and auto-expire after inactivity.</li>
                <li>Audit logs track all authentication attempts, password updates, and user modifications.</li>
              </ul>
            </div>

            {settingsError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            {settingsSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <Button type="submit" variant="emerald" disabled={settingsSubmitting} className="w-full justify-center font-semibold text-xs py-2.5">
              {settingsSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Security Policy</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
