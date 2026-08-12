import React from 'react';
import { FileText, Printer, Download, CheckSquare } from 'lucide-react';
import { ProjectMetadata } from '../types/wtp';
import { CalculatedWtpState } from '../core/dependencyEngine';

interface ReportsViewProps {
  project: ProjectMetadata;
  state: CalculatedWtpState;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ project, state }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Detailed Engineering Calculation Report Generator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal multi-page design basis notes, process sizing rationale, hydraulic headloss tables, and equipment schedules.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF Note</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-4xl mx-auto space-y-6 text-slate-200">
        <div className="border-b border-slate-800 pb-4 text-center space-y-1">
          <div className="text-xl font-bold text-cyan-400">{project.name || 'Water Treatment Plant Design'}</div>
          <div className="text-slate-400">DETAILED PROCESS & HYDRAULIC ENGINEERING DESIGN CALCULATION NOTE</div>
          <div className="text-3xs text-slate-500">Client: {project.client} | Consultant: {project.consultant} | Rev: {project.revision}</div>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-sm text-cyan-300 border-b border-slate-800 pb-1">1. DESIGN BASIS & HYDRAULIC FLOW SUMMARY</h2>
          <div className="grid grid-cols-2 gap-4 text-2xs">
            <div><span className="text-slate-400">Design Capacity:</span> {state.plantCapacityMLD} MLD ({state.m3hrFlow.toFixed(2)} m³/hr)</div>
            <div><span className="text-slate-400">Raw Water Intake Flow:</span> {(state.plantCapacityMLD * 1.05).toFixed(2)} MLD</div>
            <div><span className="text-slate-400">Operating Hours:</span> 24 hrs/day</div>
            <div><span className="text-slate-400">Design Standard:</span> {project.designStandard}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-sm text-cyan-300 border-b border-slate-800 pb-1">2. PROCESS UNIT SIZING SUMMARY</h2>
          <div className="space-y-2 text-2xs">
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-amber-300">Cascade Aerator:</span> Diameter {state.cascadeDiameterM.toFixed(2)} m, {state.cascadeSteps} Steps, Hydraulic Loading {(state.plantCapacityMLD * 1000 / (Math.PI * Math.pow(state.cascadeDiameterM/2, 2))).toFixed(1)} m³/m²/day.
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-purple-300">Flash Mixer:</span> Power {state.flashMixerPowerKw.toFixed(2)} kW, Velocity Gradient G = {state.flashMixerG} s⁻¹, Detention Time {state.flashMixerDetentionSec} s.
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-blue-300">Paddled Flocculator:</span> {state.flocculatorBasins} Basins, Total Volume {state.flocculatorVolumeM3.toFixed(1)} m³, Detention Time {state.flocculatorDetentionMin} min.
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-emerald-300">Clarifier / Tube Settler:</span> Plan Area {state.clarifierPlanAreaM2.toFixed(1)} m², Surface Overflow Rate {state.clarifierSOR} m³/m²/day.
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-cyan-300">Rapid Gravity Sand Filter:</span> {state.numberOfFilters} Filter Beds, Filtration Rate {state.filtrationRateM3M2Hr} m/hr, Backwash Flow {state.backwashFlowM3hr.toFixed(1)} m³/hr.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-sm text-cyan-300 border-b border-slate-800 pb-1">3. CHEMICAL DOSING SUMMARY</h2>
          <div className="grid grid-cols-2 gap-4 text-2xs">
            <div><span className="text-slate-400">Alum Dosing Rate:</span> {state.alumConsumptionKgDay.toFixed(1)} kg/day ({state.alumDoseMgL} mg/L)</div>
            <div><span className="text-slate-400">Lime Dosing Rate:</span> {state.limeConsumptionKgDay.toFixed(1)} kg/day ({state.limeDoseMgL} mg/L)</div>
            <div><span className="text-slate-400">Gas Chlorine Rate:</span> {state.chlorineConsumptionKgDay.toFixed(1)} kg/day ({state.chlorineDoseMgL} mg/L)</div>
            <div><span className="text-slate-400">Polyelectrolyte:</span> {(state.alumConsumptionKgDay * 0.02).toFixed(1)} kg/day</div>
          </div>
        </div>
      </div>
    </div>
  );
};
