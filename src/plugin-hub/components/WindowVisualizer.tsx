import React, { useState } from 'react';
import { Download, CheckCircle2, Check, Info } from 'lucide-react';
import { Language } from '../types';
import { PLUGINS_DATA } from '../data/plugins';
import { triggerPluginDownload } from '../utils/fileDownloader';

export interface WindowStyleItem {
  id: string;
  nameBn: string;
  nameEn: string;
  tagBn: string;
  tagEn: string;
  iconEmoji: string;
  type: 'sliding2' | 'sliding3' | 'casement2' | 'casement_top' | 'picture' | 'louver' | 'awning' | 'corner' | 'arched' | 'french';
  descBn: string;
  descEn: string;
  materialBn: string;
  materialEn: string;
  defaultW: number; // inches
  defaultH: number; // inches
  profileBn: string;
  profileEn: string;
}

export const WINDOW_STYLES_LIST: WindowStyleItem[] = [
  {
    id: 'win-1',
    nameBn: '১. ২-প্যানেল অ্যালুমিনিয়াম স্লাইডিং',
    nameEn: '1. 2-Panel Aluminium Sliding Window',
    tagBn: 'আবাসিক স্ট্যান্ডার্ড',
    tagEn: 'Residential Standard',
    iconEmoji: '🪟',
    type: 'sliding2',
    descBn: '৩" থাই অ্যালুমিনিয়াম ডাবল ট্র্যাক সেকশন ও ৫ মিমি টিন্টেড গ্লাস। অ্যাপার্টমেন্টের সবচেয়ে জনপ্রিয় জানালা।',
    descEn: 'Standard 2-panel horizontal sliding window with 3" aluminium double track and 5mm tinted glass.',
    materialBn: 'ডার্ক গ্রে পাউডার কোট + ব্লু টিন্ট গ্লাস',
    materialEn: 'Dark Grey Powder Coat + Blue Tint Glass',
    defaultW: 60,
    defaultH: 54,
    profileBn: '৩" স্ট্যান্ডার্ড বক্স সেকশন',
    profileEn: '3" Standard Box Section',
  },
  {
    id: 'win-2',
    nameBn: '২. ৩-প্যানেল ট্রিপল-ট্র্যাক স্লাইডিং',
    nameEn: '2. 3-Panel Triple-Track Sliding Window',
    tagBn: 'ওয়াইড ড্রয়িং রুম',
    tagEn: 'Wide Living Rooms',
    iconEmoji: '🪟',
    type: 'sliding3',
    descBn: '৭ ফুট চওড়া তিন পাল্লার জানালা যা দুই-তৃতীয়াংশ খুলে রাখা যায়। প্রচুর আলো ও বাতাসের প্রবেশ ঘটে।',
    descEn: 'Triple track 3-leaf sliding window allowing two-thirds unobstructed opening for maximum airflow.',
    materialBn: 'অ্যানোডাইজড ব্রোঞ্জ + ক্লিয়ার গ্লাস',
    materialEn: 'Anodized Bronze + Clear Glass',
    defaultW: 84,
    defaultH: 54,
    profileBn: '৪.৫" ট্রিপল ট্র্যাক সেকশন',
    profileEn: '4.5" Triple-Track Profile',
  },
  {
    id: 'win-3',
    nameBn: '৩. ডাবল লিফ কেসমেন্ট পাল্লা জানালা',
    nameEn: '3. Double Leaf Casement Openable Window',
    tagBn: 'শতভাগ ওপেনিং',
    tagEn: '100% Full Open Air',
    iconEmoji: '🚪',
    type: 'casement2',
    descBn: 'বাইরে মুখ করে খোলার কব্জাযুক্ত দুই পাল্লার জানালা। শতভাগ তাজা বাতাসের সঞ্চালনের জন্য উপযুক্ত।',
    descEn: 'Outward-swinging double hinged casement sashes providing maximum natural ventilation.',
    materialBn: 'হোয়াইট ইউপিভিসি (UPVC) / কাঠ',
    materialEn: 'White UPVC / Timber Polish',
    defaultW: 48,
    defaultH: 54,
    profileBn: 'ইউপিভিসি চেম্বার ফ্রেম',
    profileEn: 'UPVC Multi-Chamber Frame',
  },
  {
    id: 'win-4',
    nameBn: '৪. সিঙ্গেল কেসমেন্ট উইথ টপ লাইট',
    nameEn: '4. Single Leaf Casement with Top Light',
    tagBn: 'ভার্টিকাল ও এয়ারি',
    tagEn: 'Vertical with Transom',
    iconEmoji: '📐',
    type: 'casement_top',
    descBn: 'নিচে একটি লম্বা খোলার পাল্লা এবং উপরে ফিক্সড ভেন্টিলেশন গ্লাস। করিডোর ও সিড়ির পাশে দৃষ্টিনন্দন।',
    descEn: 'Single openable casement sash topped by a fixed transom glass light for continuous daylighting.',
    materialBn: 'ম্যাট ব্ল্যাক অ্যালুমিনিয়াম + গ্লাস',
    materialEn: 'Matte Black Aluminium + Clear Glass',
    defaultW: 30,
    defaultH: 66,
    profileBn: 'স্লিমলাইন কেসমেন্ট ফ্রেম',
    profileEn: 'Slimline Casement Frame',
  },
  {
    id: 'win-5',
    nameBn: '৫. ফ্লোর-টু-সিলিং ফিক্সড পিকচার উইন্ডো',
    nameEn: '5. Floor-to-Ceiling Picture Fixed Window',
    tagBn: 'প্যানোরামিক ভিউ',
    tagEn: 'Panoramic View',
    iconEmoji: '🖼️',
    type: 'picture',
    descBn: '৮ ফুট চওড়া ফ্রেমলেস বা স্লিম ফ্রেমের স্থির গ্লাস প্যানেল। আধুনিক লিভিং রুমের প্রাকৃতিক দৃশ্য উন্মোচন করে।',
    descEn: 'Massive unhindered picture window framing expansive exterior landscapes without mullions.',
    materialBn: '১০ মিমি টেম্পার্ড সেফটি গ্লাস',
    materialEn: '10mm Toughened Safety Glass',
    defaultW: 96,
    defaultH: 84,
    profileBn: 'রিসেসড স্লিম ফ্রেম',
    profileEn: 'Recessed Architectural Sill',
  },
  {
    id: 'win-6',
    nameBn: '৬. টয়লেট/কিচেন ফ্রস্টেড গ্লাস লুভার',
    nameEn: '6. Toilet/Kitchen Frosted Glass Louver',
    tagBn: 'প্রাইভেসি ও ভেন্টিলেশন',
    tagEn: 'Privacy & Ventilation',
    iconEmoji: '🚿',
    type: 'louver',
    descBn: '৪৫ ডিগ্রি অ্যাঙ্গেলে রোটেটযোগ্য ফ্রস্টেড ঘোলা গ্লাস ব্লেড। বাথরুমের প্রাইভেসি ও দুর্গন্ধ নিষ্কাশনের সমাধান।',
    descEn: 'Adjustable frosted glass louver blades set at 45 degrees for privacy and moisture exhaust.',
    materialBn: 'ফ্রস্টেড গ্লাস + অ্যালুমিনিয়াম ক্লিপ',
    materialEn: 'Frosted Glass Blades + Alum Clips',
    defaultW: 24,
    defaultH: 30,
    profileBn: 'লুভার গ্যালারি ট্র্যাক',
    profileEn: 'Louver Gallery Track',
  },
  {
    id: 'win-7',
    nameBn: '৭. টপ-হাং প্রজেকশন অওনিং উইন্ডো',
    nameEn: '7. Top-Hung Projection Awning Window',
    tagBn: 'বৃষ্টির সময়ও খোলা রাখা যায়',
    tagEn: 'Rain-Proof Ventilation',
    iconEmoji: '☂️',
    type: 'awning',
    descBn: 'উপরে কব্জা দিয়ে নিচের দিকে বাইরে ঠেলে খোলার উইন্ডো। বৃষ্টির ছাট না ঢোকার সুবিধা দেয়।',
    descEn: 'Hinged at the top and opening outward at the bottom to allow air circulation even during rain.',
    materialBn: 'হোয়াইট পাউডার কোটেড অ্যালুমিনিয়াম',
    materialEn: 'White Powder Coated Alum',
    defaultW: 36,
    defaultH: 24,
    profileBn: 'অওনিং প্রজেকশন হিঞ্জ',
    profileEn: 'Awning Friction Stays',
  },
  {
    id: 'win-8',
    nameBn: '৮. কর্নার এল-শেপড প্যানোরামিক উইন্ডো',
    nameEn: '8. Corner L-Shaped Panoramic Window',
    tagBn: '৯০ ডিগ্রি কর্নার গ্লাস',
    tagEn: '90-Degree Corner Glass',
    iconEmoji: '🧱',
    type: 'corner',
    descBn: 'বিল্ডিংয়ের কর্নারে পিলারবিহীন ৯০ ডিগ্রি মাইটার গ্লাস জয়েন্ট। ঘরের ভেতর ৩ডি উন্মুক্ত পরিবেশ আনে।',
    descEn: 'Pillarless 90-degree mitred corner glass assembly creating wraparound contemporary corner views.',
    materialBn: '১২ মিমি ক্লিয়ার টেম্পার্ড গ্লাস',
    materialEn: '12mm Clear Mitred Glass',
    defaultW: 60,
    defaultH: 54,
    profileBn: 'মাইটার সিলিকন কর্নার জয়েন্ট',
    profileEn: 'Mitred Silicone Joint Profile',
  },
  {
    id: 'win-9',
    nameBn: '৯. ক্লাসিকাল আর্চ টপ ভিক্টোরিয়ান উইন্ডো',
    nameEn: '9. Classical Arched Semi-Circular Top Window',
    tagBn: 'ভিক্টোরিয়ান ঐতিহ্যবাহী',
    tagEn: 'Victorian & Classical',
    iconEmoji: '🏛️',
    type: 'arched',
    descBn: 'উপরে সেমি-সার্কুলার অর্ধবৃত্তাকার খিলান এবং সানবার্স্ট স্পোক। ক্লাসিক ডুপ্লেক্সের আভিজাত্য বাড়ায়।',
    descEn: 'Authentic semi-circular arch top head with radiate sunburst muntin grill bars.',
    materialBn: 'টিম্বার উড টেক্সচার / আইভরি হোয়াইট',
    materialEn: 'Timber Polish / Ivory White',
    defaultW: 48,
    defaultH: 72,
    profileBn: 'কার্ভড উডেন আর্চ ফ্রেম',
    profileEn: 'Curved Solid Chowkat Frame',
  },
  {
    id: 'win-10',
    nameBn: '১০. ফ্রেঞ্চ ফুল-হাইট ডাবল উইন্ডো',
    nameEn: '10. French Full-Height Double Window with Muntins',
    tagBn: 'ইউরোপিয়ান গ্রিড স্টাইল',
    tagEn: 'European Grid Style',
    iconEmoji: '🇫🇷',
    type: 'french',
    descBn: 'মেঝে থেকে সিলিং পর্যন্ত ৮টি গ্লাস খোপের ফ্রেঞ্চ গ্রিড। ব্যালকনি ও বাগানের সামনে রাজকীয় ভিউ।',
    descEn: 'Full-height multi-lite divided window panes with decorative vertical and horizontal muntin bars.',
    materialBn: 'স্নো হোয়াইট কাঠ / অ্যালুমিনিয়াম',
    materialEn: 'Snow White Wood / Aluminium',
    defaultW: 60,
    defaultH: 84,
    profileBn: 'মাল্টি-লাইট ডিভাইডেড মান্টিন',
    profileEn: 'Multi-Lite Divided Muntin Bar',
  },
];

