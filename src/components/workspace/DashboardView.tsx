/**
 * EV Software Core - Workspace Dashboard
 * Central command center summarizing ecosystem applications, active projects,
 * transfer velocity, validation health, and recent audit logs.
 */

import React from 'react';
import {
  Grid,
  FolderKanban,
  Database,
  ArrowRightLeft,
  ShieldCheck,
  History,
  HardDrive,
  Workflow,
  Plus,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Globe2,
  Compass,
  Droplets,
  Layers,
  Calculator,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import { useCore } from '../../core/store/coreStore';
import { WorkspaceTab } from '../layout/CoreSidebar';
import { Badge } from '../common/Badge';

interface DashboardViewProps {
  onNavigate: (tab: WorkspaceTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { applications, projects, datasets, transfers, auditLogs, activeProject } = useCore();

  const appIconMap: Record<string, any> = {
    'app-ev-gis': Globe2,
    'app-ev-mini-cad': Compass,
    'app-ev-wtp': Droplets,
    'app-ev-stp': Layers,
    'app-ev-boq': Calculator,
    'app-ev-waterflow': Activity,
    'app-ev-sheet': FileSpreadsheet,
    'app-ev-ai': Sparkles,
  };

  const pendingTransfers = transfers.filter(
    (t) => t.state === 'sent' || t.state === 'prepared' || t.state === 'imported'
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Hero Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                EVSoftware Space Hub
              </span>
              <span className="text-xs text-slate-400 font-mono">Platform v1.0 • Unified Workspace</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              EVSoftware Space
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Unified engineering space where all sibling software applications (GIS, CAD, Water Treatment, STP, BoQ, WaterFlow, AI Assistant) are built, run, integrated, and exchange data through verified cryptographic revisions and shared project context.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('proving_bench')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all"
            >
              <Workflow className="w-4 h-4" />
              Launch GIS ↔ CAD Space Bench
            </button>
            <button
              onClick={() => onNavigate('registry')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
            >
              Software Space Apps
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registered Sibling Apps</span>
            <Grid className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{applications.length}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> 100% Core API Compatible
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Projects</span>
            <FolderKanban className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{projects.length}</div>
          <div className="text-[11px] text-slate-400 truncate">
            Current: {activeProject?.code || 'None'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Managed Datasets</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{datasets.length}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            {datasets.reduce((acc, d) => acc + (d.currentRevisionNumber || 1), 0)} Revisions Tracked
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Data Exchanges (Transfers)</span>
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{transfers.length}</div>
          <div className="text-[11px] text-blue-400 font-medium">
            {pendingTransfers.length} Pending Review/Commit
          </div>
        </div>
      </div>

      {/* Sibling Application Launchpad */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Independent Sibling Applications
            </h2>
            <p className="text-xs text-slate-400">
              Each engineering application maintains domain autonomy while communicating via EV Core API.
            </p>
          </div>
          <button
            onClick={() => onNavigate('registry')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
          >
            Explore Application Manifests <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {applications.map((app) => {
            const Icon = appIconMap[app.appId] || Grid;
            const isProofApp = app.appId === 'app-ev-gis' || app.appId === 'app-ev-mini-cad';

            return (
              <div
                key={app.appId}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-slate-800 text-blue-400 border border-slate-700/80 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant={app.releaseStatus === 'ga' ? 'success' : 'primary'}>
                      {app.releaseStatus}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm">{app.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {app.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400">v{app.version}</span>
                  {isProofApp ? (
                    <button
                      onClick={() => onNavigate('proving_bench')}
                      className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      Open in Proof Bench <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-slate-400 font-mono text-[10px]">Sibling Svc</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Recent Transfers Pulse & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfers Pulse */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">Data Exchange Lifecycle</h3>
            </div>
            <button
              onClick={() => onNavigate('transfers')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {transfers.slice(0, 3).map((trf) => (
              <div
                key={trf.transferId}
                onClick={() => onNavigate('transfers')}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-200">
                    <span className="text-blue-400">{trf.sourceApplicationId.replace('app-', '')}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-emerald-400">{trf.destinationApplicationId.replace('app-', '')}</span>
                  </div>
                  <Badge
                    variant={
                      trf.state === 'committed'
                        ? 'success'
                        : trf.state === 'validated'
                        ? 'info'
                        : trf.state === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {trf.state}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{trf.package.changeSummary}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                  <span>ID: {trf.transferId}</span>
                  <span>{new Date(trf.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Stream */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">Tamper-Evident Audit Trail</h3>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              Full Log <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.auditId} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-blue-400 font-semibold">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 text-[11px] line-clamp-1">{log.description}</p>
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span>Actor: {log.userName}</span>
                  {log.applicationName && <span>• App: {log.applicationName}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
