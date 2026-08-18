import React, { useState } from "react";
import { MathFormula } from "../MathFormula";
import { Maximize, HelpCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const LimitContinuityCanvas: React.FC<Props> = ({ variables, onVariableChange }) => {
  const [fnType, setFnType] = useState<"hole" | "jump" | "continuous">("hole");

  const targetA = variables.targetA ?? 2.0;
  const currentX = variables.currentX ?? 1.6;
  const epsilon = variables.epsilon ?? 0.6;
  const delta = variables.delta ?? 0.3;

  // SVG parameters
  const SVG_W = 480;
  const SVG_H = 280;
  const ORIGIN_X = 140;
  const ORIGIN_Y = 200;
  const SCALE_X = 50;
  const SCALE_Y = 35;

  // Evaluate function depending on type
  const evalFn = (x: number): { y: number; isHole: boolean } => {
    if (fnType === "hole") {
      // (x^2 - 4)/(x - 2) = x + 2 for x != 2
      if (Math.abs(x - targetA) < 0.02) {
        return { y: targetA + 2, isHole: true };
      }
      return { y: x + 2, isHole: false };
    } else if (fnType === "jump") {
      // Step function jump at x = targetA
      return { y: x < targetA ? 1.5 : 4.0, isHole: false };
    } else {
      // Continuous
      return { y: 0.5 * x * x + 1.0, isHole: false };
    }
  };

  // Limiting value L
  const limitL = fnType === "hole" ? targetA + 2 : fnType === "jump" ? 4.0 : 0.5 * targetA * targetA + 1.0;
  const leftLimit = fnType === "hole" ? targetA + 2 : fnType === "jump" ? 1.5 : limitL;
  const rightLimit = fnType === "hole" ? targetA + 2 : fnType === "jump" ? 4.0 : limitL;
  const limitExists = Math.abs(leftLimit - rightLimit) < 1e-4;

  const probeEval = evalFn(currentX);
  const distFromTarget = Math.abs(currentX - targetA);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Controls */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Maximize className="text-cyan-400" size={18} />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Limits & Epsilon-Delta Continuity Lab
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/50">
            lim_{"{x→a}"} f(x)
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setFnType("hole")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              fnType === "hole" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Removable Hole (0/0)
          </button>
          <button
            onClick={() => setFnType("jump")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              fnType === "jump" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Jump Discontinuity (Left ≠ Right)
          </button>
          <button
            onClick={() => setFnType("continuous")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              fnType === "continuous" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Continuous Curve
          </button>
        </div>
      </div>

      {/* Main SVG Viewport */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-3 select-none overflow-hidden">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full max-h-[300px]">
          {/* Epsilon-Delta Shading Box */}
          <rect
            x={ORIGIN_X + (targetA - delta) * SCALE_X}
            y={ORIGIN_Y - (limitL + epsilon) * SCALE_Y}
            width={2 * delta * SCALE_X}
            height={2 * epsilon * SCALE_Y}
            fill="rgba(56, 189, 248, 0.12)"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="3,3"
          />

          {/* Coordinate Axes */}
          <line x1={30} y1={ORIGIN_Y} x2={SVG_W - 30} y2={ORIGIN_Y} stroke="#475569" strokeWidth="2" />
          <line x1={ORIGIN_X} y1={20} x2={ORIGIN_X} y2={SVG_H - 20} stroke="#475569" strokeWidth="2" />

          {/* Axis Labels */}
          <text x={SVG_W - 25} y={ORIGIN_Y + 15} fill="#64748b" fontSize="11" fontFamily="monospace">x</text>
          <text x={ORIGIN_X + 10} y={30} fill="#64748b" fontSize="11" fontFamily="monospace">y</text>

          {/* Target A & Limit L Guidelines */}
          <line
            x1={ORIGIN_X + targetA * SCALE_X}
            y1={ORIGIN_Y}
            x2={ORIGIN_X + targetA * SCALE_X}
            y2={ORIGIN_Y - limitL * SCALE_Y}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <line
            x1={ORIGIN_X}
            y1={ORIGIN_Y - limitL * SCALE_Y}
            x2={ORIGIN_X + targetA * SCALE_X}
            y2={ORIGIN_Y - limitL * SCALE_Y}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <text x={ORIGIN_X + targetA * SCALE_X} y={ORIGIN_Y + 16} fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            a = {targetA.toFixed(1)}
          </text>
          <text x={ORIGIN_X - 10} y={ORIGIN_Y - limitL * SCALE_Y + 4} fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="end" fontFamily="monospace">
            L = {limitL.toFixed(1)}
          </text>

          {/* Curve Rendering */}
          {fnType === "hole" && (
            <>
              <line
                x1={ORIGIN_X + -1 * SCALE_X}
                y1={ORIGIN_Y - 1 * SCALE_Y}
                x2={ORIGIN_X + 5 * SCALE_X}
                y2={ORIGIN_Y - 7 * SCALE_Y}
                stroke="#818cf8"
                strokeWidth="3"
              />
              {/* Hole marker (empty circle) */}
              <circle
                cx={ORIGIN_X + targetA * SCALE_X}
                cy={ORIGIN_Y - (targetA + 2) * SCALE_Y}
                r={5}
                fill="#020617"
                stroke="#f43f5e"
                strokeWidth="2.5"
              />
            </>
          )}

          {fnType === "jump" && (
            <>
              {/* Left piece */}
              <line
                x1={ORIGIN_X + -1 * SCALE_X}
                y1={ORIGIN_Y - 1.5 * SCALE_Y}
                x2={ORIGIN_X + targetA * SCALE_X}
                y2={ORIGIN_Y - 1.5 * SCALE_Y}
                stroke="#818cf8"
                strokeWidth="3"
              />
              <circle cx={ORIGIN_X + targetA * SCALE_X} cy={ORIGIN_Y - 1.5 * SCALE_Y} r={4} fill="#020617" stroke="#818cf8" strokeWidth="2" />

              {/* Right piece */}
              <line
                x1={ORIGIN_X + targetA * SCALE_X}
                y1={ORIGIN_Y - 4.0 * SCALE_Y}
                x2={ORIGIN_X + 5 * SCALE_X}
                y2={ORIGIN_Y - 4.0 * SCALE_Y}
                stroke="#818cf8"
                strokeWidth="3"
              />
              <circle cx={ORIGIN_X + targetA * SCALE_X} cy={ORIGIN_Y - 4.0 * SCALE_Y} r={4} fill="#818cf8" />
            </>
          )}

          {/* Moving Probe Point P */}
          <g>
            <circle
              cx={ORIGIN_X + currentX * SCALE_X}
              cy={ORIGIN_Y - probeEval.y * SCALE_Y}
              r={7}
              fill="#ec4899"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={ORIGIN_X + currentX * SCALE_X + 8}
              y={ORIGIN_Y - probeEval.y * SCALE_Y - 8}
              fill="#f472b6"
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
            >
              x = {currentX.toFixed(2)}, f(x) = {probeEval.y.toFixed(2)}
            </text>
          </g>
        </svg>
      </div>

      {/* Dynamic Explanation & Slider Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold block">
            Left and Right-Hand Limits
          </span>
          <div className="text-slate-300 font-mono text-[11px] space-y-0.5">
            <div>$\lim_{"{x \\to a^-}"} f(x) = {leftLimit.toFixed(2)}$ (Approaching from left)</div>
            <div>$\lim_{"{x \\to a^+}"} f(x) = {rightLimit.toFixed(2)}$ (Approaching from right)</div>
          </div>
          <div className="pt-1">
            {limitExists ? (
              <span className="text-emerald-400 font-mono font-bold">
                ✓ Two-sided limit exists: $\lim_{"{x \\to a}"} f(x) = {limitL.toFixed(2)}$
              </span>
            ) : (
              <span className="text-rose-400 font-mono font-bold">
                ✗ Limit does NOT exist (Jump discontinuity)
              </span>
            )}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex justify-between text-slate-300 font-mono text-[11px]">
            <span>Approach Target a: Move Probe x</span>
            <span className="text-pink-400 font-bold">x = {currentX.toFixed(2)} (|x-a| = {distFromTarget.toFixed(2)})</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.5"
            step="0.02"
            value={currentX}
            onChange={(e) => onVariableChange("currentX", Number(e.target.value))}
            className="w-full accent-pink-500 cursor-pointer"
          />
          <p className="text-[10px] text-slate-400">
            {fnType === "hole" && "Even though f(2) is undefined (0/0), as x gets arbitrarily close to 2 from either side, f(x) approaches 4.00 perfectly."}
            {fnType === "jump" && "Approaching from the left yields y = 1.5, while approaching from the right yields y = 4.0. Hence no common limit exists."}
          </p>
        </div>
      </div>
    </div>
  );
};
