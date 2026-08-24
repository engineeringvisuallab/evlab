import { DependencyNode } from '../types/unifiedModel';

export interface CurriculumLevel {
  levelNumber: number;
  name: string;
  badge: string;
  description: string;
  topics: {
    id: string;
    title: string;
    category: string;
    icon: string;
    keyConcept: string;
  }[];
}

export const CURRICULUM_LEVELS: CurriculumLevel[] = [
  {
    levelNumber: 1,
    name: 'Level 1 — Foundations',
    badge: 'Fundamental Statics',
    description: 'Master vector decomposition, resultant forces, moments of force, and 2D Free Body Diagram isolation.',
    topics: [
      { id: 'vectors', title: 'Force Systems & Vectors', category: 'Statics', icon: 'MoveUpRight', keyConcept: 'Vector addition, components, and resultant forces.' },
      { id: 'fbd', title: 'Free Body Diagrams (FBD)', category: 'Statics', icon: 'Maximize2', keyConcept: 'Rigid body isolation and boundary reaction balance.' },
      { id: 'moment', title: 'Moment & Torque', category: 'Statics', icon: 'RotateCw', keyConcept: 'Rotational leverage, perpendicular line of action, and couples.' },
    ]
  },
  {
    levelNumber: 2,
    name: 'Level 2 — Engineering Statics & Structures',
    badge: 'Structural Mechanics',
    description: 'Solve static equilibrium, Coulomb friction thresholds, geometric centroids, beam flexure, and 2D pin-jointed trusses.',
    topics: [
      { id: 'equilibrium', title: 'Rigid Body Static Equilibrium', category: 'Statics', icon: 'Scale', keyConcept: 'ΣFx = 0, ΣFy = 0, ΣM = 0 equations of equilibrium.' },
      { id: 'friction', title: 'Coulomb Friction & Incline', category: 'Statics', icon: 'Footprints', keyConcept: 'Static vs kinetic friction, slip threshold, and angle of repose.' },
      { id: 'centroid', title: 'Composite Centroids & Moments of Inertia', category: 'Statics', icon: 'Shapes', keyConcept: 'Geometric center, first moment of area, and parallel axis theorem.' },
      { id: 'beams', title: 'Shear & Bending Moment Beams', category: 'Structural Mechanics', icon: 'SquareCode', keyConcept: 'SFD, BMD, and Euler-Bernoulli flexural deflection.' },
      { id: 'trusses', title: 'Method of Joints Trusses', category: 'Structural Mechanics', icon: 'GitPullRequest', keyConcept: 'Axial member forces (Tension vs Compression) in pin-jointed frames.' },
    ]
  },
  {
    levelNumber: 3,
    name: 'Level 3 — Dynamics & Particle Kinetics',
    badge: 'Kinematics & Kinetics',
    description: 'Analyze particle motion, ballistic projectile trajectories, Newton\'s laws of motion, work-energy theorem, and momentum conservation.',
    topics: [
      { id: 'kinematics', title: 'Rectilinear Kinematics', category: 'Dynamics', icon: 'Timer', keyConcept: 'Displacement, velocity, and acceleration integration curves.' },
      { id: 'projectile', title: 'Ballistic Projectile Motion', category: 'Dynamics', icon: 'TrendingUp', keyConcept: 'Decoupled 2D kinematics under gravity and parabolic flight.' },
      { id: 'newton', title: 'Newton\'s 2nd Law of Motion', category: 'Dynamics', icon: 'Zap', keyConcept: 'F_net = m·a force acceleration dynamics.' },
      { id: 'energy', title: 'Work, Energy & Power', category: 'Dynamics', icon: 'BatteryCharging', keyConcept: 'Conservation of mechanical energy and work done by non-conservative forces.' },
      { id: 'momentum', title: 'Linear Momentum & Collisions', category: 'Dynamics', icon: 'ShieldAlert', keyConcept: 'Conservation of momentum and coefficient of restitution e.' },
    ]
  },
  {
    levelNumber: 4,
    name: 'Level 4 — Rigid Body Dynamics & Mechanisms',
    badge: 'Advanced Machinery',
    description: 'Explore flywheel rotational inertia, angular momentum, and kinematics of reciprocating slider-crank linkages.',
    topics: [
      { id: 'rotation', title: 'Rotational Dynamics & Flywheels', category: 'Rigid Body Mechanics', icon: 'CircleDot', keyConcept: 'τ = I·α rotational dynamics, flywheel energy storage, and RPM.' },
      { id: 'mechanisms', title: 'Slider-Crank Kinematic Linkages', category: 'Rigid Body Mechanics', icon: 'Cpu', keyConcept: 'Crank angle, connecting rod kinematics, and piston velocity/acceleration.' },
    ]
  }
];

