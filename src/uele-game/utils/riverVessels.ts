import * as THREE from 'three';

export interface RiverVesselInstance {
  group: THREE.Group;
  update: (delta: number, elapsed: number) => void;
}

interface MovingVessel {
  mesh: THREE.Group;
  speed: number;
  progress: number; // 0 to 1 along river length
  direction: 1 | -1; // 1 = West to East, -1 = East to West
  lateralOffset: number; // offset from river centerline
  pitchPhase: number;
  rollPhase: number;
  wakeMesh?: THREE.Mesh;
}

/**
 * Calculates river centerline Z coordinate and heading angle at any given X coordinate
 */
export function getRiverCenterAndTangent(x: number): { z: number; angle: number; normalX: number; normalZ: number } {
  const z = -700 - Math.sin(x * 0.0007) * 350 + (x * 0.05);
  const dx = 10;
  const nextX = x + dx;
  const nextZ = -700 - Math.sin(nextX * 0.0007) * 350 + (nextX * 0.05);
  const tangentX = dx;
  const tangentZ = nextZ - z;
  const angle = Math.atan2(tangentZ, tangentX);
  const len = Math.hypot(tangentX, tangentZ);
  const normalX = -tangentZ / len;
  const normalZ = tangentX / len;
  return { z, angle, normalX, normalZ };
}

/**
 * Creates a detailed, high-performance Cargo Container Freighter
 */
function createCargoFreighter(colorTheme: number): THREE.Group {
  const ship = new THREE.Group();
  ship.name = 'cargo_freighter';

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.7,
    metalness: 0.3,
  });
  const keelRedMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.8,
  });
  const deckMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.8,
  });
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
  });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    roughness: 0.1,
  });
  const funnelMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.6,
  });

  // 1. Lower Keel (Red)
  const keelGeo = new THREE.BoxGeometry(64, 2.5, 13);
  const keel = new THREE.Mesh(keelGeo, keelRedMat);
  keel.position.y = -1.0;
  ship.add(keel);

  // 2. Main Hull (Dark Navy/Slate)
  const hullGeo = new THREE.BoxGeometry(66, 3.8, 14);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 1.0;
  ship.add(hull);

  // Bow wedge (tapered front)
  const bowGeo = new THREE.ConeGeometry(7, 16, 4);
  bowGeo.rotateX(Math.PI / 2);
  bowGeo.rotateZ(Math.PI / 4);
  const bow = new THREE.Mesh(bowGeo, hullMat);
  bow.position.set(38, 0.8, 0);
  bow.scale.set(1.1, 0.6, 1.4);
  ship.add(bow);

  // 3. Deck Surface
  const deckGeo = new THREE.BoxGeometry(62, 0.5, 13);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = 3.0;
  ship.add(deck);

  // 4. Multi-colored Stacked Shipping Containers
  const containerColors = [0x2563eb, 0xd97706, 0x16a34a, 0xdc2626, 0x0891b2, 0x7c3aed];
  const containerGeo = new THREE.BoxGeometry(11, 4.2, 4.2);

  let colorIdx = 0;
  for (let row = -18; row <= 14; row += 12) {
    for (let bay = -3.8; bay <= 3.8; bay += 4.4) {
      const cMat = new THREE.MeshStandardMaterial({
        color: containerColors[colorIdx % containerColors.length],
        roughness: 0.6,
      });
      const cMesh = new THREE.Mesh(containerGeo, cMat);
      cMesh.position.set(row, 5.2, bay);
      cMesh.castShadow = true;
      ship.add(cMesh);

      // Stack tier 2
      if (Math.random() > 0.3) {
        const c2Mat = new THREE.MeshStandardMaterial({
          color: containerColors[(colorIdx + 2) % containerColors.length],
          roughness: 0.6,
        });
        const cMesh2 = new THREE.Mesh(containerGeo, c2Mat);
        cMesh2.position.set(row, 9.4, bay);
        cMesh2.castShadow = true;
        ship.add(cMesh2);
      }
      colorIdx++;
    }
  }

  // 5. Aft Bridge Superstructure & Navigation Cabin
  const bridgeBaseGeo = new THREE.BoxGeometry(14, 8, 12);
  const bridgeBase = new THREE.Mesh(bridgeBaseGeo, cabinMat);
  bridgeBase.position.set(-24, 7.2, 0);
  bridgeBase.castShadow = true;
  ship.add(bridgeBase);

  // Navigation Windows
  const winGeo = new THREE.BoxGeometry(14.2, 2.0, 11);
  const win = new THREE.Mesh(winGeo, windowMat);
  win.position.set(-24, 9.2, 0);
  ship.add(win);

  // Exhaust Funnel / Smokestack
  const funnelGeo = new THREE.CylinderGeometry(1.6, 1.8, 6, 12);
  const funnel = new THREE.Mesh(funnelGeo, funnelMat);
  funnel.position.set(-28, 13, 0);
  ship.add(funnel);

  // Navigation Mast & Radar Scanner
  const mastGeo = new THREE.CylinderGeometry(0.3, 0.4, 8, 8);
  const mast = new THREE.Mesh(mastGeo, cabinMat);
  mast.position.set(-21, 14, 0);
  ship.add(mast);

  const radarBarGeo = new THREE.BoxGeometry(3.5, 0.4, 0.6);
  const radarBar = new THREE.Mesh(radarBarGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
  radarBar.position.set(-21, 17.5, 0);
  ship.add(radarBar);

  // Stern & Bow Navigation Lights
  const redNavLight = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  redNavLight.position.set(32, 4, 6.8);
  const greenNavLight = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
  greenNavLight.position.set(32, 4, -6.8);
  ship.add(redNavLight, greenNavLight);

  return ship;
}

