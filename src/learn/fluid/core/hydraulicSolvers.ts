/**
 * EVLab Complete Hydraulic Solvers Engine
 * All calculations use SI base units internally.
 */

import { STANDARD_GRAVITY, getWaterPropertiesAtTemperature } from './fluidEngine';
import { calculateFrictionFactor } from './frictionFactor';
import { CalculationTrace, FluidProperty } from '../types';

export const G = STANDARD_GRAVITY; // 9.80665 m/s^2

/**
 * 1. CONTINUITY LAB SOLVER
 */
export function solveContinuity(
  d1: number, // m
  d2: number, // m
  q_or_v1: { type: 'discharge' | 'velocity'; value: number }
) {
  const a1 = (Math.PI * Math.pow(d1, 2)) / 4;
  const a2 = (Math.PI * Math.pow(d2, 2)) / 4;

  let Q: number;
  let v1: number;
  let v2: number;

  if (q_or_v1.type === 'discharge') {
    Q = q_or_v1.value;
    v1 = a1 > 0 ? Q / a1 : 0;
  } else {
    v1 = q_or_v1.value;
    Q = a1 * v1;
  }

  v2 = a2 > 0 ? Q / a2 : 0;
  const areaRatio = a1 > 0 ? a2 / a1 : 1;
  const velocityRatio = v1 > 0 ? v2 / v1 : 1;

  const traces: CalculationTrace[] = [
    {
      id: 'FM-CON-001',
      name: 'Inlet Cross-Sectional Area A₁',
      formula: 'A₁ = π · D₁² / 4',
      latex: 'A_1 = \\frac{\\pi D_1^2}{4}',
      inputs: { d1: { value: d1, unit: 'm', symbol: 'D₁', label: 'Inlet Diameter' } },
      substitution: `A₁ = π · (${d1.toFixed(4)} m)² / 4`,
      result: { value: a1, unit: 'm²', symbol: 'A₁', label: 'Inlet Area' },
      assumptions: ['Circular pipe cross-section', 'Uniform diameter'],
      applicableRange: 'D₁ > 0',
      reference: 'Continuity Equation (Mass Conservation)',
    },
    {
      id: 'FM-CON-002',
      name: 'Outlet Cross-Sectional Area A₂',
      formula: 'A₂ = π · D₂² / 4',
      latex: 'A_2 = \\frac{\\pi D_2^2}{4}',
      inputs: { d2: { value: d2, unit: 'm', symbol: 'D₂', label: 'Outlet Diameter' } },
      substitution: `A₂ = π · (${d2.toFixed(4)} m)² / 4`,
      result: { value: a2, unit: 'm²', symbol: 'A₂', label: 'Outlet Area' },
      assumptions: ['Circular pipe cross-section'],
      applicableRange: 'D₂ > 0',
      reference: 'Continuity Equation (Mass Conservation)',
    },
    {
      id: 'FM-CON-003',
      name: 'Volumetric Flow Rate (Discharge) Q',
      formula: 'Q = A₁ · V₁ = A₂ · V₂',
      latex: 'Q = A_1 V_1 = A_2 V_2',
      inputs: {
        a1: { value: a1, unit: 'm²', symbol: 'A₁', label: 'Inlet Area' },
        v1: { value: v1, unit: 'm/s', symbol: 'V₁', label: 'Inlet Velocity' },
      },
      substitution: `Q = ${a1.toFixed(5)} m² · ${v1.toFixed(4)} m/s`,
      result: { value: Q, unit: 'm³/s', symbol: 'Q', label: 'Discharge' },
      assumptions: ['Incompressible fluid (ρ = const)', 'Steady 1D bulk flow'],
      applicableRange: 'ρ = const, no storage change',
      reference: 'Conservation of Mass (1D Steady)',
    },
    {
      id: 'FM-CON-004',
      name: 'Outlet Velocity V₂',
      formula: 'V₂ = Q / A₂ = V₁ · (D₁ / D₂)² = V₁ · (A₁ / A₂)',
      latex: 'V_2 = \\frac{Q}{A_2} = V_1 \\left(\\frac{D_1}{D_2}\\right)^2',
      inputs: {
        Q: { value: Q, unit: 'm³/s', symbol: 'Q', label: 'Discharge' },
        a2: { value: a2, unit: 'm²', symbol: 'A₂', label: 'Outlet Area' },
      },
      substitution: `V₂ = ${Q.toFixed(5)} m³/s / ${a2.toFixed(5)} m²`,
      result: { value: v2, unit: 'm/s', symbol: 'V₂', label: 'Outlet Velocity' },
      assumptions: ['1D mean bulk velocity', 'Incompressible flow'],
      applicableRange: 'A₂ > 0',
      reference: 'Continuity Principle',
    },
  ];

  return {
    d1,
    d2,
    a1,
    a2,
    Q,
    v1,
    v2,
    areaRatio,
    velocityRatio,
    traces,
  };
}

/**
 * 2. BERNOULLI ENERGY LAB SOLVER
 */
