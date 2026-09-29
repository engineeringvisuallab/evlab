import React, { useState, useRef, useEffect } from 'react';
import {
  TreePine,
  Maximize2,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
  Layers,
  Palette,
  Eye,
  Sliders,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { Language } from '../types';

interface Point {
  x: number;
  y: number;
}

interface LandscapeItem {
  id: string;
  nameEn: string;
  nameBn: string;
  category: 'surface' | 'hardscape' | 'water' | 'planting';
  icon: string;
  defaultThickness: number; // mm
  defaultBorder: string;
  color: string;
  strokeColor: string;
  texturePattern: string;
}

const LANDSCAPE_ELEMENTS: LandscapeItem[] = [
  {
    id: 'lawn',
    nameEn: 'Lawn / Grass Turf',
    nameBn: 'ঘাসের লন / বাগান',
    category: 'surface',
    icon: '🌱',
    defaultThickness: 50,
    defaultBorder: 'Flush Brick Edge (75mm)',
    color: '#22c55e',
    strokeColor: '#15803d',
    texturePattern: 'grass',
  },
  {
    id: 'flowerbed',
    nameEn: 'Flower Bed / Planter',
    nameBn: 'ফুলের বেড / প্ল্যান্টার বক্স',
    category: 'surface',
    icon: '🌺',
    defaultThickness: 450,
    defaultBorder: 'Masonry Retaining Wall (125mm)',
    color: '#ec4899',
    strokeColor: '#be185d',
    texturePattern: 'soil',
  },
  {
    id: 'walkway',
    nameEn: 'Walkway / Paver Path',
    nameBn: 'ওয়াকওয়ে / পেভার ফুটপাথ',
    category: 'hardscape',
    icon: '🚶',
    defaultThickness: 100,
    defaultBorder: 'Concrete Kerbstone (150x100mm)',
    color: '#e2e8f0',
    strokeColor: '#64748b',
    texturePattern: 'paver',
  },
  {
    id: 'waterbody',
    nameEn: 'Water Body / Pool',
    nameBn: 'ওয়াটার বডি / সুইমিং পুল',
    category: 'water',
    icon: '💧',
    defaultThickness: 1200,
    defaultBorder: 'Granite Coping Deck (300mm)',
    color: '#06b6d4',
    strokeColor: '#0e7490',
    texturePattern: 'water',
  },
  {
    id: 'gravel',
    nameEn: 'Gravel / Rock Garden',
    nameBn: 'পাথর / নুড়ি গার্ডেন জোন',
    category: 'surface',
    icon: '🪨',
    defaultThickness: 80,
    defaultBorder: 'Steel Edge Strip (50mm)',
    color: '#cbd5e1',
    strokeColor: '#475569',
    texturePattern: 'gravel',
  },
  {
    id: 'driveway',
    nameEn: 'Driveway / Parking Area',
    nameBn: 'ড্রাইভওয়ে / কার পার্কিং',
    category: 'hardscape',
    icon: '🚗',
    defaultThickness: 150,
    defaultBorder: 'Heavy Duty Kerb (250mm)',
    color: '#94a3b8',
    strokeColor: '#334155',
    texturePattern: 'asphalt',
  },
];

interface ScatterObject {
  id: number;
  x: number;
  y: number;
  type: 'tree' | 'palm' | 'shrub' | 'bench' | 'light';
  scale: number;
  rotation: number;
}

export const LandscapeDesignerVisualizer: React.FC<{ lang?: Language }> = ({ lang = 'en' }) => {
  // Selected Element Archetype
  const [selectedElement, setSelectedElement] = useState<LandscapeItem>(LANDSCAPE_ELEMENTS[0]);

  // Drawing state
  const [points, setPoints] = useState<Point[]>([
    { x: 120, y: 80 },
    { x: 420, y: 70 },
    { x: 520, y: 220 },
    { x: 320, y: 280 },
    { x: 100, y: 220 },
  ]);
  const [isClosed, setIsClosed] = useState<boolean>(true);
  const [hoverPos, setHoverPos] = useState<Point | null>(null);
  const [isNearStart, setIsNearStart] = useState<boolean>(false);

  // Parametric controls
  const [thickness, setThickness] = useState<number>(selectedElement.defaultThickness);
  const [borderType, setBorderType] = useState<string>(selectedElement.defaultBorder);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'2d_plan' | '3d_isometric'>('3d_isometric');

  // Scatter System state
  const [scatterEnabled, setScatterEnabled] = useState<boolean>(true);
  const [scatterDensity, setScatterDensity] = useState<number>(14);
  const [scatterCategory, setScatterCategory] = useState<'mixed' | 'trees' | 'palms' | 'lights'>('mixed');
  const [scatterDistribution, setScatterDistribution] = useState<'random' | 'boundary' | 'grid'>('random');

  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasW = 680;
  const canvasH = 340;

  // Auto-update default thickness when element changes
  useEffect(() => {
    setThickness(selectedElement.defaultThickness);
    setBorderType(selectedElement.defaultBorder);
  }, [selectedElement]);

  // Polygon Area calculation (Shoelace algorithm)
  const calculateArea = (pts: Point[]): number => {
    if (pts.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      area += pts[i].x * pts[j].y;
      area -= pts[j].x * pts[i].y;
    }
    return Math.abs(area / 2);
  };

  // Convert canvas pixel area to realistic real-world square meters (1 px = 0.05m = 50mm)
  const realAreaSqm = (calculateArea(points) * 0.0025).toFixed(1);
  const realAreaSft = (parseFloat(realAreaSqm) * 10.7639).toFixed(0);

  // Check proximity to start point for auto-closing
  const checkNearStart = (p: Point) => {
    if (points.length < 3) return false;
    const start = points[0];
    const dx = p.x - start.x;
    const dy = p.y - start.y;
    return Math.sqrt(dx * dx + dy * dy) < 25;
  };

  // Canvas Click Handler
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvasW);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvasH);

    if (isClosed) {
      // Start fresh drawing
      setPoints([{ x, y }]);
      setIsClosed(false);
      return;
    }

    // If clicking close to starting point, close the boundary
    if (checkNearStart({ x, y })) {
      setIsClosed(true);
      setIsNearStart(false);
      return;
    }

    setPoints((prev) => [...prev, { x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isClosed || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvasW);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvasH);
    setHoverPos({ x, y });
    setIsNearStart(checkNearStart({ x, y }));
  };

  // Reset to default sample shape
  const resetToPreset = () => {
    setPoints([
      { x: 120, y: 80 },
      { x: 440, y: 70 },
      { x: 540, y: 220 },
      { x: 330, y: 280 },
      { x: 100, y: 220 },
    ]);
    setIsClosed(true);
  };

  // Pseudo-random deterministic scatter inside polygon bounds
  const generatedScatter = React.useMemo<ScatterObject[]>(() => {
    if (!isClosed || !scatterEnabled || points.length < 3) return [];

    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    // Simple Point-in-polygon test
    const isInside = (pt: Point) => {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x,
          yi = points[i].y;
        const xj = points[j].x,
          yj = points[j].y;
        const intersect = yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    const items: ScatterObject[] = [];
    const count = scatterDensity;

    // Seeded distribution
    let seed = 42;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    if (scatterDistribution === 'boundary') {
      // Place items strictly along boundary
      for (let i = 0; i < points.length; i++) {
        const pA = points[i];
        const pB = points[(i + 1) % points.length];
        const steps = 3;
        for (let s = 0; s < steps; s++) {
          const t = (s + 0.5) / steps;
          const px = pA.x + (pB.x - pA.x) * t;
          const py = pA.y + (pB.y - pA.y) * t;
          items.push({
            id: items.length,
            x: px,
            y: py,
            type: scatterCategory === 'palms' ? 'palm' : scatterCategory === 'lights' ? 'light' : 'shrub',
            scale: 0.8 + rnd() * 0.4,
            rotation: Math.round(rnd() * 360),
          });
        }
      }
    } else {
      // Random Poisson-disc style inside polygon
      let attempts = 0;
      while (items.length < count && attempts < 150) {
        attempts++;
        const rx = minX + 20 + rnd() * (maxX - minX - 40);
        const ry = minY + 20 + rnd() * (maxY - minY - 40);
        if (isInside({ x: rx, y: ry })) {
          // Check min distance to other items
          const tooClose = items.some((it) => {
            const d = Math.hypot(it.x - rx, it.y - ry);
            return d < 38;
          });
          if (!tooClose) {
            let type: ScatterObject['type'] = 'tree';
            if (scatterCategory === 'palms') type = 'palm';
            else if (scatterCategory === 'lights') type = 'light';
            else if (scatterCategory === 'trees') type = 'tree';
            else {
              const r = rnd();
              if (r < 0.35) type = 'tree';
              else if (r < 0.6) type = 'palm';
              else if (r < 0.85) type = 'shrub';
              else type = 'bench';
            }

            items.push({
              id: items.length,
              x: rx,
              y: ry,
              type,
              scale: 0.85 + rnd() * 0.4,
              rotation: Math.round(rnd() * 360),
            });
          }
        }
      }
    }

    return items;
  }, [points, isClosed, scatterEnabled, scatterDensity, scatterCategory, scatterDistribution]);

  // Points string for SVG polygon
  const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Extrusion 3D isometric offset
  const isoZ = viewMode === '3d_isometric' ? Math.min(Math.max(thickness / 30, 8), 36) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-green-800 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-2xl">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-wide">
                EVLab Landscape: Draw-to-Create 3D Engine
              </h3>
              <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-emerald-200">
                SketchUp Extension
              </span>
            </div>
            <p className="text-xs text-emerald-100">
              মাউস দিয়ে পেরিমিটার বাউন্ডারি আঁকুন ➔ ক্লোজ করলেই অটোমেটিক ৩ডি ল্যান্ডস্কেপ ও গাছপালা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToPreset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur border border-white/20 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'রিসেট শেপ' : 'Reset Shape'}</span>
          </button>
        </div>
      </div>

      {/* Step 1: Element Palette Selection */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>১. ল্যান্ডস্কেপ এলিমেন্ট নির্বাচন করুন (Select Element Type)</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Active: <strong className="text-emerald-600 dark:text-emerald-400">{selectedElement.nameEn}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {LANDSCAPE_ELEMENTS.map((el) => {
            const isSelected = selectedElement.id === el.id;
            return (
              <button
                key={el.id}
                onClick={() => setSelectedElement(el)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-xl">{el.icon}</span>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold truncate text-slate-900 dark:text-white">
                    {lang === 'bn' ? el.nameBn : el.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {el.defaultBorder.split(' ')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main CAD / Viewport Canvas */}
      <div className="relative bg-[#09111e] border-b border-slate-200 dark:border-slate-800 select-none overflow-hidden">
        {/* Architectural Grid Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Viewport Floating Controls & HUD */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur border border-emerald-500/40 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {isClosed ? 'Status: 3D Geometry Generated' : 'Status: Drawing Boundary (Click Points)'}
          </span>
          <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
            Area: {realAreaSqm} m² ({realAreaSft} sq.ft)
          </span>
        </div>

        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <button
            onClick={() => setViewMode((prev) => (prev === '3d_isometric' ? '2d_plan' : '3d_isometric'))}
            className="px-2.5 py-1 rounded bg-black/70 backdrop-blur border border-slate-700 text-[11px] font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>{viewMode === '3d_isometric' ? '3D Isometric' : '2D Plan View'}</span>
          </button>
          <button
            onClick={() => setShowWireframe((prev) => !prev)}
            className={`px-2 py-1 rounded text-[11px] border transition cursor-pointer ${
              showWireframe
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-black/70 border-slate-700 text-slate-400'
            }`}
          >
            Wireframe
          </button>
        </div>

        {/* SVG Drawing Canvas */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${canvasW} ${canvasH}`}
          className="w-full h-[320px] sm:h-[380px] cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
        >
          <defs>
            {/* Realistic textures patterns */}
            <linearGradient id="grassGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="paverGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="soilGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#854d0e" />
              <stop offset="100%" stopColor="#583101" />
            </linearGradient>

            {/* Tree Top-view Symbol */}
            <g id="treeSymbol">
              <circle r="18" fill="#15803d" opacity="0.3" />
              <circle r="14" fill="#22c55e" stroke="#166534" strokeWidth="1.5" />
              <circle r="9" fill="#4ade80" />
              <circle r="2" fill="#78350f" />
            </g>

            {/* Palm Top-view Symbol */}
            <g id="palmSymbol">
              <circle r="16" fill="#10b981" opacity="0.25" />
              <line x1="0" y1="0" x2="0" y2="-16" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="0" x2="14" y2="-10" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="0" x2="14" y2="10" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="0" x2="0" y2="16" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="0" x2="-14" y2="10" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="0" x2="-14" y2="-10" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
              <circle r="3" fill="#a16207" />
            </g>

            {/* Garden Light Symbol */}
            <g id="lightSymbol">
              <circle r="10" fill="#fef08a" opacity="0.3" />
              <circle r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
              <circle r="2" fill="#ffffff" />
            </g>

            {/* Garden Bench Symbol */}
            <g id="benchSymbol">
              <rect x="-8" y="-3" width="16" height="6" rx="1.5" fill="#b45309" stroke="#78350f" strokeWidth="1" />
            </g>
          </defs>

          {/* Underlay Surrounding Site Context (Grass background ground) */}
          <rect x="0" y="0" width={canvasW} height={canvasH} fill="#0d1829" opacity="0.6" />

          {/* 3D Extrusion Side Skirt (Visible in 3D Mode when Closed) */}
          {isClosed && isoZ > 0 && points.length > 2 && (
            <g opacity="0.85">
              {points.map((p, i) => {
                const nextP = points[(i + 1) % points.length];
                return (
                  <polygon
                    key={`wall-${i}`}
                    points={`${p.x},${p.y} ${nextP.x},${nextP.y} ${nextP.x},${nextP.y + isoZ} ${p.x},${p.y + isoZ}`}
                    fill={selectedElement.strokeColor}
                    stroke="#0f172a"
                    strokeWidth="1"
                    opacity="0.75"
                  />
                );
              })}
            </g>
          )}

          {/* Main Top Face / Surface of Landscape Element */}
          {points.length > 2 && (
            <polygon
              points={pointsStr}
              fill={
                showWireframe
                  ? 'none'
                  : selectedElement.id === 'lawn'
                  ? 'url(#grassGrad)'
                  : selectedElement.id === 'waterbody'
                  ? 'url(#waterGrad)'
                  : selectedElement.id === 'walkway'
                  ? 'url(#paverGrad)'
                  : selectedElement.id === 'flowerbed'
                  ? 'url(#soilGrad)'
                  : selectedElement.color
              }
              stroke={selectedElement.strokeColor}
              strokeWidth={isClosed ? '3' : '2'}
              strokeDasharray={isClosed ? 'none' : '6 4'}
              opacity={showWireframe ? 0.4 : 0.9}
              className="transition-colors duration-200"
            />
          )}

          {/* Perimeter Kerbstone / Border Line */}
          {isClosed && points.length > 2 && (
            <polygon
              points={pointsStr}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.6"
            />
          )}

          {/* In-progress Rubber-band Line to Cursor */}
          {!isClosed && points.length > 0 && hoverPos && (
            <line
              x1={points[points.length - 1].x}
              y1={points[points.length - 1].y}
              x2={hoverPos.x}
              y2={hoverPos.y}
              stroke={isNearStart ? '#22c55e' : '#38bdf8'}
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
          )}

          {/* Smart Scatter Objects on Top of Face */}
          {isClosed &&
            generatedScatter.map((item) => {
              return (
                <g
                  key={`scatter-${item.id}`}
                  transform={`translate(${item.x}, ${item.y}) rotate(${item.rotation}) scale(${item.scale})`}
                  className="transition-transform duration-300 pointer-events-none"
                >
                  {item.type === 'palm' && <use href="#palmSymbol" />}
                  {item.type === 'tree' && <use href="#treeSymbol" />}
                  {item.type === 'light' && <use href="#lightSymbol" />}
                  {item.type === 'bench' && <use href="#benchSymbol" />}
                  {item.type === 'shrub' && (
                    <circle r="7" fill="#4ade80" stroke="#15803d" strokeWidth="1.5" />
                  )}
                </g>
              );
            })}

          {/* Vertices / Grips */}
          {points.map((p, idx) => {
            const isStart = idx === 0;
            return (
              <g key={`vertex-${idx}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isStart && !isClosed && isNearStart ? '9' : '5'}
                  fill={isStart ? '#22c55e' : '#38bdf8'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className={isStart && !isClosed ? 'animate-pulse' : ''}
                />
                {isStart && !isClosed && (
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    fill="#4ade80"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {isNearStart ? 'CLICK TO CLOSE' : 'START POINT'}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Viewport Bottom Command Bar */}
        <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold">Tool: EVL-DrawLandscape</span>
            <span className="text-slate-400">
              Element: <strong className="text-white">{selectedElement.nameEn}</strong>
            </span>
            <span className="text-slate-400">
              Boundary: <strong className="text-cyan-300">{points.length} Points</strong>
            </span>
            <span className="text-slate-400">
              Scatter: <strong className="text-yellow-400">{generatedScatter.length} Items</strong>
            </span>
          </div>

          <div className="text-[11px] text-emerald-400 font-semibold">
            {isClosed
              ? '✓ 3D Mesh Ready for SketchUp Export'
              : '⚡ ক্লিক করে লাইন আঁকুন, প্রথম পয়েন্টে স্ন্যাপ করে ক্লোজ করুন'}
          </div>
        </div>
      </div>

      {/* Step 2: Parametric Inspector & Smart Scatter Controls */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Parametric Element Properties */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>২. প্যারামেট্রিক প্রোপার্টিজ (Parametric Smart Controls)</span>
          </h4>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            {/* Thickness / Depth Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedElement.id === 'waterbody' ? 'Water Depth (গভীরতা):' : 'Thickness / Height (পুরুত্ব):'}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {thickness} mm ({((thickness / 1000) * 3.28084).toFixed(2)} ft)
                </span>
              </div>
              <input
                type="range"
                min={25}
                max={selectedElement.id === 'waterbody' ? 2500 : 800}
                step={25}
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Border / Kerbstone Selector */}
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Edge / Kerbstone Border (সীমানা কার্ব):
              </span>
              <select
                value={borderType}
                onChange={(e) => setBorderType(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="Flush Brick Edge (75mm)">Flush Brick Edge (75mm)</option>
                <option value="Raised Concrete Kerb (150x100mm)">Raised Concrete Kerb (150x100mm)</option>
                <option value="Granite Coping Deck (300mm)">Granite Coping Deck (300mm)</option>
                <option value="Masonry Retaining Wall (125mm)">Masonry Retaining Wall (125mm)</option>
                <option value="Timber Garden Edging (50mm)">Timber Garden Edging (50mm)</option>
                <option value="None / Seamless Edge">None / Seamless Edge</option>
              </select>
            </div>

            {/* Terrain Raycasting Mode */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Terrain-Aware Raycasting
                </span>
                <span className="text-[11px] text-slate-500">
                  SketchUp TIN মেশের ঢাল অনুসরণ করবে
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Right: Smart Scatter System */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>৩. স্মার্ট স্ক্যাটারিং (Smart Scatter System)</span>
            </h4>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={scatterEnabled}
                onChange={(e) => setScatterEnabled(e.target.checked)}
                className="accent-emerald-600 cursor-pointer rounded"
              />
              <span className="font-semibold">Enable Scatter</span>
            </label>
          </div>

          <div
            className={`p-3.5 rounded-xl border space-y-3 text-xs transition-opacity ${
              scatterEnabled
                ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                : 'bg-slate-100 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-50 pointer-events-none'
            }`}
          >
            {/* Distribution Mode */}
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Distribution Pattern:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['random', 'boundary', 'grid'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setScatterDistribution(m)}
                    className={`py-1 px-2 rounded-lg border font-semibold text-[11px] capitalize transition cursor-pointer ${
                      scatterDistribution === m
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {m === 'random' ? 'Poisson Random' : m === 'boundary' ? 'Along Edge' : 'Regular Grid'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category / Species Filter */}
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Vegetation &amp; Amenities:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['mixed', 'trees', 'palms', 'lights'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setScatterCategory(cat)}
                    className={`py-1 px-1.5 rounded-md border text-center text-[10px] font-bold capitalize transition cursor-pointer ${
                      scatterCategory === cat
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cat === 'mixed' ? '🌳+🌴 All' : cat === 'trees' ? '🌳 Trees' : cat === 'palms' ? '🌴 Palms' : '💡 Lights'}
                  </button>
                ))}
              </div>
            </div>

            {/* Density Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Item Density (ঘনত্ব):
                </span>
                <span className="font-mono font-bold text-amber-500">
                  {scatterDensity} objects
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={30}
                value={scatterDensity}
                onChange={(e) => setScatterDensity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
