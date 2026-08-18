import { CalculationStep, ValidationFlag } from '../types/mechanics';

export interface SliderCrankState {
  thetaDeg: number;
  crankRadiusR: number; // m
  connectingRodL: number; // m
  crankOmegaRadS: number; // rad/s
  pistonPositionX: number; // m from crank center
  pistonVelocityVx: number; // m/s
  pistonAccelerationAx: number; // m/s^2
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

export function solveSliderCrank(
  r: number, // Crank radius (m)
  l: number, // Connecting rod length (m)
  omega: number, // Crank angular speed (rad/s)
  thetaDeg: number // Crank angle (deg)
): SliderCrankState {
  const rad = (d: number) => (d * Math.PI) / 180;
  const theta = rad(thetaDeg);
  const lambda = r / l; // Obliquity ratio

  // Exact kinematics of in-line slider-crank:
  // x = r * cos(theta) + sqrt(l^2 - r^2 * sin^2(theta))
  // Approximations with Fourier series / trigonometric expansion:
  // x ≈ r * [ (1 - cos(theta)) + (l/r) - (1/2)*(r/l)*sin^2(theta) ]
  const sqrtTerm = Math.sqrt(Math.max(0, l * l - r * r * Math.sin(theta) * Math.sin(theta)));
  const x = r * Math.cos(theta) + sqrtTerm;

  // Velocity v = - r * omega * [ sin(theta) + (lambda / (2 * sqrt(1 - lambda^2 sin^2(theta)))) * sin(2*theta) ]
  // Standard high-accuracy engineering formula:
  const sin2Theta = Math.sin(2 * theta);
  const cos2Theta = Math.cos(2 * theta);
  const vx = -r * omega * (Math.sin(theta) + (lambda * sin2Theta) / (2 * Math.sqrt(Math.max(0.01, 1 - lambda * lambda * Math.sin(theta) * Math.sin(theta)))));

  // Acceleration a ≈ - r * omega^2 * [ cos(theta) + lambda * cos(2*theta) ]
  const ax = -r * omega * omega * (Math.cos(theta) + lambda * cos2Theta);

  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      description: 'Compute Obliquity Ratio (λ = r / l)',
      formula: '\\lambda = \\frac{r}{l}',
      substitution: `\\lambda = \\frac{${r}\\text{ m}}{${l}\\text{ m}} = ${lambda.toFixed(3)}`,
      result: `\\lambda = ${lambda.toFixed(3)}`,
      unit: '',
    },
    {
      stepNumber: 2,
      description: 'Piston Displacement from Crank Center',
      formula: 'x(\\theta) = r \\cos\\theta + \\sqrt{l^2 - r^2 \\sin^2\\theta}',
      substitution: `x(${thetaDeg}^\\circ) = ${r}\\cos(${thetaDeg}^\\circ) + \\sqrt{(${l})^2 - (${r})^2 \\sin^2(${thetaDeg}^\\circ)} = ${x.toFixed(3)}\\text{ m}`,
      result: `x = ${x.toFixed(3)} m`,
      unit: 'm',
    },
    {
      stepNumber: 3,
      description: 'Piston Linear Velocity at current crank phase',
      formula: 'v_x(\\theta) \\approx -r \\omega \\left(\\sin\\theta + \\frac{\\lambda}{2}\\sin(2\\theta)\\right)',
      substitution: `v_x = -(${r})(${omega})\\left(\\sin(${thetaDeg}^\\circ) + \\frac{${lambda.toFixed(3)}}{2}\\sin(2 \\times ${thetaDeg}^\\circ)\\right) = ${vx.toFixed(2)}\\text{ m/s}`,
      result: `v_x = ${vx.toFixed(2)} m/s`,
      unit: 'm/s',
    },
    {
      stepNumber: 4,
      description: 'Piston Dynamic Acceleration (Inertia force excitation)',
      formula: 'a_x(\\theta) \\approx -r \\omega^2 (\\cos\\theta + \\lambda \\cos(2\\theta))',
      substitution: `a_x = -(${r})(${omega})^2(\\cos(${thetaDeg}^\\circ) + ${lambda.toFixed(3)}\\cos(2 \\times ${thetaDeg}^\\circ)) = ${ax.toFixed(2)}\\text{ m/s}^2`,
      result: `a_x = ${ax.toFixed(2)} m/s²`,
      unit: 'm/s²',
    },
  ];

  const validations: ValidationFlag[] = [
    {
      type: lambda > 0.35 ? 'warning' : 'valid',
      message: lambda > 0.35
        ? `High obliquity ratio (λ = ${lambda.toFixed(2)} > 0.35) increases side-thrust on cylinder walls.`
        : `Kinematic loop closed. Smooth crank-slider transmission.`,
    },
  ];

  const interpretation = `The slider-crank converts continuous crank rotation (ω = ${omega} rad/s) into reciprocating linear piston motion. Maximum piston velocity (${Math.abs(vx).toFixed(2)} m/s) occurs near mid-stroke (θ ≈ 75°-80° depending on rod length l), while peak inertial acceleration (${Math.abs(ax).toFixed(1)} m/s²) occurs at Top Dead Center (θ = 0°), generating severe primary and secondary shaking forces in internal combustion engines.`;

  return {
    thetaDeg,
    crankRadiusR: r,
    connectingRodL: l,
    crankOmegaRadS: omega,
    pistonPositionX: x,
    pistonVelocityVx: vx,
    pistonAccelerationAx: ax,
    steps,
    validations,
    interpretation,
  };
}

export function solvePulleySystem(
  pulleysCount: number, // 1 to 6
  loadMassKg: number,
  efficiency: number = 0.95,
  g: number = 9.81
) {
  const loadWeight = loadMassKg * g;
  // Ideal mechanical advantage for standard block & tackle is number of supporting rope segments n
  const ima = pulleysCount;
  const actualMa = ima * efficiency;
  const effortNeeded = loadWeight / actualMa;
  const velocityRatio = ima;

  return {
    loadWeight,
    ima,
    actualMa,
    effortNeeded,
    velocityRatio,
    interpretation: `A ${pulleysCount}-pulley block & tackle divides the load weight (${loadWeight.toFixed(1)} N) across ${pulleysCount} tensioned rope lines, requiring only ${effortNeeded.toFixed(1)} N of user effort at ${Math.round(efficiency * 100)}% mechanical efficiency.`,
  };
}

export function solveGearTrain(
  nDriverTeeth: number,
  nDrivenTeeth: number,
  inputRpm: number,
  inputTorqueNm: number,
  efficiency: number = 0.98
) {
  const gearRatio = nDrivenTeeth / nDriverTeeth;
  const outputRpm = inputRpm / gearRatio;
  const outputTorque = inputTorqueNm * gearRatio * efficiency;

  return {
    gearRatio,
    outputRpm,
    outputTorque,
    interpretation: `The gear ratio is ${gearRatio.toFixed(2)}:1. Input speed is reduced from ${inputRpm} RPM to ${outputRpm.toFixed(1)} RPM, while output torque is multiplied from ${inputTorqueNm} N·m to ${outputTorque.toFixed(1)} N·m (${(gearRatio * efficiency).toFixed(2)}x mechanical torque amplification).`,
  };
}
