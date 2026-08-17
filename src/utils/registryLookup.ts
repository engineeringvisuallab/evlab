import knowledgeRegistry from '../data/registries/knowledge.json';
import softwareRegistry from '../data/registries/software.json';
import standardsRegistry from '../data/registries/standards.json';
import coursesRegistry from '../data/registries/courses.json';
import careerRolesRegistry from '../data/registries/career-roles.json';
import skillsRegistry from '../data/registries/skills.json';
import resourcesRegistry from '../data/registries/resources.json';

import type { RoadmapNode, RoadmapTree } from '@/types/roadmap';

/** Flatten a roadmap tree into a single array of nodes (depth-first). Used by CommandPalette search. */
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

/** Find the ancestor chain (breadcrumb path) for a given roadmap node ID. Used by CommandPalette search. */
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

export function getVideoItem(id: string): RegistryItem | null {
  return null;
}

export function getVideosForObject(objectId: string): RegistryItem[] {
  return [];
}

export function getVideosForComponent(componentId: string): RegistryItem[] {
  return [];
}

export function getVideosForSoftware(softwareId: string): RegistryItem[] {
  return [];
}

export function getAllVideos(): RegistryItem[] {
  return [];
}
