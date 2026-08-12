/**
 * EVLab BOQ - Running Bill (RA Bill) Module
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../core/currency';
import { FileText, CheckCircle, Clock } from 'lucide-react';

export const BillingPage: React.FC = () => {
  const { activeProject, runningBills } = useAppStore();

  if (!activeProject) {
    return <div className="p-8 text-slate-400 font-mono">No active project loaded.</div>;
  }

  const currency = activeProject.currency;

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <span>Contractor Running Account Bills (RA Bills)</span>
        </h1>
        <p className="text-xs text-slate-400">
          Interim payment certificates with retention, advance recovery, and tax deductions
        </p>
      </div>

      <div className="space-y-4">
        {runningBills.map((bill) => (
          <div key={bill.id} className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="font-bold text-cyan-400 text-sm">{bill.billNo}</span>
                <span className="text-slate-400 ml-2 font-sans">({bill.periodFrom} to {bill.periodTo})</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                bill.status === 'Certified' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                STATUS: {bill.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Gross Work Amount</span>
                <p className="font-bold text-slate-100">{formatCurrency(bill.grossTotal, currency)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Retention ({bill.retentionPct}%)</span>
                <p className="font-bold text-amber-400">-{formatCurrency(bill.retentionAmount, currency)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Tax Deducted</span>
                <p className="font-bold text-slate-400">-{formatCurrency(bill.taxDeductionAmount, currency)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Net Payable</span>
                <p className="font-extrabold text-cyan-300 text-sm">{formatCurrency(bill.netPayable, currency)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
