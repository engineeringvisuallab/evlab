import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { PROJECT_TEMPLATES } from '../../data/sampleProjects';
import { X, Briefcase, PlusCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Project } from '../../types';

export const ProjectWizardModal: React.FC = () => {
  const { isWizardOpen, setIsWizardOpen, loadProjectTemplate } = useProject();

  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl-wtp');
  const [customName, setCustomName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customClient, setCustomClient] = useState('');
  const [customStartDate, setCustomStartDate] = useState('2026-03-01');

  if (!isWizardOpen) return null;

  const handleCreateProject = () => {
    const template = PROJECT_TEMPLATES.find((t) => t.id === selectedTemplateId);

    if (template && template.projectData) {
      const newProj: Project = {
        ...template.projectData,
        id: `proj-${Date.now()}`,
        name: customName || template.projectData.name,
        code: customCode || template.projectData.code,
        client: customClient || template.projectData.client,
        startDate: customStartDate || template.projectData.startDate,
        createdDate: new Date().toISOString(),
      };
      loadProjectTemplate(newProj);
    } else {
      // Empty Project
      const emptyProj: Project = {
        id: `proj-${Date.now()}`,
        name: customName || 'New Engineering Project',
        code: customCode || 'PRJ-2026-001',
        client: customClient || 'Municipal Client',
        projectManager: 'Lead Engineer',
        organization: 'EVLab Engineering',
        startDate: customStartDate || '2026-03-01',
        plannedCompletionDate: '2026-12-31',
        calculatedFinishDate: '2026-12-31',
        workingCalendarId: 'standard',
        currency: '$',
        defaultHoursPerDay: 8,
        description: 'Empty custom engineering project.',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        settings: {
          currencySymbol: '$',
          currencyCode: 'USD',
          dateFormat: 'YYYY-MM-DD',
          autoSchedule: true,
          highlightCriticalPath: true,
          showBaselineGantt: true,
          defaultHoursPerDay: 8,
        },
        calendars: [],
        resources: [],
        resourceAssignments: [],
        baselines: [],
        risks: [],
        issues: [],
        tasks: [],
      };
      loadProjectTemplate(emptyProj);
    }

    setIsWizardOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="h-14 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-black text-sm">
              EV
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Project Creation Wizard</h2>
              <p className="text-[11px] text-slate-400">
                Start from engineering industry templates or build custom project from scratch
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWizardOpen(false)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans">
          {/* Template Selection Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              1. Select Project Engineering Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PROJECT_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md'
                        : 'bg-slate-950 border-slate-800/90 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-100">{tpl.name}</span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-cyan-400 font-mono">
                          {tpl.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{tpl.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Metadata Overrides */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              2. Customize Project Properties
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Project Name Override</label>
                <input
                  type="text"
                  placeholder="e.g. Water Treatment Plant Expansion Phase 2"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Project Code / ID</label>
                <input
                  type="text"
                  placeholder="e.g. WTP-2026-001"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Client Authority</label>
                <input
                  type="text"
                  placeholder="e.g. Municipal Authority"
                  value={customClient}
                  onChange={(e) => setCustomClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Project Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="h-16 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-end space-x-3">
          <button
            onClick={() => setIsWizardOpen(false)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            Cancel
          </button>

          <button
            onClick={handleCreateProject}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center space-x-2 shadow-lg"
          >
            <span>Initialize Project</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
