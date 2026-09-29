import React, { useState } from 'react';
import {
  Layers,
  Square,
  Columns,
  DoorOpen,
  Eye,
  FileSpreadsheet,
  Sparkles,
  Maximize2,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Language } from '../types';

export type SketchUpBuildingToolId =
  | 'layers'
  | 'wall'
  | 'frame'
  | 'slab'
  | 'door'
  | 'window'
  | 'grill'
  | 'stair'
  | 'railing'
  | 'roof'
  | 'boundary'
  | 'gate'
  | 'facemaker'
  | 'bim'
  | 'boq';

interface ToolbarItem {
  id: SketchUpBuildingToolId;
  labelEn: string;
  labelBn: string;
  iconText: string;
  badge: string;
  tagLayer: string;
  tooltipEn: string;
  tooltipBn: string;
  hasDropdown?: boolean;
}

const TOOLBAR_ITEMS: ToolbarItem[] = [
  {
    id: 'layers',
    labelEn: 'EVL-Layers',
    labelBn: 'ট্যাগ/লেয়ার',
    iconText: '🏷️',
    badge: 'BIM Tags',
    tagLayer: 'ALL (13 Tags)',
    tooltipEn: 'EVL-BuildingLayers: 1-Click 13 Standard Architectural BIM Tags & Isolator',
    tooltipBn: 'EVL-BuildingLayers: ১-ক্লিকে ১৩টি স্ট্যান্ডার্ড বিআইএম লেয়ার তৈরি ও আইসোলেটর',
  },
  {
    id: 'facemaker',
    labelEn: 'FaceMaker',
    labelBn: 'ফেস মেকার',
    iconText: '📐',
    badge: '2D to Face',
    tagLayer: '00_SITE_SURVEY',
    tooltipEn: 'EVL-FaceMaker: Heal broken 2D CAD DWG lines into closed faces',
    tooltipBn: 'EVL-FaceMaker: অটোক্যাড প্ল্যানের ২ডি লাইন রিপেয়ার করে ফেস তৈরি',
  },
  {
    id: 'frame',
    labelEn: 'Col & Beam',
    labelBn: 'কলাম-বিম',
    iconText: '🏗️',
    badge: '12"x15" RCC',
    tagLayer: '01_COLUMNS_BEAMS',
    tooltipEn: 'EVL-StructuralFrame: RCC Columns & Tie Beams Structural Grid',
    tooltipBn: 'EVL-StructuralFrame: আরসিসি কলাম ও টাই বিম গ্রিড ফ্রেম',
    hasDropdown: true,
  },
  {
    id: 'wall',
    labelEn: 'Wall 5"/10"',
    labelBn: '৩ডি দেয়াল',
    iconText: '🧱',
    badge: '10ft Height',
    tagLayer: '02_WALLS_EXTERIOR',
    tooltipEn: 'EVL-WallBuilder: Extrude 5" & 10" walls up to 10ft height with 7ft lintels',
    tooltipBn: 'EVL-WallBuilder: ৭ ফুট লিন্টেল সহ ৫" ও ১০" দেয়াল ১০ ফুট উচ্চতায় তোলা',
    hasDropdown: true,
  },
  {
    id: 'slab',
    labelEn: 'Slab & Floor',
    labelBn: 'স্ল্যাব/ছাদ',
    iconText: '📐',
    badge: '6" Slab/Sunken',
    tagLayer: '04_SLABS_CEILING',
    tooltipEn: 'EVL-SlabFloor: 6" Suspended Slabs, -6" Sunken Toilet Drops & Balconies',
    tooltipBn: 'EVL-SlabFloor: ৬" ফ্লোর স্ল্যাব, টয়লেটের সানকেন স্ল্যাব ও ব্যালকনি',
  },
  {
    id: 'door',
    labelEn: 'Door Pro',
    labelBn: 'দরজা চৌকাঠ',
    iconText: '🚪',
    badge: 'Chowkath',
    tagLayer: '05_DOORS',
    tooltipEn: 'EVL-Door Pro: Chowkath frame, wooden shutter leaf & swing arc',
    tooltipBn: 'EVL-Door Pro: কাঠের চৌকাঠ, পাল্লা, হ্যান্ডেল ও সুইং ডোর',
  },
  {
    id: 'window',
    labelEn: 'Window Pro',
    labelBn: 'স্লাইডিং জানালা',
    iconText: '🪟',
    badge: '2/3-Track',
    tagLayer: '06_WINDOWS_GRILLS',
    tooltipEn: 'EVL-Window Pro: 2-Track & 3-Track sliding/casement aluminum windows',
    tooltipBn: 'EVL-Window Pro: ২ ও ৩ ট্র্যাক অ্যালুমিনিয়াম স্লাইডিং জানালা',
  },
  {
    id: 'grill',
    labelEn: 'Grill Pro',
    labelBn: 'সেফটি গ্রিল',
    iconText: '🛡️',
    badge: '10 Patterns',
    tagLayer: '06_WINDOWS_GRILLS',
    tooltipEn: 'EVL-Grill Pro: 10 Ornamental window safety grill patterns',
    tooltipBn: 'EVL-Grill Pro: ১০টি উইন্ডো সিকিউরিটি গ্রিল ডিজাইন',
  },
  {
    id: 'stair',
    labelEn: 'Stair Pro',
    labelBn: 'আরসিসি সিঁড়ি',
    iconText: '🪜',
    badge: 'Dog-Legged',
    tagLayer: '07_STAIRS_RAILING',
    tooltipEn: 'EVL-StairPro: BNBC code 6" riser, 10" tread, 4ft landing & waist slab',
    tooltipBn: 'EVL-StairPro: ৬" রাইজার, ১০" ট্রেড, মিড-ল্যান্ডিং ও ওয়েস্ট স্ল্যাব সহ সিঁড়ি',
  },
  {
    id: 'railing',
    labelEn: 'Railing Pro',
    labelBn: 'এসএস রেলিং',
    iconText: '🪜',
    badge: 'Smooth Curve',
    tagLayer: '07_STAIRS_RAILING',
    tooltipEn: 'EVL-Railing Pro: Smooth bend radius SS pipe & glass balustrade',
    tooltipBn: 'EVL-Railing Pro: স্মুথ বেন্ড রেডিয়াস সহ এসএস পাইপ ও গ্লাস রেলিং',
  },
  {
    id: 'roof',
    labelEn: 'Roof & Tank',
    labelBn: 'ছাদ ও ট্যাঙ্ক',
    iconText: '🏠',
    badge: '3ft Parapet',
    tagLayer: '08_ROOF_PARAPET',
    tooltipEn: 'EVL-RoofParapet: 3ft parapet wall, coping, LMR & 2000L water tank',
    tooltipBn: 'EVL-RoofParapet: ৩ ফুট প্যারাপেট দেয়াল, কোপিং, সিঁড়ি ঘর ও পানির ট্যাঙ্ক',
  },
  {
    id: 'boundary',
    labelEn: 'Boundary',
    labelBn: 'বাউন্ডারি দেয়াল',
    iconText: '🧱',
    badge: 'Perimeter',
    tagLayer: '12_BOUNDARY_SITE',
    tooltipEn: 'EVL-BoundaryWall: Perimeter masonry walls, RCC columns & coping',
    tooltipBn: 'EVL-BoundaryWall: জমির বাউন্ডারি দেয়াল, আরসিসি পিলার ও ড্রপ ওয়াল',
  },
  {
    id: 'gate',
    labelEn: 'Driveway Gate',
    labelBn: 'মেইন গেট',
    iconText: '⛩️',
    badge: 'Sliding/Swing',
    tagLayer: '12_BOUNDARY_SITE',
    tooltipEn: 'EVL-Gate Pro: Heavy driveway sliding gate & pedestrian wicket door',
    tooltipBn: 'EVL-Gate Pro: ভারী স্লাইডিং মেইন গেট ও পকেট গেট',
  },
  {
    id: 'bim',
    labelEn: 'BIM Modeler',
    labelBn: 'বিআইএম ব্রাউজার',
    iconText: '🏛️',
    badge: 'Revit-Style',
    tagLayer: 'BIM Hierarchy',
    tooltipEn: 'EVLab Building BIM: Levels, Grids, 2-click smart walls & room slabs',
    tooltipBn: 'EVLab Building BIM: লেভেল, গ্রিড, দেয়াল ও হোস্ট ওপেনিংস',
  },
  {
    id: 'boq',
    labelEn: 'BOQ Estimator',
    labelBn: 'বিওকিউ এস্টিমেট',
    iconText: '📊',
    badge: 'Live Takeoff',
    tagLayer: 'Cost Schedule',
    tooltipEn: 'EVL-QuantCost: Wall area, brick count, concrete volume & cost takeoff',
    tooltipBn: 'EVL-QuantCost: ইটের সংখ্যা, কনক্রিট ভলিউম ও নির্মাণ খরচ হিসাব',
  },
];

