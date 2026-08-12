import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Sliders, Save, CheckCircle, RefreshCw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { project, updateProject, recalculateProjectSchedule } = useProject();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 select-none font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Project Properties & Control Configuration
              </h1>
              <p className="text-xs text-slate-400">
                Manage project metadata, scheduling preferences, currency formats, and CPM engine settings.
              </p>
            </div>
          </div>
          <button
            onClick={() => recalculateProjectSchedule()}
            className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate CPM Schedule</span>
          </button>
        </div>

        {/* Project General Information Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            General Project Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Project Name</label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => updateProject({ name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Project ID / Code</label>
              <input
                type="text"
                value={project.code}
                onChange={(e) => updateProject({ code: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Client Authority / Owner</label>
              <input
                type="text"
                value={project.client}
                onChange={(e) => updateProject({ client: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Project Manager / Engineer</label>
              <input
                type="text"
                value={project.projectManager}
                onChange={(e) => updateProject({ projectManager: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Project Start Date</label>
              <input
                type="date"
                value={project.startDate}
                onChange={(e) => updateProject({ startDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Currency Symbol</label>
              <select
                value={project.currency}
                onChange={(e) => updateProject({ currency: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none"
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="AED">AED (AED)</option>
                <option value="₹">INR (₹)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
