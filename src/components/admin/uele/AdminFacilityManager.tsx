import React, { useState, useEffect } from 'react';
import { UELEFacility, UELE3DModel, UELESystemCategory, UELEPublicationStatus, UELEParameter } from '../../../types/uele';
import { FullUELEDatabase, UELEAdminService } from '../../../services/ueleAdminService';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import { AdminPreviewModal } from './AdminPreviewModal';
import {
  Building2,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  FileEdit,
  Eye,
  MapPin,
  Sliders,
  Box,
  Save,
  X,
  Search,
  Filter,
  AlertTriangle,
  Globe,
  Map,
  Compass,
} from 'lucide-react';

interface AdminFacilityManagerProps {
  database: FullUELEDatabase;
  onRefreshDatabase: () => void;
  initialEditFacilityId?: string;
}

export const AdminFacilityManager: React.FC<AdminFacilityManagerProps> = ({
  database,
  onRefreshDatabase,
  initialEditFacilityId,
}) => {
  const [selectedFacility, setSelectedFacility] = useState<UELEFacility | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Preview Modal state
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('2d');

  // Form state
  const [formData, setFormData] = useState<Partial<UELEFacility>>({
    name: '',
    category: 'water-systems',
    description: '',
    status: 'published',
    latitude: 24.6800,
    longitude: 89.4100,
    elevation: 18.5,
    crs: 'EPSG:4326',
    model3DId: '',
    engineeringInfo: {
      overview: '',
      purpose: '',
      whatIsIt: '',
      whyRequired: '',
      howItWorks: '',
      designStandards: [],
    },
    parameters: [],
  });

  // Parameters list state inside form
  const [paramName, setParamName] = useState<string>('');
  const [paramVal, setParamVal] = useState<string>('');
  const [paramUnit, setParamUnit] = useState<string>('');

  useEffect(() => {
    if (initialEditFacilityId) {
      const found = database.facilities.find((f) => f.id === initialEditFacilityId);
      if (found) {
        handleEditFacility(found);
      }
    }
  }, [initialEditFacilityId, database.facilities]);

  const handleCreateNew = () => {
    const newId = `facility-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setFormData({
      id: newId,
      zoneId: database.zones[0]?.id || 'zone-water-1',
      category: 'water-systems',
      name: '',
      code: `FAC-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      layerId: 'layer-facilities',
      status: 'draft',
      latitude: 24.6800,
      longitude: 89.4100,
      elevation: 18.5,
      crs: 'EPSG:4326',
      coordinates: { lat: 24.6800, lng: 89.4100, elevation: 18.5 },
      model3DId: '',
      engineeringInfo: {
        overview: 'Georeferenced engineering infrastructure facility.',
        purpose: 'Process & municipal service node.',
        whatIsIt: 'Treatment plant / station.',
        whyRequired: 'Essential infrastructure service.',
        howItWorks: 'Automated continuous process.',
      },
      parameters: [
        { id: 'p1', name: 'Design Capacity', value: '50,000', unit: 'm³/day', category: 'hydraulic' },
        { id: 'p2', name: 'Operating Pressure', value: '4.5', unit: 'bar', category: 'operational' },
      ],
    });
    setSelectedFacility(null);
    setIsEditing(true);
  };

  const handleEditFacility = (facility: UELEFacility) => {
    setSelectedFacility(facility);
    setFormData({
      ...facility,
      latitude: facility.latitude || facility.coordinates?.lat || 24.6800,
      longitude: facility.longitude || facility.coordinates?.lng || 89.4100,
      elevation: facility.elevation || facility.coordinates?.elevation || 18.5,
      crs: facility.crs || 'EPSG:4326',
      status: facility.status || 'published',
      parameters: facility.parameters || [],
      engineeringInfo: facility.engineeringInfo || { overview: '' },
    });
    setIsEditing(true);
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMsg('Facility Name is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const facilityToSave: UELEFacility = {
        id: formData.id || `facility-${Date.now()}`,
        zoneId: formData.zoneId || 'zone-1',
        category: (formData.category as UELESystemCategory) || 'water-systems',
        name: formData.name.trim(),
        code: formData.code || `FAC-${Date.now()}`,
        description: formData.description || '',
        layerId: formData.layerId || 'layer-facilities',
        status: (formData.status as UELEPublicationStatus) || 'published',
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        elevation: Number(formData.elevation || 0),
        crs: formData.crs || 'EPSG:4326',
        coordinates: {
          lat: Number(formData.latitude),
          lng: Number(formData.longitude),
          elevation: Number(formData.elevation || 0),
        },
        model3DId: formData.model3DId || '',
        engineeringInfo: formData.engineeringInfo || { overview: '' },
        parameters: formData.parameters || [],
      };

      await UELEAdminService.saveEntity('facility', facilityToSave);
      onRefreshDatabase();
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save facility.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this facility from the central database?')) {
      try {
        await UELEAdminService.deleteEntity('facility', id);
        onRefreshDatabase();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete facility.');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await UELEAdminService.duplicateEntity('facility', id);
      onRefreshDatabase();
    } catch (err: any) {
      alert(err?.message || 'Failed to duplicate facility.');
    }
  };

  const handleAddParameter = () => {
    if (!paramName.trim()) return;
    const newParam: UELEParameter = {
      id: `param-${Date.now()}`,
      name: paramName.trim(),
      value: paramVal.trim() || 'N/A',
      unit: paramUnit.trim(),
      category: 'operational',
    };
    setFormData((prev) => ({
      ...prev,
      parameters: [...(prev.parameters || []), newParam],
    }));
    setParamName('');
    setParamVal('');
    setParamUnit('');
  };

  const handleRemoveParameter = (pId: string) => {
    setFormData((prev) => ({
      ...prev,
      parameters: (prev.parameters || []).filter((p) => p.id !== pId),
    }));
  };

  // Filtering
  const filteredFacilities = database.facilities.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.code && f.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || (f.status || 'published') === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>Facilities Administration & Spatial Placement</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Georeferenced engineering infrastructure nodes with WGS84 coordinates & parameters
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCreateNew}
          className="gap-2 shrink-0 font-semibold text-xs py-2.5 shadow-lg shadow-amber-950/40 bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-500"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Facility</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search facility name or code..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="water-systems">Water Systems</option>
            <option value="smart-city">Smart City</option>
            <option value="energy">Energy & Power</option>
            <option value="agriculture">Agriculture</option>
            <option value="transportation">Transportation</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Facilities List vs Editor Form */}
      {isEditing ? (
        /* FORM EDITOR */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-amber-400" />
              <span>{selectedFacility ? 'Edit Facility Record' : 'Create New Georeferenced Facility'}</span>
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

          <form onSubmit={handleSaveFacility} className="space-y-6">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Facility Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Central Water Purification Plant"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={formData.category || 'water-systems'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="water-systems">Water Systems</option>
                  <option value="smart-city">Smart City</option>
                  <option value="energy">Energy & Power</option>
                  <option value="agriculture">Agriculture & Irrigation</option>
                  <option value="transportation">Transportation</option>
                  <option value="industrial">Industrial Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Publication Status</label>
                <select
                  value={formData.status || 'published'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="published">Published (Live on Website)</option>
                  <option value="draft">Draft (Admin Only)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Geographic Coordinates WGS84 EPSG:4326 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  WGS84 EPSG:4326 Authoritative Spatial Position
                </span>
                <span className="text-[10px] font-mono text-cyan-400">CRS: EPSG:4326</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude ?? 24.6800}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude ?? 89.4100}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Elevation (Meters MSL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.elevation ?? 18.5}
                    onChange={(e) => setFormData({ ...formData, elevation: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Attached 3D GLB Model */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Box className="w-4 h-4 text-indigo-400" />
                Attached 3D Digital Twin Model (.glb)
              </label>
              <select
                value={formData.model3DId || ''}
                onChange={(e) => setFormData({ ...formData, model3DId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="">-- No 3D Model Attached --</option>
                {database.models3D.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.modelName} ({m.fileName}) • Status: {m.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Engineering Description</label>
              <textarea
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed technical & operational summary..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Engineering Parameters List Manager */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                Engineering & Design Parameters
              </span>

              {/* Add Parameter Input Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Parameter (e.g. Design Capacity)"
                  value={paramName}
                  onChange={(e) => setParamName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 flex-1 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 50,000)"
                  value={paramVal}
                  onChange={(e) => setParamVal(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 w-28 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Unit (e.g. m³/day)"
                  value={paramUnit}
                  onChange={(e) => setParamUnit(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 w-24 focus:outline-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddParameter}
                  className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs"
                >
                  + Add
                </Button>
              </div>

              {/* Added Parameters List */}
              <div className="space-y-1.5 pt-2">
                {formData.parameters?.map((param) => (
                  <div key={param.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="font-semibold text-slate-300">{param.name}</span>
                    <div className="flex items-center gap-3 font-mono text-amber-300">
                      <span>{param.value} {param.unit}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveParameter(param.id)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="text-slate-400"
              >
                Cancel
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    setFormData((prev) => ({ ...prev, status: 'draft' }));
                    handleSaveFacility(e);
                  }}
                  disabled={saving}
                  className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
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
                  className="gap-2 font-semibold shadow-lg shadow-amber-950/50 bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-500 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>[ PUBLISH ]</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* FACILITIES TABLE LIST */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Facility Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">WGS84 Coordinates</th>
                  <th className="p-3.5">3D Model</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredFacilities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No facilities found matching your search. Click "+ Create New Facility" above to add one.
                    </td>
                  </tr>
                ) : (
                  filteredFacilities.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-200">{f.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{f.id} • {f.code}</div>
                      </td>
                      <td className="p-3.5">
                        <Badge variant="purple" size="sm">{f.category}</Badge>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-cyan-400">
                        {f.latitude?.toFixed(4)}°N, {f.longitude?.toFixed(4)}°E ({f.elevation || 18}m)
                      </td>
                      <td className="p-3.5">
                        {f.model3DId ? (
                          <Badge variant="emerald" size="sm" icon={<Box className="w-3 h-3 text-emerald-400" />}>
                            GLB Attached
                          </Badge>
                        ) : (
                          <span className="text-slate-600 text-[11px]">No 3D Model</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {f.status === 'published' ? (
                          <Badge variant="emerald" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-emerald-400" />}>
                            PUBLISHED
                          </Badge>
                        ) : (
                          <Badge variant="amber" size="sm">
                            {f.status ? f.status.toUpperCase() : 'DRAFT'}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditFacility(f)}
                            className="text-amber-400 hover:bg-amber-500/10 p-1.5"
                            title="Edit Facility"
                          >
                            <FileEdit className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(f.id)}
                            className="text-cyan-400 hover:bg-cyan-500/10 p-1.5"
                            title="Duplicate Facility"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(f.id)}
                            className="text-rose-400 hover:bg-rose-500/10 p-1.5"
                            title="Delete Facility"
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
      )}

      {/* Live Preview Modal */}
      <AdminPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        initialMode={previewMode}
        title={formData.name || 'Facility Spatial Preview'}
        latitude={Number(formData.latitude || 24.6800)}
        longitude={Number(formData.longitude || 89.4100)}
        elevation={Number(formData.elevation || 18.5)}
        facility={formData as UELEFacility}
        layers={database.gisLayers}
      />
    </div>
  );
};
