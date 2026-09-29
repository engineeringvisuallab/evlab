import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { GitFork, ChevronRight, ChevronDown, Folder, FileText, CheckCircle } from 'lucide-react';

export const WBSView: React.FC = () => {
  const { project } = useProject();

  // Calculate WBS summary statistics
  const topLevelWBS = project.tasks.filter((t) => t.level === 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 select-none">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Work Breakdown Structure (WBS) Engine
              </h1>
              <p className="text-xs text-slate-400">
                Hierarchical breakdown of engineering deliverables, work packages, and summary costs.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
            <div>
              <span className="text-slate-500">Root Packages:</span>{' '}
              <span className="font-bold text-cyan-400">{topLevelWBS.length}</span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500">Total Work Items:</span>{' '}
              <span className="font-bold text-slate-200">{project.tasks.length}</span>
            </div>
          </div>
        </div>

        {/* WBS Tree Hierarchy Cards */}
        <div className="space-y-4">
          {topLevelWBS.map((rootTask) => {
            // Find all children under this root
            const rootIndex = project.tasks.findIndex((t) => t.id === rootTask.id);
            const children = [];
            for (let i = rootIndex + 1; i < project.tasks.length; i++) {
              if (project.tasks[i].level > rootTask.level) {
                children.push(project.tasks[i]);
              } else {
                break;
              }
            }

            return (
              <div
                key={rootTask.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg"
              >
                {/* WBS Package Header */}
                <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sm bg-cyan-950 text-cyan-400 px-2.5 py-1 rounded border border-cyan-800/80">
                      WBS {rootTask.wbs}
                    </span>
                    <Folder className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm font-bold text-slate-100">{rootTask.name}</h2>
                  </div>

                  <div className="flex items-center space-x-6 text-xs font-mono">
                    <div>
                      <span className="text-slate-400">Duration: </span>
                      <span className="font-semibold text-slate-200">{rootTask.duration} days</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Dates: </span>
                      <span className="text-slate-300">
                        {rootTask.startDate} → {rootTask.finishDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Progress: </span>
                      <span className="font-bold text-emerald-400">{rootTask.percentComplete}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Cost: </span>
                      <span className="font-bold text-amber-300">
                        {project.currency}
                        {(rootTask.totalCost || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Children Work Packages Table */}
                <div className="divide-y divide-slate-800/60 font-mono text-xs">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <div style={{ width: `${(child.level - 1) * 20}px` }} />
                        <span className="font-semibold text-cyan-500 w-16">{child.wbs}</span>
                        {child.isSummary ? (
                          <Folder className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span
                          className={`truncate max-w-md ${
                            child.isSummary ? 'font-bold text-slate-200' : 'text-slate-300'
                          }`}
                        >
                          {child.name}
                        </span>
                      </div>

                      <div className="flex items-center space-x-6 text-[11px] text-slate-400">
                        <span className="w-16 text-center">{child.duration}d</span>
                        <span className="w-20 text-center">{child.startDate}</span>
                        <span className="w-20 text-center">{child.finishDate}</span>
                        <span className="w-12 text-center font-bold text-cyan-400">
                          {child.percentComplete}%
                        </span>
                        <span className="w-24 text-right font-semibold text-slate-200">
                          {project.currency}
                          {(child.totalCost || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
