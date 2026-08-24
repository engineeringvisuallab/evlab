import React from 'react';
import {
  FileCode,
  FolderOpen,
  Save,
  RotateCcw,
  RotateCw,
  Trash2,
  MousePointer,
  Square,
  Circle as CircleIcon,
  Ruler,
  Maximize2,
  Layers,
  Sparkles,
  Box,
  Layers2,
  BoxSelect,
} from 'lucide-react';
import { ToolType, Layer, ViewMode } from '../types/cad';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onNew: () => void;
  onOpenJSON: () => void;
  onSaveJSON: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  onZoomExtents: () => void;
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (layerId: string) => void;
  activeColor: string;
  onChangeColor: (color: string) => void;
  activeLineWeight: number;
  onChangeLineWeight: (weight: number) => void;
}

const CAD_COLORS = [
  { name: 'Cyan (Default)', hex: '#00ffff' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Green', hex: '#00ff66' },
  { name: 'Yellow', hex: '#ffb703' },
  { name: 'Red', hex: '#ff5555' },
  { name: 'Blue', hex: '#3a86ff' },
  { name: 'Magenta', hex: '#ff006e' },
  { name: 'Orange', hex: '#fb8500' },
];

const LINE_WEIGHTS = [
  { label: 'Thin (1px)', value: 1 },
  { label: 'Medium (2px)', value: 2 },
  { label: 'Thick (3px)', value: 3 },
  { label: 'Heavy (4px)', value: 4 },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  viewMode,
  onSelectViewMode,
  onNew,
  onOpenJSON,
  onSaveJSON,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDeleteSelected,
  hasSelection,
  onZoomExtents,
  layers,
  activeLayerId,
  onSelectLayer,
  activeColor,
  onChangeColor,
  activeLineWeight,
  onChangeLineWeight,
}) => {
  return (
    <div className="h-11 bg-[#20232a] border-b border-[#2d3139] flex items-center justify-between px-3 text-[#d1d5db] select-none shadow-md z-20">
      {/* Left Action Buttons */}
      <div className="flex items-center space-x-1.5">
        {/* 2D vs 3D Mode Switcher Tabs */}
        <div className="flex items-center bg-[#15171c] p-0.5 rounded-lg border border-[#373c47] mr-1">
          <button
            onClick={() => onSelectViewMode('2d')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === '2d'
                ? 'bg-[#0078d4] text-white shadow-sm ring-1 ring-cyan-400'
                : 'text-gray-400 hover:text-white hover:bg-[#282c35]'
            }`}
          >
            <Layers2 className="w-3.5 h-3.5" /> 2D Blueprint
          </button>
          <button
            onClick={() => onSelectViewMode('3d')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm ring-1 ring-cyan-300'
                : 'text-gray-400 hover:text-white hover:bg-[#282c35]'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-cyan-300" /> 3D Solid CAD
          </button>
        </div>

        <div className="h-5 w-px bg-[#353a45] mx-1" />

        <button
          onClick={onNew}
          title="New Drawing (Ctrl+N)"
          className="p-1.5 rounded hover:bg-[#323742] text-gray-300 hover:text-white transition-colors"
        >
          <FileCode className="w-4 h-4 text-blue-400" />
        </button>
        <button
          onClick={onOpenJSON}
          title="Open Drawing (Ctrl+O)"
          className="p-1.5 rounded hover:bg-[#323742] text-gray-300 hover:text-white transition-colors"
        >
          <FolderOpen className="w-4 h-4 text-amber-400" />
        </button>
        <button
          onClick={onSaveJSON}
          title="Save Drawing (Ctrl+S)"
          className="p-1.5 rounded hover:bg-[#323742] text-gray-300 hover:text-white transition-colors"
        >
          <Save className="w-4 h-4 text-emerald-400" />
        </button>

        <div className="h-5 w-px bg-[#353a45] mx-1" />

        {/* Undo / Redo */}
        <button
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
          className={`p-1.5 rounded transition-colors ${
            canUndo ? 'hover:bg-[#323742] text-gray-200' : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo (Ctrl+Y)"
          className={`p-1.5 rounded transition-colors ${
            canRedo ? 'hover:bg-[#323742] text-gray-200' : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-[#353a45] mx-1" />

        {/* Delete */}
        <button
          disabled={!hasSelection}
          onClick={onDeleteSelected}
          title="Delete Selected (Delete)"
          className={`p-1.5 rounded transition-colors ${
            hasSelection
              ? 'hover:bg-red-950 text-red-400 border border-red-800/60'
              : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-[#353a45] mx-1" />

        {/* Quick Tool Pickers */}
        <button
          onClick={() => onSelectTool('select')}
          title="Select Tool (S)"
          className={`p-1.5 rounded flex items-center gap-1 text-xs transition-colors ${
            activeTool === 'select'
              ? 'bg-[#0078d4] text-white font-medium shadow-sm'
              : 'hover:bg-[#323742] text-gray-300'
          }`}
        >
          <MousePointer className="w-4 h-4" />
          <span className="hidden sm:inline">Select</span>
        </button>

        {viewMode === '3d' ? (
          <>
            <button
              onClick={() => onSelectTool('box_3d')}
              title="3D Box Tool (B)"
              className={`p-1.5 rounded flex items-center gap-1 text-xs transition-colors ${
                activeTool === 'box_3d'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'hover:bg-[#323742] text-cyan-300'
              }`}
            >
              <Box className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">3D Box</span>
            </button>
            <button
              onClick={() => onSelectTool('extrude_tool')}
              title="Extrude 2D Shape into 3D (X)"
              className={`p-1.5 rounded flex items-center gap-1 text-xs transition-colors ${
                activeTool === 'extrude_tool'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'hover:bg-[#323742] text-cyan-300'
              }`}
            >
              <Maximize2 className="w-4 h-4 text-cyan-300" />
              <span className="hidden sm:inline">Extrude</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSelectTool('line')}
              title="Line Tool (L)"
              className={`p-1.5 rounded flex items-center gap-1 text-xs transition-colors ${
                activeTool === 'line'
                  ? 'bg-[#0078d4] text-white font-medium shadow-sm'
                  : 'hover:bg-[#323742] text-gray-300'
              }`}
            >
              <div className="w-4 h-0.5 bg-current rotate-45 my-2" />
              <span className="hidden sm:inline">Line</span>
            </button>

            <button
              onClick={() => onSelectTool('rectangle')}
              title="Rectangle Tool (R)"
              className={`p-1.5 rounded flex items-center gap-1 text-xs transition-colors ${
                activeTool === 'rectangle'
                  ? 'bg-[#0078d4] text-white font-medium shadow-sm'
                  : 'hover:bg-[#323742] text-gray-300'
              }`}
            >
              <Square className="w-4 h-4" />
              <span className="hidden sm:inline">Rect</span>
            </button>

            <button
              onClick={() => onSelectTool('circle')}
              title="Circle Tool (C)"
              className={`p-1.5 rounded flex items-center gap-1 text-xs transition-colors ${
                activeTool === 'circle'
                  ? 'bg-[#0078d4] text-white font-medium shadow-sm'
                  : 'hover:bg-[#323742] text-gray-300'
              }`}
            >
              <CircleIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Circle</span>
            </button>
          </>
        )}
      </div>

      {/* Right Tool Styling Controls */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Layer Selector */}
        <div className="flex items-center space-x-1.5 bg-[#1a1c22] border border-[#373c47] rounded px-2 py-1">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] text-gray-400 hidden md:inline">Layer:</span>
          <select
            value={activeLayerId}
            onChange={(e) => onSelectLayer(e.target.value)}
            className="bg-transparent text-white font-medium outline-none cursor-pointer text-xs"
          >
            {layers.map((layer) => (
              <option key={layer.id} value={layer.id} className="bg-[#22252b] text-white">
                {layer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Color Palette Selector */}
        <div className="flex items-center space-x-1.5 bg-[#1a1c22] border border-[#373c47] rounded px-2 py-1">
          <div
            className="w-3.5 h-3.5 rounded-full border border-gray-400 shadow-inner"
            style={{ backgroundColor: activeColor }}
          />
          <select
            value={activeColor}
            onChange={(e) => onChangeColor(e.target.value)}
            className="bg-transparent text-white font-medium outline-none cursor-pointer text-xs"
          >
            {CAD_COLORS.map((c) => (
              <option key={c.hex} value={c.hex} className="bg-[#22252b] text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Line Weight Selector */}
        <div className="flex items-center space-x-1.5 bg-[#1a1c22] border border-[#373c47] rounded px-2 py-1">
          <span className="text-[11px] text-gray-400 hidden lg:inline">Stroke:</span>
          <select
            value={activeLineWeight}
            onChange={(e) => onChangeLineWeight(Number(e.target.value))}
            className="bg-transparent text-white font-medium outline-none cursor-pointer text-xs"
          >
            {LINE_WEIGHTS.map((lw) => (
              <option key={lw.value} value={lw.value} className="bg-[#22252b] text-white">
                {lw.label}
              </option>
            ))}
          </select>
        </div>

        {/* Zoom Extents */}
        <button
          onClick={onZoomExtents}
          title="Zoom Extents (Fit All Objects)"
          className="p-1.5 bg-[#1a1c22] border border-[#373c47] rounded hover:bg-[#323742] text-cyan-400 hover:text-white transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
