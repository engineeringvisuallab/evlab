import React, { useState } from 'react';
import { CURRICULUM_TOPICS, CurriculumTopic } from '../../data/curriculum';
import { AcademicLevel } from '../../types/chemistry';
import { getStandardTier, getTierLabel, ProgressEngine } from '../../engines/AdaptiveLearningEngine';
import {
  BookOpen,
  FlaskConical,
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
  HelpCircle,
  Trophy,
  Atom,
  Binary,
  Globe,
  Award
} from 'lucide-react';

interface LearnViewProps {
  academicLevel: AcademicLevel;
  onLaunchLab: (labId: string) => void;
  selectedTopicId?: string;
}

export const LearnView: React.FC<LearnViewProps> = ({
  academicLevel,
  onLaunchLab,
  selectedTopicId
}) => {
  const [activeTopic, setActiveTopic] = useState<CurriculumTopic>(
    CURRICULUM_TOPICS.find((t) => t.id === selectedTopicId) || CURRICULUM_TOPICS[0]
  );
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [activeStepTab, setActiveStepTab] = useState<'learn' | 'see' | 'calculate' | 'apply' | 'challenge'>('learn');

  const tier = getStandardTier(academicLevel);
  const subjects = ['All', 'General', 'Physical', 'Inorganic', 'Organic', 'Analytical', 'Electrochemistry', 'Thermochemistry'];

  const filteredTopics = CURRICULUM_TOPICS.filter((t) => {
    if (filterSubject !== 'All' && t.subject !== filterSubject) return false;
    return true;
  });

  const learningCycle = [
    { id: 'learn', label: '1. LEARN CONCEPT', icon: BookOpen, desc: 'Theoretical foundation & physical intuition' },
    { id: 'see', label: '2. SEE PHENOMENON', icon: Atom, desc: 'Microscopic & macroscopic visualization' },
    { id: 'calculate', label: '3. CALCULATE', icon: Binary, desc: 'Governing equations & unit algebra' },
    { id: 'apply', label: '4. REAL WORLD', icon: Globe, desc: 'Industrial, biological & environmental engineering' },
    { id: 'challenge', label: '5. CHALLENGE', icon: Trophy, desc: 'Problem solving & laboratory trials' }
  ];

  return (
    <div className="space-y-6" id="learn-view">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111A2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <BookOpen className="w-5 h-5" />
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                Concept-First Adaptive Learning Journey
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-teal-400 font-bold">
                {getTierLabel(tier)}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Structured textbook modules adapted to your target educational depth: <strong className="text-teal-300">{academicLevel}</strong>.
          </p>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0B1121] p-1.5 rounded-xl border border-slate-800">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setFilterSubject(sub)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filterSubject === sub
                  ? 'bg-teal-600 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Topic Selector List & Active Topic Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topics Navigation (4 Cols) */}
        <div className="lg:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
          {filteredTopics.map((topic) => {
            const isSelected = activeTopic.id === topic.id;
            return (
              <div
                key={topic.id}
                onClick={() => setActiveTopic(topic)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-teal-950/40 border-teal-500/80 text-white shadow-md'
                    : 'bg-[#111A2E] border-slate-800 text-slate-300 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white uppercase tracking-tight">{topic.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0B1121] text-teal-400 border border-slate-800 font-mono">
                    {topic.subject}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">{topic.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Topic Deep-Dive Reader with 5-Step Cycle (8 Cols) */}
        <div className="lg:col-span-8 bg-[#111A2E] border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">
                {activeTopic.subject} Chemistry • {getTierLabel(tier)} Depth
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">{activeTopic.title}</h3>
            </div>

            <button
              onClick={() => {
                ProgressEngine.markTopicCompleted(activeTopic.id);
                onLaunchLab(activeTopic.recommendedLab);
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-teal-950/40 transition-all self-start"
            >
              <FlaskConical className="w-4 h-4 text-slate-950" />
              <span>Launch Associated Lab</span>
            </button>
          </div>

          {/* 5-Step Learning Pathway Tabs */}
          <div className="flex flex-wrap gap-1 bg-[#0B1121] p-1 rounded-xl border border-slate-800">
            {learningCycle.map((step) => {
              const Icon = step.icon;
              const isActive = activeStepTab === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepTab(step.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-teal-600 text-slate-950 font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                  title={step.desc}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-teal-400'}`} />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Step 1: Theoretical Concept */}
          {activeStepTab === 'learn' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  Theoretical Foundations ({getTierLabel(tier)})
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed">{activeTopic.description}</p>
              </div>

              {/* Learning Outcomes Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Competencies & Learning Outcomes
                </h4>
                <div className="space-y-2">
                  {activeTopic.learningOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded-lg bg-[#0F172A] border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: See Microscopic & Macroscopic */}
          {activeStepTab === 'see' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Atom className="w-4 h-4" /> Sub-Microscopic Particle Mechanism
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  In this topic, macroscopic observations (such as temperature rises, color shifts, or pressure spikes) are directly driven by particle collisions and thermodynamic energy transitions.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onLaunchLab(activeTopic.recommendedLab)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Open Interactive Particle Simulation</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Calculate & Formulas */}
          {activeStepTab === 'calculate' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Binary className="w-3.5 h-3.5" /> Key Governing Formulas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {activeTopic.keyFormulas.map((formula, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#0B1121] border border-slate-800 font-mono text-xs text-teal-300 font-bold"
                    >
                      {formula}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Real-World Applications */}
          {activeStepTab === 'apply' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Industrial & Biological Significance
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Understanding {activeTopic.title} is essential for chemical engineering, pharmaceutical manufacturing, battery technology, and environmental protection.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Challenge & Mastery */}
          {activeStepTab === 'challenge' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-amber-500/40 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" /> Laboratory Mastery Challenge
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Ready to test your practical and mathematical intuition? Launch the virtual lab in Challenge Mode to solve for unknown experimental values.
                </p>
                <button
                  onClick={() => onLaunchLab(activeTopic.recommendedLab)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Start Challenge in Lab</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
