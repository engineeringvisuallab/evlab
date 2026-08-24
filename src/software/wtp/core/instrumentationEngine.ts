import { CalculatedWtpState } from './dependencyEngine';

export type InstrumentCategory = 'FLOW' | 'LEVEL' | 'PRESSURE' | 'WATER_QUALITY' | 'TEMPERATURE' | 'CONTROL_VALVE';

export interface InstrumentItem {
  id: string;
  tag: string;
  service: string;
  category: InstrumentCategory;
  processLocation: string;
  measurementType: string;
  rangeMin: number;
  rangeNormal: number;
  rangeMax: number;
  unit: string;
  accuracyPercent: number;
  outputSignal: '4-20mA_HART' | 'MODBUS_RS485' | 'PROFINET' | 'PULSE' | '24VDC_DIGITAL';
  powerSupply: '24VDC' | '230VAC' | 'LOOP_POWERED';
  ipRating: 'IP65' | 'IP67' | 'IP68';
  alarmLow: number;
  alarmHigh: number;
  tripLow: number;
  tripHigh: number;
  wettedMaterial: string;
  manufacturer: string;
  model: string;
  status: 'PASS' | 'ALARM_LOW' | 'ALARM_HIGH' | 'TRIP_LOW' | 'TRIP_HIGH';
}

export interface ControlValveItem {
  tag: string;
  service: string;
  processLocation: string;
  nominalSizeMm: number;
  designFlowM3hr: number;
  pressureDropBar: number;
  calculatedCv: number;
  actuatorType: 'PNEUMATIC_DIAPHRAGM' | 'ELECTRIC_MOTOR' | 'SOLENOID';
  failSafePosition: 'FAIL_OPEN' | 'FAIL_CLOSE' | 'FAIL_IN_PLACE';
  positionerType: 'SMART_DIGITAL_HART' | 'ELECTRO_PNEUMATIC';
}

export interface InstrumentAirResult {
  airConsumingValvesCount: number;
  averageAirConsumptionNm3hr: number;
  peakAirConsumptionNm3hr: number;
  operatingPressureBar: number;
  airReceiverVolumeM3: number;
  compressorKw: number;
  dryerType: 'DESICCANT' | 'REFRIGERATED';
  leakageAllowancePercent: number;
}

/**
 * Auto-generates Instrument Schedule for the WTP
 */
