import React, { useState, useMemo, useRef } from 'react';
import { Download, Maximize2, ZoomIn, ZoomOut, RotateCcw, LineChart, Sparkles } from 'lucide-react';
import { GraphChannel } from '../../types/physics';
import { formatValue } from '../../utils/physicsMath';

interface InteractiveGraphProps {
  channels: GraphChannel[];
  data: Record<string, any>[];
  title?: string;
}

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
  channels,
  data,
  title = 'Real-Time Dynamic Graph',
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || '');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeChannel = useMemo(() => {
    return channels.find((c) => c.id === selectedChannelId) || channels[0];
  }, [channels, selectedChannelId]);

  // Compute bounding box
  const { minX, maxX, minY, maxY, points } = useMemo(() => {
    if (!activeChannel || !data || data.length === 0) {
      return { minX: 0, maxX: 10, minY: 0, maxY: 10, points: [] };
    }

    const xKey = activeChannel.xKey;
    const yKey = activeChannel.yKey;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const validPoints = data
      .map((d, index) => {
        const x = Number(d[xKey]);
        const y = Number(d[yKey]);
        if (isNaN(x) || isNaN(y)) return null;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        return { x, y, raw: d, index };
      })
      .filter(Boolean) as { x: number; y: number; raw: Record<string, any>; index: number }[];

    if (minX === Infinity || minX === maxX) {
      minX = 0;
      maxX = 10;
    }
    if (minY === Infinity || minY === maxY) {
      minY = 0;
      maxY = 10;
    }

    // Add 10% padding to Y range for visual breathing space
    const yPad = (maxY - minY) * 0.1 || 1.0;
    minY -= yPad;
    maxY += yPad;

    return { minX, maxX, minY, maxY, points: validPoints };
  }, [activeChannel, data]);

  // SVG Coordinates mapping
  const width = 640;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const scaleX = (x: number) => {
    const range = (maxX - minX) / zoomLevel;
    return padding.left + ((x - minX) / (range || 1)) * plotWidth;
  };

  const scaleY = (y: number) => {
    const range = maxY - minY;
    return height - padding.bottom - ((y - minY) / (range || 1)) * plotHeight;
  };

  // Generate SVG path string
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, index) => {
      const sx = scaleX(pt.x);
      const sy = scaleY(pt.y);
      return index === 0 ? `M ${sx} ${sy}` : `${acc} L ${sx} ${sy}`;
    }, '');
  }, [points, minX, maxX, minY, maxY, zoomLevel]);

  // Instant Slope / Rate Calculation
  const instantaneousSlope = useMemo(() => {
    if (points.length < 2) return 0;
    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return dx !== 0 ? dy / dx : 0;
  }, [points]);

  const handleExportCSV = () => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((d) => Object.values(d).join(',')).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `physics_lab_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="interactive-graph"
      className="bg-[#080808] border border-white/10 rounded-xl p-4 shadow-xl flex flex-col h-full"
    >
      {/* Top Controls Header - Elegant Dark */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {title}
            </h3>
            <span className="text-[10px] text-white/40 font-mono">
              Empirical Real-Time Oscilloscope Channel
            </span>
          </div>
        </div>

        {/* Channel Selector Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannelId(ch.id)}
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors ${
                selectedChannelId === ch.id
                  ? 'bg-cyan-600 text-black font-bold'
                  : 'bg-[#050505] text-white/50 border border-white/10 hover:text-white'
              }`}
            >
              {ch.name}
            </button>
          ))}

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#050505] hover:bg-white/5 text-white/70 hover:text-white border border-white/10 rounded text-xs font-mono transition-colors ml-1"
            title="Export CSV Dataset"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Slope & Instantaneous Rate Readout Pill */}
      <div className="flex items-center justify-between mb-2 px-1 text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-white/40 uppercase">INSTANT SLOPE (dy/dx):</span>
          <span className="text-cyan-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">
            {formatValue(instantaneousSlope, 3)}{' '}
            <span className="text-[9px] text-white/40 font-normal">
              {activeChannel?.yUnit}/{activeChannel?.xUnit}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z * 1.25, 4.0))}
            className="p-1 text-white/40 hover:text-white bg-[#050505] border border-white/10 rounded"
            title="Zoom In X"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z / 1.25, 0.5))}
            className="p-1 text-white/40 hover:text-white bg-[#050505] border border-white/10 rounded"
            title="Zoom Out X"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel(1.0)}
            className="p-1 text-white/40 hover:text-white bg-[#050505] border border-white/10 rounded"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Plot Wrapper */}
      <div
        ref={containerRef}
        className="flex-1 bg-[#020202] border border-white/10 rounded-lg relative overflow-hidden flex items-center justify-center p-2"
      >
        {points.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-white/30 text-xs font-mono space-y-2">
            <LineChart className="w-8 h-8 stroke-1 text-white/20" />
            <span>PLAY SIMULATION TO STREAM EMPIRICAL DATA POINTS</span>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id={`grad-${activeChannel?.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Coordinate Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((t) => {
              const y = padding.top + t * plotHeight;
              const yVal = maxY - t * (maxY - minY);
              return (
                <g key={`y-grid-${t}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-white/40 font-mono"
                  >
                    {formatValue(yVal, 1)}
                  </text>
                </g>
              );
            })}

            {[0, 0.25, 0.5, 0.75, 1.0].map((t) => {
              const x = padding.left + t * plotWidth;
              const xVal = minX + t * ((maxX - minX) / zoomLevel);
              return (
                <g key={`x-grid-${t}`}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={x}
                    y={height - padding.bottom + 14}
                    textAnchor="middle"
                    className="text-[9px] fill-white/40 font-mono"
                  >
                    {formatValue(xVal, 1)}
                  </text>
                </g>
              );
            })}

            {/* Axes Lines */}
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.5"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={height - padding.bottom}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.5"
            />

            {/* Axis Labels */}
            <text
              x={width / 2}
              y={height - 6}
              textAnchor="middle"
              className="text-[10px] font-mono fill-white/50 uppercase"
            >
              {activeChannel?.xLabel} ({activeChannel?.xUnit})
            </text>
            <text
              transform={`rotate(-90)`}
              x={-height / 2}
              y={16}
              textAnchor="middle"
              className="text-[10px] font-mono fill-white/50 uppercase"
            >
              {activeChannel?.yLabel} ({activeChannel?.yUnit})
            </text>

            {/* Filled area under curve */}
            {points.length > 1 && (
              <path
                d={`${pathD} L ${scaleX(points[points.length - 1].x)} ${height - padding.bottom} L ${scaleX(points[0].x)} ${height - padding.bottom} Z`}
                fill={`url(#grad-${activeChannel?.id})`}
              />
            )}

            {/* Data Curve */}
            <path
              d={pathD}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive hover inspector */}
            {points.map((pt, i) => {
              const sx = scaleX(pt.x);
              const sy = scaleY(pt.y);
              return (
                <circle
                  key={i}
                  cx={sx}
                  cy={sy}
                  r={hoverIndex === i ? 5 : 2}
                  fill={hoverIndex === i ? '#ffffff' : '#06b6d4'}
                  stroke="#06b6d4"
                  strokeWidth={hoverIndex === i ? 2 : 0}
                  className="cursor-pointer transition-all duration-100"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              );
            })}

            {/* Hover Tooltip Overlay */}
            {hoverIndex !== null && points[hoverIndex] && (
              <g
                transform={`translate(${scaleX(points[hoverIndex].x)}, ${scaleY(points[hoverIndex].y)})`}
              >
                <line
                  x1={0}
                  y1={-10}
                  x2={0}
                  y2={height - padding.bottom - scaleY(points[hoverIndex].y)}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeDasharray="2 2"
                />
                <rect
                  x={10}
                  y={-30}
                  width={110}
                  height={40}
                  rx={4}
                  fill="rgba(5, 5, 5, 0.95)"
                  stroke="#06b6d4"
                  strokeWidth="1"
                />
                <text x={18} y={-16} className="text-[10px] fill-white/60 font-mono">
                  {activeChannel?.xLabel}: {formatValue(points[hoverIndex].x, 2)} {activeChannel?.xUnit}
                </text>
                <text
                  x={18}
                  y={-4}
                  className="text-[10px] font-bold fill-cyan-400 font-mono"
                >
                  {activeChannel?.yLabel}: {formatValue(points[hoverIndex].y, 2)} {activeChannel?.yUnit}
                </text>
              </g>
            )}
          </svg>
        )}
      </div>
    </div>
  );
};
