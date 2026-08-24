import React, { useState } from "react";
import { TopicDefinition } from "../types/math";
import { MathFormula } from "./MathFormula";
import {
  Lightbulb,
  Cpu,
  BookOpen,
  Calculator,
  AlertTriangle,
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  Compass,
  FileText,
  Layers,
  GraduationCap
} from "lucide-react";
import { DerivationModal } from "./DerivationModal";

interface Props {
  topic: TopicDefinition;
  variables: Record<string, number>;
}

export const ExplanationPanel: React.FC<Props> = ({ topic, variables }) => {
  const [activeTab, setActiveTab] = useState<
    "learn" | "calculate" | "understand" | "apply" | "challenges" | "story"
  >("learn");
  const [perspective, setPerspective] = useState<"pure" | "applied" | "engineering">("applied");
  const [showDerivation, setShowDerivation] = useState(false);
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number>(0);
  const [challengeSolved, setChallengeSolved] = useState<boolean | null>(null);

  const tabs = [
    { id: "learn", label: "1. Learn & Intuition", icon: Lightbulb },
    { id: "story", label: "2. Story & Question", icon: Compass },
    { id: "calculate", label: "3. Step-by-Step Proof", icon: Calculator },
    { id: "understand", label: "4. Live Meaning & Pitfalls", icon: BookOpen },
    { id: "apply", label: "5. Real EV / Engineering", icon: Cpu },
    { id: "challenges", label: "6. Interactive Challenge", icon: Trophy },
  ] as const;

  const currentDynamicExplanation = topic.understand?.dynamicExplanationFn
    ? topic.understand.dynamicExplanationFn(variables)
    : topic.learn?.intuition || topic.summary;

  const currentChallenge = topic.challenges?.[activeChallengeIdx];

  const handleCheckChallenge = () => {
    if (!currentChallenge) return;
    const isSuccess = currentChallenge.validator(variables);
    setChallengeSolved(isSuccess);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border-t border-slate-800 text-slate-200 overflow-hidden">
      {/* Top Bar: Tabs + Perspective Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-950/80 border-b border-slate-800">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon size={13} className={isActive ? "text-cyan-400" : "text-slate-500"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Perspective Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <span className="text-[10px] text-slate-500 font-mono px-1.5 uppercase font-bold">Perspective:</span>
          <button
            onClick={() => setPerspective("pure")}
            className={`px-2 py-0.5 rounded ${perspective === "pure" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
          >
            Pure
          </button>
          <button
            onClick={() => setPerspective("applied")}
            className={`px-2 py-0.5 rounded ${perspective === "applied" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
          >
            Applied
          </button>
          <button
            onClick={() => setPerspective("engineering")}
            className={`px-2 py-0.5 rounded ${perspective === "engineering" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
          >
            Engineering
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[300px]">
        {/* TAB 1: LEARN & INTUITION */}
        {activeTab === "learn" && (
          <div className="space-y-3 max-w-4xl">
            {/* Bilingual Intuition Banner */}
            {topic.bilingual && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-800/40 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-300 font-mono">{topic.bilingual.englishTerm}</span>
                    <span className="text-xs text-slate-400 font-mono">/</span>
                    <span className="text-xs font-bold text-amber-300">{topic.bilingual.banglaTerm}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-bengali">
                    {topic.bilingual.banglaIntuition}
                  </p>
                </div>

                {topic.derivation && (
                  <button
                    onClick={() => setShowDerivation(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md"
                  >
                    <BookOpen size={13} />
                    <span>Why Formula Works?</span>
                  </button>
                )}
              </div>
            )}

            {/* Concept Definition & Physical Intuition */}
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5 shrink-0">
                <Lightbulb size={16} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider text-amber-400">
                  Concept Definition
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {topic.learn?.definition || topic.summary}
                </p>
                <div className="mt-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                    Visual & Physical Intuition
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {topic.learn?.intuition || topic.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Formulas */}
            {topic.learn?.keyFormulas && topic.learn.keyFormulas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                {topic.learn.keyFormulas.map((f, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      {f.label}
                    </span>
                    <div className="text-cyan-300 py-1 text-xs font-mono-math">
                      <MathFormula formula={f.formula} block />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{f.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Curriculum Level Matrix */}
            {topic.learn?.levelSpecificNotes && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                  <GraduationCap size={14} />
                  <span>Curriculum Level Progression</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(topic.learn.levelSpecificNotes).map(([level, note]) => (
                    <div key={level} className="p-2 rounded bg-slate-900 border border-slate-800/60">
                      <strong className="text-slate-200 block mb-0.5">{level}:</strong>
                      <span className="text-slate-400">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STORY MODE & QUESTION-FIRST */}
        {activeTab === "story" && topic.storyMode && (
          <div className="space-y-3 max-w-4xl">
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 border border-amber-800/40 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                <Compass size={16} />
                <span>The Big Question Hook</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-100 leading-relaxed">
                "{topic.storyMode.hookQuestion}"
              </h4>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Historical & Physical Scenario</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {topic.storyMode.scenario}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-900/40 space-y-1">
                <span className="text-[10px] text-indigo-400 uppercase font-mono block font-bold">The Mathematical Bridge</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {topic.storyMode.mathematicalBridge}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STEP-BY-STEP PROOF & CALCULATION */}
        {activeTab === "calculate" && (
          <div className="space-y-3 max-w-4xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Calculator size={14} className="text-cyan-400" />
                <span>Step-by-Step Symbolic Derivation</span>
              </h4>
              {topic.derivation && (
                <button
                  onClick={() => setShowDerivation(true)}
                  className="px-2.5 py-1 rounded bg-amber-600/80 hover:bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1"
                >
                  <BookOpen size={12} />
                  <span>Visual Proof Mode</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {topic.calculate.symbolicSteps.map((step) => (
                <div
                  key={step.step}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {step.step}
                  </span>
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-xs text-slate-200">{step.title}</div>
                    <div className="text-cyan-300 text-xs py-0.5">
                      <MathFormula formula={step.latex} />
                    </div>
                    <p className="text-[11px] text-slate-400">{step.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LIVE UNDERSTANDING & COMMON PITFALLS */}
        {activeTab === "understand" && (
          <div className="space-y-3 max-w-4xl">
            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-900/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                <Sparkles size={14} />
                <span>Dynamic State Explanation</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                {currentDynamicExplanation}
              </p>
            </div>

            {topic.understand.commonMistakes && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Common Conceptual Traps & Misconceptions
                </span>
                {topic.understand.commonMistakes.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                      <AlertTriangle size={13} />
                      <span>Pitfall: {m.mistake}</span>
                    </div>
                    <p className="text-slate-300 pl-4">{m.correction}</p>
                    <p className="text-[10px] text-slate-500 pl-4 font-mono">Why: {m.why}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REAL-WORLD & EV ENGINEERING APPLICATIONS */}
        {activeTab === "apply" && (
          <div className="space-y-3 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topic.apply.map((app, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/40">
                      {app.domain}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">{app.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{app.description}</p>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                    <strong className="text-slate-200 block mb-0.5">Real System:</strong>
                    {app.realWorldExample}
                  </div>
                  {app.engineeringFormula && (
                    <div className="text-cyan-300 text-xs font-mono pt-1">
                      <MathFormula formula={app.engineeringFormula} block />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: INTERACTIVE CHALLENGE */}
        {activeTab === "challenges" && currentChallenge && (
          <div className="space-y-3 max-w-2xl">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Trophy size={15} />
                  <span>{currentChallenge.title}</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  Target: {currentChallenge.targetCondition}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {currentChallenge.question}
              </p>

              {currentChallenge.hint && (
                <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                  💡 Hint: {currentChallenge.hint}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleCheckChallenge}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                >
                  Verify Visual Solution
                </button>

                {challengeSolved !== null && (
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {challengeSolved ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={15} /> {currentChallenge.successMessage}
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle size={15} /> Not quite there yet. Keep adjusting the sliders!
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Visual Derivations */}
      {showDerivation && topic.derivation && (
        <DerivationModal derivation={topic.derivation} onClose={() => setShowDerivation(false)} />
      )}
    </div>
  );
};