export function generateMasterInstrumentIndex(state: CalculatedWtpState): InstrumentItem[] {
  const flowM3hr = state.flowM3hr || 2083.3;

  const schedule: InstrumentItem[] = [
    // FLOW
    {
      id: 'INST-FLW-001',
      tag: 'FIT-RAW-101',
      service: 'Raw Water Intake Flow Measurement',
      category: 'FLOW',
      processLocation: 'Raw Water Intake Channel',
      measurementType: 'Electromagnetic Flow Meter',
      rangeMin: 0,
      rangeNormal: Number(flowM3hr.toFixed(1)),
      rangeMax: Number((flowM3hr * 1.5).toFixed(1)),
      unit: 'm³/hr',
      accuracyPercent: 0.2,
      outputSignal: '4-20mA_HART',
      powerSupply: '24VDC',
      ipRating: 'IP68',
      alarmLow: Number((flowM3hr * 0.5).toFixed(1)),
      alarmHigh: Number((flowM3hr * 1.25).toFixed(1)),
      tripLow: Number((flowM3hr * 0.2).toFixed(1)),
      tripHigh: Number((flowM3hr * 1.4).toFixed(1)),
      wettedMaterial: 'Ebonite Rubber Lined / SS316 Electrodes',
      manufacturer: 'Endress+Hauser / Krohne',
      model: 'Promag W 400',
      status: 'PASS'
    },
    {
      id: 'INST-FLW-002',
      tag: 'FIT-TREATED-401',
      service: 'Treated Water High Lift Flow Measurement',
      category: 'FLOW',
      processLocation: 'High Lift Discharge Main',
      measurementType: 'Electromagnetic Flow Meter',
      rangeMin: 0,
      rangeNormal: Number(flowM3hr.toFixed(1)),
      rangeMax: Number((flowM3hr * 1.5).toFixed(1)),
      unit: 'm³/hr',
      accuracyPercent: 0.2,
      outputSignal: '4-20mA_HART',
      powerSupply: '24VDC',
      ipRating: 'IP68',
      alarmLow: Number((flowM3hr * 0.5).toFixed(1)),
      alarmHigh: Number((flowM3hr * 1.25).toFixed(1)),
      tripLow: Number((flowM3hr * 0.2).toFixed(1)),
      tripHigh: Number((flowM3hr * 1.4).toFixed(1)),
      wettedMaterial: 'PTFE Lined / Hastelloy Electrodes',
      manufacturer: 'ABB / Siemens',
      model: 'ProcessMaster FEP630',
      status: 'PASS'
    },
    {
      id: 'INST-FLW-003',
      tag: 'FIT-BW-301',
      service: 'Filter Backwash Water Flow Meter',
      category: 'FLOW',
      processLocation: 'Backwash Pump Discharge Header',
      measurementType: 'Ultrasonic Flow Meter',
      rangeMin: 0,
      rangeNormal: Number((state.backwashFlowM3hr || 1800).toFixed(1)),
      rangeMax: 2500,
      unit: 'm³/hr',
      accuracyPercent: 0.5,
      outputSignal: '4-20mA_HART',
      powerSupply: '24VDC',
      ipRating: 'IP67',
      alarmLow: 800,
      alarmHigh: 2200,
      tripLow: 500,
      tripHigh: 2400,
      wettedMaterial: 'SS316L Transducers',
      manufacturer: 'Flexim / Panametrics',
      model: 'FLUXUS F721',
      status: 'PASS'
    },

    // LEVEL
    {
      id: 'INST-LVL-001',
      tag: 'LIT-INTAKE-101',
      service: 'Raw Water Intake Sump Level Measurement',
      category: 'LEVEL',
      processLocation: 'Intake Well Sump',
      measurementType: 'Non-Contact 80GHz Radar Level Transmitter',
      rangeMin: 0,
      rangeNormal: 4.5,
      rangeMax: 8.0,
      unit: 'm',
      accuracyPercent: 0.1,
      outputSignal: '4-20mA_HART',
      powerSupply: '24VDC',
      ipRating: 'IP68',
      alarmLow: 1.5,
      alarmHigh: 7.0,
      tripLow: 0.8,
      tripHigh: 7.5,
      wettedMaterial: 'PVDF Antenna',
      manufacturer: 'VEGA / Endress+Hauser',
      model: 'VEGAPULS 6X',
      status: 'PASS'
    },
    {
      id: 'INST-LVL-002',
      tag: 'LIT-CWR-501',
      service: 'Clear Water Reservoir (CWR) Storage Level',
      category: 'LEVEL',
      processLocation: 'Clear Water Tank',
      measurementType: 'Hydrostatic Submersible Level Sensor',
      rangeMin: 0,
      rangeNormal: 5.0,
      rangeMax: 6.5,
      unit: 'm',
      accuracyPercent: 0.1,
      outputSignal: '4-20mA_HART',
      powerSupply: 'LOOP_POWERED',
      ipRating: 'IP68',
      alarmLow: 1.8,
      alarmHigh: 6.0,
      tripLow: 1.0,
      tripHigh: 6.3,
      wettedMaterial: 'Titanium / Ceramic Diaphragm',
      manufacturer: 'WIKA / Keller',
      model: 'LH-10 Submersible',
      status: 'PASS'
    },

    // PRESSURE
    {
      id: 'INST-PRS-001',
      tag: 'PIT-HL-401',
      service: 'High Lift Discharge Main Pressure',
      category: 'PRESSURE',
      processLocation: 'High Lift Pump Discharge Header',
      measurementType: 'Piezoresistive Pressure Transmitter',
      rangeMin: 0,
      rangeNormal: 5.5,
      rangeMax: 10.0,
      unit: 'bar',
      accuracyPercent: 0.1,
      outputSignal: '4-20mA_HART',
      powerSupply: '24VDC',
      ipRating: 'IP67',
      alarmLow: 3.5,
      alarmHigh: 8.0,
      tripLow: 2.5,
      tripHigh: 9.0,
      wettedMaterial: 'SS316L Diaphragm',
      manufacturer: 'Rosemount / Danfoss',
      model: '3051S Pressure',
      status: 'PASS'
    },

    // WATER QUALITY / ANALYTICAL
    {
      id: 'INST-AQT-001',
      tag: 'AIT-TURB-101',
      service: 'Raw Water Inlet Turbidity Analyzer',
      category: 'WATER_QUALITY',
      processLocation: 'Inlet Mixing Channel',
      measurementType: 'Nephelometric Turbidimeter',
      rangeMin: 0,
      rangeNormal: 85.0,
      rangeMax: 1000.0,
      unit: 'NTU',
      accuracyPercent: 1.0,
      outputSignal: 'MODBUS_RS485',
      powerSupply: '230VAC',
      ipRating: 'IP65',
      alarmLow: 5.0,
      alarmHigh: 500.0,
      tripLow: 0.0,
      tripHigh: 800.0,
      wettedMaterial: 'Quartz Glass Cuvette',
      manufacturer: 'Hach / SWAN',
      model: 'TU5200 Online Turbidimeter',
      status: 'PASS'
    },
    {
      id: 'INST-AQT-002',
      tag: 'AIT-PH-102',
      service: 'Raw Water Inlet pH Sensor',
      category: 'WATER_QUALITY',
      processLocation: 'Coagulant Dosing Point',
      measurementType: 'Glass Combination Electrode pH Probe',
      rangeMin: 0,
      rangeNormal: 7.2,
      rangeMax: 14.0,
      unit: 'pH',
      accuracyPercent: 0.05,
      outputSignal: '4-20mA_HART',
      powerSupply: '24VDC',
      ipRating: 'IP67',
      alarmLow: 6.0,
      alarmHigh: 8.5,
      tripLow: 5.5,
      tripHigh: 9.0,
      wettedMaterial: 'Glass / PTFE Junction',
      manufacturer: 'Mettler Toledo / Hach',
      model: 'InPro 3253i pH Probe',
      status: 'PASS'
    },
    {
      id: 'INST-AQT-003',
      tag: 'AIT-CL2-401',
      service: 'Treated Water Residual Free Chlorine Analyzer',
      category: 'WATER_QUALITY',
      processLocation: 'CWR Outlet / Distribution Header',
      measurementType: 'Amperometric Membrane Chlorine Sensor',
      rangeMin: 0,
      rangeNormal: 1.2,
      rangeMax: 5.0,
      unit: 'mg/L',
      accuracyPercent: 0.5,
      outputSignal: '4-20mA_HART',
      powerSupply: '24VDC',
      ipRating: 'IP65',
      alarmLow: 0.5,
      alarmHigh: 3.0,
      tripLow: 0.2,
      tripHigh: 4.0,
      wettedMaterial: 'Gold / Platinum Electrodes',
      manufacturer: 'ProMinent / SWAN',
      model: 'DULCOTEST CLE3',
      status: 'PASS'
    }
  ];

  return schedule;
}

