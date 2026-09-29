/**
 * EVLab High-Precision 2D Fluid Mechanics Physics Canvas
 * Renders physically authentic flow fields, particle streamlines, pressure columns,
 * HGL/EGL grade lines, turbulent eddies, and free-surface hydraulics.
 */

import React, { useEffect, useRef } from 'react';
import { LabTopicId, SimulationControls, FluidProperty } from '../../types';

interface Canvas2DSimulatorProps {
  labId: LabTopicId;
  parameters: Record<string, any>;
  results: Record<string, any>;
  fluid: FluidProperty;
  controls: SimulationControls;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  offsetRatio: number; // -1 to +1 from conduit centerline
  color: string;
  size: number;
}

export const Canvas2DSimulator: React.FC<Canvas2DSimulatorProps> = ({
  labId,
  parameters,
  results,
  fluid,
  controls,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const timeAccumulatorRef = useRef<number>(0);

  // Initialize particle swarm
  useEffect(() => {
    const numParticles = controls.particleDensity === 'low' ? 70 : controls.particleDensity === 'medium' ? 160 : 280;
    const particles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * 900,
        y: Math.random() * 450,
        vx: 1.0,
        vy: 0,
        life: Math.random() * 300,
        maxLife: 200 + Math.random() * 200,
        offsetRatio: (Math.random() * 2 - 1) * 0.85,
        color: '#38bdf8',
        size: 2.0 + Math.random() * 1.5,
      });
    }
    particlesRef.current = particles;
  }, [labId, controls.particleDensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = (now: number) => {
      if (!isRunning) return;
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      if (controls.isPlaying) {
        timeAccumulatorRef.current += dt * controls.speed;
      }

      // Clear Canvas
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Draw Grid if enabled
      if (controls.showGrid) {
        drawEngineeringGrid(ctx, width, height);
      }

      // Route rendering based on active Lab Topic
      switch (labId) {
        case 'continuity':
          renderContinuityLab(ctx, width, height, parameters, results, particlesRef.current, dt, controls);
          break;
        case 'bernoulli':
          renderBernoulliLab(ctx, width, height, parameters, results, particlesRef.current, dt, controls);
          break;
        case 'reynolds':
          renderReynoldsLab(ctx, width, height, parameters, results, particlesRef.current, dt, controls, timeAccumulatorRef.current);
          break;
        case 'pipe-flow':
        case 'pipe-roughness':
        case 'minor-loss':
          renderPipeFlowLab(ctx, width, height, parameters, results, particlesRef.current, dt, controls, timeAccumulatorRef.current);
          break;
        case 'venturi':
          renderVenturiLab(ctx, width, height, parameters, results, particlesRef.current, dt, controls);
          break;
        case 'orifice':
          renderOrificeLab(ctx, width, height, parameters, results, particlesRef.current, dt, controls, timeAccumulatorRef.current);
          break;
        case 'weir':
          renderWeirLab(ctx, width, height, parameters, results, particlesRef.current, dt, controls, timeAccumulatorRef.current);
          break;
        case 'open-channel':
        case 'froude':
          renderOpenChannelLab(ctx, width, height, parameters, results, particlesRef.current, dt, controls, timeAccumulatorRef.current);
          break;
        case 'hydraulic-jump':
          renderHydraulicJumpLab(ctx, width, height, parameters, results, particlesRef.current, dt, controls, timeAccumulatorRef.current);
          break;
        case 'pumps':
        case 'pump-curves':
          renderPumpsLab(ctx, width, height, parameters, results, particlesRef.current, dt, controls, timeAccumulatorRef.current);
          break;
        default:
          renderGenericConduit(ctx, width, height, results, particlesRef.current, dt, controls);
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [labId, parameters, results, fluid, controls]);

  return (
    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        width={960}
        height={480}
        className="w-full h-full object-contain"
        id="fluid-2d-canvas"
      />
    </div>
  );
};

// ==========================================
// INDIVIDUAL LAB RENDERERS
// ==========================================

function drawEngineeringGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)'; // slate-700
  ctx.lineWidth = 0.75;
  const step = 40;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 1. Continuity Lab
 */
