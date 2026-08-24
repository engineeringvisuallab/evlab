import React from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  Undo2,
  Redo2,
  PlusCircle,
  Download,
  Printer,
  Moon,
  Sun,
  Settings,
  Briefcase,
  Search,
  CheckCircle2,
  Stethoscope,
  Users,
} from 'lucide-react';

export const Header: React.FC<{
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}> = ({ searchQuery, setSearchQuery }) => {
  const {
    project,
    isDarkMode,
    toggleDarkMode,
    canUndo,
    canRedo,
    undo,
    redo,
    setIsWizardOpen,
    setIsExportModalOpen,
    setIsScheduleDoctorOpen,
    levelProjectResources,
    setCurrentView,
  } = useProject();

  const handleLevelResources = () => {
    const res = levelProjectResources();
    alert(`Resource Leveling Complete:\nAdjusted ${res.levelledTaskCount} task dates to eliminate resource overallocations.`);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 flex flex-col select-none">
      {/* Top Application Bar */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-cyan-900/40">
              EV
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-sm text-slate-100 leading-none">
                EVLab Project Planner
              </span>
              <span className="text-[10px] text-cyan-400 font-medium tracking-wide leading-none mt-0.5">
                Plan. Schedule. Control. Deliver.
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-700/80 mx-2" />

          {/* Project Name Badge */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded px-2.5 py-1 space-x-2">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200 max-w-[280px] truncate">
              {project.name}
            </span>
            <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono border border-slate-700/50">
              {project.code}
            </span>
          </div>
        </div>

        {/* Global Toolbar Quick Controls */}
        <div className="flex items-center space-x-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search tasks, WBS, resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 md:w-56 bg-slate-800/90 text-xs text-slate-100 pl-8 pr-3 py-1 rounded border border-slate-700/70 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            />
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Schedule Doctor */}
          <button
            onClick={() => setIsScheduleDoctorOpen(true)}
            className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/80 px-2.5 py-1.5 rounded transition"
            title="DCMA 14-Point Schedule Audit & Logic Doctor"
          >
            <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">Schedule Doctor</span>
          </button>

          {/* Level Resources */}
          <button
            onClick={handleLevelResources}
            className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2.5 py-1.5 rounded transition"
            title="Automatically resolve resource overallocations"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Level Resources</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* New Project Wizard */}
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center space-x-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-2.5 py-1.5 rounded transition shadow-sm"
            title="Create new project or use template"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-800 rounded border border-slate-700/80 p-0.5 space-x-0.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-1 rounded text-slate-300 hover:bg-slate-700 transition ${
                !canUndo ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-1 rounded text-slate-300 hover:bg-slate-700 transition ${
                !canRedo ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Save Status Indicator */}
          <div className="hidden lg:flex items-center text-[11px] text-emerald-400 space-x-1 bg-emerald-950/40 border border-emerald-800/50 px-2 py-1 rounded">
            <CheckCircle2 className="w-3 h-3" />
            <span>Auto-Saved</span>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Export / Print */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2.5 py-1.5 rounded transition"
            title="Export JSON, CSV or Excel TSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setCurrentView('reports')}
            className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2 py-1.5 rounded transition"
            title="Print or view reports"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
          </button>

          {/* Dark / Light Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded border border-slate-700/80 transition"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setCurrentView('settings')}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/80 transition"
            title="Project Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
