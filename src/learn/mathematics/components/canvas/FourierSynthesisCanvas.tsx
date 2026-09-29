import React, { useRef, useEffect, useState } from "react";
import { MathEngine } from "../../engine/mathEngine";
import { Play, Pause, RotateCcw } from "lucide-react";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const FourierSynthesisCanvas: React.FC<Props> = ({
  variables,
  onVariableChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  const harmonics = Math.max(1, Math.min(25, Math.round(variables.harmonics ?? 5)));
  const waveType = (variables.waveType === 1 ? "sawtooth" : variables.waveType === 2 ? "triangle" : "square") as "square" | "sawtooth" | "triangle";
  const speed = variables.speed ?? 1.0;

  // Animation Loop for rotating phasors
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const step = () => {
        setTime((prev) => prev + 0.03 * speed);
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

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

    // Split Canvas: Left 35% for Epicycles, Right 65% for Time-domain Synthesized Wave
    const epicycleCenterX = Math.min(150, width * 0.28);
    const epicycleCenterY = height * 0.42;

    const waveStartX = epicycleCenterX + 120;
    const waveWidth = width - waveStartX - 20;
    const waveCenterY = height * 0.42;

    // Background
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, width, height);

    // ==========================================
    // 1. REVOLVING PHASOR EPICYCLES
    // ==========================================
    let currentX = epicycleCenterX;
    let currentY = epicycleCenterY;
    const baseRadius = 60;

    for (let k = 1; k <= harmonics; k++) {
      let nVal = k;
      let radius = 0;

      if (waveType === "square") {
        nVal = 2 * k - 1; // 1, 3, 5, 7...
        radius = baseRadius * (4 / (Math.PI * nVal));
      } else if (waveType === "sawtooth") {
        nVal = k; // 1, 2, 3, 4...
        radius = baseRadius * (2 / (Math.PI * nVal));
      } else {
        // Triangle
        nVal = 2 * k - 1;
        radius = baseRadius * (8 / (Math.PI * Math.PI * nVal * nVal));
      }

      const prevX = currentX;
      const prevY = currentY;

      const angle = nVal * time;
      currentX += radius * Math.cos(angle);
      currentY += radius * Math.sin(angle);

      // Draw Orbit Circle
      ctx.beginPath();
      ctx.arc(prevX, prevY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(100, 116, 139, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw Radius Vector
      ctx.beginPath();
      ctx.strokeStyle = k === 1 ? "#fbbf24" : "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      // Joint Circle
      ctx.beginPath();
      ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();
    }

    // Horizontal tracking line from epicycle tip to wave
    ctx.beginPath();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(waveStartX, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // ==========================================
    // 2. TIME-DOMAIN SYNTHESIZED WAVEFORM
    // ==========================================
    // Wave Axis
    ctx.beginPath();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = 1;
    ctx.moveTo(waveStartX, waveCenterY);
    ctx.lineTo(waveStartX + waveWidth, waveCenterY);
    ctx.stroke();

    // Draw synthesized wave
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "rgba(56, 189, 248, 0.5)";
    ctx.shadowBlur = 6;

    for (let px = 0; px <= waveWidth; px += 2) {
      const t = time - (px / waveWidth) * (4 * Math.PI);
      let val = 0;

      for (let k = 1; k <= harmonics; k++) {
        if (waveType === "square") {
          const n = 2 * k - 1;
          val += (4 / (Math.PI * n)) * Math.sin(n * t);
        } else if (waveType === "sawtooth") {
          const n = k;
          val += (2 / (Math.PI * n)) * Math.sin(n * t);
        } else {
          const n = 2 * k - 1;
          const sign = ((k - 1) % 2 === 0 ? 1 : -1);
          val += sign * (8 / (Math.PI * Math.PI * n * n)) * Math.sin(n * t);
        }
      }

      const sy = waveCenterY + val * baseRadius;
      if (px === 0) ctx.moveTo(waveStartX + px, sy);
      else ctx.lineTo(waveStartX + px, sy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Wave tip marker
    ctx.beginPath();
    ctx.arc(waveStartX, currentY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#38bdf8";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ==========================================
    // 3. BOTTOM FREQUENCY SPECTRUM (HARMONIC BARS)
    // ==========================================
    const specStartY = height - 70;
    const specHeight = 50;

    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.fillRect(20, specStartY - 15, width - 40, specHeight + 25);
    ctx.strokeStyle = "rgba(51, 65, 85, 0.5)";
    ctx.strokeRect(20, specStartY - 15, width - 40, specHeight + 25);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText("Discrete Frequency Harmonic Amplitude Spectrum |cₙ|", 30, specStartY - 2);

    const barWidth = 14;
    const barGap = 10;
    const specBarStartX = 40;

    for (let k = 1; k <= Math.min(harmonics, 15); k++) {
      let amp = 0;
      let label = `f${k}`;
      if (waveType === "square") {
        const n = 2 * k - 1;
        amp = 4 / (Math.PI * n);
        label = `f${n}`;
      } else if (waveType === "sawtooth") {
        amp = 2 / (Math.PI * k);
        label = `f${k}`;
      } else {
        const n = 2 * k - 1;
        amp = 8 / (Math.PI * Math.PI * n * n);
        label = `f${n}`;
      }

      const bH = Math.min(specHeight, amp * 40);
      const bx = specBarStartX + (k - 1) * (barWidth + barGap);
      const by = specStartY + specHeight - bH;

      ctx.fillStyle = "#a855f7";
      ctx.fillRect(bx, by, barWidth, bH);
      ctx.strokeStyle = "#d8b4fe";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, barWidth, bH);

      ctx.fillStyle = "#64748b";
      ctx.font = "9px monospace";
      ctx.fillText(label, bx + 1, specStartY + specHeight + 11);
    }

  }, [harmonics, waveType, speed, time]);

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">Fourier Series Synthesis & Phasor Epicycles</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center bg-slate-800 rounded p-0.5">
            {(["square", "sawtooth", "triangle"] as const).map((w, idx) => (
              <button
                key={w}
                onClick={() => onVariableChange("waveType", idx)}
                className={`px-2 py-0.5 rounded capitalize text-[11px] font-medium transition-all ${
                  waveType === w ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
          <span className="text-amber-400 font-mono-math">Harmonics N = {harmonics}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-all ${
              isPlaying ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? "Pause Rotation" : "Spin Phasors"}</span>
          </button>
          <button
            onClick={() => {
              onVariableChange("harmonics", 5);
              setTime(0);
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 min-h-[360px] w-full">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
};
