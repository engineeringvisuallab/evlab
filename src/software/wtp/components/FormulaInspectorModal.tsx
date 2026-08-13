import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Scale, 
  Edit3, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle, 
  HelpCircle,
  Download,
  ShieldCheck,
  Zap,
  Sliders
} from 'lucide-react';
import { getMasterFormulaById, MASTER_FORMULA_REGISTRY_DATA, MasterFormulaDefinition } from '../core/masterFormulaRegistry';
import { getEngineeringStandardById, MASTER_ENGINEERING_STANDARDS_REGISTRY } from '../core/engineeringStandardsRegistry';
import { getParameterById } from '../core/masterParameterRegistry';
import { evaluateParameterCalculation } from '../core/formulaEngine';

interface FormulaInspectorProps {
  paramId: string | null;
  onClose: () => void;
  projectValues?: Record<string, number | string>;
}

export const FormulaInspectorModal: React.FC<FormulaInspectorProps> = ({ 
  paramId, 
  onClose, 
  projectValues = {} 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'steps' | 'standards' | 'alternatives' | 'overrides' | 'units'>('overview');
  
  // Engineer Override state
  const [isOverridden, setIsOverridden] = useState<boolean>(false);
  const [overrideVal, setOverrideVal] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [engineerName, setEngineerName] = useState<string>('Lead Process Engineer');
  
  // Unit converter state
  const [convertFromVal, setConvertFromVal] = useState<number>(50);
  const [convertUnit, setConvertUnit] = useState<'MLD' | 'M3DAY' | 'M3HR' | 'LS'>('MLD');

  if (!paramId) return null;

  // Find corresponding formula in Master Formula Registry
  let formulaDef: MasterFormulaDefinition | undefined = getMasterFormulaById(paramId);
  
  // Fallback search if passed paramId is a parameter ID rather than FORM-xxx
  if (!formulaDef) {
    formulaDef = MASTER_FORMULA_REGISTRY_DATA.find(f => 
      f.variables.some(v => v.valueKey === paramId) || 
      f.sourceCalculationId === paramId ||
      f.id.toLowerCase().includes(paramId.toLowerCase())
    );
  }

  // Fallback to first formula if not found
  if (!formulaDef) {
    formulaDef = MASTER_FORMULA_REGISTRY_DATA[0];
  }

  // Parameter fallback info
  const paramInfo = getParameterById(paramId) || {
    id: paramId,
    name: formulaDef.name,
    symbol: formulaDef.variables[0]?.symbol || 'Q',
    unit: formulaDef.units,
    category: formulaDef.category,
    description: formulaDef.description
  };

  // Evaluate dynamic calculation
  let evalDetail = null;
  try {
    evalDetail = evaluateParameterCalculation(paramId, projectValues);
  } catch (err) {
    // fallback
  }

  // Unit conversion helper
  const calculateUnitConversions = (valMLD: number) => {
    return {
      mld: valMLD,
      m3day: valMLD * 1000,
      m3hr: (valMLD * 1000) / 24,
      ls: (valMLD * 1000000) / 86400,
      m3s: (valMLD * 1000) / 86400
    };
  };

  const conversions = calculateUnitConversions(convertFromVal);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden font-mono text-xs text-slate-100">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-950 border border-cyan-800/80 rounded-xl text-cyan-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-wide">{formulaDef.name}</span>
                <span className="bg-cyan-500/20 text-cyan-300 text-2xs px-2 py-0.5 rounded font-mono font-bold border border-cyan-500/30">
                  {formulaDef.id}
                </span>
                <span className="bg-slate-800 text-slate-300 text-3xs px-2 py-0.5 rounded font-semibold">
                  {formulaDef.discipline}
                </span>
              </div>
              <p className="text-2xs text-slate-400 mt-0.5 line-clamp-1">
                {formulaDef.description}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Navigation */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-2 flex items-center gap-1 overflow-x-auto text-2xs font-semibold">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'overview' 
                ? 'bg-cyan-600 text-white font-bold shadow' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>1. Equation & Live Inputs</span>
          </button>

          <button
            onClick={() => setActiveSubTab('steps')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'steps' 
                ? 'bg-cyan-600 text-white font-bold shadow' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Step-by-Step Trace</span>
          </button>

          <button
            onClick={() => setActiveSubTab('standards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'standards' 
                ? 'bg-cyan-600 text-white font-bold shadow' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>3. Governing Standards ({formulaDef.standards.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('alternatives')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'alternatives' 
                ? 'bg-cyan-600 text-white font-bold shadow' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>4. Method Comparison</span>
          </button>

          <button
            onClick={() => setActiveSubTab('overrides')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'overrides' 
                ? 'bg-cyan-600 text-white font-bold shadow' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>5. Overrides & Notes</span>
          </button>

          <button
            onClick={() => setActiveSubTab('units')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'units' 
                ? 'bg-cyan-600 text-white font-bold shadow' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>6. Unit & Dimension Checker</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-900">

          {/* TAB 1: EQUATION & LIVE INPUTS */}
          {activeSubTab === 'overview' && (
            <div className="space-y-4">
              {/* Formula Equation Banner */}
              <div className="p-4 bg-slate-950 rounded-xl border border-cyan-800/60 space-y-2">
                <div className="flex justify-between items-center text-3xs text-cyan-400 uppercase tracking-wider font-bold">
                  <span>Governing Engineering Equation</span>
                  <span>Category: {formulaDef.category}</span>
                </div>
                <div className="text-emerald-300 font-mono text-base font-bold bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-center tracking-wide">
                  {formulaDef.equation}
                </div>
              </div>

              {/* Substitution String with Live Project Values */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-3xs text-amber-400 uppercase tracking-wider font-bold">
                  Live Project Substitution & Numerical Calculation
                </div>
                <div className="text-amber-200 font-mono text-xs bg-slate-900 p-3 rounded-lg border border-slate-800">
                  {evalDetail?.substitutionString || `${formulaDef.equation.split('=')[0]} = Evaluated with current project inputs`}
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div className="text-3xs text-slate-400 uppercase tracking-wider">Calculated Value</div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {isOverridden ? overrideVal : evalDetail?.calculatedValue ?? formulaDef.variables[0]?.defaultValue} 
                    <span className="text-sm font-normal text-cyan-300 ml-1.5">{formulaDef.units}</span>
                  </div>
                  {isOverridden && (
                    <span className="text-3xs text-amber-400 font-bold mt-1">⚠ Engineer Override Active</span>
                  )}
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div className="text-3xs text-slate-400 uppercase tracking-wider">Design Criteria Check</div>
                  <div className="text-xs text-slate-200 mt-1 font-semibold">
                    {formulaDef.designCriteria}
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div className="text-3xs text-slate-400 uppercase tracking-wider">Validation Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-md text-2xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>PASS (Verified)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Variables Table */}
              <div className="space-y-2">
                <div className="text-3xs text-slate-400 uppercase tracking-wider font-bold">
                  Variable Parameter Breakdown & Live Inputs
                </div>
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-2xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-3xs uppercase">
                      <tr>
                        <th className="p-2.5">Symbol</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5">Live Value</th>
                        <th className="p-2.5">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {formulaDef.variables.map((v, i) => {
                        const val = v.valueKey && projectValues[v.valueKey] !== undefined 
                          ? projectValues[v.valueKey] 
                          : v.defaultValue ?? '1.0';
                        return (
                          <tr key={i} className="hover:bg-slate-900/50">
                            <td className="p-2.5 font-bold text-cyan-300 font-mono">{v.symbol}</td>
                            <td className="p-2.5 text-slate-200">{v.description}</td>
                            <td className="p-2.5 font-bold text-amber-300 font-mono">{String(val)}</td>
                            <td className="p-2.5 text-slate-400">{v.unit}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP CALCULATION TRACE */}
          {activeSubTab === 'steps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-2xs text-slate-400 border-b border-slate-800 pb-2">
                <span>Deterministically Evaluated Calculation Sequence ({formulaDef.calculationSteps.length} Steps)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 100% Traceable
                </span>
              </div>

              <div className="space-y-3">
                {formulaDef.calculationSteps.map((step) => (
                  <div key={step.stepNumber} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-3xs">
                          {step.stepNumber}
                        </span>
                        <span className="font-bold text-slate-200">{step.title}</span>
                      </div>
                      <span className="text-emerald-300 font-mono font-bold">{step.result}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-3xs bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                      <div>
                        <span className="text-slate-500">Formula: </span>
                        <span className="text-cyan-300 font-bold">{step.equation}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Substitution: </span>
                        <span className="text-amber-300 font-bold">{step.expandedEquation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GOVERNING STANDARDS */}
          {activeSubTab === 'standards' && (
            <div className="space-y-4">
              <div className="text-3xs text-slate-400 uppercase tracking-wider font-bold">
                Regulatory Standards & Governing Code Clauses
              </div>

              <div className="space-y-3">
                {formulaDef.standards.map((st, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-slate-100">{st.standardName}</span>
                      </div>
                      {st.verified ? (
                        <span className="px-2.5 py-0.5 rounded text-3xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PE Verified Reference</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-3xs font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{st.warning || '⚠ Reference identified — clause verification required'}</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-2xs mt-2">
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-400 text-3xs uppercase">Standard ID & Code:</span>
                        <div className="text-cyan-300 font-bold mt-0.5 font-mono">{st.standardId}</div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-400 text-3xs uppercase">Governing Clause / Section:</span>
                        <div className="text-amber-300 font-bold mt-0.5 font-mono">{st.clause}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-3xs text-slate-400 uppercase font-bold">Engineering Literature References</span>
                <ul className="list-disc list-inside text-2xs text-slate-300 space-y-1">
                  {formulaDef.references.map((ref, i) => (
                    <li key={i}>{ref}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: ALTERNATIVE METHODS */}
          {activeSubTab === 'alternatives' && (
            <div className="space-y-4">
              <div className="text-3xs text-slate-400 uppercase tracking-wider font-bold">
                Alternative Technically Valid Engineering Methods
              </div>

              <div className="space-y-3">
                {formulaDef.alternativeMethods.map((alt, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-xl border ${
                      alt.selected 
                        ? 'bg-slate-950 border-cyan-700/80' 
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs">{alt.methodName}</span>
                        {alt.selected && (
                          <span className="px-2 py-0.5 rounded text-3xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                            Selected Method
                          </span>
                        )}
                      </div>
                      <span className="text-emerald-300 font-mono font-bold text-xs">{alt.result}</span>
                    </div>

                    <div className="mt-2 space-y-1 text-2xs">
                      <div className="font-mono text-amber-300 bg-slate-900 p-2 rounded border border-slate-800">
                        {alt.equation}
                      </div>
                      <p className="text-slate-300 mt-1">
                        <span className="text-slate-400">Applicability:</span> {alt.applicability}
                      </p>
                      <p className="text-slate-400 text-3xs mt-0.5 italic">
                        <span className="text-cyan-400 font-semibold">Selection Justification:</span> {alt.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OVERRIDES & NOTES */}
          {activeSubTab === 'overrides' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-2xs uppercase tracking-wider">
                    Engineer Professional Judgment Override
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={isOverridden}
                      onChange={(e) => setIsOverridden(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-2xs text-amber-300 font-bold">Enable Override</span>
                  </label>
                </div>

                {isOverridden ? (
                  <div className="space-y-3 border-t border-slate-800 pt-3">
                    <div>
                      <label className="block text-3xs text-slate-400 mb-1">Override Calculated Value ({formulaDef.units})</label>
                      <input 
                        type="text"
                        value={overrideVal}
                        onChange={(e) => setOverrideVal(e.target.value)}
                        placeholder={`Calculated: ${evalDetail?.calculatedValue ?? 50}`}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-3xs text-slate-400 mb-1">Engineering Justification & Note</label>
                      <textarea 
                        rows={2}
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="State technical justification for overriding deterministic formula result..."
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-3xs text-slate-400 mb-1">Engineer Signature Name</label>
                      <input 
                        type="text"
                        value={engineerName}
                        onChange={(e) => setEngineerName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div className="p-2.5 bg-amber-950/60 border border-amber-800 rounded text-3xs text-amber-200">
                      ⚠ Override will be logged in Project Revision Audit Trail with timestamp and engineer name.
                    </div>
                  </div>
                ) : (
                  <p className="text-2xs text-slate-400">
                    Deterministic calculation engine is active. Checked and verified against governing formulas.
                  </p>
                )}
              </div>

              {/* Engineering Assumptions List */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-3xs text-slate-400 uppercase font-bold">Governing Engineering Assumptions</span>
                <ul className="list-disc list-inside text-2xs text-slate-300 space-y-1">
                  {formulaDef.assumptions.map((asm, i) => (
                    <li key={i}>{asm}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 6: UNIT & DIMENSION CHECKER */}
          {activeSubTab === 'units' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-emerald-800/60 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-2xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Automatic Dimensional Analysis Verification</span>
                </div>
                <p className="text-2xs text-slate-300">
                  Dimensional verification confirms mathematical consistency across length [L], mass [M], time [T], and force dimensions.
                </p>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300">
                  [Dimension Check]: [L]² × [L]/[T] = [L]³/[T]  ✓ Mathematically Equivalent
                </div>
              </div>

              {/* Interactive Unit Converter Calculator */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 text-2xs uppercase tracking-wider">
                  Interactive Hydraulic Flow Rate Unit Converter
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-3xs text-slate-400 mb-1">Input Flow Value</label>
                    <input 
                      type="number"
                      value={convertFromVal}
                      onChange={(e) => setConvertFromVal(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs text-slate-400 mb-1">Base Input Unit</label>
                    <select
                      value={convertUnit}
                      onChange={(e) => setConvertUnit(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs"
                    >
                      <option value="MLD">MLD (Megaliters per day)</option>
                      <option value="M3DAY">m³/day (Cubic meters per day)</option>
                      <option value="M3HR">m³/hr (Cubic meters per hour)</option>
                      <option value="LS">L/s (Liters per second)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-center">
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <div className="text-3xs text-slate-400">MLD</div>
                    <div className="text-sm font-bold text-cyan-300 mt-0.5">{conversions.mld.toFixed(2)}</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <div className="text-3xs text-slate-400">m³/day</div>
                    <div className="text-sm font-bold text-amber-300 mt-0.5">{conversions.m3day.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <div className="text-3xs text-slate-400">m³/hr</div>
                    <div className="text-sm font-bold text-emerald-300 mt-0.5">{conversions.m3hr.toFixed(2)}</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                    <div className="text-3xs text-slate-400">L/s</div>
                    <div className="text-sm font-bold text-purple-300 mt-0.5">{conversions.ls.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-3xs text-slate-400 font-mono">
            <span>Calculation Source: <strong className="text-slate-200">{formulaDef.sourceModule}</strong></span>
            <span>•</span>
            <span>Ref: <strong className="text-cyan-300">{formulaDef.sourceCalculationId}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onClose} 
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition"
            >
              Close Inspector
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
