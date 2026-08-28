import * as THREE from 'three';
import { EquipmentId } from './types';

export interface EtpAnimatedObjects {
  etpEqualizationMixers: THREE.Group[];
  etpChemicalAgitators: THREE.Group[];
  etpDafSkimmer: THREE.Group;
  etpDafMicroBubbles: THREE.Points;
  etpMbbrCarriers: THREE.Points;
  etpMbbrBubbles: THREE.Points;
  etpSecondaryScraper: THREE.Group;
  etpFilterPressIndicator: THREE.Mesh;
  etpZldPermeateGlow: THREE.Mesh;
}

export function buildEtpCampus(
  scene: THREE.Scene,
  materials: Record<string, THREE.Material>,
  registerInteractive: (obj: THREE.Object3D, id: EquipmentId) => void
): EtpAnimatedObjects {
  const animated: EtpAnimatedObjects = {
    etpEqualizationMixers: [],
    etpChemicalAgitators: [],
    etpDafSkimmer: new THREE.Group(),
    etpDafMicroBubbles: new THREE.Points(),
    etpMbbrCarriers: new THREE.Points(),
    etpMbbrBubbles: new THREE.Points(),
    etpSecondaryScraper: new THREE.Group(),
    etpFilterPressIndicator: new THREE.Mesh(),
    etpZldPermeateGlow: new THREE.Mesh(),
  };

  // Dedicated ETP Materials
  const etpMaterials = {
    effluentRaw: new THREE.MeshStandardMaterial({
      color: 0x3b1c32, // Dark purple/blackish industrial dye effluent
      roughness: 0.15,
      metalness: 0.3,
      transparent: true,
      opacity: 0.94,
    }),
    effluentNeutralized: new THREE.MeshStandardMaterial({
      color: 0x4a4322, // Flocculating murky brownish-green
      roughness: 0.12,
      metalness: 0.35,
      transparent: true,
      opacity: 0.9,
    }),
    effluentDafClear: new THREE.MeshStandardMaterial({
      color: 0x2b5e66, // Semi-clear clarified water
      roughness: 0.08,
      metalness: 0.5,
      transparent: true,
      opacity: 0.85,
    }),
    effluentMbbrLiquor: new THREE.MeshStandardMaterial({
      color: 0x3d5c48, // Active biofilm aerobic liquor
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.88,
    }),
    effluentTertiaryPolished: new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Crystal clear polished water
      roughness: 0.05,
      metalness: 0.7,
      transparent: true,
      opacity: 0.8,
    }),
    effluentZldPure: new THREE.MeshStandardMaterial({
      color: 0x00f0ff, // Ultra-pure demineralized RO permeate
      roughness: 0.03,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75,
    }),
    dafFloatSludge: new THREE.MeshStandardMaterial({
      color: 0x543d2b,
      roughness: 0.95,
    }),
    stainlessSteel: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.9,
    }),
    industrialNavy: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.6,
    }),
    tubeSettlerBlue: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4,
    }),
    chemicalTankAcid: new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber/orange acid resistant
      roughness: 0.3,
    }),
    chemicalTankPoly: new THREE.MeshStandardMaterial({
      color: 0x4f46e5, // Indigo polymer
      roughness: 0.3,
    }),
    chemicalTankPac: new THREE.MeshStandardMaterial({
      color: 0x059669, // Emerald PAC
      roughness: 0.3,
    }),
  };

  // Helper: Guard Railings
  const addRailings = (parent: THREE.Group, points: [number, number][], height = 1.0) => {
    const railMat = materials.steel || etpMaterials.stainlessSteel;
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, z1] = points[i];
      const [x2, z2] = points[i + 1];
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);

      const postGeo = new THREE.CylinderGeometry(0.04, 0.04, height, 6);
      const post = new THREE.Mesh(postGeo, railMat);
      post.position.set(x1, height / 2, z1);
      post.castShadow = true;
      parent.add(post);

      const topRailGeo = new THREE.CylinderGeometry(0.03, 0.03, len, 6);
      const topRail = new THREE.Mesh(topRailGeo, railMat);
      topRail.position.set((x1 + x2) / 2, height, (z1 + z2) / 2);
      topRail.rotation.y = angle;
      topRail.rotation.x = Math.PI / 2;
      topRail.castShadow = true;
      parent.add(topRail);
    }
  };

  // -------------------------------------------------------------
  // 1. ETP Equalization & Homogenization Basin (etp_equalization_tank)
  // Coordinates: x: 220, z: -10
  // -------------------------------------------------------------
  const eqTankGroup = new THREE.Group();
  eqTankGroup.position.set(220, 0, -10);

  // Concrete Basin Wall (14m x 4.8m x 10m)
  const eqWallGeo = new THREE.BoxGeometry(14, 5, 10);
  const eqWallMesh = new THREE.Mesh(eqWallGeo, materials.concreteDark || materials.concrete);
  eqWallMesh.position.y = 2.5;
  eqWallMesh.castShadow = true;
  eqWallMesh.receiveShadow = true;
  eqTankGroup.add(eqWallMesh);

  // Influent Channel & Screen Basket
  const infChannel = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 4), materials.concrete);
  infChannel.position.set(-6.5, 4.5, 0);
  eqTankGroup.add(infChannel);

  const rawInletPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3.5, 16), materials.pipePurple || materials.steel);
  rawInletPipe.rotation.z = Math.PI / 2;
  rawInletPipe.position.set(-8, 4.8, 0);
  rawInletPipe.castShadow = true;
  eqTankGroup.add(rawInletPipe);

  // Dark Industrial Wastewater Surface
  const eqWater = new THREE.Mesh(new THREE.BoxGeometry(13.2, 4.2, 9.2), etpMaterials.effluentRaw);
  eqWater.position.y = 2.3;
  eqTankGroup.add(eqWater);

  // 4 Submersible Turbine Jet Mixers
  const mixerOffsets: [number, number][] = [
    [-3.5, -2.5],
    [3.5, -2.5],
    [-3.5, 2.5],
    [3.5, 2.5],
  ];

  mixerOffsets.forEach(([mx, mz]) => {
    const mixerMast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.8, 8), materials.steel);
    mixerMast.position.set(mx, 2.6, mz);
    eqTankGroup.add(mixerMast);

    const mixerGroup = new THREE.Group();
    mixerGroup.position.set(mx, 0.8, mz);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.4, 12), materials.hazardYellow || materials.steel);
    hub.rotation.x = Math.PI / 2;
    mixerGroup.add(hub);

    for (let a = 0; a < 3; a++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 0.03), materials.hazardYellow || materials.steel);
      blade.rotation.z = (a * Math.PI * 2) / 3;
      blade.position.set(Math.cos((a * Math.PI * 2) / 3) * 0.35, Math.sin((a * Math.PI * 2) / 3) * 0.35, 0);
      mixerGroup.add(blade);
    }
    eqTankGroup.add(mixerGroup);
    animated.etpEqualizationMixers.push(mixerGroup);
  });

  // Perimeter Walkway & Handrails
  addRailings(eqTankGroup, [
    [-6.8, -4.8],
    [6.8, -4.8],
    [6.8, 4.8],
    [-6.8, 4.8],
    [-6.8, -4.8],
  ], 5.8);

  scene.add(eqTankGroup);
  registerInteractive(eqTankGroup, 'etp_equalization_tank');

  // -------------------------------------------------------------
  // 2. ETP Chemical Reaction, pH Neutralization & Flocculation (etp_chemical_reaction_ph)
  // Coordinates: x: 234, z: -10
  // -------------------------------------------------------------
  const chemGroup = new THREE.Group();
  chemGroup.position.set(234, 0, -10);

  // 3-Chamber Reaction Tank Box (10m x 4.5m x 6m)
  const chemBasin = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 6), materials.concrete);
  chemBasin.position.y = 2.25;
  chemBasin.castShadow = true;
  chemBasin.receiveShadow = true;
  chemGroup.add(chemBasin);

  // Water in each chamber
  const chemWater = new THREE.Mesh(new THREE.BoxGeometry(9.4, 3.8, 5.4), etpMaterials.effluentNeutralized);
  chemWater.position.y = 2.1;
  chemGroup.add(chemWater);

  // Agitator Bridges & Flash Mixers
  [-3, 0, 3].forEach((posOffset, idx) => {
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.8, 12), materials.pipeBlue || materials.steel);
    motor.position.set(posOffset, 5.0, 0);
    motor.castShadow = true;
    chemGroup.add(motor);

    const agitator = new THREE.Group();
    agitator.position.set(posOffset, 2.2, 0);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8), materials.steel);
    agitator.add(shaft);

    const bladeSize = idx === 2 ? 1.6 : 1.1; // Slower/larger flocculator blade on chamber 3
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(bladeSize, 0.25, 0.04), materials.hazardYellow || materials.steel);
    blade1.position.y = -1.2;
    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(bladeSize, 0.25, 0.04), materials.hazardYellow || materials.steel);
    blade2.position.y = -1.2;
    blade2.rotation.y = Math.PI / 2;
    agitator.add(blade1, blade2);

    chemGroup.add(agitator);
    animated.etpChemicalAgitators.push(agitator);
  });

  // 3 Dosing Storage Tanks (H2SO4 Acid, PAC, Poly Flocculant)
  const dosingTanks = [
    { x: -3, z: 4.2, mat: etpMaterials.chemicalTankAcid, label: 'Acid' },
    { x: 0, z: 4.2, mat: etpMaterials.chemicalTankPac, label: 'PAC' },
    { x: 3, z: 4.2, mat: etpMaterials.chemicalTankPoly, label: 'Poly' },
  ];

  dosingTanks.forEach((dt) => {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.4, 16), dt.mat);
    tank.position.set(dt.x, 1.2, dt.z);
    tank.castShadow = true;
    chemGroup.add(tank);

    const tankTop = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.4, 16), dt.mat);
    tankTop.position.set(dt.x, 2.6, dt.z);
    chemGroup.add(tankTop);

    // Dosing Injection Line
    const doseLine = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 8), materials.pipeOrange || materials.steel);
    doseLine.rotation.x = Math.PI / 2;
    doseLine.position.set(dt.x, 3.2, dt.z - 2.1);
    chemGroup.add(doseLine);
  });

  scene.add(chemGroup);
  registerInteractive(chemGroup, 'etp_chemical_reaction_ph');

  // -------------------------------------------------------------
  // 3. ETP Dissolved Air Flotation (DAF) Unit (etp_daf_system)
  // Coordinates: x: 248, z: -10
  // -------------------------------------------------------------
  const dafGroup = new THREE.Group();
  dafGroup.position.set(248, 0, -10);

  // Main DAF Flotation Steel Tank (11m x 4m x 5m)
  const dafTankGeo = new THREE.BoxGeometry(11, 4, 5);
  const dafTankMesh = new THREE.Mesh(dafTankGeo, etpMaterials.industrialNavy);
  dafTankMesh.position.y = 2.0;
  dafTankMesh.castShadow = true;
  dafGroup.add(dafTankMesh);

  // Top Water Surface & Micro Bubble Cloud
  const dafWater = new THREE.Mesh(new THREE.BoxGeometry(10.2, 3.4, 4.4), etpMaterials.effluentDafClear);
  dafWater.position.y = 1.9;
  dafGroup.add(dafWater);

  // Float Scum Layer (Top Flotation Crust)
  const floatScum = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.2, 4.2), etpMaterials.dafFloatSludge);
  floatScum.position.set(-1.0, 3.7, 0);
  dafGroup.add(floatScum);

  // Air Saturation Pressure Vessel (High-Pressure Air/Water Dissolver)
  const satVessel = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3.5, 16), etpMaterials.stainlessSteel);
  satVessel.position.set(-4.5, 2.5, 3.5);
  satVessel.castShadow = true;
  dafGroup.add(satVessel);

  const satCap = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12), etpMaterials.stainlessSteel);
  satCap.position.set(-4.5, 4.25, 3.5);
  dafGroup.add(satCap);

  // Continuous Chain-Driven Surface Skimmer Scraper
  const skimmerGroup = new THREE.Group();
  skimmerGroup.position.set(0, 3.9, 0);

  const skimmerBridge = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 4.6), materials.hazardYellow || materials.steel);
  skimmerGroup.add(skimmerBridge);

  const scraperBlade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 4.4), materials.pipeOrange || materials.steel);
  scraperBlade.position.y = -0.3;
  skimmerGroup.add(scraperBlade);
  dafGroup.add(skimmerGroup);
  animated.etpDafSkimmer = skimmerGroup;

  // Micro-bubble particle cloud in DAF
  const microBubblesCount = 200;
  const mbPos = new Float32Array(microBubblesCount * 3);
  for (let i = 0; i < microBubblesCount; i++) {
    mbPos[i * 3] = (Math.random() - 0.5) * 8.5;
    mbPos[i * 3 + 1] = 0.5 + Math.random() * 3.0;
    mbPos[i * 3 + 2] = (Math.random() - 0.5) * 3.8;
  }
  const mbGeo = new THREE.BufferGeometry();
  mbGeo.setAttribute('position', new THREE.BufferAttribute(mbPos, 3));
  const mbMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.8 });
  const mbPoints = new THREE.Points(mbGeo, mbMat);
  dafGroup.add(mbPoints);
  animated.etpDafMicroBubbles = mbPoints;

  // Sludge Hopper at DAF End
  const sludgeHopper = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 4), materials.steel);
  sludgeHopper.rotation.y = Math.PI / 4;
  sludgeHopper.position.set(4.5, 1.2, 0);
  dafGroup.add(sludgeHopper);

  scene.add(dafGroup);
  registerInteractive(dafGroup, 'etp_daf_system');

  // -------------------------------------------------------------
  // 4. ETP Primary Tube Settler / Lamella Clarifier (etp_primary_tube_settler)
  // Coordinates: x: 262, z: -10
  // -------------------------------------------------------------
  const tubeSettlerGroup = new THREE.Group();
  tubeSettlerGroup.position.set(262, 0, -10);

  // Elevated Steel Tank with 2 Conical Bottom Hoppers (10m x 4.5m x 6m)
  const tsUpper = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 6), materials.concrete);
  tsUpper.position.y = 3.5;
  tsUpper.castShadow = true;
  tubeSettlerGroup.add(tsUpper);

  // 2 Inverted Pyramidal Sludge Hoppers
  [-2.5, 2.5].forEach((hx) => {
    const hopper = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.5, 4), materials.concreteDark || materials.concrete);
    hopper.rotation.y = Math.PI / 4;
    hopper.position.set(hx, 1.25, 0);
    hopper.castShadow = true;
    tubeSettlerGroup.add(hopper);
  });

  // Support Legs
  [
    [-4.5, -2.5],
    [4.5, -2.5],
    [-4.5, 2.5],
    [4.5, 2.5],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.5, 0.4), materials.steel);
    leg.position.set(lx, 2.25, lz);
    tubeSettlerGroup.add(leg);
  });

  // Honeycomb Inclined Tube Settler Modules (Blue Slanted Plates)
  for (let b = -3.8; b <= 3.8; b += 0.8) {
    const lamellaPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 5.2), etpMaterials.tubeSettlerBlue);
    lamellaPlate.rotation.x = -Math.PI / 2;
    lamellaPlate.rotation.y = Math.PI / 3; // 60° inclination
    lamellaPlate.position.set(b, 3.8, 0);
    tubeSettlerGroup.add(lamellaPlate);
  }

  // Peripheral V-Notch Launder Weirs
  const launder = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.4, 5.4), etpMaterials.stainlessSteel);
  launder.position.y = 4.8;
  tubeSettlerGroup.add(launder);

  scene.add(tubeSettlerGroup);
  registerInteractive(tubeSettlerGroup, 'etp_primary_tube_settler');

  // -------------------------------------------------------------
  // 5. ETP Aerobic MBBR (Moving Bed Biofilm Reactor) Tank (etp_aerobic_mbbr_tank)
  // Coordinates: x: 276, z: -10
  // -------------------------------------------------------------
  const mbbrGroup = new THREE.Group();
  mbbrGroup.position.set(276, 0, -10);

  // Concrete Aeration Tank (12m x 5.5m x 10m)
  const mbbrBasin = new THREE.Mesh(new THREE.BoxGeometry(12, 5.5, 10), materials.concrete);
  mbbrBasin.position.y = 2.75;
  mbbrBasin.castShadow = true;
  mbbrGroup.add(mbbrBasin);

  // Active Aerated Liquor Surface
  const mbbrWater = new THREE.Mesh(new THREE.BoxGeometry(11.2, 4.8, 9.2), etpMaterials.effluentMbbrLiquor);
  mbbrWater.position.y = 2.6;
  mbbrGroup.add(mbbrWater);

  // Floating Moving Bio-Carrier Media Particles (Kaldnes K3 HDPE media)
  const carrierCount = 350;
  const carrierPos = new Float32Array(carrierCount * 3);
  for (let i = 0; i < carrierCount; i++) {
    carrierPos[i * 3] = (Math.random() - 0.5) * 10.5;
    carrierPos[i * 3 + 1] = 1.0 + Math.random() * 3.8;
    carrierPos[i * 3 + 2] = (Math.random() - 0.5) * 8.5;
  }
  const carrierGeo = new THREE.BufferGeometry();
  carrierGeo.setAttribute('position', new THREE.BufferAttribute(carrierPos, 3));
  const carrierMat = new THREE.PointsMaterial({ color: 0xe0e7ff, size: 0.32, transparent: true, opacity: 0.95 });
  const carrierPoints = new THREE.Points(carrierGeo, carrierMat);
  mbbrGroup.add(carrierPoints);
  animated.etpMbbrCarriers = carrierPoints;

  // Fine Bubble Grid Aeration Bubble Stream
  const bubbleCount = 280;
  const bPos = new Float32Array(bubbleCount * 3);
  for (let i = 0; i < bubbleCount; i++) {
    bPos[i * 3] = (Math.random() - 0.5) * 10.0;
    bPos[i * 3 + 1] = 0.5 + Math.random() * 4.2;
    bPos[i * 3 + 2] = (Math.random() - 0.5) * 8.0;
  }
  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
  const bMat = new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.22, transparent: true, opacity: 0.85 });
  const bPoints = new THREE.Points(bGeo, bMat);
  mbbrGroup.add(bPoints);
  animated.etpMbbrBubbles = bPoints;

  // Overhead Air Blower Manifold Pipes (Green)
  const airManifold = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 11, 16), materials.pipeGreen || materials.steel);
  airManifold.rotation.z = Math.PI / 2;
  airManifold.position.set(0, 5.8, 0);
  airManifold.castShadow = true;
  mbbrGroup.add(airManifold);

  // Perforated Media Retention Sieve at Outlet
  const sieve = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 3), etpMaterials.stainlessSteel);
  sieve.position.set(5.7, 2.5, 0);
  mbbrGroup.add(sieve);

  scene.add(mbbrGroup);
  registerInteractive(mbbrGroup, 'etp_aerobic_mbbr_tank');

  // -------------------------------------------------------------
  // 6. ETP Secondary Clarifier & RAS Recirculation (etp_secondary_clarifier)
  // Coordinates: x: 276, z: 10
  // -------------------------------------------------------------
  const secClarGroup = new THREE.Group();
  secClarGroup.position.set(276, 0, 10);

  // Circular Clarifier Tank (Diameter: 13m, Height: 4.5m)
  const clWall = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.2, 4.5, 32, 1, true), materials.concrete);
  clWall.position.y = 2.25;
  clWall.castShadow = true;
  clWall.receiveShadow = true;
  secClarGroup.add(clWall);

  const clWater = new THREE.Mesh(new THREE.CylinderGeometry(6.3, 6.3, 4.0, 32), etpMaterials.effluentTertiaryPolished);
  clWater.position.y = 2.0;
  secClarGroup.add(clWater);

  // Center Feed Well
  const feedWell = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.2, 16, 1, true), materials.steel);
  feedWell.position.y = 2.6;
  secClarGroup.add(feedWell);

  // Rotating Scraper Bridge
  const scraperBridgeGroup = new THREE.Group();
  scraperBridgeGroup.position.set(0, 4.6, 0);

  const bridgeBeam = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.35, 1.2), materials.steel);
  scraperBridgeGroup.add(bridgeBeam);

  const centerMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.9, 16), materials.pipeBlue || materials.steel);
  centerMotor.position.y = 0.6;
  scraperBridgeGroup.add(centerMotor);

  // Underwater Sludge Scraper Squeegees
  const bottomScraper = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.4, 0.1), materials.hazardYellow || materials.steel);
  bottomScraper.position.y = -4.2;
  scraperBridgeGroup.add(bottomScraper);

  secClarGroup.add(scraperBridgeGroup);
  animated.etpSecondaryScraper = scraperBridgeGroup;

  // Peripheral V-Notch Weir Ring
  const weirRing = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.15, 8, 32), etpMaterials.stainlessSteel);
  weirRing.rotation.x = Math.PI / 2;
  weirRing.position.y = 4.2;
  secClarGroup.add(weirRing);

  scene.add(secClarGroup);
  registerInteractive(secClarGroup, 'etp_secondary_clarifier');

  // -------------------------------------------------------------
  // 7. ETP Tertiary Dual Media & Carbon Adsorption Filter (etp_tertiary_dual_media)
  // Coordinates: x: 262, z: 10
  // -------------------------------------------------------------
  const filterSkidGroup = new THREE.Group();
  filterSkidGroup.position.set(262, 0, 10);

  // Skid Steel Base
  const skidBase = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 6), etpMaterials.industrialNavy);
  skidBase.position.y = 0.2;
  skidBase.castShadow = true;
  filterSkidGroup.add(skidBase);

  // 3 Vertical Pressure Vessels (2 Sand/Anthracite + 1 Carbon Column)
  const vesselConfigs = [
    { x: -3.0, mat: materials.pipeBlue || materials.steel, label: 'DMF 1' },
    { x: 0.0, mat: materials.pipeBlue || materials.steel, label: 'DMF 2' },
    { x: 3.0, mat: etpMaterials.industrialNavy, label: 'ACF (Carbon)' },
  ];

  vesselConfigs.forEach((vc) => {
    const vesselBody = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.8, 20), vc.mat);
    vesselBody.position.set(vc.x, 2.4, 0);
    vesselBody.castShadow = true;
    filterSkidGroup.add(vesselBody);

    const dishTop = new THREE.Mesh(new THREE.SphereGeometry(1.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), vc.mat);
    dishTop.position.set(vc.x, 4.3, 0);
    filterSkidGroup.add(dishTop);

    const dishBottom = new THREE.Mesh(new THREE.SphereGeometry(1.2, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), vc.mat);
    dishBottom.position.set(vc.x, 0.5, 0);
    filterSkidGroup.add(dishBottom);

    // Front Valve Manifold
    const valveManifold = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), etpMaterials.stainlessSteel);
    valveManifold.position.set(vc.x, 2.4, 1.4);
    filterSkidGroup.add(valveManifold);
  });

  // Header Connective Pipes
  const topHeader = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 8.5, 16), materials.pipeBlue || materials.steel);
  topHeader.rotation.z = Math.PI / 2;
  topHeader.position.set(0, 4.8, 1.4);
  topHeader.castShadow = true;
  filterSkidGroup.add(topHeader);

  scene.add(filterSkidGroup);
  registerInteractive(filterSkidGroup, 'etp_tertiary_dual_media');

  // -------------------------------------------------------------
  // 8. ETP Hydraulic Recessed Membrane Filter Press (etp_sludge_filter_press)
  // Coordinates: x: 248, z: 10
  // -------------------------------------------------------------
  const fpGroup = new THREE.Group();
  fpGroup.position.set(248, 0, 10);

  // Elevated Support Platform with Cake Chute
  const fpPlatform = new THREE.Mesh(new THREE.BoxGeometry(9, 2.5, 5), materials.steel);
  fpPlatform.position.y = 1.25;
  fpPlatform.castShadow = true;
  fpGroup.add(fpPlatform);

  // Sludge Cake Container Dumpster below
  const skipDumpster = new THREE.Mesh(new THREE.BoxGeometry(6, 1.8, 3.5), materials.hazardYellow || materials.steel);
  skipDumpster.position.set(0, 0.9, 0);
  skipDumpster.castShadow = true;
  fpGroup.add(skipDumpster);

  // 2 Side Steel Tie-Bars
  [-1.8, 1.8].forEach((tz) => {
    const tieBar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 7.5, 12), etpMaterials.stainlessSteel);
    tieBar.rotation.z = Math.PI / 2;
    tieBar.position.set(0, 3.8, tz);
    fpGroup.add(tieBar);
  });

  // Heavy Hydraulic Power Ram Cylinder at Head
  const hydCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.2, 16), materials.pipeOrange || materials.steel);
  hydCylinder.rotation.z = Math.PI / 2;
  hydCylinder.position.set(-3.2, 3.8, 0);
  hydCylinder.castShadow = true;
  fpGroup.add(hydCylinder);

  // Filter Plate Pack (Recessed Polypropylene Plates)
  for (let px = -1.8; px <= 2.2; px += 0.22) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.4, 3.2), materials.concreteDark || materials.steel);
    plate.position.set(px, 3.8, 0);
    plate.castShadow = true;
    fpGroup.add(plate);
  }

  // Fixed Tail Head Stand
  const tailStand = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.2, 3.6), etpMaterials.industrialNavy);
  tailStand.position.set(2.8, 3.8, 0);
  fpGroup.add(tailStand);

  // Hydraulic Pressure Indicator Glow
  const pressGlow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
  pressGlow.position.set(-3.2, 4.6, 0);
  fpGroup.add(pressGlow);
  animated.etpFilterPressIndicator = pressGlow;

  scene.add(fpGroup);
  registerInteractive(fpGroup, 'etp_sludge_filter_press');

  // -------------------------------------------------------------
  // 9. ETP Zero Liquid Discharge (ZLD) - High Recovery RO & MVR Evaporator (etp_zero_liquid_discharge_ro)
  // Coordinates: x: 234, z: 10
  // -------------------------------------------------------------
  const zldGroup = new THREE.Group();
  zldGroup.position.set(234, 0, 10);

  // High-Tech Industrial Base Skid (10m x 0.4m x 7m)
  const zldSkid = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 7), etpMaterials.industrialNavy);
  zldSkid.position.y = 0.2;
  zldGroup.add(zldSkid);

  // 1. High Pressure Reverse Osmosis Rack (4 tiers of 8-inch pressure vessels)
  const roRack = new THREE.Group();
  roRack.position.set(-2.5, 0, 0);

  for (let tier = 0; tier < 3; tier++) {
    for (let tube = 0; tube < 3; tube++) {
      const pv = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4.8, 16), materials.tankDome || materials.steel);
      pv.rotation.z = Math.PI / 2;
      pv.position.set(0, 1.2 + tier * 0.9, -1.2 + tube * 1.2);
      pv.castShadow = true;
      roRack.add(pv);

      // Stainless end caps
      const cap1 = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8), etpMaterials.stainlessSteel);
      cap1.position.set(-2.4, 1.2 + tier * 0.9, -1.2 + tube * 1.2);
      const cap2 = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8), etpMaterials.stainlessSteel);
      cap2.position.set(2.4, 1.2 + tier * 0.9, -1.2 + tube * 1.2);
      roRack.add(cap1, cap2);
    }
  }
  zldGroup.add(roRack);

  // 2. MVR Falling Film Evaporator Column (Vertical Distillation & Vapor Recompression Column)
  const evapColumn = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 6.2, 24), etpMaterials.stainlessSteel);
  evapColumn.position.set(2.8, 3.3, -1.0);
  evapColumn.castShadow = true;
  zldGroup.add(evapColumn);

  const evapDome = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), etpMaterials.stainlessSteel);
  evapDome.position.set(2.8, 6.4, -1.0);
  zldGroup.add(evapDome);

  // MVR Centrifugal Vapor Compressor Motor
  const compressor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.6), materials.pipeBlue || materials.steel);
  compressor.position.set(2.8, 7.2, -1.0);
  zldGroup.add(compressor);

  // Salt Crystallizer & Hydrocyclone with Salt Recovery Bagging Station
  const crystallizer = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 16), materials.steel);
  crystallizer.position.set(3.0, 1.5, 2.0);
  zldGroup.add(crystallizer);

  // Permeate Recycled Pure Water Glow Conduit
  const permeateGlow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 3.8, 12),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.9 })
  );
  permeateGlow.rotation.z = Math.PI / 2;
  permeateGlow.position.set(-2.5, 4.0, 1.8);
  zldGroup.add(permeateGlow);
  animated.etpZldPermeateGlow = permeateGlow;

  scene.add(zldGroup);
  registerInteractive(zldGroup, 'etp_zero_liquid_discharge_ro');

  // -------------------------------------------------------------
  // 10. ETP Central SCADA & Industrial Environmental Chemistry Lab (etp_admin_scada_lab)
  // Coordinates: x: 220, z: 10
  // -------------------------------------------------------------
  const adminGroup = new THREE.Group();
  adminGroup.position.set(220, 0, 10);

  // 2-Story Control & Analytical Lab Building (12m x 6.5m x 10m)
  const bldg = new THREE.Mesh(new THREE.BoxGeometry(12, 6.5, 10), materials.concrete);
  bldg.position.y = 3.25;
  bldg.castShadow = true;
  bldg.receiveShadow = true;
  adminGroup.add(bldg);

  // Modern Green/Solar Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.5, 10.4), materials.greenRoof || materials.concreteDark);
  roof.position.y = 6.75;
  roof.castShadow = true;
  adminGroup.add(roof);

  // Glass Windows & Observation Gallery
  const winFront = new THREE.Mesh(new THREE.BoxGeometry(8, 2.2, 0.2), materials.glass || materials.steel);
  winFront.position.set(0, 4.2, 5.1);
  adminGroup.add(winFront);

  const winBottom = new THREE.Mesh(new THREE.BoxGeometry(6, 1.8, 0.2), materials.glass || materials.steel);
  winBottom.position.set(0, 1.5, 5.1);
  adminGroup.add(winBottom);

  // OCEMS Online Continuous Environmental Monitoring Antenna Mast
  const ocemsMast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.5, 8), materials.steel);
  ocemsMast.position.set(4.5, 8.8, 3.5);
  adminGroup.add(ocemsMast);

  const ocemsDish = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.3, 16), materials.hazardYellow || materials.steel);
  ocemsDish.rotation.x = Math.PI / 3;
  ocemsDish.position.set(4.5, 10.8, 3.5);
  adminGroup.add(ocemsDish);

  // Building Entrance Porch & Signage
  const porch = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 2.2), materials.steel);
  porch.position.set(0, 3.0, 6.0);
  adminGroup.add(porch);

  scene.add(adminGroup);
  registerInteractive(adminGroup, 'etp_admin_scada_lab');

  return animated;
}
