import * as THREE from 'three';
import { createAsphaltTexture } from './terrainTextures';

export interface BuiltInfrastructure {
  group: THREE.Group;
  interactiveObjects: THREE.Object3D[];
  streetLights: THREE.PointLight[];
  craneGroup: THREE.Group;
}

export function buildBangladeshInfrastructure(getElevationAt: (x: number, z: number) => number): BuiltInfrastructure {
  const group = new THREE.Group();
  group.name = 'infrastructure_group';
  const interactiveObjects: THREE.Object3D[] = [];
  const streetLights: THREE.PointLight[] = [];

  const asphaltTex = createAsphaltTexture();
  const roadMat = new THREE.MeshStandardMaterial({
    map: asphaltTex,
    roughness: 0.8,
    metalness: 0.1,
  });

  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.85,
    metalness: 0.1,
  });

  const rebarMat = new THREE.MeshStandardMaterial({
    color: 0x374151,
    metalness: 0.7,
    roughness: 0.4,
  });

  const safetyYellowMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.4,
    metalness: 0.3,
  });

  const workerMat = new THREE.MeshStandardMaterial({
    color: 0xf97316, // High-vis orange vest
    roughness: 0.7,
  });

  const hardhatMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // White engineer hardhat
    roughness: 0.3,
  });

  // ==========================================
  // 1. National Highway N5 Corridor
  // ==========================================
  const roadW = 11;
  const roadL = 360;
  const roadGeo = new THREE.PlaneGeometry(roadW, roadL, 8, 80);
  roadGeo.rotateX(-Math.PI / 2);

  const roadPos = roadGeo.attributes.position;
  for (let i = 0; i < roadPos.count; i++) {
    const rx = roadPos.getX(i) + 45; // Centered at x = 45
    const rz = roadPos.getZ(i);
    const ry = getElevationAt(rx, rz) + 0.08; // slightly above ground to prevent z-fighting
    roadPos.setX(i, rx);
    roadPos.setY(i, ry);
  }
  roadGeo.computeVertexNormals();

  const highwayMesh = new THREE.Mesh(roadGeo, roadMat);
  highwayMesh.receiveShadow = true;
  group.add(highwayMesh);

  // Roadside Electric Utility Poles & Streetlights
  for (let z = -170; z <= 170; z += 34) {
    const poleX = 51.5;
    const poleY = getElevationAt(poleX, z);
    const poleGrp = new THREE.Group();

    // Concrete utility pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 9, 8), concreteMat);
    pole.position.y = 4.5;
    pole.castShadow = true;
    poleGrp.add(pole);

    // Cross-arm with insulators
    const crossArm = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.15, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    crossArm.position.y = 8.5;
    poleGrp.add(crossArm);

    // Streetlight arm extending over road
    const lampArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 3.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x64748b })
    );
    lampArm.rotation.z = -Math.PI / 4;
    lampArm.position.set(-1.1, 8.2, 0);
    poleGrp.add(lampArm);

    // Streetlight fixture and spot
    const lampHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.15, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.8 })
    );
    lampHead.position.set(-2.2, 7.1, 0);
    poleGrp.add(lampHead);

    const sLight = new THREE.PointLight(0xfff7ed, 1.2, 28);
    sLight.position.set(-2.2, 6.8, 0);
    poleGrp.add(sLight);
    streetLights.push(sLight);

    poleGrp.position.set(poleX, poleY, z);
    group.add(poleGrp);
  }

  // ==========================================
  // 2. Reinforced Concrete Box Culvert under Highway N5 at (45, -15)
  // ==========================================
  const culvertGrp = new THREE.Group();
  const culvertElevation = getElevationAt(45, -15);

  // Culvert headwalls & twin barrels
  const headwallL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.5, 9), concreteMat);
  headwallL.position.set(45 - 6.2, culvertElevation + 0.6, -15);
  headwallL.castShadow = true;
  group.add(headwallL);

  const headwallR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.5, 9), concreteMat);
  headwallR.position.set(45 + 6.2, culvertElevation + 0.6, -15);
  headwallR.castShadow = true;
  group.add(headwallR);

  // Culvert barrel openings (twin rectangular concrete channels passing under highway)
  for (let b = -2; b <= 2; b += 4) {
    const barrelHole = new THREE.Mesh(
      new THREE.BoxGeometry(12.6, 2.0, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
    );
    barrelHole.position.set(45, culvertElevation + 0.2, -15 + b);
    group.add(barrelHole);
  }

  // Culvert wingwalls
  const wingwallMat = concreteMat;
  const wingwall1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.6, 4.5), wingwallMat);
  wingwall1.position.set(45 - 8.2, culvertElevation + 0.3, -15 - 5.5);
  wingwall1.rotation.y = Math.PI / 4;
  group.add(wingwall1);

  const wingwall2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.6, 4.5), wingwallMat);
  wingwall2.position.set(45 - 8.2, culvertElevation + 0.3, -15 + 5.5);
  wingwall2.rotation.y = -Math.PI / 4;
  group.add(wingwall2);

  // Culvert Interaction Trigger
  culvertGrp.position.set(45, culvertElevation + 1.2, -15);
  culvertGrp.userData = {
    interactive: true,
    inspectId: 'culvert_karatoya_1',
    title: 'Karatoya RC Box Culvert (Km 4+200)',
    subtitle: 'Twin Barrel 2.5m x 2.0m Hydraulic Crossing',
    description: 'Critical cross-drainage structure conveying monsoon agricultural runoff beneath Highway N5 into the Karatoya floodplain.',
    engineeringData: {
      catchmentArea: '4.8 sq. km',
      designDischarge: '18.4 m³/s (25-year flood)',
      headwaterDepth: '1.65 m',
      flowVelocity: '2.1 m/s',
      structuralStatus: 'Reinforced Concrete (Grade C25/30) — Operational',
    },
  };
  group.add(culvertGrp);
  interactiveObjects.push(culvertGrp);

  // ==========================================
  // 3. Karatoya Pre-Stressed Concrete Bridge
  // Crossing the Karatoya River from x = -30 to x = 15 at z = 10
  // ==========================================
  const bridgeGrp = new THREE.Group();
  const bridgeY = 2.8;

  // Bridge Deck
  const deckW = 9.5;
  const deckL = 56;
  const deckMesh = new THREE.Mesh(new THREE.BoxGeometry(deckL, 1.2, deckW), concreteMat);
  deckMesh.position.set(-8, bridgeY, 10);
  deckMesh.castShadow = true;
  deckMesh.receiveShadow = true;
  group.add(deckMesh);

  // Bridge Deck Asphalt surface
  const deckAsphalt = new THREE.Mesh(
    new THREE.BoxGeometry(deckL - 0.4, 0.08, deckW - 1.6),
    roadMat
  );
  deckAsphalt.position.set(-8, bridgeY + 0.65, 10);
  group.add(deckAsphalt);

  // Bridge Safety Crash Barriers & Railings
  const railingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.3 });
  for (const side of [-deckW / 2 + 0.3, deckW / 2 - 0.3]) {
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(deckL, 0.9, 0.3), concreteMat);
    barrier.position.set(-8, bridgeY + 0.9, 10 + side);
    group.add(barrier);

    const metalRail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, deckL, 8), railingMat);
    metalRail.rotation.z = Math.PI / 2;
    metalRail.position.set(-8, bridgeY + 1.45, 10 + side);
    group.add(metalRail);
  }

  // Cylindrical Concrete Bridge Piers in Riverbed
  const pierCoords = [-22, -8, 6];
  pierCoords.forEach((px, idx) => {
    const pierY = getElevationAt(px, 10);
    const pierH = bridgeY - pierY + 0.5;

    // Twin column pier
    for (const offsetZ of [-2.4, 2.4]) {
      const pierCol = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, pierH, 16), concreteMat);
      pierCol.position.set(px, pierY + pierH / 2, 10 + offsetZ);
      pierCol.castShadow = true;
      group.add(pierCol);
    }

    // Pier Crosshead Beam
    const crosshead = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, deckW - 1), concreteMat);
    crosshead.position.set(px, bridgeY - 0.7, 10);
    crosshead.castShadow = true;
    group.add(crosshead);
  });

  // Bridge Abutments
  const abutmentL = new THREE.Mesh(new THREE.BoxGeometry(4.5, 4.5, deckW + 2), concreteMat);
  abutmentL.position.set(-34, bridgeY - 1.6, 10);
  abutmentL.castShadow = true;
  group.add(abutmentL);

  const abutmentR = new THREE.Mesh(new THREE.BoxGeometry(4.5, 4.5, deckW + 2), concreteMat);
  abutmentR.position.set(18, bridgeY - 1.6, 10);
  abutmentR.castShadow = true;
  group.add(abutmentR);

  // Bridge Inspection Trigger
  bridgeGrp.position.set(-8, bridgeY + 1.5, 10);
  bridgeGrp.userData = {
    interactive: true,
    inspectId: 'bridge_karatoya_main',
    title: 'Karatoya River Pre-Stressed Concrete Girder Bridge',
    subtitle: '3-Span 54m High-Level Highway Crossing',
    description: 'Key arterial crossing engineered with deep bored pile foundations to withstand seasonal scour and hydrodynamic flood thrust.',
    engineeringData: {
      spanConfiguration: '18m + 18m + 18m PSC Girders',
      pierScourDepth: '3.4 m below riverbed',
      designLoadCapacity: 'AASHTO HS20-44 / BD 37/01',
      clearanceAboveHFL: '2.15 m above Highest Flood Level',
      expansionJoints: 'Elastomeric Bearing Pads with Neoprene Seal',
    },
  };
  group.add(bridgeGrp);
  interactiveObjects.push(bridgeGrp);

  // ==========================================
  // 4. Complete Active Construction Site (at x = -25, z = -70)
  // ==========================================
  const siteX = -25;
  const siteZ = -70;
  const siteY = getElevationAt(siteX, siteZ);

  // Site Perimeter Safety Barricades & Excavation Pit
  const pitGeo = new THREE.BoxGeometry(24, 1.8, 18);
  const pitMat = new THREE.MeshStandardMaterial({ color: 0x4a3b2c, roughness: 0.95 }); // Excavated earth
  const pitMesh = new THREE.Mesh(pitGeo, pitMat);
  pitMesh.position.set(siteX, siteY - 0.7, siteZ);
  group.add(pitMesh);

  // Tower Crane
  const craneGrp = new THREE.Group();
  const craneMast = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 28, 1.4),
    safetyYellowMat
  );
  craneMast.position.y = 14;
  craneMast.castShadow = true;
  craneGrp.add(craneMast);

  // Crane Jib & Counter-Jib
  const jib = new THREE.Mesh(new THREE.BoxGeometry(32, 1.0, 1.0), safetyYellowMat);
  jib.position.set(8, 28, 0);
  jib.castShadow = true;
  craneGrp.add(jib);

  const counterWeight = new THREE.Mesh(new THREE.BoxGeometry(3, 1.8, 2), concreteMat);
  counterWeight.position.set(-7, 28, 0);
  craneGrp.add(counterWeight);

  craneGrp.position.set(siteX + 10, siteY, siteZ - 6);
  group.add(craneGrp);

  // Tracked Hydraulic Excavator
  const excavatorGrp = new THREE.Group();
  // Undercarriage & Tracks
  const tracks = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 2.4), rebarMat);
  tracks.position.y = 0.4;
  tracks.castShadow = true;
  excavatorGrp.add(tracks);

  // Cab Body
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.0), safetyYellowMat);
  cab.position.set(0.2, 1.6, 0);
  cab.castShadow = true;
  excavatorGrp.add(cab);

  // Boom & Arm
  const boom = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 0.4), safetyYellowMat);
  boom.position.set(2.4, 2.6, 0);
  boom.rotation.z = -0.6;
  boom.castShadow = true;
  excavatorGrp.add(boom);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 0.35), safetyYellowMat);
  arm.position.set(4.4, 1.6, 0);
  arm.rotation.z = 0.9;
  arm.castShadow = true;
  excavatorGrp.add(arm);

  // Excavator Bucket
  const bucket = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), rebarMat);
  bucket.position.set(5.2, 0.5, 0);
  excavatorGrp.add(bucket);

  excavatorGrp.position.set(siteX - 5, siteY, siteZ + 2);
  excavatorGrp.rotation.y = 0.6;
  group.add(excavatorGrp);

  // Heavy Dump Truck
  const truckGrp = new THREE.Group();
  const truckCab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.4, 2.2), safetyYellowMat);
  truckCab.position.set(2.8, 1.5, 0);
  truckCab.castShadow = true;
  truckGrp.add(truckCab);

  const truckBed = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.8, 2.4), concreteMat);
  truckBed.position.set(-0.8, 1.4, 0);
  truckBed.castShadow = true;
  truckGrp.add(truckBed);

  truckGrp.position.set(siteX + 4, siteY, siteZ + 12);
  truckGrp.rotation.y = -0.4;
  group.add(truckGrp);

  // Sand & Aggregate Stockpiles (Conical mounds)
  const sandStockpile = new THREE.Mesh(
    new THREE.ConeGeometry(4.5, 2.6, 16),
    new THREE.MeshStandardMaterial({ color: 0xd4b886, roughness: 0.95 })
  );
  sandStockpile.position.set(siteX - 12, siteY + 1.3, siteZ - 8);
  sandStockpile.castShadow = true;
  group.add(sandStockpile);

  const gravelStockpile = new THREE.Mesh(
    new THREE.ConeGeometry(4.0, 2.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.95 })
  );
  gravelStockpile.position.set(siteX - 12, siteY + 1.1, siteZ + 2);
  gravelStockpile.castShadow = true;
  group.add(gravelStockpile);

  // Bored Pile Rebar Cages lying on timber blocks
  for (let r = 0; r < 3; r++) {
    const cage = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 10, 12, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, wireframe: true })
    );
    cage.rotation.z = Math.PI / 2;
    cage.position.set(siteX - 2 + r * 2.2, siteY + 0.8, siteZ - 12);
    group.add(cage);
  }

  // Site Engineer & Construction Workers (Human Scale Reference)
  const spawnWorker = (wx: number, wz: number, isEngineer = false) => {
    const wGrp = new THREE.Group();
    const wy = getElevationAt(wx, wz);

    // Body / Vest
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.9, 8),
      isEngineer ? new THREE.MeshStandardMaterial({ color: 0x0284c7 }) : workerMat
    );
    body.position.y = 0.95;
    body.castShadow = true;
    wGrp.add(body);

    // Hardhat
    const hat = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), hardhatMat);
    hat.position.y = 1.6;
    hat.castShadow = true;
    wGrp.add(hat);

    // Legs
    const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.7, 8), rebarMat);
    legs.position.y = 0.35;
    wGrp.add(legs);

    wGrp.position.set(wx, wy, wz);
    group.add(wGrp);
  };

  spawnWorker(siteX - 1, siteZ + 3, true); // Site Engineer with blue clipboard
  spawnWorker(siteX + 1, siteZ + 3, false); // Worker 1
  spawnWorker(siteX - 4, siteZ - 3, false); // Worker 2
  spawnWorker(siteX + 6, siteZ + 8, false); // Worker 3

  // Site Portacabin Office
  const office = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 2.8, 3.2),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
  );
  office.position.set(siteX + 14, siteY + 1.4, siteZ + 4);
  office.castShadow = true;
  group.add(office);

  // Construction Site Inspection Trigger
  const constrTrigger = new THREE.Group();
  constrTrigger.position.set(siteX, siteY + 1.5, siteZ);
  constrTrigger.userData = {
    interactive: true,
    inspectId: 'construction_karatoya_zone',
    title: 'Karatoya River Embankment Stabilization Project',
    subtitle: 'Deep Bored Piling & Geotextile Slope Protection',
    description: 'Active construction zone executing 800mm diameter cast-in-situ bored piles, rebar cages, and CC block revetment against river erosion.',
    engineeringData: {
      pileBoreDiameter: '800 mm',
      pileBoreDepth: '28.5 m to dense sand bearing stratum',
      concreteGrade: 'C30 Tremie Pour with Retarder',
      slopeProtection: 'CC (Cement Concrete) 400x400x200mm revetment blocks',
      geotextileFilter: 'Non-woven 350 g/m² polypropylene layer',
    },
  };
  group.add(constrTrigger);
  interactiveObjects.push(constrTrigger);

  // ==========================================
  // 5. Ground-Mounted Solar PV Array (at x = -60, z = -100)
  // ==========================================
  const solarX = -60;
  const solarZ = -100;
  const solarY = getElevationAt(solarX, solarZ);

  const solarCellMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.15,
    metalness: 0.85,
  });
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 });

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 6; col++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 1.8), solarCellMat);
      panel.position.set(solarX + (col - 2.5) * 4.2, solarY + 1.2 + row * 0.8, solarZ + (row - 1) * 3.6);
      panel.rotation.x = 0.42; // Tilted towards south sun
      panel.castShadow = true;
      group.add(panel);

      // Steel posts
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6), rackMat);
      post.position.set(solarX + (col - 2.5) * 4.2, solarY + 0.75, solarZ + (row - 1) * 3.6);
      group.add(post);
    }
  }

  // Solar Inspection Trigger
  const solarTrigger = new THREE.Group();
  solarTrigger.position.set(solarX, solarY + 1.5, solarZ);
  solarTrigger.userData = {
    interactive: true,
    inspectId: 'solar_karatoya_grid',
    title: 'Sherpur 1.2 MW Grid-Tied Solar PV Farm',
    subtitle: 'Bifacial Monocrystalline PV Arrays with String Inverters',
    description: 'Renewable energy installation offsetting seasonal diesel pumping loads across the Karatoya agricultural irrigation zone.',
    engineeringData: {
      installedCapacity: '1.2 MWp DC',
      pvModuleType: '550W Tier-1 Bifacial PERC Cells',
      inverterEfficiency: '98.6% European Weighted',
      annualYield: '1,780 MWh / year',
      gridInterconnection: '33 kV Sherpur Substation Line',
    },
  };
  group.add(solarTrigger);
  interactiveObjects.push(solarTrigger);

  return {
    group,
    interactiveObjects,
    streetLights,
    craneGroup: craneGrp,
  };
}
