/**
 * EV Software Core - Transfer Engine (Data Exchange)
 * Implements the explicit transfer lifecycle:
 * Prepared -> Sent -> Imported -> Reviewed -> Validated -> Committed.
 * Calculates deep diffs and prevents silent mutations.
 */

import { Dataset, DatasetRevision, GISDatasetPayload, CADDatasetPayload } from '../../types/dataset';
import {
  Transfer,
  TransferDiff,
  TransferDiffItem,
  TransferPackage,
  TransferState,
} from '../../types/transfer';
import { ThreeWayDiffEngine } from '../diff/threeWayDiffEngine';
import { ValidationService } from './validationService';

export class InvalidTransferStateTransitionError extends Error {
  public readonly code = 'INVALID_TRANSFER_STATE_TRANSITION';
  public readonly currentState: TransferState;
  public readonly targetState: TransferState;

  constructor(currentState: TransferState, targetState: TransferState, reason?: string) {
    super(
      `Illegal Transfer Transition: Cannot advance transfer from state '${currentState}' to '${targetState}'. ${
        reason || 'Strict EV Software Core transfer lifecycle must be followed.'
      }`
    );
    this.name = 'InvalidTransferStateTransitionError';
    this.currentState = currentState;
    this.targetState = targetState;
  }
}

export class TransferEngine {
  /**
   * Allowed state transitions per the authoritative EV Software Core transfer lifecycle
   */
  public static readonly ALLOWED_TRANSITIONS: Record<TransferState, TransferState[]> = {
    prepared: ['sent', 'cancelled'],
    sent: ['imported', 'cancelled', 'rejected'],
    imported: ['reviewed', 'rejected', 'cancelled'],
    reviewed: ['validated', 'rejected', 'imported'],
    validated: ['committed', 'rejected', 'reviewed'],
    committed: [], // Terminal state
    rejected: ['prepared'], // Can be reopened as a new cycle
    cancelled: [], // Terminal state
  };

  /**
   * Validate state transition according to the strict state machine:
   * prepared -> sent -> imported -> reviewed -> validated -> committed
   */
  public static isValidTransition(currentState: TransferState, nextState: TransferState): boolean {
    return this.ALLOWED_TRANSITIONS[currentState]?.includes(nextState) ?? false;
  }

  /**
   * Authoritatively assert and validate whether a transfer state transition is permitted.
   */
  public static assertValidTransition(
    transfer: Transfer,
    targetState: TransferState,
    options?: { bypassValidationRequirement?: boolean }
  ): void {
    if (!this.isValidTransition(transfer.state, targetState)) {
      throw new InvalidTransferStateTransitionError(
        transfer.state,
        targetState,
        `Allowed next states from '${transfer.state}' are: [${(this.ALLOWED_TRANSITIONS[transfer.state] || []).join(', ')}]`
      );
    }

    // Additional prerequisite rules:
    if (targetState === 'committed') {
      if (transfer.state !== 'validated') {
        throw new InvalidTransferStateTransitionError(
          transfer.state,
          targetState,
          'Transfer must be in "validated" state before it can be committed into the authoritative dataset.'
        );
      }
      if (transfer.validationResult && transfer.validationResult.status === 'failed' && !options?.bypassValidationRequirement) {
        throw new InvalidTransferStateTransitionError(
          transfer.state,
          targetState,
          `Cannot commit transfer '${transfer.transferId}': Technical validation failed with ${transfer.validationResult.errors.length} critical errors.`
        );
      }
    }
  }

