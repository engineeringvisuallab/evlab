import React, { useState } from "react";
import { FormulaDerivation } from "../types/math";
import { MathFormula } from "./MathFormula";
import { BookOpen, X, ChevronRight, ChevronLeft, Lightbulb, CheckCircle2 } from "lucide-react";

interface Props {
  derivation: FormulaDerivation;
  onClose: () => void;
}

export const DerivationModal: React.FC<Props> = ({ derivation, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = derivation.steps[currentStep];
  const totalSteps = derivation.steps.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-amber-400" size={20} />
            <div>
              <h3 className="text-sm font-bold text-slate-100">{derivation.formulaTitle}</h3>
              <p className="text-[11px] text-slate-400">{derivation.summary}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Target Result Banner */}
        <div className="p-3 bg-indigo-950/40 border-b border-indigo-900/30 flex items-center justify-between px-6">
          <span className="text-xs font-mono text-indigo-300 font-bold">Goal Formula:</span>
          <MathFormula formula={derivation.finalLatex} />
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 pt-4 flex items-center justify-between gap-1">
          {derivation.steps.map((_, idx) => (
            <button
              key={`step-dot-${idx}`}
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                idx === currentStep
                  ? "bg-amber-400"
                  : idx < currentStep
                  ? "bg-emerald-500"
                  : "bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Main Step Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span className="text-amber-300 font-bold">{step.stepTitle}</span>
          </div>

          {/* Latex Box */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center my-2 shadow-inner">
            <MathFormula formula={step.latex} block />
          </div>

          {/* Geometric & Algebraic Intuition Card */}
          <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 font-mono">
              <Lightbulb size={15} />
              <span>Geometric & Physical Meaning</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {step.geometricIntuition}
            </p>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              currentStep === 0
                ? "bg-slate-800/40 text-slate-600 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
          >
            <ChevronLeft size={14} />
            <span>Previous Step</span>
          </button>

          {currentStep < totalSteps - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1))}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-md"
            >
              <span>Next Step</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-md"
            >
              <CheckCircle2 size={14} />
              <span>Complete Proof</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
