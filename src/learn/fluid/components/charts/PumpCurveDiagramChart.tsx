/**
 * EVLab Pump Head-Capacity & System Resistance Interaction Chart
 */

import React from 'react';

interface PumpCurveDiagramChartProps {
  shutoffHead_H0?: number;
  maxDischarge_Qmax?: number;
  staticHead?: number;
  operatingQ_m3s?: number;
  operatingH_m?: number;
  operatingEfficiency?: number;
}

export const PumpCurveDiagramChart: React.FC<PumpCurveDiagramChartProps> = ({
  shutoffHead_H0 = 55,
  maxDischarge_Qmax = 0.12,
  staticHead = 25,
  operatingQ_m3s = 0.052,
  operatingH_m = 44.8,
  operatingEfficiency = 0.81,
}) => {
  const width = 600;
  const height = 300;
  const margin = { top: 30, right: 45, bottom: 45, left: 55 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const maxQ = maxDischarge_Qmax * 1.15;
  const maxH = Math.max(shutoffHead_H0, operatingH_m, 60) * 1.15;

  const scaleX = (q: number) => margin.left + (q / maxQ) * plotW;
  const scaleY = (h: number) => margin.top + (1 - h / maxH) * plotH;

  // Pump Curve points: H_pump(Q) = H0 - (H0 / Qmax^2) * Q^2
  const pumpPoints: { x: number; y: number }[] = [];
  const aCoeff = shutoffHead_H0 / Math.pow(maxDischarge_Qmax, 2);
  for (let q = 0; q <= maxDischarge_Qmax; q += maxDischarge_Qmax / 40) {
    const head = Math.max(0, shutoffHead_H0 - aCoeff * Math.pow(q, 2));
    pumpPoints.push({ x: scaleX(q), y: scaleY(head) });
  }

  // System Resistance Curve: H_sys(Q) = H_static + K_sys * Q^2
  const kSys = (operatingH_m - staticHead) / Math.pow(Math.max(0.001, operatingQ_m3s), 2);
  const sysPoints: { x: number; y: number }[] = [];
  for (let q = 0; q <= maxDischarge_Qmax * 1.05; q += maxDischarge_Qmax / 40) {
    const head = staticHead + kSys * Math.pow(q, 2);
    if (head <= maxH) {
      sysPoints.push({ x: scaleX(q), y: scaleY(head) });
    }
  }

  const opX = scaleX(operatingQ_m3s);
  const opY = scaleY(operatingH_m);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Pump H-Q & System Demand Operating Point</span>
        </h4>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
          Q_op: {(operatingQ_m3s * 1000).toFixed(1)} L/s | H_op: {operatingH_m.toFixed(1)} m | η: {(operatingEfficiency * 100).toFixed(0)}%
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl h-auto select-none">
        <rect x={margin.left} y={margin.top} width={plotW} height={plotH} fill="#0b0f19" stroke="#334155" />

        {/* Head Axis Grid */}
        {[0, 15, 30, 45, 60].filter((v) => v <= maxH).map((v) => (
          <g key={v}>
            <line x1={margin.left} y1={scaleY(v)} x2={margin.left + plotW} y2={scaleY(v)} stroke="#1e293b" strokeDasharray="3 3" />
            <text x={margin.left - 8} y={scaleY(v) + 4} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">
              {v}m
            </text>
          </g>
        ))}

        {/* Discharge Axis Grid */}
        {[0.02, 0.04, 0.06, 0.08, 0.1, 0.12].filter((v) => v <= maxQ).map((v) => (
          <g key={v}>
            <line x1={scaleX(v)} y1={margin.top} x2={scaleX(v)} y2={margin.top + plotH} stroke="#1e293b" strokeDasharray="3 3" />
            <text x={scaleX(v)} y={margin.top + plotH + 16} fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
              {(v * 1000).toFixed(0)}
            </text>
          </g>
        ))}

        {/* Static Head Baseline */}
        <line x1={margin.left} y1={scaleY(staticHead)} x2={margin.left + plotW} y2={scaleY(staticHead)} stroke="#64748b" strokeDasharray="4 4" />
        <text x={margin.left + 10} y={scaleY(staticHead) - 5} fill="#94a3b8" fontSize="9" fontFamily="monospace">
          Static Lift H_static = {staticHead}m
        </text>

        {/* Pump Characteristic Curve */}
        <polyline
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="3"
          points={pumpPoints.map((p) => `${p.x},${p.y}`).join(' ')}
        />
        <text x={scaleX(maxDischarge_Qmax * 0.2)} y={scaleY(shutoffHead_H0 * 0.95) - 6} fill="#0ea5e9" fontSize="10" fontWeight="bold" fontFamily="monospace">
          Pump Head Curve H(Q)
        </text>

        {/* System Resistance Curve */}
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          points={sysPoints.map((p) => `${p.x},${p.y}`).join(' ')}
        />
        <text x={scaleX(maxDischarge_Qmax * 0.7)} y={scaleY(operatingH_m * 1.05) - 6} fill="#f59e0b" fontSize="10" fontWeight="bold" fontFamily="monospace">
          System Head H_sys(Q)
        </text>

        {/* Operating Point Intersection Indicator */}
        <circle cx={opX} cy={opY} r="8" fill="rgba(16, 185, 129, 0.3)" />
        <circle cx={opX} cy={opY} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
        <line x1={opX} y1={margin.top + plotH} x2={opX} y2={opY} stroke="#10b981" strokeDasharray="3 3" />
        <line x1={margin.left} y1={opY} x2={opX} y2={opY} stroke="#10b981" strokeDasharray="3 3" />

        <text x={opX + 10} y={opY - 10} fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">
          Duty Point ({(operatingQ_m3s * 1000).toFixed(1)} L/s, {operatingH_m.toFixed(1)}m)
        </text>

        {/* Axes Labels */}
        <text x={margin.left + plotW / 2} y={height - 8} fill="#cbd5e1" fontSize="11" fontWeight="600" textAnchor="middle">
          Discharge Flow Rate Q (L/s)
        </text>

        <text x={14} y={margin.top + plotH / 2} fill="#cbd5e1" fontSize="11" fontWeight="600" textAnchor="middle" transform={`rotate(-90 14 ${margin.top + plotH / 2})`}>
          Total Dynamic Head H (m)
        </text>
      </svg>
    </div>
  );
};
