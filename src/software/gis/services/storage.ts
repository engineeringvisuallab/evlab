import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { GISProject } from '../types/gis';
import { createWaterNetworkSampleProject } from './sampleProjects';

interface EVLabGISDB extends DBSchema {
  projects: {
    key: string;
    value: GISProject;
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'EVLab_GIS_Database';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<EVLabGISDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<EVLabGISDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
};

export const saveProjectToDB = async (project: GISProject): Promise<void> => {
  const db = await getDB();
  const updatedProject = {
    ...project,
    updatedAt: new Date().toISOString(),
  };
  await db.put('projects', updatedProject);
};

export const getProjectFromDB = async (id: string): Promise<GISProject | undefined> => {
  const db = await getDB();
  return db.get('projects', id);
};

export const getAllProjectsFromDB = async (): Promise<GISProject[]> => {
  const db = await getDB();
  const projects = await db.getAll('projects');
  if (projects.length === 0) {
    // Seed default sample project on first launch
    const sample = createWaterNetworkSampleProject();
    await saveProjectToDB(sample);
    return [sample];
  }
  return projects;
};

export const deleteProjectFromDB = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('projects', id);
};

export const exportProjectJSON = (project: GISProject) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_evlab_gis.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const importProjectJSON = (file: File): Promise<GISProject> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const project = JSON.parse(content) as GISProject;
        if (!project.id || !project.layers) {
          throw new Error('Invalid EVLab GIS project JSON schema');
        }
        project.id = `project-${Date.now()}`;
        project.name = `${project.name} (Imported)`;
        await saveProjectToDB(project);
        resolve(project);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
