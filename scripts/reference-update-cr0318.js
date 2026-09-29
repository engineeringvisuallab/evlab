const fs = require('fs');
const path = require('path');

console.log('Starting CR-03.18 Civil Engineering Technology & Digital Construction Update...');

// 1. REGISTRY ADDITIONS

const newKnowledge = {
  "construction-technology-knowledge": {
    "id": "construction-technology-knowledge",
    "name": "Construction Technology & Methods",
    "domain": "Civil Engineering Technology",
    "description": "Modern construction equipment, methods, productivity metrics, field execution technologies, and construction process optimization."
  },
  "construction-automation-robotics-knowledge": {
    "id": "construction-automation-robotics-knowledge",
    "name": "Construction Automation & Robotics",
    "domain": "Civil Engineering Technology",
    "description": "Automated construction equipment, robotic fabrication, bricklaying/tying robotics, and machine-control site automation."
  },
  "digital-construction-management-knowledge": {
    "id": "digital-construction-management-knowledge",
    "name": "Digital Construction Management",
    "domain": "Digital Construction",
    "description": "Cloud-based project controls, digital field workflows, mobile documentation, real-time progress tracking, and site communication systems."
  },
  "bim-methodology-knowledge": {
    "id": "bim-methodology-knowledge",
    "name": "BIM Methodology & Information Management",
    "domain": "BIM & Digital Engineering",
    "description": "Building Information Modeling principles, parametric design, LOD definitions, EIR/BEP requirements, and collaborative digital delivery."
  },
  "openbim-interoperability-knowledge": {
    "id": "openbim-interoperability-knowledge",
    "name": "OpenBIM & Interoperability Standards",
    "domain": "BIM & Digital Engineering",
    "description": "openBIM standards, Industry Foundation Classes (IFC), BCF collaboration format, and vendor-neutral data exchange."
  },
  "infrastructure-bim-knowledge": {
    "id": "infrastructure-bim-knowledge",
    "name": "Infrastructure BIM Modeling",
    "domain": "Infrastructure Engineering",
    "description": "3D civil information models for highways, bridges, railways, tunnels, utilities, and linear infrastructure systems."
  },
  "highway-railway-bim-knowledge": {
    "id": "highway-railway-bim-knowledge",
    "name": "Highway & Railway Infrastructure BIM",
    "domain": "Transportation Infrastructure",
    "description": "Parametric corridor modeling, track alignment BIM, station integration, and transportation infrastructure digital delivery."
  },
  "utility-bim-modeling-knowledge": {
    "id": "utility-bim-modeling-knowledge",
    "name": "Subsurface Utility BIM Modeling",
    "domain": "Infrastructure Engineering",
    "description": "Subsurface utility engineering (SUE) models, pipe network clash detection, utility asset modeling, and GIS-BIM mapping."
  },
  "bim-coordination-clash-detection-knowledge": {
    "id": "bim-coordination-clash-detection-knowledge",
    "name": "BIM Coordination & Clash Detection",
    "domain": "BIM & Digital Engineering",
    "description": "Multidisciplinary model federation, spatial clash detection, hard/soft clash analysis, and BIM issue tracking workflows."
  },
  "model-federation-quality-knowledge": {
    "id": "model-federation-quality-knowledge",
    "name": "Model Federation & Quality Assurance",
    "domain": "BIM & Digital Engineering",
    "description": "Combining discipline-specific models into unified federated files, quality assurance checking, and model compliance auditing."
  },
  "field-to-office-data-knowledge": {
    "id": "field-to-office-data-knowledge",
    "name": "Field-to-Office Data Workflows",
    "domain": "Digital Construction",
    "description": "Mobile site inspection applications, cloud data synchronization, digital punch lists, and real-time site reporting."
  },
  "four-d-bim-scheduling-knowledge": {
    "id": "four-d-bim-scheduling-knowledge",
    "name": "4D BIM & Construction Scheduling",
    "domain": "Digital Construction",
    "description": "Integration of 3D BIM elements with Primavera P6/MS Project time schedules for 4D visual planning and schedule simulation."
  },
  "construction-sequencing-simulation-knowledge": {
    "id": "construction-sequencing-simulation-knowledge",
    "name": "Construction Sequencing & Logistics Simulation",
    "domain": "Digital Construction",
    "description": "Visualizing construction logistics, equipment movement, crane reach, spatial site constraints, and time-lapse simulations."
  },
  "five-d-bim-cost-engineering-knowledge": {
    "id": "five-d-bim-cost-engineering-knowledge",
    "name": "5D BIM & Cost Engineering",
    "domain": "Digital Construction",
    "description": "Linking model geometry to cost breakdown structures, automated quantity takeoff, 5D cash flow modeling, and budget control."
  },
  "model-based-estimating-knowledge": {
    "id": "model-based-estimating-knowledge",
    "name": "Model-Based Cost Estimating",
    "domain": "Quantity Surveying",
    "description": "Parametric cost estimating, automated measurement rules, unit rate linkage, and design option cost comparisons."
  },
  "digital-quantity-surveying-knowledge": {
    "id": "digital-quantity-surveying-knowledge",
    "name": "Digital Quantity Surveying",
    "domain": "Quantity Surveying",
    "description": "Automated digital measurement, model-based bill of quantities (BOQ) generation, and contractor interim payment validation."
  },
  "automated-boq-generation-knowledge": {
    "id": "automated-boq-generation-knowledge",
    "name": "Automated BOQ Takeoff & Measurement",
    "domain": "Quantity Surveying",
    "description": "Mapping model object properties to standard method of measurement (SMM/CESMM) items for automated BOQ creation."
  },
  "robotic-construction-methods-knowledge": {
    "id": "robotic-construction-methods-knowledge",
    "name": "Robotic Construction Methods",
    "domain": "Construction Robotics",
    "description": "Robotic concrete printing, 3D masonry placement, automated rebar tying, and autonomous earthmoving equipment operations."
  },
  "reality-capture-point-cloud-knowledge": {
    "id": "reality-capture-point-cloud-knowledge",
    "name": "Reality Capture & Point Cloud Processing",
    "domain": "Geospatial & Site Digitization",
    "description": "Terrestrial laser scanning, LiDAR point clouds, photogrammetry mesh reconstruction, and as-built feature extraction."
  },
  "machine-control-guidance-knowledge": {
    "id": "machine-control-guidance-knowledge",
    "name": "Machine Control & Heavy Civil Guidance",
    "domain": "Digital Surveying",
    "description": "3D automatic machine guidance (AMG) for excavators, dozers, and graders using GNSS and total station positioning."
  },
  "construction-iot-telemetry-knowledge": {
    "id": "construction-iot-telemetry-knowledge",
    "name": "Construction IoT & Site Telemetry",
    "domain": "Smart Site Technology",
    "description": "Internet of Things (IoT) sensors, equipment telematics, environmental monitors, wearable worker safety devices, and real-time site telemetry."
  },
  "construction-ai-predictive-analytics-knowledge": {
    "id": "construction-ai-predictive-analytics-knowledge",
    "name": "Construction AI & Predictive Analytics",
    "domain": "Artificial Intelligence",
    "description": "Machine learning algorithms for construction delay prediction, cost overrun estimation, safety risk scoring, and productivity modeling."
  },
  "generative-design-machine-learning-knowledge": {
    "id": "generative-design-machine-learning-knowledge",
    "name": "Generative Design & Machine Learning",
    "domain": "Artificial Intelligence",
    "description": "AI-driven generative site layout optimization, automated structural sizing, and algorithmic design exploration."
  },
  "computer-vision-site-inspection-knowledge": {
    "id": "computer-vision-site-inspection-knowledge",
    "name": "Computer Vision Site Inspection",
    "domain": "Artificial Intelligence",
    "description": "Computer vision for automated progress tracking, visual defect detection, PPE safety compliance monitoring, and video surveillance."
  },
  "automated-defect-detection-knowledge": {
    "id": "automated-defect-detection-knowledge",
    "name": "Automated Defect & Anomaly Detection",
    "domain": "Artificial Intelligence",
    "description": "AI visual analysis of concrete cracks, steel corrosion, masonry spalling, and geometric construction deviations."
  },
  "infrastructure-digital-twin-knowledge": {
    "id": "infrastructure-digital-twin-knowledge",
    "name": "Civil Infrastructure Digital Twins",
    "domain": "Digital Twins",
    "description": "Dynamic digital replicas of physical infrastructure integrated with IoT sensor telemetry for real-time lifecycle operational monitoring."
  },
  "construction-data-analytics-knowledge": {
    "id": "construction-data-analytics-knowledge",
    "name": "Construction Data Engineering & Analytics",
    "domain": "Data Engineering",
    "description": "Construction data pipelines, SQL/Python ETL, executive Power BI dashboards, schedule variance analysis, and key performance indicators."
  },
  "project-data-warehousing-knowledge": {
    "id": "project-data-warehousing-knowledge",
    "name": "Project Data Warehousing & Intelligence",
    "domain": "Data Engineering",
    "description": "Centralized construction data repositories, schema design, cross-project data integration, and historical benchmark analytics."
  },
  "extended-reality-construction-knowledge": {
    "id": "extended-reality-construction-knowledge",
    "name": "Extended Reality (XR) in Construction",
    "domain": "Visualization & XR",
    "description": "Augmented reality (AR), virtual reality (VR), and mixed reality (MR) for immersive design review, spatial overlay, and safety training."
  },
  "ar-vr-spatial-computing-knowledge": {
    "id": "ar-vr-spatial-computing-knowledge",
    "name": "AR/VR Spatial Computing",
    "domain": "Visualization & XR",
    "description": "Head-mounted displays, site AR overlay, holographic model projection, and multi-user virtual design walkthroughs."
  },
  "prefabrication-dfma-knowledge": {
    "id": "prefabrication-dfma-knowledge",
    "name": "Prefabrication & DfMA Principles",
    "domain": "Industrialized Construction",
    "description": "Design for Manufacture and Assembly (DfMA) principles, volumetric modular units, off-site factory production, and modular logistics."
  },
  "modular-industrialized-construction-knowledge": {
    "id": "modular-industrialized-construction-knowledge",
    "name": "Modular & Industrialized Construction",
    "domain": "Industrialized Construction",
    "description": "Precast concrete systems, light gauge steel pods, kit-of-parts assembly, factory QA/QC, and industrialized building delivery."
  },
  "advanced-construction-materials-knowledge": {
    "id": "advanced-construction-materials-knowledge",
    "name": "Advanced Construction Materials",
    "domain": "Materials Science",
    "description": "Ultra-high-performance concrete (UHPC), 3D concrete printing mixes, self-healing materials, smart composites, and carbon-neutral binders."
  },
  "3d-concrete-printing-materials-knowledge": {
    "id": "3d-concrete-printing-materials-knowledge",
    "name": "3D Concrete Printing Materials Science",
    "domain": "Materials Science",
    "description": "Rheology, pumpability, extrudability, buildability, and setting characteristics of printable cementitious mortars."
  },
  "digital-asset-management-knowledge": {
    "id": "digital-asset-management-knowledge",
    "name": "Digital Asset Management & Handover",
    "domain": "Lifecycle Asset Management",
    "description": "Asset information models (AIM), ISO 55000 asset management frameworks, digital handover requirements, and lifecycle maintenance data."
  },
  "cobie-digital-handover-knowledge": {
    "id": "cobie-digital-handover-knowledge",
    "name": "COBie & Facilities Data Handover",
    "domain": "Lifecycle Asset Management",
    "description": "COBie spreadsheet structure, spatial and asset data drops, equipment warranty mapping, and CMMS/CAFM system integration."
  }
};

