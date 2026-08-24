import { CalculatedWtpState } from './dependencyEngine';

export type EngineeringObjectType = 
  | 'INTAKE'
  | 'PUMP_RAW'
  | 'AERATOR'
  | 'RAPID_MIX'
  | 'FLOCCULATOR'
  | 'CLARIFIER'
  | 'FILTER'
  | 'CWR'
  | 'PUMP_HIGH_LIFT'
  | 'CHEMICAL_BLDG'
  | 'ELECTRICAL_BLDG'
  | 'SLUDGE_THICKENER'
  | 'SLUDGE_DEWATERING'
  | 'PIPE'
  | 'VALVE'
  | 'INSTRUMENT'
  | 'ROAD'
  | 'DRAINAGE';

export type ObjectStatus = 'DESIGN' | 'CONSTRUCTED' | 'AS_BUILT' | 'IN_INSPECTION';

export interface Coordinates {
  x: number; // meters from local origin
  y: number; // meters from local origin
  z: number; // elevation meters above MSL
  lat?: number;
  lon?: number;
  easting?: number;
  northing?: number;
}

export interface Dimensions {
  lengthM: number;
  widthM: number;
  heightM: number;
  diameterM?: number;
  wallThicknessM?: number;
  volumeM3?: number;
}

export interface DesignVsAsBuilt {
  parameter: string;
  designedValue: string | number;
  asBuiltValue: string | number;
  difference: string | number;
  unit: string;
  approved: boolean;
}

export interface EngineeringObject {
  objectId: string; // e.g. INT-001, CLR-001, PIPE-001
  type: EngineeringObjectType;
  name: string;
  description: string;
  coordinates: Coordinates;
  dimensions: Dimensions;
  material: string;
  designParameters: Record<string, string | number>;
  equipmentTag: string;
  processRelationship: {
    upstreamObjectIds: string[];
    downstreamObjectIds: string[];
    processStage: string;
  };
  drawingRefs: string[]; // e.g. ['DWG-001', 'DWG-P-001']
  boqRefs: string[]; // e.g. ['BOQ-CIV-001', 'BOQ-MCH-002']
  procurementRefs: string[]; // e.g. ['PKG-PMP-01']
  constructionRefs: string[]; // e.g. ['ACT-005']
  qaqcRefs: string[]; // e.g. ['ITP-001', 'NCR-002']
  specificationRef: string;
  revision: string;
  status: ObjectStatus;
  
  // BIM & GIS links
  ifcGuid: string;
  ifcType: string;
  gisFeatureId: string;
  
  // Design vs As-Built
  asBuiltData?: DesignVsAsBuilt[];
}

/**
 * SINGLE SOURCE OF TRUTH:
 * Generates the unified Engineering Model Registry from calculated WTP state.
 * All downstream modules (Drawings, 3D, GIS, BIM, BOQ, Cost, Procurement, Construction)
 * MUST reference object IDs generated here.
 */
