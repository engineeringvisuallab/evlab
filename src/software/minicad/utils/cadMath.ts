import {
  Point2D,
  TransformState,
  CADObject,
  SnapPoint,
  SnapSettings,
  LineObject,
  PolylineObject,
  RectangleObject,
  CircleObject,
  ArcObject,
  DimensionObject,
  TextObject,
  Box3DObject,
  Cylinder3DObject,
  Sphere3DObject,
  Cone3DObject,
  GripPoint,
} from '../types/cad';

// Screen to World transformation (Standard CAD coordinates where Y increases upwards)
export function screenToWorld(
  screenPt: Point2D,
  transform: TransformState,
  canvasWidth: number,
  canvasHeight: number
): Point2D {
  const originX = canvasWidth / 2 + transform.panX;
  const originY = canvasHeight / 2 + transform.panY;

  const worldX = (screenPt.x - originX) / transform.zoom;
  // CAD Y goes up, Screen Y goes down
  const worldY = (originY - screenPt.y) / transform.zoom;

  return { x: worldX, y: worldY };
}

// World to Screen transformation
export function worldToScreen(
  worldPt: Point2D,
  transform: TransformState,
  canvasWidth: number,
  canvasHeight: number
): Point2D {
  const originX = canvasWidth / 2 + transform.panX;
  const originY = canvasHeight / 2 + transform.panY;

  const screenX = originX + worldPt.x * transform.zoom;
  const screenY = originY - worldPt.y * transform.zoom;

  return { x: screenX, y: screenY };
}

// Distance between two points
export function distance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.hypot(dx, dy);
}

