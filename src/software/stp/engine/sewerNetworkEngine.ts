/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Sewer Collection Network Topology, Accumulation & Hydraulic Grade Line Engine
 * @license Apache-2.0
 */

import { 
  SewerNetworkState, 
  SewerNode, 
  SewerPipe, 
  PumpingStation, 
  LongitudinalProfile, 
  ProfileStationPoint, 
  SewerDesignCriteria 
} from '../types/sewer';
import { GravityHydraulicsEngine } from './gravityHydraulicsEngine';
import { PumpingStationEngine } from './pumpingStationEngine';

export class SewerNetworkEngine {
  /**
   * Generates baseline default engineering design criteria.
   */
  public static getDefaultCriteria(): SewerDesignCriteria {
    return {
      profileType: 'CPHEEO_INDIA',
      profileName: 'Standard Municipal Sewerage Design Code',
      minSelfCleansingVelocityMps: 0.6,
      minInitialVelocityMps: 0.6,
      maxVelocityMps: 3.0,
      minDiameterMm: 200,
      minCoverDepthM: 1.0,
      maxCoverDepthM: 6.0,
      minSlopePermille: 2.0,
      maxSlopePermille: 50.0,
      maxDepthRatioD: 0.80,
      manningN: GravityHydraulicsEngine.MANNING_N,
      hazenWilliamsC: PumpingStationEngine.HAZEN_WILLIAMS_C,
      darcyRoughnessMm: PumpingStationEngine.DARCY_ROUGHNESS_MM,
    };
  }

