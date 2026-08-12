import React from 'react';
import { Compass, ArrowRight, Building2, Zap, Wrench } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';

// Import actual Stage 01 roadmap tree data
import roadmapData from '../../data/roadmap-tree.json';

export interface EngineeringFieldGridProps {
  onNavigate: (sectionId: string, fieldId?: string) => void;
}

export const EngineeringFieldGrid: React.FC<EngineeringFieldGridProps> = ({ onNavigate }) => {
  // Map icons for known top fields
  const fieldIcons: Record<string, React.ReactNode> = {
    'civil-engineering': <Building2 className="w-6 h-6 text-[var(--accent-purple)]" />,
    'electrical-engineering': <Zap className="w-6 h-6 text-[var(--accent-amber)]" />,
    'mechanical-engineering': <Wrench className="w-6 h-6 text-[var(--accent-blue)]" />,
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

        {/* Dynamic Field Grid from roadmap-tree.json */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmapData.map((field) => {
            const branchCount = field.children ? field.children.length : 0;
            const icon = fieldIcons[field.id] || <Compass className="w-6 h-6 text-[var(--accent-purple)]" />;

            return (
              <Card
                key={field.id}
                variant="roadmap"
                hoverable
                padding="lg"
                className="flex flex-col justify-between cursor-pointer group space-y-6"
                onClick={() => onNavigate('roadmap', field.id)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-[var(--accent-purple-bg)] border border-[var(--accent-purple)]/20">
                      {icon}
                    </div>
                    <Badge variant="purple" size="sm">
                      {branchCount > 0 ? `${branchCount} Major Branches` : 'Discipline'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-purple)] transition-colors">
                      {field.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {field.summary}
                    </p>
                  </div>
                </div>

                {/* Sub-branches preview if available */}
                {field.children && field.children.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      Featured Branches
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {field.children.map((branch) => (
                        <span
                          key={branch.id}
                          className="text-xs px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)]"
                        >
                          {branch.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[var(--accent-purple)] group-hover:translate-x-1 transition-transform">
                  <span>Explore Discipline Path</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
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