export function getTopicDependencyGraph(topicId: string, params: Record<string, number>, computedData: Record<string, any>): DependencyNode[] {
  switch (topicId) {
    case 'beams':
      return [
        {
          id: 'inp-length',
          label: 'Span Length (L)',
          category: 'input',
          value: `${params.beamLength ?? 6.0} m`,
          unit: 'm',
          dependsOn: [],
          description: 'Clear geometric span between support bearings.'
        },
        {
          id: 'inp-load',
          label: 'Applied Load (P1)',
          category: 'input',
          value: `${params.loadP1 ?? 500} N`,
          unit: 'N',
          dependsOn: [],
          description: 'Concentrated downward vertical point load.'
        },
        {
          id: 'inp-pos',
          label: 'Load Position (x1)',
          category: 'input',
          value: `${params.loadP1Pos ?? 2.0} m`,
          unit: 'm',
          dependsOn: [],
          description: 'Offset of point load P1 from support A.'
        },
        {
          id: 'calc-reactions',
          label: 'Support Reactions (RA, RB)',
          category: 'intermediate',
          value: `RA: ${(computedData.raY ?? 0).toFixed(1)} N | RB: ${(computedData.rbY ?? 0).toFixed(1)} N`,
          unit: 'N',
          dependsOn: ['inp-length', 'inp-load', 'inp-pos'],
          equation: 'ΣMB = 0 ⇒ RA = P·(L - a)/L',
          description: 'Vertical reaction forces required for static equilibrium.'
        },
        {
          id: 'calc-shear',
          label: 'Peak Shear Force (V_max)',
          category: 'intermediate',
          value: `${(computedData.maxShear ?? 0).toFixed(1)} N`,
          unit: 'N',
          dependsOn: ['calc-reactions'],
          equation: 'V(x) = dM/dx = RA - ΣP',
          description: 'Maximum internal vertical shear across cross-sections.'
        },
        {
          id: 'out-moment',
          label: 'Max Bending Moment (M_max)',
          category: 'output',
          value: `${(computedData.maxMoment ?? 0).toFixed(1)} N·m`,
          unit: 'N·m',
          dependsOn: ['calc-reactions', 'calc-shear'],
          equation: 'M(x) = ∫ V(x) dx',
          description: 'Peak internal flexural moment determining required section modulus.'
        },
        {
          id: 'out-deflection',
          label: 'Max Deflection (δ_max)',
          category: 'output',
          value: `${(computedData.maxDeflection ?? 0).toFixed(3)} mm`,
          unit: 'mm',
          dependsOn: ['out-moment', 'inp-length'],
          equation: 'EI·d²y/dx² = M(x)',
          description: 'Maximum downward elastic centerline displacement.'
        }
      ];

    case 'newton':
      return [
        {
          id: 'inp-mass',
          label: 'Inertial Mass (m)',
          category: 'input',
          value: `${params.massKg ?? 12} kg`,
          unit: 'kg',
          dependsOn: [],
          description: 'Quantity of matter resisting linear acceleration.'
        },
        {
          id: 'inp-force',
          label: 'Applied Force (F)',
          category: 'input',
          value: `${params.forceN ?? 60} N`,
          unit: 'N',
          dependsOn: [],
          description: 'Horizontal driving pull applied to the body.'
        },
        {
          id: 'calc-normal',
          label: 'Normal Reaction (N)',
          category: 'intermediate',
          value: `${(computedData.normalForce ?? 0).toFixed(1)} N`,
          unit: 'N',
          dependsOn: ['inp-mass'],
          equation: 'N = m·g',
          description: 'Perpendicular contact support force balancing gravity.'
        },
        {
          id: 'calc-friction',
          label: 'Kinetic Friction (f_k)',
          category: 'intermediate',
          value: `${(computedData.frictionForce ?? 0).toFixed(1)} N`,
          unit: 'N',
          dependsOn: ['calc-normal'],
          equation: 'f_k = μ_k·N',
          description: 'Opposing surface resistance during gliding.'
        },
        {
          id: 'calc-netforce',
          label: 'Net Force (ΣFx)',
          category: 'intermediate',
          value: `${(computedData.netForce ?? 0).toFixed(1)} N`,
          unit: 'N',
          dependsOn: ['inp-force', 'calc-friction'],
          equation: 'ΣFx = F_applied - f_k',
          description: 'Unbalanced dynamic driving force.'
        },
        {
          id: 'out-accel',
          label: 'Acceleration (a)',
          category: 'output',
          value: `${(computedData.acceleration ?? 0).toFixed(2)} m/s²`,
          unit: 'm/s²',
          dependsOn: ['calc-netforce', 'inp-mass'],
          equation: 'a = ΣFx / m',
          description: 'Linear rate of velocity change governed by Newton\'s 2nd Law.'
        }
      ];

    case 'friction':
      return [
        {
          id: 'inp-mass',
          label: 'Mass (m)',
          category: 'input',
          value: `${params.mass ?? 10} kg`,
          unit: 'kg',
          dependsOn: [],
          description: 'Block mass.'
        },
        {
          id: 'inp-angle',
          label: 'Incline Angle (θ)',
          category: 'input',
          value: `${params.inclineAngleDeg ?? 15}°`,
          unit: '°',
          dependsOn: [],
          description: 'Ramp slope angle from horizontal.'
        },
        {
          id: 'calc-weight',
          label: 'Weight (W = mg)',
          category: 'intermediate',
          value: `${(computedData.weight ?? 0).toFixed(1)} N`,
          unit: 'N',
          dependsOn: ['inp-mass'],
          equation: 'W = m·g',
          description: 'Total gravitational force acting downward.'
        },
        {
          id: 'calc-normal',
          label: 'Normal Force (N)',
          category: 'intermediate',
          value: `${(computedData.normalForce ?? 0).toFixed(1)} N`,
          unit: 'N',
          dependsOn: ['calc-weight', 'inp-angle'],
          equation: 'N = W·cos(θ)',
          description: 'Perpendicular surface reaction.'
        },
        {
          id: 'calc-maxstatic',
          label: 'Max Static Friction (f_s,max)',
          category: 'intermediate',
          value: `${(computedData.maxStaticFriction ?? 0).toFixed(1)} N`,
          unit: 'N',
          dependsOn: ['calc-normal'],
          equation: 'f_s,max = μ_s·N',
          description: 'Threshold limit before slip occurs.'
        },
        {
          id: 'out-state',
          label: 'Motion State',
          category: 'output',
          value: `${computedData.state ?? 'Static Equilibrium'}`,
          unit: '',
          dependsOn: ['calc-maxstatic'],
          equation: 'F_drive vs f_s,max',
          description: 'Classification of physical contact status.'
        }
      ];

    case 'projectile':
      return [
        {
          id: 'inp-v0',
          label: 'Initial Velocity (v₀)',
          category: 'input',
          value: `${params.launchV0 ?? 25} m/s`,
          unit: 'm/s',
          dependsOn: [],
          description: 'Muzzle launch speed.'
        },
        {
          id: 'inp-angle',
          label: 'Launch Angle (θ)',
          category: 'input',
          value: `${params.launchAngle ?? 45}°`,
          unit: '°',
          dependsOn: [],
          description: 'Elevation angle above horizontal.'
        },
        {
          id: 'calc-components',
          label: 'Velocity Components (v_x0, v_y0)',
          category: 'intermediate',
          value: `v_x: ${( (params.launchV0 ?? 25) * Math.cos(((params.launchAngle ?? 45) * Math.PI)/180) ).toFixed(1)} m/s | v_y: ${( (params.launchV0 ?? 25) * Math.sin(((params.launchAngle ?? 45) * Math.PI)/180) ).toFixed(1)} m/s`,
          unit: 'm/s',
          dependsOn: ['inp-v0', 'inp-angle'],
          equation: 'v_x0 = v0·cos θ, v_y0 = v0·sin θ',
          description: 'Orthogonal velocity vector projections.'
        },
        {
          id: 'calc-flighttime',
          label: 'Time of Flight (T)',
          category: 'intermediate',
          value: `${(computedData.timeOfFlight ?? 0).toFixed(2)} s`,
          unit: 's',
          dependsOn: ['calc-components'],
          equation: 'T = (v_y0 + √(v_y0² + 2gy0)) / g',
          description: 'Total duration before impacting ground plane.'
        },
        {
          id: 'out-range',
          label: 'Horizontal Range (X)',
          category: 'output',
          value: `${(computedData.rangeX ?? 0).toFixed(1)} m`,
          unit: 'm',
          dependsOn: ['calc-flighttime', 'calc-components'],
          equation: 'X = v_x0 × T',
          description: 'Total horizontal ballistic distance travelled.'
        },
        {
          id: 'out-apex',
          label: 'Maximum Height (Y_max)',
          category: 'output',
          value: `${(computedData.maxHeightY ?? 0).toFixed(1)} m`,
          unit: 'm',
          dependsOn: ['calc-components'],
          equation: 'Y_max = y0 + v_y0² / (2g)',
          description: 'Peak trajectory altitude reached at vertical velocity v_y = 0.'
        }
      ];

    default:
      return [
        {
          id: 'inp-generic-1',
          label: 'Input Parameters',
          category: 'input',
          value: 'Active Variables',
          unit: '',
          dependsOn: [],
          description: 'Assigned engineering input parameters.'
        },
        {
          id: 'calc-generic-eq',
          label: 'Governing Equations',
          category: 'intermediate',
          value: 'Deterministic Solvers',
          unit: '',
          dependsOn: ['inp-generic-1'],
          equation: 'Governing Mechanics Formulation',
          description: 'Exact analytical physics equations.'
        },
        {
          id: 'out-generic-state',
          label: 'Physical State Output',
          category: 'output',
          value: 'Evaluated Solution',
          unit: '',
          dependsOn: ['calc-generic-eq'],
          equation: 'Engineering Result',
          description: 'Computed physical reactions and kinetic states.'
        }
      ];
  }
}
