import React from 'react';
import { EQUIPMENT_LIST, PROCESS_STAGES_ORDER } from '../data/plantData';
import { EquipmentId, Language } from '../types';
import { ChevronRight, ArrowRight, Droplets } from 'lucide-react';

interface ProcessFlowBannerProps {
  activeEquipmentId: EquipmentId | null;
  onSelectEquipment: (id: EquipmentId) => void;
  language: Language;
}

export const ProcessFlowBanner: React.FC<ProcessFlowBannerProps> = ({
  activeEquipmentId,
  onSelectEquipment,
  language,
}) => {
  const isBn = language === 'bn';

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex justify-center">
      <div className="pointer-events-auto max-w-6xl w-full bg-slate-900/90 backdrop-blur-md rounded-2xl p-2 sm:p-3 border border-slate-800 shadow-2xl overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
        <div className="flex items-center justify-between mb-1.5 px-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" />
              {isBn ? 'পানি বিশুদ্ধকরণ ধারাবাহিক প্রবাহ (Process Stages)' : 'Purification Process Flowline'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {isBn ? 'যেকোনো ধাপে ক্লিক করে ৩ডি ভিউ ও কন্ট্রোল দেখুন' : 'Click any stage to inspect in 3D'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 min-w-max pb-1">
          {PROCESS_STAGES_ORDER.map((stageId, idx) => {
            const eq = EQUIPMENT_LIST.find((e) => e.id === stageId);
            if (!eq) return null;
            const isSelected = activeEquipmentId === stageId;

            return (
              <React.Fragment key={stageId}>
                <button
                  id={`process-stage-btn-${stageId}`}
                  onClick={() => onSelectEquipment(stageId)}
                  className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-600/30 ring-2 ring-sky-400/50 scale-102'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 hover:border-sky-500/40'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'bg-slate-700 text-slate-300 group-hover:bg-sky-500 group-hover:text-white'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-semibold whitespace-nowrap">
                      {isBn ? eq.nameBn.split('(')[0] : eq.nameEn.split('&')[0]}
                    </div>
                    <div className={`text-[10px] whitespace-nowrap ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                      {isBn ? eq.categoryBn : eq.categoryEn}
                    </div>
                  </div>
                </button>

                {idx < PROCESS_STAGES_ORDER.length - 1 && (
                  <div className="text-slate-600 px-0.5">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
