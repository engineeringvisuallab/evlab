import * as THREE from 'three';
import { getRiverCenterZ, RIVER_WATER_LEVEL, RIVER_HALF_WIDTH } from './riverAndBridges';

/**
 * Creates dynamic normal texture for realistic water ripples
 */
function createWaterNormalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(512, 512);
  const data = imgData.data;

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      // Perlin-like wave synthesis
      const wave1 = Math.sin((x / 512) * Math.PI * 8) * Math.cos((y / 512) * Math.PI * 8);
      const wave2 = Math.sin((x / 512 + y / 512) * Math.PI * 16) * 0.5;
      const wave3 = Math.sin((x / 512 - y / 512) * Math.PI * 24) * 0.25;
      const total = (wave1 + wave2 + wave3) / 1.75;

      const nx = Math.floor(128 + total * 110);
      const ny = Math.floor(128 + Math.cos((x / 512) * Math.PI * 12) * 60);

      data[idx] = Math.min(255, Math.max(0, nx));
      data[idx + 1] = Math.min(255, Math.max(0, ny));
      data[idx + 2] = 255;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

export interface WaterSystemInstance {
  group: THREE.Group;
  update: (delta: number, elapsed: number) => void;
}

/**
 * Builds the complete Part 2 Hydrography & Water System for UELE World (10 km x 10 km)
 * 1. Karatoya-Style Urban River (West to East corridor)
 * 2. Large North-East Reservoir Lake & Water Resources Zone
 * 3. South-West Coastal Wetland & Floodplain Delta Estuary
 * 4. Sports & Recreation Retention Lake
 * 5. Forestry & Nature Reserve Botanical Pond
 */
