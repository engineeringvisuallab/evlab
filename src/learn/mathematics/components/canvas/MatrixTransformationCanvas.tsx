import React, { useRef, useEffect } from "react";
import { MathEngine } from "../../engine/mathEngine";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const MatrixTransformationCanvas: React.FC<Props> = ({
  variables,
  onVariableChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const a = variables.a ?? 1.5;
  const b = variables.b ?? 0.5;
  const c = variables.c ?? 0.0;
  const d = variables.d ?? 1.2;
  const showEigenvectors = variables.showEigenvectors ?? 1;

  const det = MathEngine.matrix2x2Determinant(a, b, c, d);
  const eigenvalues = MathEngine.matrix2x2Eigenvalues(a, b, c, d);

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
    const originY = height / 2;
    const scale = Math.min(width, height) / 14;

    const toScreenX = (x: number) => originX + x * scale;
    const toScreenY = (y: number) => originY - y * scale;

    // Background
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Original Untransformed Grid (Subtle gray lines)
    ctx.strokeStyle = "rgba(71, 85, 105, 0.25)";
    ctx.lineWidth = 1;
    for (let gx = -6; gx <= 6; gx++) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(gx), toScreenY(-6));
      ctx.lineTo(toScreenX(gx), toScreenY(6));
      ctx.stroke();
    }
    for (let gy = -6; gy <= 6; gy++) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(-6), toScreenY(gy));
      ctx.lineTo(toScreenX(6), toScreenY(gy));
      ctx.stroke();
    }

    // 2. Draw Transformed Grid Lines
    ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
    ctx.lineWidth = 1.2;

    // Transformed vertical grid lines (x = constant, mapped by A)
    for (let gx = -6; gx <= 6; gx++) {
      const x1 = gx * a + (-6) * b;
      const y1 = gx * c + (-6) * d;
      const x2 = gx * a + 6 * b;
      const y2 = gx * c + 6 * d;

      ctx.beginPath();
      ctx.moveTo(toScreenX(x1), toScreenY(y1));
      ctx.lineTo(toScreenX(x2), toScreenY(y2));
      ctx.stroke();
    }

    // Transformed horizontal grid lines (y = constant, mapped by A)
    for (let gy = -6; gy <= 6; gy++) {
      const x1 = (-6) * a + gy * b;
      const y1 = (-6) * c + gy * d;
      const x2 = 6 * a + gy * b;
      const y2 = 6 * c + gy * d;

      ctx.beginPath();
      ctx.moveTo(toScreenX(x1), toScreenY(y1));
      ctx.lineTo(toScreenX(x2), toScreenY(y2));
      ctx.stroke();
    }

    // 3. Draw Transformed Unit Square (Determinant Area)
    // Vertices: (0,0) -> (a,c) -> (a+b, c+d) -> (b,d) -> (0,0)
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), toScreenY(0));
    ctx.lineTo(toScreenX(a), toScreenY(c));
    ctx.lineTo(toScreenX(a + b), toScreenY(c + d));
    ctx.lineTo(toScreenX(b), toScreenY(d));
    ctx.closePath();

    ctx.fillStyle = det >= 0 ? "rgba(251, 191, 36, 0.25)" : "rgba(239, 68, 68, 0.25)";
    ctx.fill();
    ctx.strokeStyle = det >= 0 ? "#fbbf24" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Eigenvector lines if real
    if (showEigenvectors && eigenvalues.isReal) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2;

      // Draw eigenvalue 1 line
      const l1 = eigenvalues.lambda1.re;
      // Solve (a - l1) x + b y = 0 -> y = -(a-l1)/b * x
      if (Math.abs(b) > 0.001) {
        const slope1 = -(a - l1) / b;
        ctx.beginPath();
        ctx.moveTo(toScreenX(-6), toScreenY(-6 * slope1));
        ctx.lineTo(toScreenX(6), toScreenY(6 * slope1));
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    // 5. Helper Arrow function
    const drawArrow = (toX: number, toY: number, color: string, label: string) => {
      const headlen = 10;
      const sx = toScreenX(0);
      const sy = toScreenY(0);
      const ex = toScreenX(toX);
      const ey = toScreenY(toY);
      const angle = Math.atan2(ey - sy, ex - sx);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - headlen * Math.cos(angle - Math.PI / 6), ey - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(ex - headlen * Math.cos(angle + Math.PI / 6), ey - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = color;
      ctx.font = "bold 12px monospace";
      ctx.fillText(label, ex + 8, ey - 6);
    };

    // Basis Vector T(i) (Green) and T(j) (Cyan)
    drawArrow(a, c, "#34d399", `T(i) = (${a.toFixed(1)}, ${c.toFixed(1)})`);
    drawArrow(b, d, "#38bdf8", `T(j) = (${b.toFixed(1)}, ${d.toFixed(1)})`);

    // Origin Pin
    ctx.beginPath();
    ctx.arc(originX, originY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

  }, [a, b, c, d, showEigenvectors, det, eigenvalues]);

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">Matrix Spatial Transformation: X' = AX</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded text-slate-200 font-mono-math">
            <span className={det >= 0 ? "text-amber-400" : "text-red-400"}>
              det(A) = {det.toFixed(2)} (Area Scale)
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-purple-400">
              {!eigenvalues.isReal
                ? "Complex Eigenvalues (Rotation)"
                : `λ₁ = ${eigenvalues.lambda1.re.toFixed(2)}, λ₂ = ${eigenvalues.lambda2.re.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              onVariableChange("a", 1);
              onVariableChange("b", 0);
              onVariableChange("c", 0);
              onVariableChange("d", 1);
            }}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
          >
            Identity
          </button>
          <button
            onClick={() => {
              onVariableChange("a", 0.707);
              onVariableChange("b", -0.707);
              onVariableChange("c", 0.707);
              onVariableChange("d", 0.707);
            }}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
          >
            Rotate 45°
          </button>
          <button
            onClick={() => {
              onVariableChange("a", 1);
              onVariableChange("b", 1.5);
              onVariableChange("c", 0);
              onVariableChange("d", 1);
            }}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
          >
            Shear
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
