import React from "react";
import { TopicDefinition, VariableControl } from "../types/math";
import { Sliders, RotateCcw, HelpCircle, BookmarkCheck } from "lucide-react";
import { MathFormula } from "./MathFormula";

interface Props {
  topic: TopicDefinition;
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
  onResetVariables: () => void;
  onApplyPreset?: (presetVars: Record<string, number>) => void;
}

export const ParameterPanel: React.FC<Props> = ({
  topic,
  variables,
  onVariableChange,
  onResetVariables,
  onApplyPreset,
}) => {
  const primaryFormula = topic.learn?.keyFormulas[0]?.formula || "f(x)";

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border-l border-slate-800 text-slate-200 p-3 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="text-amber-400" size={16} />
          <span className="font-semibold text-xs tracking-wider uppercase text-slate-300">
            Control Parameters
          </span>
        </div>
        <button
          onClick={onResetVariables}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          title="Reset to default values"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Primary Mathematical Model Formula Preview */}
      <div className="my-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 text-center">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
          Governing Formula
        </span>
        <div className="text-sky-300 overflow-x-auto py-1 text-xs">
          <MathFormula formula={primaryFormula} block />
        </div>
      </div>

      {/* Presets if available */}
      {topic.presets && topic.presets.length > 0 && (
        <div className="mb-3 space-y-1.5">
          <span className="text-[10px] uppercase font-mono text-slate-400 block flex items-center gap-1">
            <BookmarkCheck size={12} className="text-emerald-400" />
            <span>Preset Scenarios</span>
          </span>
          <div className="grid grid-cols-1 gap-1">
            {topic.presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onApplyPreset && onApplyPreset(preset.variables)}
                className="text-left p-1.5 rounded bg-slate-950/60 hover:bg-slate-850 border border-slate-800 text-[11px] hover:border-slate-700 transition-all group"
              >
                <div className="font-medium text-slate-200 group-hover:text-blue-300">
                  {preset.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Sliders List */}
      <div className="space-y-3.5 flex-1">
        {topic.variableControls.map((ctrl: VariableControl) => {
          const currentValue = variables[ctrl.id] ?? ctrl.defaultValue;

          return (
            <div key={ctrl.id} className="space-y-1.5 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-200">{ctrl.name}</span>
                  {ctrl.symbol && (
                    <span className="text-[11px] text-sky-400 font-mono font-bold">
                      ({ctrl.symbol})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-amber-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                    {currentValue.toFixed(ctrl.step && ctrl.step < 0.1 ? 2 : 1)} {ctrl.unit || ""}
                  </span>
                </div>
              </div>

              {/* Slider track */}
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step ?? 0.1}
                value={currentValue}
                onChange={(e) => onVariableChange(ctrl.id, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{ctrl.min} {ctrl.unit || ""}</span>
                <span className="text-slate-400 text-[9px] truncate max-w-[120px]">{ctrl.description}</span>
                <span>{ctrl.max} {ctrl.unit || ""}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Hints Card */}
      <div className="mt-4 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
          <HelpCircle size={13} />
          <span>Interactive Guidance</span>
        </div>
        <p className="text-[11px] text-indigo-300/80 leading-relaxed">
          Move sliders to observe how mathematical transformations, tangents, or integral approximations react immediately.
        </p>
      </div>
    </div>
  );
};
