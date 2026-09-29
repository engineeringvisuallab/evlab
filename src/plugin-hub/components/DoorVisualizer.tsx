import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  CheckCircle2,
  Check,
  Info,
  RotateCcw,
  Sliders,
  Eye,
  Maximize2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Language } from '../types';
import { PLUGINS_DATA } from '../data/plugins';
import { triggerPluginDownload } from '../utils/fileDownloader';

export interface DoorStyleItem {
  id: string;
  nameBn: string;
  nameEn: string;
  tagBn: string;
  tagEn: string;
  iconEmoji: string;
  type:
    | 'teak_main'
    | 'panel2'
    | 'cnc_flush'
    | 'pivot'
    | 'french_double'
    | 'barn_sliding'
    | 'louver_utility'
    | 'pvc_toilet'
    | 'fire_exit'
    | 'bifold';
  descBn: string;
  descEn: string;
  materialBn: string;
  materialEn: string;
  defaultW: number; // inches
  defaultH: number; // inches
  frameTypeBn: string;
  frameTypeEn: string;
  colorBase: string;
  colorTrim: string;
  colorHardware: string;
}

export const DOOR_STYLES_LIST: DoorStyleItem[] = [
  {
    id: 'door-1',
    nameBn: '১. সলিড সেগুন কাঠের মেইন এন্ট্রান্স ডোর',
    nameEn: '1. Solid Teak Main Entrance Door',
    tagBn: 'আভিজাত্য ও রাজকীয়',
    tagEn: 'Luxury & Grand Entrance',
    iconEmoji: '🚪',
    type: 'teak_main',
    descBn: '৩"x২.৫" সেগুন কাঠের চৌকাঠ (১.৫" রিবেট সহ), ৪টি খোদাই করা ৩ডি রেইজড প্যানেল ও প্রিমিয়াম ব্রাস হ্যান্ডেল এবং সিংহ নকশার নকার।',
    descEn: 'Authentic 3"x2.5" teak chowkat with 1.5" rebate, 4 genuine 3D raised field panels with beveled mouldings, heavy brass mortise lockset & ornate door knocker.',
    materialBn: 'বার্মা টিক উড গ্লসি পলিশ + ব্রাস হার্ডওয়্যার',
    materialEn: 'Burmese Teak Hardwood + Polished Brass',
    defaultW: 42,
    defaultH: 84,
    frameTypeBn: '৩"x২.৫" সলিড সেগুন চৌকাঠ (১.৫"x০.৫" রিবেট)',
    frameTypeEn: '3"x2.5" Solid Timber Chowkat (1.5"x0.5" Rebate)',
    colorBase: '#92400e',
    colorTrim: '#78350f',
    colorHardware: '#eab308',
  },
  {
    id: 'door-2',
    nameBn: '২. ২-প্যানেল রেইজড টিম্বার বেডরুম ডোর',
    nameEn: '2. 2-Panel Raised Timber Bedroom Door',
    tagBn: 'বেডরুম স্ট্যান্ডার্ড',
    tagEn: 'Bedroom Standard',
    iconEmoji: '🛏️',
    type: 'panel2',
    descBn: 'ক্লাসিক দুটি উঁচু খোদাই করা আয়তাকার প্যানেল ও শ্যাডো রিভিল। মেহগনি উড ফিনিশ ও সাটিন ক্রোম লিভার হ্যান্ডেল।',
    descEn: 'Classic two-panel raised profile design with shadow reveal, solid core mahogany timber, and satin chrome lever handle set.',
    materialBn: 'মেহগনি উড সেমি-ম্যাট পলিশ + ক্রোম',
    materialEn: 'Mahogany Semi-Matte + Satin Chrome',
    defaultW: 36,
    defaultH: 84,
    frameTypeBn: 'স্ট্যান্ডার্ড রিবেটেড কাঠের চৌকাঠ',
    frameTypeEn: 'Standard Rebated Timber Chowkat',
    colorBase: '#7c2d12',
    colorTrim: '#581c87',
    colorHardware: '#cbd5e1',
  },
  {
    id: 'door-3',
    nameBn: '৩. ফ্ল্যাশ ডোর উইথ সিএনসি ভি-গ্রুভ ও এসএস ইনলে',
    nameEn: '3. Flush Door with CNC V-Groove Pattern',
    tagBn: 'মডার্ন মিনিমালিস্ট',
    tagEn: 'Modern Minimalist',
    iconEmoji: '✨',
    type: 'cnc_flush',
    descBn: 'ওয়ালনাট উডের ওপর ৫টি ৩ডি সিএনসি ভি-গ্রুভ রেখা, খাঁটি ব্রাশড স্টেইনলেস স্টিল ভার্টিক্যাল স্ট্রিপ ও ৩৬" লম্বা এসএস বার হ্যান্ডেল।',
    descEn: 'Precision CNC routered horizontal V-grooves carved into rich American walnut, 0.5" SS inlay strip, and 36" architectural vertical pull bar.',
    materialBn: 'ওয়ালনাট উড + ব্রাশড এসএস ইনলে',
    materialEn: 'American Walnut + Brushed SS Inlay',
    defaultW: 36,
    defaultH: 84,
    frameTypeBn: 'স্লিম আর্কিট্রেভ রিবেটেড চৌকাঠ',
    frameTypeEn: 'Slim Architrave Rebated Frame',
    colorBase: '#451a03',
    colorTrim: '#292524',
    colorHardware: '#f8fafc',
  },
  {
    id: 'door-4',
    nameBn: '৪. মডার্ন লাক্সারি পিভট এন্ট্রান্স ডোর (৪৮" চওড়া)',
    nameEn: '4. Modern Luxury Pivot Entrance Door (48" Wide)',
    tagBn: '৪ ফুট চওড়া পিভট',
    tagEn: '48" Floor Pivot',
    iconEmoji: '💎',
    type: 'pivot',
    descBn: 'ফ্লোর পিভট বিয়ারিংয়ে ঘোরানো বিশাল ৪৮" একক পাল্লা। ডার্ক ওক কাঠ ও ৬০" লম্বা স্টেইনলেস স্টিল সিলিন্ড্রিক্যাল পুল হ্যান্ডেল।',
    descEn: 'Oversized 48" architectural door rotating on concealed heavy-duty floor-spring pivot hardware with 60" tall round SS pull handle.',
    materialBn: 'চারকোল ডার্ক ওক + স্টেইনলেস স্টিল পিভট',
    materialEn: 'Charcoal Dark Oak + SS Floor Pivot',
    defaultW: 48,
    defaultH: 96,
    frameTypeBn: 'হেভি-ডিউটি কনসিল্ড পিভট ফ্রেম',
    frameTypeEn: 'Heavy-Duty Concealed Pivot Frame',
    colorBase: '#18181b',
    colorTrim: '#27272a',
    colorHardware: '#e2e8f0',
  },
  {
    id: 'door-5',
    nameBn: '৫. ফ্রেঞ্চ ডাবল গ্লাস ব্যালকনি ডোর',
    nameEn: '5. French Double Glass Balcony Door',
    tagBn: 'উন্মুক্ত আলো ও বাতাস',
    tagEn: 'Full Glass Elegance',
    iconEmoji: '🪟',
    type: 'french_double',
    descBn: 'মাঝে স্বচ্ছ গ্লাস প্যানেল ও কাঠের মান্টিন গ্রিড সহ ডাবল পাল্লা। সেন্ট্রাল অ্যাস্ট্রাগাল ও ডুয়াল ব্রাস নব।',
    descEn: 'Twin swing wooden stiles framing clear tempered safety glass lites with authentic 6-lite muntin grids and center astragal.',
    materialBn: 'হোয়াইট পলিশ ফ্রেম + টেম্পার্ড গ্লাস + ব্রাস',
    materialEn: 'White Polish Frame + Tempered Glass + Brass',
    defaultW: 60,
    defaultH: 84,
    frameTypeBn: 'ডাবল রিবেট ফ্রেঞ্চ চৌকাঠ',
    frameTypeEn: 'Double Rebated French Chowkat',
    colorBase: '#f8fafc',
    colorTrim: '#e2e8f0',
    colorHardware: '#ca8a04',
  },
  {
    id: 'door-6',
    nameBn: '৬. স্লাইডিং বার্ন ডোর (এক্সপোজড ট্র্যাক ও হুইল)',
    nameEn: '6. Sliding Barn Door with Black Steel Track',
    tagBn: 'জায়গা সাশ্রয়ী',
    tagEn: 'Space-Saving Track',
    iconEmoji: '🚜',
    type: 'barn_sliding',
    descBn: 'দেওয়ালের বাইরে ব্ল্যাক স্টিল ট্র্যাকে মসৃণভাবে গড়িয়ে চলা কাঠের দরজা। ডায়াগোনাল Z-ব্রেস ও স্পোকড ট্রলি হুইল।',
    descEn: 'Overhead exposed heavy flat black steel rail track, 2 spoked rolling pulley wheel hangers, and diagonal Z-brace timber battens.',
    materialBn: 'রাস্টিক পাইন উড + ব্ল্যাক স্টিল হার্ডওয়্যার',
    materialEn: 'Rustic Pine Wood + Black Steel Hardware',
    defaultW: 38,
    defaultH: 86,
    frameTypeBn: 'টপ-মাউন্টেড স্টিল হ্যাঙ্গার ট্র্যাক',
    frameTypeEn: 'Top-Mounted Steel Hanger Track',
    colorBase: '#a16207',
    colorTrim: '#713f12',
    colorHardware: '#0f172a',
  },
  {
    id: 'door-7',
    nameBn: '৭. লুভার্ড কাঠের ইউটিলিটি/ক্লোজেট ডোর',
    nameEn: '7. Louvered Timber Utility & Closet Door',
    tagBn: 'সার্বক্ষণিক ভেন্টিলেশন',
    tagEn: 'Continuous Ventilation',
    iconEmoji: '🧺',
    type: 'louver_utility',
    descBn: 'কাঠের ৪৫ ডিগ্রি ১৮টি লুভার ব্লেড যা বন্ধ থাকা অবস্থাতেও ওয়ারড্রোব ও স্টোর রুমের ভেতরে বাতাস সঞ্চালন সচল রাখে।',
    descEn: '18 precision 3D angled wooden louver blades (45° tilt) allowing continuous passive ventilation for pantries and utility rooms.',
    materialBn: 'ন্যাচারাল টিক উড ব্লেডস + এসএস নব',
    materialEn: 'Natural Teak Blades + SS Knob',
    defaultW: 32,
    defaultH: 84,
    frameTypeBn: 'ভেন্টিলেটেড লুভার ফ্রেম চৌকাঠ',
    frameTypeEn: 'Ventilated Louver Frame Chowkat',
    colorBase: '#b45309',
    colorTrim: '#854d0e',
    colorHardware: '#cbd5e1',
  },
  {
    id: 'door-8',
    nameBn: '৮. ওয়াটারপ্রুফ ইউপিভিসি/পিভিসি বাথরুম ডোর',
    nameEn: '8. Waterproof UPVC/PVC Bathroom Door',
    tagBn: '১০০% পানিনিরোধক',
    tagEn: '100% Water-Resistant',
    iconEmoji: '🚿',
    type: 'pvc_toilet',
    descBn: 'বাথরুমের জন্য সম্পূর্ণ পানিনিরোধক পলিমার ডোর যার নিচে ক্ষুদ্র এয়ার ভেন্ট গ্রিল এবং স্টেইনলেস সিলিন্ড্রিক্যাল লক রয়েছে।',
    descEn: 'Moisture-proof solid polymer door with bottom horizontal ventilation slot louvers and stainless steel thumb-turn privacy lock.',
    materialBn: 'আইভরি ইউপিভিসি উডগ্রেন + এসএস লক',
    materialEn: 'Ivory UPVC Woodgrain + SS Lockset',
    defaultW: 30,
    defaultH: 84,
    frameTypeBn: 'ইউপিভিসি ওয়াটারপ্রুফ ফ্রেম',
    frameTypeEn: 'UPVC Waterproof Chowkat',
    colorBase: '#f1f5f9',
    colorTrim: '#e2e8f0',
    colorHardware: '#64748b',
  },
  {
    id: 'door-9',
    nameBn: '৯. স্টিল ফায়ার এক্সিট সিকিউরিটি ডোর (প্যানিক বার)',
    nameEn: '9. Commercial Steel Fire Exit Panic Door',
    tagBn: 'জরুরি নির্গমন প্যানিক বার',
    tagEn: 'Panic Push Bar (2-Hr Rated)',
    iconEmoji: '🚨',
    type: 'fire_exit',
    descBn: 'জরুরি অবস্থায় হাত দিয়ে চাপলেই খুলে যাওয়া অনুভূমিক পুশ-বার, ভিশন ওয়্যার-গ্লাস উইন্ডো ও ওভারহেড ডোর ক্লোজার সহ ফায়ার ডোর।',
    descEn: '16-gauge heavy steel leaf fitted with horizontal red/SS panic exit push-bar, narrow vision wire-glass lite, and overhead automatic closer.',
    materialBn: 'ইন্ডাস্ট্রিয়াল কোল্ড-রোল্ড স্টিল + রেড প্যানিক বার',
    materialEn: 'Industrial Steel + Red Emergency Panic Bar',
    defaultW: 40,
    defaultH: 84,
    frameTypeBn: '১৬-গেজ ফোল্ডেড স্টিল চৌকাঠ',
    frameTypeEn: '16-Gauge Folded Steel Frame',
    colorBase: '#475569',
    colorTrim: '#334155',
    colorHardware: '#dc2626',
  },
  {
    id: 'door-10',
    nameBn: '১০. বাই-ফোল্ড ৪-লিফ ফোল্ডিং পার্টিশন ডোর',
    nameEn: '10. Bi-Fold 4-Leaf Folding Room Partition',
    tagBn: 'রুম ডিভাইডার',
    tagEn: 'Folding Accordion Style',
    iconEmoji: '↔️',
    type: 'bifold',
    descBn: 'চারটি পাল্লা অ্যাকর্ডিয়নের মতো একপাশে ভাজ হয়ে জমে যাওয়া পার্টিশন ডোর। ড্রয়িং ও ডাইনিং আলাদা করতে অনন্য।',
    descEn: 'Four-panel accordion folding system on smooth top guide track with pivot rollers and flush pulls to open up living spaces.',
    materialBn: 'ডার্ক মেহগনি পলিশ ও গ্লাস ইনসেট',
    materialEn: 'Dark Mahogany Polish + Glass Inset',
    defaultW: 96,
    defaultH: 84,
    frameTypeBn: 'টপ-রানিং কনসিল্ড ফোল্ডিং ট্র্যাক',
    frameTypeEn: 'Top-Running Concealed Track',
    colorBase: '#581c87',
    colorTrim: '#3b0764',
    colorHardware: '#e2e8f0',
  },
];

