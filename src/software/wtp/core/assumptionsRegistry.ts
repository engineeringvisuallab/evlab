/**
 * EVL WTP Engineering Suite - Assumptions Registry
 * Explicitly tracks and documents all engineering assumptions used across calculations.
 * Eliminates "black-box" magic numbers.
 */

export interface EngineeringAssumption {
  id: string;
  category: string;
  description: string;
  value: number | string;
  unit: string;
  reason: string;
  source: string;
  standard: string;
  editable: boolean;
  engineerVerificationRequired: boolean;
}

export const ENGINEERING_ASSUMPTIONS_REGISTRY: EngineeringAssumption[] = [
  {
    id: 'ASM-GEN-001',
    category: 'General Process',
    description: 'Plant Daily Operating Hours',
    value: 24,
    unit: 'hours/day',
    reason: 'Continuous municipal treatment plant operation standard.',
    source: 'CPHEEO Manual 2021',
    standard: 'CPHEEO Vol I, Sec 2.4',
    editable: true,
    engineerVerificationRequired: false
  },
  {
    id: 'ASM-GEN-002',
    category: 'General Process',
    description: 'Plant Internal Loss Factor',
    value: 5.0,
    unit: '%',
    reason: 'Accounts for backwash water, clarifier sludge blowdown, and sampling sink losses.',
    source: 'AWWA M51 / CPHEEO',
    standard: 'CPHEEO Vol I, Sec 3.1',
    editable: true,
    engineerVerificationRequired: false
  },
  {
    id: 'ASM-HYD-001',
    category: 'Hydraulics',
    description: 'Dynamic Viscosity of Water (at 20°C)',
    value: 0.001002,
    unit: 'Pa·s',
    reason: 'Fluid property for calculating velocity gradient G and settling velocities.',
    source: 'Crane Technical Paper No. 410',
    standard: 'ISO 3104 / AWWA',
    editable: true,
    engineerVerificationRequired: false
  },
  {
    id: 'ASM-HYD-002',
    category: 'Hydraulics',
    description: 'Kinematic Viscosity of Water (at 20°C)',
    value: 1.004e-6,
    unit: 'm²/s',
    reason: 'Used for Reynolds number and friction factor calculations.',
    source: 'Fluid Mechanics Data Handbook',
    standard: 'ISO 3104',
    editable: false,
    engineerVerificationRequired: false
  },
  {
    id: 'ASM-HYD-003',
    category: 'Hydraulics',
    description: 'Density of Water (at 20°C)',
    value: 998.2,
    unit: 'kg/m³',
    reason: 'Fluid mass density for power and headloss calculations.',
    source: 'IAPWS-IF97',
    standard: 'ISO 80000-4',
    editable: false,
    engineerVerificationRequired: false
  },
  {
    id: 'ASM-HYD-004',
    category: 'Hydraulics',
    description: 'Hazen-Williams Roughness Coefficient (Ductile Iron Pipe)',
    value: 130,
    unit: 'dimensionless',
    reason: 'Standard design friction coefficient for cement-mortar lined DI pipes.',
    source: 'CPHEEO / AWWA M11',
    standard: 'AWWA M11',
    editable: true,
    engineerVerificationRequired: true
  },
  {
    id: 'ASM-COA-001',
    category: 'Coagulation',
    description: 'Alum Hydroxide Sludge Yield Factor',
    value: 0.26,
    unit: 'kg dry solids / kg alum',
    reason: 'Stoichiometric yield of Al(OH)3 precipitate per kg of commercial alum added.',
    source: 'AWWA Water Treatment Plant Design 5th Ed',
    standard: 'AWWA M37',
    editable: false,
    engineerVerificationRequired: false
  },
  {
    id: 'ASM-COA-002',
    category: 'Alkalinity Balance',
    description: 'Alum Alkalinity Consumption Factor',
    value: 0.45,
    unit: 'mg/L CaCO3 / mg/L alum',
    reason: 'Stoichiometric consumption of natural alkalinity by alum coagulation.',
    source: 'CPHEEO Manual 2021',
    standard: 'CPHEEO Vol I, Sec 6.3',
    editable: false,
    engineerVerificationRequired: true
  },
  {
    id: 'ASM-COA-003',
    category: 'Alkalinity Balance',
    description: 'Ferric Chloride Alkalinity Consumption Factor',
    value: 0.92,
    unit: 'mg/L CaCO3 / mg/L FeCl3',
    reason: 'Stoichiometric consumption of natural alkalinity by ferric chloride.',
    source: 'AWWA Water Quality & Treatment 6th Ed',
    standard: 'AWWA M37',
    editable: false,
    engineerVerificationRequired: true
  },
  {
    id: 'ASM-SED-001',
    category: 'Sedimentation',
    description: 'Floc Specific Gravity',
    value: 1.05,
    unit: 'ratio',
    reason: 'Density ratio of alum-clay microfloc relative to water.',
    source: 'CPHEEO Manual 2021',
    standard: 'CPHEEO Vol I, Sec 7.2',
    editable: true,
    engineerVerificationRequired: true
  },
  {
    id: 'ASM-FIL-001',
    category: 'Filtration',
    description: 'Sand Media Porosity',
    value: 0.42,
    unit: 'ratio',
    reason: 'Unexpanded clean bed void fraction for headloss equations.',
    source: 'AWWA B100',
    standard: 'AWWA B100',
    editable: true,
    engineerVerificationRequired: false
  },
  {
    id: 'ASM-FIL-002',
    category: 'Filtration',
    description: 'Sand Media Specific Gravity',
    value: 2.65,
    unit: 'ratio',
    reason: 'Standard quartz sand density ratio.',
    source: 'AWWA B100',
    standard: 'AWWA B100',
    editable: false,
    engineerVerificationRequired: false
  },
  {
    id: 'ASM-DIS-001',
    category: 'Disinfection',
    description: 'Chlorine Demand of Clarified Water',
    value: 1.5,
    unit: 'mg/L',
    reason: 'Expected organic and inorganic chlorine demand prior to free residual accumulation.',
    source: 'WHO Guidelines for Drinking-water Quality',
    standard: 'WHO 2022 / CPHEEO',
    editable: true,
    engineerVerificationRequired: true
  },
  {
    id: 'ASM-ELE-001',
    category: 'Electrical',
    description: 'Overall Motor Power Factor',
    value: 0.88,
    unit: 'lagging',
    reason: 'Average power factor for industrial induction motors in WTP pump stations.',
    source: 'IEEE Red Book / CPHEEO',
    standard: 'IEEE Std 141',
    editable: true,
    engineerVerificationRequired: false
  }
];