/**
 * Creates a modern Twin-Hull Passenger Catamaran Ferry
 */
function createPassengerCatamaran(): THREE.Group {
  const ferry = new THREE.Group();
  ferry.name = 'passenger_catamaran';

  const whiteHullMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1,
  });
  const cyanStripeMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.4,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.5,
    roughness: 0.1,
  });

  // Twin Hulls
  const hullGeo = new THREE.BoxGeometry(38, 2.6, 3.2);
  const leftHull = new THREE.Mesh(hullGeo, whiteHullMat);
  leftHull.position.set(0, 0.4, 5.0);
  const rightHull = new THREE.Mesh(hullGeo, whiteHullMat);
  rightHull.position.set(0, 0.4, -5.0);
  ferry.add(leftHull, rightHull);

  // Bow tapers
  const bowGeo = new THREE.ConeGeometry(2.4, 10, 4);
  bowGeo.rotateX(Math.PI / 2);
  const leftBow = new THREE.Mesh(bowGeo, cyanStripeMat);
  leftBow.position.set(22, 0.4, 5.0);
  const rightBow = new THREE.Mesh(bowGeo, cyanStripeMat);
  rightBow.position.set(22, 0.4, -5.0);
  ferry.add(leftBow, rightBow);

  // Main Passenger Deck Structure
  const cabinGeo = new THREE.BoxGeometry(28, 4.2, 13.5);
  const cabin = new THREE.Mesh(cabinGeo, whiteHullMat);
  cabin.position.set(0, 3.4, 0);
  ferry.add(cabin);

  // Tinted Panoramic Glass Ribbon
  const winGeo = new THREE.BoxGeometry(26, 1.8, 13.8);
  const win = new THREE.Mesh(winGeo, glassMat);
  win.position.set(1, 3.8, 0);
  ferry.add(win);

  // Upper Observation Deck & Canopy
  const upperDeckGeo = new THREE.BoxGeometry(18, 1.0, 10);
  const upperDeck = new THREE.Mesh(upperDeckGeo, cyanStripeMat);
  upperDeck.position.set(-2, 6.0, 0);
  ferry.add(upperDeck);

  return ferry;
}

/**
 * Creates a High-Speed Patrol / Motor Launch with Dynamic Foam Wake
 */
function createSpeedboat(): { mesh: THREE.Group; wake: THREE.Mesh } {
  const boat = new THREE.Group();
  boat.name = 'speedboat_patrol';

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.8,
  });
  const orangeTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    roughness: 0.4,
  });
  const windshieldMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
  });

  const hullGeo = new THREE.BoxGeometry(14, 1.8, 4.5);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 0.5;
  boat.add(hull);

  // Sharp bow
  const bowGeo = new THREE.ConeGeometry(2.4, 6, 4);
  bowGeo.rotateX(Math.PI / 2);
  const bow = new THREE.Mesh(bowGeo, orangeTrimMat);
  bow.position.set(9, 0.5, 0);
  boat.add(bow);

  // Windshield & Cockpit
  const cockpitGeo = new THREE.BoxGeometry(5, 1.4, 3.6);
  const cockpit = new THREE.Mesh(cockpitGeo, windshieldMat);
  cockpit.position.set(1, 1.8, 0);
  boat.add(cockpit);

  // Trailing V-Shape Water Wake Mesh
  const wakeGeo = new THREE.PlaneGeometry(24, 10, 8, 4);
  wakeGeo.rotateX(-Math.PI / 2);
  const wakeMat = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  const wake = new THREE.Mesh(wakeGeo, wakeMat);
  wake.position.set(-16, 0.05, 0);
  boat.add(wake);

  return { mesh: boat, wake };
}

/**
 * Creates traditional River Tugboat
 */
