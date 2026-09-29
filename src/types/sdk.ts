/**
 * EV Software Core - EV Application SDK Interface Types
 * Defines the public contract exposed to sibling applications (EV GIS, EV Mini CAD, EV WTP, etc.).
 */

import { ApplicationManifest } from './application';
import { Project, User } from './core';
import { Dataset, DatasetRevision, GenericDatasetPayload } from './dataset';
import { Transfer, TransferPackage, TransferState } from './transfer';
import { ValidationResult } from './validation';
import { FileReference } from './storage';

export interface CoreClientConfig {
  appId: string;
  appVersion: string;
  coreApiVersion: string;
  endpointUrl?: string;
  authToken?: string;
}

export interface SDKNotification {
  id: string;
  timestamp: string;
  type: 'transfer_received' | 'revision_committed' | 'validation_complete' | 'system_alert';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
}

export type SDKEventCallback = (payload: unknown) => void;

export interface EVAppSDKInterface {
  // Context
  getCurrentUser: () => User;
  getActiveProject: () => Project | null;
  getApplicationManifest: () => ApplicationManifest;
  
  // Projects
  listProjects: () => Promise<Project[]>;
  getProject: (projectId: string) => Promise<Project>;
  
  // Datasets & Revisions
  getDatasetsByProject: (projectId: string) => Promise<Dataset[]>;
  getDataset: (datasetId: string) => Promise<Dataset>;
  createDataset: (params: {
    projectId: string;
    name: string;
    description: string;
    datasetType: Dataset['datasetType'];
    initialPayload: GenericDatasetPayload;
  }) => Promise<{ dataset: Dataset; revision: DatasetRevision }>;
  getRevisions: (datasetId: string) => Promise<DatasetRevision[]>;
  
  // Data Exchange / Transfers
  listTransfers: (projectId: string) => Promise<Transfer[]>;
  getTransfer: (transferId: string) => Promise<Transfer>;
  initiateTransfer: (params: {
    projectId: string;
    sourceDatasetId: string;
    destinationAppId: string;
    changeSummary: string;
    payload: GenericDatasetPayload;
    units: string;
    crs?: string;
  }) => Promise<Transfer>;
  updateTransferState: (transferId: string, newState: TransferState, metadata?: Record<string, unknown>) => Promise<Transfer>;
  reviewTransfer: (transferId: string, notes: string) => Promise<Transfer>;
  validateTransfer: (transferId: string) => Promise<{ transfer: Transfer; validation: ValidationResult }>;
  commitTransfer: (transferId: string) => Promise<{ transfer: Transfer; newRevision: DatasetRevision }>;
  rejectTransfer: (transferId: string, reason: string) => Promise<Transfer>;
  
  // Storage & Files
  listFiles: (projectId: string) => Promise<FileReference[]>;
  uploadFile: (file: File, projectId: string, datasetId?: string) => Promise<FileReference>;
  
  // Event system
  subscribe: (eventType: string, callback: SDKEventCallback) => () => void;
  emit: (eventType: string, payload: unknown) => void;
}
