/**
 * EVLab Unit Conversion Engine
 * Base internal calculations always use SI units:
 * - Length: meters (m)
 * - Area: m^2
 * - Volume: m^3
 * - Flow / Discharge: m^3/s
 * - Velocity: m/s
 * - Pressure: Pascals (Pa)
 * - Head: meters (m)
 * - Density: kg/m^3
 * - Dynamic Viscosity: Pa.s (N.s/m^2)
 * - Kinematic Viscosity: m^2/s
 * - Power: Watts (W) or kW
 * - Temperature: Celsius (°C)
 * - Roughness: meters (m) or mm
 */

import { UnitSystem } from '../types';

export interface UnitDefinition {
  symbol: string;
  name: string;
  toSI: (val: number) => number;
  fromSI: (val: number) => number;
}

export const UNIT_CONFIG: Record<string, Record<UnitSystem, string>> = {
  length: { SI: 'm', Metric: 'mm', US: 'ft' },
  pipeDiameter: { SI: 'm', Metric: 'mm', US: 'in' },
  pipeLength: { SI: 'm', Metric: 'm', US: 'ft' },
  area: { SI: 'm²', Metric: 'cm²', US: 'ft²' },
  flow: { SI: 'm³/s', Metric: 'L/s', US: 'gpm' },
  velocity: { SI: 'm/s', Metric: 'm/s', US: 'ft/s' },
  pressure: { SI: 'kPa', Metric: 'bar', US: 'psi' },
  head: { SI: 'm', Metric: 'm', US: 'ft' },
  density: { SI: 'kg/m³', Metric: 'kg/m³', US: 'lb/ft³' },
  viscosity: { SI: 'Pa·s', Metric: 'cP', US: 'lb·s/ft²' },
  roughness: { SI: 'mm', Metric: 'mm', US: 'in' },
  power: { SI: 'kW', Metric: 'kW', US: 'hp' },
  temperature: { SI: '°C', Metric: '°C', US: '°F' },
  slope: { SI: 'm/m', Metric: 'm/m', US: 'ft/ft' },
};

// Conversions to / from SI base
export const CONVERSIONS = {
  // Length (Base = m)
  length: {
    m: (v: number) => v,
    mm: (v: number) => v / 1000,
    cm: (v: number) => v / 100,
    in: (v: number) => v * 0.0254,
    ft: (v: number) => v * 0.3048,
  },
  lengthFromSI: {
    m: (v: number) => v,
    mm: (v: number) => v * 1000,
    cm: (v: number) => v * 100,
    in: (v: number) => v / 0.0254,
    ft: (v: number) => v / 0.3048,
  },

  // Flow / Discharge (Base = m^3/s)
  flow: {
    'm³/s': (v: number) => v,
    'L/s': (v: number) => v / 1000,
    'L/min': (v: number) => v / 60000,
    'm³/h': (v: number) => v / 3600,
    gpm: (v: number) => v * 0.0000630902, // US Gallons per minute
    cfs: (v: number) => v * 0.0283168, // cubic feet per second
  },
  flowFromSI: {
    'm³/s': (v: number) => v,
    'L/s': (v: number) => v * 1000,
    'L/min': (v: number) => v * 60000,
    'm³/h': (v: number) => v * 3600,
    gpm: (v: number) => v / 0.0000630902,
    cfs: (v: number) => v / 0.0283168,
  },

  // Velocity (Base = m/s)
  velocity: {
    'm/s': (v: number) => v,
    'km/h': (v: number) => v / 3.6,
    'ft/s': (v: number) => v * 0.3048,
    mph: (v: number) => v * 0.44704,
  },
  velocityFromSI: {
    'm/s': (v: number) => v,
    'km/h': (v: number) => v * 3.6,
    'ft/s': (v: number) => v / 0.3048,
    mph: (v: number) => v / 0.44704,
  },

  // Pressure (Base = Pa)
  pressure: {
    Pa: (v: number) => v,
    kPa: (v: number) => v * 1000,
    MPa: (v: number) => v * 1e6,
    bar: (v: number) => v * 100000,
    psi: (v: number) => v * 6894.757,
    atm: (v: number) => v * 101325,
    'm-H2O': (v: number) => v * 9806.65,
    'ft-H2O': (v: number) => v * 2989.067,
  },
  pressureFromSI: {
    Pa: (v: number) => v,
    kPa: (v: number) => v / 1000,
    MPa: (v: number) => v / 1e6,
    bar: (v: number) => v / 100000,
    psi: (v: number) => v / 6894.757,
    atm: (v: number) => v / 101325,
    'm-H2O': (v: number) => v / 9806.65,
    'ft-H2O': (v: number) => v / 2989.067,
  },

  // Density (Base = kg/m^3)
  density: {
    'kg/m³': (v: number) => v,
    'g/cm³': (v: number) => v * 1000,
    'lb/ft³': (v: number) => v * 16.0185,
    'slug/ft³': (v: number) => v * 515.3788,
  },
  densityFromSI: {
    'kg/m³': (v: number) => v,
    'g/cm³': (v: number) => v / 1000,
    'lb/ft³': (v: number) => v / 16.0185,
    'slug/ft³': (v: number) => v / 515.3788,
  },

  // Dynamic Viscosity (Base = Pa.s = N.s/m^2)
  viscosity: {
    'Pa·s': (v: number) => v,
    'N·s/m²': (v: number) => v,
    cP: (v: number) => v / 1000, // Centipoise
    Poise: (v: number) => v / 10,
    'lb·s/ft²': (v: number) => v * 47.88026,
  },
  viscosityFromSI: {
    'Pa·s': (v: number) => v,
    'N·s/m²': (v: number) => v,
    cP: (v: number) => v * 1000,
    Poise: (v: number) => v * 10,
    'lb·s/ft²': (v: number) => v / 47.88026,
  },

  // Power (Base = Watts)
  power: {
    W: (v: number) => v,
    kW: (v: number) => v * 1000,
    hp: (v: number) => v * 745.699872, // Mechanical Horsepower
    'ft·lb/s': (v: number) => v * 1.355818,
  },
  powerFromSI: {
    W: (v: number) => v,
    kW: (v: number) => v / 1000,
    hp: (v: number) => v / 745.699872,
    'ft·lb/s': (v: number) => v / 1.355818,
  },

  // Temperature
  tempToC: (v: number, unit: string) => {
    if (unit === '°F') return ((v - 32) * 5) / 9;
    if (unit === 'K') return v - 273.15;
    return v;
  },
  tempFromC: (c: number, unit: string) => {
    if (unit === '°F') return (c * 9) / 5 + 32;
    if (unit === 'K') return c + 273.15;
    return c;
  }
};

/**
 * Format helper for numbers with units
 */
export function formatWithUnit(val: number, unit: string, decimals = 3): string {
  if (isNaN(val) || !isFinite(val)) return `--- ${unit}`;
  if (Math.abs(val) > 0 && Math.abs(val) < 0.0001) {
    return `${val.toExponential(3)} ${unit}`;
  }
  return `${Number(val.toFixed(decimals)).toLocaleString()} ${unit}`;
}

export function formatSI(val: number, decimals = 3): string {
  if (isNaN(val) || !isFinite(val)) return '---';
  if (Math.abs(val) > 0 && Math.abs(val) < 0.0001) {
    return val.toExponential(3);
  }
  return Number(val.toFixed(decimals)).toLocaleString();
}
