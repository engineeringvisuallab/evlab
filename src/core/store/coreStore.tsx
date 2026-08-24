/**
 * EV Software Core - Central State Manager & Context
 * Provides persistent state, event bus, and high-level operations for EV Software Core.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ApplicationManifest, ApplicationRegistrationPayload } from '../../types/application';
import { AuditLogEntry } from '../../types/audit';
import { Organization, Project, ProjectMember, User, UserRole } from '../../types/core';
import { Dataset, DatasetRevision, DatasetType, GenericDatasetPayload, GISDatasetPayload } from '../../types/dataset';
import { FileReference } from '../../types/storage';
import { Transfer, TransferPackage, TransferState, ConflictResolutionStrategy } from '../../types/transfer';
import { ValidationResult } from '../../types/validation';
import { SDKNotification } from '../../types/sdk';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_DATASET_REVISIONS,
  INITIAL_DATASETS,
  INITIAL_FILES,
  INITIAL_ORGANIZATION,
  INITIAL_PROJECTS,
  INITIAL_TRANSFERS,
  INITIAL_USERS,
  REGISTERED_APPLICATIONS,
} from './initialData';
import { ApplicationRegistryService } from '../services/applicationRegistryService';
import { AuditService } from '../services/auditService';
import { DatasetService } from '../services/datasetService';
import { TransferEngine } from '../services/transferEngine';
import { ValidationService } from '../services/validationService';
import { AuthorizationService } from '../auth/authorizationService';
import { ThreeWayDiffEngine } from '../diff/threeWayDiffEngine';
import { CoreRepositoryRegistry } from '../persistence/interfaces';
import { InMemoryCoreRepositories } from '../persistence/inMemoryRepository';

interface CoreContextType {
  // Repositories
  repositories: CoreRepositoryRegistry;

  // Org & Identity
  organization: Organization;
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentRole: UserRole;

  // Applications
  applications: ApplicationManifest[];
  registerApplication: (payload: ApplicationRegistrationPayload) => ApplicationManifest;
  getApplication: (appId: string) => ApplicationManifest | undefined;

  // Projects
  projects: Project[];
  activeProjectId: string;
  activeProject: Project | null;
  setActiveProjectId: (projectId: string) => void;
  createProject: (projectData: Partial<Project>) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;

  // Datasets & Revisions
  datasets: Dataset[];
  datasetRevisions: DatasetRevision[];
  revisions: DatasetRevision[];
  getDatasetsByProject: (projectId: string) => Dataset[];
  getDataset: (datasetId: string) => Dataset | undefined;
  getRevisionsForDataset: (datasetId: string) => DatasetRevision[];
  createDataset: (params: {
    projectId: string;
    ownerApplicationId: string;
    name: string;
    description: string;
    datasetType: DatasetType;
    schemaVersion?: string;
    initialPayload: GenericDatasetPayload;
  }) => { dataset: Dataset; revision: DatasetRevision };
  commitNewRevision: (params: {
    datasetId: string;
    sourceAppId: string;
    changeSummary: string;
    payload: GenericDatasetPayload;
    validationState?: 'validated' | 'warning' | 'unvalidated';
  }) => DatasetRevision;

  // Transfers (Data Exchange)
  transfers: Transfer[];
  getTransfersByProject: (projectId: string) => Transfer[];
  getTransfer: (transferId: string) => Transfer | undefined;
  initiateTransfer: (params: {
    projectId: string;
    sourceApplicationId: string;
    destinationApplicationId: string;
    sourceDatasetId: string;
    sourceRevisionId?: string;
    changeSummary: string;
    payload: GenericDatasetPayload;
    units?: string;
    crs?: string;
  }) => Transfer;
  advanceTransferState: (transferId: string, nextState: TransferState, notes?: string) => Transfer;
  updateTransferState: (transferId: string, nextState: TransferState, options?: { notes?: string }) => Transfer;
  resolveTransferConflict: (
    transferId: string,
    entityId: string,
    fieldName: string,
    strategy: ConflictResolutionStrategy,
    manualValue?: unknown
  ) => Transfer;
  reviewTransfer: (transferId: string, reviewNotes: string) => Transfer;
  validateTransfer: (transferId: string) => { transfer: Transfer; validation: ValidationResult };
  commitTransfer: (transferId: string, notes?: string) => { transfer: Transfer; newRevision: DatasetRevision };
  rejectTransfer: (transferId: string, reason: string) => Transfer;

  // Validation
  validationResults: ValidationResult[];
  runTechnicalValidation: (pkg: TransferPackage) => ValidationResult;
  runEngineeringValidation: (payload: GenericDatasetPayload, entityId: string) => ValidationResult;

  // Audit
  auditLogs: AuditLogEntry[];
  recordAudit: (params: Parameters<typeof AuditService.createEntry>[0]) => void;

  // Files
  files: FileReference[];
  uploadFileReference: (fileRef: Partial<FileReference>) => FileReference;

  // Notifications
  notifications: SDKNotification[];
  addNotification: (notif: Omit<SDKNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Reset demo
  resetToInitialState: () => void;
}

const CoreContext = createContext<CoreContextType | null>(null);

const STORAGE_KEY_PREFIX = 'ev_software_core_state_v1_';

export const CoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize services
  useEffect(() => {
    ApplicationRegistryService.initialize(REGISTERED_APPLICATIONS);
  }, []);

  // State definitions with local storage fallback
  const [organization] = useState<Organization>(INITIAL_ORGANIZATION);
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  const [applications, setApplications] = useState<ApplicationManifest[]>(() => {
    return REGISTERED_APPLICATIONS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    return INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECTS[0].projectId);

  const [datasets, setDatasets] = useState<Dataset[]>(() => {
    return INITIAL_DATASETS;
  });

  const [datasetRevisions, setDatasetRevisions] = useState<DatasetRevision[]>(() => {
    return INITIAL_DATASET_REVISIONS;
  });

  const [transfers, setTransfers] = useState<Transfer[]>(() => {
    return INITIAL_TRANSFERS;
  });

  const [validationResults, setValidationResults] = useState<ValidationResult[]>([
    INITIAL_TRANSFERS[0].validationResult!,
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    return INITIAL_AUDIT_LOGS;
  });

  const [files, setFiles] = useState<FileReference[]>(() => {
    return INITIAL_FILES;
  });

  // Sync state with PostgreSQL backend on initial load
  useEffect(() => {
    async function loadFromPostgresBackend() {
      try {
        const [projRes, appRes, trfRes, auditRes] = await Promise.allSettled([
          fetch('/api/projects').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/applications').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/transfers?projectId=proj-ev-master').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/audit?projectId=proj-ev-master').then((r) => (r.ok ? r.json() : null)),
        ]);

        if (projRes.status === 'fulfilled' && projRes.value && projRes.value.length > 0) {
          setProjects(projRes.value);
        }
        if (appRes.status === 'fulfilled' && appRes.value && appRes.value.length > 0) {
          setApplications(appRes.value);
        }
        if (trfRes.status === 'fulfilled' && trfRes.value && trfRes.value.length > 0) {
          setTransfers(trfRes.value);
        }
        if (auditRes.status === 'fulfilled' && auditRes.value && auditRes.value.length > 0) {
          setAuditLogs(auditRes.value);
        }
      } catch (err) {
        console.warn('Backend PostgreSQL loaded with fallback context:', err);
      }
    }
    loadFromPostgresBackend();
  }, []);

  const [notifications, setNotifications] = useState<SDKNotification[]>([
    {
      id: 'notif-welcome',
      timestamp: new Date().toISOString(),
      type: 'system_alert',
      title: 'EV Software Core Initialized',
      message: 'Core API v1 online with 8 registered engineering applications and 3 active projects.',
      read: false,
    },
  ]);

  const activeProject = useMemo(() => {
    return projects.find((p) => p.projectId === activeProjectId) || projects[0] || null;
  }, [projects, activeProjectId]);

  const currentRole = useMemo<UserRole>(() => {
    return AuthorizationService.getEffectiveRole(currentUser, activeProject);
  }, [currentUser, activeProject]);

  // Seed repositories registry
  const repositories = useMemo<CoreRepositoryRegistry>(() => {
    return new InMemoryCoreRepositories({
      projects,
      applications,
      datasets,
      revisions: datasetRevisions,
      transfers,
      validationResults,
      auditLogs,
      files,
    });
  }, [projects, applications, datasets, datasetRevisions, transfers, validationResults, auditLogs, files]);

  // Notifications helper
  const addNotification = useCallback(
    (notif: Omit<SDKNotification, 'id' | 'timestamp' | 'read'>) => {
      const newNotif: SDKNotification = {
        ...notif,
        id: `notif-${Date.now().toString(36)}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Audit helper
  const recordAudit = useCallback(
    (params: Parameters<typeof AuditService.createEntry>[0]) => {
      const entry = AuditService.createEntry(params);
      setAuditLogs((prev) => [entry, ...prev]);
    },
    []
  );

  // Application operations
  const registerApplication = useCallback(
    (payload: ApplicationRegistrationPayload): ApplicationManifest => {
      AuthorizationService.enforce(
        { user: currentUser, project: activeProject },
        'app:register'
      );

      const newApp = ApplicationRegistryService.registerApplication(payload);
      setApplications((prev) => [...prev, newApp]);

      recordAudit({
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentRole,
        action: 'APPLICATION_REGISTERED',
        entityType: 'application',
        entityId: newApp.appId,
        entityName: newApp.name,
        description: `Registered new application manifest: ${newApp.name} (${newApp.slug}@${newApp.version}) with Core API ${newApp.coreApiVersion}.`,
      });

      addNotification({
        type: 'system_alert',
        title: 'New Application Registered',
        message: `${newApp.name} (v${newApp.version}) is now available in EV Software Core.`,
      });

      return newApp;
    },
    [currentUser, activeProject, currentRole, recordAudit, addNotification]
  );

  const getApplication = useCallback(
    (appId: string) => applications.find((a) => a.appId === appId),
    [applications]
  );

  // Project operations
  const createProject = useCallback(
    (projectData: Partial<Project>): Project => {
      AuthorizationService.enforce(
        { user: currentUser, project: null },
        'project:create'
      );

      const newProjectId = `proj-${Date.now().toString(36)}`;
      const newProject: Project = {
        projectId: newProjectId,
        name: projectData.name || 'Untitled Engineering Project',
        code: projectData.code || `EV-PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        description: projectData.description || 'EV Software Core project workspace.',
        organizationId: organization.organizationId,
        projectType: projectData.projectType || 'general',
        status: projectData.status || 'active',
        location: projectData.location || 'Regional Zone',
        coordinateSystem: projectData.coordinateSystem || 'EPSG:3857',
        createdBy: currentUser.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: [
          {
            projectMemberId: `pm-${Date.now()}`,
            projectId: newProjectId,
            userId: currentUser.userId,
            user: currentUser,
            role: 'owner',
            permissions: [
              'project:read',
              'project:edit',
              'project:manage',
              'dataset:create',
              'dataset:read',
              'dataset:edit',
              'transfer:create',
              'transfer:review',
              'transfer:validate',
              'transfer:commit',
              'transfer:reject',
              'revision:create',
              'audit:read',
              'app:register',
              'storage:upload',
            ],
            joinedAt: new Date().toISOString(),
          },
        ],
        datasetCount: 0,
        transferCount: 0,
        revisionCount: 0,
      };

      setProjects((prev) => [newProject, ...prev]);
      setActiveProjectId(newProjectId);

      recordAudit({
        projectId: newProjectId,
        projectName: newProject.name,
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentRole,
        action: 'PROJECT_CREATED',
        entityType: 'project',
        entityId: newProjectId,
        entityName: newProject.name,
        description: `Created new project workspace '${newProject.name}' with code ${newProject.code}.`,
      });

      addNotification({
        type: 'system_alert',
        title: 'Project Created',
        message: `Project workspace '${newProject.name}' is now active.`,
      });

      return newProject;
    },
    [currentUser, currentRole, organization.organizationId, recordAudit, addNotification]
  );

  const updateProject = useCallback(
    (projectId: string, updates: Partial<Project>) => {
      AuthorizationService.enforce(
        { user: currentUser, project: activeProject },
        'project:edit'
      );

      setProjects((prev) =>
        prev.map((p) =>
          p.projectId === projectId
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p
        )
      );
    },
    [currentUser, activeProject]
  );

  // Datasets operations
  const getDatasetsByProject = useCallback(
    (projectId: string) => datasets.filter((d) => d.projectId === projectId),
    [datasets]
  );

  const getDataset = useCallback(
    (datasetId: string) => datasets.find((d) => d.datasetId === datasetId),
    [datasets]
  );

  const getRevisionsForDataset = useCallback(
    (datasetId: string) =>
      datasetRevisions
        .filter((r) => r.datasetId === datasetId)
        .sort((a, b) => b.revisionNumber - a.revisionNumber),
    [datasetRevisions]
  );

  const createDataset = useCallback(
    (params: {
      projectId: string;
      ownerApplicationId: string;
      name: string;
      description: string;
      datasetType: DatasetType;
      schemaVersion?: string;
      initialPayload: GenericDatasetPayload;
    }) => {
      AuthorizationService.enforce(
        { user: currentUser, project: activeProject },
        'dataset:create'
      );

      const datasetId = `ds-${params.ownerApplicationId.replace('app-', '')}-${Date.now().toString(36)}`;
      const schemaVer = params.schemaVersion || '1.0.0';

      const initialRevision = DatasetService.createRevision({
        datasetId,
        parentRevision: null,
        sourceApplicationId: params.ownerApplicationId,
        schemaVersion: schemaVer,
        createdBy: currentUser.userId,
        changeSummary: 'Initial dataset baseline creation.',
        payload: params.initialPayload,
        validationState: 'validated',
      });

      const newDataset: Dataset = {
        datasetId,
        projectId: params.projectId,
        ownerApplicationId: params.ownerApplicationId,
        name: params.name,
        description: params.description,
        datasetType: params.datasetType,
        schemaVersion: schemaVer,
        currentRevisionId: initialRevision.revisionId,
        currentRevisionNumber: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.userId,
        revisions: [initialRevision],
      };

      setDatasets((prev) => [newDataset, ...prev]);
      setDatasetRevisions((prev) => [initialRevision, ...prev]);

      // Update project counters
      setProjects((prev) =>
        prev.map((p) =>
          p.projectId === params.projectId
            ? {
                ...p,
                datasetCount: (p.datasetCount || 0) + 1,
                revisionCount: (p.revisionCount || 0) + 1,
              }
            : p
        )
      );

      recordAudit({
        projectId: params.projectId,
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentRole,
        applicationId: params.ownerApplicationId,
        action: 'DATASET_CREATED',
        entityType: 'dataset',
        entityId: datasetId,
        entityName: params.name,
        description: `Created dataset '${params.name}' with initial revision ${initialRevision.revisionId}.`,
      });

      return { dataset: newDataset, revision: initialRevision };
    },
    [currentUser, activeProject, currentRole, recordAudit]
  );

  const commitNewRevision = useCallback(
    (params: {
      datasetId: string;
      sourceAppId: string;
      changeSummary: string;
      payload: GenericDatasetPayload;
      validationState?: 'validated' | 'warning' | 'unvalidated';
    }): DatasetRevision => {
      AuthorizationService.enforce(
        { user: currentUser, project: activeProject },
        'revision:create'
      );

      const dataset = datasets.find((d) => d.datasetId === params.datasetId);
      if (!dataset) throw new Error(`Dataset '${params.datasetId}' not found.`);

      const parentRev =
        datasetRevisions.find((r) => r.revisionId === dataset.currentRevisionId) || null;

      const newRev = DatasetService.createRevision({
        datasetId: params.datasetId,
        parentRevision: parentRev,
        sourceApplicationId: params.sourceAppId,
        schemaVersion: dataset.schemaVersion,
        createdBy: currentUser.userId,
        changeSummary: params.changeSummary,
        payload: params.payload,
        validationState: params.validationState || 'validated',
      });

      setDatasetRevisions((prev) => [newRev, ...prev]);

      setDatasets((prev) =>
        prev.map((d) =>
          d.datasetId === params.datasetId
            ? {
                ...d,
                currentRevisionId: newRev.revisionId,
                currentRevisionNumber: newRev.revisionNumber,
                updatedAt: new Date().toISOString(),
              }
            : d
        )
      );

      // Update project revision count
      setProjects((prev) =>
        prev.map((p) =>
          p.projectId === dataset.projectId
            ? { ...p, revisionCount: (p.revisionCount || 0) + 1 }
            : p
        )
      );

      recordAudit({
        projectId: dataset.projectId,
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentRole,
        applicationId: params.sourceAppId,
        action: 'DATASET_REVISION_COMMITTED',
        entityType: 'revision',
        entityId: newRev.revisionId,
        entityName: `Rev #${newRev.revisionNumber} for ${dataset.name}`,
        description: `Committed new dataset revision #${newRev.revisionNumber} for '${dataset.name}'. Summary: ${params.changeSummary}`,
      });

      addNotification({
        type: 'revision_committed',
        title: 'New Revision Committed',
        message: `Revision #${newRev.revisionNumber} generated for '${dataset.name}'.`,
      });

      return newRev;
    },
    [datasets, datasetRevisions, currentUser, activeProject, currentRole, recordAudit, addNotification]
  );

  // Transfers operations
  const getTransfersByProject = useCallback(
    (projectId: string) =>
      transfers
        .filter((t) => t.projectId === projectId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [transfers]
  );

  const getTransfer = useCallback(
    (transferId: string) => transfers.find((t) => t.transferId === transferId),
    [transfers]
  );

  const initiateTransfer = useCallback(
    (params: {
      projectId: string;
      sourceApplicationId: string;
      destinationApplicationId: string;
      sourceDatasetId: string;
      sourceRevisionId?: string;
      changeSummary: string;
      payload: GenericDatasetPayload;
      units?: string;
      crs?: string;
    }): Transfer => {
      AuthorizationService.enforce(
        { user: currentUser, project: activeProject },
        'transfer:initiate'
      );

      const sourceDataset = datasets.find((d) => d.datasetId === params.sourceDatasetId);
      // If explicit sourceRevisionId was supplied (e.g. from CAD's imported base), use it; otherwise use dataset's current revision
      const sourceRev =
        (params.sourceRevisionId
          ? datasetRevisions.find((r) => r.revisionId === params.sourceRevisionId)
          : null) ||
        datasetRevisions.find((r) => r.revisionId === sourceDataset?.currentRevisionId);

      const currentLiveRev = datasetRevisions.find(
        (r) => r.revisionId === sourceDataset?.currentRevisionId
      );

      const transferId = `trf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
      const sourceApp = applications.find((a) => a.appId === params.sourceApplicationId);
      const destApp = applications.find((a) => a.appId === params.destinationApplicationId);

      const pkg: TransferPackage = {
        transferId,
        sourceApplicationId: params.sourceApplicationId,
        sourceApplicationVersion: sourceApp?.version || '1.0.0',
        destinationApplicationId: params.destinationApplicationId,
        destinationApplicationVersion: destApp?.version || '1.0.0',
        projectId: params.projectId,
        sourceDatasetId: params.sourceDatasetId,
        sourceRevisionId: sourceRev?.revisionId || 'rev-initial',
        schemaVersion: sourceDataset?.schemaVersion || '1.0.0',
        coreApiVersion: 'v1',
        units: params.units || 'meters',
        crs: params.crs || 'EPSG:3857',
        changeSummary: params.changeSummary,
        payload: params.payload,
        timestamp: new Date().toISOString(),
        createdBy: currentUser.userId,
      };

      // Compute 3-way diff relative to base revision and current live target revision
      const diff = TransferEngine.computeDiff(sourceRev || null, pkg, currentLiveRev || null);

      const newTransfer: Transfer = {
        transferId,
        projectId: params.projectId,
        sourceApplicationId: params.sourceApplicationId,
        destinationApplicationId: params.destinationApplicationId,
        sourceDatasetId: params.sourceDatasetId,
        sourceRevisionId: sourceRev?.revisionId || 'rev-initial',
        state: 'prepared',
        package: pkg,
        diff,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTransfers((prev) => [newTransfer, ...prev]);

      // Update project transfer count
      setProjects((prev) =>
        prev.map((p) =>
          p.projectId === params.projectId
            ? { ...p, transferCount: (p.transferCount || 0) + 1 }
            : p
        )
      );

      recordAudit({
        projectId: params.projectId,
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentRole,
        applicationId: params.sourceApplicationId,
        action: 'TRANSFER_PREPARED',
        entityType: 'transfer',
        entityId: transferId,
        entityName: `Transfer ${sourceApp?.name || params.sourceApplicationId} → ${destApp?.name || params.destinationApplicationId}`,
        description: `Prepared transfer package from ${params.sourceApplicationId} to ${params.destinationApplicationId} with ${diff.totalChanges} detected change item(s).`,
      });

      addNotification({
        type: 'transfer_received',
        title: 'Transfer Package Prepared',
        message: `Package initialized from ${sourceApp?.name} targeting ${destApp?.name}.`,
      });

      return newTransfer;
    },
    [datasets, datasetRevisions, applications, currentUser, activeProject, currentRole, recordAudit, addNotification]
  );

  const advanceTransferState = useCallback(
    (transferId: string, nextState: TransferState, notes?: string): Transfer => {
      const transfer = transfers.find((t) => t.transferId === transferId);
      if (!transfer) throw new Error(`Transfer '${transferId}' not found.`);

      if (!TransferEngine.isValidTransition(transfer.state, nextState)) {
        throw new Error(
          `Invalid transfer lifecycle transition from '${transfer.state}' to '${nextState}'.`
        );
      }

      const updated: Transfer = {
        ...transfer,
        state: nextState,
        reviewNotes: notes || transfer.reviewNotes,
        updatedAt: new Date().toISOString(),
      };

      setTransfers((prev) => prev.map((t) => (t.transferId === transferId ? updated : t)));

      let action: AuditLogEntry['action'] = 'TRANSFER_SENT';
      if (nextState === 'sent') action = 'TRANSFER_SENT';
      else if (nextState === 'imported') action = 'TRANSFER_IMPORTED';
      else if (nextState === 'reviewed') action = 'TRANSFER_REVIEWED';
      else if (nextState === 'validated') action = 'TRANSFER_VALIDATED';
      else if (nextState === 'committed') action = 'TRANSFER_COMMITTED';
      else if (nextState === 'rejected') action = 'TRANSFER_REJECTED';

      recordAudit({
        projectId: transfer.projectId,
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentRole,
        action,
        entityType: 'transfer',
        entityId: transfer.transferId,
        description: `Transfer state advanced from '${transfer.state}' to '${nextState}'.`,
      });

      return updated;
    },
    [transfers, currentUser, currentRole, recordAudit]
  );

  const updateTransferState = useCallback(
    (transferId: string, nextState: TransferState, options?: { notes?: string }): Transfer => {
      return advanceTransferState(transferId, nextState, options?.notes);
    },
    [advanceTransferState]
  );

  const resolveTransferConflict = useCallback(
    (
      transferId: string,
      entityId: string,
      fieldName: string,
      strategy: ConflictResolutionStrategy,
      manualValue?: unknown
    ): Transfer => {
      AuthorizationService.enforce(
        { user: currentUser, project: activeProject },
        'transfer:review'
      );

      const transfer = transfers.find((t) => t.transferId === transferId);
      if (!transfer) throw new Error(`Transfer '${transferId}' not found.`);

      if (!transfer.diff?.threeWayReport) {
        throw new Error('Cannot resolve conflict: No 3-way diff report exists for this transfer.');
      }

      const updatedReport = ThreeWayDiffEngine.applyResolution(
        transfer.diff!.threeWayReport!,
        entityId,
        fieldName,
        strategy,
        manualValue
      );

      // Determine resolved value
      const resolvedEntity = updatedReport.entities.find((e) => e.entityId === entityId);
      const resolvedField = resolvedEntity?.fieldDiffs.find((f) => f.fieldName === fieldName);
      const resolvedVal = resolvedField?.resolvedValue;

      // Update package payload if applicable
      let updatedPayload = transfer.package.payload;
      if (
        typeof updatedPayload === 'object' &&
        updatedPayload !== null &&
        'elements' in updatedPayload &&
        Array.isArray((updatedPayload as any).elements)
      ) {
        const gis = updatedPayload as GISDatasetPayload;
        const updatedElements = gis.elements.map((el) => {
          if (el.id === entityId && resolvedVal !== undefined) {
            return {
              ...el,
              [fieldName]: resolvedVal,
            };
          }
          return el;
        });

        updatedPayload = {
          ...gis,
          elements: updatedElements,
        };
      }

      const updatedTransfer: Transfer = {
        ...transfer,
        package: {
          ...transfer.package,
          payload: updatedPayload,
        },
        diff: {
          totalChanges: transfer.diff?.totalChanges ?? 0,
          addedCount: transfer.diff?.addedCount ?? 0,
          modifiedCount: transfer.diff?.modifiedCount ?? 0,
          deletedCount: transfer.diff?.deletedCount ?? 0,
          items: transfer.diff?.items ?? [],
          hasConflicts: updatedReport.hasUnresolvedConflicts,
          threeWayReport: updatedReport,
        },
        updatedAt: new Date().toISOString(),
      };

      setTransfers((prev) =>
        prev.map((t) => (t.transferId === transferId ? updatedTransfer : t))
      );

      recordAudit({
        projectId: transfer.projectId,
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentRole,
        action: 'CONFLICT_RESOLVED',
        entityType: 'transfer',
        entityId: transfer.transferId,
        description: `Resolved conflict on entity '${entityId}' field '${fieldName}' using strategy '${strategy}' (Resolved value: ${String(
          resolvedVal
        )}).`,
      });

      return updatedTransfer;
    },
    [transfers, currentUser, activeProject, currentRole, recordAudit]
  );

  const reviewTransfer = useCallback(
    (transferId: string, reviewNotes: string): Transfer => {
      AuthorizationService.enforce(
        { user: currentUser, project: activeProject },
        'transfer:review'
      );

      const transfer = transfers.find((t) => t.transferId === transferId);
      if (!transfer) throw new Error(`Transfer '${transferId}' not found.`);

      const updated: Transfer = {
        ...transfer,
        state: 'reviewed',
        reviewNotes,
        reviewedBy: currentUser.userId,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTransfers((prev) => prev.map((t) => (t.transferId === transferId ? updated : t)));

      recordAudit({
        projectId: transfer.projectId,
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentRole,
        action: 'TRANSFER_REVIEWED',
        entityType: 'transfer',
        entityId: transfer.transferId,
        description: `Transfer reviewed with notes: "${reviewNotes}"`,
      });

      return updated;
    },
    [transfers, currentUser, activeProject, currentRole, recordAudit]
  );

  const validateTransfer = useCallback(
    (transferId: string): { transfer: Transfer; validation: ValidationResult } => {
      AuthorizationService.enforce(
        { user: currentUser, project: activeProject },
        'transfer:validate'
      );

      const transfer = transfers.find((t) => t.transferId === transferId);
      if (!transfer) throw new Error(`Transfer '${transferId}' not found.`);

      // Execute technical validation
      const valResult = ValidationService.validateTransferPackage(transfer.package);

      const nextState: TransferState = valResult.status === 'failed' ? transfer.state : 'validated';

      const updatedTransfer: Transfer = {
        ...transfer,
        state: nextState,
        validationResult: valResult,
        updatedAt: new Date().toISOString(),
      };

      setTransfers((prev) =>
        prev.map((t) => (t.transferId === transferId ? updatedTransfer : t))
      );
      setValidationResults((prev) => [valResult, ...prev]);

      recordAudit({
        projectId: transfer.projectId,
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentRole,
        action: 'TECHNICAL_VALIDATION_EXECUTED',
        entityType: 'validation',
        entityId: valResult.validationId,
        description: `Executed technical validation on transfer package '${transferId}'. Outcome: ${valResult.status.toUpperCase()} (${valResult.passedRuleCount}/${valResult.totalRuleCount} rules passed).`,
      });

      addNotification({
        type: 'validation_complete',
        title: `Validation ${valResult.status.toUpperCase()}`,
        message: valResult.summary,
      });

      return { transfer: updatedTransfer, validation: valResult };
    },
    [transfers, currentUser, activeProject, currentRole, recordAudit, addNotification]
  );

  const commitTransfer = useCallback(
    (transferId: string, notes?: string): { transfer: Transfer; newRevision: DatasetRevision } => {
      AuthorizationService.enforce(
        { user: currentUser, project: activeProject },
        'transfer:commit'
      );

      const transfer = transfers.find((t) => t.transferId === transferId);
      if (!transfer) throw new Error(`Transfer '${transferId}' not found.`);

      if (transfer.diff?.threeWayReport?.hasUnresolvedConflicts) {
        throw new Error(
          'Cannot commit transfer: Unresolved 3-way conflicts exist. Please resolve all conflicts prior to committing.'
        );
      }

      // Ensure validation has been run or run it now
      let valResult = transfer.validationResult;
      if (!valResult) {
        valResult = ValidationService.validateTransferPackage(transfer.package);
      }

      if (valResult.status === 'failed') {
        throw new Error('Cannot commit transfer: Technical validation failed. Resolve errors before committing.');
      }

      // Generate the new immutable revision for the dataset
      const newRev = commitNewRevision({
        datasetId: transfer.sourceDatasetId,
        sourceAppId: transfer.destinationApplicationId, // Originating author application of this modification
        changeSummary: notes || `[Exchange Commit] ${transfer.package.changeSummary}`,
        payload: transfer.package.payload,
        validationState: valResult.status === 'passed' ? 'validated' : 'warning',
      });

      const updatedTransfer: Transfer = {
        ...transfer,
        state: 'committed',
        targetRevisionId: newRev.revisionId,
        committedBy: currentUser.userId,
        committedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTransfers((prev) =>
        prev.map((t) => (t.transferId === transferId ? updatedTransfer : t))
      );

      recordAudit({
        projectId: transfer.projectId,
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentRole,
        applicationId: transfer.destinationApplicationId,
        action: 'TRANSFER_COMMITTED',
        entityType: 'transfer',
        entityId: transfer.transferId,
        description: `Explicitly committed transfer into dataset '${transfer.sourceDatasetId}', generating new revision '${newRev.revisionId}'. No silent mutation rule satisfied.`,
      });

      addNotification({
        type: 'revision_committed',
        title: 'Transfer Committed Successfully',
        message: `Changes merged into Revision #${newRev.revisionNumber} (${newRev.revisionId}).`,
      });

      return { transfer: updatedTransfer, newRevision: newRev };
    },
    [transfers, commitNewRevision, currentUser, activeProject, currentRole, recordAudit, addNotification]
  );

  const rejectTransfer = useCallback(
    (transferId: string, reason: string): Transfer => {
      AuthorizationService.enforce(
        { user: currentUser, project: activeProject },
        'transfer:reject'
      );

      const transfer = transfers.find((t) => t.transferId === transferId);
      if (!transfer) throw new Error(`Transfer '${transferId}' not found.`);

      const updated: Transfer = {
        ...transfer,
        state: 'rejected',
        rejectedReason: reason,
        updatedAt: new Date().toISOString(),
      };

      setTransfers((prev) => prev.map((t) => (t.transferId === transferId ? updated : t)));

      recordAudit({
        projectId: transfer.projectId,
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentRole,
        action: 'TRANSFER_REJECTED',
        entityType: 'transfer',
        entityId: transfer.transferId,
        description: `Transfer rejected with reason: "${reason}"`,
      });

      addNotification({
        type: 'system_alert',
        title: 'Transfer Rejected',
        message: `Transfer was declined: ${reason}`,
      });

      return updated;
    },
    [transfers, currentUser, activeProject, currentRole, recordAudit, addNotification]
  );

  // Standalone validation runners
  const runTechnicalValidation = useCallback((pkg: TransferPackage) => {
    const res = ValidationService.validateTransferPackage(pkg);
    setValidationResults((prev) => [res, ...prev]);
    return res;
  }, []);

  const runEngineeringValidation = useCallback(
    (payload: GenericDatasetPayload, entityId: string) => {
      const res = ValidationService.runEngineeringValidation(payload, entityId);
      setValidationResults((prev) => [res, ...prev]);
      return res;
    },
    []
  );

  // Storage operations
  const uploadFileReference = useCallback(
    (fileRef: Partial<FileReference>): FileReference => {
      AuthorizationService.enforce(
        { user: currentUser, project: activeProject },
        'file:upload'
      );

      const newFile: FileReference = {
        fileId: fileRef.fileId || `file-${Date.now().toString(36)}`,
        projectId: fileRef.projectId || activeProjectId,
        name: fileRef.name || 'unnamed_asset.dat',
        mimeType: fileRef.mimeType || 'application/octet-stream',
        sizeBytes: fileRef.sizeBytes || 1024,
        checksumSha256:
          fileRef.checksumSha256 ||
          '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
        storageProvider: fileRef.storageProvider || 's3_compatible',
        storageKey: fileRef.storageKey || `projects/${activeProjectId}/assets/${fileRef.name}`,
        uploadedBy: currentUser.userId,
        uploadedAt: new Date().toISOString(),
        tags: fileRef.tags || ['engineering'],
      };

      setFiles((prev) => [newFile, ...prev]);

      recordAudit({
        projectId: newFile.projectId,
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentRole,
        action: 'FILE_UPLOADED',
        entityType: 'file',
        entityId: newFile.fileId,
        entityName: newFile.name,
        description: `Uploaded engineering asset '${newFile.name}' (${newFile.sizeBytes} bytes) to object storage.`,
      });

      return newFile;
    },
    [activeProjectId, currentUser, activeProject, currentRole, recordAudit]
  );

  // Reset demo
  const resetToInitialState = useCallback(() => {
    setProjects(INITIAL_PROJECTS);
    setActiveProjectId(INITIAL_PROJECTS[0].projectId);
    setDatasets(INITIAL_DATASETS);
    setDatasetRevisions(INITIAL_DATASET_REVISIONS);
    setTransfers(INITIAL_TRANSFERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setFiles(INITIAL_FILES);
    setApplications(REGISTERED_APPLICATIONS);
    setValidationResults([INITIAL_TRANSFERS[0].validationResult!]);
    addNotification({
      type: 'system_alert',
      title: 'State Reset to Baseline',
      message: 'EV Software Core reset to initial seed state.',
    });
  }, [addNotification]);

  const value: CoreContextType = {
    repositories,
    organization,
    users,
    currentUser,
    setCurrentUser,
    currentRole,
    applications,
    registerApplication,
    getApplication,
    projects,
    activeProjectId,
    activeProject,
    setActiveProjectId,
    createProject,
    updateProject,
    datasets,
    datasetRevisions,
    revisions: datasetRevisions,
    getDatasetsByProject,
    getDataset,
    getRevisionsForDataset,
    createDataset,
    commitNewRevision,
    transfers,
    getTransfersByProject,
    getTransfer,
    initiateTransfer,
    advanceTransferState,
    updateTransferState,
    resolveTransferConflict,
    reviewTransfer,
    validateTransfer,
    commitTransfer,
    rejectTransfer,
    validationResults,
    runTechnicalValidation,
    runEngineeringValidation,
    auditLogs,
    recordAudit,
    files,
    uploadFileReference,
    notifications,
    addNotification,
    markNotificationRead,
    clearNotifications,
    resetToInitialState,
  };

  return <CoreContext.Provider value={value}>{children}</CoreContext.Provider>;
};

export const useCore = () => {
  const context = useContext(CoreContext);
  if (!context) {
    throw new Error('useCore must be used within a CoreProvider');
  }
  return context;
};
