/**
 * EVLab Fluid Mechanics Equation Explorer Registry
 * Catalog of fundamental equations, variables, SI/US units, assumptions, and applicable ranges.
 */

export interface EquationDefinition {
  id: string;
  name: string;
  category: 'Hydrostatics' | 'Kinematics' | 'Energy' | 'Pipe Flow' | 'Open Channel' | 'Flow Measurement' | 'Turbomachinery' | 'Dimensionless';
  formula: string;
  latex: string;
  description: string;
  variables: { symbol: string; name: string; siUnit: string; usUnit: string; description: string }[];
  assumptions: string[];
  applicableRange: string;
  engineeringSignificance: string;
  exampleProblem: string;
}

export const EQUATION_REGISTRY: EquationDefinition[] = [
  {
    id: 'EQ-CON-01',
    name: 'Continuity Equation (1D Incompressible)',
    category: 'Kinematics',
    formula: 'Q = A₁ · V₁ = A₂ · V₂',
    latex: 'Q = A_1 V_1 = A_2 V_2 = \\text{Constant}',
    description: 'Statement of mass conservation for steady flow of an incompressible fluid.',
    variables: [
      { symbol: 'Q', name: 'Volumetric Flow Rate', siUnit: 'm³/s', usUnit: 'cfs (ft³/s)', description: 'Volume of fluid passing a cross-section per unit time' },
      { symbol: 'A', name: 'Cross-Sectional Area', siUnit: 'm²', usUnit: 'ft²', description: 'Flow area perpendicular to velocity vectors' },
      { symbol: 'V', name: 'Mean Velocity', siUnit: 'm/s', usUnit: 'ft/s', description: 'Average bulk flow speed across section' },
    ],
    assumptions: ['Steady flow (∂ρ/∂t = 0)', 'Incompressible fluid (ρ = const)', '1D uniform velocity profile'],
    applicableRange: 'Pipes, ducts, and channels where density changes are < 5% (Mach < 0.3)',
    engineeringSignificance: 'Fundamental basis for sizing water distribution pipes, nozzles, and flumes to control flow velocities.',
    exampleProblem: 'Water flows at 2 m/s through a 200 mm pipe. What is the velocity in a 100 mm contraction? (Answer: V₂ = 2 × (200/100)² = 8 m/s).'
  },
  {
    id: 'EQ-BER-01',
    name: 'Extended Bernoulli Energy Equation with Head Loss',
    category: 'Energy',
    formula: 'P₁/γ + V₁²/(2g) + z₁ + h_p = P₂/γ + V₂²/(2g) + z₂ + h_t + h_L',
    latex: '\\frac{P_1}{\\gamma} + \\frac{V_1^2}{2g} + z_1 + h_p = \\frac{P_2}{\\gamma} + \\frac{V_2^2}{2g} + z_2 + h_t + h_L',
    description: 'Conservation of mechanical energy along a streamline accounting for pump head addition, turbine extraction, and viscous friction losses.',
    variables: [
      { symbol: 'P/γ', name: 'Pressure Head', siUnit: 'm', usUnit: 'ft', description: 'Height of fluid column corresponding to static pressure' },
      { symbol: 'V²/(2g)', name: 'Velocity Head', siUnit: 'm', usUnit: 'ft', description: 'Kinetic energy per unit weight of moving fluid' },
      { symbol: 'z', name: 'Elevation Head', siUnit: 'm', usUnit: 'ft', description: 'Potential energy per unit weight above reference datum' },
      { symbol: 'h_p', name: 'Pump Head', siUnit: 'm', usUnit: 'ft', description: 'Net mechanical energy head supplied by a pump' },
      { symbol: 'h_L', name: 'Total Head Loss', siUnit: 'm', usUnit: 'ft', description: 'Friction and minor component dissipation' },
    ],
    assumptions: ['Steady flow', 'Incompressible liquid', 'Flow along a continuous streamline or 1D conduit', 'Viscous dissipation lumped in h_L'],
    applicableRange: 'Water transmission lines, siphon systems, hydro power penstocks',
    engineeringSignificance: 'Constructs the Hydraulic Grade Line (HGL) and Energy Grade Line (EGL) to ensure adequate pressure and prevent cavitation.',
    exampleProblem: 'A reservoir at elevation 50m delivers water to a nozzle at elevation 10m. Neglecting friction, nozzle velocity V = √(2g × 40) = 28.0 m/s.'
  },
  {
    id: 'EQ-REY-01',
    name: 'Reynolds Number',
    category: 'Dimensionless',
    formula: 'Re = (ρ · V · D) / μ = (V · D) / ν',
    latex: 'Re = \\frac{\\rho V D}{\\mu} = \\frac{V D}{\\nu}',
    description: 'The ratio of inertial forces to viscous forces in a fluid flow.',
    variables: [
      { symbol: 'Re', name: 'Reynolds Number', siUnit: 'dimensionless', usUnit: 'dimensionless', description: 'Dynamic similarity criterion' },
      { symbol: 'ρ', name: 'Fluid Density', siUnit: 'kg/m³', usUnit: 'slug/ft³ or lb/ft³', description: 'Mass per unit volume' },
      { symbol: 'V', name: 'Characteristic Velocity', siUnit: 'm/s', usUnit: 'ft/s', description: 'Average flow velocity' },
      { symbol: 'D', name: 'Characteristic Length', siUnit: 'm', usUnit: 'ft', description: 'Pipe diameter or hydraulic diameter' },
      { symbol: 'μ', name: 'Dynamic Viscosity', siUnit: 'Pa·s (N·s/m²)', usUnit: 'lb·s/ft²', description: 'Shear resistance of fluid' },
      { symbol: 'ν', name: 'Kinematic Viscosity', siUnit: 'm²/s', usUnit: 'ft²/s', description: 'Ratio μ/ρ' },
    ],
    assumptions: ['Newtonian fluid', 'Closed conduit geometry'],
    applicableRange: 'Laminar for Re < 2300; Transitional 2300 to 4000; Turbulent for Re > 4000',
    engineeringSignificance: 'Dictates whether flow is smooth and orderly or turbulent with enhanced mixing, heat transfer, and wall friction.',
    exampleProblem: 'Water at 20°C (ν = 1.004×10⁻⁶ m²/s) flowing at 1.5 m/s in a 0.05m pipe: Re = (1.5 × 0.05)/1.004×10⁻⁶ = 74,701 (Turbulent).'
  },
  {
    id: 'EQ-DAR-01',
    name: 'Darcy-Weisbach Equation for Friction Head Loss',
    category: 'Pipe Flow',
    formula: 'h_f = f · (L / D) · (V² / 2g)',
    latex: 'h_f = f \\frac{L}{D} \\frac{V^2}{2g}',
    description: 'Calculates the continuous head loss caused by viscous shear friction against pipe walls.',
    variables: [
      { symbol: 'h_f', name: 'Friction Head Loss', siUnit: 'm', usUnit: 'ft', description: 'Loss of piezometric head over length L' },
      { symbol: 'f', name: 'Darcy Friction Factor', siUnit: 'dimensionless', usUnit: 'dimensionless', description: 'Dimensionless friction coefficient' },
      { symbol: 'L', name: 'Pipe Length', siUnit: 'm', usUnit: 'ft', description: 'Total straight length of conduit' },
      { symbol: 'D', name: 'Internal Diameter', siUnit: 'm', usUnit: 'ft', description: 'Inside flow diameter' },
      { symbol: 'V', name: 'Flow Velocity', siUnit: 'm/s', usUnit: 'ft/s', description: 'Average bulk velocity' },
    ],
    assumptions: ['Circular cross-section', 'Fully developed steady pipe flow', 'Constant roughness along length'],
    applicableRange: 'Universal across laminar, transitional, and turbulent regimes with appropriate f',
    engineeringSignificance: 'The gold standard equation for civil, mechanical, and chemical piping hydraulics design.',
    exampleProblem: 'A 500m pipe with D=0.2m, f=0.02, V=2 m/s has hf = 0.02 × (500/0.2) × (4 / 19.62) = 10.19 m.'
  },
  {
    id: 'EQ-COL-01',
    name: 'Colebrook-White Equation',
    category: 'Pipe Flow',
    formula: '1 / √f = -2 · log₁₀[ (ε/D)/3.7 + 2.51 / (Re · √f) ]',
    latex: '\\frac{1}{\\sqrt{f}} = -2 \\log_{10}\\left( \\frac{\\varepsilon/D}{3.7} + \\frac{2.51}{Re \\sqrt{f}} \\right)',
    description: 'Implicit transcendental equation for Darcy friction factor in transitional and rough turbulent pipe flow.',
    variables: [
      { symbol: 'f', name: 'Darcy Friction Factor', siUnit: 'dimensionless', usUnit: 'dimensionless', description: 'Friction factor' },
      { symbol: 'ε/D', name: 'Relative Roughness', siUnit: 'dimensionless', usUnit: 'dimensionless', description: 'Wall roughness height divided by diameter' },
      { symbol: 'Re', name: 'Reynolds Number', siUnit: 'dimensionless', usUnit: 'dimensionless', description: 'Flow Reynolds number' },
    ],
    assumptions: ['Commercial pipe surfaces with random sand-grain equivalent roughness', 'Turbulent regime (Re > 4000)'],
    applicableRange: 'Re > 4000 and 0 ≤ ε/D ≤ 0.05',
    engineeringSignificance: 'The theoretical mathematical basis behind the entire turbulent portion of the Moody Diagram.',
    exampleProblem: 'For Re = 100,000 and ε/D = 0.001, iterative solution yields f ≈ 0.0222.'
  },
  {
    id: 'EQ-MAN-01',
    name: 'Manning Equation for Open Channel Uniform Flow',
    category: 'Open Channel',
    formula: 'Q = (1/n) · A · R_h^(2/3) · S₀^(1/2)',
    latex: 'Q = \\frac{1}{n} A R_h^{2/3} S_0^{1/2} \\quad \\text{(SI Units)}',
    description: 'Empirical formula relating discharge to channel geometry, bed slope, and boundary roughness.',
    variables: [
      { symbol: 'Q', name: 'Channel Discharge', siUnit: 'm³/s', usUnit: 'cfs (using 1.486/n)', description: 'Flow rate in channel' },
      { symbol: 'n', name: 'Manning Roughness Coefficient', siUnit: 's/m^(1/3)', usUnit: 's/ft^(1/3)', description: 'Surface roughness (e.g. 0.013 concrete, 0.035 natural river)' },
      { symbol: 'A', name: 'Cross-Sectional Area', siUnit: 'm²', usUnit: 'ft²', description: 'Wetted cross section area' },
      { symbol: 'R_h', name: 'Hydraulic Radius', siUnit: 'm', usUnit: 'ft', description: 'A / Wetted Perimeter P' },
      { symbol: 'S₀', name: 'Bed Slope', siUnit: 'm/m', usUnit: 'ft/ft', description: 'Channel bottom longitudinal gradient' },
    ],
    assumptions: ['Steady uniform flow (normal depth yn)', 'Prismatic channel', 'Gravity-driven free surface flow'],
    applicableRange: 'Canals, storm sewers, spillways, irrigation flumes, and natural rivers',
    engineeringSignificance: 'Fundamental tool for civil drainage design, culvert sizing, flood hazard mapping, and canal engineering.',
    exampleProblem: 'A rectangular concrete channel (n=0.013) with b=3m, y=1m, S₀=0.001 has A=3, P=5, Rh=0.6: Q = (1/0.013)×3×(0.6)^(2/3)×√(0.001) = 5.18 m³/s.'
  },
  {
    id: 'EQ-FRO-01',
    name: 'Froude Number',
    category: 'Dimensionless',
    formula: 'Fr = V / √(g · D_h)',
    latex: 'Fr = \\frac{V}{\\sqrt{g D_h}} = \\frac{V}{\\sqrt{g (A/T)}}',
    description: 'Ratio of inertial forces to gravitational forces in free-surface flows.',
    variables: [
      { symbol: 'Fr', name: 'Froude Number', siUnit: 'dimensionless', usUnit: 'dimensionless', description: 'Flow regime indicator' },
      { symbol: 'V', name: 'Mean Velocity', siUnit: 'm/s', usUnit: 'ft/s', description: 'Average open channel velocity' },
      { symbol: 'g', name: 'Gravitational Acceleration', siUnit: '9.80665 m/s²', usUnit: '32.174 ft/s²', description: 'Earth gravity' },
      { symbol: 'D_h', name: 'Hydraulic Depth', siUnit: 'm', usUnit: 'ft', description: 'Flow area A / Top free surface width T' },
    ],
    assumptions: ['Free surface gravity flow', 'Small surface wave speed c = √(g D_h)'],
    applicableRange: 'Fr < 1: Subcritical (tranquil, wave travels upstream); Fr = 1: Critical; Fr > 1: Supercritical (rapid, shooting flow)',
    engineeringSignificance: 'Controls wave propagation, choke points, hydraulic drop, and supercritical transition into hydraulic jumps.',
    exampleProblem: 'Water at y=0.5m moving at 4 m/s in a rectangular flume has Fr = 4 / √(9.81 × 0.5) = 1.81 (Supercritical).'
  },
  {
    id: 'EQ-BEL-01',
    name: 'Bélanger Hydraulic Jump Momentum Equation',
    category: 'Open Channel',
    formula: 'y₂ / y₁ = (1/2) · [ √(1 + 8 · Fr₁²) - 1 ]',
    latex: '\\frac{y_2}{y_1} = \\frac{1}{2} \\left( \\sqrt{1 + 8 Fr_1^2} - 1 \\right)',
    description: 'Conjugate / sequent depth relationship across a stationary hydraulic jump in a rectangular flume.',
    variables: [
      { symbol: 'y₁', name: 'Initial Supercritical Depth', siUnit: 'm', usUnit: 'ft', description: 'Upstream shallow fast depth' },
      { symbol: 'y₂', name: 'Sequent Subcritical Depth', siUnit: 'm', usUnit: 'ft', description: 'Downstream deep tranquil depth' },
      { symbol: 'Fr₁', name: 'Upstream Froude Number', siUnit: 'dimensionless', usUnit: 'dimensionless', description: 'Froude number before jump (> 1.0)' },
    ],
    assumptions: ['Rectangular channel cross-section', 'Horizontal or mild slope bed', 'Negligible boundary friction over short jump length'],
    applicableRange: 'Fr₁ > 1.0',
    engineeringSignificance: 'Used in dam spillway stilling basins to dissipate destructive kinetic energy and prevent downstream riverbed erosion.',
    exampleProblem: 'For y₁ = 0.4 m and Fr₁ = 3.0: y₂ = 0.2 × (√(1 + 72) - 1) = 0.2 × (8.544 - 1) = 1.51 m.'
  },
  {
    id: 'EQ-VEN-01',
    name: 'Venturi Meter Discharge Equation',
    category: 'Flow Measurement',
    formula: 'Q = C_d · A₂ · √[ (2g · Δh) / (1 - (A₂/A₁)² ) ]',
    latex: 'Q = C_d A_2 \\sqrt{ \\frac{2g \\Delta h}{1 - (A_2/A_1)^2} }',
    description: 'Measures flow rate by inducing a pressure drop through a converging nozzle and measuring differential head.',
    variables: [
      { symbol: 'Q', name: 'Actual Flow Rate', siUnit: 'm³/s', usUnit: 'gpm or cfs', description: 'Discharge through meter' },
      { symbol: 'C_d', name: 'Discharge Coefficient', siUnit: '0.96 to 0.99', usUnit: '0.96 to 0.99', description: 'Accounts for viscous boundary layer' },
      { symbol: 'A₁', name: 'Inlet Area', siUnit: 'm²', usUnit: 'ft²', description: 'Upstream pipe area' },
      { symbol: 'A₂', name: 'Throat Area', siUnit: 'm²', usUnit: 'ft²', description: 'Constricted throat area' },
      { symbol: 'Δh', name: 'Differential Piezometric Head', siUnit: 'm', usUnit: 'ft', description: '(P₁-P₂)/γ + (z₁-z₂)' },
    ],
    assumptions: ['Steady flow', 'Incompressible fluid', 'Axisymmetric streamline flow'],
    applicableRange: 'Closed pipes with high Reynolds number (> 10⁵)',
    engineeringSignificance: 'Highly accurate with low permanent head loss due to gradual downstream diffuser recovery cone.',
    exampleProblem: 'A 200mm × 100mm Venturi (Cd=0.98) with Δh = 1.5 m of water has Q = 0.98 × 0.00785 × √(2×9.81×1.5 / (1 - 0.0625)) = 0.0431 m³/s.'
  },
  {
    id: 'EQ-PMP-01',
    name: 'Centrifugal Pump Hydraulic Power & Affinity Laws',
    category: 'Turbomachinery',
    formula: 'P = (γ · Q · H) / 1000, \\quad Q₂/Q₁ = N₂/N₁, \\quad H₂/H₁ = (N₂/N₁)²',
    latex: 'P_{\\text{hyd}} = \\frac{\\rho g Q H}{1000} \\text{ (kW)}, \\quad P_{\\text{brake}} = \\frac{P_{\\text{hyd}}}{\\eta}',
    description: 'Calculates the rate of mechanical energy transferred to liquid, and scales performance with rotational speed N.',
    variables: [
      { symbol: 'P_hyd', name: 'Water Power Output', siUnit: 'kW', usUnit: 'Water Horsepower (whp)', description: 'Hydraulic energy delivered to fluid' },
      { symbol: 'Q', name: 'Pump Flow Rate', siUnit: 'm³/s', usUnit: 'gpm', description: 'Discharge at operating point' },
      { symbol: 'H', name: 'Total Dynamic Head', siUnit: 'm', usUnit: 'ft', description: 'Net head added across pump' },
      { symbol: 'η', name: 'Pump Efficiency', siUnit: '0.0 to 1.0 (or %)', usUnit: '%', description: 'Mechanical to hydraulic conversion ratio' },
      { symbol: 'N', name: 'Rotational Impeller Speed', siUnit: 'rpm', usUnit: 'rpm', description: 'Revolutions per minute' },
    ],
    assumptions: ['Centrifugal impeller kinematics', 'Incompressible liquid'],
    applicableRange: 'Pumps, water supply boosting stations, chemical delivery loops',
    engineeringSignificance: 'Enables motor sizing, energy cost estimation, and variable frequency drive (VFD) optimization.',
    exampleProblem: 'Pumping 0.05 m³/s against 40m head of water at 80% efficiency requires P_brake = (9807 × 0.05 × 40)/(1000 × 0.8) = 24.52 kW.'
  },
];
