/**
 * EV Software Core — Application Registry
 *
 * Single source of truth for which EVLab tools exist is still
 * `src/data/evlab-tools.json` (used by the existing /software directory
 * page). This module does NOT duplicate that list — it reads it and
 * layers Core integration metadata on top, via the adapter map below.
 */
import evlabToolsData from '@/data/evlab-tools.json'
import { ADAPTERS } from '@/core/adapters'
import type { ApplicationDescriptor, ReleaseStatus } from '@/core/types/application'

interface RawTool {
  id: string
  name: string
  shortName: string
  tagline: string
  description: string
  field: string
  status: ReleaseStatus
  route: string
  icon: string
  accent: string
  tags: string[]
}

const RAW_TOOLS = evlabToolsData as unknown as Record<string, RawTool>

/** Returns every registered application, existing tools first, in evlab-tools.json order. */
export function listApplications(): ApplicationDescriptor[] {
  return Object.values(RAW_TOOLS).map((tool) => {
    const adapter = ADAPTERS[tool.route]
    return {
      id: tool.id,
      name: tool.name,
      shortName: tool.shortName,
      tagline: tool.tagline,
      description: tool.description,
      field: tool.field,
      route: tool.route,
      icon: tool.icon,
      accent: tool.accent,
      tags: tool.tags,
      releaseStatus: tool.status,
      integrationStatus: adapter?.integrationStatus ?? 'NOT_CONNECTED',
      hasAdapter: Boolean(adapter),
      capabilities: adapter?.capabilities ?? [],
    }
  })
}

export function getApplication(route: string): ApplicationDescriptor | undefined {
  return listApplications().find((app) => app.route === route)
}
