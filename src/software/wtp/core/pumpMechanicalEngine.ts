/**
 * EVL WTP Engineering Suite - Pump & Mechanical Engineering Engine
 * Calculates Pump Curves (H = H0 - A*Q^2), System Head Curves (Hsys = Hstat + K*Q^2),
 * Operating Points, BEP Efficiency, Cavitation Margins, and Equipment Datasheets.
 */

export interface PumpOperatingPoint {
  dutyFlowM3hr: number;
  dutyHeadM: number;
  staticHeadM: number;
  frictionHeadM: number;
  shutoffHeadM: number;
  bepFlowM3hr: number;
  bepEfficiencyPct: number;
  operatingEfficiencyPct: number;
  powerAbsorbedKw: number;
  motorRatingKw: number;
  npshaM: number;
  npshrM: number;
  cavitationMarginM: number;
  cavitationRiskStatus: 'PASS' | 'WARNING' | 'FAIL';
}

export interface PumpEquipmentDatasheet {
  equipmentTag: string;
  equipmentDescription: string;
  processUnit: string;
  pumpType: 'Vertical Turbine' | 'Horizontal Split Case' | 'Progressive Cavity Sludge' | 'Submerged Sump' | 'Peristaltic Dosing';
  numDuty: number;
  numStandby: number;
  operatingFlowM3hr: number;
  totalDynamicHeadM: number;
  impellerDiameterMm: number;
  speedRpm: number;
  casingMaterial: string;
  impellerMaterial: string;
  shaftSeal: 'Mechanical Seal (Double Cartridge)' | 'Gland Packing' | 'Magnetic Drive';
  motorPowerKw: number;
  voltageV: number;
  starterType: 'VFD (Variable Frequency Drive)' | 'Soft Starter' | 'Direct On Line (DOL)';
  sparesKitRequired: string[];
}

export function calculatePumpPerformance(
  pumpType: 'INTAKE_RAW' | 'HIGH_LIFT' | 'BACKWASH' | 'SLUDGE',
  dutyFlowM3hr: number,
  staticHeadM: number,
  pipeLengthM: number,
  pipeDiameterMm: number,
  npshaM: number = 8.5
): {
  operatingPoint: PumpOperatingPoint;
  datasheet: PumpEquipmentDatasheet;
  curveData: { flow: number; pumpHead: number; systemHead: number; efficiency: number }[];
} {
  // 1. Friction loss coefficient K where Hf = K * Q^2
  const d_m = pipeDiameterMm / 1000;
  const area_m2 = (Math.PI / 4) * (d_m ** 2);
  // K_sys = 10.67 * L / (C^1.852 * D^4.87) for Q in m3/s
  const k_sys = (10.67 * pipeLengthM) / ((130 ** 1.852) * (d_m ** 4.87) * (3600 ** 1.852));

  const frictionHeadAtDuty = k_sys * (dutyFlowM3hr ** 1.852);
  const totalDynamicHead = staticHeadM + frictionHeadAtDuty;

  // Pump Curve Parameters: H(Q) = H_0 - A * Q^1.85
  const shutoffHead = totalDynamicHead * 1.25; // Shutoff ~25% above TDH
  const A_coef = (shutoffHead - totalDynamicHead) / (dutyFlowM3hr ** 1.85);

  const bepFlow = dutyFlowM3hr; // Designed at BEP
  const bepEff = 85.0; // 85% BEP efficiency
  const powerAbsorbed = (dutyFlowM3hr * 1000 * 9.81 * totalDynamicHead) / (3600 * 1000 * (bepEff / 100));
  const motorKw = Math.ceil((powerAbsorbed * 1.15) / 5) * 5; // 15% safety margin rounded to 5 kW

  const npshr = 4.2; // m
  const margin = npshaM - npshr;

  const operatingPoint: PumpOperatingPoint = {
    dutyFlowM3hr: Number(dutyFlowM3hr.toFixed(1)),
    dutyHeadM: Number(totalDynamicHead.toFixed(2)),
    staticHeadM: staticHeadM,
    frictionHeadM: Number(frictionHeadAtDuty.toFixed(2)),
    shutoffHeadM: Number(shutoffHead.toFixed(2)),
    bepFlowM3hr: bepFlow,
    bepEfficiencyPct: bepEff,
    operatingEfficiencyPct: bepEff,
    powerAbsorbedKw: Number(powerAbsorbed.toFixed(1)),
    motorRatingKw: motorKw,
    npshaM: Number(npshaM.toFixed(2)),
    npshrM: npshr,
    cavitationMarginM: Number(margin.toFixed(2)),
    cavitationRiskStatus: margin >= 1.5 ? 'PASS' : margin >= 0.8 ? 'WARNING' : 'FAIL'
  };

  // Curve Data Points (0 to 150% flow)
  const curveData = [];
  for (let q = 0; q <= dutyFlowM3hr * 1.5; q += dutyFlowM3hr * 0.1) {
    const pHead = shutoffHead - A_coef * (q ** 1.85);
    const sHead = staticHeadM + k_sys * (q ** 1.852);
    const eff = Math.max(0, bepEff * (1 - ((q - bepFlow) / bepFlow) ** 2));

    curveData.push({
      flow: Number(q.toFixed(1)),
      pumpHead: Number(pHead.toFixed(2)),
      systemHead: Number(sHead.toFixed(2)),
      efficiency: Number(eff.toFixed(1))
    });
  }

  // Datasheet Generation
  const tagPrefix = pumpType === 'INTAKE_RAW' ? 'PMP-RAW' : pumpType === 'HIGH_LIFT' ? 'PMP-HLP' : pumpType === 'BACKWASH' ? 'PMP-BW' : 'PMP-SLU';
  const desc = pumpType === 'INTAKE_RAW' ? 'Raw Water Intake Vertical Turbine Pump' : pumpType === 'HIGH_LIFT' ? 'High Lift Distribution Horizontal Split Case Pump' : pumpType === 'BACKWASH' ? 'Filter Backwash Water Pump' : 'Thickened Sludge Transfer Pump';

  const datasheet: PumpEquipmentDatasheet = {
    equipmentTag: `${tagPrefix}-001`,
    equipmentDescription: desc,
    processUnit: pumpType,
    pumpType: pumpType === 'INTAKE_RAW' ? 'Vertical Turbine' : pumpType === 'HIGH_LIFT' ? 'Horizontal Split Case' : 'Submerged Sump',
    numDuty: 4,
    numStandby: 1,
    operatingFlowM3hr: dutyFlowM3hr,
    totalDynamicHeadM: Number(totalDynamicHead.toFixed(2)),
    impellerDiameterMm: 480,
    speedRpm: 1480,
    casingMaterial: 'Ductile Iron EN-GJS-400-15',
    impellerMaterial: 'Duplex Stainless Steel (UNS S31803)',
    shaftSeal: 'Mechanical Seal (Double Cartridge)',
    motorPowerKw: motorKw,
    voltageV: 415,
    starterType: 'VFD (Variable Frequency Drive)',
    sparesKitRequired: ['Mechanical Seal Kit', 'Impeller Wear Rings', 'Coupling Element', 'Bearing Assembly']
  };

  return { operatingPoint, datasheet, curveData };
}
