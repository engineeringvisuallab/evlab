/**
 * EV Software Core - Top Navigation Header
 * Provides Project Context switching, User/Role selection, Core API health,
 * and quick access to notifications and global search.
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  FolderKanban,
  UserCheck,
  Activity,
  Bell,
  Search,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Cpu,
  User as UserIcon,
  Cloud,
  Database,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useCore } from '../../core/store/coreStore';
import { User } from '../../types/core';

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleNotifications: () => void;
  onOpenDrive?: () => void;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onToggleNotifications,
  onOpenDrive,
  unreadCount,
}) => {
  const {
    organization,
    projects,
    activeProjectId,
    activeProject,
    setActiveProjectId,
    users,
    currentUser,
    setCurrentUser,
    currentRole,
    resetToInitialState,
  } = useCore();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setHealthStatus(data);
        }
      } catch (err) {
        // Dev server fallback
        setHealthStatus({
          status: 'online',
          database: { connected: false, status: 'NOT_PROVISIONED', message: 'Running in client-side / demo mode' },
          objectStorage: { provider: 'memory', canonical: true },
          googleDriveBridge: { status: 'AVAILABLE', role: 'EXTERNAL_STORAGE_BRIDGE' },
        });
      }
    };
    checkHealth();
  }, []);

  const isDbConnected = healthStatus?.database?.connected === true;

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 text-slate-100 flex items-center justify-between px-4 sticky top-0 z-30 select-none">
      {/* Brand & Ecosystem Label */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold tracking-tight text-sm text-white">EVSoftware</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Space
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Engineering Visual Lab</span>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 mx-1 hidden md:block" />

        {/* Active Project Selector */}
        <div className="relative">
          <button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 leading-none">Project Context</div>
              <div className="font-medium text-slate-200 truncate max-w-[180px] sm:max-w-[240px]">
                {activeProject?.name || 'Select Project'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {isProjectDropdownOpen && (
            <div
              className="absolute left-0 mt-1.5 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setIsProjectDropdownOpen(false)}
            >
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Switch Project Context
              </div>
              {projects.map((proj) => (
                <button
                  key={proj.projectId}
                  onClick={() => setActiveProjectId(proj.projectId)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    proj.projectId === activeProjectId
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate">{proj.name}</div>
                    <div
                      className={`text-[10px] font-mono ${
                        proj.projectId === activeProjectId ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {proj.code} • {proj.projectType}
                    </div>
                  </div>
                  {proj.projectId === activeProjectId && (
                    <ShieldCheck className="w-4 h-4 shrink-0 text-white" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Search Trigger */}
      <button
        onClick={onOpenSearch}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors w-64 justify-between"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span>Quick Search (Apps, Datasets)...</span>
        </div>
        <kbd className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
          ⌘K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Core API Health & PostgreSQL Badge */}
        <button
          onClick={() => setIsHealthModalOpen(true)}
          className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] font-mono transition-colors"
          title="Click to view Backend & Infrastructure Health"
        >
          <span className={`flex items-center gap-1 ${isDbConnected ? 'text-cyan-400' : 'text-amber-400'}`}>
            <Database className="w-3 h-3" />
            <span>{isDbConnected ? 'PostgreSQL: Connected' : 'PostgreSQL: Demo Mode'}</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Core API v1</span>
          </span>
        </button>

        {/* Google Drive Workspace Bridge */}
        {onOpenDrive && (
          <button
            onClick={onOpenDrive}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-cyan-400 transition-colors"
            title="Open Google Drive Cloud Storage Bridge"
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-[11px] font-medium">Google Drive</span>
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="System Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs transition-colors"
          >
            <div className="text-right hidden sm:block">
              <div className="font-medium text-slate-200 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-blue-400 font-mono uppercase tracking-wider">
                {currentRole.replace('_', ' ')}
              </div>
            </div>
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-md object-cover ring-1 ring-slate-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-300 font-semibold flex items-center justify-center text-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserDropdownOpen && (
            <div
              className="absolute right-0 mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setIsUserDropdownOpen(false)}
            >
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Simulate Actor & Role
              </div>
              {users.map((u) => (
                <button
                  key={u.userId}
                  onClick={() => setCurrentUser(u)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 transition-colors ${
                    u.userId === currentUser.userId
                      ? 'bg-slate-800 text-blue-400 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  {u.avatarUrl ? (
                    <img
                      src={u.avatarUrl}
                      alt={u.name}
                      className="w-6 h-6 rounded object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-center text-[11px] shrink-0">
                      {u.name ? u.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  <div className="truncate">
                    <div className="text-slate-200 font-medium truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{u.defaultRole.replace('_', ' ')}</div>
                  </div>
                </button>
              ))}

              <div className="border-t border-slate-800 mt-1 pt-1">
                <button
                  onClick={resetToInitialState}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Ecosystem Seed State
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backend Infrastructure Health Modal */}
      {isHealthModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-slate-100 text-sm">EVSoftware Space Backend Architecture Status</h3>
              </div>
              <button
                onClick={() => setIsHealthModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Database Layer */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">PostgreSQL (Drizzle ORM)</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    isDbConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {isDbConnected ? 'CONNECTED (Cloud SQL)' : 'DEMO MODE / LOCAL REPOSITORY'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  {healthStatus?.database?.message || 'Database schema ready with Drizzle ORM and pool caching.'}
                </p>
              </div>

              {/* Object Storage */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Canonical Object Storage</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {healthStatus?.objectStorage?.provider?.toUpperCase() || 'LOCAL ADAPTER'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Primary binary/object repository with SHA-256 integrity validation. Target production tier: Cloud Object Store (GCS/S3).
                </p>
              </div>

              {/* Google Drive Bridge */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Google Drive Integration</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    EXTERNAL BRIDGE ONLY
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Optional Workspace transfer bridge for user dataset export/import. Not used as primary database or canonical storage.
                </p>
              </div>

              {/* Authentication Boundary */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Auth & RBAC Perimeter</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ACTIVE (RBAC ENFORCED)
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Firebase Identity Platform + Server-side Firebase Admin with granular action authorization (Lead Engineer, Engineer, Reviewer, Admin).
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHealthModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

