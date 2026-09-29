import {
  CalculationTrace,
  ColumnEndCondition,
  Material,
  PointLoad,
  SectionProperties,
} from '../types';
import { formatEngValue } from '../core/units';

let calcCounter = 100;

export function generateCalcId(prefix: string): string {
  calcCounter++;
  return `EVLAB-${prefix}-${calcCounter.toString().padStart(5, '0')}`;
}

// 1. AXIAL STRESS & DEFORMATION
export interface AxialCalculationResult {
  loadN: number;
  areaMm2: number;
  stressMPa: number;
  strain: number;
  deformationMm: number;
  elongationMm: number;
  safetyFactor: number;
  utilizationRatio: number;
  status: 'safe' | 'warning' | 'yield' | 'failure';
  trace: CalculationTrace;
}

export function calculateAxial(
  loadKN: number,
  lengthM: number,
  material: Material,
  section: SectionProperties,
  isTension: boolean = true
): AxialCalculationResult {
  const loadN = Math.abs(loadKN) * 1000 * (isTension ? 1 : -1);
  const lengthMm = lengthM * 1000;
  const areaMm2 = Math.max(1, section.area);
  const EMpa = material.E * 1000; // GPa to MPa

  const stressMPa = loadN / areaMm2;
  const strain = stressMPa / EMpa;
  const deformationMm = (loadN * lengthMm) / (areaMm2 * EMpa);

  const allowableYield = isTension ? material.yieldStrength : (material.compressiveStrength || material.yieldStrength);
  const absStress = Math.abs(stressMPa);
  const safetyFactor = absStress > 0 ? allowableYield / absStress : 999;
  const utilizationRatio = absStress / allowableYield;

  let status: 'safe' | 'warning' | 'yield' | 'failure' = 'safe';
  if (utilizationRatio >= 1.0) status = 'yield';
  if (absStress >= material.ultimateStrength) status = 'failure';
  else if (utilizationRatio > 0.8) status = 'warning';

  const trace: CalculationTrace = {
    calcId: generateCalcId('AXIAL'),
    topic: 'Axial Stress and Deformation',
    title: `${isTension ? 'Tensile' : 'Compressive'} Bar Normal Stress & Elongation`,
    timestamp: new Date().toISOString(),
    inputs: [
      { symbol: 'P', name: 'Axial Load', value: loadKN, unit: 'kN' },
      { symbol: 'L', name: 'Bar Length', value: lengthM, unit: 'm' },
      { symbol: 'A', name: 'Cross-Section Area', value: formatEngValue(areaMm2), unit: 'mm²' },
      { symbol: 'E', name: 'Young’s Modulus', value: material.E, unit: 'GPa' },
      { symbol: 'σ_y', name: 'Yield Strength', value: material.yieldStrength, unit: 'MPa' },
    ],
    formulaName: 'Normal Stress & Hookean Axial Elongation',
    formulaLatex: '\\sigma = \\frac{P}{A}, \\quad \\delta = \\frac{P L}{A E}',
    substitution: `\\sigma = \\frac{${Math.abs(loadN).toLocaleString()} \\text{ N}}{${formatEngValue(areaMm2)} \\text{ mm}^2} = ${formatEngValue(absStress)} \\text{ MPa}, \\quad \\delta = \\frac{(${Math.abs(loadN).toLocaleString()})(${lengthMm})}{(${formatEngValue(areaMm2)})(${EMpa})} = ${formatEngValue(Math.abs(deformationMm))} \\text{ mm}`,
    result: {
      symbol: 'σ',
      value: stressMPa,
      formatted: `${formatEngValue(stressMPa)} MPa (${isTension ? 'Tension' : 'Compression'})`,
      unit: 'MPa',
    },
    assumptions: [
      'Uniform axial stress distribution across cross-section (Saint-Venant’s principle away from load application)',
      'Prismatic homogeneous bar with isotropic linear-elastic material response',
      'Small strain theory (engineering strain ε = δ/L)',
    ],
    materialUsed: material.name,
    engineeringInterpretation: `The bar experiences ${isTension ? 'tensile elongation' : 'compressive shortening'} of ${formatEngValue(Math.abs(deformationMm))} mm with an axial stress of ${formatEngValue(absStress)} MPa (Safety Factor = ${formatEngValue(safetyFactor)}).`,
    reference: 'Beer, Johnston, DeWolf & Mazurek, Mechanics of Materials, 8th Ed., Chapter 1 & 2',
  };

  return {
    loadN,
    areaMm2,
    stressMPa,
    strain,
    deformationMm,
    elongationMm: deformationMm,
    safetyFactor,
    utilizationRatio,
    status,
    trace,
  };
}

export const calculateAxialStress = calculateAxial;


