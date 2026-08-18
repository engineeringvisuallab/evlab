import React from 'react';
import { LabViewMode } from '../../types/chemistry';
import { FlaskConical, Atom, Binary, Eye } from 'lucide-react';

interface ModeViewSelectorProps {
  currentMode: LabViewMode;
  onChangeMode: (mode: LabViewMode) => void;
  className?: string;
}

export const ModeViewSelector: React.FC<ModeViewSelectorProps> = ({
  currentMode,
  onChangeMode,
  className = ''
}) => {
  const modes: Array<{
    id: LabViewMode;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'lab',
      label: 'LAB VIEW',
      sublabel: 'Macroscopic Glassware & Color',
      icon: FlaskConical
    },
    {
      id: 'molecular',
      label: 'MOLECULAR VIEW',
      sublabel: 'Sub-Microscopic Particles & Bonds',
      icon: Atom
    },
    {
      id: 'math',
      label: 'MATH VIEW',
      sublabel: 'Governing Equations & Calculus',
      icon: Binary
    }
  ];

  return (
    <div
      className={`bg-[#0B1121] p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner ${className}`}
      id="mode-view-selector"
    >
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = currentMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChangeMode(m.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              isActive
                ? 'bg-teal-600 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
            id={`btn-view-mode-${m.id}`}
            title={m.sublabel}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-teal-400'}`} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
