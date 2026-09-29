/**
 * EV Software Core - Three-Way Conflict Detection Engine
 * Compares BASE revision vs CURRENT TARGET dataset vs INCOMING SOURCE transfer package.
 * Detects structural and engineering property conflicts without silent auto-resolution.
 */

import { GISDatasetPayload, PipelineGeometryItem } from '../../types/dataset';
import {
  ConflictResolutionStrategy,
  ConflictStatus,
  ThreeWayDiffReport,
  ThreeWayEntityDiff,
  ThreeWayFieldDiff,
  TransferDiff,
  TransferDiffItem,
  TransferPackage,
} from '../../types/transfer';

export class ThreeWayDiffEngine {
  /**
   * Deep equality check for values (handles primitives, arrays, and objects)
   */
  private static areEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null || a === undefined || b === undefined) return a === b;
    if (typeof a !== typeof b) return false;
    if (typeof a === 'object') {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return false;
  }

  /**
   * Determine the 3-way conflict status for a specific property
   */
  public static evaluateFieldStatus(baseVal: unknown, targetVal: unknown, incomingVal: unknown): ConflictStatus {
    const baseEqualsTarget = this.areEqual(baseVal, targetVal);
    const baseEqualsIncoming = this.areEqual(baseVal, incomingVal);
    const targetEqualsIncoming = this.areEqual(targetVal, incomingVal);

    if (baseEqualsTarget && baseEqualsIncoming) {
      return 'NO_CHANGE';
    }
    if (baseEqualsTarget && !baseEqualsIncoming) {
      return 'SOURCE_MODIFIED';
    }
    if (!baseEqualsTarget && baseEqualsIncoming) {
      return 'TARGET_MODIFIED';
    }
    if (!baseEqualsTarget && targetEqualsIncoming) {
      return 'IDENTICAL_MODIFICATION';
    }
    // Both target and incoming modified, but to different values -> True 3-Way Conflict!
    return 'THREE_WAY_CONFLICT';
  }

  /**
   * Compute comprehensive 3-way diff between base, current target, and incoming source
   */
  public static computeThreeWayDiff(params: {
    baseElements: PipelineGeometryItem[];
    targetElements: PipelineGeometryItem[];
    incomingElements: PipelineGeometryItem[];
  }): ThreeWayDiffReport {
    const baseMap = new Map(params.baseElements.map((e) => [e.id, e]));
    const targetMap = new Map(params.targetElements.map((e) => [e.id, e]));
    const incomingMap = new Map(params.incomingElements.map((e) => [e.id, e]));

    const allEntityIds = new Set<string>([
      ...baseMap.keys(),
      ...targetMap.keys(),
      ...incomingMap.keys(),
    ]);

    const entityDiffs: ThreeWayEntityDiff[] = [];
    let conflictsCount = 0;
    let sourceOnlyChangesCount = 0;
    let targetOnlyChangesCount = 0;
    let identicalChangesCount = 0;

    for (const id of allEntityIds) {
      const base = baseMap.get(id);
      const target = targetMap.get(id);
      const incoming = incomingMap.get(id);

      const fieldDiffs: ThreeWayFieldDiff[] = [];
      let entityHasConflict = false;

      // Determine changeType
      let changeType: 'added' | 'modified' | 'deleted' | 'unchanged' = 'unchanged';
      if (!base && (target || incoming)) {
        changeType = 'added';
      } else if (base && !incoming && !target) {
        changeType = 'deleted';
      } else if (base) {
        changeType = 'modified';
      }

      // Properties to compare for engineering pipelines
      const propertiesToCompare: (keyof PipelineGeometryItem)[] = [
        'name',
        'diameterMm',
        'material',
        'lengthM',
        'nominalPressureBar',
        'startCoords',
        'endCoords',
        'invertElevationM',
        'status',
      ];

      for (const prop of propertiesToCompare) {
        const baseVal = base ? base[prop] : undefined;
        const targetVal = target ? target[prop] : undefined;
        const incomingVal = incoming ? incoming[prop] : undefined;

        const status = this.evaluateFieldStatus(baseVal, targetVal, incomingVal);

        if (status !== 'NO_CHANGE') {
          const isConflict = status === 'THREE_WAY_CONFLICT';
          if (isConflict) {
            entityHasConflict = true;
          }

          if (status === 'SOURCE_MODIFIED') sourceOnlyChangesCount++;
          else if (status === 'TARGET_MODIFIED') targetOnlyChangesCount++;
          else if (status === 'IDENTICAL_MODIFICATION') identicalChangesCount++;
          else if (status === 'THREE_WAY_CONFLICT') conflictsCount++;

          fieldDiffs.push({
            fieldName: String(prop),
            baseValue: baseVal ?? null,
            currentTargetValue: targetVal ?? null,
            incomingSourceValue: incomingVal ?? null,
            conflictStatus: status,
            hasConflict: isConflict,
          });
        }
      }

      const entityName = incoming?.name || target?.name || base?.name || id;

      entityDiffs.push({
        entityId: id,
        entityName,
        changeType: fieldDiffs.length > 0 ? (changeType === 'unchanged' ? 'modified' : changeType) : 'unchanged',
        hasConflict: entityHasConflict,
        fieldDiffs,
      });
    }

    return {
      totalEntities: allEntityIds.size,
      conflictsCount,
      sourceOnlyChangesCount,
      targetOnlyChangesCount,
      identicalChangesCount,
      hasUnresolvedConflicts: conflictsCount > 0,
      entities: entityDiffs,
    };
  }

  /**
   * Apply explicit engineering conflict resolution
   */
  public static applyResolution(
    diffReport: ThreeWayDiffReport,
    entityId: string,
    fieldName: string,
    strategy: ConflictResolutionStrategy,
    manualValue?: unknown
  ): ThreeWayDiffReport {
    const updated = JSON.parse(JSON.stringify(diffReport)) as ThreeWayDiffReport;
    const entity = updated.entities.find((e) => e.entityId === entityId);
    if (!entity) return updated;

    const field = entity.fieldDiffs.find((f) => f.fieldName === fieldName);
    if (!field) return updated;

    field.resolutionStrategy = strategy;
    if (strategy === 'KEEP_CURRENT') {
      field.resolvedValue = field.currentTargetValue;
      field.hasConflict = false;
    } else if (strategy === 'ACCEPT_INCOMING') {
      field.resolvedValue = field.incomingSourceValue;
      field.hasConflict = false;
    } else if (strategy === 'MANUAL_RESOLVE') {
      field.resolvedValue = manualValue;
      field.hasConflict = false;
    } else if (strategy === 'REJECT') {
      field.resolvedValue = field.baseValue;
      field.hasConflict = false;
    }

    // Re-check entity conflict status
    entity.hasConflict = entity.fieldDiffs.some((f) => f.hasConflict);
    updated.conflictsCount = updated.entities.reduce(
      (acc, e) => acc + e.fieldDiffs.filter((f) => f.hasConflict).length,
      0
    );
    updated.hasUnresolvedConflicts = updated.conflictsCount > 0;

    return updated;
  }
}
