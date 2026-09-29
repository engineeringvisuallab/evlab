import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PlanetData, SoftwareMoon as SoftwareMoonType, SpaceViewMode } from '../../types/space';
import { SpaceSvgDefs } from './SpaceSvgDefs';
import { SpaceBackground } from './SpaceBackground';
import { EvlabCore } from './EvlabCore';
import { PlanetBody } from './PlanetBody';
import { SoftwareMoon } from './SoftwareMoon';
import { SpaceCosmicAssets } from './SpaceCosmicAssets';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface SpaceUniverseCanvasProps {
  planets: PlanetData[];
  selectedPlanet: PlanetData | null;
  selectedMoon: SoftwareMoonType | null;
  viewMode: SpaceViewMode;
  isRotating: boolean;
  zoom: number;
  showGrid: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  onSelectPlanet: (planet: PlanetData | null) => void;
  onSelectMoon: (moon: SoftwareMoonType | null) => void;
  onZoomChange?: (newZoom: number) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
}

// Calculate coordinates for a planet at given orbital time
export const calculatePlanetCoords = (planet: PlanetData, time: number) => {
  const { radiusX, radiusY, speed, baseAngle, inclination } = planet.orbit;
  const angleDeg = (baseAngle + (time / speed) * 360) % 360;
  const rad = (angleDeg * Math.PI) / 180;
  const inclRad = (inclination * Math.PI) / 180;

  // Elliptical coordinate calculation with inclination rotation
  const rawX = Math.cos(rad) * radiusX;
  const rawY = Math.sin(rad) * radiusY;

  // Apply inclination rotation
  const x = rawX * Math.cos(inclRad) - rawY * Math.sin(inclRad);
  const y = rawX * Math.sin(inclRad) + rawY * Math.cos(inclRad);

  return { x, y, angleDeg };
};

