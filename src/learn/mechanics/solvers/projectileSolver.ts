import { CalculationStep, ValidationFlag } from '../types/mechanics';

export interface TrajectoryPoint {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  vMag: number;
}

export interface ProjectileCalculationResult {
  timeOfFlight: number;
  rangeX: number;
  maxHeightY: number;
  timeToApex: number;
  landingVelocity: number;
  landingAngleDeg: number;
  trajectory: TrajectoryPoint[];
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

export function solveProjectileMotion(
  v0: number, // Initial velocity (m/s)
  angleDeg: number, // Launch angle (deg)
  y0: number = 0, // Initial launch height (m)
  g: number = 9.81
): ProjectileCalculationResult {
  const rad = (d: number) => (d * Math.PI) / 180;
  const deg = (r: number) => (r * 180) / Math.PI;

  const theta = rad(angleDeg);
  const v0x = v0 * Math.cos(theta);
  const v0y = v0 * Math.sin(theta);

  // Time to apex: v_y = v0y - g * t_apex = 0 => t_apex = v0y / g
  const timeToApex = Math.max(0, v0y / g);
  const maxHeightY = y0 + (v0y * v0y) / (2 * g);

  // Total time of flight: y(t) = y0 + v0y*t - 0.5*g*t^2 = 0
  // 0.5*g*t^2 - v0y*t - y0 = 0
  const disc = v0y * v0y + 2 * g * y0;
  const timeOfFlight = (v0y + Math.sqrt(Math.max(0, disc))) / g;

  const rangeX = v0x * timeOfFlight;

  const vyEnd = v0y - g * timeOfFlight;
  const vxEnd = v0x;
  const landingVelocity = Math.sqrt(vxEnd * vxEnd + vyEnd * vyEnd);
  let landingAngleDeg = deg(Math.atan2(vyEnd, vxEnd));
  if (landingAngleDeg < 0) landingAngleDeg += 360;

  // Generate trajectory points
  const trajectory: TrajectoryPoint[] = [];
  const N = 80;
  const dt = timeOfFlight / N;
  for (let i = 0; i <= N; i++) {
    const t = i * dt;
    const x = v0x * t;
    const y = Math.max(0, y0 + v0y * t - 0.5 * g * t * t);
    const vx = v0x;
    const vy = v0y - g * t;
    const vMag = Math.sqrt(vx * vx + vy * vy);
    trajectory.push({ t, x, y, vx, vy, vMag });
  }

  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      description: 'Decompose initial velocity into horizontal and vertical components',
      formula: 'v_{0x} = v_0 \\cos\\theta, \\quad v_{0y} = v_0 \\sin\\theta',
      substitution: `v_{0x} = ${v0}\\cos(${angleDeg}^\\circ) = ${v0x.toFixed(2)}\\text{ m/s}, \\quad v_{0y} = ${v0}\\sin(${angleDeg}^\\circ) = ${v0y.toFixed(2)}\\text{ m/s}`,
      result: `v_{0x} = ${v0x.toFixed(2)} m/s, v_{0y} = ${v0y.toFixed(2)} m/s`,
      unit: 'm/s',
    },
    {
      stepNumber: 2,
      description: 'Maximum Apex Height reached (where vertical velocity Vy = 0)',
      formula: 'H_{\\max} = y_0 + \\frac{v_{0y}^2}{2g}',
      substitution: `H_{\\max} = ${y0} + \\frac{(${v0y.toFixed(2)})^2}{2(${g})} = ${maxHeightY.toFixed(2)}\\text{ m}`,
      result: `H_{\\max} = ${maxHeightY.toFixed(2)} m (at t = ${timeToApex.toFixed(2)} s)`,
      unit: 'm',
    },
    {
      stepNumber: 3,
      description: 'Total Time of Flight (solving quadratic trajectory equation for y = 0)',
      formula: 't_{flight} = \\frac{v_{0y} + \\sqrt{v_{0y}^2 + 2 g y_0}}{g}',
      substitution: `t_{flight} = \\frac{${v0y.toFixed(2)} + \\sqrt{(${v0y.toFixed(2)})^2 + 2(${g})(${y0})}}{${g}} = ${timeOfFlight.toFixed(2)}\\text{ s}`,
      result: `t = ${timeOfFlight.toFixed(2)} s`,
      unit: 's',
    },
    {
      stepNumber: 4,
      description: 'Total Horizontal Range along ballistic trajectory',
      formula: 'R = v_{0x} \\cdot t_{flight}',
      substitution: `R = (${v0x.toFixed(2)}\\text{ m/s}) \\times (${timeOfFlight.toFixed(2)}\\text{ s}) = ${rangeX.toFixed(2)}\\text{ m}`,
      result: `R = ${rangeX.toFixed(2)} m`,
      unit: 'm',
    },
  ];

  const validations: ValidationFlag[] = [
    {
      type: 'valid',
      message: `2D Projectile motion solved. Maximum range occurs at 45° for level ground (y0 = 0 m). Current angle: ${angleDeg}°.`,
    },
  ];

  const interpretation = `Horizontal motion continues at constant velocity Vx = ${v0x.toFixed(1)} m/s because no horizontal force acts on the particle (neglecting air resistance). Vertical motion experiences constant gravitational deceleration g = ${g} m/s², reaching apex at t = ${timeToApex.toFixed(2)} s before accelerating downward. The resulting trajectory is a parabolic curve.`;

  return {
    timeOfFlight,
    rangeX,
    maxHeightY,
    timeToApex,
    landingVelocity,
    landingAngleDeg,
    trajectory,
    steps,
    validations,
    interpretation,
  };
}
