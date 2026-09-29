import React, { useState } from 'react';
import { AcademicLevel, WhyExplanation } from '../../types/chemistry';
import { getStandardTier, getTierLabel } from '../../engines/AdaptiveLearningEngine';
import { HelpCircle, X, Sparkles, Atom, Binary, Globe, ChevronRight } from 'lucide-react';

interface WhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: WhyExplanation;
  academicLevel: AcademicLevel;
}

export const WhyModal: React.FC<WhyModalProps> = ({
  isOpen,
  onClose,
  explanation,
  academicLevel
}) => {
  const [activeTab, setActiveTab] = useState<'adaptive' | 'molecular' | 'math' | 'realworld'>('adaptive');
  const tier = getStandardTier(academicLevel);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#111A2E] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0B1121]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
                  Scientific Explanation Engine
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                  {getTierLabel(tier)}
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                {explanation.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            id="btn-close-why-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0F172A] px-4">
          {[
            { id: 'adaptive', label: 'Overview', icon: Sparkles },
            { id: 'molecular', label: 'Molecular View', icon: Atom },
            { id: 'math', label: 'Mathematical Law', icon: Binary },
            { id: 'realworld', label: 'Real World', icon: Globe }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                  isActive
                    ? 'border-teal-400 text-teal-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-300 text-sm leading-relaxed">
          {activeTab === 'adaptive' && (
            <div className="space-y-4">
              {/* Level-Specific Primary Explanation */}
              <div className="p-4 rounded-xl bg-[#0F172A] border border-teal-500/30 space-y-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                  Targeted Explanation ({getTierLabel(tier)})
                </div>
                <p className="text-white text-sm sm:text-base leading-relaxed">
                  {tier === 1 && explanation.simple}
                  {tier === 2 && explanation.standard}
                  {tier === 3 && explanation.standard}
                  {tier === 4 && explanation.advanced}
                  {tier === 5 && (explanation.engineering || explanation.advanced)}
                </p>
              </div>

              {/* Macroscopic Observation */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Macroscopic Observation (What you see):
                </span>
                <p className="text-slate-300 text-xs">{explanation.macroscopic}</p>
              </div>

              {/* Progressive Deep Dive disclosure if on lower tier */}
              {tier <= 2 && (
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Deeper Scientific Insight (Preview):
                  </div>
                  <p className="text-xs text-slate-400 italic">{explanation.advanced}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'molecular' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                  <Atom className="w-4 h-4" />
                  <span>Sub-Microscopic Particle Mechanism</span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{explanation.molecular}</p>
              </div>
            </div>
          )}

          {activeTab === 'math' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                  <Binary className="w-4 h-4" />
                  <span>Governing Mathematical Law</span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{explanation.mathematical}</p>
              </div>
            </div>
          )}

          {activeTab === 'realworld' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  <Globe className="w-4 h-4" />
                  <span>Real-World & Industrial Impact</span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{explanation.realWorld}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0B1121] flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>EVLAB ADAPTIVE EXPLANATION MATRIX</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold uppercase tracking-wider transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
