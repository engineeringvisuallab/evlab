import { ElementData } from '../types/chemistry';

export const ELEMENTS: ElementData[] = [
  {
    number: 1, symbol: 'H', name: 'Hydrogen', atomicMass: 1.008, category: 'nonmetal',
    group: 1, period: 1, block: 's', electronConfiguration: '1s¹', electronsPerShell: [1],
    electronegativity: 2.20, atomicRadius: 37, ionizationEnergy: 1312, electronAffinity: 72.8,
    meltingPoint: 14.01, boilingPoint: 20.28, density: 0.00008988, oxidationStates: [1, -1],
    discoveredBy: 'Henry Cavendish', summary: 'Most abundant chemical substance in the Universe.',
    uses: ['Fuel cells', 'Ammonia synthesis (Haber process)', 'Rocket propellant', 'Petroleum refining'],
    colorHex: '#FFFFFF'
  },
  {
    number: 2, symbol: 'He', name: 'Helium', atomicMass: 4.0026, category: 'noble-gas',
    group: 18, period: 1, block: 's', electronConfiguration: '1s²', electronsPerShell: [2],
    electronegativity: null, atomicRadius: 32, ionizationEnergy: 2372, electronAffinity: 0,
    meltingPoint: 0.95, boilingPoint: 4.22, density: 0.0001785, oxidationStates: [0],
    discoveredBy: 'Pierre Janssen, Norman Lockyer', summary: 'Colorless, odorless, inert noble gas with lowest boiling point.',
    uses: ['Cryogenics (MRI cooling)', 'Deep sea diving gas mix', 'Balloons and airships'],
    colorHex: '#D9FFFF'
  },
  {
    number: 3, symbol: 'Li', name: 'Lithium', atomicMass: 6.94, category: 'alkali-metal',
    group: 1, period: 2, block: 's', electronConfiguration: '[He] 2s¹', electronsPerShell: [2, 1],
    electronegativity: 0.98, atomicRadius: 152, ionizationEnergy: 520, electronAffinity: 59.6,
    meltingPoint: 453.69, boilingPoint: 1603, density: 0.534, oxidationStates: [1],
    discoveredBy: 'Johan August Arfwedson', summary: 'Lightest metal with high electrochemical potential.',
    uses: ['Lithium-ion rechargeable batteries', 'Mood stabilizer pharmaceuticals', 'Lightweight alloys'],
    colorHex: '#CC80FF'
  },
  {
    number: 4, symbol: 'Be', name: 'Beryllium', atomicMass: 9.0122, category: 'alkaline-earth',
    group: 2, period: 2, block: 's', electronConfiguration: '[He] 2s²', electronsPerShell: [2, 2],
    electronegativity: 1.57, atomicRadius: 112, ionizationEnergy: 899, electronAffinity: 0,
    meltingPoint: 1560, boilingPoint: 2742, density: 1.85, oxidationStates: [2],
    discoveredBy: 'Louis Nicolas Vauquelin', summary: 'Relatively rare, lightweight metal with high stiffness and thermal stability.',
    uses: ['Aerospace structural components', 'X-ray tube windows', 'Beryllium-copper springs'],
    colorHex: '#C2FF00'
  },
  {
    number: 5, symbol: 'B', name: 'Boron', atomicMass: 10.81, category: 'metalloid',
    group: 13, period: 2, block: 'p', electronConfiguration: '[He] 2s² 2p¹', electronsPerShell: [2, 3],
    electronegativity: 2.04, atomicRadius: 85, ionizationEnergy: 801, electronAffinity: 26.7,
    meltingPoint: 2349, boilingPoint: 4200, density: 2.34, oxidationStates: [3],
    discoveredBy: 'Joseph Louis Gay-Lussac, Louis Jacques Thénard', summary: 'Low-abundance metalloid produced entirely by cosmic ray spallation.',
    uses: ['Borosilicate heat-resistant glass (Pyrex)', 'Detergents (borax)', 'Semiconductor dopant', 'Control rods in nuclear reactors'],
    colorHex: '#FFB5B5'
  },
  {
    number: 6, symbol: 'C', name: 'Carbon', atomicMass: 12.011, category: 'nonmetal',
    group: 14, period: 2, block: 'p', electronConfiguration: '[He] 2s² 2p²', electronsPerShell: [2, 4],
    electronegativity: 2.55, atomicRadius: 77, ionizationEnergy: 1086, electronAffinity: 121.8,
    meltingPoint: 3823, boilingPoint: 4098, density: 2.267, oxidationStates: [4, 2, -4],
    discoveredBy: 'Ancient civilizations', summary: 'Basis of all organic chemistry and life on Earth, forming catenated chains.',
    uses: ['Carbon fiber composites', 'Diamonds & jewelry', 'Graphite electrodes', 'Polymers & plastics', 'Pharmaceuticals'],
    colorHex: '#909090'
  },
  {
    number: 7, symbol: 'N', name: 'Nitrogen', atomicMass: 14.007, category: 'nonmetal',
    group: 15, period: 2, block: 'p', electronConfiguration: '[He] 2s² 2p³', electronsPerShell: [2, 5],
    electronegativity: 3.04, atomicRadius: 75, ionizationEnergy: 1402, electronAffinity: -7,
    meltingPoint: 63.15, boilingPoint: 77.36, density: 0.0012506, oxidationStates: [-3, 3, 5, 4, 2],
    discoveredBy: 'Daniel Rutherford', summary: 'Makes up 78% of Earth\'s atmosphere as inert triple-bonded N₂ molecules.',
    uses: ['Agricultural fertilizers (urea, ammonium nitrate)', 'Cryogenic freezing', 'Inert gas blanketing', 'Explosives'],
    colorHex: '#3050F8'
  },
  {
    number: 8, symbol: 'O', name: 'Oxygen', atomicMass: 15.999, category: 'nonmetal',
    group: 16, period: 2, block: 'p', electronConfiguration: '[He] 2s² 2p⁴', electronsPerShell: [2, 6],
    electronegativity: 3.44, atomicRadius: 73, ionizationEnergy: 1314, electronAffinity: 141,
    meltingPoint: 54.36, boilingPoint: 90.20, density: 0.001429, oxidationStates: [-2, -1],
    discoveredBy: 'Carl Wilhelm Scheele, Joseph Priestley', summary: 'Highly reactive nonmetal and oxidizing agent essential for aerobic respiration.',
    uses: ['Medical oxygen therapy', 'Steel production (Bessemer/BOF)', 'Rocket oxidizer', 'Combustion processes'],
    colorHex: '#FF0D0D'
  },
  {
    number: 9, symbol: 'F', name: 'Fluorine', atomicMass: 18.998, category: 'halogen',
    group: 17, period: 2, block: 'p', electronConfiguration: '[He] 2s² 2p⁵', electronsPerShell: [2, 7],
    electronegativity: 3.98, atomicRadius: 71, ionizationEnergy: 1681, electronAffinity: 328,
    meltingPoint: 53.53, boilingPoint: 85.03, density: 0.001696, oxidationStates: [-1],
    discoveredBy: 'Henri Moissan', summary: 'The most electronegative and chemically reactive of all elements.',
    uses: ['Teflon (PTFE) cookware', 'Fluoride toothpaste for enamel health', 'Refrigerants', 'Uranium enrichment'],
    colorHex: '#90E050'
  },
  {
    number: 10, symbol: 'Ne', name: 'Neon', atomicMass: 20.180, category: 'noble-gas',
    group: 18, period: 2, block: 'p', electronConfiguration: '[He] 2s² 2p⁶', electronsPerShell: [2, 8],
    electronegativity: null, atomicRadius: 69, ionizationEnergy: 2080, electronAffinity: 0,
    meltingPoint: 24.56, boilingPoint: 27.07, density: 0.0008999, oxidationStates: [0],
    discoveredBy: 'William Ramsay, Morris Travers', summary: 'Glows reddish-orange in high-voltage electrical discharge.',
    uses: ['Neon advertising signs', 'High-voltage warning indicators', 'Gas lasers (He-Ne)', 'Cryogenics'],
    colorHex: '#B3E3F5'
  },
  {
    number: 11, symbol: 'Na', name: 'Sodium', atomicMass: 22.990, category: 'alkali-metal',
    group: 1, period: 3, block: 's', electronConfiguration: '[Ne] 3s¹', electronsPerShell: [2, 8, 1],
    electronegativity: 0.93, atomicRadius: 186, ionizationEnergy: 496, electronAffinity: 52.8,
    meltingPoint: 370.87, boilingPoint: 1156, density: 0.968, oxidationStates: [1],
    discoveredBy: 'Humphry Davy', summary: 'Soft, highly reactive metal that vigorously reacts with water producing H₂ gas and heat.',
    uses: ['Table salt (NaCl)', 'Soap making (NaOH)', 'Sodium vapor street lamps', 'Nuclear reactor coolant'],
    colorHex: '#AB5CF2'
  },
  {
    number: 12, symbol: 'Mg', name: 'Magnesium', atomicMass: 24.305, category: 'alkaline-earth',
    group: 2, period: 3, block: 's', electronConfiguration: '[Ne] 3s²', electronsPerShell: [2, 8, 2],
    electronegativity: 1.31, atomicRadius: 160, ionizationEnergy: 738, electronAffinity: 0,
    meltingPoint: 923, boilingPoint: 1363, density: 1.738, oxidationStates: [2],
    discoveredBy: 'Joseph Black', summary: 'Burns with an intense, brilliant white flame. Central atom in chlorophyll.',
    uses: ['Lightweight alloys for automotive & laptops', 'Flares and fireworks', 'Antacids (Milk of Magnesia)', 'Grignard reagents in organic synthesis'],
    colorHex: '#8AFF00'
  },
  {
    number: 13, symbol: 'Al', name: 'Aluminium', atomicMass: 26.982, category: 'post-transition',
    group: 13, period: 3, block: 'p', electronConfiguration: '[Ne] 3s² 3p¹', electronsPerShell: [2, 8, 3],
    electronegativity: 1.61, atomicRadius: 143, ionizationEnergy: 578, electronAffinity: 42.5,
    meltingPoint: 933.47, boilingPoint: 2792, density: 2.70, oxidationStates: [3],
    discoveredBy: 'Hans Christian Ørsted', summary: 'Abundant, low-density metal protected by a self-passivating Al₂O₃ oxide layer.',
    uses: ['Aircraft fuselages', 'Beverage cans and food packaging foil', 'High-voltage electrical power lines', 'Window frames'],
    colorHex: '#BFA6A6'
  },
  {
    number: 14, symbol: 'Si', name: 'Silicon', atomicMass: 28.085, category: 'metalloid',
    group: 14, period: 3, block: 'p', electronConfiguration: '[Ne] 3s² 3p²', electronsPerShell: [2, 8, 4],
    electronegativity: 1.90, atomicRadius: 118, ionizationEnergy: 786, electronAffinity: 134,
    meltingPoint: 1687, boilingPoint: 3538, density: 2.329, oxidationStates: [4, -4],
    discoveredBy: 'Jöns Jacob Berzelius', summary: 'The semiconductor cornerstone of modern microchips and computer electronics.',
    uses: ['Microprocessors and integrated circuits', 'Photovoltaic solar panels', 'Silicone sealants and polymers', 'Glass & ceramics (SiO₂)'],
    colorHex: '#F0C8A0'
  },
  {
    number: 15, symbol: 'P', name: 'Phosphorus', atomicMass: 30.974, category: 'nonmetal',
    group: 15, period: 3, block: 'p', electronConfiguration: '[Ne] 3s² 3p³', electronsPerShell: [2, 8, 5],
    electronegativity: 2.19, atomicRadius: 110, ionizationEnergy: 1012, electronAffinity: 72,
    meltingPoint: 317.30, boilingPoint: 553.65, density: 1.823, oxidationStates: [5, 3, -3],
    discoveredBy: 'Hennig Brand', summary: 'Exists in white, red, and black allotropes. Essential component of DNA, RNA, and ATP.',
    uses: ['NPK agricultural fertilizers', 'Safety match heads', 'Phosphoric acid in colas', 'Flame retardants'],
    colorHex: '#FF8000'
  },
  {
    number: 16, symbol: 'S', name: 'Sulfur', atomicMass: 32.06, category: 'nonmetal',
    group: 16, period: 3, block: 'p', electronConfiguration: '[Ne] 3s² 3p⁴', electronsPerShell: [2, 8, 6],
    electronegativity: 2.58, atomicRadius: 102, ionizationEnergy: 1000, electronAffinity: 200,
    meltingPoint: 388.36, boilingPoint: 717.87, density: 2.07, oxidationStates: [6, 4, -2],
    discoveredBy: 'Ancient civilizations', summary: 'Bright yellow crystalline solid that forms crown-shaped S₈ rings.',
    uses: ['Sulfuric acid production (H₂SO₄)', 'Vulcanization of rubber for tires', 'Gunpowder', 'Fungicides and skin treatments'],
    colorHex: '#FFFF30'
  },
  {
    number: 17, symbol: 'Cl', name: 'Chlorine', atomicMass: 35.45, category: 'halogen',
    group: 17, period: 3, block: 'p', electronConfiguration: '[Ne] 3s² 3p⁵', electronsPerShell: [2, 8, 7],
    electronegativity: 3.16, atomicRadius: 99, ionizationEnergy: 1251, electronAffinity: 349,
    meltingPoint: 171.6, boilingPoint: 239.11, density: 0.003214, oxidationStates: [-1, 1, 3, 5, 7],
    discoveredBy: 'Carl Wilhelm Scheele', summary: 'Greenish-yellow toxic gas used historically and industrially for disinfection.',
    uses: ['Municipal drinking water purification', 'PVC plastics manufacturing', 'Household bleach (NaOCl)', 'Pharmaceutical synthesis'],
    colorHex: '#1FF01F'
  },
  {
    number: 18, symbol: 'Ar', name: 'Argon', atomicMass: 39.948, category: 'noble-gas',
    group: 18, period: 3, block: 'p', electronConfiguration: '[Ne] 3s² 3p⁶', electronsPerShell: [2, 8, 8],
    electronegativity: null, atomicRadius: 97, ionizationEnergy: 1520, electronAffinity: 0,
    meltingPoint: 83.80, boilingPoint: 87.30, density: 0.0017837, oxidationStates: [0],
    discoveredBy: 'Lord Rayleigh, William Ramsay', summary: 'Third-most abundant gas in Earth\'s atmosphere (0.93%).',
    uses: ['Shielding gas in TIG/MIG welding', 'Incandescent light bulb fill', 'Double-pane window thermal insulation'],
    colorHex: '#80D1E3'
  },
  {
    number: 19, symbol: 'K', name: 'Potassium', atomicMass: 39.098, category: 'alkali-metal',
    group: 1, period: 4, block: 's', electronConfiguration: '[Ar] 4s¹', electronsPerShell: [2, 8, 8, 1],
    electronegativity: 0.82, atomicRadius: 227, ionizationEnergy: 419, electronAffinity: 48.4,
    meltingPoint: 336.53, boilingPoint: 1032, density: 0.862, oxidationStates: [1],
    discoveredBy: 'Humphry Davy', summary: 'Soft metal that imparts a lilac/violet color to flames; vital for biological nerve signaling.',
    uses: ['Potash fertilizers (KCl)', 'Potassium hydroxide soaps', 'Glass manufacturing', 'Nerve impulse transmission (Na⁺/K⁺ pump)'],
    colorHex: '#8F40D4'
  },
  {
    number: 20, symbol: 'Ca', name: 'Calcium', atomicMass: 40.078, category: 'alkaline-earth',
    group: 2, period: 4, block: 's', electronConfiguration: '[Ar] 4s²', electronsPerShell: [2, 8, 8, 2],
    electronegativity: 1.00, atomicRadius: 197, ionizationEnergy: 590, electronAffinity: 2.37,
    meltingPoint: 1115, boilingPoint: 1757, density: 1.54, oxidationStates: [2],
    discoveredBy: 'Humphry Davy', summary: 'Fifth most abundant element in Earth\'s crust. Essential for bones, teeth, and shells.',
    uses: ['Cement and concrete (CaO/CaCO₃)', 'Bone mineralization', 'Steel manufacturing deoxidizer', 'Plaster of Paris (CaSO₄·0.5H₂O)'],
    colorHex: '#3DFF00'
  },
  {
    number: 26, symbol: 'Fe', name: 'Iron', atomicMass: 55.845, category: 'transition-metal',
    group: 8, period: 4, block: 'd', electronConfiguration: '[Ar] 3d⁶ 4s²', electronsPerShell: [2, 8, 14, 2],
    electronegativity: 1.83, atomicRadius: 126, ionizationEnergy: 762, electronAffinity: 15.7,
    meltingPoint: 1811, boilingPoint: 3134, density: 7.874, oxidationStates: [2, 3, 6],
    discoveredBy: 'Ancient civilizations (Iron Age)', summary: 'Most used of all metals by tonnage. Hemoglobin active oxygen-binding center.',
    uses: ['Steel production for infrastructure & bridges', 'Automobiles & machinery', 'Haber process ammonia catalyst', 'Oxygen transport in blood'],
    colorHex: '#E06633'
  },
  {
    number: 29, symbol: 'Cu', name: 'Copper', atomicMass: 63.546, category: 'transition-metal',
    group: 11, period: 4, block: 'd', electronConfiguration: '[Ar] 3d¹⁰ 4s¹', electronsPerShell: [2, 8, 18, 1],
    electronegativity: 1.90, atomicRadius: 128, ionizationEnergy: 745, electronAffinity: 118.4,
    meltingPoint: 1357.77, boilingPoint: 2835, density: 8.96, oxidationStates: [1, 2],
    discoveredBy: 'Middle East (c. 9000 BC)', summary: 'Reddish-orange metal with exceptional electrical and thermal conductivity.',
    uses: ['Electrical wiring and power grids', 'Brass and bronze alloys', 'Plumbing pipes', 'Antimicrobial touch surfaces'],
    colorHex: '#C88033'
  },
  {
    number: 30, symbol: 'Zn', name: 'Zinc', atomicMass: 65.38, category: 'transition-metal',
    group: 12, period: 4, block: 'd', electronConfiguration: '[Ar] 3d¹⁰ 4s²', electronsPerShell: [2, 8, 18, 2],
    electronegativity: 1.65, atomicRadius: 134, ionizationEnergy: 906, electronAffinity: 0,
    meltingPoint: 692.68, boilingPoint: 1180, density: 7.14, oxidationStates: [2],
    discoveredBy: 'Indian metallurgists (ancient)', summary: 'Bluish-white lustrous metal widely used for corrosion galvanization.',
    uses: ['Galvanizing steel against rust', 'Alkaline batteries & Daniell cells', 'Brass alloy', 'Sunscreens (ZnO nanoparticles)'],
    colorHex: '#7D80B0'
  },
  {
    number: 35, symbol: 'Br', name: 'Bromine', atomicMass: 79.904, category: 'halogen',
    group: 17, period: 4, block: 'p', electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p⁵', electronsPerShell: [2, 8, 18, 7],
    electronegativity: 2.96, atomicRadius: 114, ionizationEnergy: 1140, electronAffinity: 324.6,
    meltingPoint: 265.8, boilingPoint: 332.0, density: 3.1028, oxidationStates: [-1, 1, 3, 5],
    discoveredBy: 'Antoine Jérôme Balard', summary: 'Dense reddish-brown fuming liquid at room temperature with pungent odor.',
    uses: ['Flame retardants', 'Water purification in spas', 'Organic synthesis (bromination)', 'Photographic film (AgBr)'],
    colorHex: '#A62929'
  },
  {
    number: 47, symbol: 'Ag', name: 'Silver', atomicMass: 107.8682, category: 'transition-metal',
    group: 11, period: 5, block: 'd', electronConfiguration: '[Kr] 4d¹⁰ 5s¹', electronsPerShell: [2, 8, 18, 18, 1],
    electronegativity: 1.93, atomicRadius: 144, ionizationEnergy: 731, electronAffinity: 125.6,
    meltingPoint: 1234.93, boilingPoint: 2435, density: 10.49, oxidationStates: [1],
    discoveredBy: 'Ancient civilizations', summary: 'Highest electrical and thermal conductivity and reflectivity of all metals.',
    uses: ['Solar panels conductive paste', 'Electronics contacts', 'Jewelry and silverware', 'Antimicrobial medical coatings'],
    colorHex: '#C0C0C0'
  },
  {
    number: 53, symbol: 'I', name: 'Iodine', atomicMass: 126.90447, category: 'halogen',
    group: 17, period: 5, block: 'p', electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p⁵', electronsPerShell: [2, 8, 18, 18, 7],
    electronegativity: 2.66, atomicRadius: 133, ionizationEnergy: 1008, electronAffinity: 295.2,
    meltingPoint: 386.85, boilingPoint: 457.4, density: 4.933, oxidationStates: [-1, 1, 3, 5, 7],
    discoveredBy: 'Bernard Courtois', summary: 'Deep purple-black lustrous solid that readily sublimes into a vivid violet gas.',
    uses: ['Iodized table salt for thyroid health', 'Medical antiseptics (povidone-iodine)', 'Starch indicator in titration labs', 'X-ray contrast agents'],
    colorHex: '#940094'
  },
  {
    number: 79, symbol: 'Au', name: 'Gold', atomicMass: 196.966569, category: 'transition-metal',
    group: 11, period: 6, block: 'd', electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', electronsPerShell: [2, 8, 18, 32, 18, 1],
    electronegativity: 2.54, atomicRadius: 144, ionizationEnergy: 890, electronAffinity: 222.8,
    meltingPoint: 1337.33, boilingPoint: 3129, density: 19.30, oxidationStates: [1, 3],
    discoveredBy: 'Middle East (c. 6000 BC)', summary: 'Noble, chemically inert metal with brilliant yellow luster and extreme malleability.',
    uses: ['Corrosion-free electronics connectors', 'Gold leaf & jewelry', 'Spacecraft thermal radiation shields', 'Nanomedicine cancer therapies'],
    colorHex: '#FFD700'
  },
  {
    number: 80, symbol: 'Hg', name: 'Mercury', atomicMass: 200.592, category: 'transition-metal',
    group: 12, period: 6, block: 'd', electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', electronsPerShell: [2, 8, 18, 32, 18, 2],
    electronegativity: 2.00, atomicRadius: 151, ionizationEnergy: 1007, electronAffinity: 0,
    meltingPoint: 234.32, boilingPoint: 629.88, density: 13.534, oxidationStates: [1, 2],
    discoveredBy: 'Ancient civilizations', summary: 'Only metallic element that is liquid at standard temperature and pressure.',
    uses: ['Traditional barometers & manometers', 'Fluorescent lighting', 'Calomel reference electrodes', 'Dental amalgams (historic)'],
    colorHex: '#B8B8D0'
  },
  {
    number: 82, symbol: 'Pb', name: 'Lead', atomicMass: 207.2, category: 'post-transition',
    group: 14, period: 6, block: 'p', electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', electronsPerShell: [2, 8, 18, 32, 18, 4],
    electronegativity: 2.33, atomicRadius: 175, ionizationEnergy: 716, electronAffinity: 35.1,
    meltingPoint: 600.61, boilingPoint: 2022, density: 11.34, oxidationStates: [2, 4],
    discoveredBy: 'Ancient civilizations', summary: 'Heavy, dense, soft metal with high resistance to corrosion and radiation.',
    uses: ['Lead-acid car batteries', 'Radiation shielding (X-ray/gamma)', 'Acoustic dampening', 'Weights and counterbalances'],
    colorHex: '#575961'
  },
  {
    number: 92, symbol: 'U', name: 'Uranium', atomicMass: 238.02891, category: 'actinide',
    group: 3, period: 7, block: 'f', electronConfiguration: '[Rn] 5f³ 6d¹ 7s²', electronsPerShell: [2, 8, 18, 32, 21, 9, 2],
    electronegativity: 1.38, atomicRadius: 156, ionizationEnergy: 598, electronAffinity: 50.9,
    meltingPoint: 1405.3, boilingPoint: 4404, density: 19.1, oxidationStates: [3, 4, 5, 6],
    discoveredBy: 'Martin Heinrich Klaproth', summary: 'Naturally radioactive actinide metal capable of sustaining nuclear fission.',
    uses: ['Nuclear power generation', 'Naval nuclear propulsion', 'Medical radioisotopes production', 'High-density armor shielding'],
    colorHex: '#008FFF'
  }
];
