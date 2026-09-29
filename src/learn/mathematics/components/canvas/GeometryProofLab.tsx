import React, { useState } from "react";
import { MathFormula } from "../MathFormula";
import { Triangle, Circle as CircleIcon, Shapes, CheckCircle2 } from "lucide-react";
import { MathEngine } from "../../engine/mathEngine";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const GeometryProofLab: React.FC<Props> = ({ variables, onVariableChange }) => {
  const [geoMode, setGeoMode] = useState<"pythagoras" | "triangle-angles" | "circle-theorems">("pythagoras");

  const sideA = variables.sideA ?? 3;
  const sideB = variables.sideB ?? 4;

  // Triangle vertices
  const p1 = { x: 0, y: 0 };
  const p2 = { x: sideA * 30, y: 0 };
  const p3 = { x: 0, y: sideB * 30 };

  const sideC = Math.hypot(sideA, sideB);
  const areaA = sideA * sideA;
  const areaB = sideB * sideB;
  const areaC = sideC * sideC;

  // Circle theorem angle
  const centralAngle = variables.centralAngle ?? 80;
  const inscribedAngle = centralAngle / 2;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Controls */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Shapes className="text-emerald-400" size={18} />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Interactive Geometry & Visual Proofs Lab
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono border border-emerald-800/50">
            Euclidean Proofs
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setGeoMode("pythagoras")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
              geoMode === "pythagoras" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Triangle size={13} />
            <span>Pythagorean Theorem (a²+b²=c²)</span>
          </button>
          <button
            onClick={() => setGeoMode("triangle-angles")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
              geoMode === "triangle-angles" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shapes size={13} />
            <span>Triangle Sum (180°)</span>
          </button>
          <button
            onClick={() => setGeoMode("circle-theorems")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
              geoMode === "circle-theorems" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CircleIcon size={13} />
            <span>Circle Inscribed Angle (θ = 2α)</span>
          </button>
        </div>
      </div>

      {/* Main SVG Proof Canvas */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-4 select-none overflow-hidden">
        {/* 1. PYTHAGOREAN THEOREM VISUAL PROOF */}
        {geoMode === "pythagoras" && (
          <div className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-around gap-6">
            <svg width="340" height="300" viewBox="-120 -120 340 300">
              {/* Square on side A (left) */}
              <rect
                x={-sideA * 25}
                y={0}
                width={sideA * 25}
                height={sideA * 25}
                fill="#38bdf8"
                fillOpacity="0.7"
                stroke="#0284c7"
                strokeWidth="2"
              />
              <text x={(-sideA * 25) / 2} y={(sideA * 25) / 2 + 5} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                a² = {areaA}
              </text>

              {/* Square on side B (bottom) */}
              <rect
                x={0}
                y={sideA * 25}
                width={sideB * 25}
                height={sideB * 25}
                fill="#10b981"
                fillOpacity="0.7"
                stroke="#059669"
                strokeWidth="2"
              />
              <text x={(sideB * 25) / 2} y={sideA * 25 + (sideB * 25) / 2 + 5} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                b² = {areaB}
              </text>

              {/* Central Right Triangle */}
              <polygon
                points={`0,0 ${sideB * 25},${sideA * 25} 0,${sideA * 25}`}
                fill="#6366f1"
                fillOpacity="0.8"
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* Hypotenuse Square C (rotated) */}
              <g transform={`translate(0,0) rotate(${-Math.atan2(sideA, sideB) * (180 / Math.PI)})`}>
                <rect
                  x={0}
                  y={-sideC * 25}
                  width={sideC * 25}
                  height={sideC * 25}
                  fill="#f59e0b"
                  fillOpacity="0.7"
                  stroke="#d97706"
                  strokeWidth="2"
                />
                <text x={(sideC * 25) / 2} y={(-sideC * 25) / 2} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  c² = {areaC.toFixed(0)}
                </text>
              </g>
            </svg>

            <div className="space-y-3 max-w-xs text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold block">
                  Geometric Equality
                </span>
                <MathFormula formula={`a^2 + b^2 = c^2`} block />
                <MathFormula formula={`${areaA} + ${areaB} = ${areaC.toFixed(0)}`} block />
                <div className="pt-2 text-[11px] text-slate-300">
                  <MathFormula formula={`c = \\sqrt{a^2+b^2} = ${sideC.toFixed(2)}`} />
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                    <span>Side a</span>
                    <span className="text-cyan-400 font-bold">{sideA}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    step="1"
                    value={sideA}
                    onChange={(e) => onVariableChange("sideA", Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                    <span>Side b</span>
                    <span className="text-emerald-400 font-bold">{sideB}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    step="1"
                    value={sideB}
                    onChange={(e) => onVariableChange("sideB", Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TRIANGLE SUM THEOREM */}
        {geoMode === "triangle-angles" && (
          <div className="w-full max-w-xl flex flex-col items-center space-y-4">
            <svg width="360" height="200" viewBox="0 0 360 200">
              <polygon points="60,160 300,160 180,40" fill="#3b82f6" fillOpacity="0.3" stroke="#60a5fa" strokeWidth="2.5" />
              {/* Vertex Labels & Angles */}
              <text x="50" y="180" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">A (55°)</text>
              <text x="290" y="180" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">B (55°)</text>
              <text x="180" y="25" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">C (70°)</text>

              {/* Parallel Line at Top */}
              <line x1="40" y1="40" x2="320" y2="40" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />
            </svg>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center text-xs space-y-1">
              <span className="text-[10px] text-amber-400 uppercase font-mono font-bold block">Angle Sum Invariance</span>
              <MathFormula formula="\angle A + \angle B + \angle C = 180^\circ = \pi \text{ radians}" block />
            </div>
          </div>
        )}

        {/* 3. CIRCLE THEOREMS */}
        {geoMode === "circle-theorems" && (
          <div className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-around gap-6">
            <svg width="240" height="240" viewBox="-120 -120 240 240">
              <circle cx="0" cy="0" r="100" fill="none" stroke="#475569" strokeWidth="2" />
              <circle cx="0" cy="0" r="4" fill="#f59e0b" />
              <text x="6" y="14" fill="#f59e0b" fontSize="10" fontWeight="bold">O</text>

              {/* Central Angle lines */}
              <line x1="0" y1="0" x2={100 * Math.cos((-centralAngle / 2 * Math.PI) / 180)} y2={100 * Math.sin((-centralAngle / 2 * Math.PI) / 180)} stroke="#f59e0b" strokeWidth="2" />
              <line x1="0" y1="0" x2={100 * Math.cos((centralAngle / 2 * Math.PI) / 180)} y2={100 * Math.sin((centralAngle / 2 * Math.PI) / 180)} stroke="#f59e0b" strokeWidth="2" />

              {/* Inscribed Angle lines to top point */}
              <line x1="-80" y1="-60" x2={100 * Math.cos((-centralAngle / 2 * Math.PI) / 180)} y2={100 * Math.sin((-centralAngle / 2 * Math.PI) / 180)} stroke="#38bdf8" strokeWidth="2" />
              <line x1="-80" y1="-60" x2={100 * Math.cos((centralAngle / 2 * Math.PI) / 180)} y2={100 * Math.sin((centralAngle / 2 * Math.PI) / 180)} stroke="#38bdf8" strokeWidth="2" />
              <circle cx="-80" cy="-60" r="4" fill="#38bdf8" />
            </svg>

            <div className="space-y-3 max-w-xs text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] text-amber-400 uppercase font-mono font-bold block">Inscribed Angle Theorem</span>
                <MathFormula formula={`\\theta_{\\text{central}} = 2 \\times \\alpha_{\\text{inscribed}}`} block />
                <div className="text-slate-300 text-[11px] space-y-1 font-mono">
                  <div>Central Angle: {centralAngle}°</div>
                  <div className="text-cyan-300">Inscribed Angle: {inscribedAngle}°</div>
                </div>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                  <span>Adjust Central Angle (θ)</span>
                  <span className="text-amber-400 font-bold">{centralAngle}°</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="160"
                  step="5"
                  value={centralAngle}
                  onChange={(e) => onVariableChange("centralAngle", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
