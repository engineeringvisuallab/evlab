/**
 * EVLab BOQ - Abstract Estimate Module
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../core/currency';
import { FileSpreadsheet } from 'lucide-react';

export const AbstractPage: React.FC = () => {
  const { activeProject, boqItems, wbsNodes } = useAppStore();

  if (!activeProject) {
    return <div className="p-8 text-slate-400 font-mono">No active project loaded.</div>;
  }

  const currency = activeProject.currency;
  const grandTotal = boqItems.filter((i) => !i.isHeader).reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1400px] mx-auto">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
          <span>Abstract Estimate (Grouped by WBS)</span>
        </h1>
        <p className="text-xs text-slate-400">
          Executive cost summary categorized by Work Breakdown Structure (WBS)
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-3 w-20">WBS Code</th>
              <th className="p-3 min-w-[240px]">Work Section Description</th>
              <th className="p-3 w-24 text-center">Items</th>
              <th className="p-3 w-40 text-right">Section Total ({currency.symbol.trim()})</th>
              <th className="p-3 w-28 text-right">% Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {wbsNodes.map((wbs) => {
              const sectionItems = boqItems.filter(
                (i) => !i.isHeader && (i.wbsCode === wbs.code || i.itemCode.startsWith(wbs.code))
              );
              const sectionTotal = sectionItems.reduce((acc, curr) => acc + curr.amount, 0);
              const pct = grandTotal > 0 ? (sectionTotal / grandTotal) * 100 : 0;

              return (
                <tr key={wbs.id} className="hover:bg-slate-950/60">
                  <td className="p-3 font-bold text-cyan-400">{wbs.code}</td>
                  <td className="p-3 font-sans font-medium text-slate-200">{wbs.title}</td>
                  <td className="p-3 text-center text-slate-400">{sectionItems.length}</td>
                  <td className="p-3 text-right font-bold text-emerald-300">
                    {formatCurrency(sectionTotal, currency)}
                  </td>
                  <td className="p-3 text-right font-bold text-cyan-300">{pct.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-950 border-t-2 border-slate-700 font-bold text-slate-100">
            <tr>
              <td colSpan={3} className="p-3 text-right font-mono uppercase">Total Direct Base BOQ:</td>
              <td className="p-3 text-right font-mono text-cyan-300 text-sm">
                {formatCurrency(grandTotal, currency)}
              </td>
              <td className="p-3 text-right font-mono text-cyan-300">100.0%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
