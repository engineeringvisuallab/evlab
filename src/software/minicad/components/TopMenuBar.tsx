import React, { useState, useRef, useEffect } from 'react';
import {
  FileCode,
  FolderOpen,
  Save,
  Download,
  Image,
  RotateCcw,
  RotateCw,
  Trash2,
  Grid,
  Zap,
  HelpCircle,
  Compass,
  Layers as LayersIcon,
  Check,
  ChevronDown,
  Box,
} from 'lucide-react';
import { SAMPLE_DRAWINGS, SampleDrawing } from '../utils/sampleDrawings';

interface TopMenuBarProps {
  onNew: () => void;
  onOpenJSON: () => void;
  onSaveJSON: () => void;
  onExportSVG: () => void;
  onExportDXF: () => void;
  onExportPNG: () => void;
  onExportHTML: () => void;
  onLoadSample: (sample: SampleDrawing) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onZoomExtents: () => void;
  onResetView: () => void;
  gridEnabled: boolean;
  onToggleGrid: () => void;
  snapEnabled: boolean;
  onToggleSnap: () => void;
  orthoEnabled: boolean;
  onToggleOrtho: () => void;
  onOpenShortcuts: () => void;
  onPublishToBim?: () => void;
}

export const TopMenuBar: React.FC<TopMenuBarProps> = ({
  onNew,
  onOpenJSON,
  onSaveJSON,
  onExportSVG,
  onExportDXF,
  onExportPNG,
  onExportHTML,
  onLoadSample,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDeleteSelected,
  onSelectAll,
  onClearAll,
  onZoomExtents,
  onResetView,
  gridEnabled,
  onToggleGrid,
  snapEnabled,
  onToggleSnap,
  orthoEnabled,
  onToggleOrtho,
  onOpenShortcuts,
  onPublishToBim,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (name: string) => {
    setActiveMenu(activeMenu === name ? null : name);
  };

  return (
    <div
      ref={menuRef}
      className="h-9 bg-[#1a1c20] border-b border-[#2d3139] text-[#cfd3dc] text-xs flex items-center justify-between px-3 select-none z-30"
    >
      {/* Left Menu Items */}
      <div className="flex items-center space-x-1">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-2 mr-4 font-semibold tracking-wider text-white">
          <div className="w-5 h-5 bg-[#0078d4] text-white flex items-center justify-center rounded text-[10px] font-bold shadow-sm">
            EVL
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-cyan-200 bg-clip-text text-transparent">
            EVL Mini CAD
          </span>
          <span className="text-[10px] text-gray-500 font-mono">v1.0</span>
        </div>

        {/* FILE MENU */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('file')}
            className={`px-2.5 py-1 rounded hover:bg-[#2c3038] transition-colors ${
              activeMenu === 'file' ? 'bg-[#2c3038] text-white font-medium' : ''
            }`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-[#22252b] border border-[#3a3f4b] rounded shadow-2xl py-1 z-50 text-xs">
              <button
                onClick={() => {
                  onNew();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-blue-400" /> New Drawing
                </span>
                <span className="text-[10px] text-gray-400">Ctrl+N</span>
              </button>

              <button
                onClick={() => {
                  onOpenJSON();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5 text-yellow-400" /> Open JSON...
                </span>
                <span className="text-[10px] text-gray-400">Ctrl+O</span>
              </button>

              <button
                onClick={() => {
                  onSaveJSON();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Save className="w-3.5 h-3.5 text-green-400" /> Save JSON
                </span>
                <span className="text-[10px] text-gray-400">Ctrl+S</span>
              </button>

              <div className="my-1 border-t border-[#3a3f4b]" />

              {/* Sample Drawings Submenu */}
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Sample Drawings
              </div>
              {SAMPLE_DRAWINGS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    onLoadSample(sample);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center gap-2 text-[#cfd3dc] transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{sample.name}</span>
                </button>
              ))}

              <div className="my-1 border-t border-[#3a3f4b]" />

              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Export Options
              </div>
              <button
                onClick={() => {
                  onExportHTML();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors font-medium text-cyan-300"
              >
                <span className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" /> Export Standalone HTML (.html)
                </span>
              </button>
              <button
                onClick={() => {
                  onExportSVG();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-purple-400" /> Export Vector (SVG)
                </span>
              </button>
              <button
                onClick={() => {
                  onExportDXF();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" /> Export AutoCAD (DXF)
                </span>
              </button>
              <button
                onClick={() => {
                  onExportPNG();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Image className="w-3.5 h-3.5 text-pink-400" /> Export Image (PNG)
                </span>
              </button>
            </div>
          )}
        </div>

        {/* EDIT MENU */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('edit')}
            className={`px-2.5 py-1 rounded hover:bg-[#2c3038] transition-colors ${
              activeMenu === 'edit' ? 'bg-[#2c3038] text-white font-medium' : ''
            }`}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-[#22252b] border border-[#3a3f4b] rounded shadow-2xl py-1 z-50 text-xs">
              <button
                disabled={!canUndo}
                onClick={() => {
                  onUndo();
                  setActiveMenu(null);
                }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors ${
                  canUndo ? 'hover:bg-[#0078d4] hover:text-white text-gray-200' : 'text-gray-500 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5" /> Undo
                </span>
                <span className="text-[10px] text-gray-400">Ctrl+Z</span>
              </button>

              <button
                disabled={!canRedo}
                onClick={() => {
                  onRedo();
                  setActiveMenu(null);
                }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors ${
                  canRedo ? 'hover:bg-[#0078d4] hover:text-white text-gray-200' : 'text-gray-500 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-2">
                  <RotateCw className="w-3.5 h-3.5" /> Redo
                </span>
                <span className="text-[10px] text-gray-400">Ctrl+Y</span>
              </button>

              <div className="my-1 border-t border-[#3a3f4b]" />

              <button
                onClick={() => {
                  onDeleteSelected();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-600 hover:text-white flex items-center justify-between transition-colors text-red-300"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                </span>
                <span className="text-[10px] text-gray-400">Del</span>
              </button>

              <button
                onClick={() => {
                  onSelectAll();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors"
              >
                <span>Select All</span>
                <span className="text-[10px] text-gray-400">Ctrl+A</span>
              </button>

              <button
                onClick={() => {
                  onClearAll();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-700 hover:text-white text-red-400 transition-colors"
              >
                <span>Clear Workspace</span>
              </button>
            </div>
          )}
        </div>

        {/* VIEW MENU */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('view')}
            className={`px-2.5 py-1 rounded hover:bg-[#2c3038] transition-colors ${
              activeMenu === 'view' ? 'bg-[#2c3038] text-white font-medium' : ''
            }`}
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-[#22252b] border border-[#3a3f4b] rounded shadow-2xl py-1 z-50 text-xs">
              <button
                onClick={() => {
                  onZoomExtents();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors"
              >
                <span>Zoom Extents</span>
                <span className="text-[10px] text-gray-400">Z + E</span>
              </button>

              <button
                onClick={() => {
                  onResetView();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors"
              >
                <span>Reset View (100%)</span>
              </button>

              <div className="my-1 border-t border-[#3a3f4b]" />

              <button
                onClick={() => {
                  onToggleGrid();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Grid className="w-3.5 h-3.5" /> Toggle Grid
                </span>
                {gridEnabled && <Check className="w-3.5 h-3.5 text-green-400" />}
              </button>

              <button
                onClick={() => {
                  onToggleSnap();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> Toggle Object Snap
                </span>
                {snapEnabled && <Check className="w-3.5 h-3.5 text-green-400" />}
              </button>

              <button
                onClick={() => {
                  onToggleOrtho();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5" /> Toggle Ortho Mode
                </span>
                {orthoEnabled && <Check className="w-3.5 h-3.5 text-green-400" />}
              </button>
            </div>
          )}
        </div>

        {/* HELP MENU */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('help')}
            className={`px-2.5 py-1 rounded hover:bg-[#2c3038] transition-colors ${
              activeMenu === 'help' ? 'bg-[#2c3038] text-white font-medium' : ''
            }`}
          >
            Help
          </button>
          {activeMenu === 'help' && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-[#22252b] border border-[#3a3f4b] rounded shadow-2xl py-1 z-50 text-xs">
              <button
                onClick={() => {
                  onOpenShortcuts();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#0078d4] hover:text-white flex items-center gap-2 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> Keyboard Shortcuts
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Status Badges on right side of menu bar */}
      <div className="flex items-center space-x-3 text-[11px] text-gray-400">
        <button
          onClick={onToggleGrid}
          className={`px-2 py-0.5 rounded border ${
            gridEnabled
              ? 'bg-blue-950/60 border-blue-600/80 text-blue-300'
              : 'border-[#3a3f4b] text-gray-500 hover:text-gray-300'
          }`}
        >
          GRID {gridEnabled ? 'ON' : 'OFF'}
        </button>

        <button
          onClick={onToggleSnap}
          className={`px-2 py-0.5 rounded border ${
            snapEnabled
              ? 'bg-emerald-950/60 border-emerald-600/80 text-emerald-300'
              : 'border-[#3a3f4b] text-gray-500 hover:text-gray-300'
          }`}
        >
          SNAP {snapEnabled ? 'ON' : 'OFF'}
        </button>

        <button
          onClick={onToggleOrtho}
          className={`px-2 py-0.5 rounded border ${
            orthoEnabled
              ? 'bg-purple-950/60 border-purple-600/80 text-purple-300'
              : 'border-[#3a3f4b] text-gray-500 hover:text-gray-300'
          }`}
        >
          ORTHO {orthoEnabled ? 'ON' : 'OFF'}
        </button>

        {onPublishToBim && (
          <button
            onClick={onPublishToBim}
            className="flex items-center gap-1 px-2 py-0.5 rounded border border-[#3a3f4b] text-gray-300 hover:text-white hover:border-blue-600/80 hover:bg-blue-950/40 transition-colors"
            title="Publish this drawing's 3D-capable objects to the shared EVLab BIM workspace"
          >
            <Box className="w-3 h-3 text-blue-400" />
            PUBLISH TO BIM
          </button>
        )}
      </div>
    </div>
  );
};
