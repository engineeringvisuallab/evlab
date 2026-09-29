import React, { useRef, useEffect } from 'react';
import { MohrCircleCalculationResult } from '../engines/calculationEngine';
import { formatEngValue } from '../core/units';

interface MohrCircleVisualizerProps {
  mohrResult: MohrCircleCalculationResult;
  onRotationChange: (thetaDeg: number) => void;
}

export const MohrCircleVisualizer: React.FC<MohrCircleVisualizerProps> = ({
  mohrResult,
  onRotationChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    sigmaX,
    sigmaY,
    tauXY,
    sigmaAvg,
    radius,
    sigma1,
    sigma2,
    tauMax,
    thetaP1Deg,
    thetaS1Deg,
    rotatedSigmaX,
    rotatedSigmaY,
    rotatedTauXY,
    currentThetaDeg,
  } = mohrResult;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Coordinate system setup
    // Left half: Mohr's Circle (center at x = width * 0.35, y = height * 0.5)
    // Right half: Physical Stress Element (center at x = width * 0.8, y = height * 0.5)

    const circleCenterX = width * 0.35;
    const circleCenterY = height * 0.5;
    const elementCenterX = width * 0.8;
    const elementCenterY = height * 0.5;

    // Scale calculation: fit circle comfortably
    const maxVal = Math.max(Math.abs(sigma1), Math.abs(sigma2), Math.abs(tauMax), 50);
    const scale = (Math.min(width * 0.3, height * 0.35)) / (maxVal * 1.3);

    // 1. Draw Engineering Grid for Mohr Circle
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 20; x < width * 0.65; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, height - 20);
      ctx.stroke();
    }
    for (let y = 20; y < height - 20; y += 30) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(width * 0.65, y);
      ctx.stroke();
    }

    // 2. Draw Axes (σ horizontal, τ vertical downwards in standard mechanics convention or upwards)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;

    // Sigma Axis (Horizontal)
    ctx.beginPath();
    ctx.moveTo(30, circleCenterY);
    ctx.lineTo(width * 0.65, circleCenterY);
    ctx.stroke();

    // Tau Axis (Vertical, passing through σ = 0)
    const originX = circleCenterX - sigmaAvg * scale;
    ctx.beginPath();
    ctx.moveTo(originX, 30);
    ctx.lineTo(originX, height - 30);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('σ (Normal Stress, MPa) →', width * 0.65 - 150, circleCenterY - 10);
    ctx.fillText('↑ +τ (Shear, MPa)', originX + 8, 45);

    // 3. Draw Mohr's Circle
    const rPixels = radius * scale;
    ctx.save();
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, Math.max(2, rPixels), 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Center point marker (σ_avg, 0)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(`C (${formatEngValue(sigmaAvg)})`, circleCenterX - 20, circleCenterY + 18);

    // Principal Stress Points σ1 and σ2
    const p1X = circleCenterX + rPixels;
    const p2X = circleCenterX - rPixels;

    // σ1 marker
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(p1X, circleCenterY, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(`σ₁ = ${formatEngValue(sigma1)}`, p1X + 8, circleCenterY - 6);

    // σ2 marker
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(p2X, circleCenterY, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(`σ₂ = ${formatEngValue(sigma2)}`, p2X - 70, circleCenterY - 6);

    // Max Shear Points (Top & Bottom)
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY - rPixels, 4, 0, 2 * Math.PI);
    ctx.arc(circleCenterX, circleCenterY + rPixels, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(`τ_max = ${formatEngValue(tauMax)}`, circleCenterX + 8, circleCenterY - rPixels - 6);

    // 4. Current State Diameter Line (corresponding to angle 2θ)
    const angle2ThetaRad = (2 * currentThetaDeg * Math.PI) / 180 + Math.atan2(-tauXY, sigmaX - sigmaAvg);
    const currX_plot = circleCenterX + rPixels * Math.cos(angle2ThetaRad);
    const currY_plot = circleCenterY + rPixels * Math.sin(angle2ThetaRad);
    const oppX_plot = circleCenterX - rPixels * Math.cos(angle2ThetaRad);
    const oppY_plot = circleCenterY - rPixels * Math.sin(angle2ThetaRad);

    // Diameter line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(currX_plot, currY_plot);
    ctx.lineTo(oppX_plot, oppY_plot);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current State Marker on Circle (X-face)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(currX_plot, currY_plot, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`X' (${formatEngValue(rotatedSigmaX)}, ${formatEngValue(rotatedTauXY)})`, currX_plot + 8, currY_plot - 8);

    // 5. Draw Physical 2D Stress Element (Right Panel)
    ctx.save();
    ctx.translate(elementCenterX, elementCenterY);
    ctx.rotate((-currentThetaDeg * Math.PI) / 180); // Rotate element

    const elemSize = 90;
    const halfElem = elemSize / 2;

    // Element Body
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfElem, -halfElem, elemSize, elemSize);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-halfElem, -halfElem, elemSize, elemSize);

    // Stress arrows on element
    const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, color: string, label: string) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      const headlen = 7;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.fill();

      ctx.font = '10px monospace';
      ctx.fillText(label, toX + 6, toY + 4);
    };

    // Sigma X' Normal Stress Arrows (Right & Left faces)
    const sigXLen = Math.min(35, Math.abs(rotatedSigmaX) * 0.35 + 8);
    if (rotatedSigmaX >= 0) {
      // Tension (pointing outwards)
      drawArrow(halfElem, 0, halfElem + sigXLen, 0, '#22c55e', `σx'=${formatEngValue(rotatedSigmaX)}`);
      drawArrow(-halfElem, 0, -halfElem - sigXLen, 0, '#22c55e', '');
    } else {
      // Compression (pointing inwards)
      drawArrow(halfElem + sigXLen, 0, halfElem, 0, '#eab308', `σx'=${formatEngValue(rotatedSigmaX)}`);
      drawArrow(-halfElem - sigXLen, 0, -halfElem, 0, '#eab308', '');
    }

    // Sigma Y' Normal Stress Arrows (Top & Bottom faces)
    const sigYLen = Math.min(35, Math.abs(rotatedSigmaY) * 0.35 + 8);
    if (rotatedSigmaY >= 0) {
      drawArrow(0, -halfElem, 0, -halfElem - sigYLen, '#22c55e', `σy'=${formatEngValue(rotatedSigmaY)}`);
      drawArrow(0, halfElem, 0, halfElem + sigYLen, '#22c55e', '');
    } else {
      drawArrow(0, -halfElem - sigYLen, 0, -halfElem, '#eab308', `σy'=${formatEngValue(rotatedSigmaY)}`);
      drawArrow(0, halfElem + sigYLen, 0, halfElem, '#eab308', '');
    }

    // Shear Stress Arrows (τ_x'y')
    if (Math.abs(rotatedTauXY) > 0.5) {
      const shearColor = '#f43f5e';
      const dir = rotatedTauXY >= 0 ? 1 : -1;
      // Right face (vertical arrow)
      drawArrow(halfElem + 6, -halfElem * 0.4 * dir, halfElem + 6, halfElem * 0.4 * dir, shearColor, `τ'=${formatEngValue(rotatedTauXY)}`);
      // Top face (horizontal arrow)
      drawArrow(-halfElem * 0.4 * dir, -halfElem - 6, halfElem * 0.4 * dir, -halfElem - 6, shearColor, '');
    }

    ctx.restore();

    // Element Title & Angle Indicator
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Rotated Stress Element', elementCenterX - 65, elementCenterY - 85);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px monospace';
    ctx.fillText(`Orientation θ = ${currentThetaDeg}° (2θ on Mohr = ${(currentThetaDeg * 2)}°)`, elementCenterX - 95, elementCenterY + 85);

  }, [mohrResult, currentThetaDeg]);

  return (
    <div className="flex flex-col h-full bg-slate-950 p-3 select-none">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-200">Interactive Mohr’s Circle & Stress Transformation</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-[11px] border border-cyan-800/60">
            2θ on Circle ↔ θ on Physical Element
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <span className="text-emerald-400">σ₁ = {formatEngValue(sigma1)} MPa</span>
          <span className="text-amber-400">σ₂ = {formatEngValue(sigma2)} MPa</span>
          <span className="text-rose-400">τ_max = {formatEngValue(tauMax)} MPa</span>
          <span className="text-cyan-300">θp₁ = {thetaP1Deg.toFixed(1)}°</span>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-900/80 rounded-lg border border-slate-800 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={760}
          height={340}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Synchronized Angle Controller Slider */}
      <div className="mt-3 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-slate-300">Rotate Stress Element (θ):</span>
          <input
            type="range"
            min="-90"
            max="90"
            step="1"
            value={currentThetaDeg}
            onChange={e => onRotationChange(parseFloat(e.target.value))}
            className="w-56 accent-cyan-400 cursor-pointer"
          />
          <span className="font-mono text-cyan-400 font-bold w-12 text-right">
            {currentThetaDeg}°
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onRotationChange(Math.round(thetaP1Deg))}
            className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[11px] font-medium transition"
          >
            Snap to Principal Planes (θp = {thetaP1Deg.toFixed(1)}°)
          </button>
          <button
            onClick={() => onRotationChange(Math.round(thetaS1Deg))}
            className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700/60 text-[11px] font-medium transition"
          >
            Snap to Max Shear (θs = {thetaS1Deg.toFixed(1)}°)
          </button>
          <button
            onClick={() => onRotationChange(0)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
          >
            Reset (0°)
          </button>
        </div>
      </div>
    </div>
  );
};
