/**
 * EVLab — Registry Type Definitions
 */

export interface RegistryItemBase {
  id: string;
  name: string;
  description?: string;
  url?: string;
  tags?: string[];
  relatedIds?: string[];
}

export interface KnowledgeItem extends RegistryItemBase {
  discipline?: string;
  level?: 'fundamental' | 'intermediate' | 'advanced';
}

export interface SkillItem extends RegistryItemBase {
  category?: string;
}

export interface SoftwareItem extends RegistryItemBase {
  category?: string;
  courseIds?: string[];
  pluginIds?: string[];
  vendor?: string;
}

export interface StandardItem extends RegistryItemBase {
  code?: string;
  organization?: string;
  country?: string;
}

export interface WorkflowItem extends RegistryItemBase {
  steps?: string[];
  softwareUsed?: string[];
}

export interface ProjectItem extends RegistryItemBase {
  location?: string;
  year?: number | string;
  sector?: string;
  type?: string;
  client?: string;
}

export interface CareerRoleItem extends RegistryItemBase {
  demand?: string;
  responsibilities?: string[];
  averageSalaryRange?: string;
}

export interface OrganizationItem extends RegistryItemBase {
  type?: string;
  headquarters?: string;
  logoUrl?: string;
}

export interface CourseItem extends RegistryItemBase {
  provider?: string;
  level?: string;
  duration?: string;
  rating?: number;
}

export interface PluginItem extends RegistryItemBase {
  hostSoftware?: string[];
  version?: string;
  author?: string;
  price?: string;
}

export interface DrawingItem extends RegistryItemBase {
  format?: string;
  category?: string;
  fileUrl?: string;
}

export interface TemplateItem extends RegistryItemBase {
  format?: string;
  category?: string;
}

export interface ResourceItem extends RegistryItemBase {
  type?: string;
  fileFormat?: string;
}

export type GenericRegistry<T extends RegistryItemBase> = Record<string, T>;
