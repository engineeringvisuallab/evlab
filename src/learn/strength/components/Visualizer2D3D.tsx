import React, { useRef, useEffect } from 'react';
import { 
  CalculationState, 
  Material, 
  PointLoad, 
  SectionProperties, 
  TopicId, 
  VisualMode 
} from '../types';
import { MohrCircleVisualizer } from './MohrCircleVisualizer';
import { StressStrainLabVisualizer } from './StressStrainLabVisualizer';
import { BeamBendingVisualizer } from './BeamBendingVisualizer';
import { TorsionVisualizer } from './TorsionVisualizer';
import { ColumnBucklingVisualizer } from './ColumnBucklingVisualizer';
import { formatEngValue } from '../core/units';

interface Visualizer2D3DProps {
  topicId: TopicId;
  calcState: CalculationState;
  material: Material;
  onMaterialChange: (m: Material) => void;
  section: SectionProperties;
  visualMode: VisualMode;
  deformationScale: number;
  // Interactive control callbacks
  onPointLoadsChange: (loads: PointLoad[]) => void;
  onUDLChange: (val: number) => void;
  onBeamSupportChange: (support: 'simply_supported' | 'cantilever' | 'fixed_fixed') => void;
  onTorqueChange: (val: number) => void;
  onLengthChange: (val: number) => void;
  onAxialLoadChange: (val: number) => void;
  onColumnEndChange: (cond: 'pin_pin' | 'fixed_fixed' | 'fixed_free' | 'fixed_pin') => void;
  onMohrRotationChange: (thetaDeg: number) => void;
}

