import React, { useState } from 'react';
import { useGIS } from '../../context/GISContext';
import { FieldDefinition } from '../../types/gis';
import {
  X,
  Plus,
  Trash2,
  Sliders,
  Check,
  Zap,
  ListFilter,
  FileSpreadsheet,
} from 'lucide-react';

export const FieldManagerModal: React.FC = () => {
  const {
    project,
    activeLayerId,
    isFieldManagerOpen,
    setIsFieldManagerOpen,
    addFieldToLayer,
    updateFieldInLayer,
    deleteFieldFromLayer,
    applyEngineeringTemplate,
  } = useGIS();

  const activeLayer = project.layers.find((l) => l.id === activeLayerId);

  // Add Field Form State
  const [fieldName, setFieldName] = useState('');
  const [fieldAlias, setFieldAlias] = useState('');
  const [fieldType, setFieldType] = useState<FieldDefinition['type']>('string');
  const [defaultValue, setDefaultValue] = useState('');
  const [domainString, setDomainString] = useState('');

  if (!isFieldManagerOpen || !activeLayer) return null;

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    const domainList = domainString
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newField: FieldDefinition = {
      name: fieldName.trim().replace(/\s+/g, '_'),
      alias: fieldAlias.trim() || fieldName.trim(),
      type: fieldType,
      defaultValue: defaultValue.trim() || undefined,
      domain: domainList.length > 0 ? domainList : undefined,
    };

    addFieldToLayer(activeLayer.id, newField);

    setFieldName('');
    setFieldAlias('');
    setDefaultValue('');
    setDomainString('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="text-cyan-400" size={18} />
            <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
              Field Manager — <span className="text-cyan-400">{activeLayer.name}</span>
            </h2>
          </div>
          <button
            onClick={() => setIsFieldManagerOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-300 flex-1">
          {/* Apply Quick Engineering Templates */}
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-lg">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-2">
              <Zap size={14} className="text-amber-400" />
              <span>Apply Engineering Schema Templates</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Automatically add standardized domain fields for engineering layers.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => applyEngineeringTemplate(activeLayer.id, 'water_pipe')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 px-3 py-1.5 rounded font-medium text-left flex items-center gap-2 transition"
              >
                <FileSpreadsheet size={13} />
                <span>Water Pipe</span>
              </button>
              <button
                onClick={() => applyEngineeringTemplate(activeLayer.id, 'valve')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-300 px-3 py-1.5 rounded font-medium text-left flex items-center gap-2 transition"
              >
                <FileSpreadsheet size={13} />
                <span>Valve</span>
              </button>
              <button
                onClick={() => applyEngineeringTemplate(activeLayer.id, 'hydrant')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-rose-300 px-3 py-1.5 rounded font-medium text-left flex items-center gap-2 transition"
              >
                <FileSpreadsheet size={13} />
                <span>Hydrant</span>
              </button>
              <button
                onClick={() => applyEngineeringTemplate(activeLayer.id, 'road')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-emerald-300 px-3 py-1.5 rounded font-medium text-left flex items-center gap-2 transition"
              >
                <FileSpreadsheet size={13} />
                <span>Road</span>
              </button>
              <button
                onClick={() => applyEngineeringTemplate(activeLayer.id, 'drain')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-indigo-300 px-3 py-1.5 rounded font-medium text-left flex items-center gap-2 transition"
              >
                <FileSpreadsheet size={13} />
                <span>Drain</span>
              </button>
              <button
                onClick={() => applyEngineeringTemplate(activeLayer.id, 'parcel')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-sky-300 px-3 py-1.5 rounded font-medium text-left flex items-center gap-2 transition"
              >
                <FileSpreadsheet size={13} />
                <span>Parcel</span>
              </button>
            </div>
          </div>

          {/* Existing Fields Table */}
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Layer Attribute Fields ({activeLayer.fields.length})</h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px]">
                    <th className="p-2.5">Field Name</th>
                    <th className="p-2.5">Display Alias</th>
                    <th className="p-2.5">Data Type</th>
                    <th className="p-2.5">Domain / Choices</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeLayer.fields.map((f) => (
                    <tr key={f.name} className="hover:bg-slate-900/50 transition">
                      <td className="p-2.5 font-mono text-cyan-300 font-semibold">{f.name}</td>
                      <td className="p-2.5 text-slate-200">{f.alias || f.name}</td>
                      <td className="p-2.5">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px]">
                          {f.type}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400">
                        {f.domain && f.domain.length > 0 ? (
                          <span className="text-amber-300 font-mono text-[10px]" title={f.domain.join(', ')}>
                            [{f.domain.slice(0, 3).join(', ')}{f.domain.length > 3 ? '...' : ''}]
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => deleteFieldFromLayer(activeLayer.id, f.name)}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded transition"
                          title="Delete Field"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Custom Field Form */}
          <form onSubmit={handleAddField} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Plus size={14} className="text-cyan-400" />
              <span>Add Custom Attribute Field</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Field Name (DB Identifier)</label>
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="e.g. Pipe_Status"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Display Alias</label>
                <input
                  type="text"
                  value={fieldAlias}
                  onChange={(e) => setFieldAlias(e.target.value)}
                  placeholder="e.g. Pipe Status"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Data Type</label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="string">String (Text)</option>
                  <option value="integer">Integer (Whole Number)</option>
                  <option value="double">Double (Decimal Number)</option>
                  <option value="boolean">Boolean (True/False)</option>
                  <option value="date">Date</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Default Value</label>
                <input
                  type="text"
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder="Default value"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Domain Value List / Choices (Comma-separated)</label>
              <input
                type="text"
                value={domainString}
                onChange={(e) => setDomainString(e.target.value)}
                placeholder="e.g. Existing, Proposed, Abandoned"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Providing values creates a dropdown list editor in the Attribute Table.
              </p>
            </div>

            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-1.5 rounded transition flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Field To Layer</span>
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setIsFieldManagerOpen(false)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-1.5 rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
