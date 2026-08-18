import React, { useEffect, useRef, useState } from 'react';
import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sliders,
  Volume2,
  Zap,
} from 'lucide-react';
import { TopicDefinition } from '../types/mechanics';

interface SimulationCanvasProps {
  topic: TopicDefinition;
  parameters: Record<string, number>;
  onUpdateParameter: (id: string, value: number) => void;
  computedData: Record<string, any>;
  isDark: boolean;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  topic,
  parameters,
  onUpdateParameter,
  computedData,
  isDark,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [simTime, setSimTime] = useState<number>(0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Dragging state for direct canvas manipulation
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragTarget, setDragTarget] = useState<string | null>(null);

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        setSimTime((prev) => (prev + dt * playbackSpeed) % 600);
      }

      drawCanvas();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackSpeed, parameters, computedData, showGrid, showVectors, isDark, simTime, topic.id]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const dpr = window.devicePixelRatio || 1;
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width * dpr;
        canvasRef.current.height = rect.height * dpr;
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    handleResize();

    return () => resizeObserver.disconnect();
  }, []);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Helper: Draw Arrow
    const drawArrow = (
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      color: string,
      lineWidth = 2.5,
      label?: string
    ) => {
      const headlen = 10;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);

      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      if (label && showVectors) {
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(label, toX + 8 * Math.cos(angle), toY + 8 * Math.sin(angle) - 4);
      }
      ctx.restore();
    };

    // Render by Topic
    const cx = width / 2;
    const cy = height / 2;

    switch (topic.id) {
      case 'vectors': {
        // Draw Origin Axes
        ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx - 200, cy);
        ctx.lineTo(cx + 200, cy);
        ctx.moveTo(cx, cy - 180);
        ctx.lineTo(cx, cy + 180);
        ctx.stroke();
        ctx.setLineDash([]);

        // Origin Node
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();

        const scale = 0.55;
        const rad = (d: number) => (d * Math.PI) / 180;

        // Force 1
        const f1x = cx + parameters.f1Mag * scale * Math.cos(rad(parameters.f1Angle));
        const f1y = cy - parameters.f1Mag * scale * Math.sin(rad(parameters.f1Angle));
        drawArrow(cx, cy, f1x, f1y, '#3b82f6', 3, `F₁ = ${parameters.f1Mag} N (${parameters.f1Angle}°)`);

        // Force 2
        const f2x = cx + parameters.f2Mag * scale * Math.cos(rad(parameters.f2Angle));
        const f2y = cy - parameters.f2Mag * scale * Math.sin(rad(parameters.f2Angle));
        drawArrow(cx, cy, f2x, f2y, '#10b981', 3, `F₂ = ${parameters.f2Mag} N (${parameters.f2Angle}°)`);

        // Force 3
        if (parameters.f3Mag > 0) {
          const f3x = cx + parameters.f3Mag * scale * Math.cos(rad(parameters.f3Angle));
          const f3y = cy - parameters.f3Mag * scale * Math.sin(rad(parameters.f3Angle));
          drawArrow(cx, cy, f3x, f3y, '#f59e0b', 3, `F₃ = ${parameters.f3Mag} N (${parameters.f3Angle}°)`);
        }

        // Resultant Vector
        if (computedData.resultantMagnitude !== undefined) {
          const rx = cx + computedData.resultantX * scale;
          const ry = cy - computedData.resultantY * scale;
          drawArrow(cx, cy, rx, ry, '#ef4444', 4, `Resultant R = ${computedData.resultantMagnitude.toFixed(1)} N (${computedData.resultantAngleDeg.toFixed(1)}°)`);

          // Draw Vector Addition Polygon (Dashed components)
          ctx.strokeStyle = '#ef444440';
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(f1x, f1y);
          ctx.lineTo(rx, ry);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        break;
      }

      case 'fbd': {
        // Draw Ground / Datum
        ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
        ctx.fillRect(cx - 220, cy + 60, 440, 12);

        // Body Box
        const bw = 140;
        const bh = 80;
        const bx = cx - bw / 2;
        const by = cy + 60 - bh;

        ctx.fillStyle = isDark ? '#334155' : '#cbd5e1';
        ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);

        // Mass Label
        ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`m = ${parameters.bodyMass || 20} kg`, cx, cy + 25);

        // Center of Gravity
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy + 20, 5, 0, Math.PI * 2);
        ctx.fill();

        // Gravity / Weight Vector
        const weight = (parameters.bodyMass || 20) * 9.81;
        drawArrow(cx, cy + 20, cx, cy + 20 + 80, '#ef4444', 3, `W = mg = ${weight.toFixed(1)} N`);

        // Normal Force Vector
        drawArrow(cx, cy + 60, cx, cy + 60 - 80, '#10b981', 3, `N = ${weight.toFixed(1)} N`);

        // Applied Force
        const fRad = ((parameters.appliedAngle || 35) * Math.PI) / 180;
        const fMag = parameters.appliedForce || 150;
        const fEndX = cx + fMag * 0.4 * Math.cos(fRad);
        const fEndY = cy + 20 - fMag * 0.4 * Math.sin(fRad);
        drawArrow(cx, cy + 20, fEndX, fEndY, '#3b82f6', 3.5, `F_app = ${fMag} N (${parameters.appliedAngle}°)`);

        // Friction Vector
        const fFric = fMag * Math.cos(fRad);
        drawArrow(cx - bw / 2, cy + 60, cx - bw / 2 - fFric * 0.4, cy + 60, '#f59e0b', 3, `f_s = ${fFric.toFixed(1)} N`);
        break;
      }

      case 'moment': {
        const pivotX = cx - 180;
        const pivotY = cy + 20;
        const totalLenPx = 360;
        const scaleM = totalLenPx / (parameters.leverLength || 2.5);

        // Fixed Pivot Support
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(pivotX - 18, pivotY + 30);
        ctx.lineTo(pivotX + 18, pivotY + 30);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Lever Bar
        const barEnd = pivotX + totalLenPx;
        ctx.fillStyle = isDark ? '#334155' : '#cbd5e1';
        ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.fillRect(pivotX, pivotY - 8, totalLenPx, 16);
        ctx.strokeRect(pivotX, pivotY - 8, totalLenPx, 16);

        // Force Application Position
        const appPosM = Math.min(parameters.leverLength, parameters.applicationPosition || 2.0);
        const appPosX = pivotX + appPosM * scaleM;

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(appPosX, pivotY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Dimension Line d
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY + 25);
        ctx.lineTo(appPosX, pivotY + 25);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '11px system-ui';
        ctx.fillStyle = '#3b82f6';
        ctx.textAlign = 'center';
        ctx.fillText(`d = ${appPosM.toFixed(2)} m`, (pivotX + appPosX) / 2, pivotY + 40);

        // Force Vector
        const angleRad = ((parameters.forceAngleDeg || 60) * Math.PI) / 180;
        const fMag = parameters.forceMag || 120;
        const fEndX = appPosX + fMag * 0.5 * Math.cos(angleRad);
        const fEndY = pivotY - fMag * 0.5 * Math.sin(angleRad);
        drawArrow(appPosX, pivotY, fEndX, fEndY, '#ef4444', 3.5, `F = ${fMag} N (${parameters.forceAngleDeg}°)`);

        // Moment Rotation Arc
        const momentVal = computedData.moment || 0;
        if (Math.abs(momentVal) > 1) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(pivotX, pivotY, 45, -Math.PI / 4, Math.PI / 4, momentVal < 0);
          ctx.stroke();
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 12px system-ui';
          ctx.fillText(`M = ${Math.abs(momentVal).toFixed(1)} N·m`, pivotX, pivotY - 55);
        }
        break;
      }

      case 'equilibrium':
      case 'beams': {
        const beamStartX = cx - 220;
        const beamY = cy;
        const beamLenPx = 440;
        const spanM = parameters.spanL || parameters.beamLength || 6.0;
        const scaleX = beamLenPx / spanM;

        // Draw Beam Bar
        ctx.fillStyle = isDark ? '#334155' : '#cbd5e1';
        ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.fillRect(beamStartX, beamY - 8, beamLenPx, 16);
        ctx.strokeRect(beamStartX, beamY - 8, beamLenPx, 16);

        // Left Support (Pin at A)
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(beamStartX, beamY + 8);
        ctx.lineTo(beamStartX - 14, beamY + 32);
        ctx.lineTo(beamStartX + 14, beamY + 32);
        ctx.closePath();
        ctx.fill();

        // Right Support (Roller at B)
        const bPosM = parameters.supportBPos || spanM;
        const supportBX = beamStartX + bPosM * scaleX;
        ctx.beginPath();
        ctx.moveTo(supportBX, beamY + 8);
        ctx.lineTo(supportBX - 14, beamY + 26);
        ctx.lineTo(supportBX + 14, beamY + 26);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(supportBX - 6, beamY + 30, 4, 0, Math.PI * 2);
        ctx.arc(supportBX + 6, beamY + 30, 4, 0, Math.PI * 2);
        ctx.fill();

        // Downward Point Load 1
        const p1 = parameters.pointLoadP || parameters.loadP1 || 400;
        const p1Pos = parameters.pointLoadPos || parameters.loadP1Pos || 2.0;
        const p1X = beamStartX + p1Pos * scaleX;
        if (p1 > 0) {
          drawArrow(p1X, beamY - 80, p1X, beamY - 8, '#ef4444', 3.5, `P₁ = ${p1} N`);
        }

        // Distributed Load w
        const udlW = parameters.udlW || 0;
        if (udlW > 0) {
          ctx.fillStyle = '#f59e0b20';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.fillRect(beamStartX, beamY - 40, beamLenPx, 32);
          ctx.strokeRect(beamStartX, beamY - 40, beamLenPx, 32);
          for (let gx = beamStartX + 20; gx < beamStartX + beamLenPx; gx += 40) {
            drawArrow(gx, beamY - 40, gx, beamY - 8, '#f59e0b', 1.5);
          }
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 11px system-ui';
          ctx.fillText(`w = ${udlW} N/m`, cx, beamY - 46);
        }

        // Upward Support Reactions
        if (computedData.raY !== undefined) {
          drawArrow(beamStartX, beamY + 60, beamStartX, beamY + 8, '#10b981', 3.5, `R_A = ${computedData.raY.toFixed(1)} N`);
        }
        if (computedData.rbY !== undefined) {
          drawArrow(supportBX, beamY + 60, supportBX, beamY + 8, '#10b981', 3.5, `R_B = ${computedData.rbY.toFixed(1)} N`);
        }
        break;
      }

      case 'friction': {
        const inclineDeg = parameters.inclineAngleDeg || 15;
        const rad = (inclineDeg * Math.PI) / 180;
        const rampLen = 380;

        ctx.save();
        ctx.translate(cx - 150, cy + 80);

        // Ramp Base
        ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(rampLen * Math.cos(rad), -rampLen * Math.sin(rad));
        ctx.lineTo(rampLen * Math.cos(rad), 0);
        ctx.closePath();
        ctx.fill();

        // Incline Surface Line
        ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(rampLen * Math.cos(rad), -rampLen * Math.sin(rad));
        ctx.stroke();

        // Sliding Block on Incline
        const blockDist = 180 + (computedData.state?.includes('SLIDING') ? (Math.sin(simTime * 2) * 50) : 0);
        const blockX = blockDist * Math.cos(rad);
        const blockY = -blockDist * Math.sin(rad);

        ctx.save();
        ctx.translate(blockX, blockY);
        ctx.rotate(-rad);

        const bw = 70;
        const bh = 45;
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(-bw / 2, -bh, bw, bh);

        // Force Vectors on Block
        drawArrow(0, -bh / 2, 0, -bh / 2 - 60, '#10b981', 2.5, 'N');
        drawArrow(0, -bh / 2, 60, -bh / 2, '#3b82f6', 2.5, 'F_app');
        drawArrow(0, -bh / 2, -50, -bh / 2, '#f59e0b', 2.5, 'f_friction');

        ctx.restore();
        ctx.restore();
        break;
      }

      case 'centroid': {
        // Draw T-Section
        const fw = parameters.flangeWidth || 300;
        const ft = parameters.flangeThickness || 25;
        const wh = parameters.webHeight || 350;
        const wt = parameters.webThickness || 20;

        const scale = 0.5;
        const originX = cx - (fw * scale) / 2;
        const originY = cy + 120;

        // Flange
        ctx.fillStyle = '#3b82f680';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        const flangeY = originY - (wh + ft) * scale;
        ctx.fillRect(originX, flangeY, fw * scale, ft * scale);
        ctx.strokeRect(originX, flangeY, fw * scale, ft * scale);

        // Web
        const webX = cx - (wt * scale) / 2;
        const webY = originY - wh * scale;
        ctx.fillRect(webX, webY, wt * scale, wh * scale);
        ctx.strokeRect(webX, webY, wt * scale, wh * scale);

        // Composite Centroid Crosshair
        if (computedData.centroidX !== undefined) {
          const centPxY = originY - computedData.centroidY * scale;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(cx - 160, centPxY);
          ctx.lineTo(cx + 160, centPxY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(cx, centPxY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = 'bold 12px system-ui';
          ctx.fillText(`Centroid (Ȳ = ${computedData.centroidY.toFixed(1)} mm)`, cx + 15, centPxY - 8);
        }
        break;
      }

      case 'trusses': {
        const spanPx = 360;
        const spanM = parameters.trussSpan || 6.0;
        const heightM = parameters.trussHeight || 2.5;
        const scaleX = spanPx / spanM;
        const scaleY = 160 / heightM;

        const baseLeftX = cx - spanPx / 2;
        const baseRightX = cx + spanPx / 2;
        const baseY = cy + 60;
        const topY = baseY - heightM * scaleY;

        // Joints
        const jA = { x: baseLeftX, y: baseY };
        const jB = { x: cx, y: baseY };
        const jC = { x: baseRightX, y: baseY };
        const jD = { x: baseLeftX + spanPx / 4, y: topY };
        const jE = { x: baseRightX - spanPx / 4, y: topY };

        // Members with Tension (Blue) / Compression (Red)
        const drawMember = (p1: { x: number; y: number }, p2: { x: number; y: number }, isComp: boolean, label: string) => {
          ctx.strokeStyle = isComp ? '#ef4444' : '#3b82f6';
          ctx.lineWidth = isComp ? 4 : 3;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        };

        drawMember(jA, jB, false, 'AB (T)');
        drawMember(jB, jC, false, 'BC (T)');
        drawMember(jD, jE, true, 'DE (C)');
        drawMember(jA, jD, true, 'AD (C)');
        drawMember(jD, jB, false, 'DB (T)');
        drawMember(jB, jE, false, 'BE (T)');
        drawMember(jE, jC, true, 'EC (C)');

        // Node Pins
        [jA, jB, jC, jD, jE].forEach((j, i) => {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(j.x, j.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });

        // Load Arrow on B
        drawArrow(jB.x, jB.y + 6, jB.x, jB.y + 70, '#ef4444', 3.5, `P = ${parameters.jointLoadN || 1200} N`);
        break;
      }

      case 'kinematics': {
        const trackY = cy + 40;
        ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
        ctx.fillRect(cx - 240, trackY, 480, 8);

        // Motion Integration
        const t = simTime % (parameters.simDuration || 6);
        const s0 = parameters.s0 || 0;
        const v0 = parameters.v0 || 10;
        const a = parameters.accel || 2.5;
        const s = s0 + v0 * t + 0.5 * a * t * t;
        const v = v0 + a * t;

        const cartX = cx - 180 + (s % 360);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(cartX - 25, trackY - 30, 50, 30);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cartX - 15, trackY, 6, 0, Math.PI * 2);
        ctx.arc(cartX + 15, trackY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Velocity & Accel Vectors
        drawArrow(cartX, trackY - 15, cartX + v * 3, trackY - 15, '#10b981', 2.5, `v = ${v.toFixed(1)} m/s`);
        drawArrow(cartX, trackY - 35, cartX + a * 5, trackY - 35, '#ef4444', 2, `a = ${a.toFixed(1)} m/s²`);
        break;
      }

      case 'projectile': {
        const startX = cx - 220;
        const groundY = cy + 100;
        const y0 = parameters.launchY0 || 2.0;
        const v0 = parameters.launchV0 || 25;
        const ang = parameters.launchAngle || 45;
        const rad = (ang * Math.PI) / 180;
        const g = parameters.gravityG || 9.81;

        // Ground
        ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
        ctx.fillRect(startX - 20, groundY, 480, 10);

        // Trajectory Parabola
        ctx.strokeStyle = '#3b82f660';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();

        const v0x = v0 * Math.cos(rad);
        const v0y = v0 * Math.sin(rad);
        const scaleX = 4.5;
        const scaleY = 4.5;

        for (let t = 0; t <= 6; t += 0.05) {
          const x = v0x * t;
          const y = y0 + v0y * t - 0.5 * g * t * t;
          if (y < 0) break;
          const px = startX + x * scaleX;
          const py = groundY - y * scaleY;
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Projectile Position
        const tFlight = computedData.timeOfFlight || 4;
        const curT = simTime % tFlight;
        const curX = startX + (v0x * curT) * scaleX;
        const curY = groundY - Math.max(0, y0 + v0y * curT - 0.5 * g * curT * curT) * scaleY;

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(curX, curY, 7, 0, Math.PI * 2);
        ctx.fill();

        // Tangent Velocity Vector
        const curVx = v0x;
        const curVy = v0y - g * curT;
        drawArrow(curX, curY, curX + curVx * 1.5, curY - curVy * 1.5, '#10b981', 2.5);
        break;
      }

      case 'mechanisms': {
        const crankPivotX = cx - 120;
        const crankPivotY = cy;
        const rM = parameters.crankRadiusR || 0.08;
        const lM = parameters.connectingRodL || 0.24;
        const rpm = parameters.crankOmegaRpm || 1200;
        const omega = (rpm * 2 * Math.PI) / 60;

        const theta = (simTime * (omega / 20)) % (Math.PI * 2);
        const scale = 800; // px per m

        const crankPinX = crankPivotX + rM * scale * Math.cos(theta);
        const crankPinY = crankPivotY - rM * scale * Math.sin(theta);

        // Piston Position
        const pistonX = crankPivotX + (rM * Math.cos(theta) + Math.sqrt(lM * lM - rM * rM * Math.sin(theta) * Math.sin(theta))) * scale;
        const pistonY = crankPivotY;

        // Cylinder Bore
        ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
        ctx.lineWidth = 3;
        ctx.strokeRect(pistonX - 30, pistonY - 25, 70, 50);

        // Crank Disc / Arm
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(crankPivotX, crankPivotY);
        ctx.lineTo(crankPinX, crankPinY);
        ctx.stroke();

        // Connecting Rod
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(crankPinX, crankPinY);
        ctx.lineTo(pistonX, pistonY);
        ctx.stroke();

        // Pins
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(crankPivotX, crankPivotY, 6, 0, Math.PI * 2);
        ctx.arc(crankPinX, crankPinY, 5, 0, Math.PI * 2);
        ctx.arc(pistonX, pistonY, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'rotation': {
        const flyRadius = (parameters.radiusM || 0.4) * 220;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(simTime * 4);

        ctx.fillStyle = isDark ? '#334155' : '#cbd5e1';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, flyRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Spokes
        ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(flyRadius, 0);
          ctx.stroke();
        }
        ctx.restore();

        // Torque Vector
        drawArrow(cx, cy - flyRadius - 15, cx + 80, cy - flyRadius - 15, '#ef4444', 3, `τ = ${parameters.torqueNm || 25} N·m`);
        break;
      }

      default: {
        // Fallback generic particle
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  return (
    <div
      ref={containerRef}
      id="simulation-viewport-container"
      className={`relative w-full h-full flex flex-col rounded-xl overflow-hidden border shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}
    >
      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2">
        <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-tight bg-blue-600 text-white shadow-sm">
          LIVE SIMULATION
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded font-mono border backdrop-blur-md ${
            isDark
              ? 'bg-slate-900/80 border-slate-700 text-slate-300'
              : 'bg-white/80 border-slate-300 text-slate-700'
          }`}
        >
          t = {simTime.toFixed(2)} s
        </span>
      </div>

      {/* Top Right Canvas Toggles */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-2 py-1 rounded text-xs font-medium border backdrop-blur-md transition-colors ${
            showGrid
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-500'
              : isDark
              ? 'bg-slate-900/80 border-slate-700 text-slate-400'
              : 'bg-white/80 border-slate-300 text-slate-600'
          }`}
          title="Toggle Grid"
        >
          Grid
        </button>

        <button
          onClick={() => setShowVectors(!showVectors)}
          className={`px-2 py-1 rounded text-xs font-medium border backdrop-blur-md transition-colors ${
            showVectors
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500'
              : isDark
              ? 'bg-slate-900/80 border-slate-700 text-slate-400'
              : 'bg-white/80 border-slate-300 text-slate-600'
          }`}
          title="Toggle Vector Annotations"
        >
          Vectors
        </button>
      </div>

      {/* Main Canvas Viewport */}
      <canvas
        ref={canvasRef}
        id="mechanics-canvas"
        className="w-full h-full cursor-crosshair block"
      />

      {/* Bottom Floating Playback Toolbar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-2 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg transition-all bg-white/90 dark:bg-slate-900/90 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100">
        <button
          id="btn-sim-reset"
          onClick={() => setSimTime(0)}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Reset Simulation Time"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          id="btn-sim-playpause"
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors shadow-sm"
          title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
        </button>

        <button
          id="btn-sim-step"
          onClick={() => setSimTime((prev) => prev + 0.1)}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Step Forward (0.1s)"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Speed Selector */}
        <div className="flex items-center space-x-1 text-xs font-mono">
          {[0.5, 1.0, 2.0].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                playbackSpeed === spd
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
