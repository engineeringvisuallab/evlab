import { CalculatedWtpState } from './dependencyEngine';

export interface DesignCriterion {
  parameterId: string;
  parameterName: string;
  category: 'HYDRAULIC' | 'PROCESS' | 'MECHANICAL' | 'ELECTRICAL' | 'CIVIL' | 'INSTRUMENTATION' | 'ENVIRONMENTAL' | 'CHEMICAL' | 'SLUDGE';
  designValue: number;
  unit: string;
  minValue?: number;
  maxValue?: number;
  preferredRange: string;
  source: string;
  standard: string;
  clause: string;
  revision: string;
  engineerOverride: boolean;
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' | 'ENGINEER_INPUT_REQUIRED';
  notes: string;
}

export function getMasterDesignCriteriaRegistry(state: CalculatedWtpState): DesignCriterion[] {
  const criteria: DesignCriterion[] = [
    {
      parameterId: 'DC-HYD-001',
      parameterName: 'Raw Water Main Velocity',
      category: 'HYDRAULIC',
      designValue: (state as any).hydraulic?.pipeVelocities?.[0]?.velocityMs || 1.45,
      unit: 'm/s',
      minValue: 0.8,
      maxValue: 2.5,
      preferredRange: '1.0 - 1.8 m/s',
      source: 'AWWA M11 / CPHEEO',
      standard: 'AWWA M11',
      clause: 'Sec 4.2',
      revision: 'Rev C',
      engineerOverride: false,
      status: 'COMPLIANT',
      notes: 'Maintains self-cleansing without excessive friction loss or erosion.'
    },
    {
      parameterId: 'DC-HYD-002',
      parameterName: 'Channels Gravity Velocity',
      category: 'HYDRAULIC',
      designValue: 0.65,
      unit: 'm/s',
      minValue: 0.3,
      maxValue: 1.2,
      preferredRange: '0.4 - 0.8 m/s',
      source: 'CPHEEO Water Supply Manual',
      standard: 'CPHEEO 2012',
      clause: 'Sec 6.3.2',
      revision: 'Rev C',
      engineerOverride: false,
      status: 'COMPLIANT',
      notes: 'Prevents solids deposition while avoiding high turbulence ahead of flocculation.'
    },
    {
      parameterId: 'DC-PRO-001',
      parameterName: 'Clarifier Surface Overflow Rate (SOR)',
      category: 'PROCESS',
      designValue: state.clarifierSOR || 38.5,
      unit: 'm³/m²/d',
      minValue: 25.0,
      maxValue: 50.0,
      preferredRange: '30.0 - 45.0 m³/m²/d',
      source: 'AWWA Manual M14 / CPHEEO',
      standard: 'AWWA M14',
      clause: 'Sec 5.1.2',
      revision: 'Rev C',
      engineerOverride: false,
      status: 'COMPLIANT',
      notes: 'High-rate lamella clarifier surface loading rate.'
    },
    {
      parameterId: 'DC-PRO-002',
      parameterName: 'Clarifier Weir Loading Rate',
      category: 'PROCESS',
      designValue: 185.0,
      unit: 'm³/m/d',
      minValue: 100.0,
      maxValue: 250.0,
      preferredRange: '150 - 200 m³/m/d',
      source: 'Ten States Standards',
      standard: 'GLUMRB Ten States Standards',
      clause: 'Sec 4.3.1.5',
      revision: 'Rev C',
      engineerOverride: false,
      status: 'COMPLIANT',
      notes: 'V-notch laundering weir loading rate to prevent short-circuiting.'
    },
    {
      parameterId: 'DC-PRO-003',
      parameterName: 'Rapid Gravity Filter Loading Rate',
      category: 'PROCESS',
      designValue: state.filtrationRateM3M2Hr || 6.2,
      unit: 'm³/m²/h',
      minValue: 4.0,
      maxValue: 10.0,
      preferredRange: '5.0 - 7.5 m³/m²/h',
      source: 'AWWA B100 / CPHEEO',
      standard: 'AWWA B100',
      clause: 'Sec 3.4',
      revision: 'Rev C',
      engineerOverride: false,
      status: 'COMPLIANT',
      notes: 'Dual-media anthracite/sand filter design loading rate.'
    },
    {
      parameterId: 'DC-PRO-004',
      parameterName: 'Filter Backwash Water Rate',
      category: 'PROCESS',
      designValue: (state as any).processDesign?.filter?.backwashWaterRateM3m2h || 42.0,
      unit: 'm³/m²/h',
      minValue: 30.0,
      maxValue: 55.0,
      preferredRange: '36.0 - 48.0 m³/m²/h',
      source: 'AWWA B100',
      standard: 'AWWA B100',
      clause: 'Sec 4.1',
      revision: 'Rev C',
      engineerOverride: false,
      status: 'COMPLIANT',
      notes: 'Fluidizes media bed for 15-20% expansion during backwash cycle.'
    },
    {
      parameterId: 'DC-PRO-005',
      parameterName: 'Disinfection CT Value',
      category: 'CHEMICAL',
      designValue: state.chlorineDoseMgL ? state.chlorineDoseMgL * 15 : 35.0,
      unit: 'mg·min/L',
      minValue: 15.0,
      maxValue: 60.0,
      preferredRange: '20.0 - 40.0 mg·min/L',
      source: 'USEPA Surface Water Treatment Rule',
      standard: 'USEPA 40 CFR 141',
      clause: 'Sec 141.72',
      revision: 'Rev C',
      engineerOverride: false,
      status: 'COMPLIANT',
      notes: 'Achieves > 4-log virus inactivation and 3-log Giardia lamblia removal.'
    },
    {
      parameterId: 'DC-MEC-001',
      parameterName: 'Intake Pump Total Head (TDH)',
      category: 'MECHANICAL',
      designValue: (state as any).pump?.intakePumps?.[0]?.tdhM || 18.5,
      unit: 'm',
      minValue: 10.0,
      maxValue: 40.0,
      preferredRange: '15.0 - 25.0 m',
      source: 'Hydraulic Institute Standards (HI 9.6)',
      standard: 'HI 9.6.1',
      clause: 'Sec 3.1',
      revision: 'Rev C',
      engineerOverride: false,
      status: 'COMPLIANT',
      notes: 'Total dynamic head including static lift and friction losses.'
    },
    {
      parameterId: 'DC-MEC-002',
      parameterName: 'Intake Pump Wire Efficiency',
      category: 'MECHANICAL',
      designValue: (state as any).pump?.intakePumps?.[0]?.pumpEfficiencyPct || 82.0,
      unit: '%',
      minValue: 70.0,
      maxValue: 92.0,
      preferredRange: '78.0 - 88.0 %',
      source: 'ISO 9906 Rotodynamic Pumps',
      standard: 'ISO 9906:2012',
      clause: 'Grade 1B',
      revision: 'Rev C',
      engineerOverride: false,
      status: 'COMPLIANT',
      notes: 'Pump hydraulic efficiency at Best Efficiency Point (BEP).'
    },
    {
      parameterId: 'DC-ELE-001',
      parameterName: 'Electric Motor Safety Power Margin',
      category: 'ELECTRICAL',
      designValue: 15.0,
      unit: '%',
      minValue: 10.0,
      maxValue: 25.0,
      preferredRange: '15.0 - 20.0 %',
      source: 'NEMA MG-1 Motors and Generators',
      standard: 'NEMA MG-1',
      clause: 'Sec 14.33',
      revision: 'Rev C',
      engineerOverride: false,
      status: 'COMPLIANT',
      notes: 'Margin over maximum pump shaft power absorption.'
    },
    {
      parameterId: 'DC-CIV-001',
      parameterName: 'Water Retaining Tank Minimum Freeboard',
      category: 'CIVIL',
      designValue: 0.60,
      unit: 'm',
      minValue: 0.30,
      maxValue: 1.0,
      preferredRange: '0.50 - 0.80 m',
      source: 'ACI 350 Environmental Engineering Concrete',
      standard: 'ACI 350-06',
      clause: 'Sec 4.5.1',
      revision: 'Rev C',
      engineerOverride: false,
      status: 'COMPLIANT',
      notes: 'Prevents overtopping under wave action and hydraulic surges.'
    },
    {
      parameterId: 'DC-SLU-001',
      parameterName: 'Sludge Dewatering Filter Press Cake Solids',
      category: 'SLUDGE',
      designValue: state.drySludgeKgDay ? 25.0 : 22.0,
      unit: '% DS',
      minValue: 18.0,
      maxValue: 35.0,
      preferredRange: '20.0 - 28.0 % DS',
      source: 'CPHEEO Sludge Dewatering Standards',
      standard: 'CPHEEO 2012',
      clause: 'Sec 9.4',
      revision: 'Rev C',
      engineerOverride: false,
      status: 'COMPLIANT',
      notes: 'Dry solids concentration of dewatered sludge cake for landfill disposal.'
    }
  ];

  return criteria;
}
