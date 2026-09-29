import * as THREE from 'three';
import { buildAccurateRiverSystem, getRiverCenterZ, getRiverTangentAndNormal, RIVER_HALF_WIDTH, RIVER_WATER_LEVEL } from './riverAndBridges';

export interface MiniCountryRiverSystem {
  waterMesh: THREE.Mesh;
  lakeMesh: THREE.Mesh;
  pondWaterMeshes: THREE.Mesh[];
  updateAnimation: (time: number, monsoonIntensity: number, waterOffset: number) => void;
}

export { getRiverCenterZ, getRiverTangentAndNormal, RIVER_HALF_WIDTH, RIVER_WATER_LEVEL };

/**
 * Builds the Master Plan 10 km x 10 km accurately aligned Karatoya River & Water bodies
 */
export function buildMiniCountryRiver(): MiniCountryRiverSystem {
  const riverSystem = buildAccurateRiverSystem();

  const updateAnimation = (time: number, monsoonIntensity: number, _waterOffset: number) => {
    riverSystem.update(0.016, time, monsoonIntensity);
  };

  return {
    waterMesh: riverSystem.waterMesh,
    lakeMesh: riverSystem.lakeMesh,
    pondWaterMeshes: riverSystem.pondMeshes,
    updateAnimation,
  };
}
