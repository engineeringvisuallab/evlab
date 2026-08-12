/**
 * EVLab BOQ - Variation Orders (VO) & Scope Change Module
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../core/currency';
import { FileDiff, Plus, Check, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { VariationType } from '../types';

export const VariationsPage: React.FC = () => {
  const { activeProject, boqItems, variations, addVariation } = useAppStore();

  const [itemCode, setItemCode] = useState(boqItems.find((i) => !i.isHeader)?.itemCode || '01.01');
  const [vType, setVType] = useState<VariationType>('Quantity Increase');
  const [desc, setDesc] = useState('Variation Order for Site Scope Change');
  const [origQty, setOrigQty] = useState(100);
  const [revQty, setRevQty] = useState(135);
  const [origRate, setOrigRate] = useState(2500);
  const [revRate, setRevRate] = useState(2500);
  const [reason, setReason] = useState('Client requested scope modification during execution');

  if (!activeProject) {
    return <div className="p-8 text-slate-400 font-mono">No active project loaded.</div>;
  }

  const currency = activeProject.currency;

  const handleAddVariation = (e: React.FormEvent) => {
    e.preventDefault();
    addVariation({
      itemCode,
      type: vType,
      description: desc,
      unit: 'm³',
      originalQuantity: origQty,
      revisedQuantity: revQty,
      originalRate: origRate,
      revisedRate: revRate,
      reason,
    });
    alert('Created Variation Order record!');
  };

  const totalVariationValue = variations.reduce((acc, v) => acc + v.variationAmount, 0);

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
            <FileDiff className="w-5 h-5 text-cyan-400" />
            <span>Variation Orders & Scope Change Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Track design changes, quantity modifications, new extra items, and financial impacts
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded font-mono text-xs flex items-center space-x-2">
          <span className="text-slate-400 uppercase">Net Variation Financial Impact:</span>
          <span className={`font-extrabold ${totalVariationValue >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {formatCurrency(totalVariationValue, currency)}
          </span>
        </div>
      </div>

      {/* New Variation Form */}
      <form onSubmit={handleAddVariation} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
        <h3 className="font-bold text-cyan-300 uppercase">Create Variation Order (VO)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label className="text-slate-400">Item Code</label>
            <input
              type="text"
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-cyan-300 mt-1 font-bold"
            />
          </div>

          <div>
            <label className="text-slate-400">Variation Type</label>
            <select
              value={vType}
              onChange={(e) => setVType(e.target.value as VariationType)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 mt-1"
            >
              <option value="Quantity Increase">Quantity Increase</option>
              <option value="Quantity Decrease">Quantity Decrease</option>
              <option value="New Item">New Scope Item</option>
              <option value="Omission">Scope Omission</option>
              <option value="Rate Revision">Rate Revision</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400">Original Qty</label>
            <input
              type="number"
              step="any"
              value={origQty}
              onChange={(e) => setOrigQty(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 mt-1"
            />
          </div>

          <div>
            <label className="text-slate-400">Revised Qty</label>
            <input
              type="number"
              step="any"
              value={revQty}
              onChange={(e) => setRevQty(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-amber-300 font-bold mt-1"
            />
          </div>

          <div>
            <label className="text-slate-400">Rate</label>
            <input
              type="number"
              step="any"
              value={revRate}
              onChange={(e) => {
                setOrigRate(parseFloat(e.target.value) || 0);
                setRevRate(parseFloat(e.target.value) || 0);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-emerald-300 font-bold mt-1"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record VO</span>
            </button>
          </div>
        </div>

        <div>
          <label className="text-slate-400">Description / Scope Justification</label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 mt-1 font-sans"
          />
        </div>
      </form>

      {/* Variation Orders List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-3 w-20">VO No</th>
              <th className="p-3 w-24">Item Code</th>
              <th className="p-3 w-32">Type</th>
              <th className="p-3 min-w-[200px]">Description</th>
              <th className="p-3 w-24 text-right">Orig Qty</th>
              <th className="p-3 w-24 text-right">Rev Qty</th>
              <th className="p-3 w-28 text-right">Rate</th>
              <th className="p-3 w-32 text-right">Impact Amount</th>
              <th className="p-3 w-28 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {variations.map((v) => (
              <tr key={v.id} className="hover:bg-slate-950/60">
                <td className="p-3 font-bold text-cyan-400">{v.variationNo}</td>
                <td className="p-3 text-slate-300 font-bold">{v.itemCode}</td>
                <td className="p-3">
                  <span className="bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded border border-slate-800 text-[10px]">
                    {v.type}
                  </span>
                </td>
                <td className="p-3 font-sans text-slate-200">{v.description}</td>
                <td className="p-3 text-right text-slate-400">{v.originalQuantity}</td>
                <td className="p-3 text-right font-bold text-amber-300">{v.revisedQuantity}</td>
                <td className="p-3 text-right text-emerald-300">{formatCurrency(v.revisedRate, currency)}</td>
                <td className={`p-3 text-right font-extrabold ${v.variationAmount >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {v.variationAmount >= 0 ? '+' : ''}{formatCurrency(v.variationAmount, currency)}
                </td>
                <td className="p-3 text-center">
                  <span className="bg-amber-950/80 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    {v.approvalStatus.toUpperCase()}
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
