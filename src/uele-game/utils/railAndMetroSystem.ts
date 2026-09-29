import * as THREE from 'three';
import { audioEngine } from './audioEngine';
import { createCorrugatedTinTexture } from './terrainTextures';

export interface TrainTelemetry {
  route: string;
  speedKmh: number;
  maxSpeedKmh: number;
  throttle: number; // 0 to 1
  brakePressurePsi: number; // 0 to 100
  currentStation: string;
  nextStation: string;
  distanceToNextStationM: number;
  dwellTimerSec: number;
  isStoppedAtStation: boolean;
  signalState: 'GREEN' | 'YELLOW' | 'RED';
  doorsOpen: boolean;
  powerSource: 'Diesel-Electric 3,300 HP' | '1500V DC Overhead Catenary';
  passengerCount: number;
}

export interface RailAndMetroSystemResult {
  group: THREE.Group;
  intercityTrainGroup: THREE.Group;
  metroTrainGroup: THREE.Group;
  intercityTelemetry: TrainTelemetry;
  metroTelemetry: TrainTelemetry;
  crossingGatesLowered: boolean;
  update: (time: number, delta: number) => void;
}

export function buildRailAndMetroSystem(
  getElevationAt: (x: number, z: number) => number
): RailAndMetroSystemResult {
  const group = new THREE.Group();
  group.name = 'complete_rail_and_metro_system';

  // Shared Materials
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
  const polishedRailMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.1 });
  const ballastMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
  const concreteSleeperMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
  const woodSleeperMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
  const darkConcreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  const glassBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
  const greenAspectMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const yellowAspectMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
  const redAspectMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  const tinSilver = createCorrugatedTinTexture('silver');
  const tinSilverMat = new THREE.MeshStandardMaterial({ map: tinSilver, roughness: 0.5, metalness: 0.4 });

  // =========================================================================
  // 1. DUAL-TRACK RAILWAY MAINLINE (Running along x = -120, z: -2500 to +2500)
  // =========================================================================
  const railGroup = new THREE.Group();
  const railX = -120;

  // Ballast Trackbed (Width 9m, Depth 0.4m)
  for (let rz = -2500; rz <= 2500; rz += 80) {
    const ry = getElevationAt(railX, rz) + 0.15;
    const ballastSeg = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.35, 80.5), ballastMat);
    ballastSeg.position.set(railX, ry, rz);
    ballastSeg.receiveShadow = true;
    railGroup.add(ballastSeg);
  }

  // Sleepers (Ties) spaced every 2.5m
  for (let rz = -600; rz <= 600; rz += 2.5) {
    const ry = getElevationAt(railX, rz) + 0.28;

    // Track 1 (Up Line at x = railX - 2.0)
    const sleeper1 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.2, 0.35), concreteSleeperMat);
    sleeper1.position.set(railX - 2.0, ry, rz);
    railGroup.add(sleeper1);

    // Track 2 (Down Line at x = railX + 2.0)
    const sleeper2 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.2, 0.35), concreteSleeperMat);
    sleeper2.position.set(railX + 2.0, ry, rz);
    railGroup.add(sleeper2);
  }

  // Steel Rails (Standard Gauge 1435mm / Broad Gauge 1676mm)
  const railOffsets = [
    railX - 2.0 - 0.75,
    railX - 2.0 + 0.75,
    railX + 2.0 - 0.75,
    railX + 2.0 + 0.75,
  ];

  for (let rz = -2500; rz <= 2500; rz += 100) {
    const ry = getElevationAt(railX, rz) + 0.45;
    railOffsets.forEach((rx) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 100.2), polishedRailMat);
      rail.position.set(rx, ry, rz);
      rail.castShadow = true;
      railGroup.add(rail);
    });
  }

  // Overhead Catenary System (OCS) Cantilever Masts every 45m
  for (let rz = -500; rz <= 500; rz += 45) {
    const ry = getElevationAt(railX, rz);
    const mast = new THREE.Group();
    mast.position.set(railX + 5.5, ry, rz);

    // Steel H-beam Mast (height 8.5m)
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8.5, 0.3), steelMat);
    post.position.y = 4.25;
    mast.add(post);

    // Cantilever Arm spanning tracks
    const arm = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.2, 0.2), steelMat);
    arm.position.set(-4.5, 7.8, 0);
    mast.add(arm);

    // Contact Wire drop brackets
    for (const cx of [-2.0 - 5.5, 2.0 - 5.5]) {
      const dropper = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4), steelMat);
      dropper.position.set(cx, 7.2, 0);
      mast.add(dropper);
    }

    railGroup.add(mast);
  }

  // Automatic Color Light Railway Signals (every 180m)
  const signalLamps: { group: THREE.Group; lampMesh: THREE.Mesh }[] = [];
  for (const sz of [-360, -180, 0, 180, 360]) {
    const sy = getElevationAt(railX, sz);
    const sigGrp = new THREE.Group();
    sigGrp.position.set(railX - 4.5, sy, sz);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 6.0, 8), steelMat);
    post.position.y = 3.0;
    sigGrp.add(post);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, 0.3), darkConcreteMat);
    head.position.set(0, 5.5, 0);
    sigGrp.add(head);

    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), greenAspectMat);
    lamp.position.set(0, 5.8, 0.18);
    sigGrp.add(lamp);
    signalLamps.push({ group: sigGrp, lampMesh: lamp });

    railGroup.add(sigGrp);
  }

  // =========================================================================
  // DYNAMIC LEVEL CROSSINGS WITH WORKING BOOM GATES & FLASHING LIGHTS
  // At z = -10 (Urban Arterial crossing) and z = 140 (Service Road crossing)
  // =========================================================================
  const crossingGates: THREE.Group[] = [];
  const crossingBeacons: THREE.Mesh[] = [];

  const createLevelCrossing = (zPos: number) => {
    const crossGrp = new THREE.Group();
    const cy = getElevationAt(railX, zPos);
    crossGrp.position.set(railX, cy, zPos);

    // Concrete Rubber Flange Crossings between tracks
    const pCross = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, 14), darkConcreteMat);
    pCross.position.y = 0.25;
    crossGrp.add(pCross);

    for (const sx of [-5.5, 5.5]) {
      const gatePost = new THREE.Group();
      gatePost.position.set(sx, 0, 0);

      // Warning St. Andrew's Cross & Mast
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 4.5, 8), steelMat);
      mast.position.y = 2.25;
      gatePost.add(mast);

      // Flashing Alternating Red Lamps
      for (const lx of [-0.35, 0.35]) {
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), redAspectMat);
        beacon.position.set(lx, 3.8, 0.2);
        gatePost.add(beacon);
        crossingBeacons.push(beacon);
      }

      // Motorized Striped Boom Barrier Gate (Length 6.5m)
      const gateArmGrp = new THREE.Group();
      gateArmGrp.position.set(0, 1.2, 0);

      const barrierArm = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.2, 0.1), redMat);
      barrierArm.position.x = sx < 0 ? 3.1 : -3.1;
      gateArmGrp.add(barrierArm);

      // White reflective stripes
      for (let st = 1; st < 6; st += 1.2) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.22, 0.12), whiteMat);
        stripe.position.x = sx < 0 ? st : -st;
        gateArmGrp.add(stripe);
      }

      gatePost.add(gateArmGrp);
      crossingGates.push(gateArmGrp);
      crossGrp.add(gatePost);
    }

    railGroup.add(crossGrp);
  };

  createLevelCrossing(-10);
  createLevelCrossing(140);

  // =========================================================================
  // GRAND CENTRAL RAILWAY TERMINAL (At x = -120, z = 25)
  // Dual High-Level Platforms, Brick Concourse Hall, Overhead Footbridge
  // =========================================================================
  const stationGroup = new THREE.Group();
  const stY = getElevationAt(railX, 25);
  stationGroup.position.set(railX, stY, 25);

  // Platform 1 (Left Island Platform: Width 7m, Length 140m)
  const plat1 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.1, 140), concreteMat);
  plat1.position.set(-6.5, 0.55, 0);
  plat1.receiveShadow = true;
  stationGroup.add(plat1);

  // Platform 2 (Right Island Platform)
  const plat2 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.1, 140), concreteMat);
  plat2.position.set(6.5, 0.55, 0);
  plat2.receiveShadow = true;
  stationGroup.add(plat2);

  // Tactile Yellow Warning Edges on Platforms
  for (const px of [-3.4, 3.4]) {
    const yellowTile = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 140), yellowMat);
    yellowTile.rotateX(-Math.PI / 2);
    yellowTile.position.set(px, 1.12, 0);
    stationGroup.add(yellowTile);
  }

  // Steel Canopy Roofs over Platforms
  for (const px of [-6.5, 6.5]) {
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.4, 110), steelMat);
    canopy.position.set(px, 5.5, 0);
    canopy.castShadow = true;
    stationGroup.add(canopy);

    for (let cz = -45; cz <= 45; cz += 18) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5.0, 8), steelMat);
      col.position.set(px, 2.5, cz);
      stationGroup.add(col);
    }
  }

  // Brick Main Station Building Concourse (Western side)
  const stBuilding = new THREE.Mesh(
    new THREE.BoxGeometry(20, 11, 65),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 })
  );
  stBuilding.position.set(-20, 5.5, 0);
  stBuilding.castShadow = true;
  stationGroup.add(stBuilding);

  // Station Grand Arched Entrance & Clock Tower
  const clockTower = new THREE.Mesh(new THREE.BoxGeometry(6, 18, 6), new THREE.MeshStandardMaterial({ color: 0x9a3412 }));
  clockTower.position.set(-20, 9, 28);
  clockTower.castShadow = true;
  stationGroup.add(clockTower);

  const clockFace = new THREE.Mesh(new THREE.CircleGeometry(1.6, 16), whiteMat);
  clockFace.position.set(-20, 15, 31.1);
  stationGroup.add(clockFace);

  // Pedestrian Overhead Footbridge spanning over all tracks
  const footbridge = new THREE.Group();
  footbridge.position.set(0, 0, -35);

  const fbSpan = new THREE.Mesh(new THREE.BoxGeometry(26, 0.5, 4.0), steelMat);
  fbSpan.position.y = 7.5;
  footbridge.add(fbSpan);

  const fbRoof = new THREE.Mesh(new THREE.BoxGeometry(26, 0.2, 4.2), glassBlueMat);
  fbRoof.position.y = 10.2;
  footbridge.add(fbRoof);

  // Stairs down to Platform 1 and 2
  for (const sx of [-6.5, 6.5]) {
    const stair = new THREE.Mesh(new THREE.BoxGeometry(3.5, 7.0, 8), concreteMat);
    stair.position.set(sx, 3.5, 4);
    footbridge.add(stair);
  }
  stationGroup.add(footbridge);

  railGroup.add(stationGroup);

  // =========================================================================
  // RIVER RAIL BRIDGE (Steel Warren Through-Truss Bridge at z = -120, x: -120)
  // =========================================================================
  const railBridge = new THREE.Group();
  railBridge.position.set(railX, 3.2, -75);

  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 70), darkConcreteMat);
  bridgeDeck.position.y = 0;
  railBridge.add(bridgeDeck);

  // Steel Warren Truss Sides
  for (const sideX of [-4.8, 4.8]) {
    const trussTop = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 68), steelMat);
    trussTop.position.set(sideX, 6.5, 0);
    railBridge.add(trussTop);

    for (let tz = -30; tz <= 30; tz += 10) {
      const diag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 7.2, 0.2), steelMat);
      diag.position.set(sideX, 3.25, tz);
      diag.rotation.x = 0.4;
      railBridge.add(diag);
    }
  }

  // Bridge Piers in River
  for (const pz of [-25, 25]) {
    const bPier = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 8, 12), concreteMat);
    bPier.position.set(0, -4, pz);
    railBridge.add(bPier);
  }
  railGroup.add(railBridge);
  group.add(railGroup);

  // =========================================================================
  // 2. ELEVATED METRO RAIL (MRT LINE-6) INFRASTRUCTURE (Along z = -45)
  // =========================================================================
  const metroGroup = new THREE.Group();
  const metroZ = -45;
  const metroHeight = 12.5;

  // Concrete Box Girder Viaduct & Hammerhead Piers (spanning x: -450 to +900)
  for (let mx = -450; mx <= 900; mx += 36) {
    const pierY = getElevationAt(mx, metroZ);

    // Monolithic Circular Concrete Column
    const pierCol = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.7, metroHeight + 2, 16), concreteMat);
    pierCol.position.set(mx, pierY + (metroHeight + 2) / 2, metroZ);
    pierCol.castShadow = true;
    metroGroup.add(pierCol);

    // Hammerhead Crosshead Pier
    const hammer = new THREE.Mesh(new THREE.BoxGeometry(11.5, 2.2, 5.2), darkConcreteMat);
    hammer.position.set(mx, pierY + metroHeight, metroZ);
    hammer.castShadow = true;
    metroGroup.add(hammer);
  }

  // Continuous Precast Box Girder Viaduct Deck
  const metroDeck = new THREE.Mesh(new THREE.BoxGeometry(1380, 1.8, 9.8), darkConcreteMat);
  metroDeck.position.set(225, metroHeight + 1.1, metroZ);
  metroGroup.add(metroDeck);

  // Parapet Sound Barrier Walls
  for (const zo of [-4.8, 4.8]) {
    const barrierWall = new THREE.Mesh(new THREE.BoxGeometry(1380, 1.6, 0.4), concreteMat);
    barrierWall.position.set(225, metroHeight + 2.6, metroZ + zo);
    metroGroup.add(barrierWall);
  }

  // Metro Dual Tracks & Center Third-Rail
  for (const trackZ of [metroZ - 2.2, metroZ + 2.2]) {
    for (const rz of [-0.75, 0.75]) {
      const mRail = new THREE.Mesh(new THREE.BoxGeometry(1380, 0.18, 0.1), polishedRailMat);
      mRail.position.set(225, metroHeight + 2.1, trackZ + rz);
      metroGroup.add(mRail);
    }
  }

  // METRO CENTRAL STATION (x = 15, z = -45)
  const metroStationGrp = new THREE.Group();
  const mstY = getElevationAt(15, metroZ);
  metroStationGrp.position.set(15, mstY, metroZ);

  // Concourse & Platform Structure
  const concourse = new THREE.Mesh(new THREE.BoxGeometry(75, 6.8, 24), whiteMat);
  concourse.position.set(0, metroHeight - 1.5, 0);
  concourse.castShadow = true;
  metroStationGrp.add(concourse);

  // Glass Facade Platform Enclosure
  const glassFacade = new THREE.Mesh(new THREE.BoxGeometry(75.4, 4.8, 24.4), glassBlueMat);
  glassFacade.position.set(0, metroHeight + 1.5, 0);
  metroStationGrp.add(glassFacade);

  // Aerodynamic Skylight Curved Roof
  const stRoof = new THREE.Mesh(
    new THREE.CylinderGeometry(15, 15, 78, 24, 1, false, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
  );
  stRoof.rotation.z = Math.PI / 2;
  stRoof.position.set(0, metroHeight + 5.0, 0);
  metroStationGrp.add(stRoof);

  // Platform Screen Doors (PSDs) with LED indicator strips
  for (const pz of [-2.8, 2.8]) {
    const psd = new THREE.Mesh(
      new THREE.BoxGeometry(65, 2.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, roughness: 0.2 })
    );
    psd.position.set(0, metroHeight + 3.1, pz);
    metroStationGrp.add(psd);
  }

  // Escalators & Entry Portals to Ground Level
  for (const ex of [-28, 28]) {
    const esc = new THREE.Mesh(new THREE.BoxGeometry(6.5, metroHeight, 9), darkConcreteMat);
    esc.position.set(ex, metroHeight / 2, 14);
    esc.castShadow = true;
    metroStationGrp.add(esc);
  }

  metroGroup.add(metroStationGrp);
  group.add(metroGroup);

  // =========================================================================
  // 3. ANIMATED TRAINS FLEET
  // Train 1: Intercity Locomotive + Coaches + Freight Wagons
  // Train 2: MRT Line-6 Aerodynamic Metro Train (4 Cars)
  // =========================================================================

  // --- TRAIN 1: INTERCITY DIESEL-ELECTRIC TRAIN ---
  const intercityTrainGroup = new THREE.Group();
  intercityTrainGroup.name = 'intercity_train';

  // Locomotive (Class 2900 / 3000 Diesel-Electric)
  const loco = new THREE.Group();
  const locoBody = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 4.2, 15.5),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.35 })
  );
  locoBody.position.y = 2.5;
  locoBody.castShadow = true;
  loco.add(locoBody);

  // Red & White Livery Stripes
  const locoStripe = new THREE.Mesh(new THREE.BoxGeometry(3.64, 0.7, 15.6), redMat);
  locoStripe.position.set(0, 2.2, 0);
  loco.add(locoStripe);

  // Locomotive Driver Cab Windows
  const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.3, 0.3), glassBlueMat);
  cabGlass.position.set(0, 3.7, 7.8);
  loco.add(cabGlass);

  // Glowing High-Intensity Headlights
  for (const hx of [-1.1, 1.1]) {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    hl.position.set(hx, 2.2, 7.85);
    loco.add(hl);
  }

  intercityTrainGroup.add(loco);

  // 4 Passenger Coaches (Red-Green Livery)
  for (let c = 1; c <= 4; c++) {
    const coach = new THREE.Group();
    coach.position.z = -c * 17;

    const cBody = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 3.9, 15.5),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 })
    );
    cBody.position.y = 2.4;
    coach.add(cBody);

    const cStripe = new THREE.Mesh(new THREE.BoxGeometry(3.44, 0.8, 15.6), redMat);
    cStripe.position.set(0, 2.3, 0);
    coach.add(cStripe);

    // Glowing passenger windows
    for (let wz = -5.5; wz <= 5.5; wz += 2.2) {
      const pWin = new THREE.Mesh(new THREE.BoxGeometry(3.48, 0.9, 1.3), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      pWin.position.set(0, 2.8, wz);
      coach.add(pWin);
    }

    intercityTrainGroup.add(coach);
  }

  // 3 Container Freight Flatcars
  const containerColors = [0x1d4ed8, 0xdc2626, 0xd97706];
  for (let f = 5; f <= 7; f++) {
    const flat = new THREE.Group();
    flat.position.z = -f * 17;

    const bed = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.7, 15.5), darkConcreteMat);
    bed.position.y = 0.8;
    flat.add(bed);

    const container = new THREE.Mesh(
      new THREE.BoxGeometry(3.1, 3.0, 14.5),
      new THREE.MeshStandardMaterial({ color: containerColors[(f - 5) % 3], roughness: 0.6 })
    );
    container.position.y = 2.6;
    flat.add(container);

    intercityTrainGroup.add(flat);
  }

  group.add(intercityTrainGroup);

  // --- TRAIN 2: MRT LINE-6 AERODYNAMIC METRO TRAIN ---
  const metroTrainGroup = new THREE.Group();
  metroTrainGroup.name = 'mrt_metro_train';

  const metroMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.75, roughness: 0.25 });
  const metroTeal = new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.4 });

  for (let m = 0; m < 4; m++) {
    const mCar = new THREE.Group();
    mCar.position.x = -m * 15.5;

    const mBody = new THREE.Mesh(new THREE.BoxGeometry(14.5, 3.2, 3.4), metroMat);
    mBody.position.y = 1.8;
    mCar.add(mBody);

    const mBand = new THREE.Mesh(new THREE.BoxGeometry(14.55, 0.75, 3.45), metroTeal);
    mBand.position.set(0, 1.8, 0);
    mCar.add(mBand);

    // Large panoramic windows
    for (let wx = -4.5; wx <= 4.5; wx += 2.8) {
      const mWin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.1, 3.5), glassBlueMat);
      mWin.position.set(wx, 2.1, 0);
      mCar.add(mWin);
    }

    metroTrainGroup.add(mCar);
  }

  // Aerodynamic streamlined cab nose
  const metroNose = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.6, 16), metroMat);
  metroNose.rotation.z = -Math.PI / 2;
  metroNose.position.set(7.8, 1.8, 0);
  metroTrainGroup.add(metroNose);

  group.add(metroTrainGroup);

  // =========================================================================
  // SIMULATION STATE & TELEMETRY
  // =========================================================================
  const intercityTelemetry: TrainTelemetry = {
    route: 'National Intercity Corridor Line (North-South Mainline)',
    speedKmh: 65,
    maxSpeedKmh: 110,
    throttle: 0.75,
    brakePressurePsi: 0,
    currentStation: 'In Transit',
    nextStation: 'Grand Central Terminal',
    distanceToNextStationM: 450,
    dwellTimerSec: 0,
    isStoppedAtStation: false,
    signalState: 'GREEN',
    doorsOpen: false,
    powerSource: 'Diesel-Electric 3,300 HP',
    passengerCount: 684,
  };

  const metroTelemetry: TrainTelemetry = {
    route: 'MRT Line-6 Elevated Rapid Transit Viaduct',
    speedKmh: 60,
    maxSpeedKmh: 85,
    throttle: 0.8,
    brakePressurePsi: 0,
    currentStation: 'In Transit',
    nextStation: 'Metropolitan Central MRT Station',
    distanceToNextStationM: 280,
    dwellTimerSec: 0,
    isStoppedAtStation: false,
    signalState: 'GREEN',
    doorsOpen: false,
    powerSource: '1500V DC Overhead Catenary',
    passengerCount: 1120,
  };

  let crossingGatesLowered = false;
  let trainZ = -600;
  let metroX = -350;

  // Audio Horn cooldown timer
  let lastHornTime = 0;

  const update = (time: number, delta: number) => {
    // -------------------------------------------------------------
    // 1. UPDATE INTERCITY RAILWAY TRAIN PHYSICS & SCHEDULE
    // -------------------------------------------------------------
    const stationStopZ = 25;
    const distToStation = stationStopZ - trainZ;

    // Station Braking & Dwell Routine
    if (distToStation > 0 && distToStation < 140 && intercityTelemetry.dwellTimerSec === 0) {
      // Slow down into station
      intercityTelemetry.speedKmh = Math.max(0, intercityTelemetry.speedKmh - 22 * delta);
      intercityTelemetry.brakePressurePsi = 65;
      intercityTelemetry.throttle = 0;

      if (intercityTelemetry.speedKmh <= 0.5 && Math.abs(distToStation) < 6) {
        intercityTelemetry.speedKmh = 0;
        intercityTelemetry.isStoppedAtStation = true;
        intercityTelemetry.doorsOpen = true;
        intercityTelemetry.currentStation = 'Grand Central Terminal';
        intercityTelemetry.dwellTimerSec = 10; // 10 seconds dwell
      }
    } else if (intercityTelemetry.dwellTimerSec > 0) {
      // Dwelling at platform
      intercityTelemetry.dwellTimerSec -= delta;
      if (intercityTelemetry.dwellTimerSec <= 0) {
        intercityTelemetry.dwellTimerSec = 0;
        intercityTelemetry.isStoppedAtStation = false;
        intercityTelemetry.doorsOpen = false;
        intercityTelemetry.currentStation = 'In Transit';
        intercityTelemetry.nextStation = 'Port Freight Depot';
        audioEngine.playAirBrake();
      }
    } else {
      // Accelerating & Cruising
      intercityTelemetry.speedKmh = Math.min(intercityTelemetry.maxSpeedKmh, intercityTelemetry.speedKmh + 14 * delta);
      intercityTelemetry.brakePressurePsi = 0;
      intercityTelemetry.throttle = 0.85;
    }

    // Move Train along Z
    const trainVel = (intercityTelemetry.speedKmh * 1000) / 3600; // m/s
    trainZ += trainVel * delta;
    if (trainZ > 2400) {
      trainZ = -2400; // Loop back
      intercityTelemetry.nextStation = 'Grand Central Terminal';
    }

    intercityTelemetry.distanceToNextStationM = Math.max(0, Math.round(stationStopZ - trainZ));

    const trainElevation = getElevationAt(railX - 2.0, trainZ) + 0.6;
    intercityTrainGroup.position.set(railX - 2.0, trainElevation, trainZ);

    // Level Crossing Triggers: If train is within 120m of crossing at z = -10 or z = 140
    const nearCrossing1 = Math.abs(trainZ - (-10)) < 110;
    const nearCrossing2 = Math.abs(trainZ - 140) < 110;
    crossingGatesLowered = nearCrossing1 || nearCrossing2;

    // Animate Boom Barrier Gates
    crossingGates.forEach((gate) => {
      const targetAngle = crossingGatesLowered ? 0 : -Math.PI / 2.2;
      gate.rotation.z = THREE.MathUtils.lerp(gate.rotation.z, targetAngle, delta * 4);
    });

    // Sound Horn when approaching level crossing
    if (crossingGatesLowered && time - lastHornTime > 12) {
      lastHornTime = time;
      audioEngine.playTrainHorn();
      audioEngine.playCrossingBell();
    }

    // -------------------------------------------------------------
    // 2. UPDATE METRO RAIL MRT LINE-6 TRAIN
    // -------------------------------------------------------------
    const metroStopX = 15;
    const metroDistToStation = metroStopX - metroX;

    if (metroDistToStation > 0 && metroDistToStation < 120 && metroTelemetry.dwellTimerSec === 0) {
      // Smooth deceleration into station
      metroTelemetry.speedKmh = Math.max(0, metroTelemetry.speedKmh - 25 * delta);
      metroTelemetry.brakePressurePsi = 55;
      metroTelemetry.throttle = 0;

      if (metroTelemetry.speedKmh <= 0.5 && Math.abs(metroDistToStation) < 5) {
        metroTelemetry.speedKmh = 0;
        metroTelemetry.isStoppedAtStation = true;
        metroTelemetry.doorsOpen = true;
        metroTelemetry.currentStation = 'Metropolitan Central MRT Station';
        metroTelemetry.dwellTimerSec = 8;
        audioEngine.playMetroChime();
      }
    } else if (metroTelemetry.dwellTimerSec > 0) {
      metroTelemetry.dwellTimerSec -= delta;
      if (metroTelemetry.dwellTimerSec <= 0) {
        metroTelemetry.dwellTimerSec = 0;
        metroTelemetry.isStoppedAtStation = false;
        metroTelemetry.doorsOpen = false;
        metroTelemetry.currentStation = 'In Transit';
        metroTelemetry.nextStation = 'East Tech Park MRT Station';
      }
    } else {
      metroTelemetry.speedKmh = Math.min(metroTelemetry.maxSpeedKmh, metroTelemetry.speedKmh + 18 * delta);
      metroTelemetry.brakePressurePsi = 0;
      metroTelemetry.throttle = 0.9;
    }

    const metroVel = (metroTelemetry.speedKmh * 1000) / 3600;
    metroX += metroVel * delta;
    if (metroX > 900) {
      metroX = -450;
      metroTelemetry.nextStation = 'Metropolitan Central MRT Station';
    }

    metroTelemetry.distanceToNextStationM = Math.max(0, Math.round(metroStopX - metroX));
    metroTrainGroup.position.set(metroX, metroHeight + 2.4, metroZ - 2.2);

    // Alternate signal lights
    signalLamps.forEach((sig, idx) => {
      const sigZ = sig.group.position.z;
      const isTrainPassed = trainZ > sigZ && trainZ < sigZ + 80;
      if (isTrainPassed) {
        sig.lampMesh.material = redAspectMat;
      } else {
        sig.lampMesh.material = greenAspectMat;
      }
    });
  };

  return {
    group,
    intercityTrainGroup,
    metroTrainGroup,
    intercityTelemetry,
    metroTelemetry,
    crossingGatesLowered,
    update,
  };
}
