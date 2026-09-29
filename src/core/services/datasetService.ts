/**
 * EV Software Core - Dataset and Revision Service
 * Enforces immutable revision history, computes SHA-256 payload checksums,
 * and maintains parent-child revision lineages.
 */

import { Dataset, DatasetRevision, GenericDatasetPayload } from '../../types/dataset';
import { ChecksumEngine } from '../crypto/checksum';

export class DatasetService {
  /**
   * Generates a genuine cryptographic SHA-256 checksum for payload reproducibility and integrity verification.
   */
  public static computeChecksum(payload: GenericDatasetPayload): string {
    return ChecksumEngine.computeSha256Sync(payload);
  }

  /**
   * Creates a new immutable revision linked to parent revision
   */
  public static createRevision(params: {
    datasetId: string;
    parentRevision: DatasetRevision | null;
    sourceApplicationId: string;
    schemaVersion: string;
    createdBy: string;
    changeSummary: string;
    payload: GenericDatasetPayload;
    validationState?: 'validated' | 'warning' | 'unvalidated';
  }): DatasetRevision {
    const nextRevisionNumber = params.parentRevision ? params.parentRevision.revisionNumber + 1 : 1;
    const revisionId = `rev-${params.sourceApplicationId.replace('app-', '')}-${Date.now().toString(36).slice(-4)}-${nextRevisionNumber.toString().padStart(3, '0')}`;
    const checksum = this.computeChecksum(params.payload);

    return {
      revisionId,
      datasetId: params.datasetId,
      revisionNumber: nextRevisionNumber,
      parentRevisionId: params.parentRevision ? params.parentRevision.revisionId : null,
      sourceApplicationId: params.sourceApplicationId,
      schemaVersion: params.schemaVersion,
      createdBy: params.createdBy,
      createdAt: new Date().toISOString(),
      changeSummary: params.changeSummary,
      validationState: params.validationState || 'validated',
      payloadChecksum: checksum,
      payload: params.payload,
    };
  }
}
