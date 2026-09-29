import React, { useState } from 'react';
import { Download, CheckCircle2, Check, Info } from 'lucide-react';
import { Language } from '../types';
import { PLUGINS_DATA } from '../data/plugins';
import { triggerPluginDownload } from '../utils/fileDownloader';

export interface GateStyleItem {
  id: string;
  nameBn: string;
  nameEn: string;
  tagBn: string;
  tagEn: string;
  iconEmoji: string;
  type: 'cnc_gate' | 'wrought_royal' | 'sliding_roller' | 'wood_steel' | 'spear_picket' | 'industrial_mesh' | 'arched_villa' | 'bifold_speed' | 'louver_privacy' | 'wicket_integrated';
  descBn: string;
  descEn: string;
  materialBn: string;
  materialEn: string;
  defaultW: number; // feet
  defaultH: number; // feet
  pillarTypeBn: string;
  pillarTypeEn: string;
}

export const GATE_STYLES_LIST: GateStyleItem[] = [
  {
    id: 'gate-1',
    nameBn: '১. মডার্ন সিএনসি লেজার-কাট মেটাল মেইন গেট',
    nameEn: '1. Modern CNC Laser-Cut Steel Main Gate',
    tagBn: 'আধুনিক লাক্সারি আর্কিটেকচার',
    tagEn: 'Modern CNC Architecture',
    iconEmoji: '⛩️',
    type: 'cnc_gate',
    descBn: '৩"x১.৫" বক্স ফ্রেমের ভেতরে ৪ মিমি সিএনসি মেটাল শিটে জ্যামিতিক ইসলামিক/প্যারামেট্রিক প্যাটার্ন এবং সাইড লাইট ফিক্সচার।',
    descEn: 'Architectural heavy box frame holding precision CNC laser-cut 4mm steel screens with backplate contrast.',
    materialBn: 'চারকোল টেক্সচার্ড পাউডার কোট',
    materialEn: 'Charcoal Textured Powder Coat',
    defaultW: 14,
    defaultH: 7,
    pillarTypeBn: '১৮"x১৮" আরসিসি প্লাস্টার্ড পিলার',
    pillarTypeEn: '18"x18" RCC Plastered Columns',
  },
  {
    id: 'gate-2',
    nameBn: '২. গ্র্যান্ড ডাবল সুইং রট আয়রন রাজকীয় গেট',
    nameEn: '2. Grand Royal Wrought Iron Double Swing Gate',
    tagBn: 'রয়েল প্যালেস লুক',
    tagEn: 'Royal Estate Finials',
    iconEmoji: '⚜️',
    type: 'wrought_royal',
    descBn: 'মাঝে রাজকীয় মেডেলিয়ন, উপরে খিলানযুক্ত কার্ভ, গোল্ডেন কাস্ট স্পিয়ার ও ভারী কব্জা। অভিজাত বাংলোর প্রবেশদ্বার।',
    descEn: 'Hand-forged curved crest with golden spearhead finials, ornamental medallions, and heavy ball hinges.',
    materialBn: 'অ্যান্টিক ব্ল্যাক রট আয়রন ও গোল্ডেন এক্সেন্ট',
    materialEn: 'Antique Black Wrought Iron & Gold Leaf',
    defaultW: 16,
    defaultH: 8,
    pillarTypeBn: 'ন্যাচারাল স্টোন ক্ল্যাডিং পিলার',
    pillarTypeEn: 'Natural Stone Cladded Pillars',
  },
  {
    id: 'gate-3',
    nameBn: '৩. হেভি ক্যান্টিলিভার স্লাইডিং রোলার গেট',
    nameEn: '3. Heavy Cantilever Sliding Roller Driveway Gate',
    tagBn: 'অটোমেটিক স্লাইডিং',
    tagEn: 'Motorized Roller Track',
    iconEmoji: '↔️',
    type: 'sliding_roller',
    descBn: 'একপাশে ট্র্যাকে গড়িয়ে যাওয়া স্লাইডিং গেট। ড্রাইভওয়েতে সুইং করার জায়গা না থাকলে এটিই সবচেয়ে কার্যকরী।',
    descEn: 'Heavy-duty ground track and nylon top rollers designed for automated motorized sliding driveway access.',
    materialBn: 'গ্যালভানাইজড এমএস ও মেটালিক গ্রে',
    materialEn: 'Galvanized MS & Metallic Grey',
    defaultW: 15,
    defaultH: 6.5,
    pillarTypeBn: 'গাইড পোস্ট ও মোটর এনক্লোজার',
    pillarTypeEn: 'Guide Post & Motor Enclosure',
  },
  {
    id: 'gate-4',
    nameBn: '৪. কনটেম্পোরারি কাঠ ও ব্ল্যাক স্টিল কম্বো গেট',
    nameEn: '4. Contemporary Timber & Black Steel Slat Gate',
    tagBn: 'কাঠ ও মেটালের যুগলবন্দী',
    tagEn: 'Warm Wood & Steel',
    iconEmoji: '🪵',
    type: 'wood_steel',
    descBn: 'ম্যাট ব্ল্যাক স্টিল কাঠামোর মাঝে ন্যাচারাল টিক উড বা ডব্লিউপিসি কাঠের স্ল্যাট। আধুনিক বাড়ির সাথে দারুণ মানানসই।',
    descEn: 'Matte black structural steel perimeter framing warm horizontal teak wood slats with anti-weather sealing.',
    materialBn: 'ম্যাট ব্ল্যাক স্টিল ও ন্যাচারাল কাঠ পলিশ',
    materialEn: 'Matte Black Steel & Natural Teak Wood',
    defaultW: 14,
    defaultH: 7,
    pillarTypeBn: 'ফেয়ার-ফেস কনক্রিট পিলার',
    pillarTypeEn: 'Fair-Face Concrete Pillars',
  },
  {
    id: 'gate-5',
    nameBn: '৫. ভার্টিকাল পিকেট সিকিউরিটি গেট (স্পিয়ার হেড)',
    nameEn: '5. Vertical Picket Security Gate with Spear Finials',
    tagBn: 'নিরাপত্তা ও সীমানা',
    tagEn: 'High-Security Perimeter',
    iconEmoji: '🗡️',
    type: 'spear_picket',
    descBn: '৩/৪" স্কয়ার সলিড বার ৩" পর পর এবং মাথায় সূক্ষ্ম ত্রিশূল স্পিয়ার। অনুপ্রবেশ প্রতিরোধে অত্যন্ত নির্ভরযোগ্য।',
    descEn: 'Solid square pickets extending into sharp spear finials along the top rail for perimeter security.',
    materialBn: 'ইন্ডাস্ট্রিয়াল ব্ল্যাক পাউডার কোট',
    materialEn: 'Industrial Black Powder Coat',
    defaultW: 12,
    defaultH: 7,
    pillarTypeBn: 'ইটের গাঁথুনি উইথ কনক্রিট ক্যাপ',
    pillarTypeEn: 'Brick Masonry with Concrete Cap',
  },
  {
    id: 'gate-6',
    nameBn: '৬. ইন্ডাস্ট্রিয়াল হেভি মেশ অ্যান্ড চ্যানেল ফ্যাক্টরি গেট',
    nameEn: '6. Heavy Industrial Mesh & Channel Factory Gate',
    tagBn: 'ফ্যাক্টরি ও ওয়্যারহাউস',
    tagEn: 'Industrial Heavy Duty',
    iconEmoji: '🏭',
    type: 'industrial_mesh',
    descBn: '৪" চ্যানেল স্টিল ফ্রেম এবং হেভি এক্সপ্যান্ডেড মেটাল মেশ। কারখানা, গুদাম ও ভারী ট্রাক চলাচলের প্রধান গেট।',
    descEn: '4" steel channel frame holding heavy diamond expanded metal mesh for commercial loading yards.',
    materialBn: 'অ্যান্টি-রাস্ট রেড অক্সাইড + গ্রে পলিয়েস্টার',
    materialEn: 'Anti-Rust Primer + Grey Industrial Coat',
    defaultW: 18,
    defaultH: 8,
    pillarTypeBn: 'আই-সেকশন স্টিল কলম পিলার',
    pillarTypeEn: 'I-Section Steel Column Posts',
  },
  {
    id: 'gate-7',
    nameBn: '৭. লাক্সারি ভিলা আর্চ টপ ডাবল লিফ গেট',
    nameEn: '7. Luxury Villa Arched Top Crest Double Gate',
    tagBn: 'উঁচু খিলান ভিলা গেট',
    tagEn: 'Arched Villa Crest',
    iconEmoji: '🏰',
    type: 'arched_villa',
    descBn: 'উভয় পাল্লার মাথায় অর্ধবৃত্তাকার ধনুকের মতো কার্ভ এবং মাঝে ইনট্রিকেট স্ক্রোলওয়ার্ক। ভিলার শোভা বৃদ্ধি করে।',
    descEn: 'Gracefully curved arched top meeting in the center with classical forged scrolls and forged gate drop-bolt.',
    materialBn: 'ব্রোঞ্জ ফিনিশ ও কাস্ট আয়রন লিফ',
    materialEn: 'Aged Bronze Finish & Cast Iron Foliage',
    defaultW: 14,
    defaultH: 8.5,
    pillarTypeBn: 'মোল্ডেড ক্লাসিকাল পিলার উইথ ল্যাম্প',
    pillarTypeEn: 'Classical Molded Pillars with Lanterns',
  },
  {
    id: 'gate-8',
    nameBn: '৮. বাই-ফোল্ডিং স্পিড গেট (ফোল্ডিং ড্রাইভওয়ে)',
    nameEn: '8. Bi-Folding Fast Action Driveway Gate',
    tagBn: 'অর্ধেক সুইং স্পেস',
    tagEn: 'Fast Bi-Fold 50% Space',
    iconEmoji: '⚡',
    type: 'bifold_speed',
    descBn: 'প্রতি পাশে দুটি করে পাল্লা ভাজ হয়ে খোলে, ফলে সামনে মাত্র অর্ধেক সুইং জায়গা প্রয়োজন হয়। দ্রুত খোলে ও বন্ধ হয়।',
    descEn: 'Two articulated leaves folding in tandem on each side requiring only half the turning clearance of swing gates.',
    materialBn: 'অ্যানথ্রাসাইট ডার্ক গ্রে স্টিল',
    materialEn: 'Anthracite Dark Grey Steel',
    defaultW: 14,
    defaultH: 6.5,
    pillarTypeBn: 'হেভি ডিউটি হিঞ্জ পোস্ট',
    pillarTypeEn: 'Heavy Duty Structural Hinge Post',
  },
  {
    id: 'gate-9',
    nameBn: '৯. মডার্ন লুভার ফুল-প্রাইভেসি গেট',
    nameEn: '9. Modern Louvered Zero-Visibility Privacy Gate',
    tagBn: 'শতভাগ প্রাইভেসি ও বাতাস',
    tagEn: '100% Sight Screen Privacy',
    iconEmoji: '🛡️',
    type: 'louver_privacy',
    descBn: 'সমান্তরাল ৪৫ ডিগ্রি মেটাল স্ল্যাট যাতে বাইরে থেকে ভেতরের ড্রাইভওয়ে বা গাড়ি কোনোভাবেই দেখা না যায়।',
    descEn: 'Overlapping 45-degree horizontal steel louvers preventing sightlines while allowing breeze penetration.',
    materialBn: 'ম্যাট ব্ল্যাক অ্যালুমিনিয়াম / এমএস',
    materialEn: 'Matte Black Architectural MS/Alum',
    defaultW: 12,
    defaultH: 7,
    pillarTypeBn: 'স্মুথ প্লাস্টার্ড কনক্রিট কলাম',
    pillarTypeEn: 'Smooth Plastered Concrete Pillars',
  },
  {
    id: 'gate-10',
    nameBn: '১০. পথচারী উইকেট ডোর সহ ইন্টিগ্রেটেড গেট',
    nameEn: '10. Integrated Wicket Pedestrian Main Driveway Gate',
    tagBn: 'গাড়ি ও ছোট প্রবেশদ্বার',
    tagEn: 'Vehicle + Small Access Door',
    iconEmoji: '🚪',
    type: 'wicket_integrated',
    descBn: 'মূল বড় ড্রাইভওয়ে গেটের ভেতরই ৩ ফুট চওড়া একটি আলাদা উইকেট ডোর (Wicket Door) যুক্ত।',
    descEn: 'Full 14-foot vehicle gate incorporating a built-in 3-foot swing door for daily pedestrian access.',
    materialBn: 'চারকোল মেটালিক ও ব্রাস হ্যান্ডেল',
    materialEn: 'Charcoal Metallic & Brass Handle',
    defaultW: 15,
    defaultH: 7,
    pillarTypeBn: 'আরসিসি পিলার উইথ ইন্টারকম বক্স',
    pillarTypeEn: 'RCC Pillar with Video Intercom Niche',
  },
];

