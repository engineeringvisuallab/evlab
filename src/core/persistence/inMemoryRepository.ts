/**
 * EV Software Core - In-Memory Persistence & Storage Adapter
 * Provides local development and GitHub preview execution while adhering
 * to strict repository and object storage interfaces.
 */

import { ApplicationManifest, ApplicationRegistrationPayload } from '../../types/application';
import { AuditLogEntry } from '../../types/audit';
import { Project } from '../../types/core';
import { Dataset, DatasetRevision } from '../../types/dataset';
import { FileReference, StorageAdapterType } from '../../types/storage';
import { Transfer } from '../../types/transfer';
import { ValidationResult } from '../../types/validation';
import { ChecksumEngine } from '../crypto/checksum';
import {
  ApplicationRepository,
  AuditRepository,
  CoreRepositoryRegistry,
  DatasetRepository,
  FileRepository,
  ObjectStorageAdapter,
  PersistenceMode,
  ProjectRepository,
  RevisionRepository,
  TransferRepository,
  ValidationRepository,
} from './interfaces';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_DATASET_REVISIONS,
  INITIAL_DATASETS,
  INITIAL_FILES,
  INITIAL_PROJECTS,
  INITIAL_TRANSFERS,
  REGISTERED_APPLICATIONS,
} from '../store/initialData';
import { ApplicationRegistryService } from '../services/applicationRegistryService';

export class InMemoryProjectRepository implements ProjectRepository {
  private items: Map<string, Project> = new Map();

  constructor(initialData: Project[] = INITIAL_PROJECTS) {
    initialData.forEach((p) => this.items.set(p.projectId, JSON.parse(JSON.stringify(p))));
  }

  public async findById(projectId: string): Promise<Project | null> {
    const proj = this.items.get(projectId);
    return proj ? JSON.parse(JSON.stringify(proj)) : null;
  }

  public async findAll(): Promise<Project[]> {
    return Array.from(this.items.values()).map((p) => JSON.parse(JSON.stringify(p)));
  }

  public async create(project: Project): Promise<Project> {
    this.items.set(project.projectId, JSON.parse(JSON.stringify(project)));
    return JSON.parse(JSON.stringify(project));
  }

  public async update(projectId: string, updates: Partial<Project>): Promise<Project> {
    const existing = this.items.get(projectId);
    if (!existing) throw new Error(`Project '${projectId}' not found in repository.`);
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.items.set(projectId, updated);
    return JSON.parse(JSON.stringify(updated));
  }

  public async delete(projectId: string): Promise<boolean> {
    return this.items.delete(projectId);
  }
}

export class InMemoryApplicationRepository implements ApplicationRepository {
  private items: Map<string, ApplicationManifest> = new Map();

  constructor(initialData: ApplicationManifest[] = REGISTERED_APPLICATIONS) {
    initialData.forEach((a) => this.items.set(a.appId, JSON.parse(JSON.stringify(a))));
  }

  public async findById(appId: string): Promise<ApplicationManifest | null> {
    const app = this.items.get(appId);
    return app ? JSON.parse(JSON.stringify(app)) : null;
  }

  public async findAll(): Promise<ApplicationManifest[]> {
    return Array.from(this.items.values()).map((a) => JSON.parse(JSON.stringify(a)));
  }

  public async register(payload: ApplicationRegistrationPayload): Promise<ApplicationManifest> {
    const registered = ApplicationRegistryService.registerApplication(payload);
    this.items.set(registered.appId, JSON.parse(JSON.stringify(registered)));
    return registered;
  }

  public async updateStatus(
    appId: string,
    status: ApplicationManifest['releaseStatus']
  ): Promise<ApplicationManifest> {
    const existing = this.items.get(appId);
    if (!existing) throw new Error(`Application '${appId}' not registered.`);
    existing.releaseStatus = status;
    this.items.set(appId, existing);
    return JSON.parse(JSON.stringify(existing));
  }
}

export class InMemoryDatasetRepository implements DatasetRepository {
  private items: Map<string, Dataset> = new Map();

  constructor(initialData: Dataset[] = INITIAL_DATASETS) {
    initialData.forEach((d) => this.items.set(d.datasetId, JSON.parse(JSON.stringify(d))));
  }

  public async findById(datasetId: string): Promise<Dataset | null> {
    const ds = this.items.get(datasetId);
    return ds ? JSON.parse(JSON.stringify(ds)) : null;
  }

  public async findByProject(projectId: string): Promise<Dataset[]> {
    return Array.from(this.items.values())
      .filter((d) => d.projectId === projectId)
      .map((d) => JSON.parse(JSON.stringify(d)));
  }

  public async create(dataset: Dataset): Promise<Dataset> {
    this.items.set(dataset.datasetId, JSON.parse(JSON.stringify(dataset)));
    return JSON.parse(JSON.stringify(dataset));
  }

