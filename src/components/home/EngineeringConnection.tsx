import React from 'react';
import { ChevronRight, Compass } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { Badge } from '../shared/Badge';

export const EngineeringConnection: React.FC = () => {
  const pipelineSteps = [
    { label: 'Career Goal', desc: 'Identify target role' },
    { label: 'Knowledge', desc: 'Master physical theory' },
    { label: 'Skills', desc: 'Aquire design competencies' },
    { label: 'Software', desc: 'Master CAD/BIM & Sim' },
    { label: 'Standards', desc: 'Apply AWWA/ISO codes' },
    { label: 'Practice', desc: 'Calculate & model' },
    { label: 'Projects', desc: 'Execute case studies' },
    { label: 'Career', desc: 'Become Specialist' },
  ];

  const exampleJourney = [
    { step: '01 Field', name: 'Civil Engineering', badge: 'Discipline' },
    { step: '02 Branch', name: 'Water Engineering', badge: 'Branch' },
    { step: '03 Spec', name: 'Water Supply Engineering', badge: 'Specialization' },
    { step: '04 Area', name: 'Water Supply Network', badge: 'Area' },
    { step: '05 Knowledge', name: 'Hydraulics & Fluid Mechanics', badge: 'Theory' },
    { step: '06 Software', name: 'WaterCAD & EPANET', badge: 'Tools' },
    { step: '07 Standards', name: 'AWWA & ISO Specifications', badge: 'Codes' },
    { step: '08 Project', name: 'Dhaka WTP & Distribution', badge: 'Case Study' },
    { step: '09 Role', name: 'Water Supply Engineer', badge: 'Career' },
  ];

  return (
    <section className="py-12 lg:py-16 border-t border-[var(--border-color)] bg-[var(--bg-elevated)]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeader
          badge="Ecosystem Connection"
          badgeVariant="purple"
          title="How Everything Connects in EVLab"
          description="An engineer should not have to search one place for a career path, another for software, another for standards, and another for real project examples. EVLab connects the entire journey."
        />

        {/* Global Pipeline Steps Visual */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-md space-y-4">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] text-center sm:text-left">
            The Complete Engineering Pathway Pipeline
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {pipelineSteps.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center space-y-1 relative"
              >
                <div className="text-[10px] font-mono text-[var(--accent-purple)] font-bold">
                  STEP 0{idx + 1}
                </div>
                <div className="font-bold text-xs text-[var(--text-primary)]">
                  {item.label}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] truncate">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Concrete Real Journey Example from Stage 01 Data */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-elevated)] border border-[var(--accent-purple)]/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Badge variant="purple" icon={<Compass className="w-3 h-3" />}>
                  REAL DATA JOURNEY EXAMPLE
                </Badge>
                <span className="text-xs font-mono text-[var(--text-muted)]">Stage 01 Data Connection</span>
              </div>
              <h4 className="text-lg font-extrabold text-[var(--text-primary)] mt-1">
                Civil Engineering → Water Supply Network Specialist
              </h4>
            </div>
            <p className="text-xs font-mono text-[var(--text-secondary)]">
              All 9 steps connected live in EVLab
            </p>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {exampleJourney.map((j, idx) => (
              <React.Fragment key={idx}>
                <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] min-w-[160px] shrink-0 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[var(--accent-purple)] font-bold">{j.step}</span>
                    <Badge variant="muted" size="sm">{j.badge}</Badge>
                  </div>
                  <p className="font-bold text-xs text-[var(--text-primary)]">{j.name}</p>
                </div>

                {idx < exampleJourney.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-[var(--border-subtle)] shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