  /**
   * Compute structural diff between a base dataset and an incoming modified transfer package,
   * including 3-way conflict analysis.
   */
  public static computeDiff(
    baseRevision: DatasetRevision | null,
    incomingPackage: TransferPackage,
    currentTargetRevision?: DatasetRevision | null
  ): TransferDiff {
    const items: TransferDiffItem[] = [];
    let addedCount = 0;
    let modifiedCount = 0;
    let deletedCount = 0;
    let hasConflicts = false;

    if (!baseRevision) {
      // First revision or new dataset - all elements are added
      if ('elements' in incomingPackage.payload && Array.isArray((incomingPackage.payload as GISDatasetPayload).elements)) {
        const gis = incomingPackage.payload as GISDatasetPayload;
        for (const el of gis.elements) {
          addedCount++;
          items.push({
            entityId: el.id,
            entityName: el.name || el.id,
            changeType: 'added',
            fieldChanges: [
              { fieldName: 'diameterMm', originalValue: null, incomingValue: el.diameterMm, hasConflict: false },
              { fieldName: 'material', originalValue: null, incomingValue: el.material, hasConflict: false },
              { fieldName: 'lengthM', originalValue: null, incomingValue: el.lengthM, hasConflict: false },
            ],
          });
        }
      }
      return {
        totalChanges: addedCount,
        addedCount,
        modifiedCount: 0,
        deletedCount: 0,
        hasConflicts: false,
        items,
      };
    }

    // Compare GIS payload elements
    if (
      'elements' in baseRevision.payload &&
      'elements' in incomingPackage.payload
    ) {
      const baseElements = (baseRevision.payload as GISDatasetPayload).elements || [];
      const incomingElements = (incomingPackage.payload as GISDatasetPayload).elements || [];
      const targetElements = (currentTargetRevision?.payload as GISDatasetPayload)?.elements || baseElements;

      // Run 3-Way Diff
      const threeWayReport = ThreeWayDiffEngine.computeThreeWayDiff({
        baseElements,
        targetElements,
        incomingElements,
      });

      const baseMap = new Map(baseElements.map((e) => [e.id, e]));
      const incomingMap = new Map(incomingElements.map((e) => [e.id, e]));

      for (const [id, inc] of incomingMap.entries()) {
        const base = baseMap.get(id);
        if (!base) {
          addedCount++;
          items.push({
            entityId: inc.id,
            entityName: inc.name || inc.id,
            changeType: 'added',
            fieldChanges: [
              { fieldName: 'type', originalValue: null, incomingValue: inc.type, hasConflict: false },
              { fieldName: 'diameterMm', originalValue: null, incomingValue: inc.diameterMm, hasConflict: false },
              { fieldName: 'material', originalValue: null, incomingValue: inc.material, hasConflict: false },
            ],
          });
        } else {
          const fieldChanges = [];
          if (base.diameterMm !== inc.diameterMm) {
            fieldChanges.push({
              fieldName: 'diameterMm',
              originalValue: base.diameterMm,
              incomingValue: inc.diameterMm,
              hasConflict: false,
            });
          }
          if (base.material !== inc.material) {
            fieldChanges.push({
              fieldName: 'material',
              originalValue: base.material,
              incomingValue: inc.material,
              hasConflict: false,
            });
          }
          if (base.name !== inc.name) {
            fieldChanges.push({
              fieldName: 'name',
              originalValue: base.name,
              incomingValue: inc.name,
              hasConflict: false,
            });
          }
          if (
            base.startCoords[0] !== inc.startCoords[0] ||
            base.startCoords[1] !== inc.startCoords[1] ||
            base.endCoords[0] !== inc.endCoords[0] ||
            base.endCoords[1] !== inc.endCoords[1]
          ) {
            fieldChanges.push({
              fieldName: 'coordinates',
              originalValue: `[${base.startCoords.join(',')}] → [${base.endCoords.join(',')}]`,
              incomingValue: `[${inc.startCoords.join(',')}] → [${inc.endCoords.join(',')}]`,
              hasConflict: false,
            });
          }

          if (fieldChanges.length > 0) {
            modifiedCount++;
            items.push({
              entityId: inc.id,
              entityName: inc.name,
              changeType: 'modified',
              fieldChanges,
            });
          }
        }
      }

      for (const [id, base] of baseMap.entries()) {
        if (!incomingMap.has(id)) {
          deletedCount++;
          items.push({
            entityId: base.id,
            entityName: base.name,
            changeType: 'deleted',
            fieldChanges: [],
          });
        }
      }

      return {
        totalChanges: addedCount + modifiedCount + deletedCount,
        addedCount,
        modifiedCount,
        deletedCount,
        hasConflicts: threeWayReport.hasUnresolvedConflicts,
        items,
        threeWayReport,
      };
    }

    return {
      totalChanges: 0,
      addedCount: 0,
      modifiedCount: 0,
      deletedCount: 0,
      hasConflicts: false,
      items: [],
    };
  }
}
