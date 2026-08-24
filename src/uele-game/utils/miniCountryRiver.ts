import * as THREE from 'three';
import { createWaterNormalMap } from './terrainTextures';

export interface MiniCountryRiverSystem {
  waterMesh: THREE.Mesh;
  lakeMesh: THREE.Mesh;
  pondWaterMeshes: THREE.Mesh[];
  updateAnimation: (time: number, monsoonIntensity: number, waterOffset: number) => void;
}

export function buildMiniCountryRiver(): MiniCountryRiverSystem {
  const points: THREE.Vector3[] = [];
  const count = 60;
  for (let i = 0; i <= count; i++) {
    const t = (i / count) * 560 - 200; // z from -200 to +360
    const x = 160 + Math.sin(t * 0.015) * 45 - t * 0.08;
    const y = -0.5; // Base river water level
    points.push(new THREE.Vector3(x, y, t));
  }

  const riverCurve = new THREE.CatmullRomCurve3(points);

  // River surface ribbon (width 40m)
  const riverWidth = 42;
  const segments = 140;
  const ribbonGeo = new THREE.PlaneGeometry(riverWidth, 560, 16, segments);
  ribbonGeo.rotateX(-Math.PI / 2);

  const pos = ribbonGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const origX = pos.getX(i);
    const origZ = pos.getZ(i);
    const u = (origZ + 200) / 560;
    const centerPt = riverCurve.getPointAt(Math.max(0, Math.min(1, u)));
    const tangent = riverCurve.getTangentAt(Math.max(0, Math.min(1, u)));
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    const worldX = centerPt.x + normal.x * origX;
    const worldZ = centerPt.z + normal.z * origX;

    pos.setX(i, worldX);
    pos.setY(i, centerPt.y);
    pos.setZ(i, worldZ);
  }
  ribbonGeo.computeVertexNormals();

  const normalMap = createWaterNormalMap();
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x226b74, // Bengal sediment-rich river turquoise
    roughness: 0.12,
    metalness: 0.18,
    transmission: 0.65,
    transparent: true,
    opacity: 0.92,
    ior: 1.333,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.35, 0.35),
  });

  const waterMesh = new THREE.Mesh(ribbonGeo, waterMat);
  waterMesh.receiveShadow = true;
  waterMesh.name = 'mini_country_river_mesh';

  // High Mountain Reservoir Lake Water Mesh
  const lakeGeo = new THREE.CircleGeometry(65, 32);
  lakeGeo.rotateX(-Math.PI / 2);
  const lakeMesh = new THREE.Mesh(lakeGeo, waterMat.clone());
  lakeMesh.position.set(180, 15.5, -260);

  // Village Ponds (Pukurs) Water Meshes
  const pondWaterMeshes: THREE.Mesh[] = [];
  const pondData = [
    [-220, 40, 18],
    [-140, -80, 15],
  ];

  pondData.forEach(([px, pz, pr]) => {
    const pondGeo = new THREE.CircleGeometry(pr, 24);
    pondGeo.rotateX(-Math.PI / 2);
    const pondMat = new THREE.MeshStandardMaterial({
      color: 0x1f4b3e, // Deep green algae-tinted aquaculture pond
      roughness: 0.2,
      metalness: 0.15,
      transparent: true,
      opacity: 0.9,
    });
    const pMesh = new THREE.Mesh(pondGeo, pondMat);
    pMesh.position.set(px, -0.6, pz);
    pondWaterMeshes.push(pMesh);
  });

  const updateAnimation = (time: number, monsoonIntensity: number, waterOffset: number) => {
    normalMap.offset.y = -(time * 0.08) % 1;
    normalMap.offset.x = (time * 0.02) % 1;

    const totalLevel = -0.5 + monsoonIntensity * 0.8 + waterOffset * 0.025;
    waterMesh.position.y = THREE.MathUtils.lerp(waterMesh.position.y, totalLevel, 0.05);

    if (monsoonIntensity > 0.3) {
      waterMat.color.setHex(0x524835); // Muddy monsoon sediment run-off
    } else {
      waterMat.color.setHex(0x226b74);
    }
  };

  return {
    waterMesh,
    lakeMesh,
    pondWaterMeshes,
    updateAnimation,
  };
}
