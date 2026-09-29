import React from 'react';
import { FullUELEDatabase } from '../../services/ueleAdminService';
import { UELEAdminService } from '../../services/ueleAdminService';
import { UELESubModule, AdminSession } from '../../types/admin';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import {
  Globe2,
  Map,
  Boxes,
  Building2,
  Cpu,
  Share2,
  Layers,
  Box,
  PlusCircle,
  Clock,
  CheckCircle2,
  FileEdit,
  ShieldCheck,
  Activity,
  UserCheck,
  Crown,
  Database,
  Users,
  Settings as SettingsIcon,
  FolderGit2,
  Laptop,
  Compass,
  GraduationCap,
  Library,
} from 'lucide-react';

interface AdminDashboardProps {
  session?: AdminSession | null;
  database: FullUELEDatabase;
  onNavigateUELE: (subModule: UELESubModule) => void;
  onQuickAction: (action: 'add-facility' | 'add-gis' | 'add-model' | 'add-region' | 'add-zone' | 'add-network') => void;
  onNavigateModule?: (module: 'admins' | 'audit' | 'settings') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  session,
  database,
  onNavigateUELE,
  onQuickAction,
  onNavigateModule,
}) => {
  const metrics = UELEAdminService.calculateMetrics(database);

  const metricCards = [
    { label: 'Worlds', count: metrics.worldsCount, sub: 'Master Boundaries', icon: <Globe2 className="w-5 h-5 text-purple-400" />, subModule: 'world' as UELESubModule, color: 'border-purple-500/20' },
    { label: 'Regions', count: metrics.regionsCount, sub: 'Urban/Rural Core', icon: <Map className="w-5 h-5 text-cyan-400" />, subModule: 'regions' as UELESubModule, color: 'border-cyan-500/20' },
    { label: 'Zones', count: metrics.zonesCount, sub: 'Sectoral Areas', icon: <Boxes className="w-5 h-5 text-emerald-400" />, subModule: 'zones' as UELESubModule, color: 'border-emerald-500/20' },
    { label: 'Facilities', count: metrics.facilitiesCount, sub: 'Georeferenced Points', icon: <Building2 className="w-5 h-5 text-amber-400" />, subModule: 'facilities' as UELESubModule, color: 'border-amber-500/20' },
    { label: 'Components', count: metrics.componentsCount, sub: 'Engineering Equipment', icon: <Cpu className="w-5 h-5 text-rose-400" />, subModule: 'components' as UELESubModule, color: 'border-rose-500/20' },
    { label: 'Networks', count: metrics.networksCount, sub: 'Pipe/Line Linear Systems', icon: <Share2 className="w-5 h-5 text-blue-400" />, subModule: 'networks' as UELESubModule, color: 'border-blue-500/20' },
    { label: 'GIS Layers', count: metrics.gisLayersCount, sub: 'Vector & Shapefiles', icon: <Layers className="w-5 h-5 text-teal-400" />, subModule: 'gis' as UELESubModule, color: 'border-teal-500/20' },
    { label: '3D Models', count: metrics.models3DCount, sub: 'GLB Digital Twins', icon: <Box className="w-5 h-5 text-indigo-400" />, subModule: 'models' as UELESubModule, color: 'border-indigo-500/20' },
  ];

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

      {/* Quick Action Creator Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-cyan-400" />
          <span>Quick Actions & Creator Tools</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onQuickAction('add-facility')}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 text-left transition-all group"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 w-fit mb-2 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-200">+ Add Facility</div>
            <div className="text-[10px] text-slate-500">Pick lat/lng on map</div>
          </button>

          <button
            onClick={() => onQuickAction('add-gis')}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-teal-500/30 hover:border-teal-500/60 text-left transition-all group"
          >
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 w-fit mb-2 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-200">+ Add GIS Layer</div>
            <div className="text-[10px] text-slate-500">Upload Shapefile .zip</div>
          </button>

          <button
            onClick={() => onQuickAction('add-model')}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-500/60 text-left transition-all group"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit mb-2 group-hover:scale-110 transition-transform">
              <Box className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-200">+ Upload 3D Model</div>
            <div className="text-[10px] text-slate-500">GLB with .geo.json</div>
          </button>

          <button
            onClick={() => onQuickAction('add-region')}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-500/60 text-left transition-all group"
          >
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit mb-2 group-hover:scale-110 transition-transform">
              <Map className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-200">+ Add Region</div>
            <div className="text-[10px] text-slate-500">Regional boundary</div>
          </button>

          <button
            onClick={() => onQuickAction('add-zone')}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/60 text-left transition-all group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-2 group-hover:scale-110 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-200">+ Add Zone</div>
            <div className="text-[10px] text-slate-500">Sectoral zone</div>
          </button>

          <button
            onClick={() => onQuickAction('add-network')}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-blue-500/30 hover:border-blue-500/60 text-left transition-all group"
          >
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 w-fit mb-2 group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-200">+ Add Network</div>
            <div className="text-[10px] text-slate-500">Linear pipe/power line</div>
          </button>
        </div>
      </div>

      {/* UELE Summary Metric Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-purple-400" />
            <span>UELE Engine Sub-Modules Summary</span>
          </span>
          <span className="text-[11px] font-normal text-slate-500">Click card to open module manager</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card) => (
            <div
              key={card.label}
              onClick={() => onNavigateUELE(card.subModule)}
              className={`p-5 rounded-2xl bg-slate-900 border ${card.color} hover:border-slate-600 transition-all cursor-pointer group shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <div className="text-2xl font-bold font-mono text-slate-100">
                  {card.count}
                </div>
              </div>
              <div className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                {card.label}
              </div>
              <div className="text-xs text-slate-500">{card.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Trail Log Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Recent Admin Audit Trail</span>
          </h3>
          <span className="text-xs text-slate-500">{database.auditLogs?.length || 0} total logged events</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {database.auditLogs && database.auditLogs.length > 0 ? (
            <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
              {database.auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-950/50 transition-colors flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-slate-200 flex items-center gap-2 truncate">
                        <span>{log.action}</span>
                        <Badge variant="cyan" size="sm">{log.module || (log as any).objectType || 'System'}</Badge>
                      </div>
                      <div className="text-slate-400 text-[11px] truncate mt-0.5">{log.details}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{log.admin_id || (log as any).userEmail}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              No audit logs recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
