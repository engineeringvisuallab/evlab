/**
 * EVLab WaterFlow - Left Dockable Model Explorer
 * Hierarchical tree view of network nodes, links, scenarios, zones, and background layers.
 */

import React, { useState } from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { getNodesList, getLinksList } from '../../types/waterflow';
import {
  ChevronRight,
  ChevronDown,
  Circle,
  Diamond,
  Square,
  Minus,
  Activity,
  GitCommit,
  Layers,
  Map,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

export const ModelExplorer: React.FC = () => {
  const {
    model,
    selectedIds,
    selectElement,
    deleteElement,
    setActiveDialog
  } = useWaterFlow();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    nodes: true,
    junctions: true,
    reservoirs: true,
    tanks: true,
    links: true,
    pipes: true,
    pumps: true,
    valves: true,
    scenarios: true,
    layers: true
  });

  const toggleExpand = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const nodes = getNodesList(model.nodes);
  const links = getLinksList(model.links);

  const junctions = nodes.filter(n => n.type === 'junction');
  const reservoirs = nodes.filter(n => n.type === 'reservoir');
  const tanks = nodes.filter(n => n.type === 'tank');

  const pipes = links.filter(l => l.type === 'pipe');
  const pumps = links.filter(l => l.type === 'pump');
  const valves = links.filter(l => l.type === 'valve');

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300 text-xs select-none z-20">
      {/* Header */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-950 font-bold text-slate-200 tracking-wider text-[11px] flex items-center justify-between">
        <span className="flex items-center gap-1.5 uppercase text-cyan-400">
          <Layers className="w-3.5 h-3.5" />
          Model Explorer
        </span>
        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
          {nodes.length + links.length} Elements
        </span>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 font-sans">
        {/* MODEL ROOT */}
        <div>
          <div className="font-semibold text-slate-100 py-1 px-1 flex items-center gap-1">
            <span className="text-cyan-400">■</span> {model.title}
          </div>

          <div className="pl-3 space-y-0.5">
            {/* NODES BRANCH */}
            <div>
              <button
                onClick={() => toggleExpand('nodes')}
                className="w-full text-left py-1 px-1 rounded hover:bg-slate-800/80 flex items-center justify-between font-semibold text-slate-300"
              >
                <span className="flex items-center gap-1">
                  {expanded.nodes ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                  Nodes ({nodes.length})
                </span>
              </button>

              {expanded.nodes && (
                <div className="pl-4 space-y-0.5 text-[11px]">
                  {/* Junctions */}
                  <div>
                    <button
                      onClick={() => toggleExpand('junctions')}
                      className="w-full text-left py-0.5 px-1 hover:bg-slate-800/60 rounded flex items-center justify-between text-slate-400 font-medium"
                    >
                      <span className="flex items-center gap-1">
                        <Circle className="w-3 h-3 text-sky-400" />
                        Junctions ({junctions.length})
                      </span>
                    </button>
                    {expanded.junctions && (
                      <div className="pl-4 space-y-0.5">
                        {junctions.map(j => (
                          <div
                            key={j.id}
                            onClick={() => selectElement(j.id)}
                            className={`py-0.5 px-1.5 rounded cursor-pointer flex items-center justify-between group ${
                              selectedIds.includes(j.id) ? 'bg-cyan-900/60 text-cyan-200 font-semibold border-l-2 border-cyan-400' : 'hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{j.label || j.id}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteElement(j.id); }}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reservoirs */}
                  <div>
                    <button
                      onClick={() => toggleExpand('reservoirs')}
                      className="w-full text-left py-0.5 px-1 hover:bg-slate-800/60 rounded flex items-center justify-between text-slate-400 font-medium"
                    >
                      <span className="flex items-center gap-1">
                        <Diamond className="w-3 h-3 text-cyan-300" />
                        Reservoirs ({reservoirs.length})
                      </span>
                    </button>
                    {expanded.reservoirs && (
                      <div className="pl-4 space-y-0.5">
                        {reservoirs.map(r => (
                          <div
                            key={r.id}
                            onClick={() => selectElement(r.id)}
                            className={`py-0.5 px-1.5 rounded cursor-pointer flex items-center justify-between group ${
                              selectedIds.includes(r.id) ? 'bg-cyan-900/60 text-cyan-200 font-semibold border-l-2 border-cyan-400' : 'hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{r.label || r.id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tanks */}
                  <div>
                    <button
                      onClick={() => toggleExpand('tanks')}
                      className="w-full text-left py-0.5 px-1 hover:bg-slate-800/60 rounded flex items-center justify-between text-slate-400 font-medium"
                    >
                      <span className="flex items-center gap-1">
                        <Square className="w-3 h-3 text-emerald-400" />
                        Tanks ({tanks.length})
                      </span>
                    </button>
                    {expanded.tanks && (
                      <div className="pl-4 space-y-0.5">
                        {tanks.map(t => (
                          <div
                            key={t.id}
                            onClick={() => selectElement(t.id)}
                            className={`py-0.5 px-1.5 rounded cursor-pointer flex items-center justify-between group ${
                              selectedIds.includes(t.id) ? 'bg-cyan-900/60 text-cyan-200 font-semibold border-l-2 border-cyan-400' : 'hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{t.label || t.id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* LINKS BRANCH */}
            <div>
              <button
                onClick={() => toggleExpand('links')}
                className="w-full text-left py-1 px-1 rounded hover:bg-slate-800/80 flex items-center justify-between font-semibold text-slate-300"
              >
                <span className="flex items-center gap-1">
                  {expanded.links ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                  Links ({links.length})
                </span>
              </button>

              {expanded.links && (
                <div className="pl-4 space-y-0.5 text-[11px]">
                  {/* Pipes */}
                  <div>
                    <button
                      onClick={() => toggleExpand('pipes')}
                      className="w-full text-left py-0.5 px-1 hover:bg-slate-800/60 rounded flex items-center justify-between text-slate-400 font-medium"
                    >
                      <span className="flex items-center gap-1">
                        <Minus className="w-3 h-3 text-blue-400" />
                        Pipes ({pipes.length})
                      </span>
                    </button>
                    {expanded.pipes && (
                      <div className="pl-4 space-y-0.5">
                        {pipes.map(p => (
                          <div
                            key={p.id}
                            onClick={() => selectElement(p.id)}
                            className={`py-0.5 px-1.5 rounded cursor-pointer flex items-center justify-between group ${
                              selectedIds.includes(p.id) ? 'bg-cyan-900/60 text-cyan-200 font-semibold border-l-2 border-cyan-400' : 'hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{p.label || p.id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pumps */}
                  <div>
                    <button
                      onClick={() => toggleExpand('pumps')}
                      className="w-full text-left py-0.5 px-1 hover:bg-slate-800/60 rounded flex items-center justify-between text-slate-400 font-medium"
                    >
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-amber-400" />
                        Pumps ({pumps.length})
                      </span>
                    </button>
                    {expanded.pumps && (
                      <div className="pl-4 space-y-0.5">
                        {pumps.map(p => (
                          <div
                            key={p.id}
                            onClick={() => selectElement(p.id)}
                            className={`py-0.5 px-1.5 rounded cursor-pointer flex items-center justify-between group ${
                              selectedIds.includes(p.id) ? 'bg-cyan-900/60 text-cyan-200 font-semibold border-l-2 border-cyan-400' : 'hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{p.label || p.id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Valves */}
                  <div>
                    <button
                      onClick={() => toggleExpand('valves')}
                      className="w-full text-left py-0.5 px-1 hover:bg-slate-800/60 rounded flex items-center justify-between text-slate-400 font-medium"
                    >
                      <span className="flex items-center gap-1">
                        <GitCommit className="w-3 h-3 text-purple-400" />
                        Valves ({valves.length})
                      </span>
                    </button>
                    {expanded.valves && (
                      <div className="pl-4 space-y-0.5">
                        {valves.map(v => (
                          <div
                            key={v.id}
                            onClick={() => selectElement(v.id)}
                            className={`py-0.5 px-1.5 rounded cursor-pointer flex items-center justify-between group ${
                              selectedIds.includes(v.id) ? 'bg-cyan-900/60 text-cyan-200 font-semibold border-l-2 border-cyan-400' : 'hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{v.label || v.id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SCENARIOS BRANCH */}
            <div>
              <button
                onClick={() => setActiveDialog('scenario')}
                className="w-full text-left py-1 px-1 rounded hover:bg-slate-800/80 flex items-center justify-between font-semibold text-slate-300"
              >
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Scenarios ({model.scenarios.length})
                </span>
                <Plus className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
