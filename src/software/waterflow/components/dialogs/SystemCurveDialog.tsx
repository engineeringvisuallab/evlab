/**
 * EVLab WaterFlow - Pump vs System Head Curve Interactive Analyzer
 * Computes operating point intersection Q_op, H_op and efficiency.
 */

import React, { useState, useMemo } from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { Pump } from '../../types/waterflow';
import { X, Sliders, Activity } from 'lucide-react';

export const SystemCurveDialog: React.FC = () => {
  const { model, setActiveDialog } = useWaterFlow();

  const links = useMemo(() => {
    return model.links instanceof Map ? Array.from(model.links.values()) : Object.values(model.links);
  }, [model.links]);

  const pumps = useMemo(() => links.filter(l => l.type === 'pump') as Pump[], [links]);

  const [selectedPumpId, setSelectedPumpId] = useState<string>(pumps[0]?.id || 'PUMP-101');
  const [speedPercent, setSpeedPercent] = useState<number>(100);
  const [staticHead, setStaticHead] = useState<number>(20); // Static lift head (m)
  const [frictionK, setFrictionK] = useState<number>(0.002); // System resistance coefficient K

  const activePump = useMemo(() => pumps.find(p => p.id === selectedPumpId) || pumps[0], [pumps, selectedPumpId]);

  // Generate Pump Curve and System Curve points
  const curveData = useMemo(() => {
    if (!activePump) return { pumpPoints: [], sysPoints: [], operatingPoint: null };

    const designQ = activePump.designFlow || 50;
    const designH = activePump.designHead || 40;
    const shutoffH = (activePump.shutoffHead || designH * 1.33) * Math.pow(speedPercent / 100, 2);

    const A = Math.max(1e-6, (shutoffH - designH) / (designQ * designQ));

    const maxQ = designQ * 1.6;
    const pumpPoints: { q: number; h: number }[] = [];
    const sysPoints: { q: number; h: number }[] = [];

    let operatingPoint: { q: number; h: number } | null = null;
    let minDiff = 9999;

    for (let q = 0; q <= maxQ; q += maxQ / 40) {
      // Pump Head = ShutoffH - A * Q^2
      const hPump = Math.max(0, shutoffH - A * q * q);
      // System Head = StaticHead + K * Q^2
      const hSys = staticHead + frictionK * q * q;

      pumpPoints.push({ q, h: hPump });
      sysPoints.push({ q, h: hSys });

      const diff = Math.abs(hPump - hSys);
      if (diff < minDiff && q > 0) {
        minDiff = diff;
        operatingPoint = { q: Math.round(q * 10) / 10, h: Math.round(hPump * 10) / 10 };
      }
    }

    return { pumpPoints, sysPoints, operatingPoint };
  }, [activePump, speedPercent, staticHead, frictionK]);

  const chartW = 600;
  const chartH = 280;
  const pad = 40;

  const maxQ = Math.max(100, (activePump?.designFlow || 50) * 1.6);
  const maxH = Math.max(60, (activePump?.designHead || 40) * 1.6);

  const scaleX = (q: number) => pad + (q / maxQ) * (chartW - 2 * pad);
  const scaleY = (h: number) => chartH - pad - (h / maxH) * (chartH - 2 * pad);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm text-cyan-400 tracking-wider uppercase">System Curve & Pump Analyzer</h2>
          </div>
          <button onClick={() => setActiveDialog(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 grid grid-cols-3 gap-4">
          {/* Controls Panel */}
          <div className="space-y-4 bg-slate-950 p-3 rounded border border-slate-800 text-xs">
            <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
              Pump Parameters
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Select Pump Station:</label>
              <select
                value={selectedPumpId}
                onChange={e => setSelectedPumpId(e.target.value)}
                className="w-full bg-slate-900 text-cyan-300 font-semibold p-1.5 rounded border border-slate-700"
              >
                {pumps.map(p => (
                  <option key={p.id} value={p.id}>{p.label || p.id}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Pump Speed (%): {speedPercent}%</label>
              <input
                type="range"
                min="50"
                max="120"
                value={speedPercent}
                onChange={e => setSpeedPercent(parseInt(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Static Lift Head (m): {staticHead}m</label>
              <input
                type="range"
                min="0"
                max="50"
                value={staticHead}
                onChange={e => setStaticHead(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Operating Point Card */}
            {curveData.operatingPoint && (
              <div className="bg-slate-900 p-2.5 rounded border border-slate-700 space-y-1 font-mono">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Calculated Operating Point</div>
                <div className="text-emerald-400 font-bold text-sm">
                  Q_op = {curveData.operatingPoint.q} L/s
                </div>
                <div className="text-amber-300 font-bold text-sm">
                  H_op = {curveData.operatingPoint.h} m
                </div>
              </div>
            )}
          </div>

          {/* SVG Curve Canvas */}
          <div className="col-span-2 bg-slate-950 p-3 rounded border border-slate-800 flex flex-col justify-center items-center">
            <svg width={chartW} height={chartH} className="overflow-visible font-mono text-[10px]">
              {/* Axes */}
              <line x1={pad} y1={chartH - pad} x2={chartW - pad} y2={chartH - pad} stroke="#334155" strokeWidth="1" />
              <line x1={pad} y1={pad} x2={pad} y2={chartH - pad} stroke="#334155" strokeWidth="1" />

              {/* Pump Curve */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                points={curveData.pumpPoints.map(p => `${scaleX(p.q)},${scaleY(p.h)}`).join(' ')}
              />

              {/* System Head Curve */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                points={curveData.sysPoints.map(p => `${scaleX(p.q)},${scaleY(p.h)}`).join(' ')}
              />

              {/* Operating Point Intersection Circle */}
              {curveData.operatingPoint && (
                <g>
                  <circle
                    cx={scaleX(curveData.operatingPoint.q)}
                    cy={scaleY(curveData.operatingPoint.h)}
                    r="6"
                    fill="#10b981"
                  />
                </g>
              )}
            </svg>

            <div className="mt-2 flex gap-6 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-amber-400"></span> Pump Head Curve</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-cyan-400"></span> System Resistance Curve</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Operating Point</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
