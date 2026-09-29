/**
 * EV Software Core - EV Application SDK Client Implementation
 * This class provides the standard contract consumed by all sibling engineering applications.
 */

import { ApplicationManifest } from '../types/application';
import { Project, User } from '../types/core';
import { Dataset, DatasetRevision, GenericDatasetPayload } from '../types/dataset';
import { FileReference } from '../types/storage';
import { Transfer, TransferState } from '../types/transfer';
import { ValidationResult } from '../types/validation';
import { CoreClientConfig, EVAppSDKInterface, SDKEventCallback } from '../types/sdk';
import { CoreTransport, HttpTransport, InMemoryTransport } from './transport';

export class EVCoreClient implements EVAppSDKInterface {
  private config: CoreClientConfig;
  private transport: CoreTransport;

  constructor(
    config: CoreClientConfig,
    coreContextAccessorOrTransport: (() => any) | CoreTransport
  ) {
    this.config = config;

    if (typeof coreContextAccessorOrTransport === 'function') {
      this.transport = new InMemoryTransport(coreContextAccessorOrTransport);
    } else {
      this.transport = coreContextAccessorOrTransport;
    }
  }

  public getTransport(): CoreTransport {
    return this.transport;
  }

  // --- Context ---
  public getCurrentUser(): User {
    // If transport is in-memory, we can query synchronous context
    if (this.transport instanceof InMemoryTransport) {
      const ctx = (this.transport as any).coreContextAccessor();
      return ctx.currentUser;
    }
    throw new Error('Asynchronous user context required for remote transport. Use async getUserContext().');
  }

  public getActiveProject(): Project | null {
    if (this.transport instanceof InMemoryTransport) {
      const ctx = (this.transport as any).coreContextAccessor();
      return ctx.activeProject;
    }
    return null;
  }

  public getApplicationManifest(): ApplicationManifest {
    if (this.transport instanceof InMemoryTransport) {
      const ctx = (this.transport as any).coreContextAccessor();
      const manifest = ctx.getApplication(this.config.appId);
      if (!manifest) {
        throw new Error(`Application '${this.config.appId}' is not registered in EV Software Core.`);
      }
      return manifest;
    }
    throw new Error('Synchronous application manifest only supported in InMemoryTransport mode.');
  }

  // --- Projects ---
  public async listProjects(): Promise<Project[]> {
    return this.transport.request<Project[]>('projects', 'list');
  }

  public async getProject(projectId: string): Promise<Project> {
    const proj = await this.transport.request<Project | null>('projects', 'get', { projectId });
    if (!proj) throw new Error(`Project '${projectId}' not found in Core.`);
    return proj;
  }

  // --- Datasets & Revisions ---
  public async getDatasetsByProject(projectId: string): Promise<Dataset[]> {
    return this.transport.request<Dataset[]>('datasets', 'listByProject', { projectId });
  }

  public async getDataset(datasetId: string): Promise<Dataset> {
    const ds = await this.transport.request<Dataset | null>('datasets', 'get', { datasetId });
    if (!ds) throw new Error(`Dataset '${datasetId}' not found in Core.`);
    return ds;
  }

  public async createDataset(params: {
    projectId: string;
    name: string;
    description: string;
    datasetType: Dataset['datasetType'];
    initialPayload: GenericDatasetPayload;
  }): Promise<{ dataset: Dataset; revision: DatasetRevision }> {
    return this.transport.request<{ dataset: Dataset; revision: DatasetRevision }>('datasets', 'create', {
      ...params,
      ownerApplicationId: this.config.appId,
    });
  }

  public async getRevisions(datasetId: string): Promise<DatasetRevision[]> {
    return this.transport.request<DatasetRevision[]>('revisions', 'listByDataset', { datasetId });
  }

  // --- Data Exchange / Transfers ---
  public async listTransfers(projectId: string): Promise<Transfer[]> {
    return this.transport.request<Transfer[]>('transfers', 'listByProject', { projectId });
  }

  public async getTransfer(transferId: string): Promise<Transfer> {
    const t = await this.transport.request<Transfer | null>('transfers', 'get', { transferId });
    if (!t) throw new Error(`Transfer '${transferId}' not found.`);
    return t;
  }

  public async initiateTransfer(params: {
    projectId: string;
    sourceDatasetId: string;
    destinationAppId: string;
    changeSummary: string;
    payload: GenericDatasetPayload;
    units: string;
    crs?: string;
  }): Promise<Transfer> {
    const trf = await this.transport.request<Transfer>('transfers', 'initiate', {
      projectId: params.projectId,
      sourceApplicationId: this.config.appId,
      destinationApplicationId: params.destinationAppId,
      sourceDatasetId: params.sourceDatasetId,
      changeSummary: params.changeSummary,
      payload: params.payload,
      units: params.units,
      crs: params.crs,
    });
    this.transport.emit('transfer:created', trf);
    return trf;
  }

  public async updateTransferState(
    transferId: string,
    newState: TransferState,
    metadata?: Record<string, unknown>
  ): Promise<Transfer> {
    const trf = await this.transport.request<Transfer>('transfers', 'advanceState', {
      transferId,
      newState,
      notes: metadata?.notes,
    });
    this.transport.emit('transfer:state_changed', { transferId, newState });
    return trf;
  }

  public async reviewTransfer(transferId: string, notes: string): Promise<Transfer> {
    const trf = await this.transport.request<Transfer>('transfers', 'review', { transferId, notes });
    this.transport.emit('transfer:reviewed', { transferId, notes });
    return trf;
  }

  public async validateTransfer(
    transferId: string
  ): Promise<{ transfer: Transfer; validation: ValidationResult }> {
    const res = await this.transport.request<{ transfer: Transfer; validation: ValidationResult }>(
      'transfers',
      'validate',
      { transferId }
    );
    this.transport.emit('transfer:validated', res);
    return res;
  }

  public async commitTransfer(
    transferId: string
  ): Promise<{ transfer: Transfer; newRevision: DatasetRevision }> {
    const res = await this.transport.request<{ transfer: Transfer; newRevision: DatasetRevision }>(
      'transfers',
      'commit',
      { transferId }
    );
    this.transport.emit('transfer:committed', res);
    return res;
  }

  public async rejectTransfer(transferId: string, reason: string): Promise<Transfer> {
    const trf = await this.transport.request<Transfer>('transfers', 'reject', { transferId, reason });
    this.transport.emit('transfer:rejected', { transferId, reason });
    return trf;
  }

  // --- Storage & Files ---
  public async listFiles(projectId: string): Promise<FileReference[]> {
    return this.transport.request<FileReference[]>('files', 'list', { projectId });
  }

  public async uploadFile(
    file: File,
    projectId: string,
    datasetId?: string
  ): Promise<FileReference> {
    return this.transport.request<FileReference>('files', 'upload', {
      projectId,
      datasetId,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      tags: ['sdk_upload', this.config.appId],
    });
  }

  // --- Event Pub/Sub ---
  public subscribe(eventType: string, callback: SDKEventCallback): () => void {
    return this.transport.subscribe(eventType, callback);
  }

  public emit(eventType: string, payload: unknown): void {
    this.transport.emit(eventType, payload);
  }
}
