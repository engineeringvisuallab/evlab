import React, { useState } from 'react';
import { Download, CheckCircle2, Check, Info } from 'lucide-react';
import { Language } from '../types';
import { PLUGINS_DATA } from '../data/plugins';
import { triggerPluginDownload } from '../utils/fileDownloader';

export interface BoundaryWallStyleItem {
  id: string;
  nameBn: string;
  nameEn: string;
  tagBn: string;
  tagEn: string;
  iconEmoji: string;
  type: 'brick5_coping' | 'brick10_pillars' | 'spike_top' | 'fair_face' | 'stone_clad' | 'dwarf_ss' | 'retaining_weep' | 'razor_wire' | 'precast_panels' | 'green_trellis';
  descBn: string;
  descEn: string;
  materialBn: string;
  materialEn: string;
  defaultH: number; // feet
  defaultThick: number; // inches
  copingTypeBn: string;
  copingTypeEn: string;
}

export const BOUNDARY_WALL_STYLES_LIST: BoundaryWallStyleItem[] = [
  {
    id: 'wall-1',
    nameBn: '১. ৫" ইটের বাউন্ডারি ওয়াল উইথ কনক্রিট ড্রিপ ক্যাপিং',
    nameEn: '1. 5" Brick Wall with Concrete Drip Coping',
    tagBn: 'আবাসিক স্ট্যান্ডার্ড',
    tagEn: 'Standard Residential',
    iconEmoji: '🧱',
    type: 'brick5_coping',
    descBn: '৫ ইঞ্চি গাঁথুনির দেওয়াল, উভয় পাশে সিমেন্ট প্লাস্টার এবং মাথায় বৃষ্টির পানি কাটার ড্রিপ খাঁজযুক্ত কনক্রিট ক্যাপিং।',
    descEn: 'Standard 5-inch brick masonry with smooth cement plaster and weather-drip overhanging concrete coping.',
    materialBn: 'স্মুথ প্লাস্টার পেইন্ট + স্টোন ক্যাপিং',
    materialEn: 'Smooth Plaster Paint + Stone Coping',
    defaultH: 6,
    defaultThick: 5,
    copingTypeBn: '৩" থিক আরসিসি ড্রিপ ক্যাপিং',
    copingTypeEn: '3" Thick RCC Drip Coping',
  },
  {
    id: 'wall-2',
    nameBn: '২. ১০" সলিড পেরিমিটার ওয়াল উইথ ১০\' পরপর আরসিসি পিলার',
    nameEn: '2. 10" Solid Wall with 10-ft Column Stiffeners',
    tagBn: 'ভারী পেরিমিটার',
    tagEn: 'Heavy Structural Stiffeners',
    iconEmoji: '🏛️',
    type: 'brick10_pillars',
    descBn: '১০ ইঞ্চি ভারী গাঁথুনি এবং প্রতি ১০ ফুট পর পর ১৫"x১৫" স্টিফেনার আরসিসি কলম। দীর্ঘস্থায়ী ও বাতাস প্রতিরোধে সেরা।',
    descEn: '10-inch thick perimeter masonry fortified with 15"x15" integrated RCC columns every 10 feet.',
    materialBn: 'সিমেন্ট প্লাস্টার ও মোল্ডেড কলাম ক্যাপিং',
    materialEn: 'Cement Plaster & Molded Column Caps',
    defaultH: 7,
    defaultThick: 10,
    copingTypeBn: '১৫"x১৫" পিরামিড কনক্রিট ক্যাপ',
    copingTypeEn: '15"x15" Pyramid Concrete Caps',
  },
  {
    id: 'wall-3',
    nameBn: '৩. বাউন্ডারি ওয়াল উইথ টপ এমএস সিকিউরিটি স্পাইক',
    nameEn: '3. Wall with Top MS Security Spike Grill',
    tagBn: 'উচ্চ নিরাপত্তা স্পাইক',
    tagEn: 'Anti-Climb Security Spikes',
    iconEmoji: '🛡️',
    type: 'spike_top',
    descBn: '৫ ফুট উঁচু দেওয়ালের উপরে অতিরিক্ত ২ ফুট উঁচু এমএস ধারালো স্পাইক বা অ্যারো-হেড সেফটি গ্রিল। চোর প্রতিরোধক।',
    descEn: 'Masonry wall topped by an integrated 2-foot high anti-climb welded security spike steel railing.',
    materialBn: 'প্লাস্টার্ড ওয়াল + ম্যাট ব্ল্যাক স্টিল',
    materialEn: 'Plastered Wall + Matte Black Steel',
    defaultH: 7,
    defaultThick: 6,
    copingTypeBn: 'এমএস বেস প্লেট মাউন্ট ক্যাপিং',
    copingTypeEn: 'MS Base Plate Mount Coping',
  },
  {
    id: 'wall-4',
    nameBn: '৪. মডার্ন আর্কিটেকচারাল ফেয়ার-ফেস কনক্রিট ওয়াল',
    nameEn: '4. Modern Fair-Face Architectural Concrete Wall',
    tagBn: 'কনটেম্পোরারি এক্সপোজড',
    tagEn: 'Contemporary Exposed Concrete',
    iconEmoji: '🏢',
    type: 'fair_face',
    descBn: 'শাটারিং টাই-হোল গ্রুভ ও ভি-লাইন সহ আধুনিক আনকোটেড ফেয়ার-ফেস আরসিসি দেওয়াল। মিনিমালিস্ট বাংলোর জন্য প্রিয়।',
    descEn: 'Architectural exposed concrete wall with modular formwork tie-rod holes and crisp chamfered grooves.',
    materialBn: 'ন্যাচারাল ফেয়ার-ফেস র কনক্রিট',
    materialEn: 'Natural Raw Fair-Face Concrete',
    defaultH: 6.5,
    defaultThick: 8,
    copingTypeBn: 'ইন্টিগ্রেটেড চামফার্ড কনক্রিট টপ',
    copingTypeEn: 'Integrated Chamfered Concrete Top',
  },
  {
    id: 'wall-5',
    nameBn: '৫. ন্যাচারাল স্লেট ও গ্রানাইট স্টোন ক্ল্যাডিং ওয়াল',
    nameEn: '5. Natural Slate & Granite Stone Cladding Wall',
    tagBn: 'লাক্সারি এক্সটেরিয়র',
    tagEn: 'Luxury Stone Clad Finish',
    iconEmoji: '🪨',
    type: 'stone_clad',
    descBn: 'মূল দেওয়ালের বাইরে রাফ স্লেট স্টোন ও ব্ল্যাক গ্রানাইট ক্যাপিংয়ের সংমিশ্রণ। বিলাসবহুল বাড়ির এক্সটেরিয়র।',
    descEn: 'Structural brick wall cladded with split-face natural slate stones and polished granite top coping slabs.',
    materialBn: 'রাফ স্লেট স্টোন ও ব্ল্যাক গ্রানাইট',
    materialEn: 'Split-Face Slate & Black Granite',
    defaultH: 6,
    defaultThick: 7,
    copingTypeBn: '১.৫" থিক পলিশড ব্ল্যাক গ্রানাইট স্ল্যাব',
    copingTypeEn: '1.5" Thick Polished Granite Slab',
  },
  {
    id: 'wall-6',
    nameBn: '৬. লো বাউন্ডারি ডুয়ার্ফ ওয়াল উইথ এসএস রেলিং',
    nameEn: '6. Low Dwarf Wall (3-ft) with SS Railing Top',
    tagBn: 'খোলামেলা আধুনিক ভিউ',
    tagEn: 'Open View Dwarf Wall',
    iconEmoji: '🪟',
    type: 'dwarf_ss',
    descBn: 'নিচে ৩ ফুট প্লাস্টার্ড বাউন্ডারি দেওয়াল এবং উপরে আড়াই ফুট চকচকে এসএস ৩০৪ গ্লাস বা পাইপ রেলিং।',
    descEn: '3-foot solid masonry parapet topped by a 2.5-foot stainless steel 304 pipe railing for open visibility.',
    materialBn: 'হোয়াইট প্লাস্টার + এসএস ৩০৪ মেটাল',
    materialEn: 'White Plaster + SS 304 Railing',
    defaultH: 5.5,
    defaultThick: 5,
    copingTypeBn: 'কনক্রিট ক্যাপিং উইথ এসএস স্পিগট',
    copingTypeEn: 'Concrete Coping with SS Spigots',
  },
  {
    id: 'wall-7',
    nameBn: '৭. রিটেইনিং গ্র্যাভিটি বাউন্ডারি ওয়াল (উইপ হোল সহ)',
    nameEn: '7. Retaining Gravity Wall with Sloped Batter & Weeps',
    tagBn: 'মাটি ভরাট ও পাহাড়ি ঢাল',
    tagEn: 'Soil Retaining with Weep Holes',
    iconEmoji: '📐',
    type: 'retaining_weep',
    descBn: 'নিচের দিকে চওড়া ঢালু ব্যাটার ওয়াল এবং পানি নিষ্কাশনের জন্য ৪" পিভিসি উইপ হোল পাইপ। মাটি ধরে রাখতে সক্ষম।',
    descEn: 'Mass gravity wall with 1:6 exterior batter slope and 4" PVC weep holes relieving hydrostatic pressure.',
    materialBn: 'হেভি আরসিসি ও উইপ হোল পাইপ',
    materialEn: 'Heavy Reinforced RCC & PVC Weeps',
    defaultH: 8,
    defaultThick: 14,
    copingTypeBn: 'আরসিসি ক্যান্টিলিভার ক্যাপিং',
    copingTypeEn: 'RCC Cantilever Overhang Coping',
  },
  {
    id: 'wall-8',
    nameBn: '৮. হাই সিকিউরিটি ওয়াল উইথ কনসার্টিনা রেজর ওয়্যার',
    nameEn: '8. High Security Wall with Concertina Razor Wire',
    tagBn: 'সর্বোচ্চ সামরিক নিরাপত্তা',
    tagEn: 'Military Grade Razor Wire',
    iconEmoji: '⚡',
    type: 'razor_wire',
    descBn: '৮ ফুট উঁচু দেওয়ালের ওপর ওয়াই-শেপড (Y) এঙ্গেল পোস্ট এবং স্প্রিংয়ের মতো কনসার্টিনা রেজর তারের খাঁচা।',
    descEn: 'High perimeter wall equipped with heavy Y-angled steel brackets supporting helical razor barbed coils.',
    materialBn: 'প্লাস্টার্ড দেওয়াল + গ্যালভানাইজড রেজর তার',
    materialEn: 'Plastered Wall + Galvanized Razor Wire',
    defaultH: 9.5,
    defaultThick: 10,
    copingTypeBn: 'ওয়াই-আর্ম স্টিল ব্র্যাকেট ক্যাপিং',
    copingTypeEn: 'Y-Arm Steel Bracket Mounts',
  },
  {
    id: 'wall-9',
    nameBn: '৯. প্রিকাস্ট কনক্রিট মডুলার ইন্টারলকিং ওয়াল',
    nameEn: '9. Precast Concrete Modular Interlocking Wall',
    tagBn: 'দ্রুত স্থাপনযোগ্য মডুলার',
    tagEn: 'Fast Precast Modular Assembly',
    iconEmoji: '🏗️',
    type: 'precast_panels',
    descBn: 'এইচ-বিম স্লটেড প্রিকাস্ট পোস্টের খাঁজে ওপর থেকে স্লাইড করে বসানো রিইনফোর্সড কনক্রিট স্ল্যাব। দ্রুততম সময়ে তৈরি।',
    descEn: 'Slotted precast H-column posts interlocking with horizontal 2" thick reinforced concrete wall planks.',
    materialBn: 'প্রিকাস্ট কনক্রিট ফিনিশ',
    materialEn: 'Precast Engineered Concrete',
    defaultH: 6,
    defaultThick: 6,
    copingTypeBn: 'প্রিকাস্ট ভি-গ্রুভ টপ স্ল্যাব',
    copingTypeEn: 'Precast V-Groove Top Planks',
  },
  {
    id: 'wall-10',
    nameBn: '১০. গ্রিন বাউন্ডারি ওয়াল উইথ প্ল্যান্টার নিস ও ট্রেলিস',
    nameEn: '10. Eco Green Wall with Planter Niches & Trellis',
    tagBn: 'সবুজ পরিবেশবান্ধব',
    tagEn: 'Eco Greenery & Trellis',
    iconEmoji: '🌿',
    type: 'green_trellis',
    descBn: 'দেওয়ালের গায়ে ফুল ও লতাগাছের জন্য খাঁজযুক্ত প্ল্যান্টার বক্স ও উপরে কাঠের বা মেটালের ক্রিপার ট্রেলিস জালি।',
    descEn: 'Perimeter wall featuring recessed planter niches and an upper steel wire trellis for climbing greenery.',
    materialBn: 'আর্থ ব্রাউন প্লাস্টার ও গ্রিনারি টপ',
    materialEn: 'Earth Brown Plaster & Wire Trellis',
    defaultH: 6.5,
    defaultThick: 8,
    copingTypeBn: 'প্ল্যান্টার বক্স ক্যাপিং ট্রফ',
    copingTypeEn: 'Planter Box Coping Trough',
  },
];

