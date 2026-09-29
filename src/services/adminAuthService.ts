import { AdminSession, AdminUser, AuditLogEntry, AdminSettings } from '../types/admin';

export const AUTHORIZED_ADMIN_EMAIL = 'engineering.visual.lab@gmail.com';
export const DEFAULT_INITIAL_ADMIN_ID = 'EVL-ADMIN-001';

const STORAGE_SESSION_KEY = 'evlab_admin_session';

async function parseJsonResponse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      throw new Error('Failed to parse response JSON from server.');
    }
  }
  const text = await res.text();
  if (text.includes('<!DOCTYPE') || text.includes('<html')) {
    throw new Error(`Server connection error (${res.status}). Please check server logs.`);
  }
  throw new Error(text.slice(0, 150) || `Server error (${res.status})`);
}

export class AdminAuthService {
  /**
   * Admin Login via Admin ID + Password
   */
  static async login(admin_id: string, password: string): Promise<AdminSession> {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id, password }),
      });

      const data = await parseJsonResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid Admin ID or Password.');
      }

      const session: AdminSession = data.session;
      // Store session token in sessionStorage for web security
      sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (err: any) {
      console.error('[Admin Auth] Login error:', err);
      throw new Error(err?.message || 'Authentication failed.');
    }
  }

  /**
   * Validate current active session token with server
   */
  static async getCurrentSession(): Promise<AdminSession | null> {
    const raw = sessionStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;

    try {
      const session: AdminSession = JSON.parse(raw);
      if (!session || !session.token) return null;

      const res = await fetch('/api/admin/auth/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
      });

      const data = await parseJsonResponse(res);
      if (data.valid && data.session) {
        // Updated active session info
        sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(data.session));
        return data.session;
      } else {
        sessionStorage.removeItem(STORAGE_SESSION_KEY);
        return null;
      }
    } catch (err) {
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
      return null;
    }
  }

  /**
   * Helper to retrieve session token for authenticated API headers
   */
  static getSessionToken(): string | null {
    const raw = sessionStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    try {
      const session: AdminSession = JSON.parse(raw);
      return session?.token || null;
    } catch {
      return null;
    }
  }

  /**
   * Helper to get Authorization Header
   */
  static getAuthHeaders(): Record<string, string> {
    const token = this.getSessionToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  /**
   * Logout administrator
   */
  static async logout(): Promise<void> {
    const token = this.getSessionToken();
    if (token) {
      try {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: this.getAuthHeaders(),
        });
      } catch (err) {
        console.warn('Logout server request failed:', err);
      }
    }
    sessionStorage.removeItem(STORAGE_SESSION_KEY);
  }

  /**
   * Change Password inside Admin Settings
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/auth/change-password', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await parseJsonResponse(res);
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to change password.');
    }
    return data;
  }

  /**
   * Get list of Administrators (Super Admin only)
   */
  static async getAdmins(): Promise<AdminUser[]> {
    const res = await fetch('/api/admin/users', {
      headers: this.getAuthHeaders(),
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch administrator list.');
    }
    return data.admins || [];
  }

  /**
   * Create New Administrator (Super Admin only)
   */
  static async createAdmin(payload: { admin_id: string; name: string; email: string; password: string; role: string }): Promise<void> {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create administrator.');
    }
  }

  /**
   * Update Administrator details or status (Super Admin only)
   */
  static async updateAdmin(admin_id: string, payload: { name?: string; email?: string; role?: string; status?: string }): Promise<void> {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(admin_id)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update administrator.');
    }
  }

  /**
   * Reset Administrator Password (Super Admin only)
   */
  static async resetAdminPassword(admin_id: string, newPassword: string): Promise<void> {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(admin_id)}/reset-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ newPassword }),
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to reset administrator password.');
    }
  }

  /**
   * Fetch Audit Logs
   */
  static async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch('/api/admin/audit-logs', {
      headers: this.getAuthHeaders(),
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch audit logs.');
    }
    return data.auditLogs || [];
  }

  /**
   * Get Admin System Settings
   */
  static async getSettings(): Promise<AdminSettings> {
    const res = await fetch('/api/admin/settings', {
      headers: this.getAuthHeaders(),
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch system settings.');
    }
    return data.settings || { maxFailedAttempts: 5, lockoutMinutes: 15, sessionHours: 8 };
  }

  /**
   * Update Admin System Settings
   */
  static async saveSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settings),
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update settings.');
    }
    return data.settings;
  }

  /**
   * Revoke active sessions for a specific administrator (Super Admin only)
   */
  static async revokeSessions(admin_id: string): Promise<void> {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(admin_id)}/revoke-sessions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to revoke active sessions.');
    }
  }
}
