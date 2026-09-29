/**
 * EVLab BOQ - Application Top Header
 */

import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Layers,
  Save,
  Search,
  Undo,
  Redo,
  AlertTriangle,
  Plus,
  ChevronDown,
  Moon,
  Sun,
  Keyboard,
  Check,
  FolderOpen,
} from 'lucide-react';
import { ProjectModal } from './ProjectModal';
import { ShortcutGuideModal } from './ShortcutGuideModal';

export const Header: React.FC = () => {
  const {
    projects,
    activeProject,
    saveStatus,
    validationIssues,
    switchProject,
    setIsSearchOpen,
    saveCurrentProject,
    updateProjectSettings,
  } = useAppStore();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);

  const errorsCount = validationIssues.filter((i) => i.severity === 'error').length;
  const warningsCount = validationIssues.filter((i) => i.severity === 'warning').length;

  const currentTheme = activeProject?.settings?.theme || 'blueprint';

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'blueprint' ? 'light' : currentTheme === 'light' ? 'dark' : 'blueprint';
    updateProjectSettings({ theme: nextTheme });
  };

  return (
    <>
      <header className="h-14 bg-slate-900 border-b border-slate-800 text-slate-100 flex items-center justify-between px-4 select-none z-30 relative shadow-md">
        {/* Left Section: Brand Logo & Project Switcher */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-cyan-600 border border-cyan-400/30 flex items-center justify-center text-white shadow-inner font-bold tracking-wider">
              <Layers className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-100 tracking-tight text-sm font-mono">
                  EVLab <span className="text-cyan-400">BOQ</span>
                </span>
                <span className="text-[10px] bg-slate-800 text-cyan-300 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                  v1.0 ENG
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">Engineering Visual Lab</p>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          {/* Active Project Selector */}
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded text-xs text-slate-200 hover:text-white transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <div className="text-left max-w-[180px] md:max-w-[260px] truncate">
                <p className="font-medium text-xs truncate leading-tight">
                  {activeProject ? activeProject.name : 'Select Project'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {activeProject ? `${activeProject.code} • ${activeProject.projectType}` : 'No Project'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {isProjectDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-slate-900 border border-slate-700 rounded-md shadow-xl z-50 py-1.5 text-xs text-slate-200">
                <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Projects ({projects.length})
                  </span>
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      setIsNewProjectModalOpen(true);
                    }}
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-[11px] font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Project</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto py-1">
                  {projects.map((p) => {
                    const isActive = p.id === activeProject?.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          switchProject(p.id);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                          isActive ? 'bg-cyan-950/40 text-cyan-300 border-l-2 border-cyan-400' : ''
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-medium text-xs text-slate-200 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {p.code} | {p.client}
                          </p>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Section: Global Search Command Palette Button */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 bg-slate-950/80 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200 w-72 justify-between transition-all"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search BOQ, WBS, Materials...</span>
            </div>
            <kbd className="bg-slate-800 text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Section: Status, Save, Validation & Tools */}
        <div className="flex items-center space-x-3">
          {/* Validation Status Badge */}
          {(errorsCount > 0 || warningsCount > 0) && (
            <div className="flex items-center space-x-1.5 bg-amber-950/40 border border-amber-800/60 px-2 py-1 rounded text-amber-300 text-[11px] font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {errorsCount > 0 && `${errorsCount} Error${errorsCount > 1 ? 's' : ''}`}
                {errorsCount > 0 && warningsCount > 0 && ' • '}
                {warningsCount > 0 && `${warningsCount} Warning${warningsCount > 1 ? 's' : ''}`}
              </span>
            </div>
          )}

          {/* Save Status Indicator */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={saveCurrentProject}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                saveStatus === 'saved'
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  : saveStatus === 'saving'
                  ? 'bg-cyan-900/50 text-cyan-200 border-cyan-700 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {saveStatus === 'saved'
                  ? 'Saved'
                  : saveStatus === 'saving'
                  ? 'Saving...'
                  : 'Save Changes'}
              </span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Quick Undo / Redo */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              title="Undo (Ctrl+Z)"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              title="Redo (Ctrl+Y)"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={() => setIsShortcutModalOpen(true)}
            title="Keyboard Shortcuts"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors hidden sm:block"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            title={`Current Theme: ${currentTheme.toUpperCase()} (Click to change)`}
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
          >
            {currentTheme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        </div>
      </header>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <ProjectModal onClose={() => setIsNewProjectModalOpen(false)} />
      )}

      {/* Shortcut Guide Modal */}
      {isShortcutModalOpen && (
        <ShortcutGuideModal onClose={() => setIsShortcutModalOpen(false)} />
      )}
    </>
  );
};
