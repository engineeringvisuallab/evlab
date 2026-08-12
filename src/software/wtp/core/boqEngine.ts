import { CalculatedWtpState } from './dependencyEngine';
import { generateQuantityTakeoff, QuantityItem } from './quantityTakeoffEngine';
import { MASTER_SPECIFICATION_REGISTRY } from './specificationRegistry';

export interface BoqLineItem {
  id: string;
  boqCode: string;
  wbsCode: string;
  wbsDescription: string;
  category: 
    | 'Civil'
    | 'Structural'
    | 'Architectural'
    | 'Process'
    | 'Mechanical'
    | 'Piping'
    | 'Electrical'
    | 'Instrumentation'
    | 'Automation'
    | 'Sludge'
    | 'Environmental'
    | 'Landscaping'
    | 'Roads'
    | 'Drainage'
    | 'Utility'
    | 'Temporary works';
  subcategory: string;
  description: string;
  specificationRef: string;
  unit: string;
  quantity: number;
  unitRateUSD: number;
  totalPriceUSD: number;
  sourceModule: string;
  drawingRef: string;
  remarks: string;
}

export interface WbsNode {
  wbsCode: string;
  name: string;
  subNodes?: WbsNode[];
}

export const STANDARD_WBS: WbsNode[] = [
  { wbsCode: '01', name: 'General & Preliminaries' },
  { wbsCode: '02', name: 'Site Development & Earthworks' },
  { wbsCode: '03', name: 'Intake Structure & Wet Well' },
  { wbsCode: '04', name: 'Raw Water Pumping Station' },
  { wbsCode: '05', name: 'Aerator & Flash Mixer' },
  { wbsCode: '06', name: 'Flocculation & Clarification' },
  { wbsCode: '07', name: 'Rapid Gravity Filtration' },
  { wbsCode: '08', name: 'Disinfection & Chemical Dosing' },
  { wbsCode: '09', name: 'Clear Water Reservoir (CWR)' },
  { wbsCode: '10', name: 'High Lift Pumping Station' },
  { wbsCode: '11', name: 'Transmission Pipeline' },
  { wbsCode: '12', name: 'Distribution Mains' },
  { wbsCode: '13', name: 'Sludge Thickening & Dewatering' },
  { wbsCode: '14', name: 'Electrical Substation & Power' },
  { wbsCode: '15', name: 'Instrumentation & Analytics' },
  { wbsCode: '16', name: 'Automation, PLC & SCADA' },
  { wbsCode: '17', name: 'Buildings & Architectural' },
  { wbsCode: '18', name: 'Roads, Paving & Drainage' },
  { wbsCode: '19', name: 'Environmental & Safety Works' },
  { wbsCode: '20', name: 'Testing, Pre-commissioning & Commissioning' },
  { wbsCode: '21', name: 'Operation & Maintenance / Training' }
];

/**
 * Default Benchmark Rates (USD) with explicit origin labels (Rule 57)
 */
const DEFAULT_UNIT_RATES_USD: Record<string, number> = {
  'QTY-CIV-001': 8.50,    // Excavation $/m3
  'QTY-CIV-002': 420.00,  // RCC Concrete Intake $/m3
  'QTY-CIV-003': 450.00,  // Flash Mixer Concrete $/m3
  'QTY-CIV-004': 410.00,  // Clarifier Concrete $/m3
  'QTY-CIV-005': 460.00,  // Filter Box Concrete $/m3
  'QTY-CIV-006': 390.00,  // CWR Concrete $/m3
  'QTY-CIV-007': 1250.00, // Rebar Steel $/Tonne
  'QTY-CIV-008': 18.50,   // Formwork $/m2
  'QTY-CIV-009': 14.00,   // Waterproofing $/m2
  'QTY-CIV-010': 350.00,  // Admin Building $/m2
  'QTY-MCH-001': 45000.00,// Intake Pump $/Set
  'QTY-MCH-002': 18000.00,// Mixer Drive $/Set
  'QTY-MCH-003': 12500.00,// Flocculator Drive $/Set
  'QTY-MCH-004': 65000.00,// Clarifier Scraper $/Set
  'QTY-MCH-005': 28000.00,// Air Blower $/Set
  'QTY-MCH-006': 78000.00,// High Lift Pump $/Set
  'QTY-PIP-001': 165.00,  // DI Pipe $/m
  'QTY-PIP-002': 280.00,  // SS Pipe $/m
  'QTY-VAL-001': 4500.00, // Butterfly Valve $/No.
  'QTY-VAL-002': 3200.00, // Check Valve $/No.
  'QTY-ELC-001': 85000.00,// Transformer $/Set
  'QTY-ELC-002': 95000.00,// Generator $/Set
  'QTY-ELC-003': 38000.00,// MCC Panel $/Panel
  'QTY-ELC-004': 32.00,   // Cable $/m
  'QTY-ICA-001': 6800.00, // Flowmeter $/No.
  'QTY-ICA-002': 14500.00,// Analyzer Panel $/Set
  'QTY-AUT-001': 115000.00,// PLC/SCADA Lot
  'QTY-SLD-001': 52000.00,// Thickener $/Set
  'QTY-SLD-002': 135000.00,// Filter Press $/Set
  'QTY-SLD-003': 42000.00 // Cake Silo $/Unit
};

