import { Task } from '../types';

/**
 * Recalculates WBS numbering and identifies summary tasks based on task level hierarchy.
 */
export function recalculateWBS(tasks: Task[]): Task[] {
  if (!tasks || tasks.length === 0) return [];

  const updatedTasks = tasks.map((t) => ({ ...t }));
  const levelCounters: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < updatedTasks.length; i++) {
    const task = updatedTasks[i];
    const level = Math.max(0, task.level || 0);

    // Reset counters for deeper levels when we move up or stay at current level
    for (let l = level + 1; l < levelCounters.length; l++) {
      levelCounters[l] = 0;
    }

    // Increment current level counter
    levelCounters[level] = (levelCounters[level] || 0) + 1;

    // Build WBS string e.g. "1.2.1"
    const wbsParts = levelCounters.slice(0, level + 1);
    task.wbs = wbsParts.join('.');

    // Determine if this task is a summary task (if the immediate next task has a higher level)
    const nextTask = updatedTasks[i + 1];
    task.isSummary = !!(nextTask && nextTask.level > task.level);
  }

  return updatedTasks;
}

/**
 * Indent task: increase level if valid
 */
export function indentTask(tasks: Task[], targetTaskId: string): Task[] {
  const index = tasks.findIndex((t) => t.id === targetTaskId);
  if (index <= 0) return tasks; // Cannot indent top item or first item

  const prevTask = tasks[index - 1];
  const currentTask = tasks[index];

  // A task can at most be 1 level deeper than the task above it
  if (currentTask.level <= prevTask.level) {
    const updated = [...tasks];
    updated[index] = {
      ...currentTask,
      level: currentTask.level + 1,
    };
    return recalculateWBS(updated);
  }

  return tasks;
}

/**
 * Outdent task: decrease level if valid
 */
export function outdentTask(tasks: Task[], targetTaskId: string): Task[] {
  const index = tasks.findIndex((t) => t.id === targetTaskId);
  if (index < 0) return tasks;

  const currentTask = tasks[index];
  if (currentTask.level > 0) {
    const updated = [...tasks];
    updated[index] = {
      ...currentTask,
      level: currentTask.level - 1,
    };
    return recalculateWBS(updated);
  }

  return tasks;
}

/**
 * Move task up/down
 */
export function moveTask(tasks: Task[], targetTaskId: string, direction: 'up' | 'down'): Task[] {
  const index = tasks.findIndex((t) => t.id === targetTaskId);
  if (index < 0) return tasks;
  if (direction === 'up' && index === 0) return tasks;
  if (direction === 'down' && index === tasks.length - 1) return tasks;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  const updated = [...tasks];
  const [removed] = updated.splice(index, 1);
  updated.splice(targetIndex, 0, removed);

  return recalculateWBS(updated);
}
