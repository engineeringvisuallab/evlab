/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Unit System & Conversion Engine
 * @license Apache-2.0
 */

export type UnitDimension = 
  | 'FLOW'
  | 'LENGTH'
  | 'AREA'
  | 'VOLUME'
  | 'VELOCITY'
  | 'PRESSURE'
  | 'HEAD'
  | 'MASS'
  | 'MASS_LOADING'
  | 'CONCENTRATION'
  | 'POWER'
  | 'ENERGY'
  | 'TEMPERATURE'
  | 'TIME'
  | 'CURRENCY';

export interface UnitDefinition {
  symbol: string;
  dimension: UnitDimension;
  baseFactor: number; // Factor to convert to internal base unit
  description: string;
}

// Internal Normalized Base Units:
// - FLOW: m3/day
// - LENGTH: m
// - AREA: m2
// - VOLUME: m3
// - VELOCITY: m/s
// - PRESSURE: kPa
// - HEAD: m
// - MASS: kg
// - MASS_LOADING: kg/day
// - CONCENTRATION: mg/L (1 mg/L = 0.001 kg/m3)
// - POWER: kW
// - ENERGY: kWh
// - TEMPERATURE: °C
// - TIME: day
// - CURRENCY: USD

export const UNIT_CATALOG: Record<string, UnitDefinition> = {
  // Flow Units (Base = m3/day)
  'm3/day': { symbol: 'm3/day', dimension: 'FLOW', baseFactor: 1.0, description: 'Cubic meters per day' },
  'm3/h': { symbol: 'm3/h', dimension: 'FLOW', baseFactor: 24.0, description: 'Cubic meters per hour' },
  'L/s': { symbol: 'L/s', dimension: 'FLOW', baseFactor: 86.4, description: 'Liters per second' },
  'L/day': { symbol: 'L/day', dimension: 'FLOW', baseFactor: 0.001, description: 'Liters per day' },
  'MLD': { symbol: 'MLD', dimension: 'FLOW', baseFactor: 1000.0, description: 'Million Liters per Day' },

  // Length Units (Base = m)
  'm': { symbol: 'm', dimension: 'LENGTH', baseFactor: 1.0, description: 'Meters' },
  'mm': { symbol: 'mm', dimension: 'LENGTH', baseFactor: 0.001, description: 'Millimeters' },
  'km': { symbol: 'km', dimension: 'LENGTH', baseFactor: 1000.0, description: 'Kilometers' },

  // Area Units (Base = m2)
  'm2': { symbol: 'm2', dimension: 'AREA', baseFactor: 1.0, description: 'Square meters' },
  'ha': { symbol: 'ha', dimension: 'AREA', baseFactor: 10000.0, description: 'Hectares' },

  // Volume Units (Base = m3)
  'm3': { symbol: 'm3', dimension: 'VOLUME', baseFactor: 1.0, description: 'Cubic meters' },
  'L': { symbol: 'L', dimension: 'VOLUME', baseFactor: 0.001, description: 'Liters' },

  // Velocity Units (Base = m/s)
  'm/s': { symbol: 'm/s', dimension: 'VELOCITY', baseFactor: 1.0, description: 'Meters per second' },

  // Pressure Units (Base = kPa)
  'kPa': { symbol: 'kPa', dimension: 'PRESSURE', baseFactor: 1.0, description: 'Kilopascals' },
  'bar': { symbol: 'bar', dimension: 'PRESSURE', baseFactor: 100.0, description: 'Bar' },
  'm water': { symbol: 'm water', dimension: 'PRESSURE', baseFactor: 9.80665, description: 'Meters of water column' },

  // Head Units (Base = m)
  'm_head': { symbol: 'm', dimension: 'HEAD', baseFactor: 1.0, description: 'Meters of head' },

  // Mass Units (Base = kg)
  'kg': { symbol: 'kg', dimension: 'MASS', baseFactor: 1.0, description: 'Kilograms' },
  'tonne': { symbol: 'tonne', dimension: 'MASS', baseFactor: 1000.0, description: 'Metric Tonnes' },

  // Mass Loading Units (Base = kg/day)
  'kg/day': { symbol: 'kg/day', dimension: 'MASS_LOADING', baseFactor: 1.0, description: 'Kilograms per day' },
  'kg/m3/day': { symbol: 'kg/m3/day', dimension: 'MASS_LOADING', baseFactor: 1.0, description: 'Volumetric mass loading rate' },

  // Concentration Units (Base = mg/L)
  'mg/L': { symbol: 'mg/L', dimension: 'CONCENTRATION', baseFactor: 1.0, description: 'Milligrams per Liter (ppm equivalent)' },
  'g/L': { symbol: 'g/L', dimension: 'CONCENTRATION', baseFactor: 1000.0, description: 'Grams per Liter' },
  'kg/m3': { symbol: 'kg/m3', dimension: 'CONCENTRATION', baseFactor: 1000.0, description: 'Kilograms per cubic meter' },

  // Power Units (Base = kW)
  'W': { symbol: 'W', dimension: 'POWER', baseFactor: 0.001, description: 'Watts' },
  'kW': { symbol: 'kW', dimension: 'POWER', baseFactor: 1.0, description: 'Kilowatts' },
  'MW': { symbol: 'MW', dimension: 'POWER', baseFactor: 1000.0, description: 'Megawatts' },
  'HP': { symbol: 'HP', dimension: 'POWER', baseFactor: 0.7457, description: 'Horsepower' },

  // Energy Units (Base = kWh)
  'kWh': { symbol: 'kWh', dimension: 'ENERGY', baseFactor: 1.0, description: 'Kilowatt-hours' },
  'MWh': { symbol: 'MWh', dimension: 'ENERGY', baseFactor: 1000.0, description: 'Megawatt-hours' },

  // Temperature Units (Base = °C)
  '°C': { symbol: '°C', dimension: 'TEMPERATURE', baseFactor: 1.0, description: 'Degrees Celsius' },

  // Time Units (Base = day)
  's': { symbol: 's', dimension: 'TIME', baseFactor: 1 / 86400, description: 'Seconds' },
  'min': { symbol: 'min', dimension: 'TIME', baseFactor: 1 / 1440, description: 'Minutes' },
  'h': { symbol: 'h', dimension: 'TIME', baseFactor: 1 / 24, description: 'Hours' },
  'day': { symbol: 'day', dimension: 'TIME', baseFactor: 1.0, description: 'Days' },

  // Currency Units
  'USD': { symbol: 'USD', dimension: 'CURRENCY', baseFactor: 1.0, description: 'US Dollars' },
};

