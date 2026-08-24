import shp from 'shpjs';
import { GISFeature, GISFeatureCollection, GISFeatureProperties } from '../data/sherpur-gis-data';
import { UELESystemCategory, UELELayer } from '../types/uele';

export interface ImportGISResult {
  success: boolean;
  layer: UELELayer;
  featureCollection: GISFeatureCollection;
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  featureCount: number;
  geometryTypes: string[];
  message: string;
  crsDetected?: string;
}

// Calculate centroid lat/lng from GeoJSON geometry
export function calculateCentroid(geometry: any): { lat: number; lng: number } {
  if (!geometry || !geometry.coordinates) return { lat: 24.6800, lng: 89.4100 };

  const coords = geometry.coordinates;
  const type = geometry.type;

  if (type === 'Point') {
    return { lng: coords[0], lat: coords[1] };
  }

  let totalLat = 0;
  let totalLng = 0;
  let count = 0;

  const flatten = (arr: any) => {
    if (typeof arr[0] === 'number') {
      totalLng += arr[0];
      totalLat += arr[1];
      count++;
    } else {
      for (const item of arr) {
        flatten(item);
      }
    }
  };

  flatten(coords);

  if (count === 0) return { lat: 24.6800, lng: 89.4100 };
  return { lat: totalLat / count, lng: totalLng / count };
}

// Calculate bounding box [minLng, minLat, maxLng, maxLat]
export function calculateBounds(featureCollection: GISFeatureCollection): [number, number, number, number] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  featureCollection.features.forEach((feature) => {
    const coords = feature.geometry.coordinates;
    const processCoord = (c: number[]) => {
      if (c[0] < minLng) minLng = c[0];
      if (c[1] < minLat) minLat = c[1];
      if (c[0] > maxLng) maxLng = c[0];
      if (c[1] > maxLat) maxLat = c[1];
    };

    const flatten = (arr: any) => {
      if (typeof arr[0] === 'number') {
        processCoord(arr);
      } else {
        for (const item of arr) flatten(item);
      }
    };

    flatten(coords);
  });

  if (minLng === Infinity) return [89.3400, 24.6300, 89.4800, 24.7300];
  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Parses Shapefile .zip file using shpjs client-side
 */
export async function importShapefileZip(
  file: File,
  layerNameCustom?: string,
  categoryCustom?: UELESystemCategory
): Promise<ImportGISResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const geojsonRaw: any = await shp(arrayBuffer);

    // shpjs can return an array if zip contains multiple shapefiles, or a single FeatureCollection
    let rawFeatures: any[] = [];
    if (Array.isArray(geojsonRaw)) {
      geojsonRaw.forEach((fc) => {
        if (fc && fc.features) {
          rawFeatures = rawFeatures.concat(fc.features);
        }
      });
    } else if (geojsonRaw && geojsonRaw.features) {
      rawFeatures = geojsonRaw.features;
    }

    if (rawFeatures.length === 0) {
      throw new Error('No valid vector features found inside the Shapefile ZIP.');
    }

    const cleanFileName = file.name.replace(/\.zip$/i, '');
    const layerId = `shp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const layerName = layerNameCustom || cleanFileName || 'Imported Shapefile Layer';
    const category = categoryCustom || 'gis-digital-engineering';

    const normalizedFeatures: GISFeature[] = [];
    const geomTypeSet = new Set<string>();

    rawFeatures.forEach((rf, index) => {
      if (!rf.geometry || !rf.geometry.coordinates) return;

      const geomType = rf.geometry.type;
      geomTypeSet.add(geomType);

      const featureId = `${layerId}-feat-${index + 1}`;
      const centroid = calculateCentroid(rf.geometry);
      const props = rf.properties || {};
      const featureName =
        props.Name ||
        props.NAME ||
        props.Title ||
        props.TITLE ||
        props.Label ||
        props.id ||
        `${layerName} Feature #${index + 1}`;

      const cleanProps: GISFeatureProperties = {
        id: featureId,
        name: String(featureName),
        category: category,
        layerId: layerId,
        layerName: layerName,
        source: 'shapefile',
        geometryType: geomType as any,
        lat: centroid.lat,
        lng: centroid.lng,
        elevation: props.elevation || props.Elevation || props.ELEV || 0,
        description: `Imported from Shapefile ZIP (${file.name})`,
        attributes: props,
        engineeringInfo: {
          overview: `Imported GIS vector feature from ${file.name}.`,
          purpose: 'Spatial geometry & attribute dataset.',
          disciplines: ['Geospatial Engineering', 'GIS Data Import'],
        },
      };

      normalizedFeatures.push({
        type: 'Feature',
        id: featureId,
        ueleObjectId: featureId,
        geometry: rf.geometry,
        properties: cleanProps,
      });
    });

    const featureCollection: GISFeatureCollection = {
      type: 'FeatureCollection',
      features: normalizedFeatures,
    };

    const bounds = calculateBounds(featureCollection);

    const layer: UELELayer = {
      id: layerId,
      name: layerName,
      category: category,
      color: '#06b6d4',
      visible: true,
      type: 'geojson',
      description: `Shapefile Layer (${normalizedFeatures.length} features) — ${file.name}`,
    };

    return {
      success: true,
      layer,
      featureCollection,
      bounds,
      featureCount: normalizedFeatures.length,
      geometryTypes: Array.from(geomTypeSet),
      message: `Successfully imported ${normalizedFeatures.length} Shapefile features from ${file.name}`,
      crsDetected: 'WGS84 / EPSG:4326',
    };
  } catch (error: any) {
    return {
      success: false,
      layer: null as any,
      featureCollection: { type: 'FeatureCollection', features: [] },
      bounds: [89.3400, 24.6300, 89.4800, 24.7300],
      featureCount: 0,
      geometryTypes: [],
      message: error?.message || 'Failed to parse Shapefile ZIP file.',
    };
  }
}