// 2. TORSION OF CIRCULAR SHAFTS
export interface TorsionCalculationResult {
  torqueNm: number;
  lengthM: number;
  polarMomentJMm4: number;
  maxShearStressMPa: number;
  angleTwistDeg: number;
  angleTwistRad: number;
  torsionalStiffnessNmPerRad: number;
  safetyFactor: number;
  status: 'safe' | 'warning' | 'yield' | 'failure';
  trace: CalculationTrace;
}

export function calculateTorsion(
  arg1: number | { torqueKNm?: number; appliedTorqueKNm?: number; lengthM?: number; shaftLengthM?: number; material: Material; section: SectionProperties },
  lengthMArg?: number,
  materialArg?: Material,
  sectionArg?: SectionProperties
): TorsionCalculationResult {
  let torqueKNm = 10;
  let lengthM = 3;
  let material: Material;
  let section: SectionProperties;

  if (typeof arg1 === 'object' && arg1 !== null && 'material' in arg1) {
    torqueKNm = arg1.torqueKNm ?? arg1.appliedTorqueKNm ?? 10;
    lengthM = arg1.lengthM ?? arg1.shaftLengthM ?? 3;
    material = arg1.material;
    section = arg1.section;
  } else {
    torqueKNm = typeof arg1 === 'number' ? arg1 : 10;
    lengthM = lengthMArg ?? 3;
    material = materialArg!;
    section = sectionArg!;
  }
  const torqueNmm = Math.abs(torqueKNm) * 1e6; // kN*m to N*mm
  const torqueNm = Math.abs(torqueKNm) * 1000;
  const lengthMm = lengthM * 1000;
  const GMpa = material.G * 1000; // GPa to MPa
  const JMm4 = Math.max(1, section.J);
  const outerRadiusMm = (section.dimensions.diameter ? section.dimensions.diameter : (section.dimensions.height ?? 0)) / 2;

  const maxShearStressMPa = (torqueNmm * outerRadiusMm) / JMm4;
  const angleTwistRad = (torqueNmm * lengthMm) / (JMm4 * GMpa);
  const angleTwistDeg = (angleTwistRad * 180) / Math.PI;
  const torsionalStiffnessNmPerRad = (JMm4 * 1e-12 * material.G * 1e9) / lengthM;

  const allowableShear = material.shearStrength || material.yieldStrength * 0.577;
  const safetyFactor = maxShearStressMPa > 0 ? allowableShear / maxShearStressMPa : 999;
  const utilizationRatio = maxShearStressMPa / allowableShear;

  let status: 'safe' | 'warning' | 'yield' | 'failure' = 'safe';
  if (utilizationRatio >= 1.0) status = 'yield';
  if (maxShearStressMPa >= material.ultimateStrength * 0.6) status = 'failure';
  else if (utilizationRatio > 0.8) status = 'warning';

  const trace: CalculationTrace = {
    calcId: generateCalcId('TORSION'),
    topic: 'Torsion of Circular Shafts',
    title: 'Circular Shaft Torsional Shear Stress & Twist Angle',
    timestamp: new Date().toISOString(),
    inputs: [
      { symbol: 'T', name: 'Applied Torque', value: torqueKNm, unit: 'kN·m' },
      { symbol: 'L', name: 'Shaft Length', value: lengthM, unit: 'm' },
      { symbol: 'J', name: 'Polar Moment of Inertia', value: formatEngValue(JMm4), unit: 'mm⁴' },
      { symbol: 'c', name: 'Outer Radius', value: outerRadiusMm, unit: 'mm' },
      { symbol: 'G', name: 'Shear Modulus', value: material.G, unit: 'GPa' },
      { symbol: 'τ_allow', name: 'Shear Strength', value: allowableShear, unit: 'MPa' },
    ],
    formulaName: 'Torsion Elastic Formula',
    formulaLatex: '\\tau_{\\max} = \\frac{T c}{J}, \\quad \\theta = \\frac{T L}{G J}',
    substitution: `\\tau_{\\max} = \\frac{(${formatEngValue(torqueNmm)})(${outerRadiusMm})}{${formatEngValue(JMm4)}} = ${formatEngValue(maxShearStressMPa)} \\text{ MPa}, \\quad \\theta = \\frac{(${formatEngValue(torqueNmm)})(${lengthMm})}{(${formatEngValue(GMpa)})(${formatEngValue(JMm4)})} = ${angleTwistRad.toFixed(4)} \\text{ rad} = ${angleTwistDeg.toFixed(2)}^\\circ`,
    result: {
      symbol: 'τ_max',
      value: maxShearStressMPa,
      formatted: `${formatEngValue(maxShearStressMPa)} MPa`,
      unit: 'MPa',
    },
    assumptions: [
      'Circular cross-section (plane sections remain plane and normal to the axis without warping)',
      'Linear elastic, isotropic material obeying Hooke’s law for shear',
      'Uniform torque applied along axis without stress concentrations',
    ],
    materialUsed: material.name,
    engineeringInterpretation: `Under ${torqueKNm} kN·m torque, maximum surface shear stress is ${formatEngValue(maxShearStressMPa)} MPa and total angle of twist is ${angleTwistDeg.toFixed(2)}° (Safety Factor = ${formatEngValue(safetyFactor)}).`,
    reference: 'Hibbeler, Mechanics of Materials, 10th Ed., Chapter 5 (Torsion)',
  };

  return {
    torqueNm,
    lengthM,
    polarMomentJMm4: JMm4,
    maxShearStressMPa,
    angleTwistDeg,
    angleTwistRad,
    torsionalStiffnessNmPerRad,
    safetyFactor,
    status,
    trace,
  };
}

