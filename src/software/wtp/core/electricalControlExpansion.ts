/**
 * EVL WTP Engineering Suite - Complete Electrical, Instrumentation, SCADA & Cybersecurity Engine
 * Generates Electrical Load Schedule, Cable Schedule, Short Circuit Sizing, Instrument Index,
 * I/O List, Cause & Effect Matrix, and ISA/IEC 62443 Cybersecurity Architecture.
 */

export interface CableScheduleItem {
  id: string;
  cableTag: string;
  fromLocation: string;
  toLocation: string;
  operatingCurrentAmp: number;
  cableSizeMm2: string;
  numCores: number;
  conductorMaterial: 'Copper (Cu)' | 'Aluminum (Al)';
  insulationType: 'XLPE/SWA/PVC' | 'PVC/PVC';
  voltageDropPct: number;
  voltageDropStatus: 'PASS' | 'WARNING' | 'FAIL';
  lengthM: number;
}

export interface ShortCircuitCalcResult {
  transformerKva: number;
  primaryVoltageKv: number;
  secondaryVoltageV: number;
  impedanceZPct: number;
  shortCircuitCurrentKa: number;
  breakerRatingKa: number;
  status: 'PASS' | 'WARNING';
}

export interface CauseAndEffectItem {
  id: string;
  causeTag: string;
  causeDescription: string;
  condition: string;
  effectTag: string;
  effectAction: string;
  interlockType: 'Safety Trip (Hardwired)' | 'Process Interlock (PLC)' | 'Permissive Start';
}

export interface CybersecurityZoneConfig {
  zoneId: string;
  zoneName: string;
  isa62443Level: 'SL-1' | 'SL-2' | 'SL-3';
  componentsIncluded: string[];
  firewallRules: string;
  encryptionProtocol: string;
}

