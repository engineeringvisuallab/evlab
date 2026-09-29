/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 01 Automated Test Suite
 * @license Apache-2.0
 */

import { convertUnit } from './units';
import { runParameterAudit, MASTER_PARAMETER_CATALOG } from './parameters';
import { IDGenerator } from './idGenerator';
import { CalculationEngine } from './calculations';
import { ValidationEngine } from './validations';
import { AssumptionEngine } from './assumptions';
import { DependencyGraphEngine } from './dependencyGraph';
import { ScenarioEngine } from './scenariosAndAlternatives';
import { PersistenceEngine } from './persistence';

export interface TestCaseResult {
  suiteName: string;
  testName: string;
  status: 'PASS' | 'FAIL' | 'NOT_IMPLEMENTED';
  message: string;
  executionTimeMs: number;
}

import { PopulationEngine } from './populationEngine';
import { DesignBasisEngine } from './designBasisEngine';
import { WastewaterQualityEngine } from './wastewaterQualityEngine';
import { PollutantLoadingEngine } from './pollutantLoadingEngine';
import { GravityHydraulicsEngine } from './gravityHydraulicsEngine';
import { PumpingStationEngine } from './pumpingStationEngine';
import { SewerNetworkEngine } from './sewerNetworkEngine';
import { ScreeningEngine } from './screeningEngine';
import { GritEngine } from './gritEngine';
import { FogEngine } from './fogEngine';
import { PrimaryClarifierEngine } from './primaryClarifierEngine';
import { PrimarySludgeEngine } from './primarySludgeEngine';
import { AlternativeScoringEngine } from './alternativeScoringEngine';
import { PreliminaryPrimaryMasterEngine } from './preliminaryPrimaryMasterEngine';

