import React, { useState } from 'react';
import { Download, CheckCircle2, Sparkles, Check, Info } from 'lucide-react';
import { Language } from '../types';
import { PLUGINS_DATA } from '../data/plugins';
import { triggerPluginDownload } from '../utils/fileDownloader';

export interface GrillStyleItem {
  id: string;
  nameBn: string;
  nameEn: string;
  tagBn: string;
  tagEn: string;
  iconEmoji: string;
  type: 'grid' | 'slats' | 'diamond' | 'floral' | 'pipe' | 'cnc' | 'double_x' | 'box_proj' | 'picket' | 'collapsible';
  descBn: string;
  descEn: string;
  materialBn: string;
  materialEn: string;
  defaultHeight: number; // inches
  barProfile: string;
}

export const GRILL_STYLES_LIST: GrillStyleItem[] = [
  {
    id: 'grill-1',
    nameBn: '১. ক্লাসিক স্কয়ার বার বক্স গ্রিড (৪"x৪")',
    nameEn: '1. Classic Square Bar Box Grid (4"x4")',
    tagBn: 'সবচেয়ে জনপ্রিয়',
    tagEn: 'Most Popular',
    iconEmoji: '🔲',
    type: 'grid',
    descBn: '১২ মিমি স্কয়ার এমএস বার ও ১.৫"x১" আউটার ফ্রেম। স্ট্যান্ডার্ড আবাসিক ব্যালকনি ও জানালার জন্য নির্ভরযোগ্য।',
    descEn: '12mm solid square MS bars welded in a 4"x4" grid with 1.5"x1" outer box frame.',
    materialBn: 'ম্যাট ব্ল্যাক পাউডার কোট (MS)',
    materialEn: 'Matte Black Powder Coat (MS)',
    defaultHeight: 48,
    barProfile: '12mm Solid MS',
  },
  {
    id: 'grill-2',
    nameBn: '২. আধুনিক হরিজন্টাল স্ল্যাট গ্রিল',
    nameEn: '2. Modern Horizontal Flat Slats',
    tagBn: 'মিনিমালিস্ট ও সমসাময়িক',
    tagEn: 'Minimalist & Contemporary',
    iconEmoji: '➖',
    type: 'slats',
    descBn: '১.৫" চওড়া সমান্তরাল ফ্ল্যাট বার ৩" ফাঁকে। আধুনিক বহুতল ভবনের ব্যালকনির দৃষ্টিনন্দন সমাধান।',
    descEn: '1.5" wide horizontal flat slats with 3" spacing for a sleek architectural facade.',
    materialBn: 'চারকোল গ্রে মেটালিক',
    materialEn: 'Charcoal Grey Metallic',
    defaultHeight: 42,
    barProfile: '38mm x 6mm Flat Bar',
  },
  {
    id: 'grill-3',
    nameBn: '৩. ডায়মন্ড সিকিউরিটি রম্বাস জালি',
    nameEn: '3. Diamond Security Rhombus Mesh',
    tagBn: 'উচ্চ নিরাপত্তা',
    tagEn: 'High Security',
    iconEmoji: '🔷',
    type: 'diamond',
    descBn: '৪৫ ডিগ্রি কোণে আড়াআড়ি রম্বাস প্যাটার্ন। চোর প্রতিরোধে সর্বোচ্চ শক্তিশালী জালিয়াতি।',
    descEn: '45-degree interwoven diamond security lattice for ground floor windows and utility verandahs.',
    materialBn: 'অ্যান্টিক ব্রোঞ্জ ফিনিশ',
    materialEn: 'Antique Bronze Finish',
    defaultHeight: 48,
    barProfile: '10mm Square Rod',
  },
  {
    id: 'grill-4',
    nameBn: '৪. ক্লাসিকাল রট আয়রন ফ্লোরাল স্ক্রোল',
    nameEn: '4. Classical Wrought Iron Floral Scrolls',
    tagBn: 'রয়্যাল ও অ্যান্টিক',
    tagEn: 'Royal & Antique',
    iconEmoji: '⚜️',
    type: 'floral',
    descBn: 'হস্তশিল্পে তৈরি বাঁকানো স্ক্রোল, এস-কার্ভ ও কাস্ট লিফ। লাক্সারি ভিলা ও ডুপ্লেক্সের জন্য আদর্শ।',
    descEn: 'Hand-forged curved S-scrolls and ornamental cast rosette accents for luxury residences.',
    materialBn: 'রট আয়রন ব্ল্যাক ও গোল্ডেন এক্সেন্ট',
    materialEn: 'Wrought Iron Black & Gold Leaf',
    defaultHeight: 42,
    barProfile: '16mm Forged Iron',
  },
  {
    id: 'grill-5',
    nameBn: '৫. স্টেইনলেস স্টিল এসএস পাইপ গ্রিল',
    nameEn: '5. SS 304 Round Pipe Balcony Grill',
    tagBn: 'মরিচারোধক ও চকচকে',
    tagEn: 'Rust-Proof & Glossy',
    iconEmoji: '🛡️',
    type: 'pipe',
    descBn: '১ ইঞ্চি গোল এসএস ৩০৪ পাইপ ৪" পরপর ও দেওয়াল মাউন্টিং ফ্ল্যাঞ্জ। দীর্ঘস্থায়ী ও জিরো মেইনটেন্যান্স।',
    descEn: '1" outer diameter grade-304 round stainless steel pipes with welded wall bracket tabs.',
    materialBn: 'ব্রাশড এসএস ৩০৪ ফিনিশ',
    materialEn: 'Brushed Stainless Steel 304',
    defaultHeight: 42,
    barProfile: '25mm Round SS Pipe',
  },
  {
    id: 'grill-6',
    nameBn: '৬. সিএনসি লেজার-কাট মেটাল শিট',
    nameEn: '6. Laser-Cut CNC Geometric Plate',
    tagBn: 'আধুনিক আর্কিটেকচার',
    tagEn: 'Parametric CNC Design',
    iconEmoji: '✨',
    type: 'cnc',
    descBn: '৩ মিমি স্টিল শিটে জ্যামিতিক হেক্সাগন ও ইসলামিক জালি কাট। আলো-ছায়ার চমৎকার আবহ তৈরি করে।',
    descEn: '3mm thick steel plate precision laser-cut with geometric Moroccan or hexagonal motifs.',
    materialBn: 'ডিপ গ্রে পলিয়েস্টার কোটিং',
    materialEn: 'Deep Grey Textured Coating',
    defaultHeight: 48,
    barProfile: '3mm Steel CNC Plate',
  },
  {
    id: 'grill-7',
    nameBn: '৭. ফার্মহাউস ডাবল-এক্স ক্রস গ্রিল',
    nameEn: '7. Farmhouse Double-X Verandah Grill',
    tagBn: 'ক্লাসিক ফার্মহাউস',
    tagEn: 'Modern Farmhouse',
    iconEmoji: '✖️',
    type: 'double_x',
    descBn: 'প্রতিটি বে-তে ডাবল ক্রস-বাক (X) ব্রেসিং ও মিডল সাপোর্ট। খোলা বাতাস ও পরিচ্ছন্ন আধুনিক ভিউ।',
    descEn: 'Crossbuck double-X structural bracing within modular frames for open verandahs.',
    materialBn: 'পিওর হোয়াইট মেটালিক',
    materialEn: 'Pure White Powder Coat',
    defaultHeight: 36,
    barProfile: '2" x 1" Rectangular Tube',
  },
  {
    id: 'grill-8',
    nameBn: '৮. প্রজেকশন বক্স গ্রিল উইথ প্ল্যান্টার',
    nameEn: '8. Window Box Projection with Planter',
    tagBn: 'গাছ রাখার তাক সহ',
    tagEn: 'With Planter Shelf',
    iconEmoji: '🪴',
    type: 'box_proj',
    descBn: 'দেওয়াল থেকে ৬" বাইরে বাড়ানো বক্স গ্রিল যার নিচে ফুলের টব রাখার মজবুত গ্রিড বেস রয়েছে।',
    descEn: 'Window grill with a 6-inch wall cantilever projection creating a heavy-duty planter base.',
    materialBn: 'ইন্ডাস্ট্রিয়াল ব্ল্যাক স্টিল',
    materialEn: 'Industrial Steel Black',
    defaultHeight: 48,
    barProfile: '12mm Square + Angle Shelf',
  },
  {
    id: 'grill-9',
    nameBn: '৯. স্লিম ভার্টিকাল পিকেট মিনিমালিস্ট',
    nameEn: '9. Slim Vertical Picket Minimalist',
    tagBn: 'স্লিম ও দৃষ্টিসুখকর',
    tagEn: 'Slim & Unobtrusive',
    iconEmoji: '📏',
    type: 'picket',
    descBn: '১০ মিমি চিকন সলিড রড ৩" দূরত্বে। দৃষ্টিনন্দন স্লিম লুক ও ব্যালকনি থেকে শহরের খোলামেলা দৃশ্য।',
    descEn: 'Slim 10mm solid vertical rods at 3" intervals for minimal visual obstruction.',
    materialBn: 'ম্যাট ব্ল্যাক / হোয়াইট',
    materialEn: 'Matte Black / Off-White',
    defaultHeight: 42,
    barProfile: '10mm Solid Rod',
  },
  {
    id: 'grill-10',
    nameBn: '১০. কোল্যাপসিবল স্লাইডিং সেফটি গেট/গ্রিল',
    nameEn: '10. Collapsible Sliding Safety Lattice',
    tagBn: 'ফোল্ডিং চ্যানেল গেট',
    tagEn: 'Folding Channel Gate',
    iconEmoji: '↔️',
    type: 'collapsible',
    descBn: 'টপ ও বটম গাইড চ্যানেল সহ ভাজ করে রাখা যায় এমন ডায়াগনাল ফোল্ডিং ল্যাটিস সেফটি গ্রিল।',
    descEn: 'Heavy channel-guided collapsible folding lattice gate for balconies and emergency exits.',
    materialBn: 'গ্যালভানাইজড মেটালিক সিলভার',
    materialEn: 'Galvanized Metallic Silver',
    defaultHeight: 54,
    barProfile: 'Double Channel Lattice',
  },
];

