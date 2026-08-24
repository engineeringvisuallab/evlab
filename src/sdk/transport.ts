/**
 * EV Software Core - SDK Transport Abstraction Layer
 * Supports InMemoryTransport for local development / browser preview
 * and HttpTransport for future production REST / WebSocket backend.
 */

export interface CoreTransportRequestOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export interface CoreTransport {
  readonly transportMode: 'in_memory' | 'http_rest';
  
  /**
   * Dispatches a structured request through the transport
   */
  request<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    action: string,
    payload?: TBody,
    options?: CoreTransportRequestOptions
  ): Promise<TResponse>;

  /**
   * Subscribes to real-time Core domain events
   */
  subscribe(eventType: string, callback: (payload: unknown) => void): () => void;

  /**
   * Emits an event onto the transport event bus
   */
  emit(eventType: string, payload: unknown): void;
}

/**
 * InMemoryTransport implementation directly connecting client SDK
 * to the in-memory Core context without network roundtrips.
 */
export class InMemoryTransport implements CoreTransport {
  public readonly transportMode = 'in_memory' as const;
  private coreContextAccessor: () => any;
  private eventListeners: Map<string, Set<(payload: unknown) => void>> = new Map();

  constructor(coreContextAccessor: () => any) {
    this.coreContextAccessor = coreContextAccessor;
  }

  public async request<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    action: string,
    payload?: TBody,
    options?: CoreTransportRequestOptions
  ): Promise<TResponse> {
    const ctx = this.coreContextAccessor();
    if (!ctx) {
      throw new Error(`InMemoryTransport: Core context accessor returned null for ${endpoint}:${action}`);
    }

    // Direct in-memory dispatch based on endpoint/action
    switch (`${endpoint}:${action}`) {
      case 'projects:list':
        return ctx.projects as TResponse;
      case 'projects:get':
        return ctx.projects.find((p: any) => p.projectId === (payload as any)?.projectId) as TResponse;
      case 'datasets:listByProject':
        return ctx.getDatasetsByProject((payload as any)?.projectId) as TResponse;
      case 'datasets:get':
        return ctx.getDataset((payload as any)?.datasetId) as TResponse;
      case 'datasets:create':
        return ctx.createDataset(payload as any) as TResponse;
      case 'revisions:listByDataset':
        return ctx.getRevisionsForDataset((payload as any)?.datasetId) as TResponse;
      case 'transfers:listByProject':
        return ctx.getTransfersByProject((payload as any)?.projectId) as TResponse;
      case 'transfers:get':
        return ctx.getTransfer((payload as any)?.transferId) as TResponse;
      case 'transfers:initiate':
        return ctx.initiateTransfer(payload as any) as TResponse;
      case 'transfers:advanceState':
        return ctx.advanceTransferState(
          (payload as any)?.transferId,
          (payload as any)?.newState,
          (payload as any)?.notes
        ) as TResponse;
      case 'transfers:review':
        return ctx.reviewTransfer((payload as any)?.transferId, (payload as any)?.notes) as TResponse;
      case 'transfers:validate':
        return ctx.validateTransfer((payload as any)?.transferId) as TResponse;
      case 'transfers:commit':
        return ctx.commitTransfer((payload as any)?.transferId) as TResponse;
      case 'transfers:reject':
        return ctx.rejectTransfer((payload as any)?.transferId, (payload as any)?.reason) as TResponse;
      case 'files:list':
        return ctx.files.filter((f: any) => f.projectId === (payload as any)?.projectId) as TResponse;
      case 'files:upload':
        return ctx.uploadFileReference(payload as any) as TResponse;
      case 'context:getCurrentUser':
        return ctx.currentUser as TResponse;
      case 'context:getActiveProject':
        return ctx.activeProject as TResponse;
      case 'apps:get':
        return ctx.getApplication((payload as any)?.appId) as TResponse;
      default:
        throw new Error(`InMemoryTransport: Unknown endpoint action '${endpoint}:${action}'`);
    }
  }

  public subscribe(eventType: string, callback: (payload: unknown) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);

    return () => {
      this.eventListeners.get(eventType)?.delete(callback);
    };
  }

  public emit(eventType: string, payload: unknown): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(payload);
        } catch (e) {
          console.error(`Error in InMemoryTransport event listener for '${eventType}':`, e);
        }
      }
    }
  }
}

/**
 * HttpTransport template designed for future production REST & WebSocket backend
 */
export class HttpTransport implements CoreTransport {
  public readonly transportMode = 'http_rest' as const;
  private baseUrl: string;
  private authToken?: string;
  private eventListeners: Map<string, Set<(payload: unknown) => void>> = new Map();

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.authToken = authToken;
  }

  public async request<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    action: string,
    payload?: TBody,
    options?: CoreTransportRequestOptions
  ): Promise<TResponse> {
    const url = `${this.baseUrl}/api/v1/${endpoint}/${action}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP ${response.status} from Core API: ${endpoint}/${action}`);
    }

    return (await response.json()) as TResponse;
  }

  public subscribe(eventType: string, callback: (payload: unknown) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);

    return () => {
      this.eventListeners.get(eventType)?.delete(callback);
    };
  }

  public emit(eventType: string, payload: unknown): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(payload);
        } catch (e) {
          console.error(`Error in HttpTransport listener for '${eventType}':`, e);
        }
      }
    }
  }
}
