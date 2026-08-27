import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';

export interface SouthernSectorsResult {
  group: THREE.Group;
  landmarks: { name: string; position: THREE.Vector3; icon: string }[];
  update: (time: number, delta: number) => void;
}

/**
 * Creates an illuminated 3D Signboard Texture for AYT International Airport Terminal
 */
function createAirportSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Gloss dark blue-black aviation theme
  ctx.fillStyle = '#061325';
  ctx.fillRect(0, 0, 1024, 256);

  // Outer gold stroke
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, 1000, 232);

  // Aviation wings & airplane emblem
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(125, 128, 52, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#061325';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✈️', 125, 128);

  // Main Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 78px "Arial Black", sans-serif';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 20;
  ctx.fillText('AYT INTERNATIONAL AIRPORT', 210, 115);

  // Subtitle
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText('TERMINAL 1 • DOMESTIC & INTERNATIONAL CONCOURSE', 215, 180);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Creates a high-security Restricted Zone warning sign texture
 */
function createRestrictedSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Bright warning yellow background
  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, 512, 256);

  // Red inner border
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 492, 236);

  // Red Header Block
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(20, 20, 472, 65);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RESTRICTED AREA', 256, 52);

  // Warning text
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('AUTHORIZED PERSONNEL ONLY', 256, 125);
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('24/7 ARMED SECURITY & RADAR SURVEILLANCE', 256, 165);
  ctx.fillStyle = '#dc2626';
  ctx.fillText('TRESPASSERS WILL BE PROSECUTED', 256, 205);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Builds a perimeter boundary wall with security watchtowers, razor mesh, and checkpoints
 */
function buildRestrictedPerimeterWall(
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  wallName: string,
  includeGateZ?: number
): THREE.Group {
  const wallGroup = new THREE.Group();
  wallGroup.name = `restricted_wall_${wallName}`;

  const wallHeight = 3.8;
  const wallThickness = 0.8;
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
  const fenceMeshMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3, wireframe: true });
  const redBeaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const amberBeaconMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const signMat = new THREE.MeshBasicMaterial({ map: createRestrictedSignTexture() });

  // 4 Sides: North (Z=minZ), South (Z=maxZ), West (X=minX), East (X=maxX)
  const segments = [
    { start: [minX, minZ], end: [maxX, minZ], isX: true, isNorth: true },
    { start: [minX, maxZ], end: [maxX, maxZ], isX: true, isNorth: false },
    { start: [minX, minZ], end: [minX, maxZ], isX: false, isWest: true },
    { start: [maxX, minZ], end: [maxX, maxZ], isX: false, isWest: false },
  ];

  segments.forEach((seg) => {
    const length = seg.isX ? Math.abs(seg.end[0] - seg.start[0]) : Math.abs(seg.end[1] - seg.start[1]);
    const step = 80;
    const count = Math.ceil(length / step);

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const x = seg.isX ? seg.start[0] + (seg.end[0] - seg.start[0]) * t + step / 2 : seg.start[0];
      const z = !seg.isX ? seg.start[1] + (seg.end[1] - seg.start[1]) * t + step / 2 : seg.start[1];

      // Leave open if gate position
      if (includeGateZ !== undefined && Math.abs(z - includeGateZ) < 25 && seg.isX === false && x === maxX) {
        continue; // Skip wall for security gate
      }

      const y = calcMasterPlanElevation(x, z);

      // Concrete Wall Segment (with slight foundation skirt into ground)
      const segGeo = new THREE.BoxGeometry(seg.isX ? step : wallThickness, wallHeight + 1.0, seg.isX ? wallThickness : step);
      const wallSeg = new THREE.Mesh(segGeo, concreteMat);
      wallSeg.position.set(x, y + wallHeight / 2 - 0.5, z);
      wallSeg.castShadow = true;
      wallSeg.receiveShadow = true;
      wallGroup.add(wallSeg);

      // Top Security Razor Mesh
      const meshGeo = new THREE.BoxGeometry(seg.isX ? step : 0.2, 0.8, seg.isX ? 0.2 : step);
      const meshTop = new THREE.Mesh(meshGeo, fenceMeshMat);
      meshTop.position.set(x, y + wallHeight + 0.4, z);
      wallGroup.add(meshTop);

      // Security Warning Lights every 160m
      if (i % 2 === 0) {
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), (i % 4 === 0) ? redBeaconMat : amberBeaconMat);
        beacon.position.set(x, y + wallHeight + 0.9, z);
        wallGroup.add(beacon);
      }

      // Warning Signs along outer walls
      if (i % 4 === 1) {
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1.8), signMat);
        if (seg.isX) {
          sign.position.set(x, y + 2.2, seg.isNorth ? z - 0.45 : z + 0.45);
          if (seg.isNorth) sign.rotation.y = Math.PI;
        } else {
          sign.position.set(seg.isWest ? x - 0.45 : x + 0.45, y + 2.2, z);
          sign.rotation.y = seg.isWest ? -Math.PI / 2 : Math.PI / 2;
        }
        wallGroup.add(sign);
      }
    }
  });

  // Corner Watchtowers (4 corners)
  const towerGeo = new THREE.CylinderGeometry(2.5, 3.2, 14, 12);
  const cabGeo = new THREE.CylinderGeometry(4.2, 3.6, 4, 12);
  const cabMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });

  const corners = [
    [minX, minZ], [maxX, minZ],
    [minX, maxZ], [maxX, maxZ],
  ];

  corners.forEach(([cx, cz]) => {
    const cy = calcMasterPlanElevation(cx, cz);
    const tower = new THREE.Mesh(towerGeo, concreteMat);
    tower.position.set(cx, cy + 7, cz);
    tower.castShadow = true;

    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(cx, cy + 15, cz);

    const searchlight = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    searchlight.position.set(cx, cy + 18, cz);

    wallGroup.add(tower, cab, searchlight);
  });

  return wallGroup;
}

