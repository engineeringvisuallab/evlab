import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';
import { registerSolidBuilding } from './buildingCollisions';
import { buildWtpCampus, WtpAnimatedObjects } from './detailed-plants/wtpEquipmentModels';
import { buildStpCampus, StpAnimatedObjects } from './detailed-plants/stpEquipmentModels';
import { buildEtpCampus, EtpAnimatedObjects } from './detailed-plants/etpEquipmentModels';
import { buildSwmCampus, SwmAnimatedObjects } from './detailed-plants/swmEquipmentModels';
import { createSharedPlantMaterials } from './detailed-plants/sharedPlantMaterials';
import { EquipmentId } from './detailed-plants/types';

export interface UtilityInfrastructureInstance {
  group: THREE.Group;
  update: (time: number, delta: number) => void;
}

// Each campus builder (ported from the standalone visualization app) was
// designed around its own local coordinate cluster rather than (0,0,0).
// These are the centroids of each campus's top-level groups in that
// original local space - used to re-center every campus on (0,0,0) before
// it gets shifted to its real game-world location below.
const WTP_LOCAL_CENTER = { x: 0, z: 6 };
const STP_LOCAL_CENTER = { x: 84, z: -1 };
const ETP_LOCAL_CENTER = { x: 248, z: 0 };
const SWM_LOCAL_CENTER = { x: 157, z: 5 };

// A no-op-for-now interactive registrar: tags meshes with their equipment id
// so a future click/inspect system can hook in, without requiring the
// UI/modal layer from the source app.
function makeRegisterInteractive() {
  return (obj: THREE.Object3D, id: EquipmentId) => {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.userData = { ...child.userData, equipmentId: id };
      }
    });
  };
}

/**
 * Essential Environmental & Municipal Utility Infrastructure System:
 * 1. WTP (Water Treatment Plant) - Upstream Karatoya River (X: 3800, Z: -1200)
 * 2. STP (Sewage Treatment Plant) - Downstream Karatoya River (X: -4200, Z: -350)
 * 3. ETP (Effluent Treatment Plant) - Heavy Industrial SEZ (X: -3600, Z: 300)
 * 4. SWM (Solid Waste Management & Engineered Landfill) - Eco Utility Sector (X: 3200, Z: 1200)
 *
 * These four locations were verified against the original simplified
 * geometry before this module was upgraded to the detailed campus models -
 * the coordinates are unchanged, only the buildings on top of them.
 */
