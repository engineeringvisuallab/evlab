/**
 * EVLab Hydraulic Grade Line (HGL) & Energy Grade Line (EGL) Longitudinal Chart
 */

import React from 'react';

interface HglEglDiagramChartProps {
  z1?: number;
  z2?: number;
  p1_gamma?: number;
  p2_gamma?: number;
  v1_2g?: number;
  v2_2g?: number;
  pipeLength?: number;
  headLoss?: number;
}

export const HglEglDiagramChart: React.FC<HglEglDiagramChartProps> = ({
  z1 = 10,
  z2 = 4,
  p1_gamma = 15,
  p2_gamma = 18,
  v1_2g = 0.5,
  v2_2g = 1.8,
  pipeLength = 100,
  headLoss = 2.7,
}) => {
  const width = 600;
  const height = 280;
  const margin = { top: 30, right: 40, bottom: 40, left: 55 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // Station 1 values
  const pipeElevation1 = z1;
  const hgl1 = z1 + p1_gamma;
  const egl1 = hgl1 + v1_2g;

  // Station 2 values
  const pipeElevation2 = z2;
  const hgl2 = z2 + p2_gamma;
  const egl2 = hgl2 + v2_2g;

  const maxVal = Math.max(egl1, egl2, 30) * 1.15;
  const minVal = 0;

  const scaleX = (station: number) => margin.left + (station / pipeLength) * plotW;
  const scaleY = (val: number) => margin.top + (1 - (val - minVal) / (maxVal - minVal)) * plotH;

  const x1 = scaleX(0);
  const x2 = scaleX(pipeLength);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
          <span>Pipeline EGL / HGL Grade Profile</span>
        </h4>
        <div className="text-xs text-slate-400 font-mono">
          Length: {pipeLength}m | Total Head Loss h_L: {headLoss.toFixed(2)}m
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl h-auto select-none">
        {/* Background & Datum */}
        <rect x={margin.left} y={margin.top} width={plotW} height={plotH} fill="#0b0f19" stroke="#334155" />

        {/* Y Axis Grid */}
        {[0, 10, 20, 30, 40].filter((v) => v <= maxVal).map((v) => (
          <g key={v}>
            <line x1={margin.left} y1={scaleY(v)} x2={margin.left + plotW} y2={scaleY(v)} stroke="#1e293b" strokeDasharray="3 3" />
            <text x={margin.left - 8} y={scaleY(v) + 4} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">
              {v}m
            </text>
          </g>
        ))}

        {/* Pipe Centerline */}
        <line x1={x1} y1={scaleY(pipeElevation1)} x2={x2} y2={scaleY(pipeElevation2)} stroke="#94a3b8" strokeWidth="4" />
        <text x={x1 + 10} y={scaleY(pipeElevation1) + 15} fill="#94a3b8" fontSize="10" fontFamily="monospace">
          Pipe z₁ = {z1}m
        </text>
        <text x={x2 - 80} y={scaleY(pipeElevation2) + 15} fill="#94a3b8" fontSize="10" fontFamily="monospace">
          Pipe z₂ = {z2}m
        </text>

        {/* HGL (Hydraulic Grade Line: z + P/γ) */}
        <line x1={x1} y1={scaleY(hgl1)} x2={x2} y2={scaleY(hgl2)} stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="5 4" />
        <circle cx={x1} cy={scaleY(hgl1)} r="4" fill="#38bdf8" />
        <circle cx={x2} cy={scaleY(hgl2)} r="4" fill="#38bdf8" />
        <text x={x1 + 20} y={scaleY(hgl1) - 6} fill="#38bdf8" fontSize="10" fontFamily="monospace">
          HGL₁ ({hgl1.toFixed(1)}m)
        </text>
        <text x={x2 - 80} y={scaleY(hgl2) - 6} fill="#38bdf8" fontSize="10" fontFamily="monospace">
          HGL₂ ({hgl2.toFixed(1)}m)
        </text>

        {/* EGL (Energy Grade Line: HGL + V²/2g) */}
        <line x1={x1} y1={scaleY(egl1)} x2={x2} y2={scaleY(egl2)} stroke="#ef4444" strokeWidth="2.5" />
        <circle cx={x1} cy={scaleY(egl1)} r="4" fill="#ef4444" />
        <circle cx={x2} cy={scaleY(egl2)} r="4" fill="#ef4444" />
        <text x={x1 + 20} y={scaleY(egl1) - 8} fill="#ef4444" fontSize="10" fontWeight="bold" fontFamily="monospace">
          EGL₁ ({egl1.toFixed(1)}m)
        </text>
        <text x={x2 - 80} y={scaleY(egl2) - 8} fill="#ef4444" fontSize="10" fontWeight="bold" fontFamily="monospace">
          EGL₂ ({egl2.toFixed(1)}m)
        </text>

        {/* Head Loss Indicator on Right */}
        <line x1={x2 + 8} y1={scaleY(egl1)} x2={x2 + 8} y2={scaleY(egl2)} stroke="#f59e0b" strokeWidth="2" />
        <text x={x2 + 14} y={(scaleY(egl1) + scaleY(egl2)) / 2 + 3} fill="#f59e0b" fontSize="9" fontFamily="monospace">
          h_L = {headLoss.toFixed(2)}m
        </text>

        {/* Axis Titles */}
        <text x={margin.left + plotW / 2} y={height - 8} fill="#94a3b8" fontSize="10" textAnchor="middle">
          Pipeline Station (m)
        </text>
      </svg>
    </div>
  );
};
