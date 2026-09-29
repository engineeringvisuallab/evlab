import React, { useState } from 'react';
import {
  Check,
  Play,
  Maximize2,
  MousePointer,
  Spline,
  Undo2,
  Trash2,
  Image as ImageIcon,
  ZoomIn,
  Layers,
  Sparkles,
  Info,
  X,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TEXT } from '../data/translations';
import { RAILING_PREVIEW_IMAGES } from '../data/previewImages';
import { PLUGINS_DATA } from '../data/plugins';
import { triggerPluginDownload } from '../utils/fileDownloader';

export interface RailingStyle {
  id: string;
  nameBn: string;
  nameEn: string;
  tagBn: string;
  tagEn: string;
  infillType:
    | 'glass'
    | 'cable'
    | 'scroll'
    | 'slats'
    | 'pipe'
    | 'timber'
    | 'mesh'
    | 'glass_wood'
    | 'x_brace'
    | 'safety';
  iconEmoji: string;
  descBn: string;
  descEn: string;
  materialBn: string;
  materialEn: string;
  recommendedHeight: number; // inches
}

export const RAILING_STYLES: RailingStyle[] = [
  {
    id: 'style-1',
    nameBn: '১. ফ্রেমলেস গ্লাস ও এসএস স্পিগট',
    nameEn: '1. Frameless Glass & SS Spigots',
    tagBn: 'আধুনিক ও লাক্সারি',
    tagEn: 'Modern & Luxury',
    infillType: 'glass',
    iconEmoji: '🪟',
    descBn: '১২ মিমি টেম্পার্ড গ্লাস ও ফ্লোর স্পিগট ক্ল্যাম্প। ব্যালকনি ও ছাদে প্রিমিয়াম লুকের জন্য আদর্শ।',
    descEn: '12mm toughened glass with stainless steel floor spigots for uninterrupted panoramic views.',
    materialBn: 'টেম্পার্ড ক্লিয়ার গ্লাস + SS 304',
    materialEn: 'Tempered Clear Glass + SS 304',
    recommendedHeight: 42,
  },
  {
    id: 'style-2',
    nameBn: '২. স্টেইনলেস স্টিল ওয়্যার কেবল',
    nameEn: '2. SS Horizontal Tension Cable',
    tagBn: 'স্লিম ও মিনিমালিস্ট',
    tagEn: 'Slim & Minimalist',
    infillType: 'cable',
    iconEmoji: '⛓️',
    descBn: '৫-সারি হাই-টেনসাইল এসএস ওয়্যার কেবল ও রাউন্ড বা স্কয়ার পোস্ট। আধুনিক আউটডোর ডেকের জন্য জনপ্রিয়।',
    descEn: '5-row horizontal tensioned aircraft cables with turnbuckles and sleek metal posts.',
    materialBn: 'SS 316 মেরিন গ্রেড কেবল',
    materialEn: 'SS 316 Marine Grade Cable',
    recommendedHeight: 36,
  },
  {
    id: 'style-3',
    nameBn: '৩. ক্ল্যাসিকাল রট আয়রন স্ক্রোল',
    nameEn: '3. Classical Wrought Iron Scrolls',
    tagBn: 'ঐতিহ্যবাহী ও রাজকীয়',
    tagEn: 'Heritage & Ornate',
    infillType: 'scroll',
    iconEmoji: '⚜️',
    descBn: 'হাতে বাঁকানো ঢালাই এস-স্ক্রোল ও কার্ভড রট আয়রন পিকেট। ক্লাসিক্যাল বাংলো ও রাজকীয় সিঁড়ির উপযোগী।',
    descEn: 'Decorative forged iron S-scrolls, cast finials, and molded classical handrail.',
    materialBn: 'কাস্ট ও রট আয়রন (ম্যাট ব্ল্যাক)',
    materialEn: 'Cast & Wrought Iron (Matte Black)',
    recommendedHeight: 36,
  },
  {
    id: 'style-4',
    nameBn: '৪. কন্টেম্পোরারি ভার্টিক্যাল মেটাল স্ল্যাট',
    nameEn: '4. Contemporary Vertical Slats',
    tagBn: 'সেফটি ও আধুনিক',
    tagEn: 'Code Safety & Clean',
    infillType: 'slats',
    iconEmoji: '📐',
    descBn: '১০০ মিমি (৪ ইঞ্চি) নিখুঁত দূরত্বের উল্লম্ব মেটাল বার। আন্তর্জাতিক সেফটি কোড অনুযায়ী সম্পূর্ণ নিরাপদ।',
    descEn: 'Evenly spaced 20x20mm vertical pickets conforming to the standard 4-inch sphere code rule.',
    materialBn: 'অ্যালুমিনিয়াম / এমএস পাউডার কোটিং',
    materialEn: 'Powder-coated Aluminum / Steel',
    recommendedHeight: 42,
  },
  {
    id: 'style-5',
    nameBn: '৫. ইন্ডাস্ট্রিয়াল জিআই পাইপ ও ফিটিংস',
    nameEn: '5. Industrial Steel Pipe & Flanges',
    tagBn: 'রাফ ও লোফট স্টাইল',
    tagEn: 'Industrial & Loft',
    infillType: 'pipe',
    iconEmoji: '🔩',
    descBn: '১.৫ ইঞ্চি শিডিউল পাইপ ও কাস্ট আয়রন এলবো/টি ফিটিংস। আধুনিক ক্যাফে, ফ্যাক্টরি ও লোফটের সেরা পছন্দ।',
    descEn: 'Sturdy 1.5-inch round pipe handrail and mid-rail with structural Kee-Klamp and floor flanges.',
    materialBn: 'গ্যালভানাইজড আয়রন (GI) পাইপ',
    materialEn: 'Galvanized Iron (GI) Pipe',
    recommendedHeight: 42,
  },
  {
    id: 'style-6',
    nameBn: '৬. ট্র্যাডিশনাল কাঠের টার্নড স্পিন্ডল',
    nameEn: '6. Traditional Timber Turned Balusters',
    tagBn: 'কাঠের সিঁড়ি ও কটেজ',
    tagEn: 'Warm Wood & Cottage',
    infillType: 'timber',
    iconEmoji: '🪵',
    descBn: 'সুন্দর বাঁকানো কাঠের স্পিন্ডল এবং খোদাই করা নিউয়েল পোস্ট। কাঠের সিঁড়ি ও ইন্টেরিয়রে উষ্ণ আভা আনে।',
    descEn: 'Carved wooden balusters with profiled newel posts and continuous contoured timber rail.',
    materialBn: 'সেগুন / ওক কাঠ (বার্নিশ ফিনিশ)',
    materialEn: 'Teak / Oak Wood (Stained Finish)',
    recommendedHeight: 36,
  },
  {
    id: 'style-7',
    nameBn: '৭. লেজার-কাট সিএনসি মেশ প্যানেল',
    nameEn: '7. Laser-Cut Perforated CNC Mesh',
    tagBn: 'হাই-টেক আর্কিটেকচার',
    tagEn: 'Geometric & High-Tech',
    infillType: 'mesh',
    iconEmoji: '🕳️',
    descBn: 'জ্যামিতিক ছিদ্রযুক্ত সিএনসি শীট মেটাল প্যানেল। আধুনিক কমার্শিয়াল বিল্ডিং ও প্রিমিয়াম ব্যালকনির সৌন্দর্য বাড়ায়।',
    descEn: 'Precision perforated sheet metal with custom CNC pattern inside a rigid tubular perimeter frame.',
    materialBn: 'লেজার কাট জিআই / অ্যালুমিনিয়াম শীট',
    materialEn: 'Laser Cut GI / Aluminum Sheet',
    recommendedHeight: 42,
  },
  {
    id: 'style-8',
    nameBn: '৮. ব্যালকনি গ্লাস ও উডেন টপ হ্যান্ডরেল',
    nameEn: '8. Balcony Glass with Timber Handrail',
    tagBn: 'হাইজিন ও কমফোর্ট',
    tagEn: 'Tactile Warmth & Glass',
    infillType: 'glass_wood',
    iconEmoji: '🌿',
    descBn: 'নিচের অংশে স্বচ্ছ গ্লাস প্যানেল এবং উপরে হাত রাখার জন্য মনোরম প্রাকৃতিক কাঠের স্মুথ হ্যান্ডরেল।',
    descEn: 'Tempered glass panels paired with a tactile solid wood contoured cap rail for comfortable grip.',
    materialBn: '১০ মিমি গ্লাস + মেহগনি উড ক্যাপ',
    materialEn: '10mm Glass + Solid Hardwood Cap',
    recommendedHeight: 42,
  },
  {
    id: 'style-9',
    nameBn: '৯. মডার্ন ফার্মহাউস এক্স-ব্রেইস (Crossbuck)',
    nameEn: '9. Modern Farmhouse X-Brace',
    tagBn: 'ফার্মহাউস ও ডেক',
    tagEn: 'Rustic Farmhouse & Porch',
    infillType: 'x_brace',
    iconEmoji: '❌',
    descBn: 'পোস্টের মাঝখানে আড়াআড়ি এক্স-প্যাটার্ন মেম্বার। পোর্চ, ডেক ও রিসোর্টের ব্যালকনিতে জনপ্রিয়।',
    descEn: 'Classic diagonal X-buck bracing framed inside sturdy square structural posts.',
    materialBn: 'ম্যাট ব্ল্যাক মেটাল / পাইন কাঠ',
    materialEn: 'Matte Black Steel / Treated Wood',
    recommendedHeight: 36,
  },
  {
    id: 'style-10',
    nameBn: '১০. কমার্শিয়াল সেফটি রেলিং ও কিকপ্লেট',
    nameEn: '10. Commercial Safety Rail with Kickplate',
    tagBn: 'ইন্ডাস্ট্রিয়াল সেফটি কোড',
    tagEn: 'OSHA / Building Safety Code',
    infillType: 'safety',
    iconEmoji: '🛡️',
    descBn: 'টপ রেইল, ২১ ইঞ্চি মিড-রেইল এবং নিচে ৪ ইঞ্চি সলিড কিকপ্লেট (টোপ্লেট)। শিল্পকারখানা ও পাবলিক প্ল্যাটফর্মের জন্য।',
    descEn: 'Industrial 2-tier guardrail with standard 4-inch solid toe-board / kickplate to prevent falling objects.',
    materialBn: 'হেভি-ডিউটি স্টিল + ইয়েলো সেফটি / ব্ল্যাক',
    materialEn: 'Heavy Duty Structural Steel',
    recommendedHeight: 42,
  },
];

