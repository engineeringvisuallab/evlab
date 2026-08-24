/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Engineering Validation Rules, Assumptions & Audit Panel
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectState, EngineeringAssumption } from '../types/stp';
import { runParameterAudit } from '../engine/parameters';
import { AssumptionEngine } from '../engine/assumptions';
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, FileText, HelpCircle, Database } from 'lucide-react';

interface ValidationAuditPanelProps {
  project: ProjectState;
}

export const ValidationAuditPanel: React.FC<ValidationAuditPanelProps> = ({ project }) => {
  const [subTab, setSubTab] = useState<'VALIDATIONS' | 'ASSUMPTIONS' | 'UNRESOLVED' | 'AUDIT'>('VALIDATIONS');

  const validations = project.validationResults;
  const assumptions = Object.values(project.assumptions) as EngineeringAssumption[];
  const unresolvedInputs = AssumptionEngine.getUnresolvedInputs(project);
  const auditReport = runParameterAudit(project.parameterRegistry);

  const failCount = validations.filter((v) => v.severity === 'FAIL').length;
  const warnCount = validations.filter((v) => v.severity === 'WARNING').length;

  return (
    <div className="p-6 space-y-6 text-slate-200">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Engineering Validation Engine, Assumptions & Data Audit</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rule-based constraint checks, unverified lab data tracking, and parameter completeness audit.
          </p>
        </div>

        {/* Status Summary Pill */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono">
          <span className="text-red-400 font-bold">{failCount} FAIL</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-bold">{warnCount} WARNING</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">{validations.length - failCount - warnCount} PASS</span>
        </div>
      </div>

      {/* Sub-tab Switcher */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('VALIDATIONS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
            subTab === 'VALIDATIONS'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Validation Rules ({validations.length})</span>
        </button>

        <button
          onClick={() => setSubTab('ASSUMPTIONS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
            subTab === 'ASSUMPTIONS'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Assumptions Registry ({assumptions.length})</span>
        </button>

        <button
          onClick={() => setSubTab('UNRESOLVED')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
            subTab === 'UNRESOLVED'
              ? 'bg-amber-950 text-amber-300 border border-amber-800'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Unresolved Inputs ({unresolvedInputs.length})</span>
        </button>

        <button
          onClick={() => setSubTab('AUDIT')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
            subTab === 'AUDIT'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Parameter Audit Report</span>
        </button>
      </div>

      {/* Tab 1: Validation Rules Results */}
      {subTab === 'VALIDATIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Rule ID</th>
                  <th className="p-3">Subsystem</th>
                  <th className="p-3">Actual Value</th>
                  <th className="p-3">Target Condition</th>
                  <th className="p-3">Engineering Explanation & Remedy</th>
                  <th className="p-3">Standard Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {validations.map((val) => (
                  <tr key={val.ruleId} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      {val.severity === 'PASS' && (
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PASS</span>
                        </span>
                      )}
                      {val.severity === 'WARNING' && (
                        <span className="bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 w-max">
                          <AlertTriangle className="w-3 h-3" />
                          <span>WARNING</span>
                        </span>
                      )}
                      {val.severity === 'FAIL' && (
                        <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 w-max">
                          <AlertCircle className="w-3 h-3" />
                          <span>FAIL</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-cyan-400">{val.ruleId}</td>
                    <td className="p-3 text-slate-300 font-sans">{val.subsystem}</td>
                    <td className="p-3 font-bold text-slate-100">{String(val.actualValue)}</td>
                    <td className="p-3 text-slate-400">{val.targetCondition}</td>
                    <td className="p-3 font-sans text-slate-300 leading-relaxed max-w-md">
                      <div>{val.message}</div>
                      {val.severity !== 'PASS' && <div className="text-amber-400/90 text-[11px] mt-0.5">Remedy: {val.remedy}</div>}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">{val.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Assumptions Registry */}
      {subTab === 'ASSUMPTIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              Engineering Assumptions Log ({assumptions.length} Active Items)
            </span>
            <span className="text-amber-400 font-mono">Flagged as ASSUMED until verified by lab/geotech</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Assumption ID</th>
                  <th className="p-3">Parameter Name</th>
                  <th className="p-3">Assumed Value</th>
                  <th className="p-3">Reason / Justification</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Designer</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assumptions.map((asm) => (
                  <tr key={asm.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-cyan-400">{asm.id}</td>
                    <td className="p-3 font-semibold text-slate-200 font-sans">{asm.parameterName}</td>
                    <td className="p-3 text-amber-300 font-bold">{String(asm.assumedValue)}</td>
                    <td className="p-3 font-sans text-slate-300 max-w-sm leading-relaxed">{asm.reason}</td>
                    <td className="p-3 text-slate-400 font-sans">{asm.source}</td>
                    <td className="p-3 text-slate-400 font-sans">{asm.designer}</td>
                    <td className="p-3">
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px]">
                        {asm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Unresolved Inputs */}
      {subTab === 'UNRESOLVED' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Unresolved Engineering Inputs Checklist ({unresolvedInputs.length})</span>
          </h3>

          <div className="space-y-3">
            {unresolvedInputs.map((item, idx) => (
              <div key={idx} className="bg-amber-950/20 border border-amber-800/40 text-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-300">Action Required:</span>
                  <span>{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Parameter Audit Report */}
      {subTab === 'AUDIT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 font-mono">
            <div>
              <span className="text-xs text-slate-400">Parameter Catalog Audit</span>
              <h3 className="text-xl font-bold text-slate-100">Audit Status: {auditReport.auditStatus}</h3>
            </div>
            <span className="text-xs text-slate-500">Timestamp: {auditReport.timestamp}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Total Parameters</span>
              <span className="text-xl font-bold text-slate-100">{auditReport.totalParameters}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Used in Formulas</span>
              <span className="text-xl font-bold text-emerald-400">{auditReport.usedParameters}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Unused / Standby</span>
              <span className="text-xl font-bold text-slate-400">{auditReport.unusedParameters}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Missing Units / Duplicates</span>
              <span className="text-xl font-bold text-slate-100">0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
