/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Deterministic Calculation Engine Foundation
 * @license Apache-2.0
 */

import { CalculationResult, ProjectState } from '../types/stp';
import { IDGenerator } from './idGenerator';
import { PopulationEngine } from './populationEngine';
import { DesignBasisEngine } from './designBasisEngine';
import { WastewaterQualityEngine } from './wastewaterQualityEngine';
import { PollutantLoadingEngine } from './pollutantLoadingEngine';
import { SewerNetworkEngine } from './sewerNetworkEngine';
import { PreliminaryPrimaryMasterEngine } from './preliminaryPrimaryMasterEngine';
import { ScreeningEngine } from './screeningEngine';
import { PrimaryClarifierEngine } from './primaryClarifierEngine';

export class CalculationEngine {
  /**
   * Calculates Design Population using selected method.
   */
  public static calculatePopulation(
    presentPop: number,
    growthRatePct: number,
    horizonYears: number
  ): CalculationResult {
    const designPop = PopulationEngine.calculateGeometric(presentPop, growthRatePct, horizonYears);
    const r = growthRatePct / 100;

    return {
      id: IDGenerator.calculationID('DEMO'),
      name: 'Design Population Projection',
      subsystem: 'Design Basis',
      value: designPop,
      unit: 'capita',
      formulaDisplay: 'P_des = P_pres * (1 + r_g)^N_des',
      inputParameters: {
        'P_pres': presentPop,
        'r_g (%)': growthRatePct,
        'N_des (years)': horizonYears,
      },
      subSteps: [
        { stepName: 'Growth Rate Ratio', formula: 'r = growthRatePct / 100', value: r, unit: 'fraction' },
        { stepName: 'Compounding Factor', formula: '(1 + r)^N', value: Math.pow(1 + r, horizonYears), unit: 'ratio' },
      ],
      dependencyIds: ['STP.DEMO.P_PRES', 'STP.DEMO.GR_PCT', 'STP.DEMO.HORIZON'],
      standardReference: 'CPHEEO Sanitary Manual Section 2.3 / Metcalf & Eddy Eq. 2-1',
      assumptions: ['Uniform geometric urban growth rate assumed constant over design horizon.'],
      warnings: designPop > 500000 ? ['Large population (> 500,000) recommends multi-phase modular construction.'] : [],
      reviewStatus: 'VERIFIED',
      usedByModules: ['BOQ', 'REPORT', 'BIM', 'HGL'],
    };
  }

