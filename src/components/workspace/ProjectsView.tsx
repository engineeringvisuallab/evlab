/**
 * EV Software Core - Project Context & Management
 * View projects, configure metadata, assign team members & permissions,
 * and view associated datasets.
 */

import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Users,
  Database,
  MapPin,
  Calendar,
  ShieldCheck,
  Check,
  Globe,
  FileCode,
} from 'lucide-react';
import { useCore } from '../../core/store/coreStore';
import { Project, ProjectType, UserRole } from '../../types/core';
import { Badge } from '../common/Badge';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    createProject,
    datasets,
    transfers,
    currentUser,
  } = useCore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCode, setNewProjectCode] = useState('');
  const [newProjectType, setNewProjectType] = useState<ProjectType>('water_supply');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    createProject({
      name: newProjectName,
      code: newProjectCode || `EV-PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
      projectType: newProjectType,
      description: newProjectDesc,
      location: newProjectLocation,
      coordinateSystem: 'EPSG:3857',
    });

    setIsCreateModalOpen(false);
    setNewProjectName('');
    setNewProjectCode('');
    setNewProjectDesc('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Project Context Management</h1>
            <Badge variant="primary">{projects.length} Workspaces</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Projects act as isolated containers for heterogeneous engineering datasets, members, and transfer history.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isActive = proj.projectId === activeProjectId;
          const projectDatasets = datasets.filter((d) => d.projectId === proj.projectId);
          const projectTransfers = transfers.filter((t) => t.projectId === proj.projectId);

          return (
            <div
              key={proj.projectId}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-blue-400 tracking-wider">
                      {proj.code}
                    </span>
                    <h3 className="font-bold text-slate-100 text-sm mt-0.5 leading-snug">{proj.name}</h3>
                  </div>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-semibold border border-blue-500/30 shrink-0">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {proj.description || 'No description provided.'}
                </p>

                <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{proj.location || 'Regional Zone'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[10px] text-slate-400">{proj.coordinateSystem || 'EPSG:3857'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{proj.members.length} team member(s)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span>{projectDatasets.length} Datasets</span>
                  <span>•</span>
                  <span>{projectTransfers.length} Transfers</span>
                </div>

                {isActive ? (
                  <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveProjectId(proj.projectId)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                  >
                    Select Context
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-100">Create New Project Workspace</h2>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Valley Water Treatment Plant Expansion"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Project Code</label>
                  <input
                    type="text"
                    placeholder="EV-WSP-2026-009"
                    value={newProjectCode}
                    onChange={(e) => setNewProjectCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Domain Type</label>
                  <select
                    value={newProjectType}
                    onChange={(e) => setNewProjectType(e.target.value as ProjectType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="water_supply">Water Supply Network</option>
                    <option value="wastewater">Wastewater / STP</option>
                    <option value="urban_drainage">Urban Stormwater Drainage</option>
                    <option value="civil_infrastructure">Civil Infrastructure</option>
                    <option value="industrial_plant">Industrial Plant</option>
                    <option value="general">General Engineering</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Location / Corridor</label>
                <input
                  type="text"
                  placeholder="e.g. North Metropolitan District"
                  value={newProjectLocation}
                  onChange={(e) => setNewProjectLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Project scope, design parameters, and engineering objectives..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition-all"
                >
                  Initialize Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
