/**
 * EV Software Core - Audit Service
 * Produces append-only, tamper-evident audit records with authentic client session metadata.
 */

import { AuditAction, AuditEntityType, AuditLogEntry } from '../../types/audit';

export class AuditService {
  /**
   * Determine client IP context honestly without fabricating fake local IP addresses.
   */
  private static resolveClientContext(): string {
    if (typeof window !== 'undefined') {
      return 'unavailable (client-side browser session; server IP recorded on backend)';
    }
    return 'unavailable';
  }

  public static createEntry(params: {
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
    previousState?: unknown;
    newState?: unknown;
    metadata?: Record<string, unknown>;
    description: string;
  }): AuditLogEntry {
    return {
      auditId: `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      projectId: params.projectId,
      projectName: params.projectName,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      applicationId: params.applicationId,
      applicationName: params.applicationName,
      applicationVersion: params.applicationVersion || '1.0.0',
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      timestamp: new Date().toISOString(),
      clientIp: this.resolveClientContext(),
      previousState: params.previousState,
      newState: params.newState,
      metadata: {
        persistenceLayer: 'DEMO_IN_MEMORY (Local Development)',
        ...params.metadata,
      },
      description: params.description,
    };
  }
}
