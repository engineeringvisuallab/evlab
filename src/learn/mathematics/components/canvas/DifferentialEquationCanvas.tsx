import React, { useRef, useEffect, useState } from "react";
import { MathEngine } from "../../engine/mathEngine";
import { Play, Pause, RotateCcw } from "lucide-react";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const DifferentialEquationCanvas: React.FC<Props> = ({
  variables,
  onVariableChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const x0 = variables.x0 ?? -2.5;
  const y0 = variables.y0 ?? 1.5;
  const k = variables.k ?? 0.8;
  const eqMode = variables.eqMode ?? 0; // 0: dy/dx = ky, 1: dy/dx = x - y, 2: logistic r y (1 - y/K)

  // Slope field equation evaluator
  const slopeFn = (x: number, y: number): number => {
    if (eqMode === 0) return k * y;
    if (eqMode === 1) return x - y;
    return k * y * (1 - y / 3.0); // Logistic with carrying capacity K=3
  };

  // Trajectory using RK4
  const trajectory = MathEngine.solveODE_RK4(slopeFn, x0, y0, 3.5, 0.05);

  // Auto trajectory step
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const step = () => {
        let nextY0 = y0 + 0.02;
        if (nextY0 > 3.0) nextY0 = -2.0;
        onVariableChange("y0", Number(nextY0.toFixed(2)));
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, y0, onVariableChange]);

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

    const xMin = -4.0;
    const xMax = 4.0;
    const yMin = -3.5;
    const yMax = 4.5;

    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Background
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = "rgba(51, 65, 85, 0.3)";
    ctx.lineWidth = 1;
    for (let gx = Math.ceil(xMin); gx <= Math.floor(xMax); gx++) {
      const sx = toScreenX(gx);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "10px sans-serif";
      ctx.fillText(gx.toString(), sx + 3, toScreenY(0) + 12);
    }

    for (let gy = Math.ceil(yMin); gy <= Math.floor(yMax); gy++) {
      const sy = toScreenY(gy);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      if (gy !== 0) {
        ctx.fillStyle = "#64748b";
        ctx.font = "10px sans-serif";
        ctx.fillText(gy.toString(), toScreenX(0) + 4, sy - 2);
      }
    }

    // Axes
    ctx.strokeStyle = "rgba(148, 163, 184, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, toScreenY(0));
    ctx.lineTo(width, toScreenY(0));
    ctx.moveTo(toScreenX(0), 0);
    ctx.lineTo(toScreenX(0), height);
    ctx.stroke();

    // 1. Draw Slope Field Direction Ticks
    const stepSize = 0.4;
    const tickLen = 8;

    for (let x = xMin; x <= xMax; x += stepSize) {
      for (let y = yMin; y <= yMax; y += stepSize) {
        const slope = slopeFn(x, y);
        const angle = Math.atan(slope);
        const sx = toScreenX(x);
        const sy = toScreenY(y);

        const dx = tickLen * Math.cos(angle);
        const dy = tickLen * Math.sin(angle);

        // Color based on slope intensity
        const slopeNorm = Math.min(1, Math.abs(slope) / 3);
        ctx.strokeStyle = `rgba(${Math.round(56 + slopeNorm * 180)}, ${Math.round(189 - slopeNorm * 80)}, 248, 0.5)`;
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(sx - dx, sy + dy);
        ctx.lineTo(sx + dx, sy - dy);
        ctx.stroke();
      }
    }

    // 2. Draw RK4 Solution Trajectory (Glow Cyan Curve)
    if (trajectory.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.shadowColor = "rgba(56, 189, 248, 0.6)";
      ctx.shadowBlur = 8;

      trajectory.forEach((pt, idx) => {
        const sx = toScreenX(pt.x);
        const sy = toScreenY(pt.y);
        if (idx === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 3. Initial Condition Marker Point (Amber)
    const sx0 = toScreenX(x0);
    const sy0 = toScreenY(y0);

    ctx.beginPath();
    ctx.arc(sx0, sy0, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`(x₀, y₀) = (${x0.toFixed(1)}, ${y0.toFixed(1)})`, sx0 + 10, sy0 - 6);

  }, [x0, y0, k, eqMode, trajectory]);

  // Pointer drag to set initial condition
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const mathX = -4.0 + (px / rect.width) * 8.0;
    const mathY = 4.5 - (py / rect.height) * 8.0;

    onVariableChange("x0", Number(mathX.toFixed(2)));
    onVariableChange("y0", Number(mathY.toFixed(2)));

    const handlePointerMove = (ev: PointerEvent) => {
      const curPx = ev.clientX - rect.left;
      const curPy = ev.clientY - rect.top;
      const mx = -4.0 + (curPx / rect.width) * 8.0;
      const my = 4.5 - (curPy / rect.height) * 8.0;
      onVariableChange("x0", Number(mx.toFixed(2)));
      onVariableChange("y0", Number(my.toFixed(2)));
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
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">Slope Field & RK4 Numerical Flow</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded text-slate-200 font-mono-math">
            <span className="text-amber-400">
              y({x0.toFixed(2)}) = {y0.toFixed(2)}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400">
              {eqMode === 0 ? `dy/dx = ${k}y` : eqMode === 1 ? "dy/dx = x - y" : `dy/dx = ${k}y(1 - y/3)`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-all ${
              isPlaying ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? "Pause Stream" : "Flow Trajectory"}</span>
          </button>
          <button
            onClick={() => {
              onVariableChange("x0", -2.5);
              onVariableChange("y0", 1.5);
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
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          className="w-full h-full cursor-crosshair touch-none"
        />
      </div>
    </div>
  );
};
