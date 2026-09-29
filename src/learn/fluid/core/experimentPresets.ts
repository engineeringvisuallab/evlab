/**
 * EVLab Benchmark Problem Presets & Guided Experiments
 */

import { LabTopicId } from '../types';

export interface ExperimentPreset {
  id: string;
  title: string;
  labId: LabTopicId;
  authorReference: string;
  description: string;
  parameters: Record<string, any>;
  expectedTakeaway: string;
  challengeQuestion: string;
}

export const EXPERIMENT_PRESETS: ExperimentPreset[] = [
  {
    id: 'exp-cont-01',
    title: 'Munson Ex 3.2: Firehose Contraction Nozzle',
    labId: 'continuity',
    authorReference: 'Munson, Young & Okiishi - Fundamentals of Fluid Mechanics',
    description: 'A 75 mm firehose delivers water at 15 L/s into a 25 mm smooth converging nozzle. Observe the 9x velocity amplification.',
    parameters: {
      d1: 0.075,
      d2: 0.025,
      discharge_Lps: 15,
      fluidId: 'water_20c',
    },
    expectedTakeaway: 'Reducing diameter by 3x increases velocity by 3² = 9x because cross-sectional area scales with D².',
    challengeQuestion: 'What happens to the dynamic pressure head (V²/2g) when the fluid accelerates from the hose to the nozzle tip?'
  },
  {
    id: 'exp-bern-01',
    title: 'White Ex 3.7: Siphon Pipeline & Cavitation Ceiling',
    labId: 'bernoulli',
    authorReference: 'Frank M. White - Fluid Mechanics (8th Ed)',
    description: 'A siphon draws water from a reservoir over a hill ridge. High elevation combined with high velocity drops pressure near the vapor limit.',
    parameters: {
      z1: 10.0,
      z2: 0.0,
      p1_kPa: 101.325,
      d1: 0.15,
      d2: 0.15,
      Q_m3s: 0.04,
      headLoss_m: 1.5,
    },
    expectedTakeaway: 'The Energy Grade Line (EGL) slopes downward with friction. The Hydraulic Grade Line (HGL) must remain above the pipe elevation to maintain positive gauge pressure.',
    challengeQuestion: 'At what summit elevation will the siphon crest cavitate at 20°C?'
  },
  {
    id: 'exp-reyn-01',
    title: 'Osborne Reynolds Classic 1883 Dye Streak Experiment',
    labId: 'reynolds',
    authorReference: 'Osborne Reynolds - Royal Society Proceedings (1883)',
    description: 'Visual comparison of laminar dye filament vs chaotic turbulent vortex burst by varying velocity and conduit diameter.',
    parameters: {
      diameter: 0.025,
      velocity: 0.08,
      fluidId: 'water_20c',
    },
    expectedTakeaway: 'At Re < 2300, viscous damping prevents small perturbations from growing. At Re > 4000, inertial momentum causes instability into 3D turbulent eddies.',
    challengeQuestion: 'If we switch the fluid to Glycerin (1000x higher viscosity), what velocity is required to achieve turbulent flow?'
  },
  {
    id: 'exp-pipe-01',
    title: 'Moody Benchmark: Commercial Steel Water Main',
    labId: 'pipe-flow',
    authorReference: 'L.F. Moody - Friction Factors for Pipe Flow (ASME Trans 1944)',
    description: 'Calculate Darcy friction factor and head loss for a 500m long, 200mm diameter steel pipeline carrying 0.08 m³/s.',
    parameters: {
      diameter: 0.20,
      length: 500,
      roughness_mm: 0.045,
      flowRate_m3s: 0.08,
      elevationInlet: 50,
      elevationOutlet: 30,
      pressureInlet_kPa: 400,
      fittingsK: 2.5,
    },
    expectedTakeaway: 'For turbulent flow in rough pipes, the friction factor depends on both Reynolds number and the relative roughness ratio (ε/D).',
    challengeQuestion: 'If the pipe corrodes over 30 years and roughness increases 10x, by how many meters does the friction head loss increase?'
  },
  {
    id: 'exp-vent-01',
    title: 'ISO 5167 Standard Venturi Tube Discharge',
    labId: 'venturi',
    authorReference: 'ISO 5167 Measurement of Fluid Flow by Means of Pressure Differential Devices',
    description: 'Determine water discharge in a 250 mm main pipe with a 125 mm constricted throat under a differential pressure of 45 kPa.',
    parameters: {
      d1: 0.25,
      d2: 0.125,
      p1_kPa: 250,
      p2_kPa: 205,
      z1: 0,
      z2: 0,
      Cd: 0.98,
    },
    expectedTakeaway: 'Fluid accelerates in the throat, converting static pressure head into velocity head according to Bernoulli.',
    challengeQuestion: 'Why does a Venturi tube create far less permanent energy loss than an orifice plate with the same diameter ratio?'
  },
  {
    id: 'exp-orif-01',
    title: 'Torricelli Tank & Free Jet Trajectory',
    labId: 'orifice',
    authorReference: 'Evangelista Torricelli (1643) / Streeter Fluid Mechanics',
    description: 'Water discharges through a sharp-edged 50 mm orifice under a 4.0 m constant reservoir head, forming a vena contracta jet.',
    parameters: {
      tankHead: 4.0,
      orificeDiameter: 0.05,
      Cd: 0.62,
      Cv: 0.97,
      Cc: 0.64,
    },
    expectedTakeaway: 'The stream lines contract beyond the sharp lip to a minimum area (Vena Contracta, Cc ≈ 0.64) before spreading.',
    challengeQuestion: 'How far will the horizontal jet travel before dropping 2.0 meters to the floor?'
  },
  {
    id: 'exp-weir-01',
    title: 'USBR 90° V-Notch Triangular Discharge Flume',
    labId: 'weir',
    authorReference: 'United States Bureau of Reclamation - Water Measurement Manual',
    description: 'Precision measurement of low irrigation flows using a sharp-crested 90-degree triangular Thomson V-notch weir.',
    parameters: {
      type: 'v_notch_90',
      headOverCrest: 0.25,
      crestLength: 1.0,
      Cd: 0.58,
    },
    expectedTakeaway: 'A V-notch weir maintains high measurement sensitivity at low flow rates because discharge scales with H^(5/2).',
    challengeQuestion: 'If the head over the crest doubles from 0.15m to 0.30m, by what factor does the flow rate Q increase?'
  },
  {
    id: 'exp-open-01',
    title: 'Manning Trapezoidal Irrigation Canal',
    labId: 'open-channel',
    authorReference: 'Ven Te Chow - Open-Channel Hydraulics (McGraw-Hill)',
    description: 'Design of a concrete-lined trapezoidal channel (bottom width 2.5m, side slope 1.5:1, bed slope 0.0008, n=0.014).',
    parameters: {
      shape: 'trapezoidal',
      bottomWidth: 2.5,
      waterDepth: 1.2,
      sideSlope_z: 1.5,
      bedSlope_S0: 0.0008,
      manning_n: 0.014,
    },
    expectedTakeaway: 'Channel capacity depends strongly on the hydraulic radius Rh = A/P. Efficient hydraulic sections maximize Rh for a given area.',
    challengeQuestion: 'Is the flowing water subcritical (Fr < 1) or supercritical (Fr > 1) at this normal depth?'
  },
  {
    id: 'exp-jump-01',
    title: 'USBR Spillway Stilling Basin Hydraulic Jump',
    labId: 'hydraulic-jump',
    authorReference: 'USBR Engineering Monograph No. 25 - Hydraulic Design of Stilling Basins',
    description: 'A spillway chute discharges a fast supercritical jet (y1 = 0.4 m, V1 = 8.5 m/s) that transitions into subcritical flow.',
    parameters: {
      upstreamDepth_y1: 0.4,
      upstreamVelocity_v1: 8.5,
      channelWidth_b: 6.0,
    },
    expectedTakeaway: 'A stationary hydraulic jump dissipates up to 60% of destructive kinetic energy inside a violent turbulent roller, protecting the riverbed.',
    challengeQuestion: 'What is the sequent depth y2 and the total kilowatt energy dissipation rate inside the jump?'
  },
  {
    id: 'exp-pump-01',
    title: 'Municipal Booster Station & System Operating Point',
    labId: 'pumps',
    authorReference: 'Karassik - Pump Handbook / Hydraulic Institute Standards',
    description: 'Find the operating flow rate and head where the centrifugal pump performance curve intersects the pipeline system resistance curve.',
    parameters: {
      staticHead: 25.0,
      pipeDiameter: 0.20,
      pipeLength: 600,
      pipeRoughness_mm: 0.045,
      fittingsKSum: 8.0,
      pumpShutoffHead_H0: 55.0,
      pumpMaxDischarge_Qmax: 0.12,
      pumpSpeed_rpm: 1750,
    },
    expectedTakeaway: 'The operating point occurs at the exact intersection of the pump H-Q curve and the system head demand curve Hsys(Q). Throttling a valve steepens the system curve.',
    challengeQuestion: 'How does operating at 100 rpm faster change the delivered discharge and power requirement according to affinity laws?'
  },
];
