import React, { useRef, useEffect } from "react";
import { CheckCircle, ArrowRight, RotateCcw } from "lucide-react";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const AlgebraBalanceCanvas: React.FC<Props> = ({
  variables,
  onVariableChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const a = Math.max(1, Math.round(variables.a ?? 2));
  const b = Math.max(0, Math.round(variables.b ?? 5));
  const c = Math.max(1, Math.round(variables.c ?? 15));
  const stepState = variables.stepState ?? 0; // 0: initial, 1: subtracted b, 2: divided by a

  const solutionX = (c - b) / a;

  // Draw mechanical balance
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

    // Background
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, width, height);

    // Left vs Right weight in current step
    let leftWeight = 0;
    let rightWeight = 0;

    if (stepState === 0) {
      leftWeight = a * solutionX + b;
      rightWeight = c;
    } else if (stepState === 1) {
      leftWeight = a * solutionX;
      rightWeight = c - b;
    } else {
      leftWeight = solutionX;
      rightWeight = solutionX;
    }

    // Tilt angle (0 when balanced)
    const tiltAngle = Math.max(-0.2, Math.min(0.2, (rightWeight - leftWeight) * 0.015));

    // Balance Base Pivot
    const pivotX = width / 2;
    const pivotY = height * 0.65;
    const beamLength = Math.min(width * 0.7, 380);

    // Fulcrum Base Triangle
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX - 35, pivotY + 70);
    ctx.lineTo(pivotX + 35, pivotY + 70);
    ctx.closePath();
    ctx.fillStyle = "#334155";
    ctx.fill();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pivot Pin Circle
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();

    // Balance Beam (Rotated)
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(tiltAngle);

    ctx.beginPath();
    ctx.moveTo(-beamLength / 2, 0);
    ctx.lineTo(beamLength / 2, 0);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Left Pan Suspension Hanger
    const leftHangerX = -beamLength / 2;
    const rightHangerX = beamLength / 2;

    ctx.restore(); // Exit rotated beam context for vertical strings

    // Computed world positions for pans
    const leftPanPivotX = pivotX - (beamLength / 2) * Math.cos(tiltAngle);
    const leftPanPivotY = pivotY - (beamLength / 2) * Math.sin(tiltAngle);

    const rightPanPivotX = pivotX + (beamLength / 2) * Math.cos(tiltAngle);
    const rightPanPivotY = pivotY + (beamLength / 2) * Math.sin(tiltAngle);

    const panDrop = 70;
    const panWidth = 110;

    // Draw Left Pan Strings and Plate
    ctx.strokeStyle = "rgba(148, 163, 184, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(leftPanPivotX, leftPanPivotY);
    ctx.lineTo(leftPanPivotX - panWidth / 2, leftPanPivotY + panDrop);
    ctx.moveTo(leftPanPivotX, leftPanPivotY);
    ctx.lineTo(leftPanPivotX + panWidth / 2, leftPanPivotY + panDrop);
    ctx.stroke();

    // Left Pan Plate
    ctx.beginPath();
    ctx.ellipse(leftPanPivotX, leftPanPivotY + panDrop, panWidth / 2, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Right Pan Strings and Plate
    ctx.beginPath();
    ctx.moveTo(rightPanPivotX, rightPanPivotY);
    ctx.lineTo(rightPanPivotX - panWidth / 2, rightPanPivotY + panDrop);
    ctx.moveTo(rightPanPivotX, rightPanPivotY);
    ctx.lineTo(rightPanPivotX + panWidth / 2, rightPanPivotY + panDrop);
    ctx.stroke();

    // Right Pan Plate
    ctx.beginPath();
    ctx.ellipse(rightPanPivotX, rightPanPivotY + panDrop, panWidth / 2, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ==========================================
    // DRAW OBJECTS ON PANS
    // ==========================================

    // Left Pan: Mystery x-boxes + constant blocks
    const leftBaseY = leftPanPivotY + panDrop - 6;

    if (stepState === 0) {
      // Draw 'a' mystery x-boxes
      for (let i = 0; i < a; i++) {
        const bx = leftPanPivotX - 35 + i * 26;
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(bx, leftBaseY - 32, 22, 30);
        ctx.strokeStyle = "#7dd3fc";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, leftBaseY - 32, 22, 30);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px monospace";
        ctx.fillText("x", bx + 7, leftBaseY - 12);
      }

      // Draw constant weight block '+ b'
      if (b > 0) {
        ctx.fillStyle = "#d97706";
        ctx.fillRect(leftPanPivotX + 18, leftBaseY - 24, 28, 22);
        ctx.strokeStyle = "#fde68a";
        ctx.lineWidth = 1;
        ctx.strokeRect(leftPanPivotX + 18, leftBaseY - 24, 28, 22);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(`+${b}`, leftPanPivotX + 22, leftBaseY - 9);
      }
    } else if (stepState === 1) {
      // Mystery x-boxes only (b removed)
      for (let i = 0; i < a; i++) {
        const bx = leftPanPivotX - 35 + i * 26;
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(bx, leftBaseY - 32, 22, 30);
        ctx.strokeStyle = "#7dd3fc";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, leftBaseY - 32, 22, 30);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px monospace";
        ctx.fillText("x", bx + 7, leftBaseY - 12);
      }
    } else {
      // Single isolated x box
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(leftPanPivotX - 18, leftBaseY - 36, 36, 34);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.strokeRect(leftPanPivotX - 18, leftBaseY - 36, 36, 34);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px monospace";
      ctx.fillText("x", leftPanPivotX - 5, leftBaseY - 14);
    }

    // Right Pan: Weights
    const rightBaseY = rightPanPivotY + panDrop - 6;
    const currentRightVal = stepState === 0 ? c : stepState === 1 ? c - b : solutionX;

    ctx.fillStyle = "#059669";
    ctx.fillRect(rightPanPivotX - 25, rightBaseY - 35, 50, 32);
    ctx.strokeStyle = "#6ee7b7";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rightPanPivotX - 25, rightBaseY - 35, 50, 32);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`${currentRightVal}`, rightPanPivotX - 10, rightBaseY - 14);

    // Balance Status Banner
    ctx.fillStyle = "#38bdf8";
    ctx.font = "14px monospace";
    ctx.textAlign = "center";
    if (stepState === 0) {
      ctx.fillText(`${a}x + ${b} = ${c}`, pivotX, 40);
    } else if (stepState === 1) {
      ctx.fillText(`${a}x = ${c - b}  (Removed ${b} from both sides)`, pivotX, 40);
    } else {
      ctx.fillStyle = "#34d399";
      ctx.fillText(`x = ${solutionX.toFixed(2)}  (Divided both sides by ${a})`, pivotX, 40);
    }
    ctx.textAlign = "start";

  }, [a, b, c, stepState, solutionX]);

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Top Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">Interactive Algebraic Balance Scale</span>
          <span className="text-slate-500">|</span>
          <span className="font-mono-math text-amber-300">
            {a}x + {b} = {c}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onVariableChange("stepState", 0)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              stepState === 0 ? "bg-blue-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            1. Initial Balance
          </button>
          <button
            onClick={() => onVariableChange("stepState", 1)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              stepState === 1 ? "bg-blue-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            2. Remove {b}
          </button>
          <button
            onClick={() => onVariableChange("stepState", 2)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              stepState === 2 ? "bg-emerald-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            3. Divide by {a}
          </button>
          <button
            onClick={() => {
              onVariableChange("a", 2);
              onVariableChange("b", 5);
              onVariableChange("c", 15);
              onVariableChange("stepState", 0);
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative flex-1 min-h-[360px] w-full">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
};
