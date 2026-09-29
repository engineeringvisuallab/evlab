/**
 * EVLab WaterFlow - Professional Engineering Report Generator
 * Generates technical report printable/exportable document with EVL branding and tabular summaries.
 */

import React, { useMemo } from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { Junction, Pipe } from '../../types/waterflow';
import { X, Printer, Download, FileText, Droplets } from 'lucide-react';

export const ReportGeneratorDialog: React.FC = () => {
  const { model, diagnostics, settings, setActiveDialog } = useWaterFlow();

  const nodes = useMemo(() => {
    return model.nodes instanceof Map ? Array.from(model.nodes.values()) : Object.values(model.nodes);
  }, [model.nodes]);

  const links = useMemo(() => {
    return model.links instanceof Map ? Array.from(model.links.values()) : Object.values(model.links);
  }, [model.links]);

  const junctions = useMemo(() => nodes.filter(n => n.type === 'junction') as Junction[], [nodes]);
  const pipes = useMemo(() => links.filter(l => l.type === 'pipe') as Pipe[], [links]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm text-cyan-400 tracking-wider uppercase">Engineering Technical Report Generator</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold shadow transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button onClick={() => setActiveDialog(null)} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Sheet */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950 font-sans text-slate-100 space-y-6 select-text">
          {/* EVL Title Block */}
          <div className="border-b-2 border-cyan-500 pb-4 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg mb-1">
                <Droplets className="w-5 h-5" />
                <span>Engineering Visual Lab (EVL) — WaterFlow</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white">{model.title}</h1>
              <p className="text-xs text-slate-400">Water Distribution Network Hydraulic Analysis Report</p>
            </div>
            <div className="text-right font-mono text-xs text-slate-400 space-y-0.5">
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Project #: {model.projectNumber || 'EVL-WF-2026'}</div>
              <div>Engineer: {model.engineer || 'Lead Hydraulic Engineer'}</div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              1. Executive Summary & Parameters
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-slate-900 p-3 rounded border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Calculation Method:</span> <strong className="text-white">{settings.headlossFormula}</strong>
              </div>
              <div>
                <span className="text-slate-400">Unit System:</span> <strong className="text-white">{settings.unitSystem} ({settings.flowUnit})</strong>
              </div>
              <div>
                <span className="text-slate-400">Total System Demand:</span> <strong className="text-cyan-300 font-bold">{diagnostics?.totalSystemDemand || 0} L/s</strong>
              </div>
              <div>
                <span className="text-slate-400">Solver Convergence:</span> <strong className="text-emerald-400 font-bold">{diagnostics?.converged ? 'CONVERGED' : 'FAILED'}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Junction Results Summary */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              2. Junction Hydraulic Summary
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-2 border border-slate-800">Node ID</th>
                  <th className="p-2 border border-slate-800">Elevation (m)</th>
                  <th className="p-2 border border-slate-800">Demand (L/s)</th>
                  <th className="p-2 border border-slate-800">Pressure (kPa)</th>
                  <th className="p-2 border border-slate-800">HGL (m)</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11px] divide-y divide-slate-800">
                {junctions.map(j => (
                  <tr key={j.id} className="hover:bg-slate-900">
                    <td className="p-2 border border-slate-800 font-bold text-cyan-300">{j.id}</td>
                    <td className="p-2 border border-slate-800">{j.elevation}</td>
                    <td className="p-2 border border-slate-800">{j.baseDemand}</td>
                    <td className="p-2 border border-slate-800 text-emerald-400 font-bold">{j.pressure?.toFixed(1) ?? 'N/A'}</td>
                    <td className="p-2 border border-slate-800">{j.hydraulicGrade?.toFixed(2) ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Pipe Results Summary */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              3. Pipe Links Summary
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-2 border border-slate-800">Pipe ID</th>
                  <th className="p-2 border border-slate-800">Length (m)</th>
                  <th className="p-2 border border-slate-800">Diam (mm)</th>
                  <th className="p-2 border border-slate-800">Flow (L/s)</th>
                  <th className="p-2 border border-slate-800">Vel (m/s)</th>
                  <th className="p-2 border border-slate-800">Headloss (m)</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11px] divide-y divide-slate-800">
                {pipes.map(p => (
                  <tr key={p.id} className="hover:bg-slate-900">
                    <td className="p-2 border border-slate-800 font-bold text-blue-400">{p.id}</td>
                    <td className="p-2 border border-slate-800">{p.length}</td>
                    <td className="p-2 border border-slate-800">{p.diameter}</td>
                    <td className="p-2 border border-slate-800 text-cyan-300 font-bold">{p.flow?.toFixed(2) ?? 'N/A'}</td>
                    <td className="p-2 border border-slate-800 text-emerald-400 font-bold">{p.velocity?.toFixed(2) ?? 'N/A'}</td>
                    <td className="p-2 border border-slate-800">{p.headloss?.toFixed(2) ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
