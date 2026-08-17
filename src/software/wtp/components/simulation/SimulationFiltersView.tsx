import React, { useState } from 'react';
import { FilterUnitSimulationState, BackwashStateMachineStep } from '../../core/simulationStateEngine';
import { Layers, Wind, Droplets, RefreshCw, AlertTriangle, CheckCircle2, Play, Gauge, ShieldCheck, Calculator } from 'lucide-react';

interface SimulationFiltersViewProps {
  filters: FilterUnitSimulationState[];
  onTriggerBackwash: (filterId: string) => void;
  onResetFilter: (filterId: string) => void;
  onOpenFormulaInspector: (paramId: string) => void;
}

export const SimulationFiltersView: React.FC<SimulationFiltersViewProps> = ({
  filters,
  onTriggerBackwash,
  onResetFilter,
  onOpenFormulaInspector
}) => {
  const [selectedFilterId, setSelectedFilterId] = useState<string>(filters[0]?.id || 'FILTER-01');
  const selectedFilter = filters.find(f => f.id === selectedFilterId) || filters[0];

  const backwashStepDescriptions: Record<BackwashStateMachineStep, string> = {
    FILTER_IN_SERVICE: 'Standard downward filtration mode producing crystal clear potable water (<0.15 NTU).',
    ISOLATION: 'Influent and effluent penstocks isolated. Water drawn down to top of anthracite media layer.',
    AIR_SCOUR: 'High-pressure air injection (45 m³/m²/hr) breaking coagulated floc surface crust and loosening mudballs.',
    AIR_PLUS_WATER: 'Combined low-rate water wash + air scour fluidizing bed for uniform particle separation.',
    WATER_WASH: 'High-rate upward expansion (30 m³/m²/hr) lifting suspended solids to backwash waste launders.',
    FILTER_TO_WASTE: 'Downward flow diverted to drain (re-stratification of sand and anthracite media).',
    RIPENING: 'Maturation period building initial schmutzdecke filter mat until turbidity drops below 0.2 NTU.',
    RETURN_TO_SERVICE: 'Filter unit online, synchronized with master filtered water collection conduit.'
  };

  return (
    <div className="space-y-6">
      {/* 1. Filters Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Dual Media Rapid Gravity Filtration & Backwash Engine
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Anthracite/Sand dual media bed dynamics, continuous Kozeny-Carman headloss clogging, and 8-stage automated backwash sequencing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenFormulaInspector('FORM-FLTR-001')}
              className="px-3 py-1.5 bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-700/50 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>fx Filtration & Backwash Hydraulics</span>
            </button>
          </div>
        </div>

        {/* Filter Bed Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((filter) => {
            const isSelected = filter.id === selectedFilterId;
            const isBackwashing = filter.status === 'BACKWASHING';
            const isClogged = filter.headLossM >= filter.maxAllowableHeadLossM;

            return (
              <div
                key={filter.id}
                onClick={() => setSelectedFilterId(filter.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400/80 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">{filter.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isBackwashing
                        ? 'bg-amber-950/90 border border-amber-500 text-amber-300 animate-pulse'
                        : isClogged
                        ? 'bg-rose-950/90 border border-rose-500 text-rose-300 animate-bounce'
                        : 'bg-emerald-950/90 border border-emerald-600 text-emerald-300'
                    }`}
                  >
                    {filter.status}
                  </span>
                </div>

                <div className="space-y-2 mb-3 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Headloss (Δh):</span>
                    <span className={`font-bold ${filter.headLossM > 1.8 ? 'text-rose-400' : 'text-cyan-300'}`}>
                      {filter.headLossM.toFixed(2)} m / {filter.maxAllowableHeadLossM} m
                    </span>
                  </div>
                  {/* Headloss Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        filter.headLossM > 1.8 ? 'bg-rose-500' : filter.headLossM > 1.2 ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, (filter.headLossM / filter.maxAllowableHeadLossM) * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Turbidity Out:</span>
                    <span className="text-emerald-400 font-bold">{filter.effluentTurbidityNTU} NTU</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Run Time:</span>
                    <span className="text-slate-200">{filter.runTimeHours.toFixed(1)} hrs (rem. {filter.remainingRunTimeHours.toFixed(1)}h)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerBackwash(filter.id);
                    }}
                    disabled={isBackwashing}
                    className="flex-1 py-1 text-[10px] bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isBackwashing ? 'animate-spin' : ''}`} />
                    <span>{isBackwashing ? 'Backwash in Progress...' : 'Trigger Backwash'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onResetFilter(filter.id);
                    }}
                    className="px-2 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                    title="Reset to Clean Baseline"
                  >
                    Reset
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Detailed Dual Media Filter Bed Cross-Section & 8-Step Backwash Machine */}
      {selectedFilter && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Media Cross-Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{selectedFilter.name} — Dual Media Bed Cross-Section</span>
            </h4>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              {/* Supernatant Water */}
              <div className="bg-cyan-500/20 border border-cyan-400/40 rounded p-2 text-center text-xs text-cyan-300 relative overflow-hidden">
                <span className="font-semibold">Supernatant Water Depth (1.50 m)</span>
                {selectedFilter.status === 'BACKWASHING' && (
                  <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center text-amber-200 text-[10px] font-bold animate-pulse">
                    ▲ Upward Backwash Flushing Fluidization
                  </div>
                )}
              </div>

              {/* Anthracite Coal Media */}
              <div className="bg-stone-800 border border-stone-600 rounded p-2.5 text-center text-xs text-stone-200 shadow-inner">
                <div className="flex justify-between items-center text-[10px] text-stone-400 mb-0.5">
                  <span>Layer 1: Anthracite Coal (ES: 0.9–1.1 mm, UC &lt; 1.4)</span>
                  <span className="font-mono font-bold text-stone-300">450 mm Depth</span>
                </div>
                <div className="text-[11px] text-stone-300 font-sans">
                  Coarse high-porosity cap capturing bulk floc particles without rapid surface blinding.
                </div>
              </div>

              {/* Silica Sand Media */}
              <div className="bg-amber-900/40 border border-amber-700/50 rounded p-2.5 text-center text-xs text-amber-200 shadow-inner">
                <div className="flex justify-between items-center text-[10px] text-amber-400/90 mb-0.5">
                  <span>Layer 2: Silica Quartz Sand (ES: 0.45–0.55 mm, UC &lt; 1.5)</span>
                  <span className="font-mono font-bold text-amber-300">300 mm Depth</span>
                </div>
                <div className="text-[11px] text-amber-100 font-sans">
                  Fine polishing matrix filtering sub-micron flocs and residual particulate matter.
                </div>
              </div>

              {/* Graded Gravel Support */}
              <div className="bg-slate-800 border border-slate-700 rounded p-2 text-center text-[11px] text-slate-300">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Layer 3: Graded Gravel Support Matrix (2 mm to 40 mm)</span>
                  <span className="font-mono text-slate-300">300 mm Depth</span>
                </div>
              </div>

              {/* Underdrain Nozzle Lateral */}
              <div className="bg-slate-900 border border-cyan-800/40 rounded p-2 text-center text-[11px] text-cyan-400 flex items-center justify-between">
                <span>Underdrain Lateral Header with Polypropylene Strainer Nozzles</span>
                <span className="text-[10px] text-cyan-300 font-mono">0.25 mm Slot Width</span>
              </div>
            </div>
          </div>

          {/* 8-Step Backwash State Machine Engine */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-amber-400 ${selectedFilter.status === 'BACKWASHING' ? 'animate-spin' : ''}`} />
                <span>8-Step Backwash Sequence State Machine</span>
              </h4>
              <span className="text-[11px] text-amber-300 font-mono">
                {selectedFilter.backwashStep}
              </span>
            </div>

            <div className="space-y-2">
              {[
                { step: 'FILTER_IN_SERVICE', name: '1. Filter In Service', duration: 'Continuous' },
                { step: 'ISOLATION', name: '2. Isolation & Drawdown', duration: '60 sec' },
                { step: 'AIR_SCOUR', name: '3. Air Scour Agitation', duration: '180 sec' },
                { step: 'AIR_PLUS_WATER', name: '4. Combined Air + Water', duration: '120 sec' },
                { step: 'WATER_WASH', name: '5. High-Rate Water Wash', duration: '300 sec' },
                { step: 'FILTER_TO_WASTE', name: '6. Filter-to-Waste (Drain)', duration: '120 sec' },
                { step: 'RIPENING', name: '7. Filter Ripening Maturation', duration: '180 sec' },
                { step: 'RETURN_TO_SERVICE', name: '8. Return to Potable Service', duration: '30 sec' }
              ].map((item, idx) => {
                const isActive = selectedFilter.backwashStep === item.step;

                return (
                  <div
                    key={item.step}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-md font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-400 animate-ping' : 'bg-slate-600'}`} />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span>{item.duration}</span>
                      {isActive && <span className="text-amber-300">[{selectedFilter.stepElapsedSec}s elapsed]</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Current State Logic:</span>
              <p>{backwashStepDescriptions[selectedFilter.backwashStep]}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