export function solveBernoulli(params: {
  z1: number; // m
  z2: number; // m
  p1: number; // Pa
  d1: number; // m
  d2: number; // m
  Q: number;  // m^3/s
  headLoss: number; // m
  fluid: FluidProperty;
}) {
  const { z1, z2, p1, d1, d2, Q, headLoss, fluid } = params;
  const gamma = fluid.specificWeight; // N/m^3

  const a1 = (Math.PI * Math.pow(d1, 2)) / 4;
  const a2 = (Math.PI * Math.pow(d2, 2)) / 4;

  const v1 = a1 > 0 ? Q / a1 : 0;
  const v2 = a2 > 0 ? Q / a2 : 0;

  const velHead1 = Math.pow(v1, 2) / (2 * G);
  const velHead2 = Math.pow(v2, 2) / (2 * G);

  const pressHead1 = p1 / gamma;

  // Total energy head at 1: E1 = z1 + p1/gamma + v1^2/2g
  const egl1 = z1 + pressHead1 + velHead1;
  const hgl1 = z1 + pressHead1;

  // Energy balance: E1 = E2 + h_L => E2 = E1 - h_L
  const egl2 = egl1 - headLoss;
  const hgl2 = egl2 - velHead2;

  // P2 = (HGL2 - z2) * gamma
  const pressHead2 = hgl2 - z2;
  const p2 = pressHead2 * gamma;

  const deltaP = p1 - p2;

  const traces: CalculationTrace[] = [
    {
      id: 'FM-BER-001',
      name: 'Inlet Total Energy Head E₁ (EGL₁)',
      formula: 'E₁ = z₁ + P₁/γ + V₁²/(2g)',
      latex: 'E_1 = z_1 + \\frac{P_1}{\\gamma} + \\frac{V_1^2}{2g}',
      inputs: {
        z1: { value: z1, unit: 'm', symbol: 'z₁', label: 'Inlet Elevation' },
        p1: { value: p1 / 1000, unit: 'kPa', symbol: 'P₁', label: 'Inlet Pressure' },
        v1: { value: v1, unit: 'm/s', symbol: 'V₁', label: 'Inlet Velocity' },
        gamma: { value: gamma, unit: 'N/m³', symbol: 'γ', label: 'Specific Weight' },
      },
      substitution: `E₁ = ${z1.toFixed(2)} + (${p1.toFixed(0)} / ${gamma.toFixed(0)}) + (${v1.toFixed(3)}² / (2·9.807))`,
      result: { value: egl1, unit: 'm', symbol: 'E₁', label: 'Total Head at Station 1' },
      assumptions: ['Steady flow', 'Inviscid streamline approximation with lumped head loss h_L'],
      applicableRange: 'Continuous streamline',
      reference: 'Extended Bernoulli Energy Equation',
    },
    {
      id: 'FM-BER-002',
      name: 'Outlet Static Pressure P₂',
      formula: 'P₂ = γ · [E₁ - h_L - z₂ - V₂²/(2g)]',
      latex: 'P_2 = \\gamma \\left( E_1 - h_L - z_2 - \\frac{V_2^2}{2g} \\right)',
      inputs: {
        egl1: { value: egl1, unit: 'm', symbol: 'E₁', label: 'Inlet Total Head' },
        hL: { value: headLoss, unit: 'm', symbol: 'h_L', label: 'Head Loss' },
        z2: { value: z2, unit: 'm', symbol: 'z₂', label: 'Outlet Elevation' },
        v2: { value: v2, unit: 'm/s', symbol: 'V₂', label: 'Outlet Velocity' },
      },
      substitution: `P₂ = ${gamma.toFixed(0)} · [${egl1.toFixed(3)} - ${headLoss.toFixed(3)} - ${z2.toFixed(2)} - ${velHead2.toFixed(3)}]`,
      result: { value: p2 / 1000, unit: 'kPa', symbol: 'P₂', label: 'Outlet Static Pressure' },
      assumptions: ['Conservation of mechanical energy with frictional dissipation'],
      applicableRange: 'P₂ > -101.3 kPa gauge (vapor pressure limit for cavitation)',
      reference: 'Bernoulli Equation with Friction',
    },
  ];

  return {
    z1,
    z2,
    p1,
    p2,
    d1,
    d2,
    a1,
    a2,
    v1,
    v2,
    velHead1,
    velHead2,
    pressHead1,
    pressHead2,
    hgl1,
    hgl2,
    egl1,
    egl2,
    headLoss,
    deltaP,
    traces,
  };
}

/**
 * 3. REYNOLDS NUMBER LAB SOLVER
 */
export function solveReynolds(params: {
  velocity: number; // m/s
  diameter: number; // m
  fluid: FluidProperty;
}) {
  const { velocity, diameter, fluid } = params;
  const Re = (fluid.density * velocity * diameter) / fluid.dynamicViscosity;

  let regime: 'laminar' | 'transitional' | 'turbulent' = 'turbulent';
  let regimeDescription = '';
  let color = '#3b82f6';

  if (Re < 2300) {
    regime = 'laminar';
    regimeDescription = 'Laminar Flow (Re < 2300): Fluid moves in smooth parallel microscopic laminae without transverse mixing. Viscous forces dominate inertial forces.';
    color = '#10b981'; // Green
  } else if (Re <= 4000) {
    regime = 'transitional';
    regimeDescription = 'Transitional Flow (2300 ≤ Re ≤ 4000): Flow alternates intermittently between laminar filaments and bursts of turbulent eddies.';
    color = '#f59e0b'; // Amber
  } else {
    regime = 'turbulent';
    regimeDescription = 'Turbulent Flow (Re > 4000): Flow is dominated by inertial momentum, chaotic vortices, rapid cross-stream mixing, and flat velocity profile.';
    color = '#ef4444'; // Red
  }

  const traces: CalculationTrace[] = [
    {
      id: 'FM-REY-001',
      name: 'Reynolds Number Re',
      formula: 'Re = (ρ · V · D) / μ = (V · D) / ν',
      latex: 'Re = \\frac{\\rho V D}{\\mu} = \\frac{V D}{\\nu}',
      inputs: {
        density: { value: fluid.density, unit: 'kg/m³', symbol: 'ρ', label: 'Density' },
        velocity: { value: velocity, unit: 'm/s', symbol: 'V', label: 'Mean Velocity' },
        diameter: { value: diameter, unit: 'm', symbol: 'D', label: 'Internal Diameter' },
        mu: { value: fluid.dynamicViscosity, unit: 'Pa·s', symbol: 'μ', label: 'Dynamic Viscosity' },
      },
      substitution: `Re = (${fluid.density.toFixed(1)} · ${velocity.toFixed(3)} · ${diameter.toFixed(4)}) / ${fluid.dynamicViscosity.toExponential(4)}`,
      result: { value: Re, unit: 'dimensionless', symbol: 'Re', label: 'Reynolds Number' },
      assumptions: ['Circular pipe geometry', 'Newtonian fluid', 'Fully developed flow'],
      applicableRange: 'Newtonian fluids in closed conduit',
      reference: 'Osborne Reynolds (1883) Royal Society',
    },
  ];

  return {
    reynolds: Re,
    regime,
    regimeDescription,
    color,
    traces,
  };
}

/**
 * 4. PIPE FLOW & DARCY-WEISBACH LAB SOLVER
 */
