/**
 * EVLab Project Planner - Data Types & Interfaces
 */

export type EngineeringDiscipline = 
  | 'Civil' 
  | 'Structural' 
  | 'Mechanical' 
  | 'Electrical' 
  | 'Piping' 
  | 'I&C' 
  | 'Architectural' 
  | 'Commissioning' 
  | 'General';

export interface DocumentRef {
  id: string;
  title: string;
  docNumber: string;
  revision: string;
  type: 'Drawing' | 'Specification' | 'BOQ' | 'Transmittal' | 'Contract' | 'Other';
  url?: string;
  updatedAt?: string;
}

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface TaskDependency {
  taskId: string;
  type: DependencyType;
  lagDays: number; // positive = lag, negative = lead
}

export type ConstraintType = 'ASAP' | 'ALAP' | 'MSO' | 'MFO' | 'SNET' | 'FNET';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: string;
  wbs: string;
  name: string;
  level: number; // 0 = Top root, 1 = sub, etc.
  isSummary: boolean;
  isMilestone: boolean;
  duration: number; // working days
  startDate: string; // YYYY-MM-DD
  finishDate: string; // YYYY-MM-DD
  predecessors: TaskDependency[];
  successors: TaskDependency[];
  constraintType: ConstraintType;
  constraintDate?: string;
  percentComplete: number; // 0 - 100
  physicalPercentComplete?: number; // 0 - 100
  status: TaskStatus;
  priority: TaskPriority;
  resourceIds: string[]; // assigned resource IDs
  fixedCost: number;
  totalCost: number;
  notes?: string;

  // Engineering & Site Control Fields
  discipline?: EngineeringDiscipline;
  drawingRef?: string;
  boqCode?: string;
  boqUnit?: string;
  plannedQty?: number;
  installedQty?: number;
  workPackage?: string;
  subcontractor?: string;
  documents?: DocumentRef[];
  calendarId?: string;
  earnedValueMethod?: 'PercentComplete' | 'PhysicalPercent' | 'Milestone';

  // Baseline properties
  baselineStart?: string;
  baselineFinish?: string;
  baselineDuration?: number;
  baselineCost?: number;

  // Actual tracking
  actualStart?: string;
  actualFinish?: string;
  actualDuration?: number;
  actualCost?: number;
  remainingDuration?: number;

  // Calculated scheduling fields (Critical Path Method)
  earlyStart: string;
  earlyFinish: string;
  lateStart: string;
  lateFinish: string;
  totalFloat: number; // days
  freeFloat: number; // days
  isCritical: boolean;

  // UI state
  isCollapsed?: boolean;
}

export type ResourceType = 'Work' | 'Material' | 'Equipment' | 'Cost';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  role: string;
  unit: string; // e.g., 'hrs', 'm³', 'days', 'units'
  maxUnits: number; // e.g. 100% or 1.0 (1 full time worker)
  standardRate: number; // $ / unit or $ / hr
  overtimeRate: number;
  costPerUse: number;
  availability: string; // e.g., '100%', '50%'
  calendarId: string;
  email?: string;
}

export interface ResourceAssignment {
  taskId: string;
  resourceId: string;
  units: number; // e.g., 100% or 50 m3
  plannedWorkHours: number;
  actualWorkHours: number;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
}

export interface ProjectCalendar {
  id: string;
  name: string;
  workingDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  workingHoursPerDay: number; // default 8
  holidays: Holiday[];
}

export interface BaselineSnapshot {
  id: string;
  slotIndex?: number; // 0=Baseline 0, 1=Baseline 1, etc.
  name: string;
  savedAt: string; // ISO datetime
  description: string;
  totalCost: number;
  finishDate: string;
  tasksSnapshot: Record<string, {
    startDate: string;
    finishDate: string;
    duration: number;
    totalCost: number;
    percentComplete: number;
  }>;
}

export type RiskCategory = 'Technical' | 'Financial' | 'Safety' | 'Environmental' | 'Schedule' | 'Contractual';
export type RiskStatus = 'Open' | 'Mitigated' | 'Closed';

export interface ProjectRisk {
  id: string;
  code: string;
  description: string;
  category: RiskCategory;
  probability: number; // 1 to 5
  impact: number; // 1 to 5
  riskScore: number; // probability * impact (1-25)
  owner: string;
  mitigation: string;
  status: RiskStatus;
}

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueStatus = 'Open' | 'In Progress' | 'Resolved';

export interface ProjectIssue {
  id: string;
  code: string;
  description: string;
  priority: IssuePriority;
  owner: string;
  dueDate: string;
  status: IssueStatus;
  resolution?: string;
}

export interface ProjectSettings {
  currencySymbol: string;
  currencyCode: string;
  dateFormat: string;
  autoSchedule: boolean; // Auto CPM recalculation on changes
  highlightCriticalPath: boolean;
  showBaselineGantt: boolean;
  defaultHoursPerDay: number;
  dcmaStrictCheck?: boolean;
}

export interface Project {
  id: string;
  name: string;
  code: string; // e.g., "WTP-2026-001"
  client: string;
  projectManager: string;
  organization: string;
  startDate: string; // YYYY-MM-DD
  plannedCompletionDate: string;
  calculatedFinishDate: string;
  workingCalendarId: string;
  description: string;
  currency: string;
  defaultHoursPerDay: number;
  createdDate: string;
  lastModified: string;

  tasks: Task[];
  resources: Resource[];
  resourceAssignments: ResourceAssignment[];
  calendars: ProjectCalendar[];
  baselines: BaselineSnapshot[];
  activeBaselineId?: string;
  risks: ProjectRisk[];
  issues: ProjectIssue[];
  settings: ProjectSettings;
}

export interface EVMPoint {
  date: string;
  pv: number; // Planned Value
  ev: number; // Earned Value
  ac: number; // Actual Cost
}

export interface EVMMetrics {
  pv: number;
  ev: number;
  ac: number;
  bac: number;
  cv: number;
  sv: number;
  cpi: number;
  spi: number;
  eac: number;
  etc: number;
  vac: number;
  tcpi: number;
  sCurvePoints: EVMPoint[];
}

export interface DCMAAuditCheck {
  id: string;
  code: string;
  name: string;
  targetPct: number;
  actualPct: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  failingTasks: { id: string; wbs: string; name: string; reason: string }[];
  description: string;
}

export interface ProjectHealthMetrics {
  healthScore: number;
  status: 'Green' | 'Amber' | 'Red';
  scheduleVarianceDays: number;
  costVariancePct: number;
  criticalPathRiskPct: number;
  overallocatedResourceCount: number;
  openHighRisksCount: number;
  drivers: string[];
}

export type AppView =
  | 'home'
  | 'project'
  | 'tasks'
  | 'gantt'
  | 'wbs'
  | 'resources'
  | 'calendar'
  | 'costs'
  | 'baseline'
  | 'critical-path'
  | 'risks'
  | 'reports'
  | 'settings'
  | 'evm'
  | 'lookahead'
  | 'schedule-doctor';
