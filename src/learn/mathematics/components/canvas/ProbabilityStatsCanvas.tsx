import React, { useRef, useEffect, useState, useMemo } from "react";
import { MathEngine } from "../../engine/mathEngine";
import { Play, RotateCcw, Dices } from "lucide-react";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const ProbabilityStatsCanvas: React.FC<Props> = ({
  variables,
  onVariableChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [samples, setSamples] = useState<number[]>([]);

  const sampleSize = variables.sampleSize ?? 200;
  const targetMean = variables.targetMean ?? 50.0;
  const targetStd = variables.targetStd ?? 12.0;

  // Generate samples
  const generateSamples = () => {
    const newSamples = MathEngine.generateNormalSamples(targetMean, targetStd, Math.round(sampleSize));
    setSamples(newSamples);
  };

  useEffect(() => {
    generateSamples();
  }, [sampleSize, targetMean, targetStd]);

  // Compute statistics
  const stats = useMemo(() => MathEngine.computeBasicStats(samples), [samples]);

  // Draw Histogram & Gaussian Bell Curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || samples.length === 0) return;
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

    // Coordinate space
    const xMin = Math.max(0, targetMean - 3.5 * targetStd);
    const xMax = targetMean + 3.5 * targetStd;
    const numBins = 24;
    const binWidth = (xMax - xMin) / numBins;

    // Binning counts
    const bins = new Array(numBins).fill(0);
    samples.forEach((val) => {
      if (val >= xMin && val <= xMax) {
        const bIdx = Math.min(numBins - 1, Math.floor((val - xMin) / binWidth));
        bins[bIdx]++;
      }
    });

    const maxBinCount = Math.max(1, ...bins);
    const chartBottom = height - 50;
    const chartTop = 30;
    const chartHeight = chartBottom - chartTop;

    const toScreenX = (x: number) => 35 + ((x - xMin) / (xMax - xMin)) * (width - 70);
    const toScreenY = (freq: number) => chartBottom - (freq / maxBinCount) * chartHeight;

    // Grid
    ctx.strokeStyle = "rgba(51, 65, 85, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(35, chartBottom);
    ctx.lineTo(width - 35, chartBottom);
    ctx.stroke();

    // 1. Draw Histogram Bars
    const barPxWidth = (width - 70) / numBins;
    bins.forEach((count, i) => {
      const bX = 35 + i * barPxWidth;
      const bH = (count / maxBinCount) * chartHeight;
      const bY = chartBottom - bH;

      ctx.fillStyle = "rgba(99, 102, 241, 0.4)";
      ctx.fillRect(bX + 1, bY, barPxWidth - 2, bH);

      ctx.strokeStyle = "rgba(167, 139, 250, 0.8)";
      ctx.lineWidth = 1;
      ctx.strokeRect(bX + 1, bY, barPxWidth - 2, bH);
    });

    // 2. Draw Theoretical Gaussian PDF Curve
    const gaussianPeak = 1 / (targetStd * Math.sqrt(2 * Math.PI));
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(56, 189, 248, 0.5)";
    ctx.shadowBlur = 6;

    for (let px = 35; px <= width - 35; px += 2) {
      const xVal = xMin + ((px - 35) / (width - 70)) * (xMax - xMin);
      const pdf = (1 / (targetStd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((xVal - targetMean) / targetStd, 2));
      const normalizedHeight = (pdf / gaussianPeak) * chartHeight * 0.95;
      const py = chartBottom - normalizedHeight;

      if (px === 35) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Mean Marker Line (Amber)
    const meanScreenX = toScreenX(stats.mean);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(meanScreenX, chartTop);
    ctx.lineTo(meanScreenX, chartBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`Sample μ = ${stats.mean.toFixed(1)}`, meanScreenX - 35, chartTop - 10);

    // X-axis scale labels
    ctx.fillStyle = "#64748b";
    ctx.font = "10px sans-serif";
    for (let i = 0; i <= 6; i++) {
      const val = xMin + (i / 6) * (xMax - xMin);
      const sx = toScreenX(val);
      ctx.fillText(val.toFixed(0), sx - 8, chartBottom + 18);
    }

  }, [samples, stats, targetMean, targetStd]);

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">Monte Carlo & Gaussian Distribution Lab</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded text-slate-200 font-mono-math text-[11px]">
            <span className="text-amber-400">N = {samples.length}</span>
            <span className="text-slate-500">|</span>
            <span className="text-sky-400">Mean μ = {stats.mean.toFixed(2)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">Std Dev σ = {stats.stdDev.toFixed(2)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-purple-400">Median = {stats.median.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generateSamples}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-all"
          >
            <Dices size={14} />
            <span>Resample (Roll)</span>
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
