import React, { useState, useCallback } from 'react';
import { EVLAB_PLANETS, EVLAB_CORE_DATA } from '../../data/spaceData';
import { PlanetData, SoftwareMoon, SpaceViewMode, StudioKey } from '../../types/space';
import { SpaceUniverseCanvas } from './SpaceUniverseCanvas';
import { SpaceNavigationHud } from './SpaceNavigationHud';
import { PlanetaryDetailPanel } from './PlanetaryDetailPanel';
import { Modal } from '../common/Modal';
import { Sparkles, ArrowRight, ExternalLink, ShieldCheck, CheckCircle2, Box, MapPin, Workflow, Layers } from 'lucide-react';

interface SpaceMainViewProps {
  onOpenStudio?: (studioKey: StudioKey) => void;
}

// Maps a Space Universe planet directly to the matching, already-built
// EVLab sibling application (EV Software Core). Planets without a
// one-to-one existing tool (structure, simulation, materials, ai) fall
// back to the generic "Launch Studio Workspace" confirmation modal below.
const PLANET_TO_STUDIO_KEY: Partial<Record<PlanetData['id'], StudioKey>> = {
  bim: 'bim',
  gis: 'gis',
  cad: 'cad',
  water: 'wtp',
  sewer: 'stp',
  hydraulics: 'waterflow',
  projects: 'planner',
  uele: 'uele',
};

export const SpaceMainView: React.FC<SpaceMainViewProps> = ({ onOpenStudio }) => {
  const [planets] = useState<PlanetData[]>(EVLAB_PLANETS);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [selectedMoon, setSelectedMoon] = useState<SoftwareMoon | null>(null);

  // Viewport & HUD State
  const [viewMode, setViewMode] = useState<SpaceViewMode>('universe');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Studio Launch Confirmation Modal
  const [launchModalPlanet, setLaunchModalPlanet] = useState<PlanetData | null>(null);

  const handleSelectPlanet = useCallback((planet: PlanetData | null) => {
    setSelectedPlanet(planet);
    setSelectedMoon(null);
    if (planet) {
      setViewMode('planet_focus');
      // Gentle cinematic zoom in to the selected planet
      setZoom((prev) => (prev < 1.2 ? 1.4 : prev));
    } else {
      setViewMode('universe');
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(Number((prev + 0.2).toFixed(2)), 3.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(Number((prev - 0.2).toFixed(2)), 0.2));
  }, []);

  const handleSetZoom = useCallback((newZoom: number) => {
    setZoom(Math.min(Math.max(Number(newZoom.toFixed(2)), 0.2), 3.5));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1.0);
    setSelectedPlanet(null);
    setSelectedMoon(null);
    setViewMode('universe');
  }, []);

  // Global Keyboard shortcuts (+, -, 0, Space, Escape)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleSetZoom(1.0);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsRotating((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (selectedPlanet) {
          handleSelectPlanet(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleSetZoom, handleSelectPlanet, selectedPlanet]);

  const handleEnterStudio = useCallback(
    (planet: PlanetData) => {
      const studioKey = PLANET_TO_STUDIO_KEY[planet.id];
      if (studioKey && onOpenStudio) {
        onOpenStudio(studioKey);
        return;
      }
      // No directly matching sibling application for this planet yet —
      // show the confirmation modal with a link into the general workspace.
      setLaunchModalPlanet(planet);
    },
    [onOpenStudio]
  );

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* 1. Master High-Graphics SVG Space Universe Canvas */}
      <SpaceUniverseCanvas
        planets={planets}
        selectedPlanet={selectedPlanet}
        selectedMoon={selectedMoon}
        viewMode={viewMode}
        isRotating={isRotating}
        zoom={zoom}
        showGrid={showGrid}
        showOrbits={showOrbits}
        showLabels={showLabels}
        onSelectPlanet={handleSelectPlanet}
        onSelectMoon={setSelectedMoon}
        onZoomChange={handleSetZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
      />

      {/* 2. Scientific Space Navigation HUD */}
      <SpaceNavigationHud
        planets={planets}
        selectedPlanet={selectedPlanet}
        viewMode={viewMode}
        isRotating={isRotating}
        zoom={zoom}
        showGrid={showGrid}
        showOrbits={showOrbits}
        showLabels={showLabels}
        onSelectPlanet={handleSelectPlanet}
        onSetViewMode={setViewMode}
        onToggleRotation={() => setIsRotating((prev) => !prev)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onSetZoom={handleSetZoom}
        onResetView={handleResetView}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
        onToggleOrbits={() => setShowOrbits((prev) => !prev)}
        onToggleLabels={() => setShowLabels((prev) => !prev)}
        onOpenStudio={onOpenStudio}
      />

      {/* 3. Right-Side Planetary Detail & Software Moon Drawer */}
      {selectedPlanet && (
        <PlanetaryDetailPanel
          planet={selectedPlanet}
          selectedMoon={selectedMoon}
          onSelectMoon={setSelectedMoon}
          onClose={() => handleSelectPlanet(null)}
          onEnterStudio={handleEnterStudio}
        />
      )}

      {/* 4. Studio Launch Notification Dialog */}
      {launchModalPlanet && (
        <Modal
          isOpen={true}
          onClose={() => setLaunchModalPlanet(null)}
          title={`EVLab ${launchModalPlanet.name} Studio`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: launchModalPlanet.color.primary }}
                />
                <h4 className="text-sm font-bold text-white">
                  {launchModalPlanet.subtitle}
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                {launchModalPlanet.description}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modular Sibling Space Slot Ready</span>
              </div>
              <p className="text-[11px] text-slate-400">
                This planetary domain contains <strong className="text-white">{launchModalPlanet.moons.length} software moons</strong>. You can launch into the specialized engineering workspace or explore sibling modules in the ecosystem.
              </p>
            </div>

            <div className="flex justify-between items-center gap-2 pt-2">
              <button
                onClick={() => setLaunchModalPlanet(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
              {onOpenStudio && (
                <button
                  onClick={() => {
                    const studioKey = PLANET_TO_STUDIO_KEY[launchModalPlanet.id];
                    setLaunchModalPlanet(null);
                    onOpenStudio(studioKey ?? 'proving_bench');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
                >
                  <span>Launch Studio Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
