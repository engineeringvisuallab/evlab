/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Universal Process Stream & Asset Model Engine
 * @license Apache-2.0
 */

import { StreamModel, ProcessAsset, StreamType, AssetCategory } from '../types/stp';
import { IDGenerator } from './idGenerator';

export class StreamAndAssetEngine {
  /**
   * Factory to create a standard universal stream.
   */
  public static createStream(
    name: string,
    type: StreamType,
    sourceUnitId: string,
    destinationUnitId: string,
    flowM3d: number,
    bod5MgL: number = 250,
    tssMgL: number = 280,
    tknMgL: number = 45,
    tpMgL: number = 8.0
  ): StreamModel {
    const streamId = IDGenerator.streamID();
    const flowLps = flowM3d / 86.4;

    return {
      id: streamId,
      name,
      type,
      sourceUnitId,
      destinationUnitId,
      flowM3d,
      flowLps,
      temperatureCelsius: 20.0,
      pressureBar: 1.013,
      headm: 0.0,
      constituents: {
        bod5MgL,
        codMgL: bod5MgL * 1.8,
        tssMgL,
        vssMgL: tssMgL * 0.8,
        tknMgL,
        nh3nMgL: tknMgL * 0.7,
        tpMgL,
        doMgL: type === 'LIQUID' ? 2.0 : 0.0,
      },
    };
  }

  /**
   * Factory to create a process asset linked to BIM, BOQ, and SCADA.
   */
  public static createAsset(
    tag: string,
    name: string,
    category: AssetCategory,
    processUnitId: string,
    dutyCapacity: number,
    capacityUnit: string,
    powerRatingKw: number,
    dutyCount: number = 1,
    standbyCount: number = 1
  ): ProcessAsset {
    const assetId = IDGenerator.equipmentID(category.substring(0, 3));
    const bimGuid = IDGenerator.bimGuid();
    const boqItemRef = IDGenerator.boqItemID(category.substring(0, 3));
    const scadaTagPrefix = `${tag}_SCADA`;

    return {
      id: assetId,
      tag,
      category,
      name,
      processUnitId,
      dutyCapacity,
      capacityUnit,
      dutyCount,
      standbyCount,
      powerRatingKw,
      operatingVoltageV: powerRatingKw > 50 ? 400 : 230,
      locationArea: `Process Unit ${processUnitId}`,
      bimGuid,
      boqItemRef,
      costEstimateUSD: powerRatingKw * 800 + dutyCapacity * 150 + 5000,
      scadaTagPrefix,
      maintenanceIntervalHours: 2000,
    };
  }

  /**
   * Generates a baseline set of process streams for an active STP plant topology.
   */
  public static generateDefaultStreams(): Record<string, StreamModel> {
    const streams: Record<string, StreamModel> = {};

    const rawInlet = this.createStream('Raw Influent Stream', 'LIQUID', 'PU-INLET', 'PU-PRELIM', 12826, 250, 280, 45, 8.0);
    const screened = this.createStream('Screened & Degritted Water', 'LIQUID', 'PU-PRELIM', 'PU-PRIMARY', 12826, 240, 220, 44, 7.8);
    const primaryEff = this.createStream('Primary Settled Effluent', 'LIQUID', 'PU-PRIMARY', 'PU-BIO-AER', 12826, 168, 110, 42, 7.5);
    const aerationMixed = this.createStream('Mixed Liquor Suspended Liquor', 'LIQUID', 'PU-BIO-AER', 'PU-SEC-CLAR', 38478, 15, 3500, 5, 1.2);
    const rasRecycle = this.createStream('Return Activated Sludge (RAS)', 'SLUDGE', 'PU-SEC-CLAR', 'PU-BIO-AER', 12826, 10, 8000, 15, 2.5);
    const wasStream = this.createStream('Waste Activated Sludge (WAS)', 'SLUDGE', 'PU-SEC-CLAR', 'PU-SLUDGE-THICK', 250, 10, 8000, 15, 2.5);
    const finalEffluent = this.createStream('Disinfected Treated Effluent', 'LIQUID', 'PU-DISINFECT', 'PU-OUTFALL', 12826, 8, 10, 2, 0.8);

    [rawInlet, screened, primaryEff, aerationMixed, rasRecycle, wasStream, finalEffluent].forEach((s) => {
      streams[s.id] = s;
    });

    return streams;
  }

  /**
   * Generates default baseline mechanical and electrical assets.
   */
  public static generateDefaultAssets(): Record<string, ProcessAsset> {
    const assets: Record<string, ProcessAsset> = {};

    const p1 = this.createAsset('P-101A/B', 'Raw Wastewater Lift Pumps', 'PUMP', 'PU-INLET', 180, 'L/s', 45, 2, 1);
    const scr1 = this.createAsset('SCR-201', 'Fine Mechanical Bar Screen', 'SCREEN', 'PU-PRELIM', 350, 'L/s', 3.0, 1, 1);
    const blw1 = this.createAsset('BLW-301A-C', 'Tri-Lobe Aeration Blowers', 'BLOWER', 'PU-BIO-AER', 45, 'Nm3/min', 75, 2, 1);
    const clr1 = this.createAsset('CLR-401', 'Circular Clarifier Bridge Drive', 'CLARIFIER', 'PU-SEC-CLAR', 25, 'm', 2.2, 1, 0);

    [p1, scr1, blw1, clr1].forEach((a) => {
      assets[a.id] = a;
    });

    return assets;
  }
}
