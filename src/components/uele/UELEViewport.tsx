import React from 'react';
import { Map, Compass, Layers, RotateCcw, Box, Upload } from 'lucide-react';
import { UELEViewMode, UELESystemCategoryMeta, UELELayer } from '../../types/adminUele';
import { GISFeature } from '../../data/sherpur-gis-data';
import { UELE2DMap } from './UELE2DMap';
import { UELE3DView } from './UELE3DView';
import { UELEMapSearch } from './UELEMapSearch';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';

export interface UELEViewportProps {
  viewMode: UELEViewMode;
  onViewModeChange: (mode: UELEViewMode) => void;
  selectedCategory: UELESystemCategoryMeta | null;
  features: GISFeature[];
  layers: UELELayer[];
  selectedFeatureId: string | null;
  onSelectFeature: (featureId: string) => void;
  activeBasemapId: string;
  onBasemapChange: (basemapId: string) => void;
  onToggleLayersDrawer: () => void;
  onOpenImportModal: () => void;
  onResetView: () => void;
}

export const UELEViewport: React.FC<UELEViewportProps> = ({
  viewMode,
  onViewModeChange,
  selectedCategory,
  features,
  layers,
  selectedFeatureId,
  onSelectFeature,
  activeBasemapId,
  onBasemapChange,
  onToggleLayersDrawer,
  onOpenImportModal,
  onResetView,
}) => {
  const activeLayersCount = layers.filter((l) => l.visible).length;

  return (
    <div className="w-full h-[540px] sm:h-[620px] rounded-3xl bg-slate-950 border border-emerald-500/30 relative overflow-hidden flex flex-col justify-between shadow-2xl font-mono">
      {/* 1. TOP HUD CONTROLS BAR */}
      <div className="p-3 sm:p-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-20 flex items-center justify-between flex-wrap gap-2">
        {/* Left: View Mode Toggle (2D / 3D) */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => onViewModeChange('2d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              viewMode === '2d'
                ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>2D GIS MAP</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('3d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              viewMode === '3d'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3D ORBIT VIEW</span>
          </button>
        </div>

        {/* Center: Search Field */}
        <div className="flex-1 max-w-xs md:max-w-sm">
          <UELEMapSearch
            features={features}
            onSelectFeature={onSelectFeature}
            selectedFeatureId={selectedFeatureId}
          />
        </div>

        {/* Right Controls: Import, Layers, Reset View */}
        <div className="flex items-center space-x-2">
          {selectedCategory && (
            <Badge variant="emerald" icon={<Box className="w-3 h-3 text-emerald-400" />}>
              {selectedCategory.title}
            </Badge>
          )}

          <Button
            variant="cyan"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            onClick={onOpenImportModal}
          >
            Import GIS
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Layers className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={onToggleLayersDrawer}
          >
            Layers ({activeLayersCount})
          </Button>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={onResetView}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* 2. MAIN VIEWPORT CANVAS AREA */}
      <div className="relative flex-1 w-full h-full bg-slate-950 overflow-hidden">
        {viewMode === '2d' ? (
          <UELE2DMap
            features={features}
            layers={layers}
            selectedFeatureId={selectedFeatureId}
            onSelectFeature={onSelectFeature}
            activeBasemapId={activeBasemapId}
            onBasemapChange={onBasemapChange}
            onOpenImportModal={onOpenImportModal}
            onResetView={onResetView}
          />
        ) : (
          <UELE3DView
            features={features}
            layers={layers}
            selectedFeatureId={selectedFeatureId}
            onSelectFeature={onSelectFeature}
            onResetView={onResetView}
          />
        )}
      </div>

      {/* 3. BOTTOM FOOTER STATUS BAR */}
      <div className="p-2.5 sm:p-3 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2 z-20">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-200 font-bold">SHERPUR SMART COUNTRY GIS ENGINE</span>
          <span>•</span>
          <span className="text-slate-400">Mode: {viewMode === '2d' ? '2D GIS Satellite Map' : '3D Orbit View'}</span>
        </div>

        <div className="flex items-center space-x-3">
          <span>Loaded Features: {features.length}</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">1:1 Geographic Alignment (EPSG:4326)</span>
        </div>
      </div>
    </div>
  );
};
