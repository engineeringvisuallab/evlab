/**
 * EVLab Universal Mathematical Object Engine
 * Reusable interactive primitives: Point, Vector, Triangle, Circle, Line, Function, Matrix, etc.
 */

export interface MathStateValue {
  [key: string]: number | string | boolean | number[] | number[][];
}

export interface IMathObject<TState = MathStateValue> {
  id: string;
  name: string;
  type: string;
  state: TState;
  color?: string;
  isDraggable?: boolean;
  isSelected?: boolean;
  explanation: (state: TState) => string;
  latex: (state: TState) => string;
}

// 1. Number Line Point & Interval
export interface NumberLinePointState {
  value: number;
  label: string;
  fraction?: { num: number; den: number };
  isClosed: boolean;
}

export function createNumberLinePoint(id: string, value: number, label: string = "x"): IMathObject<NumberLinePointState> {
  return {
    id,
    name: `Number Line Point (${label})`,
    type: "number-line-point",
    state: { value, label, isClosed: true },
    color: "#38bdf8",
    isDraggable: true,
    explanation: (s) => `Point ${s.label} lies at coordinate ${s.value.toFixed(2)} on the real line ℝ.`,
    latex: (s) => `${s.label} = ${s.value.toFixed(2)}`,
  };
}

export interface IntervalState {
  min: number;
  max: number;
  minInclusive: boolean;
  maxInclusive: boolean;
}

export function createInterval(id: string, min: number, max: number, minInc: boolean = true, maxInc: boolean = false): IMathObject<IntervalState> {
  return {
    id,
    name: "Real Interval",
    type: "interval",
    state: { min, max, minInclusive: minInc, maxInclusive: maxInc },
    color: "rgba(56, 189, 248, 0.25)",
    explanation: (s) => `The set of all numbers x such that ${s.min} ${s.minInclusive ? "≤" : "<"} x ${s.maxInclusive ? "≤" : "<"} ${s.max}, of length ${(s.max - s.min).toFixed(2)}.`,
    latex: (s) => `x \\in ${s.minInclusive ? "[" : "("}${s.min.toFixed(1)}, ${s.max.toFixed(1)}${s.maxInclusive ? "]" : ")"}`,
  };
}

// 2. 2D Vector Primitive
export interface Vector2DState {
  x: number;
  y: number;
  originX: number;
  originY: number;
}

export function createVector2D(id: string, x: number, y: number, name: string = "v"): IMathObject<Vector2DState> {
  return {
    id,
    name: `Vector ${name}`,
    type: "vector-2d",
    state: { x, y, originX: 0, originY: 0 },
    color: "#60a5fa",
    isDraggable: true,
    explanation: (s) => {
      const mag = Math.hypot(s.x, s.y);
      const deg = (Math.atan2(s.y, s.x) * 180) / Math.PI;
      return `Vector ${name} has magnitude |${name}| = ${mag.toFixed(2)} and direction θ = ${deg >= 0 ? deg.toFixed(1) : (360 + deg).toFixed(1)}°.`;
    },
    latex: (s) => `\\mathbf{${name}} = \\begin{pmatrix} ${s.x.toFixed(2)} \\\\ ${s.y.toFixed(2)} \\end{pmatrix}`,
  };
}

// 3. Triangle Primitive with Angle & Area Calculation
export interface Triangle2DState {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
}

export function createTriangle2D(id: string, p1 = { x: 0, y: 0 }, p2 = { x: 4, y: 0 }, p3 = { x: 0, y: 3 }): IMathObject<Triangle2DState> {
  return {
    id,
    name: "Interactive Triangle",
    type: "triangle-2d",
    state: { p1, p2, p3 },
    color: "#34d399",
    isDraggable: true,
    explanation: (s) => {
      const a = Math.hypot(s.p3.x - s.p2.x, s.p3.y - s.p2.y);
      const b = Math.hypot(s.p1.x - s.p3.x, s.p1.y - s.p3.y);
      const c = Math.hypot(s.p2.x - s.p1.x, s.p2.y - s.p1.y);
      const sHalf = (a + b + c) / 2;
      const area = Math.sqrt(Math.max(0, sHalf * (sHalf - a) * (sHalf - b) * (sHalf - c)));
      return `Triangle with side lengths a = ${a.toFixed(2)}, b = ${b.toFixed(2)}, c = ${c.toFixed(2)}. Total Area = ${area.toFixed(2)} sq units. Angle Sum = 180°.`;
    },
    latex: (s) => {
      const area = 0.5 * Math.abs(s.p1.x * (s.p2.y - s.p3.y) + s.p2.x * (s.p3.y - s.p1.y) + s.p3.x * (s.p1.y - s.p2.y));
      return `\\text{Area}(\\triangle) = ${area.toFixed(2)}`;
    },
  };
}

// 4. Circle Primitive
export interface Circle2DState {
  cx: number;
  cy: number;
  radius: number;
  slicesCount?: number;
}

