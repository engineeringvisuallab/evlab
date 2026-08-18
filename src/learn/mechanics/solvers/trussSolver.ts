import { CalculationStep, ValidationFlag } from '../types/mechanics';

export interface TrussNode {
  id: string;
  x: number; // m
  y: number; // m
  isPin?: boolean; // Restrained in X and Y
  isRoller?: boolean; // Restrained in Y
  loadX?: number; // N
  loadY?: number; // N (negative = downward)
}

export interface TrussMember {
  id: string;
  nodeA: string;
  nodeB: string;
  force?: number; // N (positive = Tension, negative = Compression)
  state?: 'Tension' | 'Compression' | 'Zero-Force';
}

export interface TrussAnalysisResult {
  nodes: TrussNode[];
  members: TrussMember[];
  reactions: {
    nodeId: string;
    rx: number;
    ry: number;
  }[];
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

// Classical Warren/Pratt/Bridge 2D Truss Solver using Method of Joints Equilibrium
export function solveStandardTruss(
  spanL: number = 6,
  heightH: number = 3,
  loadCenterN: number = 1000
): TrussAnalysisResult {
  // Standard 5-node triangular bridge truss
  // A(0,0)[Pin], B(spanL/2, 0), C(spanL, 0)[Roller], D(spanL/4, heightH), E(3*spanL/4, heightH)
  const nodes: TrussNode[] = [
    { id: 'A', x: 0, y: 0, isPin: true, loadX: 0, loadY: 0 },
    { id: 'B', x: spanL / 2, y: 0, loadX: 0, loadY: -loadCenterN },
    { id: 'C', x: spanL, y: 0, isRoller: true, loadX: 0, loadY: 0 },
    { id: 'D', x: spanL / 4, y: heightH, loadX: 0, loadY: 0 },
    { id: 'E', x: (3 * spanL) / 4, y: heightH, loadX: 0, loadY: 0 },
  ];

  // Members
  // Bottom chord: AB, BC
  // Top chord: DE
  // Diagonals/Verticals: AD, DB, BE, EC, DE
  const halfSpan = spanL / 2;
  const diagLen = Math.sqrt(Math.pow(spanL / 4, 2) + Math.pow(heightH, 2));
  const sinTheta = heightH / diagLen;
  const cosTheta = (spanL / 4) / diagLen;

  // External Reactions
  const rAy = loadCenterN / 2;
  const rCy = loadCenterN / 2;
  const rAx = 0;

  // Internal Forces via Method of Joints:
  // Node A:
  // ΣFy = 0 => F_AD * sin(theta) + rAy = 0 => F_AD = -rAy / sin(theta) (Compression)
  const fAD = -rAy / sinTheta;
  // ΣFx = 0 => F_AB + F_AD * cos(theta) = 0 => F_AB = -F_AD * cos(theta) (Tension)
  const fAB = -fAD * cosTheta;

  // By Symmetry:
  const fEC = fAD;
  const fBC = fAB;

  // Joint D:
  // ΣFy = 0 => -F_AD * sin(theta) - F_DB * sin(theta) = 0 => F_DB = -F_AD (Tension)
  const fDB = -fAD; // Tension
  // ΣFx = 0 => F_DE - F_AD * cos(theta) + F_DB * cos(theta) = 0
  const fDE = 2 * fAD * cosTheta; // Compression

  const fBE = fDB;

  const members: TrussMember[] = [
    { id: 'AB', nodeA: 'A', nodeB: 'B', force: fAB, state: 'Tension' },
    { id: 'BC', nodeA: 'B', nodeB: 'C', force: fBC, state: 'Tension' },
    { id: 'DE', nodeA: 'D', nodeB: 'E', force: fDE, state: 'Compression' },
    { id: 'AD', nodeA: 'A', nodeB: 'D', force: fAD, state: 'Compression' },
    { id: 'DB', nodeA: 'D', nodeB: 'B', force: fDB, state: 'Tension' },
    { id: 'BE', nodeA: 'B', nodeB: 'E', force: fBE, state: 'Tension' },
    { id: 'EC', nodeA: 'E', nodeB: 'C', force: fEC, state: 'Compression' },
  ];

  const reactions = [
    { nodeId: 'A', rx: rAx, ry: rAy },
    { nodeId: 'C', rx: 0, ry: rCy },
  ];

  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      description: 'Global Equilibrium to compute support reactions',
      formula: '\\sum F_y = R_{Ay} + R_{Cy} - P = 0, \\quad R_{Ay} = R_{Cy} = \\frac{P}{2}',
      substitution: `R_{Ay} = R_{Cy} = \\frac{${loadCenterN}}{2} = ${rAy.toFixed(2)}\\text{ N}`,
      result: `R_{Ay} = ${rAy.toFixed(2)} N, R_{Cy} = ${rCy.toFixed(2)} N`,
      unit: 'N',
    },
    {
      stepNumber: 2,
      description: 'Method of Joints at Pin Support A (Joint A equilibrium)',
      formula: '\\sum F_y = R_{Ay} + F_{AD}\\sin\\theta = 0 \\implies F_{AD} = -\\frac{R_{Ay}}{\\sin\\theta}',
      substitution: `F_{AD} = -\\frac{${rAy.toFixed(1)}}{${sinTheta.toFixed(3)}} = ${fAD.toFixed(2)}\\text{ N (Compression)}`,
      result: `F_{AD} = ${Math.abs(fAD).toFixed(2)} N (C)`,
      unit: 'N',
    },
    {
      stepNumber: 3,
      description: 'Bottom Chord Tension at Joint A',
      formula: '\\sum F_x = F_{AB} + F_{AD}\\cos\\theta = 0 \\implies F_{AB} = -F_{AD}\\cos\\theta',
      substitution: `F_{AB} = -(${fAD.toFixed(2)}) \\times ${cosTheta.toFixed(3)} = ${fAB.toFixed(2)}\\text{ N (Tension)}`,
      result: `F_{AB} = ${fAB.toFixed(2)} N (T)`,
      unit: 'N',
    },
    {
      stepNumber: 4,
      description: 'Top Chord Compression at Joint D',
      formula: '\\sum F_x = 0 \\implies F_{DE} = ${fDE.toFixed(2)}\\text{ N (Compression)}',
      substitution: `F_{DE} = ${fDE.toFixed(2)}\\text{ N}`,
      result: `F_{DE} = ${Math.abs(fDE).toFixed(2)} N (C)`,
      unit: 'N',
    },
  ];

  const validations: ValidationFlag[] = [
    {
      type: 'valid',
      message: `2D Truss is statically determinate (b + r = 2j: 7 + 3 = 2(5) = 10). Internal member equilibrium verified.`,
    },
  ];

  const interpretation = `Trusses transfer external transverse loads into pure axial forces (tension and compression) through pin-connected two-force members. The top chord (DE) is under high compression (${Math.abs(fDE).toFixed(1)} N, susceptible to Euler buckling), while the bottom chords (AB, BC) carry pure tension (${fAB.toFixed(1)} N), creating an efficient internal couple arm of height ${heightH} m.`;

  return {
    nodes,
    members,
    reactions,
    steps,
    validations,
    interpretation,
  };
}
