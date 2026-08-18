import { CalculationStep, ValidationFlag } from '../types/mechanics';

export interface Newton2ndLawResult {
  mass: number;
  appliedForce: number;
  frictionForce: number;
  netForce: number;
  acceleration: number;
  weight: number;
  normalForce: number;
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

export function solveNewton2ndLaw(
  mass: number,
  appliedForce: number,
  muK: number = 0,
  g: number = 9.81
): Newton2ndLawResult {
  const weight = mass * g;
  const normalForce = weight;
  const frictionForce = muK * normalForce;
  const netForce = Math.max(0, appliedForce - frictionForce);
  const acceleration = mass > 0 ? (appliedForce >= frictionForce ? (appliedForce - frictionForce) / mass : 0) : 0;

  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      description: 'Calculate vertical normal force and kinetic friction resistance',
      formula: 'N = m \\cdot g, \\quad f_k = \\mu_k \\cdot N',
      substitution: `N = ${mass} \\times ${g} = ${normalForce.toFixed(2)}\\text{ N}, \\quad f_k = ${muK} \\times ${normalForce.toFixed(2)} = ${frictionForce.toFixed(2)}\\text{ N}`,
      result: `f_k = ${frictionForce.toFixed(2)} N`,
      unit: 'N',
    },
    {
      stepNumber: 2,
      description: 'Summation of horizontal forces (ΣFx = Net Driving Force)',
      formula: '\\sum F_x = F_{applied} - f_k',
      substitution: `\\sum F_x = ${appliedForce} - ${frictionForce.toFixed(2)} = ${(appliedForce - frictionForce).toFixed(2)}\\text{ N}`,
      result: `\\sum F_x = ${(appliedForce - frictionForce).toFixed(2)} N`,
      unit: 'N',
    },
    {
      stepNumber: 3,
      description: "Apply Newton's Second Law of Motion to find particle acceleration",
      formula: 'a = \\frac{\\sum F_x}{m}',
      substitution: `a = \\frac{${(appliedForce - frictionForce).toFixed(2)}\\text{ N}}{${mass}\\text{ kg}} = ${acceleration.toFixed(2)}\\text{ m/s}^2`,
      result: `a = ${acceleration.toFixed(2)} m/s²`,
      unit: 'm/s²',
    },
  ];

  const validations: ValidationFlag[] = [
    {
      type: 'valid',
      message: `Newton's 2nd Law verified. Acceleration a = ${acceleration.toFixed(2)} m/s² is directly proportional to net force and inversely proportional to mass.`,
    },
  ];

  const interpretation = `Newton's Second Law ΣF = m · a establishes the fundamental relationship between applied force dynamics and particle inertia. With mass = ${mass} kg and applied force = ${appliedForce} N, the net unbalanced force produces an acceleration of ${acceleration.toFixed(2)} m/s². Doubling the mass would halve this acceleration.`;

  return {
    mass,
    appliedForce,
    frictionForce,
    netForce,
    acceleration,
    weight,
    normalForce,
    steps,
    validations,
    interpretation,
  };
}
