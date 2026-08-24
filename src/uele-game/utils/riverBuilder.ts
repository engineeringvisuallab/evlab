import * as THREE from 'three';
import { createWaterNormalMap } from './terrainTextures';

export interface RiverSystem {
  waterMesh: THREE.Mesh;
  sandbarMesh: THREE.Mesh;
  pondWaterMesh: THREE.Mesh;
  updateAnimation: (time: number, monsoonIntensity: number, waterOffset: number) => void;
}

// Builds the authentic Karatoya River system with dynamic water levels & sediment
export function buildKaratoyaRiverSystem(): RiverSystem {
  const points: THREE.Vector3[] = [];
  const count = 50;
  for (let i = 0; i <= count; i++) {
    const t = (i / count) * 360 - 180; // z from -180 to 180
    const x = -10 + t * 0.32 + Math.sin(t * 0.028) * 16;
    const y = -0.65; // Base normal water level
    points.push(new THREE.Vector3(x, y, t));
  }

  const riverCurve = new THREE.CatmullRomCurve3(points);

  // River surface ribbon
  const riverWidth = 32;
  const segments = 120;
  const ribbonGeo = new THREE.PlaneGeometry(riverWidth, 360, 16, segments);
  ribbonGeo.rotateX(-Math.PI / 2);

  // Position vertices along the river spline
  const pos = ribbonGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const origX = pos.getX(i);
    const origZ = pos.getZ(i);
    const u = (origZ + 180) / 360;
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
    color: 0x2d6874, // Bengal river sediment-tinted teal/brown
    roughness: 0.12,
    metalness: 0.15,
    transmission: 0.6,
    transparent: true,
    opacity: 0.92,
    ior: 1.333,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.35, 0.35),
  });

  const waterMesh = new THREE.Mesh(ribbonGeo, waterMat);
  waterMesh.receiveShadow = true;
  waterMesh.name = 'karatoya_river_surface';

  // Sandbars (Chars) in middle reaches
  const sandbarGeo = new THREE.BufferGeometry();
  const sandbarMat = new THREE.MeshStandardMaterial({
    color: 0xc2ab7a, // Alluvial silt/sand
    roughness: 0.9,
    metalness: 0.05,
  });
  const sandbarMesh = new THREE.Mesh(sandbarGeo, sandbarMat);
  sandbarMesh.receiveShadow = true;

  // Village Pond (Pukur) Water Surface at (-55, 25)
  const pondGeo = new THREE.CircleGeometry(12, 24);
  pondGeo.rotateX(-Math.PI / 2);
  const pondMat = new THREE.MeshStandardMaterial({
    color: 0x1f4b3e, // Deep green algae-tinted village pond water
    roughness: 0.15,
    metalness: 0.2,
    transparent: true,
    opacity: 0.9,
  });
  const pondWaterMesh = new THREE.Mesh(pondGeo, pondMat);
  pondWaterMesh.position.set(-55, -0.6, 25);
  pondWaterMesh.receiveShadow = true;

  const updateAnimation = (time: number, monsoonIntensity: number, waterOffset: number) => {
    // Flowing texture scroll
    normalMap.offset.y = -(time * 0.08) % 1;
    normalMap.offset.x = (time * 0.02) % 1;

    // Water level dynamics (rises during monsoon rain or flood simulation)
    const totalLevel = -0.65 + monsoonIntensity * 0.75 + waterOffset * 0.025;
    waterMesh.position.y = THREE.MathUtils.lerp(waterMesh.position.y, totalLevel, 0.05);

    // Dynamic water color (turns more muddy-brown during high runoff)
    if (monsoonIntensity > 0.3) {
      waterMat.color.setHex(0x574a38); // Muddy flood silt
    } else {
      waterMat.color.setHex(0x2d6874); // Calm season
    }
  };

  return {
    waterMesh,
    sandbarMesh,
    pondWaterMesh,
    updateAnimation,
  };
}
