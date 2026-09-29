/**
 * EVL WTP Engineering Suite - Master Chemical Registry
 * Structured database of coagulation, pH adjustment, disinfection, oxidation, polymer, and adsorbent chemicals.
 */

export type ChemicalCategory = 'Coagulant' | 'pH / Alkalinity' | 'Disinfectant' | 'Oxidant' | 'Polymer' | 'Adsorbent' | 'Antiscalant' | 'Custom';
export type PhysicalForm = 'Liquid Solution' | 'Dry Powder / Granular' | 'Compressed Gas' | 'Slurry';

export interface ChemicalDefinition {
  id: string;
  code: string;
  name: string;
  formula: string;
  category: ChemicalCategory;
  molecularWeightGmol: number;
  activeFraction: number; // e.g. 0.17 for 17% Al2O3 or 0.48 for 48% Alum
  purityPercent: number; // Commercial purity %
  densityKgL: number; // Density in kg/L
  stockSolutionConcentrationPercent: number; // Usual dosing stock conc %
  physicalForm: PhysicalForm;
  storageCondition: string;
  safetyNotes: string;
  hazardClass: string;
  ppeRequired: string[];
  sdsReference: string;
  costPerKgUSD: number; // Default baseline cost for comparison
  
  // Stoichiometric / Engineering Factors
  alkalinityConsumptionMgLPerMgDose: number; // mg/L Alk as CaCO3 consumed per mg/L chemical
  sludgeYieldKgPerKgChemical: number; // Dry sludge produced per kg commercial chemical
  chlorineEquivalentFactor: number; // Available chlorine equivalent factor
}

