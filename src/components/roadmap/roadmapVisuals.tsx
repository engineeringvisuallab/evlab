import React from 'react';
import {
  Compass,
  GitBranch,
  Target,
  Layers,
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
  Waves,
  Mountain,
  TrafficCone,
  Droplets,
  ShieldCheck,
  Hammer,
  TowerControl,
  Recycle,
  Thermometer,
  Network,
  Gauge,
  Ruler,
  ClipboardCheck,
  Anchor,
  Flame,
  Snowflake,
  Building,
  Trees,
  Route,
  Warehouse,
  Beaker,
  Microscope,
  Satellite,
  Cog,
  BarChart3,
  Globe2,
} from 'lucide-react';
import { RoadmapNode } from '../../types/roadmap';

export interface RoadmapVisual {
  Icon: React.ComponentType<{ className?: string }>;
  /** Tailwind color token used for icon + badge tint, e.g. "purple", "amber" */
  color: string;
}

// Precise mapping for the 26 top-level engineering fields.
const FIELD_VISUALS: Array<{ match: string; Icon: RoadmapVisual['Icon']; color: string }> = [
  { match: 'civil', Icon: Building2, color: 'purple' },
  { match: 'electrical', Icon: Zap, color: 'amber' },
  { match: 'mechanical', Icon: Wrench, color: 'blue' },
  { match: 'chemical', Icon: FlaskConical, color: 'pink' },
  { match: 'environmental', Icon: Leaf, color: 'emerald' },
  { match: 'industrial', Icon: Factory, color: 'orange' },
  { match: 'electronics', Icon: Cpu, color: 'sky' },
  { match: 'computer', Icon: Cpu, color: 'indigo' },
  { match: 'software', Icon: Code2, color: 'emerald' },
  { match: 'robotics', Icon: Bot, color: 'purple' },
  { match: 'architecture', Icon: Landmark, color: 'amber' },
  { match: 'agricultural', Icon: Sprout, color: 'lime' },
  { match: 'biomedical', Icon: Activity, color: 'rose' },
  { match: 'petroleum', Icon: Fuel, color: 'yellow' },
  { match: 'mining', Icon: Mountain, color: 'yellow' },
  { match: 'marine', Icon: Ship, color: 'cyan' },
  { match: 'aerospace', Icon: Rocket, color: 'blue' },
  { match: 'automotive', Icon: Car, color: 'red' },
  { match: 'renewable', Icon: Sun, color: 'yellow' },
  { match: 'materials', Icon: Atom, color: 'violet' },
  { match: 'nuclear', Icon: Atom, color: 'violet' },
  { match: 'telecommunications', Icon: Radio, color: 'teal' },
  { match: 'surveying', Icon: MapPin, color: 'amber' },
  { match: 'management', Icon: Briefcase, color: 'blue' },
  { match: 'textile', Icon: Shirt, color: 'fuchsia' },
  { match: 'other', Icon: Boxes, color: 'gray' },
];