const newSkills = {
  "construction-technology-optimization-skill": {
    "id": "construction-technology-optimization-skill",
    "name": "Construction Technology Optimization",
    "category": "Field Technology",
    "description": "Selecting, implementing, and optimizing modern construction equipment, field automation tools, and technology-driven site workflows."
  },
  "construction-automation-skill": {
    "id": "construction-automation-skill",
    "name": "Construction Automation Setup",
    "category": "Automation & Robotics",
    "description": "Operating and configuring automated construction machinery, robotic fabrication setups, and digital site execution equipment."
  },
  "digital-site-operations-skill": {
    "id": "digital-site-operations-skill",
    "name": "Digital Site Operations Management",
    "category": "Digital Construction",
    "description": "Managing mobile field data collection, digital progress tracking, cloud documentation, and real-time site communication."
  },
  "bim-modelling-skill": {
    "id": "bim-modelling-skill",
    "name": "Multidisciplinary BIM Modeling",
    "category": "BIM & VDC",
    "description": "Creating accurate 3D parametric BIM models in Revit/Civil 3D with appropriate geometry, parameters, and LOD standards."
  },
  "bim-execution-planning-skill": {
    "id": "bim-execution-planning-skill",
    "name": "BIM Execution Planning",
    "category": "BIM & VDC",
    "description": "Drafting BIM Execution Plans (BEP), defining Exchange Information Requirements (EIR), LOD matrices, and coordination protocols."
  },
  "bim-information-management-skill": {
    "id": "bim-information-management-skill",
    "name": "BIM Information Management",
    "category": "BIM & VDC",
    "description": "Managing project Common Data Environments (CDE), information delivery tables, attribute validation, and ISO 19650 compliance."
  },
  "infrastructure-bim-modeling-skill": {
    "id": "infrastructure-bim-modeling-skill",
    "name": "Infrastructure BIM Modeling",
    "category": "Civil Design",
    "description": "Developing parametric civil information models for highways, railways, bridges, tunnels, and subsurface utility networks."
  },
  "bim-coordination-clash-detection-skill": {
    "id": "bim-coordination-clash-detection-skill",
    "name": "BIM Coordination & Clash Detection",
    "category": "BIM & VDC",
    "description": "Performing automated clash detection, spatial coordination, clash matrix setup, and clash resolution in Navisworks/Solibri."
  },
  "model-federation-issue-tracking-skill": {
    "id": "model-federation-issue-tracking-skill",
    "name": "Model Federation & Issue Tracking",
    "category": "BIM & VDC",
    "description": "Federating multidisciplinary models, conducting visual design reviews, and managing BCF issue tracking workflows."
  },
  "digital-construction-management-skill": {
    "id": "digital-construction-management-skill",
    "name": "Digital Construction Management",
    "category": "Digital Construction",
    "description": "Overseeing cloud project controls, mobile QA/QC, field inspection workflows, and digital construction site administration."
  },
  "construction-data-integration-skill": {
    "id": "construction-data-integration-skill",
    "name": "Construction Data Integration",
    "category": "Digital Construction",
    "description": "Connecting site survey data, BIM model geometry, scheduling data, and cost records into unified digital project dashboards."
  },
  "four-d-bim-construction-planning-skill": {
    "id": "four-d-bim-construction-planning-skill",
    "name": "4D BIM & Schedule Simulation",
    "category": "Project Planning",
    "description": "Linking 3D BIM models with time schedules in Synchro or Navisworks to create visual 4D construction sequencing simulations."
  },
  "five-d-cost-integration-skill": {
    "id": "five-d-cost-integration-skill",
    "name": "5D Cost Model Integration",
    "category": "Cost Engineering",
    "description": "Integrating 3D model geometry with cost breakdown structures for automated 5D estimating, cash flow modeling, and budget control."
  },
  "digital-quantity-takeoff-skill": {
    "id": "digital-quantity-takeoff-skill",
    "name": "Digital Quantity Takeoff",
    "category": "Quantity Surveying",
    "description": "Extracting precise material quantities from 3D BIM models and 2D digital drawings using CostX or Bluebeam Revu."
  },
  "boq-cost-estimating-skill": {
    "id": "boq-cost-estimating-skill",
    "name": "Automated BOQ & Cost Estimating",
    "category": "Quantity Surveying",
    "description": "Mapping digital quantities to standard bill of quantities (BOQ) line items and applying unit rates for construction cost estimation."
  },
  "robotic-fabrication-control-skill": {
    "id": "robotic-fabrication-control-skill",
    "name": "Robotic Fabrication & Machine Operation",
    "category": "Automation & Robotics",
    "description": "Programming and operating robotic arms, gantry concrete printers, and automated fabrication machinery on construction sites."
  },
  "reality-capture-processing-skill": {
    "id": "reality-capture-processing-skill",
    "name": "Reality Capture & Point Cloud Processing",
    "category": "Geospatial",
    "description": "Processing laser scan point clouds, UAV drone photogrammetry imagery, and generating dense 3D mesh models."
  },
  "point-cloud-to-bim-skill": {
    "id": "point-cloud-to-bim-skill",
    "name": "Point Cloud to BIM Reconstruction",
    "category": "Geospatial & BIM",
    "description": "Registering point cloud data, extracting feature geometry, and modeling accurate as-built BIM geometry from point clouds."
  },
  "uav-photogrammetry-skill": {
    "id": "uav-photogrammetry-skill",
    "name": "UAV Drone Photogrammetry",
    "category": "Geospatial",
    "description": "Planning UAV flight paths, capturing aerial imagery, processing photogrammetric orthomosaics, and generating digital elevation models."
  },
  "machine-control-setup-skill": {
    "id": "machine-control-setup-skill",
    "name": "3D Machine Control Calibration",
    "category": "Digital Surveying",
    "description": "Calibrating 3D digital terrain models and GNSS/total station positioning systems for automated earthmoving equipment guidance."
  },
  "robotic-total-station-surveying-skill": {
    "id": "robotic-total-station-surveying-skill",
    "name": "Robotic Total Station Surveying",
    "category": "Digital Surveying",
    "description": "Operating robotic total stations and GNSS rovers for automated construction layout staking and precision setting out."
  },
  "iot-construction-monitoring-skill": {
    "id": "iot-construction-monitoring-skill",
    "name": "IoT Site Sensor Monitoring",
    "category": "Smart Technology",
    "description": "Installing, configuring, and monitoring IoT sensors for structural movement, environmental conditions, and equipment tracking."
  },
  "sensor-data-telemetry-skill": {
    "id": "sensor-data-telemetry-skill",
    "name": "Sensor Data Telemetry Analytics",
    "category": "Smart Technology",
    "description": "Ingesting, processing, and analyzing real-time site sensor telemetry and equipment health data streams."
  },
  "construction-ai-modeling-skill": {
    "id": "construction-ai-modeling-skill",
    "name": "Construction AI Predictive Modeling",
    "category": "AI & Machine Learning",
    "description": "Training and deploying machine learning models for construction delay prediction, cost variance estimation, and risk scoring."
  },
  "computer-vision-inspection-skill": {
    "id": "computer-vision-inspection-skill",
    "name": "Computer Vision Visual Inspection",
    "category": "AI & Machine Learning",
    "description": "Developing and applying computer vision models for automated visual defect detection, PPE compliance, and site progress tracking."
  },
  "defect-detection-image-processing-skill": {
    "id": "defect-detection-image-processing-skill",
    "name": "Automated Image Defect Detection",
    "category": "AI & Machine Learning",
    "description": "Analyzing site imagery to detect concrete cracking, surface spalling, rebar displacement, and structural anomalies."
  },
  "construction-data-analytics-skill": {
    "id": "construction-data-analytics-skill",
    "name": "Construction Data Analytics",
    "category": "Data Engineering",
    "description": "Querying, cleaning, and visualizing construction performance datasets to generate operational insights and executive reports."
  },
  "dashboard-data-pipeline-skill": {
    "id": "dashboard-data-pipeline-skill",
    "name": "Data Pipeline & Dashboard Development",
    "category": "Data Engineering",
    "description": "Building ETL data pipelines and interactive Power BI/Tableau dashboards for project schedule, cost, and safety KPIs."
  },
  "xr-construction-visualization-skill": {
    "id": "xr-construction-visualization-skill",
    "name": "Extended Reality (XR) Scene Authoring",
    "category": "Visualization & XR",
    "description": "Authoring augmented, virtual, and mixed reality interactive scenes for immersive site walkthroughs and design review."
  },
  "immersive-design-review-skill": {
    "id": "immersive-design-review-skill",
    "name": "Immersive Virtual Design Review",
    "category": "Visualization & XR",
    "description": "Conducting multi-user virtual design reviews and holographic site overlays using AR/VR headsets."
  },
  "dfma-modular-design-skill": {
    "id": "dfma-modular-design-skill",
    "name": "DfMA Modular Structural Design",
    "category": "Industrialized Construction",
    "description": "Designing prefabricated structural components, volumetric modules, and precast assemblies adhering to DfMA rules."
  },
  "precast-modular-logistics-skill": {
    "id": "precast-modular-logistics-skill",
    "name": "Modular Logistics & Erection Planning",
    "category": "Industrialized Construction",
    "description": "Planning off-site factory fabrication schedules, transport logistics, crane hoisting, and modular erection sequences."
  },
  "advanced-material-testing-skill": {
    "id": "advanced-material-testing-skill",
    "name": "Advanced Construction Materials Testing",
    "category": "Materials Testing",
    "description": "Performing material characterization tests on UHPC, 3D concrete printing pastes, smart composites, and innovative materials."
  },
  "3d-concrete-mix-design-skill": {
    "id": "3d-concrete-mix-design-skill",
    "name": "3D Concrete Printing Mix Design",
    "category": "Materials Design",
    "description": "Formulating, testing, and optimizing cementitious mortar mix designs for 3D printing extrudability and early structural strength."
  },
  "digital-asset-management-skill": {
    "id": "digital-asset-management-skill",
    "name": "Digital Asset & Facilities Data Management",
    "category": "Asset Operations",
    "description": "Configuring Asset Information Models (AIM), managing digital asset handovers, and integrating COBie data into CAFM/CMMS."
  },
  "cobie-data-validation-skill": {
    "id": "cobie-data-validation-skill",
    "name": "COBie Data Validation & Integration",
    "category": "Asset Operations",
    "description": "Validating COBie data drops for completeness, verifying equipment parameter attributes, and mapping asset data to facility standards."
  }
};

