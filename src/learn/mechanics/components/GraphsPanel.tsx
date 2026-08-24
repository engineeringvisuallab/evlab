import React, { useEffect, useRef } from 'react';
import { Activity, BarChart2, TrendingUp } from 'lucide-react';
import { TopicDefinition } from '../types/mechanics';

interface GraphsPanelProps {
  topic: TopicDefinition;
  parameters: Record<string, number>;
  computedData: Record<string, any>;
  isDark: boolean;
}

export const GraphsPanel: React.FC<GraphsPanelProps> = ({
  topic,
  parameters,
  computedData,
  isDark,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Render topic-specific plots
    if (topic.id === 'beams' && computedData.diagramPoints) {
      renderSfdBmd(ctx, width, height, computedData.diagramPoints);
    } else if (topic.id === 'mechanisms') {
      renderSliderCrankCurves(ctx, width, height, parameters);
    } else if (topic.id === 'projectile' && computedData.trajectory) {
      renderProjectileTrajectory(ctx, width, height, computedData.trajectory);
    } else if (topic.id === 'energy') {
      renderEnergyBar(ctx, width, height, computedData);
    } else {
      renderGenericCurve(ctx, width, height);
    }

    ctx.restore();
  }, [topic.id, parameters, computedData, isDark]);

  // SFD & BMD renderer
  const renderSfdBmd = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    points: { x: number; shearV: number; momentM: number; deflectionV?: number }[]
  ) => {
    const padL = 50;
    const padR = 25;
    const plotW = w - padL - padR;
    const halfH = (h - 60) / 2;

    // SFD (Top Half)
    const sfdZeroY = 30 + halfH / 2;
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(padL, sfdZeroY);
    ctx.lineTo(padL + plotW, sfdZeroY);
    ctx.stroke();

    ctx.font = 'bold 11px system-ui';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('Shear Force Diagram (SFD) [N]', padL, 20);

    const maxV = Math.max(10, ...points.map((p) => Math.abs(p.shearV)));
    const scaleY_V = (halfH * 0.4) / maxV;
    const maxX = points[points.length - 1]?.x || 6;

    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = '#3b82f620';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, sfdZeroY);
    points.forEach((p) => {
      const px = padL + (p.x / maxX) * plotW;
      const py = sfdZeroY - p.shearV * scaleY_V;
      ctx.lineTo(px, py);
    });
    ctx.lineTo(padL + plotW, sfdZeroY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // BMD (Bottom Half)
    const bmdZeroY = 45 + halfH + halfH / 2;
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(padL, bmdZeroY);
    ctx.lineTo(padL + plotW, bmdZeroY);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.fillText('Bending Moment Diagram (BMD) [N·m]', padL, 40 + halfH);

    const maxM = Math.max(10, ...points.map((p) => Math.abs(p.momentM)));
    const scaleY_M = (halfH * 0.4) / maxM;

    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#ef444420';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, bmdZeroY);
    points.forEach((p) => {
      const px = padL + (p.x / maxX) * plotW;
      const py = bmdZeroY - p.momentM * scaleY_M;
      ctx.lineTo(px, py);
    });
    ctx.lineTo(padL + plotW, bmdZeroY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Slider crank curves over 360 deg
  const renderSliderCrankCurves = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    params: Record<string, number>
  ) => {
    const padL = 40;
    const plotW = w - padL - 20;
    const midY = h / 2;

    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText('Piston Velocity v(θ) & Acceleration a(θ) over 360°', padL, 20);

    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(padL, midY);
    ctx.lineTo(padL + plotW, midY);
    ctx.stroke();

    const r = params.crankRadiusR || 0.08;
    const l = params.connectingRodL || 0.24;
    const lambda = r / l;

    // Velocity Curve (Blue)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let deg = 0; deg <= 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const vxNorm = -(Math.sin(rad) + (lambda / 2) * Math.sin(2 * rad));
      const px = padL + (deg / 360) * plotW;
      const py = midY - vxNorm * (h * 0.35);
      if (deg === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Acceleration Curve (Red)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let deg = 0; deg <= 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const axNorm = -(Math.cos(rad) + lambda * Math.cos(2 * rad));
      const px = padL + (deg / 360) * plotW;
      const py = midY - axNorm * (h * 0.35);
      if (deg === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Projectile trajectory
  const renderProjectileTrajectory = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    traj: { x: number; y: number }[]
  ) => {
    const padL = 40;
    const padB = 30;
    const plotW = w - padL - 20;
    const plotH = h - padB - 40;

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText('Ballistic 2D Trajectory Parabola y(x)', padL, 20);

    const maxX = Math.max(10, ...traj.map((p) => p.x));
    const maxY = Math.max(5, ...traj.map((p) => p.y));

    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = '#10b98120';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(padL, h - padB);
    traj.forEach((p) => {
      const px = padL + (p.x / maxX) * plotW;
      const py = h - padB - (p.y / maxY) * plotH;
      ctx.lineTo(px, py);
    });
    ctx.lineTo(padL + plotW, h - padB);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Energy distribution bar
  const renderEnergyBar = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    data: Record<string, any>
  ) => {
    const pe = data.potentialEnergyInitial || 100;
    const ke = data.kineticEnergyInitial || 0;
    const loss = data.frictionWorkLost || 0;
    const total = pe + ke + loss || 1;

    const padL = 40;
    const barW = w - padL - 40;
    const barY = h / 2 - 20;
    const barH = 40;

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText('Mechanical Energy Balance Breakdown (Joules)', padL, 30);

    const peW = (pe / total) * barW;
    const keW = (ke / total) * barW;
    const lossW = (loss / total) * barW;

    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(padL, barY, peW, barH);

    ctx.fillStyle = '#10b981';
    ctx.fillRect(padL + peW, barY, keW, barH);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(padL + peW + keW, barY, lossW, barH);

    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = '#ffffff';
    if (peW > 40) ctx.fillText(`PE: ${pe.toFixed(0)} J`, padL + 10, barY + 24);
    if (keW > 40) ctx.fillText(`KE: ${ke.toFixed(0)} J`, padL + peW + 10, barY + 24);
  };

  const renderGenericCurve = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Real-time dynamic engineering diagrams active', w / 2, h / 2);
  };

  return (
    <div
      ref={containerRef}
      id="graphs-panel"
      className={`h-full rounded-xl border p-4 flex flex-col space-y-2 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Engineering Diagrams & Plots
          </h2>
        </div>
      </div>
      <div className="w-full flex-1 relative min-h-[160px]">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
};
