import React from 'react';
import { AdminSession } from '../../types/admin';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import {
  Activity,
  UserCheck,
  Crown,
  Users,
  Settings as SettingsIcon,
} from 'lucide-react';

interface AdminDashboardProps {
  session?: AdminSession | null;
  onNavigateModule?: (module: 'admins' | 'audit' | 'settings') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ session, onNavigateModule }) => {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* EVLab ADMIN CONTROL CENTER Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm" icon={<Activity className="w-3 h-3 text-cyan-400" />}>
              Google Sheets Security Engine Active
            </Badge>
            <span className="text-xs text-slate-500 font-mono">EVLab_Admin Database</span>
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-wide uppercase">
              EVLab ADMIN CONTROL CENTER
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Logged in as:</span>
                <strong className="text-white font-semibold">{session?.name || 'EVLab Administrator'}</strong>
                <span className="font-mono text-cyan-400 text-[11px]">({session?.admin_id || 'EVL-ADMIN-001'})</span>
              </span>

              <span className="text-slate-600">•</span>

              <span className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Role:</span>
                <span className="font-bold uppercase text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">
                  {session?.role === 'super_admin' ? 'SUPER ADMIN' : session?.role || 'SUPER ADMIN'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick System Shortcuts */}
        {onNavigateModule && session?.role === 'super_admin' && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="amber"
              size="sm"
              onClick={() => onNavigateModule('admins')}
              className="gap-2 text-xs font-semibold"
            >
              <Users className="w-4 h-4" />
              <span>Admin Accounts</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateModule('settings')}
              className="gap-2 text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              <SettingsIcon className="w-4 h-4 text-cyan-400" />
              <span>Settings</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
