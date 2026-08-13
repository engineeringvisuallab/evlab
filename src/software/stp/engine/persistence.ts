/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Engineering Data Persistence Service
 * @license Apache-2.0
 */

import { ProjectState, ProjectIdentity, SiteInformation, DesignObjectives, DesignBasis, InfluentQuality } from '../types/stp';
import { MASTER_PARAMETER_CATALOG } from './parameters';
import { AssumptionEngine } from './assumptions';
import { StreamAndAssetEngine } from './streamsAndAssets';
import { ScenarioEngine } from './scenariosAndAlternatives';
import { ValidationEngine } from './validations';
import { CalculationEngine } from './calculations';

const STORAGE_KEY = 'EVLAB_STP_PROJECT_STATE_V1';

export class PersistenceEngine {
  /**
   * Factory creating a brand new default STP engineering project state.
   */
  public static createNewProject(name: string = 'Municipal Sewage Treatment Plant Design'): ProjectState {
    const identity: ProjectIdentity = {
      id: 'STP-PROJ-001',
      name,
      client: 'Metropolitan Water Supply & Sewerage Authority',
      consultant: 'EVLab Engineering Consultants',
      contractor: 'Pending Tender Procurement',
      location: 'Central Zone WWTP Facility',
      country: 'Bangladesh',
      coordinates: { latitude: 23.8103, longitude: 90.4125 },
      crs: 'EPSG:4326',
      description: 'Full-Scale Municipal Sewerage Collection Network and Biological Wastewater Treatment Facility.',
      revision: 'Rev 01',
      revisionDate: new Date().toISOString().split('T')[0],
      designer: 'Senior Sanitary Engineer',
      reviewer: 'Principal Process Specialist',
      approver: 'Chief Engineering Officer',
      projectStatus: 'DETAILED_DESIGN',
      designStage: 'FINAL',
    };

    const siteInfo: SiteInformation = {
      siteAreaM2: 25000,
      availableLandM2: 18000,
      groundElevationMasl: 8.5,
      terrainType: 'FLAT',
      groundwaterTableDepthM: 1.8,
      floodLevel100YrMasl: 11.2,
      climateZone: 'TROPICAL',
      minTempCelsius: 12.0,
      avgTempCelsius: 26.5,
      maxTempCelsius: 38.0,
    };

    const objectives: DesignObjectives = {
      dischargeTarget: 'RIVER_SURFACE',
      regulatoryStandard: 'WHO',
      landPriority: 'BALANCED',
      energyPriority: 'LOW_ENERGY',
      capexPriority: 'BALANCED',
      opexPriority: 'LOW_O_AND_M',
      robustnessPriority: 'HIGH_SHOCK_RESILIENCE',
      operatorSkillLevel: 'CERTIFIED',
    };

    const designBasis: DesignBasis = {
      presentYear: 2026,
      presentPopulation: 50000,
      selectedPopMethod: 'GEOMETRIC',
      censusHistory: [
        { year: 1996, population: 22000 },
        { year: 2006, population: 31000 },
        { year: 2016, population: 41000 },
        { year: 2026, population: 50000 },
      ],
      growthRatePct: 2.5,
      designHorizonYears: 30,
      intermediateHorizonYears: 15,
      designPopulation: 104877,
      intermediatePopulation: 72400,
      immediatePopulation: 50000,
      servedPopulationPct: 90,
      sewerageCoveragePct: 85,
      perCapitaWaterDemandLpd: 135,
      domesticDemandM3d: 11326,
      commercialDemandM3d: 500,
      institutionalDemandM3d: 0,
      industrialDemandM3d: 1000,
      nrwPct: 20,
      sewerageReturnFactor: 0.80,
      domesticReturnFactor: 0.80,
      commercialReturnFactor: 0.80,
      industrialReturnFactor: 0.85,
      infiltrationConfig: {
        method: 'PIPE_LENGTH',
        pipeLengthKm: 45,
        rateLpsKm: 0.33,
        catchmentAreaHa: 450,
        rateLhaDay: 2800,
        perCapitaLpd: 15,
        rainInflowPct: 20,
        seasonalFactor: 1.0,
        designInfiltrationLps: 15.0,
        designInflowLps: 25.0,
      },
      infiltrationAllowanceLpsKm: 15.0,
      inflowAllowancePct: 10,
      peakingMethod: 'HARMON',
      seasonalPeakFactor: 1.15,
      hourlyPeakFactor: 2.25,
      diurnalProfileType: 'RESIDENTIAL',
      industrialProfiles: [
        {
          id: 'IND-01',
          name: 'Textile Wet Processing Plant',
          industryCategory: 'TEXTILE',
          flowM3d: 600,
          bod5MgL: 450,
          codMgL: 950,
          tssMgL: 350,
          tknMgL: 35,
          tpMgL: 6.0,
          isPretreated: true,
          peakFactor: 1.5,
          heavyMetalsPresent: false,
          toxicityRisk: 'LOW',
        },
        {
          id: 'IND-02',
          name: 'Dairy & Food Beverage Facility',
          industryCategory: 'FOOD_BEVERAGE',
          flowM3d: 400,
          bod5MgL: 800,
          codMgL: 1400,
          tssMgL: 500,
          tknMgL: 55,
          tpMgL: 12.0,
          isPretreated: true,
          peakFactor: 1.8,
          heavyMetalsPresent: false,
          toxicityRisk: 'LOW',
        },
      ],
      adwfM3d: 12826,
      awwfM3d: 14750,
      pdwfM3d: 28858,
      pwwfM3d: 30154,
      minFlowM3d: 4500,
      peakFlowLps: 349.0,
      stages: [],
    };

    const influentQuality: InfluentQuality = {
      flowM3d: { min: 4500, avg: 12826, max: 30154, designValue: 12826, unit: 'm3/day', isAssumed: false, source: 'Calculated ADWF' },
      bod5: { min: 180, avg: 250, max: 380, designValue: 250, unit: 'mg/L', isAssumed: true, source: 'Metcalf & Eddy Domestic Sewage' },
      cod: { min: 320, avg: 450, max: 700, designValue: 450, unit: 'mg/L', isAssumed: true, source: 'Metcalf & Eddy Domestic Sewage' },
      codSoluble: { min: 120, avg: 200, max: 310, designValue: 200, unit: 'mg/L', isAssumed: true, source: '0.45 x Total COD' },
      codInert: { min: 20, avg: 50, max: 90, designValue: 50, unit: 'mg/L', isAssumed: true, source: 'Respirometric Estimate' },
      toc: { min: 80, avg: 140, max: 220, designValue: 140, unit: 'mg/L', isAssumed: true, source: 'Assumed Ratio' },
      tss: { min: 180, avg: 280, max: 450, designValue: 280, unit: 'mg/L', isAssumed: true, source: 'Domestic Sewage Average' },
      vss: { min: 140, avg: 224, max: 360, designValue: 224, unit: 'mg/L', isAssumed: true, source: '0.8 x TSS' },
      tds: { min: 300, avg: 500, max: 800, designValue: 500, unit: 'mg/L', isAssumed: true, source: 'Municipal Supply TDS' },
      tn: { min: 25, avg: 48, max: 75, designValue: 48, unit: 'mg/L', isAssumed: true, source: 'TKN + NO3' },
      tkn: { min: 25, avg: 45, max: 70, designValue: 45, unit: 'mg/L', isAssumed: true, source: 'Domestic Sewage Average' },
      nh3n: { min: 15, avg: 30, max: 50, designValue: 30, unit: 'mg/L', isAssumed: true, source: 'Domestic Sewage Average' },
      no3n: { min: 0, avg: 1.0, max: 3.0, designValue: 1.0, unit: 'mg/L', isAssumed: true, source: 'Traces' },
      orgN: { min: 8, avg: 15, max: 25, designValue: 15, unit: 'mg/L', isAssumed: true, source: 'TKN - NH3' },
      tp: { min: 4.0, avg: 8.0, max: 14.0, designValue: 8.0, unit: 'mg/L', isAssumed: true, source: 'Detergent Contribution' },
      po4p: { min: 2.0, avg: 5.0, max: 9.0, designValue: 5.0, unit: 'mg/L', isAssumed: true, source: 'Orthophosphate Ratio' },
      alkalinity: { min: 150, avg: 250, max: 400, designValue: 250, unit: 'mg/L', isAssumed: true, source: 'Carbonate Hardness' },
      ph: { min: 6.8, avg: 7.4, max: 8.2, designValue: 7.4, unit: '-', isAssumed: false, source: 'Measured Field Probe' },
      temperature: { min: 12.0, avg: 24.0, max: 32.0, designValue: 18.0, unit: '°C', isAssumed: false, source: 'Winter Minimum Design' },
      tempMax: { min: 22.0, avg: 30.0, max: 38.0, designValue: 32.0, unit: '°C', isAssumed: false, source: 'Summer Maximum Design' },
      do: { min: 0.0, avg: 0.5, max: 2.0, designValue: 0.5, unit: 'mg/L', isAssumed: true, source: 'Septic Sewer Influent' },
      oilAndGrease: { min: 15, avg: 35, max: 80, designValue: 35, unit: 'mg/L', isAssumed: true, source: 'Kitchen Waste Contribution' },
      fecalColiform: { min: 1e5, avg: 1e7, max: 1e8, designValue: 1e7, unit: 'MPN/100mL', isAssumed: true, source: 'Domestic Sewage Standard' },
      codFractions: {
        codTotal: 450,
        codSoluble: 200,
        codInert: 50,
        codParticulate: 250,
        codBiodegradable: 400,
      },
      ratios: {
        bodToCod: 0.555,
        codToTkn: 10.0,
        bodToTp: 31.25,
        bodToTkn: 25.0,
        vssToTss: 0.8,
        alkToTkn: 5.55,
        biodegradability: 'HIGHLY_BIODEGRADABLE',
        denitrificationFeasibility: 'EXCELLENT',
        ebprFeasibility: 'HIGH',
        alkalinityFeasibility: 'SUFFICIENT',
      },
      samplingConfidence: {
        sampleCount: 24,
        dataQualityFlag: 'MEASURED_HIGH_CONFIDENCE',
        confidenceIntervalPct: 95,
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    };

    const defaultScenario = ScenarioEngine.createDefaultScenario('SCEN-A', 'Scenario A (CAS Baseline)', 'Conventional Activated Sludge Baseline Design', designBasis, influentQuality);

    const project: ProjectState = {
      identity,
      siteInfo,
      objectives,
      activeScenarioId: 'SCEN-A',
      scenarios: { 'SCEN-A': defaultScenario },
      parameterRegistry: JSON.parse(JSON.stringify(MASTER_PARAMETER_CATALOG)),
      assumptions: AssumptionEngine.generateDefaultAssumptions(),
      streams: StreamAndAssetEngine.generateDefaultStreams(),
      assets: StreamAndAssetEngine.generateDefaultAssets(),
      calculations: {},
      validationResults: [],
    };

    // Run calculations and validations to populate initial state
    project.calculations = CalculationEngine.runAllCalculations(project);
    project.validationResults = ValidationEngine.runValidations(project);

    return project;
  }

  /**
   * Saves project state to browser LocalStorage.
   */
  public static saveToLocalStorage(project: ProjectState): void {
    try {
      const json = JSON.stringify(project);
      localStorage.setItem(STORAGE_KEY, json);
    } catch (err) {
      console.error('Failed to save STP project state to localStorage:', err);
    }
  }

  /**
   * Loads project state from LocalStorage or creates a fresh state if missing.
   */
  public static loadFromLocalStorage(): ProjectState {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (json) {
        const loaded = JSON.parse(json) as ProjectState;
        // Re-run calculations and validations to guarantee freshness
        loaded.calculations = CalculationEngine.runAllCalculations(loaded);
        loaded.validationResults = ValidationEngine.runValidations(loaded);
        return loaded;
      }
    } catch (err) {
      console.warn('Failed to parse saved project state from localStorage. Creating new baseline project.', err);
    }
    return this.createNewProject();
  }

  /**
   * Exports project state to downloadable JSON file.
   */
  public static exportProjectToFile(project: ProjectState): void {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EVLab_STP_${project.identity.id}_${project.identity.revision}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
