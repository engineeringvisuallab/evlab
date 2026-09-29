import heroWaterImg from '../assets/images/hero_water_infrastructure_3d_1790644410645.jpg';
import civil3dCorridorImg from '../assets/images/civil3d_highway_pipeline_corridor_1790644436511.jpg';
import buildingRevitImg from '../assets/images/building_residential_revit_render_1790644425118.jpg';
import cadChamberImg from '../assets/images/cad_blueprint_mechanical_chamber_1790644451376.jpg';
export interface ProjectMedia {
  id: string;
  title: string;
  type: "image" | "cad-drawing" | "3d-model" | "video";
  url?: string;
  caption: string;
  blueprintSnippet?: string;
}

export interface ProjectBeforeAfter {
  beforeTitle: string;
  beforeType: string;
  beforeUrl: string;
  afterTitle: string;
  afterType: string;
  afterUrl: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  filterCategories: string[];
  year: string;
  client: string;
  funder?: string;
  location: string;
  heroImage: string;
  thumbnail: string;
  oneLineSummary: string;
  overview: string;
  myRole: string;
  scope: string[];
  software: string[];
  deliverables: string[];
  drawings: string[];
  images: string[];
  videos?: { title: string; duration: string; url?: string; summary: string }[];
  model3D?: { title: string; type: "building" | "chamber" | "pipeline"; interactive: boolean };
  beforeAfter?: ProjectBeforeAfter;
  featured: boolean;
}

export const PROJECT_FILTER_CATEGORIES = [
  { id: "all", label: "ALL" },
  { id: "hydraulic-modelling", label: "HYDRAULIC MODELLING (WATERGEMS)" },
  { id: "transmission-main", label: "TRANSMISSION MAINS (Ø2000MM DI)" },
  { id: "water-supply", label: "WATER SUPPLY & DMAS" },
  { id: "gis-mapping", label: "GIS MAPPING (ARCGIS/QGIS)" },
  { id: "autocad", label: "AUTOCAD DETAILS" }
];

