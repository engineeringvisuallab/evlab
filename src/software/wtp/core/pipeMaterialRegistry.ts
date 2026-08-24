/**
 * EVL WTP Engineering Suite - Pipe Material Registry
 * Engineering specifications for water supply, plant piping, and transmission main materials.
 */

export interface PipeMaterialSpec {
  id: string;
  code: string;
  name: string;
  category: 'Ductile Iron' | 'Steel' | 'Plastic' | 'Concrete' | 'Composite';
  hazenWilliamsCNew: number;
  hazenWilliamsCDesign: number; // 10-30 year design value
  darcyRoughnessEpsilonMm: number; // mm
  manningN: number;
  elasticModulusGPa: number; // E for surge wave speed calculation
  standardPressureRatingsBar: number[]; // e.g. PN10, PN16, PN25
  recommendedMinVelocityMs: number;
  recommendedMaxVelocityMs: number;
  applicableApplications: string[];
  standardReferences: string[];
  notes: string;
}

export const MASTER_PIPE_MATERIAL_REGISTRY: PipeMaterialSpec[] = [
  {
    id: 'MAT-DI-001',
    code: 'DI',
    name: 'Ductile Iron (Cement Mortar Lined)',
    category: 'Ductile Iron',
    hazenWilliamsCNew: 140,
    hazenWilliamsCDesign: 130,
    darcyRoughnessEpsilonMm: 0.05,
    manningN: 0.011,
    elasticModulusGPa: 170,
    standardPressureRatingsBar: [10, 16, 25, 40],
    recommendedMinVelocityMs: 0.6,
    recommendedMaxVelocityMs: 2.5,
    applicableApplications: ['Plant Raw & Treated Mains', 'High Lift Discharge', 'Pumping Mains'],
    standardReferences: ['ISO 2531', 'AWWA C151', 'IS 8329'],
    notes: 'Industry standard for plant pressure piping and high lift pumping mains.'
  },
  {
    id: 'MAT-MS-001',
    code: 'MS',
    name: 'Mild Steel (Epoxy / Concrete Lined)',
    category: 'Steel',
    hazenWilliamsCNew: 145,
    hazenWilliamsCDesign: 125,
    darcyRoughnessEpsilonMm: 0.04,
    manningN: 0.012,
    elasticModulusGPa: 205,
    standardPressureRatingsBar: [10, 16, 25, 40, 64],
    recommendedMinVelocityMs: 0.6,
    recommendedMaxVelocityMs: 3.0,
    applicableApplications: ['Large Diameter Raw Mains (>DN900)', 'Header Pipes', 'Intake Conduit'],
    standardReferences: ['AWWA C200', 'IS 3589'],
    notes: 'Used for large diameter raw water transmission and high pressure headers.'
  },
  {
    id: 'MAT-PE-001',
    code: 'HDPE',
    name: 'High-Density Polyethylene (HDPE PE100)',
    category: 'Plastic',
    hazenWilliamsCNew: 150,
    hazenWilliamsCDesign: 140,
    darcyRoughnessEpsilonMm: 0.007,
    manningN: 0.009,
    elasticModulusGPa: 1.0,
    standardPressureRatingsBar: [6, 10, 12.5, 16, 20],
    recommendedMinVelocityMs: 0.6,
    recommendedMaxVelocityMs: 2.0,
    applicableApplications: ['Chemical Feed Lines', 'Underground Sludge Piping', 'Submerged Intake'],
    standardReferences: ['ISO 4427', 'AWWA C906', 'IS 4984'],
    notes: 'Excellent chemical resistance and high flexibility; low surge wave speed reduces water hammer.'
  },
  {
    id: 'MAT-PVC-001',
    code: 'uPVC',
    name: 'Unplasticized Polyvinyl Chloride (uPVC)',
    category: 'Plastic',
    hazenWilliamsCNew: 150,
    hazenWilliamsCDesign: 140,
    darcyRoughnessEpsilonMm: 0.009,
    manningN: 0.009,
    elasticModulusGPa: 3.0,
    standardPressureRatingsBar: [6, 10, 12.5, 16],
    recommendedMinVelocityMs: 0.6,
    recommendedMaxVelocityMs: 1.8,
    applicableApplications: ['Small Diameter Chemical Dosing', 'Sampling Lines', 'Filter Air Scour Header'],
    standardReferences: ['ISO 1452', 'AWWA C900', 'IS 4985'],
    notes: 'Rigid plastic piping ideal for chemical room dosing lines and small plant auxiliary lines.'
  },
  {
    id: 'MAT-SS-001',
    code: 'SS316',
    name: 'Stainless Steel (SS316L)',
    category: 'Steel',
    hazenWilliamsCNew: 150,
    hazenWilliamsCDesign: 140,
    darcyRoughnessEpsilonMm: 0.015,
    manningN: 0.010,
    elasticModulusGPa: 193,
    standardPressureRatingsBar: [10, 16, 25, 40],
    recommendedMinVelocityMs: 0.6,
    recommendedMaxVelocityMs: 3.5,
    applicableApplications: ['Chlorine Injection Headers', 'Ozone Gas Piping', 'Filter Underdrain Headers'],
    standardReferences: ['ASTM A312', 'AWWA C220'],
    notes: 'High corrosion resistance for strong chemical and gas handling.'
  },
  {
    id: 'MAT-RCC-001',
    code: 'RCC',
    name: 'Reinforced Concrete Conduit (Cast in-situ)',
    category: 'Concrete',
    hazenWilliamsCNew: 130,
    hazenWilliamsCDesign: 110,
    darcyRoughnessEpsilonMm: 0.30,
    manningN: 0.013,
    elasticModulusGPa: 30,
    standardPressureRatingsBar: [2.5, 6, 10],
    recommendedMinVelocityMs: 0.6,
    recommendedMaxVelocityMs: 2.0,
    applicableApplications: ['Gravity Channels', 'Inter-unit Launders', 'Raw Water Intake Conduit'],
    standardReferences: ['AWWA C300', 'IS 458', 'CPHEEO 2021'],
    notes: 'Open channel launders, gravity conduits, and structural flumes.'
  }
];

export function getPipeMaterialByCode(code: string): PipeMaterialSpec {
  return MASTER_PIPE_MATERIAL_REGISTRY.find(m => m.code === code) || MASTER_PIPE_MATERIAL_REGISTRY[0];
}
