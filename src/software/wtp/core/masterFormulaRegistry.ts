/**
 * EVL WTP Engineering Suite - Master Formula Registry
 * Central, unified formula traceability architecture covering all 12 WTP engineering phases + Phase 13.
 */

export interface FormulaVariable {
  symbol: string;
  description: string;
  valueKey?: string; // Key in CalculatedWtpState or project inputs
  defaultValue?: number | string;
  unit: string;
}

export interface CalculationTraceStep {
  stepNumber: number;
  title: string;
  equation: string;
  expandedEquation: string;
  result: string;
  notes?: string;
}

export interface AlternativeMethod {
  methodName: string;
  equation: string;
  result: string;
  applicability: string;
  selected: boolean;
  reason: string;
}

export interface StandardReferenceLink {
  standardId: string;
  standardName: string;
  clause: string;
  verified: boolean;
  warning?: string;
}

export interface ValidationRuleItem {
  rule: string;
  passed: boolean;
  calculatedValue: number | string;
  allowedRange: string;
  recommendation?: string;
}

export interface MasterFormulaDefinition {
  id: string; // e.g., FORM-HYD-001
  name: string;
  category: string;
  discipline: 'Process' | 'Hydraulics' | 'Mechanical' | 'Electrical' | 'Civil/Structural' | 'Instrumentation' | 'Cost/Economics' | 'Environmental';
  description: string;
  equation: string;
  variables: FormulaVariable[];
  units: string;
  calculationSteps: CalculationTraceStep[];
  assumptions: string[];
  designCriteria: string;
  applicableRange: string;
  standards: StandardReferenceLink[];
  references: string[];
  alternativeMethods: AlternativeMethod[];
  selectedMethodReason: string;
  validationRules: ValidationRuleItem[];
  sourceModule: string;
  sourceCalculationId: string; // e.g., CALC-001
}

