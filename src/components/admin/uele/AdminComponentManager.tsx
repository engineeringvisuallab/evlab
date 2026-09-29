import React, { useState } from 'react';
import { UELEComponent, UELEFacility, UELEPublicationStatus } from '../../../types/uele';
import { FullUELEDatabase, UELEAdminService } from '../../../services/ueleAdminService';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import { AdminPreviewModal } from './AdminPreviewModal';
import {
  Cpu,
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

interface AdminComponentManagerProps {
  database: FullUELEDatabase;
  onRefreshDatabase: () => void;
}

export const AdminComponentManager: React.FC<AdminComponentManagerProps> = ({
  database,
  onRefreshDatabase,
}) => {
  const [selectedComp, setSelectedComp] = useState<UELEComponent | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('3d');

  // Form state
  const [formData, setFormData] = useState<Partial<UELEComponent>>({
    name: '',
    facilityId: '',
    description: '',
    type: 'equipment',
    status: 'published',
    position3D: [0, 0, 0],
  });

  const handleCreateNew = () => {
    setSelectedComp(null);
    setFormData({
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      facilityId: database.facilities[0]?.id || '',
      name: '',
      description: '',
      type: 'equipment',
      status: 'draft',
      position3D: [0, 0, 0],
    });
    setIsEditing(true);
  };

  const handleStartEdit = (comp: UELEComponent) => {
    setSelectedComp(comp);
    setFormData({
      ...comp,
      position3D: comp.position3D || [0, 0, 0],
      status: comp.status || 'published',
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMsg('Component Name is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const compToSave: UELEComponent = {
        id: formData.id || `comp-${Date.now()}`,
        facilityId: formData.facilityId || '',
        parentComponentId: formData.parentComponentId || '',
        name: formData.name.trim(),
        description: formData.description || '',
        type: formData.type || 'equipment',
        status: (formData.status as UELEPublicationStatus) || 'published',
        position3D: formData.position3D || [0, 0, 0],
      };

      await UELEAdminService.saveEntity('component', compToSave);
      onRefreshDatabase();
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save component.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this engineering component permanently?')) {
      try {
        await UELEAdminService.deleteEntity('component', id);
        onRefreshDatabase();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete component.');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await UELEAdminService.duplicateEntity('component', id);
      onRefreshDatabase();
    } catch (err: any) {
      alert(err?.message || 'Failed to duplicate component.');
    }
  };

  const filteredComponents = database.components.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parentFacility = database.facilities.find((f) => f.id === formData.facilityId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-rose-400" />
            <span>5. Components & Sub-components Hierarchy</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed engineering equipment, sub-assemblies & instruments linked to facilities
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCreateNew}
          className="gap-2 shrink-0 font-semibold text-xs py-2.5 bg-rose-600 hover:bg-rose-500 text-slate-950 border-rose-500 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Component</span>
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
            placeholder="Search component name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Editor Form vs Table */}
      {isEditing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-rose-400" />
              <span>{selectedComp ? 'Edit Engineering Component' : 'Create New Component'}</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Component Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Centrifugal Pump Unit #1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Parent Facility</label>
                <select
                  value={formData.facilityId || ''}
                  onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="">-- Select Parent Facility --</option>
                  {database.facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Component Type</label>
                <input
                  type="text"
                  value={formData.type || 'equipment'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g. Pump, Valve, Sensor, Filter"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {/* 3D Offset Position */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-200">Local 3D Offset Position (Meters relative to Facility)</span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400">X Offset (East)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.position3D?.[0] ?? 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position3D: [parseFloat(e.target.value) || 0, formData.position3D?.[1] || 0, formData.position3D?.[2] || 0],
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Y Offset (Elevation)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.position3D?.[1] ?? 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position3D: [formData.position3D?.[0] || 0, parseFloat(e.target.value) || 0, formData.position3D?.[2] || 0],
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Z Offset (North)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.position3D?.[2] ?? 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position3D: [formData.position3D?.[0] || 0, formData.position3D?.[1] || 0, parseFloat(e.target.value) || 0],
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Component technical specs..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
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
                  className="gap-2 font-semibold bg-rose-600 hover:bg-rose-500 text-slate-950 border-rose-500 text-xs"
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
                <th className="p-3.5">Component Name</th>
                <th className="p-3.5">Parent Facility</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">3D Offset [X,Y,Z]</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredComponents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No components found. Click "+ Create New Component" above to add one.
                  </td>
                </tr>
              ) : (
                filteredComponents.map((c) => {
                  const fac = database.facilities.find((f) => f.id === c.facilityId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-200">
                        {c.name}
                        <div className="text-[10px] font-mono text-slate-500">{c.id}</div>
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {fac ? fac.name : <span className="text-slate-600">Unlinked</span>}
                      </td>
                      <td className="p-3.5">
                        <Badge variant="rose" size="sm">{c.type || 'equipment'}</Badge>
                      </td>
                      <td className="p-3.5 font-mono text-cyan-400 text-[11px]">
                        [{c.position3D?.[0] || 0}, {c.position3D?.[1] || 0}, {c.position3D?.[2] || 0}] m
                      </td>
                      <td className="p-3.5">
                        <Badge variant={c.status === 'published' ? 'emerald' : 'amber'} size="sm">
                          {(c.status || 'published').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(c)}
                            className="text-amber-400 hover:bg-amber-500/10 p-1.5"
                          >
                            <FileEdit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(c.id)}
                            className="text-cyan-400 hover:bg-cyan-500/10 p-1.5"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(c.id)}
                            className="text-rose-400 hover:bg-rose-500/10 p-1.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
        title={formData.name || 'Component Preview'}
        latitude={parentFacility?.latitude || 24.6800}
        longitude={parentFacility?.longitude || 89.4100}
        elevation={parentFacility?.elevation || 18.5}
        facility={parentFacility || null}
        layers={database.gisLayers}
      />
    </div>
  );
};
