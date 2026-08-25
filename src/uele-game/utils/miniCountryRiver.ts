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
  const count = 100;
  for (let i = 0; i <= count; i++) {
    const t = (i / count) * 5200 - 400; // z from -400m to +4800m across 10 km
    const x = 160 + Math.sin(t * 0.008) * 90 - (t > 400 ? (t - 400) * 0.05 : 0);
    const y = -0.5; // Base river water level
    points.push(new THREE.Vector3(x, y, t));
  }

  const riverCurve = new THREE.CatmullRomCurve3(points);

  // River surface ribbon (width 65m across main channel)
  const riverWidth = 65;
  const segments = 240;
  const ribbonGeo = new THREE.PlaneGeometry(riverWidth, 5200, 20, segments);
  ribbonGeo.rotateX(-Math.PI / 2);

  const pos = ribbonGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const origX = pos.getX(i);
    const origZ = pos.getZ(i);
    const u = Math.max(0, Math.min(1, (origZ + 400) / 5200));
    const centerPt = riverCurve.getPointAt(u) || new THREE.Vector3(160, -0.5, origZ);
    const tangent = riverCurve.getTangentAt(u) || new THREE.Vector3(0, 0, 1);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    // Widen river as it approaches the southern sea
    const widthMultiplier = 1 + u * 2.5;
    const worldX = centerPt.x + normal.x * (origX * widthMultiplier);
    const worldZ = centerPt.z + normal.z * (origX * widthMultiplier);

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

  // Southern Coastal Bay of Bengal Water Expanse (10,000m x 4,000m)
  const oceanGeo = new THREE.PlaneGeometry(10000, 4000, 10, 10);
  oceanGeo.rotateX(-Math.PI / 2);
  const oceanMesh = new THREE.Mesh(oceanGeo, waterMat.clone());
  oceanMesh.position.set(0, -0.6, 3200);
  oceanMesh.name = 'southern_bay_ocean_mesh';

  // Village Ponds (Pukurs) Water Meshes
  const pondWaterMeshes: THREE.Mesh[] = [oceanMesh];
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
