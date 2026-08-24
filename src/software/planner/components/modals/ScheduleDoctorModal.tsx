import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { auditScheduleDCMA } from '../../engine/dcmaEngine';
import { X, Stethoscope, CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const ScheduleDoctorModal: React.FC = () => {
  const { project, isScheduleDoctorOpen, setIsScheduleDoctorOpen, updateTask, recalculateProjectSchedule } = useProject();

  const audit = auditScheduleDCMA(project);
  const [activeCheckId, setActiveCheckId] = useState<string>('c1');

  if (!isScheduleDoctorOpen) return null;

  const activeCheck = audit.checks.find((c) => c.id === activeCheckId) || audit.checks[0];

  const handleAutoFixCheck = (checkId: string) => {
    if (checkId === 'c1') {
      // Auto-link tasks missing predecessors to project start / preceding task
      const missingTasks = activeCheck.failingTasks;
      if (missingTasks.length > 0 && project.tasks.length > 1) {
        missingTasks.forEach((fTask) => {
          const tIdx = project.tasks.findIndex((t) => t.id === fTask.id);
          if (tIdx > 0) {
            const predTask = project.tasks[tIdx - 1];
            updateTask(fTask.id, { predecessors: [{ taskId: predTask.id, type: 'FS', lagDays: 0 }] });
          }
        });
      }
    } else if (checkId === 'c3') {
      // Fix negative lags (leads) by resetting lag to 0
      project.tasks.forEach((t) => {
        if (t.predecessors?.some((p) => p.lagDays < 0)) {
          const cleanedPreds = t.predecessors.map((p) => ({ ...p, lagDays: Math.max(0, p.lagDays) }));
          updateTask(t.id, { predecessors: cleanedPreds });
        }
      });
    } else if (checkId === 'c6') {
      // Remove hard constraints MSO/MFO -> ASAP
      project.tasks.forEach((t) => {
        if (t.constraintType === 'MSO' || t.constraintType === 'MFO') {
          updateTask(t.id, { constraintType: 'ASAP', constraintDate: undefined });
        }
      });
    }
    recalculateProjectSchedule();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded-xl">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>DCMA 14-Point Schedule Audit ("Schedule Doctor")</span>
              </h2>
              <p className="text-xs text-slate-400">Industry-standard schedule health diagnostic & network integrity engine</p>
            </div>
          </div>
          <button
            onClick={() => setIsScheduleDoctorOpen(false)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Scorecard Top Banner */}
        <div className="bg-slate-950 border-b border-slate-800 p-6 grid grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                audit.overallPassRate >= 85
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : audit.overallPassRate >= 70
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {audit.overallPassRate}%
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Overall Audit Score</div>
              <div className="text-sm font-bold text-slate-100">
                {audit.overallPassRate >= 85 ? 'High Quality Schedule' : audit.overallPassRate >= 70 ? 'Moderate Integrity' : 'Critical Logic Errors'}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
            <div className="p-3 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Checks Passed</div>
              <div className="text-sm font-bold text-slate-100">
                {audit.checks.filter((c) => c.status === 'PASS').length} of {audit.checks.length} Rules
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
            <div className="p-3 bg-rose-950 text-rose-400 rounded-xl border border-rose-800">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Failing Tasks</div>
              <div className="text-sm font-bold text-rose-400">{audit.totalErrorsCount} Items</div>
            </div>
          </div>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Rules Sidebar */}
          <div className="w-80 border-r border-slate-800 overflow-y-auto p-3 space-y-1 bg-slate-950">
            {audit.checks.map((check) => (
              <button
                key={check.id}
                onClick={() => setActiveCheckId(check.id)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between text-xs ${
                  activeCheckId === check.id
                    ? 'bg-slate-900 border-cyan-500 text-slate-100 shadow-md'
                    : 'border-transparent hover:bg-slate-900/60 text-slate-400'
                }`}
              >
                <div>
                  <div className="font-mono text-[10px] text-cyan-400 font-bold">{check.code}</div>
                  <div className="font-bold text-slate-200">{check.name}</div>
                  <div className="text-[10px] text-slate-500">
                    Target ≤{check.targetPct}% • Actual {check.actualPct}%
                  </div>
                </div>

                <div>
                  {check.status === 'PASS' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {check.status === 'WARN' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {check.status === 'FAIL' && <XCircle className="w-4 h-4 text-rose-400" />}
                </div>
              </button>
            ))}
          </div>

          {/* Rule Detail & Failing Tasks List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {activeCheck.code}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">{activeCheck.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeCheck.description}</p>
              </div>

              {(activeCheck.id === 'c1' || activeCheck.id === 'c3' || activeCheck.id === 'c6') &&
                activeCheck.failingTasks.length > 0 && (
                  <button
                    onClick={() => handleAutoFixCheck(activeCheck.id)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-cyan-950"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Auto-Fix Logic</span>
                  </button>
                )}
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Failing Tasks ({activeCheck.failingTasks.length})
              </h4>

              {activeCheck.failingTasks.length === 0 ? (
                <div className="p-8 border border-emerald-900/50 bg-emerald-950/20 rounded-xl text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-sm font-bold text-emerald-300">100% Compliant</div>
                  <div className="text-xs text-emerald-400/80">No failing tasks detected for this DCMA rule.</div>
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 font-mono text-xs">
                  {activeCheck.failingTasks.map((ft) => (
                    <div key={ft.id} className="p-3 bg-slate-950 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-cyan-400 mr-2">WBS {ft.wbs}</span>
                        <span className="text-slate-200 font-semibold">{ft.name}</span>
                        <div className="text-[11px] text-rose-400/90 mt-0.5">{ft.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-16 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Schedule Doctor runs real-time Critical Path Method (CPM) validation.
          </div>
          <button
            onClick={() => setIsScheduleDoctorOpen(false)}
            className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
