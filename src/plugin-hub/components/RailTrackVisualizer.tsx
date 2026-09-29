import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Check,
  Sparkles,
  Layers,
  Sliders,
  Box,
  Compass,
  MousePointer,
  Spline,
  Undo2,
  Trash2,
  Image as ImageIcon,
  Maximize2,
  X,
  Download,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TEXT } from '../data/translations';
import { RAIL_TRACK_PREVIEW_IMAGES } from '../data/previewImages';
import { PLUGINS_DATA } from '../data/plugins';
import { triggerPluginDownload } from '../utils/fileDownloader';

export interface GaugeOption {
  id: string;
  nameBn: string;
  nameEn: string;
  gaugeMm: number;
  gaugeFtIn: string;
  railsCount: number;
  descBn: string;
  descEn: string;
  typicalUsageBn: string;
  typicalUsageEn: string;
}

export const GAUGE_OPTIONS: GaugeOption[] = [
  {
    id: 'broad-gauge',
    nameBn: 'ব্রড গেজ (Broad Gauge - BG)',
    nameEn: 'Broad Gauge (BG - 1676 mm)',
    gaugeMm: 1676,
    gaugeFtIn: "5' 6\"",
    railsCount: 2,
    descBn: 'বাংলাদেশ রেলওয়ে ও ভারতীয় রেলওয়ের প্রধান ভারী ইন্টারসিটি ও মালবাহী ট্র্যাকের স্ট্যান্ডার্ড।',
    descEn: 'Standard heavy mainline gauge for Bangladesh Railway & Indian Railways (1676 mm).',
    typicalUsageBn: 'পদ্মা সেতু রেল লিংক, ঢাকা-ঈশ্বরদী-রাজশাহী-খুলনা মেইন লাইন',
    typicalUsageEn: 'Padma Bridge Rail Link, Main intercity corridors',
  },
  {
    id: 'dual-gauge',
    nameBn: 'ডুয়েল গেজ (Dual Gauge - BG + MG)',
    nameEn: 'Dual Gauge (DG - 3-Rail System)',
    gaugeMm: 1676,
    gaugeFtIn: "5' 6\" + 3' 3⅜\"",
    railsCount: 3,
    descBn: 'একই ট্র্যাকে ব্রডগেজ ও মিটারগেজ ট্রেন চলার জন্য ৩-রেল বিশিষ্ট বিশেষ ব্যবস্থা (যমুনা বঙ্গবন্ধু সেতু)।',
    descEn: 'Common sleeper with 3 running rails allowing both Broad Gauge & Meter Gauge trains to run on a single corridor.',
    typicalUsageBn: 'বঙ্গবন্ধু যমুনা সেতু, টঙ্গী-জয়দেবপুর-ঈশ্বরদী সেকশন',
    typicalUsageEn: 'Jamuna Bangabandhu Rail Bridge & shared mixed corridors',
  },
  {
    id: 'standard-gauge',
    nameBn: 'স্ট্যান্ডার্ড গেজ (Standard Gauge - SG)',
    nameEn: 'Standard Gauge (SG - 1435 mm)',
    gaugeMm: 1435,
    gaugeFtIn: "4' 8.5\"",
    railsCount: 2,
    descBn: 'বিশ্বজুড়ে হাই-স্পিড রেল ও আধুনিক মেট্রো ট্রেনের বিশ্বজনীন গেজ (ঢাকা মেট্রোরেল এমআরটি-৬)।',
    descEn: 'International standard railway gauge for High-Speed Rail and modern Urban Mass Rapid Transit (MRT).',
    typicalUsageBn: 'ঢাকা মেট্রো রেল (MRT Line-6, উত্তরা-মতিঝিল)',
    typicalUsageEn: 'Dhaka Metro Rail (MRT-6) & High-Speed passenger lines',
  },
  {
    id: 'meter-gauge',
    nameBn: 'মিটার গেজ (Meter Gauge - MG)',
    nameEn: 'Meter Gauge (MG - 1000 mm)',
    gaugeMm: 1000,
    gaugeFtIn: "3' 3⅜\"",
    railsCount: 2,
    descBn: 'ঐতিহ্যবাহী ন্যারো নেটওয়ার্ক, পাহাড়ি লাইন এবং পূর্বাঞ্চল রেলওয়ের প্রচলিত ট্র্যাক ব্যবস্থা।',
    descEn: 'Classic 1000 mm gauge widely used in Bangladesh Railway Eastern Zone and regional loops.',
    typicalUsageBn: 'ঢাকা-চট্টগ্রাম মেইল লাইন, সিলেট ও কক্সবাজার ঐতিহাসিক রুট',
    typicalUsageEn: 'BR Eastern Zone & regional secondary branch lines',
  },
];

interface Point {
  x: number;
  y: number;
}

interface RailTrackVisualizerProps {
  lang: Language;
}

