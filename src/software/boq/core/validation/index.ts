/**
 * EVLab BOQ - Validation Engine
 * Validates engineering integrity across BOQ, Takeoff, Rates, and Measurements.
 */

import { BOQItem, ValidationIssue, WBSNode, Project } from '../../types';

export function validateProjectData(
  project: Project | null,
  boqItems: BOQItem[],
  wbsNodes: WBSNode[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!project) {
    issues.push({
      id: 'no-project',
      module: 'Projects',
      severity: 'error',
      message: 'No active project selected.',
    });
    return issues;
  }

  // Check project basic info
  if (!project.name || project.name.trim() === '') {
    issues.push({
      id: 'prj-name-missing',
      module: 'Project Settings',
      severity: 'error',
      message: 'Project name is required.',
      field: 'name',
    });
  }

  const seenItemCodes = new Set<string>();

  for (const item of boqItems) {
    if (item.isHeader) continue;

    // Check duplicate item code
    if (item.itemCode) {
      if (seenItemCodes.has(item.itemCode)) {
        issues.push({
          id: `dup-${item.id}`,
          itemId: item.id,
          itemCode: item.itemCode,
          module: 'BOQ Builder',
          severity: 'warning',
          message: `Duplicate item code: ${item.itemCode}`,
          field: 'itemCode',
        });
      } else {
        seenItemCodes.add(item.itemCode);
      }
    }

    // Negative Quantity
    if (item.quantity < 0) {
      issues.push({
        id: `neg-qty-${item.id}`,
        itemId: item.id,
        itemCode: item.itemCode,
        module: 'BOQ Builder',
        severity: 'error',
        message: `Item ${item.itemCode || item.description} has negative quantity (${item.quantity}).`,
        field: 'quantity',
      });
    }

    // Missing Unit
    if (!item.unit || item.unit.trim() === '') {
      issues.push({
        id: `missing-unit-${item.id}`,
        itemId: item.id,
        itemCode: item.itemCode,
        module: 'BOQ Builder',
        severity: 'warning',
        message: `Item ${item.itemCode || item.description} has missing unit.`,
        field: 'unit',
      });
    }

    // Missing Rate
    if (item.rate === 0 || item.rate === null || item.rate === undefined) {
      issues.push({
        id: `zero-rate-${item.id}`,
        itemId: item.id,
        itemCode: item.itemCode,
        module: 'Rate Analysis',
        severity: 'info',
        message: `Item ${item.itemCode || item.description} has zero unit rate.`,
        field: 'rate',
      });
    }

    // Unlinked WBS Code
    if (item.wbsCode) {
      const parentWbs = wbsNodes.find((w) => w.code === item.wbsCode);
      if (!parentWbs) {
        issues.push({
          id: `unlinked-wbs-${item.id}`,
          itemId: item.id,
          itemCode: item.itemCode,
          module: 'BOQ Builder',
          severity: 'warning',
          message: `Item ${item.itemCode} points to non-existent WBS code ${item.wbsCode}.`,
          field: 'wbsCode',
        });
      }
    }
  }

  return issues;
}
