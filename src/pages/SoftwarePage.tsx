import React from 'react';
import { Sparkles, ArrowUpRight, Clock, Droplets, PenTool, Code2, Box, Map, Calculator, Table2, GanttChartSquare } from 'lucide-react';
import { Container } from '../components/shared/Container';
import { SectionHeader } from '../components/shared/SectionHeader';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';

import evlabToolsData from '../data/evlab-tools.json';

export interface EvlabTool {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  field: string;
  status: 'live' | 'coming-soon';
  route: string;
  icon: string;
  accent: 'cyan' | 'warning' | 'blue' | 'purple' | 'emerald';
  tags: string[];
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets,
  PenTool,
  Code2,
  Box,
  Map,
  Calculator,
  Table2,
  GanttChartSquare,
};

// Static class maps so Tailwind's build-time scanner can find these utilities
// (dynamic template-literal class names are not detected by Tailwind).
const ACCENT_ICON_WRAP: Record<string, string> = {
  cyan: 'bg-[var(--accent-cyan-bg)] border-[var(--accent-cyan)]/30',
  warning: 'bg-[var(--accent-warning-bg)] border-[var(--accent-warning)]/30',
  blue: 'bg-[var(--accent-blue-bg)] border-[var(--accent-blue)]/30',
  purple: 'bg-[var(--accent-purple-bg)] border-[var(--accent-purple)]/30',
  emerald: 'bg-[var(--accent-emerald-bg)] border-[var(--accent-emerald)]/30',
};

const ACCENT_ICON_COLOR: Record<string, string> = {
  cyan: 'text-[var(--accent-cyan)]',
  warning: 'text-[var(--accent-warning)]',
  blue: 'text-[var(--accent-blue)]',
  purple: 'text-[var(--accent-purple)]',
  emerald: 'text-[var(--accent-emerald)]',
};

export interface SoftwarePageProps {
  onOpenTool?: (toolId: string, route: string) => void;
}

export const SoftwarePage: React.FC<SoftwarePageProps> = ({ onOpenTool }) => {
  const tools = Object.values(evlabToolsData) as EvlabTool[];

  return (
    <Container size="xl" className="py-12 space-y-10">
      <SectionHeader
        badge="Software"
        badgeVariant="blue"
        title="EVLab Software Directory"
        description="In-house engineering tools built and maintained inside the EVLab ecosystem — designed to eventually connect into a single unified BIM workspace."
        align="left"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = ICONS[tool.icon] || Sparkles;
          const isLive = tool.status === 'live';

          return (
            <Card
              key={tool.id}
              padding="lg"
              hoverable={isLive}
              className="flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border ${ACCENT_ICON_WRAP[tool.accent] || ACCENT_ICON_WRAP.blue}`}
                  >
                    <Icon className={`w-5 h-5 ${ACCENT_ICON_COLOR[tool.accent] || ACCENT_ICON_COLOR.blue}`} />
                  </div>
                  {isLive ? (
                    <Badge variant="emerald" size="sm">Live</Badge>
                  ) : (
                    <Badge variant="muted" size="sm" icon={<Clock className="w-3 h-3" />}>
                      Coming Soon
                    </Badge>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{tool.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{tool.tagline}</p>
                </div>

                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {tool.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                variant={isLive ? 'primary' : 'outline'}
                size="md"
                fullWidth
                disabled={!isLive}
                rightIcon={isLive ? <ArrowUpRight className="w-4 h-4" /> : undefined}
                onClick={() => isLive && onOpenTool?.(tool.id, tool.route)}
              >
                {isLive ? 'Open Tool' : 'In Development'}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-[var(--text-muted)] pt-4">
        More EVLab software tools will keep getting added here — eventually unifying into one connected BIM workspace.
      </div>
    </Container>
  );
};
