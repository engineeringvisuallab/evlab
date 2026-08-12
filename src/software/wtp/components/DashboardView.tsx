import React from 'react';
import { 
  Building2, 
  Droplets, 
  Zap, 
  Coins, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';
import { ValidationResult, ProjectMetadata } from '../types/wtp';

interface DashboardProps {
  project?: ProjectMetadata;
  state: CalculatedWtpState;
  validations: ValidationResult[];
  onNavigateTab: (tab: any) => void;
  onOpenAiAssistant?: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  state,
  validations,
  onNavigateTab,
  onOpenAiAssistant
}) => {
  const passes = validations.filter(v => v.status === 'PASS').length;
  const warnings = validations.filter(v => v.status === 'WARNING').length;
  const fails = validations.filter(v => v.status === 'FAIL').length;

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      {/* Top Banner / Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-900/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1 font-semibold">
              <Building2 className="w-4 h-4" />
              <span>Engineering Visual Lab • WTP Platform</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Water Treatment Plant Executive Summary
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Full-scale deterministic process design, hydraulic HGL/EGL calculations, electrical load schedule, and BOQ estimation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAiAssistant}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-950/80 border border-cyan-400/30 transition flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-cyan-200" />
              <span>AI Audit & Consultation</span>
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2"
            >
              <span>Export Full Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PLANT CAPACITY</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {state.plantCapacityMLD} <span className="text-base font-normal text-slate-400">MLD</span>
          </div>
          <div className="text-2xs text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800">
            <span>{state.flowM3hr} m³/hr</span>
            <span>{state.flowLs} L/s</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SPECIFIC ENERGY</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {state.specificEnergyKwhM3} <span className="text-base font-normal text-slate-400">kWh/m³</span>
          </div>
          <div className="text-2xs text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800">
            <span>Demand: {state.totalDemandLoadKw} kW</span>
            <span>Tx: {state.transformerKva} kVA</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ESTIMATED CAPEX</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ${(state.totalCapexUSD / 1000000).toFixed(2)}M <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="text-2xs text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800">
            <span>Annual OPEX: ${(state.annualOpexUSD / 1000).toFixed(0)}k/yr</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>DESIGN VALIDATION</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="text-emerald-400 font-bold text-2xl">{passes} PASS</span>
            {fails > 0 && <span className="text-rose-400 font-bold text-2xl">{fails} FAIL</span>}
          </div>
          <div className="text-2xs text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800">
            <span>Warnings: {warnings}</span>
            <button onClick={() => onNavigateTab('validation')} className="text-cyan-400 hover:underline">
              View Matrix →
            </button>
          </div>
        </div>
      </div>

      {/* Main Stream Flow Summary & Process Train */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Process Train Hydraulic Sizing Summary</span>
          </h2>
          <button 
            onClick={() => onNavigateTab('processDesign')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
          >
            <span>Detailed Design</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-3xs text-slate-500 uppercase">1. Intake</div>
            <div className="font-bold text-slate-200">{state.coarseScreenAreaM2} m²</div>
            <div className="text-3xs text-slate-400">Coarse Screen</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-3xs text-slate-500 uppercase">2. Aeration</div>
            <div className="font-bold text-slate-200">{state.aeratorTrayAreaM2} m²</div>
            <div className="text-3xs text-slate-400">Cascade Trays</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-3xs text-slate-500 uppercase">3. Rapid Mix</div>
            <div className="font-bold text-slate-200">{state.rapidMixPowerKw} kW</div>
            <div className="text-3xs text-slate-400">{state.rapidMixVolumeM3} m³</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-3xs text-slate-500 uppercase">4. Flocculation</div>
            <div className="font-bold text-slate-200">{state.flocculationVolumeM3} m³</div>
            <div className="text-3xs text-slate-400">3-Stage Tapered</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-3xs text-slate-500 uppercase">5. Clarifier</div>
            <div className="font-bold text-slate-200">{state.clarifierAreaM2} m²</div>
            <div className="text-3xs text-slate-400">SOR = 1.25 m/h</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-3xs text-slate-500 uppercase">6. Filters</div>
            <div className="font-bold text-slate-200">{state.numberOfFilters} Beds</div>
            <div className="text-3xs text-slate-400">{state.totalFilterAreaM2} m² Total</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-3xs text-slate-500 uppercase">7. Disinfection</div>
            <div className="font-bold text-slate-200">{state.chlorineConsumptionKgDay} kg/d</div>
            <div className="text-3xs text-slate-400">Cl₂ Dose</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-3xs text-slate-500 uppercase">8. Reservoir</div>
            <div className="font-bold text-slate-200">{state.cwrVolumeM3} m³</div>
            <div className="text-3xs text-slate-400">CWR Storage</div>
          </div>
        </div>
      </div>
    </div>
  );
};
