import { GuidedExperiment } from '../types/unifiedModel';

export const GUIDED_EXPERIMENTS: GuidedExperiment[] = [
  {
    id: 'exp-force-acceleration',
    title: 'How Applied Force Governs Acceleration (Newton\'s 2nd Law)',
    topicId: 'newton',
    difficulty: 'Beginner',
    question: 'How does doubling the net applied force affect body acceleration at constant mass?',
    overview: 'Explore Newton\'s 2nd Law (F = ma) on a friction-controlled horizontal surface. Measure the transition when applied force overcomes kinetic friction.',
    initialParams: { massKg: 10, forceN: 20, frictionMuK: 0.15 },
    steps: [
      {
        stepNumber: 1,
        instruction: 'Observe the baseline state with Mass = 10 kg and Force = 20 N.',
        targetParameter: 'forceN',
        suggestedValue: 20,
        observationPrompt: 'Notice normal force N = 98.1 N and friction force f_k = 14.72 N. Net driving force is 5.28 N.',
        expectedOutcome: 'Acceleration is a = 5.28 / 10 = 0.53 m/s².'
      },
      {
        stepNumber: 2,
        instruction: 'Double the applied force to 40 N while holding mass fixed at 10 kg.',
        targetParameter: 'forceN',
        suggestedValue: 40,
        observationPrompt: 'Observe the new net force: F_net = 40 - 14.72 = 25.28 N.',
        expectedOutcome: 'Acceleration surges to a = 2.53 m/s² (nearly a 5x increase in net acceleration!).'
      },
      {
        stepNumber: 3,
        instruction: 'Now double the mass from 10 kg to 20 kg with Force = 40 N.',
        targetParameter: 'massKg',
        suggestedValue: 20,
        observationPrompt: 'Observe the increased friction (f_k = 29.43 N) and greater inertia.',
        expectedOutcome: 'Acceleration drops to a = (40 - 29.43) / 20 = 0.53 m/s².'
      }
    ],
    conceptTakeaway: 'Acceleration is directly proportional to net unbalanced force and inversely proportional to inertial mass: a = ΣF_net / m.',
    realWorldContext: 'Vehicle powertrain acceleration sizing, conveyor belt traction, and crane payload lifting rates.'
  },
  {
    id: 'exp-beam-flexure',
    title: 'Span Length & Load Position in Beam Bending Moments',
    topicId: 'beams',
    difficulty: 'Intermediate',
    question: 'Why does placing a concentrated load at midspan produce maximum bending moment?',
    overview: 'Investigate how moving a point load along a simply supported girder shifts reaction forces and generates critical peak bending moments.',
    initialParams: { beamLength: 6.0, loadP1: 500, loadP1Pos: 1.0, loadP2: 0, loadP2Pos: 4.0, udlW: 0, eGpa: 200, iCm4: 1500 },
    steps: [
      {
        stepNumber: 1,
        instruction: 'Position load P1 = 500 N at x = 1.0 m near the left support.',
        targetParameter: 'loadP1Pos',
        suggestedValue: 1.0,
        observationPrompt: 'Support reaction RA bears 83% of the load (416.7 N), while RB only takes 83.3 N.',
        expectedOutcome: 'Max moment is M_max = 416.7 N·m at x = 1.0 m.'
      },
      {
        stepNumber: 2,
        instruction: 'Move the load to exact midspan at x = 3.0 m.',
        targetParameter: 'loadP1Pos',
        suggestedValue: 3.0,
        observationPrompt: 'Both supports share load equally: RA = RB = 250 N.',
        expectedOutcome: 'Max moment reaches theoretical peak M_max = P*L/4 = 500*6/4 = 750 N·m (an 80% surge!).'
      },
      {
        stepNumber: 3,
        instruction: 'Increase span length from 6.0 m to 8.0 m with midspan load at 4.0 m.',
        targetParameter: 'beamLength',
        suggestedValue: 8.0,
        observationPrompt: 'Notice that moment scales linearly with span L, and deflection scales with L³.',
        expectedOutcome: 'Max moment jumps to 1,000 N·m and deflection increases dramatically.'
      }
    ],
    conceptTakeaway: 'For simply supported beams, concentrated load bending moment peaks at midspan (M = P·L/4) and scales directly with clear span length.',
    realWorldContext: 'Bridge girder design, overhead crane runway beams, and floor joist spans in buildings.'
  },
  {
    id: 'exp-friction-threshold',
    title: 'Static Impending Slip vs Dynamic Kinetic Gliding',
    topicId: 'friction',
    difficulty: 'Intermediate',
    question: 'What triggers the sudden transition from static equilibrium to runaway acceleration on an inclined plane?',
    overview: 'Observe the Coulomb friction threshold (f_s,max = μ_s·N) and explore the critical angle of repose where gravity overcomes friction.',
    initialParams: { mass: 10, appliedForce: 20, inclineAngleDeg: 10, muS: 0.50, muK: 0.35 },
    steps: [
      {
        stepNumber: 1,
        instruction: 'Set incline angle θ = 10° with applied pull F = 20 N.',
        targetParameter: 'inclineAngleDeg',
        suggestedValue: 10,
        observationPrompt: 'Normal force N = 96.6 N, Max static friction f_s,max = 48.3 N. Driving forces are fully resisted.',
        expectedOutcome: 'System remains in static equilibrium (Acceleration = 0 m/s²).'
      },
      {
        stepNumber: 2,
        instruction: 'Increase incline angle θ to 25° (near the angle of repose tan⁻¹(0.50) ≈ 26.5°).',
        targetParameter: 'inclineAngleDeg',
        suggestedValue: 25,
        observationPrompt: 'Downslope weight component W_x = 41.45 N. Normal force drops to 88.9 N.',
        expectedOutcome: 'System is near impending motion threshold.'
      },
      {
        stepNumber: 3,
        instruction: 'Increase applied pull to 60 N.',
        targetParameter: 'appliedForce',
        suggestedValue: 60,
        observationPrompt: 'Driving force overcomes maximum static friction. Friction drops abruptly to kinetic f_k = μ_k·N = 31.1 N.',
        expectedOutcome: 'System begins accelerating steadily up the incline.'
      }
    ],
    conceptTakeaway: 'Motion occurs when driving forces exceed the static friction limit f_s,max = μ_s·N. Once moving, kinetic resistance is lower (μ_k < μ_s).',
    realWorldContext: 'Conveyor chute angles, automotive braking on icy hills, and earth retaining slope stability.'
  },
  {
    id: 'exp-projectile-optimum-angle',
    title: 'Ballistic Trajectory & Range Optimization',
    topicId: 'projectile',
    difficulty: 'Beginner',
    question: 'Why does a 45° launch angle yield maximum horizontal range over flat ground?',
    overview: 'Analyze decoupled horizontal (v_x = constant) and vertical (free-fall under gravity) motion in 2D kinematics.',
    initialParams: { launchV0: 25, launchAngle: 30, launchY0: 0, gravityG: 9.81 },
    steps: [
      {
        stepNumber: 1,
        instruction: 'Test a shallow launch angle of 30° with v₀ = 25 m/s.',
        targetParameter: 'launchAngle',
        suggestedValue: 30,
        observationPrompt: 'Time of flight t = 2.55 s. Peak apex height = 7.96 m.',
        expectedOutcome: 'Horizontal range X = 55.23 m.'
      },
      {
        stepNumber: 2,
        instruction: 'Increase angle to the theoretical optimum θ = 45°.',
        targetParameter: 'launchAngle',
        suggestedValue: 45,
        observationPrompt: 'Notice that sin(2θ) = sin(90°) = 1.0 (maximum possible value for range formula X = v₀²sin(2θ)/g).',
        expectedOutcome: 'Range peaks at X = 63.71 m and apex reaches 15.93 m.'
      },
      {
        stepNumber: 3,
        instruction: 'Increase angle to a steep 60°.',
        targetParameter: 'launchAngle',
        suggestedValue: 60,
        observationPrompt: 'Notice the complementary angle theorem: sin(2·60°) = sin(120°) = sin(60°), producing identical range to 30°!',
        expectedOutcome: 'Range returns to X = 55.23 m, but peak height increases to 23.89 m.'
      }
    ],
    conceptTakeaway: 'On flat terrain, maximum horizontal range occurs at 45° because the product of horizontal speed (cos θ) and time aloft (sin θ) is maximized.',
    realWorldContext: 'Artillery ballistics, athletic sports projectile arcs (golf/javelin), and rocket launch staging.'
  },
  {
    id: 'exp-truss-zero-force',
    title: 'Truss Member Forces & Zero-Force Identification',
    topicId: 'trusses',
    difficulty: 'Intermediate',
    question: 'How do tension and compression forces distribute through triangular bridge trusses?',
    overview: 'Apply the Method of Joints to resolve axial member forces under vertical joint loading.',
    initialParams: { trussSpan: 6.0, trussHeight: 2.5, jointLoadN: 1200 },
    steps: [
      {
        stepNumber: 1,
        instruction: 'Observe standard symmetrical truss with 1,200 N load applied at top apex joint C.',
        targetParameter: 'jointLoadN',
        suggestedValue: 1200,
        observationPrompt: 'Symmetrical reactions RA = RB = 600 N at both end supports.',
        expectedOutcome: 'Diagonal members AC and BC carry compressive loads (-768 N), while bottom cord AB carries tension (+480 N).'
      },
      {
        stepNumber: 2,
        instruction: 'Double the applied bridge load to 2,400 N.',
        targetParameter: 'jointLoadN',
        suggestedValue: 2400,
        observationPrompt: 'Observe that all member axial forces scale linearly with the applied joint load.',
        expectedOutcome: 'Diagonal compression doubles to -1,536 N and bottom tension reaches +960 N.'
      },
      {
        stepNumber: 3,
        instruction: 'Increase truss height from 2.5 m to 3.5 m.',
        targetParameter: 'trussHeight',
        suggestedValue: 3.5,
        observationPrompt: 'Steeper diagonals reduce the horizontal component required to balance the joint.',
        expectedOutcome: 'Bottom chord tension decreases significantly, demonstrating why deeper trusses carry high loads more efficiently.'
      }
    ],
    conceptTakeaway: 'Truss depth increases structural leverage: taller trusses reduce chord axial forces, while member forces remain strictly axial (tension/compression).',
    realWorldContext: 'Railway bridges, roof trusses, tower cranes, and aerospace space frame booms.'
  }
];
