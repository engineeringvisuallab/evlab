import React from 'react';
import { Droplets, CheckCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Language, PlantState } from '../types';

interface WaterQualityBarProps {
  plantState: PlantState;
  language: Language;
}

export const WaterQualityBar: React.FC<WaterQualityBarProps> = ({ plantState, language }) => {
  const isBn = language === 'bn';
  const isMonsoon = plantState.scenario === 'monsoon_turbidity';
  const rawTurbidity = isMonsoon ? 285 : 165;
  const finishedTurbidity = 0.18;

  return (
    <div className="absolute top-18 left-4 z-20 pointer-events-auto hidden md:block">
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-slate-800 shadow-xl max-w-sm text-slate-200">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {isBn ? 'পানির গুণমান বিশ্লেষণ' : 'Water Purification Index'}
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
            99.89% Clean
          </span>
        </div>

        {/* Comparison Raw vs Finished */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          {/* Raw River */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {isBn ? 'নদীর কাঁচা পানি' : 'Raw River'}
            </div>
            <div className="text-sm font-bold font-mono text-slate-100">{rawTurbidity} NTU</div>
            <div className="text-[10px] text-slate-400">{isBn ? 'ঘোলা ও ব্যাকটেরিয়াযুক্ত' : 'Turbid with silt'}</div>
          </div>

          {/* Finished Potable */}
          <div className="space-y-0.5 border-l border-slate-800 pl-2">
            <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              {isBn ? 'বিশুদ্ধ খাবার পানি' : 'Potable Pure'}
            </div>
            <div className="text-sm font-bold font-mono text-cyan-300">{finishedTurbidity} NTU</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" />
              {isBn ? '১০০% পানের যোগ্য' : 'WHO Certified'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
