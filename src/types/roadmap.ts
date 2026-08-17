/**
 * EVLab — Career Roadmap Type Definitions
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

export interface RoadmapNode {
  id: string;
  kind?: 'field' | 'branch' | 'specialization' | 'area' | 'topic' | string;
  title: string;
  summary?: string;
  heroImage?: string;
  stats?: Record<string, string>;
  children?: RoadmapNode[];
  relations?: RoadmapRelations;
  ueleLink?: string;
  comingSoon?: boolean;
}

export type RoadmapTree = RoadmapNode[];
