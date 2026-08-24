/**
 * EV Software Core - Core System Types
 * Defines User, Organization, Project, Membership, Roles and Permissions.
 */

export type UserRole = 'owner' | 'admin' | 'lead_engineer' | 'engineer' | 'designer' | 'reviewer' | 'viewer';

export type Permission = 
  | 'project:read'
  | 'project:edit'
  | 'project:manage'
  | 'dataset:create'
  | 'dataset:read'
  | 'dataset:edit'
  | 'transfer:create'
  | 'transfer:review'
  | 'transfer:validate'
  | 'transfer:commit'
  | 'transfer:reject'
  | 'revision:create'
  | 'audit:read'
  | 'app:register'
  | 'storage:upload';

export interface User {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  organizationId: string;
  title: string;
  defaultRole: UserRole;
}

export interface Organization {
  organizationId: string;
  name: string;
  slug: string;
  createdAt: string;
  plan: 'community' | 'professional' | 'enterprise';
  seatCount: number;
}

export type ProjectStatus = 'planning' | 'active' | 'in_review' | 'archived' | 'completed';

export type ProjectType = 'water_supply' | 'wastewater' | 'urban_drainage' | 'civil_infrastructure' | 'industrial_plant' | 'general';

export interface ProjectMember {
  projectMemberId: string;
  projectId: string;
  userId: string;
  user: User;
  role: UserRole;
  permissions: Permission[];
  joinedAt: string;
}

export interface Project {
  projectId: string;
  name: string;
  code: string;
  description: string;
  organizationId: string;
  projectType: ProjectType;
  status: ProjectStatus;
  location?: string;
  coordinateSystem?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  datasetCount?: number;
  transferCount?: number;
  revisionCount?: number;
}
