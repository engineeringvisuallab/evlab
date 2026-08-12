import React, { useState } from 'react';
import { ProjectMetadata, RevisionRecord } from '../types/wtp';
import { FolderGit2, Plus, Download, Upload, Copy, Save, History, Building, Globe, MapPin } from 'lucide-react';

interface ProjectProps {
  project: ProjectMetadata;
  revisions?: RevisionRecord[];
  onUpdateProject: (updated: Partial<ProjectMetadata>) => void;
  onCreateNewRevision?: (description: string) => void;
}

export const ProjectManagementView: React.FC<ProjectProps> = ({
  project,
  revisions = [],
  onUpdateProject,
  onCreateNewRevision
}) => {
  const [revDescription, setRevDescription] = useState('');

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${project.name.replace(/\s+/g, '_')}_${project.revision}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-cyan-400" />
            <span>Project Management & Revisions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure project metadata, standards, coordinates, unit systems, and version control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Project JSON</span>
          </button>
        </div>
      </div>

      {/* Project Metadata Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            Project General Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Project Name</label>
              <input
                type="text"
                value={project.name}
                onChange={e => onUpdateProject({ name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Project ID / Tag</label>
              <input
                type="text"
                value={project.id}
                onChange={e => onUpdateProject({ id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Client Name</label>
              <input
                type="text"
                value={project.client}
                onChange={e => onUpdateProject({ client: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Consultant Firm</label>
              <input
                type="text"
                value={project.consultant}
                onChange={e => onUpdateProject({ consultant: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Plant Location / City</label>
              <input
                type="text"
                value={project.location}
                onChange={e => onUpdateProject({ location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Country</label>
              <input
                type="text"
                value={project.country}
                onChange={e => onUpdateProject({ country: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Governing Design Standard</label>
              <select
                value={project.designStandard}
                onChange={e => onUpdateProject({ designStandard: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="WHO">WHO 2022 Guidelines</option>
                <option value="Bangladesh ECR 2023">Bangladesh ECR 2023</option>
                <option value="US EPA">US EPA SWTR Regulations</option>
                <option value="EU Directive">EU Water Directive 2020</option>
                <option value="CPHEEO">CPHEEO Manual 2021</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Nominal Plant Capacity (MLD)</label>
              <input
                type="number"
                value={project.plantCapacityMLD}
                onChange={e => onUpdateProject({ plantCapacityMLD: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Revision Control Sidebar Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider font-mono border-b border-slate-800 pb-2 flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Revision History</span>
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Create New Revision</label>
              <input
                type="text"
                placeholder="e.g. Revised filter backwash rates"
                value={revDescription}
                onChange={e => setRevDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none text-xs"
              />
              <button
                onClick={() => {
                  if (!revDescription) return;
                  onCreateNewRevision?.(revDescription);
                  setRevDescription('');
                }}
                className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs transition"
              >
                Commit New Revision
              </button>
            </div>

            <div className="space-y-2 mt-4 max-h-64 overflow-y-auto">
              {revisions.map(rev => (
                <div key={rev.revId} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-cyan-300">
                    <span>{rev.revId}</span>
                    <span className="text-2xs text-slate-500">{rev.date}</span>
                  </div>
                  <div className="text-slate-300 text-3xs">{rev.description}</div>
                  <div className="text-2xs text-slate-500">By: {rev.author}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
