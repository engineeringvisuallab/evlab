import React, { useState } from 'react';
import { Search, X, Grid, FolderKanban, Database, ArrowRightLeft, FileCode } from 'lucide-react';
import { useCore } from '../../core/store/coreStore';
import { WorkspaceTab } from '../layout/CoreSidebar';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: WorkspaceTab) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { applications, projects, datasets, transfers } = useCore();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredApps = applications.filter(
    (a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.category.includes(query.toLowerCase())
  );

  const filteredProjects = projects.filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.code.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDatasets = datasets.filter(
    (d) => d.name.toLowerCase().includes(query.toLowerCase()) || d.datasetType.includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950 gap-3">
          <Search className="w-4 h-4 text-blue-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search apps, projects, datasets, revisions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Applications */}
          {filteredApps.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Registered Applications
              </div>
              <div className="space-y-1 mt-1">
                {filteredApps.slice(0, 4).map((app) => (
                  <button
                    key={app.appId}
                    onClick={() => {
                      onNavigate('registry');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Grid className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-medium text-slate-200">{app.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">v{app.version}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">{app.category.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Projects
              </div>
              <div className="space-y-1 mt-1">
                {filteredProjects.slice(0, 3).map((proj) => (
                  <button
                    key={proj.projectId}
                    onClick={() => {
                      onNavigate('projects');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-medium text-slate-200 truncate">{proj.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{proj.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Datasets */}
          {filteredDatasets.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Managed Datasets
              </div>
              <div className="space-y-1 mt-1">
                {filteredDatasets.slice(0, 3).map((ds) => (
                  <button
                    key={ds.datasetId}
                    onClick={() => {
                      onNavigate('datasets');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-medium text-slate-200 truncate">{ds.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Rev #{ds.currentRevisionNumber}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
