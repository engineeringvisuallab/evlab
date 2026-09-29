import React, { useState } from 'react';
import { useGIS } from '../../context/GISContext';
import { X, Search, Check, Plus, Trash2, AlertCircle } from 'lucide-react';

interface QueryRule {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOp: 'AND' | 'OR';
}

export const QueryBuilderModal: React.FC = () => {
  const {
    project,
    isQueryBuilderOpen,
    setIsQueryBuilderOpen,
    setSelectedFeatureIds,
    zoomToFeatures,
  } = useGIS();

  const [selectedLayerId, setSelectedLayerId] = useState<string>(project.layers[0]?.id || '');
  const [rules, setRules] = useState<QueryRule[]>([
    { id: 'rule-1', field: '', operator: '>=', value: '', logicalOp: 'AND' },
  ]);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isQueryBuilderOpen) return null;

  const targetLayer = project.layers.find((l) => l.id === selectedLayerId) || project.layers[0];

  const handleAddRule = () => {
    setRules((prev) => [
      ...prev,
      { id: `rule-${Date.now()}`, field: targetLayer?.fields[0]?.name || '', operator: '=', value: '', logicalOp: 'AND' },
    ]);
  };

  const handleRemoveRule = (id: string) => {
    if (rules.length <= 1) return;
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRule = (id: string, updates: Partial<QueryRule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const evalRule = (val: any, op: string, qVal: string): boolean => {
    if (op === 'IS NULL') return val === undefined || val === null || val === '';
    if (op === 'IS NOT NULL') return val !== undefined && val !== null && val !== '';

    if (val === undefined || val === null) return false;

    const numVal = parseFloat(val);
    const numQuery = parseFloat(qVal);

    if (!isNaN(numVal) && !isNaN(numQuery)) {
      if (op === '=') return numVal === numQuery;
      if (op === '!=') return numVal !== numQuery;
      if (op === '>') return numVal > numQuery;
      if (op === '<') return numVal < numQuery;
      if (op === '>=') return numVal >= numQuery;
      if (op === '<=') return numVal <= numQuery;
    }

    const strVal = String(val).toLowerCase();
    const strQuery = String(qVal).toLowerCase();

    if (op === '=') return strVal === strQuery;
    if (op === '!=') return strVal !== strQuery;
    if (op === 'LIKE') return strVal.includes(strQuery);

    return false;
  };

  const handleExecuteQuery = () => {
    setQueryError(null);
    setStatusMessage(null);

    if (!targetLayer) {
      setQueryError('Please select a target layer.');
      return;
    }

    const activeRules = rules.filter((r) => r.field.trim() !== '');
    if (activeRules.length === 0) {
      setQueryError('Please select at least one attribute field to query.');
      return;
    }

    const matches: string[] = [];

    targetLayer.features.forEach((feat) => {
      let isMatch = true;

      activeRules.forEach((rule, idx) => {
        const val = feat.properties[rule.field];
        const ruleMatches = evalRule(val, rule.operator, rule.value);

        if (idx === 0) {
          isMatch = ruleMatches;
        } else {
          if (rule.logicalOp === 'AND') {
            isMatch = isMatch && ruleMatches;
          } else {
            isMatch = isMatch || ruleMatches;
          }
        }
      });

      if (isMatch) matches.push(feat.id);
    });

    if (matches.length === 0) {
      setStatusMessage('No features matched the query criteria.');
    } else {
      setSelectedFeatureIds(matches);
      zoomToFeatures(matches);
      setStatusMessage(`Successfully selected ${matches.length} matching feature(s) on map.`);
      setTimeout(() => {
        setIsQueryBuilderOpen(false);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-xs text-slate-200">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Search size={18} />
            <span>Select By Attribute (SQL Query Engine)</span>
          </div>
          <button
            onClick={() => setIsQueryBuilderOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Target Layer</label>
            <select
              value={selectedLayerId}
              onChange={(e) => {
                setSelectedLayerId(e.target.value);
                setRules([{ id: 'rule-1', field: '', operator: '>=', value: '', logicalOp: 'AND' }]);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              {project.layers.map((lyr) => (
                <option key={lyr.id} value={lyr.id}>
                  {lyr.name} ({lyr.features.length} features)
                </option>
              ))}
            </select>
          </div>

          {targetLayer && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-400 font-semibold">
                <span>Query Rules</span>
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px]"
                >
                  <Plus size={13} />
                  <span>Add Rule</span>
                </button>
              </div>

              {rules.map((rule, idx) => (
                <div key={rule.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-2">
                  {idx > 0 && (
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Combine with:</span>
                      <select
                        value={rule.logicalOp}
                        onChange={(e) => handleUpdateRule(rule.id, { logicalOp: e.target.value as any })}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[11px] font-bold text-cyan-400"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <label className="text-[10px] text-slate-500 block">Field</label>
                      <select
                        value={rule.field}
                        onChange={(e) => handleUpdateRule(rule.id, { field: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        <option value="">Select Field...</option>
                        {targetLayer.fields.map((f) => (
                          <option key={f.name} value={f.name}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="text-[10px] text-slate-500 block">Operator</label>
                      <select
                        value={rule.operator}
                        onChange={(e) => handleUpdateRule(rule.id, { operator: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        <option value="=">=</option>
                        <option value="!=">!=</option>
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                        <option value=">=">&gt;=</option>
                        <option value="<=">&lt;=</option>
                        <option value="LIKE">LIKE (Contains)</option>
                        <option value="IS NULL">IS NULL</option>
                        <option value="IS NOT NULL">IS NOT NULL</option>
                      </select>
                    </div>

                    <div className="col-span-4">
                      <label className="text-[10px] text-slate-500 block">Value</label>
                      <input
                        type="text"
                        disabled={rule.operator === 'IS NULL' || rule.operator === 'IS NOT NULL'}
                        placeholder="Value..."
                        value={rule.value}
                        onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-30"
                      />
                    </div>

                    <div className="col-span-1 pt-3 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(rule.id)}
                        disabled={rules.length <= 1}
                        className="p-1 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded disabled:opacity-20"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SQL Preview */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-cyan-300">
            WHERE{' '}
            {rules
              .map(
                (r, i) =>
                  `${i > 0 ? ` ${r.logicalOp} ` : ''}${r.field || 'Field'} ${r.operator} ${
                    r.operator.includes('NULL') ? '' : `'${r.value || 'Val'}'`
                  }`
              )
              .join('')}
          </div>

          {/* Feedback & Error Banner */}
          {queryError && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-700/80 rounded text-rose-300 flex items-center gap-2 text-xs">
              <AlertCircle size={15} />
              <span>{queryError}</span>
            </div>
          )}

          {statusMessage && (
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/80 rounded text-cyan-300 flex items-center gap-2 text-xs font-semibold">
              <Check size={15} />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={() => setIsQueryBuilderOpen(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={handleExecuteQuery}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded transition shadow flex items-center gap-1.5"
          >
            <Check size={14} />
            <span>Select Matching Features</span>
          </button>
        </div>
      </div>
    </div>
  );
};
