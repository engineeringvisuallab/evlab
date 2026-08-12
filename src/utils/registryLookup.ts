import type { RegistryItemBase, Registry } from '@/types/registry';
import type { RoadmapNode, RoadmapTree } from '@/types/roadmap';
import type { UeleVideo } from '@/types/uele';

import knowledgeRegistry from '@/data/registries/knowledge.json';
import softwareRegistry from '@/data/registries/software.json';
import standardsRegistry from '@/data/registries/standards.json';
import coursesRegistry from '@/data/registries/courses.json';
import careerRolesRegistry from '@/data/registries/career-roles.json';
import skillsRegistry from '@/data/registries/skills.json';
import resourcesRegistry from '@/data/registries/resources.json';
import videosRegistry from '@/data/uele/videos.json';

/** Look up a single item in a registry by ID. Returns undefined if not found. */
export function lookupRegistryItem<T extends RegistryItemBase>(
  registry: Registry<T>,
  id: string
): T | undefined {
  return registry[id];
}

/** Resolve an array of IDs against a registry, silently dropping any that don't exist. */
export function resolveRegistryItems<T extends RegistryItemBase>(
  registry: Registry<T>,
  ids: string[] | undefined
): T[] {
  if (!ids || ids.length === 0) return [];
  return ids
    .map((id) => registry[id])
    .filter((item): item is T => Boolean(item));
}

/** Flatten a roadmap tree into a single array of nodes (depth-first). */
export function flattenRoadmapTree(tree: RoadmapTree): RoadmapNode[] {
  const result: RoadmapNode[] = [];
  const visit = (nodes: RoadmapNode[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        visit(node.children);
      }
    }
  };
  visit(tree);
  return result;
}

/** Find a single roadmap node by ID anywhere in the tree. */
export function findRoadmapNode(tree: RoadmapTree, id: string): RoadmapNode | undefined {
  return flattenRoadmapTree(tree).find((node) => node.id === id);
}

/** Find the ancestor chain (breadcrumb path) for a given roadmap node ID. */
export function findRoadmapPath(tree: RoadmapTree, id: string): RoadmapNode[] {
  const path: RoadmapNode[] = [];
  const visit = (nodes: RoadmapNode[], trail: RoadmapNode[]): boolean => {
    for (const node of nodes) {
      const nextTrail = [...trail, node];
      if (node.id === id) {
        path.push(...nextTrail);
        return true;
      }
      if (node.children && visit(node.children, nextTrail)) {
        return true;
      }
    }
    return false;
  };
  visit(tree, []);
  return path;
}

export interface DataIntegrityReport {
  duplicateRoadmapIds: string[];
  duplicateRegistryIds: Record<string, string[]>;
  brokenRelations: Array<{ nodeId: string; field: string; missingId: string }>;
}

/**
 * Validates roadmap-tree.json against the registries per Stage 01 Data
 * Integrity Rules: no duplicate node IDs, no duplicate registry IDs, and
 * every relation ID must resolve to a real registry entry.
 */
export function validateDataIntegrity(
  tree: RoadmapTree,
  registries: Record<string, Registry<RegistryItemBase>>
): DataIntegrityReport {
  const nodes = flattenRoadmapTree(tree);

  // Duplicate roadmap node IDs
  const seen = new Set<string>();
  const duplicateRoadmapIds: string[] = [];
  for (const node of nodes) {
    if (seen.has(node.id)) duplicateRoadmapIds.push(node.id);
    seen.add(node.id);
  }

  // Duplicate registry IDs (shouldn't be possible with object keys, but
  // checks for id-field mismatches against the key).
  const duplicateRegistryIds: Record<string, string[]> = {};
  for (const [registryName, registry] of Object.entries(registries)) {
    const mismatches = Object.entries(registry)
      .filter(([key, item]) => item.id !== key)
      .map(([key]) => key);
    if (mismatches.length > 0) duplicateRegistryIds[registryName] = mismatches;
  }

  // Broken relations
  const brokenRelations: Array<{ nodeId: string; field: string; missingId: string }> = [];
  for (const node of nodes) {
    if (!node.relations) continue;
    for (const [field, ids] of Object.entries(node.relations)) {
      const registry = registries[field];
      if (!registry || !ids) continue;
      for (const relId of ids as string[]) {
        if (!registry[relId]) {
          brokenRelations.push({ nodeId: node.id, field, missingId: relId });
        }
      }
    }
  }

  return { duplicateRoadmapIds, duplicateRegistryIds, brokenRelations };
}