interface SketchUpToolbarProps {
  activeTool: SketchUpBuildingToolId;
  onSelectTool: (toolId: SketchUpBuildingToolId) => void;
  lang?: Language;
}

export const SketchUpToolbar: React.FC<SketchUpToolbarProps> = ({
  activeTool,
  onSelectTool,
  lang = 'bn',
}) => {
  const isBn = lang === 'bn';
  const currentItem = TOOLBAR_ITEMS.find((t) => t.id === activeTool) || TOOLBAR_ITEMS[0];
  const [hoveredTool, setHoveredTool] = useState<ToolbarItem | null>(null);

  return (
    <div className="space-y-2">
      {/* Informative Banner */}
      <div className="flex items-center justify-between text-xs bg-sky-950/80 border border-sky-800/80 rounded-lg px-3 py-1.5 text-sky-200">
        <div className="flex items-center gap-2">
          <span className="text-base">📌</span>
          <span>
            {isBn
              ? 'স্কেচআপে .rbz ফাইল ইনস্টল করলে ঠিক এইরকম একটি নেটিভ ডকেবল টুলবার (Dockable Toolbar) উপরে চলে আসবে।'
              : 'Installing this .rbz in SketchUp automatically docks this exact native Toolbar at the top of your workspace.'}
          </span>
        </div>
        <span className="font-mono text-[10px] bg-sky-800/60 px-2 py-0.5 rounded text-sky-100 font-bold">
          UI::Toolbar • EVLab Building 3D
        </span>
      </div>

      {/* The Authentic SketchUp Floating / Docked Toolbar Bar */}
      <div className="rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] dark:from-[#1e293b] dark:to-[#0f172a] shadow-md p-1.5 overflow-x-auto select-none">
        <div className="flex items-center gap-1 min-w-max">
          {/* SketchUp Dotted Grip Handle (like in screenshot) */}
          <div className="flex flex-col justify-center items-center px-1 text-slate-400 dark:text-slate-500 cursor-grab active:cursor-grabbing border-r border-slate-300 dark:border-slate-700 pr-1.5 mr-0.5">
            <div className="grid grid-cols-2 gap-0.5">
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
          </div>

          {/* Toolbar Buttons Side-by-Side */}
          {TOOLBAR_ITEMS.map((item, idx) => {
            const isSelected = activeTool === item.id;
            return (
              <React.Fragment key={item.id}>
                {/* Separators between functional groups */}
                {(idx === 2 || idx === 5 || idx === 8 || idx === 11 || idx === 13) && (
                  <div className="h-7 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
                )}

                <button
                  type="button"
                  onClick={() => onSelectTool(item.id)}
                  onMouseEnter={() => setHoveredTool(item)}
                  onMouseLeave={() => setHoveredTool(null)}
                  title={isBn ? item.tooltipBn : item.tooltipEn}
                  className={`relative group flex items-center justify-center p-1.5 rounded transition-all cursor-pointer h-9 ${
                    isSelected
                      ? 'bg-[#cce8ff] dark:bg-sky-950 border border-[#99d1ff] dark:border-sky-500 shadow-inner'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-800 border border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-lg leading-none filter drop-shadow-sm">
                      {item.iconText}
                    </span>
                    <span
                      className={`text-[11px] font-bold tracking-tight whitespace-nowrap ${
                        isSelected
                          ? 'text-sky-900 dark:text-sky-200 font-extrabold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isBn ? item.labelBn : item.labelEn}
                    </span>

                    {item.hasDropdown && (
                      <span className="text-[8px] text-slate-500 dark:text-slate-400 -ml-0.5">
                        ▼
                      </span>
                    )}
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Tool Status Bar (SketchUp Style Bottom Hint) */}
      <div className="flex flex-wrap items-center justify-between text-xs bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-600 dark:text-sky-400">
            [{hoveredTool ? (isBn ? hoveredTool.labelBn : hoveredTool.labelEn) : (isBn ? currentItem.labelBn : currentItem.labelEn)}]:
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            {hoveredTool ? (isBn ? hoveredTool.tooltipBn : hoveredTool.tooltipEn) : (isBn ? currentItem.tooltipBn : currentItem.tooltipEn)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-500">Auto-Tag Layer:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
            {currentItem.tagLayer}
          </span>
        </div>
      </div>
    </div>
  );
};
