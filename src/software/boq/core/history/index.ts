/**
 * EVLab BOQ - Audit & History Logger
 */

import { AuditEntry } from '../../types';

export function createAuditEntry(
  projectId: string,
  user: string,
  module: string,
  action: 'create' | 'update' | 'delete',
  field?: string,
  oldValue?: string,
  newValue?: string,
  notes?: string
): AuditEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    projectId,
    timestamp: new Date().toISOString(),
    user,
    module,
    action,
    field,
    oldValue,
    newValue,
    notes,
  };
}
