import { InstrumentItem } from './instrumentationEngine';
import { CalculatedWtpState } from './dependencyEngine';

export type AlarmPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'ADVISORY';

export interface ScadaTag {
  tag: string;
  description: string;
  unit: string;
  currentValue: number;
  plcAddress: string;
  sourceDevice: string;
  historianLogging: boolean;
  engMin: number;
  engMax: number;
  lowLowLimit?: number;
  lowLimit?: number;
  highLimit?: number;
  highHighLimit?: number;
}

export interface ScadaAlarm {
  id: string;
  tag: string;
  description: string;
  timestamp: string;
  priority: AlarmPriority;
  condition: 'HIGH_HIGH' | 'HIGH' | 'LOW' | 'LOW_LOW' | 'TRIP' | 'COMM_FAIL';
  currentValue: string;
  limitValue: string;
  cause: string;
  effect: string;
  recommendedAction: string;
  acknowledged: boolean;
  shelved: boolean;
}

export interface EnergyMetrics {
  instantaneousPowerKw: number;
  apparentPowerKva: number;
  powerFactor: number;
  dailyEnergyKwh: number;
  specificEnergyKwhM3: number;
  energyCostTodayUSD: number;
  plantEfficiencyPercent: number;
}

export interface NetworkDevice {
  id: string;
  deviceName: string;
  ipAddress: string;
  protocol: 'ETHERNET_IP' | 'PROFINET' | 'MODBUS_TCP' | 'OPC_UA';
  role: 'PLC_MASTER' | 'REMOTE_IO' | 'SCADA_SERVER' | 'ENGINEERING_STATION' | 'VFD_GATEWAY';
  status: 'ONLINE' | 'STANDBY' | 'FAULT';
  redundantLink: boolean;
}

/**
 * Builds SCADA Tag Database from Instrument Schedule & Calculated State
 */
export function buildScadaTagDatabase(
  instruments: InstrumentItem[],
  state: CalculatedWtpState
): ScadaTag[] {
  const flowM3hr = state.flowM3hr || 2083.3;

  const tags: ScadaTag[] = [
    {
      tag: 'SYS_PLANT_FLOW_M3HR',
      description: 'Total Plant Instantaneous Raw Water Inlet Flow',
      unit: 'm³/hr',
      currentValue: Number(flowM3hr.toFixed(1)),
      plcAddress: 'DB10.CBD0',
      sourceDevice: 'FIT-RAW-101',
      historianLogging: true,
      engMin: 0,
      engMax: Number((flowM3hr * 1.5).toFixed(1)),
      lowLimit: Number((flowM3hr * 0.5).toFixed(1)),
      highLimit: Number((flowM3hr * 1.25).toFixed(1))
    },
    {
      tag: 'SYS_TOTAL_POWER_KW',
      description: 'Main PCC Incomer Power Consumption',
      unit: 'kW',
      currentValue: Number((state.totalDemandLoadKw || 480).toFixed(1)),
      plcAddress: 'DB12.CBD0',
      sourceDevice: 'PM-PCC-01',
      historianLogging: true,
      engMin: 0,
      engMax: 1500
    },
    {
      tag: 'SYS_SPECIFIC_ENERGY_KWHM3',
      description: 'Specific Electrical Energy per Cubic Meter Water Produced',
      unit: 'kWh/m³',
      currentValue: Number((state.specificEnergyKwhM3 || 0.28).toFixed(3)),
      plcAddress: 'DB12.CBD10',
      sourceDevice: 'PLC_ENERGY_CALC',
      historianLogging: true,
      engMin: 0,
      engMax: 1.0
    }
  ];

  instruments.forEach((inst, idx) => {
    tags.push({
      tag: `${inst.tag}_VAL`,
      description: inst.service,
      unit: inst.unit,
      currentValue: inst.rangeNormal,
      plcAddress: `DB20.CBD${idx * 4}`,
      sourceDevice: inst.tag,
      historianLogging: true,
      engMin: inst.rangeMin,
      engMax: inst.rangeMax,
      lowLowLimit: inst.tripLow,
      lowLimit: inst.alarmLow,
      highLimit: inst.alarmHigh,
      highHighLimit: inst.tripHigh
    });
  });

  return tags;
}

/**
 * Generates active plant alarms
 */
