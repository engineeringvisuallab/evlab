import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const AUTHORIZED_ADMIN_EMAIL = 'engineering.visual.lab@gmail.com';
const SALT = 'EVLab_Digital_Twin_2026_Secure_Salt#';

// Password Hashing Helper
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(SALT + password).digest('hex');
}

interface AdminUserRecord {
  admin_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'locked';
  created_at: string;
  last_login?: string;
  failed_attempts: number;
  locked_until?: string;
}

interface AdminSessionRecord {
  token: string;
  admin_id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  createdAt: number;
  expiresAt: number;
}

const activeSessions = new Map<string, AdminSessionRecord>(); // key: token
const rateLimitMap = new Map<string, number[]>(); // key: admin_id, value: timestamps of requests

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Allow reasonably large JSON payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Paths for server-side databases
  const DATA_DIR = path.join(process.cwd(), 'data');
  const ADMIN_DB_FILE = path.join(DATA_DIR, 'admin-database.json');

  // Ensure directories exist
  [DATA_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Ensure Admin Database file exists with default initial administrator EVL-ADMIN-001
  const initialPass = process.env.INITIAL_ADMIN_PASSWORD || 'EVLab@2026!Admin';
  if (!fs.existsSync(ADMIN_DB_FILE)) {
    const initialAdminDb = {
      admins: [
        {
          admin_id: 'EVL-ADMIN-001',
          name: 'EVLab Administrator',
          email: AUTHORIZED_ADMIN_EMAIL,
          password_hash: hashPassword(initialPass),
          role: 'super_admin',
          status: 'active',
          created_at: new Date().toISOString(),
          last_login: '',
          failed_attempts: 0,
          locked_until: '',
        },
      ],
      settings: {
        maxFailedAttempts: 5,
        lockoutMinutes: 15,
        sessionHours: 8,
      },
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          admin_id: 'EVL-ADMIN-001',
          action: 'System Provisioned',
          module: 'Auth',
          object_id: 'EVL-ADMIN-001',
          details: 'Initial Super Admin account EVL-ADMIN-001 provisioned with local backend database.',
          ip_or_context: 'Server Boot',
        },
      ],
    };
    fs.writeFileSync(ADMIN_DB_FILE, JSON.stringify(initialAdminDb, null, 2), 'utf-8');
  } else {
    // Verify EVL-ADMIN-001 exists in existing DB
    try {
      const existingDb = JSON.parse(fs.readFileSync(ADMIN_DB_FILE, 'utf-8'));
      if (!existingDb.admins) existingDb.admins = [];
      const hasSuperAdmin = existingDb.admins.some((a: any) => a.admin_id === 'EVL-ADMIN-001');
      if (!hasSuperAdmin) {
        existingDb.admins.unshift({
          admin_id: 'EVL-ADMIN-001',
          name: 'EVLab Administrator',
          email: AUTHORIZED_ADMIN_EMAIL,
          password_hash: hashPassword(initialPass),
          role: 'super_admin',
          status: 'active',
          created_at: new Date().toISOString(),
          last_login: '',
          failed_attempts: 0,
          locked_until: '',
        });
        fs.writeFileSync(ADMIN_DB_FILE, JSON.stringify(existingDb, null, 2), 'utf-8');
      }
    } catch (e) {
      console.warn('Failed to parse existing admin database on boot:', e);
    }
  }

  // Helper: Read Admin Database
  const readAdminDatabase = () => {
    try {
      if (!fs.existsSync(ADMIN_DB_FILE)) return { admins: [], settings: {}, auditLogs: [] };
      const data = JSON.parse(fs.readFileSync(ADMIN_DB_FILE, 'utf-8'));
      if (!data.admins || !Array.isArray(data.admins)) data.admins = [];
      if (!data.settings) data.settings = {};
      if (!data.auditLogs) data.auditLogs = [];
      return data;
    } catch {
      return { admins: [], settings: {}, auditLogs: [] };
    }
  };

  // Helper: Write Admin Database
  const writeAdminDatabase = (db: any) => {
    fs.writeFileSync(ADMIN_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  };

  // Helper: Revoke all active sessions for a target administrator
  const revokeAdminSessions = (targetAdminId: string) => {
    const cleanTarget = targetAdminId.trim().toUpperCase();
    for (const [token, session] of activeSessions.entries()) {
      if (session.admin_id.toUpperCase() === cleanTarget) {
        activeSessions.delete(token);
      }
    }
  };

  // Helper: Log Audit Entry
  const addAuditLog = (action: string, adminIdOrEmail: string, module: string, objectId: string, details: string) => {
    const adminDb = readAdminDatabase() || {};
    if (!adminDb.auditLogs) adminDb.auditLogs = [];
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      admin_id: adminIdOrEmail,
      action,
      module,
      object_id: objectId,
      details,
      ip_or_context: 'EVLab Web Server',
    };
    adminDb.auditLogs.unshift(entry);
    if (adminDb.auditLogs.length > 300) adminDb.auditLogs = adminDb.auditLogs.slice(0, 300);
    writeAdminDatabase(adminDb);
  };

  // Middleware: Verify Admin Session Token
  const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Admin session token required.' });
    }

    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized. Invalid or expired session.' });
    }

    if (Date.now() > session.expiresAt) {
      activeSessions.delete(token);
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    // Refresh sliding session expiry (8 hours)
    session.expiresAt = Date.now() + 8 * 60 * 60 * 1000;
    (req as any).adminId = session.admin_id;
    (req as any).adminName = session.name;
    (req as any).adminEmail = session.email;
    (req as any).adminRole = session.role;
    next();
  };

  // Middleware: Verify Super Admin Role
  const requireSuperAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    requireAdminAuth(req, res, () => {
      if ((req as any).adminRole !== 'super_admin') {
        return res.status(403).json({ error: 'Forbidden. Super Admin authorization required.' });
      }
      next();
    });
  };

  // ==========================================
  // CENTRAL EVLAB LOCAL BACKEND AUTH API ENDPOINTS
  // ==========================================

  // 1. Admin Login (Admin ID + Password)
  app.post('/api/admin/auth/login', async (req, res) => {
    try {
      const { admin_id, password } = req.body || {};
      if (!admin_id || !password) {
        return res.status(400).json({ error: 'Admin ID and Password are required.' });
      }

      const cleanAdminId = String(admin_id).trim();
      const adminDb = readAdminDatabase();
      const adminIndex = adminDb.admins.findIndex(
        (a: any) =>
          a.admin_id.toUpperCase() === cleanAdminId.toUpperCase() ||
          (a.email && a.email.toLowerCase() === cleanAdminId.toLowerCase())
      );

      if (adminIndex === -1) {
        addAuditLog('Login Failed', cleanAdminId, 'Auth', cleanAdminId, 'Invalid Admin ID or Email entered.');
        return res.status(401).json({ error: 'Invalid Admin ID or Password.' });
      }

      const admin = adminDb.admins[adminIndex];
      const now = Date.now();

      // Deactivated account check
      if (admin.status === 'inactive') {
        return res.status(403).json({ error: 'This administrator account is deactivated. Please contact Super Admin.' });
      }

      // Lockout check
      if (admin.locked_until) {
        const lockTime = new Date(admin.locked_until).getTime();
        if (now < lockTime) {
          const remainingMins = Math.ceil((lockTime - now) / 60000);
          return res.status(423).json({
            error: `Account locked due to consecutive failed attempts. Try again in ${remainingMins} minute(s).`,
          });
        } else {
          // Lock expired -> reset status
          admin.status = 'active';
          admin.failed_attempts = 0;
          admin.locked_until = '';
        }
      }

      // Compare Password Hash (check raw input & trimmed input)
      const inputHash = hashPassword(String(password));
      const inputHashTrimmed = hashPassword(String(password).trim());
      if (inputHash !== admin.password_hash && inputHashTrimmed !== admin.password_hash) {
        admin.failed_attempts = (admin.failed_attempts || 0) + 1;
        const maxFailed = adminDb.settings?.maxFailedAttempts || 5;

        if (admin.failed_attempts >= maxFailed) {
          admin.status = 'locked';
          const lockoutMins = adminDb.settings?.lockoutMinutes || 15;
          admin.locked_until = new Date(now + lockoutMins * 60 * 1000).toISOString();
          writeAdminDatabase(adminDb);

          addAuditLog('Account Locked', admin.admin_id, 'Auth', admin.admin_id, `Failed login limit reached (${maxFailed}). Account locked for ${lockoutMins} minutes.`);

          return res.status(423).json({
            error: `Maximum ${maxFailed} failed attempts exceeded. Account locked temporarily for ${lockoutMins} minutes.`,
          });
        } else {
          writeAdminDatabase(adminDb);
          addAuditLog('Login Failed', admin.admin_id, 'Auth', admin.admin_id, `Incorrect password. Failed attempt ${admin.failed_attempts}/${maxFailed}`);
          const remaining = maxFailed - admin.failed_attempts;
          return res.status(401).json({
            error: `Invalid Admin ID or Password. (${remaining} attempt(s) remaining before account lockout)`,
          });
        }
      }

      // Successful Login!
      admin.failed_attempts = 0;
      admin.locked_until = '';
      admin.status = 'active';
      admin.last_login = new Date(now).toISOString();
      writeAdminDatabase(adminDb);

      // Create session
      const token = `evl-adm-${crypto.randomBytes(24).toString('hex')}`;
      const sessionHours = adminDb.settings?.sessionHours || 8;
      const sessionExpiresAt = now + sessionHours * 60 * 60 * 1000;

      const sessionRecord: AdminSessionRecord = {
        token,
        admin_id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: now,
        expiresAt: sessionExpiresAt,
      };

      activeSessions.set(token, sessionRecord);

      addAuditLog('Login Successful', admin.admin_id, 'Auth', admin.admin_id, `Authenticated successfully as [${admin.role}].`);

      return res.json({
        success: true,
        authenticated: true,
        session: {
          token,
          admin_id: admin.admin_id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          createdAt: new Date(now).toISOString(),
          expiresAt: new Date(sessionExpiresAt).toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[Admin Login Error]:', err);
      return res.status(500).json({ error: err?.message || 'Server error during authentication.' });
    }
  });

  // 2. Verify Session
  app.post('/api/admin/auth/verify-session', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ valid: false });
    }

    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);

    if (!session || Date.now() > session.expiresAt) {
      if (token) activeSessions.delete(token);
      return res.json({ valid: false });
    }

    res.json({
      valid: true,
      session: {
        token,
        admin_id: session.admin_id,
        name: session.name,
        email: session.email,
        role: session.role,
        createdAt: new Date(session.createdAt).toISOString(),
        expiresAt: new Date(session.expiresAt).toISOString(),
      },
    });
  });

  // 3. Logout
  app.post('/api/admin/auth/logout', requireAdminAuth, (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      activeSessions.delete(token);
      addAuditLog('Logout', (req as any).adminId, 'Auth', (req as any).adminId, 'Admin logged out.');
    }
    res.json({ success: true });
  });

  // 4. Change Password (Inside Admin Settings)
  app.post('/api/admin/auth/change-password', requireAdminAuth, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const adminId = (req as any).adminId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const adminDb = readAdminDatabase();
    const adminIndex = adminDb?.admins?.findIndex((a: any) => a.admin_id === adminId);

    if (adminIndex === -1 || adminIndex === undefined) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    const admin = adminDb.admins[adminIndex];
    if (hashPassword(currentPassword) !== admin.password_hash) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    admin.password_hash = hashPassword(newPassword);
    writeAdminDatabase(adminDb);

    addAuditLog('Password Changed', adminId, 'Account', adminId, 'Admin password successfully updated.');

    res.json({ success: true, message: 'Password changed successfully.' });
  });

  // 5. Admin Account Management APIs (Super Admin Only)
  app.get('/api/admin/users', requireSuperAdmin, (req, res) => {
    const adminDb = readAdminDatabase() || { admins: [] };
    // Omit password hashes
    const safeAdmins = (adminDb.admins || []).map((a: any) => ({
      admin_id: a.admin_id,
      name: a.name,
      email: a.email,
      role: a.role,
      status: a.status,
      created_at: a.created_at,
      last_login: a.last_login,
      failed_attempts: a.failed_attempts || 0,
      locked_until: a.locked_until || '',
    }));
    res.json({ admins: safeAdmins });
  });

  app.post('/api/admin/users', requireSuperAdmin, (req, res) => {
    const { admin_id, name, email, password, role } = req.body;
    if (!admin_id || !name || !email || !password) {
      return res.status(400).json({ error: 'Admin ID, Name, Email, and Initial Password are required.' });
    }

    const cleanId = admin_id.trim().toUpperCase();
    const adminDb = readAdminDatabase() || { admins: [] };

    if (adminDb.admins.some((a: any) => a.admin_id.toUpperCase() === cleanId)) {
      return res.status(400).json({ error: 'An administrator with this Admin ID already exists.' });
    }

    const newAdmin: AdminUserRecord = {
      admin_id: cleanId,
      name: name.trim(),
      email: email.trim(),
      password_hash: hashPassword(password),
      role: role || 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
      failed_attempts: 0,
    };

    adminDb.admins.push(newAdmin);
    writeAdminDatabase(adminDb);

    addAuditLog('Created Admin', (req as any).adminId, 'UserManagement', cleanId, `Created new admin account for ${name} (${cleanId}).`);

    res.json({ success: true, message: 'Admin account created successfully.' });
  });

  app.put('/api/admin/users/:admin_id', requireSuperAdmin, (req, res) => {
    const targetAdminId = req.params.admin_id.trim().toUpperCase();
    const { name, email, role, status } = req.body;

    const adminDb = readAdminDatabase() || { admins: [] };
    const admin = adminDb.admins.find((a: any) => a.admin_id.toUpperCase() === targetAdminId);

    if (!admin) {
      return res.status(404).json({ error: 'Administrator not found.' });
    }

    if (name) admin.name = name.trim();
    if (email) admin.email = email.trim();
    if (role) admin.role = role;
    if (status) {
      admin.status = status;
      if (status === 'active') {
        admin.failed_attempts = 0;
        admin.locked_until = '';
      } else if (status === 'inactive' || status === 'locked') {
        revokeAdminSessions(targetAdminId);
      }
    }

    writeAdminDatabase(adminDb);
    addAuditLog('Updated Admin', (req as any).adminId, 'UserManagement', targetAdminId, `Updated administrator details for ${targetAdminId}.`);

    res.json({ success: true, message: 'Admin details updated successfully.' });
  });

  app.post('/api/admin/users/:admin_id/reset-password', requireSuperAdmin, (req, res) => {
    const targetAdminId = req.params.admin_id.trim().toUpperCase();
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const adminDb = readAdminDatabase() || { admins: [] };
    const admin = adminDb.admins.find((a: any) => a.admin_id.toUpperCase() === targetAdminId);

    if (!admin) {
      return res.status(404).json({ error: 'Administrator not found.' });
    }

    admin.password_hash = hashPassword(newPassword);
    admin.status = 'active';
    admin.failed_attempts = 0;
    admin.locked_until = '';

    writeAdminDatabase(adminDb);
    revokeAdminSessions(targetAdminId);

    addAuditLog('Reset Password', (req as any).adminId, 'UserManagement', targetAdminId, `Reset password for administrator ${targetAdminId}.`);

    res.json({ success: true, message: `Password for ${targetAdminId} reset successfully.` });
  });

  app.post('/api/admin/users/:admin_id/revoke-sessions', requireSuperAdmin, (req, res) => {
    const targetAdminId = req.params.admin_id.trim().toUpperCase();
    revokeAdminSessions(targetAdminId);
    addAuditLog('Revoked Sessions', (req as any).adminId, 'UserManagement', targetAdminId, `Revoked all active sessions for administrator ${targetAdminId}.`);
    res.json({ success: true, message: `Active sessions for ${targetAdminId} revoked.` });
  });

  // 6. Audit Log & System Settings Endpoints
  app.get('/api/admin/audit-logs', requireAdminAuth, (req, res) => {
    const adminDb = readAdminDatabase() || { auditLogs: [] };
    res.json({ auditLogs: adminDb.auditLogs || [] });
  });

  app.get('/api/admin/settings', requireAdminAuth, (req, res) => {
    const adminDb = readAdminDatabase() || { settings: {} };
    res.json({ settings: adminDb.settings || {} });
  });

  app.post('/api/admin/settings', requireSuperAdmin, (req, res) => {
    const { maxFailedAttempts, lockoutMinutes, sessionHours } = req.body;
    const adminDb = readAdminDatabase() || { settings: {} };

    adminDb.settings = {
      ...adminDb.settings,
      maxFailedAttempts: maxFailedAttempts || adminDb.settings.maxFailedAttempts || 5,
      lockoutMinutes: lockoutMinutes || adminDb.settings.lockoutMinutes || 15,
      sessionHours: sessionHours || adminDb.settings.sessionHours || 8,
      updatedAt: new Date().toISOString(),
    };

    writeAdminDatabase(adminDb);
    addAuditLog('Updated Settings', (req as any).adminId, 'Settings', 'SystemSettings', 'Updated Admin Security & Lockout Policy settings.');

    res.json({ success: true, settings: adminDb.settings });
  });

  // Catch-all for unhandled /api routes to prevent HTML responses
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
  });

  // Global error handler for /api routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.error('[API Internal Error]:', err);
      return res.status(500).json({ error: err?.message || 'Internal Server Error' });
    }
    next(err);
  });

  // Vite Middleware for Development Mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EVLab Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
