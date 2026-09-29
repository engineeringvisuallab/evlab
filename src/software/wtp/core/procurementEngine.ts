import { BoqLineItem } from './boqEngine';

export type ProcurementStatus = 
  | 'PLANNED'
  | 'RFQ'
  | 'QUOTATION_RECEIVED'
  | 'TECHNICAL_EVALUATION'
  | 'COMMERCIAL_EVALUATION'
  | 'AWARDED'
  | 'ORDERED'
  | 'MANUFACTURING'
  | 'INSPECTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'INSTALLED'
  | 'ACCEPTED';

export interface ProcurementPackage {
  packageId: string;
  packageName: string;
  category: string;
  itemsCount: number;
  totalEstimatedCostUSD: number;
  leadTimeWeeks: number;
  isLongLeadItem: boolean;
  requiredOnSiteDate: string;
  status: ProcurementStatus;
  assignedVendorId?: string;
  assignedVendorName?: string;
}

export interface VendorRecord {
  vendorId: string;
  vendorName: string;
  country: string;
  contactPerson: string;
  contactEmail: string;
  productCategory: string;
  prequalificationStatus: 'APPROVED' | 'PROVISIONAL' | 'NOT_APPROVED';
  performanceRating: number; // 1 to 5
  typicalLeadTimeWeeks: number;
  warrantyYears: number;
  remarks: string;
}

export interface TechnicalBidEvaluation {
  packageId: string;
  vendorId: string;
  vendorName: string;
  compliancePercentage: number;
  technicalScore: number; // 0 to 100
  deviationsNoted: string[];
  datasheetApproval: 'APPROVED' | 'REJECTED' | 'COMMENTS';
  warrantyCompliance: boolean;
  overallEvaluationResult: 'PASS' | 'FAIL' | 'CLARIFICATION_REQUIRED';
}

export interface CommercialBidEvaluation {
  packageId: string;
  vendorId: string;
  vendorName: string;
  basePriceUSD: number;
  taxesAndDutiesUSD: number;
  freightAndInsuranceUSD: number;
  installationAndCommissioningUSD: number;
  sparePartsCostUSD: number;
  totalEvaluatedCostUSD: number;
  commercialRank: number;
  recommendation: 'RECOMMENDED_FOR_AWARD' | 'HIGHER_PRICE' | 'COMMERCIALLY_REJECTED';
}

export interface MaterialSubmittal {
  submittalId: string;
  packageId: string;
  materialDescription: string;
  vendorName: string;
  submissionDate: string;
  revision: string;
  reviewStatus: 'SUBMITTED' | 'APPROVED' | 'APPROVED_WITH_COMMENTS' | 'REVISE_AND_RESUBMIT' | 'REJECTED';
  reviewerComments: string;
}

export interface ShopDrawingSubmittal {
  drawingNumber: string;
  title: string;
  vendorName: string;
  submissionDate: string;
  revision: string;
  reviewStatus: 'SUBMITTED' | 'APPROVED' | 'APPROVED_WITH_COMMENTS' | 'REVISE_AND_RESUBMIT' | 'REJECTED';
  approvalDate?: string;
}

/**
 * EVL WTP Engineering Suite - Procurement Engine
 * Auto-packages BOQ items, identifies long-lead items, handles vendor management & bid evaluation.
 */

export const LONG_LEAD_THRESHOLD_WEEKS = 16;

