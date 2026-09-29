import { CalculationStep, ValidationFlag } from '../types/mechanics';

export interface AppliedForce {
  id: string;
  name: string;
  magnitude: number;
  angleDeg: number;
  posX: number; // relative attachment point on body
  posY: number;
  type: 'applied' | 'weight' | 'normal' | 'friction' | 'tension' | 'reaction';
}

export interface FBDCalculationResult {
  sumFx: number;
  sumFy: number;
  sumMomentOrigin: number;
  isEquilibrium: boolean;
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

export function solveFBD(
  mass: number,
  forces: AppliedForce[],
  originX: number = 0,
  originY: number = 0
): FBDCalculationResult {
  const g = 9.81;
  const weight = mass * g;
  const rad = (d: number) => (d * Math.PI) / 180;

  let sumFx = 0;
  let sumFy = 0;
  let sumMoment = 0;

  const resolvedForces = forces.map((f) => {
    const fx = f.magnitude * Math.cos(rad(f.angleDeg));
    const fy = f.magnitude * Math.sin(rad(f.angleDeg));
    const rx = f.posX - originX;
    const ry = f.posY - originY;
    // Moment M = r x F = rx * Fy - ry * Fx (standard counter-clockwise positive)
    const m = rx * fy - ry * fx;

    sumFx += fx;
    sumFy += fy;
    sumMoment += m;

    return { ...f, fx, fy, rx, ry, moment: m };
  });

  const isEquilibrium =
    Math.abs(sumFx) < 0.05 && Math.abs(sumFy) < 0.05 && Math.abs(sumMoment) < 0.05;

  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      description: 'Summation of horizontal forces (ΣFx = 0 check)',
      formula: '\\sum F_x = \\sum (F_i \\cos\\theta_i)',
      substitution: resolvedForces.map((f) => `${f.fx >= 0 ? '+' : ''}${f.fx.toFixed(1)}`).join(' ') || '0',
      result: `\\sum F_x = ${sumFx.toFixed(2)} \\text{ N}`,
      unit: 'N',
      note: Math.abs(sumFx) < 0.05 ? 'Balanced horizontally' : 'Unbalanced horizontal force',
    },
    {
      stepNumber: 2,
      description: 'Summation of vertical forces (ΣFy = 0 check)',
      formula: '\\sum F_y = \\sum (F_i \\sin\\theta_i)',
      substitution: resolvedForces.map((f) => `${f.fy >= 0 ? '+' : ''}${f.fy.toFixed(1)}`).join(' ') || '0',
      result: `\\sum F_y = ${sumFy.toFixed(2)} \\text{ N}`,
      unit: 'N',
      note: Math.abs(sumFy) < 0.05 ? 'Balanced vertically' : 'Unbalanced vertical force',
    },
    {
      stepNumber: 3,
      description: 'Summation of moments about reference origin (ΣM_O = 0 check)',
      formula: '\\sum M_O = \\sum (r_{ix} F_{iy} - r_{iy} F_{ix})',
      substitution: resolvedForces.map((f) => `${f.moment >= 0 ? '+' : ''}${f.moment.toFixed(2)}`).join(' ') || '0',
      result: `\\sum M_O = ${sumMoment.toFixed(2)} \\text{ N}\\cdot\\text{m}`,
      unit: 'N·m',
      note: Math.abs(sumMoment) < 0.05 ? 'No rotational tendency' : sumMoment > 0 ? 'Counter-clockwise rotation' : 'Clockwise rotation',
    },
  ];

  const validations: ValidationFlag[] = [];
  if (isEquilibrium) {
    validations.push({
      type: 'valid',
      message: 'Equilibrium verified! Both translational (ΣF=0) and rotational (ΣM=0) equations of statics are satisfied.',
    });
  } else {
    validations.push({
      type: 'warning',
      message: `System is NOT in static equilibrium. Net translational force = ${(Math.sqrt(sumFx * sumFx + sumFy * sumFy)).toFixed(2)} N, Net moment = ${sumMoment.toFixed(2)} N·m.`,
    });
  }

  const interpretation = isEquilibrium
    ? 'All active forces, weight, and reactions form a closed force polygon with zero net moment. The rigid body remains stationary in static equilibrium without linear acceleration or rotational angular acceleration.'
    : `The rigid body experiences net unbalanced dynamic excitation: linear acceleration a = ${(Math.sqrt(sumFx * sumFx + sumFy * sumFy) / (mass || 1)).toFixed(2)} m/s² and angular acceleration tendency about the origin.`;

  return {
    sumFx,
    sumFy,
    sumMomentOrigin: sumMoment,
    isEquilibrium,
    steps,
    validations,
    interpretation,
  };
}
