import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';
import { getFlyoverSurfaceElevation } from './strategicFlyoverMetro';

export interface VegetationSystemInstance {
  group: THREE.Group;
  totalTreeCount: number;
  update: (delta: number, elapsed: number) => void;
}

/**
 * Strict Collision & Exclusion Matrix to guarantee NO tree ever overlaps with:
 * - Roads, highways, ring road, railway
 * - River channel and lake water surfaces (guaranteed clear flowing river water between two tree-lined banks)
 * - Bridge decks, flyover viaducts, ramps
 * - Airport runways, taxiways, terminals, aerospace launch pads
 * - Stadium, Central Twin Towers, industrial factories, solar arrays, construction yards
 */
export function isTreeLocationValid(x: number, z: number, y: number): boolean {
  // 1. World Bounds Check
  if (Math.abs(x) > 4920 || Math.abs(z) > 4920) return false;

  // 2. Water Bodies & River Channel (MUST NOT BE IN WATER - KEEP CHANNEL 100% CLEAR)
  // 2a. Karatoya River (channel width 380m: clear zone ±225m from river centerline)
  const riverCenterZ = -700 - Math.sin(x * 0.0007) * 350 + (x * 0.05);
  if (Math.abs(z - riverCenterZ) < 225 || y < -0.1) {
    return false;
  }
  // 2b. North-East Reservoir Lake
  const resDist = Math.hypot(x - 2400, z - (-4100));
  if (resDist < 1420 || (x > 1100 && x < 3700 && z < -2800 && y < -1.0)) {
    return false;
  }
  // 2c. South-West Coastal Wetland Pools
  if (x < -2000 && z > 3000 && y < -0.2) {
    return false;
  }
  // 2d. Sports Retention Lake
  if (Math.hypot(x - (-200), z - 3050) < 280) {
    return false;
  }
  // 2e. Forestry Botanical Pond
  if (Math.hypot(x - 4100, z - 4300) < 340) {
    return false;
  }

  // 3. Bridges & Flyovers Over River
  if (Math.abs(z - riverCenterZ) < 360) {
    // Grand Central Arch Bridge
    if (Math.abs(x) < 55) return false;
    // Downtown Twin Avenues Bridges
    if (Math.abs(x - (-1200)) < 55 || Math.abs(x - 1200) < 55) return false;
    // East & West Suspension / Cable-Stayed Bridges
    if (Math.abs(x - (-3200)) < 55 || Math.abs(x - 3200) < 55) return false;
    // Railway Bridges
    if (Math.abs(x - (-4100)) < 50 || Math.abs(x - 3600) < 50) return false;
  }

  // Check Flyover & Ramps Elevated Deck
  if (getFlyoverSurfaceElevation(x, z) !== null) {
    return false;
  }

  // 4. Roads, Expressways, Highways & Rails
  // 4a. East-West Expressway (Z = -3000)
  if (Math.abs(z - (-3000)) < 45) return false;
  // 4b. North-South National Highway (X = 0)
  if (Math.abs(x) < 38) return false;
  // 4c. Ring Road (Radius = 2000m)
  const distToCenter = Math.hypot(x, z);
  if (Math.abs(distToCenter - 2000) < 48) return false;
  // 4d. East-West Railway (Z = 0)
  if (Math.abs(z) < 32) return false;
  // 4e. Central City Radial Boulevards (Diagonal axes at 45 deg)
  if (distToCenter < 1950) {
    const diag1 = Math.abs(x - z) / Math.SQRT2;
    const diag2 = Math.abs(x + z) / Math.SQRT2;
    if (diag1 < 28 || diag2 < 28) return false;
  }

  // 5. International Airport & Aerospace Corridor
  if (x >= -4850 && x <= -1350 && z >= 1400 && z <= 3400) {
    return false;
  }

  // 6. Olympic Sports Stadium & Arena Complex
  if (Math.abs(x) < 550 && z >= 1950 && z <= 2650) {
    return false;
  }

  // 7. Central City Core - High-Density Footprints
  if (distToCenter < 420) return false;
  if (distToCenter < 1200) {
    const blockX = Math.abs(x) % 300;
    const blockZ = Math.abs(z) % 300;
    if (blockX < 85 || blockZ < 85) return false;
  }

  // 8. Photovoltaic Solar Farm Arrays
  if (x >= 3100 && x <= 4850 && z >= -2700 && z <= -1000) {
    return false;
  }

  // 9. Heavy Industrial Plants & Chemical Storage
  if (x >= -4850 && x <= -2500 && z >= -850 && z <= 850) {
    return false;
  }

  // 10. Construction Heavy Equipment Yard
  if (x >= 2100 && x <= 3900 && z >= 1800 && z <= 2900) {
    return false;
  }

  // 11. Agricultural Greenhouses
  if (x >= -2500 && x <= -700 && z >= -4850 && z <= -3500) {
    const ghX = Math.abs(x) % 200;
    if (ghX < 120) return false;
  }

  return true;
}