const newSoftware = {
  "solibri-model-checker": {
    "id": "solibri-model-checker",
    "name": "Solibri Model Checker",
    "category": "BIM Quality & Rule Checking",
    "description": "Automated BIM validation, rule-based checking, clash analysis, and accessibility compliance checking tool."
  },
  "bentley-itwin": {
    "id": "bentley-itwin",
    "name": "Bentley iTwin Platform",
    "category": "Digital Twin & Asset Analytics",
    "description": "Open cloud platform for creating, visualizing, and analyzing digital twins of infrastructure assets."
  },
  "opencv-platform": {
    "id": "opencv-platform",
    "name": "OpenCV",
    "category": "Computer Vision & AI",
    "description": "Open-source computer vision and machine learning software library for image processing and visual inspection."
  },
  "unreal-engine": {
    "id": "unreal-engine",
    "name": "Unreal Engine",
    "category": "Visualization & XR",
    "description": "Real-time 3D creation tool used for immersive construction visualization, digital twins, and virtual reality reviews."
  },
  "unity": {
    "id": "unity",
    "name": "Unity 3D",
    "category": "Visualization & XR",
    "description": "Real-time development engine used for AR/VR applications, interactive digital twins, and virtual construction site simulations."
  },
  "power-bi": {
    "id": "power-bi",
    "name": "Microsoft Power BI",
    "category": "Business Intelligence & Analytics",
    "description": "Business analytics service for creating interactive dashboards and project data analytics reports."
  },
  "twinmotion": {
    "id": "twinmotion",
    "name": "Twinmotion",
    "category": "Real-Time Rendering & XR",
    "description": "Real-time 3D architectural visualization tool for high-quality renderings and VR construction walkthroughs."
  },
  "enscape": {
    "id": "enscape",
    "name": "Enscape",
    "category": "Real-Time Rendering & XR",
    "description": "Real-time rendering and virtual reality plugin for Revit, Civil 3D, and Rhino for instant design review."
  }
};

const newStandards = {
  "iso-12006-building-construction-info": {
    "id": "iso-12006-building-construction-info",
    "name": "ISO 12006 Building Construction — Organization of Information",
    "organization": "ISO",
    "description": "Standard for framework and classification systems for construction information and digital libraries."
  },
  "cobie-standard": {
    "id": "cobie-standard",
    "name": "Construction-Operations Building Information Exchange (COBie)",
    "organization": "buildingSMART / NBIMS",
    "description": "International standard specification for transferring facility asset information from construction to operations."
  }
};

const newWorkflows = {
  "construction-technology-optimization-workflow": {
    "id": "construction-technology-optimization-workflow",
    "name": "Construction Technology Audit & Optimization",
    "category": "Digital Construction",
    "description": "Process for auditing site operations, selecting appropriate digital technologies, piloting tools, and scaling construction technology adoption."
  },
  "digital-site-monitoring-workflow": {
    "id": "digital-site-monitoring-workflow",
    "name": "Digital Site Progress Monitoring",
    "category": "Digital Construction",
    "description": "Daily field data collection using mobile apps, UAV survey capture, automated upload to cloud platforms, and progress dashboard updating."
  },
  "bim-execution-planning-workflow": {
    "id": "bim-execution-planning-workflow",
    "name": "BIM Execution Plan (BEP) Authoring",
    "category": "BIM Management",
    "description": "Standardized process for defining project BIM goals, drafting BEP, setting LOD requirements, establishing CDE, and locking coordination rules."
  },
  "bim-implementation-workflow": {
    "id": "bim-implementation-workflow",
    "name": "Organizational BIM Implementation Workflow",
    "category": "BIM Management",
    "description": "Step-by-step organizational BIM adoption framework from setup and template creation to pilot project execution and team training."
  },
  "civil-3d-corridor-bim-workflow": {
    "id": "civil-3d-corridor-bim-workflow",
    "name": "Civil 3D Infrastructure Corridor BIM Workflow",
    "category": "Infrastructure BIM",
    "description": "Corridor modeling workflow in Civil 3D from alignment design and assembly definition to target mapping and 3D IFC export."
  },
  "model-federation-clash-detection-workflow": {
    "id": "model-federation-clash-detection-workflow",
    "name": "Model Federation & Automated Clash Detection",
    "category": "BIM Coordination",
    "description": "Aggregating discipline models in Navisworks/Solibri, running rule-based clash checks, grouping clashes, and assigning BCF issues."
  },
  "bim-coordination-review-workflow": {
    "id": "bim-coordination-review-workflow",
    "name": "BIM Multidisciplinary Coordination Review",
    "category": "BIM Coordination",
    "description": "Weekly coordination meeting workflow reviewing federated model clashes, tracking resolution status, and issuing design revisions."
  },
  "field-to-office-data-sync-workflow": {
    "id": "field-to-office-data-sync-workflow",
    "name": "Field-to-Office Cloud Synchronization",
    "category": "Digital Construction",
    "description": "Real-time synchronization of field inspection forms, site photos, safety observations, and RFI records to office cloud platforms."
  },
  "visual-construction-sequencing-workflow": {
    "id": "visual-construction-sequencing-workflow",
    "name": "4D Visual Construction Sequencing Workflow",
    "category": "4D BIM",
    "description": "Importing Primavera P6 schedules into Synchro 4D, linking schedule activities to BIM elements, and generating 4D animation videos."
  },
  "model-based-cost-estimating-workflow": {
    "id": "model-based-cost-estimating-workflow",
    "name": "5D Model-Based Cost Estimating Workflow",
    "category": "5D BIM",
    "description": "Extracting element quantities from 5D BIM models, linking quantities to rate breakdown databases, and calculating total cost."
  },
  "automated-boq-takeoff-workflow": {
    "id": "automated-boq-takeoff-workflow",
    "name": "Automated BOQ Takeoff Workflow",
    "category": "Quantity Surveying",
    "description": "Mapping 3D BIM object categories to standard method of measurement rules in CostX, generating automated BOQ, and auditing variances."
  },
  "digital-cost-estimation-workflow": {
    "id": "digital-cost-estimation-workflow",
    "name": "Digital Measurement & Cost Estimation Workflow",
    "category": "Quantity Surveying",
    "description": "Digital takeoff and cost estimation workflow combining 2D vector measurement, 3D model extraction, and rate database indexing."
  },
  "robotic-construction-execution-workflow": {
    "id": "robotic-construction-execution-workflow",
    "name": "Robotic Construction Field Execution",
    "category": "Construction Automation",
    "description": "Preparing 3D toolpath models, transferring code to robotic controllers, setting up site boundaries, and supervising robotic fabrication."
  },
  "automated-site-fabrication-workflow": {
    "id": "automated-site-fabrication-workflow",
    "name": "Automated Off-Site & On-Site Fabrication",
    "category": "Construction Automation",
    "description": "Off-site or on-site automated component fabrication workflow from parametric CAD model to CNC/robotic production."
  },
  "digital-earthwork-machine-control-workflow": {
    "id": "digital-earthwork-machine-control-workflow",
    "name": "3D Machine Control Earthwork Workflow",
    "category": "Digital Surveying",
    "description": "Exporting 3D grading surfaces from Civil 3D, uploading to machine control boxes, calibrating equipment GNSS, and automated grading."
  },
  "precision-site-staking-workflow": {
    "id": "precision-site-staking-workflow",
    "name": "Robotic Total Station Site Staking Workflow",
    "category": "Digital Surveying",
    "description": "Transferring CAD/BIM point files to robotic total stations, executing automated field layout, and verifying as-built tolerances."
  },
  "iot-sensor-telemetry-monitoring-workflow": {
    "id": "iot-sensor-telemetry-monitoring-workflow",
    "name": "IoT Site Sensor Telemetry Workflow",
    "category": "Smart Construction",
    "description": "Deploying wireless IoT sensor nodes on site, streaming telemetry data to cloud MQTT brokers, and triggering threshold alerts."
  },
  "construction-ai-predictive-modeling-workflow": {
    "id": "construction-ai-predictive-modeling-workflow",
    "name": "Construction AI Predictive Risk Modeling",
    "category": "AI in Construction",
    "description": "Extracting historical project schedule/cost data, training ML regression models, predicting project risk, and updating completion estimates."
  },
  "generative-design-optimization-workflow": {
    "id": "generative-design-optimization-workflow",
    "name": "Generative Design Optimization Workflow",
    "category": "AI in Construction",
    "description": "Defining design goals and performance constraints, running generative optimization algorithms, evaluating trade-off options, and selecting best design."
  },
  "computer-vision-quality-inspection-workflow": {
    "id": "computer-vision-quality-inspection-workflow",
    "name": "Computer Vision Quality Inspection Workflow",
    "category": "AI in Construction",
    "description": "Capturing site photographs/video, feeding images into trained vision models, identifying defects or missing elements, and logging QC tickets."
  },
  "automated-defect-detection-workflow": {
    "id": "automated-defect-detection-workflow",
    "name": "Automated Visual Defect Detection Workflow",
    "category": "AI in Construction",
    "description": "High-resolution camera capture, image pre-processing, convolutional neural network (CNN) feature analysis, crack width mapping, and reporting."
  },
  "infrastructure-digital-twin-lifecycle-workflow": {
    "id": "infrastructure-digital-twin-lifecycle-workflow",
    "name": "Infrastructure Digital Twin Lifecycle Workflow",
    "category": "Digital Twins",
    "description": "Linking design BIM models with real-time IoT sensor telemetry, GIS spatial context, and maintenance databases for continuous twin operations."
  },
  "construction-data-pipeline-analytics-workflow": {
    "id": "construction-data-pipeline-analytics-workflow",
    "name": "Construction Data Pipeline & ETL Workflow",
    "category": "Data Engineering",
    "description": "Extracting data from ERP, Primavera P6, and ACC via APIs, transforming schemas in Python/SQL, loading to data warehouse, and publishing dashboards."
  },
  "executive-dashboard-reporting-workflow": {
    "id": "executive-dashboard-reporting-workflow",
    "name": "Executive Project Performance Dashboard Workflow",
    "category": "Data Engineering",
    "description": "Automating weekly executive project performance reports featuring S-curves, cost variance, schedule variance, and safety KPIs."
  },
  "xr-immersive-design-review-workflow": {
    "id": "xr-immersive-design-review-workflow",
    "name": "XR Immersive Virtual Design Review Workflow",
    "category": "Visualization & XR",
    "description": "Converting BIM models for Unreal/Unity engine, staging interactive XR session, inviting remote stakeholders, and marking up model in VR."
  },
  "ar-site-overlay-inspection-workflow": {
    "id": "ar-site-overlay-inspection-workflow",
    "name": "AR Site Overlay Inspection Workflow",
    "category": "Visualization & XR",
    "description": "Loading 3D BIM model into mobile AR tablet/smartglasses, positioning model on site via QR targets, and conducting visual overlay inspection."
  },
  "dfma-modular-construction-workflow": {
    "id": "dfma-modular-construction-workflow",
    "name": "DfMA Modular Construction Workflow",
    "category": "Industrialized Construction",
    "description": "Designing standardized modular components, factory manufacturing under controlled conditions, transport logistics, and crane erection on site."
  },
  "precast-element-tracking-workflow": {
    "id": "precast-element-tracking-workflow",
    "name": "Precast Element RFID Tagging & Tracking Workflow",
    "category": "Industrialized Construction",
    "description": "Embedding RFID/QR tags in precast elements, tracking status from casting yard through transportation to site installation."
  },
  "advanced-material-characterization-workflow": {
    "id": "advanced-material-characterization-workflow",
    "name": "Advanced Construction Material Characterization",
    "category": "Materials Testing",
    "description": "Sampling new material formulations, conducting laboratory mechanical/durability testing, analyzing micro-structure, and certifying compliance."
  },
  "3d-printed-concrete-testing-workflow": {
    "id": "3d-printed-concrete-testing-workflow",
    "name": "3D Printed Concrete Rheology & Strength Testing",
    "category": "Materials Testing",
    "description": "Testing fresh-state printability, pumpability, layer buildability, and hardened anisotropic compressive/flexural strength."
  },
  "digital-asset-handover-workflow": {
    "id": "digital-asset-handover-workflow",
    "name": "Digital Asset Handover & AIM Delivery",
    "category": "Asset Management",
    "description": "Compiling validated Asset Information Models (AIM), COBie data drops, O&M manuals, and importing into client FM systems."
  },
  "cobie-data-extraction-workflow": {
    "id": "cobie-data-extraction-workflow",
    "name": "COBie Data Extraction & Validation Workflow",
    "category": "Asset Management",
    "description": "Extracting COBie Facility, Floor, Space, Zone, Type, Component, and Attribute tables from Revit models using automated exporter tools."
  }
};

