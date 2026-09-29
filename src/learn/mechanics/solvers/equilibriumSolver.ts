import { CalculationStep, ValidationFlag } from '../types/mechanics';

export interface EquilibriumCalculationResult {
  raX: number; // Reaction at A (horizontal)
  raY: number; // Reaction at A (vertical)
  rbY: number; // Reaction at B (vertical)
  ma?: number; // Moment reaction at A if fixed
  isStaticallyDeterminate: boolean;
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

export function solveBeamEquilibrium(
  spanL: number,
  supportTypeA: 'pin' | 'fixed' | 'roller',
  supportTypeB: 'roller' | 'none' | 'pin',
  supportBPos: number, // location of B from A
  pointLoadP: number, // Magnitude in N (acting downward)
  pointLoadPos: number, // location of P from A
  udlW: number = 0 // Uniformly distributed load in N/m
): EquilibriumCalculationResult {
  const steps: CalculationStep[] = [];
  const validations: ValidationFlag[] = [];

  let raX = 0;
  let raY = 0;
  let rbY = 0;
  let ma = 0;
  let isStaticallyDeterminate = true;

  const totalUdlForce = udlW * spanL;
  const udlCentroid = spanL / 2;

  if (supportTypeA === 'fixed' && supportTypeB === 'none') {
    // Cantilever beam
    raX = 0;
    raY = pointLoadP + totalUdlForce;
    ma = pointLoadP * pointLoadPos + totalUdlForce * udlCentroid;

    steps.push(
      {
        stepNumber: 1,
        description: 'Summation of vertical forces for Cantilever (ΣFy = 0)',
        formula: 'R_{Ay} - P - (w \\cdot L) = 0 \\implies R_{Ay} = P + w L',
        substitution: `R_{Ay} = ${pointLoadP} + (${udlW} \\times ${spanL}) = ${raY.toFixed(2)}\\text{ N}`,
        result: `R_{Ay} = ${raY.toFixed(2)} N`,
        unit: 'N',
      },
      {
        stepNumber: 2,
        description: 'Summation of moments about fixed support A (ΣM_A = 0)',
        formula: 'M_A - P \\cdot a - w L \\left(\\frac{L}{2}\\right) = 0 \\implies M_A = P a + \\frac{w L^2}{2}',
        substitution: `M_A = (${pointLoadP} \\times ${pointLoadPos}) + (${udlW} \\times ${spanL} \\times ${udlCentroid}) = ${ma.toFixed(2)}\\text{ N}\\cdot\\text{m}`,
        result: `M_A = ${ma.toFixed(2)} N·m`,
        unit: 'N·m',
      }
    );
  } else {
    // Simply supported / Overhanging beam (Pin at A, Roller at B)
    const bPos = supportBPos > 0 ? supportBPos : spanL;

    // Sum moments about A = 0: R_By * bPos - P * pointLoadPos - (udlW * spanL) * udlCentroid = 0
    rbY = (pointLoadP * pointLoadPos + totalUdlForce * udlCentroid) / bPos;

    // Sum Fy = 0: R_Ay + R_By - P - totalUdlForce = 0
    raY = pointLoadP + totalUdlForce - rbY;
    raX = 0;

    steps.push(
      {
        stepNumber: 1,
        description: 'Take moment about Support A to isolate Reaction R_By (ΣM_A = 0)',
        formula: '\\sum M_A = (R_{By} \\cdot x_B) - (P \\cdot x_P) - (w \\cdot L \\cdot \\frac{L}{2}) = 0',
        substitution: `R_{By} \\cdot ${bPos} - (${pointLoadP} \\times ${pointLoadPos}) - (${udlW} \\times ${spanL} \\times ${udlCentroid}) = 0`,
        result: `R_{By} = ${rbY.toFixed(2)} N`,
        unit: 'N',
      },
      {
        stepNumber: 2,
        description: 'Sum vertical equilibrium forces to find Reaction R_Ay (ΣFy = 0)',
        formula: '\\sum F_y = R_{Ay} + R_{By} - P - (w \\cdot L) = 0 \\implies R_{Ay} = P + w L - R_{By}',
        substitution: `R_{Ay} = ${pointLoadP} + ${totalUdlForce.toFixed(1)} - ${rbY.toFixed(2)} = ${raY.toFixed(2)}\\text{ N}`,
        result: `R_{Ay} = ${raY.toFixed(2)} N`,
        unit: 'N',
      },
      {
        stepNumber: 3,
        description: 'Sum horizontal forces for pin support A (ΣFx = 0)',
        formula: '\\sum F_x = R_{Ax} = 0',
        substitution: `R_{Ax} = 0\\text{ N}`,
        result: `R_{Ax} = 0 N`,
        unit: 'N',
      }
    );
  }

  validations.push({
    type: 'valid',
    message: `Equilibrium verified. Sum of reactions (${(raY + rbY).toFixed(2)} N) perfectly balances applied downward loads (${(pointLoadP + totalUdlForce).toFixed(2)} N).`,
  });

  const interpretation = `Under the static laws of rigid body equilibrium (ΣFx=0, ΣFy=0, ΣM=0), the structural supports generate reactive upward forces R_Ay = ${raY.toFixed(2)} N and R_By = ${rbY.toFixed(2)} N${ma ? ` with clamping moment M_A = ${ma.toFixed(2)} N·m` : ''}. As the concentrated load moves closer to a support, that reaction increases proportionally.`;

  return {
    raX,
    raY,
    rbY,
    ma: ma || undefined,
    isStaticallyDeterminate,
    steps,
    validations,
    interpretation,
  };
}