export const PROJECTS_DATA: Project[] = [
  // 1. Khulna Water Supply Project (Phase-2)
  {
    id: "proj-khulna-phase2-modelling",
    title: "Khulna Water Supply Project (Phase-2) — WTPs, 385 ML Reservoir & Hydraulic Network Modelling",
    category: "HYDRAULIC MODELLING",
    filterCategories: ["hydraulic-modelling", "water-supply", "autocad", "transmission-main"],
    year: "Project Preparation Study",
    client: "Khulna Water Supply and Sewerage Authority (KWASA)",
    funder: "UNICEF / International Partners",
    location: "Khulna, Bangladesh",
    heroImage: heroWaterImg,
    thumbnail: heroWaterImg,
    oneLineSummary: "Hydraulic network modelling in WaterGEMS, upgrading Bangabandhu WTP (135 MLD), 385 ML impounding reservoir, CWR, and AutoCAD drawings.",
    overview:
      "The Project Preparation Study for Khulna Water Supply Project (Phase-2) focuses on improving the reliability, sustainability, and resilience of Khulna City's water supply. Included hydraulic network analysis, WTP upgrades (Bangabandhu WTP from 110 to 135 MLD; Afil Gate WTP from 5 to 15 MLD), 385 ML impounding reservoir, Mollahat & Afil Gate intake systems, and comprehensive transmission and distribution drawings.",
    myRole: "Network Modeller (at IWM)",
    software: ["WaterGEMS", "AutoCAD", "Civil 3D", "ArcGIS", "QGIS"],
    scope: [
      "Hydraulic network modelling & simulation using Bentley WaterGEMS",
      "AutoCAD drawings for transmission mains, distribution networks & WTP infrastructure",
      "Plan, profile, section & standard details showing pipeline alignment, pipe diameter, chainage & invert levels",
      "Valve chambers, air valve arrangements, washout chambers & water meter chambers",
      "Drawings for clear water reservoirs (CWR), overhead tanks (OHT), and raw/treated water lines",
      "Coordination between WaterGEMS hydraulic model, GIS shapefiles, and survey data"
    ],
    deliverables: [
      "WaterGEMS Calibrated Hydraulic Simulation Models",
      "Bangabandhu WTP (135 MLD) & 385 ML Reservoir Drawings",
      "Transmission Main & WDN Longitudinal Profiles",
      "Standard Appurtenance Chamber Booklets (.DWG)"
    ],
    drawings: ["Transmission Main Alignment Plan", "WTP Layout & Pipe Connections", "Longitudinal Pipeline Profile", "Valve & Washout Chamber Details"],
    images: [heroWaterImg],
    featured: true
  },

  // 2. Padma (Jashaldia) WTP - Ø2000mm DI Transmission Main (DWASA)
  {
    id: "proj-padma-jashaldia-transmission",
    title: "Padma (Jashaldia) Water Treatment Plant — Ø2000mm Ductile Iron (DI) Transmission Pipeline (Lot-1)",
    category: "TRANSMISSION MAIN",
    filterCategories: ["transmission-main", "autocad"],
    year: "Construction Package",
    client: "Dhaka Water Supply and Sewerage Authority (DWASA)",
    location: "Dhaka – Munshiganj Corridor, Bangladesh",
    heroImage: civil3dCorridorImg,
    thumbnail: civil3dCorridorImg,
    oneLineSummary: "Detailed design, longitudinal profiles, and standard engineering drawings for mega Ø2000mm DI water transmission pipeline.",
    overview:
      "Major national infrastructure assignment: Construction of P(J) WTP Primary and Secondary Distribution Main (Lot-1) - PADMA (JASHALDIA) Water Treatment Plant Volume Water Transmission Pipeline. Designed high-volume water transmission system with Ø2000mm ductile iron (DI) pipes, including comprehensive profiles and standard drawings.",
    myRole: "AutoCAD Expert (at IWM)",
    software: ["AutoCAD", "Civil 3D", "MS Excel"],
    scope: [
      "Designing water transmission system (WTN) with massive Ø2000mm Ductile Iron (DI) pipes",
      "Detailed longitudinal profiles showing existing ground level, pipe invert level & depth of cover",
      "Thrust restraint block calculations and reinforcement detail drawings",
      "Air release valve stations, washout scour chambers, and sectional isolation valve pits",
      "Utility crossing clearance and major road sleeve crossings"
    ],
    deliverables: [
      "Ø2000mm DI Transmission Main Plan & Profile Sets",
      "Heavy-Duty Concrete Thrust Block Details",
      "Air Valve & Washout Chamber Engineering Drawings",
      "Pipe Invert Level & Chainage Schedules"
    ],
    drawings: ["Ø2000mm DI Pipe Longitudinal Profile", "Thrust Restraint Block Detail", "Air Release Valve Pit", "Major Highway Crossing Section"],
    images: [civil3dCorridorImg],
    featured: true
  },

  // 3. Rohingya Refugee Camps Water Network Review (UNICEF)
  {
    id: "proj-rohingya-unicef-water",
    title: "Water Network Review & Design of 10 Piped Water Supply Systems in Rohingya Camps (UNICEF)",
    category: "WATER SUPPLY",
    filterCategories: ["water-supply", "autocad", "gis-mapping"],
    year: "Contract No. 43379197",
    client: "United Nations Children’s Fund (UNICEF)",
    location: "Cox's Bazar, Bangladesh",
    heroImage: cadChamberImg,
    thumbnail: cadChamberImg,
    oneLineSummary: "Technical assessment, PTW compound, pump house, solar panels & 10 piped networks for refugee camps & host communities.",
    overview:
      "Technical assessment to evaluate, plan, and design 10 water supply systems through community consultation and preparing bid documents for selected Rohingya camps and adjacent host communities to ensure social cohesion through shared piped water supply.",
    myRole: "AutoCAD Expert (at IWM)",
    software: ["AutoCAD", "ArcGIS", "MS Excel"],
    scope: [
      "Pipe layout design on site plan with PTW compound, pump house, solar panels & valve chambers",
      "PTW compound detailing with borehole coordinates, dimensions & technical specs",
      "Pump house floor plan, cross-sections & exterior elevations showing equipment layouts",
      "Detailed plan, section & elevation for tap stands and water meter chambers",
      "Standard drawings for bridge crossings, culvert crossings, and drain crossings"
    ],
    deliverables: [
      "10 Piped Water Supply Network Layouts (.DWG)",
      "Solar-Powered Pump House Structural & Architectural Set",
      "Community Tap Stand & Water Meter Chambers",
      "Tender Bid Drawing Package"
    ],
    drawings: ["PTW Compound Detail", "Pump House Plan & Section", "Tap Stand Standard View", "Bridge Crossing Sleeve Detail"],
    images: [cadChamberImg],
    featured: true
  },

  // 4. DPHE - World Bank Rural Piped Water Schemes (80 Upazilas)
  {
    id: "proj-dphe-world-bank-wash",
    title: "Rural Piped Water Supply Schemes & WASH in 80 Upazilas Across 18 Districts (World Bank)",
    category: "WATER SUPPLY",
    filterCategories: ["water-supply", "gis-mapping", "autocad"],
    year: "August 2022 – Till Date",
    client: "Department of Public Health Engineering (DPHE)",
    funder: "World Bank",
    location: "80 Upazilas under 18 Districts, 4 Divisions, Bangladesh",
    heroImage: heroWaterImg,
    thumbnail: heroWaterImg,
    oneLineSummary: "GIS mapping, water demand calculations, and 3 map series (WDN, Nodal Pressure, Index) across 80 upazilas.",
    overview:
      "Pre-feasibility, feasibility, social promotion, design, and construction supervision of rural piped water supply schemes and WASH facilities in community clinics. Used GIS to map PTW locations within 7km pipe lengths, road alignments, and prepared 3 map series along with standard chamber drawings.",
    myRole: "AutoCAD Expert (at IWM)",
    software: ["ArcGIS", "AutoCAD", "MS Excel"],
    scope: [
      "Creating GIS map including PTW locations within 7km pipe length and physical features",
      "Collecting topographic survey data and social data for feasibility study",
      "Water demand calculations and preparing GIS shapefiles",
      "Production of 3 map types: Water Distribution Network Map, Nodal Pressure Map, Index Map",
      "Standard drawings for Gate Valve Chamber, Washout Chamber, Air Release Valve, and crossings"
    ],
    deliverables: [
      "80 Upazila Piped Water Network GIS Maps",
      "Nodal Pressure & Distribution Maps",
      "Standard Chamber & Valve CAD Sheets (.DWG)",
      "Hydraulic Demand Calculation Spreadsheets"
    ],
    drawings: ["Rural Water Network Layout Map", "Nodal Pressure Distribution Map", "Standard Gate Valve Chamber", "Washout Chamber Detail"],
    images: [heroWaterImg],
    featured: true
  },

  // 5. Dhaka WASA - DWSNIP Packages ICB 02.9 and ICB 02.10 (ADB)
  {
    id: "proj-dwsnip-icb-029-0210",
    title: "Dhaka Water Supply Network Improvement Project (DWSNIP) Packages ICB 02.9 & 02.10 (ADB)",
    category: "WATER SUPPLY",
    filterCategories: ["water-supply", "autocad", "transmission-main"],
    year: "January 2019 – June 2023",
    client: "Dhaka WASA (DWASA) through CFMCC (China) and RFL Plastic Limited (RPL)",
    funder: "Asian Development Bank (ADB)",
    location: "Dhaka, Bangladesh",
    heroImage: civil3dCorridorImg,
    thumbnail: civil3dCorridorImg,
    oneLineSummary: "Detailed design, modeling & mapping for DMAs using trenchless HDPE pipes (Ø75mm–600mm).",
    overview:
      "Establishment of District Meter Areas (DMAs) in Dhaka City under DWSNIP. Installed HDPE pipes using trenchless technology to bring DMAs under 24hrs pressure at 1-bar or more and reduce water loss below 10%.",
    myRole: "AutoCAD Expert (at IWM)",
    software: ["AutoCAD", "MS Excel"],
    scope: [
      "Designing water distribution system (WDN) and transmission mains (HDPE Ø75-400mm and Ø400-600mm)",
      "Surface water injection point (SWIP) selection and chamber detailing",
      "PTW compound layout: pump layout, delivery lines, and joint details",
      "Trenchless technology crossings for roads, rail lines, bridges, and culverts",
      "Water meter chambers and inter-DMA connection designs"
    ],
    deliverables: [
      "DMA Comprehensive WDN Layouts",
      "Transmission Main Profiles & SWIP Connections",
      "Trenchless Crossing Detail Sets",
      "As-Built Drawings for Completed Packages"
    ],
    drawings: ["DMA WDN Alignment Plan", "SWIP Connection Detail", "Transmission Main Profile", "Culvert Crossing Section"],
    images: [civil3dCorridorImg],
    featured: true
  },

  // 6. Dhaka WASA - DESWSP (ADB)
  {
    id: "proj-deswsp-dwasa",
    title: "Dhaka Environmentally Sustainable Water Supply Project (DESWSP) — Distribution Network Modeling & Detail Design",
    category: "WATER SUPPLY",
    filterCategories: ["water-supply", "autocad"],
    year: "August 2022 – Date",
    client: "Dhaka WASA (DWASA) through RFL Plastic Ltd.",
    funder: "Asian Development Bank (ADB)",
    location: "Dhaka, Bangladesh",
    heroImage: cadChamberImg,
    thumbnail: cadChamberImg,
    oneLineSummary: "Distribution network modeling, trenchless HDPE piping, DMAs, and 24h pressurized supply at 1-bar.",
    overview:
      "Training and supervision of survey works, distribution network modelling, and detailed design work under DESWSP. Establishing DMAs with trenchless HDPE pipes (Ø75-400mm WDN, Ø400-600mm transmission) to achieve 24h pressure at 1-bar or more and reduce water loss below 15%.",
    myRole: "AutoCAD Expert (at IWM)",
    software: ["AutoCAD", "MS Excel"],
    scope: [
      "Designing water distribution system (WDN) and transmission mains",
      "Selecting appropriate HDPE pipes (Ø75mm to Ø400mm and Ø400mm to Ø600mm)",
      "Surface Water Injection Point (SWIP) selection and chamber integration",
      "Valves, fittings, end caps, and washout chamber arrangements"
    ],
    deliverables: [
      "DESWSP DMA Water Distribution Layouts",
      "SWIP Chamber Detail Drawings",
      "Transmission Pipeline Longitudinal Profiles",
      "Fittings & Pipe Summary Sheets"
    ],
    drawings: ["DESWSP Network Plan", "SWIP Integration Detail", "Pipeline Profile View", "Washout Chamber Detail"],
    images: [cadChamberImg],
    featured: false
  },

  // 7. Jhilmil Housing Project DMA Concept (RAJUK / DWASA)
  {
    id: "proj-jhilmil-wasa-rajuk",
    title: "Water Supply Network Design Considering DMA Concept at Jhilmil Housing Project of RAJUK",
    category: "HYDRAULIC MODELLING",
    filterCategories: ["hydraulic-modelling", "water-supply", "autocad"],
    year: "September 2017 – June 2021",
    client: "Dhaka WASA (DWASA)",
    location: "Keraniganj, Dhaka, Bangladesh",
    heroImage: heroWaterImg,
    thumbnail: heroWaterImg,
    oneLineSummary: "Hydraulic modeling using WaterGEMS, trenchless HDPE pipe design, node sketches, and longitudinal profiles.",
    overview:
      "Establishment of District Meter Areas (DMAs) in Jhilmil residential area. Hydraulic modeling using WaterGEMS software, design and installation of HDPE pipe using trenchless technology, bringing DMAs under 24hrs pressure at 1-bar, and reducing water loss below 10%.",
    myRole: "AutoCAD Expert (at IWM)",
    software: ["AutoCAD", "WaterGEMS", "MS Excel"],
    scope: [
      "Hydraulic modeling using WaterGEMS software",
      "Preparation of node sketches and node connectivity data",
      "Preparation of longitudinal profiles for distribution pipes",
      "Standard drawings, node summary, and pipe summary"
    ],
    deliverables: [
      "Jhilmil DMA Node Sketches and Pipe Summaries",
      "Water Distribution Longitudinal Profiles",
      "Standard Detail Booklets (.DWG)"
    ],
    drawings: ["DMA Node Sketch Plan", "Water Distribution Profile", "Standard Valve Pit Assembly"],
    images: [heroWaterImg],
    featured: false
  },

  // 8. Extended Part of Jahurul Islam City (Aftabnagar) (DWASA)
  {
    id: "proj-aftabnagar-dma-dwasa",
    title: "Hydraulic Modeling & Detailed Design of Water Supply Network at Extended Part of Jahurul Islam City (Aftabnagar)",
    category: "HYDRAULIC MODELLING",
    filterCategories: ["hydraulic-modelling", "water-supply", "autocad"],
    year: "June 2022 – October 2023",
    client: "Dhaka WASA (DWASA)",
    location: "Dhaka, Bangladesh",
    heroImage: cadChamberImg,
    thumbnail: cadChamberImg,
    oneLineSummary: "Detailed design of water distribution network (Ø100mm to 400mm HDPE), node & profile design, and fittings summary.",
    overview:
      "Design of water distribution network (WDN from Ø100mm to 400mm HDPE pipe) system considering DMA concept. Prepared node sketches, profiles, standard drawings, fittings summary, and pipe summary.",
    myRole: "AutoCAD Expert (at IWM)",
    software: ["AutoCAD", "WaterGEMS", "MS Excel"],
    scope: [
      "Design of WDN (Ø100mm to 400mm HDPE pipe)",
      "System node and profile with detailed engineering design",
      "Standard drawings for valves, fittings, and chambers",
      "Fittings summary and pipe summary"
    ],
    deliverables: [
      "Aftabnagar WDN Alignment and Profile Drawings",
      "DMA Node Sketches & Hydraulic Specifications",
      "Complete Pipe and Fittings Schedule"
    ],
    drawings: ["Aftabnagar WDN Layout", "Pipeline Profile View", "Standard Chamber Details", "Fittings Schedule"],
    images: [cadChamberImg],
    featured: false
  }
];
