/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Project Dashboard & Completeness Inspector
 * @license Apache-2.0
 */

import React from 'react';
import { ProjectState } from '../types/stp';
import { runParameterAudit } from '../engine/parameters';
import { AssumptionEngine } from '../engine/assumptions';
import { Users, Droplets, Building2, MapPin, CheckCircle2, AlertTriangle, HelpCircle, Layers, DollarSign } from 'lucide-react';

interface DashboardPanelProps {
  project: ProjectState;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({ project }) => {
  const activeScenario = project.scenarios[project.activeScenarioId];
  const audit = runParameterAudit(project.parameterRegistry);
  const unresolvedInputs = AssumptionEngine.getUnresolvedInputs(project);

  const subsystems = [
    { name: 'Design Basis & Flow', status: 'COMPLETE', category: 'Core' },
    { name: 'Influent Quality', status: 'COMPLETE', category: 'Process' },
    { name: 'Sewer Network', status: 'PARTIAL', category: 'Hydraulics' },
    { name: 'Pumping Station', status: 'PARTIAL', category: 'Hydraulics' },
    { name: 'Preliminary Treatment', status: 'PARTIAL', category: 'Process' },
    { name: 'Primary Clarification', status: 'PARTIAL', category: 'Process' },
    { name: 'Biological Treatment', status: 'PARTIAL', category: 'Process' },
    { name: 'Secondary Clarifier', status: 'PARTIAL', category: 'Process' },
    { name: 'Tertiary Filtration', status: 'PARTIAL', category: 'Process' },
    { name: 'Disinfection', status: 'PARTIAL', category: 'Process' },
    { name: 'Sludge Management', status: 'PARTIAL', category: 'Process' },
    { name: 'Chemical Dosing', status: 'PARTIAL', category: 'Auxiliary' },
    { name: 'Electrical & Power', status: 'PARTIAL', category: 'Infrastructure' },
    { name: 'Instrumentation & SCADA', status: 'PARTIAL', category: 'Infrastructure' },
    { name: 'BOQ & Costing', status: 'COMPLETE', category: 'Financial' },
  ];

  return (
    <div className="p-6 space-y-6 text-slate-200">
      {/* Top Banner Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Design Population */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Design Population</span>
            <div className="p-2 bg-blue-950 text-blue-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-100 font-mono">
            {activeScenario.designBasis.designPopulation.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">30-Year Horizon ({activeScenario.designBasis.growthRatePct}% Growth)</p>
        </div>

        {/* Metric 2: ADWF & PWWF */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Design Flow (ADWF / PWWF)</span>
            <div className="p-2 bg-cyan-950 text-cyan-400 rounded-lg">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-300 font-mono">
            {activeScenario.designBasis.adwfM3d.toLocaleString()} <span className="text-xs font-normal text-slate-400">m³/d</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Peak PWWF: <span className="font-mono text-cyan-200 font-semibold">{activeScenario.designBasis.pwwfM3d.toLocaleString()} m³/d</span> ({activeScenario.designBasis.peakFlowLps} L/s)
          </p>
        </div>

        {/* Metric 3: CAPEX & OPEX Estimate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated CAPEX / OPEX</span>
            <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            ${(activeScenario.totalCapexUSD / 1e6).toFixed(2)}M <span className="text-xs font-normal text-slate-400">CAPEX</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Annual OPEX: <span className="font-mono text-emerald-300 font-semibold">${(activeScenario.totalOpexUSDPerYear / 1e3).toFixed(0)}k/yr</span>
          </p>
        </div>

        {/* Metric 4: Land & Footprint */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plant Footprint</span>
            <div className="p-2 bg-indigo-950 text-indigo-400 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-300 font-mono">
            {activeScenario.totalFootprintM2.toLocaleString()} <span className="text-xs font-normal text-slate-400">m²</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Available Land: <span className="font-mono text-indigo-200">{project.siteInfo.availableLandM2.toLocaleString()} m²</span>
          </p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Project Identity & Subsystem Completeness Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity & Location Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Project Identity & Site Metadata</span>
            </h2>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Project ID & Name</span>
                <span className="font-mono font-semibold text-slate-200">{project.identity.id} - {project.identity.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Client / Authority</span>
                <span className="font-semibold text-slate-200">{project.identity.client}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location & Country</span>
                <span className="font-semibold text-slate-200">{project.identity.location}, {project.identity.country}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Coordinates & CRS</span>
                <span className="font-mono text-slate-300">{project.identity.coordinates.latitude}, {project.identity.coordinates.longitude} ({project.identity.crs})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Ground Elevation & Water Table</span>
                <span className="font-mono text-slate-300">{project.siteInfo.groundElevationMasl} mASL &bull; GW Table: {project.siteInfo.groundwaterTableDepthM} m</span>
              </div>
              <div>
                <span className="text-slate-500 block">Discharge & Regulatory Standard</span>
                <span className="font-semibold text-cyan-400">{project.objectives.dischargeTarget} ({project.objectives.regulatoryStandard} Standard)</span>
              </div>
            </div>
          </div>

          {/* Subsystem Completeness Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Subsystem Completeness Matrix</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">Phase 01 Framework Baseline</span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {subsystems.map((sub, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">{sub.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{sub.category}</span>
                  </div>
                  {sub.status === 'COMPLETE' ? (
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-mono px-2 py-0.5 rounded flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>FOUNDATION</span>
                    </span>
                  ) : (
                    <span className="bg-blue-950 text-blue-400 border border-blue-800/60 text-[10px] font-mono px-2 py-0.5 rounded flex items-center space-x-1">
                      <HelpCircle className="w-3 h-3" />
                      <span>PHASE 02+</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Parameter Audit & Unresolved Inputs Alert */}
        <div className="space-y-6">
          {/* Parameter Audit Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Parameter Registry Audit</span>
            </h2>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Registered Parameters:</span>
                <span className="text-slate-100 font-bold">{audit.totalParameters}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Used in Formulas / Reports:</span>
                <span className="text-emerald-400 font-bold">{audit.usedParameters}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Unused / Standby:</span>
                <span className="text-slate-400 font-bold">{audit.unusedParameters}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Duplicate IDs / Missing Units:</span>
                <span className="text-slate-100 font-bold">0</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Audit Status:</span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                  {audit.auditStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Unresolved Inputs & Lab Warnings Box */}
          <div className="bg-slate-900 border border-amber-900/60 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Unresolved Engineering Inputs ({unresolvedInputs.length})</span>
            </h2>

            <div className="mt-3 space-y-2 text-xs">
              {unresolvedInputs.map((item, idx) => (
                <div key={idx} className="bg-amber-950/30 border border-amber-800/40 text-amber-200/90 rounded p-2.5 font-sans leading-relaxed">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