const newProjects = {
  "dhaka-elevated-expressway-digital-construction-project": {
    "id": "dhaka-elevated-expressway-digital-construction-project",
    "name": "Dhaka Elevated Expressway Digital Construction Monitoring",
    "location": "Dhaka, Bangladesh",
    "type": "Infrastructure & Digital Construction",
    "description": "Implementation of 4D BIM, drone photogrammetry, and digital site management for a 19.73 km elevated highway corridor."
  },
  "matarbari-ultra-super-critical-power-project": {
    "id": "matarbari-ultra-super-critical-power-project",
    "name": "Matarbari Ultra Super Critical Power & Port Digital Infrastructure",
    "location": "Cox's Bazar, Bangladesh",
    "type": "Mega Infrastructure & Port",
    "description": "Complex industrial power plant and deep-sea port project utilizing 3D/4D BIM, clash detection, and digital quality management."
  },
  "hazrat-shahjalal-terminal-3-expansion-project": {
    "id": "hazrat-shahjalal-terminal-3-expansion-project",
    "name": "Hazrat Shahjalal International Airport Terminal 3 Expansion",
    "location": "Dhaka, Bangladesh",
    "type": "Aviation Infrastructure & BIM",
    "description": "Major airport expansion project integrating multidisciplinary BIM, 5D cost estimating, and cloud collaboration workflows."
  },
  "moghbazar-flyover-construction-project": {
    "id": "moghbazar-flyover-construction-project",
    "name": "Moghbazar-Mouchak Flyover Project",
    "location": "Dhaka, Bangladesh",
    "type": "Urban Flyover & Modular Construction",
    "description": "Urban flyover construction featuring precast segmental box girders, digital site surveying, and modular construction techniques."
  },
  "bangabandhu-tunnel-underground-project": {
    "id": "bangabandhu-tunnel-underground-project",
    "name": "Bangabandhu Sheikh Mujibur Rahman Tunnel (Karnaphuli Tunnel)",
    "location": "Chattogram, Bangladesh",
    "type": "Mega Tunnel & Digital Twin",
    "description": "First underwater river tunnel in South Asia, utilizing TBM telemetry, 3D tunnel BIM modeling, and digital twin monitoring."
  }
};

const newCareerRoles = {
  "construction-technology-engineer": {
    "id": "construction-technology-engineer",
    "title": "Construction Technology Engineer",
    "department": "Digital Construction / Site Operations",
    "description": "Evaluates, selects, and implements innovative construction technologies, automation equipment, and digital tools on site."
  },
  "digital-construction-engineer": {
    "id": "digital-construction-engineer",
    "title": "Digital Construction Engineer",
    "department": "Virtual Design & Construction (VDC)",
    "description": "Manages field-to-office digital workflows, mobile site data collection, 3D model utilization, and digital QA/QC procedures."
  },
  "bim-engineer": {
    "id": "bim-engineer",
    "title": "BIM Engineer",
    "department": "BIM / VDC",
    "description": "Develops 3D BIM models, manages parametric component libraries, and coordinates design information across engineering disciplines."
  },
  "bim-manager": {
    "id": "bim-manager",
    "title": "BIM Manager",
    "department": "BIM / VDC Leadership",
    "description": "Establishes organization-wide BIM execution plans, standards compliance, software infrastructure, and multidisciplinary delivery."
  },
  "bim-modeler": {
    "id": "bim-modeler",
    "title": "BIM Modeler",
    "department": "BIM / Design Production",
    "description": "Creates accurate 3D parametric geometry and embeds asset attribute data according to project LOD guidelines."
  },
  "digital-construction-manager": {
    "id": "digital-construction-manager",
    "title": "Digital Construction Manager",
    "department": "Construction Operations Management",
    "description": "Leads digital transformation across construction projects, overseeing BIM, field IoT, digital reporting, and data strategy."
  },
  "four-d-bim-engineer": {
    "id": "four-d-bim-engineer",
    "title": "4D BIM & Scheduling Engineer",
    "department": "Project Planning & Controls",
    "description": "Links 3D models with project schedules in Synchro or Navisworks to perform visual 4D construction simulations and delay analysis."
  },
  "five-d-bim-engineer": {
    "id": "five-d-bim-engineer",
    "title": "5D BIM & Cost Engineer",
    "department": "Cost Management & Estimating",
    "description": "Integrates 3D geometry with cost databases for automated quantity takeoff, 5D cost planning, and interim valuation."
  },
  "digital-quantity-surveyor": {
    "id": "digital-quantity-surveyor",
    "title": "Digital Quantity Surveyor",
    "department": "Quantity Surveying / Commercial",
    "description": "Utilizes CostX and BIM models for automated measurement, BOQ preparation, contractor payment verification, and cost audit."
  },
  "construction-automation-engineer": {
    "id": "construction-automation-engineer",
    "title": "Construction Automation & Robotics Engineer",
    "department": "Automation & R&D",
    "description": "Designs, deploys, and maintains robotic construction systems, automated site fabrication tools, and machine control systems."
  },
  "reality-capture-engineer": {
    "id": "reality-capture-engineer",
    "title": "Reality Capture Engineer",
    "department": "Geospatial & Surveying",
    "description": "Operates 3D laser scanners, UAV drones, and photogrammetry rigs to capture point clouds and build as-built digital site models."
  },
  "digital-surveying-machine-control-engineer": {
    "id": "digital-surveying-machine-control-engineer",
    "title": "Digital Surveying & Machine Guidance Engineer",
    "department": "Field Surveying & Heavy Civil",
    "description": "Sets up GNSS reference stations, robotic total stations, and 3D machine control systems on heavy earthmoving equipment."
  },
  "smart-construction-engineer": {
    "id": "smart-construction-engineer",
    "title": "Smart Construction & IoT Engineer",
    "department": "Site Technology & Telematics",
    "description": "Deploys IoT sensor networks, telematics, environmental monitors, and connected job site dashboards for real-time tracking."
  },
  "construction-data-analyst": {
    "id": "construction-data-analyst",
    "title": "Construction Data Analyst",
    "department": "Project Intelligence / Analytics",
    "description": "Analyzes construction productivity, schedule variance, cost performance, and safety metrics using Python, SQL, and Power BI."
  },
  "construction-ai-engineer": {
    "id": "construction-ai-engineer",
    "title": "Construction AI & Computer Vision Engineer",
    "department": "AI & Advanced Analytics",
    "description": "Develops machine learning algorithms and computer vision pipelines for automated defect detection, safety monitoring, and progress prediction."
  },
  "construction-xr-engineer": {
    "id": "construction-xr-engineer",
    "title": "Construction XR / VR / AR Specialist",
    "department": "Visualization & Immersive Tech",
    "description": "Creates AR/VR applications and spatial computing models for immersive design review, virtual site walkthroughs, and safety training."
  },
  "modular-construction-engineer": {
    "id": "modular-construction-engineer",
    "title": "Modular & Off-Site Construction Engineer",
    "department": "Industrialized Construction",
    "description": "Applies Design for Manufacture and Assembly (DfMA) principles to design, manufacture, and assemble prefabricated structural units."
  },
  "construction-materials-engineer": {
    "id": "construction-materials-engineer",
    "title": "Advanced Construction Materials Specialist",
    "department": "Materials Engineering & QC",
    "description": "Researches and tests high-performance concrete, 3D printing mixes, smart composites, and sustainable construction materials."
  },
  "digital-asset-manager": {
    "id": "digital-asset-manager",
    "title": "Digital Asset & Lifecycle Manager",
    "department": "Asset Operations & Facilities",
    "description": "Oversees COBie data drops, digital handover from construction to operations, and ISO 55000 asset management information systems."
  }
};

