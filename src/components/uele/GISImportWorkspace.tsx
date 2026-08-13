import React, { useState, useEffect, useMemo } from 'react'
import { UELEViewMode, UELESystemCategoryMeta, UELELayer } from '@/types/adminUele'
import { UELE_SYSTEM_CATEGORIES, DEFAULT_UELE_LAYERS } from '@/data/uele-categories'
import {
  INITIAL_SHERPUR_GIS_DATASET,
  GISFeatureCollection,
} from '@/data/sherpur-gis-data'
import { ImportGISResult } from '@/utils/gisImporter'
import {
  loadCustomGISData,
  saveCustomGISLayer,
  deleteCustomGISLayer,
} from '@/utils/gisStorage'
import { UELEViewport } from '@/components/uele/UELEViewport'
import { UELEInspectorShell } from '@/components/uele/UELEInspectorShell'
import { UELELayersDrawer } from '@/components/uele/UELELayersDrawer'
import { UELEImportModal } from '@/components/uele/UELEImportModal'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { Box, CheckCircle2, Database, Sparkles, Upload } from 'lucide-react'

export interface GISImportWorkspaceProps {
  onNavigateToRoadmap: (roadmapId?: string) => void
}

/**
 * Live GIS import + 2D/3D spatial data workspace.
 *
 * Ported from the Engineering Visual Lab "Phase 02" branch: lets a visitor
 * import their own Shapefile/GeoJSON layers on top of a satellite basemap,
 * inspect them in synchronized 2D/3D views, and toggle by engineering
 * system category. Layers persist via `gisStorage` (server API when the
 * optional admin server is running, IndexedDB/localStorage otherwise), so
 * this works standalone even without `npm run dev:admin`.
 */
export const GISImportWorkspace: React.FC<GISImportWorkspaceProps> = ({
  onNavigateToRoadmap,
}) => {
  const [viewMode, setViewMode] = useState<UELEViewMode>('2d')
  const [activeCategoryFocus, setActiveCategoryFocus] = useState<string | null>(null)
  const [activeBasemapId, setActiveBasemapId] = useState<string>('esri-satellite')
  const [layers, setLayers] = useState<UELELayer[]>(DEFAULT_UELE_LAYERS)
  const [gisDataset, setGisDataset] = useState<GISFeatureCollection>(
    INITIAL_SHERPUR_GIS_DATASET
  )
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)
  const [isLayersDrawerOpen, setIsLayersDrawerOpen] = useState<boolean>(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)
  const [customLayersCount, setCustomLayersCount] = useState<number>(0)

  // Load any previously imported/saved layers on mount.
  useEffect(() => {
    let isMounted = true
    async function hydrateCustomGIS() {
      try {
        const stored = await loadCustomGISData()
        if (isMounted && stored.layers.length > 0) {
          setLayers((prev) => [...stored.layers, ...prev])
          setGisDataset((prev) => ({
            ...prev,
            features: [...stored.features, ...prev.features],
          }))
          setCustomLayersCount(stored.layers.length)
        }
      } catch (err) {
        console.error('Error loading stored GIS layers:', err)
      }
    }
    hydrateCustomGIS()
    return () => {
      isMounted = false
    }
  }, [])

  const selectedCategoryMeta = useMemo(() => {
    if (!activeCategoryFocus) return null
    return UELE_SYSTEM_CATEGORIES.find((cat) => cat.id === activeCategoryFocus) || null
  }, [activeCategoryFocus])

  const selectedFeature = useMemo(() => {
    if (!selectedFeatureId) return null
    return gisDataset.features.find((f) => f.id === selectedFeatureId) || null
  }, [selectedFeatureId, gisDataset])

  const featureCountsByLayer = useMemo(() => {
    const map: Record<string, number> = {}
    gisDataset.features.forEach((f) => {
      const lId = f.properties.layerId
      map[lId] = (map[lId] || 0) + 1
    })
    return map
  }, [gisDataset])

  const handleToggleLayer = (layerId: string) => {
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)))
  }

  const handleResetLayers = () => setLayers(DEFAULT_UELE_LAYERS)

  const handleRemoveLayer = async (layerId: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== layerId))
    setGisDataset((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.properties.layerId !== layerId),
    }))
    if (selectedFeature?.properties.layerId === layerId) {
      setSelectedFeatureId(null)
    }
    setCustomLayersCount((prev) => Math.max(0, prev - 1))
    await deleteCustomGISLayer(layerId)
  }

  const handleImportSuccess = async (result: ImportGISResult) => {
    setLayers((prev) => [result.layer, ...prev])
    setGisDataset((prev) => ({
      ...prev,
      features: [...result.featureCollection.features, ...prev.features],
    }))
    if (result.featureCollection.features.length > 0) {
      setSelectedFeatureId(result.featureCollection.features[0].id)
    }
    setCustomLayersCount((prev) => prev + 1)
    await saveCustomGISLayer(result.layer, result.featureCollection.features)
  }

  const handleResetView = () => {
    setViewMode('2d')
    setActiveCategoryFocus(null)
    setSelectedFeatureId(null)
  }

  const handleCategorySelect = (catId: string) => {
    if (activeCategoryFocus === catId) {
      setActiveCategoryFocus(null)
      setLayers((prev) => prev.map((l) => ({ ...l, visible: true })))
    } else {
      setActiveCategoryFocus(catId)
      setLayers((prev) =>
        prev.map((l) => ({
          ...l,
          visible: (l.category as string) === catId || (l.category as string) === 'administrative',
        }))
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="cyan"
            size="sm"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => setIsImportModalOpen(true)}
          >
            Import GIS Data
          </Button>
          {customLayersCount > 0 && (
            <Badge variant="purple" icon={<Database className="w-3.5 h-3.5" />}>
              {customLayersCount} imported layer{customLayersCount > 1 ? 's' : ''} saved
            </Badge>
          )}
        </div>
      </div>

      {/* Category focus pills */}
      <div className="space-y-2 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)] uppercase font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>System Category Focus ({UELE_SYSTEM_CATEGORIES.length})</span>
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
            const isSelected = activeCategoryFocus === cat.id
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
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <UELEViewport
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedCategory={selectedCategoryMeta}
            features={gisDataset.features}
            layers={layers}
            selectedFeatureId={selectedFeatureId}
            onSelectFeature={setSelectedFeatureId}
            activeBasemapId={activeBasemapId}
            onBasemapChange={setActiveBasemapId}
            onToggleLayersDrawer={() => setIsLayersDrawerOpen((prev) => !prev)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onResetView={handleResetView}
          />
        </div>

        <div className="lg:col-span-1 space-y-4 font-mono">
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

          <UELEInspectorShell
            selectedFeature={selectedFeature}
            selectedCategory={selectedCategoryMeta}
            onNavigateToRoadmap={onNavigateToRoadmap}
            onClose={() => setSelectedFeatureId(null)}
          />

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

      <UELEImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  )
}
