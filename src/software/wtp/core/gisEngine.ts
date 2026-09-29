import { EngineeringObject, getEngineeringModelRegistry } from './engineeringModelRegistry';
import { CalculatedWtpState } from './dependencyEngine';

export type CoordinateSystem = 
  | 'EPSG_32645_UTM_ZONE_45N'
  | 'EPSG_4326_WGS84'
  | 'LOCAL_PLANT_GRID';

export interface GisPoint {
  lat: number;
  lon: number;
  easting: number;
  northing: number;
  elevationM: number;
}

export interface GisFeature {
  featureId: string;
  associatedObjectId: string;
  featureType: 'POINT' | 'LINE' | 'POLYGON';
  geometry: GisPoint[];
  crs: CoordinateSystem;
  properties: {
    name: string;
    category: string;
    capacityMLD?: number;
    diameterMm?: number;
    lengthM?: number;
    areaM2?: number;
  };
}

export interface ContourLine {
  contourId: string;
  elevationM: number;
  isMajor: boolean; // Major contours every 1.0m, minor every 0.2m
  points: { easting: number; northing: number }[];
}

export interface CutFillResult {
  existingGroundMeanElevationM: number;
  proposedGradingElevationM: number;
  cutVolumeM3: number;
  fillVolumeM3: number;
  netEarthworkM3: number;
  status: 'BALANCED' | 'NET_CUT' | 'NET_FILL';
}

/**
 * COORDINATE TRANSFORMATION ENGINE:
 * Transforms local plant grid coordinates (meters) to projected UTM Zone 45N Easting/Northing and WGS84 Lat/Lon.
 */
export function transformLocalToGis(x: number, y: number, z: number, crs: CoordinateSystem = 'EPSG_32645_UTM_ZONE_45N'): GisPoint {
  const baseLat = 23.8103;
  const baseLon = 90.4125;
  const baseEasting = 542000;
  const baseNorthing = 2633000;

  // 1 meter in UTM Easting/Northing
  const easting = baseEasting + x;
  const northing = baseNorthing + y;

  // Approximate lat/lon transformation (1 degree lat ~= 110574 m, 1 degree lon ~= 101700 m at 23.8N)
  const lat = baseLat + (y / 110574);
  const lon = baseLon + (x / 101700);

  return { lat, lon, easting, northing, elevationM: z };
}

/**
 * GENERATE COMPLETE GIS MAP LAYERS
 */
export function generateGisMapFeatures(state: CalculatedWtpState, crs: CoordinateSystem = 'EPSG_32645_UTM_ZONE_45N'): GisFeature[] {
  const objects = getEngineeringModelRegistry(state);
  const features: GisFeature[] = [];

  // Plant Outer Site Boundary (Polygon)
  features.push({
    featureId: 'GIS-BND-001',
    associatedObjectId: 'WTP-SITE-001',
    featureType: 'POLYGON',
    crs,
    geometry: [
      transformLocalToGis(-50, -100, 10, crs),
      transformLocalToGis(400, -100, 10, crs),
      transformLocalToGis(400, 150, 10, crs),
      transformLocalToGis(-50, 150, 10, crs),
      transformLocalToGis(-50, -100, 10, crs)
    ],
    properties: {
      name: `${state.plantCapacityMLD} MLD WTP Site Boundary`,
      category: 'SITE_BOUNDARY',
      areaM2: 112500
    }
  });

  // Physical Engineering Objects (Points & Polygons)
  objects.forEach(o => {
    const pt = transformLocalToGis(o.coordinates.x, o.coordinates.y, o.coordinates.z, crs);
    features.push({
      featureId: o.gisFeatureId,
      associatedObjectId: o.objectId,
      featureType: o.type === 'PIPE' ? 'LINE' : 'POLYGON',
      crs,
      geometry: [pt],
      properties: {
        name: o.name,
        category: o.type,
        capacityMLD: state.plantCapacityMLD,
        lengthM: o.dimensions.lengthM,
        areaM2: (o.dimensions.lengthM || 1) * (o.dimensions.widthM || 1)
      }
    });
  });

  return features;
}

/**
 * CONTOUR & TERRAIN ENGINE: Generates major/minor terrain contour lines at specified intervals.
 */
export function generateTerrainContours(minElev: number = 8.0, maxElev: number = 18.0, intervalM: number = 0.5): ContourLine[] {
  const contours: ContourLine[] = [];
  let idCounter = 1;

  for (let e = minElev; e <= maxElev; e += intervalM) {
    const isMajor = Math.abs(e % 1.0) < 0.01;
    const points: { easting: number; northing: number }[] = [];
    
    // Simulate terrain contour path across 400m x 250m site
    for (let x = -50; x <= 400; x += 50) {
      const y = (e - 10) * 15 + Math.sin(x / 30) * 8;
      const gisPt = transformLocalToGis(x, y, e);
      points.push({ easting: gisPt.easting, northing: gisPt.northing });
    }

    contours.push({
      contourId: `CNT-${idCounter++}`,
      elevationM: Number(e.toFixed(2)),
      isMajor,
      points
    });
  }

  return contours;
}

/**
 * EARTHWORK CUT & FILL GRADING CALCULATOR
 */
export function calculateEarthworkCutFill(objects: EngineeringObject[], proposedGradingLevelM: number = 11.5): CutFillResult {
  const existingGroundMean = 10.2;
  const siteAreaM2 = 45000;

  const elevDiff = proposedGradingLevelM - existingGroundMean;
  let cutVol = 0;
  let fillVol = 0;

  if (elevDiff < 0) {
    cutVol = Math.abs(elevDiff) * siteAreaM2;
  } else {
    fillVol = elevDiff * siteAreaM2;
  }

  // Add structural foundation excavation volumes
  objects.forEach(o => {
    const foundationDepth = 2.5;
    const footprintArea = (o.dimensions.lengthM || 10) * (o.dimensions.widthM || 10);
    cutVol += footprintArea * foundationDepth;
  });

  const netEarthworkM3 = cutVol - fillVol;

  return {
    existingGroundMeanElevationM: existingGroundMean,
    proposedGradingElevationM: proposedGradingLevelM,
    cutVolumeM3: Math.round(cutVol),
    fillVolumeM3: Math.round(fillVol),
    netEarthworkM3: Math.round(netEarthworkM3),
    status: Math.abs(netEarthworkM3) < 1000 ? 'BALANCED' : netEarthworkM3 > 0 ? 'NET_CUT' : 'NET_FILL'
  };
}
