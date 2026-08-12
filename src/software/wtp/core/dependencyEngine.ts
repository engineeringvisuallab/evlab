/**
 * EVL WTP Engineering Suite - Central Parameter Dependency Engine
 * Automatically propagates parameter updates through the entire WTP design tree
 */

export interface CalculatedWtpState {
  plantCapacityMLD: number;
  flowM3hr: number;
  m3hrFlow: number;
  flowLs: number;
  flowM3s: number;

  // Raw water intake & screening
  coarseScreenAreaM2: number;
  fineScreenAreaM2: number;
  screenHeadLossM: number;

  // Aeration
  aeratorTrayAreaM2: number;
  oxygenTransferKgHr: number;
  cascadeDiameterM: number;
  cascadeSteps: number;

  // Coagulation
  rapidMixVolumeM3: number;
  rapidMixPowerKw: number;
  flashMixerPowerKw: number;
  flashMixerG: number;
  flashMixerDetentionSec: number;
  alumConsumptionKgDay: number;
  alumDoseMgL: number;
  limeConsumptionKgDay: number;
  limeDoseMgL: number;

  // Flocculation
  flocculationVolumeM3: number;
  flocculatorVolumeM3: number;
  flocculatorPowerKw: number;
  flocculatorBasins: number;
  flocculatorDetentionMin: number;

  // Sedimentation
  clarifierAreaM2: number;
  clarifierPlanAreaM2: number;
  clarifierVolumeM3: number;
  clarifierSOR: number;
  weirLengthM: number;

  // Filtration
  totalFilterAreaM2: number;
  numberOfFilters: number;
  areaPerFilterM2: number;
  filtrationRateM3M2Hr: number;
  backwashFlowM3hr: number;

  // Disinfection
  chlorineConsumptionKgDay: number;
  chlorineDoseMgL: number;
  contactTankVolumeM3: number;

  // Reservoir
  cwrVolumeM3: number;

  // Pumping
  rawPumpPowerKw: number;
  highLiftPumpPowerKw: number;

  // Sludge
  drySludgeKgDay: number;
  wetSludgeM3Day: number;

  // Energy & Power
  totalConnectedLoadKw: number;
  totalDemandLoadKw: number;
  transformerKva: number;
  generatorKva: number;
  specificEnergyKwhM3: number;

  // Cost Estimate
  totalCapexUSD: number;
  annualOpexUSD: number;
}

