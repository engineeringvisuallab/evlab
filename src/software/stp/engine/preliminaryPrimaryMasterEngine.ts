/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 04: Preliminary & Primary Treatment Master Engine
 * @license Apache-2.0
 */

import {
  PreliminaryPrimaryState,
  ScreenDesignConfig,
  GritDesignConfig,
  FogDesignConfig,
  PrimaryClarifierDesignConfig,
  MassBalanceStreamState,
  StreamQualityNode,
  PlantHglProfileState,
  PlantHglStation,
  RedundancyCheckResult,
} from '../types/preliminaryPrimary';
import { ProjectState, ScenarioState } from '../types/stp';
import { ScreeningEngine } from './screeningEngine';
import { GritEngine } from './gritEngine';
import { FogEngine } from './fogEngine';
import { PrimaryClarifierEngine } from './primaryClarifierEngine';
import { PrimarySludgeEngine } from './primarySludgeEngine';
import { AlternativeScoringEngine } from './alternativeScoringEngine';

export class PreliminaryPrimaryMasterEngine {
  /**
   * Evaluates complete preliminary and primary treatment train, updating
   * screening hydraulics, grit capture, FOG separation, clarifier sizing,
   * mass balance, continuous HGL profile, and redundancy safety checks.
   */
  public static calculatePreliminaryPrimaryState(
    scenario: ScenarioState,
    project: ProjectState,
    existingConfig?: Partial<PreliminaryPrimaryState>
  ): PreliminaryPrimaryState {
    const qAvgM3d = scenario.designBasis.adwfM3d || 11664;
    const qAvgLps = (qAvgM3d * 1000) / 86400;
    const qPeakLps = scenario.designBasis.peakFlowLps || 310.0;
    const qPeakM3d = (qPeakLps / 1000) * 86400;

    const influentQuality = scenario.influentQuality;
    const tssVal = influentQuality.tss?.designValue || 300;
    const bodVal = influentQuality.bod5?.designValue || 250;
    const codVal = influentQuality.cod?.designValue || 500;
    const vssVal = influentQuality.vss?.designValue || 240;
    const tknVal = influentQuality.tkn?.designValue || 45;
    const tnVal = influentQuality.tn?.designValue || 50;
    const tpVal = influentQuality.tp?.designValue || 8;
    const ogVal = influentQuality.oilAndGrease?.designValue || 40;

    const groundMasl = project.siteInfo.groundElevationMasl || 100.0;

    // 1. Screen Configurations & Hydraulics
    const coarseConfig: ScreenDesignConfig =
      existingConfig?.coarseScreen || ScreeningEngine.createDefaultCoarseScreen();
    const coarseHydraulics = ScreeningEngine.calculateScreenHydraulics(
      coarseConfig,
      qPeakLps,
      groundMasl - 1.20 // Channel invert ~1.2m below ground
    );

    const fineConfig: ScreenDesignConfig =
      existingConfig?.fineScreen || ScreeningEngine.createDefaultFineScreen();
    const fineHydraulics = ScreeningEngine.calculateScreenHydraulics(
      fineConfig,
      qPeakLps,
      coarseHydraulics.downstreamHglMasl - 0.60
    );

    // 2. Grit Chamber Configuration & Hydraulics
    const gritConfig: GritDesignConfig =
      existingConfig?.gritChamber || GritEngine.createDefaultAeratedGrit();
    const gritHydraulics = GritEngine.calculateGritHydraulics(
      gritConfig,
      qPeakLps,
      fineHydraulics.downstreamHglMasl
    );

    // 3. FOG / Grease Management
    const fogConfig: FogDesignConfig =
      existingConfig?.fogManagement || FogEngine.createDefaultFogConfig();
    const fogHydraulics = FogEngine.calculateFogRemoval(fogConfig, qPeakLps);

    // 4. Primary Clarifier Alternatives & Sizing
    const primaryConfig: PrimaryClarifierDesignConfig =
      existingConfig?.primaryClarifier || PrimaryClarifierEngine.createDefaultCircularClarifier();
    const primaryHydraulics = PrimaryClarifierEngine.calculateClarifierHydraulics(
      primaryConfig,
      qAvgLps,
      qPeakLps,
      tssVal,
      gritHydraulics.downstreamHglMasl - 0.15 // Distribution channel loss
    );

    // 5. Primary Sludge & Mass Reductions
    const primarySludge = PrimarySludgeEngine.calculatePrimarySludge(
      primaryConfig,
      qAvgLps,
      tssVal,
      bodVal,
      codVal
    );

    // 6. Comprehensive Mass Balance Matrix
    const rawInfluent: StreamQualityNode = {
      nodeId: 'STRM-001',
      nodeName: 'Raw STP Influent',
      flowLps: qAvgLps,
      flowM3d: qAvgM3d,
      bodMgL: bodVal,
      bodKgDay: (qAvgM3d * bodVal) / 1000,
      codMgL: codVal,
      codKgDay: (qAvgM3d * codVal) / 1000,
      tssMgL: tssVal,
      tssKgDay: (qAvgM3d * tssVal) / 1000,
      vssMgL: vssVal,
      vssKgDay: (qAvgM3d * vssVal) / 1000,
      tknMgL: tknVal,
      tknKgDay: (qAvgM3d * tknVal) / 1000,
      tnMgL: tnVal,
      tnKgDay: (qAvgM3d * tnVal) / 1000,
      tpMgL: tpVal,
      tpKgDay: (qAvgM3d * tpVal) / 1000,
      ogMgL: ogVal,
      ogKgDay: (qAvgM3d * ogVal) / 1000,
    };

    // Post Coarse Screen: minimal dissolved change, captures gross solids
    const postCoarseScreen: StreamQualityNode = {
      ...rawInfluent,
      nodeId: 'STRM-002',
      nodeName: 'Post Coarse Screening',
      tssMgL: rawInfluent.tssMgL * 0.98,
      tssKgDay: rawInfluent.tssKgDay * 0.98,
      notes: 'Coarse solids & rags removed',
    };

    // Post Fine Screen: ~5% TSS capture
    const postFineScreen: StreamQualityNode = {
      ...postCoarseScreen,
      nodeId: 'STRM-003',
      nodeName: 'Post Fine Screening',
      tssMgL: rawInfluent.tssMgL * 0.95,
      tssKgDay: rawInfluent.tssKgDay * 0.95,
      notes: 'Fine screenings & plastics removed',
    };

    // Post Grit Removal: ~3% inorganic TSS removed
    const postGritRemoval: StreamQualityNode = {
      ...postFineScreen,
      nodeId: 'STRM-004',
      nodeName: 'Post Grit Removal',
      tssMgL: postFineScreen.tssMgL * 0.97,
      tssKgDay: postFineScreen.tssKgDay * 0.97,
      notes: 'Dense mineral grit >=0.20mm removed',
    };

    // Post FOG Removal: Oil & Grease reduced
    const postFogRemoval: StreamQualityNode = {
      ...postGritRemoval,
      nodeId: 'STRM-005',
      nodeName: 'Post FOG / Scum Skimming',
      ogMgL: fogHydraulics.remainingFogConcentrationMgL,
      ogKgDay: (qAvgM3d * fogHydraulics.remainingFogConcentrationMgL) / 1000,
      notes: 'Floatable fats, oil and grease skimmed',
    };

    // Primary Clarifier Effluent: Major TSS and particulate BOD/COD removal
    const primaryEffluentTssMgL = rawInfluent.tssMgL * (1 - primaryConfig.expectedTssRemovalPct / 100);
    const primaryEffluentBodMgL = rawInfluent.bodMgL * (1 - primaryConfig.expectedBodRemovalPct / 100);
    const primaryEffluentCodMgL = rawInfluent.codMgL * (1 - primaryConfig.expectedCodRemovalPct / 100);
    const primaryEffluentVssMgL = rawInfluent.vssMgL * (1 - primaryConfig.expectedVssRemovalPct / 100);

    const primaryEffluent: StreamQualityNode = {
      nodeId: 'STRM-006',
      nodeName: 'Primary Clarifier Effluent',
      flowLps: qAvgLps - (primarySludge.primaryWetSludgeM3Day / 86.4), // Deduct sludge withdrawal
      flowM3d: qAvgM3d - primarySludge.primaryWetSludgeM3Day,
      bodMgL: primaryEffluentBodMgL,
      bodKgDay: primarySludge.effluentBodKgDay,
      codMgL: primaryEffluentCodMgL,
      codKgDay: primarySludge.effluentCodKgDay,
      tssMgL: primaryEffluentTssMgL,
      tssKgDay: (qAvgM3d * primaryEffluentTssMgL) / 1000,
      vssMgL: primaryEffluentVssMgL,
      vssKgDay: (qAvgM3d * primaryEffluentVssMgL) / 1000,
      tknMgL: rawInfluent.tknMgL * 0.95, // ~5% particulate organic nitrogen settled
      tknKgDay: rawInfluent.tknKgDay * 0.95,
      tnMgL: rawInfluent.tnMgL * 0.95,
      tnKgDay: rawInfluent.tnKgDay * 0.95,
      tpMgL: rawInfluent.tpMgL * 0.90, // ~10% particulate phosphorus settled
      tpKgDay: rawInfluent.tpKgDay * 0.90,
      ogMgL: postFogRemoval.ogMgL * 0.50, // Further grease flotation in clarifier
      ogKgDay: postFogRemoval.ogKgDay * 0.50,
      notes: 'Clarified wastewater ready for secondary biological treatment (Phase 05).',
    };

    // Primary Sludge Waste Stream
    const primarySludgeWaste: StreamQualityNode = {
      nodeId: 'STRM-SLUDGE-01',
      nodeName: 'Primary Underflow Sludge',
      flowLps: primarySludge.primaryWetSludgeM3Day / 86.4,
      flowM3d: primarySludge.primaryWetSludgeM3Day,
      bodMgL: 6000.0,
      bodKgDay: primarySludge.bodRemovedKgDay,
      codMgL: 12000.0,
      codKgDay: primarySludge.codRemovedKgDay,
      tssMgL: primaryConfig.sludgeConcentrationPct * 10000, // e.g. 4% = 40,000 mg/L
      tssKgDay: primarySludge.primaryDrySolidsKgDay,
      vssMgL: primaryConfig.sludgeConcentrationPct * 10000 * 0.75,
      vssKgDay: primarySludge.primaryDrySolidsKgDay * 0.75,
      tknMgL: 800.0,
      tknKgDay: rawInfluent.tknKgDay * 0.05,
      tnMgL: 900.0,
      tnKgDay: rawInfluent.tnKgDay * 0.05,
      tpMgL: 250.0,
      tpKgDay: rawInfluent.tpKgDay * 0.10,
      ogMgL: 500.0,
      ogKgDay: postFogRemoval.ogKgDay * 0.50,
      notes: 'Thickened primary raw sludge to anaerobic digestion / dewatering.',
    };

    // Water Balance Verification
    const screeningsVolumeLoss = coarseHydraulics.screeningsVolumeM3Day + fineHydraulics.screeningsVolumeM3Day;
    const gritVolumeLoss = gritHydraulics.gritVolumeM3Day;
    const scumVolumeLoss = fogHydraulics.scumVolumeM3Day;
    const sludgeVolumeLoss = primarySludge.primaryWetSludgeM3Day;
    const totalOutflow = primaryEffluent.flowM3d + sludgeVolumeLoss + screeningsVolumeLoss + gritVolumeLoss + scumVolumeLoss;
    const closureErrorPct = Math.abs((totalOutflow - qAvgM3d) / qAvgM3d) * 100;

    const massBalance: MassBalanceStreamState = {
      rawInfluent,
      postCoarseScreen,
      postFineScreen,
      postGritRemoval,
      postFogRemoval,
      primaryEffluent,
      primarySludgeWaste,
      screeningsSolidWaste: {
        wetMassKgDay: coarseHydraulics.screeningsWetMassKgDay + fineHydraulics.screeningsWetMassKgDay,
        dryMassKgDay: coarseHydraulics.screeningsDryMassKgDay + fineHydraulics.screeningsDryMassKgDay,
        volumeM3Day: screeningsVolumeLoss,
      },
      gritSolidWaste: {
        wetMassKgDay: gritHydraulics.gritWetMassKgDay,
        dryMassKgDay: gritHydraulics.gritDryMassKgDay,
        volumeM3Day: gritVolumeLoss,
      },
      scumWaste: {
        volumeM3Day: scumVolumeLoss,
        massKgDay: fogHydraulics.removedFogKgDay,
      },
      waterBalanceSummary: {
        inflowM3d: qAvgM3d,
        effluentM3d: primaryEffluent.flowM3d,
        sludgeLossM3d: sludgeVolumeLoss,
        screeningsGritLossM3d: screeningsVolumeLoss + gritVolumeLoss,
        scumLossM3d: scumVolumeLoss,
        closureErrorPct,
        isBalanced: closureErrorPct < 0.5,
      },
    };

    // 7. Multi-Criteria Alternative Evaluation
    const alternativeComparison = AlternativeScoringEngine.evaluatePrimaryAlternatives(
      qPeakLps,
      project.siteInfo,
      project.objectives,
      tssVal,
      ogVal
    );

    // 8. Continuous Plant HGL Profile (Stations from Inlet Channel to Primary Effluent Launder)
    const stations: PlantHglStation[] = [
      {
        stationId: 'ST-01',
        unitName: 'Inlet Receiving Chamber',
        chainageM: 0.0,
        groundElevationMasl: groundMasl,
        invertElevationMasl: groundMasl - 1.20,
        waterDepthM: 0.65,
        waterLevelMasl: coarseHydraulics.upstreamHglMasl,
        hglMasl: coarseHydraulics.upstreamHglMasl,
        eglMasl: coarseHydraulics.upstreamHglMasl + 0.02,
        velocityMps: coarseHydraulics.approachVelocityMps,
        headlossThroughUnitM: 0.0,
        freeboardM: 0.55,
        freeboardRequiredM: 0.30,
        isFreeboardAdequate: true,
        notes: 'Receives flow from force main discharge manhole.',
      },
      {
        stationId: 'ST-02',
        unitName: 'Coarse Screen (Downstream)',
        chainageM: 4.0,
        groundElevationMasl: groundMasl,
        invertElevationMasl: groundMasl - 1.20,
        waterDepthM: 0.65 - coarseHydraulics.normalHeadlossM,
        waterLevelMasl: coarseHydraulics.downstreamHglMasl,
        hglMasl: coarseHydraulics.downstreamHglMasl,
        eglMasl: coarseHydraulics.downstreamHglMasl + 0.02,
        velocityMps: coarseHydraulics.approachVelocityMps,
        headlossThroughUnitM: coarseHydraulics.normalHeadlossM,
        freeboardM: 0.55 + coarseHydraulics.normalHeadlossM,
        freeboardRequiredM: 0.30,
        isFreeboardAdequate: true,
        notes: `Kirschmer clean headloss: ${coarseHydraulics.cleanHeadlossM.toFixed(3)}m; design clogged: ${coarseHydraulics.cloggedHeadlossM.toFixed(3)}m.`,
      },
      {
        stationId: 'ST-03',
        unitName: 'Fine Screen (Downstream)',
        chainageM: 10.0,
        groundElevationMasl: groundMasl,
        invertElevationMasl: groundMasl - 1.30,
        waterDepthM: 0.55,
        waterLevelMasl: fineHydraulics.downstreamHglMasl,
        hglMasl: fineHydraulics.downstreamHglMasl,
        eglMasl: fineHydraulics.downstreamHglMasl + 0.02,
        velocityMps: fineHydraulics.approachVelocityMps,
        headlossThroughUnitM: fineHydraulics.normalHeadlossM,
        freeboardM: 0.75,
        freeboardRequiredM: 0.30,
        isFreeboardAdequate: true,
        notes: `Fine 6mm step screen; clogged headloss: ${fineHydraulics.cloggedHeadlossM.toFixed(3)}m.`,
      },
      {
        stationId: 'ST-04',
        unitName: 'Aerated Grit Chamber',
        chainageM: 25.0,
        groundElevationMasl: groundMasl,
        invertElevationMasl: groundMasl - 3.80,
        waterDepthM: 2.80,
        waterLevelMasl: gritHydraulics.downstreamHglMasl,
        hglMasl: gritHydraulics.downstreamHglMasl,
        eglMasl: gritHydraulics.downstreamHglMasl + 0.01,
        velocityMps: gritHydraulics.actualHorizontalVelocityMps,
        headlossThroughUnitM: gritHydraulics.headlossM,
        freeboardM: 1.00,
        freeboardRequiredM: 0.50,
        isFreeboardAdequate: true,
        notes: `HRT: ${(gritHydraulics.actualDetentionTimeSec / 60).toFixed(1)} min; Diffused air helical flow.`,
      },
      {
        stationId: 'ST-05',
        unitName: 'Primary Clarifier (Inlet Center Well)',
        chainageM: 45.0,
        groundElevationMasl: groundMasl,
        invertElevationMasl: groundMasl - 4.50,
        waterDepthM: primaryHydraulics.waterDepthM,
        waterLevelMasl: primaryHydraulics.upstreamHglMasl,
        hglMasl: primaryHydraulics.upstreamHglMasl,
        eglMasl: primaryHydraulics.upstreamHglMasl + 0.005,
        velocityMps: 0.05,
        headlossThroughUnitM: 0.15,
        freeboardM: primaryHydraulics.freeboardProvidedM,
        freeboardRequiredM: 0.30,
        isFreeboardAdequate: primaryHydraulics.isFreeboardOk,
        notes: `SWD: ${primaryHydraulics.waterDepthM}m; SOR: ${primaryHydraulics.actualSorPeakM3M2D.toFixed(1)} m3/m2/d at peak.`,
      },
      {
        stationId: 'ST-06',
        unitName: 'Primary Clarifier (V-Notch Effluent Weir)',
        chainageM: 65.0,
        groundElevationMasl: groundMasl,
        invertElevationMasl: groundMasl - 4.50,
        waterDepthM: primaryHydraulics.waterDepthM - primaryHydraulics.headOverWeirM,
        waterLevelMasl: primaryHydraulics.weirCrestElevationMasl,
        hglMasl: primaryHydraulics.downstreamHglMasl,
        eglMasl: primaryHydraulics.downstreamHglMasl + 0.02,
        velocityMps: 0.60,
        headlossThroughUnitM: primaryHydraulics.weirDropM,
        freeboardM: primaryHydraulics.freeboardProvidedM,
        freeboardRequiredM: 0.30,
        isFreeboardAdequate: true,
        notes: `Peripheral 90° V-notch weir with ${primaryHydraulics.totalWeirLengthM.toFixed(1)}m crest length.`,
      },
      {
        stationId: 'ST-07',
        unitName: 'Primary Effluent Channel / Parshall Flume',
        chainageM: 75.0,
        groundElevationMasl: groundMasl,
        invertElevationMasl: groundMasl - 2.00,
        waterDepthM: 0.45,
        waterLevelMasl: primaryHydraulics.downstreamHglMasl - 0.10,
        hglMasl: primaryHydraulics.downstreamHglMasl - 0.10,
        eglMasl: primaryHydraulics.downstreamHglMasl - 0.08,
        velocityMps: 0.65,
        headlossThroughUnitM: 0.10,
        freeboardM: 1.55,
        freeboardRequiredM: 0.30,
        isFreeboardAdequate: true,
        notes: 'Gravity conveyance to Secondary Biological Aeration basins (Phase 05).',
      },
    ];

    const totalHeadlossM = stations[0].hglMasl - stations[stations.length - 1].hglMasl;
    const plantHglProfile: PlantHglProfileState = {
      profileId: 'HGL-PRELIM-01',
      profileName: 'Preliminary & Primary Treatment Hydraulic Profile',
      totalHeadlossM,
      inletHglMasl: stations[0].hglMasl,
      effluentHglMasl: stations[stations.length - 1].hglMasl,
      stations,
    };

    // 9. N-1 Redundancy & Failover Analysis
    const redundancyChecks: RedundancyCheckResult[] = [
      {
        unitType: 'SCREEN',
        totalUnits: coarseConfig.channelCount,
        dutyUnits: coarseConfig.dutyCount,
        standbyUnits: coarseConfig.standbyCount,
        nMinusOneCapacityLps: (qPeakLps / coarseConfig.dutyCount) * Math.max(1, coarseConfig.channelCount - 1),
        requiredPeakFlowLps: qPeakLps,
        hasAdequateRedundancy: coarseConfig.standbyCount >= 1 || coarseConfig.bypassAvailable,
        riskSeverity: coarseConfig.standbyCount >= 1 ? 'NONE' : coarseConfig.bypassAvailable ? 'MODERATE' : 'CRITICAL',
        contingencyPlan: coarseConfig.bypassAvailable
          ? 'Emergency manual bypass channel activated during automated mechanical screen maintenance.'
          : 'Dedicated 100% duty standby automated mechanical screen channel.',
      },
      {
        unitType: 'GRIT',
        totalUnits: gritConfig.chamberCount,
        dutyUnits: gritConfig.dutyCount,
        standbyUnits: gritConfig.standbyCount,
        nMinusOneCapacityLps: (qPeakLps / gritConfig.dutyCount) * Math.max(1, gritConfig.chamberCount - 1),
        requiredPeakFlowLps: qPeakLps,
        hasAdequateRedundancy: gritConfig.standbyCount >= 1,
        riskSeverity: gritConfig.standbyCount >= 1 ? 'NONE' : 'MODERATE',
        contingencyPlan: 'Dual chamber setup allows single chamber cleaning at reduced detention time (2.0 min at peak).',
      },
      {
        unitType: 'PRIMARY_CLARIFIER',
        totalUnits: primaryConfig.tankCount,
        dutyUnits: primaryConfig.dutyCount,
        standbyUnits: primaryConfig.standbyCount,
        nMinusOneCapacityLps: (qPeakLps / primaryConfig.dutyCount) * Math.max(1, primaryConfig.tankCount - 1),
        requiredPeakFlowLps: qPeakLps,
        hasAdequateRedundancy: primaryConfig.tankCount >= 2,
        riskSeverity: primaryConfig.tankCount >= 2 ? 'NONE' : 'CRITICAL',
        contingencyPlan: primaryConfig.tankCount >= 2
          ? 'Single clarifier operation during maintenance yields peak SOR of 80 m3/m2/d; temporary chemical coagulant dosing recommended.'
          : 'Single clarifier failure requires total plant bypass of primary treatment.',
      },
    ];

    const redundancyCompliant = redundancyChecks.every((r) => r.hasAdequateRedundancy);
    const preliminaryTrainSummary = {
      redundancyCompliant,
      totalHydraulicHeadlossM: plantHglProfile.totalHeadlossM,
      inletHglMasl: plantHglProfile.inletHglMasl,
      effluentHglMasl: plantHglProfile.effluentHglMasl,
      totalWetSolidsGeneratedKgDay:
        coarseHydraulics.screeningsWetMassKgDay +
        fineHydraulics.screeningsWetMassKgDay +
        gritHydraulics.gritWetMassKgDay +
        primarySludge.primaryWetSludgeM3Day * 1025,
      totalDrySolidsGeneratedKgDay:
        coarseHydraulics.screeningsDryMassKgDay +
        fineHydraulics.screeningsDryMassKgDay +
        gritHydraulics.gritDryMassKgDay +
        primarySludge.primaryDrySolidsKgDay,
    };

    return {
      coarseScreen: coarseConfig,
      fineScreen: fineConfig,
      coarseScreenHydraulics: coarseHydraulics,
      fineScreenHydraulics: fineHydraulics,
      gritChamber: gritConfig,
      gritHydraulics,
      fogManagement: fogConfig,
      fogHydraulics,
      primaryClarifier: primaryConfig,
      primaryHydraulics,
      primarySludge,
      massBalance,
      alternativeComparison,
      plantHglProfile,
      redundancyChecks,
      preliminaryTrainSummary,
    };
  }
}
