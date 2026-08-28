import * as THREE from 'three';
import { createWaterNormalMap } from './terrainTextures';

/**
 * 1. UNIFIED RIVER CENTERLINE & GEOMETRY
 * 
 * River traverses West (X = -5000) to East (X = +5000) across the entire 10 km territory.
 * Continuous smooth S-curve equation:
 * Z_river(x) = -700 - sin(x * 0.0007) * 350 + (x * 0.05)
 */
export function getRiverCenterZ(x: number): number {
  return -700 - Math.sin(x * 0.0007) * 350 + (x * 0.05);
}

export function getRiverTangentAndNormal(x: number): {
  z: number;
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  angle: number;
} {
  const z = getRiverCenterZ(x);
  const dx = 10;
  const nextZ = getRiverCenterZ(x + dx);
  const tanX = dx;
  const tanZ = nextZ - z;
  const len = Math.hypot(tanX, tanZ);
  const tangent = new THREE.Vector3(tanX / len, 0, tanZ / len);
  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
  const angle = Math.atan2(tangent.z, tangent.x);
  return { z, tangent, normal, angle };
}

export const RIVER_HALF_WIDTH = 120; // 240m wide majestic navigable river
export const RIVER_WATER_LEVEL = -0.5; // Water surface elevation

/**
 * 2. MASTER BRIDGE REGISTRY & DECK ELEVATION RESOLUTION
 */
export interface BridgeDefinition {
  id: string;
  name: string;
  type: 'cable_stayed_highway' | 'box_girder_highway' | 'arch_avenue' | 'steel_truss_rail';
  center: [number, number]; // [X, Z]
  length: number;
  width: number;
  deckElevation: number;
  rotationY: number;
}

export const MASTER_BRIDGES: BridgeDefinition[] = [
  // 1. Grand Central National Highway Bridge (X = 0, Z = -700)
  {
    id: 'central_highway_bridge',
    name: 'Grand Central Cable-Stayed National Highway Bridge',
    type: 'cable_stayed_highway',
    center: [0, -700],
    length: 500,
    width: 44,
    deckElevation: 4.8,
    rotationY: 0,
  },
  // 2. Western Airport-Logistics Expressway Bridge (X = -3200, Z ≈ -860)
  {
    id: 'west_airport_expwy_bridge',
    name: 'Western Airport Expressway Box-Girder Bridge',
    type: 'box_girder_highway',
    center: [-3200, -860],
    length: 440,
    width: 44,
    deckElevation: 4.5,
    rotationY: 0.12,
  },
  // 3. Eastern Innovation Expressway Bridge (X = +3200, Z ≈ -540)
  {
    id: 'east_innovation_expwy_bridge',
    name: 'Eastern Innovation Expressway Box-Girder Bridge',
    type: 'box_girder_highway',
    center: [3200, -540],
    length: 440,
    width: 44,
    deckElevation: 4.5,
    rotationY: -0.15,
  },
  // 4. West Downtown Collector Avenue Bridge (X = -1200, Z ≈ -620)
  {
    id: 'west_downtown_bridge',
    name: 'West Downtown Civic Tied-Arch Bridge',
    type: 'arch_avenue',
    center: [-1200, -620],
    length: 380,
    width: 28,
    deckElevation: 4.2,
    rotationY: 0.05,
  },
  // 5. East Downtown Collector Avenue Bridge (X = +1200, Z ≈ -780)
  {
    id: 'east_downtown_bridge',
    name: 'East Downtown Civic Tied-Arch Bridge',
    type: 'arch_avenue',
    center: [1200, -780],
    length: 380,
    width: 28,
    deckElevation: 4.2,
    rotationY: -0.08,
  },
  // 6. Map-Wide Dual-Track Eastern Railway Bridge (X ≈ +3600, Z ≈ -1100)
  {
    id: 'east_railway_truss_bridge',
    name: 'Eastern Industrial Dual-Track Railway Truss Bridge',
    type: 'steel_truss_rail',
    center: [3600, -1100],
    length: 460,
    width: 18,
    deckElevation: 4.5,
    rotationY: -0.22,
  },
  // 7. Map-Wide Dual-Track Western Railway Bridge (X ≈ -4100, Z ≈ -420)
  {
    id: 'west_railway_truss_bridge',
    name: 'Western Logistics Dual-Track Railway Truss Bridge',
    type: 'steel_truss_rail',
    center: [-4100, -420],
    length: 460,
    width: 18,
    deckElevation: 4.5,
    rotationY: 0.12,
  },
];