/**
 * EVL WTP Engineering Suite - Master BOQ Engine
 * Generates structured, classified BOQ line items linked to quantities, specs & WBS.
 */
export function generateMasterBoq(
  state: CalculatedWtpState,
  customRates?: Record<string, number>
): BoqLineItem[] {
  const quantities = generateQuantityTakeoff(state);
  const boqList: BoqLineItem[] = [];

  quantities.forEach((qty, idx) => {
    const rate = customRates?.[qty.id] ?? DEFAULT_UNIT_RATES_USD[qty.id] ?? 100.0;
    const amount = Number((qty.quantity * rate).toFixed(2));

    // Map Category to BOQ & WBS
    let wbsCode = '01';
    let wbsDesc = 'General & Preliminaries';
    let boqCategory: BoqLineItem['category'] = 'Civil';

    switch (qty.category) {
      case 'CIVIL':
        boqCategory = 'Civil';
        if (qty.sourceModule.includes('Intake')) { wbsCode = '03'; wbsDesc = 'Intake Structure & Wet Well'; }
        else if (qty.sourceModule.includes('Aerator')) { wbsCode = '05'; wbsDesc = 'Aerator & Flash Mixer'; }
        else if (qty.sourceModule.includes('Clariflocculator')) { wbsCode = '06'; wbsDesc = 'Flocculation & Clarification'; }
        else if (qty.sourceModule.includes('Filtration')) { wbsCode = '07'; wbsDesc = 'Rapid Gravity Filtration'; }
        else if (qty.sourceModule.includes('CWR')) { wbsCode = '09'; wbsDesc = 'Clear Water Reservoir (CWR)'; }
        else if (qty.sourceModule.includes('Buildings')) { wbsCode = '17'; wbsDesc = 'Buildings & Architectural'; }
        else { wbsCode = '02'; wbsDesc = 'Site Development & Earthworks'; }
        break;
      case 'MECHANICAL':
        boqCategory = 'Mechanical';
        if (qty.sourceModule.includes('Intake')) { wbsCode = '04'; wbsDesc = 'Raw Water Pumping Station'; }
        else if (qty.sourceModule.includes('Rapid Mix')) { wbsCode = '05'; wbsDesc = 'Aerator & Flash Mixer'; }
        else if (qty.sourceModule.includes('Flocculator')) { wbsCode = '06'; wbsDesc = 'Flocculation & Clarification'; }
        else if (qty.sourceModule.includes('Filter')) { wbsCode = '07'; wbsDesc = 'Rapid Gravity Filtration'; }
        else if (qty.sourceModule.includes('High Lift')) { wbsCode = '10'; wbsDesc = 'High Lift Pumping Station'; }
        break;
      case 'PIPING':
      case 'VALVES':
        boqCategory = 'Piping';
        wbsCode = '11'; wbsDesc = 'Transmission Pipeline';
        break;
      case 'ELECTRICAL':
        boqCategory = 'Electrical';
        wbsCode = '14'; wbsDesc = 'Electrical Substation & Power';
        break;
      case 'INSTRUMENTATION':
        boqCategory = 'Instrumentation';
        wbsCode = '15'; wbsDesc = 'Instrumentation & Analytics';
        break;
      case 'AUTOMATION':
        boqCategory = 'Automation';
        wbsCode = '16'; wbsDesc = 'Automation, PLC & SCADA';
        break;
      case 'SLUDGE':
        boqCategory = 'Sludge';
        wbsCode = '13'; wbsDesc = 'Sludge Thickening & Dewatering';
        break;
      case 'ENVIRONMENTAL':
        boqCategory = 'Environmental';
        wbsCode = '19'; wbsDesc = 'Environmental & Safety Works';
        break;
    }

    // Spec lookup
    const spec = MASTER_SPECIFICATION_REGISTRY.find(s => s.section.toLowerCase().includes(qty.category.toLowerCase()))?.id || 'SPEC-STD-001';

    boqList.push({
      id: `BOQ-ITEM-${String(idx + 1).padStart(3, '0')}`,
      boqCode: `BOQ-${qty.category.substring(0, 3)}-${String(idx + 1).padStart(3, '0')}`,
      wbsCode,
      wbsDescription: wbsDesc,
      category: boqCategory,
      subcategory: qty.subcategory,
      description: qty.description,
      specificationRef: spec,
      unit: qty.unit,
      quantity: qty.quantity,
      unitRateUSD: rate,
      totalPriceUSD: amount,
      sourceModule: qty.sourceModule,
      drawingRef: qty.drawingReference || 'DWG-GEN-001',
      remarks: customRates?.[qty.id] ? 'USER INPUT RATE' : 'DEFAULT BENCHMARK RATE [VERIFY MARKET]'
    });
  });

  return boqList;
}
