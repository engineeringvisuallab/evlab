/**
 * EVLab Engineering Calculation Summary & Lab Report Modal
 */

import React, { useState } from 'react';
import { LabTopicId, FluidProperty, UnitSystem } from '../../types';
import { solveHydraulics } from '../../core/hydraulicSolvers';
import { X, Printer, Download, Check, FileText, Share2 } from 'lucide-react';

interface EngineeringReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  labId: LabTopicId | 'dashboard';
  fluid: FluidProperty;
  unitSystem: UnitSystem;
}

export const EngineeringReportModal: React.FC<EngineeringReportModalProps> = ({
  isOpen,
  onClose,
  labId,
  fluid,
  unitSystem,
}) => {
  const [engineerName, setEngineerName] = useState('Fluid Engineering Specialist');
  const [projectTitle, setProjectTitle] = useState('EVLab Hydraulic Verification Report');

  if (!isOpen) return null;

  const targetLab = labId === 'dashboard' ? 'continuity' : labId;
  const sampleParams: Record<string, any> = {
    d1: 0.15,
    d2: 0.075,
    discharge_Lps: 25,
    roughness_mm: 0.045,
    length: 250,
  };

  const { results, traces } = solveHydraulics(targetLab, sampleParams, fluid);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Engineering Calculation Audit Report</h3>
              <p className="text-xs text-slate-400">Formal technical documentation with mathematical derivations and assumptions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 bg-slate-950 text-slate-200 text-xs font-mono printable-area">
          {/* Header Metadata */}
          <div className="border-b-2 border-slate-700 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-slate-100 font-sans">{projectTitle}</h1>
              <p className="text-sky-400 mt-1 font-semibold font-sans">EVLab Virtual Fluid Mechanics Laboratory</p>
            </div>
            <div className="text-right text-[11px] text-slate-400 space-y-0.5">
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Unit System: {unitSystem}</div>
              <div>Status: VALIDATED (ANALYTICAL)</div>
            </div>
          </div>

          {/* Engineer Details Inputs */}
          <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800 no-print">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Project Name</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 rounded px-2.5 py-1 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Author / Lead Engineer</label>
              <input
                type="text"
                value={engineerName}
                onChange={(e) => setEngineerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 rounded px-2.5 py-1 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Fluid Properties Table */}
          <div>
            <h3 className="font-bold text-slate-100 text-sm font-sans uppercase tracking-wider mb-2">
              1. Working Fluid Thermodynamics
            </h3>
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block">Fluid Medium:</span>
                <span className="text-slate-100 font-bold">{fluid.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Temperature:</span>
                <span className="text-sky-400 font-bold">{fluid.temperature}°C</span>
              </div>
              <div>
                <span className="text-slate-400 block">Density (ρ):</span>
                <span className="text-slate-100 font-bold">{fluid.density.toFixed(1)} kg/m³</span>
              </div>
              <div>
                <span className="text-slate-400 block">Dynamic Viscosity (μ):</span>
                <span className="text-emerald-400 font-bold">{fluid.dynamicViscosity.toExponential(2)} Pa·s</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Calculation Traces */}
          <div>
            <h3 className="font-bold text-slate-100 text-sm font-sans uppercase tracking-wider mb-2">
              2. Mathematical Derivations & Traces
            </h3>
            <div className="space-y-4">
              {traces.map((t) => {
                const title = t.name || (t as any).title || t.id;
                const resVal = t.result ? t.result.value : (t as any).resultValue ?? 0;
                const unit = t.result ? t.result.unit : (t as any).unit ?? '';
                return (
                  <div key={t.id} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-sky-400 font-sans">
                        [{t.id}] {title}
                      </span>
                      <span className="font-bold text-emerald-400">
                        {typeof resVal === 'number' ? resVal.toFixed(4) : String(resVal)} {unit}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      <span className="text-slate-500">Formula: </span>
                      {t.formula}
                    </div>
                    <div className="text-[11px] text-emerald-400/90 bg-slate-950 p-2 rounded border border-slate-850">
                      <span className="text-slate-500">Substitution: </span>
                      {t.substitution}
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      <span className="text-slate-500">Assumptions: </span>
                      {t.assumptions?.join('; ') || 'Standard steady flow assumptions'}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Verification Sign-Off Footer */}
          <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-[10px] text-slate-500">
            <div>Generated via EVLab Fluid Mechanics Simulation Core</div>
            <div>Sign-off: {engineerName}</div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">Ready to export formal engineering audit report.</span>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 text-slate-950 hover:bg-sky-400 flex items-center space-x-1.5 transition-colors shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
