import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';
import { getBridgeDeckElevation, buildComprehensiveBridgeStructures } from './riverAndBridges';
import { buildAirportToUniversityFlyoverSystem, getFlyoverSurfaceElevation } from './strategicFlyoverMetro';

/**
 * Procedural asphalt texture generator with crisp white shoulders & yellow center markings
 */
function createHighwayTexture(laneCount = 4, hasMedian = true): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark asphalt base
  ctx.fillStyle = '#1e242b';
  ctx.fillRect(0, 0, 512, 512);

  // Micro aggregate asphalt noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 20;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // Left & Right Solid White Shoulder Lines (Road Edges)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(16, 0, 10, 512);
  ctx.fillRect(512 - 26, 0, 10, 512);

  // Center Median Markings
  if (hasMedian) {
    // Double Solid Yellow Line
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(256 - 9, 0, 6, 512);
    ctx.fillRect(256 + 3, 0, 6, 512);
  } else {
    // Single Dashed Yellow Line
    ctx.fillStyle = '#f59e0b';
    for (let y = 0; y < 512; y += 64) {
      ctx.fillRect(256 - 4, y, 8, 36);
    }
  }

  // Dashed White Lane Dividers
  if (laneCount >= 4) {
    ctx.fillStyle = '#f1f5f9';
    const leftLaneX = 136;
    const rightLaneX = 376;
    for (let y = 0; y < 512; y += 64) {
      ctx.fillRect(leftLaneX - 3, y, 6, 36);
      ctx.fillRect(rightLaneX - 3, y, 6, 36);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 24);
  return tex;
}

/**
 * Procedural Village Brick / Weathered Herringbone Road Texture (গ্রামের ইটের/পাকা রাস্তা)
 */
function createVillageRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Weathered Terracotta Red/Brown Brick Foundation
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 0, 512, 512);

  // Herringbone brick pattern
  const brickW = 28;
  const brickH = 14;
  for (let y = 0; y < 512; y += brickH) {
    const rowOffset = ((y / brickH) % 2) * (brickW / 2);
    for (let x = 0; x < 512; x += brickW) {
      const shade = 100 + Math.floor(Math.random() * 45);
      ctx.fillStyle = `rgb(${shade + 40}, ${shade - 15}, ${shade - 45})`;
      ctx.fillRect(x + rowOffset + 1, y + 1, brickW - 2, brickH - 2);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + rowOffset, y, brickW, brickH);
    }
  }

  // Earthen / Grass Shoulders on both sides
  ctx.fillStyle = '#3f6212'; // Grassy border
  ctx.fillRect(0, 0, 18, 512);
  ctx.fillRect(512 - 18, 0, 18, 512);

  // Soft weathered white edge marking
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(20, 0, 5, 512);
  ctx.fillRect(512 - 25, 0, 5, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 32);
  return tex;
}

/**
 * Procedural Urban Avenue Texture with Sidewalks & Curbs
 */
function createUrbanAvenueTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Sidewalk concrete borders
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, 512, 512);

  // Asphalt road deck
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(40, 0, 432, 512);

  // Solid White Edge Lines
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(48, 0, 8, 512);
  ctx.fillRect(512 - 56, 0, 8, 512);

  // Center Double Yellow
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(256 - 8, 0, 5, 512);
  ctx.fillRect(256 + 3, 0, 5, 512);

  // Dashed White Lane Lines
  ctx.fillStyle = '#f8fafc';
  for (let y = 0; y < 512; y += 64) {
    ctx.fillRect(150, y, 6, 36);
    ctx.fillRect(356, y, 6, 36);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 24);
  return tex;
}

export interface MasterPlanRoadSystemResult {
  group: THREE.Group;
  bridgesGroup: THREE.Group;
  flyoversGroup: THREE.Group;
  isPointOnRoad: (x: number, z: number) => { onRoad: boolean; roadName: string; roadClass: string; speedLimit: number };
}

/**
 * Helper to get the correct solid ground or bridge surface height
 */
