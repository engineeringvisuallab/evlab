import React, { useState, useEffect, useMemo } from 'react';
import { UELEViewMode, UELESystemCategoryMeta, UELELayer } from '../types/uele';
import { UELE_SYSTEM_CATEGORIES, DEFAULT_UELE_LAYERS } from '../data/uele-categories';
import { INITIAL_SHERPUR_GIS_DATASET, GISFeatureCollection, GISFeature } from '../data/sherpur-gis-data';
import { ImportGISResult } from '../utils/gisImporter';
import { loadCustomGISData, saveCustomGISLayer, deleteCustomGISLayer, clearAllCustomGISLayers } from '../utils/gisStorage';
import { UELEViewport } from '../components/uele/UELEViewport';
import { UELEInspectorShell } from '../components/uele/UELEInspectorShell';
import { UELELayersDrawer } from '../components/uele/UELELayersDrawer';
import { UELEImportModal } from '../components/uele/UELEImportModal';
import { navigate as goTo } from '../utils/router';
import { Container } from '../components/shared/Container';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { SectionHeader } from '../components/shared/SectionHeader';
import { Card } from '../components/shared/Card';
import {
  ArrowLeft,
  Map,
  Globe,
  Box,
  CheckCircle2,
  Sparkles,
  Upload,
  Database,
  ShieldCheck,
  Gamepad2,
} from 'lucide-react';

interface UELEPageProps {
  onNavigateHome: () => void;
  onNavigateToRoadmap: (roadmapId?: string) => void;
}

