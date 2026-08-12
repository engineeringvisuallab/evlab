/**
 * EVLab — Registry Type System
 *
 * Registries are normalized, flat, ID-keyed lookup tables. Career
 * Roadmap nodes and UELE objects reference registry items by ID only
 * (never by duplicating the object). Each registry JSON file is a
 * Record<string, T> keyed by the item's own `id`.
 *
 * Not every registry needs identical fields — each interface extends
 * a common base and adds only what makes semantic sense for that
 * domain.
 */

/** Fields shared by (almost) every registry item. */
export interface RegistryItemBase {
  id: string;
  name: string;
  description?: string;
  url?: string;
  tags?: string[];
  /** IDs of related items — may point within the same registry or across registries. */
  relatedIds?: string[];
}

/** A generic keyed registry file shape: { [id]: T } */
export type Registry<T extends RegistryItemBase> = Record<string, T>;

/** knowledge.json — core engineering concepts & theory. */
export interface KnowledgeItem extends RegistryItemBase {
  discipline?: string;
}

/** skills.json — practical, applied engineering skills. */
export interface SkillItem extends RegistryItemBase {
  discipline?: string;
}

/** software.json — engineering software & tools. */
export interface SoftwareItem extends RegistryItemBase {
  vendor?: string;
  courseIds?: string[];
  pluginIds?: string[];
}

/** standards.json — codes, standards, and specifications. */
export interface StandardItem extends RegistryItemBase {
  issuingBody?: string;
  region?: string;
}

/** workflow.json — design/analysis/operational workflows. */
export interface WorkflowItem extends RegistryItemBase {
  steps?: string[];
}

/** projects.json — real engineering projects and case studies. */
export interface ProjectItem extends RegistryItemBase {
  location?: string;
  year?: string;
  sector?: string;
}

/** career-roles.json — industry job titles & role metadata. */
export interface CareerRoleItem extends RegistryItemBase {
  demand?: string;
  discipline?: string;
}

/** organizations.json — employers, agencies, utilities, consultancies. */
export interface OrganizationItem extends RegistryItemBase {
  type?: string;
  region?: string;
}

/** courses.json — course catalogue entries. */
export interface CourseItem extends RegistryItemBase {
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  durationHours?: number;
  instructor?: string;
}

/** plugins.json — software plugins / add-ons. */
export interface PluginItem extends RegistryItemBase {
  software?: string;
  price?: string;
}

/** drawings.json — CAD/BIM resource files. */
export interface DrawingItem extends RegistryItemBase {
  fileType?: string;
}

/** templates.json — design/report/calculation templates. */
export interface TemplateItem extends RegistryItemBase {
  fileType?: string;
}

/** resources.json — general technical resources not covered above. */
export interface ResourceItem extends RegistryItemBase {
  resourceType?: string;
}
