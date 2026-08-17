import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GISFeature } from '../../data/sherpur-gis-data';
import { UELE_BASEMAPS, UELEBasemapOption } from '../../data/uele-basemaps';
import { UELELayer } from '../../types/uele';
import { Navigation, ZoomIn, ZoomOut, Maximize2, RotateCcw, Layers, Globe } from 'lucide-react';
import { Button } from '../shared/Button';

// Fix for default Leaflet icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface UELE2DMapProps {
  features: GISFeature[];
  layers: UELELayer[];
  selectedFeatureId: string | null;
  onSelectFeature: (featureId: string) => void;
  activeBasemapId: string;
  onBasemapChange: (basemapId: string) => void;
  onOpenImportModal: () => void;
  onResetView: () => void;
}

export const UELE2DMap: React.FC<UELE2DMapProps> = ({
  features,
  layers,
  selectedFeatureId,
  onSelectFeature,
  activeBasemapId,
  onBasemapChange,
  onOpenImportModal,
  onResetView,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);

  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number }>({
    lat: 24.6800,
    lng: 89.4100,
  });
  const [currentZoom, setCurrentZoom] = useState<number>(13);
  const [isBasemapMenuOpen, setIsBasemapMenuOpen] = useState<boolean>(false);

  const activeBasemap =
    UELE_BASEMAPS.find((b) => b.id === activeBasemapId) || UELE_BASEMAPS[0];

  // Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Initialize once

    const map = L.map(mapContainerRef.current, {
      center: [24.6800, 89.4100],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Scale Control
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    // Feature Layer Group
    const featureGroup = L.featureGroup().addTo(map);
    featureGroupRef.current = featureGroup;

    // Map Event Listeners
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // Invalidate size on resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Basemap
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileLayer = L.tileLayer(activeBasemap.url, {
      maxZoom: activeBasemap.maxZoom,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    tileLayerRef.current = tileLayer;
  }, [activeBasemapId]);

  // Render Features on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const featureGroup = featureGroupRef.current;
    if (!map || !featureGroup) return;

    featureGroup.clearLayers();

    // Active layer IDs set
    const visibleLayerIds = new Set(layers.filter((l) => l.visible).map((l) => l.id));

    const visibleFeatures = features.filter((f) => visibleLayerIds.has(f.properties.layerId));

    visibleFeatures.forEach((feature) => {
      const isSelected = feature.id === selectedFeatureId;
      const color =
        layers.find((l) => l.id === feature.properties.layerId)?.color || '#06b6d4';

      const styleOptions: L.PathOptions = {
        color: isSelected ? '#38bdf8' : color,
        weight: isSelected ? 4 : 2.5,
        opacity: isSelected ? 1 : 0.85,
        fillColor: color,
        fillOpacity: isSelected ? 0.45 : 0.25,
      };

      let layer: L.Layer;

      if (feature.geometry.type === 'Point') {
        const coords = feature.geometry.coordinates; // [lng, lat]
        const circleMarker = L.circleMarker([coords[1], coords[0]], {
          radius: isSelected ? 9 : 6,
          color: isSelected ? '#ffffff' : color,
          weight: isSelected ? 3 : 2,
          fillColor: color,
          fillOpacity: 0.9,
        });

        circleMarker.bindTooltip(
          `<div class="font-mono text-xs font-bold">${feature.properties.name}</div>
           <div class="font-mono text-[10px] text-cyan-300">${feature.properties.layerName}</div>`,
          { direction: 'top', className: 'custom-leaflet-tooltip' }
        );

        circleMarker.on('click', () => {
          onSelectFeature(feature.id);
        });

        layer = circleMarker;
      } else {
        const geoLayer = L.geoJSON(feature as any, {
          style: styleOptions,
          onEachFeature: (_, l) => {
            l.bindTooltip(
              `<div class="font-mono text-xs font-bold">${feature.properties.name}</div>
               <div class="font-mono text-[10px] text-cyan-300">${feature.properties.layerName}</div>`,
              { direction: 'top', className: 'custom-leaflet-tooltip' }
            );

            l.on('click', () => {
              onSelectFeature(feature.id);
            });
          },
        });

        layer = geoLayer;
      }

      featureGroup.addLayer(layer);
    });

    // If feature is selected, pan smoothly to feature center
    if (selectedFeatureId) {
      const targetFeat = features.find((f) => f.id === selectedFeatureId);
      if (targetFeat && targetFeat.properties.lat && targetFeat.properties.lng) {
        map.panTo([targetFeat.properties.lat, targetFeat.properties.lng], { animate: true });
      }
    }
  }, [features, layers, selectedFeatureId]);

  // Zoom Controls Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleFitBounds = () => {
    const featureGroup = featureGroupRef.current;
    const map = mapInstanceRef.current;
    if (featureGroup && map && featureGroup.getLayers().length > 0) {
      map.fitBounds(featureGroup.getBounds(), { padding: [30, 30] });
    } else if (map) {
      map.setView([24.6800, 89.4100], 13);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 overflow-hidden font-mono select-none">
      {/* 1. Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 2. Top Right Floating Controls HUD */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-cyan-500 border border-slate-700 text-slate-200 hover:text-slate-950 flex items-center justify-center shadow-lg transition-all cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-cyan-500 border border-slate-700 text-slate-200 hover:text-slate-950 flex items-center justify-center shadow-lg transition-all cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Fit Bounds */}
        <button
          onClick={handleFitBounds}
          title="Fit Layer Bounds"
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-cyan-500 border border-slate-700 text-slate-200 hover:text-slate-950 flex items-center justify-center shadow-lg transition-all cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Top Left Basemap Selector Dropdown */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="relative">
          <button
            onClick={() => setIsBasemapMenuOpen((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-xs text-slate-200 font-bold flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Basemap: {activeBasemap.name}</span>
          </button>

          {isBasemapMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-2 shadow-2xl space-y-1 z-50">
              <div className="text-[10px] text-slate-400 px-2 py-1 uppercase font-bold border-b border-slate-800">
                Select Satellite / GIS Basemap
              </div>
              {UELE_BASEMAPS.map((bm) => (
                <button
                  key={bm.id}
                  onClick={() => {
                    onBasemapChange(bm.id);
                    setIsBasemapMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer border ${
                    bm.id === activeBasemapId
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-cyan-500/30'
                  }`}
                >
                  <div>
                    <div>{bm.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{bm.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom HUD Coordinates & Scale Bar */}
      <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-3 shadow-lg">
        <span className="flex items-center space-x-1">
          <Navigation className="w-3 h-3 text-cyan-400" />
          <span>LAT: {mouseCoords.lat.toFixed(4)}° N</span>
        </span>
        <span>•</span>
        <span>LNG: {mouseCoords.lng.toFixed(4)}° E</span>
        <span>•</span>
        <span className="text-cyan-400 font-bold">ZOOM: {currentZoom}x</span>
        <span>•</span>
        <span className="text-emerald-400 font-semibold">WGS84 EPSG:4326</span>
      </div>
    </div>
  );
};
