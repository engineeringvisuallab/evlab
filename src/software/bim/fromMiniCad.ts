import { CADObject, Layer } from '../minicad/types/cad';
import { BimObject } from './bimModel';

const DEFAULT_EXTRUDE_M = 0.3; // flat 2D shapes get a thin extrusion so they render as slabs in 3D

function resolveColor(obj: CADObject, layers: Layer[]): string {
  if (obj.color) return obj.color;
  const layer = layers.find((l) => l.id === obj.layerId);
  return layer?.color || '#94a3b8';
}

/**
 * Convert MiniCAD drawing objects into shared BIM objects. 2D shapes
 * (rectangle, circle) are extruded to a thin slab using their
 * `extrudeHeight`/`zPos` properties (or a small default) so a 2D floor
 * plan still shows up as a real volume in the combined BIM viewer.
 * Lines, polylines, arcs, text and dimensions are annotation/drafting
 * elements and are skipped — they carry no meaningful 3D volume.
 */
export function fromMiniCadObjects(objects: CADObject[], layers: Layer[]): BimObject[] {
  const result: BimObject[] = [];

  for (const obj of objects) {
    const color = resolveColor(obj, layers);
    const zBase = obj.zPos ?? 0;

    switch (obj.type) {
      case 'rectangle': {
        const height = obj.extrudeHeight ?? DEFAULT_EXTRUDE_M;
        result.push({
          id: obj.id,
          sourceTool: 'minicad',
          label: `Rectangle ${obj.id}`,
          geometryType: 'BOX',
          position: { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2, z: zBase + height / 2 },
          rotation: { x: 0, y: 0, z: 0 },
          dimensions: { lengthM: obj.width, widthM: obj.height, heightM: height },
          colorHex: color,
          opacity: 0.9,
          wireframe: false,
        });
        break;
      }
      case 'circle': {
        const height = obj.extrudeHeight ?? DEFAULT_EXTRUDE_M;
        result.push({
          id: obj.id,
          sourceTool: 'minicad',
          label: `Circle ${obj.id}`,
          geometryType: 'CYLINDER',
          position: { x: obj.centerX, y: obj.centerY, z: zBase + height / 2 },
          rotation: { x: 0, y: 0, z: 0 },
          dimensions: { lengthM: obj.radius * 2, widthM: obj.radius * 2, heightM: height, radiusM: obj.radius },
          colorHex: color,
          opacity: 0.9,
          wireframe: false,
        });
        break;
      }
      case 'box_3d': {
        result.push({
          id: obj.id,
          sourceTool: 'minicad',
          label: `Box ${obj.id}`,
          geometryType: 'BOX',
          position: { x: obj.x, y: obj.y, z: obj.z },
          rotation: { x: obj.rotationX ?? 0, y: obj.rotationY ?? 0, z: obj.rotationZ ?? 0 },
          dimensions: { lengthM: obj.length, widthM: obj.width, heightM: obj.height },
          colorHex: color,
          opacity: 1,
          wireframe: false,
        });
        break;
      }
      case 'cylinder_3d': {
        result.push({
          id: obj.id,
          sourceTool: 'minicad',
          label: `Cylinder ${obj.id}`,
          geometryType: 'CYLINDER',
          position: { x: obj.x, y: obj.y, z: obj.z },
          rotation: { x: 0, y: 0, z: 0 },
          dimensions: { lengthM: obj.radius * 2, widthM: obj.radius * 2, heightM: obj.height, radiusM: obj.radius },
          colorHex: color,
          opacity: 1,
          wireframe: false,
        });
        break;
      }
      case 'sphere_3d': {
        result.push({
          id: obj.id,
          sourceTool: 'minicad',
          label: `Sphere ${obj.id}`,
          geometryType: 'SPHERE',
          position: { x: obj.x, y: obj.y, z: obj.z },
          rotation: { x: 0, y: 0, z: 0 },
          dimensions: { lengthM: obj.radius * 2, widthM: obj.radius * 2, heightM: obj.radius * 2, radiusM: obj.radius },
          colorHex: color,
          opacity: 1,
          wireframe: false,
        });
        break;
      }
      case 'cone_3d': {
        result.push({
          id: obj.id,
          sourceTool: 'minicad',
          label: `Cone ${obj.id}`,
          geometryType: 'CONE',
          position: { x: obj.x, y: obj.y, z: obj.z },
          rotation: { x: 0, y: 0, z: 0 },
          dimensions: { lengthM: obj.radius * 2, widthM: obj.radius * 2, heightM: obj.height, radiusM: obj.radius },
          colorHex: color,
          opacity: 1,
          wireframe: false,
        });
        break;
      }
      default:
        // line, polyline, arc, text, dimension — skipped, see doc comment above.
        break;
    }
  }

  return result;
}
