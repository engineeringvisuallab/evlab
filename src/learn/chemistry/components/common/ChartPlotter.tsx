import React, { useState } from 'react';

export interface DataPoint {
  x: number;
  y: number;
  label?: string;
  theoreticalY?: number;
}

interface ChartPlotterProps {
  data: DataPoint[];
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  title?: string;
  height?: number;
  showTheoreticalLine?: boolean;
  color?: string;
  theoreticalColor?: string;
}

export const ChartPlotter: React.FC<ChartPlotterProps> = ({
  data,
  xLabel,
  yLabel,
  xUnit = '',
  yUnit = '',
  title,
  height = 220,
  showTheoreticalLine = true,
  color = '#06b6d4', // Cyan
  theoreticalColor = '#94a3b8' // Slate-400 dashed
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/60 text-slate-500 text-xs"
        style={{ height: `${height}px` }}
      >
        No graph data collected yet. Start the experiment to log data points.
      </div>
    );
  }

  // Calculate bounds
  const xValues = data.map((d) => d.x);
  const yValues = data.map((d) => d.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues) === minX ? minX + 1 : Math.max(...xValues);
  const minY = Math.min(0, ...yValues);
  const maxY = Math.max(...yValues) === minY ? minY + 1 : Math.max(...yValues) * 1.1;

  const padding = { top: 25, right: 25, bottom: 40, left: 45 };
  const chartWidth = 500;
  const chartHeight = height;

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const scaleX = (x: number) => padding.left + ((x - minX) / (maxX - minX)) * innerWidth;
  const scaleY = (y: number) => padding.top + innerHeight - ((y - minY) / (maxY - minY)) * innerHeight;

  // Build SVG path
  const linePath = data.reduce((acc, point, index) => {
    const px = scaleX(point.x);
    const py = scaleY(point.y);
    return `${acc} ${index === 0 ? 'M' : 'L'} ${px},${py}`;
  }, '');

  // Area path
  const firstX = scaleX(data[0].x);
  const lastX = scaleX(data[data.length - 1].x);
  const baseZeroY = scaleY(minY);
  const areaPath = `${linePath} L ${lastX},${baseZeroY} L ${firstX},${baseZeroY} Z`;

  // Theoretical path if present
  const hasTheoretical = data.some((d) => d.theoreticalY !== undefined);
  const theoreticalPath = hasTheoretical
    ? data.reduce((acc, point, index) => {
        const px = scaleX(point.x);
        const py = scaleY(point.theoreticalY ?? point.y);
        return `${acc} ${index === 0 ? 'M' : 'L'} ${px},${py}`;
      }, '')
    : '';

  // Generate 4 horizontal ticks
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => minY + pct * (maxY - minY));
  // Generate 4 vertical ticks
  const xTicks = [0, 0.33, 0.66, 1].map((pct) => minX + pct * (maxX - minX));

  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-md" id="scientific-chart-plotter">
      {title && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-200">{title}</span>
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-slate-400">Experimental</span>
            </div>
            {hasTheoretical && showTheoreticalLine && (
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 border-t border-dashed border-slate-400" />
                <span className="text-slate-400">Theoretical Model</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const yPos = scaleY(tick);
            return (
              <g key={`ytick-${i}`}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={chartWidth - padding.right}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 6}
                  y={yPos + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          {xTicks.map((tick, i) => {
            const xPos = scaleX(tick);
            return (
              <g key={`xtick-${i}`}>
                <line
                  x1={xPos}
                  y1={padding.top}
                  x2={xPos}
                  y2={chartHeight - padding.bottom}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={xPos}
                  y={chartHeight - padding.bottom + 14}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Theoretical Curve */}
          {hasTheoretical && showTheoreticalLine && (
            <path
              d={theoreticalPath}
              fill="none"
              stroke={theoreticalColor}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Experimental Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {data.map((pt, i) => {
            const px = scaleX(pt.x);
            const py = scaleY(pt.y);
            const isHovered = hoveredPoint === pt;

            return (
              <circle
                key={`pt-${i}`}
                cx={px}
                cy={py}
                r={isHovered ? 5 : 3}
                fill={isHovered ? '#ffffff' : color}
                stroke="#0f172a"
                strokeWidth="1.5"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Axis Labels */}
          <text
            x={padding.left + innerWidth / 2}
            y={chartHeight - 8}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10"
            fontWeight="500"
          >
            {xLabel} {xUnit && `(${xUnit})`}
          </text>

          <text
            x={-padding.top - innerHeight / 2}
            y={12}
            textAnchor="middle"
            transform="rotate(-90)"
            fill="#94a3b8"
            fontSize="10"
            fontWeight="500"
          >
            {yLabel} {yUnit && `(${yUnit})`}
          </text>
        </svg>
      </div>

      {/* Point Hover Tooltip */}
      {hoveredPoint && (
        <div className="absolute bottom-12 right-6 px-2.5 py-1.5 rounded-lg bg-slate-800/95 border border-slate-700 text-xs shadow-lg pointer-events-none">
          <div className="text-slate-300 font-mono">
            {xLabel}: <strong className="text-white">{hoveredPoint.x} {xUnit}</strong>
          </div>
          <div className="text-cyan-400 font-mono font-bold">
            {yLabel}: {hoveredPoint.y} {yUnit}
          </div>
          {hoveredPoint.theoreticalY !== undefined && (
            <div className="text-slate-400 font-mono text-[10px]">
              Theor: {hoveredPoint.theoreticalY} {yUnit}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
