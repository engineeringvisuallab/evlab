import React, { useState } from 'react';
import { HelpCircle, Lightbulb, BookOpen, GraduationCap, Atom, Sparkles } from 'lucide-react';
import { EducationLevel, ExperimentMetadata } from '../../types/physics';

interface WhyDidThisHappenEngineProps {
  experiment: ExperimentMetadata;
  educationLevel: EducationLevel;
  currentObservables?: Record<string, any>;
}

export const WhyDidThisHappenEngine: React.FC<WhyDidThisHappenEngineProps> = ({
  experiment,
  educationLevel,
  currentObservables = {},
}) => {
  const [activeTab, setActiveTab] = useState<EducationLevel>(educationLevel);

  const why = experiment.whyExplanation;

  return (
    <div
      id="why-did-this-happen-engine"
      className="bg-[#080808] border border-white/10 rounded-xl p-4 shadow-xl flex flex-col h-full"
    >
      {/* Header - Elegant Dark */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Physical Causal Reasoning
            </h3>
            <p className="text-[10px] text-white/40 font-mono">"Why Did This Happen?" Engine</p>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="flex items-center gap-1 bg-[#050505] p-1 rounded border border-white/10 font-mono">
          {(['school', 'college', 'university', 'advanced'] as EducationLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setActiveTab(lvl)}
              className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider transition-colors ${
                activeTab === lvl
                  ? 'bg-cyan-600 text-black font-bold'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Core Question Card */}
      <div className="bg-[#050505] border border-white/10 rounded-lg p-3.5 mb-3">
        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wide">{why.keyQuestion}</div>
            <div className="text-[10px] text-white/40 mt-1 font-mono">
              GOVERNING PRINCIPLE: <span className="text-cyan-400 font-semibold">{why.governingPrinciple}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Physical Explanation Body */}
      <div className="flex-1 bg-[#050505] border border-white/10 rounded-lg p-3.5 text-xs text-white/70 leading-relaxed overflow-y-auto space-y-3">
        {activeTab === 'school' && (
          <div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase font-mono mb-1.5">
              <BookOpen className="w-3.5 h-3.5" /> School Level Intuition (Class 9–10)
            </div>
            <p>{why.schoolExplanation}</p>
          </div>
        )}

        {activeTab === 'college' && (
          <div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase font-mono mb-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> College / HSC Physics Formulation
            </div>
            <p>{why.collegeExplanation}</p>
          </div>
        )}

        {(activeTab === 'university' || activeTab === 'advanced') && (
          <div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase font-mono mb-1.5">
              <Atom className="w-3.5 h-3.5" /> University & BSc Advanced Analytical Model
            </div>
            <p>{why.universityExplanation}</p>
          </div>
        )}

        {/* Real World Connection */}
        <div className="pt-2 border-t border-white/5">
          <div className="text-[9px] uppercase font-bold tracking-widest text-cyan-500 font-mono mb-1">
            Physical Insight
          </div>
          <p className="text-[11px] text-white/50 italic">
            Physical laws are invariant across measurement scales and experimental reference frames.
          </p>
        </div>
      </div>
    </div>
  );
};
