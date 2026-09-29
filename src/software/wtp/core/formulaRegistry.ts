/**
 * EVL WTP Engineering Suite - Formula Registry
 * Formal index of all governing engineering formulas used across process, hydraulic, electrical, and cost calculations.
 */

export interface FormulaDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  formula: string;
  variables: { symbol: string; description: string; unit: string }[];
  outputParameterId: string;
  outputUnit: string;
  applicableProcesses: string[];
  assumptions: string[];
  designCriteria: string;
  standardReferences: string[];
  validationRules: string[];
}

export const MASTER_FORMULA_REGISTRY: FormulaDefinition[] = [
  // 1. DEMAND & FLOW CONVERSIONS
  {
    id: 'FRM-FLOW-001',
    name: 'Hourly Flow Rate Conversion',
    category: 'Design Basis',
    description: 'Converts daily plant capacity MLD to hourly volumetric design flow rate operating 24 hours/day.',
    formula: 'Q_m3hr = (Q_mld * 1000) / 24',
    variables: [
      { symbol: 'Q_mld', description: 'Plant Capacity', unit: 'MLD' }
    ],
    outputParameterId: 'DES-CAP-002',
    outputUnit: 'm³/hr',
    applicableProcesses: ['All WTP Units'],
    assumptions: ['Continuous 24h operation'],
    designCriteria: 'Base unit for hourly tank and basin sizing',
    standardReferences: ['CPHEEO Manual 2021, Vol I, Sec 2.3'],
    validationRules: ['Q_m3hr > 0']
  },
  {
    id: 'FRM-FLOW-002',
    name: 'Instantaneous Flow Rate (L/s)',
    category: 'Design Basis',
    description: 'Converts daily capacity to liters per second for pipe velocity and rapid mix calculations.',
    formula: 'Q_ls = (Q_mld * 1000000) / 86400',
    variables: [
      { symbol: 'Q_mld', description: 'Plant Capacity', unit: 'MLD' }
    ],
    outputParameterId: 'DES-CAP-003',
    outputUnit: 'L/s',
    applicableProcesses: ['Piping', 'Rapid Mix', 'Intake'],
    assumptions: ['Uniform 24h flow'],
    designCriteria: 'Base unit for hydraulics and pump hydraulics',
    standardReferences: ['CPHEEO 2021'],
    validationRules: ['Q_ls > 0']
  },

  // 2. POPULATION PROJECTIONS
  {
    id: 'FRM-POP-001',
    name: 'Geometric Population Projection Method',
    category: 'Design Basis',
    description: 'Projects design horizon population using compound compound growth rate.',
    formula: 'P_n = P_0 * (1 + r/100)^n',
    variables: [
      { symbol: 'P_0', description: 'Base Population', unit: 'Capita' },
      { symbol: 'r', description: 'Annual Growth Rate', unit: '%' },
      { symbol: 'n', description: 'Design Horizon', unit: 'Years' }
    ],
    outputParameterId: 'DES-POP-001',
    outputUnit: 'Capita',
    applicableProcesses: ['Master Planning'],
    assumptions: ['Constant exponential compound growth rate'],
    designCriteria: 'Standard for developing urban centers with high growth',
    standardReferences: ['CPHEEO Vol I, Sec 2.2', 'AWWA M51'],
    validationRules: ['P_n > P_0']
  },

  // 3. WATER QUALITY & CONTAMINANT MASS LOAD
  {
    id: 'FRM-WQ-001',
    name: 'Required Contaminant Removal Efficiency',
    category: 'Water Quality',
    description: 'Calculates required percentage removal to achieve drinking water target standard.',
    formula: 'Removal_% = ((C_raw - C_target) / C_raw) * 100',
    variables: [
      { symbol: 'C_raw', description: 'Raw Water Concentration', unit: 'mg/L or NTU' },
      { symbol: 'C_target', description: 'Target Guideline Concentration', unit: 'mg/L or NTU' }
    ],
    outputParameterId: 'WQ-REM-001',
    outputUnit: '%',
    applicableProcesses: ['All Treatment Processes'],
    assumptions: ['Steady-state raw water quality'],
    designCriteria: 'Must meet WHO / CPHEEO drinking water limits',
    standardReferences: ['WHO Drinking Water Guidelines 2022', 'CPHEEO 2021'],
    validationRules: ['Removal_% >= 0', 'Removal_% <= 100']
  },

  // 4. COAGULATION & RAPID MIXING
  {
    id: 'FRM-MIX-001',
    name: 'Rapid Mix Chamber Volume',
    category: 'Coagulation',
    description: 'Calculates active liquid volume of rapid mix basin based on detention time.',
    formula: 'V_rm = Q_m3s * t_rm',
    variables: [
      { symbol: 'Q_m3s', description: 'Design Flow', unit: 'm³/s' },
      { symbol: 't_rm', description: 'Detention Time', unit: 'seconds' }
    ],
    outputParameterId: 'COA-MIX-VOL',
    outputUnit: 'm³',
    applicableProcesses: ['Rapid Mix Basin'],
    assumptions: ['Complete fluid mixing'],
    designCriteria: 'Detention time 30 - 60 seconds',
    standardReferences: ['AWWA M51', 'CPHEEO Vol I, Sec 6.2'],
    validationRules: ['t_rm >= 30', 't_rm <= 60']
  },
  {
    id: 'FRM-MIX-002',
    name: 'Rapid Mix Mixing Power (Camp Formula)',
    category: 'Coagulation',
    description: 'Calculates mechanical shaft power from fluid dynamic viscosity, volume, and velocity gradient G.',
    formula: 'P_rm = (mu * V_rm * G_rm^2) / 1000',
    variables: [
      { symbol: 'mu', description: 'Dynamic Viscosity (0.001002 Pa·s at 20°C)', unit: 'Pa·s' },
      { symbol: 'V_rm', description: 'Tank Volume', unit: 'm³' },
      { symbol: 'G_rm', description: 'Velocity Gradient', unit: 's⁻¹' }
    ],
    outputParameterId: 'COA-MIX-004',
    outputUnit: 'kW',
    applicableProcesses: ['Flash Mixer Impeller'],
    assumptions: ['20°C water temperature'],
    designCriteria: 'G = 600 - 1000 s⁻¹',
    standardReferences: ['CPHEEO 2021', 'AWWA Water Quality & Treatment'],
    validationRules: ['G_rm >= 300', 'G_rm <= 1500']
  },

  // 5. ALKALINITY BALANCE & LIME DOSING
  {
    id: 'FRM-ALK-001',
    name: 'Alkalinity Consumption & Deficit',
    category: 'Alkalinity Balance',
    description: 'Calculates net residual alkalinity following coagulant reaction and required lime supplement.',
    formula: 'Alk_rem = Alk_raw - (0.45 * Dose_alum)',
    variables: [
      { symbol: 'Alk_raw', description: 'Raw Water Alkalinity', unit: 'mg/L as CaCO3' },
      { symbol: 'Dose_alum', description: 'Commercial Alum Dose', unit: 'mg/L' }
    ],
    outputParameterId: 'WQ-CHM-ALK-REM',
    outputUnit: 'mg/L as CaCO3',
    applicableProcesses: ['Coagulation / Chemical Dosing'],
    assumptions: ['1 mg/L alum consumes 0.45 mg/L alkalinity as CaCO3'],
    designCriteria: 'Residual alkalinity must remain >= 30 mg/L as CaCO3 to prevent corrosion and pH crash',
    standardReferences: ['CPHEEO Vol I, Sec 6.3', 'AWWA M37'],
    validationRules: ['Alk_rem >= 30']
  },

  // 6. FLOCCULATION (3-STAGE TAPERED G)
  {
    id: 'FRM-FLOC-001',
    name: 'Total Flocculation Camp Index (GT)',
    category: 'Flocculation',
    description: 'Calculates total Camp mixing value GT across 3 tapered velocity gradient stages.',
    formula: 'GT_total = (G1 * t1) + (G2 * t2) + (G3 * t3)',
    variables: [
      { symbol: 'G1', description: 'Stage 1 G Value', unit: 's⁻¹' },
      { symbol: 'G2', description: 'Stage 2 G Value', unit: 's⁻¹' },
      { symbol: 'G3', description: 'Stage 3 G Value', unit: 's⁻¹' },
      { symbol: 't1', description: 'Stage 1 Detention Time', unit: 'seconds' }
    ],
    outputParameterId: 'FLO-GT-TOT',
    outputUnit: 'dimensionless',
    applicableProcesses: ['Paddled / Baffled Flocculator'],
    assumptions: ['Equal volume per stage'],
    designCriteria: 'GT = 30,000 to 60,000 for alum flocculation',
    standardReferences: ['CPHEEO Vol I, Sec 6.4', 'AWWA M51'],
    validationRules: ['GT_total >= 20000', 'GT_total <= 100000']
  },

  // 7. SEDIMENTATION & TUBE SETTLER
  {
    id: 'FRM-SED-001',
    name: 'Clarifier Plan Surface Area',
    category: 'Sedimentation',
    description: 'Calculates required clarifier surface plan area from design flow and Surface Overflow Rate (SOR).',
    formula: 'Area_clar = Q_m3hr / SOR',
    variables: [
      { symbol: 'Q_m3hr', description: 'Design Hourly Flow', unit: 'm³/hr' },
      { symbol: 'SOR', description: 'Surface Overflow Rate', unit: 'm³/(m²·hr)' }
    ],
    outputParameterId: 'SED-CLR-AREA',
    outputUnit: 'm²',
    applicableProcesses: ['Clarifier / Tube Settler'],
    assumptions: ['Uniform flow distribution across basin surface'],
    designCriteria: 'SOR = 1.0 - 1.5 m3/m2-hr (conventional) or 3.0 - 5.0 (tube settler)',
    standardReferences: ['CPHEEO 2021', 'Ten States Standards Sec 4.3'],
    validationRules: ['SOR > 0']
  },

  // 8. FILTRATION & CLEAN HEADLOSS
  {
    id: 'FRM-FIL-001',
    name: 'Rapid Sand Filter Clean Bed Headloss (Rose Equation)',
    category: 'Filtration',
    description: 'Calculates initial clean bed headloss across sand filter media.',
    formula: 'h_L0 = (1.067 / (g * psi)) * (v_filt^2 / porosity^4) * sum(C_D * x_i / d_i) * L_bed',
    variables: [
      { symbol: 'v_filt', description: 'Filtration Rate', unit: 'm/s' },
      { symbol: 'porosity', description: 'Sand Porosity (0.42)', unit: 'ratio' },
      { symbol: 'L_bed', description: 'Bed Depth', unit: 'm' },
      { symbol: 'd_10', description: 'Effective Grain Size', unit: 'mm' }
    ],
    outputParameterId: 'FIL-HL-001',
    outputUnit: 'm',
    applicableProcesses: ['Rapid Gravity Filter'],
    assumptions: ['Uniform sphericity sand grains'],
    designCriteria: 'Initial clean headloss <= 0.3 - 0.4 m',
    standardReferences: ['AWWA B100', 'Water Treatment Plant Design (McGraw-Hill)'],
    validationRules: ['h_L0 <= 0.5']
  },

  // 9. DISINFECTION (EPA CT LOG INACTIVATION)
  {
    id: 'FRM-DIS-001',
    name: 'Achieved Disinfection CT Value',
    category: 'Disinfection',
    description: 'Calculates actual EPA CT value based on free residual chlorine concentration and effective residence time T10.',
    formula: 'CT_achieved = C_free * (T_nominal * Baffle_Factor)',
    variables: [
      { symbol: 'C_free', description: 'Free Residual Chlorine', unit: 'mg/L' },
      { symbol: 'T_nominal', description: 'Nominal Tank Retention Time', unit: 'minutes' },
      { symbol: 'Baffle_Factor', description: 'T10/T Baffle Factor (0.7 for serpentine)', unit: 'ratio' }
    ],
    outputParameterId: 'DIS-CHL-004',
    outputUnit: 'mg·min/L',
    applicableProcesses: ['Chlorine Contact Tank'],
    assumptions: ['pH 6.5 - 7.5, Temperature 20°C'],
    designCriteria: 'CT >= 15 mg·min/L for 3-Log Virus and 0.5-Log Giardia inactivation',
    standardReferences: ['US EPA Surface Water Treatment Rule (SWTR) Table 1.1'],
    validationRules: ['CT_achieved >= 15']
  },

  // 10. HYDRAULICS & HAZEN-WILLIAMS FRICTION
  {
    id: 'FRM-HYD-001',
    name: 'Hazen-Williams Pipe Friction Loss',
    category: 'Hydraulics',
    description: 'Calculates headloss due to friction in water pressure conduits.',
    formula: 'h_f = 10.67 * L * Q^1.852 / (C^1.852 * D^4.87)',
    variables: [
      { symbol: 'L', description: 'Pipe Length', unit: 'm' },
      { symbol: 'Q', description: 'Flow Rate', unit: 'm³/s' },
      { symbol: 'C', description: 'Hazen-Williams Roughness (130 for DI)', unit: 'dimensionless' },
      { symbol: 'D', description: 'Internal Diameter', unit: 'm' }
    ],
    outputParameterId: 'HYD-PIPE-HF',
    outputUnit: 'm',
    applicableProcesses: ['Raw Water & Treated Water Mains'],
    assumptions: ['Fully developed turbulent flow in water mains'],
    designCriteria: 'Velocity = 1.0 - 2.0 m/s',
    standardReferences: ['AWWA M11', 'CPHEEO Manual 2021'],
    validationRules: ['h_f >= 0']
  },

  // 11. WATER HAMMER SURGE
  {
    id: 'FRM-SURGE-001',
    name: 'Joukowsky Transient Pressure Surge',
    category: 'Surge Analysis',
    description: 'Calculates maximum transient pressure rise due to sudden pump trip or valve closure.',
    formula: 'Delta_H = (a * Delta_v) / g',
    variables: [
      { symbol: 'a', description: 'Acoustic Wave Celerity (approx 1000 m/s in DI pipe)', unit: 'm/s' },
      { symbol: 'Delta_v', description: 'Velocity Change', unit: 'm/s' },
      { symbol: 'g', description: 'Gravitational Acceleration (9.81 m/s²)', unit: 'm/s²' }
    ],
    outputParameterId: 'HYD-SURGE-HEAD',
    outputUnit: 'm',
    applicableProcesses: ['Pumping Mains'],
    assumptions: ['Instantaneous valve closure or pump power failure'],
    designCriteria: 'Total head (Static + Surge) must not exceed pipe PN rating',
    standardReferences: ['AWWA M11 Hydraulic Transients', 'Hydraulic Institute Standards'],
    validationRules: ['Delta_H >= 0']
  },

  // 12. SLUDGE MASS BALANCE
  {
    id: 'FRM-SLU-001',
    name: 'Dry Sludge Mass Generation',
    category: 'Sludge Management',
    description: 'Calculates total dry solids produced daily from raw TSS removal and alum precipitation.',
    formula: 'M_sludge_dry = (Q_mld * 1000) * (TSS_removed + 0.26 * Dose_alum) / 1000',
    variables: [
      { symbol: 'Q_mld', description: 'Plant Flow', unit: 'MLD' },
      { symbol: 'TSS_removed', description: 'Raw Water Suspended Solids Removed', unit: 'mg/L' },
      { symbol: 'Dose_alum', description: 'Commercial Alum Dose', unit: 'mg/L' }
    ],
    outputParameterId: 'SLU-SOL-001',
    outputUnit: 'kg dry solids/day',
    applicableProcesses: ['Clarifier & Filter Backwash Wastewater'],
    assumptions: ['90% TSS removal in plant', '0.26 kg Al(OH)3 dry solid per kg alum'],
    designCriteria: 'Key input for gravity thickener and filter press sizing',
    standardReferences: ['AWWA Water Treatment Plant Design 5th Ed', 'CPHEEO 2021'],
    validationRules: ['M_sludge_dry >= 0']
  },

  // 13. WATER BALANCE
  {
    id: 'FRM-BAL-001',
    name: 'Plant Overall Water Balance Loss & Recovery',
    category: 'Water Balance',
    description: 'Calculates net treated water recovery efficiency accounting for backwash and sludge blowdown.',
    formula: 'Recovery_% = (Q_product / Q_raw_intake) * 100',
    variables: [
      { symbol: 'Q_product', description: 'Net Treated Water Supplied', unit: 'MLD' },
      { symbol: 'Q_raw_intake', description: 'Total Raw Water Intake', unit: 'MLD' }
    ],
    outputParameterId: 'BAL-REC-PCT',
    outputUnit: '%',
    applicableProcesses: ['Plant Water Balance'],
    assumptions: ['Recycle stream returned to flash mixer'],
    designCriteria: 'Plant recovery efficiency must be >= 95%',
    standardReferences: ['CPHEEO Manual 2021', 'WHO Guidelines'],
    validationRules: ['Recovery_% >= 90']
  },

  // 14. HYDRAULICS, PIPING & PUMPING FORMULAS
  {
    id: 'FRM-HYD-001',
    name: 'Hazen-Williams Pipe Friction Head Loss',
    category: 'Hydraulics',
    description: 'Calculates pressure head loss in water pressure pipes based on pipe roughness C.',
    formula: 'h_f = 10.67 * L * Q^1.852 / (C^1.852 * D^4.87)',
    variables: [
      { symbol: 'L', description: 'Pipe Length', unit: 'm' },
      { symbol: 'Q', description: 'Flow Rate', unit: 'm³/s' },
      { symbol: 'C', description: 'Hazen-Williams Roughness', unit: 'dimensionless' },
      { symbol: 'D', description: 'Internal Pipe Diameter', unit: 'm' }
    ],
    outputParameterId: 'HYD-PIP-004',
    outputUnit: 'm',
    applicableProcesses: ['Raw Mains', 'Pumping Lines', 'Filter Headers'],
    assumptions: ['Water temperature 20°C', 'Full pipe flow'],
    designCriteria: 'Max head loss gradient < 5 m/km',
    standardReferences: ['AWWA M11', 'CPHEEO 2021'],
    validationRules: ['h_f >= 0']
  },
  {
    id: 'FRM-HYD-002',
    name: 'Darcy-Weisbach Pipe Friction Loss',
    category: 'Hydraulics',
    description: 'Universal friction loss equation for laminar and turbulent fluid flow in pipes.',
    formula: 'h_f = f * (L / D) * (V^2 / (2 * g))',
    variables: [
      { symbol: 'f', description: 'Darcy Friction Factor', unit: 'dimensionless' },
      { symbol: 'L', description: 'Pipe Length', unit: 'm' },
      { symbol: 'D', description: 'Pipe Diameter', unit: 'm' },
      { symbol: 'V', description: 'Flow Velocity', unit: 'm/s' }
    ],
    outputParameterId: 'HYD-PIP-005',
    outputUnit: 'm',
    applicableProcesses: ['All Pressure Pipes'],
    assumptions: ['Colebrook-White or Swamee-Jain f value'],
    designCriteria: 'Fundamental hydraulic loss equation',
    standardReferences: ['Hydraulic Institute', 'Crane TP 410'],
    validationRules: ['h_f >= 0']
  },
  {
    id: 'FRM-HYD-003',
    name: 'Minor Head Loss in Fittings & Valves',
    category: 'Hydraulics',
    description: 'Calculates localized resistance head loss across pipe fittings, elbows, tees, and valves.',
    formula: 'h_m = K_total * (V^2 / (2 * g))',
    variables: [
      { symbol: 'K_total', description: 'Sum of Fitting Resistance Coefficients', unit: 'dimensionless' },
      { symbol: 'V', description: 'Flow Velocity', unit: 'm/s' }
    ],
    outputParameterId: 'HYD-PIP-008',
    outputUnit: 'm',
    applicableProcesses: ['Piping Headers', 'Pump Suction & Discharge'],
    assumptions: ['Standard K values from Crane TP 410'],
    designCriteria: 'Minor losses usually 10-25% of total friction loss',
    standardReferences: ['Crane TP 410', 'AWWA M11'],
    validationRules: ['h_m >= 0']
  },
  {
    id: 'FRM-HYD-004',
    name: 'Pump Shaft & Motor Electrical Power',
    category: 'Pumping',
    description: 'Converts fluid energy TDH to required brake shaft power and electrical motor power.',
    formula: 'P_motor = (rho * g * Q * TDH / 1000) / (Eff_pump * Eff_motor / 10000)',
    variables: [
      { symbol: 'Q', description: 'Pump Flow Rate', unit: 'm³/s' },
      { symbol: 'TDH', description: 'Total Dynamic Head', unit: 'm' },
      { symbol: 'Eff_pump', description: 'Pump Efficiency', unit: '%' },
      { symbol: 'Eff_motor', description: 'Motor Efficiency', unit: '%' }
    ],
    outputParameterId: 'HYD-PMP-005',
    outputUnit: 'kW',
    applicableProcesses: ['Raw Water & High Lift Pumping'],
    assumptions: ['Continuous duty electric motor'],
    designCriteria: 'Motor power selected with 15% safety margin above runout shaft power',
    standardReferences: ['Hydraulic Institute Standards HI 1.3'],
    validationRules: ['P_motor > 0']
  },
  {
    id: 'FRM-HYD-005',
    name: 'Joukowsky Water Hammer Surge Pressure Rise',
    category: 'Surge',
    description: 'Calculates peak acoustic pressure rise during sudden flow stoppage in pressure pipes.',
    formula: 'deltaH_surge = (a_wave * V_initial) / g',
    variables: [
      { symbol: 'a_wave', description: 'Wave Speed / Celerity', unit: 'm/s' },
      { symbol: 'V_initial', description: 'Initial Velocity', unit: 'm/s' }
    ],
    outputParameterId: 'HYD-SUR-002',
    outputUnit: 'm',
    applicableProcesses: ['Pumping Mains & Pressure Pipelines'],
    assumptions: ['Instantaneous valve closure or pump trip (T_close <= 2L/a)'],
    designCriteria: 'Total peak pressure must be <= pipe pressure rating PN',
    standardReferences: ['AWWA M11', 'CPHEEO 2021'],
    validationRules: ['deltaH_surge >= 0']
  },

  // 11. PHASE 05 - CHEMICAL TREATMENT & WATER QUALITY FORMULAS
  {
    id: 'FRM-CHEM-001',
    name: 'Contaminant Mass Loading Rate',
    category: 'Water Quality',
    description: 'Calculates daily mass loading rate of contaminants in kg/day from raw concentration and plant flow.',
    formula: 'Mass_KgDay = (Concentration_mgL * Flow_m3day) / 1000',
    variables: [
      { symbol: 'Concentration_mgL', description: 'Raw Contaminant Concentration', unit: 'mg/L' },
      { symbol: 'Flow_m3day', description: 'Daily Volumetric Flow Rate', unit: 'm³/day' }
    ],
    outputParameterId: 'WQ-MASS-001',
    outputUnit: 'kg/day',
    applicableProcesses: ['Raw Water Intake', 'Coagulation', 'Sludge Treatment'],
    assumptions: ['Uniform concentration over 24h'],
    designCriteria: 'Basis for chemical dosing, sludge yield, and solids handling sizing',
    standardReferences: ['AWWA M51', 'CPHEEO 2021'],
    validationRules: ['Mass_KgDay >= 0']
  },
  {
    id: 'FRM-CHEM-002',
    name: 'Coagulant Commercial Dosing Rate',
    category: 'Chemical Dosing',
    description: 'Converts target active coagulant dose into commercial liquid/dry product dosing rate.',
    formula: 'Commercial_Dose_mgL = Active_Dose_mgL / (Active_Fraction * Purity_Percent / 100)',
    variables: [
      { symbol: 'Active_Dose_mgL', description: 'Target Active Coagulant Dose', unit: 'mg/L' },
      { symbol: 'Active_Fraction', description: 'Chemical Active Fraction (e.g. 0.48 for Alum)', unit: 'decimal' },
      { symbol: 'Purity_Percent', description: 'Chemical Commercial Purity', unit: '%' }
    ],
    outputParameterId: 'CHEM-DOS-001',
    outputUnit: 'mg/L',
    applicableProcesses: ['Flash Rapid Mix', 'Chemical Building'],
    assumptions: ['Standard commercial grade purity'],
    designCriteria: 'Determines chemical feed pump rates and day tank sizing',
    standardReferences: ['AWWA B403', 'CPHEEO Manual Sec 7.2'],
    validationRules: ['Commercial_Dose_mgL >= Active_Dose_mgL']
  },
  {
    id: 'FRM-CHEM-003',
    name: 'Coagulant Alkalinity Consumption Balance',
    category: 'Alkalinity & pH',
    description: 'Calculates natural alkalinity consumed by coagulant hydrolysis in mg/L as CaCO3.',
    formula: 'Alk_Consumed = Active_Dose_mgL * Alk_Factor',
    variables: [
      { symbol: 'Active_Dose_mgL', description: 'Active Coagulant Dose', unit: 'mg/L' },
      { symbol: 'Alk_Factor', description: 'Alkalinity Consumption Factor (0.45 Alum, 0.92 Ferric)', unit: 'mg/mg' }
    ],
    outputParameterId: 'CHEM-ALK-001',
    outputUnit: 'mg/L as CaCO3',
    applicableProcesses: ['Coagulation', 'Lime Addition'],
    assumptions: ['Stoichiometric completion of aluminum/iron hydroxide precipitate'],
    designCriteria: 'Residual alkalinity must remain >= 20 mg/L as CaCO3 for buffering',
    standardReferences: ['AWWA M51', 'Water Treatment Plant Design (AWWA/ASCE)'],
    validationRules: ['Alk_Consumed >= 0']
  },
  {
    id: 'FRM-CHEM-004',
    name: 'Chemical Sludge Dry Solids Yield',
    category: 'Sludge & Precipitation',
    description: 'Calculates total dry solids produced from raw suspended solids capture and metal hydroxide precipitate.',
    formula: 'Dry_Sludge_KgDay = ((TSS_Raw - TSS_Eff) * Flow_m3day / 1000) + (Coagulant_Dose_KgDay * Sludge_Factor)',
    variables: [
      { symbol: 'TSS_Raw', description: 'Raw Water Suspended Solids', unit: 'mg/L' },
      { symbol: 'TSS_Eff', description: 'Clarified Effluent TSS', unit: 'mg/L' },
      { symbol: 'Coagulant_Dose_KgDay', description: 'Commercial Coagulant Daily Consumption', unit: 'kg/day' },
      { symbol: 'Sludge_Factor', description: 'Sludge Yield Factor (0.26 Alum, 0.28 Ferric)', unit: 'kg/kg' }
    ],
    outputParameterId: 'CHEM-SLD-001',
    outputUnit: 'kg/day',
    applicableProcesses: ['Clarification', 'Sludge Thickening'],
    assumptions: ['Complete precipitation of metal hydroxides'],
    designCriteria: 'Basis for sludge thickener and dewatering filter press sizing',
    standardReferences: ['AWWA M51', 'CPHEEO Vol I Sec 12'],
    validationRules: ['Dry_Sludge_KgDay >= 0']
  },
  {
    id: 'FRM-CHEM-005',
    name: 'Effective Chlorine Contact Time (T10)',
    category: 'Disinfection & CT',
    description: 'Calculates 10% tracer detention time T10 from hydraulic detention time and tank baffle factor.',
    formula: 'T10_min = (Volume_m3 / Flow_m3hr * 60) * Baffle_Factor',
    variables: [
      { symbol: 'Volume_m3', description: 'Chlorine Contact Tank Usable Volume', unit: 'm³' },
      { symbol: 'Flow_m3hr', description: 'Peak Hourly Water Flow', unit: 'm³/hr' },
      { symbol: 'Baffle_Factor', description: 'Tank Baffling Efficiency (0.1 to 0.7)', unit: 'ratio' }
    ],
    outputParameterId: 'DIS-CT-001',
    outputUnit: 'min',
    applicableProcesses: ['Chlorine Contact Tank'],
    assumptions: ['Continuous plug flow with internal baffling'],
    designCriteria: 'Baffle factor 0.7 required for superior serpentine tanks',
    standardReferences: ['US EPA Disinfection Profiling Manual', 'CPHEEO 2021'],
    validationRules: ['T10_min > 0']
  },
  {
    id: 'FRM-CHEM-006',
    name: 'Disinfection CT Value & Log Inactivation',
    category: 'Disinfection & CT',
    description: 'Calculates achieved CT credit from free residual chlorine concentration and effective contact time T10.',
    formula: 'CT_achieved = Free_Residual_Cl2 * T10_min',
    variables: [
      { symbol: 'Free_Residual_Cl2', description: 'Free Residual Chlorine at Contact Outlet', unit: 'mg/L' },
      { symbol: 'T10_min', description: 'Effective Contact Time T10', unit: 'min' }
    ],
    outputParameterId: 'DIS-CT-002',
    outputUnit: 'mg·min/L',
    applicableProcesses: ['Chlorine Contact Tank'],
    assumptions: ['Constant chlorine residual over contact chamber'],
    designCriteria: 'CT_achieved must meet or exceed EPA regulatory requirements (e.g. 42 mg·min/L for 3-log Giardia)',
    standardReferences: ['US EPA SWTR 40 CFR 141', 'WHO Guidelines 2022'],
    validationRules: ['CT_achieved >= CT_required']
  },
  {
    id: 'FRM-CHEM-007',
    name: 'Reverse Osmosis Permeate Flow & Recovery Balance',
    category: 'Membrane & RO',
    description: 'Calculates RO permeate flow and concentrate reject flow from feed flow and recovery percentage.',
    formula: 'Permeate_m3hr = Feed_m3hr * (Recovery_Percent / 100)',
    variables: [
      { symbol: 'Feed_m3hr', description: 'RO Feed Water Flow', unit: 'm³/hr' },
      { symbol: 'Recovery_Percent', description: 'Target Recovery Percentage', unit: '%' }
    ],
    outputParameterId: 'MEM-RO-001',
    outputUnit: 'm³/hr',
    applicableProcesses: ['RO System', 'Desalination'],
    assumptions: ['Stable temperature and membrane flux'],
    designCriteria: 'Brackish RO typical recovery 75-80%; Seawater RO typical recovery 40-50%',
    standardReferences: ['AWWA M46 Reverse Osmosis', 'ASTM D3739'],
    validationRules: ['Permeate_m3hr < Feed_m3hr']
  },
  {
    id: 'FRM-CHEM-008',
    name: 'Chemical Storage Tank Working Volume',
    category: 'Chemical Storage',
    description: 'Calculates total chemical storage volume required for specified supply autonomy days.',
    formula: 'Storage_Vol_m3 = (Daily_Consumption_kgDay * Storage_Days) / (Density_kgL * 1000 * (Stock_Conc_Percent / 100))',
    variables: [
      { symbol: 'Daily_Consumption_kgDay', description: 'Daily Chemical Consumption', unit: 'kg/day' },
      { symbol: 'Storage_Days', description: 'Autonomy Storage Requirement (e.g. 30 days)', unit: 'days' },
      { symbol: 'Density_kgL', description: 'Chemical Solution Density', unit: 'kg/L' },
      { symbol: 'Stock_Conc_Percent', description: 'Stock Solution Concentration', unit: '%' }
    ],
    outputParameterId: 'CHEM-STO-001',
    outputUnit: 'm³',
    applicableProcesses: ['Chemical Building', 'Storage Tanks'],
    assumptions: ['Minimum 15 to 30 days onsite inventory'],
    designCriteria: 'Sized with 10% freeboard allowance above working volume',
    standardReferences: ['AWWA M51', 'CPHEEO Vol I Sec 7'],
    validationRules: ['Storage_Vol_m3 > 0']
  },

  // ==========================================
  // PHASE 06 - MECHANICAL & EQUIPMENT FORMULAS
  // ==========================================
  {
    id: 'FRM-EQP-001',
    name: 'Motor Rated Power Sizing',
    category: 'Equipment & Motor Sizing',
    description: 'Calculates standard electric motor nameplate rating applying pump efficiency, motor efficiency, and service factor margin.',
    formula: 'P_motor_kw = ((P_hyd_kw / (η_pump / 100)) * SF_motor) / (η_motor / 100)',
    variables: [
      { symbol: 'P_hyd_kw', description: 'Hydraulic Power Demand', unit: 'kW' },
      { symbol: 'η_pump', description: 'Pump Efficiency Percentage', unit: '%' },
      { symbol: 'SF_motor', description: 'Service Factor Margin (1.15 to 1.25)', unit: 'ratio' },
      { symbol: 'η_motor', description: 'Electric Motor Efficiency Percentage', unit: '%' }
    ],
    outputParameterId: 'EQP-PWR-001',
    outputUnit: 'kW',
    applicableProcesses: ['Raw Pumps', 'High Lift Pumps', 'Backwash Pumps'],
    assumptions: ['Standard IEC 60034 motor rating selection'],
    designCriteria: 'Motor rating must exceed shaft power with minimum 15% margin to prevent thermal trip on duty curves',
    standardReferences: ['NEMA MG1', 'IEC 60034', 'CPHEEO 2021'],
    validationRules: ['P_motor_kw > P_hyd_kw']
  },
  {
    id: 'FRM-EQP-002',
    name: 'Rapid Mixer Shaft Power Requirement',
    category: 'Equipment & Mixing',
    description: 'Calculates required shaft power for rapid flash mixer agitator based on velocity gradient G, fluid dynamic viscosity, and basin volume.',
    formula: 'P_mixer_kw = (G^2 * μ * V_basin) / 1000',
    variables: [
      { symbol: 'G', description: 'Velocity Gradient', unit: 's⁻¹' },
      { symbol: 'μ', description: 'Dynamic Viscosity of Water (0.001002 Pa·s at 20°C)', unit: 'Pa·s' },
      { symbol: 'V_basin', description: 'Mixing Chamber Volume', unit: 'm³' }
    ],
    outputParameterId: 'EQP-PWR-002',
    outputUnit: 'kW',
    applicableProcesses: ['Coagulation Rapid Mix'],
    assumptions: ['Uniform fluid turbulence distribution'],
    designCriteria: 'G = 600 to 1000 s⁻¹ for rapid coagulant hydrolysis dispersion',
    standardReferences: ['AWWA M51', 'CPHEEO Vol I Sec 7.3'],
    validationRules: ['P_mixer_kw > 0']
  },
  {
    id: 'FRM-EQP-003',
    name: 'Air Scour Blower Motor Power',
    category: 'Equipment & Blowers',
    description: 'Calculates air scour blower shaft and motor power from air flow rate and delivery backpressure.',
    formula: 'P_blower_kw = (Q_air_m3hr * P_kpa) / (3600 * η_blower)',
    variables: [
      { symbol: 'Q_air_m3hr', description: 'Filter Backwash Air Scour Flow', unit: 'm³/hr' },
      { symbol: 'P_kpa', description: 'Delivery Air Pressure', unit: 'kPa' },
      { symbol: 'η_blower', description: 'Blower Isentropic Efficiency', unit: 'ratio' }
    ],
    outputParameterId: 'EQP-BLW-001',
    outputUnit: 'kW',
    applicableProcesses: ['Rapid Gravity Filters'],
    assumptions: ['Positive displacement rotary lobe blower'],
    designCriteria: 'Air scour loading rate 50 - 70 m³/m²·hr at 40 - 50 kPa',
    standardReferences: ['CPHEEO Vol I Sec 7.6', 'AWWA C504'],
    validationRules: ['P_blower_kw > 0']
  },
  {
    id: 'FRM-EQP-004',
    name: 'Filter Pipe & Valve Diameter Sizing',
    category: 'Equipment & Valves',
    description: 'Calculates recommended valve nominal diameter (DN) to maintain target design velocity.',
    formula: 'DN_mm = sqrt((4 * (Q_m3hr / 3600)) / (π * v_target)) * 1000',
    variables: [
      { symbol: 'Q_m3hr', description: 'Process Flow Rate', unit: 'm³/hr' },
      { symbol: 'v_target', description: 'Target Velocity', unit: 'm/s' }
    ],
    outputParameterId: 'EQP-VLV-001',
    outputUnit: 'mm',
    applicableProcesses: ['Piping', 'Valves'],
    assumptions: ['Full circular pipe flow'],
    designCriteria: 'Valve flow velocity limited to 1.5 - 2.5 m/s to prevent surge and high head loss',
    standardReferences: ['AWWA C504', 'CPHEEO 2021'],
    validationRules: ['DN_mm > 0']
  },
  {
    id: 'FRM-EQP-005',
    name: 'Equipment Single Failure N-1 Redundancy Capacity Ratio',
    category: 'Equipment & Redundancy',
    description: 'Calculates percentage of required design capacity maintained during single equipment unit outage.',
    formula: 'R_N1_% = (((N_total - 1) * Capacity_unit) / Capacity_required) * 100',
    variables: [
      { symbol: 'N_total', description: 'Total Installed Equipment Count', unit: 'count' },
      { symbol: 'Capacity_unit', description: 'Capacity per Equipment Unit', unit: 'm³/hr' },
      { symbol: 'Capacity_required', description: 'Total Design Required Flow', unit: 'm³/hr' }
    ],
    outputParameterId: 'EQP-RED-001',
    outputUnit: '%',
    applicableProcesses: ['Pumps', 'Blowers', 'Dosing Systems'],
    assumptions: ['Single unit failure condition'],
    designCriteria: 'R_N1 must be >= 100% for critical units to meet 100% design flow with 1 unit down',
    standardReferences: ['Ten State Standards', 'CPHEEO 2021'],
    validationRules: ['R_N1_% >= 100']
  },
  {
    id: 'FRM-EQP-006',
    name: 'Plant Specific Electrical Energy Consumption',
    category: 'Equipment & Energy',
    description: 'Calculates kilowatt-hours consumed per cubic meter of treated water produced.',
    formula: 'E_spec_kWhM3 = (P_operating_kw * 24) / (Q_mld * 1000)',
    variables: [
      { symbol: 'P_operating_kw', description: 'Total Operating Electrical Load', unit: 'kW' },
      { symbol: 'Q_mld', description: 'Daily Plant Production Capacity', unit: 'MLD' }
    ],
    outputParameterId: 'EQP-PWR-003',
    outputUnit: 'kWh/m³',
    applicableProcesses: ['Whole WTP'],
    assumptions: ['Continuous 24h design operation'],
    designCriteria: 'Benchmark target < 0.35 kWh/m³ for conventional surface water WTPs',
    standardReferences: ['CPHEEO 2021', 'AWWA M51'],
    validationRules: ['E_spec_kWhM3 > 0']
  },
  {
    id: 'FRM-ELE-001',
    name: '3-Phase AC Motor Full Load Current (FLA)',
    category: 'Electrical',
    description: 'Calculates three-phase motor full load current based on rated power, voltage, efficiency, and power factor.',
    formula: 'I_fla = (P_kw * 1000) / (1.732 * V_lv * PF * eta)',
    variables: [
      { symbol: 'P_kw', description: 'Motor Rated Power Output', unit: 'kW' },
      { symbol: 'V_lv', description: 'Line Voltage', unit: 'V' },
      { symbol: 'PF', description: 'Motor Power Factor', unit: 'ratio' },
      { symbol: 'eta', description: 'Motor Efficiency', unit: 'ratio' }
    ],
    outputParameterId: 'ELE-LOAD-001',
    outputUnit: 'A',
    applicableProcesses: ['All Motor Drives'],
    assumptions: ['Balanced 3-phase supply'],
    designCriteria: 'IEC 60034 standard motor performance parameters',
    standardReferences: ['IEC 60034', 'IEEE 141'],
    validationRules: ['I_fla > 0']
  },
  {
    id: 'FRM-ELE-002',
    name: 'Substation Transformer Sizing',
    category: 'Electrical',
    description: 'Calculates required step-down transformer kVA rating from operating demand kW and design spare margin.',
    formula: 'S_trf_kva = (P_demand_kw / PF) * (1 + Margin_spare / 100)',
    variables: [
      { symbol: 'P_demand_kw', description: 'Operating Demand Electrical Load', unit: 'kW' },
      { symbol: 'PF', description: 'System Operating Power Factor', unit: 'ratio' },
      { symbol: 'Margin_spare', description: 'Future Growth Spare Margin', unit: '%' }
    ],
    outputParameterId: 'ELE-TRF-001',
    outputUnit: 'kVA',
    applicableProcesses: ['Substation Sizing'],
    assumptions: ['Coincident demand factor applied'],
    designCriteria: 'Transformer peak load strictly < 85% of rated capacity',
    standardReferences: ['IEC 60076', 'IEEE 141'],
    validationRules: ['S_trf_kva > 0']
  },
  {
    id: 'FRM-ELE-003',
    name: '3-Phase Cable Voltage Drop Percentage',
    category: 'Electrical',
    description: 'Calculates percentage voltage drop along power cable run.',
    formula: 'VD_percent = (1.732 * I_amps * L_meters * Vc_mv_a_m) / (10 * V_lv)',
    variables: [
      { symbol: 'I_amps', description: 'Design Cable Current', unit: 'A' },
      { symbol: 'L_meters', description: 'Cable One-Way Length', unit: 'm' },
      { symbol: 'Vc_mv_a_m', description: 'Cable Voltage Drop Factor', unit: 'mV/A/m' },
      { symbol: 'V_lv', description: 'System Nominal Voltage', unit: 'V' }
    ],
    outputParameterId: 'ELE-CBL-001',
    outputUnit: '%',
    applicableProcesses: ['Cable Sizing'],
    assumptions: ['Copper conductor at 70°C / 90°C operating temperature'],
    designCriteria: 'Voltage drop must remain <= 3% for running motor feeders',
    standardReferences: ['BS 7671', 'IEC 60364-5-52'],
    validationRules: ['VD_percent <= 3.0']
  },
  {
    id: 'FRM-ELE-004',
    name: 'Power Factor Correction Capacitor Sizing',
    category: 'Electrical',
    description: 'Calculates required reactive power compensation (kvar) to elevate power factor to target value.',
    formula: 'Q_kvar = P_kw * (tan(acos(PF_initial)) - tan(acos(PF_target)))',
    variables: [
      { symbol: 'P_kw', description: 'Operating Active Power Demand', unit: 'kW' },
      { symbol: 'PF_initial', description: 'Uncompensated Power Factor', unit: 'ratio' },
      { symbol: 'PF_target', description: 'Target Compensated Power Factor', unit: 'ratio' }
    ],
    outputParameterId: 'ELE-LOAD-002',
    outputUnit: 'kvar',
    applicableProcesses: ['PCC / MCC APFC Panel'],
    assumptions: ['Standard 50Hz fundamental power factor correction'],
    designCriteria: 'Avoid leading power factor (target 0.98 lagging)',
    standardReferences: ['IEEE 141', 'IEC 60831'],
    validationRules: ['Q_kvar >= 0']
  },

  // PHASE 09: SLUDGE & ENVIRONMENTAL FORMULAS
  {
    id: 'FRM-SLD-001',
    name: 'Total Dry Sludge Solids Generation',
    category: 'Sludge & Waste',
    description: 'Calculates total dry solids produced daily from raw water TSS capture and chemical coagulant precipitation.',
    formula: 'M_ds_kgday = Q_m3day * (TSS_captured_mgl + 0.26 * Alum_mgl + 0.66 * Ferric_mgl + 1.0 * Lime_mgl) / 1000',
    variables: [
      { symbol: 'Q_m3day', description: 'Daily Raw Water Flow', unit: 'm³/day' },
      { symbol: 'TSS_captured_mgl', description: 'Captured Raw Suspended Solids', unit: 'mg/L' },
      { symbol: 'Alum_mgl', description: 'Active Alum Dosage', unit: 'mg/L' },
      { symbol: 'Ferric_mgl', description: 'Ferric Chloride Dosage', unit: 'mg/L' },
      { symbol: 'Lime_mgl', description: 'Lime Softening Dosage', unit: 'mg/L' }
    ],
    outputParameterId: 'SLD-GEN-001',
    outputUnit: 'kg/day',
    applicableProcesses: ['Sludge Management', 'Clarifier', 'Filter Waste'],
    assumptions: ['1 mg Alum produces 0.26 mg Al(OH)3 precipitate'],
    designCriteria: 'Determines dry solids load for thickener and dewatering press sizing',
    standardReferences: ['AWWA M51', 'CPHEEO Manual 2021'],
    validationRules: ['M_ds_kgday > 0']
  },
  {
    id: 'FRM-SLD-002',
    name: 'Gravity Sludge Thickener Surface Area',
    category: 'Sludge & Waste',
    description: 'Determines required gravity thickener surface area based on daily solids mass and design solids loading rate.',
    formula: 'A_thk_m2 = M_ds_kgday / SLR_kgm2day',
    variables: [
      { symbol: 'M_ds_kgday', description: 'Total Daily Dry Solids Load', unit: 'kg/day' },
      { symbol: 'SLR_kgm2day', description: 'Design Solids Loading Rate', unit: 'kg/m²·day' }
    ],
    outputParameterId: 'SLD-THK-001',
    outputUnit: 'm²',
    applicableProcesses: ['Sludge Thickening'],
    assumptions: ['Continuous gravity thickening with floor scraper'],
    designCriteria: 'Solids loading rate typically 30-40 kg/m²·day for alum sludge',
    standardReferences: ['WEF Manual of Practice 8'],
    validationRules: ['A_thk_m2 > 0']
  },
  {
    id: 'FRM-SLD-003',
    name: 'Dewatered Cake Wet Volume Production',
    category: 'Sludge & Waste',
    description: 'Calculates daily wet cake volume from dry solids mass, cake solids %, and cake density.',
    formula: 'V_cake_m3day = M_ds_kgday / ((S_cake_percent / 100) * Rho_cake_kgm3)',
    variables: [
      { symbol: 'M_ds_kgday', description: 'Daily Dry Solids Mass', unit: 'kg/day' },
      { symbol: 'S_cake_percent', description: 'Cake Dry Solids Concentration', unit: '%' },
      { symbol: 'Rho_cake_kgm3', description: 'Dewatered Cake Density', unit: 'kg/m³' }
    ],
    outputParameterId: 'SLD-DEW-001',
    outputUnit: 'm³/day',
    applicableProcesses: ['Dewatering', 'Cake Hopper', 'Hauling'],
    assumptions: ['Cake density approx 1100 kg/m³'],
    designCriteria: 'Used to size cake storage silos and determine daily transport truck trips',
    standardReferences: ['WEF MOP 8'],
    validationRules: ['V_cake_m3day > 0']
  }
];

export function getFormulaById(id: string): FormulaDefinition | undefined {
  return MASTER_FORMULA_REGISTRY.find(f => f.id === id);
}

export function getFormulasByCategory(category: string): FormulaDefinition[] {
  return MASTER_FORMULA_REGISTRY.filter(f => f.category === category);
}

