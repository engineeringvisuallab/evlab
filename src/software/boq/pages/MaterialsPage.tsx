/**
 * EVLab BOQ - Master Materials Database Page
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../core/currency';
import { Boxes, Plus, Search, Trash2 } from 'lucide-react';

export const MaterialsPage: React.FC = () => {
  const { materials, addMaterial, activeProject } = useAppStore();
  const [search, setSearch] = useState('');
  const [code, setCode] = useState('M-501');
  const [name, setName] = useState('Deformed Steel Bar 500W');
  const [cat, setCat] = useState('Steel');
  const [unit, setUnit] = useState('Ton');
  const [rate, setRate] = useState(98000);

  const filtered = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  const currency = activeProject?.currency;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addMaterial({ code, name, category: cat, unit, defaultRate: rate });
    alert('Material added to master schedule!');
  };

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-cyan-400" />
            <span>Master Materials Database</span>
          </h1>
          <p className="text-xs text-slate-400">
            Standard construction materials library with unit market rates and technical specifications
          </p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter materials..."
          className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 font-mono w-60 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Add New Material Form */}
      <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
        <h3 className="font-bold text-cyan-300 uppercase">Add Material to Library</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Code (e.g. M-101)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100"
          />
          <input
            type="text"
            placeholder="Material Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 sm:col-span-2 font-sans"
          />
          <input
            type="text"
            placeholder="Unit (m³, Ton, bag)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-amber-300"
          />
          <input
            type="number"
            placeholder="Rate"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-emerald-300 font-bold"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold flex items-center space-x-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Material</span>
          </button>
        </div>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-3 w-24">Code</th>
              <th className="p-3 min-w-[200px]">Material Name</th>
              <th className="p-3 w-32">Category</th>
              <th className="p-3 w-20 text-center">Unit</th>
              <th className="p-3 w-36 text-right">Default Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-slate-950/60">
                <td className="p-3 font-bold text-cyan-400">{m.code}</td>
                <td className="p-3 font-sans font-medium text-slate-100">{m.name}</td>
                <td className="p-3 text-slate-400">{m.category}</td>
                <td className="p-3 text-center text-amber-300 font-bold">{m.unit}</td>
                <td className="p-3 text-right font-bold text-emerald-300">{formatCurrency(m.defaultRate, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
