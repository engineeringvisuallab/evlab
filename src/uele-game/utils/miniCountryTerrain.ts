import * as THREE from 'three';
import { createBangladeshTerrainTexture, createGrassGroundNormalMap } from './terrainTextures';

export interface MiniCountryElevationSampler {
  getElevationAt: (x: number, z: number) => number;
  isPointOnRoad: (x: number, z: number) => { onRoad: boolean; roadName: string };
  mesh: THREE.Mesh;
}

export interface LandmarkZone {
  id: string;
  name: string;
  category: 'city' | 'mountain' | 'energy' | 'transport' | 'water' | 'agriculture' | 'industry';
  center: [number, number]; // [x, z]
  radius: number;
  description: string;
  icon: string;
}

export const COUNTRY_LANDMARKS: LandmarkZone[] = [
  {
    id: 'smart_city_core',
    name: 'Smart City Central Core',
    category: 'city',
    center: [20, -10],
    radius: 120,
    description: 'High-density urban commercial center with smart infrastructure, metro line, and civic towers.',
    icon: '🏙️',
  },
  {
    id: 'city_super_mall',
    name: 'Grand City Super Mall',
    category: 'city',
    center: [-25, 10],
    radius: 70,
    description: 'Premier multi-level glass shopping mall with central atrium, retail boutiques, and rooftop dome.',
    icon: '🏬',
  },
  {
    id: 'mountain_highway_tunnel',
    name: 'Mountain Highway Tunnel',
    category: 'transport',
    center: [-220, -240],
    radius: 90,
    description: 'Illuminated multi-lane engineering highway tunnel boring straight through the Northern mountain ridge.',
    icon: '🚇',
  },
  {
    id: 'village_vegetable_bazaar',
    name: 'Krishok Haat Vegetable Market',
    category: 'agriculture',
    center: [-205, -15],
    radius: 80,
    description: 'Bustling traditional fresh vegetable bazaar (সবজির বাজার) with colorful produce crates, farm stalls, and lanterns.',
    icon: '🥦',
  },
  {
    id: 'padma_river_bridge',
    name: 'Karatoya Grand River Bridge',
    category: 'transport',
    center: [160, -10],
    radius: 90,
    description: 'Iconic cable-stayed multi-span steel girder highway bridge spanning across the Karatoya River.',
    icon: '🌉',
  },
  {
    id: 'mountain_wind_farm',
    name: 'Wind Energy Ridge & Hills',
    category: 'energy',
    center: [-220, -250],
    radius: 130,
    description: 'High-altitude scenic mountain ridge with giant 3-blade wind turbines providing clean renewable power.',
    icon: '⚡',
  },
  {
    id: 'hydro_dam_reservoir',
    name: 'Hydroelectric Dam & Reservoir',
    category: 'water',
    center: [180, -240],
    radius: 120,
    description: 'Concrete gravity dam, mountain water reservoir lake, and dynamic hydro-power spillway.',
    icon: '🌊',
  },
  {
    id: 'international_airport',
    name: 'International Airport & Runway',
    category: 'transport',
    center: [180, 200],
    radius: 140,
    description: 'Regional air terminal featuring a 240m illuminated runway, aircraft hangars, and control tower.',
    icon: '✈️',
  },
  {
    id: 'solar_energy_farm',
    name: 'Solar Energy PV Park',
    category: 'energy',
    center: [-180, 180],
    radius: 100,
    description: 'Ground-mounted high-efficiency solar panel arrays supplying grid power.',
    icon: '☀️',
  },
  {
    id: 'rural_engineering_village',
    name: 'Smart Rural Village & Bazaars',
    category: 'agriculture',
    center: [-220, -20],
    radius: 110,
    description: 'Traditional tin-gable homesteads (*Bari*), local bazaars, and community water supply ponds.',
    icon: '🏡',
  },
  {
    id: 'agricultural_paddy_zone',
    name: 'Alluvial Rice Paddies & Farmlands',
    category: 'agriculture',
    center: [-160, -120],
    radius: 110,
    description: 'Expansive alluvial floodplains with rice paddy terraces and engineered irrigation canals.',
    icon: '🌾',
  },
  {
    id: 'river_port_terminal',
    name: 'Karatoya River Port & Terminal',
    category: 'transport',
    center: [230, 20],
    radius: 100,
    description: 'River freight shipping docks, cargo cranes, and river transport access.',
    icon: '🚢',
  },
  {
    id: 'water_treatment_plant',
    name: 'Water Treatment & Clarifiers',
    category: 'industry',
    center: [-80, 240],
    radius: 80,
    description: 'Centralized regional water purification plant with aeration basins and pump house.',
    icon: '💧',
  },
];