function renderContinuityLab(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: any,
  results: any,
  particles: Particle[],
  dt: number,
  controls: SimulationControls
) {
  const d1 = params.d1 || 0.1;
  const d2 = params.d2 || 0.05;
  const v1 = results.v1 || 1.0;
  const v2 = results.v2 || 4.0;

  const cy = h / 2;
  const r1 = Math.max(25, Math.min(100, (d1 / 0.15) * 60));
  const r2 = Math.max(12, Math.min(100, (d2 / 0.15) * 60));

  const x0 = 80;
  const x1 = 340;
  const x2 = 540;
  const x3 = 880;

  // Pipe Boundary Geometry
  ctx.save();
  // Fluid filled background
  const fluidGrad = ctx.createLinearGradient(0, cy - r1, 0, cy + r1);
  fluidGrad.addColorStop(0, 'rgba(14, 165, 233, 0.35)');
  fluidGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.2)');
  fluidGrad.addColorStop(1, 'rgba(14, 165, 233, 0.35)');

  ctx.fillStyle = fluidGrad;
  ctx.beginPath();
  ctx.moveTo(x0, cy - r1);
  ctx.lineTo(x1, cy - r1);
  ctx.lineTo(x2, cy - r2);
  ctx.lineTo(x3, cy - r2);
  ctx.lineTo(x3, cy + r2);
  ctx.lineTo(x2, cy + r2);
  ctx.lineTo(x1, cy + r1);
  ctx.lineTo(x0, cy + r1);
  ctx.closePath();
  ctx.fill();

  // Pipe Solid Walls
  ctx.strokeStyle = '#94a3b8'; // slate-400
  ctx.lineWidth = 4;
  ctx.beginPath();
  // Top wall
  ctx.moveTo(x0, cy - r1);
  ctx.lineTo(x1, cy - r1);
  ctx.lineTo(x2, cy - r2);
  ctx.lineTo(x3, cy - r2);
  // Bottom wall
  ctx.moveTo(x0, cy + r1);
  ctx.lineTo(x1, cy + r1);
  ctx.lineTo(x2, cy + r2);
  ctx.lineTo(x3, cy + r2);
  ctx.stroke();

  // Flanges
  ctx.fillStyle = '#64748b';
  ctx.fillRect(x0 - 12, cy - r1 - 8, 12, (r1 * 2) + 16);
  ctx.fillRect(x3, cy - r2 - 8, 12, (r2 * 2) + 16);

  // Dimension labels if enabled
  if (controls.showDimensions) {
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px monospace';
    ctx.lineWidth = 1;

    // D1 dimension
    ctx.beginPath();
    ctx.moveTo(x0 + 40, cy - r1);
    ctx.lineTo(x0 + 40, cy + r1);
    ctx.stroke();
    ctx.fillText(`D₁ = ${(d1 * 1000).toFixed(0)} mm`, x0 + 48, cy - 10);
    ctx.fillText(`V₁ = ${v1.toFixed(2)} m/s`, x0 + 48, cy + 15);

    // D2 dimension
    ctx.beginPath();
    ctx.moveTo(x2 + 80, cy - r2);
    ctx.lineTo(x2 + 80, cy + r2);
    ctx.stroke();
    ctx.fillText(`D₂ = ${(d2 * 1000).toFixed(0)} mm`, x2 + 88, cy - 10);
    ctx.fillText(`V₂ = ${v2.toFixed(2)} m/s`, x2 + 88, cy + 15);
  }

  // Update and draw flowing particles
  particles.forEach((p) => {
    if (controls.isPlaying) {
      // Determine local conduit radius and speed based on X position
      let localRadius = r1;
      let localV = v1;
      if (p.x < x1) {
        localRadius = r1;
        localV = v1;
      } else if (p.x >= x1 && p.x <= x2) {
        const t = (p.x - x1) / (x2 - x1);
        localRadius = r1 + t * (r2 - r1);
        localV = v1 + t * (v2 - v1);
      } else {
        localRadius = r2;
        localV = v2;
      }

      // Parabolic poiseuille-like profile modifier
      const rRatio = Math.abs(p.offsetRatio);
      const velocityProfileFactor = Math.max(0.2, 1.0 - 0.7 * Math.pow(rRatio, 2));
      const speedPxPerSec = Math.max(30, localV * 70 * controls.speed);

      p.x += speedPxPerSec * velocityProfileFactor * dt;
      p.y = cy + p.offsetRatio * (localRadius - 4);

      // Loop particles
      if (p.x > x3) {
        p.x = x0;
        p.offsetRatio = (Math.random() * 2 - 1) * 0.85;
      }
    }

    // Color by local velocity heatmap
    const speedRatio = Math.min(1.0, (v2 > 0 ? (p.x > x2 ? v2 : v1) / Math.max(v2, 0.1) : 0.5));
    const r = Math.floor(56 + 199 * speedRatio);
    const g = Math.floor(189 - 50 * speedRatio);
    const b = Math.floor(248 - 180 * speedRatio);

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    // Streamline tails if enabled
    if (controls.showStreamlines) {
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 18 * (v2 > v1 ? 1.5 : 1.0), p.y);
      ctx.stroke();
    }
  });

  // Vector arrows if enabled
  if (controls.showVectors) {
    drawVelocityVector(ctx, x0 + 100, cy, v1 * 25, '#38bdf8', `V₁`);
    drawVelocityVector(ctx, x2 + 120, cy, Math.min(120, v2 * 25), '#ef4444', `V₂`);
  }

  ctx.restore();
}

/**
 * 2. Bernoulli Energy Lab with HGL / EGL
 */
