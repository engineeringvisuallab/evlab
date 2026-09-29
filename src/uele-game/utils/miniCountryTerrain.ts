import * as THREE from 'three';
import { createMasterPlanTerrainTexture, createMasterPlanNormalMap } from './masterPlanTerrain';
import { getBridgeDeckElevation, getRiverCenterZ, RIVER_HALF_WIDTH } from './riverAndBridges';
import { getFlyoverSurfaceElevation } from './strategicFlyoverMetro';
import { getBuildingRooftopElevation } from './buildingCollisions';

export interface LandmarkZone {
  id: string;
  name: string;
  category: 'city' | 'energy' | 'transport' | 'water' | 'industry' | 'agriculture' | 'mountain';
  center: [number, number];
  radius: number;
  description: string;
  icon: string;
}

// Master Plan Landmark Registry for Part 1 (Coordinate Origin (0,0), Map 10,000m x 10,000m)
export const COUNTRY_LANDMARKS: LandmarkZone[] = [
  {
    id: 'ayt_mart_mall',
    name: 'AYT Mart Shopping Mall',
    category: 'city',
    center: [85, 55],
    radius: 120,
    description: 'Grand luxury shopping complex, retail hypermarket, EV charging parking plaza, and outdoor cafes.',
    icon: '🛍️',
  },
  {
    id: 'ayt_books_library',
    name: 'AYT Books Public Library',
    category: 'city',
    center: [85, -55],
    radius: 120,
    description: 'Central Public Library & Knowledge Hub with modern book-spine louvers and reading atrium.',
    icon: '📚',
  },
  {
    id: 'uele_central_city',
    name: 'UELE Central City Core',
    category: 'city',
    center: [0, 0],
    radius: 2000,
    description: 'Starting Commercial Boulevard, AYT Civic Center, and Central Circular Skyscraper Skyline.',
    icon: '🏙️',
  },
  {
    id: 'hill_and_eco_zone',
    name: 'Hill & Eco Zone (Wind + Renewable)',
    category: 'mountain',
    center: [-3500, -3800],
    radius: 1400,
    description: 'Elevated mountain peaks with rolling green hills and active wind turbines.',
    icon: '⛰️',
  },
  {
    id: 'agro_engineering_zone',
    name: 'Agriculture & Agro-Engineering Zone',
    category: 'agriculture',
    center: [-1600, -4200],
    radius: 1100,
    description: 'Precision farming greenhouses, grain silos, and agro-storage facilities.',
    icon: '🌱',
  },
  {
    id: 'reservoir_water_zone',
    name: 'Reservoir & Water Resources Zone',
    category: 'water',
    center: [2400, -4100],
    radius: 1400,
    description: 'Engineered retention basin and municipal water reservoir.',
    icon: '🌊',
  },
  {
    id: 'university_rd_campus',
    name: 'University & R&D Campus',
    category: 'city',
    center: [4100, -4200],
    radius: 1000,
    description: 'High-tech circular academic hall, laboratory wings, and science park.',
    icon: '🎓',
  },
  {
    id: 'low_density_residential',
    name: 'Low-Density Residential Community',
    category: 'city',
    center: [1800, -2000],
    radius: 1200,
    description: 'Suburban green community with tree-lined avenues and family homes.',
    icon: '🏡',
  },
  {
    id: 'photovoltaic_solar_farm',
    name: 'High-Capacity Solar Farm',
    category: 'energy',
    center: [4000, -1800],
    radius: 1000,
    description: 'Tilted photovoltaic solar panel arrays and electrical grid sub-stations.',
    icon: '☀️',
  },
  {
    id: 'heavy_industrial_zone',
    name: 'Heavy Industrial & Logistics Hub',
    category: 'industry',
    center: [-3800, 0],
    radius: 1200,
    description: 'Manufacturing plants, cargo depots, chemical storage tanks, and gantry cranes.',
    icon: '🏭',
  },
  {
    id: 'international_airport_zone',
    name: 'International Airport & Aerospace',
    category: 'transport',
    center: [-3200, 2300],
    radius: 1500,
    description: '3.2 km runway strip, passenger terminal, ATC tower, and aircraft hangars.',
    icon: '✈️',
  },
  {
    id: 'sports_recreation_zone',
    name: 'Olympic Sports Stadium & Complex',
    category: 'city',
    center: [0, 2300],
    radius: 1000,
    description: 'Grand Olympic arena, soccer stadium bowl, aquatic center, and athletic courts.',
    icon: '🏟️',
  },
  {
    id: 'construction_heavy_equipment',
    name: 'Heavy Equipment & Construction Yard',
    category: 'industry',
    center: [2800, 2300],
    radius: 1100,
    description: 'Tower cranes, earthwork sand mounds, staging depot, and maintenance garages.',
    icon: '🏗️',
  },
  {
    id: 'coastal_wetland_floodplain',
    name: 'Coastal Wetland & Floodplain Delta',
    category: 'water',
    center: [-3600, 4200],
    radius: 1400,
    description: 'Ecological coastal estuary and deltaic retention wetlands.',
    icon: '🌾',
  },
  {
    id: 'sez_business_park',
    name: 'Special Economic Zone (SEZ)',
    category: 'city',
    center: [0, 4400],
    radius: 1100,
    description: 'Modern corporate enterprise towers and logistics technology park.',
    icon: '🏢',
  },
  {
    id: 'forestry_nature_reserve',
    name: 'Forestry & Nature Reserve Biosphere',
    category: 'agriculture',
    center: [3800, 4200],
    radius: 1200,
    description: 'Protected biosphere reserve with spotted deer herds, Royal Bengal tigers, and botanical lake.',
    icon: '🌲',
  },
  {
    id: 'rural_village_settlement',
    name: 'Rural Village & Agrarian Landscape',
    category: 'agriculture',
    center: [-1800, -3900],
    radius: 900,
    description: 'Traditional tin-shed homesteads, serpentine brick roads, golden paddy fields, and bathing pond ghat.',
    icon: '🌾',
  },
  {
    id: 'aerospace_launch_complex',
    name: 'Aerospace Spaceport & Launch Center',
    category: 'energy',
    center: [-4200, 3400],
    radius: 700,
    description: 'Satellite rocket launch platform, gantry umbilical tower, cryo propellant tanks, and launch trench.',
    icon: '🚀',
  },
  {
    id: 'wtp_upstream_plant',
    name: 'Water Treatment Plant (WTP - Upstream)',
    category: 'water',
    center: [3800, -1200],
    radius: 500,
    description: 'River intake pump house, circular clariflocculators, rapid sand filter basins, and disinfection building.',
    icon: '💧',
  },
  {
    id: 'stp_downstream_plant',
    name: 'Sewage Treatment Plant (STP - Downstream)',
    category: 'water',
    center: [-4200, -350],
    radius: 500,
    description: 'Activated sludge biological aeration basins, secondary clarifiers, and anaerobic sludge digester domes.',
    icon: '♻️',
  },
  {
    id: 'etp_industrial_plant',
    name: 'Effluent Treatment Plant (ETP - Industrial SEZ)',
    category: 'industry',
    center: [-3600, 300],
    radius: 500,
    description: 'Chemical neutralization tanks, DAF units, bioreactor towers, and filter press dewatering.',
    icon: '🧪',
  },
  {
    id: 'swm_landfill_facility',
    name: 'Solid Waste Management & Sanitary Landfill (SWM)',
    category: 'energy',
    center: [3200, 1200],
    radius: 600,
    description: 'Material recovery sorting facility (MRF), organic composting windrows, and lined landfill cells.',
    icon: '🚛',
  },
];

