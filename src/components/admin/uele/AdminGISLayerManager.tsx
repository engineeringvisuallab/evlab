import React, { useState } from 'react';
import { UELELayer, UELEGISLayerStyle, UELEPublicationStatus } from '../../../types/uele';
import { FullUELEDatabase, UELEAdminService } from '../../../services/ueleAdminService';
import { importShapefileZip, importGeoJSONFile } from '../../../utils/gisImporter';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import {
  Layers,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Palette,
  FileCode,
  Save,
  Trash2,
  X,
  FileEdit,
  Eye,
  EyeOff,
  Database,
  RefreshCw,
} from 'lucide-react';

interface AdminGISLayerManagerProps {
  database: FullUELEDatabase;
  onRefreshDatabase: () => void;
}

export const AdminGISLayerManager: React.FC<AdminGISLayerManagerProps> = ({
  database,
  onRefreshDatabase,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<UELELayer | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Layer Style Form State
  const [layerName, setLayerName] = useState<string>('');
  const [layerColor, setLayerColor] = useState<string>('#06b6d4');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [fillOpacity, setFillOpacity] = useState<number>(0.3);
  const [pointSize, setPointSize] = useState<number>(6);
  const [status, setStatus] = useState<UELEPublicationStatus>('published');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let result;
      if (file.name.endsWith('.zip')) {
        result = await importShapefileZip(file);
      } else if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
        result = await importGeoJSONFile(file);
      } else {
        throw new Error('Unsupported format. Please upload a Shapefile .zip or .geojson file.');
      }

      if (!result.success) throw new Error(result.message);

      // Save Layer and features to server
      const newLayer: UELELayer = {
        ...result.layer,
        status: 'published',
        style: {
          color: layerColor,
          strokeWidth,
          fillOpacity,
          pointSize,
          labelVisible: true,
          opacity: 1,
          minZoom: 1,
          maxZoom: 20,
        },
        featureCount: result.featureCount,
      };

      await UELEAdminService.saveEntity('gisLayer', newLayer);

      // Save to server GIS endpoint for backwards compatibility
      await fetch('/api/gis/layers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layer: newLayer, features: result.featureCollection.features }),
      });

      setSuccessMsg(`Successfully imported & published ${result.featureCount} features from ${file.name}`);
      onRefreshDatabase();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to import GIS layer.');
    } finally {
      setUploading(false);
    }
  };

  const handleEditLayer = (layer: UELELayer) => {
    setSelectedLayer(layer);
    setLayerName(layer.name);
    setLayerColor(layer.color || '#06b6d4');
    setStrokeWidth(layer.style?.strokeWidth || 2);
    setFillOpacity(layer.style?.fillOpacity || 0.3);
    setPointSize(layer.style?.pointSize || 6);
    setStatus(layer.status || 'published');
    setIsEditing(true);
  };

  const handleSaveStyle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLayer) return;

    try {
      const updatedLayer: UELELayer = {
        ...selectedLayer,
        name: layerName,
        color: layerColor,
        status,
        style: {
          color: layerColor,
          strokeWidth,
          fillOpacity,
          pointSize,
          labelVisible: true,
          opacity: 1,
          minZoom: 1,
          maxZoom: 20,
        },
      };

      await UELEAdminService.saveEntity('gisLayer', updatedLayer);
      onRefreshDatabase();
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save layer style.');
    }
  };

  const handleDeleteLayer = async (id: string) => {
    if (window.confirm('Delete GIS layer permanently from server?')) {
      try {
        await UELEAdminService.deleteEntity('gisLayer', id);
        await fetch(`/api/gis/layers/${id}`, { method: 'DELETE' });
        onRefreshDatabase();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete layer.');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            <span>GIS Vector Layers & Shapefiles Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Import, style, and manage global Shapefile (.zip) and GeoJSON spatial vector datasets
          </p>
        </div>

        {/* Upload Button Input */}
        <label className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-teal-950/40 transition-colors">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Processing GIS Data...' : 'Import Shapefile (.zip) / GeoJSON'}</span>
          <input
            type="file"
            accept=".zip,.json,.geojson"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Style Editor Modal / Section */}
      {isEditing && selectedLayer && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Palette className="w-4 h-4 text-teal-400" />
              <span>GIS Layer Style Editor — {selectedLayer.name}</span>
            </h3>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSaveStyle} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Layer Name</label>
                <input
                  type="text"
                  value={layerName}
                  onChange={(e) => setLayerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Vector Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={layerColor}
                    onChange={(e) => setLayerColor(e.target.value)}
                    className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={layerColor}
                    onChange={(e) => setLayerColor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Stroke Width (px)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Fill Opacity (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={1}
                  value={fillOpacity}
                  onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="cyan" className="gap-2 font-semibold">
                <Save className="w-4 h-4" />
                <span>Save Layer Style</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Layers Table List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Layer Name & ID</th>
                <th className="p-3.5">Color Preview</th>
                <th className="p-3.5">Type & Features</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {database.gisLayers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No custom GIS layers uploaded. Click "Import Shapefile (.zip) / GeoJSON" above to display custom vector layers on the map.
                  </td>
                </tr>
              ) : (
                database.gisLayers.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-200">{l.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{l.id}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow"
                          style={{ backgroundColor: l.color || '#06b6d4' }}
                        />
                        <span className="font-mono text-[11px] text-slate-400">{l.color}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-teal-300">
                      {l.type || 'geojson'} • {l.featureCount || 'Vector'} features
                    </td>
                    <td className="p-3.5">
                      <Badge variant="emerald" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-emerald-400" />}>
                        PUBLISHED
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLayer(l)}
                          className="text-amber-400 hover:bg-amber-500/10 p-1.5"
                          title="Edit Layer Style"
                        >
                          <Palette className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLayer(l.id)}
                          className="text-rose-400 hover:bg-rose-500/10 p-1.5"
                          title="Delete Layer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
