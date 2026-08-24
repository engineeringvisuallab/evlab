import React, { useRef, useEffect, useState } from 'react';
import { BeamCalculationResult } from '../engines/calculationEngine';
import { PointLoad, SectionProperties, VisualMode } from '../types';
import { formatEngValue } from '../core/units';
import { Plus, Trash2, Sliders, ArrowDown, Move } from 'lucide-react';

interface BeamBendingVisualizerProps {
  beamResult: BeamCalculationResult;
  section: SectionProperties;
  pointLoads: PointLoad[];
  onUpdatePointLoads: (loads: PointLoad[]) => void;
  udlKNm: number;
  onUpdateUDL: (val: number) => void;
  spanLengthM: number;
  supportType: 'simply_supported' | 'cantilever' | 'fixed_fixed';
  onSupportTypeChange: (type: 'simply_supported' | 'cantilever' | 'fixed_fixed') => void;
  visualMode: VisualMode;
  deformationScale: number;
}

export const BeamBendingVisualizer: React.FC<BeamBendingVisualizerProps> = ({
  beamResult,
  section,
  pointLoads,
  onUpdatePointLoads,
  udlKNm,
  onUpdateUDL,
  spanLengthM,
  supportType,
  onSupportTypeChange,
  visualMode,
  deformationScale,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeDiagramTab, setActiveDiagramTab] = useState<'sfd' | 'bmd' | 'deflection' | 'section_stress'>('sfd');
  const [draggedLoadIndex, setDraggedLoadIndex] = useState<number | null>(null);

  const {
    reactionA,
    reactionB,
    reactionMomentA,
    maxBendingMomentKNm,
    maxShearForceKN,
    maxDeflectionMm,
    maxFlexuralStressMPa,
    maxShearStressMPa,
    sfdPoints,
    bmdPoints,
    deflectionPoints,
  } = beamResult;

  // Handle Dragging Loads along the beam span
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Beam line is at y = 80, x from 70 to canvas.width - 70
    const beamLeftX = 70;
    const beamRightX = canvas.width - 70;
    const beamSpanPx = beamRightX - beamLeftX;

    // Check if mouse is near any point load arrow
    pointLoads.forEach((load, idx) => {
      const loadPxX = beamLeftX + (load.position / spanLengthM) * beamSpanPx;
      if (Math.abs(mouseX - loadPxX) < 18 && mouseY > 30 && mouseY < 100) {
        setDraggedLoadIndex(idx);
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedLoadIndex === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;

    const beamLeftX = 70;
    const beamRightX = canvas.width - 70;
    const beamSpanPx = beamRightX - beamLeftX;

    const clampedX = Math.max(beamLeftX, Math.min(beamRightX, mouseX));
    const newPosM = ((clampedX - beamLeftX) / beamSpanPx) * spanLengthM;
    const roundedPos = Math.round(newPosM * 20) / 20; // 0.05m increments

    const updated = [...pointLoads];
    updated[draggedLoadIndex] = {
      ...updated[draggedLoadIndex],
      position: roundedPos,
    };
    onUpdatePointLoads(updated);
  };

  const handleMouseUp = () => {
    setDraggedLoadIndex(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Top Half: Physical Beam Simulation (y: 20 to 140)
    // Bottom Half: Selected Diagram (SFD / BMD / Elastic Curve / Section Stress) (y: 150 to height - 20)

    const beamLeftX = 70;
    const beamRightX = width - 70;
    const beamSpanPx = beamRightX - beamLeftX;
    const undefBeamY = 80;
    const beamDepthPx = 18;

    // 1. Draw Supports (Pin, Roller, Fixed Clamp)
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;

    if (supportType === 'simply_supported') {
      // Left Support: PIN (Triangle)
      ctx.beginPath();
      ctx.moveTo(beamLeftX, undefBeamY + beamDepthPx / 2);
      ctx.lineTo(beamLeftX - 14, undefBeamY + beamDepthPx / 2 + 22);
      ctx.lineTo(beamLeftX + 14, undefBeamY + beamDepthPx / 2 + 22);
      ctx.closePath();
      ctx.fillStyle = '#334155';
      ctx.fill();
      ctx.stroke();
      // Ground hatch under pin
      ctx.beginPath();
      ctx.moveTo(beamLeftX - 18, undefBeamY + beamDepthPx / 2 + 22);
      ctx.lineTo(beamLeftX + 18, undefBeamY + beamDepthPx / 2 + 22);
      ctx.stroke();

      // Right Support: ROLLER (Triangle + Rollers)
      ctx.beginPath();
      ctx.moveTo(beamRightX, undefBeamY + beamDepthPx / 2);
      ctx.lineTo(beamRightX - 14, undefBeamY + beamDepthPx / 2 + 16);
      ctx.lineTo(beamRightX + 14, undefBeamY + beamDepthPx / 2 + 16);
      ctx.closePath();
      ctx.fillStyle = '#334155';
      ctx.fill();
      ctx.stroke();
      // Roller Circles
      ctx.beginPath();
      ctx.arc(beamRightX - 8, undefBeamY + beamDepthPx / 2 + 20, 3, 0, 2 * Math.PI);
      ctx.arc(beamRightX + 8, undefBeamY + beamDepthPx / 2 + 20, 3, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (supportType === 'cantilever') {
      // Left Support: Fixed Wall Clamp
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(beamLeftX - 25, undefBeamY - 35, 25, 70);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(beamLeftX - 25, undefBeamY - 35, 25, 70);
      // Fixed hatching
      for (let y = undefBeamY - 30; y < undefBeamY + 35; y += 8) {
        ctx.beginPath();
        ctx.moveTo(beamLeftX - 25, y);
        ctx.lineTo(beamLeftX - 12, y + 8);
        ctx.stroke();
      }
    } else {
      // Fixed - Fixed Clamps on both sides
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(beamLeftX - 20, undefBeamY - 30, 20, 60);
      ctx.fillRect(beamRightX, undefBeamY - 30, 20, 60);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(beamLeftX - 20, undefBeamY - 30, 20, 60);
      ctx.strokeRect(beamRightX, undefBeamY - 30, 20, 60);
    }

    // 2. Draw Deformed Beam Elastic Curve with Heatmap Stress
    const defScale = deformationScale; // Visual multiplier
    const maxDefPx = Math.max(1, maxDeflectionMm * 0.05 * defScale);

    ctx.save();
    // Build Deformed Beam Polygon
    const topFiberPts: { x: number; y: number }[] = [];
    const botFiberPts: { x: number; y: number }[] = [];
    const naPts: { x: number; y: number }[] = [];

    deflectionPoints.forEach(pt => {
      const pxX = beamLeftX + (pt.x / spanLengthM) * beamSpanPx;
      const defPx = (pt.y / Math.max(0.01, maxDeflectionMm)) * Math.min(25, maxDefPx);
      const currCenterY = undefBeamY + defPx;

      topFiberPts.push({ x: pxX, y: currCenterY - beamDepthPx / 2 });
      botFiberPts.push({ x: pxX, y: currCenterY + beamDepthPx / 2 });
      naPts.push({ x: pxX, y: currCenterY });
    });

    // Fill Beam Body
    ctx.beginPath();
    topFiberPts.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    for (let i = botFiberPts.length - 1; i >= 0; i--) {
      ctx.lineTo(botFiberPts[i].x, botFiberPts[i].y);
    }
    ctx.closePath();

    if (visualMode === 'stress') {
      // Stress Heatmap Gradient (Compression on top = blue, Tension on bottom = red)
      const grad = ctx.createLinearGradient(0, undefBeamY - beamDepthPx, 0, undefBeamY + beamDepthPx);
      grad.addColorStop(0, '#3b82f6'); // Compression
      grad.addColorStop(0.5, '#10b981'); // Neutral axis (zero stress)
      grad.addColorStop(1, '#ef4444'); // Tension
      ctx.fillStyle = grad;
    } else if (visualMode === 'deformation') {
      ctx.fillStyle = '#0284c7';
    } else {
      ctx.fillStyle = '#334155';
    }
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Neutral Axis Line (dashed centerline)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    naPts.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();

    // 3. Draw Applied Loads on Beam
    // Draw UDL (Uniformly Distributed Load)
    if (udlKNm > 0) {
      const udlArrowH = 22;
      const udlBarY = undefBeamY - beamDepthPx / 2 - udlArrowH;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(beamLeftX, udlBarY, beamSpanPx, udlArrowH);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(beamLeftX, udlBarY, beamSpanPx, udlArrowH);

      // Downward UDL arrows
      for (let x = beamLeftX + 15; x < beamRightX; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, udlBarY);
        ctx.lineTo(x, udlBarY + udlArrowH);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(x - 3, udlBarY + udlArrowH - 4);
        ctx.lineTo(x, udlBarY + udlArrowH);
        ctx.lineTo(x + 3, udlBarY + udlArrowH - 4);
        ctx.stroke();
      }
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`w = ${udlKNm} kN/m`, (beamLeftX + beamRightX) / 2 - 40, udlBarY - 6);
    }

    // Draw Point Loads (Draggable Arrows)
    pointLoads.forEach((load, idx) => {
      const loadPxX = beamLeftX + (load.position / spanLengthM) * beamSpanPx;
      const isBeingDragged = draggedLoadIndex === idx;

      ctx.fillStyle = isBeingDragged ? '#f59e0b' : '#f43f5e';
      ctx.strokeStyle = isBeingDragged ? '#f59e0b' : '#f43f5e';
      ctx.lineWidth = 2.5;

      const arrowTopY = undefBeamY - beamDepthPx / 2 - 38;
      const arrowTipY = undefBeamY - beamDepthPx / 2;

      ctx.beginPath();
      ctx.moveTo(loadPxX, arrowTopY);
      ctx.lineTo(loadPxX, arrowTipY);
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(loadPxX - 5, arrowTipY - 8);
      ctx.lineTo(loadPxX, arrowTipY);
      ctx.lineTo(loadPxX + 5, arrowTipY - 8);
      ctx.fill();

      // Drag badge
      ctx.fillStyle = isBeingDragged ? '#f59e0b' : '#0f172a';
      ctx.fillRect(loadPxX - 25, arrowTopY - 18, 50, 16);
      ctx.strokeStyle = isBeingDragged ? '#fbbf24' : '#f43f5e';
      ctx.strokeRect(loadPxX - 25, arrowTopY - 18, 50, 16);

      ctx.fillStyle = isBeingDragged ? '#0f172a' : '#fca5a5';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`P=${load.magnitude}kN`, loadPxX - 22, arrowTopY - 6);
      ctx.fillText(`x=${load.position}m`, loadPxX - 16, arrowTipY + 28);
    });

    // Draw Support Reaction Vectors (Green upward arrows)
    if (reactionA !== 0) {
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(beamLeftX, undefBeamY + 38);
      ctx.lineTo(beamLeftX, undefBeamY + 18);
      ctx.stroke();
      ctx.fillText(`R_A = ${formatEngValue(reactionA)} kN ↑`, beamLeftX - 25, undefBeamY + 52);
    }
    if (supportType !== 'cantilever' && reactionB !== 0) {
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(beamRightX, undefBeamY + 38);
      ctx.lineTo(beamRightX, undefBeamY + 18);
      ctx.stroke();
      ctx.fillText(`R_B = ${formatEngValue(reactionB)} kN ↑`, beamRightX - 35, undefBeamY + 52);
    }

    // 4. Bottom Half: Engineering Diagrams (SFD / BMD / Deflection / Section Stress)
    const diagTopY = 160;
    const diagBottomY = height - 25;
    const diagMidY = (diagTopY + diagBottomY) / 2;
    const diagH = diagBottomY - diagTopY;

    // Diagram Box Outline
    ctx.fillStyle = '#090d16';
    ctx.fillRect(beamLeftX, diagTopY, beamSpanPx, diagH);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(beamLeftX, diagTopY, beamSpanPx, diagH);

    // Baseline (Zero axis)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(beamLeftX, diagMidY);
    ctx.lineTo(beamRightX, diagMidY);
    ctx.stroke();

    if (activeDiagramTab === 'sfd') {
      // SHEAR FORCE DIAGRAM (SFD)
      const maxV = Math.max(1, maxShearForceKN);
      const scaleV = (diagH * 0.42) / maxV;

      ctx.fillStyle = 'rgba(14, 165, 233, 0.18)';
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(beamLeftX, diagMidY);
      sfdPoints.forEach(pt => {
        const pxX = beamLeftX + (pt.x / spanLengthM) * beamSpanPx;
        const pxY = diagMidY - pt.v * scaleV;
        ctx.lineTo(pxX, pxY);
      });
      ctx.lineTo(beamRightX, diagMidY);
      ctx.closePath();
      ctx.fill();

      // SFD Line
      ctx.beginPath();
      sfdPoints.forEach((pt, i) => {
        const pxX = beamLeftX + (pt.x / spanLengthM) * beamSpanPx;
        const pxY = diagMidY - pt.v * scaleV;
        if (i === 0) ctx.moveTo(pxX, pxY);
        else ctx.lineTo(pxX, pxY);
      });
      ctx.stroke();

      // Vertical Hatching
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)';
      ctx.lineWidth = 1;
      for (let x = beamLeftX; x <= beamRightX; x += 12) {
        const t = (x - beamLeftX) / beamSpanPx;
        const idx = Math.min(sfdPoints.length - 1, Math.floor(t * sfdPoints.length));
        const val = sfdPoints[idx]?.v || 0;
        ctx.beginPath();
        ctx.moveTo(x, diagMidY);
        ctx.lineTo(x, diagMidY - val * scaleV);
        ctx.stroke();
      }

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`SHEAR FORCE DIAGRAM (SFD) — Max |V| = ${formatEngValue(maxShearForceKN)} kN`, beamLeftX + 10, diagTopY + 18);
    } else if (activeDiagramTab === 'bmd') {
      // BENDING MOMENT DIAGRAM (BMD)
      const maxM = Math.max(0.5, maxBendingMomentKNm);
      const scaleM = (diagH * 0.42) / maxM;

      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(beamLeftX, diagMidY);
      bmdPoints.forEach(pt => {
        const pxX = beamLeftX + (pt.x / spanLengthM) * beamSpanPx;
        const pxY = diagMidY - pt.m * scaleM;
        ctx.lineTo(pxX, pxY);
      });
      ctx.lineTo(beamRightX, diagMidY);
      ctx.closePath();
      ctx.fill();

      // BMD Curve
      ctx.beginPath();
      bmdPoints.forEach((pt, i) => {
        const pxX = beamLeftX + (pt.x / spanLengthM) * beamSpanPx;
        const pxY = diagMidY - pt.m * scaleM;
        if (i === 0) ctx.moveTo(pxX, pxY);
        else ctx.lineTo(pxX, pxY);
      });
      ctx.stroke();

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`BENDING MOMENT DIAGRAM (BMD) — Max |M| = ${formatEngValue(maxBendingMomentKNm)} kN·m`, beamLeftX + 10, diagTopY + 18);
    } else if (activeDiagramTab === 'deflection') {
      // ELASTIC DEFLECTION CURVE
      const maxDef = Math.max(0.01, maxDeflectionMm);
      const scaleDef = (diagH * 0.4) / maxDef;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      deflectionPoints.forEach((pt, i) => {
        const pxX = beamLeftX + (pt.x / spanLengthM) * beamSpanPx;
        const pxY = diagTopY + 25 + pt.y * scaleDef;
        if (i === 0) ctx.moveTo(pxX, pxY);
        else ctx.lineTo(pxX, pxY);
      });
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`ELASTIC DEFLECTION CURVE — Max δ = ${formatEngValue(maxDeflectionMm)} mm (L/${Math.round((spanLengthM * 1000) / maxDef)})`, beamLeftX + 10, diagTopY + 18);
    } else {
      // CROSS-SECTION FLEXURAL & SHEAR STRESS PROFILES
      const secCenterX = beamLeftX + beamSpanPx * 0.25;
      const flexCenterX = beamLeftX + beamSpanPx * 0.55;
      const shearCenterX = beamLeftX + beamSpanPx * 0.82;
      const secH = diagH * 0.65;
      const secTop = diagMidY - secH / 2;

      // 1. Draw Section Shape
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.fillRect(secCenterX - 25, secTop, 50, secH);
      ctx.strokeRect(secCenterX - 25, secTop, 50, secH);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`Cross-Section`, secCenterX - 35, secTop - 8);
      ctx.fillText(`NA (y=0)`, secCenterX - 20, diagMidY + 3);

      // 2. Draw Linear Flexural Stress Profile (σ = My/I)
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(flexCenterX, secTop);
      ctx.lineTo(flexCenterX, secTop + secH);
      ctx.stroke();

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(flexCenterX - 35, secTop); // Top compression
      ctx.lineTo(flexCenterX + 35, secTop + secH); // Bottom tension
      ctx.stroke();

      // Stress arrows
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(`-σ_comp = ${formatEngValue(maxFlexuralStressMPa)} MPa`, flexCenterX - 60, secTop - 8);
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`+σ_tens = ${formatEngValue(maxFlexuralStressMPa)} MPa`, flexCenterX - 60, secTop + secH + 15);

      // 3. Draw Parabolic Shear Stress Profile (τ = VQ/Ib)
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(shearCenterX, secTop);
      ctx.lineTo(shearCenterX, secTop + secH);
      ctx.stroke();

      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(shearCenterX, secTop);
      ctx.quadraticCurveTo(shearCenterX + 45, diagMidY, shearCenterX, secTop + secH);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`τ_max = ${formatEngValue(maxShearStressMPa)} MPa`, shearCenterX + 8, diagMidY);
      ctx.fillText(`Transverse Shear τ(y)`, shearCenterX - 45, secTop - 8);
    }

  }, [
    beamResult,
    spanLengthM,
    pointLoads,
    udlKNm,
    supportType,
    activeDiagramTab,
    visualMode,
    deformationScale,
    draggedLoadIndex,
  ]);

  return (
    <div className="flex flex-col h-full bg-slate-950 p-3 select-none">
      {/* Top Beam Control Header */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs gap-2">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-200">Interactive Beam Lab</span>
          
          {/* Support Type Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Support:</span>
            {(['simply_supported', 'cantilever', 'fixed_fixed'] as const).map(type => (
              <button
                key={type}
                onClick={() => onSupportTypeChange(type)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition ${
                  supportType === type
                    ? 'bg-blue-900/80 text-blue-300 font-semibold border border-blue-600/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Live Statics Metrics */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-cyan-400">R_A: {formatEngValue(reactionA)} kN</span>
          {supportType !== 'cantilever' && <span className="text-cyan-400">R_B: {formatEngValue(reactionB)} kN</span>}
          <span className="text-purple-400 font-bold">M_max: {formatEngValue(maxBendingMomentKNm)} kN·m</span>
          <span className="text-emerald-400">δ_max: {formatEngValue(maxDeflectionMm)} mm</span>
        </div>
      </div>

      {/* Main Simulation & Diagram Canvas */}
      <div className="flex-1 relative bg-slate-900/80 rounded-lg border border-slate-800 overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={760}
          height={340}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full object-contain"
        />
        <div className="absolute top-2 right-2 text-[10px] text-slate-500 flex items-center space-x-1 bg-slate-950/70 px-2 py-1 rounded border border-slate-800">
          <Move className="w-3 h-3 text-cyan-400" />
          <span>Drag load arrows horizontally</span>
        </div>
      </div>

      {/* Diagram Switcher & Load Controls */}
      <div className="mt-3 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
        {/* Diagram Selection Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-md border border-slate-800">
          <button
            onClick={() => setActiveDiagramTab('sfd')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeDiagramTab === 'sfd'
                ? 'bg-cyan-900/80 text-cyan-300 font-bold border border-cyan-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SFD Diagram
          </button>
          <button
            onClick={() => setActiveDiagramTab('bmd')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeDiagramTab === 'bmd'
                ? 'bg-purple-900/80 text-purple-300 font-bold border border-purple-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BMD Diagram
          </button>
          <button
            onClick={() => setActiveDiagramTab('deflection')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeDiagramTab === 'deflection'
                ? 'bg-emerald-900/80 text-emerald-300 font-bold border border-emerald-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Deflection Curve
          </button>
          <button
            onClick={() => setActiveDiagramTab('section_stress')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeDiagramTab === 'section_stress'
                ? 'bg-rose-900/80 text-rose-300 font-bold border border-rose-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Section Stress (σ & τ)
          </button>
        </div>

        {/* Add/Remove Point Loads & UDL Slider */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">UDL (w):</span>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={udlKNm}
              onChange={e => onUpdateUDL(parseFloat(e.target.value))}
              className="w-24 accent-red-500 cursor-pointer"
            />
            <span className="font-mono text-red-400 font-semibold w-10 text-right">
              {udlKNm} kN/m
            </span>
          </div>

          <button
            onClick={() => {
              if (pointLoads.length < 4) {
                onUpdatePointLoads([
                  ...pointLoads,
                  {
                    id: `p-${Date.now()}`,
                    position: Math.round((spanLengthM / 2) * 10) / 10,
                    magnitude: 20,
                  },
                ]);
              }
            }}
            disabled={pointLoads.length >= 4}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 text-[11px] font-medium"
          >
            <Plus className="w-3 h-3 text-cyan-400" />
            <span>Add Load</span>
          </button>

          {pointLoads.length > 0 && (
            <button
              onClick={() => onUpdatePointLoads(pointLoads.slice(0, -1))}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-300 border border-slate-700 text-[11px]"
              title="Remove Last Load"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
