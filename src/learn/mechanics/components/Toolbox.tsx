import React from 'react';
import {
  Anchor,
  CircleDot,
  Compass,
  CornerDownRight,
  Crosshair,
  Grid,
  Maximize2,
  Minus,
  MousePointer,
  Move,
  Plus,
  RotateCw,
  Sliders,
  Square,
  Triangle,
  Zap,
} from 'lucide-react';
import { PhysicalObjectType, SupportType, LoadType } from '../types/unifiedModel';

export type ActiveTool =
  | 'select'
  | 'move'
  | 'add_beam'
  | 'add_block'
  | 'add_force'
  | 'add_moment'
  | 'add_pin_support'
  | 'add_roller_support'
  | 'add_fixed_support'
  | 'add_incline';

interface ToolboxProps {
  activeTool: ActiveTool;
  onChangeTool: (tool: ActiveTool) => void;
  isSnapEnabled: boolean;
  onToggleSnap: () => void;
  topicId: string;
  isDark: boolean;
}

export const Toolbox: React.FC<ToolboxProps> = ({
  activeTool,
  onChangeTool,
  isSnapEnabled,
  onToggleSnap,
  topicId,
  isDark,
}) => {
  return (
    <div
      id="mechanics-toolbox"
      className={`p-2.5 rounded-2xl border shadow-sm flex flex-col space-y-3 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Toolbox
        </span>
        <button
          onClick={onToggleSnap}
          title={isSnapEnabled ? 'Snap to Grid: ON' : 'Snap to Grid: OFF'}
          className={`p-1.5 rounded-lg text-xs font-mono flex items-center space-x-1 transition-colors ${
            isSnapEnabled
              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="text-[10px]">SNAP</span>
        </button>
      </div>

      {/* Primary Interaction Tools */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => onChangeTool('select')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTool === 'select'
              ? 'bg-blue-600 text-white shadow-sm'
              : isDark
              ? 'hover:bg-slate-800 text-slate-300'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Select & Inspect Objects (V)"
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>Select (V)</span>
        </button>

        <button
          onClick={() => onChangeTool('move')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTool === 'move'
              ? 'bg-blue-600 text-white shadow-sm'
              : isDark
              ? 'hover:bg-slate-800 text-slate-300'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Translate / Move Objects"
        >
          <Move className="w-3.5 h-3.5" />
          <span>Move</span>
        </button>
      </div>

      {/* Context-Sensitive Physical Entities Palette */}
      <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-semibold text-slate-400 block px-1">
          Objects & Geometry
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onChangeTool('add_beam')}
            className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTool === 'add_beam'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDark
                ? 'hover:bg-slate-800 text-slate-300'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Add Structural Beam (B)"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Beam (B)</span>
          </button>

          <button
            onClick={() => onChangeTool('add_block')}
            className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTool === 'add_block'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDark
                ? 'hover:bg-slate-800 text-slate-300'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Add Rigid Body / Block"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Block</span>
          </button>
        </div>
      </div>

      {/* Loads & Vectors Palette */}
      <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-semibold text-slate-400 block px-1">
          Applied Loads
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onChangeTool('add_force')}
            className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTool === 'add_force'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDark
                ? 'hover:bg-slate-800 text-slate-300'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Apply Force Vector (F)"
          >
            <CornerDownRight className="w-3.5 h-3.5 text-blue-400" />
            <span>Force (F)</span>
          </button>

          <button
            onClick={() => onChangeTool('add_moment')}
            className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTool === 'add_moment'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDark
                ? 'hover:bg-slate-800 text-slate-300'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Apply Concentrated Moment / Torque (M)"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Moment (M)</span>
          </button>
        </div>
      </div>

      {/* Supports & Boundary Constraints */}
      <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-semibold text-slate-400 block px-1">
          Supports & Constraints
        </span>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => onChangeTool('add_pin_support')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[11px] font-medium transition-all ${
              activeTool === 'add_pin_support'
                ? 'bg-blue-600 text-white'
                : isDark
                ? 'hover:bg-slate-800 text-slate-300'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Pin Support (Resists Rx, Ry)"
          >
            <Triangle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="mt-0.5 text-[10px]">Pin</span>
          </button>

          <button
            onClick={() => onChangeTool('add_roller_support')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[11px] font-medium transition-all ${
              activeTool === 'add_roller_support'
                ? 'bg-blue-600 text-white'
                : isDark
                ? 'hover:bg-slate-800 text-slate-300'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Roller Support (Resists Ry only)"
          >
            <CircleDot className="w-3.5 h-3.5 text-cyan-400" />
            <span className="mt-0.5 text-[10px]">Roller</span>
          </button>

          <button
            onClick={() => onChangeTool('add_fixed_support')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[11px] font-medium transition-all ${
              activeTool === 'add_fixed_support'
                ? 'bg-blue-600 text-white'
                : isDark
                ? 'hover:bg-slate-800 text-slate-300'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Fixed Cantilever Support (Resists Rx, Ry, M)"
          >
            <Anchor className="w-3.5 h-3.5 text-red-400" />
            <span className="mt-0.5 text-[10px]">Fixed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