// Broader keyword mapping used for branches / specializations / focus areas so
// that deeper tree levels also get a meaningful (non-generic) logo instead of
// always falling back to the parent field icon.
const KEYWORD_VISUALS: Array<{ match: string; Icon: RoadmapVisual['Icon']; color: string }> = [
  { match: 'bridge', Icon: Landmark, color: 'purple' },
  { match: 'structural', Icon: Building2, color: 'purple' },
  { match: 'geotechnical', Icon: Mountain, color: 'orange' },
  { match: 'transportation', Icon: Route, color: 'blue' },
  { match: 'pavement', Icon: Route, color: 'gray' },
  { match: 'water', Icon: Droplets, color: 'blue' },
  { match: 'hydraulic', Icon: Waves, color: 'cyan' },
  { match: 'coastal', Icon: Waves, color: 'cyan' },
  { match: 'river', Icon: Waves, color: 'blue' },
  { match: 'flood', Icon: Droplets, color: 'blue' },
  { match: 'sanitary', Icon: Recycle, color: 'emerald' },
  { match: 'waste', Icon: Recycle, color: 'emerald' },
  { match: 'treatment', Icon: Beaker, color: 'emerald' },
  { match: 'sewer', Icon: Droplets, color: 'emerald' },
  { match: 'municipal', Icon: Building, color: 'purple' },
  { match: 'urban', Icon: Building, color: 'purple' },
  { match: 'infrastructure', Icon: Warehouse, color: 'purple' },
  { match: 'construction', Icon: Hammer, color: 'orange' },
  { match: 'tunnel', Icon: Mountain, color: 'gray' },
  { match: 'underground', Icon: Mountain, color: 'gray' },
  { match: 'earthquake', Icon: Activity, color: 'red' },
  { match: 'seismic', Icon: Activity, color: 'red' },
  { match: 'disaster', Icon: ShieldCheck, color: 'red' },
  { match: 'resilience', Icon: ShieldCheck, color: 'red' },
  { match: 'digital', Icon: Cpu, color: 'indigo' },
  { match: 'technology', Icon: Cpu, color: 'indigo' },
  { match: 'power', Icon: Zap, color: 'amber' },
  { match: 'energy', Icon: Zap, color: 'amber' },
  { match: 'control', Icon: Gauge, color: 'blue' },
  { match: 'instrumentation', Icon: Gauge, color: 'blue' },
  { match: 'signal', Icon: Radio, color: 'teal' },
  { match: 'network', Icon: Network, color: 'teal' },
  { match: 'communication', Icon: Radio, color: 'teal' },
  { match: 'wireless', Icon: Radio, color: 'teal' },
  { match: 'satellite', Icon: Satellite, color: 'blue' },
  { match: 'embedded', Icon: Cpu, color: 'indigo' },
  { match: 'thermal', Icon: Thermometer, color: 'red' },
  { match: 'hvac', Icon: Snowflake, color: 'sky' },
  { match: 'refrigeration', Icon: Snowflake, color: 'sky' },
  { match: 'manufacturing', Icon: Cog, color: 'orange' },
  { match: 'production', Icon: Cog, color: 'orange' },
  { match: 'quality', Icon: ClipboardCheck, color: 'emerald' },
  { match: 'safety', Icon: ShieldCheck, color: 'red' },
  { match: 'risk', Icon: ShieldCheck, color: 'red' },
  { match: 'testing', Icon: Microscope, color: 'sky' },
  { match: 'inspection', Icon: ClipboardCheck, color: 'sky' },
  { match: 'surveying', Icon: MapPin, color: 'amber' },
  { match: 'mapping', Icon: MapPin, color: 'amber' },
  { match: 'geomatics', Icon: Globe2, color: 'amber' },
  { match: 'gis', Icon: Globe2, color: 'amber' },
  { match: 'soil', Icon: Mountain, color: 'orange' },
  { match: 'ground', Icon: Mountain, color: 'orange' },
  { match: 'marine', Icon: Anchor, color: 'cyan' },
  { match: 'naval', Icon: Anchor, color: 'cyan' },
  { match: 'ship', Icon: Ship, color: 'cyan' },
  { match: 'offshore', Icon: Anchor, color: 'cyan' },
  { match: 'propulsion', Icon: Flame, color: 'red' },
  { match: 'combustion', Icon: Flame, color: 'red' },
  { match: 'materials', Icon: Atom, color: 'violet' },
  { match: 'metallurg', Icon: Atom, color: 'violet' },
  { match: 'concrete', Icon: Building2, color: 'gray' },
  { match: 'steel', Icon: Building2, color: 'gray' },
  { match: 'environment', Icon: Leaf, color: 'emerald' },
  { match: 'climate', Icon: Leaf, color: 'emerald' },
  { match: 'agriculture', Icon: Sprout, color: 'lime' },
  { match: 'irrigation', Icon: Droplets, color: 'lime' },
  { match: 'forest', Icon: Trees, color: 'lime' },
  { match: 'management', Icon: Briefcase, color: 'blue' },
  { match: 'planning', Icon: ClipboardCheck, color: 'blue' },
  { match: 'economics', Icon: BarChart3, color: 'blue' },
  { match: 'cost', Icon: BarChart3, color: 'blue' },
  { match: 'traffic', Icon: TrafficCone, color: 'amber' },
  { match: 'highway', Icon: Route, color: 'blue' },
  { match: 'rail', Icon: Route, color: 'blue' },
  { match: 'airport', Icon: Rocket, color: 'blue' },
  { match: 'aviation', Icon: Rocket, color: 'blue' },
  { match: 'space', Icon: Rocket, color: 'blue' },
  { match: 'robot', Icon: Bot, color: 'purple' },
  { match: 'automation', Icon: Bot, color: 'purple' },
  { match: 'mechatronics', Icon: Cog, color: 'purple' },
  { match: 'vehicle', Icon: Car, color: 'red' },
  { match: 'engine', Icon: Cog, color: 'red' },
  { match: 'ai', Icon: Cpu, color: 'indigo' },
  { match: 'machine', Icon: Cpu, color: 'indigo' },
  { match: 'data', Icon: BarChart3, color: 'indigo' },
  { match: 'medical', Icon: Activity, color: 'rose' },
  { match: 'health', Icon: Activity, color: 'rose' },
  { match: 'biomechanic', Icon: Activity, color: 'rose' },
  { match: 'textile', Icon: Shirt, color: 'fuchsia' },
  { match: 'fabric', Icon: Shirt, color: 'fuchsia' },
  { match: 'nuclear', Icon: Atom, color: 'violet' },
  { match: 'radiation', Icon: Atom, color: 'violet' },
  { match: 'reactor', Icon: Atom, color: 'violet' },
  { match: 'solar', Icon: Sun, color: 'yellow' },
  { match: 'wind', Icon: Sun, color: 'yellow' },
  { match: 'petroleum', Icon: Fuel, color: 'yellow' },
  { match: 'drilling', Icon: Fuel, color: 'yellow' },
  { match: 'reservoir', Icon: Fuel, color: 'yellow' },
  { match: 'mining', Icon: Mountain, color: 'yellow' },
  { match: 'mineral', Icon: Mountain, color: 'yellow' },
  { match: 'ruler', Icon: Ruler, color: 'amber' },
  { match: 'measurement', Icon: Ruler, color: 'amber' },
  { match: 'tower', Icon: TowerControl, color: 'blue' },
  { match: 'scada', Icon: Gauge, color: 'blue' },
];

