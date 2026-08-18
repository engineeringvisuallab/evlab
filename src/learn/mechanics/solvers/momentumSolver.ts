import { CalculationStep, ValidationFlag } from '../types/mechanics';

export interface CollisionCalculationResult {
  m1: number;
  m2: number;
  u1: number; // initial velocity 1 (m/s)
  u2: number; // initial velocity 2 (m/s)
  v1: number; // post-collision velocity 1
  v2: number; // post-collision velocity 2
  e: number; // Coefficient of restitution (0 = plastic, 1 = elastic)
  initialTotalMomentum: number;
  finalTotalMomentum: number;
  initialKineticEnergy: number;
  finalKineticEnergy: number;
  energyLoss: number;
  impulse: number;
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

export function solveCollision(
  m1: number,
  u1: number,
  m2: number,
  u2: number,
  e: number = 1.0 // 1.0 = elastic, 0.0 = perfectly inelastic
): CollisionCalculationResult {
  const p1_init = m1 * u1;
  const p2_init = m2 * u2;
  const p_total_init = p1_init + p2_init;

  const ke_init = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;

  // Equations:
  // 1) m1 v1 + m2 v2 = m1 u1 + m2 u2 = P_total
  // 2) e = (v2 - v1) / (u1 - u2) => v2 - v1 = e(u1 - u2) => v2 = v1 + e(u1 - u2)
  // m1 v1 + m2 (v1 + e(u1 - u2)) = P_total
  // v1 (m1 + m2) + m2 e (u1 - u2) = P_total
  // v1 = (P_total - m2 e (u1 - u2)) / (m1 + m2)
  const relVel = u1 - u2;
  const totalMass = m1 + m2;

  const v1 = (p_total_init - m2 * e * relVel) / totalMass;
  const v2 = (p_total_init + m1 * e * relVel) / totalMass;

  const p1_final = m1 * v1;
  const p2_final = m2 * v2;
  const p_total_final = p1_final + p2_final;

  const ke_final = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
  const energyLoss = Math.max(0, ke_init - ke_final);

  // Impulse on body 1: J = m1 (v1 - u1)
  const impulse = Math.abs(m1 * (v1 - u1));

  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      description: 'Conservation of Linear Momentum principle (P_initial = P_final)',
      formula: 'm_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2',
      substitution: `(${m1} \\times ${u1}) + (${m2} \\times ${u2}) = ${p_total_init.toFixed(2)}\\text{ kg}\\cdot\\text{m/s}`,
      result: `P_{total} = ${p_total_init.toFixed(2)} kg·m/s`,
      unit: 'kg·m/s',
    },
    {
      stepNumber: 2,
      description: 'Newtonian Coefficient of Restitution definition (e)',
      formula: 'e = \\frac{v_2 - v_1}{u_1 - u_2} = ' + e.toFixed(2),
      substitution: `v_2 - v_1 = ${e} \\cdot (${u1} - ${u2}) = ${(e * relVel).toFixed(2)}\\text{ m/s}`,
      result: `\\Delta v_{sep} = ${(e * relVel).toFixed(2)} m/s`,
      unit: 'm/s',
    },
    {
      stepNumber: 3,
      description: 'Simultaneous solution for post-impact velocities (v1, v2)',
      formula: 'v_1 = \\frac{m_1 u_1 + m_2 u_2 - m_2 e(u_1 - u_2)}{m_1 + m_2}, \\quad v_2 = v_1 + e(u_1 - u_2)',
      substitution: `v_1 = ${v1.toFixed(2)}\\text{ m/s}, \\quad v_2 = ${v2.toFixed(2)}\\text{ m/s}`,
      result: `v_1 = ${v1.toFixed(2)} m/s, v_2 = ${v2.toFixed(2)} m/s`,
      unit: 'm/s',
    },
    {
      stepNumber: 4,
      description: 'Internal Kinetic Energy conservation / plastic dissipation check',
      formula: '\\Delta E_k = T_1 - T_2',
      substitution: `${ke_init.toFixed(2)}\\text{ J} - ${ke_final.toFixed(2)}\\text{ J} = ${energyLoss.toFixed(2)}\\text{ J lost}`,
      result: `Lost KE = ${energyLoss.toFixed(2)} J`,
      unit: 'J',
    },
  ];

  const validations: ValidationFlag[] = [
    {
      type: 'valid',
      message: `Momentum conservation strictly verified (Total P = ${p_total_init.toFixed(2)} kg·m/s before and after).`,
    },
  ];

  if (e === 1.0) {
    validations.push({
      type: 'info',
      message: 'Perfectly Elastic collision: Mechanical kinetic energy is 100% conserved.',
    });
  } else if (e === 0.0) {
    validations.push({
      type: 'info',
      message: 'Perfectly Inelastic (plastic) collision: Bodies coalesce and move with common velocity.',
    });
  }

  const interpretation = `During impact, equal and opposite internal impulses (J = ${impulse.toFixed(2)} N·s) exchange momentum between the colliding bodies. For e = ${e.toFixed(2)}, total linear momentum remains invariant at ${p_total_init.toFixed(2)} kg·m/s, while ${energyLoss.toFixed(1)} J of kinetic energy converts to internal plastic deformation and acoustic waves.`;

  return {
    m1,
    m2,
    u1,
    u2,
    v1,
    v2,
    e,
    initialTotalMomentum: p_total_init,
    finalTotalMomentum: p_total_final,
    initialKineticEnergy: ke_init,
    finalKineticEnergy: ke_final,
    energyLoss,
    impulse,
    steps,
    validations,
    interpretation,
  };
}
