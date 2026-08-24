/**
 * EVLab BOQ - Cost Estimate Summary Module
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { calculateProjectCostTotals } from '../core/calculation';
import { formatCurrency } from '../core/currency';
import { Receipt, DollarSign, Percent, ShieldCheck } from 'lucide-react';

export const EstimatePage: React.FC = () => {
  const { activeProject, boqItems } = useAppStore();

  if (!activeProject) {
    return <div className="p-8 text-slate-400 font-mono">No active project loaded.</div>;
  }

  const currency = activeProject.currency;
  const totals = calculateProjectCostTotals(boqItems, activeProject.settings);

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1400px] mx-auto">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-cyan-400" />
          <span>Detailed Project Cost Estimate</span>
        </h1>
        <p className="text-xs text-slate-400">
          Complete engineering cost rollup including direct bill, overhead, contractor profit, contingency, and taxes
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 font-mono text-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-100">{activeProject.name}</h2>
            <p className="text-slate-400">{activeProject.code} | Client: {activeProject.client}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase">Total Estimate</span>
            <p className="text-xl font-bold text-cyan-400">{formatCurrency(totals.grandEstimatedCost, currency)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-slate-800/80 text-slate-200">
            <span>Direct BOQ Items Amount</span>
            <span className="font-bold text-emerald-400">{formatCurrency(totals.baseBoqTotal, currency)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800/80 text-slate-300">
            <span>Overhead ({activeProject.settings.overheadPercentage}%)</span>
            <span>+{formatCurrency(totals.overheadTotal, currency)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800/80 text-slate-300">
            <span>Contractor Profit ({activeProject.settings.contractorProfitPercentage}%)</span>
            <span>+{formatCurrency(totals.profitTotal, currency)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800/80 text-slate-300">
            <span>Contingency ({activeProject.settings.contingencyPercentage}%)</span>
            <span>+{formatCurrency(totals.contingencyTotal, currency)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800/80 text-slate-300">
            <span>VAT / Tax ({activeProject.settings.vatTaxPercentage}%)</span>
            <span>+{formatCurrency(totals.vatTaxTotal, currency)}</span>
          </div>

          <div className="flex justify-between py-3 bg-slate-950 p-4 rounded border border-slate-800 text-sm font-bold">
            <span className="text-cyan-300 uppercase">Grand Total Estimated Cost</span>
            <span className="text-cyan-300 font-extrabold">{formatCurrency(totals.grandEstimatedCost, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
