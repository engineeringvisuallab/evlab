import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ConstraintType, DependencyType, EngineeringDiscipline, TaskPriority, TaskStatus } from '../../types';
import { X, Trash2, Plus, Users, Link, FileText, Settings, HardHat, FileSpreadsheet } from 'lucide-react';

type TabType = 'general' | 'predecessors' | 'successors' | 'resources' | 'advanced' | 'engineering' | 'documents';

export const TaskDetailsModal: React.FC = () => {
  const {
    project,
    editingTaskId,
    isTaskModalOpen,
    setIsTaskModalOpen,
    updateTask,
    deleteTask,
  } = useProject();

  const task = project.tasks.find((t) => t.id === editingTaskId);

  const [activeTab, setActiveTab] = useState<TabType>('general');

  // Form State
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(5);
  const [startDate, setStartDate] = useState('');
  const [percentComplete, setPercentComplete] = useState(0);
  const [physicalPercent, setPhysicalPercent] = useState(0);
  const [status, setStatus] = useState<TaskStatus>('Not Started');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [isMilestone, setIsMilestone] = useState(false);
  const [fixedCost, setFixedCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  // Advanced & Constraint
  const [constraintType, setConstraintType] = useState<ConstraintType>('ASAP');
  const [constraintDate, setConstraintDate] = useState('');

  // Engineering & Site
  const [discipline, setDiscipline] = useState<EngineeringDiscipline>('General');
  const [drawingRef, setDrawingRef] = useState('');
  const [boqCode, setBoqCode] = useState('');
  const [boqUnit, setBoqUnit] = useState('');
  const [plannedQty, setPlannedQty] = useState(0);
  const [installedQty, setInstalledQty] = useState(0);
  const [subcontractor, setSubcontractor] = useState('');

  // Documents
  const [docTitle, setDocTitle] = useState('');
  const [docNum, setDocNum] = useState('');
  const [docRev, setDocRev] = useState('A');

  // Predecessor states
  const [predTaskId, setPredTaskId] = useState('');
  const [predType, setPredType] = useState<DependencyType>('FS');
  const [predLag, setPredLag] = useState(0);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDuration(task.duration);
      setStartDate(task.startDate);
      setPercentComplete(task.percentComplete);
      setPhysicalPercent(task.physicalPercentComplete || task.percentComplete);
      setStatus(task.status);
      setPriority(task.priority);
      setIsMilestone(task.isMilestone || false);
      setFixedCost(task.fixedCost || 0);
      setNotes(task.notes || '');
      setSelectedResources(task.resourceIds || []);
      setConstraintType(task.constraintType || 'ASAP');
      setConstraintDate(task.constraintDate || '');
      setDiscipline(task.discipline || 'General');
      setDrawingRef(task.drawingRef || '');
      setBoqCode(task.boqCode || '');
      setBoqUnit(task.boqUnit || '');
      setPlannedQty(task.plannedQty || 0);
      setInstalledQty(task.installedQty || 0);
      setSubcontractor(task.subcontractor || '');
    }
  }, [task]);

  if (!isTaskModalOpen || !task) return null;

  const handleSave = () => {
    updateTask(task.id, {
      name,
      duration: isMilestone ? 0 : duration,
      startDate,
      percentComplete,
      physicalPercentComplete: physicalPercent,
      status,
      priority,
      isMilestone,
      fixedCost,
      notes,
      resourceIds: selectedResources,
      constraintType,
      constraintDate: constraintDate || undefined,
      discipline,
      drawingRef,
      boqCode,
      boqUnit,
      plannedQty,
      installedQty,
      subcontractor,
    });
    setIsTaskModalOpen(false);
  };

  const toggleResource = (rId: string) => {
    if (selectedResources.includes(rId)) {
      setSelectedResources(selectedResources.filter((id) => id !== rId));
    } else {
      setSelectedResources([...selectedResources, rId]);
    }
  };

  const handleAddPredecessor = () => {
    if (!predTaskId || predTaskId === task.id) return;
    const existing = task.predecessors || [];
    if (existing.some((p) => p.taskId === predTaskId)) return;

    const newPreds = [...existing, { taskId: predTaskId, type: predType, lagDays: predLag }];
    updateTask(task.id, { predecessors: newPreds });
    setPredTaskId('');
    setPredLag(0);
  };

  const handleRemovePredecessor = (pId: string) => {
    const newPreds = (task.predecessors || []).filter((p) => p.taskId !== pId);
    updateTask(task.id, { predecessors: newPreds });
  };

  const handleAddDocument = () => {
    if (!docTitle || !docNum) return;
    const existingDocs = task.documents || [];
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: docTitle,
      docNumber: docNum,
      revision: docRev,
      type: 'Drawing' as const,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    updateTask(task.id, { documents: [...existingDocs, newDoc] });
    setDocTitle('');
    setDocNum('');
    setDocRev('A');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="h-14 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-cyan-400 font-bold text-xs bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              WBS {task.wbs}
            </span>
            <h2 className="text-sm font-bold text-slate-100 truncate max-w-md">{task.name}</h2>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(false)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center space-x-1 bg-slate-950 border-b border-slate-800 px-4 pt-2 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-2 rounded-t-lg font-bold flex items-center space-x-1.5 transition ${
              activeTab === 'general'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>General</span>
          </button>

          <button
            onClick={() => setActiveTab('predecessors')}
            className={`px-3 py-2 rounded-t-lg font-bold flex items-center space-x-1.5 transition ${
              activeTab === 'predecessors'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Predecessors ({task.predecessors?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('successors')}
            className={`px-3 py-2 rounded-t-lg font-bold flex items-center space-x-1.5 transition ${
              activeTab === 'successors'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5 rotate-180" />
            <span>Successors ({task.successors?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-2 rounded-t-lg font-bold flex items-center space-x-1.5 transition ${
              activeTab === 'resources'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Resources ({selectedResources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-3 py-2 rounded-t-lg font-bold flex items-center space-x-1.5 transition ${
              activeTab === 'advanced'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Advanced & CPM</span>
          </button>

          <button
            onClick={() => setActiveTab('engineering')}
            className={`px-3 py-2 rounded-t-lg font-bold flex items-center space-x-1.5 transition ${
              activeTab === 'engineering'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Engineering & BOQ</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-2 rounded-t-lg font-bold flex items-center space-x-1.5 transition ${
              activeTab === 'documents'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Documents ({task.documents?.length || 0})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-sans min-h-[380px]">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Task Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2 col-span-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMilestone}
                    onChange={(e) => setIsMilestone(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <span className="text-slate-200 font-bold">Is Milestone (Zero Duration)</span>
                </label>
              </div>

              {!isMilestone && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Duration (Working Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-slate-100 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Schedule Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={percentComplete}
                  onChange={(e) => setPercentComplete(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-cyan-400 font-bold focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Physical Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={physicalPercent}
                  onChange={(e) => setPhysicalPercent(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-emerald-400 font-bold focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-slate-100 focus:outline-none"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-slate-100 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Task Notes & Remarks</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter engineering notes, site access constraints..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded p-3 text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* PREDECESSORS TAB */}
          {activeTab === 'predecessors' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-200">Add Predecessor Dependency</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={predTaskId}
                    onChange={(e) => setPredTaskId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                  >
                    <option value="">Select Task...</option>
                    {project.tasks
                      .filter((t) => t.id !== task.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          WBS {t.wbs} - {t.name}
                        </option>
                      ))}
                  </select>

                  <select
                    value={predType}
                    onChange={(e) => setPredType(e.target.value as DependencyType)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 font-bold"
                  >
                    <option value="FS">FS</option>
                    <option value="SS">SS</option>
                    <option value="FF">FF</option>
                    <option value="SF">SF</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Lag (Days)"
                    value={predLag}
                    onChange={(e) => setPredLag(parseInt(e.target.value) || 0)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-2 text-slate-200 font-mono"
                  />

                  <button
                    type="button"
                    onClick={handleAddPredecessor}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded font-bold"
                  >
                    Link
                  </button>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">WBS</th>
                      <th className="p-2.5">Predecessor Task Name</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Lag/Lead</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {(task.predecessors || []).map((p) => {
                      const pred = project.tasks.find((t) => t.id === p.taskId);
                      return (
                        <tr key={p.taskId} className="hover:bg-slate-950/50">
                          <td className="p-2.5 font-bold text-cyan-400">{pred?.wbs}</td>
                          <td className="p-2.5 text-slate-200">{pred?.name}</td>
                          <td className="p-2.5 text-amber-400 font-bold">{p.type}</td>
                          <td className="p-2.5 text-slate-300">{p.lagDays}d</td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleRemovePredecessor(p.taskId)}
                              className="text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUCCESSORS TAB */}
          {activeTab === 'successors' && (
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">WBS</th>
                    <th className="p-2.5">Successor Task Name</th>
                    <th className="p-2.5">Relationship</th>
                    <th className="p-2.5">Lag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {(task.successors || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500">
                        No successor tasks currently linked.
                      </td>
                    </tr>
                  ) : (
                    (task.successors || []).map((s) => {
                      const succ = project.tasks.find((t) => t.id === s.taskId);
                      return (
                        <tr key={s.taskId} className="hover:bg-slate-950/50">
                          <td className="p-2.5 font-bold text-cyan-400">{succ?.wbs}</td>
                          <td className="p-2.5 text-slate-200">{succ?.name}</td>
                          <td className="p-2.5 text-emerald-400 font-bold">{s.type}</td>
                          <td className="p-2.5 text-slate-300">{s.lagDays}d</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* RESOURCES TAB */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-200">Assigned Project Resources</h3>
              <div className="grid grid-cols-2 gap-3">
                {project.resources.map((res) => {
                  const isAssigned = selectedResources.includes(res.id);
                  return (
                    <label
                      key={res.id}
                      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer border transition ${
                        isAssigned
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={() => toggleResource(res.id)}
                        className="accent-cyan-500"
                      />
                      <div>
                        <div className="font-bold text-slate-100">{res.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {res.role} • ${res.standardRate}/hr
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ADVANCED & CPM TAB */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Constraint Type</label>
                  <select
                    value={constraintType}
                    onChange={(e) => setConstraintType(e.target.value as ConstraintType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="ASAP">As Soon As Possible (ASAP)</option>
                    <option value="ALAP">As Late As Possible (ALAP)</option>
                    <option value="MSO">Must Start On (MSO)</option>
                    <option value="MFO">Must Finish On (MFO)</option>
                    <option value="SNET">Start No Earlier Than (SNET)</option>
                    <option value="FNET">Finish No Earlier Than (FNET)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Constraint Date</label>
                  <input
                    type="date"
                    value={constraintDate}
                    onChange={(e) => setConstraintDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Calculated CPM Stats Readout */}
              <div className="grid grid-cols-4 gap-3 bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-center">
                <div className="p-2 bg-slate-900 rounded">
                  <div className="text-[10px] text-slate-500">Early Start (ES)</div>
                  <div className="text-cyan-400 font-bold">{task.earlyStart}</div>
                </div>
                <div className="p-2 bg-slate-900 rounded">
                  <div className="text-[10px] text-slate-500">Early Finish (EF)</div>
                  <div className="text-cyan-400 font-bold">{task.earlyFinish}</div>
                </div>
                <div className="p-2 bg-slate-900 rounded">
                  <div className="text-[10px] text-slate-500">Late Start (LS)</div>
                  <div className="text-amber-400 font-bold">{task.lateStart}</div>
                </div>
                <div className="p-2 bg-slate-900 rounded">
                  <div className="text-[10px] text-slate-500">Late Finish (LF)</div>
                  <div className="text-amber-400 font-bold">{task.lateFinish}</div>
                </div>
                <div className="p-2 bg-slate-900 rounded col-span-2">
                  <div className="text-[10px] text-slate-500">Total Float</div>
                  <div className="text-emerald-400 font-bold">{task.totalFloat} working days</div>
                </div>
                <div className="p-2 bg-slate-900 rounded col-span-2">
                  <div className="text-[10px] text-slate-500">Critical Path Status</div>
                  <div className={`font-bold ${task.isCritical ? 'text-rose-400' : 'text-slate-400'}`}>
                    {task.isCritical ? 'CRITICAL TASK' : 'Non-Critical'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ENGINEERING & BOQ TAB */}
          {activeTab === 'engineering' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Engineering Discipline</label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value as EngineeringDiscipline)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-slate-100 font-bold"
                >
                  <option value="Civil">Civil</option>
                  <option value="Structural">Structural</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Piping">Piping</option>
                  <option value="I&C">I&C (Instrumentation & Control)</option>
                  <option value="Architectural">Architectural</option>
                  <option value="Commissioning">Commissioning</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Drawing / Specification Ref</label>
                <input
                  type="text"
                  value={drawingRef}
                  onChange={(e) => setDrawingRef(e.target.value)}
                  placeholder="e.g. DWG-WTP-CIV-004"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Bill of Quantities (BOQ) Code</label>
                <input
                  type="text"
                  value={boqCode}
                  onChange={(e) => setBoqCode(e.target.value)}
                  placeholder="e.g. BOQ-CONC-012"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Unit of Measure</label>
                <input
                  type="text"
                  value={boqUnit}
                  onChange={(e) => setBoqUnit(e.target.value)}
                  placeholder="e.g. m³, tons, meters, units"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Planned Quantity</label>
                <input
                  type="number"
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Installed / Progressed Quantity</label>
                <input
                  type="number"
                  value={installedQty}
                  onChange={(e) => setInstalledQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-emerald-400 font-bold font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Subcontractor / Vendor Name</label>
                <input
                  type="text"
                  value={subcontractor}
                  onChange={(e) => setSubcontractor(e.target.value)}
                  placeholder="e.g. Apex Civil Works Ltd."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-slate-100"
                />
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-200">Attach Drawing / Specification</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Doc Title (e.g., Structural Foundation Detail)"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Doc Number"
                    value={docNum}
                    onChange={(e) => setDocNum(e.target.value)}
                    className="w-36 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Rev"
                    value={docRev}
                    onChange={(e) => setDocRev(e.target.value)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-2 text-slate-200 font-mono text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded font-bold"
                  >
                    Attach
                  </button>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Doc Number</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Revision</th>
                      <th className="p-2.5">Attached Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {(task.documents || []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500">
                          No document references attached yet.
                        </td>
                      </tr>
                    ) : (
                      (task.documents || []).map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-950/50">
                          <td className="p-2.5 font-bold text-cyan-400">{doc.docNumber}</td>
                          <td className="p-2.5 text-slate-200">{doc.title}</td>
                          <td className="p-2.5 text-amber-400 font-bold">{doc.revision}</td>
                          <td className="p-2.5 text-slate-400">{doc.updatedAt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-16 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-between">
          <button
            onClick={() => {
              deleteTask(task.id);
              setIsTaskModalOpen(false);
            }}
            className="flex items-center space-x-1 text-rose-400 hover:bg-rose-950/60 px-3 py-1.5 rounded transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Task</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
