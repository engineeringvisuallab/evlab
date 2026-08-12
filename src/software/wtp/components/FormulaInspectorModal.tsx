import React from 'react';
import { X, Calculator, BookOpen, Layers, CheckCircle, AlertTriangle } from 'lucide-react';
import { getParameterById } from '../core/masterParameterRegistry';
import { evaluateParameterCalculation } from '../core/formulaEngine';

interface FormulaInspectorProps {
  paramId: string | null;
  onClose: () => void;
  projectValues?: Record<string, number | string>;
}

export const FormulaInspectorModal: React.FC<FormulaInspectorProps> = ({ paramId, onClose, projectValues = {} }) => {
  if (!paramId) return null;

  const param = getParameterById(paramId);
  let detail = null;
  try {
    detail = evaluateParameterCalculation(paramId, projectValues);
  } catch (err) {
    // fallback
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-xl shadow-2xl p-6 font-mono text-xs text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Calculator className="w-5 h-5" />
            <span>Calculation & Formula Inspector: {param?.name || paramId}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-slate-400 text-3xs uppercase tracking-wider">Parameter ID & Symbol</div>
              <div className="text-slate-100 font-bold text-sm mt-0.5">{param?.id || paramId} ({param?.symbol || 'P'})</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-slate-400 text-3xs uppercase tracking-wider">Category & Unit</div>
              <div className="text-cyan-300 font-bold text-sm mt-0.5">{param?.category || 'Process'} | [{param?.unit || '-'}]</div>
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-3xs uppercase tracking-wider">Engineering Description</div>
            <div className="text-slate-300 text-2xs mt-0.5">{param?.description || 'Engineered process parameter.'}</div>
          </div>

          {detail && (
            <>
              {/* Formula String */}
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="text-cyan-400 font-bold text-3xs uppercase">1. Governing Formula</div>
                <div className="text-emerald-300 font-mono text-sm tracking-wide">{detail.formulaString}</div>
              </div>

              {/* Substitution */}
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="text-cyan-400 font-bold text-3xs uppercase">2. Input Value Substitution</div>
                <div className="text-amber-300 font-mono text-xs tracking-wide">{detail.substitutionString}</div>
              </div>

              {/* Result & Validation */}
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-cyan-400 font-bold text-3xs uppercase">3. Calculated Result</div>
                  <div className="text-white font-bold text-base mt-0.5">{detail.calculatedValue} {detail.unit}</div>
                </div>
                <div className={`px-3 py-1 rounded text-2xs font-bold flex items-center gap-1.5 ${
                  detail.validationStatus === 'PASS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {detail.validationStatus === 'PASS' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{detail.validationStatus}</span>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/50 rounded border border-slate-800">
              <div className="text-slate-400 text-3xs">Governing Standard</div>
              <div className="text-cyan-300 font-bold mt-1">{param?.standard || 'CPHEEO Manual 2021'}</div>
            </div>

            <div className="p-3 bg-slate-950/50 rounded border border-slate-800">
              <div className="text-slate-400 text-3xs">Standard Clause</div>
              <div className="text-amber-300 font-bold mt-1">{param?.standardClause || 'Clause 4.2.1'}</div>
            </div>
          </div>

          {param?.designCriteria && (
            <div className="p-3 bg-slate-950/50 rounded border border-slate-800">
              <div className="text-slate-400 text-3xs">Design Criteria & Thresholds</div>
              <div className="text-slate-200 mt-1">{param.designCriteria}</div>
            </div>
          )}

          <div>
            <div className="text-slate-400 text-3xs uppercase tracking-wider mb-1">Upstream Dependencies</div>
            <div className="flex flex-wrap gap-1.5">
              {Array.isArray(param?.dependencies) && param.dependencies.length > 0 ? (
                param.dependencies.map((dep, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-3xs border border-slate-700">
                    {dep}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">Primary Input Parameter</span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
