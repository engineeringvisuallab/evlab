/**
 * EV Software Core — Application Registry Types
 *
 * Domain-neutral. Describes an EVLab software tool as a Core-registered
 * "application" without knowing anything about its internal engineering
 * logic. Built to wrap the EXISTING tool registry (evlab-tools.json) —
 * it does not replace it.
 *
 * See /docs/ev-software/00_EV_SOFTWARE_FINAL_FOUNDATION.md for the
 * full architecture this implements.
 */

/** How far a given existing application is along the Core migration path. */
export type IntegrationStatus =
  | 'NOT_CONNECTED' // registered, but Core has no adapter for it yet
  | 'ADAPTER_READY' // an adapter module exists and can read/describe the app's data
  | 'PARTIALLY_CONNECTED' // adapter can read AND write via Core-mediated actions
  | 'CORE_CONNECTED' // app actively uses Core services (project context, audit) at runtime
  | 'FULLY_INTEGRATED' // full data-exchange + validation + audit through Core

export type ReleaseStatus = 'live' | 'coming-soon'

/**
 * A Core-facing description of one EVLab application.
 * Constructed from the existing `evlab-tools.json` entry plus optional
 * adapter metadata — never a duplicate hand-maintained list.
 */
export interface ApplicationDescriptor {
  id: string
  name: string
  shortName: string
  tagline: string
  description: string
  field: string
  route: string
  icon: string
  accent: string
  tags: string[]
  releaseStatus: ReleaseStatus
  integrationStatus: IntegrationStatus
  /** True if an adapter module is registered for this app in src/core/adapters. */
  hasAdapter: boolean
  /** Capabilities the adapter exposes today (empty until an adapter connects). */
  capabilities: string[]
}
