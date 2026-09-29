import React from 'react';
import { Point2D, ToolType } from '../types/cad';

interface StatusBarProps {
  cursorWorld: Point2D | null;
  zoomPercent: number;
  activeTool: ToolType;
  gridEnabled: boolean;
  onToggleGrid: () => void;
  snapEnabled: boolean;
  onToggleSnap: () => void;
  orthoEnabled: boolean;
  onToggleOrtho: () => void;
  objectCount: number;
  statusInstruction: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  cursorWorld,
  zoomPercent,
  activeTool,
  gridEnabled,
  onToggleGrid,
  snapEnabled,
  onToggleSnap,
  orthoEnabled,
  onToggleOrtho,
  objectCount,
  statusInstruction,
}) => {
  return (
    <div className="h-7 bg-[#16181d] border-t border-[#2d3139] flex items-center justify-between px-3 text-[11px] font-mono text-[#a0a5b2] select-none z-20">
      {/* Left: Active Command Guidance Prompt */}
      <div className="flex items-center space-x-3 overflow-hidden">
        <span className="bg-[#262932] text-cyan-300 px-2 py-0.5 rounded font-bold uppercase tracking-wide border border-[#3b404e] shrink-0">
          {activeTool}
        </span>
        <span className="text-gray-300 font-medium truncate">
          {statusInstruction || 'Ready. Click tool or enter command.'}
        </span>
      </div>

      {/* Right: Coordinates, Zoom, Snaps & Stats */}
      <div className="flex items-center space-x-4 shrink-0">
        {/* Real-World Coordinates */}
        <div className="flex items-center space-x-2 bg-[#1f222a] border border-[#2e333e] px-2.5 py-0.5 rounded text-gray-200">
          <span>X: <strong className="text-cyan-400 font-bold">{cursorWorld ? cursorWorld.x.toFixed(2) : '0.00'}</strong></span>
          <span className="text-gray-600">|</span>
          <span>Y: <strong className="text-green-400 font-bold">{cursorWorld ? cursorWorld.y.toFixed(2) : '0.00'}</strong></span>
        </div>

        {/* Zoom % */}
        <div className="text-amber-400 font-bold bg-[#1f222a] border border-[#2e333e] px-2 py-0.5 rounded">
          {Math.round(zoomPercent)}%
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onToggleGrid}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              gridEnabled
                ? 'bg-blue-950 border-blue-600 text-blue-300 font-bold'
                : 'border-gray-800 text-gray-600 hover:text-gray-400'
            }`}
          >
            GRID [F7]
          </button>

          <button
            onClick={onToggleSnap}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              snapEnabled
                ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold'
                : 'border-gray-800 text-gray-600 hover:text-gray-400'
            }`}
          >
            SNAP [F3]
          </button>

          <button
            onClick={onToggleOrtho}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              orthoEnabled
                ? 'bg-purple-950 border-purple-600 text-purple-300 font-bold'
                : 'border-gray-800 text-gray-600 hover:text-gray-400'
            }`}
          >
            ORTHO [F8]
          </button>
        </div>

        {/* Object Count */}
        <div className="text-gray-400">
          Objects: <strong className="text-white">{objectCount}</strong>
        </div>
      </div>
    </div>
  );
};
