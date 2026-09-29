import heroWaterImg from '../assets/images/hero_water_infrastructure_3d_1790644410645.jpg';
import civil3dCorridorImg from '../assets/images/civil3d_highway_pipeline_corridor_1790644436511.jpg';
import buildingRevitImg from '../assets/images/building_residential_revit_render_1790644425118.jpg';
import cadChamberImg from '../assets/images/cad_blueprint_mechanical_chamber_1790644451376.jpg';
export interface CoreHireService {
  number: string;
  title: string;
  tagline: string;
  capabilities: string[];
  visualPreviews: {
    label: string;
    type: 'plan' | 'profile' | 'section' | 'detail' | 'model' | 'report' | 'video';
    image?: string;
  }[];
}

export interface SoftwareTool {
  name: string;
  tier: string;
  category: 'primary' | 'hydraulic' | 'gis';
  role: string;
}

export interface SecondaryTool {
  platform: string;
  name: string;
  description: string;
  codeSnippet: string;
}

export const HIRE_SERVICES: CoreHireService[] = [
  {
    number: "01",
    title: "WATER NETWORK MODELLING & HYDRAULIC ANALYSIS",
    tagline: "WaterGEMS hydraulic network simulation, DMA development, pressure & velocity optimization.",
    capabilities: [
      "Khulna Water Supply Project Phase-2: Network modeling for 135 MLD Bangabandhu WTP & 15 MLD Afil Gate WTP",
      "Hydraulic network analysis, 385 ML impounding reservoirs, CWR & OHT facilities",
      "24-hour pressurized distribution network design (maintaining >=1-bar target pressure)",
      "Coordinating WaterGEMS models with GIS, survey data, and AutoCAD detailed drawings",
      "Pipe sizing analysis for distribution mains (HDPE Ø75-400mm) and transmission mains (up to Ø2000mm DI)"
    ],
    visualPreviews: [
      { label: "HYDRAULIC MODEL", type: "model", image: heroWaterImg },
      { label: "PRESSURE MAP", type: "profile", image: civil3dCorridorImg },
      { label: "WTP LAYOUT", type: "detail", image: cadChamberImg }
    ]
  },
  {
    number: "02",
    title: "AUTOCAD DETAILED WATER INFRASTRUCTURE DRAWINGS",
    tagline: "Comprehensive 2D working drawings for DWASA, KWASA, UNICEF, and DPHE projects.",
    capabilities: [
      "Plan, profile, section & standard detail drawings showing pipeline alignment, chainage, invert levels & flow direction",
      "Standard drawings for Gate Valve, Air Release Valve, Washout, and Water Meter chambers",
      "Surface Water Injection Point (SWIP) and Inter-DMA connection chambers",
      "Trenchless crossings for bridges, culverts, drains, roads, and rail lines",
      "Production Tubewell (PTW) compound layouts, pump houses & equipment placement plans"
    ],
    visualPreviews: [
      { label: "CHAMBER DETAIL", type: "detail", image: cadChamberImg },
      { label: "TRENCHLESS XING", type: "plan", image: cadChamberImg },
      { label: "PTW COMPOUND", type: "section", image: buildingRevitImg }
    ]
  },
  {
    number: "03",
    title: "MEGA TRANSMISSION PIPELINES (UP TO Ø2000MM DI)",
    tagline: "Padma (Jashaldia) WTP and DESWSP high-volume raw & treated water transmission mains.",
    capabilities: [
      "Padma (Jashaldia) WTP Volume Water Transmission Pipeline: Ø2000mm ductile iron (DI) pipe profiles",
      "Longitudinal profiles showing existing ground level, pipe invert level, cover depth, and chainages",
      "Thrust block structural designs, air valve stands, and washout scour chamber integration",
      "Utility clash detection, clearance verification, and road crossing sleeves"
    ],
    visualPreviews: [
      { label: "Ø2000MM DI PROFILE", type: "profile", image: civil3dCorridorImg },
      { label: "THRUST RESTRAINT", type: "detail", image: cadChamberImg },
      { label: "PIPELINE CORRIDOR", type: "plan", image: heroWaterImg }
    ]
  },
  {
    number: "04",
    title: "CIVIL 3D ALIGNMENTS & DYNAMIC PROFILES",
    tagline: "Surface models, pipeline alignments, dynamic profiles, and pipe network catalog sets.",
    capabilities: [
      "Dynamic longitudinal profiles integrated with survey digital terrain models (DTM)",
      "Band sets configuration: Existing Ground Level, Design Invert Level, Cut/Fill Depth, Stationing",
      "Deflection angle, horizontal bend schedule, and trench cross-sectional geometry",
      "Civil 3D training received directly at Institute of Water Modelling (IWM)"
    ],
    visualPreviews: [
      { label: "CIVIL 3D PROFILE", type: "profile", image: civil3dCorridorImg },
      { label: "SURFACE MODEL", type: "model", image: heroWaterImg },
      { label: "CROSS SECTION", type: "detail", image: cadChamberImg }
    ]
  },
  {
    number: "05",
    title: "GIS & MAPPING (ARCGIS & QGIS)",
    tagline: "Water distribution network GIS mapping, nodal pressure maps, and shapefile database creation.",
    capabilities: [
      "DPHE Rural Water Schemes across 80 upazilas & 18 districts: 3 map series (WDN Map, Nodal Pressure Map, Index Map)",
      "PTW location mapping within 7km pipe network buffer and topographic feature overlay",
      "Spatial data integration between AutoCAD, GIS shapefiles, and WaterGEMS models",
      "QGIS and ArcGIS spatial analysis for refugee camp water infrastructure in Cox's Bazar"
    ],
    visualPreviews: [
      { label: "GIS WDN MAP", type: "plan", image: heroWaterImg },
      { label: "PRESSURE MAP", type: "profile", image: civil3dCorridorImg },
      { label: "INDEX MAP", type: "detail", image: cadChamberImg }
    ]
  },
  {
    number: "06",
    title: "TECHNICAL DOCUMENTATION, BOQ & ESTIMATION",
    tagline: "Node & pipe summaries, fittings schedule, and comprehensive project registers.",
    capabilities: [
      "Node & pipe summaries compiling pipe lengths by diameter, SDR rating, and material",
      "Fittings schedules (bends, tees, reducers, gate valves, dismantling joints)",
      "Chamber excavation, RCC concrete, and reinforcement quantity take-offs in MS Excel",
      "Tender and bid drawing package coordination for UNICEF, ADB, and World Bank submittals"
    ],
    visualPreviews: [
      { label: "PIPE SCHEDULE", type: "report" },
      { label: "FITTINGS SUMMARY", type: "report" },
      { label: "BID DOCUMENTATION", type: "report" }
    ]
  }
];

