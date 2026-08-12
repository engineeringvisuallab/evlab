import React from 'react';
import { useGIS } from '../../context/GISContext';
import { BASEMAP_OPTIONS } from '../../services/basemaps';
import { Map, Check } from 'lucide-react';

export const BasemapGallery: React.FC = () => {
  const { project, setBasemap } = useGIS();

  return (
    <div className="bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200 select-none">
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-cyan-400">
          <Map size={15} />
          <span>Basemap Gallery</span>
        </div>
      </div>

      <div className="p-3 space-y-2 overflow-y-auto flex-1 text-xs">
        {BASEMAP_OPTIONS.map((base) => {
          const isActive = project.activeBasemapId === base.id;

          return (
            <div
              key={base.id}
              onClick={() => setBasemap(base.id)}
              className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                isActive
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div>
                <div className="font-semibold">{base.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{base.type.toUpperCase()} XYZ Tile Source</div>
              </div>

              {isActive && (
                <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
