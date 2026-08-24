/**
 * EV Software Core - Dataset and Revision Types
 * Strictly enforces explicit data ownership and immutable version history.
 */

export type DatasetType = 
  | 'gis_network'
  | 'cad_drawing'
  | 'wtp_process_model'
  | 'stp_process_model'
  | 'boq_schedule'
  | 'hydraulic_network'
  | 'engineering_sheet';

export type UnavailableEngineeringValue = 'NOT_AVAILABLE' | 'NOT_IMPLEMENTED';

export interface SpatialCRS {
  code: string; // e.g. "EPSG:3857" or "EPSG:4326" or "LOCAL_CAD_MM"
  name: string;
  unit: 'meters' | 'millimeters' | 'feet' | 'degrees';
}

export type PipelineGeometryType = 'LINESTRING' | 'LINE' | 'POINT';

export interface PipelineGeometryItem {
  id: string;
  name: string;
  type: 'pipeline' | 'junction' | 'valve' | 'tank' | 'pump';
  geometryType?: PipelineGeometryType;
  diameterMm: number;
  material: 'Ductile Iron' | 'HDPE' | 'PVC' | 'Steel' | 'Concrete';
  lengthM: number;
  nominalPressureBar: number | UnavailableEngineeringValue;
  startCoords: [number, number]; // [x, y] or [lon, lat] in declared CRS
  endCoords: [number, number];
  invertElevationM?: number | UnavailableEngineeringValue;
  roughnessCoefficient?: number | UnavailableEngineeringValue;
  layer?: string;
  category?: string;
  sourceApplication?: string;
  sourceDatasetId?: string;
  sourceRevisionId?: string;
  schemaVersion?: string;
  status: 'proposed' | 'existing' | 'modified' | 'approved';
}

export interface GISDatasetPayload {
  crs: SpatialCRS;
  layerName: string;
  elements: PipelineGeometryItem[];
  metadata: {
    totalLengthKm: number;
    elementCount: number;
    lastEditorApp: string;
  };
}

export interface CADEntityItem {
  id: string;
  layer: string;
  type: 'LINE' | 'POLYLINE' | 'CIRCLE' | 'TEXT' | 'BLOCK_REF';
  points: [number, number][];
  properties: {
    strokeColor: string;
    strokeWidth: number;
    diameterMm?: number;
    material?: string;
    tag?: string;
    nominalPressureBar?: number | UnavailableEngineeringValue;
    invertElevationM?: number | UnavailableEngineeringValue;
    // Explicit Lineage Tracking Attributes:
    sourceApp?: string;
    sourceDatasetId?: string;
    sourceRevisionId?: string;
    sourceObjectId?: string;
    transferId?: string;
    originalDiameterMm?: number;
    originalMaterial?: string;
    originalPoints?: [number, number][];
    isModifiedInCAD?: boolean;
  };
}

export interface CADDatasetPayload {
  drawingUnit: 'mm' | 'm';
  layers: string[];
  entities: CADEntityItem[];
  origin: [number, number];
  metadata: {
    drawingTitle: string;
    scale: string;
    entityCount: number;
  };
}

export type GenericDatasetPayload = GISDatasetPayload | CADDatasetPayload | Record<string, unknown>;

export interface DatasetRevision {
  revisionId: string;
  datasetId: string;
  revisionNumber: number;
  parentRevisionId: string | null;
  sourceApplicationId: string;
  schemaVersion: string;
  createdBy: string;
  createdAt: string;
  changeSummary: string;
  validationState: 'validated' | 'warning' | 'unvalidated';
  payloadChecksum: string;
  payload: GenericDatasetPayload;
}

export interface Dataset {
  datasetId: string;
  projectId: string;
  ownerApplicationId: string;
  name: string;
  description: string;
  datasetType: DatasetType;
  schemaVersion: string;
  currentRevisionId: string;
  currentRevisionNumber: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  revisions?: DatasetRevision[];
  fileAttachmentIds?: string[];
}
