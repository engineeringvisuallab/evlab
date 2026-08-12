import { BasemapOption } from '../types/gis';

export const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    id: 'osm-standard',
    name: 'OpenStreetMap Standard',
    type: 'xyz',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    minZoom: 0,
  },
  {
    id: 'esri-satellite',
    name: 'Esri World Imagery (Satellite)',
    type: 'xyz',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
    minZoom: 0,
  },
  {
    id: 'esri-topo',
    name: 'Esri Topographic',
    type: 'xyz',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    maxZoom: 19,
    minZoom: 0,
  },
  {
    id: 'carto-dark',
    name: 'Carto Dark Matter (CAD/Night Mode)',
    type: 'xyz',
    url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors © CARTO',
    maxZoom: 19,
    minZoom: 0,
  },
  {
    id: 'carto-light',
    name: 'Carto Positron (Light Precision)',
    type: 'xyz',
    url: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors © CARTO',
    maxZoom: 19,
    minZoom: 0,
  },
];
