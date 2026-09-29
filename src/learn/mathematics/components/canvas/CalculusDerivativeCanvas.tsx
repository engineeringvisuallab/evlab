import React, { useRef, useEffect, useState } from "react";
import { MathEngine } from "../../engine/mathEngine";
import { Play, Pause, RotateCcw } from "lucide-react";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const CalculusDerivativeCanvas: React.FC<Props> = ({
  variables,
  onVariableChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; slope: number } | null>(null);

  const x0 = variables.x0 ?? 1.5;
  const a = variables.a ?? 1.0;
  const b = variables.b ?? -2.0;
  const c = variables.c ?? 1.0;
  const fnMode = variables.fnMode ?? 0;
  const showNormal = variables.showNormal ?? 1;
  const showSecondDeriv = variables.showSecondDeriv ?? 1;

  const fnType = fnMode === 0 ? "polynomial" : fnMode === 1 ? "cubic" : fnMode === 2 ? "sine" : "exponential";

  // Animation loop
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const step = () => {
        let nextX = x0 + 0.02;
        if (nextX > 3.5) nextX = -3.5;
        onVariableChange("x0", Number(nextX.toFixed(2)));
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, x0, onVariableChange]);

  // Main Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Coordinate system mapping (Range [-4.5, 4.5] on X, [-5, 7] on Y)
    const xMin = -4.5;
    const xMax = 4.5;
    const yMin = -5.0;
    const yMax = 7.0;

    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;
    const toMathX = (px: number) => xMin + (px / width) * (xMax - xMin);

    // Clear background
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, width, height);

    // Draw Grid
    ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
    ctx.lineWidth = 1;
    for (let gx = Math.ceil(xMin); gx <= Math.floor(xMax); gx++) {
      const sx = toScreenX(gx);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      // X-axis label
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

    // Main Axes
    ctx.strokeStyle = "rgba(148, 163, 184, 0.8)";
    ctx.lineWidth = 1.5;
    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, toScreenY(0));
    ctx.lineTo(width, toScreenY(0));
    ctx.stroke();
    // Y Axis
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), 0);
    ctx.lineTo(toScreenX(0), height);
    ctx.stroke();

    const params = { a, b, c, n: fnMode === 0 ? 2 : 3 };

    // Draw Second Derivative f''(x) (Orange dotted curve)
    if (showSecondDeriv) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(249, 115, 22, 0.5)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      for (let px = 0; px <= width; px += 2) {
        const mx = toMathX(px);
        const my = MathEngine.numericalSecondDerivative(fnType, mx, params);
        const py = toScreenY(my);
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw First Derivative f'(x) (Cyan dashed curve)
    ctx.beginPath();
    ctx.strokeStyle = "rgba(6, 182, 212, 0.7)";
    ctx.setLineDash([6, 3]);
    ctx.lineWidth = 2;
    for (let px = 0; px <= width; px += 2) {
      const mx = toMathX(px);
      const my = MathEngine.numericalDerivative(fnType, mx, params);
      const py = toScreenY(my);
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Primary Curve f(x) (Solid Blue-White Glow)
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(56, 189, 248, 0.4)";
    ctx.shadowBlur = 8;
    for (let px = 0; px <= width; px += 2) {
      const mx = toMathX(px);
      const my = MathEngine.evalFunction(fnType, mx, params);
      const py = toScreenY(my);
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Evaluate values at x0
    const y0 = MathEngine.evalFunction(fnType, x0, params);
    const slope = MathEngine.numericalDerivative(fnType, x0, params);
    const sx0 = toScreenX(x0);
    const sy0 = toScreenY(y0);

    // Draw Tangent Line (Bright Amber)
    const tLength = 3.5;
    const xStart = x0 - tLength;
    const xEnd = x0 + tLength;
    const yStart = y0 - slope * tLength;
    const yEnd = y0 + slope * tLength;

    ctx.beginPath();
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "rgba(251, 191, 36, 0.5)";
    ctx.shadowBlur = 6;
    ctx.moveTo(toScreenX(xStart), toScreenY(yStart));
    ctx.lineTo(toScreenX(xEnd), toScreenY(yEnd));
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Slope Triangle (Rise / Run)
    const runDx = 1.0;
    const riseDy = slope * runDx;
    const triX1 = sx0;
    const triY1 = sy0;
    const triX2 = toScreenX(x0 + runDx);
    const triY2 = sy0;
    const triX3 = triX2;
    const triY3 = toScreenY(y0 + riseDy);

    ctx.beginPath();
    ctx.strokeStyle = "rgba(234, 179, 8, 0.6)";
    ctx.setLineDash([2, 2]);
    ctx.lineWidth = 1;
    ctx.moveTo(triX1, triY1);
    ctx.lineTo(triX2, triY2);
    ctx.lineTo(triX3, triY3);
    ctx.stroke();
    ctx.setLineDash([]);

    // Slope Triangle labels
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "10px monospace";
    ctx.fillText(`Δx=1.0`, (triX1 + triX2) / 2 - 12, triY1 + 14);
    ctx.fillText(`Δy=${riseDy.toFixed(2)}`, triX2 + 4, (triY2 + triY3) / 2);

    // Draw Normal Line if enabled (Purple)
    if (showNormal && Math.abs(slope) > 0.001) {
      const normalSlope = -1 / slope;
      const nLen = 2.5;
      const nxStart = x0 - nLen;
      const nxEnd = x0 + nLen;
      const nyStart = y0 - normalSlope * nLen;
      const nyEnd = y0 + normalSlope * nLen;

      ctx.beginPath();
      ctx.strokeStyle = "#c084fc";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.moveTo(toScreenX(nxStart), toScreenY(nyStart));
      ctx.lineTo(toScreenX(nxEnd), toScreenY(nyEnd));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Tangent Point Circle
    ctx.beginPath();
    ctx.arc(sx0, sy0, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Projected dashed guide lines to axes
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
    ctx.lineWidth = 1;
    ctx.moveTo(sx0, sy0);
    ctx.lineTo(sx0, toScreenY(0));
    ctx.moveTo(sx0, sy0);
    ctx.lineTo(toScreenX(0), sy0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve Legend Overlay
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(51, 65, 85, 0.8)";
    ctx.lineWidth = 1;
    ctx.fillRect(10, 10, 240, 95);
    ctx.strokeRect(10, 10, 240, 95);

    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("— f(x) (Original Function)", 20, 28);
    ctx.fillStyle = "#fbbf24";
    ctx.fillText("— Tangent Line at x₀", 20, 46);
    ctx.fillStyle = "#06b6d4";
    ctx.fillText("- - f'(x) (First Derivative / Slope)", 20, 64);
    ctx.fillStyle = "#f97316";
    ctx.fillText("·· f''(x) (Second Derivative / Concavity)", 20, 82);

  }, [x0, a, b, c, fnType, fnMode, showNormal, showSecondDeriv]);

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const mathX = -4.5 + (px / rect.width) * 9.0;
    onVariableChange("x0", Math.max(-4.0, Math.min(4.0, Number(mathX.toFixed(2)))));

    const handlePointerMove = (moveEv: PointerEvent) => {
      const movePx = moveEv.clientX - rect.left;
      const mX = -4.5 + (movePx / rect.width) * 9.0;
      onVariableChange("x0", Math.max(-4.0, Math.min(4.0, Number(mX.toFixed(2)))));
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const mx = -4.5 + (px / rect.width) * 9.0;
    const my = MathEngine.evalFunction(fnType, mx, { a, b, c, n: fnMode === 0 ? 2 : 3 });
    const mslope = MathEngine.numericalDerivative(fnType, mx, { a, b, c, n: fnMode === 0 ? 2 : 3 });
    setHoverCoord({ x: mx, y: my, slope: mslope });
  };

  const currentY = MathEngine.evalFunction(fnType, x0, { a, b, c, n: fnMode === 0 ? 2 : 3 });
  const currentSlope = MathEngine.numericalDerivative(fnType, x0, { a, b, c, n: fnMode === 0 ? 2 : 3 });
  const currentCurvature = MathEngine.numericalSecondDerivative(fnType, x0, { a, b, c, n: fnMode === 0 ? 2 : 3 });

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Top Canvas Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">Interactive Derivative Canvas</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md text-amber-300 font-mono-math">
            <span>Point: ({x0.toFixed(2)}, {currentY.toFixed(2)})</span>
            <span className="text-slate-500">|</span>
            <span>Slope m = {currentSlope.toFixed(2)}</span>
            <span className="text-slate-500">|</span>
            <span>f''(x₀) = {currentCurvature.toFixed(2)}</span>
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
            <span>{isPlaying ? "Pause Probe" : "Animate Point"}</span>
          </button>
          <button
            onClick={() => onVariableChange("x0", 1.0)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
            title="Reset position"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="relative flex-1 min-h-[360px] w-full">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverCoord(null)}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* Floating Readout Box */}
        {hoverCoord && (
          <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono-math text-slate-300 pointer-events-none shadow-lg">
            <div>Cursor: x = {hoverCoord.x.toFixed(2)}, y = {hoverCoord.y.toFixed(2)}</div>
            <div className="text-cyan-400">Slope: f'(x) = {hoverCoord.slope.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
};
