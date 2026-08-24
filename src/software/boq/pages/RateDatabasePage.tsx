/**
 * EVLab BOQ - Standard Schedule of Rates (PWD / LGED / DPHE / Standard Rate DB)
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../core/currency';
import { Database, Search } from 'lucide-react';

export const RateDatabasePage: React.FC = () => {
  const { activeProject } = useAppStore();
  const [selectedSchedule, setSelectedSchedule] = useState('PWD Schedule of Rates 2024');
  const [search, setSearch] = useState('');

  const currency = activeProject?.currency;

  const standardDatabase = [
    { code: 'PWD-01.01', desc: 'Earth excavation in foundation trenches in hard soil up to 1.5m depth', unit: 'm³', rate: 245 },
    { code: 'PWD-01.05', desc: 'Filling in foundation and plinth with sand having FM not less than 1.2', unit: 'm³', rate: 1450 },
    { code: 'PWD-03.02', desc: 'Plain Cement Concrete (PCC) 1:3:6 with 25mm down aggregate', unit: 'm³', rate: 8900 },
    { code: 'PWD-05.01', desc: 'Reinforced Cement Concrete (RCC) C25 Grade in beams and columns', unit: 'm³', rate: 16500 },
    { code: 'PWD-06.12', desc: 'First class brickwork in 1:4 cement mortar in superstructure', unit: 'm³', rate: 11200 },
    { code: 'LGED-RD-04', desc: 'Sub-base course with well-graded brick aggregate and sand mixture', unit: 'm³', rate: 4200 },
    { code: 'DPHE-W-12', desc: 'Laying HDPE Pipe 200mm OD PN10 including trenching and jointing', unit: 'm', rate: 3100 },
  ];

  const filtered = standardDatabase.filter(
    (i) =>
      i.desc.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Standard Schedule of Rates (SOR Database)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Government & Institutional Schedule of Rates (PWD, LGED, DPHE, RHD, CPWD)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedSchedule}
            onChange={(e) => setSelectedSchedule(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-mono rounded px-3 py-1.5 focus:outline-none"
          >
            <option value="PWD Schedule of Rates 2024">PWD Schedule of Rates 2024</option>
            <option value="LGED Road & Bridge SOR 2024">LGED Road & Bridge SOR 2024</option>
            <option value="DPHE Water Supply SOR 2024">DPHE Water Supply SOR 2024</option>
            <option value="CPWD Master SOR 2023">CPWD Master SOR 2023</option>
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SOR database..."
            className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 font-mono w-60 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-3 w-28">SOR Code</th>
              <th className="p-3 min-w-[300px]">Item Description & Specification</th>
              <th className="p-3 w-20 text-center">Unit</th>
              <th className="p-3 w-36 text-right">Standard Rate</th>
              <th className="p-3 w-28 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((item) => (
              <tr key={item.code} className="hover:bg-slate-950/60">
                <td className="p-3 font-bold text-cyan-400">{item.code}</td>
                <td className="p-3 font-sans font-medium text-slate-100">{item.desc}</td>
                <td className="p-3 text-center text-amber-300 font-bold">{item.unit}</td>
                <td className="p-3 text-right font-bold text-emerald-300">{formatCurrency(item.rate, currency)}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => alert(`Copied rate analysis for ${item.code} to active BOQ!`)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-[11px]"
                  >
                    + Import
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
