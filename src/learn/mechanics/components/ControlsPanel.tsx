import React from 'react';
import { AlertCircle, CheckCircle, Info, Sliders, Sparkles } from 'lucide-react';
import { ParameterConfig, TopicDefinition, ValidationFlag } from '../types/mechanics';

interface ControlsPanelProps {
  topic: TopicDefinition;
  parameters: Record<string, number>;
  onUpdateParameter: (id: string, value: number) => void;
  validations: ValidationFlag[];
  isDark: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  topic,
  parameters,
  onUpdateParameter,
  validations,
  isDark,
}) => {
  return (
    <div
      id="controls-panel"
      className={`flex flex-col h-full rounded-xl border p-4 overflow-y-auto space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Physical Parameters
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold">
          SI Units
        </span>
      </div>

      {/* Validation / Alert Status Flags */}
      {validations.length > 0 && (
        <div className="space-y-1.5">
          {validations.map((flag, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg text-xs flex items-start space-x-2 border leading-relaxed ${
                flag.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                  : flag.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                  : flag.type === 'info'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {flag.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                {flag.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                {flag.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                {flag.type === 'valid' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </div>
              <div>
                <p className="font-semibold">{flag.message}</p>
                {flag.recommendation && (
                  <p className="text-[11px] opacity-80 mt-0.5">{flag.recommendation}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Parameter Sliders & Inputs */}
      <div className="space-y-4 pt-1">
        {topic.parameterConfigs.map((cfg) => {
          const val = parameters[cfg.id] !== undefined ? parameters[cfg.id] : cfg.defaultValue;

          return (
            <div
              key={cfg.id}
              className={`p-3 rounded-lg border transition-colors ${
                isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={`input-${cfg.id}`}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5"
                >
                  <span className="font-mono text-blue-500 font-bold">{cfg.symbol}</span>
                  <span>{cfg.name}</span>
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    id={`input-${cfg.id}`}
                    type="number"
                    value={val}
                    min={cfg.min}
                    max={cfg.max}
                    step={cfg.step}
                    onChange={(e) => onUpdateParameter(cfg.id, parseFloat(e.target.value) || 0)}
                    className={`w-16 px-2 py-0.5 rounded text-xs font-mono font-bold text-right border transition-all ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <span className="text-[11px] font-mono text-slate-400 w-8">{cfg.unit}</span>
                </div>
              </div>

              {/* Slider */}
              <input
                id={`slider-${cfg.id}`}
                type="range"
                min={cfg.min}
                max={cfg.max}
                step={cfg.step}
                value={val}
                onChange={(e) => onUpdateParameter(cfg.id, parseFloat(e.target.value))}
                aria-label={`${cfg.name} slider`}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>{cfg.min} {cfg.unit}</span>
                <span>{cfg.max} {cfg.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
