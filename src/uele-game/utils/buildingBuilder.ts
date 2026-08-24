import * as THREE from 'three';
import { createCorrugatedTinTexture, createBrickWallTexture } from './terrainTextures';

export interface BuiltSettlements {
  group: THREE.Group;
  lightPoints: THREE.PointLight[];
}

export function buildBangladeshSettlements(getElevationAt: (x: number, z: number) => number): BuiltSettlements {
  const group = new THREE.Group();
  group.name = 'settlements_group';
  const lightPoints: THREE.PointLight[] = [];

  const tinTexSilver = createCorrugatedTinTexture('silver');
  const tinTexBlue = createCorrugatedTinTexture('blue');
  const tinTexRust = createCorrugatedTinTexture('rust');
  const brickTex = createBrickWallTexture();

  // Materials
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.85,
    metalness: 0.05,
  });

  const tinSilverMat = new THREE.MeshStandardMaterial({
    map: tinTexSilver,
    roughness: 0.45,
    metalness: 0.5,
  });

  const tinBlueMat = new THREE.MeshStandardMaterial({
    map: tinTexBlue,
    roughness: 0.45,
    metalness: 0.5,
  });

  const tinRustMat = new THREE.MeshStandardMaterial({
    map: tinTexRust,
    roughness: 0.75,
    metalness: 0.3,
  });

  const brickMat = new THREE.MeshStandardMaterial({
    map: brickTex,
    roughness: 0.9,
    metalness: 0.05,
  });

  const woodVerandaMat = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 0.8,
  });

  const windowGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 0.6,
  });

  // Helper 1: Build Rural Bangladesh Tin-Gable House (Bari house)
  const createRuralHouse = (
    x: number,
    z: number,
    rotY: number,
    w = 6,
    d = 4.5,
    h = 2.8,
    roofType: 'silver' | 'blue' | 'rust' = 'silver'
  ) => {
    const houseGrp = new THREE.Group();
    const y = getElevationAt(x, z);

    // 1. Plinth (raised brick foundation)
    const plinthGeo = new THREE.BoxGeometry(w + 0.4, 0.4, d + 0.4);
    const plinthMesh = new THREE.Mesh(plinthGeo, brickMat);
    plinthMesh.position.y = 0.2;
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    houseGrp.add(plinthMesh);

    // 2. Walls (brick/tin walls)
    const wallGeo = new THREE.BoxGeometry(w, h, d);
    const wallMesh = new THREE.Mesh(wallGeo, brickMat);
    wallMesh.position.y = 0.4 + h / 2;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    houseGrp.add(wallMesh);

    // 3. Veranda / Balcony on front
    const verandaPostGeo = new THREE.CylinderGeometry(0.08, 0.08, h - 0.2, 6);
    const postLeft = new THREE.Mesh(verandaPostGeo, woodVerandaMat);
    postLeft.position.set(-w / 2 + 0.4, 0.4 + (h - 0.2) / 2, d / 2 + 1.2);
    postLeft.castShadow = true;
    houseGrp.add(postLeft);

    const postRight = postLeft.clone();
    postRight.position.x = w / 2 - 0.4;
    houseGrp.add(postRight);

    const verandaRoofGeo = new THREE.BoxGeometry(w + 0.8, 0.08, 1.6);
    const verandaRoofMat = roofType === 'silver' ? tinSilverMat : roofType === 'blue' ? tinBlueMat : tinRustMat;
    const verandaRoof = new THREE.Mesh(verandaRoofGeo, verandaRoofMat);
    verandaRoof.position.set(0, 0.4 + h - 0.2, d / 2 + 0.8);
    verandaRoof.rotation.x = 0.2;
    verandaRoof.castShadow = true;
    houseGrp.add(verandaRoof);

    // 4. Corrugated Tin Gable Roof (slanted triangular roof)
    const roofMat = verandaRoofMat;
    const roofSlopeL = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.08, d / 2 + 0.8), roofMat);
    roofSlopeL.position.set(0, 0.4 + h + 0.6, -d / 4);
    roofSlopeL.rotation.x = 0.45;
    roofSlopeL.castShadow = true;
    houseGrp.add(roofSlopeL);

    const roofSlopeR = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.08, d / 2 + 0.8), roofMat);
    roofSlopeR.position.set(0, 0.4 + h + 0.6, d / 4);
    roofSlopeR.rotation.x = -0.45;
    roofSlopeR.castShadow = true;
    houseGrp.add(roofSlopeR);

    // Small warm night light under veranda
    const lamp = new THREE.PointLight(0xfde047, 0.8, 12);
    lamp.position.set(0, 0.4 + h - 0.5, d / 2 + 0.5);
    houseGrp.add(lamp);
    lightPoints.push(lamp);

    houseGrp.position.set(x, y, z);
    houseGrp.rotation.y = rotY;
    group.add(houseGrp);
  };

  // Helper 2: Multi-Story Concrete Frame Urban Building with Rooftop Exposed Rebar Columns
  const createUrbanConcreteBuilding = (
    x: number,
    z: number,
    floors = 3,
    w = 12,
    d = 10,
    rotY = 0
  ) => {
    const bldgGrp = new THREE.Group();
    const y = getElevationAt(x, z);
    const floorH = 3.2;
    const totalH = floors * floorH;

    // Main structural body
    const bodyGeo = new THREE.BoxGeometry(w, totalH, d);
    const bodyMesh = new THREE.Mesh(bodyGeo, concreteMat);
    bodyMesh.position.y = totalH / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bldgGrp.add(bodyMesh);

    // Window bands / balconies
    for (let f = 0; f < floors; f++) {
      const fy = f * floorH + 1.4;
      // Front windows
      const winGeo = new THREE.BoxGeometry(w - 2, 1.2, 0.1);
      const winMesh = new THREE.Mesh(winGeo, windowGlowMat);
      winMesh.position.set(0, fy, d / 2 + 0.05);
      bldgGrp.add(winMesh);

      // Balcony cantilever
      const balcGeo = new THREE.BoxGeometry(w - 3, 0.2, 1.2);
      const balcMesh = new THREE.Mesh(balcGeo, concreteMat);
      balcMesh.position.set(0, fy - 0.6, d / 2 + 0.6);
      balcMesh.castShadow = true;
      bldgGrp.add(balcMesh);
    }

    // Parapet wall on roof
    const parapetGeo = new THREE.BoxGeometry(w + 0.2, 0.8, d + 0.2);
    const parapetMesh = new THREE.Mesh(parapetGeo, concreteMat);
    parapetMesh.position.y = totalH + 0.4;
    bldgGrp.add(parapetMesh);

    // Authentic South Asian / Bangladesh detail: Exposed rooftop rebar column studs for future floor expansion
    const rebarMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 });
    const colCoords = [
      [-w / 2 + 0.6, -d / 2 + 0.6],
      [w / 2 - 0.6, -d / 2 + 0.6],
      [-w / 2 + 0.6, d / 2 - 0.6],
      [w / 2 - 0.6, d / 2 - 0.6],
      [0, -d / 2 + 0.6],
      [0, d / 2 - 0.6],
    ];

    colCoords.forEach(([cx, cz]) => {
      // Concrete column stub
      const colStub = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.5), concreteMat);
      colStub.position.set(cx, totalH + 0.4, cz);
      bldgGrp.add(colStub);

      // Rebar bars sticking up
      for (let r = 0; r < 4; r++) {
        const rebar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 5), rebarMat);
        const rox = (r % 2 === 0 ? 0.12 : -0.12);
        const roz = (r < 2 ? 0.12 : -0.12);
        rebar.position.set(cx + rox, totalH + 1.2, cz + roz);
        bldgGrp.add(rebar);
      }
    });

    // Rooftop PVC Water Tank (Blue/Black overhead tank)
    const tankGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.8, 12);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(-w / 4, totalH + 1.3, -d / 4);
    tank.castShadow = true;
    bldgGrp.add(tank);

    bldgGrp.position.set(x, y, z);
    bldgGrp.rotation.y = rotY;
    group.add(bldgGrp);
  };

  // Helper 3: Industrial Engineering Buildings (Water Treatment Plant & Pump House)
  const createWaterTreatmentStation = (x: number, z: number) => {
    const wtpGrp = new THREE.Group();
    const y = getElevationAt(x, z);

    // Pump House Building
    const house = new THREE.Mesh(new THREE.BoxGeometry(14, 5, 9), concreteMat);
    house.position.set(0, 2.5, 0);
    house.castShadow = true;
    house.receiveShadow = true;
    wtpGrp.add(house);

    // Steel truss pitched roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(8, 2.2, 4), tinSilverMat);
    roof.position.set(0, 6.1, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.1, 1, 0.8);
    wtpGrp.add(roof);

    // Circular Aeration Clarifier Basin Tanks
    for (let t = 0; t < 2; t++) {
      const tankBase = new THREE.Mesh(
        new THREE.CylinderGeometry(5.5, 5.5, 2.2, 24, 1, true),
        concreteMat
      );
      tankBase.position.set(14 + t * 14, 1.1, 0);
      tankBase.castShadow = true;
      wtpGrp.add(tankBase);

      // Water inside aeration tank
      const aerWater = new THREE.Mesh(
        new THREE.CircleGeometry(5.3, 24),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.4 })
      );
      aerWater.rotateX(-Math.PI / 2);
      aerWater.position.set(14 + t * 14, 1.8, 0);
      wtpGrp.add(aerWater);

      // Central rotary aeration bridge
      const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(11, 0.3, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x475569 })
      );
      bridge.position.set(14 + t * 14, 2.1, 0);
      wtpGrp.add(bridge);
    }

    // Heavy Industrial Inflow & Outflow Pipes
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const mainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 18, 12), pipeMat);
    mainPipe.rotation.z = Math.PI / 2;
    mainPipe.position.set(12, 1.2, -6);
    mainPipe.castShadow = true;
    wtpGrp.add(mainPipe);

    wtpGrp.position.set(x, y, z);
    group.add(wtpGrp);
  };

  // Populate Villages & Settlements across the Sherpur / Karatoya District
  // Village cluster 1: Western Homesteads (Bari) around Pukur
  createRuralHouse(-68, -45, 0.2, 7, 5, 2.7, 'silver');
  createRuralHouse(-58, -52, -0.4, 6, 4.5, 2.6, 'blue');
  createRuralHouse(-75, -34, 1.5, 6.5, 4, 2.8, 'rust');
  createRuralHouse(-50, -38, -1.8, 8, 5.5, 2.9, 'silver');
  createRuralHouse(-62, -22, 0.6, 6, 4, 2.5, 'blue');

  // Village cluster 2: Southern Riverbank Settlement
  createRuralHouse(-35, 60, -0.3, 6.5, 4.5, 2.6, 'rust');
  createRuralHouse(-46, 72, 0.8, 7, 5, 2.7, 'silver');
  createRuralHouse(-24, 78, -1.2, 5.5, 4, 2.5, 'blue');

  // Roadside Growth / Bazaar & Urban Edge (along Highway N5 corridor at x = 58)
  createUrbanConcreteBuilding(58, -75, 4, 14, 11, 0.05);
  createUrbanConcreteBuilding(60, -50, 3, 12, 10, -0.05);
  createUrbanConcreteBuilding(59, -25, 3, 11, 9, 0.02);
  createUrbanConcreteBuilding(62, 35, 2, 10, 8, -0.1);
  createUrbanConcreteBuilding(60, 60, 4, 15, 12, 0.08);

  // Karatoya Water Treatment Facility at (85, -40)
  createWaterTreatmentStation(85, -40);

  return {
    group,
    lightPoints,
  };
}
