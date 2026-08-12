/**
 * EVLab BOQ - Executive Print & Export Reports Module
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../core/currency';
import { Printer, Download, FileSpreadsheet, FileText } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { activeProject, boqItems, exportProjectJson } = useAppStore();

  if (!activeProject) {
    return <div className="p-8 text-slate-400 font-mono">No active project loaded.</div>;
  }

  const currency = activeProject.currency;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const str = exportProjectJson();
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.code}_full_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
            <Printer className="w-5 h-5 text-cyan-400" />
            <span>Executive Print & Official Reports</span>
          </h1>
          <p className="text-xs text-slate-400">
            Generate formal engineering BOQ printouts, tender documentation, and JSON backups
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium flex items-center space-x-1.5 shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official BOQ</span>
          </button>
        </div>
      </div>

      {/* Printable Cover / Document Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 font-mono text-xs space-y-6 shadow-xl print:bg-white print:text-black">
        <div className="text-center border-b border-slate-800 pb-4 space-y-1">
          <h2 className="text-lg font-bold text-slate-100 font-mono uppercase tracking-wider">{activeProject.name}</h2>
          <p className="text-slate-400 font-sans">Official Bill of Quantities (BOQ) & Tender Estimate</p>
          <p className="text-cyan-400 text-[11px]">Contract Ref: {activeProject.contractNumber} | Revision: {activeProject.revision}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded border border-slate-800">
          <div>
            <p className="text-slate-400">Client / Employer:</p>
            <p className="font-bold text-slate-100">{activeProject.client} ({activeProject.employer})</p>
          </div>
          <div>
            <p className="text-slate-400">Consultant Engineer:</p>
            <p className="font-bold text-slate-100">{activeProject.consultant}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-cyan-300 uppercase">BOQ Summary Schedule</h3>
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-2 border border-slate-800">Code</th>
                <th className="p-2 border border-slate-800">Description</th>
                <th className="p-2 border border-slate-800 text-center">Unit</th>
                <th className="p-2 border border-slate-800 text-right">Qty</th>
                <th className="p-2 border border-slate-800 text-right">Rate</th>
                <th className="p-2 border border-slate-800 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-xs">
              {boqItems.map((item) => (
                <tr key={item.id} className={item.isHeader ? 'bg-slate-800 text-amber-300 font-bold' : ''}>
                  <td className="p-2 border border-slate-800 font-bold">{item.itemCode}</td>
                  <td className="p-2 border border-slate-800 font-sans">{item.description}</td>
                  <td className="p-2 border border-slate-800 text-center">{item.unit}</td>
                  <td className="p-2 border border-slate-800 text-right">{item.quantity}</td>
                  <td className="p-2 border border-slate-800 text-right">{formatCurrency(item.rate, currency)}</td>
                  <td className="p-2 border border-slate-800 text-right font-bold text-cyan-300">
                    {formatCurrency(item.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
