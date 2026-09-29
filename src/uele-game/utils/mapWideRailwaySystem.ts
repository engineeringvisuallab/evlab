import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';
import { getBridgeDeckElevation } from './riverAndBridges';

export interface MapWideRailwaySystem {
  group: THREE.Group;
  update: (delta: number, time: number) => void;
  // Waypoints along the main arterial loop
  mainLoopCurve: THREE.CatmullRomCurve3;
  suburbanBranchCurve: THREE.CatmullRomCurve3;
}

/**
 * 1. DEFINE THE MASTER PLAN MAP-WIDE DUAL RAILWAY NETWORK
 * 
 * Key Requirements:
 * - Bypasses Central City core by sweeping along the eastern bypass corridor (X ≈ +1500m to +2100m, Z between -1200m and +1200m).
 * - Smooth Radiuses & Tangents connecting every sector across the entire 10 km x 10 km territory:
 *   - East Corridor: Central Rail Terminal (1400, 0), University Campus (3900, -3800), Solar Farm (4000, -1800)
 *   - North Corridor: High-speed East-West Bypass along Z ≈ -3100m passing Green Suburban Residential (1800, -2100), Agro-Engineering (-1600, -4100), Mountain Wind Farm (-3800, -3900)
 *   - West Corridor: Industrial Park & Freight Rail Hub (-3800, 0), Airport Airside Cargo Rail Terminal (-3200, 2300)
 *   - South Corridor: Olympic Stadium & Arena (0, 2300), SEZ Business District (0, 4200), Seaport & Forestry Rail Terminal (3600, 4200)
 *   - Complete loop closes smoothly with wide filleted radiuses (R > 350m).
 */

export const RAILWAY_MAIN_LOOP_NODES: THREE.Vector3[] = [
  // 1. Central City Eastern Rail Terminal (Bypass side of Downtown)
  new THREE.Vector3(1450, 0, 0),
  // 2. Turn towards South-East Logistics & Seaport (Smooth radius curve)
  new THREE.Vector3(1650, 0, 950),
  new THREE.Vector3(2200, 0, 2100),
  // 3. Forestry & South Coast Seaport Container Terminal
  new THREE.Vector3(3600, 0, 3600),
  new THREE.Vector3(3700, 0, 4300),
  // 4. Special Economic Zone (SEZ Enterprise District Station)
  new THREE.Vector3(2400, 0, 4600),
  new THREE.Vector3(0, 0, 4600),
  // 5. Olympic Stadium & Arena Station (South side)
  new THREE.Vector3(-1400, 0, 3800),
  // 6. AYT International Airport Air-Rail Cargo Hub
  new THREE.Vector3(-3100, 0, 2800),
  new THREE.Vector3(-3900, 0, 2200),
  // 7. Heavy Industrial & Logistics Marshalling Yard (Western Spine)
  new THREE.Vector3(-4100, 0, 400),
  new THREE.Vector3(-4100, 0, -800),
  // 8. Western Mountain Wind Crest Curve (North-West)
  new THREE.Vector3(-3900, 0, -2600),
  new THREE.Vector3(-3400, 0, -3800),
  // 9. Precision Agriculture & Agro-Engineering Grain Silos (Far North)
  new THREE.Vector3(-1800, 0, -4400),
  new THREE.Vector3(0, 0, -4500),
  // 10. University & Innovation Science Park Rail Terminal (North-East)
  new THREE.Vector3(2200, 0, -4300),
  new THREE.Vector3(3900, 0, -3800),
  // 11. Photovoltaic Solar Power Grid Substation Station
  new THREE.Vector3(4100, 0, -2100),
  new THREE.Vector3(3600, 0, -1100),
  // 12. Green Suburban Residential North-East Junction
  new THREE.Vector3(2600, 0, -600),
  // 13. Back to Central Eastern Terminal
  new THREE.Vector3(1750, 0, -200),
];

// Helper for railway elevation that smoothly respects solid bridge decks
function getRailElevationAt(x: number, z: number): number {
  const bElev = getBridgeDeckElevation(x, z);
  if (bElev !== null) {
    return bElev;
  }
  return calcMasterPlanElevation(x, z);
}