  /**
   * Calculates Average & Peak Wastewater Flows using DesignBasisEngine.
   */
  public static calculateWastewaterFlows(
    designPop: number,
    perCapitaDemandLpd: number,
    returnFactor: number,
    commercialM3d: number,
    industrialM3d: number,
    infiltrationLps: number
  ): {
    adwf: CalculationResult;
    peakFactor: CalculationResult;
    pwwf: CalculationResult;
  } {
    const flows = DesignBasisEngine.calculateCompleteFlows(designPop, {
      presentYear: 2026,
      presentPopulation: Math.round(designPop / 2),
      selectedPopMethod: 'GEOMETRIC',
      censusHistory: [],
      growthRatePct: 2.5,
      designHorizonYears: 30,
      intermediateHorizonYears: 15,
      designPopulation: designPop,
      intermediatePopulation: Math.round(designPop * 0.75),
      immediatePopulation: Math.round(designPop / 2),
      servedPopulationPct: 100,
      sewerageCoveragePct: 100,
      perCapitaWaterDemandLpd: perCapitaDemandLpd,
      domesticDemandM3d: (designPop * perCapitaDemandLpd) / 1000,
      commercialDemandM3d: commercialM3d,
      institutionalDemandM3d: 0,
      industrialDemandM3d: industrialM3d,
      nrwPct: 15,
      sewerageReturnFactor: returnFactor,
      domesticReturnFactor: returnFactor,
      commercialReturnFactor: returnFactor,
      industrialReturnFactor: returnFactor,
      infiltrationConfig: {
        method: 'FIXED',
        pipeLengthKm: 50,
        rateLpsKm: 0.3,
        catchmentAreaHa: 500,
        rateLhaDay: 2500,
        perCapitaLpd: 15,
        rainInflowPct: 20,
        seasonalFactor: 1.0,
        designInfiltrationLps: infiltrationLps,
        designInflowLps: 25.0,
      },
      infiltrationAllowanceLpsKm: infiltrationLps,
      inflowAllowancePct: 20,
      peakingMethod: 'HARMON',
      seasonalPeakFactor: 1.0,
      hourlyPeakFactor: 2.25,
      diurnalProfileType: 'RESIDENTIAL',
      industrialProfiles: [],
      adwfM3d: 0,
      awwfM3d: 0,
      pdwfM3d: 0,
      pwwfM3d: 0,
      minFlowM3d: 0,
      peakFlowLps: 0,
      stages: [],
    });

    const adwfResult: CalculationResult = {
      id: IDGenerator.calculationID('ADWF'),
      name: 'Average Dry Weather Flow (ADWF)',
      subsystem: 'Design Basis',
      value: flows.adwfM3d,
      unit: 'm3/day',
      formulaDisplay: 'ADWF = Q_sanitary + Q_industrial + Q_infiltration',
      inputParameters: {
        'P_des': designPop,
        'q_cap (LPD)': perCapitaDemandLpd,
        'C_ret': returnFactor,
        'Q_comm (m3/d)': commercialM3d,
        'Q_ind (m3/d)': industrialM3d,
      },
      subSteps: [
        { stepName: 'Sanitary Domestic Component', formula: 'P_des * q_cap * C_ret / 1000', value: flows.domesticM3d, unit: 'm3/day' },
        { stepName: 'Infiltration Component', formula: 'Q_inf_Lps * 86.4', value: flows.iiDetails.infiltrationM3d, unit: 'm3/day' },
      ],
      dependencyIds: ['STP.DEMO.P_DES', 'STP.FLOW.PER_CAP_DEMAND', 'STP.FLOW.RETURN_FACTOR'],
      standardReference: 'Metcalf & Eddy Section 3-3 / WEF Manual of Practice 8',
      assumptions: ['Groundwater infiltration accounts for baseline network ingress.'],
      warnings: [],
      reviewStatus: 'VERIFIED',
      usedByModules: ['BOQ', 'REPORT', 'BIM', 'SCADA', 'HGL'],
    };

    const pfResult: CalculationResult = {
      id: IDGenerator.calculationID('PF'),
      name: 'Harmon Peaking Factor',
      subsystem: 'Hydraulics',
      value: flows.peakingFactor,
      unit: 'ratio',
      formulaDisplay: 'PF = 1 + 14 / (4 + sqrt(P_pop / 1000))',
      inputParameters: {
        'P_pop (thousands)': designPop / 1000,
      },
      subSteps: [],
      dependencyIds: ['STP.DEMO.P_DES'],
      standardReference: 'Harmon Equation / ASCE MOP 60',
      assumptions: ['Harmon formula applies to domestic municipal sewerage collections.'],
      warnings: [],
      reviewStatus: 'VERIFIED',
      usedByModules: ['REPORT', 'BIM'],
    };

    const pwwfResult: CalculationResult = {
      id: IDGenerator.calculationID('PWWF'),
      name: 'Peak Wet Weather Flow (PWWF)',
      subsystem: 'Hydraulics',
      value: flows.pwwfM3d,
      unit: 'm3/day',
      formulaDisplay: 'PWWF = (Q_sanitary * PF) + (Q_ind * 1.5) + Q_I/I_total',
      inputParameters: {
        'ADWF (m3/d)': flows.adwfM3d,
        'Peak Factor': flows.peakingFactor,
        'Infiltration (L/s)': flows.iiDetails.totalIIM3d / 86.4,
      },
      subSteps: [
        { stepName: 'Peak Dry Weather Component', formula: 'Sanitary * PF', value: Math.round(flows.sanitaryM3d * flows.peakingFactor), unit: 'm3/day' },
        { stepName: 'Total Inflow & Infiltration', formula: 'Q_I/I', value: flows.iiDetails.totalIIM3d, unit: 'm3/day' },
      ],
      dependencyIds: ['STP.FLOW.ADWF', 'STP.FLOW.PEAK_FACTOR', 'STP.FLOW.INFILTRATION'],
      standardReference: 'Ten State Standards Section 22.1 / WEF MOP 8',
      assumptions: ['Infiltration & storm inflow additive during peak rainfall events.'],
      warnings: flows.pwwfM3d > flows.adwfM3d * 3.5 ? ['High peaking ratio (>3.5x). Ensure inlet overflow bypass weir present.'] : [],
      reviewStatus: 'VERIFIED',
      usedByModules: ['BOQ', 'REPORT', 'BIM', 'CAD', 'HGL'],
    };

    return { adwf: adwfResult, peakFactor: pfResult, pwwf: pwwfResult };
  }

