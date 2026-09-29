import React, { useState } from "react";
import { MathFormula } from "../MathFormula";
import { BarChart3, Plus, RotateCcw, TrendingUp } from "lucide-react";
import { MathEngine, Point2D } from "../../engine/mathEngine";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const StatisticsDataLab: React.FC<Props> = ({ variables }) => {
  const [points, setPoints] = useState<Point2D[]>([
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 5 },
    { x: 4, y: 4 },
    { x: 5, y: 6 },
    { x: 6, y: 8 },
    { x: 7, y: 7 },
  ]);

  const [activeTab, setActiveTab] = useState<"regression" | "boxplot">("regression");

  // Calculations
  const yValues = points.map((p) => p.y);
  const stats = MathEngine.calculateStatistics(yValues);
  const regression = MathEngine.computeLinearRegression(points);

  // SVG coordinate scales: domain x in [0, 10], y in [0, 10]
  const SVG_W = 440;
  const SVG_H = 260;
  const PAD = 40;

  const toSvgX = (x: number) => PAD + (x / 10) * (SVG_W - 2 * PAD);
  const toSvgY = (y: number) => SVG_H - PAD - (y / 10) * (SVG_H - 2 * PAD);

  const addPoint = () => {
    const nextX = Math.min(9.5, points.length + 1);
    const nextY = Math.round((regression.slope * nextX + regression.intercept + (Math.random() * 2 - 1)) * 10) / 10;
    setPoints([...points, { x: nextX, y: Math.max(0.5, Math.min(9.5, nextY)) }]);
  };

  const resetPoints = () => {
    setPoints([
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 6 },
      { x: 6, y: 8 },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-teal-400" size={18} />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Statistics & Linear Regression Lab
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 font-mono border border-teal-800/50">
            r, R², σ, IQR
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab("regression")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === "regression" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Scatter & Fit (y = mx+b)
            </button>
            <button
              onClick={() => setActiveTab("boxplot")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === "boxplot" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Box-and-Whisker (Quartiles)
            </button>
          </div>

          <button
            onClick={addPoint}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1 border border-slate-700"
          >
            <Plus size={13} />
            <span>Add Data</span>
          </button>
          <button
            onClick={resetPoints}
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            title="Reset"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Main Visual Stage */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-3 select-none overflow-hidden">
        {activeTab === "regression" && (
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full max-h-[280px]">
            {/* Grid & Axes */}
            <line x1={PAD} y1={SVG_H - PAD} x2={SVG_W - PAD} y2={SVG_H - PAD} stroke="#475569" strokeWidth="2" />
            <line x1={PAD} y1={PAD} x2={PAD} y2={SVG_H - PAD} stroke="#475569" strokeWidth="2" />

            {/* Regression Line: y = mx + c */}
            <line
              x1={toSvgX(0)}
              y1={toSvgY(regression.intercept)}
              x2={toSvgX(10)}
              y2={toSvgY(regression.slope * 10 + regression.intercept)}
              stroke="#2dd4bf"
              strokeWidth="2.5"
            />

            {/* Residual lines and scatter dots */}
            {points.map((p, idx) => {
              const fittedY = regression.slope * p.x + regression.intercept;
              return (
                <g key={`pt-${idx}`}>
                  {/* Residual vertical line */}
                  <line
                    x1={toSvgX(p.x)}
                    y1={toSvgY(p.y)}
                    x2={toSvgX(p.x)}
                    y2={toSvgY(fittedY)}
                    stroke="#f43f5e"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  {/* Data Point */}
                  <circle
                    cx={toSvgX(p.x)}
                    cy={toSvgY(p.y)}
                    r={6}
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {activeTab === "boxplot" && (
          <div className="w-full max-w-md flex flex-col items-center space-y-4">
            <svg width="360" height="120" viewBox="0 0 360 120">
              {/* Whiskers */}
              <line x1={toSvgX(stats.min)} y1="60" x2={toSvgX(stats.q1)} y2="60" stroke="#94a3b8" strokeWidth="2" />
              <line x1={toSvgX(stats.q3)} y1="60" x2={toSvgX(stats.max)} y2="60" stroke="#94a3b8" strokeWidth="2" />

              {/* Min & Max end caps */}
              <line x1={toSvgX(stats.min)} y1="45" x2={toSvgX(stats.min)} y2="75" stroke="#94a3b8" strokeWidth="2" />
              <line x1={toSvgX(stats.max)} y1="45" x2={toSvgX(stats.max)} y2="75" stroke="#94a3b8" strokeWidth="2" />

              {/* IQR Box */}
              <rect
                x={toSvgX(stats.q1)}
                y="35"
                width={Math.max(10, toSvgX(stats.q3) - toSvgX(stats.q1))}
                height="50"
                fill="#0f766e"
                fillOpacity="0.6"
                stroke="#2dd4bf"
                strokeWidth="2"
                rx="4"
              />

              {/* Median Line */}
              <line
                x1={toSvgX(stats.median)}
                y1="35"
                x2={toSvgX(stats.median)}
                y2="85"
                stroke="#f59e0b"
                strokeWidth="3"
              />
            </svg>

            <div className="grid grid-cols-4 gap-2 w-full text-center text-[10px] font-mono">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                Min: {stats.min.toFixed(1)}
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-teal-300">
                Q1: {stats.q1.toFixed(1)}
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                Median: {stats.median.toFixed(1)}
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                Max: {stats.max.toFixed(1)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistical Metric Cards */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-teal-400 uppercase font-mono font-bold block">
            Linear Regression Model
          </span>
          <MathFormula formula={`y = ${regression.slope.toFixed(2)}x + ${regression.intercept.toFixed(2)}`} block />
          <div className="text-slate-300 text-[11px] flex justify-between font-mono pt-1">
            <span>Correlation r = <strong className="text-teal-300">{regression.r.toFixed(3)}</strong></span>
            <span>R² = <strong className="text-teal-300">{regression.rSquared.toFixed(3)}</strong></span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">
            Descriptive Spread (y-values)
          </span>
          <div className="text-slate-300 text-[11px] grid grid-cols-2 gap-1 font-mono">
            <div>Mean $\mu = {stats.mean.toFixed(2)}$</div>
            <div>Std Dev $\sigma = {stats.stdDev.toFixed(2)}$</div>
            <div>Variance $s^2 = {stats.variance.toFixed(2)}$</div>
            <div>IQR $= {stats.iqr.toFixed(2)}$</div>
          </div>
        </div>
      </div>
    </div>
  );
};
