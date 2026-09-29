import * as turf from '@turf/turf';
import { GISFeature, GISLayer } from '../types/gis';

export interface SpatialAnalysisParams {
  bufferRadiusMeters?: number;
  inputLayerId?: string;
  overlayLayerId?: string;
}

export const runBufferAnalysis = (
  inputLayer: GISLayer,
  radiusMeters: number
): GISLayer => {
  const bufferedFeatures: GISFeature[] = [];

  inputLayer.features.forEach((feat, index) => {
    try {
      const turfGeom = feat.geometry as any;
      const buffered: any = turf.buffer(turfGeom, radiusMeters, { units: 'meters' });
      if (buffered && buffered.geometry) {
        bufferedFeatures.push({
          id: `buffer-${feat.id}-${Date.now()}-${index}`,
          layerId: `layer-buffer-${inputLayer.id}`,
          geometry: buffered.geometry,
          properties: {
            ...feat.properties,
            Original_ID: feat.id,
            Buffer_Radius_m: radiusMeters,
          },
        });
      }
    } catch (e) {
      console.warn('Buffer operation failed for feature', feat.id, e);
    }
  });

  return {
    id: `layer-buffer-${Date.now()}`,
    name: `Buffer (${radiusMeters}m) of ${inputLayer.name}`,
    type: 'vector',
    geometryType: 'Polygon',
    visible: true,
    opacity: 0.5,
    locked: false,
    features: bufferedFeatures,
    fields: [
      ...inputLayer.fields,
      { name: 'Original_ID', type: 'string' },
      { name: 'Buffer_Radius_m', type: 'number' },
    ],
    symbology: {
      styleType: 'single',
      fillColor: '#8b5cf6',
      fillOpacity: 0.4,
      strokeColor: '#6d28d9',
      strokeWidth: 2,
    },
    labelConfig: {
      enabled: false,
      attributeField: '',
      fontSize: 10,
      color: '#0f172a',
      haloColor: '#ffffff',
      haloWidth: 1,
      placement: 'centroid',
    },
    sourceType: 'geojson',
  };
};

export const runCentroidAnalysis = (inputLayer: GISLayer): GISLayer => {
  const centroidFeatures: GISFeature[] = [];

  inputLayer.features.forEach((feat, index) => {
    try {
      const turfGeom = feat.geometry as any;
      const center = turf.centroid(turfGeom);
      centroidFeatures.push({
        id: `centroid-${feat.id}-${Date.now()}-${index}`,
        layerId: `layer-centroid-${inputLayer.id}`,
        geometry: center.geometry,
        properties: {
          ...feat.properties,
          Original_ID: feat.id,
        },
      });
    } catch (e) {
      console.warn('Centroid operation failed for feature', feat.id, e);
    }
  });

  return {
    id: `layer-centroid-${Date.now()}`,
    name: `Centroids of ${inputLayer.name}`,
    type: 'vector',
    geometryType: 'Point',
    visible: true,
    opacity: 1,
    locked: false,
    features: centroidFeatures,
    fields: [...inputLayer.fields, { name: 'Original_ID', type: 'string' }],
    symbology: {
      styleType: 'single',
      fillColor: '#f59e0b',
      strokeColor: '#78350f',
      pointRadius: 6,
    },
    labelConfig: {
      enabled: false,
      attributeField: '',
      fontSize: 10,
      color: '#0f172a',
      haloColor: '#ffffff',
      haloWidth: 1,
      placement: 'point',
    },
    sourceType: 'geojson',
  };
};

export const runConvexHullAnalysis = (inputLayer: GISLayer): GISLayer => {
  try {
    const featureCollection = turf.featureCollection(
      inputLayer.features.map((f) => turf.feature(f.geometry as any, f.properties))
    );
    const hull = turf.convex(featureCollection);

    const hullFeatures: GISFeature[] = hull
      ? [
          {
            id: `hull-${Date.now()}`,
            layerId: `layer-hull-${inputLayer.id}`,
            geometry: hull.geometry,
            properties: {
              Source_Layer: inputLayer.name,
              Total_Features: inputLayer.features.length,
              Area_sqm: turf.area(hull),
            },
          },
        ]
      : [];

    return {
      id: `layer-hull-${Date.now()}`,
      name: `Convex Hull of ${inputLayer.name}`,
      type: 'vector',
      geometryType: 'Polygon',
      visible: true,
      opacity: 0.4,
      locked: false,
      features: hullFeatures,
      fields: [
        { name: 'Source_Layer', type: 'string' },
        { name: 'Total_Features', type: 'number' },
        { name: 'Area_sqm', type: 'number' },
      ],
      symbology: {
        styleType: 'single',
        fillColor: '#10b981',
        fillOpacity: 0.3,
        strokeColor: '#047857',
        strokeWidth: 2,
      },
      labelConfig: {
        enabled: false,
        attributeField: '',
        fontSize: 10,
        color: '#0f172a',
        haloColor: '#ffffff',
        haloWidth: 1,
        placement: 'centroid',
      },
      sourceType: 'geojson',
    };
  } catch (e) {
    throw new Error('Failed to compute convex hull');
  }
};

export const calculateLayerExtent = (layer: GISLayer): [number, number, number, number] | null => {
  if (!layer || !layer.features || layer.features.length === 0) return null;
  try {
    const validFeatures = layer.features.filter(f => f && f.geometry);
    if (validFeatures.length === 0) return null;
    const fc = turf.featureCollection(validFeatures.map((f) => turf.feature(f.geometry as any)));
    const bbox = turf.bbox(fc);
    return bbox as [number, number, number, number];
  } catch (e) {
    return null;
  }
};

export const calculateFeaturesExtent = (features: GISFeature[]): [number, number, number, number] | null => {
  if (!features || features.length === 0) return null;
  try {
    const validFeatures = features.filter(f => f && f.geometry);
    if (validFeatures.length === 0) return null;
    const fc = turf.featureCollection(validFeatures.map((f) => turf.feature(f.geometry as any)));
    const bbox = turf.bbox(fc);
    return bbox as [number, number, number, number];
  } catch (e) {
    return null;
  }
};

export const calculateGeometryMetrics = (geometry: any) => {
  try {
    if (!geometry) return { lengthMeters: 0, areaSqMeters: 0 };
    const turfFeat = turf.feature(geometry);
    const areaSqMeters = turf.area(turfFeat);
    const lengthMeters = turf.length(turfFeat, { units: 'meters' });
    return { lengthMeters, areaSqMeters };
  } catch (e) {
    return { lengthMeters: 0, areaSqMeters: 0 };
  }
};
