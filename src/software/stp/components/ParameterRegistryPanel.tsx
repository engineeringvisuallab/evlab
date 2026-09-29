/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Master Parameter Registry & Audit Inspector
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectState, ParameterCategory, ParameterDefinition } from '../types/stp';
import { runParameterAudit } from '../engine/parameters';
import { Database, Search, ShieldCheck, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';

interface ParameterRegistryPanelProps {
  project: ProjectState;
}

export const ParameterRegistryPanel: React.FC<ParameterRegistryPanelProps> = ({ project }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedParam, setSelectedParam] = useState<ParameterDefinition | null>(null);

  const parameters = Object.values(project.parameterRegistry) as ParameterDefinition[];
  const auditReport = runParameterAudit(project.parameterRegistry);

  const categories: { key: string; label: string }[] = [
    { key: 'ALL', label: 'All Categories' },
    { key: 'DEMOGRAPHICS', label: 'Demographics' },
    { key: 'FLOW_HYDRAULICS', label: 'Flow Hydraulics' },
    { key: 'INFLUENT_QUALITY', label: 'Influent Quality' },
    { key: 'BIOLOGICAL_TREATMENT', label: 'Biological Treatment' },
    { key: 'BOQ_COSTING', label: 'BOQ & Costing' },
  ];

  const filteredParams = parameters.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 text-slate-200">
      {/* Title & Audit Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Master STP Parameter Registry & Dependency Audit</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Centralized data dictionary defining variable units, standards, BIM property maps, and formula dependencies.
          </p>
        </div>

        {/* Audit Status Badge */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">Registered Parameters</span>
            <span className="font-bold text-slate-100">{auditReport.totalParameters}</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-slate-400 block text-[10px]">Audit Status</span>
            <span className="text-emerald-400 font-bold">{auditReport.auditStatus}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.key
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search parameter ID, symbol, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Grid: Parameters Table + Selected Parameter Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Parameters Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Parameter ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Design Value</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredParams.map((param) => {
                  const isSelected = selectedParam?.id === param.id;
                  return (
                    <tr
                      key={param.id}
                      onClick={() => setSelectedParam(param)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-cyan-950/60 text-cyan-200' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3 font-semibold text-cyan-400">{param.id}</td>
                      <td className="p-3 text-slate-200 font-sans font-medium">{param.name}</td>
                      <td className="p-3 font-bold text-slate-400">{param.symbol}</td>
                      <td className="p-3 font-bold text-slate-100">{String(param.designValue)}</td>
                      <td className="p-3 text-slate-400">{param.unit}</td>
                      <td className="p-3 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-500 inline-block" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Parameter Detail Inspector */}
        <div>
          {selectedParam ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
                  {selectedParam.id}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-2">{selectedParam.name}</h3>
                <p className="text-xs text-slate-400">Category: {selectedParam.category} &bull; {selectedParam.subcategory}</p>
              </div>

              <div className="space-y-3 text-xs font-mono border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Symbol / Unit:</span>
                  <span className="text-cyan-300 font-bold">{selectedParam.symbol} ({selectedParam.unit})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Datatype:</span>
                  <span className="text-slate-200">{selectedParam.datatype}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Standard / Source:</span>
                  <span className="text-slate-300 text-[11px] font-sans">{selectedParam.standardReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className={selectedParam.isAssumed ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {selectedParam.isAssumed ? 'ASSUMED' : 'VERIFIED'}
                  </span>
                </div>
              </div>

              {/* Dependencies & Integrations */}
              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                <span className="font-semibold text-slate-300 block">Downstream System Links:</span>
                <div className="bg-slate-950 p-2.5 rounded font-mono text-[11px] space-y-1 text-slate-400">
                  <div><strong className="text-slate-300">Formulas:</strong> {selectedParam.formulaDependencies.join(', ') || 'None'}</div>
                  <div><strong className="text-slate-300">Report Chapters:</strong> {selectedParam.reportSections.join(', ') || 'None'}</div>
                  <div><strong className="text-slate-300">BIM Map:</strong> {selectedParam.bimProperties.join(', ') || 'None'}</div>
                  <div><strong className="text-slate-300">SCADA Tags:</strong> {selectedParam.scadaTags.join(', ') || 'None'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              <Database className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>Click any parameter in the registry table to inspect its formula dependencies and BIM mappings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