interface WindowVisualizerProps {
  lang: Language;
}

export const WindowVisualizer: React.FC<WindowVisualizerProps> = ({ lang }) => {
  const [selectedWinId, setSelectedWinId] = useState<string>('win-1');
  const [winWidth, setWinWidth] = useState<number>(60);
  const [winHeight, setWinHeight] = useState<number>(54);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const activeWin = WINDOW_STYLES_LIST.find((w) => w.id === selectedWinId) || WINDOW_STYLES_LIST[0];

  const handleDownload = async () => {
    setDownloading(true);
    const plugin = PLUGINS_DATA.find((p) => p.id === 'sketchup-evl-window');
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
              {lang === 'bn' ? 'EVL-Window: ১০টি আর্কিটেকচারাল উইন্ডো স্টাইল জেনারেটর' : 'EVL-Window: 10 Architectural Window Styles Generator'}
            </h4>
            <span className="text-[10px] uppercase font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
              Auto-Glass Shader
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'চৌকাঠ, স্লাইডিং/কেসমেন্ট স্যাশ ও স্বচ্ছ গ্লাস মেটেরিয়াল সহ স্বয়ংক্রিয় ৩ডি জানালা তৈরি'
              : 'Parametric 3D window generator with Chowkat frames, operating sashes, and translucent glass shaders'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{lang === 'bn' ? 'ডাউনলোড সফল (.rbz)' : 'Downloaded (.rbz)'}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{lang === 'bn' ? 'EVL-Window.rbz ডাউনলোড' : 'Download EVL-Window.rbz'}</span>
            </>
          )}
        </button>
      </div>

      {/* Style Selector Grid */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          {lang === 'bn' ? 'উইন্ডো স্টাইল নির্বাচন করুন (১০টি অপশন):' : 'Select Window Style (10 Architectural Presets):'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {WINDOW_STYLES_LIST.map((style) => {
            const isSelected = style.id === selectedWinId;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  setSelectedWinId(style.id);
                  setWinWidth(style.defaultW);
                  setWinHeight(style.defaultH);
                }}
                className={`flex flex-col items-start text-left p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-500 text-sky-200 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-base">{style.iconEmoji}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
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
                {lang === 'bn' ? 'আর্কিটেকচারাল এলিভেশন ও ফ্রেম প্রিভিউ' : 'Architectural Elevation & Frame Preview'}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {winWidth}&quot; W x {winHeight}&quot; H
              </span>
            </div>
            <span className="text-[11px] text-sky-400 font-mono">
              Glass Alpha: 0.35 Translucent Clear
            </span>
          </div>

          {/* SVG Window Render */}
          <div className="w-full h-60 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg p-3 border border-slate-800/50">
            <svg viewBox="0 0 500 240" className="w-full h-full max-h-56 drop-shadow-xl">
              {/* Wall opening cutout */}
              <rect x="25" y="10" width="450" height="220" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="4" />

              {/* Main Window Outer Chowkat Frame */}
              <rect x="40" y="20" width="420" height="200" fill="#1e293b" stroke="#475569" strokeWidth="8" rx="2" />

              {/* 1. 2-Panel Sliding Window */}
              {activeWin.type === 'sliding2' && (
                <g>
                  {/* Left Sash (Behind) */}
                  <rect x="45" y="25" width="215" height="190" fill="none" stroke="#64748b" strokeWidth="6" />
                  <rect x="52" y="32" width="201" height="176" fill="#38bdf8" opacity="0.35" stroke="#0ea5e9" strokeWidth="1" />
                  {/* Glass Reflection Highlight */}
                  <line x1="60" y1="35" x2="230" y2="195" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" strokeDasharray="15 15" />

                  {/* Right Sash (In front, overlapping) */}
                  <rect x="240" y="25" width="215" height="190" fill="none" stroke="#94a3b8" strokeWidth="6" />
                  <rect x="247" y="32" width="201" height="176" fill="#38bdf8" opacity="0.4" stroke="#0ea5e9" strokeWidth="1" />
                  {/* Handle Lock */}
                  <rect x="243" y="110" width="6" height="20" fill="#f8fafc" rx="1" />
                  <line x1="255" y1="35" x2="425" y2="195" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" strokeDasharray="15 15" />
                </g>
              )}

              {/* 2. 3-Panel Sliding */}
              {activeWin.type === 'sliding3' && (
                <g>
                  {[0, 1, 2].map((i) => {
                    const x = 45 + i * 138;
                    return (
                      <g key={`win3-${i}`}>
                        <rect x={x} y="25" width="145" height="190" fill="none" stroke="#64748b" strokeWidth="5" />
                        <rect x={x + 6} y="31" width="133" height="178" fill="#38bdf8" opacity="0.35" stroke="#0ea5e9" strokeWidth="1" />
                        <line x1={x + 15} y1="40" x2={x + 125} y2="190" stroke="#ffffff" strokeWidth="1" opacity="0.35" />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 3. Double Casement */}
              {activeWin.type === 'casement2' && (
                <g>
                  {/* Central Mullion */}
                  <line x1="250" y1="20" x2="250" y2="220" stroke="#64748b" strokeWidth="8" />
                  {/* Left Leaf */}
                  <rect x="45" y="25" width="200" height="190" fill="none" stroke="#94a3b8" strokeWidth="6" />
                  <rect x="52" y="32" width="186" height="176" fill="#38bdf8" opacity="0.35" />
                  <rect x="235" y="110" width="6" height="20" fill="#f8fafc" rx="1" />
                  {/* Right Leaf */}
                  <rect x="255" y="25" width="200" height="190" fill="none" stroke="#94a3b8" strokeWidth="6" />
                  <rect x="262" y="32" width="186" height="176" fill="#38bdf8" opacity="0.35" />
                  <rect x="259" y="110" width="6" height="20" fill="#f8fafc" rx="1" />
                </g>
              )}

              {/* 4. Casement with Top Light */}
              {activeWin.type === 'casement_top' && (
                <g>
                  {/* Horizontal Transom Bar */}
                  <line x1="40" y1="80" x2="460" y2="80" stroke="#64748b" strokeWidth="6" />
                  {/* Top Fixed Light */}
                  <rect x="45" y="25" width="410" height="50" fill="#38bdf8" opacity="0.35" stroke="#0ea5e9" strokeWidth="1" />
                  {/* Bottom Casement Sash */}
                  <rect x="45" y="85" width="410" height="130" fill="none" stroke="#94a3b8" strokeWidth="6" />
                  <rect x="52" y="92" width="396" height="116" fill="#38bdf8" opacity="0.35" stroke="#0ea5e9" strokeWidth="1" />
                  <rect x="435" y="145" width="6" height="20" fill="#f8fafc" rx="1" />
                </g>
              )}

              {/* 5. Fixed Picture Window */}
              {activeWin.type === 'picture' && (
                <g>
                  <rect x="45" y="25" width="410" height="190" fill="#0284c7" opacity="0.3" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="60" y1="35" x2="430" y2="200" stroke="#ffffff" strokeWidth="2" opacity="0.4" strokeDasharray="30 20" />
                  <text x="250" y="125" textAnchor="middle" fill="#f0f9ff" fontSize="13" fontWeight="bold" letterSpacing="1">
                    PANORAMIC CLEAR VIEW (10MM TEMPERED)
                  </text>
                </g>
              )}

              {/* 6. Louver Window */}
              {activeWin.type === 'louver' && (
                <g>
                  {[...Array(6)].map((_, i) => (
                    <g key={`louver-${i}`}>
                      <polygon
                        points={`50,${40 + i * 28} 450,${40 + i * 28} 445,${60 + i * 28} 45,${60 + i * 28}`}
                        fill="#94a3b8"
                        opacity="0.6"
                        stroke="#cbd5e1"
                        strokeWidth="1"
                      />
                    </g>
                  ))}
                </g>
              )}

              {/* 7. Awning Window */}
              {activeWin.type === 'awning' && (
                <g>
                  <rect x="45" y="25" width="410" height="190" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                  <rect x="52" y="32" width="396" height="176" fill="#38bdf8" opacity="0.35" />
                  {/* Awning bottom push bar */}
                  <rect x="220" y="200" width="60" height="6" fill="#cbd5e1" rx="2" />
                  <path d="M 55 35 L 250 190 L 445 35" stroke="#f8fafc" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                </g>
              )}

              {/* 8. Corner L-Shaped */}
              {activeWin.type === 'corner' && (
                <g>
                  {/* Left Facet */}
                  <rect x="45" y="25" width="200" height="190" fill="#38bdf8" opacity="0.35" stroke="#0ea5e9" strokeWidth="2" />
                  {/* 90-Deg Mitred Joint */}
                  <line x1="245" y1="20" x2="245" y2="220" stroke="#f59e0b" strokeWidth="4" strokeDasharray="3 3" />
                  <text x="245" y="15" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
                    90° Corner Joint
                  </text>
                  {/* Right Facet */}
                  <rect x="245" y="25" width="210" height="190" fill="#38bdf8" opacity="0.45" stroke="#0ea5e9" strokeWidth="2" />
                </g>
              )}

              {/* 9. Arched Top Window */}
              {activeWin.type === 'arched' && (
                <g>
                  {/* Semi-circular Arch Head */}
                  <path d="M 45 100 A 205 80 0 0 1 455 100 L 455 215 L 45 215 Z" fill="#38bdf8" opacity="0.35" stroke="#f8fafc" strokeWidth="6" />
                  {/* Radial Sunburst rays */}
                  <line x1="250" y1="100" x2="110" y2="50" stroke="#f8fafc" strokeWidth="3" />
                  <line x1="250" y1="100" x2="250" y2="20" stroke="#f8fafc" strokeWidth="3" />
                  <line x1="250" y1="100" x2="390" y2="50" stroke="#f8fafc" strokeWidth="3" />
                  <line x1="45" y1="100" x2="455" y2="100" stroke="#f8fafc" strokeWidth="4" />
                </g>
              )}

              {/* 10. French Multi-Lite Muntins */}
              {activeWin.type === 'french' && (
                <g>
                  <rect x="45" y="25" width="410" height="190" fill="#38bdf8" opacity="0.35" stroke="#f8fafc" strokeWidth="6" />
                  {/* Vertical dividing mullion */}
                  <line x1="250" y1="25" x2="250" y2="215" stroke="#f8fafc" strokeWidth="6" />
                  {/* Horizontal Muntin Bars */}
                  {[...Array(3)].map((_, i) => (
                    <line key={`muntin-${i}`} x1="45" y1={72 + i * 48} x2="455" y2={72 + i * 48} stroke="#f8fafc" strokeWidth="4" />
                  ))}
                  {/* French Handles */}
                  <rect x="238" y="115" width="5" height="22" fill="#d97706" rx="1" />
                  <rect x="257" y="115" width="5" height="22" fill="#d97706" rx="1" />
                </g>
              )}
            </svg>
          </div>

          {/* Quick Sliders */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-300 font-medium">
                {lang === 'bn' ? 'প্রস্থ (Width):' : 'Width:'}
              </span>
              <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                <input
                  type="range"
                  min="24"
                  max="120"
                  step="2"
                  value={winWidth}
                  onChange={(e) => setWinWidth(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-sky-400 w-10 text-right">
                  {winWidth}&quot;
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-300 font-medium">
                {lang === 'bn' ? 'উচ্চতা (Height):' : 'Height:'}
              </span>
              <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                <input
                  type="range"
                  min="24"
                  max="96"
                  step="2"
                  value={winHeight}
                  onChange={(e) => setWinHeight(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-sky-400 w-10 text-right">
                  {winHeight}&quot;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeWin.iconEmoji}</span>
              <div>
                <h5 className="text-sm font-bold text-white">
                  {lang === 'bn' ? activeWin.nameBn : activeWin.nameEn}
                </h5>
                <span className="text-xs text-sky-400 font-medium">
                  {lang === 'bn' ? activeWin.tagBn : activeWin.tagEn}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'bn' ? activeWin.descBn : activeWin.descEn}
            </p>

            <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'ফ্রেম প্রোফাইল:' : 'Frame Profile:'}</span>
                <span className="text-slate-200 font-medium">
                  {lang === 'bn' ? activeWin.profileBn : activeWin.profileEn}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'অটো-মেটেরিয়াল:' : 'Auto Material:'}</span>
                <span className="text-sky-300 font-medium">
                  {lang === 'bn' ? activeWin.materialBn : activeWin.materialEn}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'গ্লাস শ্যাডার:' : 'Glass Shader:'}</span>
                <span className="text-emerald-400 font-medium">Translucent (35% Opacity)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>{lang === 'bn' ? 'স্কেচআপ ব্যবহারের পদ্ধতি' : 'SketchUp Workflow'}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'bn'
                ? '১. যে কোনো দেওয়ালে উইন্ডোর সিল লেভেল সিলেক্ট করুন বা পয়েন্ট দিন\n২. Extensions > EVLab Tools > EVL-Window ক্লিক করুন\n৩. উইন্ডো টাইপ ও মাপ দিলেই ফ্রেম ও স্বয়ংক্রিয় গ্লাস সহ ৩ডি জানালা বসবে।'
                : '1. Select opening sill level or face.\n2. Open Extensions > EVLab Tools > EVL-Window.\n3. Enter custom dimensions to generate 3D window with realistic glass.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
