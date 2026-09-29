import * as THREE from 'three';

// Shared materials extracted from the standalone
// 3d-water-treatment-plant-visualization app's ThreeCanvas.tsx,
// reused by the WTP and ETP campus builders so their look matches.
export function createSharedPlantMaterials(): Record<string, THREE.Material> {
  return {
    concrete: new THREE.MeshStandardMaterial({ color: 0xc8ced4, roughness: 0.7, metalness: 0.1 }),
    concreteDark: new THREE.MeshStandardMaterial({ color: 0x8a949e, roughness: 0.8 }),
    pipeBlue: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.6 }),
    pipeGreen: new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3, metalness: 0.5 }),
    pipeOrange: new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.3, metalness: 0.5 }),
    pipePurple: new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.3, metalness: 0.6 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.75 }),
    tankDome: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.3 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65, roughness: 0.1, metalness: 0.8 }),
    greenRoof: new THREE.MeshStandardMaterial({ color: 0x2e5c2b, roughness: 0.9 }),
    hazardYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 }),
  };
}
