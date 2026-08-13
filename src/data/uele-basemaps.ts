export interface UELEBasemapOption {
  id: string;
  name: string;
  category: 'satellite' | 'dark' | 'streets' | 'terrain' | 'light';
  url: string;
  attribution: string;
  maxZoom: number;
  previewColor: string;
  description: string;
}

export const UELE_BASEMAPS: UELEBasemapOption[] = [
  {
    id: 'esri-satellite',
    name: 'Satellite (Esri World Imagery)',
    category: 'satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
    previewColor: '#0c4a6e',
    description: 'High-resolution aerial satellite imagery basemap for real spatial alignment.',
  },
  {
    id: 'carto-dark',
    name: 'CAD Dark (CartoDB Dark Matter)',
    category: 'dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    previewColor: '#0f172a',
    description: 'Dark-themed high contrast CAD style canvas ideal for glowing GIS vectors.',
  },
  {
    id: 'osm-streets',
    name: 'Streets (OpenStreetMap)',
    category: 'streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    previewColor: '#3b82f6',
    description: 'Standard road and transportation vector basemap with administrative names.',
  },
  {
    id: 'esri-topo',
    name: 'Terrain & Topo (Esri World Topo)',
    category: 'terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), swisstopo, MapmyIndia, &copy; OpenStreetMap contributors, and the GIS User Community',
    maxZoom: 19,
    previewColor: '#15803d',
    description: 'Topographic contour lines, landform relief, and hydrological terrain.',
  },
  {
    id: 'carto-light',
    name: 'CAD Light (CartoDB Positron)',
    category: 'light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{y}/{x}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    previewColor: '#f8fafc',
    description: 'Clean white engineering blueprint canvas for high-density GIS reports.',
  },
];
