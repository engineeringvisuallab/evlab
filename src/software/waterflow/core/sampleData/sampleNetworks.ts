/**
 * EVLab WaterFlow - Realistic Engineering Sample Networks
 */

import { NetworkModel, Junction, Reservoir, Tank, Pipe, Pump, Valve, NetworkNode, NetworkLink, DemandPattern } from '../../types/waterflow';

export function createSampleCityNetwork(): NetworkModel {
  const nodesMap = new Map<string, NetworkNode>();
  const linksMap = new Map<string, NetworkLink>();

  // Diurnal 24-hour demand pattern
  const defaultPattern: DemandPattern = {
    id: 'pat-residential',
    name: 'Municipal Residential 24h Pattern',
    multipliers: [
      0.4, 0.35, 0.3, 0.35, 0.5, 0.8, 1.4, 1.8, 1.6, 1.3, 1.1, 1.0,
      0.95, 0.9, 0.85, 0.9, 1.1, 1.5, 1.7, 1.4, 1.1, 0.8, 0.6, 0.45
    ]
  };

  // 1. Reservoir R-101 (Water Treatment Works Source)
  const r101: Reservoir = {
    id: 'R-101',
    label: 'Treatment Plant Reservoir (R-101)',
    type: 'reservoir',
    x: 100,
    y: 200,
    elevation: 110,
    totalHead: 140,
    description: 'Regional Treatment Plant Clear Water Storage'
  };
  nodesMap.set(r101.id, r101);

  // 2. Booster Pump Station Node (J-Pump-In)
  const jPumpIn: Junction = {
    id: 'J-00',
    label: 'Pump Intake Header',
    type: 'junction',
    x: 220,
    y: 200,
    elevation: 105,
    baseDemand: 0,
    description: 'Suction header for primary booster pumps'
  };
  nodesMap.set(jPumpIn.id, jPumpIn);

  // 3. Suction Pipe P-100
  const p100: Pipe = {
    id: 'P-100',
    label: 'Suction Line (P-100)',
    type: 'pipe',
    startNodeId: 'R-101',
    endNodeId: 'J-00',
    length: 120,
    diameter: 400,
    material: 'Ductile Iron',
    roughness: 130,
    minorLoss: 0.5,
    status: 'OPEN'
  };
  linksMap.set(p100.id, p100);

  // 4. Main Booster Pump PUMP-101
  const pump1: Pump = {
    id: 'PUMP-101',
    label: 'District Booster Pump #1',
    type: 'pump',
    startNodeId: 'J-00',
    endNodeId: 'J-01',
    curveType: 'DESIGN_POINT',
    designFlow: 120, // L/s
    designHead: 45,  // m
    speed: 100,
    status: 'ON',
    efficiency: 82
  };
  linksMap.set(pump1.id, pump1);

  // 5. Junctions J-01 to J-08
  const junctionsData: Partial<Junction>[] = [
    { id: 'J-01', label: 'Main Transmission Junction (J-01)', x: 380, y: 200, elevation: 62, baseDemand: 10.0, zone: 'Industrial' },
    { id: 'J-02', label: 'North Loop Branch (J-02)',           x: 520, y: 100, elevation: 58, baseDemand: 18.5, zone: 'Commercial' },
    { id: 'J-03', label: 'Hospital District (J-03)',             x: 720, y: 100, elevation: 55, baseDemand: 25.0, zone: 'Critical Facility' },
    { id: 'J-04', label: 'Central City Square (J-04)',           x: 520, y: 320, elevation: 52, baseDemand: 22.0, zone: 'Central' },
    { id: 'J-05', label: 'South Residential Grid (J-05)',         x: 720, y: 320, elevation: 48, baseDemand: 30.0, zone: 'Residential' },
    { id: 'J-06', label: 'East High Pressure Main (J-06)',       x: 880, y: 200, elevation: 50, baseDemand: 15.0, zone: 'East' },
    { id: 'J-07', label: 'Low Pressure Sub-Zone (J-07)',         x: 1020, y: 320, elevation: 35, baseDemand: 12.0, zone: 'Low-Zone' },
    { id: 'J-08', label: 'Valley Tap (J-08)',                     x: 1020, y: 200, elevation: 32, baseDemand: 8.0,  zone: 'Low-Zone' },
  ];

  junctionsData.forEach(jd => {
    const j: Junction = {
      id: jd.id!,
      label: jd.label!,
      type: 'junction',
      x: jd.x!,
      y: jd.y!,
      elevation: jd.elevation!,
      baseDemand: jd.baseDemand!,
      demandPatternId: 'pat-residential',
      zone: jd.zone
    };
    nodesMap.set(j.id, j);
  });

  // 6. Elevated Storage Tank TANK-201
  const tank1: Tank = {
    id: 'TANK-201',
    label: 'East District Elevated Tank (TANK-201)',
    type: 'tank',
    x: 880,
    y: 50,
    elevation: 85,
    minLevel: 1.5,
    initLevel: 6.0,
    maxLevel: 10.0,
    diameter: 14.0,
    description: '1,000m3 Balancing & Emergency Storage Tank'
  };
  nodesMap.set(tank1.id, tank1);

  // 7. Pipes P-101 to P-111
  const pipesData: Partial<Pipe>[] = [
    { id: 'P-101', label: 'Main Feed Pipe', startNodeId: 'J-01', endNodeId: 'J-02', length: 450, diameter: 300, material: 'Ductile Iron', roughness: 130 },
    { id: 'P-102', label: 'North Loop Pipe', startNodeId: 'J-02', endNodeId: 'J-03', length: 500, diameter: 250, material: 'Ductile Iron', roughness: 130 },
    { id: 'P-103', label: 'Central Cross Pipe', startNodeId: 'J-01', endNodeId: 'J-04', length: 380, diameter: 250, material: 'HDPE', roughness: 140 },
    { id: 'P-104', label: 'Hospital Feed', startNodeId: 'J-03', endNodeId: 'J-06', length: 420, diameter: 250, material: 'Ductile Iron', roughness: 130 },
    { id: 'P-105', label: 'Mid Loop Link', startNodeId: 'J-02', endNodeId: 'J-04', length: 400, diameter: 200, material: 'PVC', roughness: 140 },
    { id: 'P-106', label: 'South Central Pipe', startNodeId: 'J-04', endNodeId: 'J-05', length: 520, diameter: 200, material: 'PVC', roughness: 140 },
    { id: 'P-107', label: 'East Loop Pipe', startNodeId: 'J-05', endNodeId: 'J-06', length: 360, diameter: 200, material: 'PVC', roughness: 140 },
    { id: 'P-108', label: 'Tank Riser Line', startNodeId: 'J-03', endNodeId: 'TANK-201', length: 280, diameter: 250, material: 'Steel', roughness: 120 },
    { id: 'P-109', label: 'Low Zone Feeder', startNodeId: 'J-06', endNodeId: 'J-08', length: 350, diameter: 200, material: 'HDPE', roughness: 140 },
    { id: 'P-110', label: 'Valley Distribution Line', startNodeId: 'J-08', endNodeId: 'J-07', length: 300, diameter: 150, material: 'PVC', roughness: 140 },
  ];

  pipesData.forEach(pd => {
    const p: Pipe = {
      id: pd.id!,
      label: pd.label!,
      type: 'pipe',
      startNodeId: pd.startNodeId!,
      endNodeId: pd.endNodeId!,
      length: pd.length!,
      diameter: pd.diameter!,
      material: pd.material as any || 'Ductile Iron',
      roughness: pd.roughness || 130,
      minorLoss: 0,
      status: 'OPEN'
    };
    linksMap.set(p.id, p);
  });

  // 8. PRV-1 Valve between J-05 and J-07
  const valve1: Valve = {
    id: 'PRV-101',
    label: 'Low Zone PRV Valve (PRV-101)',
    type: 'valve',
    startNodeId: 'J-05',
    endNodeId: 'J-07',
    valveType: 'PRV',
    setting: 320, // Keep downstream pressure controlled to 320 kPa (~32.6m H2O)
    status: 'ACTIVE',
    minorLoss: 1.5
  };
  linksMap.set(valve1.id, valve1);

  return {
    id: 'city-district-4',
    title: 'EVLab WaterFlow — Metro Municipal District 4 Network',
    client: 'Metropolitan Water & Sanitation Authority',
    engineer: 'Principal Hydraulics Lead, PE',
    projectNumber: 'EVL-WF-2026-004',
    location: 'District 4 Municipal Zone',
    nodes: nodesMap,
    links: linksMap,
    patterns: [defaultPattern],
    cadAnnotations: [
      {
        id: 'cad-txt-1',
        type: 'cad_text',
        layer: 'ANNOTATIONS',
        color: '#38bdf8',
        lineWidth: 1,
        points: [{ x: 100, y: 160 }],
        text: 'WTP SOURCE ZONE',
        fontSize: 14
      },
      {
        id: 'cad-txt-2',
        type: 'cad_text',
        layer: 'ANNOTATIONS',
        color: '#38bdf8',
        lineWidth: 1,
        points: [{ x: 550, y: 50 }],
        text: 'NORTH COMMERCIAL LOOP',
        fontSize: 14
      },
      {
        id: 'cad-txt-3',
        type: 'cad_text',
        layer: 'ANNOTATIONS',
        color: '#a855f7',
        lineWidth: 1,
        points: [{ x: 920, y: 360 }],
        text: 'LOW PRESSURE VALVE ZONE',
        fontSize: 14
      }
    ],
    gisLayers: [
      {
        id: 'osm-base',
        name: 'OpenStreetMap Base',
        visible: true,
        opacity: 0.25,
        type: 'osm'
      }
    ],
    scenarios: [
      {
        id: 'base',
        name: 'Base Scenario (Average Day)',
        description: 'Standard operational day at 1.0x demand multiplier',
        demandMultiplier: 1.0,
        overrides: {}
      },
      {
        id: 'peak-hour',
        name: 'Peak Hour Demand (1.8x)',
        description: 'Morning peak hour demand condition (1.8x baseline)',
        demandMultiplier: 1.8,
        overrides: {}
      },
      {
        id: 'fire-flow',
        name: 'Fire Flow Emergency (J-03 +35 L/s)',
        description: 'Fire flow emergency at Hospital District J-03',
        demandMultiplier: 1.2,
        overrides: {
          nodeDemands: {
            'J-03': 60.0 // Increased to 60 L/s fire flow
          }
        }
      }
    ],
    activeScenarioId: 'base'
  };
}
