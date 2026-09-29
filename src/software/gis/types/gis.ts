import { Feature, Geometry, GeoJsonProperties } from 'geojson';

export type GeometryType = 
  | 'Point' 
  | 'LineString' 
  | 'Polygon' 
  | 'MultiPoint' 
  | 'MultiLineString' 
  | 'MultiPolygon';

export type EngineeringDomain = 'general' | 'water' | 'road' | 'drainage' | 'survey';

export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'integer' | 'double';
  alias?: string;
  required?: boolean;
  nullable?: boolean;
  defaultValue?: any;
  domain?: string[]; // Value list domain dropdown choices
  isSystem?: boolean;
}

export interface SymbologyConfig {
  styleType: 'single' | 'categorized' | 'graduated';
  // Single style properties
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeDashArray?: string;
  pointRadius?: number;
  pointIcon?: string;
  
  // Categorized / Graduated styling
  attributeField?: string;
  categoryRules?: Array<{
    value: string | number;
    label: string;
    color: string;
    size?: number;
  }>;
  graduatedRanges?: Array<{
    min: number;
    max: number;
    label: string;
    color: string;
    size?: number;
  }>;
}

export interface LabelConfig {
  enabled: boolean;
  attributeField: string;
  fontSize: number;
  color: string;
  haloColor: string;
  haloWidth: number;
  placement: 'point' | 'line' | 'centroid';
  offsetY?: number;
}

export interface GISFeature {
  id: string;
  layerId: string;
  geometry: Geometry;
  properties: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface GISLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'group' | 'basemap';
  geometryType?: GeometryType;
  domain?: EngineeringDomain;
  visible: boolean;
  opacity: number;
  locked: boolean;
  isEditing?: boolean;
  groupId?: string;
  features: GISFeature[];
  fields: FieldDefinition[];
  symbology: SymbologyConfig;
  labelConfig: LabelConfig;
  sourceType?: 'geojson' | 'shapefile' | 'kml' | 'csv' | 'custom_drawing' | 'sample';
  crs?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LayerGroup {
  id: string;
  name: string;
  visible: boolean;
  collapsed: boolean;
}

export interface BasemapOption {
  id: string;
  name: string;
  type: 'xyz' | 'raster' | 'vector';
  url: string;
  attribution: string;
  thumbnail?: string;
  maxZoom?: number;
  minZoom?: number;
}

export interface CRSDefinition {
  code: string;
  name: string;
  unit: 'meters' | 'degrees' | 'feet';
  proj4?: string;
}

export interface GISProject {
  id: string;
  name: string;
  description: string;
  version: string;
  crs: CRSDefinition;
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
  activeBasemapId: string;
  customBasemaps: BasemapOption[];
  layers: GISLayer[];
  groups: LayerGroup[];
  createdAt: string;
  updatedAt: string;
}

export type ActiveTool =
  | 'select'
  | 'pan'
  | 'draw_point'
  | 'draw_line'
  | 'draw_polygon'
  | 'draw_rectangle'
  | 'draw_circle'
  | 'modify_vertex'
  | 'edit_vertices'
  | 'transform_move'
  | 'transform_rotate'
  | 'transform_scale'
  | 'measure_distance'
  | 'measure_area'
  | 'measure_bearing'
  | 'elevation_profile'
  // Engineering specific draw tools
  | 'water_pipe'
  | 'water_valve'
  | 'water_hydrant'
  | 'water_reservoir'
  | 'road_centerline'
  | 'drain_line'
  | 'manhole'
  | 'select_box'
  | 'select_polygon'
  | 'select_freehand';

export interface SnappingSettings {
  enabled: boolean;
  tolerancePixels: number;
  vertex: boolean;
  edge: boolean;
  endpoint: boolean;
  midpoint: boolean;
  intersection: boolean;
  nearest: boolean;
  perpendicular: boolean;
  targetLayers: 'active' | 'visible' | 'all';
}

export interface EditSession {
  layerId: string;
  startedAt: string;
  initialSnapshot: GISLayer;
  modifiedFeatureIds: string[];
}

export interface GeometryValidationResult {
  status: 'valid' | 'warning' | 'invalid';
  issues: string[];
  selfIntersections?: number;
  duplicateVertices?: number;
  unclosedRings?: number;
}

export interface CommandLogEntry {
  id: string;
  timestamp: string;
  text: string;
  category?: 'edit' | 'select' | 'layer' | 'analysis' | 'system';
}

export interface MeasurementResult {
  type: 'distance' | 'area' | 'bearing';
  value: number;
  formatted: string;
  points: [number, number][];
}

export interface ElevationPoint {
  distance: number; // in meters along line
  elevation: number; // in meters
  lng: number;
  lat: number;
}

export interface CommandItem {
  id: string;
  title: string;
  category: 'Project' | 'Edit' | 'Layer' | 'Analysis' | 'Engineering' | 'View';
  shortcut?: string;
  iconName?: string;
  action: () => void;
}
