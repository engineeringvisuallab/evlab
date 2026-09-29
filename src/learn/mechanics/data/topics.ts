import { TopicDefinition } from '../types/mechanics';

export const TOPICS: TopicDefinition[] = [
  // ===================== STATICS =====================
  {
    id: 'vectors',
    title: 'Force Systems & Vector Mechanics',
    category: 'Statics',
    subcategory: 'Fundamentals of Force',
    badge: 'Core Statics',
    iconName: 'Compass',
    summary: 'Analyze concurrent 2D force systems, Cartesian component resolution, vector addition polygon, and resultant line of action.',
    assumptions: [
      'Particles act at a concurrent geometric point without rotational dimensions.',
      'Forces obey the parallelogram law of vector addition.',
      'Rigid body is in a continuous Euclidean coordinate space.',
    ],
    governingEquations: [
      {
        name: 'Cartesian Resolution',
        latex: 'F_x = F \\cos\\theta, \\quad F_y = F \\sin\\theta',
        description: 'Resolves any 2D vector into perpendicular orthogonal Cartesian components.',
        terms: [
          { symbol: 'F', meaning: 'Vector magnitude', unit: 'N' },
          { symbol: 'θ', meaning: 'Direction angle from +X axis', unit: 'deg' },
        ],
      },
      {
        name: 'Resultant Vector',
        latex: 'R = \\sqrt{(\\sum F_x)^2 + (\\sum F_y)^2}, \\quad \\theta_R = \\operatorname{atan2}(\\sum F_y, \\sum F_x)',
        description: 'Computes magnitude and direction of the single equivalent force replacing concurrent force systems.',
        terms: [
          { symbol: 'R', meaning: 'Resultant force magnitude', unit: 'N' },
          { symbol: 'θ_R', meaning: 'Resultant direction angle', unit: 'deg' },
        ],
      },
    ],
    realWorldApplications: [
      'Mooring line tension on offshore drilling platforms.',
      'Tower crane guy wire structural equilibrium.',
      'Aeronautical wing strut vector force distribution.',
    ],
    limitations: [
      'Does not compute rotational couples (forces must be concurrent).',
      'Assumes linear elastic response with zero structural compliance.',
    ],
    defaultParameters: {
      f1Mag: 150,
      f1Angle: 30,
      f2Mag: 200,
      f2Angle: 120,
      f3Mag: 100,
      f3Angle: 240,
    },
    parameterConfigs: [
      { id: 'f1Mag', name: 'Force F₁ Magnitude', symbol: 'F₁', unit: 'N', min: 0, max: 500, step: 10, defaultValue: 150, description: 'Magnitude of first concurrent vector' },
      { id: 'f1Angle', name: 'Force F₁ Angle', symbol: 'θ₁', unit: '°', min: 0, max: 360, step: 1, defaultValue: 30, description: 'Direction angle of F₁ relative to positive X-axis' },
      { id: 'f2Mag', name: 'Force F₂ Magnitude', symbol: 'F₂', unit: 'N', min: 0, max: 500, step: 10, defaultValue: 200, description: 'Magnitude of second concurrent vector' },
      { id: 'f2Angle', name: 'Force F₂ Angle', symbol: 'θ₂', unit: '°', min: 0, max: 360, step: 1, defaultValue: 120, description: 'Direction angle of F₂ relative to positive X-axis' },
      { id: 'f3Mag', name: 'Force F₃ Magnitude', symbol: 'F₃', unit: 'N', min: 0, max: 500, step: 10, defaultValue: 100, description: 'Magnitude of third concurrent vector' },
      { id: 'f3Angle', name: 'Force F₃ Angle', symbol: 'θ₃', unit: '°', min: 0, max: 360, step: 1, defaultValue: 240, description: 'Direction angle of F₃ relative to positive X-axis' },
    ],
    presets: [
      {
        id: 'p1',
        title: 'Symmetrical Guy Wires (Hibbeler Ex 2.1)',
        source: 'Engineering Mechanics: Statics, 14th Ed.',
        description: 'Equal magnitude forces pulling at balanced opposing angles.',
        parameters: { f1Mag: 250, f1Angle: 45, f2Mag: 250, f2Angle: 135, f3Mag: 0, f3Angle: 0 },
      },
      {
        id: 'p2',
        title: 'Tri-Directional Anchor Ring (Meriam & Kraige)',
        source: 'Engineering Mechanics, Vol 1: Statics',
        description: 'Three concurrent tension cables anchoring a marine buoy.',
        parameters: { f1Mag: 180, f1Angle: 25, f2Mag: 220, f2Angle: 110, f3Mag: 150, f3Angle: 235 },
      },
    ],
  },
  {
    id: 'fbd',
    title: 'Free Body Diagrams (FBD Studio)',
    category: 'Statics',
    subcategory: 'Vector Mechanics',
    badge: 'Essential Tool',
    iconName: 'Maximize2',
    summary: 'Interactive Free Body Diagram laboratory: apply weights, contact forces, friction, tension, and support reactions to test static equilibrium.',
    assumptions: [
      'The body is isolated completely from surroundings with all interaction forces shown.',
      'Gravity acts as a single resultant weight through the center of gravity.',
      'Surface contact generates perpendicular normal forces and tangential friction.',
    ],
    governingEquations: [
      {
        name: 'Equilibrium Equations of 2D Statics',
        latex: '\\sum F_x = 0, \\quad \\sum F_y = 0, \\quad \\sum M_O = 0',
        description: 'Necessary and sufficient conditions for absolute mechanical equilibrium of a rigid body.',
        terms: [
          { symbol: 'ΣFx', meaning: 'Net horizontal force', unit: 'N' },
          { symbol: 'ΣFy', meaning: 'Net vertical force', unit: 'N' },
          { symbol: 'ΣMO', meaning: 'Net moment about reference origin', unit: 'N·m' },
        ],
      },
    ],
    realWorldApplications: [
      'Structural foundation design under combined shear and overturning moment.',
      'Vehicle rollover and stability boundary calculation.',
      'Robotic arm end-effector force balancing.',
    ],
    limitations: [
      'Assumes rigid unyielding body geometry without elastic deflection.',
    ],
    defaultParameters: {
      bodyMass: 20,
      appliedForce: 150,
      appliedAngle: 35,
      appliedX: 1.2,
      appliedY: 0.5,
      normalForce: 196.2,
      frictionForce: 122.87,
    },
    parameterConfigs: [
      { id: 'bodyMass', name: 'Body Mass', symbol: 'm', unit: 'kg', min: 1, max: 100, step: 1, defaultValue: 20, description: 'Mass of the isolated rigid body' },
      { id: 'appliedForce', name: 'Applied Force', symbol: 'F_app', unit: 'N', min: 0, max: 500, step: 10, defaultValue: 150, description: 'Magnitude of external pulling force' },
      { id: 'appliedAngle', name: 'Applied Force Angle', symbol: 'θ', unit: '°', min: 0, max: 360, step: 1, defaultValue: 35, description: 'Angle of applied force vector' },
      { id: 'appliedX', name: 'Attachment Point X', symbol: 'x_F', unit: 'm', min: -2, max: 2, step: 0.1, defaultValue: 1.2, description: 'Horizontal coordinate of force application' },
      { id: 'appliedY', name: 'Attachment Point Y', symbol: 'y_F', unit: 'm', min: -2, max: 2, step: 0.1, defaultValue: 0.5, description: 'Vertical coordinate of force application' },
    ],
    presets: [
      {
        id: 'fbd_eq',
        title: 'Perfect 3-Force Equilibrium',
        source: 'Beer & Johnston Statics Ex 4.6',
        description: 'Tension, weight, and smooth inclined contact in perfect static balance.',
        parameters: { bodyMass: 10, appliedForce: 98.1, appliedAngle: 90, appliedX: 0, appliedY: 0 },
      },
    ],
  },
  {
    id: 'moment',
    title: 'Moment of Force & Couples',
    category: 'Statics',
    subcategory: 'Rotational Statics',
    badge: 'Torque Physics',
    iconName: 'RotateCw',
    summary: 'Investigate the rotational turning effect of forces, perpendicular moment arms, Varignon’s Theorem, and pure couple moments.',
    assumptions: [
      'The pivot axis is rigid and frictionless.',
      'Line of action of force extends indefinitely in both directions (Principle of Transmissibility).',
    ],
    governingEquations: [
      {
        name: 'Moment of a Force (Scalar & Vector)',
        latex: 'M_O = F \\cdot d_\\perp = \\mathbf{r} \\times \\mathbf{F} = (r_x F_y - r_y F_x) \\mathbf{k}',
        description: 'Computes torque capacity of a force around a reference axis.',
        terms: [
          { symbol: 'MO', meaning: 'Moment about pivot O', unit: 'N·m' },
          { symbol: 'd_perp', meaning: 'Perpendicular lever arm distance', unit: 'm' },
          { symbol: 'r', meaning: 'Position vector from pivot to force point', unit: 'm' },
        ],
      },
    ],
    realWorldApplications: [
      'Wrench torque specifications on critical aerospace bolts.',
      'Leverage in hydraulic excavators and crane boom lifting.',
      'Steering knuckle moment calculation in automotive suspensions.',
    ],
    limitations: [
      'Planar 2D moment only (z-axis perpendicular rotation).',
    ],
    defaultParameters: {
      forceMag: 120,
      forceAngleDeg: 60,
      leverLength: 2.5,
      applicationPosition: 2.0,
    },
    parameterConfigs: [
      { id: 'forceMag', name: 'Force Magnitude', symbol: 'F', unit: 'N', min: 0, max: 500, step: 10, defaultValue: 120, description: 'Magnitude of force applied on the lever' },
      { id: 'forceAngleDeg', name: 'Force Angle', symbol: 'θ', unit: '°', min: 0, max: 180, step: 1, defaultValue: 60, description: 'Angle between force line of action and lever arm' },
      { id: 'leverLength', name: 'Total Lever Length', symbol: 'L', unit: 'm', min: 0.5, max: 5, step: 0.1, defaultValue: 2.5, description: 'Physical length of the rigid lever bar' },
      { id: 'applicationPosition', name: 'Force Application Point', symbol: 'd', unit: 'm', min: 0.1, max: 5, step: 0.1, defaultValue: 2.0, description: 'Distance from pivot to force attachment' },
    ],
    presets: [
      {
        id: 'm_max',
        title: 'Maximum Leverage (Perpendicular Force)',
        source: 'Classical Mechanics Standard',
        description: 'Force applied at 90° to achieve 100% mechanical efficiency.',
        parameters: { forceMag: 150, forceAngleDeg: 90, leverLength: 3.0, applicationPosition: 3.0 },
      },
    ],
  },
  {
    id: 'equilibrium',
    title: 'Equilibrium of Beams & Supports',
    category: 'Statics',
    subcategory: 'Support Reactions',
    badge: 'Structures',
    iconName: 'Anchor',
    summary: 'Solve support reactions (Pin, Roller, Fixed) for statically determinate beams subjected to point loads, UDL, and overhangs.',
    assumptions: [
      'Supports provide idealized boundary constraints: Pin (Rx, Ry), Roller (Ry), Fixed (Rx, Ry, M).',
      'The beam remains linear without gross plastic deformation.',
    ],
    governingEquations: [
      {
        name: 'Planar Equilibrium Equations',
        latex: '\\sum F_x = 0, \\quad \\sum F_y = R_A + R_B - \\sum P_i = 0, \\quad \\sum M_A = 0',
        description: 'Establishes static determinacy and solves for support boundary reactions.',
        terms: [
          { symbol: 'RA, RB', meaning: 'Support vertical reactions', unit: 'N' },
          { symbol: 'MA', meaning: 'Fixed support clamping moment', unit: 'N·m' },
        ],
      },
    ],
    realWorldApplications: [
      'Bridge pier and abutment load bearing design.',
      'Building girder support reactions during construction.',
      'Gantry crane rail support reactions.',
    ],
    limitations: [
      'Statically determinate single-span configurations (3 unknowns).',
    ],
    defaultParameters: {
      spanL: 6.0,
      pointLoadP: 400,
      pointLoadPos: 2.0,
      udlW: 50,
      supportBPos: 6.0,
    },
    parameterConfigs: [
      { id: 'spanL', name: 'Beam Span Length', symbol: 'L', unit: 'm', min: 2, max: 12, step: 0.5, defaultValue: 6.0, description: 'Total length of the beam span' },
      { id: 'pointLoadP', name: 'Concentrated Load', symbol: 'P', unit: 'N', min: 0, max: 2000, step: 50, defaultValue: 400, description: 'Downward point force magnitude' },
      { id: 'pointLoadPos', name: 'Load Position', symbol: 'x_P', unit: 'm', min: 0, max: 12, step: 0.2, defaultValue: 2.0, description: 'Distance of point load from Left Support A' },
      { id: 'udlW', name: 'Uniform Distributed Load', symbol: 'w', unit: 'N/m', min: 0, max: 300, step: 10, defaultValue: 50, description: 'Distributed load across entire beam' },
      { id: 'supportBPos', name: 'Right Support B Position', symbol: 'x_B', unit: 'm', min: 2, max: 12, step: 0.5, defaultValue: 6.0, description: 'Location of roller support B' },
    ],
    presets: [
      {
        id: 'eq_mid',
        title: 'Center Point Load (Hibbeler Ex 5.4)',
        source: 'Engineering Mechanics: Statics',
        description: 'Simply supported beam with symmetrical center load.',
        parameters: { spanL: 6.0, pointLoadP: 600, pointLoadPos: 3.0, udlW: 0, supportBPos: 6.0 },
      },
    ],
  },
  {
    id: 'friction',
    title: 'Coulomb Dry Friction & Impending Motion',
    category: 'Statics',
    subcategory: 'Contact Mechanics',
    badge: 'Physics Lab',
    iconName: 'Layers',
    summary: 'Observe the three states of dry contact: Static Equilibrium, Impending Motion threshold, and Dynamic Sliding Acceleration on inclined planes.',
    assumptions: [
      'Coulomb dry friction model: static friction is self-adjusting up to μs * N.',
      'Once motion starts, kinetic friction μk * N resists motion tangentially.',
      'Rigid contact surfaces with uniform pressure distribution.',
    ],
    governingEquations: [
      {
        name: 'Limiting Static & Kinetic Friction',
        latex: 'f_{s,\\max} = \\mu_s N, \\quad f_k = \\mu_k N, \\quad N = m g \\cos\\theta',
        description: 'Defines the boundary between static rest and dynamic sliding acceleration.',
        terms: [
          { symbol: 'μs', meaning: 'Coefficient of static friction', unit: '' },
          { symbol: 'μk', meaning: 'Coefficient of kinetic friction', unit: '' },
          { symbol: 'N', meaning: 'Normal contact force', unit: 'N' },
        ],
      },
      {
        name: 'Sliding Acceleration',
        latex: 'a = \\frac{F_{app} - m g \\sin\\theta - \\mu_k m g \\cos\\theta}{m}',
        description: 'Dynamic acceleration when driving force exceeds static threshold.',
        terms: [
          { symbol: 'a', meaning: 'Linear sliding acceleration', unit: 'm/s²' },
        ],
      },
    ],
    realWorldApplications: [
      'Automotive anti-lock braking system (ABS) traction limits.',
      'Conveyor belt angle of repose for aggregate transport.',
      'Wedge and friction clutch power transmission.',
    ],
    limitations: [
      'Neglects velocity-dependent friction variations (Stribeck effect).',
    ],
    defaultParameters: {
      mass: 10,
      appliedForce: 45,
      inclineAngleDeg: 15,
      muS: 0.50,
      muK: 0.35,
    },
    parameterConfigs: [
      { id: 'mass', name: 'Block Mass', symbol: 'm', unit: 'kg', min: 1, max: 50, step: 1, defaultValue: 10, description: 'Mass of the contact block' },
      { id: 'appliedForce', name: 'Applied Pushing Force', symbol: 'F_app', unit: 'N', min: 0, max: 200, step: 5, defaultValue: 45, description: 'Force applied parallel to plane' },
      { id: 'inclineAngleDeg', name: 'Incline Angle', symbol: 'θ', unit: '°', min: 0, max: 60, step: 1, defaultValue: 15, description: 'Surface tilt angle with horizontal' },
      { id: 'muS', name: 'Static Friction Coefficient', symbol: 'μ_s', unit: '', min: 0.1, max: 1.0, step: 0.05, defaultValue: 0.50, description: 'Coefficient of static friction' },
      { id: 'muK', name: 'Kinetic Friction Coefficient', symbol: 'μ_k', unit: '', min: 0.05, max: 0.9, step: 0.05, defaultValue: 0.35, description: 'Coefficient of sliding kinetic friction' },
    ],
    presets: [
      {
        id: 'fric_impending',
        title: 'Impending Motion Critical Threshold',
        source: 'Classical Mechanics Standard',
        description: 'Applied force exactly balances maximum static friction.',
        parameters: { mass: 10, appliedForce: 47.38, inclineAngleDeg: 0, muS: 0.483, muK: 0.35 },
      },
    ],
  },
  {
    id: 'centroid',
    title: 'Centroid & Centre of Gravity',
    category: 'Statics',
    subcategory: 'Geometric Properties',
    badge: 'Section Analysis',
    iconName: 'Crosshair',
    summary: 'Calculate composite section centroids (Cx, Cy), first moments of area (Qx, Qy), and centroidal second moment of area (Ixx, Iyy).',
    assumptions: [
      'Homogeneous isotropic material with uniform density and thickness.',
      'Centroid coincides with the center of gravity for uniform gravitational field.',
    ],
    governingEquations: [
      {
        name: 'Composite Centroid Formula',
        latex: '\\bar{X} = \\frac{\\sum A_i \\bar{x}_i}{\\sum A_i}, \\quad \\bar{Y} = \\frac{\\sum A_i \\bar{y}_i}{\\sum A_i}',
        description: 'Calculates the center of area for composite shapes with solid regions and cutouts.',
        terms: [
          { symbol: 'Ai', meaning: 'Area of i-th sub-element', unit: 'm²' },
          { symbol: 'x̄i, ȳi', meaning: 'Centroid of i-th element', unit: 'm' },
        ],
      },
    ],
    realWorldApplications: [
      'Structural steel I-beam, T-beam, and channel section design.',
      'Ship hull metacentric height and marine stability.',
      'Aircraft neutral point and aerodynamic pitch stability.',
    ],
    limitations: [
      'Planar 2D cross-sectional geometry.',
    ],
    defaultParameters: {
      flangeWidth: 300, // mm
      flangeThickness: 25, // mm
      webHeight: 350, // mm
      webThickness: 20, // mm
    },
    parameterConfigs: [
      { id: 'flangeWidth', name: 'Flange Width', symbol: 'b_f', unit: 'mm', min: 100, max: 600, step: 10, defaultValue: 300, description: 'Top flange horizontal dimension' },
      { id: 'flangeThickness', name: 'Flange Thickness', symbol: 't_f', unit: 'mm', min: 10, max: 80, step: 5, defaultValue: 25, description: 'Top flange thickness' },
      { id: 'webHeight', name: 'Web Height', symbol: 'h_w', unit: 'mm', min: 100, max: 800, step: 10, defaultValue: 350, description: 'Vertical web plate height' },
      { id: 'webThickness', name: 'Web Thickness', symbol: 't_w', unit: 'mm', min: 10, max: 60, step: 5, defaultValue: 20, description: 'Vertical web plate thickness' },
    ],
    presets: [
      {
        id: 't_sec',
        title: 'Standard T-Section Structural Girder',
        source: 'AISC Steel Manual',
        description: 'T-Beam with flange width 300 mm and web height 350 mm.',
        parameters: { flangeWidth: 300, flangeThickness: 25, webHeight: 350, webThickness: 20 },
      },
    ],
  },
  {
    id: 'beams',
    title: 'Beam Shear Force & Bending Moment (SFD & BMD)',
    category: 'Structural Mechanics',
    subcategory: 'Internal Forces',
    badge: 'Structural Core',
    iconName: 'Activity',
    summary: 'Generate live Shear Force Diagrams (SFD), Bending Moment Diagrams (BMD), and elastic deflection curves with interactive point inspection.',
    assumptions: [
      'Euler-Bernoulli beam theory: plane sections remain plane and perpendicular to neutral axis.',
      'Small deflections, linear elastic material response (Hooke’s Law).',
      'Homogeneous flexural rigidity EI along the span.',
    ],
    governingEquations: [
      {
        name: 'Differential Relations of Beam Mechanics',
        latex: '\\frac{dV}{dx} = -w(x), \\quad \\frac{dM}{dx} = V(x), \\quad E I \\frac{d^2 v}{dx^2} = M(x)',
        description: 'Fundamental differential calculus connecting load w(x), shear V(x), moment M(x), and deflection v(x).',
        terms: [
          { symbol: 'V(x)', meaning: 'Internal shear force at station x', unit: 'N' },
          { symbol: 'M(x)', meaning: 'Internal bending moment at station x', unit: 'N·m' },
          { symbol: 'v(x)', meaning: 'Elastic transverse deflection', unit: 'mm' },
        ],
      },
    ],
    realWorldApplications: [
      'Bridge deck girder flexural and shear reinforcement design.',
      'Building roof beam deflection limit verification (L/360).',
      'Aircraft wing spar internal bending moment calculation.',
    ],
    limitations: [
      'Prismatic beam with constant cross-section and homogeneous Young’s Modulus.',
    ],
    defaultParameters: {
      beamLength: 6.0,
      loadP1: 500,
      loadP1Pos: 2.0,
      loadP2: 300,
      loadP2Pos: 4.5,
      udlW: 40,
      eGpa: 200,
      iCm4: 1500,
    },
    parameterConfigs: [
      { id: 'beamLength', name: 'Beam Span Length', symbol: 'L', unit: 'm', min: 2, max: 12, step: 0.5, defaultValue: 6.0, description: 'Total beam span' },
      { id: 'loadP1', name: 'Point Load P₁', symbol: 'P₁', unit: 'N', min: 0, max: 2000, step: 50, defaultValue: 500, description: 'First concentrated load magnitude' },
      { id: 'loadP1Pos', name: 'P₁ Position', symbol: 'x₁', unit: 'm', min: 0, max: 12, step: 0.2, defaultValue: 2.0, description: 'Location of P₁ from left support' },
      { id: 'loadP2', name: 'Point Load P₂', symbol: 'P₂', unit: 'N', min: 0, max: 2000, step: 50, defaultValue: 300, description: 'Second concentrated load magnitude' },
      { id: 'loadP2Pos', name: 'P₂ Position', symbol: 'x₂', unit: 'm', min: 0, max: 12, step: 0.2, defaultValue: 4.5, description: 'Location of P₂ from left support' },
      { id: 'udlW', name: 'Distributed Load w', symbol: 'w', unit: 'N/m', min: 0, max: 200, step: 10, defaultValue: 40, description: 'Uniform load across span' },
    ],
    presets: [
      {
        id: 'sfd_center',
        title: 'Mid-Span Concentrated Load (Classic Benchmark)',
        source: 'Beer & Johnston Mechanics of Materials',
        description: 'Single center point load generating triangular BMD and stepped SFD.',
        parameters: { beamLength: 6.0, loadP1: 800, loadP1Pos: 3.0, loadP2: 0, loadP2Pos: 0, udlW: 0, eGpa: 200, iCm4: 1500 },
      },
    ],
  },
  {
    id: 'trusses',
    title: '2D Truss Analysis (Method of Joints)',
    category: 'Structural Mechanics',
    subcategory: 'Truss Systems',
    badge: 'FEA Introduction',
    iconName: 'Grid',
    summary: 'Analyze 2D planar bridge and roof trusses: calculate pin joint equilibrium, tension/compression member axial forces, and zero-force members.',
    assumptions: [
      'All members are straight, slender two-force members connected by frictionless pins at ends.',
      'Loads and reactions are applied only at node joints (no member transverse bending).',
      'Self-weight of members is negligible compared to applied external joint loads.',
    ],
    governingEquations: [
      {
        name: 'Joint Equilibrium (Method of Joints)',
        latex: '\\sum F_x = 0, \\quad \\sum F_y = 0 \\quad \\text{at every individual joint}',
        description: 'Solves for unknown internal member forces F_ij.',
        terms: [
          { symbol: 'F_ij > 0', meaning: 'Tension (pulling away from joint)', unit: 'N' },
          { symbol: 'F_ij < 0', meaning: 'Compression (pushing toward joint)', unit: 'N' },
        ],
      },
    ],
    realWorldApplications: [
      'Railway bridge Pratt and Warren steel trusses.',
      'Roof timber and steel pitched trusses.',
      'Tower crane boom space trusses.',
    ],
    limitations: [
      'Planar 2D pin-jointed configurations (b + r = 2j for determinacy).',
    ],
    defaultParameters: {
      trussSpan: 6.0,
      trussHeight: 2.5,
      jointLoadN: 1200,
    },
    parameterConfigs: [
      { id: 'trussSpan', name: 'Total Truss Span', symbol: 'L', unit: 'm', min: 3, max: 12, step: 0.5, defaultValue: 6.0, description: 'Horizontal bridge span' },
      { id: 'trussHeight', name: 'Truss Height', symbol: 'H', unit: 'm', min: 1.5, max: 6, step: 0.5, defaultValue: 2.5, description: 'Vertical height of truss crown' },
      { id: 'jointLoadN', name: 'Bottom Joint Center Load', symbol: 'P', unit: 'N', min: 100, max: 5000, step: 100, defaultValue: 1200, description: 'Downward load at center joint' },
    ],
    presets: [
      {
        id: 'truss_classic',
        title: '5-Member Triangular Bridge Truss',
        source: 'Hibbeler Statics Ex 6.1',
        description: 'Standard Warren triangular truss under central bottom chord loading.',
        parameters: { trussSpan: 6.0, trussHeight: 2.5, jointLoadN: 1200 },
      },
    ],
  },

  // ===================== DYNAMICS =====================
  {
    id: 'kinematics',
    title: 'Rectilinear Kinematics (s-t, v-t, a-t)',
    category: 'Dynamics',
    subcategory: 'Particle Kinematics',
    badge: 'Motion Lab',
    iconName: 'PlayCircle',
    summary: 'Study 1D rectilinear particle motion with position s(t), velocity v(t), acceleration a(t), interactive timeline scrubber, and dynamic motion plots.',
    assumptions: [
      'Particle has zero physical dimensions (point mass).',
      'Motion is constrained to a 1D straight line.',
      'Constant acceleration over the simulated integration intervals.',
    ],
    governingEquations: [
      {
        name: 'Kinematic Equations of Constant Acceleration',
        latex: 'v(t) = v_0 + a t, \\quad s(t) = s_0 + v_0 t + \\frac{1}{2} a t^2, \\quad v^2 = v_0^2 + 2 a (s - s_0)',
        description: 'Fundamental differential calculus connecting displacement, velocity, and acceleration.',
        terms: [
          { symbol: 's(t)', meaning: 'Position at time t', unit: 'm' },
          { symbol: 'v(t)', meaning: 'Velocity at time t', unit: 'm/s' },
          { symbol: 'a', meaning: 'Linear acceleration', unit: 'm/s²' },
        ],
      },
    ],
    realWorldApplications: [
      'High-speed train braking distance and emergency stopping deceleration.',
      'Electric vehicle (EV) 0-100 km/h acceleration telemetry.',
      'Elevator vertical jerk and velocity profiling for passenger comfort.',
    ],
    limitations: [
      'Constant or piecewise constant acceleration profile.',
    ],
    defaultParameters: {
      s0: 0,
      v0: 10,
      accel: 2.5,
      simDuration: 6,
    },
    parameterConfigs: [
      { id: 's0', name: 'Initial Position', symbol: 's₀', unit: 'm', min: -50, max: 50, step: 1, defaultValue: 0, description: 'Starting position along the track' },
      { id: 'v0', name: 'Initial Velocity', symbol: 'v₀', unit: 'm/s', min: -30, max: 50, step: 1, defaultValue: 10, description: 'Starting velocity at t = 0 s' },
      { id: 'accel', name: 'Acceleration', symbol: 'a', unit: 'm/s²', min: -15, max: 15, step: 0.5, defaultValue: 2.5, description: 'Constant linear acceleration' },
      { id: 'simDuration', name: 'Simulation Duration', symbol: 'T', unit: 's', min: 2, max: 15, step: 1, defaultValue: 6, description: 'Total integration time window' },
    ],
    presets: [
      {
        id: 'kin_brake',
        title: 'Emergency Vehicle Braking Test',
        source: 'Automotive Dynamics Benchmark',
        description: 'Car traveling at 25 m/s (90 km/h) braking at -6 m/s².',
        parameters: { s0: 0, v0: 25, accel: -5.0, simDuration: 5 },
      },
    ],
  },
  {
    id: 'projectile',
    title: '2D Projectile Motion & Ballistics',
    category: 'Dynamics',
    subcategory: 'Curvilinear Motion',
    badge: 'Ballistics',
    iconName: 'Target',
    summary: 'Simulate 2D parabolic ballistic trajectories: decompose launch velocity into orthogonal components, observe apex height, flight time, and range.',
    assumptions: [
      'Uniform gravitational field g = 9.81 m/s² directed downward.',
      'Neglects aerodynamic air drag and Earth curvature (vacuum ballistic approximation).',
    ],
    governingEquations: [
      {
        name: 'Decoupled 2D Trajectory Equations',
        latex: 'x(t) = v_0 \\cos\\theta \\cdot t, \\quad y(t) = y_0 + v_0 \\sin\\theta \\cdot t - \\frac{1}{2} g t^2',
        description: 'Independent horizontal (constant velocity) and vertical (constant acceleration) motion.',
        terms: [
          { symbol: 'v0', meaning: 'Muzzle launch velocity', unit: 'm/s' },
          { symbol: 'θ', meaning: 'Launch elevation angle', unit: 'deg' },
          { symbol: 'R', meaning: 'Total horizontal range', unit: 'm' },
        ],
      },
    ],
    realWorldApplications: [
      'Artillery fire control and ballistic missile trajectory calculation.',
      'Sports engineering: basketball trajectory, golf drive aerodynamics.',
      'Planetary lander touchdown velocity vector control.',
    ],
    limitations: [
      'Vacuum parabolic model (air drag can be analyzed conceptually).',
    ],
    defaultParameters: {
      launchV0: 25,
      launchAngle: 45,
      launchY0: 2.0,
      gravityG: 9.81,
    },
    parameterConfigs: [
      { id: 'launchV0', name: 'Launch Speed', symbol: 'v₀', unit: 'm/s', min: 5, max: 60, step: 1, defaultValue: 25, description: 'Initial launch speed' },
      { id: 'launchAngle', name: 'Launch Elevation Angle', symbol: 'θ', unit: '°', min: 5, max: 85, step: 1, defaultValue: 45, description: 'Angle of elevation from horizontal' },
      { id: 'launchY0', name: 'Launch Platform Height', symbol: 'y₀', unit: 'm', min: 0, max: 20, step: 0.5, defaultValue: 2.0, description: 'Elevation of launcher above ground' },
      { id: 'gravityG', name: 'Gravitational Acceleration', symbol: 'g', unit: 'm/s²', min: 1.62, max: 25.0, step: 0.1, defaultValue: 9.81, description: 'Planetary gravity (9.81 Earth, 1.62 Moon, 3.71 Mars)' },
    ],
    presets: [
      {
        id: 'proj_optimal',
        title: 'Theoretical Maximum Range (45° Launch)',
        source: 'Engineering Dynamics Fundamentals',
        description: 'Optimal elevation angle on level ground for maximum ballistic distance.',
        parameters: { launchV0: 30, launchAngle: 45, launchY0: 0, gravityG: 9.81 },
      },
    ],
  },
  {
    id: 'newton',
    title: "Newton's Laws of Motion (ΣF = ma)",
    category: 'Dynamics',
    subcategory: "Newton's Laws",
    badge: 'Foundational',
    iconName: 'Zap',
    summary: "Experiment dynamically with Newton's 1st Law (Inertia), 2nd Law (ΣF = ma), and 3rd Law (Action-Reaction paired contact forces).",
    assumptions: [
      'Inertial reference frame (non-accelerating observer).',
      'Mass remains constant during acceleration (non-relativistic).',
    ],
    governingEquations: [
      {
        name: "Newton's 2nd Law of Particle Dynamics",
        latex: '\\sum \\mathbf{F} = m \\mathbf{a} = m \\frac{d\\mathbf{v}}{dt}',
        description: 'Unbalanced external force produces proportional linear acceleration.',
        terms: [
          { symbol: 'ΣF', meaning: 'Net unbalanced external force', unit: 'N' },
          { symbol: 'm', meaning: 'Inertial mass', unit: 'kg' },
          { symbol: 'a', meaning: 'Resulting linear acceleration', unit: 'm/s²' },
        ],
      },
    ],
    realWorldApplications: [
      'Rocket thrust and payload stage acceleration.',
      'Automotive crash test deceleration and passenger restraint forces.',
      'Centrifugal acceleration in rotating industrial centrifuges.',
    ],
    limitations: [
      'Particle dynamics (rotational moments handled in Rigid Body module).',
    ],
    defaultParameters: {
      massKg: 12,
      forceN: 60,
      frictionMuK: 0.20,
    },
    parameterConfigs: [
      { id: 'massKg', name: 'Object Mass', symbol: 'm', unit: 'kg', min: 1, max: 50, step: 1, defaultValue: 12, description: 'Inertial mass of the sliding cart' },
      { id: 'forceN', name: 'Applied Horizontal Force', symbol: 'F', unit: 'N', min: 0, max: 200, step: 5, defaultValue: 60, description: 'Net applied driving force' },
      { id: 'frictionMuK', name: 'Kinetic Friction Coefficient', symbol: 'μ_k', unit: '', min: 0, max: 0.8, step: 0.05, defaultValue: 0.20, description: 'Track surface friction coefficient' },
    ],
    presets: [
      {
        id: 'newt_zero',
        title: 'Newton First Law (Frictionless Inertia)',
        source: 'Principia Mathematica Ex 1',
        description: 'Zero net external force results in persistent constant velocity.',
        parameters: { massKg: 10, forceN: 0, frictionMuK: 0 },
      },
    ],
  },
  {
    id: 'energy',
    title: 'Work, Energy & Power Theorem',
    category: 'Dynamics',
    subcategory: 'Work and Energy',
    badge: 'Energy Lab',
    iconName: 'Sun',
    summary: 'Track live mechanical energy transformation: Potential Energy (mgh) converting to Kinetic Energy (½mv²) with non-conservative friction dissipation.',
    assumptions: [
      'Conservative gravitational potential field.',
      'Friction acts as non-conservative work loss converting mechanical energy into heat.',
    ],
    governingEquations: [
      {
        name: 'Work-Energy Principle',
        latex: 'T_1 + V_1 + U_{1-2}^{\\text{nc}} = T_2 + V_2, \\quad \\frac{1}{2} m v_1^2 + m g h_1 - f_k d = \\frac{1}{2} m v_2^2 + m g h_2',
        description: 'Total mechanical energy balance equation.',
        terms: [
          { symbol: 'T', meaning: 'Kinetic Energy (½ m v²)', unit: 'J' },
          { symbol: 'V', meaning: 'Gravitational Potential Energy (m g h)', unit: 'J' },
          { symbol: 'U^nc', meaning: 'Work done by non-conservative forces', unit: 'J' },
        ],
      },
    ],
    realWorldApplications: [
      'Roller coaster loop height and velocity safety clearance.',
      'Hydroelectric dam gravitational potential energy power generation.',
      'Vehicle regenerative braking energy harvesting.',
    ],
    limitations: [
      'Neglects internal structural vibration damping.',
    ],
    defaultParameters: {
      massKg: 8,
      initialHeightM: 5.0,
      initialVelocityMs: 2.0,
      frictionLossN: 4.0,
    },
    parameterConfigs: [
      { id: 'massKg', name: 'Object Mass', symbol: 'm', unit: 'kg', min: 1, max: 40, step: 1, defaultValue: 8, description: 'Mass of descending cart' },
      { id: 'initialHeightM', name: 'Summit Release Height', symbol: 'h', unit: 'm', min: 1, max: 15, step: 0.5, defaultValue: 5.0, description: 'Height above ground datum' },
      { id: 'initialVelocityMs', name: 'Initial Velocity at Summit', symbol: 'v₀', unit: 'm/s', min: 0, max: 10, step: 0.5, defaultValue: 2.0, description: 'Entry speed at summit' },
      { id: 'frictionLossN', name: 'Track Resistance Force', symbol: 'F_fric', unit: 'N', min: 0, max: 20, step: 1, defaultValue: 4.0, description: 'Average resisting friction force' },
    ],
    presets: [
      {
        id: 'energy_cons',
        title: 'Ideal 100% Conservative Roller Coaster',
        source: 'Physics for Scientists and Engineers',
        description: 'Zero friction loss: complete conversion of potential energy to kinetic energy.',
        parameters: { massKg: 10, initialHeightM: 6.0, initialVelocityMs: 0, frictionLossN: 0 },
      },
    ],
  },
  {
    id: 'momentum',
    title: 'Impulse, Momentum & Collisions',
    category: 'Dynamics',
    subcategory: 'Impact Mechanics',
    badge: 'Collision Lab',
    iconName: 'Disc',
    summary: 'Simulate 1D particle impacts with variable coefficient of restitution e (0 = perfectly plastic, 1 = perfectly elastic) and verify momentum conservation.',
    assumptions: [
      'Internal impact forces are far larger than external forces during the short impact duration Δt.',
      'Total linear momentum is strictly conserved across the colliding system.',
    ],
    governingEquations: [
      {
        name: 'Linear Momentum Conservation & Restitution',
        latex: 'm_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2, \\quad e = \\frac{v_2 - v_1}{u_1 - u_2}',
        description: 'Simultaneous system of equations solving post-impact velocities.',
        terms: [
          { symbol: 'u1, u2', meaning: 'Pre-collision velocities', unit: 'm/s' },
          { symbol: 'v1, v2', meaning: 'Post-collision velocities', unit: 'm/s' },
          { symbol: 'e', meaning: 'Coefficient of restitution', unit: '' },
        ],
      },
    ],
    realWorldApplications: [
      'Automotive crash energy absorption crumple zones.',
      'Drop-hammer metal forging impact mechanics.',
      'Billiards and particle physics scattering experiments.',
    ],
    limitations: [
      'Direct central 1D collinear impact.',
    ],
    defaultParameters: {
      m1: 4,
      u1: 6,
      m2: 2,
      u2: -2,
      restitutionE: 0.85,
    },
    parameterConfigs: [
      { id: 'm1', name: 'Body 1 Mass', symbol: 'm₁', unit: 'kg', min: 0.5, max: 20, step: 0.5, defaultValue: 4, description: 'Mass of left colliding body' },
      { id: 'u1', name: 'Body 1 Initial Velocity', symbol: 'u₁', unit: 'm/s', min: -15, max: 15, step: 0.5, defaultValue: 6, description: 'Velocity of body 1 before impact' },
      { id: 'm2', name: 'Body 2 Mass', symbol: 'm₂', unit: 'kg', min: 0.5, max: 20, step: 0.5, defaultValue: 2, description: 'Mass of right colliding body' },
      { id: 'u2', name: 'Body 2 Initial Velocity', symbol: 'u₂', unit: 'm/s', min: -15, max: 15, step: 0.5, defaultValue: -2, description: 'Velocity of body 2 before impact' },
      { id: 'restitutionE', name: 'Restitution Coefficient (e)', symbol: 'e', unit: '', min: 0, max: 1.0, step: 0.05, defaultValue: 0.85, description: 'Elasticity (1.0 = Elastic, 0.0 = Plastic)' },
    ],
    presets: [
      {
        id: 'mom_elastic',
        title: 'Perfect Elastic Newton Cradle Impact',
        source: 'Classical Mechanics Standard',
        description: 'Equal masses colliding elastically with complete momentum transfer.',
        parameters: { m1: 3, u1: 5, m2: 3, u2: 0, restitutionE: 1.0 },
      },
    ],
  },

  // ===================== RIGID BODY MECHANICS =====================
  {
    id: 'rotation',
    title: 'Rotational Dynamics & Moment of Inertia',
    category: 'Rigid Body Mechanics',
    subcategory: 'Rotational Kinetics',
    badge: 'Flywheels',
    iconName: 'Compass',
    summary: 'Study Mass Moment of Inertia I, applied torque τ = I·α, angular acceleration, flywheel RPM, and stored rotational kinetic energy.',
    assumptions: [
      'Rigid body rotating about a fixed principal geometric axis.',
      'Bearing friction is ideal or constant.',
    ],
    governingEquations: [
      {
        name: "Rotational Newton's 2nd Law",
        latex: '\\sum \\tau = I \\alpha, \\quad I = \\int r^2 dm, \\quad T_{\\text{rot}} = \\frac{1}{2} I \\omega^2',
        description: 'Rotational analogue to linear F = ma and translational kinetic energy.',
        terms: [
          { symbol: 'τ', meaning: 'Applied external torque', unit: 'N·m' },
          { symbol: 'I', meaning: 'Mass moment of inertia', unit: 'kg·m²' },
          { symbol: 'α', meaning: 'Angular acceleration', unit: 'rad/s²' },
          { symbol: 'ω', meaning: 'Angular velocity', unit: 'rad/s' },
        ],
      },
    ],
    realWorldApplications: [
      'Industrial flywheel energy storage systems (FESS).',
      'Gas turbine and jet engine rotor spin-up dynamics.',
      'Electric motor drive torque-to-speed transient curves.',
    ],
    limitations: [
      'Single-axis fixed rotation (no gyroscopic precession).',
    ],
    defaultParameters: {
      massKg: 15,
      radiusM: 0.40,
      torqueNm: 25,
      simDurationS: 5,
    },
    parameterConfigs: [
      { id: 'massKg', name: 'Rotor Mass', symbol: 'm', unit: 'kg', min: 1, max: 80, step: 1, defaultValue: 15, description: 'Mass of rotating disc' },
      { id: 'radiusM', name: 'Rotor Radius', symbol: 'r', unit: 'm', min: 0.1, max: 1.5, step: 0.05, defaultValue: 0.40, description: 'Outer radius of the flywheel' },
      { id: 'torqueNm', name: 'Applied Motor Torque', symbol: 'τ', unit: 'N·m', min: 0, max: 100, step: 5, defaultValue: 25, description: 'Net driving torque applied at shaft' },
      { id: 'simDurationS', name: 'Spin-Up Duration', symbol: 't', unit: 's', min: 1, max: 12, step: 1, defaultValue: 5, description: 'Total acceleration time' },
    ],
    presets: [
      {
        id: 'rot_flywheel',
        title: 'Heavy Industrial Flywheel Acceleration',
        source: 'Mechanical Engineering Design',
        description: 'Large 40 kg disc flywheel accelerated by 50 N·m motor torque.',
        parameters: { massKg: 40, radiusM: 0.60, torqueNm: 50, simDurationS: 6 },
      },
    ],
  },

  // ===================== ENGINEERING SYSTEMS =====================
  {
    id: 'mechanisms',
    title: 'Crank-Slider & Linkage Kinematics',
    category: 'Engineering Systems',
    subcategory: 'Link Mechanisms',
    badge: 'Kinematic Synthesis',
    iconName: 'Cpu',
    summary: 'Analyze engine Slider-Crank mechanisms: compute piston displacement x(θ), linear velocity v(θ), and dynamic shaking acceleration a(θ) versus crank angle.',
    assumptions: [
      'Rigid links connected by idealized cylindrical pin joints.',
      'Constant crank angular velocity ω = constant.',
    ],
    governingEquations: [
      {
        name: 'Slider-Crank Kinematic Equations',
        latex: 'x(\\theta) = r \\cos\\theta + \\sqrt{l^2 - r^2 \\sin^2\\theta}, \\quad v(\\theta) \\approx -r \\omega (\\sin\\theta + \\frac{\\lambda}{2}\\sin 2\\theta)',
        description: 'Kinematic translation formulas connecting rotary crank motion to reciprocating piston stroke.',
        terms: [
          { symbol: 'r', meaning: 'Crank radius', unit: 'm' },
          { symbol: 'l', meaning: 'Connecting rod length', unit: 'm' },
          { symbol: 'λ = r/l', meaning: 'Obliquity ratio', unit: '' },
          { symbol: 'ω', meaning: 'Crank rotational speed', unit: 'rad/s' },
        ],
      },
    ],
    realWorldApplications: [
      'Internal combustion engine piston, rod, and crankshaft sizing.',
      'Reciprocating air compressor dynamic balance.',
      'Industrial stamping press stroke and mechanical advantage.',
    ],
    limitations: [
      'In-line planar crank-slider geometry (zero cylinder offset).',
    ],
    defaultParameters: {
      crankRadiusR: 0.08, // 80 mm
      connectingRodL: 0.24, // 240 mm
      crankOmegaRpm: 1200, // 1200 RPM
      crankAngleDeg: 45,
    },
    parameterConfigs: [
      { id: 'crankRadiusR', name: 'Crank Radius (r)', symbol: 'r', unit: 'm', min: 0.02, max: 0.20, step: 0.01, defaultValue: 0.08, description: 'Half of total engine piston stroke' },
      { id: 'connectingRodL', name: 'Connecting Rod Length (l)', symbol: 'l', unit: 'm', min: 0.10, max: 0.60, step: 0.01, defaultValue: 0.24, description: 'Center-to-center connecting rod length' },
      { id: 'crankOmegaRpm', name: 'Engine Speed (RPM)', symbol: 'N', unit: 'RPM', min: 100, max: 4000, step: 100, defaultValue: 1200, description: 'Crankshaft rotational speed' },
      { id: 'crankAngleDeg', name: 'Crank Angle (θ)', symbol: 'θ', unit: '°', min: 0, max: 360, step: 5, defaultValue: 45, description: 'Current crank rotation phase from Top Dead Center' },
    ],
    presets: [
      {
        id: 'mech_ic_engine',
        title: 'High-Performance 4-Cylinder Automotive Engine Stroke',
        source: 'Internal Combustion Engine Fundamentals (Heywood)',
        description: 'Standard 160 mm stroke with λ = 0.33 at 3000 RPM.',
        parameters: { crankRadiusR: 0.08, connectingRodL: 0.24, crankOmegaRpm: 3000, crankAngleDeg: 75 },
      },
    ],
  },
];