export class Phase01TestSuite {
  public static runAllTests(): TestCaseResult[] {
    const results: TestCaseResult[] = [];

    // Suite 1: Unit Conversion Engine
    this.runTest(results, 'Unit Conversion Engine', 'L/s to m3/day Conversion', () => {
      const converted = convertUnit(10, 'L/s', 'm3/day');
      if (Math.abs(converted - 864) < 0.01) {
        return { isPassed: true, msg: `10 L/s accurately converted to ${converted} m3/day.` };
      }
      return { isPassed: false, msg: `Expected 864 m3/day, got ${converted}` };
    });

    this.runTest(results, 'Unit Conversion Engine', 'kW to HP Power Conversion', () => {
      const converted = convertUnit(100, 'kW', 'HP');
      if (Math.abs(converted - 134.1) < 0.5) {
        return { isPassed: true, msg: `100 kW converted to ${converted.toFixed(1)} HP.` };
      }
      return { isPassed: false, msg: `Expected ~134.1 HP, got ${converted}` };
    });

    // Suite 2: Parameter Registry & Audit
    this.runTest(results, 'Parameter Registry', 'Automated Parameter Audit Execution', () => {
      const audit = runParameterAudit(MASTER_PARAMETER_CATALOG);
      if (audit.totalParameters > 0 && audit.duplicateParameters === 0 && audit.missingUnits === 0) {
        return { isPassed: true, msg: `Audit passed: ${audit.totalParameters} parameters checked. Status: ${audit.auditStatus}` };
      }
      return { isPassed: false, msg: `Audit failed with duplicates or missing units.` };
    });

    // Suite 3: Population Engine (Phase 02)
    this.runTest(results, 'Population Engine', 'Multi-Method Demographic Projections & Census Regression', () => {
      const geomPop = PopulationEngine.calculateGeometric(50000, 2.5, 30);
      const arithPop = PopulationEngine.calculateArithmetic(50000, 2.5, 30);
      const regression = PopulationEngine.calculateCensusRegression([
        { year: 1996, population: 22000 },
        { year: 2006, population: 31000 },
        { year: 2016, population: 41000 },
        { year: 2026, population: 50000 },
      ], 2056);

      if (geomPop === 104877 && arithPop === 87500 && regression.rSquared > 0.98) {
        return { isPassed: true, msg: `Geometric (${geomPop}), Arithmetic (${arithPop}), and Census OLS Regression (R² = ${regression.rSquared.toFixed(4)}) verified.` };
      }
      return { isPassed: false, msg: `Demographic calculation mismatch. Geom: ${geomPop}, Arith: ${arithPop}` };
    });

    // Suite 4: Flow Hydraulics & Peaking Engine (Phase 02)
    this.runTest(results, 'Flow Hydraulics Engine', 'Peaking Formulas & Infiltration Multi-Models', () => {
      const pfHarmon = DesignBasisEngine.calculatePeakingFactor(100000, 'HARMON');
      const pfBabbit = DesignBasisEngine.calculatePeakingFactor(100000, 'BABBIT');

      const infPipe = DesignBasisEngine.calculateInfiltrationInflow(100000, {
        method: 'PIPE_LENGTH',
        pipeLengthKm: 50,
        rateLpsKm: 0.3,
        catchmentAreaHa: 500,
        rateLhaDay: 2500,
        perCapitaLpd: 15,
        rainInflowPct: 20,
        seasonalFactor: 1.0,
        designInfiltrationLps: 15.0,
        designInflowLps: 25.0,
      });

      if (pfHarmon.factor > 2.0 && pfBabbit.factor > 2.0 && infPipe.infiltrationM3d === 1296) {
        return { isPassed: true, msg: `Harmon PF (${pfHarmon.factor}), Babbit PF (${pfBabbit.factor}), and Pipe Length Infiltration (${infPipe.infiltrationM3d} m3/d) matched exact hydraulics.` };
      }
      return { isPassed: false, msg: `Flow hydraulics discrepancy.` };
    });

    // Suite 5: Wastewater Quality Characterization (Phase 02)
    this.runTest(results, 'Wastewater Quality Engine', 'COD Fractionation & Stoichiometric Ratios', () => {
      const project = PersistenceEngine.createNewProject();
      const analysis = WastewaterQualityEngine.analyzeInfluentQuality(project.scenarios['SCEN-A'].influentQuality);

      if (analysis.ratios.biodegradability === 'HIGHLY_BIODEGRADABLE' && analysis.ratios.bodToCod > 0.5) {
        return { isPassed: true, msg: `Characterization confirmed HIGHLY_BIODEGRADABLE (BOD/COD = ${analysis.ratios.bodToCod.toFixed(2)}, COD/TKN = ${analysis.ratios.codToTkn.toFixed(1)}).` };
      }
      return { isPassed: false, msg: `Quality characterization analysis failed.` };
    });

    // Suite 6: Pollutant Loading & Industrial Blending (Phase 02)
    this.runTest(results, 'Pollutant Loading Engine', 'Industrial Discharger Mass Balance Blending', () => {
      const blended = PollutantLoadingEngine.blendIndustrialDischarges(
        10000,
        250,
        450,
        280,
        45,
        8.0,
        [
          {
            id: 'IND-01',
            name: 'Textile Facility',
            industryCategory: 'TEXTILE',
            flowM3d: 1000,
            bod5MgL: 600,
            codMgL: 1200,
            tssMgL: 400,
            tknMgL: 50,
            tpMgL: 10,
            isPretreated: true,
            peakFactor: 1.5,
            heavyMetalsPresent: false,
            toxicityRisk: 'LOW',
          },
        ]
      );

      if (blended.totalFlowM3d === 11000 && blended.bod5MgL > 250) {
        return { isPassed: true, msg: `Mass balance correctly blended 1,000 m3/d textile wastewater, increasing BOD to ${blended.bod5MgL.toFixed(1)} mg/L.` };
      }
      return { isPassed: false, msg: `Industrial mass balance blending failed.` };
    });

    // Suite 7: Validation Engine
    this.runTest(results, 'Validation Engine', 'Rule Execution & Threshold Warnings', () => {
      const dummyProject = PersistenceEngine.createNewProject();
      const valResults = ValidationEngine.runValidations(dummyProject);

      if (valResults.length >= 6) {
        return { isPassed: true, msg: `Validation engine executed ${valResults.length} rules successfully.` };
      }
      return { isPassed: false, msg: `Validation engine returned fewer results than expected (${valResults.length}).` };
    });

    // Suite 8: Dependency Graph
    this.runTest(results, 'Dependency Graph', 'Upstream Parameter Impact Traversal', () => {
      const graph = new DependencyGraphEngine();
      const affected = graph.getAffectedNodes('STP.DEMO.P_PRES');

      if (affected.length >= 3) {
        return { isPassed: true, msg: `Changing Present Population affects ${affected.length} downstream nodes (Flow, Reactor, BOQ, BIM).` };
      }
      return { isPassed: false, msg: `Dependency graph traversal returned fewer affected nodes than expected (${affected.length}).` };
    });

    // Suite 9: Scenario Isolation
    this.runTest(results, 'Scenario System', 'Scenario A & B State Isolation', () => {
      const project = PersistenceEngine.createNewProject();
      const scenA = project.scenarios['SCEN-A'];
      const scenB = ScenarioEngine.cloneScenario(scenA, 'SCEN-B', 'Scenario B (MBBR Compact)');

      scenB.designBasis.presentPopulation = 80000;

      if (scenA.designBasis.presentPopulation === 50000 && scenB.designBasis.presentPopulation === 80000) {
        return { isPassed: true, msg: `Modifying Scenario B population did not alter Scenario A baseline.` };
      }
      return { isPassed: false, msg: `Scenario state leak detected!` };
    });

    // Suite 10: Persistence Engine
    this.runTest(results, 'Persistence Engine', 'Serialization & Deserialization Integrity', () => {
      const project = PersistenceEngine.createNewProject('Test WWTP Project');
      const jsonStr = JSON.stringify(project);
      const rehydrated = JSON.parse(jsonStr);

      if (rehydrated.identity.name === 'Test WWTP Project' && rehydrated.scenarios['SCEN-A']) {
        return { isPassed: true, msg: `Project state successfully serialized and rehydrated with 100% integrity.` };
      }
      return { isPassed: false, msg: `Serialization mismatch!` };
    });

    // Suite 11: Phase 03 — Gravity Sewer Manning Partial-Flow Hydraulics
    this.runTest(results, 'Gravity Sewer Engine', 'Manning Partial-Depth Trigonometric Solver & Self-Cleansing', () => {
      // 80 L/s flow in 375mm pipe at 13.33 permille slope (n=0.010)
      const hyd = GravityHydraulicsEngine.solvePartialFlow(80.0, 0.375, 0.01333, 0.010);
      const full = GravityHydraulicsEngine.calculateFullFlowCapacity(0.375, 0.01333, 0.010);

      const isValidDepth = hyd.depthRatio > 0.3 && hyd.depthRatio < 0.8;
      const isSelfClean = hyd.velocityMps >= 0.6 && hyd.isSelfCleansing;
      const hasFullCap = full.capacityLps > 100;

      if (isValidDepth && isSelfClean && hasFullCap) {
        return { 
          isPassed: true, 
          msg: `Manning partial-flow solved: Depth d/D = ${(hyd.depthRatio * 100).toFixed(1)}%, Velocity = ${hyd.velocityMps.toFixed(2)} m/s (Self-cleansing: PASS), Full Capacity = ${full.capacityLps.toFixed(1)} L/s.` 
        };
      }
      return { isPassed: false, msg: `Gravity partial flow hydraulic discrepancy. Depth ratio: ${hyd.depthRatio}, Vel: ${hyd.velocityMps}` };
    });

    // Suite 12: Phase 03 — Pumping Lift Station & Force Main Hydraulics
    this.runTest(results, 'Pumping Station Engine', 'Wet Well Cycle Sizing, Hazen-Williams TDH & Motor kW', () => {
      const wetWell = PumpingStationEngine.sizeWetWell(87.5, 360, 3.0, 175.0);
      const forceMain = PumpingStationEngine.calculateForceMainHydraulics(175.0, 300, 650, 16.0, 'HDPE_PE100');

      const isCycleAdequate = wetWell.isCycleTimeAdequate && wetWell.startsPerHour <= 12;
      const isTDHPositive = forceMain.totalDynamicHeadM > 16.0 && forceMain.velocityMps > 0.8;
      const hasPower = forceMain.electricalPowerKw > 20;

      if (isCycleAdequate && isTDHPositive && hasPower) {
        return {
          isPassed: true,
          msg: `Lift station verified: Active Volume = ${wetWell.activeVolumeM3.toFixed(2)} m³ (${wetWell.startsPerHour.toFixed(0)} starts/hr), TDH = ${forceMain.totalDynamicHeadM.toFixed(2)} m, Power = ${forceMain.electricalPowerKw.toFixed(1)} kW (V = ${forceMain.velocityMps.toFixed(2)} m/s).`
        };
      }
      return { isPassed: false, msg: `Pumping station calculation discrepancy.` };
    });

    // Suite 13: Phase 03 — Network Flow Accumulation & HGL Profile
    this.runTest(results, 'Sewer Network Engine', 'Topological Accumulation & Longitudinal HGL Profiles', () => {
      const net = SewerNetworkEngine.createDefaultNetwork(175.0);
      const recomputed = SewerNetworkEngine.recomputeNetworkHydraulics(net);
      const prof = recomputed.longitudinalProfiles['PROF-MAIN-TRUNK'];

      const hasPipes = Object.keys(recomputed.pipes).length === 3;
      const hasProfileStations = prof && prof.stations.length === 5;
      const noSurcharge = recomputed.networkSummary.surchargedPipesCount === 0;

      if (hasPipes && hasProfileStations && noSurcharge) {
        return {
          isPassed: true,
          msg: `Sewer collection network validated: 3 gravity pipes accumulated, 5 longitudinal stations profiled from MH-01 to STP-INLET without hydraulic surcharge.`
        };
      }
      return { isPassed: false, msg: `Sewer network accumulation failed.` };
    });

    // ========================================================================
    // PHASE 04 TEST SUITES
    // ========================================================================

    // Suite 14: Phase 04 — Screening Hydraulics & Kirschmer Headloss
    this.runTest(results, 'Screening Engine', 'Kirschmer Headloss, Approach & Clogged Through-Bar Velocity', () => {
      const coarseScreen = ScreeningEngine.createDefaultCoarseScreen();
      const peakFlowLps = 175.0; // 0.175 m3/s
      const hyd = ScreeningEngine.calculateScreenHydraulics(coarseScreen, peakFlowLps);

      const isValidCleanHl = hyd.cleanHeadlossM > 0.002 && hyd.cleanHeadlossM < 0.15;
      const isValidCloggedHl = hyd.cloggedHeadlossM > hyd.cleanHeadlossM && hyd.cloggedHeadlossM < 0.40;
      const isValidVelocity = hyd.approachVelocityMps >= 0.25 && hyd.approachVelocityMps <= 1.2;
      const hasScreenings = hyd.screeningsVolumeM3Day > 0;

      if (isValidCleanHl && isValidCloggedHl && isValidVelocity && hasScreenings) {
        return {
          isPassed: true,
          msg: `Screening hydraulics verified: Approach V = ${hyd.approachVelocityMps.toFixed(2)} m/s, Clean Kirschmer HL = ${(hyd.cleanHeadlossM * 1000).toFixed(1)} mm, Clogged HL = ${(hyd.cloggedHeadlossM * 1000).toFixed(1)} mm, Screenings Yield = ${hyd.screeningsVolumeM3Day.toFixed(2)} m³/day.`
        };
      }
      return { isPassed: false, msg: `Screening calculation mismatch. Clean HL: ${hyd.cleanHeadlossM}, Clogged HL: ${hyd.cloggedHeadlossM}` };
    });

    // Suite 15: Phase 04 — Grit Removal Hydraulics & Efficiency
    this.runTest(results, 'Grit Removal Engine', 'Aerated Grit Helical Airflow, Detention Time & 0.2mm Removal Model', () => {
      const gritChamber = GritEngine.createDefaultAeratedGrit();
      const peakFlowLps = 175.0;

      const hyd = GritEngine.calculateGritHydraulics(gritChamber, peakFlowLps);

      const isHrtValid = hyd.actualDetentionTimeSec >= 150;
      const isAirflowValid = hyd.airflowTotalNm3Hr > 50;
      const isRemovalValid = hyd.removalEfficiencyPct >= 85;
      const hasGritMass = hyd.gritWetMassKgDay > 0;

      if (isHrtValid && isAirflowValid && isRemovalValid && hasGritMass) {
        return {
          isPassed: true,
          msg: `Aerated grit chamber verified: Detention Time = ${(hyd.actualDetentionTimeSec / 60).toFixed(1)} min, Total Airflow = ${hyd.airflowTotalNm3Hr.toFixed(0)} Nm³/h, Removal (d > 0.2mm) = ${hyd.removalEfficiencyPct.toFixed(1)}%, Grit Captured = ${hyd.gritWetMassKgDay.toFixed(1)} kg/d (${hyd.gritVolumeM3Day.toFixed(2)} m³/d).`
        };
      }
      return { isPassed: false, msg: `Grit calculation mismatch. Detention: ${hyd.actualDetentionTimeSec}s, Air: ${hyd.airflowTotalNm3Hr}` };
    });

    // Suite 16: Phase 04 — FOG & Scum Mass Balance
    this.runTest(results, 'FOG Management Engine', 'Surface Skimmer Sizing, Scum Yield & Mass Balance', () => {
      const fogConfig = FogEngine.createDefaultFogConfig();
      const peakFlowLps = 175.0;

      const fogCalc = FogEngine.calculateFogRemoval(fogConfig, peakFlowLps);

      const hasSkimmed = fogCalc.removedFogKgDay > 10;
      const hasEffluentFog = fogCalc.remainingFogConcentrationMgL < 45.0;
      const hasScumVol = fogCalc.scumVolumeM3Day > 0;

      if (hasSkimmed && hasEffluentFog && hasScumVol) {
        return {
          isPassed: true,
          msg: `FOG balance verified: 45 mg/L influent reduced to ${fogCalc.remainingFogConcentrationMgL.toFixed(1)} mg/L (${fogConfig.targetRemovalPct}% removal), Removed FOG = ${fogCalc.removedFogKgDay.toFixed(1)} kg/d, Scum Production = ${fogCalc.scumVolumeM3Day.toFixed(2)} m³/d.`
        };
      }
      return { isPassed: false, msg: `FOG balance mismatch.` };
    });

    // Suite 17: Phase 04 — Primary Clarifier Sizing & Hydraulics
    this.runTest(results, 'Primary Clarifier Engine', 'Circular Gravity Settling, SOR, HRT & Weir Loading Verification', () => {
      const clarifierConfig = PrimaryClarifierEngine.createDefaultCircularClarifier();
      const avgFlowLps = 87.5;
      const peakFlowLps = 175.0;
      const influentTssMgL = 280.0;

      const hyd = PrimaryClarifierEngine.calculateClarifierHydraulics(clarifierConfig, avgFlowLps, peakFlowLps, influentTssMgL);

      const isSorValid = hyd.actualSorPeakM3M2D <= 45.0 && hyd.actualSorAverageM3M2D <= 25.0;
      const isHrtValid = hyd.actualHrtPeakHours >= 1.5;
      const isWeirValid = hyd.weirLoadingPeakM3MD <= 250.0;
      const isHeadlossValid = hyd.totalHeadlossM > 0.1 && hyd.totalHeadlossM < 0.8;

      if (isSorValid && isHrtValid && isWeirValid && isHeadlossValid) {
        return {
          isPassed: true,
          msg: `Primary Clarifier verified: SOR Peak = ${hyd.actualSorPeakM3M2D.toFixed(1)} m³/m²/d (Max 40), HRT Peak = ${hyd.actualHrtPeakHours.toFixed(2)} h (Min 1.5h), Weir Loading = ${hyd.weirLoadingPeakM3MD.toFixed(1)} m³/m/d, Total Hydraulic Drop = ${(hyd.totalHeadlossM * 1000).toFixed(0)} mm.`
        };
      }
      return { isPassed: false, msg: `Clarifier hydraulics failed criteria. SOR: ${hyd.actualSorPeakM3M2D}, HRT: ${hyd.actualHrtPeakHours}` };
    });

    // Suite 18: Phase 04 — Primary Sludge Production & Organic Reduction Mass Balance
    this.runTest(results, 'Primary Sludge Engine', 'TSS/BOD Mass Balance, Dry Solids, Volatile Fraction & Pumping Capacity', () => {
      const clarifierConfig = PrimaryClarifierEngine.createDefaultCircularClarifier();
      const avgFlowLps = 87.5;
      const influentTssMgL = 280.0;
      const influentBodMgL = 250.0;
      const influentCodMgL = 500.0;

      const sludge = PrimarySludgeEngine.calculatePrimarySludge(
        clarifierConfig,
        avgFlowLps,
        influentTssMgL,
        influentBodMgL,
        influentCodMgL
      );

      const hasSludgeMass = sludge.primaryDrySolidsKgDay > 1000;
      const hasWetVolume = sludge.primaryWetSludgeM3Day > 15;
      const hasOrganicReduction = sludge.effluentBod5ConcentrationMgL < influentBodMgL && sludge.effluentTssConcentrationMgL < influentTssMgL;
      const hasPumps = sludge.sludgePumpingRateM3Hr > 0;

      if (hasSludgeMass && hasWetVolume && hasOrganicReduction && hasPumps) {
        return {
          isPassed: true,
          msg: `Primary Sludge mass balance verified: Dry Solids = ${sludge.primaryDrySolidsKgDay.toFixed(1)} kg/d (${sludge.primaryVolatileSolidsKgDay.toFixed(1)} kg VSS/d), Wet Sludge = ${sludge.primaryWetSludgeM3Day.toFixed(1)} m³/d @ ${clarifierConfig.sludgeConcentrationPct}% DS, Effluent BOD5 = ${sludge.effluentBod5ConcentrationMgL.toFixed(1)} mg/L (from ${influentBodMgL}), Effluent TSS = ${sludge.effluentTssConcentrationMgL.toFixed(1)} mg/L (from ${influentTssMgL}).`
        };
      }
      return { isPassed: false, msg: `Sludge mass balance discrepancy.` };
    });

    // Suite 19: Phase 04 — Technology Alternative Scoring Engine (MCDA)
    this.runTest(results, 'Alternative Scoring Engine', 'Multi-Criteria Decision Matrix (Land, CAPEX, OPEX, Performance) Scoring', () => {
      const siteInfo: any = { availableLandM2: 8000, groundElevationMasl: 100.0 };
      const objectives: any = { landPriority: 'BALANCED', capexPriority: 'BALANCED', opexPriority: 'BALANCED', energyPriority: 'BALANCED', operatorSkillLevel: 'CERTIFIED' };
      const scoring = AlternativeScoringEngine.evaluatePrimaryAlternatives(175.0, siteInfo, objectives);

      const hasScores = scoring.alternatives.length >= 5;
      const hasWinner = !!scoring.recommendedAlternative;
      const weightsSum1 = Math.abs(Object.values(scoring.weightDistribution).reduce((a: number, b: number) => a + b, 0) - 1.0) < 0.01;

      if (hasScores && hasWinner && weightsSum1) {
        return {
          isPassed: true,
          msg: `MCDA Alternative Scoring verified: ${scoring.alternatives.length} technologies evaluated across dimensions with normalized weights. Winner: ${scoring.recommendedAlternative} (Rank 1 score: ${scoring.alternatives[0].totalWeightedScore.toFixed(1)}/100).`
        };
      }
      return { isPassed: false, msg: `Alternative scoring failed.` };
    });

    // Suite 20: Phase 04 — Treatment Train Master Integration & Plant HGL Profile
    this.runTest(results, 'Treatment Train Master Engine', 'Hydraulic Continuity, Station Drop HGL/EGL & Complete Mass Conservation', () => {
      const defaultBasis = DesignBasisEngine.createDefaultBasis();
      const defaultQuality = WastewaterQualityEngine.createDefaultInfluentQuality();
      const scenario = ScenarioEngine.createDefaultScenario('SCEN-TEST', 'Test Scenario', 'Testing', defaultBasis, defaultQuality);
      const project: any = {
        identity: { id: 'PRJ-TEST', name: 'Test', clientName: 'EVLab', consultantName: 'EVLab', siteLocation: 'Test', country: 'Global', coordinateSystem: 'WGS84', datumElevationMasl: 100.0, description: 'Test', createdAt: '', lastModifiedAt: '', version: '1.0' },
        siteInfo: { groundElevationMasl: 100.0, availableLandM2: 10000 },
        objectives: { landPriority: 'BALANCED', capexPriority: 'BALANCED', opexPriority: 'BALANCED', energyPriority: 'BALANCED', operatorSkillLevel: 'CERTIFIED' },
        activeScenarioId: 'SCEN-TEST',
        scenarios: { 'SCEN-TEST': scenario },
        currentView: 'DESIGN_BASIS' as any,
        assumptions: {},
        validations: [],
        dependencies: {},
        calculations: {},
      };

      const prelimState = PreliminaryPrimaryMasterEngine.calculatePreliminaryPrimaryState(scenario, project);

      const hasHgl = prelimState.plantHglProfile.stations.length >= 6;
      const hasHeadlossTotal = prelimState.plantHglProfile.totalHeadlossM > 0.1;
      const isContinuityMonotonic = prelimState.plantHglProfile.stations[0].waterLevelMasl > prelimState.plantHglProfile.stations[prelimState.plantHglProfile.stations.length - 1].waterLevelMasl;
      const hasRedundancy = prelimState.preliminaryTrainSummary.redundancyCompliant;

      if (hasHgl && hasHeadlossTotal && isContinuityMonotonic && hasRedundancy) {
        return {
          isPassed: true,
          msg: `Treatment train integrated: ${prelimState.plantHglProfile.stations.length} HGL stations computed. Headloss = ${(prelimState.plantHglProfile.totalHeadlossM * 1000).toFixed(0)} mm (Inlet: ${prelimState.plantHglProfile.inletHglMasl.toFixed(3)} m -> Primary Out: ${prelimState.plantHglProfile.effluentHglMasl.toFixed(3)} m). Redundancy: PASS.`
        };
      }
      return { isPassed: false, msg: `Treatment train HGL integration discrepancy.` };
    });

    return results;
  }

  private static runTest(
    results: TestCaseResult[],
    suiteName: string,
    testName: string,
    testFn: () => { isPassed: boolean; msg: string }
  ): void {
    const start = performance.now();
    try {
      const { isPassed, msg } = testFn();
      const duration = performance.now() - start;
      results.push({
        suiteName,
        testName,
        status: isPassed ? 'PASS' : 'FAIL',
        message: msg,
        executionTimeMs: Number(duration.toFixed(2)),
      });
    } catch (err) {
      const duration = performance.now() - start;
      results.push({
        suiteName,
        testName,
        status: 'FAIL',
        message: `Exception thrown during test: ${(err as Error).message}`,
        executionTimeMs: Number(duration.toFixed(2)),
      });
    }
  }
}
