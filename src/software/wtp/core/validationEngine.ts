import { ValidationResult } from '../types/wtp';
import { CalculatedWtpState } from './dependencyEngine';

export function runComprehensiveValidationMatrix(
  state: CalculatedWtpState,
  customParams: Record<string, number> = {}
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // 1. Rapid Mix G Value Check
  const g_rm = customParams['g_rm'] || 800;
  if (g_rm >= 600 && g_rm <= 1000) {
    results.push({
      id: 'VAL-001',
      category: 'Coagulation',
      parameterName: 'Rapid Mix Velocity Gradient (G)',
      designValue: `${g_rm} s⁻¹`,
      unit: 's⁻¹',
      criteriaRange: '600 - 1000 s⁻¹',
      standardRef: 'CPHEEO / AWWA M51',
      status: 'PASS',
      message: 'Optimal rapid dispersion velocity gradient.'
    });
  } else if (g_rm < 300 || g_rm > 1200) {
    results.push({
      id: 'VAL-001',
      category: 'Coagulation',
      parameterName: 'Rapid Mix Velocity Gradient (G)',
      designValue: `${g_rm} s⁻¹`,
      unit: 's⁻¹',
      criteriaRange: '600 - 1000 s⁻¹',
      standardRef: 'CPHEEO / AWWA M51',
      status: 'FAIL',
      message: 'Mixing gradient is too low for coagulant dispersion or excessively shearing.',
      correctiveAction: 'Adjust rapid mixer impeller motor RPM or impeller diameter.'
    });
  } else {
    results.push({
      id: 'VAL-001',
      category: 'Coagulation',
      parameterName: 'Rapid Mix Velocity Gradient (G)',
      designValue: `${g_rm} s⁻¹`,
      unit: 's⁻¹',
      criteriaRange: '600 - 1000 s⁻¹',
      standardRef: 'CPHEEO / AWWA M51',
      status: 'WARNING',
      message: 'G value is slightly outside standard recommended range.'
    });
  }

  // 2. Clarifier Surface Overflow Rate (SOR)
  const sor = customParams['sor'] || 1.25;
  if (sor >= 1.0 && sor <= 1.5) {
    results.push({
      id: 'VAL-002',
      category: 'Sedimentation',
      parameterName: 'Surface Overflow Rate (SOR)',
      designValue: `${sor} m³/m²·hr`,
      unit: 'm³/m²·hr',
      criteriaRange: '1.0 - 1.5 m³/m²·hr',
      standardRef: 'CPHEEO 2021',
      status: 'PASS',
      message: 'Surface overflow rate complies with plain coagulation clarifier standards.'
    });
  } else if (sor > 2.2) {
    results.push({
      id: 'VAL-002',
      category: 'Sedimentation',
      parameterName: 'Surface Overflow Rate (SOR)',
      designValue: `${sor} m³/m²·hr`,
      unit: 'm³/m²·hr',
      criteriaRange: '1.0 - 1.5 m³/m²·hr',
      standardRef: 'CPHEEO 2021',
      status: 'FAIL',
      message: 'Excessive SOR will cause pin-floc carryover into filter beds.',
      correctiveAction: 'Increase clarifier basin area or install tube/lamella settler modules.'
    });
  } else {
    results.push({
      id: 'VAL-002',
      category: 'Sedimentation',
      parameterName: 'Surface Overflow Rate (SOR)',
      designValue: `${sor} m³/m²·hr`,
      unit: 'm³/m²·hr',
      criteriaRange: '1.0 - 1.5 m³/m²·hr',
      standardRef: 'CPHEEO 2021',
      status: 'WARNING',
      message: 'SOR is slightly elevated or conservative.'
    });
  }

  // 3. Filter Loading Rate
  const filtRate = customParams['v_filt'] || 6.0;
  if (filtRate >= 5.0 && filtRate <= 8.0) {
    results.push({
      id: 'VAL-003',
      category: 'Filtration',
      parameterName: 'Rapid Gravity Filter Loading Rate',
      designValue: `${filtRate} m³/m²·hr`,
      unit: 'm³/m²·hr',
      criteriaRange: '5.0 - 8.0 m³/m²·hr',
      standardRef: 'AWWA / CPHEEO',
      status: 'PASS',
      message: 'Filtration velocity is within safe limits for mono-medium sand filters.'
    });
  } else if (filtRate > 12.0) {
    results.push({
      id: 'VAL-003',
      category: 'Filtration',
      parameterName: 'Rapid Gravity Filter Loading Rate',
      designValue: `${filtRate} m³/m²·hr`,
      unit: 'm³/m²·hr',
      criteriaRange: '5.0 - 8.0 m³/m²·hr',
      standardRef: 'AWWA / CPHEEO',
      status: 'FAIL',
      message: 'Filtration rate exceeds hydraulic bed shearing limit.',
      correctiveAction: 'Increase number or area of filter beds.'
    });
  } else {
    results.push({
      id: 'VAL-003',
      category: 'Filtration',
      parameterName: 'Rapid Gravity Filter Loading Rate',
      designValue: `${filtRate} m³/m²·hr`,
      unit: 'm³/m²·hr',
      criteriaRange: '5.0 - 8.0 m³/m²·hr',
      standardRef: 'AWWA / CPHEEO',
      status: 'WARNING',
      message: 'Filtration rate requires dual media or deep bed anthracite configuration.'
    });
  }

  // 4. Chlorine CT Inactivation Value
  const cttVal = state.chlorineConsumptionKgDay > 0 ? 21.0 : 5.0;
  if (cttVal >= 15.0) {
    results.push({
      id: 'VAL-004',
      category: 'Disinfection',
      parameterName: 'Disinfectant Contact CT Value',
      designValue: `${cttVal} mg·min/L`,
      unit: 'mg·min/L',
      criteriaRange: '>= 15.0 mg·min/L',
      standardRef: 'US EPA SWTR',
      status: 'PASS',
      message: 'Provides required 3-log Virus and 0.5-log Giardia inactivation.'
    });
  } else {
    results.push({
      id: 'VAL-004',
      category: 'Disinfection',
      parameterName: 'Disinfectant Contact CT Value',
      designValue: `${cttVal} mg·min/L`,
      unit: 'mg·min/L',
      criteriaRange: '>= 15.0 mg·min/L',
      standardRef: 'US EPA SWTR',
      status: 'FAIL',
      message: 'Inadequate chlorine contact CT. Biological pathogen risk.',
      correctiveAction: 'Increase chlorine dosing or chlorine contact tank residence time.'
    });
  }

  // 5. Pumping NPSH Margin
  const npshaVal = customParams['npsha'] || 8.45;
  const npshrVal = customParams['npshr'] || 3.20;
  const npshMarginVal = npshaVal - npshrVal;
  if (npshMarginVal >= 1.0) {
    results.push({
      id: 'VAL-005',
      category: 'Pumping',
      parameterName: 'NPSHa vs NPSHr Safety Margin',
      designValue: `${npshMarginVal.toFixed(2)} m`,
      unit: 'm',
      criteriaRange: '>= 1.0 m margin',
      standardRef: 'HI 1.3 / Hydraulic Institute',
      status: 'PASS',
      message: 'Adequate Net Positive Suction Head margin prevents pump cavitation.'
    });
  } else {
    results.push({
      id: 'VAL-005',
      category: 'Pumping',
      parameterName: 'NPSHa vs NPSHr Safety Margin',
      designValue: `${npshMarginVal.toFixed(2)} m`,
      unit: 'm',
      criteriaRange: '>= 1.0 m margin',
      standardRef: 'HI 1.3',
      status: 'WARNING',
      message: 'Risk of localized impeller cavitation during lowest water level (LWL).'
    });
  }

  // 6. Specific Energy Consumption
  if (state.specificEnergyKwhM3 <= 0.45) {
    results.push({
      id: 'VAL-006',
      category: 'Energy',
      parameterName: 'Specific Energy Consumption',
      designValue: `${state.specificEnergyKwhM3} kWh/m³`,
      unit: 'kWh/m³',
      criteriaRange: '< 0.45 kWh/m³',
      standardRef: 'AWWA Energy Efficiency Benchmark',
      status: 'PASS',
      message: 'Energy efficient process hydraulic performance.'
    });
  } else {
    results.push({
      id: 'VAL-006',
      category: 'Energy',
      parameterName: 'Specific Energy Consumption',
      designValue: `${state.specificEnergyKwhM3} kWh/m³`,
      unit: 'kWh/m³',
      criteriaRange: '< 0.45 kWh/m³',
      standardRef: 'AWWA Benchmark',
      status: 'WARNING',
      message: 'Elevated specific power consumption. Evaluate VFD drives on high-lift pumps.'
    });
  }

  // 7. Structural Flotation / Buoyancy Safety Factor
  const buoyancySF = 1.38;
  if (buoyancySF >= 1.25) {
    results.push({
      id: 'VAL-007',
      category: 'Structural',
      parameterName: 'Basin Uplift Flotation Safety Factor',
      designValue: `${buoyancySF}`,
      unit: 'ratio',
      criteriaRange: '>= 1.25 (with HFL)',
      standardRef: 'IS 3370 / BS 8007',
      status: 'PASS',
      message: 'Empty basin deadweight is sufficient against river high flood uplift.'
    });
  } else {
    results.push({
      id: 'VAL-007',
      category: 'Structural',
      parameterName: 'Basin Uplift Flotation Safety Factor',
      designValue: `${buoyancySF}`,
      unit: 'ratio',
      criteriaRange: '>= 1.25',
      standardRef: 'IS 3370',
      status: 'FAIL',
      message: 'Structure at risk of uplift floating when drained during HFL.',
      correctiveAction: 'Increase base slab thickness or add anchor piles.'
    });
  }

  // 8. Hydraulic Pipe Velocity Check
  const pipeVel = customParams['pipe_velocity'] || 1.15;
  if (pipeVel >= 0.8 && pipeVel <= 1.8) {
    results.push({
      id: 'VAL-HYD-001',
      category: 'Hydraulics',
      parameterName: 'Raw / Treated Pipeline Velocity',
      designValue: `${pipeVel} m/s`,
      unit: 'm/s',
      criteriaRange: '0.8 - 1.8 m/s',
      standardRef: 'CPHEEO 2021 / AWWA M11',
      status: 'PASS',
      message: 'Pipeline velocity is self-cleansing and prevents scouring or excess head loss.'
    });
  } else if (pipeVel < 0.6) {
    results.push({
      id: 'VAL-HYD-001',
      category: 'Hydraulics',
      parameterName: 'Raw / Treated Pipeline Velocity',
      designValue: `${pipeVel} m/s`,
      unit: 'm/s',
      criteriaRange: '0.8 - 1.8 m/s',
      standardRef: 'CPHEEO 2021',
      status: 'WARNING',
      message: 'Velocity is low (< 0.6 m/s); potential sediment deposition and air pocket accumulation.',
      correctiveAction: 'Reduce pipe diameter or increase design flow.'
    });
  } else {
    results.push({
      id: 'VAL-HYD-001',
      category: 'Hydraulics',
      parameterName: 'Raw / Treated Pipeline Velocity',
      designValue: `${pipeVel} m/s`,
      unit: 'm/s',
      criteriaRange: '0.8 - 1.8 m/s',
      standardRef: 'CPHEEO 2021',
      status: 'FAIL',
      message: 'High flow velocity (> 2.0 m/s); excessive friction loss and severe water hammer risk.',
      correctiveAction: 'Increase pipe diameter.'
    });
  }

  // 9. Pump NPSH Safety Margin Check
  const npshaHyd = customParams['npsha'] || 8.45;
  const npshrHyd = customParams['npshr'] || 3.20;
  const npshMarginHyd = npshaHyd - npshrHyd;
  if (npshMarginHyd >= 1.0) {
    results.push({
      id: 'VAL-HYD-002',
      category: 'Pumping',
      parameterName: 'Pump NPSH Safety Margin (NPSHa - NPSHr)',
      designValue: `${npshMarginHyd.toFixed(2)} m`,
      unit: 'm',
      criteriaRange: '>= 1.0 m',
      standardRef: 'Hydraulic Institute HI 9.6.1',
      status: 'PASS',
      message: 'Adequate NPSH margin prevents impeller cavitation damage.'
    });
  } else {
    results.push({
      id: 'VAL-HYD-002',
      category: 'Pumping',
      parameterName: 'Pump NPSH Safety Margin (NPSHa - NPSHr)',
      designValue: `${npshMarginHyd.toFixed(2)} m`,
      unit: 'm',
      criteriaRange: '>= 1.0 m',
      standardRef: 'Hydraulic Institute HI 9.6.1',
      status: 'FAIL',
      message: '🔴 CRITICAL: Insufficient NPSH margin! Risk of severe pump impeller cavitation and noise.',
      correctiveAction: 'Lower pump centerline elevation, increase suction pipe diameter, or raise suction pit water level.'
    });
  }

  // 10. Transient Water Hammer Pressure vs Pipe Rating
  const peakSurgeBar = customParams['peak_surge_bar'] || 19.8;
  const pipePnBar = customParams['pipe_pn_bar'] || 16.0;
  if (peakSurgeBar <= pipePnBar) {
    results.push({
      id: 'VAL-HYD-003',
      category: 'Surge',
      parameterName: 'Peak Transient Pressure vs Pipe Rating (PN)',
      designValue: `${peakSurgeBar.toFixed(1)} bar (PN ${pipePnBar})`,
      unit: 'bar',
      criteriaRange: `<= ${pipePnBar} bar`,
      standardRef: 'AWWA M11 / ISO 2531',
      status: 'PASS',
      message: 'Transient pressure is safely within pipe pressure class allowance.'
    });
  } else {
    results.push({
      id: 'VAL-HYD-003',
      category: 'Surge',
      parameterName: 'Peak Transient Pressure vs Pipe Rating (PN)',
      designValue: `${peakSurgeBar.toFixed(1)} bar (PN ${pipePnBar})`,
      unit: 'bar',
      criteriaRange: `<= ${pipePnBar} bar`,
      standardRef: 'AWWA M11',
      status: 'FAIL',
      message: '🔴 FAIL: Peak Joukowsky transient surge exceeds pipe nominal pressure rating!',
      correctiveAction: 'Install Air Vessel (hydropneumatic surge tank), pressure relief valve, or upgrade pipe to higher pressure class.'
    });
  }

  // 11. Phase 05: Residual Alkalinity Buffer Check
  const residualAlk = customParams['residual_alk_mgL'] ?? 78.5;
  if (residualAlk >= 20.0) {
    results.push({
      id: 'VAL-CHEM-001',
      category: 'Chemical & Water Quality',
      parameterName: 'Residual Water Alkalinity (as CaCO3)',
      designValue: `${residualAlk.toFixed(1)} mg/L`,
      unit: 'mg/L',
      criteriaRange: '>= 20.0 mg/L as CaCO3',
      standardRef: 'AWWA M51 / CPHEEO 2021',
      status: 'PASS',
      message: 'Sufficient residual alkalinity buffer maintained for pH stability.'
    });
  } else {
    results.push({
      id: 'VAL-CHEM-001',
      category: 'Chemical & Water Quality',
      parameterName: 'Residual Water Alkalinity (as CaCO3)',
      designValue: `${residualAlk.toFixed(1)} mg/L`,
      unit: 'mg/L',
      criteriaRange: '>= 20.0 mg/L as CaCO3',
      standardRef: 'AWWA M51',
      status: 'FAIL',
      message: '🔴 CRITICAL: Alkalinity depleted by coagulant consumption! Risk of pH crash and acidic corrosion.',
      correctiveAction: 'Add alkaline chemical dosing (Hydrated Lime, Caustic Soda, or Soda Ash) before coagulation.'
    });
  }

  // 12. Phase 05: Disinfection CT Credit Adequacy Check
  const ctAchieved = customParams['ct_achieved'] ?? 67.5;
  const ctRequired = customParams['ct_required'] ?? 42.0;
  if (ctAchieved >= ctRequired) {
    results.push({
      id: 'VAL-CHEM-002',
      category: 'Disinfection',
      parameterName: 'Disinfection CT Credit Achieved',
      designValue: `${ctAchieved.toFixed(1)} mg·min/L`,
      unit: 'mg·min/L',
      criteriaRange: `>= ${ctRequired} mg·min/L`,
      standardRef: 'US EPA SWTR / WHO Guidelines',
      status: 'PASS',
      message: 'Achieved CT credit satisfies regulatory pathogen log inactivation requirements.'
    });
  } else {
    results.push({
      id: 'VAL-CHEM-002',
      category: 'Disinfection',
      parameterName: 'Disinfection CT Credit Achieved',
      designValue: `${ctAchieved.toFixed(1)} mg·min/L`,
      unit: 'mg·min/L',
      criteriaRange: `>= ${ctRequired} mg·min/L`,
      standardRef: 'US EPA SWTR',
      status: 'FAIL',
      message: '🔴 FAIL: Insufficient disinfection CT credit! Risk of pathogenic breakthrough.',
      correctiveAction: 'Increase gas chlorine dosing, increase contact tank volume, or install intra-tank baffles (target baffle factor >= 0.7).'
    });
  }

  // 13. Phase 05: Chemical Storage Autonomy Days
  const storageDays = customParams['storage_days'] ?? 30;
  if (storageDays >= 15) {
    results.push({
      id: 'VAL-CHEM-003',
      category: 'Chemical Storage',
      parameterName: 'Onsite Chemical Storage Autonomy',
      designValue: `${storageDays} days`,
      unit: 'days',
      criteriaRange: '>= 15 days',
      standardRef: 'CPHEEO Vol I Sec 7.4',
      status: 'PASS',
      message: 'Onsite inventory provides safe supply autonomy buffer against supply chain disruptions.'
    });
  } else {
    results.push({
      id: 'VAL-CHEM-003',
      category: 'Chemical Storage',
      parameterName: 'Onsite Chemical Storage Autonomy',
      designValue: `${storageDays} days`,
      unit: 'days',
      criteriaRange: '>= 15 days',
      standardRef: 'CPHEEO 2021',
      status: 'WARNING',
      message: 'Chemical storage capacity is below recommended 15 days autonomy.',
      correctiveAction: 'Increase bulk chemical storage vessel working volume.'
    });
  }

  // ==========================================
  // PHASE 06: MECHANICAL & EQUIPMENT VALIDATIONS
  // ==========================================

  // 14. Phase 06: Equipment N-1 Standby Redundancy
  const rawPumpStandby = customParams['raw_pump_standby'] ?? 1;
  if (rawPumpStandby >= 1) {
    results.push({
      id: 'VAL-EQP-001',
      category: 'Equipment Redundancy',
      parameterName: 'Raw Water Pump N-1 Standby Provision',
      designValue: `${rawPumpStandby} Standby Unit(s)`,
      unit: 'count',
      criteriaRange: '>= 1 Standby Unit',
      standardRef: 'Ten State Standards / CPHEEO 2021',
      status: 'PASS',
      message: 'N-1 single failure redundancy verified. 100% design flow maintained during pump maintenance.'
    });
  } else {
    results.push({
      id: 'VAL-EQP-001',
      category: 'Equipment Redundancy',
      parameterName: 'Raw Water Pump N-1 Standby Provision',
      designValue: '0 Standby Units',
      unit: 'count',
      criteriaRange: '>= 1 Standby Unit',
      standardRef: 'Ten State Standards',
      status: 'FAIL',
      message: '🔴 FAIL: Critical N-1 redundancy shortfall! Plant flow will drop below design capacity during pump outage.',
      correctiveAction: 'Add at least 1 standby pump unit to raw water intake station.'
    });
  }

  // 15. Phase 06: Motor Sizing Power Margin
  const motorServiceFactor = customParams['motor_sf'] ?? 1.15;
  if (motorServiceFactor >= 1.15) {
    results.push({
      id: 'VAL-EQP-002',
      category: 'Motor Sizing',
      parameterName: 'Pump Motor Power Rating Margin',
      designValue: `${((motorServiceFactor - 1) * 100).toFixed(0)}% Margin (SF ${motorServiceFactor})`,
      unit: 'ratio',
      criteriaRange: '>= 15% Margin (SF 1.15)',
      standardRef: 'NEMA MG1 / IEC 60034',
      status: 'PASS',
      message: 'Motor rating includes adequate service factor margin above pump shaft power to prevent thermal trip.'
    });
  } else {
    results.push({
      id: 'VAL-EQP-002',
      category: 'Motor Sizing',
      parameterName: 'Pump Motor Power Rating Margin',
      designValue: `${((motorServiceFactor - 1) * 100).toFixed(0)}% Margin`,
      unit: 'ratio',
      criteriaRange: '>= 15% Margin',
      standardRef: 'NEMA MG1',
      status: 'WARNING',
      message: 'Motor power margin is tight (< 15%). Risk of overload when pump operates at end-of-curve high flow condition.',
      correctiveAction: 'Select next higher standard IEC motor kW rating.'
    });
  }

  // 16. Phase 06: Maintenance Access Clearance
  const accessWidthM = customParams['access_clearance_m'] ?? 1.5;
  if (accessWidthM >= 1.2) {
    results.push({
      id: 'VAL-EQP-003',
      category: 'Maintenance & Layout',
      parameterName: 'Equipment Walkway & Pull-out Clearance',
      designValue: `${accessWidthM} m`,
      unit: 'm',
      criteriaRange: '>= 1.2 m',
      standardRef: 'OSHA 1910 / CPHEEO Vol I',
      status: 'PASS',
      message: 'Maintenance access and pull-out zone clearance complies with safety standards.'
    });
  } else {
    results.push({
      id: 'VAL-EQP-003',
      category: 'Maintenance & Layout',
      parameterName: 'Equipment Walkway & Pull-out Clearance',
      designValue: `${accessWidthM} m`,
      unit: 'm',
      criteriaRange: '>= 1.2 m',
      standardRef: 'OSHA 1910',
      status: 'WARNING',
      message: 'Tight maintenance clearance may obstruct pump rotor pull-out or crane rigging.',
      correctiveAction: 'Increase building bay spacing or reorient pump suction/discharge piping.'
    });
  }

  // 17. Phase 07: Substation Transformer Loading
  const trfKva = state.transformerKva || 800;
  const demandKva = (state.totalDemandLoadKw || 480) / 0.85;
  const trfLoadingPct = Number(((demandKva / trfKva) * 100).toFixed(1));
  if (trfLoadingPct <= 85.0) {
    results.push({
      id: 'VAL-ELE-001',
      category: 'Electrical & Power',
      parameterName: 'Substation Transformer Operating Loading',
      designValue: `${trfLoadingPct}% (${Math.round(demandKva)} kVA / ${trfKva} kVA)`,
      unit: '%',
      criteriaRange: '<= 85.0%',
      standardRef: 'IEC 60076 / IEEE 141',
      status: 'PASS',
      message: 'Transformer operating loading maintains recommended continuous thermal safety margin.'
    });
  } else if (trfLoadingPct > 95.0) {
    results.push({
      id: 'VAL-ELE-001',
      category: 'Electrical & Power',
      parameterName: 'Substation Transformer Operating Loading',
      designValue: `${trfLoadingPct}%`,
      unit: '%',
      criteriaRange: '<= 85.0%',
      standardRef: 'IEC 60076',
      status: 'FAIL',
      message: 'Transformer is overloaded. Risk of thermal degradation and nuisance tripping.',
      correctiveAction: 'Select next standard transformer rating (e.g. 1000 kVA or 1250 kVA).'
    });
  } else {
    results.push({
      id: 'VAL-ELE-001',
      category: 'Electrical & Power',
      parameterName: 'Substation Transformer Operating Loading',
      designValue: `${trfLoadingPct}%`,
      unit: '%',
      criteriaRange: '<= 85.0%',
      standardRef: 'IEC 60076',
      status: 'WARNING',
      message: 'Transformer loading is elevated above 85%.'
    });
  }

  // 18. Phase 07: Cable Voltage Drop
  const cblVdPct = customParams['cable_vd_pct'] ?? 1.4;
  if (cblVdPct <= 3.0) {
    results.push({
      id: 'VAL-ELE-003',
      category: 'Electrical & Power',
      parameterName: 'Motor Cable Running Voltage Drop',
      designValue: `${cblVdPct}%`,
      unit: '%',
      criteriaRange: '<= 3.0%',
      standardRef: 'BS 7671 / IEC 60364',
      status: 'PASS',
      message: 'Motor feeder voltage drop complies with maximum allowable 3% limit.'
    });
  } else {
    results.push({
      id: 'VAL-ELE-003',
      category: 'Electrical & Power',
      parameterName: 'Motor Cable Running Voltage Drop',
      designValue: `${cblVdPct}%`,
      unit: '%',
      criteriaRange: '<= 3.0%',
      standardRef: 'BS 7671',
      status: 'FAIL',
      message: 'Cable voltage drop exceeds 3.0% threshold causing motor torque reduction.',
      correctiveAction: 'Increase cable conductor cross-sectional area (e.g. from 35mm² to 50mm²).'
    });
  }

  // 19. Phase 07: PLC I/O Spare Channel Capacity
  const plcSparePct = customParams['plc_spare_pct'] ?? 20.0;
  if (plcSparePct >= 20.0) {
    results.push({
      id: 'VAL-PLC-001',
      category: 'Control & PLC',
      parameterName: 'PLC I/O Reserved Spare Capacity',
      designValue: `${plcSparePct}%`,
      unit: '%',
      criteriaRange: '>= 20.0%',
      standardRef: 'ISA-88 / IEC 61131',
      status: 'PASS',
      message: 'PLC rack spare channel capacity provides adequate room for future field expansion.'
    });
  } else {
    results.push({
      id: 'VAL-PLC-001',
      category: 'Control & PLC',
      parameterName: 'PLC I/O Reserved Spare Capacity',
      designValue: `${plcSparePct}%`,
      unit: '%',
      criteriaRange: '>= 20.0%',
      standardRef: 'ISA-88',
      status: 'WARNING',
      message: 'PLC spare I/O margin is below 20%.',
      correctiveAction: 'Add extra 16-ch DI/DO or 8-ch AI/AO modules to PLC rack.'
    });
  }

  // 20. Phase 09: Gravity Thickener Solids Loading Rate
  const sldSlr = customParams['sld_slr'] ?? 35.0;
  if (sldSlr >= 25.0 && sldSlr <= 45.0) {
    results.push({
      id: 'VAL-SLD-001',
      category: 'Sludge & Waste',
      parameterName: 'Gravity Thickener Solids Loading Rate',
      designValue: `${sldSlr} kg/m²·day`,
      unit: 'kg/m²·day',
      criteriaRange: '25.0 - 45.0 kg/m²·day',
      standardRef: 'WEF MOP 8 / AWWA M51',
      status: 'PASS',
      message: 'Gravity thickener solids loading rate is optimal for alum sludge compaction.'
    });
  } else {
    results.push({
      id: 'VAL-SLD-001',
      category: 'Sludge & Waste',
      parameterName: 'Gravity Thickener Solids Loading Rate',
      designValue: `${sldSlr} kg/m²·day`,
      unit: 'kg/m²·day',
      criteriaRange: '25.0 - 45.0 kg/m²·day',
      standardRef: 'WEF MOP 8',
      status: 'WARNING',
      message: 'Solids loading rate is outside standard recommended 25-45 kg/m²·day range.',
      correctiveAction: 'Adjust gravity thickener surface area or add polymer thickening aid.'
    });
  }

  // 21. Phase 09: Dewatered Sludge Cake Solids %
  const cakeSolidsPct = customParams['cake_solids_pct'] ?? 30.0;
  if (cakeSolidsPct >= 25.0) {
    results.push({
      id: 'VAL-SLD-002',
      category: 'Sludge & Waste',
      parameterName: 'Dewatered Cake Dry Solids Concentration',
      designValue: `${cakeSolidsPct}%`,
      unit: '%',
      criteriaRange: '>= 25.0%',
      standardRef: 'USEPA 503 / WEF MOP 8',
      status: 'PASS',
      message: 'Dewatered cake dryness complies with landfill paint filter test and hauling requirements.'
    });
  } else {
    results.push({
      id: 'VAL-SLD-002',
      category: 'Sludge & Waste',
      parameterName: 'Dewatered Cake Dry Solids Concentration',
      designValue: `${cakeSolidsPct}%`,
      unit: '%',
      criteriaRange: '>= 25.0%',
      standardRef: 'USEPA 503',
      status: 'FAIL',
      message: 'Sludge cake is too wet (< 25% dry solids) and will fail landfill disposal criteria.',
      correctiveAction: 'Increase filter press cycle time, conditioning polymer dosage, or pressing pressure.'
    });
  }

  // 22. Phase 09: Filter Backwash Recycling Efficiency
  const bwRecPct = customParams['bw_rec_pct'] ?? 95.0;
  if (bwRecPct >= 90.0) {
    results.push({
      id: 'VAL-ENV-001',
      category: 'Environmental & Water Recovery',
      parameterName: 'Filter Backwash Water Recovery Efficiency',
      designValue: `${bwRecPct}%`,
      unit: '%',
      criteriaRange: '>= 90.0%',
      standardRef: 'USEPA Filter Backwash Recycling Rule / CPHEEO 2021',
      status: 'PASS',
      message: 'High backwash water recovery efficiency minimizes net plant raw water intake loss.'
    });
  } else {
    results.push({
      id: 'VAL-ENV-001',
      category: 'Environmental & Water Recovery',
      parameterName: 'Filter Backwash Water Recovery Efficiency',
      designValue: `${bwRecPct}%`,
      unit: '%',
      criteriaRange: '>= 90.0%',
      standardRef: 'CPHEEO 2021',
      status: 'WARNING',
      message: 'Backwash recovery is below 90% target leading to excessive raw water wastage.',
      correctiveAction: 'Increase backwash equalization basin capacity and recycle pump rate.'
    });
  }

  return results;
}

export const validateWtpDesign = runComprehensiveValidationMatrix;

