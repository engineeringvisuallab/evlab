/**
 * EV Software Core - Application Manifest and Registry Types
 * Defines the Application Contract, capabilities, and lifecycle statuses.
 */

export type AppCategory = 
  | 'geospatial'
  | 'drafting_cad'
  | 'process_engineering'
  | 'hydraulics'
  | 'cost_estimation'
  | 'data_calculation'
  | 'ai_assistant'
  | 'utilities';

export type AppCapability = 
  | 'spatial_data'
  | 'cad_drafting'
  | 'wtp_process'
  | 'stp_process'
  | 'hydraulic_modeling'
  | 'boq_estimation'
  | 'sheet_calculation'
  | 'reporting'
  | 'export_geojson'
  | 'export_dxf'
  | 'export_pdf';

export type CoreServiceRequirement = 
  | 'data_exchange'
  | 'validation_engine'
  | 'revision_history'
  | 'storage_service'
  | 'audit_logger'
  | 'notifications';

export type ReleaseStatus = 'ga' | 'beta' | 'alpha' | 'preview' | 'deprecated';

export interface ApplicationManifest {
  appId: string;
  name: string;
  slug: string;
  version: string;
  coreApiVersion: string;
  description: string;
  category: AppCategory;
  entryRoute: string;
  iconName: string;
  capabilities: AppCapability[];
  supportedProjectTypes: string[];
  requiredServices: CoreServiceRequirement[];
  permissions: string[];
  releaseStatus: ReleaseStatus;
  author: string;
  documentationUrl?: string;
  registeredAt: string;
  lastHealthCheck?: string;
  isSiblingApp: true;
}

export interface ApplicationRegistrationPayload {
  manifest: Omit<ApplicationManifest, 'registeredAt' | 'lastHealthCheck'>;
}
