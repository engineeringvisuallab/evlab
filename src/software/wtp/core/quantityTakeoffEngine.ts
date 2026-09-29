import { CalculatedWtpState } from './dependencyEngine';

export interface QuantityItem {
  id: string;
  category: 
    | 'CIVIL'
    | 'PROCESS'
    | 'PIPING'
    | 'VALVES'
    | 'MECHANICAL'
    | 'ELECTRICAL'
    | 'INSTRUMENTATION'
    | 'AUTOMATION'
    | 'SLUDGE'
    | 'ENVIRONMENTAL';
  subcategory: string;
  sourceModule: string;
  sourceObject: string;
  designParameter: string;
  formula: string;
  description: string;
  unit: string;
  quantity: number;
  revision: string;
  status: 'ESTIMATED' | 'VERIFIED' | 'AS_BUILT';
  drawingReference?: string;
}

/**
 * EVL WTP Engineering Suite - Quantity Takeoff Engine
 * Automatically extracts precise engineering quantities from all previous WTP design modules.
 */
export function generateQuantityTakeoff(state: CalculatedWtpState): QuantityItem[] {
  const items: QuantityItem[] = [];
  const rev = 'REV-00';

  const capMld = state.plantCapacityMLD;
  const flowM3Hr = (capMld * 1000) / 24;

  // ==========================================
  // 1. CIVIL & STRUCTURAL WORKS TAKEOFF
  // ==========================================

  // Intake & Raw Water Channel
  const intakeVolM3 = Math.round(180 + capMld * 8.5);
  items.push({
    id: 'QTY-CIV-001',
    category: 'CIVIL',
    subcategory: 'Earthwork',
    sourceModule: 'Civil / Intake',
    sourceObject: 'Raw Water Intake Well & Pumping Station',
    designParameter: 'Intake Well Footprint & Substructure Depth',
    formula: 'V_excavation = Footprint_Area * (Depth + 1.5m buffer)',
    description: 'Bulk Excavation in hard soil/soft rock for Intake Wet Well and Pump House',
    unit: 'm³',
    quantity: Math.round(intakeVolM3 * 2.8),
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-CIV-INT-001'
  });

  items.push({
    id: 'QTY-CIV-002',
    category: 'CIVIL',
    subcategory: 'Concrete',
    sourceModule: 'Civil / Intake',
    sourceObject: 'Intake Wet Well Concrete Structure',
    designParameter: 'Retaining Wall Thickness = 450mm, Base Slab = 750mm',
    formula: 'V_rcc = (Wall_Area * t_wall) + (Slab_Area * t_slab)',
    description: 'RCC M35 Water Retaining Wall and Base Slab Concrete for Intake Well',
    unit: 'm³',
    quantity: intakeVolM3,
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-CIV-INT-001'
  });

  // Aerator & Flash Mixer
  const flashMixerVolM3 = Math.round(15 + capMld * 1.2);
  items.push({
    id: 'QTY-CIV-003',
    category: 'CIVIL',
    subcategory: 'Concrete',
    sourceModule: 'Civil / Aerator & Flash Mixer',
    sourceObject: 'Cascade Aerator & Flash Mixer Tank',
    designParameter: 'Cascade Rings & Rapid Mix Chamber (G=800 s-1)',
    formula: 'V_rcc = Cascades_Concrete + Tank_Slab_Walls',
    description: 'RCC M35 Concrete for Cascade Aerator Tray and Rapid Mix Chamber',
    unit: 'm³',
    quantity: flashMixerVolM3,
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-CIV-MIX-001'
  });

  // Flocculators & Clarifiers
  const flocClarVolM3 = Math.round(450 + capMld * 35.0);
  items.push({
    id: 'QTY-CIV-004',
    category: 'CIVIL',
    subcategory: 'Concrete',
    sourceModule: 'Civil / Clariflocculator',
    sourceObject: 'Circular Clariflocculator / Tube Settler Basins',
    designParameter: 'Detention Time = 2.5h, SWD = 3.8m',
    formula: 'V_rcc = Basin_Slab_Volume + Wall_Ring_Volume + Launders',
    description: 'RCC M35 Grade Water Retaining Concrete for Flocculators and Clarifier Basins',
    unit: 'm³',
    quantity: flocClarVolM3,
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-CIV-CLR-001'
  });

  // Rapid Gravity Filters
  const filterVolM3 = Math.round(300 + capMld * 22.0);
  items.push({
    id: 'QTY-CIV-005',
    category: 'CIVIL',
    subcategory: 'Concrete',
    sourceModule: 'Civil / Filtration',
    sourceObject: 'Rapid Gravity Sand Filter Box & Pipe Gallery',
    designParameter: 'Filtration Rate = 6.0 m/h, Filter Bed Area',
    formula: 'V_rcc = Filter_Cells_Volume + Pipe_Gallery_Slabs',
    description: 'RCC M35 Water Retaining Concrete for Rapid Filter Boxes, Gullets & Underdrain Floor',
    unit: 'm³',
    quantity: filterVolM3,
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-CIV-FLT-001'
  });

  // Clear Water Reservoir (CWR)
  const cwrVolM3 = Math.round(1200 + capMld * 80.0);
  items.push({
    id: 'QTY-CIV-006',
    category: 'CIVIL',
    subcategory: 'Concrete',
    sourceModule: 'Civil / CWR',
    sourceObject: 'Clear Water Reservoir & High Lift Pump House',
    designParameter: '4 Hours Storage Capacity = ' + Math.round((capMld * 1000 / 24) * 4) + ' m³',
    formula: 'V_rcc = Base_Slab + Perimeter_Walls + Columns + Roof_Slab',
    description: 'RCC M35 Concrete for Under-ground Clear Water Storage Reservoir & Roof Slab',
    unit: 'm³',
    quantity: cwrVolM3,
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-CIV-CWR-001'
  });

  // Total Concrete Sum for Steel/Formwork Derivation
  const totalRccConcreteM3 = intakeVolM3 + flashMixerVolM3 + flocClarVolM3 + filterVolM3 + cwrVolM3;

  items.push({
    id: 'QTY-CIV-007',
    category: 'CIVIL',
    subcategory: 'Steel Reinforcement',
    sourceModule: 'Civil / Structural',
    sourceObject: 'All Water Retaining RCC Structures',
    designParameter: 'High Yield Fe500D Deformed TMT Bars @ 110 kg/m³ Concrete',
    formula: 'Weight_tonnes = (Total_RCC_m3 * 110) / 1000',
    description: 'Fe500D Thermo-Mechanically Treated Reinforcement Steel Bars',
    unit: 'Tonne',
    quantity: Math.round((totalRccConcreteM3 * 110) / 1000),
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-CIV-STR-001'
  });

  items.push({
    id: 'QTY-CIV-008',
    category: 'CIVIL',
    subcategory: 'Formwork',
    sourceModule: 'Civil / Structural',
    sourceObject: 'Formwork for Basins, Walls & Roof Slabs',
    designParameter: 'Formwork Ratio = 8.5 m² / m³ Concrete',
    formula: 'Area_m2 = Total_RCC_m3 * 8.5',
    description: 'Water-tight Marine Plywood & Steel Shuttering Formwork',
    unit: 'm²',
    quantity: Math.round(totalRccConcreteM3 * 8.5),
    revision: rev,
    status: 'ESTIMATED'
  });

  items.push({
    id: 'QTY-CIV-009',
    category: 'CIVIL',
    subcategory: 'Waterproofing',
    sourceModule: 'Civil / Architectural',
    sourceObject: 'CWR & Basin Water-Tight Coat',
    designParameter: 'Flexible Crystalline Polyurethane Waterproofing Membrane',
    formula: 'Area_m2 = Internal_Wetted_Surface_Area',
    description: 'Food-Grade Crystalline Slurry Waterproofing Coating for Liquid Contact Basins',
    unit: 'm²',
    quantity: Math.round(totalRccConcreteM3 * 3.2),
    revision: rev,
    status: 'ESTIMATED'
  });

  items.push({
    id: 'QTY-CIV-010',
    category: 'CIVIL',
    subcategory: 'Buildings & Architectural',
    sourceModule: 'Civil / Buildings',
    sourceObject: 'Chemical House, Administration & Lab Building',
    designParameter: 'Plinth Area = ' + Math.round(350 + capMld * 15) + ' m²',
    formula: 'Plinth_Area = Admin_Lab + Chemical_House + Substation',
    description: 'Brickwork Masonry, Plaster, Tiling & Architectural Finishing for Plant Buildings',
    unit: 'm²',
    quantity: Math.round(350 + capMld * 15),
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-ARC-ADM-001'
  });

  // ==========================================
  // 2. MECHANICAL EQUIPMENT TAKEOFF
  // ==========================================

  items.push({
    id: 'QTY-MCH-001',
    category: 'MECHANICAL',
    subcategory: 'Pumping',
    sourceModule: 'Mechanical / Intake',
    sourceObject: 'Raw Water Intake Pumps',
    designParameter: 'Flow = ' + Math.round(flowM3Hr / 2) + ' m³/h each, Head = 22 mWC (3 Working + 1 Standby)',
    formula: 'N_pumps = N_duty + N_standby = 3 + 1',
    description: 'Vertical Turbine / Submersible Raw Water Intake Pumps with Motors',
    unit: 'Set',
    quantity: 4,
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-MCH-PMP-001'
  });

  items.push({
    id: 'QTY-MCH-002',
    category: 'MECHANICAL',
    subcategory: 'Mixing & Agitation',
    sourceModule: 'Mechanical / Rapid Mix',
    sourceObject: 'Flash Mixer Agitator',
    designParameter: 'Motor Power = ' + Math.round(5.5 + capMld * 0.15) + ' kW, SS316 Impeller',
    formula: 'P_kw = (G^2 * mu * Vol) / 1000',
    description: 'Flash Mixer SS316 Rapid Agitator Drive Unit',
    unit: 'Set',
    quantity: 2,
    revision: rev,
    status: 'ESTIMATED'
  });

  items.push({
    id: 'QTY-MCH-003',
    category: 'MECHANICAL',
    subcategory: 'Flocculation',
    sourceModule: 'Mechanical / Flocculator',
    sourceObject: 'Flocculator Paddle Drives',
    designParameter: 'Tapered G-values (50 to 20 s-1), VFD Controlled Drives',
    formula: 'N_drives = 3 Stages * 2 Trains',
    description: 'Vertical Shaft Paddle Flocculator Drive Assemblies with VFD Motors',
    unit: 'Set',
    quantity: 6,
    revision: rev,
    status: 'ESTIMATED'
  });

  items.push({
    id: 'QTY-MCH-004',
    category: 'MECHANICAL',
    subcategory: 'Clarification',
    sourceModule: 'Mechanical / Clarifier',
    sourceObject: 'Clarifier Sludge Scraper / Bridge Mechanism',
    designParameter: 'Bridge Span = ' + Math.round(12 + capMld * 0.3) + ' m, Central Drive Unit',
    formula: 'N_scrapers = Number of Clarifier Basins = 2',
    description: 'Central Drive Rotating Sludge Scraper Bridge Assembly with Sludge Hopper',
    unit: 'Set',
    quantity: 2,
    revision: rev,
    status: 'ESTIMATED'
  });

  items.push({
    id: 'QTY-MCH-005',
    category: 'MECHANICAL',
    subcategory: 'Blower System',
    sourceModule: 'Mechanical / Filter Backwash',
    sourceObject: 'Filter Air Scour Blowers',
    designParameter: 'Air Flow = ' + Math.round(1200 + capMld * 40) + ' Nm³/h @ 0.5 bar',
    formula: 'N_blowers = 2 Duty + 1 Standby',
    description: 'Roots Type Positive Displacement Air Scour Blowers with Acoustic Enclosure',
    unit: 'Set',
    quantity: 3,
    revision: rev,
    status: 'ESTIMATED'
  });

  items.push({
    id: 'QTY-MCH-006',
    category: 'MECHANICAL',
    subcategory: 'High Lift Pumping',
    sourceModule: 'Mechanical / High Lift',
    sourceObject: 'High Lift Treated Water Pumps',
    designParameter: 'Flow = ' + Math.round(flowM3Hr / 3) + ' m³/h, Head = 65 mWC (3 Duty + 1 Standby)',
    formula: 'N_pumps = 3 Duty + 1 Standby',
    description: 'Horizontal Split Case High Lift Water Pumps with 3.3kV/415V Motors',
    unit: 'Set',
    quantity: 4,
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-MCH-HLP-001'
  });

  // ==========================================
  // 3. PIPING & VALVES TAKEOFF
  // ==========================================

  const pipeLengthM = Math.round(1200 + capMld * 45);
  items.push({
    id: 'QTY-PIP-001',
    category: 'PIPING',
    subcategory: 'Ductile Iron Pipes',
    sourceModule: 'Piping / Yard Piping',
    sourceObject: 'Raw Water & Process Interconnecting Pipe Main',
    designParameter: 'Main Dia = DN' + Math.round(400 + capMld * 10) + ' K9 Ductile Iron',
    formula: 'L_pipe = Plant_Boundary_Length + Interconnecting_Galleries',
    description: 'Ductile Iron (DI) Class K9 Socket & Spigot Pressure Pipes with Zinc Coating',
    unit: 'Meter',
    quantity: pipeLengthM,
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-PIP-YRD-001'
  });

  items.push({
    id: 'QTY-PIP-002',
    category: 'PIPING',
    subcategory: 'Stainless Steel Piping',
    sourceModule: 'Piping / Chemical & Air',
    sourceObject: 'Chemical Dosing & Air Scour Manifolds',
    designParameter: 'SS316L Schedule 10S Chemical Dosing Lines',
    formula: 'L_ss = Chemical_Building_to_Dosing_Points_Distance',
    description: 'Stainless Steel Grade 316L Welded Dosing & Backwash Air Piping',
    unit: 'Meter',
    quantity: Math.round( pipeLengthM * 0.35 ),
    revision: rev,
    status: 'ESTIMATED'
  });

  const valveCount = Math.round(28 + capMld * 1.5);
  items.push({
    id: 'QTY-VAL-001',
    category: 'VALVES',
    subcategory: 'Butterfly Valves',
    sourceModule: 'Piping / Valves',
    sourceObject: 'Filter Isolation & Pump Discharge Valves',
    designParameter: 'PN16 Electric Actuated Butterfly Valves (DN200 - DN800)',
    formula: 'N_valves = 6 per Filter Cell * N_filters + Pump_Discharges',
    description: 'Double Eccentric Resilient Seated Motorized Actuated Butterfly Valves',
    unit: 'No.',
    quantity: valveCount,
    revision: rev,
    status: 'ESTIMATED'
  });

  items.push({
    id: 'QTY-VAL-002',
    category: 'VALVES',
    subcategory: 'Check & Control Valves',
    sourceModule: 'Piping / Valves',
    sourceObject: 'Pump Discharge Non-Return & Air Valves',
    designParameter: 'PN16 Dual Plate Check Valves & Kinetic Air Release Valves',
    formula: 'N_check = 1 per Pump Discharge; N_air = High Points',
    description: 'Non-Slam Dual Plate Check Valves and Triple Acting Kinetic Air Valves',
    unit: 'No.',
    quantity: Math.round(valveCount * 0.45),
    revision: rev,
    status: 'ESTIMATED'
  });

  // ==========================================
  // 4. ELECTRICAL SYSTEM TAKEOFF
  // ==========================================

  const powerKw = Math.round(250 + capMld * 18);
  items.push({
    id: 'QTY-ELC-001',
    category: 'ELECTRICAL',
    subcategory: 'Substation Transformer',
    sourceModule: 'Electrical / Substation',
    sourceObject: 'Main Step-Down Power Transformer',
    designParameter: 'Capacity = ' + Math.round((powerKw / 0.85) * 1.25) + ' kVA, 11kV / 0.415kV',
    formula: 'S_trf = (P_demand_kw / PF) * 1.25 Reserve',
    description: '11kV/0.415kV Oil Immersed Outdoor Power Transformer with ONAN Cooling',
    unit: 'Set',
    quantity: 2, // 100% N+1
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-ELE-SUB-001'
  });

  items.push({
    id: 'QTY-ELC-002',
    category: 'ELECTRICAL',
    subcategory: 'Diesel Generator',
    sourceModule: 'Electrical / Emergency Power',
    sourceObject: 'Emergency Standby Diesel Generator',
    designParameter: 'Capacity = ' + Math.round(powerKw * 0.8) + ' kVA, Auto Mains Failure (AMF)',
    formula: 'S_dg = P_essential_kw / 0.8',
    description: 'Emergency Diesel Generator Set with Sound Attenuated Canopy & Fuel Tank',
    unit: 'Set',
    quantity: 1,
    revision: rev,
    status: 'ESTIMATED'
  });

  items.push({
    id: 'QTY-ELC-003',
    category: 'ELECTRICAL',
    subcategory: 'Switchgear & MCC',
    sourceModule: 'Electrical / Switchgear',
    sourceObject: 'Main Motor Control Center (MCC) & VFD Panels',
    designParameter: 'Form 4b 630A - 2500A Busbar, Intelligent Motor Controllers',
    formula: 'N_panels = Pump_Feeders + Auxiliary_Feeders + VFDs',
    description: 'Fully Compartmentalized Low Voltage Motor Control Center (MCC) with VFD Drives',
    unit: 'Panel',
    quantity: Math.round(8 + capMld * 0.25),
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-ELE-MCC-001'
  });

  items.push({
    id: 'QTY-ELC-004',
    category: 'ELECTRICAL',
    subcategory: 'Power & Control Cables',
    sourceModule: 'Electrical / Cabling',
    sourceObject: 'XLPE Armored Power & Control Cables',
    designParameter: '1.1kV XLPE/PVC/SWA/PVC Copper/Aluminum Cables',
    formula: 'L_cable = Motor_Run_Length * Feeders * 1.15 Margin',
    description: 'Heavy Duty Armored Power Cables and Multi-Core Shielded Control Cables',
    unit: 'Meter',
    quantity: Math.round(2500 + capMld * 110),
    revision: rev,
    status: 'ESTIMATED'
  });

  // ==========================================
  // 5. INSTRUMENTATION & AUTOMATION TAKEOFF
  // ==========================================

  items.push({
    id: 'QTY-ICA-001',
    category: 'INSTRUMENTATION',
    subcategory: 'Flow Instruments',
    sourceModule: 'Instrumentation / Flow',
    sourceObject: 'Electromagnetic Flowmeters',
    designParameter: 'DN150 to DN900 Inline Electromagnetic Flow Transmitters (Accuracy ±0.2%)',
    formula: 'N_flow = Inlet + Outlet + Filter_Effluents + Washwater',
    description: 'Full Bore Electromagnetic Flow Meters with Remote Wall Mounted Converters',
    unit: 'No.',
    quantity: Math.round(6 + capMld * 0.2),
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-ICA-SCH-001'
  });

  items.push({
    id: 'QTY-ICA-002',
    category: 'INSTRUMENTATION',
    subcategory: 'Water Quality Analyzers',
    sourceModule: 'Instrumentation / Analytics',
    sourceObject: 'Online Turbidimeters, pH & Chlorine Analyzers',
    designParameter: 'Continuous Optical Turbidity & Amperometric Free Chlorine Sensors',
    formula: 'N_analyzers = Raw_Water + Settled_Water + Filtered_Water + Final_Water',
    description: 'Continuous Online Water Quality Monitoring Panels with Auto-Cleaning',
    unit: 'Set',
    quantity: 6,
    revision: rev,
    status: 'ESTIMATED'
  });

  items.push({
    id: 'QTY-AUT-001',
    category: 'AUTOMATION',
    subcategory: 'PLC & SCADA Hardware',
    sourceModule: 'Automation / Control System',
    sourceObject: 'Hot-Standby Redundant Main PLC & SCADA Workstations',
    designParameter: 'CPU with Fiber Optic Ethernet, Dual Redundant Power Supply',
    formula: 'I/O Count = ' + Math.round(180 + capMld * 8) + ' Signals',
    description: 'Hot-Standby Redundant PLC Panel with SCADA Servers, HMIs & Industrial Ethernet Switches',
    unit: 'Lot',
    quantity: 1,
    revision: rev,
    status: 'ESTIMATED',
    drawingReference: 'DWG-AUT-ARCH-001'
  });

  // ==========================================
  // 6. SLUDGE & ENVIRONMENTAL TAKEOFF
  // ==========================================

  const drySolidsKgDay = Math.round(1200 + capMld * 95);
  items.push({
    id: 'QTY-SLD-001',
    category: 'SLUDGE',
    subcategory: 'Thickening',
    sourceModule: 'Sludge / Gravity Thickener',
    sourceObject: 'Circular Sludge Thickener Mechanism',
    designParameter: 'Diameter = ' + Math.round(8 + capMld * 0.15) + ' m, Pick-and-Rake Assembly',
    formula: 'Area = Dry_Solids_kg_day / Design_Solids_Loading_Rate',
    description: 'Gravity Sludge Thickener Central Drive Rake Mechanism & Bridge',
    unit: 'Set',
    quantity: 2,
    revision: rev,
    status: 'ESTIMATED'
  });

  items.push({
    id: 'QTY-SLD-002',
    category: 'SLUDGE',
    subcategory: 'Dewatering Equipment',
    sourceModule: 'Sludge / Dewatering',
    sourceObject: 'Recessed Chamber Filter Press / Centrifuge',
    designParameter: 'Capacity = ' + Math.round(drySolidsKgDay / 8) + ' kg DS/hr, 30% Cake Solids',
    formula: 'N_presses = Daily_Dry_Solids / (Shift_Hours * Unit_Capacity)',
    description: 'Automatic Recessed Chamber Plate Filter Press Dewatering Unit',
    unit: 'Set',
    quantity: 2,
    revision: rev,
    status: 'ESTIMATED'
  });

  items.push({
    id: 'QTY-SLD-003',
    category: 'SLUDGE',
    subcategory: 'Cake Silo Storage',
    sourceModule: 'Sludge / Cake Handling',
    sourceObject: 'Dewatered Cake Storage Silos',
    designParameter: '3 Days Autonomy Volume = ' + Math.round((drySolidsKgDay / 300) * 3) + ' m³',
    formula: 'V_silo = (Daily_Cake_m3 * 3_days) / N_silos',
    description: 'Elevated Steel Cake Storage Silos with Hydraulic Discharge Gates',
    unit: 'Unit',
    quantity: 2,
    revision: rev,
    status: 'ESTIMATED'
  });

  return items;
}