/**
 * Builds the complete High-Performance Instanced Vegetation System across UELE 10 km x 10 km
 */
export function buildVegetationSystem(): VegetationSystemInstance {
  const group = new THREE.Group();
  group.name = 'master_plan_vegetation_system';

  // =========================================================================
  // TREE MESH GEOMETRIES & MATERIALS (4 Distinct Botanical Archetypes)
  // =========================================================================

  // Archetype 1: Conifer / Pine (Forestry Reserve & Hill Peaks)
  const pineTrunkGeo = new THREE.CylinderGeometry(0.8, 1.4, 14, 6);
  pineTrunkGeo.translate(0, 7, 0);
  const pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });

  const pineFoliageGeo = new THREE.ConeGeometry(7.5, 22, 7);
  pineFoliageGeo.translate(0, 21, 0);
  const pineFoliageMat = new THREE.MeshStandardMaterial({
    color: 0x14532d, // Deep Forest Evergreen
    roughness: 0.85,
    metalness: 0.05,
  });

  // Archetype 2: Deciduous Broadleaf / Oak (Suburban, riverbanks, parks)
  const oakTrunkGeo = new THREE.CylinderGeometry(1.0, 1.6, 10, 6);
  oakTrunkGeo.translate(0, 5, 0);
  const oakTrunkMat = new THREE.MeshStandardMaterial({ color: 0x543310, roughness: 0.9 });

  const oakFoliageGeo = new THREE.DodecahedronGeometry(8.5, 1);
  oakFoliageGeo.translate(0, 16, 0);
  const oakFoliageMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a, // Vibrant Spring Green
    roughness: 0.8,
  });

  // Archetype 3: Waterfront Palm (Riverbanks & Wetlands)
  const palmTrunkGeo = new THREE.CylinderGeometry(0.5, 0.9, 12, 6);
  palmTrunkGeo.translate(0, 6, 0);
  const palmFoliageGeo = new THREE.ConeGeometry(6.5, 6, 6);
  palmFoliageGeo.translate(0, 14, 0);
  const palmFoliageMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.8 });

  // Archetype 4: Flowering Cherry / Jacaranda (University & Residential Parks)
  const cherryFoliageMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6, // Sakura Pink
    roughness: 0.75,
  });

  // Target Capacities
  const maxPines = 3200;
  const maxOaks = 2600;
  const maxPalms = 800;
  const maxCherries = 600;

  const pineTrunkInst = new THREE.InstancedMesh(pineTrunkGeo, pineTrunkMat, maxPines);
  const pineFoliageInst = new THREE.InstancedMesh(pineFoliageGeo, pineFoliageMat, maxPines);

  const oakTrunkInst = new THREE.InstancedMesh(oakTrunkGeo, oakTrunkMat, maxOaks);
  const oakFoliageInst = new THREE.InstancedMesh(oakFoliageGeo, oakFoliageMat, maxOaks);

  const palmTrunkInst = new THREE.InstancedMesh(palmTrunkGeo, oakTrunkMat, maxPalms);
  const palmFoliageInst = new THREE.InstancedMesh(palmFoliageGeo, palmFoliageMat, maxPalms);

  const cherryTrunkInst = new THREE.InstancedMesh(oakTrunkGeo, oakTrunkMat, maxCherries);
  const cherryFoliageInst = new THREE.InstancedMesh(oakFoliageGeo, cherryFoliageMat, maxCherries);

  let pineCount = 0;
  let oakCount = 0;
  let palmCount = 0;
  let cherryCount = 0;

  const dummy = new THREE.Object3D();

  // =========================================================================
  // 1. FORESTRY & NATURE RESERVE (VERY DENSE BIOSPHERE: X: +2400 to +4900, Z: +3100 to +4900)
  // =========================================================================
  for (let i = 0; i < 3500; i++) {
    const rx = 2400 + Math.random() * 2500;
    const rz = 3100 + Math.random() * 1800;
    const ry = calcMasterPlanElevation(rx, rz);

    if (isTreeLocationValid(rx, rz, ry) && pineCount < maxPines) {
      const scale = 0.75 + Math.random() * 0.7;
      dummy.position.set(rx, ry, rz);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      pineTrunkInst.setMatrixAt(pineCount, dummy.matrix);
      pineFoliageInst.setMatrixAt(pineCount, dummy.matrix);
      pineCount++;
    }
  }

  // =========================================================================
  // 2. NORTH-WEST HILL & ECO MOUNTAIN SLOPES (X: -4800 to -2200, Z: -4800 to -2200)
  // =========================================================================
  for (let i = 0; i < 1800; i++) {
    const rx = -4800 + Math.random() * 2600;
    const rz = -4800 + Math.random() * 2600;
    const ry = calcMasterPlanElevation(rx, rz);

    if (isTreeLocationValid(rx, rz, ry)) {
      const scale = 0.8 + Math.random() * 0.6;
      dummy.position.set(rx, ry, rz);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      if (Math.random() > 0.35 && pineCount < maxPines) {
        pineTrunkInst.setMatrixAt(pineCount, dummy.matrix);
        pineFoliageInst.setMatrixAt(pineCount, dummy.matrix);
        pineCount++;
      } else if (oakCount < maxOaks) {
        oakTrunkInst.setMatrixAt(oakCount, dummy.matrix);
        oakFoliageInst.setMatrixAt(oakCount, dummy.matrix);
        oakCount++;
      }
    }
  }

  // =========================================================================
  // 3. RIVERBANK GREEN CORRIDORS & WATERFRONT PROMENADES (BOTH SIDES OF RIVER)
  // =========================================================================
  for (let bx = -4800; bx <= 4800; bx += 25) {
    const riverCenterZ = -700 - Math.sin(bx * 0.0007) * 350 + (bx * 0.05);

    // North Bank Tree Line (offset: +235m to +290m from centerline on lush embankment)
    const nZ = riverCenterZ - (235 + Math.random() * 55);
    const nY = calcMasterPlanElevation(bx, nZ);
    if (isTreeLocationValid(bx, nZ, nY)) {
      dummy.position.set(bx, nY, nZ);
      const scale = 0.85 + Math.random() * 0.4;
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      if (Math.random() > 0.4 && palmCount < maxPalms) {
        palmTrunkInst.setMatrixAt(palmCount, dummy.matrix);
        palmFoliageInst.setMatrixAt(palmCount, dummy.matrix);
        palmCount++;
      } else if (oakCount < maxOaks) {
        oakTrunkInst.setMatrixAt(oakCount, dummy.matrix);
        oakFoliageInst.setMatrixAt(oakCount, dummy.matrix);
        oakCount++;
      }
    }

    // South Bank Tree Line (offset: +235m to +290m from centerline on lush embankment)
    const sZ = riverCenterZ + (235 + Math.random() * 55);
    const sY = calcMasterPlanElevation(bx, sZ);
    if (isTreeLocationValid(bx, sZ, sY)) {
      dummy.position.set(bx, sY, sZ);
      const scale = 0.85 + Math.random() * 0.4;
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      if (Math.random() > 0.4 && palmCount < maxPalms) {
        palmTrunkInst.setMatrixAt(palmCount, dummy.matrix);
        palmFoliageInst.setMatrixAt(palmCount, dummy.matrix);
        palmCount++;
      } else if (oakCount < maxOaks) {
        oakTrunkInst.setMatrixAt(oakCount, dummy.matrix);
        oakFoliageInst.setMatrixAt(oakCount, dummy.matrix);
        oakCount++;
      }
    }
  }

  // =========================================================================
  // 4. SUBURBAN RESIDENTIAL, UNIVERSITY CAMPUS & RURAL BELTS
  // =========================================================================
  // 4a. Low-Density Residential (X: 1000 to 2800, Z: -2600 to -1400)
  for (let i = 0; i < 800; i++) {
    const rx = 1000 + Math.random() * 1800;
    const rz = -2600 + Math.random() * 1200;
    const ry = calcMasterPlanElevation(rx, rz);
    if (isTreeLocationValid(rx, rz, ry) && oakCount < maxOaks) {
      dummy.position.set(rx, ry, rz);
      const scale = 0.8 + Math.random() * 0.5;
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      oakTrunkInst.setMatrixAt(oakCount, dummy.matrix);
      oakFoliageInst.setMatrixAt(oakCount, dummy.matrix);
      oakCount++;
    }
  }

  // 4b. University Science Park & Academic Hall (X: 3400 to 4800, Z: -4800 to -3500)
  for (let i = 0; i < 600; i++) {
    const rx = 3400 + Math.random() * 1400;
    const rz = -4800 + Math.random() * 1300;
    const ry = calcMasterPlanElevation(rx, rz);
    if (isTreeLocationValid(rx, rz, ry)) {
      dummy.position.set(rx, ry, rz);
      const scale = 0.75 + Math.random() * 0.45;
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      if (Math.random() > 0.45 && cherryCount < maxCherries) {
        cherryTrunkInst.setMatrixAt(cherryCount, dummy.matrix);
        cherryFoliageInst.setMatrixAt(cherryCount, dummy.matrix);
        cherryCount++;
      } else if (oakCount < maxOaks) {
        oakTrunkInst.setMatrixAt(oakCount, dummy.matrix);
        oakFoliageInst.setMatrixAt(oakCount, dummy.matrix);
        oakCount++;
      }
    }
  }

  // 4c. General Rural Plain & Agricultural Hedgerows
  for (let i = 0; i < 1500; i++) {
    const rx = -4800 + Math.random() * 9600;
    const rz = -4800 + Math.random() * 9600;
    const ry = calcMasterPlanElevation(rx, rz);
    if (isTreeLocationValid(rx, rz, ry) && oakCount < maxOaks) {
      dummy.position.set(rx, ry, rz);
      const scale = 0.7 + Math.random() * 0.6;
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      oakTrunkInst.setMatrixAt(oakCount, dummy.matrix);
      oakFoliageInst.setMatrixAt(oakCount, dummy.matrix);
      oakCount++;
    }
  }

  // Set instance counts and trigger GPU buffer updates
  pineTrunkInst.count = pineCount;
  pineFoliageInst.count = pineCount;
  pineTrunkInst.instanceMatrix.needsUpdate = true;
  pineFoliageInst.instanceMatrix.needsUpdate = true;

  oakTrunkInst.count = oakCount;
  oakFoliageInst.count = oakCount;
  oakTrunkInst.instanceMatrix.needsUpdate = true;
  oakFoliageInst.instanceMatrix.needsUpdate = true;

  palmTrunkInst.count = palmCount;
  palmFoliageInst.count = palmCount;
  palmTrunkInst.instanceMatrix.needsUpdate = true;
  palmFoliageInst.instanceMatrix.needsUpdate = true;

  cherryTrunkInst.count = cherryCount;
  cherryFoliageInst.count = cherryCount;
  cherryTrunkInst.instanceMatrix.needsUpdate = true;
  cherryFoliageInst.instanceMatrix.needsUpdate = true;

  group.add(
    pineTrunkInst, pineFoliageInst,
    oakTrunkInst, oakFoliageInst,
    palmTrunkInst, palmFoliageInst,
    cherryTrunkInst, cherryFoliageInst
  );

  const totalTreeCount = pineCount + oakCount + palmCount + cherryCount;

  // Static grounded vegetation - no global rotation on instanced mesh
  const update = (_delta: number, _elapsed: number) => {
    // Foliage matrices are baked into static world positions
  };

  return {
    group,
    totalTreeCount,
    update,
  };
}
