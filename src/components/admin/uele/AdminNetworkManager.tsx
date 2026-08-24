import React, { useState } from 'react';
import { UELENetwork, UELEPublicationStatus } from '../../../types/uele';
import { FullUELEDatabase, UELEAdminService } from '../../../services/ueleAdminService';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import { AdminPreviewModal } from './AdminPreviewModal';
import {
  Share2,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  FileEdit,
  Save,
  X,
  Search,
  AlertTriangle,
  Map,
  Compass,
} from 'lucide-react';

interface AdminNetworkManagerProps {
  database: FullUELEDatabase;
  onRefreshDatabase: () => void;
}

export const AdminNetworkManager: React.FC<AdminNetworkManagerProps> = ({
  database,
  onRefreshDatabase,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<UELENetwork | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('2d');

  // Form state
  const [formData, setFormData] = useState<Partial<UELENetwork>>({
    name: '',
    type: 'water-pipe',
    status: 'published',
    coordinates: [
      { lat: 24.6800, lng: 89.4100, elevation: 18.5 },
      { lat: 24.6850, lng: 89.4150, elevation: 18.0 },
    ],
  });

  const handleCreateNew = () => {
    setSelectedNetwork(null);
    setFormData({
      id: `net-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      type: 'water-pipe',
      status: 'draft',
      layerId: 'layer-networks',
      coordinates: [
        { lat: 24.6800, lng: 89.4100, elevation: 18.5 },
        { lat: 24.6850, lng: 89.4150, elevation: 18.0 },
      ],
    });
    setIsEditing(true);
  };

  const handleStartEdit = (net: UELENetwork) => {
    setSelectedNetwork(net);
    setFormData({
      ...net,
      status: net.status || 'published',
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMsg('Network Name is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const netToSave: UELENetwork = {
        id: formData.id || `net-${Date.now()}`,
        name: formData.name.trim(),
        type: formData.type || 'water-pipe',
        fromFacilityId: formData.fromFacilityId || '',
        toFacilityId: formData.toFacilityId || '',
        coordinates: formData.coordinates || [
          { lat: 24.6800, lng: 89.4100, elevation: 18.5 },
          { lat: 24.6850, lng: 89.4150, elevation: 18.0 },
        ],
        layerId: formData.layerId || 'layer-networks',
        status: (formData.status as UELEPublicationStatus) || 'published',
      };

      await UELEAdminService.saveEntity('network', netToSave);
      onRefreshDatabase();
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save network.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this infrastructure network permanently?')) {
      try {
        await UELEAdminService.deleteEntity('network', id);
        onRefreshDatabase();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete network.');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await UELEAdminService.duplicateEntity('network', id);
      onRefreshDatabase();
    } catch (err: any) {
      alert(err?.message || 'Failed to duplicate network.');
    }
  };

  const filteredNetworks = database.networks.filter((n) =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            <span>6. Infrastructure Linear Networks Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geospatial linear networks: Water pipes, Sewer, Power cables, Roads, Canals with 2D & 3D alignment
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCreateNew}
          className="gap-2 shrink-0 font-semibold text-xs py-2.5 bg-blue-600 hover:bg-blue-500 text-slate-950 border-blue-500 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Linear Network</span>
        </Button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search network name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Form vs Table */}
      {isEditing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-blue-400" />
              <span>{selectedNetwork ? 'Edit Linear Network' : 'Create New Infrastructure Linear Network'}</span>
            </h3>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Network Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Main High-Pressure Water Pipeline"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Network Type</label>
                <select
                  value={formData.type || 'water-pipe'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="water-pipe">Water Pipelines</option>
                  <option value="sewer-line">Sewer & Wastewater</option>
                  <option value="drainage">Stormwater Drainage</option>
                  <option value="power-line">Electrical Cables & Lines</option>
                  <option value="canal">Irrigation Canals</option>
                  <option value="road-segment">Road Networks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
                <select
                  value={formData.status || 'published'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Coordinates */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-200">WGS84 LineString Node Coordinates</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.coordinates?.map((node, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <span className="font-semibold text-blue-400">Node #{idx + 1}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.000001"
                        value={node.lat}
                        onChange={(e) => {
                          const updated = [...(formData.coordinates || [])];
                          updated[idx] = { ...updated[idx], lat: parseFloat(e.target.value) || 0 };
                          setFormData({ ...formData, coordinates: updated });
                        }}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-cyan-300"
                        placeholder="Lat"
                      />
                      <input
                        type="number"
                        step="0.000001"
                        value={node.lng}
                        onChange={(e) => {
                          const updated = [...(formData.coordinates || [])];
                          updated[idx] = { ...updated[idx], lng: parseFloat(e.target.value) || 0 };
                          setFormData({ ...formData, coordinates: updated });
                        }}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-cyan-300"
                        placeholder="Lng"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    setFormData((prev) => ({ ...prev, status: 'draft' }));
                    handleSave(e);
                  }}
                  disabled={saving}
                  className="text-xs"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  <span>[ SAVE DRAFT ]</span>
                </Button>

                <Button
                  type="button"
                  variant="cyan"
                  onClick={() => {
                    setPreviewMode('2d');
                    setPreviewOpen(true);
                  }}
                  className="text-xs"
                >
                  <Map className="w-3.5 h-3.5 mr-1" />
                  <span>[ PREVIEW 2D ]</span>
                </Button>

                <Button
                  type="button"
                  variant="emerald"
                  onClick={() => {
                    setPreviewMode('3d');
                    setPreviewOpen(true);
                  }}
                  className="text-xs"
                >
                  <Compass className="w-3.5 h-3.5 mr-1" />
                  <span>[ PREVIEW 3D ]</span>
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  onClick={() => setFormData((prev) => ({ ...prev, status: 'published' }))}
                  className="gap-2 font-semibold bg-blue-600 hover:bg-blue-500 text-slate-950 border-blue-500 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>[ PUBLISH ]</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Network Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Nodes Count</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredNetworks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No linear networks found. Click "+ Create New Linear Network" above to add one.
                  </td>
                </tr>
              ) : (
                filteredNetworks.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-3.5 font-bold text-slate-200">
                      {n.name}
                      <div className="text-[10px] font-mono text-slate-500">{n.id}</div>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="blue" size="sm">{n.type}</Badge>
                    </td>
                    <td className="p-3.5 font-mono text-cyan-400">
                      {n.coordinates?.length || 0} Points
                    </td>
                    <td className="p-3.5">
                      <Badge variant={n.status === 'published' ? 'emerald' : 'amber'} size="sm">
                        {(n.status || 'published').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(n)}
                          className="text-amber-400 hover:bg-amber-500/10 p-1.5"
                        >
                          <FileEdit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(n.id)}
                          className="text-cyan-400 hover:bg-cyan-500/10 p-1.5"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(n.id)}
                          className="text-rose-400 hover:bg-rose-500/10 p-1.5"
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
      )}

      {/* Preview Modal */}
      <AdminPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        initialMode={previewMode}
        title={formData.name || 'Network Preview'}
        latitude={formData.coordinates?.[0]?.lat || 24.6800}
        longitude={formData.coordinates?.[0]?.lng || 89.4100}
        elevation={formData.coordinates?.[0]?.elevation || 18.5}
        layers={database.gisLayers}
      />
    </div>
  );
};
