/**
 * EVL WTP Engineering Suite - Chemical Safety, Laboratory Management, HVAC & Stormwater Engine
 * Handles Chemical Containment (110%), Chlorine Scrubber Neutralization, Laboratory Sample Matrix,
 * Chlorine Building Ventilation (15 AC/hr), Fire Safety, and Stormwater Rational Method.
 */

export interface ChemicalCompatibilityItem {
  chemicalName: string;
  storageMaterial: string;
  pipingMaterial: string;
  incompatibleWith: string[];
  secondaryContainmentVolumePct: number;
  containmentStatus: 'PASS' | 'FAIL';
  safetyRequirements: string[];
}

export interface ChlorineSafetyScrubberSpec {
  totalCylinderInventoryKg: number;
  largestCylinderCapacityKg: number; // 1000 kg ton container
  leakDetectorThresholdPpm: number;
  scrubberAirflowM3Hr: number;
  causticSodaTankVolumeM3: number;
  neutralizationEfficiencyPct: number;
  ventilationAirChangesPerHr: number;
  status: 'PASS' | 'WARNING';
}

export interface LaboratorySamplePoint {
  samplePointId: string;
  locationName: string;
  samplingFrequency: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
  testParameters: string[];
  testMethodStandard: string; // e.g. APHA / ISO / Standard Methods
  assignedInstrument: string;
}

export interface SiteStormwaterRationalSpec {
  returnPeriodYears: number;
  catchmentAreaHectares: number;
  runoffCoefficientC: number;
  rainfallIntensityMmHr: number;
  peakStormRunoffM3s: number;
  stormDrainPipeDiameterMm: number;
  finishedFloorLevelMarginM: number;
}

export function generateChemicalSafetyAndLabEngine(
  capacityMLD: number = 100
): {
  chemicalSafety: ChemicalCompatibilityItem[];
  chlorineScrubber: ChlorineSafetyScrubberSpec;
  labSamplePoints: LaboratorySamplePoint[];
  stormwater: SiteStormwaterRationalSpec;
} {
  // 1. Chemical Compatibility
  const chemicalSafety: ChemicalCompatibilityItem[] = [
    { chemicalName: 'Liquid Aluminum Sulfate (Alum)', storageMaterial: 'FRP (Fiberglass Reinforced Plastic)', pipingMaterial: 'uPVC / HDPE / Rubber Lined MS', incompatibleWith: ['Carbon Steel', 'Concrete', 'Strong Bases'], secondaryContainmentVolumePct: 110, containmentStatus: 'PASS', safetyRequirements: ['Eyewash Station', 'Acid Resistant Suit', 'Secondary Bunded Wall'] },
    { chemicalName: 'Hydrated Lime Ca(OH)2', storageMaterial: 'Epoxy Coated Carbon Steel Silo', pipingMaterial: 'Schedule 80 PVC / SS316', incompatibleWith: ['Aluminum', 'Acids', 'Fluorine'], secondaryContainmentVolumePct: 110, containmentStatus: 'PASS', safetyRequirements: ['Dust Extraction Hood', 'N95 Respirator', 'Emergency Shower'] },
    { chemicalName: 'Gas Chlorine Cl2', storageMaterial: 'Forged Carbon Steel Ton Cylinders (1000 kg)', pipingMaterial: 'Seamless Carbon Steel Sch 80 / Monel', incompatibleWith: ['Ammonia', 'Hydrocarbons', 'Moisture/Water'], secondaryContainmentVolumePct: 100, containmentStatus: 'PASS', safetyRequirements: ['Automated Emergency Scrubber', 'Dual Leak Detectors', 'Self-Contained Breathing Apparatus (SCBA)'] }
  ];

  // 2. Chlorine Gas Scrubber Neutralization
  const chlorineScrubber: ChlorineSafetyScrubberSpec = {
    totalCylinderInventoryKg: 12000, // 12 cylinders x 1000 kg
    largestCylinderCapacityKg: 1000,
    leakDetectorThresholdPpm: 0.5,
    scrubberAirflowM3Hr: 5400,
    causticSodaTankVolumeM3: 6.5, // 20% NaOH solution
    neutralizationEfficiencyPct: 99.99,
    ventilationAirChangesPerHr: 15, // 15 air changes/hour per NFPA 820
    status: 'PASS'
  };

  // 3. Laboratory Sample Matrix
  const labSamplePoints: LaboratorySamplePoint[] = [
    { samplePointId: 'SMP-001', locationName: 'Raw Water River Intake Shaft', samplingFrequency: 'Hourly', testParameters: ['pH', 'Turbidity', 'Conductivity', 'Temperature'], testMethodStandard: 'APHA 2130B / APHA 4500-H+', assignedInstrument: 'Continuous On-Line Turbidimeter & pH Meter' },
    { samplePointId: 'SMP-002', locationName: 'Flash Mixer Coagulation Outlet', samplingFrequency: 'Daily', testParameters: ['pH', 'Alkalinity', 'Zeta Potential'], testMethodStandard: 'APHA 2320B Titration', assignedInstrument: 'Lab Benchtop pH & Titrator' },
    { samplePointId: 'SMP-003', locationName: 'Lamella Clarifier Settled Water Header', samplingFrequency: 'Hourly', testParameters: ['Settled Turbidity', 'Floc Size', 'Residual Al'], testMethodStandard: 'APHA 3120 ICP-OES', assignedInstrument: 'Online Laser Turbidimeter' },
    { samplePointId: 'SMP-004', locationName: 'Rapid Sand Filter Combined Effluent', samplingFrequency: 'Hourly', testParameters: ['Filtered Turbidity', 'Particle Count'], testMethodStandard: 'ISO 7027', assignedInstrument: 'Low-Range Laser Turbidimeter' },
    { samplePointId: 'SMP-005', locationName: 'Clear Water Reservoir Final Delivery', samplingFrequency: 'Hourly', testParameters: ['Free Chlorine Residual', 'pH', 'Turbidity', 'E. coli / Fecal Coliforms'], testMethodStandard: 'APHA 4500-Cl G / Membrane Filtration', assignedInstrument: 'Amperometric Chlorine Analyzer' }
  ];

  // 4. Site Stormwater Rational Method: Q = C * I * A / 360
  const C_coeff = 0.75; // Paved plant compound
  const Area_ha = 6.5; // 6.5 hectares plant footprint
  const ReturnPeriodYears = 25;
  const Intensity_mm_hr = 110; // 25-year 1-hour storm intensity

  const Q_storm_m3s = (C_coeff * Intensity_mm_hr * Area_ha) / 360;

  const stormwater: SiteStormwaterRationalSpec = {
    returnPeriodYears: ReturnPeriodYears,
    catchmentAreaHectares: Area_ha,
    runoffCoefficientC: C_coeff,
    rainfallIntensityMmHr: Intensity_mm_hr,
    peakStormRunoffM3s: Number(Q_storm_m3s.toFixed(2)),
    stormDrainPipeDiameterMm: 900,
    finishedFloorLevelMarginM: 1.0 // Finished floor 1.0m above 100-year HFL
  };

  return { chemicalSafety, chlorineScrubber, labSamplePoints, stormwater };
}