  /**
   * Calculates Organic & Solids Mass Loadings (kg/day).
   */
  public static calculateMassLoadings(
    flowM3d: number,
    bod5MgL: number,
    tssMgL: number,
    tknMgL: number,
    tpMgL: number
  ): Record<string, CalculationResult> {
    const calcMass = (paramName: string, concMgL: number): CalculationResult => {
      const massKgDay = (flowM3d * concMgL) / 1000;
      return {
        id: IDGenerator.calculationID(`MASS_${paramName}`),
        name: `${paramName} Mass Loading Rate`,
        subsystem: 'Wastewater Quality',
        value: Number(massKgDay.toFixed(1)),
        unit: 'kg/day',
        formulaDisplay: 'Mass (kg/d) = Flow (m3/d) * Concentration (mg/L) / 1000',
        inputParameters: {
          'Flow (m3/d)': flowM3d,
          [`${paramName} (mg/L)`]: concMgL,
        },
        subSteps: [],
        dependencyIds: ['STP.FLOW.ADWF', `STP.QUAL.${paramName}`],
        standardReference: 'Metcalf & Eddy Section 3-4',
        assumptions: ['Homogeneous daily composite concentration.'],
        warnings: [],
        reviewStatus: 'VERIFIED',
        usedByModules: ['BOQ', 'REPORT', 'BIM'],
      };
    };

    return {
      bodMass: calcMass('BOD5', bod5MgL),
      tssMass: calcMass('TSS', tssMgL),
      tknMass: calcMass('TKN', tknMgL),
      tpMass: calcMass('TP', tpMgL),
    };
  }

  /**
   * Calculates Gravity Sewer Full Flow Hydraulics using Manning Equation.
   */
  public static calculateManningPipeFullFlow(
    pipeDiameterMm: number,
    slopeMperM: number,
    manningN: number = 0.013
  ): CalculationResult {
    const dMeters = pipeDiameterMm / 1000;
    const areaM2 = (Math.PI * Math.pow(dMeters, 2)) / 4;
    const hydraulicRadiusM = dMeters / 4;

    const velocityMps = (1 / manningN) * Math.pow(hydraulicRadiusM, 2 / 3) * Math.sqrt(slopeMperM);
    const fullFlowM3s = velocityMps * areaM2;
    const fullFlowLps = fullFlowM3s * 1000;

    return {
      id: IDGenerator.calculationID('PIPE_MANNING'),
      name: 'Gravity Pipe Full-Flow Hydraulic Capacity',
      subsystem: 'Sewer Network',
      value: Number(fullFlowLps.toFixed(1)),
      unit: 'L/s',
      formulaDisplay: 'Q_full = (1/n) * A * R^(2/3) * S^(1/2)',
      inputParameters: {
        'Pipe Diameter (mm)': pipeDiameterMm,
        'Slope (m/m)': slopeMperM,
        'Manning n': manningN,
      },
      subSteps: [
        { stepName: 'Cross Sectional Area', formula: 'pi * D^2 / 4', value: Number(areaM2.toFixed(4)), unit: 'm2' },
        { stepName: 'Hydraulic Radius R', formula: 'D / 4', value: Number(hydraulicRadiusM.toFixed(4)), unit: 'm' },
        { stepName: 'Full Flow Velocity', formula: '(1/n) * R^(2/3) * S^(1/2)', value: Number(velocityMps.toFixed(2)), unit: 'm/s' },
      ],
      dependencyIds: [],
      standardReference: 'ASCE Manual of Practice No. 60 / Chow Open Channel Hydraulics',
      assumptions: ['Uniform gravity steady flow in circular pipe.'],
      warnings: velocityMps < 0.6 ? ['Velocity below self-cleansing limit (0.6 m/s). Risk of solids deposition.'] : [],
      reviewStatus: 'VERIFIED',
      usedByModules: ['BOQ', 'REPORT', 'BIM', 'CAD'],
    };
  }

