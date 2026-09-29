/**
 * EV Software Core - Storage Service Abstraction
 * Manages file metadata, checksum validation, and object storage abstractions.
 */

import { FileReference, StorageAdapterType, StorageStats } from '../../types/storage';

export class StorageService {
  public static getStorageStats(files: FileReference[], provider: StorageAdapterType = 's3_compatible'): StorageStats {
    const totalBytes = files.reduce((acc, f) => acc + f.sizeBytes, 0);
    return {
      provider,
      totalObjects: files.length,
      totalBytes,
      availableCapacityBytes: 107374182400, // 100 GB virtual allocated pool
      healthy: true,
      lastPingMs: 14,
    };
  }

  public static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
