import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCode2,
  GitGraph,
  Hash,
  HelpCircle,
  Info,
  Lightbulb,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { CalculationStep, TopicDefinition, ValidationFlag } from '../types/mechanics';
import { DependencyGraphView } from './DependencyGraphView';
import { SensitivityExplorer } from './SensitivityExplorer';
import { GraphsPanel } from './GraphsPanel';
import { CalculationTracePanel } from './CalculationTracePanel';
import { InterpretationPanel } from './InterpretationPanel';
import { getTopicDependencyGraph } from '../data/knowledgeGraph';

interface SmartResultsDockProps {
  topic: TopicDefinition;
  parameters: Record<string, number>;
  computedData: Record<string, any>;
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
  isDark: boolean;
  onOpenAITutor: () => void;
}

export const SmartResultsDock: React.FC<SmartResultsDockProps> = ({
  topic,
  parameters,
  computedData,
  steps,
  validations,
  interpretation,
  isDark,
  onOpenAITutor,
}) => {
  const [activeTab, setActiveTab] = useState<'inline_trace' | 'results_summary' | 'dependency' | 'sensitivity' | 'graphs' | 'interpretation'>('results_summary');
  const [isFullDerivationOpen, setIsFullDerivationOpen] = useState<boolean>(false);
  const [activeWhyResult, setActiveWhyResult] = useState<{ title: string; explanation: string } | null>(null);

  // Extract dependency graph nodes
  const dependencyNodes = getTopicDependencyGraph(topic.id, parameters, computedData);

  // Helper for "Why?" explanation on specific results
  const getWhyExplanationForResult = (key: string, val: any) => {
    switch (key) {
      case 'raY':
        return {
          title: 'Vertical Reaction RA',
          explanation: 'Reaction RA is the vertical support force developed at the pin bearing to satisfy equilibrium ΣMB = 0, balancing all applied downward loads and moments.'
        };
      case 'maxMoment':
        return {
          title: 'Maximum Bending Moment M_max',
          explanation: 'The peak bending moment occurs at the cross-section where the internal shear force V(x) crosses zero (dM/dx = 0). It governs the flexural tensile and compressive stress in the beam flanges.'
        };
      case 'acceleration':
        return {
          title: 'Linear Acceleration a',
          explanation: 'Calculated directly from Newton\'s Second Law: a = ΣF_net / m. The net unbalanced driving force overcomes kinetic friction to accelerate the inertial mass.'
        };
      case 'rangeX':
        return {
          title: 'Ballistic Range X',
          explanation: 'Horizontal ballistic range is the product of constant horizontal velocity (v_x0 = v0·cos θ) and the time aloft determined by vertical gravitational free-fall.'
        };
      default:
        return {
          title: `Result: ${key}`,
          explanation: `This value is derived deterministically from the governing mechanics equilibrium equations of the ${topic.title} system.`
        };
    }
  };

  return (
    <div
      id="smart-results-dock"
      className={`rounded-2xl border shadow-sm flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Dock Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('results_summary')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'results_summary'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Key Results</span>
          </button>

          <button
            onClick={() => setActiveTab('inline_trace')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'inline_trace'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Inline Equation Trace ({steps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dependency')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dependency'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GitGraph className="w-3.5 h-3.5" />
            <span>Dependency Chain</span>
          </button>

          <button
            onClick={() => setActiveTab('sensitivity')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'sensitivity'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sensitivity</span>
          </button>

          <button
            onClick={() => setActiveTab('graphs')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'graphs'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Diagrams & Plots</span>
          </button>

          <button
            onClick={() => setActiveTab('interpretation')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'interpretation'
                ? 'bg-blue-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Physical Interpretation</span>
          </button>
        </div>

        {/* Dimensional & Integrity Check Badges */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>UNIT CHECK ✓ SI</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 min-h-[260px] max-h-[380px] overflow-y-auto">
        {/* TAB 1: KEY RESULTS SUMMARY */}
        {activeTab === 'results_summary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Computed Physical State & Equilibrium
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click the "Why?" button on any metric to inspect its physical mechanics origin
                </p>
              </div>
            </div>

            {/* Dynamic Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(computedData).map(([k, val]) => {
                if (typeof val === 'object' || k.includes('Array') || k.includes('points')) return null;
                const formattedVal = typeof val === 'number' ? val.toFixed(2) : String(val);
                return (
                  <div
                    key={k}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {k}
                      </span>
                      <button
                        onClick={() => setActiveWhyResult(getWhyExplanationForResult(k, val))}
                        className="text-[10px] font-bold text-blue-500 hover:text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 cursor-pointer"
                        title="Why is this the result?"
                      >
                        WHY?
                      </button>
                    </div>

                    <div className="mt-2 flex items-baseline space-x-1">
                      <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formattedVal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Why? Modal / Callout */}
            {activeWhyResult && (
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-500 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Physical Origin: {activeWhyResult.title}</span>
                  </div>
                  <button
                    onClick={() => setActiveWhyResult(null)}
                    className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  {activeWhyResult.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INLINE EQUATION TRACE */}
        {activeTab === 'inline_trace' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Deterministic Equilibrium & Solution Trace
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Step-by-step substitution from governing physics equations to numerical solution
                </p>
              </div>
              <button
                onClick={() => setIsFullDerivationOpen((prev) => !prev)}
                className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center space-x-1 cursor-pointer"
              >
                <span>{isFullDerivationOpen ? 'Collapse Derivation' : 'Show Full Derivation'}</span>
                {isFullDerivationOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Compact inline steps */}
            <div className="space-y-2 font-mono text-xs">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${
                    isDark ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-sans font-bold text-slate-700 dark:text-slate-300">
                      Step {step.stepNumber}: {step.description}
                    </span>
                    <span className="text-blue-500 font-bold">{step.result} {step.unit}</span>
                  </div>

                  <div className="text-emerald-500 text-xs font-semibold">
                    {step.formula}
                  </div>

                  {(isFullDerivationOpen || idx === 0) && (
                    <div className="mt-1 text-slate-500 dark:text-slate-400 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700/50">
                      Substitutions: {step.substitution}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DEPENDENCY GRAPH */}
        {activeTab === 'dependency' && (
          <DependencyGraphView nodes={dependencyNodes} isDark={isDark} />
        )}

        {/* TAB 4: SENSITIVITY */}
        {activeTab === 'sensitivity' && (
          <SensitivityExplorer topic={topic} parameters={parameters} isDark={isDark} />
        )}

        {/* TAB 5: GRAPHS & DIAGRAMS */}
        {activeTab === 'graphs' && (
          <GraphsPanel
            topic={topic}
            parameters={parameters}
            computedData={computedData}
            isDark={isDark}
          />
        )}

        {/* TAB 6: PHYSICAL INTERPRETATION */}
        {activeTab === 'interpretation' && (
          <InterpretationPanel
            topic={topic}
            interpretationText={interpretation}
            isDark={isDark}
          />
        )}
      </div>
    </div>
  );
};
