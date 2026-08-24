/**
 * EV Software Core - Audit Log Types
 * Immutable, tamper-evident audit record capturing who, what, when, where, and state diffs.
 */

export type AuditAction = 
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_MEMBER_ADDED'
  | 'APPLICATION_REGISTERED'
  | 'APPLICATION_UPDATED'
  | 'DATASET_CREATED'
  | 'DATASET_REVISION_COMMITTED'
  | 'TRANSFER_PREPARED'
  | 'TRANSFER_SENT'
  | 'TRANSFER_IMPORTED'
  | 'TRANSFER_REVIEWED'
  | 'TRANSFER_VALIDATED'
  | 'TRANSFER_COMMITTED'
  | 'TRANSFER_REJECTED'
  | 'FILE_UPLOADED'
  | 'FILE_DELETED'
  | 'TECHNICAL_VALIDATION_EXECUTED'
  | 'ENGINEERING_VALIDATION_EXECUTED'
  | 'CONFLICT_RESOLVED';

export type AuditEntityType = 
  | 'project'
  | 'application'
  | 'dataset'
  | 'revision'
  | 'transfer'
  | 'validation'
  | 'file'
  | 'user';

export interface AuditLogEntry {
  auditId: string;
  projectId?: string;
  projectName?: string;
  userId: string;
  userName: string;
  userRole?: string;
  applicationId?: string;
  applicationName?: string;
  applicationVersion?: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  timestamp: string;
  clientIp?: string;
  previousState?: unknown;
  newState?: unknown;
  metadata?: Record<string, unknown>;
  description: string;
}
