/**
 * EVLab — High-Level Shared Ecosystem Definitions
 */

export type EngineeringDiscipline =
  | 'civil'
  | 'electrical'
  | 'mechanical'
  | 'environmental'
  | 'chemical'
  | 'industrial'
  | 'computer'
  | 'software'
  | 'robotics'
  | 'architecture';

export type EcosystemSection =
  | 'roadmap'
  | 'uele'
  | 'learn'
  | 'resources'
  | 'plugins'
  | 'projects'
  | 'software'
  | 'work'
  | 'about';

export interface CrossLink {
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  relationshipLabel?: string;
}

export interface ContentReference {
  id: string;
  title: string;
  type: string;
  url?: string;
}
