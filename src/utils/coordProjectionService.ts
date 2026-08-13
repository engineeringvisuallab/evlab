/**
 * EVLab — Georeference & Spatial Coordinate Transformation Engine
 * Tangent Plane ENU (East-North-Up) Projection Algorithm
 *
 * Converts Geographic WGS84 (Latitude, Longitude, Elevation) <---> Local 3D World (X, Y, Z meters)
 * Single authoritative spatial reference system for 2D GIS Map & 3D Digital Twin.
 */

export interface GeographicCoordinate {
  latitude: number;
  longitude: number;
  elevation: number;
}

export interface Local3DCoordinate {
  x: number; // East (meters)
  y: number; // Up / Height (meters)
  z: number; // North / Depth (meters)
}

// Master Origin Reference for EVLab Smart Country (e.g., Sherpur, Bogura, Bangladesh)
export const EVLAB_WORLD_ORIGIN: GeographicCoordinate = {
  latitude: 24.6800,
  longitude: 89.4100,
  elevation: 0.0,
};

const EARTH_RADIUS_METERS = 6378137.0; // WGS84 semi-major axis

/**
 * Converts WGS84 Geographic (Lat, Lng, Elevation) to Local ENU 3D World (X, Y, Z meters)
 */
export function wgs84ToLocal3D(
  coords: GeographicCoordinate,
  origin: GeographicCoordinate = EVLAB_WORLD_ORIGIN
): Local3DCoordinate {
  const latRad = (coords.latitude * Math.PI) / 180;
  const lngRad = (coords.longitude * Math.PI) / 180;
  const refLatRad = (origin.latitude * Math.PI) / 180;
  const refLngRad = (origin.longitude * Math.PI) / 180;

  const dLat = latRad - refLatRad;
  const dLng = lngRad - refLngRad;

  // Tangent plane approximation around local origin
  const east = dLng * Math.cos(refLatRad) * EARTH_RADIUS_METERS;
  const north = dLat * EARTH_RADIUS_METERS;
  const up = coords.elevation - origin.elevation;

  // In Three.js coordinate system:
  // X = East (+X is East)
  // Y = Up (+Y is Elevation)
  // Z = South (-Z is North)
  return {
    x: Number(east.toFixed(3)),
    y: Number(up.toFixed(3)),
    z: Number((-north).toFixed(3)),
  };
}

/**
 * Converts Local ENU 3D World (X, Y, Z meters) back to WGS84 Geographic (Lat, Lng, Elevation)
 */
export function local3DToWgs84(
  pos: Local3DCoordinate,
  origin: GeographicCoordinate = EVLAB_WORLD_ORIGIN
): GeographicCoordinate {
  const refLatRad = (origin.latitude * Math.PI) / 180;

  const east = pos.x;
  const north = -pos.z;
  const up = pos.y;

  const dLatRad = north / EARTH_RADIUS_METERS;
  const dLngRad = east / (Math.cos(refLatRad) * EARTH_RADIUS_METERS);

  const lat = origin.latitude + (dLatRad * 180) / Math.PI;
  const lng = origin.longitude + (dLngRad * 180) / Math.PI;
  const elevation = origin.elevation + up;

  return {
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
    elevation: Number(elevation.toFixed(2)),
  };
}

/**
 * Calculates real-world ground distance in meters between two georeferenced coordinates (Haversine formula)
 */
export function calculateGeographicDistanceMeters(
  coord1: GeographicCoordinate,
  coord2: GeographicCoordinate
): number {
  const R = EARTH_RADIUS_METERS;
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}