// Returns the closest landmark zone if player is within radius
export function getNearbyLandmark(x: number, z: number): LandmarkZone | null {
  for (const lm of COUNTRY_LANDMARKS) {
    const dist = Math.hypot(x - lm.center[0], z - lm.center[1]);
    if (dist <= lm.radius) {
      return lm;
    }
  }
  return null;
}

export function buildMiniCountryTerrain(): MiniCountryElevationSampler {
  const worldSize = 800; // 800m x 800m expansive country map
  const segments = 220;

  const geo = new THREE.PlaneGeometry(worldSize, worldSize, segments, segments);
  geo.rotateX(-Math.PI / 2);

  // Road detection & elevation alignment
  const isPointOnRoad = (x: number, z: number): { onRoad: boolean; roadName: string } => {
    // 1. Central National Expressway (North-South): x = 20, z: -380 to +380
    if (Math.abs(x - 20) < 6.5 && z > -370 && z < 370) {
      return { onRoad: true, roadName: 'National Expressway N5' };
    }

    // 2. City East-West Boulevard (x: -120 to +160, z = -10)
    if (Math.abs(z - (-10)) < 6.0 && x > -140 && x < 210) {
      return { onRoad: true, roadName: 'Smart City Central Boulevard' };
    }

    // 3. Airport Highway Connector (diagonal from (20, 100) to (180, 200))
    const distToAirportRd = Math.abs((z - 100) - 0.625 * (x - 20));
    if (x >= 20 && x <= 220 && distToAirportRd < 10 && z >= 80 && z <= 240) {
      return { onRoad: true, roadName: 'Airport Access Expressway' };
    }

    // 4. Mountain Ridge Scenic Road (curves up to wind farm at (-220, -250))
    const distToMtnRd = Math.hypot(x - (-120), z - (-160));
    if (distToMtnRd > 60 && distToMtnRd < 74 && x < 0 && z < -40) {
      return { onRoad: true, roadName: 'Mountain Ridge Pass' };
    }

    // 5. Rural Village Ring Loop (around x: -200, z: -20 to 180)
    if (Math.abs(x - (-200)) < 5.0 && z > -160 && z < 220) {
      return { onRoad: true, roadName: 'Rural Agricultural Bypass' };
    }

    // 6. South Industrial Connector (z = 240, x: -200 to +30)
    if (Math.abs(z - 240) < 5.5 && x > -220 && x < 50) {
      return { onRoad: true, roadName: 'Industrial Park Access Road' };
    }

    return { onRoad: false, roadName: '' };
  };

  // Comprehensive Elevation Function
  const calcElevation = (x: number, z: number): number => {
    let y = 0;

    // 1. Regional base gentle delta slope
    y += Math.sin(x * 0.008) * 0.6 + Math.cos(z * 0.008) * 0.5;

    // 2. High Mountains & Rolling Hills (North-West: x < 0, z < -80)
    const mtnDist = Math.hypot(x - (-240), z - (-270));
    if (mtnDist < 200) {
      const normMtn = 1 - mtnDist / 200;
      // High rolling peaks with ridge noise
      const peakHeight = Math.pow(normMtn, 1.6) * 36;
      const ridgeNoise = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 4.5 + Math.sin(x * 0.09) * 2.0;
      y += peakHeight + ridgeNoise * normMtn;
    }

    // 3. Mountain Ridge Overlook (Wind Farm Crest)
    const windFarmDist = Math.hypot(x - (-220), z - (-250));
    if (windFarmDist < 60) {
      y = Math.max(y, 24 + (1 - windFarmDist / 60) * 8);
    }

    // 4. Hydro Dam Reservoir Lake (North-East: x: 120 to 280, z: -340 to -180)
    const resDist = Math.hypot(x - 200, z - (-260));
    if (resDist < 90) {
      // Mountain bowl forming the lake reservoir
      const bowlEdge = resDist / 90;
      y = Math.max(y, 14 + bowlEdge * 10);
    }

    // 5. River Corridor (Carving from North-East Dam down to South-East Port)
    // River centerline: x = 160 + sin(z * 0.015) * 45 - z * 0.08
    const riverCenter = 160 + Math.sin(z * 0.015) * 45 - z * 0.08;
    const distToRiver = Math.abs(x - riverCenter);

    if (distToRiver < 36 && z > -180) {
      // Natural parabolic channel cut
      const normDist = distToRiver / 36;
      const channelCarve = (1 - normDist) * 5.2;
      y -= channelCarve;

      // River island / Sandbar (Char) in middle reach
      if (z > -20 && z < 60 && distToRiver < 10) {
        y += 2.2 * (1 - Math.abs(z - 20) / 40) * (1 - distToRiver / 10);
      }
    }

    // 6. Smart City Core (Urban Plateau at (20, -10))
    const cityDist = Math.hypot(x - 20, z - (-10));
    if (cityDist < 110) {
      const cityFactor = 1 - cityDist / 110;
      y = THREE.MathUtils.lerp(y, 3.2, cityFactor * 0.85);
    }

    // 7. Airport Runway Plateau (x: 100 to 260, z: 120 to 280)
    if (x >= 90 && x <= 270 && z >= 110 && z <= 290) {
      const runwayDistX = Math.abs(x - 180);
      const runwayDistZ = Math.abs(z - 200);
      if (runwayDistX < 80 && runwayDistZ < 80) {
        // Flat runway zone
        y = THREE.MathUtils.lerp(y, 2.2, 0.95);
      }
    }

    // 8. Agricultural Rice Paddies Micro-relief (x < -60)
    if (x < -60 && z > -160 && z < 160) {
      const fieldX = Math.floor((x + 400) / 28);
      const fieldZ = Math.floor((z + 400) / 28);
      const terrace = ((fieldX * 3 + fieldZ * 7) % 4) * 0.25;
      y += terrace;
    }

    // 9. Village Ponds (Pukur) for aquaculture
    const distToPond1 = Math.hypot(x - (-220), z - 40);
    if (distToPond1 < 22) {
      y -= 3.0 * (1 - distToPond1 / 22);
    }
    const distToPond2 = Math.hypot(x - (-140), z - (-80));
    if (distToPond2 < 18) {
      y -= 2.6 * (1 - distToPond2 / 18);
    }

    // 10. Roads Grading / Smoothing
    const roadCheck = isPointOnRoad(x, z);
    if (roadCheck.onRoad) {
      // Ensure smooth paved road profile
      y = Math.max(y, 1.8);
    }

    return y;
  };

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vz = pos.getZ(i);
    const vy = calcElevation(vx, vz);
    pos.setY(i, vy);
  }

  geo.computeVertexNormals();

  const terrainTex = createBangladeshTerrainTexture();
  const groundNormal = createGrassGroundNormalMap();
  const mat = new THREE.MeshStandardMaterial({
    map: terrainTex,
    normalMap: groundNormal,
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughness: 0.82,
    metalness: 0.04,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.name = 'mini_country_terrain_mesh';

  return {
    getElevationAt: calcElevation,
    isPointOnRoad,
    mesh,
  };
}
