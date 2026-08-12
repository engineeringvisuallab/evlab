/**
 * EVLab — Shared Ecosystem Types
 *
 * Lightweight, cross-cutting concepts used across Career Roadmap,
 * UELE, and the secondary hubs (Learn, Plugins, Resources, Projects,
 * Software, Work, About). Kept intentionally minimal per Stage 01 scope.
 */

/** A top-level engineering discipline label used for filtering/tagging across modules. */
export interface EngineeringDiscipline {
  id: string;
  name: string;
  icon?: string;
}

/** Identifies a major section of the EVLab ecosystem, used by navigation and search. */
export type EcosystemSection =
  | 'home'
  | 'career-roadmap'
  | 'uele'
  | 'learn'
  | 'resources'
  | 'plugins'
  | 'projects'
  | 'software'
  | 'work'
  | 'about';

/** A generic pointer used for cross-linking between modules (e.g. Roadmap node -> Course). */
export interface CrossLink {
  section: EcosystemSection;
  id: string;
  label?: string;
}

/** A generic reference to a piece of content, used by search results and "related" rails. */
export interface ContentReference {
  id: string;
  section: EcosystemSection;
  title: string;
  summary?: string;
  image?: string;
}
