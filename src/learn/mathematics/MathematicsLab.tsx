import React, { useState, useEffect, useMemo } from "react";
import "katex/dist/katex.min.css";
import { CURRICULUM_TOPICS } from "./curriculum/topicsData";
import { TopicDefinition, EducationalLevel } from "./types/math";
import { TopicTree } from "./components/TopicTree";
import { ParameterPanel } from "./components/ParameterPanel";
import { ExplanationPanel } from "./components/ExplanationPanel";
import { PredictionCard } from "./components/PredictionCard";

// Canvas & Lab imports
import { CalculusDerivativeCanvas } from "./components/canvas/CalculusDerivativeCanvas";
import { CalculusIntegralCanvas } from "./components/canvas/CalculusIntegralCanvas";
import { TrigUnitCircleCanvas } from "./components/canvas/TrigUnitCircleCanvas";
import { AlgebraBalanceCanvas } from "./components/canvas/AlgebraBalanceCanvas";
import { Vector2D3DCanvas } from "./components/canvas/Vector2D3DCanvas";
import { MatrixTransformationCanvas } from "./components/canvas/MatrixTransformationCanvas";
import { DifferentialEquationCanvas } from "./components/canvas/DifferentialEquationCanvas";
import { FourierSynthesisCanvas } from "./components/canvas/FourierSynthesisCanvas";
import { Multivariable3DCanvas } from "./components/canvas/Multivariable3DCanvas";
import { ProbabilityStatsCanvas } from "./components/canvas/ProbabilityStatsCanvas";

// New Phase 2 Interactive Labs
import { NumberLineLab } from "./components/canvas/NumberLineLab";
import { AlgebraVisualLab } from "./components/canvas/AlgebraVisualLab";
import { FunctionLab } from "./components/canvas/FunctionLab";
import { GeometryProofLab } from "./components/canvas/GeometryProofLab";
import { MotionMathLab } from "./components/canvas/MotionMathLab";
import { LimitContinuityCanvas } from "./components/canvas/LimitContinuityCanvas";
import { ProbabilityExperimentLab } from "./components/canvas/ProbabilityExperimentLab";
import { StatisticsDataLab } from "./components/canvas/StatisticsDataLab";
import { SequenceSeriesLab } from "./components/canvas/SequenceSeriesLab";
import { DiscoveryLab } from "./components/canvas/DiscoveryLab";

import {
  PanelLeftClose,
  PanelLeftOpen,
  Sliders,
  Atom,
  HelpCircle,
  Eye,
  Compass
} from "lucide-react";