export const SpaceUniverseCanvas: React.FC<SpaceUniverseCanvasProps> = ({
  planets,
  selectedPlanet,
  selectedMoon,
  viewMode,
  isRotating,
  zoom,
  showGrid,
  showOrbits,
  showLabels,
  onSelectPlanet,
  onSelectMoon,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onResetView,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Universe Pan Offset (Screen Dragging)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  // Pending pointer-down info, kept until the pointer either moves past the
  // click/drag threshold (below) or is released. Pointer capture is only
  // engaged once real dragging starts, so a simple click on a planet still
  // fires its native `click` event instead of being swallowed by the pan
  // gesture's capture.
  const pointerDownRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const CLICK_DRAG_THRESHOLD_PX = 4;

  // Touch zoom distance ref
  const touchDistRef = useRef<number | null>(null);

  // Hover state
  const [hoveredPlanetId, setHoveredPlanetId] = useState<PlanetData['id'] | null>(null);
  const [hoveredMoonId, setHoveredMoonId] = useState<string | null>(null);

  // Real-time animation orbital timestamp (in seconds)
  const [orbitalTime, setOrbitalTime] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Keep panRef in sync
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  // Continuous animation loop for orbital motion
  useEffect(() => {
    lastTimeRef.current = performance.now();
    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isRotating) {
        setOrbitalTime((prev) => prev + delta);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRotating]);

  // High-precision smooth wheel listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!onZoomChange) return;

      // Smooth, proportional continuous scaling
      const delta = -e.deltaY;
      const zoomFactor = delta > 0 ? 1 + Math.min(delta * 0.0015, 0.25) : 1 / (1 + Math.min(Math.abs(delta) * 0.0015, 0.25));
      const nextZoom = Math.min(Math.max(zoom * zoomFactor, 0.2), 3.5);
      
      onZoomChange(nextZoom);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, onZoomChange]);

  // Ultra-Smooth Pointer Events (Mouse & Touch unified)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button
    if (e.button !== 0) return;
    
    // Don't drag if clicking buttons or specific interactive UI
    if ((e.target as HTMLElement).closest('button')) return;

    // Defer starting the drag (and pointer capture) until the pointer has
    // actually moved past a small threshold — see handlePointerMove. This
    // keeps a plain click on a planet/moon working as a normal click.
    pointerDownRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current) return;

    if (!isDraggingRef.current) {
      const totalDx = e.clientX - pointerDownRef.current.x;
      const totalDy = e.clientY - pointerDownRef.current.y;
      if (Math.hypot(totalDx, totalDy) < CLICK_DRAG_THRESHOLD_PX) {
        // Still within click tolerance — don't start panning/capturing yet.
        return;
      }

      isDraggingRef.current = true;
      setIsDragging(true);
      try {
        e.currentTarget.setPointerCapture(pointerDownRef.current.pointerId);
      } catch {
        // Ignore if pointer capture fails
      }
    }

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    setPan((prev) => {
      const updated = { x: prev.x + dx, y: prev.y + dy };
      panRef.current = updated;
      return updated;
    });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Multi-touch gestures (Pinch to zoom & pan)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      isDraggingRef.current = false;
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchDistRef.current && onZoomChange) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = dist / touchDistRef.current;
      if (Math.abs(scale - 1) > 0.008) {
        onZoomChange(Math.min(Math.max(zoom * scale, 0.2), 3.5));
        touchDistRef.current = dist;
      }
    }
  };

  const handleTouchEnd = () => {
    touchDistRef.current = null;
  };

  // Double click canvas to quick reset/zoom
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'DIV') {
      if (zoom > 1.2) {
        onResetView?.();
      } else {
        onZoomIn?.();
      }
    }
  }, [zoom, onResetView, onZoomIn]);

  // Center camera when a planet is selected or reset
  const selectedPlanetId = selectedPlanet?.id;
  useEffect(() => {
    if (selectedPlanet) {
      const coords = calculatePlanetCoords(selectedPlanet, orbitalTime);
      setPan({ x: -coords.x * 0.6, y: -coords.y * 0.6 });
    } else {
      setPan({ x: 0, y: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanetId]);

  // Sort planets by Y/depth coordinate for realistic depth pass
  const sortedPlanets = useMemo(() => {
    return planets.map((p) => {
      const coords = calculatePlanetCoords(p, orbitalTime);
      return { planet: p, ...coords };
    });
  }, [planets, orbitalTime]);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none bg-slate-950 touch-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      <SpaceSvgDefs />

      {/* Floating Canvas Quick-Zoom & Scale Telemetry Pill (Top-Left) */}
      <div className="absolute top-20 left-6 z-20 pointer-events-auto flex items-center gap-1 p-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-2xl">
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Zoom Out [-]"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onResetView}
          className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors"
          title="Click to Reset Zoom [0]"
        >
          {zoomPercent}%
        </button>
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Zoom In [+]"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      <svg
        className="w-full h-full block"
        viewBox="-1600 -1000 3200 2000"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Master Camera Transformation Group (Direct instantaneous 60fps tracking) */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ willChange: 'transform' }}
        >
          {/* 1. Deep Space Vector Background (Stars, Nebulas, Grids) */}
          <SpaceBackground showGrid={showGrid} showStarfield={true} />

          {/* 2. Orbital Trajectory Lines for all 12 Planets */}
          {showOrbits && (
            <g className="orbital-trajectories pointer-events-none">
              {planets.map((p) => {
                const { radiusX, radiusY, inclination } = p.orbit;
                const isPlanetActive = selectedPlanet?.id === p.id || hoveredPlanetId === p.id;
                return (
                  <g key={`orbit-path-${p.id}`} transform={`rotate(${inclination})`}>
                    <ellipse
                      cx="0"
                      cy="0"
                      rx={radiusX}
                      ry={radiusY}
                      fill="none"
                      stroke={p.color.primary}
                      strokeWidth={isPlanetActive ? 1.5 : 0.75}
                      strokeDasharray={isPlanetActive ? '8, 4' : '4, 8'}
                      opacity={isPlanetActive ? 0.8 : 0.35}
                      filter={isPlanetActive ? 'url(#orbit-glow)' : undefined}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* 3. Background Planet Tier (Y < -50) */}
          <g className="planets-background-tier">
            {sortedPlanets
              .filter((item) => item.y < -50)
              .map(({ planet, x, y }) => (
                <PlanetBody
                  key={`planet-bg-${planet.id}`}
                  planet={planet}
                  x={x}
                  y={y}
                  isHovered={hoveredPlanetId === planet.id}
                  isSelected={selectedPlanet?.id === planet.id}
                  isDimmed={!!selectedPlanet && selectedPlanet.id !== planet.id}
                  showLabels={showLabels}
                  onHover={setHoveredPlanetId}
                  onClick={onSelectPlanet}
                />
              ))}
          </g>

          {/* 4. Central EVLAB CORE Nucleus (0, 0) */}
          <EvlabCore
            isRotating={isRotating}
            onClick={() => onSelectPlanet(null)}
          />

          {/* 5. Foreground Planet Tier (Y >= -50) */}
          <g className="planets-foreground-tier">
            {sortedPlanets
              .filter((item) => item.y >= -50)
              .map(({ planet, x, y }) => (
                <PlanetBody
                  key={`planet-fg-${planet.id}`}
                  planet={planet}
                  x={x}
                  y={y}
                  isHovered={hoveredPlanetId === planet.id}
                  isSelected={selectedPlanet?.id === planet.id}
                  isDimmed={!!selectedPlanet && selectedPlanet.id !== planet.id}
                  showLabels={showLabels}
                  onHover={setHoveredPlanetId}
                  onClick={onSelectPlanet}
                />
              ))}
          </g>

          {/* 6. Dynamic Satellites, Space Stations, Rockets & Cosmic Elements Layer */}
          <SpaceCosmicAssets orbitalTime={orbitalTime} isRotating={isRotating} />

          {/* 7. Active Focal/Hovered Planet Software Moons System */}
          {(() => {
            const activePlanet = selectedPlanet || (hoveredPlanetId ? planets.find((p) => p.id === hoveredPlanetId) : null);
            if (!activePlanet) return null;

            const coords = calculatePlanetCoords(activePlanet, orbitalTime);
            const isFocal = selectedPlanet?.id === activePlanet.id;

            return (
              <g
                className="selected-planet-moons-system"
                transform={`translate(${coords.x}, ${coords.y})`}
              >
                {/* Software Moons Orbit Lines */}
                {activePlanet.moons.map((moon) => (
                  <circle
                    key={`moon-orbit-${moon.id}`}
                    cx="0"
                    cy="0"
                    r={moon.orbitDistance}
                    fill="none"
                    stroke={activePlanet.color.accent}
                    strokeWidth={isFocal ? "1.2" : "0.8"}
                    strokeDasharray="3, 6"
                    opacity={isFocal ? 0.65 : 0.4}
                  />
                ))}

                {/* Orbiting Software Moons with High-Legibility HUD Tags */}
                {activePlanet.moons.map((moon) => {
                  const currentAngle = (moon.orbitAngle + (orbitalTime / moon.orbitSpeed) * 360) % 360;
                  return (
                    <SoftwareMoon
                      key={moon.id}
                      moon={moon}
                      planetColor={activePlanet.color.primary}
                      planetGlow={activePlanet.color.glow}
                      planetAccent={activePlanet.color.accent}
                      isSelected={selectedMoon?.id === moon.id}
                      isHovered={hoveredMoonId === moon.id}
                      angle={currentAngle}
                      distance={moon.orbitDistance}
                      onClick={onSelectMoon}
                      onHover={setHoveredMoonId}
                    />
                  );
                })}
              </g>
            );
          })()}
        </g>
      </svg>
    </div>
  );
};