  /**
   * Calculates Kirschmer Screen Headloss & Approach Hydraulics.
   */
  public static calculateScreeningHeadloss(
    barOpeningMm: number,
    barThicknessMm: number,
    angleDeg: number,
    channelWidthM: number,
    waterDepthM: number,
    peakFlowLps: number
  ): CalculationResult {
    const defaultScreen = ScreeningEngine.createDefaultCoarseScreen();
    defaultScreen.barOpeningMm = barOpeningMm;
    defaultScreen.barThicknessMm = barThicknessMm;
    defaultScreen.screenAngleDeg = angleDeg;
    defaultScreen.channelWidthM = channelWidthM;
    defaultScreen.upstreamWaterDepthM = waterDepthM;

    const res = ScreeningEngine.calculateScreenHydraulics(defaultScreen, peakFlowLps);

    return {
      id: IDGenerator.calculationID('PRELIM'),
      name: 'Screening Kirschmer Headloss & Velocities',
      subsystem: 'Preliminary Screening',
      value: Number(res.cleanHeadlossM.toFixed(4)),
      unit: 'm',
      formulaDisplay: 'h_L = beta * (s/b)^(4/3) * (v_a^2 / 2g) * sin(theta)',
      inputParameters: {
        'Bar Clear Opening b (mm)': barOpeningMm,
        'Bar Thickness s (mm)': barThicknessMm,
        'Screen Angle (deg)': angleDeg,
        'Channel Width (m)': channelWidthM,
        'Water Depth (m)': waterDepthM,
        'Peak Flow (L/s)': peakFlowLps,
      },
      subSteps: [
        { stepName: 'Approach Velocity v_a', formula: 'Q / (W * d)', value: Number(res.approachVelocityMps.toFixed(3)), unit: 'm/s' },
        { stepName: 'Open Area Fraction e', formula: 'b / (b + s)', value: Number(res.openAreaFraction.toFixed(3)), unit: 'fraction' },
        { stepName: 'Through-Bar Velocity v_t (Clean)', formula: 'Q / A_open', value: Number(res.velocityThroughBarsCleanMps.toFixed(3)), unit: 'm/s' },
        { stepName: 'Design Clogged Headloss (50%)', formula: 'Orifice Equation (50% blockage)', value: Number(res.cloggedHeadlossM.toFixed(4)), unit: 'm' },
      ],
      dependencyIds: ['STP.PRELIM.SCREEN.BAR_OPENING', 'STP.PRELIM.SCREEN.APPROACH_VEL'],
      standardReference: 'Kirschmer Formula / Metcalf & Eddy Section 5-2',
      assumptions: ['Rectangular bar shape factor beta = 2.42 assumed.'],
      warnings: res.validationMessages,
      reviewStatus: 'VERIFIED',
      usedByModules: ['HGL', 'BOQ', 'REPORT', 'BIM'],
    };
  }

