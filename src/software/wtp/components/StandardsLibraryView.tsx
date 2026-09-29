import React, { useState } from 'react';
import { BookOpen, Search, ShieldCheck } from 'lucide-react';
import { STANDARDS_REGISTRY } from '../core/standardsRegistry';

export const StandardsLibraryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('ALL');

  const filtered = STANDARDS_REGISTRY.filter(st => {
    const matchOrg = selectedOrg === 'ALL' || st.organization === selectedOrg;
    const matchSearch = st.parameter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        st.standardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        st.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchOrg && matchSearch;
  });

  const orgs = ['ALL', 'CPHEEO', 'WHO', 'US EPA', 'EU Directive', 'Bangladesh DoE'];

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <span>International Water Standards Library</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global regulatory database indexing CPHEEO 2021, WHO 2022, US EPA SWTR, EU 2020/2184, and Bangladesh ECR 2023 guidelines.
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search parameter, standard, or clause..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-1.5">
          {orgs.map(org => (
            <button
              key={org}
              onClick={() => setSelectedOrg(org)}
              className={`px-3 py-2 rounded-lg text-2xs font-bold border transition ${
                selectedOrg === org
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              {org}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <th className="p-3">Organization</th>
              <th className="p-3">Standard Reference</th>
              <th className="p-3">Category</th>
              <th className="p-3">Parameter / Criteria</th>
              <th className="p-3">Limit Value</th>
              <th className="p-3">Standard Clause</th>
              <th className="p-3">Engineering Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filtered.map(st => (
              <tr key={st.id} className="hover:bg-slate-800/30">
                <td className="p-3 font-bold text-cyan-400">{st.organization}</td>
                <td className="p-3 text-slate-200 font-semibold">{st.standardName} ({st.year})</td>
                <td className="p-3 text-slate-400">{st.category}</td>
                <td className="p-3 text-slate-100 font-bold">{st.parameter}</td>
                <td className="p-3 text-emerald-400 font-bold">{st.limitValue} {st.unit}</td>
                <td className="p-3 text-slate-500">{st.clause}</td>
                <td className="p-3 text-slate-400 text-2xs">{st.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
