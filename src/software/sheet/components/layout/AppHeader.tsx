import React, { useState } from 'react';
import {
  FileText,
  Undo2,
  Redo2,
  Sun,
  Moon,
  FolderOpen,
  Save,
  Download,
  Sidebar,
  HelpCircle,
  Plus,
  Table,
  Check,
} from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { darkTheme } from '../../theme/dark';
import { lightTheme } from '../../theme/light';

export const AppHeader: React.FC = () => {
  const {
    theme,
    toggleTheme,
    workbookData,
    undo,
    redo,
    canUndo,
    canRedo,
    sidebarOpen,
    toggleSidebar,
    addSheet,
    loadEngineeringTemplate,
  } = useSpreadsheetStore();

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [workbookName, setWorkbookName] = useState(workbookData.name);
  const [isEditingName, setIsEditingName] = useState(false);

  const menus = ['File', 'Edit', 'View', 'Insert', 'Format', 'Data', 'Engineering', 'Help'];

  return (
    <header
      className="flex flex-col border-b select-none transition-colors duration-200"
      style={{
        backgroundColor: currentTheme.bgHeader,
        borderColor: currentTheme.borderPrimary,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Top Application Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700/30 text-xs">
        <div className="flex items-center gap-2">
          {/* EVLab Brand Icon */}
          <div className="flex items-center gap-1.5 font-bold tracking-wide text-sm pr-2 border-r border-slate-700/50">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
              EV
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-extrabold">
              EVLab
            </span>
            <span className="font-semibold text-slate-300">Sheet</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">
              v1.0
            </span>
          </div>

          {/* Workbook Title Editor */}
          <div className="flex items-center gap-1.5 pl-1">
            {isEditingName ? (
              <input
                type="text"
                value={workbookName}
                onChange={(e) => setWorkbookName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingName(false);
                }}
                autoFocus
                className="px-1.5 py-0.5 rounded border border-cyan-500 bg-slate-900 text-cyan-300 text-xs font-medium focus:outline-none"
              />
            ) : (
              <span
                onClick={() => setIsEditingName(true)}
                className="font-medium hover:bg-slate-800/50 px-2 py-0.5 rounded cursor-pointer transition-colors"
                title="Click to rename workbook"
              >
                {workbookName}
              </span>
            )}
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Saved
            </span>
          </div>
        </div>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Undo / Redo */}
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="p-1 rounded hover:bg-slate-700/40 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="p-1 rounded hover:bg-slate-700/40 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-[1px] bg-slate-700/50 mx-1" />

          {/* Toggle Sidebar */}
          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded transition-colors ${
              sidebarOpen ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50' : 'hover:bg-slate-800'
            }`}
            title="Toggle Project Explorer Sidebar"
          >
            <Sidebar className="w-3.5 h-3.5" />
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-slate-800 text-amber-400 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Main Menu Dropdown Bar */}
      <div className="flex items-center px-2 py-0.5 text-xs font-normal relative">
        {menus.map((menu) => (
          <div key={menu} className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeMenu === menu
                  ? 'bg-slate-800 text-cyan-400 font-medium'
                  : 'hover:bg-slate-800/50 text-slate-300'
              }`}
            >
              {menu}
            </button>

            {/* Menu Dropdown Popup */}
            {activeMenu === menu && (
              <div
                className="absolute left-0 top-full mt-1 w-48 rounded-md border shadow-xl z-50 py-1 font-medium text-xs backdrop-blur-md"
                style={{
                  backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                  borderColor: currentTheme.borderPrimary,
                  color: currentTheme.textPrimary,
                }}
              >
                {menu === 'File' && (
                  <>
                    <button
                      onClick={() => {
                        addSheet();
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-600/20 hover:text-cyan-400 flex items-center justify-between"
                    >
                      <span>New Sheet</span>
                      <span className="text-[10px] text-slate-500">Ctrl+N</span>
                    </button>
                    <button
                      onClick={() => {
                        loadEngineeringTemplate('hydraulic');
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-600/20 hover:text-cyan-400"
                    >
                      Load Pipe Hydraulics Template
                    </button>
                    <div className="h-[1px] bg-slate-700/40 my-1" />
                    <button
                      onClick={() => setActiveMenu(null)}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-600/20 hover:text-cyan-400 flex items-center justify-between"
                    >
                      <span>Save Native (.evsheet)</span>
                      <span className="text-[10px] text-slate-500">Ctrl+S</span>
                    </button>
                  </>
                )}

                {menu === 'Engineering' && (
                  <>
                    <button
                      onClick={() => {
                        loadEngineeringTemplate('hydraulic');
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-600/20 hover:text-cyan-400"
                    >
                      Hydraulics & Pipe Flow
                    </button>
                    <button
                      onClick={() => {
                        loadEngineeringTemplate('boq');
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-cyan-600/20 hover:text-cyan-400"
                    >
                      Quantity BOQ Calculator
                    </button>
                  </>
                )}

                {menu !== 'File' && menu !== 'Engineering' && (
                  <div className="px-3 py-2 text-slate-400 text-[11px]">
                    {menu} features enabled & linked to Ribbon
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </header>
  );
};
