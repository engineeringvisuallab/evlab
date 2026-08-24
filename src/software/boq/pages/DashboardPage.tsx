/**
 * EVLab BOQ - Professional Engineering Dashboard
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { calculateProjectCostTotals } from '../core/calculation';
import { formatCurrency, formatQuantity } from '../core/currency';
import {
  FileSpreadsheet,
  DollarSign,
  TrendingUp,
  Layers,
  Boxes,
  Users,
  HardHat,
  Percent,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { activeProject, boqItems, wbsNodes, variations, runningBills, validationIssues } = useAppStore();

  if (!activeProject) {
    return <div className="p-8 text-slate-400 font-mono">No active project loaded.</div>;
  }

  const totals = calculateProjectCostTotals(boqItems, activeProject.settings);
  const currency = activeProject.currency;

  const activeBoqItemsCount = boqItems.filter((i) => !i.isHeader).length;
  const approvedVariationsTotal = variations
    .filter((v) => v.approvalStatus === 'Approved')
    .reduce((acc, curr) => acc + curr.variationAmount, 0);

  const certifiedBillsTotal = runningBills
    .filter((b) => b.status === 'Certified' || b.status === 'Paid')
    .reduce((acc, curr) => acc + curr.grossTotal, 0);

  const currentContractValue = totals.grandEstimatedCost + approvedVariationsTotal;
  const outstandingAmount = currentContractValue - certifiedBillsTotal;

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      {/* Project Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded border border-cyan-800">
              {activeProject.code}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
              {activeProject.projectType}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
              REV: {activeProject.revision}
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-100 mt-1 font-mono">{activeProject.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            <span>Client: {activeProject.client}</span>
            <span>•</span>
            <span>Consultant: {activeProject.consultant}</span>
            <span>•</span>
            <span>Contractor: {activeProject.contractor}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 text-right font-mono">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Grand Estimated Cost</p>
            <p className="text-xl font-extrabold text-cyan-400">{formatCurrency(totals.grandEstimatedCost, currency)}</p>
          </div>
        </div>
      </div>

      {/* Top Engineering Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">BOQ Items</span>
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-lg font-bold font-mono text-slate-100 mt-1">{activeBoqItemsCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{wbsNodes.length} WBS Sections</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Base BOQ</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-sm font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(totals.baseBoqTotal, currency)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Direct Works Cost</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Materials</span>
            <Boxes className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-sm font-bold font-mono text-slate-100 mt-1">
            {formatCurrency(totals.materialTotal, currency)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {totals.baseBoqTotal > 0 ? ((totals.materialTotal / totals.baseBoqTotal) * 100).toFixed(1) : 0}% of Base
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Labour Cost</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-sm font-bold font-mono text-slate-100 mt-1">
            {formatCurrency(totals.labourTotal, currency)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {totals.baseBoqTotal > 0 ? ((totals.labourTotal / totals.baseBoqTotal) * 100).toFixed(1) : 0}% of Base
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Equipment</span>
            <HardHat className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-sm font-bold font-mono text-slate-100 mt-1">
            {formatCurrency(totals.equipmentTotal, currency)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {totals.baseBoqTotal > 0 ? ((totals.equipmentTotal / totals.baseBoqTotal) * 100).toFixed(1) : 0}% of Base
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Overhead & Profit</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-sm font-bold font-mono text-purple-300 mt-1">
            {formatCurrency(totals.overheadTotal + totals.profitTotal, currency)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {activeProject.settings.overheadPercentage}% OH + {activeProject.settings.contractorProfitPercentage}% Profit
          </p>
        </div>
      </div>

      {/* Main Analysis Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cost Distribution Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-xs font-mono uppercase text-slate-300">Cost Structure Breakdown</h3>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Materials Component</span>
                <span>{formatCurrency(totals.materialTotal, currency)}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded"
                  style={{
                    width: `${totals.baseBoqTotal > 0 ? (totals.materialTotal / totals.baseBoqTotal) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Labour Component</span>
                <span>{formatCurrency(totals.labourTotal, currency)}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded"
                  style={{
                    width: `${totals.baseBoqTotal > 0 ? (totals.labourTotal / totals.baseBoqTotal) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Plant & Equipment</span>
                <span>{formatCurrency(totals.equipmentTotal, currency)}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded"
                  style={{
                    width: `${totals.baseBoqTotal > 0 ? (totals.equipmentTotal / totals.baseBoqTotal) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Contingency ({activeProject.settings.contingencyPercentage}%)</span>
                <span className="text-slate-200">{formatCurrency(totals.contingencyTotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT / Tax ({activeProject.settings.vatTaxPercentage}%)</span>
                <span className="text-slate-200">{formatCurrency(totals.vatTaxTotal, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contract & Billing Financial Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-xs font-mono uppercase text-slate-300">Contract & Billing Control</h3>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Original BOQ Total</span>
              <span className="font-semibold text-slate-200">{formatCurrency(totals.grandEstimatedCost, currency)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Approved Variations (VO)</span>
              <span className="font-semibold text-amber-400">+{formatCurrency(approvedVariationsTotal, currency)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800 bg-slate-950/50 px-2 rounded">
              <span className="text-slate-300 font-bold">Current Contract Value</span>
              <span className="font-bold text-cyan-400">{formatCurrency(currentContractValue, currency)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Certified Work (Bills)</span>
              <span className="font-semibold text-emerald-400">{formatCurrency(certifiedBillsTotal, currency)}</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Outstanding Balance</span>
              <span className="font-semibold text-slate-200">{formatCurrency(outstandingAmount, currency)}</span>
            </div>
          </div>
        </div>

        {/* Validation & Engineering Health Checks */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-xs font-mono uppercase text-slate-300">Validation & Health Log</h3>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
            {validationIssues.length === 0 ? (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded text-emerald-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero engineering validation warnings found. Data structure verified clean!</span>
              </div>
            ) : (
              validationIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-2 rounded border text-[11px] font-mono ${
                    issue.severity === 'error'
                      ? 'bg-red-950/50 border-red-800 text-red-300'
                      : 'bg-amber-950/40 border-amber-800 text-amber-300'
                  }`}
                >
                  <p className="font-bold">
                    [{issue.module}] {issue.itemCode ? `Item ${issue.itemCode}` : ''}
                  </p>
                  <p className="text-slate-300 mt-0.5">{issue.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