  public async update(datasetId: string, updates: Partial<Dataset>): Promise<Dataset> {
    const existing = this.items.get(datasetId);
    if (!existing) throw new Error(`Dataset '${datasetId}' not found.`);
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.items.set(datasetId, updated);
    return JSON.parse(JSON.stringify(updated));
  }

  public async delete(datasetId: string): Promise<boolean> {
    return this.items.delete(datasetId);
  }
}

export class InMemoryRevisionRepository implements RevisionRepository {
  private items: Map<string, DatasetRevision> = new Map();

  constructor(initialData: DatasetRevision[] = INITIAL_DATASET_REVISIONS) {
    initialData.forEach((r) => this.items.set(r.revisionId, JSON.parse(JSON.stringify(r))));
  }

  public async findById(revisionId: string): Promise<DatasetRevision | null> {
    const r = this.items.get(revisionId);
    return r ? JSON.parse(JSON.stringify(r)) : null;
  }

  public async findByDataset(datasetId: string): Promise<DatasetRevision[]> {
    return Array.from(this.items.values())
      .filter((r) => r.datasetId === datasetId)
      .sort((a, b) => b.revisionNumber - a.revisionNumber)
      .map((r) => JSON.parse(JSON.stringify(r)));
  }

  public async getLatestForDataset(datasetId: string): Promise<DatasetRevision | null> {
    const list = await this.findByDataset(datasetId);
    return list.length > 0 ? list[0] : null;
  }

  public async create(revision: DatasetRevision): Promise<DatasetRevision> {
    this.items.set(revision.revisionId, JSON.parse(JSON.stringify(revision)));
    return JSON.parse(JSON.stringify(revision));
  }
}

export class InMemoryTransferRepository implements TransferRepository {
  private items: Map<string, Transfer> = new Map();

  constructor(initialData: Transfer[] = INITIAL_TRANSFERS) {
    initialData.forEach((t) => this.items.set(t.transferId, JSON.parse(JSON.stringify(t))));
  }

  public async findById(transferId: string): Promise<Transfer | null> {
    const t = this.items.get(transferId);
    return t ? JSON.parse(JSON.stringify(t)) : null;
  }

  public async findByProject(projectId: string): Promise<Transfer[]> {
    return Array.from(this.items.values())
      .filter((t) => t.projectId === projectId)
      .map((t) => JSON.parse(JSON.stringify(t)));
  }

  public async create(transfer: Transfer): Promise<Transfer> {
    this.items.set(transfer.transferId, JSON.parse(JSON.stringify(transfer)));
    return JSON.parse(JSON.stringify(transfer));
  }

  public async update(transferId: string, updates: Partial<Transfer>): Promise<Transfer> {
    const existing = this.items.get(transferId);
    if (!existing) throw new Error(`Transfer '${transferId}' not found.`);
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.items.set(transferId, updated);
    return JSON.parse(JSON.stringify(updated));
  }

  public async delete(transferId: string): Promise<boolean> {
    return this.items.delete(transferId);
  }
}

export class InMemoryValidationRepository implements ValidationRepository {
  private items: Map<string, ValidationResult> = new Map();

  constructor(initialResults: ValidationResult[] = []) {
    initialResults.forEach((r) => this.items.set(r.validationId, JSON.parse(JSON.stringify(r))));
  }

  public async saveResult(result: ValidationResult): Promise<ValidationResult> {
    this.items.set(result.validationId, JSON.parse(JSON.stringify(result)));
    return JSON.parse(JSON.stringify(result));
  }

  public async findById(validationId: string): Promise<ValidationResult | null> {
    const v = this.items.get(validationId);
    return v ? JSON.parse(JSON.stringify(v)) : null;
  }

  public async findByTarget(targetEntityId: string): Promise<ValidationResult[]> {
    return Array.from(this.items.values())
      .filter((v) => v.entityId === targetEntityId)
      .sort((a, b) => new Date(b.validatedAt).getTime() - new Date(a.validatedAt).getTime())
      .map((v) => JSON.parse(JSON.stringify(v)));
  }

  public async getLatestForTarget(targetEntityId: string): Promise<ValidationResult | null> {
    const list = await this.findByTarget(targetEntityId);
    return list.length > 0 ? list[0] : null;
  }
}

export class InMemoryAuditRepository implements AuditRepository {
  private logs: AuditLogEntry[] = [];

  constructor(initialData: AuditLogEntry[] = INITIAL_AUDIT_LOGS) {
    this.logs = initialData.map((l) => JSON.parse(JSON.stringify(l)));
  }

  public async append(entry: AuditLogEntry): Promise<AuditLogEntry> {
    this.logs.unshift(JSON.parse(JSON.stringify(entry)));
    return JSON.parse(JSON.stringify(entry));
  }

