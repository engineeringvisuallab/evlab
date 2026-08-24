import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Info,
  Layers,
  RotateCcw,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ParameterConfig, TopicDefinition, ValidationFlag } from '../types/mechanics';
import { UserSkillLevel } from '../types/unifiedModel';

interface ProgressivePropertiesPanelProps {
  topic: TopicDefinition;
  parameters: Record<string, number>;
  onUpdateParameter: (id: string, value: number) => void;
  validations: ValidationFlag[];
  skillLevel: UserSkillLevel;
  onChangeSkillLevel: (level: UserSkillLevel) => void;
  onExplainParameter: (param: ParameterConfig) => void;
  onResetParams: () => void;
  isDark: boolean;
}

export const ProgressivePropertiesPanel: React.FC<ProgressivePropertiesPanelProps> = ({
  topic,
  parameters,
  onUpdateParameter,
  validations,
  skillLevel,
  onChangeSkillLevel,
  onExplainParameter,
  onResetParams,
  isDark,
}) => {
  // Filter parameter configs based on progressive disclosure level
  const visibleConfigs = topic.parameterConfigs.filter((cfg, idx) => {
    if (skillLevel === 'Basic') {
      // Show only top 3-4 primary physical variables
      return idx < 4;
    }
    if (skillLevel === 'Engineering') {
      // Show all geometric, load, and primary material properties
      return !cfg.id.includes('tolerance') && !cfg.id.includes('frictionMuK') || idx < 7;
    }
    // Advanced & Professional show full spectrum
    return true;
  });

  return (
    <div
      id="progressive-properties-panel"
      className={`h-full rounded-2xl border shadow-sm flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header & Skill Level Switcher */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Properties & Parameters
          </h2>
        </div>

        {/* 3-Tier Progressive Disclosure Switcher */}
        <div className="flex items-center space-x-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-semibold">
          <button
            onClick={() => onChangeSkillLevel('Basic')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              skillLevel === 'Basic'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Basic: Essential parameters only (Mass, Force, Length, Angle)"
          >
            Basic
          </button>
          <button
            onClick={() => onChangeSkillLevel('Engineering')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              skillLevel === 'Engineering'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Engineering: Reveal friction, moment of inertia, UDL, section properties"
          >
            Eng
          </button>
          <button
            onClick={() => onChangeSkillLevel('Professional')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              skillLevel === 'Professional' || skillLevel === 'Advanced'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Professional: Reveal complete assumptions, numerical tolerances & constraints"
          >
            Pro
          </button>
        </div>
      </div>

      {/* Parameter Sliders Container */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {visibleConfigs.map((cfg) => {
          const val = parameters[cfg.id] ?? cfg.defaultValue;
          return (
            <div key={cfg.id} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {cfg.name}
                  </span>
                  <span className="font-mono text-[11px] text-blue-500">
                    ({cfg.symbol})
                  </span>
                  <button
                    onClick={() => onExplainParameter(cfg)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-blue-500 cursor-pointer"
                    title={`Why? Explain ${cfg.name}`}
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center space-x-1 font-mono font-bold text-xs text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  <input
                    type="number"
                    value={val}
                    step={cfg.step}
                    min={cfg.min}
                    max={cfg.max}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value);
                      if (!isNaN(num)) onUpdateParameter(cfg.id, num);
                    }}
                    className="w-14 text-right bg-transparent outline-none"
                  />
                  <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                    {cfg.unit}
                  </span>
                </div>
              </div>

              {/* Range Slider with Direct Feedback */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-slate-400 w-8 text-left">
                  {cfg.min}
                </span>
                <input
                  type="range"
                  min={cfg.min}
                  max={cfg.max}
                  step={cfg.step}
                  value={val}
                  onChange={(e) => onUpdateParameter(cfg.id, parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                  {cfg.max}
                </span>
              </div>
            </div>
          );
        })}

        {/* Validation Flags & Engineering Integrity Alerts */}
        {validations.length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Integrity & Safety Flags
            </span>
            {validations.map((v, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2 ${
                  v.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                    : v.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {v.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                ) : v.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium leading-tight">{v.message}</p>
                  {v.recommendation && (
                    <p className="text-[11px] opacity-80 mt-0.5">{v.recommendation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Reset & Preset Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={onResetParams}
          className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>

        <span className="text-[10px] font-mono text-slate-400">
          Deterministic Engine
        </span>
      </div>
    </div>
  );
};
