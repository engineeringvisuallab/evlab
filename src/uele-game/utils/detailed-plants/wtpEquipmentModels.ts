import * as THREE from 'three';
import { EquipmentId } from './types';

export interface WtpAnimatedObjects {
  waterSurfaces: THREE.Mesh[];
  mixers: THREE.Group[];
  paddles: THREE.Group[];
  scrapers: THREE.Group[];
  uvLamps: THREE.Mesh[];
}

/**
 * Detailed WTP (Water Treatment Plant) campus, extracted from the standalone
 * 3d-water-treatment-plant-visualization app's ThreeCanvas.tsx (it was the
 * only campus not already modularized into its own file there).
 * `scene` may be a THREE.Scene OR any THREE.Object3D/Group container -
 * all objects are added directly to it via .add(), so passing a Group lets
 * the caller re-position the whole campus as one unit.
 */
export function buildWtpCampus(
  scene: THREE.Scene,
  materials: Record<string, THREE.Material>,
  registerInteractive: (obj: THREE.Object3D, id: EquipmentId) => void
): WtpAnimatedObjects {
  const animated: WtpAnimatedObjects = {
    waterSurfaces: [],
    mixers: [],
    paddles: [],
    scrapers: [],
    uvLamps: [],
  };

  const waterCoagulated = new THREE.MeshStandardMaterial({ color: 0x508983, roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.85 });
  const waterClarified = new THREE.MeshStandardMaterial({ color: 0x268ea8, roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.82 });
  const uvGlow = new THREE.MeshBasicMaterial({ color: 0xc084fc });

  // 1. WTP River Intake
  const intakeGroup = new THREE.Group();
  intakeGroup.position.set(-28, 0, 5);
  const pierGeo = new THREE.BoxGeometry(10, 4.5, 14);
  const pierMesh = new THREE.Mesh(pierGeo, materials.concreteDark);
  pierMesh.position.set(0, 1.8, 0);
  pierMesh.castShadow = true;
  pierMesh.receiveShadow = true;
  intakeGroup.add(pierMesh);

  const pumphouseGeo = new THREE.BoxGeometry(8, 4.5, 10);
  const pumphouseMesh = new THREE.Mesh(pumphouseGeo, materials.concrete);
  pumphouseMesh.position.set(0, 5.5, 0);
  pumphouseMesh.castShadow = true;
  intakeGroup.add(pumphouseMesh);

  for (let i = -2.2; i <= 2.2; i += 2.2) {
    const pumpMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 1.8, 16), materials.pipeBlue);
    pumpMotor.position.set(i, 8.2, 0);
    pumpMotor.castShadow = true;
    intakeGroup.add(pumpMotor);
  }
  scene.add(intakeGroup);
  registerInteractive(intakeGroup, 'river_intake');

  // 2. WTP Coagulation Rapid Flash Mixer
  const coagGroup = new THREE.Group();
  coagGroup.position.set(-14, 0, -9);
  const coagTank = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.2, 5.5, 24, 1, true), materials.concrete);
  coagTank.position.y = 2.75;
  coagTank.castShadow = true;
  coagGroup.add(coagTank);

  const coagWater = new THREE.Mesh(new THREE.CylinderGeometry(3.35, 3.35, 4.8, 24), waterCoagulated);
  coagWater.position.y = 2.4;
  coagGroup.add(coagWater);
  animated.waterSurfaces.push(coagWater);

  const mixerGroup = new THREE.Group();
  mixerGroup.position.set(0, 5.5, 0);
  const mixerShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.8, 8), materials.steel);
  mixerShaft.position.y = -2.4;
  mixerGroup.add(mixerShaft);
  const bladeGeo = new THREE.BoxGeometry(2.2, 0.35, 0.06);
  const blade1 = new THREE.Mesh(bladeGeo, materials.hazardYellow);
  blade1.position.y = -4.0;
  const blade2 = new THREE.Mesh(bladeGeo, materials.hazardYellow);
  blade2.position.y = -4.0;
  blade2.rotation.y = Math.PI / 2;
  mixerGroup.add(blade1, blade2);
  coagGroup.add(mixerGroup);
  animated.mixers.push(mixerGroup);
  scene.add(coagGroup);
  registerInteractive(coagGroup, 'coagulation');

  // 3. WTP Flocculation Basin
  const flocGroup = new THREE.Group();
  flocGroup.position.set(-3, 0, -10);
  const flocBasin = new THREE.Mesh(new THREE.BoxGeometry(14, 5, 10), materials.concrete);
  flocBasin.position.y = 2.5;
  flocBasin.castShadow = true;
  flocGroup.add(flocBasin);

  const flocWater = new THREE.Mesh(new THREE.BoxGeometry(13.2, 4.2, 9.2), waterCoagulated);
  flocWater.position.y = 2.3;
  flocGroup.add(flocWater);
  animated.waterSurfaces.push(flocWater);

  for (let c = -4; c <= 4; c += 4) {
    const paddleGroup = new THREE.Group();
    paddleGroup.position.set(c, 2.5, 0);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 8.5, 8), materials.steel);
    shaft.rotation.x = Math.PI / 2;
    paddleGroup.add(shaft);

    for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 2) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 7.8), materials.hazardYellow);
      blade.position.set(Math.cos(ang) * 1.5, Math.sin(ang) * 1.5, 0);
      paddleGroup.add(blade);
    }
    flocGroup.add(paddleGroup);
    animated.paddles.push(paddleGroup);
  }
  scene.add(flocGroup);
  registerInteractive(flocGroup, 'flocculation');

  // 4. WTP Clarifier 1 & 2
  const buildWtpClarifier = (x: number, z: number, id: EquipmentId) => {
    const clGroup = new THREE.Group();
    clGroup.position.set(x, 0, z);

    const tankWall = new THREE.Mesh(new THREE.CylinderGeometry(9.5, 9.5, 5, 36, 1, true), materials.concrete);
    tankWall.position.y = 2.5;
    tankWall.castShadow = true;
    clGroup.add(tankWall);

    const waterMesh = new THREE.Mesh(new THREE.CylinderGeometry(9.3, 9.3, 4.4, 36), waterClarified);
    waterMesh.position.y = 2.3;
    clGroup.add(waterMesh);
    animated.waterSurfaces.push(waterMesh);

    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(0, 5.2, 0);
    const bridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(19, 0.35, 1.4), materials.steel);
    bridgeMesh.castShadow = true;
    bridgeGroup.add(bridgeMesh);
    clGroup.add(bridgeGroup);
    animated.scrapers.push(bridgeGroup);

    scene.add(clGroup);
    registerInteractive(clGroup, id);
  };
  buildWtpClarifier(-2, 7, 'clarifier_1');
  buildWtpClarifier(15, 7, 'clarifier_2');

  // 5. WTP Filtration Complex
  const filtGroup = new THREE.Group();
  filtGroup.position.set(12, 0, -10);
  const filtBuilding = new THREE.Mesh(new THREE.BoxGeometry(14, 6.5, 11), materials.concrete);
  filtBuilding.position.y = 3.25;
  filtBuilding.castShadow = true;
  filtGroup.add(filtBuilding);

  const filtRoof = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.6, 11.6), materials.greenRoof);
  filtRoof.position.y = 6.6;
  filtGroup.add(filtRoof);

  const pipeHeader = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 13, 16), materials.pipeBlue);
  pipeHeader.rotation.z = Math.PI / 2;
  pipeHeader.position.set(0, 4.5, 6);
  filtGroup.add(pipeHeader);
  scene.add(filtGroup);
  registerInteractive(filtGroup, 'filtration');

  // 6. WTP UV & Chlorination
  const chlorGroup = new THREE.Group();
  chlorGroup.position.set(24, 0, -10);
  const chlorTank = new THREE.Mesh(new THREE.BoxGeometry(8, 4.5, 10), materials.concreteDark);
  chlorTank.position.y = 2.25;
  chlorTank.castShadow = true;
  chlorGroup.add(chlorTank);

  const uvVessel = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 6, 16), materials.pipePurple);
  uvVessel.rotation.x = Math.PI / 2;
  uvVessel.position.set(0, 4.8, 0);
  chlorGroup.add(uvVessel);

  const uvLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 5.5, 8), uvGlow);
  uvLamp.rotation.x = Math.PI / 2;
  uvLamp.position.set(0, 4.8, 0);
  chlorGroup.add(uvLamp);
  animated.uvLamps.push(uvLamp);
  scene.add(chlorGroup);
  registerInteractive(chlorGroup, 'chlorination');

  // 7. WTP Potable Storage Tanks
  const storageGroup = new THREE.Group();
  storageGroup.position.set(28, 0, 7);
  for (const offsetZ of [-5, 5]) {
    const tankCyl = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 6, 32), materials.concrete);
    tankCyl.position.set(0, 3, offsetZ);
    tankCyl.castShadow = true;
    storageGroup.add(tankCyl);

    const tankDome = new THREE.Mesh(new THREE.SphereGeometry(6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), materials.tankDome);
    tankDome.position.set(0, 6, offsetZ);
    tankDome.castShadow = true;
    storageGroup.add(tankDome);
  }
  scene.add(storageGroup);
  registerInteractive(storageGroup, 'storage_tanks');

  // 8. WTP Sludge Dewatering
  const sludgeGroup = new THREE.Group();
  sludgeGroup.position.set(-3, 0, 22);
  const sludgeBldg = new THREE.Mesh(new THREE.BoxGeometry(12, 5.5, 9), materials.concreteDark);
  sludgeBldg.position.y = 2.75;
  sludgeBldg.castShadow = true;
  sludgeGroup.add(sludgeBldg);

  const thicknerCyl = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 2.5, 4.5, 24), materials.steel);
  thicknerCyl.position.set(9, 2.25, 0);
  thicknerCyl.castShadow = true;
  sludgeGroup.add(thicknerCyl);
  scene.add(sludgeGroup);
  registerInteractive(sludgeGroup, 'sludge_treatment');

  // 9. WTP SCADA Admin Headquarters
  const adminGroup = new THREE.Group();
  adminGroup.position.set(-18, 0, 20);
  const adminMain = new THREE.Mesh(new THREE.BoxGeometry(12, 7.5, 10), materials.concrete);
  adminMain.position.y = 3.75;
  adminMain.castShadow = true;
  adminGroup.add(adminMain);

  const adminGlass = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.4), materials.glass);
  adminGlass.position.set(0, 4, 5.1);
  adminGroup.add(adminGlass);
  scene.add(adminGroup);
  registerInteractive(adminGroup, 'admin_building');

  return animated;
}
