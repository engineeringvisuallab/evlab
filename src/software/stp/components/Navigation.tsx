/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Workspace Navigation Bar
 * @license Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Droplets,
  Network,
  Database,
  Layers,
  Calculator,
  ShieldCheck,
  Filter,
  Waves,
} from 'lucide-react';

export type TabKey =
  | 'DASHBOARD'
  | 'DESIGN_BASIS'
  | 'SEWER_NETWORK'
  | 'WASTEWATER_QUALITY'
  | 'PRELIMINARY_TREATMENT'
  | 'PRIMARY_TREATMENT'
  | 'PARAMETER_REGISTRY'
  | 'SCENARIOS_ALTERNATIVES'
  | 'CALCULATIONS'
  | 'VALIDATION_AUDIT';

interface NavigationProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  unresolvedCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  unresolvedCount,
}) => {
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'DASHBOARD', label: 'Project Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'DESIGN_BASIS', label: 'Design Basis & Flows', icon: <Users className="w-4 h-4" /> },
    { key: 'SEWER_NETWORK', label: 'Sewerage & Pumping', icon: <Network className="w-4 h-4" /> },
    { key: 'WASTEWATER_QUALITY', label: 'Wastewater Quality', icon: <Droplets className="w-4 h-4" /> },
    { key: 'PRELIMINARY_TREATMENT', label: 'Preliminary Treatment', icon: <Filter className="w-4 h-4" /> },
    { key: 'PRIMARY_TREATMENT', label: 'Primary Clarification', icon: <Waves className="w-4 h-4" /> },
    { key: 'PARAMETER_REGISTRY', label: 'Parameter Registry', icon: <Database className="w-4 h-4" /> },
    { key: 'SCENARIOS_ALTERNATIVES', label: 'Scenarios & Alternatives', icon: <Layers className="w-4 h-4" /> },
    { key: 'CALCULATIONS', label: 'Calculation Inspector', icon: <Calculator className="w-4 h-4" /> },
    { key: 'VALIDATION_AUDIT', label: 'Validation & Audit', icon: <ShieldCheck className="w-4 h-4" />, badge: unresolvedCount },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex space-x-1 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onSelectTab(tab.key)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
