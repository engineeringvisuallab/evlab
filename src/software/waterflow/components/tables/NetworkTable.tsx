/**
 * EVLab WaterFlow - Tabular Network Model Editor
 * Full spreadsheet-like table editor for Junctions, Pipes, Reservoirs, Tanks, Pumps, Valves.
 */

import React, { useState, useMemo } from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { Junction, Pipe, Reservoir, Tank, Pump, Valve } from '../../types/waterflow';
import { X, Search, Download, Filter, Save, Plus } from 'lucide-react';

export const NetworkTable: React.FC = () => {
  const { model, updateElement, setActiveDialog, selectElement } = useWaterFlow();
  const [activeTab, setActiveTab] = useState<'junctions' | 'pipes' | 'reservoirs' | 'tanks' | 'pumps' | 'valves'>('junctions');
  const [searchTerm, setSearchTerm] = useState('');

  const nodes = useMemo(() => {
    return model.nodes instanceof Map ? Array.from(model.nodes.values()) : Object.values(model.nodes);
  }, [model.nodes]);

  const links = useMemo(() => {
    return model.links instanceof Map ? Array.from(model.links.values()) : Object.values(model.links);
  }, [model.links]);

  const junctions = useMemo(() => nodes.filter(n => n.type === 'junction') as Junction[], [nodes]);
  const reservoirs = useMemo(() => nodes.filter(n => n.type === 'reservoir') as Reservoir[], [nodes]);
  const tanks = useMemo(() => nodes.filter(n => n.type === 'tank') as Tank[], [nodes]);

  const pipes = useMemo(() => links.filter(l => l.type === 'pipe') as Pipe[], [links]);
  const pumps = useMemo(() => links.filter(l => l.type === 'pump') as Pump[], [links]);
  const valves = useMemo(() => links.filter(l => l.type === 'valve') as Valve[], [links]);

  const exportCSV = () => {
    let rows: string[][] = [];
    let filename = `waterflow_${activeTab}.csv`;

    if (activeTab === 'junctions') {
      rows = [['ID', 'Label', 'Elevation (m)', 'Base Demand (L/s)', 'Pressure (kPa)', 'HGL (m)', 'Zone']];
      junctions.forEach(j => {
        rows.push([j.id, j.label, j.elevation.toString(), j.baseDemand.toString(), (j.pressure || 0).toFixed(1), (j.hydraulicGrade || 0).toFixed(2), j.zone || '']);
      });
    } else if (activeTab === 'pipes') {
      rows = [['ID', 'Label', 'Start Node', 'End Node', 'Length (m)', 'Diameter (mm)', 'Material', 'Roughness', 'Flow (L/s)', 'Velocity (m/s)', 'Headloss (m)']];
      pipes.forEach(p => {
        rows.push([p.id, p.label, p.startNodeId, p.endNodeId, p.length.toString(), p.diameter.toString(), p.material, p.roughness.toString(), (p.flow || 0).toFixed(2), (p.velocity || 0).toFixed(2), (p.headloss || 0).toFixed(2)]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-sm text-cyan-400 tracking-wider uppercase">Network Data Table Editor</h2>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
              <input
                type="text"
                placeholder="Search element ID or zone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent text-white focus:outline-none text-xs w-48"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded text-xs font-semibold border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV
            </button>
            <button
              onClick={() => setActiveDialog(null)}
              className="text-slate-400 hover:text-white p-1 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-900 border-b border-slate-800 flex items-center px-3 text-xs font-semibold text-slate-400">
          {(['junctions', 'pipes', 'reservoirs', 'tanks', 'pumps', 'valves'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 border-b-2 capitalize transition ${
                activeTab === tab ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-800/40' : 'border-transparent hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-auto p-3 font-mono text-xs">
          {activeTab === 'junctions' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                  <th className="p-2">ID</th>
                  <th className="p-2">Label</th>
                  <th className="p-2">Elevation (m)</th>
                  <th className="p-2">Base Demand (L/s)</th>
                  <th className="p-2">Pressure (kPa)</th>
                  <th className="p-2">HGL (m)</th>
                  <th className="p-2">Zone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {junctions
                  .filter(j => j.id.toLowerCase().includes(searchTerm.toLowerCase()) || j.label?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(j => (
                    <tr
                      key={j.id}
                      onClick={() => selectElement(j.id)}
                      className="hover:bg-slate-800/60 cursor-pointer transition"
                    >
                      <td className="p-2 text-cyan-300 font-bold">{j.id}</td>
                      <td className="p-2 text-slate-200">{j.label}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={j.elevation}
                          onChange={e => updateElement(j.id, { elevation: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-950 text-white px-1.5 py-0.5 rounded border border-slate-800 w-20"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={j.baseDemand}
                          onChange={e => updateElement(j.id, { baseDemand: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-950 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-slate-800 w-24"
                        />
                      </td>
                      <td className="p-2 text-emerald-400 font-bold">{j.pressure?.toFixed(1) ?? 'N/A'}</td>
                      <td className="p-2 text-slate-300">{j.hydraulicGrade?.toFixed(2) ?? 'N/A'}</td>
                      <td className="p-2 text-slate-400">{j.zone || 'Default'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeTab === 'pipes' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                  <th className="p-2">ID</th>
                  <th className="p-2">Start Node</th>
                  <th className="p-2">End Node</th>
                  <th className="p-2">Length (m)</th>
                  <th className="p-2">Diameter (mm)</th>
                  <th className="p-2">Material</th>
                  <th className="p-2">Roughness</th>
                  <th className="p-2">Flow (L/s)</th>
                  <th className="p-2">Velocity (m/s)</th>
                  <th className="p-2">Headloss (m)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pipes
                  .filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase()) || p.label?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(p => (
                    <tr
                      key={p.id}
                      onClick={() => selectElement(p.id)}
                      className="hover:bg-slate-800/60 cursor-pointer transition"
                    >
                      <td className="p-2 text-blue-400 font-bold">{p.id}</td>
                      <td className="p-2 text-slate-300">{p.startNodeId}</td>
                      <td className="p-2 text-slate-300">{p.endNodeId}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={p.length}
                          onChange={e => updateElement(p.id, { length: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-950 text-white px-1.5 py-0.5 rounded border border-slate-800 w-20"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={p.diameter}
                          onChange={e => updateElement(p.id, { diameter: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-950 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-slate-800 w-20"
                        />
                      </td>
                      <td className="p-2 text-slate-300">{p.material}</td>
                      <td className="p-2 text-slate-300">{p.roughness}</td>
                      <td className="p-2 text-cyan-300 font-bold">{p.flow?.toFixed(2) ?? 'N/A'}</td>
                      <td className="p-2 text-emerald-400 font-bold">{p.velocity?.toFixed(2) ?? 'N/A'}</td>
                      <td className="p-2 text-slate-300">{p.headloss?.toFixed(2) ?? 'N/A'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
