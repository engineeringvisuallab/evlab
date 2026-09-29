import React, { useState } from 'react';
import { useGIS } from '../../context/GISContext';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { GISLayer, GISFeature } from '../../types/gis';

export const AddDataModal: React.FC = () => {
  const { isAddDataModalOpen, setIsAddDataModalOpen, addLayer } = useGIS();

  const [activeTab, setActiveTab] = useState<'geojson' | 'csv'>('geojson');
  const [jsonText, setJsonText] = useState('');
  const [csvText, setCsvText] = useState('');
  const [layerName, setLayerName] = useState('Imported Layer');

  // CSV Field mapping state
  const [csvLatCol, setCsvLatCol] = useState('lat');
  const [csvLngCol, setCsvLngCol] = useState('lng');

  if (!isAddDataModalOpen) return null;

  const handleGeoJSONImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.type !== 'FeatureCollection' && parsed.type !== 'Feature') {
        alert('Invalid GeoJSON format. Must be a FeatureCollection or Feature.');
        return;
      }

      const features: GISFeature[] = (parsed.features || [parsed]).map((f: any, idx: number) => ({
        id: `import-${Date.now()}-${idx}`,
        layerId: `layer-import-${Date.now()}`,
        geometry: f.geometry,
        properties: f.properties || {},
      }));

      const geomType = (features[0]?.geometry?.type as any) || 'Point';

      const newLyr: GISLayer = {
        id: `layer-import-${Date.now()}`,
        name: layerName || 'Imported GeoJSON Layer',
        type: 'vector',
        geometryType: geomType,
        visible: true,
        opacity: 1,
        locked: false,
        features,
        fields: Object.keys(features[0]?.properties || {}).map((k) => ({ name: k, type: 'string' })),
        symbology: {
          styleType: 'single',
          fillColor: '#0ea5e9',
          strokeColor: '#0284c7',
          strokeWidth: 2,
          pointRadius: 6,
        },
        labelConfig: {
          enabled: false,
          attributeField: '',
          fontSize: 10,
          color: '#0f172a',
          haloColor: '#ffffff',
          haloWidth: 1.5,
          placement: 'point',
        },
        sourceType: 'geojson',
      };

      addLayer(newLyr);
      setIsAddDataModalOpen(false);
      setJsonText('');
    } catch (e) {
      alert('Failed to parse GeoJSON text string.');
    }
  };

  const handleCSVImport = () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        alert('CSV must contain a header row and at least 1 data row.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const latIdx = headers.findIndex((h) => h.toLowerCase() === csvLatCol.toLowerCase());
      const lngIdx = headers.findIndex((h) => h.toLowerCase() === csvLngCol.toLowerCase());

      if (latIdx === -1 || lngIdx === -1) {
        alert(`Could not find specified latitude column "${csvLatCol}" or longitude column "${csvLngCol}" in header row.`);
        return;
      }

      const features: GISFeature[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map((r) => r.trim().replace(/^"|"$/g, ''));
        if (row.length < headers.length) continue;

        const lat = parseFloat(row[latIdx]);
        const lng = parseFloat(row[lngIdx]);

        if (isNaN(lat) || isNaN(lng)) continue;

        const properties: Record<string, any> = {};
        headers.forEach((h, idx) => {
          properties[h] = row[idx];
        });

        features.push({
          id: `csv-${Date.now()}-${i}`,
          layerId: `layer-csv-${Date.now()}`,
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties,
        });
      }

      const newLyr: GISLayer = {
        id: `layer-csv-${Date.now()}`,
        name: layerName || 'Imported CSV Points',
        type: 'vector',
        geometryType: 'Point',
        visible: true,
        opacity: 1,
        locked: false,
        features,
        fields: headers.map((h) => ({ name: h, type: 'string' })),
        symbology: {
          styleType: 'single',
          fillColor: '#ef4444',
          strokeColor: '#7f1d1d',
          pointRadius: 6,
        },
        labelConfig: {
          enabled: false,
          attributeField: '',
          fontSize: 10,
          color: '#0f172a',
          haloColor: '#ffffff',
          haloWidth: 1.5,
          placement: 'point',
        },
        sourceType: 'csv',
      };

      addLayer(newLyr);
      setIsAddDataModalOpen(false);
      setCsvText('');
    } catch (e) {
      alert('Failed to parse CSV dataset.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Upload size={18} />
            <span>Add Spatial Data Layer</span>
          </div>
          <button
            onClick={() => setIsAddDataModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs text-slate-400 font-medium px-4">
          <button
            onClick={() => setActiveTab('geojson')}
            className={`py-2 px-4 border-b-2 transition ${
              activeTab === 'geojson'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            GeoJSON / KML String
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`py-2 px-4 border-b-2 transition ${
              activeTab === 'csv'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            CSV Point Coordinate Table
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          <div>
            <label className="text-slate-400 block mb-1">Target Layer Name</label>
            <input
              type="text"
              value={layerName}
              onChange={(e) => setLayerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {activeTab === 'geojson' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 block">Paste GeoJSON FeatureCollection</label>
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2.5 py-1 rounded text-xs border border-slate-700 transition flex items-center gap-1.5 font-medium">
                  <FileText size={13} />
                  <span>Browse .geojson/.json File</span>
                  <input
                    type="file"
                    accept=".json,.geojson"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLayerName(file.name.replace(/\.[^/.]+$/, ""));
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            setJsonText(evt.target.result as string);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>
              <textarea
                rows={8}
                placeholder='{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[90.41,23.81]},"properties":{"name":"Hydrant 1"}}]}'
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 block">Paste CSV Content (with Header)</label>
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2.5 py-1 rounded text-xs border border-slate-700 transition flex items-center gap-1.5 font-medium">
                  <FileText size={13} />
                  <span>Browse .csv File</span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLayerName(file.name.replace(/\.[^/.]+$/, ""));
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            setCsvText(evt.target.result as string);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Latitude Column Name</label>
                  <input
                    type="text"
                    value={csvLatCol}
                    onChange={(e) => setCsvLatCol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Longitude Column Name</label>
                  <input
                    type="text"
                    value={csvLngCol}
                    onChange={(e) => setCsvLngCol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <textarea
                  rows={6}
                  placeholder={`id,lat,lng,name,type\n1,23.8103,90.4125,Valve 101,PRV\n2,23.8150,90.4200,Hydrant 12,Fire Hydrant`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={() => setIsAddDataModalOpen(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={activeTab === 'geojson' ? handleGeoJSONImport : handleCSVImport}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded transition shadow"
          >
            Import Data Layer
          </button>
        </div>
      </div>
    </div>
  );
};
