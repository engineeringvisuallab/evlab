/**
 * EVLab — Admin/UELE-GIS database types.
 *
 * Ported from the Engineering Visual Lab (evlab2) admin+GIS upgrade branch.
 * Kept as a separate module from `types/uele.ts` (the existing public UELE
 * viewer's types) because a few identifiers collide with different meanings
 * in that file. Three collisions were renamed with an `Admin` prefix:
 *   - UELERegion    -> AdminUELERegion
 *   - UELEComponent -> AdminUELEComponent
 *   - UELEParameter -> AdminUELEParameter
 * Everything else keeps its original evlab2 name.
 */

/**
 * EVLab — UELE (Ultimate Engineering Learning Ecosystem) Architecture
 * Single source of truth for both 2D GIS and 3D Digital Twin representations.
 */

export type UELESystemCategory =
  | 'smart-city'
  | 'engineering-village'
  | 'agriculture'
  | 'water-systems'
  | 'energy'
  | 'transportation'
  | 'infrastructure'
  | 'industrial'
  | 'environment'
  | 'gis-digital-engineering'
  | 'bim-digital-twin'
  | 'projects';

export type UELEPublicationStatus = 'draft' | 'published' | 'archived';

export interface UELESystemCategoryMeta {
  id: UELESystemCategory;
  title: string;
  shortDescription: string;
  iconName: string;
  color: string;
  badge?: string;
  systems?: string[];
}

export interface AdminUELEParameter {
  id: string;
  symbol?: string;
  name: string;
  value: string | number;
  unit?: string;
  category?: 'hydraulic' | 'structural' | 'electrical' | 'environmental' | 'operational' | 'geospatial' | 'mechanical' | 'thermal';
  description?: string;
  standard?: string;
  required?: boolean;
  status?: UELEPublicationStatus;
}

export interface UELELearningLink {
  id: string;
  title: string;
  type: 'course' | 'video' | 'software' | 'standard' | 'roadmap' | 'resource';
  url?: string;
  roadmapFieldId?: string;
  description?: string;
}

export interface UELEEngineeringInfo {
  overview: string;
  purpose?: string;
  whatIsIt?: string;
  whyRequired?: string;
  howItWorks?: string;
  designConsiderations?: string;
  operatingParameters?: string;
  maintenanceNotes?: string;
  safetyNotes?: string;
  designStandards?: string[];
  softwareUsed?: string[];
  disciplines?: string[];
}

export interface UELEMediaAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'drawing' | 'pdf' | 'document';
  url: string;
  sizeBytes?: number;
  description?: string;
}

export interface UELESubComponent {
  id: string;
  componentId?: string;
  name: string;
  type?: string;
  description?: string;
  status?: UELEPublicationStatus;
  parameters?: AdminUELEParameter[];
}

export interface AdminUELEComponent {
  id: string;
  facilityId: string;
  parentComponentId?: string;
  name: string;
  description: string;
  type?: string;
  status?: UELEPublicationStatus;
  subComponents?: UELESubComponent[];
  parameters?: AdminUELEParameter[];
  position3D?: [number, number, number];
}

export interface UELEGeoreferenceMetadata {
  modelId: string;
  file: string;
  coordinateReferenceSystem: {
    type: string;
    code: number;
    name: string;
  };
  anchor: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
  units: string;
  localOrigin: {
    x: number;
    y: number;
    z: number;
  };
  northReference: number;
  verticalDatum: string;
  modelBounds: {
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
  };
}

export type UELEGeoreferenceValidationStatus =
  | 'valid'
  | 'missing_anchor'
  | 'crs_missing'
  | 'units_undefined';

