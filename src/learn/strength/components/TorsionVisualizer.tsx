import React, { useRef, useEffect } from 'react';
import { TorsionCalculationResult } from '../engines/calculationEngine';
import { Material, SectionProperties, VisualMode } from '../types';
import { formatEngValue } from '../core/units';
import { RotateCw } from 'lucide-react';

interface TorsionVisualizerProps {
  torsionResult: TorsionCalculationResult;
  material: Material;
  section: SectionProperties;
  appliedTorqueKNm: number;
  onTorqueChange: (val: number) => void;
  shaftLengthM: number;
  onLengthChange: (val: number) => void;
  visualMode: VisualMode;
}

export const TorsionVisualizer: React.FC<TorsionVisualizerProps> = ({
  torsionResult,
  material,
  section,
  appliedTorqueKNm,
  onTorqueChange,
  shaftLengthM,
  onLengthChange,
  visualMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    maxShearStressMPa,
    angleTwistDeg,
    angleTwistRad,
    polarMomentJMm4,
    safetyFactor,
    status,
  } = torsionResult;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Left Panel: 3D Isometric View of Circular Shaft Twisting (x: 40 to width * 0.58)
    // Right Panel: Cross-Section Shear Stress Radial Gradient Profile τ(r) (x: width * 0.65 to width - 30)

    const shaftLeftX = 80;
    const shaftRightX = width * 0.55;
    const shaftLengthPx = shaftRightX - shaftLeftX;
    const shaftCenterY = height * 0.5;
    const shaftRadiusPx = 55;

    // 1. Draw Left Fixed Boundary (Mounting Flange & Wall)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(shaftLeftX - 35, shaftCenterY - 75, 35, 150);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(shaftLeftX - 35, shaftCenterY - 75, 35, 150);
    // Wall Hatching
    for (let y = shaftCenterY - 70; y < shaftCenterY + 75; y += 10) {
      ctx.beginPath();
      ctx.moveTo(shaftLeftX - 35, y);
      ctx.lineTo(shaftLeftX - 15, y + 10);
      ctx.stroke();
    }

    // 2. Draw 3D Shaft Body with Surface Longitudinal Grid Lines that TWIST into HELICES
    const numLongLines = 10;
    const twistVisualAmp = Math.min(Math.PI * 0.8, angleTwistRad * 12); // Exaggerated angle for visual clarity

    // Back Cylinder Surface
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(shaftLeftX, shaftCenterY - shaftRadiusPx, shaftLengthPx, shaftRadiusPx * 2);

    // Color gradient based on visual mode
    const bodyGrad = ctx.createLinearGradient(0, shaftCenterY - shaftRadiusPx, 0, shaftCenterY + shaftRadiusPx);
    if (visualMode === 'stress') {
      bodyGrad.addColorStop(0, '#f43f5e'); // Max shear at outer skin
      bodyGrad.addColorStop(0.5, '#10b981'); // Zero at centerline
      bodyGrad.addColorStop(1, '#f43f5e');
    } else {
      bodyGrad.addColorStop(0, '#334155');
      bodyGrad.addColorStop(0.5, '#475569');
      bodyGrad.addColorStop(1, '#1e293b');
    }
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(shaftLeftX, shaftCenterY - shaftRadiusPx, shaftLengthPx, shaftRadiusPx * 2);

    // Draw Twisted Longitudinal Surface Lines (showing shear strain γ = r·θ / L)
    ctx.lineWidth = 1.5;
    for (let i = 0; i < numLongLines; i++) {
      const baseAngle = (i / numLongLines) * 2 * Math.PI;

      ctx.strokeStyle = i % 2 === 0 ? '#38bdf8' : 'rgba(148, 163, 184, 0.4)';
      ctx.beginPath();

      for (let x = 0; x <= shaftLengthPx; x += 5) {
        const progress = x / shaftLengthPx;
        const currentAngle = baseAngle + twistVisualAmp * progress;
        const yOffset = Math.sin(currentAngle) * shaftRadiusPx;
        const isVisible = Math.cos(currentAngle) >= -0.3; // Visible front face

        if (isVisible) {
          const pxY = shaftCenterY + yOffset;
          if (x === 0) ctx.moveTo(shaftLeftX + x, pxY);
          else ctx.lineTo(shaftLeftX + x, pxY);
        }
      }
      ctx.stroke();
    }

    // Shaft Top & Bottom Outline
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shaftLeftX, shaftCenterY - shaftRadiusPx);
    ctx.lineTo(shaftRightX, shaftCenterY - shaftRadiusPx);
    ctx.moveTo(shaftLeftX, shaftCenterY + shaftRadiusPx);
    ctx.lineTo(shaftRightX, shaftCenterY + shaftRadiusPx);
    ctx.stroke();

    // Right End Face Ellipse (Rotating with torque)
    const ellipseRadiusX = 18;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(shaftRightX, shaftCenterY, ellipseRadiusX, shaftRadiusPx, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Rotating radial line on end face
    const endRadialAngle = twistVisualAmp;
    const markerEndX = shaftRightX + Math.cos(endRadialAngle) * ellipseRadiusX;
    const markerEndY = shaftCenterY + Math.sin(endRadialAngle) * shaftRadiusPx;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shaftRightX, shaftCenterY);
    ctx.lineTo(markerEndX, markerEndY);
    ctx.stroke();
    ctx.restore();

    // Torque Applied Vector (Curved Arrow on Right Face)
    if (appliedTorqueKNm > 0) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(shaftRightX + 22, shaftCenterY, shaftRadiusPx * 0.85, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();

      // Torque Arrowhead
      const arrowTipX = shaftRightX + 22 + Math.cos(Math.PI * 0.4) * (shaftRadiusPx * 0.85);
      const arrowTipY = shaftCenterY + Math.sin(Math.PI * 0.4) * (shaftRadiusPx * 0.85);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(arrowTipX - 6, arrowTipY - 6);
      ctx.lineTo(arrowTipX, arrowTipY);
      ctx.lineTo(arrowTipX - 8, arrowTipY + 2);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`T = ${appliedTorqueKNm} kN·m`, shaftRightX - 10, shaftCenterY - shaftRadiusPx - 15);
      ctx.fillText(`θ = ${angleTwistDeg.toFixed(2)}°`, shaftRightX + 5, shaftCenterY + shaftRadiusPx + 20);
    }

    // 3. Right Panel: Cross-Section Shear Stress Radial Gradient Profile τ(r)
    const secCenterX = width * 0.80;
    const secCenterY = height * 0.5;
    const secRadiusPx = 70;

    // Outer Circular Cross-Section
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(secCenterX, secCenterY, secRadiusPx, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Concentric Shear Stress Heat Rings (τ = T·r / J)
    const numRings = 8;
    for (let r = 1; r <= numRings; r++) {
      const radius = (r / numRings) * secRadiusPx;
      const ratio = r / numRings;
      ctx.strokeStyle = `rgba(244, 63, 94, ${ratio * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(secCenterX, secCenterY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Centerline Axis
    ctx.strokeStyle = '#475569';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(secCenterX - secRadiusPx - 20, secCenterY);
    ctx.lineTo(secCenterX + secRadiusPx + 40, secCenterY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Linear Shear Stress Vectors (τ = 0 at center, τ_max at r=c)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(secCenterX, secCenterY);
    ctx.lineTo(secCenterX + secRadiusPx + 30, secCenterY - secRadiusPx);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`τ = 0 at center (r=0)`, secCenterX - 65, secCenterY + 18);
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(`τ_max = ${formatEngValue(maxShearStressMPa)} MPa`, secCenterX + 10, secCenterY - secRadiusPx - 8);

    // Section Titles
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Radial Shear Stress Gradient τ(r)', secCenterX - 95, 30);
    ctx.fillText('Twisted Shaft Elastic Helices', shaftLeftX + 30, 30);

  }, [
    torsionResult,
    appliedTorqueKNm,
    shaftLengthM,
    angleTwistDeg,
    angleTwistRad,
    maxShearStressMPa,
    visualMode,
  ]);

  return (
    <div className="flex flex-col h-full bg-slate-950 p-3 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-200">Shaft Torsion & Angle of Twist Lab</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-[11px] border border-cyan-800/60">
            T/J = τ/r = Gθ/L
          </span>
        </div>
        <div className="flex items-center space-x-4 font-mono text-xs">
          <span className="text-rose-400 font-bold">τ_max: {formatEngValue(maxShearStressMPa)} MPa</span>
          <span className="text-amber-400">θ: {angleTwistDeg.toFixed(2)}° ({angleTwistRad.toFixed(4)} rad)</span>
          <span className="text-cyan-400">J: {formatEngValue(polarMomentJMm4)} mm⁴</span>
          <span className="text-emerald-400">SF: {formatEngValue(safetyFactor)}</span>
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

      {/* Torque & Length Interactive Sliders */}
      <div className="mt-3 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-slate-300 font-semibold">Applied Torque (T):</span>
          <input
            type="range"
            min="0.1"
            max="50"
            step="0.5"
            value={appliedTorqueKNm}
            onChange={e => onTorqueChange(parseFloat(e.target.value))}
            className="w-36 accent-amber-400 cursor-pointer"
          />
          <span className="font-mono text-amber-400 font-bold w-16 text-right">
            {appliedTorqueKNm} kN·m
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-slate-300 font-semibold">Shaft Length (L):</span>
          <input
            type="range"
            min="0.5"
            max="6.0"
            step="0.1"
            value={shaftLengthM}
            onChange={e => onLengthChange(parseFloat(e.target.value))}
            className="w-36 accent-cyan-400 cursor-pointer"
          />
          <span className="font-mono text-cyan-400 font-bold w-14 text-right">
            {shaftLengthM} m
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTorqueChange(5)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
          >
            Light (5 kN·m)
          </button>
          <button
            onClick={() => onTorqueChange(20)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
          >
            Medium (20 kN·m)
          </button>
          <button
            onClick={() => onTorqueChange(45)}
            className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[11px]"
          >
            High (45 kN·m)
          </button>
        </div>
      </div>
    </div>
  );
};
