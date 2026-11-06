import React, { useState, useEffect } from 'react';
import { AdminSession, AdminModule } from '../types/admin';
import { AUTHORIZED_ADMIN_EMAIL, AdminAuthService } from '../services/adminAuthService';
import { AdminLoginForm } from '../components/admin/AdminLoginForm';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminUserManagement } from '../components/admin/system/AdminUserManagement';
import { AdminAuditLogViewer } from '../components/admin/system/AdminAuditLogViewer';
import { AdminSettingsManager } from '../components/admin/system/AdminSettingsManager';
import { RefreshCw } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');

  // Check current active session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const active = await AdminAuthService.getCurrentSession();
        setSession(active);
      } catch (err) {
        setSession(null);
      } finally {
        setCheckingSession(false);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (newSession: AdminSession) => {
    setSession(newSession);
  };

  const handleLogout = async () => {
    await AdminAuthService.logout();
    setSession(null);
  };

  const handleSelectModule = (module: AdminModule) => {
    setActiveModule(module);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="text-xs font-mono">Verifying EVLab Admin Security Session...</span>
      </div>
    );
  }

  // If unauthenticated, render Google Sheets Backed Admin Login Form
  if (!session) {
    return <AdminLoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Render Authenticated Admin Panel Shell
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar
          role={session.role || 'super_admin'}
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
          {/* Header */}
          <AdminHeader
            adminName={session.name || 'EVLab Administrator'}
            adminId={session.admin_id || 'EVL-ADMIN-001'}
            adminEmail={session.email || AUTHORIZED_ADMIN_EMAIL}
            role={session.role || 'super_admin'}
            activeModule={activeModule}
              onLogout={handleLogout}
          />

          {/* Body Content */}
          <main className="flex-1 overflow-y-auto bg-slate-950">
            {activeModule === 'dashboard' ? (
              <AdminDashboard
                session={session}
                onNavigateModule={(mod) => setActiveModule(mod)}
              />
            ) : activeModule === 'admins' ? (
              <AdminUserManagement />
            ) : activeModule === 'audit' ? (
              <AdminAuditLogViewer />
            ) : activeModule === 'settings' ? (
              <AdminSettingsManager />
            ) : (
              <div className="p-12 text-center text-slate-500">
                <p className="text-sm font-semibold text-slate-400 capitalize">{activeModule} Module Architecture Ready</p>
                <p className="text-xs text-slate-600 mt-1">This module will be connected in future EVLab releases without rebuilding the Admin Panel.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