export const Visualizer2D3D: React.FC<Visualizer2D3DProps> = ({
  topicId,
  calcState,
  material,
  onMaterialChange,
  section,
  visualMode,
  deformationScale,
  onPointLoadsChange,
  onUDLChange,
  onBeamSupportChange,
  onTorqueChange,
  onLengthChange,
  onAxialLoadChange,
  onColumnEndChange,
  onMohrRotationChange,
}) => {
  const genericCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Delegate to Specialized High-Fidelity Physics Labs
  if (topicId === 'mohrs_circle' || topicId === 'principal_stress') {
    return (
      <MohrCircleVisualizer
        mohrResult={calcState.mohr}
        onRotationChange={onMohrRotationChange}
      />
    );
  }

  if (topicId === 'stress_strain_lab' || topicId === 'hookes_law') {
    return (
      <StressStrainLabVisualizer
        material={material}
        onMaterialChange={onMaterialChange}
      />
    );
  }

  if (
    topicId === 'beam_bending' || 
    topicId === 'flexural_stress' || 
    topicId === 'beam_shear_stress' || 
    topicId === 'beam_deflection'
  ) {
    return (
      <BeamBendingVisualizer
        beamResult={calcState.beam}
        section={section}
        pointLoads={calcState.beamPointLoads}
        onUpdatePointLoads={onPointLoadsChange}
        udlKNm={calcState.beamUDL}
        onUpdateUDL={onUDLChange}
        spanLengthM={calcState.beamSpanLengthM}
        supportType={calcState.beamSupportType}
        onSupportTypeChange={onBeamSupportChange}
        visualMode={visualMode}
        deformationScale={deformationScale}
      />
    );
  }

  if (topicId === 'torsion') {
    return (
      <TorsionVisualizer
        torsionResult={calcState.torsion}
        material={material}
        section={section}
        appliedTorqueKNm={calcState.torsionTorqueKNm}
        onTorqueChange={onTorqueChange}
        shaftLengthM={calcState.torsionLengthM}
        onLengthChange={onLengthChange}
        visualMode={visualMode}
      />
    );
  }

  if (topicId === 'columns_buckling') {
    return (
      <ColumnBucklingVisualizer
        bucklingResult={calcState.buckling}
        material={material}
        section={section}
        columnLengthM={calcState.columnLengthM}
        onLengthChange={onLengthChange}
        appliedAxialLoadKN={calcState.columnAxialLoadKN}
        onAxialLoadChange={onAxialLoadChange}
        endCondition={calcState.columnEndCondition}
        onEndConditionChange={onColumnEndChange}
        visualMode={visualMode}
      />
    );
  }

  // 2. Generic Interactive Engine for Axial Stress, Pressure Vessels, Combined Loading, etc.
  useEffect(() => {
    const canvas = genericCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width * 0.5;
    const centerY = height * 0.5;

    if ((topicId as string) === 'pressure_vessels') {
      // Cylindrical and Spherical Pressure Vessel Visualizer
      const radiusPx = 75;
      const lengthPx = 180;

      // Vessel Outline
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(centerX - lengthPx / 2, centerY - radiusPx, lengthPx, radiusPx * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(centerX - lengthPx / 2, centerY - radiusPx, lengthPx, radiusPx * 2);

      // Internal Pressure Arrows (Radiating from inside)
      ctx.strokeStyle = '#f43f5e';
      ctx.fillStyle = '#f43f5e';
      ctx.lineWidth = 2;
      for (let x = centerX - lengthPx / 2 + 25; x < centerX + lengthPx / 2; x += 30) {
        // Upward internal arrow
        ctx.beginPath();
        ctx.moveTo(x, centerY);
        ctx.lineTo(x, centerY - radiusPx + 10);
        ctx.stroke();
        // Downward internal arrow
        ctx.beginPath();
        ctx.moveTo(x, centerY);
        ctx.lineTo(x, centerY + radiusPx - 10);
        ctx.stroke();
      }

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('Cylindrical Thin-Walled Pressure Vessel (r/t ≥ 10)', centerX - 160, 35);
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('Hoop Stress σ_h = P·r / t (Govern failure: 2× Longitudinal)', centerX - 180, height - 30);
      ctx.fillStyle = '#22c55e';
      ctx.fillText('Longitudinal Stress σ_L = P·r / (2t)', centerX - 120, height - 12);
    } else {
      // Axial Stress & Strain Bar Simulation
      const barLengthPx = 280;
      const barHeightPx = 45;
      const axialLoadKN = calcState.axialLoadKN;
      const deltaMm = calcState.axial.elongationMm * deformationScale;
      const deformedLengthPx = barLengthPx + Math.max(-40, Math.min(60, deltaMm * 10));

      // Fixed Wall
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(centerX - barLengthPx / 2 - 30, centerY - 45, 30, 90);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(centerX - barLengthPx / 2 - 30, centerY - 45, 30, 90);

      // Axial Bar
      ctx.fillStyle = axialLoadKN >= 0 ? '#0284c7' : '#d97706';
      ctx.fillRect(centerX - barLengthPx / 2, centerY - barHeightPx / 2, deformedLengthPx, barHeightPx);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - barLengthPx / 2, centerY - barHeightPx / 2, deformedLengthPx, barHeightPx);

      // Axial Force Vector
      const endX = centerX - barLengthPx / 2 + deformedLengthPx;
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.lineWidth = 3;
      if (axialLoadKN >= 0) {
        // Tension arrow (pulling right)
        ctx.beginPath();
        ctx.moveTo(endX, centerY);
        ctx.lineTo(endX + 50, centerY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(endX + 50, centerY);
        ctx.lineTo(endX + 40, centerY - 6);
        ctx.lineTo(endX + 40, centerY + 6);
        ctx.fill();
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`P = ${axialLoadKN} kN (Tension)`, endX + 8, centerY - 12);
      } else {
        // Compression arrow (pushing left)
        ctx.beginPath();
        ctx.moveTo(endX + 50, centerY);
        ctx.lineTo(endX, centerY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(endX, centerY);
        ctx.lineTo(endX + 10, centerY - 6);
        ctx.lineTo(endX + 10, centerY + 6);
        ctx.fill();
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`P = ${Math.abs(axialLoadKN)} kN (Compression)`, endX + 8, centerY - 12);
      }

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`Direct Axial Stress & Deformation: σ = P/A, δ = PL/AE`, centerX - 180, 35);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px monospace';
      ctx.fillText(`Stress: ${formatEngValue(calcState.axial.stressMPa)} MPa | Elongation δ: ${formatEngValue(calcState.axial.elongationMm)} mm`, centerX - 160, height - 25);
    }
  }, [topicId, calcState, material, section, visualMode, deformationScale]);

  return (
    <div className="flex flex-col h-full bg-slate-950 p-3 select-none">
      <div className="flex-1 relative bg-slate-900/80 rounded-lg border border-slate-800 overflow-hidden">
        <canvas
          ref={genericCanvasRef}
          width={760}
          height={380}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};
