/**
 * EV Software Core — Local Persistence (Phase 1)
 *
 * The public EVLab site is a static GitHub Pages deployment with no
 * runtime server, so Core storage in this phase is entirely client-side
 * via `idb-keyval` (already a project dependency — used by GIS/Mini CAD).
 * No Postgres/Firebase/Express requirement is introduced into the public
 * build. A server-backed Core (see /docs/ev-software) is a later,
 * separately-deployed phase and must not block this one.
 */
import { get, set, del, keys } from 'idb-keyval'
import type { ProjectContext, AuditEntry } from '@/core/types/core'

const PROJECT_PREFIX = 'ev-core:project:'
const AUDIT_KEY = 'ev-core:audit-log'

export async function saveProject(project: ProjectContext): Promise<void> {
  await set(PROJECT_PREFIX + project.projectId, project)
}

export async function getProject(projectId: string): Promise<ProjectContext | undefined> {
  return get(PROJECT_PREFIX + projectId)
}

export async function deleteProject(projectId: string): Promise<void> {
  await del(PROJECT_PREFIX + projectId)
}

export async function listProjects(): Promise<ProjectContext[]> {
  const allKeys = await keys()
  const projectKeys = allKeys.filter(
    (k): k is string => typeof k === 'string' && k.startsWith(PROJECT_PREFIX)
  )
  const projects = await Promise.all(projectKeys.map((k) => get<ProjectContext>(k)))
  return projects.filter((p): p is ProjectContext => Boolean(p))
}

export async function appendAudit(entry: AuditEntry): Promise<void> {
  const existing = (await get<AuditEntry[]>(AUDIT_KEY)) ?? []
  existing.push(entry)
  // keep the last 500 entries client-side
  await set(AUDIT_KEY, existing.slice(-500))
}

export async function listAudit(): Promise<AuditEntry[]> {
  return (await get<AuditEntry[]>(AUDIT_KEY)) ?? []
}
