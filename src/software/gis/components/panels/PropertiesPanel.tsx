import React from 'react';
import { useGIS } from '../../context/GISContext';
import {
  Info,
  Edit3,
  Trash2,
  Move,
  RotateCw,
  Maximize2,
  Sliders,
  Maximize,
  Wrench,
  Edit2,
} from 'lucide-react';
import { calculateGeometryMetrics } from '../../services/turfAnalysis';
import { formatDistance, formatArea } from '../../services/cadEngine';

export const PropertiesPanel: React.FC = () => {
  const {
    project,
    selectedFeatureIds,
    updateFeatureProperties,
    deleteSelectedFeatures,
    setActiveTool,
    zoomToFeatures,
    setIsFieldManagerOpen,
  } = useGIS();

  // Find selected features across layers
  const selectedFeatures = project.layers.flatMap((layer) =>
    layer.features
      .filter((f) => selectedFeatureIds.includes(f.id))
      .map((f) => ({ feature: f, layer }))
  );

  if (selectedFeatures.length === 0) {
    return (
      <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-400 p-4 select-none text-xs">
        <div className="font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
          <Info size={15} />
          <span>Feature Inspector</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
          <Info size={32} className="mb-2 text-slate-700" />
          <p>No GIS feature selected.</p>
          <p className="text-[11px] mt-1 text-slate-600">
            Click any point, line, or polygon on the map with the Select Tool to view, edit, or transform features.
          </p>
        </div>
      </div>
    );
  }

  const { feature, layer } = selectedFeatures[0];
  const metrics = calculateGeometryMetrics(feature.geometry);

  const handlePropertyChange = (key: string, value: any) => {
    updateFeatureProperties(layer.id, feature.id, { [key]: value });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-200 select-none text-xs">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-cyan-400">
          <Info size={15} />
          <span>Feature Inspector</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => zoomToFeatures([feature.id])}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded transition"
            title="Zoom To Feature"
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={deleteSelectedFeatures}
            className="p-1 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded transition"
            title="Delete Feature"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* CAD Actions Bar */}
        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg space-y-2">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Geometry Tools
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setActiveTool('edit_vertices')}
              className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-300 py-1.5 rounded font-semibold text-[11px] transition"
            >
              <Edit2 size={13} />
              <span>Edit Vertices</span>
            </button>
            <button
              onClick={() => setActiveTool('transform_move')}
              className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-indigo-300 py-1.5 rounded font-semibold text-[11px] transition"
            >
              <Move size={13} />
              <span>Move</span>
            </button>
            <button
              onClick={() => setActiveTool('transform_rotate')}
              className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-purple-300 py-1.5 rounded font-semibold text-[11px] transition"
            >
              <RotateCw size={13} />
              <span>Rotate</span>
            </button>
            <button
              onClick={() => setActiveTool('transform_scale')}
              className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-sky-300 py-1.5 rounded font-semibold text-[11px] transition"
            >
              <Maximize size={13} />
              <span>Scale</span>
            </button>
          </div>
        </div>

        {/* General Info Card */}
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span>Feature ID:</span>
            <span className="font-mono text-cyan-300 font-semibold">{feature.id}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Layer:</span>
            <span className="font-semibold text-slate-200">{layer.name}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Geometry Type:</span>
            <span className="font-mono text-amber-400">{feature.geometry.type}</span>
          </div>
        </div>

        {/* Spatial Metrics */}
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 border-b border-slate-800 pb-1">
            Spatial Measurements
          </div>
          {feature.geometry.type.includes('Line') && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Calculated Length:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {formatDistance(metrics.lengthMeters)}
              </span>
            </div>
          )}
          {feature.geometry.type.includes('Polygon') && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Calculated Area:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {formatArea(metrics.areaSqMeters)}
              </span>
            </div>
          )}
        </div>

        {/* Editable Attributes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-semibold">
            <span>Attribute Fields</span>
            <button
              onClick={() => setIsFieldManagerOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
            >
              <Sliders size={12} />
              <span>Manage Schema</span>
            </button>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
            {Object.entries(feature.properties).map(([key, val]) => {
              const fieldDef = layer.fields.find((f) => f.name === key);

              return (
                <div
                  key={key}
                  className="flex items-center border-b border-slate-800/80 last:border-none p-2 gap-2"
                >
                  <span className="w-1/3 text-slate-400 truncate font-mono text-[11px]" title={key}>
                    {fieldDef?.alias || key}
                  </span>
                  {fieldDef?.domain && fieldDef.domain.length > 0 ? (
                    <select
                      value={val ?? ''}
                      onChange={(e) => handlePropertyChange(key, e.target.value)}
                      className="w-2/3 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-amber-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Select --</option>
                      {fieldDef.domain.map((choice) => (
                        <option key={choice} value={choice}>
                          {choice}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={val ?? ''}
                      onChange={(e) => handlePropertyChange(key, e.target.value)}
                      className="w-2/3 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
