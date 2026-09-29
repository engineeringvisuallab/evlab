/**
 * EVLab BOQ - Quantity Takeoff Module
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { evaluateFormula } from '../core/calculation';
import { formatQuantity } from '../core/currency';
import { Calculator, Plus, Trash2, Check, RefreshCw } from 'lucide-react';

export const TakeoffPage: React.FC = () => {
  const { boqItems, selectedBoqItemId, selectBoqItem, updateBoqItem, activeProject } = useAppStore();

  const selectedItem = boqItems.find((i) => i.id === selectedBoqItemId) || boqItems.find((i) => !i.isHeader);

  const [formula, setFormula] = useState(selectedItem?.quantityFormula || 'L * W * D * N');
  const [params, setParams] = useState([
    { name: 'L', label: 'Length', value: 120, unit: 'm' },
    { name: 'W', label: 'Width', value: 2.5, unit: 'm' },
    { name: 'D', label: 'Depth', value: 1.8, unit: 'm' },
    { name: 'N', label: 'Number', value: 1, unit: 'Nos' },
  ]);

  const calculatedQty = evaluateFormula(formula, params);

  const handleApplyToBoq = () => {
    if (!selectedItem) return;
    updateBoqItem(selectedItem.id, {
      quantity: calculatedQty,
      quantityFormula: formula,
      source: 'Quantity Takeoff',
    });
    alert(`Applied calculated quantity (${calculatedQty} ${selectedItem.unit}) to item ${selectedItem.itemCode}!`);
  };

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <span>Quantity Takeoff & Formula Engine</span>
          </h1>
          <p className="text-xs text-slate-400">
            Calculate exact civil quantities from engineering dimensions and parametric formulas
          </p>
        </div>

        {selectedItem && (
          <button
            onClick={handleApplyToBoq}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors shadow-md shadow-emerald-950/40"
          >
            <Check className="w-4 h-4" />
            <span>Apply Quantity to BOQ Item</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* BOQ Item Selection */}
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
                    Current Qty: {item.quantity} {item.unit}
                  </p>
                </button>
              ))}
          </div>
        </div>

        {/* Formula & Parameters Editor */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          {selectedItem ? (
            <>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded space-y-1 font-mono text-xs">
                <span className="text-cyan-400 font-bold">Active Item: {selectedItem.itemCode}</span>
                <p className="text-slate-200 font-sans">{selectedItem.description}</p>
                <p className="text-[10px] text-slate-400">Target Unit: {selectedItem.unit}</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Dimension Formula Expression</label>
                <input
                  type="text"
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  Supported variables: L, W, D, H, N, R, Area, Volume. Example: L * W * D * N
                </p>
              </div>

              {/* Input Parameters Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-xs font-bold text-slate-300">Input Parameters</h4>
                  <button
                    onClick={() =>
                      setParams([
                        ...params,
                        { name: `P${params.length + 1}`, label: 'Param', value: 1, unit: 'm' },
                      ])
                    }
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Parameter</span>
                  </button>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {params.map((p, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-950 p-2 rounded border border-slate-800">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const updated = [...params];
                          updated[idx].name = e.target.value;
                          setParams(updated);
                        }}
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-300 text-center uppercase"
                      />
                      <input
                        type="text"
                        value={p.label}
                        onChange={(e) => {
                          const updated = [...params];
                          updated[idx].label = e.target.value;
                          setParams(updated);
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      />
                      <input
                        type="number"
                        step="any"
                        value={p.value}
                        onChange={(e) => {
                          const updated = [...params];
                          updated[idx].value = parseFloat(e.target.value) || 0;
                          setParams(updated);
                        }}
                        className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-emerald-300 font-bold"
                      />
                      <span className="w-12 text-slate-400 text-center">{p.unit}</span>
                      <button
                        onClick={() => setParams(params.filter((_, i) => i !== idx))}
                        className="p-1 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="bg-slate-950 border border-slate-800 rounded p-4 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Calculated Output Quantity</span>
                  <p className="text-2xl font-extrabold text-cyan-400 mt-0.5">
                    {formatQuantity(calculatedQty)} <span className="text-sm font-normal text-amber-300">{selectedItem.unit}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500">BOQ Impact</span>
                  <p className="text-xs text-slate-300 mt-1">
                    Amount: {activeProject?.currency?.symbol || '৳'}{' '}
                    {(calculatedQty * selectedItem.rate).toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-500 font-mono italic">Select a BOQ item to begin quantity takeoff.</p>
          )}
        </div>
      </div>
    </div>
  );
};
