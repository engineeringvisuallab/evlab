import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';

/**
 * Procedural asphalt texture for elevated flyovers with crisp white shoulders & yellow markings
 */
function createFlyoverDeckTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Modern Dark Polymer-Modified Asphalt
  ctx.fillStyle = '#161c22';
  ctx.fillRect(0, 0, 512, 512);

  // Micro aggregate asphalt noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // Solid White Edge Shoulder Lines
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(20, 0, 10, 512);
  ctx.fillRect(512 - 30, 0, 10, 512);

  // Double Solid Yellow Center Line
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(256 - 8, 0, 6, 512);
  ctx.fillRect(256 + 2, 0, 6, 512);

  // Dashed White Lane Dividers
  ctx.fillStyle = '#f8fafc';
  const leftLaneX = 138;
  const rightLaneX = 374;
  for (let y = 0; y < 512; y += 64) {
    ctx.fillRect(leftLaneX - 3, y, 6, 36);
    ctx.fillRect(rightLaneX - 3, y, 6, 36);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 36);
  return tex;
}

/**
 * 1. UNIFIED FLYOVER MASTER SPINE WAYPOINTS
 * From AYT International Airport (X ≈ -3200, Z ≈ 2300)
 * -> Central City Core bypass (X ≈ -600 to +600, Z ≈ 400 to -600)
 * -> Low-Density Residential Community (X ≈ 1800, Z ≈ -2000)
 * -> North-East University & R&D Campus (X ≈ 4100, Z ≈ -4200)
 */
export const FLYOVER_SPINE_NODES: THREE.Vector3[] = [
  // 1. AYT International Airport Terminal Departure Plaza Ramp Head
  new THREE.Vector3(-3200, 0.5, 2300),
  new THREE.Vector3(-3100, 5.0, 1950), // Ascending Ramp
  new THREE.Vector3(-2950, 11.5, 1600), // Full Flyover Cruising Height (11.5m)
  // 2. West Cargo & Sports Complex Interlink
  new THREE.Vector3(-2500, 12.0, 1100),
  new THREE.Vector3(-1800, 12.0, 600),
  // 3. Central City Core Grand Flyover Viaduct
  new THREE.Vector3(-900, 12.0, 200),
  new THREE.Vector3(0, 12.5, -200),
  new THREE.Vector3(900, 12.0, -800),
  // 4. Residential Area Bypass & Overpass
  new THREE.Vector3(1750, 12.0, -1600),
  new THREE.Vector3(2200, 12.0, -2300),
  // 5. Eastern Technology Corridor & Solar Farm link
  new THREE.Vector3(2900, 12.0, -3100),
  new THREE.Vector3(3550, 11.5, -3750),
  // 6. University & R&D Campus Descent Ramp
  new THREE.Vector3(3850, 6.0, -4000), // Descending Ramp
  new THREE.Vector3(4100, 0.5, -4200), // Ground Junction Terminal
];

export const flyoverSpineCurve = new THREE.CatmullRomCurve3(FLYOVER_SPINE_NODES, false, 'catmullrom', 0.2);

/**
 * 2. RESIDENTIAL AREA DEDICATED ON/OFF-RAMP
 * Connects Suburban Residential main road (X ≈ 1800, Z ≈ -2000, Ground Y ≈ 0.5)
 * up to the Elevated Flyover Deck at (X ≈ 1750, Z ≈ -1600, Y ≈ 12.0)
 */
export const RESIDENTIAL_RAMP_NODES: THREE.Vector3[] = [
  new THREE.Vector3(1800, 0.5, -2000), // Ground road intersection
  new THREE.Vector3(1820, 3.8, -1880), // Climbing section
  new THREE.Vector3(1800, 8.2, -1740), // Mid-span curve
  new THREE.Vector3(1765, 11.8, -1620), // Flyover merge point
];

export const residentialRampCurve = new THREE.CatmullRomCurve3(RESIDENTIAL_RAMP_NODES, false, 'catmullrom', 0.2);

/**
 * 3. PARALLEL ELEVATED METRO RAIL VIADUCT NODES
 * Offset by ~16m along the spine, carrying MRT Line dual-track train
 */
export const METRO_CORRIDOR_NODES: THREE.Vector3[] = FLYOVER_SPINE_NODES.map((pt, idx) => {
  // Offset by +16m normal to the curve
  const u = idx / (FLYOVER_SPINE_NODES.length - 1);
  const tan = flyoverSpineCurve.getTangentAt(Math.min(0.999, Math.max(0.001, u))).normalize();
  const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
  const offsetDist = 16.0;
  return new THREE.Vector3(
    pt.x + norm.x * offsetDist,
    pt.y + 0.8, // Slightly higher clearance for railway pantographs
    pt.z + norm.z * offsetDist
  );
});

