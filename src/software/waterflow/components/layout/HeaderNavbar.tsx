/**
 * EVLab WaterFlow - Professional Header Navigation Bar
 * Features Engineering Dropdown Menus: File, Edit, View, Model, Analysis, Scenario, GIS, CAD, Results, Reports, Help
 */

import React, { useState, useRef, useEffect } from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { createSampleCityNetwork } from '../../core/sampleData/sampleNetworks';
import { EPANETParser } from '../../core/parser/epanetParser';
import {
  FolderOpen,
  Save,
  Play,
  RotateCcw,
  RotateCw,
  Layers,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  Activity,
  CheckCircle2,
  Box,
  MapPin,
  Compass,
  Sliders,
  ChevronDown,
  Droplets
} from 'lucide-react';

export const HeaderNavbar: React.FC = () => {
  const {
    model,
    setModel,
    runSimulation,
    runValidation,
    canUndo,
    canRedo,
    undo,
    redo,
    viewMode,
    setViewMode,
    resultTheme,
    setResultTheme,
    setActiveDialog,
    executeCommand
  } = useWaterFlow();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.navbar-dropdown')) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = (menuName: string) => {
    setActiveMenu(prev => (prev === menuName ? null : menuName));
  };

  const handleNewProject = () => {
    if (confirm('Create new empty project? Current unsaved changes will be lost.')) {
      setModel({
        id: `project-${Date.now()}`,
        title: 'New Water Distribution Project',
        nodes: new Map(),
        links: new Map(),
        patterns: [],
        cadAnnotations: [],
        gisLayers: [],
        scenarios: [
          {
            id: 'base',
            name: 'Base Scenario',
            description: 'Default baseline model',
            demandMultiplier: 1.0,
            overrides: {}
          }
        ],
        activeScenarioId: 'base'
      });
      setActiveMenu(null);
    }
  };

  const handleLoadSample = () => {
    setModel(createSampleCityNetwork());
    setTimeout(() => runSimulation(), 100);
    setActiveMenu(null);
  };

  const handleSaveJson = () => {
    const jsonStr = JSON.stringify({
      ...model,
      nodes: Array.from(model.nodes instanceof Map ? model.nodes.entries() : Object.entries(model.nodes)),
      links: Array.from(model.links instanceof Map ? model.links.entries() : Object.entries(model.links))
    }, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.title.toLowerCase().replace(/\s+/g, '_')}_model.json`;
    a.click();
    URL.revokeObjectURL(url);
    setActiveMenu(null);
  };

  const handleExportINP = () => {
    const inpText = EPANETParser.exportINP(model);
    const blob = new Blob([inpText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.title.toLowerCase().replace(/\s+/g, '_')}.inp`;
    a.click();
    URL.revokeObjectURL(url);
    setActiveMenu(null);
  };

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith('.inp')) {
        const parsedModel = EPANETParser.parseINP(content);
        setModel(parsedModel);
        setTimeout(() => runSimulation(), 150);
      } else if (file.name.endsWith('.json')) {
        try {
          const raw = JSON.parse(content);
          const nodesMap = new Map(raw.nodes);
          const linksMap = new Map(raw.links);
          setModel({
            ...raw,
            nodes: nodesMap,
            links: linksMap
          });
          setTimeout(() => runSimulation(), 150);
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      }
    };
    reader.readAsText(file);
    setActiveMenu(null);
  };

  return (
    <header className="h-11 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 text-slate-200 select-none text-xs font-medium z-40 relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleOpenFile}
        accept=".inp,.json"
        className="hidden"
      />

      {/* Brand & EVL Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-2.5 py-1 rounded shadow-sm">
          <Droplets className="w-4 h-4 text-cyan-200 animate-pulse" />
          <span className="font-bold tracking-wide text-xs">EVLab WaterFlow</span>
          <span className="text-[10px] bg-slate-900/40 px-1.5 py-0.5 rounded text-cyan-200 uppercase font-mono">v3.2 PRO</span>
        </div>

        {/* Dropdown Menus */}
        <nav className="flex items-center gap-1 ml-2">
          {/* FILE MENU */}
          <div className="relative navbar-dropdown">
            <button
              onClick={() => toggleMenu('file')}
              className={`px-2.5 py-1 rounded hover:bg-slate-800 transition ${activeMenu === 'file' ? 'bg-slate-800 text-cyan-400' : ''}`}
            >
              File
            </button>

            {activeMenu === 'file' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-md shadow-2xl py-1 z-50 text-slate-300 font-sans">
                <button onClick={handleNewProject} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 hover:text-cyan-400 flex items-center justify-between">
                  <span>New Model</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+N</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 hover:text-cyan-400 flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open Model (.INP, .JSON)...</span>
                </button>
                <button onClick={handleLoadSample} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 hover:text-cyan-400 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Load Sample Metro District 4</span>
                </button>
                <div className="border-t border-slate-800 my-1"></div>
                <button onClick={handleSaveJson} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 hover:text-cyan-400 flex items-center gap-2">
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save Project (.JSON)</span>
                </button>
                <button onClick={handleExportINP} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 hover:text-cyan-400 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export EPANET (.INP)</span>
                </button>
                <div className="border-t border-slate-800 my-1"></div>
                <button onClick={() => { setActiveDialog('import_export'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 hover:text-cyan-400">
                  Import / Export Center...
                </button>
              </div>
            )}
          </div>

          {/* EDIT MENU */}
          <div className="relative navbar-dropdown">
            <button
              onClick={() => toggleMenu('edit')}
              className={`px-2.5 py-1 rounded hover:bg-slate-800 transition ${activeMenu === 'edit' ? 'bg-slate-800 text-cyan-400' : ''}`}
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-md shadow-2xl py-1 z-50 text-slate-300">
                <button disabled={!canUndo} onClick={() => { undo(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 disabled:opacity-40 flex items-center justify-between">
                  <span>Undo</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+Z</span>
                </button>
                <button disabled={!canRedo} onClick={() => { redo(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 disabled:opacity-40 flex items-center justify-between">
                  <span>Redo</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+Y</span>
                </button>
                <div className="border-t border-slate-800 my-1"></div>
                <button onClick={() => { executeCommand('SELECT ALL'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800">
                  Select All
                </button>

                <button onClick={() => { setActiveDialog('table'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800">
                  Network Data Table Editor...
                </button>
              </div>
            )}
          </div>

          {/* VIEW MENU */}
          <div className="relative navbar-dropdown">
            <button
              onClick={() => toggleMenu('view')}
              className={`px-2.5 py-1 rounded hover:bg-slate-800 transition ${activeMenu === 'view' ? 'bg-slate-800 text-cyan-400' : ''}`}
            >
              View
            </button>
            {activeMenu === 'view' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-md shadow-2xl py-1 z-50 text-slate-300">
                <button onClick={() => { setViewMode('2D'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between">
                  <span>2D CAD Engineering View</span>
                  {viewMode === '2D' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
                <button onClick={() => { setViewMode('3D'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between">
                  <span>3D WebGL Visualization View</span>
                  {viewMode === '3D' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
                <div className="border-t border-slate-800 my-1"></div>
                <div className="px-3 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Result Color Theme</div>
                {(['pressure', 'head', 'flow', 'velocity', 'headloss', 'elevation', 'none'] as const).map(theme => (
                  <button
                    key={theme}
                    onClick={() => { setResultTheme(theme); setActiveMenu(null); }}
                    className="w-full px-3 py-1 text-left hover:bg-slate-800 capitalize flex items-center justify-between text-slate-300"
                  >
                    <span>{theme}</span>
                    {resultTheme === theme && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ANALYSIS MENU */}
          <div className="relative navbar-dropdown">
            <button
              onClick={() => toggleMenu('analysis')}
              className={`px-2.5 py-1 rounded hover:bg-slate-800 transition ${activeMenu === 'analysis' ? 'bg-slate-800 text-cyan-400' : ''}`}
            >
              Analysis
            </button>
            {activeMenu === 'analysis' && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-md shadow-2xl py-1 z-50 text-slate-300">
                <button onClick={() => { runSimulation(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 hover:text-emerald-400 flex items-center gap-2 font-semibold">
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Run Hydraulic Simulation</span>
                </button>
                <button onClick={() => { runValidation(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Validate Network Topology</span>
                </button>
                <div className="border-t border-slate-800 my-1"></div>
                <button onClick={() => { setActiveDialog('profile'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Longitudinal Profile Viewer</span>
                </button>
                <button onClick={() => { setActiveDialog('system_curve'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pump & System Head Curve Analysis</span>
                </button>
                <button onClick={() => { setActiveDialog('dashboard'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hydraulic Performance Dashboard</span>
                </button>
                <div className="border-t border-slate-800 my-1"></div>
                <button onClick={() => { setActiveDialog('settings'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Calculation Engine Options...</span>
                </button>
              </div>
            )}
          </div>

          {/* SCENARIOS */}
          <button onClick={() => setActiveDialog('scenario')} className="px-2.5 py-1 rounded hover:bg-slate-800 transition">
            Scenarios
          </button>

          {/* REPORTS */}
          <button onClick={() => setActiveDialog('report')} className="px-2.5 py-1 rounded hover:bg-slate-800 transition">
            Reports
          </button>
        </nav>
      </div>

      {/* Model Name & Run Action */}
      <div className="flex items-center gap-3">
        <span className="text-slate-400 hidden lg:inline font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 truncate max-w-[220px]">
          {model.title}
        </span>

        <button
          onClick={runSimulation}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded font-semibold text-xs shadow-md shadow-emerald-900/40 transition active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Solver</span>
        </button>
      </div>
    </header>
  );
};
