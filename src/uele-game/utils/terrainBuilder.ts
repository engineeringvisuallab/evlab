import * as THREE from 'three';
import { createBangladeshTerrainTexture } from './terrainTextures';

export interface TerrainElevationSampler {
  getElevationAt: (x: number, z: number) => number;
  mesh: THREE.Mesh;
}

// Generates the comprehensive realistic Bangladesh floodplain terrain
export function buildBangladeshTerrain(): TerrainElevationSampler {
  const width = 360;
  const depth = 360;
  const segments = 160;

  const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
  geo.rotateX(-Math.PI / 2);

  // Elevation calculation function
  const calcElevation = (x: number, z: number): number => {
    // 1. Regional gentle delta slope (low-relief floodplain)
    let y = Math.sin(x * 0.015) * 0.8 + Math.cos(z * 0.018) * 0.7;

    // 2. Agricultural field bund micro-relief (gentle rice terrace levels)
    const fieldX = Math.floor((x + 180) / 22);
    const fieldZ = Math.floor((z + 180) / 22);
    const fieldTerrace = ((fieldX * 3 + fieldZ * 7) % 5) * 0.15;
    y += fieldTerrace;

    // 3. Karatoya River Corridor (carving natural meandering river valley)
    // River centerline: x = -10 + z * 0.35 + sin(z * 0.03) * 14
    const riverCenter = -10 + z * 0.32 + Math.sin(z * 0.028) * 16;
    const distToRiver = Math.abs(x - riverCenter);

    if (distToRiver < 24) {
      // Natural parabolic channel cut with silt bank shelves
      const normDist = distToRiver / 24;
      const riverDepth = (1 - Math.cos(normDist * Math.PI)) * 0.5; // 0 at center, 1 at bank
      const channelCarve = (1 - normDist) * 3.8;
      y -= channelCarve;

      // Sandbar (char) emerging in middle reach
      if (z > -40 && z < 40 && distToRiver < 6) {
        y += 1.6 * (1 - Math.abs(z) / 40);
      }
    } else if (distToRiver < 36) {
      // Natural river embankment / levee (floodplain levee ridge)
      const leveeFactor = Math.sin(((distToRiver - 24) / 12) * Math.PI);
      y += leveeFactor * 0.6;
    }

    // 4. Highway N5 Corridor Embankment (runs roughly north-south at x = 45)
    const highwayDist = Math.abs(x - 45);
    if (highwayDist < 8) {
      // Raised engineered roadbed (1.5m above surrounding floodplain)
      const roadCrest = 1.6 * Math.max(0, 1 - Math.pow(highwayDist / 7.5, 2));
      y = Math.max(y, 1.8 + roadCrest * 0.4);
    } else if (highwayDist >= 8 && highwayDist < 13) {
      // Roadside drainage ditch depression
      y -= 0.6 * (1 - (highwayDist - 8) / 5);
    }

    // 5. Village Homestead Mound (Bari raised above normal flood levels)
    const distToVillage = Math.hypot(x - (-65), z - (-40));
    if (distToVillage < 35) {
      y += 1.2 * (1 - distToVillage / 35);
    }

    // 6. Excavated Village Pond (Pukur) for aquaculture & water supply
    const distToPond = Math.hypot(x - (-55), z - 25);
    if (distToPond < 14) {
      y -= 2.2 * (1 - distToPond / 14);
    }

    return y;
  };

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vz = pos.getZ(i);
    const vy = calcElevation(vx, vz);
    pos.setY(i, vy);
  }

  geo.computeVertexNormals();

  const terrainTex = createBangladeshTerrainTexture();
  const mat = new THREE.MeshStandardMaterial({
    map: terrainTex,
    roughness: 0.85,
    metalness: 0.08,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.name = 'bangladesh_terrain_mesh';

  return {
    getElevationAt: calcElevation,
    mesh,
  };
}
