/**
 * EVLab BOQ - Core Type Definitions
 * Professional Engineering BOQ, Quantity Takeoff & Cost Estimation System
 */

export type ProjectStatus = 'planning' | 'tender' | 'active' | 'completed' | 'archived';

export type ProjectType = 
  | 'Building'
  | 'Road'
  | 'Bridge'
  | 'Water Supply'
  | 'Sewerage'
  | 'Drainage'
  | 'WTP'
  | 'STP'
  | 'Pump Station'
  | 'Transmission Pipeline'
  | 'Infrastructure'
  | 'General Civil'
  | 'Custom';

export type MeasurementSystem = 'metric' | 'imperial';

export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'SAR' | 'CUSTOM';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  decimalPlaces: number;
  thousandSeparator: string;
  decimalSeparator: string;
}

export type ResourceCategory = 'Material' | 'Labour' | 'Equipment' | 'Subcontract' | 'Other';

export interface ProjectSettings {
  overheadPercentage: number;
  contractorProfitPercentage: number;
  vatTaxPercentage: number;
  contingencyPercentage: number;
  wastageDefaultPercentage: number;
  quantityPrecision: number;
  ratePrecision: number;
  amountPrecision: number;
  autoSaveIntervalMs: number;
  theme: 'dark' | 'light' | 'blueprint';
}

export interface Project {
  id: string;
  code: string; // e.g. "PRJ-2026-001"
  name: string;
  client: string;
  employer: string;
  consultant: string;
  contractor: string;
  projectType: ProjectType;
  location: string;
  contractNumber: string;
  tenderNumber: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  currency: CurrencyConfig;
  measurementSystem: MeasurementSystem;
  rateDatabase: string;
  description: string;
  revision: string; // e.g. "R0", "R1"
  status: ProjectStatus;
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
}

export interface WBSNode {
  id: string;
  projectId: string;
  code: string; // e.g. "01", "01.01"
  title: string;
  parentId?: string | null;
  level: number;
  description?: string;
  order: number;
}

export type QuantitySource = 
  | 'Manual' 
  | 'Quantity Takeoff' 
  | 'CAD' 
  | 'BIM' 
  | 'GIS' 
  | 'WTP Design' 
  | 'Imported Excel' 
  | 'Imported CSV' 
  | 'API' 
  | 'Custom Formula';

export interface BOQItem {
  id: string;
  projectId: string;
  itemCode: string; // e.g. "01.01.01"
  wbsCode: string;
  description: string;
  specification: string;
  unit: string;
  quantity: number;
  rate: number; // Derived from Rate Analysis or Manual
  amount: number; // quantity * rate
  category: string; // Earthwork, Concrete, Pipeline, etc.
  rateAnalysisId?: string;
  quantityFormula?: string;
  source: QuantitySource;
  materialRate: number;
  labourRate: number;
  equipmentRate: number;
  overheadAmount: number;
  profitAmount: number;
  taxAmount: number;
  remarks?: string;
  revision: string;
  isHeader?: boolean;
}

export interface FormulaParam {
  name: string; // e.g. "L", "W", "D", "N"
  label: string; // e.g. "Length", "Width", "Depth", "Number"
  value: number;
  unit: string;
}

export interface QuantityTakeoff {
  id: string;
  projectId: string;
  boqItemId: string;
  method: 'direct' | 'dimension' | 'area' | 'volume' | 'linear' | 'count' | 'composite';
  formula: string; // e.g. "L * W * D * N"
  params: FormulaParam[];
  calculatedQuantity: number;
  unit: string;
  source: QuantitySource;
  notes?: string;
  updatedAt: string;
}

export interface RateResource {
  id: string;
  resourceId?: string;
  name: string;
  category: ResourceCategory;
  unit: string;
  quantity: number; // per unit of BOQ item
  rate: number; // cost per unit of resource
  amount: number; // quantity * rate
  wastagePct: number;
  remarks?: string;
}

