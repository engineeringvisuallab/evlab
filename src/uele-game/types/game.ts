/**
 * UELE — Ultimate Engineering Learning Ecosystem
 * Core Game & Simulation Types
 */

export type EngineeringDistrictId =
  | 'bhabanipur'
  | 'bishalpur'
  | 'mirzapur'
  | 'shimabari'
  | 'sughat'
  | 'garidaha'
  | 'khamarkandi'
  | 'khanpur'
  | 'kusumbi'
  | 'shah_bandegi'
  | 'sherpur_paurashava';

export type EngineeringDiscipline =
  | 'civil'
  | 'structural'
  | 'water'
  | 'transport'
  | 'energy'
  | 'mechanical'
  | 'environmental'
  | 'survey_gis'
  | 'materials'
  | 'advanced';

export type CameraViewMode =
  | 'world'       // Strategic aerial map view
  | 'walk'        // Ground-level engineer inspection
  | 'engineer'    // Isometric technical view
  | 'design'      // Top-down build & grid mode
  | 'analysis'    // Thermal / stress / flow heatmaps
  | 'cinematic';  // Dynamic cinematic sweep

export type WeatherType = 'clear' | 'overcast' | 'rain' | 'storm' | 'fog';
export type TimeOfDay = 'dawn' | 'day' | 'golden' | 'night';

export interface EngineerProfile {
  name: string;
  title: string;
  rankIndex: number;
  level: number;
  totalXp: number;
  funds: number; // Budget in $
  reputation: number; // 0 - 100
  specialization: string;
  avatarId: string;
  xpByDiscipline: {
    knowledge: number;
    design: number;
    practical: number;
    analysis: number;
    safety: number;
    site: number;
    management: number;
    innovation: number;
  };
  completedMissionIds: string[];
  unlockedSkillIds: string[];
  achievements: string[];
  builtInfrastructureCount: number;
}

export interface DistrictInfo {
  id: EngineeringDistrictId;
  name: string;
  admCode: string;
  areaKm2: number;
  centroid: [number, number]; // [UTM X, UTM Y]
  primaryDiscipline: EngineeringDiscipline;
  secondaryDisciplines: EngineeringDiscipline[];
  title: string;
  tagline: string;
  description: string;
  elevationMeters: number;
  activeProjects: number;
  infrastructureStatus: {
    powerGrid: number; // 0 - 100%
    waterSupply: number;
    roadQuality: number;
    drainageCapacity: number;
    structuralHealth: number;
    environmentalIndex: number;
  };
  keyFacilities: string[];
  icon: string;
  color: string;
}

export interface TargetCriterion {
  min?: number;
  max?: number;
  target?: number;
  tolerance?: number;
  unit: string;
  label: string;
}

export interface Mission {
  id: string;
  districtId: EngineeringDistrictId;
  discipline: EngineeringDiscipline;
  title: string;
  subtitle: string;
  difficulty: 'Student' | 'Junior' | 'Site' | 'Design' | 'Senior' | 'Master' | 'Boss';
  timeEstimateMin: number;
  rewardXp: {
    knowledge: number;
    design: number;
    practical: number;
    analysis?: number;
    safety?: number;
    site?: number;
    management?: number;
    innovation?: number;
  };
  rewardBudget: number;
  briefing: {
    situation: string;
    siteCondition: string;
    objectives: string[];
    engineeringStandard: string;
    technicalHint: string;
  };
  interactiveType:
    | 'drainage_hydraulic'
    | 'bridge_structural'
    | 'water_network'
    | 'concrete_mix'
    | 'column_shear'
    | 'survey_leveling'
    | 'pump_curve'
    | 'solar_grid'
    | 'wastewater_bod'
    | 'traffic_signal'
    | 'flood_boss'
    | 'earthquake_boss';
  initialParameters: Record<string, number | string>;
  targetCriteria: Record<string, TargetCriterion>;
}

export interface BuildItem {
  id: string;
  name: string;
  category: 'road' | 'drainage' | 'water' | 'structural' | 'energy' | 'survey';
  cost: number;
  description: string;
  dimensions: { width: number; height: number; length: number };
  capacityMetric: string;
  maintenanceCostPerDay: number;
  meshType: string;
  color: string;
}

export interface PlacedInfrastructure {
  id: string;
  buildItemId: string;
  districtId: EngineeringDistrictId;
  position: [number, number, number]; // [X, Y, Z]
  rotation: number;
  health: number; // 0-100
  active: boolean;
  metricValue: number;
  timestamp: number;
}

export interface SkillNode {
  id: string;
  name: string;
  discipline: EngineeringDiscipline;
  category: string;
  tier: number; // 1 to 5
  description: string;
  practicalSkill: string;
  xpCost: number;
  prerequisiteIds: string[];
  unlocked: boolean;
  icon: string;
}

export interface FailureReport {
  title: string;
  parameterName: string;
  actualValue: string;
  requiredValue: string;
  physicalConsequence: string;
  safetyImpact: string;
  economicImpact: string;
  remedyAction: string;
  governingFormula: string;
}
