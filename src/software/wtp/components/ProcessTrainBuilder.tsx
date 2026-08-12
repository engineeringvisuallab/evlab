import React, { useState } from 'react';
import { Layers, Plus, Trash2, ArrowUp, ArrowDown, Copy, CheckCircle2, Sliders, ArrowRight, Activity, GitCommit, Play } from 'lucide-react';
import { ProcessTrainNode, ProcessStream, propagateProcessStreams, DEFAULT_PROCESS_TRAIN } from '../core/processStreamEngine';

interface ProcessTrainBuilderProps {
  plantCapacityMLD: number;
  rawWaterQuality: {
    turbidityNTU: number;
    tssMgL: number;
    ironMgL: number;
    manganeseMgL: number;
    coliformCfu: number;
    ph: number;
    alkalinityMgL: number;
  };
  onSelectUnitToDesign?: (unitType: string) => void;
}

export const ProcessTrainBuilder: React.FC<ProcessTrainBuilderProps> = ({
  plantCapacityMLD,
  rawWaterQuality,
  onSelectUnitToDesign
}) => {
  const [nodes, setNodes] = useState<ProcessTrainNode[]>(DEFAULT_PROCESS_TRAIN);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(DEFAULT_PROCESS_TRAIN[0].id);

  const streams: ProcessStream[] = propagateProcessStreams(nodes, plantCapacityMLD, rawWaterQuality);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const handleToggleEnable = (id: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newNodes = [...nodes];
    const temp = newNodes[index];
    newNodes[index] = newNodes[index - 1];
    newNodes[index - 1] = temp;
    // update sequences
    newNodes.forEach((n, i) => n.sequence = i + 1);
    setNodes(newNodes);
  };

  const handleMoveDown = (index: number) => {
    if (index === nodes.length - 1) return;
    const newNodes = [...nodes];
    const temp = newNodes[index];
    newNodes[index] = newNodes[index + 1];
    newNodes[index + 1] = temp;
    newNodes.forEach((n, i) => n.sequence = i + 1);
    setNodes(newNodes);
  };

  const handleDuplicate = (id: string) => {
    const target = nodes.find(n => n.id === id);
    if (!target) return;
    const newNode: ProcessTrainNode = {
      ...target,
      id: `UNIT-${target.unitType.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      name: `${target.name} (Duplicate)`,
      sequence: nodes.length + 1
    };
    setNodes([...nodes, newNode]);
  };

  const handleDelete = (id: string) => {
    if (nodes.length <= 2) return;
    const filtered = nodes.filter(n => n.id !== id);
    filtered.forEach((n, i) => n.sequence = i + 1);
    setNodes(filtered);
  };

  const handleAddProcess = (unitType: ProcessTrainNode['unitType']) => {
    const typeNames: Record<string, string> = {
      intake: 'Intake Structure',
      screening: 'Bar Screening Channel',
      aeration: 'Aeration Unit',
      coagulation: 'Rapid Flash Mixer',
      flocculation: 'Tapered Flocculator',
      sedimentation: 'Sedimentation Clarifier',
      filtration: 'Rapid Sand Filter',
      disinfection: 'Disinfection Contact Chamber',
      cwr: 'Clear Water Reservoir'
    };
    const newNode: ProcessTrainNode = {
      id: `UNIT-${unitType.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      unitType,
      name: typeNames[unitType] || 'Custom Unit Process',
      enabled: true,
      sequence: nodes.length + 1,
      subType: 'Standard Configuration',
      numUnits: 2,
      headLossM: 0.3,
      removalEfficiencies: { turbidityPct: 20, tssPct: 20, ironPct: 0, manganesePct: 0, coliformPct: 0 },
      parameters: {}
    };
    setNodes([...nodes, newNode]);
  };

  return (
    <div className="space-y-8 font-mono text-xs">
      {/* Header & Quick Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Configurable Process Train Builder & Stream Propagator</span>
          </h2>
          <p className="text-slate-400 text-2xs mt-1">
            Reorder, enable/disable, configure, and track water quality stream propagation across the entire WTP process sequence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-2xs">Add Unit:</span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddProcess(e.target.value as ProcessTrainNode['unitType']);
                e.target.value = '';
              }
            }}
            className="bg-slate-950 border border-slate-700 text-cyan-300 rounded px-2.5 py-1.5 font-bold"
          >
            <option value="">+ Add Process Unit...</option>
            <option value="intake">Intake Works</option>
            <option value="screening">Screening Channel</option>
            <option value="aeration">Aeration Basin</option>
            <option value="coagulation">Rapid Mix Unit</option>
            <option value="flocculation">Flocculator</option>
            <option value="sedimentation">Clarifier / Settler</option>
            <option value="filtration">Filter Bed</option>
            <option value="disinfection">Disinfection Tank</option>
            <option value="cwr">Clear Water Reservoir</option>
          </select>
        </div>
      </div>

      {/* Visual Process Train Flow */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 overflow-x-auto">
        <h3 className="text-2xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Interactive Process Sequence Flow Diagram</span>
        </h3>

        <div className="flex items-center gap-3 min-w-max py-2">
          {nodes.map((node, index) => {
            const stream = streams.find(s => s.fromUnitId === node.id);
            const isSelected = node.id === selectedNodeId;

            return (
              <React.Fragment key={node.id}>
                <div
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer w-52 space-y-2 ${
                    !node.enabled
                      ? 'bg-slate-950/40 border-slate-800 opacity-50'
                      : isSelected
                      ? 'bg-slate-950 border-cyan-500 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                    <span className="text-3xs text-slate-500 font-bold">#0{node.sequence} {node.unitType.toUpperCase()}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleEnable(node.id); }}
                      className={`text-3xs px-1.5 py-0.5 rounded font-bold ${node.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'}`}
                    >
                      {node.enabled ? 'ACTIVE' : 'BYPASS'}
                    </button>
                  </div>

                  <div className="font-bold text-slate-100 text-2xs truncate">{node.name}</div>
                  <div className="text-3xs text-cyan-300">{node.subType}</div>

                  {stream && (
                    <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-3xs">
                      <div>
                        <span className="text-slate-500">Flow:</span>
                        <div className="text-slate-200 font-bold">{stream.flowM3hr} m³/h</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Turbidity:</span>
                        <div className="text-emerald-400 font-bold">{stream.turbidityNTU} NTU</div>
                      </div>
                      <div>
                        <span className="text-slate-500">HGL:</span>
                        <div className="text-amber-400 font-bold">{stream.hydraulicLevelM} m</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Head Loss:</span>
                        <div className="text-rose-400 font-bold">{stream.headLossM} m</div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectUnitToDesign?.(node.unitType); }}
                      className="text-3xs text-cyan-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <span>Design</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {index < nodes.length - 1 && (
                  <div className="flex flex-col items-center justify-center text-slate-600 px-1">
                    <ArrowRight className="w-5 h-5 text-cyan-500" />
                    <span className="text-3xs font-mono text-slate-500">STRM-{index + 1}</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Configuration & Upstream/Downstream Inspector */}
      {selectedNode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Unit Configuration: {selectedNode.name}</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDuplicate(selectedNode.id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-3xs font-bold flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={() => handleDelete(selectedNode.id)}
                  className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded text-3xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Process Unit Title</label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, name: val } : n));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Sub-Type / Technology</label>
                  <input
                    type="text"
                    value={selectedNode.subType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, subType: val } : n));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Head Loss Allowance (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedNode.headLossM}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, headLossM: val } : n));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="text-slate-400 block mb-1">Target Removal Efficiencies (%)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded">
                    <span className="text-3xs text-slate-500 block">Turbidity %</span>
                    <input
                      type="number"
                      value={selectedNode.removalEfficiencies.turbidityPct}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNodes(nodes.map(n => n.id === selectedNode.id ? {
                          ...n,
                          removalEfficiencies: { ...n.removalEfficiencies, turbidityPct: val }
                        } : n));
                      }}
                      className="w-full bg-transparent text-emerald-400 font-bold focus:outline-none"
                    />
                  </div>

                  <div className="p-2 bg-slate-950 border border-slate-800 rounded">
                    <span className="text-3xs text-slate-500 block">TSS %</span>
                    <input
                      type="number"
                      value={selectedNode.removalEfficiencies.tssPct}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNodes(nodes.map(n => n.id === selectedNode.id ? {
                          ...n,
                          removalEfficiencies: { ...n.removalEfficiencies, tssPct: val }
                        } : n));
                      }}
                      className="w-full bg-transparent text-emerald-400 font-bold focus:outline-none"
                    />
                  </div>

                  <div className="p-2 bg-slate-950 border border-slate-800 rounded">
                    <span className="text-3xs text-slate-500 block">Iron (Fe) %</span>
                    <input
                      type="number"
                      value={selectedNode.removalEfficiencies.ironPct}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNodes(nodes.map(n => n.id === selectedNode.id ? {
                          ...n,
                          removalEfficiencies: { ...n.removalEfficiencies, ironPct: val }
                        } : n));
                      }}
                      className="w-full bg-transparent text-emerald-400 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stream Tracker Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-amber-400" />
              <span>Upstream & Downstream Stream Propagation</span>
            </h3>

            <div className="space-y-3">
              {streams.filter(s => s.fromUnitId === selectedNode.id).map(stream => (
                <div key={stream.streamId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-cyan-400 text-xs">{stream.streamId} - {stream.name}</span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-3xs font-bold">
                      {stream.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs">
                    <div className="p-2 bg-slate-900 rounded">
                      <span className="text-slate-500 block text-3xs">Volumetric Flow</span>
                      <span className="text-slate-100 font-bold">{stream.flowM3hr} m³/h</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded">
                      <span className="text-slate-500 block text-3xs">Turbidity</span>
                      <span className="text-emerald-400 font-bold">{stream.turbidityNTU} NTU</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded">
                      <span className="text-slate-500 block text-3xs">TSS Solids</span>
                      <span className="text-emerald-400 font-bold">{stream.tssMgL} mg/L</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded">
                      <span className="text-slate-500 block text-3xs">Hydraulic Level</span>
                      <span className="text-amber-400 font-bold">{stream.hydraulicLevelM} m</span>
                    </div>
                  </div>

                  <div className="text-3xs text-slate-400 flex justify-between border-t border-slate-800/80 pt-2">
                    <span>Daily Sludge Generated: <strong className="text-slate-200">{stream.solidsGeneratedKgDay} kg/day</strong></span>
                    <span>Chemical Dose: <strong className="text-cyan-300">{stream.chemicalDoseMgL} mg/L {stream.chemicalType}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