  /**
   * Calculates Primary Clarifier Surface Overflow Rate & Sizing.
   */
  public static calculatePrimaryClarifier(
    diameterM: number,
    swdM: number,
    numTanks: number,
    peakFlowLps: number,
    avgFlowLps: number
  ): CalculationResult {
    const config = PrimaryClarifierEngine.createDefaultCircularClarifier();
    config.tankCount = numTanks;
    config.dutyCount = numTanks;
    if (config.circular) {
      config.circular.diameterM = diameterM;
      config.circular.sideWaterDepthM = swdM;
    }

    const res = PrimaryClarifierEngine.calculateClarifierHydraulics(config, avgFlowLps, peakFlowLps);

    return {
      id: IDGenerator.calculationID('PRIM'),
      name: 'Primary Clarifier Sizing & Surface Overflow Rate',
      subsystem: 'Primary Clarification',
      value: Number(res.actualSorPeakM3M2D.toFixed(1)),
      unit: 'm3/m2/day',
      formulaDisplay: 'SOR_peak = Q_peak / Total_Surface_Area',
      inputParameters: {
        'Tank Diameter (m)': diameterM,
        'Side Water Depth (m)': swdM,
        'Number of Tanks': numTanks,
        'Peak Flow (L/s)': peakFlowLps,
        'Average Flow (L/s)': avgFlowLps,
      },
      subSteps: [
        { stepName: 'Total Surface Area', formula: 'N * (pi * D^2 / 4)', value: Number(res.surfaceAreaTotalM2.toFixed(1)), unit: 'm2' },
        { stepName: 'Peak HRT', formula: 'Volume / (Q_peak / 24)', value: Number(res.actualHrtPeakHours.toFixed(2)), unit: 'h' },
        { stepName: 'Peak Weir Loading', formula: 'Q_peak / Total_Weir_Length', value: Number(res.weirLoadingPeakM3MD.toFixed(1)), unit: 'm3/m/d' },
        { stepName: 'Weir Crest Head Drop', formula: '90-deg V-Notch Formula', value: Number(res.weirDropM.toFixed(3)), unit: 'm' },
      ],
      dependencyIds: ['STP.PRIM.CLAR.SOR_PEAK', 'STP.PRIM.CLAR.HRT_PEAK', 'STP.PRIM.CLAR.WEIR_LOADING'],
      standardReference: 'CPHEEO Manual Section 5.3 / Metcalf & Eddy Table 5-16',
      assumptions: ['Radial flow with peripheral V-notch weir launders.'],
      warnings: res.validationMessages,
      reviewStatus: 'VERIFIED',
      usedByModules: ['HGL', 'BOQ', 'REPORT', 'BIM'],
    };
  }

