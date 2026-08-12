import { ThreeDScene, Mesh3D, BoundingBox3D } from '../wtp/core/threeDEngine';
import { BimObject, BimGeometryType } from './bimModel';

function mapGeometryType(g: Mesh3D['geometryType']): BimGeometryType {
  switch (g) {
    case 'CYLINDER':
      return 'CYLINDER';
    case 'PIPE':
      return 'PIPE';
    case 'SPHERE':
      return 'SPHERE';
    case 'BOX':
    case 'BUILDING':
    case 'CUSTOM':
    default:
      return 'BOX';
  }
}

/** Convert a WTP digital-twin scene into shared BIM objects. */
export function fromWtpScene(scene: ThreeDScene): BimObject[] {
  return scene.meshes.map((mesh) => ({
    id: mesh.meshId,
    sourceTool: 'wtp',
    label: mesh.label,
    geometryType: mapGeometryType(mesh.geometryType),
    position: mesh.position,
    rotation: mesh.rotation,
    dimensions: {
      lengthM: mesh.dimensions.lengthM,
      widthM: mesh.dimensions.widthM,
      heightM: mesh.dimensions.heightM,
      radiusM: mesh.dimensions.radiusM,
    },
    colorHex: mesh.materialColorHex,
    opacity: mesh.opacity,
    wireframe: mesh.wireframe,
  }));
}

export type { BoundingBox3D };