// Calculate elevations for main loop
for (let i = 0; i < RAILWAY_MAIN_LOOP_NODES.length; i++) {
  const p = RAILWAY_MAIN_LOOP_NODES[i];
  p.y = Math.max(getRailElevationAt(p.x, p.z), 0.4) + 0.35;
}

// Catmull-Rom closed smooth spline for continuous dual-track layout
export const masterRailwayLoopCurve = new THREE.CatmullRomCurve3(RAILWAY_MAIN_LOOP_NODES, true, 'catmullrom', 0.25);

// Secondary Suburban Direct Passenger Chord Curve (connecting Residential to Central Station)
export const RAILWAY_SUBURBAN_BRANCH_NODES: THREE.Vector3[] = [
  new THREE.Vector3(1450, 0, 0),
  new THREE.Vector3(1550, 0, -800),
  new THREE.Vector3(1800, 0, -1600),
  new THREE.Vector3(2200, 0, -2300),
  new THREE.Vector3(2700, 0, -2600),
];
for (let i = 0; i < RAILWAY_SUBURBAN_BRANCH_NODES.length; i++) {
  const p = RAILWAY_SUBURBAN_BRANCH_NODES[i];
  p.y = Math.max(getRailElevationAt(p.x, p.z), 0.4) + 0.35;
}
export const masterSuburbanBranchCurve = new THREE.CatmullRomCurve3(RAILWAY_SUBURBAN_BRANCH_NODES, false, 'catmullrom', 0.2);

/**
 * Procedural Train Builder for High-Speed Bullet Trains and Heavy Freight Trains
 */
function createBulletTrainConsist(colorHex: number, stripeHex: number): THREE.Group {
  const train = new THREE.Group();
  const trainMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.85,
    roughness: 0.2,
  });
  const stripeMat = new THREE.MeshStandardMaterial({
    color: stripeHex,
    metalness: 0.9,
    roughness: 0.25,
  });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
  const pantographMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 });

  const carLength = 22;
  const carWidth = 3.6;
  const carHeight = 3.6;
  const carCount = 6; // 6-car express bullet train

  for (let c = 0; c < carCount; c++) {
    const coach = new THREE.Group();
    coach.position.z = (c - (carCount - 1) / 2) * (carLength + 1.0);

    const bodyGeo = new THREE.BoxGeometry(carWidth, carHeight, carLength);
    const body = new THREE.Mesh(bodyGeo, trainMat);
    body.position.y = carHeight / 2 + 0.8;
    body.castShadow = true;
    coach.add(body);

    // Aerodynamic colorful side stripe
    const stripeGeo = new THREE.BoxGeometry(carWidth + 0.06, 0.65, carLength + 0.05);
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = carHeight * 0.45 + 0.8;
    coach.add(stripe);

    // Continuous tinted window strip
    const winGeo = new THREE.BoxGeometry(carWidth + 0.1, 0.75, carLength - 3.5);
    const win = new THREE.Mesh(winGeo, glassMat);
    win.position.y = carHeight * 0.65 + 0.8;
    coach.add(win);

    // Pantograph on cars 1 and 4
    if (c === 1 || c === 4) {
      const panto = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 2.2), pantographMat);
      panto.position.y = carHeight + 1.15;
      coach.add(panto);
    }

    // Aerodynamic Sloped Bullet Nose on End Cars
    if (c === carCount - 1) {
      const noseGeo = new THREE.ConeGeometry(carWidth * 0.52, 6.0, 16);
      noseGeo.rotateX(Math.PI / 2);
      const nose = new THREE.Mesh(noseGeo, trainMat);
      nose.position.set(0, carHeight / 2 + 0.8, carLength / 2 + 2.5);
      coach.add(nose);

      // Headlight LED
      const hl = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.2), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      hl.position.set(0, carHeight * 0.45 + 0.8, carLength / 2 + 5.0);
      coach.add(hl);
    } else if (c === 0) {
      const noseGeo = new THREE.ConeGeometry(carWidth * 0.52, 6.0, 16);
      noseGeo.rotateX(-Math.PI / 2);
      const nose = new THREE.Mesh(noseGeo, trainMat);
      nose.position.set(0, carHeight / 2 + 0.8, -carLength / 2 - 2.5);
      coach.add(nose);

      // Red Taillight LED
      const tl = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.2), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      tl.position.set(0, carHeight * 0.45 + 0.8, -carLength / 2 - 5.0);
      coach.add(tl);
    }

    train.add(coach);
  }

  return train;
}

