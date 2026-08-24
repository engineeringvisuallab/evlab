import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { ValidationResult } from '../types/wtp';

interface ValidationMatrixProps {
  validations: ValidationResult[];
}

export const ValidationMatrixView: React.FC<ValidationMatrixProps> = ({ validations }) => {
  const [filter, setFilter] = useState<'ALL' | 'PASS' | 'WARNING' | 'FAIL'>('ALL');

  const filtered = validations.filter(v => filter === 'ALL' || v.status === filter);

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Engineering Design Validation Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time compliance checks against CPHEEO, AWWA, WHO, and Ten States Standards limits.
          </p>
        </div>

        <div className="flex gap-2">
          {(['ALL', 'PASS', 'WARNING', 'FAIL'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded text-2xs font-bold border transition ${
                filter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {st} ({st === 'ALL' ? validations.length : validations.filter(v => v.status === st).length})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <th className="p-3">Category</th>
              <th className="p-3">Parameter</th>
              <th className="p-3">Design Value</th>
              <th className="p-3">Standard Limit</th>
              <th className="p-3">Reference Standard</th>
              <th className="p-3">Status</th>
              <th className="p-3">Compliance Guidance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-300">{v.category}</td>
                <td className="p-3 text-cyan-300">{v.parameterName}</td>
                <td className="p-3 text-slate-100 font-bold">{v.designValue} {v.unit}</td>
                <td className="p-3 text-slate-400">{v.criteriaRange}</td>
                <td className="p-3 text-slate-500">{v.standardRef}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-3xs font-bold border inline-flex items-center gap-1 ${
                    v.status === 'PASS'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                      : v.status === 'WARNING'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                      : 'bg-rose-950/80 text-rose-300 border-rose-700'
                  }`}>
                    {v.status === 'PASS' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {v.status === 'WARNING' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                    {v.status === 'FAIL' && <XCircle className="w-3 h-3 text-rose-400" />}
                    {v.status}
                  </span>
                </td>
                <td className="p-3 text-slate-300 text-2xs">{v.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
