import React from 'react';
import { TopicData } from '../types';
import { 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Lightbulb, 
  ShieldAlert, 
  TrendingUp 
} from 'lucide-react';

interface LearnPanelProps {
  topic: TopicData;
}

export const LearnPanel: React.FC<LearnPanelProps> = ({ topic }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-y-auto p-4 space-y-5 select-none scrollbar-thin scrollbar-thumb-slate-800">
      {/* Topic Title & Overview */}
      <div className="pb-3 border-b border-slate-800 space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 font-semibold uppercase tracking-wider">
            {topic.category}
          </span>
          <span className="text-xs font-mono text-slate-500">
            {topic.standardRef}
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-100 mt-1">
          {topic.title}
        </h2>
        <p className="text-xs text-slate-400 font-sans">
          {topic.subtitle}
        </p>
      </div>

      {/* 1. Physical Concept & Core Mechanism */}
      <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>1. Physical Concept & Behavior</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {topic.theory.concept}
        </p>
      </div>

      {/* 2. Governing Engineering Theory */}
      <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          <span>2. Governing Theory</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {topic.theory.governingTheory}
        </p>
      </div>

      {/* 3. Mathematical Derivation / Relations */}
      <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
          <Lightbulb className="w-4 h-4" />
          <span>3. Derivation & Mathematical Foundations</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {topic.theory.derivation}
        </p>
      </div>

      {/* 4. Assumptions & Validity Bounds */}
      <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2.5">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>4. Fundamental Assumptions & Range of Validity</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {topic.theory.assumptions.map((assump, i) => (
            <li key={i} className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold text-xs mt-0.5">•</span>
              <span className="leading-relaxed">{assump}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Practical Engineering Applications */}
      <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2.5">
        <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>5. Real-World Engineering Applications</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {topic.theory.practicalApplications.map((app, i) => (
            <div
              key={i}
              className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80 text-xs text-slate-300 leading-relaxed"
            >
              {app}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Common Mistakes & Pitfalls */}
      <div className="bg-rose-950/20 p-4 rounded-lg border border-rose-900/40 space-y-2.5">
        <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>6. Common Design Mistakes & Pitfalls</span>
        </div>
        <ul className="space-y-1.5 text-xs text-rose-200/90">
          {topic.theory.commonMistakes.map((mistake, i) => (
            <li key={i} className="flex items-start space-x-2">
              <span className="text-rose-400 font-bold text-xs mt-0.5">✕</span>
              <span className="leading-relaxed">{mistake}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
