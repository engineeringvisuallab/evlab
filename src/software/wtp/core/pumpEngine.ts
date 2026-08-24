/**
 * EVL WTP Engineering Suite - Pump & Pumping Engine
 * Solves system curves, pump curves, operating points, VFD affinity laws, NPSHa vs NPSHr cavitation, power & parallel/series pump hydraulics.
 */

export interface PumpSpec {
  id: string;
  tag: string;
  name: string;
  processUnit: 'Raw Water Intake' | 'Filter Backwash' | 'High Lift Distribution' | 'Chemical Dosing' | 'Sludge Recirculation';
  type: 'Vertical Turbine' | 'Horizontal Split Case' | 'End Suction Centrifugal' | 'Submersible' | 'Peristaltic Metering';
  numDuty: number;
  numStandby: number;
  flowPerPumpLs: number;
  flowPerPumpM3hr: number;
  ratedHeadM: number;
  shutoffHeadM: number;
  speedRpm: number;
  vfdSpeedRatio: number; // 0.5 to 1.0 (e.g. 1.0 = 100% full speed)
  pumpEfficiencyPercent: number;
  motorEfficiencyPercent: number;
  npshRequiredM: number;
  suctionStaticHeadM: number; // Suction level relative to pump centerline
  suctionLossesM: number;
  waterTempC: number;
  elevationAboveSeaLevelM: number;
  isParallel: boolean;
}

export interface OperatingPointResult {
  operatingFlowM3hr: number;
  operatingFlowLs: number;
  operatingHeadM: number;
  staticHeadM: number;
  frictionHeadM: number;
  hydraulicPowerKw: number;
  shaftPowerKw: number;
  motorPowerKw: number;
  dailyEnergyKwh: number;
  annualEnergyMwh: number;
  operatingEfficiencyPercent: number;
  npshAvailableM: number;
  npshMarginM: number;
  cavitationStatus: 'SAFE' | 'CAVITATION_RISK' | 'CRITICAL';
  bepComplianceStatus: 'BEP_OPTIMAL' | 'ACCEPTABLE' | 'OUTSIDE_OPERATING_RANGE';
  systemCurvePoints: { flowM3hr: number; systemHeadM: number; pumpHeadM: number }[];
}

// --------------------------------------------------------
// NPSH CALCULATOR
// --------------------------------------------------------
export function calculateNPSHAvailable(
  suctionStaticHeadM: number,
  suctionLossesM: number,
  waterTempC: number = 20,
  elevationM: number = 100
): { npshAvailableM: number; atmosphericHeadM: number; vaporPressureHeadM: number } {
  // Atmospheric pressure vs elevation (m H2O)
  const atmHeadM = 10.33 * Math.exp(-0.00012 * elevationM);
  
  // Water vapor pressure vs temperature (m H2O)
  // Vapor pressure at 20C ~ 2.34 kPa -> 0.24 m H2O
  const vaporPressKpa = 0.61078 * Math.exp((17.27 * waterTempC) / (waterTempC + 237.3));
  const vaporHeadM = vaporPressKpa / 9.81;

  // NPSHa = H_atm - H_vap + H_static_suction - h_f_suction
  const npsha = atmHeadM - vaporHeadM + suctionStaticHeadM - suctionLossesM;

  return {
    npshAvailableM: Number(npsha.toFixed(2)),
    atmosphericHeadM: Number(atmHeadM.toFixed(2)),
    vaporPressureHeadM: Number(vaporHeadM.toFixed(2))
  };
}

