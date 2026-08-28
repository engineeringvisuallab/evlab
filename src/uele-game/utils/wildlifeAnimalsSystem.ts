import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';

export interface WildlifeSystemInstance {
  group: THREE.Group;
  update: (time: number, delta: number) => void;
}

interface AnimatedAnimal {
  group: THREE.Group;
  basePos: THREE.Vector3;
  currentPos: THREE.Vector3;
  heading: number;
  speed: number;
  wanderRadius: number;
  type: 'deer' | 'tiger' | 'elephant' | 'cow';
  legs: THREE.Object3D[];
  head?: THREE.Object3D;
  tail?: THREE.Object3D;
  animOffset: number;
}

/**
 * Procedural 3D Wildlife Animals & Forest Fauna System
 * Includes Spotted Chital Deer herds, Royal Bengal Tigers, Asian Elephants, and Rural Meadow Cattle
 */
export function buildWildlifeAnimalsSystem(): WildlifeSystemInstance {
  const group = new THREE.Group();
  group.name = 'forest_wildlife_fauna_system';

  const animals: AnimatedAnimal[] = [];

  // =========================================================================
  // SHARED MATERIALS
  // =========================================================================
  const deerFurMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 }); // Chestnut with white spots
  const deerSpotMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.8 });
  const antlerMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const tigerFurMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.75 }); // Orange
  const tigerStripeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 }); // Black stripes
  const elephantSkinMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 }); // Slate grey
  const tuskMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 }); // Ivory
  const cowWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 });
  const cowPatchMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });

  // =========================================================================
  // 1. SPOTTED CHITAL DEER (চিত্রা হরিণ) BUILDER
  // =========================================================================
  const createDeer = (x: number, z: number, isStag = true): AnimatedAnimal => {
    const deerGrp = new THREE.Group();
    const legs: THREE.Object3D[] = [];

    // Body (Torso)
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 3.2), deerFurMat);
    body.position.y = 2.0;
    body.castShadow = true;
    deerGrp.add(body);

    // White underbelly spots
    for (let s = -1; s <= 1; s += 0.8) {
      const spot1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.3), deerSpotMat);
      spot1.position.set(0.81, 2.1, s);
      deerGrp.add(spot1);
      const spot2 = spot1.clone();
      spot2.position.x = -0.81;
      deerGrp.add(spot2);
    }

    // Neck & Head
    const headGrp = new THREE.Group();
    headGrp.position.set(0, 2.3, 1.5);

    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.9), deerFurMat);
    neck.position.set(0, 0.6, 0.3);
    neck.rotation.x = -0.35;
    headGrp.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 1.2), deerFurMat);
    head.position.set(0, 1.2, 0.7);
    headGrp.add(head);

    // Snout
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.8), deerSpotMat);
    snout.position.set(0, 1.05, 1.4);
    headGrp.add(snout);

    // Ears
    for (const ex of [-0.5, 0.5]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 4), deerFurMat);
      ear.position.set(ex, 1.6, 0.6);
      ear.rotation.z = ex > 0 ? -0.4 : 0.4;
      headGrp.add(ear);
    }

    // Antlers for Stag
    if (isStag) {
      for (const ax of [-0.35, 0.35]) {
        const mainBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6), antlerMat);
        mainBeam.position.set(ax, 2.0, 0.4);
        mainBeam.rotation.x = -0.4;
        mainBeam.rotation.z = ax > 0 ? 0.3 : -0.3;
        headGrp.add(mainBeam);

        const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.6, 5), antlerMat);
        tine.position.set(ax * 1.5, 2.2, 0.5);
        tine.rotation.z = ax > 0 ? 0.7 : -0.7;
        headGrp.add(tine);
      }
    }

    deerGrp.add(headGrp);

    // 4 Slender Legs
    const legGeo = new THREE.BoxGeometry(0.3, 1.5, 0.3);
    const legPositions = [
      [-0.6, 0.75, 1.1],
      [0.6, 0.75, 1.1],
      [-0.6, 0.75, -1.1],
      [0.6, 0.75, -1.1],
    ];

    legPositions.forEach((pos) => {
      const legPivot = new THREE.Group();
      legPivot.position.set(pos[0], 1.5, pos[2]);
      const legMesh = new THREE.Mesh(legGeo, deerFurMat);
      legMesh.position.y = -0.75;
      legMesh.castShadow = true;
      legPivot.add(legMesh);
      deerGrp.add(legPivot);
      legs.push(legPivot);
    });

    // Tail
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.2), deerSpotMat);
    tail.position.set(0, 2.1, -1.65);
    tail.rotation.x = 0.5;
    deerGrp.add(tail);

    const basePos = new THREE.Vector3(x, calcMasterPlanElevation(x, z), z);
    deerGrp.position.copy(basePos);
    deerGrp.scale.set(0.85, 0.85, 0.85);
    group.add(deerGrp);

    return {
      group: deerGrp,
      basePos,
      currentPos: basePos.clone(),
      heading: Math.random() * Math.PI * 2,
      speed: 1.8 + Math.random() * 1.2,
      wanderRadius: 45 + Math.random() * 40,
      type: 'deer',
      legs,
      head: headGrp,
      tail,
      animOffset: Math.random() * 10,
    };
  };

  // =========================================================================
  // 2. ROYAL BENGAL TIGER (রয়েল বেঙ্গল টাইগার) BUILDER
  // =========================================================================
  const createTiger = (x: number, z: number): AnimatedAnimal => {
    const tigerGrp = new THREE.Group();
    const legs: THREE.Object3D[] = [];

    // Muscular Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 3.8), tigerFurMat);
    body.position.y = 1.8;
    body.castShadow = true;
    tigerGrp.add(body);

    // Black stripes
    for (let st = -1.4; st <= 1.4; st += 0.5) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.14, 0.18), tigerStripeMat);
      stripe.position.set(0, 1.85, st);
      tigerGrp.add(stripe);
    }

    // Head
    const headGrp = new THREE.Group();
    headGrp.position.set(0, 2.0, 2.0);

    const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), tigerFurMat);
    headGrp.add(head);

    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.8), deerSpotMat);
    muzzle.position.set(0, -0.2, 0.8);
    headGrp.add(muzzle);

    for (const ex of [-0.6, 0.6]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), tigerStripeMat);
      ear.position.set(ex, 0.6, 0.1);
      headGrp.add(ear);
    }
    tigerGrp.add(headGrp);

    // 4 Powerful Paws/Legs
    const legGeo = new THREE.BoxGeometry(0.48, 1.3, 0.48);
    const legPositions = [
      [-0.7, 0.65, 1.3],
      [0.7, 0.65, 1.3],
      [-0.7, 0.65, -1.3],
      [0.7, 0.65, -1.3],
    ];

    legPositions.forEach((pos) => {
      const legPivot = new THREE.Group();
      legPivot.position.set(pos[0], 1.3, pos[2]);
      const legMesh = new THREE.Mesh(legGeo, tigerFurMat);
      legMesh.position.y = -0.65;
      legMesh.castShadow = true;
      legPivot.add(legMesh);
      tigerGrp.add(legPivot);
      legs.push(legPivot);
    });

    // Long Tail with black tip
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.2, 6), tigerFurMat);
    tail.position.set(0, 1.8, -2.4);
    tail.rotation.x = -0.6;
    tigerGrp.add(tail);

    const basePos = new THREE.Vector3(x, calcMasterPlanElevation(x, z), z);
    tigerGrp.position.copy(basePos);
    group.add(tigerGrp);

    return {
      group: tigerGrp,
      basePos,
      currentPos: basePos.clone(),
      heading: Math.random() * Math.PI * 2,
      speed: 2.2,
      wanderRadius: 60,
      type: 'tiger',
      legs,
      head: headGrp,
      tail,
      animOffset: Math.random() * 10,
    };
  };

  // =========================================================================
  // 3. ASIAN ELEPHANT (এশীয় হাতি) BUILDER
  // =========================================================================
  const createElephant = (x: number, z: number, isCalf = false): AnimatedAnimal => {
    const eleGrp = new THREE.Group();
    const legs: THREE.Object3D[] = [];
    const scale = isCalf ? 0.55 : 1.1;

    // Massive Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.4, 5.8), elephantSkinMat);
    body.position.y = 3.6;
    body.castShadow = true;
    eleGrp.add(body);

    // Head with Trunk
    const headGrp = new THREE.Group();
    headGrp.position.set(0, 3.9, 3.2);

    const head = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 2.6), elephantSkinMat);
    headGrp.add(head);

    // Large flapping ears
    for (const ex of [-1.8, 1.8]) {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, 1.6), elephantSkinMat);
      ear.position.set(ex, 0.2, -0.4);
      ear.rotation.y = ex > 0 ? 0.3 : -0.3;
      headGrp.add(ear);
    }

    // Curved Trunk
    const trunkUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.75, 2.4, 8), elephantSkinMat);
    trunkUpper.position.set(0, -1.2, 1.2);
    trunkUpper.rotation.x = 0.4;
    headGrp.add(trunkUpper);

    const trunkTip = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 1.8, 8), elephantSkinMat);
    trunkTip.position.set(0, -2.4, 1.8);
    trunkTip.rotation.x = 0.8;
    headGrp.add(trunkTip);

    // Tusks
    if (!isCalf) {
      for (const tx of [-0.8, 0.8]) {
        const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.8, 8), tuskMat);
        tusk.position.set(tx, -1.2, 1.8);
        tusk.rotation.x = -0.5;
        tusk.rotation.z = tx > 0 ? 0.15 : -0.15;
        headGrp.add(tusk);
      }
    }
    eleGrp.add(headGrp);

    // 4 Pillar Legs
    const legGeo = new THREE.CylinderGeometry(0.65, 0.75, 2.5, 8);
    const legPositions = [
      [-1.3, 1.25, 2.0],
      [1.3, 1.25, 2.0],
      [-1.3, 1.25, -2.0],
      [1.3, 1.25, -2.0],
    ];

    legPositions.forEach((pos) => {
      const legPivot = new THREE.Group();
      legPivot.position.set(pos[0], 2.5, pos[2]);
      const legMesh = new THREE.Mesh(legGeo, elephantSkinMat);
      legMesh.position.y = -1.25;
      legMesh.castShadow = true;
      legPivot.add(legMesh);
      eleGrp.add(legPivot);
      legs.push(legPivot);
    });

    // Tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 2.2, 6), elephantSkinMat);
    tail.position.set(0, 3.4, -3.0);
    tail.rotation.x = 0.25;
    eleGrp.add(tail);

    eleGrp.scale.set(scale, scale, scale);
    const basePos = new THREE.Vector3(x, calcMasterPlanElevation(x, z), z);
    eleGrp.position.copy(basePos);
    group.add(eleGrp);

    return {
      group: eleGrp,
      basePos,
      currentPos: basePos.clone(),
      heading: Math.random() * Math.PI * 2,
      speed: 1.2,
      wanderRadius: 40,
      type: 'elephant',
      legs,
      head: headGrp,
      tail,
      animOffset: Math.random() * 10,
    };
  };

  // =========================================================================
  // SPAWN FAUNA ACROSS FORESTRY BIOSPHERE & HILL ECO RESERVES
  // =========================================================================

  // 1. Forestry Biosphere Deer Herds (X: 3400 to 4500, Z: 3600 to 4600)
  for (let i = 0; i < 14; i++) {
    const rx = 3400 + Math.random() * 1000;
    const rz = 3600 + Math.random() * 900;
    animals.push(createDeer(rx, rz, i % 3 === 0));
  }

  // 2. Hill & Eco Zone Deer (X: -3600 to -2800, Z: -4200 to -3200)
  for (let i = 0; i < 8; i++) {
    const rx = -3600 + Math.random() * 800;
    const rz = -4200 + Math.random() * 800;
    animals.push(createDeer(rx, rz, i % 2 === 0));
  }

  // 3. Royal Bengal Tigers in Deep Biosphere Forest
  animals.push(createTiger(4100, 4200));
  animals.push(createTiger(3650, 4450));
  animals.push(createTiger(-3200, -3600));

  // 4. Asian Elephant Family near Forest Botanical Lake
  animals.push(createElephant(3900, 3950, false));
  animals.push(createElephant(3925, 3970, true)); // Calf
  animals.push(createElephant(3870, 3940, false));

  // =========================================================================
  // 4. FLOCK OF CIRCLING WHITE BIRDS / CRANES OVER FORESTRY & WETLANDS
  // =========================================================================
  const birdCount = 30;
  const birdGeo = new THREE.BufferGeometry();
  const birdPositions = new Float32Array(birdCount * 3);
  const birdOffsets: number[] = [];

  for (let b = 0; b < birdCount; b++) {
    birdPositions[b * 3] = 3800 + (Math.random() - 0.5) * 800;
    birdPositions[b * 3 + 1] = 65 + Math.random() * 40;
    birdPositions[b * 3 + 2] = 4200 + (Math.random() - 0.5) * 800;
    birdOffsets.push(Math.random() * Math.PI * 2);
  }
  birdGeo.setAttribute('position', new THREE.BufferAttribute(birdPositions, 3));

  const birdCanvas = document.createElement('canvas');
  birdCanvas.width = 64;
  birdCanvas.height = 64;
  const bCtx = birdCanvas.getContext('2d');
  if (bCtx) {
    bCtx.fillStyle = '#ffffff';
    bCtx.beginPath();
    bCtx.arc(32, 32, 24, 0, Math.PI * 2);
    bCtx.fill();
  }
  const birdTex = new THREE.CanvasTexture(birdCanvas);

  const birdMat = new THREE.PointsMaterial({
    size: 5.5,
    map: birdTex,
    transparent: true,
    opacity: 0.9,
    color: 0xffffff,
  });
  const birdPoints = new THREE.Points(birdGeo, birdMat);
  group.add(birdPoints);

  // =========================================================================
  // ANIMATION & WANDERING BEHAVIOR LOOP
  // =========================================================================
  const update = (time: number, delta: number) => {
    animals.forEach((animal) => {
      // 1. Natural wandering around base territory
      const targetAngle = time * 0.15 + animal.animOffset;
      const targetX = animal.basePos.x + Math.cos(targetAngle) * animal.wanderRadius;
      const targetZ = animal.basePos.z + Math.sin(targetAngle) * animal.wanderRadius;

      const dx = targetX - animal.currentPos.x;
      const dz = targetZ - animal.currentPos.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 1.0) {
        const moveHeading = Math.atan2(dx, dz);
        animal.heading = THREE.MathUtils.lerp(animal.heading, moveHeading, 3.5 * delta);

        const moveSpeed = animal.speed * delta;
        animal.currentPos.x += Math.sin(animal.heading) * moveSpeed;
        animal.currentPos.z += Math.cos(animal.heading) * moveSpeed;
      }

      // Elevation terrain clamping
      const groundY = calcMasterPlanElevation(animal.currentPos.x, animal.currentPos.z);
      animal.currentPos.y = groundY;

      animal.group.position.copy(animal.currentPos);
      animal.group.rotation.y = animal.heading;

      // 2. Leg gait walking swing animation
      const walkAnim = Math.sin(time * 6 * animal.speed + animal.animOffset) * 0.45;
      if (animal.legs.length >= 4) {
        animal.legs[0].rotation.x = walkAnim;
        animal.legs[1].rotation.x = -walkAnim;
        animal.legs[2].rotation.x = -walkAnim;
        animal.legs[3].rotation.x = walkAnim;
      }

      // 3. Gentle head & tail bobbing
      if (animal.head) {
        animal.head.rotation.x = Math.sin(time * 2.5 + animal.animOffset) * 0.12;
      }
      if (animal.tail) {
        animal.tail.rotation.z = Math.sin(time * 4 + animal.animOffset) * 0.25;
      }
    });

    // 4. Update flocking birds circle trajectory
    const posAttr = birdGeo.attributes.position as THREE.BufferAttribute;
    if (posAttr) {
      for (let b = 0; b < birdCount; b++) {
        const offset = birdOffsets[b];
        const birdAngle = time * 0.22 + offset;
        const radius = 350 + (b % 5) * 40;
        const bx = 3800 + Math.cos(birdAngle) * radius;
        const bz = 4200 + Math.sin(birdAngle) * radius;
        const by = 70 + Math.sin(time * 2 + offset) * 8;

        posAttr.setXYZ(b, bx, by, bz);
      }
      posAttr.needsUpdate = true;
    }
  };

  return {
    group,
    update,
  };
}
