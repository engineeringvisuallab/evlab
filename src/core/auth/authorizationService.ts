/**
 * EV Software Core - Central Authorization & RBAC Service
 * Enforces strict role-based access control and application capability boundaries
 * at the service and API perimeter before any protected mutation executes.
 */

import { Project, User, UserRole } from '../../types/core';

export type ProtectedAction =
  | 'project:create'
  | 'project:edit'
  | 'project:delete'
  | 'project:manage_members'
  | 'dataset:create'
  | 'dataset:edit'
  | 'dataset:delete'
  | 'revision:create'
  | 'transfer:initiate'
  | 'transfer:advance'
  | 'transfer:review'
  | 'transfer:validate'
  | 'transfer:commit'
  | 'transfer:reject'
  | 'file:upload'
  | 'file:delete'
  | 'app:register'
  | 'app:manage';

export interface AuthContext {
  user: User;
  project?: Project | null;
  applicationId?: string;
}

export interface AuthDecision {
  authorized: boolean;
  reason?: string;
  effectiveRole: UserRole;
}

export class AuthorizationError extends Error {
  public readonly code = 'FORBIDDEN';
  public readonly action: ProtectedAction;
  public readonly userId: string;

  constructor(action: ProtectedAction, userId: string, reason: string) {
    super(`Access Denied: User '${userId}' is not authorized to perform '${action}'. Reason: ${reason}`);
    this.name = 'AuthorizationError';
    this.action = action;
    this.userId = userId;
  }
}

export class AuthorizationService {
  /**
   * Determine the user's effective role within the given project context.
   */
  public static getEffectiveRole(user: User, project?: Project | null): UserRole {
    if (!project) return user.defaultRole;
    const member = project.members.find((m) => m.userId === user.userId);
    return member ? member.role : user.defaultRole;
  }

  /**
   * Check if user possesses permission to execute the specified action.
   */
  public static checkPermission(context: AuthContext, action: ProtectedAction): AuthDecision {
    const { user, project } = context;
    const effectiveRole = this.getEffectiveRole(user, project);

    // Global admin / owner has unrestricted access
    if (effectiveRole === 'owner' || effectiveRole === 'admin') {
      return { authorized: true, effectiveRole };
    }

    // Role-based permission matrix
    switch (action) {
      case 'project:create':
        if (['owner', 'admin', 'lead_engineer'].includes(effectiveRole)) {
          return { authorized: true, effectiveRole };
        }
        return { authorized: false, effectiveRole, reason: 'Creating new engineering projects requires Lead Engineer or Admin role.' };

      case 'project:edit':
      case 'project:manage_members':
        if (['owner', 'admin', 'lead_engineer'].includes(effectiveRole)) {
          return { authorized: true, effectiveRole };
        }
        return { authorized: false, effectiveRole, reason: 'Project administration requires Lead Engineer or Admin role.' };

      case 'project:delete':
        if (['owner', 'admin'].includes(effectiveRole)) {
          return { authorized: true, effectiveRole };
        }
        return { authorized: false, effectiveRole, reason: 'Deleting projects requires Organization Owner or Admin role.' };

      case 'dataset:create':
      case 'dataset:edit':
      case 'revision:create':
        if (['owner', 'admin', 'lead_engineer', 'engineer'].includes(effectiveRole)) {
          return { authorized: true, effectiveRole };
        }
        return { authorized: false, effectiveRole, reason: 'Dataset modification requires Engineer or higher privileges.' };

      case 'dataset:delete':
        if (['owner', 'admin', 'lead_engineer'].includes(effectiveRole)) {
          return { authorized: true, effectiveRole };
        }
        return { authorized: false, effectiveRole, reason: 'Deleting datasets requires Lead Engineer or Admin role.' };

      case 'transfer:initiate':
      case 'transfer:advance':
        if (['owner', 'admin', 'lead_engineer', 'engineer'].includes(effectiveRole)) {
          return { authorized: true, effectiveRole };
        }
        return { authorized: false, effectiveRole, reason: 'Data exchange transfers require Engineer or higher privileges.' };

      case 'transfer:review':
      case 'transfer:validate':
        if (['owner', 'admin', 'lead_engineer', 'engineer'].includes(effectiveRole)) {
          return { authorized: true, effectiveRole };
        }
        return { authorized: false, effectiveRole, reason: 'Reviewing transfers requires Engineer or higher privileges.' };

      case 'transfer:commit':
        // Committing transfers modifies authoritative source datasets
        if (['owner', 'admin', 'lead_engineer'].includes(effectiveRole)) {
          return { authorized: true, effectiveRole };
        }
        return {
          authorized: false,
          effectiveRole,
          reason: 'Committing cross-application transfers into baseline dataset requires Lead Engineer or Admin approval.',
        };

      case 'transfer:reject':
        if (['owner', 'admin', 'lead_engineer', 'engineer'].includes(effectiveRole)) {
          return { authorized: true, effectiveRole };
        }
        return { authorized: false, effectiveRole, reason: 'Rejecting transfers requires Engineer or higher role.' };

      case 'file:upload':
        if (['owner', 'admin', 'lead_engineer', 'engineer'].includes(effectiveRole)) {
          return { authorized: true, effectiveRole };
        }
        return { authorized: false, effectiveRole, reason: 'File uploads require Engineer or higher role.' };

      case 'file:delete':
        if (['owner', 'admin', 'lead_engineer'].includes(effectiveRole)) {
          return { authorized: true, effectiveRole };
        }
        return { authorized: false, effectiveRole, reason: 'Deleting project files requires Lead Engineer or Admin role.' };

      case 'app:register':
      case 'app:manage':
        if (['owner', 'admin'].includes(effectiveRole)) {
          return { authorized: true, effectiveRole };
        }
        return { authorized: false, effectiveRole, reason: 'Application registration requires Organization Admin privileges.' };

      default:
        return { authorized: false, effectiveRole, reason: 'Unknown or unconfigured protected action.' };
    }
  }

  /**
   * Enforce permission, throwing an AuthorizationError if not authorized.
   */
  public static enforce(context: AuthContext, action: ProtectedAction): void {
    const decision = this.checkPermission(context, action);
    if (!decision.authorized) {
      throw new AuthorizationError(action, context.user.userId, decision.reason || 'Insufficient permissions.');
    }
  }
}
