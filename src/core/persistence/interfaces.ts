/**
 * EV Software Core - Persistence and Storage Repository Interfaces
 * Decouples domain logic from concrete database and object storage drivers.
 * Supports current DEMO_IN_MEMORY mode and future PRODUCTION_POSTGRES_OBJECT_STORE.
 */

import { ApplicationManifest, ApplicationRegistrationPayload } from '../../types/application';
import { AuditLogEntry } from '../../types/audit';
import { Project, User } from '../../types/core';
import { Dataset, DatasetRevision } from '../../types/dataset';
import { FileReference, StorageAdapterType } from '../../types/storage';
import { Transfer } from '../../types/transfer';
import { ValidationResult } from '../../types/validation';

export type PersistenceMode = 'DEMO_IN_MEMORY' | 'PRODUCTION_POSTGRES_OBJECT_STORE';

export interface ProjectRepository {
  findById(projectId: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  create(project: Project): Promise<Project>;
  update(projectId: string, updates: Partial<Project>): Promise<Project>;
  delete(projectId: string): Promise<boolean>;
}

export interface ApplicationRepository {
  findById(appId: string): Promise<ApplicationManifest | null>;
  findAll(): Promise<ApplicationManifest[]>;
  register(payload: ApplicationRegistrationPayload): Promise<ApplicationManifest>;
  updateStatus(appId: string, status: ApplicationManifest['releaseStatus']): Promise<ApplicationManifest>;
}

export interface DatasetRepository {
  findById(datasetId: string): Promise<Dataset | null>;
  findByProject(projectId: string): Promise<Dataset[]>;
  create(dataset: Dataset): Promise<Dataset>;
  update(datasetId: string, updates: Partial<Dataset>): Promise<Dataset>;
  delete(datasetId: string): Promise<boolean>;
}

export interface RevisionRepository {
  findById(revisionId: string): Promise<DatasetRevision | null>;
  findByDataset(datasetId: string): Promise<DatasetRevision[]>;
  getLatestForDataset(datasetId: string): Promise<DatasetRevision | null>;
  create(revision: DatasetRevision): Promise<DatasetRevision>;
}

export interface TransferRepository {
  findById(transferId: string): Promise<Transfer | null>;
  findByProject(projectId: string): Promise<Transfer[]>;
  create(transfer: Transfer): Promise<Transfer>;
  update(transferId: string, updates: Partial<Transfer>): Promise<Transfer>;
  delete(transferId: string): Promise<boolean>;
}

export interface ValidationRepository {
  saveResult(result: ValidationResult): Promise<ValidationResult>;
  findById(validationId: string): Promise<ValidationResult | null>;
  findByTarget(targetEntityId: string): Promise<ValidationResult[]>;
  getLatestForTarget(targetEntityId: string): Promise<ValidationResult | null>;
}

export interface AuditRepository {
  append(entry: AuditLogEntry): Promise<AuditLogEntry>;
  query(filters: {
    projectId?: string;
    userId?: string;
    applicationId?: string;
    entityType?: string;
    entityId?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]>;
  count(): Promise<number>;
}

export interface FileRepository {
  saveMetadata(fileRef: FileReference): Promise<FileReference>;
  findById(fileId: string): Promise<FileReference | null>;
  findByProject(projectId: string): Promise<FileReference[]>;
  delete(fileId: string): Promise<boolean>;
}

/**
 * Binary & Object Storage abstraction separating relational metadata from raw object streams.
 */
export interface ObjectStorageAdapter {
  readonly providerType: StorageAdapterType;
  uploadObject(key: string, data: ArrayBuffer | Uint8Array | string, mimeType: string): Promise<{
    storageKey: string;
    sizeBytes: number;
    checksumSha256: string;
  }>;
  downloadObject(key: string): Promise<ArrayBuffer | null>;
  deleteObject(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  getChecksum(key: string): Promise<string | null>;
}

/**
 * Composite Container for all Core Repositories
 */
export interface CoreRepositoryRegistry {
  readonly mode: PersistenceMode;
  readonly projects: ProjectRepository;
  readonly applications: ApplicationRepository;
  readonly datasets: DatasetRepository;
  readonly revisions: RevisionRepository;
  readonly transfers: TransferRepository;
  readonly validations: ValidationRepository;
  readonly audit: AuditRepository;
  readonly files: FileRepository;
  readonly storage: ObjectStorageAdapter;
}
