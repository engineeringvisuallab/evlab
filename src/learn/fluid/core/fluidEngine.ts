/**
 * EVLab Fluid Properties Engine
 * Centralized registry and temperature-dependent property solvers
 */

import { FluidProperty } from '../types';

export const STANDARD_GRAVITY = 9.80665; // m/s^2

/**
 * Calculates water properties as a function of temperature T in Celsius (0 to 100°C)
 * Uses standard IAPWS empirical formulations.
 */
export function getWaterPropertiesAtTemperature(tempC: number): FluidProperty {
  const T = Math.max(0, Math.min(100, tempC));

  // Density of pure liquid water (kg/m^3) - Kell's formulation
  const density = 999.842594 +
    (0.06793952 * T) -
    (0.009095290 * Math.pow(T, 2)) +
    (0.0001001685 * Math.pow(T, 3)) -
    (0.000001120083 * Math.pow(T, 4)) +
    (0.000000006536332 * Math.pow(T, 5));

  // Dynamic Viscosity of water (Pa.s = N.s/m^2) - Vogel equation
  // mu(T) = A * 10^(B / (T - C)) where T in Kelvin
  const TK = T + 273.15;
  const dynamicViscosity = 0.00002414 * Math.pow(10, 247.8 / (TK - 140));

  // Kinematic Viscosity (m^2/s)
  const kinematicViscosity = dynamicViscosity / density;

  // Specific Weight (N/m^3)
  const specificWeight = density * STANDARD_GRAVITY;

  // Specific Gravity (dimensionless relative to 4°C water = 1000 kg/m^3)
  const specificGravity = density / 1000.0;

  // Vapor Pressure (Pa) - Antoine Equation for Water
  // log10(P_mmHg) = A - (B / (T + C))
  const pVapor_mmHg = Math.pow(10, 8.07131 - (1730.63 / (T + 233.426)));
  const vaporPressure = pVapor_mmHg * 133.322; // convert mmHg to Pa

  // Bulk Modulus of Elasticity (Pa)
  const bulkModulus = 2.18e9 * (1 - 0.002 * (T - 20));

  // Surface Tension in contact with air (N/m)
  const surfaceTension = 0.0756 - 0.00014 * T;

  return {
    id: `water_${T.toFixed(0)}c`,
    name: `Water @ ${T.toFixed(1)}°C`,
    chemicalFormula: 'H₂O',
    temperature: T,
    density,
    dynamicViscosity,
    kinematicViscosity,
    specificWeight,
    specificGravity,
    vaporPressure,
    bulkModulus,
    surfaceTension,
  };
}

/**
 * Calculates air properties as a function of temperature T in Celsius (-20 to 100°C) at 1 atm
 */
export function getAirPropertiesAtTemperature(tempC: number, pressurePa = 101325): FluidProperty {
  const T = Math.max(-40, Math.min(200, tempC));
  const TK = T + 273.15;
  const R_air = 287.058; // J/(kg.K)

  // Ideal gas law density
  const density = pressurePa / (R_air * TK);

  // Sutherland's law for dynamic viscosity of air
  // mu = mu_0 * (T/T0)^(3/2) * (T0 + S)/(T + S)
  const T0 = 273.15;
  const mu0 = 1.716e-5; // Pa.s
  const S = 110.4; // Sutherland constant for air
  const dynamicViscosity = mu0 * Math.pow(TK / T0, 1.5) * ((T0 + S) / (TK + S));
  const kinematicViscosity = dynamicViscosity / density;
  const specificWeight = density * STANDARD_GRAVITY;
  const specificGravity = density / 1000.0;

  return {
    id: `air_${T.toFixed(0)}c`,
    name: `Air @ ${T.toFixed(1)}°C (1 atm)`,
    chemicalFormula: 'N₂/O₂',
    temperature: T,
    density,
    dynamicViscosity,
    kinematicViscosity,
    specificWeight,
    specificGravity,
    vaporPressure: 0,
    bulkModulus: 1.4 * pressurePa, // Isentropic bulk modulus gamma*P
    surfaceTension: 0,
  };
}

