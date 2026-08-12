import React from 'react';
import { Compass, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';

export interface FinalCTAProps {
  onNavigate: (sectionId: string) => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onNavigate }) => {
  return (
    <section className="py-16 lg:py-20 border-t border-[var(--border-color)] relative overflow-hidden bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-elevated)]">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent-purple-bg)] rounded-full blur-[120px] pointer-events-none opacity-40" />
      <div className="absolute top-1/2 right-1/3 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent-emerald-bg)] rounded-full blur-[120px] pointer-events-none opacity-40" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <Badge variant="blue" icon={<Sparkles className="w-3.5 h-3.5" />}>
          START YOUR ENGINEERING FUTURE
        </Badge>

        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Your Engineering Journey Starts Here.
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Choose where you want to go. Then discover what it takes to get there.
          </p>
        </div>

        {/* Two Large Action Doors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-2">
          {/* Career Roadmap CTA */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--accent-purple)]/40 hover:border-[var(--accent-purple)] transition-all space-y-4 shadow-xl text-left flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-[var(--accent-purple-bg)] text-[var(--accent-purple)] w-fit">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-purple)] transition-colors">
                Career Roadmap
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Explore engineering disciplines, specializations, skills, software and career roles.
              </p>
            </div>
            <Button
              variant="roadmap"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              onClick={() => onNavigate('roadmap')}
            >
              Start Career Roadmap
            </Button>
          </div>

          {/* UELE CTA */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--accent-emerald)]/40 hover:border-[var(--accent-emerald)] transition-all space-y-4 shadow-xl text-left flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-[var(--accent-emerald-bg)] text-[var(--accent-emerald)] w-fit">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-emerald)] transition-colors">
                UELE 3D World
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Explore physical engineering systems, water treatment plants, smart cities and infrastructure.
              </p>
            </div>
            <Button
              variant="uele"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              onClick={() => onNavigate('uele')}
            >
              Enter UELE 3D
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
