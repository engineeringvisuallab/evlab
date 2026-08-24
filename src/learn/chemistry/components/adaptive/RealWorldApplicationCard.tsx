import React from 'react';
import { Globe, ArrowUpRight, CheckCircle } from 'lucide-react';

interface RealWorldApplicationCardProps {
  topicTitle: string;
  applications: Array<{ title: string; field: string; description: string }>;
  className?: string;
}

export const RealWorldApplicationCard: React.FC<RealWorldApplicationCardProps> = ({
  topicTitle,
  applications,
  className = ''
}) => {
  if (!applications || applications.length === 0) return null;

  return (
    <div
      className={`bg-[#111A2E] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 ${className}`}
      id="real-world-application-card"
    >
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <Globe className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Real-World & Industrial Connections: {topicTitle}
          </h3>
          <p className="text-[11px] text-slate-400">
            Where this chemistry principle drives modern manufacturing, healthcare, and environmental technology.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {applications.map((app, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-emerald-800/40">
                {app.field}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-tight">
              {app.title}
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              {app.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
