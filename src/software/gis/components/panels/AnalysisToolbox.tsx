import React, { useState } from 'react';
import { useGIS } from '../../context/GISContext';
import { X, Sliders, Play, Layers } from 'lucide-react';
import { runBufferAnalysis, runCentroidAnalysis, runConvexHullAnalysis } from '../../services/turfAnalysis';

export const AnalysisToolboxModal: React.FC = () => {
  const { project, isAnalysisModalOpen, setIsAnalysisModalOpen, addLayer } = useGIS();

  const [selectedTool, setSelectedTool] = useState<'buffer' | 'centroid' | 'hull'>('buffer');
  const [selectedLayerId, setSelectedLayerId] = useState<string>(project.layers[0]?.id || '');
  const [bufferRadius, setBufferRadius] = useState<number>(100);

  if (!isAnalysisModalOpen) return null;

  const targetLayer = project.layers.find((l) => l.id === selectedLayerId) || project.layers[0];

  const handleRunTool = () => {
    if (!targetLayer) {
      alert('Please select an input layer.');
      return;
    }

    try {
      if (selectedTool === 'buffer') {
        const resultLayer = runBufferAnalysis(targetLayer, bufferRadius);
        addLayer(resultLayer);
      } else if (selectedTool === 'centroid') {
        const resultLayer = runCentroidAnalysis(targetLayer);
        addLayer(resultLayer);
      } else if (selectedTool === 'hull') {
        const resultLayer = runConvexHullAnalysis(targetLayer);
        addLayer(resultLayer);
      }

      setIsAnalysisModalOpen(false);
    } catch (e) {
      alert('Spatial analysis operation failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Sliders size={18} />
            <span>GIS Spatial Analysis Toolbox</span>
          </div>
          <button
            onClick={() => setIsAnalysisModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* Analysis Tool Selection */}
          <div>
            <label className="text-slate-400 block mb-1">Select Analysis Operation</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTool('buffer')}
                className={`p-2.5 rounded border text-center font-semibold transition ${
                  selectedTool === 'buffer'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400'
                }`}
              >
                Buffer
              </button>
              <button
                type="button"
                onClick={() => setSelectedTool('centroid')}
                className={`p-2.5 rounded border text-center font-semibold transition ${
                  selectedTool === 'centroid'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400'
                }`}
              >
                Centroids
              </button>
              <button
                type="button"
                onClick={() => setSelectedTool('hull')}
                className={`p-2.5 rounded border text-center font-semibold transition ${
                  selectedTool === 'hull'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400'
                }`}
              >
                Convex Hull
              </button>
            </div>
          </div>

          {/* Input Layer Selection */}
          <div>
            <label className="text-slate-400 block mb-1">Input Layer</label>
            <select
              value={selectedLayerId}
              onChange={(e) => setSelectedLayerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            >
              {project.layers.map((lyr) => (
                <option key={lyr.id} value={lyr.id}>
                  {lyr.name} ({lyr.features.length} features)
                </option>
              ))}
            </select>
          </div>

          {/* Tool Parameters */}
          {selectedTool === 'buffer' && (
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Buffer Distance (Meters):</span>
                <span className="font-mono text-purple-300 font-semibold">{bufferRadius} m</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={bufferRadius}
                onChange={(e) => setBufferRadius(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded accent-purple-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={() => setIsAnalysisModalOpen(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRunTool}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded transition shadow"
          >
            <Play size={14} />
            <span>Execute Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
};
