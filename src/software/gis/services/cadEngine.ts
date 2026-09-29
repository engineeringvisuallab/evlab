import * as turf from '@turf/turf';
import { GISLayer, GISFeature, SnappingSettings, GeometryValidationResult } from '../types/gis';

export interface SnapTarget {
  lng: number;
  lat: number;
  type: 'intersection' | 'endpoint' | 'vertex' | 'midpoint' | 'edge' | 'nearest' | 'perpendicular';
  distancePixels: number;
  featureId?: string;
  layerName?: string;
}

const SNAP_PRIORITY: Record<SnapTarget['type'], number> = {
  intersection: 1,
  endpoint: 2,
  vertex: 3,
  midpoint: 4,
  edge: 5,
  nearest: 6,
  perpendicular: 7,
};

export const findSnapTarget = (
  mouseLngLat: [number, number],
  mousePixel: [number, number],
  layers: GISLayer[],
  activeLayerId: string | null,
  snapping: SnappingSettings,
  projectPointToPixel: (lngLat: [number, number]) => [number, number]
): SnapTarget | null => {
  if (!snapping.enabled) return null;

  const candidates: SnapTarget[] = [];
  const maxDistance = snapping.tolerancePixels;
  const [mX, mY] = mousePixel;

  // Filter layers based on targetLayers setting
  const targetLayers = layers.filter((layer) => {
    if (!layer.visible || layer.features.length === 0) return false;
    if (snapping.targetLayers === 'active') {
      return layer.id === activeLayerId;
    }
    return true;
  });

  const checkCandidate = (
    coords: [number, number],
    type: SnapTarget['type'],
    featureId?: string,
    layerName?: string
  ) => {
    const [px, py] = projectPointToPixel(coords);
    const dist = Math.hypot(mX - px, mY - py);
    if (dist <= maxDistance) {
      candidates.push({
        lng: coords[0],
        lat: coords[1],
        type,
        distancePixels: dist,
        featureId,
        layerName,
      });
    }
  };

  // Collect all line segments to find line intersections
  const allLineStrings: any[] = [];

  targetLayers.forEach((layer) => {
    layer.features.forEach((feat) => {
      const geom = feat.geometry as any;
      if (!geom || !geom.coordinates) return;

      if (geom.type === 'Point' && snapping.vertex) {
        checkCandidate(geom.coordinates as [number, number], 'vertex', feat.id, layer.name);
      } else if (geom.type === 'LineString' || geom.type === 'Polygon') {
        const lineCoords: [number, number][] =
          geom.type === 'Polygon' ? geom.coordinates[0] : geom.coordinates;

        if (lineCoords && lineCoords.length > 0) {
          allLineStrings.push(turf.lineString(lineCoords));

          // Endpoints
          if (snapping.endpoint) {
            checkCandidate(lineCoords[0], 'endpoint', feat.id, layer.name);
            checkCandidate(lineCoords[lineCoords.length - 1], 'endpoint', feat.id, layer.name);
          }

          // Vertices & Midpoints
          for (let i = 0; i < lineCoords.length; i++) {
            if (snapping.vertex) {
              checkCandidate(lineCoords[i], 'vertex', feat.id, layer.name);
            }
            if (snapping.midpoint && i < lineCoords.length - 1) {
              const p1 = lineCoords[i];
              const p2 = lineCoords[i + 1];
              const mid: [number, number] = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
              checkCandidate(mid, 'midpoint', feat.id, layer.name);
            }
          }

          // Edge / Nearest point on segment
          if (snapping.edge || snapping.nearest) {
            try {
              const line = turf.lineString(lineCoords);
              const pt = turf.point(mouseLngLat);
              const snapped = turf.nearestPointOnLine(line, pt);
              if (snapped && snapped.geometry) {
                const snapCoord = snapped.geometry.coordinates as [number, number];
                checkCandidate(snapCoord, snapping.edge ? 'edge' : 'nearest', feat.id, layer.name);
              }
            } catch (e) {
              // Ignore invalid lines
            }
          }
        }
      }
    });
  });

  // Calculate Intersections if enabled and lines exist
  if (snapping.intersection && allLineStrings.length >= 2) {
    for (let i = 0; i < Math.min(allLineStrings.length, 30); i++) {
      for (let j = i + 1; j < Math.min(allLineStrings.length, 30); j++) {
        try {
          const intersects = turf.lineIntersect(allLineStrings[i], allLineStrings[j]);
          intersects.features.forEach((f) => {
            if (f.geometry && f.geometry.coordinates) {
              checkCandidate(
                f.geometry.coordinates as [number, number],
                'intersection',
                undefined,
                'Intersection'
              );
            }
          });
        } catch (e) {
          // ignore
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  // Sort candidates by priority first, then distance
  candidates.sort((a, b) => {
    const pA = SNAP_PRIORITY[a.type] || 99;
    const pB = SNAP_PRIORITY[b.type] || 99;
    if (pA !== pB) return pA - pB;
    return a.distancePixels - b.distancePixels;
  });

  return candidates[0];
};

export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km (${(meters * 3.28084 / 5280).toFixed(2)} mi)`;
  }
  return `${meters.toFixed(1)} m (${(meters * 3.28084).toFixed(1)} ft)`;
};

export const formatArea = (sqMeters: number): string => {
  if (sqMeters >= 1000000) {
    return `${(sqMeters / 1000000).toFixed(3)} km² (${(sqMeters / 10000).toFixed(2)} ha)`;
  } else if (sqMeters >= 10000) {
    return `${(sqMeters / 10000).toFixed(2)} ha (${(sqMeters * 0.000247105).toFixed(2)} acres)`;
  }
  return `${sqMeters.toFixed(1)} m² (${(sqMeters * 10.7639).toFixed(1)} sq ft)`;
};

export const calculateBearing = (start: [number, number], end: [number, number]): number => {
  try {
    const p1 = turf.point(start);
    const p2 = turf.point(end);
    let b = turf.bearing(p1, p2);
    if (b < 0) b += 360;
    return b;
  } catch (e) {
    return 0;
  }
};

// --- GEOMETRY TRANSFORMATION SERVICES ---

export const moveGeometry = (geometry: any, deltaLng: number, deltaLat: number): any => {
  if (!geometry) return geometry;
  const clone = JSON.parse(JSON.stringify(geometry));

  const shiftCoord = (coord: number[]): number[] => [coord[0] + deltaLng, coord[1] + deltaLat];

  if (clone.type === 'Point') {
    clone.coordinates = shiftCoord(clone.coordinates);
  } else if (clone.type === 'LineString' || clone.type === 'MultiPoint') {
    clone.coordinates = clone.coordinates.map(shiftCoord);
  } else if (clone.type === 'Polygon' || clone.type === 'MultiLineString') {
    clone.coordinates = clone.coordinates.map((ring: number[][]) => ring.map(shiftCoord));
  } else if (clone.type === 'MultiPolygon') {
    clone.coordinates = clone.coordinates.map((poly: number[][][]) =>
      poly.map((ring: number[][]) => ring.map(shiftCoord))
    );
  }

  return clone;
};

export const rotateGeometry = (geometry: any, angleDegrees: number): any => {
  if (!geometry) return geometry;
  try {
    const feat = turf.feature(geometry);
    const rotated = turf.transformRotate(feat, angleDegrees);
    return rotated.geometry;
  } catch (e) {
    return geometry;
  }
};

export const scaleGeometry = (geometry: any, scaleFactor: number): any => {
  if (!geometry || scaleFactor <= 0) return geometry;
  try {
    const feat = turf.feature(geometry);
    const scaled = turf.transformScale(feat, scaleFactor);
    return scaled.geometry;
  } catch (e) {
    return geometry;
  }
};

export const splitLineGeometry = (lineGeom: any, splitPoint: [number, number]): any[] => {
  if (!lineGeom || lineGeom.type !== 'LineString') return [lineGeom];
  try {
    const line = turf.lineString(lineGeom.coordinates);
    const pt = turf.point(splitPoint);
    const splitResult = turf.lineSplit(line, pt);
    if (splitResult && splitResult.features.length > 0) {
      return splitResult.features.map((f) => f.geometry);
    }
  } catch (e) {
    console.warn('splitLineGeometry failed:', e);
  }
  return [lineGeom];
};

export const mergeGeometries = (features: GISFeature[]): any | null => {
  if (!features || features.length < 2) return null;
  const firstType = features[0].geometry.type;

  try {
    if (firstType === 'Polygon') {
      let mergedPoly = turf.feature(features[0].geometry as any);
      for (let i = 1; i < features.length; i++) {
        if (features[i].geometry.type === 'Polygon') {
          const u = turf.union(mergedPoly as any, turf.feature(features[i].geometry as any) as any);
          if (u) mergedPoly = u as any;
        }
      }
      return mergedPoly.geometry;
    } else if (firstType === 'LineString') {
      const coords = features.flatMap((f) =>
        f.geometry.type === 'LineString' ? [(f.geometry as any).coordinates] : []
      );
      return { type: 'MultiLineString', coordinates: coords };
    } else if (firstType === 'Point') {
      const coords = features.flatMap((f) =>
        f.geometry.type === 'Point' ? [(f.geometry as any).coordinates] : []
      );
      return { type: 'MultiPoint', coordinates: coords };
    }
  } catch (e) {
    console.warn('mergeGeometries failed:', e);
  }
  return null;
};

export const offsetLineGeometry = (lineGeom: any, distanceMeters: number): any => {
  if (!lineGeom || lineGeom.type !== 'LineString') return lineGeom;
  try {
    const line = turf.lineString(lineGeom.coordinates);
    const offset = turf.lineOffset(line, distanceMeters / 1000, { units: 'kilometers' });
    return offset.geometry;
  } catch (e) {
    console.warn('offsetLineGeometry failed:', e);
    return lineGeom;
  }
};

// --- VERTEX EDITING HELPERS ---

export const insertVertexInGeometry = (
  geometry: any,
  segmentIndex: number,
  newCoord: [number, number]
): any => {
  if (!geometry) return geometry;
  const clone = JSON.parse(JSON.stringify(geometry));

  if (clone.type === 'LineString') {
    clone.coordinates.splice(segmentIndex + 1, 0, newCoord);
  } else if (clone.type === 'Polygon') {
    clone.coordinates[0].splice(segmentIndex + 1, 0, newCoord);
  }

  return clone;
};

export const moveVertexInGeometry = (
  geometry: any,
  vertexIndex: number,
  newCoord: [number, number]
): any => {
  if (!geometry) return geometry;
  const clone = JSON.parse(JSON.stringify(geometry));

  if (clone.type === 'Point') {
    clone.coordinates = newCoord;
  } else if (clone.type === 'LineString') {
    if (vertexIndex >= 0 && vertexIndex < clone.coordinates.length) {
      clone.coordinates[vertexIndex] = newCoord;
    }
  } else if (clone.type === 'Polygon') {
    const ring = clone.coordinates[0];
    if (ring && vertexIndex >= 0 && vertexIndex < ring.length) {
      ring[vertexIndex] = newCoord;
      // Maintain closed polygon ring
      if (vertexIndex === 0) ring[ring.length - 1] = newCoord;
      if (vertexIndex === ring.length - 1) ring[0] = newCoord;
    }
  }

  return clone;
};

export const deleteVertexFromGeometry = (geometry: any, vertexIndex: number): any => {
  if (!geometry) return geometry;
  const clone = JSON.parse(JSON.stringify(geometry));

  if (clone.type === 'LineString') {
    if (clone.coordinates.length > 2) {
      clone.coordinates.splice(vertexIndex, 1);
    }
  } else if (clone.type === 'Polygon') {
    const ring = clone.coordinates[0];
    if (ring && ring.length > 4) {
      ring.splice(vertexIndex, 1);
      // Re-close polygon ring if necessary
      const last = ring.length - 1;
      if (ring[0][0] !== ring[last][0] || ring[0][1] !== ring[last][1]) {
        ring[last] = [ring[0][0], ring[0][1]];
      }
    }
  }

  return clone;
};

// --- GEOMETRY VALIDATION & REPAIR ---

export const validateGeometry = (geometry: any): GeometryValidationResult => {
  const issues: string[] = [];

  if (!geometry || !geometry.coordinates || !geometry.type) {
    return { status: 'invalid', issues: ['Missing or empty geometry structure'] };
  }

  try {
    const feat = turf.feature(geometry);

    // Check self-intersections for polygons
    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
      const kinks = turf.kinks(feat as any);
      if (kinks.features.length > 0) {
        issues.push(`Polygon has ${kinks.features.length} self-intersecting kink(s)`);
      }

      // Check unclosed ring
      if (geometry.type === 'Polygon' && geometry.coordinates[0]) {
        const ring = geometry.coordinates[0];
        if (ring.length < 4) {
          issues.push('Polygon ring has fewer than 4 vertices');
        } else {
          const first = ring[0];
          const last = ring[ring.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            issues.push('Polygon exterior boundary ring is not closed');
          }
        }
      }
    }

    if (geometry.type === 'LineString' && geometry.coordinates.length < 2) {
      issues.push('LineString must contain at least 2 vertices');
    }
  } catch (e: any) {
    issues.push(`Invalid GeoJSON structure: ${e.message}`);
  }

  if (issues.length === 0) {
    return { status: 'valid', issues: [] };
  }

  return { status: 'invalid', issues };
};

export const repairGeometry = (geometry: any): any => {
  if (!geometry) return geometry;
  const clone = JSON.parse(JSON.stringify(geometry));

  try {
    if (clone.type === 'Polygon' && clone.coordinates && clone.coordinates[0]) {
      const ring = clone.coordinates[0];
      if (ring.length > 0) {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          ring.push([first[0], first[1]]);
        }
      }
      // Unkink polygon if needed
      const kinks = turf.kinks(turf.feature(clone) as any);
      if (kinks.features.length > 0) {
        const unkinked = turf.unkinkPolygon(turf.feature(clone) as any);
        if (unkinked.features.length > 0) {
          return unkinked.features[0].geometry;
        }
      }
    }
  } catch (e) {
    console.warn('repairGeometry failed:', e);
  }

  return clone;
};
