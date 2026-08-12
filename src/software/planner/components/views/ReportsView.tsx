import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { FileSpreadsheet, Printer, Download, CheckCircle, Activity, DollarSign, Users } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { project, setIsExportModalOpen } = useProject();

  const [activeReportTab, setActiveReportTab] = useState<
    'summary' | 'tasks' | 'cpm' | 'wbs' | 'resources'
  >('summary');

  const totalCost = project.tasks.reduce((sum, t) => sum + (t.totalCost || 0), 0);
  const criticalTasks = project.tasks.filter((t) => t.isCritical && !t.isSummary);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 select-none font-sans print:p-0 print:bg-white print:text-black">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Project Executive Reports & PDF Generator
              </h1>
              <p className="text-xs text-slate-400">
                Generate formal engineering report documents, printable Gantt schedules, and cost audit sheets.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded text-xs transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded text-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV / Excel</span>
            </button>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs print:hidden">
          {[
            { id: 'summary', label: 'Executive Summary' },
            { id: 'tasks', label: 'Detailed Task Schedule' },
            { id: 'cpm', label: 'Critical Path Analysis' },
            { id: 'wbs', label: 'WBS Cost Breakdown' },
            { id: 'resources', label: 'Resource Utilization' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeReportTab === tab.id
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PRINTABLE REPORT SHEET CONTENT */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6 print:border-none print:shadow-none print:p-0 print:text-black">
          {/* Report Header Logo & Info */}
          <div className="flex justify-between border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-2xl font-black text-cyan-400 print:text-black">{project.name}</h2>
              <p className="text-xs text-slate-400 print:text-slate-700">{project.description}</p>
              <div className="text-xs font-mono text-slate-400 mt-2 print:text-slate-800">
                Client: {project.client} | Project Manager: {project.projectManager}
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="font-bold text-slate-200 print:text-black">EVLab Project Planner</div>
              <div className="text-cyan-400 font-bold print:text-black">{project.code}</div>
              <div className="text-slate-400 print:text-slate-600">
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Executive Summary Section */}
          {activeReportTab === 'summary' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 print:text-black">
                1. Project Key Metrics Summary
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-slate-500 block text-[10px]">Start Date</span>
                  <span className="font-bold text-slate-200">{project.startDate}</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-slate-500 block text-[10px]">Target Finish</span>
                  <span className="font-bold text-emerald-400">{project.calculatedFinishDate}</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-slate-500 block text-[10px]">Total Budget</span>
                  <span className="font-bold text-amber-300">
                    {project.currency}
                    {totalCost.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-slate-500 block text-[10px]">Critical Tasks</span>
                  <span className="font-bold text-rose-400">{criticalTasks.length}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 pt-4 print:text-black">
                2. Major Work Packages (WBS Level 0)
              </h3>

              <div className="font-mono text-xs divide-y divide-slate-800 border border-slate-800 rounded overflow-hidden">
                {project.tasks
                  .filter((t) => t.level === 0)
                  .map((t) => (
                    <div key={t.id} className="p-3 flex justify-between items-center bg-slate-950">
                      <div>
                        <span className="font-bold text-cyan-400 mr-2">WBS {t.wbs}</span>
                        <span className="font-semibold text-slate-200">{t.name}</span>
                      </div>
                      <div className="space-x-6 text-slate-400">
                        <span>{t.startDate} → {t.finishDate}</span>
                        <span className="font-bold text-emerald-400">{t.percentComplete}% Done</span>
                        <span className="font-bold text-amber-300">
                          {project.currency}
                          {(t.totalCost || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Detailed Task Report Tab */}
          {activeReportTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 print:text-black">
                Detailed Master Task Schedule
              </h3>
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2">WBS</th>
                    <th className="p-2">Task Name</th>
                    <th className="p-2 text-center">Dur</th>
                    <th className="p-2 text-center">Start</th>
                    <th className="p-2 text-center">Finish</th>
                    <th className="p-2 text-center">% Done</th>
                    <th className="p-2 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {project.tasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="p-2 font-bold text-cyan-400">{t.wbs}</td>
                      <td className="p-2">{t.name}</td>
                      <td className="p-2 text-center">{t.duration}d</td>
                      <td className="p-2 text-center text-slate-400">{t.startDate}</td>
                      <td className="p-2 text-center text-slate-400">{t.finishDate}</td>
                      <td className="p-2 text-center font-bold text-emerald-400">
                        {t.percentComplete}%
                      </td>
                      <td className="p-2 text-right font-bold text-slate-200">
                        {(t.totalCost || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