/**
 * Checks if a world coordinate (X, Z) is on any bridge deck, and returns the exact solid surface height.
 * Handles smooth parabolic approach ramps on bridge entry and exit so vehicles transition effortlessly.
 */
export function getBridgeDeckElevation(x: number, z: number): number | null {
  // 1. Central Highway Bridge (X = 0, Z = -700, spans Z: -960 to -440, width: 44m -> X: -22 to +22)
  if (Math.abs(x) <= 24 && z >= -960 && z <= -440) {
    const normDist = Math.abs(z - (-700)) / 250;
    if (normDist <= 1.0) {
      return 1.5 + (4.8 - 1.5) * (1 - normDist * normDist);
    }
  }

  // 2. West Airport Expressway Bridge (Center: [-3200, -860])
  const wDx = x - (-3200);
  const wDz = z - (-860);
  if (Math.abs(wDx) <= 24 && Math.abs(wDz) <= 220) {
    const norm = Math.abs(wDz) / 220;
    return 1.5 + (4.5 - 1.5) * (1 - norm * norm);
  }

  // 3. East Innovation Expressway Bridge (Center: [3200, -540])
  const eDx = x - 3200;
  const eDz = z - (-540);
  if (Math.abs(eDx) <= 24 && Math.abs(eDz) <= 220) {
    const norm = Math.abs(eDz) / 220;
    return 1.5 + (4.5 - 1.5) * (1 - norm * norm);
  }

  // 4. West Downtown Avenue Bridge (Center: [-1200, -620])
  const wdDx = x - (-1200);
  const wdDz = z - (-620);
  if (Math.abs(wdDx) <= 16 && Math.abs(wdDz) <= 190) {
    const norm = Math.abs(wdDz) / 190;
    return 1.4 + (4.2 - 1.4) * (1 - norm * norm);
  }

  // 5. East Downtown Avenue Bridge (Center: [1200, -780])
  const edDx = x - 1200;
  const edDz = z - (-780);
  if (Math.abs(edDx) <= 16 && Math.abs(edDz) <= 190) {
    const norm = Math.abs(edDz) / 190;
    return 1.4 + (4.2 - 1.4) * (1 - norm * norm);
  }

  // 6. East Railway Truss Bridge (Center: [3600, -1100])
  const erDx = x - 3600;
  const erDz = z - (-1100);
  if (Math.abs(erDx) <= 12 && Math.abs(erDz) <= 230) {
    const norm = Math.abs(erDz) / 230;
    return 1.2 + (4.5 - 1.2) * (1 - norm * norm);
  }

  // 7. West Railway Truss Bridge (Center: [-4100, -420])
  const wrDx = x - (-4100);
  const wrDz = z - (-420);
  if (Math.abs(wrDx) <= 12 && Math.abs(wrDz) <= 230) {
    const norm = Math.abs(wrDz) / 230;
    return 1.2 + (4.5 - 1.2) * (1 - norm * norm);
  }

  return null;
}

/**
 * 3. PROCEDURAL RIVER WATER SURFACE SYSTEM (10 km x 10 km Full Map Alignment)
 */
