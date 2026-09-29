import React, { useState } from 'react';
import { useGIS } from '../../context/GISContext';
import {
  Table,
  X,
  Plus,
  Search,
  Download,
  Trash2,
  ArrowUpDown,
  Filter,
  Maximize2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const AttributeTable: React.FC = () => {
  const {
    project,
    activeLayerId,
    isAttributeTableOpen,
    setIsAttributeTableOpen,
    setIsFieldManagerOpen,
    updateFeatureProperties,
    selectedFeatureIds,
    setSelectedFeatureIds,
    selectFeatures,
    deleteSelectedFeatures,
    zoomToFeatures,
  } = useGIS();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  if (!isAttributeTableOpen) return null;

  const activeLayer = project.layers.find((l) => l.id === activeLayerId) || project.layers[0];

  if (!activeLayer) {
    return (
      <div className="h-64 bg-slate-900 border-t border-slate-800 p-4 flex items-center justify-center text-slate-500 text-xs">
        No active layer selected to display attribute table.
      </div>
    );
  }

  // Filter Features
  let filteredFeatures = activeLayer.features.filter((f) => {
    if (showSelectedOnly && !selectedFeatureIds.includes(f.id)) return false;
    if (!searchTerm) return true;
    return Object.values(f.properties).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort Features
  if (sortField) {
    filteredFeatures = [...filteredFeatures].sort((a, b) => {
      const valA = a.properties[sortField] ?? '';
      const valB = b.properties[sortField] ?? '';
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  const exportTableCSV = (onlySelected: boolean = false) => {
    const targetFeats = onlySelected
      ? activeLayer.features.filter((f) => selectedFeatureIds.includes(f.id))
      : activeLayer.features;

    if (targetFeats.length === 0) return;

    const fields = activeLayer.fields.map((f) => f.name);
    const headers = ['Feature_ID', ...fields].join(',');
    const rows = targetFeats.map((f) =>
      [f.id, ...fields.map((fd) => `"${f.properties[fd] ?? ''}"`)].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${activeLayer.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_attributes.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCellChange = (featureId: string, fieldName: string, rawValue: any, fieldType?: string) => {
    let parsedVal: any = rawValue;

    if (fieldType === 'integer') {
      parsedVal = parseInt(rawValue, 10);
      if (isNaN(parsedVal)) parsedVal = 0;
    } else if (fieldType === 'double' || fieldType === 'number') {
      parsedVal = parseFloat(rawValue);
      if (isNaN(parsedVal)) parsedVal = 0;
    } else if (fieldType === 'boolean') {
      parsedVal = rawValue === 'true' || rawValue === true;
    }

    const targetFeat = activeLayer.features.find((f) => f.id === featureId);
    if (targetFeat) {
      updateFeatureProperties(activeLayer.id, featureId, {
        ...targetFeat.properties,
        [fieldName]: parsedVal,
      });
    }
  };

  return (
    <div className="h-72 bg-slate-900 border-t border-slate-800 flex flex-col text-slate-200 select-none z-30 shadow-2xl">
      {/* Header Bar */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-xs text-cyan-400 uppercase tracking-wider">
            <Table size={15} />
            <span>Attribute Table — {activeLayer.name}</span>
            <span className="text-slate-500 font-mono">({filteredFeatures.length} / {activeLayer.features.length} rows)</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Search Bar */}
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search attributes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-full pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

          {/* Selected Only Toggle */}
          <button
            onClick={() => setShowSelectedOnly(!showSelectedOnly)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition ${
              showSelectedOnly
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter size={12} />
            <span>Selected Only ({selectedFeatureIds.length})</span>
          </button>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2">
          {selectedFeatureIds.length > 0 && (
            <button
              onClick={() => zoomToFeatures(selectedFeatureIds)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs px-2.5 py-1 rounded border border-slate-700 transition"
              title="Zoom Map to Selected Features"
            >
              <Maximize2 size={13} />
              <span>Zoom Selected</span>
            </button>
          )}

          <button
            onClick={() => setIsFieldManagerOpen(true)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs px-2.5 py-1 rounded border border-slate-700 transition"
          >
            <Sliders size={13} />
            <span>Field Manager</span>
          </button>

          <button
            onClick={() => exportTableCSV(showSelectedOnly)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded border border-slate-700 transition"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          {selectedFeatureIds.length > 0 && (
            <button
              onClick={deleteSelectedFeatures}
              className="flex items-center gap-1 bg-rose-950 text-rose-300 text-xs px-2.5 py-1 rounded border border-rose-800 transition"
            >
              <Trash2 size={13} />
              <span>Delete ({selectedFeatureIds.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsAttributeTableOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="flex-1 overflow-auto bg-slate-950 font-mono text-xs">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 text-slate-400 text-[11px] z-10">
            <tr>
              <th className="p-2 border-r border-slate-800 w-10 text-center sticky left-0 bg-slate-900">Sel</th>
              <th className="p-2 border-r border-slate-800 font-semibold sticky left-10 bg-slate-900 z-10">Feature ID</th>
              {activeLayer.fields.map((fd) => (
                <th
                  key={fd.name}
                  onClick={() => {
                    if (sortField === fd.name) setSortAsc(!sortAsc);
                    else {
                      setSortField(fd.name);
                      setSortAsc(true);
                    }
                  }}
                  className="p-2 border-r border-slate-800 font-semibold cursor-pointer hover:text-cyan-300 transition"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>{fd.alias || fd.name}</span>
                    <ArrowUpDown size={11} className="text-slate-600" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredFeatures.map((feat) => {
              const isSelected = selectedFeatureIds.includes(feat.id);

              return (
                <tr
                  key={feat.id}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey || e.shiftKey) {
                      selectFeatures([feat.id], 'toggle');
                    } else {
                      selectFeatures([feat.id], 'new');
                    }
                  }}
                  onDoubleClick={() => {
                    selectFeatures([feat.id], 'new');
                    zoomToFeatures([feat.id]);
                  }}
                  className={`hover:bg-slate-800/50 transition cursor-pointer ${
                    isSelected ? 'bg-cyan-950/60 text-cyan-200 font-medium' : 'text-slate-300'
                  }`}
                >
                  {/* Checkbox Column */}
                  <td className="p-2 text-center border-r border-slate-800/80 sticky left-0 bg-slate-950/90">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        selectFeatures([feat.id], 'toggle');
                      }}
                      className="accent-cyan-500 rounded cursor-pointer"
                    />
                  </td>

                  {/* Feature ID Column (Frozen) */}
                  <td className="p-2 border-r border-slate-800/80 text-cyan-400 font-semibold truncate max-w-[120px] sticky left-10 bg-slate-950/90">
                    {feat.id}
                  </td>

                  {/* Dynamic Attribute Fields */}
                  {activeLayer.fields.map((fd) => {
                    const cellVal = feat.properties[fd.name] ?? '';

                    return (
                      <td
                        key={fd.name}
                        className="p-1 border-r border-slate-800/80 hover:bg-slate-900 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Domain Choices Dropdown */}
                        {fd.domain && fd.domain.length > 0 ? (
                          <select
                            value={cellVal}
                            onChange={(e) => handleCellChange(feat.id, fd.name, e.target.value, fd.type)}
                            className="bg-slate-900 border border-slate-700/80 text-xs text-amber-300 rounded px-1.5 py-0.5 w-full focus:outline-none focus:border-cyan-500"
                          >
                            <option value="">-- Select --</option>
                            {fd.domain.map((choice) => (
                              <option key={choice} value={choice}>
                                {choice}
                              </option>
                            ))}
                          </select>
                        ) : fd.type === 'boolean' ? (
                          <select
                            value={String(cellVal)}
                            onChange={(e) => handleCellChange(feat.id, fd.name, e.target.value, fd.type)}
                            className="bg-slate-900 border border-slate-700/80 text-xs text-slate-200 rounded px-1.5 py-0.5 w-full focus:outline-none focus:border-cyan-500"
                          >
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        ) : (
                          <input
                            type={fd.type === 'integer' || fd.type === 'double' ? 'number' : 'text'}
                            value={cellVal}
                            onChange={(e) => handleCellChange(feat.id, fd.name, e.target.value, fd.type)}
                            className="bg-transparent hover:bg-slate-900 focus:bg-slate-900 border border-transparent focus:border-cyan-500 text-xs text-slate-200 rounded px-1.5 py-0.5 w-full focus:outline-none"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
