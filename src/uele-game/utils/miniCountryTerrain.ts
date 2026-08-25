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
    name: 'Metropolitan Urban Core',
    category: 'city',
    center: [15, 10],
    radius: 110,
    description: 'High-density commercial skyscrapers, glass office towers, elevated metro viaduct, and civic plazas.',
    icon: '🏙️',
  },
  {
    id: 'metro_rail_viaduct_station',
    name: 'Metro Rail MRT Line & Elevated Station',
    category: 'transport',
    center: [15, -45],
    radius: 95,
    description: 'Modern elevated rapid transit viaduct, glass concourse station, platform screen doors, and active MRT train.',
    icon: '🚈',
  },
  {
    id: 'grand_railway_junction',
    name: 'Central Intercity Railway Terminal',
    category: 'transport',
    center: [-120, 25],
    radius: 120,
    description: 'Dual standard-gauge rail tracks, ballast bed, level crossing gates, passenger platforms, and moving freight & express trains.',
    icon: '🚉',
  },
  {
    id: 'urban_hospital_complex',
    name: 'General Hospital & Trauma Center',
    category: 'city',
    center: [-75, -55],
    radius: 75,
    description: 'Modern multi-story medical facility with emergency ambulance entrance, triage bays, and rooftop helipad.',
    icon: '🏥',
  },
  {
    id: 'foundation_construction_site',
    name: 'Deep Foundation & Tower Crane Site',
    category: 'industry',
    center: [-30, -55],
    radius: 65,
    description: 'Active civil construction zone with deep earthwork excavation, yellow lattice tower crane, excavators, and rebar structures.',
    icon: '🏗️',
  },
  {
    id: 'urban_public_park',
    name: 'Central Urban Park & Playground',
    category: 'city',
    center: [-30, -20],
    radius: 50,
    description: 'Landscaped public recreation park with playground equipment, shade gazebos, walking paths, and flowering trees.',
    icon: '🌳',
  },
  {
    id: 'grand_mosque_monument',
    name: 'Grand Mosque & Heritage Complex',
    category: 'city',
    center: [70, -50],
    radius: 80,
    description: 'Iconic civic monumental architecture with pure white domes, four slender minarets, and terracotta brick heritage pavilion.',
    icon: '🕌',
  },
  {
    id: 'curved_highway_flyover',
    name: 'Multi-Level Highway Flyover Interchange',
    category: 'transport',
    center: [38, -22],
    radius: 75,
    description: 'Engineered grade-separated elevated flyover loop connecting urban boulevards to the national highway system.',
    icon: '🛣️',
  },
  {
    id: 'deep_sea_ocean_port',
    name: 'Maritime Deep Sea Port & Terminal',
    category: 'industry',
    center: [600, 1800],
    radius: 260,
    description: 'Deepwater container harbor with ultra large ocean container ships, STS gantry cranes, container stacks, and cargo trucks.',
    icon: '⚓',
  },
  {
    id: 'coastal_lighthouse_point',
    name: 'Bay of Bengal Beacon Lighthouse Point',
    category: 'transport',
    center: [1200, 2200],
    radius: 180,
    description: 'Historic oceanic lighthouse with rotating navigation light beam, rocky breakwaters, and panoramic coastal sea view.',
    icon: '🗼',
  },
  {
    id: 'sundarbans_mangrove_forest',
    name: 'Sundarbans Mangrove Wetland & Watchtower',
    category: 'agriculture',
    center: [800, -800],
    radius: 280,
    description: 'Dense mangrove forest canopy with pneumatophore root systems, forest ranger watchtower, and wooden nature boardwalks.',
    icon: '🌳',
  },
  {
    id: 'northern_rainforest_reserve',
    name: 'Northern Evergreen Rainforest & Biosphere',
    category: 'agriculture',
    center: [-600, -1500],
    radius: 280,
    description: 'Dense wilderness rainforest with towering pine and sal tree canopies, ranger lodge, and scenic mountain trails.',
    icon: '🌲',
  },
  {
    id: 'himalayan_mountain_peak',
    name: 'High Mountain Summit & Scenic Overlook',
    category: 'mountain',
    center: [-1600, -2200],
    radius: 350,
    description: 'Elevated mountain peaks with winding switchback roads, observation deck, telecommunication mast, and sheer cliff walls.',
    icon: '⛰️',
  },
  {
    id: 'tea_gardens_highland',
    name: 'Highland Tea Estate & Terraces',
    category: 'agriculture',
    center: [-1800, 400],
    radius: 300,
    description: 'Terraced emerald tea bush plantations, winding agricultural bypass road, and tea processing estate factory.',
    icon: '🍃',
  },
  {
    id: 'thermal_power_substation',
    name: 'Power Generation Plant & HV Substation',
    category: 'energy',
    center: [200, -150],
    radius: 120,
    description: 'Thermal generation plant with twin cooling stacks, 230kV high-voltage step-up transformers, busbars, and steel transmission pylons.',
    icon: '🏭',
  },
  {
    id: 'padma_river_bridge',
    name: 'Grand Cable-Stayed River Bridge',
    category: 'transport',
    center: [160, -10],
    radius: 95,
    description: 'Iconic multi-span cable-stayed suspension bridge spanning the wide river with dual highway and rail decks.',
    icon: '🌉',
  },
  {
    id: 'agricultural_delta_harvesters',
    name: 'Delta Farmlands & Precision Agriculture',
    category: 'agriculture',
    center: [90, 60],
    radius: 110,
    description: 'Irrigated alluvial paddy plots, combine harvesters, farm tractors, polytunnels, and fish farm ponds.',
    icon: '🌾',
  },
  {
    id: 'rural_engineering_village',
    name: 'Rural Delta Village & Homesteads',
    category: 'agriculture',
    center: [-220, -20],
    radius: 110,
    description: 'Traditional tin-roof homestead courtyards (*Bari*), fresh vegetable market (*Haat*), and irrigation canals.',
    icon: '🏡',
  },
  {
    id: 'mountain_highway_tunnel',
    name: 'Mountain Highway Tunnel',
    category: 'transport',
    center: [-220, -240],
    radius: 90,
    description: 'Subterranean dual-tube highway tunnel with longitudinal jet fan ventilation through the mountain range.',
    icon: '🚇',
  },
  {
    id: 'mountain_wind_farm',
    name: 'Wind Energy Mountain Ridge',
    category: 'energy',
    center: [-220, -250],
    radius: 130,
    description: 'High-altitude wind energy farm featuring large 3-blade HAWT turbines generating renewable electricity.',
    icon: '⚡',
  },
  {
    id: 'hydro_dam_reservoir',
    name: 'Hydroelectric Gravity Dam & Spillway',
    category: 'water',
    center: [180, -240],
    radius: 120,
    description: 'Roller-compacted concrete gravity dam with high-discharge radial spillway chute and mountain reservoir lake.',
    icon: '🌊',
  },
  {
    id: 'aerospace_launch_complex',
    name: 'International Airport & Space Runway',
    category: 'transport',
    center: [180, 200],
    radius: 150,
    description: 'CAT-II precision instrument runway with taking off airliners, control tower, and vertical space launch rocket pad.',
    icon: '🚀',
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
  const worldSize = 10000; // 10 km x 10 km true-scale country map (10,000m x 10,000m)
  const segments = 240;

  const geo = new THREE.PlaneGeometry(worldSize, worldSize, segments, segments);
  geo.rotateX(-Math.PI / 2);

  // Road detection & elevation alignment across full country
  const isPointOnRoad = (x: number, z: number): { onRoad: boolean; roadName: string } => {
    // 1. Central National Expressway (North-South): x = 20, z: -4800 to +4800
    if (Math.abs(x - 20) < 8.5 && z > -4800 && z < 4800) {
      return { onRoad: true, roadName: 'Trans-Country National Expressway N5' };
    }

    // 2. City East-West Boulevard (z = -10, x: -4500 to +4500)
    if (Math.abs(z - (-10)) < 7.5 && x > -4500 && x < 4500) {
      return { onRoad: true, roadName: 'Metropolitan Central East-West Corridor' };
    }

    // 3. Airport Access Highway (diagonal from (20, 100) to (180, 200))
    const distToAirportRd = Math.abs((z - 100) - 0.625 * (x - 20));
    if (x >= 15 && x <= 230 && distToAirportRd < 10 && z >= 80 && z <= 240) {
      return { onRoad: true, roadName: 'Airport Access Expressway' };
    }

    // 4. Southern Coastal Deep Sea Port & Maritime Highway (from (20, 200) to (600, 1800))
    if (z >= 180 && z <= 2400) {
      const portRoadX = 20 + (z - 200) * 0.36; // curves to x ~ 600 at z = 1800
      if (Math.abs(x - portRoadX) < 10) {
        return { onRoad: true, roadName: 'Coastal Deep Sea Port Expressway' };
      }
      // Port Waterfront Pier Loop
      if (z >= 1700 && z <= 2300 && Math.abs(x - 600) < 180 && Math.abs(z - 1800) < 12) {
        return { onRoad: true, roadName: 'Maritime Harbor Quay Boulevard' };
      }
      // Lighthouse Coastal Causeway (from 600, 1800 to 1200, 2200)
      if (x >= 580 && x <= 1250) {
        const lhRoadZ = 1800 + (x - 600) * 0.66;
        if (Math.abs(z - lhRoadZ) < 10) {
          return { onRoad: true, roadName: 'Lighthouse Coastal Causeway' };
        }
      }
    }

    // 5. Northern Mountain Summit & Ridge Pass (from (20, -10) to (-1600, -2200))
    if (z <= -10 && z >= -2400) {
      const mtnRoadX = 20 + (z - (-10)) * 0.72; // heads north-west into peaks
      if (Math.abs(x - mtnRoadX) < 11) {
        return { onRoad: true, roadName: 'Northern Mountain Summit Pass' };
      }
    }

    // 6. Western Tea Garden Highlands Highway (from (-140, -10) to (-1800, 400))
    if (x <= -120 && x >= -2000) {
      const teaRoadZ = -10 + (x - (-140)) * -0.24;
      if (Math.abs(z - teaRoadZ) < 10) {
        return { onRoad: true, roadName: 'Highland Tea Estate Highway' };
      }
    }

    // 7. National Rainforest & Mangrove Scenic Route (from (20, -10) to (800, -800))
    if (x >= 20 && x <= 950 && z <= -10 && z >= -950) {
      const forestRoadZ = -10 + (x - 20) * -1.0;
      if (Math.abs(z - forestRoadZ) < 10) {
        return { onRoad: true, roadName: 'Sundarbans Rainforest Biosphere Scenic Highway' };
      }
    }

    // 8. Central Railway Terminal Access Avenue
    if (Math.abs(z - 25) < 9 && x >= -220 && x <= -20) {
      return { onRoad: true, roadName: 'Central Railway Station Avenue' };
    }

    // 9. Metro Rail Concourse Boulevard
    if (Math.abs(z - (-45)) < 9 && x >= -60 && x <= 80) {
      return { onRoad: true, roadName: 'Metro Transit Concourse Avenue' };
    }

    // 10. Rural Agricultural Loop (around x: -200, z: -160 to 220)
    if (Math.abs(x - (-200)) < 7.0 && z > -160 && z < 220) {
      return { onRoad: true, roadName: 'Rural Agricultural Bypass' };
    }

    // 11. South Industrial Connector (z = 240, x: -220 to +50)
    if (Math.abs(z - 240) < 7.0 && x > -220 && x < 50) {
      return { onRoad: true, roadName: 'Industrial Park Access Road' };
    }

    return { onRoad: false, roadName: '' };
  };

  // Comprehensive 10km x 10km Elevation Function
  const calcElevation = (x: number, z: number): number => {
    let y = 0;

    // 1. Regional gentle delta slope across the 10km country
    y += Math.sin(x * 0.001) * 2.5 + Math.cos(z * 0.001) * 2.0;

    // 2. Far Northern Mountain Range (z < -800 to -5000)
    if (z < -600) {
      const northDist = Math.abs(z - (-600)) / 4400;
      const mtnBase = Math.pow(northDist, 1.4) * 120;
      const mtnPeaks = Math.sin(x * 0.004) * Math.cos(z * 0.004) * 45 + Math.sin(x * 0.01) * 20;
      y += mtnBase + Math.max(0, mtnPeaks);
    }

    // 3. Far Western Highlands & Tea Garden Plateaus (x < -600 to -5000)
    if (x < -500) {
      const westDist = Math.abs(x - (-500)) / 4500;
      const plateauBase = Math.pow(westDist, 1.2) * 65;
      const hills = Math.sin(x * 0.003) * Math.cos(z * 0.003) * 25;
      y += plateauBase + Math.max(0, hills);
    }

    // 4. Southern Coastal Estuary & Bay of Bengal Basin (z > +800 to +5000)
    if (z > 800) {
      const southDist = Math.min(1, (z - 800) / 4200);
      y = THREE.MathUtils.lerp(y, -0.4, southDist * 0.8);
    }

    // 5. Immediate North-West Rolling Mountains (x < 0, z < -80)
    const mtnDist = Math.hypot(x - (-240), z - (-270));
    if (mtnDist < 200) {
      const normMtn = 1 - mtnDist / 200;
      const peakHeight = Math.pow(normMtn, 1.6) * 36;
      const ridgeNoise = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 4.5 + Math.sin(x * 0.09) * 2.0;
      y += peakHeight + ridgeNoise * normMtn;
    }

    // 6. Mountain Ridge Overlook (Wind Farm Crest)
    const windFarmDist = Math.hypot(x - (-220), z - (-250));
    if (windFarmDist < 60) {
      y = Math.max(y, 24 + (1 - windFarmDist / 60) * 8);
    }

    // 7. Hydro Dam Reservoir Lake (North-East: x: 120 to 280, z: -340 to -180)
    const resDist = Math.hypot(x - 200, z - (-260));
    if (resDist < 90) {
      const bowlEdge = resDist / 90;
      y = Math.max(y, 14 + bowlEdge * 10);
    }

    // 8. Karatoya River Corridor (North to South across 10 km)
    const riverCenter = 160 + Math.sin(z * 0.015) * 45 - z * 0.08;
    const distToRiver = Math.abs(x - riverCenter);

    if (distToRiver < 42 && z > -350 && z < 4500) {
      const normDist = distToRiver / 42;
      const channelCarve = (1 - normDist) * 5.5;
      y -= channelCarve;

      // River island / Sandbar (Char) in middle reach
      if (z > -20 && z < 60 && distToRiver < 10) {
        y += 2.2 * (1 - Math.abs(z - 20) / 40) * (1 - distToRiver / 10);
      }
    }

    // 9. Smart City Core (Urban Plateau at (20, -10))
    const cityDist = Math.hypot(x - 20, z - (-10));
    if (cityDist < 110) {
      const cityFactor = 1 - cityDist / 110;
      y = THREE.MathUtils.lerp(y, 3.2, cityFactor * 0.85);
    }

    // 10. Airport Runway Plateau (x: 100 to 260, z: 120 to 280)
    if (x >= 90 && x <= 270 && z >= 110 && z <= 290) {
      const runwayDistX = Math.abs(x - 180);
      const runwayDistZ = Math.abs(z - 200);
      if (runwayDistX < 80 && runwayDistZ < 80) {
        y = THREE.MathUtils.lerp(y, 2.2, 0.95);
      }
    }

    // 11. Agricultural Rice Paddies Micro-relief (x < -60)
    if (x < -60 && x > -500 && z > -160 && z < 160) {
      const fieldX = Math.floor((x + 400) / 28);
      const fieldZ = Math.floor((z + 400) / 28);
      const terrace = ((fieldX * 3 + fieldZ * 7) % 4) * 0.25;
      y += terrace;
    }

    // 12. Village Ponds (Pukur) for aquaculture
    const distToPond1 = Math.hypot(x - (-220), z - 40);
    if (distToPond1 < 22) {
      y -= 3.0 * (1 - distToPond1 / 22);
    }
    const distToPond2 = Math.hypot(x - (-140), z - (-80));
    if (distToPond2 < 18) {
      y -= 2.6 * (1 - distToPond2 / 18);
    }

    // 13. Roads Grading / Smoothing
    const roadCheck = isPointOnRoad(x, z);
    if (roadCheck.onRoad) {
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
