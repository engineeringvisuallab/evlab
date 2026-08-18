import React, { useState } from "react";
import { MathFormula } from "../MathFormula";
import { Scale, Grid, GitCommit, Sparkles } from "lucide-react";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const AlgebraVisualLab: React.FC<Props> = ({ variables, onVariableChange }) => {
  const [subMode, setSubMode] = useState<"area-model" | "balance" | "simultaneous">("area-model");

  const a = variables.a ?? 3;
  const b = variables.b ?? 2;
  const xVal = variables.xVal ?? 4;

  // Simultaneous equations variables: y = m1*x + c1, y = m2*x + c2
  const m1 = variables.m1 ?? 1.5;
  const c1 = variables.c1 ?? 1.0;
  const m2 = variables.m2 ?? -0.5;
  const c2 = variables.c2 ?? 5.0;

  // Area model calculated areas
  const xSquareArea = xVal * xVal;
  const axArea = a * xVal;
  const bxArea = b * xVal;
  const abConstArea = a * b;
  const totalArea = (xVal + a) * (xVal + b);

  // Simultaneous intersection calculation
  const detM = m1 - m2;
  const hasIntersection = Math.abs(detM) > 0.001;
  const intersectX = hasIntersection ? (c2 - c1) / detM : 0;
  const intersectY = hasIntersection ? m1 * intersectX + c1 : 0;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Header & Tab Switcher */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Grid className="text-emerald-400" size={18} />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Visual Algebra & Geometry Models
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono border border-emerald-800/50">
            Geometric Proofs
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setSubMode("area-model")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              subMode === "area-model" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Grid size={13} />
            <span>Area Model (x+a)(x+b)</span>
          </button>
          <button
            onClick={() => setSubMode("balance")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              subMode === "balance" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scale size={13} />
            <span>Balance Scale ax+b=c</span>
          </button>
          <button
            onClick={() => setSubMode("simultaneous")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              subMode === "simultaneous" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitCommit size={13} />
            <span>Simultaneous Systems</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-4 select-none overflow-hidden">
        {/* SUBMODE 1: GEOMETRIC AREA MODEL */}
        {subMode === "area-model" && (
          <div className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-center gap-6">
            {/* SVG Visual Area Model */}
            <div className="relative">
              <svg width="340" height="340" viewBox="0 0 340 340" className="drop-shadow-xl">
                {/* Dimensions: x scale ~ 160px, a scale ~ 80px, b scale ~ 80px */}
                {/* Top-Left: x * x = x^2 */}
                <rect x="50" y="50" width="160" height="160" fill="#3b82f6" fillOpacity="0.8" stroke="#60a5fa" strokeWidth="2" rx="4" />
                <text x="130" y="135" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  x²
                </text>
                <text x="130" y="155" fill="#bae6fd" fontSize="11" textAnchor="middle" fontFamily="monospace">
                  ({xSquareArea})
                </text>

                {/* Top-Right: a * x */}
                <rect x="215" y="50" width="75" height="160" fill="#10b981" fillOpacity="0.8" stroke="#34d399" strokeWidth="2" rx="4" />
                <text x="252" y="135" fill="#ffffff" fontSize="15" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {a}x
                </text>
                <text x="252" y="155" fill="#d1fae5" fontSize="11" textAnchor="middle" fontFamily="monospace">
                  ({axArea})
                </text>

                {/* Bottom-Left: b * x */}
                <rect x="50" y="215" width="160" height="75" fill="#8b5cf6" fillOpacity="0.8" stroke="#a78bfa" strokeWidth="2" rx="4" />
                <text x="130" y="255" fill="#ffffff" fontSize="15" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {b}x
                </text>
                <text x="130" y="275" fill="#ede9fe" fontSize="11" textAnchor="middle" fontFamily="monospace">
                  ({bxArea})
                </text>

                {/* Bottom-Right: a * b */}
                <rect x="215" y="215" width="75" height="75" fill="#f59e0b" fillOpacity="0.8" stroke="#fbbf24" strokeWidth="2" rx="4" />
                <text x="252" y="255" fill="#ffffff" fontSize="15" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {abConstArea}
                </text>
                <text x="252" y="273" fill="#fef3c7" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  ({a} × {b})
                </text>

                {/* Dimension Top Labels */}
                <text x="130" y="38" fill="#60a5fa" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  x = {xVal}
                </text>
                <text x="252" y="38" fill="#34d399" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  a = {a}
                </text>

                {/* Dimension Left Labels */}
                <text x="35" y="135" fill="#60a5fa" fontSize="14" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                  x
                </text>
                <text x="35" y="255" fill="#a78bfa" fontSize="14" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                  b = {b}
                </text>
              </svg>
            </div>

            {/* Algebraic Symbolic Breakdown */}
            <div className="space-y-3 max-w-xs text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold block flex items-center gap-1">
                  <Sparkles size={13} />
                  <span>Geometric Expansion Proof</span>
                </span>
                <MathFormula formula={`(x + ${a})(x + ${b}) = x^2 + (${a}+${b})x + (${a}\\cdot${b})`} block />
                <MathFormula formula={`= x^2 + ${a + b}x + ${a * b}`} block />
                <div className="pt-1 text-[11px] text-slate-300">
                  Total Rectangle Area = ({xVal} + {a}) × ({xVal} + {b}) = <strong className="text-emerald-300 font-mono">{totalArea}</strong>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>🟦 Blue Box: <span className="text-blue-300 font-mono">x² = {xSquareArea}</span></div>
                <div>🟩 Green Strip: <span className="text-emerald-300 font-mono">{a}x = {axArea}</span></div>
                <div>🟪 Purple Strip: <span className="text-purple-300 font-mono">{b}x = {bxArea}</span></div>
                <div>🟨 Amber Corner: <span className="text-amber-300 font-mono">{a}×{b} = {abConstArea}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* SUBMODE 2: BALANCE SCALE ax + b = c */}
        {subMode === "balance" && (
          <div className="flex flex-col items-center justify-center w-full max-w-lg space-y-4">
            <svg width="420" height="220" viewBox="0 0 420 220">
              {/* Stand */}
              <line x1="210" y1="180" x2="210" y2="70" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
              <polygon points="170,200 250,200 210,180" fill="#475569" />

              {/* Fulcrum Pivot */}
              <circle cx="210" cy="70" r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />

              {/* Beam */}
              <line x1="70" y1="70" x2="350" y2="70" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />

              {/* Left Pan Strings & Pan */}
              <line x1="70" y1="70" x2="40" y2="130" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="70" y1="70" x2="100" y2="130" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M 30,130 Q 70,145 110,130" fill="none" stroke="#38bdf8" strokeWidth="4" />

              {/* Left Pan Items: x boxes + 1s */}
              <rect x="50" y="105" width="22" height="22" rx="3" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
              <text x="61" y="120" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">x</text>
              <rect x="75" y="105" width="22" height="22" rx="3" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
              <text x="86" y="120" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">x</text>

              {/* Right Pan Strings & Pan */}
              <line x1="350" y1="70" x2="320" y2="130" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="350" y1="70" x2="380" y2="130" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M 310,130 Q 350,145 390,130" fill="none" stroke="#38bdf8" strokeWidth="4" />

              {/* Right Pan Weight */}
              <circle cx="350" cy="115" r="16" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <text x="350" y="120" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">10</text>
            </svg>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center text-xs space-y-1">
              <span className="text-slate-400 uppercase font-mono text-[10px]">Equation Representation</span>
              <MathFormula formula="2x + 4 = 10 \implies 2x = 6 \implies x = 3" block />
            </div>
          </div>
        )}

        {/* SUBMODE 3: SIMULTANEOUS EQUATIONS */}
        {subMode === "simultaneous" && (
          <div className="w-full max-w-2xl flex flex-col md:flex-row items-center gap-6">
            <svg width="320" height="260" viewBox="0 0 320 260" className="bg-slate-950 border border-slate-800 rounded-lg">
              {/* Axes */}
              <line x1="20" y1="130" x2="300" y2="130" stroke="#475569" strokeWidth="1.5" />
              <line x1="160" y1="20" x2="160" y2="240" stroke="#475569" strokeWidth="1.5" />

              {/* Line 1: y = m1*x + c1 (Blue) */}
              <line
                x1={160 - 120}
                y1={130 - (m1 * -4 + c1) * 20}
                x2={160 + 120}
                y2={130 - (m1 * 4 + c1) * 20}
                stroke="#38bdf8"
                strokeWidth="2.5"
              />

              {/* Line 2: y = m2*x + c2 (Rose) */}
              <line
                x1={160 - 120}
                y1={130 - (m2 * -4 + c2) * 20}
                x2={160 + 120}
                y2={130 - (m2 * 4 + c2) * 20}
                stroke="#f43f5e"
                strokeWidth="2.5"
              />

              {/* Intersection Point */}
              {hasIntersection && (
                <g>
                  <circle
                    cx={160 + intersectX * 20}
                    cy={130 - intersectY * 20}
                    r={6}
                    fill="#34d399"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={160 + intersectX * 20 + 8}
                    y={130 - intersectY * 20 - 8}
                    fill="#34d399"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    ({intersectX.toFixed(1)}, {intersectY.toFixed(1)})
                  </text>
                </g>
              )}
            </svg>

            <div className="space-y-2 text-xs flex-1">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-blue-400 font-mono font-bold block">Line 1 (Blue)</span>
                <MathFormula formula={`y = ${m1.toFixed(1)}x + ${c1.toFixed(1)}`} />
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-rose-400 font-mono font-bold block">Line 2 (Rose)</span>
                <MathFormula formula={`y = ${m2.toFixed(1)}x + ${c2.toFixed(1)}`} />
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-200">
                <span className="text-[10px] font-mono uppercase font-bold block mb-1">Common Solution</span>
                {hasIntersection ? (
                  <MathFormula formula={`(x^*, y^*) = (${intersectX.toFixed(2)}, ${intersectY.toFixed(2)})`} />
                ) : (
                  <span className="text-amber-400">Lines are Parallel (No Unique Intersection)</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
