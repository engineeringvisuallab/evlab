/**
 * EVLab BOQ - Desktop Sidebar Navigation
 */

import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AppView } from '../../types';
import {
  LayoutDashboard,
  FolderKanban,
  Grid,
  Calculator,
  Percent,
  Receipt,
  FileSpreadsheet,
  BookOpenCheck,
  FileText,
  GitPullRequest,
  TrendingUp,
  Boxes,
  Users,
  HardHat,
  Database,
  Printer,
  Library,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isSidebarCollapsed,
    toggleSidebar,
    boqItems,
    variations,
    runningBills,
    validationIssues,
  } = useAppStore();

  const totalBoqCount = boqItems.filter((i) => !i.isHeader).length;
  const pendingVariationsCount = variations.filter((v) => v.approvalStatus === 'Pending').length;
  const draftBillsCount = runningBills.filter((b) => b.status === 'Draft').length;

  const navGroups: NavGroup[] = [
    {
      title: 'PROJECT & BOQ',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
        { id: 'boq', label: 'BOQ Builder', icon: Grid, badge: totalBoqCount },
      ],
    },
    {
      title: 'QUANTITY & COST',
      items: [
        { id: 'takeoff', label: 'Quantity Takeoff', icon: Calculator },
        { id: 'rate-analysis', label: 'Rate Analysis', icon: Percent },
        { id: 'estimate', label: 'Cost Estimate', icon: Receipt },
        { id: 'abstract', label: 'Abstract Estimate', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'MEASUREMENT & BILLING',
      items: [
        { id: 'measurement', label: 'Measurement Book', icon: BookOpenCheck },
        { id: 'billing', label: 'Running Bills', icon: FileText, badge: draftBillsCount > 0 ? draftBillsCount : undefined },
        { id: 'variations', label: 'Variations', icon: GitPullRequest, badge: pendingVariationsCount > 0 ? pendingVariationsCount : undefined },
        { id: 'cost-control', label: 'Cost Control', icon: TrendingUp },
      ],
    },
    {
      title: 'RESOURCES & RATES',
      items: [
        { id: 'materials', label: 'Materials', icon: Boxes },
        { id: 'labour', label: 'Labour Rate', icon: Users },
        { id: 'equipment', label: 'Equipment', icon: HardHat },
        { id: 'rate-database', label: 'Rate Database', icon: Database },
      ],
    },
    {
      title: 'REPORTS & SETTINGS',
      items: [
        { id: 'reports', label: 'Print Reports', icon: Printer },
        { id: 'libraries', label: 'Resource Libraries', icon: Library },
        { id: 'settings', label: 'Project Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-200 select-none z-20 shrink-0 ${
        isSidebarCollapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 font-sans text-xs">
        {navGroups.map((group) => (
          <div key={group.title} className="px-2">
            {!isSidebarCollapsed && (
              <p className="px-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
                {group.title}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.map((item: NavItem) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors font-medium ${
                      isActive
                        ? 'bg-cyan-950/80 text-cyan-300 font-semibold border-l-2 border-cyan-400'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      {!isSidebarCollapsed && <span className="truncate text-xs">{item.label}</span>}
                    </div>

                    {!isSidebarCollapsed && item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Collapse Toggle Bar */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
        {!isSidebarCollapsed && (
          <span className="text-[10px] text-slate-500 font-mono px-2">EVLab Architecture Engine</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors mx-auto"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
