import React, { useState } from 'react';
import {
  FolderTree,
  FunctionSquare,
  FileSpreadsheet,
  X,
  Search,
  Plus,
  Play,
  Settings2,
} from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { EngineeringFunctionRegistry } from '../../core/engineering/EngineeringFunctionRegistry';
import { darkTheme } from '../../theme/dark';
import { lightTheme } from '../../theme/light';

export const ProjectExplorer: React.FC = () => {
  const {
    theme,
    sidebarOpen,
    toggleSidebar,
    sidePanelTab,
    setSidePanelTab,
    workbookData,
    setActiveSheet,
    startEditing,
    loadEngineeringTemplate,
  } = useSpreadsheetStore();

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const [searchQuery, setSearchQuery] = useState('');

  if (!sidebarOpen) return null;

  const allEngineeringFuncs = EngineeringFunctionRegistry.getAll();
  const filteredFuncs = allEngineeringFuncs.filter(
    (f) =>
      f.meta.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.meta.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.meta.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className="w-72 border-r flex flex-col select-none text-xs z-30 transition-all duration-200"
      style={{
        backgroundColor: currentTheme.bgSidebar,
        borderColor: currentTheme.borderPrimary,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 bg-slate-900/60 font-semibold">
        <div className="flex items-center gap-2 text-cyan-400">
          <FolderTree className="w-4 h-4" />
          <span>PROJECT EXPLORER</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-700/50 text-[11px] font-medium bg-slate-900/30">
        <button
          onClick={() => setSidePanelTab('explorer')}
          className={`flex-1 py-2 text-center transition-colors border-b-2 ${
            sidePanelTab === 'explorer'
              ? 'border-cyan-400 text-cyan-400 font-bold bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Sheets
        </button>
        <button
          onClick={() => setSidePanelTab('functions')}
          className={`flex-1 py-2 text-center transition-colors border-b-2 ${
            sidePanelTab === 'functions'
              ? 'border-cyan-400 text-cyan-400 font-bold bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Functions
        </button>
        <button
          onClick={() => setSidePanelTab('templates')}
          className={`flex-1 py-2 text-center transition-colors border-b-2 ${
            sidePanelTab === 'templates'
              ? 'border-cyan-400 text-cyan-400 font-bold bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Templates
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Explorer Tab */}
        {sidePanelTab === 'explorer' && (
          <div className="space-y-3">
            <div className="font-semibold text-slate-300 flex items-center justify-between">
              <span>WORKBOOK SHEETS</span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {workbookData.sheets.length} Sheet(s)
              </span>
            </div>

            <div className="space-y-1">
              {workbookData.sheets.map((sheet) => {
                const isActive = sheet.id === workbookData.activeSheetId;
                const cellCount = Object.keys(sheet.cells).length;

                return (
                  <div
                    key={sheet.id}
                    onClick={() => setActiveSheet(sheet.id)}
                    className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-medium'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                      <span>{sheet.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {cellCount} cell(s)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Engineering Functions Tab */}
        {sidePanelTab === 'functions' && (
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search engineering functions..."
                className="w-full pl-8 pr-2 py-1.5 rounded border border-slate-700 bg-slate-900 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Functions List */}
            <div className="space-y-2">
              {filteredFuncs.map((fn) => (
                <div
                  key={fn.meta.name}
                  className="p-2.5 rounded border border-slate-700/80 bg-slate-900/60 space-y-1 hover:border-cyan-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 font-mono">{fn.meta.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 uppercase font-mono">
                      {fn.meta.category}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-snug">{fn.meta.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <code className="text-[10px] text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded font-mono">
                      {fn.meta.example}
                    </code>
                    <button
                      onClick={() => startEditing(`${fn.meta.example}`)}
                      className="p-1 rounded bg-cyan-950 text-cyan-300 hover:bg-cyan-800 transition-colors flex items-center gap-1 font-semibold text-[10px]"
                      title="Insert function into active cell"
                    >
                      <Plus className="w-3 h-3" />
                      Insert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {sidePanelTab === 'templates' && (
          <div className="space-y-3">
            <div className="font-semibold text-slate-300">ENGINEERING TEMPLATES</div>

            <div className="space-y-2">
              <div
                onClick={() => loadEngineeringTemplate('hydraulic')}
                className="p-3 rounded border border-cyan-800 bg-cyan-950/40 hover:bg-cyan-900/50 cursor-pointer transition-all space-y-1"
              >
                <div className="font-bold text-cyan-300 flex items-center justify-between">
                  <span>Pipe Hydraulics Analysis</span>
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-slate-400 text-[11px]">
                  Flow rate, diameter, pipe area, velocity, and Reynolds number calculations.
                </p>
              </div>

              <div
                onClick={() => loadEngineeringTemplate('boq')}
                className="p-3 rounded border border-slate-700 bg-slate-900/60 hover:border-cyan-600 cursor-pointer transition-all space-y-1"
              >
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>Structural BOQ & Quantity</span>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-slate-400 text-[11px]">
                  Bill of quantities, unit costs, total material estimations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