export function solvePipeFlow(params: {
  diameter: number; // m
  length: number;   // m
  roughness_mm: number; // mm
  flowRate: number; // m^3/s
  elevationInlet: number; // m
  elevationOutlet: number; // m
  pressureInlet: number; // Pa
  fluid: FluidProperty;
  fittingsKSum?: number;
}) {
  const { diameter, length, roughness_mm, flowRate, elevationInlet, elevationOutlet, pressureInlet, fluid, fittingsKSum = 0 } = params;

  const area = (Math.PI * Math.pow(diameter, 2)) / 4;
  const velocity = area > 0 ? flowRate / area : 0;
  const velHead = Math.pow(velocity, 2) / (2 * G);

  const Re = (fluid.density * velocity * diameter) / fluid.dynamicViscosity;
  const relRoughness = (roughness_mm / 1000) / diameter;

  const ffResult = calculateFrictionFactor(Re, relRoughness);
  const f = ffResult.f;

  // Darcy-Weisbach Major Friction Head Loss: h_f = f * (L/D) * (V^2 / 2g)
  const hf = f * (length / diameter) * velHead;

  // Minor Head Loss: h_m = sum(K) * (V^2 / 2g)
  const hm = fittingsKSum * velHead;

  // Total Head Loss: h_L = hf + hm
  const totalHeadLoss = hf + hm;

  // Hydraulic Gradient / Slope: S_f = h_f / L
  const hydraulicSlope = length > 0 ? hf / length : 0;

  // Pressure loss due to friction: Delta P_f = rho * g * h_f
  const pressureDropFriction = fluid.density * G * hf;

  // Bernoulli for outlet pressure
  const gamma = fluid.specificWeight;
  const pressHeadInlet = pressureInlet / gamma;
  const eglInlet = elevationInlet + pressHeadInlet + velHead;
  const hglInlet = elevationInlet + pressHeadInlet;

  const eglOutlet = eglInlet - totalHeadLoss;
  const hglOutlet = eglOutlet - velHead;
  const pressHeadOutlet = hglOutlet - elevationOutlet;
  const pressureOutlet = pressHeadOutlet * gamma;

  const traces: CalculationTrace[] = [
    {
      id: 'FM-PIP-001',
      name: 'Darcy Friction Factor f (Colebrook-White)',
      formula: '1 / √f = -2 · log₁₀( (ε/D)/3.7 + 2.51 / (Re · √f) )',
      latex: '\\frac{1}{\\sqrt{f}} = -2 \\log_{10}\\left( \\frac{\\varepsilon/D}{3.7} + \\frac{2.51}{Re \\sqrt{f}} \\right)',
      inputs: {
        Re: { value: Re, unit: '-', symbol: 'Re', label: 'Reynolds Number' },
        epsD: { value: relRoughness, unit: '-', symbol: 'ε/D', label: 'Relative Roughness' },
      },
      substitution: `Iterative solution yielding f = ${f.toFixed(5)} (${ffResult.regime} flow)`,
      result: { value: f, unit: 'dimensionless', symbol: 'f', label: 'Darcy Friction Factor' },
      assumptions: ['Commercial pipe roughness', 'Fully developed steady flow'],
      applicableRange: 'Re > 4000, 0 ≤ ε/D ≤ 0.05',
      reference: 'Colebrook & White (1939), Moody Diagram',
    },
    {
      id: 'FM-PIP-002',
      name: 'Major Friction Head Loss h_f (Darcy-Weisbach)',
      formula: 'h_f = f · (L / D) · (V² / 2g)',
      latex: 'h_f = f \\frac{L}{D} \\frac{V^2}{2g}',
      inputs: {
        f: { value: f, unit: '-', symbol: 'f', label: 'Friction Factor' },
        L: { value: length, unit: 'm', symbol: 'L', label: 'Pipe Length' },
        D: { value: diameter, unit: 'm', symbol: 'D', label: 'Pipe Diameter' },
        V: { value: velocity, unit: 'm/s', symbol: 'V', label: 'Velocity' },
      },
      substitution: `h_f = ${f.toFixed(5)} · (${length.toFixed(1)} / ${diameter.toFixed(4)}) · (${velocity.toFixed(3)}² / (2 · 9.807))`,
      result: { value: hf, unit: 'm', symbol: 'h_f', label: 'Friction Head Loss' },
      assumptions: ['Circular pipe with uniform diameter', 'Steady incompressible flow'],
      applicableRange: 'All pipe flow regimes (Laminar, Transitional, Turbulent)',
      reference: 'Darcy (1857), Weisbach (1845)',
    },
    {
      id: 'FM-PIP-003',
      name: 'Total Pipeline Head Loss h_L',
      formula: 'h_L = h_f + Σ h_m = [f · (L/D) + Σ K] · (V² / 2g)',
      latex: 'h_L = h_f + \\sum h_m = \\left( f \\frac{L}{D} + \\sum K \\right) \\frac{V^2}{2g}',
      inputs: {
        hf: { value: hf, unit: 'm', symbol: 'h_f', label: 'Major Friction Loss' },
        hm: { value: hm, unit: 'm', symbol: 'h_m', label: 'Minor Losses' },
      },
      substitution: `h_L = ${hf.toFixed(3)} m + ${hm.toFixed(3)} m`,
      result: { value: totalHeadLoss, unit: 'm', symbol: 'h_L', label: 'Total Head Loss' },
      assumptions: ['Superposition of major and minor energy dissipation'],
      applicableRange: 'Standard piped networks',
      reference: 'Hydraulic Energy Dissipation',
    },
  ];

  return {
    diameter,
    length,
    roughness_mm,
    flowRate,
    area,
    velocity,
    velHead,
    Re,
    relRoughness,
    frictionFactor: f,
    ffResult,
    hf,
    hm,
    totalHeadLoss,
    hydraulicSlope,
    pressureDropFriction,
    pressureInlet,
    pressureOutlet,
    eglInlet,
    eglOutlet,
    hglInlet,
    hglOutlet,
    traces,
  };
}

/**
 * 5. VENTURI FLOWMETER SOLVER
 */
export function solveVenturi(params: {
  d1: number; // Inlet diameter (m)
  d2: number; // Throat diameter (m)
  p1: number; // Inlet pressure (Pa)
  p2: number; // Throat pressure (Pa)
  z1: number; // Inlet elevation (m)
  z2: number; // Throat elevation (m)
  Cd: number; // Discharge coefficient (typically 0.96 - 0.98)
  fluid: FluidProperty;
}) {
  const { d1, d2, p1, p2, z1, z2, Cd = 0.98, fluid } = params;
  const gamma = fluid.specificWeight;

  const a1 = (Math.PI * Math.pow(d1, 2)) / 4;
  const a2 = (Math.PI * Math.pow(d2, 2)) / 4;

  const deltaP = p1 - p2; // Pa
  const deltaH = (p1 - p2) / gamma + (z1 - z2); // Differential piezometric head (m)

  // Theoretical Discharge: Q_ideal = A2 * sqrt( (2*g*deltaH) / (1 - (A2/A1)^2) )
  const beta = d2 / d1; // Diameter ratio
  const m = a2 / a1; // Area ratio = beta^2
  const denominator = Math.sqrt(Math.max(0.0001, 1 - Math.pow(m, 2)));

  const qIdeal = a2 * (Math.sqrt(Math.max(0, 2 * G * deltaH)) / denominator);
  const qActual = Cd * qIdeal;

  const v1 = a1 > 0 ? qActual / a1 : 0;
  const v2 = a2 > 0 ? qActual / a2 : 0;

  const traces: CalculationTrace[] = [
    {
      id: 'FM-VEN-001',
      name: 'Venturi Piezometric Differential Head Δh',
      formula: 'Δh = (P₁ - P₂)/γ + (z₁ - z₂)',
      latex: '\\Delta h = \\frac{P_1 - P_2}{\\gamma} + (z_1 - z_2)',
      inputs: {
        deltaP: { value: deltaP / 1000, unit: 'kPa', symbol: 'P₁ - P₂', label: 'Differential Pressure' },
        gamma: { value: gamma, unit: 'N/m³', symbol: 'γ', label: 'Fluid Specific Weight' },
      },
      substitution: `Δh = (${deltaP.toFixed(0)} Pa / ${gamma.toFixed(0)} N/m³) + (${z1.toFixed(2)} - ${z2.toFixed(2)})`,
      result: { value: deltaH, unit: 'm', symbol: 'Δh', label: 'Differential Head' },
      assumptions: ['Steady frictionless flow along centerline'],
      applicableRange: 'P₁ > P₂',
      reference: 'Venturi Meter Principle (G.B. Venturi 1797)',
    },
    {
      id: 'FM-VEN-002',
      name: 'Actual Flow Rate Q_actual',
      formula: 'Q = C_d · A₂ · √[ (2g · Δh) / (1 - (A₂/A₁)² ) ]',
      latex: 'Q = C_d A_2 \\sqrt{ \\frac{2g \\Delta h}{1 - (A_2/A_1)^2} }',
      inputs: {
        Cd: { value: Cd, unit: '-', symbol: 'C_d', label: 'Discharge Coefficient' },
        a2: { value: a2, unit: 'm²', symbol: 'A₂', label: 'Throat Area' },
        deltaH: { value: deltaH, unit: 'm', symbol: 'Δh', label: 'Differential Head' },
        beta: { value: beta, unit: '-', symbol: 'β', label: 'Diameter Ratio (d₂/d₁)' },
      },
      substitution: `Q = ${Cd} · ${a2.toFixed(5)} · √[ (2·9.807·${deltaH.toFixed(3)}) / (1 - (${m.toFixed(4)})²) ]`,
      result: { value: qActual, unit: 'm³/s', symbol: 'Q', label: 'Actual Discharge' },
      assumptions: ['Calibrated discharge coefficient C_d accounts for boundary layer drag'],
      applicableRange: '0.2 ≤ β ≤ 0.75, Re_D > 10⁵',
      reference: 'ISO 5167 Venturi Tube Standards',
    },
  ];

  return {
    d1,
    d2,
    beta,
    a1,
    a2,
    p1,
    p2,
    deltaP,
    deltaH,
    Cd,
    qIdeal,
    qActual,
    v1,
    v2,
    traces,
  };
}

