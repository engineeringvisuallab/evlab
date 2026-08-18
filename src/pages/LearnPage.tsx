import React, { useMemo, useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Search,
  Clock,
  Star,
  Compass,
  FlaskConical,
  Library,
  ArrowRight,
  X,
  Route as RouteIcon,
  Briefcase,
  Sigma,
  Waves,
  Weight,
  Orbit,
  TestTube,
} from 'lucide-react';
import { Container } from '../components/shared/Container';
import { SectionHeader } from '../components/shared/SectionHeader';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { useRouter } from '../context/RouterContext';
import { isActivePath } from '../utils/router';

import coursesData from '../data/registries/courses.json';
import roadmapTreeData from '../data/roadmap-tree.json';
import type { CourseRecord, RawCourseRecord, RoadmapNode } from '../types/roadmap';

const NOT_YET_REGISTERED = 'Not Yet Registered';

/** Normalizes legacy title/summary records into the standard name/description shape.
 *  No values are fabricated — missing fields stay undefined and render as
 *  "Not Yet Registered" wherever the UI shows them. */
function normalizeCourse(key: string, raw: RawCourseRecord): CourseRecord {
  return {
    id: raw.id ?? key,
    name: raw.name ?? raw.title ?? raw.id ?? key,
    description: raw.description ?? raw.summary,
    provider: raw.provider,
    level: raw.level,
    duration: raw.duration,
    rating: raw.rating,
    tags: raw.tags,
  };
}

const COURSES: CourseRecord[] = Object.entries(
  coursesData as Record<string, RawCourseRecord>
).map(([key, raw]) => normalizeCourse(key, raw));
const FIELDS: RoadmapNode[] = roadmapTreeData as RoadmapNode[];

/** Learn > Engineering Foundations — the first Learn category (subject-wise interactive
 *  virtual labs). More categories will be added later; this is intentionally the only
 *  one for now. */
interface FoundationLab {
  id: string;
  route: string;
  title: string;
  desc: string;
  icon: typeof Sigma;
  color: 'blue' | 'cyan' | 'purple' | 'emerald' | 'amber';
}

const ENGINEERING_FOUNDATIONS_LABS: FoundationLab[] = [
  {
    id: 'mechanics',
    route: '/learn/lab/mechanics',
    title: 'Engineering Mechanics',
    desc: 'Statics, dynamics, trusses, beams, friction, and structural mechanics — solve, simulate, and build free-body diagrams interactively.',
    icon: Sigma,
    color: 'blue',
  },
  {
    id: 'fluid-mechanics',
    route: '/learn/lab/fluid-mechanics',
    title: 'Fluid Mechanics',
    desc: 'Hydraulics, pipe networks, Moody diagrams, HGL/EGL, and pump curves in a real-time 2D/3D flow laboratory.',
    icon: Waves,
    color: 'cyan',
  },
  {
    id: 'strength-of-materials',
    route: '/learn/lab/strength-of-materials',
    title: 'Strength of Materials',
    desc: 'Stress-strain, torsion, beam bending, Mohr\u2019s circle, and column buckling with live structural visualizations.',
    icon: Weight,
    color: 'purple',
  },
  {
    id: 'mathematics',
    route: '/learn/lab/mathematics',
    title: 'Mathematics Visual Lab',
    desc: 'Algebra, calculus, trigonometry, vectors, matrices, and probability — explore every topic through interactive, hands-on visualizations.',
    icon: Sigma,
    color: 'emerald',
  },
  {
    id: 'physics',
    route: '/learn/lab/physics',
    title: 'Physics Virtual Laboratory',
    desc: 'Mechanics, motion, waves, electricity, and thermodynamics experiments with live simulation, graphing, and prediction modes.',
    icon: Orbit,
    color: 'blue',
  },
  {
    id: 'chemistry',
    route: '/learn/lab/chemistry',
    title: 'Chemistry Virtual Laboratory',
    desc: 'Titration, atomic structure, periodic trends, kinetics, equilibrium, and organic chemistry labs with molecular visualization.',
    icon: TestTube,
    color: 'cyan',
  },
];

/** Buckets EVLab's free-text course "level" strings into the standard difficulty tiers. */
function difficultyOf(level?: string): string {
  if (!level) return NOT_YET_REGISTERED;
  const l = level.toLowerCase();
  if (l.includes('advanced') && !l.includes('beginner') && !l.includes('intermediate')) return 'Advanced';
  if (l.includes('professional')) return 'Professional';
  if (l.includes('beginner') && (l.includes('advanced') || l.includes('intermediate'))) return 'Beginner to Advanced';
  if (l.includes('beginner')) return 'Beginner';
  if (l.includes('intermediate')) return 'Intermediate';
  return level;
}

