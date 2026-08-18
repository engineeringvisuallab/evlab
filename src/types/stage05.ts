/**
 * EVLab — Stage 05 Deep Career Mastery Type Definitions
 * Standardized 27-Section Architecture for Engineering Mastery
 */

export interface GoverningEquation {
  name: string;
  formula: string;
  description: string;
  variables: string[];
}

export interface InputVariable {
  name: string;
  symbol: string;
  unit: string;
  description: string;
}

export interface SoftwareToolItem {
  id: string;
  name: string;
  category?: string;
  vendor?: string;
  purpose: string;
  proficiencyLevel: 'Essential' | 'Advanced' | 'Specialized' | 'Standard';
  primaryWorkflow: string;
  output: string;
  url?: string;
}

export interface StandardCodeItem {
  id: string;
  code: string;
  name: string;
  organization?: string;
  purpose: string;
  scope: string;
}

export interface WorkflowStep {
  stepNumber: number;
  name: string;
  description: string;
  toolUsed?: string;
  deliverable?: string;
}

export interface DetailedWorkflow {
  id: string;
  title: string;
  summary?: string;
  steps: WorkflowStep[];
}

export interface PracticalTask {
  task: string;
  output: string;
  tools: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  duration?: string;
}

export interface DeliverableItem {
  category: string;
  item: string;
  format: string;
  description: string;
}

export interface ProjectCaseStudy {
  id?: string;
  name: string;
  client?: string;
  location?: string;
  sector?: string;
  relevance: string;
  engineerRole: string;
  challenge: string;
  deliverables: string[];
}

export interface PortfolioProject {
  title: string;
  objective: string;
  scope: string;
  inputs: string[];
  tools: string[];
  deliverables: string[];
  validation: string;
  interviewPitch: string;
}

/**
 * Global Relevance Score — a transparent, data-derived indicator (0-100%) of how
 * widely applicable / in-demand a topic, role, or focus area is across the global
 * engineering industry. This is NOT sourced from a specific salary survey or labor
 * market database — it is computed from (a) the domain category the topic belongs to
 * and (b) how many software tools, standards, projects, and roles are linked to it
 * inside this platform's own registries. Always shown with its methodology note so
 * it is never mistaken for verified market research.
 */
export interface GlobalRelevance {
  /** 0-100 indicative score */
  score: number;
  /** Human-readable tier derived from the score */
  tier: 'Very High' | 'High' | 'Moderate' | 'Emerging';
  /** Short, transparent explanation of how the score was derived */
  note: string;
}

export interface CareerRoleTarget {
  id?: string;
  title: string;
  demand: 'Very High' | 'High' | 'Moderate' | 'Specialized';
  experienceLevel: string;
  responsibilities: string[];
  globalRelevance: GlobalRelevance;
}

export interface IndustryOrg {
  id?: string;
  name: string;
  type: string;
  certifications?: string;
  role: string;
}

export interface CoursePath {
  id?: string;
  title: string;
  provider: string;
  level: string;
  duration?: string;
  url?: string;
}

export interface PluginItemRef {
  id?: string;
  name: string;
  hostSoftware?: string[];
  purpose?: string;
}

export interface ResourceRef {
  id?: string;
  title: string;
  type: string;
  author?: string;
  description?: string;
  link?: string;
}

export interface TimelinePhase {
  phase: number;
  name: string;
  duration: string;
  focus: string;
  milestone: string;
  deliverables: string[];
}

export interface CommonMistake {
  mistake: string;
  consequence: string;
  prevention: string;
}

export interface QaQcCheckItem {
  id: string;
  category: string;
  checkItem: string;
  standardRef?: string;
}

export interface AdvancedTopicItem {
  topic: string;
  description: string;
  industryImpact: string;
}

export interface CareerReadyCheckItem {
  id: string;
  statement: string;
  category: string;
}

export interface Stage05MasteryRecord {
  focusAreaId: string;
  title: string;
  fieldTitle: string;
  branchTitle: string;
  specializationTitle: string;

  /** Overall Global Relevance Score for this Focus Area (see GlobalRelevance doc above). */
  globalRelevance: GlobalRelevance;

  /**
   * Standing disclaimer describing how this record was produced. Must be surfaced
   * in the UI wherever this record's content (especially demand %, timeline weeks,
   * or example figures) is shown to a viewer.
   */
  contentDisclaimer: string;
  
  // Section 1: Overview
  overview: {
    whatItIs: string;
    whyItMatters: string;
    whereItFits: string;
    relatedDisciplines: string[];
    projectContext: string;
    professionalImportance: string;
  };

  // Section 2: Prerequisites
  prerequisites: {
    mathScience: string[];
    coreMechanics: string[];
    codingAndSoftware: string[];
    priorTopics: string[];
  };

  // Section 3: Learning Objectives
  learningObjectives: string[];

  // Section 4: Knowledge Matrix
  knowledgeMatrix: {
    foundation: string[];
    coreEngineering: string[];
    appliedConcepts: string[];
    advancedConcepts: string[];
    calculationsTheory: string[];
    designCodes: string[];
  };

  // Section 5: Skills Matrix
  skillsMatrix: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
    professional: string[];
  };

  // Section 6: Calculation / Analysis Competencies
  calculationCompetencies: {
    governingEquations: GoverningEquation[];
    inputVariables: InputVariable[];
    assumptions: string[];
    outputs: string[];
    validationMethods: string[];
  };

  // Section 7: Software Tools
  software: SoftwareToolItem[];

  // Section 8: Standards & Codes
  standards: StandardCodeItem[];

  // Section 9: Professional Workflows
  workflows: DetailedWorkflow[];

  // Section 10: Practical Work
  practicalWork: PracticalTask[];

  // Section 11: Engineering Deliverables
  deliverables: DeliverableItem[];

  // Section 12: Real Projects / Case Studies
  projects: ProjectCaseStudy[];

  // Section 13: Practice Exercises
  practiceExercises: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
    professional: string[];
  };

  // Section 14: Portfolio Projects
  portfolioProjects: PortfolioProject[];

  // Section 15: Career Roles
  careerRoles: CareerRoleTarget[];

  // Section 16: Industry Organizations
  organizations: IndustryOrg[];

  // Section 17: Courses / Learning Paths
  courses: CoursePath[];

  // Section 18: Plugins / Tools
  plugins: PluginItemRef[];

  // Section 19: Drawings / Templates
  drawingsAndTemplates: Array<{ name: string; type: 'Drawing' | 'Template' | 'Specification'; format: string; description: string }>;

  // Section 20: Resources & References
  resources: ResourceRef[];

  // Section 21: UELE Connections
  ueleConnection: {
    objectId?: string;
    objectName?: string;
    world?: string;
    what: string;
    why: string;
    howToInspect: string;
    isAvailable: boolean;
  };

  // Section 22: Career Mastery Timeline
  timeline: TimelinePhase[];

  // Section 23: Job Market / Industry Relevance
  jobMarket: {
    roles: string[];
    targetIndustries: string[];
    marketDemand: 'Very High' | 'High' | 'Moderate' | 'Specialized';
    seniorityRange: string;
    globalRelevance: GlobalRelevance;
    topHiringSectors: string[];
  };

  // Section 24: Common Mistakes
  commonMistakes: CommonMistake[];

  // Section 25: QA/QC Checklist
  qaQcChecklist: QaQcCheckItem[];

  // Section 26: Advanced Topics
  advancedTopics: AdvancedTopicItem[];

  // Section 27: Career-Ready Checklist
  careerReadyChecklist: CareerReadyCheckItem[];
}