const newOrganizations = {
  "autodesk": {
    "id": "autodesk",
    "name": "Autodesk Inc.",
    "type": "AEC Software Provider",
    "location": "Global",
    "description": "Global leader in design, engineering, and digital construction software, developer of Revit, Civil 3D, and ACC."
  },
  "bentley-systems": {
    "id": "bentley-systems",
    "name": "Bentley Systems",
    "type": "Infrastructure Engineering Software",
    "location": "Global",
    "description": "Global provider of infrastructure engineering software and digital twin solutions including OpenRoads and iTwin."
  },
  "building-robotics-consortium": {
    "id": "building-robotics-consortium",
    "name": "International Association for Automation and Robotics in Construction (IAARC)",
    "type": "Professional Research Association",
    "location": "Global",
    "description": "Global organization dedicated to advancing robotics, automation, and digital technology in construction."
  },
  "trimble": {
    "id": "trimble",
    "name": "Trimble Inc.",
    "type": "Geospatial & Construction Technology",
    "location": "Global",
    "description": "Global technology company specializing in positioning systems, machine control, GNSS surveying, and field technology."
  }
};

const newCourses = {
  "construction-technology-innovation-course": {
    "id": "construction-technology-innovation-course",
    "title": "Construction Technology & Site Innovation Masterclass",
    "provider": "Professional Civil Engineering Academy",
    "description": "Mastery of modern construction technologies, field equipment automation, mobile tools, and technology adoption strategies."
  },
  "bim-fundamentals-iso19650-course": {
    "id": "bim-fundamentals-iso19650-course",
    "title": "BIM Methodology & ISO 19650 Information Management",
    "provider": "buildingSMART / ICE",
    "description": "Comprehensive training in BIM methodology, ISO 19650 principles, Common Data Environments, and collaborative project delivery."
  },
  "bim-coordination-clash-management-course": {
    "id": "bim-coordination-clash-management-course",
    "title": "BIM Coordination & Automated Clash Detection in Navisworks",
    "provider": "Autodesk Certified Training",
    "description": "Hands-on course in Navisworks model federation, automated clash detection matrix setup, issue tracking, and coordination management."
  },
  "digital-construction-management-masterclass": {
    "id": "digital-construction-management-masterclass",
    "title": "Digital Construction Management & Field Cloud Controls",
    "provider": "CIOB / ACC Academy",
    "description": "Advanced masterclass covering cloud project controls, field-to-office data integration, mobile QA/QC, and site digitisation."
  },
  "construction-automation-robotics-course": {
    "id": "construction-automation-robotics-course",
    "title": "Construction Automation & Site Robotics",
    "provider": "IAARC / Technical University",
    "description": "In-depth course on construction robotics, automated masonry/tying systems, 3D concrete printing, and site automation tech."
  },
  "machine-control-earthwork-course": {
    "id": "machine-control-earthwork-course",
    "title": "3D Machine Control & Precision Earthwork Guidance",
    "provider": "Trimble / Leica Academy",
    "description": "Practical training in 3D digital terrain modeling, GNSS setup, and automated machine guidance for heavy earthmoving machinery."
  },
  "ai-in-civil-engineering-masterclass": {
    "id": "ai-in-civil-engineering-masterclass",
    "title": "Artificial Intelligence & Machine Learning in Civil Engineering",
    "provider": "Deep Learning Civil Institute",
    "description": "Masterclass on applying machine learning, computer vision, predictive analytics, and generative design to civil engineering problems."
  },
  "computer-vision-construction-inspection-course": {
    "id": "computer-vision-construction-inspection-course",
    "title": "Computer Vision & Automated Construction Quality Inspection",
    "provider": "Geospatial AI Academy",
    "description": "Practical training in training deep learning models (YOLO, CNNs) for site defect detection, safety monitoring, and progress tracking."
  },
  "construction-data-analytics-course": {
    "id": "construction-data-analytics-course",
    "title": "Construction Data Engineering & Power BI Analytics",
    "provider": "Project Controls Institute",
    "description": "Hands-on data analytics course covering SQL, Python ETL, Power BI dashboard design, and construction KPI modeling."
  },
  "extended-reality-construction-course": {
    "id": "extended-reality-construction-course",
    "title": "Extended Reality (AR/VR/MR) for Virtual Construction Review",
    "provider": "Unity / Unreal Engine AEC Training",
    "description": "Course on converting BIM models to AR/VR interactive experiences using Unreal Engine, Unity, Twinmotion, and AR tablets."
  },
  "prefabrication-modular-construction-course": {
    "id": "prefabrication-modular-construction-course",
    "title": "Prefabrication, Modular Design (DfMA) & Industrialized Building",
    "provider": "Modular Building Institute",
    "description": "Design and execution course on DfMA principles, volumetric modular building systems, precast logistics, and factory production."
  },
  "advanced-construction-materials-course": {
    "id": "advanced-construction-materials-course",
    "title": "Advanced Construction Materials & 3D Concrete Printing",
    "provider": "RILEM / Concrete Institute",
    "description": "Advanced course covering ultra-high-performance concrete (UHPC), 3D printable mortars, self-healing materials, and smart composites."
  }
};

const newResources = {
  "construction-technology-handbook": {
    "id": "construction-technology-handbook",
    "title": "Construction Technology & Field Operations Handbook",
    "author": "Civil Engineering Press",
    "type": "Technical Handbook",
    "description": "Comprehensive reference handbook detailing modern construction equipment, field automation techniques, and productivity optimization."
  },
  "bim-execution-plan-template-handbook": {
    "id": "bim-execution-plan-template-handbook",
    "title": "ISO 19650 BIM Execution Plan (BEP) Master Template Handbook",
    "author": "buildingSMART International",
    "type": "Template Guide",
    "description": "Standardized template handbook for creating project-specific BIM Execution Plans (BEPs) compliant with ISO 19650."
  },
  "infrastructure-bim-handbook": {
    "id": "infrastructure-bim-handbook",
    "title": "Infrastructure BIM Delivery & Data Exchange Handbook",
    "author": "Autodesk / Bentley Joint Technical Group",
    "type": "Technical Handbook",
    "description": "Technical guide on applying BIM methods to civil infrastructure, bridges, highways, railways, and subsurface utilities."
  },
  "bim-coordination-checklist-resource": {
    "id": "bim-coordination-checklist-resource",
    "title": "Multidisciplinary BIM Coordination & Clash Matrix Field Guide",
    "author": "VDC Leaders Forum",
    "type": "Field Checklist",
    "description": "Practical checklist for model federation, clash matrix setup, issue logging, and multidisciplinary coordination meeting protocol."
  },
  "digital-construction-management-handbook": {
    "id": "digital-construction-management-handbook",
    "title": "Digital Construction Management & Field Controls Handbook",
    "author": "CIOB Technical Committee",
    "type": "Technical Handbook",
    "description": "Field guide to implementing digital project controls, mobile reporting, cloud CDEs, and field-to-office communication."
  },
  "four-d-bim-scheduling-guide-resource": {
    "id": "four-d-bim-scheduling-guide-resource",
    "title": "4D BIM & Schedule Integration Technical Guide",
    "author": "Project Controls & BIM Institute",
    "type": "Technical Guide",
    "description": "Technical guide on integrating Primavera P6 schedule data with 3D BIM models for 4D visual planning and simulation."
  },
  "model-based-estimating-guide-resource": {
    "id": "model-based-estimating-guide-resource",
    "title": "5D Model-Based Estimating & Quantity Takeoff Guide",
    "author": "AACE International",
    "type": "Recommended Practice Guide",
    "description": "Best practices guide for model-based quantity takeoff, 5D cost model setup, and rate database integration."
  },
  "digital-boq-estimation-handbook": {
    "id": "digital-boq-estimation-handbook",
    "title": "Digital Quantity Surveying & Automated BOQ Handbook",
    "author": "Royal Institution of Chartered Surveyors",
    "type": "Professional Handbook",
    "description": "Manual on digital measurement techniques, automated BOQ generation in CostX, and cost auditing procedures."
  },
  "construction-robotics-automation-handbook": {
    "id": "construction-robotics-automation-handbook",
    "title": "Construction Robotics & Autonomous Field Equipment Manual",
    "author": "IAARC Press",
    "type": "Technical Manual",
    "description": "Technical handbook covering robotic site equipment, 3D concrete printing, automated rebar fabrication, and field robotics."
  },
  "iot-smart-construction-handbook": {
    "id": "iot-smart-construction-handbook",
    "title": "Smart Construction Sites & IoT Telemetry Handbook",
    "author": "Smart Infrastructure Consortium",
    "type": "Technical Handbook",
    "description": "Guide to deploying wireless IoT sensor networks, site telematics, structural health monitors, and smart job site dashboards."
  },
  "ai-machine-learning-civil-engineering-handbook": {
    "id": "ai-machine-learning-civil-engineering-handbook",
    "title": "Artificial Intelligence & Machine Learning in Civil Engineering",
    "author": "CRC Press / DeepMind AEC",
    "type": "Reference Book",
    "description": "Reference guide on applying AI algorithms, predictive models, and neural networks to civil engineering design and construction."
  },
  "python-geospatial-ai-cookbook": {
    "id": "python-geospatial-ai-cookbook",
    "title": "Python for Construction AI & Computer Vision Cookbook",
    "author": "Applied Engineering Code Press",
    "type": "Code Recipe Manual",
    "description": "Practical code recipe book for applying Python, OpenCV, and PyTorch to computer vision and construction data analytics."
  },
  "computer-vision-site-inspection-guide-resource": {
    "id": "computer-vision-site-inspection-guide-resource",
    "title": "Computer Vision for Construction Inspection & QC Manual",
    "author": "AI Site Inspection Lab",
    "type": "Technical Manual",
    "description": "Technical manual on setting up computer vision pipelines for automated defect detection, PPE compliance, and progress monitoring."
  },
  "digital-twin-civil-infrastructure-handbook": {
    "id": "digital-twin-civil-infrastructure-handbook",
    "title": "Civil Infrastructure Digital Twins Technical Handbook",
    "author": "Bentley Systems & Industry Research Group",
    "type": "Technical Handbook",
    "description": "Comprehensive handbook on building, integrating, and operating digital twins for civil infrastructure assets."
  },
  "construction-data-analytics-guide-resource": {
    "id": "construction-data-analytics-guide-resource",
    "title": "Construction Data Engineering & Executive Dashboard Guide",
    "author": "AEC Data Intelligence Group",
    "type": "Technical Guide",
    "description": "Guide to building construction data pipelines, SQL data warehouses, and Power BI executive KPI dashboards."
  },
  "xr-construction-implementation-guide": {
    "id": "xr-construction-implementation-guide",
    "title": "Extended Reality (AR/VR/MR) Construction Field Implementation Guide",
    "author": "Spatial Computing AEC Alliance",
    "type": "Implementation Guide",
    "description": "Practical guide on deploying AR/VR headsets, site tablets, and real-time visualization engines for construction reviews."
  },
  "modular-construction-dfma-guide-resource": {
    "id": "modular-construction-dfma-guide-resource",
    "title": "Design for Manufacture and Assembly (DfMA) in Civil Infrastructure",
    "author": "Industrialized Construction Institute",
    "type": "Design Manual",
    "description": "Design and execution manual covering DfMA guidelines, precast modular systems, and industrialized construction logistics."
  },
  "advanced-concrete-materials-handbook": {
    "id": "advanced-concrete-materials-handbook",
    "title": "Advanced Concrete Materials & 3D Printing Mechanics Handbook",
    "author": "RILEM Technical Committee",
    "type": "Technical Handbook",
    "description": "Technical handbook on formulation, mechanical behavior, and testing of UHPC, 3D printable concrete, and smart materials."
  },
  "digital-asset-handover-guide-resource": {
    "id": "digital-asset-handover-guide-resource",
    "title": "COBie & Digital Asset Information Handover Guide",
    "author": "buildingSMART / APWA",
    "type": "Implementation Guide",
    "description": "Implementation guide for COBie data drops, asset information models, and digital handover to facility management systems."
  }
};

