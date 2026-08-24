import { CalculatedWtpState } from './dependencyEngine';

export interface OpexEnergyBreakdown {
  pumpEnergyKwhDay: number;
  blowerEnergyKwhDay: number;
  mixerEnergyKwhDay: number;
  dewateringEnergyKwhDay: number;
  hvacAndLightingKwhDay: number;
  totalEnergyKwhDay: number;
  unitEnergyCostUsdKwh: number;
  dailyEnergyCostUSD: number;
}

export interface OpexChemicalBreakdown {
  alumKgDay: number;
  alumCostUSD: number;
  limeKgDay: number;
  limeCostUSD: number;
  chlorineKgDay: number;
  chlorineCostUSD: number;
  polymerKgDay: number;
  polymerCostUSD: number;
  totalDailyChemicalCostUSD: number;
}

export interface OpexMaintenanceBreakdown {
  mechanicalMaintCostUSDPerYear: number;
  electricalMaintCostUSDPerYear: number;
  instrumentationMaintCostUSDPerYear: number;
  civilMaintCostUSDPerYear: number;
  totalAnnualMaintenanceUSD: number;
  dailyMaintenanceUSD: number;
}

export interface OpexLabourBreakdown {
  operatorsHeadcount: number;
  techniciansHeadcount: number;
  engineersHeadcount: number;
  securityHeadcount: number;
  adminHeadcount: number;
  totalHeadcount: number;
  totalAnnualLabourCostUSD: number;
  dailyLabourCostUSD: number;
}

export interface OpexSludgeBreakdown {
  dailyCakeM3Day: number;
  haulingTransportCostUSDDay: number;
  landfillDisposalFeeUSDDay: number;
  totalDailySludgeDisposalCostUSD: number;
}

export interface WtpOpexResult {
  energy: OpexEnergyBreakdown;
  chemicals: OpexChemicalBreakdown;
  maintenance: OpexMaintenanceBreakdown;
  labour: OpexLabourBreakdown;
  sludge: OpexSludgeBreakdown;
  
  // Total Summaries
  totalDailyOpexUSD: number;
  totalMonthlyOpexUSD: number;
  totalAnnualOpexUSD: number;
  
  // Normalized Unit Costs
  opexCostPerM3TreatedUSD: number;
  opexCostPerMldUSD: number;
  
  // Currency Converted Total (e.g. BDT)
  currencyCode: string;
  exchangeRateToUSD: number;
  totalAnnualOpexLocalCurrency: number;
  opexCostPerM3LocalCurrency: number;
}

/**
 * EVL WTP Engineering Suite - OPEX Calculation Engine
 * Comprehensive operational expenditure engine tracking energy, chemicals, maintenance, labour & sludge disposal.
 */
