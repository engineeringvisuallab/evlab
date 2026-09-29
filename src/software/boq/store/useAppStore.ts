/**
 * EVLab BOQ - Main Application State Engine (Zustand)
 */

import { create } from 'zustand';
import {
  AppView,
  Project,
  WBSNode,
  BOQItem,
  MaterialItem,
  LabourItem,
  EquipmentItem,
  MeasurementRecord,
  RunningBill,
  Variation,
  AuditEntry,
  ValidationIssue,
  ProjectSettings,
} from '../types';
import {
  initStorage,
  saveProjectBundle,
  loadProjectBundle,
  getAllProjectSummaries,
  deleteProject as deleteProjectFromDb,
  FullProjectBundle,
} from '../core/persistence';
import { validateProjectData } from '../core/validation';
import { createAuditEntry } from '../core/history';
import { calculateItemAmount } from '../core/calculation';

interface AppState {
  // Core State
  isInitialized: boolean;
  currentView: AppView;
  isSidebarCollapsed: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  searchQuery: string;
  isSearchOpen: boolean;
  selectedBoqItemId: string | null;

  // Active Project Data
  projects: Project[];
  activeProject: Project | null;
  wbsNodes: WBSNode[];
  boqItems: BOQItem[];
  materials: MaterialItem[];
  labour: LabourItem[];
  equipment: EquipmentItem[];
  measurements: MeasurementRecord[];
  runningBills: RunningBill[];
  variations: Variation[];
  auditLog: AuditEntry[];
  validationIssues: ValidationIssue[];

  // Undo / Redo Stacks
  undoStack: FullProjectBundle[];
  redoStack: FullProjectBundle[];

  // Actions
  initApp: () => Promise<void>;
  setCurrentView: (view: AppView) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  selectBoqItem: (id: string | null) => void;

  // Project Actions
  createNewProject: (data: Partial<Project>) => Promise<string>;
  switchProject: (projectId: string) => Promise<void>;
  saveCurrentProject: () => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<void>;
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
  updateActiveProjectInfo: (data: Partial<Project>) => void;

  // BOQ Actions
  addBoqItem: (item: Partial<BOQItem>) => void;
  updateBoqItem: (id: string, itemData: Partial<BOQItem>) => void;
  deleteBoqItem: (id: string) => void;
  duplicateBoqItem: (id: string) => void;

  // WBS Actions
  addWbsNode: (node: Partial<WBSNode>) => void;
  updateWbsNode: (id: string, nodeData: Partial<WBSNode>) => void;
  deleteWbsNode: (id: string) => void;

  // Libraries Actions
  addMaterial: (mat: Partial<MaterialItem>) => void;
  addLabour: (lab: Partial<LabourItem>) => void;
  addEquipment: (eq: Partial<EquipmentItem>) => void;

  // Measurement & Billing Actions
  addMeasurement: (record: Partial<MeasurementRecord>) => void;
  addRunningBill: (bill: Partial<RunningBill>) => void;
  addVariation: (variation: Partial<Variation>) => void;

  // History & Import/Export
  undo: () => void;
  redo: () => void;
  exportProjectJson: () => string;
  importProjectJson: (jsonStr: string) => Promise<boolean>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isInitialized: false,
  currentView: 'dashboard',
  isSidebarCollapsed: false,
  saveStatus: 'saved',
  searchQuery: '',
  isSearchOpen: false,
  selectedBoqItemId: null,

  projects: [],
  activeProject: null,
  wbsNodes: [],
  boqItems: [],
  materials: [],
  labour: [],
  equipment: [],
  measurements: [],
  runningBills: [],
  variations: [],
  auditLog: [],
  validationIssues: [],

  undoStack: [],
  redoStack: [],

  initApp: async () => {
    if (get().isInitialized) return;

    const bundle = await initStorage();
    const allProjects = await getAllProjectSummaries();

    const issues = validateProjectData(bundle.project, bundle.boqItems, bundle.wbsNodes);

    set({
      isInitialized: true,
      projects: allProjects,
      activeProject: bundle.project,
      wbsNodes: bundle.wbsNodes,
      boqItems: bundle.boqItems,
      materials: bundle.materials,
      labour: bundle.labour,
      equipment: bundle.equipment,
      measurements: bundle.measurements,
      runningBills: bundle.runningBills,
      variations: bundle.variations,
      auditLog: bundle.auditLog || [],
      validationIssues: issues,
      saveStatus: 'saved',
    });
  },

