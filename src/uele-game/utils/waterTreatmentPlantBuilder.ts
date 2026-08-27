import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';

export interface WaterTreatmentPlantResult {
  group: THREE.Group;
  position: THREE.Vector3;
}

// Placed just off the east bank of the Karatoya River (river centerline at
// this Z is roughly x≈24, half-width 16 — so x=55 sits safely on dry land,
// a short walk/drive from the water's edge).
export const WATER_TREATMENT_PLANT_POSITION: [number, number] = [55, 130];

/**
 * Builds a small procedural riverside water treatment plant: a few circular
 * clarifier/settling tanks, a rectangular filtration building, an intake
 * pipe reaching toward the river, and a perimeter fence — purely so it reads
 * clearly as "a water treatment plant" from a distance and up close.
 */
export function buildWaterTreatmentPlant(): WaterTreatmentPlantResult {
  const group = new THREE.Group();
  group.name = 'water_treatment_plant';

  const [px, pz] = WATER_TREATMENT_PLANT_POSITION;
  const py = calcMasterPlanElevation(px, pz);
  group.position.set(px, py, pz);

  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xd6d3cc, roughness: 0.85, metalness: 0.05 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.6 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4, metalness: 0.3 });
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x2f7f8f, roughness: 0.2, metalness: 0.1 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a4c, roughness: 0.4, metalness: 0.7 });

  // --- Main filtration / treatment building -------------------------------
  const mainBldg = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 10), concreteMat);
  mainBldg.position.set(0, 3, -8);
  mainBldg.castShadow = true;
  mainBldg.receiveShadow = true;
  group.add(mainBldg);

  const mainRoof = new THREE.Mesh(new THREE.BoxGeometry(16.6, 0.6, 10.6), roofMat);
  mainRoof.position.set(0, 6.3, -8);
  mainRoof.castShadow = true;
  group.add(mainRoof);

  // Small office / control room beside the main building
  const office = new THREE.Mesh(new THREE.BoxGeometry(5, 3.2, 5), concreteMat);
  office.position.set(11, 1.6, -6);
  office.castShadow = true;
  office.receiveShadow = true;
  group.add(office);
  const officeRoof = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, 5.4), roofMat);
  officeRoof.position.set(11, 3.4, -6);
  group.add(officeRoof);

  // --- Circular clarifier / settling tanks --------------------------------
  const tankPositions: [number, number][] = [
    [-10, 6],
    [0, 8],
    [10, 6],
  ];
  tankPositions.forEach(([tx, tz]) => {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 1.4, 24), concreteMat);
    rim.position.set(tx, 0.7, tz);
    rim.castShadow = true;
    rim.receiveShadow = true;
    group.add(rim);

    const water = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.7, 0.2, 24), waterMat);
    water.position.set(tx, 1.35, tz);
    group.add(water);

    // Rotating scraper arm (visual only, static geometry here)
    const arm = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 0.25), metalMat);
    arm.position.set(tx, 1.6, tz);
    group.add(arm);

    const centerPost = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.2, 12), metalMat);
    centerPost.position.set(tx, 1.9, tz);
    group.add(centerPost);
  });

  // --- Elevated water tower -------------------------------------------
  const towerLeg = (dx: number, dz: number) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 9, 8), metalMat);
    leg.position.set(dx, 4.5, dz);
    group.add(leg);
  };
  towerLeg(-1.6, 12.6);
  towerLeg(1.6, 12.6);
  towerLeg(-1.6, 15.8);
  towerLeg(1.6, 15.8);
  const towerTank = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 2.6, 4, 16), roofMat);
  towerTank.position.set(0, 11, 14.2);
  towerTank.castShadow = true;
  group.add(towerTank);
  const towerCap = new THREE.Mesh(new THREE.ConeGeometry(3.3, 1.4, 16), roofMat);
  towerCap.position.set(0, 13.7, 14.2);
  group.add(towerCap);

  // --- Intake pipe reaching toward the river (river is to the west) -------
  const intakePipe = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 26, 12), pipeMat);
  intakePipe.rotation.z = Math.PI / 2;
  intakePipe.position.set(-24, 0.6, 4);
  group.add(intakePipe);
  const intakeHead = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.5, 12), metalMat);
  intakeHead.rotation.z = Math.PI / 2;
  intakeHead.position.set(-37, 0.6, 4);
  group.add(intakeHead);

  // --- Perimeter chain-link style fence posts ------------------------------
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.6, metalness: 0.4 });
  const fenceW = 34;
  const fenceD = 30;
  const fenceCenterZ = 6;
  const postCount = 18;
  for (let i = 0; i < postCount; i++) {
    const t = i / (postCount - 1);
    // Trace a simple rectangle perimeter
    const perim = t * 4;
    let fx = 0;
    let fz = 0;
    if (perim < 1) {
      fx = -fenceW / 2 + fenceW * perim;
      fz = fenceCenterZ - fenceD / 2;
    } else if (perim < 2) {
      fx = fenceW / 2;
      fz = fenceCenterZ - fenceD / 2 + fenceD * (perim - 1);
    } else if (perim < 3) {
      fx = fenceW / 2 - fenceW * (perim - 2);
      fz = fenceCenterZ + fenceD / 2;
    } else {
      fx = -fenceW / 2;
      fz = fenceCenterZ + fenceD / 2 - fenceD * (perim - 3);
    }
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 6), fenceMat);
    post.position.set(fx, 1.1, fz);
    group.add(post);
  }

  // --- Signboard identifying the plant -------------------------------
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 128;
  const ctx = signCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💧 Water Treatment Plant', 256, 55);
    ctx.font = '26px sans-serif';
    ctx.fillText('পানি শোধনাগার — ক্লিক করে ভিতরে যান', 256, 95);
  }
  const signTex = new THREE.CanvasTexture(signCanvas);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 2.5),
    new THREE.MeshBasicMaterial({ map: signTex, transparent: true })
  );
  sign.position.set(0, 8.2, -2.8);
  group.add(sign);
  const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3, 8), metalMat);
  signPost.position.set(0, 6.7, -2.8);
  group.add(signPost);

  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.userData.isWaterTreatmentPlant = true;
    }
  });

  return { group, position: new THREE.Vector3(px, py, pz) };
}
