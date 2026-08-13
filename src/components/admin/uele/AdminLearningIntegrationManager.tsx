import React, { useState } from 'react';
import {
  UELELearningLink,
  UELEStandard,
  UELESoftware,
  UELECourse,
  UELEVideo,
  UELEResource,
} from '../../../types/adminUele';
import { UELESubModule } from '../../../types/admin';
import { FullUELEDatabase, UELEAdminService } from '../../../services/ueleAdminService';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import {
  BookOpen,
  FileCheck2,
  Laptop,
  GraduationCap,
  Video,
  Library,
  Plus,
  Trash2,
  FileEdit,
  Save,
  X,
  Search,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface AdminLearningIntegrationManagerProps {
  database: FullUELEDatabase;
  activeSubModule: UELESubModule;
  onRefreshDatabase: () => void;
}

export const AdminLearningIntegrationManager: React.FC<AdminLearningIntegrationManagerProps> = ({
  database,
  activeSubModule,
  onRefreshDatabase,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [itemData, setItemData] = useState<any>({});

  const entityType =
    activeSubModule === 'links'
      ? 'link'
      : activeSubModule === 'standards'
      ? 'standard'
      : activeSubModule === 'software'
      ? 'software'
      : activeSubModule === 'courses'
      ? 'course'
      : activeSubModule === 'videos'
      ? 'video'
      : 'resource';

  const title =
    activeSubModule === 'links'
      ? '11. Learning Links Manager'
      : activeSubModule === 'standards'
      ? '12. Standards & Engineering Codes Manager'
      : activeSubModule === 'software'
      ? '13. Software Integration Manager'
      : activeSubModule === 'courses'
      ? '14. Courses Manager'
      : activeSubModule === 'videos'
      ? '15. Video Learning Manager'
      : '16. Engineering Resources Manager';

  const icon =
    activeSubModule === 'links' ? (
      <BookOpen className="w-5 h-5 text-indigo-400" />
    ) : activeSubModule === 'standards' ? (
      <FileCheck2 className="w-5 h-5 text-emerald-400" />
    ) : activeSubModule === 'software' ? (
      <Laptop className="w-5 h-5 text-cyan-400" />
    ) : activeSubModule === 'courses' ? (
      <GraduationCap className="w-5 h-5 text-purple-400" />
    ) : activeSubModule === 'videos' ? (
      <Video className="w-5 h-5 text-rose-400" />
    ) : (
      <Library className="w-5 h-5 text-amber-400" />
    );

  const handleCreateNew = () => {
    setItemData({
      id: `${entityType}-${Date.now()}`,
      title: '',
      name: '',
      code: '',
      description: '',
      url: '',
      status: 'published',
    });
    setIsEditing(true);
  };

  const handleStartEdit = (item: any) => {
    setItemData(item);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameOrTitle = itemData.title || itemData.name;
    if (!nameOrTitle?.trim()) {
      setErrorMsg('Title / Name is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        ...itemData,
        id: itemData.id || `${entityType}-${Date.now()}`,
        title: nameOrTitle.trim(),
        name: nameOrTitle.trim(),
        status: itemData.status || 'published',
      };

      await UELEAdminService.saveEntity(entityType as any, payload);
      onRefreshDatabase();
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this record permanently?')) {
      try {
        await UELEAdminService.deleteEntity(entityType as any, id);
        onRefreshDatabase();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete record.');
      }
    }
  };

  // Get current dataset based on sub-module
  const items: any[] =
    activeSubModule === 'links'
      ? database.learningLinks || []
      : activeSubModule === 'standards'
      ? database.standards || []
      : activeSubModule === 'software'
      ? database.software || []
      : activeSubModule === 'courses'
      ? database.courses || []
      : activeSubModule === 'videos'
      ? database.videos || []
      : database.resources || [];

  const filteredItems = items.filter((i) => {
    const text = (i.title || i.name || '').toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage single source of truth for educational content, software tools & codes
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCreateNew}
          className="gap-2 shrink-0 font-semibold text-xs py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-500 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Record</span>
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
            placeholder="Search title or name..."
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
              <span>{itemData.id ? 'Edit Record' : 'Create New Record'}</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Title / Name *</label>
                <input
                  type="text"
                  value={itemData.title || itemData.name || ''}
                  onChange={(e) => setItemData({ ...itemData, title: e.target.value, name: e.target.value })}
                  placeholder="e.g. Water Treatment Process Standard"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">URL / Link</label>
                <input
                  type="text"
                  value={itemData.url || itemData.link || ''}
                  onChange={(e) => setItemData({ ...itemData, url: e.target.value, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={itemData.description || ''}
                onChange={(e) => setItemData({ ...itemData, description: e.target.value })}
                placeholder="Comprehensive technical summary..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                <Save className="w-4 h-4 mr-1" />
                <span>Save Record</span>
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
                <th className="p-3.5">Title / Name</th>
                <th className="p-3.5">URL / Link</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No records found. Click "+ Create New Record" above to add one.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-3.5 font-bold text-slate-200">
                      {item.title || item.name}
                      <div className="text-[10px] font-mono text-slate-500">{item.id}</div>
                    </td>
                    <td className="p-3.5 font-mono text-cyan-400">
                      {item.url || item.link ? (
                        <a
                          href={item.url || item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate max-w-xs">{item.url || item.link}</span>
                        </a>
                      ) : (
                        <span className="text-slate-600">No URL</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <Badge variant="emerald" size="sm">PUBLISHED</Badge>
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
      )}
    </div>
  );
};
