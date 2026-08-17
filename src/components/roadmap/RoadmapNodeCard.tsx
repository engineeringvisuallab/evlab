import React, { useState, useMemo } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { Badge } from '../shared/Badge';
import { RoadmapNode } from '../../types/roadmap';
import { ExpandableSoftwareItem } from './ExpandableSoftwareItem';

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
  const [isHovered, setIsHovered] = useState(false);

  // Determine icon & badge styling based on kind
  const kind = node.kind || 'field';
  const childCount = node.children ? node.children.length : 0;

  // Collect associated software from relations or recursively from child nodes
  const softwareList = useMemo(() => {
    const list = new Set<string>();
    if (node.relations?.software) {
      node.relations.software.forEach((s) => list.add(s));
    }
    // If field or branch, find top software from descendants
    if (node.children) {
      node.children.forEach((child) => {
        if (child.relations?.software) {
          child.relations.software.forEach((s) => list.add(s));
        }
        if (child.children) {
          child.children.forEach((grandChild) => {
            if (grandChild.relations?.software) {
              grandChild.relations.software.forEach((s) => list.add(s));
            }
          });
        }
      });
    }
    return Array.from(list);
  }, [node]);

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
    const id = node.id.toLowerCase();
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

  const getChildLabel = () => {
    if (childCount === 0) {
      return node.comingSoon ? 'Active' : 'Focus Area';
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
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative rounded-2xl bg-[var(--bg-surface)] border transition-all duration-300 cursor-pointer overflow-hidden group select-none ${
        selected
          ? 'border-[var(--accent-purple)] bg-[var(--accent-purple-bg)]/20 ring-1 ring-[var(--accent-purple)] shadow-lg shadow-purple-500/10'
          : isHovered
          ? 'border-[var(--accent-purple)] shadow-xl shadow-purple-500/15 -translate-y-1 bg-[var(--bg-elevated)]'
          : 'border-[var(--border-color)] hover:border-[var(--accent-purple)]/50'
      }`}
    >
      {/* Top Accent Line on hover */}
      <div
        className={`h-1 w-full transition-all duration-300 ${
          isHovered || selected
            ? 'bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-purple)] to-[var(--accent-emerald)]'
            : 'bg-transparent'
        }`}
      />

      <div className={`transition-all duration-300 ${isHovered || selected ? 'p-4 sm:p-5 space-y-3' : 'p-3.5 sm:p-4'}`}>
        {/* Main Title - ONLY thing visible in collapsed state */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-purple)] transition-colors leading-snug">
            {node.title}
          </h3>
          <ArrowRight
            className={`w-3.5 h-3.5 text-[var(--accent-purple)] transition-all duration-300 ${
              isHovered ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0'
            }`}
          />
        </div>

        {/* EXPANDABLE COLLAPSIBLE SECTION ON HOVER (Smooth Height & Opacity Transition) */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isHovered || selected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
          }`}
        >
          <div className="overflow-hidden space-y-3 pt-2 border-t border-[var(--border-color)]/70">
            {/* Header Row: Icon + Badge + Child Count Pill */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-[var(--accent-purple-bg)] border border-[var(--accent-purple)]/30">
                  {getKindIcon()}
                </div>
                {getKindBadge()}
              </div>

              {childCount > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--accent-purple)] font-semibold shrink-0">
                  {getChildLabel()}
                </span>
              )}
            </div>

            {/* Full Summary Description */}
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {node.summary || 'Engineering discipline path focusing on core technical knowledge, tools and standards.'}
            </p>

            {/* Software Tools (Compact hover-expandable chips) */}
            {softwareList.length > 0 && (
              <div className="pt-2 border-t border-[var(--border-color)]/70 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span className="uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5 text-[var(--accent-cyan)]" />
                    Key Software & Tools
                  </span>
                  <span className="text-[var(--accent-cyan)] font-semibold">{softwareList.length} Tools</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {softwareList.slice(0, 4).map((softId) => (
                    <ExpandableSoftwareItem key={softId} softwareId={softId} />
                  ))}
                  {softwareList.length > 4 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[var(--bg-surface)] text-[var(--accent-cyan)] font-mono self-center">
                      +{softwareList.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Sub-paths Preview (Stage 2 branches / specializations) */}
            {childCount > 0 && node.children && (
              <div className="pt-2 border-t border-[var(--border-color)]/70 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span className="uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[var(--accent-purple)]" />
                    Stage 2 Sub-Branches
                  </span>
                  <span className="text-[var(--accent-purple)] font-semibold">{getChildLabel()}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {node.children.slice(0, 5).map((child) => (
                    <span
                      key={child.id}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] truncate max-w-[140px] hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)] transition-colors"
                    >
                      {child.title}
                    </span>
                  ))}
                  {childCount > 5 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[var(--bg-surface)] text-[var(--accent-purple)] font-mono font-medium self-center">
                      +{childCount - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Relations counts preview if terminal node */}
            {childCount === 0 && node.relations && (
              <div className="pt-2 border-t border-[var(--border-color)]/70 flex flex-wrap gap-2 text-[10px] font-mono text-[var(--text-muted)]">
                {node.relations.knowledge && node.relations.knowledge.length > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
                    <FileCode2 className="w-3 h-3 text-[var(--accent-purple)]" />
                    {node.relations.knowledge.length} Knowledge
                  </span>
                )}
                {node.ueleLink && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--accent-emerald-bg)] text-[var(--accent-emerald)] font-semibold border border-[var(--accent-emerald)]/30">
                    <Box className="w-3 h-3" />
                    3D UELE
                  </span>
                )}
              </div>
            )}

            {/* Action CTA Button */}
            <div className="pt-2.5 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[var(--accent-purple)]">
              <span>
                {childCount > 0
                  ? `Explore ${kind === 'field' ? 'Branches' : kind === 'branch' ? 'Specializations' : 'Focus Areas'}`
                  : 'View Focus Details'}
              </span>
              <div className="flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

