import { InstrumentItem } from './instrumentationEngine';
import { MasterEquipmentItem } from './equipmentEngine';

export interface PlcIoCounts {
  digitalInputsDI: number;
  digitalOutputsDO: number;
  analogInputsAI: number;
  analogOutputsAO: number;
  totalPhysicalIo: number;
  spareMarginPercent: number;
  totalDesignIoWithSpare: number;
  recommendedDiModules: number; // 32-ch DI module
  recommendedDoModules: number; // 16-ch DO module
  recommendedAiModules: number; // 8-ch AI module
  recommendedAoModules: number; // 8-ch AO module
}

export interface PlcIoItem {
  id: string;
  tag: string;
  description: string;
  signalType: 'DI_24VDC' | 'DO_24VDC_RELAY' | 'AI_4_20MA_HART' | 'AO_4_20MA' | 'MODBUS_TCP';
  panelId: string;
  rackNumber: number;
  slotNumber: number;
  channelNumber: number;
  range: string;
  equipmentTag: string;
  interlockCategory: 'CRITICAL_TRIP' | 'START_PERMISSIVE' | 'STATUS_FEEDBACK' | 'CONTROL_COMMAND';
}

export interface InterlockRule {
  id: string;
  targetEquipmentTag: string;
  description: string;
  conditionSignalTag: string;
  conditionType: 'LESS_THAN' | 'GREATER_THAN' | 'EQUAL' | 'EQUIPMENT_FAULT' | 'EMERGENCY_STOP';
  thresholdValue: number | string;
  action: 'TRIP' | 'INHIBIT_START' | 'AUTO_START_STANDBY' | 'ALARM_ONLY';
  active: boolean;
}

export type StateMachineState = 'IDLE' | 'STARTING' | 'RUNNING' | 'BACKWASHING' | 'ALARM' | 'TRIP' | 'RECOVERY';

export interface BackwashStep {
  stepNumber: number;
  stepName: string;
  durationSeconds: number;
  valvesOpen: string[];
  valvesClosed: string[];
  equipmentRunning: string[];
  description: string;
}

/**
 * Automatically calculates required PLC I/O modules and physical channel counts
 */
export function calculatePlcIoCounts(
  equipmentList: MasterEquipmentItem[],
  instrumentList: InstrumentItem[],
  spareMarginPercent: number = 20
): PlcIoCounts {
  let di = 0;
  let doCount = 0;
  let ai = 0;
  let ao = 0;

  // Equipment Signals:
  // Each motor has: Running FB (DI), Fault FB (DI), Auto Mode FB (DI), Remote FB (DI) => 4 DI
  // Each motor has: Start CMD (DO), Stop CMD (DO), Reset CMD (DO) => 2 DO
  // Each VFD has: Speed Reference (AO), Speed Feedback (AI)
  equipmentList.forEach(eq => {
    di += 4 * eq.quantity;
    doCount += 2 * eq.quantity;

    if (eq.motorStartingMethod === 'VFD') {
      ai += 1 * eq.quantity;
      ao += 1 * eq.quantity;
    }
  });

  // Instrument Signals:
  instrumentList.forEach(inst => {
    if (inst.category === 'CONTROL_VALVE') {
      ai += 1; // Position feedback
      ao += 1; // Position demand
      di += 2; // Limit switch Open/Closed
      doCount += 2; // Solenoid Open/Close
    } else {
      ai += 1; // 4-20mA process variable
    }
  });

  const totalPhysicalIo = di + doCount + ai + ao;
  const factor = 1 + (spareMarginPercent / 100);

  const totalDesignIoWithSpare = Math.ceil(totalPhysicalIo * factor);
  const recommendedDiModules = Math.ceil((di * factor) / 32);
  const recommendedDoModules = Math.ceil((doCount * factor) / 16);
  const recommendedAiModules = Math.ceil((ai * factor) / 8);
  const recommendedAoModules = Math.ceil((ao * factor) / 8);

  return {
    digitalInputsDI: di,
    digitalOutputsDO: doCount,
    analogInputsAI: ai,
    analogOutputsAO: ao,
    totalPhysicalIo,
    spareMarginPercent,
    totalDesignIoWithSpare,
    recommendedDiModules,
    recommendedDoModules,
    recommendedAiModules,
    recommendedAoModules
  };
}

