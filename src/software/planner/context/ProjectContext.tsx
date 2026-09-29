import React, { createContext, useContext, useEffect, useState } from 'react';
import { WATER_TREATMENT_PLANT_PROJECT } from '../data/sampleProjects';
import { DEFAULT_CALENDAR, formatDate } from '../engine/calendarUtils';

import { calculateSchedule } from '../engine/schedulingEngine';
import { levelResources } from '../engine/resourceEngine';
import { indentTask, moveTask, outdentTask, recalculateWBS } from '../engine/wbsEngine';
import {
  AppView,
  BaselineSnapshot,
  Project,
  ProjectIssue,
  ProjectRisk,
  Resource,
  Task,
} from '../types';

interface ProjectContextType {
  project: Project;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // History Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Project operations
  updateProject: (updated: Partial<Project>) => void;
  loadProjectTemplate: (newProject: Project) => void;
  recalculateProjectSchedule: () => void;

  // Task operations
  addTask: (newTaskPartial?: Partial<Task>, parentTaskId?: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  deleteMultipleTasks: (taskIds: string[]) => void;
  duplicateTask: (taskId: string) => void;
  indentTaskItem: (taskId: string) => void;
  outdentTaskItem: (taskId: string) => void;
  moveTaskItem: (taskId: string, direction: 'up' | 'down') => void;
  toggleTaskCollapse: (taskId: string) => void;

  // Baseline
  saveBaseline: (name: string, description: string) => void;

  // Resource operations
  addResource: (resource: Omit<Resource, 'id'>) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  levelProjectResources: () => { levelledTaskCount: number; resolvedOverallocationsCount: number };

  // Risk & Issue operations
  addRisk: (risk: Omit<ProjectRisk, 'id'>) => void;
  updateRisk: (id: string, updates: Partial<ProjectRisk>) => void;
  deleteRisk: (id: string) => void;

  addIssue: (issue: Omit<ProjectIssue, 'id'>) => void;
  updateIssue: (id: string, updates: Partial<ProjectIssue>) => void;
  deleteIssue: (id: string) => void;

  // Selected task in UI
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;

  // Modals
  isWizardOpen: boolean;
  setIsWizardOpen: (open: boolean) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isScheduleDoctorOpen: boolean;
  setIsScheduleDoctorOpen: (open: boolean) => void;
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
}

const STORAGE_KEY = 'evlab_project_planner_data_v1';
const THEME_KEY = 'evlab_theme_dark';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved project or fallback to Water Treatment Plant demo
  const [project, setProject] = useState<Project>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.tasks && parsed.name) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
    // Calculate initial schedule
    const sched = calculateSchedule(
      WATER_TREATMENT_PLANT_PROJECT.tasks,
      WATER_TREATMENT_PLANT_PROJECT.startDate,
      WATER_TREATMENT_PLANT_PROJECT.calendars[0] || DEFAULT_CALENDAR,
      WATER_TREATMENT_PLANT_PROJECT.resources
    );
    return {
      ...WATER_TREATMENT_PLANT_PROJECT,
      tasks: sched.tasks,
      calculatedFinishDate: sched.projectFinishDate,
    };
  });

  const [currentView, setCurrentView] = useState<AppView>('gantt');

  // Dark Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(THEME_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? 'true' : 'false');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Undo / Redo stacks
  const [history, setHistory] = useState<Project[]>([]);
  const [redoStack, setRedoStack] = useState<Project[]>([]);

  // Selection states
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('t-8');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(['t-8']);

  // Modals
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isScheduleDoctorOpen, setIsScheduleDoctorOpen] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [project]);

  // Helper to commit new project state with Undo history tracking
  const commitProjectState = (newProject: Project) => {
    setHistory((prev) => [...prev.slice(-25), project]);
    setRedoStack([]);

    // Recalculate schedule if autoSchedule is true
    if (newProject.settings?.autoSchedule !== false) {
      const cal = newProject.calendars?.[0] || DEFAULT_CALENDAR;
      const sched = calculateSchedule(
        newProject.tasks,
        newProject.startDate,
        cal,
        newProject.resources,
        newProject.resourceAssignments
      );
      setProject({
        ...newProject,
        tasks: sched.tasks,
        calculatedFinishDate: sched.projectFinishDate,
        lastModified: new Date().toISOString(),
      });
    } else {
      setProject({
        ...newProject,
        lastModified: new Date().toISOString(),
      });
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [project, ...prev]);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setProject(previous);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, project]);
    setRedoStack((prev) => prev.slice(1));
    setProject(next);
  };

  // Keyboard listener for shortcuts (Ctrl+Z, Ctrl+Y, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing inside input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, redoStack, project]);

  const updateProject = (updated: Partial<Project>) => {
    commitProjectState({ ...project, ...updated });
  };

  const loadProjectTemplate = (newProject: Project) => {
    commitProjectState(newProject);
    if (newProject.tasks.length > 0) {
      setSelectedTaskId(newProject.tasks[0].id);
      setSelectedTaskIds([newProject.tasks[0].id]);
    }
  };

  const recalculateProjectSchedule = () => {
    const cal = project.calendars?.[0] || DEFAULT_CALENDAR;
    const sched = calculateSchedule(
      project.tasks,
      project.startDate,
      cal,
      project.resources,
      project.resourceAssignments
    );
    setProject((prev) => ({
      ...prev,
      tasks: sched.tasks,
      calculatedFinishDate: sched.projectFinishDate,
    }));
  };

  // Task operations
  const addTask = (newTaskPartial?: Partial<Task>, parentTaskId?: string) => {
    let insertIndex = project.tasks.length;
    let newLevel = 0;

    if (parentTaskId) {
      const idx = project.tasks.findIndex((t) => t.id === parentTaskId);
      if (idx >= 0) {
        insertIndex = idx + 1;
        newLevel = project.tasks[idx].level;
      }
    } else if (selectedTaskId) {
      const idx = project.tasks.findIndex((t) => t.id === selectedTaskId);
      if (idx >= 0) {
        insertIndex = idx + 1;
        newLevel = project.tasks[idx].level;
      }
    }

    const todayStr = formatDate(new Date());
    const newId = `t-${Date.now()}`;
    const newTask: Task = {
      id: newId,
      wbs: '1',
      name: newTaskPartial?.name || 'New Task Item',
      level: newLevel,
      isSummary: false,
      isMilestone: newTaskPartial?.duration === 0 || false,
      duration: newTaskPartial?.duration ?? 5,
      startDate: newTaskPartial?.startDate || project.startDate || todayStr,
      finishDate: newTaskPartial?.finishDate || todayStr,
      predecessors: newTaskPartial?.predecessors || [],
      successors: [],
      constraintType: 'ASAP',
      percentComplete: 0,
      status: 'Not Started',
      priority: 'Medium',
      resourceIds: [],
      fixedCost: 0,
      totalCost: 0,
      earlyStart: project.startDate,
      earlyFinish: project.startDate,
      lateStart: project.startDate,
      lateFinish: project.startDate,
      totalFloat: 0,
      freeFloat: 0,
      isCritical: false,
      ...newTaskPartial,
    };

    const newTasks = [...project.tasks];
    newTasks.splice(insertIndex, 0, newTask);

    commitProjectState({
      ...project,
      tasks: recalculateWBS(newTasks),
    });

    setSelectedTaskId(newId);
    setSelectedTaskIds([newId]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = project.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
    commitProjectState({
      ...project,
      tasks: updatedTasks,
    });
  };

  const deleteTask = (taskId: string) => {
    deleteMultipleTasks([taskId]);
  };

  const deleteMultipleTasks = (taskIds: string[]) => {
    const filteredTasks = project.tasks.filter((t) => !taskIds.includes(t.id));
    commitProjectState({
      ...project,
      tasks: recalculateWBS(filteredTasks),
    });
    setSelectedTaskId(null);
    setSelectedTaskIds([]);
  };

  const duplicateTask = (taskId: string) => {
    const idx = project.tasks.findIndex((t) => t.id === taskId);
    if (idx < 0) return;

    const original = project.tasks[idx];
    const copyId = `t-${Date.now()}`;
    const copyTask: Task = {
      ...original,
      id: copyId,
      name: `${original.name} (Copy)`,
      predecessors: [],
      successors: [],
    };

    const newTasks = [...project.tasks];
    newTasks.splice(idx + 1, 0, copyTask);

    commitProjectState({
      ...project,
      tasks: recalculateWBS(newTasks),
    });
  };

  const indentTaskItem = (taskId: string) => {
    const updated = indentTask(project.tasks, taskId);
    commitProjectState({ ...project, tasks: updated });
  };

  const outdentTaskItem = (taskId: string) => {
    const updated = outdentTask(project.tasks, taskId);
    commitProjectState({ ...project, tasks: updated });
  };

  const moveTaskItem = (taskId: string, direction: 'up' | 'down') => {
    const updated = moveTask(project.tasks, taskId, direction);
    commitProjectState({ ...project, tasks: updated });
  };

  const toggleTaskCollapse = (taskId: string) => {
    const updated = project.tasks.map((t) => (t.id === taskId ? { ...t, isCollapsed: !t.isCollapsed } : t));
    setProject({ ...project, tasks: updated });
  };

  // Baseline creation
  const saveBaseline = (name: string, description: string) => {
    const tasksSnapshot: BaselineSnapshot['tasksSnapshot'] = {};
    project.tasks.forEach((t) => {
      tasksSnapshot[t.id] = {
        startDate: t.startDate,
        finishDate: t.finishDate,
        duration: t.duration,
        totalCost: t.totalCost,
        percentComplete: t.percentComplete,
      };
    });

    const newBaseline: BaselineSnapshot = {
      id: `base-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      description,
      totalCost: project.tasks.reduce((sum, t) => sum + (t.totalCost || 0), 0),
      finishDate: project.calculatedFinishDate,
      tasksSnapshot,
    };

    // Update tasks baseline properties
    const updatedTasks = project.tasks.map((t) => ({
      ...t,
      baselineStart: t.startDate,
      baselineFinish: t.finishDate,
      baselineDuration: t.duration,
      baselineCost: t.totalCost,
    }));

    commitProjectState({
      ...project,
      tasks: updatedTasks,
      baselines: [...(project.baselines || []), newBaseline],
      activeBaselineId: newBaseline.id,
    });
  };

  // Resource operations
  const addResource = (res: Omit<Resource, 'id'>) => {
    const newRes: Resource = {
      ...res,
      id: `r-${Date.now()}`,
    };
    commitProjectState({
      ...project,
      resources: [...project.resources, newRes],
    });
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    const updated = project.resources.map((r) => (r.id === id ? { ...r, ...updates } : r));
    commitProjectState({ ...project, resources: updated });
  };

  const deleteResource = (id: string) => {
    const updated = project.resources.filter((r) => r.id !== id);
    commitProjectState({ ...project, resources: updated });
  };

  const levelProjectResources = () => {
    const result = levelResources(project);
    if (result.levelledTaskCount > 0) {
      commitProjectState({
        ...project,
        tasks: result.updatedTasks,
      });
    }
    return {
      levelledTaskCount: result.levelledTaskCount,
      resolvedOverallocationsCount: result.resolvedOverallocationsCount,
    };
  };

  // Risk & Issue operations
  const addRisk = (risk: Omit<ProjectRisk, 'id'>) => {
    const newRisk: ProjectRisk = { ...risk, id: `rsk-${Date.now()}` };
    commitProjectState({ ...project, risks: [...(project.risks || []), newRisk] });
  };

  const updateRisk = (id: string, updates: Partial<ProjectRisk>) => {
    const updated = (project.risks || []).map((r) => (r.id === id ? { ...r, ...updates } : r));
    commitProjectState({ ...project, risks: updated });
  };

  const deleteRisk = (id: string) => {
    const updated = (project.risks || []).filter((r) => r.id !== id);
    commitProjectState({ ...project, risks: updated });
  };

  const addIssue = (issue: Omit<ProjectIssue, 'id'>) => {
    const newIssue: ProjectIssue = { ...issue, id: `iss-${Date.now()}` };
    commitProjectState({ ...project, issues: [...(project.issues || []), newIssue] });
  };

  const updateIssue = (id: string, updates: Partial<ProjectIssue>) => {
    const updated = (project.issues || []).map((i) => (i.id === id ? { ...i, ...updates } : i));
    commitProjectState({ ...project, issues: updated });
  };

  const deleteIssue = (id: string) => {
    const updated = (project.issues || []).filter((i) => i.id !== id);
    commitProjectState({ ...project, issues: updated });
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        currentView,
        setCurrentView,
        isDarkMode,
        toggleDarkMode,
        canUndo: history.length > 0,
        canRedo: redoStack.length > 0,
        undo,
        redo,
        updateProject,
        loadProjectTemplate,
        recalculateProjectSchedule,
        addTask,
        updateTask,
        deleteTask,
        deleteMultipleTasks,
        duplicateTask,
        indentTaskItem,
        outdentTaskItem,
        moveTaskItem,
        toggleTaskCollapse,
        saveBaseline,
        addResource,
        updateResource,
        deleteResource,
        levelProjectResources,
        addRisk,
        updateRisk,
        deleteRisk,
        addIssue,
        updateIssue,
        deleteIssue,
        selectedTaskId,
        setSelectedTaskId,
        selectedTaskIds,
        setSelectedTaskIds,
        isWizardOpen,
        setIsWizardOpen,
        isTaskModalOpen,
        setIsTaskModalOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        isScheduleDoctorOpen,
        setIsScheduleDoctorOpen,
        editingTaskId,
        setEditingTaskId,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