  /**
   * Executes complete calculation refresh across baseline parameters.
   */
  public static runAllCalculations(project: ProjectState): Record<string, CalculationResult> {
    const scenario = project.scenarios[project.activeScenarioId];
    const results: Record<string, CalculationResult> = {};

    // 1. Population Projection
    const popRes = this.calculatePopulation(
      scenario.designBasis.presentPopulation,
      scenario.designBasis.growthRatePct || 2.5,
      scenario.designBasis.designHorizonYears || 30
    );
    results[popRes.id] = popRes;

    // 2. Flow Hydraulics Calculation
    const flowRes = this.calculateWastewaterFlows(
      popRes.value,
      scenario.designBasis.perCapitaWaterDemandLpd,
      scenario.designBasis.sewerageReturnFactor,
      scenario.designBasis.commercialDemandM3d,
      scenario.designBasis.industrialDemandM3d,
      scenario.designBasis.infiltrationAllowanceLpsKm
    );
    results[flowRes.adwf.id] = flowRes.adwf;
    results[flowRes.peakFactor.id] = flowRes.peakFactor;
    results[flowRes.pwwf.id] = flowRes.pwwf;

    // Update complete flow matrix
    const completeFlows = DesignBasisEngine.calculateCompleteFlows(popRes.value, scenario.designBasis);

    // Sync computed flow values back into design basis object
    scenario.designBasis.designPopulation = popRes.value;
    scenario.designBasis.adwfM3d = completeFlows.adwfM3d;
    scenario.designBasis.pdwfM3d = completeFlows.pdwfM3d;
    scenario.designBasis.awwfM3d = completeFlows.awwfM3d;
    scenario.designBasis.pwwfM3d = completeFlows.pwwfM3d;
    scenario.designBasis.minFlowM3d = completeFlows.minFlowM3d;
    scenario.designBasis.hourlyPeakFactor = completeFlows.peakingFactor;
    scenario.designBasis.peakFlowLps = completeFlows.peakFlowLps;

    // 3. Staged Horizon Flows
    scenario.designBasis.stages = PollutantLoadingEngine.calculateStagedLoads(
      scenario.designBasis,
      scenario.influentQuality
    );

    // 4. Wastewater Quality Analysis & Characterization Ratios
    WastewaterQualityEngine.analyzeInfluentQuality(scenario.influentQuality);

    // 5. Industrial Contribution Blending
    if (scenario.designBasis.industrialProfiles && scenario.designBasis.industrialProfiles.length > 0) {
      const blended = PollutantLoadingEngine.blendIndustrialDischarges(
        completeFlows.sanitaryM3d,
        scenario.influentQuality.bod5.designValue,
        scenario.influentQuality.cod.designValue,
        scenario.influentQuality.tss.designValue,
        scenario.influentQuality.tkn.designValue,
        scenario.influentQuality.tp.designValue,
        scenario.designBasis.industrialProfiles
      );
      scenario.designBasis.industrialDemandM3d = blended.totalFlowM3d - completeFlows.sanitaryM3d;
    }

    // 6. Mass Loadings
    const massRes = this.calculateMassLoadings(
      completeFlows.adwfM3d,
      scenario.influentQuality.bod5.designValue,
      scenario.influentQuality.tss.designValue,
      scenario.influentQuality.tkn.designValue,
      scenario.influentQuality.tp.designValue
    );
    Object.values(massRes).forEach((r) => {
      results[r.id] = r;
    });

    // 7. Sample Pipe Manning Hydraulics
    const pipeRes = this.calculateManningPipeFullFlow(600, 0.003, 0.013);
    results[pipeRes.id] = pipeRes;

    // 8. Phase 03 Sewer Network Recalculation
    if (scenario.sewerNetwork) {
      scenario.sewerNetwork = SewerNetworkEngine.recomputeNetworkHydraulics(scenario.sewerNetwork);
    }

    // 9. Phase 04 Preliminary & Primary Treatment Master Calculation
    scenario.preliminaryPrimary = PreliminaryPrimaryMasterEngine.calculatePreliminaryPrimaryState(
      scenario,
      project,
      scenario.preliminaryPrimary
    );

    const screenRes = this.calculateScreeningHeadloss(
      scenario.preliminaryPrimary.coarseScreen.barOpeningMm,
      scenario.preliminaryPrimary.coarseScreen.barThicknessMm,
      scenario.preliminaryPrimary.coarseScreen.screenAngleDeg,
      scenario.preliminaryPrimary.coarseScreen.channelWidthM,
      scenario.preliminaryPrimary.coarseScreen.upstreamWaterDepthM,
      completeFlows.peakFlowLps
    );
    results[screenRes.id] = screenRes;

    const clarRes = this.calculatePrimaryClarifier(
      scenario.preliminaryPrimary.primaryClarifier.circular?.diameterM || 18.0,
      scenario.preliminaryPrimary.primaryClarifier.circular?.sideWaterDepthM || 3.5,
      scenario.preliminaryPrimary.primaryClarifier.dutyCount || 2,
      completeFlows.peakFlowLps,
      (completeFlows.adwfM3d * 1000) / 86400
    );
    results[clarRes.id] = clarRes;

    return results;
  }
}
