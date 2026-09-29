/**
 * EV Software Core — Application Adapters
 *
 * An adapter is the ONLY thing that is allowed to know how to talk to a
 * given application's existing internal storage/model. Core itself never
 * reaches into `src/software/<tool>` directly, and adapters never modify
 * an application's internals — they only read/describe them, or forward
 * explicit Core-mediated requests (Phase 2+).
 *
 * Phase 1 (current): adapters are descriptors only — they declare what
 * *will* be possible, without touching the live GIS/CAD implementations.
 * This keeps existing GIS and Mini CAD 100% unmodified and functional.
 */
import type { IntegrationStatus } from '@/core/types/application'

export interface ApplicationAdapter {
  /** Matches the `route` field in evlab-tools.json (e.g. 'gis', 'minicad'). */
  route: string
  integrationStatus: IntegrationStatus
  capabilities: string[]
  notes: string
}

// GIS is one half of the foundation doc's first proving workflow (GIS <-> Mini CAD).
// Its real storage lives in src/software/gis/services/storage.ts — untouched here.
const gisAdapter: ApplicationAdapter = {
  route: 'gis',
  integrationStatus: 'ADAPTER_READY',
  capabilities: ['describe-layers'],
  notes:
    'Phase 1 stub. Future: read layer metadata from software/gis/services/storage.ts ' +
    'and expose it as Core DataReferences, without modifying GIS internals.',
}

// Mini CAD is the other half of the first proving workflow.
const minicadAdapter: ApplicationAdapter = {
  route: 'minicad',
  integrationStatus: 'ADAPTER_READY',
  capabilities: ['describe-drawings'],
  notes:
    'Phase 1 stub. Future: read drawing metadata from software/minicad and expose it ' +
    'as Core DataReferences so GIS features can be imported as CAD geometry, and back.',
}

/** Keyed by the app's `route` (matches evlab-tools.json). Unlisted routes = NOT_CONNECTED. */
export const ADAPTERS: Record<string, ApplicationAdapter> = {
  gis: gisAdapter,
  minicad: minicadAdapter,
}
