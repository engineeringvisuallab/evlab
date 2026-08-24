/**
 * EV Software Core - Project Service
 * Handles project hierarchy, contextual isolation, and role authorization.
 */

import { Project, ProjectMember, ProjectStatus, ProjectType, UserRole } from '../../types/core';

export class ProjectService {
  /**
   * Check if a member role has permission to execute an action
   */
  public static hasRolePermission(role: UserRole, action: string): boolean {
    const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
      owner: ['*'],
      admin: ['*'],
      lead_engineer: [
        'project:read', 'project:edit', 'project:manage',
        'dataset:create', 'dataset:read', 'dataset:edit',
        'transfer:create', 'transfer:review', 'transfer:validate', 'transfer:commit', 'transfer:reject',
        'revision:create', 'audit:read', 'storage:upload'
      ],
      engineer: [
        'project:read', 'project:edit',
        'dataset:create', 'dataset:read', 'dataset:edit',
        'transfer:create', 'transfer:review', 'transfer:validate',
        'revision:create', 'audit:read', 'storage:upload'
      ],
      designer: [
        'project:read',
        'dataset:read', 'dataset:edit',
        'transfer:create', 'transfer:review',
        'storage:upload'
      ],
      reviewer: [
        'project:read',
        'dataset:read',
        'transfer:review', 'transfer:validate', 'transfer:commit', 'transfer:reject',
        'audit:read'
      ],
      viewer: [
        'project:read',
        'dataset:read',
        'audit:read'
      ],
    };

    const allowed = ROLE_PERMISSIONS[role] || [];
    return allowed.includes('*') || allowed.includes(action);
  }
}