export const PRESET_FLUIDS: FluidProperty[] = [
  getWaterPropertiesAtTemperature(20), // Standard Water @ 20°C
  getWaterPropertiesAtTemperature(4),  // Maximum density water @ 4°C
  getWaterPropertiesAtTemperature(60), // Hot water @ 60°C
  getWaterPropertiesAtTemperature(90), // Very hot water @ 90°C
  getAirPropertiesAtTemperature(20),   // Air @ 20°C
  {
    id: 'seawater_20c',
    name: 'Seawater (3.5% Salinity)',
    chemicalFormula: 'H₂O + Salts',
    temperature: 20,
    density: 1025,
    dynamicViscosity: 1.08e-3,
    kinematicViscosity: 1.08e-3 / 1025,
    specificWeight: 1025 * STANDARD_GRAVITY,
    specificGravity: 1.025,
    vaporPressure: 2300,
    bulkModulus: 2.3e9,
    surfaceTension: 0.073,
  },
  {
    id: 'engine_oil_sae30',
    name: 'Engine Oil (SAE 30)',
    chemicalFormula: 'Hydrocarbons',
    temperature: 20,
    density: 888,
    dynamicViscosity: 0.29, // 290 cP
    kinematicViscosity: 0.29 / 888,
    specificWeight: 888 * STANDARD_GRAVITY,
    specificGravity: 0.888,
    vaporPressure: 0.1,
    bulkModulus: 1.5e9,
    surfaceTension: 0.035,
  },
  {
    id: 'glycerin_20c',
    name: 'Glycerin (100%)',
    chemicalFormula: 'C₃H₈O₃',
    temperature: 20,
    density: 1260,
    dynamicViscosity: 1.49, // 1490 cP (high viscosity)
    kinematicViscosity: 1.49 / 1260,
    specificWeight: 1260 * STANDARD_GRAVITY,
    specificGravity: 1.26,
    vaporPressure: 0.01,
    bulkModulus: 4.5e9,
    surfaceTension: 0.063,
  },
  {
    id: 'crude_oil_light',
    name: 'Light Crude Oil',
    chemicalFormula: 'Hydrocarbons',
    temperature: 20,
    density: 855,
    dynamicViscosity: 0.0072,
    kinematicViscosity: 0.0072 / 855,
    specificWeight: 855 * STANDARD_GRAVITY,
    specificGravity: 0.855,
    vaporPressure: 30000,
    bulkModulus: 1.3e9,
    surfaceTension: 0.028,
  },
  {
    id: 'mercury_20c',
    name: 'Mercury (Liquid Metal)',
    chemicalFormula: 'Hg',
    temperature: 20,
    density: 13550,
    dynamicViscosity: 1.53e-3,
    kinematicViscosity: 1.53e-3 / 13550,
    specificWeight: 13550 * STANDARD_GRAVITY,
    specificGravity: 13.55,
    vaporPressure: 0.16,
    bulkModulus: 2.8e10,
    surfaceTension: 0.484,
  },
  {
    id: 'gasoline_20c',
    name: 'Gasoline (Unleaded)',
    chemicalFormula: 'C₈H₁₈ blend',
    temperature: 20,
    density: 680,
    dynamicViscosity: 2.9e-4,
    kinematicViscosity: 2.9e-4 / 680,
    specificWeight: 680 * STANDARD_GRAVITY,
    specificGravity: 0.68,
    vaporPressure: 55000,
    bulkModulus: 1.0e9,
    surfaceTension: 0.022,
  },
];

export const FLUID_PRESETS = [
  { id: 'water', name: 'Liquid Water (H₂O)', baseDensity: 998.2 },
  { id: 'seawater', name: 'Seawater (3.5% Salinity)', baseDensity: 1025 },
  { id: 'crude_oil', name: 'Light Crude Oil', baseDensity: 855 },
  { id: 'gasoline', name: 'Gasoline', baseDensity: 680 },
  { id: 'engine_oil', name: 'Engine Oil (SAE 30)', baseDensity: 888 },
  { id: 'glycerin', name: 'Glycerin (100%)', baseDensity: 1260 },
  { id: 'mercury', name: 'Liquid Mercury (Hg)', baseDensity: 13550 },
  { id: 'air', name: 'Dry Air (1 atm)', baseDensity: 1.204 },
];

export function getFluidProperties(fluidIdOrName: string = 'water', tempC: number = 20): FluidProperty {
  const id = fluidIdOrName.toLowerCase();
  if (id.includes('air')) {
    return getAirPropertiesAtTemperature(tempC);
  }
  if (id.includes('engine') || id.includes('sae')) {
    return { ...PRESET_FLUIDS[6], temperature: tempC };
  }
  if (id.includes('crude') || id.includes('oil')) {
    return { ...PRESET_FLUIDS[8], temperature: tempC };
  }
  if (id.includes('glycerin')) {
    return { ...PRESET_FLUIDS[7], temperature: tempC };
  }
  if (id.includes('mercury')) {
    return { ...PRESET_FLUIDS[9], temperature: tempC };
  }
  if (id.includes('seawater')) {
    return { ...PRESET_FLUIDS[5], temperature: tempC };
  }
  if (id.includes('gasoline')) {
    return { ...PRESET_FLUIDS[10], temperature: tempC };
  }
  // Default to water with empirical IAPWS temperature formulation
  return getWaterPropertiesAtTemperature(tempC);
}


