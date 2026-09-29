import React from 'react';
import { HelpCircle, Lightbulb, Sparkles, X } from 'lucide-react';
import { ParameterConfig, TopicDefinition } from '../types/mechanics';
import { UserSkillLevel } from '../types/unifiedModel';

interface ExplainWhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicDefinition;
  activeParam: ParameterConfig | null;
  skillLevel: UserSkillLevel;
  isDark: boolean;
}

export const ExplainWhyModal: React.FC<ExplainWhyModalProps> = ({
  isOpen,
  onClose,
  topic,
  activeParam,
  skillLevel,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Physical Concept Explanation</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Intuitive mechanics breakdown &bull; Level: {skillLevel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {activeParam ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-blue-500">
                  {activeParam.name} ({activeParam.symbol})
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Unit: {activeParam.unit}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                {activeParam.description}
              </p>

              <div
                className={`p-3 rounded-2xl border space-y-1.5 ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  How does changing this parameter affect the system?
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  In {topic.title}, increasing <strong className="text-slate-800 dark:text-slate-200">{activeParam.name}</strong> directly alters the equilibrium balance and internal force distribution governed by {topic.governingEquations[0]?.name || 'Newtonian mechanics'}.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-blue-500">{topic.title} Core Theory</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {topic.summary}
              </p>
              <div className="space-y-1 pt-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Key Governing Equation:
                </span>
                <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs">
                  {topic.governingEquations[0]?.latex || 'ΣF = 0, ΣM = 0'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
