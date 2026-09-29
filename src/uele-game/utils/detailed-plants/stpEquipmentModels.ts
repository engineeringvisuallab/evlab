import * as THREE from 'three';
import { EquipmentId } from './types';

export interface StpAnimatedObjects {
  waterSurfaces: THREE.Mesh[];
  scrapers: THREE.Group[];
  uvLamps: THREE.Mesh[];
  aerationBubbles?: THREE.Points;
  aerators?: THREE.Group[];
  sludgeDecanters?: THREE.Mesh[];
  biogasFlare?: THREE.PointLight;
}

export function buildStpCampus(
  scene: THREE.Scene,
  registerInteractive: (group: THREE.Group, id: EquipmentId) => void
): StpAnimatedObjects {
  const animated: StpAnimatedObjects = {
    waterSurfaces: [],
    scrapers: [],
    uvLamps: [],
    aerators: [],
    sludgeDecanters: [],
  };

  // -------------------------------------------------------------
  // SHARED MATERIALS FOR ARCHITECTURAL STP
  // -------------------------------------------------------------
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, roughness: 0.85, metalness: 0.1 });
  const concreteDarkMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, metalness: 0.1 });
  const concreteLightMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8, metalness: 0.1 });
  const soilEarthMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.95, metalness: 0.05 });
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9, metalness: 0.1 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7, metalness: 0.2 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.35, metalness: 0.8 });
  const silverPipeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.2, metalness: 0.9 });
  const yellowPipeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.3 });
  const greenPipeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, metalness: 0.3 });
  const bluePipeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.5 });
  const orangeTrimMat = new THREE.MeshStandardMaterial({ color: 0xe26a2c, roughness: 0.5, metalness: 0.2 });
  const bldgWallMat = new THREE.MeshStandardMaterial({ color: 0xf3eee7, roughness: 0.85, metalness: 0.05 });
  const bldgRoofMat = new THREE.MeshStandardMaterial({ color: 0xddb892, roughness: 0.8, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.65,
  });

  // Water materials with precise transparency & color
  const rawSewageWaterMat = new THREE.MeshStandardMaterial({
    color: 0x544331,
    roughness: 0.25,
    metalness: 0.3,
    transparent: true,
    opacity: 0.92,
  });
  const gritWaterMat = new THREE.MeshStandardMaterial({
    color: 0x5a5042,
    roughness: 0.2,
    metalness: 0.35,
    transparent: true,
    opacity: 0.9,
  });
  const primaryClarifiedWaterMat = new THREE.MeshStandardMaterial({
    color: 0x336b75,
    roughness: 0.12,
    metalness: 0.5,
    transparent: true,
    opacity: 0.86,
  });
  const aerationWaterMat = new THREE.MeshStandardMaterial({
    color: 0x477884,
    roughness: 0.18,
    metalness: 0.4,
    transparent: true,
    opacity: 0.88,
  });
  const secondaryClarifiedWaterMat = new THREE.MeshStandardMaterial({
    color: 0x1f94a8,
    roughness: 0.08,
    metalness: 0.65,
    transparent: true,
    opacity: 0.82,
  });
  const recycledClearWaterMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    roughness: 0.05,
    metalness: 0.75,
    transparent: true,
    opacity: 0.75,
  });
  const sludgeThickWaterMat = new THREE.MeshStandardMaterial({
    color: 0x2b2118,
    roughness: 0.4,
    metalness: 0.2,
    transparent: true,
    opacity: 0.95,
  });
  const uvGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  // Helper: Create Building with Architectural Orange Eaves
  const createArchitecturalBuilding = (
    w: number,
    h: number,
    d: number,
    x: number,
    z: number,
    rotationY = 0
  ) => {
    const bldgGroup = new THREE.Group();
    bldgGroup.position.set(x, 0, z);
    bldgGroup.rotation.y = rotationY;

    // Plinth / Base
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.4, d + 0.6), concreteDarkMat);
    plinth.position.y = 0.2;
    plinth.castShadow = true;
    bldgGroup.add(plinth);

    // Walls
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bldgWallMat);
    walls.position.y = h / 2 + 0.4;
    walls.castShadow = true;
    bldgGroup.add(walls);

    // Roof Slab
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.35, d + 0.8), orangeTrimMat);
    roofSlab.position.y = h + 0.55;
    roofSlab.castShadow = true;
    bldgGroup.add(roofSlab);

    // Pitched Top / Parapet
    const pitchedRoof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.4, d + 0.2), bldgRoofMat);
    pitchedRoof.position.y = h + 0.85;
    bldgGroup.add(pitchedRoof);

    // Windows & Door trims
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.1), steelMat);
    door.position.set(0, 1.4, d / 2 + 0.05);
    bldgGroup.add(door);

    for (let wx of [-w / 3, w / 3]) {
      const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 0.1), glassMat);
      windowMesh.position.set(wx, h * 0.6, d / 2 + 0.05);
      bldgGroup.add(windowMesh);
    }

    return bldgGroup;
  };

  // Helper: Road segment with curbs
  const createRoad = (w: number, d: number, x: number, z: number, rotationY = 0) => {
    const roadGroup = new THREE.Group();
    roadGroup.position.set(x, 0.02, z);
    roadGroup.rotation.y = rotationY;

    const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), asphaltMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    // White directional arrow marking
    const arrowGeo = new THREE.BufferGeometry();
    const arrowMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.01, 1.8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    arrowMesh.position.set(0, 0.01, 0);
    roadGroup.add(arrowMesh);

    return roadGroup;
  };

  // -------------------------------------------------------------
  // ROADWAYS & CAMPUS GROUND PAVEMENT (STP ZONE)
  // -------------------------------------------------------------
  const campusBaseGroup = new THREE.Group();
  // Central ring road connecting all units
  campusBaseGroup.add(createRoad(18, 5, 62, 2));
  campusBaseGroup.add(createRoad(5, 30, 52, 10));
  campusBaseGroup.add(createRoad(5, 30, 80, 10));
  campusBaseGroup.add(createRoad(28, 5, 80, 24));
  campusBaseGroup.add(createRoad(5, 26, 94, 0));
  campusBaseGroup.add(createRoad(24, 5, 84, -14));
  scene.add(campusBaseGroup);

  // =============================================================
  // 1. RAW SEWAGE INFLOW & DEEP INLET TRENCH (নিকাশি জলের প্রবেশ)
  // =============================================================
  const stpInletGroup = new THREE.Group();
  stpInletGroup.position.set(50, 0, 18);

  // Deep Excavation Pit / Trench
  const trenchPit = new THREE.Mesh(new THREE.BoxGeometry(10, 2.5, 14), soilEarthMat);
  trenchPit.position.set(-2, -1.2, 0);
  stpInletGroup.add(trenchPit);

  const trenchWallConcrete = new THREE.Mesh(new THREE.BoxGeometry(9.6, 2.2, 13.6), concreteDarkMat);
  trenchWallConcrete.position.set(-2, -1.0, 0);
  stpInletGroup.add(trenchWallConcrete);

  // Inflow Sewage River / Trench Water
  const trenchWater = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.2, 12.5), rawSewageWaterMat);
  trenchWater.position.set(-2, -0.6, 0);
  stpInletGroup.add(trenchWater);
  animated.waterSurfaces.push(trenchWater);

  // Dual Massive Underground Sewer Pipes (Inflow Mains)
  for (let zOff of [-2.5, 2.5]) {
    const mainPipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 14, 24),
      concreteLightMat
    );
    mainPipe.rotation.x = Math.PI / 2;
    mainPipe.position.set(-4.5, -0.2, zOff);
    mainPipe.castShadow = true;
    stpInletGroup.add(mainPipe);

    // Pipe Joint Flange Rings
    for (let pz of [-4, 0, 4]) {
      const flange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.88, 0.88, 0.4, 24),
        steelMat
      );
      flange.rotation.x = Math.PI / 2;
      flange.position.set(-4.5, -0.2, zOff + pz);
      stpInletGroup.add(flange);
    }
  }

  // Raw Sewage Lift Station / Pump House (প্রাথমিক স্ক্রিনিং প্রবেশ)
  const pumpHouse = createArchitecturalBuilding(6, 4.5, 5, 2.5, 0);
  stpInletGroup.add(pumpHouse);

  // Vertical Raw Sewage Lift Pipes entering screening
  for (let pz of [-1.2, 1.2]) {
    const vertPipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 4.5, 16),
      greenPipeMat
    );
    vertPipe.position.set(0.2, 2.25, pz);
    stpInletGroup.add(vertPipe);
  }

  scene.add(stpInletGroup);
  registerInteractive(stpInletGroup, 'stp_inlet_screen');

  // =============================================================
  // 2. PRIMARY SCREENING & GRIT CHANNELS (প্রাথমিক স্ক্রিনিং)
  // =============================================================
  const stpScreenGritGroup = new THREE.Group();
  stpScreenGritGroup.position.set(50, 0, -2);

  // Dual Screening Open Concrete Channels
  const screenChannel = new THREE.Mesh(new THREE.BoxGeometry(7, 3.2, 12), concreteMat);
  screenChannel.position.set(0, 1.6, 0);
  screenChannel.castShadow = true;
  stpScreenGritGroup.add(screenChannel);

  const screenWater = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.4, 11.2), gritWaterMat);
  screenWater.position.set(0, 1.8, 0);
  stpScreenGritGroup.add(screenWater);
  animated.waterSurfaces.push(screenWater);

  // Mechanical Rake Screen Enclosures
  for (let sx of [-1.8, 1.8]) {
    const rakeHousing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 3), steelMat);
    rakeHousing.position.set(sx, 3.6, -1);
    rakeHousing.rotation.x = 0.4;
    rakeHousing.castShadow = true;
    stpScreenGritGroup.add(rakeHousing);

    // Screenings Conveyor Chute to Bins
    const chute = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 3.5), yellowPipeMat);
    chute.position.set(sx, 2.6, 2.5);
    chute.rotation.x = -0.35;
    stpScreenGritGroup.add(chute);

    const wasteBin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 2), concreteDarkMat);
    wasteBin.position.set(sx, 0.7, 4.2);
    wasteBin.castShadow = true;
    stpScreenGritGroup.add(wasteBin);
  }

  // Screening & Grit Control Building + Chemical Silo
  const screenBldg = createArchitecturalBuilding(7, 4.8, 6, -7, 0, 0);
  stpScreenGritGroup.add(screenBldg);

  const gritSilo = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 6, 24), silverPipeMat);
  gritSilo.position.set(-11.5, 3, 0);
  gritSilo.castShadow = true;
  stpScreenGritGroup.add(gritSilo);

  scene.add(stpScreenGritGroup);
  registerInteractive(stpScreenGritGroup, 'stp_grit_chamber');

  // =============================================================
  // 3. PRIMARY SEDIMENTATION CLARIFIERS - TWIN (প্রাথমিক শোধন ট্যাংক)
  // =============================================================
  const stpPstGroup = new THREE.Group();
  stpPstGroup.position.set(67, 0, 9);

  // Twin Circular Clarifier Tanks (Primary PST 1 & 2)
  const pstRadius = 5.6;
  const pstHeight = 4.2;

  [-pstRadius - 1.2, pstRadius + 1.2].forEach((xOff, idx) => {
    const pstSubGroup = new THREE.Group();
    pstSubGroup.position.set(xOff, 0, 0);

    // Concrete Tank Shell
    const tankWall = new THREE.Mesh(
      new THREE.CylinderGeometry(pstRadius, pstRadius, pstHeight, 36, 1, true),
      concreteMat
    );
    tankWall.position.y = pstHeight / 2;
    tankWall.castShadow = true;
    pstSubGroup.add(tankWall);

    // Floor Base
    const tankFloor = new THREE.Mesh(
      new THREE.CylinderGeometry(pstRadius, pstRadius, 0.4, 36),
      concreteDarkMat
    );
    tankFloor.position.y = 0.2;
    pstSubGroup.add(tankFloor);

    // Clarified Water Surface
    const clarWater = new THREE.Mesh(
      new THREE.CylinderGeometry(pstRadius - 0.2, pstRadius - 0.2, pstHeight - 0.6, 36),
      primaryClarifiedWaterMat
    );
    clarWater.position.y = (pstHeight - 0.6) / 2 + 0.2;
    pstSubGroup.add(clarWater);
    animated.waterSurfaces.push(clarWater);

    // Central Stilling Well & Motor Column
    const centerWell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, pstHeight + 0.8, 20),
      steelMat
    );
    centerWell.position.y = (pstHeight + 0.8) / 2;
    pstSubGroup.add(centerWell);

    // Rotating Scraper Bridge Catwalk
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(0, pstHeight + 0.3, 0);

    const bridgeBeam = new THREE.Mesh(
      new THREE.BoxGeometry(pstRadius * 2 - 0.4, 0.25, 0.9),
      steelMat
    );
    bridgeBeam.castShadow = true;
    bridgeGroup.add(bridgeBeam);

    // Handrails on Bridge
    for (let rz of [-0.4, 0.4]) {
      const rail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, pstRadius * 2 - 0.4, 8),
        steelMat
      );
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, 0.6, rz);
      bridgeGroup.add(rail);
    }

    // Submerged Scraper Truss Arms
    const scraperArm = new THREE.Mesh(
      new THREE.BoxGeometry(pstRadius - 0.8, 0.2, 0.4),
      yellowPipeMat
    );
    scraperArm.position.set((pstRadius - 0.8) / 2, -pstHeight * 0.7, 0);
    bridgeGroup.add(scraperArm);

    pstSubGroup.add(bridgeGroup);
    animated.scrapers.push(bridgeGroup);

    stpPstGroup.add(pstSubGroup);
  });

  // Central Interconnecting Walkway Bridge between both PSTs
  const pstConnectorBridge = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.3, 1.4), steelMat);
  pstConnectorBridge.position.set(0, pstHeight + 0.3, 0);
  stpPstGroup.add(pstConnectorBridge);

  // Sludge feed pipes (Blue & Green) running to Aeration Basin
  const pstToAeroPipe1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 10, 16),
    greenPipeMat
  );
  pstToAeroPipe1.rotation.x = Math.PI / 2;
  pstToAeroPipe1.position.set(0, 1.5, -6);
  stpPstGroup.add(pstToAeroPipe1);

  scene.add(stpPstGroup);
  registerInteractive(stpPstGroup, 'stp_primary_clarifier');

  // =============================================================
  // 4. ACTIVATED SLUDGE AERATION BASIN (বায়বীয় ট্যাংক / অ্যাক্টিভেটেড স্লাজ)
  // =============================================================
  const stpAeroGroup = new THREE.Group();
  stpAeroGroup.position.set(68, 0, -8);

  const aeroW = 24;
  const aeroH = 4.8;
  const aeroD = 17;

  // Concrete Dual-Compartment Basin Shell
  const aeroShell = new THREE.Mesh(new THREE.BoxGeometry(aeroW, aeroH, aeroD), concreteMat);
  aeroShell.position.y = aeroH / 2;
  aeroShell.castShadow = true;
  stpAeroGroup.add(aeroShell);

  // Dual Cell Inner Excavation
  [-aeroW / 4 + 0.5, aeroW / 4 - 0.5].forEach((cellX) => {
    const aeroWater = new THREE.Mesh(
      new THREE.BoxGeometry(aeroW / 2 - 1.8, aeroH - 0.6, aeroD - 1.6),
      aerationWaterMat
    );
    aeroWater.position.set(cellX, aeroH / 2 + 0.1, 0);
    stpAeroGroup.add(aeroWater);
    animated.waterSurfaces.push(aeroWater);
  });

  // Central Dividing Baffle Wall & Walkways
  const aeroCatwalk = new THREE.Mesh(new THREE.BoxGeometry(aeroW + 0.4, 0.35, 1.5), steelMat);
  aeroCatwalk.position.set(0, aeroH + 0.18, 0);
  stpAeroGroup.add(aeroCatwalk);

  const aeroCrosswalk = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, aeroD), steelMat);
  aeroCrosswalk.position.set(0, aeroH + 0.18, 0);
  stpAeroGroup.add(aeroCrosswalk);

  // Colored Piping Perimeter (Yellow, Blue, Green Pipes matching reference image)
  const pipeYellowTop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, aeroW + 1, 16), yellowPipeMat);
  pipeYellowTop.rotation.z = Math.PI / 2;
  pipeYellowTop.position.set(0, aeroH + 0.4, aeroD / 2 + 0.3);
  stpAeroGroup.add(pipeYellowTop);

  const pipeGreenTop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, aeroW + 1, 16), greenPipeMat);
  pipeGreenTop.rotation.z = Math.PI / 2;
  pipeGreenTop.position.set(0, aeroH + 0.1, aeroD / 2 + 0.3);
  stpAeroGroup.add(pipeGreenTop);

  const pipeBlueTop = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, aeroD + 1, 16), bluePipeMat);
  pipeBlueTop.rotation.x = Math.PI / 2;
  pipeBlueTop.position.set(aeroW / 2 + 0.3, aeroH + 0.25, 0);
  stpAeroGroup.add(pipeBlueTop);

  // Aeration Bubbles / Froth Particle System
  const bubbleCount = 280;
  const bubbleGeo = new THREE.BufferGeometry();
  const bubblePos = new Float32Array(bubbleCount * 3);
  for (let i = 0; i < bubbleCount; i++) {
    bubblePos[i * 3] = (Math.random() - 0.5) * (aeroW - 3);
    bubblePos[i * 3 + 1] = 0.8 + Math.random() * (aeroH - 0.8);
    bubblePos[i * 3 + 2] = (Math.random() - 0.5) * (aeroD - 3);
  }
  bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
  const bubbleMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.28,
    transparent: true,
    opacity: 0.85,
  });
  const aerationBubbles = new THREE.Points(bubbleGeo, bubbleMat);
  stpAeroGroup.add(aerationBubbles);
  animated.aerationBubbles = aerationBubbles;

  scene.add(stpAeroGroup);
  registerInteractive(stpAeroGroup, 'stp_aeration_tank');

  // =============================================================
  // 5. SECONDARY CLARIFIERS - TWIN (মাধ্যমিক শোধন ট্যাংক)
  // =============================================================
  const stpSstGroup = new THREE.Group();
  stpSstGroup.position.set(92, 0, -8);

  const sstRadius = 6.2;
  const sstHeight = 4.5;

  [sstRadius + 0.6, -sstRadius - 0.6].forEach((zOff) => {
    const sstSubGroup = new THREE.Group();
    sstSubGroup.position.set(0, 0, zOff);

    // Concrete Circular Tank
    const sstTank = new THREE.Mesh(
      new THREE.CylinderGeometry(sstRadius, sstRadius, sstHeight, 36, 1, true),
      concreteMat
    );
    sstTank.position.y = sstHeight / 2;
    sstTank.castShadow = true;
    sstSubGroup.add(sstTank);

    // Turquoise Clarified Supernatant Water
    const sstWater = new THREE.Mesh(
      new THREE.CylinderGeometry(sstRadius - 0.2, sstRadius - 0.2, sstHeight - 0.6, 36),
      secondaryClarifiedWaterMat
    );
    sstWater.position.y = (sstHeight - 0.6) / 2 + 0.2;
    sstSubGroup.add(sstWater);
    animated.waterSurfaces.push(sstWater);

    // Central Stilling Drum & Drive Column
    const centerDrum = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, sstHeight + 0.8, 20),
      steelMat
    );
    centerDrum.position.y = (sstHeight + 0.8) / 2;
    sstSubGroup.add(centerDrum);

    // Rotating Scraper Bridge
    const sstBridge = new THREE.Group();
    sstBridge.position.set(0, sstHeight + 0.35, 0);

    const bridgeBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.25, sstRadius * 2 - 0.4),
      steelMat
    );
    bridgeBeam.castShadow = true;
    sstBridge.add(bridgeBeam);

    sstSubGroup.add(sstBridge);
    animated.scrapers.push(sstBridge);

    stpSstGroup.add(sstSubGroup);
  });

  // Connecting Catwalk between both SSTs
  const sstConnector = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 4.5), steelMat);
  sstConnector.position.set(0, sstHeight + 0.35, 0);
  stpSstGroup.add(sstConnector);

  scene.add(stpSstGroup);
  registerInteractive(stpSstGroup, 'stp_secondary_clarifier');

  // =============================================================
  // 6. TERTIARY FILTRATION COMPLEX (তৃতীয় স্তরের শোধন ফিল্ট্রেশন)
  // =============================================================
  const stpTertiaryGroup = new THREE.Group();
  stpTertiaryGroup.position.set(108, 0, -18);

  // Multi-Bay Rectangular Rapid Gravity & Carbon Filter Basin
  const filtW = 16;
  const filtH = 4.2;
  const filtD = 10;

  const filtBasin = new THREE.Mesh(new THREE.BoxGeometry(filtW, filtH, filtD), concreteMat);
  filtBasin.position.y = filtH / 2;
  filtBasin.castShadow = true;
  stpTertiaryGroup.add(filtBasin);

  const filtWater = new THREE.Mesh(
    new THREE.BoxGeometry(filtW - 1.4, filtH - 0.6, filtD - 1.4),
    recycledClearWaterMat
  );
  filtWater.position.y = filtH / 2 + 0.1;
  stpTertiaryGroup.add(filtWater);
  animated.waterSurfaces.push(filtWater);

  // Over-basin Inspection Catwalks
  const filtCatwalk1 = new THREE.Mesh(new THREE.BoxGeometry(filtW + 0.4, 0.3, 1.2), steelMat);
  filtCatwalk1.position.set(0, filtH + 0.15, -2);
  stpTertiaryGroup.add(filtCatwalk1);

  const filtCatwalk2 = new THREE.Mesh(new THREE.BoxGeometry(filtW + 0.4, 0.3, 1.2), steelMat);
  filtCatwalk2.position.set(0, filtH + 0.15, 2);
  stpTertiaryGroup.add(filtCatwalk2);

  scene.add(stpTertiaryGroup);
  registerInteractive(stpTertiaryGroup, 'stp_tertiary_filtration');

  // =============================================================
  // 7. UV DISINFECTION & DISCHARGE CANAL (জীবাণুনাশক ও শোধন করা জলের নির্গমন)
  // =============================================================
  const stpUvGroup = new THREE.Group();
  stpUvGroup.position.set(118, 0, -8);

  // Open UV Disinfection Channel
  const uvChannel = new THREE.Mesh(new THREE.BoxGeometry(8, 3.2, 5), concreteMat);
  uvChannel.position.y = 1.6;
  uvChannel.castShadow = true;
  stpUvGroup.add(uvChannel);

  const uvWater = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.4, 4.2), recycledClearWaterMat);
  uvWater.position.y = 1.6;
  stpUvGroup.add(uvWater);
  animated.waterSurfaces.push(uvWater);

  // Glowing UV Lamp Bank Modules
  for (let ux of [-2, 0, 2]) {
    const uvLampMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 3.8, 8),
      uvGlowMat
    );
    uvLampMesh.rotation.x = Math.PI / 2;
    uvLampMesh.position.set(ux, 2.2, 0);
    stpUvGroup.add(uvLampMesh);
    animated.uvLamps.push(uvLampMesh);
  }

  // Treated Outflow Pipeline leading to River (শোধন করা জলের নির্গমন)
  const dischargePipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 10, 16),
    bluePipeMat
  );
  dischargePipe.rotation.z = Math.PI / 2;
  dischargePipe.position.set(6, 1.2, 0);
  dischargePipe.castShadow = true;
  stpUvGroup.add(dischargePipe);

  scene.add(stpUvGroup);
  registerInteractive(stpUvGroup, 'stp_uv_chlorination');

  // =============================================================
  // 8. TREATED EFFLUENT REUSE SUMP (পরিশোধিত পানি রিজার্ভার)
  // =============================================================
  const stpReuseGroup = new THREE.Group();
  stpReuseGroup.position.set(118, 0, 4);

  const sumpTank = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 8), concreteDarkMat);
  sumpTank.position.y = 2.25;
  sumpTank.castShadow = true;
  stpReuseGroup.add(sumpTank);

  const sumpWater = new THREE.Mesh(new THREE.BoxGeometry(9.2, 4.0, 7.2), recycledClearWaterMat);
  sumpWater.position.y = 2.2;
  stpReuseGroup.add(sumpWater);
  animated.waterSurfaces.push(sumpWater);

  // Distribution booster pumps
  for (let pz of [-2, 2]) {
    const booster = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 1.8, 16), greenPipeMat);
    booster.position.set(5.8, 1.0, pz);
    booster.castShadow = true;
    stpReuseGroup.add(booster);
  }

  scene.add(stpReuseGroup);
  registerInteractive(stpReuseGroup, 'stp_treated_sump');

  // =============================================================
  // 9. SLUDGE THICKENING & 4x DIGESTER COMPLEX (স্লাজ ডাইজেস্টার ও ঘন করার ট্যাংক)
  // =============================================================
  const stpDigesterGroup = new THREE.Group();
  stpDigesterGroup.position.set(96, 0, 16);

  // A. Sludge Gravity Thickener Circular Tank (স্লাজ ঘন করার ট্যাংক)
  const thickenerRadius = 4.8;
  const thickenerH = 3.8;
  const thickenerGroup = new THREE.Group();
  thickenerGroup.position.set(-10, 0, 0);

  const thickenerWall = new THREE.Mesh(
    new THREE.CylinderGeometry(thickenerRadius, thickenerRadius, thickenerH, 32, 1, true),
    concreteMat
  );
  thickenerWall.position.y = thickenerH / 2;
  thickenerWall.castShadow = true;
  thickenerGroup.add(thickenerWall);

  const thickWater = new THREE.Mesh(
    new THREE.CylinderGeometry(thickenerRadius - 0.2, thickenerRadius - 0.2, thickenerH - 0.5, 32),
    sludgeThickWaterMat
  );
  thickWater.position.y = (thickenerH - 0.5) / 2 + 0.2;
  thickenerGroup.add(thickWater);
  animated.waterSurfaces.push(thickWater);

  const thickBridge = new THREE.Group();
  thickBridge.position.set(0, thickenerH + 0.25, 0);
  const thickBeam = new THREE.Mesh(new THREE.BoxGeometry(thickenerRadius * 2 - 0.4, 0.2, 0.8), steelMat);
  thickBridge.add(thickBeam);
  thickenerGroup.add(thickBridge);
  animated.scrapers.push(thickBridge);

  stpDigesterGroup.add(thickenerGroup);

  // B. 4x Anaerobic Sludge Digesters (স্লাজ ডাইজেস্টার সিলিন্ডার ও ডোম)
  const digesterR = 3.8;
  const digesterCylH = 6.5;
  const digPositions: [number, number][] = [
    [0, -4.5],
    [7.5, -4.5],
    [0, 4.5],
    [7.5, 4.5],
  ];

  digPositions.forEach(([dx, dz]) => {
    const singleDig = new THREE.Group();
    singleDig.position.set(dx, 0, dz);

    // Cylindrical Body
    const cylMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(digesterR, digesterR, digesterCylH, 32),
      bldgWallMat
    );
    cylMesh.position.y = digesterCylH / 2;
    cylMesh.castShadow = true;
    singleDig.add(cylMesh);

    // Conical Domed Roof
    const domeMesh = new THREE.Mesh(
      new THREE.ConeGeometry(digesterR, 2.2, 32),
      bldgRoofMat
    );
    domeMesh.position.y = digesterCylH + 1.1;
    domeMesh.castShadow = true;
    singleDig.add(domeMesh);

    // Top Biogas Pressure Relief Valve Dome Cap
    const topCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 0.8, 16),
      silverPipeMat
    );
    topCap.position.y = digesterCylH + 2.5;
    singleDig.add(topCap);

    stpDigesterGroup.add(singleDig);
  });

  // Interconnecting Biogas Overhead Steel Piping between Digesters
  const biogasPipe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 8, 12), silverPipeMat);
  biogasPipe1.rotation.z = Math.PI / 2;
  biogasPipe1.position.set(3.75, digesterCylH + 2.5, -4.5);
  stpDigesterGroup.add(biogasPipe1);

  const biogasPipe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 8, 12), silverPipeMat);
  biogasPipe2.rotation.z = Math.PI / 2;
  biogasPipe2.position.set(3.75, digesterCylH + 2.5, 4.5);
  stpDigesterGroup.add(biogasPipe2);

  // Safety Biogas Flare Torch
  const flareStack = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 9, 8), steelMat);
  flareStack.position.set(13, 4.5, 0);
  flareStack.castShadow = true;
  stpDigesterGroup.add(flareStack);

  const flareFlame = new THREE.PointLight(0xf97316, 2.2, 18);
  flareFlame.position.set(13, 9.4, 0);
  stpDigesterGroup.add(flareFlame);
  animated.biogasFlare = flareFlame;

  // C. Sludge Dewatering Building (স্লাজ ডিওয়াটারিং ভবন) with Open-View Blue Decanter Centrifuges!
  const dewaterBldgGroup = new THREE.Group();
  dewaterBldgGroup.position.set(-10, 0, 10);

  // Open-top Dewatering Hall Walls
  const dewaterWalls = new THREE.Mesh(new THREE.BoxGeometry(9, 3.5, 7), bldgWallMat);
  dewaterWalls.position.set(0, 1.75, 0);
  dewaterWalls.castShadow = true;
  dewaterBldgGroup.add(dewaterWalls);

  // Eaves Border Trim
  const dewaterTrim = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.3, 7.4), orangeTrimMat);
  dewaterTrim.position.set(0, 3.65, 0);
  dewaterBldgGroup.add(dewaterTrim);

  // 2x Industrial Blue Decanter Centrifuge Units mounted inside
  [-1.8, 1.8].forEach((cx) => {
    const decanterUnit = new THREE.Group();
    decanterUnit.position.set(cx, 1.8, 0);

    const decanterBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 4), steelMat);
    decanterBase.position.y = -0.4;
    decanterUnit.add(decanterBase);

    const decanterDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 3.8, 16), bluePipeMat);
    decanterDrum.rotation.x = Math.PI / 2;
    decanterDrum.castShadow = true;
    decanterUnit.add(decanterDrum);

    const motorEnd = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.9), greenPipeMat);
    motorEnd.position.set(0, 0, -2.0);
    decanterUnit.add(motorEnd);

    dewaterBldgGroup.add(decanterUnit);
  });

  // Dewatered Sludge Dump Truck Parked Outside Loading Bay
  const truckGroup = new THREE.Group();
  truckGroup.position.set(0, 0, 7.5);
  truckGroup.rotation.y = Math.PI;

  const truckChassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 6), concreteDarkMat);
  truckChassis.position.y = 0.6;
  truckGroup.add(truckChassis);

  const truckCab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 1.8), bldgWallMat);
  truckCab.position.set(0, 1.8, 1.8);
  truckCab.castShadow = true;
  truckGroup.add(truckCab);

  const truckDumpBed = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.6, 3.6), orangeTrimMat);
  truckDumpBed.position.set(0, 1.6, -1.0);
  truckDumpBed.castShadow = true;
  truckGroup.add(truckDumpBed);

  const cakeSludgeLoad = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.0, 3.3), soilEarthMat);
  cakeSludgeLoad.position.set(0, 1.8, -1.0);
  truckGroup.add(cakeSludgeLoad);

  // Wheels
  for (let wx of [-1.2, 1.2]) {
    for (let wz of [-2, 0, 2]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16), concreteDarkMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.45, wz);
      truckGroup.add(wheel);
    }
  }
  dewaterBldgGroup.add(truckGroup);

  stpDigesterGroup.add(dewaterBldgGroup);

  scene.add(stpDigesterGroup);
  registerInteractive(stpDigesterGroup, 'stp_sludge_digester');

  // =============================================================
  // 10. CENTRAL ADMINISTRATION, LAB & BLOWER COMPLEX
  // =============================================================
  const stpAdminGroup = new THREE.Group();
  stpAdminGroup.position.set(70, 0, -20);

  // Row of Architectural Operation Buildings along northern perimeter
  const adminMain = createArchitecturalBuilding(12, 5.5, 8, 0, 0);
  stpAdminGroup.add(adminMain);

  const labBlowerBldg = createArchitecturalBuilding(10, 5.0, 7, -14, 0);
  stpAdminGroup.add(labBlowerBldg);

  const workshopBldg = createArchitecturalBuilding(9, 4.5, 7, 13, 0);
  stpAdminGroup.add(workshopBldg);

  // Chemical and Nitrogen Silos
  for (let sx of [20, 24]) {
    const silo = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 7, 24), silverPipeMat);
    silo.position.set(sx, 3.5, 0);
    silo.castShadow = true;
    stpAdminGroup.add(silo);
  }

  scene.add(stpAdminGroup);
  registerInteractive(stpAdminGroup, 'stp_admin_scada');

  return animated;
}
