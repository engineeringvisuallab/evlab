/**
 * EVL WTP Engineering Suite - Master Engineering Standards Registry
 * Comprehensive database of verified international and local engineering standards.
 */

export interface EngineeringStandardItem {
  id: string; // e.g., STD-AWWA-B100
  code: string; // e.g., AWWA B100-16
  name: string;
  organization: string; // e.g., AWWA, WHO, USEPA, CPHEEO, ACI, IEC, IEEE
  editionYear: number | string;
  category: 'Process' | 'Hydraulics' | 'Civil/Structural' | 'Electrical' | 'Mechanical' | 'Instrumentation' | 'Environmental' | 'BIM/GIS';
  scope: string;
  verifiedClauses: { clause: string; topic: string; requirementText: string; verified: boolean; warning?: string }[];
  localRegulatoryStatus: string;
  downloadUrlOrDocRef: string;
}

export const MASTER_ENGINEERING_STANDARDS_REGISTRY: EngineeringStandardItem[] = [
  {
    id: 'STD-AWWA-B100',
    code: 'AWWA B100-16',
    name: 'Granular Filter Material Standard',
    organization: 'American Water Works Association (AWWA)',
    editionYear: 2016,
    category: 'Process',
    scope: 'Covers silicious sand, anthracite, and garnet filter media specifications for rapid gravity water filters.',
    verifiedClauses: [
      { clause: 'Sec 4.1', topic: 'Effective Size & Uniformity Coefficient', requirementText: 'Effective size d10 = 0.45-0.55 mm; Uniformity coefficient UC <= 1.5.', verified: true },
      { clause: 'Sec 4.3', topic: 'Acid Solubility Limit', requirementText: 'Solubility in 40% HCl shall not exceed 5.0% by weight.', verified: true }
    ],
    localRegulatoryStatus: 'Mandatory reference for all public water supply filter specifications.',
    downloadUrlOrDocRef: 'AWWA B100-16 Standard Manual'
  },
  {
    id: 'STD-AWWA-M11',
    code: 'AWWA M11 (5th Ed)',
    name: 'Steel Pipe — A Guide for Design and Installation',
    organization: 'AWWA',
    editionYear: 2017,
    category: 'Hydraulics',
    scope: 'Hydraulic loss calculation, wall thickness, and surge protection for steel pressure mains.',
    verifiedClauses: [
      { clause: 'Sec 5.2', topic: 'Hazen-Williams Pipe Roughness', requirementText: 'C = 130 to 140 for cement-mortar lined steel pipes.', verified: true },
      { clause: 'Sec 6.1', topic: 'Transient Pressure Surge Allowance', requirementText: 'Working pressure plus transient surge pressure shall not exceed pipe yield stress / 1.5.', verified: true }
    ],
    localRegulatoryStatus: 'Adopted for bulk raw & treated water transmission mains.',
    downloadUrlOrDocRef: 'AWWA M11 Manual'
  },
  {
    id: 'STD-AWWA-M51',
    code: 'AWWA M51 (2nd Ed)',
    name: 'Air-Release, Air/Vacuum, and Combination Air Valves',
    organization: 'AWWA',
    editionYear: 2016,
    category: 'Mechanical',
    scope: 'Sizing and location criteria for air valves on water transmission pipelines.',
    verifiedClauses: [
      { clause: 'Sec 3.1', topic: 'Air Valve Placement at High Points', requirementText: 'Air release valves required at all major summits and slope inflection points.', verified: true }
    ],
    localRegulatoryStatus: 'Standard practice for pipeline hydraulic protection.',
    downloadUrlOrDocRef: 'AWWA M51'
  },
  {
    id: 'STD-WHO-2022',
    code: 'WHO Guidelines 2022',
    name: 'Guidelines for Drinking-water Quality (4th Ed with 1st Addendum)',
    organization: 'World Health Organization (WHO)',
    editionYear: 2022,
    category: 'Environmental',
    scope: 'Health-based target concentrations and microbial safety barriers for drinking water.',
    verifiedClauses: [
      { clause: 'Sec 7.3.1', topic: 'Turbidity Barrier Threshold', requirementText: 'Turbidity at point of disinfection should be < 0.2 NTU, maximum 1.0 NTU.', verified: true },
      { clause: 'Sec 8.4', topic: 'Free Residual Chlorine Disinfection', requirementText: 'Free chlorine residual >= 0.2-0.5 mg/L after 30 min contact at pH < 8.0.', verified: true },
      { clause: 'Table 8.1', topic: 'Arsenic Health Limit', requirementText: 'Provisional health-based guideline value 0.01 mg/L (10 µg/L).', verified: true }
    ],
    localRegulatoryStatus: 'Global benchmark guideline for public drinking water quality.',
    downloadUrlOrDocRef: 'WHO Drinking Water Guidelines 2022'
  },
  {
    id: 'STD-EPA-SWTR',
    code: 'US EPA 40 CFR 141',
    name: 'Surface Water Treatment Rule (SWTR)',
    organization: 'United States Environmental Protection Agency (US EPA)',
    editionYear: 2024,
    category: 'Process',
    scope: 'Log reduction requirements for Giardia lamblia, Cryptosporidium, and viruses.',
    verifiedClauses: [
      { clause: '40 CFR 141.72', topic: 'Giardia & Virus Log Removal', requirementText: 'Minimum 3-log (99.9%) Giardia and 4-log (99.99%) Virus reduction.', verified: true },
      { clause: 'Table 1.1', topic: 'Disinfection CT Tables', requirementText: 'CT value specified as function of pH, temperature, and chlorine residual.', verified: true }
    ],
    localRegulatoryStatus: 'Primary benchmark for disinfection profiling.',
    downloadUrlOrDocRef: 'US EPA SWTR Guidance Manual'
  },
  {
    id: 'STD-CPH-001',
    code: 'CPHEEO Manual 2021',
    name: 'Manual on Water Supply and Treatment',
    organization: 'Central Public Health and Environmental Engineering Organisation (CPHEEO)',
    editionYear: 2021,
    category: 'Process',
    scope: 'Comprehensive design guidelines for water intake, clarification, filtration, chemical dosing, and distribution.',
    verifiedClauses: [
      { clause: 'Vol I, Sec 2.3', topic: 'Design Horizon & Demand Projections', requirementText: 'Design horizon 30 years for treatment plant civil structures.', verified: true },
      { clause: 'Vol I, Sec 6.4', topic: 'Clarifier Surface Overflow Rate', requirementText: 'SOR = 1.0 - 1.5 m³/m²·hr for plain coagulation-flocculation clarifiers.', verified: true },
      { clause: 'Vol I, Sec 6.5.2', topic: 'Rapid Sand Filtration Rate', requirementText: 'Filtration loading rate 5.0 - 7.5 m³/m²·hr.', verified: true }
    ],
    localRegulatoryStatus: 'Primary governing code in South Asian municipal engineering practice.',
    downloadUrlOrDocRef: 'CPHEEO Manual 2021 Volume I & II'
  },
  {
    id: 'STD-BD-ECR-2023',
    code: 'Bangladesh ECR 2023',
    name: 'Environmental Conservation Rules (ECR) 2023',
    organization: 'Ministry of Environment, Forest and Climate Change, Bangladesh',
    editionYear: 2023,
    category: 'Environmental',
    scope: 'Schedule 3 drinking water standard limits and effluent discharge standards.',
    verifiedClauses: [
      { clause: 'Schedule 3(A)', topic: 'Drinking Water Quality Limits', requirementText: 'Turbidity <= 5.0 NTU; Arsenic <= 0.05 mg/L; Iron <= 0.3-1.0 mg/L; pH 6.5-8.5.', verified: true }
    ],
    localRegulatoryStatus: 'Statutory legal requirement in Bangladesh.',
    downloadUrlOrDocRef: 'MoEFCC ECR 2023 Official Gazette'
  },
  {
    id: 'STD-ACI-350',
    code: 'ACI 350-06 / 350-20',
    name: 'Code Requirements for Environmental Engineering Concrete Structures',
    organization: 'American Concrete Institute (ACI)',
    editionYear: 2020,
    category: 'Civil/Structural',
    scope: 'Reinforced concrete design for liquid-containing water and wastewater tanks.',
    verifiedClauses: [
      { clause: 'Sec 10.3', topic: 'Environmental Durability Factor Sd', requirementText: 'Environmental load factor Sd = 1.3 applied to fluid tension and bending moment to limit surface crack width to 0.15 mm.', verified: true },
      { clause: 'Sec 7.12', topic: 'Minimum Shrinkage & Temperature Reinforcement', requirementText: 'Minimum ratio 0.003 to 0.005 depending on joint spacing.', verified: true }
    ],
    localRegulatoryStatus: 'Mandatory standard for water treatment basin structural design.',
    downloadUrlOrDocRef: 'ACI 350 Code Manual'
  },
  {
    id: 'STD-IEC-60034',
    code: 'IEC 60034-1',
    name: 'Rotating Electrical Machines — Rating and Performance',
    organization: 'International Electrotechnical Commission (IEC)',
    editionYear: 2022,
    category: 'Electrical',
    scope: 'Electric motor rating, duty cycles, efficiency classes IE1 to IE4, and temperature rise limits.',
    verifiedClauses: [
      { clause: 'Sec 12.1', topic: 'Motor Efficiency Classes', requirementText: 'Premium efficiency IE3 mandatory for industrial pumps > 0.75 kW.', verified: true }
    ],
    localRegulatoryStatus: 'Global industrial electrical equipment standard.',
    downloadUrlOrDocRef: 'IEC 60034 Standard'
  },
  {
    id: 'STD-UNVERIFIED-SAMPLE',
    code: 'ISO / Draft Unverified Standard',
    name: 'Draft Emerging Water Standard',
    organization: 'International Organization for Standardization',
    editionYear: 2025,
    category: 'Process',
    scope: 'Experimental membrane fouling calculation guidelines.',
    verifiedClauses: [
      { clause: 'Sec 12.4', topic: 'Membrane Flux Factor', requirementText: 'Draft clause under review.', verified: false, warning: '⚠ Reference identified — clause verification required' }
    ],
    localRegulatoryStatus: 'Draft status — pending PE committee verification.',
    downloadUrlOrDocRef: 'ISO Draft Committee Paper'
  }
];

export function getEngineeringStandardById(id: string): EngineeringStandardItem | undefined {
  return MASTER_ENGINEERING_STANDARDS_REGISTRY.find(s => s.id === id);
}

export function searchEngineeringStandards(query: string): EngineeringStandardItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return MASTER_ENGINEERING_STANDARDS_REGISTRY;
  return MASTER_ENGINEERING_STANDARDS_REGISTRY.filter(s =>
    s.id.toLowerCase().includes(q) ||
    s.code.toLowerCase().includes(q) ||
    s.name.toLowerCase().includes(q) ||
    s.organization.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q) ||
    s.scope.toLowerCase().includes(q)
  );
}
