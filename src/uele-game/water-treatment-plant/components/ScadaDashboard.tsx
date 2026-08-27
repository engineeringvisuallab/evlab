import React from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Droplet,
  Flame,
  Gauge,
  Layers,
  Power,
  ShieldAlert,
  Sliders,
  TrendingUp,
  X,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { PlantScenario, PlantState } from '../types';

interface ScadaDashboardProps {
  plantState: PlantState;
  onClose: () => void;
  onChangeScenario: (scenario: PlantScenario) => void;
}

export const ScadaDashboard: React.FC<ScadaDashboardProps> = ({
  plantState,
  onClose,
  onChangeScenario,
}) => {
  const isBn = plantState.language === 'bn';

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-full sm:w-[420px] bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-left duration-300">
      {/* Top SCADA Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-600/30 text-sky-400 border border-sky-500/40">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {isBn ? 'সেন্ট্রাল স্ক্যাডা কন্ট্রোল প্যানেল' : 'Central SCADA Control Station'}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">PLC SYSTEM: ONLINE • 1450 I/O TAGS</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
        {/* Scenario Simulator Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isBn ? 'অপারেশনাল সিনারিও সিমুলেশন' : 'Operational Scenario Selector'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'normal', nameBn: 'স্বাভাবিক চালনা', nameEn: 'Standard Normal', descBn: 'স্বাভাবিক নদীর পানি ও নিয়মিত প্রসেস' },
              { id: 'monsoon_turbidity', nameBn: 'বর্ষার ঘোলা পানি', nameEn: 'Monsoon High NTU', descBn: 'নদীতে ১৮০+ NTU ঘোলা পানি' },
              { id: 'filter_backwash', nameBn: 'ফিল্টার ব্যাকওয়াশ', nameEn: 'Filter Backwash', descBn: 'স্বয়ংক্রিয় রিভার্স ওয়াশ' },
              { id: 'power_saving', nameBn: 'বিদ্যুৎ সাশ্রয়ী মোড', nameEn: 'Eco Power Mode', descBn: 'অফ-পিক এনার্জি সেভিং' },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => onChangeScenario(sc.id as PlantScenario)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  plantState.scenario === sc.id
                    ? 'bg-sky-600/30 text-sky-200 border-sky-400 ring-2 ring-sky-500/30'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                }`}
              >
                <div className="text-xs font-bold">{isBn ? sc.nameBn : sc.nameEn}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{sc.descBn}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Global Key Performance Gauges */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            {isBn ? 'প্লান্টের সামগ্রিক পারফরম্যান্স' : 'Key Performance Indices (KPI)'}
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70">
              <div className="text-[11px] text-slate-400">{isBn ? 'দৈনিক মোট উৎপাদিত পানি' : 'Daily Output'}</div>
              <div className="text-lg font-bold text-sky-400 font-mono mt-0.5">
                52,480 <span className="text-xs text-slate-400">m³</span>
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">▲ 98.4% of Target</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70">
              <div className="text-[11px] text-slate-400">{isBn ? 'মোট বিদ্যুৎ লোড' : 'Active Power'}</div>
              <div className="text-lg font-bold text-yellow-300 font-mono mt-0.5">
                {plantState.isMasterRunning ? (plantState.scenario === 'power_saving' ? '740' : '1,150') : '0'}{' '}
                <span className="text-xs text-slate-400">kW</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Cos φ: 0.96</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70">
              <div className="text-[11px] text-slate-400">{isBn ? 'টার্বিডিটি ক্লিনিং রেট' : 'Turbidity Removal'}</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">99.89%</div>
              <div className="text-[10px] text-emerald-400 mt-1">165 NTU → 0.18 NTU</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70">
              <div className="text-[11px] text-slate-400">{isBn ? 'জীবাণুমুক্তকরণ রেট' : 'Disinfection (Log)'}</div>
              <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">99.99%</div>
              <div className="text-[10px] text-cyan-300 mt-1">4-Log Pathogen Kill</div>
            </div>
          </div>
        </div>

        {/* Chemical Inventory Reserves */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-amber-400" />
            {isBn ? 'কেমিক্যাল রিজার্ভ স্টক (Chemical Storage)' : 'Chemical Storage Inventory'}
          </label>

          <div className="space-y-2.5 p-3 rounded-xl bg-slate-800/70 border border-slate-700">
            {[
              { name: isBn ? 'অ্যালুমিনিয়াম সালফেট (Alum)' : 'Alum Coagulant', level: 86, color: 'bg-amber-500' },
              { name: isBn ? 'পলিমার এইড (Polymer)' : 'Polymer Coagulant Aid', level: 92, color: 'bg-emerald-500' },
              { name: isBn ? 'সোডিয়াম হাইপোক্লোরাইট (Chlorine)' : 'Sodium Hypochlorite', level: 78, color: 'bg-cyan-500' },
              { name: isBn ? 'লাইম পিএইচ নিউট্রিলাইজার (Lime)' : 'Hydrated Lime Slurry', level: 64, color: 'bg-purple-500' },
            ].map((chem, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">{chem.name}</span>
                  <span className="font-mono font-bold text-slate-200">{chem.level}%</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className={`${chem.color} h-full rounded-full`} style={{ width: `${chem.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Alarms & Events Log */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
            {isBn ? 'স্ক্যাডা ইভেন্ট ও স্ট্যাটাস লগ' : 'SCADA System Health'}
          </label>

          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{isBn ? 'সকল পাম্প ও ক্ল্যারিফায়ার নিরাপদ সীমার মধ্যে সচল রয়েছে।' : 'All primary pumps & clarifiers nominal.'}</span>
            </div>
            {plantState.scenario === 'monsoon_turbidity' && (
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center gap-2 text-xs text-amber-300 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{isBn ? 'নদীতে উচ্চ টার্বিডিটি সনাক্ত: অ্যালাম ডোজিং বৃদ্ধি করা হয়েছে।' : 'High river turbidity: Alum dosage auto-increased.'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
