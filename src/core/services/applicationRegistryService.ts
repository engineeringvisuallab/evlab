/**
 * EV Software Core - Application Registry Service
 * Manages the central manifest registry, capability queries, and API compatibility.
 */

import { ApplicationManifest, ApplicationRegistrationPayload } from '../../types/application';

export class ApplicationRegistryService {
  private static registeredApps: Map<string, ApplicationManifest> = new Map();

  public static initialize(initialApps: ApplicationManifest[]) {
    this.registeredApps.clear();
    for (const app of initialApps) {
      this.registeredApps.set(app.appId, { ...app });
    }
  }

  public static listApplications(): ApplicationManifest[] {
    return Array.from(this.registeredApps.values());
  }

  public static getApplication(appId: string): ApplicationManifest | undefined {
    return this.registeredApps.get(appId);
  }

  public static getApplicationBySlug(slug: string): ApplicationManifest | undefined {
    return Array.from(this.registeredApps.values()).find(a => a.slug === slug);
  }

  public static validateManifest(manifest: Partial<ApplicationManifest>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!manifest.appId) errors.push('appId is required');
    if (!manifest.name) errors.push('name is required');
    if (!manifest.slug) errors.push('slug is required');
    if (!manifest.version) errors.push('version is required');
    if (!manifest.coreApiVersion) errors.push('coreApiVersion is required');
    if (!manifest.entryRoute) errors.push('entryRoute is required');
    if (!manifest.category) errors.push('category is required');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public static registerApplication(payload: ApplicationRegistrationPayload): ApplicationManifest {
    const validation = this.validateManifest(payload.manifest);
    if (!validation.valid) {
      throw new Error(`Invalid Application Manifest: ${validation.errors.join(', ')}`);
    }

    if (this.registeredApps.has(payload.manifest.appId)) {
      throw new Error(`Application with appId '${payload.manifest.appId}' is already registered.`);
    }

    const newApp: ApplicationManifest = {
      ...payload.manifest,
      registeredAt: new Date().toISOString(),
      lastHealthCheck: new Date().toISOString(),
      isSiblingApp: true,
    };

    this.registeredApps.set(newApp.appId, newApp);
    return newApp;
  }
}