export function generateElectricalAndControlExpansion(
  capacityMLD: number = 100
): {
  cables: CableScheduleItem[];
  shortCircuit: ShortCircuitCalcResult;
  causeAndEffect: CauseAndEffectItem[];
  cybersecurityZones: CybersecurityZoneConfig[];
} {
  // 1. Cable Schedule
  const cablesData = [
    { tag: 'CBL-TX1-MCC', from: 'Substation Transformer TX-1 (2500kVA)', to: 'Main 415V PCC-1 Switchgear', I: 3120, size: '4x3x1x300', cores: 4, mat: 'Copper (Cu)' as const, Vdrop: 0.85, len: 45 },
    { tag: 'CBL-RAW-P1', from: 'Main MCC-1 VFD Panel', to: 'Raw Water Pump RWP-001 (90kW)', I: 165, size: '3x1x95', cores: 3, mat: 'Copper (Cu)' as const, Vdrop: 1.25, len: 120 },
    { tag: 'CBL-HLP-P1', from: 'Main MCC-2 VFD Panel', to: 'High Lift Pump HLP-001 (315kW)', I: 560, size: '3x1x240', cores: 3, mat: 'Copper (Cu)' as const, Vdrop: 1.85, len: 180 },
    { tag: 'CBL-BW-BL1', from: 'Auxiliary MCC-3 Panel', to: 'Filter Backwash Blower BLW-001 (55kW)', I: 102, size: '3x1x50', cores: 3, mat: 'Copper (Cu)' as const, Vdrop: 1.10, len: 85 }
  ];

  const cables: CableScheduleItem[] = cablesData.map((c, idx) => ({
    id: `CBL-SCH-${idx + 1}`,
    cableTag: c.tag,
    fromLocation: c.from,
    toLocation: c.to,
    operatingCurrentAmp: c.I,
    cableSizeMm2: c.size,
    numCores: c.cores,
    conductorMaterial: c.mat,
    insulationType: 'XLPE/SWA/PVC',
    voltageDropPct: c.Vdrop,
    voltageDropStatus: c.Vdrop <= 3.0 ? 'PASS' : 'WARNING',
    lengthM: c.len
  }));

  // 2. Short Circuit Current Calculation:
  // I_sc = (S_tx * 1000) / (sqrt(3) * V_sec * (Z_tx / 100))
  const txKva = 2500;
  const vSec = 415; // Volts
  const zPct = 6.0; // 6% impedance
  const i_sc_amp = (txKva * 1000) / (Math.sqrt(3) * vSec * (zPct / 100));
  const i_sc_ka = i_sc_amp / 1000;
  const breakerKa = 50.0; // 50kA busbar rating

  const shortCircuit: ShortCircuitCalcResult = {
    transformerKva: txKva,
    primaryVoltageKv: 11.0,
    secondaryVoltageV: vSec,
    impedanceZPct: zPct,
    shortCircuitCurrentKa: Number(i_sc_ka.toFixed(2)),
    breakerRatingKa: breakerKa,
    status: breakerKa >= i_sc_ka ? 'PASS' : 'WARNING'
  };

  // 3. Cause & Effect Interlock Matrix
  const causeAndEffect: CauseAndEffectItem[] = [
    { id: 'CE-001', causeTag: 'LSHH-CWR-001', causeDescription: 'Clear Water Reservoir High-High Water Level', condition: 'CWR Level >= 4.5m', effectTag: 'VLV-DIS-01', effectAction: 'Close Filter Effluent Header Valve & Trip High Lift Pumps', interlockType: 'Safety Trip (Hardwired)' },
    { id: 'CE-002', causeTag: 'LSL-INT-001', causeDescription: 'Intake Wet Well Low-Low Water Level', condition: 'Wet Well Level <= 0.8m', effectTag: 'PMP-RAW-ALL', effectAction: 'Trip All Raw Water Intake Pumps to prevent dry run cavitation', interlockType: 'Safety Trip (Hardwired)' },
    { id: 'CE-003', causeTag: 'AIT-CHL-001', causeDescription: 'Chlorine Leak Detector High Alarm', condition: 'Chlorine Concentration >= 3.0 ppm', effectTag: 'SCR-CHL-001', effectAction: 'Start Emergency Caustic Soda Gas Scrubber & Trip Cylinder Shutoff', interlockType: 'Safety Trip (Hardwired)' },
    { id: 'CE-004', causeTag: 'FIT-BW-001', causeDescription: 'Filter Backwash Flowmeter Low Flow', condition: 'Backwash Flow < 80% Setpoint', effectTag: 'ALM-FLT-BW', effectAction: 'Generate SCADA Alarm & Pause Backwash Sequence', interlockType: 'Process Interlock (PLC)' }
  ];

  // 4. Cybersecurity ISA/IEC 62443 Architecture
  const cybersecurityZones: CybersecurityZoneConfig[] = [
    {
      zoneId: 'SEC-ZONE-01',
      zoneName: 'Enterprise & Remote Management Zone (Zone 1)',
      isa62443Level: 'SL-1',
      componentsIncluded: ['Corporate ERP/GIS Gateway', 'Web Telemetry Dashboard'],
      firewallRules: 'HTTPS (443) with TLS 1.3 encryption & Dual-Factor Auth',
      encryptionProtocol: 'AES-256 / RSA-4096'
    },
    {
      zoneId: 'SEC-ZONE-02',
      zoneName: 'SCADA Control Room & Historian Zone (Zone 2)',
      isa62443Level: 'SL-2',
      componentsIncluded: ['Redundant SCADA HMI Workstations', 'SQL Historian Server'],
      firewallRules: 'Industrial Stateful Inspection Firewall (DMZ Proxy)',
      encryptionProtocol: 'OPC-UA Security Profile (Sign & Encrypt)'
    },
    {
      zoneId: 'SEC-ZONE-03',
      zoneName: 'Field Control & PLC Instrumentation Network (Zone 3)',
      isa62443Level: 'SL-3',
      componentsIncluded: ['Hot-Standby PLC CPUs', 'Remote I/O Racks', 'VSD Drives'],
      firewallRules: 'Air-Gapped Fiber Ring Network with Port MAC Security',
      encryptionProtocol: 'IPSec Tunnel / Profinet Security Class 1'
    }
  ];

  return { cables, shortCircuit, causeAndEffect, cybersecurityZones };
}
