import React from 'react';
import {
  Compass,
  Layers,
  Cpu,
  BookOpen,
  ShieldCheck,
  FolderGit2,
  Briefcase,
  Box,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { RoadmapNode } from '../../types/roadmap';
import { ExpandableSoftwareItem } from './ExpandableSoftwareItem';

export interface RoadmapDetailCardProps {
  node: RoadmapNode;
  parentPath: {
    field?: RoadmapNode;
    branch?: RoadmapNode;
    specialization?: RoadmapNode;
  };
  onBack: () => void;
  onNavigateToUele?: (ueleId: string) => void;
}

export const RoadmapDetailCard: React.FC<RoadmapDetailCardProps> = ({
  node,
  parentPath,
  onBack,
  onNavigateToUele,
}) => {
  const rel = node.relations || {};

  return (
    <div className="space-y-6">
      {/* Detail Card Container */}
      <Card variant="roadmap" padding="lg" className="space-y-6 border-[var(--accent-purple)]/40 shadow-xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple" icon={<Layers className="w-3.5 h-3.5" />}>
                STEP 4 • FOCUS AREA REACHED
              </Badge>
              <span className="text-xs font-mono text-[var(--text-muted)]">Node ID: {node.id}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              {node.title}
            </h2>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
              {node.summary || 'Selected engineering technical area within this discipline.'}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={onBack}
            className="shrink-0 self-start sm:self-center"
          >
            Back to Specializations
          </Button>
        </div>

        {/* Selected Hierarchy Breadcrumbs Context */}
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Full Pathway Hierarchy
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--text-primary)]">
            {parentPath.field && (
              <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-purple-bg)] text-[var(--accent-purple)] font-semibold">
                {parentPath.field.title}
              </span>
            )}
            {parentPath.branch && (
              <>
                <span className="text-[var(--text-muted)]">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-blue-bg)] text-[var(--accent-blue)] font-semibold">
                  {parentPath.branch.title}
                </span>
              </>
            )}
            {parentPath.specialization && (
              <>
                <span className="text-[var(--text-muted)]">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] font-semibold">
                  {parentPath.specialization.title}
                </span>
              </>
            )}
            <span className="text-[var(--text-muted)]">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-emerald-bg)] text-[var(--accent-emerald)] font-bold">
              {node.title}
            </span>
          </div>
        </div>

        {/* Connected Software Tools Section (Interactive Hover-Expandable) */}
        {rel.software && rel.software.length > 0 && (
          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[var(--accent-cyan)]" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Connected Software Tools
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {rel.software.length} Software • Hover name to inspect
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {rel.software.map((softId) => (
                <ExpandableSoftwareItem key={softId} softwareId={softId} />
              ))}
            </div>
          </div>
        )}

        {/* Relations & Connections Preview Bar */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono uppercase tracking-wider">
            Connected Ecosystem Assets
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center space-x-1.5 text-[var(--accent-cyan)]">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-bold">Software</span>
              </div>
              <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                {rel.software ? rel.software.length : 0}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">CAD, Sim & GIS</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center space-x-1.5 text-[var(--accent-purple)]">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-bold">Knowledge</span>
              </div>
              <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                {rel.knowledge ? rel.knowledge.length : 0}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">Theory & Principles</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center space-x-1.5 text-[var(--accent-amber)]">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold">Standards</span>
              </div>
              <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                {rel.standards ? rel.standards.length : 0}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">AWWA, ISO, Codes</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center space-x-1.5 text-[var(--accent-blue)]">
                <FolderGit2 className="w-4 h-4" />
                <span className="text-xs font-bold">Projects</span>
              </div>
              <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                {rel.projects ? rel.projects.length : 0}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">Real Case Studies</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center space-x-1.5 text-[var(--accent-emerald)]">
                <Briefcase className="w-4 h-4" />
                <span className="text-xs font-bold">Roles</span>
              </div>
              <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                {rel.careerRoles ? rel.careerRoles.length : 0}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">Career Targets</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <Box className="w-4 h-4" />
                <span className="text-xs font-bold">UELE 3D</span>
              </div>
              <p className="text-xs font-mono text-[var(--text-primary)] mt-1 font-bold truncate">
                {node.ueleLink ? 'Available' : 'N/A'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">3D Environment</p>
            </div>
          </div>
        </div>

        {/* UELE Connection Link if present */}
        {node.ueleLink && (
          <div className="p-4 rounded-2xl bg-[var(--accent-emerald-bg)]/40 border border-[var(--accent-emerald)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[var(--accent-emerald)] text-white">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--text-primary)]">
                  Connected 3D UELE Object Available
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Explore the 3D model for <strong>{node.title}</strong> in the Ultimate Engineering Learning Ecosystem.
                </p>
              </div>
            </div>
            {onNavigateToUele && (
              <Button
                variant="uele"
                size="sm"
                rightIcon={<Box className="w-4 h-4" />}
                onClick={() => onNavigateToUele(node.ueleLink!)}
                className="shrink-0"
              >
                Inspect in UELE 3D
              </Button>
            )}
          </div>
        )}

        {/* Clean Stage 05 Gate Callout */}
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--accent-purple)]/50 space-y-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-purple)]" />
            <h4 className="font-bold text-sm text-[var(--text-primary)]">
              Stage 05 Deep Career Mastery Gateway
            </h4>
            <Badge variant="purple" size="sm">STAGE 05 PREVIEW</Badge>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            You have successfully reached Step 4 of the Career Roadmap Engine! In <strong>Stage 05 (Deep Career Mastery)</strong>, selecting this focus area will unlock dedicated deep-dive tabs for <em>Overview, Knowledge Matrix, Software Tools, Industry Standards, Real Projects, Practice Exercises, and Job Market Analytics</em>.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-purple)]" /> Step 1 Field
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-purple)]" /> Step 2 Branch
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-purple)]" /> Step 3 Specialization
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-purple)]" /> Step 4 Focus Area
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

