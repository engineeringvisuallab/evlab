import React, { useState } from 'react';
import { Droplets, ShieldCheck, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';
import { RawWaterQualityItem } from '../types/wtp';

interface WaterQualityProps {
  waterQualityList?: RawWaterQualityItem[];
  selectedStandard?: string;
  onUpdateWaterQuality?: (id: string, rawVal: number) => void;
  onAddCustomParameter?: (item: RawWaterQualityItem) => void;
}

export const WaterQualityView: React.FC<WaterQualityProps> = ({
  waterQualityList = [],
  selectedStandard = 'CPHEEO 2021',
  onUpdateWaterQuality,
  onAddCustomParameter
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newName, setNewName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newCategory, setNewCategory] = useState<'Physical' | 'Chemical' | 'Metals' | 'Microbiology' | 'Organic / Special'>('Chemical');
  const [newUnit, setNewUnit] = useState('mg/L');
  const [newRawVal, setNewRawVal] = useState(1.0);
  const [newTargetVal, setNewTargetVal] = useState(0.5);

  const categories = ['ALL', 'Physical', 'Chemical', 'Metals', 'Microbiology', 'Organic / Special'];

  const filteredList = filterCategory === 'ALL' 
    ? waterQualityList 
    : waterQualityList.filter(item => item.category === filterCategory);

  const handleCreateCustom = () => {
    if (!newName) return;
    const reqRemoval = newRawVal > newTargetVal ? ((newRawVal - newTargetVal) / newRawVal) * 100 : 0;
    const status = newRawVal <= newTargetVal ? 'PASS' : 'WARNING';
    
    onAddCustomParameter?.({
      id: `WQ-CUST-${Date.now()}`,
      name: newName,
      symbol: newSymbol || newName.slice(0, 4),
      category: newCategory,
      unit: newUnit,
      rawValue: newRawVal,
      whoTarget: newTargetVal,
      bdTarget: newTargetVal,
      epaTarget: newTargetVal,
      euTarget: newTargetVal,
      requiredRemovalPercent: Number(reqRemoval.toFixed(1)),
      achievedRemovalPercent: Number(reqRemoval.toFixed(1)),
      finalValue: newTargetVal,
      complianceStatus: status,
      requiredProcesses: ['Advanced Water Treatment']
    });

    setNewName('');
    setShowAddModal(false);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Droplets className="w-6 h-6 text-cyan-400" />
            <span>Raw Water Quality & Standards Compliance Database</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Raw water baseline analysis vs target standards ({selectedStandard}). Automatic required removal % & process triggers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Parameter</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 font-mono text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterCategory === cat
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Water Quality Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-3xs border-b border-slate-800">
              <tr>
                <th className="p-3.5">Parameter Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Unit</th>
                <th className="p-3.5 text-right">Raw Water Value</th>
                <th className="p-3.5 text-right">Target Limit ({selectedStandard})</th>
                <th className="p-3.5 text-right">Req. Removal %</th>
                <th className="p-3.5">Compliance Status</th>
                <th className="p-3.5">Required Treatment Processes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredList.map(item => {
                const targetVal = selectedStandard === 'Bangladesh ECR 2023' 
                  ? item.bdTarget 
                  : selectedStandard === 'US EPA' 
                  ? item.epaTarget 
                  : item.whoTarget;

                const isCompliant = item.rawValue <= targetVal;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-slate-100 flex items-center gap-2">
                      <span>{item.name}</span>
                      <span className="text-3xs text-slate-500">({item.symbol})</span>
                    </td>
                    <td className="p-3.5 text-slate-400">{item.category}</td>
                    <td className="p-3.5 text-slate-400">{item.unit}</td>
                    <td className="p-3.5 text-right font-bold text-cyan-300">
                      <input
                        type="number"
                        step="any"
                        value={item.rawValue}
                        onChange={e => onUpdateWaterQuality?.(item.id, Number(e.target.value))}
                        className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right focus:border-cyan-500 focus:outline-none text-xs"
                      />
                    </td>
                    <td className="p-3.5 text-right font-semibold text-slate-300">{targetVal}</td>
                    <td className="p-3.5 text-right font-semibold text-amber-400">
                      {item.requiredRemovalPercent.toFixed(1)}%
                    </td>
                    <td className="p-3.5">
                      {isCompliant ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-3xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PASS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded text-3xs">
                          <AlertTriangle className="w-3 h-3" />
                          <span>EXCEEDS LIMIT</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-3xs text-slate-400">
                      {item.requiredProcesses.join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Parameter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 font-mono text-xs">
            <h3 className="text-base font-bold text-cyan-300">Add Custom Water Parameter</h3>
            <div>
              <label className="text-slate-400 block mb-1">Parameter Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Microcystin-LR"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="Physical">Physical</option>
                <option value="Chemical">Chemical</option>
                <option value="Metals">Metals</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Organic / Special">Organic / Special</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Unit</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={e => setNewUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Raw Value</label>
                <input
                  type="number"
                  value={newRawVal}
                  onChange={e => setNewRawVal(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustom}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-500"
              >
                Save Parameter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