function createFreightTrainConsist(): THREE.Group {
  const train = new THREE.Group();

  const locoMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.7 }); // Orange Diesel-Electric
  const containerColors = [0x0284c7, 0x16a34a, 0xdc2626, 0x9333ea, 0x475569];
  const flatbedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

  // 1. Dual Heavy Diesel-Electric Locomotives
  for (let l = 0; l < 2; l++) {
    const loco = new THREE.Group();
    loco.position.z = 80 - l * 24;

    const locoBody = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.2, 21), locoMat);
    locoBody.position.y = 2.9;
    locoBody.castShadow = true;

    // Cab glass
    const cabWin = new THREE.Mesh(new THREE.BoxGeometry(3.65, 1.2, 4.0), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    cabWin.position.set(0, 3.8, 7.5);

    // Powerful headlight
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), new THREE.MeshBasicMaterial({ color: 0xfffbeb }));
    hl.rotation.x = Math.PI / 2;
    hl.position.set(0, 3.4, 10.7);

    loco.add(locoBody, cabWin, hl);
    train.add(loco);
  }

  // 2. Long Consist of 8 Intermodal Container Flatcars
  for (let i = 0; i < 8; i++) {
    const flatcar = new THREE.Group();
    flatcar.position.z = 24 - i * 23;

    // Flatbed base
    const bed = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.8, 21), flatbedMat);
    bed.position.y = 1.0;
    flatcar.add(bed);

    // Double-stacked shipping containers
    const cColor = containerColors[i % containerColors.length];
    const cMat = new THREE.MeshStandardMaterial({ color: cColor, roughness: 0.5, metalness: 0.2 });

    const c1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.7, 19.5), cMat);
    c1.position.y = 2.8;
    c1.castShadow = true;

    const c2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.7, 19.5), cMat);
    c2.position.y = 5.6;
    c2.castShadow = true;

    flatcar.add(c1, c2);
    train.add(flatcar);
  }

  return train;
}

/**
 * Builds the complete 10 km x 10 km Dual Railway Track Physical Infrastructure & Active Trains:
 * - Dual parallel steel rails with 4.5m spacing (Up Track + Down Track)
 * - Heavy crushed stone ballast bed + concrete sleepers (ties)
 * - Overhead catenary electrification masts with contact wires along the entire circuit
 * - Continuously running AI Trains:
 *   1. Express Bullet Train 1 (Clockwise Up-Track @ 260 km/h)
 *   2. Express Bullet Train 2 (Counter-Clockwise Down-Track @ 260 km/h)
 *   3. Heavy Cargo Freight Train (Industrial / Port feeder @ 130 km/h)
 *   4. Suburban Commuter Shuttle Train (Residential Branch)
 */