/** Walks the Career Roadmap tree once and maps every registered course id back to the
 *  top-level engineering Field(s) that reference it, so course cards can link to
 *  "Explore in Career Roadmap" without duplicating any roadmap data. */
function buildCourseToFieldsIndex(fields: RoadmapNode[]): Map<string, { id: string; title: string }[]> {
  const index = new Map<string, { id: string; title: string }[]>();
  const add = (courseId: string, field: { id: string; title: string }) => {
    const existing = index.get(courseId) ?? [];
    if (!existing.some((f) => f.id === field.id)) existing.push(field);
    index.set(courseId, existing);
  };
  const walk = (node: RoadmapNode, field: { id: string; title: string }) => {
    (node.relations?.courses ?? []).forEach((courseId) => add(courseId, field));
    (node.children ?? []).forEach((child) => walk(child, field));
  };
  fields.forEach((field) => walk(field, { id: field.id, title: field.title }));
  return index;
}

interface LearnPageProps {
  onNavigateToRoadmap?: (fieldId?: string) => void;
}

type PrimaryView = 'choose' | 'learn' | 'courses';

function viewFromPath(path: string): PrimaryView {
  if (isActivePath(path, '/learn/courses')) return 'courses';
  if (isActivePath(path, '/learn/explore')) return 'learn';
  return 'choose';
}

export const LearnPage: React.FC<LearnPageProps> = ({ onNavigateToRoadmap }) => {
  const { path, navigate } = useRouter();
  const view = viewFromPath(path);

  const courseToFields = useMemo(() => buildCourseToFieldsIndex(FIELDS), []);

  const goRoadmap = (fieldId?: string) => {
    if (onNavigateToRoadmap) onNavigateToRoadmap(fieldId);
    else navigate(fieldId ? `/career-roadmap/${fieldId}` : '/career-roadmap');
  };

  if (view === 'choose') {
    return <LearnCoursesChoice onChoose={(v) => navigate(v === 'learn' ? '/learn/explore' : '/learn/courses')} />;
  }

  if (view === 'learn') {
    return (
      <LearnExplore
        onBack={() => navigate('/learn')}
        onOpenCourses={() => navigate('/learn/courses')}
        onNavigateToRoadmap={goRoadmap}
      />
    );
  }

  return (
    <CourseCatalogue
      onBack={() => navigate('/learn')}
      onOpenLearn={() => navigate('/learn/explore')}
      courseToFields={courseToFields}
      onNavigateToRoadmap={goRoadmap}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Landing choice: LEARN vs COURSES                                    */
/* ------------------------------------------------------------------ */

function LearnCoursesChoice({ onChoose }: { onChoose: (v: 'learn' | 'courses') => void }) {
  return (
    <Container size="lg" className="py-14 sm:py-20">
      <SectionHeader
        badge="Learn & Courses"
        badgeVariant="blue"
        align="center"
        title="Learn & Courses"
        description="Build engineering knowledge, practical skills, and career-ready capabilities through structured learning."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card
          hoverable
          padding="lg"
          className="cursor-pointer group flex flex-col"
          onClick={() => onChoose('learn')}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-blue-bg)] text-[var(--accent-blue)]">
            <Compass size={24} />
          </span>
          <h3 className="mt-5 text-xl font-bold text-[var(--text-primary)]">Learn</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            Explore engineering concepts, subjects, tutorials, and interactive learning — including
            the upcoming Engineering Lab of simulations and visual experiments.
          </p>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-blue)]">
            Start exploring <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Card>

        <Card
          hoverable
          padding="lg"
          className="cursor-pointer group flex flex-col"
          onClick={() => onChoose('courses')}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-purple-bg)] text-[var(--accent-purple)]">
            <GraduationCap size={24} />
          </span>
          <h3 className="mt-5 text-xl font-bold text-[var(--text-primary)]">Courses</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            Explore structured engineering courses, learning paths, professional training programs,
            and course-based progress across every EVLab engineering field.
          </p>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-purple)]">
            Browse courses <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Card>
      </div>
    </Container>
  );
}

/* ------------------------------------------------------------------ */
/* LEARN — general subjects + Engineering Lab entry                    */
/* ------------------------------------------------------------------ */

