/**
 * Central EVLab Administration Types & Interfaces
 * Powered by Local EVLab Backend Storage & Session Authentication Engine
 */

export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';
export type AdminStatus = 'active' | 'inactive' | 'locked';

export interface AdminUser {
  admin_id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  created_at: string;
  last_login?: string;
  failed_attempts?: number;
  locked_until?: string;
}

export interface AdminSession {
  token: string;
  admin_id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  expiresAt: string;
}

export interface AuditLogEntry {
  id?: string;
  timestamp: string;
  admin_id: string;
  action: string;
  module: string;
  object_id: string;
  details: string;
  ip_or_context?: string;
}

export interface AdminSettings {
  maxFailedAttempts: number;
  lockoutMinutes: number;
  sessionHours: number;
  updatedAt?: string;
}

export type AdminModule =
  | 'dashboard'
  | 'uele'
  | 'projects'
  | 'software'
  | 'roadmap'
  | 'learning'
  | 'resources'
  | 'admins'
  | 'audit'
  | 'settings';

export type UELESubModule =
  | 'world'
  | 'regions'
  | 'zones'
  | 'facilities'
  | 'components'
  | 'networks'
  | 'gis'
  | 'models'
  | 'engineering'
  | 'parameters'
  | 'links'
  | 'standards'
  | 'software'
  | 'courses'
  | 'videos'
  | 'resources'
  | 'publish'
  | 'validation';

export interface AdminDashboardMetrics {
  worldsCount: number;
  regionsCount: number;
  zonesCount: number;
  facilitiesCount: number;
  componentsCount: number;
  networksCount: number;
  gisLayersCount: number;
  models3DCount: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  totalAdminsCount?: number;
}
