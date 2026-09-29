import { AcademicLevel } from '../types/chemistry';

export interface CurriculumTopic {
  id: string;
  title: string;
  subject: 'General' | 'Physical' | 'Inorganic' | 'Organic' | 'Analytical' | 'Electrochemistry' | 'Thermochemistry';
  levels: AcademicLevel[];
  description: string;
  keyFormulas: string[];
  learningOutcomes: string[];
  recommendedLab: string;
  iconName: string;
}

export const CURRICULUM_TOPICS: CurriculumTopic[] = [
  {
    id: 'atomic_structure',
    title: 'Atomic Structure & Isotopes',
    subject: 'General',
    levels: ['Level 1 - Class 9-10', 'Level 2 - HSC', 'Level 3 - Diploma / College', 'Level 4 - University'],
    description: 'Explore the internal architecture of atoms: protons, neutrons, electrons, Bohr energy shells, valence configurations, and isotope stability.',
    keyFormulas: ['A = Z + N', 'Charge = Protons - Electrons', '2n² (Shell capacity)'],
    learningOutcomes: ['Determine net charge from subatomic counts', 'Differentiate between isotopes and ions', 'Understand electron shell quantum distribution'],
    recommendedLab: 'atomic_structure',
    iconName: 'Atom'
  },
  {
    id: 'periodic_trends',
    title: 'Periodic Table & Elemental Trends',
    subject: 'Inorganic',
    levels: ['Level 1 - Class 9-10', 'Level 2 - HSC', 'Level 3 - Diploma / College', 'Level 4 - University'],
    description: 'Analyze periodicity across periods and groups: Electronegativity, 1st Ionization Energy, Atomic Radius, and electron shielding.',
    keyFormulas: ['Z_eff = Z - S (Slater Rules)', 'E = -13.6 eV · (Z_eff²/n²)'],
    learningOutcomes: ['Predict chemical reactivity from periodic position', 'Compare ionization energy trends across blocks', 'Explain lanthanide contraction in heavy metals'],
    recommendedLab: 'periodic_table',
    iconName: 'Grid'
  },
  {
    id: 'molecular_geometry',
    title: 'VSEPR Molecular Geometry & Orbitals',
    subject: 'General',
    levels: ['Level 1 - Class 9-10', 'Level 2 - HSC', 'Level 3 - Diploma / College', 'Level 4 - University'],
    description: 'Construct 3D molecules, compute steric numbers, lone pair repulsion, bond angles, dipoles, and orbital hybridizations (sp, sp², sp³, sp³d, sp³d²).',
    keyFormulas: ['Steric Number = Bonding Pairs + Lone Pairs', 'Dipole = Σ (q_i · r_i)'],
    learningOutcomes: ['Predict 3D shapes from Lewis dot structures', 'Calculate net molecular dipole moments', 'Understand hybrid orbital spatial orientations'],
    recommendedLab: 'molecule_builder',
    iconName: 'Box'
  },
  {
    id: 'equation_balancing',
    title: 'Chemical Equations & Law of Conservation',
    subject: 'General',
    levels: ['Level 1 - Class 9-10', 'Level 2 - HSC', 'Level 3 - Diploma / College'],
    description: 'Master stoichiometric equation balancing with atom counters, proving mass conservation across combination, decomposition, displacement, and combustion.',
    keyFormulas: ['Σ Atoms(Reactants) = Σ Atoms(Products)'],
    learningOutcomes: ['Balance complex multi-element reactions', 'Verify mass conservation numerically', 'Recognize reaction types and physical state notations'],
    recommendedLab: 'equation_balancer',
    iconName: 'Scale'
  },
  {
    id: 'stoichiometry_limiting',
    title: 'Stoichiometry & Limiting Reagent',
    subject: 'Physical',
    levels: ['Level 1 - Class 9-10', 'Level 2 - HSC', 'Level 3 - Diploma / College', 'Level 4 - University'],
    description: 'Calculate mass-to-mole ratios, dynamic reactant depletion, limiting reagent identification, excess reagent calculation, and percentage yield.',
    keyFormulas: ['n = m / M', 'C = n / V', '% Yield = (Actual / Theoretical) × 100%'],
    learningOutcomes: ['Identify limiting reagents quantitatively', 'Calculate theoretical yield of products', 'Analyze industrial process efficiency'],
    recommendedLab: 'stoichiometry',
    iconName: 'Layers'
  },
  {
    id: 'acid_base_ph',
    title: 'Acid-Base Dynamics & pH Scale',
    subject: 'Analytical',
    levels: ['Level 1 - Class 9-10', 'Level 2 - HSC', 'Level 3 - Diploma / College', 'Level 4 - University'],
    description: 'Investigate auto-ionization of water, strong vs weak acids, Ka/Kb dissociation, logarithmic pH/pOH scales, and buffer solutions.',
    keyFormulas: ['pH = -log₁₀[H⁺]', 'pH + pOH = 14 (at 25°C)', 'pH = pKa + log([A⁻]/[HA])'],
    learningOutcomes: ['Calculate pH for strong and weak electrolytes', 'Design acetate and phosphate buffer systems', 'Understand color indicator equilibrium'],
    recommendedLab: 'acid_base',
    iconName: 'Droplets'
  },
  {
    id: 'virtual_titration',
    title: 'Precision Titration & Volumetric Analysis',
    subject: 'Analytical',
    levels: ['Level 2 - HSC', 'Level 3 - Diploma / College', 'Level 4 - University'],
    description: 'Perform hands-on virtual titrations with burette valve flow control, indicator color endpoints, pH curves, first derivatives d(pH)/dV, and unknown concentration determination.',
    keyFormulas: ['C₁V₁ / n₁ = C₂V₂ / n₂', 'Titre_avg = Σ V_concordant / N'],
    learningOutcomes: ['Operate virtual volumetric glassware with precision', 'Plot and interpret sharp sigmoidal titration curves', 'Determine unknown acid/base molarity from experimental titres'],
    recommendedLab: 'titration',
    iconName: 'Pipette'
  },
  {
    id: 'gas_laws_kinetic',
    title: 'Gas Laws & Kinetic Molecular Theory',
    subject: 'Physical',
    levels: ['Level 1 - Class 9-10', 'Level 2 - HSC', 'Level 3 - Diploma / College', 'Level 4 - University'],
    description: 'Simulate gas particles inside a piston chamber. Test Boyle\'s Law (P vs 1/V), Charles\'s Law (V vs T), Gay-Lussac\'s Law (P vs T), and Ideal Gas Law (PV = nRT).',
    keyFormulas: ['PV = nRT', 'P₁V₁/T₁ = P₂V₂/T₂', 'v_rms = √(3RT/M)'],
    learningOutcomes: ['Connect microscopic particle velocity to macroscopic temperature', 'Analyze real gas deviations using van der Waals equation', 'Graph P-V isothermal and isochoric state transitions'],
    recommendedLab: 'gas_law',
    iconName: 'Wind'
  },
  {
    id: 'chemical_kinetics',
    title: 'Reaction Kinetics & Collision Theory',
    subject: 'Physical',
    levels: ['Level 2 - HSC', 'Level 3 - Diploma / College', 'Level 4 - University'],
    description: 'Discover how temperature, concentration, surface area, and catalysts alter molecular collision frequency, Maxwell-Boltzmann distributions, and activation energy barriers.',
    keyFormulas: ['Rate = k[A]^m[B]^n', 'k = A · e^(-Ea / RT)', 'ln(k₂/k₁) = (Ea/R) · (1/T₁ - 1/T₂)'],
    learningOutcomes: ['Derive reaction orders and rate constants', 'Plot Arrhenius linear relations to find Ea', 'Explain catalytic enzyme and heterogeneous mechanisms'],
    recommendedLab: 'kinetics',
    iconName: 'Zap'
  },
  {
    id: 'chemical_equilibrium',
    title: 'Dynamic Equilibrium & Le Chatelier\'s Principle',
    subject: 'Physical',
    levels: ['Level 2 - HSC', 'Level 3 - Diploma / College', 'Level 4 - University'],
    description: 'Observe continuous forward and reverse reactions reaching dynamic equilibrium. Apply perturbations (concentration, temperature, pressure) and verify Le Chatelier shifts.',
    keyFormulas: ['Kc = [C]^c[D]^d / ([A]^a[B]^b)', 'Q < K (Forward shift)', 'ln(K₂/K₁) = -(ΔH°/R) · (1/T₂ - 1/T₁)'],
    learningOutcomes: ['Distinguish static vs dynamic equilibrium', 'Predict equilibrium shifts upon stress application', 'Calculate equilibrium concentrations from ICE tables'],
    recommendedLab: 'equilibrium',
    iconName: 'Repeat'
  },
  {
    id: 'electrochemistry_galvanic',
    title: 'Galvanic Cells, Electrolysis & Nernst Equation',
    subject: 'Electrochemistry',
    levels: ['Level 2 - HSC', 'Level 3 - Diploma / College', 'Level 4 - University'],
    description: 'Build Daniell electrochemical cells, track electron movement along wires and ion migration through salt bridges, measure EMF, and compute non-standard cell voltages.',
    keyFormulas: ['E°cell = E°cathode - E°anode', 'E = E° - (RT/nF)ln(Q)', 'ΔG° = -nFE°cell'],
    learningOutcomes: ['Identify anode oxidation and cathode reduction sites', 'Calculate cell EMF under non-standard concentrations using Nernst equation', 'Connect electrical work to Gibbs free energy change'],
    recommendedLab: 'electrochemistry',
    iconName: 'BatteryCharging'
  },
  {
    id: 'organic_chemistry_isomers',
    title: 'Organic Chemistry, Functional Groups & Isomerism',
    subject: 'Organic',
    levels: ['Level 2 - HSC', 'Level 3 - Diploma / College', 'Level 4 - University'],
    description: 'Explore carbon skeletons, functional group transformations (oxidation of alcohols, esterification, halogenation), and structural vs geometric (cis/trans) isomerism.',
    keyFormulas: ['Alkanes: C_n H_{2n+2}', 'Alkenes: C_n H_{2n}', 'Alkynes: C_n H_{2n-2}'],
    learningOutcomes: ['Identify key functional groups (alcohol, aldehyde, ketone, ester, carboxylic acid)', 'Differentiate structural isomers from stereoisomers', 'Predict products of organic oxidation and substitution reactions'],
    recommendedLab: 'organic_chemistry',
    iconName: 'Network'
  },
  {
    id: 'chemical_bonding',
    title: 'Chemical Bonding: Ionic, Covalent & Metallic',
    subject: 'Inorganic',
    levels: ['Level 1 - Class 9-10', 'Level 2 - HSC', 'Level 3 - Diploma / College'],
    description: 'Simulate valence electron transfer in ionic bonds, orbital electron sharing in covalent bonds, and delocalized electron sea model in metallic conductivity.',
    keyFormulas: ['Lattice Energy ∝ (q₁ · q₂) / r', 'Bond Order = (N_b - N_a) / 2'],
    learningOutcomes: ['Visualize electron transfer vs sharing', 'Explain metallic electrical conductivity via delocalized electron sea', 'Correlate bond types with melting points and brittleness'],
    recommendedLab: 'chemical_bonding',
    iconName: 'Link'
  },
  {
    id: 'thermochemistry_calorimetry',
    title: 'Thermochemistry & Solution Calorimetry',
    subject: 'Thermochemistry',
    levels: ['Level 2 - HSC', 'Level 3 - Diploma / College', 'Level 4 - University'],
    description: 'Perform virtual calorimetry to measure enthalpy of solution, neutralization, and reaction heat exchange ($q = mc\Delta T$).',
    keyFormulas: ['q = m · c · ΔT', 'ΔH_rxn = -q_cal / n', 'ΔG = ΔH - TΔS'],
    learningOutcomes: ['Distinguish exothermic from endothermic thermal flows', 'Calculate molar enthalpy from calorimeter temperature curves', 'Apply Hess\'s Law for multi-step reaction energies'],
    recommendedLab: 'thermochemistry',
    iconName: 'Flame'
  }
];
