/**
 * EVL WTP Engineering Suite - Filter Media Registry
 * Specifications for filter media layers used in single, dual, and multi-media filters.
 */

export interface FilterMediaSpec {
  id: string;
  name: string;
  material: string;
  effectiveSizeMm: number; // d10
  uniformityCoefficientUC: number; // d60/d10
  specificGravity: number;
  bulkDensityKgM3: number;
  porosityRatio: number;
  recommendedMinDepthMm: number;
  recommendedMaxDepthMm: number;
  application: string;
  standardReference: string;
}

export const MASTER_MEDIA_REGISTRY: FilterMediaSpec[] = [
  {
    id: 'MED-SND-001',
    name: 'Standard Silica Filter Sand',
    material: 'Quartz Silica Sand',
    effectiveSizeMm: 0.55,
    uniformityCoefficientUC: 1.45,
    specificGravity: 2.65,
    bulkDensityKgM3: 1600,
    porosityRatio: 0.42,
    recommendedMinDepthMm: 600,
    recommendedMaxDepthMm: 750,
    application: 'Rapid Gravity Sand Filters / Mono-media bed',
    standardReference: 'AWWA B100 / CPHEEO 2021'
  },
  {
    id: 'MED-SND-002',
    name: 'Fine Sand Layer',
    material: 'Quartz Silica Sand',
    effectiveSizeMm: 0.45,
    uniformityCoefficientUC: 1.35,
    specificGravity: 2.65,
    bulkDensityKgM3: 1620,
    porosityRatio: 0.40,
    recommendedMinDepthMm: 300,
    recommendedMaxDepthMm: 500,
    application: 'Polishing layer in dual media / Slow sand filters',
    standardReference: 'AWWA B100'
  },
  {
    id: 'MED-ANT-001',
    name: 'Filter Anthracite Coal',
    material: 'Crushed Anthracite Coal',
    effectiveSizeMm: 0.95,
    uniformityCoefficientUC: 1.40,
    specificGravity: 1.55,
    bulkDensityKgM3: 850,
    porosityRatio: 0.50,
    recommendedMinDepthMm: 300,
    recommendedMaxDepthMm: 600,
    application: 'Top layer in Dual Media (Anthracite-Sand) Filters',
    standardReference: 'AWWA B100'
  },
  {
    id: 'MED-GAC-001',
    name: 'Granular Activated Carbon (GAC)',
    material: 'Bituminous Coal Activated Carbon',
    effectiveSizeMm: 0.90,
    uniformityCoefficientUC: 1.50,
    specificGravity: 1.35,
    bulkDensityKgM3: 500,
    porosityRatio: 0.55,
    recommendedMinDepthMm: 500,
    recommendedMaxDepthMm: 1200,
    application: 'Adsorption filter for taste, odor, and organic micropollutants',
    standardReference: 'AWWA B604'
  },
  {
    id: 'MED-GAR-001',
    name: 'Garnet Sand',
    material: 'High Density Garnet Grain',
    effectiveSizeMm: 0.30,
    uniformityCoefficientUC: 1.40,
    specificGravity: 4.10,
    bulkDensityKgM3: 2300,
    porosityRatio: 0.38,
    recommendedMinDepthMm: 75,
    recommendedMaxDepthMm: 150,
    application: 'Bottom heavy layer in Multi-media (Garnet-Sand-Anthracite) filters',
    standardReference: 'AWWA B100'
  },
  {
    id: 'MED-GRV-001',
    name: 'Graded Filter Support Gravel',
    material: 'Rounded River Gravel (2mm - 40mm)',
    effectiveSizeMm: 6.0,
    uniformityCoefficientUC: 1.20,
    specificGravity: 2.65,
    bulkDensityKgM3: 1700,
    porosityRatio: 0.35,
    recommendedMinDepthMm: 350,
    recommendedMaxDepthMm: 500,
    application: 'Underdrain media support layers (5-layer graded gravel)',
    standardReference: 'AWWA B100 / CPHEEO 2021'
  }
];

export function getMediaById(id: string): FilterMediaSpec | undefined {
  return MASTER_MEDIA_REGISTRY.find(m => m.id === id);
}