export interface RateAnalysis {
  id: string;
  projectId: string;
  boqItemId: string;
  resources: RateResource[];
  materialCost: number;
  labourCost: number;
  equipmentCost: number;
  directCost: number;
  wastageCost: number;
  transportCost: number;
  overheadPct: number;
  overheadAmount: number;
  profitPct: number;
  profitAmount: number;
  taxPct: number;
  taxAmount: number;
  finalUnitRate: number;
  isTemplate?: boolean;
  templateName?: string;
  updatedAt: string;
}

export interface MaterialItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  defaultRate: number;
  supplier?: string;
  specification?: string;
  density?: number; // kg/m3 where applicable
  remarks?: string;
}

export interface LabourItem {
  id: string;
  code: string;
  name?: string;
  description: string;
  skill: 'Unskilled' | 'Semiskilled' | 'Skilled' | 'Highly Skilled' | 'Specialist';
  unit: string; // e.g., "Day", "Hr"
  rate: number;
  remarks?: string;
}

export interface EquipmentItem {
  id: string;
  code: string;
  name: string;
  type: string;
  unit: string; // e.g. "Hr", "Day"
  operatingRate: number;
  fuelRate: number;
  remarks?: string;
}

export interface MeasurementRecord {
  id: string;
  projectId: string;
  measurementNo: string;
  date: string;
  boqItemId: string;
  description: string;
  location: string;
  length: number;
  width: number;
  depth: number;
  number: number;
  quantity: number;
  previousQuantity: number;
  cumulativeQuantity: number;
  remarks?: string;
}

export interface RunningBillItem {
  id: string;
  boqItemId: string;
  contractQuantity: number;
  previousQuantity: number;
  currentQuantity: number;
  cumulativeQuantity: number;
  rate: number;
  grossAmount: number;
}

export interface RunningBill {
  id: string;
  projectId: string;
  billNo: string; // e.g., "RA-01"
  billDate: string;
  contractorName: string;
  periodFrom: string;
  periodTo: string;
  items: RunningBillItem[];
  grossTotal: number;
  retentionPct: number;
  retentionAmount: number;
  advanceRecoveryAmount: number;
  taxDeductionAmount: number;
  otherDeductions: number;
  netPayable: number;
  status: 'Draft' | 'Submitted' | 'Certified' | 'Paid';
}

export type VariationType = 
  | 'Addition' 
  | 'Omission' 
  | 'Quantity Increase' 
  | 'Quantity Decrease' 
  | 'New Item' 
  | 'Rate Revision';

export interface Variation {
  id: string;
  projectId: string;
  variationNo: string; // e.g., "VO-01"
  type: VariationType;
  boqItemId?: string;
  itemCode: string;
  description: string;
  unit: string;
  originalQuantity: number;
  revisedQuantity: number;
  quantityDifference: number;
  originalRate: number;
  revisedRate: number;
  originalAmount: number;
  revisedAmount: number;
  variationAmount: number;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  approvedDate?: string;
}

export interface MaterialControlRecord {
  id: string;
  materialName: string;
  unit: string;
  budgetQuantity: number;
  procuredQuantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  budgetCost: number;
  actualCost: number;
  varianceCost: number;
}

export interface AuditEntry {
  id: string;
  projectId: string;
  timestamp: string;
  user: string;
  module: string;
  action: 'create' | 'update' | 'delete';
  field?: string;
  oldValue?: string;
  newValue?: string;
  notes?: string;
}

export interface ValidationIssue {
  id: string;
  itemId?: string;
  itemCode?: string;
  module: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}

export type AppView = 
  | 'dashboard'
  | 'projects'
  | 'boq'
  | 'takeoff'
  | 'rate-analysis'
  | 'estimate'
  | 'abstract'
  | 'measurement'
  | 'billing'
  | 'variations'
  | 'cost-control'
  | 'materials'
  | 'labour'
  | 'equipment'
  | 'rate-database'
  | 'reports'
  | 'libraries'
  | 'settings';