  public async query(filters: {
    projectId?: string;
    userId?: string;
    applicationId?: string;
    entityType?: string;
    entityId?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    let result = this.logs;
    if (filters.projectId) result = result.filter((l) => l.projectId === filters.projectId);
    if (filters.userId) result = result.filter((l) => l.userId === filters.userId);
    if (filters.applicationId) result = result.filter((l) => l.applicationId === filters.applicationId);
    if (filters.entityType) result = result.filter((l) => l.entityType === filters.entityType);
    if (filters.entityId) result = result.filter((l) => l.entityId === filters.entityId);

    const limit = filters.limit || 100;
    return result.slice(0, limit).map((l) => JSON.parse(JSON.stringify(l)));
  }

  public async count(): Promise<number> {
    return this.logs.length;
  }
}

export class InMemoryFileRepository implements FileRepository {
  private items: Map<string, FileReference> = new Map();

  constructor(initialData: FileReference[] = INITIAL_FILES) {
    initialData.forEach((f) => this.items.set(f.fileId, JSON.parse(JSON.stringify(f))));
  }

  public async saveMetadata(fileRef: FileReference): Promise<FileReference> {
    this.items.set(fileRef.fileId, JSON.parse(JSON.stringify(fileRef)));
    return JSON.parse(JSON.stringify(fileRef));
  }

  public async findById(fileId: string): Promise<FileReference | null> {
    const f = this.items.get(fileId);
    return f ? JSON.parse(JSON.stringify(f)) : null;
  }

  public async findByProject(projectId: string): Promise<FileReference[]> {
    return Array.from(this.items.values())
      .filter((f) => f.projectId === projectId)
      .map((f) => JSON.parse(JSON.stringify(f)));
  }

  public async delete(fileId: string): Promise<boolean> {
    return this.items.delete(fileId);
  }
}

export class InMemoryObjectStorageAdapter implements ObjectStorageAdapter {
  public readonly providerType: StorageAdapterType = 'memory';
  private storagePool: Map<string, { buffer: ArrayBuffer; mimeType: string; sha256: string }> = new Map();

  public async uploadObject(
    key: string,
    data: ArrayBuffer | Uint8Array | string,
    mimeType: string
  ): Promise<{ storageKey: string; sizeBytes: number; checksumSha256: string }> {
    let buffer: ArrayBuffer;
    if (typeof data === 'string') {
      const encoder = new TextEncoder();
      buffer = encoder.encode(data).buffer as ArrayBuffer;
    } else if (data instanceof Uint8Array) {
      buffer = data.buffer as ArrayBuffer;
    } else {
      buffer = data;
    }

    const sha256 = await ChecksumEngine.computeSha256(buffer);
    this.storagePool.set(key, { buffer, mimeType, sha256 });

    return {
      storageKey: key,
      sizeBytes: buffer.byteLength,
      checksumSha256: sha256,
    };
  }

  public async downloadObject(key: string): Promise<ArrayBuffer | null> {
    const item = this.storagePool.get(key);
    return item ? item.buffer : null;
  }

  public async deleteObject(key: string): Promise<boolean> {
    return this.storagePool.delete(key);
  }

  public async exists(key: string): Promise<boolean> {
    return this.storagePool.has(key);
  }

  public async getChecksum(key: string): Promise<string | null> {
    const item = this.storagePool.get(key);
    return item ? item.sha256 : null;
  }
}

/**
 * Default Singleton In-Memory Registry for EV Software Core runtime
 */
export class InMemoryCoreRepositories implements CoreRepositoryRegistry {
  public readonly mode: PersistenceMode = 'DEMO_IN_MEMORY';
  public readonly projects: InMemoryProjectRepository;
  public readonly applications: InMemoryApplicationRepository;
  public readonly datasets: InMemoryDatasetRepository;
  public readonly revisions: InMemoryRevisionRepository;
  public readonly transfers: InMemoryTransferRepository;
  public readonly validations: InMemoryValidationRepository;
  public readonly audit: InMemoryAuditRepository;
  public readonly files: InMemoryFileRepository;
  public readonly storage = new InMemoryObjectStorageAdapter();

  constructor(initialData?: {
    projects?: Project[];
    applications?: ApplicationManifest[];
    datasets?: Dataset[];
    revisions?: DatasetRevision[];
    transfers?: Transfer[];
    validationResults?: ValidationResult[];
    auditLogs?: AuditLogEntry[];
    files?: FileReference[];
  }) {
    this.projects = new InMemoryProjectRepository(initialData?.projects);
    this.applications = new InMemoryApplicationRepository(initialData?.applications);
    this.datasets = new InMemoryDatasetRepository(initialData?.datasets);
    this.revisions = new InMemoryRevisionRepository(initialData?.revisions);
    this.transfers = new InMemoryTransferRepository(initialData?.transfers);
    this.validations = new InMemoryValidationRepository(initialData?.validationResults);
    this.audit = new InMemoryAuditRepository(initialData?.auditLogs);
    this.files = new InMemoryFileRepository(initialData?.files);
  }
}