// 3. BEAM EQUILIBRIUM, REACTIONS, SFD, BMD & DEFLECTION
export interface BeamCalculationResult {
  supportType: 'simply_supported' | 'cantilever' | 'fixed_fixed';
  spanLengthM: number;
  reactionA: number; // kN (left support)
  reactionB: number; // kN (right support)
  reactionMomentA: number; // kN*m (moment reaction at A if fixed)
  maxBendingMomentKNm: number;
  maxShearForceKN: number;
  maxDeflectionMm: number;
  maxFlexuralStressMPa: number;
  maxShearStressMPa: number;
  safetyFactor: number;
  status: 'safe' | 'warning' | 'yield' | 'failure';
  sfdPoints: { x: number; v: number }[]; // Shear Force diagram points (x in m, v in kN)
  bmdPoints: { x: number; m: number }[]; // Bending Moment diagram points (x in m, m in kN*m)
  deflectionPoints: { x: number; y: number }[]; // Deflection curve points (x in m, y in mm)
  trace: CalculationTrace;
}

export function calculateBeam(
  arg1: 'simply_supported' | 'cantilever' | 'fixed_fixed' | {
    supportType?: 'simply_supported' | 'cantilever' | 'fixed_fixed';
    spanLengthM?: number;
    pointLoads?: PointLoad[];
    udlKNm?: number;
    material: Material;
    section: SectionProperties;
  },
  spanLengthMArg?: number,
  pointLoadsArg?: PointLoad[],
  udlKNmArg?: number,
  materialArg?: Material,
  sectionArg?: SectionProperties
): BeamCalculationResult {
  let supportType: 'simply_supported' | 'cantilever' | 'fixed_fixed' = 'simply_supported';
  let spanLengthM = 4;
  let pointLoads: PointLoad[] = [];
  let udlKNm = 0;
  let material: Material;
  let section: SectionProperties;

  if (typeof arg1 === 'object' && arg1 !== null && 'material' in arg1) {
    supportType = arg1.supportType || 'simply_supported';
    spanLengthM = arg1.spanLengthM ?? 4;
    pointLoads = arg1.pointLoads ?? [];
    udlKNm = arg1.udlKNm ?? 0;
    material = arg1.material;
    section = arg1.section;
  } else {
    supportType = arg1 as 'simply_supported' | 'cantilever' | 'fixed_fixed';
    spanLengthM = spanLengthMArg ?? 4;
    pointLoads = pointLoadsArg ?? [];
    udlKNm = udlKNmArg ?? 0;
    material = materialArg!;
    section = sectionArg!;
  }
  const L = Math.max(0.5, spanLengthM);
  const IxMm4 = Math.max(1, section.Ix);
  const EMpa = material.E * 1000;
  const EI = (EMpa * IxMm4) / 1e6; // N*m2 = kN*m2 / 1000

  // Calculate Support Reactions
  let reactionA = 0;
  let reactionB = 0;
  let reactionMomentA = 0;

  const totalUdlLoad = udlKNm * L;
  const udlMomentAboutA = totalUdlLoad * (L / 2);

  let pointLoadsTotal = 0;
  let pointLoadsMomentAboutA = 0;
  pointLoads.forEach(p => {
    pointLoadsTotal += p.magnitude;
    pointLoadsMomentAboutA += p.magnitude * Math.min(L, Math.max(0, p.position));
  });

  if (supportType === 'simply_supported') {
    // ΣM_A = 0 => R_B * L = udlMomentAboutA + pointLoadsMomentAboutA
    reactionB = (udlMomentAboutA + pointLoadsMomentAboutA) / L;
    reactionA = totalUdlLoad + pointLoadsTotal - reactionB;
  } else if (supportType === 'cantilever') {
    // Fixed at Left (x=0), Free at Right (x=L)
    reactionA = totalUdlLoad + pointLoadsTotal;
    reactionMomentA = udlMomentAboutA + pointLoadsMomentAboutA;
  } else if (supportType === 'fixed_fixed') {
    // Fixed-fixed symmetrical case for UDL and centered loads
    reactionA = (totalUdlLoad + pointLoadsTotal) / 2;
    reactionB = reactionA;
    reactionMomentA = (udlKNm * L * L) / 12;
    pointLoads.forEach(p => {
      const a = p.position;
      const b = L - a;
      reactionMomentA += (p.magnitude * a * b * b) / (L * L);
    });
  }

  // Generate SFD, BMD & Deflection Curves over 101 sample points
  const numSteps = 100;
  const sfdPoints: { x: number; v: number }[] = [];
  const bmdPoints: { x: number; m: number }[] = [];
  const deflectionPoints: { x: number; y: number }[] = [];

  let maxV = 0;
  let maxM = 0;
  let maxDeflectionMm = 0;

  for (let i = 0; i <= numSteps; i++) {
    const x = (i / numSteps) * L;
    let V = 0;
    let M = 0;

    if (supportType === 'simply_supported') {
      V = reactionA - udlKNm * x;
      M = reactionA * x - (udlKNm * x * x) / 2;

      pointLoads.forEach(p => {
        if (x >= p.position) {
          V -= p.magnitude;
          M -= p.magnitude * (x - p.position);
        }
      });
    } else if (supportType === 'cantilever') {
      // From free end x to L, or from fixed end x=0
      V = reactionA - udlKNm * x;
      M = -reactionMomentA + reactionA * x - (udlKNm * x * x) / 2;

      pointLoads.forEach(p => {
        if (x >= p.position) {
          V -= p.magnitude;
          M -= p.magnitude * (x - p.position);
        }
      });
    } else {
      // Fixed-Fixed
      V = reactionA - udlKNm * x;
      M = -reactionMomentA + reactionA * x - (udlKNm * x * x) / 2;

      pointLoads.forEach(p => {
        if (x >= p.position) {
          V -= p.magnitude;
          M -= p.magnitude * (x - p.position);
        }
      });
    }

    if (Math.abs(V) > maxV) maxV = Math.abs(V);
    if (Math.abs(M) > maxM) maxM = Math.abs(M);

    sfdPoints.push({ x, v: V });
    bmdPoints.push({ x, m: M });
  }

  // Deflection computation using standard structural formulas for clarity and accuracy
  for (let i = 0; i <= numSteps; i++) {
    const x = (i / numSteps) * L;
    let defMm = 0;

    if (supportType === 'simply_supported') {
      // UDL: v(x) = (w x / 24 E I) * (L^3 - 2 L x^2 + x^3)
      if (udlKNm > 0 && EI > 0) {
        const vUdlM = (udlKNm * x * (Math.pow(L, 3) - 2 * L * Math.pow(x, 2) + Math.pow(x, 3))) / (24 * EI);
        defMm += vUdlM * 1000;
      }
      // Point loads:
      pointLoads.forEach(p => {
        const P = p.magnitude;
        const a = Math.min(p.position, L);
        const b = L - a;
        if (EI > 0) {
          if (x <= a) {
            const vM = (P * b * x * (L * L - b * b - x * x)) / (6 * L * EI);
            defMm += vM * 1000;
          } else {
            const vM = (P * a * (L - x) * (2 * L * x - x * x - a * a)) / (6 * L * EI);
            defMm += vM * 1000;
          }
        }
      });
    } else if (supportType === 'cantilever') {
      // Cantilever deflection
      if (udlKNm > 0 && EI > 0) {
        const vUdlM = (udlKNm * Math.pow(x, 2) * (6 * L * L - 4 * L * x + x * x)) / (24 * EI);
        defMm += vUdlM * 1000;
      }
      pointLoads.forEach(p => {
        const P = p.magnitude;
        const a = Math.min(p.position, L);
        if (EI > 0) {
          if (x <= a) {
            const vM = (P * Math.pow(x, 2) * (3 * a - x)) / (6 * EI);
            defMm += vM * 1000;
          } else {
            const vM = (P * Math.pow(a, 2) * (3 * x - a)) / (6 * EI);
            defMm += vM * 1000;
          }
        }
      });
    } else {
      // Fixed-Fixed
      if (udlKNm > 0 && EI > 0) {
        const vUdlM = (udlKNm * Math.pow(x, 2) * Math.pow(L - x, 2)) / (24 * EI);
        defMm += vUdlM * 1000;
      }
      pointLoads.forEach(p => {
        const P = p.magnitude;
        const a = Math.min(p.position, L);
        const b = L - a;
        if (EI > 0) {
          if (x <= a) {
            const vM = (P * Math.pow(b, 2) * Math.pow(x, 2) * (3 * a * L - 3 * a * x - b * x)) / (6 * Math.pow(L, 3) * EI);
            defMm += vM * 1000;
          } else {
            const vM = (P * Math.pow(a, 2) * Math.pow(L - x, 2) * (3 * b * L - 3 * b * (L - x) - a * (L - x))) / (6 * Math.pow(L, 3) * EI);
            defMm += vM * 1000;
          }
        }
      });
    }

    if (Math.abs(defMm) > maxDeflectionMm) maxDeflectionMm = Math.abs(defMm);
    deflectionPoints.push({ x, y: defMm });
  }

  // Stresses
  const maxBendingMomentNmm = maxM * 1e6;
  const maxShearForceN = maxV * 1000;
  const maxFlexuralStressMPa = maxBendingMomentNmm / Math.max(1, section.Zx);
  const maxShearStressMPa = (maxShearForceN * section.Qmax) / (Math.max(1, section.Ix) * Math.max(1, section.bAtNA));

  const allowableNormal = material.yieldStrength;
  const allowableShear = material.shearStrength || material.yieldStrength * 0.577;
  const normalSF = maxFlexuralStressMPa > 0 ? allowableNormal / maxFlexuralStressMPa : 999;
  const shearSF = maxShearStressMPa > 0 ? allowableShear / maxShearStressMPa : 999;
  const safetyFactor = Math.min(normalSF, shearSF);
  const utilizationRatio = Math.max(maxFlexuralStressMPa / allowableNormal, maxShearStressMPa / allowableShear);

  let status: 'safe' | 'warning' | 'yield' | 'failure' = 'safe';
  if (utilizationRatio >= 1.0) status = 'yield';
  if (maxFlexuralStressMPa >= material.ultimateStrength) status = 'failure';
  else if (utilizationRatio > 0.8) status = 'warning';

  const trace: CalculationTrace = {
    calcId: generateCalcId('BEAM'),
    topic: 'Beam Bending & Equilibrium',
    title: `${supportType.replace('_', ' ').toUpperCase()} Beam Statics, Reactions & Stress`,
    timestamp: new Date().toISOString(),
    inputs: [
      { symbol: 'L', name: 'Span Length', value: spanLengthM, unit: 'm' },
      { symbol: 'w', name: 'UDL Load', value: udlKNm, unit: 'kN/m' },
      { symbol: 'P_pts', name: 'Point Loads Count', value: pointLoads.length, unit: 'loads' },
      { symbol: 'Ix', name: 'Moment of Inertia', value: formatEngValue(section.Ix), unit: 'mm⁴' },
      { symbol: 'Zx', name: 'Section Modulus', value: formatEngValue(section.Zx), unit: 'mm³' },
      { symbol: 'E', name: 'Young’s Modulus', value: material.E, unit: 'GPa' },
    ],
    formulaName: 'Beam Statics & Flexure Formula',
    formulaLatex: 'M_{\\max} = f(\\text{loads}), \\quad \\sigma_{\\max} = \\frac{M_{\\max} y}{I} = \\frac{M_{\\max}}{Z}, \\quad \\tau_{\\max} = \\frac{V Q}{I b}',
    substitution: `M_{\\max} = ${formatEngValue(maxM)} \\text{ kN}\\cdot\\text{m}, \\quad \\sigma_{\\max} = \\frac{${formatEngValue(maxBendingMomentNmm)} \\text{ N}\\cdot\\text{mm}}{${formatEngValue(section.Zx)} \\text{ mm}^3} = ${formatEngValue(maxFlexuralStressMPa)} \\text{ MPa}, \\quad \\delta_{\\max} = ${formatEngValue(maxDeflectionMm)} \\text{ mm}`,
    result: {
      symbol: 'σ_max',
      value: maxFlexuralStressMPa,
      formatted: `${formatEngValue(maxFlexuralStressMPa)} MPa (Flexure), Max δ = ${formatEngValue(maxDeflectionMm)} mm`,
      unit: 'MPa',
    },
    assumptions: [
      'Euler-Bernoulli beam theory (plane sections remain plane and perpendicular to neutral axis)',
      'Deflections are small compared to beam depth (linear curvature approximation)',
      'Homogeneous isotropic material behaving elastically',
    ],
    materialUsed: material.name,
    engineeringInterpretation: `Peak bending moment is ${formatEngValue(maxM)} kN·m yielding a maximum extreme-fiber flexural stress of ${formatEngValue(maxFlexuralStressMPa)} MPa and maximum deflection of ${formatEngValue(maxDeflectionMm)} mm (Span/Deflection = L/${Math.round((spanLengthM * 1000) / Math.max(0.01, maxDeflectionMm))}).`,
    reference: 'Gere & Goodno, Mechanics of Materials, 9th Ed., Chapter 5 & 9',
  };

  return {
    supportType,
    spanLengthM,
    reactionA,
    reactionB,
    reactionMomentA,
    maxBendingMomentKNm: maxM,
    maxShearForceKN: maxV,
    maxDeflectionMm,
    maxFlexuralStressMPa,
    maxShearStressMPa,
    safetyFactor,
    status,
    sfdPoints,
    bmdPoints,
    deflectionPoints,
    trace,
  };
}

