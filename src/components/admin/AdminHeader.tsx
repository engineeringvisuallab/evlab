import React from 'react';
import { AdminModule, UELESubModule, AdminRole } from '../../types/admin';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import {
  ShieldCheck,
  Building2,
  Layers,
  Box,
  LogOut,
  UserCheck,
  Crown,
  Shield,
} from 'lucide-react';

interface AdminHeaderProps {
  adminName: string;
  adminId: string;
  adminEmail: string;
  role: AdminRole;
  activeModule: AdminModule;
  activeUELESubModule: UELESubModule;
  onQuickAction: (action: 'add-facility' | 'add-gis' | 'add-model') => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminName,
  adminId,
  adminEmail,
  role,
  activeModule,
  activeUELESubModule,
  onQuickAction,
  onLogout,
}) => {
  const getBreadcrumb = () => {
    if (activeModule === 'dashboard') return 'Central Control Center';
    if (activeModule === 'admins') return 'Administrator Account Management';
    if (activeModule === 'audit') return 'System Audit Trail & Security Logs';
    if (activeModule === 'settings') return 'Admin Settings & Google Sheets API Sync';
    if (activeModule === 'uele') {
      const subLabels: Record<UELESubModule, string> = {
        world: 'World Boundaries',
        regions: 'Regions Management',
        zones: 'Zones & Planning',
        facilities: 'Facilities Management',
        components: 'Components & Equipments',
        networks: 'Infrastructure Networks',
        gis: 'GIS Layers & Vector Datasets',
        models: '3D Digital Twin Models',
        engineering: 'Engineering Information',
        parameters: 'Engineering Parameters',
        standards: 'Standards & Engineering Codes',
        links: 'Learning Links',
        software: 'Software Integrations',
        courses: 'Courses',
        videos: 'Video Learning',
        resources: 'Resources',
        publish: 'Publish & Visibility',
        validation: 'Validation Engine',
      };
      return `UELE Ecosystem > ${subLabels[activeUELESubModule] || activeUELESubModule}`;
    }
    return activeModule.toUpperCase();
  };

  const getRoleLabel = (r: AdminRole) => {
    switch (r) {
      case 'super_admin':
        return 'SUPER ADMIN';
      case 'admin':
        return 'ADMINISTRATOR';
      case 'editor':
        return 'EDITOR';
      case 'viewer':
        return 'VIEWER';
      default:
        return 'ADMINISTRATOR';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 select-none">
      {/* Title / Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>{getBreadcrumb()}</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            WGS84 EPSG:4326 Authoritative Geographic Coordinate Reference
          </p>
        </div>
      </div>

      {/* Quick Actions & Admin Session Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Action Shortcuts */}
        <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuickAction('add-facility')}
            className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Add Facility</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuickAction('add-gis')}
            className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>+ Add GIS Layer</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuickAction('add-model')}
            className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 gap-1.5"
          >
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Upload 3D Model</span>
          </Button>
        </div>

        {/* Logged in Admin Badge */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {role === 'super_admin' ? <Crown className="w-4 h-4 text-amber-400" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
              <span>{adminName || 'EVLab Administrator'}</span>
              <span className="text-[10px] font-mono text-cyan-400 font-normal">({adminId || 'EVL-ADMIN-001'})</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded">
                {getRoleLabel(role)}
              </span>
              <span className="text-[9px] text-slate-400 truncate max-w-[140px] font-mono hidden xl:inline">
                {adminEmail}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 text-xs font-semibold"
          title="Logout from Admin Panel"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>LOGOUT</span>
        </Button>
      </div>
    </header>
  );
};
