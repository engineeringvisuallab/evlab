import React, { useRef, useEffect, useState } from "react";
import { MathEngine, Point2D } from "../../engine/mathEngine";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const Vector2D3DCanvas: React.FC<Props> = ({
  variables,
  onVariableChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeDragVector, setActiveDragVector] = useState<"u" | "v" | null>(null);

  const ux = variables.ux ?? 3.0;
  const uy = variables.uy ?? 2.0;
  const vx = variables.vx ?? 1.0;
  const vy = variables.vy ?? 4.0;
  const showResultant = variables.showResultant ?? 1;
  const showProjection = variables.showProjection ?? 1;
  const showParallelogram = variables.showParallelogram ?? 1;

  const u: Point2D = { x: ux, y: uy };
  const v: Point2D = { x: vx, y: vy };
  const resultant: Point2D = { x: ux + vx, y: uy + vy };

  const dot = MathEngine.vectorDotProduct2D(u, v);
  const cross = MathEngine.vectorCrossProduct2D(u, v);
  const magU = MathEngine.vectorMagnitude2D(u);
  const magV = MathEngine.vectorMagnitude2D(v);
  const magR = MathEngine.vectorMagnitude2D(resultant);
  const angleDeg = MathEngine.vectorAngle2D(u, v);
  const projection = MathEngine.vectorProjection(u, v);

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

    const originX = width / 2;
    const originY = height / 2 + 20;
    const scale = Math.min(width, height) / 16; // Pixels per unit

    const toScreenX = (x: number) => originX + x * scale;
    const toScreenY = (y: number) => originY - y * scale;

    // Background
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = "rgba(51, 65, 85, 0.35)";
    ctx.lineWidth = 1;
    for (let gx = -8; gx <= 8; gx++) {
      const sx = toScreenX(gx);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      if (gx !== 0) {
        ctx.fillStyle = "#64748b";
        ctx.font = "10px sans-serif";
        ctx.fillText(gx.toString(), sx - 4, originY + 14);
      }
    }

    for (let gy = -8; gy <= 8; gy++) {
      const sy = toScreenY(gy);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      if (gy !== 0) {
        ctx.fillStyle = "#64748b";
        ctx.font = "10px sans-serif";
        ctx.fillText(gy.toString(), originX + 5, sy + 3);
      }
    }

    // Axes
    ctx.strokeStyle = "rgba(148, 163, 184, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Helper: Draw Arrow Vector
    const drawArrow = (
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      color: string,
      lineWidth: number = 3,
      label?: string
    ) => {
      const headlen = 12;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headlen * Math.cos(angle - Math.PI / 6),
        toY - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - headlen * Math.cos(angle + Math.PI / 6),
        toY - headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      if (label) {
        ctx.fillStyle = color;
        ctx.font = "bold 12px monospace";
        ctx.fillText(label, toX + 8, toY - 6);
      }
    };

    // Parallelogram dashed lines
    if (showParallelogram) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      // u -> u+v
      ctx.moveTo(toScreenX(ux), toScreenY(uy));
      ctx.lineTo(toScreenX(resultant.x), toScreenY(resultant.y));
      // v -> u+v
      ctx.moveTo(toScreenX(vx), toScreenY(vy));
      ctx.lineTo(toScreenX(resultant.x), toScreenY(resultant.y));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Projection shadow line
    if (showProjection) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(234, 179, 8, 0.5)";
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.5;
      ctx.moveTo(toScreenX(ux), toScreenY(uy));
      ctx.lineTo(toScreenX(projection.x), toScreenY(projection.y));
      ctx.stroke();
      ctx.setLineDash([]);

      // Projection vector on v
      drawArrow(originX, originY, toScreenX(projection.x), toScreenY(projection.y), "#eab308", 2.5, "proj_v(u)");
    }

    // Resultant Vector R (Magenta)
    if (showResultant) {
      drawArrow(originX, originY, toScreenX(resultant.x), toScreenY(resultant.y), "#ec4899", 3.5, `R = u + v`);
    }

    // Vector u (Sky Blue)
    drawArrow(originX, originY, toScreenX(ux), toScreenY(uy), "#38bdf8", 3.5, `u (${ux.toFixed(1)}, ${uy.toFixed(1)})`);

    // Vector v (Emerald Green)
    drawArrow(originX, originY, toScreenX(vx), toScreenY(vy), "#34d399", 3.5, `v (${vx.toFixed(1)}, ${vy.toFixed(1)})`);

    // Draggable Handle Circles
    ctx.beginPath();
    ctx.arc(toScreenX(ux), toScreenY(uy), 8, 0, Math.PI * 2);
    ctx.fillStyle = "#38bdf8";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(toScreenX(vx), toScreenY(vy), 8, 0, Math.PI * 2);
    ctx.fillStyle = "#34d399";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Angle Arc between u and v
    const angleU = Math.atan2(uy, ux);
    const angleV = Math.atan2(vy, vx);
    ctx.beginPath();
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.arc(originX, originY, 32, -angleU, -angleV, angleU < angleV);
    ctx.stroke();

  }, [ux, uy, vx, vy, showResultant, showProjection, showParallelogram, resultant, projection]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const originX = width / 2;
    const originY = height / 2 + 20;
    const scale = Math.min(width, height) / 16;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const uPx = originX + ux * scale;
    const uPy = originY - uy * scale;
    const vPx = originX + vx * scale;
    const vPy = originY - vy * scale;

    const distU = Math.hypot(px - uPx, py - uPy);
    const distV = Math.hypot(px - vPx, py - vPy);

    let targetVec: "u" | "v" | null = null;
    if (distU < 25) targetVec = "u";
    else if (distV < 25) targetVec = "v";
    else return;

    setActiveDragVector(targetVec);

    const handlePointerMove = (ev: PointerEvent) => {
      const curPx = ev.clientX - rect.left;
      const curPy = ev.clientY - rect.top;
      const mathX = Number(((curPx - originX) / scale).toFixed(1));
      const mathY = Number((-(curPy - originY) / scale).toFixed(1));

      if (targetVec === "u") {
        onVariableChange("ux", Math.max(-6, Math.min(6, mathX)));
        onVariableChange("uy", Math.max(-6, Math.min(6, mathY)));
      } else {
        onVariableChange("vx", Math.max(-6, Math.min(6, mathX)));
        onVariableChange("vy", Math.max(-6, Math.min(6, mathY)));
      }
    };

    const handlePointerUp = () => {
      setActiveDragVector(null);
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
          <span className="font-semibold text-slate-200">Interactive 2D/3D Vector Lab</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded text-slate-200 font-mono-math text-[11px]">
            <span className="text-sky-400">|u| = {magU.toFixed(2)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">|v| = {magV.toFixed(2)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-pink-400">|R| = {magR.toFixed(2)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400">u · v = {dot.toFixed(2)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-indigo-400">Angle = {angleDeg.toFixed(1)}°</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 italic">Drag vector heads directly</span>
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