/**
 * Converts a numeric value from a source unit to a target unit safely.
 */
export function convertUnit(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return value;

  const sourceDef = UNIT_CATALOG[fromUnit];
  const targetDef = UNIT_CATALOG[toUnit];

  if (!sourceDef || !targetDef) {
    console.warn(`Unit conversion lookup failed for ${fromUnit} -> ${toUnit}. Returning original value.`);
    return value;
  }

  if (sourceDef.dimension !== targetDef.dimension) {
    throw new Error(`Incompatible unit dimensions: Cannot convert from ${fromUnit} (${sourceDef.dimension}) to ${toUnit} (${targetDef.dimension})`);
  }

  // Handle temperature special cases if needed in future (°F / K), currently °C base
  const baseValue = value * sourceDef.baseFactor;
  return baseValue / targetDef.baseFactor;
}

/**
 * Normalizes a value to its dimension's base unit.
 */
export function toBaseUnit(value: number, unit: string): { value: number; baseUnit: string } {
  const def = UNIT_CATALOG[unit];
  if (!def) return { value, baseUnit: unit };
  return {
    value: value * def.baseFactor,
    baseUnit: getBaseUnitForDimension(def.dimension),
  };
}

/**
 * Get base unit name for dimension.
 */
export function getBaseUnitForDimension(dimension: UnitDimension): string {
  switch (dimension) {
    case 'FLOW': return 'm3/day';
    case 'LENGTH': return 'm';
    case 'AREA': return 'm2';
    case 'VOLUME': return 'm3';
    case 'VELOCITY': return 'm/s';
    case 'PRESSURE': return 'kPa';
    case 'HEAD': return 'm';
    case 'MASS': return 'kg';
    case 'MASS_LOADING': return 'kg/day';
    case 'CONCENTRATION': return 'mg/L';
    case 'POWER': return 'kW';
    case 'ENERGY': return 'kWh';
    case 'TEMPERATURE': return '°C';
    case 'TIME': return 'day';
    case 'CURRENCY': return 'USD';
  }
}