export interface UELE3DModel {
  id: string;
  modelName: string;
  facilityId?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  format: 'glb' | 'gltf' | 'ifc' | '3dtiles';
  anchor: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  crs: string;
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  units: string;
  localOrigin: { x: number; y: number; z: number };
  northReference: number;
  verticalDatum: string;
  modelBounds: {
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
  };
  georeferenceStatus: UELEGeoreferenceValidationStatus;
  status: UELEPublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UELEFacility {
  id: string;
  zoneId: string;
  category: UELESystemCategory;
  name: string;
  code?: string;
  description: string;
  layerId: string;
  status: UELEPublicationStatus;
  
  // Authoritative geographic parameters (WGS84 EPSG:4326)
  latitude: number;
  longitude: number;
  elevation: number;
  crs: string; // Default: 'EPSG:4326'

  // Backwards compatibility coordinates object
  coordinates: {
    lat: number;
    lng: number;
    elevation?: number;
  };

  localOrigin?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  boundingBox?: { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number };

  model3DId?: string;
  position3D?: [number, number, number];
  dimensions3D?: [number, number, number];
  rotation3D?: [number, number, number];
  footprint?: { x: number; y: number }[];
  
  engineeringInfo?: UELEEngineeringInfo;
  parameters?: AdminUELEParameter[];
  components?: AdminUELEComponent[];
  learningLinks?: UELELearningLink[];
  mediaAttachments?: UELEMediaAttachment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UELENetwork {
  id: string;
  name: string;
  type: 'water-pipe' | 'sewer-line' | 'power-line' | 'canal' | 'road-segment' | 'drainage';
  fromFacilityId?: string;
  toFacilityId?: string;
  coordinates: { lat: number; lng: number; elevation?: number }[];
  layerId: string;
  status: UELEPublicationStatus;
  parameters?: AdminUELEParameter[];
}

export interface UELEZone {
  id: string;
  regionId: string;
  category: UELESystemCategory;
  name: string;
  description: string;
  status: UELEPublicationStatus;
  facilities?: UELEFacility[];
  networks?: UELENetwork[];
}

export interface AdminUELERegion {
  id: string;
  worldId: string;
  name: string;
  code: string;
  description: string;
  status: UELEPublicationStatus;
  centerCoordinates: { lat: number; lng: number };
  zones?: UELEZone[];
}

export interface UELEWorld {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: UELEPublicationStatus;
  centerLat: number;
  centerLng: number;
  crs: string;
  regions?: AdminUELERegion[];
}

export interface UELEGISLayerStyle {
  color: string;
  strokeWidth: number;
  fillOpacity: number;
  pointSize: number;
  labelField?: string;
  labelVisible: boolean;
  opacity: number;
  minZoom: number;
  maxZoom: number;
}

export interface UELELayer {
  id: string;
  name: string;
  category: UELESystemCategory;
  color: string;
  visible: boolean;
  type: 'vector' | 'raster' | 'geojson' | 'bim' | '3d' | 'shapefile' | 'kml' | 'wms';
  description?: string;
  status?: UELEPublicationStatus;
  style?: UELEGISLayerStyle;
  featureCount?: number;
}

export interface UELEVideo {
  videoId: string;
  title: string;
  url: string;
  provider: 'YouTube' | 'Vimeo' | 'EVLab' | 'External';
  description?: string;
  duration?: string;
  thumbnail?: string;
  skill?: string;
  software?: string;
  topic?: string;
  facilityId?: string;
  componentId?: string;
  status?: UELEPublicationStatus;
}

export interface UELESoftware {
  id: string;
  name: string;
  category: string;
  description: string;
  websiteUrl?: string;
  relatedDisciplines?: string[];
  status?: UELEPublicationStatus;
}

export interface UELEStandard {
  id: string;
  code: string;
  title: string;
  organization: string;
  description: string;
  url?: string;
  status?: UELEPublicationStatus;
}

export interface UELECourse {
  id: string;
  title: string;
  instructor?: string;
  duration?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  url?: string;
  description: string;
  status?: UELEPublicationStatus;
}

export interface UELEResource {
  id: string;
  title: string;
  type: 'pdf' | 'drawing' | 'manual' | 'dataset' | 'link';
  url: string;
  description?: string;
  status?: UELEPublicationStatus;
}

export interface UELEValidationRuleResult {
  id: string;
  rule: string;
  level: 'PASS' | 'WARNING' | 'ERROR';
  targetId: string;
  targetName: string;
  targetType: string;
  message: string;
}

export interface UELEValidationReport {
  timestamp: string;
  totalChecked: number;
  passes: number;
  warnings: number;
  errors: number;
  results: UELEValidationRuleResult[];
}

export type UELEViewMode = '2d' | '3d';
