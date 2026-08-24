import React, { useState } from 'react';
import { Material, SectionProperties, TopicId } from '../types';
import { STANDARD_MATERIALS } from '../core/materials';
import { STANDARD_SECTIONS } from '../core/sections';
import { formatEngValue } from '../core/units';
import { calculateBeam, calculateTorsion, calculateBuckling } from '../engines/calculationEngine';
import { ArrowRight, Check, Sliders, X } from 'lucide-react';

interface ComparisonLabProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: TopicId;
}

export const ComparisonLab: React.FC<ComparisonLabProps> = ({
  isOpen,
  onClose,
  topicId,
}) => {
  if (!isOpen) return null;

  // Case A Configuration
  const [materialA, setMaterialA] = useState<Material>(STANDARD_MATERIALS[0]); // A36 Steel
  const [sectionA, setSectionA] = useState<SectionProperties>(STANDARD_SECTIONS[0]); // W200x46.1

  // Case B Configuration
  const [materialB, setMaterialB] = useState<Material>(STANDARD_MATERIALS[2]); // 6061-T6 Aluminum
  const [sectionB, setSectionB] = useState<SectionProperties>(STANDARD_SECTIONS[3]); // Rect 150x250

  const [spanLengthM, setSpanLengthM] = useState<number>(4);
  const [loadKN, setLoadKN] = useState<number>(25);

  // Compute Case A & Case B
  const resA = calculateBeam({
    material: materialA,
    section: sectionA,
    spanLengthM,
    supportType: 'simply_supported',
    pointLoads: [{ id: '1', position: spanLengthM / 2, magnitude: loadKN }],
    udlKNm: 0,
  });

  const resB = calculateBeam({
    material: materialB,
    section: sectionB,
    spanLengthM,
    supportType: 'simply_supported',
    pointLoads: [{ id: '1', position: spanLengthM / 2, magnitude: loadKN }],
    udlKNm: 0,
  });

  const percentDiff = (a: number, b: number) => {
    if (a === 0) return '0%';
    const diff = ((b - a) / a) * 100;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                Case Comparison Laboratory (Design Alternative A vs B)
              </h3>
              <p className="text-xs text-slate-400">
                Direct side-by-side evaluation of structural efficiency, weight, stress, and deflection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Shared Test Bench Conditions */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Test Bench Parameters:</span>
            <div className="flex items-center space-x-4 font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">Span:</span>
                <input
                  type="number"
                  value={spanLengthM}
                  onChange={e => setSpanLengthM(parseFloat(e.target.value) || 1)}
                  className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-cyan-300"
                />
                <span>m</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">Point Load:</span>
                <input
                  type="number"
                  value={loadKN}
                  onChange={e => setLoadKN(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-rose-300"
                />
                <span>kN</span>
              </div>
            </div>
          </div>

          {/* Two-Column Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Case A */}
            <div className="bg-slate-950/90 rounded-lg border border-blue-800/50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
                  Design Alternative A
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Primary Baseline
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Material:</span>
                  <select
                    value={materialA.id}
                    onChange={e => {
                      const m = STANDARD_MATERIALS.find(mat => mat.id === e.target.value);
                      if (m) setMaterialA(m);
                    }}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  >
                    {STANDARD_MATERIALS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} (E={m.E} GPa, σy={m.yieldStrength} MPa)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-slate-400">Cross-Section:</span>
                  <select
                    value={sectionA.id}
                    onChange={e => {
                      const s = STANDARD_SECTIONS.find(sec => sec.id === e.target.value);
                      if (s) setSectionA(s);
                    }}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  >
                    {STANDARD_SECTIONS.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Ix={formatEngValue(s.Ix)} mm⁴, A={formatEngValue(s.area)} mm²)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Performance Results A */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Bending Stress:</span>
                  <span className="text-slate-200 font-bold">{formatEngValue(resA.maxFlexuralStressMPa)} MPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Deflection δ:</span>
                  <span className="text-emerald-400 font-bold">{formatEngValue(resA.maxDeflectionMm)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Safety Factor (SF):</span>
                  <span className="text-cyan-400 font-bold">{formatEngValue(resA.safetyFactor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Self-Weight Est:</span>
                  <span className="text-slate-300 font-bold">{formatEngValue((sectionA.area * materialA.density * 1e-6 * spanLengthM))} kg</span>
                </div>
              </div>
            </div>

            {/* Case B */}
            <div className="bg-slate-950/90 rounded-lg border border-purple-800/50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                  Design Alternative B
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Alternative Candidate
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Material:</span>
                  <select
                    value={materialB.id}
                    onChange={e => {
                      const m = STANDARD_MATERIALS.find(mat => mat.id === e.target.value);
                      if (m) setMaterialB(m);
                    }}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  >
                    {STANDARD_MATERIALS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} (E={m.E} GPa, σy={m.yieldStrength} MPa)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-slate-400">Cross-Section:</span>
                  <select
                    value={sectionB.id}
                    onChange={e => {
                      const s = STANDARD_SECTIONS.find(sec => sec.id === e.target.value);
                      if (s) setSectionB(s);
                    }}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  >
                    {STANDARD_SECTIONS.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Ix={formatEngValue(s.Ix)} mm⁴, A={formatEngValue(s.area)} mm²)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Performance Results B */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Bending Stress:</span>
                  <span className="text-slate-200 font-bold">{formatEngValue(resB.maxFlexuralStressMPa)} MPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Deflection δ:</span>
                  <span className="text-emerald-400 font-bold">{formatEngValue(resB.maxDeflectionMm)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Safety Factor (SF):</span>
                  <span className="text-cyan-400 font-bold">{formatEngValue(resB.safetyFactor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Self-Weight Est:</span>
                  <span className="text-slate-300 font-bold">{formatEngValue((sectionB.area * materialB.density * 1e-6 * spanLengthM))} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Comparative Delta Table */}
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Direct Delta Analysis (B relative to A):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Stress Delta:</span>
                <span className="text-slate-200 font-bold">
                  {percentDiff(resA.maxFlexuralStressMPa, resB.maxFlexuralStressMPa)}
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Deflection Delta:</span>
                <span className="text-slate-200 font-bold">
                  {percentDiff(resA.maxDeflectionMm, resB.maxDeflectionMm)}
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Safety Factor Delta:</span>
                <span className="text-slate-200 font-bold">
                  {percentDiff(resA.safetyFactor, resB.safetyFactor)}
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Weight Delta:</span>
                <span className="text-slate-200 font-bold">
                  {percentDiff(sectionA.area * materialA.density, sectionB.area * materialB.density)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