/**
 * 6. ORIFICE & JET FLOW SOLVER
 */
export function solveOrifice(params: {
  tankHead: number; // Water height above orifice center h (m)
  orificeDiameter: number; // d0 (m)
  Cd?: number; // Discharge coefficient (typically 0.62 for sharp edge)
  Cv?: number; // Velocity coefficient (typically 0.97)
  Cc?: number; // Contraction coefficient (typically 0.64 = Cd / Cv)
  fluid: FluidProperty;
}) {
  const { tankHead, orificeDiameter, Cd = 0.62, Cv = 0.97, Cc = 0.64, fluid } = params;

  const a0 = (Math.PI * Math.pow(orificeDiameter, 2)) / 4;
  const vIdeal = Math.sqrt(2 * G * Math.max(0, tankHead)); // Torricelli velocity
  const vActual = Cv * vIdeal;
  const qActual = Cd * a0 * vIdeal;
  const ac = Cc * a0; // Vena contracta area
  const dc = Math.sqrt((4 * ac) / Math.PI); // Vena contracta diameter

  const traces: CalculationTrace[] = [
    {
      id: 'FM-ORF-001',
      name: 'Ideal Jet Velocity (Torricelli\'s Law)',
      formula: 'V_ideal = √(2 · g · h)',
      latex: 'V_{\\text{ideal}} = \\sqrt{2gh}',
      inputs: {
        h: { value: tankHead, unit: 'm', symbol: 'h', label: 'Tank Liquid Head' },
        g: { value: G, unit: 'm/s²', symbol: 'g', label: 'Gravity' },
      },
      substitution: `V_ideal = √(2 · 9.80665 · ${tankHead.toFixed(3)})`,
      result: { value: vIdeal, unit: 'm/s', symbol: 'V_ideal', label: 'Theoretical Velocity' },
      assumptions: ['Free discharge to atmosphere', 'Large tank (V_surface ≈ 0)', 'Inviscid exit'],
      applicableRange: 'h >> d₀',
      reference: 'Torricelli\'s Law (1643)',
    },
    {
      id: 'FM-ORF-002',
      name: 'Actual Orifice Discharge Q',
      formula: 'Q = C_d · A₀ · √(2 · g · h)',
      latex: 'Q = C_d A_0 \\sqrt{2gh}',
      inputs: {
        Cd: { value: Cd, unit: '-', symbol: 'C_d', label: 'Discharge Coefficient' },
        a0: { value: a0, unit: 'm²', symbol: 'A₀', label: 'Orifice Area' },
        h: { value: tankHead, unit: 'm', symbol: 'h', label: 'Liquid Head' },
      },
      substitution: `Q = ${Cd} · ${a0.toFixed(6)} m² · √(2 · 9.807 · ${tankHead.toFixed(3)})`,
      result: { value: qActual, unit: 'm³/s', symbol: 'Q', label: 'Actual Discharge' },
      assumptions: ['Sharp-edged circular orifice', 'Vena contracta formation'],
      applicableRange: 'Standard sharp edge orifice',
      reference: 'ASME Fluid Meters & Hydraulics',
    },
  ];

  return {
    tankHead,
    orificeDiameter,
    a0,
    ac,
    dc,
    Cd,
    Cv,
    Cc,
    vIdeal,
    vActual,
    qActual,
    traces,
  };
}

/**
 * 7. WEIR LAB SOLVER
 */
export function solveWeir(params: {
  type: 'rectangular' | 'v_notch_90' | 'v_notch_60' | 'broad_crested';
  crestLength: number; // b (m) for rectangular / broad
  headOverCrest: number; // H (m)
  notchAngle_deg?: number; // theta for V-notch
  Cd?: number;
}) {
  const { type, crestLength, headOverCrest, notchAngle_deg = 90, Cd = 0.60 } = params;
  const H = Math.max(0, headOverCrest);
  let Q = 0;
  let formulaStr = '';
  let latexStr = '';

  if (type === 'rectangular') {
    // Francis suppressed weir formula: Q = (2/3) * Cd * b * sqrt(2g) * H^(3/2)
    Q = (2.0 / 3.0) * Cd * crestLength * Math.sqrt(2 * G) * Math.pow(H, 1.5);
    formulaStr = 'Q = (2/3) · C_d · b · √(2g) · H^(3/2)';
    latexStr = 'Q = \\frac{2}{3} C_d b \\sqrt{2g} H^{3/2}';
  } else if (type === 'v_notch_90' || type === 'v_notch_60') {
    // Triangular V-notch weir: Q = (8/15) * Cd * sqrt(2g) * tan(theta/2) * H^(5/2)
    const angleRad = ((type === 'v_notch_90' ? 90 : 60) * Math.PI) / 180;
    const tanHalf = Math.tan(angleRad / 2);
    Q = (8.0 / 15.0) * Cd * Math.sqrt(2 * G) * tanHalf * Math.pow(H, 2.5);
    formulaStr = 'Q = (8/15) · C_d · √(2g) · tan(θ/2) · H^(5/2)';
    latexStr = 'Q = \\frac{8}{15} C_d \\sqrt{2g} \\tan\\left(\\frac{\\theta}{2}\\right) H^{5/2}';
  } else {
    // Broad-crested weir: Q = Cd * b * sqrt(g) * (2/3 H)^(3/2)
    Q = Cd * crestLength * Math.sqrt(G) * Math.pow((2.0 / 3.0) * H, 1.5);
    formulaStr = 'Q = C_d · b · √g · (2/3 H)^(3/2)';
    latexStr = 'Q = C_d b \\sqrt{g} \\left(\\frac{2}{3}H\\right)^{3/2}';
  }

  const traces: CalculationTrace[] = [
    {
      id: 'FM-WEIR-001',
      name: `Weir Flow Discharge (${type})`,
      formula: formulaStr,
      latex: latexStr,
      inputs: {
        H: { value: H, unit: 'm', symbol: 'H', label: 'Head over Crest' },
        b: { value: crestLength, unit: 'm', symbol: 'b', label: 'Crest Width' },
        Cd: { value: Cd, unit: '-', symbol: 'C_d', label: 'Discharge Coefficient' },
      },
      substitution: `Calculated from head H = ${H.toFixed(3)} m yielding Q = ${Q.toFixed(5)} m³/s`,
      result: { value: Q, unit: 'm³/s', symbol: 'Q', label: 'Discharge' },
      assumptions: ['Free aerated nappe', 'Upstream velocity of approach negligible'],
      applicableRange: 'H > 0.03 m to avoid surface tension distortion',
      reference: 'Open Channel Weirs (Kindsvater-Carter & Francis)',
    },
  ];

  return {
    type,
    crestLength,
    headOverCrest: H,
    notchAngle_deg,
    Cd,
    Q,
    traces,
  };
}