export const TOOLS_I_USE: SoftwareTool[] = [
  { name: "AutoCAD", tier: "Expert (Daily Use at IWM)", category: "primary", role: "Water network WDN, transmission mains (up to Ø2000mm), DMAs, standard chambers, crossings & PTW layouts" },
  { name: "Civil 3D", tier: "Trained at IWM", category: "primary", role: "Pipeline longitudinal profiles, existing/design invert levels, band sets, ground alignments" },
  { name: "WaterGEMS", tier: "Hydraulic Network Modeller", category: "hydraulic", role: "Khulna WASA Phase-2, Jhilmil, and Aftabnagar network hydraulic modeling & 24h pressure analysis" },
  { name: "ArcGIS & QGIS", tier: "GIS Specialist", category: "gis", role: "80 Upazila DPHE mapping (WDN, Nodal Pressure, Index Maps), spatial shapefile databases, Rohingya camps" },
  { name: "MS Excel", tier: "Expert", category: "primary", role: "BOQ quantity take-offs, pipe schedules, node summary, chamber concrete volume estimation" },
  { name: "MS Office Suite", tier: "Proficient", category: "primary", role: "Technical reporting, client submittals, drawing registers, and project coordination" }
];

export const SECONDARY_AUTOMATION_TOOLS: SecondaryTool[] = [
  {
    platform: "AutoCAD LSP",
    name: "AutoLISP Pipeline & Chamber Auto-Tagging",
    description: "Automated routine used for rapid annotation of pipe diameters (Ø75mm-Ø2000mm), invert levels, and DMA boundary lines.",
    codeSnippet: `(defun c:TAGPIPE ()
  (setq ent (car (entsel "\\nSelect Pipeline: ")))
  (command "-LAYER" "M" "C-WATR-TEXT" "")
  (command "_LEADER" (getpoint) (getpoint) "" "DI Ø2000mm | IL:+18.50m" "")
)`
  },
  {
    platform: "ArcGIS Python",
    name: "ArcGIS DMA Shapefile Attribute Calculator",
    description: "Python script for batch-calculating total pipe lengths by diameter across DMA zones and formatting KWASA/DWASA shapefile databases.",
    codeSnippet: `import arcpy
# Calculate total pipeline length by diameter per DMA
with arcpy.da.SearchCursor("Water_Mains", ["DMA_ID", "DIAMETER", "SHAPE@LENGTH"]) as cursor:
    for row in cursor:
        process_network_length(row[0], row[1], row[2])`
  },
  {
    platform: "WaterGEMS",
    name: "WaterGEMS to CAD Node Synchronizer",
    description: "Exports simulated nodal pressures and pipe velocity results to automated AutoCAD drawing callouts.",
    codeSnippet: `; Export WaterGEMS hydraulic results
; Direct node pressure annotation in DWG`
  }
];