  /**
   * Initializes a benchmark municipal sewerage network connected to Phase 02 catchments.
   */
  public static createDefaultNetwork(phase02PeakFlowLps: number = 175): SewerNetworkState {
    const criteria = this.getDefaultCriteria();

    // 1. Benchmark Nodes (Manholes + Lift Station + STP Inlet)
    const nodes: Record<string, SewerNode> = {
      'MH-01': {
        id: 'MH-01',
        name: 'Catchment A Upstream Terminal Manhole',
        type: 'MANHOLE',
        coordinates: { easting: 1000, northing: 5000 },
        groundLevelMasl: 25.0,
        rimLevelMasl: 25.1,
        invertLevelMasl: 23.8,
        depthM: 1.2,
        diameterMm: 1000,
        catchmentId: 'CATCH-A',
        localInflowLps: 35.0,
        isDropManhole: false,
        dropHeightM: 0,
        junctionLossCoeff: 0.15,
        waterLevelHglMasl: 24.0,
        isSurcharged: false,
        overflowRisk: 'NONE',
      },
      'MH-02': {
        id: 'MH-02',
        name: 'Sector 2 Trunk Intersection Manhole',
        type: 'MANHOLE',
        coordinates: { easting: 1150, northing: 4920 },
        groundLevelMasl: 23.5,
        rimLevelMasl: 23.6,
        invertLevelMasl: 21.7,
        depthM: 1.8,
        diameterMm: 1200,
        catchmentId: 'CATCH-B',
        localInflowLps: 45.0,
        isDropManhole: false,
        dropHeightM: 0,
        junctionLossCoeff: 0.25,
        waterLevelHglMasl: 22.1,
        isSurcharged: false,
        overflowRisk: 'NONE',
      },
      'MH-03': {
        id: 'MH-03',
        name: 'Commercial District Junction Manhole',
        type: 'MANHOLE',
        coordinates: { easting: 1320, northing: 4800 },
        groundLevelMasl: 21.0,
        rimLevelMasl: 21.1,
        invertLevelMasl: 18.9,
        depthM: 2.1,
        diameterMm: 1200,
        catchmentId: 'CATCH-C',
        localInflowLps: 55.0,
        isDropManhole: false,
        dropHeightM: 0,
        junctionLossCoeff: 0.30,
        waterLevelHglMasl: 19.4,
        isSurcharged: false,
        overflowRisk: 'NONE',
      },
      'PS-01': {
        id: 'PS-01',
        name: 'Main Low-Lying Outfall Lift Station',
        type: 'LIFT_STATION',
        coordinates: { easting: 1550, northing: 4650 },
        groundLevelMasl: 16.5,
        rimLevelMasl: 16.6,
        invertLevelMasl: 10.5,
        depthM: 6.0,
        diameterMm: 3500,
        localInflowLps: 40.0,
        isDropManhole: true,
        dropHeightM: 1.5,
        junctionLossCoeff: 0.5,
        waterLevelHglMasl: 11.2,
        isSurcharged: false,
        overflowRisk: 'NONE',
      },
      'STP-INLET': {
        id: 'STP-INLET',
        name: 'Central STP Receiving Coarse Screen Basin',
        type: 'STP_INLET',
        coordinates: { easting: 2100, northing: 4400 },
        groundLevelMasl: 28.0,
        rimLevelMasl: 28.2,
        invertLevelMasl: 26.5,
        depthM: 1.5,
        diameterMm: 2000,
        localInflowLps: 0,
        isDropManhole: false,
        dropHeightM: 0,
        junctionLossCoeff: 0.2,
        waterLevelHglMasl: 27.2,
        isSurcharged: false,
        overflowRisk: 'NONE',
      },
    };

    // 2. Benchmark Pipes (Gravity Collection + Rising Main)
    const pipes: Record<string, SewerPipe> = {
      'PIPE-01': {
        id: 'PIPE-01',
        name: 'Branch Sewer MH-01 to MH-02',
        type: 'BRANCH_SEWER',
        upstreamNodeId: 'MH-01',
        downstreamNodeId: 'MH-02',
        material: 'uPVC',
        nominalDiameterMm: 250,
        innerDiameterM: 0.25,
        lengthM: 170,
        upstreamInvertMasl: 23.8,
        downstreamInvertMasl: 21.7,
        slopePermille: 12.35,
        slopeRatio: 0.01235,
        roughnessManningN: 0.010,
        localFlowLps: 35.0,
        accumulatedFlowLps: 35.0,
        designFlowLps: 35.0,
        designFlowM3d: 3024,
        upstreamCoverM: 1.2,
        downstreamCoverM: 1.8,
        avgCoverM: 1.5,
        isCoverAdequate: true,
        isExcessiveDepth: false,
        hydraulics: GravityHydraulicsEngine.solvePartialFlow(35.0, 0.25, 0.01235, 0.010, criteria),
        status: 'OK',
        warnings: [],
      },
      'PIPE-02': {
        id: 'PIPE-02',
        name: 'Trunk Collector MH-02 to MH-03',
        type: 'TRUNK_SEWER',
        upstreamNodeId: 'MH-02',
        downstreamNodeId: 'MH-03',
        material: 'HDPE_PE100',
        nominalDiameterMm: 375,
        innerDiameterM: 0.375,
        lengthM: 210,
        upstreamInvertMasl: 21.7,
        downstreamInvertMasl: 18.9,
        slopePermille: 13.33,
        slopeRatio: 0.01333,
        roughnessManningN: 0.010,
        localFlowLps: 45.0,
        accumulatedFlowLps: 80.0,
        designFlowLps: 80.0,
        designFlowM3d: 6912,
        upstreamCoverM: 1.8,
        downstreamCoverM: 2.1,
        avgCoverM: 1.95,
        isCoverAdequate: true,
        isExcessiveDepth: false,
        hydraulics: GravityHydraulicsEngine.solvePartialFlow(80.0, 0.375, 0.01333, 0.010, criteria),
        status: 'OK',
        warnings: [],
      },
      'PIPE-03': {
        id: 'PIPE-03',
        name: 'Main Trunk Outfall MH-03 to PS-01',
        type: 'TRUNK_SEWER',
        upstreamNodeId: 'MH-03',
        downstreamNodeId: 'PS-01',
        material: 'RCC_CLASS_NP3',
        nominalDiameterMm: 500,
        innerDiameterM: 0.50,
        lengthM: 270,
        upstreamInvertMasl: 18.9,
        downstreamInvertMasl: 11.5,
        slopePermille: 27.4,
        slopeRatio: 0.0274,
        roughnessManningN: 0.013,
        localFlowLps: 55.0,
        accumulatedFlowLps: 135.0,
        designFlowLps: 135.0,
        designFlowM3d: 11664,
        upstreamCoverM: 2.1,
        downstreamCoverM: 5.0,
        avgCoverM: 3.55,
        isCoverAdequate: true,
        isExcessiveDepth: false,
        hydraulics: GravityHydraulicsEngine.solvePartialFlow(135.0, 0.50, 0.0274, 0.013, criteria),
        status: 'OK',
        warnings: [],
      },
    };

    // 3. Pumping Station & Force Main (PS-01 to STP-INLET)
    const pumpingStations: Record<string, PumpingStation> = {
      'PS-01': PumpingStationEngine.configurePumpingStation(
        'PS-01',
        'Main Outfall Lift Station',
        'PS-01',
        phase02PeakFlowLps || 175.0,
        (phase02PeakFlowLps || 175.0) / 2.25,
        16.0, // Static lift = 26.5m (STP Inlet) - 10.5m (Wet well low level)
        650,  // Force main length 650 meters
        300,  // 300 mm HDPE Force main
        'HDPE_PE100'
      ),
    };

    const initialNetwork: SewerNetworkState = {
      criteria,
      nodes,
      pipes,
      pumpingStations,
      longitudinalProfiles: {},
      selectedProfileId: 'PROF-MAIN-TRUNK',
      networkSummary: {
        totalPipesCount: 3,
        totalManholesCount: 4,
        totalPumpStationsCount: 1,
        totalNetworkLengthKm: 0.65 + 0.65,
        totalGravityFlowLps: 135.0,
        maxDepthM: 6.0,
        minVelocityMps: 0.95,
        maxVelocityMps: 2.45,
        surchargedPipesCount: 0,
        overflowRiskNodesCount: 0,
      },
    };

    // Build initial HGL longitudinal profile
    initialNetwork.longitudinalProfiles['PROF-MAIN-TRUNK'] = this.calculateLongitudinalProfile(
      initialNetwork,
      ['MH-01', 'MH-02', 'MH-03', 'PS-01', 'STP-INLET'],
      'PROF-MAIN-TRUNK',
      'Main Outfall Sewer Trunk to STP Inlet'
    );

    return initialNetwork;
  }