/**
 * 8. OPEN CHANNEL FLOW (MANNING) SOLVER
 */
export function solveOpenChannel(params: {
  shape: 'rectangular' | 'trapezoidal' | 'triangular';
  bottomWidth: number; // b (m)
  waterDepth: number;  // y (m)
  sideSlope_z?: number; // z (horizontal : 1 vertical) for trapezoid
  bedSlope_S0: number; // S_0 (m/m)
  manning_n: number;   // n roughness (e.g. 0.013 for concrete)
}) {
  const { shape, bottomWidth: b, waterDepth: y, sideSlope_z: z = 0, bedSlope_S0: S0, manning_n: n } = params;

  let area = 0;
  let perimeter = 0;
  let topWidth = 0;

  if (shape === 'rectangular') {
    area = b * y;
    perimeter = b + 2 * y;
    topWidth = b;
  } else if (shape === 'trapezoidal') {
    area = (b + z * y) * y;
    perimeter = b + 2 * y * Math.sqrt(1 + z * z);
    topWidth = b + 2 * z * y;
  } else if (shape === 'triangular') {
    area = z * Math.pow(y, 2);
    perimeter = 2 * y * Math.sqrt(1 + z * z);
    topWidth = 2 * z * y;
  }

  const Rh = perimeter > 0 ? area / perimeter : 0; // Hydraulic radius
  const Dh = topWidth > 0 ? area / topWidth : 0;   // Hydraulic depth

  // Manning's Equation: Q = (1/n) * A * Rh^(2/3) * S0^(1/2)
  const S0_pos = Math.max(0.00001, S0);
  const velocity = (1.0 / n) * Math.pow(Rh, 2.0 / 3.0) * Math.sqrt(S0_pos);
  const Q = area * velocity;

  // Froude Number: Fr = V / sqrt(g * Dh)
  const Fr = Dh > 0 ? velocity / Math.sqrt(G * Dh) : 0;

  let regime: 'subcritical' | 'critical' | 'supercritical' = 'subcritical';
  if (Math.abs(Fr - 1.0) < 0.02) {
    regime = 'critical';
  } else if (Fr > 1.0) {
    regime = 'supercritical';
  } else {
    regime = 'subcritical';
  }

  // Critical Depth (yc) approximation for rectangular: yc = (q^2 / g)^(1/3)
  const unitDischarge_q = b > 0 ? Q / b : 0;
  const criticalDepth_yc = shape === 'rectangular' ? Math.pow(Math.pow(unitDischarge_q, 2) / G, 1.0 / 3.0) : Math.pow(Math.pow(Q, 2) / (G * Math.pow(b || 1, 2)), 1.0 / 3.0);

  // Specific Energy: E = y + V^2 / 2g
  const specificEnergy = y + Math.pow(velocity, 2) / (2 * G);

  const traces: CalculationTrace[] = [
    {
      id: 'FM-OCF-001',
      name: 'Hydraulic Radius R_h',
      formula: 'R_h = A / P',
      latex: 'R_h = \\frac{A}{P}',
      inputs: {
        A: { value: area, unit: 'm²', symbol: 'A', label: 'Cross-Section Area' },
        P: { value: perimeter, unit: 'm', symbol: 'P', label: 'Wetted Perimeter' },
      },
      substitution: `R_h = ${area.toFixed(4)} m² / ${perimeter.toFixed(4)} m`,
      result: { value: Rh, unit: 'm', symbol: 'R_h', label: 'Hydraulic Radius' },
      assumptions: ['Uniform open channel prism'],
      applicableRange: 'Open channel cross sections',
      reference: 'Manning Open Channel Hydraulics',
    },
    {
      id: 'FM-OCF-002',
      name: 'Manning Volumetric Discharge Q',
      formula: 'Q = (1/n) · A · R_h^(2/3) · S₀^(1/2)',
      latex: 'Q = \\frac{1}{n} A R_h^{2/3} S_0^{1/2}',
      inputs: {
        n: { value: n, unit: '-', symbol: 'n', label: 'Manning Roughness' },
        A: { value: area, unit: 'm²', symbol: 'A', label: 'Flow Area' },
        Rh: { value: Rh, unit: 'm', symbol: 'R_h', label: 'Hydraulic Radius' },
        S0: { value: S0, unit: 'm/m', symbol: 'S₀', label: 'Channel Bed Slope' },
      },
      substitution: `Q = (1 / ${n}) · ${area.toFixed(4)} · (${Rh.toFixed(4)})^(2/3) · √(${S0.toFixed(5)})`,
      result: { value: Q, unit: 'm³/s', symbol: 'Q', label: 'Normal Discharge' },
      assumptions: ['Uniform steady flow', 'Prismatic channel bed', 'Turbulent boundary layer'],
      applicableRange: 'Manning empirical formula (SI units)',
      reference: 'Robert Manning (1891)',
    },
    {
      id: 'FM-OCF-003',
      name: 'Froude Number Fr',
      formula: 'Fr = V / √(g · D_h)',
      latex: 'Fr = \\frac{V}{\\sqrt{g D_h}}',
      inputs: {
        V: { value: velocity, unit: 'm/s', symbol: 'V', label: 'Mean Velocity' },
        Dh: { value: Dh, unit: 'm', symbol: 'D_h', label: 'Hydraulic Depth (A/T)' },
      },
      substitution: `Fr = ${velocity.toFixed(3)} m/s / √(9.807 · ${Dh.toFixed(3)} m)`,
      result: { value: Fr, unit: 'dimensionless', symbol: 'Fr', label: 'Froude Number' },
      assumptions: ['Surface wave gravity propagation'],
      applicableRange: 'Free surface gravity flows',
      reference: 'William Froude (1868)',
    },
  ];

  return {
    shape,
    bottomWidth: b,
    waterDepth: y,
    sideSlope_z: z,
    bedSlope_S0: S0,
    manning_n: n,
    area,
    perimeter,
    topWidth,
    Rh,
    Dh,
    velocity,
    Q,
    Fr,
    regime,
    criticalDepth_yc,
    specificEnergy,
    traces,
  };
}

