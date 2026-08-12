import React from 'react';
import { useGIS } from '../../context/GISContext';
import { Compass, Layers, MousePointer, ShieldCheck } from 'lucide-react';

export const StatusBar: React.FC<{
  coords?: { lng: number; lat: number; zoom: number; scaleStr: string };
}> = ({ coords }) => {
  const { project, selectedFeatureIds, activeTool, snappingSettings } = useGIS();

  return (
    <div className="h-7 px-4 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between select-none">
      {/* Left: Coordinates & Projection */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Compass size={13} />
          <span>
            X: {coords ? coords.lng : project.center[0].toFixed(5)}° | Y:{' '}
            {coords ? coords.lat : project.center[1].toFixed(5)}°
          </span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        <div className="text-slate-300">
          CRS: <span className="text-slate-100 font-semibold">{project.crs.code}</span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        <div>
          Scale: <span className="text-slate-200">{coords ? coords.scaleStr : '1:15,000'}</span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        <div>
          Zoom: <span className="text-slate-200">{coords ? coords.zoom : project.zoom}</span>
        </div>
      </div>

      {/* Right: Active Status & Selections */}
      <div className="flex items-center gap-4">
        {/* Snapping indicator */}
        <div className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck size={12} />
          <span>Snapping {snappingSettings.enabled ? 'ON' : 'OFF'}</span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        {/* Selected Features */}
        <div className="flex items-center gap-1 text-slate-300">
          <MousePointer size={12} className="text-cyan-400" />
          <span>
            Selected: <strong className="text-cyan-300">{selectedFeatureIds.length}</strong>
          </span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        {/* Layer Count */}
        <div className="flex items-center gap-1 text-slate-300">
          <Layers size={12} />
          <span>Layers: {project.layers.length}</span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        {/* Active Tool Badge */}
        <div className="bg-slate-900 border border-slate-800 text-cyan-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">
          {activeTool.replace('_', ' ')}
        </div>
      </div>
    </div>
  );
};
