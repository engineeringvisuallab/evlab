import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';

export interface CentralCityResult {
  group: THREE.Group;
  landmarks: { name: string; position: THREE.Vector3; icon: string }[];
  update: (time: number, delta: number) => void;
}

/**
 * Procedural facade texture generator for high-tech glass & illuminated city skyscrapers
 */
function createSkyscraperTexture(tint: 'blue' | 'cyan' | 'gold' | 'emerald' = 'cyan'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const baseColors = {
    blue: '#0f172a',
    cyan: '#0c2333',
    gold: '#211d13',
    emerald: '#0f291e',
  };
  const winColors = {
    blue: ['#38bdf8', '#0284c7', '#0369a1', '#1e293b'],
    cyan: ['#22d3ee', '#06b6d4', '#0891b2', '#164e63'],
    gold: ['#fcd34d', '#f59e0b', '#d97706', '#451a03'],
    emerald: ['#34d399', '#10b981', '#059669', '#064e3b'],
  };

  ctx.fillStyle = baseColors[tint];
  ctx.fillRect(0, 0, 512, 1024);

  const floors = 32;
  const windowsPerFloor = 16;
  const fw = 512 / windowsPerFloor;
  const fh = 1024 / floors;

  for (let f = 0; f < floors; f++) {
    for (let w = 0; w < windowsPerFloor; w++) {
      const palette = winColors[tint];
      const col = palette[Math.floor(Math.random() * palette.length)];
      ctx.fillStyle = col;
      ctx.fillRect(w * fw + 4, f * fh + 4, fw - 8, fh - 8);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Generates an illuminated 3D Signboard Texture for AYT Mart Shopping Mall
 */
function createAytMartSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Gloss dark blue-slate background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 1024, 256);

  // Border glow
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, 1004, 236);

  // Glowing shopping bag / cart emblem
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(120, 128, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#090d16';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🛍️', 120, 128);

  // Primary Title: AYT MART
  ctx.fillStyle = '#fbbf24';
  ctx.font = '900 92px "Arial Black", sans-serif';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 24;
  ctx.fillText('AYT MART', 200, 120);

  // Subtitle: LUXURY SHOPPING MALL
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('GRAND SHOPPING MALL & HYPERMARKET', 205, 185);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Generates an illuminated 3D Signboard Texture for AYT Books Library
 */
function createAytBooksSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep royal slate background
  ctx.fillStyle = '#05192d';
  ctx.fillRect(0, 0, 1024, 256);

  // Border glow
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, 1004, 236);

  // Book icon emblem
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(120, 128, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#05192d';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('📚', 120, 128);

  // Primary Title: AYT BOOKS
  ctx.fillStyle = '#e0f2fe';
  ctx.font = '900 86px "Arial Black", sans-serif';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 24;
  ctx.fillText('AYT BOOKS', 200, 120);

  // Subtitle: CENTRAL PUBLIC LIBRARY
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('CENTRAL PUBLIC LIBRARY & KNOWLEDGE HUB', 205, 185);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Procedural storefront windows texture
 */
function createMallStorefrontTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 256);

  // 4 Store displays
  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b'];
  const labels = ['FASHION', 'DIGITAL', 'COFFEE', 'JEWELRY'];

  for (let i = 0; i < 4; i++) {
    const x = i * 128 + 8;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, 16, 112, 224);

    ctx.fillStyle = colors[i];
    ctx.fillRect(x + 10, 30, 92, 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + 56, 56);

    // Display warm glow
    ctx.fillStyle = '#fef08a';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x + 10, 80, 92, 140);
    ctx.globalAlpha = 1.0;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Builds the UELE Central City Core with Starting Boulevard Road, AYT Mart, and AYT Books Library
 */
