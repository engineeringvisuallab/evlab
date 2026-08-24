import React, { useRef, useEffect } from "react";
import { MathEngine } from "../../engine/mathEngine";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const CalculusIntegralCanvas: React.FC<Props> = ({
  variables,
  onVariableChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const a = variables.a ?? 0.0;
  const b = variables.b ?? 3.0;
  const n = Math.max(1, Math.min(64, Math.round(variables.n ?? 8)));
  const methodCode = variables.method ?? 2; // 0: left, 1: right, 2: midpoint, 3: trapezoid
  const fnMode = variables.fnMode ?? 0;
  const coeffA = variables.coeffA ?? 0.5;

  const methodName: "left" | "right" | "midpoint" | "trapezoid" =
    methodCode === 0 ? "left" : methodCode === 1 ? "right" : methodCode === 3 ? "trapezoid" : "midpoint";

  const fnType = fnMode === 0 ? "polynomial" : fnMode === 1 ? "sine" : "cubic";
  const params = { a: coeffA, b: 0, c: 0, n: 2 };

  const { totalArea: approxArea, rectangles } = MathEngine.computeRiemannSum(
    fnType,
    a,
    b,
    n,
    methodName,
    params
  );

  const exactArea = MathEngine.simpsonRule(fnType, a, b, 200, params);
  const errorAbs = Math.abs(approxArea - exactArea);
  const errorPercent = exactArea !== 0 ? (errorAbs / Math.abs(exactArea)) * 100 : 0;

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

    const xMin = -1.0;
    const xMax = 5.0;
    const yMin = -1.0;
    const yMax = 6.0;

    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;
    const toMathX = (px: number) => xMin + (px / width) * (xMax - xMin);

    // Background
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
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
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toScreenX(0), 0);
    ctx.lineTo(toScreenX(0), height);
    ctx.stroke();

    // 1. Draw Shaded Continuous Area
    ctx.beginPath();
    const startPx = toScreenX(a);
    const endPx = toScreenX(b);
    ctx.moveTo(startPx, toScreenY(0));
    for (let px = startPx; px <= endPx; px += 2) {
      const mx = toMathX(px);
      const my = MathEngine.evalFunction(fnType, mx, params);
      ctx.lineTo(px, toScreenY(my));
    }
    ctx.lineTo(endPx, toScreenY(0));
    ctx.closePath();
    ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
    ctx.fill();

    // 2. Draw Discrete Riemann Rectangles / Trapezoids
    rectangles.forEach((r, idx) => {
      const rx1 = toScreenX(r.x);
      const rx2 = toScreenX(r.x + r.width);
      const rTop = toScreenY(r.height);
      const rBase = toScreenY(0);

      // Gradient filling for rectangles
      ctx.fillStyle = idx % 2 === 0 ? "rgba(99, 102, 241, 0.35)" : "rgba(139, 92, 246, 0.35)";
      ctx.fillRect(rx1, rTop, rx2 - rx1, rBase - rTop);

      ctx.strokeStyle = "rgba(167, 139, 250, 0.8)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(rx1, rTop, rx2 - rx1, rBase - rTop);
    });

    // 3. Draw Continuous Curve f(x)
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "rgba(56, 189, 248, 0.5)";
    ctx.shadowBlur = 6;
    for (let px = 0; px <= width; px += 2) {
      const mx = toMathX(px);
      const my = MathEngine.evalFunction(fnType, mx, params);
      const py = toScreenY(my);
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Bound Markers (a & b)
    const sa = toScreenX(a);
    const sb = toScreenX(b);

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(sa, 0);
    ctx.lineTo(sa, height);
    ctx.moveTo(sb, 0);
    ctx.lineTo(sb, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Markers on X axis
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(sa, toScreenY(0), 5, 0, Math.PI * 2);
    ctx.arc(sb, toScreenY(0), 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`a = ${a.toFixed(1)}`, sa - 14, toScreenY(0) + 24);
    ctx.fillText(`b = ${b.toFixed(1)}`, sb - 14, toScreenY(0) + 24);

  }, [a, b, n, methodName, fnType, coeffA, rectangles]);

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Top Controls & Metrics */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Integration Laboratory</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center bg-slate-800 rounded p-0.5">
            {(["left", "midpoint", "right", "trapezoid"] as const).map((m, idx) => (
              <button
                key={m}
                onClick={() => onVariableChange("method", idx === 3 ? 3 : idx === 2 ? 1 : idx === 1 ? 2 : 0)}
                className={`px-2 py-0.5 rounded capitalize text-[11px] font-medium transition-all ${
                  methodName === m ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded text-slate-200 font-mono-math">
            <span className="text-indigo-400">Sum: {approxArea.toFixed(4)}</span>
            <span className="text-slate-500">vs</span>
            <span className="text-cyan-400">Exact: {exactArea.toFixed(4)}</span>
            <span className="text-slate-500">|</span>
            <span className={errorPercent < 1.0 ? "text-emerald-400" : "text-amber-400"}>
              Error: {errorPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 min-h-[360px] w-full">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
};