/**
 * Builds the Western & Southern Sectors with Redesigned AYT International Airport & Restricted Security Walls
 */
export function buildSouthernSectors(): SouthernSectorsResult {
  const group = new THREE.Group();
  group.name = 'southern_sectors_group';

  const landmarks: { name: string; position: THREE.Vector3; icon: string }[] = [];
  const rotatingRadarBeacons: THREE.Mesh[] = [];

  // Common Materials
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  const industrialMetalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.3 });
  const yellowHazardMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });
  const asphaltRunwayMat = new THREE.MeshStandardMaterial({ color: 0x14181c, roughness: 0.85, metalness: 0.15 });
  const apronMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const glassTerminalMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });
  const goldAirportSignMat = new THREE.MeshBasicMaterial({ map: createAirportSignTexture() });
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const yellowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const greenLightMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const redLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const blueLightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const aircraftBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.6 });
  const aircraftWingMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.7 });
  const engineMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.85 });
  const airlineTailMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.7 });
  const stadiumGrassMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.9 });
  const stadiumRoofMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.5 });

  // =========================================================================
  // 1. MID-WEST HEAVY INDUSTRIAL ZONE (X: -4750 to -2600, Z: -900 to +900)
  // =========================================================================
  const industrialGroup = new THREE.Group();
  industrialGroup.name = 'heavy_industrial_zone';

  // Perimeter Security Wall around Industrial Zone
  const indWall = buildRestrictedPerimeterWall(-4750, -2600, -900, 900, 'heavy_industry', 0);
  industrialGroup.add(indWall);

  // Factories & Warehouses
  const factoryGeo = new THREE.BoxGeometry(110, 22, 60);
  const factoryPositions = [
    [-4200, -500], [-3900, -500], [-3600, -500],
    [-4200, 300], [-3900, 300], [-3600, 300],
    [-3100, -400], [-3100, 200],
  ];

  factoryPositions.forEach(([fx, fz]) => {
    const fy = calcMasterPlanElevation(fx, fz);
    const factory = new THREE.Mesh(factoryGeo, concreteMat);
    factory.position.set(fx, fy + 11, fz);
    factory.castShadow = true;
    industrialGroup.add(factory);
  });

  // Storage Tanks
  const tankGeo = new THREE.CylinderGeometry(20, 20, 28, 24);
  const tankCapGeo = new THREE.SphereGeometry(20, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const tankCoords = [
    [-4550, -200], [-4450, -200], [-4550, -100], [-4450, -100],
    [-4550, 500], [-4450, 500], [-4550, 600], [-4450, 600],
  ];

  tankCoords.forEach(([tx, tz]) => {
    const ty = calcMasterPlanElevation(tx, tz);
    const tank = new THREE.Mesh(tankGeo, industrialMetalMat);
    tank.position.set(tx, ty + 14, tz);
    const cap = new THREE.Mesh(tankCapGeo, industrialMetalMat);
    cap.position.set(tx, ty + 28, tz);
    industrialGroup.add(tank, cap);
  });

  // Gantry Crane
  const gantryGeo = new THREE.BoxGeometry(90, 38, 20);
  const gantry1 = new THREE.Mesh(gantryGeo, yellowHazardMat);
  gantry1.position.set(-3400, calcMasterPlanElevation(-3400, 0) + 19, 0);
  industrialGroup.add(gantry1);

  group.add(industrialGroup);
  landmarks.push({
    name: 'Heavy Industrial & Logistics Hub',
    position: new THREE.Vector3(-3800, calcMasterPlanElevation(-3800, 0), 0),
    icon: '🏭',
  });

  // =========================================================================
  // 2. REDESIGNED AYT INTERNATIONAL AIRPORT & AEROSPACE COMPLEX
  //    (X: -4850 to -1450, Z: 1450 to 3150)
  // =========================================================================
  const airportGroup = new THREE.Group();
  airportGroup.name = 'ayt_international_airport_zone';

  const airportY = 1.2; // Smooth graded elevation across entire airfield

  // 2a. Airport Security Boundary Perimeter Wall
  const airportWall = buildRestrictedPerimeterWall(-4850, -1450, 1450, 3150, 'ayt_airport', 2120);
  airportGroup.add(airportWall);

  // 2b. Airport Apron & Tarmac Ground Base (Smooth asphalt base)
  const apronGeo = new THREE.PlaneGeometry(3300, 1500);
  apronGeo.rotateX(-Math.PI / 2);
  const apronMesh = new THREE.Mesh(apronGeo, apronMat);
  apronMesh.position.set(-3150, airportY + 0.05, 2300);
  apronMesh.receiveShadow = true;
  airportGroup.add(apronMesh);

  // 2c. Primary Runway 09L / 27R (3400m Length x 75m Width)
  const runwayGeo = new THREE.PlaneGeometry(3300, 75);
  runwayGeo.rotateX(-Math.PI / 2);
  const runway = new THREE.Mesh(runwayGeo, asphaltRunwayMat);
  runway.position.set(-3150, airportY + 0.15, 2550);
  runway.receiveShadow = true;
  airportGroup.add(runway);

  // Runway Centerline Dashes (Length 40m, Spacing 60m)
  const rwyStripeGeo = new THREE.PlaneGeometry(30, 2.5);
  rwyStripeGeo.rotateX(-Math.PI / 2);
  for (let rx = -4600; rx <= -1700; rx += 60) {
    const stripe = new THREE.Mesh(rwyStripeGeo, whiteMat);
    stripe.position.set(rx, airportY + 0.22, 2550);
    airportGroup.add(stripe);
  }

  // Runway Threshold Piano Keys (16 stripes each on West & East ends)
  for (let k = -28; k <= 28; k += 4) {
    const keyWest = new THREE.Mesh(new THREE.PlaneGeometry(35, 2.2), whiteMat);
    keyWest.rotateX(-Math.PI / 2);
    keyWest.position.set(-4720, airportY + 0.24, 2550 + k);

    const keyEast = new THREE.Mesh(new THREE.PlaneGeometry(35, 2.2), whiteMat);
    keyEast.rotateX(-Math.PI / 2);
    keyEast.position.set(-1580, airportY + 0.24, 2550 + k);
    airportGroup.add(keyWest, keyEast);
  }

  // Runway Touchdown Zone (TDZ) Markings
  for (const offset of [120, 240, 360]) {
    for (const side of [-16, 16]) {
      const tdzWest = new THREE.Mesh(new THREE.PlaneGeometry(25, 4), whiteMat);
      tdzWest.rotateX(-Math.PI / 2);
      tdzWest.position.set(-4720 + offset, airportY + 0.23, 2550 + side);

      const tdzEast = new THREE.Mesh(new THREE.PlaneGeometry(25, 4), whiteMat);
      tdzEast.rotateX(-Math.PI / 2);
      tdzEast.position.set(-1580 - offset, airportY + 0.23, 2550 + side);
      airportGroup.add(tdzWest, tdzEast);
    }
  }

  // Runway LED Edge Lights (White along runway, Green at threshold, Red at ends)
  for (let lx = -4750; lx <= -1550; lx += 50) {
    // North edge
    const lightN = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), whiteMat);
    lightN.position.set(lx, airportY + 0.6, 2550 + 38.5);
    // South edge
    const lightS = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), whiteMat);
    lightS.position.set(lx, airportY + 0.6, 2550 - 38.5);
    airportGroup.add(lightN, lightS);
  }

  // Green Threshold Light Bars & Red End Bars
  for (let tz = -37; tz <= 37; tz += 3.5) {
    const threshWest = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), greenLightMat);
    threshWest.position.set(-4755, airportY + 0.65, 2550 + tz);
    const endWest = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), redLightMat);
    endWest.position.set(-4760, airportY + 0.65, 2550 + tz);

    const threshEast = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), greenLightMat);
    threshEast.position.set(-1545, airportY + 0.65, 2550 + tz);
    const endEast = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), redLightMat);
    endEast.position.set(-1540, airportY + 0.65, 2550 + tz);

    airportGroup.add(threshWest, endWest, threshEast, endEast);
  }

  // 2d. Parallel High-Speed Taxiway (Width 40m, Z: 2360)
  const taxiwayGeo = new THREE.PlaneGeometry(3300, 40);
  taxiwayGeo.rotateX(-Math.PI / 2);
  const taxiway = new THREE.Mesh(taxiwayGeo, asphaltRunwayMat);
  taxiway.position.set(-3150, airportY + 0.12, 2360);
  taxiway.receiveShadow = true;
  airportGroup.add(taxiway);

  // Taxiway Centerline (Yellow Line)
  const taxiLineGeo = new THREE.PlaneGeometry(3300, 1.2);
  taxiLineGeo.rotateX(-Math.PI / 2);
  const taxiLine = new THREE.Mesh(taxiLineGeo, yellowMat);
  taxiLine.position.set(-3150, airportY + 0.18, 2360);
  airportGroup.add(taxiLine);

  // Connecting High-Speed Taxiway Turnoffs (Angled)
  for (const turnX of [-4200, -3200, -2200]) {
    const turnGeo = new THREE.PlaneGeometry(40, 190);
    turnGeo.rotateX(-Math.PI / 2);
    const turnMesh = new THREE.Mesh(turnGeo, asphaltRunwayMat);
    turnMesh.position.set(turnX, airportY + 0.13, 2455);
    airportGroup.add(turnMesh);

    // Turnoff yellow line
    const turnLine = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 190), yellowMat);
    turnLine.rotateX(-Math.PI / 2);
    turnLine.position.set(turnX, airportY + 0.19, 2455);
    airportGroup.add(turnLine);
  }

  // Blue Taxiway Edge Lights
  for (let bx = -4750; bx <= -1550; bx += 60) {
    const blueN = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), blueLightMat);
    blueN.position.set(bx, airportY + 0.55, 2360 + 21);
    const blueS = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), blueLightMat);
    blueS.position.set(bx, airportY + 0.55, 2360 - 21);
    airportGroup.add(blueN, blueS);
  }

  // 2e. Grand Passenger Terminal Building (Length: 360m x Depth: 120m x Height: 35m)
  const terminalGroup = new THREE.Group();
  terminalGroup.position.set(-3200, airportY, 2050);

  // Main Terminal Core
  const termBodyGeo = new THREE.BoxGeometry(320, 32, 100);
  const termBody = new THREE.Mesh(termBodyGeo, glassTerminalMat);
  termBody.position.set(0, 16, 0);
  termBody.castShadow = true;
  terminalGroup.add(termBody);

  // Aerodynamic Wing Curved Roof
  const roofGeo = new THREE.CylinderGeometry(60, 60, 340, 32, 1, false, 0, Math.PI);
  roofGeo.rotateZ(Math.PI / 2);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.8, roughness: 0.25 });
  const terminalRoof = new THREE.Mesh(roofGeo, roofMat);
  terminalRoof.position.set(0, 28, 0);
  terminalGroup.add(terminalRoof);

  // Departures Drop-off Viaduct Roadway & Tensile Canopy
  const viaductGeo = new THREE.BoxGeometry(340, 3, 24);
  const viaduct = new THREE.Mesh(viaductGeo, concreteMat);
  viaduct.position.set(0, 14, -58);
  terminalGroup.add(viaduct);

  // 3D Illuminated Marquee: "AYT INTERNATIONAL AIRPORT"
  const signGeo = new THREE.BoxGeometry(70, 12, 1.5);
  const signMesh = new THREE.Mesh(signGeo, goldAirportSignMat);
  signMesh.position.set(0, 26, -52);
  terminalGroup.add(signMesh);

  // 4 Passenger Gate Piers with Articulated Glass Aerobridges (Jet Bridges)
  for (let g = -120; g <= 120; g += 80) {
    // Gate pier extension
    const pierGeo = new THREE.BoxGeometry(18, 14, 30);
    const pier = new THREE.Mesh(pierGeo, concreteMat);
    pier.position.set(g, 7, 60);

    // Telescopic Aerobridge Tube
    const bridgeGeo = new THREE.BoxGeometry(4.5, 4.5, 38);
    const bridge = new THREE.Mesh(bridgeGeo, industrialMetalMat);
    bridge.position.set(g, 8.5, 88);
    bridge.rotation.x = -0.06;

    // Aerobridge Support Rotunda
    const rotundaGeo = new THREE.CylinderGeometry(3.5, 3.5, 9, 16);
    const rotunda = new THREE.Mesh(rotundaGeo, concreteMat);
    rotunda.position.set(g, 4.5, 107);

    terminalGroup.add(pier, bridge, rotunda);
  }

  airportGroup.add(terminalGroup);

  // 2f. Iconic Air Traffic Control (ATC) Tower (Height: 85m)
  const atcGroup = new THREE.Group();
  atcGroup.position.set(-3550, airportY, 1950);

  // Tapered Concrete Shaft
  const atcShaftGeo = new THREE.CylinderGeometry(5.5, 9.5, 72, 16);
  const atcShaft = new THREE.Mesh(atcShaftGeo, concreteMat);
  atcShaft.position.set(0, 36, 0);
  atcShaft.castShadow = true;

  // 360-degree Glass Control Cab
  const atcCabGeo = new THREE.CylinderGeometry(15, 11, 14, 16);
  const atcCab = new THREE.Mesh(atcCabGeo, glassTerminalMat);
  atcCab.position.set(0, 78, 0);

  // Rotating Radar Scanner Mast
  const mastGeo = new THREE.CylinderGeometry(0.8, 1.2, 12, 8);
  const mast = new THREE.Mesh(mastGeo, industrialMetalMat);
  mast.position.set(0, 90, 0);

  const radarDishGeo = new THREE.BoxGeometry(14, 2.5, 1.2);
  const radarDish = new THREE.Mesh(radarDishGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  radarDish.position.set(0, 96, 0);
  rotatingRadarBeacons.push(radarDish);

  atcGroup.add(atcShaft, atcCab, mast, radarDish);
  airportGroup.add(atcGroup);

  // 2g. Detailed Commercial Jet Passenger Aircraft Models
  // Helper to build 3D airliner
  const buildAirliner = (scale: number, hasLivery: boolean = true): THREE.Group => {
    const plane = new THREE.Group();

    // Fuselage Tube
    const fuselageGeo = new THREE.CylinderGeometry(3.6 * scale, 3.6 * scale, 58 * scale, 18);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, aircraftBodyMat);
    fuselage.position.set(0, 4.8 * scale, 0);
    fuselage.castShadow = true;

    // Nose Cone
    const noseGeo = new THREE.ConeGeometry(3.6 * scale, 10 * scale, 18);
    noseGeo.rotateX(-Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, aircraftBodyMat);
    nose.position.set(0, 4.8 * scale, -34 * scale);

    // Swept Main Wings
    const wingGeo = new THREE.BoxGeometry(52 * scale, 0.8 * scale, 9 * scale);
    const wing = new THREE.Mesh(wingGeo, aircraftWingMat);
    wing.position.set(0, 4.5 * scale, 0);
    wing.castShadow = true;

    // Winglets
    const wingletGeo = new THREE.BoxGeometry(0.4 * scale, 4 * scale, 3 * scale);
    const wingletL = new THREE.Mesh(wingletGeo, airlineTailMat);
    wingletL.position.set(-26 * scale, 6.2 * scale, 0);
    const wingletR = new THREE.Mesh(wingletGeo, airlineTailMat);
    wingletR.position.set(26 * scale, 6.2 * scale, 0);

    // Twin Turbofan Jet Engines
    const engineGeo = new THREE.CylinderGeometry(2.4 * scale, 2.4 * scale, 8 * scale, 16);
    engineGeo.rotateX(Math.PI / 2);
    const engineL = new THREE.Mesh(engineGeo, engineMat);
    engineL.position.set(-13 * scale, 2.8 * scale, 2 * scale);
    const engineR = new THREE.Mesh(engineGeo, engineMat);
    engineR.position.set(13 * scale, 2.8 * scale, 2 * scale);

    // Horizontal Tail Stabilizers
    const hTailGeo = new THREE.BoxGeometry(18 * scale, 0.5 * scale, 5 * scale);
    const hTail = new THREE.Mesh(hTailGeo, aircraftWingMat);
    hTail.position.set(0, 6 * scale, 25 * scale);

    // Vertical Tail Fin with AYT Airways blue/gold logo
    const vTailGeo = new THREE.BoxGeometry(0.6 * scale, 12 * scale, 9 * scale);
    const vTail = new THREE.Mesh(vTailGeo, hasLivery ? airlineTailMat : aircraftBodyMat);
    vTail.position.set(0, 11 * scale, 24 * scale);

    // Landing Gear (Tires)
    const tireGeo = new THREE.CylinderGeometry(1.0 * scale, 1.0 * scale, 0.8 * scale, 12);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x09090b });
    const tireF = new THREE.Mesh(tireGeo, tireMat);
    tireF.position.set(0, 1.0 * scale, -22 * scale);
    const tireML = new THREE.Mesh(tireGeo, tireMat);
    tireML.position.set(-5 * scale, 1.0 * scale, 4 * scale);
    const tireMR = new THREE.Mesh(tireGeo, tireMat);
    tireMR.position.set(5 * scale, 1.0 * scale, 4 * scale);

    plane.add(fuselage, nose, wing, wingletL, wingletR, engineL, engineR, hTail, vTail, tireF, tireML, tireMR);
    return plane;
  };

  // Airliner 1: Parked at Gate 1 (Attached to aerobridge)
  const plane1 = buildAirliner(1.0, true);
  plane1.position.set(-3320, airportY, 2190);
  plane1.rotation.y = Math.PI;

  // Airliner 2: Parked at Gate 3
  const plane2 = buildAirliner(0.9, true);
  plane2.position.set(-3160, airportY, 2190);
  plane2.rotation.y = Math.PI;

  // Airliner 3: Cargo Jet at Cargo Apron
  const plane3 = buildAirliner(1.15, false);
  plane3.position.set(-2700, airportY, 2220);
  plane3.rotation.y = -Math.PI / 2;

  // Airliner 4: Executive VIP Jet near Maintenance Hangar
  const plane4 = buildAirliner(0.65, true);
  plane4.position.set(-3900, airportY, 2220);
  plane4.rotation.y = Math.PI / 3;

  airportGroup.add(plane1, plane2, plane3, plane4);

  // 2h. Aircraft Maintenance Hangars (Massive arched steel structures)
  const hangarGeo = new THREE.CylinderGeometry(38, 38, 110, 24, 1, false, 0, Math.PI);
  hangarGeo.rotateZ(Math.PI / 2);
  const hangarMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.25 });

  const hangar1 = new THREE.Mesh(hangarGeo, hangarMat);
  hangar1.position.set(-2250, airportY + 19, 2120);

  const hangar2 = new THREE.Mesh(hangarGeo, hangarMat);
  hangar2.position.set(-2120, airportY + 19, 2120);
  airportGroup.add(hangar1, hangar2);

  // 2i. Aviation Jet-A1 Fuel Tank Farm (4 Tanks with Concrete Spill Containment Wall)
  const fuelFarmGroup = new THREE.Group();
  fuelFarmGroup.position.set(-1850, airportY, 2120);

  // Bund Spill Wall
  const bundWallGeo = new THREE.BoxGeometry(110, 3.5, 90);
  const bundWall = new THREE.Mesh(bundWallGeo, concreteMat);
  bundWall.position.y = 1.75;
  fuelFarmGroup.add(bundWall);

  const fuelTankGeo = new THREE.CylinderGeometry(14, 14, 20, 24);
  const fuelTankCapGeo = new THREE.SphereGeometry(14, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);

  const tankOffsets = [
    [-30, -22], [30, -22],
    [-30, 22], [30, 22],
  ];

  tankOffsets.forEach(([ox, oz]) => {
    const tank = new THREE.Mesh(fuelTankGeo, industrialMetalMat);
    tank.position.set(ox, 10, oz);
    const cap = new THREE.Mesh(fuelTankCapGeo, industrialMetalMat);
    cap.position.set(ox, 20, oz);
    fuelFarmGroup.add(tank, cap);
  });
  airportGroup.add(fuelFarmGroup);

  group.add(airportGroup);
  landmarks.push({
    name: 'AYT International Airport & Airfield',
    position: new THREE.Vector3(-3200, airportY, 2300),
    icon: '✈️',
  });

  // =========================================================================
  // 3. SPORTS & RECREATION ZONE (X: -1200 to +1200, Z: +1200 to +3500)
  // =========================================================================
  const sportsGroup = new THREE.Group();
  sportsGroup.name = 'sports_recreation_zone';
  const sportsY = calcMasterPlanElevation(0, 2300);

  // 3a. Grand Olympic Stadium
  const stadiumOuterGeo = new THREE.CylinderGeometry(160, 140, 42, 48, 1, true);
  const stadiumOuter = new THREE.Mesh(stadiumOuterGeo, stadiumRoofMat);
  stadiumOuter.position.set(0, sportsY + 21, 2300);
  sportsGroup.add(stadiumOuter);

  // Stadium Inner Bowl Pitch
  const pitchGeo = new THREE.PlaneGeometry(150, 95);
  pitchGeo.rotateX(-Math.PI / 2);
  const pitch = new THREE.Mesh(pitchGeo, stadiumGrassMat);
  pitch.position.set(0, sportsY + 1.2, 2300);
  sportsGroup.add(pitch);

  // Stadium Arched Roof Truss
  const trussGeo = new THREE.TorusGeometry(155, 3.5, 12, 48, Math.PI);
  const trussMesh = new THREE.Mesh(trussGeo, industrialMetalMat);
  trussMesh.position.set(0, sportsY + 42, 2300);
  sportsGroup.add(trussMesh);

  // 3b. Aquatic Center & Indoor Arena
  const arenaGeo = new THREE.SphereGeometry(65, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const arena = new THREE.Mesh(arenaGeo, stadiumRoofMat);
  arena.position.set(-450, calcMasterPlanElevation(-450, 2300) + 0.5, 2300);
  sportsGroup.add(arena);

  // 3c. Outdoor Athletic Courts
  const courtGeo = new THREE.PlaneGeometry(160, 90);
  courtGeo.rotateX(-Math.PI / 2);
  const courtMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.8 });
  const court = new THREE.Mesh(courtGeo, courtMat);
  court.position.set(450, calcMasterPlanElevation(450, 2300) + 0.6, 2300);
  sportsGroup.add(court);

  group.add(sportsGroup);
  landmarks.push({
    name: 'Olympic Sports Stadium & Complex',
    position: new THREE.Vector3(0, sportsY, 2300),
    icon: '🏟️',
  });

  // =========================================================================
  // 4. CONSTRUCTION & HEAVY EQUIPMENT AREA (X: +1500 to +5000, Z: +1200 to +3500)
  // =========================================================================
  const constrGroup = new THREE.Group();
  constrGroup.name = 'construction_heavy_equipment_area';

  // Sand/Gravel Stockpile Mounds
  const moundGeo = new THREE.ConeGeometry(40, 18, 16);
  const moundMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 1.0 });

  const moundPositions = [
    [2400, 2100], [2520, 2100], [2460, 2200],
    [3200, 2500], [3320, 2500], [3260, 2600],
  ];

  moundPositions.forEach(([mx, mz]) => {
    const my = calcMasterPlanElevation(mx, mz);
    const mound = new THREE.Mesh(moundGeo, moundMat);
    mound.position.set(mx, my + 9, mz);
    constrGroup.add(mound);
  });

  // Heavy Equipment Depots & Garages
  const depotGeo = new THREE.BoxGeometry(120, 16, 45);
  const depot = new THREE.Mesh(depotGeo, concreteMat);
  depot.position.set(2800, calcMasterPlanElevation(2800, 2400) + 8, 2400);
  constrGroup.add(depot);

  // Tower Crane (Height = 65m)
  const craneMastGeo = new THREE.BoxGeometry(2.5, 65, 2.5);
  const craneJibGeo = new THREE.BoxGeometry(55, 2.5, 2.5);
  craneJibGeo.translate(20, 0, 0);

  const crane = new THREE.Group();
  crane.position.set(3600, calcMasterPlanElevation(3600, 2200), 2200);
  const craneMastMesh = new THREE.Mesh(craneMastGeo, yellowHazardMat);
  craneMastMesh.position.y = 32.5;
  const craneJibMesh = new THREE.Mesh(craneJibGeo, yellowHazardMat);
  craneJibMesh.position.y = 65;
  crane.add(craneMastMesh, craneJibMesh);
  constrGroup.add(crane);

  group.add(constrGroup);
  landmarks.push({
    name: 'Heavy Equipment & Construction Yard',
    position: new THREE.Vector3(2800, calcMasterPlanElevation(2800, 2300), 2300),
    icon: '🏗️',
  });

  // Dynamic animation update (radar rotation)
  const update = (_time: number, delta: number) => {
    rotatingRadarBeacons.forEach((radar) => {
      radar.rotation.y += delta * 2.5;
    });
  };

  return {
    group,
    landmarks,
    update,
  };
}
