/**
 * EVLab BOQ - Engineering Units Engine
 */

export interface EngineeringUnit {
  code: string;
  name: string;
  category: 'Length' | 'Area' | 'Volume' | 'Weight' | 'Count' | 'Time' | 'Flow' | 'Custom';
  system: 'Metric' | 'Imperial' | 'Universal';
}

export const ENGINEERING_UNITS: EngineeringUnit[] = [
  // Length
  { code: 'mm', name: 'Millimeter', category: 'Length', system: 'Metric' },
  { code: 'cm', name: 'Centimeter', category: 'Length', system: 'Metric' },
  { code: 'm', name: 'Meter', category: 'Length', system: 'Metric' },
  { code: 'km', name: 'Kilometer', category: 'Length', system: 'Metric' },
  { code: 'in', name: 'Inch', category: 'Length', system: 'Imperial' },
  { code: 'ft', name: 'Foot', category: 'Length', system: 'Imperial' },
  { code: 'yd', name: 'Yard', category: 'Length', system: 'Imperial' },

  // Area
  { code: 'mm²', name: 'Square Millimeter', category: 'Area', system: 'Metric' },
  { code: 'cm²', name: 'Square Centimeter', category: 'Area', system: 'Metric' },
  { code: 'm²', name: 'Square Meter', category: 'Area', system: 'Metric' },
  { code: 'ha', name: 'Hectare', category: 'Area', system: 'Metric' },
  { code: 'ft²', name: 'Square Feet', category: 'Area', system: 'Imperial' },
  { code: 'acre', name: 'Acre', category: 'Area', system: 'Imperial' },

  // Volume
  { code: 'mm³', name: 'Cubic Millimeter', category: 'Volume', system: 'Metric' },
  { code: 'cm³', name: 'Cubic Centimeter', category: 'Volume', system: 'Metric' },
  { code: 'm³', name: 'Cubic Meter', category: 'Volume', system: 'Metric' },
  { code: 'L', name: 'Liter', category: 'Volume', system: 'Metric' },
  { code: 'ft³', name: 'Cubic Feet', category: 'Volume', system: 'Imperial' },
  { code: 'gal', name: 'Gallon', category: 'Volume', system: 'Imperial' },

  // Weight
  { code: 'kg', name: 'Kilogram', category: 'Weight', system: 'Metric' },
  { code: 'ton', name: 'Metric Tonne', category: 'Weight', system: 'Metric' },
  { code: 'qtl', name: 'Quintal', category: 'Weight', system: 'Metric' },
  { code: 'lbs', name: 'Pound', category: 'Weight', system: 'Imperial' },

  // Count
  { code: 'Nos', name: 'Numbers / Units', category: 'Count', system: 'Universal' },
  { code: 'Set', name: 'Set', category: 'Count', system: 'Universal' },
  { code: 'Pair', name: 'Pair', category: 'Count', system: 'Universal' },
  { code: 'Lot', name: 'Lump Sum Lot', category: 'Count', system: 'Universal' },

  // Time
  { code: 'hr', name: 'Hour', category: 'Time', system: 'Universal' },
  { code: 'day', name: 'Day', category: 'Time', system: 'Universal' },
  { code: 'month', name: 'Month', category: 'Time', system: 'Universal' },
  { code: 'shift', name: 'Shift', category: 'Time', system: 'Universal' },

  // Flow
  { code: 'm³/hr', name: 'Cubic Meters per Hour', category: 'Flow', system: 'Metric' },
  { code: 'm³/day', name: 'Cubic Meters per Day', category: 'Flow', system: 'Metric' },
  { code: 'MLD', name: 'Million Liters per Day', category: 'Flow', system: 'Metric' },
  { code: 'LPS', name: 'Liters per Second', category: 'Flow', system: 'Metric' },
];

export function getUnitsByCategory(category: EngineeringUnit['category']) {
  return ENGINEERING_UNITS.filter((u) => u.category === category);
}

export function isValidUnit(unitCode: string) {
  if (!unitCode || unitCode.trim() === '') return false;
  return true;
}
