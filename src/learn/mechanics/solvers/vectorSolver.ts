import { CalculationStep, ValidationFlag, Vector2D } from '../types/mechanics';

export interface VectorCalculationResult {
  vectors: Vector2D[];
  resultantX: number;
  resultantY: number;
  resultantMagnitude: number;
  resultantAngleDeg: number;
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

export function solveVectorSystem(
  f1Mag: number,
  f1Angle: number,
  f2Mag: number,
  f2Angle: number,
  f3Mag: number = 0,
  f3Angle: number = 0
): VectorCalculationResult {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const deg = (r: number) => (r * 180) / Math.PI;

  const f1x = f1Mag * Math.cos(rad(f1Angle));
  const f1y = f1Mag * Math.sin(rad(f1Angle));

  const f2x = f2Mag * Math.cos(rad(f2Angle));
  const f2y = f2Mag * Math.sin(rad(f2Angle));

  const f3x = f3Mag * Math.cos(rad(f3Angle));
  const f3y = f3Mag * Math.sin(rad(f3Angle));

  const rx = f1x + f2x + f3x;
  const ry = f1y + f2y + f3y;

  const rMag = Math.sqrt(rx * rx + ry * ry);
  let rAngle = deg(Math.atan2(ry, rx));
  if (rAngle < 0) rAngle += 360;

  const vectors: Vector2D[] = [
    { id: 'F1', name: 'Force F₁', magnitude: f1Mag, angleDeg: f1Angle, x: f1x, y: f1y, color: '#3b82f6' },
    { id: 'F2', name: 'Force F₂', magnitude: f2Mag, angleDeg: f2Angle, x: f2x, y: f2y, color: '#10b981' },
  ];

  if (f3Mag > 0) {
    vectors.push({ id: 'F3', name: 'Force F₃', magnitude: f3Mag, angleDeg: f3Angle, x: f3x, y: f3y, color: '#f59e0b' });
  }

  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      description: 'Resolve vectors into Cartesian components along X and Y axes',
      formula: 'F_x = F \\cdot \\cos(\\theta), \\quad F_y = F \\cdot \\sin(\\theta)',
      substitution: `F_{1x} = ${f1Mag}\\cos(${f1Angle}^\\circ) = ${f1x.toFixed(2)}\\text{ N}, \\quad F_{1y} = ${f1Mag}\\sin(${f1Angle}^\\circ) = ${f1y.toFixed(2)}\\text{ N}\nF_{2x} = ${f2Mag}\\cos(${f2Angle}^\\circ) = ${f2x.toFixed(2)}\\text{ N}, \\quad F_{2y} = ${f2Mag}\\sin(${f2Angle}^\\circ) = ${f2y.toFixed(2)}\\text{ N}${f3Mag > 0 ? `\nF_{3x} = ${f3Mag}\\cos(${f3Angle}^\\circ) = ${f3x.toFixed(2)}\\text{ N}, \\quad F_{3y} = ${f3Mag}\\sin(${f3Angle}^\\circ) = ${f3y.toFixed(2)}\\text{ N}` : ''}`,
      result: `X-components: (${f1x.toFixed(1)}, ${f2x.toFixed(1)}${f3Mag > 0 ? `, ${f3x.toFixed(1)}` : ''}) N`,
      unit: 'N',
    },
    {
      stepNumber: 2,
      description: 'Algebraic summation of concurrent force components',
      formula: 'R_x = \\sum F_x, \\quad R_y = \\sum F_y',
      substitution: `R_x = ${f1x.toFixed(2)} + ${f2x.toFixed(2)}${f3Mag > 0 ? ` + ${f3x.toFixed(2)}` : ''} = ${rx.toFixed(2)}\\text{ N}\nR_y = ${f1y.toFixed(2)} + ${f2y.toFixed(2)}${f3Mag > 0 ? ` + ${f3y.toFixed(2)}` : ''} = ${ry.toFixed(2)}\\text{ N}`,
      result: `R = (${rx.toFixed(2)} i + ${ry.toFixed(2)} j) N`,
      unit: 'N',
    },
    {
      stepNumber: 3,
      description: 'Calculate Resultant Force magnitude via Pythagorean theorem',
      formula: 'R = \\sqrt{R_x^2 + R_y^2}',
      substitution: `R = \\sqrt{(${rx.toFixed(2)})^2 + (${ry.toFixed(2)})^2}`,
      result: `${rMag.toFixed(2)} N`,
      unit: 'N',
    },
    {
      stepNumber: 4,
      description: 'Calculate Resultant direction angle with positive X-axis',
      formula: '\\theta_R = \\operatorname{atan2}(R_y, R_x)',
      substitution: `\\theta_R = \\operatorname{atan2}(${ry.toFixed(2)}, ${rx.toFixed(2)})`,
      result: `${rAngle.toFixed(2)}°`,
      unit: 'deg',
    },
  ];

  const validations: ValidationFlag[] = [];
  if (rMag < 0.001) {
    validations.push({
      type: 'info',
      message: 'System is in static vector equilibrium (Resultant ≈ 0 N). No net translation will occur.',
    });
  } else {
    validations.push({
      type: 'valid',
      message: `Net unbalanced force of ${rMag.toFixed(2)} N at ${rAngle.toFixed(1)}° will accelerate the particle along this line of action.`,
    });
  }

  const interpretation = `The applied force system acts concurrently on the particle. Resolving each vector into perpendicular Cartesian axes decouples horizontal and vertical interactions. The net resultant vector R = ${rMag.toFixed(2)} N at ${rAngle.toFixed(1)}° represents the single equivalent force that replaces the entire system with identical dynamic translation.`;

  return {
    vectors,
    resultantX: rx,
    resultantY: ry,
    resultantMagnitude: rMag,
    resultantAngleDeg: rAngle,
    steps,
    validations,
    interpretation,
  };
}