export function getNearbyLandmark(x: number, z: number): LandmarkZone | null {
  for (const lm of COUNTRY_LANDMARKS) {
    const dist = Math.hypot(x - lm.center[0], z - lm.center[1]);
    if (dist < lm.radius) {
      return lm;
    }
  }
  return null;
}

/**
 * Calculates the exact elevation across the 10 km x 10 km Master Plan:
 * Coordinates:
 * - Center: (0, 0)
 * - X: West (-5000) to East (+5000)
 * - Z: North (-5000) to South (+5000)
 */
export function calcMasterPlanElevation(x: number, z: number): number {
  let elevation = 0;

  // 1. Base Gentle Natural Delta Undulation (0.5m - 1.5m)
  elevation += Math.sin(x * 0.0012) * 0.8 + Math.cos(z * 0.0012) * 0.6;

  // 2. North-West Hill & Eco Zone (X: -5000 to -2200, Z: -5000 to -2400)
  // Reaches elevation of +35m to +65m with ridges and rolling peaks
  if (x < -2000 && z < -2200) {
    const nwDist = Math.hypot(x - (-3800), z - (-3800));
    if (nwDist < 2400) {
      const hillFactor = 1 - nwDist / 2400;
      const baseMtn = Math.pow(hillFactor, 1.5) * 55;
      const peaks = Math.sin(x * 0.005) * Math.cos(z * 0.005) * 14 + Math.sin(x * 0.012 + z * 0.008) * 6;
      elevation += baseMtn + Math.max(0, peaks * hillFactor);
    }
  }

  // 3. North-East Reservoir Basin (X: +1000 to +3800, Z: -5000 to -3000)
  // Carved depression (-6m to -12m) to create natural reservoir lakebed
  const resDist = Math.hypot(x - 2400, z - (-4100));
  if (resDist < 1400) {
    const basinFactor = 1 - resDist / 1400;
    const basinDepth = Math.pow(basinFactor, 1.3) * 9.5;
    elevation -= basinDepth;
  }

  // 4. Urban River Corridor (Karatoya-Style) Deep Carved Basin & Channel (Traversing West to East around Z: -600 to -1000)
  // Continuous accurate centerline: Z_river(x) = -700 - sin(x * 0.0007) * 350 + (x * 0.05)
  const riverCenterZ = getRiverCenterZ(x);
  const distToRiver = Math.abs(z - riverCenterZ);
  const riverHalfWidth = RIVER_HALF_WIDTH + 50; // 340m total carved river valley with gentle floodplains
  if (distToRiver < riverHalfWidth && x > -4990 && x < 4990) {
    const normDist = distToRiver / riverHalfWidth;
    // Cosine profile for smooth, steep natural river banks and deep flat riverbed
    const bankProfile = Math.cos(normDist * (Math.PI / 2));
    const channelDepth = Math.pow(bankProfile, 1.4) * 7.5; // Carves down to -6.5m
    elevation -= channelDepth;
  }

  // 5. South-West Coastal Wetland & Floodplain Basin (X: -5000 to -2000, Z: +3200 to +5000)
  // Gentle low-lying delta depression (-1.5m to -3.5m)
  if (x < -2000 && z > 3000) {
    const wetlandDist = Math.hypot(x - (-3800), z - 4200);
    if (wetlandDist < 2000) {
      const wetFactor = 1 - wetlandDist / 2000;
      elevation -= Math.pow(wetFactor, 1.2) * 2.8;
    }
  }

  // 6. South-East Nature Reserve Slight Undulation (X: +2800 to +5000, Z: +3200 to +5000)
  if (x > 2600 && z > 3000) {
    const forestHills = Math.sin(x * 0.003) * Math.cos(z * 0.003) * 3.5;
    elevation += Math.max(0, forestHills);
  }

  // 7. Graded Flat Civil Engineering Plateaus
  // 7a. Central Circular Core (Radius = 2000m around 0,0)
  const coreDist = Math.hypot(x, z);
  if (coreDist < 2000) {
    const coreFactor = 1 - coreDist / 2000;
    // Blend smoothly to flat elevation of +1.5m above river level
    elevation = THREE.MathUtils.lerp(elevation, 1.5, Math.min(1, coreFactor * 1.5));
  }

  // 7b. International Airport Runway Flat Corridor (X: -4800 to -1400, Z: +1400 to +3400)
  if (x >= -4800 && x <= -1400 && z >= 1400 && z <= 3400) {
    const airportDistEdge = Math.min(
      Math.abs(x - (-4800)), Math.abs(x - (-1400)),
      Math.abs(z - 1400), Math.abs(z - 3400)
    );
    const blendFactor = Math.min(1, airportDistEdge / 200);
    elevation = THREE.MathUtils.lerp(elevation, 1.2, blendFactor);
  }

  return elevation;
}