/**
 * Generate Master PLC I/O Channel Mapping Schedule
 */
export function generatePlcIoList(
  equipmentList: MasterEquipmentItem[],
  instrumentList: InstrumentItem[]
): PlcIoItem[] {
  const ioList: PlcIoItem[] = [];
  let index = 1;

  equipmentList.slice(0, 8).forEach((eq, eqIdx) => {
    const rack = Math.floor(eqIdx / 4) + 1;
    
    // Motor Running Feedback
    ioList.push({
      id: `IO-${index++}`,
      tag: `${eq.tag}_RUN_FB`,
      description: `${eq.name} Running Feedback`,
      signalType: 'DI_24VDC',
      panelId: `PLC-PANEL-0${rack}`,
      rackNumber: rack,
      slotNumber: 1,
      channelNumber: (eqIdx % 8) * 4 + 1,
      range: '0 - 24VDC (1=RUN)',
      equipmentTag: eq.tag,
      interlockCategory: 'STATUS_FEEDBACK'
    });

    // Motor Fault Feedback
    ioList.push({
      id: `IO-${index++}`,
      tag: `${eq.tag}_FLT_FB`,
      description: `${eq.name} Overload / VFD Fault`,
      signalType: 'DI_24VDC',
      panelId: `PLC-PANEL-0${rack}`,
      rackNumber: rack,
      slotNumber: 1,
      channelNumber: (eqIdx % 8) * 4 + 2,
      range: '0 - 24VDC (1=TRIP)',
      equipmentTag: eq.tag,
      interlockCategory: 'CRITICAL_TRIP'
    });

    // Motor Start Command
    ioList.push({
      id: `IO-${index++}`,
      tag: `${eq.tag}_START_CMD`,
      description: `${eq.name} Start Command Relay`,
      signalType: 'DO_24VDC_RELAY',
      panelId: `PLC-PANEL-0${rack}`,
      rackNumber: rack,
      slotNumber: 2,
      channelNumber: (eqIdx % 8) * 2 + 1,
      range: 'Relay Contact NO',
      equipmentTag: eq.tag,
      interlockCategory: 'CONTROL_COMMAND'
    });
  });

  instrumentList.forEach((inst, instIdx) => {
    ioList.push({
      id: `IO-${index++}`,
      tag: `${inst.tag}_PV`,
      description: `${inst.service} Process Value`,
      signalType: 'AI_4_20MA_HART',
      panelId: 'PLC-PANEL-01',
      rackNumber: 1,
      slotNumber: 3,
      channelNumber: instIdx + 1,
      range: `${inst.rangeMin} - ${inst.rangeMax} ${inst.unit}`,
      equipmentTag: inst.tag,
      interlockCategory: 'STATUS_FEEDBACK'
    });
  });

  return ioList;
}

/**
 * Generate Default WTP Interlock Rules
 */
export function generateDefaultInterlocks(): InterlockRule[] {
  return [
    {
      id: 'INTLK-001',
      targetEquipmentTag: 'PMP-RAW-01A',
      description: 'Inhibit Raw Water Pump start on Low-Low Intake Sump Level',
      conditionSignalTag: 'LIT-INTAKE-101',
      conditionType: 'LESS_THAN',
      thresholdValue: 0.8, // 0.8 meters
      action: 'TRIP',
      active: true
    },
    {
      id: 'INTLK-002',
      targetEquipmentTag: 'PMP-HL-01A',
      description: 'Trip High Lift Pump on High Discharge Line Pressure',
      conditionSignalTag: 'PIT-HL-401',
      conditionType: 'GREATER_THAN',
      thresholdValue: 9.0, // 9 bar
      action: 'TRIP',
      active: true
    },
    {
      id: 'INTLK-003',
      targetEquipmentTag: 'DOS-PMP-CL2-01',
      description: 'Interlock Chlorine Dosing Pump with Raw Water Flow confirmation',
      conditionSignalTag: 'FIT-RAW-101',
      conditionType: 'LESS_THAN',
      thresholdValue: 50.0, // 50 m3/hr
      action: 'INHIBIT_START',
      active: true
    },
    {
      id: 'INTLK-004',
      targetEquipmentTag: 'PMP-RAW-01B',
      description: 'Auto-start Standby Raw Pump B on Duty Pump A Overload Fault',
      conditionSignalTag: 'PMP-RAW-01A_FLT_FB',
      conditionType: 'EQUIPMENT_FAULT',
      thresholdValue: 'TRIPPED',
      action: 'AUTO_START_STANDBY',
      active: true
    }
  ];
}

