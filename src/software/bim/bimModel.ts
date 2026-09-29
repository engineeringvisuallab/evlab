/**
 * EVLab BIM Bridge
 * ------------------------------------------------------------------
 * A small, tool-agnostic 3D object format that any EVLab software tool
 * can "publish" its current model into. The BIM Viewer reads from this
 * shared store and renders every published tool's geometry together in
 * one connected 3D workspace.
 *
 * This is intentionally lightweight (no server, no auth) — it persists
 * in the browser via localStorage so a publish from one tool is picked
 * up by the BIM Viewer in the same browser/session. As more EVLab tools
 * are added, each one only needs a converter function here to plug in.
 */

export type BimGeometryType = 'BOX' | 'CYLINDER' | 'SPHERE' | 'CONE' | 'PIPE' | 'LINE';

export type BimSourceTool = 'wtp' | 'minicad';

export interface BimVector3 {
  x: number;
  y: number;
  z: number;
}

export interface BimObject {
  id: string;
  sourceTool: BimSourceTool;
  label: string;
  geometryType: BimGeometryType;
  position: BimVector3;
  rotation: BimVector3;
  dimensions: {
    lengthM: number;
    widthM: number;
    heightM: number;
    radiusM?: number;
  };
  colorHex: string;
  opacity: number;
  wireframe: boolean;
}

export interface BimPublishPayload {
  sourceTool: BimSourceTool;
  toolLabel: string;
  objects: BimObject[];
  publishedAt: string;
  meta?: Record<string, string | number>;
}

export interface BimModelState {
  [sourceTool: string]: BimPublishPayload | undefined;
}

const STORAGE_KEY = 'evlab-bim-model';

function readState(): BimModelState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as BimModelState;
  } catch {
    return {};
  }
}

function writeState(state: BimModelState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('evlab-bim-update'));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — publishing
    // is a non-critical convenience feature, so fail silently.
  }
}

/** Publish (or replace) one tool's contribution to the shared BIM model. */
export function publishToBim(payload: Omit<BimPublishPayload, 'publishedAt'>): void {
  const state = readState();
  state[payload.sourceTool] = { ...payload, publishedAt: new Date().toISOString() };
  writeState(state);
}

/** Remove one tool's contribution from the shared BIM model. */
export function clearFromBim(sourceTool: BimSourceTool): void {
  const state = readState();
  delete state[sourceTool];
  writeState(state);
}

/** Read every tool's currently published contribution. */
export function getBimModel(): BimModelState {
  return readState();
}

/** Flatten every published tool's objects into a single array for rendering. */
export function getAllBimObjects(): BimObject[] {
  const state = readState();
  return Object.values(state)
    .filter((p): p is BimPublishPayload => !!p)
    .flatMap((p) => p.objects);
}

/** Subscribe to BIM model changes (fires on publish/clear, including cross-tab via storage event). */
export function subscribeToBimModel(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener('evlab-bim-update', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('evlab-bim-update', handler);
    window.removeEventListener('storage', handler);
  };
}
