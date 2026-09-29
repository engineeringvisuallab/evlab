import React, { useState } from 'react';
import { useGIS } from '../../context/GISContext';
import { X, Palette, Tag } from 'lucide-react';
import { SymbologyConfig, LabelConfig } from '../../types/gis';

export const SymbologyModal: React.FC = () => {
  const {
    project,
    activeLayerId,
    isSymbologyModalOpen,
    setIsSymbologyModalOpen,
    updateLayerSymbology,
    updateLayerLabels,
  } = useGIS();

  const activeLayer = project.layers.find((l) => l.id === activeLayerId) || project.layers[0];

  const [activeTab, setActiveTab] = useState<'style' | 'labels'>('style');

  // Symbology State
  const [fillColor, setFillColor] = useState(activeLayer?.symbology.fillColor || '#0ea5e9');
  const [strokeColor, setStrokeColor] = useState(activeLayer?.symbology.strokeColor || '#0284c7');
  const [strokeWidth, setStrokeWidth] = useState(activeLayer?.symbology.strokeWidth || 2);
  const [pointRadius, setPointRadius] = useState(activeLayer?.symbology.pointRadius || 6);

  // Label State
  const [labelEnabled, setLabelEnabled] = useState(activeLayer?.labelConfig?.enabled || false);
  const [labelField, setLabelField] = useState(activeLayer?.labelConfig?.attributeField || activeLayer?.fields[0]?.name || '');
  const [fontSize, setFontSize] = useState(activeLayer?.labelConfig?.fontSize || 11);
  const [textColor, setTextColor] = useState(activeLayer?.labelConfig?.color || '#0f172a');

  if (!isSymbologyModalOpen || !activeLayer) return null;

  const handleSave = () => {
    const updatedSymbology: SymbologyConfig = {
      ...activeLayer.symbology,
      fillColor,
      strokeColor,
      strokeWidth,
      pointRadius,
    };

    const updatedLabels: LabelConfig = {
      enabled: labelEnabled,
      attributeField: labelField,
      fontSize,
      color: textColor,
      haloColor: '#ffffff',
      haloWidth: 2,
      placement: activeLayer.geometryType === 'Polygon' ? 'centroid' : 'point',
    };

    updateLayerSymbology(activeLayer.id, updatedSymbology);
    updateLayerLabels(activeLayer.id, updatedLabels);
    setIsSymbologyModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-xs text-slate-200">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Palette size={18} />
            <span>Layer Styling — {activeLayer.name}</span>
          </div>
          <button
            onClick={() => setIsSymbologyModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 font-medium px-4">
          <button
            onClick={() => setActiveTab('style')}
            className={`py-2 px-4 border-b-2 transition ${
              activeTab === 'style'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Symbology & Colors
          </button>
          <button
            onClick={() => setActiveTab('labels')}
            className={`py-2 px-4 border-b-2 transition ${
              activeTab === 'labels'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Feature Labels
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {activeTab === 'style' ? (
            <div className="space-y-3">
              {/* Fill Color */}
              {(activeLayer.geometryType === 'Polygon' || activeLayer.geometryType === 'Point') && (
                <div className="flex justify-between items-center">
                  <label className="text-slate-400">Fill Color:</label>
                  <input
                    type="color"
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-10 h-7 bg-slate-950 border border-slate-800 rounded cursor-pointer"
                  />
                </div>
              )}

              {/* Stroke Color */}
              <div className="flex justify-between items-center">
                <label className="text-slate-400">Stroke / Outline Color:</label>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-10 h-7 bg-slate-950 border border-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Stroke Width */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Stroke Width:</span>
                  <span className="font-mono text-cyan-300">{strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Point Marker Radius */}
              {activeLayer.geometryType === 'Point' && (
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Point Radius:</span>
                    <span className="font-mono text-cyan-300">{pointRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    value={pointRadius}
                    onChange={(e) => setPointRadius(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Enable Labels Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-200">
                <input
                  type="checkbox"
                  checked={labelEnabled}
                  onChange={(e) => setLabelEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 accent-cyan-500"
                />
                <span>Enable Labels on Canvas</span>
              </label>

              {labelEnabled && (
                <>
                  <div>
                    <label className="text-slate-400 block mb-1">Label Attribute Field</label>
                    <select
                      value={labelField}
                      onChange={(e) => setLabelField(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      {activeLayer.fields.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Font Size:</span>
                      <span className="font-mono text-cyan-300">{fontSize}pt</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="20"
                      step="1"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="text-slate-400">Text Color:</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-7 bg-slate-950 border border-slate-800 rounded cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={() => setIsSymbologyModalOpen(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded transition shadow"
          >
            Apply Styling
          </button>
        </div>
      </div>
    </div>
  );
};