export function buildUtilityInfrastructureZones(): UtilityInfrastructureInstance {
  const group = new THREE.Group();
  group.name = 'environmental_utility_infrastructure_zones';

  const registerInteractive = makeRegisterInteractive();
  const sharedMaterials = createSharedPlantMaterials();

  const wtpAnimated: WtpAnimatedObjects[] = [];
  const stpAnimated: StpAnimatedObjects[] = [];
  const etpAnimated: EtpAnimatedObjects[] = [];
  const swmAnimated: SwmAnimatedObjects[] = [];

  // =========================================================================
  // 1. WTP (WATER TREATMENT PLANT) - RIVER UPSTREAM (X: 3800, Z: -1200)
  // =========================================================================
  const buildWTP = () => {
    const wtpX = 3800;
    const wtpZ = -1200;
    const wtpY = calcMasterPlanElevation(wtpX, wtpZ);
    const wtpGrp = new THREE.Group();
    wtpGrp.position.set(wtpX - WTP_LOCAL_CENTER.x, wtpY, wtpZ - WTP_LOCAL_CENTER.z);

    const animated = buildWtpCampus(wtpGrp as unknown as THREE.Scene, sharedMaterials, registerInteractive);
    wtpAnimated.push(animated);

    registerSolidBuilding({
      id: 'utility_wtp_plant',
      name: 'Central Water Treatment Plant (WTP - Upstream)',
      minX: wtpX - 70,
      maxX: wtpX + 70,
      minZ: wtpZ - 60,
      maxZ: wtpZ + 60,
      topY: wtpY + 18,
      baseY: wtpY,
    });

    group.add(wtpGrp);
  };

  // =========================================================================
  // 2. STP (SEWAGE TREATMENT PLANT) - RIVER DOWNSTREAM (X: -4200, Z: -350)
  // =========================================================================
  const buildSTP = () => {
    const stpX = -4200;
    const stpZ = -350;
    const stpY = calcMasterPlanElevation(stpX, stpZ);
    const stpGrp = new THREE.Group();
    stpGrp.position.set(stpX - STP_LOCAL_CENTER.x, stpY, stpZ - STP_LOCAL_CENTER.z);

    const animated = buildStpCampus(stpGrp as unknown as THREE.Scene, registerInteractive);
    stpAnimated.push(animated);

    registerSolidBuilding({
      id: 'utility_stp_plant',
      name: 'Sewage Treatment Plant (STP - Downstream)',
      minX: stpX - 100,
      maxX: stpX + 100,
      minZ: stpZ - 80,
      maxZ: stpZ + 80,
      topY: stpY + 22,
      baseY: stpY,
    });

    group.add(stpGrp);
  };

  // =========================================================================
  // 3. ETP (EFFLUENT TREATMENT PLANT) - INDUSTRIAL SEZ (X: -3600, Z: 300)
  // =========================================================================
  const buildETP = () => {
    const etpX = -3600;
    const etpZ = 300;
    const etpY = calcMasterPlanElevation(etpX, etpZ);
    const etpGrp = new THREE.Group();
    etpGrp.position.set(etpX - ETP_LOCAL_CENTER.x, etpY, etpZ - ETP_LOCAL_CENTER.z);

    const animated = buildEtpCampus(etpGrp as unknown as THREE.Scene, sharedMaterials, registerInteractive);
    etpAnimated.push(animated);

    registerSolidBuilding({
      id: 'utility_etp_plant',
      name: 'Industrial Effluent Treatment Plant (ETP)',
      minX: etpX - 90,
      maxX: etpX + 90,
      minZ: etpZ - 70,
      maxZ: etpZ + 70,
      topY: etpY + 24,
      baseY: etpY,
    });

    group.add(etpGrp);
  };

  // =========================================================================
  // 4. SWM (SOLID WASTE MANAGEMENT & LANDFILL) (X: 3200, Z: 1200)
  // =========================================================================
  const buildSWM = () => {
    const swmX = 3200;
    const swmZ = 1200;
    const swmY = calcMasterPlanElevation(swmX, swmZ);
    const swmGrp = new THREE.Group();
    swmGrp.position.set(swmX - SWM_LOCAL_CENTER.x, swmY, swmZ - SWM_LOCAL_CENTER.z);

    const animated = buildSwmCampus(swmGrp as unknown as THREE.Scene, registerInteractive);
    swmAnimated.push(animated);

    registerSolidBuilding({
      id: 'utility_swm_plant',
      name: 'Solid Waste Management Facility & Engineered Landfill (SWM)',
      minX: swmX - 90,
      maxX: swmX + 90,
      minZ: swmZ - 80,
      maxZ: swmZ + 80,
      topY: swmY + 26,
      baseY: swmY,
    });

    group.add(swmGrp);
  };

  // Build all 4 detailed treatment plant campuses
  buildWTP();
  buildSTP();
  buildETP();
  buildSWM();

  // =========================================================================
  // Animation / "physics" simulation loop - ported from the standalone
  // visualization app's per-frame update logic (rotating scrapers/paddles/
  // mixers, pulsing UV lamps & flares, bobbing water surfaces, rising
  // aeration/DAF/MBBR bubble fields, etc). Runs at a fixed sim speed of 1x
  // since this game has no master run/pause or speed control (yet).
  // =========================================================================
  const speed = 1;

  const update = (time: number, _delta: number) => {
    // --- WTP ---
    wtpAnimated.forEach((a) => {
      a.waterSurfaces.forEach((wMesh, idx) => {
        wMesh.position.y += Math.sin(time * 3 * speed + idx) * 0.001;
      });
      a.scrapers.forEach((scr) => (scr.rotation.y += 0.003 * speed));
      a.paddles.forEach((pad, idx) => (pad.rotation.x += (idx % 2 === 0 ? 0.02 : -0.015) * speed));
      a.mixers.forEach((mix) => (mix.rotation.y += 0.25 * speed));
      a.uvLamps.forEach((uv) => {
        const mat = uv.material as THREE.MeshBasicMaterial;
        mat.color.setHSL(0.78, 0.9, 0.5 + Math.sin(time * 8) * 0.15);
      });
    });

    // --- STP ---
    stpAnimated.forEach((a) => {
      a.waterSurfaces.forEach((wMesh, idx) => {
        wMesh.position.y += Math.sin(time * 3 * speed + idx) * 0.001;
      });
      a.scrapers.forEach((scr) => (scr.rotation.y += 0.003 * speed));
      a.uvLamps.forEach((uv) => {
        const mat = uv.material as THREE.MeshBasicMaterial;
        mat.color.setHSL(0.78, 0.9, 0.5 + Math.sin(time * 8) * 0.15);
      });
      a.aerators?.forEach((aer) => (aer.rotation.y += 0.2 * speed));
      if (a.aerationBubbles) {
        const pos = a.aerationBubbles.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) + 0.04 * speed;
          if (y > 4.8) y = 0.5;
          pos.setY(i, y);
        }
        pos.needsUpdate = true;
      }
      if (a.biogasFlare) {
        a.biogasFlare.intensity = 1.5 + Math.sin(time * 12) * 0.6 + Math.random() * 0.3;
      }
    });

    // --- ETP ---
    etpAnimated.forEach((etpObj) => {
      etpObj.etpEqualizationMixers.forEach((mix) => (mix.rotation.z += 0.25 * speed));
      etpObj.etpChemicalAgitators.forEach((agitator, aIdx) => {
        agitator.rotation.y += (aIdx === 2 ? 0.03 : 0.22) * speed;
      });
      if (etpObj.etpDafSkimmer) {
        etpObj.etpDafSkimmer.position.x = Math.sin(time * 0.45 * speed) * 3.5;
      }
      if (etpObj.etpDafMicroBubbles) {
        const mbPos = etpObj.etpDafMicroBubbles.geometry.attributes.position;
        for (let i = 0; i < mbPos.count; i++) {
          let y = mbPos.getY(i) + 0.035 * speed;
          if (y > 3.6) y = 0.5;
          mbPos.setY(i, y);
        }
        mbPos.needsUpdate = true;
      }
      if (etpObj.etpMbbrCarriers) {
        const cPos = etpObj.etpMbbrCarriers.geometry.attributes.position;
        for (let i = 0; i < cPos.count; i++) {
          let y = cPos.getY(i) + Math.sin(time * 3 + i) * 0.03 * speed;
          let x = cPos.getX(i) + Math.cos(time * 2 + i) * 0.02 * speed;
          if (y > 4.5) y = 1.0;
          if (y < 0.8) y = 4.2;
          cPos.setY(i, y);
          cPos.setX(i, x);
        }
        cPos.needsUpdate = true;
      }
      if (etpObj.etpMbbrBubbles) {
        const bPos = etpObj.etpMbbrBubbles.geometry.attributes.position;
        for (let i = 0; i < bPos.count; i++) {
          let y = bPos.getY(i) + 0.05 * speed;
          if (y > 4.8) y = 0.5;
          bPos.setY(i, y);
        }
        bPos.needsUpdate = true;
      }
      if (etpObj.etpSecondaryScraper) {
        etpObj.etpSecondaryScraper.rotation.y += 0.002 * speed;
      }
      if (etpObj.etpFilterPressIndicator) {
        const fpMat = etpObj.etpFilterPressIndicator.material as THREE.MeshBasicMaterial;
        fpMat.color.setHSL(0.38 + Math.sin(time * 4) * 0.05, 0.9, 0.5);
      }
      if (etpObj.etpZldPermeateGlow) {
        const zldMat = etpObj.etpZldPermeateGlow.material as THREE.MeshBasicMaterial;
        zldMat.opacity = 0.6 + Math.sin(time * 6) * 0.35;
      }
    });

    // --- SWM ---
    swmAnimated.forEach((swmObj) => {
      if (swmObj.trommelDrum) {
        swmObj.trommelDrum.rotation.x += 0.03 * speed;
      }
      swmObj.opticalLasers.forEach((laser, lIdx) => {
        const lMat = laser.material as THREE.MeshBasicMaterial;
        lMat.opacity = 0.35 + Math.sin(time * 10 + lIdx) * 0.25;
      });
      if (swmObj.biogasFlare) {
        swmObj.biogasFlare.intensity = 1.6 + Math.sin(time * 14) * 0.8 + Math.random() * 0.4;
      }
      if (swmObj.landfillGasFlare) {
        swmObj.landfillGasFlare.intensity = 1.6 + Math.sin(time * 13) * 0.7 + Math.random() * 0.4;
      }
      if (swmObj.compostTurner) {
        swmObj.compostTurner.position.x = Math.sin(time * 0.5 * speed) * 3.5;
      }
    });
  };

  return {
    group,
    update,
  };
}