/**
 * 9. HYDRAULIC JUMP SOLVER (BÉLANGER EQUATION)
 */
export function solveHydraulicJump(params: {
  upstreamDepth_y1: number; // y1 (m)
  upstreamVelocity_v1: number; // V1 (m/s)
  channelWidth_b: number; // b (m)
}) {
  const { upstreamDepth_y1: y1, upstreamVelocity_v1: v1, channelWidth_b: b } = params;

  // Upstream Froude number
  const Fr1 = v1 / Math.sqrt(G * y1);
  const q = y1 * v1; // unit discharge (m^2/s)
  const Q = q * b;

  // Bélanger Equation for rectangular channel: y2/y1 = 0.5 * (sqrt(1 + 8*Fr1^2) - 1)
  const sequentDepth_y2 = (y1 / 2.0) * (Math.sqrt(1 + 8 * Math.pow(Fr1, 2)) - 1);
  const downstreamVelocity_v2 = sequentDepth_y2 > 0 ? q / sequentDepth_y2 : 0;
  const Fr2 = sequentDepth_y2 > 0 ? downstreamVelocity_v2 / Math.sqrt(G * sequentDepth_y2) : 0;

  // Energy at 1 and 2
  const E1 = y1 + Math.pow(v1, 2) / (2 * G);
  const E2 = sequentDepth_y2 + Math.pow(downstreamVelocity_v2, 2) / (2 * G);

  // Head loss / Energy dissipation: Delta E = (y2 - y1)^3 / (4 * y1 * y2)
  const energyLoss_DeltaE = Math.pow(sequentDepth_y2 - y1, 3) / (4 * y1 * sequentDepth_y2);
  const jumpEfficiency = E1 > 0 ? (E2 / E1) * 100 : 0;
  const relativeLossPercent = E1 > 0 ? (energyLoss_DeltaE / E1) * 100 : 0;

  // Jump length: Lj ≈ 6 * (y2 - y1) (Silvester / USBR)
  const jumpLength = 6.0 * (sequentDepth_y2 - y1);

  // Jump height: hj = y2 - y1
  const jumpHeight = sequentDepth_y2 - y1;

  // Jump Classification based on USBR
  let jumpClassification = '';
  if (Fr1 < 1.0) {
    jumpClassification = 'No Jump (Subcritical flow upstream, Fr₁ < 1)';
  } else if (Fr1 <= 1.7) {
    jumpClassification = 'Undular Jump (1.0 < Fr₁ ≤ 1.7): Low energy loss, surface waves only.';
  } else if (Fr1 <= 2.5) {
    jumpClassification = 'Weak Jump (1.7 < Fr₁ ≤ 2.5): Small rollers, uniform velocity exit.';
  } else if (Fr1 <= 4.5) {
    jumpClassification = 'Oscillating Jump (2.5 < Fr₁ ≤ 4.5): Pulsating jet generating rough waves downstream.';
  } else if (Fr1 <= 9.0) {
    jumpClassification = 'Steady Jump (4.5 < Fr₁ ≤ 9.0): Optimal stilling basin performance, 45-70% energy dissipation.';
  } else {
    jumpClassification = 'Strong / Choppy Jump (Fr₁ > 9.0): Highly turbulent, intense shock waves, up to 85% energy loss.';
  }

  const traces: CalculationTrace[] = [
    {
      id: 'FM-JMP-001',
      name: 'Upstream Froude Number Fr₁',
      formula: 'Fr₁ = V₁ / √(g · y₁)',
      latex: 'Fr_1 = \\frac{V_1}{\\sqrt{g y_1}}',
      inputs: {
        v1: { value: v1, unit: 'm/s', symbol: 'V₁', label: 'Upstream Velocity' },
        y1: { value: y1, unit: 'm', symbol: 'y₁', label: 'Upstream Supercritical Depth' },
      },
      substitution: `Fr₁ = ${v1.toFixed(3)} m/s / √(9.807 · ${y1.toFixed(3)} m)`,
      result: { value: Fr1, unit: 'dimensionless', symbol: 'Fr₁', label: 'Upstream Froude Number' },
      assumptions: ['Supercritical initial state (Fr₁ > 1.0)', 'Horizontal channel bed'],
      applicableRange: 'Rectangular open channel',
      reference: 'Hydraulic Jump Mechanics',
    },
    {
      id: 'FM-JMP-002',
      name: 'Sequent Conjugate Subcritical Depth y₂ (Bélanger Equation)',
      formula: 'y₂ = (y₁ / 2) · [ √(1 + 8·Fr₁²) - 1 ]',
      latex: 'y_2 = \\frac{y_1}{2} \\left( \\sqrt{1 + 8 Fr_1^2} - 1 \\right)',
      inputs: {
        y1: { value: y1, unit: 'm', symbol: 'y₁', label: 'Initial Depth' },
        Fr1: { value: Fr1, unit: '-', symbol: 'Fr₁', label: 'Upstream Froude Number' },
      },
      substitution: `y₂ = (${y1.toFixed(3)} / 2) · [ √(1 + 8 · (${Fr1.toFixed(3)})²) - 1 ]`,
      result: { value: sequentDepth_y2, unit: 'm', symbol: 'y₂', label: 'Sequent Subcritical Depth' },
      assumptions: ['Conservation of momentum across jump', 'Negligible bed friction over jump length'],
      applicableRange: 'Fr₁ > 1.0',
      reference: 'Jean-Baptiste Bélanger (1828)',
    },
    {
      id: 'FM-JMP-003',
      name: 'Turbulent Energy Dissipation ΔE',
      formula: 'ΔE = (y₂ - y₁)³ / (4 · y₁ · y₂)',
      latex: '\\Delta E = \\frac{(y_2 - y_1)^3}{4 y_1 y_2}',
      inputs: {
        y1: { value: y1, unit: 'm', symbol: 'y₁', label: 'Initial Depth' },
        y2: { value: sequentDepth_y2, unit: 'm', symbol: 'y₂', label: 'Sequent Depth' },
      },
      substitution: `ΔE = (${sequentDepth_y2.toFixed(3)} - ${y1.toFixed(3)})³ / (4 · ${y1.toFixed(3)} · ${sequentDepth_y2.toFixed(3)})`,
      result: { value: energyLoss_DeltaE, unit: 'm', symbol: 'ΔE', label: 'Head Loss Across Jump' },
      assumptions: ['Irreversible turbulent dissipation inside roller vortices'],
      applicableRange: 'Hydraulic jump in rectangular flume',
      reference: 'USBR Design of Small Dams & Hydraulic Energy Dissipators',
    },
  ];

  return {
    y1,
    v1,
    channelWidth_b: b,
    q,
    Q,
    Fr1,
    Fr2,
    sequentDepth_y2,
    downstreamVelocity_v2,
    E1,
    E2,
    energyLoss_DeltaE,
    jumpEfficiency,
    relativeLossPercent,
    jumpLength,
    jumpHeight,
    jumpClassification,
    traces,
  };
}

