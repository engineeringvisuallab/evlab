import React, { useRef, useEffect } from 'react';
import { BucklingCalculationResult } from '../engines/calculationEngine';
import { Material, SectionProperties, VisualMode } from '../types';
import { formatEngValue } from '../core/units';
import { AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ColumnBucklingVisualizerProps {
  bucklingResult: BucklingCalculationResult;
  material: Material;
  section: SectionProperties;
  columnLengthM: number;
  onLengthChange: (val: number) => void;
  appliedAxialLoadKN: number;
  onAxialLoadChange: (val: number) => void;
  endCondition: 'pin_pin' | 'fixed_fixed' | 'fixed_free' | 'fixed_pin';
  onEndConditionChange: (cond: 'pin_pin' | 'fixed_fixed' | 'fixed_free' | 'fixed_pin') => void;
  visualMode: VisualMode;
}

export const ColumnBucklingVisualizer: React.FC<ColumnBucklingVisualizerProps> = ({
  bucklingResult,
  material,
  section,
  columnLengthM,
  onLengthChange,
  appliedAxialLoadKN,
  onAxialLoadChange,
  endCondition,
  onEndConditionChange,
  visualMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    effectiveLengthFactorK,
    effectiveLengthM,
    criticalLoadKN,
    criticalStressMPa,
    slendernessRatio,
    radiusGyrationMm,
    isBuckled,
    governingFailureMode,
    safetyFactor,
  } = bucklingResult;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Left Panel: Column Buckling Deformation Simulation (x: 40 to width * 0.45)
    // Right Panel: Euler Hyperbola Curve (P_cr vs Slenderness λ) (x: width * 0.50 to width - 30)

    const colCenterX = width * 0.22;
    const colTopY = 55;
    const colBottomY = height - 55;
    const colHeightPx = colBottomY - colTopY;
    const colWidthPx = 14;

    // 1. Draw Support Fixtures (Top & Bottom)
    ctx.strokeStyle = '#94a3b8';
    ctx.fillStyle = '#334155';
    ctx.lineWidth = 2;

    // Bottom Support
    if (endCondition === 'pin_pin' || endCondition === 'fixed_pin') {
      // Pin support (triangle)
      ctx.beginPath();
      ctx.moveTo(colCenterX, colBottomY);
      ctx.lineTo(colCenterX - 14, colBottomY + 22);
      ctx.lineTo(colCenterX + 14, colBottomY + 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Fixed base clamp
      ctx.fillRect(colCenterX - 35, colBottomY, 70, 18);
      ctx.strokeRect(colCenterX - 35, colBottomY, 70, 18);
    }

    // Top Support
    if (endCondition === 'pin_pin') {
      // Top Pin Support
      ctx.beginPath();
      ctx.moveTo(colCenterX, colTopY);
      ctx.lineTo(colCenterX - 14, colTopY - 22);
      ctx.lineTo(colCenterX + 14, colTopY - 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (endCondition === 'fixed_fixed' || endCondition === 'fixed_pin') {
      // Top Fixed Collar
      ctx.fillRect(colCenterX - 35, colTopY - 18, 70, 18);
      ctx.strokeRect(colCenterX - 35, colTopY - 18, 70, 18);
    } else {
      // Fixed - Free (Free top end with load plate)
      ctx.fillRect(colCenterX - 25, colTopY - 8, 50, 8);
    }

    // 2. Draw Column Buckling Deformed Profile Shape
    // Mode shape function w(y) based on end conditions
    const loadRatio = appliedAxialLoadKN / Math.max(1, criticalLoadKN);
    const maxLateralDefPx = isBuckled 
      ? 45 + (loadRatio - 1) * 20 
      : Math.min(25, loadRatio * 15);

    const numPts = 60;
    const colPts: { x: number; y: number }[] = [];

    for (let i = 0; i <= numPts; i++) {
      const t = i / numPts; // 0 to 1
      const py = colTopY + t * colHeightPx;
      let lateralOffset = 0;

      if (endCondition === 'pin_pin') {
        // Half sine wave: w = w0 * sin(π * y / L)
        lateralOffset = maxLateralDefPx * Math.sin(Math.PI * t);
      } else if (endCondition === 'fixed_fixed') {
        // Full sine wave with zero slope at ends: w = w0 * (1 - cos(2π * y / L)) / 2
        lateralOffset = maxLateralDefPx * (1 - Math.cos(2 * Math.PI * t)) * 0.5;
      } else if (endCondition === 'fixed_free') {
        // Quarter sine wave: w = w0 * (1 - cos(π * y / (2L)))
        lateralOffset = maxLateralDefPx * (1 - Math.cos((Math.PI * (1 - t)) / 2));
      } else {
        // Fixed - Pin
        lateralOffset = maxLateralDefPx * Math.sin(Math.PI * t * 1.4) * (1 - t * 0.3);
      }

      colPts.push({ x: colCenterX + lateralOffset, y: py });
    }

    // Draw Column Body
    ctx.beginPath();
    colPts.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x - colWidthPx / 2, pt.y);
      else ctx.lineTo(pt.x - colWidthPx / 2, pt.y);
    });
    for (let i = colPts.length - 1; i >= 0; i--) {
      ctx.lineTo(colPts[i].x + colWidthPx / 2, colPts[i].y);
    }
    ctx.closePath();

    if (isBuckled) {
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#f87171';
    } else if (loadRatio > 0.8) {
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#fbbf24';
    } else {
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#38bdf8';
    }
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();

    // Centerline dashed line
    ctx.strokeStyle = '#fbbf24';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    colPts.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Applied Axial Compression Load Vector (Top Red Arrow)
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(colCenterX, colTopY - 45);
    ctx.lineTo(colCenterX, colTopY - 5);
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(colCenterX - 6, colTopY - 14);
    ctx.lineTo(colCenterX, colTopY - 4);
    ctx.lineTo(colCenterX + 6, colTopY - 14);
    ctx.fill();

    ctx.font = 'bold 11px monospace';
    ctx.fillText(`P = ${appliedAxialLoadKN} kN ↓`, colCenterX + 12, colTopY - 25);

    // 3. Right Panel: Euler Column Stability Curve (σ_cr vs λ)
    const plotLeft = width * 0.48;
    const plotRight = width - 30;
    const plotTop = 40;
    const plotBottom = height - 40;
    const plotW = plotRight - plotLeft;
    const plotH = plotBottom - plotTop;

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = plotLeft; x <= plotRight; x += plotW / 5) {
      ctx.beginPath();
      ctx.moveTo(x, plotTop);
      ctx.lineTo(x, plotBottom);
      ctx.stroke();
    }
    for (let y = plotTop; y <= plotBottom; y += plotH / 4) {
      ctx.beginPath();
      ctx.moveTo(plotLeft, y);
      ctx.lineTo(plotRight, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotLeft, plotTop);
    ctx.lineTo(plotLeft, plotBottom);
    ctx.lineTo(plotRight, plotBottom);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('Slenderness Ratio (λ = K·L / r) →', plotLeft + plotW * 0.35, plotBottom + 28);
    ctx.fillText('↑ Critical Stress (σ_cr, MPa)', plotLeft - 5, plotTop - 12);

    const maxLambda = 220;
    const maxStress = material.yieldStrength * 1.25;

    const mapPlotX = (lam: number) => plotLeft + (lam / maxLambda) * plotW;
    const mapPlotY = (s: number) => plotBottom - (s / maxStress) * plotH;

    // Yield Strength Cutoff Line (Johnson Parabola / Material Yield limit)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(plotLeft, mapPlotY(material.yieldStrength));
    ctx.lineTo(plotRight, mapPlotY(material.yieldStrength));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`Yield Stress σ_y = ${material.yieldStrength} MPa (Crushing Threshold)`, plotLeft + 10, mapPlotY(material.yieldStrength) - 5);

    // Plot Euler Buckling Hyperbola: σ_cr = π²·E / λ²
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let lam = 20; lam <= maxLambda; lam += 2) {
      const eulerSigma = (Math.PI * Math.PI * material.E * 1000) / (lam * lam);
      const cappedSigma = Math.min(eulerSigma, maxStress);
      const px = mapPlotX(lam);
      const py = mapPlotY(cappedSigma);
      if (lam === 20) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Plot Current Column State Point on Graph
    const currLambda = slendernessRatio;
    const currStress = Math.min(criticalStressMPa, maxStress);
    const currPx = mapPlotX(currLambda);
    const currPy = mapPlotY(currStress);

    ctx.fillStyle = isBuckled ? '#ef4444' : '#22c55e';
    ctx.beginPath();
    ctx.arc(currPx, currPy, 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'bold 11px monospace';
    ctx.fillText(`Active: λ = ${currLambda.toFixed(1)}, σ_cr = ${formatEngValue(criticalStressMPa)} MPa`, currPx + 10, currPy - 6);

  }, [
    bucklingResult,
    material,
    columnLengthM,
    appliedAxialLoadKN,
    endCondition,
    isBuckled,
    criticalLoadKN,
    criticalStressMPa,
    slendernessRatio,
    visualMode,
  ]);

  return (
    <div className="flex flex-col h-full bg-slate-950 p-3 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs gap-2">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-200">Euler Column Buckling & Stability Lab</span>
          
          {/* End Conditions Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Ends:</span>
            {(['pin_pin', 'fixed_fixed', 'fixed_free', 'fixed_pin'] as const).map(cond => (
              <button
                key={cond}
                onClick={() => onEndConditionChange(cond)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition ${
                  endCondition === cond
                    ? 'bg-cyan-900/80 text-cyan-300 font-semibold border border-cyan-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cond.replace('_', '-')}
              </button>
            ))}
          </div>
        </div>

        {/* Live Metrics Header */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-cyan-400 font-bold">P_cr: {formatEngValue(criticalLoadKN)} kN</span>
          <span className="text-amber-400">λ: {slendernessRatio.toFixed(1)} (K={effectiveLengthFactorK})</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-sans font-semibold border ${
            isBuckled
              ? 'bg-rose-950 text-rose-300 border-rose-800'
              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
          }`}>
            {isBuckled ? 'BUCKLED (Unstable Bifurcation)' : `Stable (SF = ${formatEngValue(safetyFactor)})`}
          </span>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative bg-slate-900/80 rounded-lg border border-slate-800 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={760}
          height={340}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Interactive Compression Jack & Column Controls */}
      <div className="mt-3 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-slate-300 font-semibold">Axial Load (P):</span>
          <input
            type="range"
            min="0"
            max={Math.max(100, criticalLoadKN * 1.5)}
            step="5"
            value={appliedAxialLoadKN}
            onChange={e => onAxialLoadChange(parseFloat(e.target.value))}
            className="w-36 accent-red-500 cursor-pointer"
          />
          <span className="font-mono text-red-400 font-bold w-16 text-right">
            {appliedAxialLoadKN} kN
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-slate-300 font-semibold">Column Length (L):</span>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.2"
            value={columnLengthM}
            onChange={e => onLengthChange(parseFloat(e.target.value))}
            className="w-32 accent-cyan-400 cursor-pointer"
          />
          <span className="font-mono text-cyan-400 font-bold w-12 text-right">
            {columnLengthM} m
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onAxialLoadChange(Math.round(criticalLoadKN * 0.5))}
            className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-[11px]"
          >
            Safe (50% P_cr)
          </button>
          <button
            onClick={() => onAxialLoadChange(Math.round(criticalLoadKN))}
            className="px-2 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800/60 text-[11px]"
          >
            Critical Bifurcation (100% P_cr)
          </button>
          <button
            onClick={() => onAxialLoadChange(Math.round(criticalLoadKN * 1.3))}
            className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[11px]"
          >
            Buckle Column (130% P_cr)
          </button>
        </div>
      </div>
    </div>
  );
};
