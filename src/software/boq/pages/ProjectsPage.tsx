/**
 * EVLab BOQ - Projects Management Module
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ProjectModal } from '../components/common/ProjectModal';
import { formatCurrency } from '../core/currency';
import {
  FolderKanban,
  Plus,
  Check,
  Trash2,
  Download,
  Upload,
  Calendar,
  Building,
  MapPin,
  Layers,
  FileCode,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const {
    projects,
    activeProject,
    switchProject,
    deleteProject,
    exportProjectJson,
    importProjectJson,
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    const jsonStr = exportProjectJson();
    if (!jsonStr) return;
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject?.code || 'EVLab_BOQ_Project'}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = async () => {
    if (!importJsonText.trim()) return;
    const success = await importProjectJson(importJsonText);
    if (success) {
      setImportJsonText('');
      setIsImporting(false);
      alert('Project imported successfully!');
    } else {
      alert('Failed to parse or import project JSON. Please verify JSON format.');
    }
  };

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
            <FolderKanban className="w-5 h-5 text-cyan-400" />
            <span>Project Portfolio Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Create, switch, back up, export, and manage engineering BOQ projects
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsImporting(!isImporting)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Active</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium font-mono flex items-center space-x-1.5 transition-colors shadow-md shadow-cyan-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Import Panel if Toggled */}
      {isImporting && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-3 font-mono text-xs">
          <p className="font-bold text-cyan-300">Paste EVLab BOQ Project JSON to Import:</p>
          <textarea
            rows={5}
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder='Paste exported JSON string here (e.g. {"project": {...}, "boqItems": [...]})'
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsImporting(false)}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleImportSubmit}
              className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500"
            >
              Import Bundle
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => {
          const isActive = p.id === activeProject?.id;
          return (
            <div
              key={p.id}
              className={`bg-slate-900 border rounded-lg p-4 space-y-3 transition-all relative ${
                isActive
                  ? 'border-cyan-500/80 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[11px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
                    {p.code}
                  </span>
                  <h3 className="font-bold text-sm text-slate-100 font-mono mt-2 leading-snug">{p.name}</h3>
                </div>

                {isActive ? (
                  <span className="flex items-center space-x-1 text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-bold shrink-0">
                    <Check className="w-3 h-3" />
                    <span>ACTIVE</span>
                  </span>
                ) : (
                  <button
                    onClick={() => switchProject(p.id)}
                    className="text-xs font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-800 px-2 py-1 rounded transition-colors shrink-0 border border-slate-800"
                  >
                    Open
                  </button>
                )}
              </div>

              <div className="text-xs space-y-1 text-slate-400 border-t border-b border-slate-800 py-2">
                <p className="flex items-center space-x-1.5 truncate">
                  <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">Client: {p.client}</span>
                </p>
                <p className="flex items-center space-x-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">Location: {p.location}</span>
                </p>
                <p className="flex items-center space-x-1.5 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>
                    {p.startDate} to {p.endDate}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <span className="text-slate-400">Type: {p.projectType}</span>
                {!isActive && projects.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete project ${p.name}?`)) {
                        deleteProject(p.id);
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && <ProjectModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