/**
 * Rapid Gravity Filter Automated Backwash Sequence Steps
 */
export function getFilterBackwashSequence(): BackwashStep[] {
  return [
    {
      stepNumber: 1,
      stepName: 'FILTER ISOLATION',
      durationSeconds: 120,
      valvesOpen: ['FCV-DRAIN-301'],
      valvesClosed: ['FCV-INLET-301', 'FCV-OUTLET-301'],
      equipmentRunning: [],
      description: 'Close inlet valve, allow water level to drop to 100mm above sand bed, close outlet valve.'
    },
    {
      stepNumber: 2,
      stepName: 'AIR SCOUR PHASE',
      durationSeconds: 300,
      valvesOpen: ['FCV-DRAIN-301', 'FCV-AIR-301'],
      valvesClosed: ['FCV-INLET-301', 'FCV-OUTLET-301'],
      equipmentRunning: ['BLW-BW-01A'],
      description: 'Start air scour blower at 55 m3/m2/hr to loosen filtered flocs and unseat surface mudballs.'
    },
    {
      stepNumber: 3,
      stepName: 'COMBINED AIR & WATER SCOUR',
      durationSeconds: 180,
      valvesOpen: ['FCV-DRAIN-301', 'FCV-AIR-301', 'FCV-WATER-BW-301'],
      valvesClosed: ['FCV-INLET-301', 'FCV-OUTLET-301'],
      equipmentRunning: ['BLW-BW-01A', 'PMP-BW-01A'],
      description: 'Low rate water flush (15 m3/m2/hr) combined with air scour for maximum bed fluidization.'
    },
    {
      stepNumber: 4,
      stepName: 'HIGH RATE WATER WASH',
      durationSeconds: 360,
      valvesOpen: ['FCV-DRAIN-301', 'FCV-WATER-BW-301'],
      valvesClosed: ['FCV-INLET-301', 'FCV-OUTLET-301', 'FCV-AIR-301'],
      equipmentRunning: ['PMP-BW-01A'],
      description: 'Stop air blower. High-rate backwash water pumping (36 m3/m2/hr) to expand sand bed by 25% and wash dirty backwash water into waste troughs.'
    },
    {
      stepNumber: 5,
      stepName: 'BED SETTLING & RINSE',
      durationSeconds: 180,
      valvesOpen: ['FCV-INLET-301', 'FCV-WASTE-301'],
      valvesClosed: ['FCV-OUTLET-301', 'FCV-WATER-BW-301', 'FCV-DRAIN-301'],
      equipmentRunning: [],
      description: 'Allow filter media to settle. Open inlet valve and filter-to-waste valve for initial re-ripening flush.'
    },
    {
      stepNumber: 6,
      stepName: 'RETURN TO SERVICE',
      durationSeconds: 60,
      valvesOpen: ['FCV-INLET-301', 'FCV-OUTLET-301'],
      valvesClosed: ['FCV-WASTE-301', 'FCV-DRAIN-301', 'FCV-AIR-301', 'FCV-WATER-BW-301'],
      equipmentRunning: [],
      description: 'Close filter-to-waste valve and open treated water outlet valve. Filter restored to active service online.'
    }
  ];
}
