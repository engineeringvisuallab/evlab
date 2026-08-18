import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Layers,
  Cpu,
  ShieldCheck,
  Briefcase,
  Box,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Award,
  Clock,
  Compass,
  FileSpreadsheet,
  FolderGit2,
  TrendingUp,
  FileText,
  Workflow,
  Target,
  ExternalLink,
  ChevronRight,
  Printer,
  Copy,
  Check,
  HelpCircle,
  BarChart3,
  Calendar,
  Building,
} from 'lucide-react';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { RoadmapNode } from '../../types/roadmap';
import { Stage05MasteryRecord } from '../../types/stage05';
import { getStage05MasteryRecord } from '../../services/stage05Service';
import { ExpandableSoftwareItem } from './ExpandableSoftwareItem';

export interface Stage05DeepMasteryProps {
  node: RoadmapNode;
  parentPath: {
    field?: RoadmapNode;
    branch?: RoadmapNode;
    specialization?: RoadmapNode;
  };
  onBack: () => void;
  onNavigateToUele?: (ueleId: string) => void;
}

type TabKey = 'overview' | 'knowledge' | 'tools' | 'practical' | 'careers' | 'readiness';

export const Stage05DeepMastery: React.FC<Stage05DeepMasteryProps> = ({
  node,
  parentPath,
  onBack,
  onNavigateToUele,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [copiedSyllabus, setCopiedSyllabus] = useState(false);

  // Load dynamically generated & resolved Stage-05 Record
  const record: Stage05MasteryRecord = useMemo(() => {
    return getStage05MasteryRecord(node, parentPath);
  }, [node, parentPath]);

  // Interactive Checklist State (persisted to localStorage per node ID)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`evlab_readiness_${node.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleCheckItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(`evlab_readiness_${node.id}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Readiness Calculation
  const totalReadinessItems = record.careerReadyChecklist.length;
  const completedReadinessItems = record.careerReadyChecklist.filter((i) => checkedItems[i.id]).length;
  const readinessPercent = Math.round((completedReadinessItems / (totalReadinessItems || 1)) * 100);

  // Copy Syllabus to Clipboard
  const handleCopySyllabus = () => {
    const text = `EVLab Engineering Mastery Syllabus: ${record.title} (${record.fieldTitle} > ${record.branchTitle} > ${record.specializationTitle})\n\n` +
      `OVERVIEW:\n${record.overview.whatItIs}\n\n` +
      `KEY SOFTWARE: ${record.software.map((s) => s.name).join(', ')}\n` +
      `GOVERNING STANDARDS: ${record.standards.map((s) => s.code).join(', ')}\n` +
      `TARGET CAREER ROLES: ${record.careerRoles.map((r) => r.title).join(', ')}\n\n` +
      `CAREER MASTERY TIMELINE:\n` +
      record.timeline.map((t) => `Phase ${t.phase} (${t.duration}): ${t.name} - ${t.focus}`).join('\n') +
      `\n\nGenerated from EVLab Engineering Career Roadmap.`;

    navigator.clipboard.writeText(text);
    setCopiedSyllabus(true);
    setTimeout(() => setCopiedSyllabus(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <Card variant="roadmap" padding="lg" className="space-y-6 border-[var(--accent-purple)]/50 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Accent Light */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-blue)] to-[var(--accent-emerald)]" />

        {/* Master Navigation & Node Identification */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6 pt-2">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple" icon={<Sparkles className="w-3.5 h-3.5" />}>
                STAGE 05 • DEEP CAREER MASTERY
              </Badge>
              <span className="text-xs font-mono text-[var(--text-muted)]">ID: {record.focusAreaId}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--accent-purple-bg)] text-[var(--accent-purple)] font-semibold">
                {record.fieldTitle}
              </span>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--accent-emerald-bg)] text-[var(--accent-emerald)] font-semibold"
                title={record.globalRelevance.note}
              >
                Global Relevance: {record.globalRelevance.score}% ({record.globalRelevance.tier})
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {record.title}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-4xl">
              {record.overview.whatItIs}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
            <Button
              variant="outline"
              size="sm"
              leftIcon={copiedSyllabus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopySyllabus}
            >
              {copiedSyllabus ? 'Syllabus Copied' : 'Export Syllabus'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={onBack}
            >
              Back to Roadmap
            </Button>
          </div>
        </div>

        {/* Full Pathway Breadcrumb Bar */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2 text-[var(--text-primary)]">
            <span className="text-[var(--text-muted)] uppercase text-[10px] tracking-wider">Pathway:</span>
            <span className="px-2 py-0.5 rounded bg-[var(--accent-purple-bg)] text-[var(--accent-purple)] font-semibold">
              {record.fieldTitle}
            </span>
            <span className="text-[var(--text-muted)]">→</span>
            <span className="px-2 py-0.5 rounded bg-[var(--accent-blue-bg)] text-[var(--accent-blue)] font-semibold">
              {record.branchTitle}
            </span>
            <span className="text-[var(--text-muted)]">→</span>
            <span className="px-2 py-0.5 rounded bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] font-semibold">
              {record.specializationTitle}
            </span>
            <span className="text-[var(--text-muted)]">→</span>
            <span className="px-2 py-0.5 rounded bg-[var(--accent-emerald-bg)] text-[var(--accent-emerald)] font-bold">
              {record.title}
            </span>
          </div>

          {/* Live Career-Readiness Micro Indicator */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] text-[var(--text-muted)]">Career Readiness:</span>
            <div className="w-24 h-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-emerald)] transition-all duration-500"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
            <span className="font-bold text-xs font-mono text-[var(--accent-emerald)]">{readinessPercent}%</span>
          </div>
        </div>

        {/* Content Disclaimer Banner — always visible, never buried in a tab */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-amber-500">Auto-generated study guide:</strong> {record.contentDisclaimer}
          </p>
        </div>

        {/* Master Tab Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-color)] custom-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-[var(--accent-purple)] text-white shadow-lg shadow-purple-500/20 font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Overview & Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'knowledge'
                ? 'bg-[var(--accent-purple)] text-white shadow-lg shadow-purple-500/20 font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>2. Knowledge & Calculations</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'tools'
                ? 'bg-[var(--accent-purple)] text-white shadow-lg shadow-purple-500/20 font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>3. Software, Codes & Workflow</span>
          </button>

          <button
            onClick={() => setActiveTab('practical')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'practical'
                ? 'bg-[var(--accent-purple)] text-white shadow-lg shadow-purple-500/20 font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>4. Practical Tasks & Deliverables</span>
          </button>

          <button
            onClick={() => setActiveTab('careers')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'careers'
                ? 'bg-[var(--accent-purple)] text-white shadow-lg shadow-purple-500/20 font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>5. Industry, Roles & Market</span>
          </button>

          <button
            onClick={() => setActiveTab('readiness')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'readiness'
                ? 'bg-[var(--accent-purple)] text-white shadow-lg shadow-purple-500/20 font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>6. QA/QC & Career Cockpit</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {readinessPercent}%
            </span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & TIMELINE */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Section 1: Deep Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center space-x-2 text-[var(--accent-purple)]">
                  <Target className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Why It Matters in Engineering
                  </h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {record.overview.whyItMatters}
                </p>
                <div className="pt-2 border-t border-[var(--border-color)]">
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    <strong>Project Context:</strong> {record.overview.projectContext}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center space-x-2 text-[var(--accent-blue)]">
                  <Layers className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Where It Fits & Professional Value
                  </h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {record.overview.whereItFits}
                </p>
                <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">Related Disciplines:</span>
                  {record.overview.relatedDisciplines.map((d) => (
                    <span key={d} className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] text-[10px] font-mono text-[var(--text-primary)]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Prerequisites */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-cyan)]">
                  <Compass className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 2 • Required Engineering Prerequisites
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">Foundational Baseline</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-purple)]">Math & Physics</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.prerequisites.mathScience.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-blue)]">Core Mechanics</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.prerequisites.coreMechanics.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-cyan)]">Coding & Tools</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.prerequisites.codingAndSoftware.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-emerald)]">Prior Domain Steps</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.prerequisites.priorTopics.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3: Learning Objectives */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center space-x-2 text-[var(--accent-purple)]">
                <Award className="w-4 h-4" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Section 3 • Core Learning Objectives & Capability Targets
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {record.learningObjectives.map((obj, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-[var(--accent-purple-bg)] text-[var(--accent-purple)] flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                      {obj}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 22: Career Mastery Timeline (24 Weeks) */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-emerald)]">
                  <Calendar className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 22 • 24-Week Career Mastery Roadmap Timeline
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--accent-emerald)] font-bold">From Theory to Career Ready</span>
              </div>

              <div className="space-y-4">
                {record.timeline.map((phase) => (
                  <div key={phase.phase} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-[var(--accent-purple-bg)] text-[var(--accent-purple)] text-xs font-mono font-bold">
                          Phase 0{phase.phase}
                        </span>
                        <h4 className="font-bold text-sm text-[var(--text-primary)]">{phase.name}</h4>
                      </div>
                      <span className="text-xs font-mono text-[var(--accent-cyan)]">{phase.duration}</span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      <strong>Focus:</strong> {phase.focus}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs font-mono">
                      <span className="text-[var(--accent-emerald)]">
                        <strong>Milestone:</strong> {phase.milestone}
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {phase.deliverables.join(' • ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 21: UELE Connection */}
            {record.ueleConnection.isAvailable && (
              <div className="p-5 rounded-2xl bg-[var(--accent-emerald-bg)]/30 border border-[var(--accent-emerald)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-[var(--accent-emerald)] text-white shrink-0">
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">
                      Section 21 • Connected 3D Digital Twin Available in UELE
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {record.ueleConnection.what}
                    </p>
                  </div>
                </div>
                {onNavigateToUele && (
                  <Button
                    variant="uele"
                    size="sm"
                    rightIcon={<Box className="w-4 h-4" />}
                    onClick={() => onNavigateToUele(record.ueleConnection.objectId!)}
                    className="shrink-0"
                  >
                    Inspect 3D Geometry
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KNOWLEDGE & CALCULATIONS */}
        {activeTab === 'knowledge' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Section 4: Knowledge Matrix */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-purple)]">
                  <BookOpen className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 4 • Multi-Tier Knowledge Matrix
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">Theory to Application</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-purple)]">1. Foundation Theory</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.knowledgeMatrix.foundation.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-blue)]">2. Core Engineering</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.knowledgeMatrix.coreEngineering.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-cyan)]">3. Applied Concepts</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.knowledgeMatrix.appliedConcepts.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-amber)]">4. Advanced Concepts</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.knowledgeMatrix.advancedConcepts.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-emerald)]">5. Calculation Theory</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.knowledgeMatrix.calculationsTheory.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-rose-400">6. Design Codes & Limits</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.knowledgeMatrix.designCodes.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 6: Calculation Competencies & Governing Equations */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-cyan)]">
                  <Workflow className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 6 • Calculation Competencies & Governing Physics Equations
                  </h3>
                </div>
                <Badge variant="purple" size="sm">First-Principles Verification</Badge>
              </div>

              {/* Equations Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Primary Governing Design Equations
                </h4>
                <div className="space-y-3">
                  {record.calculationCompetencies.governingEquations.map((eq, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[var(--accent-cyan)]">{eq.name}</span>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)]">
                          <span>Variables:</span>
                          <span className="text-[var(--text-primary)]">{eq.variables.join(', ')}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[var(--bg-elevated)] font-mono text-xs sm:text-sm text-[var(--accent-emerald)] font-bold overflow-x-auto">
                        {eq.formula}
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {eq.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Variables Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Critical Input Variables & Physical Units
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[var(--border-color)] rounded-xl overflow-hidden">
                    <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] font-mono uppercase">
                      <tr>
                        <th className="p-2.5 border-b border-[var(--border-color)]">Parameter Name</th>
                        <th className="p-2.5 border-b border-[var(--border-color)]">Symbol</th>
                        <th className="p-2.5 border-b border-[var(--border-color)]">Standard Units</th>
                        <th className="p-2.5 border-b border-[var(--border-color)]">Engineering Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {record.calculationCompetencies.inputVariables.map((v, i) => (
                        <tr key={i} className="hover:bg-[var(--bg-surface)] transition-colors">
                          <td className="p-2.5 font-semibold text-[var(--text-primary)]">{v.name}</td>
                          <td className="p-2.5 font-mono text-[var(--accent-purple)] font-bold">{v.symbol}</td>
                          <td className="p-2.5 font-mono text-[var(--accent-cyan)]">{v.unit}</td>
                          <td className="p-2.5 text-[var(--text-secondary)]">{v.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assumptions & Validation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h5 className="font-bold text-xs text-[var(--accent-amber)] font-mono uppercase">
                    Boundary Assumptions
                  </h5>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.calculationCompetencies.assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h5 className="font-bold text-xs text-[var(--accent-emerald)] font-mono uppercase">
                    Validation & Hand-Check Methods
                  </h5>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.calculationCompetencies.validationMethods.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 5: Skills Matrix */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center space-x-2 text-[var(--accent-emerald)]">
                <TrendingUp className="w-4 h-4" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Section 5 • Skills Progression Matrix
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[var(--text-primary)]">Beginner</h4>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Entry</span>
                  </div>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.skillsMatrix.beginner.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[var(--accent-blue)]">Intermediate</h4>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Mid-Level</span>
                  </div>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.skillsMatrix.intermediate.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[var(--accent-purple)]">Advanced</h4>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Senior</span>
                  </div>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.skillsMatrix.advanced.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[var(--accent-emerald)]">Professional</h4>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Lead / PE</span>
                  </div>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.skillsMatrix.professional.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 26: Advanced Topics */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center space-x-2 text-[var(--accent-purple)]">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Section 26 • Emerging Frontiers, AI & Digital Twins
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {record.advancedTopics.map((top, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                    <h4 className="font-bold text-xs text-[var(--accent-purple)]">{top.topic}</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{top.description}</p>
                    <div className="pt-2 border-t border-[var(--border-color)] text-[11px] font-mono text-[var(--accent-emerald)]">
                      Impact: {top.industryImpact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SOFTWARE, CODES & WORKFLOW */}
        {activeTab === 'tools' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Section 7: Software Tools */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-cyan)]">
                  <Cpu className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 7 • Industry Software Stack & Computational Tools
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {record.software.length} Integrated Tools
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {record.software.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-4 h-4 text-[var(--accent-cyan)]" />
                        <h4 className="font-bold text-sm text-[var(--text-primary)]">{s.name}</h4>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] font-semibold">
                        {s.category || 'Software'}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {s.purpose}
                    </p>

                    <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-[var(--border-color)]">
                      <p className="text-[var(--text-muted)]">
                        <strong className="text-[var(--text-primary)]">Workflow Role:</strong> {s.primaryWorkflow}
                      </p>
                      <p className="text-[var(--accent-emerald)]">
                        <strong>Expected Output:</strong> {s.output}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 8: Standards & Codes */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-amber)]">
                  <ShieldCheck className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 8 • Governing Standards & Regulatory Codes
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">Enforced Compliance</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {record.standards.map((std) => (
                  <div key={std.id} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-amber-bg)] text-[var(--accent-amber)] font-mono font-bold text-xs">
                        {std.code}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">{std.organization}</span>
                    </div>

                    <h4 className="font-bold text-sm text-[var(--text-primary)]">{std.name}</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{std.purpose}</p>

                    <div className="pt-2 border-t border-[var(--border-color)] text-[11px] font-mono text-[var(--text-muted)]">
                      <strong>Scope:</strong> {std.scope}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 9: 8-Stage Professional Workflow */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-purple)]">
                  <Workflow className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 9 • Standard 8-Stage Professional Engineering Workflow
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">Inception to IFC</span>
              </div>

              {record.workflows.map((wf) => (
                <div key={wf.id} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {wf.steps.map((step) => (
                      <div key={step.stepNumber} className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-full bg-[var(--accent-purple-bg)] text-[var(--accent-purple)] flex items-center justify-center text-xs font-mono font-bold">
                            {step.stepNumber}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">Stage 0{step.stepNumber}</span>
                        </div>

                        <h5 className="font-bold text-xs text-[var(--text-primary)]">{step.name}</h5>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                          {step.description}
                        </p>

                        {step.deliverable && (
                          <div className="pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-[var(--accent-emerald)]">
                            Output: {step.deliverable}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Section 18 & 19: Plugins, Drawings & Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center space-x-2 text-[var(--accent-cyan)]">
                  <FileSpreadsheet className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 19 • Standard Drawings & Calc Templates
                  </h3>
                </div>

                <div className="space-y-2">
                  {record.drawingsAndTemplates.map((t, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[var(--text-primary)]">{t.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)]">
                          {t.format}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center space-x-2 text-[var(--accent-purple)]">
                  <Cpu className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 18 • Plugins & Scripting Add-ons
                  </h3>
                </div>

                {record.plugins.length === 0 ? (
                  <div className="p-6 text-center bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-muted)] font-mono">
                    Specialized plugins registered in ecosystem. Custom Dynamo / Python API scripts applicable.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {record.plugins.map((p, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[var(--text-primary)]">{p.name}</span>
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">
                            {p.hostSoftware?.join(', ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)]">{p.purpose}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRACTICAL WORK & DELIVERABLES */}
        {activeTab === 'practical' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Section 10: Practical Hands-On Tasks */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-blue)]">
                  <FolderGit2 className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 10 • Practical Hands-On Engineering Tasks
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">Lab & Studio Exercises</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {record.practicalWork.map((task, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        task.difficulty === 'Beginner'
                          ? 'bg-blue-500/20 text-blue-400'
                          : task.difficulty === 'Intermediate'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {task.difficulty}
                      </span>
                      <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {task.duration}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[var(--text-primary)]">{task.task}</h4>

                    <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)] text-xs font-mono">
                      <p className="text-[var(--accent-cyan)]">
                        <strong>Required Tools:</strong> {task.tools.join(', ')}
                      </p>
                      <p className="text-[var(--accent-emerald)]">
                        <strong>Expected Output:</strong> {task.output}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 11: Engineering Deliverables */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-purple)]">
                  <FileText className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 11 • Production Engineering Deliverables & Work Products
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">Standard Industry Submittals</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {record.deliverables.map((del, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-purple-bg)] text-[var(--accent-purple)] font-semibold">
                        {del.category}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">{del.format}</span>
                    </div>

                    <h4 className="font-bold text-xs text-[var(--text-primary)]">{del.item}</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{del.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 14: Portfolio Flagship Projects */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-emerald)]">
                  <Award className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 14 • Flagship Portfolio Projects for Technical Hiring
                  </h3>
                </div>
                <Badge variant="emerald" size="sm">Resume & Interview Proof</Badge>
              </div>

              <div className="space-y-4">
                {record.portfolioProjects.map((p, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
                      <h4 className="font-bold text-base text-[var(--text-primary)]">{p.title}</h4>
                      <span className="text-xs font-mono text-[var(--accent-emerald)] font-bold">Flagship Project 0{idx + 1}</span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      <strong>Objective:</strong> {p.objective}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
                      <div className="p-3 rounded-lg bg-[var(--bg-elevated)] space-y-1">
                        <span className="text-[var(--accent-cyan)] font-bold">Tools & Inputs:</span>
                        <p className="text-[var(--text-muted)]">{p.tools.join(', ')}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-[var(--bg-elevated)] space-y-1">
                        <span className="text-[var(--accent-emerald)] font-bold">Validation Standard:</span>
                        <p className="text-[var(--text-muted)]">{p.validation}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--accent-purple-bg)]/30 border border-[var(--accent-purple)]/30 space-y-1 text-xs">
                      <span className="font-bold text-[var(--accent-purple)] font-mono">Interview Pitch & Defense:</span>
                      <p className="text-[var(--text-secondary)] italic leading-relaxed">"{p.interviewPitch}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 13: Practice Exercises */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center space-x-2 text-[var(--accent-cyan)]">
                <Compass className="w-4 h-4" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Section 13 • Progressive Practice Problem Sets
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--text-primary)]">Level 1: Beginner</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.practiceExercises.beginner.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-blue)]">Level 2: Intermediate</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.practiceExercises.intermediate.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-purple)]">Level 3: Advanced</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.practiceExercises.advanced.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-emerald)]">Level 4: Professional</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.practiceExercises.professional.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CAREERS, ROLES & INDUSTRY */}
        {activeTab === 'careers' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Section 15: Target Career Roles */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-emerald)]">
                  <Briefcase className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 15 • Target Job Roles & Industry Positions
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">Reference Roles</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {record.careerRoles.map((role, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-[var(--text-primary)]">{role.title}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400">
                        {role.demand} Demand
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
                      <span>Experience: {role.experienceLevel}</span>
                      <span className="flex items-center gap-1.5" title={role.globalRelevance.note}>
                        <span className="w-12 h-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden">
                          <span
                            className="block h-full bg-[var(--accent-emerald)]"
                            style={{ width: `${role.globalRelevance.score}%` }}
                          />
                        </span>
                        <span className="text-[var(--accent-emerald)] font-bold">{role.globalRelevance.score}%</span>
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-color)] space-y-1">
                      <p className="text-xs font-mono text-[var(--text-muted)] uppercase">Key Responsibilities:</p>
                      <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                        {role.responsibilities.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 23: Job Market Analytics */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-cyan)]">
                  <BarChart3 className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 23 • Job Market Intelligence & Hiring Sectors
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--accent-emerald)] font-bold">
                  Global Relevance: {record.jobMarket.marketDemand} ({record.jobMarket.globalRelevance.score}%)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-purple)] font-mono uppercase">Top Hiring Sectors</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.jobMarket.topHiringSectors.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-blue)] font-mono uppercase">Target Industries</h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                    {record.jobMarket.targetIndustries.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                  <h4 className="font-bold text-xs text-[var(--accent-emerald)] font-mono uppercase">Global Relevance & Seniority</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--accent-emerald)] to-[var(--accent-cyan)]"
                        style={{ width: `${record.jobMarket.globalRelevance.score}%` }}
                      />
                    </div>
                    <span className="font-bold text-xs font-mono text-[var(--accent-emerald)]">
                      {record.jobMarket.globalRelevance.score}%
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{record.jobMarket.globalRelevance.note}</p>
                  <p className="text-xs text-[var(--text-muted)] font-mono pt-1">
                    <strong>Track:</strong> {record.jobMarket.seniorityRange}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 16 & 17: Organizations & Learning Resources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center space-x-2 text-[var(--accent-purple)]">
                  <Building className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 16 • Industry Organizations & Certifications
                  </h3>
                </div>

                <div className="space-y-2">
                  {record.organizations.map((org, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[var(--text-primary)]">{org.name}</span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">{org.type}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{org.role}</p>
                      {org.certifications && (
                        <p className="text-[10px] font-mono text-[var(--accent-purple)] pt-1">
                          Certifications: {org.certifications}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center space-x-2 text-[var(--accent-cyan)]">
                  <BookOpen className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 20 • Authoritative References & Textbooks
                  </h3>
                </div>

                <div className="space-y-2">
                  {record.resources.map((res, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                      <span className="font-bold text-xs text-[var(--text-primary)]">{res.title}</span>
                      <p className="text-xs text-[var(--text-secondary)]">{res.description}</p>
                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[var(--text-muted)]">
                        <span>Type: {res.type}</span>
                        <span>{res.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: QA/QC & CAREER COCKPIT */}
        {activeTab === 'readiness' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Section 27: Interactive Career-Ready Self-Assessment */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--accent-purple)] space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-[var(--accent-purple)]">
                    <Award className="w-5 h-5" />
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                      Section 27 • Career-Ready Self-Assessment Cockpit
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Check off each competency as you achieve verifiable mastery. Progress is saved automatically.
                  </p>
                </div>

                <div className="flex items-center space-x-3 bg-[var(--bg-surface)] px-4 py-2 rounded-xl border border-[var(--border-color)] shrink-0">
                  <span className="text-xs font-mono text-[var(--text-muted)]">Readiness:</span>
                  <span className="text-lg font-mono font-black text-[var(--accent-emerald)]">{readinessPercent}%</span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">({completedReadinessItems}/{totalReadinessItems})</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-blue)] to-[var(--accent-emerald)] transition-all duration-500"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>

              {/* Checkbox List */}
              <div className="space-y-3 pt-2">
                {record.careerReadyChecklist.map((item) => {
                  const isDone = Boolean(checkedItems[item.id]);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheckItem(item.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 select-none ${
                        isDone
                          ? 'bg-[var(--accent-emerald-bg)]/30 border-[var(--accent-emerald)]/60 text-[var(--text-primary)]'
                          : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:border-[var(--accent-purple)]/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isDone
                          ? 'bg-[var(--accent-emerald)] border-[var(--accent-emerald)] text-white'
                          : 'border-[var(--border-color)] bg-[var(--bg-elevated)]'
                      }`}>
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                            {item.category}
                          </span>
                        </div>
                        <p className={`text-xs sm:text-sm leading-relaxed ${isDone ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                          {item.statement}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 24: Common Mistakes & Failures */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center space-x-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                  Section 24 • Critical Engineering Mistakes & Failure Prevention
                </h3>
              </div>

              <div className="space-y-3">
                {record.commonMistakes.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                    <div className="flex items-center space-x-2 text-rose-400">
                      <span className="font-bold text-xs font-mono">Failure Mode 0{idx + 1}:</span>
                      <h4 className="font-bold text-xs text-[var(--text-primary)]">{m.mistake}</h4>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      <strong>Consequence:</strong> {m.consequence}
                    </p>

                    <div className="pt-2 border-t border-[var(--border-color)] text-xs font-mono text-[var(--accent-emerald)]">
                      <strong>Prevention Protocol:</strong> {m.prevention}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 25: Rigorous QA/QC Checklist */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[var(--accent-purple)]">
                  <ShieldCheck className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                    Section 25 • Rigorous QA/QC Design Verification Audit
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">Four-Eyes Principle</span>
              </div>

              <div className="space-y-2.5">
                {record.qaQcChecklist.map((qa) => {
                  const isChecked = Boolean(checkedItems[qa.id]);
                  return (
                    <div
                      key={qa.id}
                      onClick={() => toggleCheckItem(qa.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-[var(--accent-purple-bg)]/30 border-[var(--accent-purple)]/60'
                          : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:border-[var(--accent-purple)]/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-[var(--accent-purple)] border-[var(--accent-purple)] text-white' : 'border-[var(--border-color)]'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-[var(--accent-purple)] font-bold block">
                            [{qa.category}]
                          </span>
                          <p className="text-xs text-[var(--text-primary)]">{qa.checkItem}</p>
                        </div>
                      </div>

                      {qa.standardRef && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] shrink-0">
                          {qa.standardRef}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