export const metroCorridorCurve = new THREE.CatmullRomCurve3(METRO_CORRIDOR_NODES, false, 'catmullrom', 0.2);

/**
 * 4. SOLID SURFACE ELEVATION QUERY FOR FLYOVER & RAMPS
 * Ensures vehicles driven onto the flyover and ramps have 100% solid surface physics (no falling through)
 */
export function getFlyoverSurfaceElevation(x: number, z: number): number | null {
  // Check Residential Ramp
  const rampSteps = 24;
  for (let i = 0; i <= rampSteps; i++) {
    const pt = residentialRampCurve.getPoint(i / rampSteps);
    const distSq = (x - pt.x) * (x - pt.x) + (z - pt.z) * (z - pt.z);
    if (distSq <= 10.0 * 10.0) { // 10m ramp width check
      return pt.y + 0.15;
    }
  }

  // Check Main Flyover Spine
  const spineSteps = 90;
  for (let i = 0; i <= spineSteps; i++) {
    const pt = flyoverSpineCurve.getPoint(i / spineSteps);
    const distSq = (x - pt.x) * (x - pt.x) + (z - pt.z) * (z - pt.z);
    if (distSq <= 14.0 * 14.0) { // 26m deck width check (half-width 13m + tolerance)
      return pt.y + 0.2;
    }
  }

  return null;
}

export interface UnifiedFlyoverMetroResult {
  group: THREE.Group;
  flyoverDeckGroup: THREE.Group;
  metroViaductGroup: THREE.Group;
  rampsGroup: THREE.Group;
}

/**
 * Builds the complete unified Airport-to-University mega flyover, functional ramps, and parallel metro rail viaduct
 */