export function buildCentralCityCore(): CentralCityResult {
  const group = new THREE.Group();
  group.name = 'uele_central_city_core';

  const landmarks: { name: string; position: THREE.Vector3; icon: string }[] = [];

  const cyanFacadeTex = createSkyscraperTexture('cyan');
  const blueFacadeTex = createSkyscraperTexture('blue');
  const goldFacadeTex = createSkyscraperTexture('gold');
  const emeraldFacadeTex = createSkyscraperTexture('emerald');

  const aytMartSignTex = createAytMartSignTexture();
  const aytBooksSignTex = createAytBooksSignTexture();
  const mallStorefrontTex = createMallStorefrontTexture();

  // Common Materials
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
  const asphaltRoadMat = new THREE.MeshStandardMaterial({ color: 0x181c20, roughness: 0.9, metalness: 0.1 });
  const markingYellowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const markingWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const plazaPavingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
  const parkGrassMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
  const steelFrameMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.2 });
  const goldAccentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.25 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });
  const glassWarmMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.2, metalness: 0.6, transparent: true, opacity: 0.8 });

  // Sign Materials
  const aytMartSignMat = new THREE.MeshBasicMaterial({ map: aytMartSignTex });
  const aytBooksSignMat = new THREE.MeshBasicMaterial({ map: aytBooksSignTex });
  const storefrontMat = new THREE.MeshStandardMaterial({ map: mallStorefrontTex, roughness: 0.3 });

  // =========================================================================
  // 1. STARTING ROAD: AYT CENTRAL COMMERCIAL BOULEVARD (Z: -350 to +350, Width: 26m)
  // =========================================================================
  const startingBoulevardGroup = new THREE.Group();
  startingBoulevardGroup.name = 'starting_commercial_boulevard';

  const boulevardLength = 700; // Z from -350 to +350
  const roadWidth = 26; // 4 traffic lanes + turning lane
  const sidewalkWidth = 14;

  const roadGeo = new THREE.PlaneGeometry(roadWidth, boulevardLength, 2, 40);
  roadGeo.rotateX(-Math.PI / 2);
  const roadPos = roadGeo.attributes.position;
  for (let i = 0; i < roadPos.count; i++) {
    const rx = roadPos.getX(i);
    const rz = roadPos.getZ(i);
    const elev = calcMasterPlanElevation(rx, rz);
    roadPos.setY(i, elev + 0.18); // Clean ground surface elevation
  }
  roadGeo.computeVertexNormals();

  const startingRoadMesh = new THREE.Mesh(roadGeo, asphaltRoadMat);
  startingRoadMesh.receiveShadow = true;
  startingBoulevardGroup.add(startingRoadMesh);

  // Centerline (Double Yellow) & Lane Markers (White Dashed)
  const doubleYellowGeo = new THREE.PlaneGeometry(0.4, boulevardLength);
  doubleYellowGeo.rotateX(-Math.PI / 2);
  const yellowLine1 = new THREE.Mesh(doubleYellowGeo, markingYellowMat);
  yellowLine1.position.set(-0.35, 1.5 + 0.22, 0);
  const yellowLine2 = new THREE.Mesh(doubleYellowGeo, markingYellowMat);
  yellowLine2.position.set(0.35, 1.5 + 0.22, 0);
  startingBoulevardGroup.add(yellowLine1, yellowLine2);

  // White lane dashes
  const dashGeo = new THREE.PlaneGeometry(0.3, 4);
  dashGeo.rotateX(-Math.PI / 2);
  for (let z = -320; z <= 320; z += 12) {
    const dashLeft = new THREE.Mesh(dashGeo, markingWhiteMat);
    dashLeft.position.set(-6.5, 1.5 + 0.22, z);
    const dashRight = new THREE.Mesh(dashGeo, markingWhiteMat);
    dashRight.position.set(6.5, 1.5 + 0.22, z);
    startingBoulevardGroup.add(dashLeft, dashRight);
  }

  // Crosswalks (Zebra Crossings) near Mall Entrance (Z = 40) and Library (Z = -40)
  for (const crossZ of [40, -40, 150, -150]) {
    for (let k = -roadWidth / 2 + 2; k <= roadWidth / 2 - 2; k += 2.2) {
      const zebra = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 5), markingWhiteMat);
      zebra.rotateX(-Math.PI / 2);
      zebra.position.set(k, 1.5 + 0.23, crossZ);
      startingBoulevardGroup.add(zebra);
    }
  }

  // Paved Sidewalks on East & West sides
  const eastWalkGeo = new THREE.PlaneGeometry(sidewalkWidth, boulevardLength, 2, 40);
  eastWalkGeo.rotateX(-Math.PI / 2);
  const eastWalkPos = eastWalkGeo.attributes.position;
  for (let i = 0; i < eastWalkPos.count; i++) {
    const wx = roadWidth / 2 + sidewalkWidth / 2 + eastWalkPos.getX(i);
    const wz = eastWalkPos.getZ(i);
    eastWalkPos.setY(i, calcMasterPlanElevation(wx, wz) + 0.24);
  }
  eastWalkGeo.computeVertexNormals();
  const eastSidewalk = new THREE.Mesh(eastWalkGeo, sidewalkMat);
  eastSidewalk.position.x = roadWidth / 2 + sidewalkWidth / 2;
  eastSidewalk.receiveShadow = true;

  const westWalkGeo = new THREE.PlaneGeometry(sidewalkWidth, boulevardLength, 2, 40);
  westWalkGeo.rotateX(-Math.PI / 2);
  const westWalkPos = westWalkGeo.attributes.position;
  for (let i = 0; i < westWalkPos.count; i++) {
    const wx = -(roadWidth / 2 + sidewalkWidth / 2) + westWalkPos.getX(i);
    const wz = westWalkPos.getZ(i);
    westWalkPos.setY(i, calcMasterPlanElevation(wx, wz) + 0.24);
  }
  westWalkGeo.computeVertexNormals();
  const westSidewalk = new THREE.Mesh(westWalkGeo, sidewalkMat);
  westSidewalk.position.x = -(roadWidth / 2 + sidewalkWidth / 2);
  westSidewalk.receiveShadow = true;

  startingBoulevardGroup.add(eastSidewalk, westSidewalk);

  // Modern LED Streetlights & Avenue Palm Planters along the starting road
  const poleGeo = new THREE.CylinderGeometry(0.18, 0.25, 8.5, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
  const lampGeo = new THREE.BoxGeometry(1.6, 0.3, 0.6);
  const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });

  const planterGeo = new THREE.BoxGeometry(2.5, 0.8, 2.5);
  const planterMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 6, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const leavesGeo = new THREE.ConeGeometry(2.5, 4, 8);
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });

  for (let z = -300; z <= 300; z += 50) {
    // East side streetlights
    const ey = calcMasterPlanElevation(14, z);
    const poleE = new THREE.Mesh(poleGeo, poleMat);
    poleE.position.set(14, ey + 4.25, z);
    const lampE = new THREE.Mesh(lampGeo, lampGlowMat);
    lampE.position.set(13.2, ey + 8.5, z);
    startingBoulevardGroup.add(poleE, lampE);

    // West side streetlights
    const wy = calcMasterPlanElevation(-14, z);
    const poleW = new THREE.Mesh(poleGeo, poleMat);
    poleW.position.set(-14, wy + 4.25, z);
    const lampW = new THREE.Mesh(lampGeo, lampGlowMat);
    lampW.position.set(-13.2, wy + 8.5, z);
    startingBoulevardGroup.add(poleW, lampW);

    // Palm tree planters
    if (Math.abs(z) > 15) {
      const py = calcMasterPlanElevation(18, z);
      const planter = new THREE.Mesh(planterGeo, planterMat);
      planter.position.set(18, py + 0.4, z);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(18, py + 3.4, z);
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.set(18, py + 6.5, z);
      startingBoulevardGroup.add(planter, trunk, leaves);
    }
  }

  group.add(startingBoulevardGroup);

  // =========================================================================
  // 2. AYT MART SHOPPING MALL (BESIDE STARTING ROAD: X: 85, Z: 55)
  // =========================================================================
  const mallGroup = new THREE.Group();
  const mallX = 85;
  const mallZ = 55;
  const mallY = calcMasterPlanElevation(mallX, mallZ);
  mallGroup.position.set(mallX, mallY, mallZ);

  // 2a. Mall Foundation & Parking Plaza
  const mallPlazaGeo = new THREE.BoxGeometry(105, 0.6, 95);
  const mallPlaza = new THREE.Mesh(mallPlazaGeo, plazaPavingMat);
  mallPlaza.position.set(0, 0.3, 0);
  mallPlaza.receiveShadow = true;
  mallGroup.add(mallPlaza);

  // 2b. Main Mall Structure (4-story modern architecture)
  const mallMainGeo = new THREE.BoxGeometry(85, 28, 70);
  const mallMainMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.3,
    metalness: 0.7,
  });
  const mallMain = new THREE.Mesh(mallMainGeo, mallMainMat);
  mallMain.position.set(0, 14, 0);
  mallMain.castShadow = true;
  mallMain.receiveShadow = true;
  mallGroup.add(mallMain);

  // 2c. Storefront Display Glass Base
  const mallStoreGeo = new THREE.BoxGeometry(75, 8, 4);
  const mallStore = new THREE.Mesh(mallStoreGeo, storefrontMat);
  mallStore.position.set(0, 4, -36);
  mallGroup.add(mallStore);

  // 2d. Glass Skylight Atrium Dome on Roof
  const atriumGeo = new THREE.CylinderGeometry(18, 22, 6, 24, 1, false, 0, Math.PI);
  atriumGeo.rotateZ(Math.PI / 2);
  const atriumMesh = new THREE.Mesh(atriumGeo, glassMat);
  atriumMesh.position.set(0, 30, 0);
  mallGroup.add(atriumMesh);

  // 2e. Grand Entrance Portico & Drop-Off Canopy
  const canopyGeo = new THREE.BoxGeometry(32, 1.5, 14);
  const canopyMesh = new THREE.Mesh(canopyGeo, goldAccentMat);
  canopyMesh.position.set(-28, 7, -38);
  const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, 7, 12);
  const pillar1 = new THREE.Mesh(pillarGeo, steelFrameMat);
  pillar1.position.set(-40, 3.5, -44);
  const pillar2 = new THREE.Mesh(pillarGeo, steelFrameMat);
  pillar2.position.set(-16, 3.5, -44);
  mallGroup.add(canopyMesh, pillar1, pillar2);

  // 2f. Iconic 3D Illuminated Marquee Billboard: "AYT MART"
  const signBoardGeo = new THREE.BoxGeometry(42, 10.5, 1.5);
  const signBoard = new THREE.Mesh(signBoardGeo, aytMartSignMat);
  signBoard.position.set(0, 24, -36.5);
  mallGroup.add(signBoard);

  // Glowing Marquee Outline
  const marqueeGlowGeo = new THREE.BoxGeometry(43, 11.5, 0.8);
  const marqueeGlow = new THREE.Mesh(marqueeGlowGeo, goldAccentMat);
  marqueeGlow.position.set(0, 24, -37);
  mallGroup.add(marqueeGlow);

  // 2g. Front Parking Lot with Painted Stalls & EV Chargers
  const parkingGeo = new THREE.PlaneGeometry(60, 22);
  parkingGeo.rotateX(-Math.PI / 2);
  const parkingMesh = new THREE.Mesh(parkingGeo, asphaltRoadMat);
  parkingMesh.position.set(0, 0.62, -40);
  mallGroup.add(parkingMesh);

  // EV Charging Posts with glowing green LEDs
  const evPostGeo = new THREE.BoxGeometry(0.8, 2.2, 0.8);
  const evPostMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  const evGlowMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  for (let i = -20; i <= 20; i += 10) {
    const post = new THREE.Mesh(evPostGeo, evPostMat);
    post.position.set(i, 1.4, -48);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), evGlowMat);
    glow.position.set(i, 2.3, -48);
    mallGroup.add(post, glow);
  }

  group.add(mallGroup);
  landmarks.push({
    name: 'AYT Mart Shopping Mall',
    position: new THREE.Vector3(mallX, mallY, mallZ),
    icon: '🛍️',
  });

  // =========================================================================
  // 3. AYT BOOKS LIBRARY (BESIDE AYT MART: X: 85, Z: -55)
  // =========================================================================
  const libGroup = new THREE.Group();
  const libX = 85;
  const libZ = -55;
  const libY = calcMasterPlanElevation(libX, libZ);
  libGroup.position.set(libX, libY, libZ);

  // 3a. Library Landscaped Reading Base Plaza
  const libPlazaGeo = new THREE.BoxGeometry(105, 0.6, 95);
  const libPlaza = new THREE.Mesh(libPlazaGeo, plazaPavingMat);
  libPlaza.position.set(0, 0.3, 0);
  libPlaza.receiveShadow = true;
  libGroup.add(libPlaza);

  // 3b. Library Main Architecture (Book-spine louvers & warm glass)
  const libMainGeo = new THREE.BoxGeometry(80, 24, 65);
  const libMainMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.6,
  });
  const libMain = new THREE.Mesh(libMainGeo, libMainMat);
  libMain.position.set(0, 12, 0);
  libMain.castShadow = true;
  libMain.receiveShadow = true;
  libGroup.add(libMain);

  // 3c. Double-Height Glass Reading Atrium
  const readingGlassGeo = new THREE.BoxGeometry(45, 16, 8);
  const readingGlass = new THREE.Mesh(readingGlassGeo, glassWarmMat);
  readingGlass.position.set(0, 10, 33);
  libGroup.add(readingGlass);

  // 3d. Architectural Vertical Louvers (Resembling giant library books)
  const louverGeo = new THREE.BoxGeometry(1.2, 20, 3);
  const louverColors = [0x0284c7, 0x0ea5e9, 0x38bdf8, 0x059669, 0xf59e0b];
  for (let l = -35; l <= 35; l += 4) {
    if (Math.abs(l) < 16) continue; // Leave central reading atrium clear
    const lMat = new THREE.MeshStandardMaterial({
      color: louverColors[Math.abs(l) % louverColors.length],
      metalness: 0.8,
      roughness: 0.2,
    });
    const louver = new THREE.Mesh(louverGeo, lMat);
    louver.position.set(l, 12, 33);
    libGroup.add(louver);
  }

  // 3e. Iconic 3D Illuminated Marquee Billboard: "AYT BOOKS LIBRARY"
  const libSignGeo = new THREE.BoxGeometry(42, 10.5, 1.5);
  const libSign = new THREE.Mesh(libSignGeo, aytBooksSignMat);
  libSign.position.set(0, 22, 33.5);
  libGroup.add(libSign);

  // 3f. Outdoor Reading Courtyard Pergola & Benches
  const pergolaRoofGeo = new THREE.BoxGeometry(28, 0.6, 16);
  const pergolaRoofMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const pergolaRoof = new THREE.Mesh(pergolaRoofGeo, pergolaRoofMat);
  pergolaRoof.position.set(0, 5, 42);
  libGroup.add(pergolaRoof);

  // Pergola posts
  for (const px of [-12, 12]) {
    for (const pz of [35, 48]) {
      const pPost = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5, 8), pergolaRoofMat);
      pPost.position.set(px, 2.5, pz);
      libGroup.add(pPost);
    }
  }

  // Reading Garden Benches
  const benchGeo = new THREE.BoxGeometry(4, 0.6, 1.5);
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
  for (const bx of [-8, 8]) {
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(bx, 0.6, 42);
    libGroup.add(bench);
  }

  group.add(libGroup);
  landmarks.push({
    name: 'AYT Books Public Library',
    position: new THREE.Vector3(libX, libY, libZ),
    icon: '📚',
  });

  // =========================================================================
  // 4. OPPOSITE SIDE (WEST SIDE): AYT CIVIC PARK & TWIN TOWERS (X: -120)
  // =========================================================================
  const westCivicGroup = new THREE.Group();
  const westCivicX = -120;
  const westCivicZ = 0;
  const westCivicY = calcMasterPlanElevation(westCivicX, westCivicZ);
  westCivicGroup.position.set(westCivicX, westCivicY, westCivicZ);

  // Civic Park & Reflection Pool
  const parkGeo = new THREE.BoxGeometry(110, 0.6, 180);
  const parkMesh = new THREE.Mesh(parkGeo, parkGrassMat);
  parkMesh.position.set(0, 0.3, 0);
  westCivicGroup.add(parkMesh);

  // Reflection Pool
  const poolGeo = new THREE.BoxGeometry(40, 0.4, 70);
  const poolMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9 });
  const pool = new THREE.Mesh(poolGeo, poolMat);
  pool.position.set(0, 0.6, 0);
  westCivicGroup.add(pool);

  // Fountain Jet
  const fountainGeo = new THREE.CylinderGeometry(0.2, 0.6, 6, 8);
  const fountainMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd });
  const fountain = new THREE.Mesh(fountainGeo, fountainMat);
  fountain.position.set(0, 3.5, 0);
  westCivicGroup.add(fountain);

  // Iconic AYT Twin Spire Towers (Set back at X: -120, Z: -55 and Z: +55)
  const towerGeo = new THREE.BoxGeometry(38, 160, 38);
  const towerMat1 = new THREE.MeshStandardMaterial({
    map: cyanFacadeTex,
    roughness: 0.2,
    metalness: 0.8,
  });
  const towerMat2 = new THREE.MeshStandardMaterial({
    map: blueFacadeTex,
    roughness: 0.2,
    metalness: 0.8,
  });

  const towerNorth = new THREE.Mesh(towerGeo, towerMat1);
  towerNorth.position.set(-20, 80, -60);
  towerNorth.castShadow = true;

  const towerSouth = new THREE.Mesh(towerGeo, towerMat2);
  towerSouth.position.set(-20, 80, 60);
  towerSouth.castShadow = true;

  // Skybridge connecting twin towers at 110m height
  const skybridgeGeo = new THREE.BoxGeometry(22, 12, 120);
  const skybridge = new THREE.Mesh(skybridgeGeo, steelFrameMat);
  skybridge.position.set(-20, 115, 0);
  westCivicGroup.add(towerNorth, towerSouth, skybridge);

  // Beacons on Twin Towers
  const beaconPinnacleGeo = new THREE.CylinderGeometry(0.5, 3, 30, 16);
  const beacon1 = new THREE.Mesh(beaconPinnacleGeo, goldAccentMat);
  beacon1.position.set(-20, 175, -60);
  const beacon2 = new THREE.Mesh(beaconPinnacleGeo, goldAccentMat);
  beacon2.position.set(-20, 175, 60);
  westCivicGroup.add(beacon1, beacon2);

  group.add(westCivicGroup);
  landmarks.push({
    name: 'AYT Civic Center & Twin Towers',
    position: new THREE.Vector3(westCivicX, westCivicY, westCivicZ),
    icon: '🏛️',
  });

  // =========================================================================
  // 5. CENTRAL RAILWAY & METRO TERMINAL COMPLEX (X = 1400m, Z = 0)
  // =========================================================================
  const stationGroup = new THREE.Group();
  const stY = calcMasterPlanElevation(1400, 0);
  stationGroup.position.set(1400, stY, 0);

  // Grand Canopy Arched Roof (180m x 90m)
  const canopyStationGeo = new THREE.CylinderGeometry(60, 60, 220, 32, 1, false, 0, Math.PI);
  canopyStationGeo.rotateZ(Math.PI / 2);
  canopyStationGeo.rotateY(Math.PI / 2);
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.7,
    roughness: 0.3,
  });
  const stationCanopy = new THREE.Mesh(canopyStationGeo, canopyMat);
  stationCanopy.position.set(0, 22, 0);
  stationGroup.add(stationCanopy);

  // Station Platform Base
  const platformGeo = new THREE.BoxGeometry(260, 6, 95);
  const platform = new THREE.Mesh(platformGeo, concreteMat);
  platform.position.set(0, 3, 0);
  stationGroup.add(platform);

  // Glass Passenger Terminal Concourse
  const concourseGeo = new THREE.BoxGeometry(110, 42, 65);
  const concourseMat = new THREE.MeshStandardMaterial({
    map: cyanFacadeTex,
    roughness: 0.2,
    metalness: 0.8,
  });
  const concourse = new THREE.Mesh(concourseGeo, concourseMat);
  concourse.position.set(0, 24, 75);
  stationGroup.add(concourse);

  group.add(stationGroup);
  landmarks.push({
    name: 'Central Railway & Metro Station',
    position: new THREE.Vector3(1400, stY, 0),
    icon: '🚉',
  });

  // =========================================================================
  // 6. SKYSCRAPER SKYLINE CLUSTERS (Distributed in R = 2.0 km Ring)
  // =========================================================================
  const towerConfigs = [
    { radius: 650, count: 12, hMin: 80, hMax: 140, wMin: 35, wMax: 55 },
    { radius: 1100, count: 20, hMin: 60, hMax: 120, wMin: 30, wMax: 50 },
    { radius: 1550, count: 24, hMin: 45, hMax: 95, wMin: 28, wMax: 45 },
  ];

  towerConfigs.forEach((tier, tierIdx) => {
    for (let i = 0; i < tier.count; i++) {
      const angle = (i / tier.count) * Math.PI * 2 + (tierIdx * 0.4);
      const dist = tier.radius + (Math.sin(i * 3) * 80);
      const tx = Math.cos(angle) * dist;
      const tz = Math.sin(angle) * dist;

      // Avoid placing buildings right on top of primary highway (X=0), starting boulevard, and railway (Z=0)
      if (Math.abs(tx) < 180 && Math.abs(tz) < 220) continue;
      if (Math.abs(tx) < 80 || Math.abs(tz) < 60) continue;
      // Avoid river channel
      const riverZ = -700 - Math.sin(tx * 0.0007) * 350 + (tx * 0.05);
      if (Math.abs(tz - riverZ) < 220) continue;

      const groundY = calcMasterPlanElevation(tx, tz);
      const height = tier.hMin + Math.random() * (tier.hMax - tier.hMin);
      const width = tier.wMin + Math.random() * (tier.wMax - tier.wMin);
      const depth = width * (0.8 + Math.random() * 0.4);

      const bldgGeo = new THREE.BoxGeometry(width, height, depth);
      const matChoice = [cyanFacadeTex, blueFacadeTex, goldFacadeTex, emeraldFacadeTex][(i + tierIdx) % 4];
      const bldgMat = new THREE.MeshStandardMaterial({
        map: matChoice,
        roughness: 0.25,
        metalness: 0.75,
      });

      const bldgMesh = new THREE.Mesh(bldgGeo, bldgMat);
      bldgMesh.position.set(tx, groundY + height / 2 + 0.1, tz);
      bldgMesh.rotation.y = angle + Math.PI / 4;
      bldgMesh.castShadow = true;
      bldgMesh.receiveShadow = true;
      group.add(bldgMesh);

      // Rooftop crowns for tallest towers
      if (height > 100) {
        const crownGeo = new THREE.CylinderGeometry(width * 0.35, width * 0.45, 8, 16);
        const crownMesh = new THREE.Mesh(crownGeo, steelFrameMat);
        crownMesh.position.set(tx, groundY + height + 4, tz);
        group.add(crownMesh);
      }
    }
  });

  const update = (_time: number, _delta: number) => {
    // Dynamic lighting animation if needed
  };

  return {
    group,
    landmarks,
    update,
  };
}