/**
 * Control Valve Sizing Engine (Cv / Kv)
 */
export function calculateControlValveSizing(
  designFlowM3hr: number,
  pressureDropBar: number = 0.5,
  service: string = 'Raw Water Flow Control'
): ControlValveItem {
  // Cv = Q (gpm) * sqrt(SG / ΔP psi)
  const flowGpm = designFlowM3hr * 4.40287;
  const deltaPpsi = pressureDropBar * 14.5038;
  const calculatedCv = Number((flowGpm * Math.sqrt(1.0 / deltaPpsi)).toFixed(1));

  let nominalSizeMm = 300;
  if (calculatedCv < 100) nominalSizeMm = 100;
  else if (calculatedCv < 300) nominalSizeMm = 150;
  else if (calculatedCv < 800) nominalSizeMm = 250;
  else nominalSizeMm = 350;

  return {
    tag: 'FCV-RAW-101',
    service,
    processLocation: 'Intake Distribution Box',
    nominalSizeMm,
    designFlowM3hr,
    pressureDropBar,
    calculatedCv,
    actuatorType: 'PNEUMATIC_DIAPHRAGM',
    failSafePosition: 'FAIL_OPEN',
    positionerType: 'SMART_DIGITAL_HART'
  };
}

/**
 * Instrument Air System Calculator
 */
export function calculateInstrumentAirRequirement(
  pneumaticValveCount: number = 16
): InstrumentAirResult {
  const averageAirConsumptionNm3hr = Number((pneumaticValveCount * 1.5).toFixed(1));
  const peakAirConsumptionNm3hr = Number((averageAirConsumptionNm3hr * 2.0).toFixed(1)); // 100% surge factor during backwash
  const airReceiverVolumeM3 = Number((peakAirConsumptionNm3hr * 0.2).toFixed(1));
  const compressorKw = Math.ceil(peakAirConsumptionNm3hr * 0.15);

  return {
    airConsumingValvesCount: pneumaticValveCount,
    averageAirConsumptionNm3hr,
    peakAirConsumptionNm3hr,
    operatingPressureBar: 7.0,
    airReceiverVolumeM3,
    compressorKw,
    dryerType: 'DESICCANT',
    leakageAllowancePercent: 15.0
  };
}
