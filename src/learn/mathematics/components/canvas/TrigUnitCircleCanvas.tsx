import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const TrigUnitCircleCanvas: React.FC<Props> = ({
  variables,
  onVariableChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const thetaDeg = variables.thetaDeg ?? 45;
  const amplitude = variables.amplitude ?? 1.5;
  const freqB = variables.freqB ?? 1.0;
  const phaseC = variables.phaseC ?? 0.0;
  const offsetD = variables.offsetD ?? 0.0;
  const showCosineWave = variables.showCosineWave ?? 1;

  const thetaRad = (thetaDeg * Math.PI) / 180;
  const sinVal = Math.sin(thetaRad);
  const cosVal = Math.cos(thetaRad);
  const tanVal = Math.abs(cosVal) > 0.001 ? Math.tan(thetaRad) : Infinity;

  // Auto rotation animation
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const step = () => {
        let nextDeg = thetaDeg + 1.2;
        if (nextDeg >= 360) nextDeg = 0;
        onVariableChange("thetaDeg", Math.round(nextDeg));
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, thetaDeg, onVariableChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Split Canvas: Left 40% for Unit Circle, Right 60% for Wave Graph
    const circleCenterX = Math.min(180, width * 0.32);
    const circleCenterY = height / 2;
    const circleRadius = Math.min(110, height * 0.36);

    const waveStartX = circleCenterX + circleRadius + 45;
    const waveWidth = width - waveStartX - 25;

    // Background
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, width, height);

    // ==========================================
    // 1. LEFT PANE: UNIT CIRCLE & TRIANGLE
    // ==========================================
    
    // Circle Axes
    ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(circleCenterX - circleRadius - 20, circleCenterY);
    ctx.lineTo(circleCenterX + circleRadius + 20, circleCenterY);
    ctx.moveTo(circleCenterX, circleCenterY - circleRadius - 20);
    ctx.lineTo(circleCenterX, circleCenterY + circleRadius + 20);
    ctx.stroke();

    // Unit Circle Perimeter
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Angle Arc
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, 30, 0, -thetaRad, true);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.font = "11px monospace";
    ctx.fillText(`${Math.round(thetaDeg)}°`, circleCenterX + 34, circleCenterY - 6);

    // Coordinates of current rotating point P on unit circle
    const pointX = circleCenterX + circleRadius * cosVal;
    const pointY = circleCenterY - circleRadius * sinVal;

    // Draw Right Triangle
    // 1. Cosine Line (Horizontal base, Blue)
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.moveTo(circleCenterX, circleCenterY);
    ctx.lineTo(pointX, circleCenterY);
    ctx.stroke();

    // 2. Sine Line (Vertical height, Emerald Green)
    ctx.beginPath();
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 3;
    ctx.moveTo(pointX, circleCenterY);
    ctx.lineTo(pointX, pointY);
    ctx.stroke();

    // 3. Hypotenuse / Radius Vector (Amber)
    ctx.beginPath();
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2.5;
    ctx.moveTo(circleCenterX, circleCenterY);
    ctx.lineTo(pointX, pointY);
    ctx.stroke();

    // Rotating Point Circle
    ctx.beginPath();
    ctx.arc(pointX, pointY, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ==========================================
    // 2. RIGHT PANE: SYNCHRONIZED WAVE GRAPH
    // ==========================================
    const waveCenterY = height / 2;
    const waveScaleY = circleRadius * 0.8 * (amplitude / 1.5);

    // Wave Axis
    ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(waveStartX, waveCenterY);
    ctx.lineTo(waveStartX + waveWidth, waveCenterY);
    ctx.stroke();

    // Draw grid lines for angles (0, π, 2π, 3π, 4π)
    const maxAngleRad = 4 * Math.PI;
    const toWaveScreenX = (rad: number) => waveStartX + (rad / maxAngleRad) * waveWidth;

    const angleTicks = [
      { rad: 0, label: "0" },
      { rad: Math.PI, label: "π" },
      { rad: 2 * Math.PI, label: "2π" },
      { rad: 3 * Math.PI, label: "3π" },
      { rad: 4 * Math.PI, label: "4π" },
    ];

    angleTicks.forEach((t) => {
      const sx = toWaveScreenX(t.rad);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(51, 65, 85, 0.5)";
      ctx.moveTo(sx, 20);
      ctx.lineTo(sx, height - 20);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "10px sans-serif";
      ctx.fillText(t.label, sx - 4, waveCenterY + 16);
    });

    // Draw Cosine Wave (Blue dashed) if enabled
    if (showCosineWave) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1.5;
      for (let px = 0; px <= waveWidth; px += 2) {
        const rad = (px / waveWidth) * maxAngleRad;
        const y = Math.cos(freqB * rad + phaseC);
        const sy = waveCenterY - y * waveScaleY;
        if (px === 0) ctx.moveTo(waveStartX + px, sy);
        else ctx.lineTo(waveStartX + px, sy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Sine Wave y = A sin(B x + C) + D (Green Solid)
    ctx.beginPath();
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "rgba(52, 211, 153, 0.4)";
    ctx.shadowBlur = 6;
    for (let px = 0; px <= waveWidth; px += 2) {
      const rad = (px / waveWidth) * maxAngleRad;
      const y = Math.sin(freqB * rad + phaseC);
      const sy = waveCenterY - y * waveScaleY;
      if (px === 0) ctx.moveTo(waveStartX + px, sy);
      else ctx.lineTo(waveStartX + px, sy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Moving Probe Dot on the Wave
    const currentWaveX = toWaveScreenX(thetaRad % maxAngleRad);
    const currentWaveY = waveCenterY - sinVal * waveScaleY;

    // Dashed tracking bridge from Circle to Wave
    ctx.beginPath();
    ctx.strokeStyle = "rgba(52, 211, 153, 0.5)";
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(currentWaveX, currentWaveY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Wave Marker Point
    ctx.beginPath();
    ctx.arc(currentWaveX, currentWaveY, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#34d399";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#38bdf8";
    ctx.font = "11px monospace";
    ctx.fillText(`cos(θ) = ${cosVal.toFixed(3)}`, circleCenterX - 45, circleCenterY + circleRadius + 22);

    ctx.fillStyle = "#34d399";
    ctx.fillText(`sin(θ) = ${sinVal.toFixed(3)}`, circleCenterX - 45, circleCenterY + circleRadius + 38);

  }, [thetaDeg, thetaRad, sinVal, cosVal, amplitude, freqB, phaseC, offsetD, showCosineWave]);

  // Pointer drag on unit circle
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const circleCenterX = Math.min(180, width * 0.32);
    const circleCenterY = rect.height / 2;

    const updateAngleFromPos = (cx: number, cy: number) => {
      const dx = cx - circleCenterX;
      const dy = -(cy - circleCenterY); // Invert y because canvas y grows downwards
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      onVariableChange("thetaDeg", Math.round(angle));
    };

    updateAngleFromPos(e.clientX - rect.left, e.clientY - rect.top);

    const handlePointerMove = (ev: PointerEvent) => {
      updateAngleFromPos(ev.clientX - rect.left, ev.clientY - rect.top);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">Synchronized Unit Circle & Harmonic Wave</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded text-slate-200 font-mono-math">
            <span className="text-amber-400">θ = {thetaDeg}° ({(thetaRad).toFixed(2)} rad)</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">sin = {sinVal.toFixed(3)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-sky-400">cos = {cosVal.toFixed(3)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-all ${
              isPlaying ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? "Pause Rotation" : "Rotate Angle"}</span>
          </button>
          <button
            onClick={() => onVariableChange("thetaDeg", 45)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
            title="Reset to 45°"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 min-h-[360px] w-full">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          className="w-full h-full cursor-crosshair touch-none"
        />
      </div>
    </div>
  );
};
