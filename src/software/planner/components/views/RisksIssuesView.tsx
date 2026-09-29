import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ProjectIssue, ProjectRisk, RiskCategory, RiskStatus } from '../../types';
import { AlertTriangle, ShieldAlert, Plus, Trash2, CheckCircle } from 'lucide-react';

export const RisksIssuesView: React.FC = () => {
  const { project, addRisk, updateRisk, deleteRisk, addIssue, updateIssue, deleteIssue } = useProject();

  // Risk form
  const [riskDesc, setRiskDesc] = useState('');
  const [riskCat, setRiskCat] = useState<RiskCategory>('Technical');
  const [prob, setProb] = useState(3);
  const [imp, setImp] = useState(3);
  const [owner, setOwner] = useState('');
  const [mitigation, setMitigation] = useState('');

  // Issue form
  const [issueDesc, setIssueDesc] = useState('');
  const [issueOwner, setIssueOwner] = useState('');

  const handleAddRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskDesc.trim()) return;

    addRisk({
      code: `RSK-00${(project.risks || []).length + 1}`,
      description: riskDesc,
      category: riskCat,
      probability: prob,
      impact: imp,
      riskScore: prob * imp,
      owner: owner || 'Project Manager',
      mitigation: mitigation || 'Mitigation plan under evaluation.',
      status: 'Open',
    });

    setRiskDesc('');
    setMitigation('');
  };

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDesc.trim()) return;

    addIssue({
      code: `ISS-00${(project.issues || []).length + 1}`,
      description: issueDesc,
      priority: 'High',
      owner: issueOwner || 'Site Manager',
      dueDate: '2026-06-30',
      status: 'Open',
    });

    setIssueDesc('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 select-none font-sans">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Risk Matrix & Issue Management
              </h1>
              <p className="text-xs text-slate-400">
                Identify project risks, evaluate probability vs impact, and track corrective action resolution logs.
              </p>
            </div>
          </div>
        </div>

        {/* Risk Assessment Matrix Grid & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Risk Form */}
          <form
            onSubmit={handleAddRisk}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 text-xs"
          >
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Register New Project Risk</span>
            </h2>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Risk Description
              </label>
              <textarea
                rows={2}
                placeholder="Describe potential event, threat or delay driver..."
                value={riskDesc}
                onChange={(e) => setRiskDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Category
                </label>
                <select
                  value={riskCat}
                  onChange={(e) => setRiskCat(e.target.value as RiskCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 focus:outline-none"
                >
                  <option value="Technical">Technical</option>
                  <option value="Financial">Financial</option>
                  <option value="Safety">Safety</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Schedule">Schedule</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Probability (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={prob}
                  onChange={(e) => setProb(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 focus:outline-none text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Impact (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={imp}
                  onChange={(e) => setImp(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 focus:outline-none text-center font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Mitigation Strategy
              </label>
              <input
                type="text"
                placeholder="e.g. Advance procurement or sheet piling"
                value={mitigation}
                onChange={(e) => setMitigation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Risk</span>
            </button>
          </form>

          {/* Registered Risk Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Risk Log ({project.risks?.length || 0})</span>
            </h2>

            <div className="space-y-2.5 overflow-y-auto max-h-[350px] font-mono text-xs">
              {(project.risks || []).map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-amber-400">{r.code}</span>
                      <span className="text-slate-300 font-semibold">{r.description}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.riskScore >= 15
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      Score: {r.riskScore}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    <strong>Mitigation:</strong> {r.mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
