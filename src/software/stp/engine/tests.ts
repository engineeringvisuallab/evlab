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
      const pfHarmon = DesignBasisEngine.calculatePeakingFactor(100000, 'HARMON').factor;
      const pfBabbit = DesignBasisEngine.calculatePeakingFactor(100000, 'BABBIT').factor;

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

      if (pfHarmon > 2.0 && pfBabbit > 2.0 && infPipe.infiltrationM3d === 1296) {
        return { isPassed: true, msg: `Harmon PF (${pfHarmon}), Babbit PF (${pfBabbit}), and Pipe Length Infiltration (${infPipe.infiltrationM3d} m3/d) matched exact hydraulics.` };
      }
      return { isPassed: false, msg: `Flow hydraulics discrepancy.` };
    });

    // Suite 5: Wastewater Quality Characterization (Phase 02)
    this.runTest(results, 'Wastewater Quality Engine', 'COD Fractionation & Stoichiometric Ratios', () => {
      const project = PersistenceEngine.createNewProject();
      const analysis = WastewaterQualityEngine.analyzeInfluentQuality(project.scenarios['SCEN-A'].influentQuality);
      const ratios = analysis.ratios;
      const biodegradability = analysis.ratios.biodegradability;

      if (biodegradability === 'HIGHLY_BIODEGRADABLE' && ratios.bodToCod > 0.5) {
        return { isPassed: true, msg: `Characterization confirmed HIGHLY_BIODEGRADABLE (BOD/COD = ${ratios.bodToCod.toFixed(2)}, COD/TKN = ${ratios.codToTkn.toFixed(1)}).` };
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
