import * as THREE from 'three';
import { createBarkTexture, createLeafClusterTexture } from './terrainTextures';

export interface BuiltVegetation {
  group: THREE.Group;
}

export function buildBangladeshVegetation(getElevationAt: (x: number, z: number) => number): BuiltVegetation {
  const group = new THREE.Group();
  group.name = 'vegetation_group';

  // Bark & foliage textures — replaces flat single-color trunks/canopies with
  // photoreal-leaning procedural detail (bark fissures, mottled leaf dabs,
  // soft silhouette falloff) so trees stop reading as plain geometric primitives.
  const palmBarkTex = createBarkTexture('palm');
  const broadleafBarkTex = createBarkTexture('broadleaf');

  // Materials
  const palmTrunkMat = new THREE.MeshStandardMaterial({
    map: palmBarkTex,
    color: 0xcabb9e,
    roughness: 0.9,
  });

  const palmFrondMat = new THREE.MeshStandardMaterial({
    map: createLeafClusterTexture('#2e6f3b', '#173a1f', '#5aa350'),
    color: 0xbfe3bf,
    roughness: 0.7,
    alphaTest: 0.15,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const broadleafTrunkMat = new THREE.MeshStandardMaterial({
    map: broadleafBarkTex,
    color: 0xcabb9e,
    roughness: 0.9,
  });

  // Several foliage tone variants (instead of just two flat colors) so
  // canopies vary naturally across the map rather than repeating identically.
  const canopyPalettes: [string, string, string][] = [
    ['#245e2f', '#12331a', '#4d8a44'], // deep shade green
    ['#3b7d38', '#1e4a20', '#79b25c'], // sunlit mid green
    ['#356b34', '#1a3d1c', '#63a052'], // mango-tree olive green
    ['#2f6a3e', '#173a22', '#5ea768'], // rain-tree emerald
  ];
  const canopyMats = canopyPalettes.map(([base, dark, light]) => new THREE.MeshStandardMaterial({
    map: createLeafClusterTexture(base, dark, light),
    color: 0xd9e8d0,
    roughness: 0.75,
    alphaTest: 0.12,
    transparent: true,
    side: THREE.DoubleSide,
  }));

  const bananaLeafMat = new THREE.MeshStandardMaterial({
    map: createLeafClusterTexture('#4ade80', '#1f7a44', '#a5f0b0'),
    color: 0xd6f5da,
    roughness: 0.55,
    alphaTest: 0.12,
    transparent: true,
    side: THREE.DoubleSide,
  });

  // Helper 1: Build Authentic Coconut / Betel Nut Palm Tree
  const createPalmTree = (x: number, z: number, scale = 1) => {
    const y = getElevationAt(x, z);
    const palmGrp = new THREE.Group();

    // Curved slender trunk
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.2 * scale, 3 * scale, 0.1 * scale),
      new THREE.Vector3(0.5 * scale, 7 * scale, 0.2 * scale),
      new THREE.Vector3(0.4 * scale, 10 * scale, 0.3 * scale),
    ]);
    const trunkGeo = new THREE.TubeGeometry(curve, 10, 0.18 * scale, 6, false);
    const trunkMesh = new THREE.Mesh(trunkGeo, palmTrunkMat);
    trunkMesh.castShadow = true;
    palmGrp.add(trunkMesh);

    // Crown of Fronds
    const frondCount = 7;
    for (let f = 0; f < frondCount; f++) {
      const angle = (f / frondCount) * Math.PI * 2;
      const frondCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * 1.5 * scale, 0.4 * scale, Math.sin(angle) * 1.5 * scale),
        new THREE.Vector3(Math.cos(angle) * 2.8 * scale, -0.6 * scale, Math.sin(angle) * 2.8 * scale),
      ]);
      const frondGeo = new THREE.TubeGeometry(frondCurve, 6, 0.28 * scale, 4, false);
      frondGeo.scale(1, 0.15, 1);
      const frondMesh = new THREE.Mesh(frondGeo, palmFrondMat);
      frondMesh.position.set(0.4 * scale, 10 * scale, 0.3 * scale);
      frondMesh.castShadow = true;
      palmGrp.add(frondMesh);
    }

    palmGrp.position.set(x, y, z);
    group.add(palmGrp);
  };

  // Helper 2: Build Broadleaf Tree (Mango, Rain Tree, Banyan)
  const createBroadleafTree = (x: number, z: number, scale = 1, matType = 1) => {
    const y = getElevationAt(x, z);
    const treeGrp = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 4.5 * scale, 7);
    const trunk = new THREE.Mesh(trunkGeo, broadleafTrunkMat);
    trunk.position.y = 2.25 * scale;
    trunk.castShadow = true;
    treeGrp.add(trunk);

    // Foliage Clusters — pick from the varied canopy palette (keyed off matType
    // plus position) instead of only two repeating flat colors.
    const foliageMat = canopyMats[Math.abs(matType + Math.floor(x * 3 + z * 7)) % canopyMats.length];
    const clusterPositions = [
      [0, 5.0 * scale, 0, 2.4 * scale],
      [-1.2 * scale, 4.2 * scale, 0.8 * scale, 1.8 * scale],
      [1.4 * scale, 4.4 * scale, -0.6 * scale, 1.9 * scale],
      [0.2 * scale, 6.0 * scale, -0.4 * scale, 1.7 * scale],
    ];

    clusterPositions.forEach(([cx, cy, cz, rad]) => {
      const folGeo = new THREE.DodecahedronGeometry(rad, 1);
      const folMesh = new THREE.Mesh(folGeo, foliageMat);
      folMesh.position.set(cx, cy, cz);
      // Random rotation per cluster so identical geometry doesn't line up
      // the same facets across every tree — breaks up the "clone stamp" look.
      folMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      folMesh.castShadow = true;
      treeGrp.add(folMesh);
    });

    treeGrp.position.set(x, y, z);
    group.add(treeGrp);
  };

  // Helper 3: Banana Grove
  const createBananaGrove = (x: number, z: number) => {
    const y = getElevationAt(x, z);
    const groveGrp = new THREE.Group();

    for (let b = 0; b < 3; b++) {
      const bx = (b - 1) * 0.8;
      const bz = (b % 2) * 0.6;
      // Stem
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 2.4, 6),
        new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.6 })
      );
      stem.position.set(bx, 1.2, bz);
      groveGrp.add(stem);

      // Large broad drooping leaves
      for (let l = 0; l < 4; l++) {
        const lang = (l / 4) * Math.PI * 2 + b;
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.6), bananaLeafMat);
        leaf.position.set(bx + Math.cos(lang) * 0.9, 2.2, bz + Math.sin(lang) * 0.9);
        leaf.rotation.y = lang;
        leaf.rotation.z = 0.35;
        groveGrp.add(leaf);
      }
    }

    groveGrp.position.set(x, y, z);
    group.add(groveGrp);
  };

  // Populate ecologically accurate Bangladesh tree distribution:
  // 1. Village Bari surrounds (dense coconut palms & mango trees around homesteads at x: -75 to -45, z: -60 to -15)
  const homesteadTreeCoords = [
    [-78, -48], [-72, -56], [-64, -60], [-52, -56], [-46, -46],
    [-76, -38], [-82, -32], [-70, -28], [-58, -32], [-48, -30],
    [-65, -16], [-54, -18], [-74, -18], [-44, -22], [-60, -42],
  ];

  homesteadTreeCoords.forEach(([tx, tz], i) => {
    if (i % 2 === 0) {
      createPalmTree(tx, tz, 0.85 + (i % 3) * 0.15);
    } else {
      createBroadleafTree(tx, tz, 0.9 + (i % 3) * 0.15, (i % 2) + 1);
    }
  });

  // Banana groves near pond at (-55, 25)
  createBananaGrove(-62, 16);
  createBananaGrove(-48, 32);
  createBananaGrove(-68, 28);

  // 2. Roadside tree avenue (Highway N5 line at x = 38 and x = 52)
  for (let z = -150; z <= 150; z += 24) {
    if (Math.abs(z - 10) > 18) { // Skip bridge area
      createBroadleafTree(38, z, 0.8, 1);
      createPalmTree(53.5, z + 12, 0.9);
    }
  }

  // 3. Riverbank vegetation along Karatoya banks
  const riverbankCoords = [
    [-28, -120], [-18, -90], [-4, -60], [12, -20],
    [22, 40], [32, 80], [42, 120], [-32, 45], [-20, 95],
  ];

  riverbankCoords.forEach(([rx, rz], idx) => {
    createBroadleafTree(rx, rz, 1.1, (idx % 2) + 1);
    createPalmTree(rx + 4, rz - 3, 1.0);
  });

  return { group };
}