export function calculateWtpOpex(
  state: CalculatedWtpState,
  options?: {
    electricityTariffUsdKwh?: number;
    alumPriceUsdKg?: number;
    limePriceUsdKg?: number;
    chlorinePriceUsdKg?: number;
    polymerPriceUsdKg?: number;
    exchangeRateBdtPerUsd?: number;
  }
): WtpOpexResult {
  const capMld = state.plantCapacityMLD;
  const flowM3Day = capMld * 1000;

  // Tariff & Pricing defaults (USD)
  const tariffUsdKwh = options?.electricityTariffUsdKwh ?? 0.12;
  const alumUsdKg = options?.alumPriceUsdKg ?? 0.35;
  const limeUsdKg = options?.limePriceUsdKg ?? 0.18;
  const chlorineUsdKg = options?.chlorinePriceUsdKg ?? 1.20;
  const polymerUsdKg = options?.polymerPriceUsdKg ?? 4.50;
  const bdtExchangeRate = options?.exchangeRateBdtPerUsd ?? 118.0;

  // 1. Energy Calculation
  const pumpKwhDay = Math.round(1800 + capMld * 180);
  const blowerKwhDay = Math.round(350 + capMld * 25);
  const mixerKwhDay = Math.round(120 + capMld * 8);
  const dewateringKwhDay = Math.round(180 + capMld * 15);
  const hvacKwhDay = Math.round(150 + capMld * 10);
  const totalKwhDay = pumpKwhDay + blowerKwhDay + mixerKwhDay + dewateringKwhDay + hvacKwhDay;
  const dailyEnergyUsd = Number((totalKwhDay * tariffUsdKwh).toFixed(2));

  const energy: OpexEnergyBreakdown = {
    pumpEnergyKwhDay: pumpKwhDay,
    blowerEnergyKwhDay: blowerKwhDay,
    mixerEnergyKwhDay: mixerKwhDay,
    dewateringEnergyKwhDay: dewateringKwhDay,
    hvacAndLightingKwhDay: hvacKwhDay,
    totalEnergyKwhDay: totalKwhDay,
    unitEnergyCostUsdKwh: tariffUsdKwh,
    dailyEnergyCostUSD: dailyEnergyUsd
  };

  // 2. Chemicals Calculation
  const alumKgDay = Math.round(flowM3Day * 0.035); // 35 mg/L
  const limeKgDay = Math.round(flowM3Day * 0.012); // 12 mg/L
  const chlorineKgDay = Math.round(flowM3Day * 0.0035); // 3.5 mg/L
  const polymerKgDay = Math.round(capMld * 0.85 * 3.5); // 3.5 kg/ton DS

  const alumCostUsd = Number((alumKgDay * alumUsdKg).toFixed(2));
  const limeCostUsd = Number((limeKgDay * limeUsdKg).toFixed(2));
  const chlorineCostUsd = Number((chlorineKgDay * chlorineUsdKg).toFixed(2));
  const polymerCostUsd = Number((polymerKgDay * polymerUsdKg).toFixed(2));
  const dailyChemUsd = Number((alumCostUsd + limeCostUsd + chlorineCostUsd + polymerCostUsd).toFixed(2));

  const chemicals: OpexChemicalBreakdown = {
    alumKgDay,
    alumCostUSD: alumCostUsd,
    limeKgDay,
    limeCostUSD: limeCostUsd,
    chlorineKgDay,
    chlorineCostUSD: chlorineCostUsd,
    polymerKgDay,
    polymerCostUSD: polymerCostUsd,
    totalDailyChemicalCostUSD: dailyChemUsd
  };

  // 3. Maintenance (% of Capital Cost per year)
  const totalCapex = state.totalCapexUSD;
  const mechMaintAnnual = Number((totalCapex * 0.35 * 0.03).toFixed(2)); // 3% of mech capex
  const elecMaintAnnual = Number((totalCapex * 0.15 * 0.025).toFixed(2)); // 2.5% of elec capex
  const instMaintAnnual = Number((totalCapex * 0.08 * 0.04).toFixed(2)); // 4% of inst capex
  const civilMaintAnnual = Number((totalCapex * 0.42 * 0.008).toFixed(2)); // 0.8% of civil capex
  const totalAnnualMaintUsd = mechMaintAnnual + elecMaintAnnual + instMaintAnnual + civilMaintAnnual;
  const dailyMaintUsd = Number((totalAnnualMaintUsd / 365).toFixed(2));

  const maintenance: OpexMaintenanceBreakdown = {
    mechanicalMaintCostUSDPerYear: mechMaintAnnual,
    electricalMaintCostUSDPerYear: elecMaintAnnual,
    instrumentationMaintCostUSDPerYear: instMaintAnnual,
    civilMaintCostUSDPerYear: civilMaintAnnual,
    totalAnnualMaintenanceUSD: totalAnnualMaintUsd,
    dailyMaintenanceUSD: dailyMaintUsd
  };

  // 4. Labour
  const ops = Math.max(4, Math.round(2 + capMld * 0.1));
  const tech = Math.max(2, Math.round(1 + capMld * 0.05));
  const eng = 2;
  const sec = 4;
  const admin = 2;
  const totalHeadcount = ops + tech + eng + sec + admin;
  const avgAnnualSalaryUsd = 9000; // Local benchmark rate
  const annualLabourUsd = totalHeadcount * avgAnnualSalaryUsd;
  const dailyLabourUsd = Number((annualLabourUsd / 365).toFixed(2));

  const labour: OpexLabourBreakdown = {
    operatorsHeadcount: ops,
    techniciansHeadcount: tech,
    engineersHeadcount: eng,
    securityHeadcount: sec,
    adminHeadcount: admin,
    totalHeadcount,
    totalAnnualLabourCostUSD: annualLabourUsd,
    dailyLabourCostUSD: dailyLabourUsd
  };

  // 5. Sludge Disposal
  const dailyCakeM3 = Number((capMld * 0.22).toFixed(1));
  const haulingCostUsd = Number((dailyCakeM3 * 18.0).toFixed(2)); // $18/m3 transport
  const landfillCostUsd = Number((dailyCakeM3 * 12.0).toFixed(2)); // $12/m3 landfill fee
  const dailySludgeUsd = Number((haulingCostUsd + landfillCostUsd).toFixed(2));

  const sludge: OpexSludgeBreakdown = {
    dailyCakeM3Day: dailyCakeM3,
    haulingTransportCostUSDDay: haulingCostUsd,
    landfillDisposalFeeUSDDay: landfillCostUsd,
    totalDailySludgeDisposalCostUSD: dailySludgeUsd
  };

  // Total OPEX Summaries
  const totalDailyOpexUSD = Number((dailyEnergyUsd + dailyChemUsd + dailyMaintUsd + dailyLabourUsd + dailySludgeUsd).toFixed(2));
  const totalMonthlyOpexUSD = Number((totalDailyOpexUSD * 30.416).toFixed(2));
  const totalAnnualOpexUSD = Number((totalDailyOpexUSD * 365).toFixed(2));

  const opexCostPerM3TreatedUSD = Number((totalDailyOpexUSD / flowM3Day).toFixed(4));
  const opexCostPerMldUSD = Number((totalDailyOpexUSD / capMld).toFixed(2));

  // Local Currency (BDT) Conversion
  const totalAnnualOpexLocalCurrency = Number((totalAnnualOpexUSD * bdtExchangeRate).toFixed(2));
  const opexCostPerM3LocalCurrency = Number((opexCostPerM3TreatedUSD * bdtExchangeRate).toFixed(2));

  return {
    energy,
    chemicals,
    maintenance,
    labour,
    sludge,
    totalDailyOpexUSD,
    totalMonthlyOpexUSD,
    totalAnnualOpexUSD,
    opexCostPerM3TreatedUSD,
    opexCostPerMldUSD,
    currencyCode: 'BDT',
    exchangeRateToUSD: bdtExchangeRate,
    totalAnnualOpexLocalCurrency,
    opexCostPerM3LocalCurrency
  };
}