interface GrillVisualizerProps {
  lang: Language;
}

export const GrillVisualizer: React.FC<GrillVisualizerProps> = ({ lang }) => {
  const [selectedStyleId, setSelectedStyleId] = useState<string>('grill-1');
  const [grillHeight, setGrillHeight] = useState<number>(48);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const activeStyle = GRILL_STYLES_LIST.find((s) => s.id === selectedStyleId) || GRILL_STYLES_LIST[0];

  const handleDownload = async () => {
    setDownloading(true);
    const plugin = PLUGINS_DATA.find((p) => p.id === 'sketchup-evl-grill');
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
            <span className="text-xl">🪟</span>
            <h4 className="text-sm font-semibold text-white">
              {lang === 'bn' ? 'EVL-Grill: বারান্দা ও জানালার সেফটি গ্রিল জেনারেটর' : 'EVL-Grill: Verandah & Window Safety Grill Generator'}
            </h4>
            <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              10 Styles
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? '১০টি আর্কিটেকচারাল গ্রিল প্যাটার্ন ও অটো-মেটেরিয়াল ইঞ্জিন সহ স্কেচআপ এক্সটেনশন'
              : '10 Architectural safety grill patterns with automated materials and 3D bar geometry'}
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
              <span>{lang === 'bn' ? 'EVL-Grill.rbz ডাউনলোড' : 'Download EVL-Grill.rbz'}</span>
            </>
          )}
        </button>
      </div>

      {/* Style Selector Grid */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <span>{lang === 'bn' ? 'গ্রিল স্টাইল নির্বাচন করুন (১০টি অপশন):' : 'Select Grill Style (10 Architectural Options):'}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {GRILL_STYLES_LIST.map((style) => {
            const isSelected = style.id === selectedStyleId;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  setSelectedStyleId(style.id);
                  setGrillHeight(style.defaultHeight);
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
                {lang === 'bn' ? '৩ডি এলিভেশন ও প্যাটার্ন প্রিভিউ' : '3D Elevation & Infill Pattern Preview'}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {grillHeight}&quot; Height
              </span>
            </div>
            <span className="text-[11px] text-amber-400 font-mono">
              Auto-Material: {lang === 'bn' ? activeStyle.materialBn : activeStyle.materialEn}
            </span>
          </div>

          {/* SVG Grill Render */}
          <div className="w-full h-56 flex items-center justify-center bg-gradient-to-b from-slate-900/80 to-slate-950 rounded-lg p-3 border border-slate-800/50">
            <svg viewBox="0 0 500 220" className="w-full h-full max-h-52 drop-shadow-lg">
              {/* Surrounding Wall Opening */}
              <rect x="20" y="10" width="460" height="200" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="4" />
              <rect x="25" y="15" width="450" height="190" fill="#1e293b" opacity="0.4" />

              {/* Outer Grill Box Frame */}
              <rect x="35" y="25" width="430" height="170" fill="none" stroke="#64748b" strokeWidth="6" rx="2" />

              {/* Infill based on Style */}
              {activeStyle.type === 'grid' && (
                <g stroke="#94a3b8" strokeWidth="3">
                  {[...Array(9)].map((_, i) => (
                    <line key={`v-${i}`} x1={78 + i * 43} y1="28" x2={78 + i * 43} y2="192" />
                  ))}
                  {[...Array(4)].map((_, j) => (
                    <line key={`h-${j}`} x1="38" y1={59 + j * 34} x2="462" y2={59 + j * 34} />
                  ))}
                </g>
              )}

              {activeStyle.type === 'slats' && (
                <g fill="#94a3b8">
                  {[...Array(6)].map((_, i) => (
                    <rect key={`slat-${i}`} x="38" y={40 + i * 26} width="424" height="10" rx="1" />
                  ))}
                </g>
              )}

              {activeStyle.type === 'diamond' && (
                <g stroke="#b45309" strokeWidth="2.5" opacity="0.85">
                  {[...Array(12)].map((_, i) => (
                    <line key={`d1-${i}`} x1={38 + i * 35} y1="28" x2={38 + i * 35 + 80} y2="192" />
                  ))}
                  {[...Array(12)].map((_, i) => (
                    <line key={`d2-${i}`} x1={462 - i * 35} y1="28" x2={462 - i * 35 - 80} y2="192" />
                  ))}
                </g>
              )}

              {activeStyle.type === 'floral' && (
                <g stroke="#e2e8f0" strokeWidth="2.5" fill="none">
                  {[...Array(5)].map((_, i) => {
                    const cx = 80 + i * 85;
                    return (
                      <g key={`floral-${i}`}>
                        <line x1={cx} y1="28" x2={cx} y2="192" strokeWidth="3" />
                        <circle cx={cx} cy="110" r="22" stroke="#eab308" strokeWidth="2" />
                        <path d={`M ${cx - 20} 80 Q ${cx} 110 ${cx + 20} 80`} />
                        <path d={`M ${cx - 20} 140 Q ${cx} 110 ${cx + 20} 140`} />
                      </g>
                    );
                  })}
                </g>
              )}

              {activeStyle.type === 'pipe' && (
                <g fill="url(#ssGrad)" stroke="#cbd5e1" strokeWidth="1">
                  <defs>
                    <linearGradient id="ssGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="50%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                  </defs>
                  {[...Array(8)].map((_, i) => (
                    <rect key={`pipe-${i}`} x={75 + i * 50} y="28" width="16" height="164" rx="3" />
                  ))}
                </g>
              )}

              {activeStyle.type === 'cnc' && (
                <g fill="#020617" stroke="#475569" strokeWidth="1.5">
                  <rect x="38" y="28" width="424" height="164" fill="#334155" opacity="0.6" />
                  {[...Array(6)].map((_, r) =>
                    [...Array(12)].map((_, c) => (
                      <polygon
                        key={`hex-${r}-${c}`}
                        points={`${70 + c * 32},${45 + r * 25} ${80 + c * 32},${45 + r * 25} ${85 + c * 32},${55 + r * 25} ${80 + c * 32},${65 + r * 25} ${70 + c * 32},${65 + r * 25} ${65 + c * 32},${55 + r * 25}`}
                        fill="#0f172a"
                      />
                    )),
                  )}
                </g>
              )}

              {activeStyle.type === 'double_x' && (
                <g stroke="#f1f5f9" strokeWidth="4">
                  {[...Array(4)].map((_, i) => {
                    const x1 = 40 + i * 105;
                    const x2 = x1 + 105;
                    return (
                      <g key={`x-${i}`}>
                        <line x1={x1} y1="28" x2={x2} y2="192" />
                        <line x1={x2} y1="28" x2={x1} y2="192" />
                        <line x1={x2} y1="28" x2={x2} y2="192" stroke="#64748b" strokeWidth="3" />
                      </g>
                    );
                  })}
                </g>
              )}

              {activeStyle.type === 'box_proj' && (
                <g>
                  {/* Planter projection shelf base */}
                  <rect x="30" y="165" width="440" height="30" fill="#334155" stroke="#94a3b8" strokeWidth="2" rx="2" />
                  <text x="250" y="185" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                    6&quot; Planter Cantilever Box Shelf
                  </text>
                  {/* Vertical bars */}
                  <g stroke="#94a3b8" strokeWidth="3">
                    {[...Array(10)].map((_, i) => (
                      <line key={`bp-${i}`} x1={60 + i * 42} y1="28" x2={60 + i * 42} y2="165" />
                    ))}
                  </g>
                </g>
              )}

              {activeStyle.type === 'picket' && (
                <g stroke="#e2e8f0" strokeWidth="2">
                  {[...Array(16)].map((_, i) => (
                    <line key={`picket-${i}`} x1={55 + i * 26} y1="28" x2={55 + i * 26} y2="192" />
                  ))}
                  <line x1="38" y1="110" x2="462" y2="110" stroke="#94a3b8" strokeWidth="4" />
                </g>
              )}

              {activeStyle.type === 'collapsible' && (
                <g stroke="#94a3b8" strokeWidth="2.5">
                  <rect x="38" y="28" width="424" height="12" fill="#475569" />
                  <rect x="38" y="180" width="424" height="12" fill="#475569" />
                  {[...Array(8)].map((_, i) => {
                    const x = 60 + i * 50;
                    return (
                      <g key={`col-${i}`}>
                        <line x1={x} y1="40" x2={x} y2="180" strokeWidth="4" stroke="#cbd5e1" />
                        <line x1={x} y1="40" x2={x + 40} y2="110" stroke="#64748b" />
                        <line x1={x + 40} y1="40" x2={x} y2="110" stroke="#64748b" />
                        <line x1={x} y1="110" x2={x + 40} y2="180" stroke="#64748b" />
                        <line x1={x + 40} y1="110" x2={x} y2="180" stroke="#64748b" />
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>

          {/* Quick Slider */}
          <div className="mt-3 flex items-center justify-between gap-4 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-300 font-medium">
              {lang === 'bn' ? 'গ্রিল উচ্চতা (Height):' : 'Grill Height Parameter:'}
            </span>
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <input
                type="range"
                min="30"
                max="72"
                step="2"
                value={grillHeight}
                onChange={(e) => setGrillHeight(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-amber-400 w-12 text-right">
                {grillHeight}&quot;
              </span>
            </div>
          </div>
        </div>

        {/* Style Details & Specification Sidebar */}
        <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeStyle.iconEmoji}</span>
              <div>
                <h5 className="text-sm font-bold text-white">
                  {lang === 'bn' ? activeStyle.nameBn : activeStyle.nameEn}
                </h5>
                <span className="text-xs text-amber-400 font-medium">
                  {lang === 'bn' ? activeStyle.tagBn : activeStyle.tagEn}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'bn' ? activeStyle.descBn : activeStyle.descEn}
            </p>

            <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'বার সেকশন:' : 'Bar Profile:'}</span>
                <span className="text-slate-200 font-medium">{activeStyle.barProfile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'অটো-মেটেরিয়াল:' : 'Auto Material:'}</span>
                <span className="text-amber-300 font-medium">
                  {lang === 'bn' ? activeStyle.materialBn : activeStyle.materialEn}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'ড্রয়িং মোড:' : 'Drawing Mode:'}</span>
                <span className="text-emerald-400 font-medium">
                  {lang === 'bn' ? 'লাইন সিলেক্ট অথবা ড্র' : 'Select Line or Click'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? 'স্কেচআপে ব্যবহারের নিয়ম' : 'SketchUp Usage'}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'bn'
                ? '১. যে কোনো লাইন বা উইন্ডো বাউন্ডারি সিলেক্ট করুন\n২. Extensions > EVLab Tools > EVL-Grill চালু করুন\n৩. ১০টি স্টাইল থেকে সিলেক্ট করলেই সাথে সাথে পূর্ণাঙ্গ ৩ডি গ্রিল তৈরি হবে।'
                : '1. Select any line path or window sill boundary.\n2. Click Extensions > EVLab Tools > EVL-Grill.\n3. Choose from 10 presets to generate 3D grill instantly.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