export function buildAccurateRiverSystem(): {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  lakeMesh: THREE.Mesh;
  pondMeshes: THREE.Mesh[];
  update: (delta: number, time: number, monsoonIntensity: number) => void;
} {
  const group = new THREE.Group();
  group.name = 'master_accurate_river_system';

  // Generate continuous river surface ribbon spanning entire 10 km (X: -5000 to +5000)
  const segments = 320;
  const crossWidthSegments = 16;
  const riverWidth = 240; // 240m full width navigable surface
  const ribbonGeo = new THREE.PlaneGeometry(riverWidth, 10000, crossWidthSegments, segments);
  ribbonGeo.rotateX(-Math.PI / 2);

  const pos = ribbonGeo.attributes.position;
  for (let i = 0; i <= segments; i++) {
    const ratio = i / segments;
    const worldX = -5000 + ratio * 10000;
    const { z: centerZ, normal } = getRiverTangentAndNormal(worldX);

    for (let c = 0; c <= crossWidthSegments; c++) {
      const vertIdx = i * (crossWidthSegments + 1) + c;
      const crossRatio = (c / crossWidthSegments) - 0.5;

      const vx = worldX + normal.x * (crossRatio * riverWidth);
      const vz = centerZ + normal.z * (crossRatio * riverWidth);
      const vy = RIVER_WATER_LEVEL;

      pos.setX(vertIdx, vx);
      pos.setY(vertIdx, vy);
      pos.setZ(vertIdx, vz);
    }
  }
  ribbonGeo.computeVertexNormals();

  const normalMap = createWaterNormalMap();
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e6a73,
    roughness: 0.12,
    metalness: 0.18,
    transmission: 0.62,
    transparent: true,
    opacity: 0.94,
    ior: 1.333,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.4, 0.4),
  });

  const waterMesh = new THREE.Mesh(ribbonGeo, waterMat);
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  // High Mountain Reservoir Lake
  const lakeGeo = new THREE.CircleGeometry(160, 48);
  lakeGeo.rotateX(-Math.PI / 2);
  const lakeMesh = new THREE.Mesh(lakeGeo, waterMat.clone());
  lakeMesh.position.set(2400, -0.6, -4100);
  group.add(lakeMesh);

  // Southern Coastal Bay of Bengal Ocean Expanse (10 km x 3.5 km)
  const oceanGeo = new THREE.PlaneGeometry(10000, 3500, 20, 20);
  oceanGeo.rotateX(-Math.PI / 2);
  const oceanMesh = new THREE.Mesh(oceanGeo, waterMat.clone());
  oceanMesh.position.set(0, -0.6, 3450);
  group.add(oceanMesh);

  // Village aquaculture ponds (Pukurs)
  const pondMeshes: THREE.Mesh[] = [];
  const pondLocations = [
    [1600, -1800, 45],
    [-2400, -3200, 55],
    [3200, 3200, 50],
    [-1800, 3600, 60],
  ];

  pondLocations.forEach(([px, pz, pr]) => {
    const pGeo = new THREE.CircleGeometry(pr, 32);
    pGeo.rotateX(-Math.PI / 2);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0x1b4332,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
    });
    const pMesh = new THREE.Mesh(pGeo, pMat);
    pMesh.position.set(px, -0.55, pz);
    pondMeshes.push(pMesh);
    group.add(pMesh);
  });

  const update = (_delta: number, time: number, monsoonIntensity: number) => {
    normalMap.offset.x = (time * 0.02) % 1;
    normalMap.offset.y = -(time * 0.06) % 1;

    const baseLevel = -0.5 + monsoonIntensity * 0.7;
    waterMesh.position.y = baseLevel;

    if (monsoonIntensity > 0.3) {
      waterMat.color.setHex(0x594a36);
    } else {
      waterMat.color.setHex(0x1e6a73);
    }
  };

  return {
    group,
    waterMesh,
    lakeMesh,
    pondMeshes,
    update,
  };
}

/**
 * 4. DETAILED STRUCTURAL BRIDGES BUILDER
 */
