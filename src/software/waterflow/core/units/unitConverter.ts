/**
 * EVLab WaterFlow - Unit Conversion Module
 * Converts between internal base SI values and displayed engineering units.
 */

import { FlowUnit, UnitSystem } from '../../types/waterflow';

// Flow conversion factors to internal L/s
const FLOW_TO_LPS: Record<FlowUnit, number> = {
  LPS: 1.0,             // Liters / sec
  LPM: 1 / 60,          // Liters / min
  MLD: 1000000 / 86400, // Million Liters / Day (~11.574 L/s)
  CMS: 1000.0,          // m3 / sec
  CMH: 1000 / 3600,     // m3 / hour (~0.2778 L/s)
  GPM: 0.0630901964,    // US Gallons / min
  MGD: 43.8126364,      // Million US Gallons / Day
  CFS: 28.3168466,      // Cubic feet / sec
};

export class UnitConverter {
  /**
   * Convert internal L/s flow to requested FlowUnit
   */
  static convertFlowFromLps(flowLps: number, unit: FlowUnit): number {
    const factor = FLOW_TO_LPS[unit] || 1.0;
    return flowLps / factor;
  }

  /**
   * Convert user input FlowUnit to internal L/s
   */
  static convertFlowToLps(flowValue: number, unit: FlowUnit): number {
    const factor = FLOW_TO_LPS[unit] || 1.0;
    return flowValue * factor;
  }

  /**
   * Format Pressure (m H2O or kPa to display unit)
   * Internal pressure stored as kPa or m H2O head.
   * 1 m H2O = 9.80665 kPa = 1.42233 psi
   */
  static formatPressure(pressureKPa: number, unitSystem: UnitSystem): { value: number; unitStr: string } {
    if (unitSystem === 'US') {
      // kPa -> psi (1 kPa = 0.145038 psi)
      return { value: pressureKPa * 0.145038, unitStr: 'psi' };
    }
    // SI -> kPa or m H2O
    return { value: pressureKPa, unitStr: 'kPa' };
  }

  /**
   * Convert head (m) to pressure (kPa or psi)
   */
  static headToPressure(headMeters: number, unitSystem: UnitSystem): { value: number; unitStr: string } {
    const kPa = headMeters * 9.80665;
    if (unitSystem === 'US') {
      return { value: kPa * 0.145038, unitStr: 'psi' };
    }
    return { value: kPa, unitStr: 'kPa' };
  }

  /**
   * Length conversion (meters to ft if US)
   */
  static formatLength(meters: number, unitSystem: UnitSystem): { value: number; unitStr: string } {
    if (unitSystem === 'US') {
      return { value: meters * 3.28084, unitStr: 'ft' };
    }
    return { value: meters, unitStr: 'm' };
  }

  /**
   * Diameter conversion (mm to inches if US)
   */
  static formatDiameter(mm: number, unitSystem: UnitSystem): { value: number; unitStr: string } {
    if (unitSystem === 'US') {
      return { value: mm / 25.4, unitStr: 'in' };
    }
    return { value: mm, unitStr: 'mm' };
  }

  /**
   * Velocity conversion (m/s to ft/s if US)
   */
  static formatVelocity(mPerSec: number, unitSystem: UnitSystem): { value: number; unitStr: string } {
    if (unitSystem === 'US') {
      return { value: mPerSec * 3.28084, unitStr: 'ft/s' };
    }
    return { value: mPerSec, unitStr: 'm/s' };
  }

  /**
   * Headloss gradient (m/km or ft/1000ft)
   */
  static formatHeadlossGradient(mPerKm: number, unitSystem: UnitSystem): { value: number; unitStr: string } {
    if (unitSystem === 'US') {
      // 1 m/km = 1 ft / 1000 ft
      return { value: mPerKm, unitStr: 'ft/kft' };
    }
    return { value: mPerKm, unitStr: 'm/km' };
  }

  /**
   * Default flow unit for a unit system
   */
  static getDefaultFlowUnit(unitSystem: UnitSystem): FlowUnit {
    return unitSystem === 'SI' ? 'LPS' : 'GPM';
  }
}
