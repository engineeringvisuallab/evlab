import {
  UELEWorld,
  AdminUELERegion,
  UELEZone,
  UELEFacility,
  AdminUELEComponent,
  UELENetwork,
  UELELayer,
  UELE3DModel,
  UELEPublicationStatus,
  AdminUELEParameter,
  UELELearningLink,
  UELEStandard,
  UELESoftware,
  UELECourse,
  UELEVideo,
  UELEResource,
} from '../types/adminUele';
import { AuditLogEntry, AdminDashboardMetrics } from '../types/admin';
import { AdminAuthService } from './adminAuthService';

export type UELEAdminEntityType =
  | 'world'
  | 'region'
  | 'zone'
  | 'facility'
  | 'component'
  | 'network'
  | 'gisLayer'
  | 'model3D'
  | 'parameter'
  | 'link'
  | 'standard'
  | 'software'
  | 'course'
  | 'video'
  | 'resource';

export interface FullUELEDatabase {
  worlds: UELEWorld[];
  regions: AdminUELERegion[];
  zones: UELEZone[];
  facilities: UELEFacility[];
  components: AdminUELEComponent[];
  networks: UELENetwork[];
  gisLayers: UELELayer[];
  models3D: UELE3DModel[];
  parameters?: AdminUELEParameter[];
  learningLinks?: UELELearningLink[];
  standards?: UELEStandard[];
  software?: UELESoftware[];
  courses?: UELECourse[];
  videos?: UELEVideo[];
  resources?: UELEResource[];
  auditLogs: AuditLogEntry[];
}

export class UELEAdminService {
  /**
   * Helper to make authenticated requests to Admin API
   */
  private static async authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = AdminAuthService.getSessionToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      throw new Error('Unauthorized. Admin session expired or invalid. Please log in again.');
    }
    return res;
  }

  /**
   * Fetches PUBLIC dataset (published items only)
   */
  static async getPublicUELEDataset(): Promise<{
    worlds: UELEWorld[];
    regions: AdminUELERegion[];
    zones: UELEZone[];
    facilities: UELEFacility[];
    networks: UELENetwork[];
    gisLayers: UELELayer[];
    models3D: UELE3DModel[];
  }> {
    try {
      const res = await fetch('/api/uele/public');
      if (!res.ok) throw new Error('Failed to fetch public UELE dataset.');
      return await res.json();
    } catch (err) {
      console.error('[UELE Service] Error fetching public dataset:', err);
      return {
        worlds: [],
        regions: [],
        zones: [],
        facilities: [],
        networks: [],
        gisLayers: [],
        models3D: [],
      };
    }
  }

  /**
   * Fetches FULL database (all published, draft, and archived items + audit logs) for Admin
   */
  static async getFullUELEDatabase(): Promise<FullUELEDatabase> {
    try {
      const res = await this.authFetch('/api/admin/uele/all');
      if (!res.ok) throw new Error('Failed to fetch admin database.');
      return await res.json();
    } catch (err) {
      console.error('[UELE Admin Service] getFullUELEDatabase error:', err);
      return {
        worlds: [],
        regions: [],
        zones: [],
        facilities: [],
        components: [],
        networks: [],
        gisLayers: [],
        models3D: [],
        auditLogs: [],
      };
    }
  }

  /**
   * Saves (Create or Update) an entity in the UELE database
   */
  static async saveEntity<T extends { id?: string; videoId?: string }>(
    entityType: UELEAdminEntityType,
    item: T
  ): Promise<T> {
    const res = await this.authFetch(`/api/admin/uele/${entityType}`, {
      method: 'POST',
      body: JSON.stringify({ item }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `Failed to save ${entityType}.`);
    }
    const data = await res.json();
    return data.item;
  }

  /**
   * Deletes an entity from the UELE database
   */
  static async deleteEntity(
    entityType: UELEAdminEntityType,
    id: string
  ): Promise<boolean> {
    const res = await this.authFetch(`/api/admin/uele/${entityType}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `Failed to delete ${entityType}.`);
    }
    return true;
  }

  /**
   * Updates entity publication status (draft, published, archived)
   */
  static async updateStatus(
    entityType: UELEAdminEntityType,
    id: string,
    status: UELEPublicationStatus
  ): Promise<boolean> {
    const res = await this.authFetch(`/api/admin/uele/${entityType}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `Failed to update ${entityType} status.`);
    }
    return true;
  }

  /**
   * Duplicates an entity
   */
  static async duplicateEntity(
    entityType: UELEAdminEntityType,
    id: string
  ): Promise<any> {
    const res = await this.authFetch(`/api/admin/uele/${entityType}/${id}/duplicate`, {
      method: 'POST',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `Failed to duplicate ${entityType}.`);
    }
    const data = await res.json();
    return data.duplicatedItem;
  }

  /**
   * Uploads 3D Model file (GLB/GLTF) to server
   */
  static async upload3DModel(
    file: File,
    metadata: Partial<UELE3DModel>
  ): Promise<UELE3DModel> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const token = AdminAuthService.getSessionToken();
    const res = await fetch('/api/admin/models/upload', {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to upload 3D model.');
    }

    const data = await res.json();
    return data.model;
  }

  /**
   * Calculates Dashboard Summary Metrics
   */
  static calculateMetrics(db: FullUELEDatabase): AdminDashboardMetrics {
    let publishedCount = 0;
    let draftCount = 0;
    let archivedCount = 0;

    const items = [
      ...db.worlds,
      ...db.regions,
      ...db.zones,
      ...db.facilities,
      ...db.components,
      ...db.networks,
      ...db.gisLayers,
      ...db.models3D,
    ];

    items.forEach((item) => {
      const status = item.status || 'published';
      if (status === 'published') publishedCount++;
      else if (status === 'draft') draftCount++;
      else if (status === 'archived') archivedCount++;
    });

    return {
      worldsCount: db.worlds.length,
      regionsCount: db.regions.length,
      zonesCount: db.zones.length,
      facilitiesCount: db.facilities.length,
      componentsCount: db.components.length,
      networksCount: db.networks.length,
      gisLayersCount: db.gisLayers.length,
      models3DCount: db.models3D.length,
      publishedCount,
      draftCount,
      archivedCount,
    };
  }
}
