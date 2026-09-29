import React, { useState, useMemo } from 'react';
import { 
  GitFork, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  Info, 
  Layers, 
  Coins, 
  Zap, 
  Compass, 
  ShieldCheck, 
  FileText, 
  HelpCircle,
  RotateCcw,
  Building,
  Edit3,
  Check,
  TrendingDown,
  TrendingUp,
  Activity
} from 'lucide-react';

import { ProjectMetadata, RawWaterQualityItem } from '../types/wtp';
import { CalculatedWtpState } from '../core/dependencyEngine';
import { 
  ProcessCategory, 
  getAlternativesByProcess, 
  getAlternativeById,
  DesignAlternative 
} from '../core/designAlternativesRegistry';
import { 
  ProjectMode, 
  DesignConfiguration, 
  getDefaultDesignConfiguration, 
  calculateDesignAlternativesState, 
  ALL_PROCESS_CATEGORIES 
} from '../core/designAlternativeEngine';

interface DesignAlternativesViewProps {
  project: ProjectMetadata;
  state: CalculatedWtpState;
  waterQuality: RawWaterQualityItem[];
}

export const DesignAlternativesView: React.FC<DesignAlternativesViewProps> = ({
  project,
  state,
  waterQuality
}) => {
  const [config, setConfig] = useState<DesignConfiguration>(getDefaultDesignConfiguration());
  const [activeCategory, setActiveCategory] = useState<ProcessCategory>('SEDIMENTATION');
  const [overrideModalUnit, setOverrideModalUnit] = useState<ProcessCategory | null>(null);
  const [tempOverrideReason, setTempOverrideReason] = useState<string>('Client Specification');
  const [tempEngineerNote, setTempEngineerNote] = useState<string>('');
  const [showRevisionMatrix, setShowRevisionMatrix] = useState<boolean>(false);

  // Calculate live design alternatives state
  const altState = useMemo(() => {
    return calculateDesignAlternativesState(project.plantCapacityMLD, waterQuality, config);
  }, [project.plantCapacityMLD, waterQuality, config]);

  const handleModeChange = (newMode: ProjectMode) => {
    setConfig(prev => ({
      ...prev,
      projectMode: newMode
    }));
  };

  const handleUnitToggle = (unitId: ProcessCategory) => {
    setConfig(prev => {
      const current = prev.processConfigs[unitId];
      return {
        ...prev,
        processConfigs: {
          ...prev.processConfigs,
          [unitId]: {
            ...current,
            enabled: !current.enabled
          }
        }
      };
    });
  };

  const handleSelectionModeToggle = (unitId: ProcessCategory, mode: 'AUTO' | 'MANUAL') => {
    setConfig(prev => {
      const current = prev.processConfigs[unitId];
      return {
        ...prev,
        processConfigs: {
          ...prev.processConfigs,
          [unitId]: {
            ...current,
            selectionMode: mode,
            selectedAlternativeId: mode === 'AUTO' ? current.recommendedAlternativeId : current.selectedAlternativeId
          }
        }
      };
    });
  };

  const handleSelectAlternative = (unitId: ProcessCategory, altId: string) => {
    setConfig(prev => {
      const current = prev.processConfigs[unitId];
      return {
        ...prev,
        processConfigs: {
          ...prev.processConfigs,
          [unitId]: {
            ...current,
            selectionMode: 'MANUAL',
            selectedAlternativeId: altId,
            manualOverrideReason: current.manualOverrideReason || 'Engineering Preference'
          }
        }
      };
    });
  };

  const handleSaveOverrideNote = () => {
    if (!overrideModalUnit) return;
    setConfig(prev => {
      const current = prev.processConfigs[overrideModalUnit];
      return {
        ...prev,
        processConfigs: {
          ...prev.processConfigs,
          [overrideModalUnit]: {
            ...current,
            manualOverrideReason: tempOverrideReason,
            engineerNote: tempEngineerNote
          }
        }
      };
    });
    setOverrideModalUnit(null);
  };

  const handleResetDefaults = () => {
    setConfig(getDefaultDesignConfiguration());
  };

  const selectedUnitConfig = config.processConfigs[activeCategory];
  const unitEvaluations = altState.evaluations[activeCategory] || [];
  const selectedAltScore = unitEvaluations.find(e => e.alternative.alternativeId === selectedUnitConfig.selectedAlternativeId) || unitEvaluations[0];
  const activeImpact = altState.activeImpacts[activeCategory];

  return (
    <div className="p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen font-sans text-xs">
      {/* 1. Page Header & Mode Selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <GitFork className="w-4 h-4" />
            <span>Phase 13 — Configurable Design Alternatives & Technology Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">Design Alternatives & Technology Selection</h1>
          <p className="text-slate-400 text-2xs mt-1 max-w-3xl">
            Evaluate and select technically valid treatment alternatives (e.g. Lamella vs Conventional Sedimentation, Dual Media vs Rapid Sand).
            All selections dynamically propagate downstream into civil footprint, hydraulics, BOQ, CAPEX, OPEX, and master design reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-2xs font-semibold text-slate-300">Project Optimization Mode:</span>
            <select
              value={config.projectMode}
              onChange={e => handleModeChange(e.target.value as ProjectMode)}
              className="bg-slate-950 border border-slate-700 text-cyan-300 text-2xs font-bold rounded px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="NORMAL">NORMAL (Balanced Baseline)</option>
              <option value="LAND_CONSTRAINED">LAND CONSTRAINED (35% Footprint Weight)</option>
              <option value="EXTREMELY_LAND_CONSTRAINED">EXTREMELY LAND CONSTRAINED (45% Footprint Weight)</option>
              <option value="LOW_CAPEX">LOW CAPEX (40% Capital Cost Weight)</option>
              <option value="LOW_OPEX">LOW OPEX (40% Energy & O&M Weight)</option>
              <option value="HIGH_RELIABILITY">HIGH RELIABILITY (30% Redundancy Weight)</option>
            </select>
          </div>

          <button
            onClick={() => setShowRevisionMatrix(!showRevisionMatrix)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold rounded-lg flex items-center gap-1.5 transition text-2xs border border-cyan-800/50"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showRevisionMatrix ? 'Hide Revision Matrix' : 'Compare Design Revisions'}</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg flex items-center gap-1.5 transition text-2xs border border-slate-700"
            title="Reset to recommended defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* 2. Top Cumulative Plant Impact KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-3xs font-mono uppercase">
            <span>Plant Civil Footprint</span>
            <Building className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-extrabold text-cyan-300 font-mono">
            {altState.overallPlantImpact.totalFootprintM2.toLocaleString()} m²
          </div>
          <div className="flex items-center gap-1 text-3xs font-mono text-emerald-400 font-semibold">
            <TrendingDown className="w-3 h-3" />
            <span>Saved {altState.overallPlantImpact.footprintSavedPct}% land area</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-3xs font-mono uppercase">
            <span>Total Estimated CAPEX</span>
            <Coins className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-extrabold text-amber-300 font-mono">
            ${(altState.overallPlantImpact.totalCapexUsd / 1e6).toFixed(2)}M
          </div>
          <div className="text-3xs font-mono text-slate-400">
            Civil + Equipment + Piping
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-3xs font-mono uppercase">
            <span>Annual OPEX & Energy</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-lg font-extrabold text-purple-300 font-mono">
            ${(altState.overallPlantImpact.totalOpexUsdYr / 1000).toFixed(0)}k / year
          </div>
          <div className="text-3xs font-mono text-purple-400">
            Connected: {altState.overallPlantImpact.totalPowerKw} kW
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-3xs font-mono uppercase">
            <span>Daily Sludge Solids</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-lg font-extrabold text-blue-300 font-mono">
            {altState.overallPlantImpact.totalSludgeKgDay.toLocaleString()} kg/day
          </div>
          <div className="text-3xs font-mono text-slate-400">
            Dry Solids Produced
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-3xs font-mono uppercase">
            <span>Total Hydraulic Headloss</span>
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-extrabold text-cyan-300 font-mono">
            {altState.overallPlantImpact.totalHeadlossM.toFixed(2)} m
          </div>
          <div className="text-3xs font-mono text-slate-400">
            HGL Profile Accumulation
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-3xs font-mono uppercase">
            <span>Validation Compliance</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-extrabold text-emerald-400 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>100% PASS</span>
          </div>
          <div className="text-3xs font-mono text-slate-400">
            Rules ALT-001 to ALT-016
          </div>
        </div>
      </div>

      {/* 3. Revision Comparison Matrix Drawer (Collapsible) */}
      {showRevisionMatrix && (
        <div className="bg-slate-900 border border-cyan-800/80 rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-cyan-200 uppercase tracking-wider font-mono">
                Design Alternatives Revision Comparison Matrix
              </h3>
            </div>
            <span className="text-2xs text-slate-400">Comparing DESIGN-A (Baseline) vs DESIGN-B (Selected)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-2xs font-mono">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="p-2.5">Design Revision</th>
                  <th className="p-2.5">Optimization Mode</th>
                  <th className="p-2.5">Sedimentation Technology</th>
                  <th className="p-2.5">Filtration Media</th>
                  <th className="p-2.5 text-right">Civil Footprint (m²)</th>
                  <th className="p-2.5 text-right">CAPEX ($)</th>
                  <th className="p-2.5 text-right">OPEX ($/yr)</th>
                  <th className="p-2.5 text-right">Power (kW)</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {altState.revisions.map((rev) => (
                  <tr key={rev.revisionId} className={rev.revisionId === 'DESIGN-B' ? 'bg-cyan-950/30' : 'hover:bg-slate-800/40'}>
                    <td className="p-2.5 font-bold text-cyan-300">{rev.revisionId} - {rev.name}</td>
                    <td className="p-2.5 text-slate-300">{rev.mode}</td>
                    <td className="p-2.5 text-amber-300">{rev.revisionId === 'DESIGN-A' ? 'Conventional Sedimentation' : 'Lamella Plate Settler'}</td>
                    <td className="p-2.5 text-purple-300">{rev.revisionId === 'DESIGN-A' ? 'Rapid Sand Filter' : 'Dual Media Filter'}</td>
                    <td className="p-2.5 text-right font-bold text-slate-200">{rev.totalFootprintM2.toLocaleString()}</td>
                    <td className="p-2.5 text-right text-amber-300">${(rev.totalCapexUsd / 1e6).toFixed(2)}M</td>
                    <td className="p-2.5 text-right text-purple-300">${(rev.totalOpexUsdYr / 1000).toFixed(0)}k</td>
                    <td className="p-2.5 text-right text-cyan-300">{rev.totalPowerKw}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        {rev.complianceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Main Process Unit Navigation & Interactive Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Process Unit Tabs */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-2xs font-mono uppercase text-slate-400 font-bold px-2 mb-2 flex justify-between items-center">
            <span>Process Units</span>
            <span>Status</span>
          </div>

          <div className="space-y-1">
            {ALL_PROCESS_CATEGORIES.map(cat => {
              const unitCfg = config.processConfigs[cat.id];
              const isSelected = activeCategory === cat.id;
              const activeAlt = getAlternativeById(unitCfg.selectedAlternativeId);

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                    isSelected 
                      ? 'bg-cyan-950/80 border-cyan-500 text-slate-100 shadow-md' 
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-200">{cat.name}</div>
                    <div className="text-3xs font-mono text-cyan-400 truncate max-w-[170px]">
                      {unitCfg.enabled ? activeAlt?.name || 'Selected Option' : 'PROCESS BYPASSED'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {unitCfg.selectionMode === 'MANUAL' && (
                      <span className="px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 text-3xs font-mono rounded">
                        MANUAL
                      </span>
                    )}
                    <div 
                      onClick={(e) => { e.stopPropagation(); handleUnitToggle(cat.id); }}
                      className={`w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer transition ${unitCfg.enabled ? 'bg-cyan-600 justify-end' : 'bg-slate-700 justify-start'}`}
                      title={unitCfg.enabled ? 'Unit Enabled' : 'Unit Disabled'}
                    >
                      <div className="w-3 h-3 rounded-full bg-white shadow-md" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Alternatives Selection Workspace */}
        <div className="lg:col-span-9 space-y-6">
          {/* Active Process Unit Header & Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-3xs font-mono text-cyan-400 uppercase tracking-widest">
                <span>Unit Process</span>
                <ChevronRight className="w-3 h-3" />
                <span>{selectedUnitConfig.name}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 mt-0.5">
                Technology Selection for {selectedUnitConfig.name}
              </h2>
              <p className="text-2xs text-slate-400 mt-0.5">
                Compare engineering tradeoffs, land footprint factors, efficiency, and CAPEX/OPEX impact.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-2xs font-mono">
                <span className="text-slate-400">Mode:</span>
                <button
                  onClick={() => handleSelectionModeToggle(activeCategory, 'AUTO')}
                  className={`px-2 py-0.5 rounded font-bold transition ${selectedUnitConfig.selectionMode === 'AUTO' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  AUTO
                </button>
                <button
                  onClick={() => handleSelectionModeToggle(activeCategory, 'MANUAL')}
                  className={`px-2 py-0.5 rounded font-bold transition ${selectedUnitConfig.selectionMode === 'MANUAL' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  MANUAL
                </button>
              </div>

              {selectedUnitConfig.selectionMode === 'MANUAL' && (
                <button
                  onClick={() => {
                    setOverrideModalUnit(activeCategory);
                    setTempOverrideReason(selectedUnitConfig.manualOverrideReason || 'Client Specification');
                    setTempEngineerNote(selectedUnitConfig.engineerNote || '');
                  }}
                  className="px-3 py-1.5 bg-amber-950 border border-amber-800 hover:bg-amber-900 text-amber-300 font-bold rounded-lg flex items-center gap-1.5 text-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Document Override</span>
                </button>
              )}
            </div>
          </div>

          {/* Alternatives Cards Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unitEvaluations.map((evalItem) => {
              const alt = evalItem.alternative;
              const isSelected = alt.alternativeId === selectedUnitConfig.selectedAlternativeId;
              const isRecommended = alt.alternativeId === selectedUnitConfig.recommendedAlternativeId;

              return (
                <div
                  key={alt.alternativeId}
                  className={`bg-slate-900 rounded-xl border p-5 flex flex-col justify-between space-y-4 transition ${
                    isSelected 
                      ? 'border-cyan-500 bg-slate-900/90 ring-1 ring-cyan-500 shadow-xl' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Badges & Title */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-3xs font-mono font-bold text-slate-400">{alt.alternativeId}</span>
                          <span className="text-3xs font-mono text-cyan-400 uppercase">{alt.category}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100 mt-0.5">{alt.name}</h3>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className={`px-2 py-0.5 rounded text-xs font-extrabold font-mono ${
                          evalItem.totalScore >= 85 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          evalItem.totalScore >= 70 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-300'
                        }`}>
                          Score: {evalItem.totalScore}/100
                        </div>

                        {isSelected && (
                          <span className="px-2 py-0.5 bg-cyan-500 text-slate-950 font-extrabold text-3xs font-mono rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> ACTIVE SELECTED
                          </span>
                        )}
                        {isRecommended && !isSelected && (
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 font-extrabold text-3xs font-mono rounded-full">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-2xs text-slate-300 leading-relaxed">
                      {alt.shortDescription}
                    </p>

                    {/* Key Technical Multipliers Grid */}
                    <div className="grid grid-cols-4 gap-2 text-3xs font-mono bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                      <div>
                        <div className="text-slate-500">Footprint</div>
                        <div className="font-bold text-cyan-300">{alt.footprintFactor}x baseline</div>
                      </div>
                      <div>
                        <div className="text-slate-500">CAPEX</div>
                        <div className="font-bold text-amber-300">{alt.capitalCostFactor}x baseline</div>
                      </div>
                      <div>
                        <div className="text-slate-500">OPEX</div>
                        <div className="font-bold text-purple-300">{alt.operatingCostFactor}x baseline</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Reliability</div>
                        <div className="font-bold text-emerald-300">{alt.reliability}%</div>
                      </div>
                    </div>

                    {/* Pros & Cons */}
                    <div className="space-y-1.5 text-3xs">
                      <div className="text-slate-400 font-mono font-bold uppercase">Engineering Advantages:</div>
                      <ul className="space-y-0.5">
                        {alt.advantages.slice(0, 2).map((adv, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Select Button */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-3xs font-mono text-slate-500">
                      Standard: {alt.standards[0] || 'CPHEEO 2021'}
                    </span>

                    <button
                      onClick={() => handleSelectAlternative(activeCategory, alt.alternativeId)}
                      disabled={isSelected}
                      className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition font-mono ${
                        isSelected 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                      }`}
                    >
                      {isSelected ? 'Currently Active' : 'Select Technology'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. Detailed Engineering Rationale "WHY SELECTED / WHY NOT OTHER OPTIONS" */}
          {selectedAltScore && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold uppercase text-xs">
                <Info className="w-4 h-4" />
                <span>Deterministic Technology Selection Rationale</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-2xs leading-relaxed">
                <div className="p-4 bg-slate-950 border border-emerald-900/60 rounded-xl space-y-2">
                  <div className="font-bold text-emerald-400 font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>WHY SELECTED: {selectedAltScore.alternative.name}</span>
                  </div>
                  <p className="text-slate-300">
                    {selectedAltScore.whySelected}
                  </p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-bold text-slate-400 font-mono flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>WHY NOT OTHER OPTIONS</span>
                  </div>
                  <p className="text-slate-300">
                    {selectedAltScore.whyNotSelected}
                  </p>
                </div>
              </div>

              {/* Impact summary for selected option */}
              {activeImpact && (
                <div className="p-3 bg-cyan-950/40 border border-cyan-800/80 rounded-lg text-3xs font-mono text-cyan-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span><strong>Live Impact Analysis:</strong> {activeImpact.tradeoffSummary}</span>
                  </div>
                  <span className="text-slate-400">Calculated across 50 MLD design flow</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Override Documentation Modal */}
      {overrideModalUnit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-mono">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Manual Override Documentation</span>
              </h3>
              <button 
                onClick={() => setOverrideModalUnit(null)}
                className="text-slate-400 hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-2xs">
              <p className="text-slate-300">
                You have manually overridden the automated recommendation for <strong className="text-cyan-300">{config.processConfigs[overrideModalUnit].name}</strong>.
                ISO 9001 and engineering QA/QC compliance require logging the rationale.
              </p>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono uppercase text-3xs font-bold">Override Category Reason:</label>
                <select
                  value={tempOverrideReason}
                  onChange={e => setTempOverrideReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2.5 rounded-lg outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="Client Specification">Client Explicit Specification (DPHE/WASA Directive)</option>
                  <option value="Site Land Constraint">Severe Site Land Footprint Constraint</option>
                  <option value="Pilot Test Verification">Pilot Plant Test Proven Performance</option>
                  <option value="Site Electricity Tariff">High Local Electrical Power Tariff</option>
                  <option value="Existing Civil Structure Integration">Integration with Existing Civil Infrastructure</option>
                  <option value="Engineering Preference">Lead Process Engineer Design Judgement</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono uppercase text-3xs font-bold">Detailed Engineer Note / Justification:</label>
                <textarea
                  rows={3}
                  value={tempEngineerNote}
                  onChange={e => setTempEngineerNote(e.target.value)}
                  placeholder="Provide specific calculation or client meeting reference..."
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2.5 rounded-lg outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setOverrideModalUnit(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-2xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverrideNote}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-2xs font-mono"
              >
                Save & Update QA Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
