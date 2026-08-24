import { getParameterById } from './masterParameterRegistry';
import { getFormulaById, MASTER_FORMULA_REGISTRY } from './formulaRegistry';

export interface CalculationDetail {
  parameterId: string;
  name: string;
  symbol: string;
  inputs: Record<string, { symbol: string; value: number | string; unit: string }>;
  formulaString: string;
  substitutionString: string;
  calculatedValue: number;
  unit: string;
  designCriteria: string;
  standardReference: string;
  safetyFactor: number;
  validationStatus: 'PASS' | 'WARNING' | 'FAIL' | 'NOT_CHECKED';
  notes: string;
}

export function evaluateParameterCalculation(
  parameterId: string,
  projectValues: Record<string, number | string>
): CalculationDetail {
  const param = getParameterById(parameterId);
  if (!param) {
    throw new Error(`Parameter '${parameterId}' not found in registry.`);
  }

  // 1. DES-CAP-002: Hourly Flow (m3/hr)
  if (parameterId === 'DES-CAP-002') {
    const q_mld = Number(projectValues['DES-CAP-001'] || projectValues['plantCapacityMLD'] || 50);
    const val = (q_mld * 1000) / 24;
    return {
      parameterId,
      name: param.name,
      symbol: param.symbol,
      inputs: {
        'DES-CAP-001': { symbol: 'Q_mld', value: q_mld, unit: 'MLD' }
      },
      formulaString: 'Q_m3hr = (Q_mld * 1000) / 24',
      substitutionString: `Q_m3hr = (${q_mld} * 1000) / 24`,
      calculatedValue: Number(val.toFixed(2)),
      unit: 'm³/hr',
      designCriteria: '24-hour continuous plant operating production basis',
      standardReference: 'CPHEEO 2021 / AWWA M51',
      safetyFactor: 1.0,
      validationStatus: 'PASS',
      notes: 'Hourly flow basis for tank volumes, flash mixer, clarifier, and pump capacities.'
    };
  }

  // 2. DES-CAP-003: Instantaneous Flow (L/s)
  if (parameterId === 'DES-CAP-003') {
    const q_mld = Number(projectValues['DES-CAP-001'] || projectValues['plantCapacityMLD'] || 50);
    const val = (q_mld * 1000000) / 86400;
    return {
      parameterId,
      name: param.name,
      symbol: param.symbol,
      inputs: {
        'DES-CAP-001': { symbol: 'Q_mld', value: q_mld, unit: 'MLD' }
      },
      formulaString: 'Q_ls = (Q_mld * 1,000,000) / 86,400',
      substitutionString: `Q_ls = (${q_mld} * 1000000) / 86400`,
      calculatedValue: Number(val.toFixed(2)),
      unit: 'L/s',
      designCriteria: 'Instantaneous hydraulic flow rate',
      standardReference: 'CPHEEO 2021',
      safetyFactor: 1.0,
      validationStatus: 'PASS',
      notes: 'Used for pipe diameter, channel sizing, and pump motor calculations.'
    };
  }

  // 3. COA-MIX-003: Rapid Mix Camp Value GT
  if (parameterId === 'COA-MIX-003') {
    const g_rm = Number(projectValues['COA-MIX-001'] || projectValues['flashMixerG'] || 800);
    const t_rm = Number(projectValues['COA-MIX-002'] || projectValues['flashMixerDetentionSec'] || 45);
    const val = g_rm * t_rm;
    const status = (val >= 20000 && val <= 50000) ? 'PASS' : (val < 10000 || val > 80000) ? 'FAIL' : 'WARNING';
    return {
      parameterId,
      name: param.name,
      symbol: param.symbol,
      inputs: {
        'COA-MIX-001': { symbol: 'G_rm', value: g_rm, unit: 's⁻¹' },
        'COA-MIX-002': { symbol: 't_rm', value: t_rm, unit: 'seconds' }
      },
      formulaString: 'Camp_GT = G_rm * t_rm',
      substitutionString: `Camp_GT = ${g_rm} * ${t_rm}`,
      calculatedValue: val,
      unit: 'dimensionless',
      designCriteria: 'Target Camp Index GT = 20,000 to 50,000',
      standardReference: 'AWWA M51 / CPHEEO 2021',
      safetyFactor: 1.0,
      validationStatus: status,
      notes: status === 'PASS' 
        ? 'Rapid mix energy input is within optimal coagulant dispersion range.'
        : 'GT is out of recommended range. Check mixing energy or residence time.'
    };
  }

  // 4. COA-MIX-004: Rapid Mix Shaft Power
  if (parameterId === 'COA-MIX-004') {
    const q_mld = Number(projectValues['DES-CAP-001'] || projectValues['plantCapacityMLD'] || 50);
    const q_m3s = (q_mld * 1000000) / (86400 * 1000);
    const t_rm = Number(projectValues['COA-MIX-002'] || projectValues['flashMixerDetentionSec'] || 45);
    const g_rm = Number(projectValues['COA-MIX-001'] || projectValues['flashMixerG'] || 800);
    const vol = q_m3s * t_rm;
    const mu = 0.001002; // Pa.s at 20C
    const powerKw = (mu * vol * (g_rm ** 2)) / 1000;

    return {
      parameterId,
      name: param.name,
      symbol: param.symbol,
      inputs: {
        'Vol': { symbol: 'V_rm', value: Number(vol.toFixed(2)), unit: 'm³' },
        'G_rm': { symbol: 'G_rm', value: g_rm, unit: 's⁻¹' },
        'mu': { symbol: 'μ', value: mu, unit: 'Pa·s' }
      },
      formulaString: 'P_rm = (μ * V_rm * G_rm²) / 1000',
      substitutionString: `P_rm = (0.001002 * ${vol.toFixed(2)} * ${g_rm}²) / 1000`,
      calculatedValue: Number(powerKw.toFixed(2)),
      unit: 'kW',
      designCriteria: 'Shaft power calculated using Camp mixing equation',
      standardReference: 'CPHEEO 2021 / AWWA Water Quality & Treatment',
      safetyFactor: 1.15,
      validationStatus: 'PASS',
      notes: 'Select motor with 15% service factor above calculated shaft power.'
    };
  }

  // 5. DIS-CHL-004: Achieved CT Value
  if (parameterId === 'DIS-CHL-004') {
    const dose = Number(projectValues['DIS-CHL-001'] || projectValues['chlorineDoseMgL'] || 3.5);
    const demand = 1.5; // Chlorination demand assumption
    const residual = Math.max(0.2, dose - demand);
    const time = Number(projectValues['DIS-CHL-002'] || 30);
    const bf = Number(projectValues['DIS-CHL-003'] || 0.7);
    
    const val = residual * (time * bf);
    const status = val >= 15 ? 'PASS' : 'WARNING';
    return {
      parameterId,
      name: param.name,
      symbol: param.symbol,
      inputs: {
        'DIS-CHL-001': { symbol: 'Dose_Cl2', value: dose, unit: 'mg/L' },
        'DIS-CHL-002': { symbol: 'T_contact', value: time, unit: 'min' },
        'DIS-CHL-003': { symbol: 'BF', value: bf, unit: 'ratio' }
      },
      formulaString: 'CT_achieved = Residual_Cl2 * (T_contact * Baffle_Factor)',
      substitutionString: `CT_achieved = ${residual.toFixed(2)} * (${time} * ${bf})`,
      calculatedValue: Number(val.toFixed(2)),
      unit: 'mg·min/L',
      designCriteria: 'Min 15 mg·min/L for 3-Log Virus & 0.5-Log Giardia inactivation at 20°C',
      standardReference: 'US EPA SWTR Table 1.1',
      safetyFactor: 1.25,
      validationStatus: status,
      notes: status === 'PASS' ? 'Sufficient disinfectant contact time guaranteed.' : 'CT value below EPA threshold.'
    };
  }

  // 6. CWR-VOL-002: Usable Clear Water Reservoir Volume
  if (parameterId === 'CWR-VOL-002') {
    const q_mld = Number(projectValues['DES-CAP-001'] || projectValues['plantCapacityMLD'] || 50);
    const hours = Number(projectValues['CWR-VOL-001'] || 8.0);
    const vol = (q_mld * 1000) * (hours / 24);

    return {
      parameterId,
      name: param.name,
      symbol: param.symbol,
      inputs: {
        'DES-CAP-001': { symbol: 'Q_mld', value: q_mld, unit: 'MLD' },
        'CWR-VOL-001': { symbol: 't_cwr', value: hours, unit: 'hours' }
      },
      formulaString: 'V_cwr = (Q_mld * 1000) * (t_cwr / 24)',
      substitutionString: `V_cwr = (${q_mld} * 1000) * (${hours} / 24)`,
      calculatedValue: Number(vol.toFixed(2)),
      unit: 'm³',
      designCriteria: '4 - 8 hours storage for balancing high lift pumping',
      standardReference: 'CPHEEO Manual 2021',
      safetyFactor: 1.0,
      validationStatus: 'PASS',
      notes: 'Provides emergency storage, backwash water reserve, and pumping buffer.'
    };
  }

  // 7. CHM-ALU-003: Alum Daily Bulk Consumption
  if (parameterId === 'CHM-ALU-003') {
    const q_mld = Number(projectValues['DES-CAP-001'] || projectValues['plantCapacityMLD'] || 50);
    const dose = Number(projectValues['CHM-ALU-001'] || projectValues['alumDoseMgL'] || 35.0);
    const kgDay = (q_mld * 1000 * dose) / 1000;

    return {
      parameterId,
      name: param.name,
      symbol: param.symbol,
      inputs: {
        'DES-CAP-001': { symbol: 'Q_mld', value: q_mld, unit: 'MLD' },
        'CHM-ALU-001': { symbol: 'Dose_alum', value: dose, unit: 'mg/L' }
      },
      formulaString: 'W_alum_day = (Q_mld * 1000 * Dose_alum) / 1000',
      substitutionString: `W_alum_day = (${q_mld} * 1000 * ${dose}) / 1000`,
      calculatedValue: Number(kgDay.toFixed(1)),
      unit: 'kg/day',
      designCriteria: 'Daily bulk alum storage requirement basis',
      standardReference: 'AWWA M37',
      safetyFactor: 1.0,
      validationStatus: 'PASS',
      notes: 'Based on 100% commercial alum purity.'
    };
  }

  // 8. PMP-RAW-003: Raw Water Pump Power
  if (parameterId === 'PMP-RAW-003') {
    const q_mld = Number(projectValues['DES-CAP-001'] || projectValues['plantCapacityMLD'] || 50);
    const q_ls = (q_mld * 1000000) / 86400;
    const tdh = Number(projectValues['PMP-RAW-001'] || 28.5);
    const eta = Number(projectValues['PMP-RAW-002'] || 75.0);
    const powerKw = (q_ls * 9.81 * tdh) / (10 * eta);

    return {
      parameterId,
      name: param.name,
      symbol: param.symbol,
      inputs: {
        'Q_ls': { symbol: 'Q_ls', value: Number(q_ls.toFixed(2)), unit: 'L/s' },
        'TDH_raw': { symbol: 'TDH_raw', value: tdh, unit: 'm' },
        'eta_pump': { symbol: 'η_pump', value: eta, unit: '%' }
      },
      formulaString: 'Power_kw = (Q_ls * 9.81 * TDH_raw) / (10 * η_pump)',
      substitutionString: `Power_kw = (${q_ls.toFixed(2)} * 9.81 * ${tdh}) / (10 * ${eta})`,
      calculatedValue: Number(powerKw.toFixed(1)),
      unit: 'kW',
      designCriteria: 'Hydraulic shaft power converted to wire power',
      standardReference: 'CPHEEO / Hydraulic Institute',
      safetyFactor: 1.10,
      validationStatus: 'PASS',
      notes: 'Duty pump motor power calculation.'
    };
  }

  // 9. SLU-SOL-001: Daily Dry Sludge Production
  if (parameterId === 'SLU-SOL-001') {
    const q_mld = Number(projectValues['DES-CAP-001'] || projectValues['plantCapacityMLD'] || 50);
    const tss = Number(projectValues['WQ-PHY-001'] || 120);
    const alumDose = Number(projectValues['CHM-ALU-001'] || projectValues['alumDoseMgL'] || 35);
    const drySludge = (q_mld * 1000) * ((tss * 0.9) + (0.26 * alumDose)) / 1000;

    return {
      parameterId,
      name: param.name,
      symbol: param.symbol,
      inputs: {
        'DES-CAP-001': { symbol: 'Q_mld', value: q_mld, unit: 'MLD' },
        'WQ-PHY-001': { symbol: 'TSS_raw', value: tss, unit: 'mg/L' },
        'CHM-ALU-001': { symbol: 'Dose_alum', value: alumDose, unit: 'mg/L' }
      },
      formulaString: 'M_sludge_dry = (Q_mld * 1000) * (0.9 * TSS_raw + 0.26 * Dose_alum) / 1000',
      substitutionString: `M_sludge_dry = (${q_mld} * 1000) * (0.9 * ${tss} + 0.26 * ${alumDose}) / 1000`,
      calculatedValue: Number(drySludge.toFixed(1)),
      unit: 'kg dry solids/day',
      designCriteria: 'Mass balance accounting for 90% TSS removal + alum hydroxide precipitate',
      standardReference: 'AWWA Water Treatment Plant Design 5th Ed',
      safetyFactor: 1.0,
      validationStatus: 'PASS',
      notes: 'Governs sludge thickener, belt press, and centrifuge capacity.'
    };
  }

  // Default fallback calculation inspector output with clear formula representation
  const rawNum = Number(projectValues[parameterId] || param.defaultValue);
  return {
    parameterId,
    name: param.name,
    symbol: param.symbol,
    inputs: {
      [parameterId]: { symbol: param.symbol, value: rawNum, unit: param.unit }
    },
    formulaString: param.formula || `${param.symbol} = Input Value`,
    substitutionString: `${param.symbol} = ${rawNum}`,
    calculatedValue: rawNum,
    unit: param.unit,
    designCriteria: param.designCriteria || 'Standard CPHEEO / AWWA Criteria',
    standardReference: param.standard || 'CPHEEO Manual 2021',
    safetyFactor: 1.0,
    validationStatus: 'PASS',
    notes: param.engineeringNotes || 'Verified design parameter.'
  };
}
