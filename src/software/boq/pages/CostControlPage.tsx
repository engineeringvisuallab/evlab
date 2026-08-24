/**
 * EVLab BOQ - Cost Control & Earned Value Management
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../core/currency';
import { TrendingUp, DollarSign, AlertTriangle, ShieldCheck } from 'lucide-react';

export const CostControlPage: React.FC = () => {
  const { activeProject, boqItems, runningBills, measurements } = useAppStore();

  if (!activeProject) {
    return <div className="p-8 text-slate-400 font-mono">No active project loaded.</div>;
  }

  const currency = activeProject.currency;

  const totalContractVal = boqItems.filter((i) => !i.isHeader).reduce((acc, i) => acc + i.amount, 0);
  const totalBilledVal = runningBills.reduce((acc, b) => acc + b.grossTotal, 0);
  const costVariance = totalBilledVal - totalContractVal * 0.4; // hypothetical EV benchmark

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <span>Project Cost Control & Earned Value (EVM)</span>
        </h1>
        <p className="text-xs text-slate-400">
          Budget tracking, cost variance analysis, financial progress, and committed cost tracking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase">Original Budget (BAC)</span>
          <p className="text-xl font-bold text-cyan-400 mt-1">{formatCurrency(totalContractVal, currency)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase">Gross Certified Work</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(totalBilledVal, currency)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase">Financial Completion</span>
          <p className="text-xl font-bold text-amber-300 mt-1">
            {totalContractVal > 0 ? ((totalBilledVal / totalContractVal) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase">Remaining Contract Value</span>
          <p className="text-xl font-bold text-slate-200 mt-1">{formatCurrency(Math.max(0, totalContractVal - totalBilledVal), currency)}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 font-mono text-xs space-y-4">
        <h3 className="font-bold text-slate-300 uppercase">Category Cost Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-2">Item Category</th>
                <th className="p-2 text-right">Items</th>
                <th className="p-2 text-right">Budget Amount</th>
                <th className="p-2 text-right">Certified Amount</th>
                <th className="p-2 text-right">Progress %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {['Civil Works', 'Pipeline Works', 'Electrical & Mechanical', 'General'].map((cat) => {
                const items = boqItems.filter((i) => !i.isHeader && (i.category === cat || cat === 'General'));
                const budget = items.reduce((a, b) => a + b.amount, 0);
                const billed = budget * 0.35; // mock execution ratio
                return (
                  <tr key={cat}>
                    <td className="p-2 font-bold text-slate-200">{cat}</td>
                    <td className="p-2 text-right text-slate-400">{items.length}</td>
                    <td className="p-2 text-right text-cyan-300 font-bold">{formatCurrency(budget, currency)}</td>
                    <td className="p-2 text-right text-emerald-300">{formatCurrency(billed, currency)}</td>
                    <td className="p-2 text-right text-amber-300 font-bold">
                      {budget > 0 ? ((billed / budget) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
