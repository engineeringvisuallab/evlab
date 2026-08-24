import React, { useState } from 'react';
import { HelpCircle, Sparkles, X, Atom, BookOpen, Calculator, ArrowRight, Lightbulb } from 'lucide-react';

interface WhyButtonProps {
  experimentName: string;
  observation: string;
  stateContext?: Record<string, any>;
  className?: string;
  label?: string;
}

export const WhyButton: React.FC<WhyButtonProps> = ({
  experimentName,
  observation,
  stateContext = {},
  className = '',
  label = 'WHY?'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const fetchWhyExplanation = async () => {
    setIsOpen(true);
    if (explanation) return; // already cached

    setLoading(true);
    try {
      const res = await fetch('/api/gemini/explain-why', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentName,
          observation,
          state: stateContext
        })
      });
      const data = await res.json();
      if (data.explanation) {
        setExplanation(data.explanation);
      } else {
        setExplanation('Unable to retrieve detailed AI analysis at this moment.');
      }
    } catch (err) {
      setExplanation('Scientific rationale: When conditions shift, reaction kinetics and thermodynamics alter equilibrium states and collision frequencies according to Le Chatelier and Arrhenius principles.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={fetchWhyExplanation}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-all shadow-sm active:scale-95 ${className}`}
        id={`btn-why-${experimentName.toLowerCase().replace(/\s+/g, '-')}`}
        title="Discover why this result occurred"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>{label}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Atom className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Scientific "Why?" Analysis
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {experimentName}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Observation: <span className="text-slate-200 italic">"{observation}"</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                id="btn-close-why-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto pr-1 text-sm text-slate-300 space-y-4">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">
                    Dr. Chem is synthesizing sub-microscopic molecular kinetics and mathematical derivations...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Core Principle:</strong> Chemistry connects observable laboratory facts to sub-microscopic collisions and thermodynamic laws.
                    </div>
                  </div>

                  <div className="prose prose-invert prose-sm max-w-none leading-relaxed whitespace-pre-line text-slate-200">
                    {explanation}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 pt-3 mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>EVLab Scientific Reasoning Engine</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
