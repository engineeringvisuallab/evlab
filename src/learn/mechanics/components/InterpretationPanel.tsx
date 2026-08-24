import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  HelpCircle,
  Info,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';
import { TopicDefinition } from '../types/mechanics';

interface InterpretationPanelProps {
  topic: TopicDefinition;
  interpretationText: string;
  isDark: boolean;
}

export const InterpretationPanel: React.FC<InterpretationPanelProps> = ({
  topic,
  interpretationText,
  isDark,
}) => {
  return (
    <div
      id="interpretation-panel"
      className={`h-full rounded-xl border p-4 flex flex-col space-y-4 overflow-y-auto ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Physical Interpretation & Insights
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold">
          Engineering Sense
        </span>
      </div>

      {/* Primary Physical Interpretation */}
      <div
        className={`p-3.5 rounded-lg border leading-relaxed ${
          isDark
            ? 'bg-amber-950/20 border-amber-900/40 text-amber-100'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center space-x-2 mb-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
          <Info className="w-3.5 h-3.5" />
          <span>Physics & Mechanics Interpretation</span>
        </div>
        <p className="text-xs font-medium leading-relaxed opacity-90">
          {interpretationText}
        </p>
      </div>

      {/* Assumptions & Boundary Conditions */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
          <span>Underlying Engineering Assumptions</span>
        </div>
        <ul className="space-y-1.5">
          {topic.assumptions.map((assump, idx) => (
            <li
              key={idx}
              className={`p-2 rounded text-xs border flex items-start space-x-2 ${
                isDark
                  ? 'bg-slate-800/40 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-blue-500 font-bold">•</span>
              <span>{assump}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Real-World Engineering Applications */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
          <span>Industrial & Aerospace Applications</span>
        </div>
        <div className="space-y-1.5">
          {topic.realWorldApplications.map((app, idx) => (
            <div
              key={idx}
              className={`p-2 rounded text-xs border ${
                isDark
                  ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {app}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
