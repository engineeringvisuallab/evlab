import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Resource, ResourceType } from '../../types';
import { Users, Plus, Trash2, AlertTriangle, CheckCircle2, DollarSign, HardHat } from 'lucide-react';

export const ResourceView: React.FC = () => {
  const { project, addResource, updateResource, deleteResource } = useProject();

  const [newResName, setNewResName] = useState('');
  const [newResType, setNewResType] = useState<ResourceType>('Work');
  const [newResRole, setNewResRole] = useState('');
  const [newResRate, setNewResRate] = useState(75);

  const handleAddResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResName.trim()) return;

    addResource({
      name: newResName,
      type: newResType,
      role: newResRole || 'General Staff',
      unit: newResType === 'Material' ? 'units' : 'hrs',
      maxUnits: 1.0,
      standardRate: newResRate,
      overtimeRate: newResRate * 1.5,
      costPerUse: 0,
      availability: '100%',
      calendarId: 'standard',
    });

    setNewResName('');
    setNewResRole('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 select-none">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Resource Management & Workload Analysis
              </h1>
              <p className="text-xs text-slate-400">
                Define labor, materials, machinery rates, and track utilization across task assignments.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-cyan-400">
            {project.resources.length} Registered Resources
          </span>
        </div>

        {/* Add Resource Quick Bar */}
        <form
          onSubmit={handleAddResourceSubmit}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-3 text-xs"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Resource Name
            </label>
            <input
              type="text"
              placeholder="e.g., Mechanical Engineer, Excavator 30T, Concrete"
              value={newResName}
              onChange={(e) => setNewResName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="w-32">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type</label>
            <select
              value={newResType}
              onChange={(e) => setNewResType(e.target.value as ResourceType)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2 py-1.5 text-slate-100 focus:outline-none"
            >
              <option value="Work">Work (Labor)</option>
              <option value="Equipment">Equipment</option>
              <option value="Material">Material</option>
              <option value="Cost">Cost Item</option>
            </select>
          </div>

          <div className="w-40">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role/Trade</label>
            <input
              type="text"
              placeholder="e.g. Civil Works"
              value={newResRole}
              onChange={(e) => setNewResRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-1.5 text-slate-100 focus:outline-none"
            />
          </div>

          <div className="w-28">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Std Rate ({project.currency})
            </label>
            <input
              type="number"
              value={newResRate}
              onChange={(e) => setNewResRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2 py-1.5 text-slate-100 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-1.5 rounded transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </form>

        {/* Resource Sheet Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Resource Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-center">Max Units</th>
                <th className="p-3 text-right">Standard Rate</th>
                <th className="p-3 text-right">Overtime Rate</th>
                <th className="p-3 text-center">Availability</th>
                <th className="p-3 text-center">Assigned Tasks</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {project.resources.map((res) => {
                // Find task assignments
                const assignedTasks = project.tasks.filter((t) => t.resourceIds?.includes(res.id));

                return (
                  <tr key={res.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-bold text-slate-200 flex items-center space-x-2">
                      <HardHat className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{res.name}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          res.type === 'Work'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : res.type === 'Equipment'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : res.type === 'Material'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}
                      >
                        {res.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{res.role}</td>
                    <td className="p-3 text-center text-slate-300">
                      {(res.maxUnits * 100).toFixed(0)}%
                    </td>
                    <td className="p-3 text-right font-bold text-slate-200">
                      {project.currency}
                      {res.standardRate}/{res.unit}
                    </td>
                    <td className="p-3 text-right text-slate-400">
                      {project.currency}
                      {res.overtimeRate}/{res.unit}
                    </td>
                    <td className="p-3 text-center text-emerald-400 font-bold">{res.availability}</td>
                    <td className="p-3 text-center">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                        {assignedTasks.length} tasks
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => deleteResource(res.id)}
                        className="p-1 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
