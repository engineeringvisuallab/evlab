import React from 'react';
import { TopicId } from '../types';
import { generateEngineeringExplanation } from '../engines/explanationEngine';
import { 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  Zap 
} from 'lucide-react';

interface UnderstandPanelProps {
  topicId: TopicId;
  activeMetrics: Record<string, any>;
  onOpenWhatIf: () => void;
}

export const UnderstandPanel: React.FC<UnderstandPanelProps> = ({
  topicId,
  activeMetrics,
  onOpenWhatIf,
}) => {
  const explanation = generateEngineeringExplanation(topicId, {
    paramName: 'Section Geometry / Boundary Condition',
    oldVal: 'Baseline',
    newVal: 'Current Configuration',
    metrics: activeMetrics,
  });

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-y-auto p-4 space-y-4 select-none scrollbar-thin scrollbar-thumb-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-slate-100 font-mono">
              Why Did This Happen?
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-mono font-bold">
              Causality Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical causation, non-linear proportionality, and structural insight
          </p>
        </div>

        <button
          onClick={onOpenWhatIf}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/60 text-xs font-medium transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch What-If Lab</span>
        </button>
      </div>

      {/* Causality Headline Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 p-3.5 rounded-lg border border-indigo-800/50">
        <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Governing Physical Insight</span>
        </div>
        <p className="text-sm font-bold text-slate-100 font-sans">
          {explanation.headline}
        </p>
      </div>

      {/* 1. The Step-by-Step Causality Chain */}
      <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          <span>1. The Causality Chain: Step-by-Step Physics</span>
        </div>

        <div className="space-y-2">
          {explanation.causalityChain.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3 bg-slate-950/60 p-2.5 rounded border border-slate-800/80 text-xs text-slate-300"
            >
              <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800/60 text-cyan-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Mathematical Proportionality Relations */}
      <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2.5">
        <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>2. Mathematical Proportionality Laws</span>
        </div>
        <div className="bg-slate-950 p-3 rounded border border-purple-900/40 text-xs font-mono text-purple-300 font-bold">
          {explanation.mathematicalProportionality}
        </div>
      </div>

      {/* 3. Physical Mechanisms at Atomic / Sectional Level */}
      <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2.5">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>3. Physical Mechanisms</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {explanation.physicsMechanisms.map((mech, i) => (
            <li key={i} className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold text-xs mt-0.5">•</span>
              <span className="leading-relaxed">{mech}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Engineering Takeaway for Design Practice */}
      <div className="bg-emerald-950/20 p-4 rounded-lg border border-emerald-900/40 space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>4. Practical Engineering Design Takeaway</span>
        </div>
        <p className="text-xs text-emerald-200/90 leading-relaxed font-medium">
          {explanation.engineeringTakeaway}
        </p>
      </div>
    </div>
  );
};
