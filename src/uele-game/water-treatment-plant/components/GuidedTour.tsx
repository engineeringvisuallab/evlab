import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Pause, Compass, Sparkles } from 'lucide-react';
import { EQUIPMENT_LIST, PROCESS_STAGES_ORDER } from '../data/plantData';
import { EquipmentId, Language } from '../types';

interface GuidedTourProps {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onSelectStep: (step: number) => void;
  language: Language;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  currentStep,
  onNext,
  onPrev,
  onClose,
  onSelectStep,
  language,
}) => {
  const [autoPlay, setAutoPlay] = useState(true);
  const isBn = language === 'bn';

  const currentEquipmentId = PROCESS_STAGES_ORDER[currentStep] || PROCESS_STAGES_ORDER[0];
  const eq = EQUIPMENT_LIST.find((item) => item.id === currentEquipmentId);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setTimeout(() => {
      if (currentStep < PROCESS_STAGES_ORDER.length - 1) {
        onNext();
      } else {
        setAutoPlay(false);
      }
    }, 7500);

    return () => clearTimeout(timer);
  }, [autoPlay, currentStep, onNext]);

  if (!eq) return null;

  return (
    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-2xl px-4 pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-indigo-500/40 shadow-2xl text-white">
        {/* Top Progress & Tour Controls */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <Compass className="w-4 h-4 animate-spin" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              {isBn ? `ধাপ ${currentStep + 1} / ${PROCESS_STAGES_ORDER.length}` : `Tour Step ${currentStep + 1} of ${PROCESS_STAGES_ORDER.length}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Auto Play/Pause */}
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-all"
            >
              {autoPlay ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
              <span>{autoPlay ? (isBn ? 'অটো পজ' : 'Pause Auto') : (isBn ? 'অটো প্লে' : 'Auto Play')}</span>
            </button>

            {/* Exit Tour */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/40 hover:text-rose-400 text-slate-400 transition-all"
              title="Exit Guided Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mb-4 overflow-hidden flex">
          {PROCESS_STAGES_ORDER.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onSelectStep(idx)}
              className={`flex-1 h-full transition-all border-r border-slate-900 ${
                idx <= currentStep ? 'bg-indigo-500' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Current Stage Info */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[11px] font-semibold text-sky-400 uppercase">
            {isBn ? eq.categoryBn : eq.categoryEn}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {isBn ? eq.nameBn : eq.nameEn}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isBn ? eq.fullDescBn : eq.fullDescEn}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            disabled={currentStep === 0}
            onClick={onPrev}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isBn ? 'পূর্ববর্তী ধাপ' : 'Previous'}</span>
          </button>

          <div className="text-xs text-indigo-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBn ? '৩ডি ক্যামেরা স্বয়ংক্রিয়ভাবে ফোকাস করছে' : 'Camera tracking active unit'}</span>
          </div>

          <button
            onClick={onNext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
          >
            <span>{currentStep === PROCESS_STAGES_ORDER.length - 1 ? (isBn ? 'ট্যুর শেষ' : 'Finish Tour') : (isBn ? 'পরবর্তী ধাপ' : 'Next')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
