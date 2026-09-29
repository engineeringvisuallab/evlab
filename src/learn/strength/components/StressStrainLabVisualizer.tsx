import React, { useState, useEffect, useRef } from 'react';
import { Material } from '../types';
import { STANDARD_MATERIALS } from '../core/materials';
import { formatEngValue } from '../core/units';
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

interface StressStrainLabVisualizerProps {
  material: Material;
  onMaterialChange: (material: Material) => void;
}

export const StressStrainLabVisualizer: React.FC<StressStrainLabVisualizerProps> = ({
  material,
  onMaterialChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentStrain, setCurrentStrain] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [compareMaterialId, setCompareMaterialId] = useState<string>('aluminum_6061_t6');

  const compareMaterial = STANDARD_MATERIALS.find(m => m.id === compareMaterialId) || STANDARD_MATERIALS[2];

  // Progressive Tensile Test Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    if (isRunning) {
      const step = () => {
        setCurrentStrain(prev => {
          const maxStrain = material.fractureStrain * 1.1;
          if (prev >= maxStrain) {
            setIsRunning(false);
            return maxStrain;
          }
          return prev + 0.001;
        });
        animationFrameId = requestAnimationFrame(step);
      };
      animationFrameId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, material.fractureStrain]);

  // Compute Stress from Strain constitutive model
  const calculateStress = (eps: number, mat: Material): { stress: number; state: string } => {
    const yieldStrain = mat.yieldStrength / (mat.E * 1000);
    const utsStrain = mat.isDuctile ? mat.fractureStrain * 0.65 : mat.fractureStrain;
    const fractureStrain = mat.fractureStrain;

    if (eps <= yieldStrain) {
      // Linear Elastic: σ = E * ε
      return { stress: eps * mat.E * 1000, state: 'Elastic Linear Regime' };
    } else if (eps <= utsStrain) {
      // Yielding & Strain Hardening
      const hardeningSpan = utsStrain - yieldStrain;
      const progress = (eps - yieldStrain) / Math.max(0.001, hardeningSpan);
      const stress = mat.yieldStrength + (mat.ultimateStrength - mat.yieldStrength) * Math.sin(progress * (Math.PI / 2));
      return { stress, state: 'Yield & Strain Hardening' };
    } else if (eps <= fractureStrain) {
      // Necking & Softening until fracture
      const neckingSpan = fractureStrain - utsStrain;
      const progress = (eps - utsStrain) / Math.max(0.001, neckingSpan);
      const stress = mat.ultimateStrength - (mat.ultimateStrength - mat.yieldStrength * 0.85) * Math.pow(progress, 2);
      return { stress, state: 'Plastic Necking Zone' };
    } else {
      // Fractured
      return { stress: 0, state: 'FRACTURED (Rupture Occurred)' };
    }
  };

  const { stress: currentStress, state: currentStateName } = calculateStress(currentStrain, material);
  const isFractured = currentStrain >= material.fractureStrain;

  // Render UTM Machine & Live Curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Left Panel: UTM Testing Rig & Specimen (x: 0 to width * 0.35)
    // Right Panel: Live Stress-Strain Graph (x: width * 0.38 to width)

    const rigCenterX = width * 0.18;
    const rigTopY = 40;
    const rigBottomY = height - 40;
    const gaugeLength = 120;
    const elongation = currentStrain * gaugeLength * 2.5; // Visual exaggeration
    const neckingFactor = currentStrain > material.fractureStrain * 0.65 
      ? Math.max(0.3, 1 - (currentStrain - material.fractureStrain * 0.65) * 4) 
      : 1.0;

    // 1. Draw UTM Testing Machine Frame
    ctx.fillStyle = '#1e293b';
    // Columns
    ctx.fillRect(rigCenterX - 45, rigTopY, 14, rigBottomY - rigTopY);
    ctx.fillRect(rigCenterX + 31, rigTopY, 14, rigBottomY - rigTopY);
    // Base Plate
    ctx.fillStyle = '#334155';
    ctx.fillRect(rigCenterX - 55, rigBottomY - 15, 110, 25);
    // Top Stationary Crosshead
    ctx.fillRect(rigCenterX - 55, rigTopY - 10, 110, 20);

    // Moving Crosshead (Hydraulic Grip)
    const upperGripY = rigTopY + 30 - elongation * 0.5;
    const lowerGripY = rigTopY + 30 + gaugeLength + elongation * 0.5;

    ctx.fillStyle = '#475569';
    ctx.fillRect(rigCenterX - 35, upperGripY - 20, 70, 20);
    ctx.fillRect(rigCenterX - 35, lowerGripY, 70, 20);

    // Load Cell Indicator on Top Grip
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('HYDRAULIC GRIP', rigCenterX - 42, upperGripY - 25);

    // 2. Draw Tensile Test Specimen (Dog-bone shape)
    if (!isFractured) {
      ctx.fillStyle = material.color || '#64748b';
      const specWidth = 16 * neckingFactor;
      
      // Upper grip shoulder
      ctx.beginPath();
      ctx.moveTo(rigCenterX - 22, upperGripY);
      ctx.lineTo(rigCenterX + 22, upperGripY);
      ctx.lineTo(rigCenterX + specWidth / 2, upperGripY + 15);
      // Gauge section with necking
      const midY = (upperGripY + lowerGripY) / 2;
      ctx.quadraticCurveTo(rigCenterX + (specWidth * 0.7) / 2, midY, rigCenterX + specWidth / 2, lowerGripY - 15);
      ctx.lineTo(rigCenterX + 22, lowerGripY);
      ctx.lineTo(rigCenterX - 22, lowerGripY);
      ctx.lineTo(rigCenterX - specWidth / 2, lowerGripY - 15);
      ctx.quadraticCurveTo(rigCenterX - (specWidth * 0.7) / 2, midY, rigCenterX - specWidth / 2, upperGripY + 15);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Stress Heatmap Overlay along Gauge Length
      const stressRatio = Math.min(1.0, currentStress / Math.max(1, material.ultimateStrength));
      const heatGradient = ctx.createLinearGradient(0, upperGripY, 0, lowerGripY);
      heatGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
      heatGradient.addColorStop(0.5, `rgba(239, 68, 68, ${0.3 + stressRatio * 0.6})`);
      heatGradient.addColorStop(1, 'rgba(59, 130, 246, 0.4)');
      ctx.fillStyle = heatGradient;
      ctx.fill();
    } else {
      // Fractured Specimen (Upper & Lower halves separated)
      ctx.fillStyle = material.color || '#64748b';
      // Upper Half
      ctx.fillRect(rigCenterX - 8, upperGripY, 16, (lowerGripY - upperGripY) / 2 - 8);
      // Lower Half
      ctx.fillRect(rigCenterX - 8, upperGripY + (lowerGripY - upperGripY) / 2 + 8, 16, (lowerGripY - upperGripY) / 2 - 8);
      // Fracture cup-and-cone crack highlight
      ctx.fillStyle = '#ef4444';
      ctx.fillText('💥 FRACTURE CUP & CONE', rigCenterX - 60, (upperGripY + lowerGripY) / 2 + 4);
    }

    // Tensile Force Arrows
    if (!isFractured && currentStress > 0) {
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      // Top pulling arrow (upwards)
      ctx.beginPath();
      ctx.moveTo(rigCenterX, upperGripY - 20);
      ctx.lineTo(rigCenterX, upperGripY - 42);
      ctx.stroke();
      ctx.fillText(`P = ${formatEngValue(currentStress * 0.5, 1)} kN ↑`, rigCenterX + 8, upperGripY - 32);

      // Bottom pulling arrow (downwards)
      ctx.beginPath();
      ctx.moveTo(rigCenterX, lowerGripY + 20);
      ctx.lineTo(rigCenterX, lowerGripY + 42);
      ctx.stroke();
    }

    // 3. Right Panel: Engineering Stress-Strain Curve Plotter
    const graphLeft = width * 0.42;
    const graphRight = width - 30;
    const graphTop = 35;
    const graphBottom = height - 45;
    const graphW = graphRight - graphLeft;
    const graphH = graphBottom - graphTop;

    // Background Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = graphLeft; x <= graphRight; x += graphW / 6) {
      ctx.beginPath();
      ctx.moveTo(x, graphTop);
      ctx.lineTo(x, graphBottom);
      ctx.stroke();
    }
    for (let y = graphTop; y <= graphBottom; y += graphH / 5) {
      ctx.beginPath();
      ctx.moveTo(graphLeft, y);
      ctx.lineTo(graphRight, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(graphLeft, graphTop);
    ctx.lineTo(graphLeft, graphBottom);
    ctx.lineTo(graphRight, graphBottom);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('Engineering Strain (ε = ΔL/L₀) →', graphLeft + graphW * 0.35, graphBottom + 30);
    ctx.fillText('↑ Engineering Stress (σ, MPa)', graphLeft - 10, graphTop - 12);

    const maxGraphStress = Math.max(material.ultimateStrength, compareMaterial.ultimateStrength, 450) * 1.15;
    const maxGraphStrain = Math.max(material.fractureStrain, compareMaterial.fractureStrain, 0.35) * 1.1;

    // Helper: Map (strain, stress) to canvas (x, y)
    const mapX = (e: number) => graphLeft + (e / maxGraphStrain) * graphW;
    const mapY = (s: number) => graphBottom - (s / maxGraphStress) * graphH;

    // Plot Comparison Material Curve (faint dashed)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let e = 0; e <= compareMaterial.fractureStrain; e += 0.002) {
      const { stress } = calculateStress(e, compareMaterial);
      const px = mapX(e);
      const py = mapY(stress);
      if (e === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`Compare: ${compareMaterial.name}`, mapX(compareMaterial.fractureStrain * 0.6), mapY(compareMaterial.ultimateStrength) - 6);

    // Plot Active Material Full Theoretical Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let e = 0; e <= material.fractureStrain; e += 0.001) {
      const { stress } = calculateStress(e, material);
      const px = mapX(e);
      const py = mapY(stress);
      if (e === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Fill Elastic Resilience Area (under yield point)
    const yieldEps = material.yieldStrength / (material.E * 1000);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
    ctx.beginPath();
    ctx.moveTo(mapX(0), mapY(0));
    ctx.lineTo(mapX(yieldEps), mapY(material.yieldStrength));
    ctx.lineTo(mapX(yieldEps), graphBottom);
    ctx.closePath();
    ctx.fill();

    // Key Milestone Points: Yield, UTS, Fracture
    // Yield Point
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(mapX(yieldEps), mapY(material.yieldStrength), 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(`Yield σ_y=${material.yieldStrength}`, mapX(yieldEps) + 6, mapY(material.yieldStrength) - 4);

    // UTS Point
    const utsEps = material.isDuctile ? material.fractureStrain * 0.65 : material.fractureStrain;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(mapX(utsEps), mapY(material.ultimateStrength), 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(`UTS σ_u=${material.ultimateStrength}`, mapX(utsEps) + 6, mapY(material.ultimateStrength) - 4);

    // Fracture Point
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(mapX(material.fractureStrain), mapY(material.yieldStrength * 0.85), 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(`Fracture (${(material.fractureStrain * 100).toFixed(0)}%)`, mapX(material.fractureStrain) - 50, graphBottom - 12);

    // Current State Dynamic Tracking Dot & Crosshairs
    const curPx = mapX(currentStrain);
    const curPy = mapY(currentStress);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(curPx, graphBottom);
    ctx.lineTo(curPx, curPy);
    ctx.lineTo(graphLeft, curPy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(curPx, curPy, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`σ = ${formatEngValue(currentStress)} MPa`, curPx + 8, curPy - 8);

  }, [currentStrain, currentStress, material, compareMaterial, isFractured]);

  return (
    <div className="flex flex-col h-full bg-slate-950 p-3 select-none">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs gap-2">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-200">Virtual UTM Tensile Test Machine</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Specimen:</span>
            <select
              value={material.id}
              onChange={e => {
                const mat = STANDARD_MATERIALS.find(m => m.id === e.target.value);
                if (mat) {
                  onMaterialChange(mat);
                  setCurrentStrain(0);
                  setIsRunning(false);
                }
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs focus:outline-none focus:border-cyan-500"
            >
              {STANDARD_MATERIALS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (E={m.E} GPa, σy={m.yieldStrength} MPa)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Overlay:</span>
            <select
              value={compareMaterialId}
              onChange={e => setCompareMaterialId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-400 px-2 py-1 rounded text-xs focus:outline-none"
            >
              {STANDARD_MATERIALS.filter(m => m.id !== material.id).map(m => (
                <option key={m.id} value={m.id}>
                  Compare with {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Metrics Header */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <span className="text-cyan-400 font-bold">σ: {formatEngValue(currentStress)} MPa</span>
          <span className="text-emerald-400">ε: {(currentStrain * 100).toFixed(2)}%</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-sans font-semibold border ${
            isFractured 
              ? 'bg-rose-950 text-rose-300 border-rose-800'
              : currentStress >= material.yieldStrength
              ? 'bg-amber-950 text-amber-300 border-amber-800'
              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
          }`}>
            {currentStateName}
          </span>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative bg-slate-900/80 rounded-lg border border-slate-800 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={760}
          height={330}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Interactive Tensile Pull Controls */}
      <div className="mt-3 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition shadow-sm ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white font-semibold'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Pause Pull' : 'Start Tensile Test'}</span>
          </button>

          <button
            onClick={() => {
              setCurrentStrain(0);
              setIsRunning(false);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Specimen</span>
          </button>
        </div>

        {/* Manual Pull Displacement Slider */}
        <div className="flex items-center space-x-3 flex-1 max-w-md">
          <span className="text-slate-300 font-semibold shrink-0">Pull Grip:</span>
          <input
            type="range"
            min="0"
            max={material.fractureStrain * 1.05}
            step="0.0005"
            value={currentStrain}
            onChange={e => {
              setCurrentStrain(parseFloat(e.target.value));
              setIsRunning(false);
            }}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <span className="font-mono text-cyan-400 font-bold w-14 text-right">
            {(currentStrain * 100).toFixed(1)}%
          </span>
        </div>

        {/* Quick Snap Positions */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              setCurrentStrain(material.yieldStrength / (material.E * 1000));
              setIsRunning(false);
            }}
            className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-[11px] font-medium"
          >
            Yield Point
          </button>
          <button
            onClick={() => {
              setCurrentStrain(material.isDuctile ? material.fractureStrain * 0.65 : material.fractureStrain);
              setIsRunning(false);
            }}
            className="px-2 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800/60 text-[11px] font-medium"
          >
            UTS Peak
          </button>
        </div>
      </div>
    </div>
  );
};
