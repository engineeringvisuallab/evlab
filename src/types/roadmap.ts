/**
 * EVLab — Career Roadmap Type System
 *
 * The Career Roadmap is a recursive tree of arbitrary depth:
 *   Field -> Branch -> Specialization -> Area -> Topic -> ...further nesting if required
 *
 * A node's depth is NOT fixed by the type system. A node may:
 *  - have children
 *  - have relational content (references into registries)
 *  - have both
 *  - have neither (a leaf / dead-end detail node)
 *  - be marked comingSoon (visible, but not yet populated)
 */

/** Known roadmap depth levels. Informational only — not a hard constraint. */
export type RoadmapNodeKind =
  | 'field'
  | 'branch'
  | 'specialization'
  | 'area'
  | 'topic'
  | string; // allows further nesting levels not yet named

/**
 * Cross-references from a roadmap node into the normalized registries.
 * Each array holds stable registry IDs — never duplicated objects.
 */
export interface RoadmapRelations {
  knowledge?: string[];
  skills?: string[];
  software?: string[];
  standards?: string[];
  workflow?: string[];
  projects?: string[];
  careerRoles?: string[];
  organizations?: string[];
  courses?: string[];
  plugins?: string[];
  drawings?: string[];
  templates?: string[];
  resources?: string[];
}

/** Arbitrary key/value stat display, e.g. { "Specializations": "8+", "Career Demand": "Very High" } */
export type RoadmapStats = Record<string, string>;

export interface RoadmapNode {
  /** Stable, unique identifier across the entire tree. */
  id: string;
  /** Depth label — see RoadmapNodeKind. */
  kind?: RoadmapNodeKind;
  title: string;
  summary?: string;
  /** Path to a hero/cover image for this node's detail view. */
  heroImage?: string;
  /** Small stat chips shown on the node's detail header. */
  stats?: RoadmapStats;
  /** Child nodes — same shape, arbitrary depth. Omit or leave empty for leaf nodes. */
  children?: RoadmapNode[];
  /** Cross-references into the registries. */
  relations?: RoadmapRelations;
  /** Optional link into a related UELE object/environment. */
  ueleLink?: string;
  /** True if this node is a placeholder awaiting content. */
  comingSoon?: boolean;
}

/** The root of roadmap-tree.json is an array of top-level Field nodes. */
export type RoadmapTree = RoadmapNode[];
