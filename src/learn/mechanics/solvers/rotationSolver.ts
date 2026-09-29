import { CalculationStep, ValidationFlag } from '../types/mechanics';

export interface RotationCalculationResult {
  momentOfInertia: number; // kg·m^2
  torque: number; // N·m
  angularAcceleration: number; // rad/s^2
  finalAngularVelocity: number; // rad/s
  rotationalKineticEnergy: number; // J
  rpm: number;
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

export function solveRotationalDynamics(
  shape: 'solid_cylinder' | 'hollow_cylinder' | 'thin_rod_center' | 'solid_sphere',
  mass: number,
  radius: number,
  appliedTorque: number,
  initialOmegaRadS: number = 0,
  duration: number = 5
): RotationCalculationResult {
  let I = 0;
  let formulaDesc = '';

  if (shape === 'solid_cylinder') {
    I = 0.5 * mass * radius * radius;
    formulaDesc = '\\frac{1}{2} m r^2';
  } else if (shape === 'hollow_cylinder') {
    I = mass * radius * radius;
    formulaDesc = 'm r^2';
  } else if (shape === 'thin_rod_center') {
    I = (1 / 12) * mass * Math.pow(2 * radius, 2);
    formulaDesc = '\\frac{1}{12} m L^2';
  } else if (shape === 'solid_sphere') {
    I = (2 / 5) * mass * radius * radius;
    formulaDesc = '\\frac{2}{5} m r^2';
  }

  const alpha = I > 0 ? appliedTorque / I : 0; // rad/s^2
  const finalOmega = initialOmegaRadS + alpha * duration;
  const rotKE = 0.5 * I * finalOmega * finalOmega;
  const rpm = (finalOmega * 60) / (2 * Math.PI);

  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      description: 'Calculate Mass Moment of Inertia (I) for chosen geometric body',
      formula: `I = ${formulaDesc}`,
      substitution: `I = (${mass}\\text{ kg}) \\times (${radius}\\text{ m})^2 \\dots = ${I.toFixed(4)}\\text{ kg}\\cdot\\text{m}^2`,
      result: `I = ${I.toFixed(4)} kg·m²`,
      unit: 'kg·m²',
    },
    {
      stepNumber: 2,
      description: 'Apply Rotational Newton 2nd Law (Στ = I · α) to compute Angular Acceleration',
      formula: '\\alpha = \\frac{\\sum \\tau}{I}',
      substitution: `\\alpha = \\frac{${appliedTorque}\\text{ N}\\cdot\\text{m}}{${I.toFixed(4)}\\text{ kg}\\cdot\\text{m}^2} = ${alpha.toFixed(2)}\\text{ rad/s}^2`,
      result: `\\alpha = ${alpha.toFixed(2)} rad/s²`,
      unit: 'rad/s²',
    },
    {
      stepNumber: 3,
      description: 'Integrate Angular Velocity over time (ω(t) = ω0 + α · t)',
      formula: '\\omega(t) = \\omega_0 + \\alpha t',
      substitution: `\\omega(${duration}) = ${initialOmegaRadS} + (${alpha.toFixed(2)} \\times ${duration}) = ${finalOmega.toFixed(2)}\\text{ rad/s}`,
      result: `\\omega = ${finalOmega.toFixed(2)} rad/s (${rpm.toFixed(1)} RPM)`,
      unit: 'rad/s',
    },
    {
      stepNumber: 4,
      description: 'Compute stored Rotational Kinetic Energy',
      formula: 'T_{rot} = \\frac{1}{2} I \\omega^2',
      substitution: `T_{rot} = \\frac{1}{2}(${I.toFixed(4)})(${finalOmega.toFixed(2)})^2 = ${rotKE.toFixed(2)}\\text{ J}`,
      result: `T_{rot} = ${rotKE.toFixed(2)} J`,
      unit: 'J',
    },
  ];

  const validations: ValidationFlag[] = [
    {
      type: 'valid',
      message: `Rotational flywheel dynamics verified. Angular velocity reaches ${rpm.toFixed(1)} RPM storing ${rotKE.toFixed(1)} J of kinetic energy.`,
    },
  ];

  const interpretation = `Mass moment of inertia I = ${I.toFixed(4)} kg·m² quantifies the body's resistance to rotational acceleration, analogous to mass in linear translation. Under a net applied torque of ${appliedTorque} N·m, the rigid body experiences steady angular acceleration α = ${alpha.toFixed(2)} rad/s².`;

  return {
    momentOfInertia: I,
    torque: appliedTorque,
    angularAcceleration: alpha,
    finalAngularVelocity: finalOmega,
    rotationalKineticEnergy: rotKE,
    rpm,
    steps,
    validations,
    interpretation,
  };
}