export const UELEPage: React.FC<UELEPageProps> = ({
  onNavigateHome,
  onNavigateToRoadmap,
}) => {
  const [viewMode, setViewMode] = useState<UELEViewMode>('2d');
  const [activeCategoryFocus, setActiveCategoryFocus] = useState<string | null>(null);
  const [activeBasemapId, setActiveBasemapId] = useState<string>('esri-satellite');
  const [layers, setLayers] = useState<UELELayer[]>(DEFAULT_UELE_LAYERS);
  const [gisDataset, setGisDataset] = useState<GISFeatureCollection>(INITIAL_SHERPUR_GIS_DATASET);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [isLayersDrawerOpen, setIsLayersDrawerOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [customLayersCount, setCustomLayersCount] = useState<number>(0);

  // Load saved custom GIS layers permanently from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    async function hydrateCustomGIS() {
      try {
        const stored = await loadCustomGISData();
        if (isMounted && stored.layers.length > 0) {
          setLayers((prev) => [...stored.layers, ...prev]);
          setGisDataset((prev) => ({
            ...prev,
            features: [...stored.features, ...prev.features],
          }));
          setCustomLayersCount(stored.layers.length);
        }
      } catch (err) {
        console.error('Error loading stored GIS layers:', err);
      }
    }
    hydrateCustomGIS();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state from URL hash query parameters (#uele?focus=smart-city&mode=3d)
  useEffect(() => {
    const parseHashParams = () => {
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const queryStr = hash.split('?')[1];
        const params = new URLSearchParams(queryStr);

        const focus = params.get('focus');
        if (focus) {
          setActiveCategoryFocus(focus);
        }

        const mode = params.get('mode');
        if (mode === '2d' || mode === '3d') {
          setViewMode(mode);
        }
      }
    };

    parseHashParams();
    window.addEventListener('hashchange', parseHashParams);
    return () => window.removeEventListener('hashchange', parseHashParams);
  }, []);

  // Category Meta object
  const selectedCategoryMeta = useMemo(() => {
    if (!activeCategoryFocus) return null;
    return (
      UELE_SYSTEM_CATEGORIES.find((cat) => cat.id === activeCategoryFocus) || null
    );
  }, [activeCategoryFocus]);

  // Selected GIS Feature object
  const selectedFeature = useMemo(() => {
    if (!selectedFeatureId) return null;
    return gisDataset.features.find((f) => f.id === selectedFeatureId) || null;
  }, [selectedFeatureId, gisDataset]);

  // Feature counts per layer calculation
  const featureCountsByLayer = useMemo(() => {
    const map: Record<string, number> = {};
    gisDataset.features.forEach((f) => {
      const lId = f.properties.layerId;
      map[lId] = (map[lId] || 0) + 1;
    });
    return map;
  }, [gisDataset]);

  // Layer Toggling Handlers
  const handleToggleLayer = (layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleResetLayers = () => {
    setLayers(DEFAULT_UELE_LAYERS);
  };

  const handleRemoveLayer = async (layerId: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== layerId));
    setGisDataset((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.properties.layerId !== layerId),
    }));
    if (selectedFeature?.properties.layerId === layerId) {
      setSelectedFeatureId(null);
    }
    setCustomLayersCount((prev) => Math.max(0, prev - 1));

    // Permanently remove from browser storage
    await deleteCustomGISLayer(layerId);
  };

  const handleImportSuccess = async (result: ImportGISResult) => {
    // Add new imported layer
    setLayers((prev) => [result.layer, ...prev]);

    // Append imported features to master GIS dataset
    setGisDataset((prev) => ({
      ...prev,
      features: [...result.featureCollection.features, ...prev.features],
    }));

    // Select the first imported feature
    if (result.featureCollection.features.length > 0) {
      setSelectedFeatureId(result.featureCollection.features[0].id);
    }

    setCustomLayersCount((prev) => prev + 1);

    // Save permanently in IndexedDB
    await saveCustomGISLayer(result.layer, result.featureCollection.features);
  };

  const handleResetView = () => {
    setViewMode('2d');
    setActiveCategoryFocus(null);
    setSelectedFeatureId(null);
    window.location.hash = '#uele';
  };

  const handleCategorySelect = (catId: string) => {
    if (activeCategoryFocus === catId) {
      setActiveCategoryFocus(null);
      window.location.hash = '#uele';
      // Reset layers visibility
      setLayers((prev) => prev.map((l) => ({ ...l, visible: true })));
    } else {
      setActiveCategoryFocus(catId);
      window.location.hash = `#uele?focus=${catId}`;
      // Filter layer visibility to match category
      setLayers((prev) =>
        prev.map((l) => ({
          ...l,
          visible: (l.category as string) === catId || (l.category as string) === 'administrative',
        }))
      );
    }
  };

  return (
    <Container size="xl" className="py-8 space-y-6">
      {/* 1. TOP NAVIGATION HEADER BAR */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={onNavigateHome}
        >
          Back to Master Homepage
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="#admin"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-200" />
            <span>Central EVLab Admin Panel</span>
          </a>

          <Button
            variant="cyan"
            size="sm"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => setIsImportModalOpen(true)}
          >
            Import GIS Data
          </Button>

          <Button
            variant="emerald"
            size="sm"
            leftIcon={<Gamepad2 className="w-4 h-4" />}
            onClick={() => goTo('/uele/play')}
          >
            Play UELE — The Engineering World
          </Button>

          <Button
            variant="roadmap"
            size="sm"
            leftIcon={<Map className="w-4 h-4" />}
            onClick={() => onNavigateToRoadmap()}
          >
            Switch to Career Roadmap
          </Button>

          <Badge variant="emerald" icon={<Globe className="w-3.5 h-3.5 text-emerald-400" />}>
            REAL GIS SMART COUNTRY MAP ACTIVE
          </Badge>

          {customLayersCount > 0 && (
            <Badge variant="purple" icon={<Database className="w-3.5 h-3.5 text-purple-400" />}>
              {customLayersCount} Global Saved Layer{customLayersCount > 1 ? 's' : ''} (Server Sync)
            </Badge>
          )}
        </div>
      </div>

      {/* 2. SECTION HEADER */}
      <SectionHeader
        badge="UELE Phase 02 — GIS Engineering Engine"
        badgeVariant="emerald"
        title="UELE — Real GIS Smart Country Map & Spatial Data Engine"
        description="Sherpur study area (Bogura, Bangladesh) with satellite basemaps, 2D/3D synchronized vector geometries, client-side Shapefile/GeoJSON importer & engineering inspector."
      />

      {/* 3. CATEGORY FOCUS SELECTOR PILLS */}
      <div className="space-y-2 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)] uppercase font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select System Category Focus ({UELE_SYSTEM_CATEGORIES.length})</span>
          </span>
          {activeCategoryFocus && (
            <button
              onClick={() => handleCategorySelect(activeCategoryFocus)}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {UELE_SYSTEM_CATEGORIES.map((cat) => {
            const isSelected = activeCategoryFocus === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md scale-105'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-cyan-500/50 hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{cat.title}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN WORKSPACE: VIEWPORT (LEFT 2 COLS) + INSPECTOR / LAYERS (RIGHT 1 COL) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left (2 Columns): Main Viewport Canvas (2D Plan & 3D View) */}
        <div className="lg:col-span-2 space-y-4">
          <UELEViewport
            viewMode={viewMode}
            onViewModeChange={(m) => {
              setViewMode(m);
              window.location.hash = `#uele?${activeCategoryFocus ? `focus=${activeCategoryFocus}&` : ''}mode=${m}`;
            }}
            selectedCategory={selectedCategoryMeta}
            features={gisDataset.features}
            layers={layers}
            selectedFeatureId={selectedFeatureId}
            onSelectFeature={(fId) => setSelectedFeatureId(fId)}
            activeBasemapId={activeBasemapId}
            onBasemapChange={(bmId) => setActiveBasemapId(bmId)}
            onToggleLayersDrawer={() => setIsLayersDrawerOpen((prev) => !prev)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onResetView={handleResetView}
          />
        </div>

        {/* Right (1 Column): Inspector Shell & Layers Panel Drawer */}
        <div className="lg:col-span-1 space-y-4 font-mono">
          {/* Layers Drawer Panel (if toggled open) */}
          {isLayersDrawerOpen && (
            <UELELayersDrawer
              layers={layers}
              onToggleLayer={handleToggleLayer}
              onResetLayers={handleResetLayers}
              onRemoveLayer={handleRemoveLayer}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onClose={() => setIsLayersDrawerOpen(false)}
              featureCountsByLayer={featureCountsByLayer}
            />
          )}

          {/* Reusable Right Information Panel Inspector Shell */}
          <UELEInspectorShell
            selectedFeature={selectedFeature}
            selectedCategory={selectedCategoryMeta}
            onNavigateToRoadmap={onNavigateToRoadmap}
            onClose={() => setSelectedFeatureId(null)}
          />

          {/* Category Summary Card (if a focus category is active) */}
          {selectedCategoryMeta && (
            <Card padding="md" className="space-y-3 bg-[var(--bg-elevated)]/40 border border-cyan-500/20">
              <div className="flex items-center space-x-2 border-b border-[var(--border-color)] pb-2">
                <Box className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase">
                  Category Focus Details
                </h4>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-cyan-400">{selectedCategoryMeta.title}</div>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {selectedCategoryMeta.shortDescription}
                </p>
                {selectedCategoryMeta.systems && (
                  <div className="pt-2 text-[11px] text-[var(--text-muted)]">
                    <span className="text-[var(--text-secondary)] font-bold">Key Subsystems:</span>{' '}
                    {selectedCategoryMeta.systems.join(', ')}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 5. GIS DATA IMPORT MODAL */}
      <UELEImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </Container>
  );
};