function renderBernoulliLab(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: any,
  results: any,
  particles: Particle[],
  dt: number,
  controls: SimulationControls
) {
  const z1 = params.z1 ?? 8;
  const z2 = params.z2 ?? 3;
  const v1 = results.v1 || 1.5;
  const v2 = results.v2 || 3.0;
  const egl1 = results.egl1 || 12;
  const egl2 = results.egl2 || 10;
  const hgl1 = results.hgl1 || 11.5;
  const hgl2 = results.hgl2 || 8.5;

  const baseY = 400; // Datum line at y = 400
  const scaleZ = 18; // 18 px per meter

  const pipeY1 = baseY - (z1 * scaleZ);
  const pipeY2 = baseY - (z2 * scaleZ);

  const x1 = 120;
  const x2 = 450;
  const x3 = 840;
  const rPipe = 22;

  ctx.save();

  // Datum Reference Line
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, baseY);
  ctx.lineTo(900, baseY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px monospace';
  ctx.fillText('Reference Elevation Datum (z = 0)', 80, baseY + 18);

  // Draw Pipe Body
  const pipeGrad = ctx.createLinearGradient(0, pipeY1 - rPipe, 0, pipeY2 + rPipe);
  pipeGrad.addColorStop(0, 'rgba(14, 165, 233, 0.3)');
  pipeGrad.addColorStop(1, 'rgba(56, 189, 248, 0.15)');

  ctx.fillStyle = pipeGrad;
  ctx.beginPath();
  ctx.moveTo(x1, pipeY1 - rPipe);
  ctx.lineTo(x2, pipeY1 - rPipe);
  ctx.lineTo(x3, pipeY2 - rPipe);
  ctx.lineTo(x3, pipeY2 + rPipe);
  ctx.lineTo(x2, pipeY1 + rPipe);
  ctx.lineTo(x1, pipeY1 + rPipe);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3.5;
  // Top pipe wall
  ctx.beginPath();
  ctx.moveTo(x1, pipeY1 - rPipe);
  ctx.lineTo(x2, pipeY1 - rPipe);
  ctx.lineTo(x3, pipeY2 - rPipe);
  ctx.stroke();
  // Bottom pipe wall
  ctx.beginPath();
  ctx.moveTo(x1, pipeY1 + rPipe);
  ctx.lineTo(x2, pipeY1 + rPipe);
  ctx.lineTo(x3, pipeY2 + rPipe);
  ctx.stroke();

  // Piezometer Tubes at Station 1 and Station 2
  const piezometerY1 = baseY - (hgl1 * scaleZ);
  const piezometerY2 = baseY - (hgl2 * scaleZ);
  const totalHeadY1 = baseY - (egl1 * scaleZ);
  const totalHeadY2 = baseY - (egl2 * scaleZ);

  // Tube 1
  ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.fillRect(x1 + 80, piezometerY1, 14, (pipeY1 - rPipe) - piezometerY1);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x1 + 80, Math.min(totalHeadY1 - 20, piezometerY1 - 20), 14, (pipeY1 - rPipe) - Math.min(totalHeadY1 - 20, piezometerY1 - 20));

  // Tube 2
  ctx.fillRect(x3 - 80, piezometerY2, 14, (pipeY2 - rPipe) - piezometerY2);
  ctx.strokeRect(x3 - 80, Math.min(totalHeadY2 - 20, piezometerY2 - 20), 14, (pipeY2 - rPipe) - Math.min(totalHeadY2 - 20, piezometerY2 - 20));

  // Draw HGL & EGL Lines
  if (controls.showHglEgl) {
    // EGL (Red Dash)
    ctx.strokeStyle = '#ef4444'; // red-500
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, totalHeadY1);
    ctx.lineTo(x3, totalHeadY2);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('EGL (Total Energy Head = z + P/γ + V²/2g)', x1 + 10, totalHeadY1 - 10);

    // HGL (Blue Dash)
    ctx.strokeStyle = '#38bdf8'; // sky-400
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, piezometerY1);
    ctx.lineTo(x3, piezometerY2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText('HGL (Piezometric Head = z + P/γ)', x1 + 10, piezometerY1 - 10);
  }

  // Draw flowing particles through pipe
  particles.forEach((p) => {
    if (controls.isPlaying) {
      const speed = v1 * 60 * controls.speed;
      p.x += speed * dt;
      if (p.x > x3) p.x = x1;
    }

    let pipeY = pipeY1;
    if (p.x >= x2) {
      const t = (p.x - x2) / (x3 - x2);
      pipeY = pipeY1 + t * (pipeY2 - pipeY1);
    }
    p.y = pipeY + p.offsetRatio * (rPipe - 4);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * 3. Reynolds Number Flow Regime Lab
 */
function renderReynoldsLab(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: any,
  results: any,
  particles: Particle[],
  dt: number,
  controls: SimulationControls,
  time: number
) {
  const Re = results.reynolds || 2000;
  const regime = results.regime || 'laminar';
  const cy = h / 2;
  const pipeRadius = 75;
  const x0 = 80;
  const x1 = 880;

  ctx.save();

  // Glass tube container
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(x0, cy - pipeRadius, x1 - x0, pipeRadius * 2);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  ctx.strokeRect(x0, cy - pipeRadius, x1 - x0, pipeRadius * 2);

  // Dye Injector Needle on Left
  ctx.fillStyle = '#ef4444'; // Red dye injector
  ctx.fillRect(x0 - 25, cy - 3, 45, 6);
  ctx.fillStyle = '#f87171';
  ctx.beginPath();
  ctx.moveTo(x0 + 20, cy - 5);
  ctx.lineTo(x0 + 35, cy);
  ctx.lineTo(x0 + 20, cy + 5);
  ctx.closePath();
  ctx.fill();

  // Dye stream simulation
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x0 + 35, cy);

  if (regime === 'laminar') {
    // Pure straight horizontal laminar line
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.lineTo(x1, cy);
    ctx.stroke();

    // Secondary parallel dye filaments
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0 + 35, cy - 25);
    ctx.lineTo(x1, cy - 25);
    ctx.moveTo(x0 + 35, cy + 25);
    ctx.lineTo(x1, cy + 25);
    ctx.stroke();
  } else if (regime === 'transitional') {
    // Laminar for first third, then sine wave perturbation
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
    for (let x = x0 + 35; x <= x1; x += 6) {
      const relX = (x - x0) / (x1 - x0);
      let offset = 0;
      if (relX > 0.35) {
        const amp = (relX - 0.35) * 28;
        offset = Math.sin((x * 0.04) - time * 6) * amp;
      }
      ctx.lineTo(x, cy + offset);
    }
    ctx.stroke();
  } else {
    // Turbulent: violent chaotic vortex swirling and dispersion
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    for (let x = x0 + 35; x <= x1; x += 5) {
      const relX = (x - x0) / (x1 - x0);
      let offset = 0;
      if (relX > 0.15) {
        const amp = Math.min(pipeRadius - 10, (relX - 0.15) * 65);
        offset = Math.sin((x * 0.08) - time * 12) * amp * 0.6 +
                 Math.cos((x * 0.15) + time * 8) * (amp * 0.4);
      }
      ctx.lineTo(x, cy + offset);
    }
    ctx.stroke();
  }

  // Draw background water particles
  particles.forEach((p) => {
    if (controls.isPlaying) {
      let speed = 90 * controls.speed;
      let vyNoise = 0;

      if (regime === 'laminar') {
        // Poiseuille parabolic profile: u(r) = u_max * (1 - (r/R)^2)
        const rRatio = Math.abs(p.offsetRatio);
        speed *= (1.0 - Math.pow(rRatio, 2));
      } else if (regime === 'transitional') {
        const rRatio = Math.abs(p.offsetRatio);
        speed *= (1.0 - 0.4 * Math.pow(rRatio, 2));
        if (p.x > 300) vyNoise = Math.sin(time * 8 + p.x) * 15;
      } else {
        // Flat turbulent power-law velocity profile u ~ (1 - r/R)^(1/7) with chaotic eddies
        const rRatio = Math.abs(p.offsetRatio);
        speed *= Math.pow(Math.max(0.05, 1.0 - rRatio), 1 / 7);
        vyNoise = (Math.sin(time * 15 + p.x * 0.05) + Math.cos(time * 10 + p.y * 0.1)) * 30;
      }

      p.x += speed * dt;
      p.y = cy + p.offsetRatio * (pipeRadius - 6) + vyNoise * dt;

      if (p.x > x1) {
        p.x = x0;
        p.offsetRatio = (Math.random() * 2 - 1) * 0.9;
      }
    }

    ctx.fillStyle = regime === 'laminar' ? '#10b981' : regime === 'transitional' ? '#f59e0b' : '#ef4444';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Flow Regime Banner
  ctx.fillStyle = regime === 'laminar' ? '#10b981' : regime === 'transitional' ? '#f59e0b' : '#ef4444';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(`FLOW REGIME: ${regime.toUpperCase()} (Re = ${Re.toFixed(0)})`, x0 + 10, cy - pipeRadius - 15);

  ctx.restore();
}

/**
 * 4. Pipe Flow & Roughness Lab
 */
function renderPipeFlowLab(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: any,
  results: any,
  particles: Particle[],
  dt: number,
  controls: SimulationControls,
  time: number
) {
  const v = results.velocity || 2.0;
  const hf = results.hf || 4.5;
  const roughness = params.roughness_mm || 0.045;
  const cy = h / 2;
  const rPipe = 60;
  const x0 = 80;
  const x1 = 880;

  ctx.save();

  // Pipe inner body
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(x0, cy - rPipe, x1 - x0, rPipe * 2);

  // Pipe wall with roughness texture
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 5;
  ctx.strokeRect(x0, cy - rPipe, x1 - x0, rPipe * 2);

  // Draw sand-grain roughness asperities on top and bottom walls
  const numGrains = 60;
  const grainHeight = Math.min(14, Math.max(2, (roughness / 0.8) * 8));
  ctx.fillStyle = '#94a3b8';
  for (let i = 0; i < numGrains; i++) {
    const gx = x0 + (i / numGrains) * (x1 - x0);
    // Top wall grains
    ctx.beginPath();
    ctx.arc(gx, cy - rPipe + 2, grainHeight * 0.5, 0, Math.PI);
    ctx.fill();
    // Bottom wall grains
    ctx.beginPath();
    ctx.arc(gx, cy + rPipe - 2, grainHeight * 0.5, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  // Draw moving particles
  particles.forEach((p) => {
    if (controls.isPlaying) {
      const rRatio = Math.abs(p.offsetRatio);
      // Rough wall boundary layer retardation
      const wallRetardation = Math.max(0.1, 1.0 - Math.pow(rRatio, 3.5));
      const speed = v * 50 * wallRetardation * controls.speed;
      p.x += speed * dt;
      if (p.x > x1) p.x = x0;
    }
    p.y = cy + p.offsetRatio * (rPipe - 8);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Friction Loss indicator
  ctx.fillStyle = '#f87171';
  ctx.font = '13px monospace';
  ctx.fillText(`Darcy Friction Head Loss h_f = ${hf.toFixed(3)} m  |  Roughness ε = ${roughness.toFixed(3)} mm`, x0 + 10, cy - rPipe - 16);

  ctx.restore();
}

/**
 * 5. Venturi Meter Lab
 */
function renderVenturiLab(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: any,
  results: any,
  particles: Particle[],
  dt: number,
  controls: SimulationControls
) {
  const d1 = params.d1 || 0.2;
  const d2 = params.d2 || 0.1;
  const v1 = results.v1 || 1.2;
  const v2 = results.v2 || 4.8;
  const deltaH = results.deltaH || 1.2;

  const cy = h / 2;
  const r1 = 65;
  const r2 = Math.max(18, (d2 / d1) * r1);

  const x0 = 80;
  const x1 = 300; // start of converging cone
  const x2 = 420; // throat inlet
  const x3 = 540; // throat outlet
  const x4 = 780; // end of diffuser cone
  const x5 = 880;

  ctx.save();

  // Fluid body
  const grad = ctx.createLinearGradient(0, cy - r1, 0, cy + r1);
  grad.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
  grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.2)');
  grad.addColorStop(1, 'rgba(14, 165, 233, 0.4)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x0, cy - r1);
  ctx.lineTo(x1, cy - r1);
  ctx.lineTo(x2, cy - r2);
  ctx.lineTo(x3, cy - r2);
  ctx.lineTo(x4, cy - r1);
  ctx.lineTo(x5, cy - r1);
  ctx.lineTo(x5, cy + r1);
  ctx.lineTo(x4, cy + r1);
  ctx.lineTo(x3, cy + r2);
  ctx.lineTo(x2, cy + r2);
  ctx.lineTo(x1, cy + r1);
  ctx.lineTo(x0, cy + r1);
  ctx.closePath();
  ctx.fill();

  // Solid Walls
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  // Top contour (converging 21°, throat, diffuser 7°)
  ctx.moveTo(x0, cy - r1);
  ctx.lineTo(x1, cy - r1);
  ctx.lineTo(x2, cy - r2);
  ctx.lineTo(x3, cy - r2);
  ctx.lineTo(x4, cy - r1);
  ctx.lineTo(x5, cy - r1);
  // Bottom contour
  ctx.moveTo(x0, cy + r1);
  ctx.lineTo(x1, cy + r1);
  ctx.lineTo(x2, cy + r2);
  ctx.lineTo(x3, cy + r2);
  ctx.lineTo(x4, cy + r1);
  ctx.lineTo(x5, cy + r1);
  ctx.stroke();

  // Manometer tubes at Inlet (x1-60) and Throat (x2+60)
  const manoX1 = x1 - 60;
  const manoX2 = (x2 + x3) / 2;
  const h1 = 110;
  const h2 = Math.max(25, h1 - (deltaH * 40));

  // Inlet manometer
  ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.fillRect(manoX1 - 7, (cy - r1) - h1, 14, h1);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(manoX1 - 7, (cy - r1) - 130, 14, 130);

  // Throat manometer
  ctx.fillRect(manoX2 - 7, (cy - r2) - h2, 14, h2);
  ctx.strokeRect(manoX2 - 7, (cy - r2) - 130, 14, 130);

  // Differential head indicator Δh
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(manoX1 + 15, (cy - r1) - h1);
  ctx.lineTo(manoX2 - 15, (cy - r1) - h1);
  ctx.moveTo(manoX2 + 15, (cy - r2) - h2);
  ctx.lineTo(manoX2 + 45, (cy - r2) - h2);
  ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.font = '11px monospace';
  ctx.fillText(`Δh = ${deltaH.toFixed(3)} m`, manoX2 + 15, (cy - r2) - ((h1 + h2) / 2) + 15);

  // Particles
  particles.forEach((p) => {
    if (controls.isPlaying) {
      let localR = r1;
      let localV = v1;

      if (p.x < x1) {
        localR = r1;
        localV = v1;
      } else if (p.x >= x1 && p.x <= x2) {
        const t = (p.x - x1) / (x2 - x1);
        localR = r1 + t * (r2 - r1);
        localV = v1 + t * (v2 - v1);
      } else if (p.x > x2 && p.x <= x3) {
        localR = r2;
        localV = v2;
      } else if (p.x > x3 && p.x <= x4) {
        const t = (p.x - x3) / (x4 - x3);
        localR = r2 + t * (r1 - r2);
        localV = v2 + t * (v1 - v2);
      } else {
        localR = r1;
        localV = v1;
      }

      p.x += localV * 45 * controls.speed * dt;
      p.y = cy + p.offsetRatio * (localR - 4);

      if (p.x > x5) {
        p.x = x0;
        p.offsetRatio = (Math.random() * 2 - 1) * 0.85;
      }
    }

    const speedRatio = Math.min(1.0, (p.x >= x2 && p.x <= x3 ? 1.0 : (p.x < x1 || p.x > x4 ? 0.2 : 0.6)));
    ctx.fillStyle = speedRatio > 0.7 ? '#ef4444' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * 6. Orifice and Free Jet Trajectory Lab
 */
function renderOrificeLab(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: any,
  results: any,
  particles: Particle[],
  dt: number,
  controls: SimulationControls,
  time: number
) {
  const tankHead = params.tankHead || 3.0;
  const vActual = results.vActual || 7.5;
  const tankW = 220;
  const tankH = 340;
  const tankX = 80;
  const tankY = 80;

  const orificeY = tankY + 240;
  const orificeR = 14;
  const waterLevelY = Math.max(tankY + 20, orificeY - (tankHead * 45));

  ctx.save();

  // Draw Tank Fluid
  ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
  ctx.fillRect(tankX, waterLevelY, tankW, (tankY + tankH) - waterLevelY);

  // Tank Free Surface wave animation
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(tankX, waterLevelY);
  for (let x = tankX; x <= tankX + tankW; x += 10) {
    const wy = waterLevelY + Math.sin((x * 0.05) + time * 3) * 2;
    ctx.lineTo(x, wy);
  }
  ctx.lineTo(tankX + tankW, waterLevelY + 8);
  ctx.lineTo(tankX, waterLevelY + 8);
  ctx.closePath();
  ctx.fill();

  // Tank Solid Boundary with Orifice Cutout
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  // Left wall
  ctx.moveTo(tankX, tankY);
  ctx.lineTo(tankX, tankY + tankH);
  // Bottom wall
  ctx.lineTo(tankX + tankW, tankY + tankH);
  // Right lower wall
  ctx.lineTo(tankX + tankW, orificeY + orificeR);
  // Right upper wall
  ctx.moveTo(tankX + tankW, orificeY - orificeR);
  ctx.lineTo(tankX + tankW, tankY);
  ctx.stroke();

  // Parabolic Free Jet Trajectory: y = g x^2 / (2 V^2)
  const jetStartX = tankX + tankW;
  const jetStartY = orificeY;

  ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.beginPath();
  ctx.moveTo(jetStartX, jetStartY - orificeR * 0.65); // Vena contracta
  for (let x = 0; x <= 560; x += 8) {
    const drop = (9.80665 * Math.pow(x * 0.03, 2)) / (2 * Math.pow(Math.max(1, vActual), 2)) * 80;
    ctx.lineTo(jetStartX + x, (jetStartY - (orificeR * 0.65)) + drop);
  }
  for (let x = 560; x >= 0; x -= 8) {
    const drop = (9.80665 * Math.pow(x * 0.03, 2)) / (2 * Math.pow(Math.max(1, vActual), 2)) * 80;
    ctx.lineTo(jetStartX + x, (jetStartY + (orificeR * 0.65)) + drop);
  }
  ctx.closePath();
  ctx.fill();

  // Particles inside jet
  particles.forEach((p) => {
    if (controls.isPlaying) {
      if (p.x < jetStartX) {
        // Inside tank, slow downward drift towards orifice
        p.y += 20 * dt;
        p.x += (jetStartX - p.x) * 0.05 * dt;
        if (p.y > orificeY + 40 || p.x > jetStartX) {
          p.x = jetStartX;
          p.y = jetStartY + (Math.random() * 2 - 1) * (orificeR * 0.6);
        }
      } else {
        // In parabolic projectile trajectory
        const forwardSpeed = vActual * 60 * controls.speed;
        p.x += forwardSpeed * dt;
        const relX = (p.x - jetStartX) * 0.03;
        const drop = (9.80665 * Math.pow(relX, 2)) / (2 * Math.pow(Math.max(1, vActual), 2)) * 80;
        p.y = jetStartY + drop + (p.offsetRatio * orificeR * 0.5);

        if (p.x > 900 || p.y > 450) {
          p.x = tankX + Math.random() * (tankW - 20);
          p.y = waterLevelY + Math.random() * (orificeY - waterLevelY);
        }
      }
    }

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Jet Torricelli annotation
  ctx.fillStyle = '#38bdf8';
  ctx.font = '13px monospace';
  ctx.fillText(`Torricelli Jet Velocity V = √(2gh) = ${vActual.toFixed(2)} m/s`, jetStartX + 40, orificeY - 40);

  ctx.restore();
}

/**
 * 7. Weir Lab
 */
function renderWeirLab(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: any,
  results: any,
  particles: Particle[],
  dt: number,
  controls: SimulationControls,
  time: number
) {
  const headH = params.headOverCrest || 0.25;
  const weirType = params.type || 'rectangular';
  const Q = results.Q || 0.05;

  const weirX = 420;
  const weirCrestY = 280;
  const upstreamWaterY = Math.max(120, weirCrestY - (headH * 220));

  ctx.save();

  // Upstream Water Body
  ctx.fillStyle = 'rgba(14, 165, 233, 0.45)';
  ctx.fillRect(80, upstreamWaterY, weirX - 80, 420 - upstreamWaterY);

  // Weir Wall Solid
  ctx.fillStyle = '#64748b';
  ctx.fillRect(weirX, weirCrestY, 24, 420 - weirCrestY);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(weirX, weirCrestY, 24, 420 - weirCrestY);

  // Flowing Nappe Waterfall over crest
  ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
  ctx.beginPath();
  ctx.moveTo(weirX, upstreamWaterY);
  ctx.bezierCurveTo(weirX + 40, upstreamWaterY - 10, weirX + 80, weirCrestY + 20, weirX + 180, 420);
  ctx.lineTo(weirX + 300, 420);
  ctx.bezierCurveTo(weirX + 160, weirCrestY + 60, weirX + 80, weirCrestY + 10, weirX + 24, weirCrestY);
  ctx.closePath();
  ctx.fill();

  // Aerated cavity under nappe label
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px monospace';
  ctx.fillText('Aerated Air Pocket Under Nappe', weirX + 40, weirCrestY + 50);

  // Particles flowing over crest
  particles.forEach((p) => {
    if (controls.isPlaying) {
      if (p.x < weirX) {
        p.x += 40 * controls.speed * dt;
        p.y = upstreamWaterY + Math.random() * (weirCrestY - upstreamWaterY);
      } else {
        // Accelerating over nappe
        p.x += 120 * controls.speed * dt;
        p.y += 180 * controls.speed * dt;
        if (p.x > 850 || p.y > 420) {
          p.x = 90 + Math.random() * 200;
          p.y = upstreamWaterY + Math.random() * 50;
        }
      }
    }

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Weir Head dimension H
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(weirX - 80, upstreamWaterY);
  ctx.lineTo(weirX - 80, weirCrestY);
  ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.font = '12px monospace';
  ctx.fillText(`Head over Crest H = ${headH.toFixed(3)} m`, weirX - 250, (upstreamWaterY + weirCrestY) / 2);

  ctx.restore();
}

/**
 * 8. Open Channel & Froude Flow Lab
 */
function renderOpenChannelLab(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: any,
  results: any,
  particles: Particle[],
  dt: number,
  controls: SimulationControls,
  time: number
) {
  const y = results.waterDepth || params.waterDepth || 1.0;
  const v = results.velocity || 1.8;
  const Fr = results.Fr || 0.6;
  const regime = results.regime || 'subcritical';

  const bedY1 = 340;
  const bedY2 = 380; // mild slope downward
  const scaleY = 60;
  const waterDepthPx = Math.max(20, y * scaleY);

  const x0 = 80;
  const x1 = 880;

  ctx.save();

  // Channel Bed Solid
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(x0, bedY1);
  ctx.lineTo(x1, bedY2);
  ctx.lineTo(x1, 440);
  ctx.lineTo(x0, 440);
  ctx.closePath();
  ctx.fill();

  // Water Volume
  const waterGrad = ctx.createLinearGradient(0, bedY1 - waterDepthPx, 0, bedY2);
  waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
  waterGrad.addColorStop(1, 'rgba(14, 165, 233, 0.6)');

  ctx.fillStyle = waterGrad;
  ctx.beginPath();
  ctx.moveTo(x0, bedY1 - waterDepthPx);
  // Free surface with surface wave ripples
  for (let x = x0; x <= x1; x += 15) {
    const t = (x - x0) / (x1 - x0);
    const localBed = bedY1 + t * (bedY2 - bedY1);
    const ripple = Math.sin((x * 0.05) - (time * (Fr > 1 ? 12 : 5))) * (Fr > 1 ? 4 : 2);
    ctx.lineTo(x, (localBed - waterDepthPx) + ripple);
  }
  ctx.lineTo(x1, bedY2);
  ctx.lineTo(x0, bedY1);
  ctx.closePath();
  ctx.fill();

  // Particles with boundary layer velocity gradient
  particles.forEach((p) => {
    if (controls.isPlaying) {
      const t = (p.x - x0) / (x1 - x0);
      const localBed = bedY1 + t * (bedY2 - bedY1);
      const distFromBed = (localBed - p.y) / waterDepthPx;

      // Logarithmic / Power-law velocity profile in open channel
      const localV = v * Math.pow(Math.max(0.1, Math.min(1.0, distFromBed)), 1 / 6);
      p.x += localV * 55 * controls.speed * dt;
      if (p.x > x1) p.x = x0;
    }

    const t = (p.x - x0) / (x1 - x0);
    const localBed = bedY1 + t * (bedY2 - bedY1);
    p.y = localBed - (Math.abs(p.offsetRatio) * (waterDepthPx - 6));

    ctx.fillStyle = regime === 'supercritical' ? '#ef4444' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Froude Info Overlay
  ctx.fillStyle = regime === 'supercritical' ? '#ef4444' : '#10b981';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`FLOW STATE: ${regime.toUpperCase()}  |  Froude Fr = ${Fr.toFixed(3)}  |  Mean V = ${v.toFixed(2)} m/s`, x0 + 10, bedY1 - waterDepthPx - 25);

  ctx.restore();
}

/**
 * 9. Hydraulic Jump Lab (Supercritical to Subcritical Shock Wave)
 */
function renderHydraulicJumpLab(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: any,
  results: any,
  particles: Particle[],
  dt: number,
  controls: SimulationControls,
  time: number
) {
  const y1 = results.y1 || params.upstreamDepth_y1 || 0.4;
  const y2 = results.sequentDepth_y2 || 1.5;
  const Fr1 = results.Fr1 || 3.0;
  const deltaE = results.energyLoss_DeltaE || 0.8;

  const bedY = 360;
  const scaleY = 100;
  const y1Px = Math.max(18, y1 * scaleY);
  const y2Px = Math.min(220, y2 * scaleY);

  const x0 = 80;
  const xJumpStart = 320;
  const xJumpEnd = 580;
  const x1 = 880;

  ctx.save();

  // Channel Bed
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x0, bedY, x1 - x0, 80);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.strokeRect(x0, bedY, x1 - x0, 80);

  // Water Profile Path
  ctx.fillStyle = 'rgba(14, 165, 233, 0.5)';
  ctx.beginPath();
  ctx.moveTo(x0, bedY - y1Px);
  ctx.lineTo(xJumpStart, bedY - y1Px);
  // Turbulent jump roller curve
  ctx.bezierCurveTo(xJumpStart + 80, bedY - y1Px - 10, xJumpEnd - 80, bedY - y2Px + 15, xJumpEnd, bedY - y2Px);
  ctx.lineTo(x1, bedY - y2Px);
  ctx.lineTo(x1, bedY);
  ctx.lineTo(x0, bedY);
  ctx.closePath();
  ctx.fill();

  // Violent Turbulent Surface Roller Vortices
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  const rollerX = (xJumpStart + xJumpEnd) / 2;
  const rollerY = bedY - (y1Px + y2Px) / 2;

  for (let i = 0; i < 4; i++) {
    const angle = time * 8 + i * (Math.PI / 2);
    const rad = 25 + i * 5;
    ctx.beginPath();
    ctx.arc(rollerX + Math.cos(angle) * 15, rollerY + Math.sin(angle) * 8, rad, 0, Math.PI * 1.5);
    ctx.stroke();
  }

  // Particle motion
  particles.forEach((p) => {
    if (controls.isPlaying) {
      if (p.x < xJumpStart) {
        // Fast shooting supercritical jet
        p.x += 180 * controls.speed * dt;
        p.y = bedY - (Math.abs(p.offsetRatio) * (y1Px - 4));
      } else if (p.x >= xJumpStart && p.x <= xJumpEnd) {
        // Recirculation and deceleration inside roller
        p.x += 60 * controls.speed * dt;
        const t = (p.x - xJumpStart) / (xJumpEnd - xJumpStart);
        const localHeight = y1Px + t * (y2Px - y1Px);
        p.y = bedY - (Math.abs(p.offsetRatio) * localHeight) + Math.sin(time * 12 + p.x) * 12;
      } else {
        // Slow deep subcritical flow
        p.x += 45 * controls.speed * dt;
        p.y = bedY - (Math.abs(p.offsetRatio) * (y2Px - 6));
      }

      if (p.x > x1) p.x = x0;
    }

    ctx.fillStyle = p.x < xJumpStart ? '#ef4444' : p.x <= xJumpEnd ? '#f59e0b' : '#10b981';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Annotations
  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`Supercritical (Fr₁ = ${Fr1.toFixed(2)} > 1, y₁ = ${y1.toFixed(2)}m)`, x0 + 10, bedY - y1Px - 20);

  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`Turbulent Roller Dissipation ΔE = ${deltaE.toFixed(3)} m`, xJumpStart + 20, bedY - y2Px - 30);

  ctx.fillStyle = '#10b981';
  ctx.fillText(`Subcritical (Fr₂ < 1, y₂ = ${y2.toFixed(2)}m)`, xJumpEnd + 20, bedY - y2Px - 20);

  ctx.restore();
}

/**
 * 10. Pumps & Turbomachinery Lab
 */
function renderPumpsLab(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: any,
  results: any,
  particles: Particle[],
  dt: number,
  controls: SimulationControls,
  time: number
) {
  const Qop = results.Q_op || 0.04;
  const Hop = results.H_op || 35;
  const power = results.hydraulicPower_kW || 15;
  const cy = 260;
  const pumpX = 480;
  const pumpR = 55;

  ctx.save();

  // Suction Pipe (from low reservoir)
  ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
  ctx.fillRect(80, cy - 20, pumpX - 80, 40);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  ctx.strokeRect(80, cy - 20, pumpX - 80, 40);

  // Discharge Pipe (rising upward)
  ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
  ctx.fillRect(pumpX - 15, 80, 30, cy - 80);
  ctx.strokeRect(pumpX - 15, 80, 30, cy - 80);
  ctx.fillRect(pumpX - 15, 80, 400, 30);
  ctx.strokeRect(pumpX - 15, 80, 400, 30);

  // Pump Volute Casing (Spiral housing)
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(pumpX, cy, pumpR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Spinning Impeller Vanes
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3;
  const numVanes = 6;
  for (let i = 0; i < numVanes; i++) {
    const angle = (time * 8) + i * ((Math.PI * 2) / numVanes);
    ctx.beginPath();
    ctx.moveTo(pumpX, cy);
    ctx.quadraticCurveTo(
      pumpX + Math.cos(angle + 0.5) * 30,
      cy + Math.sin(angle + 0.5) * 30,
      pumpX + Math.cos(angle) * (pumpR - 8),
      cy + Math.sin(angle) * (pumpR - 8)
    );
    ctx.stroke();
  }

  // Center hub
  ctx.fillStyle = '#0ea5e9';
  ctx.beginPath();
  ctx.arc(pumpX, cy, 12, 0, Math.PI * 2);
  ctx.fill();

  // Moving particles
  particles.forEach((p) => {
    if (controls.isPlaying) {
      if (p.x < pumpX - 20) {
        p.x += 60 * controls.speed * dt;
        p.y = cy + (Math.random() * 2 - 1) * 14;
      } else if (p.x >= pumpX - 20 && p.x <= pumpX + 20 && p.y > 100) {
        // Pump impeller energization (rising vertically into high pressure discharge)
        p.y -= 100 * controls.speed * dt;
      } else {
        p.x += 90 * controls.speed * dt;
        p.y = 95 + (Math.random() * 2 - 1) * 10;
        if (p.x > 880) p.x = 80;
      }
    }

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Operating Point Readout
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(`PUMP OPERATING POINT: Q = ${(Qop * 1000).toFixed(1)} L/s | Head H = ${Hop.toFixed(1)} m | Power = ${power.toFixed(1)} kW`, 80, 50);

  ctx.restore();
}

/**
 * Fallback generic conduit renderer
 */
function renderGenericConduit(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  results: any,
  particles: Particle[],
  dt: number,
  controls: SimulationControls
) {
  const cy = h / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
  ctx.fillRect(80, cy - 50, 800, 100);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  ctx.strokeRect(80, cy - 50, 800, 100);

  particles.forEach((p) => {
    if (controls.isPlaying) {
      p.x += 60 * controls.speed * dt;
      if (p.x > 880) p.x = 80;
    }
    p.y = cy + p.offsetRatio * 40;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawVelocityVector(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  color: string,
  label: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + len, y);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(x + len, y);
  ctx.lineTo(x + len - 8, y - 5);
  ctx.lineTo(x + len - 8, y + 5);
  ctx.closePath();
  ctx.fill();

  ctx.font = 'bold 12px monospace';
  ctx.fillText(label, x + (len / 2) - 10, y - 8);
  ctx.restore();
}
