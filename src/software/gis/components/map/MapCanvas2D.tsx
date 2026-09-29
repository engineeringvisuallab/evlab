import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useGIS } from '../../context/GISContext';
import { BASEMAP_OPTIONS } from '../../services/basemaps';
import { findSnapTarget, SnapTarget, formatDistance, formatArea, calculateBearing } from '../../services/cadEngine';
import { calculateGeometryMetrics } from '../../services/turfAnalysis';
import { GISFeature } from '../../types/gis';
import {
  ZoomIn,
  Edit2,
  Table,
  Move,
  RotateCw,
  Copy,
  Trash2,
  Maximize2,
  Check,
  X,
} from 'lucide-react';

interface FeatureContextMenuState {
  x: number;
  y: number;
  featureId: string;
  layerId: string;
}

export const MapCanvas2D: React.FC<{
  onMouseMoveCoords?: (coords: { lng: number; lat: number; zoom: number; scaleStr: string }) => void;
}> = ({ onMouseMoveCoords }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const {
    project,
    activeTool,
    setActiveTool,
    selectedFeatureIds,
    setSelectedFeatureIds,
    selectFeatures,
    selectAllInLayer,
    clearSelection,
    activeLayerId,
    addFeatureToLayer,
    updateFeatureGeometry,
    deleteSelectedFeatures,
    snappingSettings,
    setElevationProfileLine,
    setIsElevationProfileOpen,
    setIsAttributeTableOpen,
    setIsFieldManagerOpen,
    flyToExtent,
    setFlyToExtent,
    zoomToFeatures,
    undo,
    redo,
    saveCurrentProject,
    duplicateSelectedFeatures,
    vertexInsert,
    vertexMove,
    vertexDelete,
    logCommand,
  } = useGIS();

  // Handle Fly To Extent
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToExtent) return;

    try {
      map.fitBounds(
        [
          [flyToExtent[0], flyToExtent[1]],
          [flyToExtent[2], flyToExtent[3]],
        ],
        { padding: 60, duration: 800 }
      );
    } catch (e) {
      console.warn('fitBounds failed:', e);
    }

    setFlyToExtent(null);
  }, [flyToExtent, setFlyToExtent]);

  // Canvas State
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [currentSnap, setCurrentSnap] = useState<SnapTarget | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; text: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<FeatureContextMenuState | null>(null);

  // Box Selection Dragging
  const [boxStart, setBoxStart] = useState<{ x: number; y: number; lng: number; lat: number } | null>(null);
  const [boxCurrent, setBoxCurrent] = useState<{ x: number; y: number } | null>(null);

  // Dragging vertex state
  const [draggingVertex, setDraggingVertex] = useState<{
    layerId: string;
    featureId: string;
    vIndex: number;
  } | null>(null);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialBasemap = BASEMAP_OPTIONS.find((b) => b.id === project.activeBasemapId) || BASEMAP_OPTIONS[0];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'basemap-source': {
            type: 'raster',
            tiles: [initialBasemap.url],
            tileSize: 256,
            attribution: initialBasemap.attribution,
          },
        },
        layers: [
          {
            id: 'basemap-layer',
            type: 'raster',
            source: 'basemap-source',
            minzoom: 0,
            maxzoom: 20,
          },
        ],
      },
      center: project.center,
      zoom: project.zoom,
      pitch: project.pitch,
      bearing: project.bearing,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      setIsStyleLoaded(true);
    });

    map.on('styledata', () => {
      if (map.isStyleLoaded()) {
        setIsStyleLoaded(true);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setIsStyleLoaded(false);
    };
  }, []);

  // Sync Basemap Source
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoaded || !map.isStyleLoaded()) return;

    const activeBase = BASEMAP_OPTIONS.find((b) => b.id === project.activeBasemapId) || BASEMAP_OPTIONS[0];

    try {
      if (map.getLayer('basemap-layer')) map.removeLayer('basemap-layer');
      if (map.getSource('basemap-source')) map.removeSource('basemap-source');

      map.addSource('basemap-source', {
        type: 'raster',
        tiles: [activeBase.url],
        tileSize: 256,
        attribution: activeBase.attribution,
      });

      const style = map.getStyle();
      const firstLayerId = style?.layers?.[0]?.id;

      map.addLayer(
        {
          id: 'basemap-layer',
          type: 'raster',
          source: 'basemap-source',
        },
        firstLayerId
      );
    } catch (e) {
      console.warn('Basemap sync error:', e);
    }
  }, [project.activeBasemapId, isStyleLoaded]);

  // Sync GIS Vector Layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoaded || !map.isStyleLoaded()) return;

    try {
      // Clean up existing vector sources & layers
      const style = map.getStyle();
      if (style && style.layers) {
        style.layers.forEach((lyr) => {
          if (
            lyr.id.startsWith('evlab-layer-') ||
            lyr.id.startsWith('evlab-label-') ||
            lyr.id.startsWith('evlab-select-')
          ) {
            if (map.getLayer(lyr.id)) map.removeLayer(lyr.id);
          }
        });
      }

      if (style && style.sources) {
        Object.keys(style.sources).forEach((srcId) => {
          if (srcId.startsWith('evlab-source-')) {
            if (map.getSource(srcId)) map.removeSource(srcId);
          }
        });
      }

      // Add layers in reverse order so top TOC layer renders on top
      [...project.layers].reverse().forEach((layer) => {
        if (!layer.visible) return;

        const sourceId = `evlab-source-${layer.id}`;
        const geojson: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: layer.features.map((f) => ({
            type: 'Feature',
            id: f.id,
            geometry: f.geometry,
            properties: {
              ...f.properties,
              _featureId: f.id,
              _layerId: layer.id,
              _isSelected: selectedFeatureIds.includes(f.id),
            },
          })),
        };

        map.addSource(sourceId, {
          type: 'geojson',
          data: geojson,
        });

        const fillLayerId = `evlab-layer-fill-${layer.id}`;
        const lineLayerId = `evlab-layer-line-${layer.id}`;
        const pointLayerId = `evlab-layer-point-${layer.id}`;
        const selectLayerId = `evlab-select-${layer.id}`;
        const labelLayerId = `evlab-label-${layer.id}`;

        // 1. Polygon Fill
        if (layer.geometryType === 'Polygon' || layer.geometryType === 'MultiPolygon') {
          map.addLayer({
            id: fillLayerId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': layer.symbology.fillColor || '#0284c7',
              'fill-opacity': layer.opacity * (layer.symbology.fillOpacity ?? 0.5),
            },
          });

          map.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': layer.symbology.strokeColor || '#0369a1',
              'line-width': layer.symbology.strokeWidth || 2,
              'line-opacity': layer.opacity,
            },
          });
        }

        // 2. LineString Stroke
        if (layer.geometryType === 'LineString' || layer.geometryType === 'MultiLineString') {
          map.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': layer.symbology.strokeColor || '#0284c7',
              'line-width': layer.symbology.strokeWidth || 3,
              'line-opacity': layer.opacity,
            },
          });
        }

        // 3. Point Circles
        if (layer.geometryType === 'Point' || layer.geometryType === 'MultiPoint') {
          map.addLayer({
            id: pointLayerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': layer.symbology.pointRadius || 6,
              'circle-color': layer.symbology.fillColor || '#38bdf8',
              'circle-stroke-width': layer.symbology.strokeWidth || 2,
              'circle-stroke-color': layer.symbology.strokeColor || '#0f172a',
              'circle-opacity': layer.opacity,
            },
          });
        }

        // 4. Selection Highlight Layer
        map.addLayer({
          id: selectLayerId,
          type: 'line',
          source: sourceId,
          filter: ['==', ['get', '_isSelected'], true],
          paint: {
            'line-color': '#00f0ff',
            'line-width': 4,
            'line-dasharray': [2, 2],
          },
        });

        // 5. Labels Layer
        if (layer.labelConfig?.enabled && layer.labelConfig.attributeField) {
          map.addLayer({
            id: labelLayerId,
            type: 'symbol',
            source: sourceId,
            layout: {
              'text-field': ['get', layer.labelConfig.attributeField],
              'text-size': layer.labelConfig.fontSize || 12,
              'text-offset': [0, layer.labelConfig.offsetY || -1.2],
              'text-anchor': 'bottom',
            },
            paint: {
              'text-color': layer.labelConfig.color || '#f8fafc',
              'text-halo-color': layer.labelConfig.haloColor || '#0f172a',
              'text-halo-width': layer.labelConfig.haloWidth || 1.5,
            },
          });
        }
      });
    } catch (e) {
      console.warn('Vector layer sync error:', e);
    }
  }, [project.layers, selectedFeatureIds, isStyleLoaded]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing inside text inputs
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Escape') {
        setDrawingPoints([]);
        clearSelection();
        setActiveTool('select');
        setContextMenu(null);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedFeatureIds.length > 0) {
          deleteSelectedFeatures();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentProject();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAllInLayer();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        duplicateSelectedFeatures();
      } else if (e.key.toLowerCase() === 'm') {
        setActiveTool('transform_move');
      } else if (e.key.toLowerCase() === 'r') {
        setActiveTool('transform_rotate');
      } else if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        setActiveTool('transform_scale');
      } else if (e.key.toLowerCase() === 'e') {
        setActiveTool('edit_vertices');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedFeatureIds,
    deleteSelectedFeatures,
    undo,
    redo,
    saveCurrentProject,
    selectAllInLayer,
    duplicateSelectedFeatures,
    clearSelection,
    setActiveTool,
  ]);

  // Mouse Move Handler
  const handleMouseMove = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      const map = mapRef.current;
      if (!map) return;

      const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const pixel: [number, number] = [e.point.x, e.point.y];

      if (onMouseMoveCoords) {
        const zoom = Math.round(map.getZoom() * 10) / 10;
        const scaleApprox = Math.round(591657550.5 / Math.pow(2, zoom));
        onMouseMoveCoords({
          lng: parseFloat(lngLat[0].toFixed(5)),
          lat: parseFloat(lngLat[1].toFixed(5)),
          zoom,
          scaleStr: `1:${scaleApprox.toLocaleString()}`,
        });
      }

      // Snapping Engine Check
      const projectPointToPixel = (pt: [number, number]): [number, number] => {
        const p = map.project(pt);
        return [p.x, p.y];
      };

      const snap = findSnapTarget(lngLat, pixel, project.layers, activeLayerId, snappingSettings, projectPointToPixel);
      setCurrentSnap(snap);

      // Handle Box Selection Dragging
      if (boxStart) {
        setBoxCurrent({ x: e.point.x, y: e.point.y });
      }

      // Handle Vertex Dragging
      if (draggingVertex) {
        const targetLngLat = snap ? [snap.lng, snap.lat] : lngLat;
        vertexMove(draggingVertex.layerId, draggingVertex.featureId, draggingVertex.vIndex, targetLngLat as [number, number]);
      }

      // HUD Tooltips for active drawing/measuring
      if (drawingPoints.length > 0) {
        const lastPt = drawingPoints[drawingPoints.length - 1];
        const nextPt = snap ? [snap.lng, snap.lat] : lngLat;

        const metrics = calculateGeometryMetrics({
          type: 'LineString',
          coordinates: [...drawingPoints, nextPt],
        });

        const distStr = formatDistance(metrics.lengthMeters);
        const bearingDeg = calculateBearing(lastPt, nextPt as [number, number]);

        setHoverInfo({
          x: e.point.x + 15,
          y: e.point.y + 15,
          text: `Seg: ${distStr} | Bearing: ${bearingDeg.toFixed(1)}°${
            snap ? ` [${snap.type.toUpperCase()}${snap.layerName ? `: ${snap.layerName}` : ''}]` : ''
          }`,
        });
      } else if (snap) {
        setHoverInfo({
          x: e.point.x + 15,
          y: e.point.y + 15,
          text: `SNAP: ${snap.type.toUpperCase()}${snap.layerName ? ` (${snap.layerName})` : ''}`,
        });
      } else {
        setHoverInfo(null);
      }
    },
    [drawingPoints, project.layers, activeLayerId, snappingSettings, onMouseMoveCoords, boxStart, draggingVertex, vertexMove]
  );

  // Mouse Down for Box Selection
  const handleMouseDown = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      if (activeTool === 'select_box') {
        setBoxStart({ x: e.point.x, y: e.point.y, lng: e.lngLat.lng, lat: e.lngLat.lat });
        setBoxCurrent({ x: e.point.x, y: e.point.y });
      }
    },
    [activeTool]
  );

  // Mouse Up for Box Selection
  const handleMouseUp = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      const map = mapRef.current;

      if (draggingVertex) {
        setDraggingVertex(null);
      }

      if (boxStart && boxCurrent && map && map.isStyleLoaded()) {
        const xMin = Math.min(boxStart.x, boxCurrent.x);
        const xMax = Math.max(boxStart.x, boxCurrent.x);
        const yMin = Math.min(boxStart.y, boxCurrent.y);
        const yMax = Math.max(boxStart.y, boxCurrent.y);

        const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
          [xMin, yMin],
          [xMax, yMax],
        ];

        const layersToQuery = map
          .getStyle()
          ?.layers?.filter((l) => l.id.startsWith('evlab-layer-'))
          .map((l) => l.id);

        if (layersToQuery && layersToQuery.length > 0) {
          const features = map.queryRenderedFeatures(bbox, { layers: layersToQuery });
          const matchedIds = Array.from(
            new Set(features.flatMap((f) => (f.properties?._featureId ? [f.properties._featureId] : [])))
          );
          selectFeatures(matchedIds, e.originalEvent.shiftKey ? 'add' : 'new');
        }

        setBoxStart(null);
        setBoxCurrent(null);
      }
    },
    [boxStart, boxCurrent, draggingVertex, selectFeatures]
  );

  // Map Click Handler
  const handleMapClick = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      setContextMenu(null);
      const map = mapRef.current;
      if (!map) return;

      const pt: [number, number] = currentSnap
        ? [currentSnap.lng, currentSnap.lat]
        : [e.lngLat.lng, e.lngLat.lat];

      // SELECTION MODE
      if (activeTool === 'select') {
        if (!map.isStyleLoaded()) return;

        const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
          [e.point.x - 5, e.point.y - 5],
          [e.point.x + 5, e.point.y + 5],
        ];

        const layersToQuery = map
          .getStyle()
          ?.layers?.filter((l) => l.id.startsWith('evlab-layer-'))
          .map((l) => l.id);

        if (layersToQuery && layersToQuery.length > 0) {
          const features = map.queryRenderedFeatures(bbox, { layers: layersToQuery });
          if (features.length > 0) {
            const featId = features[0].properties?._featureId;
            if (featId) {
              selectFeatures([featId], e.originalEvent.shiftKey ? 'add' : 'new');
            }
          } else {
            clearSelection();
          }
        }
        return;
      }

      // DRAWING POINT FEATURES
      if (
        activeTool === 'draw_point' ||
        activeTool === 'water_valve' ||
        activeTool === 'water_hydrant' ||
        activeTool === 'water_reservoir' ||
        activeTool === 'manhole'
      ) {
        if (!activeLayerId) {
          alert('Please select or create a target vector layer first.');
          return;
        }

        const newFeature: GISFeature = {
          id: `feat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          layerId: activeLayerId,
          geometry: { type: 'Point', coordinates: pt },
          properties: {
            ID: `PT-${Math.floor(Math.random() * 8999 + 1000)}`,
            Type: activeTool.replace('water_', '').toUpperCase(),
            Created: new Date().toLocaleDateString(),
          },
        };

        addFeatureToLayer(activeLayerId, newFeature);
        setDrawingPoints([]);
        return;
      }

      // LINE DIGITIZING
      if (
        activeTool === 'draw_line' ||
        activeTool === 'water_pipe' ||
        activeTool === 'road_centerline' ||
        activeTool === 'drain_line' ||
        activeTool === 'measure_distance' ||
        activeTool === 'elevation_profile'
      ) {
        const newPoints = [...drawingPoints, pt];
        setDrawingPoints(newPoints);
        return;
      }

      // POLYGON DIGITIZING
      if (
        activeTool === 'draw_polygon' ||
        activeTool === 'draw_rectangle' ||
        activeTool === 'measure_area' ||
        activeTool === 'select_polygon'
      ) {
        const newPoints = [...drawingPoints, pt];
        setDrawingPoints(newPoints);
        return;
      }
    },
    [
      activeTool,
      activeLayerId,
      drawingPoints,
      currentSnap,
      addFeatureToLayer,
      selectFeatures,
      clearSelection,
    ]
  );

  // Finish Digitizing
  const finishDrawing = useCallback(() => {
    if (drawingPoints.length < 2) {
      setDrawingPoints([]);
      return;
    }

    if (activeTool === 'elevation_profile') {
      setElevationProfileLine(drawingPoints);
      setIsElevationProfileOpen(true);
      setDrawingPoints([]);
      setActiveTool('select');
      return;
    }

    if (!activeLayerId) {
      alert('Please select a target layer to add digitized features.');
      setDrawingPoints([]);
      return;
    }

    if (
      activeTool === 'draw_line' ||
      activeTool === 'water_pipe' ||
      activeTool === 'road_centerline' ||
      activeTool === 'drain_line'
    ) {
      const metrics = calculateGeometryMetrics({ type: 'LineString', coordinates: drawingPoints });
      const newFeature: GISFeature = {
        id: `feat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        layerId: activeLayerId,
        geometry: { type: 'LineString', coordinates: drawingPoints },
        properties: {
          ID: `LN-${Math.floor(Math.random() * 8999 + 1000)}`,
          Length_m: parseFloat(metrics.lengthMeters.toFixed(1)),
          Material: activeTool === 'water_pipe' ? 'DI' : 'Standard',
          Diameter_mm: activeTool === 'water_pipe' ? 250 : undefined,
        },
      };
      addFeatureToLayer(activeLayerId, newFeature);
    } else if (activeTool === 'draw_polygon') {
      const polygonCoords = [...drawingPoints, drawingPoints[0]];
      const metrics = calculateGeometryMetrics({ type: 'Polygon', coordinates: [polygonCoords] });
      const newFeature: GISFeature = {
        id: `feat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        layerId: activeLayerId,
        geometry: { type: 'Polygon', coordinates: [polygonCoords] },
        properties: {
          ID: `POLY-${Math.floor(Math.random() * 8999 + 1000)}`,
          Area_sqm: parseFloat(metrics.areaSqMeters.toFixed(1)),
        },
      };
      addFeatureToLayer(activeLayerId, newFeature);
    }

    setDrawingPoints([]);
  }, [
    drawingPoints,
    activeTool,
    activeLayerId,
    addFeatureToLayer,
    setElevationProfileLine,
    setIsElevationProfileOpen,
    setActiveTool,
  ]);

  // Context Menu Right Click
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const map = mapRef.current;
      if (!map || !map.isStyleLoaded()) return;

      const point = map.project([e.clientX, e.clientY]);
      const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
        [e.clientX - 10, e.clientY - 10],
        [e.clientX + 10, e.clientY + 10],
      ];

      const layersToQuery = map
        .getStyle()
        ?.layers?.filter((l) => l.id.startsWith('evlab-layer-'))
        .map((l) => l.id);

      if (layersToQuery && layersToQuery.length > 0) {
        const features = map.queryRenderedFeatures(bbox, { layers: layersToQuery });
        if (features.length > 0) {
          const featId = features[0].properties?._featureId;
          const lyrId = features[0].properties?._layerId;
          if (featId && lyrId) {
            setSelectedFeatureIds([featId]);
            setContextMenu({ x: e.clientX, y: e.clientY, featureId: featId, layerId: lyrId });
            return;
          }
        }
      }
      setContextMenu(null);
    },
    [setSelectedFeatureIds]
  );

  // Compute selected feature handles for Vertex Editing Overlay
  const selectedFeatures = project.layers
    .flatMap((l) => l.features)
    .filter((f) => selectedFeatureIds.includes(f.id));

  // The handlers above are written against maplibre-gl's own MapMouseEvent
  // (they read e.lngLat / e.point), but the container div only ever emits
  // plain React DOM mouse events. This adapter converts a DOM mouse event on
  // the map container into a maplibre-flavoured event before delegating.
  const toMapMouseEvent = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): maplibregl.MapMouseEvent | null => {
      const map = mapRef.current;
      const container = mapContainerRef.current;
      if (!map || !container) return null;
      const rect = container.getBoundingClientRect();
      const point = new maplibregl.Point(e.clientX - rect.left, e.clientY - rect.top);
      const lngLat = map.unproject(point);
      return {
        type: e.type,
        point,
        lngLat,
        originalEvent: e.nativeEvent,
        target: map,
        preventDefault: () => e.preventDefault(),
        defaultPrevented: e.defaultPrevented,
      } as unknown as maplibregl.MapMouseEvent;
    },
    []
  );

  const handleMapClickDom = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const mapEvent = toMapMouseEvent(e);
      if (mapEvent) handleMapClick(mapEvent);
    },
    [toMapMouseEvent, handleMapClick]
  );

  const handleMouseMoveDom = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const mapEvent = toMapMouseEvent(e);
      if (mapEvent) handleMouseMove(mapEvent);
    },
    [toMapMouseEvent, handleMouseMove]
  );

  const handleMouseDownDom = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const mapEvent = toMapMouseEvent(e);
      if (mapEvent) handleMouseDown(mapEvent);
    },
    [toMapMouseEvent, handleMouseDown]
  );

  const handleMouseUpDom = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const mapEvent = toMapMouseEvent(e);
      if (mapEvent) handleMouseUp(mapEvent);
    },
    [toMapMouseEvent, handleMouseUp]
  );

  return (
    <div
      className="relative w-full h-full bg-slate-950 overflow-hidden select-none"
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDownDom}
      onMouseUp={handleMouseUpDom}
    >
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full cursor-crosshair"
        onClick={handleMapClickDom}
        onMouseMove={handleMouseMoveDom}
        onDoubleClick={finishDrawing}
      />

      {/* Drag Box Overlay for Box Selection */}
      {boxStart && boxCurrent && (
        <div
          className="absolute z-20 border-2 border-cyan-400 bg-cyan-500/20 pointer-events-none"
          style={{
            left: Math.min(boxStart.x, boxCurrent.x),
            top: Math.min(boxStart.y, boxCurrent.y),
            width: Math.abs(boxCurrent.x - boxStart.x),
            height: Math.abs(boxCurrent.y - boxStart.y),
          }}
        />
      )}

      {/* Vertex Handles Overlay in Edit Vertices Mode */}
      {(activeTool === 'edit_vertices' || activeTool === 'modify_vertex') &&
        isStyleLoaded &&
        mapRef.current &&
        selectedFeatures.map((feat) => {
          const geom = feat.geometry as any;
          if (!geom || !geom.coordinates) return null;

          let coords: [number, number][] = [];
          if (geom.type === 'Point') coords = [geom.coordinates];
          else if (geom.type === 'LineString') coords = geom.coordinates;
          else if (geom.type === 'Polygon') coords = geom.coordinates[0];

          return (
            <React.Fragment key={`v-group-${feat.id}`}>
              {/* Vertex Control Boxes */}
              {coords.map((c, vIdx) => {
                const pt = mapRef.current!.project(c);
                return (
                  <div
                    key={`v-${feat.id}-${vIdx}`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingVertex({ layerId: feat.layerId, featureId: feat.id, vIndex: vIdx });
                    }}
                    onContextMenu={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      vertexDelete(feat.layerId, feat.id, vIdx);
                    }}
                    title="Drag to move vertex, right-click to delete"
                    className="absolute z-30 w-3.5 h-3.5 bg-white border-2 border-cyan-500 rounded-sm shadow-md cursor-move transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition"
                    style={{ left: pt.x, top: pt.y }}
                  />
                );
              })}

              {/* Segment Midpoint Handles for Inserting Vertices */}
              {(geom.type === 'LineString' || geom.type === 'Polygon') &&
                coords.map((c, vIdx) => {
                  if (vIdx >= coords.length - 1) return null;
                  const nextC = coords[vIdx + 1];
                  const midC: [number, number] = [(c[0] + nextC[0]) / 2, (c[1] + nextC[1]) / 2];
                  const pt = mapRef.current!.project(midC);

                  return (
                    <div
                      key={`mid-${feat.id}-${vIdx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        vertexInsert(feat.layerId, feat.id, vIdx, midC);
                      }}
                      title="Click to insert new vertex"
                      className="absolute z-30 w-2.5 h-2.5 bg-cyan-400 border border-slate-900 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition"
                      style={{ left: pt.x, top: pt.y }}
                    />
                  );
                })}
            </React.Fragment>
          );
        })}

      {/* Snapping Target Cursor Badge */}
      {currentSnap && isStyleLoaded && mapRef.current && (
        <div
          className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: mapRef.current.project([currentSnap.lng, currentSnap.lat]).x,
            top: mapRef.current.project([currentSnap.lng, currentSnap.lat]).y,
          }}
        >
          <div className="w-5 h-5 border-2 border-emerald-400 rounded-sm bg-emerald-500/20 animate-ping" />
          <div className="absolute w-2 h-2 bg-emerald-400 rounded-full" />
        </div>
      )}

      {/* Active Digitizing HUD Badge */}
      {hoverInfo && (
        <div
          className="absolute z-30 pointer-events-none bg-slate-900/90 border border-slate-700/80 backdrop-blur text-xs text-cyan-300 font-mono px-2 py-1 rounded shadow-xl"
          style={{ left: hoverInfo.x, top: hoverInfo.y }}
        >
          {hoverInfo.text}
        </div>
      )}

      {/* Digitizing Mode Finish Ribbon */}
      {drawingPoints.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/90 border border-cyan-500/40 text-slate-100 text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            Digitizing {drawingPoints.length} point(s) ({activeTool})
          </span>
          <button
            onClick={finishDrawing}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-2.5 py-0.5 rounded text-xs transition"
          >
            Finish (Enter)
          </button>
          <button
            onClick={() => setDrawingPoints([])}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs transition"
          >
            Cancel (Esc)
          </button>
        </div>
      )}

      {/* Feature Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-slate-900 border border-slate-700/80 rounded-lg shadow-2xl py-1 text-xs text-slate-200 min-w-[170px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] text-slate-400 font-mono font-semibold">
            Feature: {contextMenu.featureId}
          </div>
          <button
            onClick={() => {
              zoomToFeatures([contextMenu.featureId]);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
          >
            <Maximize2 size={13} className="text-cyan-400" />
            <span>Zoom to Feature</span>
          </button>
          <button
            onClick={() => {
              setActiveTool('edit_vertices');
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
          >
            <Edit2 size={13} className="text-amber-400" />
            <span>Edit Vertices</span>
          </button>
          <button
            onClick={() => {
              setIsAttributeTableOpen(true);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
          >
            <Table size={13} className="text-emerald-400" />
            <span>Edit Attributes</span>
          </button>
          <button
            onClick={() => {
              setActiveTool('transform_move');
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
          >
            <Move size={13} className="text-indigo-400" />
            <span>Move Feature</span>
          </button>
          <button
            onClick={() => {
              setActiveTool('transform_rotate');
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
          >
            <RotateCw size={13} className="text-purple-400" />
            <span>Rotate Feature</span>
          </button>
          <button
            onClick={() => {
              duplicateSelectedFeatures();
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
          >
            <Copy size={13} className="text-sky-400" />
            <span>Duplicate Feature</span>
          </button>
          <div className="my-1 border-t border-slate-800" />
          <button
            onClick={() => {
              deleteSelectedFeatures();
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-rose-950/80 text-rose-300 flex items-center gap-2"
          >
            <Trash2 size={13} />
            <span>Delete Feature</span>
          </button>
        </div>
      )}
    </div>
  );
};
