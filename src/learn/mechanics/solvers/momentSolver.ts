import { CalculationStep, ValidationFlag } from '../types/mechanics';

export interface MomentCalculationResult {
  moment: number; // N·m (positive counter-clockwise)
  perpendicularDistance: number; // meters
  fx: number;
  fy: number;
  direction: 'Counter-Clockwise (CCW)' | 'Clockwise (CW)' | 'None (Zero Tendency)';
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

export function solveMomentOfForce(
  forceMag: number,
  forceAngleDeg: number,
  leverLength: number,
  applicationPosition: number // position along lever (0 to leverLength)
): MomentCalculationResult {
  const rad = (d: number) => (d * Math.PI) / 180;
  const angleRad = rad(forceAngleDeg);

  const fx = forceMag * Math.cos(angleRad);
  const fy = forceMag * Math.sin(angleRad);

  // Position is at (applicationPosition, 0) along lever
  // Moment M = r x F = r_x * F_y - r_y * F_x = applicationPosition * fy - 0 = applicationPosition * fy
  const moment = applicationPosition * fy;
  const perpDistance = applicationPosition * Math.abs(Math.sin(angleRad));

  let direction: 'Counter-Clockwise (CCW)' | 'Clockwise (CW)' | 'None (Zero Tendency)' = 'None (Zero Tendency)';
  if (Math.abs(moment) < 0.001) {
    direction = 'None (Zero Tendency)';
  } else if (moment > 0) {
    direction = 'Counter-Clockwise (CCW)';
  } else {
    direction = 'Clockwise (CW)';
  }

  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      description: 'Decompose force into perpendicular and axial components along lever arm',
      formula: 'F_\\perp = F \\sin(\\theta), \\quad F_\\parallel = F \\cos(\\theta)',
      substitution: `F_\\perp = ${forceMag} \\sin(${forceAngleDeg}^\\circ) = ${fy.toFixed(2)}\\text{ N}, \\quad F_\\parallel = ${forceMag} \\cos(${forceAngleDeg}^\\circ) = ${fx.toFixed(2)}\\text{ N}`,
      result: `F_\\perp = ${fy.toFixed(2)} N`,
      unit: 'N',
      note: 'Only the perpendicular component produces torque about the pivot.',
    },
    {
      stepNumber: 2,
      description: 'Determine perpendicular distance (moment arm d_perp)',
      formula: 'd_\\perp = d \\cdot |\\sin(\\theta)|',
      substitution: `d_\\perp = ${applicationPosition.toFixed(2)} \\cdot |\\sin(${forceAngleDeg}^\\circ)| = ${perpDistance.toFixed(3)}\\text{ m}`,
      result: `${perpDistance.toFixed(3)} m`,
      unit: 'm',
    },
    {
      stepNumber: 3,
      description: 'Calculate Moment of Force via scalar and vector formulations',
      formula: 'M_O = F_\\perp \\cdot d = F \\cdot d_\\perp',
      substitution: `M_O = (${fy.toFixed(2)}\\text{ N}) \\times (${applicationPosition.toFixed(2)}\\text{ m})`,
      result: `${moment.toFixed(2)} N·m (${direction})`,
      unit: 'N·m',
    },
  ];

  const validations: ValidationFlag[] = [];
  if (Math.abs(moment) < 0.01) {
    validations.push({
      type: 'info',
      message: 'Line of action passes directly through pivot point (moment arm = 0). No rotational torque is created.',
    });
  } else if (Math.abs(forceAngleDeg - 90) < 1 || Math.abs(forceAngleDeg - 270) < 1) {
    validations.push({
      type: 'valid',
      message: 'Maximum mechanical advantage reached (force vector is purely perpendicular to lever arm).',
    });
  }

  const interpretation = `The moment of force represents the rotational capacity of a force about a specific axis. At an angle of ${forceAngleDeg}°, the perpendicular moment arm is ${perpDistance.toFixed(2)} m, generating a net torque of ${Math.abs(moment).toFixed(2)} N·m (${direction}). Moving the force further from the pivot multiplies torque linearly (Archimedes' law of the lever).`;

  return {
    moment,
    perpendicularDistance: perpDistance,
    fx,
    fy,
    direction,
    steps,
    validations,
    interpretation,
  };
}
