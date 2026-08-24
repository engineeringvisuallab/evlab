/**
 * EVLab Textbook Benchmark Presets Modal
 */

import React from 'react';
import { EXPERIMENT_PRESETS, ExperimentPreset } from '../../core/experimentPresets';
import { LabTopicId } from '../../types';
import { X, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

interface PresetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: ExperimentPreset) => void;
  currentLabId?: LabTopicId;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  currentLabId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Textbook Benchmark Experiments & Presets</h3>
              <p className="text-xs text-slate-400">
                Instantly load classic fluid mechanics problems from Frank White, Munson, Chow, and USBR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets List Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPERIMENT_PRESETS.map((preset) => {
            const isCurrentLab = currentLabId === preset.labId;

            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isCurrentLab
                    ? 'bg-slate-900 border-sky-600/70 hover:border-sky-400 hover:bg-slate-850'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-750 uppercase">
                      {preset.labId}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{preset.authorReference.split('-')[0]}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{preset.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-amber-400/90 font-medium">Load Experiment</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
