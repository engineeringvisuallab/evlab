import React, { useState } from 'react';
import { UELEParameter, UELEPublicationStatus } from '../../../types/uele';
import { FullUELEDatabase, UELEAdminService } from '../../../services/ueleAdminService';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import {
  Sliders,
  Plus,
  Trash2,
  FileEdit,
  Save,
  X,
  Search,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface AdminParameterManagerProps {
  database: FullUELEDatabase;
  onRefreshDatabase: () => void;
}

export const AdminParameterManager: React.FC<AdminParameterManagerProps> = ({
  database,
  onRefreshDatabase,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [formData, setFormData] = useState<Partial<UELEParameter & { facilityId?: string }>>({
    name: '',
    value: '',
    unit: '',
    category: 'hydraulic',
    status: 'published',
  });

  const handleCreateNew = () => {
    setFormData({
      id: `param-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      value: '',
      unit: '',
      category: 'hydraulic',
      status: 'draft',
      facilityId: database.facilities[0]?.id || '',
    });
    setIsEditing(true);
  };

  const handleStartEdit = (p: UELEParameter) => {
    setFormData(p);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMsg('Parameter Name is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const itemToSave = {
        id: formData.id || `param-${Date.now()}`,
        name: formData.name.trim(),
        value: formData.value || 'N/A',
        unit: formData.unit || '',
        category: formData.category || 'hydraulic',
        status: (formData.status as UELEPublicationStatus) || 'published',
        facilityId: formData.facilityId || '',
      };

      await UELEAdminService.saveEntity('parameter', itemToSave);
      onRefreshDatabase();
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save parameter.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete parameter?')) {
      try {
        await UELEAdminService.deleteEntity('parameter', id);
        onRefreshDatabase();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete parameter.');
      }
    }
  };

  const allParams = database.parameters || [];
  const filteredParams = allParams.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>10. Dynamic Engineering Parameters Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Discipline-independent design parameters: Hydraulic, Structural, Operational, Electrical & Thermal
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCreateNew}
          className="gap-2 shrink-0 font-semibold text-xs py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-500 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Parameter</span>
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
            placeholder="Search parameter name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Form vs Table */}
      {isEditing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-amber-400" />
              <span>Edit Engineering Parameter</span>
            </h3>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Parameter Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Design Flow Rate"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Value</label>
                <input
                  type="text"
                  value={formData.value || ''}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g. 50,000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Unit</label>
                <input
                  type="text"
                  value={formData.unit || ''}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g. m³/day"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Discipline Category</label>
                <select
                  value={formData.category || 'hydraulic'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="hydraulic">Hydraulic</option>
                  <option value="structural">Structural</option>
                  <option value="electrical">Electrical</option>
                  <option value="operational">Operational</option>
                  <option value="environmental">Environmental</option>
                  <option value="geospatial">Geospatial</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="thermal">Thermal</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                <Save className="w-4 h-4 mr-1" />
                <span>Save Parameter</span>
              </Button>
            </div>
          </form>
        </div>
      ) : (
        /* Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Parameter Name</th>
                <th className="p-3.5">Value & Unit</th>
                <th className="p-3.5">Discipline Category</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredParams.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No parameters found. Click "+ Create New Parameter" above to add one.
                  </td>
                </tr>
              ) : (
                filteredParams.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-3.5 font-bold text-slate-200">{p.name}</td>
                    <td className="p-3.5 font-mono text-amber-300">
                      {p.value} {p.unit}
                    </td>
                    <td className="p-3.5">
                      <Badge variant="amber" size="sm">{p.category || 'general'}</Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(p)}
                          className="text-amber-400 hover:bg-amber-500/10 p-1.5"
                        >
                          <FileEdit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p.id)}
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
    </div>
  );
};