/**
 * Parses GeoJSON .geojson or .json file client-side
 */
export async function importGeoJSONFile(
  file: File,
  layerNameCustom?: string,
  categoryCustom?: UELESystemCategory
): Promise<ImportGISResult> {
  try {
    const fileText = await file.text();
    const parsedJson = JSON.parse(fileText);

    let rawFeatures: any[] = [];
    if (parsedJson.type === 'FeatureCollection' && Array.isArray(parsedJson.features)) {
      rawFeatures = parsedJson.features;
    } else if (parsedJson.type === 'Feature') {
      rawFeatures = [parsedJson];
    } else if (Array.isArray(parsedJson)) {
      rawFeatures = parsedJson;
    }

    if (rawFeatures.length === 0) {
      throw new Error('No valid GeoJSON features found in the file.');
    }

    const cleanFileName = file.name.replace(/\.(geojson|json)$/i, '');
    const layerId = `geojson-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const layerName = layerNameCustom || cleanFileName || 'Imported GeoJSON Layer';
    const category = categoryCustom || 'gis-digital-engineering';

    const normalizedFeatures: GISFeature[] = [];
    const geomTypeSet = new Set<string>();

    rawFeatures.forEach((rf, index) => {
      if (!rf.geometry || !rf.geometry.coordinates) return;

      const geomType = rf.geometry.type;
      geomTypeSet.add(geomType);

      const featureId = `${layerId}-feat-${index + 1}`;
      const centroid = calculateCentroid(rf.geometry);
      const props = rf.properties || {};
      const featureName =
        props.Name ||
        props.NAME ||
        props.title ||
        props.name ||
        props.id ||
        `${layerName} Feature #${index + 1}`;

      const cleanProps: GISFeatureProperties = {
        id: featureId,
        name: String(featureName),
        category: category,
        layerId: layerId,
        layerName: layerName,
        source: 'geojson',
        geometryType: geomType as any,
        lat: centroid.lat,
        lng: centroid.lng,
        elevation: props.elevation || props.Elevation || 0,
        description: `Imported from GeoJSON (${file.name})`,
        attributes: props,
        engineeringInfo: {
          overview: `Imported GeoJSON spatial feature from ${file.name}.`,
          purpose: 'GeoJSON Spatial Geometry.',
          disciplines: ['Geospatial Engineering'],
        },
      };

      normalizedFeatures.push({
        type: 'Feature',
        id: featureId,
        ueleObjectId: featureId,
        geometry: rf.geometry,
        properties: cleanProps,
      });
    });

    const featureCollection: GISFeatureCollection = {
      type: 'FeatureCollection',
      features: normalizedFeatures,
    };

    const bounds = calculateBounds(featureCollection);

    const layer: UELELayer = {
      id: layerId,
      name: layerName,
      category: category,
      color: '#10b981',
      visible: true,
      type: 'geojson',
      description: `GeoJSON Layer (${normalizedFeatures.length} features) — ${file.name}`,
    };

    return {
      success: true,
      layer,
      featureCollection,
      bounds,
      featureCount: normalizedFeatures.length,
      geometryTypes: Array.from(geomTypeSet),
      message: `Successfully imported ${normalizedFeatures.length} GeoJSON features from ${file.name}`,
      crsDetected: 'WGS84 / EPSG:4326',
    };
  } catch (error: any) {
    return {
      success: false,
      layer: null as any,
      featureCollection: { type: 'FeatureCollection', features: [] },
      bounds: [89.3400, 24.6300, 89.4800, 24.7300],
      featureCount: 0,
      geometryTypes: [],
      message: error?.message || 'Failed to parse GeoJSON file. Ensure valid JSON syntax.',
    };
  }
}
