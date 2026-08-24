/**
 * EVLab Interactive Engineering Moody Diagram
 * High-precision log-log friction factor chart with live operating marker.
 */

import React, { useMemo } from 'react';
import { solveFrictionFactor } from '../../core/frictionFactor';

interface MoodyDiagramChartProps {
  currentRe?: number;
  currentRoughnessRatio?: number;
  currentFrictionFactor?: number;
}

export const MoodyDiagramChart: React.FC<MoodyDiagramChartProps> = ({
  currentRe = 75000,
  currentRoughnessRatio = 0.001,
  currentFrictionFactor = 0.022,
}) => {
  // Chart coordinate transformation functions (Log-Log)
  const xMin = 600; // Re min
  const xMax = 100000000; // Re 10^8
  const yMin = 0.008; // f min
  const yMax = 0.1; // f max

  const width = 640;
  const height = 360;
  const margin = { top: 25, right: 35, bottom: 45, left: 55 };

  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const logXMin = Math.log10(xMin);
  const logXMax = Math.log10(xMax);
  const logYMin = Math.log10(yMin);
  const logYMax = Math.log10(yMax);

  const scaleX = (re: number) => {
    const val = Math.max(xMin, Math.min(xMax, re));
    const logVal = Math.log10(val);
    return margin.left + ((logVal - logXMin) / (logXMax - logXMin)) * plotW;
  };

  const scaleY = (f: number) => {
    const val = Math.max(yMin, Math.min(yMax, f));
    const logVal = Math.log10(val);
    return margin.top + (1 - (logVal - logYMin) / (logYMax - logYMin)) * plotH;
  };

  // Generate Roughness curve lines: ε/D = [0 (smooth), 0.0001, 0.0005, 0.001, 0.005, 0.01, 0.02, 0.05]
  const roughnessValues = [0, 0.0001, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05];

  const curves = useMemo(() => {
    return roughnessValues.map((roughness) => {
      const points: { x: number; y: number }[] = [];
      for (let logRe = 3.6; logRe <= 8.0; logRe += 0.08) {
        const re = Math.pow(10, logRe);
        const res = solveFrictionFactor(re, roughness);
        points.push({ x: scaleX(re), y: scaleY(res.f) });
      }
      return { roughness, points };
    });
  }, []);

  // Laminar line: f = 64 / Re from Re = 600 to 2300
  const laminarPoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let re = 600; re <= 2300; re += 50) {
      pts.push({ x: scaleX(re), y: scaleY(64 / re) });
    }
    return pts;
  }, []);

  const markerX = scaleX(currentRe);
  const markerY = scaleY(currentFrictionFactor);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
          <span>Moody Friction Factor Diagram (Log-Log)</span>
        </h4>
        <div className="text-xs font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
          Re: {currentRe.toExponential(2)} | ε/D: {currentRoughnessRatio.toFixed(5)} | f: {currentFrictionFactor.toFixed(4)}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-2xl h-auto select-none">
        {/* Grid Background */}
        <rect x={margin.left} y={margin.top} width={plotW} height={plotH} fill="#0b0f19" stroke="#334155" />

        {/* Transition Zone Box (Re 2000 - 4000) */}
        <rect
          x={scaleX(2000)}
          y={margin.top}
          width={scaleX(4000) - scaleX(2000)}
          height={plotH}
          fill="rgba(245, 158, 11, 0.08)"
        />
        <text
          x={(scaleX(2000) + scaleX(4000)) / 2}
          y={margin.top + 20}
          fill="#f59e0b"
          fontSize="9"
          textAnchor="middle"
          fontFamily="monospace"
        >
          Transition
        </text>

        {/* Log X Grid lines */}
        {[1e3, 1e4, 1e5, 1e6, 1e7, 1e8].map((val) => {
          const x = scaleX(val);
          return (
            <g key={val}>
              <line x1={x} y1={margin.top} x2={x} y2={margin.top + plotH} stroke="#1e293b" strokeDasharray="3 3" />
              <text x={x} y={margin.top + plotH + 16} fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                10{Math.log10(val) === 3 ? '³' : Math.log10(val) === 4 ? '⁴' : Math.log10(val) === 5 ? '⁵' : Math.log10(val) === 6 ? '⁶' : Math.log10(val) === 7 ? '⁷' : '⁸'}
              </text>
            </g>
          );
        })}

        {/* Log Y Grid lines */}
        {[0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1].map((val) => {
          const y = scaleY(val);
          return (
            <g key={val}>
              <line x1={margin.left} y1={y} x2={margin.left + plotW} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
              <text x={margin.left - 8} y={y + 3} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">
                {val.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Laminar Line */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          points={laminarPoints.map((p) => `${p.x},${p.y}`).join(' ')}
        />
        <text x={scaleX(1000)} y={scaleY(0.064) - 8} fill="#10b981" fontSize="9" fontFamily="monospace">
          Laminar: f = 64/Re
        </text>

        {/* Turbulent Roughness Curves */}
        {curves.map((c, idx) => (
          <g key={idx}>
            <polyline
              fill="none"
              stroke={c.roughness === 0 ? '#38bdf8' : '#64748b'}
              strokeWidth={c.roughness === 0 ? '2' : '1.2'}
              points={c.points.map((p) => `${p.x},${p.y}`).join(' ')}
            />
            {c.points.length > 0 && (
              <text
                x={c.points[c.points.length - 1].x + 3}
                y={c.points[c.points.length - 1].y + 3}
                fill="#94a3b8"
                fontSize="8"
                fontFamily="monospace"
              >
                {c.roughness === 0 ? 'Smooth' : c.roughness}
              </text>
            )}
          </g>
        ))}

        {/* Active Operating Point Marker */}
        <circle cx={markerX} cy={markerY} r="8" fill="rgba(239, 68, 68, 0.3)" />
        <circle cx={markerX} cy={markerY} r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
        <line x1={markerX} y1={margin.top + plotH} x2={markerX} y2={markerY} stroke="#ef4444" strokeDasharray="2 2" />
        <line x1={margin.left} y1={markerY} x2={markerX} y2={markerY} stroke="#ef4444" strokeDasharray="2 2" />

        {/* Axis Labels */}
        <text
          x={margin.left + plotW / 2}
          y={height - 8}
          fill="#cbd5e1"
          fontSize="11"
          fontWeight="600"
          textAnchor="middle"
        >
          Reynolds Number (Re = ρVD / μ)
        </text>

        <text
          x={14}
          y={margin.top + plotH / 2}
          fill="#cbd5e1"
          fontSize="11"
          fontWeight="600"
          textAnchor="middle"
          transform={`rotate(-90 14 ${margin.top + plotH / 2})`}
        >
          Darcy Friction Factor (f)
        </text>
      </svg>
    </div>
  );
};