// Midpoint between two points
export function midpoint(p1: Point2D, p2: Point2D): Point2D {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

// Angle between two points in degrees (0 to 360)
export function angleBetweenDeg(p1: Point2D, p2: Point2D): number {
  const radians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  let degrees = (radians * 180) / Math.PI;
  if (degrees < 0) degrees += 360;
  return degrees;
}

// Distance from point to line segment
export function distanceToSegment(pt: Point2D, p1: Point2D, p2: Point2D): number {
  const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
  if (l2 === 0) return distance(pt, p1);

  let t = ((pt.x - p1.x) * (p2.x - p1.x) + (pt.y - p1.y) * (p2.y - p1.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projection = {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  };

  return distance(pt, projection);
}

// Snap cursor to nearest grid or object feature
export function snapToGridPoint(worldPt: Point2D, gridSize: number): Point2D {
  return {
    x: Math.round(worldPt.x / gridSize) * gridSize,
    y: Math.round(worldPt.y / gridSize) * gridSize,
  };
}

// Ortho alignment (forces line to 0, 90, 180, 270 degrees)
export function applyOrtho(startPt: Point2D, currentPt: Point2D): Point2D {
  const dx = Math.abs(currentPt.x - startPt.x);
  const dy = Math.abs(currentPt.y - startPt.y);

  if (dx > dy) {
    return { x: currentPt.x, y: startPt.y };
  } else {
    return { x: startPt.x, y: currentPt.y };
  }
}

// Find closest snap point among objects and grid
export function findSnapPoint(
  cursorWorld: Point2D,
  objects: CADObject[],
  settings: SnapSettings,
  zoomScale: number,
  screenTolerancePx = 15
): SnapPoint | null {
  const toleranceWorld = screenTolerancePx / zoomScale;
  let bestSnap: SnapPoint | null = null;
  let minDistance = toleranceWorld;

  // 1. Check Object Endpoints & Midpoints & Center
  for (const obj of objects) {
    if (obj.type === 'line') {
      const line = obj as LineObject;
      const p1 = { x: line.startX, y: line.startY };
      const p2 = { x: line.endX, y: line.endY };

      if (settings.endpoint) {
        const d1 = distance(cursorWorld, p1);
        if (d1 < minDistance) {
          minDistance = d1;
          bestSnap = { point: p1, type: 'endpoint', label: 'Endpoint', sourceObjectId: obj.id };
        }
        const d2 = distance(cursorWorld, p2);
        if (d2 < minDistance) {
          minDistance = d2;
          bestSnap = { point: p2, type: 'endpoint', label: 'Endpoint', sourceObjectId: obj.id };
        }
      }

      if (settings.midpoint) {
        const mid = midpoint(p1, p2);
        const dMid = distance(cursorWorld, mid);
        if (dMid < minDistance) {
          minDistance = dMid;
          bestSnap = { point: mid, type: 'midpoint', label: 'Midpoint', sourceObjectId: obj.id };
        }
      }
    } else if (obj.type === 'rectangle') {
      const rect = obj as RectangleObject;
      const corners: Point2D[] = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: rect.x, y: rect.y + rect.height },
      ];

      if (settings.endpoint) {
        for (const corner of corners) {
          const d = distance(cursorWorld, corner);
          if (d < minDistance) {
            minDistance = d;
            bestSnap = { point: corner, type: 'endpoint', label: 'Endpoint', sourceObjectId: obj.id };
          }
        }
      }

      if (settings.center) {
        const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        const dCenter = distance(cursorWorld, center);
        if (dCenter < minDistance) {
          minDistance = dCenter;
          bestSnap = { point: center, type: 'center', label: 'Center', sourceObjectId: obj.id };
        }
      }
    } else if (obj.type === 'circle') {
      const circle = obj as CircleObject;
      const center = { x: circle.centerX, y: circle.centerY };

      if (settings.center) {
        const dCenter = distance(cursorWorld, center);
        if (dCenter < minDistance) {
          minDistance = dCenter;
          bestSnap = { point: center, type: 'center', label: 'Center', sourceObjectId: obj.id };
        }
      }

      if (settings.endpoint) {
        // Quadrant points on circle
        const quadrants: Point2D[] = [
          { x: circle.centerX + circle.radius, y: circle.centerY },
          { x: circle.centerX - circle.radius, y: circle.centerY },
          { x: circle.centerX, y: circle.centerY + circle.radius },
          { x: circle.centerX, y: circle.centerY - circle.radius },
        ];
        for (const quad of quadrants) {
          const d = distance(cursorWorld, quad);
          if (d < minDistance) {
            minDistance = d;
            bestSnap = { point: quad, type: 'endpoint', label: 'Quadrant', sourceObjectId: obj.id };
          }
        }
      }
    } else if (obj.type === 'polyline') {
      const poly = obj as PolylineObject;
      if (settings.endpoint && poly.points.length > 0) {
        for (const pt of poly.points) {
          const d = distance(cursorWorld, pt);
          if (d < minDistance) {
            minDistance = d;
            bestSnap = { point: pt, type: 'endpoint', label: 'Vertex', sourceObjectId: obj.id };
          }
        }
      }
      if (settings.midpoint && poly.points.length > 1) {
        for (let i = 0; i < poly.points.length - 1; i++) {
          const mid = midpoint(poly.points[i], poly.points[i + 1]);
          const dMid = distance(cursorWorld, mid);
          if (dMid < minDistance) {
            minDistance = dMid;
            bestSnap = { point: mid, type: 'midpoint', label: 'Midpoint', sourceObjectId: obj.id };
          }
        }
      }
    }
  }

  // 2. Check Grid Snap if no object snap found or if grid snap is closer
  if (settings.grid) {
    const gridPt = snapToGridPoint(cursorWorld, settings.gridSize);
    const dGrid = distance(cursorWorld, gridPt);
    if (dGrid < minDistance) {
      bestSnap = { point: gridPt, type: 'grid', label: 'Grid' };
    }
  }

  return bestSnap;
}

// Hit test for selecting objects with click
export function hitTestObject(
  cursorWorld: Point2D,
  obj: CADObject,
  toleranceWorld: number
): boolean {
  if (obj.type === 'line') {
    const line = obj as LineObject;
    return (
      distanceToSegment(
        cursorWorld,
        { x: line.startX, y: line.startY },
        { x: line.endX, y: line.endY }
      ) <= toleranceWorld
    );
  } else if (obj.type === 'rectangle') {
    const rect = obj as RectangleObject;
    const p1 = { x: rect.x, y: rect.y };
    const p2 = { x: rect.x + rect.width, y: rect.y };
    const p3 = { x: rect.x + rect.width, y: rect.y + rect.height };
    const p4 = { x: rect.x, y: rect.y + rect.height };

    const edges = [
      distanceToSegment(cursorWorld, p1, p2),
      distanceToSegment(cursorWorld, p2, p3),
      distanceToSegment(cursorWorld, p3, p4),
      distanceToSegment(cursorWorld, p4, p1),
    ];
    return Math.min(...edges) <= toleranceWorld;
  } else if (obj.type === 'circle') {
    const circle = obj as CircleObject;
    const dCenter = distance(cursorWorld, { x: circle.centerX, y: circle.centerY });
    return Math.abs(dCenter - circle.radius) <= toleranceWorld;
  } else if (obj.type === 'polyline') {
    const poly = obj as PolylineObject;
    for (let i = 0; i < poly.points.length - 1; i++) {
      if (distanceToSegment(cursorWorld, poly.points[i], poly.points[i + 1]) <= toleranceWorld) {
        return true;
      }
    }
    return false;
  } else if (obj.type === 'dimension') {
    const dim = obj as any;
    return (
      distanceToSegment(
        cursorWorld,
        { x: dim.startX, y: dim.startY },
        { x: dim.endX, y: dim.endY }
      ) <= toleranceWorld
    );
  } else if (obj.type === 'text') {
    const textObj = obj as any;
    const dist = distance(cursorWorld, { x: textObj.x, y: textObj.y });
    return dist <= toleranceWorld * 3;
  }
  return false;
}

// Calculate bounding box of object
export function getObjectBoundingBox(obj: CADObject): { minX: number; minY: number; maxX: number; maxY: number } {
  if (obj.type === 'line') {
    const line = obj as LineObject;
    return {
      minX: Math.min(line.startX, line.endX),
      minY: Math.min(line.startY, line.endY),
      maxX: Math.max(line.startX, line.endX),
      maxY: Math.max(line.startY, line.endY),
    };
  } else if (obj.type === 'rectangle') {
    const rect = obj as RectangleObject;
    return {
      minX: Math.min(rect.x, rect.x + rect.width),
      minY: Math.min(rect.y, rect.y + rect.height),
      maxX: Math.max(rect.x, rect.x + rect.width),
      maxY: Math.max(rect.y, rect.y + rect.height),
    };
  } else if (obj.type === 'circle') {
    const circle = obj as CircleObject;
    return {
      minX: circle.centerX - circle.radius,
      minY: circle.centerY - circle.radius,
      maxX: circle.centerX + circle.radius,
      maxY: circle.centerY + circle.radius,
    };
  } else if (obj.type === 'polyline') {
    const poly = obj as PolylineObject;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of poly.points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return { minX, minY, maxX, maxY };
  } else if (obj.type === 'dimension') {
    const dim = obj as DimensionObject;
    return {
      minX: Math.min(dim.startX, dim.endX),
      minY: Math.min(dim.startY, dim.endY),
      maxX: Math.max(dim.startX, dim.endX),
      maxY: Math.max(dim.startY, dim.endY),
    };
  } else if (obj.type === 'text') {
    const textObj = obj as TextObject;
    return {
      minX: textObj.x,
      minY: textObj.y,
      maxX: textObj.x + (textObj.text.length * textObj.fontSize * 0.6),
      maxY: textObj.y + textObj.fontSize,
    };
  } else if (obj.type === 'box_3d') {
    const box = obj as Box3DObject;
    return {
      minX: Math.min(box.x, box.x + box.width),
      minY: Math.min(box.y, box.y + box.length),
      maxX: Math.max(box.x, box.x + box.width),
      maxY: Math.max(box.y, box.y + box.length),
    };
  } else if (obj.type === 'cylinder_3d') {
    const cyl = obj as Cylinder3DObject;
    return {
      minX: cyl.x - cyl.radius,
      minY: cyl.y - cyl.radius,
      maxX: cyl.x + cyl.radius,
      maxY: cyl.y + cyl.radius,
    };
  } else if (obj.type === 'sphere_3d') {
    const sph = obj as Sphere3DObject;
    return {
      minX: sph.x - sph.radius,
      minY: sph.y - sph.radius,
      maxX: sph.x + sph.radius,
      maxY: sph.y + sph.radius,
    };
  } else if (obj.type === 'cone_3d') {
    const cone = obj as Cone3DObject;
    return {
      minX: cone.x - cone.radius,
      minY: cone.y - cone.radius,
      maxX: cone.x + cone.radius,
      maxY: cone.y + cone.radius,
    };
  }
  return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
}

export function rotatePoint(pt: Point2D, center: Point2D, angleDeg: number): Point2D {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = pt.x - center.x;
  const dy = pt.y - center.y;
  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
}

export function mirrorPointAcrossLine(pt: Point2D, p1: Point2D, p2: Point2D): Point2D {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { ...pt };

  const t = ((pt.x - p1.x) * dx + (pt.y - p1.y) * dy) / lenSq;
  const projX = p1.x + t * dx;
  const projY = p1.y + t * dy;

  return {
    x: 2 * projX - pt.x,
    y: 2 * projY - pt.y,
  };
}

export function scalePoint(pt: Point2D, center: Point2D, scaleFactor: number): Point2D {
  return {
    x: center.x + (pt.x - center.x) * scaleFactor,
    y: center.y + (pt.y - center.y) * scaleFactor,
  };
}

export function translateObject(obj: CADObject, dx: number, dy: number, dz = 0): CADObject {
  if (obj.type === 'line') {
    const l = obj as LineObject;
    return {
      ...l,
      startX: l.startX + dx,
      startY: l.startY + dy,
      endX: l.endX + dx,
      endY: l.endY + dy,
      zPos: (l.zPos || 0) + dz,
    };
  } else if (obj.type === 'rectangle') {
    const r = obj as RectangleObject;
    return {
      ...r,
      x: r.x + dx,
      y: r.y + dy,
      zPos: (r.zPos || 0) + dz,
    };
  } else if (obj.type === 'circle') {
    const c = obj as CircleObject;
    return {
      ...c,
      centerX: c.centerX + dx,
      centerY: c.centerY + dy,
      zPos: (c.zPos || 0) + dz,
    };
  } else if (obj.type === 'polyline') {
    const p = obj as PolylineObject;
    return {
      ...p,
      points: p.points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })),
      zPos: (p.zPos || 0) + dz,
    };
  } else if (obj.type === 'dimension') {
    const d = obj as DimensionObject;
    return {
      ...d,
      startX: d.startX + dx,
      startY: d.startY + dy,
      endX: d.endX + dx,
      endY: d.endY + dy,
      zPos: (d.zPos || 0) + dz,
    };
  } else if (obj.type === 'text') {
    const t = obj as TextObject;
    return {
      ...t,
      x: t.x + dx,
      y: t.y + dy,
      zPos: (t.zPos || 0) + dz,
    };
  } else if (obj.type === 'box_3d') {
    const b = obj as Box3DObject;
    return { ...b, x: b.x + dx, y: b.y + dy, z: (b.z || 0) + dz };
  } else if (obj.type === 'cylinder_3d') {
    const c = obj as Cylinder3DObject;
    return { ...c, x: c.x + dx, y: c.y + dy, z: (c.z || 0) + dz };
  } else if (obj.type === 'sphere_3d') {
    const s = obj as Sphere3DObject;
    return { ...s, x: s.x + dx, y: s.y + dy, z: (s.z || 0) + dz };
  } else if (obj.type === 'cone_3d') {
    const cn = obj as Cone3DObject;
    return { ...cn, x: cn.x + dx, y: cn.y + dy, z: (cn.z || 0) + dz };
  }
  return obj;
}

