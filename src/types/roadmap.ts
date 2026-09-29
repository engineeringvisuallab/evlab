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

/** Raw shape as stored in courses.json — some legacy entries use title/summary
 *  instead of name/description, so both are accepted here and normalized on load. */
export interface RawCourseRecord {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  provider?: string;
  level?: string;
  duration?: string;
  rating?: number;
  tags?: string[];
}

export interface CourseRecord {
  id: string;
  name: string;
  description?: string;
  provider?: string;
  level?: string;
  duration?: string;
  rating?: number;
  tags?: string[];
}
