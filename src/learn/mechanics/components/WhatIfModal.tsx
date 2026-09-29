import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  GitCompare,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { TopicDefinition } from '../types/mechanics';

interface WhatIfModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicDefinition;
  baseParams: Record<string, number>;
  isDark: boolean;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({
  isOpen,
  onClose,
  topic,
  baseParams,
  isDark,
}) => {
  const [modParams, setModParams] = useState<Record<string, number>>({ ...baseParams });
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleParamChange = (id: string, val: number) => {
    setModParams((prev) => ({ ...prev, [id]: val }));
  };

  const handleRunAiComparison = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          baselineParams: baseParams,
          modifiedParams: modParams,
          changedVariable: 'Parameters modified in What-If studio',
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.comparison || data.text || 'Comparison analysis completed successfully.');
    } catch (e) {
      console.error(e);
      setAiAnalysis('Unable to reach AI service. Please verify your connection.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="what-if-modal"
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">"What-If?" Scenario Comparator</h2>
              <p className="text-xs text-slate-400">
                Compare Baseline Scenario A against Modified Scenario B for {topic.title}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Side by side parameter cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scenario A (Baseline) */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                  Scenario A (Baseline)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                  Locked
                </span>
              </div>
              <div className="space-y-2.5">
                {topic.parameterConfigs.map((cfg) => (
                  <div key={cfg.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{cfg.name}:</span>
                    <span className="font-mono font-bold">
                      {baseParams[cfg.id] !== undefined ? baseParams[cfg.id] : cfg.defaultValue}{' '}
                      {cfg.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenario B (Modified) */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-indigo-950/20 border-indigo-800/50' : 'bg-indigo-50/50 border-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-200 dark:border-indigo-800/60">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                  Scenario B (Modified)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                  Interactive
                </span>
              </div>
              <div className="space-y-3">
                {topic.parameterConfigs.map((cfg) => {
                  const bVal = baseParams[cfg.id] !== undefined ? baseParams[cfg.id] : cfg.defaultValue;
                  const mVal = modParams[cfg.id] !== undefined ? modParams[cfg.id] : bVal;
                  const deltaPct = bVal !== 0 ? (((mVal - bVal) / bVal) * 100).toFixed(1) : '0';

                  return (
                    <div key={cfg.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">{cfg.name}:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-indigo-500">
                            {mVal} {cfg.unit}
                          </span>
                          {parseFloat(deltaPct) !== 0 && (
                            <span
                              className={`text-[10px] font-mono px-1 rounded ${
                                parseFloat(deltaPct) > 0
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-red-500/10 text-red-500'
                              }`}
                            >
                              {parseFloat(deltaPct) > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
                            </span>
                          )}
                        </div>
                      </div>
                      <input
                        type="range"
                        min={cfg.min}
                        max={cfg.max}
                        step={cfg.step}
                        value={mVal}
                        onChange={(e) => handleParamChange(cfg.id, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-indigo-200 dark:bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Comparison Analysis Button */}
          <div className="flex justify-center">
            <button
              onClick={handleRunAiComparison}
              disabled={isLoadingAi}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoadingAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Comparative Analysis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI What-If Comparative Interpretation</span>
                </>
              )}
            </button>
          </div>

          {/* AI Comparison Result Display */}
          {aiAnalysis && (
            <div
              className={`p-4 rounded-xl border leading-relaxed space-y-2 animate-in fade-in duration-300 ${
                isDark ? 'bg-slate-800/60 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-500">
                <Sparkles className="w-4 h-4" />
                <span>Gemini Engineering Mechanics Comparative Assessment</span>
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-line">{aiAnalysis}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