// 4. MOHR'S CIRCLE & PRINCIPAL STRESSES
export interface MohrCircleCalculationResult {
  sigmaX: number;
  sigmaY: number;
  tauXY: number;
  sigmaAvg: number;
  radius: number;
  sigma1: number;
  sigma2: number;
  tauMax: number;
  thetaP1Deg: number;
  thetaP2Deg: number;
  thetaS1Deg: number;
  vonMisesStress: number;
  trescaStress: number;
  rotatedSigmaX: number;
  rotatedSigmaY: number;
  rotatedTauXY: number;
  currentThetaDeg: number;
  safetyFactor: number;
  status: 'safe' | 'warning' | 'yield' | 'failure';
  trace: CalculationTrace;
}

export function calculateMohrCircle(
  sigmaX: number,
  sigmaY: number,
  tauXY: number,
  rotationThetaDeg: number,
  material: Material
): MohrCircleCalculationResult {
  const sigmaAvg = (sigmaX + sigmaY) / 2;
  const radius = Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2));

  const sigma1 = sigmaAvg + radius;
  const sigma2 = sigmaAvg - radius;
  const tauMax = radius;

  // Principal Angle (2*theta_p = atan2(2*tauXY, sigmaX - sigmaY))
  const twoThetaPRad = Math.atan2(2 * tauXY, sigmaX - sigmaY);
  const thetaP1Deg = (twoThetaPRad * 180) / Math.PI / 2;
  const thetaP2Deg = thetaP1Deg + 90;
  const thetaS1Deg = thetaP1Deg + 45;

  // Stresses on rotated element at angle theta
  const thetaRad = (rotationThetaDeg * Math.PI) / 180;
  const rotatedSigmaX = (sigmaX + sigmaY) / 2 + ((sigmaX - sigmaY) / 2) * Math.cos(2 * thetaRad) + tauXY * Math.sin(2 * thetaRad);
  const rotatedSigmaY = (sigmaX + sigmaY) / 2 - ((sigmaX - sigmaY) / 2) * Math.cos(2 * thetaRad) - tauXY * Math.sin(2 * thetaRad);
  const rotatedTauXY = -((sigmaX - sigmaY) / 2) * Math.sin(2 * thetaRad) + tauXY * Math.cos(2 * thetaRad);

  // Yield criteria (von Mises & Tresca for plane stress)
  const vonMisesStress = Math.sqrt(Math.pow(sigma1, 2) - sigma1 * sigma2 + Math.pow(sigma2, 2));
  const trescaStress = Math.max(Math.abs(sigma1 - sigma2), Math.abs(sigma1), Math.abs(sigma2));

  const allowableYield = material.yieldStrength;
  const safetyFactor = vonMisesStress > 0 ? allowableYield / vonMisesStress : 999;
  const utilizationRatio = vonMisesStress / allowableYield;

  let status: 'safe' | 'warning' | 'yield' | 'failure' = 'safe';
  if (utilizationRatio >= 1.0) status = 'yield';
  if (vonMisesStress >= material.ultimateStrength) status = 'failure';
  else if (utilizationRatio > 0.8) status = 'warning';

  const trace: CalculationTrace = {
    calcId: generateCalcId('MOHR'),
    topic: 'Stress Transformation & Mohr’s Circle',
    title: '2D Plane Stress Transformation & Principal Coordinates',
    timestamp: new Date().toISOString(),
    inputs: [
      { symbol: 'σ_x', name: 'Normal Stress X', value: sigmaX, unit: 'MPa' },
      { symbol: 'σ_y', name: 'Normal Stress Y', value: sigmaY, unit: 'MPa' },
      { symbol: 'τ_xy', name: 'Shear Stress XY', value: tauXY, unit: 'MPa' },
      { symbol: 'θ', name: 'Element Rotation', value: rotationThetaDeg, unit: '°' },
      { symbol: 'σ_y', name: 'Material Yield Strength', value: material.yieldStrength, unit: 'MPa' },
    ],
    formulaName: '2D Stress Transformation & Mohr Circle',
    formulaLatex: '\\sigma_{1,2} = \\frac{\\sigma_x + \\sigma_y}{2} \\pm \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}, \\quad R = \\tau_{\\max}',
    substitution: `\\sigma_{\\text{avg}} = \\frac{${sigmaX} + ${sigmaY}}{2} = ${formatEngValue(sigmaAvg)} \\text{ MPa}, \\quad R = \\sqrt{(${((sigmaX - sigmaY) / 2).toFixed(1)})^2 + (${tauXY})^2} = ${formatEngValue(radius)} \\text{ MPa}, \\quad \\sigma_1 = ${formatEngValue(sigma1)} \\text{ MPa}, \\quad \\sigma_2 = ${formatEngValue(sigma2)} \\text{ MPa}`,
    result: {
      symbol: 'σ_1, σ_2',
      value: sigma1,
      formatted: `σ₁ = ${formatEngValue(sigma1)} MPa, σ₂ = ${formatEngValue(sigma2)} MPa, τ_max = ${formatEngValue(tauMax)} MPa (von Mises = ${formatEngValue(vonMisesStress)} MPa)`,
      unit: 'MPa',
    },
    assumptions: [
      'Plane stress state (σ_z = τ_xz = τ_yz = 0)',
      'Infinitesimal element equilibrium under pure static balance',
      'Sign convention: Tension positive (+), counter-clockwise rotation positive',
    ],
    materialUsed: material.name,
    engineeringInterpretation: `Major principal stress is ${formatEngValue(sigma1)} MPa occurring at orientation θp₁ = ${thetaP1Deg.toFixed(1)}° where shear stress vanishes. Maximum in-plane shear stress is ${formatEngValue(tauMax)} MPa.`,
    reference: 'Beer & Johnston, Mechanics of Materials, 8th Ed., Chapter 7',
  };

  return {
    sigmaX,
    sigmaY,
    tauXY,
    sigmaAvg,
    radius,
    sigma1,
    sigma2,
    tauMax,
    thetaP1Deg,
    thetaP2Deg,
    thetaS1Deg,
    vonMisesStress,
    trescaStress,
    rotatedSigmaX,
    rotatedSigmaY,
    rotatedTauXY,
    currentThetaDeg: rotationThetaDeg,
    safetyFactor,
    status,
    trace,
  };
}

