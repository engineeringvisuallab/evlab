import { CalculationStep, ValidationFlag } from '../types/mechanics';

export interface FrictionCalculationResult {
  weight: number;
  normalForce: number;
  componentParallelWeight: number; // mg sin(theta)
  componentPerpWeight: number; // mg cos(theta)
  maxStaticFriction: number;
  kineticFriction: number;
  actualFriction: number;
  netDrivingForce: number;
  state: 'STATIC (At Rest)' | 'IMPENDING MOTION (Threshold)' | 'SLIDING (Dynamic Acceleration)';
  acceleration: number;
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

export function solveFriction(
  mass: number,
  appliedForce: number, // Parallel to surface (up/down or right)
  inclineAngleDeg: number, // 0 for horizontal, >0 for incline
  muS: number, // Static coefficient of friction
  muK: number, // Kinetic coefficient of friction
  g: number = 9.81
): FrictionCalculationResult {
  const rad = (d: number) => (d * Math.PI) / 180;
  const theta = rad(inclineAngleDeg);

  const weight = mass * g;
  const perpWeight = weight * Math.cos(theta);
  const parallelWeight = weight * Math.sin(theta); // Tendency to slide down incline

  // Normal Force N = mg cos(theta) (assuming no vertical component in applied force)
  const normalForce = perpWeight;

  const maxStaticFriction = muS * normalForce;
  const kineticFriction = muK * normalForce;

  // Net driving force trying to move the block along surface
  // Downhill component + applied force
  const netPush = appliedForce - parallelWeight;
  const drivingForceMag = Math.abs(netPush);

  let actualFriction = 0;
  let state: 'STATIC (At Rest)' | 'IMPENDING MOTION (Threshold)' | 'SLIDING (Dynamic Acceleration)' = 'STATIC (At Rest)';
  let acceleration = 0;

  if (drivingForceMag < maxStaticFriction - 0.01) {
    state = 'STATIC (At Rest)';
    actualFriction = drivingForceMag; // Friction balances the driving force exactly
    acceleration = 0;
  } else if (Math.abs(drivingForceMag - maxStaticFriction) <= 0.01) {
    state = 'IMPENDING MOTION (Threshold)';
    actualFriction = maxStaticFriction;
    acceleration = 0;
  } else {
    state = 'SLIDING (Dynamic Acceleration)';
    actualFriction = kineticFriction;
    const netForce = drivingForceMag - kineticFriction;
    const sign = netPush >= 0 ? 1 : -1;
    acceleration = (sign * netForce) / mass;
  }

  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      description: 'Calculate normal force perpendicular to contact interface',
      formula: 'N = m \\cdot g \\cdot \\cos(\\theta)',
      substitution: `N = ${mass} \\times ${g} \\times \\cos(${inclineAngleDeg}^\\circ) = ${normalForce.toFixed(2)}\\text{ N}`,
      result: `N = ${normalForce.toFixed(2)} N`,
      unit: 'N',
    },
    {
      stepNumber: 2,
      description: 'Compute maximum limiting static friction capacity',
      formula: 'f_{s,\\max} = \\mu_s \\cdot N',
      substitution: `f_{s,\\max} = ${muS} \\times ${normalForce.toFixed(2)} = ${maxStaticFriction.toFixed(2)}\\text{ N}`,
      result: `f_{s,\\max} = ${maxStaticFriction.toFixed(2)} N`,
      unit: 'N',
    },
    {
      stepNumber: 3,
      description: 'Compute dynamic kinetic friction resistance during motion',
      formula: 'f_k = \\mu_k \\cdot N',
      substitution: `f_k = ${muK} \\times ${normalForce.toFixed(2)} = ${kineticFriction.toFixed(2)}\\text{ N}`,
      result: `f_k = ${kineticFriction.toFixed(2)} N`,
      unit: 'N',
    },
    {
      stepNumber: 4,
      description: 'Determine dynamic motion state and acceleration (ΣF_x = m · a)',
      formula: state === 'SLIDING (Dynamic Acceleration)' ? 'a = \\frac{|F_{driving}| - f_k}{m}' : 'a = 0\\text{ (Static)}',
      substitution: state === 'SLIDING (Dynamic Acceleration)'
        ? `a = \\frac{${drivingForceMag.toFixed(2)} - ${kineticFriction.toFixed(2)}}{${mass}} = ${Math.abs(acceleration).toFixed(2)}\\text{ m/s}^2`
        : `Driving force (${drivingForceMag.toFixed(2)}\\text{ N}) \\le f_{s,\\max} (${maxStaticFriction.toFixed(2)}\\text{ N})`,
      result: `State: ${state}, a = ${acceleration.toFixed(2)} m/s²`,
      unit: 'm/s²',
    },
  ];

  const validations: ValidationFlag[] = [];
  if (muK > muS) {
    validations.push({
      type: 'warning',
      message: 'Kinetic friction coefficient μk cannot physically exceed static friction coefficient μs in standard contact mechanics.',
    });
  }
  if (state === 'SLIDING (Dynamic Acceleration)') {
    validations.push({
      type: 'valid',
      message: `Block overcomes static friction barrier! Sliding with dynamic acceleration a = ${acceleration.toFixed(2)} m/s².`,
    });
  } else {
    validations.push({
      type: 'info',
      message: `Static equilibrium holds. Current static friction developed: ${actualFriction.toFixed(2)} N (Capacity remaining: ${(maxStaticFriction - actualFriction).toFixed(2)} N).`,
    });
  }

  const interpretation = `Coulomb friction acts tangentially at the asperities of the contact interface. Because the net driving force (${drivingForceMag.toFixed(1)} N) ${
    state === 'SLIDING (Dynamic Acceleration)' ? `exceeds the static threshold (${maxStaticFriction.toFixed(1)} N)` : `does not exceed the limiting friction capacity (${maxStaticFriction.toFixed(1)} N)`
  }, the physical block is ${state.toLowerCase()}. Once sliding initiates, friction drops from static capacity (${maxStaticFriction.toFixed(1)} N) to kinetic resistance (${kineticFriction.toFixed(1)} N), causing a sudden acceleration kick.`;

  return {
    weight,
    normalForce,
    componentParallelWeight: parallelWeight,
    componentPerpWeight: perpWeight,
    maxStaticFriction,
    kineticFriction,
    actualFriction,
    netDrivingForce: drivingForceMag,
    state,
    acceleration,
    steps,
    validations,
    interpretation,
  };
}
