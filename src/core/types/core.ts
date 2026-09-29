/**
 * EV Software Core — Project Context, Data Reference & Audit Types
 *
 * Domain-neutral infrastructure concepts only (see foundation doc section 9).
 * No engineering-domain fields belong here — those stay inside each
 * application (src/software/<tool>).
 */

export interface ProjectContext {
  projectId: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  /** Which applications currently have data attached to this project. */
  memberApplicationIds: string[]
}

/** A reference to a piece of data owned by one application, exchangeable via Core. */
export interface DataReference {
  refId: string
  ownerApplicationId: string
  projectId: string
  kind: string // e.g. 'gis.layer', 'cad.drawing'
  label: string
  createdAt: string
  revision: number
}

/** One entry in the Core audit trail. Core-connected apps should emit these
 * for any action that crosses an application boundary. */
export interface AuditEntry {
  id: string
  timestamp: string
  actorApplicationId: string
  action: string
  targetRefId?: string
  projectId?: string
  detail?: string
}

/** A request to move/copy a DataReference from one application to another. */
export interface TransferRequest {
  id: string
  sourceApplicationId: string
  targetApplicationId: string
  refId: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  requestedAt: string
}
