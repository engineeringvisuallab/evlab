import React, { useState, useRef } from "react";
import { MathFormula } from "../MathFormula";
import { ArrowLeftRight, HelpCircle, Layers, MoveHorizontal } from "lucide-react";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const NumberLineLab: React.FC<Props> = ({ variables, onVariableChange }) => {
  const [mode, setMode] = useState<"points" | "inequality" | "absolute" | "distance">("points");
  const svgRef = useRef<SVGSVGElement>(null);

  const x1 = variables.x1 ?? 2.5;
  const x2 = variables.x2 ?? -3.0;
  const centerC = variables.centerC ?? 1.0;
  const deltaD = variables.deltaD ?? 2.5;
  const lowerBound = variables.lowerBound ?? -2.0;
  const upperBound = variables.upperBound ?? 4.0;

  // Coordinate mapping: Domain [-10, 10] mapped to SVG width 800
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 320;
  const LINE_Y = 160;
  const X_MIN = -8;
  const X_MAX = 8;

  const toSvgX = (mathX: number) => {
    return ((mathX - X_MIN) / (X_MAX - X_MIN)) * (SVG_WIDTH - 120) + 60;
  };

  const toMathX = (svgX: number) => {
    const clamped = Math.max(60, Math.min(SVG_WIDTH - 60, svgX));
    const val = X_MIN + ((clamped - 60) / (SVG_WIDTH - 120)) * (X_MAX - X_MIN);
    return Math.round(val * 10) / 10;
  };

  const handlePointerDrag = (id: string, e: React.PointerEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const currentSvgX = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH;
    const mathVal = toMathX(currentSvgX);
    onVariableChange(id, mathVal);
  };

  // Generate tick marks
  const ticks = [];
  for (let i = X_MIN; i <= X_MAX; i++) {
    ticks.push(i);
  }

  const distanceVal = Math.abs(x1 - x2);
  const midpointVal = (x1 + x2) / 2;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MoveHorizontal className="text-cyan-400" size={18} />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Interactive Number Line Lab
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/50">
            ℝ Real Continuum
          </span>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setMode("points")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === "points" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Points & Fractions
          </button>
          <button
            onClick={() => setMode("distance")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === "distance" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Distance & Midpoint
          </button>
          <button
            onClick={() => setMode("inequality")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === "inequality" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Intervals [a, b]
          </button>
          <button
            onClick={() => setMode("absolute")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === "absolute" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Absolute Value |x - c| ≤ d
          </button>
        </div>
      </div>

      {/* Main Interactive SVG Viewport */}
      <div className="flex-1 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-2 select-none overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full max-h-[360px]"
        >
          <defs>
            <linearGradient id="intervalGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
            </linearGradient>
            <marker id="arrowRight" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#64748b" />
            </marker>
            <marker id="arrowLeft" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto">
              <polygon points="8 0, 0 4, 8 8" fill="#64748b" />
            </marker>
          </defs>

          {/* Background Grid Accent Lines */}
          {ticks.map((t) => (
            <line
              key={`grid-${t}`}
              x1={toSvgX(t)}
              y1={20}
              x2={toSvgX(t)}
              y2={SVG_HEIGHT - 20}
              stroke="#334155"
              strokeWidth={t === 0 ? "1.5" : "0.5"}
              strokeDasharray={t === 0 ? "none" : "3,3"}
            />
          ))}

          {/* Main Axis Line with Arrows */}
          <line
            x1={40}
            y1={LINE_Y}
            x2={SVG_WIDTH - 40}
            y2={LINE_Y}
            stroke="#94a3b8"
            strokeWidth="3"
            markerStart="url(#arrowLeft)"
            markerEnd="url(#arrowRight)"
          />

          {/* Ticks and Labels */}
          {ticks.map((t) => {
            const sx = toSvgX(t);
            const isZero = t === 0;
            return (
              <g key={`tick-${t}`}>
                <line
                  x1={sx}
                  y1={LINE_Y - (isZero ? 12 : 8)}
                  x2={sx}
                  y2={LINE_Y + (isZero ? 12 : 8)}
                  stroke={isZero ? "#38bdf8" : "#94a3b8"}
                  strokeWidth={isZero ? "2.5" : "1.5"}
                />
                <text
                  x={sx}
                  y={LINE_Y + 28}
                  fill={isZero ? "#38bdf8" : "#94a3b8"}
                  fontSize={isZero ? "14" : "12"}
                  fontWeight={isZero ? "bold" : "normal"}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {t}
                </text>
              </g>
            );
          })}

          {/* MODE: POINTS & FRACTIONS */}
          {mode === "points" && (
            <>
              {/* Point 1 */}
              <g
                className="cursor-ew-resize group"
                onPointerDown={(e) => {
                  const target = e.currentTarget;
                  target.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (e.buttons > 0) handlePointerDrag("x1", e);
                }}
              >
                <circle cx={toSvgX(x1)} cy={LINE_Y} r={9} fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
                <rect
                  x={toSvgX(x1) - 40}
                  y={LINE_Y - 55}
                  width={80}
                  height={30}
                  rx={6}
                  fill="#0284c7"
                  className="shadow-lg"
                />
                <text x={toSvgX(x1)} y={LINE_Y - 35} fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  x₁ = {x1.toFixed(1)}
                </text>
              </g>

              {/* Point 2 */}
              <g
                className="cursor-ew-resize group"
                onPointerDown={(e) => {
                  const target = e.currentTarget;
                  target.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (e.buttons > 0) handlePointerDrag("x2", e);
                }}
              >
                <circle cx={toSvgX(x2)} cy={LINE_Y} r={9} fill="#f43f5e" stroke="#ffffff" strokeWidth="2.5" />
                <rect
                  x={toSvgX(x2) - 40}
                  y={LINE_Y - 55}
                  width={80}
                  height={30}
                  rx={6}
                  fill="#e11d48"
                  className="shadow-lg"
                />
                <text x={toSvgX(x2)} y={LINE_Y - 35} fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  x₂ = {x2.toFixed(1)}
                </text>
              </g>
            </>
          )}

          {/* MODE: DISTANCE & MIDPOINT */}
          {mode === "distance" && (
            <>
              {/* Distance Span Bar */}
              <line
                x1={toSvgX(Math.min(x1, x2))}
                y1={LINE_Y - 18}
                x2={toSvgX(Math.max(x1, x2))}
                y2={LINE_Y - 18}
                stroke="#38bdf8"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Midpoint Marker */}
              <circle cx={toSvgX(midpointVal)} cy={LINE_Y} r={6} fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              <text x={toSvgX(midpointVal)} y={LINE_Y + 48} fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                Midpoint M = {midpointVal.toFixed(2)}
              </text>

              {/* Draggable Handles */}
              <g
                className="cursor-ew-resize"
                onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
                onPointerMove={(e) => {
                  if (e.buttons > 0) handlePointerDrag("x1", e);
                }}
              >
                <circle cx={toSvgX(x1)} cy={LINE_Y} r={9} fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
                <text x={toSvgX(x1)} y={LINE_Y - 32} fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  A ({x1.toFixed(1)})
                </text>
              </g>

              <g
                className="cursor-ew-resize"
                onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
                onPointerMove={(e) => {
                  if (e.buttons > 0) handlePointerDrag("x2", e);
                }}
              >
                <circle cx={toSvgX(x2)} cy={LINE_Y} r={9} fill="#f43f5e" stroke="#ffffff" strokeWidth="2.5" />
                <text x={toSvgX(x2)} y={LINE_Y - 32} fill="#f43f5e" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  B ({x2.toFixed(1)})
                </text>
              </g>
            </>
          )}

          {/* MODE: INEQUALITY INTERVAL */}
          {mode === "inequality" && (
            <>
              {/* Shaded Interval */}
              <rect
                x={toSvgX(Math.min(lowerBound, upperBound))}
                y={LINE_Y - 14}
                width={Math.abs(toSvgX(upperBound) - toSvgX(lowerBound))}
                height={28}
                fill="url(#intervalGradient)"
                rx={4}
              />
              <line
                x1={toSvgX(Math.min(lowerBound, upperBound))}
                y1={LINE_Y}
                x2={toSvgX(Math.max(lowerBound, upperBound))}
                y2={LINE_Y}
                stroke="#38bdf8"
                strokeWidth="6"
              />
              {/* Left Bound Handle */}
              <g
                className="cursor-ew-resize"
                onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
                onPointerMove={(e) => {
                  if (e.buttons > 0) handlePointerDrag("lowerBound", e);
                }}
              >
                <circle cx={toSvgX(lowerBound)} cy={LINE_Y} r={9} fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                <text x={toSvgX(lowerBound)} y={LINE_Y - 26} fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  a = {lowerBound.toFixed(1)}
                </text>
              </g>
              {/* Right Bound Handle */}
              <g
                className="cursor-ew-resize"
                onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
                onPointerMove={(e) => {
                  if (e.buttons > 0) handlePointerDrag("upperBound", e);
                }}
              >
                <circle cx={toSvgX(upperBound)} cy={LINE_Y} r={9} fill="#818cf8" stroke="#ffffff" strokeWidth="2" />
                <text x={toSvgX(upperBound)} y={LINE_Y - 26} fill="#818cf8" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  b = {upperBound.toFixed(1)}
                </text>
              </g>
            </>
          )}

          {/* MODE: ABSOLUTE VALUE INTERVAL */}
          {mode === "absolute" && (
            <>
              {/* Shaded Radius */}
              <rect
                x={toSvgX(centerC - deltaD)}
                y={LINE_Y - 14}
                width={Math.abs(toSvgX(centerC + deltaD) - toSvgX(centerC - deltaD))}
                height={28}
                fill="rgba(245, 158, 11, 0.25)"
                rx={4}
              />
              <line
                x1={toSvgX(centerC - deltaD)}
                y1={LINE_Y}
                x2={toSvgX(centerC + deltaD)}
                y2={LINE_Y}
                stroke="#f59e0b"
                strokeWidth="6"
              />
              {/* Center Handle */}
              <g
                className="cursor-ew-resize"
                onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
                onPointerMove={(e) => {
                  if (e.buttons > 0) handlePointerDrag("centerC", e);
                }}
              >
                <circle cx={toSvgX(centerC)} cy={LINE_Y} r={8} fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x={toSvgX(centerC)} y={LINE_Y - 24} fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  Center c = {centerC.toFixed(1)}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      {/* Bottom Live Calculation & KaTeX Card */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Mathematical Notation</span>
          {mode === "points" && (
            <MathFormula formula={`x_1 = ${x1.toFixed(1)}, \\quad x_2 = ${x2.toFixed(1)} \\in \\mathbb{R}`} block />
          )}
          {mode === "distance" && (
            <MathFormula formula={`d(x_1, x_2) = |x_2 - x_1| = |${x2.toFixed(1)} - (${x1.toFixed(1)})| = ${distanceVal.toFixed(2)}`} block />
          )}
          {mode === "inequality" && (
            <MathFormula formula={`x \\in [${Math.min(lowerBound, upperBound).toFixed(1)}, ${Math.max(lowerBound, upperBound).toFixed(1)}], \\quad ${Math.min(lowerBound, upperBound).toFixed(1)} \\le x \\le ${Math.max(lowerBound, upperBound).toFixed(1)}`} block />
          )}
          {mode === "absolute" && (
            <MathFormula formula={`|x - (${centerC.toFixed(1)})| \\le ${deltaD.toFixed(1)} \\iff ${(centerC - deltaD).toFixed(1)} \\le x \\le ${(centerC + deltaD).toFixed(1)}`} block />
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
          <HelpCircle size={16} className="text-cyan-400 shrink-0" />
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {mode === "points" && "Drag the blue (x₁) or red (x₂) dots along the real line to inspect coordinate mapping and rational approximations."}
            {mode === "distance" && `The distance between A and B is exactly ${distanceVal.toFixed(2)} units. The midpoint sits at ${(midpointVal).toFixed(2)}.`}
            {mode === "inequality" && `Interval of width ${(Math.abs(upperBound - lowerBound)).toFixed(2)} units. Includes all real numbers between the boundary points.`}
            {mode === "absolute" && `Absolute value $|x - c| \\le d$ represents a physical neighborhood of radius ${deltaD.toFixed(1)} around center point ${centerC.toFixed(1)}.`}
          </p>
        </div>
      </div>
    </div>
  );
};
