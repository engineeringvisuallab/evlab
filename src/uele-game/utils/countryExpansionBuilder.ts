import * as THREE from 'three';
import { createAsphaltTexture, createCorrugatedTinTexture } from './terrainTextures';

export interface CountryExpansionResult {
  group: THREE.Group;
  animatedTrain: THREE.Group;
  animatedMetro: THREE.Group;
  lighthouseBeam: THREE.Mesh;
  updateAnimation: (time: number, delta: number) => void;
}

export function buildCountryExpansion(
  getElevationAt: (x: number, z: number) => number
): CountryExpansionResult {
  const group = new THREE.Group();
  group.name = 'country_expansion_infrastructure_group';

  // Materials
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
  const darkConcreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
  const shinySteelMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.95, roughness: 0.15 });
  const woodTieMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
  const ballastMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.95 });
  const glassBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.85,
  });
  const glassGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 0.7,
  });
  const redCraneMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.4, roughness: 0.5 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const oceanBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    roughness: 0.15,
    metalness: 0.6,
    transparent: true,
    opacity: 0.92,
  });

  const asphaltTex = createAsphaltTexture();
  const roadMat = new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.8 });
  const tinSilver = createCorrugatedTinTexture('silver');
  const tinSilverMat = new THREE.MeshStandardMaterial({ map: tinSilver, roughness: 0.5, metalness: 0.4 });

  // Container colors
  const containerColors = [0x1d4ed8, 0xb91c1c, 0x15803d, 0xd97706, 0x0f766e, 0x475569, 0x7c3aed];

  // =========================================================================
  // 1. CONNECTED PAVED ROADS TO ALL LANDMARKS
  // =========================================================================
  const roadsGroup = new THREE.Group();

  // Helper to build a continuous curved/segmented paved road ribbon
  const buildRoadRibbon = (points: [number, number][], width = 12) => {
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, z1] = points[i];
      const [x2, z2] = points[i + 1];
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);

      const cx = (x1 + x2) / 2;
      const cz = (z1 + z2) / 2;
      const cy = getElevationAt(cx, cz) + 0.15;

      const seg = new THREE.Mesh(new THREE.BoxGeometry(width, 0.3, len), roadMat);
      seg.position.set(cx, cy, cz);
      seg.rotation.y = angle;
      seg.receiveShadow = true;
      roadsGroup.add(seg);
    }
  };

  // Road 1: Coastal Deep Sea Port Highway (curves from N5 at (20, 200) to (600, 1800) and Lighthouse at (1200, 2200))
  buildRoadRibbon([
    [20, 200],
    [80, 400],
    [180, 750],
    [320, 1150],
    [460, 1500],
    [600, 1800],
    [850, 1950],
    [1050, 2100],
    [1200, 2200],
  ], 14);

  // Harbor Quay Loop Road at Sea Port
  buildRoadRibbon([
    [480, 1800],
    [600, 1800],
    [720, 1800],
    [720, 1920],
    [480, 1920],
    [480, 1800],
  ], 12);

  // Road 2: Northern Mountain Summit & Peak Switchback Highway
  buildRoadRibbon([
    [20, -10],
    [-80, -220],
    [-220, -450],
    [-450, -800],
    [-750, -1250],
    [-1150, -1700],
    [-1600, -2200],
  ], 12);

  // Road 3: Western Tea Garden Highlands Highway
  buildRoadRibbon([
    [-140, -10],
    [-350, 60],
    [-650, 140],
    [-1050, 220],
    [-1450, 310],
    [-1800, 400],
  ], 12);

  // Road 4: National Rainforest & Sundarbans Scenic Highway
  buildRoadRibbon([
    [20, -10],
    [180, -150],
    [380, -380],
    [600, -600],
    [800, -800],
    [1100, -1100],
  ], 12);

  // Road 5: Central Railway Station & Metro Concourse Avenues
  buildRoadRibbon([
    [-220, 25],
    [-120, 25],
    [20, 25],
  ], 14);

  buildRoadRibbon([
    [-60, -45],
    [15, -45],
    [80, -45],
  ], 14);

  group.add(roadsGroup);

  // =========================================================================
  // 2. RAILWAY LINE SYSTEM & TRAIN (Along x = -120)
  // =========================================================================
  const railGroup = new THREE.Group();
  const railX = -120;

  // Ballast Bed & Dual Steel Tracks across 9,000 meters
  const ballastGeo = new THREE.BoxGeometry(7, 0.4, 9000);
  const ballastMesh = new THREE.Mesh(ballastGeo, ballastMat);
  ballastMesh.position.set(railX, getElevationAt(railX, 0) + 0.2, 0);
  ballastMesh.receiveShadow = true;
  railGroup.add(ballastMesh);

  // Wooden Sleepers (Ties) instanced or generated along central 1,200m reach
  const tieGeo = new THREE.BoxGeometry(5.2, 0.25, 0.7);
  for (let tz = -600; tz <= 600; tz += 2.0) {
    const tieMesh = new THREE.Mesh(tieGeo, woodTieMat);
    const ty = getElevationAt(railX, tz) + 0.42;
    tieMesh.position.set(railX, ty, tz);
    railGroup.add(tieMesh);
  }

  // Steel Rails (Two parallel steel bars)
  for (const ro of [-1.5, 1.5]) {
    const railBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 9000), shinySteelMat);
    railBar.position.set(railX + ro, getElevationAt(railX, 0) + 0.65, 0);
    railGroup.add(railBar);
  }

  // Rail Level Crossing at East-West Boulevard (x = -120, z = -10)
  const crossGroup = new THREE.Group();
  const crossY = getElevationAt(railX, -10);
  crossGroup.position.set(railX, crossY, -10);

  // Warning Signal Posts
  for (const sx of [-6, 6]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 5.5, 8), darkConcreteMat);
    post.position.set(sx, 2.75, 5);
    crossGroup.add(post);

    // Crossbuck sign
    const cb1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 0.08), whiteMat);
    cb1.position.set(sx, 5.0, 5);
    cb1.rotation.z = Math.PI / 4;
    crossGroup.add(cb1);

    const cb2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 0.08), whiteMat);
    cb2.position.set(sx, 5.0, 5);
    cb2.rotation.z = -Math.PI / 4;
    crossGroup.add(cb2);

    // Red flashing lamps
    const lamp1 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
    lamp1.position.set(sx - 0.4, 4.4, 5.15);
    crossGroup.add(lamp1);

    const lamp2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
    lamp2.position.set(sx + 0.4, 4.4, 5.15);
    crossGroup.add(lamp2);

    // Striped Barrier Gate
    const gate = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.25, 0.15), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    gate.position.set(sx < 0 ? sx + 3.2 : sx - 3.2, 1.4, 5);
    crossGroup.add(gate);
  }
  railGroup.add(crossGroup);

  // Grand Central Railway Station (at x = -120, z = 25)
  const stationGroup = new THREE.Group();
  const stY = getElevationAt(railX, 25);
  stationGroup.position.set(railX - 16, stY, 25);

  // Station Platform
  const platMesh = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 95), concreteMat);
  platMesh.position.set(10, 0.6, 0);
  platMesh.receiveShadow = true;
  stationGroup.add(platMesh);

  // Station Building
  const stBuilding = new THREE.Mesh(new THREE.BoxGeometry(18, 10, 48), brickMatFromColor(0xb45309));
  stBuilding.position.set(-6, 5, 0);
  stBuilding.castShadow = true;
  stationGroup.add(stBuilding);

  // Station Roof Canopy (Curved Steel Truss)
  const canopyMesh = new THREE.Mesh(new THREE.BoxGeometry(22, 0.6, 65), steelMat);
  canopyMesh.position.set(6, 7.5, 0);
  stationGroup.add(canopyMesh);

  for (let pz = -25; pz <= 25; pz += 12) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 7.0, 8), steelMat);
    col.position.set(12, 3.5, pz);
    stationGroup.add(col);
  }

  // Station Signboard
  const signMesh = new THREE.Mesh(new THREE.BoxGeometry(10, 1.6, 0.3), new THREE.MeshStandardMaterial({ color: 0x065f46 }));
  signMesh.position.set(-6, 11, 24.2);
  stationGroup.add(signMesh);

  railGroup.add(stationGroup);

  // 3. ANIMATED PASSENGER & FREIGHT TRAIN
  const trainGroup = new THREE.Group();

  // Locomotive (Diesel-Electric Engine)
  const loco = new THREE.Group();
  const locoBody = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.0, 14), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.6 }));
  locoBody.position.y = 2.4;
  loco.add(locoBody);

  const locoCabin = new THREE.Mesh(new THREE.BoxGeometry(3.62, 2.2, 6), new THREE.MeshStandardMaterial({ color: 0x0369a1 }));
  locoCabin.position.set(0, 3.4, 2);
  loco.add(locoCabin);

  // Windshield & Glow Headlights
  const locoGlass = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 0.3), glassBlueMat);
  locoGlass.position.set(0, 3.6, 7.05);
  loco.add(locoGlass);

  const headLightL = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  headLightL.position.set(-1.1, 2.0, 7.1);
  loco.add(headLightL);

  const headLightR = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  headLightR.position.set(1.1, 2.0, 7.1);
  loco.add(headLightR);

  trainGroup.add(loco);

  // 4 Passenger Carriages (Green & Red Bangladesh Railway livery)
  for (let c = 1; c <= 4; c++) {
    const coach = new THREE.Group();
    coach.position.z = -c * 16;

    const coachBody = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.8, 14.5), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 }));
    coachBody.position.y = 2.3;
    coach.add(coachBody);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.44, 0.8, 14.6), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    stripe.position.set(0, 2.2, 0);
    coach.add(stripe);

    // Windows
    for (let w = -5; w <= 5; w += 2.2) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(3.48, 0.9, 1.4), glassGlowMat);
      win.position.set(0, 2.7, w);
      coach.add(win);
    }
    trainGroup.add(coach);
  }

  // 3 Freight Wagons with colorful shipping containers
  for (let f = 5; f <= 7; f++) {
    const flatCar = new THREE.Group();
    flatCar.position.z = -f * 16;

    const flatBed = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.8, 14.5), darkConcreteMat);
    flatBed.position.y = 0.8;
    flatCar.add(flatBed);

    const containerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.1, 3.0, 13.5),
      new THREE.MeshStandardMaterial({ color: containerColors[(f * 2) % containerColors.length], roughness: 0.6 })
    );
    containerMesh.position.y = 2.7;
    flatCar.add(containerMesh);

    trainGroup.add(flatCar);
  }

  trainGroup.position.set(railX, getElevationAt(railX, 0) + 0.6, 0);
  railGroup.add(trainGroup);
  group.add(railGroup);

  // =========================================================================
  // 3. ELEVATED METRO RAIL SYSTEM & MRT TRAIN (Along z = -45)
  // =========================================================================
  const metroGroup = new THREE.Group();
  const metroZ = -45;
  const metroH = 12.5; // Elevated viaduct height

  // Precast Concrete Box Girder Viaduct & Elevated Dual Tracks
  for (let mx = -550; mx <= 1100; mx += 36) {
    const pierY = getElevationAt(mx, metroZ);
    // Concrete Column Pier
    const pier = new THREE.Mesh(new THREE.BoxGeometry(3.2, metroH + 2, 4.0), concreteMat);
    pier.position.set(mx, pierY + (metroH + 2) / 2, metroZ);
    pier.castShadow = true;
    metroGroup.add(pier);

    // Crosshead pier hammerhead
    const hammer = new THREE.Mesh(new THREE.BoxGeometry(10.5, 2.2, 5.0), darkConcreteMat);
    hammer.position.set(mx, pierY + metroH, metroZ);
    metroGroup.add(hammer);
  }

  // Continuous Viaduct Deck Box Girder
  const viaductDeck = new THREE.Mesh(new THREE.BoxGeometry(1680, 1.8, 9.5), darkConcreteMat);
  viaductDeck.position.set(275, metroH + 1.2, metroZ);
  metroGroup.add(viaductDeck);

  // Parapet Sound Barrier Walls
  for (const zo of [-4.6, 4.6]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(1680, 1.4, 0.4), concreteMat);
    wall.position.set(275, metroH + 2.5, metroZ + zo);
    metroGroup.add(wall);
  }

  // Elevated Metro Station (at x = 15, z = -45)
  const metroStGrp = new THREE.Group();
  const mstY = getElevationAt(15, metroZ);
  metroStGrp.position.set(15, mstY, metroZ);

  // Concourse & Platform Structure
  const stConcourse = new THREE.Mesh(new THREE.BoxGeometry(68, 6.5, 22), whiteMat);
  stConcourse.position.set(0, metroH - 1.5, 0);
  metroStGrp.add(stConcourse);

  // Glass Facade Windows
  const stGlass = new THREE.Mesh(new THREE.BoxGeometry(68.4, 4.5, 22.4), glassBlueMat);
  stGlass.position.set(0, metroH + 1.2, 0);
  metroStGrp.add(stGlass);

  // Curved Futuristic Roof Canopy
  const stRoof = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 72, 16, 1, false, 0, Math.PI), steelMat);
  stRoof.rotation.z = Math.PI / 2;
  stRoof.position.set(0, metroH + 4.5, 0);
  metroStGrp.add(stRoof);

  // Ground Escalator / Access Towers
  for (const ex of [-24, 24]) {
    const esc = new THREE.Mesh(new THREE.BoxGeometry(6, metroH, 8), darkConcreteMat);
    esc.position.set(ex, metroH / 2, 12);
    metroStGrp.add(esc);
  }
  metroGroup.add(metroStGrp);

  // ANIMATED METRO TRAIN (4-Car Aerodynamic MRT Train)
  const metroTrainGroup = new THREE.Group();
  const trainMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.8, roughness: 0.2 });
  const tealMat = new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.3 });

  for (let mc = 0; mc < 4; mc++) {
    const car = new THREE.Group();
    car.position.x = -mc * 15;

    const carBody = new THREE.Mesh(new THREE.BoxGeometry(14, 3.2, 3.4), trainMat);
    carBody.position.y = 1.8;
    car.add(carBody);

    const band = new THREE.Mesh(new THREE.BoxGeometry(14.05, 0.7, 3.45), tealMat);
    band.position.set(0, 1.8, 0);
    car.add(band);

    // Glass Windows
    for (let wx = -4.5; wx <= 4.5; wx += 2.8) {
      const gwin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 3.5), glassBlueMat);
      gwin.position.set(wx, 2.1, 0);
      car.add(gwin);
    }
    metroTrainGroup.add(car);
  }

  // Aerodynamic nose on lead car
  const nose = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.5, 12), trainMat);
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(7.5, 1.8, 0);
  metroTrainGroup.add(nose);

  metroTrainGroup.position.set(15, metroH + 2.4, metroZ);
  metroGroup.add(metroTrainGroup);
  group.add(metroGroup);

  // =========================================================================
  // 4. SEA WITH MARITIME DEEP SEA PORT & LIGHTHOUSE
  // =========================================================================
  const seaPortGroup = new THREE.Group();
  const portX = 600;
  const portZ = 1800;

  // Bay of Bengal Ocean Water Surface (Southern Expanse)
  const oceanGeo = new THREE.PlaneGeometry(9600, 3600);
  oceanGeo.rotateX(-Math.PI / 2);
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanBlueMat);
  oceanMesh.position.set(0, 0.2, 3200);
  seaPortGroup.add(oceanMesh);

  // Deepwater Harbor Concrete Berth & Quay Wall (Length 450m, Width 140m)
  const quayMesh = new THREE.Mesh(new THREE.BoxGeometry(450, 4.0, 160), concreteMat);
  quayMesh.position.set(portX, 2.0, portZ);
  quayMesh.receiveShadow = true;
  seaPortGroup.add(quayMesh);

  // Mooring Bollards & Edge Kerb
  const kerb = new THREE.Mesh(new THREE.BoxGeometry(450, 0.8, 3.0), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
  kerb.position.set(portX, 4.3, portZ + 78);
  seaPortGroup.add(kerb);

  for (let bx = portX - 200; bx <= portX + 200; bx += 30) {
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.4, 8), darkConcreteMat);
    bollard.position.set(bx, 4.7, portZ + 78);
    seaPortGroup.add(bollard);
  }

  // 2x SUPER POST-PANAMAX SHIP-TO-SHORE (STS) GANTRY CRANES
  for (const cx of [portX - 70, portX + 70]) {
    const crane = new THREE.Group();
    crane.position.set(cx, 4.0, portZ + 50);

    // Gantry Legs (A-frame legs)
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 45, 2.2), redCraneMat);
    leg1.position.set(-10, 22.5, -15);
    crane.add(leg1);

    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 45, 2.2), redCraneMat);
    leg2.position.set(10, 22.5, -15);
    crane.add(leg2);

    const leg3 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 45, 2.2), redCraneMat);
    leg3.position.set(-10, 22.5, 15);
    crane.add(leg3);

    const leg4 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 45, 2.2), redCraneMat);
    leg4.position.set(10, 22.5, 15);
    crane.add(leg4);

    // Operator House & Machinery Room
    const machRoom = new THREE.Mesh(new THREE.BoxGeometry(24, 6, 32), whiteMat);
    machRoom.position.set(0, 46, 0);
    crane.add(machRoom);

    // High Outreaching Steel Boom (Spans 65m over ocean and berthed ship)
    const boom = new THREE.Mesh(new THREE.BoxGeometry(6.0, 3.5, 80), redCraneMat);
    boom.position.set(0, 48, 30);
    crane.add(boom);

    // Container Spreader Hoist hanging
    const spreader = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 13), darkConcreteMat);
    spreader.position.set(0, 28, 45);
    crane.add(spreader);

    // Suspension cables
    for (const cableZ of [40, 50]) {
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 20, 6), steelMat);
      cable.position.set(0, 38, cableZ);
      crane.add(cable);
    }
    seaPortGroup.add(crane);
  }

  // ULTRA LARGE CONTAINER VESSEL (Giant Cargo Ship berthed at port)
  const ship = new THREE.Group();
  ship.position.set(portX, 0, portZ + 125);

  // Ship Hull (Length 240m, Beam 38m, Height 22m)
  const hull = new THREE.Mesh(new THREE.BoxGeometry(240, 18, 36), darkConcreteMat);
  hull.position.set(0, 8, 0);
  ship.add(hull);

  // Bow & Bulbous nose
  const bow = new THREE.Mesh(new THREE.ConeGeometry(18, 35, 12), darkConcreteMat);
  bow.rotation.z = -Math.PI / 2;
  bow.position.set(135, 8, 0);
  ship.add(bow);

  // Multi-color Stacked Shipping Containers on Deck
  for (let row = -90; row <= 90; row += 16) {
    for (let tier = 0; tier < 3; tier++) {
      for (let stack = -12; stack <= 12; stack += 6) {
        const cColor = containerColors[Math.abs(Math.floor(row + tier * 3 + stack)) % containerColors.length];
        const box = new THREE.Mesh(new THREE.BoxGeometry(14, 3.2, 5.5), new THREE.MeshStandardMaterial({ color: cColor, roughness: 0.6 }));
        box.position.set(row, 18 + tier * 3.3, stack);
        ship.add(box);
      }
    }
  }

  // Navigation Bridge Superstructure & Radar Mast
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(26, 24, 32), whiteMat);
  bridge.position.set(-85, 26, 0);
  ship.add(bridge);

  const bridgeGlass = new THREE.Mesh(new THREE.BoxGeometry(26.4, 3.2, 32.4), glassBlueMat);
  bridgeGlass.position.set(-85, 34, 0);
  ship.add(bridgeGlass);

  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.0, 14, 12), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
  funnel.position.set(-105, 38, 0);
  ship.add(funnel);

  seaPortGroup.add(ship);

  // Container Yard on Land (Stacks of colorful containers)
  for (let bx = portX - 180; bx <= portX + 180; bx += 32) {
    for (let bz = portZ - 55; bz >= portZ - 120; bz -= 18) {
      const stackHeight = 2 + Math.floor(Math.random() * 2);
      for (let h = 0; h < stackHeight; h++) {
        const cCol = containerColors[Math.floor(Math.random() * containerColors.length)];
        const yardBox = new THREE.Mesh(
          new THREE.BoxGeometry(24, 3.4, 8),
          new THREE.MeshStandardMaterial({ color: cCol, roughness: 0.7 })
        );
        yardBox.position.set(bx, 4.0 + 1.7 + h * 3.4, bz);
        yardBox.castShadow = true;
        seaPortGroup.add(yardBox);
      }
    }
  }

  // COASTAL LIGHTHOUSE AT (1200, 2200)
  const lhGroup = new THREE.Group();
  const lhX = 1200;
  const lhZ = 2200;
  const lhY = getElevationAt(lhX, lhZ);
  lhGroup.position.set(lhX, lhY, lhZ);

  // Rocky Foundation Platform
  const rockBase = new THREE.Mesh(new THREE.CylinderGeometry(18, 22, 6, 12), darkConcreteMat);
  rockBase.position.y = 3;
  lhGroup.add(rockBase);

  // Lighthouse Tower (Red and White striped rings)
  const towerH = 34;
  for (let s = 0; s < 6; s++) {
    const sMat = s % 2 === 0 ? whiteMat : redCraneMat;
    const r1 = 5.5 - s * 0.55;
    const r2 = 5.5 - (s + 1) * 0.55;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, towerH / 6, 16), sMat);
    ring.position.y = 6 + (s + 0.5) * (towerH / 6);
    ring.castShadow = true;
    lhGroup.add(ring);
  }

  // Lantern Room & Gallery Balcony
  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 1.2, 16), darkConcreteMat);
  gallery.position.y = 6 + towerH + 0.6;
  lhGroup.add(gallery);

  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 4.5, 16), glassBlueMat);
  lantern.position.y = 6 + towerH + 3.0;
  lhGroup.add(lantern);

  const dome = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), redCraneMat);
  dome.position.y = 6 + towerH + 5.2;
  lhGroup.add(dome);

  // Rotating Light Beam Cone
  const beamGeo = new THREE.ConeGeometry(38, 280, 16);
  beamGeo.rotateX(Math.PI / 2);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const lighthouseBeam = new THREE.Mesh(beamGeo, beamMat);
  lighthouseBeam.position.set(0, 6 + towerH + 3.0, 140);
  lhGroup.add(lighthouseBeam);

  seaPortGroup.add(lhGroup);
  group.add(seaPortGroup);

  // =========================================================================
  // 5. FORESTS (SUNDARBANS MANGROVE & NORTHERN EVERGREEN RAINFOREST)
  // =========================================================================
  const forestGroup = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const mangroveFoliageMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.85 });
  const rainforestFoliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });

  const treeTrunkGeo = new THREE.CylinderGeometry(0.4, 0.9, 7.5, 6);
  const foliageConeGeo = new THREE.ConeGeometry(4.2, 10.5, 7);
  const foliageSphereGeo = new THREE.SphereGeometry(3.8, 8, 8);

  // Sundarbans Mangrove Forest Cluster (Around 800, -800)
  for (let i = 0; i < 90; i++) {
    const fx = 800 + (Math.random() - 0.5) * 450;
    const fz = -800 + (Math.random() - 0.5) * 450;
    const fy = getElevationAt(fx, fz);

    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(treeTrunkGeo, trunkMat);
    trunk.position.y = 3.75;
    tree.add(trunk);

    // Stilt roots for mangrove tree
    for (let r = 0; r < 4; r++) {
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 3.2, 4), trunkMat);
      root.position.set(Math.cos(r * 1.57) * 1.2, 1.2, Math.sin(r * 1.57) * 1.2);
      root.rotation.z = 0.4;
      tree.add(root);
    }

    const foliage = new THREE.Mesh(foliageSphereGeo, mangroveFoliageMat);
    foliage.position.y = 8.5;
    const s = 0.8 + Math.random() * 0.5;
    foliage.scale.set(s * 1.3, s, s * 1.3);
    tree.add(foliage);

    tree.position.set(fx, fy, fz);
    forestGroup.add(tree);
  }

  // Mangrove Watchtower & Timber Boardwalk at (800, -800)
  const wtGroup = new THREE.Group();
  const wtx = 800;
  const wtz = -800;
  const wty = getElevationAt(wtx, wtz);
  wtGroup.position.set(wtx, wty, wtz);

  // Tower posts (height 18m)
  for (const dx of [-3, 3]) {
    for (const dz of [-3, 3]) {
      const tpost = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 18, 6), woodTieMat);
      tpost.position.set(dx, 9, dz);
      wtGroup.add(tpost);
    }
  }

  // Observation Cabin
  const obsCabin = new THREE.Mesh(new THREE.BoxGeometry(8, 3.5, 8), tinSilverMat);
  obsCabin.position.y = 18;
  wtGroup.add(obsCabin);

  // Boardwalk Trail
  for (let bz = -40; bz <= 40; bz += 4) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.2, 3.6), woodTieMat);
    plank.position.set(0, 0.8, bz);
    wtGroup.add(plank);
  }
  forestGroup.add(wtGroup);

  // Northern Rainforest Reserve (Around -600, -1500)
  for (let i = 0; i < 110; i++) {
    const rx = -600 + (Math.random() - 0.5) * 500;
    const rz = -1500 + (Math.random() - 0.5) * 500;
    const ry = getElevationAt(rx, rz);

    const rtree = new THREE.Group();
    const rtrunk = new THREE.Mesh(treeTrunkGeo, trunkMat);
    rtrunk.position.y = 3.75;
    rtree.add(rtrunk);

    const rfoliage = new THREE.Mesh(foliageConeGeo, rainforestFoliageMat);
    rfoliage.position.y = 10;
    const rs = 0.9 + Math.random() * 0.6;
    rfoliage.scale.set(rs, rs * 1.2, rs);
    rtree.add(rfoliage);

    rtree.position.set(rx, ry, rz);
    forestGroup.add(rtree);
  }
  group.add(forestGroup);

  // =========================================================================
  // 6. HILLS, MOUNTAIN SUMMIT OVERLOOK & TEA GARDEN HIGHLANDS
  // =========================================================================
  const hillsGroup = new THREE.Group();

  // Mountain Summit Overlook Platform at (-1600, -2200)
  const sumX = -1600;
  const sumZ = -2200;
  const sumY = getElevationAt(sumX, sumZ);
  const sumGroup = new THREE.Group();
  sumGroup.position.set(sumX, sumY, sumZ);

  // Rocky Outcrop Crags
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
  for (let r = 0; r < 8; r++) {
    const crag = new THREE.Mesh(new THREE.DodecahedronGeometry(12 + r * 2), rockMat);
    crag.position.set((Math.random() - 0.5) * 60, -2, (Math.random() - 0.5) * 60);
    crag.scale.set(1.5, 2.2, 1.2);
    sumGroup.add(crag);
  }

  // Wooden Panoramic Deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(28, 1.2, 28), woodTieMat);
  deck.position.y = 6;
  sumGroup.add(deck);

  // Safety Railings
  for (const side of [
    { pos: [0, 7.5, 14], rot: 0, w: 28 },
    { pos: [0, 7.5, -14], rot: 0, w: 28 },
    { pos: [14, 7.5, 0], rot: Math.PI / 2, w: 28 },
    { pos: [-14, 7.5, 0], rot: Math.PI / 2, w: 28 },
  ]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(side.w, 1.4, 0.3), steelMat);
    rail.position.set(side.pos[0], side.pos[1], side.pos[2]);
    rail.rotation.y = side.rot;
    sumGroup.add(rail);
  }

  // Summit Telecommunications Mast
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.8, 55, 6), steelMat);
  mast.position.set(0, 33.5, 0);
  sumGroup.add(mast);

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
  beacon.position.set(0, 61.5, 0);
  sumGroup.add(beacon);

  hillsGroup.add(sumGroup);

  // Highland Tea Estate & Terraced Bush Rows at (-1800, 400)
  const teaX = -1800;
  const teaZ = 400;
  const teaY = getElevationAt(teaX, teaZ);
  const teaGroup = new THREE.Group();
  teaGroup.position.set(teaX, teaY, teaZ);

  // Tea Bush Rows (Green hedge strips)
  const teaBushMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.75 });
  for (let tr = -120; tr <= 120; tr += 14) {
    const hedge = new THREE.Mesh(new THREE.BoxGeometry(160, 1.4, 4.5), teaBushMat);
    hedge.position.set(0, 0.7, tr);
    hedge.receiveShadow = true;
    teaGroup.add(hedge);
  }

  // Tea Processing Estate Factory Building
  const factory = new THREE.Mesh(new THREE.BoxGeometry(36, 12, 54), tinSilverMat);
  factory.position.set(-60, 6, 0);
  factory.castShadow = true;
  teaGroup.add(factory);

  hillsGroup.add(teaGroup);
  group.add(hillsGroup);

  // Update loop for animated trains, metro, and lighthouse beam
  const updateAnimation = (time: number, delta: number) => {
    // 1. Move Intercity Railway Train along Z (-3000 to +3000)
    const trainSpeed = 45; // m/s
    const trainCycleZ = ((time * trainSpeed) % 6000) - 3000;
    trainGroup.position.z = trainCycleZ;
    trainGroup.position.y = getElevationAt(railX, trainCycleZ) + 0.6;

    // 2. Move Metro MRT Train along elevated viaduct X (-500 to +950)
    const metroSpeed = 35; // m/s
    const metroCycleX = ((time * metroSpeed) % 1450) - 500;
    metroTrainGroup.position.x = metroCycleX;

    // 3. Rotate Lighthouse Light Beam
    lighthouseBeam.rotation.z += 1.8 * delta;
  };

  return {
    group,
    animatedTrain: trainGroup,
    animatedMetro: metroTrainGroup,
    lighthouseBeam,
    updateAnimation,
  };
}

function brickMatFromColor(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
}
