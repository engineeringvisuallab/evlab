/**
 * EVLab WaterFlow - Compact Engineering CAD Toolbar
 */

import React from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { ToolMode } from '../../types/waterflow';
import {
  MousePointer,
  Hand,
  Circle,
  Diamond,
  Square,
  Minus,
  Activity,
  GitCommit,
  PenTool,
  Grid,
  Magnet,
  Compass,
  Box,
  Layers,
  Table,
  Sliders,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const MainToolbar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    viewMode,
    setViewMode,
    gridSnap,
    setGridSnap,
    nodeSnap,
    setNodeSnap,
    orthoMode,
    setOrthoMode,
    model,
    updateModel,
    setActiveDialog,
    runValidation
  } = useWaterFlow();

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scId = e.target.value;
    updateModel(prev => ({
      ...prev,
      activeScenarioId: scId
    }));
  };

  const tools: { id: ToolMode; label: string; icon: React.ReactNode; group: 'navigate' | 'network' | 'cad' }[] = [
    { id: 'select', label: 'Select (S)', icon: <MousePointer className="w-4 h-4" />, group: 'navigate' },
    { id: 'pan', label: 'Pan Canvas (Hand)', icon: <Hand className="w-4 h-4" />, group: 'navigate' },
    { id: 'junction', label: 'Junction Node', icon: <Circle className="w-4 h-4 text-sky-400 fill-sky-400/30" />, group: 'network' },
    { id: 'reservoir', label: 'Reservoir Source', icon: <Diamond className="w-4 h-4 text-cyan-300 fill-cyan-300/30" />, group: 'network' },
    { id: 'tank', label: 'Storage Tank', icon: <Square className="w-4 h-4 text-emerald-400 fill-emerald-400/30" />, group: 'network' },
    { id: 'pipe', label: 'Pipe Link (P)', icon: <Minus className="w-4 h-4 text-blue-400 stroke-[3]" />, group: 'network' },
    { id: 'pump', label: 'Booster Pump', icon: <Activity className="w-4 h-4 text-amber-400" />, group: 'network' },
    { id: 'valve', label: 'Control Valve', icon: <GitCommit className="w-4 h-4 text-purple-400" />, group: 'network' },
    { id: 'cad_line', label: 'CAD Line', icon: <PenTool className="w-4 h-4 text-slate-300" />, group: 'cad' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-slate-300 select-none z-30">
      {/* Left: Engineering Tool Palette */}
      <div className="flex items-center gap-1">
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded border border-slate-700/80">
          {tools.filter(t => t.group === 'navigate').map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={tool.label}
              className={`p-1.5 rounded text-xs font-medium transition flex items-center gap-1 ${
                activeTool === tool.id ? 'bg-cyan-600 text-white shadow-sm' : 'hover:bg-slate-700/60 text-slate-300'
              }`}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-slate-800 mx-1"></div>

        {/* Network Element Drawing Tools */}
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded border border-slate-700/80">
          {tools.filter(t => t.group === 'network').map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={tool.label}
              className={`px-2 py-1.5 rounded text-xs font-medium transition flex items-center gap-1.5 ${
                activeTool === tool.id ? 'bg-cyan-600 text-white shadow-sm' : 'hover:bg-slate-700/60 text-slate-300'
              }`}
            >
              {tool.icon}
              <span className="hidden xl:inline text-[11px] font-semibold">{tool.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-slate-800 mx-1"></div>

        {/* Snapping & Drawing Aids */}
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded border border-slate-700/80 text-[11px]">
          <button
            onClick={() => setGridSnap(!gridSnap)}
            title="Toggle Grid Snapping (F9)"
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${gridSnap ? 'bg-slate-700 text-cyan-400 font-bold' : 'text-slate-400 hover:bg-slate-700/40'}`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setNodeSnap(!nodeSnap)}
            title="Toggle Node Snapping (F3)"
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${nodeSnap ? 'bg-slate-700 text-cyan-400 font-bold' : 'text-slate-400 hover:bg-slate-700/40'}`}
          >
            <Magnet className="w-3.5 h-3.5" />
            <span>Snap</span>
          </button>
          <button
            onClick={() => setOrthoMode(!orthoMode)}
            title="Toggle Orthogonal Pipes (F8)"
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${orthoMode ? 'bg-slate-700 text-cyan-400 font-bold' : 'text-slate-400 hover:bg-slate-700/40'}`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Ortho</span>
          </button>
        </div>
      </div>

      {/* Right: View Toggle, Scenario Selector & Data Tables */}
      <div className="flex items-center gap-2">
        {/* Active Scenario Selector */}
        <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded border border-slate-700 text-xs">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] text-slate-400 font-medium">Scenario:</span>
          <select
            value={model.activeScenarioId}
            onChange={handleScenarioChange}
            className="bg-slate-900 text-cyan-300 rounded px-1.5 py-0.5 font-semibold text-xs border border-slate-700 focus:outline-none focus:border-cyan-500"
          >
            {model.scenarios.map(sc => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2D / 3D Toggle */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded border border-slate-700 text-xs">
          <button
            onClick={() => setViewMode('2D')}
            className={`px-2.5 py-1 rounded transition font-semibold text-[11px] ${viewMode === '2D' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            2D CAD
          </button>
          <button
            onClick={() => setViewMode('3D')}
            className={`px-2.5 py-1 rounded transition font-semibold text-[11px] flex items-center gap-1 ${viewMode === '3D' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Box className="w-3 h-3" />
            <span>3D View</span>
          </button>
        </div>

        {/* Network Data Table Modal Button */}
        <button
          onClick={() => setActiveDialog('table')}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700 text-xs font-semibold transition"
          title="Open Tabular Data Editor"
        >
          <Table className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Data Table</span>
        </button>

        {/* Validate Network Button */}
        <button
          onClick={runValidation}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700 text-xs font-semibold transition"
          title="Audit Network Errors & Warnings"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Validate</span>
        </button>
      </div>
    </div>
  );
};