export function generateProcurementPackages(boqItems: BoqLineItem[]): ProcurementPackage[] {
  const packageMap: Record<string, { name: string; items: BoqLineItem[]; leadWeeks: number }> = {
    'PKG-CIV-01': { name: 'Civil Construction Materials & Concrete', items: [], leadWeeks: 6 },
    'PKG-PMP-01': { name: 'Raw Water & High Lift Heavy Duty Pumps', items: [], leadWeeks: 20 }, // Long Lead
    'PKG-MCH-01': { name: 'Clarifier Scraper & Flocculator Drives', items: [], leadWeeks: 14 },
    'PKG-PIP-01': { name: 'Ductile Iron Pipes & Fittings', items: [], leadWeeks: 12 },
    'PKG-VAL-01': { name: 'Large Motorized Butterfly & Control Valves', items: [], leadWeeks: 18 }, // Long Lead
    'PKG-ELC-01': { name: '11kV Power Transformer & DG Set', items: [], leadWeeks: 22 }, // Long Lead
    'PKG-ELC-02': { name: 'MCC Panels & VFD Drives', items: [], leadWeeks: 16 }, // Long Lead
    'PKG-ICA-01': { name: 'Flowmeters & Online Analyzers', items: [], leadWeeks: 12 },
    'PKG-AUT-01': { name: 'Redundant PLC & SCADA System', items: [], leadWeeks: 18 }, // Long Lead
    'PKG-SLD-01': { name: 'Filter Press Sludge Dewatering Units', items: [], leadWeeks: 20 }  // Long Lead
  };

  boqItems.forEach(item => {
    let pkgKey = 'PKG-CIV-01';
    if (item.category === 'Mechanical') {
      if (item.description.toLowerCase().includes('pump')) pkgKey = 'PKG-PMP-01';
      else pkgKey = 'PKG-MCH-01';
    } else if (item.category === 'Piping') {
      if (item.description.toLowerCase().includes('valve')) pkgKey = 'PKG-VAL-01';
      else pkgKey = 'PKG-PIP-01';
    } else if (item.category === 'Electrical') {
      if (item.description.toLowerCase().includes('transformer') || item.description.toLowerCase().includes('generator')) pkgKey = 'PKG-ELC-01';
      else pkgKey = 'PKG-ELC-02';
    } else if (item.category === 'Instrumentation') {
      pkgKey = 'PKG-ICA-01';
    } else if (item.category === 'Automation') {
      pkgKey = 'PKG-AUT-01';
    } else if (item.category === 'Sludge') {
      pkgKey = 'PKG-SLD-01';
    }

    if (packageMap[pkgKey]) {
      packageMap[pkgKey].items.push(item);
    }
  });

  const packages: ProcurementPackage[] = [];
  const now = new Date();

  Object.entries(packageMap).forEach(([pkgId, data]) => {
    const totalEst = data.items.reduce((sum, i) => sum + i.totalPriceUSD, 0);
    const isLongLead = data.leadWeeks >= LONG_LEAD_THRESHOLD_WEEKS;

    // Target date = Today + Lead Time + 4 weeks buffer
    const targetDate = new Date(now.valueOf() + (data.leadWeeks + 4) * 7 * 24 * 3600 * 1000);

    packages.push({
      packageId: pkgId,
      packageName: data.name,
      category: pkgId.split('-')[1],
      itemsCount: data.items.length,
      totalEstimatedCostUSD: totalEst,
      leadTimeWeeks: data.leadWeeks,
      isLongLeadItem: isLongLead,
      requiredOnSiteDate: targetDate.toISOString().split('T')[0],
      status: isLongLead ? 'RFQ' : 'PLANNED',
      assignedVendorName: 'PROJECT / MARKET VENDOR SELECTION'
    });
  });

  return packages;
}

/**
 * Pre-populated Approved Vendor Database
 */
export const APPROVED_VENDOR_DATABASE: VendorRecord[] = [
  {
    vendorId: 'VND-PMP-001',
    vendorName: 'Sulzer / KSB Pumps Ltd.',
    country: 'Germany / Switzerland',
    contactPerson: 'Engineered Pump Sales Division',
    contactEmail: 'sales.water@ksb-sulzer.com',
    productCategory: 'Raw & High Lift Heavy Duty Pumps',
    prequalificationStatus: 'APPROVED',
    performanceRating: 4.8,
    typicalLeadTimeWeeks: 20,
    warrantyYears: 2,
    remarks: 'Approved for large split-case and vertical turbine pumps'
  },
  {
    vendorId: 'VND-ELC-001',
    vendorName: 'ABB / Siemens Electrical Grid',
    country: 'Germany / Sweden',
    contactPerson: 'Power Systems Dept.',
    contactEmail: 'substation.orders@abb.com',
    productCategory: 'Power Transformers & Switchgear',
    prequalificationStatus: 'APPROVED',
    performanceRating: 4.9,
    typicalLeadTimeWeeks: 22,
    warrantyYears: 3,
    remarks: 'Approved for 11kV transformers and Form 4b MCCs'
  },
  {
    vendorId: 'VND-ICA-001',
    vendorName: 'Endress+Hauser / Schneider Electric',
    country: 'Switzerland / France',
    contactPerson: 'Process Automation Team',
    contactEmail: 'water.instruments@eh.com',
    productCategory: 'Flowmeters, Analytics & PLC SCADA',
    prequalificationStatus: 'APPROVED',
    performanceRating: 4.7,
    typicalLeadTimeWeeks: 12,
    warrantyYears: 2,
    remarks: 'Approved for electromagnetic flowmeters and analytical panels'
  }
];

/**
 * Evaluates a technical bid against project requirements.
 */
export function evaluateTechnicalBid(
  packageId: string,
  vendorId: string,
  complianceScorePct: number,
  hasCrucialDeviations: boolean
): TechnicalBidEvaluation {
  const vendor = APPROVED_VENDOR_DATABASE.find(v => v.vendorId === vendorId);
  const vendorName = vendor ? vendor.vendorName : 'Quoting Vendor';

  let result: TechnicalBidEvaluation['overallEvaluationResult'] = 'PASS';
  if (hasCrucialDeviations) {
    result = 'CLARIFICATION_REQUIRED';
  } else if (complianceScorePct < 75.0) {
    result = 'FAIL';
  }

  return {
    packageId,
    vendorId,
    vendorName,
    compliancePercentage: complianceScorePct,
    technicalScore: Math.round(complianceScorePct * 0.95),
    deviationsNoted: hasCrucialDeviations ? ['Motor insulation class F required vs class B offered'] : [],
    datasheetApproval: complianceScorePct >= 80 ? 'APPROVED' : 'COMMENTS',
    warrantyCompliance: true,
    overallEvaluationResult: result
  };
}