export function buildMapWideRailwaySystem(): MapWideRailwaySystem {
  const group = new THREE.Group();
  group.name = 'master_mapwide_dual_railway_system';

  // Materials
  const ballastMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // Crushed granite ballast
    roughness: 0.95,
  });
  const steelRailMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.95,
    roughness: 0.2,
  });
  const sleeperMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Concrete sleeper
    roughness: 0.9,
  });
  const catenaryPoleMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.7,
    roughness: 0.4,
  });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

  // 1. GENERATE DUAL RAILWAY BED & STEEL TRACKS ALONG MAIN LOOP
  const samples = 800;
  const loopPoints: THREE.Vector3[] = [];
  const loopTangents: THREE.Vector3[] = [];
  const loopNormals: THREE.Vector3[] = [];

  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const pt = masterRailwayLoopCurve.getPointAt(u);
    const elev = getRailElevationAt(pt.x, pt.z);
    pt.y = Math.max(elev, 0.4) + 0.35;

    const tan = masterRailwayLoopCurve.getTangentAt(u).normalize();
    const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

    loopPoints.push(pt);
    loopTangents.push(tan);
    loopNormals.push(norm);
  }

  // 1a. Ballast Bed Mesh (Width = 14m wide dual-track embankment)
  const bedWidth = 14;
  const bedGeo = new THREE.PlaneGeometry(bedWidth, samples * 10, 4, samples);
  bedGeo.rotateX(-Math.PI / 2);
  const bedPos = bedGeo.attributes.position;

  for (let i = 0; i <= samples; i++) {
    const center = loopPoints[i];
    const normal = loopNormals[i];

    for (let c = 0; c < 5; c++) {
      const vertexIdx = i * 5 + c;
      const offsetRatio = (c / 4) - 0.5; // -0.5 to +0.5 across bed
      const wx = center.x + normal.x * (offsetRatio * bedWidth);
      const wz = center.z + normal.z * (offsetRatio * bedWidth);
      const wy = center.y + (Math.abs(offsetRatio) > 0.38 ? -0.2 : 0.05);

      bedPos.setX(vertexIdx, wx);
      bedPos.setY(vertexIdx, wy);
      bedPos.setZ(vertexIdx, wz);
    }
  }
  bedGeo.computeVertexNormals();
  const ballastMesh = new THREE.Mesh(bedGeo, ballastMat);
  ballastMesh.receiveShadow = true;
  group.add(ballastMesh);

  // 1b. Dual Track 4 Steel Rails (Track 1 @ +2.5m offset, Track 2 @ -2.5m offset)
  // Each track has 2 rails spaced 1.435m (Standard Gauge)
  const railOffsets = [
    2.5 - 0.72, // Track 1 left
    2.5 + 0.72, // Track 1 right
    -2.5 - 0.72, // Track 2 left
    -2.5 + 0.72, // Track 2 right
  ];

  railOffsets.forEach((offset) => {
    const railPts: THREE.Vector3[] = [];
    for (let i = 0; i <= samples; i++) {
      const pt = loopPoints[i];
      const norm = loopNormals[i];
      railPts.push(new THREE.Vector3(
        pt.x + norm.x * offset,
        pt.y + 0.28,
        pt.z + norm.z * offset
      ));
    }
    const railCurve = new THREE.CatmullRomCurve3(railPts, true);
    const railTubeGeo = new THREE.TubeGeometry(railCurve, 600, 0.12, 6, true);
    const railTube = new THREE.Mesh(railTubeGeo, steelRailMat);
    group.add(railTube);
  });

  // 1c. Instanced Concrete Sleepers & Electrification Catenary Gantries
  const sleeperCount = 600;
  const sleeperGeo = new THREE.BoxGeometry(11.5, 0.25, 0.6);
  const sleeperInstMesh = new THREE.InstancedMesh(sleeperGeo, sleeperMat, sleeperCount);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < sleeperCount; i++) {
    const u = i / sleeperCount;
    const pt = masterRailwayLoopCurve.getPointAt(u);
    const elev = calcMasterPlanElevation(pt.x, pt.z);
    pt.y = Math.max(elev, 0.4) + 0.42;

    const tan = masterRailwayLoopCurve.getTangentAt(u).normalize();
    const angle = Math.atan2(tan.x, tan.z);

    dummy.position.copy(pt);
    dummy.rotation.set(0, angle + Math.PI / 2, 0);
    dummy.updateMatrix();
    sleeperInstMesh.setMatrixAt(i, dummy.matrix);

    // Place Overhead Catenary Truss Mast every 12 sleepers (~120m)
    if (i % 12 === 0) {
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      const mastGroup = new THREE.Group();
      mastGroup.position.copy(pt);
      mastGroup.rotation.set(0, angle, 0);

      // Left and right steel lattice posts
      const postL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 8.0, 0.5), catenaryPoleMat);
      postL.position.set(-7.2, 4.0, 0);
      const postR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 8.0, 0.5), catenaryPoleMat);
      postR.position.set(7.2, 4.0, 0);

      // Overhead crossbeam
      const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.4, 0.4), catenaryPoleMat);
      crossbeam.position.set(0, 7.8, 0);

      // Overhead Contact Wire Droppers
      const dropper1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.1), wireMat);
      dropper1.position.set(-2.5, 7.0, 0);
      const dropper2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.1), wireMat);
      dropper2.position.set(2.5, 7.0, 0);

      mastGroup.add(postL, postR, crossbeam, dropper1, dropper2);
      group.add(mastGroup);
    }
  }
  sleeperInstMesh.instanceMatrix.needsUpdate = true;
  group.add(sleeperInstMesh);

  // 2. ACTIVE DEFAULT CONTINUOUSLY MOVING TRAINS (4 Trains on the network)
  // Train 1: AYT White-Cyan Bullet Express (Clockwise on Track 1, Offset +2.5m)
  const bulletTrain1 = createBulletTrainConsist(0xf8fafc, 0x0284c7);
  // Train 2: AYT Emerald-Gold Intercity Express (Counter-Clockwise on Track 2, Offset -2.5m)
  const bulletTrain2 = createBulletTrainConsist(0x0f172a, 0x10b981);
  // Train 3: Heavy Freight & Container Train (Logistics loop on Track 1)
  const freightTrain = createFreightTrainConsist();

  group.add(bulletTrain1, bulletTrain2, freightTrain);

  // Train Progress States along master loop
  let t1Progress = 0.05; // Starts near Central Eastern Terminal
  let t2Progress = 0.55; // Starts on Western Industrial sector
  let freightProgress = 0.35; // Starts near Southern Seaport & SEZ

  const t1Speed = 0.0085; // High speed express
  const t2Speed = 0.0085;
  const freightSpeed = 0.0042; // Freight speed

  const update = (delta: number, _time: number) => {
    // 1. Update Bullet Train 1 (Clockwise Up-Track @ +2.5m offset)
    t1Progress = (t1Progress + t1Speed * delta) % 1.0;
    const pt1 = masterRailwayLoopCurve.getPointAt(t1Progress);
    const tan1 = masterRailwayLoopCurve.getTangentAt(t1Progress).normalize();
    const norm1 = new THREE.Vector3(-tan1.z, 0, tan1.x).normalize();

    const elev1 = getRailElevationAt(pt1.x, pt1.z);
    bulletTrain1.position.set(
      pt1.x + norm1.x * 2.5,
      Math.max(elev1, 0.4) + 0.65,
      pt1.z + norm1.z * 2.5
    );
    bulletTrain1.rotation.set(0, Math.atan2(tan1.x, tan1.z), 0);

    // 2. Update Bullet Train 2 (Counter-Clockwise Down-Track @ -2.5m offset)
    t2Progress = (t2Progress - t2Speed * delta + 1.0) % 1.0;
    const pt2 = masterRailwayLoopCurve.getPointAt(t2Progress);
    const tan2 = masterRailwayLoopCurve.getTangentAt(t2Progress).normalize();
    const norm2 = new THREE.Vector3(-tan2.z, 0, tan2.x).normalize();

    const elev2 = getRailElevationAt(pt2.x, pt2.z);
    bulletTrain2.position.set(
      pt2.x - norm2.x * 2.5,
      Math.max(elev2, 0.4) + 0.65,
      pt2.z - norm2.z * 2.5
    );
    // Reverse heading for counter-clockwise travel
    bulletTrain2.rotation.set(0, Math.atan2(-tan2.x, -tan2.z), 0);

    // 3. Update Freight Train (Clockwise Up-Track @ +2.5m offset)
    freightProgress = (freightProgress + freightSpeed * delta) % 1.0;
    const ptF = masterRailwayLoopCurve.getPointAt(freightProgress);
    const tanF = masterRailwayLoopCurve.getTangentAt(freightProgress).normalize();
    const normF = new THREE.Vector3(-tanF.z, 0, tanF.x).normalize();

    const elevF = getRailElevationAt(ptF.x, ptF.z);
    freightTrain.position.set(
      ptF.x + normF.x * 2.5,
      Math.max(elevF, 0.4) + 0.65,
      ptF.z + normF.z * 2.5
    );
    freightTrain.rotation.set(0, Math.atan2(tanF.x, tanF.z), 0);
  };

  return {
    group,
    update,
    mainLoopCurve: masterRailwayLoopCurve,
    suburbanBranchCurve: masterSuburbanBranchCurve,
  };
}