export function recalculateAllWtpDependents(
  projectCapacityMLD: number,
  overrides: Record<string, number> = {}
): CalculatedWtpState {
  const cap = Math.max(0.1, projectCapacityMLD);

  // Flows
  const flowM3hr = (cap * 1000) / 24;
  const flowLs = (cap * 1000000) / 86400;
  const flowM3s = flowLs / 1000;

  // Intake Screening
  const v_app = overrides['v_app'] || 0.6;
  const coarseScreenAreaM2 = flowM3s / (v_app * 0.7);
  const fineScreenAreaM2 = flowM3s / (v_app * 0.5);
  const screenHeadLossM = 0.08 * (v_app / 0.6) ** 2;

  // Aeration
  const alr = overrides['alr'] || 0.03; // m3/m2-hr
  const aeratorTrayAreaM2 = flowM3hr * alr;
  const fe_raw = overrides['fe_raw'] || 1.8;
  const oxygenTransferKgHr = (flowM3hr * (fe_raw * 0.14)) / 1000;
  const cascadeDiameterM = Math.sqrt((flowM3hr / 35) * (4 / Math.PI));
  const cascadeSteps = 5;

  // Coagulation (Rapid Mix)
  const detentionSec = overrides['t_rm'] || 45;
  const rapidMixVolumeM3 = (flowM3s * detentionSec);
  const g_rm = overrides['g_rm'] || 800;
  const rapidMixPowerKw = (0.001 * rapidMixVolumeM3 * (g_rm ** 2)) / 1000;

  const alumDose = overrides['alum_dose'] || 35; // mg/L
  const alumConsumptionKgDay = (cap * 1000 * alumDose) / 1000;
  const limeDose = overrides['lime_dose'] || 12; // mg/L
  const limeConsumptionKgDay = (cap * 1000 * limeDose) / 1000;

  // Flocculation
  const flocDetentionMin = overrides['t_floc'] || 25;
  const flocculationVolumeM3 = (flowM3hr * (flocDetentionMin / 60));
  const flocculatorPowerKw = flocculationVolumeM3 * 0.025; // approx 25W/m3
  const flocculatorBasins = Math.max(2, Math.ceil(cap / 25));

  // Sedimentation
  const sor = overrides['sor'] || 1.25; // m3/m2-hr
  const clarifierAreaM2 = flowM3hr / sor;
  const clarifierVolumeM3 = clarifierAreaM2 * 3.5; // depth 3.5m
  const weirLoading = overrides['wlr'] || 10.0; // m3/m-hr
  const weirLengthM = flowM3hr / weirLoading;

  // Filtration
  const filtRate = overrides['v_filt'] || 6.0; // m3/m2-hr
  const totalFilterAreaM2 = flowM3hr / filtRate;
  const numFilters = Math.max(2, Math.ceil(Math.sqrt(cap) * 0.8));
  const areaPerFilterM2 = totalFilterAreaM2 / numFilters;
  const bwRate = overrides['v_bw'] || 36.0;
  const backwashFlowM3hr = areaPerFilterM2 * bwRate;

  // Disinfection
  const cl2Dose = overrides['cl2_dose'] || 3.5;
  const chlorineConsumptionKgDay = (cap * 1000 * cl2Dose) / 1000;
  const cttMinutes = overrides['t_contact'] || 30;
  const contactTankVolumeM3 = flowM3hr * (cttMinutes / 60);

  // Clear Water Reservoir
  const cwrStorageHours = overrides['t_cwr'] || 8.0;
  const cwrVolumeM3 = flowM3hr * cwrStorageHours;

  // Pumping Power
  const rawHeadM = overrides['tdh_raw'] || 28.5;
  const rawPumpPowerKw = (flowLs * 9.81 * rawHeadM) / (10 * 75); // 75% efficiency
  const highLiftHeadM = overrides['tdh_hl'] || 55.0;
  const highLiftPumpPowerKw = (flowLs * 9.81 * highLiftHeadM) / (10 * 78);

  // Sludge
  const tssRaw = overrides['tss_raw'] || 120;
  const drySludgeKgDay = cap * 1000 * (tssRaw * 0.9 + 0.26 * alumDose) / 1000;
  const wetSludgeM3Day = drySludgeKgDay / (1000 * 0.03); // 3% sludge solids

  // Electrical Load
  const totalConnectedLoadKw = (rawPumpPowerKw + highLiftPumpPowerKw + rapidMixPowerKw + flocculatorPowerKw + 45.0) * 1.25;
  const totalDemandLoadKw = totalConnectedLoadKw * 0.82;
  const transformerKva = totalDemandLoadKw / (0.88 * 0.90);
  const generatorKva = transformerKva * 1.15;
  const dailyKwh = totalDemandLoadKw * 24;
  const specificEnergyKwhM3 = dailyKwh / (cap * 1000);

  // Cost Scaling
  const baseCivilCostUSD = 8000000 * (cap / 50) ** 0.68;
  const baseMechCostUSD = 6500000 * (cap / 50) ** 0.72;
  const baseElecCostUSD = 2800000 * (cap / 50) ** 0.65;
  const baseInstCostUSD = 1200000 * (cap / 50) ** 0.60;

  const totalCapexUSD = baseCivilCostUSD + baseMechCostUSD + baseElecCostUSD + baseInstCostUSD;
  const annualOpexUSD = (dailyKwh * 365 * 0.12) + (alumConsumptionKgDay * 365 * 0.25) + (totalCapexUSD * 0.02);

  return {
    plantCapacityMLD: cap,
    flowM3hr: Number(flowM3hr.toFixed(2)),
    m3hrFlow: Number(flowM3hr.toFixed(2)),
    flowLs: Number(flowLs.toFixed(2)),
    flowM3s: Number(flowM3s.toFixed(3)),
    coarseScreenAreaM2: Number(coarseScreenAreaM2.toFixed(2)),
    fineScreenAreaM2: Number(fineScreenAreaM2.toFixed(2)),
    screenHeadLossM: Number(screenHeadLossM.toFixed(3)),
    aeratorTrayAreaM2: Number(aeratorTrayAreaM2.toFixed(2)),
    oxygenTransferKgHr: Number(oxygenTransferKgHr.toFixed(2)),
    cascadeDiameterM: Number(cascadeDiameterM.toFixed(2)),
    cascadeSteps,
    rapidMixVolumeM3: Number(rapidMixVolumeM3.toFixed(2)),
    rapidMixPowerKw: Number(rapidMixPowerKw.toFixed(2)),
    flashMixerPowerKw: Number(rapidMixPowerKw.toFixed(2)),
    flashMixerG: g_rm,
    flashMixerDetentionSec: detentionSec,
    alumConsumptionKgDay: Number(alumConsumptionKgDay.toFixed(1)),
    alumDoseMgL: alumDose,
    limeConsumptionKgDay: Number(limeConsumptionKgDay.toFixed(1)),
    limeDoseMgL: limeDose,
    flocculationVolumeM3: Number(flocculationVolumeM3.toFixed(2)),
    flocculatorVolumeM3: Number(flocculationVolumeM3.toFixed(2)),
    flocculatorPowerKw: Number(flocculatorPowerKw.toFixed(2)),
    flocculatorBasins,
    flocculatorDetentionMin: flocDetentionMin,
    clarifierAreaM2: Number(clarifierAreaM2.toFixed(2)),
    clarifierPlanAreaM2: Number(clarifierAreaM2.toFixed(2)),
    clarifierVolumeM3: Number(clarifierVolumeM3.toFixed(2)),
    clarifierSOR: sor,
    weirLengthM: Number(weirLengthM.toFixed(2)),
    totalFilterAreaM2: Number(totalFilterAreaM2.toFixed(2)),
    numberOfFilters: numFilters,
    areaPerFilterM2: Number(areaPerFilterM2.toFixed(2)),
    filtrationRateM3M2Hr: filtRate,
    backwashFlowM3hr: Number(backwashFlowM3hr.toFixed(2)),
    chlorineConsumptionKgDay: Number(chlorineConsumptionKgDay.toFixed(1)),
    chlorineDoseMgL: cl2Dose,
    contactTankVolumeM3: Number(contactTankVolumeM3.toFixed(2)),
    cwrVolumeM3: Number(cwrVolumeM3.toFixed(2)),
    rawPumpPowerKw: Number(rawPumpPowerKw.toFixed(1)),
    highLiftPumpPowerKw: Number(highLiftPumpPowerKw.toFixed(1)),
    drySludgeKgDay: Number(drySludgeKgDay.toFixed(1)),
    wetSludgeM3Day: Number(wetSludgeM3Day.toFixed(1)),
    totalConnectedLoadKw: Number(totalConnectedLoadKw.toFixed(1)),
    totalDemandLoadKw: Number(totalDemandLoadKw.toFixed(1)),
    transformerKva: Number(transformerKva.toFixed(0)),
    generatorKva: Number(generatorKva.toFixed(0)),
    specificEnergyKwhM3: Number(specificEnergyKwhM3.toFixed(3)),
    totalCapexUSD: Number(totalCapexUSD.toFixed(0)),
    annualOpexUSD: Number(annualOpexUSD.toFixed(0))
  };
}

export const calculateWtpState = recalculateAllWtpDependents;
