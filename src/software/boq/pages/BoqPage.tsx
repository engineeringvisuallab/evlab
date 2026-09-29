/**
 * EVLab BOQ - Core BOQ Builder Workspace Module
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { BOQItem } from '../types';
import { calculateProjectCostTotals } from '../core/calculation';
import { formatCurrency, formatQuantity } from '../core/currency';
import {
  Grid,
  Plus,
  Trash2,
  Copy,
  Layers,
  Search,
  Filter,
  Info,
  ChevronRight,
  FolderOpen,
  DollarSign,
  Calculator,
} from 'lucide-react';

export const BoqPage: React.FC = () => {
  const {
    activeProject,
    boqItems,
    wbsNodes,
    selectedBoqItemId,
    selectBoqItem,
    addBoqItem,
    updateBoqItem,
    deleteBoqItem,
    duplicateBoqItem,
    addWbsNode,
    setCurrentView,
  } = useAppStore();

  const [selectedWbsCode, setSelectedWbsCode] = useState<string | null>(null);
  const [gridSearch, setGridSearch] = useState('');
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof BOQItem } | null>(null);

  if (!activeProject) {
    return <div className="p-8 text-slate-400 font-mono">No active project loaded.</div>;
  }

  const currency = activeProject.currency;
  const totals = calculateProjectCostTotals(boqItems, activeProject.settings);

  // Filter BOQ items based on WBS filter and search query
  const filteredItems = boqItems.filter((item) => {
    const matchesWbs = !selectedWbsCode || item.wbsCode === selectedWbsCode || item.itemCode.startsWith(selectedWbsCode);
    const matchesSearch =
      !gridSearch.trim() ||
      item.itemCode.toLowerCase().includes(gridSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(gridSearch.toLowerCase()) ||
      item.specification.toLowerCase().includes(gridSearch.toLowerCase());
    return matchesWbs && matchesSearch;
  });

  const selectedItem = boqItems.find((i) => i.id === selectedBoqItemId);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Workspace Toolbar */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold">
            <Grid className="w-4 h-4" />
            <span>BOQ SPREADSHEET WORKSPACE</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            {filteredItems.length} of {boqItems.length} items
          </span>

          {selectedWbsCode && (
            <div className="flex items-center space-x-1.5 bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
              <span>WBS: {selectedWbsCode}</span>
              <button
                onClick={() => setSelectedWbsCode(null)}
                className="text-slate-400 hover:text-white font-bold ml-1"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center space-x-2">
          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              value={gridSearch}
              onChange={(e) => setGridSearch(e.target.value)}
              placeholder="Filter grid..."
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
            />
            {gridSearch && (
              <button
                onClick={() => setGridSearch('')}
                className="absolute right-2 top-1.5 text-slate-500 hover:text-slate-200"
              >
                ×
              </button>
            )}
          </div>

          <button
            onClick={() =>
              addBoqItem({
                description: 'New Bill Section Header',
                isHeader: true,
                unit: 'LOT',
                quantity: 1,
                rate: 0,
              })
            }
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded text-xs font-mono flex items-center space-x-1 border border-slate-700"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Header</span>
          </button>

          <button
            onClick={() => addBoqItem({})}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-mono font-medium flex items-center space-x-1 shadow-md shadow-cyan-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Item</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: WBS Hierarchy Tree Panel */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
              WBS Tree Hierarchy
            </span>
            <button
              onClick={() => addWbsNode({ title: 'New WBS Section' })}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400"
              title="Add WBS Section"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs">
            <button
              onClick={() => setSelectedWbsCode(null)}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors ${
                selectedWbsCode === null
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>[ALL] Entire Project BOQ</span>
              <span className="text-[10px] text-slate-500">{boqItems.length}</span>
            </button>

            {wbsNodes.map((wbs) => {
              const isSelected = selectedWbsCode === wbs.code;
              const count = boqItems.filter(
                (i) => i.wbsCode === wbs.code || i.itemCode.startsWith(wbs.code)
              ).length;

              return (
                <button
                  key={wbs.id}
                  onClick={() => setSelectedWbsCode(wbs.code)}
                  style={{ paddingLeft: `${wbs.level * 10 + 6}px` }}
                  className={`w-full text-left py-1.5 pr-2.5 rounded flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 truncate pr-2">
                    <span className="text-slate-500 text-[10px]">{wbs.code}</span>
                    <span className="truncate">{wbs.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Engineering Spreadsheet DataGrid */}
        <div className="flex-1 bg-slate-950 overflow-auto relative">
          <table className="w-full text-left border-collapse font-sans text-xs">
            {/* Table Header */}
            <thead className="sticky top-0 bg-slate-900 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800 z-10 select-none">
              <tr>
                <th className="p-2 w-12 text-center border-r border-slate-800">#</th>
                <th className="p-2 w-24 border-r border-slate-800">Item Code</th>
                <th className="p-2 w-20 border-r border-slate-800">WBS</th>
                <th className="p-2 min-w-[280px] border-r border-slate-800">Description & Specification</th>
                <th className="p-2 w-20 text-center border-r border-slate-800">Unit</th>
                <th className="p-2 w-28 text-right border-r border-slate-800">Quantity</th>
                <th className="p-2 w-32 text-right border-r border-slate-800">Unit Rate</th>
                <th className="p-2 w-36 text-right border-r border-slate-800">Amount ({currency.symbol.trim()})</th>
                <th className="p-2 w-24 text-center border-r border-slate-800">Source</th>
                <th className="p-2 w-20 text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredItems.map((item, index) => {
                const isSelected = item.id === selectedBoqItemId;

                if (item.isHeader) {
                  return (
                    <tr
                      key={item.id}
                      onClick={() => selectBoqItem(item.id)}
                      className="bg-slate-900/90 hover:bg-slate-850 border-t-2 border-b-2 border-slate-700 font-bold text-amber-300"
                    >
                      <td className="p-2 text-center border-r border-slate-800">{index + 1}</td>
                      <td className="p-2 border-r border-slate-800">{item.itemCode}</td>
                      <td className="p-2 border-r border-slate-800">{item.wbsCode}</td>
                      <td colSpan={6} className="p-2 font-mono uppercase tracking-wider text-slate-100">
                        {item.description}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBoqItem(item.id);
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={item.id}
                    onClick={() => selectBoqItem(item.id)}
                    className={`hover:bg-slate-900/80 transition-colors cursor-pointer ${
                      isSelected ? 'bg-cyan-950/60 font-medium text-cyan-200' : 'text-slate-200'
                    }`}
                  >
                    {/* Index */}
                    <td className="p-2 text-center text-slate-500 border-r border-slate-800/80">
                      {index + 1}
                    </td>

                    {/* Item Code */}
                    <td className="p-2 border-r border-slate-800/80 font-bold text-cyan-400">
                      {item.itemCode}
                    </td>

                    {/* WBS Code */}
                    <td className="p-2 border-r border-slate-800/80 text-slate-400">{item.wbsCode}</td>

                    {/* Description & Spec */}
                    <td className="p-2 border-r border-slate-800/80 font-sans">
                      <p className="font-medium text-slate-100 leading-snug">{item.description}</p>
                      {item.specification && (
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          Spec: {item.specification}
                        </p>
                      )}
                    </td>

                    {/* Unit */}
                    <td className="p-2 text-center border-r border-slate-800/80 text-amber-300 font-bold">
                      {item.unit}
                    </td>

                    {/* Quantity - Editable */}
                    <td className="p-2 text-right border-r border-slate-800/80 font-mono text-slate-100">
                      <input
                        type="number"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          updateBoqItem(item.id, { quantity: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded px-1.5 py-0.5 text-right text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </td>

                    {/* Rate - Editable */}
                    <td className="p-2 text-right border-r border-slate-800/80 font-mono text-emerald-300 font-semibold">
                      <input
                        type="number"
                        step="any"
                        value={item.rate}
                        onChange={(e) =>
                          updateBoqItem(item.id, { rate: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded px-1.5 py-0.5 text-right text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </td>

                    {/* Amount */}
                    <td className="p-2 text-right border-r border-slate-800/80 font-bold font-mono text-cyan-300">
                      {formatCurrency(item.amount, currency)}
                    </td>

                    {/* Source */}
                    <td className="p-2 text-center border-r border-slate-800/80">
                      <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
                        {item.source}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-2 text-center flex items-center justify-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateBoqItem(item.id);
                        }}
                        className="p-1 text-slate-500 hover:text-slate-200 rounded"
                        title="Duplicate Row"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBoqItem(item.id);
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 rounded"
                        title="Delete Row"
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

        {/* Right Column: Active Item Inspector & Rate Analysis Panel */}
        {selectedItem && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 text-xs font-sans">
            <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-400">
                Item Inspector ({selectedItem.itemCode})
              </span>
              <button
                onClick={() => selectBoqItem(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ×
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Description</label>
                <textarea
                  rows={3}
                  value={selectedItem.description}
                  onChange={(e) => updateBoqItem(selectedItem.id, { description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 mt-1 focus:outline-none focus:border-cyan-500 text-xs resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase">Specification</label>
                <textarea
                  rows={2}
                  value={selectedItem.specification}
                  onChange={(e) => updateBoqItem(selectedItem.id, { specification: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 mt-1 focus:outline-none focus:border-cyan-500 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <label className="text-[10px] text-slate-400">Unit</label>
                  <input
                    type="text"
                    value={selectedItem.unit}
                    onChange={(e) => updateBoqItem(selectedItem.id, { unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-amber-300 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">WBS Code</label>
                  <input
                    type="text"
                    value={selectedItem.wbsCode}
                    onChange={(e) => updateBoqItem(selectedItem.id, { wbsCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 mt-1"
                  />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category</span>
                  <span className="text-slate-200">{selectedItem.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity Source</span>
                  <span className="text-cyan-300">{selectedItem.source}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                  <span className="text-slate-300">Total Amount</span>
                  <span className="text-cyan-400">{formatCurrency(selectedItem.amount, currency)}</span>
                </div>
              </div>

              {/* Quick links to deeper modules */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => setCurrentView('rate-analysis')}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded text-cyan-300 font-mono text-xs flex items-center justify-center space-x-1.5"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Open Rate Analysis</span>
                </button>
                <button
                  onClick={() => setCurrentView('takeoff')}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded text-slate-300 font-mono text-xs flex items-center justify-center space-x-1.5"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Open Quantity Takeoff</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Summary Bar */}
      <div className="h-10 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-xs font-mono shrink-0 text-slate-300">
        <div className="flex items-center space-x-4">
          <span>
            Direct Works Total: <strong className="text-emerald-400">{formatCurrency(totals.baseBoqTotal, currency)}</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            Overhead ({activeProject.settings.overheadPercentage}%):{' '}
            <strong className="text-slate-200">{formatCurrency(totals.overheadTotal, currency)}</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            Profit ({activeProject.settings.contractorProfitPercentage}%):{' '}
            <strong className="text-slate-200">{formatCurrency(totals.profitTotal, currency)}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2 bg-cyan-950/80 px-3 py-1 rounded border border-cyan-800">
          <span className="text-slate-300 uppercase tracking-wider font-bold">Grand Estimated Total:</span>
          <span className="text-cyan-300 font-extrabold text-sm">{formatCurrency(totals.grandEstimatedCost, currency)}</span>
        </div>
      </div>
    </div>
  );
};
