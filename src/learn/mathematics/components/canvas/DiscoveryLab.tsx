import React, { useState } from "react";
import { MathFormula } from "../MathFormula";
import { Compass, Lightbulb, CheckCircle2, ChevronRight, RotateCcw, Play, RefreshCw } from "lucide-react";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const DiscoveryLab: React.FC<Props> = ({ variables, onVariableChange }) => {
  const [activeExperiment, setActiveExperiment] = useState<"circle-area" | "secant-tangent" | "pythagoras" | "completing-square" | "large-numbers">("circle-area");

  // Circle Slicing variables
  const wedgeCount = variables.wedgeCount ?? 16;
  const radius = variables.radius ?? 4;

  // Secant to Tangent variables
  const deltaX = variables.deltaX ?? 1.5;
  const x0 = variables.x0 ?? 1.0;

  // Completing the square variables
  const bVal = variables.bVal ?? 4;

  // Large numbers trials
  const [trials, setTrials] = useState<number[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const runCoinSimulation = (n: number) => {
    setIsSimulating(true);
    const newTrials: number[] = [];
    let heads = 0;
    for (let i = 1; i <= n; i++) {
      if (Math.random() < 0.5) heads++;
      newTrials.push(heads / i);
    }
    setTrials(newTrials);
    setIsSimulating(false);
  };

  // Calculus Secant calculation: f(x) = x^2
  const f = (x: number) => x * x;
  const y0 = f(x0);
  const x1 = x0 + deltaX;
  const y1 = f(x1);
  const secantSlope = deltaX !== 0 ? (y1 - y0) / deltaX : 2 * x0;
  const trueDerivative = 2 * x0;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Discovery Navigator */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass className="text-amber-400" size={18} />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Interactive Mathematical Discovery Mode
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-mono border border-amber-800/50">
            Experiment Before Formula
          </span>
        </div>

        {/* Experiment Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveExperiment("circle-area")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeExperiment === "circle-area" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            1. Circle Area (πr²)
          </button>
          <button
            onClick={() => setActiveExperiment("secant-tangent")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeExperiment === "secant-tangent" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            2. Rate of Change (Δx → 0)
          </button>
          <button
            onClick={() => setActiveExperiment("completing-square")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeExperiment === "completing-square" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            3. Completing the Square
          </button>
          <button
            onClick={() => setActiveExperiment("large-numbers")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeExperiment === "large-numbers" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            4. Law of Large Numbers
          </button>
        </div>
      </div>

      {/* Discovery Canvas */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-4 select-none overflow-hidden">
        {/* EXPERIMENT 1: CIRCLE AREA SLICING */}
        {activeExperiment === "circle-area" && (
          <div className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-around gap-6">
            {/* Sliced Circle SVG */}
            <div className="flex flex-col items-center">
              <svg width="220" height="220" viewBox="-110 -110 220 220">
                <circle cx="0" cy="0" r="95" fill="none" stroke="#475569" strokeWidth="2" />
                {Array.from({ length: wedgeCount }).map((_, i) => {
                  const angle1 = (i * 2 * Math.PI) / wedgeCount;
                  const angle2 = ((i + 1) * 2 * Math.PI) / wedgeCount;
                  const x1_ = 95 * Math.cos(angle1);
                  const y1_ = 95 * Math.sin(angle1);
                  const x2_ = 95 * Math.cos(angle2);
                  const y2_ = 95 * Math.sin(angle2);
                  return (
                    <path
                      key={`wedge-${i}`}
                      d={`M 0,0 L ${x1_},${y1_} A 95 95 0 0 1 ${x2_},${y2_} Z`}
                      fill={i % 2 === 0 ? "#38bdf8" : "#f59e0b"}
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
              <span className="text-[11px] text-slate-400 font-mono mt-2">Circle sliced into {wedgeCount} sectors</span>
            </div>

            {/* Rearranged Pseudo-Rectangle */}
            <div className="flex flex-col items-center max-w-xs space-y-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold uppercase font-mono">
                  <Lightbulb size={14} />
                  <span>The Rearrangement Discovery</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As the number of slices increases to infinity ($N \to \infty$), the rearranged sectors form a perfect rectangle with:
                </p>
                <div className="space-y-1 text-xs font-mono">
                  <div className="text-cyan-300">Base = Half Circumference = $\pi r$</div>
                  <div className="text-amber-300">Height = Radius = $r$</div>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <MathFormula formula="\text{Area} = \text{Base} \times \text{Height} = (\pi r) \times r = \pi r^2" block />
                </div>
              </div>

              {/* Slider for sector count */}
              <div className="w-full space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Number of Slices (N)</span>
                  <span className="text-amber-400 font-bold">{wedgeCount}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="64"
                  step="4"
                  value={wedgeCount}
                  onChange={(e) => onVariableChange("wedgeCount", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* EXPERIMENT 2: SECANT TO TANGENT RATE OF CHANGE */}
        {activeExperiment === "secant-tangent" && (
          <div className="w-full max-w-2xl flex flex-col md:flex-row items-center gap-6">
            <svg width="320" height="260" viewBox="0 0 320 260" className="bg-slate-950 border border-slate-800 rounded-lg">
              {/* Coordinate Grid */}
              <line x1="20" y1="220" x2="300" y2="220" stroke="#475569" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="240" stroke="#475569" strokeWidth="1.5" />

              {/* Curve f(x) = x^2 scaled */}
              <path
                d="M 40,220 Q 160,220 280,40"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="3"
              />

              {/* Fixed Point P (x0, y0) */}
              <circle cx={40 + x0 * 70} cy={220 - (y0 / 4) * 180} r={6} fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              <text x={40 + x0 * 70 - 10} y={220 - (y0 / 4) * 180 - 10} fill="#38bdf8" fontSize="11" fontWeight="bold">
                P({x0.toFixed(1)}, {y0.toFixed(1)})
              </text>

              {/* Moving Point Q (x0 + Δx, y1) */}
              <circle cx={40 + x1 * 70} cy={220 - (y1 / 4) * 180} r={6} fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
              <text x={40 + x1 * 70 + 8} y={220 - (y1 / 4) * 180 - 8} fill="#f43f5e" fontSize="11" fontWeight="bold">
                Q
              </text>

              {/* Secant Line connecting P and Q */}
              <line
                x1={40 + (x0 - 0.5) * 70}
                y1={220 - ((y0 - 0.5 * secantSlope) / 4) * 180}
                x2={40 + (x1 + 0.5) * 70}
                y2={220 - ((y1 + 0.5 * secantSlope) / 4) * 180}
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray={deltaX < 0.05 ? "none" : "4,4"}
              />
            </svg>

            {/* Secant -> Tangent Controls & Table */}
            <div className="space-y-3 flex-1 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase">
                  Secant Slope → Instantaneous Derivative
                </span>
                <MathFormula formula={`m_{\\text{secant}} = \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x} = \\frac{${y1.toFixed(2)} - ${y0.toFixed(2)}}{${deltaX.toFixed(2)}} = ${secantSlope.toFixed(3)}`} block />
                <div className="text-emerald-300 font-mono text-[11px]">
                  True Derivative at x₀ = {x0}: f'({x0}) = {trueDerivative.toFixed(3)}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex justify-between font-mono text-slate-300">
                  <span>Step Size (Δx)</span>
                  <span className="text-rose-400 font-bold">{deltaX.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="2.0"
                  step="0.01"
                  value={deltaX}
                  onChange={(e) => onVariableChange("deltaX", Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* EXPERIMENT 3: COMPLETING THE SQUARE */}
        {activeExperiment === "completing-square" && (
          <div className="w-full max-w-2xl flex flex-col md:flex-row items-center gap-6">
            <svg width="280" height="280" viewBox="0 0 280 280">
              {/* x^2 Main Square */}
              <rect x="40" y="40" width="130" height="130" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" rx="4" />
              <text x="105" y="110" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="monospace">x²</text>

              {/* Right strip: (b/2)x */}
              <rect x="175" y="40" width="60" height="130" fill="#10b981" stroke="#34d399" strokeWidth="2" rx="4" />
              <text x="205" y="110" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">({bVal}/2)x</text>

              {/* Bottom strip: (b/2)x */}
              <rect x="40" y="175" width="130" height="60" fill="#10b981" stroke="#34d399" strokeWidth="2" rx="4" />
              <text x="105" y="210" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">({bVal}/2)x</text>

              {/* Missing corner: (b/2)^2 */}
              <rect x="175" y="175" width="60" height="60" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3,3" rx="4" />
              <text x="205" y="210" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">({bVal}/2)²</text>
            </svg>

            <div className="space-y-3 flex-1 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase">
                  Why Add (b/2)² to Complete the Square?
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  We split the linear term <strong className="text-emerald-400">{bVal}x</strong> into two equal halves of <strong className="text-emerald-400">({bVal}/2)x</strong>. To complete the large square of side $(x + {bVal/2})$, we exactly need the missing corner square of area <strong className="text-amber-400">({bVal}/2)² = {Math.pow(bVal/2, 2)}</strong>.
                </p>
                <MathFormula formula={`x^2 + ${bVal}x + \\left(\\frac{${bVal}}{2}\\right)^2 = \\left(x + \\frac{${bVal}}{2}\\right)^2`} block />
              </div>
            </div>
          </div>
        )}

        {/* EXPERIMENT 4: LAW OF LARGE NUMBERS */}
        {activeExperiment === "large-numbers" && (
          <div className="w-full max-w-2xl flex flex-col items-center space-y-4">
            <div className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg relative overflow-hidden flex items-end px-4 pb-4">
              {/* 50% Target Line */}
              <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-emerald-500/70 z-10 flex items-center justify-end pr-2">
                <span className="text-[10px] text-emerald-400 font-mono bg-slate-900 px-1 rounded">Theoretical 0.500</span>
              </div>

              {/* Simulation Curve */}
              {trials.length > 0 && (
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${trials.length} 100`}>
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    points={trials.map((p, idx) => `${idx},${(1 - p) * 100}`).join(" ")}
                  />
                </svg>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => runCoinSimulation(50)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700"
              >
                Run 50 Trials
              </button>
              <button
                onClick={() => runCoinSimulation(500)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700"
              >
                Run 500 Trials
              </button>
              <button
                onClick={() => runCoinSimulation(2000)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-mono text-white font-bold shadow-md"
              >
                Run 2000 Trials (Smooth Convergence)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
