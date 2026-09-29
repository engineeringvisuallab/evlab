/**
 * EV Software Core - Workspace Sidebar Navigation
 * Structured into Core Workspace, Data Exchange & Quality, and Infrastructure & SDK.
 */

import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Grid,
  ArrowLeftRight,
  Database,
  ShieldCheck,
  History,
  HardDrive,
  Code2,
  Workflow,
  CheckSquare,
  Settings,
  Flame,
  Globe2,
  Compass,
  Cloud,
} from 'lucide-react';
import { useCore } from '../../core/store/coreStore';

export type WorkspaceTab =
  | 'dashboard'
  | 'projects'
  | 'registry'
  | 'transfers'
  | 'datasets'
  | 'validation'
  | 'audit'
  | 'storage'
  | 'drive'
  | 'sdk'
  | 'proving_bench'
  | 'tests'
  | 'settings';

interface SidebarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  /** When provided, shows a "Space Universe" button that returns to the
   * planetary EV Software Space view this workspace was launched from. */
  onReturnToUniverse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, onReturnToUniverse }) => {
  const { applications, projects, transfers, datasets } = useCore();

  const pendingTransfersCount = transfers.filter(
    (t) => t.state === 'sent' || t.state === 'prepared' || t.state === 'imported'
  ).length;

  type NavItem = {
    id: WorkspaceTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badge?: number;
    badgeColor?: string;
    highlight?: boolean;
  };

  const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
    {
      title: 'Space Platform',
      items: [
        { id: 'dashboard' as const, label: 'Space Overview', icon: LayoutDashboard },
        { id: 'projects' as const, label: 'Project Workspaces', icon: FolderKanban, count: projects.length },
        { id: 'registry' as const, label: 'Software Registry & Apps', icon: Grid, count: applications.length },
      ],
    },
    {
      title: 'Data Exchange & Integrity',
      items: [
        {
          id: 'transfers' as const,
          label: 'Data Transfers',
          icon: ArrowLeftRight,
          badge: pendingTransfersCount > 0 ? pendingTransfersCount : undefined,
          badgeColor: 'bg-cyan-600',
        },
        { id: 'datasets' as const, label: 'Datasets & Revisions', icon: Database, count: datasets.length },
        { id: 'validation' as const, label: 'Validation Center', icon: ShieldCheck },
        { id: 'audit' as const, label: 'Audit Trail', icon: History },
      ],
    },
    {
      title: 'Workspaces & Dev Tools',
      items: [
        {
          id: 'proving_bench' as const,
          label: 'GIS ↔ CAD Proving Bench',
          icon: Workflow,
          highlight: true,
        },
        { id: 'sdk' as const, label: 'EVSoftware SDK & API', icon: Code2 },
        { id: 'storage' as const, label: 'Storage Abstraction', icon: HardDrive },
        { id: 'drive' as const, label: 'Google Drive Sync', icon: Cloud, highlight: true },
        { id: 'tests' as const, label: 'Compliance Test Suite', icon: CheckSquare },
        { id: 'settings' as const, label: 'Space Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between py-3 select-none shrink-0 overflow-y-auto">
      <div className="space-y-5 px-2">
        {onReturnToUniverse && (
          <button
            onClick={onReturnToUniverse}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/30 border border-cyan-500/30 hover:bg-cyan-600/30 hover:text-white transition-all"
            title="Return to the EV Software Space Universe"
          >
            <Compass className="w-4 h-4 shrink-0 text-cyan-400" />
            <span className="truncate">Space Universe</span>
          </button>
        )}
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : item.highlight
                      ? 'text-cyan-400 hover:bg-slate-900 border border-cyan-500/20 bg-cyan-950/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${item.badgeColor || 'bg-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && !item.badge && (
                    <span className="text-[10px] font-mono text-slate-400">{item.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sibling Application Independence Reminder */}
      <div className="p-3 mx-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>EVSoftware Space Hub</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Unified space where all engineering tools, sibling software apps, and data exchange operate with shared project contexts.
        </p>
      </div>
    </aside>
  );
};