/**
 * 10. PUMP AND SYSTEM CURVE SOLVER
 */
export function solvePumpSystem(params: {
  staticHead: number; // H_stat = z2 - z1 + (P2 - P1)/gamma (m)
  pipeDiameter: number; // D (m)
  pipeLength: number; // L (m)
  pipeRoughness_mm: number; // mm
  fittingsKSum: number; // sum(K)
  pumpShutoffHead_H0: number; // Shutoff head H0 (m) at Q = 0
  pumpMaxDischarge_Qmax: number; // Max flow Qmax (m^3/s) at H = 0
  pumpSpeed_rpm?: number;
  ratedSpeed_rpm?: number;
  fluid: FluidProperty;
}) {
  const {
    staticHead,
    pipeDiameter,
    pipeLength,
    pipeRoughness_mm,
    fittingsKSum,
    pumpShutoffHead_H0: H0,
    pumpMaxDischarge_Qmax: Qmax,
    pumpSpeed_rpm = 1750,
    ratedSpeed_rpm = 1750,
    fluid,
  } = params;

  // Pump affinity law adjustment for speed
  const speedRatio = pumpSpeed_rpm / ratedSpeed_rpm;
  const adjH0 = H0 * Math.pow(speedRatio, 2);
  const adjQmax = Qmax * speedRatio;

  // Pump curve quadratic model: H_p(Q) = adjH0 - a * Q^2
  const a_pump = adjQmax > 0 ? adjH0 / Math.pow(adjQmax, 2) : 0;

  // System curve: H_sys(Q) = H_stat + K_sys * Q^2
  const area = (Math.PI * Math.pow(pipeDiameter, 2)) / 4;
  const relRoughness = (pipeRoughness_mm / 1000) / pipeDiameter;

  // Approximate f for system curve calculation
  const f_est = 0.02;
  const K_sys = (1.0 / (2 * G * Math.pow(area, 2))) * (f_est * (pipeLength / pipeDiameter) + fittingsKSum);

  // Solve operating point intersection: H_p(Q_op) = H_sys(Q_op)
  // adjH0 - a * Q_op^2 = H_stat + K_sys * Q_op^2
  // Q_op^2 * (a + K_sys) = adjH0 - H_stat
  let Q_op = 0;
  let H_op = staticHead;
  let isFeasible = false;

  if (adjH0 > staticHead && (a_pump + K_sys) > 0) {
    Q_op = Math.sqrt((adjH0 - staticHead) / (a_pump + K_sys));
    H_op = staticHead + K_sys * Math.pow(Q_op, 2);
    isFeasible = true;
  }

  // Exact Darcy Weisbach at Q_op to refine
  let refinedHf = 0;
  let refinedF = f_est;
  if (Q_op > 0) {
    const v_op = Q_op / area;
    const Re_op = (fluid.density * v_op * pipeDiameter) / fluid.dynamicViscosity;
    const ffResult = calculateFrictionFactor(Re_op, relRoughness);
    refinedF = ffResult.f;
    refinedHf = refinedF * (pipeLength / pipeDiameter) * (Math.pow(v_op, 2) / (2 * G));
  }

  // Hydraulic Power (kW): P_hyd = gamma * Q * H / 1000
  const gamma = fluid.specificWeight;
  const hydraulicPower_kW = (gamma * Q_op * H_op) / 1000.0;

  // Pump efficiency estimation (parabolic BEP around 60% of Qmax)
  const qFraction = adjQmax > 0 ? Q_op / adjQmax : 0;
  const efficiency = Math.max(10, Math.min(88, 85 * (1 - 4 * Math.pow(qFraction - 0.6, 2))));
  const brakeHorsepower_kW = efficiency > 0 ? hydraulicPower_kW / (efficiency / 100) : 0;

  const traces: CalculationTrace[] = [
    {
      id: 'FM-PMP-001',
      name: 'System Head Requirement H_sys',
      formula: 'H_sys = H_stat + [f · (L/D) + Σ K] · (Q² / (2g · A²))',
      latex: 'H_{\\text{sys}} = H_{\\text{stat}} + \\left( f \\frac{L}{D} + \\sum K \\right) \\frac{Q^2}{2g A^2}',
      inputs: {
        Hstat: { value: staticHead, unit: 'm', symbol: 'H_stat', label: 'Total Static Head' },
        L: { value: pipeLength, unit: 'm', symbol: 'L', label: 'Discharge Pipe Length' },
        D: { value: pipeDiameter, unit: 'm', symbol: 'D', label: 'Pipe Diameter' },
      },
      substitution: `H_sys = ${staticHead.toFixed(2)} m + (${K_sys.toFixed(1)}) · Q²`,
      result: { value: H_op, unit: 'm', symbol: 'H_op', label: 'Operating Head' },
      assumptions: ['Turbulent flow system resistance parabolic curve'],
      applicableRange: 'Pipe and fitting network',
      reference: 'Hydraulic System Curve Analysis',
    },
    {
      id: 'FM-PMP-002',
      name: 'Hydraulic Water Power P_hyd',
      formula: 'P_hyd = (γ · Q · H) / 1000',
      latex: 'P_{\\text{hyd}} = \\frac{\\gamma Q H}{1000}',
      inputs: {
        gamma: { value: gamma, unit: 'N/m³', symbol: 'γ', label: 'Specific Weight' },
        Q: { value: Q_op, unit: 'm³/s', symbol: 'Q_op', label: 'Operating Discharge' },
        H: { value: H_op, unit: 'm', symbol: 'H_op', label: 'Operating Total Dynamic Head' },
      },
      substitution: `P_hyd = (${gamma.toFixed(0)} · ${Q_op.toFixed(4)} · ${H_op.toFixed(2)}) / 1000`,
      result: { value: hydraulicPower_kW, unit: 'kW', symbol: 'P_hyd', label: 'Hydraulic Power Output' },
      assumptions: ['Fluid density constant'],
      applicableRange: 'Centrifugal pump fluid power',
      reference: 'Pump Energy Equations',
    },
  ];

  return {
    staticHead,
    pipeDiameter,
    pipeLength,
    pipeRoughness_mm,
    fittingsKSum,
    pumpShutoffHead_H0: adjH0,
    pumpMaxDischarge_Qmax: adjQmax,
    pumpSpeed_rpm,
    a_pump,
    K_sys,
    Q_op,
    H_op,
    isFeasible,
    hydraulicPower_kW,
    efficiency,
    brakeHorsepower_kW,
    traces,
  };
}

