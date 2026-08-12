/**
 * EVL WTP Engineering Suite - Process Stream Engine
 * Tracks mass, flow, water quality, and hydraulic HGL propagation across configurable WTP process trains.
 */

export interface ProcessStream {
  streamId: string;
  name: string;
  fromUnitId: string;
  toUnitId: string;
  flowM3hr: number;
  flowLs: number;
  flowMld: number;
  
  // Water Quality
  turbidityNTU: number;
  tssMgL: number;
  ironMgL: number;
  manganeseMgL: number;
  coliformCfu: number;
  ph: number;
  alkalinityMgL: number;
  freeCl2MgL: number;
  
  // Hydraulics & Mass
  hydraulicLevelM: number; // Water surface elevation (m)
  headLossM: number;
  solidsGeneratedKgDay: number;
  chemicalDoseMgL: number;
  chemicalType: string;
  status: 'OPTIMAL' | 'ELEVATED_TURBIDITY' | 'LOW_ALKALINITY' | 'HYDRAULIC_HEADLOSS_WARNING';
}

export interface ProcessTrainNode {
  id: string;
  unitType: 'intake' | 'screening' | 'aeration' | 'coagulation' | 'flocculation' | 'sedimentation' | 'filtration' | 'disinfection' | 'cwr';
  name: string;
  enabled: boolean;
  sequence: number;
  subType: string;
  numUnits: number;
  headLossM: number;
  removalEfficiencies: {
    turbidityPct: number;
    tssPct: number;
    ironPct: number;
    manganesePct: number;
    coliformPct: number;
  };
  chemicalAddition?: {
    type: string;
    doseMgL: number;
  };
  parameters: Record<string, number | string>;
}

export const DEFAULT_PROCESS_TRAIN: ProcessTrainNode[] = [
  {
    id: 'UNIT-INT-01',
    unitType: 'intake',
    name: 'Raw Water Intake Works',
    enabled: true,
    sequence: 1,
    subType: 'River Intake Tower',
    numUnits: 2,
    headLossM: 0.5,
    removalEfficiencies: { turbidityPct: 5, tssPct: 10, ironPct: 0, manganesePct: 0, coliformPct: 0 },
    parameters: { type: 'River Intake', approachVelocityMs: 0.15, screenAreaM2: 12.5 }
  },
  {
    id: 'UNIT-SCR-01',
    unitType: 'screening',
    name: 'Coarse & Fine Screens',
    enabled: true,
    sequence: 2,
    subType: 'Mechanical Fine Screen',
    numUnits: 2,
    headLossM: 0.25,
    removalEfficiencies: { turbidityPct: 5, tssPct: 10, ironPct: 0, manganesePct: 0, coliformPct: 0 },
    parameters: { barSpacingMm: 10, barThicknessMm: 6, inclinationDeg: 75 }
  },
  {
    id: 'UNIT-AER-01',
    unitType: 'aeration',
    name: 'Cascade Aerator',
    enabled: true,
    sequence: 3,
    subType: 'Circular Cascade Aerator',
    numUnits: 1,
    headLossM: 1.5,
    removalEfficiencies: { turbidityPct: 0, tssPct: 0, ironPct: 65, manganesePct: 35, coliformPct: 0 },
    parameters: { steps: 5, totalDropM: 1.5, spaceAreaM2: 85 }
  },
  {
    id: 'UNIT-COA-01',
    unitType: 'coagulation',
    name: 'Flash Rapid Mixer',
    enabled: true,
    sequence: 4,
    subType: 'Mechanical Shaft Rapid Mixer',
    numUnits: 2,
    headLossM: 0.3,
    removalEfficiencies: { turbidityPct: 0, tssPct: 0, ironPct: 0, manganesePct: 0, coliformPct: 0 },
    chemicalAddition: { type: 'Alum', doseMgL: 35 },
    parameters: { gValueS1: 800, detentionTimeSec: 45 }
  },
  {
    id: 'UNIT-FLO-01',
    unitType: 'flocculation',
    name: 'Tapered Paddle Flocculator',
    enabled: true,
    sequence: 5,
    subType: 'Mechanical 3-Stage Flocculator',
    numUnits: 2,
    headLossM: 0.4,
    removalEfficiencies: { turbidityPct: 10, tssPct: 15, ironPct: 10, manganesePct: 0, coliformPct: 0 },
    parameters: { gStage1: 50, gStage2: 30, gStage3: 15, totalDetentionMin: 20 }
  },
  {
    id: 'UNIT-SED-01',
    unitType: 'sedimentation',
    name: 'Tube / Lamella Clarifier',
    enabled: true,
    sequence: 6,
    subType: 'Inclined Tube Settler',
    numUnits: 2,
    headLossM: 0.6,
    removalEfficiencies: { turbidityPct: 90, tssPct: 92, ironPct: 80, manganesePct: 60, coliformPct: 40 },
    parameters: { sorM3M2Hr: 3.5, tubeLengthM: 1.0, tubeAngleDeg: 60 }
  },
  {
    id: 'UNIT-FIL-01',
    unitType: 'filtration',
    name: 'Rapid Gravity Sand Filters',
    enabled: true,
    sequence: 7,
    subType: 'Dual Media (Anthracite-Sand)',
    numUnits: 6,
    headLossM: 1.8,
    removalEfficiencies: { turbidityPct: 95, tssPct: 98, ironPct: 90, manganesePct: 85, coliformPct: 90 },
    parameters: { filtrationRateM3M2Hr: 6.0, mediaDepthM: 0.9, sandD10Mm: 0.55 }
  },
  {
    id: 'UNIT-DIS-01',
    unitType: 'disinfection',
    name: 'Chlorine Contact Tank',
    enabled: true,
    sequence: 8,
    subType: 'Baffled Serpentine Contact Tank',
    numUnits: 2,
    headLossM: 0.2,
    removalEfficiencies: { turbidityPct: 0, tssPct: 0, ironPct: 0, manganesePct: 0, coliformPct: 99.99 },
    chemicalAddition: { type: 'Gas Chlorine', doseMgL: 3.5 },
    parameters: { contactTimeMin: 30, baffleFactor: 0.7, residualCl2MgL: 1.5 }
  },
  {
    id: 'UNIT-CWR-01',
    unitType: 'cwr',
    name: 'Clear Water Reservoir',
    enabled: true,
    sequence: 9,
    subType: 'Reinforced Concrete Underground Tank',
    numUnits: 2,
    headLossM: 0.1,
    removalEfficiencies: { turbidityPct: 0, tssPct: 0, ironPct: 0, manganesePct: 0, coliformPct: 0 },
    parameters: { retentionHours: 8.0, usableDepthM: 4.5 }
  }
];

