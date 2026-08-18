import { RealWorldSystem } from '../types/unifiedModel';

export const REAL_WORLD_SYSTEMS: RealWorldSystem[] = [
  {
    id: 'civil-bridge-girder',
    title: 'Highway Overpass Composite Steel Girder',
    domain: 'Civil / Structural',
    imageTag: 'bridge_girder',
    description: 'A simply supported steel plate girder carrying concentrated vehicular axle loads and uniform concrete deck dead loads across an interstate highway span.',
    topicId: 'beams',
    defaultParams: {
      beamLength: 12.0,
      loadP1: 15000,
      loadP1Pos: 4.0,
      loadP2: 12000,
      loadP2Pos: 8.0,
      udlW: 450,
      eGpa: 210,
      iCm4: 45000
    },
    keyEngineeringMetric: 'Maximum Bending Moment at Midspan & Serviceability Deflection Limit (L/800)',
    typicalFailureMode: 'Flexural flange yield or lateral-torsional buckling under excessive midspan moment.',
    codeStandard: 'AASHTO LRFD Bridge Design Specifications / AISC 360-16'
  },
  {
    id: 'civil-tower-crane',
    title: 'Construction Tower Crane Jib & Boom Truss',
    domain: 'Civil / Structural',
    imageTag: 'tower_crane',
    description: 'A triangular lattice truss jib supporting a heavy concrete hopper suspended from a movable trolley.',
    topicId: 'trusses',
    defaultParams: {
      trussSpan: 10.0,
      trussHeight: 3.5,
      jointLoadN: 8500
    },
    keyEngineeringMetric: 'Critical Top Chord Compression & Diagonal Web Bar Buckling Resistance',
    typicalFailureMode: 'Euler column buckling of slender diagonal web members under high compressive surge.',
    codeStandard: 'EN 1993-1-1 (Eurocode 3) / OSHA 1926.1400 Crane Safety Standards'
  },
  {
    id: 'mech-engine-slider-crank',
    title: 'Internal Combustion Engine Slider-Crank Mechanism',
    domain: 'Mechanical / Automotive',
    imageTag: 'slider_crank',
    description: 'High-speed crankshaft, connecting rod, and reciprocating piston converting cylinder combustion gas pressure into rotational output torque.',
    topicId: 'mechanisms',
    defaultParams: {
      crankRadiusR: 0.045,
      connectingRodL: 0.145,
      crankOmegaRpm: 3600,
      crankAngleDeg: 60
    },
    keyEngineeringMetric: 'Peak Piston Acceleration at Top Dead Center (TDC) generating primary inertial forces',
    typicalFailureMode: 'Connecting rod fatigue cracking or bearing pin fretting wear under cyclic shock loads.',
    codeStandard: 'SAE J1349 Engine Power & Dynamic Rating Standard'
  },
  {
    id: 'mech-flywheel-press',
    title: 'Heavy Industrial Stamping Press Flywheel',
    domain: 'Mechanical / Automotive',
    imageTag: 'flywheel',
    description: 'A massive rotating solid steel cylinder storing kinetic energy during motor spin-up and releasing sudden rotational punch energy during metal stamping.',
    topicId: 'rotation',
    defaultParams: {
      massKg: 85,
      radiusM: 0.65,
      torqueNm: 120,
      simDurationS: 6
    },
    keyEngineeringMetric: 'Stored Rotational Kinetic Energy (E_k = 1/2·I·ω²) & Rim Hoop Stress',
    typicalFailureMode: 'Centrifugal tensile hoop stress exceeding alloy tensile limit at runaway RPM.',
    codeStandard: 'ASME Boiler & Pressure Vessel Code / Machinery Safety ISO 12100'
  },
  {
    id: 'civil-retaining-wall',
    title: 'Gravity Retaining Wall Soil Sliding & Incline Interface',
    domain: 'Civil / Structural',
    imageTag: 'retaining_wall',
    description: 'Precast concrete mass retaining wall stabilizing steep earth embankments against lateral soil thrust and sliding along the foundation bedding angle.',
    topicId: 'friction',
    defaultParams: {
      mass: 45,
      appliedForce: 180,
      inclineAngleDeg: 12,
      muS: 0.58,
      muK: 0.42
    },
    keyEngineeringMetric: 'Factor of Safety Against Basal Sliding (FS_sliding ≥ 1.50)',
    typicalFailureMode: 'Basal shear slip or toe tipping when lateral earth pressure exceeds base friction resistance.',
    codeStandard: 'FHWA-NHI-06-088 Soils and Foundations / ACI 318 Concrete Design'
  }
];