export function buildComprehensiveBridgeStructures(): THREE.Group {
  const bridgeMasterGroup = new THREE.Group();
  bridgeMasterGroup.name = 'master_comprehensive_river_bridges';

  // Materials
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7, metalness: 0.15 });
  const darkAsphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.05 });
  const steelSkyBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.85 });
  const steelWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9, roughness: 0.25 });
  const cableMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
  const barrierMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 });
  const redNavLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const greenNavLightMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

  // -------------------------------------------------------------------------
  // BRIDGE 1: GRAND CENTRAL CABLE-STAYED HIGHWAY BRIDGE (X = 0, Z = -700)
  // -------------------------------------------------------------------------
  const b1Group = new THREE.Group();
  b1Group.position.set(0, 0, -700);

  const deckLength = 500;
  const deckWidth = 44;
  const deckThickness = 3.2;
  const deckGeo = new THREE.BoxGeometry(deckWidth, deckThickness, deckLength);
  const b1Deck = new THREE.Mesh(deckGeo, concreteMat);
  b1Deck.position.y = 4.8 - deckThickness / 2;
  b1Deck.receiveShadow = true;
  b1Deck.castShadow = true;
  b1Group.add(b1Deck);

  const b1Asphalt = new THREE.Mesh(new THREE.PlaneGeometry(deckWidth - 2.5, deckLength), darkAsphaltMat);
  b1Asphalt.rotateX(-Math.PI / 2);
  b1Asphalt.position.y = 4.85;
  b1Group.add(b1Asphalt);

  const b1OuterL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, deckLength), barrierMat);
  b1OuterL.position.set(-deckWidth / 2 + 0.6, 5.5, 0);
  const b1OuterR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, deckLength), barrierMat);
  b1OuterR.position.set(deckWidth / 2 - 0.6, 5.5, 0);
  const b1Median = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.1, deckLength), barrierMat);
  b1Median.position.set(0, 5.4, 0);
  b1Group.add(b1OuterL, b1OuterR, b1Median);

  const pylonZOffsets = [-120, 120];
  pylonZOffsets.forEach((pz) => {
    const pierL = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 5.5, 12, 16), concreteMat);
    pierL.position.set(-deckWidth / 2 + 1, -1.0, pz);
    const pierR = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 5.5, 12, 16), concreteMat);
    pierR.position.set(deckWidth / 2 - 1, -1.0, pz);
    b1Group.add(pierL, pierR);

    const pylon = new THREE.Group();
    pylon.position.set(0, 4.8, pz);

    const legL = new THREE.Mesh(new THREE.BoxGeometry(3.0, 48, 3.5), steelSkyBlueMat);
    legL.position.set(-16, 24, 0);
    legL.rotation.z = -0.16;
    legL.castShadow = true;

    const legR = new THREE.Mesh(new THREE.BoxGeometry(3.0, 48, 3.5), steelSkyBlueMat);
    legR.position.set(16, 24, 0);
    legR.rotation.z = 0.16;
    legR.castShadow = true;

    const crown = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 4.0), steelWhiteMat);
    crown.position.set(0, 46, 0);

    const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(32, 2.5, 3.5), steelSkyBlueMat);
    crossbeam.position.set(0, 26, 0);

    pylon.add(legL, legR, crown, crossbeam);
    b1Group.add(pylon);

    for (let c = 0; c < 10; c++) {
      const cableZ = (c - 4.5) * 22;
      const cableTargetZ = pz + cableZ;

      const cableCurveL = new THREE.LineCurve3(
        new THREE.Vector3(-4, 46, pz),
        new THREE.Vector3(-deckWidth / 2 + 3, 5.0, cableTargetZ)
      );
      const cableMeshL = new THREE.Mesh(new THREE.TubeGeometry(cableCurveL, 8, 0.12, 6), cableMat);
      b1Group.add(cableMeshL);

      const cableCurveR = new THREE.LineCurve3(
        new THREE.Vector3(4, 46, pz),
        new THREE.Vector3(deckWidth / 2 - 3, 5.0, cableTargetZ)
      );
      const cableMeshR = new THREE.Mesh(new THREE.TubeGeometry(cableCurveR, 8, 0.12, 6), cableMat);
      b1Group.add(cableMeshR);
    }

    const greenLight = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), greenNavLightMat);
    greenLight.position.set(0, 1.5, pz);
    const redLightL = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), redNavLightMat);
    redLightL.position.set(-deckWidth / 2, 1.5, pz);
    const redLightR = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), redNavLightMat);
    redLightR.position.set(deckWidth / 2, 1.5, pz);
    b1Group.add(greenLight, redLightL, redLightR);
  });

  bridgeMasterGroup.add(b1Group);

  // -------------------------------------------------------------------------
  // BRIDGES 2 & 3: WEST AIRPORT & EAST INNOVATION 6-LANE EXPRESSWAY BRIDGES
  // -------------------------------------------------------------------------
  const createExpresswayBoxGirderBridge = (cx: number, cz: number, name: string) => {
    const rGroup = new THREE.Group();
    rGroup.name = name;
    rGroup.position.set(cx, 0, cz);

    const rLength = 440;
    const rWidth = 44;
    const rThick = 2.8;

    const deck = new THREE.Mesh(new THREE.BoxGeometry(rWidth, rThick, rLength), concreteMat);
    deck.position.y = 4.5 - rThick / 2;
    deck.castShadow = true;
    deck.receiveShadow = true;

    const surface = new THREE.Mesh(new THREE.PlaneGeometry(rWidth - 2, rLength), darkAsphaltMat);
    surface.rotateX(-Math.PI / 2);
    surface.position.y = 4.55;

    const parapetL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, rLength), barrierMat);
    parapetL.position.set(-rWidth / 2 + 0.6, 5.15, 0);
    const parapetR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, rLength), barrierMat);
    parapetR.position.set(rWidth / 2 - 0.6, 5.15, 0);
    const median = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, rLength), barrierMat);
    median.position.set(0, 5.05, 0);

    rGroup.add(deck, surface, parapetL, parapetR, median);

    for (let pz = -140; pz <= 140; pz += 90) {
      const pierL = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.0, 12, 16), concreteMat);
      pierL.position.set(-12, -1.0, pz);
      const pierR = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.0, 12, 16), concreteMat);
      pierR.position.set(12, -1.0, pz);
      rGroup.add(pierL, pierR);
    }

    return rGroup;
  };

  bridgeMasterGroup.add(createExpresswayBoxGirderBridge(-3200, -860, 'west_airport_expwy_bridge'));
  bridgeMasterGroup.add(createExpresswayBoxGirderBridge(3200, -540, 'east_innovation_expwy_bridge'));

  // -------------------------------------------------------------------------
  // BRIDGES 4 & 5: DOWNTOWN CIVIC ARCH BRIDGES (X = -1200 & X = +1200)
  // -------------------------------------------------------------------------
  const createCivicArchBridge = (cx: number, cz: number, name: string) => {
    const aGroup = new THREE.Group();
    aGroup.name = name;
    aGroup.position.set(cx, 0, cz);

    const aLen = 380;
    const aWidth = 28;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(aWidth, 2.2, aLen), concreteMat);
    deck.position.y = 4.2 - 1.1;
    deck.castShadow = true;
    aGroup.add(deck);

    // Decorative Steel Tied Arch
    const archRadius = 140;
    const archGeo = new THREE.TorusGeometry(archRadius, 1.5, 12, 48, Math.PI);
    const archL = new THREE.Mesh(archGeo, steelSkyBlueMat);
    archL.position.set(-aWidth / 2 + 1, 4.2, 0);
    archL.rotation.y = Math.PI / 2;
    const archR = new THREE.Mesh(archGeo, steelSkyBlueMat);
    archR.position.set(aWidth / 2 - 1, 4.2, 0);
    archR.rotation.y = Math.PI / 2;
    aGroup.add(archL, archR);

    // Arch Hanger Vertical Cables
    for (let az = -120; az <= 120; az += 24) {
      const archH = Math.sqrt(Math.max(0, archRadius * archRadius - az * az));
      if (archH > 5) {
        const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, archH, 6);
        const cableL = new THREE.Mesh(cableGeo, cableMat);
        cableL.position.set(-aWidth / 2 + 1, 4.2 + archH / 2, az);
        const cableR = new THREE.Mesh(cableGeo, cableMat);
        cableR.position.set(aWidth / 2 - 1, 4.2 + archH / 2, az);
        aGroup.add(cableL, cableR);
      }
    }

    return aGroup;
  };

  bridgeMasterGroup.add(createCivicArchBridge(-1200, -620, 'west_downtown_bridge'));
  bridgeMasterGroup.add(createCivicArchBridge(1200, -780, 'east_downtown_bridge'));

  // -------------------------------------------------------------------------
  // BRIDGES 6 & 7: DUAL-TRACK HEAVY STEEL THROUGH-TRUSS RAILWAY BRIDGES
  // -------------------------------------------------------------------------
  const createRailwayTrussBridge = (cx: number, cz: number, rotY: number, name: string) => {
    const trGroup = new THREE.Group();
    trGroup.name = name;
    trGroup.position.set(cx, 0, cz);
    trGroup.rotation.y = rotY;

    const trLength = 460;
    const trWidth = 18;
    const trHeight = 16;

    for (let pz = -150; pz <= 150; pz += 100) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(trWidth + 4, 12, 6), concreteMat);
      p.position.set(0, -1.0, pz);
      trGroup.add(p);
    }

    const railDeck = new THREE.Mesh(new THREE.BoxGeometry(trWidth, 2.5, trLength), concreteMat);
    railDeck.position.y = 4.5 - 1.25;
    railDeck.castShadow = true;
    trGroup.add(railDeck);

    for (let s = -1; s <= 1; s++) {
      const spanZ = s * 150;
      const spanGroup = new THREE.Group();
      spanGroup.position.set(0, 4.5, spanZ);

      const bChL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 146), steelSkyBlueMat);
      bChL.position.set(-trWidth / 2 + 0.6, 0.6, 0);
      const bChR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 146), steelSkyBlueMat);
      bChR.position.set(trWidth / 2 - 0.6, 0.6, 0);

      const tChL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 120), steelSkyBlueMat);
      tChL.position.set(-trWidth / 2 + 0.6, trHeight, 0);
      const tChR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 120), steelSkyBlueMat);
      tChR.position.set(trWidth / 2 - 0.6, trHeight, 0);

      spanGroup.add(bChL, bChR, tChL, tChR);

      const numPanels = 8;
      const panelLen = 146 / numPanels;
      for (let p = 0; p <= numPanels; p++) {
        const pZ = -73 + p * panelLen;

        const vL = new THREE.Mesh(new THREE.BoxGeometry(0.8, trHeight, 0.8), steelSkyBlueMat);
        vL.position.set(-trWidth / 2 + 0.6, trHeight / 2, pZ);
        const vR = new THREE.Mesh(new THREE.BoxGeometry(0.8, trHeight, 0.8), steelSkyBlueMat);
        vR.position.set(trWidth / 2 - 0.6, trHeight / 2, pZ);
        spanGroup.add(vL, vR);

        const overheadBeam = new THREE.Mesh(new THREE.BoxGeometry(trWidth, 0.8, 0.8), steelWhiteMat);
        overheadBeam.position.set(0, trHeight, pZ);
        spanGroup.add(overheadBeam);
      }

      trGroup.add(spanGroup);
    }

    const railOffsets = [-2.5 - 0.72, -2.5 + 0.72, 2.5 - 0.72, 2.5 + 0.72];
    railOffsets.forEach((ro) => {
      const railMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.35, trLength),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.2 })
      );
      railMesh.position.set(ro, 4.75, 0);
      trGroup.add(railMesh);
    });

    return trGroup;
  };

  bridgeMasterGroup.add(createRailwayTrussBridge(3600, -1100, -0.22, 'east_railway_truss_bridge'));
  bridgeMasterGroup.add(createRailwayTrussBridge(-4100, -420, 0.12, 'west_railway_truss_bridge'));

  return bridgeMasterGroup;
}
