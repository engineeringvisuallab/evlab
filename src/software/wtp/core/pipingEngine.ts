/**
 * EVL WTP Engineering Suite - Complete Piping, Valve & Fitting Engine
 * Generates Pipe Schedule, Valve Schedule, Fitting Schedule, Hazen-Williams Headloss,
 * Darcy-Weisbach Friction Factor, Minor Loss Coefficients, and P&ID Tag Mapping.
 */

export interface PipeScheduleItem {
  id: string;
  tag: string;
  serviceDescription: string;
  nominalDiameterDN: number;
  internalDiameterMm: number;
  wallThicknessMm: number;
  materialCode: 'DI' | 'MS' | 'HDPE' | 'uPVC' | 'SS316';
  pressureRatingPN: number;
  lengthM: number;
  flowM3hr: number;
  velocityMs: number;
  hazenWilliamsC: number;
  darcyRoughnessEpsilonMm: number;
  reynoldsNumber: number;
  frictionFactorF: number;
  frictionHeadlossM: number;
  minorLossCoeffK: number;
  minorHeadlossM: number;
  totalHeadlossM: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export interface ValveScheduleItem {
  id: string;
  tag: string;
  type: 'Butterfly Valve' | 'Gate Valve' | 'Check Valve' | 'Air Release Valve' | 'Scour Drain Valve' | 'Control Valve' | 'Pressure Reducing Valve';
  sizeDN: number;
  pressureClassPN: number;
  material: string;
  actuation: 'Manual Handwheel' | 'Electric Motorized (VSD)' | 'Pneumatic Actuator' | 'Self-Operating Fluid';
  location: string;
  pidReference: string;
  failSafePosition: 'Fail Closed (FC)' | 'Fail Open (FO)' | 'Fail Last (FL)';
  notes: string;
}

export interface FittingScheduleItem {
  id: string;
  tag: string;
  fittingType: '90° Long Radius Elbow' | '45° Elbow' | 'Equal Tee (Branch Flow)' | 'Reducer (Concentric)' | 'Expansion Joint' | 'Flanged Spool Pipe';
  sizeDN: number;
  material: string;
  lossCoeffK: number;
  quantity: number;
  processUnit: string;
}

export function generatePipingAndValveSchedules(
  capacityMLD: number = 100
): {
  pipeSchedule: PipeScheduleItem[];
  valveSchedule: ValveScheduleItem[];
  fittingSchedule: FittingScheduleItem[];
  totalPipingHeadlossM: number;
} {
  const peakFlowFactor = 1.25;
  const flowM3hr = (capacityMLD * 1000 * peakFlowFactor) / 24;

  // 1. Pipe Schedule Generation
  const pipesRawData = [
    { tag: 'PIP-RAW-001', service: 'Raw Water River Intake Delivery Main', dn: 1200, id_mm: 1180, wall: 10, mat: 'MS' as const, pn: 16, len: 450, Q: flowM3hr, C: 125, eps: 0.04, K: 3.5 },
    { tag: 'PIP-AER-001', service: 'Cascade Aerator to Flash Mixer Channel Pipe', dn: 1000, id_mm: 980, wall: 10, mat: 'DI' as const, pn: 10, len: 35, Q: flowM3hr, C: 130, eps: 0.05, K: 1.8 },
    { tag: 'PIP-FLC-001', service: 'Flash Mixer to Flocculator Distribution Header', dn: 900, id_mm: 880, wall: 10, mat: 'DI' as const, pn: 10, len: 60, Q: flowM3hr, C: 130, eps: 0.05, K: 2.2 },
    { tag: 'PIP-CLR-001', service: 'Flocculator to Lamella Clarifier Feed Header', dn: 900, id_mm: 880, wall: 10, mat: 'DI' as const, pn: 10, len: 40, Q: flowM3hr, C: 130, eps: 0.05, K: 2.0 },
    { tag: 'PIP-FLT-001', service: 'Lamella Effluent to Rapid Sand Filter Settled Main', dn: 800, id_mm: 780, wall: 10, mat: 'DI' as const, pn: 10, len: 85, Q: flowM3hr, C: 130, eps: 0.05, K: 2.8 },
    { tag: 'PIP-DIS-001', service: 'Filter Effluent to Chlorine Contact Tank Main', dn: 800, id_mm: 780, wall: 10, mat: 'DI' as const, pn: 10, len: 70, Q: flowM3hr, C: 130, eps: 0.05, K: 2.5 },
    { tag: 'PIP-CWR-001', service: 'Chlorine Contact Tank to CWR Storage Delivery', dn: 800, id_mm: 780, wall: 10, mat: 'DI' as const, pn: 10, len: 120, Q: flowM3hr, C: 130, eps: 0.05, K: 2.0 },
    { tag: 'PIP-HLP-001', service: 'High Lift Pumping Main to Municipal Grid', dn: 1200, id_mm: 1180, wall: 10, mat: 'MS' as const, pn: 25, len: 1200, Q: flowM3hr, C: 125, eps: 0.04, K: 4.2 },
    { tag: 'PIP-BW-001', service: 'Filter Backwash Water Supply Main', dn: 500, id_mm: 485, wall: 7.5, mat: 'DI' as const, pn: 16, len: 180, Q: 2350, C: 130, eps: 0.05, K: 5.0 },
    { tag: 'PIP-SLU-001', service: 'Clarifier Sludge Discharge Main to Thickener', dn: 300, id_mm: 290, wall: 5, mat: 'HDPE' as const, pn: 10, len: 220, Q: 150, C: 140, eps: 0.007, K: 3.2 }
  ];

  let sumHeadloss = 0;

  const pipeSchedule: PipeScheduleItem[] = pipesRawData.map((p, idx) => {
    const q_m3s = p.Q / 3600;
    const area_m2 = (Math.PI / 4) * ((p.id_mm / 1000) ** 2);
    const velocity = q_m3s / area_m2;

    // Hazen-Williams Headloss: h_f = 10.67 * L * Q^1.852 / (C^1.852 * D^4.87)
    const d_m = p.id_mm / 1000;
    const h_f = (10.67 * p.len * (q_m3s ** 1.852)) / ((p.C ** 1.852) * (d_m ** 4.87));

    // Minor loss h_m = K * v^2 / 2g
    const h_m = (p.K * (velocity ** 2)) / (2 * 9.81);
    const total_h = h_f + h_m;
    sumHeadloss += total_h;

    // Reynolds Number Re = v * D / nu
    const reynolds = (velocity * d_m) / 0.000001004;
    // Swamee-Jain explicit Darcy friction factor
    const f_darcy = 0.25 / ((Math.log10((p.eps / (3.7 * p.id_mm)) + (5.74 / (reynolds ** 0.9)))) ** 2);

    const status = velocity >= 0.6 && velocity <= 2.5 ? 'PASS' : 'WARNING';

    return {
      id: `PIPE-SCH-${idx + 1}`,
      tag: p.tag,
      serviceDescription: p.service,
      nominalDiameterDN: p.dn,
      internalDiameterMm: p.id_mm,
      wallThicknessMm: p.wall,
      materialCode: p.mat,
      pressureRatingPN: p.pn,
      lengthM: p.len,
      flowM3hr: Number(p.Q.toFixed(1)),
      velocityMs: Number(velocity.toFixed(2)),
      hazenWilliamsC: p.C,
      darcyRoughnessEpsilonMm: p.eps,
      reynoldsNumber: Math.round(reynolds),
      frictionFactorF: Number(f_darcy.toFixed(4)),
      frictionHeadlossM: Number(h_f.toFixed(3)),
      minorLossCoeffK: p.K,
      minorHeadlossM: Number(h_m.toFixed(3)),
      totalHeadlossM: Number(total_h.toFixed(3)),
      status
    };
  });

  // 2. Valve Schedule Generation
  const valveSchedule: ValveScheduleItem[] = [
    { id: 'VLV-001', tag: 'VLV-RAW-01A', type: 'Butterfly Valve', sizeDN: 1200, pressureClassPN: 16, material: 'Ductile Iron GGG40', actuation: 'Electric Motorized (VSD)', location: 'Intake Pump Station Discharge', pidReference: 'PID-RAW-001', failSafePosition: 'Fail Last (FL)', notes: 'Isolation and flow throttling on raw water delivery main.' },
    { id: 'VLV-002', tag: 'VLV-RAW-01B', type: 'Check Valve', sizeDN: 1200, pressureClassPN: 16, material: 'Ductile Iron / Bronze Trim', actuation: 'Self-Operating Fluid', location: 'Intake Pump Non-Return', pidReference: 'PID-RAW-001', failSafePosition: 'Fail Closed (FC)', notes: 'Non-slam dual plate check valve for water hammer protection.' },
    { id: 'VLV-003', tag: 'VLV-FLT-01A', type: 'Butterfly Valve', sizeDN: 500, pressureClassPN: 10, material: 'Ductile Iron EPDM Seat', actuation: 'Pneumatic Actuator', location: 'Filter Bed 1 Inflow Control', pidReference: 'PID-FLT-001', failSafePosition: 'Fail Open (FO)', notes: 'Filter influent control valve.' },
    { id: 'VLV-004', tag: 'VLV-BW-01A', type: 'Butterfly Valve', sizeDN: 500, pressureClassPN: 16, material: 'Ductile Iron EPDM Seat', actuation: 'Pneumatic Actuator', location: 'Filter Backwash Water Inlet', pidReference: 'PID-FLT-001', failSafePosition: 'Fail Closed (FC)', notes: 'Automated filter backwash sequence control.' },
    { id: 'VLV-005', tag: 'VLV-AIR-01', type: 'Air Release Valve', sizeDN: 150, pressureClassPN: 25, material: 'Stainless Steel SS316', actuation: 'Self-Operating Fluid', location: 'High Lift Pumping Main High Point', pidReference: 'PID-HLP-001', failSafePosition: 'Fail Open (FO)', notes: 'Triple-acting air release and vacuum breaker valve.' },
    { id: 'VLV-006', tag: 'VLV-CHL-01', type: 'Control Valve', sizeDN: 80, pressureClassPN: 16, material: 'Hastelloy C / Monel', actuation: 'Pneumatic Actuator', location: 'Chlorine Gas Flow Control', pidReference: 'PID-CHL-001', failSafePosition: 'Fail Closed (FC)', notes: 'Flow-paced dosing control valve linked to SCADA.' }
  ];

  // 3. Fitting Schedule Generation
  const fittingSchedule: FittingScheduleItem[] = [
    { id: 'FIT-001', tag: 'FIT-ELB-90-1200', fittingType: '90° Long Radius Elbow', sizeDN: 1200, material: 'Mild Steel Epoxy Lined', lossCoeffK: 0.25, quantity: 8, processUnit: 'Raw Water Intake Main' },
    { id: 'FIT-002', tag: 'FIT-TEE-1000', fittingType: 'Equal Tee (Branch Flow)', sizeDN: 1000, material: 'Ductile Iron', lossCoeffK: 1.20, quantity: 4, processUnit: 'Aerator Distribution' },
    { id: 'FIT-003', tag: 'FIT-RED-1200x800', fittingType: 'Reducer (Concentric)', sizeDN: 1200, material: 'Ductile Iron', lossCoeffK: 0.15, quantity: 6, processUnit: 'High Lift Suction Header' },
    { id: 'FIT-004', tag: 'FIT-EXP-1200', fittingType: 'Expansion Joint', sizeDN: 1200, material: 'EPDM Rubber Bellow', lossCoeffK: 0.10, quantity: 5, processUnit: 'Pump Station Connections' }
  ];

  return {
    pipeSchedule,
    valveSchedule,
    fittingSchedule,
    totalPipingHeadlossM: Number(sumHeadloss.toFixed(3))
  };
}
