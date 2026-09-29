import React, { useState } from "react";
import { MathFormula } from "../MathFormula";
import { ListOrdered, Layers, TrendingUp } from "lucide-react";
import { MathEngine } from "../../engine/mathEngine";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const SequenceSeriesLab: React.FC<Props> = ({ variables, onVariableChange }) => {
  const [seqType, setSeqType] = useState<"arithmetic" | "geometric" | "geometric-box">("arithmetic");

  const a1 = variables.a1 ?? 2;
  const d = variables.d ?? 3;
  const r = variables.r ?? 0.5;
  const termCount = variables.termCount ?? 8;

  // Compute sequences
  const ap = MathEngine.computeArithmeticSequence(a1, d, termCount);
  const gp = MathEngine.computeGeometricSequence(a1, r, termCount);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListOrdered className="text-pink-400" size={18} />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Sequences & Series Accumulation Lab
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 font-mono border border-pink-800/50">
            aₙ → Sₙ → S_∞
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setSeqType("arithmetic")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              seqType === "arithmetic" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Arithmetic (a + nd)
          </button>
          <button
            onClick={() => setSeqType("geometric")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              seqType === "geometric" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Geometric (a · rⁿ⁻¹)
          </button>
          <button
            onClick={() => setSeqType("geometric-box")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              seqType === "geometric-box" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Visual Box Proof (Σ 1/2ⁿ = 1)
          </button>
        </div>
      </div>

      {/* Main Visual Stage */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-4 select-none overflow-hidden">
        {seqType === "arithmetic" && (
          <div className="w-full max-w-2xl flex flex-col items-center space-y-4">
            {/* Bars of Sequence Terms */}
            <div className="w-full h-44 bg-slate-900/60 rounded-xl border border-slate-800 p-3 flex items-end justify-around gap-2">
              {ap.terms.map((term, idx) => {
                const maxTerm = Math.max(...ap.terms, 1);
                const heightPct = Math.min(100, Math.max(10, (term / maxTerm) * 100));
                return (
                  <div key={`ap-${idx}`} className="flex-1 flex flex-col items-center h-full justify-end">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-pink-600 to-pink-400 transition-all duration-300 min-h-[6px]"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 mt-1">a_{idx + 1}</span>
                    <span className="text-[11px] font-mono text-pink-300 font-bold">{term}</span>
                  </div>
                );
              })}
            </div>

            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-300">
              <span>Nth Term: <strong className="text-pink-300">{ap.nthTerm}</strong></span>
              <span>Partial Sum S_{termCount} = <strong className="text-amber-300">{ap.totalSum}</strong></span>
            </div>
          </div>
        )}

        {seqType === "geometric" && (
          <div className="w-full max-w-2xl flex flex-col items-center space-y-4">
            <div className="w-full h-44 bg-slate-900/60 rounded-xl border border-slate-800 p-3 flex items-end justify-around gap-2">
              {gp.terms.map((term, idx) => {
                const maxTerm = Math.max(...gp.terms, 1);
                const heightPct = Math.min(100, Math.max(8, (term / maxTerm) * 100));
                return (
                  <div key={`gp-${idx}`} className="flex-1 flex flex-col items-center h-full justify-end">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-purple-600 to-pink-400 transition-all duration-300 min-h-[6px]"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 mt-1">a_{idx + 1}</span>
                    <span className="text-[10px] font-mono text-pink-300 font-bold">{term.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-300">
              <span>Common Ratio r = <strong className="text-pink-300">{r}</strong></span>
              <span>
                {gp.converges ? (
                  <>Infinite Sum S_∞ = <strong className="text-emerald-300">{gp.infiniteSum.toFixed(2)}</strong></>
                ) : (
                  <span className="text-amber-400">Series Diverges (|r| ≥ 1)</span>
                )}
              </span>
            </div>
          </div>
        )}

        {seqType === "geometric-box" && (
          <div className="w-full max-w-md flex flex-col items-center space-y-3">
            <svg width="220" height="220" viewBox="0 0 220 220">
              {/* Big 1x1 Square */}
              <rect x="10" y="10" width="200" height="200" fill="none" stroke="#475569" strokeWidth="2" />

              {/* 1/2 */}
              <rect x="10" y="10" width="100" height="200" fill="#ec4899" fillOpacity="0.7" stroke="#db2777" strokeWidth="1" />
              <text x="60" y="115" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="monospace">1/2</text>

              {/* 1/4 */}
              <rect x="110" y="10" width="100" height="100" fill="#a855f7" fillOpacity="0.7" stroke="#9333ea" strokeWidth="1" />
              <text x="160" y="65" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">1/4</text>

              {/* 1/8 */}
              <rect x="110" y="110" width="50" height="100" fill="#3b82f6" fillOpacity="0.7" stroke="#2563eb" strokeWidth="1" />
              <text x="135" y="165" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">1/8</text>

              {/* 1/16 */}
              <rect x="160" y="110" width="50" height="50" fill="#10b981" fillOpacity="0.7" stroke="#059669" strokeWidth="1" />
              <text x="185" y="140" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">1/16</text>
            </svg>

            <span className="text-xs font-mono text-emerald-300">
              Geometric Unit Square Proof: $\frac{1}{2} + \frac{1}{4} + \frac{1}{8} + \dots = 1$
            </span>
          </div>
        )}
      </div>

      {/* KaTeX Expressions Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-pink-400 uppercase font-mono font-bold block">Series Equations</span>
          {seqType === "arithmetic" && (
            <MathFormula formula="a_n = a_1 + (n-1)d, \quad S_n = \frac{n}{2}(2a_1 + (n-1)d)" block />
          )}
          {seqType === "geometric" && (
            <MathFormula formula="a_n = a_1 r^{n-1}, \quad S_\infty = \frac{a_1}{1 - r} \quad (|r| < 1)" block />
          )}
          {seqType === "geometric-box" && (
            <MathFormula formula="\sum_{n=1}^\infty \left(\frac{1}{2}\right)^n = \frac{1/2}{1 - 1/2} = 1" block />
          )}
        </div>

        {/* Dynamic Controls */}
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Sequence Parameters</span>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-300 font-mono">Terms N: {termCount}</span>
            <input
              type="range"
              min="4"
              max="16"
              step="1"
              value={termCount}
              onChange={(e) => onVariableChange("termCount", Number(e.target.value))}
              className="flex-1 accent-pink-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
