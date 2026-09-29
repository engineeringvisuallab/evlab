/**
 * EVLab Universal Mathematical Calculation & Simulation Engine
 * Rigorous algorithms for secondary school, college, BSc, and advanced engineering math.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Fraction {
  numerator: number;
  denominator: number;
}

export const MathEngine = {
  // --- 1. NUMBER SYSTEMS, ARITHMETIC & FRACTIONS ---
  gcd(a: number, b: number): number {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  },

  lcm(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return Math.abs(Math.round(a * b)) / this.gcd(a, b);
  },

  simplifyFraction(num: number, den: number): Fraction {
    if (den === 0) return { numerator: num, denominator: 0 };
    const g = this.gcd(num, den);
    const sign = den < 0 ? -1 : 1;
    return {
      numerator: (num / g) * sign,
      denominator: (Math.abs(den) / g),
    };
  },

  addFractions(f1: Fraction, f2: Fraction): Fraction {
    const num = f1.numerator * f2.denominator + f2.numerator * f1.denominator;
    const den = f1.denominator * f2.denominator;
    return this.simplifyFraction(num, den);
  },

  // --- 2. ALGEBRA & POLYNOMIALS ---
  solveQuadratic(a: number, b: number, c: number): {
    discriminant: number;
    hasRealRoots: boolean;
    root1: { re: number; im: number };
    root2: { re: number; im: number };
    vertex: Point2D;
    factorizationLatex: string;
  } {
    if (Math.abs(a) < 1e-9) {
      // Linear bx + c = 0
      const r = Math.abs(b) > 1e-9 ? -c / b : 0;
      return {
        discriminant: 0,
        hasRealRoots: true,
        root1: { re: r, im: 0 },
        root2: { re: r, im: 0 },
        vertex: { x: r, y: 0 },
        factorizationLatex: `${b.toFixed(1)}(x - ${(r).toFixed(2)})`,
      };
    }

    const d = b * b - 4 * a * c;
    const vx = -b / (2 * a);
    const vy = c - (b * b) / (4 * a);

    if (d >= 0) {
      const sqrtD = Math.sqrt(d);
      const r1 = (-b + sqrtD) / (2 * a);
      const r2 = (-b - sqrtD) / (2 * a);
      return {
        discriminant: d,
        hasRealRoots: true,
        root1: { re: r1, im: 0 },
        root2: { re: r2, im: 0 },
        vertex: { x: vx, y: vy },
        factorizationLatex: a === 1 ? `(x - ${r1.toFixed(2)})(x - ${r2.toFixed(2)})` : `${a}(x - ${r1.toFixed(2)})(x - ${r2.toFixed(2)})`,
      };
    } else {
      const im = Math.sqrt(-d) / (2 * Math.abs(a));
      return {
        discriminant: d,
        hasRealRoots: false,
        root1: { re: vx, im },
        root2: { re: vx, im: -im },
        vertex: { x: vx, y: vy },
        factorizationLatex: `${a.toFixed(1)}((x - ${vx.toFixed(2)})^2 + ${im.toFixed(2)}^2)`,
      };
    }
  },

  // Geometric Area Model for (x + a)(x + b)
  computeAreaModel(a: number, b: number) {
    const xSquaredCoeff = 1;
    const xCoeff = a + b;
    const constTerm = a * b;
    return {
      a,
      b,
      xSquaredCoeff,
      xCoeff,
      constTerm,
      expandedLatex: `x^2 + ${xCoeff >= 0 ? "+" : ""}${xCoeff}x + ${constTerm >= 0 ? "+" : ""}${constTerm}`,
      factoredLatex: `(x ${a >= 0 ? "+" : ""}${a})(x ${b >= 0 ? "+" : ""}${b})`,
      areas: {
        xSquare: "x^2",
        axRect: `${a}x`,
        bxRect: `${b}x`,
        abConst: `${constTerm}`,
      }
    };
  },

  // --- 3. CALCULUS: DIFFERENTIATION & LIMITS ---
  evalFunction(fnType: string, x: number, params: Record<string, number> = {}): number {
    const a = params.a ?? 1;
    const b = params.b ?? 0;
    const c = params.c ?? 0;
    const n = params.n ?? 2;

    switch (fnType) {
      case "polynomial": // a*x^n + b*x + c
        return a * Math.pow(x, n) + b * x + c;
      case "sine": // a*sin(b*x + c)
        return a * Math.sin(b * x + c);
      case "cosine": // a*cos(b*x + c)
        return a * Math.cos(b * x + c);
      case "exponential": // a*exp(b*x)
        return a * Math.exp(Math.min(Math.max(b * x, -20), 20));
      case "rational": // a / (x^2 + b)
        return a / (x * x + (b === 0 ? 0.1 : b));
      case "cubic": // a*x^3 + b*x^2 + c*x
        return a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x;
      case "gaussian": // a*exp(-(x-b)^2 / (2*c^2))
        return a * Math.exp(-Math.pow(x - b, 2) / (2 * Math.max(c * c, 0.1)));
      default:
        return a * x * x + b * x + c;
    }
  },

  numericalDerivative(
    fnType: string,
    x: number,
    params: Record<string, number> = {},
    h: number = 0.0001
  ): number {
    const yPlus = this.evalFunction(fnType, x + h, params);
    const yMinus = this.evalFunction(fnType, x - h, params);
    return (yPlus - yMinus) / (2 * h);
  },

  numericalSecondDerivative(
    fnType: string,
    x: number,
    params: Record<string, number> = {},
    h: number = 0.001
  ): number {
    const yPlus = this.evalFunction(fnType, x + h, params);
    const yZero = this.evalFunction(fnType, x, params);
    const yMinus = this.evalFunction(fnType, x - h, params);
    return (yPlus - 2 * yZero + yMinus) / (h * h);
  },

  // Difference quotient table for Secant -> Tangent discovery
  computeDifferenceQuotientSteps(fnType: string, x0: number, params: Record<string, number> = {}) {
    const hValues = [1.0, 0.5, 0.1, 0.01, 0.001, 0.0001];
    const y0 = this.evalFunction(fnType, x0, params);
    return hValues.map((h) => {
      const yh = this.evalFunction(fnType, x0 + h, params);
      const dy = yh - y0;
      const slope = dy / h;
      return { h, x2: x0 + h, y2: yh, dy, slope };
    });
  },

  // --- 4. CALCULUS: INTEGRATION ---
  computeRiemannSum(
    fnType: string,
    a: number,
    b: number,
    n: number,
    method: "left" | "right" | "midpoint" | "trapezoid",
    params: Record<string, number> = {}
  ): { totalArea: number; rectangles: { x: number; width: number; height: number; area: number }[] } {
    const numRectangles = Math.max(1, Math.min(n, 200));
    const dx = (b - a) / numRectangles;
    const rectangles = [];
    let totalArea = 0;

    for (let i = 0; i < numRectangles; i++) {
      const xLeft = a + i * dx;
      const xRight = xLeft + dx;
      let sampleX = xLeft;

      if (method === "right") sampleX = xRight;
      else if (method === "midpoint") sampleX = xLeft + dx / 2;

      let height = this.evalFunction(fnType, sampleX, params);
      if (method === "trapezoid") {
        const yL = this.evalFunction(fnType, xLeft, params);
        const yR = this.evalFunction(fnType, xRight, params);
        height = (yL + yR) / 2;
      }

      const area = height * dx;
      totalArea += area;
      rectangles.push({ x: xLeft, width: dx, height, area });
    }

    return { totalArea, rectangles };
  },

  simpsonRule(
    fnType: string,
    a: number,
    b: number,
    n: number = 100,
    params: Record<string, number> = {}
  ): number {
    const intervals = n % 2 === 0 ? n : n + 1;
    const dx = (b - a) / intervals;
    let sum = this.evalFunction(fnType, a, params) + this.evalFunction(fnType, b, params);

    for (let i = 1; i < intervals; i++) {
      const x = a + i * dx;
      const weight = i % 2 === 0 ? 2 : 4;
      sum += weight * this.evalFunction(fnType, x, params);
    }
    return (dx / 3) * sum;
  },

  // --- 5. GEOMETRY & CIRCLE DISCOVERY ---
  generateCircleWedges(radius: number, sliceCount: number) {
    const wedges = [];
    const angleStep = (2 * Math.PI) / sliceCount;
    for (let i = 0; i < sliceCount; i++) {
      const startAngle = i * angleStep;
      const endAngle = startAngle + angleStep;
      wedges.push({
        index: i,
        startAngle,
        endAngle,
        isFlipped: i % 2 === 1,
      });
    }
    return {
      radius,
      sliceCount,
      wedgeWidth: (2 * Math.PI * radius) / sliceCount,
      exactArea: Math.PI * radius * radius,
      wedges,
    };
  },

  computeTriangleProperties(p1: Point2D, p2: Point2D, p3: Point2D) {
    const a = Math.hypot(p3.x - p2.x, p3.y - p2.y);
    const b = Math.hypot(p1.x - p3.x, p1.y - p3.y);
    const c = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    const s = (a + b + c) / 2;
    const area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));

    // Angles using law of cosines (in degrees)
    const angleA = (Math.acos(Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c || 1)))) * 180) / Math.PI;
    const angleB = (Math.acos(Math.max(-1, Math.min(1, (a * a + c * c - b * b) / (2 * a * c || 1)))) * 180) / Math.PI;
    const angleC = 180 - angleA - angleB;

    return {
      sideA: a,
      sideB: b,
      sideC: c,
      angleA,
      angleB,
      angleC,
      perimeter: a + b + c,
      area,
      isRightTriangle: Math.abs(angleA - 90) < 0.5 || Math.abs(angleB - 90) < 0.5 || Math.abs(angleC - 90) < 0.5,
    };
  },

  // --- 6. SEQUENCES & SERIES ---
  computeArithmeticSequence(a1: number, d: number, n: number) {
    const terms: number[] = [];
    const partialSums: number[] = [];
    let sum = 0;
    for (let i = 1; i <= n; i++) {
      const an = a1 + (i - 1) * d;
      terms.push(an);
      sum += an;
      partialSums.push(sum);
    }
    const nthFormula = `a_n = ${a1} + (n-1)(${d})`;
    const sumFormula = `S_n = \\frac{n}{2}(2(${a1}) + (n-1)(${d}))`;
    return { terms, partialSums, nthTerm: terms[terms.length - 1], totalSum: sum, nthFormula, sumFormula };
  },

  computeGeometricSequence(a1: number, r: number, n: number) {
    const terms: number[] = [];
    const partialSums: number[] = [];
    let sum = 0;
    for (let i = 1; i <= n; i++) {
      const an = a1 * Math.pow(r, i - 1);
      terms.push(an);
      sum += an;
      partialSums.push(sum);
    }
    const converges = Math.abs(r) < 1;
    const infiniteSum = converges ? a1 / (1 - r) : Infinity;
    return { terms, partialSums, nthTerm: terms[terms.length - 1], totalSum: sum, converges, infiniteSum };
  },

  // --- 7. MOTION & KINEMATICS ---
  computeKinematicsProfile(s0: number, v0: number, a: number, tMax: number = 10, steps: number = 50) {
    const dt = tMax / steps;
    const data = [];
    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const s = s0 + v0 * t + 0.5 * a * t * t;
      const v = v0 + a * t;
      const kineticEnergy = 0.5 * 1500 * v * v; // EV car 1500 kg
      data.push({ t, s, v, a, kineticEnergy });
    }
    return data;
  },

  // --- 8. LINEAR ALGEBRA & MATRICES ---
  matrix2x2Determinant(a: number, b: number, c: number, d: number): number {
    return a * d - b * c;
  },

  matrix2x2Eigenvalues(
    a: number,
    b: number,
    c: number,
    d: number
  ): {
    trace: number;
    determinant: number;
    lambda1: { re: number; im: number };
    lambda2: { re: number; im: number };
    isReal: boolean;
  } {
    const trace = a + d;
    const det = a * d - b * c;
    const discriminant = trace * trace - 4 * det;

    if (discriminant >= 0) {
      const sqrtD = Math.sqrt(discriminant);
      return {
        trace,
        determinant: det,
        lambda1: { re: (trace + sqrtD) / 2, im: 0 },
        lambda2: { re: (trace - sqrtD) / 2, im: 0 },
        isReal: true,
      };
    } else {
      const im = Math.sqrt(-discriminant) / 2;
      return {
        trace,
        determinant: det,
        lambda1: { re: trace / 2, im },
        lambda2: { re: trace / 2, im: -im },
        isReal: false,
      };
    }
  },

  // --- 9. VECTORS & 3D GEOMETRY ---
  vectorMagnitude2D(u: Point2D): number {
    return Math.hypot(u.x, u.y);
  },

  vectorDotProduct(u: Point2D, v: Point2D): number {
    return u.x * v.x + u.y * v.y;
  },

  vectorDotProduct2D(u: Point2D, v: Point2D): number {
    return u.x * v.x + u.y * v.y;
  },

  vectorCrossProduct2D(u: Point2D, v: Point2D): number {
    return u.x * v.y - u.y * v.x;
  },

  vectorAngle(u: Point2D, v: Point2D): number {
    const dot = this.vectorDotProduct(u, v);
    const magU = Math.hypot(u.x, u.y);
    const magV = Math.hypot(v.x, v.y);
    if (magU === 0 || magV === 0) return 0;
    const cosTheta = Math.max(-1, Math.min(1, dot / (magU * magV)));
    return (Math.acos(cosTheta) * 180) / Math.PI;
  },

  vectorAngle2D(u: Point2D, v: Point2D): number {
    return this.vectorAngle(u, v);
  },

  vectorProjection(u: Point2D, onV: Point2D): Point2D {
    const magVSq = onV.x * onV.x + onV.y * onV.y;
    if (magVSq === 0) return { x: 0, y: 0 };
    const scalar = this.vectorDotProduct(u, onV) / magVSq;
    return { x: scalar * onV.x, y: scalar * onV.y };
  },

  // --- 10. DIFFERENTIAL EQUATIONS: RUNGE-KUTTA (RK4) ---
  solveODE_RK4(
    fn: (x: number, y: number) => number,
    x0: number,
    y0: number,
    xEnd: number,
    steps: number = 100
  ): Point2D[] {
    const points: Point2D[] = [{ x: x0, y: y0 }];
    const h = (xEnd - x0) / steps;
    let x = x0;
    let y = y0;

    for (let i = 0; i < steps; i++) {
      const k1 = fn(x, y);
      const k2 = fn(x + h / 2, y + (h / 2) * k1);
      const k3 = fn(x + h / 2, y + (h / 2) * k2);
      const k4 = fn(x + h, y + h * k3);

      y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
      x += h;
      points.push({ x, y });
    }
    return points;
  },

  // --- 11. FOURIER SERIES & HARMONICS ---
  computeFourierWaveform(
    waveformType: "square" | "sawtooth" | "triangle",
    harmonics: number,
    t: number,
    fundamentalFreq: number = 1
  ): {
    totalValue: number;
    components: { n: number; amplitude: number; frequency: number; value: number }[];
  } {
    const components = [];
    let total = 0;

    for (let k = 1; k <= harmonics; k++) {
      let n = k;
      let amp = 0;

      if (waveformType === "square") {
        n = 2 * k - 1; // odd harmonics: 1, 3, 5, 7
        amp = 4 / (Math.PI * n);
      } else if (waveformType === "sawtooth") {
        n = k; // all harmonics: 1, 2, 3, 4
        amp = (2 / (Math.PI * n)) * (k % 2 === 0 ? -1 : 1);
      } else if (waveformType === "triangle") {
        n = 2 * k - 1;
        amp = (8 / (Math.PI * Math.PI * n * n)) * (k % 2 === 0 ? -1 : 1);
      }

      const val = amp * Math.sin(2 * Math.PI * n * fundamentalFreq * t);
      total += val;
      components.push({ n, amplitude: Math.abs(amp), frequency: n * fundamentalFreq, value: val });
    }

    return { totalValue: total, components };
  },

  // --- 12. PROBABILITY & STATISTICS ---
  generateNormalSamples(mean: number, stdDev: number, count: number): number[] {
    const samples: number[] = [];
    for (let i = 0; i < count; i += 2) {
      const u1 = Math.max(1e-7, Math.random());
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
      samples.push(mean + z0 * stdDev);
      if (samples.length < count) {
        samples.push(mean + z1 * stdDev);
      }
    }
    return samples;
  },

  computeBasicStats(data: number[]) {
    return this.calculateStatistics(data);
  },

  calculateStatistics(data: number[]): {
    mean: number;
    median: number;
    variance: number;
    stdDev: number;
    min: number;
    max: number;
    q1: number;
    q3: number;
    iqr: number;
  } {
    if (data.length === 0) {
      return { mean: 0, median: 0, variance: 0, stdDev: 0, min: 0, max: 0, q1: 0, q3: 0, iqr: 0 };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / Math.max(1, n - 1);
    const stdDev = Math.sqrt(variance);

    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];

    return {
      mean,
      median,
      variance,
      stdDev,
      min: sorted[0],
      max: sorted[n - 1],
      q1,
      q3,
      iqr: q3 - q1,
    };
  },

  // Linear Regression (y = mx + b)
  computeLinearRegression(points: Point2D[]): {
    slope: number;
    intercept: number;
    r: number;
    rSquared: number;
  } {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0, r: 0, rSquared: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
      sumY2 += p.y * p.y;
    }

    const numerator = n * sumXY - sumX * sumY;
    const denomX = n * sumX2 - sumX * sumX;
    const denomY = n * sumY2 - sumY * sumY;

    if (denomX === 0) return { slope: 0, intercept: sumY / n, r: 0, rSquared: 0 };

    const slope = numerator / denomX;
    const intercept = (sumY - slope * sumX) / n;
    const r = denomX * denomY > 0 ? numerator / Math.sqrt(denomX * denomY) : 0;

    return {
      slope,
      intercept,
      r,
      rSquared: r * r,
    };
  },

  normalPDF(x: number, mean: number, stdDev: number): number {
    const factor = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(x - mean, 2) / (2 * stdDev * stdDev);
    return factor * Math.exp(exponent);
  }
};
