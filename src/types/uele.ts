/**
 * EVLab — Ultimate Engineering Learning Ecosystem (UELE) Type Definitions
 */

export type UELERegion =
  | 'smart-city'
  | 'engineering-village'
  | 'agriculture'
  | 'water-system'
  | 'energy-system'
  | 'transportation'
  | 'industrial'
  | 'environmental'
  | string;

export type UELEEnvironment = UELERegion;

export interface UELESubElement {
  id: string;
  type: 'box' | 'cylinder' | 'sphere' | 'torus' | 'cone' | 'ring' | 'plane';
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
  transparent?: boolean;
  opacity?: number;
  label?: string;
  animation?: 'rotate' | 'pulse' | 'flow' | 'none';
  componentId?: string;
}

export interface UELEModelMeta {
  type: 'placeholder' | 'gltf' | 'glb' | 'primitive';
  source?: string;
  path?: string;
  scale?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  primitiveType?: 'box' | 'cylinder' | 'sphere' | 'torus' | 'cone' | 'group';
  color?: string;
  accentColor?: string;
  metalness?: number;
  roughness?: number;
  subElements?: UELESubElement[];
  waterFlow?: boolean;
}

export interface UELEHotspot {
  id: string;
  label: string;
  position: [number, number, number];
  description?: string;
  componentId?: string;
}

export interface UELEParameter {
  name: string;
  value: string | number;
  unit?: string;
  description?: string;
}

export interface UeleVideo {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  level?: string;
  category?: string;
  provider?: string;
  url?: string;
  embedUrl?: string;
  thumbnail?: string;
  tags?: string[];
  objectIds?: string[];
  componentIds?: string[];
  softwareIds?: string[];
  courseIds?: string[];
  resourceIds?: string[];
  comingSoon?: boolean;
}

export interface UELEComponent {
  id: string;
  name: string;
  description?: string;
  what?: string;
  why?: string;
  how?: string;
  engineeringPurpose?: string;
  discipline?: string;
  disciplines?: string[];
  parameters?: UELEParameter[];
  knowledgeIds?: string[];
  skillIds?: string[];
  softwareIds?: string[];
  standardIds?: string[];
  courseIds?: string[];
  resourceIds?: string[];
  videoIds?: string[];
  childComponents?: UELEComponent[];
  subElementId?: string;
  position?: [number, number, number];
  selectable?: boolean;
}

export interface UELEProcessFlow {
  upstream?: string[];
  downstream?: string[];
}

export interface UELEObject {
  id: string;
  name: string;
  category?: string;
  environment: UELEEnvironment;
  regionId?: string;
  region?: string;
  facilityId?: string;
  parentObjectId?: string;
  mapPosition?: [number, number]; // [x, y] in percentage or map coordinates
  mapLayer?: 'water' | 'energy' | 'transportation' | 'city' | 'village' | 'agriculture' | 'industrial' | 'environmental' | string;
  landUse?: string;
  networkLinks?: string[]; // IDs of connected upstream/downstream facilities
  description: string;
  what?: string;
  why?: string;
  how?: string;
  engineeringPurpose?: string;
  parameters?: UELEParameter[];
  disciplines: string[];
  components: UELEComponent[];
  knowledgeIds: string[];
  skillIds?: string[];
  softwareIds: string[];
  standardIds: string[];
  courseIds: string[];
  resourceIds?: string[];
  videoIds?: string[];
  projectIds?: string[];
  careerRoleIds?: string[];
  roadmapIds: string[];
  relatedObjectIds?: string[];
  process?: UELEProcessFlow;
  model: UELEModelMeta;
  hotspots?: UELEHotspot[];
  comingSoon?: boolean;
  selectable?: boolean;
  visible?: boolean;
}
