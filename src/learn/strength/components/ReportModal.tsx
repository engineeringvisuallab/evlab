import React from 'react';
import { CalculationState, CalculationTrace, Material, SectionProperties, TopicData, UnitSystem } from '../types';
import { formatEngValue } from '../core/units';
import { Download, FileText, Printer, ShieldCheck, X } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicData;
  material: Material;
  section: SectionProperties;
  traces: CalculationTrace[];
  calcState: CalculationState;
  unitSystem: UnitSystem;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  topic,
  material,
  section,
  traces,
  calcState,
  unitSystem,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        {/* Modal Top Controls */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-100 font-mono">
              EVLab Structural Engineering Calculation Report
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950 text-slate-200 print:bg-white print:text-black print:p-0">
          {/* Document Header & Engineering Stamp */}
          <div className="border-b-2 border-cyan-700 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold font-mono text-cyan-400">EVLab</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  Virtual Engineering Laboratory
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-100 mt-1">
                MECHANICS OF MATERIALS CALCULATION PACKET
              </h1>
              <p className="text-xs text-slate-400">
                Module: {topic.title} • Reference Standard: {topic.standardRef}
              </p>
            </div>

            <div className="text-right text-xs font-mono space-y-0.5">
              <div className="text-slate-400">Date: {currentDate}</div>
              <div className="text-slate-400">Unit System: {unitSystem} Standard</div>
              <div className="text-emerald-400 font-bold flex items-center justify-end space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TRACEABLE NUMERICAL RUN</span>
              </div>
            </div>
          </div>

          {/* Section 1: Member Geometry & Material Properties Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              1. Structural Specification & Material Properties
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Material:</span>
                <span className="text-slate-200 font-semibold">{material.name}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Young’s Modulus (E):</span>
                <span className="text-slate-200 font-semibold">{material.E} GPa</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Yield Strength (σ_y):</span>
                <span className="text-slate-200 font-semibold">{material.yieldStrength} MPa</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Cross-Section:</span>
                <span className="text-slate-200 font-semibold">{section.name}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Area (A):</span>
                <span className="text-slate-200 font-semibold">{formatEngValue(section.area)} mm²</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Moment of Inertia (Ix):</span>
                <span className="text-slate-200 font-semibold">{formatEngValue(section.Ix)} mm⁴</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Elastic Modulus (Zx):</span>
                <span className="text-slate-200 font-semibold">{formatEngValue(section.Zx)} mm³</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Polar Inertia (J):</span>
                <span className="text-slate-200 font-semibold">{formatEngValue(section.J)} mm⁴</span>
              </div>
            </div>
          </div>

          {/* Section 2: Step-by-Step Calculation Traces */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              2. Design Calculations & Step-by-Step Proof
            </h3>

            {traces.map((trace, idx) => (
              <div key={idx} className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-slate-100">{trace.title} ({trace.calcId})</span>
                </div>

                <div className="font-mono text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800/80">
                  Formula: {trace.formulaName}
                </div>

                <div className="font-mono text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  Substitution: {trace.substitution}
                </div>

                <div className="flex justify-between items-center pt-1 font-mono">
                  <span className="text-slate-400">Result:</span>
                  <span className="text-base font-bold text-cyan-300">
                    {formatEngValue(trace.result.value)} {trace.result.unit}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 italic pt-1">
                  Note: {trace.engineeringInterpretation}
                </p>
              </div>
            ))}
          </div>

          {/* Section 3: Engineering Disclaimer & Seal */}
          <div className="border-t border-slate-800 pt-4 text-[10px] text-slate-500 leading-relaxed font-sans space-y-1">
            <p className="font-bold text-slate-400">
              EDUCATIONAL & PRELIMINARY SIMULATION NOTICE:
            </p>
            <p>
              This calculation report is generated by EVLab Strength of Materials Virtual Laboratory for academic, analytical, and conceptual design verification. Final construction documents, critical life-safety structures, and production aerospace components must be certified by a licensed Professional Engineer (PE / SE) in compliance with local building codes (AISC 360, ACI 318, Eurocodes, AS/NZS).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
