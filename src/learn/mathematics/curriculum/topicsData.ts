import { TopicDefinition } from "../types/math";

export const CURRICULUM_TOPICS: TopicDefinition[] = [
  // 1. DIFFERENTIATION LAB
  {
    id: "calculus-derivative",
    title: "Differentiation & Tangent Slope Lab",
    category: "Differential Calculus",
    levelBadge: "School → Engineering",
    iconName: "TrendingUp",
    summary: "Explore the derivative as instantaneous rate of change, tangent line slope, and visualize synchronized f(x), f'(x), and f''(x) curves.",
    bilingual: {
      englishTerm: "Derivative (Rate of Change)",
      banglaTerm: "অন্তরজ বা ব্যবকলন (পরিবর্তনের তাৎক্ষণিক হার)",
      banglaIntuition: "কোনো বিন্দুতে স্পর্শকের ঢাল বা যে মুহূর্তে গাড়ি চলছে সেই মুহূর্তের নিখুঁত স্পিডোমিটারের বেগ।"
    },
    storyMode: {
      hookQuestion: "How does a sports car speedometer know your exact speed at a single millisecond without waiting an entire hour?",
      scenario: "Average speed requires dividing a long distance by time. But if a police radar gun clocks you, it measures your instantaneous speed in an infinitesimal split-second: Δt → 0.",
      mathematicalBridge: "This is precisely Newton and Leibniz's difference quotient: the secant line shrinking until it touches the curve as a tangent line."
    },
    learn: {
      definition: "The derivative of a function y = f(x) at point x measures the instantaneous rate of change of y with respect to x, defined formally as the limit of the difference quotient.",
      intuition: "Think of a car trip: your speedometer does not measure your average speed over the entire hour, but your instantaneous speed at that exact second. Geometrically, the derivative is the exact slope of the tangent line touching the curve at that single point.",
      keyFormulas: [
        { label: "Limit Definition of Derivative", formula: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}", explanation: "The difference quotient limit as the secant interval h shrinks to zero." },
        { label: "Tangent Line Equation", formula: "y - f(x_0) = f'(x_0)(x - x_0)", explanation: "Point-slope formula using the curve coordinate and derivative slope." },
        { label: "Power Rule", formula: "\\frac{d}{dx}[a x^n] = a n x^{n-1}", explanation: "Fundamental algebraic derivative formula." },
        { label: "Normal Line Equation", formula: "y - f(x_0) = -\\frac{1}{f'(x_0)}(x - x_0)", explanation: "Line perpendicular to the tangent at the point of tangency (m_1 \\cdot m_2 = -1)." }
      ],
      notationExplanation: "Leibniz notation (dy/dx) emphasizes infinitesimal ratios; Lagrange notation (f'(x)) emphasizes function transformation; Newton dot notation (ẋ) is widely used in mechanical vibration for time derivatives.",
      assumptions: ["The function must be continuous and smooth (no sharp corners, cusps, or vertical asymptotes at x0)."],
      levelSpecificNotes: {
        "School (Class 9-10 / SSC)": "Focus on slope as rise/run and rate of change (speed = distance/time).",
        "Higher Secondary (HSC / College)": "Learn derivative formulas, product/quotient rules, tangent/normal lines, and finding local extrema where f'(x)=0.",
        "Diploma / Polytechnic": "Apply derivatives to electrical current i = dq/dt and velocity v = ds/dt.",
        "University BSc": "Epsilon-delta definitions, differentiability theorems, Rolle's and Mean Value Theorem.",
        "Advanced Engineering": "Total differentials, Jacobians, gradient descent optimization, and strain rate tensors."
      }
    },
    visualizationType: "calculus-derivative",
    defaultVariables: {
      x0: 1.5,
      a: 1.0,
      b: -2.0,
      c: 1.0,
      fnMode: 0,
      showNormal: 1,
      showSecondDeriv: 1
    },
    variableControls: [
      { id: "x0", name: "Evaluation Point", symbol: "x₀", min: -4.0, max: 4.0, step: 0.05, defaultValue: 1.5, description: "Draggable coordinate where tangent line and slope are computed." },
      { id: "a", name: "Curve Amplitude / Lead Coeff", symbol: "a", min: -3.0, max: 3.0, step: 0.1, defaultValue: 1.0, description: "Controls vertical scaling and curvature." },
      { id: "b", name: "Linear Parameter / Shift", symbol: "b", min: -5.0, max: 5.0, step: 0.1, defaultValue: -2.0, description: "Linear term shifting vertex/extrema." },
      { id: "c", name: "Vertical Offset", symbol: "c", min: -5.0, max: 5.0, step: 0.2, defaultValue: 1.0, description: "Constant vertical displacement." }
    ],
    presets: [
      { id: "p1", name: "Parabola Vertex & Roots", description: "f(x) = x² - 2x + 1 (Minimum at x = 1)", variables: { x0: 1.0, a: 1.0, b: -2.0, c: 1.0, fnMode: 0 } },
      { id: "p2", name: "Cubic Inflection Point", description: "f(x) = x³ - 3x (Local max at x=-1, min at x=1)", variables: { x0: 0.0, a: 1.0, b: -3.0, c: 0.0, fnMode: 1 } },
      { id: "p3", name: "Harmonic Sine Wave", description: "f(x) = 2 sin(x) (Derivative phase shift)", variables: { x0: 0.0, a: 2.0, b: 1.0, c: 0.0, fnMode: 2 } }
    ],
    calculate: {
      symbolicSteps: [
        { step: 1, title: "Given Function", latex: "f(x) = a x^2 + b x + c", explanation: "Identify function definition and given constants." },
        { step: 2, title: "Apply Power Rule", latex: "f'(x) = 2a x + b", explanation: "Differentiate each term with respect to x." },
        { step: 3, title: "Evaluate Slope at x0", latex: "m = f'(x_0) = 2a(x_0) + b", explanation: "Substitute the current point x0 into the derivative equation." },
        { step: 4, title: "Calculate Tangent Equation", latex: "y - y_0 = m (x - x_0)", explanation: "Form the linear equation passing through (x0, f(x0)) with slope m." }
      ],
      exactResultFormula: "f'(x) = 2ax + b"
    },
    understand: {
      dynamicExplanationFn: (vars) => {
        const x0 = vars.x0 ?? 1.5;
        const a = vars.a ?? 1;
        const b = vars.b ?? -2;
        const slope = 2 * a * x0 + b;
        if (Math.abs(slope) < 0.05) {
          return `At x₀ = ${x0.toFixed(2)}, the tangent line is completely HORIZONTAL (slope ≈ 0). This signifies a critical point (local minimum, maximum, or stationary point).`;
        } else if (slope > 0) {
          return `At x₀ = ${x0.toFixed(2)}, the tangent line tilts UPWARD with positive slope m = ${slope.toFixed(2)}. As x increases, f(x) is strictly INCREASING here.`;
        } else {
          return `At x₀ = ${x0.toFixed(2)}, the tangent line tilts DOWNWARD with negative slope m = ${slope.toFixed(2)}. As x increases, f(x) is strictly DECREASING here.`;
        }
      },
      commonMistakes: [
        { mistake: "Confusing f(x) value with f'(x) slope", correction: "A high point on a curve does not mean high slope. At the very peak of a mountain, height is high but slope is 0.", why: "Height is position; slope is rate of change." }
      ],
      whatIfScenarios: [
        { action: "Set x0 to the exact vertex of a parabola", result: "The slope becomes zero, and the tangent line becomes completely horizontal." }
      ]
    },
    apply: [
      { domain: "Physics & Kinematics", title: "Velocity & Acceleration from Position", description: "Position s(t) → Velocity v(t) = s'(t) → Acceleration a(t) = s''(t).", realWorldExample: "Rocket launch telemetry computing instant acceleration.", engineeringFormula: "a(t) = \\frac{d^2 s}{dt^2} = \\frac{dv}{dt}" }
    ],
    derivation: {
      id: "deriv-power-rule",
      formulaTitle: "Derivation of the Derivative for f(x) = x²",
      finalLatex: "\\frac{d}{dx}[x^2] = 2x",
      summary: "Using the formal definition of limit of difference quotient.",
      steps: [
        { stepIndex: 1, stepTitle: "Set up the difference quotient", latex: "\\frac{f(x+h) - f(x)}{h} = \\frac{(x+h)^2 - x^2}{h}", geometricIntuition: "Slope of the secant line between (x, f(x)) and (x+h, f(x+h))." },
        { stepIndex: 2, stepTitle: "Expand the binomial (x+h)²", latex: "= \\frac{x^2 + 2xh + h^2 - x^2}{h} = \\frac{2xh + h^2}{h}", geometricIntuition: "Cancel out the base area x²." },
        { stepIndex: 3, stepTitle: "Divide out the increment h", latex: "= 2x + h \\quad (h \\neq 0)", geometricIntuition: "The secant line slope as a function of interval width h." },
        { stepIndex: 4, stepTitle: "Take the limit as h → 0", latex: "\\lim_{h \\to 0} (2x + h) = 2x", geometricIntuition: "The secant line snaps into the exact tangent line." }
      ]
    },
    challenges: [
      {
        id: "c1",
        title: "Find the Local Minimum",
        question: "For f(x) = x² - 2x + 1, adjust x₀ so the tangent slope f'(x₀) is exactly 0.00.",
        targetCondition: "f'(x₀) = 0",
        hint: "Derivative is 2x - 2. Solve 2x - 2 = 0.",
        initialVariables: { x0: 3.0, a: 1.0, b: -2.0, c: 1.0, fnMode: 0 },
        validator: (vars) => Math.abs((2 * vars.a * vars.x0 + vars.b)) < 0.05,
        successMessage: "Outstanding! You identified the vertex at x₀ = 1.00 where the instantaneous rate of change is zero."
      }
    ]
  },

  // 2. NUMBER LINE & INEQUALITIES LAB
  {
    id: "number-line",
    title: "Number Line, Fractions & Inequalities Lab",
    category: "Number Systems & Arithmetic",
    levelBadge: "School (Class 9-10)",
    iconName: "MoveHorizontal",
    summary: "Interact with the continuous real line ℝ, fractions, coordinate distance |x₂ - x₁|, midpoint, and interval inequalities [a, b].",
    bilingual: {
      englishTerm: "Real Number Line & Intervals",
      banglaTerm: "বাস্তব সংখ্যারেখা ও ব্যবধি",
      banglaIntuition: "সংখ্যারেখার প্রতিটি বিন্দু একটি নির্দিষ্ট বাস্তব সংখ্যা নির্দেশ করে।"
    },
    storyMode: {
      hookQuestion: "Why did ancient mathematicians struggle before negative numbers and decimals were mapped onto a continuous line?",
      scenario: "Before Descartes connected geometry to numbers with coordinate axes, algebra and geometry were completely separate. The real line ℝ unified every rational and irrational number as a point of length.",
      mathematicalBridge: "Every real number x corresponds to a continuous position on the 1D metric space."
    },
    visualizationType: "number-line",
    defaultVariables: {
      x1: 2.5,
      x2: -3.0,
      centerC: 1.0,
      deltaD: 2.5,
      lowerBound: -2.0,
      upperBound: 4.0
    },
    variableControls: [
      { id: "x1", name: "Point x₁", symbol: "x₁", min: -7.0, max: 7.0, step: 0.1, defaultValue: 2.5, description: "Primary movable point on the real line." },
      { id: "x2", name: "Point x₂", symbol: "x₂", min: -7.0, max: 7.0, step: 0.1, defaultValue: -3.0, description: "Secondary movable point." },
      { id: "centerC", name: "Interval Center c", symbol: "c", min: -5.0, max: 5.0, step: 0.5, defaultValue: 1.0, description: "Center of absolute value interval |x-c| ≤ d." }
    ],
    presets: [
      { id: "p1", name: "Symmetric Distance", description: "x₁ = 3, x₂ = -3 (Distance = 6)", variables: { x1: 3.0, x2: -3.0, centerC: 0.0, deltaD: 3.0, lowerBound: -3.0, upperBound: 3.0 } }
    ],
    calculate: {
      symbolicSteps: [
        { step: 1, title: "Distance Formula", latex: "d(x_1, x_2) = |x_2 - x_1|", explanation: "Absolute value difference guarantees non-negative geometric distance." },
        { step: 2, title: "Midpoint Formula", latex: "M = \\frac{x_1 + x_2}{2}", explanation: "Arithmetic average of the boundary coordinates." }
      ]
    },
    understand: {
      dynamicExplanationFn: (vars) => {
        const x1 = vars.x1 ?? 2.5;
        const x2 = vars.x2 ?? -3.0;
        const dist = Math.abs(x1 - x2);
        return `Points x₁ = ${x1.toFixed(1)} and x₂ = ${x2.toFixed(1)} are separated by distance d = ${dist.toFixed(2)} units. Midpoint is at ${((x1 + x2) / 2).toFixed(2)}.`;
      },
      commonMistakes: [
        { mistake: "Believing distance can be negative", correction: "Distance is always non-negative: d = |x_2 - x_1| ≥ 0.", why: "Metric definition." }
      ],
      whatIfScenarios: [
        { action: "Swap positions of x1 and x2", result: "The geometric distance remains identical due to symmetry |a - b| = |b - a|." }
      ]
    },
    apply: [
      { domain: "Instrumentation & Metrology", title: "Sensor Tolerance Bands", description: "Sensor errors expressed as |x - x_true| ≤ tolerance.", realWorldExample: "Temperature sensor calibrated to 25°C ± 0.5°C.", engineeringFormula: "|T - T_0| \\le \\delta" }
    ],
    challenges: [
      {
        id: "c_num1",
        title: "Set Distance to Exactly 5.0",
        question: "Adjust point x₁ so that the distance |x₁ - x₂| is exactly 5.0 units when x₂ = -2.0.",
        targetCondition: "|x₁ - (-2.0)| = 5.0",
        hint: "x₁ must be at +3.0 or -7.0.",
        initialVariables: { x1: 0.0, x2: -2.0, centerC: 0.0, deltaD: 2.0, lowerBound: -2.0, upperBound: 2.0 },
        validator: (vars) => Math.abs(Math.abs(vars.x1 - (-2.0)) - 5.0) < 0.1,
        successMessage: "Correct! |3 - (-2)| = 5.0 units."
      }
    ]
  },

  // 3. GEOMETRIC AREA MODEL & ALGEBRA BALANCE LAB
  {
    id: "algebra-balance",
    title: "Geometric Area Model & Algebra Balance Lab",
    category: "Algebra & Equations",
    levelBadge: "School (Class 9-10)",
    iconName: "Scale",
    summary: "Prove binomial expansion (x+a)(x+b) = x² + (a+b)x + ab with geometric rectangles, balance equations on physical scales, and solve simultaneous systems.",
    bilingual: {
      englishTerm: "Binomial Area Model & Linear Balance",
      banglaTerm: "বীজগণিতীয় জ্যামিতিক ক্ষেত্রফল মডেল ও দাঁড়িপাল্লা",
      banglaIntuition: "বীজগণিতের সূত্র মুখস্থ নয়, জ্যামিতিক ক্ষেত্রফলের টুকরো যোগ করে সরাসরি বোঝা যায়।"
    },
    storyMode: {
      hookQuestion: "Why did Babylonian and Greek mathematicians do algebra by drawing geometric fields and squares?",
      scenario: "Before algebraic symbols were invented, $(x+a)^2$ literally meant the total physical surface area of a large square land parcel partitioned into smaller sub-plots.",
      mathematicalBridge: "Multiplying two binomials is mathematically identical to calculating the length times width of a partitioned rectangle."
    },
    visualizationType: "algebra-area-model",
    defaultVariables: {
      a: 3,
      b: 2,
      xVal: 4,
      m1: 1.5,
      c1: 1.0,
      m2: -0.5,
      c2: 5.0
    },
    variableControls: [
      { id: "xVal", name: "Variable x Dimension", symbol: "x", min: 1, max: 6, step: 1, defaultValue: 4, description: "Unknown side length of base square." },
      { id: "a", name: "Constant a Dimension", symbol: "a", min: 1, max: 5, step: 1, defaultValue: 3, description: "Horizontal strip width." },
      { id: "b", name: "Constant b Dimension", symbol: "b", min: 1, max: 5, step: 1, defaultValue: 2, description: "Vertical strip height." }
    ],
    presets: [
      { id: "p1", name: "Perfect Square (x+3)²", description: "a = 3, b = 3 -> x² + 6x + 9", variables: { a: 3, b: 3, xVal: 4, m1: 1.0, c1: 0.0, m2: -1.0, c2: 4.0 } },
      { id: "p2", name: "Rectangle (x+4)(x+2)", description: "a = 4, b = 2 -> x² + 6x + 8", variables: { a: 4, b: 2, xVal: 3, m1: 2.0, c1: 1.0, m2: 0.5, c2: 4.0 } }
    ],
    calculate: {
      symbolicSteps: [
        { step: 1, title: "Distribute Terms", latex: "(x + a)(x + b) = x(x + b) + a(x + b)", explanation: "Apply the distributive law of multiplication over addition." },
        { step: 2, title: "Expand Products", latex: "= x^2 + bx + ax + ab", explanation: "Multiply each individual term." },
        { step: 3, title: "Combine Like Terms", latex: "= x^2 + (a+b)x + ab", explanation: "Group the linear x terms together." }
      ]
    },
    understand: {
      dynamicExplanationFn: (vars) => {
        const a = vars.a ?? 3;
        const b = vars.b ?? 2;
        const x = vars.xVal ?? 4;
        const total = (x + a) * (x + b);
        return `Area Model partitioned: Blue square (x² = ${x * x}), Green strip (${a}x = ${a * x}), Purple strip (${b}x = ${b * x}), and Amber corner (${a}×${b} = ${a * b}). Total Area = ${total} sq units.`;
      },
      commonMistakes: [
        { mistake: "Freshman's Dream: writing (x + a)² = x² + a²", correction: "(x + a)² = x² + 2ax + a². You must never forget the middle 2ax term!", why: "The two rectangular strips of area a·x each must be counted." }
      ],
      whatIfScenarios: [
        { action: "Set a = b", result: "The model becomes a perfect square (x + a)² = x² + 2ax + a² with two identical side strips." }
      ]
    },
    apply: [
      { domain: "Civil & Architectural Engineering", title: "Lot Expansion Area Calculation", description: "Expanding land parcel dimensions by fixed margins.", realWorldExample: "Adding road setbacks and sidewalk margins to a plot.", engineeringFormula: "A_{\\text{total}} = (W + \\Delta W)(L + \\Delta L)" }
    ],
    challenges: [
      {
        id: "c_alg1",
        title: "Build Area = 42 sq units",
        question: "For x = 4, set dimensions a and b so that (x+a)(x+b) = 42.",
        targetCondition: "(4+a)(4+b) = 42",
        hint: "42 factors into 6 × 7. Try a = 2, b = 3.",
        initialVariables: { a: 1, b: 1, xVal: 4, m1: 1.0, c1: 0.0, m2: -1.0, c2: 4.0 },
        validator: (vars) => (4 + vars.a) * (4 + vars.b) === 42,
        successMessage: "Brilliant! (4 + 2) × (4 + 3) = 6 × 7 = 42 sq units."
      }
    ]
  },

  // 4. FUNCTION EXPLORER LAB
  {
    id: "function-explorer",
    title: "Universal Function Explorer & Geometry Lab",
    category: "Functions & Curves",
    levelBadge: "School → University",
    iconName: "Activity",
    summary: "Analyze function families: Quadratic, Cubic, Trigonometric, and Rational curves. Discover roots, vertices, inflection points, asymptotes, and input-output mapping.",
    bilingual: {
      englishTerm: "Functions, Curves & Mapping",
      banglaTerm: "ফাংশন, লেখচিত্র ও ইনপুট-আউটপুট ম্যাপিং",
      banglaIntuition: "ফাংশন হলো একটি গাণিতিক মেশিন যাতে ইনপুট দিলে নির্দিষ্ট নিয়মে আউটপুট পাওয়া যায়।"
    },
    storyMode: {
      hookQuestion: "Why is the trajectory of a basketball, satellite orbit, and bridge cable described by polynomial functions?",
      scenario: "Gravity creates a constant acceleration, which integration turns into a quadratic position parabola. Understanding function parameters allows predicting where the ball lands.",
      mathematicalBridge: "Quadratic $f(x) = ax^2 + bx + c$ models constant-acceleration physical systems."
    },
    visualizationType: "function-explorer",
    defaultVariables: {
      a: 1.0,
      b: -2.0,
      c: -3.0,
      probeX: 2.0
    },
    variableControls: [
      { id: "a", name: "Leading Coeff a", symbol: "a", min: -3.0, max: 3.0, step: 0.2, defaultValue: 1.0, description: "Vertical stretch and orientation." },
      { id: "b", name: "Linear Coeff b", symbol: "b", min: -6.0, max: 6.0, step: 0.5, defaultValue: -2.0, description: "Linear tilt and vertex shift." },
      { id: "c", name: "Constant c (Y-Intercept)", symbol: "c", min: -6.0, max: 6.0, step: 0.5, defaultValue: -3.0, description: "Vertical shift f(0) = c." }
    ],
    presets: [
      { id: "p1", name: "Roots at x = -1, 3", description: "f(x) = x² - 2x - 3", variables: { a: 1.0, b: -2.0, c: -3.0, probeX: 1.0 } }
    ],
    calculate: {
      symbolicSteps: [
        { step: 1, title: "Evaluate Discriminant", latex: "\\Delta = b^2 - 4ac", explanation: "Determines the nature of roots (real or complex)." },
        { step: 2, title: "Quadratic Formula", latex: "x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}", explanation: "Exact coordinates where f(x) = 0." },
        { step: 3, title: "Vertex Location", latex: "x_v = -\\frac{b}{2a}, \\quad y_v = f(x_v)", explanation: "Peak or trough of the parabola." }
      ]
    },
    understand: {
      dynamicExplanationFn: (vars) => {
        const a = vars.a ?? 1;
        const b = vars.b ?? -2;
        const c = vars.c ?? -3;
        const d = b * b - 4 * a * c;
        const vx = -b / (2 * a || 1);
        return `Parabola f(x) = ${a}x² + (${b})x + (${c}). Vertex sits at (${vx.toFixed(2)}, ${(a*vx*vx + b*vx + c).toFixed(2)}). Discriminant Δ = ${d.toFixed(1)} (${d >= 0 ? "2 Real X-intercepts" : "No Real X-intercepts"}).`;
      },
      commonMistakes: [
        { mistake: "Confusing y-intercept with x-intercept", correction: "Y-intercept is f(0) = c. X-intercepts are solutions to f(x) = 0.", why: "Intersections with different coordinate axes." }
      ],
      whatIfScenarios: [
        { action: "Flip 'a' from +1 to -1", result: "The parabola inverts from concave UP (cup) to concave DOWN (cap)." }
      ]
    },
    apply: [
      { domain: "Optics & Communications", title: "Parabolic Dish Reflection", description: "All incoming parallel rays reflect onto the focal point.", realWorldExample: "Satellite TV receiver and radar antenna.", engineeringFormula: "y = \\frac{1}{4f} x^2" }
    ],
    challenges: [
      {
        id: "c_fn1",
        title: "Place the Vertex on the Y-Axis",
        question: "Adjust coefficient b so the parabola vertex sits exactly at x = 0.00.",
        targetCondition: "x_v = -b/(2a) = 0",
        hint: "Set b = 0.",
        initialVariables: { a: 1.0, b: 3.0, c: -2.0, probeX: 0.0 },
        validator: (vars) => Math.abs(vars.b) < 0.05,
        successMessage: "Great job! Setting b = 0 makes the function symmetric about the y-axis: f(-x) = f(x)."
      }
    ]
  },

  // 5. GEOMETRY PROOFS & THEOREMS LAB
  {
    id: "geometry-proof",
    title: "Interactive Geometry & Visual Proofs Lab",
    category: "Geometry & Theorems",
    levelBadge: "School → HSC",
    iconName: "Shapes",
    summary: "Visual proofs of the Pythagorean Theorem a² + b² = c², Triangle Angle Sum (180°), and Circle Inscribed Angle theorems.",
    bilingual: {
      englishTerm: "Pythagorean & Euclidean Geometry Proofs",
      banglaTerm: "পিথাগোরাসের উপপাদ্য ও জ্যামিতিক প্রমাণ",
      banglaIntuition: "সমকোণী ত্রিভুজের অতিভুজের উপর অঙ্কিত বর্গক্ষেত্রের ক্ষেত্রফল অপর দুই বাহুর বর্গক্ষেত্রের ক্ষেত্রফলের সমষ্টির সমান।"
    },
    storyMode: {
      hookQuestion: "Why did Pythagoras sacrifice 100 oxen when he discovered the geometric square proof of right triangles?",
      scenario: "In ancient times, measuring diagonal distances across plots was impossible without directly walking them. The theorem revealed a universal relationship connecting perpendicular sides to hypotenuse.",
      mathematicalBridge: "Euclidean distance is the bedrock of vectors, metric spaces, and physics."
    },
    visualizationType: "geometry-proof",
    defaultVariables: {
      sideA: 3,
      sideB: 4,
      centralAngle: 80
    },
    variableControls: [
      { id: "sideA", name: "Perpendicular Side a", symbol: "a", min: 1, max: 6, step: 1, defaultValue: 3, description: "Vertical leg length." },
      { id: "sideB", name: "Base Side b", symbol: "b", min: 1, max: 6, step: 1, defaultValue: 4, description: "Horizontal leg length." }
    ],
    presets: [
      { id: "p1", name: "3-4-5 Classic Pythagorean Triple", description: "3² + 4² = 9 + 16 = 25 = 5²", variables: { sideA: 3, sideB: 4, centralAngle: 80 } },
      { id: "p2", name: "5-12-13 Scaled Triple", description: "5² + 12² = 25 + 144 = 169 = 13²", variables: { sideA: 5, sideB: 12, centralAngle: 90 } }
    ],
    calculate: {
      symbolicSteps: [
        { step: 1, title: "Compute Area of Squares", latex: "A_a = a^2, \\quad A_b = b^2", explanation: "Squares constructed on legs a and b." },
        { step: 2, title: "Add Leg Areas", latex: "A_c = a^2 + b^2", explanation: "Sum of leg square areas." },
        { step: 3, title: "Calculate Hypotenuse", latex: "c = \\sqrt{a^2 + b^2}", explanation: "Square root yields exact diagonal distance." }
      ]
    },
    understand: {
      dynamicExplanationFn: (vars) => {
        const a = vars.sideA ?? 3;
        const b = vars.sideB ?? 4;
        const c = Math.hypot(a, b);
        return `Right triangle with legs a = ${a}, b = ${b}. Square areas: a² = ${a*a}, b² = ${b*b}. Hypotenuse square c² = ${a*a + b*b} (c = ${c.toFixed(2)}).`;
      },
      commonMistakes: [
        { mistake: "Applying a² + b² = c² to non-right triangles", correction: "For general triangles, use the Law of Cosines: c² = a² + b² - 2ab cos(C).", why: "Right triangle is the special case where cos(90°) = 0." }
      ],
      whatIfScenarios: [
        { action: "Double both side lengths (a=6, b=8)", result: "Hypotenuse doubles to c=10, but total square area quadruples (2² = 4x)." }
      ]
    },
    apply: [
      { domain: "Robotics & Computer Graphics", title: "Euclidean Distance & Inverse Kinematics", description: "Calculating robot arm reach and 3D distance between point clouds.", realWorldExample: "6-DOF robot arm tool center point positioning.", engineeringFormula: "d = \\sqrt{\\Delta x^2 + \\Delta y^2 + \\Delta z^2}" }
    ],
    challenges: [
      {
        id: "c_geo1",
        title: "Create Hypotenuse = 5.0",
        question: "Set sides a and b so that hypotenuse c is exactly 5.0 units.",
        targetCondition: "sqrt(a² + b²) = 5",
        hint: "Try a = 3, b = 4.",
        initialVariables: { sideA: 2, sideB: 2, centralAngle: 80 },
        validator: (vars) => Math.abs(Math.hypot(vars.sideA, vars.sideB) - 5.0) < 0.01,
        successMessage: "Perfect! 3² + 4² = 9 + 16 = 25, sqrt(25) = 5.00."
      }
    ]
  },

  // 6. MOTION & EV KINEMATICS LAB
  {
    id: "motion-kinematics",
    title: "Motion Mathematics & EV Kinematics Lab",
    category: "Motion & Kinematics",
    levelBadge: "HSC → Engineering",
    iconName: "Car",
    summary: "Bridge physics to calculus: synchronize position s(t), velocity v(t)=s'(t), acceleration a(t)=v'(t), stopping distance, and EV regenerative braking energy.",
    bilingual: {
      englishTerm: "Kinematics & Rate Derivatives",
      banglaTerm: "গতিবিদ্যা ও অন্তরীকরণ",
      banglaIntuition: "অবস্থানের অন্তরজ বেগ, এবং বেগের অন্তরজ ত্বরণ।"
    },
    storyMode: {
      hookQuestion: "How does an Electric Vehicle (EV) calculate regenerative braking power back into its battery pack?",
      scenario: "When braking, mechanical kinetic energy E_k = 0.5 m v² is converted back into electrical power P = F · v = (m · a) · v through the inverter.",
      mathematicalBridge: "Derivatives turn position into speed, and integration turns power into accumulated kilowatt-hours."
    },
    visualizationType: "motion-kinematics",
    defaultVariables: {
      initialPos: 0,
      initialVel: 10,
      acceleration: 2.0,
      vehicleMass: 1500
    },
    variableControls: [
      { id: "initialVel", name: "Initial Speed v₀", symbol: "v₀", min: 0, max: 30, step: 2, defaultValue: 10, unit: "m/s", description: "Speed at time t = 0." },
      { id: "acceleration", name: "Acceleration a", symbol: "a", min: -5.0, max: 6.0, step: 0.5, defaultValue: 2.0, unit: "m/s²", description: "Rate of velocity change." }
    ],
    presets: [
      { id: "p1", name: "0-100 km/h Rapid Launch", description: "a = 4.5 m/s², v0 = 0", variables: { initialPos: 0, initialVel: 0, acceleration: 4.5, vehicleMass: 1500 } },
      { id: "p2", name: "Emergency Braking", description: "a = -6.0 m/s², v0 = 25 m/s", variables: { initialPos: 0, initialVel: 25, acceleration: -6.0, vehicleMass: 1500 } }
    ],
    calculate: {
      symbolicSteps: [
        { step: 1, title: "Velocity Equation", latex: "v(t) = v_0 + a t", explanation: "First derivative of position with respect to time." },
        { step: 2, title: "Position Equation", latex: "s(t) = s_0 + v_0 t + \\frac{1}{2} a t^2", explanation: "Integration of velocity over elapsed time." },
        { step: 3, title: "Kinetic Energy", latex: "E_k = \\frac{1}{2} m v(t)^2", explanation: "Mechanical energy carried by moving mass m." }
      ]
    },
    understand: {
      dynamicExplanationFn: (vars) => {
        const v0 = vars.initialVel ?? 10;
        const a = vars.acceleration ?? 2;
        return `EV with initial speed v₀ = ${v0} m/s and acceleration a = ${a} m/s². In 5 seconds, speed reaches ${(v0 + a * 5).toFixed(1)} m/s (${((v0 + a * 5) * 3.6).toFixed(1)} km/h).`;
      },
      commonMistakes: [
        { mistake: "Applying s = vt when acceleration is non-zero", correction: "s = vt is valid ONLY for constant velocity (a = 0). When accelerating, you must use s = v₀t + ½at².", why: "Velocity is continuously changing." }
      ],
      whatIfScenarios: [
        { action: "Double the vehicle speed", result: "Kinetic energy quadruples (2² = 4x) and stopping distance quadruples!" }
      ]
    },
    apply: [
      { domain: "Automotive & Control Engineering", title: "EV Regenerative Braking System", description: "Inverter field-oriented control recapturing kinetic energy into battery cells.", realWorldExample: "Tesla Model 3 one-pedal drive regenerative decelerations.", engineeringFormula: "P_{\\text{regen}} = \\eta \\cdot m \\cdot a \\cdot v" }
    ],
    challenges: [
      {
        id: "c_mot1",
        title: "Achieve 20 m/s Velocity in 5 Seconds",
        question: "Starting from v₀ = 5 m/s, adjust acceleration 'a' so that at t = 5s, speed is exactly 20 m/s.",
        targetCondition: "v(5) = 5 + 5a = 20",
        hint: "5 + 5a = 20 -> 5a = 15 -> a = 3.0 m/s².",
        initialVariables: { initialPos: 0, initialVel: 5, acceleration: 1.0, vehicleMass: 1500 },
        validator: (vars) => Math.abs((vars.initialVel + vars.acceleration * 5) - 20) < 0.2,
        successMessage: "Spot on! a = 3.0 m/s² accelerates the vehicle to exactly 20 m/s (72 km/h)."
      }
    ]
  },

  // 7. PROBABILITY & STOCHASTIC LAB
  {
    id: "probability-experiment",
    title: "Stochastic Experiments & Probability Lab",
    category: "Probability & Experiments",
    levelBadge: "HSC → Engineering",
    iconName: "Dices",
    summary: "Simulate 2-dice sums, coin tosses, and 1D Random Walk diffusion. Compare empirical Monte Carlo frequencies with theoretical probability mass functions.",
    bilingual: {
      englishTerm: "Probability, Combinatorics & Random Walk",
      banglaTerm: "সম্ভাবনা, দ্বিপদী বিন্যাস ও দৈব চলক",
      banglaIntuition: "পরীক্ষার সংখ্যা যত বাড়বে, পরীক্ষামূলক ফলাফল তত তাত্ত্বিক সম্ভাবনার কাছাকাছি পৌঁছাবে।"
    },
    storyMode: {
      hookQuestion: "Why is 7 the most common sum when rolling two dice in casino games and board games like Settlers of Catan?",
      scenario: "There are 6 combinations to roll a 7 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1), but only 1 combination to roll a 2 (1+1) or 12 (6+6).",
      mathematicalBridge: "Combinatorics and probability mass functions quantify the frequency distribution."
    },
    visualizationType: "probability-experiment",
    defaultVariables: {
      trialCount: 100
    },
    variableControls: [
      { id: "trialCount", name: "Sample Size N", symbol: "N", min: 10, max: 5000, step: 10, defaultValue: 100, description: "Number of simulated trials." }
    ],
    presets: [
      { id: "p1", name: "Small Sample (N=20)", description: "High random noise", variables: { trialCount: 20 } },
      { id: "p2", name: "Large Sample (N=2000)", description: "Smooth Law of Large Numbers convergence", variables: { trialCount: 2000 } }
    ],
    calculate: {
      symbolicSteps: [
        { step: 1, title: "Theoretical Probability", latex: "P(E) = \\frac{\\text{Number of favorable outcomes}}{\\text{Total outcomes}}", explanation: "Classical Laplace definition of probability." },
        { step: 2, title: "Law of Large Numbers", latex: "\\lim_{N \\to \\infty} \\frac{n_E}{N} = P(E)", explanation: "Relative frequency approaches theoretical probability as N increases." }
      ]
    },
    understand: {
      dynamicExplanationFn: () => "Monte Carlo simulations demonstrate that individual random events are unpredictable, but the aggregate behavior of large populations is mathematically deterministic.",
      commonMistakes: [
        { mistake: "Gambler's Fallacy", correction: "Independent events have no memory. A fair coin flipped 5 heads in a row still has a 50% chance of heads on flip 6.", why: "P(A ∩ B) = P(A)P(B)." }
      ],
      whatIfScenarios: [
        { action: "Increase trials from 50 to 2000", result: "The histogram bars lock onto the exact theoretical triangular PMF." }
      ]
    },
    apply: [
      { domain: "Telecommunications & AI", title: "Bit Error Rate & Noise Simulation", description: "Monte Carlo testing of channel decoding algorithms against Gaussian white noise.", realWorldExample: "5G LDPC error correction verification.", engineeringFormula: "\\text{BER} = Q\\left(\\sqrt{\\frac{2E_b}{N_0}}\\right)" }
    ],
    challenges: [
      {
        id: "c_prob1",
        title: "Test Convergence",
        question: "Run at least 1,000 rolls to observe how sum 7 dominates the distribution.",
        targetCondition: "Rolls >= 1000",
        hint: "Click the +1,000 Rolls button.",
        initialVariables: { trialCount: 0 },
        validator: () => true,
        successMessage: "Great! Notice how sum 7 lands close to its theoretical 16.7%."
      }
    ]
  },

  // 8. STATISTICS & REGRESSION LAB
  {
    id: "statistics-data",
    title: "Statistics, Boxplots & Linear Regression Lab",
    category: "Statistics & Data",
    levelBadge: "HSC → Engineering",
    iconName: "BarChart3",
    summary: "Interact with scatter data, compute Mean, Median, Standard Deviation, IQR, Box-and-Whisker diagrams, and fit least-squares regression lines y = mx + b.",
    bilingual: {
      englishTerm: "Statistics, Spread & Linear Fit",
      banglaTerm: "পরিসংখ্যান, বিস্তৃতি পরিমাপ ও রৈখিক সমীকরণ",
      banglaIntuition: "গড় কেন্দ্রীয় মান দেয়, আর স্ট্যান্ডার্ড ডেভিয়েশন বোঝায় উপাত্তগুলো কতটুকু ছড়িয়ে আছে।"
    },
    storyMode: {
      hookQuestion: "How do machine learning models fit a straight line through noisy real-world data?",
      scenario: "Linear regression minimizes the sum of squared vertical residuals (least squares) between measured sensor data and the predictive line.",
      mathematicalBridge: "Calculus derivatives of the residual error function yield the exact closed-form slope and intercept equations."
    },
    visualizationType: "statistics-data",
    defaultVariables: {
      pointCount: 7
    },
    variableControls: [
      { id: "pointCount", name: "Data Points Count", symbol: "N", min: 3, max: 20, step: 1, defaultValue: 7, description: "Number of data points." }
    ],
    presets: [
      { id: "p1", name: "Strong Correlation (r ≈ 0.95)", description: "Tight linear trend", variables: { pointCount: 7 } }
    ],
    calculate: {
      symbolicSteps: [
        { step: 1, title: "Sample Mean", latex: "\\bar{x} = \\frac{1}{N} \\sum x_i, \\quad \\bar{y} = \\frac{1}{N} \\sum y_i", explanation: "Center of mass of data." },
        { step: 2, title: "Least-Squares Slope", latex: "m = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2}", explanation: "Minimizes sum of squared errors." },
        { step: 3, title: "Y-Intercept", latex: "b = \\bar{y} - m \\bar{x}", explanation: "Line passes through centroid (x̄, ȳ)." }
      ]
    },
    understand: {
      dynamicExplanationFn: () => "Linear regression calculates the best-fit line by minimizing the sum of squared distances (residuals) from each scatter point to the line.",
      commonMistakes: [
        { mistake: "Confusing Correlation with Causation", correction: "A high correlation r does not mean x causes y. A lurking third variable may influence both.", why: "Correlation measures linear association only." }
      ],
      whatIfScenarios: [
        { action: "Add an extreme outlier point far off the trend", result: "The regression line pivots strongly toward the outlier because squared errors penalize distant points heavily." }
      ]
    },
    apply: [
      { domain: "Data Science & Machine Learning", title: "Predictive Trend Modeling", description: "Calibrating battery state-of-charge estimation from voltage sensor telemetry.", realWorldExample: "BMS battery degradation modeling.", engineeringFormula: "\\hat{y} = \\mathbf{X} (\\mathbf{X}^T \\mathbf{X})^{-1} \\mathbf{X}^T \\mathbf{y}" }
    ],
    challenges: [
      {
        id: "c_stat1",
        title: "Observe Positive Correlation",
        question: "Inspect the regression card to verify correlation coefficient r > 0.80.",
        targetCondition: "r > 0.80",
        hint: "The data shows a strong upward trend.",
        initialVariables: { pointCount: 7 },
        validator: () => true,
        successMessage: "Verified! Positive slope indicates strong positive correlation."
      }
    ]
  },

  // 9. SEQUENCES & SERIES LAB
  {
    id: "sequences-series",
    title: "Sequences, Series & Accumulation Lab",
    category: "Sequences & Series",
    levelBadge: "School → BSc",
    iconName: "ListOrdered",
    summary: "Visualize Arithmetic Progression (a + nd), Geometric Progression (a · rⁿ⁻¹), partial sums Sₙ, and visual unit square proof of infinite geometric series.",
    bilingual: {
      englishTerm: "Sequences & Infinite Series",
      banglaTerm: "সমান্তর ও গুণোত্তর ধারা ও অসীম সমষ্টি",
      banglaIntuition: "অসীম সংখ্যক ধনাত্মক সংখ্যার যোগফলও একটি সসীম নির্দিষ্ট সংখ্যা হতে পারে যদি অনুপাত ১ এর কম হয়।"
    },
    storyMode: {
      hookQuestion: "If you walk half the distance to a wall, then half the remaining distance, then half again forever, will you ever reach the wall?",
      scenario: "Zeno's paradox asked whether an infinite number of steps can sum to a finite length. Calculus and geometric series prove that 1/2 + 1/4 + 1/8 + ... = 1 exactly.",
      mathematicalBridge: "Infinite geometric series $S_\\infty = \\frac{a}{1-r}$ converges whenever $|r| < 1$."
    },
    visualizationType: "sequences-series",
    defaultVariables: {
      a1: 2,
      d: 3,
      r: 0.5,
      termCount: 8
    },
    variableControls: [
      { id: "a1", name: "First Term a₁", symbol: "a₁", min: 1, max: 10, step: 1, defaultValue: 2, description: "Initial value of the sequence." },
      { id: "d", name: "Common Difference d (AP)", symbol: "d", min: 1, max: 8, step: 1, defaultValue: 3, description: "Step size for arithmetic progression." },
      { id: "r", name: "Common Ratio r (GP)", symbol: "r", min: 0.1, max: 0.9, step: 0.1, defaultValue: 0.5, description: "Multiplier for geometric progression." }
    ],
    presets: [
      { id: "p1", name: "Geometric Halving (r=0.5)", description: "1, 1/2, 1/4, 1/8... S_∞ = 2", variables: { a1: 1, d: 2, r: 0.5, termCount: 8 } },
      { id: "p2", name: "Arithmetic Odd Numbers", description: "1, 3, 5, 7, 9... S_n = n²", variables: { a1: 1, d: 2, r: 0.5, termCount: 6 } }
    ],
    calculate: {
      symbolicSteps: [
        { step: 1, title: "Nth Term of AP", latex: "a_n = a_1 + (n-1)d", explanation: "Add common difference (n-1) times." },
        { step: 2, title: "Sum of AP", latex: "S_n = \\frac{n}{2}(2a_1 + (n-1)d)", explanation: "Gauss's pairing method." },
        { step: 3, title: "Infinite Sum of GP", latex: "S_\\infty = \\frac{a_1}{1 - r} \\quad (|r| < 1)", explanation: "Limit of partial sums as n approaches infinity." }
      ]
    },
    understand: {
      dynamicExplanationFn: (vars) => {
        const a1 = vars.a1 ?? 2;
        const r = vars.r ?? 0.5;
        const infSum = a1 / (1 - r);
        return `Geometric progression with first term a₁ = ${a1} and common ratio r = ${r}. Because |r| < 1, the infinite sum converges cleanly to S_∞ = ${infSum.toFixed(2)}.`;
      },
      commonMistakes: [
        { mistake: "Trying to sum an infinite series with r ≥ 1", correction: "If |r| ≥ 1, terms do not shrink to zero and the sum diverges to infinity.", why: "Divergence test." }
      ],
      whatIfScenarios: [
        { action: "Set r = 0.5 with a1 = 1", result: "The infinite sum converges to exactly 1 / (1 - 0.5) = 2.00." }
      ]
    },
    apply: [
      { domain: "Finance & Engineering Economics", title: "Annuity & Present Value Accumulation", description: "Discounted cash flow series calculating future asset value.", realWorldExample: "Loan amortization schedules and EV battery life degradation compound models.", engineeringFormula: "PV = \\sum_{t=1}^n \\frac{C}{(1+i)^t}" }
    ],
    challenges: [
      {
        id: "c_seq1",
        title: "Create Infinite Sum = 4.0",
        question: "With r = 0.5, set the first term a₁ so the infinite sum S_∞ equals 4.0.",
        targetCondition: "a₁ / (1 - 0.5) = 4.0",
        hint: "a₁ / 0.5 = 4 -> a₁ = 2.",
        initialVariables: { a1: 1, d: 3, r: 0.5, termCount: 8 },
        validator: (vars) => vars.a1 === 2,
        successMessage: "Correct! a₁ = 2 gives S_∞ = 2 / 0.5 = 4.0."
      }
    ]
  },

  // 10. TRIGONOMETRY & UNIT CIRCLE LAB
  {
    id: "trig-unit-circle",
    title: "Trigonometry & Unit Circle Lab",
    category: "Trigonometry",
    levelBadge: "School → Engineering",
    iconName: "Compass",
    summary: "Interact with the Unit Circle (r=1). Drag angle θ to visualize cos(θ)=x, sin(θ)=y, tan(θ) projection, reference triangles, and radian mapping.",
    bilingual: {
      englishTerm: "Trigonometry & Unit Circle",
      banglaTerm: "ত্রিকোণমিতি ও একক বৃত্ত",
      banglaIntuition: "একক বৃত্তের যেকোনো বিন্দুর x-স্থানাঙ্ক হলো cos(θ) এবং y-স্থানাঙ্ক হলো sin(θ)।"
    },
    storyMode: {
      hookQuestion: "Why is circular motion directly connected to the waves that transmit Wi-Fi and electrical AC power?",
      scenario: "As a generator coil spins in a circle at constant angular velocity, its vertical projection creates a pure sine wave, and its horizontal projection creates a cosine wave.",
      mathematicalBridge: "Euler's formula $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$ wraps the real number line around the unit circle."
    },
    visualizationType: "trig-unit-circle",
    defaultVariables: {
      thetaDeg: 45,
      frequency: 1,
      amplitude: 1.0,
      showTanSec: 1,
      showWaveProjection: 1
    },
    variableControls: [
      { id: "thetaDeg", name: "Angle θ (Degrees)", symbol: "θ", min: 0, max: 360, step: 5, defaultValue: 45, unit: "°", description: "Rotation angle on the unit circle." },
      { id: "amplitude", name: "Circle Radius / Amplitude", symbol: "R", min: 0.5, max: 2.0, step: 0.1, defaultValue: 1.0, description: "Radius of the trigonometric circle." }
    ],
    presets: [
      { id: "p1", name: "30° (π/6) Exact Value", description: "cos(30°) = √3/2 ≈ 0.866, sin(30°) = 0.500", variables: { thetaDeg: 30, frequency: 1, amplitude: 1.0, showTanSec: 1, showWaveProjection: 1 } },
      { id: "p2", name: "45° (π/4) Diagonal", description: "cos(45°) = sin(45°) = √2/2 ≈ 0.707", variables: { thetaDeg: 45, frequency: 1, amplitude: 1.0, showTanSec: 1, showWaveProjection: 1 } },
      { id: "p3", name: "90° (π/2) Top Peak", description: "cos(90°) = 0, sin(90°) = 1, tan(90°) undefined", variables: { thetaDeg: 90, frequency: 1, amplitude: 1.0, showTanSec: 1, showWaveProjection: 1 } }
    ],
    calculate: {
      symbolicSteps: [
        { step: 1, title: "Convert Degrees to Radians", latex: "\\theta_{\\text{rad}} = \\theta_{\\text{deg}} \\times \\frac{\\pi}{180^\\circ}", explanation: "Arc length on unit radius." },
        { step: 2, title: "Cosine & Sine Coordinates", latex: "x = \\cos(\\theta), \\quad y = \\sin(\\theta)", explanation: "Horizontal and vertical projections." },
        { step: 3, title: "Pythagorean Identity", latex: "\\cos^2(\\theta) + \\sin^2(\\theta) = 1", explanation: "Hypotenuse on unit circle is always 1." }
      ]
    },
    understand: {
      dynamicExplanationFn: (vars) => {
        const deg = vars.thetaDeg ?? 45;
        const rad = (deg * Math.PI) / 180;
        return `At θ = ${deg}° (${(rad / Math.PI).toFixed(3)}π rad): cos(θ) = ${Math.cos(rad).toFixed(3)}, sin(θ) = ${Math.sin(rad).toFixed(3)}, tan(θ) = ${Math.abs(Math.cos(rad)) > 0.01 ? Math.tan(rad).toFixed(3) : "Undefined (∞)"}.`;
      },
      commonMistakes: [
        { mistake: "Confusing degrees and radians in calculus", correction: "Calculus derivative d/dx[sin(x)] = cos(x) is valid ONLY when x is in radians.", why: "Limit lim_{x→0} sin(x)/x = 1 holds only in radians." }
      ],
      whatIfScenarios: [
        { action: "Rotate angle into Quadrant II (135°)", result: "Cosine becomes negative (-0.707) while sine remains positive (+0.707)." }
      ]
    },
    apply: [
      { domain: "Electrical & Power Engineering", title: "AC Voltage & Three-Phase Power", description: "Synchronous AC generator voltages displaced by 120°.", realWorldExample: "EV three-phase BLDC motor stator coils.", engineeringFormula: "v_A(t) = V_m \\sin(\\omega t), \\quad v_B(t) = V_m \\sin(\\omega t - 120^\\circ)" }
    ],
    challenges: [
      {
        id: "c_trig1",
        title: "Match sin(θ) = 0.500",
        question: "Rotate angle θ in Quadrant I so that sin(θ) is exactly 0.500.",
        targetCondition: "sin(θ) = 0.5",
        hint: "sin(30°) = 1/2.",
        initialVariables: { thetaDeg: 0, frequency: 1, amplitude: 1.0, showTanSec: 1, showWaveProjection: 1 },
        validator: (vars) => Math.abs(vars.thetaDeg - 30) < 2,
        successMessage: "Correct! At θ = 30° (π/6), vertical height sin(30°) = 0.500."
      }
    ]
  },

  // 11. INTEGRAL CALCULUS LAB
  {
    id: "calculus-integral",
    title: "Integral Calculus & Riemann Accumulation Lab",
    category: "Integral Calculus",
    levelBadge: "HSC → Engineering",
    iconName: "Layers",
    summary: "Discover integration as the limit of Riemann sums, area under curves, accumulation functions, and the Fundamental Theorem of Calculus.",
    bilingual: {
      englishTerm: "Definite Integral & Riemann Sums",
      banglaTerm: "নির্দিষ্ট যোগজীকরণ ও রিম্যান সমষ্টি",
      banglaIntuition: "বক্ররেখার নিচের ক্ষেত্রফলকে অসংখ্য ক্ষুদ্রাতিক্ষুদ্র আয়তক্ষেত্রে ভাগ করে যোগ করার সীমাস্থ মান।"
    },
    storyMode: {
      hookQuestion: "How do architects calculate the exact volume of concrete needed for an irregularly curved stadium roof?",
      scenario: "A curve has no simple width × height formula. Archimedes and Riemann sliced the irregular shape into hundreds of thin rectangular slices and added their areas.",
      mathematicalBridge: "As rectangle width dx → 0 and count N → ∞, the discrete sum becomes the exact definite integral $\\int_a^b f(x)dx$."
    },
    visualizationType: "calculus-integral",
    defaultVariables: {
      a: 0.0,
      b: 3.0,
      n: 12,
      fnType: 0, // 0: quadratic, 1: sine, 2: cubic
      method: 0 // 0: midpoint, 1: left, 2: right, 3: trapezoid
    },
    variableControls: [
      { id: "a", name: "Lower Limit a", symbol: "a", min: -3.0, max: 2.0, step: 0.2, defaultValue: 0.0, description: "Left boundary of integration." },
      { id: "b", name: "Upper Limit b", symbol: "b", min: 0.5, max: 5.0, step: 0.2, defaultValue: 3.0, description: "Right boundary of integration." },
      { id: "n", name: "Sub-intervals (N)", symbol: "N", min: 2, max: 100, step: 2, defaultValue: 12, description: "Number of Riemann slices." }
    ],
    presets: [
      { id: "p1", name: "Parabola Area under x²", description: "Integral from 0 to 3 = 3³/3 = 9.00", variables: { a: 0.0, b: 3.0, n: 20, fnType: 0, method: 0 } },
      { id: "p2", name: "Half Sine Period", description: "Integral of sin(x) from 0 to π = 2.00", variables: { a: 0.0, b: 3.14, n: 24, fnType: 1, method: 0 } }
    ],
    calculate: {
      symbolicSteps: [
        { step: 1, title: "Riemann Sum Formula", latex: "S_N = \\sum_{i=1}^N f(x_i^*) \\Delta x, \\quad \\Delta x = \\frac{b-a}{N}", explanation: "Sum of N rectangle areas." },
        { step: 2, title: "Fundamental Theorem of Calculus", latex: "\\int_a^b f(x) dx = F(b) - F(a)", explanation: "Where F'(x) = f(x)." },
        { step: 3, title: "Evaluate Antiderivative", latex: "\\int_0^3 x^2 dx = \\left[ \\frac{x^3}{3} \\right]_0^3 = 9.00", explanation: "Exact analytical solution." }
      ]
    },
    understand: {
      dynamicExplanationFn: (vars) => {
        const n = vars.n ?? 12;
        return `Riemann approximation with N = ${n} rectangles. As N increases, the error between the stepped rectangles and the smooth curve shrinks to 0.`;
      },
      commonMistakes: [
        { mistake: "Forgetting that area below the x-axis counts as negative in definite integrals", correction: "A definite integral calculates net signed area: regions above x-axis are positive, regions below are negative.", why: "Height f(x) < 0 creates negative products f(x)·dx." }
      ],
      whatIfScenarios: [
        { action: "Increase N from 4 to 100", result: "The Riemann sum converges with high decimal precision to the exact analytical integral." }
      ]
    },
    apply: [
      { domain: "Energy & EV Systems", title: "Battery Charge Accumulation (Amp-Hours)", description: "Total battery energy is the time integral of electrical power.", realWorldExample: "EV dashboard battery state-of-charge calculation.", engineeringFormula: "E_{\\text{battery}} = \\int_0^T V(t) \\cdot i(t) \\, dt" }
    ],
    challenges: [
      {
        id: "c_int1",
        title: "Riemann Precision",
        question: "Increase sub-interval count N to at least 40 to achieve < 0.05 error against the exact area of 9.00.",
        targetCondition: "N >= 40",
        hint: "Drag the N slider up to make the rectangles ultra-thin.",
        initialVariables: { a: 0.0, b: 3.0, n: 4, fnType: 0, method: 0 },
        validator: (vars) => vars.n >= 40,
        successMessage: "Excellent! Thin slices capture the smooth curvature with pristine accuracy."
      }
    ]
  },

  // 12. LIMITS & CONTINUITY LAB
  {
    id: "limit-continuity",
    title: "Limits & Epsilon-Delta Continuity Lab",
    category: "Limits & Continuity",
    levelBadge: "HSC → University BSc",
    iconName: "Maximize",
    summary: "Interact with limits lim_{x→a} f(x). Approach target x = a from left and right, visualize ε-δ convergence bands, removable holes, and discontinuity jumps.",
    bilingual: {
      englishTerm: "Limits & Epsilon-Delta Continuity",
      banglaTerm: "সীমা বা লিমিট ও অবিচ্ছিন্নতা",
      banglaIntuition: "নির্দিষ্ট বিন্দুতে ফাংশন সংজ্ঞায়িত না হলেও তার ঠিক কাছাকাছি মান কোথায় পৌঁছাচ্ছে তা লিমিট দিয়ে বের করা হয়।"
    },
    storyMode: {
      hookQuestion: "What happens when dividing 0 by 0 in physics calculations like instantaneous velocity Δx / Δt?",
      scenario: "At Δt = 0, distance moved is 0, giving 0/0 (indeterminate). Limits allow evaluating the trajectory as Δt gets arbitrarily close to zero without dividing by zero directly.",
      mathematicalBridge: "The limit explores the neighborhood around a point, completely independent of whether f(a) is defined."
    },
    visualizationType: "limit-continuity",
    defaultVariables: {
      targetA: 2.0,
      currentX: 1.5,
      delta: 0.3,
      epsilon: 0.6
    },
    variableControls: [
      { id: "currentX", name: "Movable Probe X", symbol: "x", min: -1.0, max: 5.0, step: 0.05, defaultValue: 1.5, description: "Move x toward target a." },
      { id: "targetA", name: "Target Point a", symbol: "a", min: 0.0, max: 4.0, step: 0.5, defaultValue: 2.0, description: "Target coordinate." }
    ],
    presets: [
      { id: "p1", name: "Removable Hole (x²-4)/(x-2)", description: "Undefined at x=2, but limit L = 4 exists", variables: { targetA: 2.0, currentX: 1.8, delta: 0.3, epsilon: 0.5 } }
    ],
    calculate: {
      symbolicSteps: [
        { step: 1, title: "Indeterminate Form", latex: "\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} \\implies \\frac{0}{0}", explanation: "Direct substitution fails." },
        { step: 2, title: "Factor Numerator", latex: "\\frac{(x-2)(x+2)}{x-2} = x+2 \\quad (x \\neq 2)", explanation: "Cancel removable singularity." },
        { step: 3, title: "Evaluate Limit", latex: "\\lim_{x \\to 2} (x+2) = 4", explanation: "Target limit is 4." }
      ]
    },
    understand: {
      dynamicExplanationFn: (vars) => {
        const x = vars.currentX ?? 1.5;
        const a = vars.targetA ?? 2.0;
        return `Current probe x = ${x.toFixed(2)} is distance |x - a| = ${Math.abs(x - a).toFixed(2)} from target a = ${a}. As x → ${a}, f(x) approaches limiting value L = ${(a + 2).toFixed(2)}.`;
      },
      commonMistakes: [
        { mistake: "Believing f(a) must be defined for a limit to exist", correction: "A limit cares only about behavior near x=a, not at x=a.", why: "Limit definition excludes x = a." }
      ],
      whatIfScenarios: [
        { action: "Approach x=2 from left and right", result: "Both sides converge on y = 4.00, proving limit existence." }
      ]
    },
    apply: [
      { domain: "Fluid Mechanics & Aeronautics", title: "Boundary Layer Singularity Resolution", description: "Resolving indeterminate pressure gradients near wing leading edges.", realWorldExample: "Airfoil aerodynamic lift limits.", engineeringFormula: "\\lim_{\\Delta t \\to 0} \\frac{\\Delta \\mathbf{p}}{\\Delta t} = \\mathbf{F}_{\\text{net}}" }
    ],
    challenges: [
      {
        id: "c_lim1",
        title: "Approach within 0.05 of Hole",
        question: "Move probe x within 0.05 of target a = 2.00.",
        targetCondition: "|x - 2.0| <= 0.05",
        hint: "Drag slider to ~1.98 or 2.02.",
        initialVariables: { targetA: 2.0, currentX: 1.2, delta: 0.3, epsilon: 0.6 },
        validator: (vars) => Math.abs(vars.currentX - 2.0) <= 0.05,
        successMessage: "Great precision! You verified that as x → 2, f(x) → 4.00 despite the undefined point."
      }
    ]
  }
];
