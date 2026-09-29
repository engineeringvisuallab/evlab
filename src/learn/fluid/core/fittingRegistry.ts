/**
 * EVLab Pipe Fittings & Minor Loss Registry
 * Minor loss coefficients K from Crane TP 410, Miller DS, Munson & Okiishi
 */

import { PipeFitting } from '../types';

export const PIPE_FITTINGS: PipeFitting[] = [
  {
    id: 'entrance_sharp',
    name: 'Sharp-Edged Pipe Entrance',
    category: 'entrance',
    K: 0.50,
    equivalentLengthRatio_Le_D: 25,
    description: 'Square edge reservoir inlet; vena contracta induces separation eddies.'
  },
  {
    id: 'entrance_rounded',
    name: 'Well-Rounded Pipe Entrance (r/D > 0.15)',
    category: 'entrance',
    K: 0.04,
    equivalentLengthRatio_Le_D: 2,
    description: 'Smooth bellmouth contour eliminates boundary layer separation.'
  },
  {
    id: 'entrance_reentrant',
    name: 'Re-entrant Pipe Entrance (Borda)',
    category: 'entrance',
    K: 0.78,
    equivalentLengthRatio_Le_D: 40,
    description: 'Pipe protrudes inward into reservoir, large stagnant recirculation zone.'
  },
  {
    id: 'exit_submerged',
    name: 'Submerged Pipe Exit (All Geometries)',
    category: 'exit',
    K: 1.00,
    equivalentLengthRatio_Le_D: 50,
    description: 'All kinetic energy head V^2/2g is dissipated as turbulence in the receiving reservoir.'
  },
  {
    id: 'elbow_90_standard_flanged',
    name: '90° Standard Elbow (Flanged)',
    category: 'elbow',
    K: 0.30,
    equivalentLengthRatio_Le_D: 15,
    description: 'Standard radius flanged elbow.'
  },
  {
    id: 'elbow_90_standard_threaded',
    name: '90° Standard Elbow (Threaded)',
    category: 'elbow',
    K: 0.90,
    equivalentLengthRatio_Le_D: 30,
    description: 'Threaded pipe elbow with sharper turn.'
  },
  {
    id: 'elbow_90_long_radius',
    name: '90° Long Radius Elbow (r/D = 1.5)',
    category: 'elbow',
    K: 0.20,
    equivalentLengthRatio_Le_D: 12,
    description: 'Gradual bend reducing secondary dean vortices.'
  },
  {
    id: 'elbow_45_standard',
    name: '45° Standard Elbow',
    category: 'elbow',
    K: 0.40,
    equivalentLengthRatio_Le_D: 16,
    description: 'Moderate angle redirection.'
  },
  {
    id: 'tee_flow_through_run',
    name: 'Standard Tee (Flow Through Run)',
    category: 'tee',
    K: 0.20,
    equivalentLengthRatio_Le_D: 20,
    description: 'Straight passage through the header.'
  },
  {
    id: 'tee_flow_through_branch',
    name: 'Standard Tee (Flow Through Branch 90°)',
    category: 'tee',
    K: 1.00,
    equivalentLengthRatio_Le_D: 60,
    description: 'Side branch division or confluence with strong swirl.'
  },
  {
    id: 'valve_gate_full',
    name: 'Gate Valve (Fully Open)',
    category: 'valve',
    K: 0.15,
    equivalentLengthRatio_Le_D: 8,
    description: 'Unobstructed full bore opening.'
  },
  {
    id: 'valve_gate_half',
    name: 'Gate Valve (50% Open)',
    category: 'valve',
    K: 2.10,
    equivalentLengthRatio_Le_D: 160,
    description: 'Severe constriction throttling flow.'
  },
  {
    id: 'valve_gate_quarter',
    name: 'Gate Valve (25% Open)',
    category: 'valve',
    K: 17.0,
    equivalentLengthRatio_Le_D: 900,
    description: 'Near shutoff causing massive pressure drop.'
  },
  {
    id: 'valve_globe_full',
    name: 'Globe Valve (Fully Open)',
    category: 'valve',
    K: 10.0,
    equivalentLengthRatio_Le_D: 340,
    description: 'Tortuous S-shaped flow path through seat.'
  },
  {
    id: 'valve_ball_full',
    name: 'Ball Valve (Fully Open)',
    category: 'valve',
    K: 0.05,
    equivalentLengthRatio_Le_D: 3,
    description: 'Straight cylindrical bore with virtually zero restriction.'
  },
  {
    id: 'valve_butterfly_full',
    name: 'Butterfly Valve (Fully Open)',
    category: 'valve',
    K: 0.60,
    equivalentLengthRatio_Le_D: 40,
    description: 'Disk remains in stream centerline.'
  },
  {
    id: 'valve_check_swing',
    name: 'Swing Check Valve (Fully Open)',
    category: 'valve',
    K: 2.00,
    equivalentLengthRatio_Le_D: 100,
    description: 'Flapper held open by hydrodynamic momentum.'
  },
  {
    id: 'reducer_sudden_2to1',
    name: 'Sudden Contraction (d/D = 0.5)',
    category: 'transition',
    K: 0.38,
    equivalentLengthRatio_Le_D: 20,
    description: 'Abrupt step down in pipe diameter.'
  },
  {
    id: 'expansion_sudden_1to2',
    name: 'Sudden Expansion (d/D = 0.5, Borda-Carnot)',
    category: 'transition',
    K: 0.56,
    equivalentLengthRatio_Le_D: 30,
    description: 'Abrupt step up in diameter, K = (1 - (d1/d2)^2)^2.'
  },
];

export const STANDARD_FITTINGS = PIPE_FITTINGS;

