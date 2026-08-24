import React, { useState, useEffect } from 'react';
import { AdminSession, AdminModule, UELESubModule } from '../types/admin';
import { AUTHORIZED_ADMIN_EMAIL, AdminAuthService } from '../services/adminAuthService';
import { FullUELEDatabase, UELEAdminService } from '../services/ueleAdminService';
import { AdminLoginForm } from '../components/admin/AdminLoginForm';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminFacilityManager } from '../components/admin/uele/AdminFacilityManager';
import { Admin3DModelManager } from '../components/admin/uele/Admin3DModelManager';
import { AdminGISLayerManager } from '../components/admin/uele/AdminGISLayerManager';
import { AdminHierarchyManager } from '../components/admin/uele/AdminHierarchyManager';
import { AdminComponentManager } from '../components/admin/uele/AdminComponentManager';
import { AdminNetworkManager } from '../components/admin/uele/AdminNetworkManager';
import { AdminEngineeringInfoManager } from '../components/admin/uele/AdminEngineeringInfoManager';
import { AdminParameterManager } from '../components/admin/uele/AdminParameterManager';
import { AdminLearningIntegrationManager } from '../components/admin/uele/AdminLearningIntegrationManager';
import { AdminPublishManager } from '../components/admin/uele/AdminPublishManager';
import { AdminValidationManager } from '../components/admin/uele/AdminValidationManager';
import { AdminUserManagement } from '../components/admin/system/AdminUserManagement';
import { AdminAuditLogViewer } from '../components/admin/system/AdminAuditLogViewer';
import { AdminSettingsManager } from '../components/admin/system/AdminSettingsManager';
import { RefreshCw } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [activeUELESubModule, setActiveUELESubModule] = useState<UELESubModule>('facilities');
  const [database, setDatabase] = useState<FullUELEDatabase>({
    worlds: [],
    regions: [],
    zones: [],
    facilities: [],
    components: [],
    networks: [],
    gisLayers: [],
    models3D: [],
    auditLogs: [],
  });
  const [loadingDb, setLoadingDb] = useState<boolean>(false);

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

  // Fetch full UELE database when authenticated
  const loadAdminDatabase = async () => {
    if (!session) return;
    setLoadingDb(true);
    try {
      const db = await UELEAdminService.getFullUELEDatabase();
      setDatabase(db);
    } catch (err) {
      console.error('Failed to load admin database:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadAdminDatabase();
    }
  }, [session]);

  const handleLoginSuccess = (newSession: AdminSession) => {
    setSession(newSession);
  };

  const handleLogout = async () => {
    await AdminAuthService.logout();
    setSession(null);
  };

  const handleSelectModule = (module: AdminModule, subModule?: UELESubModule) => {
    setActiveModule(module);
    if (subModule) {
      setActiveUELESubModule(subModule);
    }
  };

  const handleQuickAction = (action: 'add-facility' | 'add-gis' | 'add-model' | 'add-region' | 'add-zone' | 'add-network') => {
    setActiveModule('uele');
    if (action === 'add-facility') setActiveUELESubModule('facilities');
    else if (action === 'add-gis') setActiveUELESubModule('gis');
    else if (action === 'add-model') setActiveUELESubModule('models');
    else if (action === 'add-region') setActiveUELESubModule('regions');
    else if (action === 'add-zone') setActiveUELESubModule('zones');
    else if (action === 'add-network') setActiveUELESubModule('networks');
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
          activeUELESubModule={activeUELESubModule}
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
            activeUELESubModule={activeUELESubModule}
            onQuickAction={handleQuickAction}
            onLogout={handleLogout}
          />

          {/* Body Content */}
          <main className="flex-1 overflow-y-auto bg-slate-950">
            {loadingDb && activeModule === 'uele' ? (
              <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span className="text-xs font-mono">Synchronizing Central EVLab Dataset...</span>
              </div>
            ) : activeModule === 'dashboard' ? (
              <AdminDashboard
                session={session}
                database={database}
                onNavigateUELE={(sub) => {
                  setActiveModule('uele');
                  setActiveUELESubModule(sub);
                }}
                onQuickAction={handleQuickAction}
                onNavigateModule={(mod) => setActiveModule(mod)}
              />
            ) : activeModule === 'admins' ? (
              <AdminUserManagement />
            ) : activeModule === 'audit' ? (
              <AdminAuditLogViewer />
            ) : activeModule === 'settings' ? (
              <AdminSettingsManager />
            ) : activeModule === 'uele' ? (
              activeUELESubModule === 'facilities' ? (
                <AdminFacilityManager
                  database={database}
                  onRefreshDatabase={loadAdminDatabase}
                />
              ) : activeUELESubModule === 'models' ? (
                <Admin3DModelManager
                  database={database}
                  onRefreshDatabase={loadAdminDatabase}
                />
              ) : activeUELESubModule === 'gis' ? (
                <AdminGISLayerManager
                  database={database}
                  onRefreshDatabase={loadAdminDatabase}
                />
              ) : activeUELESubModule === 'components' ? (
                <AdminComponentManager
                  database={database}
                  onRefreshDatabase={loadAdminDatabase}
                />
              ) : activeUELESubModule === 'networks' ? (
                <AdminNetworkManager
                  database={database}
                  onRefreshDatabase={loadAdminDatabase}
                />
              ) : activeUELESubModule === 'engineering' ? (
                <AdminEngineeringInfoManager
                  database={database}
                  onRefreshDatabase={loadAdminDatabase}
                />
              ) : activeUELESubModule === 'parameters' ? (
                <AdminParameterManager
                  database={database}
                  onRefreshDatabase={loadAdminDatabase}
                />
              ) : activeUELESubModule === 'links' ||
                activeUELESubModule === 'standards' ||
                activeUELESubModule === 'software' ||
                activeUELESubModule === 'courses' ||
                activeUELESubModule === 'videos' ||
                activeUELESubModule === 'resources' ? (
                <AdminLearningIntegrationManager
                  database={database}
                  activeSubModule={activeUELESubModule}
                  onRefreshDatabase={loadAdminDatabase}
                />
              ) : activeUELESubModule === 'publish' ? (
                <AdminPublishManager
                  database={database}
                  onRefreshDatabase={loadAdminDatabase}
                />
              ) : activeUELESubModule === 'validation' ? (
                <AdminValidationManager
                  database={database}
                  onRefreshDatabase={loadAdminDatabase}
                />
              ) : (
                <AdminHierarchyManager
                  subModule={activeUELESubModule}
                  database={database}
                  onRefreshDatabase={loadAdminDatabase}
                />
              )
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
