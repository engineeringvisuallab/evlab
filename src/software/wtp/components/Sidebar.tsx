import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Target, 
  Droplets, 
  Cpu, 
  GitFork, 
  Sliders,
  Pipette, 
  HardDrive, 
  Recycle, 
  Scale, 
  Zap, 
  Radio, 
  Compass, 
  Coins, 
  DraftingCompass, 
  CheckCheck, 
  ShieldCheck, 
  BookOpen, 
  FileCheck2,
  Calculator,
  Activity
} from 'lucide-react';

export type ViewTab = 
  | 'dashboard'
  | 'liveSimulation'
  | 'projects'
  | 'designBasis'
  | 'waterQuality'
  | 'processSelection'
  | 'processDesign'
  | 'formulaExplorer'
  | 'designAlternatives'
  | 'hydraulics'
  | 'chemical'
  | 'equipment'
  | 'sludge'
  | 'waterBalance'
  | 'electrical'
  | 'instrumentation'
  | 'structural'
  | 'boqCost'
  | 'drawings'
  | 'validation'
  | 'completeness'
  | 'standards'
  | 'reports'
  | 'phase12';

interface SidebarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  validationFailCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  validationFailCount = 0
}) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'liveSimulation', label: '⚡ Live Flow Simulation', icon: Activity },
    { id: 'projects', label: 'Project & Revisions', icon: FolderGit2 },
    { id: 'designBasis', label: 'Design Basis & Demand', icon: Target },
    { id: 'waterQuality', label: 'Raw Water Database', icon: Droplets },
    { id: 'processSelection', label: 'Process Recommendation', icon: Cpu },
    { id: 'processDesign', label: 'Unit Process Design', icon: GitFork },
    { id: 'formulaExplorer', label: 'Formula & Traceability', icon: Calculator },
    { id: 'designAlternatives', label: 'Design Alternatives (Phase 13)', icon: Sliders },
    { id: 'hydraulics', label: 'Hydraulics & Profile', icon: Compass },
    { id: 'chemical', label: 'Chemical Dosing', icon: Pipette },
    { id: 'equipment', label: 'Equipment Schedule', icon: HardDrive },
    { id: 'sludge', label: 'Sludge Management', icon: Recycle },
    { id: 'waterBalance', label: 'Water & Mass Balance', icon: Scale },
    { id: 'electrical', label: 'Electrical Design', icon: Zap },
    { id: 'instrumentation', label: 'Instrumentation & SCADA', icon: Radio },
    { id: 'structural', label: 'Structural Support', icon: Compass },
    { id: 'boqCost', label: 'BOQ & Cost Estimate', icon: Coins },
    { id: 'drawings', label: 'PFD, P&ID & Drawings', icon: DraftingCompass },
    { id: 'validation', label: 'Design Validation Matrix', icon: CheckCheck, badge: validationFailCount },
    { id: 'completeness', label: 'Completeness Audit', icon: ShieldCheck },
    { id: 'standards', label: 'Standards Library', icon: BookOpen },
    { id: 'reports', label: 'Engineering Reports', icon: FileCheck2 },
    { id: 'phase12', label: 'Phase 12 Engineering Suite', icon: ShieldCheck }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 select-none overflow-y-auto">
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center font-bold text-white shadow-md font-mono text-sm">
          EVL
        </div>
        <div>
          <h1 className="text-xs font-extrabold text-cyan-200 uppercase tracking-wider font-mono">WTP Engineering</h1>
          <p className="text-2xs text-slate-400">Engineering Visual Lab</p>
        </div>
      </div>

      <nav className="p-3 space-y-1">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ViewTab)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                isActive 
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-semibold shadow-inner' 
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-rose-500 text-white text-3xs font-bold font-mono px-1.5 py-0.5 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-slate-800/80 text-3xs text-slate-500 font-mono space-y-1">
        <div className="flex justify-between">
          <span>Platform:</span>
          <span className="text-slate-400">EVL Suite v4.2</span>
        </div>
        <div className="flex justify-between">
          <span>Engine:</span>
          <span className="text-cyan-400">Deterministic + AI</span>
        </div>
      </div>
    </aside>
  );
};