export function generateActiveAlarms(): ScadaAlarm[] {
  return [
    {
      id: 'ALM-101',
      tag: 'AIT-TURB-101',
      description: 'Raw Water Inlet Turbidity Spike Above Warning Threshold',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      priority: 'HIGH',
      condition: 'HIGH',
      currentValue: '185.4 NTU',
      limitValue: '150.0 NTU',
      cause: 'Monsoon heavy rain surface runoff in river catchments',
      effect: 'Requires elevated coagulant dosage pacing to maintain clarity',
      recommendedAction: 'Increase Alum dosing pump frequency and verify flash mixer G-value',
      acknowledged: false,
      shelved: false
    },
    {
      id: 'ALM-102',
      tag: 'PMP-RAW-01A',
      description: 'Raw Water Duty Pump A VFD High Bearing Temperature Warning',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      priority: 'MEDIUM',
      condition: 'HIGH',
      currentValue: '72.4 °C',
      limitValue: '70.0 °C',
      cause: 'Motor bearing lubrication degradation or high ambient heat',
      effect: 'Risk of thermal trip if bearing temp exceeds 85°C',
      recommendedAction: 'Inspect motor fan cowl and execute auto-switchover to Standby Pump 01B',
      acknowledged: true,
      shelved: false
    },
    {
      id: 'ALM-103',
      tag: 'LIT-CWR-501',
      description: 'Clear Water Reservoir High Storage Level Advisory',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      priority: 'LOW',
      condition: 'HIGH',
      currentValue: '5.85 m',
      limitValue: '5.80 m',
      cause: 'Distribution network demand drop during late night off-peak hours',
      effect: 'CWR approaching 95% full tank capacity',
      recommendedAction: 'Throttle raw water intake pumping speed via VFD to match output demand',
      acknowledged: true,
      shelved: false
    }
  ];
}

/**
 * Energy Monitoring Summary
 */
export function calculateEnergyMonitoring(state: CalculatedWtpState): EnergyMetrics {
  const instantaneousPowerKw = state.totalDemandLoadKw || 480;
  const apparentPowerKva = instantaneousPowerKw / 0.85;
  const dailyEnergyKwh = instantaneousPowerKw * 24;
  const totalWaterProducedM3 = (state.plantCapacityMLD || 50) * 1000;
  const specificEnergyKwhM3 = Number((dailyEnergyKwh / totalWaterProducedM3).toFixed(3));
  const energyCostTodayUSD = Number((dailyEnergyKwh * 0.085).toFixed(2)); // $0.085 per kWh

  return {
    instantaneousPowerKw: Number(instantaneousPowerKw.toFixed(1)),
    apparentPowerKva: Number(apparentPowerKva.toFixed(1)),
    powerFactor: 0.85,
    dailyEnergyKwh: Math.round(dailyEnergyKwh),
    specificEnergyKwhM3,
    energyCostTodayUSD,
    plantEfficiencyPercent: 94.2
  };
}

/**
 * Industrial Network Topology Definition
 */
export function getIndustrialNetworkArchitecture(): NetworkDevice[] {
  return [
    {
      id: 'NET-01',
      deviceName: 'PLC-01 Main Process Controller (Dual CPU)',
      ipAddress: '192.168.10.10',
      protocol: 'PROFINET',
      role: 'PLC_MASTER',
      status: 'ONLINE',
      redundantLink: true
    },
    {
      id: 'NET-02',
      deviceName: 'PLC-02 Filter & Backwash Controller',
      ipAddress: '192.168.10.11',
      protocol: 'PROFINET',
      role: 'PLC_MASTER',
      status: 'ONLINE',
      redundantLink: true
    },
    {
      id: 'NET-03',
      deviceName: 'RIO-01 Intake Remote I/O Rack',
      ipAddress: '192.168.10.20',
      protocol: 'ETHERNET_IP',
      role: 'REMOTE_IO',
      status: 'ONLINE',
      redundantLink: true
    },
    {
      id: 'NET-04',
      deviceName: 'SCADA-SRV-01 Primary Redundant Historian',
      ipAddress: '192.168.10.100',
      protocol: 'OPC_UA',
      role: 'SCADA_SERVER',
      status: 'ONLINE',
      redundantLink: true
    },
    {
      id: 'NET-05',
      deviceName: 'ENG-STATION-01 Engineering Workstation',
      ipAddress: '192.168.10.102',
      protocol: 'OPC_UA',
      role: 'ENGINEERING_STATION',
      status: 'STANDBY',
      redundantLink: false
    }
  ];
}