interface BoundaryWallVisualizerProps {
  lang: Language;
}

export const BoundaryWallVisualizer: React.FC<BoundaryWallVisualizerProps> = ({ lang }) => {
  const [selectedWallId, setSelectedWallId] = useState<string>('wall-1');
  const [wallHeight, setWallHeight] = useState<number>(6);
  const [wallThickness, setWallThickness] = useState<number>(5);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const activeWall = BOUNDARY_WALL_STYLES_LIST.find((w) => w.id === selectedWallId) || BOUNDARY_WALL_STYLES_LIST[0];

  const handleDownload = async () => {
    setDownloading(true);
    const plugin = PLUGINS_DATA.find((p) => p.id === 'sketchup-evl-boundarywall');
    if (plugin) {
      await triggerPluginDownload(plugin);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
    setDownloading(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧱</span>
            <h4 className="text-sm font-semibold text-white">
              {lang === 'bn' ? 'EVL-BoundaryWall: ১০টি বাউন্ডারি ওয়াল ও সীমানা প্রাচীর জেনারেটর' : 'EVL-BoundaryWall: 10 Architectural Boundary Wall Styles'}
            </h4>
            <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              Coping & Column Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'গাঁথুনি, প্লাস্টার, আরসিসি পিলার, কনক্রিট ক্যাপিং ও সিকিউরিটি গ্রিল সহ স্বয়ংক্রিয় ৩ডি সীমানা প্রাচীর'
              : 'Parametric 3D boundary wall generator with masonry thickness, columns, coping drip, and security toppings'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{lang === 'bn' ? 'ডাউনলোড সফল (.rbz)' : 'Downloaded (.rbz)'}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{lang === 'bn' ? 'EVL-BoundaryWall.rbz ডাউনলোড' : 'Download EVL-BoundaryWall.rbz'}</span>
            </>
          )}
        </button>
      </div>

      {/* Style Selector Grid */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          {lang === 'bn' ? 'বাউন্ডারি ওয়াল স্টাইল নির্বাচন করুন (১০টি অপশন):' : 'Select Boundary Wall Style (10 Architectural Options):'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {BOUNDARY_WALL_STYLES_LIST.map((style) => {
            const isSelected = style.id === selectedWallId;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  setSelectedWallId(style.id);
                  setWallHeight(style.defaultH);
                  setWallThickness(style.defaultThick);
                }}
                className={`flex flex-col items-start text-left p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-base">{style.iconEmoji}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-xs font-semibold line-clamp-1">
                  {lang === 'bn' ? style.nameBn : style.nameEn}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {lang === 'bn' ? style.tagBn : style.tagEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Visual Canvas & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Visual SVG Canvas */}
        <div className="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                {lang === 'bn' ? 'দেওয়াল ক্রস-সেকশন ও ৩ডি পেরিমিটার প্রিভিউ' : 'Wall Elevation, Columns & Coping Preview'}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {wallHeight}&apos; Height x {wallThickness}&quot; Thick
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">
              Auto-Material: {lang === 'bn' ? activeWall.materialBn : activeWall.materialEn}
            </span>
          </div>

          {/* SVG Boundary Wall Render */}
          <div className="w-full h-64 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg p-3 border border-slate-800/50">
            <svg viewBox="0 0 540 260" className="w-full h-full max-h-60 drop-shadow-xl">
              {/* Ground Trench / Footing Line */}
              <line x1="10" y1="235" x2="530" y2="235" stroke="#334155" strokeWidth="4" />
              <rect x="20" y="235" width="500" height="20" fill="#1e293b" opacity="0.6" />
              <text x="270" y="248" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">
                GROUND LEVEL (GL)
              </text>

              {/* 1. Brick 5" with Coping */}
              {activeWall.type === 'brick5_coping' && (
                <g>
                  {/* Brick Wall Infill */}
                  <rect x="40" y="100" width="460" height="135" fill="#ca8a04" stroke="#854d0e" strokeWidth="2" />
                  {/* Brick courses lines */}
                  {[...Array(6)].map((_, i) => (
                    <line key={`bw-${i}`} x1="40" y1={120 + i * 20} x2="500" y2={120 + i * 20} stroke="#a16207" strokeWidth="1" strokeDasharray="15 10" />
                  ))}
                  {/* Stiffener Columns */}
                  <rect x="40" y="90" width="30" height="145" fill="#64748b" stroke="#334155" strokeWidth="2" />
                  <rect x="255" y="90" width="30" height="145" fill="#64748b" stroke="#334155" strokeWidth="2" />
                  <rect x="470" y="90" width="30" height="145" fill="#64748b" stroke="#334155" strokeWidth="2" />
                  {/* Concrete Overhanging Coping Slab */}
                  <polygon points="35,100 505,100 500,85 40,85" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
                  <rect x="35" y="95" width="470" height="5" fill="#64748b" />
                </g>
              )}

              {/* 2. 10" Wall with Heavy Columns */}
              {activeWall.type === 'brick10_pillars' && (
                <g>
                  <rect x="40" y="90" width="460" height="145" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                  {/* Massive 15x15 Stiffeners */}
                  <rect x="40" y="70" width="45" height="165" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                  <polygon points="35,70 90,70 62,55" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

                  <rect x="247" y="70" width="45" height="165" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                  <polygon points="242,70 297,70 270,55" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

                  <rect x="455" y="70" width="45" height="165" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                  <polygon points="450,70 505,70 477,55" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

                  {/* Concrete Cap */}
                  <polygon points="85,90 247,90 245,78 87,78" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
                  <polygon points="292,90 455,90 453,78 294,78" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
                </g>
              )}

              {/* 3. Wall with Security Spikes */}
              {activeWall.type === 'spike_top' && (
                <g>
                  {/* Solid Wall */}
                  <rect x="40" y="115" width="460" height="120" fill="#64748b" stroke="#334155" strokeWidth="2" />
                  <polygon points="35,115 505,115 500,105 40,105" fill="#94a3b8" />
                  {/* Steel Spike Railing */}
                  <line x1="40" y1="105" x2="500" y2="105" stroke="#1e293b" strokeWidth="4" />
                  <line x1="40" y1="65" x2="500" y2="65" stroke="#1e293b" strokeWidth="4" />
                  {[...Array(20)].map((_, i) => {
                    const x = 50 + i * 23;
                    return (
                      <g key={`spk-w-${i}`}>
                        <line x1={x} y1="105" x2={x} y2="50" stroke="#f8fafc" strokeWidth="2.5" />
                        <polygon points={`${x - 4},50 ${x + 4},50 ${x},35`} fill="#f8fafc" />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 4. Fair-Face Concrete */}
              {activeWall.type === 'fair_face' && (
                <g>
                  <rect x="40" y="80" width="460" height="155" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
                  {/* Shuttering Panels & Tie Holes */}
                  <line x1="40" y1="155" x2="500" y2="155" stroke="#475569" strokeWidth="2" />
                  <line x1="190" y1="80" x2="190" y2="235" stroke="#475569" strokeWidth="2" />
                  <line x1="350" y1="80" x2="350" y2="235" stroke="#475569" strokeWidth="2" />
                  {[115, 195].map((y) =>
                    [110, 270, 425].map((x) => (
                      <circle key={`tie-${x}-${y}`} cx={x} cy={y} r="4" fill="#334155" stroke="#cbd5e1" strokeWidth="1" />
                    )),
                  )}
                  <text x="270" y="105" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="bold" letterSpacing="1">
                    ARCHITECTURAL EXPOSED FAIR-FACE CONCRETE
                  </text>
                </g>
              )}

              {/* 5. Stone Cladding */}
              {activeWall.type === 'stone_clad' && (
                <g>
                  <rect x="40" y="90" width="460" height="145" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                  {/* Split Slate courses */}
                  {[...Array(8)].map((_, i) => (
                    <line key={`stn-${i}`} x1="40" y1={105 + i * 16} x2="500" y2={105 + i * 16} stroke="#451a03" strokeWidth="1.5" />
                  ))}
                  {/* Black Granite Top Coping */}
                  <rect x="35" y="80" width="470" height="12" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                  <line x1="35" y1="82" x2="505" y2="82" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
                  <text x="270" y="89" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
                    POLISHED BLACK GRANITE COPING SLAB
                  </text>
                </g>
              )}

              {/* 6. Dwarf Wall with SS Railing */}
              {activeWall.type === 'dwarf_ss' && (
                <g>
                  {/* 3ft Dwarf Wall */}
                  <rect x="40" y="160" width="460" height="75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                  <polygon points="35,160 505,160 500,150 40,150" fill="#94a3b8" />
                  {/* Top SS Railing */}
                  <line x1="40" y1="65" x2="500" y2="65" stroke="#cbd5e1" strokeWidth="6" />
                  {[...Array(6)].map((_, i) => {
                    const x = 50 + i * 85;
                    return (
                      <g key={`ss-p-${i}`}>
                        <rect x={x} y="65" width="8" height="85" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
                        <rect x={x - 4} y="145" width="16" height="5" fill="#64748b" rx="1" />
                      </g>
                    );
                  })}
                  {/* Glass Infills */}
                  {[...Array(5)].map((_, i) => (
                    <rect key={`ss-g-${i}`} x={62 + i * 85} y="75" width="70" height="70" fill="#38bdf8" opacity="0.4" stroke="#0ea5e9" strokeWidth="1" />
                  ))}
                </g>
              )}

              {/* 7. Retaining Gravity Wall */}
              {activeWall.type === 'retaining_weep' && (
                <g>
                  {/* Sloped Face Batter */}
                  <polygon points="70,60 480,60 510,235 40,235" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                  <rect x="65" y="50" width="420" height="12" fill="#94a3b8" />
                  {/* Weep Holes */}
                  {[100, 200, 300, 400].map((x) => (
                    <g key={`weep-${x}`}>
                      <circle cx={x} cy="210" r="7" fill="#020617" stroke="#38bdf8" strokeWidth="2" />
                      <line x1={x} y1="217" x2={x - 5} y2="235" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />
                    </g>
                  ))}
                  <text x="270" y="140" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="bold">
                    1:6 INCLINED BATTER GRAVITY WALL (WITH WEEPHOLES)
                  </text>
                </g>
              )}

              {/* 8. Wall with Concertina Razor Wire */}
              {activeWall.type === 'razor_wire' && (
                <g>
                  {/* High Wall */}
                  <rect x="40" y="110" width="460" height="125" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                  {/* Y-Arm Brackets */}
                  {[60, 180, 300, 420].map((x) => (
                    <g key={`y-arm-${x}`}>
                      <line x1={x} y1="110" x2={x} y2="80" stroke="#f8fafc" strokeWidth="4" />
                      <line x1={x} y1="80" x2={x - 20} y2="50" stroke="#f8fafc" strokeWidth="4" />
                      <line x1={x} y1="80" x2={x + 20} y2="50" stroke="#f8fafc" strokeWidth="4" />
                    </g>
                  ))}
                  {/* Coiled Razor Barbed Wire Loops */}
                  {[...Array(18)].map((_, i) => (
                    <circle key={`razor-${i}`} cx={55 + i * 25} cy="65" r="16" fill="none" stroke="#e2e8f0" strokeWidth="2" opacity="0.85" strokeDasharray="8 4" />
                  ))}
                  <line x1="40" y1="65" x2="500" y2="65" stroke="#ef4444" strokeWidth="2" />
                  <text x="270" y="40" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
                    DANGER: HIGH-SECURITY CONCERTINA COILS
                  </text>
                </g>
              )}

              {/* 9. Precast Modular Interlocking */}
              {activeWall.type === 'precast_panels' && (
                <g>
                  {/* Precast H-Posts */}
                  {[40, 155, 270, 385, 500].map((x) => (
                    <rect key={`h-post-${x}`} x={x - 12} y="70" width="24" height="165" fill="#334155" stroke="#64748b" strokeWidth="2" />
                  ))}
                  {/* Horizontal Precast Planks */}
                  {[...Array(5)].map((_, i) => {
                    const y = 85 + i * 28;
                    return (
                      <g key={`pc-plank-${i}`}>
                        <rect x="52" y={y} width="91" height="25" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" rx="1" />
                        <rect x="167" y={y} width="91" height="25" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" rx="1" />
                        <rect x="282" y={y} width="91" height="25" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" rx="1" />
                        <rect x="397" y={y} width="91" height="25" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" rx="1" />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 10. Green Wall with Trellis */}
              {activeWall.type === 'green_trellis' && (
                <g>
                  <rect x="40" y="110" width="460" height="125" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                  {/* Recessed planter niches */}
                  {[70, 180, 290, 400].map((x) => (
                    <g key={`niche-${x}`}>
                      <rect x={x} y="135" width="80" height="40" fill="#1e293b" stroke="#334155" strokeWidth="2" rx="2" />
                      <circle cx={x + 25} cy="155" r="10" fill="#15803d" />
                      <circle cx={x + 45} cy="150" r="12" fill="#22c55e" />
                      <circle cx={x + 60} cy="155" r="9" fill="#16a34a" />
                    </g>
                  ))}
                  {/* Steel Trellis Grid at Top */}
                  <rect x="40" y="55" width="460" height="55" fill="none" stroke="#22c55e" strokeWidth="2" />
                  {[...Array(12)].map((_, i) => (
                    <line key={`trl-v-${i}`} x1={40 + i * 38} y1="55" x2={40 + i * 38} y2="110" stroke="#16a34a" strokeWidth="1.5" />
                  ))}
                  {[...Array(3)].map((_, j) => (
                    <line key={`trl-h-${j}`} x1="40" y1={70 + j * 15} x2="500" y2={70 + j * 15} stroke="#16a34a" strokeWidth="1.5" />
                  ))}
                  <text x="270" y="45" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="bold">
                    BIOPHILIC LIVING WALL & PLANT TRELLIS
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Quick Sliders */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-300 font-medium">
                {lang === 'bn' ? 'দেওয়াল উচ্চতা (Height):' : 'Height (Feet):'}
              </span>
              <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={wallHeight}
                  onChange={(e) => setWallHeight(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-emerald-400 w-10 text-right">
                  {wallHeight}&apos;
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-300 font-medium">
                {lang === 'bn' ? 'পুরুত্ব (Thickness):' : 'Thickness (Inches):'}
              </span>
              <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="1"
                  value={wallThickness}
                  onChange={(e) => setWallThickness(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-emerald-400 w-10 text-right">
                  {wallThickness}&quot;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeWall.iconEmoji}</span>
              <div>
                <h5 className="text-sm font-bold text-white">
                  {lang === 'bn' ? activeWall.nameBn : activeWall.nameEn}
                </h5>
                <span className="text-xs text-emerald-400 font-medium">
                  {lang === 'bn' ? activeWall.tagBn : activeWall.tagEn}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'bn' ? activeWall.descBn : activeWall.descEn}
            </p>

            <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'ক্যাপিং টাইপ:' : 'Coping Type:'}</span>
                <span className="text-slate-200 font-medium">
                  {lang === 'bn' ? activeWall.copingTypeBn : activeWall.copingTypeEn}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'অটো-মেটেরিয়াল:' : 'Auto Material:'}</span>
                <span className="text-emerald-300 font-medium">
                  {lang === 'bn' ? activeWall.materialBn : activeWall.materialEn}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'ড্রয়িং মোড:' : 'Path Mode:'}</span>
                <span className="text-amber-400 font-medium">Single Edge or Continuous Polyline</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'স্কেচআপ ব্যবহারের পদ্ধতি' : 'SketchUp Workflow'}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'bn'
                ? '১. প্লট বাউন্ডারি লাইন সিলেক্ট করুন (একটি বা একাধিক অবিচ্ছিন্ন লাইন)\n২. Extensions > EVLab Tools > EVL-BoundaryWall ক্লিক করুন\n৩. ১০টি ওয়াল স্টাইলের যেকোনোটি বেছে নিয়ে এক ক্লিকেই তৈরি করুন।'
                : '1. Select the perimeter plot boundary edge or polyline.\n2. Open Extensions > EVLab Tools > EVL-BoundaryWall.\n3. Pick any of the 10 wall types to generate 3D solid wall with pillars and coping.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