interface DoorVisualizerProps {
  lang: Language;
}

export const DoorVisualizer: React.FC<DoorVisualizerProps> = ({ lang }) => {
  const [selectedDoorId, setSelectedDoorId] = useState<string>('door-1');
  const [doorWidth, setDoorWidth] = useState<number>(42);
  const [doorHeight, setDoorHeight] = useState<number>(84);
  const [frameDepth, setFrameDepth] = useState<number>(5.0); // 5 inches
  const [swingAngle, setSwingAngle] = useState<number>(35); // 0 to 90 degrees
  const [viewPreset, setViewPreset] = useState<'3d_iso' | 'front_elev' | 'plan_swing' | 'rebate_detail'>('3d_iso');
  const [isAutoSwinging, setIsAutoSwinging] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // 3D Orbit angles
  const [orbitYaw, setOrbitYaw] = useState<number>(25); // degrees
  const [orbitPitch, setOrbitPitch] = useState<number>(15); // degrees
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number }>({
    x: 0,
    y: 0,
    yaw: 25,
    pitch: 15,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeDoor = DOOR_STYLES_LIST.find((d) => d.id === selectedDoorId) || DOOR_STYLES_LIST[0];

  // Auto-swing animation loop
  useEffect(() => {
    let animId: number;
    let forward = true;
    if (isAutoSwinging) {
      const step = () => {
        setSwingAngle((prev) => {
          if (prev >= 85) forward = false;
          if (prev <= 5) forward = true;
          return forward ? prev + 1.2 : prev - 1.2;
        });
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isAutoSwinging]);

  // Handle Preset Switching
  const handleSetPreset = (preset: '3d_iso' | 'front_elev' | 'plan_swing' | 'rebate_detail') => {
    setViewPreset(preset);
    if (preset === '3d_iso') {
      setOrbitYaw(28);
      setOrbitPitch(16);
    } else if (preset === 'front_elev') {
      setOrbitYaw(0);
      setOrbitPitch(0);
    } else if (preset === 'plan_swing') {
      setOrbitYaw(0);
      setOrbitPitch(85);
    } else if (preset === 'rebate_detail') {
      setOrbitYaw(55);
      setOrbitPitch(20);
    }
  };

  // Mouse Orbit Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: orbitYaw,
      pitch: orbitPitch,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const newYaw = (dragStartRef.current.yaw + dx * 0.45) % 360;
    const newPitch = Math.max(-20, Math.min(85, dragStartRef.current.pitch + dy * 0.35));
    setOrbitYaw(newYaw);
    setOrbitPitch(newPitch);
    setViewPreset('3d_iso');
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // -------------------------------------------------------------------------
  // HIGH-FIDELITY 3D CANVAS RENDERING
  // -------------------------------------------------------------------------
  const render3DDoor = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Camera 3D projection parameters
    const cx = width / 2;
    const cy = height / 2 + 10;
    const scale = Math.min(width, height) / 115; // pixels per inch

    const radYaw = (orbitYaw * Math.PI) / 180;
    const radPitch = (orbitPitch * Math.PI) / 180;

    // 3D Point Projector
    const project = (x: number, y: number, z: number) => {
      // 1. Center geometry at door base
      const rx0 = x - doorWidth / 2;
      const ry0 = y; // y is wall depth (0 to 5 inches)
      const rz0 = z; // z is vertical elevation (0 to 84 inches)

      // 2. Rotate around Z (Yaw)
      const x1 = rx0 * Math.cos(radYaw) - ry0 * Math.sin(radYaw);
      const y1 = rx0 * Math.sin(radYaw) + ry0 * Math.cos(radYaw);
      const z1 = rz0;

      // 3. Rotate around X (Pitch)
      const y2 = y1 * Math.cos(radPitch) - z1 * Math.sin(radPitch);
      const z2 = y1 * Math.sin(radPitch) + z1 * Math.cos(radPitch);

      // 4. Perspective Projection
      const fov = 350;
      const cameraDist = 180;
      const dist = cameraDist - y2;
      const factor = (fov / Math.max(20, dist)) * (scale / 4.2);

      return {
        px: cx + x1 * factor,
        py: cy - z2 * factor + 50,
        depth: y2,
      };
    };

    // Helper: Draw 3D Polygon with Flat/Ambient Shading
    const drawPolygon = (
      points3D: Array<[number, number, number]>,
      fillColor: string,
      strokeColor = '#1e293b',
      strokeWidth = 1,
    ) => {
      const pts2D = points3D.map(([x, y, z]) => project(x, y, z));
      ctx.beginPath();
      ctx.moveTo(pts2D[0].px, pts2D[0].py);
      for (let i = 1; i < pts2D.length; i++) {
        ctx.lineTo(pts2D[i].px, pts2D[i].py);
      }
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      if (strokeWidth > 0) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }
    };

    // Helper: Draw 3D Box (Hexahedron)
    const drawBox = (
      x: number,
      y: number,
      z: number,
      dx: number,
      dy: number,
      dz: number,
      color: string,
      border = '#0f172a',
    ) => {
      // 6 faces with light and shadow shading
      // Top face (+Z)
      drawPolygon(
        [
          [x, y, z + dz],
          [x + dx, y, z + dz],
          [x + dx, y + dy, z + dz],
          [x, y + dy, z + dz],
        ],
        adjustBrightness(color, 25),
        border,
      );
      // Front face (+Y)
      drawPolygon(
        [
          [x, y + dy, z],
          [x + dx, y + dy, z],
          [x + dx, y + dy, z + dz],
          [x, y + dy, z + dz],
        ],
        adjustBrightness(color, 10),
        border,
      );
      // Back face (-Y)
      drawPolygon(
        [
          [x, y, z],
          [x + dx, y, z],
          [x + dx, y, z + dz],
          [x, y, z + dz],
        ],
        adjustBrightness(color, -25),
        border,
      );
      // Left face (-X)
      drawPolygon(
        [
          [x, y, z],
          [x, y + dy, z],
          [x, y + dy, z + dz],
          [x, y, z + dz],
        ],
        adjustBrightness(color, -10),
        border,
      );
      // Right face (+X)
      drawPolygon(
        [
          [x + dx, y, z],
          [x + dx, y + dy, z],
          [x + dx, y + dy, z + dz],
          [x + dx, y, z + dz],
        ],
        adjustBrightness(color, 5),
        border,
      );
    };

    // Color utility for 3D directional lighting
    function adjustBrightness(hex: string, percent: number) {
      if (!hex.startsWith('#')) return hex;
      let num = parseInt(hex.slice(1), 16);
      if (hex.length === 4) {
        // #RGB
        const r = (num >> 8) & 0xf;
        const g = (num >> 4) & 0xf;
        const b = num & 0xf;
        num = (r << 20) | (r << 16) | (g << 12) | (g << 8) | (b << 4) | b;
      }
      let r = (num >> 16) + Math.round((255 * percent) / 100);
      let g = ((num >> 8) & 0x00ff) + Math.round((255 * percent) / 100);
      let b = (num & 0x0000ff) + Math.round((255 * percent) / 100);
      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
      return `rgb(${r},${g},${b})`;
    }

    // -----------------------------------------------------------------------
    // 1. FLOOR GRID & SURROUNDING WALL OPENING (Gray Masonry)
    // -----------------------------------------------------------------------
    const fw = 2.5; // Frame Face Width = 2.5"
    const fd = frameDepth; // Frame Depth = 5.0"
    const rw = 0.5; // Rebate Width = 0.5"
    const rd = 1.5; // Rebate Depth = 1.5" (Door Shutter Thickness)

    // Floor Base Shadow
    drawPolygon(
      [
        [-8, -8, 0],
        [doorWidth + 8, -8, 0],
        [doorWidth + 8, fd + 28, 0],
        [-8, fd + 28, 0],
      ],
      '#0b1329',
      '#1e293b',
      1,
    );

    // 2D Floor Swing Arc (Architectural 90° Arc in 05_DOORS Tag)
    const arcRadius = doorWidth - (fw - rw) * 2;
    const hingeX = fw - rw;
    const hingeY = fd - rd;

    ctx.save();
    ctx.strokeStyle = '#a855f7'; // Purple 05_DOORS
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let a = 0; a <= 90; a += 5) {
      const rad = (a * Math.PI) / 180;
      const ax = hingeX + arcRadius * Math.cos(rad);
      const ay = hingeY - arcRadius * Math.sin(rad);
      const p = project(ax, ay, 0.2);
      if (a === 0) ctx.moveTo(p.px, p.py);
      else ctx.lineTo(p.px, p.py);
    }
    ctx.stroke();

    // Floor Swing Radial Line (current door angle)
    const curRad = (swingAngle * Math.PI) / 180;
    const curX = hingeX + arcRadius * Math.cos(curRad);
    const curY = hingeY - arcRadius * Math.sin(curRad);
    const pStart = project(hingeX, hingeY, 0.2);
    const pEnd = project(curX, curY, 0.2);
    ctx.setLineDash([]);
    ctx.strokeStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(pStart.px, pStart.py);
    ctx.lineTo(pEnd.px, pEnd.py);
    ctx.stroke();
    ctx.restore();

    // -----------------------------------------------------------------------
    // 2. AUTHENTIC CHOWKAT TIMBER FRAME WITH 1.5" REBATE (L-Shape Profile)
    // -----------------------------------------------------------------------
    const frameCol = activeDoor.colorTrim;

    // Left Post (L-shaped cross section with 1.5"x0.5" rebate)
    drawBox(0, 0, 0, fw, fd - rd, doorHeight, frameCol); // outer body
    drawBox(0, fd - rd, 0, fw - rw, rd, doorHeight, adjustBrightness(frameCol, -10)); // inner rebate step

    // Right Post (Mirrored L-shape)
    drawBox(doorWidth - fw, 0, 0, fw, fd - rd, doorHeight, frameCol);
    drawBox(doorWidth - fw + rw, fd - rd, 0, fw - rw, rd, doorHeight, adjustBrightness(frameCol, -10));

    // Top Head Chowkat Frame
    drawBox(0, 0, doorHeight - fw, doorWidth, fd, fw, adjustBrightness(frameCol, 15));

    // 3 Butt Hinges on Left Post
    const hingeCol = activeDoor.colorHardware;
    [doorHeight - 10, doorHeight / 2, 10].forEach((hz) => {
      drawBox(fw - rw - 0.2, fd - rd - 0.2, hz - 2.5, 0.4, 0.4, 5, hingeCol);
    });

    // -----------------------------------------------------------------------
    // 3. DOOR SHUTTER LEAF (Pal-la) WITH ROTATION AROUND HINGE AXIS
    // -----------------------------------------------------------------------
    const shutterW = doorWidth - (fw - rw) * 2;
    const shutterH = doorHeight - fw + 0.5;
    const shutterThick = 1.5;
    const leafColor = activeDoor.colorBase;

    // Transform points rotating around (hingeX, hingeY)
    const rotateLeafPoint = (lx: number, ly: number, lz: number) => {
      // lx relative to leaf hinge (0 to shutterW)
      // ly relative to leaf face (0 to shutterThick)
      const rad = (-swingAngle * Math.PI) / 180;
      const rx = lx * Math.cos(rad) - ly * Math.sin(rad);
      const ry = lx * Math.sin(rad) + ly * Math.cos(rad);
      return project(hingeX + rx, hingeY + ry, lz);
    };

    // Draw rotated box for shutter leaf
    const drawRotatedBox = (
      lx: number,
      ly: number,
      lz: number,
      ldx: number,
      ldy: number,
      ldz: number,
      color: string,
    ) => {
      const c = color;
      // Front face
      const p1 = rotateLeafPoint(lx, ly + ldy, lz);
      const p2 = rotateLeafPoint(lx + ldx, ly + ldy, lz);
      const p3 = rotateLeafPoint(lx + ldx, ly + ldy, lz + ldz);
      const p4 = rotateLeafPoint(lx, ly + ldy, lz + ldz);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.lineTo(p3.px, p3.py);
      ctx.lineTo(p4.px, p4.py);
      ctx.closePath();
      ctx.fillStyle = adjustBrightness(c, 10);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();

      // Top face
      const t1 = rotateLeafPoint(lx, ly, lz + ldz);
      const t2 = rotateLeafPoint(lx + ldx, ly, lz + ldz);
      const t3 = rotateLeafPoint(lx + ldx, ly + ldy, lz + ldz);
      const t4 = rotateLeafPoint(lx, ly + ldy, lz + ldz);
      ctx.beginPath();
      ctx.moveTo(t1.px, t1.py);
      ctx.lineTo(t2.px, t2.py);
      ctx.lineTo(t3.px, t3.py);
      ctx.lineTo(t4.px, t4.py);
      ctx.closePath();
      ctx.fillStyle = adjustBrightness(c, 25);
      ctx.fill();
      ctx.stroke();

      // Opening End Edge (Latch side)
      const e1 = rotateLeafPoint(lx + ldx, ly, lz);
      const e2 = rotateLeafPoint(lx + ldx, ly + ldy, lz);
      const e3 = rotateLeafPoint(lx + ldx, ly + ldy, lz + ldz);
      const e4 = rotateLeafPoint(lx + ldx, ly, lz + ldz);
      ctx.beginPath();
      ctx.moveTo(e1.px, e1.py);
      ctx.lineTo(e2.px, e2.py);
      ctx.lineTo(e3.px, e3.py);
      ctx.lineTo(e4.px, e4.py);
      ctx.closePath();
      ctx.fillStyle = adjustBrightness(c, -15);
      ctx.fill();
      ctx.stroke();
    };

    // Draw main leaf slab
    drawRotatedBox(0, 0, 0, shutterW, shutterThick, shutterH, leafColor);

    // Latch Bolt popping out on open edge
    if (swingAngle > 10) {
      drawRotatedBox(shutterW, 0.4, 38, 0.8, 0.7, 1.2, '#f8fafc');
    }

    // -----------------------------------------------------------------------
    // 4. STYLE-SPECIFIC AUTHENTIC 3D DETAILS ON LEAF FACE
    // -----------------------------------------------------------------------
    switch (activeDoor.type) {
      case 'teak_main': {
        // 4 Raised Beveled Field Panels
        const pw = (shutterW - 10) / 2;
        const phTop = 26;
        const phBot = 32;
        const panels = [
          [3.5, shutterH - 32, pw, phTop],
          [shutterW - 3.5 - pw, shutterH - 32, pw, phTop],
          [3.5, 6, pw, phBot],
          [shutterW - 3.5 - pw, 6, pw, phBot],
        ];
        panels.forEach(([px, pz, p_w, p_h]) => {
          drawRotatedBox(px, shutterThick, pz, p_w, 0.35, p_h, adjustBrightness(leafColor, -12));
          drawRotatedBox(px + 1.2, shutterThick + 0.3, pz + 1.2, p_w - 2.4, 0.25, p_h - 2.4, adjustBrightness(leafColor, 12));
        });

        // Heavy Brass Backplate Handle & Lever
        drawRotatedBox(shutterW - 4.5, shutterThick + 0.1, 34, 2.2, 0.3, 10, '#ca8a04');
        drawRotatedBox(shutterW - 7, shutterThick + 0.4, 38, 3.5, 0.6, 0.8, '#facc15');

        // Ornate Brass Door Knocker
        drawRotatedBox(shutterW / 2 - 1.5, shutterThick + 0.2, shutterH - 24, 3, 0.4, 3, '#facc15');
        break;
      }

      case 'panel2': {
        // Classic 2 Raised Panels
        const pw = shutterW - 8;
        drawRotatedBox(4, shutterThick, shutterH - 32, pw, 0.3, 26, adjustBrightness(leafColor, -10));
        drawRotatedBox(4, shutterThick, 6, pw, 0.3, 38, adjustBrightness(leafColor, -10));
        // Chrome Lever Handle
        drawRotatedBox(shutterW - 4.2, shutterThick + 0.1, 36, 1.8, 0.3, 5, '#cbd5e1');
        drawRotatedBox(shutterW - 6.5, shutterThick + 0.4, 38, 3.2, 0.5, 0.8, '#f8fafc');
        break;
      }

      case 'cnc_flush': {
        // 5 Horizontal CNC Routered V-Grooves
        for (let i = 0; i < 5; i++) {
          const gz = 16 + i * 14;
          drawRotatedBox(2, shutterThick + 0.05, gz, shutterW - 4, 0.15, 0.8, '#1c1917');
        }
        // Brushed SS Vertical Inlay Strip
        drawRotatedBox(shutterW - 7, shutterThick + 0.1, 0, 0.6, 0.15, shutterH, '#f8fafc');
        // 36" Tall Square Bar Handle
        drawRotatedBox(shutterW - 4.5, shutterThick + 0.8, 24, 0.8, 0.8, 36, '#e2e8f0');
        break;
      }

      case 'pivot': {
        // Floor Pivot Mechanism Box & 60" Tall Handle
        drawRotatedBox(shutterW - 5.5, shutterThick + 1.2, 18, 1.0, 1.0, 60, '#f8fafc');
        break;
      }

      case 'french_double': {
        // Full Clear Glass Pane with Muntins
        drawRotatedBox(4, 0.2, 8, shutterW - 8, 0.3, shutterH - 16, '#38bdf8');
        // Wooden Muntin grid
        drawRotatedBox(shutterW / 2 - 0.5, 0.3, 8, 1.0, 0.4, shutterH - 16, '#f8fafc');
        drawRotatedBox(4, 0.3, shutterH / 2 - 0.5, shutterW - 8, 0.4, 1.0, '#f8fafc');
        // Dual Brass Knobs
        drawRotatedBox(shutterW - 3, shutterThick + 0.2, 38, 1.5, 1.2, 1.5, '#ca8a04');
        break;
      }

      case 'barn_sliding': {
        // Top Steel Rail and Wheels
        drawBox(-4, -1.5, doorHeight + 2, doorWidth + 14, 0.4, 2.5, '#0f172a');
        drawBox(6, -1.2, doorHeight + 4, 2.5, 0.5, 2.5, '#475569');
        drawBox(doorWidth - 10, -1.2, doorHeight + 4, 2.5, 0.5, 2.5, '#475569');
        // Diagonal Timber Z-Brace
        drawRotatedBox(3, shutterThick + 0.1, 3, shutterW - 6, 0.35, 4, adjustBrightness(leafColor, -15));
        drawRotatedBox(3, shutterThick + 0.1, shutterH - 7, shutterW - 6, 0.35, 4, adjustBrightness(leafColor, -15));
        // Flush Cup Handle
        drawRotatedBox(shutterW - 4, shutterThick + 0.05, 36, 1.5, 0.2, 4, '#0f172a');
        break;
      }

      case 'louver_utility': {
        // 16 Real 3D Angled Louver Blades
        for (let i = 0; i < 14; i++) {
          const lz = 8 + i * 4.8;
          drawRotatedBox(3.5, 0.2, lz, shutterW - 7, 1.0, 2.2, adjustBrightness(leafColor, 8));
        }
        drawRotatedBox(shutterW - 3.5, shutterThick + 0.1, 38, 1.2, 0.8, 1.2, '#f8fafc');
        break;
      }

      case 'pvc_toilet': {
        // PVC Molded Panel & Bottom Ventilation Louver Grill
        drawRotatedBox(4, shutterThick + 0.1, 24, shutterW - 8, 0.2, shutterH - 30, '#e2e8f0');
        // Bottom Vent Slots
        for (let i = 0; i < 5; i++) {
          drawRotatedBox(6, shutterThick + 0.15, 6 + i * 2.2, shutterW - 12, 0.2, 0.9, '#94a3b8');
        }
        // Cylindrical Knob with Thumbturn
        drawRotatedBox(shutterW - 4, shutterThick + 0.2, 38, 2.2, 1.5, 2.2, '#cbd5e1');
        break;
      }

      case 'fire_exit': {
        // Narrow Vision Wire-Glass Window
        drawRotatedBox(6, 0.4, 42, 6, 0.4, 28, '#38bdf8');
        // Full Width Red Emergency Panic Push Bar
        drawRotatedBox(2, shutterThick + 0.4, 36, shutterW - 4, 1.5, 2.8, '#dc2626');
        // Overhead Automatic Closer
        drawBox(6, -1.2, doorHeight - 5, 14, 2.8, 3.2, '#334155');
        break;
      }

      case 'bifold': {
        // 4 Folding Leaves with central hinge lines
        const leafW = shutterW / 4;
        for (let i = 1; i < 4; i++) {
          drawRotatedBox(i * leafW - 0.2, shutterThick + 0.1, 0, 0.4, 0.2, shutterH, '#334155');
        }
        break;
      }
    }
  }, [doorWidth, doorHeight, frameDepth, swingAngle, orbitYaw, orbitPitch, activeDoor]);

  useEffect(() => {
    render3DDoor();
  }, [render3DDoor]);

  const handleDownload = async () => {
    setDownloading(true);
    const plugin = PLUGINS_DATA.find((p) => p.id === 'sketchup-evl-door');
    if (plugin) {
      await triggerPluginDownload(plugin);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
    setDownloading(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden space-y-4 p-4">
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-700 via-amber-800 to-orange-950 text-white rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-2xl shadow-inner">
            🚪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-wide">
                EVL-Door Pro: 3D Architectural Door Studio
              </h3>
              <span className="text-[10px] font-mono font-bold bg-amber-500/30 border border-amber-300/40 px-2 py-0.5 rounded text-amber-100">
                Trimble SketchUp .rbz
              </span>
            </div>
            <p className="text-xs text-amber-200">
              {lang === 'bn'
                ? '৩"x২.৫" চৌকাঠ রিবেট (Rebate), ৩ডি শাটার প্যানেল, কব্জা, হ্যান্ডেল ও ফ্লোর সুইং আর্ক সহ পূর্ণাঙ্গ ১০টি আর্কিটেকচারাল ডোর।'
                : 'Authentic 3"x2.5" chowkat timber frames with 1.5" rebates, 3D raised panels, hardware sets & 2D floor swing arcs.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-amber-950 hover:bg-amber-100 font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'ডাউনলোড সফল (.rbz)' : 'Downloaded (.rbz)'}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{lang === 'bn' ? 'EVL-Door.rbz ডাউনলোড' : 'Download EVL-Door.rbz'}</span>
            </>
          )}
        </button>
      </div>

      {/* Style Selector Grid (10 Architectural Door Presets) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {lang === 'bn'
              ? '১০টি আর্কিটেকচারাল ডোর স্টাইল (Select Real 3D Door Model):'
              : 'Select Door Style (10 Architectural Presets):'}
          </label>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-bold">
            Target Layer: 05_DOORS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {DOOR_STYLES_LIST.map((style) => {
            const isSelected = style.id === selectedDoorId;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  setSelectedDoorId(style.id);
                  setDoorWidth(style.defaultW);
                  setDoorHeight(style.defaultH);
                }}
                className={`flex flex-col items-start text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-base">{style.iconEmoji}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <span className="text-xs font-bold line-clamp-1">
                  {lang === 'bn' ? style.nameBn : style.nameEn}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {lang === 'bn' ? style.tagBn : style.tagEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3D Canvas Viewport + Control Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 3D Canvas Area */}
        <div className="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between relative overflow-hidden">
          {/* Viewport Top Header & Preset Switchers */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'রিয়েল-টাইম ৩ডি ডোর ভিউপোর্ট' : 'Real-Time 3D Door Viewport'}</span>
              </span>
              <span className="text-[10px] bg-amber-950 border border-amber-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                {doorWidth}&quot; W x {doorHeight}&quot; H x 5&quot; Chowkat
              </span>
            </div>

            {/* Camera View Angle Buttons */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => handleSetPreset('3d_iso')}
                className={`px-2 py-0.5 rounded transition font-semibold cursor-pointer ${
                  viewPreset === '3d_iso' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎲 ৩ডি আইসো
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset('front_elev')}
                className={`px-2 py-0.5 rounded transition font-semibold cursor-pointer ${
                  viewPreset === 'front_elev' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📐 এলিভেশন
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset('plan_swing')}
                className={`px-2 py-0.5 rounded transition font-semibold cursor-pointer ${
                  viewPreset === 'plan_swing' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📋 ২ডি সুইং প্ল্যান
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset('rebate_detail')}
                className={`px-2 py-0.5 rounded transition font-semibold cursor-pointer ${
                  viewPreset === 'rebate_detail' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔍 রিবেট ক্লোজ-আপ
              </button>
            </div>
          </div>

          {/* Interactive HTML5 3D Canvas */}
          <div className="relative w-full h-80 rounded-xl bg-gradient-to-b from-[#090d16] to-[#030712] border border-slate-800 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing">
            <canvas
              ref={canvasRef}
              width={700}
              height={420}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full object-contain select-none"
            />

            {/* Orbit Hint Watermark */}
            <div className="absolute top-2 left-2 pointer-events-none text-[10px] text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800/60 font-mono">
              🖱️ মাউস ড্র্যাগ করে ৩ডি-তে ঘুরিয়ে দেখুন (Orbit: {orbitYaw.toFixed(0)}°, Pitch: {orbitPitch.toFixed(0)}°)
            </div>

            {/* Door Swing Status Badge */}
            <div className="absolute top-2 right-2 pointer-events-none text-[10px] bg-slate-900/80 border border-slate-800 px-2 py-1 rounded text-purple-300 font-mono font-bold">
              🚪 Swing Angle: {swingAngle.toFixed(0)}° ({swingAngle === 0 ? 'Closed' : swingAngle >= 80 ? 'Fully Open' : 'Ajar'})
            </div>
          </div>

          {/* Interactive Door Swing Animation Controls */}
          <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSwingAngle(swingAngle > 0 ? 0 : 90)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer shadow"
              >
                <span>{swingAngle > 0 ? '🔒 দরজা সম্পূর্ণ বন্ধ করুন (0°)' : '🚪 দরজা ৯০° খুলুন (Open 90°)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAutoSwinging(!isAutoSwinging)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer border ${
                  isAutoSwinging
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isAutoSwinging ? '⏸️ সুইং অ্যানিমেশন থামান' : '▶️ অটো সুইং টেস্ট'}
              </button>
            </div>

            {/* Swing Slider */}
            <div className="flex items-center gap-2 flex-1 max-w-[260px]">
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                সুইং অ্যাঙ্গেল:
              </span>
              <input
                type="range"
                min="0"
                max="90"
                step="1"
                value={swingAngle}
                onChange={(e) => {
                  setIsAutoSwinging(false);
                  setSwingAngle(Number(e.target.value));
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-amber-400 w-8 text-right">
                {swingAngle}°
              </span>
            </div>
          </div>
        </div>

        {/* Technical Specs & Parametric Inputs Sidebar */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-2xl">{activeDoor.iconEmoji}</span>
              <div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'bn' ? activeDoor.nameBn : activeDoor.nameEn}
                </h5>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  {lang === 'bn' ? activeDoor.tagBn : activeDoor.tagEn}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {lang === 'bn' ? activeDoor.descBn : activeDoor.descEn}
            </p>

            {/* Live Parametric Dimension Sliders */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  {lang === 'bn' ? 'দরজার প্রস্থ (Width):' : 'Width:'}
                </span>
                <div className="flex items-center gap-2 w-36">
                  <input
                    type="range"
                    min="28"
                    max="96"
                    step="2"
                    value={doorWidth}
                    onChange={(e) => setDoorWidth(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 w-10 text-right">
                    {doorWidth}&quot;
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  {lang === 'bn' ? 'সিলিং হাইট (Height):' : 'Height:'}
                </span>
                <div className="flex items-center gap-2 w-36">
                  <input
                    type="range"
                    min="78"
                    max="108"
                    step="2"
                    value={doorHeight}
                    onChange={(e) => setDoorHeight(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 w-10 text-right">
                    {doorHeight}&quot;
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  {lang === 'bn' ? 'চৌকাঠ গভীরতা (Wall Depth):' : 'Chowkat Depth:'}
                </span>
                <div className="flex items-center gap-2 w-36">
                  <input
                    type="range"
                    min="4.0"
                    max="10.0"
                    step="0.5"
                    value={frameDepth}
                    onChange={(e) => setFrameDepth(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 w-10 text-right">
                    {frameDepth}&quot;
                  </span>
                </div>
              </div>
            </div>

            {/* Specifications Card */}
            <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-900">
                <span className="text-slate-500">চৌকাঠ সাইজ:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">
                  {lang === 'bn' ? activeDoor.frameTypeBn : activeDoor.frameTypeEn}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-900">
                <span className="text-slate-500">রিবেট (Rebate):</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">1.5&quot; x 0.5&quot; (Step-down)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-900">
                <span className="text-slate-500">শাটার পুরুত্ব:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">1.5&quot; (38mm) Solid Core</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-900">
                <span className="text-slate-500">BIM Tag / Layer:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">05_DOORS (ACI Purple)</span>
              </div>
            </div>
          </div>

          {/* SketchUp Instructions Box */}
          <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'bn' ? 'স্কেচআপে ব্যবহারের নিয়ম' : 'SketchUp Usage'}</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {lang === 'bn'
                ? 'স্কেচআপে দেয়ালের ডোর ওপেনিংয়ের নিচে পয়েন্ট সিলেক্ট করে টুলবার থেকে 🚪 Door Pro ক্লিক করলে সম্পূর্ণ ৩ডি চৌকাঠ, রিবেট, শাটার ও সুইং আর্ক সহ দরজা তৈরি হয়ে যায়।'
                : 'In SketchUp, pick opening base point and click 🚪 Door Pro to generate the authentic rebated chowkat frame, shutter relief, hardware, and floor swing arc.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
