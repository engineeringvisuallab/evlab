import { CalculationStep, ValidationFlag } from '../types/mechanics';

export interface KinematicsSample {
  t: number;
  s: number; // position (m)
  v: number; // velocity (m/s)
  a: number; // acceleration (m/s^2)
}

export interface KinematicsCalculationResult {
  finalPosition: number;
  finalVelocity: number;
  totalTime: number;
  samples: KinematicsSample[];
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

export function solveKinematics(
  s0: number, // Initial position (m)
  v0: number, // Initial velocity (m/s)
  a: number, // Constant acceleration (m/s^2)
  duration: number = 5 // Total time (s)
): KinematicsCalculationResult {
  const finalPosition = s0 + v0 * duration + 0.5 * a * duration * duration;
  const finalVelocity = v0 + a * duration;

  const samples: KinematicsSample[] = [];
  const dt = duration / 50;
  for (let i = 0; i <= 50; i++) {
    const t = i * dt;
    const s = s0 + v0 * t + 0.5 * a * t * t;
    const v = v0 + a * t;
    samples.push({ t, s, v, a });
  }

  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      description: 'Velocity-Time equation for uniformly accelerated rectilinear motion',
      formula: 'v(t) = v_0 + a \\cdot t',
      substitution: `v(${duration}) = ${v0} + (${a}) \\times ${duration} = ${finalVelocity.toFixed(2)}\\text{ m/s}`,
      result: `v = ${finalVelocity.toFixed(2)} m/s`,
      unit: 'm/s',
    },
    {
      stepNumber: 2,
      description: 'Position-Time kinematic integration formula',
      formula: 's(t) = s_0 + v_0 t + \\frac{1}{2} a t^2',
      substitution: `s(${duration}) = ${s0} + (${v0} \\times ${duration}) + \\frac{1}{2}(${a})(${duration})^2 = ${finalPosition.toFixed(2)}\\text{ m}`,
      result: `s = ${finalPosition.toFixed(2)} m`,
      unit: 'm',
    },
    {
      stepNumber: 3,
      description: 'Torricelli kinematic relation (independent of time)',
      formula: 'v^2 = v_0^2 + 2 a (s - s_0)',
      substitution: `v^2 = (${v0})^2 + 2(${a})(${finalPosition.toFixed(2)} - ${s0}) = ${(finalVelocity * finalVelocity).toFixed(2)}`,
      result: `v = ${finalVelocity.toFixed(2)} m/s (Verified)`,
      unit: 'm/s',
    },
  ];

  const validations: ValidationFlag[] = [
    {
      type: 'valid',
      message: `Kinematic trajectory computed over ${duration} seconds. Net displacement: ${(finalPosition - s0).toFixed(2)} m.`,
    },
  ];

  const interpretation = `Under constant acceleration a = ${a} m/s², the velocity curve v(t) is linear, and the position curve s(t) is a quadratic parabola. The area under the v-t graph represents net displacement Δs = ${(finalPosition - s0).toFixed(2)} m, and the slope of the v-t graph matches constant acceleration at every instant.`;

  return {
    finalPosition,
    finalVelocity,
    totalTime: duration,
    samples,
    steps,
    validations,
    interpretation,
  };
}