/**
 * Master Unified Hydraulic Solver Dispatcher
 */
export function solveHydraulics(
  labId: string,
  parameters: Record<string, any>,
  fluid: FluidProperty
): { results: Record<string, any>; traces: CalculationTrace[] } {
  switch (labId) {
    case 'continuity': {
      const d1 = parameters.d1 || 0.1;
      const d2 = parameters.d2 || 0.05;
      const q = (parameters.discharge_Lps || 10) / 1000;
      const res = solveContinuity(d1, d2, { type: 'discharge', value: q });
      return {
        results: {
          d1: res.d1,
          d2: res.d2,
          a1: res.a1,
          a2: res.a2,
          Q: res.Q,
          v1: res.v1,
          v2: res.v2,
          velocity: res.v1,
          areaRatio: res.areaRatio,
          velocityRatio: res.velocityRatio,
        },
        traces: res.traces,
      };
    }

    case 'bernoulli': {
      const z1 = parameters.z1 ?? 8;
      const z2 = parameters.z2 ?? 3;
      const p1 = (parameters.p1_kPa ?? 150) * 1000;
      const d1 = parameters.d1 || 0.15;
      const d2 = parameters.d2 || 0.1;
      const Q = parameters.Q_m3s || 0.035;
      const headLoss = parameters.headLoss_m || 1.8;
      const res = solveBernoulli({ z1, z2, p1, d1, d2, Q, headLoss, fluid });
      return {
        results: {
          ...res,
          p1_gamma: res.pressHead1,
          p2_gamma: res.pressHead2,
          v1_2g: res.velHead1,
          v2_2g: res.velHead2,
          velocity: res.v1,
        },
        traces: res.traces,
      };
    }

    case 'reynolds': {
      const velocity = parameters.velocity || 0.12;
      const diameter = parameters.diameter || 0.025;
      const res = solveReynolds({ velocity, diameter, fluid });
      return {
        results: {
          ...res,
          velocity,
          diameter,
        },
        traces: res.traces,
      };
    }

    case 'pipe-flow':
    case 'pipe-roughness':
    case 'minor-loss': {
      const diameter = parameters.diameter || 0.15;
      const length = parameters.length || 250;
      const roughness_mm = parameters.roughness_mm || 0.045;
      const flowRate = parameters.flowRate_m3s || 0.04;
      const elevationInlet = parameters.elevationInlet || 10;
      const elevationOutlet = parameters.elevationOutlet || 2;
      const pressureInlet = (parameters.pressureInlet_kPa || 300) * 1000;
      const fittingsKSum = parameters.fittingsK || 2.5;

      const res = solvePipeFlow({
        diameter,
        length,
        roughness_mm,
        flowRate,
        elevationInlet,
        elevationOutlet,
        pressureInlet,
        fluid,
        fittingsKSum,
      });

      return {
        results: {
          ...res,
          reynolds: res.Re,
          relativeRoughness: res.relRoughness,
        },
        traces: res.traces,
      };
    }

    case 'venturi': {
      const d1 = parameters.d1 || 0.2;
      const d2 = parameters.d2 || 0.1;
      const p1 = (parameters.p1_kPa || 200) * 1000;
      const p2 = (parameters.p2_kPa || 160) * 1000;
      const z1 = parameters.z1 || 0;
      const z2 = parameters.z2 || 0;
      const Cd = parameters.Cd || 0.98;

      const res = solveVenturi({ d1, d2, p1, p2, z1, z2, Cd, fluid });
      return {
        results: {
          ...res,
          velocity: res.v1,
        },
        traces: res.traces,
      };
    }

    case 'orifice': {
      const tankHead = parameters.tankHead || 3.0;
      const orificeDiameter = parameters.orificeDiameter || 0.05;
      const Cd = parameters.Cd || 0.62;
      const Cv = parameters.Cv || 0.97;
      const Cc = parameters.Cc || 0.64;

      const res = solveOrifice({ tankHead, orificeDiameter, Cd, Cv, Cc, fluid });
      return {
        results: {
          ...res,
          velocity: res.vActual,
        },
        traces: res.traces,
      };
    }

    case 'weir': {
      const type = parameters.type || 'rectangular';
      const crestLength = parameters.crestLength || 1.5;
      const headOverCrest = parameters.headOverCrest || 0.25;
      const notchAngle_deg = parameters.notchAngle_deg || 90;
      const Cd = parameters.Cd || 0.62;

      const res = solveWeir({ type, crestLength, headOverCrest, notchAngle_deg, Cd });
      return {
        results: {
          ...res,
        },
        traces: res.traces,
      };
    }

    case 'open-channel':
    case 'froude': {
      const shape = parameters.shape || 'rectangular';
      const bottomWidth = parameters.bottomWidth || 2.5;
      const waterDepth = parameters.waterDepth || 1.1;
      const sideSlope_z = parameters.sideSlope_z || 0;
      const bedSlope_S0 = parameters.bedSlope_S0 || 0.0012;
      const manning_n = parameters.manning_n || 0.014;

      const res = solveOpenChannel({
        shape,
        bottomWidth,
        waterDepth,
        sideSlope_z,
        bedSlope_S0,
        manning_n,
      });

      return {
        results: {
          ...res,
        },
        traces: res.traces,
      };
    }

    case 'hydraulic-jump': {
      const upstreamDepth_y1 = parameters.upstreamDepth_y1 || 0.4;
      const upstreamVelocity_v1 = parameters.upstreamVelocity_v1 || 8.0;
      const channelWidth_b = parameters.channelWidth_b || 5.0;

      const res = solveHydraulicJump({
        upstreamDepth_y1,
        upstreamVelocity_v1,
        channelWidth_b,
      });

      return {
        results: {
          ...res,
          velocity: upstreamVelocity_v1,
        },
        traces: res.traces,
      };
    }

    case 'pumps':
    case 'pump-curves': {
      const staticHead = parameters.staticHead || 25.0;
      const pipeDiameter = parameters.pipeDiameter || 0.2;
      const pipeLength = parameters.pipeLength || 400;
      const pipeRoughness_mm = parameters.pipeRoughness_mm || 0.045;
      const fittingsKSum = parameters.fittingsKSum || 5.0;
      const pumpShutoffHead_H0 = parameters.pumpShutoffHead_H0 || 55.0;
      const pumpMaxDischarge_Qmax = parameters.pumpMaxDischarge_Qmax || 0.12;

      const res = solvePumpSystem({
        staticHead,
        pipeDiameter,
        pipeLength,
        pipeRoughness_mm,
        fittingsKSum,
        pumpShutoffHead_H0,
        pumpMaxDischarge_Qmax,
        fluid,
      });

      return {
        results: {
          ...res,
        },
        traces: res.traces,
      };
    }

    default:
      return { results: {}, traces: [] };
  }
}