// Helper function to update registry file
function updateRegistry(filename, newEntries) {
  const filePath = path.join('./src/data/registries', filename);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let addedCount = 0;
  for (const [key, val] of Object.entries(newEntries)) {
    if (!data[key]) {
      data[key] = val;
      addedCount++;
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${filename}: added ${addedCount} entries. Total now ${Object.keys(data).length}.`);
}

updateRegistry('knowledge.json', newKnowledge);
updateRegistry('skills.json', newSkills);
updateRegistry('software.json', newSoftware);
updateRegistry('standards.json', newStandards);
updateRegistry('workflow.json', newWorkflows);
updateRegistry('projects.json', newProjects);
updateRegistry('career-roles.json', newCareerRoles);
updateRegistry('organizations.json', newOrganizations);
updateRegistry('courses.json', newCourses);
updateRegistry('resources.json', newResources);


// 2. STAGE 03 SPECIALIZATIONS DEFINITION

const stage03Specializations = [
  {
    "id": "construction-technology-engineering-spec",
    "kind": "specialization",
    "title": "Construction Technology Engineering",
    "summary": "Modern construction technologies, advanced execution methods, construction productivity, equipment technology, site automation, and process optimization.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "construction-technology-knowledge",
        "construction-automation-robotics-knowledge",
        "digital-construction-management-knowledge"
      ],
      "skills": [
        "construction-technology-optimization-skill",
        "construction-automation-skill",
        "digital-site-operations-skill"
      ],
      "software": [
        "autodesk-construction-cloud",
        "excel",
        "primavera-p6"
      ],
      "standards": [
        "osha-construction-standards",
        "iso-9001-qms",
        "bangladesh-public-works-specifications"
      ],
      "workflow": [
        "construction-technology-optimization-workflow",
        "digital-site-monitoring-workflow"
      ],
      "projects": [
        "dhaka-elevated-expressway-digital-construction-project",
        "padma-bridge-rail-link-project"
      ],
      "careerRoles": [
        "construction-technology-engineer",
        "digital-construction-engineer"
      ],
      "organizations": [
        "ciob",
        "ieb-org",
        "pwd-bangladesh",
        "autodesk"
      ],
      "courses": [
        "construction-technology-innovation-course",
        "construction-qaqc-hse-management-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "construction-technology-handbook",
        "construction-safety-osha-pocket-guide"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "building-information-modeling-spec",
    "kind": "specialization",
    "title": "Building Information Modeling (BIM)",
    "summary": "Comprehensive BIM methodology, multidisciplinary modeling, information management, BIM execution planning, model delivery, and openBIM interoperability.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "bim-methodology-knowledge",
        "bim-digital-construction-knowledge",
        "openbim-interoperability-knowledge"
      ],
      "skills": [
        "bim-modelling-skill",
        "bim-execution-planning-skill",
        "bim-information-management-skill"
      ],
      "software": [
        "revit",
        "navisworks",
        "autodesk-construction-cloud",
        "tekla-structures"
      ],
      "standards": [
        "iso-19650-bim",
        "buildingSMART-ifc-standards",
        "iso-12006-building-construction-info"
      ],
      "workflow": [
        "bim-execution-planning-workflow",
        "bim-implementation-workflow"
      ],
      "projects": [
        "dhaka-metro-rail-line-6-project",
        "bangabandhu-railway-bridge-project"
      ],
      "careerRoles": [
        "bim-engineer",
        "bim-manager",
        "bim-modeler"
      ],
      "organizations": [
        "buildingsmart-international",
        "autodesk",
        "bentley-systems",
        "ieb-org"
      ],
      "courses": [
        "bim-fundamentals-iso19650-course",
        "bim-for-infrastructure-civil3d-revit-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "iso-19650-bim-guidelines-resource",
        "bim-execution-plan-template-handbook"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "infrastructure-bim-spec",
    "kind": "specialization",
    "title": "Infrastructure BIM",
    "summary": "Specialized BIM for civil infrastructure including highways, bridges, railways, tunnels, utilities, civil information models, and model-based infrastructure delivery.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "infrastructure-bim-knowledge",
        "highway-railway-bim-knowledge",
        "utility-bim-modeling-knowledge"
      ],
      "skills": [
        "infrastructure-bim-modeling-skill",
        "bridge-bim-modelling",
        "3d-tunnel-bim-modeling"
      ],
      "software": [
        "civil-3d",
        "infraworks",
        "bentley-openroads",
        "openrail",
        "opentunnel-designer"
      ],
      "standards": [
        "iso-19650-bim",
        "buildingSMART-ifc-standards",
        "aashto-green-book"
      ],
      "workflow": [
        "infrastructure-bim-delivery-workflow",
        "civil-3d-corridor-bim-workflow"
      ],
      "projects": [
        "padma-bridge-rail-link-project",
        "dhaka-metro-rail-line-6-project",
        "roopsa-railway-bridge-project"
      ],
      "careerRoles": [
        "infrastructure-bim-engineer",
        "bridge-bim-modelling-engineer",
        "tunnel-bim-digital-twin-engineer"
      ],
      "organizations": [
        "buildingsmart-international",
        "autodesk",
        "bentley-systems",
        "rhd-bangladesh"
      ],
      "courses": [
        "bim-for-infrastructure-civil3d-revit-course",
        "tunnel-bim-digital-twin-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "iso-19650-bim-guidelines-resource",
        "infrastructure-bim-handbook"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "bim-coordination-model-management-spec",
    "kind": "specialization",
    "title": "BIM Coordination & Model Management",
    "summary": "Multidisciplinary model coordination, automated clash detection, model federation, quality review, model validation, and collaborative BCF issue tracking.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "bim-coordination-clash-detection-knowledge",
        "model-federation-quality-knowledge"
      ],
      "skills": [
        "bim-coordination-clash-detection-skill",
        "model-federation-issue-tracking-skill"
      ],
      "software": [
        "navisworks",
        "solibri-model-checker",
        "autodesk-construction-cloud",
        "revit"
      ],
      "standards": [
        "iso-19650-bim",
        "buildingSMART-ifc-standards"
      ],
      "workflow": [
        "model-federation-clash-detection-workflow",
        "bim-coordination-review-workflow"
      ],
      "projects": [
        "dhaka-metro-rail-line-6-project",
        "matarbari-ultra-super-critical-power-project"
      ],
      "careerRoles": [
        "construction-bim-coordinator",
        "bim-manager"
      ],
      "organizations": [
        "buildingsmart-international",
        "autodesk",
        "ciob"
      ],
      "courses": [
        "4d-5d-bim-navisworks-synchro-course",
        "bim-coordination-clash-management-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "iso-19650-bim-guidelines-resource",
        "bim-coordination-checklist-resource"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "digital-construction-management-spec",
    "kind": "specialization",
    "title": "Digital Construction Management",
    "summary": "Digital project management, mobile site workflows, cloud documentation, progress tracking, construction data systems, and field-to-office communication.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "digital-construction-management-knowledge",
        "field-to-office-data-knowledge"
      ],
      "skills": [
        "digital-construction-management-skill",
        "construction-data-integration-skill"
      ],
      "software": [
        "autodesk-construction-cloud",
        "bluebeam-revu",
        "primavera-p6",
        "excel"
      ],
      "standards": [
        "iso-19650-bim",
        "iso-9001-qms",
        "aace-recommended-practices"
      ],
      "workflow": [
        "digital-construction-monitoring-workflow",
        "field-to-office-data-sync-workflow"
      ],
      "projects": [
        "dhaka-elevated-expressway-digital-construction-project",
        "hazrat-shahjalal-terminal-3-expansion-project"
      ],
      "careerRoles": [
        "digital-construction-manager",
        "digital-construction-engineer"
      ],
      "organizations": [
        "ciob",
        "pmi",
        "pwd-bangladesh",
        "autodesk"
      ],
      "courses": [
        "construction-project-management-pmp-course",
        "digital-construction-management-masterclass"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "digital-construction-management-handbook",
        "aace-cost-engineering-handbook"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "four-d-bim-construction-planning-spec",
    "kind": "specialization",
    "title": "4D BIM & Construction Planning",
    "summary": "Integrating 3D BIM models with project schedules, visual sequencing, time-lapse simulation, 4D schedule optimization, and delay visual analysis.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "four-d-bim-scheduling-knowledge",
        "construction-sequencing-simulation-knowledge"
      ],
      "skills": [
        "four-d-bim-construction-planning-skill",
        "bim-coordination-4d-5d-skill"
      ],
      "software": [
        "synchro",
        "navisworks",
        "primavera-p6",
        "ms-project"
      ],
      "standards": [
        "iso-19650-bim",
        "aace-recommended-practices"
      ],
      "workflow": [
        "4d-5d-bim-construction-integration-workflow",
        "visual-construction-sequencing-workflow"
      ],
      "projects": [
        "padma-bridge-rail-link-project",
        "dhaka-metro-rail-line-6-project"
      ],
      "careerRoles": [
        "four-d-bim-engineer",
        "construction-bim-coordinator"
      ],
      "organizations": [
        "bentley-systems",
        "pmi",
        "aace-international"
      ],
      "courses": [
        "4d-5d-bim-navisworks-synchro-course",
        "primavera-p6-construction-scheduling-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "four-d-bim-scheduling-guide-resource",
        "primavera-p6-user-guide-resource"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "five-d-bim-cost-engineering-spec",
    "kind": "specialization",
    "title": "5D BIM & Construction Cost Engineering",
    "summary": "Merging 3D geometry with cost database structures, model-based cost estimating, budget planning, 5D cash flow simulation, and cost control.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "five-d-bim-cost-engineering-knowledge",
        "model-based-estimating-knowledge"
      ],
      "skills": [
        "five-d-cost-integration-skill",
        "digital-quantity-takeoff-skill"
      ],
      "software": [
        "costx",
        "synchro",
        "navisworks",
        "excel",
        "revit"
      ],
      "standards": [
        "iso-19650-bim",
        "aace-recommended-practices",
        "bangladesh-public-works-specifications"
      ],
      "workflow": [
        "4d-5d-bim-construction-integration-workflow",
        "model-based-cost-estimating-workflow"
      ],
      "projects": [
        "dhaka-metro-rail-line-6-project",
        "hazrat-shahjalal-terminal-3-expansion-project"
      ],
      "careerRoles": [
        "five-d-bim-engineer",
        "digital-quantity-surveyor"
      ],
      "organizations": [
        "aace-international",
        "csi",
        "ciob"
      ],
      "courses": [
        "4d-5d-bim-navisworks-synchro-course",
        "quantity-takeoff-costx-boq-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "aace-cost-engineering-handbook",
        "model-based-estimating-guide-resource"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "digital-quantity-surveying-estimation-spec",
    "kind": "specialization",
    "title": "Digital Quantity Surveying & Estimation",
    "summary": "Automated quantity takeoff, digital bill of quantities (BOQ) generation, model-based measurement, digital cost estimation, and payment valuation.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "digital-quantity-surveying-knowledge",
        "automated-boq-generation-knowledge"
      ],
      "skills": [
        "digital-quantity-takeoff-skill",
        "boq-cost-estimating-skill"
      ],
      "software": [
        "costx",
        "bluebeam-revu",
        "civil-3d",
        "excel"
      ],
      "standards": [
        "aace-recommended-practices",
        "bangladesh-public-works-specifications",
        "iso-19650-bim"
      ],
      "workflow": [
        "automated-boq-takeoff-workflow",
        "digital-cost-estimation-workflow"
      ],
      "projects": [
        "moghbazar-flyover-construction-project",
        "padma-bridge-rail-link-project"
      ],
      "careerRoles": [
        "digital-quantity-surveyor",
        "claims-delay-analyst"
      ],
      "organizations": [
        "aace-international",
        "ciob",
        "pwd-bangladesh"
      ],
      "courses": [
        "quantity-takeoff-costx-boq-course",
        "fidic-contract-claims-delay-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "aace-cost-engineering-handbook",
        "digital-boq-estimation-handbook"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "construction-automation-robotics-spec",
    "kind": "specialization",
    "title": "Construction Automation & Robotics",
    "summary": "Construction robotics, automated field equipment, robotic concrete printing, automated bricklaying/tying, robotic fabrication, and machine control.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "construction-automation-robotics-knowledge",
        "robotic-construction-methods-knowledge"
      ],
      "skills": [
        "construction-automation-skill",
        "robotic-fabrication-control-skill"
      ],
      "software": [
        "python",
        "matlab",
        "rhino-grasshopper",
        "labview"
      ],
      "standards": [
        "iso-9001-qms",
        "osha-construction-standards",
        "iso-iec-15288-systems-engineering"
      ],
      "workflow": [
        "robotic-construction-execution-workflow",
        "automated-site-fabrication-workflow"
      ],
      "projects": [
        "bangabandhu-railway-bridge-project",
        "dhaka-metro-rail-line-6-project"
      ],
      "careerRoles": [
        "construction-automation-engineer",
        "construction-technology-engineer"
      ],
      "organizations": [
        "building-robotics-consortium",
        "autodesk",
        "trimble"
      ],
      "courses": [
        "construction-automation-robotics-course",
        "python-for-geospatial-data-science-ai-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "construction-robotics-automation-handbook",
        "construction-safety-osha-pocket-guide"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "reality-capture-digital-site-spec",
    "kind": "specialization",
    "title": "Reality Capture & Digital Site Engineering",
    "summary": "3D laser scanning, terrestrial & airborne LiDAR, UAV drone photogrammetry, point cloud processing, as-built digital models, and site digitization.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "reality-capture-point-cloud-knowledge",
        "uav-drone-surveying-knowledge"
      ],
      "skills": [
        "reality-capture-processing-skill",
        "point-cloud-to-bim-skill",
        "uav-photogrammetry-skill"
      ],
      "software": [
        "autodesk-recap",
        "cloudcompare",
        "pix4d",
        "agisoft-metashape",
        "dji-terra"
      ],
      "standards": [
        "asprs-positional-accuracy-standards",
        "iso-19100-geographic-information",
        "sob-surveying-specifications"
      ],
      "workflow": [
        "mobile-mapping-reality-capture-workflow",
        "airborne-terrestrial-lidar-processing-workflow",
        "uav-drone-photogrammetric-mapping-workflow"
      ],
      "projects": [
        "dhaka-elevated-expressway-uav-reality-capture-project",
        "dhaka-metro-rail-asbuilt-tunnel-survey-project"
      ],
      "careerRoles": [
        "reality-capture-engineer",
        "geospatial-digital-twin-engineer"
      ],
      "organizations": [
        "asprs",
        "fig-org",
        "trimble",
        "survey-of-bangladesh"
      ],
      "courses": [
        "uav-photogrammetry-lidar-processing-course",
        "engineering-surveying-gnss-total-station-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "uav-photogrammetry-lidar-best-practices-guide",
        "geodesy-gnss-surveying-handbook"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "digital-surveying-machine-control-spec",
    "kind": "specialization",
    "title": "Digital Surveying & Machine Control",
    "summary": "High-precision GNSS positioning, robotic total stations, 3D machine control, automated earthmoving grading, digital terrain models, and survey-to-machine workflows.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "total-station-digital-surveying-knowledge",
        "machine-control-guidance-knowledge"
      ],
      "skills": [
        "machine-control-setup-skill",
        "robotic-total-station-surveying-skill"
      ],
      "software": [
        "trimble-business-center",
        "leica-infinity",
        "civil-3d",
        "bentley-openroads"
      ],
      "standards": [
        "asprs-positional-accuracy-standards",
        "sob-surveying-specifications"
      ],
      "workflow": [
        "digital-earthwork-machine-control-workflow",
        "precision-site-staking-workflow"
      ],
      "projects": [
        "padma-bridge-rail-link-project",
        "dhaka-elevated-expressway-uav-reality-capture-project"
      ],
      "careerRoles": [
        "digital-surveying-machine-control-engineer",
        "reality-capture-engineer"
      ],
      "organizations": [
        "trimble",
        "fig-org",
        "survey-of-bangladesh",
        "rhd-bangladesh"
      ],
      "courses": [
        "engineering-surveying-gnss-total-station-course",
        "machine-control-earthwork-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "geodesy-gnss-surveying-handbook",
        "rhd-road-design-manual-resource"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "construction-iot-smart-site-spec",
    "kind": "specialization",
    "title": "Construction IoT & Smart Site Technology",
    "summary": "Internet of Things (IoT) site sensors, equipment telematics, environmental tracking, wearable worker safety sensors, real-time site data, and connected job sites.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "smart-city-infrastructure-iot",
        "construction-iot-telemetry-knowledge"
      ],
      "skills": [
        "iot-construction-monitoring-skill",
        "sensor-data-telemetry-skill"
      ],
      "software": [
        "python",
        "labview",
        "autodesk-construction-cloud",
        "bentley-itwin"
      ],
      "standards": [
        "iso-18649-structural-health-monitoring",
        "iso-37120-smart-sustainable-cities",
        "iso-45001-ohsms"
      ],
      "workflow": [
        "iot-sensor-telemetry-monitoring-workflow",
        "digital-site-monitoring-workflow"
      ],
      "projects": [
        "padma-multipurpose-bridge-project",
        "dhaka-metro-rail-line-6-project"
      ],
      "careerRoles": [
        "smart-construction-engineer",
        "construction-data-analyst"
      ],
      "organizations": [
        "ogc",
        "iso-org",
        "buet-org",
        "dmtcl-bangladesh"
      ],
      "courses": [
        "smart-cities-iot-infrastructure-course",
        "structural-health-monitoring-shm-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "seismic-shm-instrumentation-guide",
        "iot-smart-construction-handbook"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "ai-in-civil-engineering-spec",
    "kind": "specialization",
    "title": "Artificial Intelligence in Civil Engineering",
    "summary": "Artificial intelligence, machine learning, computer vision, predictive analytics, automated risk forecasting, productivity modeling, and decision support systems.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "construction-ai-predictive-analytics-knowledge",
        "generative-design-machine-learning-knowledge"
      ],
      "skills": [
        "construction-ai-modeling-skill",
        "geospatial-ai-feature-extraction-skill"
      ],
      "software": [
        "python",
        "matlab",
        "r",
        "excel"
      ],
      "standards": [
        "iso-31000-risk-management",
        "iso-9001-qms"
      ],
      "workflow": [
        "construction-ai-predictive-modeling-workflow",
        "generative-design-optimization-workflow"
      ],
      "projects": [
        "dhaka-metro-rail-line-6-project",
        "padma-bridge-rail-link-project"
      ],
      "careerRoles": [
        "construction-ai-engineer",
        "construction-data-analyst"
      ],
      "organizations": [
        "autodesk",
        "buet-org",
        "pmi"
      ],
      "courses": [
        "python-for-geospatial-data-science-ai-course",
        "ai-in-civil-engineering-masterclass"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "ai-machine-learning-civil-engineering-handbook",
        "python-geospatial-ai-cookbook"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "computer-vision-automated-inspection-spec",
    "kind": "specialization",
    "title": "Computer Vision & Automated Construction Inspection",
    "summary": "Image-based visual inspection, automated defect detection, progress tracking, PPE safety monitoring, structural visual analysis, and AI site surveillance.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "computer-vision-site-inspection-knowledge",
        "automated-defect-detection-knowledge"
      ],
      "skills": [
        "computer-vision-inspection-skill",
        "defect-detection-image-processing-skill"
      ],
      "software": [
        "python",
        "opencv-platform",
        "matlab",
        "pix4d"
      ],
      "standards": [
        "iso-9001-qms",
        "osha-construction-standards"
      ],
      "workflow": [
        "computer-vision-quality-inspection-workflow",
        "automated-defect-detection-workflow"
      ],
      "projects": [
        "dhaka-elevated-expressway-uav-reality-capture-project",
        "padma-bridge-rail-link-project"
      ],
      "careerRoles": [
        "construction-ai-engineer",
        "digital-construction-engineer"
      ],
      "organizations": [
        "isprs",
        "asprs",
        "autodesk"
      ],
      "courses": [
        "computer-vision-construction-inspection-course",
        "python-for-geospatial-data-science-ai-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "computer-vision-site-inspection-guide-resource",
        "construction-safety-osha-pocket-guide"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "digital-twin-civil-infrastructure-spec",
    "kind": "specialization",
    "title": "Digital Twin for Civil Infrastructure",
    "summary": "Civil infrastructure digital twins, BIM-to-Twin integration, real-time IoT sensor telemetry, simulation, predictive maintenance, and lifecycle asset operational management.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "coastal-gis-digital-twin-knowledge",
        "infrastructure-digital-twin-knowledge"
      ],
      "skills": [
        "3d-geospatial-digital-twin-skill",
        "digital-twin-development-skill"
      ],
      "software": [
        "bentley-itwin",
        "unreal-engine",
        "unity",
        "cityengine",
        "autodesk-construction-cloud"
      ],
      "standards": [
        "iso-55000-asset-management",
        "iso-19650-bim",
        "iso-37120-smart-sustainable-cities"
      ],
      "workflow": [
        "urban-digital-twin-gis-integration-workflow",
        "infrastructure-digital-twin-lifecycle-workflow"
      ],
      "projects": [
        "dhaka-metro-rail-line-6-project",
        "padma-multipurpose-bridge-project",
        "bangabandhu-tunnel-underground-project"
      ],
      "careerRoles": [
        "geospatial-digital-twin-engineer",
        "tunnel-bim-digital-twin-engineer"
      ],
      "organizations": [
        "bentley-systems",
        "buildingsmart-international",
        "dmtcl-bangladesh",
        "bba-bangladesh"
      ],
      "courses": [
        "tunnel-bim-digital-twin-course",
        "smart-cities-iot-infrastructure-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "digital-twin-civil-infrastructure-handbook",
        "iso-55000-asset-management-guidelines-resource"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "construction-data-engineering-analytics-spec",
    "kind": "specialization",
    "title": "Construction Data Engineering & Analytics",
    "summary": "Construction databases, ETL data pipelines, Power BI executive dashboards, schedule performance metrics, cost variance analytics, and project intelligence.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "construction-data-analytics-knowledge",
        "project-data-warehousing-knowledge"
      ],
      "skills": [
        "construction-data-analytics-skill",
        "dashboard-data-pipeline-skill"
      ],
      "software": [
        "python",
        "power-bi",
        "excel",
        "r",
        "autodesk-construction-cloud"
      ],
      "standards": [
        "aace-recommended-practices",
        "iso-9001-qms",
        "iso-31000-risk-management"
      ],
      "workflow": [
        "construction-data-pipeline-analytics-workflow",
        "executive-dashboard-reporting-workflow"
      ],
      "projects": [
        "dhaka-metro-rail-line-6-project",
        "hazrat-shahjalal-terminal-3-expansion-project"
      ],
      "careerRoles": [
        "construction-data-analyst",
        "digital-construction-manager"
      ],
      "organizations": [
        "pmi",
        "aace-international",
        "ciob"
      ],
      "courses": [
        "construction-data-analytics-course",
        "primavera-p6-construction-scheduling-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "aace-cost-engineering-handbook",
        "construction-data-analytics-guide-resource"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "extended-reality-for-construction-spec",
    "kind": "specialization",
    "title": "Extended Reality for Construction",
    "summary": "Augmented reality (AR), virtual reality (VR), and mixed reality (MR) for immersive design review, spatial 3D model overlay, virtual site inspection, and safety training.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "extended-reality-construction-knowledge",
        "ar-vr-spatial-computing-knowledge"
      ],
      "skills": [
        "xr-construction-visualization-skill",
        "immersive-design-review-skill"
      ],
      "software": [
        "unreal-engine",
        "unity",
        "twinmotion",
        "enscape",
        "navisworks"
      ],
      "standards": [
        "iso-19650-bim",
        "osha-construction-standards"
      ],
      "workflow": [
        "xr-immersive-design-review-workflow",
        "ar-site-overlay-inspection-workflow"
      ],
      "projects": [
        "dhaka-metro-rail-line-6-project",
        "hazrat-shahjalal-terminal-3-expansion-project"
      ],
      "careerRoles": [
        "construction-xr-engineer",
        "construction-bim-coordinator"
      ],
      "organizations": [
        "autodesk",
        "bentley-systems",
        "ciob"
      ],
      "courses": [
        "extended-reality-construction-course",
        "4d-5d-bim-navisworks-synchro-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "xr-construction-implementation-guide",
        "construction-safety-osha-pocket-guide"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "prefabrication-modular-industrialized-construction-spec",
    "kind": "specialization",
    "title": "Prefabrication, Modular & Industrialized Construction",
    "summary": "Prefabrication, modular building systems, off-site manufacturing, Design for Manufacture and Assembly (DfMA), modular infrastructure, and factory-based construction.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "prefabrication-dfma-knowledge",
        "modular-industrialized-construction-knowledge"
      ],
      "skills": [
        "dfma-modular-design-skill",
        "precast-modular-logistics-skill"
      ],
      "software": [
        "tekla-structures",
        "revit",
        "synchro",
        "autodesk-construction-cloud"
      ],
      "standards": [
        "bnbc-structural",
        "aci-318",
        "iso-9001-qms",
        "eurocode-2"
      ],
      "workflow": [
        "dfma-modular-construction-workflow",
        "precast-element-tracking-workflow"
      ],
      "projects": [
        "padma-bridge-rail-link-project",
        "moghbazar-flyover-construction-project"
      ],
      "careerRoles": [
        "modular-construction-engineer",
        "structural-bim-engineer"
      ],
      "organizations": [
        "csi",
        "aci",
        "pwd-bangladesh",
        "rhd-bangladesh"
      ],
      "courses": [
        "prefabrication-modular-construction-course",
        "etabs-building-design-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "rebar-detailing-handbook",
        "modular-construction-dfma-guide-resource"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "advanced-construction-materials-tech-spec",
    "kind": "specialization",
    "title": "Advanced Construction Materials & Technologies",
    "summary": "Advanced construction materials, 3D printed concrete formulations, high-performance materials, smart composites, innovative concrete, and sustainable technologies.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "advanced-construction-materials-knowledge",
        "3d-concrete-printing-materials-knowledge"
      ],
      "skills": [
        "advanced-material-testing-skill",
        "3d-concrete-mix-design-skill"
      ],
      "software": [
        "python",
        "matlab",
        "labview",
        "excel"
      ],
      "standards": [
        "aci-318",
        "astm-geotechnical",
        "eurocode-2",
        "bnbc-structural"
      ],
      "workflow": [
        "advanced-material-characterization-workflow",
        "3d-printed-concrete-testing-workflow"
      ],
      "projects": [
        "padma-multipurpose-bridge-project",
        "bangabandhu-railway-bridge-project"
      ],
      "careerRoles": [
        "construction-materials-engineer",
        "construction-technology-engineer"
      ],
      "organizations": [
        "aci",
        "astm-org",
        "buet-org",
        "pwd-bangladesh"
      ],
      "courses": [
        "advanced-construction-materials-course",
        "rc-building-design-masterclass"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "rebar-detailing-handbook",
        "advanced-concrete-materials-handbook"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  },
  {
    "id": "digital-asset-management-smart-lifecycle-spec",
    "kind": "specialization",
    "title": "Digital Asset Management & Smart Lifecycle Delivery",
    "summary": "Digital handover, COBie asset information models, digital O&M operations, ISO 55000 asset management frameworks, predictive maintenance, and smart lifecycle delivery.",
    "heroImage": "",
    "children": [],
    "relations": {
      "knowledge": [
        "digital-asset-management-knowledge",
        "cobie-digital-handover-knowledge"
      ],
      "skills": [
        "digital-asset-management-skill",
        "cobie-data-validation-skill"
      ],
      "software": [
        "autodesk-construction-cloud",
        "bentley-openutilities",
        "bentley-itwin",
        "excel"
      ],
      "standards": [
        "iso-55000-asset-management",
        "iso-19650-bim",
        "buildingSMART-ifc-standards"
      ],
      "workflow": [
        "digital-asset-handover-workflow",
        "cobie-data-extraction-workflow"
      ],
      "projects": [
        "dhaka-metro-rail-line-6-project",
        "hazrat-shahjalal-terminal-3-expansion-project"
      ],
      "careerRoles": [
        "digital-asset-manager",
        "infrastructure-bim-engineer"
      ],
      "organizations": [
        "iso-org",
        "buildingsmart-international",
        "dmtcl-bangladesh",
        "apwa-org"
      ],
      "courses": [
        "iso-55000-municipal-asset-management-course",
        "bim-fundamentals-iso19650-course"
      ],
      "plugins": [],
      "drawings": [],
      "templates": [],
      "resources": [
        "iso-55000-asset-management-guidelines-resource",
        "digital-asset-handover-guide-resource"
      ]
    },
    "ueleLink": "",
    "comingSoon": false
  }
];

// 3. UPDATE ROADMAP TREE

const treePath = './src/data/roadmap-tree.json';
const treeData = JSON.parse(fs.readFileSync(treePath, 'utf8'));

const civilField = treeData.find(f => f.id === 'civil-engineering');
if (!civilField) {
  throw new Error('Civil Engineering field not found in roadmap-tree.json');
}

const targetBranch = civilField.children.find(b => b.id === 'civil-engineering-technology-digital-construction');
if (!targetBranch) {
  throw new Error('civil-engineering-technology-digital-construction branch not found in roadmap-tree.json');
}

targetBranch.comingSoon = false;
targetBranch.children = stage03Specializations;

fs.writeFileSync(treePath, JSON.stringify(treeData, null, 2), 'utf8');
console.log(`Successfully updated roadmap-tree.json! Branch 'civil-engineering-technology-digital-construction' now has ${targetBranch.children.length} specializations.`);

