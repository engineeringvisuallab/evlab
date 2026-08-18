import { ReactionData } from '../types/chemistry';

export const REACTIONS: ReactionData[] = [
  {
    id: 'acid_base_neutralization',
    name: 'Hydrochloric Acid and Sodium Hydroxide Neutralization',
    type: 'acid_base',
    reactants: [
      { formula: 'HCl', coefficient: 1, state: 'aq', name: 'Hydrochloric Acid' },
      { formula: 'NaOH', coefficient: 1, state: 'aq', name: 'Sodium Hydroxide' }
    ],
    products: [
      { formula: 'NaCl', coefficient: 1, state: 'aq', name: 'Sodium Chloride' },
      { formula: 'H2O', coefficient: 1, state: 'l', name: 'Water' }
    ],
    balancedEquation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
    deltaH: -57.3, // Exothermic kJ/mol
    deltaS: 80.7,
    activationEnergy: 12.0,
    equilibriumConstant: 1e14,
    visualObservations: {
      colorChange: 'Phenolphthalein turns from vibrant magenta (pH > 8.2) to crystal colorless at equivalence point (pH 7.0)',
      tempChange: 'heats_up'
    },
    molecularExplanation: 'Hydronium ions H₃O⁺ from strong acid collide with hydroxide ions OH⁻ to form neutral covalent water molecules H₂O with release of neutralization enthalpy (-57.3 kJ/mol). Spectator ions Na⁺ and Cl⁻ remain freely solvated.',
    realWorldApplications: ['Antacid medication for gastric acid relief', 'Industrial wastewater neutralization before river discharge', 'Analytical titration for purity control']
  },
  {
    id: 'haber_ammonia_equilibrium',
    name: 'Haber-Bosch Ammonia Synthesis (Equilibrium)',
    type: 'combination',
    reactants: [
      { formula: 'N2', coefficient: 1, state: 'g', name: 'Nitrogen Gas' },
      { formula: 'H2', coefficient: 3, state: 'g', name: 'Hydrogen Gas' }
    ],
    products: [
      { formula: 'NH3', coefficient: 2, state: 'g', name: 'Ammonia Gas' }
    ],
    balancedEquation: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',
    deltaH: -92.4, // Exothermic
    deltaS: -198.2,
    activationEnergy: 235.0, // High without Fe catalyst
    equilibriumConstant: 4.1e8, // at 298K
    visualObservations: {
      gasEvolved: 'Ammonia vapor with pungent odor',
      tempChange: 'heats_up'
    },
    molecularExplanation: 'Extremely strong N≡N triple bond (945 kJ/mol) requires elevated temperature (450°C) and iron catalyst to break. Increasing pressure shifts equilibrium right toward fewer gas moles (4 moles gas → 2 moles gas, Le Chatelier principle).',
    realWorldApplications: ['Manufacture of global agricultural fertilizers sustaining over 50% of the world population', 'Nitric acid synthesis', 'Refrigerants']
  },
  {
    id: 'precipitation_lead_iodide',
    name: 'Golden Rain (Lead(II) Nitrate and Potassium Iodide Precipitation)',
    type: 'precipitation',
    reactants: [
      { formula: 'Pb(NO3)2', coefficient: 1, state: 'aq', name: 'Lead(II) Nitrate' },
      { formula: 'KI', coefficient: 2, state: 'aq', name: 'Potassium Iodide' }
    ],
    products: [
      { formula: 'PbI2', coefficient: 1, state: 's', name: 'Lead(II) Iodide' },
      { formula: 'KNO3', coefficient: 2, state: 'aq', name: 'Potassium Nitrate' }
    ],
    balancedEquation: 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)',
    deltaH: -63.2,
    visualObservations: {
      precipitate: { formula: 'PbI₂', color: '#FFD700' },
      colorChange: 'Clear colorless solutions instantly form a brilliant golden-yellow crystalline solid precipitate upon mixing.'
    },
    molecularExplanation: 'Lead Pb²⁺ cations and iodide I⁻ anions have a low solubility product (Ksp = 9.8 × 10⁻⁹). When the ion product Q exceeds Ksp, electrostatic lattice forces overcome hydration energy, forming insoluble crystalline PbI₂ flakes.',
    realWorldApplications: ['Qualitative inorganic cation analysis', 'Solar cell perovskite precursors', 'Radiation detector semiconductors']
  },
  {
    id: 'daniell_cell_redox',
    name: 'Zinc-Copper Galvanic Electrochemical Redox (Daniell Cell)',
    type: 'redox',
    reactants: [
      { formula: 'Zn', coefficient: 1, state: 's', name: 'Zinc Metal' },
      { formula: 'CuSO4', coefficient: 1, state: 'aq', name: 'Copper(II) Sulfate' }
    ],
    products: [
      { formula: 'ZnSO4', coefficient: 1, state: 'aq', name: 'Zinc Sulfate' },
      { formula: 'Cu', coefficient: 1, state: 's', name: 'Copper Metal' }
    ],
    balancedEquation: 'Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)',
    deltaH: -218.7,
    visualObservations: {
      colorChange: 'Deep royal blue Cu²⁺(aq) solution gradually fades to colorless as Cu²⁺ is reduced to reddish-brown metallic copper deposited on the electrode.',
      precipitate: { formula: 'Cu', color: '#B87333' }
    },
    molecularExplanation: 'Zinc has a lower standard reduction potential (-0.76 V) than copper (+0.34 V). Spontaneous electron transfer occurs: Zn oxidizes (loses 2e⁻) at the anode, while Cu²⁺ reduces (gains 2e⁻) at the cathode, generating a standard cell potential of E°cell = +1.10 V.',
    realWorldApplications: ['Primary and secondary battery systems', 'Sacrificial anode cathodic protection of ship hulls', 'Industrial copper electro-refining']
  },
  {
    id: 'combustion_methane',
    name: 'Complete Combustion of Methane',
    type: 'combustion',
    reactants: [
      { formula: 'CH4', coefficient: 1, state: 'g', name: 'Methane' },
      { formula: 'O2', coefficient: 2, state: 'g', name: 'Oxygen' }
    ],
    products: [
      { formula: 'CO2', coefficient: 1, state: 'g', name: 'Carbon Dioxide' },
      { formula: 'H2O', coefficient: 2, state: 'g', name: 'Water Vapor' }
    ],
    balancedEquation: 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g)',
    deltaH: -890.3, // Strongly exothermic
    deltaS: -5.1,
    activationEnergy: 125.0,
    visualObservations: {
      gasEvolved: 'Colorless CO₂ and steam H₂O vapors',
      tempChange: 'heats_up',
      colorChange: 'Clean, luminous blue flame indicating complete hydrocarbon combustion'
    },
    molecularExplanation: 'High-energy C-H and O=O bonds break after initial activation spark; more stable C=O (804 kJ/mol) and O-H (463 kJ/mol) bonds form, releasing 890.3 kJ of thermal energy per mole of methane burned.',
    realWorldApplications: ['Domestic gas cookers and central heating', 'Natural gas combined cycle power generation plants', 'Bunsen burners in chemistry laboratories']
  },
  {
    id: 'kinetics_thiosulfate_acid',
    name: 'Sodium Thiosulfate and Hydrochloric Acid Clock Reaction',
    type: 'double_displacement',
    reactants: [
      { formula: 'Na2S2O3', coefficient: 1, state: 'aq', name: 'Sodium Thiosulfate' },
      { formula: 'HCl', coefficient: 2, state: 'aq', name: 'Hydrochloric Acid' }
    ],
    products: [
      { formula: 'NaCl', coefficient: 2, state: 'aq', name: 'Sodium Chloride' },
      { formula: 'SO2', coefficient: 1, state: 'g', name: 'Sulfur Dioxide' },
      { formula: 'S', coefficient: 1, state: 's', name: 'Colloidal Sulfur' },
      { formula: 'H2O', coefficient: 1, state: 'l', name: 'Water' }
    ],
    balancedEquation: 'Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + SO₂(g) + S(s)↓ + H₂O(l)',
    deltaH: -45.0,
    activationEnergy: 48.5,
    visualObservations: {
      precipitate: { formula: 'S', color: '#FFFFE0' },
      colorChange: 'Solution turns increasingly milky-cloudy white/yellow as colloidal elemental sulfur particles aggregate, eventually obscuring a cross marked on paper.'
    },
    molecularExplanation: 'Protonation of thiosulfate forms unstable thiosulfuric acid H₂S₂O₃ which decomposes into sulfur atoms. The rate of colloidal sulfur precipitation is directly proportional to temperature and reactant concentrations, perfectly illustrating collision theory and Arrhenius kinetics.',
    realWorldApplications: ['Standard academic kinetic rate law determination', 'Turbidity measurement techniques', 'Photographic fixer recycling']
  }
];
