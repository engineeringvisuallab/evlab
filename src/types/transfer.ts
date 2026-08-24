/**
 * EV Software Core - Data Exchange and Transfer Types
 * Manages explicit cross-application transfer lifecycle without silent mutation.
 */

import { GenericDatasetPayload } from './dataset';
import { ValidationResult } from './validation';

export type TransferState = 
  | 'prepared'   // Transfer package configured & initialized
  | 'sent'       // Dispatched to destination application
  | 'imported'   // Loaded into destination workspace session
  | 'reviewed'   // Inspected by engineer / designer
  | 'validated'  // Passed technical (and optional engineering) validation
  | 'committed'  // Explicitly merged, producing a new revision in destination/source
  | 'rejected'   // Explicitly declined with rationale
  | 'cancelled'; // Cancelled prior to commit

export type ConflictStatus =
  | 'NO_CHANGE'
  | 'SOURCE_MODIFIED'
  | 'TARGET_MODIFIED'
  | 'IDENTICAL_MODIFICATION'
  | 'THREE_WAY_CONFLICT';

export type ConflictResolutionStrategy =
  | 'KEEP_CURRENT'
  | 'ACCEPT_INCOMING'
  | 'MANUAL_RESOLVE'
  | 'REJECT'
  | 'CREATE_NEW_REVISION';

export interface ThreeWayFieldDiff {
  fieldName: string;
  baseValue: unknown;
  currentTargetValue: unknown;
  incomingSourceValue: unknown;
  conflictStatus: ConflictStatus;
  hasConflict: boolean;
  resolutionStrategy?: ConflictResolutionStrategy;
  resolvedValue?: unknown;
}

export interface ThreeWayEntityDiff {
  entityId: string;
  entityName: string;
  changeType: 'added' | 'modified' | 'deleted' | 'unchanged';
  hasConflict: boolean;
  fieldDiffs: ThreeWayFieldDiff[];
  resolution?: {
    strategy: ConflictResolutionStrategy;
    resolvedAt?: string;
    resolvedBy?: string;
    notes?: string;
  };
}

export interface ThreeWayDiffReport {
  totalEntities: number;
  conflictsCount: number;
  sourceOnlyChangesCount: number;
  targetOnlyChangesCount: number;
  identicalChangesCount: number;
  hasUnresolvedConflicts: boolean;
  entities: ThreeWayEntityDiff[];
}

export interface TransferDiffField {
  fieldName: string;
  originalValue: unknown;
  incomingValue: unknown;
  hasConflict: boolean;
}

export interface TransferDiffItem {
  entityId: string;
  entityName: string;
  changeType: 'added' | 'modified' | 'deleted' | 'unchanged';
  fieldChanges: TransferDiffField[];
}

export interface TransferDiff {
  totalChanges: number;
  addedCount: number;
  modifiedCount: number;
  deletedCount: number;
  hasConflicts: boolean;
  items: TransferDiffItem[];
  threeWayReport?: ThreeWayDiffReport;
}

export interface TransferPackage {
  transferId: string;
  sourceApplicationId: string;
  sourceApplicationVersion: string;
  destinationApplicationId: string;
  destinationApplicationVersion?: string;
  projectId: string;
  sourceDatasetId: string;
  sourceRevisionId: string;
  schemaVersion: string;
  coreApiVersion: string;
  units: string;
  crs?: string;
  changeSummary: string;
  payload: GenericDatasetPayload;
  timestamp: string;
  createdBy: string;
}

export interface Transfer {
  transferId: string;
  projectId: string;
  sourceApplicationId: string;
  destinationApplicationId: string;
  sourceDatasetId: string;
  sourceRevisionId: string;
  targetDatasetId?: string; // If updating an existing target dataset
  targetRevisionId?: string; // The newly produced revision upon commit
  state: TransferState;
  package: TransferPackage;
  diff?: TransferDiff;
  validationResult?: ValidationResult;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  committedBy?: string;
  committedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}
