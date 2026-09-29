import React, { useState } from "react";
import { MathFormula } from "../MathFormula";
import { Activity, Layers, Target, Compass } from "lucide-react";
import { MathEngine } from "../../engine/mathEngine";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const FunctionLab: React.FC<Props> = ({ variables, onVariableChange }) => {
  const [fnType, setFnType] = useState<"quadratic" | "cubic" | "sine" | "rational">("quadratic");

  const a = variables.a ?? 1.0;
  const b = variables.b ?? -2.0;
  const c = variables.c ?? -3.0;
  const probeX = variables.probeX ?? 2.0;

  // Evaluate curve points: domain [-5, 5] mapped to 400x260 SVG
  const SVG_W = 480;
  const SVG_H = 280;
  const ORIGIN_X = 240;
  const ORIGIN_Y = 140;
  const SCALE_X = 35;
  const SCALE_Y = 20;

  const points: { x: number; y: number }[] = [];
  for (let px = -6; px <= 6; px += 0.1) {
    const py = MathEngine.evalFunction(fnType === "quadratic" ? "polynomial" : fnType, px, { a, b, c });
    points.push({ x: px, y: py });
  }

  const svgPath = points
    .filter((p) => Math.abs(p.y) < 20)
    .map((p, i) => {
      const sx = ORIGIN_X + p.x * SCALE_X;
      const sy = ORIGIN_Y - p.y * SCALE_Y;
      return `${i === 0 ? "M" : "L"} ${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");

  // Probe evaluation
  const probeY = MathEngine.evalFunction(fnType === "quadratic" ? "polynomial" : fnType, probeX, { a, b, c });
  const probeSlope = MathEngine.numericalDerivative(fnType === "quadratic" ? "polynomial" : fnType, probeX, { a, b, c });

  // Quadratic roots if applicable
  const quadSolve = MathEngine.solveQuadratic(a, b, c);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Bar */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="text-indigo-400" size={18} />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Universal Function Explorer & Geometry Lab
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono border border-indigo-800/50">
            f(x) Mapping
          </span>
        </div>

        {/* Function Type Selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setFnType("quadratic")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              fnType === "quadratic" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Quadratic (ax²+bx+c)
          </button>
          <button
            onClick={() => setFnType("cubic")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              fnType === "cubic" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Cubic (ax³+bx²+cx)
          </button>
          <button
            onClick={() => setFnType("sine")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              fnType === "sine" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Trigonometric (a·sin(bx+c))
          </button>
          <button
            onClick={() => setFnType("rational")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              fnType === "rational" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Rational (a/(x²+b))
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-3 select-none overflow-hidden">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full max-h-[300px]">
          {/* Grid lines */}
          {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((g) => (
            <React.Fragment key={`grid-${g}`}>
              <line
                x1={ORIGIN_X + g * SCALE_X}
                y1={10}
                x2={ORIGIN_X + g * SCALE_X}
                y2={SVG_H - 10}
                stroke="#1e293b"
                strokeWidth="1"
              />
              <line
                x1={10}
                y1={ORIGIN_Y - g * SCALE_Y}
                x2={SVG_W - 10}
                y2={ORIGIN_Y - g * SCALE_Y}
                stroke="#1e293b"
                strokeWidth="1"
              />
            </React.Fragment>
          ))}

          {/* Coordinate Axes */}
          <line x1={10} y1={ORIGIN_Y} x2={SVG_W - 10} y2={ORIGIN_Y} stroke="#475569" strokeWidth="2" />
          <line x1={ORIGIN_X} y1={10} x2={ORIGIN_X} y2={SVG_H - 10} stroke="#475569" strokeWidth="2" />

          {/* Curve */}
          <path d={svgPath} fill="none" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />

          {/* Probe Point P(x, f(x)) */}
          <g>
            <line
              x1={ORIGIN_X + probeX * SCALE_X}
              y1={ORIGIN_Y}
              x2={ORIGIN_X + probeX * SCALE_X}
              y2={ORIGIN_Y - probeY * SCALE_Y}
              stroke="#ec4899"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
            <circle
              cx={ORIGIN_X + probeX * SCALE_X}
              cy={ORIGIN_Y - probeY * SCALE_Y}
              r={7}
              fill="#ec4899"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={ORIGIN_X + probeX * SCALE_X + 8}
              y={ORIGIN_Y - probeY * SCALE_Y - 8}
              fill="#f472b6"
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
            >
              P({probeX.toFixed(1)}, {probeY.toFixed(1)})
            </text>
          </g>

          {/* Vertex if quadratic */}
          {fnType === "quadratic" && (
            <g>
              <circle
                cx={ORIGIN_X + quadSolve.vertex.x * SCALE_X}
                cy={ORIGIN_Y - quadSolve.vertex.y * SCALE_Y}
                r={5}
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text
                x={ORIGIN_X + quadSolve.vertex.x * SCALE_X + 6}
                y={ORIGIN_Y - quadSolve.vertex.y * SCALE_Y + 14}
                fill="#f59e0b"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
              >
                Vertex V({quadSolve.vertex.x.toFixed(1)}, {quadSolve.vertex.y.toFixed(1)})
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Dynamic Explanation Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-indigo-400 uppercase font-mono font-bold block">
            Mathematical Expression & Properties
          </span>
          {fnType === "quadratic" && (
            <>
              <MathFormula formula={`f(x) = ${a.toFixed(1)}x^2 ${b >= 0 ? "+" : ""}${b.toFixed(1)}x ${c >= 0 ? "+" : ""}${c.toFixed(1)}`} block />
              <div className="text-[11px] text-slate-300">
                Discriminant $\Delta = {quadSolve.discriminant.toFixed(1)}$ ({quadSolve.hasRealRoots ? "2 Real Roots" : "Complex Roots"})
              </div>
            </>
          )}
          {fnType === "sine" && (
            <MathFormula formula={`f(x) = ${a.toFixed(1)} \\sin(${b.toFixed(1)}x ${c >= 0 ? "+" : ""}${c.toFixed(1)})`} block />
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
            Probe & Rate of Change
          </span>
          <div className="text-slate-300 text-[11px]">
            At $x = {probeX.toFixed(1)}$, Output $y = {probeY.toFixed(2)}$ and Local Slope $f'(x) = {probeSlope.toFixed(2)}$.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">Move Probe x:</span>
            <input
              type="range"
              min="-4.0"
              max="4.0"
              step="0.1"
              value={probeX}
              onChange={(e) => onVariableChange("probeX", Number(e.target.value))}
              className="flex-1 accent-pink-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