const KIND_FALLBACK: Record<string, RoadmapVisual> = {
  field: { Icon: Compass, color: 'purple' },
  branch: { Icon: GitBranch, color: 'blue' },
  specialization: { Icon: Target, color: 'cyan' },
  area: { Icon: Layers, color: 'emerald' },
};

/**
 * Resolve a logo (icon + color) for any node in the roadmap tree, regardless
 * of depth. Top-level engineering fields get their precise, dedicated icon;
 * deeper branches / specializations / focus areas are matched against a wide
 * keyword table (built from the actual taxonomy) so almost every node gets a
 * distinct, meaningful logo instead of a generic placeholder.
 */
export function getRoadmapVisual(node: Pick<RoadmapNode, 'id' | 'title' | 'kind'>): RoadmapVisual {
  const haystack = `${node.id} ${node.title}`.toLowerCase();

  for (const entry of FIELD_VISUALS) {
    if (haystack.includes(entry.match)) {
      return { Icon: entry.Icon, color: entry.color };
    }
  }

  for (const entry of KEYWORD_VISUALS) {
    if (haystack.includes(entry.match)) {
      return { Icon: entry.Icon, color: entry.color };
    }
  }

  return KIND_FALLBACK[node.kind || 'field'] || KIND_FALLBACK.field;
}

// Tailwind classes can't be built dynamically from a variable string safely
// (JIT purges unused ones), so every color used above needs a static entry
// here. This keeps the badge fully solid/filled — never a bare outline.
const COLOR_BADGE_CLASSES: Record<string, string> = {
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/40',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  pink: 'bg-pink-500/15 text-pink-400 border-pink-500/40',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
  sky: 'bg-sky-500/15 text-sky-400 border-sky-500/40',
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/40',
  lime: 'bg-lime-500/15 text-lime-400 border-lime-500/40',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40',
  red: 'bg-red-500/15 text-red-400 border-red-500/40',
  violet: 'bg-violet-500/15 text-violet-400 border-violet-500/40',
  teal: 'bg-teal-500/15 text-teal-400 border-teal-500/40',
  fuchsia: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/40',
  gray: 'bg-gray-500/15 text-gray-400 border-gray-500/40',
};

export function getRoadmapBadgeClasses(color: string): string {
  return COLOR_BADGE_CLASSES[color] || COLOR_BADGE_CLASSES.purple;
}

/**
 * Always-visible circular logo badge for a roadmap node. Solid tinted
 * background + colored icon (never a bare line-only "sketch").
 */
export const RoadmapNodeLogo: React.FC<{
  node: Pick<RoadmapNode, 'id' | 'title' | 'kind'>;
  size?: 'sm' | 'md';
}> = ({ node, size = 'sm' }) => {
  const { Icon, color } = getRoadmapVisual(node);
  const dimension = size === 'md' ? 'w-9 h-9' : 'w-7 h-7';
  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div
      className={`shrink-0 ${dimension} rounded-full border flex items-center justify-center ${getRoadmapBadgeClasses(
        color
      )}`}
    >
      <Icon className={iconSize} />
    </div>
  );
};
