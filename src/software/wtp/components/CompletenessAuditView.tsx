import React from 'react';
import { ClipboardCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { WTP_COMPLETENESS_AUDIT_LIST } from '../core/completenessAudit';

export const CompletenessAuditView: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <ClipboardCheck className="w-6 h-6 text-cyan-400" />
          <span>WTP Completeness & Deliverables Audit Checklist</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Verification matrix confirming mandatory process engineering items, structural loads, electrical single line diagrams, and SCADA I/O point lists.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <th className="p-3">Category</th>
              <th className="p-3">Audit Item</th>
              <th className="p-3">Importance</th>
              <th className="p-3">Engineering Justification</th>
              <th className="p-3">Calculated Parameter & Governing Equation</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {WTP_COMPLETENESS_AUDIT_LIST.map(item => (
              <tr key={item.id} className="hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-300">{item.category}</td>
                <td className="p-3 text-cyan-300 font-bold">{item.item}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-3xs font-bold ${
                    item.importance === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}>
                    {item.importance}
                  </span>
                </td>
                <td className="p-3 text-slate-400 text-2xs">{item.whyRequired}</td>
                <td className="p-3 text-slate-200 font-mono text-3xs">
                  <div className="font-bold text-slate-300">{item.proposedParameter}</div>
                  <div className="text-cyan-400">{item.proposedCalculation}</div>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-3xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    COMPLETE
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