  setCurrentView: (view: AppView) => set({ currentView: view }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setIsSearchOpen: (isOpen: boolean) => set({ isSearchOpen: isOpen }),
  selectBoqItem: (id: string | null) => set({ selectedBoqItemId: id }),

  createNewProject: async (data: Partial<Project>) => {
    const newId = `prj-${Date.now()}`;
    const newProject: Project = {
      id: newId,
      code: data.code || `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name || 'New Civil Infrastructure Project',
      client: data.client || 'Client Authority',
      employer: data.employer || 'Ministry / Department',
      consultant: data.consultant || 'EVLab Engineering Consultants',
      contractor: data.contractor || 'Contractor Ltd.',
      projectType: data.projectType || 'General Civil',
      location: data.location || 'Site Location',
      contractNumber: data.contractNumber || 'CNT-2026-001',
      tenderNumber: data.tenderNumber || 'TND-2026-001',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      currency: data.currency || {
        code: 'BDT',
        symbol: '৳ ',
        decimalPlaces: 2,
        thousandSeparator: ',',
        decimalSeparator: '.',
      },
      measurementSystem: data.measurementSystem || 'metric',
      rateDatabase: data.rateDatabase || 'Standard Rate DB',
      description: data.description || 'Project Description',
      revision: 'R0',
      status: 'planning',
      settings: {
        overheadPercentage: 8.5,
        contractorProfitPercentage: 10.0,
        vatTaxPercentage: 7.5,
        contingencyPercentage: 5.0,
        wastageDefaultPercentage: 3.0,
        quantityPrecision: 3,
        ratePrecision: 2,
        amountPrecision: 2,
        autoSaveIntervalMs: 10000,
        theme: 'blueprint',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const bundle: FullProjectBundle = {
      project: newProject,
      wbsNodes: [
        { id: `wbs-init-${newId}`, projectId: newId, code: '01', title: 'General & Preliminary Works', level: 1, order: 1 },
      ],
      boqItems: [],
      materials: get().materials,
      labour: get().labour,
      equipment: get().equipment,
      measurements: [],
      runningBills: [],
      variations: [],
      auditLog: [
        createAuditEntry(newId, 'System Administrator', 'Projects', 'create', undefined, undefined, newProject.name, 'Created new project'),
      ],
      exportedAt: new Date().toISOString(),
    };

    await saveProjectBundle(bundle);
    const updatedProjects = await getAllProjectSummaries();

    set({
      projects: updatedProjects,
      activeProject: newProject,
      wbsNodes: bundle.wbsNodes,
      boqItems: [],
      measurements: [],
      runningBills: [],
      variations: [],
      auditLog: bundle.auditLog,
      validationIssues: [],
      currentView: 'boq',
      saveStatus: 'saved',
    });

    return newId;
  },

  switchProject: async (projectId: string) => {
    set({ saveStatus: 'saving' });
    const bundle = await loadProjectBundle(projectId);
    if (!bundle) return;

    const issues = validateProjectData(bundle.project, bundle.boqItems, bundle.wbsNodes);

    set({
      activeProject: bundle.project,
      wbsNodes: bundle.wbsNodes,
      boqItems: bundle.boqItems,
      materials: bundle.materials,
      labour: bundle.labour,
      equipment: bundle.equipment,
      measurements: bundle.measurements,
      runningBills: bundle.runningBills,
      variations: bundle.variations,
      auditLog: bundle.auditLog || [],
      validationIssues: issues,
      saveStatus: 'saved',
      selectedBoqItemId: null,
    });
  },

  saveCurrentProject: async () => {
    const state = get();
    if (!state.activeProject) return false;

    set({ saveStatus: 'saving' });

    const bundle: FullProjectBundle = {
      project: state.activeProject,
      wbsNodes: state.wbsNodes,
      boqItems: state.boqItems,
      materials: state.materials,
      labour: state.labour,
      equipment: state.equipment,
      measurements: state.measurements,
      runningBills: state.runningBills,
      variations: state.variations,
      auditLog: state.auditLog,
      exportedAt: new Date().toISOString(),
    };

    const success = await saveProjectBundle(bundle);
    if (success) {
      set({ saveStatus: 'saved' });
    } else {
      set({ saveStatus: 'unsaved' });
    }
    return success;
  },

  deleteProject: async (projectId: string) => {
    await deleteProjectFromDb(projectId);
    const summaries = await getAllProjectSummaries();
    set({ projects: summaries });
    if (get().activeProject?.id === projectId && summaries.length > 0) {
      await get().switchProject(summaries[0].id);
    }
  },

  updateProjectSettings: (newSettings: Partial<ProjectSettings>) => {
    const state = get();
    if (!state.activeProject) return;

    const updatedProject: Project = {
      ...state.activeProject,
      settings: {
        ...state.activeProject.settings,
        ...newSettings,
      },
      updatedAt: new Date().toISOString(),
    };

    set({ activeProject: updatedProject, saveStatus: 'unsaved' });
    get().saveCurrentProject();
  },

  updateActiveProjectInfo: (data: Partial<Project>) => {
    const state = get();
    if (!state.activeProject) return;

    const updated: Project = {
      ...state.activeProject,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    set({ activeProject: updated, saveStatus: 'unsaved' });
    get().saveCurrentProject();
  },

  addBoqItem: (itemData: Partial<BOQItem>) => {
    const state = get();
    if (!state.activeProject) return;

    const newId = `boq-${Date.now()}`;
    const qty = itemData.quantity ?? 0;
    const rate = itemData.rate ?? 0;

    const newItem: BOQItem = {
      id: newId,
      projectId: state.activeProject.id,
      itemCode: itemData.itemCode || `01.01.${state.boqItems.length + 1}`,
      wbsCode: itemData.wbsCode || '01',
      description: itemData.description || 'New Civil Works Item',
      specification: itemData.specification || 'As per Standard Specifications',
      unit: itemData.unit || 'm³',
      quantity: qty,
      rate: rate,
      amount: calculateItemAmount(qty, rate),
      category: itemData.category || 'General',
      source: itemData.source || 'Manual',
      materialRate: itemData.materialRate || 0,
      labourRate: itemData.labourRate || 0,
      equipmentRate: itemData.equipmentRate || 0,
      overheadAmount: 0,
      profitAmount: 0,
      taxAmount: 0,
      remarks: itemData.remarks || '',
      revision: state.activeProject.revision,
      isHeader: itemData.isHeader || false,
    };

    const updatedItems = [...state.boqItems, newItem];
    const issues = validateProjectData(state.activeProject, updatedItems, state.wbsNodes);

    set({
      boqItems: updatedItems,
      validationIssues: issues,
      selectedBoqItemId: newId,
      saveStatus: 'unsaved',
    });

    get().saveCurrentProject();
  },

  updateBoqItem: (id: string, itemData: Partial<BOQItem>) => {
    const state = get();
    const updatedItems = state.boqItems.map((item) => {
      if (item.id !== id) return item;

      const qty = itemData.quantity !== undefined ? itemData.quantity : item.quantity;
      const rate = itemData.rate !== undefined ? itemData.rate : item.rate;
      const amount = calculateItemAmount(qty, rate);

      return {
        ...item,
        ...itemData,
        quantity: qty,
        rate: rate,
        amount,
      };
    });

    const issues = validateProjectData(state.activeProject, updatedItems, state.wbsNodes);

    set({
      boqItems: updatedItems,
      validationIssues: issues,
      saveStatus: 'unsaved',
    });

    get().saveCurrentProject();
  },

  deleteBoqItem: (id: string) => {
    const state = get();
    const updatedItems = state.boqItems.filter((item) => item.id !== id);
    const issues = validateProjectData(state.activeProject, updatedItems, state.wbsNodes);

    set({
      boqItems: updatedItems,
      validationIssues: issues,
      selectedBoqItemId: state.selectedBoqItemId === id ? null : state.selectedBoqItemId,
      saveStatus: 'unsaved',
    });

    get().saveCurrentProject();
  },

  duplicateBoqItem: (id: string) => {
    const state = get();
    const target = state.boqItems.find((i) => i.id === id);
    if (!target) return;

    const dupId = `boq-${Date.now()}`;
    const duplicate: BOQItem = {
      ...target,
      id: dupId,
      itemCode: `${target.itemCode}-COPY`,
      description: `${target.description} (Copy)`,
    };

    const updatedItems = [...state.boqItems, duplicate];
    set({ boqItems: updatedItems, saveStatus: 'unsaved' });
    get().saveCurrentProject();
  },

  addWbsNode: (nodeData: Partial<WBSNode>) => {
    const state = get();
    if (!state.activeProject) return;

    const newNode: WBSNode = {
      id: `wbs-${Date.now()}`,
      projectId: state.activeProject.id,
      code: nodeData.code || `${state.wbsNodes.length + 1}`,
      title: nodeData.title || 'New Section Title',
      parentId: nodeData.parentId || null,
      level: nodeData.level || 1,
      order: state.wbsNodes.length + 1,
    };

    const updatedNodes = [...state.wbsNodes, newNode];
    set({ wbsNodes: updatedNodes, saveStatus: 'unsaved' });
    get().saveCurrentProject();
  },

  updateWbsNode: (id: string, nodeData: Partial<WBSNode>) => {
    const state = get();
    const updatedNodes = state.wbsNodes.map((w) => (w.id === id ? { ...w, ...nodeData } : w));
    set({ wbsNodes: updatedNodes, saveStatus: 'unsaved' });
    get().saveCurrentProject();
  },

  deleteWbsNode: (id: string) => {
    const state = get();
    const updatedNodes = state.wbsNodes.filter((w) => w.id !== id);
    set({ wbsNodes: updatedNodes, saveStatus: 'unsaved' });
    get().saveCurrentProject();
  },

  addMaterial: (mat: Partial<MaterialItem>) => {
    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      code: mat.code || `M-${Math.floor(100 + Math.random() * 900)}`,
      name: mat.name || 'New Material',
      category: mat.category || 'General',
      unit: mat.unit || 'm³',
      defaultRate: mat.defaultRate || 0,
      supplier: mat.supplier || '',
      specification: mat.specification || '',
    };
    set((state) => ({ materials: [...state.materials, newMat], saveStatus: 'unsaved' }));
    get().saveCurrentProject();
  },

  addLabour: (lab: Partial<LabourItem>) => {
    const newLab: LabourItem = {
      id: `lab-${Date.now()}`,
      code: lab.code || `L-${Math.floor(100 + Math.random() * 900)}`,
      name: lab.description || 'New Labour Role',
      description: lab.description || 'General Labour',
      skill: lab.skill || 'Skilled',
      unit: lab.unit || 'day',
      rate: lab.rate || 0,
    };
    set((state) => ({ labour: [...state.labour, newLab], saveStatus: 'unsaved' }));
    get().saveCurrentProject();
  },

  addEquipment: (eq: Partial<EquipmentItem>) => {
    const newEq: EquipmentItem = {
      id: `eq-${Date.now()}`,
      code: eq.code || `E-${Math.floor(100 + Math.random() * 900)}`,
      name: eq.name || 'New Plant / Equipment',
      type: eq.type || 'General',
      unit: eq.unit || 'hr',
      operatingRate: eq.operatingRate || 0,
      fuelRate: eq.fuelRate || 0,
    };
    set((state) => ({ equipment: [...state.equipment, newEq], saveStatus: 'unsaved' }));
    get().saveCurrentProject();
  },

  addMeasurement: (rec: Partial<MeasurementRecord>) => {
    const state = get();
    if (!state.activeProject) return;

    const newRec: MeasurementRecord = {
      id: `meas-${Date.now()}`,
      projectId: state.activeProject.id,
      measurementNo: rec.measurementNo || `MB-${state.measurements.length + 1}`,
      date: rec.date || new Date().toISOString().split('T')[0],
      boqItemId: rec.boqItemId || '',
      description: rec.description || 'Site Measurement',
      location: rec.location || 'Site Location',
      length: rec.length || 0,
      width: rec.width || 0,
      depth: rec.depth || 0,
      number: rec.number || 1,
      quantity: rec.quantity || 0,
      previousQuantity: rec.previousQuantity || 0,
      cumulativeQuantity: (rec.previousQuantity || 0) + (rec.quantity || 0),
    };

    set({ measurements: [...state.measurements, newRec], saveStatus: 'unsaved' });
    get().saveCurrentProject();
  },

  addRunningBill: (bill: Partial<RunningBill>) => {
    const state = get();
    if (!state.activeProject) return;

    const newBill: RunningBill = {
      id: `bill-${Date.now()}`,
      projectId: state.activeProject.id,
      billNo: bill.billNo || `RA-0${state.runningBills.length + 1}`,
      billDate: bill.billDate || new Date().toISOString().split('T')[0],
      contractorName: bill.contractorName || state.activeProject.contractor,
      periodFrom: bill.periodFrom || state.activeProject.startDate,
      periodTo: bill.periodTo || new Date().toISOString().split('T')[0],
      items: bill.items || [],
      grossTotal: bill.grossTotal || 0,
      retentionPct: bill.retentionPct || 10,
      retentionAmount: bill.retentionAmount || 0,
      advanceRecoveryAmount: bill.advanceRecoveryAmount || 0,
      taxDeductionAmount: bill.taxDeductionAmount || 0,
      otherDeductions: 0,
      netPayable: bill.netPayable || 0,
      status: 'Draft',
    };

    set({ runningBills: [...state.runningBills, newBill], saveStatus: 'unsaved' });
    get().saveCurrentProject();
  },

  addVariation: (v: Partial<Variation>) => {
    const state = get();
    if (!state.activeProject) return;

    const newVar: Variation = {
      id: `var-${Date.now()}`,
      projectId: state.activeProject.id,
      variationNo: v.variationNo || `VO-0${state.variations.length + 1}`,
      type: v.type || 'Quantity Increase',
      itemCode: v.itemCode || '01.01',
      description: v.description || 'Variation Order Description',
      unit: v.unit || 'm³',
      originalQuantity: v.originalQuantity || 0,
      revisedQuantity: v.revisedQuantity || 0,
      quantityDifference: (v.revisedQuantity || 0) - (v.originalQuantity || 0),
      originalRate: v.originalRate || 0,
      revisedRate: v.revisedRate || 0,
      originalAmount: (v.originalQuantity || 0) * (v.originalRate || 0),
      revisedAmount: (v.revisedQuantity || 0) * (v.revisedRate || 0),
      variationAmount: ((v.revisedQuantity || 0) * (v.revisedRate || 0)) - ((v.originalQuantity || 0) * (v.originalRate || 0)),
      approvalStatus: 'Pending',
      reason: v.reason || 'Site Condition Change',
    };

    set({ variations: [...state.variations, newVar], saveStatus: 'unsaved' });
    get().saveCurrentProject();
  },

  undo: () => {
    // Basic undo hook
  },

  redo: () => {
    // Basic redo hook
  },

  exportProjectJson: () => {
    const state = get();
    if (!state.activeProject) return '';

    const bundle: FullProjectBundle = {
      project: state.activeProject,
      wbsNodes: state.wbsNodes,
      boqItems: state.boqItems,
      materials: state.materials,
      labour: state.labour,
      equipment: state.equipment,
      measurements: state.measurements,
      runningBills: state.runningBills,
      variations: state.variations,
      auditLog: state.auditLog,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(bundle, null, 2);
  },

  importProjectJson: async (jsonStr: string) => {
    try {
      const bundle: FullProjectBundle = JSON.parse(jsonStr);
      if (!bundle || !bundle.project || !bundle.project.id) {
        return false;
      }

      await saveProjectBundle(bundle);
      const summaries = await getAllProjectSummaries();

      set({
        projects: summaries,
        activeProject: bundle.project,
        wbsNodes: bundle.wbsNodes || [],
        boqItems: bundle.boqItems || [],
        materials: bundle.materials || [],
        labour: bundle.labour || [],
        equipment: bundle.equipment || [],
        measurements: bundle.measurements || [],
        runningBills: bundle.runningBills || [],
        variations: bundle.variations || [],
        auditLog: bundle.auditLog || [],
        validationIssues: validateProjectData(bundle.project, bundle.boqItems || [], bundle.wbsNodes || []),
        saveStatus: 'saved',
      });

      return true;
    } catch (e) {
      console.error('Failed to import project JSON:', e);
      return false;
    }
  },
}));
