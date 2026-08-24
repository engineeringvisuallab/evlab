import React from 'react';

export const EcosystemStats: React.FC = () => {
  const stats = [
    { label: 'Engineering Fields', value: '25+', accent: 'text-[var(--accent-purple)]' },
    { label: 'Branches & Specializations', value: '500+', accent: 'text-[var(--accent-blue)]' },
    { label: 'Knowledge Connections', value: '5,000+', accent: 'text-[var(--accent-cyan)]' },
    { label: 'Engineering Software & Tools', value: '200+', accent: 'text-[var(--accent-amber)]' },
    { label: 'Engineering Possibilities', value: '∞', accent: 'text-[var(--accent-emerald)]' },
  ];

  return (
    <section className="py-12 border-t border-[var(--border-color)] bg-[var(--bg-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-1">
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
            EVLab Ecosystem Scale
          </p>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            Built to connect engineering direction, theory, tools, standards, and real-world practice.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
              <div className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${stat.accent}`}>
                {stat.value}
              </div>
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
