export type UnitCategory = 'force' | 'length' | 'stress' | 'moment' | 'area' | 'inertia' | 'strain' | 'angle' | 'temperature';

export interface UnitDef {
  symbol: string;
  name: string;
  toBase: number; // Multiplier to convert to base SI unit (N, m, Pa, N*m, m2, m4, dimensionless, rad, K)
}

export const UNIT_DATABASE: Record<UnitCategory, Record<string, UnitDef>> = {
  force: {
    N: { symbol: 'N', name: 'Newton', toBase: 1 },
    kN: { symbol: 'kN', name: 'Kilonewton', toBase: 1e3 },
    MN: { symbol: 'MN', name: 'Meganewton', toBase: 1e6 },
    lbf: { symbol: 'lbf', name: 'Pound-force', toBase: 4.44822 },
    kip: { symbol: 'kip', name: 'Kilopound (1000 lbf)', toBase: 4448.22 },
  },
  length: {
    mm: { symbol: 'mm', name: 'Millimeter', toBase: 1e-3 },
    cm: { symbol: 'cm', name: 'Centimeter', toBase: 1e-2 },
    m: { symbol: 'm', name: 'Meter', toBase: 1 },
    in: { symbol: 'in', name: 'Inch', toBase: 0.0254 },
    ft: { symbol: 'ft', name: 'Foot', toBase: 0.3048 },
  },
  stress: {
    Pa: { symbol: 'Pa', name: 'Pascal', toBase: 1 },
    kPa: { symbol: 'kPa', name: 'Kilopascal', toBase: 1e3 },
    MPa: { symbol: 'MPa', name: 'Megapascal (N/mm²)', toBase: 1e6 },
    GPa: { symbol: 'GPa', name: 'Gigapascal', toBase: 1e9 },
    psi: { symbol: 'psi', name: 'Pounds per square inch', toBase: 6894.76 },
    ksi: { symbol: 'ksi', name: 'Kilopounds per square inch', toBase: 6.89476e6 },
  },
  moment: {
    'N*mm': { symbol: 'N·mm', name: 'Newton-millimeter', toBase: 1e-3 },
    'N*m': { symbol: 'N·m', name: 'Newton-meter', toBase: 1 },
    'kN*m': { symbol: 'kN·m', name: 'Kilonewton-meter', toBase: 1e3 },
    'lb*in': { symbol: 'lb·in', name: 'Pound-inch', toBase: 0.112985 },
    'kip*ft': { symbol: 'kip·ft', name: 'Kip-foot', toBase: 1355.82 },
  },
  area: {
    mm2: { symbol: 'mm²', name: 'Square millimeter', toBase: 1e-6 },
    cm2: { symbol: 'cm²', name: 'Square centimeter', toBase: 1e-4 },
    m2: { symbol: 'm²', name: 'Square meter', toBase: 1 },
    in2: { symbol: 'in²', name: 'Square inch', toBase: 0.00064516 },
  },
  inertia: {
    mm4: { symbol: 'mm⁴', name: 'Millimeter⁴', toBase: 1e-12 },
    cm4: { symbol: 'cm⁴', name: 'Centimeter⁴', toBase: 1e-8 },
    m4: { symbol: 'm⁴', name: 'Meter⁴', toBase: 1 },
    in4: { symbol: 'in⁴', name: 'Inch⁴', toBase: 4.162314e-7 },
  },
  strain: {
    'microstrain': { symbol: 'με', name: 'Microstrain', toBase: 1e-6 },
    'percent': { symbol: '%', name: 'Percentage', toBase: 0.01 },
    'ratio': { symbol: 'mm/mm', name: 'Strain Ratio', toBase: 1 },
  },
  angle: {
    deg: { symbol: '°', name: 'Degrees', toBase: Math.PI / 180 },
    rad: { symbol: 'rad', name: 'Radians', toBase: 1 },
  },
  temperature: {
    C: { symbol: '°C', name: 'Celsius', toBase: 1 },
    F: { symbol: '°F', name: 'Fahrenheit', toBase: 5 / 9 },
    K: { symbol: 'K', name: 'Kelvin', toBase: 1 },
  },
};

export function convertUnits(
  value: number,
  category: UnitCategory,
  fromUnit: string,
  toUnit: string
): number {
  const cat = UNIT_DATABASE[category];
  if (!cat || !cat[fromUnit] || !cat[toUnit]) return value;
  const baseValue = value * cat[fromUnit].toBase;
  return baseValue / cat[toUnit].toBase;
}

export function formatEngValue(value: number, precision: number = 2): string {
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e6 || (abs < 0.001 && abs > 0)) {
    return value.toExponential(precision);
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
}
