export type Language = 'bn' | 'en';

export type TimeOfDay = 'day' | 'sunset' | 'night' | 'storm';

export type PlantScenario = 'normal' | 'monsoon_turbidity' | 'filter_backwash' | 'power_saving';

export type EquipmentId =
  | 'river_intake'
  | 'coagulation'
  | 'flocculation'
  | 'clarifier_1'
  | 'clarifier_2'
  | 'filtration'
  | 'chlorination'
  | 'storage_tanks'
  | 'sludge_treatment'
  | 'admin_building';

export interface TelemetryData {
  turbidityIn: number; // NTU
  turbidityOut: number; // NTU
  flowRate: number; // m3/hr
  phLevel: number;
  pressure: number; // bar
  chemicalDose: number; // mg/L (Alum / Poly / Chlorine)
  energyConsumption: number; // kW
  temperature: number; // °C
  tankLevel: number; // %
  motorRpm: number;
  efficiency: number; // %
  dissolvedOxygen?: number; // mg/L
  freeChlorine?: number; // mg/L
  tds?: number; // ppm
}

export interface EquipmentDetail {
  id: EquipmentId;
  nameBn: string;
  nameEn: string;
  categoryBn: string;
  categoryEn: string;
  shortDescBn: string;
  shortDescEn: string;
  fullDescBn: string;
  fullDescEn: string;
  processStepsBn: string[];
  processStepsEn: string[];
  keySpecs: { labelBn: string; labelEn: string; value: string }[];
  workingPrincipleBn: string;
  workingPrincipleEn: string;
  position3D: [number, number, number];
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
  defaultTelemetry: TelemetryData;
}

export interface EquipmentRuntimeState {
  id: EquipmentId;
  isRunning: boolean;
  status: 'running' | 'warning' | 'stopped' | 'maintenance' | 'backwashing';
  motorRpm: number;
  flowRate: number;
  tankLevel: number;
  chemicalDosingRate: number;
  valveOpen: boolean;
  alertMessage?: string;
  telemetry: TelemetryData;
}

export interface PlantState {
  isMasterRunning: boolean;
  simSpeed: number;
  timeOfDay: TimeOfDay;
  scenario: PlantScenario;
  language: Language;
  soundEnabled: boolean;
  activeEquipmentId: EquipmentId | null;
  cameraView: 'overview' | 'intake' | 'clarifier' | 'filtration' | 'storage' | 'sludge' | 'custom';
  tourActive: boolean;
  tourStep: number;
  equipmentStates: Record<EquipmentId, EquipmentRuntimeState>;
  waterQuality: {
    rawRiverTurbidity: number; // NTU
    coagulatedTurbidity: number;
    settledTurbidity: number;
    filteredTurbidity: number;
    finishedWaterTurbidity: number;
    finishedPh: number;
    finishedChlorine: number;
    totalTreatedToday: number; // m3
    activeAlarms: string[];
  };
}