// --------------------------------------------------------
// OPERATING POINT & SYSTEM CURVE SOLVER
// --------------------------------------------------------
export function solvePumpOperatingPoint(
  pump: PumpSpec,
  totalSystemFrictionCoeffK: number = 0.000008, // H_friction = K * Q_m3hr^2
  staticHeadM: number = 25.0
): OperatingPointResult {
  const vfd = pump.vfdSpeedRatio;
  
  // Adjusted Shutoff Head & Pump Curve via Affinity Laws
  // H_pump = (Shutoff * vfd^2) - A * Q^2
  const effectiveShutoffM = pump.ratedHeadM * 1.25 * (vfd ** 2);
  const ratedFlowM3hr = pump.flowPerPumpM3hr * (pump.isParallel ? pump.numDuty : 1);
  const ratedHeadM = pump.ratedHeadM * (vfd ** 2);

  // Derive A coefficient for H_pump = Shutoff - A * Q^2
  const coeffA = (effectiveShutoffM - ratedHeadM) / (ratedFlowM3hr ** 2);

  // Intersection: EffectiveShutoff - A * Q^2 = StaticHead + K * Q^2
  // Q_oper^2 = (EffectiveShutoff - StaticHead) / (A + K)
  let opFlowM3hr = 0;
  if (effectiveShutoffM > staticHeadM) {
    opFlowM3hr = Math.sqrt((effectiveShutoffM - staticHeadM) / (coeffA + totalSystemFrictionCoeffK));
  }

  const opFlowLs = (opFlowM3hr * 1000) / 3600;
  const frictionHead = totalSystemFrictionCoeffK * (opFlowM3hr ** 2);
  const opHeadM = staticHeadM + frictionHead;

  // Power Calculations
  // P_hyd = (rho * g * Q * H) / 1000  (Q in m3/s, H in m)
  const qM3s = opFlowM3hr / 3600;
  const hydPowerKw = (1000 * 9.81 * qM3s * opHeadM) / 1000;
  
  const opEff = pump.pumpEfficiencyPercent * vfd; // Efficiency scales with VFD
  const shaftPowerKw = hydPowerKw / (opEff / 100);
  const motorPowerKw = shaftPowerKw / (pump.motorEfficiencyPercent / 100);

  const dailyEnergyKwh = motorPowerKw * 24;
  const annualEnergyMwh = (dailyEnergyKwh * 365) / 1000;

  // NPSH Calculations
  const npshRes = calculateNPSHAvailable(pump.suctionStaticHeadM, pump.suctionLossesM, pump.waterTempC, pump.elevationAboveSeaLevelM);
  const npshMargin = npshRes.npshAvailableM - pump.npshRequiredM;

  let cavitationStatus: OperatingPointResult['cavitationStatus'] = 'SAFE';
  if (npshMargin < 0) cavitationStatus = 'CRITICAL';
  else if (npshMargin < 1.0) cavitationStatus = 'CAVITATION_RISK';

  let bepStatus: OperatingPointResult['bepComplianceStatus'] = 'BEP_OPTIMAL';
  const flowRatio = opFlowM3hr / ratedFlowM3hr;
  if (flowRatio < 0.7 || flowRatio > 1.25) bepStatus = 'OUTSIDE_OPERATING_RANGE';
  else if (flowRatio < 0.85 || flowRatio > 1.15) bepStatus = 'ACCEPTABLE';

  // System Curve Points Generation for Plotting
  const systemCurvePoints = [];
  for (let i = 0; i <= 10; i++) {
    const qStep = (ratedFlowM3hr * 1.4 * i) / 10;
    const sysH = staticHeadM + totalSystemFrictionCoeffK * (qStep ** 2);
    const pmpH = Math.max(0, effectiveShutoffM - coeffA * (qStep ** 2));
    systemCurvePoints.push({
      flowM3hr: Number(qStep.toFixed(1)),
      systemHeadM: Number(sysH.toFixed(2)),
      pumpHeadM: Number(pmpH.toFixed(2))
    });
  }

  return {
    operatingFlowM3hr: Number(opFlowM3hr.toFixed(1)),
    operatingFlowLs: Number(opFlowLs.toFixed(1)),
    operatingHeadM: Number(opHeadM.toFixed(2)),
    staticHeadM: Number(staticHeadM.toFixed(2)),
    frictionHeadM: Number(frictionHead.toFixed(2)),
    hydraulicPowerKw: Number(hydPowerKw.toFixed(2)),
    shaftPowerKw: Number(shaftPowerKw.toFixed(2)),
    motorPowerKw: Number(motorPowerKw.toFixed(2)),
    dailyEnergyKwh: Number(dailyEnergyKwh.toFixed(1)),
    annualEnergyMwh: Number(annualEnergyMwh.toFixed(1)),
    operatingEfficiencyPercent: Number(opEff.toFixed(1)),
    npshAvailableM: npshRes.npshAvailableM,
    npshMarginM: Number(npshMargin.toFixed(2)),
    cavitationStatus,
    bepComplianceStatus: bepStatus,
    systemCurvePoints
  };
}
