import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';
import { registerSolidBuilding } from './buildingCollisions';

export interface RuralVillageInstance {
  group: THREE.Group;
  update: (time: number, delta: number) => void;
}

/**
 * Traditional Bangladeshi Rural Village & Agricultural Landscape
 * Location: North-West & Far-East Agrarian Belts (X: -2600 to -1200, Z: -4600 to -3400)
 * Features:
 * - Serpentine Clay / Herringbone Red-Brick Village Roads (কাঁচা ও হেরিংবোন ইটের রাস্তা)
 * - Raised Mud-Plinth Tin-Roof Homesteads (মাটির ভিটি ও ঢেউখেলানো টিনের চালের বাড়ি)
 * - Golden & Lush Green Paddy Fields (সোনালী ও সবুজ ধানক্ষেত)
 * - Village Lotus Pond & Stepped Bathing Ghat (পুকুর ও পাকা সানবাঁধানো ঘাট)
 * - Hand Tube-well (নলকূপ), Cow Sheds (গোয়ালঘর), and Haystacks (খড়ের গাদা)
 */
export function buildRuralVillageArea(): RuralVillageInstance {
  const group = new THREE.Group();
  group.name = 'rural_village_agrarian_landscape';

  // =========================================================================
  // MATERIALS
  // =========================================================================
  const clayRoadMat = new THREE.MeshStandardMaterial({
    color: 0x92400e, // Warm earthenware clay
    roughness: 0.95,
  });

  const brickRoadMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c, // Red terracotta herringbone brick
    roughness: 0.9,
  });

  const mudPlinthMat = new THREE.MeshStandardMaterial({
    color: 0x78350f, // Earthen mud foundation
    roughness: 0.9,
  });

  const tinRoofSilver = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Corrugated zinc/tin sheet
    metalness: 0.8,
    roughness: 0.35,
  });

  const tinRoofRust = new THREE.MeshStandardMaterial({
    color: 0xc2410c, // Weathered rusty red tin roof
    metalness: 0.6,
    roughness: 0.5,
  });

  const bambooWallMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Woven bamboo / timber wall
    roughness: 0.85,
  });

  const paddyGreenMat = new THREE.MeshStandardMaterial({
    color: 0x65a30d, // Lush emerald young rice paddy
    roughness: 0.9,
  });

  const paddyGoldenMat = new THREE.MeshStandardMaterial({
    color: 0xeab308, // Ripe golden harvest paddy
    roughness: 0.85,
  });

  const haystackMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Dry straw haystack
    roughness: 0.95,
  });

  const ghatConcreteMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1, // Concrete/brick stepped bathing ghat
    roughness: 0.8,
  });

  const tubeWellMat = new THREE.MeshStandardMaterial({
    color: 0x059669, // Green cast-iron hand pump
    metalness: 0.6,
    roughness: 0.4,
  });

  // =========================================================================
  // 1. SERPENTINE RURAL VILLAGE ROADS (Clay & Herringbone Brick)
  // =========================================================================
  const roadWaypoints = [
    [-2400, -3400],
    [-2200, -3650],
    [-1950, -3800],
    [-1750, -4100],
    [-1500, -4350],
    [-1300, -4650],
  ];

  for (let r = 0; r < roadWaypoints.length - 1; r++) {
    const p1 = roadWaypoints[r];
    const p2 = roadWaypoints[r + 1];

    const dx = p2[0] - p1[0];
    const dz = p2[1] - p1[1];
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);

    const midX = (p1[0] + p2[0]) / 2;
    const midZ = (p1[1] + p2[1]) / 2;
    const midY = calcMasterPlanElevation(midX, midZ) + 0.12;

    // Road strip (Width 5.5m)
    const roadGeo = new THREE.PlaneGeometry(5.5, len);
    const roadMesh = new THREE.Mesh(roadGeo, r % 2 === 0 ? clayRoadMat : brickRoadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.rotation.z = -angle;
    roadMesh.position.set(midX, midY, midZ);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);
  }

  // Branch road towards village center & pond
  const branchWaypoints = [
    [-1950, -3800],
    [-1850, -3700],
    [-1650, -3600],
    [-1450, -3550],
  ];

  for (let r = 0; r < branchWaypoints.length - 1; r++) {
    const p1 = branchWaypoints[r];
    const p2 = branchWaypoints[r + 1];
    const dx = p2[0] - p1[0];
    const dz = p2[1] - p1[1];
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);

    const midX = (p1[0] + p2[0]) / 2;
    const midZ = (p1[1] + p2[1]) / 2;
    const midY = calcMasterPlanElevation(midX, midZ) + 0.12;

    const roadGeo = new THREE.PlaneGeometry(4.5, len);
    const roadMesh = new THREE.Mesh(roadGeo, clayRoadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.rotation.z = -angle;
    roadMesh.position.set(midX, midY, midZ);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);
  }

  // =========================================================================
  // 2. GOLDEN & EMERALD PADDY FIELDS (ধানের জমি ও আইল)
  // =========================================================================
  const paddyPlots = [
    { x: -2450, z: -3700, w: 180, d: 140, type: 'green' },
    { x: -2250, z: -3900, w: 160, d: 150, type: 'golden' },
    { x: -2050, z: -4150, w: 190, d: 160, type: 'green' },
    { x: -1800, z: -4400, w: 210, d: 180, type: 'golden' },
    { x: -1500, z: -4600, w: 220, d: 190, type: 'green' },
    { x: -1750, z: -3400, w: 150, d: 130, type: 'golden' },
    { x: -1450, z: -3750, w: 180, d: 150, type: 'green' },
  ];

  paddyPlots.forEach((plot) => {
    const y = calcMasterPlanElevation(plot.x, plot.z) + 0.06;
    const mat = plot.type === 'green' ? paddyGreenMat : paddyGoldenMat;
    const plotMesh = new THREE.Mesh(new THREE.PlaneGeometry(plot.w, plot.d), mat);
    plotMesh.rotation.x = -Math.PI / 2;
    plotMesh.position.set(plot.x, y, plot.z);
    plotMesh.receiveShadow = true;
    group.add(plotMesh);

    // Earthen Ridge (আইল) borders around plot
    const ridgeGeo1 = new THREE.BoxGeometry(plot.w, 0.4, 1.2);
    const ridge1 = new THREE.Mesh(ridgeGeo1, mudPlinthMat);
    ridge1.position.set(plot.x, y + 0.2, plot.z - plot.d / 2);
    group.add(ridge1);

    const ridge2 = ridge1.clone();
    ridge2.position.z = plot.z + plot.d / 2;
    group.add(ridge2);

    const ridgeGeo2 = new THREE.BoxGeometry(1.2, 0.4, plot.d);
    const ridge3 = new THREE.Mesh(ridgeGeo2, mudPlinthMat);
    ridge3.position.set(plot.x - plot.w / 2, y + 0.2, plot.z);
    group.add(ridge3);

    const ridge4 = ridge3.clone();
    ridge4.position.x = plot.x + plot.w / 2;
    group.add(ridge4);
  });

  // =========================================================================
  // 3. VILLAGE LOTUS POND WITH STEPPED BATHING GHAT (পুকুর ও সানবাঁধানো ঘাট)
  // =========================================================================
  const pondCenterX = -1600;
  const pondCenterZ = -3650;
  const pondY = calcMasterPlanElevation(pondCenterX, pondCenterZ);

  // Stepped Ghat (সানবাঁধানো পাকা ঘাট)
  const ghatGrp = new THREE.Group();
  ghatGrp.position.set(pondCenterX + 42, pondY, pondCenterZ);

  for (let s = 0; s < 6; s++) {
    const stepMesh = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.4, 2.0),
      ghatConcreteMat
    );
    stepMesh.position.set(-s * 1.6, -s * 0.35 + 1.2, 0);
    stepMesh.castShadow = true;
    stepMesh.receiveShadow = true;
    ghatGrp.add(stepMesh);
  }

  // Ghat side pillars with terracotta finials
  for (const gz of [-6, 6]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.8, 1.2), ghatConcreteMat);
    pillar.position.set(1.0, 1.4, gz);
    ghatGrp.add(pillar);
  }
  group.add(ghatGrp);

  // =========================================================================
  // 4. TRADITIONAL HOMESTEADS (বাড়ি), TIN ROOFS, HAYSTACKS & TUBE-WELLS
  // =========================================================================
  const villageHomesteads = [
    { x: -2100, z: -3700, rot: 0.2 },
    { x: -2050, z: -3650, rot: -0.4 },
    { x: -1900, z: -3900, rot: 0.8 },
    { x: -1850, z: -3950, rot: 0.1 },
    { x: -1700, z: -4200, rot: -0.6 },
    { x: -1650, z: -4150, rot: 0.4 },
    { x: -1400, z: -4450, rot: 0.3 },
    { x: -1350, z: -4500, rot: -0.2 },
    { x: -1700, z: -3750, rot: 0.5 },
    { x: -1550, z: -3550, rot: -0.3 },
  ];

  villageHomesteads.forEach((home, idx) => {
    const homeGrp = new THREE.Group();
    const y = calcMasterPlanElevation(home.x, home.z);
    homeGrp.position.set(home.x, y, home.z);
    homeGrp.rotation.y = home.rot;

    // 1. Raised Mud Plinth Yard (ভিটি)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(22, 0.75, 18), mudPlinthMat);
    plinth.position.y = 0.375;
    plinth.receiveShadow = true;
    homeGrp.add(plinth);

    // 2. Main Dwelling Hut (ঘর)
    const hutW = 8.5;
    const hutD = 6.0;
    const hutH = 3.2;

    const walls = new THREE.Mesh(new THREE.BoxGeometry(hutW, hutH, hutD), bambooWallMat);
    walls.position.set(0, 0.75 + hutH / 2, 0);
    walls.castShadow = true;
    homeGrp.add(walls);

    // Pitched Corrugated Tin Roof (চালা)
    const roofGeo = new THREE.ConeGeometry(6.5, 2.2, 4);
    const roofMat = idx % 3 === 0 ? tinRoofRust : tinRoofSilver;
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 0.75 + hutH + 1.1, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.2, 1.0, 0.9);
    roof.castShadow = true;
    homeGrp.add(roof);

    // Register Solid Building collision box
    registerSolidBuilding({
      id: `rural_hut_${idx}`,
      name: `Rural Homestead House #${idx + 1}`,
      minX: home.x - 5,
      maxX: home.x + 5,
      minZ: home.z - 4,
      maxZ: home.z + 4,
      topY: y + 0.75 + hutH + 2.2,
      baseY: y,
    });

    // 3. Side Kitchen / Cow Shed (রান্নাঘর / গোয়ালঘর)
    const shed = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 2.2, 4.0),
      bambooWallMat
    );
    shed.position.set(7.5, 0.75 + 1.1, 2.0);
    shed.castShadow = true;
    homeGrp.add(shed);

    const shedRoof = new THREE.Mesh(new THREE.ConeGeometry(4.0, 1.4, 4), roofMat);
    shedRoof.position.set(7.5, 0.75 + 2.2 + 0.7, 2.0);
    shedRoof.rotation.y = Math.PI / 4;
    shedRoof.scale.set(1.1, 1.0, 0.85);
    homeGrp.add(shedRoof);

    // 4. Straw Haystack (খড়ের গাদা)
    const haystack = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.8, 12), haystackMat);
    haystack.position.set(-7.5, 0.75 + 1.9, -4.5);
    haystack.castShadow = true;
    homeGrp.add(haystack);

    // 5. Cast-Iron Hand Tube-Well (নলকূপ)
    const twBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 12), ghatConcreteMat);
    twBase.position.set(-6.5, 0.75 + 0.1, 4.5);
    homeGrp.add(twBase);

    const twPump = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.4, 8), tubeWellMat);
    twPump.position.set(-6.5, 0.75 + 0.9, 4.5);
    homeGrp.add(twPump);

    const twHandle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.9), tubeWellMat);
    twHandle.position.set(-6.5, 0.75 + 1.3, 4.8);
    twHandle.rotation.x = -0.4;
    homeGrp.add(twHandle);

    group.add(homeGrp);
  });

  const update = (_time: number, _delta: number) => {
    // Static landscape optimizations
  };

  return {
    group,
    update,
  };
}
