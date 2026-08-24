import React from 'react';
import { Network, ArrowRight } from 'lucide-react';

interface RelatedConceptsGraphProps {
  currentConcept: string;
  relatedConcepts: Array<{ id: string; name: string; relation: string; category: string }>;
  onSelectConcept?: (id: string) => void;
  className?: string;
}

export const RelatedConceptsGraph: React.FC<RelatedConceptsGraphProps> = ({
  currentConcept,
  relatedConcepts,
  onSelectConcept,
  className = ''
}) => {
  return (
    <div
      className={`bg-[#111A2E] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 ${className}`}
      id="related-concepts-graph"
    >
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
          <Network className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Chemistry Knowledge Graph: {currentConcept}
          </h3>
          <p className="text-[11px] text-slate-400">
            Cross-concept linkages connecting foundations, reactions, and thermodynamics.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {relatedConcepts.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectConcept && onSelectConcept(item.id)}
            className="group flex items-center gap-2 p-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition-all text-left"
          >
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">
                {item.relation}
              </div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                {item.name}
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};
