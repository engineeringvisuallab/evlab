import { MoleculeData } from '../types/chemistry';

export const MOLECULES: MoleculeData[] = [
  {
    id: 'h2o',
    name: 'Water',
    formula: 'H₂O',
    iupacName: 'Oxidane',
    category: 'inorganic',
    molarMass: 18.015,
    vseprGeometry: 'Bent (Angular)',
    bondAngle: 104.5,
    dipoleMoment: 1.85,
    hybridization: 'sp³',
    atoms: [
      { id: 'O1', element: 'O', x: 0, y: 0, z: 0 },
      { id: 'H1', element: 'H', x: 0.757, y: 0.586, z: 0 },
      { id: 'H2', element: 'H', x: -0.757, y: 0.586, z: 0 }
    ],
    bonds: [
      { from: 'O1', to: 'H1', order: 1 },
      { from: 'O1', to: 'H2', order: 1 }
    ],
    description: 'Universal polar solvent with anomalous density behavior and hydrogen bonding network.',
    applications: ['Biological solvent for cellular reactions', 'Steam power cycle', 'Thermal buffer for climate']
  },
  {
    id: 'co2',
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    iupacName: 'Carbon dioxide',
    category: 'inorganic',
    molarMass: 44.01,
    vseprGeometry: 'Linear',
    bondAngle: 180.0,
    dipoleMoment: 0.0,
    hybridization: 'sp',
    atoms: [
      { id: 'C1', element: 'C', x: 0, y: 0, z: 0 },
      { id: 'O1', element: 'O', x: 1.163, y: 0, z: 0 },
      { id: 'O2', element: 'O', x: -1.163, y: 0, z: 0 }
    ],
    bonds: [
      { from: 'C1', to: 'O1', order: 2 },
      { from: 'C1', to: 'O2', order: 2 }
    ],
    description: 'Linear symmetrical non-polar gas despite having two polar C=O bonds (dipoles cancel).',
    applications: ['Photosynthesis substrate', 'Supercritical extraction of decaf coffee', 'Fire extinguishers', 'Carbonated drinks']
  },
  {
    id: 'ch4',
    name: 'Methane',
    formula: 'CH₄',
    iupacName: 'Methane',
    category: 'organic',
    molarMass: 16.04,
    vseprGeometry: 'Tetrahedral',
    bondAngle: 109.5,
    dipoleMoment: 0.0,
    hybridization: 'sp³',
    atoms: [
      { id: 'C1', element: 'C', x: 0, y: 0, z: 0 },
      { id: 'H1', element: 'H', x: 0.629, y: 0.629, z: 0.629 },
      { id: 'H2', element: 'H', x: -0.629, y: -0.629, z: 0.629 },
      { id: 'H3', element: 'H', x: -0.629, y: 0.629, z: -0.629 },
      { id: 'H4', element: 'H', x: 0.629, y: -0.629, z: -0.629 }
    ],
    bonds: [
      { from: 'C1', to: 'H1', order: 1 },
      { from: 'C1', to: 'H2', order: 1 },
      { from: 'C1', to: 'H3', order: 1 },
      { from: 'C1', to: 'H4', order: 1 }
    ],
    description: 'Simplest alkane and major component of natural gas with perfect tetrahedral symmetry.',
    applications: ['Clean fossil fuel heating', 'Hydrogen synthesis via steam methane reforming', 'Feedstock for plastics']
  },
  {
    id: 'nh3',
    name: 'Ammonia',
    formula: 'NH₃',
    iupacName: 'Azane',
    category: 'inorganic',
    molarMass: 17.031,
    vseprGeometry: 'Trigonal Pyramidal',
    bondAngle: 107.8,
    dipoleMoment: 1.47,
    hybridization: 'sp³',
    atoms: [
      { id: 'N1', element: 'N', x: 0, y: 0, z: 0.116 },
      { id: 'H1', element: 'H', x: 0.938, y: 0, z: -0.27 },
      { id: 'H2', element: 'H', x: -0.469, y: 0.812, z: -0.27 },
      { id: 'H3', element: 'H', x: -0.469, y: -0.812, z: -0.27 }
    ],
    bonds: [
      { from: 'N1', to: 'H1', order: 1 },
      { from: 'N1', to: 'H2', order: 1 },
      { from: 'N1', to: 'H3', order: 1 }
    ],
    description: 'Pungent basic gas with a lone pair causing pyramidal geometry and Bronsted-Lowry base activity.',
    applications: ['Agricultural fertilizer synthesis (Haber-Bosch)', 'Industrial cleaning agent', 'Refrigeration cycle refrigerant']
  },
  {
    id: 'c6h6',
    name: 'Benzene',
    formula: 'C₆H₆',
    iupacName: 'Benzene',
    category: 'organic',
    molarMass: 78.11,
    vseprGeometry: 'Planar Hexagonal (Aromatic)',
    bondAngle: 120.0,
    dipoleMoment: 0.0,
    hybridization: 'sp²',
    atoms: [
      { id: 'C1', element: 'C', x: 1.397, y: 0, z: 0 },
      { id: 'C2', element: 'C', x: 0.698, y: 1.209, z: 0 },
      { id: 'C3', element: 'C', x: -0.698, y: 1.209, z: 0 },
      { id: 'C4', element: 'C', x: -1.397, y: 0, z: 0 },
      { id: 'C5', element: 'C', x: -0.698, y: -1.209, z: 0 },
      { id: 'C6', element: 'C', x: 0.698, y: -1.209, z: 0 },
      { id: 'H1', element: 'H', x: 2.481, y: 0, z: 0 },
      { id: 'H2', element: 'H', x: 1.240, y: 2.148, z: 0 },
      { id: 'H3', element: 'H', x: -1.240, y: 2.148, z: 0 },
      { id: 'H4', element: 'H', x: -2.481, y: 0, z: 0 },
      { id: 'H5', element: 'H', x: -1.240, y: -2.148, z: 0 },
      { id: 'H6', element: 'H', x: 1.240, y: -2.148, z: 0 }
    ],
    bonds: [
      { from: 'C1', to: 'C2', order: 2 },
      { from: 'C2', to: 'C3', order: 1 },
      { from: 'C3', to: 'C4', order: 2 },
      { from: 'C4', to: 'C5', order: 1 },
      { from: 'C5', to: 'C6', order: 2 },
      { from: 'C6', to: 'C1', order: 1 },
      { from: 'C1', to: 'H1', order: 1 },
      { from: 'C2', to: 'H2', order: 1 },
      { from: 'C3', to: 'H3', order: 1 },
      { from: 'C4', to: 'H4', order: 1 },
      { from: 'C5', to: 'H5', order: 1 },
      { from: 'C6', to: 'H6', order: 1 }
    ],
    description: 'Prototypical aromatic hydrocarbon with delocalized cyclic pi-electron cloud obeying Hückel\'s 4n+2 rule.',
    applications: ['Precursor to ethylbenzene for polystyrene', 'Synthetic rubbers and dyes', 'Nylon fiber synthesis']
  },
  {
    id: 'c2h5oh',
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    iupacName: 'Ethanol',
    category: 'organic',
    molarMass: 46.07,
    vseprGeometry: 'Tetrahedral / Bent (Hydroxyl)',
    bondAngle: 108.5,
    dipoleMoment: 1.69,
    hybridization: 'sp³',
    atoms: [
      { id: 'C1', element: 'C', x: -1.17, y: -0.28, z: 0 },
      { id: 'C2', element: 'C', x: 0.12, y: 0.52, z: 0 },
      { id: 'O1', element: 'O', x: 1.25, y: -0.34, z: 0 },
      { id: 'H1', element: 'H', x: 2.05, y: 0.19, z: 0 },
      { id: 'H2', element: 'H', x: -1.24, y: -0.92, z: 0.88 },
      { id: 'H3', element: 'H', x: -1.24, y: -0.92, z: -0.88 },
      { id: 'H4', element: 'H', x: -2.03, y: 0.39, z: 0 },
      { id: 'H5', element: 'H', x: 0.19, y: 1.16, z: 0.88 },
      { id: 'H6', element: 'H', x: 0.19, y: 1.16, z: -0.88 }
    ],
    bonds: [
      { from: 'C1', to: 'C2', order: 1 },
      { from: 'C2', to: 'O1', order: 1 },
      { from: 'O1', to: 'H1', order: 1 },
      { from: 'C1', to: 'H2', order: 1 },
      { from: 'C1', to: 'H3', order: 1 },
      { from: 'C1', to: 'H4', order: 1 },
      { from: 'C2', to: 'H5', order: 1 },
      { from: 'C2', to: 'H6', order: 1 }
    ],
    description: 'Primary alcohol miscible with water, widely used as antiseptic solvent and renewable biofuel.',
    applications: ['Hand sanitizers & medical antiseptics', 'Bioethanol blend fuel (E10/E85)', 'Chemical synthesis feedstock']
  },
  {
    id: 'ch3cooh',
    name: 'Acetic Acid',
    formula: 'CH₃COOH',
    iupacName: 'Ethanoic acid',
    category: 'organic',
    molarMass: 60.052,
    vseprGeometry: 'Trigonal Planar (Carboxyl C)',
    bondAngle: 120.0,
    dipoleMoment: 1.74,
    hybridization: 'sp² / sp³',
    atoms: [
      { id: 'C1', element: 'C', x: -1.39, y: -0.11, z: 0 },
      { id: 'C2', element: 'C', x: 0.08, y: 0.13, z: 0 },
      { id: 'O1', element: 'O', x: 0.64, y: 1.21, z: 0 },
      { id: 'O2', element: 'O', x: 0.77, y: -1.04, z: 0 },
      { id: 'H1', element: 'H', x: 1.71, y: -0.85, z: 0 },
      { id: 'H2', element: 'H', x: -1.64, y: -1.16, z: 0 },
      { id: 'H3', element: 'H', x: -1.81, y: 0.39, z: 0.88 },
      { id: 'H4', element: 'H', x: -1.81, y: 0.39, z: -0.88 }
    ],
    bonds: [
      { from: 'C1', to: 'C2', order: 1 },
      { from: 'C2', to: 'O1', order: 2 },
      { from: 'C2', to: 'O2', order: 1 },
      { from: 'O2', to: 'H1', order: 1 },
      { from: 'C1', to: 'H2', order: 1 },
      { from: 'C1', to: 'H3', order: 1 },
      { from: 'C1', to: 'H4', order: 1 }
    ],
    description: 'Weak carboxylic acid responsible for the sour taste of vinegar (Ka = 1.8 × 10⁻⁵).',
    applications: ['Table vinegar (5-8%)', 'Vinyl acetate monomer for paints & adhesives', 'Buffer solution preparation']
  },
  {
    id: 'sf6',
    name: 'Sulfur Hexafluoride',
    formula: 'SF₆',
    iupacName: 'Sulfur hexafluoride',
    category: 'inorganic',
    molarMass: 146.06,
    vseprGeometry: 'Octahedral',
    bondAngle: 90.0,
    dipoleMoment: 0.0,
    hybridization: 'sp³d²',
    atoms: [
      { id: 'S1', element: 'S', x: 0, y: 0, z: 0 },
      { id: 'F1', element: 'F', x: 1.56, y: 0, z: 0 },
      { id: 'F2', element: 'F', x: -1.56, y: 0, z: 0 },
      { id: 'F3', element: 'F', x: 0, y: 1.56, z: 0 },
      { id: 'F4', element: 'F', x: 0, y: -1.56, z: 0 },
      { id: 'F5', element: 'F', x: 0, y: 0, z: 1.56 },
      { id: 'F6', element: 'F', x: 0, y: 0, z: -1.56 }
    ],
    bonds: [
      { from: 'S1', to: 'F1', order: 1 },
      { from: 'S1', to: 'F2', order: 1 },
      { from: 'S1', to: 'F3', order: 1 },
      { from: 'S1', to: 'F4', order: 1 },
      { from: 'S1', to: 'F5', order: 1 },
      { from: 'S1', to: 'F6', order: 1 }
    ],
    description: 'Extremely dense, chemically inert gas with 6 bonded pairs in symmetrical octahedral geometry.',
    applications: ['High-voltage electrical switchgear insulator', 'Retinal detachment eye surgery gas tamponade', 'Acoustic voice deepening demonstration']
  }
];
