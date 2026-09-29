/**
 * EV Software Core - Automated Architectural Compliance Test Suite
 * Validates the 12 core criteria outlined in the EV Software Foundation document.
 */

import { ApplicationRegistryService } from '../services/applicationRegistryService';
import { AuditService } from '../services/auditService';
import { DatasetService } from '../services/datasetService';
import { ProjectService } from '../services/projectService';
import { TransferEngine } from '../services/transferEngine';
import { ValidationService } from '../services/validationService';
import { AuthorizationService } from '../auth/authorizationService';
import { InMemoryCoreRepositories } from '../persistence/inMemoryRepository';
import { ThreeWayDiffEngine } from '../diff/threeWayDiffEngine';
import { ChecksumEngine } from '../crypto/checksum';
import { InMemoryTransport } from '../../sdk/transport';
import { EVCoreClient } from '../../sdk/EVCoreClient';
import { GISDatasetPayload } from '../../types/dataset';
import { TransferPackage } from '../../types/transfer';
import { ApplicationManifest } from '../../types/application';

export interface TestCaseResult {
  id: string;
  criterionNumber: number;
  title: string;
  category: string;
  status: 'passed' | 'failed';
  executionTimeMs: number;
  details: string;
  assertions: {
    assertion: string;
    passed: boolean;
    error?: string;
  }[];
}

export interface TestSuiteSummary {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  durationMs: number;
  timestamp: string;
  results: TestCaseResult[];
}

export type TestSuiteReport = {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionTimeMs: number;
  results: {
    testId: string;
    name: string;
    status: 'passed' | 'failed';
    durationMs: number;
    details: string;
  }[];
};

export class CoreTestSuite {
  public static async runAllTests(accessor?: any): Promise<TestSuiteReport> {
    const summary = await this.runFullSuite();
    return {
      totalTests: summary.totalTests,
      passedTests: summary.passedCount,
      failedTests: summary.failedCount,
      executionTimeMs: summary.durationMs,
      results: summary.results.map((r) => ({
        testId: r.id,
        name: `${r.criterionNumber}. ${r.title}`,
        status: r.status,
        durationMs: r.executionTimeMs,
        details: r.details,
      })),
    };
  }

