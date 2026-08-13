import { UELESystemCategory } from '../types/adminUele';

export interface GISFeatureProperties {
  id: string;
  name: string;
  category: UELESystemCategory;
  layerId: string;
  layerName: string;
  source: 'default' | 'shapefile' | 'geojson';
  geometryType: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
  lat: number;
  lng: number;
  elevation?: number;
  description?: string;
  // Raw attribute key-values from GIS/Shapefile DBF
  attributes: Record<string, string | number | boolean>;
  // Optional engineering details
  engineeringInfo?: {
    overview: string;
    purpose?: string;
    designStandards?: string[];
    softwareUsed?: string[];
    disciplines?: string[];
  };
  parameters?: Array<{
    id: string;
    name: string;
    value: string | number;
    unit?: string;
    category?: string;
  }>;
}

export interface GISFeature {
  type: 'Feature';
  id: string;
  ueleObjectId: string; // Shared 2D/3D identifier
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
  properties: GISFeatureProperties;
}

export interface GISFeatureCollection {
  type: 'FeatureCollection';
  features: GISFeature[];
}

// Center Coordinates for Study Area: Sherpur, Bogura, Bangladesh
export const SHERPUR_STUDY_CENTER = {
  lat: 24.6800,
  lng: 89.4100,
  zoom: 13,
};

// Initial GIS Dataset starts completely fresh and empty. Admin uploads Shapefiles/GeoJSON to publish globally.
export const INITIAL_SHERPUR_GIS_DATASET: GISFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};
