import React, { useState } from 'react';
import { ELEMENTS } from '../../data/elements';
import { ElementData, AcademicLevel } from '../../types/chemistry';
import { Grid, Eye, Sparkles, Filter, Info, X, Zap, ArrowDown, ArrowRight } from 'lucide-react';
import { WhyButton } from '../common/WhyButton';

interface PeriodicTableLabProps {
  academicLevel: AcademicLevel;
}

type TrendMode =
  | 'category'
  | 'electronegativity'
  | 'atomicRadius'
  | 'ionizationEnergy'
  | 'meltingPoint'
  | 'density'
  | 'block';

const CATEGORY_COLORS: Record<string, string> = {
  'alkali-metal': '#ef4444',
  'alkaline-earth': '#f97316',
  'transition-metal': '#eab308',
  'post-transition': '#10b981',
  'metalloid': '#06b6d4',
  'nonmetal': '#3b82f6',
  'halogen': '#8b5cf6',
  'noble-gas': '#ec4899',
  'lanthanide': '#6366f1',
  'actinide': '#14b8a6'
};

export const PeriodicTableLab: React.FC<PeriodicTableLabProps> = ({ academicLevel }) => {
  const [selectedElement, setSelectedElement] = useState<ElementData>(ELEMENTS[0]);
  const [trendMode, setTrendMode] = useState<TrendMode>('category');
  const [modalOpen, setModalOpen] = useState(false);

  // Compute min/max for heatmap normalization
  const getTrendColor = (el: ElementData): string => {
    if (trendMode === 'category') {
      return CATEGORY_COLORS[el.category] || '#64748b';
    }

    if (trendMode === 'block') {
      const blockColors = { s: '#ef4444', p: '#3b82f6', d: '#eab308', f: '#10b981' };
      return blockColors[el.block] || '#64748b';
    }

    let val: number | null = null;
    let min = 0;
    let max = 1;

    if (trendMode === 'electronegativity') {
      val = el.electronegativity;
      min = 0.7; // Cs / Fr
      max = 4.0; // F
    } else if (trendMode === 'atomicRadius') {
      val = el.atomicRadius;
      min = 30;
      max = 260;
    } else if (trendMode === 'ionizationEnergy') {
      val = el.ionizationEnergy;
      min = 380;
      max = 2400;
    } else if (trendMode === 'meltingPoint') {
      val = el.meltingPoint;
      min = 0;
      max = 4000;
    } else if (trendMode === 'density') {
      val = el.density;
      min = 0;
      max = 23;
    }

    if (val === null || val === undefined) return '#334155';

    const ratio = Math.max(0, Math.min(1, (val - min) / (max - min)));
    // Heatmap interpolator: Slate-cyan-yellow-red
    if (ratio < 0.33) {
      return `rgb(30, ${Math.floor(100 + ratio * 300)}, 200)`;
    } else if (ratio < 0.66) {
      return `rgb(${Math.floor((ratio - 0.33) * 600)}, 200, ${Math.floor(200 - (ratio - 0.33) * 500)})`;
    } else {
      return `rgb(240, ${Math.floor(200 - (ratio - 0.66) * 500)}, 50)`;
    }
  };

  // Build 18 x 7 periodic grid mapping
  const gridPositions: Record<number, { row: number; col: number }> = {};
  ELEMENTS.forEach((el) => {
    gridPositions[el.number] = { row: el.period, col: el.group };
  });

  return (
    <div className="space-y-6" id="periodic-table-lab">
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Grid className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Interactive Periodic Table & Trends</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore 118 elements and visualize atomic properties, electronic configurations, and periodic trends.
          </p>
        </div>

        {/* Heatmap Trend Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" /> Mode:
          </span>
          {[
            { id: 'category', label: 'Categories' },
            { id: 'electronegativity', label: 'Electronegativity (χ)' },
            { id: 'atomicRadius', label: 'Atomic Radius (pm)' },
            { id: 'ionizationEnergy', label: 'Ionization Energy (kJ)' },
            { id: 'meltingPoint', label: 'Melting Pt (K)' },
            { id: 'block', label: 's, p, d, f Blocks' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setTrendMode(mode.id as TrendMode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                trendMode === mode.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Periodic Table & Inspector Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Periodic Table Grid (8.5 Cols) */}
        <div className="xl:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md overflow-x-auto">
          {/* Periodic Trends Directional Explanations */}
          <div className="flex items-center justify-between mb-3 px-2 text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-1">
              <span>Across Period:</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-200">Electronegativity ↑, Ionization ↑, Radius ↓</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Down Group:</span>
              <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-200">Atomic Radius ↑, Metallic Character ↑</span>
            </div>
          </div>

          {/* 18-Column CSS Grid Container */}
          <div className="grid grid-cols-18 gap-1.5 min-w-[700px]">
            {ELEMENTS.map((el) => {
              const isSelected = selectedElement.number === el.number;
              const color = getTrendColor(el);

              return (
                <div
                  key={el.number}
                  onClick={() => {
                    setSelectedElement(el);
                    setModalOpen(true);
                  }}
                  style={{
                    gridRow: el.period,
                    gridColumn: el.group,
                    borderColor: isSelected ? '#38bdf8' : 'transparent'
                  }}
                  className={`relative p-1.5 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-110 hover:z-20 shadow-sm ${
                    isSelected ? 'ring-2 ring-cyan-400' : ''
                  }`}
                >
                  <div
                    className="absolute inset-0 rounded-lg opacity-25"
                    style={{ backgroundColor: color }}
                  />
                  <div className="relative text-[9px] font-mono text-slate-400 leading-none">
                    {el.number}
                  </div>
                  <div className="relative font-bold text-sm text-white">{el.symbol}</div>
                  <div className="relative text-[8px] text-slate-300 truncate w-full text-center leading-none font-mono">
                    {trendMode === 'electronegativity' && el.electronegativity !== null
                      ? el.electronegativity.toFixed(1)
                      : trendMode === 'atomicRadius' && el.atomicRadius !== null
                      ? el.atomicRadius
                      : trendMode === 'ionizationEnergy' && el.ionizationEnergy !== null
                      ? el.ionizationEnergy
                      : el.name.slice(0, 4)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3 text-[11px]">
            <span className="text-slate-500 font-medium">Categories:</span>
            {Object.entries(CATEGORY_COLORS).map(([cat, col]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col }} />
                <span className="text-slate-300 capitalize">{cat.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Element Inspector (4 Cols) */}
        <div className="xl:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-semibold">
                  Element #{selectedElement.number} • Group {selectedElement.group}, Period {selectedElement.period}
                </span>
                <h3 className="text-2xl font-bold text-white mt-0.5">{selectedElement.name}</h3>
              </div>
              <WhyButton
                experimentName="Periodic Trends"
                observation={`Selected ${selectedElement.name} (${selectedElement.symbol}), χ=${selectedElement.electronegativity}, Radius=${selectedElement.atomicRadius}pm`}
                stateContext={{ element: selectedElement, trendMode }}
              />
            </div>

            {/* Element Big Badge */}
            <div className="my-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-4xl font-extrabold text-white">{selectedElement.symbol}</div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Mass: <strong className="text-slate-200">{selectedElement.atomicMass} u</strong>
                </div>
              </div>
              <div className="text-right">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold text-white capitalize shadow-sm inline-block"
                  style={{ backgroundColor: CATEGORY_COLORS[selectedElement.category] || '#06b6d4' }}
                >
                  {selectedElement.category.replace('-', ' ')}
                </span>
                <div className="text-[11px] text-slate-400 font-mono mt-1.5">
                  Block: <strong className="text-cyan-400 uppercase">{selectedElement.block}-block</strong>
                </div>
              </div>
            </div>

            {/* Core Thermodynamic & Atomic Properties */}
            <div className="space-y-2 text-xs divide-y divide-slate-800">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Electron Configuration:</span>
                <strong className="text-cyan-300 font-mono">{selectedElement.electronConfiguration}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Electronegativity (Pauling):</span>
                <strong className="text-white font-mono">{selectedElement.electronegativity ?? 'N/A'}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Atomic Radius:</span>
                <strong className="text-white font-mono">{selectedElement.atomicRadius ? `${selectedElement.atomicRadius} pm` : 'N/A'}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">1st Ionization Energy:</span>
                <strong className="text-white font-mono">{selectedElement.ionizationEnergy ? `${selectedElement.ionizationEnergy} kJ/mol` : 'N/A'}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Melting / Boiling:</span>
                <strong className="text-slate-200 font-mono">
                  {selectedElement.meltingPoint ?? '—'} K / {selectedElement.boilingPoint ?? '—'} K
                </strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Discovered By:</span>
                <strong className="text-slate-200">{selectedElement.discoveredBy}</strong>
              </div>
            </div>
          </div>

          {/* Key Applications */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <strong className="text-cyan-400 block mb-1">Applications in Science & Industry:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
              {selectedElement.uses.map((u, idx) => (
                <li key={idx}>{u}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
