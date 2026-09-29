export interface EngineeringSpecification {
  id: string;
  section: string;
  materialName: string;
  standard: string;
  gradeOrClass: string;
  pressureClass?: string;
  testingRequirement: string;
  acceptanceCriteria: string;
  source: string;
  notes?: string;
}

/**
 * EVL WTP Engineering Suite - Specification Database
 * Comprehensive database of civil, mechanical, piping, electrical, and instrument specifications.
 */
export const MASTER_SPECIFICATION_REGISTRY: EngineeringSpecification[] = [
  // Civil & Structural Specs
  {
    id: 'SPEC-CIV-001',
    section: 'Civil / Concrete',
    materialName: 'Water Retaining Concrete',
    standard: 'IS 3370 / BS 8007 / ACI 350',
    gradeOrClass: 'M35 / C35 Water Resistant',
    testingRequirement: 'Compressive Cube Strength @ 28 days, Permeability Test DIN 1048',
    acceptanceCriteria: 'Min 35 N/mm² cube strength, water penetration < 10 mm',
    source: 'CPHEEO Manual / AWWA Standards'
  },
  {
    id: 'SPEC-CIV-002',
    section: 'Civil / Steel',
    materialName: 'Reinforcement Steel Bars',
    standard: 'IS 1786 / ASTM A615 Grade 60',
    gradeOrClass: 'Fe500D High Yield Corrosion Resistant',
    testingRequirement: 'Tensile Strength, 0.2% Proof Stress, Bend & Rebend Test',
    acceptanceCriteria: 'Yield Stress >= 500 N/mm², Elongation >= 16%',
    source: 'National Building Code / ACI'
  },
  // Piping Specs
  {
    id: 'SPEC-PIP-001',
    section: 'Piping / Water Main',
    materialName: 'Ductile Iron (DI) Pipes',
    standard: 'ISO 2531 / EN 545 / AWWA C151',
    gradeOrClass: 'Class K9 Pressure Class',
    pressureClass: 'PN16 / PN25',
    testingRequirement: 'Hydrostatic Factory Pressure Test, Zinc & Bitumen Coating Thickness',
    acceptanceCriteria: 'Hydrostatic test pressure >= 40 bar factory, coating >= 200 g/m²',
    source: 'AWWA M41 / ISO'
  },
  {
    id: 'SPEC-PIP-002',
    section: 'Piping / Chemical Lines',
    materialName: 'Stainless Steel Chemical Dosing Lines',
    standard: 'ASTM A312 / EN 10217-7',
    gradeOrClass: 'SS316L Low Carbon Seamless/Welded',
    pressureClass: 'Schedule 10S / 40S',
    testingRequirement: 'Radiographic Weld Examination, PMI Material Verification',
    acceptanceCriteria: '100% PMI verification, 10% Radiographic inspection',
    source: 'ASTM Standards'
  },
  // Valves Specs
  {
    id: 'SPEC-VAL-001',
    section: 'Valves / Process Control',
    materialName: 'Double Eccentric Butterfly Valves',
    standard: 'BS EN 593 / AWWA C504',
    gradeOrClass: 'Ductile Iron Body GGG40, SS316 Disc',
    pressureClass: 'PN16',
    testingRequirement: 'Seat Leakage Test, Shell Hydrostatic Test BS EN 12266-1',
    acceptanceCriteria: 'Zero seat leakage at 1.1x PN, Shell test at 1.5x PN',
    source: 'AWWA / EN Standards'
  },
  // Mechanical Specs
  {
    id: 'SPEC-MCH-001',
    section: 'Mechanical / Pumps',
    materialName: 'Horizontal Split Case Water Pumps',
    standard: 'ISO 9905 / Hydraulic Institute HI 1.3',
    gradeOrClass: 'CI Body / Duplex SS Impeller / SS410 Shaft',
    pressureClass: 'PN16 / PN25',
    testingRequirement: 'Factory Performance Test Curve (ISO 9906 Grade 1B), NPSH Test',
    acceptanceCriteria: 'Efficiency within ±2.5%, vibration < 2.8 mm/s RMS',
    source: 'HI Standards / ISO'
  },
  // Electrical Specs
  {
    id: 'SPEC-ELC-001',
    section: 'Electrical / Substation',
    materialName: 'Oil Immersed Power Transformer',
    standard: 'IEC 60076 / IEEE C57.12',
    gradeOrClass: 'ONAN Cooling Class 11kV/0.415kV',
    testingRequirement: 'Type Tests, Routine Winding Resistance, Dielectric Impulse Test',
    acceptanceCriteria: 'No-load losses & load losses within IEC specified tolerance ±10%',
    source: 'IEC / IEEE'
  },
  // Instrumentation Specs
  {
    id: 'SPEC-ICA-001',
    section: 'Instrumentation / Flow',
    materialName: 'Electromagnetic Flow Transmitters',
    standard: 'ISO 9104 / EN 29104 / AWWA C750',
    gradeOrClass: 'IP68 Sensor Submersible, Hard Rubber Liner, Hastelloy C Electrodes',
    pressureClass: 'PN16',
    testingRequirement: 'NIST Traceable Flow Calibration Rig Certificate',
    acceptanceCriteria: 'Accuracy ±0.2% of measured value across 0.3 - 10 m/s range',
    source: 'ISO / NIST'
  }
];

export function getSpecificationById(id: string): EngineeringSpecification | undefined {
  return MASTER_SPECIFICATION_REGISTRY.find(s => s.id === id);
}
