import React from 'react';
import {
  Anchor,
  CircleDot,
  CornerDownRight,
  Eye,
  EyeOff,
  FolderTree,
  Minus,
  RotateCw,
  Sparkles,
  Square,
  Trash2,
  Triangle,
} from 'lucide-react';
import { TopicDefinition } from '../types/mechanics';

interface ModelTreeProps {
  topic: TopicDefinition;
  parameters: Record<string, number>;
  isDark: boolean;
}

export const ModelTree: React.FC<ModelTreeProps> = ({
  topic,
  parameters,
  isDark,
}) => {
  // Smart Problem Type Classification
  const getSmartModeName = () => {
    switch (topic.id) {
      case 'beams':
        return 'Beam Flexure (Simply Supported / Cantilever)';
      case 'trusses':
        return 'Pin-Jointed 2D Structural Truss Frame';
      case 'friction':
        return 'Coulomb Friction on Inclined Plane';
      case 'newton':
        return 'Translational Dynamics (Newton\'s 2nd Law)';
      case 'projectile':
        return '2D Ballistic Projectile Kinematics';
      case 'mechanisms':
        return 'Reciprocating Slider-Crank Mechanism';
      case 'rotation':
        return 'Flywheel Rotational Dynamics & Torque';
      case 'vectors':
        return 'Concurrent Coplanar Vector Force System';
      case 'centroid':
        return 'Composite Cross-Section Centroid & Area Inertia';
      default:
        return `${topic.title} Physical System`;
    }
  };

  return (
    <div
      id="mechanics-model-tree"
      className={`p-3 rounded-2xl border shadow-sm flex flex-col space-y-3 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-1.5">
          <FolderTree className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Model Tree
          </span>
        </div>
      </div>

      {/* Smart Mode Detection Badge */}
      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
        <div className="flex items-center space-x-1.5 text-blue-500 font-bold text-[11px]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Detection</span>
        </div>
        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200 mt-1 leading-snug">
          {getSmartModeName()}
        </p>
      </div>

      {/* Structured Components Hierarchy */}
      <div className="space-y-1 text-xs font-mono max-h-[160px] overflow-y-auto pr-1">
        {/* Physical Body */}
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
          <div className="flex items-center space-x-2">
            <Minus className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-sans font-medium text-[11px]">
              {topic.category === 'Structural Mechanics' ? 'Main Girder / Element' : 'Rigid Body Body_01'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Active</span>
        </div>

        {/* Assigned Loads */}
        <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300">
          <div className="flex items-center space-x-2">
            <CornerDownRight className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-sans font-medium text-[11px]">Applied Loads & Actions</span>
          </div>
          <span className="text-[10px] text-blue-500 font-bold">
            {topic.parameterConfigs.filter((c) => c.category === 'Loads' || c.name.toLowerCase().includes('force') || c.name.toLowerCase().includes('load')).length || 1} Forces
          </span>
        </div>

        {/* Supports & Constraints */}
        <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300">
          <div className="flex items-center space-x-2">
            <Triangle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-sans font-medium text-[11px]">Boundary Supports</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-bold">Determinate</span>
        </div>
      </div>
    </div>
  );
};
