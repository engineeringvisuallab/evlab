/**
 * EVLab BOQ - Equipment & Plant Schedule Page
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../core/currency';
import { HardHat, Plus } from 'lucide-react';

export const EquipmentPage: React.FC = () => {
  const { equipment, addEquipment, activeProject } = useAppStore();
  const [code, setCode] = useState('EQ-305');
  const [name, setName] = useState('Hydraulic Excavator 0.9 m³');
  const [type, setType] = useState('Earthmoving');
  const [rate, setRate] = useState(3500);

  const currency = activeProject?.currency;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addEquipment({ code, name, type, unit: 'Hr', operatingRate: rate });
    alert('Equipment added to plant schedule!');
  };

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
          <HardHat className="w-5 h-5 text-cyan-400" />
          <span>Construction Equipment & Plant Schedule</span>
        </h1>
        <p className="text-xs text-slate-400">
          Heavy machinery, compaction equipment, batching plants, and power tools hourly hire/operating rates
        </p>
      </div>

      <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
        <h3 className="font-bold text-cyan-300 uppercase">Add Equipment to Schedule</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Code (e.g. EQ-101)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100"
          />
          <input
            type="text"
            placeholder="Equipment Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 font-sans"
          />
          <input
            type="text"
            placeholder="Category / Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-cyan-300"
          />
          <input
            type="number"
            placeholder="Hourly Rate"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-emerald-300 font-bold"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold flex items-center space-x-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Equipment</span>
          </button>
        </div>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-3 w-24">Code</th>
              <th className="p-3 min-w-[200px]">Plant / Equipment Name</th>
              <th className="p-3 w-32">Type</th>
              <th className="p-3 w-20 text-center">Unit</th>
              <th className="p-3 w-36 text-right">Operating Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {equipment.map((eq) => (
              <tr key={eq.id} className="hover:bg-slate-950/60">
                <td className="p-3 font-bold text-cyan-400">{eq.code}</td>
                <td className="p-3 font-sans font-medium text-slate-100">{eq.name}</td>
                <td className="p-3 text-slate-400">{eq.type}</td>
                <td className="p-3 text-center text-amber-300 font-bold">{eq.unit}</td>
                <td className="p-3 text-right font-bold text-emerald-300">{formatCurrency(eq.operatingRate, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