export function propagateProcessStreams(
  processTrain: ProcessTrainNode[],
  plantCapacityMLD: number,
  rawWaterQuality: {
    turbidityNTU: number;
    tssMgL: number;
    ironMgL: number;
    manganeseMgL: number;
    coliformCfu: number;
    ph: number;
    alkalinityMgL: number;
  },
  datumElevationM: number = 25.0
): ProcessStream[] {
  const streams: ProcessStream[] = [];
  
  let currentFlowMld = plantCapacityMLD * 1.05; // 5% allowance for backwash and plant internal losses
  let currentTurbidity = rawWaterQuality.turbidityNTU;
  let currentTss = rawWaterQuality.tssMgL;
  let currentIron = rawWaterQuality.ironMgL;
  let currentManganese = rawWaterQuality.manganeseMgL;
  let currentColiform = rawWaterQuality.coliformCfu;
  let currentPh = rawWaterQuality.ph;
  let currentAlkalinity = rawWaterQuality.alkalinityMgL;
  let currentFreeCl2 = 0.0;
  let currentHGL = datumElevationM;

  const sortedNodes = [...processTrain].filter(n => n.enabled).sort((a, b) => a.sequence - b.sequence);

  sortedNodes.forEach((node, index) => {
    const nextNode = sortedNodes[index + 1];
    const streamId = `STRM-${node.unitType.substring(0, 3).toUpperCase()}-${index + 1}`;
    
    // Process head loss and HGL drop
    const unitHl = Number(node.headLossM || 0.3);
    currentHGL -= unitHl;

    // Chemical addition impacts
    let chemDose = 0;
    let chemType = 'None';
    let solidsGen = 0;

    if (node.chemicalAddition) {
      chemDose = node.chemicalAddition.doseMgL;
      chemType = node.chemicalAddition.type;
      
      if (chemType.toLowerCase().includes('alum')) {
        // Alkalinity drop: 1 mg/L alum consumes 0.45 mg/L CaCO3
        currentAlkalinity = Math.max(0, currentAlkalinity - (chemDose * 0.45));
        // Dry sludge generation: 0.26 kg Al(OH)3 per kg alum + raw TSS removed
        solidsGen += (currentFlowMld * 1000) * (chemDose * 0.26) / 1000;
      } else if (chemType.toLowerCase().includes('chlorine')) {
        // Chlorine residual
        currentFreeCl2 = Math.max(0, chemDose - 1.5);
      }
    }

    // Apply removal efficiencies
    const eff = node.removalEfficiencies;
    currentTurbidity = Number((currentTurbidity * (1 - eff.turbidityPct / 100)).toFixed(2));
    const tssRemoved = currentTss * (eff.tssPct / 100);
    currentTss = Number((currentTss - tssRemoved).toFixed(2));
    solidsGen += (currentFlowMld * 1000) * tssRemoved / 1000;

    currentIron = Number((currentIron * (1 - eff.ironPct / 100)).toFixed(2));
    currentManganese = Number((currentManganese * (1 - eff.manganesePct / 100)).toFixed(2));
    currentColiform = Number((currentColiform * (1 - eff.coliformPct / 100)).toFixed(2));

    let status: ProcessStream['status'] = 'OPTIMAL';
    if (currentTurbidity > 5.0) status = 'ELEVATED_TURBIDITY';
    if (currentAlkalinity < 20.0) status = 'LOW_ALKALINITY';

    streams.push({
      streamId,
      name: `Stream ex-${node.name}`,
      fromUnitId: node.id,
      toUnitId: nextNode ? nextNode.id : 'PLANT-OUTLET',
      flowM3hr: Number(((currentFlowMld * 1000) / 24).toFixed(2)),
      flowLs: Number(((currentFlowMld * 1000000) / 86400).toFixed(2)),
      flowMld: Number(currentFlowMld.toFixed(2)),
      turbidityNTU: currentTurbidity,
      tssMgL: currentTss,
      ironMgL: currentIron,
      manganeseMgL: currentManganese,
      coliformCfu: currentColiform,
      ph: Number(currentPh.toFixed(2)),
      alkalinityMgL: Number(currentAlkalinity.toFixed(1)),
      freeCl2MgL: Number(currentFreeCl2.toFixed(2)),
      hydraulicLevelM: Number(currentHGL.toFixed(2)),
      headLossM: unitHl,
      solidsGeneratedKgDay: Number(solidsGen.toFixed(1)),
      chemicalDoseMgL: chemDose,
      chemicalType: chemType,
      status
    });
  });

  return streams;
}