export function buildMasterPlanTerrain(): {
  mesh: THREE.Mesh;
  getElevationAt: (x: number, z: number) => number;
  isPointOnRoad: (x: number, z: number) => { onRoad: boolean; roadName: string };
} {
  // 10,000m x 10,000m (10 km x 10 km) High Resolution Plane Geometry
  const geo = new THREE.PlaneGeometry(10000, 10000, 320, 320);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vz = pos.getZ(i);
    const vy = calcMasterPlanElevation(vx, vz);
    pos.setY(i, vy);
  }

  geo.computeVertexNormals();

  const terrainTexture = createMasterPlanTerrainTexture();
  const terrainNormal = createMasterPlanNormalMap();

  const mat = new THREE.MeshStandardMaterial({
    map: terrainTexture,
    normalMap: terrainNormal,
    normalScale: new THREE.Vector2(0.4, 0.4),
    roughness: 0.85,
    metalness: 0.05,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.name = 'master_plan_terrain_mesh';

  const isPointOnRoad = (x: number, z: number): { onRoad: boolean; roadName: string } => {
    // East-West Expressway (Z = -3000)
    if (Math.abs(z - (-3000)) < 30) {
      return { onRoad: true, roadName: 'East-West Northern Super-Expressway (8-Lane)' };
    }
    // North-South National Highway (X = 0)
    if (Math.abs(x) < 25) {
      return { onRoad: true, roadName: 'Grand National Highway (North-South)' };
    }
    // Western Expressway (X = -3200)
    if (Math.abs(x - (-3200)) < 25) {
      return { onRoad: true, roadName: 'Western Airport-Seaport Expressway (6-Lane)' };
    }
    // Eastern Expressway (X = +3200)
    if (Math.abs(x - 3200) < 25) {
      return { onRoad: true, roadName: 'Eastern Innovation Expressway (6-Lane)' };
    }
    // Downtown Boulevard (Z = 0)
    if (Math.abs(z) < 20 && Math.abs(x) <= 3200) {
      return { onRoad: true, roadName: 'Downtown Central Grand Boulevard' };
    }
    // Coastal Highway (Z = +4500)
    if (Math.abs(z - 4500) < 22) {
      return { onRoad: true, roadName: 'Southern Coastal Marine Highway' };
    }
    // Village & Agro Roads
    if (x >= -2400 && x <= 0 && z >= -4800 && z <= -3200) {
      return { onRoad: true, roadName: 'North Agro Village Heritage Road' };
    }
    return { onRoad: false, roadName: '' };
  };

  const getElevationAt = (x: number, z: number): number => {
    const buildingRooftop = getBuildingRooftopElevation(x, z);
    if (buildingRooftop !== null) {
      return buildingRooftop;
    }
    const flyoverElevation = getFlyoverSurfaceElevation(x, z);
    if (flyoverElevation !== null) {
      return flyoverElevation;
    }
    const bridgeElevation = getBridgeDeckElevation(x, z);
    if (bridgeElevation !== null) {
      return bridgeElevation;
    }
    return calcMasterPlanElevation(x, z);
  };

  return {
    mesh,
    getElevationAt,
    isPointOnRoad,
  };
}

export const buildMiniCountryTerrain = buildMasterPlanTerrain;
