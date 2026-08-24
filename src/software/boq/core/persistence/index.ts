/**
 * EVLab BOQ - Persistence Layer (IndexedDB via idb-keyval)
 * Handles auto-save, project CRUD, import/export, and backup/restore.
 */

import { get, set, del, keys } from 'idb-keyval';
import {
  Project,
  WBSNode,
  BOQItem,
  MaterialItem,
  LabourItem,
  EquipmentItem,
  MeasurementRecord,
  RunningBill,
  Variation,
  AuditEntry,
} from '../../types';
import {
  DEMO_PROJECT,
  DEMO_WBS_NODES,
  DEMO_BOQ_ITEMS,
  DEMO_MATERIALS,
  DEMO_LABOUR,
  DEMO_EQUIPMENT,
  DEMO_MEASUREMENTS,
  DEMO_RUNNING_BILLS,
  DEMO_VARIATIONS,
} from '../../data/demoProject';

export interface FullProjectBundle {
  project: Project;
  wbsNodes: WBSNode[];
  boqItems: BOQItem[];
  materials: MaterialItem[];
  labour: LabourItem[];
  equipment: EquipmentItem[];
  measurements: MeasurementRecord[];
  runningBills: RunningBill[];
  variations: Variation[];
  auditLog: AuditEntry[];
  exportedAt: string;
}

const STORAGE_KEY_PREFIX = 'evlab_boq_project_';
const PROJECT_LIST_KEY = 'evlab_boq_project_list';

/**
 * Initialize IndexedDB with DEMO project if empty
 */
export async function initStorage(): Promise<FullProjectBundle> {
  try {
    const projectKeys = await get<string[]>(PROJECT_LIST_KEY);
    
    if (!projectKeys || projectKeys.length === 0) {
      // Seed Demo project
      const demoBundle: FullProjectBundle = {
        project: DEMO_PROJECT,
        wbsNodes: DEMO_WBS_NODES,
        boqItems: DEMO_BOQ_ITEMS,
        materials: DEMO_MATERIALS,
        labour: DEMO_LABOUR,
        equipment: DEMO_EQUIPMENT,
        measurements: DEMO_MEASUREMENTS,
        runningBills: DEMO_RUNNING_BILLS,
        variations: DEMO_VARIATIONS,
        auditLog: [
          {
            id: 'audit-demo-init',
            projectId: DEMO_PROJECT.id,
            timestamp: new Date().toISOString(),
            user: 'System Administrator',
            module: 'Initialization',
            action: 'create',
            notes: 'Initialized EVLab BOQ Demo Project',
          },
        ],
        exportedAt: new Date().toISOString(),
      };

      await saveProjectBundle(demoBundle);
      await set(PROJECT_LIST_KEY, [DEMO_PROJECT.id]);
      return demoBundle;
    }

    // Load first project
    const activeId = projectKeys[0];
    const bundle = await loadProjectBundle(activeId);
    if (bundle) return bundle;

    // Fallback to DEMO if corrupted
    return {
      project: DEMO_PROJECT,
      wbsNodes: DEMO_WBS_NODES,
      boqItems: DEMO_BOQ_ITEMS,
      materials: DEMO_MATERIALS,
      labour: DEMO_LABOUR,
      equipment: DEMO_EQUIPMENT,
      measurements: DEMO_MEASUREMENTS,
      runningBills: DEMO_RUNNING_BILLS,
      variations: DEMO_VARIATIONS,
      auditLog: [],
      exportedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Failed to initialize IndexedDB:', err);
    return {
      project: DEMO_PROJECT,
      wbsNodes: DEMO_WBS_NODES,
      boqItems: DEMO_BOQ_ITEMS,
      materials: DEMO_MATERIALS,
      labour: DEMO_LABOUR,
      equipment: DEMO_EQUIPMENT,
      measurements: DEMO_MEASUREMENTS,
      runningBills: DEMO_RUNNING_BILLS,
      variations: DEMO_VARIATIONS,
      auditLog: [],
      exportedAt: new Date().toISOString(),
    };
  }
}

/**
 * Save Full Project Bundle to IndexedDB
 */
export async function saveProjectBundle(bundle: FullProjectBundle): Promise<boolean> {
  try {
    const key = `${STORAGE_KEY_PREFIX}${bundle.project.id}`;
    const updatedBundle = {
      ...bundle,
      project: {
        ...bundle.project,
        updatedAt: new Date().toISOString(),
      },
    };
    await set(key, updatedBundle);

    // Update project list
    const existingKeys = (await get<string[]>(PROJECT_LIST_KEY)) || [];
    if (!existingKeys.includes(bundle.project.id)) {
      await set(PROJECT_LIST_KEY, [...existingKeys, bundle.project.id]);
    }
    return true;
  } catch (err) {
    console.error('Failed to save project bundle:', err);
    return false;
  }
}

/**
 * Load Full Project Bundle from IndexedDB
 */
export async function loadProjectBundle(projectId: string): Promise<FullProjectBundle | null> {
  try {
    const key = `${STORAGE_KEY_PREFIX}${projectId}`;
    const bundle = await get<FullProjectBundle>(key);
    return bundle || null;
  } catch (err) {
    console.error(`Failed to load project bundle ${projectId}:`, err);
    return null;
  }
}

/**
 * Get List of All Saved Projects
 */
export async function getAllProjectSummaries(): Promise<Project[]> {
  try {
    const projectIds = (await get<string[]>(PROJECT_LIST_KEY)) || [];
    const projects: Project[] = [];
    for (const pid of projectIds) {
      const bundle = await loadProjectBundle(pid);
      if (bundle && bundle.project) {
        projects.push(bundle.project);
      }
    }
    return projects;
  } catch (err) {
    console.error('Failed to fetch project summaries:', err);
    return [DEMO_PROJECT];
  }
}

/**
 * Delete Project from IndexedDB
 */
export async function deleteProject(projectId: string): Promise<boolean> {
  try {
    const key = `${STORAGE_KEY_PREFIX}${projectId}`;
    await del(key);
    const existingKeys = (await get<string[]>(PROJECT_LIST_KEY)) || [];
    const filtered = existingKeys.filter((id) => id !== projectId);
    await set(PROJECT_LIST_KEY, filtered);
    return true;
  } catch (err) {
    console.error(`Failed to delete project ${projectId}:`, err);
    return false;
  }
}