/* ------------------------------------------------------------------ */
/*  UELE registry getters — used by the UELE Object Inspector to      */
/*  resolve knowledge / skill / software / standard / course /        */
/*  resource / video IDs referenced on a UELE object or component.    */
/* ------------------------------------------------------------------ */

export interface RegistryItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  category?: string;
  vendor?: string;
  url?: string;
  code?: string;
  organization?: string;
  type?: string;
  [key: string]: any;
}

export function getKnowledgeItem(id: string): RegistryItem | null {
  const item = (knowledgeRegistry as Record<string, any>)[id];
  if (!item) return null;
  return {
    id,
    name: item.name || item.title || id,
    description: item.description || item.summary || '',
    category: item.category || item.discipline || 'Knowledge',
    ...item,
  };
}

export function getSoftwareItem(id: string): RegistryItem | null {
  const item = (softwareRegistry as Record<string, any>)[id];
  if (!item) return null;
  return {
    id,
    name: item.name || item.title || id,
    description: item.description || item.summary || '',
    vendor: item.vendor || item.developer || '',
    category: item.category || 'Software',
    url: item.url || '',
    ...item,
  };
}

export function getStandardItem(id: string): RegistryItem | null {
  const item = (standardsRegistry as Record<string, any>)[id];
  if (!item) return null;
  return {
    id,
    name: item.name || item.title || item.code || id,
    description: item.description || item.summary || '',
    organization: item.organization || item.issuer || '',
    category: item.category || 'Standard',
    ...item,
  };
}

export function getCourseItem(id: string): RegistryItem | null {
  const item = (coursesRegistry as Record<string, any>)[id];
  if (!item) return null;
  return {
    id,
    name: item.name || item.title || id,
    description: item.description || item.summary || '',
    category: item.category || 'Course',
    provider: item.provider || item.platform || '',
    ...item,
  };
}

export function getCareerRoleItem(id: string): RegistryItem | null {
  const item = (careerRolesRegistry as Record<string, any>)[id];
  if (!item) return null;
  return {
    id,
    name: item.name || item.title || id,
    description: item.description || item.summary || '',
    category: item.category || 'Career Role',
    ...item,
  };
}

export function getSkillItem(id: string): RegistryItem | null {
  const item = (skillsRegistry as Record<string, any>)[id];
  if (!item) return null;
  return {
    id,
    name: item.name || item.title || id,
    description: item.description || item.summary || '',
    category: item.category || 'Engineering Skill',
    ...item,
  };
}

export function getResourceItem(id: string): RegistryItem | null {
  const item = (resourcesRegistry as Record<string, any>)[id];
  if (!item) return null;
  return {
    id,
    name: item.name || item.title || id,
    description: item.description || item.summary || '',
    category: item.type || item.category || 'Technical Resource',
    ...item,
  };
}

export function getVideoItem(id: string): UeleVideo | null {
  const item = (videosRegistry as Record<string, any>)[id];
  if (!item) return null;
  return item as UeleVideo;
}

export function getVideosForObject(objectId: string): UeleVideo[] {
  const all = Object.values(videosRegistry as Record<string, UeleVideo>);
  return all.filter((v) => v.objectIds && v.objectIds.includes(objectId));
}

export function getVideosForComponent(componentId: string): UeleVideo[] {
  const all = Object.values(videosRegistry as Record<string, UeleVideo>);
  return all.filter((v) => v.componentIds && v.componentIds.includes(componentId));
}

export function getVideosForSoftware(softwareId: string): UeleVideo[] {
  const all = Object.values(videosRegistry as Record<string, UeleVideo>);
  return all.filter((v) => v.softwareIds && v.softwareIds.includes(softwareId));
}

export function getAllVideos(): UeleVideo[] {
  return Object.values(videosRegistry as Record<string, UeleVideo>);
}
