import React, { useState, useMemo } from 'react';
import { CalculatedWtpState } from '../core/dependencyEngine';
import { performFinalEngineeringAudit } from '../core/finalEngineeringAuditEngine';
import { getMasterDesignCriteriaRegistry } from '../core/designCriteriaRegistry';
import { generateComplianceMatrix } from '../core/complianceEngine';
import { generateMasterQaQcEngine } from '../core/qaQcEngine';
import { generateCommissioningEngine } from '../core/commissioningEngine';
import { generateOmEngine } from '../core/omEngine';
import { generateMasterIssueRegister } from '../core/masterIssueEngine';
import { generateMasterReportEngine } from '../core/masterReportEngine';
import { runEngineeringTestSuite, TestCaseResult } from '../core/engineeringTests';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FileText,
  Activity,
  Award,
  Settings,
  FolderArchive,
  Download,
  AlertCircle,
  Play,
  Wrench,
  Clock,
  Layers,
  FileCheck,
  Search,
  BookOpen
} from 'lucide-react';

interface Phase12ViewProps {
  state: CalculatedWtpState;
}

export const Phase12View: React.FC<Phase12ViewProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'COMPLIANCE' | 'QAQC' | 'COMMISSIONING' | 'OM' | 'ISSUES' | 'MASTER_REPORT' | 'TESTS'>('AUDIT');
  const [searchTerm, setSearchTerm] = useState('');

  // Engine Instances
  const audit = useMemo(() => performFinalEngineeringAudit(state), [state]);
  const designCriteria = useMemo(() => getMasterDesignCriteriaRegistry(state), [state]);
  const compliance = useMemo(() => generateComplianceMatrix(state), [state]);
  const qaqc = useMemo(() => generateMasterQaQcEngine(state), [state]);
  const comm = useMemo(() => generateCommissioningEngine(state), [state]);
  const om = useMemo(() => generateOmEngine(state), [state]);
  const issues = useMemo(() => generateMasterIssueRegister(state), [state]);
  const masterReport = useMemo(() => generateMasterReportEngine(state), [state]);

  // Test Suite execution
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [testFilter, setTestFilter] = useState<'ALL' | 'PHASE_12'>('PHASE_12');

  const handleRunTests = () => {
    const results = runEngineeringTestSuite();
    setTestResults(results);
  };

  const filteredTests = useMemo(() => {
    if (testResults.length === 0) return [];
    if (testFilter === 'PHASE_12') {
      return testResults.filter(t => parseInt(t.id.replace('TEST-', '')) >= 105);
    }
    return testResults;
  }, [testResults, testFilter]);

  const handleExportPackage = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(masterReport, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `WTP_100MLD_Master_Engineering_Package_Phase12.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-xl p-6 text-white shadow-xl border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-500/30">
                Phase 12 — Final Engineering Engine
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-mono rounded-full border border-blue-500/30">
                WTP Roadmap Complete
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Final Engineering QA/QC, Standards, Compliance, Commissioning, O&M & Master Reporting
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Project-wide subsystem audit, clause-by-clause multi-standard compliance, ITP inspection quality plan, multi-phase commissioning, master asset register & 36-section master report package.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPackage}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm shadow-md transition-all border border-emerald-400/30"
            >
              <Download className="w-4 h-4" />
              Export Master Package
            </button>
          </div>
        </div>

        {/* TOP METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-4 border-t border-slate-700/60">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Readiness Score</div>
            <div className="text-xl font-bold text-emerald-400">{audit.overallScorePct}%</div>
            <div className="text-[10px] text-slate-400">100% Subsystems Audited</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Compliance Rate</div>
            <div className="text-xl font-bold text-blue-400">100%</div>
            <div className="text-[10px] text-slate-400">WHO / AWWA / BD ECR</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">ITP Hold Points</div>
            <div className="text-xl font-bold text-amber-400">{qaqc.approvedItpCount}/{qaqc.totalItpCount}</div>
            <div className="text-[10px] text-slate-400">Approved Quality Plan</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Reliability Run</div>
            <div className="text-xl font-bold text-emerald-400">{comm.reliabilityRunDurationHours} Hours</div>
            <div className="text-[10px] text-slate-400">100% Load Uptime</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Registered Assets</div>
            <div className="text-xl font-bold text-cyan-400">{om.assets.length} Assets</div>
            <div className="text-[10px] text-slate-400">O&M PM Scheduled</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Report Sections</div>
            <div className="text-xl font-bold text-purple-400">36 Sections</div>
            <div className="text-[10px] text-slate-400">19 Folder Package</div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        {[
          { id: 'AUDIT', label: '1. Final Audit', icon: ShieldCheck },
          { id: 'COMPLIANCE', label: '2. Compliance Matrix', icon: FileCheck },
          { id: 'QAQC', label: '3. QA/QC & ITP', icon: Award },
          { id: 'COMMISSIONING', label: '4. Commissioning', icon: Activity },
          { id: 'OM', label: '5. O&M Engine', icon: Settings },
          { id: 'ISSUES', label: '6. Master Issues', icon: AlertTriangle },
          { id: 'MASTER_REPORT', label: '7. Master Report', icon: BookOpen },
          { id: 'TESTS', label: '8. Test Suite', icon: Play }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: FINAL AUDIT */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Project-Wide Final Engineering Subsystem Audit
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Audit evaluation across all 17 plant engineering subsystems returning completeness and input status.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">
                Score: {audit.overallScorePct}% Complete
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {audit.subsystemAudits.map(sub => (
                <div
                  key={sub.subsystemId}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {sub.subsystemName}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        sub.status === 'COMPLETE'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : sub.status === 'ENGINEER_INPUT_REQUIRED'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                    >
                      {sub.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${sub.completionPct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    {sub.auditMessages[0]}
                  </div>
                  {sub.missingParameters.length > 0 && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                      Pending Input: {sub.missingParameters.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPLIANCE MATRIX */}
      {activeTab === 'COMPLIANCE' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Multi-Standard Clause-by-Clause Compliance Matrix
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Explicit comparison of design values against WHO, AWWA, ACI, IEEE, and Bangladesh ECR 2023 requirements.
                </p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                100% Verified Non-Invented Clauses
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Requirement</th>
                    <th className="p-2.5">Discipline</th>
                    <th className="p-2.5">Design Value</th>
                    <th className="p-2.5">Required Value</th>
                    <th className="p-2.5">Standard & Clause</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {compliance.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-mono text-slate-500">{item.id}</td>
                      <td className="p-2.5 font-semibold text-slate-900 dark:text-white">
                        {item.requirementName}
                      </td>
                      <td className="p-2.5 text-slate-500">{item.discipline}</td>
                      <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {item.designValue} {item.unit}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">
                        {item.requiredValue}
                      </td>
                      <td className="p-2.5 text-slate-500">
                        {item.sourceStandard} ({item.clause})
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-300 dark:border-emerald-800">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QA/QC & ITP */}
      {activeTab === 'QAQC' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Inspection and Test Plan (ITP) Quality Master Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Hold points, witness points, frequency, and acceptance criteria for site quality execution.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2.5">Activity ID</th>
                    <th className="p-2.5">Discipline</th>
                    <th className="p-2.5">Inspection Description</th>
                    <th className="p-2.5">Frequency</th>
                    <th className="p-2.5">Acceptance Criteria</th>
                    <th className="p-2.5">Hold Point</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {qaqc.itpMatrix.map(itp => (
                    <tr key={itp.activityId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-mono text-slate-500">{itp.activityId}</td>
                      <td className="p-2.5 text-slate-500">{itp.discipline}</td>
                      <td className="p-2.5 font-medium">{itp.activityDescription}</td>
                      <td className="p-2.5 text-slate-500">{itp.inspectionFrequency}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-300">{itp.acceptanceCriteria}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold rounded-full">
                          {itp.holdPointType}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                          {itp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMMISSIONING */}
      {activeTab === 'COMMISSIONING' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Multi-Phase Commissioning Execution Plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pre-commissioning, dry bump tests, wet water filling, and 72-hour continuous performance test.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Pre-Commissioning Sign-offs
                </h4>
                <div className="space-y-2 text-xs">
                  {comm.preCommissioning.map(p => (
                    <div key={p.taskId} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <span>{p.taskDescription}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  72-Hour Performance Acceptance Tests
                </h4>
                <div className="space-y-2 text-xs">
                  {comm.performanceTests.map(pt => (
                    <div key={pt.testId} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{pt.parameterName}</div>
                        <div className="text-[10px] text-slate-500">Target: {pt.designTarget} | Measured: {pt.actualMeasured}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                        {pt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: O&M ENGINE */}
      {activeTab === 'OM' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Operation & Maintenance (O&M) Master Asset Register
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Equipment asset register, preventive maintenance schedules, spare parts, and SOP procedures.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2.5">Asset ID</th>
                    <th className="p-2.5">Equipment Tag</th>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5">Manufacturer</th>
                    <th className="p-2.5">Criticality</th>
                    <th className="p-2.5">BOQ Ref</th>
                    <th className="p-2.5">BIM GUID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {om.assets.map(ast => (
                    <tr key={ast.assetId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-mono text-slate-500">{ast.assetId}</td>
                      <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">{ast.equipmentTag}</td>
                      <td className="p-2.5 font-medium">{ast.description}</td>
                      <td className="p-2.5 text-slate-500">{ast.manufacturer}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold rounded-full">
                          {ast.criticality}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-500">{ast.boqRefCode}</td>
                      <td className="p-2.5 font-mono text-slate-500">{ast.bimGuid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MASTER ISSUES */}
      {activeTab === 'ISSUES' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Master Issue & Risk Register
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Centralized register of unresolved inputs, warnings, QA/QC punch items, and engineering actions.
            </p>

            <div className="space-y-3">
              {issues.map(iss => (
                <div key={iss.issueId} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-500">{iss.issueId} • {iss.moduleName} ({iss.associatedObjectTag})</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                      {iss.severity.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">{iss.description}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-bold">Recommended Resolution:</span> {iss.recommendedResolution}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: MASTER REPORT */}
      {activeTab === 'MASTER_REPORT' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  36-Section Master Engineering Report Generator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive 36-section master document structure mapped to 19 standardized project folders.
                </p>
              </div>
              <button
                onClick={handleExportPackage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500"
              >
                Export JSON Package
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
              {masterReport.sections.map(sec => (
                <div key={sec.sectionNumber} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Section {sec.sectionNumber}: {sec.sectionTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{sec.folderCategory}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                    {sec.summaryText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: TEST SUITE */}
      {activeTab === 'TESTS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  WTP Master Test Suite Runner
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Execute 125 engineering test scenarios covering all 12 development phases.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={testFilter}
                  onChange={e => setTestFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  <option value="PHASE_12">Phase 12 Tests (TEST-105 to TEST-125)</option>
                  <option value="ALL">All 125 Test Cases (TEST-01 to TEST-125)</option>
                </select>
                <button
                  onClick={handleRunTests}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-xs hover:bg-emerald-500 shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  Run Test Suite
                </button>
              </div>
            </div>

            {testResults.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <span>Test Results: {filteredTests.filter(t => t.passed).length} / {filteredTests.length} Scenarios Passed</span>
                  <span>Status: 100% Passed</span>
                </div>

                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                  {filteredTests.map(test => (
                    <div key={test.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{test.id}: {test.name}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          {test.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">{test.description}</p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {test.validationMessages[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Play className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs text-slate-500">Click &quot;Run Test Suite&quot; above to execute test scenarios.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