function createRiverTugboat(): THREE.Group {
  const tug = new THREE.Group();
  tug.name = 'river_tugboat';

  const hullMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });

  const hull = new THREE.Mesh(new THREE.BoxGeometry(22, 3.0, 7.5), hullMat);
  hull.position.y = 0.8;
  tug.add(hull);

  const bow = new THREE.Mesh(new THREE.ConeGeometry(3.8, 7, 4), trimMat);
  bow.rotateX(Math.PI / 2);
  bow.position.set(13, 0.8, 0);
  tug.add(bow);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 5.5), cabinMat);
  cabin.position.set(-1, 3.8, 0);
  tug.add(cabin);

  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 4, 10), trimMat);
  stack.position.set(-5, 6.2, 0);
  tug.add(stack);

  return tug;
}

/**
 * Builds the complete River Vessels, Shipping Traffic & Port Marina System
 */
export function buildRiverVesselsSystem(): RiverVesselInstance {
  const group = new THREE.Group();
  group.name = 'river_vessels_and_ports';

  const waterLevel = -2.2; // Calibrated water surface elevation

  // ==========================================
  // 1. DOCKED HARBOR PIERS & MARINAS
  // ==========================================
  const pierMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const woodDeckMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.8 });

  // 1a. Central Promenade Marina & Passenger Ferry Terminal (X: 120, Z: -540)
  const centralMarina = new THREE.Group();
  centralMarina.position.set(120, waterLevel, -550);

  const mainPier = new THREE.Mesh(new THREE.BoxGeometry(70, 1.2, 18), pierMat);
  mainPier.position.set(0, 0.6, 0);
  centralMarina.add(mainPier);

  // Floating finger pontoons
  for (let p = -24; p <= 24; p += 16) {
    const pontoon = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 35), woodDeckMat);
    pontoon.position.set(p, 0.4, -20);
    centralMarina.add(pontoon);

    // Mooring bollards & lamp post
    const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4, 8), pierMat);
    lampPost.position.set(p + 2.5, 2.0, -5);
    const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), lampMat);
    lampHead.position.set(p + 2.5, 4.0, -5);
    centralMarina.add(lampPost, lampHead);
  }

  // Moored yachts & launches at marina
  const mooredYacht1 = createSpeedboat().mesh;
  mooredYacht1.position.set(-18, 0, -22);
  mooredYacht1.rotation.y = Math.PI / 2;
  const mooredYacht2 = createSpeedboat().mesh;
  mooredYacht2.position.set(14, 0, -22);
  mooredYacht2.rotation.y = Math.PI / 2;
  centralMarina.add(mooredYacht1, mooredYacht2);
  group.add(centralMarina);

  // 1b. West Industrial River Cargo Quay (X: -3200, Z: -920)
  const westCargoPort = new THREE.Group();
  westCargoPort.position.set(-3200, waterLevel, -910);

  const cargoQuay = new THREE.Mesh(new THREE.BoxGeometry(180, 2.0, 30), pierMat);
  cargoQuay.position.set(0, 1.0, 0);
  westCargoPort.add(cargoQuay);

  // Quayside container crane gantry
  const gantryMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
  const gantry1 = new THREE.Mesh(new THREE.BoxGeometry(18, 35, 18), gantryMat);
  gantry1.position.set(-40, 18, 5);
  const gantry2 = new THREE.Mesh(new THREE.BoxGeometry(18, 35, 18), gantryMat);
  gantry2.position.set(40, 18, 5);
  westCargoPort.add(gantry1, gantry2);

  // Moored static cargo barge
  const dockedFreighter = createCargoFreighter(0x1e3a8a);
  dockedFreighter.position.set(0, 0, -24);
  westCargoPort.add(dockedFreighter);
  group.add(westCargoPort);

  // ==========================================
  // 2. NAVIGATIONAL CHANNEL BUOYS
  // ==========================================
  const buoyRedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
  const buoyGreenMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
  const buoyConeGeo = new THREE.ConeGeometry(1.8, 3.5, 8);
  const buoyLightGeo = new THREE.SphereGeometry(0.5, 8, 8);

  const buoyGroup = new THREE.Group();
  for (let bx = -4500; bx <= 4500; bx += 600) {
    const { z, normalX, normalZ } = getRiverCenterAndTangent(bx);

    // Port Buoy (Red, Left edge of navigation corridor)
    const redBuoy = new THREE.Group();
    const rCone = new THREE.Mesh(buoyConeGeo, buoyRedMat);
    const rLight = new THREE.Mesh(buoyLightGeo, new THREE.MeshBasicMaterial({ color: 0xff3333 }));
    rLight.position.y = 2.2;
    redBuoy.add(rCone, rLight);
    redBuoy.position.set(bx + normalX * 70, waterLevel + 0.8, z + normalZ * 70);
    buoyGroup.add(redBuoy);

    // Starboard Buoy (Green, Right edge)
    const greenBuoy = new THREE.Group();
    const gCone = new THREE.Mesh(buoyConeGeo, buoyGreenMat);
    const gLight = new THREE.Mesh(buoyLightGeo, new THREE.MeshBasicMaterial({ color: 0x33ff66 }));
    gLight.position.y = 2.2;
    greenBuoy.add(gCone, gLight);
    greenBuoy.position.set(bx - normalX * 70, waterLevel + 0.8, z - normalZ * 70);
    buoyGroup.add(greenBuoy);
  }
  group.add(buoyGroup);

  // ==========================================
  // 3. DYNAMIC CRUISING VESSELS
  // ==========================================
  const movingVessels: MovingVessel[] = [];

  // 3a. Vessel 1: Heavy Container Ship "AYT Voyager" (West -> East)
  const ship1Mesh = createCargoFreighter(0x2563eb);
  group.add(ship1Mesh);
  movingVessels.push({
    mesh: ship1Mesh,
    speed: 0.012, // Progress per second
    progress: 0.15,
    direction: 1,
    lateralOffset: 25, // Port side of channel
    pitchPhase: 0,
    rollPhase: 1.2,
  });

  // 3b. Vessel 2: Twin-Hull Passenger Catamaran "Karatoya Express" (East -> West)
  const ferryMesh = createPassengerCatamaran();
  group.add(ferryMesh);
  movingVessels.push({
    mesh: ferryMesh,
    speed: 0.024,
    progress: 0.75,
    direction: -1,
    lateralOffset: -25,
    pitchPhase: 2.1,
    rollPhase: 0.5,
  });

  // 3c. Vessel 3: Fast Patrol Speedboat (West -> East)
  const speedboatObj = createSpeedboat();
  group.add(speedboatObj.mesh);
  movingVessels.push({
    mesh: speedboatObj.mesh,
    speed: 0.045,
    progress: 0.45,
    direction: 1,
    lateralOffset: 35,
    pitchPhase: 1.0,
    rollPhase: 2.5,
    wakeMesh: speedboatObj.wake,
  });

  // 3d. Vessel 4: Heavy Harbor Tugboat (East -> West)
  const tugMesh = createRiverTugboat();
  group.add(tugMesh);
  movingVessels.push({
    mesh: tugMesh,
    speed: 0.016,
    progress: 0.88,
    direction: -1,
    lateralOffset: -20,
    pitchPhase: 3.4,
    rollPhase: 1.9,
  });

  // 3e. Vessel 5: Secondary Bulk Carrier "Bengal Titan" (West -> East)
  const ship2Mesh = createCargoFreighter(0xd97706);
  group.add(ship2Mesh);
  movingVessels.push({
    mesh: ship2Mesh,
    speed: 0.011,
    progress: 0.60,
    direction: 1,
    lateralOffset: 20,
    pitchPhase: 4.2,
    rollPhase: 0.8,
  });

  // Update Animation Function
  const update = (delta: number, elapsed: number) => {
    // 1. Animate buoys gentle bobbing
    buoyGroup.children.forEach((b, idx) => {
      b.position.y = waterLevel + 0.8 + Math.sin(elapsed * 2.2 + idx * 0.7) * 0.15;
      b.rotation.z = Math.sin(elapsed * 1.8 + idx) * 0.05;
    });

    // 2. Animate moving vessels
    movingVessels.forEach((v) => {
      // Advance along river progress
      v.progress += (v.speed * delta * v.direction);
      if (v.progress > 0.98) {
        v.progress = 0.98;
        v.direction = -1;
      } else if (v.progress < 0.02) {
        v.progress = 0.02;
        v.direction = 1;
      }

      // Map progress to world X coordinate (-4800 to +4800)
      const currentX = -4800 + v.progress * 9600;
      const { z: centerZ, angle, normalX, normalZ } = getRiverCenterAndTangent(currentX);

      // Offset position laterally for two-way shipping lane traffic
      const posX = currentX + normalX * v.lateralOffset;
      const posZ = centerZ + normalZ * v.lateralOffset;

      // Realistic hydrodynamic pitch, roll, and heave
      const heave = Math.sin(elapsed * 2.0 + v.pitchPhase) * 0.18;
      const pitch = Math.sin(elapsed * 1.6 + v.pitchPhase) * 0.025;
      const roll = Math.sin(elapsed * 2.4 + v.rollPhase) * 0.035;

      v.mesh.position.set(posX, waterLevel + 0.1 + heave, posZ);

      // Orient ship along river tangent + direction
      const baseRotation = v.direction === 1 ? angle : angle + Math.PI;
      v.mesh.rotation.set(pitch, -baseRotation, roll);

      // Pulse wake opacity if available
      if (v.wakeMesh) {
        (v.wakeMesh.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(elapsed * 8) * 0.15;
      }
    });
  };

  return {
    group,
    update,
  };
}
