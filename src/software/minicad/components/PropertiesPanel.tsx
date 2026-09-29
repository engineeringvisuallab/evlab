import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Layers as LayersIcon,
  Terminal,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Check,
  Info,
  Box,
  Maximize2,
} from 'lucide-react';
import {
  CADObject,
  Layer,
  LineObject,
  RectangleObject,
  CircleObject,
  PolylineObject,
  TextObject,
  DimensionObject,
  Box3DObject,
  Cylinder3DObject,
  Sphere3DObject,
  Cone3DObject,
  CommandLog,
} from '../types/cad';
import { distance, angleBetweenDeg } from '../utils/cadMath';

interface PropertiesPanelProps {
  selectedObjects: CADObject[];
  onUpdateObject: (updatedObj: CADObject) => void;
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (layerId: string) => void;
  onAddLayer: (name: string, color: string) => void;
  onToggleLayerVisibility: (layerId: string) => void;
  onToggleLayerLock: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  commandLogs: CommandLog[];
  onExecuteCommand: (cmd: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObjects,
  onUpdateObject,
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onDeleteLayer,
  commandLogs,
  onExecuteCommand,
}) => {
  const [activeTab, setActiveTab] = useState<'props' | 'layers' | 'console'>('props');
  const [newLayerName, setNewLayerName] = useState('');
  const [newLayerColor, setNewLayerColor] = useState('#00ffff');
  const [commandInput, setCommandInput] = useState('');

  const singleSelection = selectedObjects.length === 1 ? selectedObjects[0] : null;

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    onExecuteCommand(commandInput.trim());
    setCommandInput('');
  };

  const handleAddLayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLayerName.trim()) return;
    onAddLayer(newLayerName.trim(), newLayerColor);
    setNewLayerName('');
  };

  return (
    <div className="w-80 bg-[#1e2127] border-l border-[#2d3139] flex flex-col text-xs text-[#cfd3dc] select-none z-10">
      {/* Panel Tabs */}
      <div className="h-9 bg-[#181a1f] border-b border-[#2d3139] flex items-center px-2 space-x-1">
        <button
          onClick={() => setActiveTab('props')}
          className={`flex-1 py-1 px-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'props'
              ? 'bg-[#282c35] text-white font-medium shadow-sm border border-[#3b404d]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span>Properties</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1 px-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'layers'
              ? 'bg-[#282c35] text-white font-medium shadow-sm border border-[#3b404d]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayersIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Layers ({layers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('console')}
          className={`flex-1 py-1 px-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'console'
              ? 'bg-[#282c35] text-white font-medium shadow-sm border border-[#3b404d]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span>Console</span>
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-4">
        {/* ================= PROPERTIES TAB ================= */}
        {activeTab === 'props' && (
          <div>
            {selectedObjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 space-y-2">
                <Info className="w-8 h-8 text-gray-600 stroke-1" />
                <p className="font-medium text-gray-400">No Object Selected</p>
                <p className="text-[11px] max-w-[200px]">
                  Click an object in 2D or 3D canvas to inspect or edit geometry and extrusion parameters.
                </p>
              </div>
            )}

            {selectedObjects.length > 1 && (
              <div className="bg-[#262a33] p-3 rounded border border-[#383e4a] space-y-2">
                <div className="text-white font-semibold text-sm">
                  {selectedObjects.length} Objects Selected
                </div>
                <p className="text-gray-400 text-[11px]">
                  Multiple elements selected. Press <kbd className="px-1 py-0.5 bg-black/40 rounded">Delete</kbd> to remove them.
                </p>
              </div>
            )}

            {singleSelection && (
              <div className="space-y-4">
                {/* Object Header Info */}
                <div className="bg-[#252932] p-3 rounded border border-[#383e4c] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                      CAD Object Type
                    </span>
                    <span className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                      {singleSelection.type.includes('3d') && <Box className="w-4 h-4 text-cyan-400" />}
                      {singleSelection.type}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 bg-black/30 px-2 py-1 rounded">
                    ID: {singleSelection.id.slice(0, 8)}
                  </span>
                </div>

                {/* General Styling Properties */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    General Attributes
                  </div>

                  {/* Layer */}
                  <div className="flex items-center justify-between bg-[#242730] p-2 rounded border border-[#333844]">
                    <span className="text-gray-400">Layer</span>
                    <select
                      value={singleSelection.layerId}
                      onChange={(e) =>
                        onUpdateObject({ ...singleSelection, layerId: e.target.value })
                      }
                      className="bg-[#181a1f] text-white rounded px-2 py-1 outline-none border border-[#3a3f4d]"
                    >
                      {layers.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Color Override */}
                  <div className="flex items-center justify-between bg-[#242730] p-2 rounded border border-[#333844]">
                    <span className="text-gray-400">Color</span>
                    <input
                      type="color"
                      value={singleSelection.color || '#00ffff'}
                      onChange={(e) =>
                        onUpdateObject({ ...singleSelection, color: e.target.value })
                      }
                      className="w-6 h-6 rounded cursor-pointer border border-[#3a3f4d] bg-transparent"
                    />
                  </div>

                  {/* 3D Extrusion Height for 2D objects */}
                  {!singleSelection.type.includes('3d') && (
                    <div className="bg-[#242730] p-2 rounded border border-[#333844] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 font-semibold flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-cyan-400" /> 3D Extrude Height
                        </span>
                        <span className="text-gray-400 font-mono text-[10px]">mm</span>
                      </div>
                      <input
                        type="number"
                        step="5"
                        min="0"
                        value={singleSelection.extrudeHeight || 0}
                        onChange={(e) =>
                          onUpdateObject({
                            ...singleSelection,
                            extrudeHeight: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-full bg-[#181a1f] text-cyan-300 font-mono font-bold text-sm rounded px-2 py-1 outline-none border border-[#3a3f4d]"
                      />
                    </div>
                  )}
                </div>

                {/* Geometry Specific Inspector */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Geometry Coordinates & Dimensions
                  </div>

                  {/* 3D BOX OBJECT */}
                  {singleSelection.type === 'box_3d' && (() => {
                    const box = singleSelection as Box3DObject;
                    return (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-[#242730] p-1.5 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Pos X</label>
                            <input
                              type="number"
                              value={box.x}
                              onChange={(e) => onUpdateObject({ ...box, x: Number(e.target.value) })}
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1 py-0.5"
                            />
                          </div>
                          <div className="bg-[#242730] p-1.5 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Pos Y</label>
                            <input
                              type="number"
                              value={box.y}
                              onChange={(e) => onUpdateObject({ ...box, y: Number(e.target.value) })}
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1 py-0.5"
                            />
                          </div>
                          <div className="bg-[#242730] p-1.5 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Pos Z</label>
                            <input
                              type="number"
                              value={box.z || 0}
                              onChange={(e) => onUpdateObject({ ...box, z: Number(e.target.value) })}
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1 py-0.5"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-[#242730] p-1.5 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Width</label>
                            <input
                              type="number"
                              value={box.width}
                              onChange={(e) => onUpdateObject({ ...box, width: Number(e.target.value) })}
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1 py-0.5"
                            />
                          </div>
                          <div className="bg-[#242730] p-1.5 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Length</label>
                            <input
                              type="number"
                              value={box.length}
                              onChange={(e) => onUpdateObject({ ...box, length: Number(e.target.value) })}
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1 py-0.5"
                            />
                          </div>
                          <div className="bg-[#242730] p-1.5 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Height</label>
                            <input
                              type="number"
                              value={box.height}
                              onChange={(e) => onUpdateObject({ ...box, height: Number(e.target.value) })}
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1 py-0.5"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3D CYLINDER OBJECT */}
                  {singleSelection.type === 'cylinder_3d' && (() => {
                    const cyl = singleSelection as Cylinder3DObject;
                    return (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Radius (mm)</label>
                            <input
                              type="number"
                              value={cyl.radius}
                              onChange={(e) => onUpdateObject({ ...cyl, radius: Number(e.target.value) })}
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5"
                            />
                          </div>
                          <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Height (mm)</label>
                            <input
                              type="number"
                              value={cyl.height}
                              onChange={(e) => onUpdateObject({ ...cyl, height: Number(e.target.value) })}
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* LINE OBJECT */}
                  {singleSelection.type === 'line' && (() => {
                    const line = singleSelection as LineObject;
                    const p1 = { x: line.startX, y: line.startY };
                    const p2 = { x: line.endX, y: line.endY };
                    const len = distance(p1, p2);
                    const ang = angleBetweenDeg(p1, p2);

                    return (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Start X</label>
                            <input
                              type="number"
                              step="1"
                              value={line.startX}
                              onChange={(e) =>
                                onUpdateObject({ ...line, startX: Number(e.target.value) })
                              }
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5 outline-none border border-[#3a3f4d]"
                            />
                          </div>
                          <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Start Y</label>
                            <input
                              type="number"
                              step="1"
                              value={line.startY}
                              onChange={(e) =>
                                onUpdateObject({ ...line, startY: Number(e.target.value) })
                              }
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5 outline-none border border-[#3a3f4d]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">End X</label>
                            <input
                              type="number"
                              step="1"
                              value={line.endX}
                              onChange={(e) =>
                                onUpdateObject({ ...line, endX: Number(e.target.value) })
                              }
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5 outline-none border border-[#3a3f4d]"
                            />
                          </div>
                          <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">End Y</label>
                            <input
                              type="number"
                              step="1"
                              value={line.endY}
                              onChange={(e) =>
                                onUpdateObject({ ...line, endY: Number(e.target.value) })
                              }
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5 outline-none border border-[#3a3f4d]"
                            />
                          </div>
                        </div>

                        <div className="bg-[#1b1e24] p-2.5 rounded border border-[#333844] space-y-1 font-mono text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Length:</span>
                            <span className="text-amber-400 font-bold">{len.toFixed(2)} mm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Angle:</span>
                            <span className="text-green-400">{ang.toFixed(1)}°</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* RECTANGLE OBJECT */}
                  {singleSelection.type === 'rectangle' && (() => {
                    const rect = singleSelection as RectangleObject;
                    const area = Math.abs(rect.width * rect.height);

                    return (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Corner X</label>
                            <input
                              type="number"
                              step="1"
                              value={rect.x}
                              onChange={(e) =>
                                onUpdateObject({ ...rect, x: Number(e.target.value) })
                              }
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5 outline-none border border-[#3a3f4d]"
                            />
                          </div>
                          <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Corner Y</label>
                            <input
                              type="number"
                              step="1"
                              value={rect.y}
                              onChange={(e) =>
                                onUpdateObject({ ...rect, y: Number(e.target.value) })
                              }
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5 outline-none border border-[#3a3f4d]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Width</label>
                            <input
                              type="number"
                              step="1"
                              value={rect.width}
                              onChange={(e) =>
                                onUpdateObject({ ...rect, width: Number(e.target.value) })
                              }
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5 outline-none border border-[#3a3f4d]"
                            />
                          </div>
                          <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Height</label>
                            <input
                              type="number"
                              step="1"
                              value={rect.height}
                              onChange={(e) =>
                                onUpdateObject({ ...rect, height: Number(e.target.value) })
                              }
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5 outline-none border border-[#3a3f4d]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* CIRCLE OBJECT */}
                  {singleSelection.type === 'circle' && (() => {
                    const circle = singleSelection as CircleObject;
                    return (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Center X</label>
                            <input
                              type="number"
                              step="1"
                              value={circle.centerX}
                              onChange={(e) =>
                                onUpdateObject({ ...circle, centerX: Number(e.target.value) })
                              }
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5 outline-none border border-[#3a3f4d]"
                            />
                          </div>
                          <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                            <label className="text-[10px] text-gray-400 block">Center Y</label>
                            <input
                              type="number"
                              step="1"
                              value={circle.centerY}
                              onChange={(e) =>
                                onUpdateObject({ ...circle, centerY: Number(e.target.value) })
                              }
                              className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5 outline-none border border-[#3a3f4d]"
                            />
                          </div>
                        </div>

                        <div className="bg-[#242730] p-2 rounded border border-[#333844]">
                          <label className="text-[10px] text-gray-400 block">Radius</label>
                          <input
                            type="number"
                            step="1"
                            value={circle.radius}
                            onChange={(e) =>
                              onUpdateObject({ ...circle, radius: Math.max(1, Number(e.target.value)) })
                            }
                            className="w-full bg-[#181a1f] text-cyan-300 font-mono rounded px-1.5 py-0.5 outline-none border border-[#3a3f4d]"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= LAYERS TAB ================= */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            {/* Add Layer Form */}
            <form
              onSubmit={handleAddLayerSubmit}
              className="bg-[#242730] p-2.5 rounded border border-[#353a47] space-y-2"
            >
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Create New Layer
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Layer Name"
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  className="flex-1 bg-[#181a1f] text-white px-2 py-1 rounded outline-none border border-[#3a3f4d]"
                />
                <input
                  type="color"
                  value={newLayerColor}
                  onChange={(e) => setNewLayerColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border border-[#3a3f4d]"
                />
                <button
                  type="submit"
                  className="bg-[#0078d4] hover:bg-[#106ebe] text-white p-1.5 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Layer List */}
            <div className="space-y-1.5">
              {layers.map((layer) => {
                const isActive = layer.id === activeLayerId;
                return (
                  <div
                    key={layer.id}
                    className={`p-2 rounded border flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-[#283142] border-[#0078d4]'
                        : 'bg-[#22252c] border-[#313642] hover:bg-[#282b35]'
                    }`}
                  >
                    <div
                      onClick={() => onSelectLayer(layer.id)}
                      className="flex items-center space-x-2.5 cursor-pointer flex-1"
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-gray-400 shadow-sm"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className={`font-medium ${isActive ? 'text-cyan-300 font-bold' : 'text-gray-200'}`}>
                        {layer.name}
                      </span>
                      {isActive && <span className="text-[9px] bg-blue-900/60 text-blue-300 px-1.5 py-0.2 rounded">ACTIVE</span>}
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Visibility Toggle */}
                      <button
                        onClick={() => onToggleLayerVisibility(layer.id)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                      >
                        {layer.visible ? (
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-gray-600" />
                        )}
                      </button>

                      {/* Lock Toggle */}
                      <button
                        onClick={() => onToggleLayerLock(layer.id)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                      >
                        {layer.locked ? (
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>

                      {/* Delete Layer (if >1 layers) */}
                      {layers.length > 1 && (
                        <button
                          onClick={() => onDeleteLayer(layer.id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                          title="Delete Layer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= CONSOLE / COMMAND LOG TAB ================= */}
        {activeTab === 'console' && (
          <div className="flex flex-col h-full space-y-2">
            <div className="flex-1 bg-[#121417] border border-[#2d3139] rounded p-2.5 font-mono text-[11px] overflow-y-auto space-y-1 custom-scrollbar min-h-[280px] max-h-[400px]">
              {commandLogs.map((log) => (
                <div key={log.id} className="leading-tight">
                  <span className="text-gray-600 select-none mr-2">[{log.timestamp}]</span>
                  <span
                    className={
                      log.type === 'cmd'
                        ? 'text-cyan-400 font-bold'
                        : log.type === 'success'
                        ? 'text-green-400'
                        : log.type === 'warn'
                        ? 'text-amber-400'
                        : 'text-gray-300'
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Command Line Input */}
            <form onSubmit={handleCommandSubmit} className="flex gap-1.5">
              <span className="bg-[#242730] border border-[#3a3f4d] text-cyan-400 font-mono font-bold px-2 py-1 rounded flex items-center">
                CMD:
              </span>
              <input
                type="text"
                placeholder="Type command (e.g. line, circle, clear)..."
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                className="flex-1 bg-[#121417] text-white font-mono px-2 py-1 rounded border border-[#3a3f4d] outline-none focus:border-cyan-500"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
