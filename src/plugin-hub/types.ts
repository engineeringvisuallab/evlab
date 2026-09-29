export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';
export type SoftwareId = 'autocad' | 'sketchup' | 'revit' | 'civil3d';
export type MainNavTab = 'software_groups' | 'plugins';

export interface SoftwareInfo {
  id: SoftwareId;
  name: string;
  shortName: string;
  badge: string;
  descriptionBn: string;
  descriptionEn: string;
  fileFormat: string;
  formatName: string;
  brandColor: string;
  accentBg: string;
  textColor: string;
  borderColor: string;
}

export interface InstallationStep {
  stepNumber: number;
  titleBn: string;
  titleEn: string;
  instructionBn: string;
  instructionEn: string;
  command?: string;
}

export interface PluginItem {
  id: string;
  nameEn: string;
  nameBn: string;
  softwareId: SoftwareId;
  version: string;
  updatedDateBn: string;
  updatedDateEn: string;
  fileFormat: '.lsp' | '.rbz' | '.dyn';
  fileName: string;
  fileSize: string;
  categoryBn: string;
  categoryEn: string;
  shortSummaryBn: string;
  shortSummaryEn: string;
  purposeBn: string;
  purposeEn: string;
  highlightsBn: string[];
  highlightsEn: string[];
  installationSteps: InstallationStep[];
  quickCommand?: string;
  compatibilityBn: string;
  compatibilityEn: string;
  rawCodeSnippet: string;
}

export interface SoftwareGroup {
  id: string;
  softwareId: string;
  softwareName: string;
  shortName: string;
  nameEn: string;
  nameBn: string;
  taglineEn: string;
  taglineBn: string;
  icon: string;
  packageTypeEn: string;
  packageTypeBn: string;
  workCategoryKey: 'transportation' | 'architecture' | 'estimating' | 'survey_civil' | 'vertex_3d' | 'bim' | 'civil_infra' | 'plant3d_mep' | 'landscape' | 'all';
  workCategoryEn: string;
  workCategoryBn: string;
  fileFormat: string; // e.g. '.rbz' or '.zip'
  versionSupport: string;
  brandColor: string;
  accentGradient: string;
  badgeEn: string;
  badgeBn: string;
  badgeColor: string;
  descriptionEn: string;
  descriptionBn: string;
  includedPlugins: {
    id: string;
    nameEn: string;
    nameBn: string;
    descriptionEn: string;
    descriptionBn: string;
    category: string;
  }[];
  fileCount: number;
  totalSize: string;
  downloadFileName: string;
  highlightsEn: string[];
  highlightsBn: string[];
  quickInstallEn: string;
  quickInstallBn: string;
}

export type SuiteDownloadTarget = 'all' | 'sketchup' | 'autocad' | 'blender' | '3dsmax' | 'universal';

export interface PluginSuite {
  id: string;
  codeName: string; // e.g. 'EVL-Architech', 'EVL-Transportation', 'EVL-Vertex'
  nameEn: string;
  nameBn: string;
  taglineEn: string;
  taglineBn: string;
  icon: string;
  badgeEn: string;
  badgeBn: string;
  accentColor: string; // hex or tailwind class
  badgeColor: string;
  bgGradient: string;
  descriptionEn: string;
  descriptionBn: string;
  includedPluginIds: string[];
  supportedSoftwares: {
    name: string;
    format: string;
    badge: string;
  }[];
  highlightsEn: string[];
  highlightsBn: string[];
  estimatedTotalSize: string;
  pluginCount: number;
}
