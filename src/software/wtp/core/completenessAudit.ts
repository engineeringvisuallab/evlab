import { CompletenessAuditItem } from '../types/wtp';

export const WTP_COMPLETENESS_AUDIT_LIST: CompletenessAuditItem[] = [
  {
    id: 'AUD-001',
    category: 'Process Engineering',
    item: 'Coagulant Hydrolysis & Alkalinity Depletion Balance',
    importance: 'CRITICAL',
    whyRequired: 'Adding alum [Al2(SO4)3·18H2O] consumes raw water alkalinity. If alkalinity < 30 mg/L as CaCO3, pH drops below 6.0 causing residual aluminum corrosion and soluble Al toxicity.',
    proposedParameter: 'Alkalinity Consumed = Dose_alum * 0.45',
    proposedCalculation: 'Final_Alkalinity = Raw_Alk - (Dose_alum * 0.45). If < 30, triggers mandatory Lime/Soda Ash dosing.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-002',
    category: 'Hydraulics',
    item: 'Pipe Water Hammer & Transient Spike Analysis',
    importance: 'HIGH',
    whyRequired: 'Sudden high-lift pump trip or quick valve closure causes surge pressure wave (Joukowsky pressure rise ΔP = ρ·c·Δv). Can rupture rising mains.',
    proposedParameter: 'Joukowsky Wave Celerity (c) & Peak Surge Head (H_max)',
    proposedCalculation: 'c = sqrt(K / (rho * (1 + (K/E)*(D/e)))); ΔH = (c * Δv) / g.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-003',
    category: 'Filter Design',
    item: 'Filter Bed Underdrain Nozzle Head Loss & Orifice Density',
    importance: 'HIGH',
    whyRequired: 'Non-uniform backwash air/water distribution causes dead zones, mudball formation, and media loss in rapid gravity filters.',
    proposedParameter: 'Orifice Area Ratio & Lateral Head Loss',
    proposedCalculation: 'Orifice Area / Filter Bed Area = 0.0015 to 0.0030.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-004',
    category: 'Structural Safety',
    item: 'Empty Basin Groundwater Uplift / Flotation Check',
    importance: 'CRITICAL',
    whyRequired: 'During maintenance, empty clarifiers or reservoirs can float or crack if ground water level / HFL is above base slab.',
    proposedParameter: 'Factor of Safety against Uplift (FS_flotation)',
    proposedCalculation: 'FS = (Dead Weight of Concrete + Soil Burden) / (Hydrostatic Uplift Force) >= 1.25.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-005',
    category: 'Disinfection & Safety',
    item: 'Trihalomethane (THM) & Haloacetic Acid (HAA5) Disinfection By-Product Potential',
    importance: 'HIGH',
    whyRequired: 'Chlorinating raw water with high TOC/DOC generates carcinogenic DBP compounds exceeding WHO/EPA MCL limits.',
    proposedParameter: 'THM Formation Potential (THMFP ug/L)',
    proposedCalculation: 'THMFP = 12.5 * (TOC)^0.63 * (Cl2_dose)^0.28 * (t_contact)^0.26.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-006',
    category: 'Sludge Dewatering',
    item: 'Polymer Dosing & Dewatering Filter Press Cake Moisture',
    importance: 'MEDIUM',
    whyRequired: 'Raw sludge volume at 0.5-1% dry solids requires massive lagoon area unless thickened and filter pressed to 25-35% cake solids.',
    proposedParameter: 'Polymer Dose (kg active/ton DS) & Cake Volume (m3/day)',
    proposedCalculation: 'Cake_Volume = Dry_Solids_kg / (Cake_Density * %Solids_Cake).',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-007',
    category: 'Electrical & Power',
    item: 'Motor Starting Inrush & Voltage Drop Calculation',
    importance: 'HIGH',
    whyRequired: 'Direct-on-line (DOL) starting of 200kW high lift pump causes 6x current spike, dropping MCC voltage below 85% causing relay trips.',
    proposedParameter: 'Soft Starter / VFD Inrush Reduction Factor',
    proposedCalculation: 'Inrush_Current = 2.0 * I_nominal with Soft Starter vs 6.5 * I_nominal with DOL.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-008',
    category: 'SCADA & Control',
    item: 'Flow-Paced Chemical Dosing Control Loop Response Time',
    importance: 'CRITICAL',
    whyRequired: 'Inlet flow surges without automatic flow-paced chemical dosing cause under-dosing, turbidity spikes, and filter breakthrough.',
    proposedParameter: 'Dosing Pump Stroke Modulation = (Current_Flow / Design_Flow) * Set_Dose',
    proposedCalculation: 'Pump_Flow_Lph = (Q_m3hr * Target_Dose_mgL) / (10 * Chemical_Concentration_%).',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-009',
    category: 'Mechanical Engineering',
    item: 'Single Equipment Failure N-1 Redundancy & Deficit Simulation Engine',
    importance: 'CRITICAL',
    whyRequired: 'Equipment failure without adequate standby capacity drops plant production capacity below design demands.',
    proposedParameter: 'Remaining Capacity Ratio R_N1 = ((N - 1) * Unit_Cap) / Required_Cap',
    proposedCalculation: 'R_N1 >= 100% required. Triggers critical alert if R_N1 < 100%.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-010',
    category: 'Electrical & Motors',
    item: 'IEC Motor Sizing & Service Factor Thermal Margin Engine',
    importance: 'HIGH',
    whyRequired: 'Undersized motors without service factor (SF 1.15) trip on thermal overload when operating at end-of-curve peak flow.',
    proposedParameter: 'P_motor_kw = ((P_hyd / pump_eff) * SF_motor) / motor_eff',
    proposedCalculation: 'Auto-selects next standard IEC kW rating (15, 22, 37, 55, 75, 110, 160, 250, 315 kW).',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-011',
    category: 'Electrical & Power',
    item: 'Substation Transformer Sizing & Dual Redundancy (N+1)',
    importance: 'CRITICAL',
    whyRequired: 'Single transformer failure will cut all power to raw water pumping and treatment units, stopping plant operation.',
    proposedParameter: 'S_trf_kva = (P_demand_kw / PF) * (1 + Margin_spare)',
    proposedCalculation: 'Select standard kVA rating with dual 100% (N+1) transformer arrangement.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-012',
    category: 'Electrical & Backup',
    item: 'Emergency Diesel Generator Starting kVA & Autonomy',
    importance: 'CRITICAL',
    whyRequired: 'Grid power outage requires emergency generator with sufficient motor starting kVA to start largest high-lift pump without voltage collapse.',
    proposedParameter: 'S_gen = S_essential_running + 0.25 * S_largest_motor_starting',
    proposedCalculation: 'Calculate generator kVA, fuel consumption rate (L/hr), and bulk diesel tank volume for 24h autonomy.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-013',
    category: 'Control & Automation',
    item: 'PLC I/O Architecture & Reserved Spare Channel Capacity',
    importance: 'HIGH',
    whyRequired: 'Inadequate I/O channels or lack of 20% reserved spares prevents future instrument additions or interlock additions.',
    proposedParameter: 'Total I/O = (DI + DO + AI + AO) * (1 + Spare_Margin)',
    proposedCalculation: 'Automatically size 32-ch DI, 16-ch DO, and 8-ch AI/AO modules with minimum 20% wired spares.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-014',
    category: 'SCADA & Control',
    item: 'Filter Backwash Automated State Machine Sequence',
    importance: 'CRITICAL',
    whyRequired: 'Manual filter backwashing leads to human error, improper air scour timing, sand bed fluidization failure, or media loss.',
    proposedParameter: 'Sequenced steps: Isolation -> Air Scour -> Air+Water -> Water Wash -> Rinse -> Online',
    proposedCalculation: 'Automated state machine controlling pneumatic valves, air blowers, and backwash pumps with timer limits.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-015',
    category: 'Sludge & Environmental',
    item: 'Comprehensive Coagulant & TSS Solids Balance',
    importance: 'CRITICAL',
    whyRequired: 'Inaccurate sludge solids mass balance causes severe under-sizing of sludge thickeners and dewatering filter presses.',
    proposedParameter: 'Dry Solids kg/day = Q * (TSS_captured + 0.26*Alum + 0.66*Ferric + 1.0*Lime)',
    proposedCalculation: 'Tracks raw water TSS, metal hydroxide precipitates, and polymer additions across all streams.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-016',
    category: 'Water Recovery & Waste',
    item: 'Filter Backwash Recycling & Effluent Impact Balance',
    importance: 'HIGH',
    whyRequired: 'Discharging filter backwash waste wastes 3-5% of plant water production. Uncontrolled recycling builds up fine colloidal particles.',
    proposedParameter: 'Recycle Rate = 95%, Net Plant Water Recovery % = (Product Water / Raw Water) * 100',
    proposedCalculation: 'Equalizes and settles backwash waste before recycling to headworks, avoiding solids shock load.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-017',
    category: 'Environmental & Safety',
    item: 'Environmental Risk Register & Off-Gas Control',
    importance: 'CRITICAL',
    whyRequired: 'Uncontrolled chlorine gas, chemical spills, or sludge odor emissions cause hazardous environmental and community safety violations.',
    proposedParameter: 'Risk Matrix (Probability x Severity) with Cause-Consequence-Control Mapping',
    proposedCalculation: 'Maintains risk matrix for chemical, air, noise, and sludge hazards with active mitigation monitoring.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-018',
    category: 'BOQ & Takeoff',
    item: 'Direct Engineering Source-to-BOQ Quantity Traceability',
    importance: 'CRITICAL',
    whyRequired: 'Disconnected BOQ spreadsheets lead to discrepancies between hydraulic/structural design and procurement quantities.',
    proposedParameter: 'Source Module & Design Parameter link for 100% of Quantity Items',
    proposedCalculation: 'Auto-extracts quantities directly from concrete, pipe, valve, pump, motor, and cable design calculations.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-019',
    category: 'Cost & LCC',
    item: '25-Year Life-Cycle Cost (LCC) & Net Present Value Engine',
    importance: 'HIGH',
    whyRequired: 'Evaluating WTP options solely on initial CAPEX ignores heavy energy, chemical, and replacement OPEX over plant lifetime.',
    proposedParameter: 'NPV LCC = CAPEX + PV(OPEX) + PV(Replacements) at 6% Discount & 2.5% Inflation',
    proposedCalculation: 'Models energy, chemical, maintenance, labour, and sludge OPEX over 25 years with discount formulation.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-020',
    category: 'Procurement & Schedule',
    item: 'Long-Lead Procurement & Critical Path Schedule Interlock',
    importance: 'CRITICAL',
    whyRequired: 'Delays in ordering high-lift pumps (20-week lead) or transformers (22-week lead) stall site testing and cause project liquidated damages.',
    proposedParameter: 'Long-Lead Flag (>= 16 weeks) auto-linked to CPM Activity Predecessors',
    proposedCalculation: 'Triggers early RFQ generation and tracks technical/commercial bid evaluations and shop drawing submittals.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-021',
    category: 'Drawings & CAD',
    item: '2D Multi-Discipline CAD Drawing Generation & Layer Control',
    importance: 'CRITICAL',
    whyRequired: 'Manual drawing creation leads to drafting errors, mismatched levels, and discrepancies between PFD, P&ID, and GA drawings.',
    proposedParameter: '12 Discipline Drawings, 19 Standard CAD Layers, Full Title Block Metadata',
    proposedCalculation: 'Auto-generates CAD primitives directly from unified engineering object registry coordinates and dimensions.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-022',
    category: '3D & Digital Twin',
    item: 'Parametric 3D Plant Model & Multi-Property Visualization Modes',
    importance: 'CRITICAL',
    whyRequired: '2D drawings alone fail to identify 3D spatial clashes, equipment maintenance access constraints, or pipe routing conflicts.',
    proposedParameter: 'Parametric 3D Meshes, 8 Color Visualization Modes, 3D Distance/Area/Volume Measurements',
    proposedCalculation: 'Renders 3D Digital Twin with real-time switching between Engineering, Hydraulic, Construction, and QA/QC status modes.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-023',
    category: 'GIS & Terrain',
    item: 'GIS Coordinate Transformation & Earthwork Cut/Fill Grading Engine',
    importance: 'HIGH',
    whyRequired: 'Ignoring geographic coordinates and site topography causes boundary encroachments and incorrect earthwork excavation cost estimates.',
    proposedParameter: 'EPSG:32645 UTM Zone 45N / WGS84, 0.5m Contour Interval, Earthwork Cut/Fill Balance',
    proposedCalculation: 'Transforms plant coordinates to real-world GIS coordinates and calculates site grading earthwork volumes.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-024',
    category: 'BIM & Data Integrity',
    item: 'Single Source of Truth Engineering Model & 14-Point Automated Audit',
    importance: 'CRITICAL',
    whyRequired: 'Fragmented data causes object duplication, untracked design changes, missing BOQ items, and disconnected vendor specifications.',
    proposedParameter: 'EngineeringModelRegistry, IFC GUID Mapping, Automated BIM Integrity Audit',
    proposedCalculation: 'Enforces end-to-end traceability from design parameters to 2D CAD, 3D BIM, GIS, BOQ, Procurement, Construction, and As-Built data.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-025',
    category: 'QA/QC & Standards',
    item: 'Inspection Test Plan (ITP) & Multi-Standard Compliance Matrix',
    importance: 'CRITICAL',
    whyRequired: 'Lack of systematic quality control and standards auditing leads to non-compliant equipment, material failures, and regulatory rejection.',
    proposedParameter: 'ITP Hold Points, Clause-by-Clause Standards Comparison, QA/QC Workflows',
    proposedCalculation: 'Evaluates design values against WHO, AWWA, ACI, IEEE, and BD ECR 2023 standards and generates project ITP.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-026',
    category: 'Commissioning & Handover',
    item: 'Multi-Phase Commissioning Plan & 72-Hour Reliability Run',
    importance: 'CRITICAL',
    whyRequired: 'Incomplete commissioning leads to premature component failure, process instability, and operational safety hazards upon handover.',
    proposedParameter: 'Pre-Commissioning Checklists, Dry/Wet Testing, 72h Performance Run, Handover Package',
    proposedCalculation: 'Tracks pre-commissioning readiness, dry bump tests, wet chemical/water balance, and reliability run metrics.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-027',
    category: 'Operation & Maintenance',
    item: 'Master Asset Register, PM Schedules & Operating Dashboard',
    importance: 'HIGH',
    whyRequired: 'Inadequate O&M documentation leads to unmaintained assets, uncalibrated instruments, and excessive plant downtime.',
    proposedParameter: 'Asset Register, PM Frequency Rules, Spare Inventory, Calibration Logs, SOP Framework',
    proposedCalculation: 'Generates master asset register, preventive maintenance schedules, spare parts reorder thresholds, and SOP manuals.',
    status: 'COMPLETE'
  },
  {
    id: 'AUD-028',
    category: 'Master Reporting',
    item: '36-Section Master Report Engine & 19-Folder Engineering Package',
    importance: 'CRITICAL',
    whyRequired: 'Fragmented reports delay client approval, tender issuance, financing clearance, and statutory authority permits.',
    proposedParameter: '36-Section Comprehensive Report, 19 Folder Engineering Package Structure, Issues Register',
    proposedCalculation: 'Aggregates all 27+ engineering subsystems into a single comprehensive master engineering package.',
    status: 'COMPLETE'
  }
];
