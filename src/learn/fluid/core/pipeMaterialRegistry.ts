/**
 * EVLab Pipe Material & Roughness Registry
 * Standard engineering values from White, Moody, Crane Technical Paper 410
 */

import { PipeMaterial } from '../types';

export const PIPE_MATERIALS: PipeMaterial[] = [
  {
    id: 'pvc_smooth',
    name: 'PVC / HDPE / Plastic (Smooth)',
    roughness_mm: 0.0015,
    roughness_ft: 0.000005,
    category: 'plastic',
    description: 'Extremely smooth drawn plastic, minimal surface resistance.'
  },
  {
    id: 'drawn_copper_brass',
    name: 'Drawn Copper / Brass / Glass',
    roughness_mm: 0.0015,
    roughness_ft: 0.000005,
    category: 'metal',
    description: 'Smooth drawn non-ferrous tubing, very low friction.'
  },
  {
    id: 'commercial_steel',
    name: 'Commercial Steel / Wrought Iron (New)',
    roughness_mm: 0.045,
    roughness_ft: 0.00015,
    category: 'commercial',
    description: 'Standard schedule 40 / 80 steel pipe in clean condition.'
  },
  {
    id: 'ductile_iron_cement',
    name: 'Ductile Iron (Cement Mortar Lined)',
    roughness_mm: 0.03,
    roughness_ft: 0.0001,
    category: 'commercial',
    description: 'Common for municipal water distribution mains.'
  },
  {
    id: 'galvanized_iron',
    name: 'Galvanized Iron / Steel',
    roughness_mm: 0.15,
    roughness_ft: 0.0005,
    category: 'metal',
    description: 'Zinc-coated steel with moderate surface irregularities.'
  },
  {
    id: 'cast_iron_unlined',
    name: 'Cast Iron (Unlined, Asphalted)',
    roughness_mm: 0.12,
    roughness_ft: 0.0004,
    category: 'metal',
    description: 'Traditional water utility piping.'
  },
  {
    id: 'cast_iron_old',
    name: 'Cast Iron (Old / Corroded)',
    roughness_mm: 0.8,
    roughness_ft: 0.0026,
    category: 'metal',
    description: 'Aged pipe with internal scaling, tuberculation and rust.'
  },
  {
    id: 'concrete_smooth',
    name: 'Smooth Finished Concrete',
    roughness_mm: 0.30,
    roughness_ft: 0.001,
    category: 'concrete',
    description: 'Pre-cast culverts and carefully troweled pipes.'
  },
  {
    id: 'concrete_rough',
    name: 'Rough Concrete / Stone Masonry',
    roughness_mm: 2.0,
    roughness_ft: 0.0065,
    category: 'concrete',
    description: 'Cast-in-place concrete with rough formwork or erosion.'
  },
  {
    id: 'corrugated_metal',
    name: 'Corrugated Metal Pipe (Culverts)',
    roughness_mm: 45.0,
    roughness_ft: 0.15,
    category: 'commercial',
    description: 'Heavy annular corrugations, extremely high turbulence.'
  },
];
