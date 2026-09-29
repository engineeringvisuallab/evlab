import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Type,
  ArrowRightLeft,
  Sliders,
  Download,
  CheckCircle2,
  Eye,
  Layers,
  Compass,
  FileCode,
} from 'lucide-react';
import { Language } from '../types';
import { AUTOCAD_PLUGINS } from '../data/pluginsAutoCAD';
import { triggerPluginDownload } from '../utils/fileDownloader';

interface SectionMarkerVisualizerProps {
  lang?: Language;
}

export const SectionMarkerVisualizer: React.FC<SectionMarkerVisualizerProps> = ({
  lang = 'en',
}) => {
  // 1. Text states (Text change kora jabe)
  const [sectionTag, setSectionTag] = useState<string>('A');
  const [sheetNo, setSheetNo] = useState<string>('A-101');

  // 2. Length & Geometry states (Je kono length a boro kora jabe)
  const [lineLength, setLineLength] = useState<number>(460); // In SVG canvas units
  const [angleDeg, setAngleDeg] = useState<number>(0); // 0 = horizontal
  const [viewDirection, setViewDirection] = useState<'left' | 'right'>('left');
  const [markerEnds, setMarkerEnds] = useState<'both' | 'start' | 'end'>('both');
  const [lineStyle, setLineStyle] = useState<'phantom' | 'continuous' | 'dashed'>('phantom');
  const [scaleFactor, setScaleFactor] = useState<number>(1.0); // 1:100 standard
  const [showFloorPlan, setShowFloorPlan] = useState<boolean>(true);

  // Dragging grip state
  const [isDraggingEnd, setIsDraggingEnd] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Section Marker plugin item for download
  const secMarkPlugin = AUTOCAD_PLUGINS.find((p) => p.id === 'autocad-evl-secmark') || AUTOCAD_PLUGINS[0];

  // Canvas geometry calculation
  const canvasWidth = 720;
  const canvasHeight = 340;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const halfLen = lineLength / 2;
  const radAngle = (angleDeg * Math.PI) / 180;
  const cosA = Math.cos(radAngle);
  const sinA = Math.sin(radAngle);

  // Start point (P1) and End point (P2)
  const p1 = {
    x: centerX - halfLen * cosA,
    y: centerY - halfLen * sinA,
  };
  const p2 = {
    x: centerX + halfLen * cosA,
    y: centerY + halfLen * sinA,
  };

  // Perpendicular vector for view direction arrow
  const perpSign = viewDirection === 'left' ? -1 : 1;
  const perpX = -sinA * perpSign;
  const perpY = cosA * perpSign;

  // Handle interactive dragging of the end point
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDraggingEnd(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingEnd || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * canvasWidth;
    const mouseY = ((e.clientY - rect.top) / rect.height) * canvasHeight;

    // Vector from P1 to Mouse
    const dx = mouseX - p1.x;
    const dy = mouseY - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist >= 120 && dist <= 680) {
      setLineLength(Math.round(dist));
      const newAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      // Snap to 0, 45, 90, -45, -90 if close
      if (Math.abs(newAngle) < 6) setAngleDeg(0);
      else if (Math.abs(newAngle - 90) < 6) setAngleDeg(90);
      else if (Math.abs(newAngle + 90) < 6) setAngleDeg(-90);
      else setAngleDeg(Math.round(newAngle));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDraggingEnd(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Dimensions scaled
  const bubbleR = 26 * scaleFactor;
  const arrowH = 18 * scaleFactor;
  const arrowW = 16 * scaleFactor;
  const tagFontSize = 16 * scaleFactor;
  const shtFontSize = 10 * scaleFactor;
  const heavyTailLen = 40 * scaleFactor;

  // Helper to render architectural split bubble + direction arrow at an endpoint
  const renderSectionHead = (
    basePt: { x: number; y: number },
    dirAlongX: number,
    dirAlongY: number,
    isEnd: boolean,
  ) => {
    // Center of bubble offset outward past endpoint
    const centerDist = bubbleR + 6;
    const cx = basePt.x + dirAlongX * centerDist;
    const cy = basePt.y + dirAlongY * centerDist;

    // Arrow geometry: equilateral triangle pointing in perpendicular direction
    const arrowTipDist = bubbleR + arrowH;
    const tipX = cx + perpX * arrowTipDist;
    const tipY = cy + perpY * arrowTipDist;

    const baseCenterX = cx + perpX * bubbleR;
    const baseCenterY = cy + perpY * bubbleR;

    const tangX = -perpY;
    const tangY = perpX;

    const corner1X = baseCenterX + tangX * (arrowW / 2);
    const corner1Y = baseCenterY + tangY * (arrowW / 2);
    const corner2X = baseCenterX - tangX * (arrowW / 2);
    const corner2Y = baseCenterY - tangY * (arrowW / 2);

    // Heavy cutting turn line (tick line)
    const tickLen = 22 * scaleFactor;
    const tickEndX = basePt.x + perpX * tickLen;
    const tickEndY = basePt.y + perpY * tickLen;

    return (
      <g key={isEnd ? 'head-end' : 'head-start'} className="transition-all duration-150">
        {/* Heavy 90-degree cutting tick */}
        <line
          x1={basePt.x}
          y1={basePt.y}
          x2={tickEndX}
          y2={tickEndY}
          stroke="#00ffff"
          strokeWidth="3.5"
          strokeLinecap="square"
        />

        {/* Heavy extension towards bubble */}
        <line
          x1={basePt.x}
          y1={basePt.y}
          x2={cx - dirAlongX * bubbleR}
          y2={cy - dirAlongY * bubbleR}
          stroke="#00ffff"
          strokeWidth="3.5"
          strokeLinecap="square"
        />

        {/* Direction Arrow (Filled Polygon) */}
        <polygon
          points={`${tipX},${tipY} ${corner1X},${corner1Y} ${corner2X},${corner2Y}`}
          fill="#facc15"
          stroke="#eab308"
          strokeWidth="1.5"
        />

        {/* Outer Circle Bubble */}
        <circle
          cx={cx}
          cy={cy}
          r={bubbleR}
          fill="#0f172a"
          stroke="#facc15"
          strokeWidth="2.5"
          className="shadow-lg"
        />

        {/* Horizontal Divider Line */}
        <line
          x1={cx - bubbleR}
          y1={cy}
          x2={cx + bubbleR}
          y2={cy}
          stroke="#facc15"
          strokeWidth="1.5"
        />

        {/* Top Text: Section Tag (A, B, 1, etc.) */}
        <text
          x={cx}
          y={cy - 5 * scaleFactor}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontSize={tagFontSize}
          fontWeight="bold"
          fontFamily="monospace, sans-serif"
        >
          {sectionTag || 'A'}
        </text>

        {/* Bottom Text: Sheet Reference (A-101) */}
        <text
          x={cx}
          y={cy + 13 * scaleFactor}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#94a3b8"
          fontSize={shtFontSize}
          fontWeight="bold"
          fontFamily="monospace, sans-serif"
        >
          {sheetNo || '-'}
        </text>
      </g>
    );
  };

  // Convert line length to real-world architectural dimensions for display
  const realLengthMeters = (lineLength * 0.05).toFixed(2);
  const realLengthFeet = (parseFloat(realLengthMeters) * 3.28084).toFixed(1);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Top Header / Mode Banner */}
      <div className="p-4 bg-gradient-to-r from-red-600 via-rose-700 to-amber-700 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <span className="text-xl">✂️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-wide">
                AutoCAD Dynamic Section Marker (EVL-SecMark)
              </h3>
              <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-amber-200">
                LISP Tool
              </span>
            </div>
            <p className="text-xs text-rose-100">
              টেক্সট এডিট ও যে কোনো দৈর্ঘ্যে বড় করার লাইভ সিমুলেটর (Editable Text & Stretch to ANY Length)
            </p>
          </div>
        </div>

        <button
          onClick={() => triggerPluginDownload(secMarkPlugin)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-red-700 hover:bg-rose-50 font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download EVL-SecMark.lsp</span>
        </button>
      </div>

      {/* Interactive Controls Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* 1. Section Tag & Sheet Reference Input (Text Change) */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>১. সেকশন টেক্সট (Editable Tag)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">Section ID:</span>
              <input
                type="text"
                value={sectionTag}
                maxLength={6}
                onChange={(e) => setSectionTag(e.target.value.toUpperCase())}
                placeholder="A"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">Sheet Ref:</span>
              <input
                type="text"
                value={sheetNo}
                maxLength={8}
                onChange={(e) => setSheetNo(e.target.value.toUpperCase())}
                placeholder="A-101"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Length Slider (Je kono length a boro kora jabe) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>২. সেকশন দৈর্ঘ্য (Stretch / Length)</span>
            </label>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
              {realLengthMeters}m ({realLengthFeet}&apos;)
            </span>
          </div>
          <input
            type="range"
            min={180}
            max={650}
            step={10}
            value={lineLength}
            onChange={(e) => setLineLength(Number(e.target.value))}
            className="w-full accent-rose-600 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>ছোট রুম (Short)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              💡 ড্রয়িংয়ে গ্রিপ টেনেও বাড়ানো যায়
            </span>
            <span>পুরো বিল্ডিং (Long)</span>
          </div>
        </div>

        {/* 3. Viewing Direction & Angle */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>৩. দেখার দিক ও কোণ (View & Angle)</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewDirection((prev) => (prev === 'left' ? 'right' : 'left'))}
              className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-rose-500" />
              <span>{viewDirection === 'left' ? 'Left / Up' : 'Right / Down'}</span>
            </button>
            <button
              type="button"
              onClick={() => setAngleDeg((prev) => (prev === 0 ? 90 : prev === 90 ? 45 : 0))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Rotate Section Angle"
            >
              {angleDeg}°
            </button>
          </div>
        </div>

        {/* 4. Marker Style & Scale */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>৪. মার্কার মোড ও প্ল্যান প্রিভিউ</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={markerEnds}
              onChange={(e) => setMarkerEnds(e.target.value as any)}
              className="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium outline-none cursor-pointer"
            >
              <option value="both">Both Ends (দ্বিমুখী)</option>
              <option value="start">Start Only (একমুখী)</option>
              <option value="end">End Only</option>
            </select>
            <button
              type="button"
              onClick={() => setShowFloorPlan((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                showFloorPlan
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
              }`}
              title="Toggle Architectural Plan Overlay"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive CAD Canvas Viewport */}
      <div className="relative bg-[#0b1120] border-b border-slate-200 dark:border-slate-800 select-none overflow-hidden">
        {/* CAD Grid Background Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Viewport Floating Info */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-black/60 backdrop-blur border border-cyan-500/40 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AutoCAD Model Space (2D Wireframe)
          </span>
          <span className="px-2 py-1 rounded bg-black/60 backdrop-blur border border-yellow-500/40 text-[11px] font-mono text-yellow-300">
            Layer: EVL_SECTION_MARKER
          </span>
        </div>

        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-emerald-950/80 backdrop-blur border border-emerald-500/40 text-[11px] font-mono text-emerald-300 flex items-center gap-1">
            <Maximize2 className="w-3 h-3" />
            Interactive Stretch Grip Active
          </span>
        </div>

        {/* Main Interactive SVG */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="w-full h-[320px] sm:h-[360px] cursor-crosshair"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
            {/* Dashed line pattern */}
            <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Underlay Architectural Plan Drawing */}
          {showFloorPlan && (
            <g opacity="0.35" className="pointer-events-none transition-opacity duration-300">
              {/* Outer Building Boundary Walls */}
              <rect x="70" y="50" width="580" height="240" fill="none" stroke="#64748b" strokeWidth="2.5" />
              {/* Internal partition walls */}
              <line x1="260" y1="50" x2="260" y2="290" stroke="#64748b" strokeWidth="2" />
              <line x1="460" y1="50" x2="460" y2="290" stroke="#64748b" strokeWidth="2" />
              <line x1="70" y1="170" x2="260" y2="170" stroke="#64748b" strokeWidth="1.5" />
              <line x1="460" y1="170" x2="650" y2="170" stroke="#64748b" strokeWidth="1.5" />

              {/* Doors arcs */}
              <path d="M 260 110 A 30 30 0 0 1 290 80" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="260" y1="80" x2="260" y2="110" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M 460 110 A 30 30 0 0 0 430 80" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="460" y1="80" x2="460" y2="110" stroke="#94a3b8" strokeWidth="1.5" />

              {/* Room labels */}
              <text x="165" y="115" textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="monospace">BEDROOM 01</text>
              <text x="165" y="235" textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="monospace">KITCHEN</text>
              <text x="360" y="170" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="bold" fontFamily="monospace">LIVING &amp; DINING</text>
              <text x="555" y="115" textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="monospace">MASTER BED</text>
              <text x="555" y="235" textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="monospace">BALCONY</text>
            </g>
          )}

          {/* MAIN SECTION CUTTING LINE (Between P1 and P2) */}
          <g>
            {/* Center portion line */}
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray={lineStyle === 'phantom' ? '28 6 6 6 6 6' : lineStyle === 'dashed' ? '12 8' : 'none'}
              strokeLinecap="round"
            />

            {/* Heavy cutting ends */}
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p1.x + cosA * heavyTailLen}
              y2={p1.y + sinA * heavyTailLen}
              stroke="#06b6d4"
              strokeWidth="4"
              strokeLinecap="square"
            />
            <line
              x1={p2.x}
              y1={p2.y}
              x2={p2.x - cosA * heavyTailLen}
              y2={p2.y - sinA * heavyTailLen}
              stroke="#06b6d4"
              strokeWidth="4"
              strokeLinecap="square"
            />
          </g>

          {/* Render Section Heads / Bubbles according to choice */}
          {(markerEnds === 'both' || markerEnds === 'start') &&
            renderSectionHead(p1, -cosA, -sinA, false)}

          {(markerEnds === 'both' || markerEnds === 'end') &&
            renderSectionHead(p2, cosA, sinA, true)}

          {/* Interactive Stretch Handle / Grip at End (P2) */}
          <g
            className="cursor-ew-resize group"
            onPointerDown={handlePointerDown}
            transform={`translate(${p2.x}, ${p2.y})`}
          >
            {/* Pulsing Target Ring */}
            <circle
              r="18"
              fill="rgba(16, 185, 129, 0.2)"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className={isDraggingEnd ? 'scale-125' : 'animate-ping opacity-60'}
            />
            {/* Solid Square Grip (Standard AutoCAD Grip) */}
            <rect
              x="-6"
              y="-6"
              width="12"
              height="12"
              fill={isDraggingEnd ? '#ef4444' : '#10b981'}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="drop-shadow-md transition-transform group-hover:scale-125"
            />
            {/* Label */}
            <text
              x="0"
              y="22"
              textAnchor="middle"
              fill="#34d399"
              fontSize="9"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              DRAG GRIP
            </text>
          </g>

          {/* Start Grip Handle (P1) */}
          <rect
            x={p1.x - 5}
            y={p1.y - 5}
            width="10"
            height="10"
            fill="#0284c7"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.8"
          />
        </svg>

        {/* Bottom Status Bar in Viewport */}
        <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold">
              Command: EVL-SECT
            </span>
            <span className="text-slate-400">
              Length: <strong className="text-white">{realLengthMeters}m</strong> ({lineLength} CAD units)
            </span>
            <span className="text-slate-400">
              Angle: <strong className="text-white">{angleDeg}°</strong>
            </span>
            <span className="text-slate-400">
              Tag: <strong className="text-cyan-400">{sectionTag}</strong> / <strong className="text-yellow-400">{sheetNo}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-medium text-[11px]">
              ✓ Ready to Insert into AutoCAD / Civil 3D
            </span>
          </div>
        </div>
      </div>

      {/* Features & AutoCAD Command Cheat-Sheet */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-4">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <FileCode className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>AutoCAD-এ এই প্লাগিনের ব্যবহার ও শর্টকাট কমান্ড (Commands & Usage)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                EVL-SECT (or SECT)
              </span>
              <span className="text-[10px] text-slate-400">Draw Marker</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] pt-1">
              যেকোনো দুই পয়েন্টে ক্লিক করে যেকোনো দৈর্ঘ্যে সেকশন লাইন ও বাবল আঁকুন।
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                EVL-SECEDIT
              </span>
              <span className="text-[10px] text-slate-400">Edit Text</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] pt-1">
              সেকশন ট্যাগ (A, B, C) বা শিট নম্বর তাৎক্ষণিক পরিবর্তন বা এডিট করতে ক্লিক করুন।
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                EVL-SECEXT
              </span>
              <span className="text-[10px] text-slate-400">Extend Length</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] pt-1">
              সেকশন লাইনটি যে কোনো দূরত্বের নতুন পয়েন্টে বাড়িয়ে বড় করুন (বা STRETCH কমান্ড দিন)।
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-900">
                EVL-SECFLIP
              </span>
              <span className="text-[10px] text-slate-400">Flip Arrow</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] pt-1">
              এক ক্লিকে দেখার দিকের ভিউয়িং অ্যারো (Viewing Arrow) ১৮০ ডিগ্রিতে উল্টে দিন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
