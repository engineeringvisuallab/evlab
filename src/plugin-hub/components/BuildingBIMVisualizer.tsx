import React, { useState } from 'react';
import {
  Building2,
  Layers,
  Columns,
  DoorOpen,
  Square,
  FileSpreadsheet,
  Table,
  CheckCircle2,
  Plus,
  Play,
  ArrowRight,
  Maximize2,
  ChevronRight,
  Calculator,
  Eye,
  EyeOff,
  Sparkles,
  Sliders,
  Download,
} from 'lucide-react';
import { Language } from '../types';

interface BIMLevel {
  id: string;
  name: string;
  elevationM: number;
  heightM: number;
  wallCount: number;
  roomCount: number;
}

interface BIMWall {
  id: string;
  name: string;
  type: 'exterior' | 'interior';
  thicknessMm: number;
  lengthM: number;
  levelId: string;
}

interface BIMRoom {
  id: string;
  name: string;
  number: string;
  areaSqm: number;
  levelId: string;
  finish: string;
}

interface BIMOpening {
  id: string;
  type: 'door' | 'window';
  tag: string;
  widthMm: number;
  heightMm: number;
  wallId: string;
}

export const BuildingBIMVisualizer: React.FC<{ lang?: Language }> = ({ lang = 'en' }) => {
  // 1. Levels State
  const [levels, setLevels] = useState<BIMLevel[]>([
    { id: 'lvl-0', name: 'Ground Level', elevationM: 0.0, heightM: 3.2, wallCount: 6, roomCount: 4 },
    { id: 'lvl-1', name: '1st Floor', elevationM: 3.2, heightM: 3.2, wallCount: 6, roomCount: 4 },
    { id: 'lvl-2', name: 'Roof Level', elevationM: 6.4, heightM: 1.0, wallCount: 4, roomCount: 1 },
  ]);
  const [activeLevelId, setActiveLevelId] = useState<string>('lvl-0');

  // 2. Active BIM Workflow Tab
  const [activeTab, setActiveTab] = useState<'plan' | 'rooms' | 'schedules' | 'navigator' | 'layers'>('layers');

  // BIM Tags / Layers State for Complete Building Suite
  const [bimLayers, setBimLayers] = useState([
    { id: '00_SITE_SURVEY', name: '00_SITE_SURVEY', color: '#808080', descBn: 'জমি, সার্ভে বাউন্ডারি ও কনট্যুর গ্রিড', descEn: 'Site survey boundaries & grid', visible: true, count: 12, discipline: 'site' },
    { id: '01_COLUMNS_BEAMS', name: '01_COLUMNS_BEAMS', color: '#B91C1C', descBn: 'আরসিসি কলাম (১২"x১৫") ও টাই বিম', descEn: 'RCC Columns & Tie Beams', visible: true, count: 18, discipline: 'structure' },
    { id: '02_WALLS_EXTERIOR', name: '02_WALLS_EXTERIOR', color: '#1D4ED8', descBn: '১০" বহিরাগত দেয়াল ও লিন্টেল', descEn: '10" Exterior Masonry Walls', visible: true, count: 24, discipline: 'walls' },
    { id: '03_WALLS_INTERIOR', name: '03_WALLS_INTERIOR', color: '#0284C7', descBn: '৫" অভ্যন্তরীণ পার্টিশন দেয়াল', descEn: '5" Interior Partition Walls', visible: true, count: 16, discipline: 'walls' },
    { id: '04_SLABS_CEILING', name: '04_SLABS_CEILING', color: '#D97706', descBn: '৬" আরসিসি ফ্লোর স্ল্যাব ও সানকেন', descEn: '6" RCC Floor Slabs & Sunken', visible: true, count: 8, discipline: 'structure' },
    { id: '05_DOORS', name: '05_DOORS', color: '#9333EA', descBn: 'কাঠের চৌকাঠ, পাল্লা ও সুইং ডোর', descEn: 'Door Chowkath & Wooden Leaves', visible: true, count: 10, discipline: 'openings' },
    { id: '06_WINDOWS_GRILLS', name: '06_WINDOWS_GRILLS', color: '#06B6D4', descBn: 'স্লাইডিং জানালা ও সিকিউরিটি গ্রিল', descEn: 'Sliding Windows & Safety Grills', visible: true, count: 14, discipline: 'openings' },
    { id: '07_STAIRS_RAILING', name: '07_STAIRS_RAILING', color: '#E11D48', descBn: 'ডগ-লেগড সিঁড়ি, ধাপ ও এসএস রেলিং', descEn: 'Dog-Legged Stairs & SS Railing', visible: true, count: 6, discipline: 'circulation' },
    { id: '08_ROOF_PARAPET', name: '08_ROOF_PARAPET', color: '#65A30D', descBn: 'ছাদ, ৩ ফুট প্যারাপেট ও পানির ট্যাঙ্ক', descEn: 'Roof Terrace, Parapet & Tank', visible: true, count: 5, discipline: 'circulation' },
    { id: '09_BALCONY_CANOPY', name: '09_BALCONY_CANOPY', color: '#059669', descBn: 'বারান্দা ও ড্রিপ মোল্ড সানশেড', descEn: 'Cantilever Balconies & Chajja', visible: true, count: 6, discipline: 'circulation' },
    { id: '10_PLUMBING_MEP', name: '10_PLUMBING_MEP', color: '#2563EB', descBn: 'প্লাম্বিং পাইপলাইন ও স্যানিটারি', descEn: 'Plumbing Network & Fixtures', visible: true, count: 12, discipline: 'mep' },
    { id: '11_FURNITURE_FIXTURES', name: '11_FURNITURE_FIXTURES', color: '#D946EF', descBn: 'ফার্নিচার লেআউট ও ক্যাবিনেট', descEn: 'Interior Furniture Layout', visible: true, count: 22, discipline: 'site' },
    { id: '12_BOUNDARY_SITE', name: '12_BOUNDARY_SITE', color: '#78716C', descBn: 'বাউন্ডারি দেয়াল ও ড্রাইভওয়ে গেট', descEn: 'Perimeter Wall & Driveway Gate', visible: true, count: 8, discipline: 'site' },
  ]);
  const [autoTagSuccess, setAutoTagSuccess] = useState(false);

  const toggleLayer = (id: string) => {
    setBimLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const isolatePreset = (preset: 'all' | 'structure' | 'walls' | 'openings' | 'circulation' | 'site') => {
    setBimLayers((prev) =>
      prev.map((l) => {
        if (preset === 'all') return { ...l, visible: true };
        if (preset === 'structure') return { ...l, visible: ['01_COLUMNS_BEAMS', '04_SLABS_CEILING'].includes(l.id) };
        if (preset === 'walls') return { ...l, visible: ['02_WALLS_EXTERIOR', '03_WALLS_INTERIOR'].includes(l.id) };
        if (preset === 'openings') return { ...l, visible: ['05_DOORS', '06_WINDOWS_GRILLS'].includes(l.id) };
        if (preset === 'circulation') return { ...l, visible: ['07_STAIRS_RAILING', '08_ROOF_PARAPET', '09_BALCONY_CANOPY'].includes(l.id) };
        if (preset === 'site') return { ...l, visible: ['00_SITE_SURVEY', '12_BOUNDARY_SITE'].includes(l.id) };
        return l;
      })
    );
  };

  // 3. Walls in Active Level
  const [walls, setWalls] = useState<BIMWall[]>([
    { id: 'w1', name: 'Wall A (North)', type: 'exterior', thicknessMm: 200, lengthM: 10.0, levelId: 'lvl-0' },
    { id: 'w2', name: 'Wall B (South)', type: 'exterior', thicknessMm: 200, lengthM: 10.0, levelId: 'lvl-0' },
    { id: 'w3', name: 'Wall C (East)', type: 'exterior', thicknessMm: 200, lengthM: 8.0, levelId: 'lvl-0' },
    { id: 'w4', name: 'Wall D (West)', type: 'exterior', thicknessMm: 200, lengthM: 8.0, levelId: 'lvl-0' },
    { id: 'w5', name: 'Partition Wall 1', type: 'interior', thicknessMm: 125, lengthM: 5.0, levelId: 'lvl-0' },
    { id: 'w6', name: 'Partition Wall 2', type: 'interior', thicknessMm: 125, lengthM: 4.0, levelId: 'lvl-0' },
  ]);

  // 4. Rooms in Active Level
  const [rooms, setRooms] = useState<BIMRoom[]>([
    { id: 'rm-101', name: 'Living & Dining', number: '101', areaSqm: 28.5, levelId: 'lvl-0', finish: 'Vitrified Tiles' },
    { id: 'rm-102', name: 'Master Bedroom', number: '102', areaSqm: 18.2, levelId: 'lvl-0', finish: 'Wooden Parquet' },
    { id: 'rm-103', name: 'Kitchen', number: '103', areaSqm: 10.4, levelId: 'lvl-0', finish: 'Granite Slab' },
    { id: 'rm-104', name: 'Toilet / Bath', number: '104', areaSqm: 4.8, levelId: 'lvl-0', finish: 'Ceramic Anti-skid' },
  ]);

  // 5. Hosted Openings
  const [openings, setOpenings] = useState<BIMOpening[]>([
    { id: 'op-1', type: 'door', tag: 'D1', widthMm: 1000, heightMm: 2100, wallId: 'w1' },
    { id: 'op-2', type: 'door', tag: 'D2', widthMm: 850, heightMm: 2100, wallId: 'w5' },
    { id: 'op-3', type: 'window', tag: 'W1', widthMm: 1500, heightMm: 1200, wallId: 'w2' },
    { id: 'op-4', type: 'window', tag: 'W2', widthMm: 1200, heightMm: 1200, wallId: 'w3' },
  ]);

  // Interactive Wall Insertion Demo State
  const [newWallThickness, setNewWallThickness] = useState<number>(200);
  const [selectedWallId, setSelectedWallId] = useState<string | null>('w1');

  const activeLevel = levels.find((l) => l.id === activeLevelId) || levels[0];

  // Calculations for BOQ Schedule
  const totalWallLength = walls.reduce((sum, w) => sum + w.lengthM, 0);
  const totalWallArea = totalWallLength * activeLevel.heightM;
  const totalFloorArea = rooms.reduce((sum, r) => sum + r.areaSqm, 0);
  const brickVolumeM3 = (totalWallArea * (newWallThickness / 1000)).toFixed(2);
  const totalBricksCount = Math.round(parseFloat(brickVolumeM3) * 500); // approx 500 bricks per m³

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-sky-700 via-blue-800 to-indigo-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-2xl">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-wide">
                EVLab Building BIM: Parametric Revit-Style Modeler
              </h3>
              <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-sky-200">
                SketchUp Extension
              </span>
            </div>
            <p className="text-xs text-sky-100">
              লেভেল ➔ গ্রিড ➔ দেয়াল ➔ হোস্ট ডোর/উইন্ডো ➔ রুম ডিটেকশন ও অটো স্ল্যাব ও বিওকিউ শিডিউল
            </p>
          </div>
        </div>

        {/* Level Switcher in Header */}
        <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/20 text-xs">
          <span className="text-sky-200 font-semibold px-2">Active Level:</span>
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setActiveLevelId(lvl.id)}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeLevelId === lvl.id
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-sky-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {lvl.name} ({lvl.elevationM}m)
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('plan')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
            activeTab === 'plan'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>১. 2D/3D Wall &amp; Openings Plan</span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
            activeTab === 'rooms'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Square className="w-4 h-4 text-emerald-500" />
          <span>২. রুম ডিটেকশন ও স্ল্যাব (Room &amp; Slab)</span>
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
            activeTab === 'schedules'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Table className="w-4 h-4 text-amber-500" />
          <span>৩. বিওকিউ শিডিউল (Revit-Style Takeoff)</span>
        </button>

        <button
          onClick={() => setActiveTab('navigator')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
            activeTab === 'navigator'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>৪. প্রজেক্ট ব্রাউজার (Building Tree)</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
            activeTab === 'layers'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>৫. অটো লেয়ার ও ট্যাগ ম্যানেজার (BIM Tags)</span>
        </button>
      </div>

      {/* TAB 1: 2D/3D Interactive Plan & Host Cutters */}
      {activeTab === 'plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left 2 Cols: Architectural Canvas */}
          <div className="lg:col-span-2 relative bg-[#0b1329] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-4 select-none">
            {/* Grid Overlay */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative z-10 flex items-center justify-between mb-3 text-xs">
              <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur border border-sky-500/40 text-sky-300 font-mono">
                Workplane: {activeLevel.name} (+{activeLevel.elevationM}m)
              </span>
              <span className="text-slate-400 text-[11px]">
                💡 দেয়ালে ক্লিক করে দরজা/জানালা হোস্ট ওপেনিং দেখুন
              </span>
            </div>

            {/* SVG Architectural Floor Plan */}
            <svg viewBox="0 0 520 320" className="w-full h-[280px] sm:h-[320px]">
              {/* Column Grids 1, 2, 3 & A, B */}
              <g stroke="#334155" strokeWidth="1" strokeDasharray="6 4" opacity="0.5">
                <line x1="80" y1="20" x2="80" y2="300" />
                <line x1="280" y1="20" x2="280" y2="300" />
                <line x1="460" y1="20" x2="460" y2="300" />
                <line x1="40" y1="60" x2="480" y2="60" />
                <line x1="40" y1="260" x2="480" y2="260" />
              </g>

              {/* Grid Bubbles */}
              <circle cx="80" cy="20" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="80" y="24" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">A</text>

              <circle cx="280" cy="20" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="280" y="24" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">B</text>

              <circle cx="460" cy="20" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="460" y="24" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">C</text>

              {/* RCC Columns at Intersections */}
              {[
                { x: 80, y: 60 },
                { x: 280, y: 60 },
                { x: 460, y: 60 },
                { x: 80, y: 260 },
                { x: 280, y: 260 },
                { x: 460, y: 260 },
              ].map((c, i) => (
                <rect
                  key={`col-${i}`}
                  x={c.x - 10}
                  y={c.y - 10}
                  width="20"
                  height="20"
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
              ))}

              {/* Exterior Solid Walls with Host Openings */}
              {/* North Wall A */}
              <rect
                x="80"
                y="52"
                width="380"
                height="16"
                fill={selectedWallId === 'w1' ? '#3b82f6' : '#475569'}
                stroke="#64748b"
                strokeWidth="1.5"
                onClick={() => setSelectedWallId('w1')}
                className="cursor-pointer transition-colors"
              />
              {/* Door D1 cut in North Wall */}
              <rect x="180" y="52" width="35" height="16" fill="#0b1329" />
              <path d="M 180 52 A 35 35 0 0 1 215 17" fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="2 2" />
              <line x1="180" y1="52" x2="180" y2="17" stroke="#facc15" strokeWidth="2" />
              <text x="198" y="42" textAnchor="middle" fill="#facc15" fontSize="9" fontWeight="bold">D1</text>

              {/* South Wall B */}
              <rect
                x="80"
                y="252"
                width="380"
                height="16"
                fill={selectedWallId === 'w2' ? '#3b82f6' : '#475569'}
                stroke="#64748b"
                strokeWidth="1.5"
                onClick={() => setSelectedWallId('w2')}
                className="cursor-pointer transition-colors"
              />
              {/* Window W1 cut in South Wall */}
              <rect x="220" y="252" width="50" height="16" fill="#0b1329" />
              <rect x="220" y="256" width="50" height="8" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
              <text x="245" y="282" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">W1</text>

              {/* West Wall C */}
              <rect
                x="72"
                y="60"
                width="16"
                height="200"
                fill={selectedWallId === 'w3' ? '#3b82f6' : '#475569'}
                stroke="#64748b"
                strokeWidth="1.5"
                onClick={() => setSelectedWallId('w3')}
                className="cursor-pointer transition-colors"
              />
              {/* Window W2 cut in West Wall */}
              <rect x="72" y="140" width="16" height="40" fill="#0b1329" />
              <rect x="76" y="140" width="8" height="40" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
              <text x="56" y="164" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">W2</text>

              {/* East Wall D */}
              <rect
                x="452"
                y="60"
                width="16"
                height="200"
                fill={selectedWallId === 'w4' ? '#3b82f6' : '#475569'}
                stroke="#64748b"
                strokeWidth="1.5"
                onClick={() => setSelectedWallId('w4')}
                className="cursor-pointer transition-colors"
              />

              {/* Interior Partition Wall */}
              <rect x="274" y="68" width="12" height="184" fill="#64748b" />

              {/* Room Badges in Center of spaces */}
              <g transform="translate(170, 150)">
                <rect x="-60" y="-18" width="120" height="36" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                <text x="0" y="-4" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">LIVING &amp; DINING</text>
                <text x="0" y="10" textAnchor="middle" fill="#94a3b8" fontSize="9">28.5 m² (306 SFT)</text>
              </g>

              <g transform="translate(365, 150)">
                <rect x="-60" y="-18" width="120" height="36" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                <text x="0" y="-4" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">MASTER BED</text>
                <text x="0" y="10" textAnchor="middle" fill="#94a3b8" fontSize="9">18.2 m² (196 SFT)</text>
              </g>
            </svg>

            {/* Bottom Indicator */}
            <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span className="text-sky-400">Selected: {selectedWallId ? `Wall Entity [${selectedWallId.toUpperCase()}]` : 'None'}</span>
              <span className="text-emerald-400">L/T Corner Miter: Clean Joined</span>
            </div>
          </div>

          {/* Right 1 Col: Revit Property Inspector */}
          <div className="p-4 bg-white dark:bg-slate-900 space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>BIM Property Inspector</span>
            </h4>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block mb-1">Wall Type:</span>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Exterior Plastered Brick Wall</span>
                  <span className="text-[10px] bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-1.5 py-0.5 rounded">200mm</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block mb-1">Base Constraint:</span>
                  <input
                    type="text"
                    disabled
                    value={activeLevel.name}
                    className="w-full px-2.5 py-1.5 rounded-lg border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Unconnected Height:</span>
                  <input
                    type="text"
                    disabled
                    value={`${activeLevel.heightM.toFixed(2)} m`}
                    className="w-full px-2.5 py-1.5 rounded-lg border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Hosted Doors & Windows in this Wall */}
              <div>
                <span className="text-slate-500 block mb-1.5">Hosted Elements in Wall:</span>
                <div className="space-y-1.5">
                  <div className="p-2 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-between">
                    <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <DoorOpen className="w-3.5 h-3.5 text-amber-600" />
                      <span>Door D1 (1000x2100mm)</span>
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono">Auto-Cut Void</span>
                  </div>

                  <div className="p-2 rounded-lg border border-sky-300 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/30 flex items-center justify-between">
                    <span className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                      <Square className="w-3.5 h-3.5 text-sky-600" />
                      <span>Window W1 (1500x1200mm)</span>
                    </span>
                    <span className="text-[10px] text-sky-700 dark:text-sky-300 font-mono">Sill: 900mm</span>
                  </div>
                </div>
              </div>

              {/* 1-Click Action */}
              <div className="pt-2">
                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Insert Door / Window on Wall</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Room Detection & Slabs */}
      {activeTab === 'rooms' && (
        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                রুম বাউন্ডারি ডিটেকশন ও অটো স্ল্যাব জেনারেটর (Floor Slabs by Room)
              </h4>
              <p className="text-slate-500">
                দেয়ালের মধ্যবর্তী ফাঁকা স্থানে ক্লিক করলেই নিজে থেকে এরিয়া বের হয়ে যাবে এবং স্ল্যাব তৈরি হবে।
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
            >
              <Square className="w-4 h-4" />
              <span>Generate All Slabs (150mm RCC)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {rooms.map((rm) => (
              <div
                key={rm.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[11px] border border-emerald-200 dark:border-emerald-800">
                    Room {rm.number}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{activeLevel.name}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {rm.name}
                </div>
                <div className="flex items-baseline gap-1 text-slate-600 dark:text-slate-300">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    {rm.areaSqm} m²
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({(rm.areaSqm * 10.7639).toFixed(1)} sq.ft)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 border-t pt-1.5">
                  Finish: <strong className="text-slate-700 dark:text-slate-300">{rm.finish}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Revit-Style BOQ Schedules & Takeoff */}
      {activeTab === 'schedules' && (
        <div className="p-5 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Revit-Style Automated BOQ Takeoff Schedules</span>
              </h4>
              <p className="text-slate-500">
                দেয়াল, জানালা, দরজা ও স্ল্যাব আঁকার সাথে সাথে স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত বিওকিউ শিডিউল
              </p>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Schedules to Excel / CSV</span>
            </button>
          </div>

          {/* Wall Schedule Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Level</th>
                  <th className="p-2.5">Total Length</th>
                  <th className="p-2.5">Height</th>
                  <th className="p-2.5">Wall Area</th>
                  <th className="p-2.5">Brick Volume</th>
                  <th className="p-2.5">Est. Bricks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 font-sans font-semibold text-slate-900 dark:text-white">Exterior Walls (200mm)</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">{activeLevel.name}</td>
                  <td className="p-2.5 font-bold">{totalWallLength.toFixed(1)} m</td>
                  <td className="p-2.5">{activeLevel.heightM.toFixed(2)} m</td>
                  <td className="p-2.5 text-sky-600 dark:text-sky-400 font-bold">{totalWallArea.toFixed(1)} m²</td>
                  <td className="p-2.5 text-amber-600 dark:text-amber-400">{brickVolumeM3} m³</td>
                  <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">~{totalBricksCount.toLocaleString()} pcs</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 font-sans font-semibold text-slate-900 dark:text-white">RCC Floor Slabs (150mm)</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">{activeLevel.name}</td>
                  <td className="p-2.5">-</td>
                  <td className="p-2.5">0.15 m</td>
                  <td className="p-2.5 text-sky-600 dark:text-sky-400 font-bold">{totalFloorArea.toFixed(1)} m²</td>
                  <td className="p-2.5 text-amber-600 dark:text-amber-400">{(totalFloorArea * 0.15).toFixed(2)} m³</td>
                  <td className="p-2.5 text-slate-500 font-sans">Concrete Cast</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Building Navigator (Project Browser) */}
      {activeTab === 'navigator' && (
        <div className="p-5 space-y-4 text-xs">
          <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Project Browser &amp; Building Navigator (BIM Hierarchy)</span>
          </h4>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-mono space-y-3">
            <div className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
              <span>📁 PROJECT: EVLab Residential Villa (BIM Model)</span>
            </div>

            {levels.map((lvl) => (
              <div key={lvl.id} className="pl-6 border-l-2 border-slate-300 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-sky-600 dark:text-sky-400">
                  <span>🏢 {lvl.name} (Elevation: {lvl.elevationM.toFixed(2)}m)</span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                    Active Storey
                  </span>
                </div>
                <div className="pl-6 space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  <div>├── 🧱 Walls ({lvl.wallCount} parametric elements)</div>
                  <div>├── 🚪 Hosted Openings (D1, D2, W1, W2)</div>
                  <div>├── 📦 Enclosed Rooms ({lvl.roomCount} detected spaces)</div>
                  <div>└── 📐 Structural Slab (150mm RCC Cast)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Building Layers & Tag Manager (BIM Standards) */}
      {activeTab === 'layers' && (
        <div className="p-4 space-y-4 text-xs">
          {/* Top Quick Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900 rounded-xl text-white">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                <span>ডিসিপ্লিন আইসোলেটর (Isolate):</span>
              </span>
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => isolatePreset('all')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold cursor-pointer"
                >
                  🌐 সব ট্যাগ অন (All)
                </button>
                <button
                  type="button"
                  onClick={() => isolatePreset('structure')}
                  className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 font-semibold cursor-pointer"
                >
                  🏗️ স্ট্রাকচার (Columns/Slabs)
                </button>
                <button
                  type="button"
                  onClick={() => isolatePreset('walls')}
                  className="px-2.5 py-1 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-200 font-semibold cursor-pointer"
                >
                  🧱 দেয়াল (Walls Only)
                </button>
                <button
                  type="button"
                  onClick={() => isolatePreset('openings')}
                  className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-200 font-semibold cursor-pointer"
                >
                  🚪 দরজা-জানালা (Openings)
                </button>
                <button
                  type="button"
                  onClick={() => isolatePreset('circulation')}
                  className="px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 font-semibold cursor-pointer"
                >
                  🪜 সিঁড়ি ও ছাদ (Stairs/Roof)
                </button>
                <button
                  type="button"
                  onClick={() => isolatePreset('site')}
                  className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-semibold cursor-pointer"
                >
                  🌳 সাইট ও বাউন্ডারি (Site)
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAutoTagSuccess(true);
                setTimeout(() => setAutoTagSuccess(false), 3000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{autoTagSuccess ? '✓ সফলভাবে ট্যাগ অ্যাসাইন হয়েছে!' : '🎯 আনট্যাগড অবজেক্ট অটো-ট্যাগ করুন'}</span>
            </button>
          </div>

          {/* Two-Column Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 7 Cols: Interactive 3D Isometric Building Model */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#090d16] p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-2 z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-slate-200 font-mono">
                    3D Multi-Storey Building Model (Live Discipline Layers)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Active Layers: {bimLayers.filter((l) => l.visible).length} / {bimLayers.length}
                </span>
              </div>

              {/* 3D Isometric Architectural Canvas */}
              <div className="w-full aspect-[16/10] flex items-center justify-center relative">
                <svg viewBox="0 0 600 380" className="w-full h-full select-none">
                  <defs>
                    <linearGradient id="wallExtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e40af" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#172554" stopOpacity="0.95" />
                    </linearGradient>
                    <linearGradient id="slabGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d97706" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#78350f" stopOpacity="0.95" />
                    </linearGradient>
                    <linearGradient id="groundGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#334155" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* 00_SITE_SURVEY: Ground Grid & Survey Contour */}
                  {bimLayers.find((l) => l.id === '00_SITE_SURVEY')?.visible && (
                    <g opacity="0.6">
                      <polygon points="300,340 540,240 300,160 60,240" fill="url(#groundGrad)" stroke="#475569" strokeWidth="1" />
                      <line x1="180" y1="200" x2="420" y2="290" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="420" y1="200" x2="180" y2="290" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="75" y="245" fill="#94a3b8" fontSize="9" fontFamily="monospace">00_SITE_SURVEY</text>
                    </g>
                  )}

                  {/* 12_BOUNDARY_SITE: Boundary Wall & Front Gate */}
                  {bimLayers.find((l) => l.id === '12_BOUNDARY_SITE')?.visible && (
                    <g>
                      <path d="M 80,245 L 300,335 L 520,245" fill="none" stroke="#78716c" strokeWidth="4" strokeLinecap="round" />
                      {/* Pillars */}
                      <rect x="76" y="235" width="8" height="18" fill="#a8a29e" rx="1" />
                      <rect x="516" y="235" width="8" height="18" fill="#a8a29e" rx="1" />
                      <rect x="296" y="325" width="8" height="18" fill="#a8a29e" rx="1" />
                      {/* Gate */}
                      <line x1="280" y1="318" x2="315" y2="332" stroke="#f59e0b" strokeWidth="3" strokeDasharray="2 1" />
                    </g>
                  )}

                  {/* 04_SLABS_CEILING: Ground Plinth Slab */}
                  {bimLayers.find((l) => l.id === '04_SLABS_CEILING')?.visible && (
                    <g>
                      <polygon points="300,285 460,215 300,150 140,215" fill="url(#slabGrad)" stroke="#b45309" strokeWidth="1.5" />
                      <polygon points="140,215 300,285 300,295 140,225" fill="#92400e" opacity="0.9" />
                      <polygon points="300,285 460,215 460,225 300,295" fill="#78350f" opacity="0.9" />
                    </g>
                  )}

                  {/* 01_COLUMNS_BEAMS: Ground Storey RCC Columns */}
                  {bimLayers.find((l) => l.id === '01_COLUMNS_BEAMS')?.visible && (
                    <g fill="#dc2626" stroke="#991b1b" strokeWidth="1">
                      {/* 4 Corner + 2 Middle Columns */}
                      <rect x="145" y="165" width="8" height="50" rx="1" />
                      <rect x="296" y="230" width="8" height="55" rx="1" />
                      <rect x="447" y="165" width="8" height="50" rx="1" />
                      <rect x="296" y="105" width="8" height="45" rx="1" opacity="0.5" />
                      <rect x="220" y="195" width="7" height="52" rx="1" />
                      <rect x="375" y="195" width="7" height="52" rx="1" />
                    </g>
                  )}

                  {/* 02_WALLS_EXTERIOR: Ground Floor Exterior 10" Walls */}
                  {bimLayers.find((l) => l.id === '02_WALLS_EXTERIOR')?.visible && (
                    <g opacity="0.85">
                      {/* Left Wall */}
                      <polygon points="140,215 300,285 300,235 140,165" fill="url(#wallExtGrad)" stroke="#3b82f6" strokeWidth="1" />
                      {/* Right Wall */}
                      <polygon points="300,285 460,215 460,165 300,235" fill="#1e3a8a" stroke="#2563eb" strokeWidth="1" />
                    </g>
                  )}

                  {/* 03_WALLS_INTERIOR: 5" Partition Walls */}
                  {bimLayers.find((l) => l.id === '03_WALLS_INTERIOR')?.visible && (
                    <g stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" fill="none">
                      <line x1="220" y1="250" x2="220" y2="200" />
                      <line x1="380" y1="250" x2="380" y2="200" />
                    </g>
                  )}

                  {/* 05_DOORS: Ground Entrance Chowkath & Shutter */}
                  {bimLayers.find((l) => l.id === '05_DOORS')?.visible && (
                    <g>
                      <rect x="215" y="228" width="16" height="28" fill="#7e22ce" stroke="#c084fc" strokeWidth="1.5" rx="1" />
                      <circle cx="228" cy="242" r="1.5" fill="#fbbf24" />
                      {/* Door Swing Arc */}
                      <path d="M 215,256 A 16 16 0 0 1 231,256" fill="none" stroke="#d8b4fe" strokeWidth="1" strokeDasharray="2 1" />
                    </g>
                  )}

                  {/* 06_WINDOWS_GRILLS: Ground Sliding Windows & Safety Grills */}
                  {bimLayers.find((l) => l.id === '06_WINDOWS_GRILLS')?.visible && (
                    <g>
                      {/* Left Wall Window */}
                      <rect x="160" y="195" width="28" height="20" fill="#0891b2" opacity="0.8" stroke="#22d3ee" strokeWidth="1.5" rx="1" />
                      <line x1="174" y1="195" x2="174" y2="215" stroke="#ecfeff" strokeWidth="1" />
                      {/* Diamond Grills inside window */}
                      <line x1="160" y1="205" x2="188" y2="205" stroke="#67e8f9" strokeWidth="0.8" />
                      {/* Right Wall Window */}
                      <rect x="340" y="240" width="30" height="20" fill="#0891b2" opacity="0.8" stroke="#22d3ee" strokeWidth="1.5" rx="1" />
                      <line x1="355" y1="240" x2="355" y2="260" stroke="#ecfeff" strokeWidth="1" />
                    </g>
                  )}

                  {/* 07_STAIRS_RAILING: Dog-Legged Stair Steps & SS Railing */}
                  {bimLayers.find((l) => l.id === '07_STAIRS_RAILING')?.visible && (
                    <g>
                      {/* Steps staircase */}
                      <path d="M 270,265 L 275,263 L 275,258 L 280,256 L 280,251 L 285,249 L 285,244 L 290,242 L 290,237" fill="none" stroke="#f43f5e" strokeWidth="3" />
                      {/* Handrail */}
                      <path d="M 270,255 L 290,227" fill="none" stroke="#fda4af" strokeWidth="2" />
                    </g>
                  )}

                  {/* 04_SLABS_CEILING: First Floor Intermediate Slab */}
                  {bimLayers.find((l) => l.id === '04_SLABS_CEILING')?.visible && (
                    <g>
                      <polygon points="300,225 460,155 300,90 140,155" fill="url(#slabGrad)" stroke="#b45309" strokeWidth="1.5" />
                      <polygon points="140,155 300,225 300,233 140,163" fill="#92400e" opacity="0.9" />
                      <polygon points="300,225 460,155 460,163 300,233" fill="#78350f" opacity="0.9" />
                    </g>
                  )}

                  {/* 09_BALCONY_CANOPY: Cantilever Balcony on 1st Floor */}
                  {bimLayers.find((l) => l.id === '09_BALCONY_CANOPY')?.visible && (
                    <g>
                      <polygon points="210,195 270,220 270,226 210,201" fill="#059669" stroke="#34d399" strokeWidth="1" />
                      {/* Balcony Railing */}
                      <line x1="210" y1="188" x2="270" y2="213" stroke="#a7f3d0" strokeWidth="2" />
                      {/* Window Sunshade Chajja */}
                      <polygon points="156,192 188,192 192,197 152,197" fill="#10b981" opacity="0.8" />
                    </g>
                  )}

                  {/* 02_WALLS_EXTERIOR: 1st Floor Exterior Walls */}
                  {bimLayers.find((l) => l.id === '02_WALLS_EXTERIOR')?.visible && (
                    <g opacity="0.85">
                      <polygon points="140,155 300,225 300,175 140,105" fill="url(#wallExtGrad)" stroke="#3b82f6" strokeWidth="1" />
                      <polygon points="300,225 460,155 460,105 300,175" fill="#1e3a8a" stroke="#2563eb" strokeWidth="1" />
                    </g>
                  )}

                  {/* 06_WINDOWS_GRILLS: 1st Floor Windows */}
                  {bimLayers.find((l) => l.id === '06_WINDOWS_GRILLS')?.visible && (
                    <g>
                      <rect x="170" y="135" width="28" height="20" fill="#0891b2" opacity="0.8" stroke="#22d3ee" strokeWidth="1.5" rx="1" />
                      <rect x="350" y="180" width="30" height="20" fill="#0891b2" opacity="0.8" stroke="#22d3ee" strokeWidth="1.5" rx="1" />
                    </g>
                  )}

                  {/* 04_SLABS_CEILING: Top Roof Slab */}
                  {bimLayers.find((l) => l.id === '04_SLABS_CEILING')?.visible && (
                    <g>
                      <polygon points="300,165 460,95 300,30 140,95" fill="url(#slabGrad)" stroke="#b45309" strokeWidth="1.5" />
                      <polygon points="140,95 300,165 300,173 140,103" fill="#92400e" opacity="0.9" />
                      <polygon points="300,165 460,95 460,103 300,173" fill="#78350f" opacity="0.9" />
                    </g>
                  )}

                  {/* 08_ROOF_PARAPET: 3ft Parapet Wall, Coping & Water Tank */}
                  {bimLayers.find((l) => l.id === '08_ROOF_PARAPET')?.visible && (
                    <g>
                      {/* Parapet Wall perimeter */}
                      <path d="M 140,95 L 300,165 L 460,95 L 460,83 L 300,153 L 140,83 Z" fill="#65a30d" opacity="0.85" stroke="#bef264" strokeWidth="1" />
                      {/* Stair Headroom / LMR */}
                      <polygon points="250,110 310,135 310,95 250,70" fill="#4d7c0f" stroke="#a3e635" strokeWidth="1" />
                      {/* Overhead Water Tank */}
                      <rect x="260" y="55" width="24" height="20" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" rx="2" />
                      <text x="264" y="68" fill="#e0f2fe" fontSize="7" fontFamily="monospace" fontWeight="bold">TANK</text>
                    </g>
                  )}

                  {/* 10_PLUMBING_MEP: Downpipe Risers */}
                  {bimLayers.find((l) => l.id === '10_PLUMBING_MEP')?.visible && (
                    <g>
                      <line x1="452" y1="85" x2="452" y2="245" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="452" cy="115" r="3" fill="#60a5fa" />
                      <circle cx="452" cy="185" r="3" fill="#60a5fa" />
                    </g>
                  )}
                </svg>
              </div>

              {/* Bottom Discipline Badge Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-sky-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AIA &amp; BNBC Standard Layer Palette (ACI Colors 1-255)</span>
                </span>
                <span>Click any Eye icon to live-toggle 3D elements</span>
              </div>
            </div>

            {/* Right 5 Cols: Standard 13 BIM Tags List with Live Toggles */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>🏷️ স্ট্যান্ডার্ড ১৩টি আর্কিটেকচারাল ট্যাগ (Tags):</span>
                <span className="text-[10px] text-sky-500 font-mono">SketchUp Tags Model</span>
              </div>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {bimLayers.map((tag) => (
                  <div
                    key={tag.id}
                    className={`p-2 rounded-lg border transition flex items-center justify-between gap-2 ${
                      tag.visible
                        ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div className="min-w-0">
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-[11px] truncate flex items-center gap-1.5">
                          <span>{tag.name}</span>
                          <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-normal">
                            {tag.count} ents
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {lang === 'bn' ? tag.descBn : tag.descEn}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleLayer(tag.id)}
                      className={`p-1.5 rounded-md cursor-pointer transition shrink-0 ${
                        tag.visible
                          ? 'text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950'
                          : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title={tag.visible ? 'Hide this Tag' : 'Show this Tag'}
                    >
                      {tag.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