export function buildMasterPlanWaterSystems(): WaterSystemInstance {
  const group = new THREE.Group();
  group.name = 'master_plan_water_systems';

  const waterNormal = createWaterNormalTexture();

  // Primary River & Basin Water Material
  const riverWaterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x034b6e,
    emissiveIntensity: 0.15,
    roughness: 0.1,
    metalness: 0.85,
    transparent: true,
    opacity: 0.88,
    normalMap: waterNormal,
    normalScale: new THREE.Vector2(0.6, 0.6),
  });

  // Deep Reservoir Water Material
  const reservoirWaterMat = new THREE.MeshStandardMaterial({
    color: 0x0e7490,
    emissive: 0x083344,
    emissiveIntensity: 0.2,
    roughness: 0.08,
    metalness: 0.9,
    transparent: true,
    opacity: 0.92,
    normalMap: waterNormal,
    normalScale: new THREE.Vector2(0.8, 0.8),
  });

  // Shallow Wetland Estuary Water Material
  const wetlandWaterMat = new THREE.MeshStandardMaterial({
    color: 0x0d9488,
    emissive: 0x064e3b,
    emissiveIntensity: 0.1,
    roughness: 0.2,
    metalness: 0.7,
    transparent: true,
    opacity: 0.82,
    normalMap: waterNormal,
    normalScale: new THREE.Vector2(0.4, 0.4),
  });

  // ==========================================
  // 1. Karatoya-Style Urban River Water Mesh
  // ==========================================
  // Custom curve following the carved river channel across 10 km
  const riverSegments = 240;
  const riverWidth = RIVER_HALF_WIDTH * 2; // 240m full width
  const riverGeo = new THREE.BufferGeometry();
  const riverPositions: number[] = [];
  const riverUVs: number[] = [];
  const riverIndices: number[] = [];

  for (let i = 0; i <= riverSegments; i++) {
    const t = i / riverSegments;
    const x = -5000 + t * 10000;
    // River centerline formula matching Part 1 carved elevation
    const zCenter = getRiverCenterZ(x);
    const y = RIVER_WATER_LEVEL; // River water level nestled accurately in the carved riverbed

    // River tangents to calculate normal width offset
    const dx = 10000 / riverSegments;
    const nextX = x + dx;
    const nextZ = getRiverCenterZ(nextX);
    const tangent = new THREE.Vector2(dx, nextZ - zCenter).normalize();
    const normal = new THREE.Vector2(-tangent.y, tangent.x);

    // Left bank & Right bank vertices
    const halfW = riverWidth / 2;
    const leftX = x + normal.x * halfW;
    const leftZ = zCenter + normal.y * halfW;
    const rightX = x - normal.x * halfW;
    const rightZ = zCenter - normal.y * halfW;

    riverPositions.push(leftX, y, leftZ);
    riverPositions.push(rightX, y, rightZ);

    riverUVs.push(0, t * 40);
    riverUVs.push(1, t * 40);

    if (i < riverSegments) {
      const v0 = i * 2;
      const v1 = i * 2 + 1;
      const v2 = (i + 1) * 2;
      const v3 = (i + 1) * 2 + 1;

      riverIndices.push(v0, v1, v2);
      riverIndices.push(v2, v1, v3);
    }
  }

  riverGeo.setAttribute('position', new THREE.Float32BufferAttribute(riverPositions, 3));
  riverGeo.setAttribute('uv', new THREE.Float32BufferAttribute(riverUVs, 2));
  riverGeo.setIndex(riverIndices);
  riverGeo.computeVertexNormals();

  const riverMesh = new THREE.Mesh(riverGeo, riverWaterMat);
  riverMesh.name = 'urban_karatoya_river_mesh';
  group.add(riverMesh);

  // Decorative Urban Embankment Promenade Retaining Walls along Central Core reach (-1800m to +1800m)
  const quayMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.75,
    metalness: 0.15,
  });
  const quayGeo = new THREE.BoxGeometry(40, 2.5, 4);
  const cityQuayGroup = new THREE.Group();
  for (let qx = -1700; qx <= 1700; qx += 35) {
    const zCenter = -700 - Math.sin(qx * 0.0007) * 350 + (qx * 0.05);
    const { normalX, normalZ } = { normalX: 0, normalZ: 1 };
    
    // North Bank Promenade Wall
    const nWall = new THREE.Mesh(quayGeo, quayMat);
    nWall.position.set(qx, -1.0, zCenter - 170);
    cityQuayGroup.add(nWall);

    // South Bank Promenade Wall
    const sWall = new THREE.Mesh(quayGeo, quayMat);
    sWall.position.set(qx, -1.0, zCenter + 170);
    cityQuayGroup.add(sWall);
  }
  group.add(cityQuayGroup);

  // ==========================================
  // 2. North-East Reservoir Lake & Water Resources Zone
  // ==========================================
  // Shape-based organic lake geometry filling the carved depression at (2400, -4100)
  const reservoirShape = new THREE.Shape();
  const resSegments = 48;
  const baseResRadiusX = 1350;
  const baseResRadiusZ = 1200;

  for (let i = 0; i <= resSegments; i++) {
    const angle = (i / resSegments) * Math.PI * 2;
    // Organic lobe modulation matching Master Plan image
    const wobble =
      Math.sin(angle * 3) * 160 +
      Math.cos(angle * 5) * 90 +
      Math.sin(angle * 2) * 80;
    const rx = baseResRadiusX + wobble;
    const rz = baseResRadiusZ + wobble * 0.8;

    const px = Math.cos(angle) * rx;
    const pz = Math.sin(angle) * rz;

    if (i === 0) {
      reservoirShape.moveTo(px, pz);
    } else {
      reservoirShape.lineTo(px, pz);
    }
  }

  const resGeo = new THREE.ShapeGeometry(reservoirShape);
  resGeo.rotateX(-Math.PI / 2);
  const resMesh = new THREE.Mesh(resGeo, reservoirWaterMat);
  resMesh.position.set(2400, -2.2, -4100);
  resMesh.name = 'reservoir_lake_mesh';
  group.add(resMesh);

  // Decorative Reservoir Embankment Crest Edge
  const damWallGeo = new THREE.RingGeometry(1300, 1370, 48);
  damWallGeo.rotateX(-Math.PI / 2);
  const damWallMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.8,
  });
  const damRing = new THREE.Mesh(damWallGeo, damWallMat);
  damRing.position.set(2400, -2.0, -4100);
  group.add(damRing);

  // ==========================================
  // 3. South-West Coastal Wetland & Floodplain Delta Estuary
  // ==========================================
  // Organic wetland shallow pools at (-3600, +4200)
  const wetlandGeo = new THREE.PlaneGeometry(3200, 1600, 32, 16);
  wetlandGeo.rotateX(-Math.PI / 2);
  const wetlandMesh = new THREE.Mesh(wetlandGeo, wetlandWaterMat);
  wetlandMesh.position.set(-3500, -0.6, 4200);
  wetlandMesh.name = 'coastal_wetland_water_mesh';
  group.add(wetlandMesh);

  // ==========================================
  // 4. Sports & Recreation Retention Lake
  // ==========================================
  // Retention lake situated just south of the main stadium (-200, 3100)
  const sportsLakeGeo = new THREE.CircleGeometry(260, 32);
  sportsLakeGeo.rotateX(-Math.PI / 2);
  const sportsLakeMesh = new THREE.Mesh(sportsLakeGeo, riverWaterMat);
  sportsLakeMesh.position.set(-200, 0.4, 3050);
  sportsLakeMesh.name = 'sports_retention_lake_mesh';
  group.add(sportsLakeMesh);

  // ==========================================
  // 5. Forestry & Nature Reserve Botanical Lake (South-East)
  // ==========================================
  // Natural forest pond at (4100, 4300)
  const forestLakeGeo = new THREE.CircleGeometry(320, 32);
  forestLakeGeo.rotateX(-Math.PI / 2);
  const forestLakeMesh = new THREE.Mesh(forestLakeGeo, wetlandWaterMat);
  forestLakeMesh.position.set(4100, 0.3, 4300);
  forestLakeMesh.name = 'forestry_botanical_lake_mesh';
  group.add(forestLakeMesh);

  // Animation Update Function for Water Shaders & UV Ripples
  const update = (delta: number, elapsed: number) => {
    if (waterNormal) {
      waterNormal.offset.x = (elapsed * 0.035) % 1;
      waterNormal.offset.y = (elapsed * 0.025) % 1;
    }
  };

  return {
    group,
    update,
  };
}