export interface ColumnCalculationResult {
  endCondition: ColumnEndCondition;
  kFactor: number;
  effectiveLengthFactorK: number;
  lengthM: number;
  appliedLoadKN: number;
  effectiveLengthM: number;
  slendernessRatio: number;
  radiusGyrationMm: number;
  criticalBucklingLoadKN: number;
  criticalLoadKN: number;
  criticalBucklingStressMPa: number;
  criticalStressMPa: number;
  bucklingSafetyFactor: number;
  safetyFactor: number;
  yieldSafetyFactor: number;
  governingMode: 'buckling' | 'yielding';
  governingFailureMode: 'buckling' | 'yielding';
  isBuckled: boolean;
  status: 'safe' | 'warning' | 'yield' | 'failure';
  modeShapePoints: { y: number; xDef: number }[]; // Mode shape deflection vs height
  trace: CalculationTrace;
}

export type BucklingCalculationResult = ColumnCalculationResult;

export function calculateColumnBuckling(
  arg1: ColumnEndCondition | { endCondition?: ColumnEndCondition; lengthM?: number; appliedLoadKN?: number; material: Material; section: SectionProperties },
  lengthMArg?: number,
  appliedLoadKNArg?: number,
  materialArg?: Material,
  sectionArg?: SectionProperties
): ColumnCalculationResult {
  let endCondition: ColumnEndCondition = 'pin_pin';
  let lengthM = 4;
  let appliedLoadKN = 50;
  let material: Material;
  let section: SectionProperties;

  if (typeof arg1 === 'object' && arg1 !== null && 'material' in arg1) {
    endCondition = arg1.endCondition || 'pin_pin';
    lengthM = arg1.lengthM ?? 4;
    appliedLoadKN = arg1.appliedLoadKN ?? 50;
    material = arg1.material;
    section = arg1.section;
  } else {
    endCondition = arg1 as ColumnEndCondition;
    lengthM = lengthMArg ?? 4;
    appliedLoadKN = appliedLoadKNArg ?? 50;
    material = materialArg!;
    section = sectionArg!;
  }
  let kFactor = 1.0;
  if (endCondition === 'fixed_fixed') kFactor = 0.5;
  else if (endCondition === 'fixed_free') kFactor = 2.0;
  else if (endCondition === 'fixed_pin') kFactor = 0.7;

  const L = Math.max(0.2, lengthM);
  const LeffM = kFactor * L;
  const LeffMm = LeffM * 1000;
  const minI = Math.min(section.Ix, section.Iy); // Buckling governs about weak axis
  const minR = Math.min(section.rx, section.ry);
  const slendernessRatio = LeffMm / Math.max(1, minR);

  const EMpa = material.E * 1000;
  // P_cr = (pi^2 * E * I) / (K * L)^2 in N
  const criticalLoadN = (Math.PI * Math.PI * EMpa * minI) / Math.pow(LeffMm, 2);
  const criticalBucklingLoadKN = criticalLoadN / 1000;
  const criticalBucklingStressMPa = criticalLoadN / Math.max(1, section.area);

  const appliedLoadN = Math.abs(appliedLoadKN) * 1000;
  const directStressMPa = appliedLoadN / Math.max(1, section.area);

  const bucklingSafetyFactor = appliedLoadKN > 0 ? criticalBucklingLoadKN / appliedLoadKN : 999;
  const yieldSafetyFactor = directStressMPa > 0 ? material.yieldStrength / directStressMPa : 999;

  const governingMode = criticalBucklingStressMPa < material.yieldStrength ? 'buckling' : 'yielding';
  const isBuckled = appliedLoadKN >= criticalBucklingLoadKN;

  let status: 'safe' | 'warning' | 'yield' | 'failure' = 'safe';
  if (isBuckled) status = 'failure';
  else if (bucklingSafetyFactor < 1.2 || yieldSafetyFactor < 1.2) status = 'yield';
  else if (bucklingSafetyFactor < 1.8) status = 'warning';

  // Mode shape deflection points (normalized -1 to 1)
  const numSteps = 50;
  const modeShapePoints: { y: number; xDef: number }[] = [];
  const amp = isBuckled ? 1.0 : Math.min(1.0, appliedLoadKN / Math.max(0.1, criticalBucklingLoadKN));

  for (let i = 0; i <= numSteps; i++) {
    const yNorm = i / numSteps; // 0 (bottom) to 1 (top)
    let def = 0;

    if (endCondition === 'pin_pin') {
      def = Math.sin(Math.PI * yNorm);
    } else if (endCondition === 'fixed_fixed') {
      def = (1 - Math.cos(2 * Math.PI * yNorm)) / 2;
    } else if (endCondition === 'fixed_free') {
      def = 1 - Math.cos((Math.PI / 2) * yNorm);
    } else {
      // Fixed-pin
      def = Math.sin(Math.PI * yNorm * 1.43) * (1 - yNorm * 0.3);
    }
    modeShapePoints.push({ y: yNorm * L, xDef: def * amp });
  }

  const trace: CalculationTrace = {
    calcId: generateCalcId('COLUMN'),
    topic: 'Columns & Euler Buckling',
    title: `Euler Critical Buckling (${endCondition.replace('_', '-').toUpperCase()})`,
    timestamp: new Date().toISOString(),
    inputs: [
      { symbol: 'L', name: 'Column Length', value: lengthM, unit: 'm' },
      { symbol: 'K', name: 'Effective Length Factor', value: kFactor, unit: 'factor' },
      { symbol: 'I_min', name: 'Weak-Axis Inertia', value: formatEngValue(minI), unit: 'mm⁴' },
      { symbol: 'r_min', name: 'Radius of Gyration', value: formatEngValue(minR), unit: 'mm' },
      { symbol: 'λ', name: 'Slenderness Ratio (KL/r)', value: formatEngValue(slendernessRatio), unit: '-' },
      { symbol: 'P_applied', name: 'Applied Compression', value: appliedLoadKN, unit: 'kN' },
    ],
    formulaName: 'Euler Buckling Formula',
    formulaLatex: 'P_{cr} = \\frac{\\pi^2 E I}{(K L)^2} = \\frac{\\pi^2 E A}{\\lambda^2}',
    substitution: `P_{cr} = \\frac{\\pi^2 (${EMpa} \\text{ MPa})(${formatEngValue(minI)} \\text{ mm}^4)}{(${formatEngValue(LeffMm)} \\text{ mm})^2} = ${formatEngValue(criticalBucklingLoadKN)} \\text{ kN}`,
    result: {
      symbol: 'P_cr',
      value: criticalBucklingLoadKN,
      formatted: `${formatEngValue(criticalBucklingLoadKN)} kN (Critical Stress = ${formatEngValue(criticalBucklingStressMPa)} MPa)`,
      unit: 'kN',
    },
    assumptions: [
      'Ideal column (initially straight with perfectly concentric axial load)',
      'Linear elastic material with slenderness λ above proportional limit threshold',
      'Small deflection bifurcation theory without initial imperfections',
    ],
    materialUsed: material.name,
    engineeringInterpretation: `Column slenderness ratio λ = ${formatEngValue(slendernessRatio)}. Euler critical buckling load is ${formatEngValue(criticalBucklingLoadKN)} kN. Failure mode is governed by ${governingMode.toUpperCase()} (Buckling SF = ${formatEngValue(bucklingSafetyFactor)}).`,
    reference: 'Hibbeler, Mechanics of Materials, 10th Ed., Chapter 13 (Buckling of Columns)',
  };

  return {
    endCondition,
    kFactor,
    effectiveLengthFactorK: kFactor,
    lengthM,
    appliedLoadKN,
    effectiveLengthM: LeffM,
    slendernessRatio,
    radiusGyrationMm: minR,
    criticalBucklingLoadKN,
    criticalLoadKN: criticalBucklingLoadKN,
    criticalBucklingStressMPa,
    criticalStressMPa: criticalBucklingStressMPa,
    bucklingSafetyFactor,
    safetyFactor: bucklingSafetyFactor,
    yieldSafetyFactor,
    governingMode,
    governingFailureMode: governingMode,
    isBuckled,
    status,
    modeShapePoints,
    trace,
  };
}

export const calculateBuckling = calculateColumnBuckling;

