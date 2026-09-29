import React, { useState } from 'react';
import { UELESubModule } from '../../../types/admin';
import { FullUELEDatabase, UELEAdminService } from '../../../services/ueleAdminService';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import {
  Globe2,
  Map,
  Boxes,
  Cpu,
  Share2,
  Sliders,
  FileCheck2,
  BookOpen,
  Image,
  Plus,
  Save,
  Trash2,
  FileEdit,
  X,
  AlertTriangle,
} from 'lucide-react';

interface AdminHierarchyManagerProps {
  subModule: UELESubModule;
  database: FullUELEDatabase;
  onRefreshDatabase: () => void;
}

export const AdminHierarchyManager: React.FC<AdminHierarchyManagerProps> = ({
  subModule,
  database,
  onRefreshDatabase,}) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [status, setStatus] = useState<string>('published');
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const getSubModuleInfo = () => {
    switch (subModule) {
      case 'world':
        return { title: 'World Master Boundaries', icon: <Globe2 className="w-5 h-5 text-purple-400" />, entityType: 'world' as const, items: database.worlds };
      case 'regions':
        return { title: 'Regional Planning Core', icon: <Map className="w-5 h-5 text-cyan-400" />, entityType: 'region' as const, items: database.regions };
      case 'zones':
        return { title: 'Sectoral Infrastructure Zones', icon: <Boxes className="w-5 h-5 text-emerald-400" />, entityType: 'zone' as const, items: database.zones };
      case 'components':
        return { title: 'Engineering Components & Equipment', icon: <Cpu className="w-5 h-5 text-rose-400" />, entityType: 'component' as const, items: database.components };
      case 'networks':
        return { title: 'Infrastructure Linear Networks (Pipes/Lines)', icon: <Share2 className="w-5 h-5 text-blue-400" />, entityType: 'network' as const, items: database.networks };
      default:
        return { title: `${subModule.toUpperCase()} Module`, icon: <Sliders className="w-5 h-5 text-amber-400" />, entityType: 'world' as const, items: [] };
    }
  };

  const info = getSubModuleInfo();

  const handleStartCreate = () => {
    setName('');
    setDesc('');
    setStatus('published');
    setEditingId(null);
    setIsCreating(true);
  };

  const handleStartEdit = (item: any) => {
    setName(item.name || item.tagline || '');
    setDesc(item.description || '');
    setStatus(item.status || 'published');
    setEditingId(item.id);
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setErrorMsg('');
    try {
      const idToUse = editingId || `${info.entityType}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const itemToSave = {
        id: idToUse,
        name: name.trim(),
        description: desc.trim(),
        status,
        ...(info.entityType === 'world' ? { centerLat: 24.6800, centerLng: 89.4100, crs: 'EPSG:4326', tagline: 'Master Digital Twin' } : {}),
      };

      await UELEAdminService.saveEntity(info.entityType, itemToSave);
      onRefreshDatabase();
      setIsCreating(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save entity.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Delete ${info.entityType} permanently?`)) {
      try {
        await UELEAdminService.deleteEntity(info.entityType, id);
        onRefreshDatabase();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete.');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            {info.icon}
            <span>{info.title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Central EVLab Data Architecture Module: {subModule.toUpperCase()}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleStartCreate}
          className="gap-2 shrink-0 font-semibold text-xs py-2.5 shadow-lg shadow-purple-950/40"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New {info.entityType.toUpperCase()}</span>
        </Button>
      </div>

      {isCreating && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">
              {editingId ? `Edit ${info.entityType}` : `Create New ${info.entityType}`}
            </h3>
            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Name of ${info.entityType}...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Description..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                <Save className="w-4 h-4 mr-1" />
                <span>Save</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3.5">Name / ID</th>
              <th className="p-3.5">Description</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {info.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  No records found in this module. Click "+ Create New" above to add one.
                </td>
              </tr>
            ) : (
              info.items.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-200">
                    {item.name || item.tagline}
                    <div className="text-[10px] font-mono text-slate-500">{item.id}</div>
                  </td>
                  <td className="p-3.5 text-slate-400 max-w-md truncate">
                    {item.description || 'No description'}
                  </td>
                  <td className="p-3.5">
                    <Badge variant={item.status === 'published' ? 'emerald' : 'amber'} size="sm">
                      {(item.status || 'published').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(item)}
                        className="text-amber-400 hover:bg-amber-500/10 p-1.5"
                      >
                        <FileEdit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
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
    </div>
  );
};