export function createCircle2D(id: string, radius: number = 3, cx: number = 0, cy: number = 0): IMathObject<Circle2DState> {
  return {
    id,
    name: "Circle Object",
    type: "circle-2d",
    state: { cx, cy, radius, slicesCount: 16 },
    color: "#f59e0b",
    isDraggable: true,
    explanation: (s) => {
      const area = Math.PI * s.radius * s.radius;
      const circum = 2 * Math.PI * s.radius;
      return `Circle with radius r = ${s.radius.toFixed(2)}. Circumference C = 2πr = ${circum.toFixed(2)}, Area A = πr² = ${area.toFixed(2)}.`;
    },
    latex: (s) => `A = \\pi r^2 = \\pi (${s.radius.toFixed(2)})^2 \\approx ${(Math.PI * s.radius * s.radius).toFixed(2)}`,
  };
}

// 5. Linear / Quadratic / General Curve Function
export interface FunctionCurveState {
  type: "linear" | "quadratic" | "cubic" | "sine" | "exponential" | "rational";
  a: number;
  b: number;
  c: number;
  d?: number;
}

export function evaluateFunctionState(s: FunctionCurveState, x: number): number {
  switch (s.type) {
    case "linear":
      return s.a * x + s.b;
    case "quadratic":
      return s.a * x * x + s.b * x + s.c;
    case "cubic":
      return s.a * x * x * x + s.b * x * x + s.c * x + (s.d ?? 0);
    case "sine":
      return s.a * Math.sin(s.b * x + s.c) + (s.d ?? 0);
    case "exponential":
      return s.a * Math.exp(s.b * x) + s.c;
    case "rational":
      const denom = s.c * x + (s.d ?? 1);
      return Math.abs(denom) < 1e-6 ? (denom >= 0 ? 1e4 : -1e4) : (s.a * x + s.b) / denom;
    default:
      return s.a * x * x + s.b * x + s.c;
  }
}

// 6. Tangent & Secant Line Primitives
export interface TangentLineState {
  x0: number;
  fnState: FunctionCurveState;
}

export function createTangentLine(id: string, x0: number, fnState: FunctionCurveState): IMathObject<TangentLineState> {
  return {
    id,
    name: "Tangent Line",
    type: "tangent-line",
    state: { x0, fnState },
    color: "#ec4899",
    explanation: (s) => {
      const h = 1e-5;
      const y0 = evaluateFunctionState(s.fnState, s.x0);
      const slope = (evaluateFunctionState(s.fnState, s.x0 + h) - evaluateFunctionState(s.fnState, s.x0 - h)) / (2 * h);
      return `Tangent at x₀ = ${s.x0.toFixed(2)} has slope m = f'(x₀) = ${slope.toFixed(2)}. Line passes through (${s.x0.toFixed(2)}, ${y0.toFixed(2)}).`;
    },
    latex: (s) => {
      const h = 1e-5;
      const y0 = evaluateFunctionState(s.fnState, s.x0);
      const slope = (evaluateFunctionState(s.fnState, s.x0 + h) - evaluateFunctionState(s.fnState, s.x0 - h)) / (2 * h);
      return `y - ${y0.toFixed(2)} = ${slope.toFixed(2)}(x - ${s.x0.toFixed(2)})`;
    },
  };
}

// 7. Matrix 2x2 Linear Transformation Primitive
export interface Matrix2x2State {
  a: number;
  b: number;
  c: number;
  d: number;
}

export function createMatrix2x2(id: string, a = 1, b = 0, c = 0, d = 1): IMathObject<Matrix2x2State> {
  return {
    id,
    name: "2D Transformation Matrix",
    type: "matrix-2x2",
    state: { a, b, c, d },
    color: "#a855f7",
    explanation: (s) => {
      const det = s.a * s.d - s.b * s.c;
      const trace = s.a + s.d;
      return `Matrix transforms basis vector î → (${s.a}, ${s.c}) and ĵ → (${s.b}, ${s.d}). Area scaling factor det(A) = ${det.toFixed(2)}, Trace = ${trace.toFixed(2)}.`;
    },
    latex: (s) => {
      const det = s.a * s.d - s.b * s.c;
      return `A = \\begin{pmatrix} ${s.a.toFixed(1)} & ${s.b.toFixed(1)} \\\\ ${s.c.toFixed(1)} & ${s.d.toFixed(1)} \\end{pmatrix}, \\quad \\det(A) = ${det.toFixed(2)}`;
    },
  };
}

// 8. Motion Kinematics Object (Physics to Math Bridge)
export interface MotionKinematicsState {
  time: number;
  initialPos: number;
  initialVelocity: number;
  acceleration: number;
  timeMax: number;
}

export function evaluateMotionState(s: MotionKinematicsState, t: number) {
  const position = s.initialPos + s.initialVelocity * t + 0.5 * s.acceleration * t * t;
  const velocity = s.initialVelocity + s.acceleration * t;
  const accel = s.acceleration;
  return { t, position, velocity, accel };
}