export function MathematicsLab() {
  const [activeTopic, setActiveTopic] = useState<TopicDefinition>(CURRICULUM_TOPICS[0]);
  const [userLevel, setUserLevel] = useState<EducationalLevel | "ALL">("ALL");
  const [variables, setVariables] = useState<Record<string, number>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isParamsOpen, setIsParamsOpen] = useState(true);
  const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);

  // Initialize variables when active topic changes
  useEffect(() => {
    const initialVars: Record<string, number> = { ...activeTopic.defaultVariables };
    activeTopic.variableControls.forEach((ctrl) => {
      if (initialVars[ctrl.id] === undefined) {
        initialVars[ctrl.id] = ctrl.defaultValue;
      }
    });
    setVariables(initialVars);
  }, [activeTopic]);

  const handleVariableChange = (id: string, value: number) => {
    setVariables((prev) => ({ ...prev, [id]: value }));
  };

  const handleResetVariables = () => {
    const initialVars: Record<string, number> = { ...activeTopic.defaultVariables };
    activeTopic.variableControls.forEach((ctrl) => {
      initialVars[ctrl.id] = ctrl.defaultValue;
    });
    setVariables(initialVars);
  };

  const handleApplyPreset = (presetVars: Record<string, number>) => {
    setVariables((prev) => ({ ...prev, ...presetVars }));
  };

  // Render the appropriate canvas based on visualizationType and mode
  const renderVisualCanvas = useMemo(() => {
    if (isDiscoveryMode) {
      return (
        <DiscoveryLab
          variables={variables}
          onVariableChange={handleVariableChange}
        />
      );
    }

    switch (activeTopic.visualizationType) {
      case "number-line":
        return (
          <NumberLineLab
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "algebra-area-model":
        return (
          <AlgebraVisualLab
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "function-explorer":
        return (
          <FunctionLab
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "geometry-proof":
        return (
          <GeometryProofLab
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "motion-kinematics":
        return (
          <MotionMathLab
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "limit-continuity":
        return (
          <LimitContinuityCanvas
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "probability-experiment":
        return (
          <ProbabilityExperimentLab
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "statistics-data":
        return (
          <StatisticsDataLab
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "sequences-series":
        return (
          <SequenceSeriesLab
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "calculus-derivative":
        return (
          <CalculusDerivativeCanvas
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "calculus-integral":
        return (
          <CalculusIntegralCanvas
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "trig-unit-circle":
        return (
          <TrigUnitCircleCanvas
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "algebra-balance":
        return (
          <AlgebraBalanceCanvas
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "vector-2d3d":
        return (
          <Vector2D3DCanvas
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "matrix-transform":
        return (
          <MatrixTransformationCanvas
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "differential-equations":
        return (
          <DifferentialEquationCanvas
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "fourier-synthesis":
        return (
          <FourierSynthesisCanvas
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "multivariable-3d":
        return (
          <Multivariable3DCanvas
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      case "probability-stats":
        return (
          <ProbabilityStatsCanvas
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
      default:
        return (
          <CalculusDerivativeCanvas
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        );
    }
  }, [activeTopic.visualizationType, variables, isDiscoveryMode]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-20 shrink-0">
        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Toggle Curriculum Sidebar"
          >
            {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Atom size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">EVLab</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/50">
                  UNIVERSAL MATH LAB
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Interactive Mathematics Visualization, Intuition & Experimentation Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center: Current Active Topic Badge & Discovery Mode Switcher */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">
            {activeTopic.category} / <strong className="text-white">{activeTopic.title}</strong>
          </span>
          <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40 font-mono">
            {activeTopic.levelBadge}
          </span>
        </div>

        {/* Right: Discovery Mode, AI Assistant & Parameter Controls */}
        <div className="flex items-center gap-2">
          {/* Discovery Mode Toggle */}
          <button
            onClick={() => setIsDiscoveryMode(!isDiscoveryMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isDiscoveryMode
                ? "bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
            }`}
            title="Toggle Socratic Discovery Playground"
          >
            <Compass size={14} className={isDiscoveryMode ? "animate-spin text-white" : "text-amber-400"} />
            <span>{isDiscoveryMode ? "Discovery Mode" : "Standard Lab"}</span>
          </button>

          <button
            onClick={() => setIsParamsOpen(!isParamsOpen)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isParamsOpen
                ? "bg-slate-800 border-slate-700 text-slate-200"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Parameter Panel"
          >
            <Sliders size={15} />
            <span className="hidden sm:inline">Parameters</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Topic Tree Navigation */}
        {isSidebarOpen && (
          <aside className="w-72 md:w-80 shrink-0 h-full z-10">
            <TopicTree
              activeTopicId={activeTopic.id}
              onSelectTopic={(t) => {
                setActiveTopic(t);
                setIsDiscoveryMode(false);
              }}
              userLevel={userLevel}
              onSelectLevel={(lvl) => setUserLevel(lvl)}
            />
          </aside>
        )}

        {/* Center & Bottom Pane: Interactive Canvas + Multilayer Explanation */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
          {/* Main Visual Canvas Area */}
          <div className="flex-1 p-2 md:p-3 overflow-hidden flex flex-col">
            {renderVisualCanvas}
          </div>

          {/* Bottom Pane: Pedagogical Explanation, KaTeX Proofs, EV Applications */}
          <div className="h-64 shrink-0 overflow-hidden">
            <ExplanationPanel topic={activeTopic} variables={variables} />
          </div>
        </main>

        {/* Right Pane: Dynamic Parameters Slider Panel */}
        {isParamsOpen && (
          <aside className="w-72 md:w-80 shrink-0 h-full z-10">
            <ParameterPanel
              topic={activeTopic}
              variables={variables}
              onVariableChange={handleVariableChange}
              onResetVariables={handleResetVariables}
              onApplyPreset={handleApplyPreset}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

export default MathematicsLab;