export function rotateObject(obj: CADObject, center: Point2D, angleDeg: number): CADObject {
  if (obj.type === 'line') {
    const l = obj as LineObject;
    const p1 = rotatePoint({ x: l.startX, y: l.startY }, center, angleDeg);
    const p2 = rotatePoint({ x: l.endX, y: l.endY }, center, angleDeg);
    return { ...l, startX: p1.x, startY: p1.y, endX: p2.x, endY: p2.y };
  } else if (obj.type === 'circle') {
    const c = obj as CircleObject;
    const p = rotatePoint({ x: c.centerX, y: c.centerY }, center, angleDeg);
    return { ...c, centerX: p.x, centerY: p.y };
  } else if (obj.type === 'rectangle') {
    const r = obj as RectangleObject;
    const c1 = rotatePoint({ x: r.x, y: r.y }, center, angleDeg);
    const c2 = rotatePoint({ x: r.x + r.width, y: r.y }, center, angleDeg);
    const c3 = rotatePoint({ x: r.x + r.width, y: r.y + r.height }, center, angleDeg);
    const c4 = rotatePoint({ x: r.x, y: r.y + r.height }, center, angleDeg);

    // If angle is orthogonal (multiple of 90 degrees)
    const normAngle = Math.abs(angleDeg % 360);
    if (Math.abs(normAngle % 90) < 0.01) {
      const minX = Math.min(c1.x, c2.x, c3.x, c4.x);
      const maxX = Math.max(c1.x, c2.x, c3.x, c4.x);
      const minY = Math.min(c1.y, c2.y, c3.y, c4.y);
      const maxY = Math.max(c1.y, c2.y, c3.y, c4.y);
      return { ...r, x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    } else {
      // Non-orthogonal angle: convert rectangle to polyline to preserve exact rotated geometry
      return {
        id: r.id,
        type: 'polyline',
        layerId: r.layerId,
        color: r.color,
        lineWeight: r.lineWeight,
        lineType: r.lineType,
        extrudeHeight: r.extrudeHeight,
        zPos: r.zPos,
        points: [c1, c2, c3, c4, c1],
        closed: true,
      } as PolylineObject;
    }
  } else if (obj.type === 'polyline') {
    const p = obj as PolylineObject;
    return {
      ...p,
      points: p.points.map((pt) => rotatePoint(pt, center, angleDeg)),
    };
  } else if (obj.type === 'dimension') {
    const d = obj as DimensionObject;
    const p1 = rotatePoint({ x: d.startX, y: d.startY }, center, angleDeg);
    const p2 = rotatePoint({ x: d.endX, y: d.endY }, center, angleDeg);
    return { ...d, startX: p1.x, startY: p1.y, endX: p2.x, endY: p2.y };
  } else if (obj.type === 'text') {
    const t = obj as TextObject;
    const p = rotatePoint({ x: t.x, y: t.y }, center, angleDeg);
    return { ...t, x: p.x, y: p.y };
  } else if (obj.type === 'box_3d') {
    const b = obj as Box3DObject;
    const p = rotatePoint({ x: b.x, y: b.y }, center, angleDeg);
    return { ...b, x: p.x, y: p.y, rotationZ: ((b.rotationZ || 0) + angleDeg) % 360 };
  } else if (obj.type === 'cylinder_3d') {
    const c = obj as Cylinder3DObject;
    const p = rotatePoint({ x: c.x, y: c.y }, center, angleDeg);
    return { ...c, x: p.x, y: p.y };
  } else if (obj.type === 'sphere_3d') {
    const s = obj as Sphere3DObject;
    const p = rotatePoint({ x: s.x, y: s.y }, center, angleDeg);
    return { ...s, x: p.x, y: p.y };
  } else if (obj.type === 'cone_3d') {
    const cn = obj as Cone3DObject;
    const p = rotatePoint({ x: cn.x, y: cn.y }, center, angleDeg);
    return { ...cn, x: p.x, y: p.y };
  }
  return obj;
}

export function mirrorObject(obj: CADObject, p1: Point2D, p2: Point2D): CADObject {
  if (obj.type === 'line') {
    const l = obj as LineObject;
    const m1 = mirrorPointAcrossLine({ x: l.startX, y: l.startY }, p1, p2);
    const m2 = mirrorPointAcrossLine({ x: l.endX, y: l.endY }, p1, p2);
    return { ...l, startX: m1.x, startY: m1.y, endX: m2.x, endY: m2.y };
  } else if (obj.type === 'circle') {
    const c = obj as CircleObject;
    const m = mirrorPointAcrossLine({ x: c.centerX, y: c.centerY }, p1, p2);
    return { ...c, centerX: m.x, centerY: m.y };
  } else if (obj.type === 'rectangle') {
    const r = obj as RectangleObject;
    const c1 = mirrorPointAcrossLine({ x: r.x, y: r.y }, p1, p2);
    const c2 = mirrorPointAcrossLine({ x: r.x + r.width, y: r.y }, p1, p2);
    const c3 = mirrorPointAcrossLine({ x: r.x + r.width, y: r.y + r.height }, p1, p2);
    const c4 = mirrorPointAcrossLine({ x: r.x, y: r.y + r.height }, p1, p2);

    const minX = Math.min(c1.x, c2.x, c3.x, c4.x);
    const maxX = Math.max(c1.x, c2.x, c3.x, c4.x);
    const minY = Math.min(c1.y, c2.y, c3.y, c4.y);
    const maxY = Math.max(c1.y, c2.y, c3.y, c4.y);
    return { ...r, x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  } else if (obj.type === 'polyline') {
    const p = obj as PolylineObject;
    return {
      ...p,
      points: p.points.map((pt) => mirrorPointAcrossLine(pt, p1, p2)),
    };
  } else if (obj.type === 'dimension') {
    const d = obj as DimensionObject;
    const m1 = mirrorPointAcrossLine({ x: d.startX, y: d.startY }, p1, p2);
    const m2 = mirrorPointAcrossLine({ x: d.endX, y: d.endY }, p1, p2);
    return { ...d, startX: m1.x, startY: m1.y, endX: m2.x, endY: m2.y };
  } else if (obj.type === 'text') {
    const t = obj as TextObject;
    const m = mirrorPointAcrossLine({ x: t.x, y: t.y }, p1, p2);
    return { ...t, x: m.x, y: m.y };
  } else if (obj.type === 'box_3d') {
    const b = obj as Box3DObject;
    const m = mirrorPointAcrossLine({ x: b.x, y: b.y }, p1, p2);
    return { ...b, x: m.x, y: m.y };
  } else if (obj.type === 'cylinder_3d') {
    const c = obj as Cylinder3DObject;
    const m = mirrorPointAcrossLine({ x: c.x, y: c.y }, p1, p2);
    return { ...c, x: m.x, y: m.y };
  } else if (obj.type === 'sphere_3d') {
    const s = obj as Sphere3DObject;
    const m = mirrorPointAcrossLine({ x: s.x, y: s.y }, p1, p2);
    return { ...s, x: m.x, y: m.y };
  } else if (obj.type === 'cone_3d') {
    const cn = obj as Cone3DObject;
    const m = mirrorPointAcrossLine({ x: cn.x, y: cn.y }, p1, p2);
    return { ...cn, x: m.x, y: m.y };
  }
  return obj;
}

export function scaleObject(obj: CADObject, center: Point2D, scaleFactor: number): CADObject {
  const s = scaleFactor;
  const absS = Math.abs(s);

  if (obj.type === 'line') {
    const l = obj as LineObject;
    const p1 = scalePoint({ x: l.startX, y: l.startY }, center, s);
    const p2 = scalePoint({ x: l.endX, y: l.endY }, center, s);
    return { ...l, startX: p1.x, startY: p1.y, endX: p2.x, endY: p2.y };
  } else if (obj.type === 'circle') {
    const c = obj as CircleObject;
    const p = scalePoint({ x: c.centerX, y: c.centerY }, center, s);
    return { ...c, centerX: p.x, centerY: p.y, radius: Math.max(0.5, c.radius * absS) };
  } else if (obj.type === 'rectangle') {
    const r = obj as RectangleObject;
    const c1 = scalePoint({ x: r.x, y: r.y }, center, s);
    const c2 = scalePoint({ x: r.x + r.width, y: r.y }, center, s);
    const c3 = scalePoint({ x: r.x + r.width, y: r.y + r.height }, center, s);
    const c4 = scalePoint({ x: r.x, y: r.y + r.height }, center, s);

    const minX = Math.min(c1.x, c2.x, c3.x, c4.x);
    const maxX = Math.max(c1.x, c2.x, c3.x, c4.x);
    const minY = Math.min(c1.y, c2.y, c3.y, c4.y);
    const maxY = Math.max(c1.y, c2.y, c3.y, c4.y);
    return { ...r, x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  } else if (obj.type === 'polyline') {
    const p = obj as PolylineObject;
    return {
      ...p,
      points: p.points.map((pt) => scalePoint(pt, center, s)),
    };
  } else if (obj.type === 'dimension') {
    const d = obj as DimensionObject;
    const p1 = scalePoint({ x: d.startX, y: d.startY }, center, s);
    const p2 = scalePoint({ x: d.endX, y: d.endY }, center, s);
    return { ...d, startX: p1.x, startY: p1.y, endX: p2.x, endY: p2.y };
  } else if (obj.type === 'text') {
    const t = obj as TextObject;
    const p = scalePoint({ x: t.x, y: t.y }, center, s);
    return { ...t, x: p.x, y: p.y, fontSize: Math.max(2, t.fontSize * absS) };
  } else if (obj.type === 'box_3d') {
    const b = obj as Box3DObject;
    const p = scalePoint({ x: b.x, y: b.y }, center, s);
    return { ...b, x: p.x, y: p.y, width: Math.max(1, b.width * absS), length: Math.max(1, b.length * absS), height: Math.max(1, b.height * absS) };
  } else if (obj.type === 'cylinder_3d') {
    const c = obj as Cylinder3DObject;
    const p = scalePoint({ x: c.x, y: c.y }, center, s);
    return { ...c, x: p.x, y: p.y, radius: Math.max(0.5, c.radius * absS), height: Math.max(1, c.height * absS) };
  } else if (obj.type === 'sphere_3d') {
    const sp = obj as Sphere3DObject;
    const p = scalePoint({ x: sp.x, y: sp.y }, center, s);
    return { ...sp, x: p.x, y: p.y, radius: Math.max(0.5, sp.radius * absS) };
  } else if (obj.type === 'cone_3d') {
    const cn = obj as Cone3DObject;
    const p = scalePoint({ x: cn.x, y: cn.y }, center, s);
    return { ...cn, x: p.x, y: p.y, radius: Math.max(0.5, cn.radius * absS), height: Math.max(1, cn.height * absS) };
  }
  return obj;
}


function isPointInBox(
  pt: Point2D,
  box: { minX: number; minY: number; maxX: number; maxY: number }
): boolean {
  return pt.x >= box.minX && pt.x <= box.maxX && pt.y >= box.minY && pt.y <= box.maxY;
}

// Line segment intersection with AABB box
export function segmentIntersectsBox(
  p1: Point2D,
  p2: Point2D,
  box: { minX: number; minY: number; maxX: number; maxY: number }
): boolean {
  if (isPointInBox(p1, box) || isPointInBox(p2, box)) return true;

  // Check box edges
  const top: [Point2D, Point2D] = [{ x: box.minX, y: box.minY }, { x: box.maxX, y: box.minY }];
  const bottom: [Point2D, Point2D] = [{ x: box.minX, y: box.maxY }, { x: box.maxX, y: box.maxY }];
  const left: [Point2D, Point2D] = [{ x: box.minX, y: box.minY }, { x: box.minX, y: box.maxY }];
  const right: [Point2D, Point2D] = [{ x: box.maxX, y: box.minY }, { x: box.maxX, y: box.maxY }];

  for (const edge of [top, bottom, left, right]) {
    if (segmentsIntersect(p1, p2, edge[0], edge[1])) return true;
  }
  return false;
}

function segmentsIntersect(a: Point2D, b: Point2D, c: Point2D, d: Point2D): boolean {
  const ccw = (p1: Point2D, p2: Point2D, p3: Point2D) =>
    (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

// Window Selection: Strictly enclosed inside box
export function isObjectInsideWindow(
  obj: CADObject,
  win: { minX: number; minY: number; maxX: number; maxY: number }
): boolean {
  const bb = getObjectBoundingBox(obj);
  return (
    bb.minX >= win.minX &&
    bb.maxX <= win.maxX &&
    bb.minY >= win.minY &&
    bb.maxY <= win.maxY
  );
}

// Crossing Selection: Enclosed OR intersecting/touching box
export function isObjectCrossingWindow(
  obj: CADObject,
  win: { minX: number; minY: number; maxX: number; maxY: number }
): boolean {
  if (isObjectInsideWindow(obj, win)) return true;

  const bb = getObjectBoundingBox(obj);
  // Bounding box overlap check first
  if (bb.maxX < win.minX || bb.minX > win.maxX || bb.maxY < win.minY || bb.minY > win.maxY) {
    return false;
  }

  if (obj.type === 'line') {
    const line = obj as LineObject;
    return segmentIntersectsBox({ x: line.startX, y: line.startY }, { x: line.endX, y: line.endY }, win);
  } else if (obj.type === 'polyline') {
    const poly = obj as PolylineObject;
    for (let i = 0; i < poly.points.length - 1; i++) {
      if (segmentIntersectsBox(poly.points[i], poly.points[i + 1], win)) return true;
    }
    return false;
  } else if (obj.type === 'circle') {
    const circle = obj as CircleObject;
    const center = { x: circle.centerX, y: circle.centerY };
    if (isPointInBox(center, win)) return true;
    const closestX = Math.max(win.minX, Math.min(center.x, win.maxX));
    const closestY = Math.max(win.minY, Math.min(center.y, win.maxY));
    const distSq = (center.x - closestX) ** 2 + (center.y - closestY) ** 2;
    return distSq <= circle.radius ** 2;
  }
  return true; // For other shapes, bounding box overlap is sufficient
}

// Compute Grip Points for CAD Objects
export function getGripPoints(obj: CADObject): GripPoint[] {
  const grips: GripPoint[] = [];

  if (obj.type === 'line') {
    const line = obj as LineObject;
    const p1 = { x: line.startX, y: line.startY };
    const p2 = { x: line.endX, y: line.endY };
    const mid = midpoint(p1, p2);

    grips.push({ id: `${obj.id}_start`, point: p1, type: 'endpoint', label: 'Start', sourceObjectId: obj.id });
    grips.push({ id: `${obj.id}_end`, point: p2, type: 'endpoint', label: 'End', sourceObjectId: obj.id });
    grips.push({ id: `${obj.id}_mid`, point: mid, type: 'midpoint', label: 'Midpoint', sourceObjectId: obj.id });
  } else if (obj.type === 'rectangle') {
    const rect = obj as RectangleObject;
    const c1 = { x: rect.x, y: rect.y };
    const c2 = { x: rect.x + rect.width, y: rect.y };
    const c3 = { x: rect.x + rect.width, y: rect.y + rect.height };
    const c4 = { x: rect.x, y: rect.y + rect.height };
    const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };

    grips.push({ id: `${obj.id}_c1`, point: c1, type: 'corner', label: 'Corner 1', sourceObjectId: obj.id });
    grips.push({ id: `${obj.id}_c2`, point: c2, type: 'corner', label: 'Corner 2', sourceObjectId: obj.id });
    grips.push({ id: `${obj.id}_c3`, point: c3, type: 'corner', label: 'Corner 3', sourceObjectId: obj.id });
    grips.push({ id: `${obj.id}_c4`, point: c4, type: 'corner', label: 'Corner 4', sourceObjectId: obj.id });
    grips.push({ id: `${obj.id}_center`, point: center, type: 'center', label: 'Center', sourceObjectId: obj.id });
  } else if (obj.type === 'circle') {
    const circle = obj as CircleObject;
    const center = { x: circle.centerX, y: circle.centerY };

    grips.push({ id: `${obj.id}_center`, point: center, type: 'center', label: 'Center', sourceObjectId: obj.id });
    grips.push({ id: `${obj.id}_q1`, point: { x: center.x + circle.radius, y: center.y }, type: 'quadrant', label: 'Quadrant Right', sourceObjectId: obj.id });
    grips.push({ id: `${obj.id}_q2`, point: { x: center.x - circle.radius, y: center.y }, type: 'quadrant', label: 'Quadrant Left', sourceObjectId: obj.id });
    grips.push({ id: `${obj.id}_q3`, point: { x: center.x, y: center.y + circle.radius }, type: 'quadrant', label: 'Quadrant Top', sourceObjectId: obj.id });
    grips.push({ id: `${obj.id}_q4`, point: { x: center.x, y: center.y - circle.radius }, type: 'quadrant', label: 'Quadrant Bottom', sourceObjectId: obj.id });
  } else if (obj.type === 'polyline') {
    const poly = obj as PolylineObject;
    poly.points.forEach((pt, idx) => {
      grips.push({
        id: `${obj.id}_v${idx}`,
        point: pt,
        type: 'vertex',
        label: `Vertex ${idx + 1}`,
        sourceObjectId: obj.id,
        pointIndex: idx,
      });
    });
    for (let i = 0; i < poly.points.length - 1; i++) {
      const mid = midpoint(poly.points[i], poly.points[i + 1]);
      grips.push({
        id: `${obj.id}_m${i}`,
        point: mid,
        type: 'midpoint',
        label: `Edge Mid ${i + 1}`,
        sourceObjectId: obj.id,
        pointIndex: i,
      });
    }
  } else if (obj.type === 'dimension') {
    const dim = obj as DimensionObject;
    grips.push({ id: `${obj.id}_start`, point: { x: dim.startX, y: dim.startY }, type: 'endpoint', label: 'Dim Start', sourceObjectId: obj.id });
    grips.push({ id: `${obj.id}_end`, point: { x: dim.endX, y: dim.endY }, type: 'endpoint', label: 'Dim End', sourceObjectId: obj.id });
  } else if (obj.type === 'text') {
    const txt = obj as TextObject;
    grips.push({ id: `${obj.id}_origin`, point: { x: txt.x, y: txt.y }, type: 'origin', label: 'Text Base', sourceObjectId: obj.id });
  } else if (obj.type.includes('3d')) {
    const o3d = obj as Box3DObject;
    grips.push({ id: `${obj.id}_origin`, point: { x: o3d.x, y: o3d.y }, type: 'origin', label: '3D Origin', sourceObjectId: obj.id });
  }

  return grips;
}

// ------------------------------------------------------------------
// PHASE 1C ADVANCED GEOMETRY MATH UTILITIES
// ------------------------------------------------------------------

// 1. Line-Line Intersection (segment or infinite line)
export function getLineLineIntersection(
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  p4: Point2D,
  infinite = false
): { point: Point2D; t1: number; t2: number } | null {
  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;
  const dx2 = p4.x - p3.x;
  const dy2 = p4.y - p3.y;

  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-9) return null; // Parallel lines

  const t1 = ((p3.x - p1.x) * dy2 - (p3.y - p1.y) * dx2) / denom;
  const t2 = ((p3.x - p1.x) * dy1 - (p3.y - p1.y) * dx1) / denom;

  if (!infinite) {
    if (t1 < -1e-6 || t1 > 1 + 1e-6 || t2 < -1e-6 || t2 > 1 + 1e-6) {
      return null;
    }
  }

  return {
    point: {
      x: p1.x + t1 * dx1,
      y: p1.y + t1 * dy1,
    },
    t1,
    t2,
  };
}

// 2. Line-Circle Intersections
export function getLineCircleIntersections(
  p1: Point2D,
  p2: Point2D,
  center: Point2D,
  radius: number,
  infinite = false
): Point2D[] {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const A = dx * dx + dy * dy;
  if (A < 1e-9) return [];

  const B = 2 * (dx * (p1.x - center.x) + dy * (p1.y - center.y));
  const C = (p1.x - center.x) ** 2 + (p1.y - center.y) ** 2 - radius * radius;

  const det = B * B - 4 * A * C;
  if (det < -1e-6) return [];

  const results: Point2D[] = [];
  const sqrtDet = Math.sqrt(Math.max(0, det));
  const tVals = [(-B - sqrtDet) / (2 * A), (-B + sqrtDet) / (2 * A)];

  for (const t of tVals) {
    if (infinite || (t >= -1e-6 && t <= 1 + 1e-6)) {
      results.push({
        x: p1.x + t * dx,
        y: p1.y + t * dy,
      });
    }
  }
  return results;
}

// 3. Helper: Angle inside arc range check (radians)
export function isAngleInArc(angleRad: number, startRad: number, endRad: number): boolean {
  const norm = (a: number) => {
    let r = a % (2 * Math.PI);
    if (r < 0) r += 2 * Math.PI;
    return r;
  };
  const a = norm(angleRad);
  const s = norm(startRad);
  const e = norm(endRad);

  if (s < e) {
    return a >= s - 1e-5 && a <= e + 1e-5;
  } else {
    return a >= s - 1e-5 || a <= e + 1e-5;
  }
}

// 4. Circle-Circle Intersections
export function getCircleCircleIntersections(
  c1: Point2D,
  r1: number,
  c2: Point2D,
  r2: number
): Point2D[] {
  const d = distance(c1, c2);
  if (d < 1e-6 || d > r1 + r2 + 1e-6 || d < Math.abs(r1 - r2) - 1e-6) return [];

  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));

  const p2 = {
    x: c1.x + (a * (c2.x - c1.x)) / d,
    y: c1.y + (a * (c2.y - c1.y)) / d,
  };

  if (h < 1e-6) return [p2];

  return [
    {
      x: p2.x + (h * (c2.y - c1.y)) / d,
      y: p2.y - (h * (c2.x - c1.x)) / d,
    },
    {
      x: p2.x - (h * (c2.y - c1.y)) / d,
      y: p2.y + (h * (c2.x - c1.x)) / d,
    },
  ];
}

// 5. Deconstruct object into linear segments for intersection calculations
export function getObjectSegments(obj: CADObject): { p1: Point2D; p2: Point2D }[] {
  if (obj.type === 'line') {
    const l = obj as LineObject;
    return [{ p1: { x: l.startX, y: l.startY }, p2: { x: l.endX, y: l.endY } }];
  } else if (obj.type === 'rectangle') {
    const r = obj as RectangleObject;
    const c1 = { x: r.x, y: r.y };
    const c2 = { x: r.x + r.width, y: r.y };
    const c3 = { x: r.x + r.width, y: r.y + r.height };
    const c4 = { x: r.x, y: r.y + r.height };
    return [
      { p1: c1, p2: c2 },
      { p1: c2, p2: c3 },
      { p1: c3, p2: c4 },
      { p1: c4, p2: c1 },
    ];
  } else if (obj.type === 'polyline') {
    const p = obj as PolylineObject;
    const segs: { p1: Point2D; p2: Point2D }[] = [];
    for (let i = 0; i < p.points.length - 1; i++) {
      segs.push({ p1: p.points[i], p2: p.points[i + 1] });
    }
    if (p.closed && p.points.length > 2) {
      segs.push({ p1: p.points[p.points.length - 1], p2: p.points[0] });
    }
    return segs;
  }
  return [];
}

// 6. Generic object-to-object intersection calculation
export function getObjectIntersections(obj1: CADObject, obj2: CADObject): Point2D[] {
  if (obj1.id === obj2.id) return [];
  const points: Point2D[] = [];

  const segs1 = getObjectSegments(obj1);
  const segs2 = getObjectSegments(obj2);

  if (segs1.length > 0 && segs2.length > 0) {
    for (const s1 of segs1) {
      for (const s2 of segs2) {
        const res = getLineLineIntersection(s1.p1, s1.p2, s2.p1, s2.p2, false);
        if (res) points.push(res.point);
      }
    }
  } else if (segs1.length > 0 && obj2.type === 'circle') {
    const c = obj2 as CircleObject;
    for (const s1 of segs1) {
      const pts = getLineCircleIntersections(s1.p1, s1.p2, { x: c.centerX, y: c.centerY }, c.radius, false);
      points.push(...pts);
    }
  } else if (obj1.type === 'circle' && segs2.length > 0) {
    const c = obj1 as CircleObject;
    for (const s2 of segs2) {
      const pts = getLineCircleIntersections(s2.p1, s2.p2, { x: c.centerX, y: c.centerY }, c.radius, false);
      points.push(...pts);
    }
  } else if (obj1.type === 'circle' && obj2.type === 'circle') {
    const c1 = obj1 as CircleObject;
    const c2 = obj2 as CircleObject;
    const pts = getCircleCircleIntersections(
      { x: c1.centerX, y: c1.centerY },
      c1.radius,
      { x: c2.centerX, y: c2.centerY },
      c2.radius
    );
    points.push(...pts);
  } else if (segs1.length > 0 && obj2.type === 'arc') {
    const arc = obj2 as ArcObject;
    for (const s1 of segs1) {
      const pts = getLineCircleIntersections(s1.p1, s1.p2, { x: arc.centerX, y: arc.centerY }, arc.radius, false);
      for (const pt of pts) {
        const ang = Math.atan2(pt.y - arc.centerY, pt.x - arc.centerX);
        if (isAngleInArc(ang, arc.startAngle, arc.endAngle)) points.push(pt);
      }
    }
  } else if (obj1.type === 'arc' && segs2.length > 0) {
    const arc = obj1 as ArcObject;
    for (const s2 of segs2) {
      const pts = getLineCircleIntersections(s2.p1, s2.p2, { x: arc.centerX, y: arc.centerY }, arc.radius, false);
      for (const pt of pts) {
        const ang = Math.atan2(pt.y - arc.centerY, pt.x - arc.centerX);
        if (isAngleInArc(ang, arc.startAngle, arc.endAngle)) points.push(pt);
      }
    }
  } else if (obj1.type === 'arc' && obj2.type === 'circle') {
    const arc = obj1 as ArcObject;
    const c = obj2 as CircleObject;
    const pts = getCircleCircleIntersections(
      { x: arc.centerX, y: arc.centerY },
      arc.radius,
      { x: c.centerX, y: c.centerY },
      c.radius
    );
    for (const pt of pts) {
      const ang = Math.atan2(pt.y - arc.centerY, pt.x - arc.centerX);
      if (isAngleInArc(ang, arc.startAngle, arc.endAngle)) points.push(pt);
    }
  }

  // Deduplicate points
  const uniquePts: Point2D[] = [];
  for (const pt of points) {
    if (!uniquePts.some((u) => distance(u, pt) < 1e-4)) {
      uniquePts.push(pt);
    }
  }
  return uniquePts;
}

// 7. Fillet two lines with radius
export function filletLines(
  line1: LineObject,
  line2: LineObject,
  radius: number
): { line1: LineObject; line2: LineObject; arc?: ArcObject } {
  const p1 = { x: line1.startX, y: line1.startY };
  const p2 = { x: line1.endX, y: line1.endY };
  const p3 = { x: line2.startX, y: line2.startY };
  const p4 = { x: line2.endX, y: line2.endY };

  const intRes = getLineLineIntersection(p1, p2, p3, p4, true);
  if (!intRes) throw new Error('Lines are parallel and cannot be filleted.');

  const intPt = intRes.point;

  // Orient vectors away from intersection
  const v1 = distance(p1, intPt) > distance(p2, intPt) ? p1 : p2;
  const v2 = distance(p3, intPt) > distance(p4, intPt) ? p3 : p4;

  const dir1 = { x: v1.x - intPt.x, y: v1.y - intPt.y };
  const len1 = Math.hypot(dir1.x, dir1.y);
  const dir2 = { x: v2.x - intPt.x, y: v2.y - intPt.y };
  const len2 = Math.hypot(dir2.x, dir2.y);

  if (len1 < 1e-6 || len2 < 1e-6) throw new Error('Line length is too small for fillet.');

  const u1 = { x: dir1.x / len1, y: dir1.y / len1 };
  const u2 = { x: dir2.x / len2, y: dir2.y / len2 };

  const cosAngle = Math.max(-1, Math.min(1, u1.x * u2.x + u1.y * u2.y));
  const angle = Math.acos(cosAngle);

  if (Math.abs(angle) < 1e-4 || Math.abs(angle - Math.PI) < 1e-4) {
    throw new Error('Lines are parallel.');
  }

  if (radius <= 0.001) {
    const newLine1 = { ...line1, startX: v1.x, startY: v1.y, endX: intPt.x, endY: intPt.y };
    const newLine2 = { ...line2, startX: v2.x, startY: v2.y, endX: intPt.x, endY: intPt.y };
    return { line1: newLine1, line2: newLine2 };
  }

  const tanDist = radius / Math.tan(angle / 2);
  if (tanDist > len1 || tanDist > len2) {
    throw new Error('Radius is too large for the selected line segments.');
  }

  const t1 = { x: intPt.x + u1.x * tanDist, y: intPt.y + u1.y * tanDist };
  const t2 = { x: intPt.x + u2.x * tanDist, y: intPt.y + u2.y * tanDist };

  const bisectorDir = { x: u1.x + u2.x, y: u1.y + u2.y };
  const bisectorLen = Math.hypot(bisectorDir.x, bisectorDir.y);
  const uBisector = { x: bisectorDir.x / bisectorLen, y: bisectorDir.y / bisectorLen };
  const centerDist = radius / Math.sin(angle / 2);
  const arcCenter = {
    x: intPt.x + uBisector.x * centerDist,
    y: intPt.y + uBisector.y * centerDist,
  };

  const a1 = Math.atan2(t1.y - arcCenter.y, t1.x - arcCenter.x);
  const a2 = Math.atan2(t2.y - arcCenter.y, t2.x - arcCenter.x);

  const newLine1 = { ...line1, startX: v1.x, startY: v1.y, endX: t1.x, endY: t1.y };
  const newLine2 = { ...line2, startX: v2.x, startY: v2.y, endX: t2.x, endY: t2.y };

  const arcObj: ArcObject = {
    id: 'arc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type: 'arc',
    layerId: line1.layerId,
    color: line1.color,
    lineWeight: line1.lineWeight,
    lineType: line1.lineType,
    centerX: arcCenter.x,
    centerY: arcCenter.y,
    radius: radius,
    startAngle: Math.min(a1, a2),
    endAngle: Math.max(a1, a2),
  };

  return { line1: newLine1, line2: newLine2, arc: arcObj };
}

// 8. Chamfer two lines with distances
export function chamferLines(
  line1: LineObject,
  line2: LineObject,
  d1: number,
  d2: number
): { line1: LineObject; line2: LineObject; chamferLine: LineObject } {
  const p1 = { x: line1.startX, y: line1.startY };
  const p2 = { x: line1.endX, y: line1.endY };
  const p3 = { x: line2.startX, y: line2.startY };
  const p4 = { x: line2.endX, y: line2.endY };

  const intRes = getLineLineIntersection(p1, p2, p3, p4, true);
  if (!intRes) throw new Error('Lines are parallel and cannot be chamfered.');

  const intPt = intRes.point;

  const v1 = distance(p1, intPt) > distance(p2, intPt) ? p1 : p2;
  const v2 = distance(p3, intPt) > distance(p4, intPt) ? p3 : p4;

  const dir1 = { x: v1.x - intPt.x, y: v1.y - intPt.y };
  const len1 = Math.hypot(dir1.x, dir1.y);
  const dir2 = { x: v2.x - intPt.x, y: v2.y - intPt.y };
  const len2 = Math.hypot(dir2.x, dir2.y);

  if (d1 > len1 || d2 > len2) throw new Error('Chamfer distance is too large for selected lines.');

  const u1 = { x: dir1.x / len1, y: dir1.y / len1 };
  const u2 = { x: dir2.x / len2, y: dir2.y / len2 };

  const ch1 = { x: intPt.x + u1.x * d1, y: intPt.y + u1.y * d1 };
  const ch2 = { x: intPt.x + u2.x * d2, y: intPt.y + u2.y * d2 };

  const newLine1 = { ...line1, startX: v1.x, startY: v1.y, endX: ch1.x, endY: ch1.y };
  const newLine2 = { ...line2, startX: v2.x, startY: v2.y, endX: ch2.x, endY: ch2.y };

  const chLine: LineObject = {
    id: 'line_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type: 'line',
    layerId: line1.layerId,
    color: line1.color,
    lineWeight: line1.lineWeight,
    lineType: line1.lineType,
    startX: ch1.x,
    startY: ch1.y,
    endX: ch2.x,
    endY: ch2.y,
  };

  return { line1: newLine1, line2: newLine2, chamferLine: chLine };
}

// 9. Explode polyline or rectangle into individual lines
export function explodeObject(obj: CADObject): CADObject[] {
  if (obj.type === 'rectangle') {
    const r = obj as RectangleObject;
    const c1 = { x: r.x, y: r.y };
    const c2 = { x: r.x + r.width, y: r.y };
    const c3 = { x: r.x + r.width, y: r.y + r.height };
    const c4 = { x: r.x, y: r.y + r.height };

    const makeLine = (pA: Point2D, pB: Point2D): LineObject => ({
      id: 'line_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type: 'line',
      layerId: r.layerId,
      color: r.color,
      lineWeight: r.lineWeight,
      lineType: r.lineType,
      extrudeHeight: r.extrudeHeight,
      zPos: r.zPos,
      startX: pA.x,
      startY: pA.y,
      endX: pB.x,
      endY: pB.y,
    });

    return [makeLine(c1, c2), makeLine(c2, c3), makeLine(c3, c4), makeLine(c4, c1)];
  } else if (obj.type === 'polyline') {
    const p = obj as PolylineObject;
    const lines: LineObject[] = [];
    for (let i = 0; i < p.points.length - 1; i++) {
      lines.push({
        id: 'line_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        type: 'line',
        layerId: p.layerId,
        color: p.color,
        lineWeight: p.lineWeight,
        lineType: p.lineType,
        extrudeHeight: p.extrudeHeight,
        zPos: p.zPos,
        startX: p.points[i].x,
        startY: p.points[i].y,
        endX: p.points[i + 1].x,
        endY: p.points[i + 1].y,
      });
    }
    if (p.closed && p.points.length > 2) {
      lines.push({
        id: 'line_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        type: 'line',
        layerId: p.layerId,
        color: p.color,
        lineWeight: p.lineWeight,
        lineType: p.lineType,
        extrudeHeight: p.extrudeHeight,
        zPos: p.zPos,
        startX: p.points[p.points.length - 1].x,
        startY: p.points[p.points.length - 1].y,
        endX: p.points[0].x,
        endY: p.points[0].y,
      });
    }
    return lines;
  }
  return [obj];
}

// 10. Join connected lines / polylines
export function joinObjects(
  candidates: CADObject[],
  tolerance = 1.5
): { joined: CADObject[]; removedIds: string[] } {
  const lineObjs = candidates.filter((o) => o.type === 'line') as LineObject[];
  const polyObjs = candidates.filter((o) => o.type === 'polyline') as PolylineObject[];

  if (lineObjs.length + polyObjs.length < 2) {
    throw new Error('Objects cannot be joined. Select at least 2 connected lines or polyline segments.');
  }

  let segments: { p1: Point2D; p2: Point2D }[] = [];
  for (const l of lineObjs) {
    segments.push({ p1: { x: l.startX, y: l.startY }, p2: { x: l.endX, y: l.endY } });
  }
  for (const p of polyObjs) {
    for (let i = 0; i < p.points.length - 1; i++) {
      segments.push({ p1: p.points[i], p2: p.points[i + 1] });
    }
  }

  const chainedPts: Point2D[] = [segments[0].p1, segments[0].p2];
  const remaining = segments.slice(1);

  let added = true;
  while (added && remaining.length > 0) {
    added = false;
    for (let i = 0; i < remaining.length; i++) {
      const seg = remaining[i];
      const head = chainedPts[0];
      const tail = chainedPts[chainedPts.length - 1];

      if (distance(tail, seg.p1) <= tolerance) {
        chainedPts.push(seg.p2);
        remaining.splice(i, 1);
        added = true;
        break;
      } else if (distance(tail, seg.p2) <= tolerance) {
        chainedPts.push(seg.p1);
        remaining.splice(i, 1);
        added = true;
        break;
      } else if (distance(head, seg.p1) <= tolerance) {
        chainedPts.unshift(seg.p2);
        remaining.splice(i, 1);
        added = true;
        break;
      } else if (distance(head, seg.p2) <= tolerance) {
        chainedPts.unshift(seg.p1);
        remaining.splice(i, 1);
        added = true;
        break;
      }
    }
  }

  if (chainedPts.length <= 2 && remaining.length === segments.length - 1) {
    throw new Error('Objects cannot be joined (endpoints do not touch).');
  }

  const baseObj = lineObjs[0] || polyObjs[0];
  const isClosed = distance(chainedPts[0], chainedPts[chainedPts.length - 1]) <= tolerance;

  const newPoly: PolylineObject = {
    id: 'poly_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type: 'polyline',
    layerId: baseObj.layerId,
    color: baseObj.color,
    lineWeight: baseObj.lineWeight,
    lineType: baseObj.lineType,
    extrudeHeight: baseObj.extrudeHeight,
    zPos: baseObj.zPos,
    points: chainedPts,
    closed: isClosed,
  };

  const removedIds = [...lineObjs.map((l) => l.id), ...polyObjs.map((p) => p.id)];
  return { joined: [newPoly], removedIds };
}