function getRoadSurfaceElevation(x: number, z: number): number {
  const flyoverElev = getFlyoverSurfaceElevation(x, z);
  if (flyoverElev !== null) {
    return flyoverElev;
  }
  const bridgeElev = getBridgeDeckElevation(x, z);
  if (bridgeElev !== null) {
    return bridgeElev;
  }
  return calcMasterPlanElevation(x, z);
}

/**
 * Builds the Complete Master Road & Flyover System with Real Classifications:
 * 1. Expressways (6-8 Lane, East-West, West Airport-Seaport, East Innovation)
 * 2. National Highway & Arterials (North-South Grand Highway, Central Downtown Boulevard, Coastal Arterial)
 * 3. Downtown Collector Grid (4-Lane Avenues, Curbs, Pedestrian Sidewalks)
 * 4. Industrial & Logistics Arterials (SEZ & Airport Cargo Connectors)
 * 5. Suburban & Township Roads (Suburban Residential & University Campus)
 * 6. Rural & Village Roads (Agro Fields, Wind Mountain, Lake Trail, Forestry Eco-Road)
 * 7. Specific Targeted Flyovers (Grand Central Interchange, Airport Terminal Flyover, SEZ Port Freight Flyover)
 */
export function buildMasterPlanRoadNetwork(): MasterPlanRoadSystemResult {
  const group = new THREE.Group();
  group.name = 'master_plan_classified_road_network';

  const bridgesGroup = new THREE.Group();
  bridgesGroup.name = 'river_bridges';
  group.add(bridgesGroup);

  const flyoversGroup = new THREE.Group();
  flyoversGroup.name = 'targeted_flyovers';
  group.add(flyoversGroup);

  // Textures & Materials
  const highwayTex = createHighwayTexture(4, true);
  const urbanTex = createUrbanAvenueTexture();
  const villageTex = createVillageRoadTexture();
  const ruralAsphaltTex = createHighwayTexture(2, false);

  const expresswayMat = new THREE.MeshStandardMaterial({
    map: highwayTex,
    roughness: 0.8,
    metalness: 0.1,
  });

  const highwayMat = new THREE.MeshStandardMaterial({
    map: highwayTex,
    roughness: 0.85,
    metalness: 0.08,
  });

  const urbanAvenueMat = new THREE.MeshStandardMaterial({
    map: urbanTex,
    roughness: 0.82,
    metalness: 0.05,
  });

  const villageRoadMat = new THREE.MeshStandardMaterial({
    map: villageTex,
    roughness: 0.95,
    metalness: 0.02,
  });

  const ruralRoadMat = new THREE.MeshStandardMaterial({
    map: ruralAsphaltTex,
    roughness: 0.9,
    metalness: 0.04,
  });

  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.7,
    metalness: 0.2,
  });

  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    roughness: 0.75,
  });

  // =========================================================================
  // 1. HELPER BUILDERS: STRAIGHT & CURVED CLASSIFIED ROADS
  // =========================================================================

  // Helper A: Build an axis-aligned straight road strip
  const buildStraightRoad = (
    name: string,
    xStart: number,
    zStart: number,
    xEnd: number,
    zEnd: number,
    width: number,
    material: THREE.Material,
    hasJerseyMedian = false
  ) => {
    const isZAxis = Math.abs(xStart - xEnd) < Math.abs(zStart - zEnd);
    const length = Math.hypot(xEnd - xStart, zEnd - zStart);
    const segments = Math.max(16, Math.floor(length / 25));

    const geo = isZAxis
      ? new THREE.PlaneGeometry(width, length, 2, segments)
      : new THREE.PlaneGeometry(length, width, segments, 2);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const midX = (xStart + xEnd) / 2;
    const midZ = (zStart + zEnd) / 2;

    for (let i = 0; i < pos.count; i++) {
      const px = midX + pos.getX(i);
      const pz = midZ + pos.getZ(i);
      const elev = getRoadSurfaceElevation(px, pz);
      pos.setY(i, Math.max(elev, 0.4) + 0.16);
    }
    geo.computeVertexNormals();

    const roadMesh = new THREE.Mesh(geo, material);
    roadMesh.name = name;
    roadMesh.position.set(midX, 0, midZ);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // Jersey barrier median for high-speed expressways
    if (hasJerseyMedian && width >= 36) {
      const medGeo = isZAxis
        ? new THREE.BoxGeometry(1.6, 1.1, length)
        : new THREE.BoxGeometry(length, 1.1, 1.6);
      const medianMesh = new THREE.Mesh(medGeo, barrierMat);
      const avgElev = getRoadSurfaceElevation(midX, midZ);
      medianMesh.position.set(midX, Math.max(avgElev, 0.4) + 0.7, midZ);
      group.add(medianMesh);
    }
  };

  // Helper B: Build curved / organic village & rural spline road
  const buildCurvedRoad = (
    name: string,
    points: THREE.Vector3[],
    width: number,
    material: THREE.Material
  ) => {
    // Elevate spline nodes according to terrain
    points.forEach((pt) => {
      pt.y = Math.max(getRoadSurfaceElevation(pt.x, pt.z), 0.4) + 0.16;
    });

    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
    const steps = Math.max(40, points.length * 15);
    const roadGeo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const curvePoints = curve.getPoints(steps);
    for (let i = 0; i <= steps; i++) {
      const pt = curvePoints[i];
      const u = i / steps;
      const tan = curve.getTangentAt(u).normalize();
      const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      const groundElev = Math.max(getRoadSurfaceElevation(pt.x, pt.z), 0.4) + 0.16;

      const lx = pt.x - norm.x * (width / 2);
      const lz = pt.z - norm.z * (width / 2);
      const rx = pt.x + norm.x * (width / 2);
      const rz = pt.z + norm.z * (width / 2);

      positions.push(lx, groundElev, lz);
      positions.push(rx, groundElev, rz);

      uvs.push(0, u * (steps / 2));
      uvs.push(1, u * (steps / 2));

      if (i < steps) {
        const v0 = i * 2;
        const v1 = i * 2 + 1;
        const v2 = (i + 1) * 2;
        const v3 = (i + 1) * 2 + 1;
        indices.push(v0, v1, v2);
        indices.push(v1, v3, v2);
      }
    }

    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setIndex(indices);
    roadGeo.computeVertexNormals();

    const roadMesh = new THREE.Mesh(roadGeo, material);
    roadMesh.name = name;
    roadMesh.receiveShadow = true;
    group.add(roadMesh);
  };

  // =========================================================================
  // 2. CLASS 1: NATIONAL EXPRESSWAYS (6-8 Lane, 44m-50m Width, 100-120 km/h)
  // =========================================================================

  // 1a. East-West Northern Super-Expressway (Z = -3000m, across 10 km)
  buildStraightRoad('ew_super_expressway', -5000, -3000, 5000, -3000, 48, expresswayMat, true);

  // 1b. Western Airport - Seaport Expressway (X = -3200m, from Z = -3000 to +4600)
  buildStraightRoad('west_airport_seaport_expwy', -3200, -3000, -3200, 4600, 44, expresswayMat, true);

  // 1c. Eastern Innovation & SEZ Expressway (X = +3200m, from Z = -3000 to +4600)
  buildStraightRoad('east_innovation_expwy', 3200, -3000, 3200, 4600, 44, expresswayMat, true);

  // =========================================================================
  // 3. CLASS 2: PRIMARY NATIONAL HIGHWAYS & MAJOR ARTERIALS (32m-38m Width)
  // =========================================================================

  // 2a. Grand North-South National Highway (X = 0, across 10 km from Z = -5000 to +5000)
  buildStraightRoad('ns_grand_national_highway', 0, -5000, 0, 5000, 36, highwayMat, false);

  // 2b. Central Downtown Grand Boulevard (Z = 0, spanning X = -3200 to +3200)
  buildStraightRoad('downtown_central_grand_boulevard', -3200, 0, 3200, 0, 32, urbanAvenueMat, false);

  // 2c. Southern Coastal Marine Highway (Z = +4500m, spanning X = -4800 to +4800)
  buildStraightRoad('southern_coastal_marine_highway', -4800, 4500, 4800, 4500, 34, highwayMat, true);

  // =========================================================================
  // 4. CLASS 3: URBAN COLLECTOR & INTER-DISTRICT AVENUES (22m-26m Width)
  // =========================================================================

  // 3a. West Downtown Civic Avenue (X = -1200m, spanning Z = -2400 to +2400)
  buildStraightRoad('west_downtown_civic_avenue', -1200, -2400, -1200, 2400, 24, urbanAvenueMat, false);

  // 3b. East Downtown Civic Avenue (X = +1200m, spanning Z = -2400 to +2400)
  buildStraightRoad('east_downtown_civic_avenue', 1200, -2400, 1200, 2400, 24, urbanAvenueMat, false);

  // 3c. North Downtown Boulevard (Z = -1200m, spanning X = -2800 to +2800)
  buildStraightRoad('north_downtown_boulevard', -2800, -1200, 2800, -1200, 24, urbanAvenueMat, false);

  // 3d. South Downtown Boulevard (Z = +1200m, spanning X = -2800 to +2800)
  buildStraightRoad('south_downtown_boulevard', -2800, 1200, 2800, 1200, 24, urbanAvenueMat, false);

  // 3e. Olympic Arena & Sports District Parkway (Z = +2200m, spanning X = -2000 to +2000)
  buildStraightRoad('olympic_arena_parkway', -2000, 2200, 2000, 2200, 22, urbanAvenueMat, false);

  // 3f. University & Innovation Campus Avenue (X = +4200m, spanning Z = -4800 to -2400)
  buildStraightRoad('university_campus_avenue', 4200, -4800, 4200, -2400, 22, urbanAvenueMat, false);

  // =========================================================================
  // 5. CLASS 4: HEAVY INDUSTRIAL & LOGISTICS ARTERIALS (20m-24m Width)
  // =========================================================================

  // 4a. Airport Cargo & Logistics Connector (Z = +2000m, spanning X = -4800 to -2000)
  buildStraightRoad('airport_cargo_logistics_road', -4800, 2000, -2000, 2000, 22, highwayMat, false);

  // 4b. SEZ Economic Zone & Container Terminal Arterial (Z = +3600m, spanning X = +800 to +3200)
  buildStraightRoad('sez_container_terminal_arterial', 800, 3600, 3200, 3600, 24, highwayMat, false);

  // 4c. North-West Heavy Machinery Logistics Road (X = -2000m, spanning Z = -2800 to -1200)
  buildStraightRoad('nw_machinery_logistics_road', -2000, -2800, -2000, -1200, 20, highwayMat, false);

  // =========================================================================
  // 6. CLASS 5: SUBURBAN RESIDENTIAL & TOWNSHIP ROADS (14m-16m Width)
  // =========================================================================

  // 5a. East Green Residential Grid (X = +2200m, spanning Z = -2400 to -800)
  buildStraightRoad('east_residential_suburb_main', 2200, -2400, 2200, -800, 16, ruralRoadMat, false);
  buildStraightRoad('east_residential_suburb_cross1', 1400, -1600, 3000, -1600, 14, ruralRoadMat, false);
  buildStraightRoad('east_residential_suburb_cross2', 1400, -2000, 3000, -2000, 14, ruralRoadMat, false);

  // 5b. South Township & Medium Density Housing Grid (X: -1600 to +800, Z: +3200 to +4200)
  buildStraightRoad('south_township_main_avenue', -600, 3200, -600, 4400, 16, ruralRoadMat, false);
  buildStraightRoad('south_township_cross_road1', -1600, 3800, 800, 3800, 14, ruralRoadMat, false);

  // =========================================================================
  // 7. CLASS 6: RURAL, VILLAGE & AGRICULTURAL ROADS (গ্রামের মেঠো ও পাকা রাস্তা)
  // (8m-10m Width, Herringbone Brick / Weathered Rural Asphalt with Soft Shoulders)
  // =========================================================================

  // 6a. North Agricultural & Agro-Engineering Village Loop (Crops, Orchards, Tube-wells)
  buildCurvedRoad(
    'north_agro_village_road',
    [
      new THREE.Vector3(-2200, 0, -3200),
      new THREE.Vector3(-1800, 0, -3600),
      new THREE.Vector3(-1400, 0, -4100),
      new THREE.Vector3(-900, 0, -4600),
      new THREE.Vector3(-300, 0, -4800),
      new THREE.Vector3(0, 0, -4800),
    ],
    9.5,
    villageRoadMat
  );

  buildCurvedRoad(
    'north_agro_field_connector',
    [
      new THREE.Vector3(-1800, 0, -3600),
      new THREE.Vector3(-1200, 0, -3400),
      new THREE.Vector3(-600, 0, -3500),
      new THREE.Vector3(0, 0, -3500),
    ],
    8.5,
    villageRoadMat
  );

  // 6b. North-West Mountain & Wind Farm Winding Switchback Trail
  buildCurvedRoad(
    'nw_mountain_wind_farm_trail',
    [
      new THREE.Vector3(-3200, 0, -3000),
      new THREE.Vector3(-3700, 0, -3400),
      new THREE.Vector3(-4200, 0, -3800),
      new THREE.Vector3(-4600, 0, -4300),
      new THREE.Vector3(-4800, 0, -4800),
    ],
    8.0,
    ruralRoadMat
  );

  // 6c. North-East Reservoir & Pukur Village Trail (Embankment road with tea stalls)
  buildCurvedRoad(
    'ne_reservoir_village_trail',
    [
      new THREE.Vector3(1200, 0, -3000),
      new THREE.Vector3(1800, 0, -3500),
      new THREE.Vector3(2400, 0, -4000),
      new THREE.Vector3(3000, 0, -4500),
      new THREE.Vector3(3600, 0, -4800),
    ],
    9.0,
    villageRoadMat
  );

  // 6d. South-East Forestry Biosphere & Eco-Reserve Trail (Mangrove & tree canopy)
  buildCurvedRoad(
    'se_forestry_eco_trail',
    [
      new THREE.Vector3(3200, 0, 3600),
      new THREE.Vector3(3700, 0, 4000),
      new THREE.Vector3(4200, 0, 4400),
      new THREE.Vector3(4700, 0, 4700),
    ],
    8.5,
    villageRoadMat
  );

  // =========================================================================
  // 8. UNIFIED STRATEGIC ELEVATED FLYOVER & METRO CORRIDOR (Airport -> Residential -> University)
  // =========================================================================
  const strategicFlyoverSystem = buildAirportToUniversityFlyoverSystem();
  flyoversGroup.add(strategicFlyoverSystem.group);

  // =========================================================================
  // 9. ARCHITECTURAL RIVER BRIDGES
  // =========================================================================
  const detailedBridges = buildComprehensiveBridgeStructures();
  bridgesGroup.add(detailedBridges);

  // =========================================================================
  // 10. CLASSIFIED ROAD POINT DETECTION (For UI HUD & Vehicle Simulation)
  // =========================================================================
  const isPointOnRoad = (x: number, z: number): { onRoad: boolean; roadName: string; roadClass: string; speedLimit: number } => {
    // 1. East-West Northern Super Expressway (Z = -3000)
    if (Math.abs(z - (-3000)) <= 25) {
      return { onRoad: true, roadName: 'East-West Northern Super-Expressway (8-Lane)', roadClass: 'National Expressway', speedLimit: 120 };
    }
    // 2. West Airport-Seaport Expressway (X = -3200)
    if (Math.abs(x - (-3200)) <= 23 && z >= -3000 && z <= 4600) {
      return { onRoad: true, roadName: 'Western Airport-Seaport Expressway (6-Lane)', roadClass: 'National Expressway', speedLimit: 110 };
    }
    // 3. East Innovation Expressway (X = +3200)
    if (Math.abs(x - 3200) <= 23 && z >= -3000 && z <= 4600) {
      return { onRoad: true, roadName: 'Eastern Innovation Expressway (6-Lane)', roadClass: 'National Expressway', speedLimit: 110 };
    }
    // 4. North-South Grand National Highway (X = 0)
    if (Math.abs(x) <= 19) {
      return { onRoad: true, roadName: 'Grand National Highway (North-South)', roadClass: 'Primary National Highway', speedLimit: 90 };
    }
    // 5. Central Downtown Grand Boulevard (Z = 0)
    if (Math.abs(z) <= 17 && Math.abs(x) <= 3200) {
      return { onRoad: true, roadName: 'Downtown Central Grand Boulevard', roadClass: 'Primary City Arterial', speedLimit: 60 };
    }
    // 6. Southern Coastal Marine Highway (Z = +4500)
    if (Math.abs(z - 4500) <= 18) {
      return { onRoad: true, roadName: 'Southern Coastal Marine Highway', roadClass: 'Primary Highway', speedLimit: 80 };
    }
    // 7. Downtown Civic Avenues (X = -1200, X = +1200, Z = -1200, Z = +1200)
    if ((Math.abs(x - (-1200)) <= 13 || Math.abs(x - 1200) <= 13) && Math.abs(z) <= 2400) {
      return { onRoad: true, roadName: 'Downtown Civic Collector Avenue', roadClass: 'Urban Avenue', speedLimit: 50 };
    }
    if ((Math.abs(z - (-1200)) <= 13 || Math.abs(z - 1200) <= 13) && Math.abs(x) <= 2800) {
      return { onRoad: true, roadName: 'Downtown Outer Boulevard', roadClass: 'Urban Avenue', speedLimit: 50 };
    }
    // 8. Sports Arena & University Avenues
    if (Math.abs(z - 2200) <= 12 && Math.abs(x) <= 2000) {
      return { onRoad: true, roadName: 'Olympic Arena & Sports Parkway', roadClass: 'Urban Parkway', speedLimit: 50 };
    }
    if (Math.abs(x - 4200) <= 12 && z >= -4800 && z <= -2400) {
      return { onRoad: true, roadName: 'University & R&D Campus Avenue', roadClass: 'Campus Avenue', speedLimit: 40 };
    }
    // 9. Industrial / Logistics
    if (Math.abs(z - 2000) <= 12 && x >= -4800 && x <= -2000) {
      return { onRoad: true, roadName: 'Airport Cargo & Freight Link Road', roadClass: 'Industrial Arterial', speedLimit: 60 };
    }
    if (Math.abs(z - 3600) <= 13 && x >= 800 && x <= 3200) {
      return { onRoad: true, roadName: 'SEZ Port Container Terminal Road', roadClass: 'Industrial Arterial', speedLimit: 60 };
    }
    // 10. Village / Rural roads
    if (x >= -2400 && x <= 0 && z >= -4800 && z <= -3200) {
      return { onRoad: true, roadName: 'North Agro-Engineering Village Road (গ্রামের মেঠো পথ)', roadClass: 'Village Heritage Road', speedLimit: 30 };
    }
    if (x >= 2800 && x <= 4800 && z >= 3200 && z <= 4800) {
      return { onRoad: true, roadName: 'Forestry Biosphere Scenic Eco-Road', roadClass: 'Eco-Reserve Trail', speedLimit: 30 };
    }

    return { onRoad: false, roadName: '', roadClass: 'Off-Road Terrain', speedLimit: 25 };
  };

  return {
    group,
    bridgesGroup,
    flyoversGroup,
    isPointOnRoad,
  };
}
