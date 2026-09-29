/**
 * EV Software Core - Storage Abstraction Types
 * Decouples relational metadata from binary/object storage.
 */

export type StorageAdapterType = 'memory' | 'indexed_db' | 's3_compatible' | 'gcs' | 'local_filesystem';

export interface FileReference {
  fileId: string;
  projectId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
  storageProvider: StorageAdapterType;
  storageKey: string;
  downloadUrl?: string;
  datasetId?: string;
  revisionId?: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
}

export type StorageObjectMetadata = FileReference;

export interface StorageStats {
  provider: StorageAdapterType;
  totalObjects: number;
  totalBytes: number;
  availableCapacityBytes?: number;
  healthy: boolean;
  lastPingMs: number;
}
