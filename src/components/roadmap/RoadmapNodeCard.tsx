import React from 'react';
import {
  Compass,
  GitBranch,
  Target,
  Layers,
  ArrowRight,
  Building2,
  Zap,
  Wrench,
  FlaskConical,
  Leaf,
  Factory,
  Cpu,
  Code2,
  Bot,
  Landmark,
  Sprout,
  Activity,
  Fuel,
  Ship,
  Rocket,
  Car,
  Sun,
  Atom,
  Radio,
  MapPin,
  Briefcase,
  Shirt,
  Boxes,
  Box,
  FileCode2,
} from 'lucide-react';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import type { RoadmapNode } from '@/types/roadmap';

export interface RoadmapNodeCardProps {
  node: RoadmapNode;
  onClick: () => void;
  selected?: boolean;
}

export const RoadmapNodeCard: React.FC<RoadmapNodeCardProps> = ({
  node,
  onClick,
  selected = false,
}) => {
  // Determine icon & badge styling based on kind
  const kind = node.kind || 'field';
  const childCount = node.children ? node.children.length : 0;

  const getKindBadge = () => {
    switch (kind) {
      case 'field':
        return <Badge variant="purple" size="sm" icon={<Compass className="w-3 h-3" />}>STEP 1 • FIELD</Badge>;
      case 'branch':
        return <Badge variant="blue" size="sm" icon={<GitBranch className="w-3 h-3" />}>STEP 2 • BRANCH</Badge>;
      case 'specialization':
        return <Badge variant="cyan" size="sm" icon={<Target className="w-3 h-3" />}>STEP 3 • SPECIALIZATION</Badge>;
      case 'area':
      default:
        return <Badge variant="emerald" size="sm" icon={<Layers className="w-3 h-3" />}>STEP 4 • FOCUS AREA</Badge>;
    }
  };

  const getKindIcon = () => {
    const id = node.id;
    if (id.includes('civil')) return <Building2 className="w-5 h-5 text-[var(--accent-purple)]" />;
    if (id.includes('electrical')) return <Zap className="w-5 h-5 text-[var(--accent-amber)]" />;
    if (id.includes('mechanical')) return <Wrench className="w-5 h-5 text-[var(--accent-blue)]" />;
    if (id.includes('chemical')) return <FlaskConical className="w-5 h-5 text-pink-400" />;
    if (id.includes('environmental')) return <Leaf className="w-5 h-5 text-emerald-400" />;
    if (id.includes('industrial')) return <Factory className="w-5 h-5 text-orange-400" />;
    if (id.includes('electronics')) return <Cpu className="w-5 h-5 text-sky-400" />;
    if (id.includes('computer')) return <Cpu className="w-5 h-5 text-indigo-400" />;
    if (id.includes('software')) return <Code2 className="w-5 h-5 text-emerald-400" />;
    if (id.includes('robotics')) return <Bot className="w-5 h-5 text-purple-400" />;
    if (id.includes('architecture')) return <Landmark className="w-5 h-5 text-amber-400" />;
    if (id.includes('agricultural')) return <Sprout className="w-5 h-5 text-lime-400" />;
    if (id.includes('biomedical')) return <Activity className="w-5 h-5 text-rose-400" />;
    if (id.includes('petroleum') || id.includes('mining')) return <Fuel className="w-5 h-5 text-yellow-500" />;
    if (id.includes('marine')) return <Ship className="w-5 h-5 text-cyan-400" />;
    if (id.includes('aerospace')) return <Rocket className="w-5 h-5 text-blue-400" />;
    if (id.includes('automotive')) return <Car className="w-5 h-5 text-red-400" />;
    if (id.includes('renewable')) return <Sun className="w-5 h-5 text-yellow-400" />;
    if (id.includes('materials') || id.includes('nuclear')) return <Atom className="w-5 h-5 text-violet-400" />;
    if (id.includes('telecommunications')) return <Radio className="w-5 h-5 text-teal-400" />;
    if (id.includes('surveying')) return <MapPin className="w-5 h-5 text-amber-500" />;
    if (id.includes('management')) return <Briefcase className="w-5 h-5 text-blue-300" />;
    if (id.includes('textile')) return <Shirt className="w-5 h-5 text-fuchsia-400" />;
    if (id.includes('other')) return <Boxes className="w-5 h-5 text-gray-400" />;

    switch (kind) {
      case 'field':
        return <Compass className="w-5 h-5 text-[var(--accent-purple)]" />;
      case 'branch':
        return <GitBranch className="w-5 h-5 text-[var(--accent-blue)]" />;
      case 'specialization':
        return <Target className="w-5 h-5 text-[var(--accent-cyan)]" />;
      case 'area':
      default:
        return <Layers className="w-5 h-5 text-[var(--accent-emerald)]" />;
    }
  };

  // Get child label
  const getChildLabel = () => {
    if (childCount === 0) {
      return node.comingSoon ? 'Taxonomy Active' : 'Focus Area Node';
    }
    switch (kind) {
      case 'field':
        return `${childCount} ${childCount === 1 ? 'Branch' : 'Branches'}`;
      case 'branch':
        return `${childCount} ${childCount === 1 ? 'Specialization' : 'Specializations'}`;
      case 'specialization':
        return `${childCount} ${childCount === 1 ? 'Focus Area' : 'Focus Areas'}`;
      default:
        return `${childCount} Sub-Nodes`;
    }
  };

  return (
    <Card
      variant="roadmap"
      hoverable
      padding="lg"
      onClick={onClick}
      className={`flex flex-col justify-between cursor-pointer group transition-all duration-200 border ${
        selected
          ? 'border-[var(--accent-purple)] bg-[var(--accent-purple-bg)]/20 ring-1 ring-[var(--accent-purple)]'
          : 'hover:border-[var(--accent-purple)]/60'
      }`}
    >
      <div className="space-y-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] group-hover:border-[var(--accent-purple)]/40 transition-colors">
            {getKindIcon()}
          </div>
          <div className="flex items-center space-x-2">
            {getKindBadge()}
          </div>
        </div>

        {/* Node Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-extrabold text-[var(--text-primary)] group-hover:text-[var(--accent-purple)] transition-colors line-clamp-1">
            {node.title}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            {node.summary || 'Engineering discipline path focusing on core technical knowledge, tools and standards.'}
          </p>
        </div>

        {/* Stats or Child Tags Preview if present */}
        {childCount > 0 && node.children && (
          <div className="pt-2 border-t border-[var(--border-color)]/60 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span className="uppercase tracking-wider">Sub-Paths Preview</span>
              <span className="text-[var(--accent-purple)] font-semibold">{getChildLabel()}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {node.children.slice(0, 3).map((child) => (
                <span
                  key={child.id}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] truncate max-w-[140px]"
                >
                  {child.title}
                </span>
              ))}
              {childCount > 3 && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)] font-mono">
                  +{childCount - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Relations counts preview if no children */}
        {childCount === 0 && node.relations && (
          <div className="pt-2 border-t border-[var(--border-color)]/60 flex flex-wrap gap-2 text-[10px] font-mono text-[var(--text-muted)]">
            {node.relations.software && node.relations.software.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-elevated)]">
                <Cpu className="w-3 h-3 text-[var(--accent-cyan)]" />
                {node.relations.software.length} Software
              </span>
            )}
            {node.relations.knowledge && node.relations.knowledge.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-elevated)]">
                <FileCode2 className="w-3 h-3 text-[var(--accent-purple)]" />
                {node.relations.knowledge.length} Knowledge
              </span>
            )}
            {node.ueleLink && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--accent-emerald-bg)] text-[var(--accent-emerald)] font-semibold">
                <Box className="w-3 h-3" />
                3D UELE Object
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom CTA Indicator */}
      <div className="pt-4 mt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-semibold text-[var(--accent-purple)] group-hover:translate-x-1 transition-transform">
        <span>{childCount > 0 ? `Explore ${kind === 'field' ? 'Branches' : kind === 'branch' ? 'Specializations' : 'Focus Areas'}` : 'View Focus Details'}</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </Card>
  );
};
