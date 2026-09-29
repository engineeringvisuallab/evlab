import React from 'react';
import { Hexagon, CheckCircle2 } from 'lucide-react';

export const PhilosophySection: React.FC = () => {
  return (
    <section className="py-12 lg:py-16 border-t border-[var(--border-color)] bg-[var(--bg-elevated)]/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--accent-blue-bg)] border border-[var(--accent-blue)]/20 text-xs font-mono text-[var(--accent-blue)]">
          <Hexagon className="w-3.5 h-3.5" />
          <span>The EVLab Philosophy</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
          Engineering Should Be Connected.
        </h2>

        <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto">
          An engineer should not have to search one platform for a career roadmap, another for calculation spreadsheets, another for modeling software tutorials, another for design codes, and another for real project drawings. EVLab brings every piece of the engineering journey into one unified digital ecosystem.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 text-[var(--accent-emerald)] font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Zero Disconnected Data
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-[var(--accent-purple)] font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Career to Project Traceability
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-[var(--accent-blue)] font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Open Engineering Access
          </span>
        </div>
      </div>
    </section>
  );
};