export function getEngineeringModelRegistry(state: CalculatedWtpState): EngineeringObject[] {
  const capacity = state.plantCapacityMLD || 50;
  const baseLat = 23.8103;
  const baseLon = 90.4125;
  const baseEasting = 542000;
  const baseNorthing = 2633000;

  const objects: EngineeringObject[] = [
    // 1. INTAKE STRUCTURE
    {
      objectId: 'INT-001',
      type: 'INTAKE',
      name: 'River Water Intake Structure',
      description: 'Reinforced concrete wet well & intake tower with coarse/fine screen channels.',
      coordinates: { x: 0, y: 0, z: 10.0, lat: baseLat, lon: baseLon, easting: baseEasting, northing: baseNorthing },
      dimensions: { lengthM: 15, widthM: 10, heightM: 8, volumeM3: 1200 },
      material: 'Reinforced Concrete (Grade C35/45)',
      designParameters: { designFlowM3hr: Math.round(capacity * 1000 / 24), intakeVelocityMs: 0.15 },
      equipmentTag: 'INT-STR-01',
      processRelationship: { upstreamObjectIds: [], downstreamObjectIds: ['RWP-001'], processStage: 'RAW_WATER_INTAKE' },
      drawingRefs: ['DWG-CIV-001', 'DWG-PFD-001'],
      boqRefs: ['QTY-CIV-001', 'BOQ-CIV-001'],
      procurementRefs: ['PKG-CIV-01'],
      constructionRefs: ['ACT-002'],
      qaqcRefs: ['ITP-CIV-01'],
      specificationRef: 'SPEC-CIV-001',
      revision: 'REV-B',
      status: 'DESIGN',
      ifcGuid: '1A2B3C4D-INT-001',
      ifcType: 'IfcCivilStructure',
      gisFeatureId: 'GIS-INT-001',
      asBuiltData: [
        { parameter: 'Intake Length', designedValue: 15.0, asBuiltValue: 15.05, difference: 0.05, unit: 'm', approved: true },
        { parameter: 'Elevation', designedValue: 10.0, asBuiltValue: 9.98, difference: -0.02, unit: 'm', approved: true }
      ]
    },

    // 2. RAW WATER PUMPING STATION
    {
      objectId: 'RWP-001',
      type: 'PUMP_RAW',
      name: 'Raw Water Intake Pump House',
      description: 'Raw water vertical turbine pumps (3 duty + 1 standby) with VFD control.',
      coordinates: { x: 25, y: 0, z: 10.5, lat: baseLat + 0.0002, lon: baseLon, easting: baseEasting + 25, northing: baseNorthing },
      dimensions: { lengthM: 18, widthM: 12, heightM: 6, volumeM3: 1296 },
      material: 'Cast Iron Casing / Stainless Steel 316 Impeller',
      designParameters: { pumpFlowM3hr: Math.round((capacity * 1000 / 24) / 3), totalDynamicHeadM: 25, powerKw: 110 },
      equipmentTag: 'PMP-RAW-01A/B/C/D',
      processRelationship: { upstreamObjectIds: ['INT-001'], downstreamObjectIds: ['AER-001'], processStage: 'RAW_WATER_PUMPING' },
      drawingRefs: ['DWG-MCH-001', 'DWG-PID-001'],
      boqRefs: ['QTY-MCH-001', 'BOQ-MCH-001'],
      procurementRefs: ['PKG-PMP-01'],
      constructionRefs: ['ACT-006'],
      qaqcRefs: ['ITP-MCH-01'],
      specificationRef: 'SPEC-MCH-001',
      revision: 'REV-B',
      status: 'DESIGN',
      ifcGuid: '2B3C4D5E-RWP-001',
      ifcType: 'IfcPump',
      gisFeatureId: 'GIS-RWP-001',
      asBuiltData: [
        { parameter: 'Motor Power', designedValue: 110, asBuiltValue: 110, difference: 0, unit: 'kW', approved: true }
      ]
    },

    // 3. CASCADE AERATOR
    {
      objectId: 'AER-001',
      type: 'AERATOR',
      name: 'Cascade Aerator Unit',
      description: '4-Tier circular reinforced concrete cascade aerator for iron/manganese oxidation.',
      coordinates: { x: 60, y: 0, z: 18.0, lat: baseLat + 0.0005, lon: baseLon, easting: baseEasting + 60, northing: baseNorthing },
      dimensions: { lengthM: 12, widthM: 12, heightM: 4, diameterM: 12, volumeM3: 450 },
      material: 'Reinforced Concrete with Epoxy Coating',
      designParameters: { trayAreaM2: 113, loadingRateM3m2hr: 18.5 },
      equipmentTag: 'AER-STR-01',
      processRelationship: { upstreamObjectIds: ['RWP-001'], downstreamObjectIds: ['RMX-001'], processStage: 'AERATION' },
      drawingRefs: ['DWG-CIV-002', 'DWG-HGL-001'],
      boqRefs: ['QTY-CIV-002', 'BOQ-CIV-002'],
      procurementRefs: ['PKG-CIV-01'],
      constructionRefs: ['ACT-005'],
      qaqcRefs: ['ITP-CIV-02'],
      specificationRef: 'SPEC-CIV-001',
      revision: 'REV-A',
      status: 'DESIGN',
      ifcGuid: '3C4D5E6F-AER-001',
      ifcType: 'IfcCivilStructure',
      gisFeatureId: 'GIS-AER-001'
    },

    // 4. RAPID FLASH MIXER
    {
      objectId: 'RMX-001',
      type: 'RAPID_MIX',
      name: 'High-Speed Flash Mixing Tank',
      description: 'Vertical turbine flash mixer basin for coagulant dosing (Alum/PAC).',
      coordinates: { x: 85, y: 0, z: 17.5, lat: baseLat + 0.0007, lon: baseLon, easting: baseEasting + 85, northing: baseNorthing },
      dimensions: { lengthM: 3.5, widthM: 3.5, heightM: 4.0, volumeM3: 49 },
      material: 'Reinforced Concrete / Stainless Steel Agitator',
      designParameters: { retentionTimeSec: 60, velocityGradientGSec1: 850 },
      equipmentTag: 'RMX-AGI-01',
      processRelationship: { upstreamObjectIds: ['AER-001'], downstreamObjectIds: ['FLO-001'], processStage: 'COAGULATION' },
      drawingRefs: ['DWG-PID-001', 'DWG-CIV-003'],
      boqRefs: ['QTY-MCH-002', 'BOQ-MCH-002'],
      procurementRefs: ['PKG-MIX-01'],
      constructionRefs: ['ACT-007'],
      qaqcRefs: ['ITP-MCH-02'],
      specificationRef: 'SPEC-MCH-002',
      revision: 'REV-B',
      status: 'DESIGN',
      ifcGuid: '4D5E6F7A-RMX-001',
      ifcType: 'IfcTank',
      gisFeatureId: 'GIS-RMX-001'
    },

    // 5. FLOCCULATION BASINS
    {
      objectId: 'FLO-001',
      type: 'FLOCCULATOR',
      name: '3-Stage Hydraulic Baffled Flocculator',
      description: 'Tapered energy dissipation flocculation chambers with vertical paddle mixers.',
      coordinates: { x: 110, y: 0, z: 16.8, lat: baseLat + 0.0009, lon: baseLon, easting: baseEasting + 110, northing: baseNorthing },
      dimensions: { lengthM: 22, widthM: 14, heightM: 4.5, volumeM3: 1386 },
      material: 'Reinforced Concrete (Acid Resistant Coating)',
      designParameters: { retentionTimeMin: 20, stage1GSec1: 60, stage2GSec1: 35, stage3GSec1: 15 },
      equipmentTag: 'FLO-PAD-01A/B/C',
      processRelationship: { upstreamObjectIds: ['RMX-001'], downstreamObjectIds: ['CLR-001'], processStage: 'FLOCCULATION' },
      drawingRefs: ['DWG-CIV-004', 'DWG-GA-001'],
      boqRefs: ['QTY-CIV-003', 'BOQ-CIV-003'],
      procurementRefs: ['PKG-CIV-02'],
      constructionRefs: ['ACT-005'],
      qaqcRefs: ['ITP-CIV-03'],
      specificationRef: 'SPEC-CIV-001',
      revision: 'REV-B',
      status: 'DESIGN',
      ifcGuid: '5E6F7A8B-FLO-001',
      ifcType: 'IfcCivilStructure',
      gisFeatureId: 'GIS-FLO-001'
    },

    // 6. HIGH-RATE CLARIFIERS
    {
      objectId: 'CLR-001',
      type: 'CLARIFIER',
      name: 'High-Rate Lamella Clarifier Unit 1 & 2',
      description: 'Inclined plate settler clarifier with central sludge scraper mechanism.',
      coordinates: { x: 150, y: 0, z: 15.5, lat: baseLat + 0.0012, lon: baseLon, easting: baseEasting + 150, northing: baseNorthing },
      dimensions: { lengthM: 28, widthM: 20, heightM: 5.0, diameterM: 20, volumeM3: 2800 },
      material: 'Reinforced Concrete / Stainless 304 Lamella Packs',
      designParameters: { surfaceOverflowRateM3m2hr: 1.8, lamellaAngleDeg: 60 },
      equipmentTag: 'CLR-SCR-01A/B',
      processRelationship: { upstreamObjectIds: ['FLO-001'], downstreamObjectIds: ['FIL-001', 'SLD-001'], processStage: 'CLARIFICATION' },
      drawingRefs: ['DWG-CIV-005', 'DWG-MCH-002'],
      boqRefs: ['QTY-CIV-004', 'BOQ-MCH-003'],
      procurementRefs: ['PKG-CLR-01'],
      constructionRefs: ['ACT-008'],
      qaqcRefs: ['ITP-MCH-03'],
      specificationRef: 'SPEC-MCH-003',
      revision: 'REV-A',
      status: 'DESIGN',
      ifcGuid: '6F7A8B9C-CLR-001',
      ifcType: 'IfcSanitaryTerminal',
      gisFeatureId: 'GIS-CLR-001'
    },

    // 7. RAPID GRAVITY SAND FILTERS
    {
      objectId: 'FIL-001',
      type: 'FILTER',
      name: 'Rapid Gravity Sand Filter Block (6 Cells)',
      description: 'Dual-media sand/anthracite filters with Leopold underdrain and air-water backwash.',
      coordinates: { x: 200, y: 0, z: 14.0, lat: baseLat + 0.0016, lon: baseLon, easting: baseEasting + 200, northing: baseNorthing },
      dimensions: { lengthM: 36, widthM: 24, heightM: 4.8, volumeM3: 4147 },
      material: 'Reinforced Concrete / Silica Sand & Anthracite Media',
      designParameters: { filtrationRateMhr: 6.5, cellCount: 6, backwashAirRateM3m2hr: 55 },
      equipmentTag: 'FIL-BLK-01',
      processRelationship: { upstreamObjectIds: ['CLR-001'], downstreamObjectIds: ['CWR-001'], processStage: 'FILTRATION' },
      drawingRefs: ['DWG-CIV-006', 'DWG-PID-002'],
      boqRefs: ['QTY-CIV-005', 'BOQ-CIV-005'],
      procurementRefs: ['PKG-FIL-01'],
      constructionRefs: ['ACT-009'],
      qaqcRefs: ['ITP-CIV-04'],
      specificationRef: 'SPEC-CIV-002',
      revision: 'REV-B',
      status: 'DESIGN',
      ifcGuid: '7A8B9C0D-FIL-001',
      ifcType: 'IfcSanitaryTerminal',
      gisFeatureId: 'GIS-FIL-001'
    },

    // 8. CLEAR WATER RESERVOIR (CWR)
    {
      objectId: 'CWR-001',
      type: 'CWR',
      name: 'Clear Water Underground Reservoir & Chlorine Contact Tank',
      description: 'Twin-compartment underground RC reservoir with chlorine baffle wall system.',
      coordinates: { x: 260, y: 0, z: 8.0, lat: baseLat + 0.0020, lon: baseLon, easting: baseEasting + 260, northing: baseNorthing },
      dimensions: { lengthM: 60, widthM: 40, heightM: 5.5, volumeM3: 13200 },
      material: 'Reinforced Concrete (Waterproof Grade C40/50)',
      designParameters: { storageCapacityM3: 12500, retentionTimeHrs: 6.0, chlorineCtMgMinL: 30 },
      equipmentTag: 'CWR-RES-01',
      processRelationship: { upstreamObjectIds: ['FIL-001', 'CHM-001'], downstreamObjectIds: ['HLP-001'], processStage: 'DISINFECTION_AND_STORAGE' },
      drawingRefs: ['DWG-CIV-007', 'DWG-SITE-001'],
      boqRefs: ['QTY-CIV-006', 'BOQ-CIV-006'],
      procurementRefs: ['PKG-CIV-03'],
      constructionRefs: ['ACT-004'],
      qaqcRefs: ['ITP-CIV-05'],
      specificationRef: 'SPEC-CIV-001',
      revision: 'REV-C',
      status: 'DESIGN',
      ifcGuid: '8B9C0D1E-CWR-001',
      ifcType: 'IfcTank',
      gisFeatureId: 'GIS-CWR-001'
    },

    // 9. HIGH LIFT PUMPING STATION
    {
      objectId: 'HLP-001',
      type: 'PUMP_HIGH_LIFT',
      name: 'High Lift Treated Water Pump Station',
      description: 'Horizontal split-case centrifugal pumps transferring water to city distribution network.',
      coordinates: { x: 310, y: 0, z: 12.0, lat: baseLat + 0.0024, lon: baseLon, easting: baseEasting + 310, northing: baseNorthing },
      dimensions: { lengthM: 24, widthM: 14, heightM: 7.0, volumeM3: 2352 },
      material: 'Ductile Iron Casing / Bronze Impeller / Soft Starter',
      designParameters: { dischargeHeadM: 65, totalFlowM3hr: Math.round(capacity * 1000 / 24), pumpCount: 4 },
      equipmentTag: 'PMP-HLP-01A/B/C/D',
      processRelationship: { upstreamObjectIds: ['CWR-001'], downstreamObjectIds: [], processStage: 'HIGH_LIFT_DISTRIBUTION' },
      drawingRefs: ['DWG-MCH-004', 'DWG-ELE-001'],
      boqRefs: ['QTY-MCH-004', 'BOQ-MCH-004'],
      procurementRefs: ['PKG-PMP-02'],
      constructionRefs: ['ACT-006'],
      qaqcRefs: ['ITP-MCH-04'],
      specificationRef: 'SPEC-MCH-001',
      revision: 'REV-B',
      status: 'DESIGN',
      ifcGuid: '9C0D1E2F-HLP-001',
      ifcType: 'IfcPump',
      gisFeatureId: 'GIS-HLP-001'
    },

    // 10. MAIN TRANSMISSION PIPELINE
    {
      objectId: 'PIPE-001',
      type: 'PIPE',
      name: 'Main Treated Water Transmission Pipeline',
      description: 'DN1000 Ductile Iron Class K9 mortar lined transmission main from High Lift Pumps to City Network.',
      coordinates: { x: 334, y: 0, z: 10.0, lat: baseLat + 0.0026, lon: baseLon, easting: baseEasting + 334, northing: baseNorthing },
      dimensions: { lengthM: 500, widthM: 1.0, heightM: 1.0, diameterM: 1.0, wallThicknessM: 0.012 },
      material: 'Ductile Iron K9 (Cement Mortar Lined)',
      designParameters: { nominalDiameterMm: 1000, designPressureBar: 10, flowVelocityMs: 1.6 },
      equipmentTag: 'PIP-TRN-1000',
      processRelationship: { upstreamObjectIds: ['HLP-001'], downstreamObjectIds: [], processStage: 'TRANSMISSION' },
      drawingRefs: ['DWG-PIP-001', 'DWG-HYD-001'],
      boqRefs: ['QTY-PIP-001', 'BOQ-PIP-001'],
      procurementRefs: ['PKG-PIP-01'],
      constructionRefs: ['ACT-010'],
      qaqcRefs: ['ITP-PIP-01'],
      specificationRef: 'SPEC-PIP-001',
      revision: 'REV-A',
      status: 'DESIGN',
      ifcGuid: '0D1E2F3A-PIPE-001',
      ifcType: 'IfcPipeSegment',
      gisFeatureId: 'GIS-PIPE-001'
    },

    // 11. CHEMICAL BUILDING & STORAGE
    {
      objectId: 'CHM-001',
      type: 'CHEMICAL_BLDG',
      name: 'Chemical Preparation & Dosing Building',
      description: '2-Story building for Alum, Polymer, Chlorine, Lime storage, solution tanks & dosing pumps.',
      coordinates: { x: 120, y: 50, z: 12.0, lat: baseLat + 0.0010, lon: baseLon + 0.0005, easting: baseEasting + 120, northing: baseNorthing + 50 },
      dimensions: { lengthM: 30, widthM: 18, heightM: 8.0, volumeM3: 4320 },
      material: 'RC Frame with Masonry Infill / Epoxy Floor Coating',
      designParameters: { alumStorageTons: 60, chlorineDosingKgDay: 150 },
      equipmentTag: 'CHM-BLD-01',
      processRelationship: { upstreamObjectIds: [], downstreamObjectIds: ['RMX-001', 'FLO-001', 'CWR-001'], processStage: 'CHEMICAL_DOSING' },
      drawingRefs: ['DWG-CIV-008', 'DWG-PID-003'],
      boqRefs: ['QTY-CIV-007', 'BOQ-CHM-001'],
      procurementRefs: ['PKG-CHM-01'],
      constructionRefs: ['ACT-003'],
      qaqcRefs: ['ITP-CIV-06'],
      specificationRef: 'SPEC-CHM-001',
      revision: 'REV-A',
      status: 'DESIGN',
      ifcGuid: '1E2F3A4B-CHM-001',
      ifcType: 'IfcBuilding',
      gisFeatureId: 'GIS-CHM-001'
    },

    // 12. SLUDGE THICKENER & DEWATERING
    {
      objectId: 'SLD-001',
      type: 'SLUDGE_THICKENER',
      name: 'Gravity Sludge Thickener & Filter Press Shed',
      description: '15m Diameter circular sludge thickener tank and plate filter press dewatering facility.',
      coordinates: { x: 180, y: -60, z: 10.0, lat: baseLat + 0.0014, lon: baseLon - 0.0006, easting: baseEasting + 180, northing: baseNorthing - 60 },
      dimensions: { lengthM: 25, widthM: 18, heightM: 6.0, diameterM: 15, volumeM3: 700 },
      material: 'Reinforced Concrete Tank & Steel Shed Structural Frame',
      designParameters: { solidsLoadingKgM2Day: 45, drySludgeTonsDay: 3.5 },
      equipmentTag: 'SLD-THK-01',
      processRelationship: { upstreamObjectIds: ['CLR-001', 'FIL-001'], downstreamObjectIds: [], processStage: 'SLUDGE_TREATMENT' },
      drawingRefs: ['DWG-CIV-009', 'DWG-MCH-005'],
      boqRefs: ['QTY-CIV-008', 'BOQ-SLD-001'],
      procurementRefs: ['PKG-SLD-01'],
      constructionRefs: ['ACT-011'],
      qaqcRefs: ['ITP-MCH-05'],
      specificationRef: 'SPEC-MCH-004',
      revision: 'REV-A',
      status: 'DESIGN',
      ifcGuid: '2F3A4B5C-SLD-001',
      ifcType: 'IfcSanitaryTerminal',
      gisFeatureId: 'GIS-SLD-001'
    }
  ];

  return objects;
}