interface Point {
  x: number;
  y: number;
}

interface RailingVisualizerProps {
  lang: Language;
}

export const RailingVisualizer: React.FC<RailingVisualizerProps> = ({ lang }) => {
  const t = UI_TEXT[lang];

  // 1. Drawing Method: 'click' (ক্লিক করে ড্র) | 'select_line' (লাইন সিলেক্ট করে ড্র)
  const [drawingMethod, setDrawingMethod] = useState<'click' | 'select_line'>('click');

  // 2. Preview Mode: 'both' (ইমেজ + ৩ডি ক্যানভাস) | 'image' (ইমেজ প্রিভিউ) | '3d' (৩ডি মডেল) | 'elevation' (এলিভেশন)
  const [viewMode, setViewMode] = useState<'both' | 'image' | '3d' | 'elevation'>('both');
  const [hoverPt, setHoverPt] = useState<Point | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const railingPlugin = PLUGINS_DATA.find((p) => p.id === 'sketchup-evl-railing') || null;

  const handleDownloadRbz = async () => {
    if (!railingPlugin) return;
    setIsDownloading(true);
    const ok = await triggerPluginDownload(railingPlugin);
    setIsDownloading(false);
    if (ok) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    }
  };

  // Parameters
  const [selectedStyleId, setSelectedStyleId] = useState<string>('style-1');
  const [railingHeight, setRailingHeight] = useState<number>(42); // 36, 42, 48 inches
  const [postSpacing, setPostSpacing] = useState<number>(48); // 36, 48, 60 inches
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawProgress, setDrawProgress] = useState<number>(100);
  const [showImageLightbox, setShowImageLightbox] = useState<boolean>(false);
  const [drawSuccessNotice, setDrawSuccessNotice] = useState<string | null>(null);

  // Tactile click ripples on SVG canvas
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Click-to-draw state points (in SVG coordinates 0..600, 0..240)
  const [clickedPoints, setClickedPoints] = useState<Point[]>([
    { x: 70, y: 155 },
    { x: 220, y: 155 },
    { x: 380, y: 155 },
    { x: 530, y: 155 },
  ]);

  // Selected Preset Line option for 'select_line' mode
  const [selectedLinePreset, setSelectedLinePreset] = useState<
    'straight' | 'l_shape' | 'u_shape' | 'curved' | 'stair'
  >('straight');

  const activeStyle =
    RAILING_STYLES.find((s) => s.id === selectedStyleId) || RAILING_STYLES[0];

  const activePreviewImage =
    RAILING_PREVIEW_IMAGES[activeStyle.id] || RAILING_PREVIEW_IMAGES['style-1'];

  // Handle canvas mouse move for interactive rubber band line
  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 600);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 240);
    const boundedY = Math.max(50, Math.min(220, y));
    const boundedX = Math.max(20, Math.min(580, x));
    setHoverPt({ x: boundedX, y: boundedY });
  };

  const handleCanvasMouseLeave = () => {
    setHoverPt(null);
  };

  // Handle canvas click to add points in both click and select modes
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 600);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 240);

    // Keep within reasonable bounds
    const boundedY = Math.max(50, Math.min(220, y));
    const boundedX = Math.max(20, Math.min(580, x));

    // Spawn tactile ripple
    const rId = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id: rId, x: boundedX, y: boundedY }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rId));
    }, 700);

    setClickedPoints((prev) => [...prev, { x: boundedX, y: boundedY }]);
    setDrawSuccessNotice(null);
  };

  const handleUndoPoint = () => {
    setClickedPoints((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    setDrawSuccessNotice(null);
  };

  const handleClearPoints = () => {
    setClickedPoints([]);
    setDrawSuccessNotice(null);
  };

  // Load preset points with live animated sweep
  const loadPresetPath = (preset: 'straight' | 'l_shape' | 'u_shape' | 'curved' | 'stair') => {
    setSelectedLinePreset(preset);
    let pts: Point[] = [];
    if (preset === 'straight') {
      pts = [
        { x: 60, y: 155 },
        { x: 220, y: 155 },
        { x: 380, y: 155 },
        { x: 540, y: 155 },
      ];
    } else if (preset === 'l_shape') {
      pts = [
        { x: 80, y: 190 },
        { x: 320, y: 190 },
        { x: 320, y: 80 },
        { x: 520, y: 80 },
      ];
    } else if (preset === 'u_shape') {
      pts = [
        { x: 100, y: 80 },
        { x: 100, y: 180 },
        { x: 500, y: 180 },
        { x: 500, y: 80 },
      ];
    } else if (preset === 'curved') {
      pts = [
        { x: 60, y: 180 },
        { x: 180, y: 130 },
        { x: 300, y: 110 },
        { x: 420, y: 130 },
        { x: 540, y: 180 },
      ];
    } else if (preset === 'stair') {
      pts = [
        { x: 80, y: 200 },
        { x: 220, y: 160 },
        { x: 360, y: 120 },
        { x: 500, y: 80 },
      ];
    }
    setClickedPoints(pts);
    setDrawSuccessNotice(null);

    // Trigger visual draw sweep animation
    setIsDrawing(true);
    setDrawProgress(0);
    const interval = setInterval(() => {
      setDrawProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDrawing(false);
          return 100;
        }
        return prev + 35;
      });
    }, 90);
  };

  // Simulate generation action
  const handleSimulateDraw = () => {
    // If fewer than 2 points, auto-load current preset
    if (clickedPoints.length < 2) {
      loadPresetPath(selectedLinePreset);
      return;
    }

    setIsDrawing(true);
    setDrawProgress(0);
    setDrawSuccessNotice(null);

    const interval = setInterval(() => {
      setDrawProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDrawing(false);
          const styleName = lang === 'bn' ? activeStyle.nameBn : activeStyle.nameEn;
          setDrawSuccessNotice(
            lang === 'bn'
              ? `✓ ৩ডি সলিড রেলিং তৈরি সম্পন্ন: ${styleName} | ${totalLengthFeet} ft | ${clickedPoints.length}টি পোস্ট`
              : `✓ 3D Solid Railing Extruded: ${styleName} | ${totalLengthFeet} ft | ${clickedPoints.length} Posts`
          );
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Calculate total path distance in feet
  const totalLengthFeet = React.useMemo(() => {
    if (clickedPoints.length < 2) return '0.0';
    let totalPx = 0;
    for (let i = 0; i < clickedPoints.length - 1; i++) {
      const dx = clickedPoints[i + 1].x - clickedPoints[i].x;
      const dy = clickedPoints[i + 1].y - clickedPoints[i].y;
      totalPx += Math.sqrt(dx * dx + dy * dy);
    }
    // Scale: 400px = approx 16 feet
    return ((totalPx / 400) * 16).toFixed(1);
  }, [clickedPoints]);

  // Render SVG Representation for CAD/Elevation
  const renderRailingSVG = () => {
    const is3D = viewMode === '3d';
    const canvasWidth = 600;
    const canvasHeight = 240;

    // Use points from state
    const points = clickedPoints;

    // Compute ground Y and scale
    const scale = (railingHeight / 42) * 90;

    return (
      <svg
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        className="w-full h-60 sm:h-64 select-none cursor-crosshair"
      >
        <defs>
          <linearGradient id="railFloorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="railGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
            <stop offset="50%" stopColor="rgba(147, 197, 253, 0.25)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.35)" />
          </linearGradient>

          <linearGradient id="railSteelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          <linearGradient id="railSweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
            <stop offset="50%" stopColor="rgba(56, 189, 248, 0.9)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
          </linearGradient>

          <pattern id="gridBack" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.75" />
          </pattern>
        </defs>

        {/* CAD Grid Background */}
        <rect width={canvasWidth} height={canvasHeight} fill="#0b1120" />
        <rect width={canvasWidth} height={canvasHeight} fill="url(#gridBack)" opacity="0.8" />

        {/* Center Grid Reference Axes */}
        <line x1="0" y1="120" x2={canvasWidth} y2="120" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="300" y1="0" x2="300" y2={canvasHeight} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

        {/* 1. STATE: 0 POINTS (Waiting for first click) */}
        {points.length === 0 && (
          <g>
            {/* Welcoming Interactive Prompt in center */}
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
                  ? '📐 নতুন রেলিং ড্র করতে যেকোনো স্থানে ক্লিক করুন'
                  : '📐 Click anywhere on CAD grid to place Point 1'}
              </text>
              <text x="0" y="14" fill="#94a3b8" fontSize="10" textAnchor="middle">
                {lang === 'bn'
                  ? 'পয়েন্ট ১ ➜ পয়েন্ট ২ দিয়ে নিজের ইচ্ছামতো সাইজ ও দিক ড্র করুন'
                  : 'Pick Point 1 ➜ Point 2 to extrude custom 3D railing'}
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
              P1 (Start)
            </text>

            {/* Preview 3D Post at Point 1 */}
            <line
              x1={points[0].x}
              y1={points[0].y + 2}
              x2={points[0].x}
              y2={points[0].y - scale}
              stroke="#cbd5e1"
              strokeWidth="6"
              strokeLinecap="square"
            />
            <ellipse cx={points[0].x} cy={points[0].y + 2} rx="9" ry="4" fill="#64748b" />

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
                <line
                  x1={points[0].x}
                  y1={points[0].y - scale}
                  x2={hoverPt.x}
                  y2={hoverPt.y - scale}
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
                {/* Ghost Post at Cursor */}
                <line
                  x1={hoverPt.x}
                  y1={hoverPt.y + 2}
                  x2={hoverPt.x}
                  y2={hoverPt.y - scale}
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeDasharray="2 2"
                  opacity="0.7"
                />
                <circle cx={hoverPt.x} cy={hoverPt.y} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x={hoverPt.x + 10} y={hoverPt.y - 12} fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  + P2 ({((Math.hypot(hoverPt.x - points[0].x, hoverPt.y - points[0].y) / 400) * 16).toFixed(1)} ft)
                </text>
              </g>
            )}

            {/* Helper Banner */}
            <g transform="translate(10, 20)">
              <rect width="360" height="24" rx="4" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="1" />
              <text x="10" y="16" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                + {lang === 'bn' ? 'ক্লিক করে ২য় পয়েন্ট দিন (১ম স্প্যান সমাপ্ত করুন)' : 'Click anywhere to place Point 2 & complete 1st span'}
              </text>
            </g>
          </g>
        )}

        {/* 3. STATE: >= 2 POINTS (Full 3D Railing Model Extruded) */}
        {points.length >= 2 && (
          <g>
            {/* Top Prompt Banner */}
            <g transform="translate(10, 20)">
              <rect width="380" height="24" rx="4" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1" />
              <text x="10" y="16" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">
                + {points.length} {lang === 'bn' ? 'পয়েন্ট সংযুক্ত | ক্লিক করে আরও যোগ করুন' : 'Points Connected | Click canvas to add more'}
              </text>
            </g>

            {/* Dynamic Rubber Band line connecting last point to cursor */}
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
                {/* Ghost handrail guide */}
                <line
                  x1={points[points.length - 1].x}
                  y1={points[points.length - 1].y - scale}
                  x2={hoverPt.x}
                  y2={hoverPt.y - scale}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="3 3"
                  opacity="0.7"
                />
                {/* Ghost post at hover cursor */}
                <line
                  x1={hoverPt.x}
                  y1={hoverPt.y}
                  x2={hoverPt.x}
                  y2={hoverPt.y - scale}
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="2 2"
                  opacity="0.6"
                />
                <circle cx={hoverPt.x} cy={hoverPt.y} r="5" fill="#f59e0b" opacity="0.8" />
                <text x={hoverPt.x + 8} y={hoverPt.y - 8} fill="#fbbf24" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  + P{points.length + 1} ({((Math.hypot(hoverPt.x - points[points.length - 1].x, hoverPt.y - points[points.length - 1].y) / 400) * 16).toFixed(1)} ft)
                </text>
              </g>
            )}

            {/* Segments and Railing Infill */}
            {points.map((pt, i) => {
              if (i === points.length - 1) return null;
              const nextPt = points[i + 1];
              const midX = (pt.x + nextPt.x) / 2;
              const midY = (pt.y + nextPt.y) / 2;
              const dx = nextPt.x - pt.x;
              const dy = nextPt.y - pt.y;
              const segLen = Math.sqrt(dx * dx + dy * dy);

              return (
                <g key={`seg-${i}`}>
                  {/* Floor Base Slab */}
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={nextPt.x}
                    y2={nextPt.y}
                    stroke="#334155"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />

                  {/* Infill according to Style */}
                  {activeStyle.infillType === 'glass' && (
                    <polygon
                      points={`${pt.x},${pt.y - 10} ${nextPt.x},${nextPt.y - 10} ${nextPt.x},${
                        nextPt.y - scale
                      } ${pt.x},${pt.y - scale}`}
                      fill="url(#railGlassGrad)"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeOpacity="0.8"
                    />
                  )}

                  {activeStyle.infillType === 'cable' && (
                    <g stroke="#94a3b8" strokeWidth="1.2" opacity="0.85">
                      {[0.2, 0.38, 0.56, 0.74, 0.9].map((ratio, rIdx) => (
                        <line
                          key={rIdx}
                          x1={pt.x}
                          y1={pt.y - scale * ratio}
                          x2={nextPt.x}
                          y2={nextPt.y - scale * ratio}
                        />
                      ))}
                    </g>
                  )}

                  {activeStyle.infillType === 'slats' && (
                    <g stroke="#cbd5e1" strokeWidth="2.5" opacity="0.9">
                      {Array.from({ length: Math.max(3, Math.floor(segLen / 18)) }).map((_, sIdx, arr) => {
                        const r = (sIdx + 1) / (arr.length + 1);
                        const bx = pt.x + dx * r;
                        const by = pt.y + dy * r;
                        return (
                          <line
                            key={sIdx}
                            x1={bx}
                            y1={by - 5}
                            x2={bx}
                            y2={by - scale}
                          />
                        );
                      })}
                    </g>
                  )}

                  {activeStyle.infillType === 'pipe' && (
                    <g stroke="#94a3b8" strokeWidth="4" strokeLinecap="round">
                      <line
                        x1={pt.x}
                        y1={pt.y - scale * 0.5}
                        x2={nextPt.x}
                        y2={nextPt.y - scale * 0.5}
                      />
                    </g>
                  )}

                  {activeStyle.infillType === 'timber' && (
                    <g stroke="#b45309" strokeWidth="3" strokeLinecap="round">
                      {Array.from({ length: Math.max(3, Math.floor(segLen / 22)) }).map((_, sIdx, arr) => {
                        const r = (sIdx + 1) / (arr.length + 1);
                        const bx = pt.x + dx * r;
                        const by = pt.y + dy * r;
                        return (
                          <line
                            key={sIdx}
                            x1={bx}
                            y1={by - 4}
                            x2={bx}
                            y2={by - scale}
                          />
                        );
                      })}
                    </g>
                  )}

                  {activeStyle.infillType === 'x_brace' && (
                    <g stroke="#0284c7" strokeWidth="2" strokeDasharray="none">
                      <line x1={pt.x} y1={pt.y - 6} x2={nextPt.x} y2={nextPt.y - scale} />
                      <line x1={pt.x} y1={pt.y - scale} x2={nextPt.x} y2={nextPt.y - 6} />
                    </g>
                  )}

                  {activeStyle.infillType === 'safety' && (
                    <g>
                      {/* Yellow Kickplate */}
                      <polygon
                        points={`${pt.x},${pt.y} ${nextPt.x},${nextPt.y} ${nextPt.x},${nextPt.y - 18} ${pt.x},${pt.y - 18}`}
                        fill="#eab308"
                        opacity="0.9"
                      />
                      {/* Mid-rail */}
                      <line
                        x1={pt.x}
                        y1={pt.y - scale * 0.5}
                        x2={nextPt.x}
                        y2={nextPt.y - scale * 0.5}
                        stroke="#eab308"
                        strokeWidth="3.5"
                      />
                    </g>
                  )}

                  {/* Top Continuous Handrail */}
                  <line
                    x1={pt.x}
                    y1={pt.y - scale}
                    x2={nextPt.x}
                    y2={nextPt.y - scale}
                    stroke={activeStyle.infillType === 'timber' || activeStyle.infillType === 'glass_wood' ? '#b45309' : '#38bdf8'}
                    strokeWidth={is3D ? '6' : '5'}
                    strokeLinecap="round"
                  />

                  {/* Segment distance badge */}
                  <g transform={`translate(${midX}, ${midY + 18})`}>
                    <rect x="-24" y="-9" width="48" height="16" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                    <text x="0" y="3" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      {((segLen / 400) * 16).toFixed(1)}&apos;
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Extrusion laser sweep animation while drawing */}
            {isDrawing && (
              <rect
                x="0"
                y="0"
                width={canvasWidth}
                height={canvasHeight}
                fill="url(#railSweepGrad)"
                opacity="0.25"
                className="animate-pulse"
              />
            )}

            {/* Structural Posts at Points */}
            {points.map((pt, i) => (
              <g key={`post-${i}`}>
                {/* 3D / Elevation Post Member */}
                <line
                  x1={pt.x}
                  y1={pt.y + 2}
                  x2={pt.x}
                  y2={pt.y - scale}
                  stroke="#cbd5e1"
                  strokeWidth="6"
                  strokeLinecap="square"
                />
                {/* Flange base */}
                <ellipse cx={pt.x} cy={pt.y + 2} rx="8" ry="3" fill="#64748b" />

                {/* Point Vertex Indicator */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  fill={i === points.length - 1 ? '#10b981' : '#0284c7'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={pt.x}
                  y={pt.y - 12}
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
              stroke="#38bdf8"
              strokeWidth="2.5"
              opacity="0.85"
            />
            <circle cx={r.x} cy={r.y} r="6" fill="#38bdf8" />
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
                <span className="text-xl">{activeStyle.iconEmoji}</span>
                <span className="text-sm font-bold text-white">
                  {lang === 'bn' ? activeStyle.nameBn : activeStyle.nameEn}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-950 border border-sky-600 text-sky-300">
                  {lang === 'bn' ? activeStyle.tagBn : activeStyle.tagEn}
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
                src={activePreviewImage}
                alt={activeStyle.nameEn}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-300">
                <strong className="text-sky-400">{lang === 'bn' ? 'ম্যাটেরিয়াল:' : 'Material:'}</strong>{' '}
                {lang === 'bn' ? activeStyle.materialBn : activeStyle.materialEn}
              </span>
              <span className="text-emerald-400 font-mono">
                ✓ Trimble SketchUp EVL-Railing Extension Compatible
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP CONTROL BAR: Two Drawing Methods & View Modes */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
        {/* Software / Plugin Header */}
        <div className="flex items-center gap-2">
          <span className="text-lg">🏗️</span>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>EVL-Railing: 3D Architectural Railing Generator</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-900/60 border border-sky-600 text-sky-300">
                10 Styles
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher: Image + 3D Dual, Image Only, 3D CAD, Elevation */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('both')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'both'
                  ? 'bg-sky-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.viewBoth}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                viewMode === '3d'
                  ? 'bg-sky-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.viewCad3D}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('image')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'image'
                  ? 'bg-sky-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{t.viewRealisticImage}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('elevation')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'elevation'
                  ? 'bg-sky-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Spline className="w-3.5 h-3.5" />
              <span>{t.viewElevation}</span>
            </button>
          </div>

          {/* Quick RBZ Download Button */}
          {railingPlugin && (
            <button
              type="button"
              onClick={handleDownloadRbz}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-semibold shadow transition-all hover:scale-102"
              title={lang === 'bn' ? 'EVL-Railing v2.1 .rbz ফাইল ডাউনলোড করুন' : 'Download EVL-Railing v2.1 .rbz'}
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

      {/* 2. TWO DRAWING METHODS (২টি অপশন: ক্লিক করে করে ড্র অথবা লাইন সিলেক্ট করে ড্র) */}
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
                if (viewMode === 'image') setViewMode('3d');
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
                if (viewMode === 'image') setViewMode('3d');
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

        {/* Sub-controls depending on Drawing Method */}
        {drawingMethod === 'click' ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-mono text-[11px]">
                {clickedPoints.length} {lang === 'bn' ? 'পয়েন্ট সিলেক্টেড' : 'Points Placed'} ({totalLengthFeet} ft)
              </span>
              <span className="text-[11px] text-slate-400">
                {lang === 'bn'
                  ? 'ক্যানভাসে ক্লিক করে একের পর এক পয়েন্ট দিন'
                  : 'Click on the canvas grid below to add path points'}
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

              {/* Quick Preset Paths */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 uppercase">{lang === 'bn' ? 'প্রিসেট:' : 'Preset:'}</span>
                <button
                  type="button"
                  onClick={() => loadPresetPath('straight')}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                >
                  {lang === 'bn' ? 'স্ট্রেইট (১৪\')' : 'Straight'}
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetPath('l_shape')}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                >
                  L-Corner
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetPath('u_shape')}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                >
                  U-Balcony
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetPath('stair')}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                >
                  {lang === 'bn' ? 'সিঁড়ি (Stairs)' : 'Stairs'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Select Existing Line Mode */
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-slate-400">{t.presetLineLabel}</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'straight', nameBn: 'সোজা ব্যালকনি লাইন (১৪\')', nameEn: 'Straight Balcony Line (14 ft)' },
                  { id: 'l_shape', nameBn: 'এল-আকৃতির বারান্দা (১০\'+১২\')', nameEn: 'L-Shaped Balcony (10\' + 12\')' },
                  { id: 'u_shape', nameBn: '৩-পার্শ্ব ইউ-টেরাস (৬\'+১৪\'+৬\')', nameEn: 'U-Shaped Terrace (6\'+14\'+6\')' },
                  { id: 'curved', nameBn: 'বাঁকানো কার্ভড ব্যালকনি আর্ক', nameEn: 'Curved Balcony Arc (R=16 ft)' },
                  { id: 'stair', nameBn: 'সিঁড়ির ঢালু লাইন (৩২° Incline)', nameEn: 'Stair Flight Incline (32°)' },
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
              ✓ {lang === 'bn' ? 'স্কেচআপে লাইন সিলেক্ট করে রান করুন' : 'Select line in SketchUp & run'}
            </span>
          </div>
        )}
      </div>

      {/* 3. 10 RAILING STYLE CARDS WITH REAL IMAGE THUMBNAILS */}
      <div className="space-y-1.5">
        <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
          <span>
            {lang === 'bn'
              ? '১০টি আর্কিটেকচারাল রেলিং স্টাইল (ইমেজ প্রিভিউসহ বেছে নিন):'
              : 'Select from 10 Architectural Styles (with Image Preview):'}
          </span>
          <span className="text-sky-400 font-mono text-[10px]">EVL-Railing v2.1</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {RAILING_STYLES.map((style) => {
            const isSelected = selectedStyleId === style.id;
            const imgThumb = RAILING_PREVIEW_IMAGES[style.id] || RAILING_PREVIEW_IMAGES['style-1'];
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  setSelectedStyleId(style.id);
                  setRailingHeight(style.recommendedHeight);
                }}
                className={`group relative p-1.5 rounded-xl border text-left transition-all flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'bg-sky-950/80 border-sky-400 ring-2 ring-sky-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                {/* Realistic Image Thumbnail */}
                <div className="relative w-full h-16 rounded-lg overflow-hidden mb-1.5 bg-slate-900">
                  <img
                    src={imgThumb}
                    alt={style.nameEn}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute top-1 left-1 text-xs">{style.iconEmoji}</span>
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold shadow">
                      ✓
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-bold line-clamp-1 leading-tight">
                  {lang === 'bn' ? style.nameBn : style.nameEn}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                  {lang === 'bn' ? style.tagBn : style.tagEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN PREVIEW VIEWPORT: Realistic Image Preview OR 3D CAD Grid */}
      <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-3 overflow-hidden shadow-inner">
        {/* Header Spec Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-900/60 border border-sky-600/50 text-sky-300 font-mono text-[11px]">
              {lang === 'bn' ? activeStyle.materialBn : activeStyle.materialEn}
            </span>
            <span className="text-slate-400 text-[11px]">
              {lang === 'bn' ? activeStyle.descBn : activeStyle.descEn}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-[11px] font-mono">
              ✓ SketchUp .rbz Ready
            </span>
            <button
              type="button"
              onClick={handleSimulateDraw}
              disabled={isDrawing}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-semibold shadow transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>
                {isDrawing
                  ? t.drawingRailing
                  : drawingMethod === 'click'
                  ? t.finishClickDraw
                  : t.drawRailing}
              </span>
            </button>
          </div>
        </div>

        {/* Viewport Content: Dual Split (Image + 3D Canvas), Image Only, or 3D/Elevation */}
        {viewMode === 'both' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            {/* Left: Photorealistic Render Image Card */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-2">
              <div className="relative w-full h-52 sm:h-64 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group">
                <img
                  src={activePreviewImage}
                  alt={activeStyle.nameEn}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1 shadow">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    <span>{lang === 'bn' ? activeStyle.nameBn : activeStyle.nameEn}</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-950/90 border border-sky-500/50 text-sky-300 text-[10px] font-mono">
                    {lang === 'bn' ? activeStyle.tagBn : activeStyle.tagEn}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowImageLightbox(true)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-white hover:bg-black text-[10px] font-semibold flex items-center gap-1 shadow transition-transform hover:scale-105"
                  title={lang === 'bn' ? 'বড় ইমেজ দেখুন' : 'Full Render'}
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">{lang === 'bn' ? 'বড়' : 'Zoom'}</span>
                </button>

                {/* Specs overlay */}
                <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-between text-[10px] text-white">
                  <span className="text-slate-300 font-medium line-clamp-1">
                    {lang === 'bn' ? activeStyle.descBn : activeStyle.descEn}
                  </span>
                  <span className="text-sky-300 font-mono ml-2 whitespace-nowrap">
                    {railingHeight}&quot; ({Math.round(railingHeight * 25.4)}mm)
                  </span>
                </div>
              </div>

              {/* Quick style selector mini strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
                <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap mr-0.5">
                  {lang === 'bn' ? '১০টি স্টাইল:' : '10 Styles:'}
                </span>
                {RAILING_STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyleId(st.id)}
                    className={`flex-shrink-0 w-11 h-8 rounded-md overflow-hidden border transition-all relative ${
                      selectedStyleId === st.id
                        ? 'border-sky-400 ring-2 ring-sky-400 scale-105 shadow'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                    title={st.nameEn}
                  >
                    <img
                      src={RAILING_PREVIEW_IMAGES[st.id]}
                      alt={st.nameEn}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Interactive 3D Drawing Canvas */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-xl overflow-hidden border border-slate-800 bg-[#0b1120]">
              <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-bold font-mono">
                    {drawingMethod === 'click'
                      ? (lang === 'bn' ? 'ক্লিক-টু-ড্র ক্যানভাস (গ্রিডে ক্লিক করুন)' : 'Click-to-Draw 3D Canvas')
                      : (lang === 'bn' ? 'সিলেক্টেড পাথ ৩ডি সলিড প্রিভিউ' : 'Selected Path 3D Solid Preview')}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">
                  {clickedPoints.length} {lang === 'bn' ? 'পয়েন্ট' : 'points'} | {totalLengthFeet} ft
                </span>
              </div>
              <div className="w-full flex items-center justify-center p-1">
                {renderRailingSVG()}
              </div>
            </div>
          </div>
        ) : viewMode === 'image' ? (
          <div className="space-y-3">
            <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group">
              <img
                src={activePreviewImage}
                alt={activeStyle.nameEn}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Top gradient badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>{lang === 'bn' ? activeStyle.nameBn : activeStyle.nameEn}</span>
                </span>
                <span className="px-2 py-1 rounded-lg bg-sky-950/80 backdrop-blur-md border border-sky-500/50 text-sky-300 text-xs font-mono">
                  {lang === 'bn' ? activeStyle.tagBn : activeStyle.tagEn}
                </span>
              </div>

              {/* Switch to interactive canvas button */}
              <div className="absolute top-3 right-14 flex items-center">
                <button
                  type="button"
                  onClick={() => setViewMode('both')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-lg transition-transform hover:scale-105"
                >
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? '৩ডি ক্যানভাসে ড্র করুন' : 'Draw on Canvas'}</span>
                </button>
              </div>

              {/* Expand Lightbox Button */}
              <button
                type="button"
                onClick={() => setShowImageLightbox(true)}
                className="absolute top-3 right-3 p-2 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-white hover:bg-black text-xs font-semibold flex items-center gap-1 shadow-lg transition-transform hover:scale-105"
                title={lang === 'bn' ? 'পূর্ণাঙ্গ বড় ইমেজ দেখুন' : 'View Full Render Image'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'বড় করে দেখুন' : 'Full Render'}</span>
              </button>

              {/* Bottom Specs Bar overlay */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-wrap items-center justify-between text-xs text-white">
                <div>
                  <div className="font-semibold text-sm">
                    {lang === 'bn' ? 'আর্কিটেকচারাল রেন্ডার প্রিভিউ' : 'Architectural 3D Render Preview'}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {lang === 'bn' ? activeStyle.descBn : activeStyle.descEn}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sky-300 font-mono text-xs">
                    {lang === 'bn' ? 'স্ট্যান্ডার্ড উচ্চতা:' : 'Standard Height:'} {railingHeight}&quot; ({Math.round(railingHeight * 25.4)}mm)
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono">
                    {lang === 'bn' ? 'পোস্ট স্পেসিং:' : 'Post Spacing:'} {postSpacing}&quot; C/C
                  </div>
                </div>
              </div>
            </div>

            {/* Quick 10-Style Image Thumbnail Strip for fast browsing */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
              <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">
                {lang === 'bn' ? 'অন্যান্য স্টাইলের ছবি:' : 'More Styles:'}
              </span>
              {RAILING_STYLES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStyleId(st.id)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border transition-all relative ${
                    selectedStyleId === st.id
                      ? 'border-sky-400 ring-2 ring-sky-400 scale-105 shadow'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                  title={st.nameEn}
                >
                  <img
                    src={RAILING_PREVIEW_IMAGES[st.id]}
                    alt={st.nameEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <span className="absolute bottom-0.5 right-1 text-[9px] text-white font-bold">
                    {st.iconEmoji}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* 3D CAD or Elevation Viewport */
          <div className="flex justify-center items-center">
            {renderRailingSVG()}
          </div>
        )}

        {/* Status / Output Footer */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-emerald-400 text-[11px]">
            {isDrawing
              ? `>>> EVL-Railing: Extruding ${lang === 'bn' ? activeStyle.nameBn : activeStyle.nameEn} along path (${drawProgress}%)...`
              : `>>> EVL-Railing: ${lang === 'bn' ? activeStyle.nameBn : activeStyle.nameEn} | Mode: ${
                  drawingMethod === 'click' ? 'Click-by-Click Draw' : 'Selected Line Extrude'
                } | Height: ${railingHeight}" | Post Spacing: ${postSpacing}" C/C`}
          </span>
          <span className="text-[11px] text-slate-500">
            {lang === 'bn'
              ? 'স্কেচআপে ক্লিক করে করে অথবা লাইন সিলেক্ট করে ৩ডি রেলিং তৈরি করুন'
              : 'Support both Click-to-Draw and Select-Line modes in Trimble SketchUp'}
          </span>
        </div>
      </div>

      {/* 5. PARAMETER CONTROLS: Height & Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
        {/* Railing Height */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-300 font-medium">
            <label htmlFor="height-select">{t.railingHeight}</label>
            <span className="text-sky-400 font-mono font-bold">
              {railingHeight}&quot; ({Math.round(railingHeight * 25.4)} mm)
            </span>
          </div>
          <div className="flex gap-2">
            {[36, 42, 48].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setRailingHeight(h)}
                className={`flex-1 py-1 px-2 rounded border text-center transition-colors ${
                  railingHeight === h
                    ? 'bg-sky-600 border-sky-400 text-white font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {h}&quot; {h === 42 ? '(Code Std)' : h === 36 ? '(Low)' : '(High)'}
              </button>
            ))}
          </div>
        </div>

        {/* Post Spacing */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-300 font-medium">
            <label htmlFor="spacing-select">{t.postSpacing}</label>
            <span className="text-sky-400 font-mono font-bold">
              {postSpacing}&quot; ({Math.round(postSpacing * 2.54)} cm)
            </span>
          </div>
          <div className="flex gap-2">
            {[36, 48, 60].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPostSpacing(s)}
                className={`flex-1 py-1 px-2 rounded border text-center transition-colors ${
                  postSpacing === s
                    ? 'bg-sky-600 border-sky-400 text-white font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {s}&quot; ({Math.round(s / 12)}ft)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. SKETCHUP WORKFLOW GUIDE (২টি অপশনের স্পষ্ট ব্যাখ্যা) */}
      <div className="bg-slate-900/60 p-3.5 rounded-xl border border-sky-800/40 text-xs space-y-2">
        <div className="flex items-center gap-2 text-sky-400 font-bold">
          <Info className="w-4 h-4 text-sky-400" />
          <span>
            {lang === 'bn'
              ? 'স্কেচআপে EVL-Railing ব্যবহারের ২টি প্রমাণিত পদ্ধতি:'
              : 'Two Verified Drawing Methods in Trimble SketchUp EVL-Railing:'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 text-[11px] leading-relaxed">
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">
              {lang === 'bn' ? '👉 অপশন ১: ক্লিক করে করে ম্যানুয়ালি ড্র (Interactive Click Tool)' : '👉 Option 1: Interactive Click Tool'}
            </span>
            <span>
              {lang === 'bn'
                ? 'স্কেচআপের ডায়ালগে "Interactive Click-by-Click Tool" ক্লিক করুন। ৩ডি ভিউপোর্টে সরাসরি ক্লিক করে করে পয়েন্ট দিন (Point 1 ➜ Point 2 ➜ Point 3...)। কাজ শেষ হলে ডাবল-ক্লিক করলেই তাৎক্ষণিক ৩ডি সলিড রেলিং তৈরি হবে।'
                : 'Click "Interactive Click-by-Click Tool" in SketchUp. Pick points directly in the 3D viewport. Double-click to finalize solid 3D railing generation.'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-sky-400 font-bold block mb-1">
              {lang === 'bn' ? '📐 অপশন ২: আগে থেকে থাকা লাইন সিলেক্ট করে ড্র' : '📐 Option 2: Build Along Selected Lines'}
            </span>
            <span>
              {lang === 'bn'
                ? 'সিঁড়ি, টেরাস বা বারান্দার যেকোনো লাইন সিলেক্ট করে ডায়ালগে "Build on Selected Path" চাপুন। ১০টি স্টাইলের প্রতিটিতেই ফুল ৩ডি সলিড পোস্ট, হ্যান্ডরেল এবং গ্লাস/কেবল তৈরি হবে।'
                : 'Select any existing line/edge in your SketchUp model, pick a style and click "Build on Selected Path" for instant 3D solid geometry extrusion.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
