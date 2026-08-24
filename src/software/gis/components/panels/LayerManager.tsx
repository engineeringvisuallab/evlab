import React, { useState } from 'react';
import { useGIS } from '../../context/GISContext';
import {
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Table,
  MapPin,
  Spline,
  Hexagon,
  Palette,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Edit2,
  Check,
  Lock,
  Unlock,
  Sliders,
  Download,
  Copy,
  PlusCircle,
  Play,
  Save,
  XCircle,
} from 'lucide-react';
import { GISLayer } from '../../types/gis';

export const LayerManager: React.FC = () => {
  const {
    project,
    activeLayerId,
    setActiveLayerId,
    toggleLayerVisibility,
    setLayerOpacity,
    removeLayer,
    renameLayer,
    zoomToLayer,
    addLayer,
    reorderLayers,
    setIsAttributeTableOpen,
    setIsSymbologyModalOpen,
    setIsFieldManagerOpen,
    startEditingLayer,
    saveLayerEdits,
    cancelLayerEdits,
    editSession,
    toggleLayerLock,
  } = useGIS();

  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [contextMenuLayerId, setContextMenuLayerId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newLayers = [...project.layers];
    const temp = newLayers[index];
    newLayers[index] = newLayers[index - 1];
    newLayers[index - 1] = temp;
    reorderLayers(newLayers);
  };

  const handleMoveDown = (index: number) => {
    if (index === project.layers.length - 1) return;
    const newLayers = [...project.layers];
    const temp = newLayers[index];
    newLayers[index] = newLayers[index + 1];
    newLayers[index + 1] = temp;
    reorderLayers(newLayers);
  };

  const handleAddEmptyLayer = (geomType: 'Point' | 'LineString' | 'Polygon') => {
    const name = prompt(`Enter name for new ${geomType} layer:`, `New ${geomType} Layer`);
    if (!name) return;

    const newLyr: GISLayer = {
      id: `layer_custom_${Date.now()}`,
      name,
      type: 'vector',
      geometryType: geomType,
      visible: true,
      opacity: 1,
      locked: false,
      features: [],
      fields: [
        { name: 'ID', type: 'string', alias: 'Feature ID' },
        { name: 'Name', type: 'string', alias: 'Feature Name' },
      ],
      symbology: {
        styleType: 'single',
        fillColor: geomType === 'Polygon' ? '#0ea5e9' : undefined,
        strokeColor: '#0284c7',
        strokeWidth: 2,
        pointRadius: 6,
      },
      labelConfig: {
        enabled: false,
        attributeField: 'Name',
        fontSize: 10,
        color: '#0f172a',
        haloColor: '#ffffff',
        haloWidth: 1.5,
        placement: 'centroid',
      },
      sourceType: 'custom_drawing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addLayer(newLyr);
  };

  const handleExportLayer = (layer: GISLayer) => {
    const geojson = {
      type: 'FeatureCollection',
      features: layer.features.map((f) => ({
        type: 'Feature',
        id: f.id,
        geometry: f.geometry,
        properties: f.properties,
      })),
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${layer.name.toLowerCase().replace(/\s+/g, '_')}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderGeometryIcon = (geomType?: string) => {
    switch (geomType) {
      case 'Point':
        return <MapPin size={14} className="text-rose-400" />;
      case 'LineString':
        return <Spline size={14} className="text-cyan-400" />;
      case 'Polygon':
        return <Hexagon size={14} className="text-emerald-400" />;
      default:
        return <Layers size={14} className="text-amber-400" />;
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-slate-900 border-r border-slate-800 select-none text-slate-200 relative"
      onClick={() => setContextMenuLayerId(null)}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-cyan-400">
          <Layers size={15} />
          <span>Layer Manager (TOC)</span>
        </div>

        {/* Add Layer Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleAddEmptyLayer('LineString')}
            title="New Line Layer"
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-cyan-400 transition"
          >
            <Spline size={14} />
          </button>
          <button
            onClick={() => handleAddEmptyLayer('Polygon')}
            title="New Polygon Layer"
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-emerald-400 transition"
          >
            <Hexagon size={14} />
          </button>
          <button
            onClick={() => handleAddEmptyLayer('Point')}
            title="New Point Layer"
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-rose-400 transition"
          >
            <MapPin size={14} />
          </button>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 text-xs">
        {project.layers.length === 0 ? (
          <div className="p-4 text-center text-slate-500 italic">
            No vector layers in project. Click Add Data or Create Layer above.
          </div>
        ) : (
          project.layers.map((layer, index) => {
            const isActive = activeLayerId === layer.id;
            const isEditing = editSession?.layerId === layer.id;

            return (
              <div
                key={layer.id}
                onClick={() => setActiveLayerId(layer.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setActiveLayerId(layer.id);
                  setContextMenuLayerId(layer.id);
                  setContextMenuPos({ x: e.clientX, y: e.clientY });
                }}
                className={`p-2.5 rounded-lg border transition relative ${
                  isActive
                    ? 'bg-slate-800/90 border-cyan-500/80 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                {/* Layer Title Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    {/* Visibility Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisibility(layer.id);
                      }}
                      className="text-slate-400 hover:text-cyan-400 p-0.5"
                    >
                      {layer.visible ? (
                        <Eye size={15} className="text-cyan-400" />
                      ) : (
                        <EyeOff size={15} className="text-slate-600" />
                      )}
                    </button>

                    {/* Geometry Icon */}
                    {renderGeometryIcon(layer.geometryType)}

                    {/* Layer Name / Inline Rename */}
                    {editingLayerId === layer.id ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (editingName.trim()) renameLayer(layer.id, editingName.trim());
                              setEditingLayerId(null);
                            } else if (e.key === 'Escape') {
                              setEditingLayerId(null);
                            }
                          }}
                          className="bg-slate-900 border border-cyan-500 text-xs text-white px-1 py-0.5 rounded focus:outline-none w-28"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (editingName.trim()) renameLayer(layer.id, editingName.trim());
                            setEditingLayerId(null);
                          }}
                          className="p-1 hover:bg-slate-700 text-cyan-400 rounded"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <span
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingLayerId(layer.id);
                          setEditingName(layer.name);
                        }}
                        className={`font-semibold truncate max-w-[100px] ${
                          layer.visible ? 'text-slate-200' : 'text-slate-500'
                        }`}
                        title="Double-click to rename"
                      >
                        {layer.name}
                      </span>
                    )}

                    <span className="text-[10px] text-slate-500 font-mono">({layer.features.length})</span>

                    {/* Status Badges */}
                    {isEditing && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-1.5 py-0.2 rounded uppercase font-bold animate-pulse">
                        EDIT
                      </span>
                    )}
                    {layer.locked && (
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] px-1 py-0.2 rounded">
                        <Lock size={10} />
                      </span>
                    )}
                  </div>

                  {/* Quick Layer Header Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerLock(layer.id);
                      }}
                      className={`p-0.5 hover:bg-slate-700 rounded ${
                        layer.locked ? 'text-rose-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                    >
                      {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomToLayer(layer.id);
                      }}
                      className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-cyan-400"
                      title="Zoom To Layer Extent"
                    >
                      <Maximize2 size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(index);
                      }}
                      disabled={index === 0}
                      className="p-0.5 hover:bg-slate-700 rounded text-slate-400 disabled:opacity-20"
                      title="Move Up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(index);
                      }}
                      disabled={index === project.layers.length - 1}
                      className="p-0.5 hover:bg-slate-700 rounded text-slate-400 disabled:opacity-20"
                      title="Move Down"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                </div>

                {/* Layer Quick Controls */}
                {isActive && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-2">
                    {/* Opacity Slider */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>Opacity:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={layer.opacity}
                        onChange={(e) => setLayerOpacity(layer.id, parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    {/* Edit Session Toolbar */}
                    <div className="flex items-center gap-1">
                      {!isEditing ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingLayer(layer.id);
                          }}
                          disabled={layer.locked}
                          className="flex-1 flex items-center justify-center gap-1 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 py-1 rounded text-[10px] font-semibold disabled:opacity-40 transition"
                        >
                          <Play size={11} />
                          <span>Start Editing</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveLayerEdits();
                            }}
                            className="flex-1 flex items-center justify-center gap-1 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 py-1 rounded text-[10px] font-semibold transition"
                          >
                            <Save size={11} />
                            <span>Save Edits</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelLayerEdits();
                            }}
                            className="flex items-center justify-center gap-1 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 px-2 py-1 rounded text-[10px] font-semibold transition"
                          >
                            <XCircle size={11} />
                            <span>Discard</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Layer Tools Row */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAttributeTableOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 py-1 rounded text-[10px]"
                      >
                        <Table size={11} />
                        <span>Table</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFieldManagerOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 py-1 rounded text-[10px]"
                      >
                        <Sliders size={11} />
                        <span>Fields</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSymbologyModalOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 py-1 rounded text-[10px]"
                      >
                        <Palette size={11} />
                        <span>Style</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportLayer(layer);
                        }}
                        className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded"
                        title="Export Layer GeoJSON"
                      >
                        <Download size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Layer Context Menu */}
      {contextMenuLayerId && contextMenuPos && (
        <div
          className="fixed z-50 bg-slate-900 border border-slate-700/80 rounded-lg shadow-2xl py-1 text-xs text-slate-200 min-w-[170px]"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              zoomToLayer(contextMenuLayerId);
              setContextMenuLayerId(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
          >
            <Maximize2 size={13} className="text-cyan-400" />
            <span>Zoom To Layer</span>
          </button>
          <button
            onClick={() => {
              setIsAttributeTableOpen(true);
              setContextMenuLayerId(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
          >
            <Table size={13} className="text-emerald-400" />
            <span>Open Attribute Table</span>
          </button>
          <button
            onClick={() => {
              setIsFieldManagerOpen(true);
              setContextMenuLayerId(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
          >
            <Sliders size={13} className="text-indigo-400" />
            <span>Field Management</span>
          </button>
          <button
            onClick={() => {
              setIsSymbologyModalOpen(true);
              setContextMenuLayerId(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
          >
            <Palette size={13} className="text-amber-400" />
            <span>Layer Style & Labels</span>
          </button>
          <div className="my-1 border-t border-slate-800" />
          <button
            onClick={() => {
              toggleLayerLock(contextMenuLayerId);
              setContextMenuLayerId(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
          >
            <Lock size={13} className="text-rose-400" />
            <span>Toggle Lock Layer</span>
          </button>
          <button
            onClick={() => {
              const target = project.layers.find((l) => l.id === contextMenuLayerId);
              if (target) handleExportLayer(target);
              setContextMenuLayerId(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
          >
            <Download size={13} className="text-sky-400" />
            <span>Export Layer (GeoJSON)</span>
          </button>
          <div className="my-1 border-t border-slate-800" />
          <button
            onClick={() => {
              removeLayer(contextMenuLayerId);
              setContextMenuLayerId(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-rose-950/80 text-rose-300 flex items-center gap-2"
          >
            <Trash2 size={13} />
            <span>Remove Layer</span>
          </button>
        </div>
      )}
    </div>
  );
};
