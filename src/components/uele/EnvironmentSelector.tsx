import React from 'react';

import {
  Globe,
  Building2,
  Home,
  Sprout,
  Droplet,
  Zap,
  Truck,
  Factory,
  Trees,
  CheckCircle2,
  Compass,
} from 'lucide-react';

export type UELEZoneFilter =
  | 'all'
  | 'smart-city'
  | 'engineering-village'
  | 'agriculture'
  | 'water-system'
  | 'energy-system'
  | 'transportation'
  | 'industrial'
  | 'environmental';

export interface RegionNavInfo {
  id: UELEZoneFilter;
  name: string;
  tagline: string;
  icon: React.ReactNode;
  count: number;
  active: boolean;
  color: string;
}

interface EnvironmentSelectorProps {
  currentEnv: UELEZoneFilter;
  onSelectEnv: (env: UELEZoneFilter) => void;
  envCounts: Record<string, number>;
  totalObjectsCount: number;
}

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  currentEnv,
  onSelectEnv,
  envCounts,
  totalObjectsCount,
}) => {
  const regions: RegionNavInfo[] = [
    {
      id: 'all',
      name: 'Entire Smart Country',
      tagline: 'Level 0 Overview — Full Interconnected Miniature Country',
      icon: <Globe className="w-4 h-4 text-emerald-400" />,
      count: totalObjectsCount,
      active: true,
      color: 'emerald',
    },
    {
      id: 'smart-city',
      name: 'Smart City Core',
      tagline: 'Buildings, Civic Hubs, Traffic & Utility Networks',
      icon: <Building2 className="w-4 h-4 text-cyan-400" />,
      count: (envCounts['smart-city'] || 0) + (envCounts['infrastructure'] || 0),
      active: true,
      color: 'cyan',
    },
    {
      id: 'engineering-village',
      name: 'Engineering Village',
      tagline: 'Bazar, Rural Water, Tube Wells, School & Clinic',
      icon: <Home className="w-4 h-4 text-amber-400" />,
      count: envCounts['engineering-village'] || 0,
      active: true,
      color: 'amber',
    },
    {
      id: 'agriculture',
      name: 'Agriculture & Rural',
      tagline: 'Irrigation Canals, Crop Fields, Pumps & Cold Storage',
      icon: <Sprout className="w-4 h-4 text-emerald-400" />,
      count: envCounts['agriculture'] || 0,
      active: true,
      color: 'emerald',
    },
    {
      id: 'water-system',
      name: 'Water Systems',
      tagline: 'River Intakes, WTP, Clarifiers & Storage Towers',
      icon: <Droplet className="w-4 h-4 text-blue-400" />,
      count: envCounts['water-system'] || envCounts['water-world'] || 0,
      active: true,
      color: 'blue',
    },
    {
      id: 'energy-system',
      name: 'Energy & Power Grid',
      tagline: 'Solar/Wind Farm, Substations & GIS Transformers',
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      count: envCounts['energy-system'] || 0,
      active: true,
      color: 'yellow',
    },
    {
      id: 'transportation',
      name: 'Transportation',
      tagline: 'Cable-Stayed Bridge, Highways & Transport Tunnels',
      icon: <Truck className="w-4 h-4 text-purple-400" />,
      count: envCounts['transportation'] || 0,
      active: true,
      color: 'purple',
    },
    {
      id: 'industrial',
      name: 'Industrial Zone',
      tagline: 'Refineries, Process Plants & Utilities',
      icon: <Factory className="w-4 h-4 text-slate-400" />,
      count: envCounts['industrial'] || envCounts['industrial-world'] || 0,
      active: true,
      color: 'slate',
    },
    {
      id: 'environmental',
      name: 'Environmental & Nature',
      tagline: 'River Basin, Reservoir Dam, Wetlands & Forest',
      icon: <Trees className="w-4 h-4 text-teal-400" />,
      count: envCounts['environmental'] || envCounts['natural-world'] || 0,
      active: true,
      color: 'teal',
    },
  ];

  return (
    <div className="w-full bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-color)] rounded-2xl p-2.5 sm:p-3.5 shadow-2xl space-y-2.5">
      {/* Header Banner */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-color)]/60 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--text-primary)] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>ENTIRE SMART COUNTRY — Continuous 3D Engineering Ecosystem</span>
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              Explore a complete interconnected engineering world — from smart cities to engineering villages, agriculture, infrastructure, energy, water, industry and natural systems.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)]">
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            {totalObjectsCount} Interconnected 3D Facilities
          </span>
        </div>
      </div>

      {/* Navigation Buttons for Region Focus */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-1.5">
        {regions.map((region) => {
          const isSelected = currentEnv === region.id;
          return (
            <button
              key={region.id}
              onClick={() => onSelectEnv(region.id)}
              className={`group relative flex flex-col p-2 rounded-xl text-left transition-all duration-200 border ${
                isSelected
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.3)] text-[var(--text-primary)] ring-1 ring-emerald-500/50'
                  : 'bg-[var(--bg-elevated)]/60 border-[var(--border-color)] hover:border-emerald-500/50 hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]/60 shrink-0">
                  {region.icon}
                </div>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  {region.count}
                </span>
              </div>

              <span className={`text-[11px] font-bold leading-tight line-clamp-1 ${isSelected ? 'text-emerald-300' : 'text-[var(--text-primary)]'}`}>
                {region.name}
              </span>
              <span className="text-[9px] text-[var(--text-muted)] line-clamp-1 mt-0.5 leading-none">
                {region.tagline.split('—')[0]}
              </span>

              {isSelected && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};


