import { StandardDefinition } from '../types/wtp';

export const STANDARDS_REGISTRY: StandardDefinition[] = [
  // ==========================================
  // WHO DRINKING WATER GUIDELINES (4TH ED 2022)
  // ==========================================
  {
    id: 'STD-WHO-001',
    standardName: 'Guidelines for Drinking-water Quality',
    organization: 'World Health Organization (WHO)',
    edition: '4th Edition with 1st Addendum',
    year: 2022,
    category: 'Water Quality',
    parameter: 'Turbidity',
    limitValue: '1.0',
    unit: 'NTU',
    clause: 'Sec 7.3.1',
    notes: 'For effective disinfection, turbidity should ideally be < 0.2 NTU, maximum 1.0 NTU.'
  },
  {
    id: 'STD-WHO-002',
    standardName: 'Guidelines for Drinking-water Quality',
    organization: 'WHO',
    edition: '4th Edition',
    year: 2022,
    category: 'Water Quality',
    parameter: 'Free Residual Chlorine',
    limitValue: '0.2 - 0.5',
    unit: 'mg/L',
    clause: 'Sec 8.4',
    notes: 'At least 0.5 mg/L free chlorine after 30 mins contact at pH < 8.0.'
  },
  {
    id: 'STD-WHO-003',
    standardName: 'Guidelines for Drinking-water Quality',
    organization: 'WHO',
    edition: '4th Edition',
    year: 2022,
    category: 'Water Quality',
    parameter: 'Arsenic (As)',
    limitValue: '0.01',
    unit: 'mg/L',
    clause: 'Table 8.1',
    notes: 'Provisional guideline value based on health risk assessment.'
  },
  {
    id: 'STD-WHO-004',
    standardName: 'Guidelines for Drinking-water Quality',
    organization: 'WHO',
    edition: '4th Edition',
    year: 2022,
    category: 'Water Quality',
    parameter: 'E. coli',
    limitValue: '0',
    unit: 'CFU/100mL',
    clause: 'Table 7.1',
    notes: 'Must not be detectable in any 100 mL sample.'
  },

  // ==========================================
  // BANGLADESH ECR 2023 STANDARDS
  // ==========================================
  {
    id: 'STD-BD-001',
    standardName: 'Environmental Conservation Rules (ECR) 2023',
    organization: 'Ministry of Environment, Forest and Climate Change, Bangladesh',
    edition: 'ECR 2023 Schedule 3',
    year: 2023,
    category: 'Water Quality',
    parameter: 'Turbidity',
    limitValue: '5.0',
    unit: 'NTU',
    clause: 'Schedule 3(A)',
    notes: 'National drinking water threshold.'
  },
  {
    id: 'STD-BD-002',
    standardName: 'Environmental Conservation Rules (ECR) 2023',
    organization: 'MoEFCC, Bangladesh',
    edition: 'ECR 2023',
    year: 2023,
    category: 'Water Quality',
    parameter: 'Arsenic (As)',
    limitValue: '0.05',
    unit: 'mg/L',
    clause: 'Schedule 3(A)',
    notes: 'Standard limit for Bangladesh municipal water supplies.'
  },
  {
    id: 'STD-BD-003',
    standardName: 'Environmental Conservation Rules (ECR) 2023',
    organization: 'MoEFCC, Bangladesh',
    edition: 'ECR 2023',
    year: 2023,
    category: 'Water Quality',
    parameter: 'Iron (Fe)',
    limitValue: '0.3 - 1.0',
    unit: 'mg/L',
    clause: 'Schedule 3(A)',
    notes: '0.3 mg/L preferred, up to 1.0 mg/L in groundwater high-Fe zones.'
  },

  // ==========================================
  // US EPA NATIONAL PRIMARY DRINKING WATER REGULATIONS
  // ==========================================
  {
    id: 'STD-EPA-001',
    standardName: 'National Primary Drinking Water Regulations',
    organization: 'United States Environmental Protection Agency (US EPA)',
    edition: '40 CFR Part 141',
    year: 2024,
    category: 'Water Quality',
    parameter: 'Giardia / Cryptosporidium Log Removal',
    limitValue: '3.0 - 4.0 Log',
    unit: 'Log Inactivation',
    clause: 'Surface Water Treatment Rule (SWTR)',
    notes: 'Requires 3-log Giardia and 4-log Virus reduction via physical removal + CT disinfection.'
  },

  // ==========================================
  // CPHEEO MANUAL ON WATER SUPPLY & TREATMENT
  // ==========================================
  {
    id: 'STD-CPH-001',
    standardName: 'Manual on Water Supply and Treatment',
    organization: 'CPHEEO, Ministry of Housing and Urban Affairs',
    edition: 'Revised Edition',
    year: 2021,
    category: 'Process Design',
    parameter: 'Rapid Gravity Filter Loading Rate',
    limitValue: '5.0 - 7.5',
    unit: 'm³/(m²·hr)',
    clause: 'Vol I, Sec 6.5.2',
    notes: 'Design loading rate for mono-medium sand filters.'
  },
  {
    id: 'STD-CPH-002',
    standardName: 'Manual on Water Supply and Treatment',
    organization: 'CPHEEO',
    edition: 'Revised Edition',
    year: 2021,
    category: 'Process Design',
    parameter: 'Clarifier Surface Overflow Rate',
    limitValue: '1.0 - 1.5',
    unit: 'm³/(m²·hr)',
    clause: 'Vol I, Sec 6.4',
    notes: 'For circular/rectangular plain coagulation-flocculation clarifiers.'
  }
];
