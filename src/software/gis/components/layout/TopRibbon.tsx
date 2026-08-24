import React, { useState } from 'react';
import { useGIS } from '../../context/GISContext';
import {
  Folder,
  Save,
  Plus,
  FileDown,
  MousePointer,
  Hand,
  MapPin,
  Spline,
  Hexagon,
  Trash2,
  Undo2,
  Redo2,
  Table,
  Palette,
  Sliders,
  Droplets,
  Building2,
  TrendingUp,
  Search,
  Printer,
  History,
  Move,
  RotateCw,
  Maximize,
  Edit2,
  Scissors,
  Combine,
  ShieldCheck,
  BoxSelect,
  Layers,
} from 'lucide-react';

export const TopRibbon: React.FC = () => {
  const {
    project,
    activeTool,
    setActiveTool,
    viewMode,
    setViewMode,
    undo,
    redo,
    historyIndex,
    historyStack,
    deleteSelectedFeatures,
    selectedFeatureIds,
    setIsAttributeTableOpen,
    isAttributeTableOpen,
    setIsCommandPaletteOpen,
    setIsLayoutEditorOpen,
    setIsSymbologyModalOpen,
    setIsAddDataModalOpen,
    setIsAnalysisModalOpen,
    setIsQueryBuilderOpen,
    setIsHistoryPanelOpen,
    setIsFieldManagerOpen,
    setIsGeometryValidationOpen,
    snappingSettings,
    setSnappingSettings,
    saveCurrentProject,
    createNewProject,
    loadSampleProject,
    exportProjectJSON,
    moveSelectedFeatures,
    rotateSelectedFeatures,
    scaleSelectedFeatures,
  } = useGIS();

  const [activeTab, setActiveTab] = useState<'project' | 'edit' | 'data' | 'analysis' | 'engineering' | 'view'>('project');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  const handleCreateNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createNewProject(newProjName, newProjDesc);
    setIsNewProjectModalOpen(false);
    setNewProjName('');
    setNewProjDesc('');
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 flex flex-col text-slate-200 select-none">
      {/* Top Application Bar */}
      <div className="h-10 px-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-black text-sm tracking-tight text-white">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-mono text-xs shadow-md">
              EV
            </div>
            <span>EVLab GIS</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Current Project Name */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Project:</span>
            <span className="font-semibold text-cyan-400 truncate max-w-[220px]">{project.name}</span>
          </div>
        </div>

        {/* Global Utilities */}
        <div className="flex items-center gap-3">
          {/* Universal Command Search Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1 rounded text-xs transition"
          >
            <Search size={13} className="text-cyan-400" />
            <span>Search Tool / Command...</span>
            <kbd className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-800 text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
              className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 transition"
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= historyStack.length - 1}
              title="Redo (Ctrl+Y)"
              className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 transition"
            >
              <Redo2 size={14} />
            </button>
          </div>

          {/* 2D / 3D Switch */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setViewMode('2D')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                viewMode === '2D' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D MAP
            </button>
            <button
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                viewMode === '3D' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D VIEW
            </button>
          </div>
        </div>
      </div>

      {/* Ribbon Tab Navigation Headers */}
      <div className="flex items-center gap-1 px-3 pt-1 border-b border-slate-800 bg-slate-900 text-xs font-medium text-slate-400">
        {[
          { id: 'project', label: 'PROJECT' },
          { id: 'edit', label: 'EDIT & CAD' },
          { id: 'data', label: 'DATA & SCHEMA' },
          { id: 'analysis', label: 'SPATIAL ANALYSIS' },
          { id: 'engineering', label: 'WATER & ENGINEERING' },
          { id: 'view', label: 'VIEW & LAYOUT' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded-t-md transition border-t border-x ${
              activeTab === tab.id
                ? 'bg-slate-800 border-slate-700 text-cyan-300 font-semibold shadow'
                : 'border-transparent hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ribbon Action Toolbar Body */}
      <div className="h-14 px-4 bg-slate-900 flex items-center gap-6 text-xs overflow-x-auto scrollbar-none">
        {/* TAB 1: PROJECT */}
        {activeTab === 'project' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex flex-col items-center gap-1 px-3 py-1 hover:bg-slate-800 rounded transition text-slate-300 hover:text-white"
            >
              <Plus size={16} className="text-cyan-400" />
              <span>New Project</span>
            </button>
            <button
              onClick={saveCurrentProject}
              className="flex flex-col items-center gap-1 px-3 py-1 hover:bg-slate-800 rounded transition text-slate-300 hover:text-white"
            >
              <Save size={16} className="text-emerald-400" />
              <span>Save Project</span>
            </button>
            <button
              onClick={loadSampleProject}
              className="flex flex-col items-center gap-1 px-3 py-1 hover:bg-slate-800 rounded transition text-slate-300 hover:text-white"
            >
              <Folder size={16} className="text-amber-400" />
              <span>Load Water Sample</span>
            </button>
            <div className="h-8 w-px bg-slate-800" />
            <button
              onClick={() => exportProjectJSON()}
              className="flex flex-col items-center gap-1 px-3 py-1 hover:bg-slate-800 rounded transition text-slate-300 hover:text-white"
            >
              <FileDown size={16} className="text-blue-400" />
              <span>Export JSON</span>
            </button>
          </div>
        )}

        {/* TAB 2: EDIT & CAD */}
        {activeTab === 'edit' && (
          <div className="flex items-center gap-3">
            {/* Selection Tools */}
            <div className="flex items-center bg-slate-950 p-1 rounded border border-slate-800 gap-1">
              <button
                onClick={() => setActiveTool('select')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'select' ? 'bg-cyan-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
                title="Point / Single Select"
              >
                <MousePointer size={14} />
                <span>Select</span>
              </button>
              <button
                onClick={() => setActiveTool('select_box')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'select_box' ? 'bg-cyan-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
                title="Box Drag Select"
              >
                <BoxSelect size={14} />
                <span>Box</span>
              </button>
              <button
                onClick={() => setActiveTool('pan')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'pan' ? 'bg-cyan-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
                title="Pan Canvas"
              >
                <Hand size={14} />
                <span>Pan</span>
              </button>
            </div>

            {/* Geometry Digitizers */}
            <div className="flex items-center bg-slate-950 p-1 rounded border border-slate-800 gap-1">
              <button
                onClick={() => setActiveTool('draw_point')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'draw_point' ? 'bg-cyan-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <MapPin size={14} />
                <span>Point</span>
              </button>
              <button
                onClick={() => setActiveTool('draw_line')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'draw_line' ? 'bg-cyan-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Spline size={14} />
                <span>Line</span>
              </button>
              <button
                onClick={() => setActiveTool('draw_polygon')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'draw_polygon' ? 'bg-cyan-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Hexagon size={14} />
                <span>Polygon</span>
              </button>
            </div>

            {/* CAD Geometry Transform Tools */}
            <div className="flex items-center bg-slate-950 p-1 rounded border border-slate-800 gap-1">
              <button
                onClick={() => setActiveTool('edit_vertices')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'edit_vertices' ? 'bg-amber-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
                title="Edit Vertices (E)"
              >
                <Edit2 size={14} />
                <span>Vertices</span>
              </button>
              <button
                onClick={() => setActiveTool('transform_move')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'transform_move' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
                title="Move (M)"
              >
                <Move size={14} />
                <span>Move</span>
              </button>
              <button
                onClick={() => setActiveTool('transform_rotate')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'transform_rotate' ? 'bg-purple-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
                title="Rotate (R)"
              >
                <RotateCw size={14} />
                <span>Rotate</span>
              </button>
              <button
                onClick={() => setActiveTool('transform_scale')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'transform_scale' ? 'bg-sky-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
                title="Scale (S)"
              >
                <Maximize size={14} />
                <span>Scale</span>
              </button>
            </div>

            {/* CAD Snapping Settings Bar */}
            <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
              <span className="text-slate-400 font-bold">SNAP:</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={snappingSettings.vertex}
                  onChange={(e) => setSnappingSettings({ ...snappingSettings, vertex: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 accent-cyan-500"
                />
                <span>Vertex</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={snappingSettings.endpoint}
                  onChange={(e) => setSnappingSettings({ ...snappingSettings, endpoint: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 accent-cyan-500"
                />
                <span>Endpoint</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={snappingSettings.midpoint}
                  onChange={(e) => setSnappingSettings({ ...snappingSettings, midpoint: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 accent-cyan-500"
                />
                <span>Midpoint</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={snappingSettings.intersection}
                  onChange={(e) => setSnappingSettings({ ...snappingSettings, intersection: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 accent-cyan-500"
                />
                <span>Intersect</span>
              </label>
            </div>

            {/* Delete Selection */}
            {selectedFeatureIds.length > 0 && (
              <button
                onClick={deleteSelectedFeatures}
                className="flex items-center gap-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 px-3 py-1.5 rounded transition font-semibold"
              >
                <Trash2 size={14} />
                <span>Delete ({selectedFeatureIds.length})</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 3: DATA & SCHEMA */}
        {activeTab === 'data' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddDataModalOpen(true)}
              className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded font-semibold transition shadow-md"
            >
              <Plus size={15} />
              <span>Add Data / Import</span>
            </button>
            <button
              onClick={() => setIsAttributeTableOpen(!isAttributeTableOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition ${
                isAttributeTableOpen
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Table size={15} />
              <span>Attribute Table</span>
            </button>
            <button
              onClick={() => setIsFieldManagerOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 px-3 py-1.5 rounded transition"
            >
              <Sliders size={15} />
              <span>Field Manager</span>
            </button>
            <button
              onClick={() => setIsGeometryValidationOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 px-3 py-1.5 rounded transition"
            >
              <ShieldCheck size={15} />
              <span>Topology Audit</span>
            </button>
            <button
              onClick={() => setIsSymbologyModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 px-3 py-1.5 rounded transition"
            >
              <Palette size={15} />
              <span>Layer Symbology</span>
            </button>
          </div>
        )}

        {/* TAB 4: SPATIAL ANALYSIS */}
        {activeTab === 'analysis' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAnalysisModalOpen(true)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-semibold transition shadow-md"
            >
              <Sliders size={15} />
              <span>Buffer & Overlay Tools</span>
            </button>
            <button
              onClick={() => setIsQueryBuilderOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded transition"
            >
              <Search size={15} />
              <span>Select By Attribute</span>
            </button>
          </div>
        )}

        {/* TAB 5: WATER & ENGINEERING */}
        {activeTab === 'engineering' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider px-2 font-bold">Water Network:</span>
              <button
                onClick={() => setActiveTool('water_pipe')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'water_pipe' ? 'bg-cyan-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Droplets size={14} />
                <span>Pipe (DN 250)</span>
              </button>
              <button
                onClick={() => setActiveTool('water_valve')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'water_valve' ? 'bg-cyan-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Sliders size={14} />
                <span>Control Valve</span>
              </button>
              <button
                onClick={() => setActiveTool('water_hydrant')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'water_hydrant' ? 'bg-cyan-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Building2 size={14} />
                <span>Fire Hydrant</span>
              </button>
            </div>

            <button
              onClick={() => setActiveTool('elevation_profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition ${
                activeTool === 'elevation_profile'
                  ? 'bg-amber-950 border-amber-500 text-amber-300 font-semibold'
                  : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <TrendingUp size={15} />
              <span>Elevation Cross-Section</span>
            </button>
          </div>
        )}

        {/* TAB 6: VIEW & LAYOUT */}
        {activeTab === 'view' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLayoutEditorOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded font-semibold transition shadow-md"
            >
              <Printer size={15} />
              <span>Map Layout & Export PDF</span>
            </button>
            <button
              onClick={() => setIsHistoryPanelOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded transition"
            >
              <History size={15} />
              <span>History Log ({historyStack.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewSubmit}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl w-full max-w-md space-y-4"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="text-cyan-400" size={18} />
              Create New EVLab GIS Project
            </h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Project Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dhaka Water Supply Phase 2"
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Description / Notes</label>
              <textarea
                rows={3}
                placeholder="Engineering GIS project details..."
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold transition"
              >
                Create Workspace
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
