import * as THREE from 'three';
import { createAsphaltTexture, createCorrugatedTinTexture, createBrickWallTexture } from './terrainTextures';
import { buildRichInfrastructure } from './richInfrastructureBuilder';
import { buildCountryExpansion } from './countryExpansionBuilder';

export interface CountrySceneObjects {
  group: THREE.Group;
  windTurbines: THREE.Group[];
  radarDish: THREE.Object3D | null;
  streetLights: THREE.PointLight[];
  updateAnimations: (time: number, delta: number) => void;
}

export function buildCountrySceneObjects(getElevationAt: (x: number, z: number) => number): CountrySceneObjects {
  const group = new THREE.Group();
  group.name = 'mini_country_scene_objects';

  const windTurbines: THREE.Group[] = [];
  const streetLights: THREE.PointLight[] = [];
  let radarDish: THREE.Object3D | null = null;

  // Reusable Materials
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8, metalness: 0.1 });
  const darkConcreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, metalness: 0.2 });
  const glassBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9, opacity: 0.9, transparent: true });
  const glassDarkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.95 });
  const windowGlowMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.7 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
  const solarCellMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2, metalness: 0.7 });
  const waterSpillMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.2, transparent: true, opacity: 0.85 });

  const asphaltTex = createAsphaltTexture();
  const roadMat = new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.8, metalness: 0.1 });

  const tinSilver = createCorrugatedTinTexture('silver');
  const tinBlue = createCorrugatedTinTexture('blue');
  const tinRust = createCorrugatedTinTexture('rust');
  const brickTex = createBrickWallTexture();

  const tinSilverMat = new THREE.MeshStandardMaterial({ map: tinSilver, roughness: 0.5, metalness: 0.4 });
  const tinBlueMat = new THREE.MeshStandardMaterial({ map: tinBlue, roughness: 0.5, metalness: 0.4 });
  const tinRustMat = new THREE.MeshStandardMaterial({ map: tinRust, roughness: 0.75, metalness: 0.2 });
  const brickMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.85 });

  // =========================================================================
  // 1. WIND TURBINE POWER FARM (On Mountain Ridge at (-220, -250))
  // =========================================================================
  const turbinePositions = [
    [-240, -270],
    [-210, -280],
    [-250, -230],
    [-200, -240],
    [-180, -260],
    [-230, -200],
  ];

  turbinePositions.forEach(([tx, tz]) => {
    const ty = getElevationAt(tx, tz);
    const turbine = new THREE.Group();

    // Tower base & column (height 38m)
    const towerGeo = new THREE.CylinderGeometry(0.8, 1.6, 38, 16);
    const tower = new THREE.Mesh(towerGeo, whiteMat);
    tower.position.y = 19;
    tower.castShadow = true;
    turbine.add(tower);

    // Nacelle (generator housing)
    const nacelleGeo = new THREE.BoxGeometry(2.4, 2.2, 5.5);
    const nacelle = new THREE.Mesh(nacelleGeo, whiteMat);
    nacelle.position.set(0, 38, 0.5);
    nacelle.castShadow = true;
    turbine.add(nacelle);

    // Rotor Hub
    const hub = new THREE.Group();
    hub.position.set(0, 38, -2.4);

    const noseGeo = new THREE.ConeGeometry(1.0, 1.8, 12);
    noseGeo.rotateX(-Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, whiteMat);
    hub.add(nose);

    // 3 Rotor Blades (length 20m)
    for (let b = 0; b < 3; b++) {
      const bladeAngle = (b * Math.PI * 2) / 3;
      const bladeGrp = new THREE.Group();
      bladeGrp.rotation.z = bladeAngle;

      const bladeGeo = new THREE.BoxGeometry(0.6, 18, 0.15);
      const blade = new THREE.Mesh(bladeGeo, whiteMat);
      blade.position.y = 9;
      blade.castShadow = true;
      bladeGrp.add(blade);
      hub.add(bladeGrp);
    }

    turbine.add(hub);
    (turbine as unknown as { rotorHub: THREE.Group }).rotorHub = hub;
    turbine.position.set(tx, ty, tz);
    group.add(turbine);
    windTurbines.push(turbine);
  });

  // =========================================================================
  // 2. HYDROELECTRIC DAM & MOUNTAIN RESERVOIR LAKE (At (180, -240))
  // =========================================================================
  const damGrp = new THREE.Group();
  const damX = 180;
  const damZ = -220;
  const damY = getElevationAt(damX, damZ);

  // Main Concrete Dam Wall (Width 90m, Height 26m, Thickness 16m)
  const damWall = new THREE.Mesh(
    new THREE.BoxGeometry(90, 24, 18),
    concreteMat
  );
  damWall.position.set(damX, damY + 8, damZ);
  damWall.castShadow = true;
  damWall.receiveShadow = true;
  damGrp.add(damWall);

  // Spillway Chute & Sluice Gates
  const spillway = new THREE.Mesh(
    new THREE.BoxGeometry(32, 22, 34),
    darkConcreteMat
  );
  spillway.position.set(damX, damY + 3, damZ + 12);
  spillway.rotation.x = Math.PI / 8; // sloped spillway
  damGrp.add(spillway);

  // Cascading Water Flow on Spillway
  const spillWater = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 32),
    waterSpillMat
  );
  spillWater.rotateX(-Math.PI / 2.4);
  spillWater.position.set(damX, damY + 7, damZ + 14);
  damGrp.add(spillWater);

  // Dam Crest Roadway with Guardrails
  const crestRoad = new THREE.Mesh(
    new THREE.BoxGeometry(90, 0.8, 8),
    roadMat
  );
  crestRoad.position.set(damX, damY + 20.4, damZ);
  damGrp.add(crestRoad);

  // Elevated Mountain Lake Water Plane
  const lakeGeo = new THREE.PlaneGeometry(140, 100);
  lakeGeo.rotateX(-Math.PI / 2);
  const lakeMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.88,
  });
  const lakeMesh = new THREE.Mesh(lakeGeo, lakeMat);
  lakeMesh.position.set(damX, damY + 16, damZ - 45);
  damGrp.add(lakeMesh);

  group.add(damGrp);

  // =========================================================================
  // 3. SMART CITY CORE (High-density Skyscrapers & Towers across an Expanded Urban Grid)
  // =========================================================================
  interface CityBuildingDef {
    bx: number;
    bz: number;
    bw: number;
    bd: number;
    bh: number;
    style: 'glass' | 'concrete' | 'tower' | 'stepped';
  }

  // Spacious, decluttered city layout with wide avenues and distinct districts
  const cityBuildingsData: CityBuildingDef[] = [
    // Central Financial District (Wide 40m avenue separation)
    { bx: -45, bz: -60, bw: 24, bd: 24, bh: 72, style: 'glass' },
    { bx: 45, bz: -60, bw: 22, bd: 22, bh: 64, style: 'stepped' },
    { bx: -45, bz: 40, bw: 26, bd: 24, bh: 84, style: 'tower' },
    { bx: 45, bz: 40, bw: 22, bd: 20, bh: 60, style: 'glass' },

    // East Innovation & IT Tech Hub (Set back with plazas)
    { bx: 110, bz: -50, bw: 20, bd: 24, bh: 48, style: 'stepped' },
    { bx: 110, bz: 30, bw: 22, bd: 22, bh: 54, style: 'glass' },
    { bx: 155, bz: -10, bw: 18, bd: 26, bh: 42, style: 'concrete' },

    // West Waterfront Marina Commercial Row
    { bx: -110, bz: -50, bw: 24, bd: 20, bh: 52, style: 'concrete' },
    { bx: -110, bz: 30, bw: 22, bd: 22, bh: 58, style: 'stepped' },
    { bx: -155, bz: -10, bw: 20, bd: 24, bh: 46, style: 'glass' },

    // North Civic & Administrative Towers
    { bx: -50, bz: -130, bw: 22, bd: 22, bh: 50, style: 'concrete' },
    { bx: 50, bz: -130, bw: 24, bd: 20, bh: 56, style: 'tower' },
    { bx: 0, bz: -170, bw: 26, bd: 26, bh: 68, style: 'glass' },

    // South Gateway & University Tech Zone
    { bx: -50, bz: 110, bw: 22, bd: 22, bh: 44, style: 'stepped' },
    { bx: 50, bz: 110, bw: 24, bd: 20, bh: 48, style: 'glass' },
    { bx: 0, bz: 150, bw: 20, bd: 22, bh: 40, style: 'concrete' },
  ];

  cityBuildingsData.forEach(({ bx, bz, bw, bd, bh, style }) => {
    const by = getElevationAt(bx, bz);
    const bldg = new THREE.Group();

    if (style === 'glass') {
      // Modern Blue Glass Skyscraper
      const core = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), glassBlueMat);
      core.position.y = bh / 2;
      core.castShadow = true;
      core.receiveShadow = true;
      bldg.add(core);

      // White architectural mullion bands
      const bandCount = Math.floor(bh / 6);
      for (let f = 1; f < bandCount; f++) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.3, 0.4, bd + 0.3), whiteMat);
        band.position.y = f * 6;
        bldg.add(band);
      }

      // Rooftop Communications Spire
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.6, 14, 8), steelMat);
      spire.position.set(0, bh + 7, 0);
      bldg.add(spire);

    } else if (style === 'tower') {
      // Stepped Apex Crown Tower with Helipad
      const lower = new THREE.Mesh(new THREE.BoxGeometry(bw, bh * 0.75, bd), concreteMat);
      lower.position.y = (bh * 0.75) / 2;
      lower.castShadow = true;
      bldg.add(lower);

      const upper = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.75, bh * 0.25, bd * 0.75), glassBlueMat);
      upper.position.y = bh * 0.75 + (bh * 0.25) / 2;
      upper.castShadow = true;
      bldg.add(upper);

      // Helipad on top
      const heliRing = new THREE.Mesh(
        new THREE.RingGeometry(2.5, 4.5, 16),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
      );
      heliRing.rotateX(-Math.PI / 2);
      heliRing.position.set(0, bh + 0.1, 0);
      bldg.add(heliRing);

    } else if (style === 'stepped') {
      // Stepped Terraced Modern High-rise
      const step1 = new THREE.Mesh(new THREE.BoxGeometry(bw, bh * 0.5, bd), concreteMat);
      step1.position.y = (bh * 0.5) / 2;
      step1.castShadow = true;
      bldg.add(step1);

      const step2 = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.8, bh * 0.3, bd * 0.8), glassDarkMat);
      step2.position.y = bh * 0.5 + (bh * 0.3) / 2;
      step2.castShadow = true;
      bldg.add(step2);

      const step3 = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.55, bh * 0.2, bd * 0.55), whiteMat);
      step3.position.y = bh * 0.8 + (bh * 0.2) / 2;
      step3.castShadow = true;
      bldg.add(step3);

    } else {
      // Concrete & Ribbon Window Office
      const block = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), concreteMat);
      block.position.y = bh / 2;
      block.castShadow = true;
      bldg.add(block);

      // Window strips
      const floorH = 4.2;
      const numFloors = Math.floor(bh / floorH);
      for (let f = 1; f < numFloors; f++) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.1, 1.4, bd + 0.1), glassDarkMat);
        strip.position.y = f * floorH;
        bldg.add(strip);
      }
    }

    bldg.position.set(bx, by, bz);
    group.add(bldg);
  });

  // =========================================================================
  // 3B. GRAND CITY MEGA SUPER MALL (At (-25, 10))
  // =========================================================================
  const mallGrp = new THREE.Group();
  const mallX = -25;
  const mallZ = 12;
  const mallY = getElevationAt(mallX, mallZ);

  // Mall Base & Multi-story Terraced Glass Complex
  const mallBase = new THREE.Mesh(
    new THREE.BoxGeometry(42, 14, 34),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.2 })
  );
  mallBase.position.set(0, 7, 0);
  mallBase.castShadow = true;
  mallBase.receiveShadow = true;
  mallGrp.add(mallBase);

  // Curved Glass Facade / Central Atrium
  const atriumGeo = new THREE.CylinderGeometry(14, 14, 18, 24, 1, false, 0, Math.PI);
  const atriumMesh = new THREE.Mesh(atriumGeo, glassBlueMat);
  atriumMesh.position.set(0, 9, 14);
  atriumMesh.rotation.y = Math.PI;
  atriumMesh.castShadow = true;
  mallGrp.add(atriumMesh);

  // Skylight Glass Dome on Roof
  const domeGeo = new THREE.SphereGeometry(8, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMesh = new THREE.Mesh(domeGeo, glassBlueMat);
  domeMesh.position.set(0, 14, 0);
  mallGrp.add(domeMesh);

  // Grand Entrance Canopy
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(22, 0.8, 10),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
  );
  canopy.position.set(0, 4.5, 20);
  canopy.castShadow = true;
  mallGrp.add(canopy);

  // Canopy Pillars
  for (const cx of [-8, 8]) {
    const cp = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4.5, 8), steelMat);
    cp.position.set(cx, 2.25, 23);
    mallGrp.add(cp);
  }

  // Glowing Neon Storefront / Billboard Sign: "GRAND CITY SUPER MALL"
  const signBack = new THREE.Mesh(
    new THREE.BoxGeometry(24, 3.2, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x0f172a })
  );
  signBack.position.set(0, 12, 17.2);
  mallGrp.add(signBack);

  const signNeon = new THREE.Mesh(
    new THREE.BoxGeometry(22, 2.2, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.5 })
  );
  signNeon.position.set(0, 12, 17.3);
  mallGrp.add(signNeon);

  // Decorative Plaza Planters & Flags
  for (const px of [-14, 14]) {
    const planter = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 3), darkConcreteMat);
    planter.position.set(px, 0.6, 22);
    mallGrp.add(planter);

    const plantBush = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x16a34a })
    );
    plantBush.position.set(px, 1.8, 22);
    mallGrp.add(plantBush);
  }

  mallGrp.position.set(mallX, mallY, mallZ);
  group.add(mallGrp);

  // =========================================================================
  // 4. INTERNATIONAL AIRPORT & RUNWAY (At (180, 200))
  // =========================================================================
  const airportGrp = new THREE.Group();
  const airX = 180;
  const airZ = 200;
  const airY = getElevationAt(airX, airZ);

  // Main Runway (Length 240m, Width 24m)
  const runwayMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 240),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
  );
  runwayMesh.rotateX(-Math.PI / 2);
  runwayMesh.position.set(airX, airY + 0.08, airZ);
  runwayMesh.receiveShadow = true;
  airportGrp.add(runwayMesh);

  // Runway Centerline & Threshold Markings
  const markMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  for (let rz = -100; rz <= 100; rz += 20) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 10), markMat);
    dash.rotateX(-Math.PI / 2);
    dash.position.set(airX, airY + 0.1, airZ + rz);
    airportGrp.add(dash);
  }

  // Threshold Piano Keys
  for (let endZ of [-110, 110]) {
    for (let k = -8; k <= 8; k += 2.4) {
      const key = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 12), markMat);
      key.rotateX(-Math.PI / 2);
      key.position.set(airX + k, airY + 0.1, airZ + endZ);
      airportGrp.add(key);
    }
  }

  // Runway Edge Lights (Green at start, Red at end, White along length)
  for (let rz = -115; rz <= 115; rz += 25) {
    for (let rx of [airX - 13, airX + 13]) {
      const lightCol = rz === -115 ? 0x22c55e : (rz === 115 ? 0xef4444 : 0xf8fafc);
      const lightPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: lightCol, emissive: lightCol, emissiveIntensity: 1.0 })
      );
      lightPost.position.set(rx, airY + 0.25, airZ + rz);
      airportGrp.add(lightPost);
    }
  }

  // Air Traffic Control Tower (Height 32m)
  const towerX = airX - 35;
  const towerZ = airZ - 30;
  const towerY = getElevationAt(towerX, towerZ);

  const atcBase = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.8, 26, 12), concreteMat);
  atcBase.position.set(towerX, towerY + 13, towerZ);
  atcBase.castShadow = true;
  airportGrp.add(atcBase);

  const atcCab = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 3.2, 5.5, 12), glassBlueMat);
  atcCab.position.set(towerX, towerY + 28.5, towerZ);
  airportGrp.add(atcCab);

  // Rotating Radar Scanner on ATC Roof
  const radarGrp = new THREE.Group();
  radarGrp.position.set(towerX, towerY + 32, towerZ);
  const radarMesh = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.8, 0.4), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
  radarGrp.add(radarMesh);
  airportGrp.add(radarGrp);
  radarDish = radarGrp;

  // Passenger Terminal Building
  const termX = airX - 45;
  const termZ = airZ + 20;
  const termY = getElevationAt(termX, termZ);
  const terminal = new THREE.Mesh(new THREE.BoxGeometry(24, 9, 65), whiteMat);
  terminal.position.set(termX, termY + 4.5, termZ);
  terminal.castShadow = true;
  airportGrp.add(terminal);

  // 3D Commercial Passenger Airliner Airplane
  const planeGrp = new THREE.Group();
  planeGrp.position.set(airX - 25, airY + 2.5, airZ + 25);
  planeGrp.rotation.y = -Math.PI / 2;

  // Fuselage
  const fuse = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 24, 14), whiteMat);
  fuse.rotation.x = Math.PI / 2;
  fuse.castShadow = true;
  planeGrp.add(fuse);

  // Nose cone
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 10), whiteMat);
  nose.position.z = 12;
  planeGrp.add(nose);

  // Wings (Span 26m)
  const wings = new THREE.Mesh(new THREE.BoxGeometry(26, 0.3, 4.2), whiteMat);
  wings.position.set(0, -0.2, 1.5);
  wings.castShadow = true;
  planeGrp.add(wings);

  // Jet Engines under wings
  for (const ex of [-6.5, 6.5]) {
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3.2, 12), steelMat);
    engine.rotation.x = Math.PI / 2;
    engine.position.set(ex, -1.0, 1.5);
    planeGrp.add(engine);
  }

  // Tail Vertical Stabilizer
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.5, 3.5), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
  tail.position.set(0, 3.2, -10.5);
  planeGrp.add(tail);

  airportGrp.add(planeGrp);
  group.add(airportGrp);

  // =========================================================================
  // 5. SOLAR PHOTOVOLTAIC ENERGY PARK (At (-180, 180))
  // =========================================================================
  const solarGrp = new THREE.Group();
  for (let sx = -220; sx <= -140; sx += 18) {
    for (let sz = 140; sz <= 220; sz += 15) {
      const sy = getElevationAt(sx, sz);
      const panelGrp = new THREE.Group();

      // Steel frame
      const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), steelMat);
      frame.position.y = 0.8;
      panelGrp.add(frame);

      // Solar PV Panel tilted south
      const panel = new THREE.Mesh(new THREE.BoxGeometry(12, 0.15, 6), solarCellMat);
      panel.position.set(0, 1.6, 0);
      panel.rotation.x = Math.PI / 7; // ~25 deg tilt towards sun
      panel.castShadow = true;
      panelGrp.add(panel);

      panelGrp.position.set(sx, sy, sz);
      solarGrp.add(panelGrp);
    }
  }
  group.add(solarGrp);

  // =========================================================================
  // 6. WATER TREATMENT PLANT & CLARIFIERS (At (-80, 240))
  // =========================================================================
  const wtpGrp = new THREE.Group();
  const wtpX = -80;
  const wtpZ = 240;
  const wtpY = getElevationAt(wtpX, wtpZ);

  // Circular Clarifiers / Aeration Basins
  for (const cx of [-95, -65]) {
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 2.8, 24), concreteMat);
    basin.position.set(cx, wtpY + 1.4, wtpZ);
    basin.castShadow = true;
    wtpGrp.add(basin);

    // Water surface inside
    const cWater = new THREE.Mesh(
      new THREE.CircleGeometry(8.5, 20),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.15 })
    );
    cWater.rotateX(-Math.PI / 2);
    cWater.position.set(cx, wtpY + 2.5, wtpZ);
    wtpGrp.add(cWater);

    // Rotary Scraper Bridge
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 1.2), steelMat);
    bridge.position.set(cx, wtpY + 3.0, wtpZ);
    wtpGrp.add(bridge);
  }

  // Treatment Control Building
  const wtpBuilding = new THREE.Mesh(new THREE.BoxGeometry(16, 7, 18), whiteMat);
  wtpBuilding.position.set(wtpX, wtpY + 3.5, wtpZ + 24);
  wtpBuilding.castShadow = true;
  wtpGrp.add(wtpBuilding);

  group.add(wtpGrp);

  // =========================================================================
  // 7. RURAL VILLAGES (Bari homesteads, Tea Stalls & Bazaars)
  // =========================================================================
  const villageHousePositions: [number, number, number, 'silver' | 'blue' | 'rust'][] = [
    [-210, -30, 0.2, 'silver'],
    [-230, -25, -0.4, 'blue'],
    [-205, -10, 1.2, 'rust'],
    [-235, -45, 0.8, 'silver'],
    [-190, -40, -1.1, 'blue'],
    [-240, 10, 0.5, 'silver'],
    [-215, 25, -0.2, 'rust'],
    [-180, 15, 0.9, 'blue'],
    // South farmlands cluster
    [-140, 80, 0.3, 'silver'],
    [-160, 95, -0.6, 'rust'],
    [-120, 110, 0.7, 'blue'],
  ];

  villageHousePositions.forEach(([vx, vz, vrot, vroof]) => {
    const vy = getElevationAt(vx, vz);
    const house = new THREE.Group();

    // Brick Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.5, 5.5), brickMat);
    plinth.position.y = 0.25;
    house.add(plinth);

    // Walls
    const walls = new THREE.Mesh(new THREE.BoxGeometry(7, 2.8, 5), brickMat);
    walls.position.y = 1.9;
    walls.castShadow = true;
    house.add(walls);

    // Corrugated Tin Gable Roof
    const roofMat = vroof === 'blue' ? tinBlueMat : (vroof === 'rust' ? tinRustMat : tinSilverMat);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.0, 4), roofMat);
    roof.position.y = 4.3;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.1, 1, 0.8);
    roof.castShadow = true;
    house.add(roof);

    // Veranda posts
    const postMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
    for (const px of [-3.2, 3.2]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), postMat);
      post.position.set(px, 1.8, 3.2);
      house.add(post);
    }

    house.position.set(vx, vy, vz);
    house.rotation.y = vrot;
    group.add(house);
  });

  // =========================================================================
  // 7B. RURAL VEGETABLE BAZAAR & FRESH PRODUCE STALLS (সবজির বাজার at (-205, -15))
  // =========================================================================
  const bazaarGrp = new THREE.Group();
  const bazX = -205;
  const bazZ = -15;
  const bazY = getElevationAt(bazX, bazZ);

  // Bazaar Ground Pavement (Earthen brick walkway)
  const bazPlinth = new THREE.Mesh(
    new THREE.BoxGeometry(32, 0.3, 24),
    new THREE.MeshStandardMaterial({ color: 0x78533b, roughness: 0.9 })
  );
  bazPlinth.position.y = 0.15;
  bazaarGrp.add(bazPlinth);

  // Vegetable Shop Stalls Data
  const stallCanopyColors = [
    { main: 0xdc2626, stripe: 0xf8fafc }, // Red & White striped
    { main: 0x16a34a, stripe: 0xfacc15 }, // Green & Yellow striped
    { main: 0x2563eb, stripe: 0xf8fafc }, // Blue & White striped
    { main: 0xd97706, stripe: 0x451a03 }, // Orange & Brown striped
  ];

  const stallPositions = [
    { sx: -10, sz: -6, rot: 0.1 },
    { sx: -10, sz: 6, rot: -0.1 },
    { sx: 8, sz: -6, rot: 0.15 },
    { sx: 8, sz: 6, rot: -0.15 },
  ];

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
  const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }); // Red Tomatoes
  const eggplantMat = new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.3 }); // Purple Eggplants
  const pumpkinMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.5 }); // Orange Pumpkins
  const cabbageMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 }); // Green Cabbages
  const carrotMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 }); // Orange Carrots
  const sackMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.9 }); // Jute sack

  stallPositions.forEach((pos, idx) => {
    const stall = new THREE.Group();

    // 4 Bamboo Corner Posts
    for (const px of [-3.2, 3.2]) {
      for (const pz of [-2.2, 2.2]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6), woodMat);
        post.position.set(px, 1.6, pz);
        post.castShadow = true;
        stall.add(post);
      }
    }

    // Sloped Canopy Roof
    const canopyMat = new THREE.MeshStandardMaterial({
      color: stallCanopyColors[idx].main,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(4.4, 1.4, 4), canopyMat);
    canopy.position.set(0, 3.4, 0);
    canopy.rotation.y = Math.PI / 4;
    canopy.scale.set(1.1, 0.8, 0.8);
    canopy.castShadow = true;
    stall.add(canopy);

    // Display Wooden Tables
    const table1 = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.8, 1.8), woodMat);
    table1.position.set(0, 0.8, 0);
    table1.castShadow = true;
    stall.add(table1);

    // Produce Crates with Vegetables
    // Tomatoes Crate
    const crate1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.4), woodMat);
    crate1.position.set(-1.8, 1.35, 0);
    stall.add(crate1);
    for (let tx = -0.5; tx <= 0.5; tx += 0.35) {
      for (let tz = -0.4; tz <= 0.4; tz += 0.35) {
        const tomato = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), tomatoMat);
        tomato.position.set(-1.8 + tx, 1.55, tz);
        stall.add(tomato);
      }
    }

    // Eggplants / Brinjal Crate (বেগুন)
    const crate2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.4), woodMat);
    crate2.position.set(0, 1.35, 0);
    stall.add(crate2);
    for (let ex = -0.45; ex <= 0.45; ex += 0.4) {
      const eggplant = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.45, 6), eggplantMat);
      eggplant.rotation.z = Math.PI / 2;
      eggplant.position.set(ex, 1.55, 0);
      stall.add(eggplant);
    }

    // Pumpkins / Gourds Crate (মিষ্টি কুমড়া)
    const crate3 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.4), woodMat);
    crate3.position.set(1.8, 1.35, 0);
    stall.add(crate3);
    for (const px of [-0.4, 0.4]) {
      const pumpkin = new THREE.Mesh(
        idx % 2 === 0 ? new THREE.SphereGeometry(0.24, 8, 6) : new THREE.DodecahedronGeometry(0.22, 0),
        idx % 2 === 0 ? pumpkinMat : cabbageMat
      );
      pumpkin.scale.set(1.2, 0.85, 1.2);
      pumpkin.position.set(1.8 + px, 1.6, 0);
      stall.add(pumpkin);
    }

    // Sacks of Potatoes on Ground
    for (const sx of [-2.4, 2.4]) {
      const sack = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.7, 8), sackMat);
      sack.position.set(sx, 0.35, 1.6);
      sack.castShadow = true;
      stall.add(sack);
    }

    // Hanging Tungsten Bulb Light
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.5 })
    );
    bulb.position.set(0, 2.7, 0);
    stall.add(bulb);

    stall.position.set(pos.sx, 0.15, pos.sz);
    stall.rotation.y = pos.rot;
    bazaarGrp.add(stall);
  });

  // Bazaar Entrance Signpost ("কৃষক বাজার / FRESH VEGGIE HAAT")
  const signPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 6), woodMat);
  signPillar.position.set(0, 1.6, 11);
  bazaarGrp.add(signPillar);

  const bazaarSignBoard = new THREE.Mesh(
    new THREE.BoxGeometry(7, 1.2, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x166534 })
  );
  bazaarSignBoard.position.set(0, 2.8, 11);
  bazaarGrp.add(bazaarSignBoard);

  const signTextStripe = new THREE.Mesh(
    new THREE.BoxGeometry(6.6, 0.6, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.6 })
  );
  signTextStripe.position.set(0, 2.8, 11.02);
  bazaarGrp.add(signTextStripe);

  bazaarGrp.position.set(bazX, bazY, bazZ);
  group.add(bazaarGrp);

  // =========================================================================
  // 8. INTERCONNECTED ROAD NETWORK MESHES & BRIDGES
  // =========================================================================
  // 8A. Main National Expressway N5 (North to South at x = 20, z: -370 to +370)
  const n5Geo = new THREE.PlaneGeometry(12, 740, 4, 120);
  n5Geo.rotateX(-Math.PI / 2);
  const n5Pos = n5Geo.attributes.position;
  for (let i = 0; i < n5Pos.count; i++) {
    const rx = n5Pos.getX(i) + 20;
    const rz = n5Pos.getZ(i);
    const ry = getElevationAt(rx, rz) + 0.06;
    n5Pos.setX(i, rx);
    n5Pos.setY(i, ry);
  }
  n5Geo.computeVertexNormals();
  const n5Mesh = new THREE.Mesh(n5Geo, roadMat);
  n5Mesh.receiveShadow = true;
  group.add(n5Mesh);

  // 8B. City Central East-West Boulevard (z = -10, x: -140 to 210)
  const cityRdGeo = new THREE.PlaneGeometry(12, 350, 4, 60);
  cityRdGeo.rotateX(-Math.PI / 2);
  cityRdGeo.rotateY(Math.PI / 2);
  const cityRdPos = cityRdGeo.attributes.position;
  for (let i = 0; i < cityRdPos.count; i++) {
    const rx = cityRdPos.getX(i) + 35;
    const rz = cityRdPos.getZ(i) - 10;
    const ry = getElevationAt(rx, rz) + 0.07;
    cityRdPos.setX(i, rx);
    cityRdPos.setY(i, ry);
    cityRdPos.setZ(i, rz);
  }
  cityRdGeo.computeVertexNormals();
  const cityRdMesh = new THREE.Mesh(cityRdGeo, roadMat);
  cityRdMesh.receiveShadow = true;
  group.add(cityRdMesh);

  // 8C. Airport Highway Connector (diagonal road from (20, 100) to (180, 200))
  const airpRdPoints = [
    new THREE.Vector3(20, getElevationAt(20, 100) + 0.08, 100),
    new THREE.Vector3(80, getElevationAt(80, 140) + 0.08, 140),
    new THREE.Vector3(140, getElevationAt(140, 175) + 0.08, 175),
    new THREE.Vector3(180, getElevationAt(180, 200) + 0.08, 200),
  ];
  const airpCurve = new THREE.CatmullRomCurve3(airpRdPoints);
  const airpRdGeo = new THREE.TubeGeometry(airpCurve, 30, 4.5, 4, false);
  airpRdGeo.scale(1, 0.05, 1);
  const airpRdMesh = new THREE.Mesh(airpRdGeo, roadMat);
  airpRdMesh.receiveShadow = true;
  group.add(airpRdMesh);

  // 8D. GRAND CABLE-STAYED RIVER BRIDGE (Crossing Karatoya River at x = 160, z = -10)
  const bridgeGrp = new THREE.Group();
  const brX = 160;
  const brZ = -10;
  const brY = 3.2; // Elevated deck height

  // River Foundation Piers (Padma Bridge style circular concrete caissons)
  for (const px of [135, 160, 185]) {
    const pier = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.2, 16, 16), concreteMat);
    pier.position.set(px, -3, brZ);
    pier.castShadow = true;
    bridgeGrp.add(pier);

    // River Navigation Warning Beacon Light (Red / Green)
    const navLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.5 })
    );
    navLight.position.set(px, 1.2, brZ + 7);
    bridgeGrp.add(navLight);
  }

  // Double-deck Bridge Girder & Road Deck (Length 70m, Width 14m)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(68, 2.2, 13.5), concreteMat);
  deck.position.set(brX, brY, brZ);
  deck.castShadow = true;
  deck.receiveShadow = true;
  bridgeGrp.add(deck);

  // Road Asphalt Layer on Deck
  const deckAsphalt = new THREE.Mesh(new THREE.PlaneGeometry(67, 12), roadMat);
  deckAsphalt.rotateX(-Math.PI / 2);
  deckAsphalt.rotateY(Math.PI / 2);
  deckAsphalt.position.set(brX, brY + 1.15, brZ);
  deckAsphalt.receiveShadow = true;
  bridgeGrp.add(deckAsphalt);

  // Central Diamond Cable-Stayed Pylon Tower (Height 34m)
  const pylonMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.2 });
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

  for (const pylonZ of [brZ - 6.5, brZ + 6.5]) {
    const pylonCol1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.4, 32, 12), pylonMat);
    pylonCol1.position.set(brX - 2.5, brY + 16, pylonZ);
    pylonCol1.rotation.z = -0.08;
    pylonCol1.castShadow = true;
    bridgeGrp.add(pylonCol1);

    const pylonCol2 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.4, 32, 12), pylonMat);
    pylonCol2.position.set(brX + 2.5, brY + 16, pylonZ);
    pylonCol2.rotation.z = 0.08;
    pylonCol2.castShadow = true;
    bridgeGrp.add(pylonCol2);

    // Cross beam near top
    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 1.2), pylonMat);
    crossBeam.position.set(brX, brY + 24, pylonZ);
    bridgeGrp.add(crossBeam);

    // High-tensile Stay Cables fan
    for (let c = 1; c <= 5; c++) {
      const cableOffset = c * 5.8;
      const stayAngleLeft = Math.atan2(cableOffset, 22);
      const cableLen = Math.hypot(cableOffset, 22);

      const cableL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, cableLen, 6), cableMat);
      cableL.position.set(brX - cableOffset / 2, brY + 13, pylonZ);
      cableL.rotation.z = -stayAngleLeft;
      bridgeGrp.add(cableL);

      const cableR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, cableLen, 6), cableMat);
      cableR.position.set(brX + cableOffset / 2, brY + 13, pylonZ);
      cableR.rotation.z = stayAngleLeft;
      bridgeGrp.add(cableR);
    }
  }

  // Bridge Guardrails & Lampposts
  for (const gz of [brZ - 6.5, brZ + 6.5]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(68, 1.1, 0.4), steelMat);
    rail.position.set(brX, brY + 1.6, gz);
    bridgeGrp.add(rail);

    // Lampposts across bridge
    for (let lx = brX - 28; lx <= brX + 28; lx += 14) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.8, 6), steelMat);
      pole.position.set(lx, brY + 3.0, gz);
      bridgeGrp.add(pole);

      const lightHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.6 })
      );
      lightHead.position.set(lx, brY + 4.9, gz);
      bridgeGrp.add(lightHead);
    }
  }

  // 8D-2. SOUTHERN DELTA PRESTRESSED CONCRETE BOX GIRDER BRIDGE (At (120, 240))
  const southBridge = new THREE.Group();
  const sbrX = 120;
  const sbrZ = 240;
  const sbrY = 2.4;

  // Concrete Piers
  for (const px of [sbrX - 18, sbrX, sbrX + 18]) {
    const sPier = new THREE.Mesh(new THREE.BoxGeometry(3.5, 12, 10), concreteMat);
    sPier.position.set(px, -2, sbrZ);
    sPier.castShadow = true;
    southBridge.add(sPier);
  }

  // Concrete Bridge Span Box Girders
  const sDeck = new THREE.Mesh(new THREE.BoxGeometry(54, 2.0, 11), concreteMat);
  sDeck.position.set(sbrX, sbrY, sbrZ);
  sDeck.castShadow = true;
  sDeck.receiveShadow = true;
  southBridge.add(sDeck);

  // Parapets
  for (const pz of [sbrZ - 5.2, sbrZ + 5.2]) {
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(54, 1.1, 0.5), concreteMat);
    parapet.position.set(sbrX, sbrY + 1.2, pz);
    southBridge.add(parapet);
  }

  bridgeGrp.add(southBridge);
  group.add(bridgeGrp);

  // =========================================================================
  // 8E. SUBTERRANEAN MOUNTAIN HIGHWAY TUNNEL (Bangabandhu Subterranean style at (-220, -240))
  // =========================================================================
  const tunnelGrp = new THREE.Group();
  const tunY = 6.5;

  // Reinforced Concrete Portals (Entrance at x = -150 and Exit at x = -280)
  const portalPositions = [
    { px: -150, pz: -230, rot: -0.2 },
    { px: -280, pz: -230, rot: Math.PI + 0.2 },
  ];

  portalPositions.forEach(({ px, pz, rot }) => {
    const portal = new THREE.Group();

    // Heavy Concrete Portal Arch Retaining Wall
    const archFrame = new THREE.Mesh(
      new THREE.BoxGeometry(22, 14, 6),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 })
    );
    archFrame.position.set(0, 7, 0);
    archFrame.castShadow = true;
    portal.add(archFrame);

    // Tunnel Arch Cutout Surround Lining
    const archRoof = new THREE.Mesh(
      new THREE.CylinderGeometry(8.2, 8.2, 6.2, 24, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
    );
    archRoof.position.set(0, 8.2, 0);
    archRoof.rotation.z = Math.PI;
    archRoof.rotation.y = Math.PI / 2;
    portal.add(archRoof);

    // High-visibility Hazard Chevrons (Yellow & Black stripes)
    const chevronMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.5 });
    const chevron = new THREE.Mesh(new THREE.BoxGeometry(20, 0.9, 6.4), chevronMat);
    chevron.position.set(0, 13.2, 0);
    portal.add(chevron);

    // Electronic LED Warning Overhead Signboard
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(14, 2.0, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    signBoard.position.set(0, 11.5, 3.2);
    portal.add(signBoard);

    const signLed = new THREE.Mesh(
      new THREE.BoxGeometry(13, 1.4, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.4 })
    );
    signLed.position.set(0, 11.5, 3.22);
    portal.add(signLed);

    portal.position.set(px, tunY, pz);
    portal.rotation.y = rot;
    tunnelGrp.add(portal);
  });

  // Subterranean Tunnel Roadway Bore
  const tunnelRoadPoints = [
    new THREE.Vector3(-148, tunY + 0.1, -230),
    new THREE.Vector3(-215, tunY + 0.1, -245),
    new THREE.Vector3(-282, tunY + 0.1, -230),
  ];
  const tunCurve = new THREE.CatmullRomCurve3(tunnelRoadPoints);
  const tunRoadGeo = new THREE.TubeGeometry(tunCurve, 40, 5.2, 4, false);
  tunRoadGeo.scale(1, 0.04, 1);
  const tunRoadMesh = new THREE.Mesh(tunRoadGeo, roadMat);
  tunnelGrp.add(tunRoadMesh);

  // Subterranean Concrete Enclosure Tube (Structural Arch Tube Lining)
  const tunLiningGeo = new THREE.TubeGeometry(tunCurve, 40, 7.8, 16, false);
  const tunLiningMesh = new THREE.Mesh(
    tunLiningGeo,
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, side: THREE.BackSide })
  );
  tunnelGrp.add(tunLiningMesh);

  // Jet Fan Air Exhaust Units (Subterranean Tunnel Ventilation)
  const fanMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
  for (const fProgress of [0.25, 0.5, 0.75]) {
    const fPt = tunCurve.getPointAt(fProgress);
    if (fPt) {
      const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3.5, 12), fanMat);
      fan.rotation.x = Math.PI / 2;
      fan.position.set(fPt.x, tunY + 6.6, fPt.z);
      tunnelGrp.add(fan);
    }
  }

  // Interior Tunnel Lighting Array (Yellow Sodium Lamps along tunnel roof)
  for (let tx = -270; tx <= -160; tx += 15) {
    const rawU = Math.max(0, Math.min(1, (-tx - 160) / 110));
    const tPt = tunCurve.getPointAt(rawU);
    if (tPt) {
      const lamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 1.8, 8),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.8 })
      );
      lamp.rotation.z = Math.PI / 2;
      lamp.position.set(tPt.x, tunY + 6.2, tPt.z);
      tunnelGrp.add(lamp);
    }
  }

  group.add(tunnelGrp);

  // =========================================================================
  // 9. LUSH 3D VEGETATION (Mountain Pines, Delta Palms, Broadleaf Trees)
  // =========================================================================
  const vegGrp = new THREE.Group();

  // Helper A: Pine / Conifer Tree (For mountain hills)
  const pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const pineNeedleMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.7 });

  const createPineTree = (x: number, z: number, scale = 1) => {
    const y = getElevationAt(x, z);
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.4 * scale, 3.5 * scale, 6), pineTrunkMat);
    trunk.position.y = 1.75 * scale;
    trunk.castShadow = true;
    tree.add(trunk);

    for (let c = 0; c < 3; c++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry((2.2 - c * 0.5) * scale, 3.2 * scale, 7),
        pineNeedleMat
      );
      cone.position.y = (3.2 + c * 2.2) * scale;
      cone.castShadow = true;
      tree.add(cone);
    }

    tree.position.set(x, y, z);
    vegGrp.add(tree);
  };

  // Helper B: Coconut Palm Tree (For delta plains, rivers, and villages)
  const palmTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4d3c, roughness: 0.9 });
  const palmFrondMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, side: THREE.DoubleSide });

  const createPalmTree = (x: number, z: number, scale = 1) => {
    const y = getElevationAt(x, z);
    const palm = new THREE.Group();

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 9 * scale, 6), palmTrunkMat);
    trunk.position.y = 4.5 * scale;
    trunk.rotation.z = 0.08;
    trunk.castShadow = true;
    palm.add(trunk);

    for (let f = 0; f < 6; f++) {
      const angle = (f * Math.PI * 2) / 6;
      const frond = new THREE.Mesh(new THREE.BoxGeometry(3.5 * scale, 0.1, 0.9 * scale), palmFrondMat);
      frond.position.set(Math.cos(angle) * 1.5 * scale, 9 * scale, Math.sin(angle) * 1.5 * scale);
      frond.rotation.y = angle;
      frond.rotation.z = -0.3;
      palm.add(frond);
    }

    palm.position.set(x, y, z);
    vegGrp.add(palm);
  };

  // Helper C: Broadleaf Rain Tree / Banyan Tree
  const broadleafMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
  const createBroadleafTree = (x: number, z: number, scale = 1) => {
    const y = getElevationAt(x, z);
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 4.0 * scale, 7), pineTrunkMat);
    trunk.position.y = 2.0 * scale;
    trunk.castShadow = true;
    tree.add(trunk);

    const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2 * scale, 1), broadleafMat);
    canopy.position.y = 5.2 * scale;
    canopy.castShadow = true;
    tree.add(canopy);

    tree.position.set(x, y, z);
    vegGrp.add(tree);
  };

  // =========================================================================
  // 10. MEGA DEEP SEA PORT & CONTAINER TERMINAL (At (250, 60))
  // =========================================================================
  const seaPortGrp = new THREE.Group();
  const spX = 250;
  const spZ = 60;
  const spY = 1.0;

  // Concrete Quayside Wharf Berth (Padma/Chittagong Port style)
  const wharfGeo = new THREE.BoxGeometry(110, 3.2, 50);
  const wharfMesh = new THREE.Mesh(wharfGeo, darkConcreteMat);
  wharfMesh.position.set(0, 0, 0);
  wharfMesh.receiveShadow = true;
  wharfMesh.castShadow = true;
  seaPortGrp.add(wharfMesh);

  // High-visibility Quayside Yellow Safety Edge
  const curbEdge = new THREE.Mesh(
    new THREE.BoxGeometry(110, 0.4, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xfacc15 })
  );
  curbEdge.position.set(0, 1.7, 24.5);
  seaPortGrp.add(curbEdge);

  // STS Quayside Container Gantry Cranes (2 Giant Cranes in Port Red & White)
  const craneMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.7, roughness: 0.3 });
  const craneLegMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.5 });
  const containerColors = [0x2563eb, 0x16a34a, 0xd97706, 0xdc2626, 0x0284c7, 0x475569];

  for (const cx of [-25, 25]) {
    const crane = new THREE.Group();
    // 4 Heavy A-frame Truss Legs
    for (const lx of [-4.5, 4.5]) {
      for (const lz of [-5.5, 5.5]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 26, 8), craneLegMat);
        leg.position.set(lx, 13, lz);
        leg.castShadow = true;
        crane.add(leg);
      }
    }

    // Upper Machine Machinery Room & Boom Beam (Extending over water)
    const machineryHouse = new THREE.Mesh(new THREE.BoxGeometry(12, 4.5, 9), craneMat);
    machineryHouse.position.set(0, 26, -1);
    machineryHouse.castShadow = true;
    crane.add(machineryHouse);

    // Cantilever Outreach Boom (extends 36m over the ship)
    const boomBeam = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.8, 38), craneMat);
    boomBeam.position.set(0, 26.5, 15);
    boomBeam.castShadow = true;
    crane.add(boomBeam);

    // Operator Cabin
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.4, 2.8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
    );
    cabin.position.set(0, 23.5, 10);
    crane.add(cabin);

    // Hoist Cable & Spreader Bar
    const spreader = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.6, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    spreader.position.set(0, 14, 18);
    crane.add(spreader);

    crane.position.set(cx, 1.6, 12);
    seaPortGrp.add(crane);
  }

  // Intermodal Container Stacks in Port Yard (ISO Standard 20ft & 40ft containers)
  for (let row = -4; row <= 4; row++) {
    for (let col = -1; col <= 2; col++) {
      const stackHeight = 1 + Math.floor(Math.abs(Math.sin(row * 3.7 + col)) * 3);
      for (let h = 0; h < stackHeight; h++) {
        const cColor = containerColors[(Math.abs(row * 5 + col * 3 + h)) % containerColors.length];
        const container = new THREE.Mesh(
          new THREE.BoxGeometry(9.2, 2.6, 3.8),
          new THREE.MeshStandardMaterial({ color: cColor, roughness: 0.6, metalness: 0.3 })
        );
        container.position.set(row * 11, 1.6 + 1.3 + h * 2.65, -12 + col * 4.6);
        container.castShadow = true;
        container.receiveShadow = true;
        seaPortGrp.add(container);
      }
    }
  }

  // Ocean Cargo Container Vessel (Moored at Port Berth)
  const shipGrp = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.4 });
  const redKeelMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6 });

  // Ship Lower Keel & Main Hull
  const shipHull = new THREE.Mesh(new THREE.BoxGeometry(78, 6.5, 16), hullMat);
  shipHull.position.set(0, 0.5, 0);
  shipHull.castShadow = true;
  shipGrp.add(shipHull);

  const shipKeel = new THREE.Mesh(new THREE.BoxGeometry(76, 2.5, 14), redKeelMat);
  shipKeel.position.set(0, -3.2, 0);
  shipGrp.add(shipKeel);

  // Bow Bulbous Nose
  const shipBow = new THREE.Mesh(new THREE.ConeGeometry(8, 16, 4), hullMat);
  shipBow.position.set(43, 0.5, 0);
  shipBow.rotation.z = -Math.PI / 2;
  shipBow.rotation.y = Math.PI / 4;
  shipGrp.add(shipBow);

  // Bridge Superstructure & Radar Mast (Aft accommodation)
  const superStructure = new THREE.Mesh(new THREE.BoxGeometry(14, 12, 14), whiteMat);
  superStructure.position.set(-26, 8.5, 0);
  superStructure.castShadow = true;
  shipGrp.add(superStructure);

  // Wheelhouse Navigation Bridge with Green Glass Windows
  const wheelhouse = new THREE.Mesh(
    new THREE.BoxGeometry(16, 3.2, 11),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 })
  );
  wheelhouse.position.set(-26, 14.5, 0);
  shipGrp.add(wheelhouse);

  // Ship Funnel Smoke Exhaust Stack
  const shipFunnel = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.8, 6.5, 12),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 })
  );
  shipFunnel.position.set(-30, 18, 0);
  shipGrp.add(shipFunnel);

  // Cargo Containers Loaded on Ship Deck
  for (let sRow = -2; sRow <= 3; sRow++) {
    for (let sCol = -1; sCol <= 1; sCol++) {
      for (let sH = 0; sH < 2; sH++) {
        const scColor = containerColors[(Math.abs(sRow * 3 + sCol + sH)) % containerColors.length];
        const sContainer = new THREE.Mesh(
          new THREE.BoxGeometry(8.5, 2.4, 3.4),
          new THREE.MeshStandardMaterial({ color: scColor, roughness: 0.5 })
        );
        sContainer.position.set(sRow * 9.5, 4.8 + sH * 2.45, sCol * 3.8);
        sContainer.castShadow = true;
        shipGrp.add(sContainer);
      }
    }
  }

  shipGrp.position.set(0, -0.2, 38);
  seaPortGrp.add(shipGrp);

  seaPortGrp.position.set(spX, spY, spZ);
  group.add(seaPortGrp);

  // =========================================================================
  // 11. SUNDARBANS & HILL TRACTS DENSE RAINFOREST (At (160, -140) & (-320, 120))
  // =========================================================================
  const forestGrp = new THREE.Group();
  const forestMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.85 });
  const deepMangroveMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.9 });
  const woodTrunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });

  // Sundarbans Mangrove Cluster (Pneumatophore root trees)
  for (let i = 0; i < 75; i++) {
    const fx = 80 + Math.random() * 150;
    const fz = -180 + Math.random() * 90;
    const fy = getElevationAt(fx, fz);

    const tree = new THREE.Group();
    // Stilt Roots
    for (let r = 0; r < 4; r++) {
      const rootAngle = (r * Math.PI) / 2;
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.2, 5), woodTrunkMat);
      root.position.set(Math.cos(rootAngle) * 0.7, 1.0, Math.sin(rootAngle) * 0.7);
      root.rotation.z = (r % 2 === 0 ? 0.35 : -0.35);
      tree.add(root);
    }

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 5.5, 6), woodTrunkMat);
    trunk.position.y = 3.5;
    tree.add(trunk);

    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(3.6, 1), deepMangroveMat);
    crown.position.y = 6.8;
    crown.scale.set(1.3, 0.8, 1.3);
    crown.castShadow = true;
    tree.add(crown);

    tree.position.set(fx, fy, fz);
    forestGrp.add(tree);
  }

  // Western Tropical Rainforest Cluster
  for (let i = 0; i < 80; i++) {
    const fx = -350 + Math.random() * 160;
    const fz = 60 + Math.random() * 220;
    const fy = getElevationAt(fx, fz);

    const tree = new THREE.Group();
    const tScale = 0.8 + Math.random() * 0.7;

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * tScale, 0.5 * tScale, 6.0 * tScale, 6), woodTrunkMat);
    trunk.position.y = 3.0 * tScale;
    tree.add(trunk);

    const foliage1 = new THREE.Mesh(new THREE.DodecahedronGeometry(4.2 * tScale, 1), forestMat);
    foliage1.position.y = 6.5 * tScale;
    foliage1.castShadow = true;
    tree.add(foliage1);

    const foliage2 = new THREE.Mesh(new THREE.DodecahedronGeometry(3.0 * tScale, 1), deepMangroveMat);
    foliage2.position.set(0.8 * tScale, 8.4 * tScale, 0);
    foliage2.castShadow = true;
    tree.add(foliage2);

    tree.position.set(fx, fy, fz);
    forestGrp.add(tree);
  }

  group.add(forestGrp);

  // Place Mountain Pines across Northern Mountains
  for (let i = 0; i < 45; i++) {
    const px = -350 + Math.random() * 260;
    const pz = -360 + Math.random() * 200;
    createPineTree(px, pz, 0.9 + Math.random() * 0.6);
  }

  // Place Palms along village, river banks, and roadside
  for (let i = 0; i < 60; i++) {
    const px = -300 + Math.random() * 500;
    const pz = -180 + Math.random() * 450;
    // Skip placing inside city core or runway
    if (Math.hypot(px - 20, pz - (-10)) < 90) continue;
    if (px > 100 && px < 260 && pz > 120 && pz < 280) continue;

    if (Math.random() > 0.45) {
      createPalmTree(px, pz, 0.9 + Math.random() * 0.5);
    } else {
      createBroadleafTree(px, pz, 0.8 + Math.random() * 0.6);
    }
  }

  group.add(vegGrp);

  // Mount Comprehensive Reference Infrastructure (Hospital, Construction Site, Mosque/Temple, Park, Gas Station, Flyover, Power Plant, Farmlands)
  const richInfra = buildRichInfrastructure(getElevationAt);
  group.add(richInfra.group);

  // Mount National Expansion Infrastructure (Railway Line, Metro Rail, Deep Sea Port, Forests, Hills, Tea Highlands & Connected Roads)
  const countryExpansion = buildCountryExpansion(getElevationAt);
  group.add(countryExpansion.group);

  // 10km National Grid High-Voltage Transmission Towers
  const gridPylonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
  const pylonGeo = new THREE.CylinderGeometry(0.8, 3.2, 45, 4);
  const pylonCrossGeo = new THREE.BoxGeometry(22, 1.2, 1.2);

  for (let pz = -4400; pz <= 4400; pz += 400) {
    if (Math.abs(pz) < 200) continue; // skip core substation area
    const px = -65;
    const py = getElevationAt(px, pz);

    const tower = new THREE.Group();
    const mast = new THREE.Mesh(pylonGeo, gridPylonMat);
    mast.position.y = 22.5;
    tower.add(mast);

    const cross1 = new THREE.Mesh(pylonCrossGeo, gridPylonMat);
    cross1.position.y = 36;
    tower.add(cross1);

    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(16, 1.0, 1.0), gridPylonMat);
    cross2.position.y = 42;
    tower.add(cross2);

    tower.position.set(px, py, pz);
    group.add(tower);
  }

  // Distant Northern Mountain Wind Turbines (10km Horizon)
  const distantTurbinePositions = [
    [-800, -1200],
    [-1400, -1800],
    [-2200, -2600],
    [-3000, -3400],
    [-1800, -3200],
    [-600, -2200],
  ];

  distantTurbinePositions.forEach(([tx, tz]) => {
    const ty = getElevationAt(tx, tz);
    const dt = new THREE.Group();
    const dTower = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 3.5, 75, 8), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 }));
    dTower.position.y = 37.5;
    dt.add(dTower);

    const dNacelle = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 9), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    dNacelle.position.y = 75;
    dt.add(dNacelle);

    const dRotor = new THREE.Group();
    dRotor.position.set(0, 75, 4.5);
    for (let b = 0; b < 3; b++) {
      const dBlade = new THREE.Mesh(new THREE.BoxGeometry(1.2, 32, 0.4), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      dBlade.position.y = 16;
      const bGrp = new THREE.Group();
      bGrp.rotation.z = (b * Math.PI * 2) / 3;
      bGrp.add(dBlade);
      dRotor.add(bGrp);
    }
    dt.add(dRotor);
    (dt as unknown as { rotorHub: THREE.Group }).rotorHub = dRotor;
    dt.position.set(tx, ty, tz);
    group.add(dt);
    windTurbines.push(dt);
  });

  const updateAnimations = (time: number, delta: number) => {
    // 1. Rotate Wind Turbine Rotors
    windTurbines.forEach((wt, idx) => {
      const hub = (wt as unknown as { rotorHub?: THREE.Group }).rotorHub;
      if (hub) {
        hub.rotation.z += (1.2 + idx * 0.1) * delta;
      }
    });

    // 2. Rotate Airport ATC Radar
    if (radarDish) {
      radarDish.rotation.y += 2.4 * delta;
    }

    // 3. Update Rich Infrastructure Effects (Chimney Steam / Industrial Plumes)
    richInfra.updateAnimation(time, delta);

    // 4. Update Railway Trains, Metro MRT line, and Lighthouse Light Beam
    countryExpansion.updateAnimation(time, delta);
  };

  return {
    group,
    windTurbines,
    radarDish,
    streetLights,
    updateAnimations,
  };
}
