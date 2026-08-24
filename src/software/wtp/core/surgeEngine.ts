/**
 * EVL WTP Engineering Suite - Surge & Transient Engine
 * Implements Joukowsky water hammer analysis, wave celerity, critical closure time, pump trip transient, and surge protection evaluation.
 */

import { PipeMaterialSpec, getPipeMaterialByCode } from './pipeMaterialRegistry';

export interface SurgeAnalysisResult {
  pipeLengthM: number;
  pipeDiameterMm: number;
  pipeThicknessMm: number;
  materialCode: string;
  initialVelocityMs: number;
  initialPressureBar: number;
  pipePressureRatingBar: number;
  
  // Wave Celerity & Transient Parameters
  waveCelerityMs: number;
  criticalClosureTimeSec: number;
  actualClosureTimeSec: number;
  isSuddenClosure: boolean;
  
  // Pressure Rise
  joukowskySurgeHeadM: number;
  joukowskySurgePressureBar: number;
  peakTotalPressureBar: number;
  minimumPressureBar: number;
  subAtmosphericVacuumRisk: boolean;
  
  // Validation
  complianceStatus: 'PASS' | 'WARNING' | 'FAIL';
  surgeProtectionRecommendation: string;
}

export function performJoukowskySurgeAnalysis(
  pipeLengthM: number = 1200,
  pipeDiameterMm: number = 700,
  pipeThicknessMm: number = 10,
  materialCode: string = 'DI',
  initialVelocityMs: number = 1.5,
  initialPressureBar: number = 4.5,
  pipePressureRatingBar: number = 16,
  closureTimeSec: number = 1.5
): SurgeAnalysisResult {
  const material = getPipeMaterialByCode(materialCode);
  
  // Fluid properties of water
  const rho = 1000; // kg/m3
  const bulkModulusK = 2.15e9; // Pa (2.15 GPa for water)
  const pipeElasticModulusE = material.elasticModulusGPa * 1e9; // Pa

  const dM = pipeDiameterMm / 1000;
  const eM = pipeThicknessMm / 1000;

  // Wave Celerity: a = sqrt( (K / rho) / (1 + (K * D) / (E * e)) )
  const denominator = 1 + (bulkModulusK * dM) / (pipeElasticModulusE * eM);
  const waveCelerityMs = Math.sqrt((bulkModulusK / rho) / denominator);

  // Critical Reflection Time: T_c = 2 * L / a
  const criticalTimeSec = (2 * pipeLengthM) / waveCelerityMs;
  const isSuddenClosure = closureTimeSec <= criticalTimeSec;

  // Velocity Change: deltaV = V_initial (for complete stoppage)
  const deltaV = initialVelocityMs;

  // Joukowsky Surge Head Rise: deltaH = (a * deltaV) / g
  let surgeHeadM = (waveCelerityMs * deltaV) / 9.81;

  // If closure time > critical time, apply attenuation ratio T_c / T_close
  if (!isSuddenClosure) {
    surgeHeadM = surgeHeadM * (criticalTimeSec / closureTimeSec);
  }

  const surgePressureBar = surgeHeadM / 10.197; // 1 bar = 10.197 m H2O
  const peakTotalPressureBar = initialPressureBar + surgePressureBar;
  const minPressureBar = initialPressureBar - surgePressureBar;
  const vacuumRisk = minPressureBar < -0.8; // Sub-atmospheric pressure risk

  let status: SurgeAnalysisResult['complianceStatus'] = 'PASS';
  let recommendation = 'Standard air release & vacuum breaker valves installed at high points.';

  if (peakTotalPressureBar > pipePressureRatingBar) {
    status = 'FAIL';
    recommendation = '🔴 CRITICAL: Transient pressure exceeds pipe rating! Install Air Vessel (Hydropneumatic surge tank) or Pressure Relief Valve + VFD ramp down.';
  } else if (vacuumRisk || peakTotalPressureBar > pipePressureRatingBar * 0.8) {
    status = 'WARNING';
    recommendation = '⚠️ WARNING: High surge potential or sub-atmospheric pressure. Install combination air release & vacuum breaker valves + slow closing check valves.';
  }

  return {
    pipeLengthM,
    pipeDiameterMm,
    pipeThicknessMm,
    materialCode,
    initialVelocityMs,
    initialPressureBar,
    pipePressureRatingBar,
    waveCelerityMs: Math.round(waveCelerityMs),
    criticalClosureTimeSec: Number(criticalTimeSec.toFixed(2)),
    actualClosureTimeSec: closureTimeSec,
    isSuddenClosure,
    joukowskySurgeHeadM: Number(surgeHeadM.toFixed(1)),
    joukowskySurgePressureBar: Number(surgePressureBar.toFixed(2)),
    peakTotalPressureBar: Number(peakTotalPressureBar.toFixed(2)),
    minimumPressureBar: Number(minPressureBar.toFixed(2)),
    subAtmosphericVacuumRisk: vacuumRisk,
    complianceStatus: status,
    surgeProtectionRecommendation: recommendation
  };
}