  /**
   * Calculates Topological Flow Accumulation from upstream to downstream nodes:
   * Q_pipe = sum(upstream contributing catchment inflows) + local manhole inflow.
   */
  public static recomputeNetworkHydraulics(network: SewerNetworkState): SewerNetworkState {
    const updated = { ...network, pipes: { ...network.pipes }, nodes: { ...network.nodes } };
    const { criteria } = updated;

    // 1. Calculate incoming links map for topology traversal
    const incomingPipesMap: Record<string, string[]> = {};
    const outgoingPipesMap: Record<string, string[]> = {};

    Object.values(updated.pipes).forEach((p) => {
      if (!incomingPipesMap[p.downstreamNodeId]) incomingPipesMap[p.downstreamNodeId] = [];
      incomingPipesMap[p.downstreamNodeId].push(p.id);

      if (!outgoingPipesMap[p.upstreamNodeId]) outgoingPipesMap[p.upstreamNodeId] = [];
      outgoingPipesMap[p.upstreamNodeId].push(p.id);
    });

    // 2. Traversal to accumulate flows downstream
    Object.values(updated.pipes).forEach((pipe) => {
      const upNode = updated.nodes[pipe.upstreamNodeId];
      const dnNode = updated.nodes[pipe.downstreamNodeId];

      const upInflow = upNode ? upNode.localInflowLps : 0;
      pipe.localFlowLps = upInflow;

      // Pipe slope check
      if (upNode && dnNode) {
        pipe.upstreamInvertMasl = upNode.invertLevelMasl;
        pipe.downstreamInvertMasl = dnNode.invertLevelMasl;
        const deltaH = pipe.upstreamInvertMasl - pipe.downstreamInvertMasl;
        pipe.slopeRatio = pipe.lengthM > 0 ? Math.max(0.0005, deltaH / pipe.lengthM) : 0.002;
        pipe.slopePermille = pipe.slopeRatio * 1000;

        pipe.upstreamCoverM = upNode.groundLevelMasl - pipe.upstreamInvertMasl;
        pipe.downstreamCoverM = dnNode.groundLevelMasl - pipe.downstreamInvertMasl;
        pipe.avgCoverM = (pipe.upstreamCoverM + pipe.downstreamCoverM) / 2;
        pipe.isCoverAdequate = pipe.avgCoverM >= criteria.minCoverDepthM;
        pipe.isExcessiveDepth = pipe.avgCoverM > criteria.maxCoverDepthM;
      }

      // Gravity Hydraulics partial flow solution
      pipe.hydraulics = GravityHydraulicsEngine.solvePartialFlow(
        pipe.designFlowLps,
        pipe.innerDiameterM,
        pipe.slopeRatio,
        pipe.roughnessManningN,
        criteria
      );

      pipe.status = pipe.hydraulics.status;
      pipe.warnings = [];
      if (!pipe.hydraulics.isSelfCleansing) pipe.warnings.push(`Low velocity (${pipe.hydraulics.velocityMps.toFixed(2)} m/s) < ${criteria.minSelfCleansingVelocityMps} m/s.`);
      if (pipe.hydraulics.isScouring) pipe.warnings.push(`High scouring velocity (${pipe.hydraulics.velocityMps.toFixed(2)} m/s) > ${criteria.maxVelocityMps} m/s.`);
      if (pipe.hydraulics.status === 'SURCHARGED') pipe.warnings.push('Pipe is operating under pressurized surcharge.');
      if (!pipe.isCoverAdequate) pipe.warnings.push(`Shallow cover (${pipe.avgCoverM.toFixed(2)}m) < minimum ${criteria.minCoverDepthM}m.`);
      if (pipe.isExcessiveDepth) pipe.warnings.push(`Deep trench excavation (${pipe.avgCoverM.toFixed(2)}m) > practical limit ${criteria.maxCoverDepthM}m.`);
    });

    // 3. Update summary metrics
    const pipesList = Object.values(updated.pipes);
    const surchargedCount = pipesList.filter((p) => p.status === 'SURCHARGED').length;
    const velocities = pipesList.map((p) => p.hydraulics.velocityMps).filter((v) => v > 0);

    updated.networkSummary = {
      totalPipesCount: pipesList.length,
      totalManholesCount: Object.keys(updated.nodes).length,
      totalPumpStationsCount: Object.keys(updated.pumpingStations).length,
      totalNetworkLengthKm: pipesList.reduce((acc, p) => acc + p.lengthM, 0) / 1000,
      totalGravityFlowLps: pipesList.reduce((acc, p) => Math.max(acc, p.designFlowLps), 0),
      maxDepthM: Math.max(...Object.values(updated.nodes).map((n) => n.depthM), 0),
      minVelocityMps: velocities.length > 0 ? Math.min(...velocities) : 0,
      maxVelocityMps: velocities.length > 0 ? Math.max(...velocities) : 0,
      surchargedPipesCount: surchargedCount,
      overflowRiskNodesCount: Object.values(updated.nodes).filter((n) => n.overflowRisk !== 'NONE').length,
    };

    // Recompute default profile
    if (updated.selectedProfileId && updated.longitudinalProfiles[updated.selectedProfileId]) {
      const p = updated.longitudinalProfiles[updated.selectedProfileId];
      updated.longitudinalProfiles[updated.selectedProfileId] = this.calculateLongitudinalProfile(
        updated,
        p.pathNodeIds,
        p.profileId,
        p.name
      );
    }

    return updated;
  }