export function buildAirportToUniversityFlyoverSystem(): UnifiedFlyoverMetroResult {
  const group = new THREE.Group();
  group.name = 'unified_airport_university_flyover_and_metro';

  const flyoverDeckGroup = new THREE.Group();
  flyoverDeckGroup.name = 'flyover_deck_structure';
  group.add(flyoverDeckGroup);

  const rampsGroup = new THREE.Group();
  rampsGroup.name = 'flyover_ramps';
  group.add(rampsGroup);

  const metroViaductGroup = new THREE.Group();
  metroViaductGroup.name = 'metro_rail_viaduct';
  group.add(metroViaductGroup);

  // Materials
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75, metalness: 0.15 });
  const darkConcreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
  const barrierMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.7 });
  const flyoverDeckTex = createFlyoverDeckTexture();
  const flyoverAsphaltMat = new THREE.MeshStandardMaterial({
    map: flyoverDeckTex,
    roughness: 0.8,
    metalness: 0.1,
  });
  const railMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
  const steelSkyBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.25 });
  const lightPoleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
  const lightEmissiveMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.0 });

  // =========================================================================
  // 1. BUILD MAIN FLYOVER DECK (Airport -> Central -> Residential -> University)
  // =========================================================================
  const spineSteps = 160;
  const deckWidth = 24.0; // 4-6 Lane Elevated Flyover
  const flyoverGeo = new THREE.BufferGeometry();
  const pos: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const spinePoints = flyoverSpineCurve.getPoints(spineSteps);

  for (let i = 0; i <= spineSteps; i++) {
    const pt = spinePoints[i];
    const u = i / spineSteps;
    const tan = flyoverSpineCurve.getTangentAt(Math.min(0.999, Math.max(0.001, u))).normalize();
    const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

    const lx = pt.x - norm.x * (deckWidth / 2);
    const lz = pt.z - norm.z * (deckWidth / 2);
    const rx = pt.x + norm.x * (deckWidth / 2);
    const rz = pt.z + norm.z * (deckWidth / 2);

    pos.push(lx, pt.y, lz);
    pos.push(rx, pt.y, rz);

    uvs.push(0, u * 40);
    uvs.push(1, u * 40);

    if (i < spineSteps) {
      const v0 = i * 2;
      const v1 = i * 2 + 1;
      const v2 = (i + 1) * 2;
      const v3 = (i + 1) * 2 + 1;
      indices.push(v0, v1, v2);
      indices.push(v1, v3, v2);
    }

    // Concrete Precast Box Girder Underside (Thick Solid Deck)
    if (i % 2 === 0) {
      const deckSlab = new THREE.Mesh(new THREE.BoxGeometry(deckWidth, 1.8, 48), concreteMat);
      deckSlab.position.set(pt.x, pt.y - 0.9, pt.z);
      deckSlab.lookAt(pt.x + tan.x, pt.y - 0.9 + tan.y, pt.z + tan.z);
      deckSlab.castShadow = true;
      deckSlab.receiveShadow = true;
      flyoverDeckGroup.add(deckSlab);

      // Jersey Barrier Guardrails on Left & Right
      const barrierL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.3, 48), barrierMat);
      barrierL.position.set(lx + norm.x * 0.4, pt.y + 0.65, lz + norm.z * 0.4);
      barrierL.lookAt(lx + norm.x * 0.4 + tan.x, pt.y + 0.65 + tan.y, lz + norm.z * 0.4 + tan.z);
      const barrierR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.3, 48), barrierMat);
      barrierR.position.set(rx - norm.x * 0.4, pt.y + 0.65, rz - norm.z * 0.4);
      barrierR.lookAt(rx - norm.x * 0.4 + tan.x, pt.y + 0.65 + tan.y, rz - norm.z * 0.4 + tan.z);
      flyoverDeckGroup.add(barrierL, barrierR);
    }

    // Heavy Concrete Piers every ~65 meters where elevated above ground
    if (i % 3 === 0 && pt.y > 3.0) {
      const groundElev = calcMasterPlanElevation(pt.x, pt.z);
      const pierHeight = Math.max(3.0, pt.y - groundElev);

      // Dual Column Monolithic Pier with Transverse Crosshead
      const pierGrp = new THREE.Group();
      pierGrp.position.set(pt.x, groundElev + pierHeight / 2, pt.z);

      const colL = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, pierHeight, 16), concreteMat);
      colL.position.set(-norm.x * 6.0, 0, -norm.z * 6.0);
      const colR = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, pierHeight, 16), concreteMat);
      colR.position.set(norm.x * 6.0, 0, norm.z * 6.0);

      const crosshead = new THREE.Mesh(new THREE.BoxGeometry(deckWidth - 2, 2.2, 5.0), darkConcreteMat);
      crosshead.position.set(0, pierHeight / 2 - 1.1, 0);
      crosshead.lookAt(tan.x, pierHeight / 2 - 1.1, tan.z);

      pierGrp.add(colL, colR, crosshead);
      flyoverDeckGroup.add(pierGrp);

      // Street Luminaire Mast on Center Median
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8), lightPoleMat);
      pole.position.set(pt.x, pt.y + 3.75, pt.z);
      const armL = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 0.1), lightPoleMat);
      armL.position.set(pt.x - norm.x * 1.0, pt.y + 7.2, pt.z - norm.z * 1.0);
      const lampL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), lightEmissiveMat);
      lampL.position.set(pt.x - norm.x * 2.0, pt.y + 7.0, pt.z - norm.z * 2.0);

      const armR = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 0.1), lightPoleMat);
      armR.position.set(pt.x + norm.x * 1.0, pt.y + 7.2, pt.z + norm.z * 1.0);
      const lampR = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), lightEmissiveMat);
      lampR.position.set(pt.x + norm.x * 2.0, pt.y + 7.0, pt.z + norm.z * 2.0);

      flyoverDeckGroup.add(pole, armL, lampL, armR, lampR);
    }
  }

  flyoverGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  flyoverGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  flyoverGeo.setIndex(indices);
  flyoverGeo.computeVertexNormals();

  const flyoverSurfaceMesh = new THREE.Mesh(flyoverGeo, flyoverAsphaltMat);
  flyoverSurfaceMesh.receiveShadow = true;
  flyoverDeckGroup.add(flyoverSurfaceMesh);

  // =========================================================================
  // 2. BUILD RESIDENTIAL AREA CONNECTING ON/OFF-RAMP
  // =========================================================================
  const rampSteps = 40;
  const rampWidth = 9.5; // Single/Dual lane connecting ramp
  const rampGeo = new THREE.BufferGeometry();
  const rampPos: number[] = [];
  const rampUvs: number[] = [];
  const rampIndices: number[] = [];

  const rampPoints = residentialRampCurve.getPoints(rampSteps);

  for (let i = 0; i <= rampSteps; i++) {
    const pt = rampPoints[i];
    const u = i / rampSteps;
    const tan = residentialRampCurve.getTangentAt(Math.min(0.999, Math.max(0.001, u))).normalize();
    const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

    const lx = pt.x - norm.x * (rampWidth / 2);
    const lz = pt.z - norm.z * (rampWidth / 2);
    const rx = pt.x + norm.x * (rampWidth / 2);
    const rz = pt.z + norm.z * (rampWidth / 2);

    rampPos.push(lx, pt.y, lz);
    rampPos.push(rx, pt.y, rz);

    rampUvs.push(0, u * 12);
    rampUvs.push(1, u * 12);

    if (i < rampSteps) {
      const v0 = i * 2;
      const v1 = i * 2 + 1;
      const v2 = (i + 1) * 2;
      const v3 = (i + 1) * 2 + 1;
      rampIndices.push(v0, v1, v2);
      rampIndices.push(v1, v3, v2);
    }

    // Concrete Ramp Box Girder
    if (i % 2 === 0) {
      const rampSlab = new THREE.Mesh(new THREE.BoxGeometry(rampWidth, 1.4, 16), concreteMat);
      rampSlab.position.set(pt.x, pt.y - 0.7, pt.z);
      rampSlab.lookAt(pt.x + tan.x, pt.y - 0.7 + tan.y, pt.z + tan.z);
      rampSlab.castShadow = true;
      rampsGroup.add(rampSlab);

      const barrierL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 16), barrierMat);
      barrierL.position.set(lx + norm.x * 0.3, pt.y + 0.6, lz + norm.z * 0.3);
      barrierL.lookAt(lx + norm.x * 0.3 + tan.x, pt.y + 0.6 + tan.y, lz + norm.z * 0.3 + tan.z);
      const barrierR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 16), barrierMat);
      barrierR.position.set(rx - norm.x * 0.3, pt.y + 0.6, rz - norm.z * 0.3);
      barrierR.lookAt(rx - norm.x * 0.3 + tan.x, pt.y + 0.6 + tan.y, rz - norm.z * 0.3 + tan.z);
      rampsGroup.add(barrierL, barrierR);
    }

    // Ramp support piers
    if (i % 5 === 0 && pt.y > 2.5) {
      const groundElev = calcMasterPlanElevation(pt.x, pt.z);
      const h = Math.max(2.0, pt.y - groundElev);
      const pier = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, h, 12), concreteMat);
      pier.position.set(pt.x, groundElev + h / 2, pt.z);
      rampsGroup.add(pier);
    }
  }

  rampGeo.setAttribute('position', new THREE.Float32BufferAttribute(rampPos, 3));
  rampGeo.setAttribute('uv', new THREE.Float32BufferAttribute(rampUvs, 2));
  rampGeo.setIndex(rampIndices);
  rampGeo.computeVertexNormals();

  const rampSurfaceMesh = new THREE.Mesh(rampGeo, flyoverAsphaltMat);
  rampsGroup.add(rampSurfaceMesh);

  // Ground Junction Roundabout / Feeder Road at Residential Entry
  const feederGeo = new THREE.RingGeometry(12, 24, 32);
  feederGeo.rotateX(-Math.PI / 2);
  const feederMesh = new THREE.Mesh(feederGeo, flyoverAsphaltMat);
  feederMesh.position.set(1800, 0.52, -2000);
  rampsGroup.add(feederMesh);

  // Signboard: "RESIDENTIAL SUBURB VIA FLYOVER RAMP"
  const signMast = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6, 0.3), steelSkyBlueMat);
  signMast.position.set(1780, 3, -1990);
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(6, 2.2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 })
  );
  signBoard.position.set(1780, 5.5, -1990);
  rampsGroup.add(signMast, signBoard);

  // =========================================================================
  // 3. BUILD PARALLEL ELEVATED METRO RAIL VIADUCT (Runs beside the Flyover)
  // =========================================================================
  const metroSteps = 160;
  const metroWidth = 10.5; // Dual Track MRT Line
  const metroPoints = metroCorridorCurve.getPoints(metroSteps);

  for (let i = 0; i <= metroSteps; i++) {
    const pt = metroPoints[i];
    const u = i / metroSteps;
    const tan = metroCorridorCurve.getTangentAt(Math.min(0.999, Math.max(0.001, u))).normalize();
    const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

    // Box Girder Segment
    if (i % 2 === 0) {
      const vSlab = new THREE.Mesh(new THREE.BoxGeometry(metroWidth, 1.8, 48), darkConcreteMat);
      vSlab.position.set(pt.x, pt.y - 0.9, pt.z);
      vSlab.lookAt(pt.x + tan.x, pt.y - 0.9 + tan.y, pt.z + tan.z);
      vSlab.castShadow = true;
      metroViaductGroup.add(vSlab);

      // Acoustic Sound Barrier Side Walls
      const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.8, 48), concreteMat);
      wallL.position.set(pt.x - norm.x * (metroWidth / 2 - 0.2), pt.y + 0.9, pt.z - norm.z * (metroWidth / 2 - 0.2));
      wallL.lookAt(pt.x - norm.x * (metroWidth / 2 - 0.2) + tan.x, pt.y + 0.9 + tan.y, pt.z - norm.z * (metroWidth / 2 - 0.2) + tan.z);

      const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.8, 48), concreteMat);
      wallR.position.set(pt.x + norm.x * (metroWidth / 2 - 0.2), pt.y + 0.9, pt.z + norm.z * (metroWidth / 2 - 0.2));
      wallR.lookAt(pt.x + norm.x * (metroWidth / 2 - 0.2) + tan.x, pt.y + 0.9 + tan.y, pt.z + norm.z * (metroWidth / 2 - 0.2) + tan.z);

      metroViaductGroup.add(wallL, wallR);
    }

    // High Strength Concrete T-Pier Columns
    if (i % 3 === 0 && pt.y > 3.0) {
      const groundElev = calcMasterPlanElevation(pt.x, pt.z);
      const h = Math.max(3.0, pt.y - groundElev);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, h, 16), concreteMat);
      col.position.set(pt.x, groundElev + h / 2, pt.z);

      const hammerhead = new THREE.Mesh(new THREE.BoxGeometry(metroWidth - 1, 2.2, 4.5), darkConcreteMat);
      hammerhead.position.set(pt.x, pt.y - 1.1, pt.z);
      hammerhead.lookAt(pt.x + tan.x, pt.y - 1.1 + tan.y, pt.z + tan.z);

      metroViaductGroup.add(col, hammerhead);

      // Overhead Catenary Mast for Electric Metro
      const catMast = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.5, 0.2), steelSkyBlueMat);
      catMast.position.set(pt.x + norm.x * 4.2, pt.y + 2.75, pt.z + norm.z * 4.2);
      const catArm = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.15, 0.15), steelSkyBlueMat);
      catArm.position.set(pt.x, pt.y + 5.2, pt.z);
      metroViaductGroup.add(catMast, catArm);
    }

    // Steel Rails (Track 1 & Track 2)
    if (i % 2 === 0) {
      for (const trackOffset of [-2.4, 2.4]) {
        for (const railOffset of [-0.75, 0.75]) {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 48.2), railMat);
          const rx = pt.x + norm.x * (trackOffset + railOffset);
          const rz = pt.z + norm.z * (trackOffset + railOffset);
          rail.position.set(rx, pt.y + 0.15, rz);
          rail.lookAt(rx + tan.x, pt.y + 0.15 + tan.y, rz + tan.z);
          metroViaductGroup.add(rail);
        }
      }
    }
  }

  // 3 Elevated Metro Stations along the Corridor:
  // 1. Airport Metro Station (X: -2950, Z: 1600)
  // 2. Residential Metro Station (X: 1750, Z: -1600)
  // 3. University Metro Station (X: 3550, Z: -3750)
  const createElevatedMetroStation = (name: string, pos: THREE.Vector3) => {
    const stGroup = new THREE.Group();
    stGroup.name = name;
    stGroup.position.copy(pos);

    const stConcourse = new THREE.Mesh(
      new THREE.BoxGeometry(60, 6.5, 22),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
    );
    stConcourse.position.y = 1.0;
    stConcourse.castShadow = true;

    const stGlass = new THREE.Mesh(
      new THREE.BoxGeometry(60.4, 4.5, 22.4),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.75 })
    );
    stGlass.position.y = 4.0;

    const curvedRoof = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 14, 64, 16, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.8, roughness: 0.25 })
    );
    curvedRoof.rotation.z = Math.PI / 2;
    curvedRoof.position.y = 6.5;

    stGroup.add(stConcourse, stGlass, curvedRoof);
    metroViaductGroup.add(stGroup);
  };

  createElevatedMetroStation('airport_elevated_metro_station', new THREE.Vector3(-2950, 12.0, 1600));
  createElevatedMetroStation('residential_elevated_metro_station', new THREE.Vector3(1750, 12.0, -1600));
  createElevatedMetroStation('university_elevated_metro_station', new THREE.Vector3(3550, 12.0, -3750));

  return {
    group,
    flyoverDeckGroup,
    metroViaductGroup,
    rampsGroup,
  };
}
