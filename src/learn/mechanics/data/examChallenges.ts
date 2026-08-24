import { ExamChallenge } from '../types/unifiedModel';

export const EXAM_CHALLENGES: ExamChallenge[] = [
  {
    id: 'exam-01-beam-reaction',
    title: 'Simply Supported Beam Reaction Force',
    topicId: 'beams',
    difficulty: 'Fundamentals',
    timeLimitSec: 180,
    problemStatement: 'A simply supported bridge girder of span L = 6.0 m carries a concentrated point load P₁ = 600 N placed at x = 2.0 m from left support A. Neglecting beam self-weight, compute the vertical reaction force RA at support A.',
    givenParameters: { beamLength: 6.0, loadP1: 600, loadP1Pos: 2.0, loadP2: 0, udlW: 0 },
    questionPrompt: 'Calculate vertical reaction RA (in Newtons):',
    targetVariableKey: 'raY',
    correctAnswer: 400,
    tolerancePercent: 2,
    unit: 'N',
    hint: 'Take moments about support B: ΣMB = 0 ⇒ RA·(6.0) - 600·(6.0 - 2.0) = 0.',
    stepByStepSolution: [
      '1. Draw Free Body Diagram of the beam with pin at A (RA) and roller at B (RB).',
      '2. Apply Moment Equilibrium about point B: ΣMB = 0.',
      '3. (RA × 6.0 m) - (600 N × 4.0 m) = 0.',
      '4. RA = (600 × 4.0) / 6.0 = 2400 / 6.0 = 400.0 N.',
      '5. Verification: ΣFy = RA + RB - 600 = 400 + 200 - 600 = 0 (Balanced!).'
    ]
  },
  {
    id: 'exam-02-friction-impending',
    title: 'Impending Slip Incline Angle Analysis',
    topicId: 'friction',
    difficulty: 'Diploma / GATE',
    timeLimitSec: 240,
    problemStatement: 'A crate of mass m = 15 kg rests on an inclined surface with static friction coefficient μs = 0.40. Calculate the maximum static friction force f_s,max when the incline is tilted to θ = 15° before slipping occurs.',
    givenParameters: { mass: 15, appliedForce: 0, inclineAngleDeg: 15, muS: 0.40, muK: 0.30 },
    questionPrompt: 'Calculate maximum static friction f_s,max (in Newtons):',
    targetVariableKey: 'maxStaticFriction',
    correctAnswer: 56.85,
    tolerancePercent: 3,
    unit: 'N',
    hint: 'Normal force N = m·g·cos(θ). Then f_s,max = μs·N.',
    stepByStepSolution: [
      '1. Weight W = m·g = 15 kg × 9.81 m/s² = 147.15 N.',
      '2. Normal force perpendicular to incline: N = W·cos(15°) = 147.15 × 0.9659 = 142.13 N.',
      '3. Maximum static friction limit: f_s,max = μs × N = 0.40 × 142.13 N = 56.85 N.',
      '4. Downslope driving component: W_x = W·sin(15°) = 147.15 × 0.2588 = 38.08 N.',
      '5. Since W_x (38.08 N) < f_s,max (56.85 N), the body remains statically at rest.'
    ]
  },
  {
    id: 'exam-03-projectile-range',
    title: 'Ballistic Projectile Maximum Range',
    topicId: 'projectile',
    difficulty: 'FE / PE Professional',
    timeLimitSec: 240,
    problemStatement: 'A projectile is launched from ground level (y0 = 0) with initial velocity v0 = 30 m/s at an elevation angle θ = 45° under standard gravity g = 9.81 m/s². Determine the total horizontal range X.',
    givenParameters: { launchV0: 30, launchAngle: 45, launchY0: 0, gravityG: 9.81 },
    questionPrompt: 'Calculate horizontal flight range X (in meters):',
    targetVariableKey: 'rangeX',
    correctAnswer: 91.74,
    tolerancePercent: 2,
    unit: 'm',
    hint: 'Use the standard analytical range formula: X = (v0² · sin(2θ)) / g.',
    stepByStepSolution: [
      '1. Decompose velocity: v_x0 = 30·cos(45°) = 21.21 m/s, v_y0 = 30·sin(45°) = 21.21 m/s.',
      '2. Time of flight: t = 2·v_y0 / g = 2 × 21.21 / 9.81 = 4.325 s.',
      '3. Horizontal range: X = v_x0 × t = 21.21 × 4.325 = 91.74 m.',
      '4. Analytical formula check: X = (30² × sin(90°)) / 9.81 = 900 / 9.81 = 91.74 m.'
    ]
  },
  {
    id: 'exam-04-newton-accel',
    title: 'Newton\'s Second Law with Kinetic Friction',
    topicId: 'newton',
    difficulty: 'Fundamentals',
    timeLimitSec: 180,
    problemStatement: 'A block of mass m = 8 kg is pulled across a rough floor by a horizontal force F = 50 N. If the coefficient of kinetic friction is μk = 0.25, calculate the net acceleration of the block.',
    givenParameters: { massKg: 8, forceN: 50, frictionMuK: 0.25 },
    questionPrompt: 'Calculate block acceleration a (in m/s²):',
    targetVariableKey: 'acceleration',
    correctAnswer: 3.80,
    tolerancePercent: 3,
    unit: 'm/s²',
    hint: 'Normal force N = m·g = 8 × 9.81 = 78.48 N. Friction f_k = μk·N = 19.62 N. Then a = (F - f_k) / m.',
    stepByStepSolution: [
      '1. Calculate weight and normal reaction: W = N = 8 kg × 9.81 m/s² = 78.48 N.',
      '2. Kinetic friction resisting force: f_k = μk × N = 0.25 × 78.48 N = 19.62 N.',
      '3. Net unbalanced horizontal force: ΣFx = F_applied - f_k = 50 N - 19.62 N = 30.38 N.',
      '4. Apply Newton\'s 2nd Law: a = ΣFx / m = 30.38 N / 8 kg = 3.80 m/s².'
    ]
  }
];
