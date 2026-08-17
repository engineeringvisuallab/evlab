import React, { useState } from 'react';
import { Compass, ArrowRight, Building2, Zap, Wrench, Sparkles, GitBranch } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';

// Import actual Stage 01 roadmap tree data
import roadmapData from '../../data/roadmap-tree.json';

export interface EngineeringFieldGridProps {
  onNavigate: (sectionId: string, fieldId?: string) => void;
}

export const EngineeringFieldGrid: React.FC<EngineeringFieldGridProps> = ({ onNavigate }) => {
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);

  // Map icons for known top fields
  const fieldIcons: Record<string, React.ReactNode> = {
    civil: <Building2 className="w-5 h-5 text-[var(--accent-purple)]" />,
    electrical: <Zap className="w-5 h-5 text-[var(--accent-amber)]" />,
    mechanical: <Wrench className="w-5 h-5 text-[var(--accent-blue)]" />,
  };

  return (
    <section id="career-roadmap-section" className="py-12 lg:py-16 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeader
          badge="Career Roadmap Gateway"
          badgeVariant="purple"
          title="What Do You Want to Become?"
          description="Start with a discipline. Explore its branches. Choose your specialization. Go deeper until your career path becomes clear."
          action={
            <Button
              variant="roadmap"
              size="md"
              leftIcon={<Compass className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate('roadmap')}
            >
              Explore Full Career Roadmap
            </Button>
          }
        />

        {/* Dynamic Field Grid from roadmap-tree.json with Hover-to-Expand Behavior */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
          {roadmapData.map((field) => {
            const branchCount = field.children ? field.children.length : 0;
            const icon = fieldIcons[field.id] || <Compass className="w-5 h-5 text-[var(--accent-purple)]" />;
            const isHovered = hoveredFieldId === field.id;

            return (
              <div
                key={field.id}
                onMouseEnter={() => setHoveredFieldId(field.id)}
                onMouseLeave={() => setHoveredFieldId(null)}
                onClick={() => onNavigate('roadmap', field.id)}
                className={`relative rounded-2xl bg-[var(--bg-surface)] border transition-all duration-300 cursor-pointer overflow-hidden group select-none ${
                  isHovered
                    ? 'border-[var(--accent-purple)] shadow-xl shadow-purple-500/15 -translate-y-1 bg-[var(--bg-elevated)]'
                    : 'border-[var(--border-color)] hover:border-[var(--accent-purple)]/50'
                }`}
              >
                {/* Top Accent line on hover */}
                <div
                  className={`h-1 w-full transition-all duration-300 ${
                    isHovered
                      ? 'bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-purple)] to-[var(--accent-emerald)]'
                      : 'bg-transparent'
                  }`}
                />

                <div className={`transition-all duration-300 ${isHovered ? 'p-5 space-y-3' : 'p-4'}`}>
                  {/* Title - ONLY thing visible in collapsed state */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-purple)] transition-colors leading-snug">
                      {field.title}
                    </h3>
                    <ArrowRight
                      className={`w-4 h-4 text-[var(--accent-purple)] transition-all duration-300 ${
                        isHovered ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0'
                      }`}
                    />
                  </div>

                  {/* Expandable Section on Hover */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isHovered ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden space-y-3 pt-2 border-t border-[var(--border-color)]/70">
                      {/* Top Bar: Icon + Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-[var(--accent-purple-bg)] border border-[var(--accent-purple)]/30">
                            {icon}
                          </div>
                          <Badge variant="purple" size="sm">
                            STEP 1 • FIELD
                          </Badge>
                        </div>

                        {branchCount > 0 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--accent-purple)] font-semibold">
                            {branchCount} Branches
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {field.summary}
                      </p>

                      {/* Sub-branches preview */}
                      {field.children && field.children.length > 0 && (
                        <div className="pt-2 border-t border-[var(--border-color)]/70 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                            <span className="uppercase tracking-wider flex items-center gap-1">
                              <GitBranch className="w-2.5 h-2.5 text-[var(--accent-blue)]" />
                              Stage 2 Branches
                            </span>
                            <span className="text-[var(--accent-purple)] font-semibold">{branchCount} Total</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {field.children.slice(0, 6).map((branch) => (
                              <span
                                key={branch.id}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-purple)] hover:border-[var(--accent-purple)] transition-colors"
                              >
                                {branch.title}
                              </span>
                            ))}
                            {field.children.length > 6 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[var(--bg-surface)] text-[var(--accent-purple)] font-mono self-center">
                                +{field.children.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action CTA */}
                      <div className="pt-2.5 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[var(--accent-purple)]">
                        <span>Explore Discipline Branches</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Supporting Guidance Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--accent-purple)]/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              Don't know where to start?
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl">
              Explore all engineering disciplines and discover the paths, skills, software, standards, projects and careers connected to each one.
            </p>
          </div>
          <Button
            variant="roadmap"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => onNavigate('roadmap')}
            className="shrink-0"
          >
            Explore Full Roadmap
          </Button>
        </div>
      </div>
    </section>
  );
};

