import React from 'react';
import { BookOpen, Check, ExternalLink, Sparkles, X } from 'lucide-react';
import { TopicDefinition } from '../types/mechanics';

interface TextbookPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicDefinition;
  onApplyPreset: (params: Record<string, number>) => void;
  isDark: boolean;
}

export const TextbookPresetsModal: React.FC<TextbookPresetsModalProps> = ({
  isOpen,
  onClose,
  topic,
  onApplyPreset,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="textbook-presets-modal"
        className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Classical Textbook Problems</h2>
              <p className="text-xs text-slate-400">
                Hibbeler, Meriam & Kraige, Beer & Johnston Standard Benchmarks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {topic.presets && topic.presets.length > 0 ? (
            topic.presets.map((preset) => (
              <div
                key={preset.id}
                className={`p-4 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold">
                      {preset.source}
                    </span>
                    <h3 className="text-sm font-bold mt-1.5 text-slate-800 dark:text-slate-100">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {preset.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onApplyPreset(preset.parameters);
                      onClose();
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors cursor-pointer shrink-0 ml-4"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Load Problem</span>
                  </button>
                </div>

                {/* Parameters Preview */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
                  {Object.entries(preset.parameters).map(([key, val]) => {
                    const cfg = topic.parameterConfigs.find((c) => c.id === key);
                    return (
                      <span
                        key={key}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {cfg ? cfg.symbol : key} = {val} {cfg ? cfg.unit : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No textbook presets available for this module. You can customize parameters freely in the Controls panel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