export const RailTrackVisualizer: React.FC<RailTrackVisualizerProps> = ({ lang }) => {
  const t = UI_TEXT[lang];

  // 1. Drawing Method: 'click' (ক্লিক করে ড্র) | 'select_line' (লাইন সিলেক্ট করে ড্র)
  const [drawingMethod, setDrawingMethod] = useState<'click' | 'select_line'>('click');

  // 2. View Mode: 'both' (ইমেজ + ৩ডি ক্যানভাস) | 'image' (ইমেজ প্রিভিউ) | '3d' (৩ডি ট্র্যাক) | 'cross_section' (ক্রস সেকশন)
  const [trackViewMode, setTrackViewMode] = useState<'both' | 'image' | '3d' | 'cross_section'>('both');
  const [hoverPt, setHoverPt] = useState<Point | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const railPlugin = PLUGINS_DATA.find((p) => p.id === 'sketchup-evl-rail') || null;

  const handleDownloadRbz = async () => {
    if (!railPlugin) return;
    setIsDownloading(true);
    const ok = await triggerPluginDownload(railPlugin);
    setIsDownloading(false);
    if (ok) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    }
  };

  const [selectedGaugeId, setSelectedGaugeId] = useState<string>('broad-gauge');
  const [sleeperType, setSleeperType] = useState<'concrete' | 'timber' | 'steel'>('concrete');
  const [showBallast, setShowBallast] = useState<boolean>(true);
  const [sleeperSpacingMm, setSleeperSpacingMm] = useState<number>(600); // 600mm / 24"
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [buildPercent, setBuildPercent] = useState<number>(100);
  const [showImageLightbox, setShowImageLightbox] = useState<boolean>(false);
  const [buildSuccessNotice, setBuildSuccessNotice] = useState<string | null>(null);

  // Tactile click ripples on SVG canvas
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Click-to-draw state points for track alignment
  const [clickedPoints, setClickedPoints] = useState<Point[]>([
    { x: 60, y: 150 },
    { x: 200, y: 140 },
    { x: 360, y: 150 },
    { x: 540, y: 145 },
  ]);

  // Selected line preset
  const [selectedLinePreset, setSelectedLinePreset] = useState<
    'straight' | 's_curve' | 'turnout' | 'bridge'
  >('straight');

  const activeGauge = GAUGE_OPTIONS.find((g) => g.id === selectedGaugeId) || GAUGE_OPTIONS[0];
  const activeTrackImage =
    RAIL_TRACK_PREVIEW_IMAGES[selectedGaugeId] || RAIL_TRACK_PREVIEW_IMAGES['broad-gauge'];

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 600);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 240);
    const boundedY = Math.max(50, Math.min(210, y));
    const boundedX = Math.max(20, Math.min(580, x));
    setHoverPt({ x: boundedX, y: boundedY });
  };

  const handleCanvasMouseLeave = () => {
    setHoverPt(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 600);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 240);

    const boundedY = Math.max(50, Math.min(210, y));
    const boundedX = Math.max(20, Math.min(580, x));

    // Spawn tactile ripple
    const rId = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id: rId, x: boundedX, y: boundedY }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rId));
    }, 700);

    setClickedPoints((prev) => [...prev, { x: boundedX, y: boundedY }]);
    setBuildSuccessNotice(null);
  };

  const handleUndoPoint = () => {
    setClickedPoints((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    setBuildSuccessNotice(null);
  };

  const handleClearPoints = () => {
    setClickedPoints([]);
    setBuildSuccessNotice(null);
  };

  const loadPresetPath = (preset: 'straight' | 's_curve' | 'turnout' | 'bridge') => {
    setSelectedLinePreset(preset);
    let pts: Point[] = [];
    if (preset === 'straight') {
      pts = [
        { x: 60, y: 145 },
        { x: 220, y: 145 },
        { x: 380, y: 145 },
        { x: 540, y: 145 },
      ];
    } else if (preset === 's_curve') {
      pts = [
        { x: 60, y: 170 },
        { x: 180, y: 120 },
        { x: 320, y: 120 },
        { x: 440, y: 170 },
        { x: 540, y: 170 },
      ];
    } else if (preset === 'turnout') {
      pts = [
        { x: 60, y: 145 },
        { x: 260, y: 145 },
        { x: 420, y: 100 },
        { x: 540, y: 80 },
      ];
    } else if (preset === 'bridge') {
      pts = [
        { x: 60, y: 130 },
        { x: 200, y: 130 },
        { x: 380, y: 130 },
        { x: 540, y: 130 },
      ];
    }
    setClickedPoints(pts);
    setBuildSuccessNotice(null);

    // Live animated build sweep
    setIsBuilding(true);
    setBuildPercent(0);
    const interval = setInterval(() => {
      setBuildPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBuilding(false);
          return 100;
        }
        return prev + 35;
      });
    }, 90);
  };

  const handleSimulateTrackBuild = () => {
    // Auto-load preset if fewer than 2 points
    if (clickedPoints.length < 2) {
      loadPresetPath(selectedLinePreset);
      return;
    }

    setIsBuilding(true);
    setBuildPercent(0);
    setBuildSuccessNotice(null);

    const interval = setInterval(() => {
      setBuildPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBuilding(false);
          const gName = lang === 'bn' ? activeGauge.nameBn : activeGauge.nameEn;
          setBuildSuccessNotice(
            lang === 'bn'
              ? `✓ ৩ডি রেলওয়ে ট্র্যাক তৈরি সম্পন্ন: ${gName} | ${totalLengthMeters}m | ${sleeperType.toUpperCase()} স্লিপার`
              : `✓ 3D Railway Track Extruded: ${gName} | ${totalLengthMeters}m | ${sleeperType.toUpperCase()} Sleepers`
          );
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const totalLengthMeters = React.useMemo(() => {
    if (clickedPoints.length < 2) return '0';
    let totalPx = 0;
    for (let i = 0; i < clickedPoints.length - 1; i++) {
      const dx = clickedPoints[i + 1].x - clickedPoints[i].x;
      const dy = clickedPoints[i + 1].y - clickedPoints[i].y;
      totalPx += Math.sqrt(dx * dx + dy * dy);
    }
    return ((totalPx / 400) * 120).toFixed(0);
  }, [clickedPoints]);

  // Render SVG graphic for 3D or Cross Section
  const renderTrackGraphic = () => {
    const canvasWidth = 600;
    const canvasHeight = 240;

    if (trackViewMode === 'cross_section') {
      return (
        <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-56 sm:h-64 select-none">
          <rect width={canvasWidth} height={canvasHeight} fill="#0b1120" />
          {/* Ground level */}
          <line x1="20" y1="210" x2="580" y2="210" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <text x="30" y="222" fill="#64748b" fontSize="10" fontFamily="monospace">FORMATION SUBGRADE LEVEL</text>

          {/* Ballast Trapezoid */}
          {showBallast && (
            <g>
              <polygon
                points="110,210 160,140 440,140 490,210"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1.5"
              />
              <text x="300" y="180" fill="#64748b" fontSize="11" textAnchor="middle" fontFamily="sans-serif">
                300mm Crushed Granite Ballast Bed (1:1.5 Slope)
              </text>
            </g>
          )}

          {/* Sleeper Cross section */}
          <rect
            x="170"
            y="120"
            width="260"
            height="25"
            rx="3"
            fill={sleeperType === 'concrete' ? '#94a3b8' : sleeperType === 'timber' ? '#92400e' : '#475569'}
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          <text x="300" y="137" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle">
            {sleeperType === 'concrete' ? 'PSC Concrete Sleeper (2750mm)' : 'Hardwood Treated Timber Tie'}
          </text>

          {/* Left Rail (UIC-60) */}
          <g transform="translate(205, 55)">
            <path
              d="M 5,65 L 35,65 L 32,55 L 23,55 L 23,20 L 30,16 L 30,5 L 10,5 L 10,16 L 17,20 L 17,55 L 8,55 Z"
              fill="#cbd5e1"
              stroke="#e2e8f0"
              strokeWidth="1.2"
            />
            <circle cx="20" cy="8" r="4" fill="#38bdf8" opacity="0.6" />
            <text x="20" y="80" fill="#38bdf8" fontSize="9" textAnchor="middle" fontFamily="monospace">UIC-60</text>
          </g>

          {/* Right Rail (UIC-60) */}
          <g transform="translate(355, 55)">
            <path
              d="M 5,65 L 35,65 L 32,55 L 23,55 L 23,20 L 30,16 L 30,5 L 10,5 L 10,16 L 17,20 L 17,55 L 8,55 Z"
              fill="#cbd5e1"
              stroke="#e2e8f0"
              strokeWidth="1.2"
            />
            <circle cx="20" cy="8" r="4" fill="#38bdf8" opacity="0.6" />
            <text x="20" y="80" fill="#38bdf8" fontSize="9" textAnchor="middle" fontFamily="monospace">UIC-60</text>
          </g>

          {/* 3rd Rail if Dual Gauge */}
          {activeGauge.railsCount === 3 && (
            <g transform="translate(295, 55)">
              <path
                d="M 5,65 L 35,65 L 32,55 L 23,55 L 23,20 L 30,16 L 30,5 L 10,5 L 10,16 L 17,20 L 17,55 L 8,55 Z"
                fill="#f59e0b"
                stroke="#fde68a"
                strokeWidth="1.2"
              />
              <text x="20" y="80" fill="#f59e0b" fontSize="8" textAnchor="middle" fontFamily="monospace">MG 1000mm</text>
            </g>
          )}

          {/* Gauge Dimension Arrow */}
          <line x1="225" y1="40" x2="375" y2="40" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="225" y1="35" x2="225" y2="45" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="375" y1="35" x2="375" y2="45" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="300" y="34" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            {activeGauge.gaugeMm} mm ({activeGauge.gaugeFtIn})
          </text>
        </svg>
      );
    }

    // 3D Perspective Track along Clicked Points
    const points = clickedPoints;

    return (
      <svg
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        className="w-full h-56 sm:h-64 select-none cursor-crosshair"
      >
        <defs>
          <linearGradient id="railSteelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="trackSweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0)" />
            <stop offset="50%" stopColor="rgba(16, 185, 129, 0.85)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
          </linearGradient>

          <pattern id="trackGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.75" />
          </pattern>
        </defs>

        <rect width={canvasWidth} height={canvasHeight} fill="#090d16" />
        <rect width={canvasWidth} height={canvasHeight} fill="url(#trackGrid)" opacity="0.8" />

        {/* Center Grid Reference Axes */}
        <line x1="0" y1="120" x2={canvasWidth} y2="120" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="300" y1="0" x2="300" y2={canvasHeight} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

        {/* 1. STATE: 0 POINTS (Waiting for first click) */}
        {points.length === 0 && (
          <g>
            <g transform="translate(300, 120)">
              <rect
                x="-190"
                y="-32"
                width="380"
                height="64"
                rx="10"
                fill="#0f172a"
                stroke="#10b981"
                strokeWidth="1.5"
                opacity="0.95"
              />
              <text x="0" y="-8" fill="#34d399" fontSize="13" fontWeight="bold" textAnchor="middle">
                {lang === 'bn'
                  ? '🚂 রেল ট্র্যাক ড্র করতে যেকোনো স্থানে ক্লিক করুন'
                  : '🚂 Click anywhere on CAD grid to place Point 1'}
              </text>
              <text x="0" y="14" fill="#94a3b8" fontSize="10" textAnchor="middle">
                {lang === 'bn'
                  ? 'পয়েন্ট ১ ➜ পয়েন্ট ২ দিয়ে সোজা বা বাঁকানো রেললাইন তৈরি করুন'
                  : 'Pick Point 1 ➜ Point 2 to extrude custom railway track'}
              </text>
            </g>

            {/* Live Hover Crosshair Cursor */}
            {hoverPt && (
              <g>
                <line x1="0" y1={hoverPt.y} x2={canvasWidth} y2={hoverPt.y} stroke="#10b981" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.5" />
                <line x1={hoverPt.x} y1="0" x2={hoverPt.x} y2={canvasHeight} stroke="#10b981" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.5" />
                <circle cx={hoverPt.x} cy={hoverPt.y} r="6" fill="none" stroke="#10b981" strokeWidth="2" />
                <circle cx={hoverPt.x} cy={hoverPt.y} r="2" fill="#10b981" />
                <text x={hoverPt.x + 10} y={hoverPt.y - 10} fill="#34d399" fontSize="10" fontFamily="monospace">
                  P1 (X:{hoverPt.x}, Y:{hoverPt.y})
                </text>
              </g>
            )}
          </g>
        )}

        {/* 2. STATE: 1 POINT (Point 1 placed, drawing to Point 2) */}
        {points.length === 1 && (
          <g>
            {/* Point 1 Node */}
            <circle cx={points[0].x} cy={points[0].y} r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx={points[0].x} cy={points[0].y} r="16" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
            <text x={points[0].x} y={points[0].y - 14} fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              P1 (Survey Origin)
            </text>

            {/* Sleeper at Point 1 */}
            <rect
              x={points[0].x - 20}
              y={points[0].y - 4}
              width="40"
              height="8"
              rx="1"
              fill={sleeperType === 'concrete' ? '#94a3b8' : '#92400e'}
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Rubber band line to mouse cursor */}
            {hoverPt && (
              <g>
                <line
                  x1={points[0].x}
                  y1={points[0].y}
                  x2={hoverPt.x}
                  y2={hoverPt.y}
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
                <circle cx={hoverPt.x} cy={hoverPt.y} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x={hoverPt.x + 10} y={hoverPt.y - 10} fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  + P2 ({((Math.hypot(hoverPt.x - points[0].x, hoverPt.y - points[0].y) / 400) * 120).toFixed(0)}m)
                </text>
              </g>
            )}

            {/* Helper Banner */}
            <g transform="translate(10, 20)">
              <rect width="360" height="24" rx="4" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="1" />
              <text x="10" y="16" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                + {lang === 'bn' ? 'ক্লিক করে ২য় পয়েন্ট দিন (১ম স্প্যান তৈরি করুন)' : 'Click anywhere to place Point 2 & build track'}
              </text>
            </g>
          </g>
        )}

        {/* 3. STATE: >= 2 POINTS (Full 3D Railway Track Model Extruded) */}
        {points.length >= 2 && (
          <g>
            {/* Prompt banner */}
            <g transform="translate(10, 20)">
              <rect width="380" height="24" rx="4" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1" />
              <text x="10" y="16" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">
                + {points.length} {lang === 'bn' ? 'পয়েন্ট সংযুক্ত | ক্লিক করে আরও ট্র্যাক বাড়ান' : 'Points Connected | Click canvas to extend track'}
              </text>
            </g>

            {/* Rubber Band line to cursor */}
            {hoverPt && (
              <g>
                <line
                  x1={points[points.length - 1].x}
                  y1={points[points.length - 1].y}
                  x2={hoverPt.x}
                  y2={hoverPt.y}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <circle cx={hoverPt.x} cy={hoverPt.y} r="5" fill="#f59e0b" opacity="0.8" />
                <text x={hoverPt.x + 8} y={hoverPt.y - 8} fill="#fbbf24" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  + P{points.length + 1} ({((Math.hypot(hoverPt.x - points[points.length - 1].x, hoverPt.y - points[points.length - 1].y) / 400) * 120).toFixed(0)}m)
                </text>
              </g>
            )}

            {/* Ballast bed background */}
            {showBallast && (
              <path
                d={`M ${points[0].x - 20},${points[0].y + 25} ` +
                  points.map((p) => `L ${p.x},${p.y + 25}`).join(' ') +
                  ` L ${points[points.length - 1].x + 20},${points[points.length - 1].y + 25} ` +
                  ` L ${points[points.length - 1].x + 20},${points[points.length - 1].y - 25} ` +
                  points
                    .slice()
                    .reverse()
                    .map((p) => `L ${p.x},${p.y - 25}`)
                    .join(' ') +
                  ' Z'}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
                opacity="0.9"
              />
            )}

            {/* Sleepers along segments */}
            {points.map((pt, i) => {
              if (i === points.length - 1) return null;
              const nextPt = points[i + 1];
              const dx = nextPt.x - pt.x;
              const dy = nextPt.y - pt.y;
              const segLen = Math.sqrt(dx * dx + dy * dy);
              const count = Math.max(2, Math.floor(segLen / 20));

              return (
                <g key={`sleepers-${i}`}>
                  {Array.from({ length: count }).map((_, sIdx) => {
                    const r = (sIdx + 0.5) / count;
                    const cx = pt.x + dx * r;
                    const cy = pt.y + dy * r;
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

                    return (
                      <g key={sIdx} transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
                        <rect
                          x="-20"
                          y="-4"
                          width="40"
                          height="8"
                          rx="1"
                          fill={
                            sleeperType === 'concrete'
                              ? '#94a3b8'
                              : sleeperType === 'timber'
                              ? '#92400e'
                              : '#475569'
                          }
                          stroke="#cbd5e1"
                          strokeWidth="0.8"
                        />
                        {/* Fastener clips */}
                        <circle cx="-10" cy="0" r="1.8" fill="#f59e0b" />
                        <circle cx="10" cy="0" r="1.8" fill="#f59e0b" />
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Steel Rails: Left & Right */}
            {/* Left Rail */}
            <path
              d={
                `M ${points[0].x},${points[0].y - 8} ` +
                points.slice(1).map((p) => `L ${p.x},${p.y - 8}`).join(' ')
              }
              fill="none"
              stroke="url(#railSteelGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Right Rail */}
            <path
              d={
                `M ${points[0].x},${points[0].y + 8} ` +
                points.slice(1).map((p) => `L ${p.x},${p.y + 8}`).join(' ')
              }
              fill="none"
              stroke="url(#railSteelGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* 3rd Rail if Dual Gauge */}
            {activeGauge.railsCount === 3 && (
              <path
                d={
                  `M ${points[0].x},${points[0].y - 1} ` +
                  points.slice(1).map((p) => `L ${p.x},${p.y - 1}`).join(' ')
                }
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Extrusion laser sweep animation while drawing */}
            {isBuilding && (
              <rect
                x="0"
                y="0"
                width={canvasWidth}
                height={canvasHeight}
                fill="url(#trackSweepGrad)"
                opacity="0.25"
                className="animate-pulse"
              />
            )}

            {/* Vertex Points for Click-draw */}
            {points.map((p, i) => (
              <g key={`pt-${i}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill={i === points.length - 1 ? '#10b981' : '#0284c7'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={p.x}
                  y={p.y - 14}
                  fill="#38bdf8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  P{i + 1}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Tactile Click Ripple Rings */}
        {ripples.map((r) => (
          <g key={r.id}>
            <circle
              cx={r.x}
              cy={r.y}
              r="22"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              opacity="0.85"
            />
            <circle cx={r.x} cy={r.y} r="6" fill="#10b981" />
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Lightbox Modal for Full Realistic Image Preview */}
      {showImageLightbox && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚂</span>
                <span className="text-sm font-bold text-white">
                  {lang === 'bn' ? activeGauge.nameBn : activeGauge.nameEn}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-950 border border-sky-600 text-sky-300">
                  {activeGauge.gaugeFtIn} ({activeGauge.gaugeMm} mm)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowImageLightbox(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video max-h-[70vh] bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={activeTrackImage}
                alt={activeGauge.nameEn}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-300">
                <strong className="text-sky-400">{lang === 'bn' ? 'ব্যবহার:' : 'Usage:'}</strong>{' '}
                {lang === 'bn' ? activeGauge.typicalUsageBn : activeGauge.typicalUsageEn}
              </span>
              <span className="text-emerald-400 font-mono">
                ✓ Trimble SketchUp EVL-Rail Extension Compatible
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚂</span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {lang === 'bn' ? 'EVL-Rail: ৩ডি রেলওয়ে ট্র্যাক ও স্লিপার জেনারেটর' : 'EVL-Rail: 3D Railway Track Generator'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-400 font-mono">
            {activeGauge.gaugeFtIn}
          </span>
        </div>

        {/* View Switcher: Both (Dual Split) | 3D Track CAD | Realistic Image | Cross Section */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setTrackViewMode('both')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                trackViewMode === 'both'
                  ? 'bg-sky-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.viewBoth}</span>
            </button>
            <button
              type="button"
              onClick={() => setTrackViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                trackViewMode === '3d'
                  ? 'bg-sky-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.viewCad3D}</span>
            </button>
            <button
              type="button"
              onClick={() => setTrackViewMode('image')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                trackViewMode === 'image'
                  ? 'bg-sky-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{t.viewRealisticImage}</span>
            </button>
            <button
              type="button"
              onClick={() => setTrackViewMode('cross_section')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                trackViewMode === 'cross_section'
                  ? 'bg-sky-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Spline className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'UIC-60 ক্রস-সেকশন' : 'Cross-Section'}</span>
            </button>
          </div>

          {/* Quick RBZ Download Button */}
          {railPlugin && (
            <button
              type="button"
              onClick={handleDownloadRbz}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-semibold shadow transition-all hover:scale-102"
              title={lang === 'bn' ? 'EVL-Rail v2.1 .rbz ফাইল ডাউনলোড করুন' : 'Download EVL-Rail v2.1 .rbz'}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>{lang === 'bn' ? 'ডাউনলোড সম্পন্ন!' : 'Downloaded!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'ডাউনলোড .rbz' : 'Download .rbz'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. TWO DRAWING METHODS: Click-by-Click OR Select-Line */}
      <div className="bg-slate-950 p-3 rounded-xl border border-sky-900/40 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              {t.drawingModeLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDrawingMethod('click');
                if (trackViewMode === 'image') setTrackViewMode('3d');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                drawingMethod === 'click'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.drawModeClick}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDrawingMethod('select_line');
                if (trackViewMode === 'image') setTrackViewMode('3d');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                drawingMethod === 'select_line'
                  ? 'bg-sky-950/80 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Spline className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.drawModeSelect}</span>
            </button>
          </div>
        </div>

        {/* Sub-controls */}
        {drawingMethod === 'click' ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-mono text-[11px]">
                {clickedPoints.length} {lang === 'bn' ? 'অ্যালাইনমেন্ট পয়েন্ট' : 'Survey Points'} (~{totalLengthMeters}m)
              </span>
              <span className="text-[11px] text-slate-400">
                {lang === 'bn' ? 'ম্যাপ বা গ্রিডে ক্লিক করে ট্র্যাকের বাঁক ও সোজা পথ আঁকুন' : 'Click to layout railway curve path'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleUndoPoint}
                disabled={clickedPoints.length === 0}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 text-[11px] border border-slate-700"
                title={t.undoPoint}
              >
                <Undo2 className="w-3 h-3" />
                <span>{t.undoPoint}</span>
              </button>

              <button
                type="button"
                onClick={handleClearPoints}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-rose-300 text-[11px] border border-slate-700"
                title={t.clearPoints}
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>{t.clearPoints}</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 uppercase">{lang === 'bn' ? 'প্রিসেট:' : 'Preset:'}</span>
                <button
                  type="button"
                  onClick={() => loadPresetPath('straight')}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                >
                  {lang === 'bn' ? 'মেইনলাইন' : 'Mainline'}
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetPath('s_curve')}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                >
                  S-Curve
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetPath('turnout')}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                >
                  Turnout
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetPath('bridge')}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                >
                  Bridge
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-slate-400">{t.presetLineLabel}</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'straight', nameBn: 'সোজা মেইনলাইন ট্র্যাক (২০০মি)', nameEn: 'Straight Mainline (200m)' },
                  { id: 's_curve', nameBn: 'এস-কার্ভ ট্রানজিশন অ্যালাইনমেন্ট', nameEn: 'S-Curve Transition (R=800m)' },
                  { id: 'turnout', nameBn: 'ইয়ার্ড টার্নআউট ব্রাঞ্চ লুপ', nameEn: 'Yard Turnout Branch Loop' },
                  { id: 'bridge', nameBn: 'রেলওয়ে ব্রিজ স্প্যান ট্র্যাক', nameEn: 'Railway Bridge Deck Track' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => loadPresetPath(item.id as any)}
                    className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                      selectedLinePreset === item.id
                        ? 'bg-sky-600 border-sky-400 text-white font-semibold'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {lang === 'bn' ? item.nameBn : item.nameEn}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-emerald-400 text-[11px] font-mono">
              ✓ {lang === 'bn' ? 'স্কেচআপে রেললাইন পাথ সিলেক্ট করে ১-ক্লিক' : 'Select edge path in SketchUp'}
            </span>
          </div>
        )}
      </div>

      {/* 3. 4 RAILWAY GAUGE CARDS WITH REAL IMAGE THUMBNAILS */}
      <div className="space-y-1.5">
        <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
          <span>{lang === 'bn' ? 'রেলওয়ে গেজ নির্বাচন করুন (ইমেজ প্রিভিউসহ):' : 'Select Track Gauge (with Image Preview):'}</span>
          <span className="text-emerald-400 font-mono text-[10px]">EVL-Rail v2.4</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {GAUGE_OPTIONS.map((g) => {
            const isSelected = selectedGaugeId === g.id;
            const imgThumb = RAIL_TRACK_PREVIEW_IMAGES[g.id] || RAIL_TRACK_PREVIEW_IMAGES['broad-gauge'];
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGaugeId(g.id)}
                className={`group relative p-2 rounded-xl border text-left transition-all flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'bg-sky-950/80 border-sky-400 ring-2 ring-sky-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="relative w-full h-20 rounded-lg overflow-hidden mb-2 bg-slate-900">
                  <img
                    src={imgThumb}
                    alt={g.nameEn}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono font-bold text-sky-400">
                    {g.gaugeFtIn}
                  </span>
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold shadow">
                      ✓
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold leading-tight">
                  {lang === 'bn' ? g.nameBn : g.nameEn}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {lang === 'bn' ? g.typicalUsageBn : g.typicalUsageEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN PREVIEW VIEWPORT */}
      <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-3 overflow-hidden shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-900/60 border border-sky-600/50 text-sky-300 font-mono text-[11px]">
              {activeGauge.gaugeMm} mm ({activeGauge.gaugeFtIn})
            </span>
            <span className="text-slate-400 text-[11px]">
              {lang === 'bn' ? activeGauge.descBn : activeGauge.descEn}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-[11px] font-mono">
              UIC-60 / 60kg Rail Profile
            </span>
            <button
              type="button"
              onClick={handleSimulateTrackBuild}
              disabled={isBuilding}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-semibold shadow transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>
                {isBuilding
                  ? t.drawingRailTrack
                  : drawingMethod === 'click'
                  ? t.finishClickTrack
                  : t.drawRailTrack}
              </span>
            </button>
          </div>
        </div>

        {/* Viewport content */}
        {trackViewMode === 'both' ? (
          /* Dual Split View: Photo Render on Left, Interactive 3D Drawing Canvas on Right */
          <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Left Column: Photorealistic 3D Railway Track Render */}
              <div className="lg:col-span-5 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 min-h-[260px] flex flex-col justify-between group">
                <img
                  src={activeTrackImage}
                  alt={activeGauge.nameEn}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />

                {/* Top Overlay Badge */}
                <div className="relative z-10 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold shadow">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'bn' ? activeGauge.nameBn : activeGauge.nameEn}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImageLightbox(true)}
                    className="p-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-white hover:bg-black text-[11px] font-medium flex items-center gap-1 shadow transition-transform hover:scale-105"
                    title={lang === 'bn' ? 'পূর্ণাঙ্গ বড় ছবি দেখুন' : 'View Full Image'}
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Bottom Overlay Specs */}
                <div className="relative z-10 p-3 text-white space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-sky-300 font-mono">
                      {activeGauge.gaugeFtIn} ({activeGauge.gaugeMm} mm)
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px]">
                      UIC-60 Rails
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 line-clamp-1">
                    {lang === 'bn' ? activeGauge.typicalUsageBn : activeGauge.typicalUsageEn}
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive 3D Drawing Canvas with Live Rubber Band */}
              <div className="lg:col-span-7 flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      {lang === 'bn' ? '৩ডি ইন্টারঅ্যাক্টিভ অ্যালাইনমেন্ট ক্যানভাস:' : '3D Interactive Alignment Canvas:'}
                    </span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {drawingMethod === 'click'
                      ? (lang === 'bn' ? 'ক্লিক করে পয়েন্ট যোগ করুন' : 'Click canvas to add survey points')
                      : (lang === 'bn' ? 'প্রিসেট পথ এক্সট্রুশন' : 'Preset path extrusion')}
                  </span>
                </div>

                <div className="p-1 flex-1 flex items-center justify-center">
                  {renderTrackGraphic()}
                </div>
              </div>
            </div>

            {/* Quick Gauge Image Thumbnail Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
              <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">
                {lang === 'bn' ? 'অন্যান্য গেজ:' : 'Other Gauges:'}
              </span>
              {GAUGE_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGaugeId(g.id)}
                  className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border transition-all relative ${
                    selectedGaugeId === g.id
                      ? 'border-sky-400 ring-2 ring-sky-400 scale-105 shadow'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                  title={g.nameEn}
                >
                  <img
                    src={RAIL_TRACK_PREVIEW_IMAGES[g.id]}
                    alt={g.nameEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                    <span className="text-[8px] text-white font-mono font-bold leading-none">
                      {g.gaugeFtIn}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : trackViewMode === 'image' ? (
          <div className="space-y-3">
            <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group">
              <img
                src={activeTrackImage}
                alt={activeGauge.nameEn}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'bn' ? activeGauge.nameBn : activeGauge.nameEn}</span>
                </span>
                <span className="px-2 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md border border-emerald-500/50 text-emerald-300 text-xs font-mono">
                  UIC-60 Steel Rails
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowImageLightbox(true)}
                className="absolute top-3 right-3 p-2 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-white hover:bg-black text-xs font-semibold flex items-center gap-1 shadow-lg transition-transform hover:scale-105"
                title={lang === 'bn' ? 'পূর্ণাঙ্গ বড় ইমেজ দেখুন' : 'View Full Render Image'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'বড় করে দেখুন' : 'Full Render'}</span>
              </button>

              {/* Overlay info */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-wrap items-center justify-between text-xs text-white">
                <div>
                  <div className="font-semibold text-sm">
                    {lang === 'bn' ? 'বাস্তব ৩ডি রেলওয়ে ট্র্যাক রেন্ডার' : 'Photorealistic 3D Railway Track Render'}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {lang === 'bn' ? activeGauge.typicalUsageBn : activeGauge.typicalUsageEn}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-300 font-mono text-xs">
                    {lang === 'bn' ? 'স্লিপার:' : 'Sleeper:'} {sleeperType.toUpperCase()} @ {sleeperSpacingMm}mm C/C
                  </div>
                  <div className="text-[11px] text-sky-400 font-mono">
                    {lang === 'bn' ? 'ব্যালাস্ট বেড:' : 'Ballast Bed:'} {showBallast ? '300mm Granite' : 'Slab Track'}
                  </div>
                </div>
              </div>
            </div>

            {/* Gauge Image Thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
              <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">
                {lang === 'bn' ? 'অন্যান্য গেজ:' : 'Other Gauges:'}
              </span>
              {GAUGE_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGaugeId(g.id)}
                  className={`flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden border transition-all relative ${
                    selectedGaugeId === g.id
                      ? 'border-sky-400 ring-2 ring-sky-400 scale-105 shadow'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                  title={g.nameEn}
                >
                  <img
                    src={RAIL_TRACK_PREVIEW_IMAGES[g.id]}
                    alt={g.nameEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                    <span className="text-[9px] text-white font-mono font-bold leading-none">
                      {g.gaugeFtIn}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            {renderTrackGraphic()}
          </div>
        )}

        {/* Status / Output Footer */}
        {buildSuccessNotice && (
          <div className="mt-2 p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-2 text-emerald-300 text-xs font-semibold animate-in fade-in">
            <span className="text-base">✓</span>
            <span>{buildSuccessNotice}</span>
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-emerald-400 text-[11px]">
            {isBuilding
              ? `>>> EVL-Rail: Extruding Rails & Placing Sleepers (${buildPercent}%)...`
              : `>>> EVL-Rail: ${lang === 'bn' ? activeGauge.nameBn : activeGauge.nameEn} | Mode: ${
                  drawingMethod === 'click' ? 'Click-by-Click Alignment' : 'Selected Line Extrude'
                } | Sleeper: ${sleeperType.toUpperCase()} @ ${sleeperSpacingMm}mm | Ballast: ${
                  showBallast ? 'ON' : 'OFF'
                }`}
          </span>
          <span className="text-[11px] text-slate-500">
            {lang === 'bn'
              ? 'স্কেচআপে ক্লিক করে অথবা লাইন সিলেক্ট করে আসল ৩ডি রেলওয়ে ট্র্যাক তৈরি করুন'
              : 'Supports 1-click generation or interactive survey point alignment in SketchUp'}
          </span>
        </div>
      </div>

      {/* 5. TRACK PARAMETERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
        {/* Sleeper Type */}
        <div className="space-y-1.5">
          <div className="text-slate-300 font-medium">
            {lang === 'bn' ? 'স্লিপারের ধরণ (Sleeper Type):' : 'Sleeper Material:'}
          </div>
          <div className="flex gap-1.5">
            {[
              { id: 'concrete', labelBn: 'কংক্রিট (PSC)', labelEn: 'PSC Concrete' },
              { id: 'timber', labelBn: 'কাঠ (Hardwood)', labelEn: 'Timber Tie' },
              { id: 'steel', labelBn: 'স্টিল (Steel)', labelEn: 'Steel Trough' },
            ].map((mat) => (
              <button
                key={mat.id}
                type="button"
                onClick={() => setSleeperType(mat.id as any)}
                className={`flex-1 py-1 px-1.5 rounded border text-center transition-colors text-[11px] ${
                  sleeperType === mat.id
                    ? 'bg-sky-600 border-sky-400 text-white font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {lang === 'bn' ? mat.labelBn : mat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Sleeper Spacing */}
        <div className="space-y-1.5">
          <div className="text-slate-300 font-medium flex justify-between">
            <span>{lang === 'bn' ? 'স্লিপারের দূরত্ব (Spacing):' : 'Sleeper Spacing:'}</span>
            <span className="text-sky-400 font-mono font-bold">{sleeperSpacingMm} mm</span>
          </div>
          <div className="flex gap-1.5">
            {[550, 600, 650].map((spacing) => (
              <button
                key={spacing}
                type="button"
                onClick={() => setSleeperSpacingMm(spacing)}
                className={`flex-1 py-1 px-1.5 rounded border text-center transition-colors text-[11px] ${
                  sleeperSpacingMm === spacing
                    ? 'bg-sky-600 border-sky-400 text-white font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {spacing} mm {spacing === 600 ? '(Std)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Ballast Bed */}
        <div className="space-y-1.5">
          <div className="text-slate-300 font-medium">
            {lang === 'bn' ? 'পাথরের ব্যালাস্ট বেড:' : 'Crushed Stone Ballast:'}
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setShowBallast(true)}
              className={`flex-1 py-1 px-1.5 rounded border text-center transition-colors text-[11px] ${
                showBallast
                  ? 'bg-emerald-600 border-emerald-400 text-white font-bold'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {lang === 'bn' ? 'অন (৩০০মিমি)' : 'Ballasted (300mm)'}
            </button>
            <button
              type="button"
              onClick={() => setShowBallast(false)}
              className={`flex-1 py-1 px-1.5 rounded border text-center transition-colors text-[11px] ${
                !showBallast
                  ? 'bg-emerald-600 border-emerald-400 text-white font-bold'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {lang === 'bn' ? 'অফ (স্ল্যাব ট্র্যাক)' : 'Ballastless Slab'}
            </button>
          </div>
        </div>
      </div>

      {/* 6. SKETCHUP WORKFLOW GUIDE (EVL-Rail এর ২টি প্রমাণিত পদ্ধতি) */}
      <div className="bg-slate-900/60 p-3.5 rounded-xl border border-sky-800/40 text-xs space-y-2">
        <div className="flex items-center gap-2 text-sky-400 font-bold">
          <Info className="w-4 h-4 text-sky-400" />
          <span>
            {lang === 'bn'
              ? 'স্কেচআপে EVL-Rail ব্যবহারের ২টি কার্যকরী অপশন:'
              : 'Two Verified Drawing Methods in Trimble SketchUp EVL-Rail:'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 text-[11px] leading-relaxed">
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">
              {lang === 'bn' ? '👉 অপশন ১: ক্লিক করে করে ট্র্যাক অ্যালাইনমেন্ট ড্র (Survey Tool)' : '👉 Option 1: Interactive Survey Click Tool'}
            </span>
            <span>
              {lang === 'bn'
                ? 'স্কেচআপ ডায়ালগ থেকে "Interactive Track Alignment Tool" ক্লিক করুন। ভিউপোর্টে ক্লিক করে করে পয়েন্ট দিন (Point 1 ➜ Point 2 ➜ Point 3...)। ডাবল-ক্লিক করলে স্বয়ংক্রিয়ভাবে কার্ভ স্মুথিং হয়ে সম্পূর্ণ ৩ডি স্লিপার, পাথর ও রেলওয়ে ট্র্যাক তৈরি হবে।'
                : 'Activate "Interactive Track Alignment Tool" in SketchUp. Pick survey points directly in 3D viewport. Double-click to generate complete 3D ballast bed, PSC sleepers, and steel rails.'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-sky-400 font-bold block mb-1">
              {lang === 'bn' ? '📐 অপশন ২: আগে থেকে আঁকা লাইন বা কার্ভ সিলেক্ট করে তৈরি' : '📐 Option 2: Extrude Along Selected Curve'}
            </span>
            <span>
              {lang === 'bn'
                ? 'স্কেচআপে যেকোনো 3D Polyline বা Arc সিলেক্ট করুন এবং ডায়ালগে "Generate on Selected Curve" চাপুন। ব্রড গেজ, স্ট্যান্ডার্ড বা মিটার গেজে ৩ডি সলিড রেলওয়ে তৈরি হবে।'
                : 'Select any polyline, arc, or terrain edge in SketchUp and click "Generate on Selected Curve" for instant accurate gauge track generation.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