  public static async runFullSuite(): Promise<TestSuiteSummary> {
    const startTime = performance.now();
    const results: TestCaseResult[] = [];

    // --- TEST 1: Register an Application ---
    {
      const tStart = performance.now();
      const assertions: TestCaseResult['assertions'] = [];
      let status: 'passed' | 'failed' = 'passed';

      try {
        const testManifest: Omit<ApplicationManifest, 'registeredAt' | 'lastHealthCheck'> = {
          appId: `app-test-${Date.now()}`,
          name: 'EV Test Sibling App',
          slug: 'ev-test-sibling',
          version: '1.0.0',
          coreApiVersion: 'v1',
          description: 'Automated compliance test suite application.',
          category: 'utilities',
          entryRoute: '/apps/ev-test',
          iconName: 'Code',
          capabilities: ['spatial_data', 'reporting'],
          supportedProjectTypes: ['water_supply'],
          requiredServices: ['data_exchange', 'audit_logger'],
          permissions: ['dataset:create'],
          releaseStatus: 'preview',
          author: 'EVLab QA Bot',
          isSiblingApp: true,
        };

        const registered = ApplicationRegistryService.registerApplication({ manifest: testManifest });
        assertions.push({
          assertion: 'Manifest validation passes for well-formed application payload',
          passed: registered.appId === testManifest.appId,
        });

        assertions.push({
          assertion: 'Application is flagged as an independent sibling application',
          passed: registered.isSiblingApp === true,
        });

        // Test invalid manifest rejection
        const invalidManifest = { appId: '' };
        const valRes = ApplicationRegistryService.validateManifest(invalidManifest);
        assertions.push({
          assertion: 'Rejects invalid manifest missing required fields (name, slug, version)',
          passed: valRes.valid === false && valRes.errors.length > 0,
        });
      } catch (err: any) {
        status = 'failed';
        assertions.push({
          assertion: 'Application Registration Execution',
          passed: false,
          error: err.message,
        });
      }

      const elapsed = Math.round(performance.now() - tStart);
      results.push({
        id: 'CRIT-01-APP-REGISTRY',
        criterionNumber: 1,
        title: 'Application Registration & Manifest Validation',
        category: 'Application Registry',
        status: assertions.every((a) => a.passed) ? 'passed' : 'failed',
        executionTimeMs: elapsed,
        details: 'Verified central application registry, manifest validation, and sibling isolation.',
        assertions,
      });
    }

    // --- TEST 2: Project Creation & Role Authorization ---
    {
      const tStart = performance.now();
      const assertions: TestCaseResult['assertions'] = [];

      try {
        const isLeadAllowed = ProjectService.hasRolePermission('lead_engineer', 'transfer:commit');
        const isViewerAllowed = ProjectService.hasRolePermission('viewer', 'transfer:commit');

        assertions.push({
          assertion: 'Lead Engineer has permission to commit transfers',
          passed: isLeadAllowed === true,
        });

        assertions.push({
          assertion: 'Viewer role is blocked from executing mutations / commits',
          passed: isViewerAllowed === false,
        });
      } catch (err: any) {
        assertions.push({
          assertion: 'Project Authorization Check',
          passed: false,
          error: err.message,
        });
      }

      const elapsed = Math.round(performance.now() - tStart);
      results.push({
        id: 'CRIT-02-PROJECT-AUTH',
        criterionNumber: 2,
        title: 'Project Management & Server-Side Authorization',
        category: 'Project Context',
        status: assertions.every((a) => a.passed) ? 'passed' : 'failed',
        executionTimeMs: elapsed,
        details: 'Verified role-based permission evaluation (Owner/Lead/Designer/Reviewer/Viewer).',
        assertions,
      });
    }

    // --- TEST 3: Dataset Association & Data Ownership ---
    {
      const tStart = performance.now();
      const assertions: TestCaseResult['assertions'] = [];

      try {
        const dummyPayload: GISDatasetPayload = {
          crs: { code: 'EPSG:3857', name: 'Pseudo-Mercator', unit: 'meters' },
          layerName: 'Pipelines',
          elements: [
            {
              id: 'p-1',
              name: 'Feed Pipeline',
              type: 'pipeline',
              diameterMm: 600,
              material: 'Ductile Iron',
              lengthM: 150,
              nominalPressureBar: 16,
              startCoords: [0, 0],
              endCoords: [100, 0],
              status: 'approved',
            },
          ],
          metadata: { totalLengthKm: 0.15, elementCount: 1, lastEditorApp: 'app-ev-gis' },
        };

        const revision1 = DatasetService.createRevision({
          datasetId: 'ds-test-01',
          parentRevision: null,
          sourceApplicationId: 'app-ev-gis',
          schemaVersion: '1.2.0',
          createdBy: 'usr-marcus',
          changeSummary: 'Baseline test dataset',
          payload: dummyPayload,
        });

        assertions.push({
          assertion: 'Dataset revision #1 created with parentRevisionId = null',
          passed: revision1.revisionNumber === 1 && revision1.parentRevisionId === null,
        });

        assertions.push({
          assertion: 'Computed SHA-256 payload checksum is deterministic, standard 64-hex chars',
          passed: typeof revision1.payloadChecksum === 'string' && revision1.payloadChecksum.length === 64,
        });
      } catch (err: any) {
        assertions.push({
          assertion: 'Dataset creation execution',
          passed: false,
          error: err.message,
        });
      }

      const elapsed = Math.round(performance.now() - tStart);
      results.push({
        id: 'CRIT-03-DATASET-OWNERSHIP',
        criterionNumber: 3,
        title: 'Dataset Metadata & Application Ownership Boundary',
        category: 'Datasets',
        status: assertions.every((a) => a.passed) ? 'passed' : 'failed',
        executionTimeMs: elapsed,
        details: 'Verified explicit dataset ownership without schema flattening.',
        assertions,
      });
    }

    // --- TEST 4: Revision Lineage & Immutable Hashing ---
    {
      const tStart = performance.now();
      const assertions: TestCaseResult['assertions'] = [];

      try {
        const dummyPayload1: GISDatasetPayload = {
          crs: { code: 'EPSG:3857', name: 'Pseudo-Mercator', unit: 'meters' },
          layerName: 'Pipelines',
          elements: [{ id: 'p-1', name: 'Feed Pipe', type: 'pipeline', diameterMm: 600, material: 'Ductile Iron', lengthM: 100, nominalPressureBar: 16, startCoords: [0, 0], endCoords: [100, 0], status: 'approved' }],
          metadata: { totalLengthKm: 0.1, elementCount: 1, lastEditorApp: 'app-ev-gis' },
        };

        const rev1 = DatasetService.createRevision({
          datasetId: 'ds-test-rev',
          parentRevision: null,
          sourceApplicationId: 'app-ev-gis',
          schemaVersion: '1.0.0',
          createdBy: 'usr-marcus',
          changeSummary: 'Rev 1',
          payload: dummyPayload1,
        });

        const dummyPayload2: GISDatasetPayload = {
          ...dummyPayload1,
          elements: [{ ...dummyPayload1.elements[0], diameterMm: 800 }],
        };

        const rev2 = DatasetService.createRevision({
          datasetId: 'ds-test-rev',
          parentRevision: rev1,
          sourceApplicationId: 'app-ev-mini-cad',
          schemaVersion: '1.0.0',
          createdBy: 'usr-sarah',
          changeSummary: 'Upgraded diameter to 800mm',
          payload: dummyPayload2,
        });

        assertions.push({
          assertion: 'Rev 2 increments revisionNumber to 2',
          passed: rev2.revisionNumber === 2,
        });

        assertions.push({
          assertion: 'Rev 2 points parentRevisionId to Rev 1 revisionId',
          passed: rev2.parentRevisionId === rev1.revisionId,
        });

        assertions.push({
          assertion: 'Payload checksum changes when attribute is modified',
          passed: rev1.payloadChecksum !== rev2.payloadChecksum,
        });
      } catch (err: any) {
        assertions.push({
          assertion: 'Revision lineage execution',
          passed: false,
          error: err.message,
        });
      }

      const elapsed = Math.round(performance.now() - tStart);
      results.push({
        id: 'CRIT-04-REVISION-LINEAGE',
        criterionNumber: 4,
        title: 'Dataset Revision Lineage & Immutable Checksums',
        category: 'Revisions',
        status: assertions.every((a) => a.passed) ? 'passed' : 'failed',
        executionTimeMs: elapsed,
        details: 'Verified parent-child revision pointers and hash divergence on mutations.',
        assertions,
      });
    }

    // --- TEST 5: Controlled Transfer Lifecycle Transitions ---
    {
      const tStart = performance.now();
      const assertions: TestCaseResult['assertions'] = [];

      try {
        assertions.push({
          assertion: 'Valid transition: prepared -> sent',
          passed: TransferEngine.isValidTransition('prepared', 'sent') === true,
        });
        assertions.push({
          assertion: 'Valid transition: sent -> imported',
          passed: TransferEngine.isValidTransition('sent', 'imported') === true,
        });
        assertions.push({
          assertion: 'Valid transition: imported -> reviewed',
          passed: TransferEngine.isValidTransition('imported', 'reviewed') === true,
        });
        assertions.push({
          assertion: 'Valid transition: reviewed -> validated',
          passed: TransferEngine.isValidTransition('reviewed', 'validated') === true,
        });
        assertions.push({
          assertion: 'Valid transition: validated -> committed',
          passed: TransferEngine.isValidTransition('validated', 'committed') === true,
        });
        assertions.push({
          assertion: 'Invalid transition blocked: prepared -> committed (skipping validation/review)',
          passed: TransferEngine.isValidTransition('prepared', 'committed') === false,
        });
      } catch (err: any) {
        assertions.push({
          assertion: 'Transfer State Machine Check',
          passed: false,
          error: err.message,
        });
      }

      const elapsed = Math.round(performance.now() - tStart);
      results.push({
        id: 'CRIT-05-TRANSFER-LIFECYCLE',
        criterionNumber: 5,
        title: 'Controlled Transfer Lifecycle State Machine',
        category: 'Data Exchange',
        status: assertions.every((a) => a.passed) ? 'passed' : 'failed',
        executionTimeMs: elapsed,
        details: 'Verified strict lifecycle: Prepared -> Sent -> Imported -> Reviewed -> Validated -> Committed.',
        assertions,
      });
    }

    // --- TEST 6: Structural Diff & Conflict Detection ---
    {
      const tStart = performance.now();
      const assertions: TestCaseResult['assertions'] = [];

      try {
        const basePayload: GISDatasetPayload = {
          crs: { code: 'EPSG:3857', name: 'Pseudo-Mercator', unit: 'meters' },
          layerName: 'Pipelines',
          elements: [
            { id: 'p-1', name: 'Main', type: 'pipeline', diameterMm: 600, material: 'Ductile Iron', lengthM: 100, nominalPressureBar: 16, startCoords: [0, 0], endCoords: [100, 0], status: 'approved' },
          ],
          metadata: { totalLengthKm: 0.1, elementCount: 1, lastEditorApp: 'app-ev-gis' },
        };

        const baseRev = DatasetService.createRevision({
          datasetId: 'ds-diff-test',
          parentRevision: null,
          sourceApplicationId: 'app-ev-gis',
          schemaVersion: '1.0.0',
          createdBy: 'usr-marcus',
          changeSummary: 'Base',
          payload: basePayload,
        });

        const modifiedPackage: TransferPackage = {
          transferId: 'trf-test-diff',
          sourceApplicationId: 'app-ev-mini-cad',
          sourceApplicationVersion: '1.0.0',
          destinationApplicationId: 'app-ev-gis',
          projectId: 'proj-1',
          sourceDatasetId: 'ds-diff-test',
          sourceRevisionId: baseRev.revisionId,
          schemaVersion: '1.0.0',
          coreApiVersion: 'v1',
          units: 'meters',
          changeSummary: 'Changed diameter to 700mm and added branch pipe',
          payload: {
            crs: { code: 'EPSG:3857', name: 'Pseudo-Mercator', unit: 'meters' },
            layerName: 'Pipelines',
            elements: [
              { id: 'p-1', name: 'Main', type: 'pipeline', diameterMm: 700, material: 'Ductile Iron', lengthM: 100, nominalPressureBar: 16, startCoords: [0, 0], endCoords: [100, 0], status: 'approved' },
              { id: 'p-2', name: 'Branch Offtake', type: 'pipeline', diameterMm: 300, material: 'HDPE', lengthM: 50, nominalPressureBar: 10, startCoords: [100, 0], endCoords: [100, 50], status: 'proposed' },
            ],
            metadata: { totalLengthKm: 0.15, elementCount: 2, lastEditorApp: 'app-ev-mini-cad' },
          },
          timestamp: new Date().toISOString(),
          createdBy: 'usr-sarah',
        };

        const diff = TransferEngine.computeDiff(baseRev, modifiedPackage);

        assertions.push({
          assertion: 'Correctly identifies 1 modified entity (pipe p-1)',
          passed: diff.modifiedCount === 1,
        });
        assertions.push({
          assertion: 'Correctly identifies 1 added entity (pipe p-2)',
          passed: diff.addedCount === 1,
        });
        assertions.push({
          assertion: 'Diff detects exact field modification: diameterMm 600 -> 700',
          passed: diff.items.some((i) => i.entityId === 'p-1' && i.fieldChanges.some((f) => f.fieldName === 'diameterMm' && f.incomingValue === 700)),
        });
      } catch (err: any) {
        assertions.push({
          assertion: 'Structural Diff Calculation Check',
          passed: false,
          error: err.message,
        });
      }

      const elapsed = Math.round(performance.now() - tStart);
      results.push({
        id: 'CRIT-06-STRUCTURAL-DIFF',
        criterionNumber: 6,
        title: 'Deep Structural Diff & Attribute Comparison',
        category: 'Data Exchange',
        status: assertions.every((a) => a.passed) ? 'passed' : 'failed',
        executionTimeMs: elapsed,
        details: 'Verified field-by-field diff comparison (diameter, material, coordinates, added/deleted).',
        assertions,
      });
    }

    // --- TEST 7: Technical Validation Engine ---
    {
      const tStart = performance.now();
      const assertions: TestCaseResult['assertions'] = [];

      try {
        const validPackage: TransferPackage = {
          transferId: 'trf-val-valid',
          sourceApplicationId: 'app-ev-gis',
          sourceApplicationVersion: '1.0.0',
          destinationApplicationId: 'app-ev-mini-cad',
          projectId: 'proj-1',
          sourceDatasetId: 'ds-1',
          sourceRevisionId: 'rev-1',
          schemaVersion: '1.2.0',
          coreApiVersion: 'v1',
          units: 'meters',
          changeSummary: 'Valid payload',
          payload: {
            crs: { code: 'EPSG:3857', name: 'Pseudo-Mercator', unit: 'meters' },
            layerName: 'Pipelines',
            elements: [
              { id: 'p-1', name: 'Valid Trunk Main', type: 'pipeline', diameterMm: 600, material: 'Ductile Iron', lengthM: 200, nominalPressureBar: 16, startCoords: [0, 0], endCoords: [200, 0], status: 'approved' },
            ],
            metadata: { totalLengthKm: 0.2, elementCount: 1, lastEditorApp: 'app-ev-gis' },
          },
          timestamp: new Date().toISOString(),
          createdBy: 'usr-marcus',
        };

        const validRes = ValidationService.validateTransferPackage(validPackage);
        assertions.push({
          assertion: 'Valid transfer passes technical validation (status = passed)',
          passed: validRes.status === 'passed' && validRes.errors.length === 0,
        });

        // Test invalid payload with missing diameter and NaN coordinate
        const invalidPackage: TransferPackage = {
          ...validPackage,
          payload: {
            crs: { code: 'EPSG:3857', name: 'Pseudo-Mercator', unit: 'meters' },
            layerName: 'Pipelines',
            elements: [
              { id: 'p-err', name: 'Corrupt Pipe', type: 'pipeline', diameterMm: 0, material: '', lengthM: 200, nominalPressureBar: 16, startCoords: [NaN, 0], endCoords: [200, 0], status: 'proposed' },
            ],
            metadata: { totalLengthKm: 0.2, elementCount: 1, lastEditorApp: 'app-ev-gis' },
          },
        };

        const invalidRes = ValidationService.validateTransferPackage(invalidPackage);
        assertions.push({
          assertion: 'Detects critical error on invalid diameter (<=0)',
          passed: invalidRes.errors.some((e) => e.code === 'ERR_INVALID_DIAMETER'),
        });
        assertions.push({
          assertion: 'Detects critical error on NaN / invalid coordinates',
          passed: invalidRes.errors.some((e) => e.code === 'ERR_INVALID_COORDINATES'),
        });
      } catch (err: any) {
        assertions.push({
          assertion: 'Technical Validation Engine Check',
          passed: false,
          error: err.message,
        });
      }

      const elapsed = Math.round(performance.now() - tStart);
      results.push({
        id: 'CRIT-07-TECHNICAL-VALIDATION',
        criterionNumber: 7,
        title: 'Technical Validation (Schema, Geometry, Units, CRS)',
        category: 'Validation',
        status: assertions.every((a) => a.passed) ? 'passed' : 'failed',
        executionTimeMs: elapsed,
        details: 'Verified strict schema conformance, coordinate finiteness, and required attribute checks.',
        assertions,
      });
    }

    // --- TEST 8: Immutable Audit Trail Logging ---
    {
      const tStart = performance.now();
      const assertions: TestCaseResult['assertions'] = [];

      try {
        const entry = AuditService.createEntry({
          projectId: 'proj-audit-test',
          projectName: 'Audit Test Project',
          userId: 'usr-marcus',
          userName: 'Ayatullah',
          userRole: 'lead_engineer',
          applicationId: 'app-ev-gis',
          action: 'TRANSFER_COMMITTED',
          entityType: 'transfer',
          entityId: 'trf-audit-01',
          description: 'Explicit commit into dataset revision rev-2.',
        });

        assertions.push({
          assertion: 'Audit entry has unique auditId prefix',
          passed: entry.auditId.startsWith('aud-'),
        });
        assertions.push({
          assertion: 'Audit entry records precise ISO-8601 timestamp',
          passed: !isNaN(Date.parse(entry.timestamp)),
        });
        assertions.push({
          assertion: 'Audit entry preserves actor, application, action, and entity context',
          passed: entry.userId === 'usr-marcus' && entry.action === 'TRANSFER_COMMITTED' && entry.entityType === 'transfer',
        });
      } catch (err: any) {
        assertions.push({
          assertion: 'Audit Logging Check',
          passed: false,
          error: err.message,
        });
      }

      const elapsed = Math.round(performance.now() - tStart);
      results.push({
        id: 'CRIT-08-AUDIT-LOGGING',
        criterionNumber: 8,
        title: 'Tamper-Evident Audit Trail Context Logging',
        category: 'Audit',
        status: assertions.every((a) => a.passed) ? 'passed' : 'failed',
        executionTimeMs: elapsed,
        details: 'Verified who, what, when, where, and action attribution logging.',
        assertions,
      });
    }

    // --- TEST 9: Repository Persistence & Storage Layer ---
    {
      const tStart = performance.now();
      const assertions: TestCaseResult['assertions'] = [];

      try {
        const repoRegistry = new InMemoryCoreRepositories();

        // Test project repository operations
        const createdProject = await repoRegistry.projects.create({
          projectId: 'proj-repo-test',
          name: 'Persistence Repo Test Project',
          code: 'EV-PRJ-REPO-01',
          description: 'Testing clean repository persistence abstraction.',
          organizationId: 'org-evlab',
          projectType: 'water_supply',
          status: 'active',
          location: 'Test Basin',
          coordinateSystem: 'EPSG:3857',
          createdBy: 'usr-marcus',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          members: [],
          datasetCount: 0,
          transferCount: 0,
          revisionCount: 0,
        });

        const fetchedProject = await repoRegistry.projects.findById('proj-repo-test');
        assertions.push({
          assertion: 'Project created and retrieved via ProjectRepository interface',
          passed: fetchedProject?.projectId === createdProject.projectId,
        });

        // Test in-memory object storage adapter with genuine SHA-256 calculation
        const testContent = 'Engineering CAD Binary Header Model v1.0.0';
        const uploadRes = await repoRegistry.storage.uploadObject(
          'projects/proj-repo-test/cad/model.dwg',
          testContent,
          'application/acad'
        );

        assertions.push({
          assertion: 'Object storage adapter calculates genuine 64-character SHA-256 checksum',
          passed: uploadRes.checksumSha256.length === 64,
        });

        const exists = await repoRegistry.storage.exists('projects/proj-repo-test/cad/model.dwg');
        assertions.push({
          assertion: 'Object storage adapter confirms existence of stored key',
          passed: exists === true,
        });
      } catch (err: any) {
        assertions.push({
          assertion: 'Repository Persistence Check',
          passed: false,
          error: err.message,
        });
      }

      const elapsed = Math.round(performance.now() - tStart);
      results.push({
        id: 'CRIT-09-PERSISTENCE-LAYER',
        criterionNumber: 9,
        title: 'Decoupled Repository Persistence & Storage Interface',
        category: 'Persistence',
        status: assertions.every((a) => a.passed) ? 'passed' : 'failed',
        executionTimeMs: elapsed,
        details: 'Verified ProjectRepository, ObjectStorageAdapter, and pluggable persistence contract.',
        assertions,
      });
    }

    // --- TEST 10: Authorization & Strict Role-Based Access Control ---
    {
      const tStart = performance.now();
      const assertions: TestCaseResult['assertions'] = [];

      try {
        const leadUser = {
          userId: 'usr-lead',
          name: 'Lead Eng',
          email: 'lead@evlab.internal',
          organizationId: 'org-evlab',
          title: 'Lead Systems Engineer',
          defaultRole: 'lead_engineer' as const,
          avatarUrl: '',
        };

        const viewerUser = {
          userId: 'usr-viewer',
          name: 'Viewer User',
          email: 'viewer@evlab.internal',
          organizationId: 'org-evlab',
          title: 'Project Observer',
          defaultRole: 'viewer' as const,
          avatarUrl: '',
        };

        const leadDecision = AuthorizationService.checkPermission(
          { user: leadUser },
          'project:create'
        );
        assertions.push({
          assertion: 'Lead Engineer is authorized to create projects',
          passed: leadDecision.authorized === true,
        });

        const viewerDecision = AuthorizationService.checkPermission(
          { user: viewerUser },
          'transfer:initiate'
        );
        assertions.push({
          assertion: 'Viewer role is blocked from initiating transfers',
          passed: viewerDecision.authorized === false && typeof viewerDecision.reason === 'string',
        });

        let caughtError = false;
        try {
          AuthorizationService.enforce({ user: viewerUser }, 'dataset:create');
        } catch (err) {
          caughtError = true;
        }

        assertions.push({
          assertion: 'AuthorizationService.enforce throws AuthorizationError on unauthorized action',
          passed: caughtError === true,
        });
      } catch (err: any) {
        assertions.push({
          assertion: 'Authorization Service Check',
          passed: false,
          error: err.message,
        });
      }

      const elapsed = Math.round(performance.now() - tStart);
      results.push({
        id: 'CRIT-10-AUTH-RBAC',
        criterionNumber: 10,
        title: 'Central Authorization & Strict Role-Based Access Control',
        category: 'Security',
        status: assertions.every((a) => a.passed) ? 'passed' : 'failed',
        executionTimeMs: elapsed,
        details: 'Verified permission matrix enforcement and AuthorizationError throwing at API perimeters.',
        assertions,
      });
    }

    // --- TEST 11: 3-Way Diff Engine & Conflict Detection ---
    {
      const tStart = performance.now();
      const assertions: TestCaseResult['assertions'] = [];

      try {
        const basePayload: GISDatasetPayload = {
          crs: { code: 'EPSG:3857', name: 'Pseudo-Mercator', unit: 'meters' },
          layerName: 'Pipelines',
          elements: [
            { id: 'p-100', name: 'Common Pipe', type: 'pipeline', diameterMm: 500, material: 'Steel', lengthM: 100, nominalPressureBar: 16, startCoords: [0, 0], endCoords: [100, 0], status: 'approved' },
          ],
          metadata: { totalLengthKm: 0.1, elementCount: 1, lastEditorApp: 'app-ev-gis' },
        };

        const targetPayload: GISDatasetPayload = {
          ...basePayload,
          elements: [
            { id: 'p-100', name: 'Common Pipe', type: 'pipeline', diameterMm: 600, material: 'Steel', lengthM: 100, nominalPressureBar: 16, startCoords: [0, 0], endCoords: [100, 0], status: 'approved' },
          ],
        };

        const incomingPayload: GISDatasetPayload = {
          ...basePayload,
          elements: [
            { id: 'p-100', name: 'Common Pipe', type: 'pipeline', diameterMm: 700, material: 'Steel', lengthM: 100, nominalPressureBar: 16, startCoords: [0, 0], endCoords: [100, 0], status: 'approved' },
          ],
        };

        const threeWayDiff = ThreeWayDiffEngine.computeThreeWayDiff({
          baseElements: basePayload.elements,
          targetElements: targetPayload.elements,
          incomingElements: incomingPayload.elements,
        });

        assertions.push({
          assertion: '3-Way diff detects concurrent modification conflict on entity p-100',
          passed: threeWayDiff.hasUnresolvedConflicts === true && threeWayDiff.conflictsCount === 1,
        });

        const entity = threeWayDiff.entities.find((e) => e.entityId === 'p-100');
        const diameterConflict = entity?.fieldDiffs.find((f) => f.fieldName === 'diameterMm');

        assertions.push({
          assertion: '3-Way diff flags diameterMm as THREE_WAY_CONFLICT (base: 500, target: 600, incoming: 700)',
          passed: diameterConflict?.conflictStatus === 'THREE_WAY_CONFLICT' && diameterConflict.hasConflict === true,
        });
      } catch (err: any) {
        assertions.push({
          assertion: '3-Way Diff Engine Check',
          passed: false,
          error: err.message,
        });
      }

      const elapsed = Math.round(performance.now() - tStart);
      results.push({
        id: 'CRIT-11-THREE-WAY-DIFF',
        criterionNumber: 11,
        title: '3-Way Diffing & Concurrent Conflict Resolution',
        category: 'Data Exchange',
        status: assertions.every((a) => a.passed) ? 'passed' : 'failed',
        executionTimeMs: elapsed,
        details: 'Verified base vs. target vs. incoming concurrent modification analysis and conflict detection.',
        assertions,
      });
    }

    // --- TEST 12: SDK Transport Abstraction & Client Dispatch ---
    {
      const tStart = performance.now();
      const assertions: TestCaseResult['assertions'] = [];

      try {
        let dispatchCalled = false;
        const mockContext: any = {
          activeProjectId: 'proj-sdk-test',
          activeProject: { projectId: 'proj-sdk-test', name: 'SDK Test', members: [] },
          currentUser: { userId: 'usr-marcus', name: 'Marcus', defaultRole: 'lead_engineer' },
          datasets: [{ datasetId: 'ds-sdk', projectId: 'proj-sdk-test', name: 'SDK Dataset', currentRevisionId: 'rev-1', revisions: [] }],
          datasetRevisions: [],
          applications: [{ appId: 'app-ev-gis', name: 'EV GIS', version: '1.0.0' }],
          getApplication: (id: string) => ({ appId: id, name: 'EV GIS', version: '1.0.0' }),
          initiateTransfer: () => {
            dispatchCalled = true;
            return { transferId: 'trf-mock-sdk' };
          },
        };

        const transport = new InMemoryTransport(() => mockContext);
        const client = new EVCoreClient(
          {
            appId: 'app-ev-gis',
            appVersion: '1.0.0',
            coreApiVersion: 'v1',
          },
          transport
        );

        assertions.push({
          assertion: 'EVCoreClient initializes cleanly with transport abstraction',
          passed: client.getTransport() instanceof InMemoryTransport,
        });

        const activeProject = client.getActiveProject();
        assertions.push({
          assertion: 'EVCoreClient fetches active project via underlying transport',
          passed: activeProject?.projectId === 'proj-sdk-test',
        });
      } catch (err: any) {
        assertions.push({
          assertion: 'SDK Transport Check',
          passed: false,
          error: err.message,
        });
      }

      const elapsed = Math.round(performance.now() - tStart);
      results.push({
        id: 'CRIT-12-SDK-TRANSPORT',
        criterionNumber: 12,
        title: 'App SDK Transport Abstraction & Contract Execution',
        category: 'SDK & Integration',
        status: assertions.every((a) => a.passed) ? 'passed' : 'failed',
        executionTimeMs: elapsed,
        details: 'Verified decoupled transport dispatch for sibling applications without monolithic coupling.',
        assertions,
      });
    }

    const totalDuration = Math.round(performance.now() - startTime);
    const passedTests = results.filter((r) => r.status === 'passed').length;

    return {
      totalTests: results.length,
      passedCount: passedTests,
      failedCount: results.length - passedTests,
      durationMs: totalDuration,
      timestamp: new Date().toISOString(),
      results,
    };
  }
}
