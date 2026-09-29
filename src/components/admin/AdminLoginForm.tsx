import React, { useState } from 'react';
import { AdminAuthService, DEFAULT_INITIAL_ADMIN_ID } from '../../services/adminAuthService';
import { AdminSession } from '../../types/admin';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { ShieldCheck, UserCheck, Key, ArrowRight, AlertTriangle, Lock, RefreshCw, Database } from 'lucide-react';

interface AdminLoginFormProps {
  onLoginSuccess: (session: AdminSession) => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLoginSuccess }) => {
  const [adminId, setAdminId] = useState<string>(DEFAULT_INITIAL_ADMIN_ID);
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminId.trim()) {
      setErrorMsg('Please enter your Admin ID.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your administrator password.');
      return;
    }

    setLoading(true);
    try {
      const session = await AdminAuthService.login(adminId.trim(), password);
      onLoginSuccess(session);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid Admin ID or Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Ambient Radial Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-cyan-400 mb-1">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase flex items-center justify-center gap-2">
              <span>EVLab ADMINISTRATOR ACCESS</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Central Engineering Digital Twin Management System
            </p>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Local Backend Database Auth</span>
            </span>
            <Badge variant="cyan" size="sm" icon={<Lock className="w-3 h-3 text-cyan-400" />}>
              EVLab Local Security
            </Badge>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Admin ID Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Admin ID
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="EVL-ADMIN-001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors font-mono tracking-wider uppercase"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Super Admin Account ID: <span className="text-cyan-400 font-mono font-semibold">{DEFAULT_INITIAL_ADMIN_ID}</span>
              </p>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                  required
                />
              </div>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              variant="cyan"
              disabled={loading}
              className="w-full justify-center py-3.5 text-sm font-semibold shadow-lg shadow-cyan-950/50 uppercase tracking-wide"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  LOGIN
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Security & System Info Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1.5">
          <p>© EVLab Central Digital Twin Architecture • All Rights Reserved</p>
          <p className="text-[10px] text-slate-600 font-mono">
            Powered by Central EVLab Local Backend Authentication Engine
          </p>
        </div>
      </div>
    </div>
  );
};
