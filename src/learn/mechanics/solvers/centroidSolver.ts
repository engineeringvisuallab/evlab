import { CalculationStep, ValidationFlag } from '../types/mechanics';

export interface ShapeElement {
  id: string;
  name: string;
  type: 'rectangle' | 'triangle' | 'circle' | 'semicircle';
  width: number;
  height: number;
  radius?: number;
  posX: number; // Bottom-left or center
  posY: number;
  isHole?: boolean;
}

export interface CentroidCalculationResult {
  totalArea: number;
  centroidX: number;
  centroidY: number;
  firstMomentQx: number; // sum(A_i * y_i)
  firstMomentQy: number; // sum(A_i * x_i)
  ixx: number; // Moment of inertia about centroidal axis
  iyy: number;
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
  elements: {
    name: string;
    area: number;
    cx: number;
    cy: number;
    ax: number;
    ay: number;
  }[];
}

export function solveCompositeCentroid(elements: ShapeElement[]): CentroidCalculationResult {
  let totalArea = 0;
  let sumAx = 0;
  let sumAy = 0;

  const analyzedElements = elements.map((elem) => {
    let area = 0;
    let cx = 0;
    let cy = 0;

    if (elem.type === 'rectangle') {
      area = elem.width * elem.height;
      cx = elem.posX + elem.width / 2;
      cy = elem.posY + elem.height / 2;
    } else if (elem.type === 'triangle') {
      area = 0.5 * elem.width * elem.height;
      cx = elem.posX + (1 / 3) * elem.width;
      cy = elem.posY + (1 / 3) * elem.height;
    } else if (elem.type === 'circle') {
      const r = elem.radius || elem.width / 2;
      area = Math.PI * r * r;
      cx = elem.posX;
      cy = elem.posY;
    }

    if (elem.isHole) {
      area = -Math.abs(area);
    }

    const ax = area * cx;
    const ay = area * cy;

    totalArea += area;
    sumAx += ax;
    sumAy += ay;

    return {
      name: elem.name,
      area,
      cx,
      cy,
      ax,
      ay,
    };
  });

  const centroidX = totalArea !== 0 ? sumAx / totalArea : 0;
  const centroidY = totalArea !== 0 ? sumAy / totalArea : 0;

  // Approximate Moments of inertia about centroidal axes using Parallel Axis Theorem
  let ixx = 0;
  let iyy = 0;
  elements.forEach((elem, idx) => {
    const ae = analyzedElements[idx];
    let i0x = 0;
    let i0y = 0;
    if (elem.type === 'rectangle') {
      i0x = (elem.width * Math.pow(elem.height, 3)) / 12;
      i0y = (elem.height * Math.pow(elem.width, 3)) / 12;
    } else if (elem.type === 'circle') {
      const r = elem.radius || elem.width / 2;
      i0x = (Math.PI * Math.pow(r, 4)) / 4;
      i0y = i0x;
    }
    const dy = ae.cy - centroidY;
    const dx = ae.cx - centroidX;
    const sign = elem.isHole ? -1 : 1;
    ixx += sign * (i0x + Math.abs(ae.area) * dy * dy);
    iyy += sign * (i0y + Math.abs(ae.area) * dx * dx);
  });

  const steps: CalculationStep[] = [
    {
      stepNumber: 1,
      description: 'Compute individual geometric areas and localized centroids (x_i, y_i)',
      formula: 'A_i = f(\\text{shape}), \\quad \\bar{x}_i, \\bar{y}_i',
      substitution: analyzedElements
        .map((e) => `${e.name}: A=${e.area.toFixed(1)} \\text{ m}^2, (\\bar{x},\\bar{y})=(${e.cx.toFixed(2)}, ${e.cy.toFixed(2)})`)
        .join('\n'),
      result: `Total Area A = ${totalArea.toFixed(2)} m²`,
      unit: 'm²',
    },
    {
      stepNumber: 2,
      description: 'Sum first moments of area about Cartesian coordinate datum',
      formula: 'Q_y = \\sum (A_i \\bar{x}_i), \\quad Q_x = \\sum (A_i \\bar{y}_i)',
      substitution: `Q_y = ${sumAx.toFixed(2)} \\text{ m}^3, \\quad Q_x = ${sumAy.toFixed(2)} \\text{ m}^3`,
      result: `Q_y = ${sumAx.toFixed(2)} m³, Q_x = ${sumAy.toFixed(2)} m³`,
      unit: 'm³',
    },
    {
      stepNumber: 3,
      description: 'Calculate composite section centroid coordinates (X_c, Y_c)',
      formula: '\\bar{X} = \\frac{\\sum A_i \\bar{x}_i}{\\sum A_i}, \\quad \\bar{Y} = \\frac{\\sum A_i \\bar{y}_i}{\\sum A_i}',
      substitution: `\\bar{X} = \\frac{${sumAx.toFixed(2)}}{${totalArea.toFixed(2)}} = ${centroidX.toFixed(3)}\\text{ m}, \\quad \\bar{Y} = \\frac{${sumAy.toFixed(2)}}{${totalArea.toFixed(2)}} = ${centroidY.toFixed(3)}\\text{ m}`,
      result: `Centroid C = (${centroidX.toFixed(3)}, ${centroidY.toFixed(3)}) m`,
      unit: 'm',
    },
    {
      stepNumber: 4,
      description: 'Compute centroidal Second Moment of Area (Moment of Inertia Ixx, Iyy)',
      formula: 'I_{xx} = \\sum (I_{0x} + A_i d_{yi}^2), \\quad I_{yy} = \\sum (I_{0y} + A_i d_{xi}^2)',
      substitution: `I_{xx} = ${ixx.toFixed(4)} \\text{ m}^4, \\quad I_{yy} = ${iyy.toFixed(4)} \\text{ m}^4`,
      result: `I_xx = ${ixx.toFixed(4)} m⁴, I_yy = ${iyy.toFixed(4)} m⁴`,
      unit: 'm⁴',
    },
  ];

  const validations: ValidationFlag[] = [
    {
      type: 'valid',
      message: `Composite centroid established at (${centroidX.toFixed(2)}, ${centroidY.toFixed(2)}) m with net cross-sectional area ${totalArea.toFixed(2)} m².`,
    },
  ];

  const interpretation = `The centroid represents the geometric center of gravity for a homogeneous cross-section. It is the neutral axis along which bending normal stresses σ = My/I equal zero. For structural I-beams and T-sections, placing material further from this calculated centroid dramatically maximizes the second moment of area Ixx (${ixx.toFixed(4)} m⁴), resisting flexural deformation with minimal weight.`;

  return {
    totalArea,
    centroidX,
    centroidY,
    firstMomentQx: sumAy,
    firstMomentQy: sumAx,
    ixx,
    iyy,
    steps,
    validations,
    interpretation,
    elements: analyzedElements,
  };
}