  /**
   * Longitudinal Hydraulic Grade Line (HGL) & Energy Grade Line (EGL) Profile Engine:
   * Propagates water surface elevation, crown, ground, and energy level along a sewer chain.
   */
  public static calculateLongitudinalProfile(
    network: SewerNetworkState,
    nodePathIds: string[],
    profileId: string = 'PROF-001',
    profileName: string = 'Longitudinal Sewer Profile'
  ): LongitudinalProfile {
    let currentChainage = 0;
    const stations: ProfileStationPoint[] = [];

    for (let i = 0; i < nodePathIds.length; i++) {
      const nodeId = nodePathIds[i];
      const node = network.nodes[nodeId];
      if (!node) continue;

      let pipe: SewerPipe | undefined;
      if (i < nodePathIds.length - 1) {
        const nextNodeId = nodePathIds[i + 1];
        pipe = Object.values(network.pipes).find(
          (p) => p.upstreamNodeId === nodeId && p.downstreamNodeId === nextNodeId
        );
      }

      const waterDepth = pipe ? pipe.hydraulics.depthM : 0.2;
      const hgl = node.invertLevelMasl + waterDepth;
      const velocity = pipe ? pipe.hydraulics.velocityMps : 1.0;
      const velocityHead = Math.pow(velocity, 2) / (2 * 9.81);
      const egl = hgl + velocityHead;
      const crown = node.invertLevelMasl + (pipe ? pipe.innerDiameterM : 0.3);
      const isSurcharged = hgl > crown;

      stations.push({
        chainageM: Math.round(currentChainage),
        nodeId: node.id,
        pipeId: pipe?.id,
        groundElevationMasl: node.groundLevelMasl,
        rimElevationMasl: node.rimLevelMasl,
        invertElevationMasl: node.invertLevelMasl,
        crownElevationMasl: crown,
        waterDepthM: waterDepth,
        hglMasl: hgl,
        eglMasl: egl,
        velocityMps: velocity,
        isSurcharged,
        hasPump: node.type === 'LIFT_STATION',
      });

      if (pipe) {
        currentChainage += pipe.lengthM;
      } else if (node.type === 'LIFT_STATION') {
        const ps = network.pumpingStations[node.id];
        currentChainage += ps ? ps.forceMain.lengthM : 500;
      }
    }

    return {
      profileId,
      name: profileName,
      pathNodeIds: nodePathIds,
      totalLengthM: Math.round(currentChainage),
      stations,
    };
  }
}
