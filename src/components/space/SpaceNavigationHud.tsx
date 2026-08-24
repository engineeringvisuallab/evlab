import React, { useState } from 'react';
import { PlanetData, SpaceViewMode, StudioKey } from '../../types/space';
import {
  Search,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  Grid,
  Sparkles,
  Eye,
  Radio,
  Compass,
  Layers,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  Globe2,
  Box,
  MapPin,
  Workflow,
} from 'lucide-react';

interface SpaceNavigationHudProps {
  planets: PlanetData[];
  selectedPlanet: PlanetData | null;
  viewMode: SpaceViewMode;
  isRotating: boolean;
  zoom: number;
  showGrid: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  onSelectPlanet: (planet: PlanetData | null) => void;
  onSetViewMode: (mode: SpaceViewMode) => void;
  onToggleRotation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSetZoom?: (zoom: number) => void;
  onResetView: () => void;
  onToggleGrid: () => void;
  onToggleOrbits: () => void;
  onToggleLabels: () => void;
  onOpenStudio?: (studioKey: StudioKey) => void;
}

export const SpaceNavigationHud: React.FC<SpaceNavigationHudProps> = ({
  planets,
  selectedPlanet,
  viewMode,
  isRotating,
  zoom,
  showGrid,
  showOrbits,
  showLabels,
  onSelectPlanet,
  onSetViewMode,
  onToggleRotation,
  onZoomIn,
  onZoomOut,
  onSetZoom,
  onResetView,
  onToggleGrid,
  onToggleOrbits,
  onToggleLabels,
  onOpenStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showZoomPresets, setShowZoomPresets] = useState(false);

  const zoomPercent = Math.round(zoom * 100);
  const zoomPresets = [0.5, 0.75, 1.0, 1.5, 2.0, 2.8];

  const filteredPlanets = planets.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.moons.some((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* ========================================================================= */}
      {/* TOP HEADER HUD                                                            */}
      {/* ========================================================================= */}
      <header className="flex items-center justify-between w-full">
        {/* Top-Left: EVLab Brand */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 shadow-xl">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Globe2 className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold tracking-tight text-sm text-white">EVLab</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Space
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">Engineering Universe</span>
            </div>
          </div>

          {/* Universe Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800/80 text-[10px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>12 PLANETS ACTIVE</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">J2000 / EPSG:3857</span>
          </div>
        </div>

        {/* Top-Center: SPACE Universe Focus Title */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div className="px-4 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800/90 shadow-xl flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-black tracking-widest text-white uppercase">
              {selectedPlanet ? `${selectedPlanet.name} SYSTEM` : 'EVLAB SPACE UNIVERSE'}
            </span>
            {selectedPlanet && (
              <button
                onClick={() => onSelectPlanet(null)}
                className="ml-1 text-[9px] font-mono text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700"
              >
                UNIVERSE VIEW
              </button>
            )}
          </div>
        </div>

        {/* Top-Right: Studios Portal & Search */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {onOpenStudio && (
            <div className="flex items-center bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl text-xs">
              <button
                onClick={() => onOpenStudio('bim')}
                className="px-2.5 py-1 rounded-lg text-blue-300 hover:text-white hover:bg-blue-600/30 border border-blue-500/30 bg-blue-950/30 font-semibold flex items-center gap-1.5 transition-all"
                title="Open BIM 3D Studio & Model Coordinator"
              >
                <Box className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">BIM Studio</span>
              </button>
              <button
                onClick={() => onOpenStudio('gis')}
                className="px-2.5 py-1 rounded-lg text-cyan-300 hover:text-white hover:bg-cyan-600/30 border border-cyan-500/30 bg-cyan-950/30 font-semibold flex items-center gap-1.5 transition-all"
                title="Open GIS Geospatial Coordinate Mapping"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">GIS Mapping</span>
              </button>
              <button
                onClick={() => onOpenStudio('proving_bench')}
                className="px-2.5 py-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/30 border border-purple-500/30 bg-purple-950/30 font-semibold flex items-center gap-1.5 transition-all"
                title="Open GIS ↔ CAD Proving Bench"
              >
                <Workflow className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">Proving Bench</span>
              </button>
              <button
                onClick={() => onOpenStudio('dashboard')}
                className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-semibold flex items-center gap-1.5 transition-all"
                title="Open EVLab Core Workspace"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">Core Workspace</span>
              </button>
            </div>
          )}

          {/* Search Button */}
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white shadow-xl transition-all"
              title="Search Planet or Software Moon"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Search Dropdown Modal */}
            {isSearchOpen && (
              <div className="absolute right-0 top-12 w-80 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search planet, domain, software moon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                  {filteredPlanets.map((planet) => (
                    <div
                      key={planet.id}
                      onClick={() => {
                        onSelectPlanet(planet);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="p-2 rounded-lg hover:bg-slate-900/90 cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-800 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{planet.name}</div>
                        <div className="text-[10px] text-slate-400">{planet.subtitle}</div>
                      </div>
                      <span className="text-[9px] font-mono text-cyan-400">
                        {planet.moons.length} Moons
                      </span>
                    </div>
                  ))}
                  {filteredPlanets.length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-500">
                      No engineering planet or tool found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* BOTTOM CONTROL DOCK                                                       */}
      {/* ========================================================================= */}
      <footer className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
        {/* Bottom-Left: ORBIT VIEW TOGGLES */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 shadow-xl">
          <button
            onClick={() => onSetViewMode('universe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
              viewMode === 'universe' && !selectedPlanet
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            ORBIT VIEW
          </button>
          <button
            onClick={onToggleOrbits}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              showOrbits ? 'text-cyan-400 bg-slate-900 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Orbital Trajectories"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleGrid}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              showGrid ? 'text-cyan-400 bg-slate-900 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Coordinate Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleLabels}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              showLabels ? 'text-cyan-400 bg-slate-900 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Holographic Labels"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom-Center: Planetary Quick-Jump Dock (12 Planets) */}
        <div className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 shadow-2xl overflow-x-auto max-w-[90vw] md:max-w-2xl custom-scrollbar">
          {planets.map((p) => {
            const isSelected = selectedPlanet?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPlanet(isSelected ? null : p)}
                className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all text-xs font-mono font-bold whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-800 text-white border shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
                style={{
                  borderColor: isSelected ? p.color.primary : 'transparent',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: p.color.primary }}
                />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom-Right: Zoom, Rotate & Camera View Controls */}
        <div className="pointer-events-auto relative flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-xl">
          {/* Rotation Toggle */}
          <button
            onClick={onToggleRotation}
            className={`p-2 rounded-lg text-xs transition-colors ${
              isRotating ? 'text-cyan-400 hover:text-cyan-300' : 'text-amber-400 hover:text-amber-300'
            }`}
            title={isRotating ? 'Pause Planetary Rotation [Space]' : 'Resume Planetary Rotation [Space]'}
          >
            {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <div className="w-[1px] h-4 bg-slate-800" />

          {/* Zoom Out Button */}
          <button
            onClick={onZoomOut}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            title="Zoom Out [- or Wheel Down]"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Inline Interactive Zoom Slider */}
          <div className="hidden sm:flex items-center px-1">
            <input
              type="range"
              min="0.2"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={(e) => onSetZoom?.(parseFloat(e.target.value))}
              className="w-16 md:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title={`Zoom Scale: ${zoomPercent}%`}
            />
          </div>

          {/* Zoom In Button */}
          <button
            onClick={onZoomIn}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            title="Zoom In [+ or Wheel Up]"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Percentage Pill & Preset Popover */}
          <div className="relative">
            <button
              onClick={() => setShowZoomPresets(!showZoomPresets)}
              className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors flex items-center gap-1"
              title="Click to Choose Zoom Preset"
            >
              <span>{zoomPercent}%</span>
            </button>

            {showZoomPresets && (
              <div className="absolute bottom-11 right-0 w-28 p-1.5 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-0.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850">
                  Scale Presets
                </div>
                {zoomPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      onSetZoom?.(preset);
                      setShowZoomPresets(false);
                    }}
                    className={`w-full px-2 py-1 text-left text-xs font-mono rounded-lg transition-colors flex items-center justify-between ${
                      Math.abs(zoom - preset) < 0.05
                        ? 'bg-cyan-950/60 text-cyan-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span>{Math.round(preset * 100)}%</span>
                    {preset === 1.0 && <span className="text-[9px] text-slate-500 font-sans">Default</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-[1px] h-4 bg-slate-800" />

          {/* Reset Universe Camera */}
          <button
            onClick={onResetView}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            title="Reset Universe View & Camera [0]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
