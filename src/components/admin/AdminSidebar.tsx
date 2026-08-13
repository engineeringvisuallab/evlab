import React, { useState } from 'react';
import { AdminModule, UELESubModule, AdminRole } from '../../types/admin';
import { Badge } from '../shared/Badge';
import {
  LayoutDashboard,
  Globe2,
  Map,
  Boxes,
  Building2,
  Cpu,
  Share2,
  Layers,
  Box,
  Sliders,
  FileCheck2,
  BookOpen,
  Image,
  FolderGit2,
  Laptop,
  Compass,
  GraduationCap,
  Library,
  Settings,
  ChevronDown,
  ChevronRight,
  Shield,
  Users,
  History,
  Lock,
  ExternalLink,
  FileText,
  Video,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface AdminSidebarProps {
  role?: AdminRole;
  activeModule: AdminModule;
  activeUELESubModule: UELESubModule;
  onSelectModule: (module: AdminModule, subModule?: UELESubModule) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  role = 'super_admin',
  activeModule,
  activeUELESubModule,
  onSelectModule,
}) => {
  const [ueleExpanded, setUeleExpanded] = useState<boolean>(true);

  const ueleSubNavItems: { id: UELESubModule; label: string; icon: React.ReactNode }[] = [
    { id: 'world', label: '1. World / Country', icon: <Globe2 className="w-4 h-4" /> },
    { id: 'regions', label: '2. Regions', icon: <Map className="w-4 h-4" /> },
    { id: 'zones', label: '3. Zones', icon: <Boxes className="w-4 h-4" /> },
    { id: 'facilities', label: '4. Facilities', icon: <Building2 className="w-4 h-4" /> },
    { id: 'components', label: '5. Components', icon: <Cpu className="w-4 h-4" /> },
    { id: 'networks', label: '6. Networks', icon: <Share2 className="w-4 h-4" /> },
    { id: 'gis', label: '7. GIS Layers', icon: <Layers className="w-4 h-4" /> },
    { id: 'models', label: '8. 3D Models', icon: <Box className="w-4 h-4" /> },
    { id: 'engineering', label: '9. Engineering Info', icon: <FileText className="w-4 h-4" /> },
    { id: 'parameters', label: '10. Parameters', icon: <Sliders className="w-4 h-4" /> },
    { id: 'links', label: '11. Learning Links', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'standards', label: '12. Standards & Codes', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'software', label: '13. Software', icon: <Laptop className="w-4 h-4" /> },
    { id: 'courses', label: '14. Courses', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'videos', label: '15. Video Learning', icon: <Video className="w-4 h-4" /> },
    { id: 'resources', label: '16. Resources', icon: <Library className="w-4 h-4" /> },
    { id: 'publish', label: '17. Publish & Visibility', icon: <Eye className="w-4 h-4" /> },
    { id: 'validation', label: '18. Validation Engine', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const systemNavItems: { id: AdminModule; label: string; icon: React.ReactNode; requiresSuperAdmin?: boolean }[] = [
    { id: 'admins', label: 'Admin Accounts', icon: <Users className="w-4 h-4" />, requiresSuperAdmin: true },
    { id: 'audit', label: 'Audit Trail', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & Security', icon: <Settings className="w-4 h-4" /> },
  ];

  const futureModules: { id: AdminModule; label: string; icon: React.ReactNode }[] = [
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'software', label: 'Software', icon: <Laptop className="w-4 h-4" /> },
    { id: 'roadmap', label: 'Career Roadmap', icon: <Compass className="w-4 h-4" /> },
    { id: 'learning', label: 'Learning', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'resources', label: 'Resources', icon: <Library className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Logo */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm tracking-wide">EVLab Admin</div>
            <div className="text-[10px] font-mono text-cyan-400/80">Google Sheets Auth</div>
          </div>
        </div>
        <Badge variant="cyan" size="sm">v3.0</Badge>
      </div>

      {/* Sidebar Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Main Section */}
        <div className="space-y-1">
          <button
            onClick={() => onSelectModule('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeModule === 'dashboard'
                ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* System & Security Section */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            System Administration
          </div>
          <div className="space-y-0.5">
            {systemNavItems.map((item) => {
              const isActive = activeModule === item.id;
              const isRestricted = item.requiresSuperAdmin && role !== 'super_admin';

              if (isRestricted) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-amber-400' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'admins' && (
                    <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded">
                      SUPER
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* UELE Ecosystem Section */}
        <div className="space-y-1">
          <button
            onClick={() => setUeleExpanded(!ueleExpanded)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-purple-400" />
              <span>UELE Engine</span>
            </span>
            {ueleExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {ueleExpanded && (
            <div className="pl-3 space-y-0.5 border-l border-slate-800/80 ml-3 mt-1">
              {ueleSubNavItems.map((item) => {
                const isActive = activeModule === 'uele' && activeUELESubModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule('uele', item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className={isActive ? 'text-purple-400' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Future Modules */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Future Modules
          </div>

          <div className="space-y-0.5">
            {futureModules.map((item) => (
              <div
                key={item.id}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-500 opacity-60 cursor-not-allowed group hover:bg-slate-800/20"
                title="Module architecture ready."
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-600">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span className="text-[9px] bg-slate-800/80 border border-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Public EVLab Link */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <a
          href="#uele"
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <span>Public Digital Twin</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>
    </aside>
  );
};
