import { GISProject, GISLayer } from '../types/gis';

// Realistic coordinates centered around an Urban Metropolitan Engineering Area (e.g. Lng 90.4125, Lat 23.8103)
const CENTER_LNG = 90.4125;
const CENTER_LAT = 23.8103;

export const createWaterNetworkSampleProject = (): GISProject => {
  const reservoirLayer: GISLayer = {
    id: 'layer-reservoir',
    name: 'Reservoir & Treatment Plant',
    type: 'vector',
    geometryType: 'Polygon',
    domain: 'water',
    visible: true,
    opacity: 0.7,
    locked: false,
    groupId: 'group-water-infrastructure',
    fields: [
      { name: 'Name', type: 'string' },
      { name: 'Type', type: 'string' },
      { name: 'Capacity_m3', type: 'number' },
      { name: 'Elevation_m', type: 'number' },
      { name: 'Status', type: 'string' }
    ],
    symbology: {
      styleType: 'single',
      fillColor: '#0284c7',
      fillOpacity: 0.6,
      strokeColor: '#0369a1',
      strokeWidth: 2
    },
    labelConfig: {
      enabled: true,
      attributeField: 'Name',
      fontSize: 12,
      color: '#0284c7',
      haloColor: '#ffffff',
      haloWidth: 2,
      placement: 'centroid'
    },
    features: [
      {
        id: 'feat-res-1',
        layerId: 'layer-reservoir',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [CENTER_LNG - 0.008, CENTER_LAT + 0.008],
            [CENTER_LNG - 0.003, CENTER_LAT + 0.009],
            [CENTER_LNG - 0.002, CENTER_LAT + 0.005],
            [CENTER_LNG - 0.007, CENTER_LAT + 0.004],
            [CENTER_LNG - 0.008, CENTER_LAT + 0.008]
          ]]
        },
        properties: {
          Name: 'Central Impounding Reservoir',
          Type: 'Surface Reservoir',
          Capacity_m3: 250000,
          Elevation_m: 45.2,
          Status: 'Active Operational'
        }
      },
      {
        id: 'feat-wtp-1',
        layerId: 'layer-reservoir',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [CENTER_LNG - 0.002, CENTER_LAT + 0.005],
            [CENTER_LNG - 0.0005, CENTER_LAT + 0.0055],
            [CENTER_LNG - 0.0008, CENTER_LAT + 0.0035],
            [CENTER_LNG - 0.0022, CENTER_LAT + 0.0032],
            [CENTER_LNG - 0.002, CENTER_LAT + 0.005]
          ]]
        },
        properties: {
          Name: 'WTP Plant #1',
          Type: 'Rapid Sand Filter WTP',
          Capacity_m3: 120000,
          Elevation_m: 42.0,
          Status: 'Active Operational'
        }
      }
    ]
  };

  const transmissionMainLayer: GISLayer = {
    id: 'layer-transmission-main',
    name: 'Transmission Main (Bulk)',
    type: 'vector',
    geometryType: 'LineString',
    domain: 'water',
    visible: true,
    opacity: 1,
    locked: false,
    groupId: 'group-water-infrastructure',
    fields: [
      { name: 'Pipe_ID', type: 'string' },
      { name: 'Diameter_mm', type: 'number' },
      { name: 'Material', type: 'string' },
      { name: 'Flow_Lps', type: 'number' },
      { name: 'Pressure_Bar', type: 'number' },
      { name: 'Length_m', type: 'number' }
    ],
    symbology: {
      styleType: 'single',
      strokeColor: '#0284c7',
      strokeWidth: 4
    },
    labelConfig: {
      enabled: true,
      attributeField: 'Pipe_ID',
      fontSize: 11,
      color: '#0369a1',
      haloColor: '#ffffff',
      haloWidth: 2,
      placement: 'line'
    },
    features: [
      {
        id: 'feat-tm-1',
        layerId: 'layer-transmission-main',
        geometry: {
          type: 'LineString',
          coordinates: [
            [CENTER_LNG - 0.001, CENTER_LAT + 0.004],
            [CENTER_LNG + 0.002, CENTER_LAT + 0.002],
            [CENTER_LNG + 0.005, CENTER_LAT - 0.001],
            [CENTER_LNG + 0.008, CENTER_LAT - 0.004]
          ]
        },
        properties: {
          Pipe_ID: 'TM-600-01',
          Diameter_mm: 600,
          Material: 'Ductile Iron (DI)',
          Flow_Lps: 850,
          Pressure_Bar: 5.4,
          Length_m: 1420
        }
      },
      {
        id: 'feat-tm-2',
        layerId: 'layer-transmission-main',
        geometry: {
          type: 'LineString',
          coordinates: [
            [CENTER_LNG + 0.002, CENTER_LAT + 0.002],
            [CENTER_LNG + 0.001, CENTER_LAT - 0.005],
            [CENTER_LNG + 0.003, CENTER_LAT - 0.008]
          ]
        },
        properties: {
          Pipe_ID: 'TM-450-02',
          Diameter_mm: 450,
          Material: 'Ductile Iron (DI)',
          Flow_Lps: 420,
          Pressure_Bar: 4.8,
          Length_m: 1180
        }
      }
    ]
  };

  const distributionPipesLayer: GISLayer = {
    id: 'layer-dist-pipes',
    name: 'Distribution Mains',
    type: 'vector',
    geometryType: 'LineString',
    domain: 'water',
    visible: true,
    opacity: 1,
    locked: false,
    groupId: 'group-water-infrastructure',
    fields: [
      { name: 'Pipe_ID', type: 'string' },
      { name: 'Diameter_mm', type: 'number' },
      { name: 'Material', type: 'string' },
      { name: 'Zone', type: 'string' }
    ],
    symbology: {
      styleType: 'graduated',
      attributeField: 'Diameter_mm',
      strokeColor: '#0ea5e9',
      strokeWidth: 2,
      graduatedRanges: [
        { min: 100, max: 150, label: 'DN 100-150 (Distribution)', color: '#38bdf8', size: 2 },
        { min: 151, max: 250, label: 'DN 200-250 (Sub-Main)', color: '#0284c7', size: 3 },
        { min: 251, max: 400, label: 'DN 300+ (Main)', color: '#1e3a8a', size: 4 }
      ]
    },
    labelConfig: {
      enabled: true,
      attributeField: 'Pipe_ID',
      fontSize: 10,
      color: '#0f172a',
      haloColor: '#ffffff',
      haloWidth: 1.5,
      placement: 'line'
    },
    features: [
      {
        id: 'feat-dp-1',
        layerId: 'layer-dist-pipes',
        geometry: {
          type: 'LineString',
          coordinates: [
            [CENTER_LNG + 0.002, CENTER_LAT + 0.002],
            [CENTER_LNG + 0.005, CENTER_LAT + 0.004],
            [CENTER_LNG + 0.008, CENTER_LAT + 0.003]
          ]
        },
        properties: { Pipe_ID: 'DP-250-A', Diameter_mm: 250, Material: 'HDPE PN16', Zone: 'DMA-North' }
      },
      {
        id: 'feat-dp-2',
        layerId: 'layer-dist-pipes',
        geometry: {
          type: 'LineString',
          coordinates: [
            [CENTER_LNG + 0.005, CENTER_LAT + 0.004],
            [CENTER_LNG + 0.005, CENTER_LAT + 0.008],
            [CENTER_LNG + 0.001, CENTER_LAT + 0.008]
          ]
        },
        properties: { Pipe_ID: 'DP-160-B', Diameter_mm: 160, Material: 'HDPE PN16', Zone: 'DMA-North' }
      },
      {
        id: 'feat-dp-3',
        layerId: 'layer-dist-pipes',
        geometry: {
          type: 'LineString',
          coordinates: [
            [CENTER_LNG + 0.005, CENTER_LAT - 0.001],
            [CENTER_LNG + 0.009, CENTER_LAT - 0.001],
            [CENTER_LNG + 0.009, CENTER_LAT - 0.005]
          ]
        },
        properties: { Pipe_ID: 'DP-200-C', Diameter_mm: 200, Material: 'uPVC', Zone: 'DMA-East' }
      },
      {
        id: 'feat-dp-4',
        layerId: 'layer-dist-pipes',
        geometry: {
          type: 'LineString',
          coordinates: [
            [CENTER_LNG + 0.001, CENTER_LAT - 0.005],
            [CENTER_LNG - 0.003, CENTER_LAT - 0.005],
            [CENTER_LNG - 0.003, CENTER_LAT - 0.001]
          ]
        },
        properties: { Pipe_ID: 'DP-110-D', Diameter_mm: 110, Material: 'uPVC', Zone: 'DMA-South' }
      }
    ]
  };

  const valvesLayer: GISLayer = {
    id: 'layer-valves',
    name: 'Control Valves & Hydrants',
    type: 'vector',
    geometryType: 'Point',
    domain: 'water',
    visible: true,
    opacity: 1,
    locked: false,
    groupId: 'group-water-infrastructure',
    fields: [
      { name: 'Asset_ID', type: 'string' },
      { name: 'Category', type: 'string' },
      { name: 'Diameter_mm', type: 'number' },
      { name: 'Status', type: 'string' },
      { name: 'Elevation_m', type: 'number' }
    ],
    symbology: {
      styleType: 'categorized',
      attributeField: 'Category',
      fillColor: '#ef4444',
      pointRadius: 6,
      categoryRules: [
        { value: 'Isolation Valve', label: 'Gate/Isolation Valve', color: '#eab308', size: 6 },
        { value: 'PRV', label: 'Pressure Reducing Valve (PRV)', color: '#8b5cf6', size: 7 },
        { value: 'Fire Hydrant', label: 'Fire Hydrant', color: '#ef4444', size: 6 },
        { value: 'Water Tank', label: 'Overhead Tank', color: '#06b6d4', size: 9 }
      ]
    },
    labelConfig: {
      enabled: true,
      attributeField: 'Asset_ID',
      fontSize: 10,
      color: '#1e293b',
      haloColor: '#ffffff',
      haloWidth: 2,
      placement: 'point',
      offsetY: -12
    },
    features: [
      {
        id: 'feat-v-1',
        layerId: 'layer-valves',
        geometry: { type: 'Point', coordinates: [CENTER_LNG + 0.002, CENTER_LAT + 0.002] },
        properties: { Asset_ID: 'PRV-01', Category: 'PRV', Diameter_mm: 450, Status: 'Operational (In: 5.4 bar, Out: 3.2 bar)', Elevation_m: 38.5 }
      },
      {
        id: 'feat-v-2',
        layerId: 'layer-valves',
        geometry: { type: 'Point', coordinates: [CENTER_LNG + 0.005, CENTER_LAT + 0.004] },
        properties: { Asset_ID: 'VALVE-ISO-04', Category: 'Isolation Valve', Diameter_mm: 250, Status: '100% Open', Elevation_m: 36.2 }
      },
      {
        id: 'feat-v-3',
        layerId: 'layer-valves',
        geometry: { type: 'Point', coordinates: [CENTER_LNG + 0.008, CENTER_LAT + 0.003] },
        properties: { Asset_ID: 'FH-102', Category: 'Fire Hydrant', Diameter_mm: 100, Status: 'Ready (Flow 25 L/s)', Elevation_m: 35.0 }
      },
      {
        id: 'feat-v-4',
        layerId: 'layer-valves',
        geometry: { type: 'Point', coordinates: [CENTER_LNG + 0.001, CENTER_LAT - 0.005] },
        properties: { Asset_ID: 'OHT-TOWER-1', Category: 'Water Tank', Diameter_mm: 2000, Status: 'Active (Vol: 500m3)', Elevation_m: 58.0 }
      }
    ]
  };

  const dmaZonesLayer: GISLayer = {
    id: 'layer-dma-zones',
    name: 'District Metered Areas (DMA)',
    type: 'vector',
    geometryType: 'Polygon',
    domain: 'water',
    visible: true,
    opacity: 0.35,
    locked: false,
    groupId: 'group-boundaries',
    fields: [
      { name: 'Zone_Name', type: 'string' },
      { name: 'Code', type: 'string' },
      { name: 'Population', type: 'number' },
      { name: 'Demand_m3d', type: 'number' },
      { name: 'NRW_Percentage', type: 'number' }
    ],
    symbology: {
      styleType: 'single',
      fillColor: '#10b981',
      fillOpacity: 0.2,
      strokeColor: '#059669',
      strokeWidth: 2,
      strokeDashArray: '4, 4'
    },
    labelConfig: {
      enabled: true,
      attributeField: 'Zone_Name',
      fontSize: 12,
      color: '#065f46',
      haloColor: '#ffffff',
      haloWidth: 2,
      placement: 'centroid'
    },
    features: [
      {
        id: 'feat-dma-1',
        layerId: 'layer-dma-zones',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [CENTER_LNG, CENTER_LAT],
            [CENTER_LNG + 0.010, CENTER_LAT],
            [CENTER_LNG + 0.010, CENTER_LAT + 0.010],
            [CENTER_LNG, CENTER_LAT + 0.010],
            [CENTER_LNG, CENTER_LAT]
          ]]
        },
        properties: { Zone_Name: 'DMA Zone 1 - North Sector', Code: 'DMA-01', Population: 42500, Demand_m3d: 6800, NRW_Percentage: 14.2 }
      },
      {
        id: 'feat-dma-2',
        layerId: 'layer-dma-zones',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [CENTER_LNG - 0.005, CENTER_LAT - 0.008],
            [CENTER_LNG + 0.010, CENTER_LAT - 0.008],
            [CENTER_LNG + 0.010, CENTER_LAT],
            [CENTER_LNG - 0.005, CENTER_LAT],
            [CENTER_LNG - 0.005, CENTER_LAT - 0.008]
          ]]
        },
        properties: { Zone_Name: 'DMA Zone 2 - South Sector', Code: 'DMA-02', Population: 58000, Demand_m3d: 9200, NRW_Percentage: 18.5 }
      }
    ]
  };

  const spotElevationsLayer: GISLayer = {
    id: 'layer-spot-elevation',
    name: 'Spot Elevations (Terrain Benchmark)',
    type: 'vector',
    geometryType: 'Point',
    domain: 'survey',
    visible: true,
    opacity: 0.8,
    locked: false,
    groupId: 'group-survey',
    fields: [
      { name: 'Point_ID', type: 'string' },
      { name: 'Elevation_m', type: 'number' },
      { name: 'Description', type: 'string' }
    ],
    symbology: {
      styleType: 'single',
      fillColor: '#d97706',
      strokeColor: '#78350f',
      pointRadius: 4
    },
    labelConfig: {
      enabled: true,
      attributeField: 'Elevation_m',
      fontSize: 10,
      color: '#b45309',
      haloColor: '#ffffff',
      haloWidth: 1.5,
      placement: 'point',
      offsetY: 10
    },
    features: [
      { id: 'spot-1', layerId: 'layer-spot-elevation', geometry: { type: 'Point', coordinates: [CENTER_LNG - 0.005, CENTER_LAT + 0.008] }, properties: { Point_ID: 'BM-101', Elevation_m: 46.5, Description: 'Reservoir Crest Benchmark' } },
      { id: 'spot-2', layerId: 'layer-spot-elevation', geometry: { type: 'Point', coordinates: [CENTER_LNG, CENTER_LAT + 0.004] }, properties: { Point_ID: 'BM-102', Elevation_m: 41.2, Description: 'North Main Highway Intersection' } },
      { id: 'spot-3', layerId: 'layer-spot-elevation', geometry: { type: 'Point', coordinates: [CENTER_LNG + 0.005, CENTER_LAT + 0.002] }, properties: { Point_ID: 'BM-103', Elevation_m: 37.8, Description: 'Commercial Center Hub' } },
      { id: 'spot-4', layerId: 'layer-spot-elevation', geometry: { type: 'Point', coordinates: [CENTER_LNG + 0.008, CENTER_LAT - 0.004] }, properties: { Point_ID: 'BM-104', Elevation_m: 32.4, Description: 'South Outfall Lowland' } }
    ]
  };

  return {
    id: 'project-water-urban-01',
    name: 'Urban Water Supply Network (Sample)',
    description: 'Civil & Hydraulic Engineering GIS sample showing impounding reservoir, WTP, transmission mains, PRVs, hydrants, DMA boundary zones, and terrain elevations.',
    version: '1.0.0',
    crs: { code: 'EPSG:4326', name: 'WGS 84 (Geographic)', unit: 'degrees' },
    center: [CENTER_LNG, CENTER_LAT],
    zoom: 14,
    pitch: 25,
    bearing: 0,
    activeBasemapId: 'osm-standard',
    customBasemaps: [],
    groups: [
      { id: 'group-water-infrastructure', name: 'Water Supply Network', visible: true, collapsed: false },
      { id: 'group-boundaries', name: 'Administrative & DMA Zones', visible: true, collapsed: false },
      { id: 'group-survey', name: 'Survey & Terrain', visible: true, collapsed: false }
    ],
    layers: [
      valvesLayer,
      transmissionMainLayer,
      distributionPipesLayer,
      reservoirLayer,
      dmaZonesLayer,
      spotElevationsLayer
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};