export const MASTER_CHEMICAL_REGISTRY: ChemicalDefinition[] = [
  // COAGULANTS
  {
    id: 'CHEM-COA-001',
    code: 'ALUM',
    name: 'Aluminum Sulfate (Alum)',
    formula: 'Al2(SO4)3·14H2O',
    category: 'Coagulant',
    molecularWeightGmol: 594.36,
    activeFraction: 0.48, // 48% dry alum equivalent in liquid alum
    purityPercent: 98.0,
    densityKgL: 1.33,
    stockSolutionConcentrationPercent: 10.0,
    physicalForm: 'Liquid Solution',
    storageCondition: 'FRP / Rubber-lined tanks, ambient temperature above 5°C',
    safetyNotes: 'Corrosive acidic solution. Causes severe skin burns and eye damage.',
    hazardClass: 'Class 8 Corrosive',
    ppeRequired: ['Chemical Splash Goggles', 'Neoprene Gloves', 'Acid Apron', 'Face Shield'],
    sdsReference: 'AWWA B403 / SDS-ALUM-2026',
    costPerKgUSD: 0.28,
    alkalinityConsumptionMgLPerMgDose: 0.45, // 1 mg/L Alum consumes ~0.45 mg/L Alk as CaCO3
    sludgeYieldKgPerKgChemical: 0.26, // Dry Al(OH)3 sludge per kg Alum
    chlorineEquivalentFactor: 0
  },
  {
    id: 'CHEM-COA-002',
    code: 'FERRIC_CL',
    name: 'Ferric Chloride',
    formula: 'FeCl3',
    category: 'Coagulant',
    molecularWeightGmol: 162.2,
    activeFraction: 0.42, // 42% FeCl3 commercial solution
    purityPercent: 99.0,
    densityKgL: 1.45,
    stockSolutionConcentrationPercent: 10.0,
    physicalForm: 'Liquid Solution',
    storageCondition: 'Titanium or FRP tanks, dark cool area',
    safetyNotes: 'Highly corrosive to metals. Causes severe burns and permanent eye injury.',
    hazardClass: 'Class 8 Corrosive',
    ppeRequired: ['Face Shield', 'Chemical Gauntlets', 'Acid Suit', 'Safety Boots'],
    sdsReference: 'AWWA B407 / SDS-FECL3-2026',
    costPerKgUSD: 0.35,
    alkalinityConsumptionMgLPerMgDose: 0.92, // 1 mg/L Ferric consumes ~0.92 mg/L Alk as CaCO3
    sludgeYieldKgPerKgChemical: 0.28, // Dry Fe(OH)3 sludge
    chlorineEquivalentFactor: 0
  },
  {
    id: 'CHEM-COA-003',
    code: 'PAC',
    name: 'Polyaluminum Chloride (PAC)',
    formula: 'Aln(OH)mCl(3n-m)',
    category: 'Coagulant',
    molecularWeightGmol: 174.45,
    activeFraction: 0.30, // 30% Al2O3 equivalent
    purityPercent: 95.0,
    densityKgL: 1.20,
    stockSolutionConcentrationPercent: 5.0,
    physicalForm: 'Liquid Solution',
    storageCondition: 'Polyethylene or stainless steel 316 tanks',
    safetyNotes: 'Mildly corrosive acidic solution.',
    hazardClass: 'Class 8 Corrosive',
    ppeRequired: ['Safety Glasses', 'Nitrile Gloves', 'Lab Coat'],
    sdsReference: 'AWWA B408 / SDS-PAC-2026',
    costPerKgUSD: 0.52,
    alkalinityConsumptionMgLPerMgDose: 0.20, // Low alkalinity consumption due to pre-hydrolysis
    sludgeYieldKgPerKgChemical: 0.22,
    chlorineEquivalentFactor: 0
  },
  {
    id: 'CHEM-COA-004',
    code: 'FERRIC_SO4',
    name: 'Ferric Sulfate',
    formula: 'Fe2(SO4)3',
    category: 'Coagulant',
    molecularWeightGmol: 399.88,
    activeFraction: 0.50,
    purityPercent: 98.0,
    densityKgL: 1.50,
    stockSolutionConcentrationPercent: 10.0,
    physicalForm: 'Liquid Solution',
    storageCondition: 'Plastic lined vessels',
    safetyNotes: 'Corrosive liquid.',
    hazardClass: 'Class 8 Corrosive',
    ppeRequired: ['Splash Goggles', 'Rubber Gloves'],
    sdsReference: 'AWWA B406 / SDS-FESO4-2026',
    costPerKgUSD: 0.38,
    alkalinityConsumptionMgLPerMgDose: 0.75,
    sludgeYieldKgPerKgChemical: 0.27,
    chlorineEquivalentFactor: 0
  },

  // pH / ALKALINITY CHEMICALS
  {
    id: 'CHEM-ALK-001',
    code: 'LIME',
    name: 'Hydrated Lime',
    formula: 'Ca(OH)2',
    category: 'pH / Alkalinity',
    molecularWeightGmol: 74.09,
    activeFraction: 0.90, // 90% available Ca(OH)2
    purityPercent: 90.0,
    densityKgL: 0.50, // Bulk density
    stockSolutionConcentrationPercent: 5.0, // Slurry
    physicalForm: 'Slurry',
    storageCondition: 'Dry silo with mechanical bin activator and dust extraction',
    safetyNotes: 'Caustic alkaline dust. Severe eye irritant and respiratory hazard.',
    hazardClass: 'Class 8 Corrosive Alkaline',
    ppeRequired: ['Dust Mask P3', 'Safety Goggles', 'Heavy Duty Gloves'],
    sdsReference: 'AWWA B202 / SDS-LIME-2026',
    costPerKgUSD: 0.18,
    alkalinityConsumptionMgLPerMgDose: -1.35, // Adds 1.35 mg/L Alk as CaCO3 per mg/L Lime
    sludgeYieldKgPerKgChemical: 0.10,
    chlorineEquivalentFactor: 0
  },
  {
    id: 'CHEM-ALK-002',
    code: 'CAUSTIC',
    name: 'Caustic Soda (Sodium Hydroxide)',
    formula: 'NaOH',
    category: 'pH / Alkalinity',
    molecularWeightGmol: 40.0,
    activeFraction: 0.50, // 50% membrane grade solution
    purityPercent: 99.0,
    densityKgL: 1.52,
    stockSolutionConcentrationPercent: 20.0,
    physicalForm: 'Liquid Solution',
    storageCondition: 'Insulated steel / PE tanks with heat tracing below 15°C',
    safetyNotes: 'Strong caustic base. Causes rapid tissue destruction and blindness.',
    hazardClass: 'Class 8 Corrosive Base',
    ppeRequired: ['Full Face Shield', 'Rubber Apron', 'Neoprene Gloves', 'Safety Boots'],
    sdsReference: 'AWWA B200 / SDS-NAOH-2026',
    costPerKgUSD: 0.45,
    alkalinityConsumptionMgLPerMgDose: -1.25, // Adds 1.25 mg/L Alk as CaCO3 per mg/L NaOH
    sludgeYieldKgPerKgChemical: 0.0,
    chlorineEquivalentFactor: 0
  },
  {
    id: 'CHEM-ALK-003',
    code: 'SODA_ASH',
    name: 'Soda Ash (Sodium Carbonate)',
    formula: 'Na2CO3',
    category: 'pH / Alkalinity',
    molecularWeightGmol: 105.99,
    activeFraction: 0.99,
    purityPercent: 99.0,
    densityKgL: 0.90,
    stockSolutionConcentrationPercent: 8.0,
    physicalForm: 'Dry Powder / Granular',
    storageCondition: 'Dry moisture-proof silo',
    safetyNotes: 'Dust irritant.',
    hazardClass: 'Class 9 Irritant',
    ppeRequired: ['Dust Mask', 'Safety Glasses'],
    sdsReference: 'AWWA B201 / SDS-NA2CO3-2026',
    costPerKgUSD: 0.32,
    alkalinityConsumptionMgLPerMgDose: -0.94, // Adds 0.94 mg/L Alk as CaCO3
    sludgeYieldKgPerKgChemical: 0.0,
    chlorineEquivalentFactor: 0
  },

  // DISINFECTANTS & OXIDANTS
  {
    id: 'CHEM-DIS-001',
    code: 'CL2_GAS',
    name: 'Liquefied Chlorine Gas',
    formula: 'Cl2',
    category: 'Disinfectant',
    molecularWeightGmol: 70.90,
    activeFraction: 1.00, // 100% pure gas
    purityPercent: 99.5,
    densityKgL: 1.47, // Liquid phase density
    stockSolutionConcentrationPercent: 100.0,
    physicalForm: 'Compressed Gas',
    storageCondition: 'Pressurized ton containers, gas leak detection, scrubber system',
    safetyNotes: 'Toxic inhalation hazard Class 2.3. Highly reactive oxidant.',
    hazardClass: 'Class 2.3 Toxic Gas',
    ppeRequired: ['SCBA Respirator', 'Gas Suit', 'Emergency Repair Kit B'],
    sdsReference: 'AWWA B301 / SDS-CL2-2026',
    costPerKgUSD: 0.65,
    alkalinityConsumptionMgLPerMgDose: 1.41, // Consumes 1.41 mg/L Alk as CaCO3 per mg/L Cl2
    sludgeYieldKgPerKgChemical: 0.0,
    chlorineEquivalentFactor: 1.00
  },
  {
    id: 'CHEM-DIS-002',
    code: 'NAOCL',
    name: 'Sodium Hypochlorite',
    formula: 'NaOCl',
    category: 'Disinfectant',
    molecularWeightGmol: 74.44,
    activeFraction: 0.12, // 12% available chlorine liquid
    purityPercent: 12.0,
    densityKgL: 1.21,
    stockSolutionConcentrationPercent: 12.0,
    physicalForm: 'Liquid Solution',
    storageCondition: 'Vented UV-blocking tanks away from heat and light',
    safetyNotes: 'Corrosive liquid releasing toxic chlorine gas if mixed with acid.',
    hazardClass: 'Class 8 Corrosive',
    ppeRequired: ['Chemical Goggles', 'PVC Gloves', 'Apron'],
    sdsReference: 'AWWA B300 / SDS-NAOCL-2026',
    costPerKgUSD: 0.40,
    alkalinityConsumptionMgLPerMgDose: 0.0, // Neutral alkalinity impact
    sludgeYieldKgPerKgChemical: 0.0,
    chlorineEquivalentFactor: 0.12
  },
  {
    id: 'CHEM-DIS-003',
    code: 'KMNO4',
    name: 'Potassium Permanganate',
    formula: 'KMnO4',
    category: 'Oxidant',
    molecularWeightGmol: 158.03,
    activeFraction: 0.97,
    purityPercent: 97.0,
    densityKgL: 1.00,
    stockSolutionConcentrationPercent: 3.0,
    physicalForm: 'Dry Powder / Granular',
    storageCondition: 'Cool dry store, strong oxidizing agent away from combustibles',
    safetyNotes: 'Powerful oxidizer. Stains skin pink/brown. Fire risk with organics.',
    hazardClass: 'Class 5.1 Oxidizer',
    ppeRequired: ['Dust Mask', 'Goggles', 'Nitrile Gloves'],
    sdsReference: 'AWWA B603 / SDS-KMNO4-2026',
    costPerKgUSD: 2.80,
    alkalinityConsumptionMgLPerMgDose: 0.0,
    sludgeYieldKgPerKgChemical: 0.55, // MnO2 precipitate
    chlorineEquivalentFactor: 0.0
  },

  // POLYMER & ACTIVATED CARBON
  {
    id: 'CHEM-POL-001',
    code: 'POLY_ANIONIC',
    name: 'Anionic Polymer (Flocculant Aid)',
    formula: 'Polyacrylamide',
    category: 'Polymer',
    molecularWeightGmol: 5000000,
    activeFraction: 0.90,
    purityPercent: 90.0,
    densityKgL: 0.80,
    stockSolutionConcentrationPercent: 0.2, // 0.2% aged solution
    physicalForm: 'Dry Powder / Granular',
    storageCondition: 'Aged hydration tank with slow paddle mixer',
    safetyNotes: 'Extremely slippery when spilled on wet floors.',
    hazardClass: 'Non-Hazardous',
    ppeRequired: ['Dust Mask', 'Safety Glasses', 'Gloves'],
    sdsReference: 'AWWA B453 / SDS-POLY-2026',
    costPerKgUSD: 3.50,
    alkalinityConsumptionMgLPerMgDose: 0.0,
    sludgeYieldKgPerKgChemical: 1.00,
    chlorineEquivalentFactor: 0.0
  },
  {
    id: 'CHEM-CARB-001',
    code: 'PAC_CARBON',
    name: 'Powdered Activated Carbon (PAC)',
    formula: 'C',
    category: 'Adsorbent',
    molecularWeightGmol: 12.01,
    activeFraction: 0.95,
    purityPercent: 95.0,
    densityKgL: 0.45,
    stockSolutionConcentrationPercent: 10.0, // Slurry
    physicalForm: 'Dry Powder / Granular',
    storageCondition: 'Explosion-proof carbon storage room with dust collector',
    safetyNotes: 'Dust explosion risk when suspended in air.',
    hazardClass: 'Class 4.2 Spontaneously Combustible / Combustible Dust',
    ppeRequired: ['Dust Mask N95', 'Explosion Proof Goggles', 'Antistatic Suit'],
    sdsReference: 'AWWA B600 / SDS-PACARBON-2026',
    costPerKgUSD: 1.85,
    alkalinityConsumptionMgLPerMgDose: 0.0,
    sludgeYieldKgPerKgChemical: 1.00,
    chlorineEquivalentFactor: 0.0
  }
];

export function getChemicalByCode(code: string): ChemicalDefinition {
  const found = MASTER_CHEMICAL_REGISTRY.find(c => c.code === code);
  if (!found) return MASTER_CHEMICAL_REGISTRY[0]; // fallback to Alum
  return found;
}
