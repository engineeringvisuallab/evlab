import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';

/**
 * Procedural asphalt and lane marking textures for highway, ring road, and metro viaducts
 */
function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#1e2327';
  ctx.fillRect(0, 0, 512, 512);

  // Micro gravel noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 24;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 40);
  return tex;
}

export interface MasterPlanRoadSystemResult {
  group: THREE.Group;
  bridgesGroup: THREE.Group;
  metroViaductGroup: THREE.Group;
  isPointOnRoad: (x: number, z: number) => { onRoad: boolean; roadName: string; speedLimit: number };
}

/**
 * Builds the complete Civil Transport & Road Network (Part 3) matching UELE Master Plan:
 * 1. Ring Road (Circular, R = 2.0 km / 2000m)
 * 2. East-West Expressway (Z = -3000m / +3km 6-8 lane highway)
 * 3. North-South National Highway (X = 0, traversing from -5000 to +5000)
 * 4. East-West National Railway (Z = 0, dual steel tracks)
 * 5. Elevated Metro Rail (MRT) Viaduct along Ring Road and East-West corridors
 * 6. Major Structural River Bridges across the Urban Karatoya River
 */
export function buildMasterPlanRoadNetwork(): MasterPlanRoadSystemResult {
  const group = new THREE.Group();
  group.name = 'master_plan_road_network';

  const bridgesGroup = new THREE.Group();
  bridgesGroup.name = 'river_bridges';
  group.add(bridgesGroup);

  const metroViaductGroup = new THREE.Group();
  metroViaductGroup.name = 'metro_viaducts';
  group.add(metroViaductGroup);

  const asphaltTex = createAsphaltTexture();

  // Materials
  const expresswayMat = new THREE.MeshStandardMaterial({
    color: 0x1f2429,
    roughness: 0.8,
    metalness: 0.1,
    map: asphaltTex,
  });

  const highwayMat = new THREE.MeshStandardMaterial({
    color: 0x242a30,
    roughness: 0.85,
    metalness: 0.05,
    map: asphaltTex,
  });

  const bridgeConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.7,
    metalness: 0.2,
  });

  const bridgeSteelMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.4,
    metalness: 0.8,
  });

  const railBallastMat = new THREE.MeshStandardMaterial({
    color: 0x4b5563,
    roughness: 0.95,
  });

  const railSteelMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.9,
    roughness: 0.2,
  });

  const metroPylonMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.6,
    metalness: 0.15,
  });

  const metroTrackMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
    metalness: 0.4,
  });

  // Road Markings Yellow / White line material
  const markingWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const markingYellowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

  // =========================================================================
  // 1. CIRCULAR RING ROAD (R = 2.0 km / 2000m, Width = 38m, 4-6 Lanes)
  // =========================================================================
  const ringSegments = 160;
  const ringRadius = 2000;
  const ringWidth = 38;
  const ringInnerR = ringRadius - ringWidth / 2;
  const ringOuterR = ringRadius + ringWidth / 2;

  const ringGeo = new THREE.RingGeometry(ringInnerR, ringOuterR, ringSegments);
  ringGeo.rotateX(-Math.PI / 2);

  // Position ring mesh vertices at accurate terrain elevation + 0.15m grading
  const ringPos = ringGeo.attributes.position;
  for (let i = 0; i < ringPos.count; i++) {
    const rx = ringPos.getX(i);
    const rz = ringPos.getZ(i);
    const elev = calcMasterPlanElevation(rx, rz);
    ringPos.setY(i, Math.max(elev, 0.4) + 0.18);
  }
  ringGeo.computeVertexNormals();

  const ringMesh = new THREE.Mesh(ringGeo, highwayMat);
  ringMesh.name = 'ring_road_mesh';
  ringMesh.receiveShadow = true;
  group.add(ringMesh);

  // Ring Road Inner/Outer Curbs
  const innerCurbGeo = new THREE.RingGeometry(ringInnerR - 1.2, ringInnerR, ringSegments);
  innerCurbGeo.rotateX(-Math.PI / 2);
  const outerCurbGeo = new THREE.RingGeometry(ringOuterR, ringOuterR + 1.2, ringSegments);
  outerCurbGeo.rotateX(-Math.PI / 2);

  const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
  const innerCurb = new THREE.Mesh(innerCurbGeo, curbMat);
  const outerCurb = new THREE.Mesh(outerCurbGeo, curbMat);
  innerCurb.position.y = 0.22;
  outerCurb.position.y = 0.22;
  group.add(innerCurb, outerCurb);

  // =========================================================================
  // 2. EAST-WEST EXPRESSWAY (Z = -3000m, Width = 52m, 6-8 Lane Divided)
  // =========================================================================
  const ewGeo = new THREE.PlaneGeometry(10000, 52, 200, 4);
  ewGeo.rotateX(-Math.PI / 2);
  const ewPos = ewGeo.attributes.position;
  for (let i = 0; i < ewPos.count; i++) {
    const px = ewPos.getX(i);
    const pz = -3000 + ewPos.getZ(i);
    const elev = calcMasterPlanElevation(px, pz);
    ewPos.setY(i, Math.max(elev, 0.4) + 0.18);
  }
  ewGeo.computeVertexNormals();

  const ewExpressway = new THREE.Mesh(ewGeo, expresswayMat);
  ewExpressway.position.set(0, 0, -3000);
  ewExpressway.receiveShadow = true;
  group.add(ewExpressway);

  // Expressway Central Concrete Jersey Barrier Median (Height = 1.2m)
  const medianGeo = new THREE.BoxGeometry(10000, 1.2, 1.8);
  const medianMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.8 });
  const medianMesh = new THREE.Mesh(medianGeo, medianMat);
  medianMesh.position.set(0, 0.8, -3000);
  group.add(medianMesh);

  // Expressway Yellow Shoulder Markings
  const ewYellowLine1 = new THREE.Mesh(new THREE.PlaneGeometry(10000, 0.6), markingYellowMat);
  ewYellowLine1.rotateX(-Math.PI / 2);
  ewYellowLine1.position.set(0, 0.25, -3000 - 24);
  const ewYellowLine2 = new THREE.Mesh(new THREE.PlaneGeometry(10000, 0.6), markingYellowMat);
  ewYellowLine2.rotateX(-Math.PI / 2);
  ewYellowLine2.position.set(0, 0.25, -3000 + 24);
  group.add(ewYellowLine1, ewYellowLine2);

  // =========================================================================
  // 3. NORTH-SOUTH NATIONAL HIGHWAY (X = 0, Width = 36m, 4-6 Lanes)
  // =========================================================================
  const nsGeo = new THREE.PlaneGeometry(36, 10000, 4, 200);
  nsGeo.rotateX(-Math.PI / 2);
  const nsPos = nsGeo.attributes.position;
  for (let i = 0; i < nsPos.count; i++) {
    const px = nsPos.getX(i);
    const pz = nsPos.getZ(i);
    const elev = calcMasterPlanElevation(px, pz);
    nsPos.setY(i, Math.max(elev, 0.4) + 0.16);
  }
  nsGeo.computeVertexNormals();

  const nsHighway = new THREE.Mesh(nsGeo, highwayMat);
  nsHighway.receiveShadow = true;
  group.add(nsHighway);

  // =========================================================================
  // 4. NATIONAL RAILWAY SYSTEM (Z = 0, Dual Steel Tracks + Ballast Bed)
  // =========================================================================
  // Gravel Ballast Bed (Width = 14m)
  const railBedGeo = new THREE.PlaneGeometry(10000, 14, 150, 2);
  railBedGeo.rotateX(-Math.PI / 2);
  const railBedPos = railBedGeo.attributes.position;
  for (let i = 0; i < railBedPos.count; i++) {
    const rx = railBedPos.getX(i);
    const rz = railBedPos.getZ(i);
    const elev = calcMasterPlanElevation(rx, rz);
    railBedPos.setY(i, Math.max(elev, 0.4) + 0.25);
  }
  railBedGeo.computeVertexNormals();

  const railBed = new THREE.Mesh(railBedGeo, railBallastMat);
  railBed.position.set(0, 0, 0);
  group.add(railBed);

  // Dual Parallel Steel Rails Track 1 (Z = -2.5m) and Track 2 (Z = +2.5m)
  const railSteelGeo = new THREE.BoxGeometry(10000, 0.35, 0.25);
  const rail1a = new THREE.Mesh(railSteelGeo, railSteelMat);
  rail1a.position.set(0, 0.45, -3.2);
  const rail1b = new THREE.Mesh(railSteelGeo, railSteelMat);
  rail1b.position.set(0, 0.45, -1.8);
  const rail2a = new THREE.Mesh(railSteelGeo, railSteelMat);
  rail2a.position.set(0, 0.45, 1.8);
  const rail2b = new THREE.Mesh(railSteelGeo, railSteelMat);
  rail2b.position.set(0, 0.45, 3.2);
  group.add(rail1a, rail1b, rail2a, rail2b);

  // Concrete Sleepers (Ties) spaced along rail
  const sleeperGeo = new THREE.BoxGeometry(0.5, 0.2, 4.0);
  const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
  const sleeperInst = new THREE.InstancedMesh(sleeperGeo, sleeperMat, 800);
  const dummySleeper = new THREE.Object3D();
  for (let i = 0; i < 800; i++) {
    const sx = -5000 + i * 12.5;
    dummySleeper.position.set(sx, 0.32, -2.5);
    dummySleeper.updateMatrix();
    sleeperInst.setMatrixAt(i, dummySleeper.matrix);
  }
  sleeperInst.instanceMatrix.needsUpdate = true;
  group.add(sleeperInst);

  // =========================================================================
  // 5. ELEVATED METRO RAIL (MRT) VIADUCT (Circular + East-West Corridor)
  // =========================================================================
  // Concrete Pylons and Elevated Guideway deck (+8m elevation)
  const pylonCount = 72;
  const pylonGeo = new THREE.CylinderGeometry(2.2, 2.8, 8.5, 12);
  const pylonInst = new THREE.InstancedMesh(pylonGeo, metroPylonMat, pylonCount);
  const dummyPylon = new THREE.Object3D();

  for (let i = 0; i < pylonCount; i++) {
    const angle = (i / pylonCount) * Math.PI * 2;
    const px = Math.cos(angle) * (ringRadius + 22);
    const pz = Math.sin(angle) * (ringRadius + 22);
    const groundElev = calcMasterPlanElevation(px, pz);

    dummyPylon.position.set(px, groundElev + 4.25, pz);
    dummyPylon.rotation.y = angle;
    dummyPylon.updateMatrix();
    pylonInst.setMatrixAt(i, dummyPylon.matrix);
  }
  pylonInst.instanceMatrix.needsUpdate = true;
  metroViaductGroup.add(pylonInst);

  // Elevated Circular MRT Guideway Track Deck
  const mrtDeckGeo = new THREE.RingGeometry(ringRadius + 18, ringRadius + 26, ringSegments);
  mrtDeckGeo.rotateX(-Math.PI / 2);
  const mrtDeck = new THREE.Mesh(mrtDeckGeo, metroTrackMat);
  mrtDeck.position.y = 8.5;
  metroViaductGroup.add(mrtDeck);

  // Decorative Metro Rail (Steel third rail and guide beams)
  const mrtBeamGeo = new THREE.RingGeometry(ringRadius + 21.6, ringRadius + 22.4, ringSegments);
  mrtBeamGeo.rotateX(-Math.PI / 2);
  const mrtBeam = new THREE.Mesh(mrtBeamGeo, markingWhiteMat);
  mrtBeam.position.y = 8.7;
  metroViaductGroup.add(mrtBeam);

  // =========================================================================
  // 6. MAJOR RIVER BRIDGES OVER THE URBAN KARATOYA RIVER
  // =========================================================================
  // 6a. Central Highway Bridge (X = 0, Z ≈ -600m to -1000m)
  const nsBridgeDeckGeo = new THREE.BoxGeometry(40, 2.5, 380);
  const nsBridgeDeck = new THREE.Mesh(nsBridgeDeckGeo, bridgeConcreteMat);
  nsBridgeDeck.position.set(0, 3.5, -800);
  bridgesGroup.add(nsBridgeDeck);

  // Bridge Arch Trusses (Modern Tied-Arch Structure)
  const archRadius = 180;
  const archGeo = new THREE.TorusGeometry(archRadius, 1.8, 12, 48, Math.PI);
  const archMesh1 = new THREE.Mesh(archGeo, bridgeSteelMat);
  archMesh1.position.set(-19, 3.5, -800);
  archMesh1.rotation.y = Math.PI / 2;

  const archMesh2 = new THREE.Mesh(archGeo, bridgeSteelMat);
  archMesh2.position.set(19, 3.5, -800);
  archMesh2.rotation.y = Math.PI / 2;
  bridgesGroup.add(archMesh1, archMesh2);

  // Bridge Support Piers into Riverbed
  const pierGeo = new THREE.CylinderGeometry(4.0, 5.0, 14, 16);
  const pier1 = new THREE.Mesh(pierGeo, bridgeConcreteMat);
  pier1.position.set(0, -1.0, -920);
  const pier2 = new THREE.Mesh(pierGeo, bridgeConcreteMat);
  pier2.position.set(0, -1.0, -680);
  bridgesGroup.add(pier1, pier2);

  // 6b. Western Ring Road Bridge (X ≈ -1900m, Z ≈ -800m)
  const wBridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(42, 2.2, 340), bridgeConcreteMat);
  wBridgeDeck.position.set(-1920, 3.2, -780);
  wBridgeDeck.rotation.y = 0.35;
  bridgesGroup.add(wBridgeDeck);

  // 6c. Eastern Ring Road Bridge (X ≈ +1900m, Z ≈ -750m)
  const eBridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(42, 2.2, 340), bridgeConcreteMat);
  eBridgeDeck.position.set(1920, 3.2, -750);
  eBridgeDeck.rotation.y = -0.32;
  bridgesGroup.add(eBridgeDeck);

  // Road point detection helper for vehicle speed limits & navigation HUD
  const isPointOnRoad = (x: number, z: number): { onRoad: boolean; roadName: string; speedLimit: number } => {
    // East-West Expressway
    if (Math.abs(z - (-3000)) <= 26) {
      return { onRoad: true, roadName: 'East - West Expressway (6-8 Lane)', speedLimit: 120 };
    }
    // North-South National Highway
    if (Math.abs(x) <= 18) {
      return { onRoad: true, roadName: 'National Highway (North-South)', speedLimit: 90 };
    }
    // Ring Road (R = 2000m)
    const distToCenter = Math.hypot(x, z);
    if (Math.abs(distToCenter - 2000) <= 20) {
      return { onRoad: true, roadName: 'Ring Road (R = 2.0 km)', speedLimit: 80 };
    }
    // Railway line
    if (Math.abs(z) <= 7) {
      return { onRoad: true, roadName: 'National Dual Railway Track', speedLimit: 140 };
    }
    return { onRoad: false, roadName: '', speedLimit: 40 };
  };

  return {
    group,
    bridgesGroup,
    metroViaductGroup,
    isPointOnRoad,
  };
}
