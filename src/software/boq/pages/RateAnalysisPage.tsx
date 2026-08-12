/**
 * EVLab BOQ - Rate Analysis Engine & Resource Breakdown
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { calculateRateAnalysisBreakdown } from '../core/calculation';
import { formatCurrency } from '../core/currency';
import { Percent, Plus, Trash2, Check, Calculator, Layers } from 'lucide-react';
import { RateResource, ResourceCategory } from '../types';

export const RateAnalysisPage: React.FC = () => {
  const { activeProject, boqItems, selectedBoqItemId, selectBoqItem, updateBoqItem, materials, labour, equipment } =
    useAppStore();

  const selectedItem = boqItems.find((i) => i.id === selectedBoqItemId) || boqItems.find((i) => !i.isHeader);

  const [overheadPct, setOverheadPct] = useState(activeProject?.settings.overheadPercentage || 8.5);
  const [profitPct, setProfitPct] = useState(activeProject?.settings.contractorProfitPercentage || 10.0);
  const [taxPct, setTaxPct] = useState(activeProject?.settings.vatTaxPercentage || 7.5);

  const [resources, setResources] = useState<RateResource[]>([
    { id: 'res-1', name: 'Portland Composite Cement (PCC)', category: 'Material', unit: 'bag', quantity: 0.12, rate: 540, amount: 64.8, wastagePct: 3 },
    { id: 'res-2', name: 'Sylhet Coarse Sand (FM 2.5)', category: 'Material', unit: 'm³', quantity: 0.045, rate: 1850, amount: 83.25, wastagePct: 5 },
    { id: 'res-3', name: 'Crushed Stone Aggregate 20mm', category: 'Material', unit: 'm³', quantity: 0.09, rate: 3800, amount: 342.0, wastagePct: 3 },
    { id: 'res-4', name: 'Skilled Mason / Concrete Finisher', category: 'Labour', unit: 'day', quantity: 0.08, rate: 1100, amount: 88.0, wastagePct: 0 },
    { id: 'res-5', name: 'Unskilled Helper', category: 'Labour', unit: 'day', quantity: 0.15, rate: 650, amount: 97.5, wastagePct: 0 },
    { id: 'res-6', name: 'Concrete Vibrator & Mixer', category: 'Equipment', unit: 'hr', quantity: 0.05, rate: 1200, amount: 60.0, wastagePct: 0 },
  ]);

  const currency = activeProject?.currency;
  const analysisResult = calculateRateAnalysisBreakdown(resources, overheadPct, profitPct, taxPct);

  const handleApplyRateToBoq = () => {
    if (!selectedItem) return;
    updateBoqItem(selectedItem.id, {
      rate: analysisResult.finalUnitRate,
      materialRate: analysisResult.materialCost,
      labourRate: analysisResult.labourCost,
      equipmentRate: analysisResult.equipmentCost,
    });
    alert(`Applied analyzed rate (${formatCurrency(analysisResult.finalUnitRate, currency)}) to BOQ Item ${selectedItem.itemCode}!`);
  };

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
            <Percent className="w-5 h-5 text-cyan-400" />
            <span>Rate Analysis Engine</span>
          </h1>
          <p className="text-xs text-slate-400">
            Transparent resource cost breakdown (Materials, Labour, Equipment, Overhead, Profit & Tax)
          </p>
        </div>

        {selectedItem && (
          <button
            onClick={handleApplyRateToBoq}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors shadow-md shadow-emerald-950/40"
          >
            <Check className="w-4 h-4" />
            <span>Apply Unit Rate to BOQ</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Select Item */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
          <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Select BOQ Item</h3>
          <div className="max-h-96 overflow-y-auto space-y-1">
            {boqItems
              .filter((i) => !i.isHeader)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectBoqItem(item.id)}
                  className={`w-full text-left p-2 rounded transition-colors ${
                    item.id === selectedItem?.id
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-cyan-400">{item.itemCode}</p>
                  <p className="font-sans line-clamp-1">{item.description}</p>
                  <p className="text-[10px] text-slate-500">
                    Current Rate: {formatCurrency(item.rate, currency)}/{item.unit}
                  </p>
                </button>
              ))}
          </div>
        </div>

        {/* Right Column: Resource Breakdown Grid & Calculations */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Item Context Header */}
          {selectedItem && (
            <div className="bg-slate-900 border border-slate-800 rounded p-3 flex justify-between items-center font-mono text-xs">
              <div>
                <span className="text-cyan-400 font-bold">Item {selectedItem.itemCode}</span>
                <p className="text-slate-200 font-sans">{selectedItem.description}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Target Unit</span>
                <p className="text-amber-300 font-bold">{selectedItem.unit}</p>
              </div>
            </div>
          )}

          {/* Resources Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs font-mono uppercase text-slate-300">
                Resource Coefficients & Rates (per 1 {selectedItem?.unit || 'unit'})
              </h3>
              <button
                onClick={() =>
                  setResources([
                    ...resources,
                    {
                      id: `res-${Date.now()}`,
                      name: 'New Resource',
                      category: 'Material',
                      unit: 'unit',
                      quantity: 1,
                      rate: 100,
                      amount: 100,
                      wastagePct: 0,
                    },
                  ])
                }
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Resource</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2">Resource Name</th>
                    <th className="p-2 w-24">Category</th>
                    <th className="p-2 w-16 text-center">Unit</th>
                    <th className="p-2 w-20 text-right">Qty</th>
                    <th className="p-2 w-24 text-right">Rate</th>
                    <th className="p-2 w-16 text-right">Wastage%</th>
                    <th className="p-2 w-28 text-right">Amount</th>
                    <th className="p-2 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {resources.map((r, idx) => {
                    const rowAmount = (r.quantity || 0) * (r.rate || 0) * (1 + (r.wastagePct || 0) / 100);
                    return (
                      <tr key={r.id} className="hover:bg-slate-950/60">
                        <td className="p-2 font-sans">
                          <input
                            type="text"
                            value={r.name}
                            onChange={(e) => {
                              const updated = [...resources];
                              updated[idx].name = e.target.value;
                              setResources(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-100 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={r.category}
                            onChange={(e) => {
                              const updated = [...resources];
                              updated[idx].category = e.target.value as ResourceCategory;
                              setResources(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-cyan-300"
                          >
                            <option value="Material">Material</option>
                            <option value="Labour">Labour</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Subcontract">Subcontract</option>
                          </select>
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="text"
                            value={r.unit}
                            onChange={(e) => {
                              const updated = [...resources];
                              updated[idx].unit = e.target.value;
                              setResources(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-center text-amber-300 text-xs"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            step="any"
                            value={r.quantity}
                            onChange={(e) => {
                              const updated = [...resources];
                              updated[idx].quantity = parseFloat(e.target.value) || 0;
                              setResources(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-right text-slate-100 text-xs"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            step="any"
                            value={r.rate}
                            onChange={(e) => {
                              const updated = [...resources];
                              updated[idx].rate = parseFloat(e.target.value) || 0;
                              setResources(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-right text-emerald-300 font-bold text-xs"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            step="any"
                            value={r.wastagePct}
                            onChange={(e) => {
                              const updated = [...resources];
                              updated[idx].wastagePct = parseFloat(e.target.value) || 0;
                              setResources(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-right text-slate-400 text-xs"
                          />
                        </td>
                        <td className="p-2 text-right font-bold text-cyan-300">
                          {formatCurrency(rowAmount, currency)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => setResources(resources.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rate Summary Calculation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-3">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Calculation Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400">Material Cost</span>
                <p className="text-sm font-bold text-cyan-400">
                  {formatCurrency(analysisResult.materialCost, currency)}
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400">Labour Cost</span>
                <p className="text-sm font-bold text-amber-400">
                  {formatCurrency(analysisResult.labourCost, currency)}
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400">Equipment Cost</span>
                <p className="text-sm font-bold text-indigo-400">
                  {formatCurrency(analysisResult.equipmentCost, currency)}
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400">Direct Cost Sum</span>
                <p className="text-sm font-bold text-emerald-400">
                  {formatCurrency(analysisResult.directCost, currency)}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded flex items-center justify-between">
              <span className="text-slate-300 font-bold uppercase">Final Analyzed Unit Rate:</span>
              <span className="text-xl font-extrabold text-cyan-300">
                {formatCurrency(analysisResult.finalUnitRate, currency)} / {selectedItem?.unit || 'unit'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