export const MASTER_FORMULA_REGISTRY_DATA: MasterFormulaDefinition[] = [
  // 1. HYDRAULICS & FLOW CONVERSIONS
  {
    id: 'FORM-HYD-001',
    name: 'Hourly Volumetric Flow Rate Conversion',
    category: 'Design Basis Hydraulics',
    discipline: 'Hydraulics',
    description: 'Converts daily plant capacity MLD to hourly volumetric design flow rate operating 24 hours/day.',
    equation: 'Q_m3hr = (Q_mld * 1000) / 24',
    variables: [
      { symbol: 'Q_mld', description: 'Plant Capacity', valueKey: 'plantCapacityMLD', defaultValue: 50, unit: 'MLD' }
    ],
    units: 'm³/hr',
    calculationSteps: [
      { stepNumber: 1, title: 'Input Reading', equation: 'Q_mld', expandedEquation: '50.0 MLD', result: '50.0 MLD' },
      { stepNumber: 2, title: 'Unit Conversion (MLD to m³/day)', equation: 'Q_m3day = Q_mld * 1000', expandedEquation: '50.0 * 1000', result: '50,000 m³/day' },
      { stepNumber: 3, title: 'Hourly Division (24h continuous operation)', equation: 'Q_m3hr = Q_m3day / 24', expandedEquation: '50,000 / 24', result: '2,083.33 m³/hr' }
    ],
    assumptions: ['Continuous 24-hour operation without raw water shutdown', 'Steady-state intake flow rate'],
    designCriteria: 'Base hourly flow unit for tank, basin, channel, and pump hydraulics',
    applicableRange: '0.1 MLD to 2,000 MLD',
    standards: [
      { standardId: 'STD-CPH-001', standardName: 'CPHEEO Manual on Water Supply 2021', clause: 'Vol I, Sec 2.3', verified: true },
      { standardId: 'STD-AWWA-M51', standardName: 'AWWA M51 Water Plant Design', clause: 'Sec 3.1', verified: true }
    ],
    references: ['CPHEEO Manual 2021, Vol I', 'AWWA M51 Manual of Practice'],
    alternativeMethods: [
      { methodName: '24-Hour Continuous Operation', equation: 'Q / 24', result: '2,083.33 m³/hr', applicability: 'Standard WTP', selected: true, reason: 'Selected because plant operates 24/7 with continuous chemical dosing.' },
      { methodName: '20-Hour Intermittent Operation', equation: 'Q / 20', result: '2,500.00 m³/hr', applicability: 'Small rural batch WTP', selected: false, reason: 'Not selected due to 24/7 municipal baseline design.' }
    ],
    selectedMethodReason: 'Selected 24-hour continuous operation as mandated by project design basis.',
    validationRules: [
      { rule: 'Hourly Flow > 0', passed: true, calculatedValue: 2083.33, allowedRange: '> 0 m³/hr' }
    ],
    sourceModule: 'Process & Hydraulics Engine',
    sourceCalculationId: 'CALC-001'
  },
  {
    id: 'FORM-HYD-002',
    name: 'Instantaneous Flow Rate (Liters per Second)',
    category: 'Design Basis Hydraulics',
    discipline: 'Hydraulics',
    description: 'Converts daily plant capacity to liters per second for pipe velocity, weir loading, and flash mix calculations.',
    equation: 'Q_ls = (Q_mld * 1,000,000) / 86,400',
    variables: [
      { symbol: 'Q_mld', description: 'Plant Design Capacity', valueKey: 'plantCapacityMLD', defaultValue: 50, unit: 'MLD' }
    ],
    units: 'L/s',
    calculationSteps: [
      { stepNumber: 1, title: 'Input Reading', equation: 'Q_mld', expandedEquation: '50.0 MLD', result: '50.0 MLD' },
      { stepNumber: 2, title: 'Liters Conversion', equation: 'Q_liters = Q_mld * 1,000,000', expandedEquation: '50.0 * 1,000,000', result: '50,000,000 L/day' },
      { stepNumber: 3, title: 'Second Conversion (86,400 s/day)', equation: 'Q_ls = Q_liters / 86,400', expandedEquation: '50,000,000 / 86,400', result: '578.70 L/s' }
    ],
    assumptions: ['Uniform 24h hydraulic flow rate', 'No rapid flow surges'],
    designCriteria: 'Base unit for pipe velocity, channel cross-section, and pump sizing',
    applicableRange: '1 L/s to 25,000 L/s',
    standards: [
      { standardId: 'STD-CPH-001', standardName: 'CPHEEO Manual on Water Supply 2021', clause: 'Vol I, Sec 2.3', verified: true }
    ],
    references: ['CPHEEO 2021', 'Hydraulic Institute Standards'],
    alternativeMethods: [
      { methodName: 'Standard Daily Average L/s', equation: 'Q_liters / 86,400', result: '578.70 L/s', applicability: 'Plant hydraulics', selected: true, reason: 'Standard metric flow conversion.' }
    ],
    selectedMethodReason: 'Standard SI flow rate metric required across all hydraulic calculations.',
    validationRules: [
      { rule: 'Instantaneous Flow > 0', passed: true, calculatedValue: 578.7, allowedRange: '> 0 L/s' }
    ],
    sourceModule: 'Hydraulic Engine',
    sourceCalculationId: 'CALC-002'
  },
  {
    id: 'FORM-HYD-003',
    name: 'Hazen-Williams Pipe Friction Loss',
    category: 'Piping Hydraulics',
    discipline: 'Hydraulics',
    description: 'Calculates pressure head loss due to friction in water supply pipelines.',
    equation: 'h_f = 10.67 * L * Q^1.852 / (C^1.852 * D^4.87)',
    variables: [
      { symbol: 'L', description: 'Pipeline Length', defaultValue: 1000, unit: 'm' },
      { symbol: 'Q', description: 'Design Flow Rate', valueKey: 'plantCapacityMLD', defaultValue: 0.5787, unit: 'm³/s' },
      { symbol: 'C', description: 'Hazen-Williams Roughness Coefficient', defaultValue: 130, unit: 'dimensionless' },
      { symbol: 'D', description: 'Internal Pipe Diameter', defaultValue: 0.80, unit: 'm' }
    ],
    units: 'm',
    calculationSteps: [
      { stepNumber: 1, title: 'Input Parameters', equation: 'L=1000m, Q=0.5787m³/s, C=130, D=0.80m', expandedEquation: 'L=1000, Q=0.5787, C=130, D=0.80', result: 'Inputs Loaded' },
      { stepNumber: 2, title: 'Flow & Roughness Term', equation: 'Q^1.852 / C^1.852', expandedEquation: '0.5787^1.852 / 130^1.852', result: '0.3601 / 8214.3 = 0.0000438' },
      { stepNumber: 3, title: 'Diameter Term', equation: 'D^4.87', expandedEquation: '0.80^4.87', result: '0.3364' },
      { stepNumber: 4, title: 'Final Head Loss', equation: 'h_f = 10.67 * 1000 * 0.0000438 / 0.3364', expandedEquation: '10.67 * 1000 * 0.0000438 / 0.3364', result: '1.39 m' }
    ],
    assumptions: ['Water temperature 20°C', 'Fully developed turbulent flow in full pipe'],
    designCriteria: 'Head loss gradient h_f/L must remain < 5 m/km (0.005 m/m) to minimize energy loss',
    applicableRange: 'Pipe DN 50mm to DN 3000mm, Velocity 0.5 to 3.0 m/s',
    standards: [
      { standardId: 'STD-AWWA-M11', standardName: 'AWWA M11 Steel Pipe Manual', clause: 'Sec 5.2', verified: true },
      { standardId: 'STD-CPH-001', standardName: 'CPHEEO Manual 2021', clause: 'Vol I, Sec 6.2', verified: true }
    ],
    references: ['AWWA M11', 'CPHEEO 2021'],
    alternativeMethods: [
      { methodName: 'Hazen-Williams Formula', equation: 'h_f = 10.67 * L * Q^1.852 / (C^1.852 * D^4.87)', result: '1.39 m', applicability: 'Water distribution & transmission', selected: true, reason: 'Industry standard for water pipes at ambient temperatures.' },
      { methodName: 'Darcy-Weisbach Formula', equation: 'h_f = f * (L/D) * (V²/2g)', result: '1.42 m', applicability: 'General fluid dynamics', selected: false, reason: 'Requires Colebrook-White friction factor iteration.' }
    ],
    selectedMethodReason: 'Selected Hazen-Williams formula as specified by CPHEEO & AWWA for water mains.',
    validationRules: [
      { rule: 'Headloss gradient < 5 m/km', passed: true, calculatedValue: 1.39, allowedRange: '< 5.0 m' }
    ],
    sourceModule: 'Piping Hydraulics Module',
    sourceCalculationId: 'CALC-003'
  },

  // 2. PROCESS DESIGN (RAPID MIX, FLOCCULATION, CLARIFIER, FILTERS)
  {
    id: 'FORM-PROC-001',
    name: 'Rapid Mix Chamber Active Volume',
    category: 'Coagulation & Rapid Mix',
    discipline: 'Process',
    description: 'Calculates active liquid volume of rapid mix basin based on design flow and detention time.',
    equation: 'V_rm = Q_m3s * t_rm',
    variables: [
      { symbol: 'Q_m3s', description: 'Design Volumetric Flow Rate', valueKey: 'plantCapacityMLD', defaultValue: 0.5787, unit: 'm³/s' },
      { symbol: 't_rm', description: 'Rapid Mix Detention Time', defaultValue: 45, unit: 'seconds' }
    ],
    units: 'm³',
    calculationSteps: [
      { stepNumber: 1, title: 'Flow Conversion to m³/s', equation: 'Q_m3s = Q_mld * 1000 / 86,400', expandedEquation: '50 * 1000 / 86,400', result: '0.5787 m³/s' },
      { stepNumber: 2, title: 'Detention Time Input', equation: 't_rm', expandedEquation: '45 seconds', result: '45 s' },
      { stepNumber: 3, title: 'Volume Calculation', equation: 'V_rm = 0.5787 * 45', expandedEquation: '0.5787 * 45', result: '26.04 m³' }
    ],
    assumptions: ['Complete liquid displacement', 'No short-circuiting'],
    designCriteria: 'Detention time between 30 and 60 seconds',
    applicableRange: 'Detention time 10 to 120 seconds',
    standards: [
      { standardId: 'STD-CPH-001', standardName: 'CPHEEO Manual 2021', clause: 'Vol I, Sec 6.2.1', verified: true },
      { standardId: 'STD-AWWA-M51', standardName: 'AWWA M51', clause: 'Sec 4.2', verified: true }
    ],
    references: ['CPHEEO 2021', 'AWWA M51'],
    alternativeMethods: [
      { methodName: 'Detention Time Sizing', equation: 'V = Q * t', result: '26.04 m³', applicability: 'Mechanical rapid mixer', selected: true, reason: 'Ensures instantaneous coagulant dispersion.' }
    ],
    selectedMethodReason: 'Standard Camp detention time sizing method.',
    validationRules: [
      { rule: 'Detention time between 30-60s', passed: true, calculatedValue: 45, allowedRange: '30 - 60 seconds' }
    ],
    sourceModule: 'Process Design Engine',
    sourceCalculationId: 'CALC-004'
  },
  {
    id: 'FORM-PROC-002',
    name: 'Rapid Mix Mechanical Shaft Power (Camp Formula)',
    category: 'Coagulation & Rapid Mix',
    discipline: 'Process',
    description: 'Calculates mechanical shaft power from fluid dynamic viscosity, volume, and velocity gradient G.',
    equation: 'P_rm = (μ * V_rm * G_rm²) / 1000',
    variables: [
      { symbol: 'μ', description: 'Dynamic Viscosity of Water (20°C)', defaultValue: 0.001002, unit: 'Pa·s' },
      { symbol: 'V_rm', description: 'Chamber Liquid Volume', defaultValue: 26.04, unit: 'm³' },
      { symbol: 'G_rm', description: 'Target Velocity Gradient', defaultValue: 800, unit: 's⁻¹' }
    ],
    units: 'kW',
    calculationSteps: [
      { stepNumber: 1, title: 'Dynamic Viscosity', equation: 'μ at 20°C', expandedEquation: '0.001002 Pa·s', result: '0.001002 Pa·s' },
      { stepNumber: 2, title: 'Velocity Gradient Squared', equation: 'G²', expandedEquation: '800²', result: '640,000 s⁻²' },
      { stepNumber: 3, title: 'Power Term Calculation', equation: 'P = 0.001002 * 26.04 * 640,000 / 1000', expandedEquation: '0.001002 * 26.04 * 640,000 / 1000', result: '16.70 kW' }
    ],
    assumptions: ['Water temperature 20°C', 'Uniform velocity gradient across chamber'],
    designCriteria: 'Target G value 600 to 1,000 s⁻¹',
    applicableRange: 'G = 300 to 1,500 s⁻¹',
    standards: [
      { standardId: 'STD-CPH-001', standardName: 'CPHEEO Manual 2021', clause: 'Vol I, Sec 6.2.2', verified: true },
      { standardId: 'STD-AWWA-M51', standardName: 'AWWA M51', clause: 'Sec 4.3', verified: true }
    ],
    references: ['CPHEEO 2021', 'Water Treatment Plant Design (McGraw-Hill)'],
    alternativeMethods: [
      { methodName: 'Camp G-Value Formula', equation: 'P = μ * V * G²', result: '16.70 kW', applicability: 'Impeller Flash Mixer', selected: true, reason: 'Fundamental fluid dynamic mixing energy formula.' }
    ],
    selectedMethodReason: 'Universally accepted Camp velocity gradient formulation.',
    validationRules: [
      { rule: 'G Value within 600-1000 s⁻¹', passed: true, calculatedValue: 800, allowedRange: '600 - 1,000 s⁻¹' }
    ],
    sourceModule: 'Process Design Engine',
    sourceCalculationId: 'CALC-005'
  },
  {
    id: 'FORM-FLTR-001',
    name: 'Rapid Sand Filter Total Bed Area',
    category: 'Filtration',
    discipline: 'Process',
    description: 'Calculates total plan area required for rapid gravity sand filters based on filtration loading rate.',
    equation: 'Area_total = Q_m3hr / V_filt',
    variables: [
      { symbol: 'Q_m3hr', description: 'Design Hourly Production Flow', valueKey: 'plantCapacityMLD', defaultValue: 2083.33, unit: 'm³/hr' },
      { symbol: 'V_filt', description: 'Filtration Loading Rate', defaultValue: 6.0, unit: 'm³/(m²·hr)' }
    ],
    units: 'm²',
    calculationSteps: [
      { stepNumber: 1, title: 'Hourly Flow Reading', equation: 'Q_m3hr', expandedEquation: '2,083.33 m³/hr', result: '2,083.33 m³/hr' },
      { stepNumber: 2, title: 'Filtration Rate Selection', equation: 'V_filt', expandedEquation: '6.0 m/h', result: '6.0 m/h' },
      { stepNumber: 3, title: 'Required Bed Area', equation: 'Area = 2083.33 / 6.0', expandedEquation: '2083.33 / 6.0', result: '347.22 m²' }
    ],
    assumptions: ['Uniform flow distribution across filter beds', 'All beds operating in parallel'],
    designCriteria: 'Filtration loading rate 5.0 to 7.5 m³/m²·hr for single media sand filters',
    applicableRange: '4.0 to 15.0 m/h',
    standards: [
      { standardId: 'STD-AWWA-B100', standardName: 'AWWA B100 Granular Filter Material', clause: 'Sec 4.1', verified: true },
      { standardId: 'STD-CPH-001', standardName: 'CPHEEO Manual 2021', clause: 'Vol I, Sec 6.5.2', verified: true }
    ],
    references: ['AWWA B100', 'CPHEEO 2021'],
    alternativeMethods: [
      { methodName: 'Standard Loading Rate Sizing', equation: 'Area = Q / V', result: '347.22 m²', applicability: 'Rapid gravity filter', selected: true, reason: 'AWWA B100 standard filtration rate basis.' }
    ],
    selectedMethodReason: 'Standard AWWA B100 filtration loading rate method.',
    validationRules: [
      { rule: 'Filtration Rate 5.0 - 7.5 m/h', passed: true, calculatedValue: 6.0, allowedRange: '5.0 - 7.5 m/h' }
    ],
    sourceModule: 'Filter Sizing Engine',
    sourceCalculationId: 'CALC-006'
  },
  {
    id: 'FORM-SED-001',
    name: 'Clarifier Plan Surface Area (Surface Overflow Rate)',
    category: 'Sedimentation',
    discipline: 'Process',
    description: 'Calculates required clarifier surface plan area from design flow and Surface Overflow Rate (SOR).',
    equation: 'Area_clar = Q_m3hr / SOR',
    variables: [
      { symbol: 'Q_m3hr', description: 'Hourly Design Flow Rate', valueKey: 'plantCapacityMLD', defaultValue: 2083.33, unit: 'm³/hr' },
      { symbol: 'SOR', description: 'Surface Overflow Rate', defaultValue: 1.25, unit: 'm³/(m²·hr)' }
    ],
    units: 'm²',
    calculationSteps: [
      { stepNumber: 1, title: 'Design Flow', equation: 'Q_m3hr', expandedEquation: '2083.33 m³/hr', result: '2083.33 m³/hr' },
      { stepNumber: 2, title: 'Overflow Rate Input', equation: 'SOR', expandedEquation: '1.25 m³/m²·hr', result: '1.25 m/h' },
      { stepNumber: 3, title: 'Area Calculation', equation: 'Area = 2083.33 / 1.25', expandedEquation: '2083.33 / 1.25', result: '1,666.66 m²' }
    ],
    assumptions: ['Uniform laminar upflow across settling basin', 'No short-circuiting'],
    designCriteria: 'SOR = 1.0 to 1.5 m³/m²·hr for conventional clarifiers; 3.0 to 5.0 for tube settlers',
    applicableRange: '0.8 to 6.0 m/h',
    standards: [
      { standardId: 'STD-CPH-001', standardName: 'CPHEEO Manual 2021', clause: 'Vol I, Sec 6.4', verified: true },
      { standardId: 'STD-GLUMRB', standardName: 'Ten States Standards (GLUMRB)', clause: 'Sec 4.3', verified: true }
    ],
    references: ['CPHEEO 2021', 'Ten States Standards'],
    alternativeMethods: [
      { methodName: 'Surface Overflow Rate (SOR)', equation: 'Area = Q / SOR', result: '1,666.66 m²', applicability: 'Conventional Clarifier', selected: true, reason: 'Governing gravity settling rate.' },
      { methodName: 'Tube Settler Projected Area', equation: 'Area = Q / (SOR * cos θ)', result: '520.83 m²', applicability: 'High-rate Tube Settler', selected: false, reason: 'Tube settlers evaluated in Phase 13 alternatives.' }
    ],
    selectedMethodReason: 'Standard SOR settling calculation for plain coagulation-flocculation clarifiers.',
    validationRules: [
      { rule: 'SOR within 1.0 - 1.5 m/h', passed: true, calculatedValue: 1.25, allowedRange: '1.0 - 1.5 m/h' }
    ],
    sourceModule: 'Clarifier Design Module',
    sourceCalculationId: 'CALC-007'
  },
  {
    id: 'FORM-DIS-001',
    name: 'Disinfection CT Value (EPA Log Inactivation)',
    category: 'Disinfection',
    discipline: 'Process',
    description: 'Calculates achieved EPA CT value based on free residual chlorine concentration and effective residence time T10.',
    equation: 'CT_achieved = C_free * (T_nominal * Baffle_Factor)',
    variables: [
      { symbol: 'C_free', description: 'Free Residual Chlorine Concentration', defaultValue: 2.0, unit: 'mg/L' },
      { symbol: 'T_nominal', description: 'Nominal Contact Chamber Retention Time', defaultValue: 30, unit: 'minutes' },
      { symbol: 'Baffle_Factor', description: 'Tank Baffle Factor (T10/T ratio)', defaultValue: 0.7, unit: 'ratio' }
    ],
    units: 'mg·min/L',
    calculationSteps: [
      { stepNumber: 1, title: 'Residual Chlorine', equation: 'C_free', expandedEquation: '2.0 mg/L', result: '2.0 mg/L' },
      { stepNumber: 2, title: 'Effective Contact Time (T10)', equation: 'T10 = 30 * 0.7', expandedEquation: '30 * 0.7', result: '21.0 minutes' },
      { stepNumber: 3, title: 'CT Calculation', equation: 'CT = 2.0 * 21.0', expandedEquation: '2.0 * 21.0', result: '42.0 mg·min/L' }
    ],
    assumptions: ['Water temperature 20°C', 'pH 6.5 to 7.5', 'Baffle factor 0.7 for serpentine baffled basin'],
    designCriteria: 'CT >= 15 mg·min/L for 3-Log Virus and 0.5-Log Giardia inactivation',
    applicableRange: 'CT = 5 to 200 mg·min/L',
    standards: [
      { standardId: 'STD-EPA-SWTR', standardName: 'US EPA Surface Water Treatment Rule', clause: '40 CFR Part 141, Table 1.1', verified: true },
      { standardId: 'STD-WHO-2022', standardName: 'WHO Drinking Water Guidelines 2022', clause: 'Sec 8.4', verified: true }
    ],
    references: ['US EPA SWTR Profiling Guidance', 'WHO 2022'],
    alternativeMethods: [
      { methodName: 'EPA T10 Baffle Method', equation: 'CT = C * T10', result: '42.0 mg·min/L', applicability: 'Chlorine Contact Tank', selected: true, reason: 'Official US EPA & WHO log inactivation credit standard.' }
    ],
    selectedMethodReason: 'US EPA SWTR regulatory requirement for primary disinfection credit.',
    validationRules: [
      { rule: 'CT >= 15 mg·min/L', passed: true, calculatedValue: 42.0, allowedRange: '>= 15 mg·min/L' }
    ],
    sourceModule: 'Disinfection & Chemical Dosing Module',
    sourceCalculationId: 'CALC-008'
  },

  // 3. PUMPING & MECHANICAL
  {
    id: 'FORM-PUMP-001',
    name: 'Centrifugal Pump Motor Electrical Power',
    category: 'Pumping & Motors',
    discipline: 'Mechanical',
    description: 'Converts fluid dynamic power TDH to required motor electrical power input.',
    equation: 'P_motor = (rho * g * Q * TDH) / (1000 * Eff_pump * Eff_motor)',
    variables: [
      { symbol: 'rho', description: 'Water Density (1000 kg/m³)', defaultValue: 1000, unit: 'kg/m³' },
      { symbol: 'g', description: 'Gravitational Acceleration', defaultValue: 9.81, unit: 'm/s²' },
      { symbol: 'Q', description: 'Pump Flow Rate', defaultValue: 0.5787, unit: 'm³/s' },
      { symbol: 'TDH', description: 'Total Dynamic Head', defaultValue: 30.0, unit: 'm' },
      { symbol: 'Eff_pump', description: 'Pump Efficiency', defaultValue: 0.80, unit: 'decimal' },
      { symbol: 'Eff_motor', description: 'Motor Efficiency', defaultValue: 0.95, unit: 'decimal' }
    ],
    units: 'kW',
    calculationSteps: [
      { stepNumber: 1, title: 'Hydraulic Power Demand', equation: 'P_hyd = rho * g * Q * TDH / 1000', expandedEquation: '1000 * 9.81 * 0.5787 * 30 / 1000', result: '170.31 kW' },
      { stepNumber: 2, title: 'Combined Efficiency', equation: 'Eff_tot = 0.80 * 0.95', expandedEquation: '0.80 * 0.95', result: '0.76 (76%)' },
      { stepNumber: 3, title: 'Motor Electrical Power', equation: 'P_motor = 170.31 / 0.76', expandedEquation: '170.31 / 0.76', result: '224.09 kW' }
    ],
    assumptions: ['Water temperature 20°C', 'Continuous duty electric motor with 15% safety factor'],
    designCriteria: 'Nameplate motor rating selected with >= 15% runout safety margin',
    applicableRange: '1 kW to 5,000 kW',
    standards: [
      { standardId: 'STD-HI-1.3', standardName: 'Hydraulic Institute Standards HI 1.3', clause: 'Sec 1.3.4', verified: true },
      { standardId: 'STD-IEC-60034', standardName: 'IEC 60034 Rotating Electrical Machines', clause: 'Part 1', verified: true }
    ],
    references: ['Hydraulic Institute Standards', 'IEC 60034'],
    alternativeMethods: [
      { methodName: 'Wire-to-Water Power Equation', equation: 'P = γ Q H / (η_p * η_m)', result: '224.09 kW', applicability: 'All Pumping Units', selected: true, reason: 'Standard electromechanical power conversion.' }
    ],
    selectedMethodReason: 'Standard Hydraulic Institute wire-to-water efficiency power formulation.',
    validationRules: [
      { rule: 'Motor Power > 0', passed: true, calculatedValue: 224.09, allowedRange: '> 0 kW' }
    ],
    sourceModule: 'Pumping & Equipment Engine',
    sourceCalculationId: 'CALC-009'
  },

  // 4. CHEMICAL DOSING
  {
    id: 'FORM-CHEM-001',
    name: 'Coagulant Commercial Mass Dosing Rate',
    category: 'Chemical Dosing',
    discipline: 'Process',
    description: 'Calculates daily commercial chemical mass consumption based on plant flow rate and target dosage.',
    equation: 'W_chem_day = (Q_mld * 1000 * Dose_mgL) / 1000',
    variables: [
      { symbol: 'Q_mld', description: 'Plant Capacity', valueKey: 'plantCapacityMLD', defaultValue: 50, unit: 'MLD' },
      { symbol: 'Dose_mgL', description: 'Chemical Dose Rate', defaultValue: 35.0, unit: 'mg/L' }
    ],
    units: 'kg/day',
    calculationSteps: [
      { stepNumber: 1, title: 'Volumetric Flow in m³/day', equation: 'V_day = 50 * 1000', expandedEquation: '50 * 1000', result: '50,000 m³/day' },
      { stepNumber: 2, title: 'Dose Conversion (g/m³ = mg/L)', equation: 'Dose = 35.0 g/m³', expandedEquation: '35.0', result: '35.0 g/m³' },
      { stepNumber: 3, title: 'Daily Mass Calculation', equation: 'W = 50,000 * 35.0 / 1000', expandedEquation: '50,000 * 35.0 / 1000', result: '1,750.0 kg/day' }
    ],
    assumptions: ['100% commercial purity product', 'Uniform continuous chemical feed'],
    designCriteria: 'Used to size chemical solution tanks, metering pumps, and chemical house storage',
    applicableRange: '1 kg/day to 50,000 kg/day',
    standards: [
      { standardId: 'STD-AWWA-B403', standardName: 'AWWA B403 Liquid Alum Standard', clause: 'Sec 3.2', verified: true },
      { standardId: 'STD-CPH-001', standardName: 'CPHEEO Manual 2021', clause: 'Vol I, Sec 7.2', verified: true }
    ],
    references: ['AWWA B403', 'CPHEEO 2021'],
    alternativeMethods: [
      { methodName: 'Direct Mass Loading Balance', equation: 'W = Q * Dose / 1000', result: '1,750.0 kg/day', applicability: 'All Chemical Dosing', selected: true, reason: 'Exact stoichiometric mass balance.' }
    ],
    selectedMethodReason: 'Standard mass loading equation for chemical dosing house sizing.',
    validationRules: [
      { rule: 'Daily Consumption > 0', passed: true, calculatedValue: 1750.0, allowedRange: '> 0 kg/day' }
    ],
    sourceModule: 'Chemical Dosing Engine',
    sourceCalculationId: 'CALC-010'
  },

  // 5. SLUDGE & SOLIDS BALANCE
  {
    id: 'FORM-SLD-001',
    name: 'Total Dry Sludge Solids Generation',
    category: 'Sludge Management',
    discipline: 'Environmental',
    description: 'Calculates total dry solids produced daily from raw water TSS removal and alum precipitation.',
    equation: 'M_sludge_dry = (Q_mld * 1000) * (TSS_removed + 0.26 * Dose_alum) / 1000',
    variables: [
      { symbol: 'Q_mld', description: 'Plant Capacity', valueKey: 'plantCapacityMLD', defaultValue: 50, unit: 'MLD' },
      { symbol: 'TSS_removed', description: 'Captured Raw Water Suspended Solids', defaultValue: 108.0, unit: 'mg/L' },
      { symbol: 'Dose_alum', description: 'Commercial Alum Dose', defaultValue: 35.0, unit: 'mg/L' }
    ],
    units: 'kg dry solids/day',
    calculationSteps: [
      { stepNumber: 1, title: 'Raw TSS Captured', equation: 'TSS = 120 * 0.90', expandedEquation: '120 * 0.90', result: '108.0 mg/L' },
      { stepNumber: 2, title: 'Alum Hydroxide Solids Factor', equation: '0.26 * 35.0', expandedEquation: '0.26 * 35.0', result: '9.1 mg/L' },
      { stepNumber: 3, title: 'Total Solids Concentration', equation: 'C_solids = 108.0 + 9.1', expandedEquation: '108.0 + 9.1', result: '117.1 mg/L' },
      { stepNumber: 4, title: 'Daily Dry Mass', equation: 'M = 50,000 * 117.1 / 1000', expandedEquation: '50,000 * 117.1 / 1000', result: '5,855.0 kg dry solids/day' }
    ],
    assumptions: ['90% TSS removal efficiency across clarifier', '0.26 kg Al(OH)3 dry solid formed per kg alum'],
    designCriteria: 'Key design parameter for sludge thickener, centrifuge, and filter press sizing',
    applicableRange: '100 kg/day to 200,000 kg/day',
    standards: [
      { standardId: 'STD-AWWA-WTPD', standardName: 'AWWA Water Treatment Plant Design 5th Ed', clause: 'Sec 16.3', verified: true },
      { standardId: 'STD-CPH-001', standardName: 'CPHEEO Manual 2021', clause: 'Vol I, Sec 12.2', verified: true }
    ],
    references: ['AWWA WTP Design Manual', 'CPHEEO 2021'],
    alternativeMethods: [
      { methodName: 'Alum Stoichiometric Mass Balance', equation: 'M = Q * (TSS_cap + 0.26 * Dose)', result: '5,855.0 kg/day', applicability: 'Alum Coagulation WTP', selected: true, reason: 'Reflects actual chemical reaction precipitation.' }
    ],
    selectedMethodReason: 'Standard AWWA solids production formula for alum coagulant sludge.',
    validationRules: [
      { rule: 'Dry Solids Mass > 0', passed: true, calculatedValue: 5855.0, allowedRange: '> 0 kg/day' }
    ],
    sourceModule: 'Sludge Management Module',
    sourceCalculationId: 'CALC-011'
  },

  // 6. ELECTRICAL & INSTRUMENTATION
  {
    id: 'FORM-ELEC-001',
    name: '3-Phase AC Motor Full Load Current (FLA)',
    category: 'Electrical Loads',
    discipline: 'Electrical',
    description: 'Calculates three-phase motor full load current based on rated power, line voltage, efficiency, and power factor.',
    equation: 'I_fla = (P_kw * 1000) / (1.732 * V_line * PF * Eff)',
    variables: [
      { symbol: 'P_kw', description: 'Motor Rated Power', defaultValue: 250, unit: 'kW' },
      { symbol: 'V_line', description: 'Line-to-Line Voltage', defaultValue: 415, unit: 'V' },
      { symbol: 'PF', description: 'Power Factor', defaultValue: 0.88, unit: 'ratio' },
      { symbol: 'Eff', description: 'Motor Efficiency', defaultValue: 0.94, unit: 'ratio' }
    ],
    units: 'A',
    calculationSteps: [
      { stepNumber: 1, title: 'Power Input in Watts', equation: 'P_watts = 250 * 1000', expandedEquation: '250 * 1000', result: '250,000 W' },
      { stepNumber: 2, title: 'Denominator Term', equation: '1.732 * 415 * 0.88 * 0.94', expandedEquation: '1.732 * 415 * 0.88 * 0.94', result: '594.52' },
      { stepNumber: 3, title: 'Current Calculation', equation: 'I_fla = 250,000 / 594.52', expandedEquation: '250,000 / 594.52', result: '420.51 A' }
    ],
    assumptions: ['Balanced 3-phase AC power supply', 'Sinusoidal waveform at 50 Hz'],
    designCriteria: 'Used to size MCC circuit breakers, contactors, overload relays, and power cables',
    applicableRange: '1 A to 2,000 A',
    standards: [
      { standardId: 'STD-IEC-60034', standardName: 'IEC 60034 Standard Motors', clause: 'Sec 12.1', verified: true },
      { standardId: 'STD-IEEE-141', standardName: 'IEEE 141 Red Book Industrial Power', clause: 'Sec 3.4', verified: true }
    ],
    references: ['IEC 60034', 'IEEE 141'],
    alternativeMethods: [
      { methodName: '3-Phase AC Current Formula', equation: 'I = P / (√3 V PF η)', result: '420.51 A', applicability: '3-Phase Motors', selected: true, reason: 'Fundamental 3-phase electrical engineering law.' }
    ],
    selectedMethodReason: 'Standard IEC 3-phase current equation.',
    validationRules: [
      { rule: 'Full Load Current > 0', passed: true, calculatedValue: 420.51, allowedRange: '> 0 A' }
    ],
    sourceModule: 'Electrical Design Module',
    sourceCalculationId: 'CALC-012'
  },

  // 7. STRUCTURAL & CIVIL
  {
    id: 'FORM-STR-001',
    name: 'Water Retaining Concrete Basin Wall Bending Moment (ACI 350)',
    category: 'Structural Concrete',
    discipline: 'Civil/Structural',
    description: 'Calculates maximum hydrostatic bending moment on cantilevered RCC tank wall.',
    equation: 'M_max = (gamma_w * H^3) / 6',
    variables: [
      { symbol: 'gamma_w', description: 'Unit Weight of Water (9.81 kN/m³)', defaultValue: 9.81, unit: 'kN/m³' },
      { symbol: 'H', description: 'Liquid Water Depth in Basin', defaultValue: 4.5, unit: 'm' }
    ],
    units: 'kN·m/m',
    calculationSteps: [
      { stepNumber: 1, title: 'Height Cubed', equation: 'H³ = 4.5³', expandedEquation: '4.5 * 4.5 * 4.5', result: '91.125 m³' },
      { stepNumber: 2, title: 'Hydrostatic Force Factor', equation: '9.81 * 91.125 / 6', expandedEquation: '9.81 * 91.125 / 6', result: '148.99 kN·m/m' }
    ],
    assumptions: ['Cantilevered wall fixed at base slab', 'Full hydrostatic water pressure to top top of wall'],
    designCriteria: 'ACI 350 environmental durability factor Sd = 1.3 applied for crack width control',
    applicableRange: 'H = 1.0 m to 12.0 m',
    standards: [
      { standardId: 'STD-ACI-350', standardName: 'ACI 350 Code for Environmental Concrete Structures', clause: 'Sec 10.3', verified: true },
      { standardId: 'STD-ACI-318', standardName: 'ACI 318 Building Code Requirements', clause: 'Sec 22.1', verified: true }
    ],
    references: ['ACI 350 Environmental Structures', 'ACI 318'],
    alternativeMethods: [
      { methodName: 'Hydrostatic Triangular Moment', equation: 'M = γ H³ / 6', result: '148.99 kN·m/m', applicability: 'Water Tanks', selected: true, reason: 'Governing hydrostatic fluid pressure law.' }
    ],
    selectedMethodReason: 'ACI 350 mandatory code requirement for fluid-containing concrete structures.',
    validationRules: [
      { rule: 'Bending Moment > 0', passed: true, calculatedValue: 148.99, allowedRange: '> 0 kN·m/m' }
    ],
    sourceModule: 'Structural Design Engine',
    sourceCalculationId: 'CALC-013'
  },

  // 8. BOQ / COST / ECONOMICS
  {
    id: 'FORM-COST-001',
    name: '30-Year Life Cycle Cost Analysis Net Present Value (LCCA NPV)',
    category: 'Economics & LCCA',
    discipline: 'Cost/Economics',
    description: 'Calculates 30-year total life cycle cost (CAPEX + Present Value of OPEX) at discount rate r.',
    equation: 'NPV = CAPEX + sum(OPEX_t / (1 + r)^t)',
    variables: [
      { symbol: 'CAPEX', description: 'Initial Capital Cost', defaultValue: 24850000, unit: 'USD' },
      { symbol: 'OPEX_annual', description: 'Annual Operating Cost', defaultValue: 2993000, unit: 'USD/yr' },
      { symbol: 'r', description: 'Discount Rate', defaultValue: 0.06, unit: 'decimal' },
      { symbol: 'n', description: 'Evaluation Horizon', defaultValue: 30, unit: 'years' }
    ],
    units: 'USD',
    calculationSteps: [
      { stepNumber: 1, title: 'Annual Uniform Series Factor', equation: 'P/A factor = ((1+r)^n - 1) / (r*(1+r)^n)', expandedEquation: '((1.06^30 - 1) / (0.06 * 1.06^30))', result: '13.7648' },
      { stepNumber: 2, title: 'Present Value of 30-Yr OPEX', equation: 'PV_opex = 2,993,000 * 13.7648', expandedEquation: '2,993,000 * 13.7648', result: '41,198,046 USD' },
      { stepNumber: 3, title: 'Total LCCA NPV', equation: 'NPV = 24,850,000 + 41,198,046', expandedEquation: '24,850,000 + 41,198,046', result: '66,048,046 USD' }
    ],
    assumptions: ['30-year design horizon', '6.0% discount rate', 'Constant annual O&M inflation rate'],
    designCriteria: 'Used to compare technology alternatives and select lowest life cycle cost process',
    applicableRange: '10 to 50 year evaluation horizon',
    standards: [
      { standardId: 'STD-AWWA-M51', standardName: 'AWWA M51 Engineering Economics', clause: 'Sec 12.4', verified: true },
      { standardId: 'STD-CPHEEO-2021', standardName: 'CPHEEO Manual 2021', clause: 'Vol I, Sec 15.1', verified: true }
    ],
    references: ['AWWA M51', 'CPHEEO 2021'],
    alternativeMethods: [
      { methodName: 'Net Present Value (NPV)', equation: 'NPV = CAPEX + OPEX * (P/A, r, n)', result: '66,048,046 USD', applicability: 'Project Appraisal', selected: true, reason: 'World Bank & ADB standard economic appraisal model.' }
    ],
    selectedMethodReason: 'Standard World Bank / ADB discount cash flow methodology.',
    validationRules: [
      { rule: 'LCCA NPV > CAPEX', passed: true, calculatedValue: 66048046, allowedRange: '> CAPEX' }
    ],
    sourceModule: 'BOQ & Cost Economics Module',
    sourceCalculationId: 'CALC-014'
  }
];

export function getMasterFormulaById(id: string): MasterFormulaDefinition | undefined {
  return MASTER_FORMULA_REGISTRY_DATA.find(f => f.id === id);
}

export function searchMasterFormulas(query: string): MasterFormulaDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return MASTER_FORMULA_REGISTRY_DATA;
  return MASTER_FORMULA_REGISTRY_DATA.filter(f =>
    f.id.toLowerCase().includes(q) ||
    f.name.toLowerCase().includes(q) ||
    f.category.toLowerCase().includes(q) ||
    f.discipline.toLowerCase().includes(q) ||
    f.description.toLowerCase().includes(q) ||
    f.equation.toLowerCase().includes(q) ||
    f.sourceModule.toLowerCase().includes(q)
  );
}
