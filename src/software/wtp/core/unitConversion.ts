/**
 * EVL WTP Engineering Suite - Universal Unit Conversion Engine
 * Rigorous conversion across Flow, Concentration, Power, Pressure, Length, Mass, Rate
 */

export interface UnitDefinition {
  code: string;
  label: string;
  category: string;
  toBaseFactor: number; // Multiplier to get to SI base unit
  offset?: number;
}

export const UNIT_DATABASE: Record<string, UnitDefinition[]> = {
  flow: [
    { code: 'MLD', label: 'Megaliters/day (MLD)', category: 'flow', toBaseFactor: 1000 / 86400 }, // Base SI: m3/s
    { code: 'm3/day', label: 'Cubic meters/day (m³/day)', category: 'flow', toBaseFactor: 1 / 86400 },
    { code: 'm3/hr', label: 'Cubic meters/hour (m³/hr)', category: 'flow', toBaseFactor: 1 / 3600 },
    { code: 'L/s', label: 'Liters/second (L/s)', category: 'flow', toBaseFactor: 0.001 },
    { code: 'L/min', label: 'Liters/minute (L/min)', category: 'flow', toBaseFactor: 0.001 / 60 },
    { code: 'm3/s', label: 'Cubic meters/second (m³/s)', category: 'flow', toBaseFactor: 1.0 },
    { code: 'GPM', label: 'US Gallons/minute (GPM)', category: 'flow', toBaseFactor: 0.0000630901994 }
  ],
  concentration: [
    { code: 'mg/L', label: 'Milligrams/Liter (mg/L)', category: 'concentration', toBaseFactor: 1.0 }, // Base: mg/L
    { code: 'ppm', label: 'Parts per million (ppm)', category: 'concentration', toBaseFactor: 1.0 },
    { code: 'g/L', label: 'Grams/Liter (g/L)', category: 'concentration', toBaseFactor: 1000.0 },
    { code: 'ug/L', label: 'Micrograms/Liter (μg/L)', category: 'concentration', toBaseFactor: 0.001 },
    { code: '% w/v', label: 'Percent weight/vol (% w/v)', category: 'concentration', toBaseFactor: 10000.0 }
  ],
  mass: [
    { code: 'kg/day', label: 'Kilograms/day (kg/day)', category: 'mass', toBaseFactor: 1.0 / 86400 }, // Base: kg/s
    { code: 'kg/hr', label: 'Kilograms/hour (kg/hr)', category: 'mass', toBaseFactor: 1.0 / 3600 },
    { code: 'ton/day', label: 'Metric Tons/day (ton/day)', category: 'mass', toBaseFactor: 1000.0 / 86400 },
    { code: 'lbs/day', label: 'Pounds/day (lbs/day)', category: 'mass', toBaseFactor: 0.453592 / 86400 }
  ],
  power: [
    { code: 'kW', label: 'Kilowatts (kW)', category: 'power', toBaseFactor: 1.0 }, // Base: kW
    { code: 'W', label: 'Watts (W)', category: 'power', toBaseFactor: 0.001 },
    { code: 'HP', label: 'Horsepower (HP)', category: 'power', toBaseFactor: 0.7456 },
    { code: 'MW', label: 'Megawatts (MW)', category: 'power', toBaseFactor: 1000.0 }
  ],
  pressure: [
    { code: 'm', label: 'Meters head (m H2O)', category: 'pressure', toBaseFactor: 9.80665 }, // Base: kPa
    { code: 'kPa', label: 'Kilopascals (kPa)', category: 'pressure', toBaseFactor: 1.0 },
    { code: 'bar', label: 'Bar (bar)', category: 'pressure', toBaseFactor: 100.0 },
    { code: 'psi', label: 'Pounds/sq in (psi)', category: 'pressure', toBaseFactor: 6.89476 }
  ],
  length: [
    { code: 'mm', label: 'Millimeters (mm)', category: 'length', toBaseFactor: 0.001 }, // Base: m
    { code: 'm', label: 'Meters (m)', category: 'length', toBaseFactor: 1.0 },
    { code: 'cm', label: 'Centimeters (cm)', category: 'length', toBaseFactor: 0.01 },
    { code: 'km', label: 'Kilometers (km)', category: 'length', toBaseFactor: 1000.0 },
    { code: 'in', label: 'Inches (in)', category: 'length', toBaseFactor: 0.0254 }
  ]
};

export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: string
): number {
  if (fromUnit === toUnit) return value;
  const list = UNIT_DATABASE[category];
  if (!list) {
    throw new Error(`Incompatible unit category '${category}'. Conversion aborted.`);
  }

  const fromDef = list.find(u => u.code === fromUnit);
  const toDef = list.find(u => u.code === toUnit);

  if (!fromDef || !toDef) {
    console.warn(`Unit conversion fallback for ${fromUnit} -> ${toUnit}`);
    return value;
  }

  const baseValue = value * fromDef.toBaseFactor;
  return baseValue / toDef.toBaseFactor;
}

export function formatUnitValue(value: number, unit: string, decimals = 2): string {
  if (isNaN(value) || !isFinite(value)) return '-';
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} ${unit}`;
}