function LearnExplore({
  onBack,
  onOpenCourses,
  onNavigateToRoadmap,
}: {
  onBack: () => void;
  onOpenCourses: () => void;
  onNavigateToRoadmap: (fieldId?: string) => void;
}) {
  const { navigate } = useRouter();

  return (
    <Container size="xl" className="py-12 space-y-12">
      <BackToChoice onBack={onBack} activeLabel="Learn" otherLabel="Courses" onOther={onOpenCourses} />

      <div className="space-y-5">
        <SectionHeader
          badge="Category · Engineering Foundations"
          badgeVariant="cyan"
          title="Engineering Foundations"
          description="Interactive subject-wise virtual labs — solve, simulate, and visualize core engineering theory. More categories are added over time."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENGINEERING_FOUNDATIONS_LABS.map((lab) => {
            const Icon = lab.icon;
            return (
              <Card
                key={lab.id}
                hoverable
                padding="lg"
                className="cursor-pointer group flex flex-col"
                onClick={() => navigate(lab.route)}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-${lab.color}-bg)] text-[var(--accent-${lab.color})]`}
                >
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-base font-bold text-[var(--text-primary)]">{lab.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">{lab.desc}</p>
                <span
                  className={`mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-${lab.color})]`}
                >
                  Open lab <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionHeader
        badge="Learn"
        badgeVariant="blue"
        title="Engineering Subjects"
        description="Every subject below connects into the full Career Roadmap — pick a field to see its branches, specializations, and hands-on areas."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIELDS.map((field) => (
          <Card
            key={field.id}
            hoverable
            padding="md"
            className="cursor-pointer flex flex-col"
            onClick={() => onNavigateToRoadmap(field.id)}
          >
            <h3 className="text-base font-semibold text-[var(--text-primary)]">{field.title}</h3>
            {field.summary && (
              <p className="mt-1.5 text-sm text-[var(--text-secondary)] line-clamp-2">{field.summary}</p>
            )}
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-blue)]">
              Explore in Career Roadmap <ArrowRight size={12} />
            </span>
          </Card>
        ))}
      </div>

      <Card padding="lg" className="border-dashed">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)]">
              <FlaskConical size={22} />
            </span>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Engineering Lab</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-xl">
                Turn engineering theory into interactive experiments, simulations, and visual learning.
              </p>
            </div>
          </div>
          <Badge variant="amber">Coming Soon</Badge>
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
            <Library size={22} />
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Learning Resources</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-xl">
              CAD blocks, templates, standards, and reference material to support your learning.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = '/resources')}>
            Open Resources
          </Button>
        </div>
      </Card>
    </Container>
  );
}

/* ------------------------------------------------------------------ */
/* COURSES — functional catalogue over the real course registry        */
/* ------------------------------------------------------------------ */

const DIFFICULTY_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Professional'];

function CourseCatalogue({
  onBack,
  onOpenLearn,
  courseToFields,
  onNavigateToRoadmap,
}: {
  onBack: () => void;
  onOpenLearn: () => void;
  courseToFields: Map<string, { id: string; title: string }[]>;
  onNavigateToRoadmap: (fieldId?: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(18);
  const [detail, setDetail] = useState<CourseRecord | null>(null);

  const topTags = useMemo(() => {
    const freq = new Map<string, number>();
    COURSES.forEach((c) => (c.tags ?? []).forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1)));
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([tag]) => tag);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSES.filter((c) => {
      const diff = difficultyOf(c.level);
      const matchesDifficulty =
        difficulty === 'All' || diff === difficulty || diff.includes(difficulty);
      const matchesTag = !activeTag || (c.tags ?? []).includes(activeTag);
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.tags ?? []).some((t) => t.toLowerCase().includes(q));
      return matchesDifficulty && matchesTag && matchesQuery;
    });
  }, [query, difficulty, activeTag]);

  const featured = useMemo(
    () => [...COURSES].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3),
    []
  );

  return (
    <Container size="xl" className="py-12 space-y-10">
      <BackToChoice onBack={onBack} activeLabel="Courses" otherLabel="Learn" onOther={onOpenLearn} />

      <SectionHeader
        badge="Courses"
        badgeVariant="purple"
        title="Course Catalogue"
        description={`${COURSES.length} structured engineering courses across every EVLab field — search, filter, and jump straight to what you need.`}
      />

      {/* Featured */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Featured Courses
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {featured.map((c) => (
            <CourseCard key={c.id} course={c} onOpen={() => setDetail(c)} compact />
          ))}
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              value={query}
              onChange={(e) => {
                setVisibleCount(18);
                setQuery(e.target.value);
              }}
              placeholder="Search courses, software, standards, skills…"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-blue)]"
            />
          </div>
          <select
            value={difficulty}
            onChange={(e) => {
              setVisibleCount(18);
              setDifficulty(e.target.value);
            }}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)]"
          >
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Difficulty Levels' : d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {topTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setVisibleCount(18);
                setActiveTag(activeTag === tag ? null : tag);
              }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeTag === tag
                  ? 'border-[var(--accent-blue)] bg-[var(--accent-blue-bg)] text-[var(--accent-blue)]'
                  : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-subtle)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="mb-4 text-xs font-mono uppercase tracking-wide text-[var(--text-muted)]">
          {filtered.length} course{filtered.length === 1 ? '' : 's'} found
        </p>
        {filtered.length === 0 ? (
          <Card padding="lg" className="text-center text-sm text-[var(--text-secondary)]">
            No courses match these filters yet. Try clearing a filter — more courses are added
            regularly.
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, visibleCount).map((c) => (
                <CourseCard key={c.id} course={c} onOpen={() => setDetail(c)} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="mt-6 flex justify-center">
                <Button variant="secondary" onClick={() => setVisibleCount((v) => v + 18)}>
                  Load more courses
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {detail && (
        <CourseDetailModal
          course={detail}
          fields={courseToFields.get(detail.id) ?? []}
          onClose={() => setDetail(null)}
          onNavigateToRoadmap={onNavigateToRoadmap}
        />
      )}
    </Container>
  );
}

function CourseCard({
  course,
  onOpen,
  compact = false,
}: {
  course: CourseRecord;
  onOpen: () => void;
  compact?: boolean;
}) {
  const diff = difficultyOf(course.level);
  return (
    <Card hoverable padding="md" className="flex cursor-pointer flex-col" onClick={onOpen}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-bold leading-snug text-[var(--text-primary)]">{course.name}</h4>
        {course.rating != null && (
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--accent-warning,#f59e0b)]">
            <Star size={12} className="fill-current" />
            {course.rating}
          </span>
        )}
      </div>
      {!compact && course.description && (
        <p className="mt-2 line-clamp-2 text-xs text-[var(--text-secondary)]">{course.description}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
        <span className="flex items-center gap-1">
          <Clock size={11} /> {course.duration ?? NOT_YET_REGISTERED}
        </span>
        <span>·</span>
        <span>{diff}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(course.tags ?? []).slice(0, 3).map((t) => (
          <Badge key={t} variant="outline" size="sm">
            {t}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

function CourseDetailModal({
  course,
  fields,
  onClose,
  onNavigateToRoadmap,
}: {
  course: CourseRecord;
  fields: { id: string; title: string }[];
  onClose: () => void;
  onNavigateToRoadmap: (fieldId?: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{course.name}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          {course.description ?? NOT_YET_REGISTERED}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-[var(--text-muted)]">Provider</dt>
            <dd className="font-medium text-[var(--text-primary)]">{course.provider ?? NOT_YET_REGISTERED}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Level</dt>
            <dd className="font-medium text-[var(--text-primary)]">{course.level ?? NOT_YET_REGISTERED}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Duration</dt>
            <dd className="font-medium text-[var(--text-primary)]">{course.duration ?? NOT_YET_REGISTERED}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Rating</dt>
            <dd className="font-medium text-[var(--text-primary)]">
              {course.rating != null ? `${course.rating} / 5` : NOT_YET_REGISTERED}
            </dd>
          </div>
        </dl>

        {(course.tags ?? []).length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Skills &amp; Software
            </p>
            <div className="flex flex-wrap gap-1.5">
              {course.tags!.map((t) => (
                <Badge key={t} variant="blue" size="sm">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Related Career Roadmap
          </p>
          {fields.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">{NOT_YET_REGISTERED}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {fields.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onNavigateToRoadmap(f.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)]"
                >
                  <RouteIcon size={12} /> {f.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function BackToChoice({
  onBack,
  activeLabel,
  otherLabel,
  onOther,
}: {
  onBack: () => void;
  activeLabel: string;
  otherLabel: string;
  onOther: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <BookOpen size={14} /> Learn &amp; Courses
      </button>
      <span className="text-[var(--text-muted)]">/</span>
      <span className="font-semibold text-[var(--text-primary)]">{activeLabel}</span>
      <span className="mx-1 text-[var(--text-muted)]">·</span>
      <button
        onClick={onOther}
        className="inline-flex items-center gap-1 font-medium text-[var(--accent-blue)] hover:underline"
      >
        <Briefcase size={12} /> Switch to {otherLabel}
      </button>
    </div>
  );
}