export const SHORT_ABOUT = {
  paragraph1:
    "I am Md. Ayatullah Imani, a CAD Expert for Water Network Design and Network Modeller currently working at the Institute of Water Modelling (IWM) since 12 March 2022. I specialize in hydraulic network modeling with WaterGEMS, AutoCAD detailed engineering drawings for water supply infrastructure, and GIS mapping (ArcGIS/QGIS) for major national projects funded by UNICEF, World Bank, and the Asian Development Bank (ADB).",
  paragraph2:
    "My key project involvements include the Khulna Water Supply Project Phase-2 (WTPs, 385 ML impounding reservoirs, transmission mains), the Padma (Jashaldia) WTP Ø2000mm ductile iron transmission pipeline, DWSNIP DMA trenchless networks, and 80-upazila rural water supply schemes across Bangladesh. I hold an ongoing B.Sc. in Civil Engineering (AMIE, Dhaka), Diploma in Civil Engineering from Bogura Polytechnic Institute (2019), and am a registered member of IDEB (MIDEB: 72993)."
};

export const COMPACT_EXPERIENCE = [
  {
    role: "CAD Expert for Water Network Design",
    firm: "Institute of Water Modelling (IWM)",
    period: "12 March 2022 – Till Date",
    highlights: [
      "Serving as CAD Expert and Hydraulic Network Modeller on major government and international donor funded water projects across Bangladesh.",
      "Developed and updated WaterGEMS hydraulic models for Khulna WASA Water Supply Project Phase-2 (135 MLD Bangabandhu WTP, 15 MLD Afil Gate WTP, 385 ML impounding reservoir, CWR, and OHTs).",
      "Prepared AutoCAD detailed engineering drawings for large-diameter transmission mains (including Padma Jashaldia Ø2000mm DI pipeline) and distribution networks.",
      "Prepared standard detail drawings for SWIP chambers, gate valve chambers, air release valves, washouts, and trenchless crossings (bridge, culvert, drain, rail line).",
      "Coordinated hydraulic model information with GIS/network data, survey information, and AutoCAD drawing sets adhering to strict CAD layer discipline."
    ]
  },
  {
    role: "Trainee Engineer",
    firm: "Integrated Technology & Professionals (ITP)",
    period: "June 2019 – March 2022",
    highlights: [
      "Assisted in technical engineering drawing preparation, site surveys, and structural drafting.",
      "Prepared AutoCAD civil layouts, foundation details, and architectural sections.",
      "Collaborated with senior engineers on drafting compliance, layer conventions, and quantity estimation."
    ]
  }
];

export const EDUCATION_COMPACT = [
  {
    degree: "B. Sc. in Civil Engineering",
    institution: "Associate Membership of the Institution of Engineers (AMIE), Dhaka, Bangladesh",
    year: "Ongoing",
    details: "Advanced structural and water resources engineering curriculum."
  },
  {
    degree: "Diploma in Civil Engineering",
    institution: "Bogura Polytechnic Institute (BPI), Bogura, Bangladesh",
    year: "2019",
    details: "Four-year government diploma program covering structural analysis, surveying, hydraulics, and civil drafting."
  }
];

export const TRAINING_COMPACT = [
  {
    title: "Water Network Design using AutoCAD & GIS",
    provider: "Institute of Water Modelling (IWM)",
    period: "March 2022 to Till Date",
    details: "In-house training on water distribution network design, GIS mapping, and hydraulic simulation."
  },
  {
    title: "Civil 3D Professional Training",
    provider: "Institute of Water Modelling (IWM)",
    details: "Specialized training on surface models, alignments, dynamic pipe profiles, and band sets."
  },
  {
    title: "AutoCAD Professional Training",
    provider: "Bogura Polytechnic Institute (BPI)",
    details: "Comprehensive 2D & 3D drafting, layer standards, and construction documentation."
  },
  {
    title: "Industrial Training",
    provider: "Roads and Highway Department (RHD), Bogura",
    details: "Practical road alignment surveys, cross-section profiling, and pavement construction."
  }
];

export const LANGUAGE_PROFICIENCY = [
  { language: "Bangla", speaking: "Mother tongue", reading: "Good", writing: "Good" },
  { language: "English", speaking: "Fair", reading: "Good", writing: "Good" }
];
