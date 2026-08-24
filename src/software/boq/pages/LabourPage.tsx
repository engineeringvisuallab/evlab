/**
 * EVLab BOQ - Labour Rates & Skill Schedule Page
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../core/currency';
import { Users, Plus } from 'lucide-react';

export const LabourPage: React.FC = () => {
  const { labour, addLabour, activeProject } = useAppStore();
  const [code, setCode] = useState('L-105');
  const [desc, setDesc] = useState('Pipe Fitter / Plumber Specialist');
  const [skill, setSkill] = useState<'Skilled' | 'Unskilled' | 'Semiskilled' | 'Highly Skilled' | 'Specialist'>('Skilled');
  const [rate, setRate] = useState(1200);

  const currency = activeProject?.currency;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addLabour({ code, description: desc, skill, rate, unit: 'Day' });
    alert('Labour role added to schedule!');
  };

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <span>Labour Wage Schedule & Skill Matrix</span>
        </h1>
        <p className="text-xs text-slate-400">
          Standard wage rates for unskilled, semiskilled, skilled, and specialist construction workforce
        </p>
      </div>

      <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
        <h3 className="font-bold text-cyan-300 uppercase">Add Labour Trade / Role</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Code (e.g. L-101)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100"
          />
          <input
            type="text"
            placeholder="Trade Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 font-sans"
          />
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-cyan-300"
          >
            <option value="Unskilled">Unskilled</option>
            <option value="Semiskilled">Semiskilled</option>
            <option value="Skilled">Skilled</option>
            <option value="Highly Skilled">Highly Skilled</option>
            <option value="Specialist">Specialist</option>
          </select>
          <input
            type="number"
            placeholder="Daily Wage Rate"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-emerald-300 font-bold"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold flex items-center space-x-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Labour Trade</span>
          </button>
        </div>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-3 w-24">Code</th>
              <th className="p-3 min-w-[200px]">Trade / Designation</th>
              <th className="p-3 w-32">Skill Level</th>
              <th className="p-3 w-20 text-center">Unit</th>
              <th className="p-3 w-36 text-right">Daily Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {labour.map((l) => (
              <tr key={l.id} className="hover:bg-slate-950/60">
                <td className="p-3 font-bold text-cyan-400">{l.code}</td>
                <td className="p-3 font-sans font-medium text-slate-100">{l.description}</td>
                <td className="p-3 text-slate-300 font-bold">{l.skill}</td>
                <td className="p-3 text-center text-amber-300 font-bold">{l.unit}</td>
                <td className="p-3 text-right font-bold text-emerald-300">{formatCurrency(l.rate, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