interface GateVisualizerProps {
  lang: Language;
}

export const GateVisualizer: React.FC<GateVisualizerProps> = ({ lang }) => {
  const [selectedGateId, setSelectedGateId] = useState<string>('gate-1');
  const [gateWidth, setGateWidth] = useState<number>(14);
  const [gateHeight, setGateHeight] = useState<number>(7);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const activeGate = GATE_STYLES_LIST.find((g) => g.id === selectedGateId) || GATE_STYLES_LIST[0];

  const handleDownload = async () => {
    setDownloading(true);
    const plugin = PLUGINS_DATA.find((p) => p.id === 'sketchup-evl-gate');
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
            <span className="text-xl">⛩️</span>
            <h4 className="text-sm font-semibold text-white">
              {lang === 'bn' ? 'EVL-Gate: ১০টি প্রধান ফটক ও ড্রাইভওয়ে গেট জেনারেটর' : 'EVL-Gate: 10 Main Entrance & Driveway Gate Styles'}
            </h4>
            <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              Pillar & Leaf Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'আরসিসি পিলার, ক্যাপিং, সুইং/স্লাইডিং ফ্রেম ও মেটালিক মেটেরিয়াল সহ পূর্ণাঙ্গ ৩ডি গেট তৈরি'
              : 'Parametric 3D gate generator building masonry pillars, structural leaf frames, and decorative infill'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{lang === 'bn' ? 'ডাউনলোড সফল (.rbz)' : 'Downloaded (.rbz)'}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{lang === 'bn' ? 'EVL-Gate.rbz ডাউনলোড' : 'Download EVL-Gate.rbz'}</span>
            </>
          )}
        </button>
      </div>

      {/* Style Selector Grid */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          {lang === 'bn' ? 'গেট স্টাইল নির্বাচন করুন (১০টি অপশন):' : 'Select Main Gate Style (10 Architectural Presets):'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {GATE_STYLES_LIST.map((style) => {
            const isSelected = style.id === selectedGateId;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  setSelectedGateId(style.id);
                  setGateWidth(style.defaultW);
                  setGateHeight(style.defaultH);
                }}
                className={`flex flex-col items-start text-left p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-base">{style.iconEmoji}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
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
                {lang === 'bn' ? 'গেট এলিভেশন, পিলার ও ফ্রেম প্রিভিউ' : 'Gate Elevation, Pillars & Infill Preview'}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {gateWidth}&apos; Width x {gateHeight}&apos; Height
              </span>
            </div>
            <span className="text-[11px] text-amber-400 font-mono">
              Auto-Material: {lang === 'bn' ? activeGate.materialBn : activeGate.materialEn}
            </span>
          </div>

          {/* SVG Gate Render */}
          <div className="w-full h-64 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg p-3 border border-slate-800/50">
            <svg viewBox="0 0 540 260" className="w-full h-full max-h-60 drop-shadow-xl">
              {/* Ground Road Line */}
              <line x1="10" y1="240" x2="530" y2="240" stroke="#475569" strokeWidth="4" />
              <line x1="10" y1="242" x2="530" y2="242" stroke="#64748b" strokeWidth="2" strokeDasharray="10 10" />

              {/* Left Pillar */}
              <rect x="20" y="30" width="55" height="210" fill="#334155" stroke="#1e293b" strokeWidth="2" />
              {/* Pillar Cap with Light */}
              <polygon points="15,30 80,30 75,18 20,18" fill="#475569" stroke="#64748b" strokeWidth="1" />
              <rect x="42" y="8" width="12" height="10" fill="#facc15" stroke="#ca8a04" strokeWidth="1" rx="2" />

              {/* Right Pillar */}
              <rect x="465" y="30" width="55" height="210" fill="#334155" stroke="#1e293b" strokeWidth="2" />
              <polygon points="460,30 525,30 520,18 465,18" fill="#475569" stroke="#64748b" strokeWidth="1" />
              <rect x="487" y="8" width="12" height="10" fill="#facc15" stroke="#ca8a04" strokeWidth="1" rx="2" />

              {/* Main Gate Clear Opening Area: 85 to 455 (Width 370) */}

              {/* 1. CNC Laser Cut Gate */}
              {activeGate.type === 'cnc_gate' && (
                <g>
                  {/* Left Leaf */}
                  <rect x="85" y="55" width="180" height="180" fill="#0f172a" stroke="#64748b" strokeWidth="6" rx="2" />
                  <rect x="95" y="65" width="160" height="160" fill="#1e293b" />
                  {[...Array(5)].map((_, r) =>
                    [...Array(5)].map((_, c) => (
                      <circle key={`cnc1-${r}-${c}`} cx={115 + c * 30} cy={85 + r * 30} r="9" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                    )),
                  )}
                  {/* Right Leaf */}
                  <rect x="275" y="55" width="180" height="180" fill="#0f172a" stroke="#64748b" strokeWidth="6" rx="2" />
                  <rect x="285" y="65" width="160" height="160" fill="#1e293b" />
                  {[...Array(5)].map((_, r) =>
                    [...Array(5)].map((_, c) => (
                      <circle key={`cnc2-${r}-${c}`} cx={305 + c * 30} cy={85 + r * 30} r="9" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                    )),
                  )}
                  {/* Drop bolt & handles */}
                  <rect x="260" y="130" width="8" height="30" fill="#f8fafc" rx="2" />
                  <rect x="272" y="130" width="8" height="30" fill="#f8fafc" rx="2" />
                </g>
              )}

              {/* 2. Royal Wrought Iron Gate */}
              {activeGate.type === 'wrought_royal' && (
                <g>
                  {/* Arched Crest */}
                  <path d="M 85 85 Q 175 40 265 75 Q 355 40 455 85 L 455 235 L 85 235 Z" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  {/* Central Split */}
                  <line x1="270" y1="75" x2="270" y2="235" stroke="#e2e8f0" strokeWidth="6" />
                  {/* Golden Spears */}
                  {[...Array(14)].map((_, i) => {
                    const x = 95 + i * 26;
                    return (
                      <g key={`spear-${i}`}>
                        <line x1={x} y1="65" x2={x} y2="235" stroke="#94a3b8" strokeWidth="3" />
                        <polygon points={`${x - 4},65 ${x + 4},65 ${x},50`} fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                        <circle cx={x} cy="150" r="8" fill="none" stroke="#eab308" strokeWidth="1.5" />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 3. Sliding Cantilever Roller Gate */}
              {activeGate.type === 'sliding_roller' && (
                <g>
                  {/* Top Guide Track */}
                  <rect x="75" y="45" width="390" height="8" fill="#475569" />
                  {/* Single Continuous Sliding Frame */}
                  <rect x="85" y="55" width="370" height="175" fill="#0f172a" stroke="#64748b" strokeWidth="6" rx="2" />
                  {/* Heavy Horizontal Slats */}
                  {[...Array(6)].map((_, i) => (
                    <rect key={`slr-${i}`} x="92" y={70 + i * 26} width="356" height="12" fill="#94a3b8" rx="1" />
                  ))}
                  {/* Bottom Ground Track & Wheels */}
                  <circle cx="150" cy="235" r="7" fill="#64748b" stroke="#f8fafc" strokeWidth="2" />
                  <circle cx="390" cy="235" r="7" fill="#64748b" stroke="#f8fafc" strokeWidth="2" />
                  <text x="270" y="220" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    ◄ MOTORIZED SLIDING ROLLER TRACK ►
                  </text>
                </g>
              )}

              {/* 4. Contemporary Wood & Steel Gate */}
              {activeGate.type === 'wood_steel' && (
                <g>
                  <rect x="85" y="55" width="180" height="180" fill="#020617" stroke="#334155" strokeWidth="6" />
                  {[...Array(7)].map((_, i) => (
                    <rect key={`w1-${i}`} x="92" y={65 + i * 23} width="166" height="16" fill="#b45309" stroke="#78350f" strokeWidth="1" rx="1" />
                  ))}
                  <rect x="275" y="55" width="180" height="180" fill="#020617" stroke="#334155" strokeWidth="6" />
                  {[...Array(7)].map((_, i) => (
                    <rect key={`w2-${i}`} x="282" y={65 + i * 23} width="166" height="16" fill="#b45309" stroke="#78350f" strokeWidth="1" rx="1" />
                  ))}
                  {/* Long SS Pull Handles */}
                  <rect x="250" y="100" width="8" height="90" fill="#f8fafc" rx="2" />
                  <rect x="282" y="100" width="8" height="90" fill="#f8fafc" rx="2" />
                </g>
              )}

              {/* 5. Spear Picket Gate */}
              {activeGate.type === 'spear_picket' && (
                <g>
                  <rect x="85" y="65" width="370" height="170" fill="none" stroke="#475569" strokeWidth="6" />
                  {[...Array(16)].map((_, i) => {
                    const x = 96 + i * 23;
                    return (
                      <g key={`spk-${i}`}>
                        <line x1={x} y1="45" x2={x} y2="235" stroke="#cbd5e1" strokeWidth="4" />
                        <polygon points={`${x - 4},45 ${x + 4},45 ${x},30`} fill="#f8fafc" />
                      </g>
                    );
                  })}
                  <line x1="85" y1="150" x2="455" y2="150" stroke="#475569" strokeWidth="6" />
                </g>
              )}

              {/* 6. Industrial Mesh Gate */}
              {activeGate.type === 'industrial_mesh' && (
                <g>
                  <rect x="85" y="55" width="180" height="180" fill="#1e293b" stroke="#dc2626" strokeWidth="8" />
                  <rect x="275" y="55" width="180" height="180" fill="#1e293b" stroke="#dc2626" strokeWidth="8" />
                  {/* Cross Bracing */}
                  <line x1="85" y1="55" x2="265" y2="235" stroke="#dc2626" strokeWidth="6" />
                  <line x1="265" y1="55" x2="85" y2="235" stroke="#dc2626" strokeWidth="6" />
                  <line x1="275" y1="55" x2="455" y2="235" stroke="#dc2626" strokeWidth="6" />
                  <line x1="455" y1="55" x2="275" y2="235" stroke="#dc2626" strokeWidth="6" />
                  {/* Heavy Mesh Pattern */}
                  <rect x="90" y="60" width="170" height="170" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="5 5" />
                  <rect x="280" y="60" width="170" height="170" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="5 5" />
                </g>
              )}

              {/* 7. Arched Villa Gate */}
              {activeGate.type === 'arched_villa' && (
                <g>
                  <path d="M 85 100 Q 270 30 455 100 L 455 235 L 85 235 Z" fill="none" stroke="#ca8a04" strokeWidth="6" />
                  <line x1="270" y1="65" x2="270" y2="235" stroke="#ca8a04" strokeWidth="6" />
                  {[...Array(12)].map((_, i) => (
                    <line key={`avg-${i}`} x1={105 + i * 29} y1="90" x2={105 + i * 29} y2="235" stroke="#ca8a04" strokeWidth="3" />
                  ))}
                  <circle cx="200" cy="160" r="25" fill="none" stroke="#ca8a04" strokeWidth="3" />
                  <circle cx="340" cy="160" r="25" fill="none" stroke="#ca8a04" strokeWidth="3" />
                </g>
              )}

              {/* 8. Bi-Fold Speed Gate */}
              {activeGate.type === 'bifold_speed' && (
                <g>
                  {[0, 1, 2, 3].map((i) => {
                    const x = 90 + i * 90;
                    return (
                      <g key={`bf-${i}`}>
                        <rect x={x} y="60" width="82" height="175" fill="#0f172a" stroke="#64748b" strokeWidth="5" rx="2" />
                        {[...Array(5)].map((_, j) => (
                          <line key={`bfl-${j}`} x1={x + 10} y1={80 + j * 28} x2={x + 72} y2={80 + j * 28} stroke="#94a3b8" strokeWidth="3" />
                        ))}
                        <circle cx={x + 82} cy="140" r="4" fill="#38bdf8" />
                      </g>
                    );
                  })}
                  <text x="270" y="50" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    BI-FOLD COMPACT SWING RADIUS
                  </text>
                </g>
              )}

              {/* 9. Louver Privacy Gate */}
              {activeGate.type === 'louver_privacy' && (
                <g>
                  <rect x="85" y="55" width="180" height="180" fill="#020617" stroke="#334155" strokeWidth="6" />
                  <rect x="275" y="55" width="180" height="180" fill="#020617" stroke="#334155" strokeWidth="6" />
                  {[...Array(9)].map((_, i) => (
                    <g key={`lp-${i}`}>
                      <rect x="92" y={65 + i * 18} width="166" height="12" fill="#64748b" stroke="#475569" strokeWidth="1" />
                      <rect x="282" y={65 + i * 18} width="166" height="12" fill="#64748b" stroke="#475569" strokeWidth="1" />
                    </g>
                  ))}
                  <text x="270" y="45" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                    100% SIGHTLINE PRIVACY
                  </text>
                </g>
              )}

              {/* 10. Wicket Integrated Gate */}
              {activeGate.type === 'wicket_integrated' && (
                <g>
                  {/* Main Driveway Gate Leaf */}
                  <rect x="85" y="55" width="240" height="180" fill="#0f172a" stroke="#64748b" strokeWidth="6" />
                  {[...Array(7)].map((_, i) => (
                    <line key={`wg1-${i}`} x1="90" y1={75 + i * 22} x2="320" y2={75 + i * 22} stroke="#94a3b8" strokeWidth="3" />
                  ))}
                  <text x="205" y="145" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
                    VEHICLE LEAF (11 FT)
                  </text>

                  {/* Built-in Small Pedestrian Wicket Door */}
                  <rect x="335" y="55" width="120" height="180" fill="#1e293b" stroke="#38bdf8" strokeWidth="5" rx="2" />
                  {[...Array(7)].map((_, i) => (
                    <line key={`wg2-${i}`} x1="342" y1={75 + i * 22} x2="448" y2={75 + i * 22} stroke="#38bdf8" strokeWidth="2" />
                  ))}
                  {/* Wicket Door Handle */}
                  <circle cx="350" cy="145" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                  <text x="395" y="145" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    WICKET DOOR (3 FT)
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Quick Sliders */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-300 font-medium">
                {lang === 'bn' ? 'গেট চওড়া (Width):' : 'Width (Feet):'}
              </span>
              <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                <input
                  type="range"
                  min="8"
                  max="24"
                  step="1"
                  value={gateWidth}
                  onChange={(e) => setGateWidth(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-amber-400 w-10 text-right">
                  {gateWidth}&apos;
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-300 font-medium">
                {lang === 'bn' ? 'উচ্চতা (Height):' : 'Height (Feet):'}
              </span>
              <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                <input
                  type="range"
                  min="5"
                  max="12"
                  step="0.5"
                  value={gateHeight}
                  onChange={(e) => setGateHeight(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-amber-400 w-10 text-right">
                  {gateHeight}&apos;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeGate.iconEmoji}</span>
              <div>
                <h5 className="text-sm font-bold text-white">
                  {lang === 'bn' ? activeGate.nameBn : activeGate.nameEn}
                </h5>
                <span className="text-xs text-amber-400 font-medium">
                  {lang === 'bn' ? activeGate.tagBn : activeGate.tagEn}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'bn' ? activeGate.descBn : activeGate.descEn}
            </p>

            <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'সাপোর্ট কলাম:' : 'Support Pillar:'}</span>
                <span className="text-slate-200 font-medium">
                  {lang === 'bn' ? activeGate.pillarTypeBn : activeGate.pillarTypeEn}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'অটো-মেটেরিয়াল:' : 'Auto Material:'}</span>
                <span className="text-amber-300 font-medium">
                  {lang === 'bn' ? activeGate.materialBn : activeGate.materialEn}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'হিঞ্জ সিস্টেম:' : 'Hinge System:'}</span>
                <span className="text-emerald-400 font-medium">Ball-Bearing / Roller Track</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? 'স্কেচআপ ব্যবহারের পদ্ধতি' : 'SketchUp Workflow'}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'bn'
                ? '১. ড্রাইভওয়ে বা বাউন্ডারি ওয়ালের দুই পিলারের মধ্যবর্তী লাইন সিলেক্ট করুন\n২. Extensions > EVLab Tools > EVL-Gate ক্লিক করুন\n৩. ১০টি ফটক ডিজাইন থেকে বেছে নিয়ে মুহূর্তেই ৩ডি গেট তৈরি করুন।'
                : '1. Select the center ground line between two driveway boundary columns.\n2. Open Extensions > EVLab Tools > EVL-Gate.\n3. Choose from 10 architectural entrance gate designs.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
