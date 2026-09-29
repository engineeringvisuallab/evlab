import * as THREE from 'three';
import React, { useState } from 'react';
import {
  Car,
  Compass,
  Sun,
  Moon,
  CloudRain,
  CloudLightning,
  Cloud,
  Sunrise,
  Volume2,
  VolumeX,
  Camera,
  RotateCcw,
  Sparkles,
  Navigation,
  Eye,
  Layers,
  HelpCircle,
  Footprints,
  Lightbulb,
  Radio,
  Video,
  Play,
  Gauge,
} from 'lucide-react';
import { TimeOfDay, WeatherType } from '../../types/game';
import { VehicleTypeId, VEHICLE_CATALOG, VehiclePhysicsState } from '../../utils/vehicleController';
import { LandmarkZone, COUNTRY_LANDMARKS } from '../../utils/miniCountryTerrain';
import { ZONE_BOUNDARIES } from '../../utils/siteBoundariesSystem';
import { RAILWAY_MAIN_LOOP_NODES } from '../../utils/mapWideRailwaySystem';
import { CINEMATIC_TOUR_PRESETS } from '../../utils/environmentalEffects';
import { HelicopterFlightInfo } from '../../utils/helicopterTransit';

interface GameHUDProps {
  isDriving: boolean;
  onToggleDriveMode: () => void;
  canEnterVehicle: boolean;
  vehicleType: VehicleTypeId;
  onSelectVehicleType: (type: VehicleTypeId) => void;
  vehicleState: VehiclePhysicsState | null;
  onHonk: () => void;
  onToggleHeadlights: () => void;
  onResetVehicle: () => void;
  cameraView: 'chase' | 'hood' | 'orbit' | 'drone' | 'walk';
  onChangeCameraView: (cam: 'chase' | 'hood' | 'orbit' | 'drone' | 'walk') => void;
  timeOfDay: TimeOfDay;
  onSetTimeOfDay: (t: TimeOfDay) => void;
  weather: WeatherType;
  onSetWeather: (w: WeatherType) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentLandmark: LandmarkZone | null;
  playerPosition: [number, number]; // [x, z]
  onTeleportToLandmark?: (lm: LandmarkZone | [number, number]) => void;
  helicopterFlightInfo?: HelicopterFlightInfo | null;
  onStartHelicopterTour?: (target: [number, number], destinationName: string) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  isDriving,
  onToggleDriveMode,
  canEnterVehicle,
  vehicleType,
  onSelectVehicleType,
  vehicleState,
  onHonk,
  onToggleHeadlights,
  onResetVehicle,
  cameraView,
  onChangeCameraView,
  timeOfDay,
  onSetTimeOfDay,
  weather,
  onSetWeather,
  isMuted,
  onToggleMute,
  currentLandmark,
  playerPosition,
  onTeleportToLandmark,
  helicopterFlightInfo,
  onStartHelicopterTour,
}) => {
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [showVehiclesModal, setShowVehiclesModal] = useState(false);
  const [showCinematicModal, setShowCinematicModal] = useState(false);
  const [radarZoom, setRadarZoom] = useState<'local' | 'country'>('country');
  const [teleportToast, setTeleportToast] = useState<{ x: number; z: number } | null>(null);

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    let targetX: number;
    let targetZ: number;

    if (radarZoom === 'country') {
      // 10 km scale: X: -5000 to +5000, Z: -5000 to +5000
      targetX = -5000 + normX * 10000;
      targetZ = -5000 + normY * 10000;
    } else {
      // Local 800m scale: X: -400 to +400, Z: -400 to +400
      targetX = -400 + normX * 800;
      targetZ = -400 + normY * 800;
    }

    targetX = Math.round(Math.max(-4850, Math.min(4850, targetX)));
    targetZ = Math.round(Math.max(-4850, Math.min(4850, targetZ)));

    if (onTeleportToLandmark) {
      onTeleportToLandmark([targetX, targetZ]);
      setTeleportToast({ x: targetX, z: targetZ });
      setTimeout(() => {
        setTeleportToast(null);
      }, 2500);
    }
  };

  const speedKmh = vehicleState ? vehicleState.speedKmh : 0;
  const rpm = vehicleState ? vehicleState.rpm : 0;
  const gear = vehicleState ? vehicleState.gear : 'P';
  const headlightsOn = vehicleState ? vehicleState.headlightsOn : false;

  const currentVehicleDef = VEHICLE_CATALOG.find((v) => v.id === vehicleType) || VEHICLE_CATALOG[0];

  return (
    <div id="uele-game-hud" className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 md:p-5 select-none overflow-hidden font-sans">
      {/* 1. TOP BAR: Title, Active Landmark, Camera, Time/Weather & Audio */}
      <header className="pointer-events-auto flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2.5 shadow-2xl text-white">
        {/* Left: Brand Identity & Location */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-300/40">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">
                UELE: 10 KM × 10 KM COUNTRY
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>100 km² Area</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
              <span>{currentLandmark ? `${currentLandmark.icon} ${currentLandmark.name}` : '🗺️ 10km National Infrastructure Corridor'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-medium">X: {Math.round(playerPosition[0])}m, Z: {Math.round(playerPosition[1])}m</span>
            </p>
          </div>
        </div>

        {/* Center: Camera Switcher */}
        <div className="hidden lg:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 gap-1 text-xs">
          <button
            id="btn-cam-chase"
            onClick={() => onChangeCameraView(isDriving ? 'chase' : 'walk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              cameraView === 'chase' || cameraView === 'walk'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isDriving ? <Car className="w-3.5 h-3.5" /> : <Footprints className="w-3.5 h-3.5" />}
            <span>{isDriving ? 'Chase Cam' : 'Follow Cam'}</span>
          </button>

          {isDriving && (
            <button
              id="btn-cam-hood"
              onClick={() => onChangeCameraView('hood')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                cameraView === 'hood'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Hood View</span>
            </button>
          )}

          <button
            id="btn-cam-drone"
            onClick={() => onChangeCameraView('drone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              cameraView === 'drone'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Drone View</span>
          </button>

          <button
            id="btn-cam-orbit"
            onClick={() => onChangeCameraView('orbit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              cameraView === 'orbit'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Free Orbit</span>
          </button>
        </div>

        {/* Right: Environment Toggles, Cinematic Tours & Help */}
        <div className="flex items-center gap-2">
          {/* Time of Day */}
          <div className="flex items-center bg-slate-950/80 rounded-xl p-1 border border-slate-800 gap-1 text-xs">
            <button
              title="Dawn / Sunrise"
              onClick={() => onSetTimeOfDay('dawn')}
              className={`p-1.5 rounded-lg transition-colors ${timeOfDay === 'dawn' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' : 'text-slate-400 hover:text-white'}`}
            >
              <Sunrise className="w-4 h-4 text-rose-400" />
            </button>
            <button
              title="Daylight"
              onClick={() => onSetTimeOfDay('day')}
              className={`p-1.5 rounded-lg transition-colors ${timeOfDay === 'day' ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50' : 'text-slate-400 hover:text-white'}`}
            >
              <Sun className="w-4 h-4 text-sky-400" />
            </button>
            <button
              title="Golden Hour / Sunset"
              onClick={() => onSetTimeOfDay('golden')}
              className={`p-1.5 rounded-lg transition-colors ${timeOfDay === 'golden' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-white'}`}
            >
              <Sun className="w-4 h-4 text-amber-400" />
            </button>
            <button
              title="Night Time (Headlights On)"
              onClick={() => onSetTimeOfDay('night')}
              className={`p-1.5 rounded-lg transition-colors ${timeOfDay === 'night' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' : 'text-slate-400 hover:text-white'}`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
            </button>
            <div className="w-px h-4 bg-slate-800 mx-0.5" />
            {/* Weather Presets */}
            <button
              title="Clear Skies"
              onClick={() => onSetWeather('clear')}
              className={`p-1.5 rounded-lg transition-colors ${weather === 'clear' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-white'}`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              title="Cloud Cover"
              onClick={() => onSetWeather('overcast')}
              className={`p-1.5 rounded-lg transition-colors ${weather === 'overcast' ? 'bg-slate-500/30 text-slate-300 border border-slate-500/50' : 'text-slate-400 hover:text-white'}`}
            >
              <Cloud className="w-3.5 h-3.5" />
            </button>
            <button
              title="Rainfall"
              onClick={() => onSetWeather('rain')}
              className={`p-1.5 rounded-lg transition-colors ${weather === 'rain' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'}`}
            >
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            </button>
            <button
              title="Thunderstorm & Lightning"
              onClick={() => onSetWeather('storm')}
              className={`p-1.5 rounded-lg transition-colors ${weather === 'storm' ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'text-slate-400 hover:text-white'}`}
            >
              <CloudLightning className="w-3.5 h-3.5 text-purple-400" />
            </button>
            <div className="w-px h-4 bg-slate-800 mx-0.5" />
            <button
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              onClick={onToggleMute}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Cinematic Flyover Tours Button */}
          <button
            onClick={() => setShowCinematicModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-pink-600/80 to-purple-600/80 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl border border-pink-500/40 transition-all shadow-md shadow-pink-500/20 text-xs font-bold"
            title="Cinematic Landmark Flyovers"
          >
            <Video className="w-4 h-4 text-pink-200 animate-pulse" />
            <span className="hidden sm:inline">Flyover Tours</span>
          </button>

          <button
            onClick={() => setShowControlsModal(true)}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
            title="Controls & Map Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MIDDLE AREA: Interactive Prompt Toast */}
      {/* Site-visit helicopter flights are fully automatic (auto climb to
          150m, auto cruise, auto land) — intentionally no flight HUD,
          no "Land Now" button, and no status text while it's in the air. */}
      <div className="flex flex-col items-center gap-3">
        {/* Drive/Exit Prompt */}
        {!helicopterFlightInfo?.isActive && !isDriving && canEnterVehicle && (
          <div className="pointer-events-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-emerald-300/40">
            <Car className="w-5 h-5 fill-current" />
            <span>Near {currentVehicleDef.name} — Press <strong>[F]</strong> or Click to Drive!</span>
            <button
              onClick={onToggleDriveMode}
              className="px-3 py-1 bg-slate-950 text-white rounded-xl text-xs font-black shadow hover:bg-slate-800 cursor-pointer"
            >
              DRIVE
            </button>
          </div>
        )}

        {/* Landmark Zone Discovery Toast */}
        {!helicopterFlightInfo?.isActive && currentLandmark && (
          <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-xl">{currentLandmark.icon}</span>
            <div>
              <span className="text-xs font-bold text-cyan-300 block">{currentLandmark.name}</span>
              <span className="text-[10px] text-slate-400">{currentLandmark.description}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM AREA: Left Minimap Radar, Center Enter/Exit & Vehicle Controls, Right Speedometer */}
      <div className="flex items-end justify-between gap-4">
        {/* Left: Minimap Radar */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3 shadow-2xl text-white flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-1.5 px-1 gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span>{radarZoom === 'country' ? '10km Radar' : 'Local Radar'}</span>
            </span>
            <button
              onClick={() => setRadarZoom(radarZoom === 'country' ? 'local' : 'country')}
              className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 cursor-pointer"
            >
              {radarZoom === 'country' ? '10 km' : '800 m'}
            </button>
          </div>

          {/* SVG Map Canvas with Fast-Teleport Click */}
          <div
            onClick={handleMinimapClick}
            title="Click anywhere on the map to fast-teleport vehicle/character"
            className="relative w-40 h-40 bg-slate-950 rounded-xl border border-slate-700/80 overflow-hidden cursor-crosshair group shadow-inner"
          >
            {/* Teleport Flash Overlay Feedback */}
            {teleportToast && (
              <div className="absolute inset-0 z-20 pointer-events-none bg-cyan-400/20 animate-pulse flex flex-col items-center justify-center p-1 backdrop-blur-[1px]">
                <div className="bg-slate-900/90 border border-cyan-400/80 px-2 py-1 rounded-lg text-center shadow-lg">
                  <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-400 animate-spin" />
                    <span>Teleported!</span>
                  </span>
                  <span className="text-[8px] font-mono text-slate-300 block">
                    X: {teleportToast.x}m, Z: {teleportToast.z}m
                  </span>
                </div>
              </div>
            )}

            {radarZoom === 'country' ? (
              <svg viewBox="-5000 -5000 10000 10000" className="w-full h-full">
                {/* 10km Outer Bounds Grid */}
                <rect x="-4900" y="-4900" width="9800" height="9800" fill="#090d16" stroke="#1e293b" strokeWidth="120" rx="400" />

                {/* 10km Precision Coordinate Grid */}
                {[-4000, -3000, -2000, -1000, 0, 1000, 2000, 3000, 4000].map((g) => (
                  <g key={`grid-10k-${g}`}>
                    <line x1={g} y1="-5000" x2={g} y2="5000" stroke="#334155" strokeWidth="25" strokeDasharray="150,150" opacity="0.4" />
                    <line x1="-5000" y1={g} x2="5000" y2={g} stroke="#334155" strokeWidth="25" strokeDasharray="150,150" opacity="0.4" />
                  </g>
                ))}

                {/* Hydrography (Part 2) - Reservoir & Water Resources Lake */}
                <ellipse cx="2400" cy="-4100" rx="1350" ry="1200" fill="#0284c7" opacity="0.75" stroke="#38bdf8" strokeWidth="40" />

                {/* Hydrography (Part 2) - South-West Coastal Wetlands */}
                <rect x="-4900" y="3400" width="3100" height="1500" rx="200" fill="#0d9488" opacity="0.5" />

                {/* Hydrography (Part 2) - Sports Retention Lake */}
                <circle cx="-200" cy="3050" r="260" fill="#0284c7" opacity="0.7" />

                {/* Hydrography (Part 2) - Urban Karatoya River Corridor */}
                <path
                  d="M -5000 -800 Q -2500 -1200 -1200 -500 Q 0 -600 1400 -700 Q 2800 -400 5000 -800"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="320"
                  strokeLinecap="round"
                  opacity="0.85"
                />

                {/* Civil Transport Network (Part 3) */}
                {/* 1. East-West Expressway (Z = -3000) */}
                <line x1="-5000" y1="-3000" x2="5000" y2="-3000" stroke="#f59e0b" strokeWidth="120" opacity="0.9" />
                <line x1="-5000" y1="-3000" x2="5000" y2="-3000" stroke="#1e293b" strokeWidth="60" opacity="0.9" />

                {/* 2. North-South National Highway (X = 0) */}
                <line x1="0" y1="-5000" x2="0" y2="5000" stroke="#94a3b8" strokeWidth="100" opacity="0.9" />
                <line x1="0" y1="-5000" x2="0" y2="5000" stroke="#334155" strokeWidth="40" opacity="0.9" />

                {/* 3. Circular Ring Road (R = 2.0 km) */}
                <circle cx="0" cy="0" r="2000" fill="none" stroke="#64748b" strokeWidth="110" opacity="0.95" />
                <circle cx="0" cy="0" r="2000" fill="none" stroke="#f8fafc" strokeWidth="14" strokeDasharray="60,60" opacity="0.9" />

                {/* 4. Map-Wide Dual Railway Network (City Bypass + All Sectors Circuit) */}
                <polygon
                  points={RAILWAY_MAIN_LOOP_NODES.map((n) => `${n.x},${n.z}`).join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="80"
                  strokeLinejoin="round"
                  opacity="0.85"
                />
                <polygon
                  points={RAILWAY_MAIN_LOOP_NODES.map((n) => `${n.x},${n.z}`).join(' ')}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="35"
                  strokeDasharray="90,40"
                  strokeLinejoin="round"
                  opacity="0.95"
                />

                {/* 5. Metro Rail (MRT) Circular Loop */}
                <circle cx="0" cy="0" r="2022" fill="none" stroke="#8b5cf6" strokeWidth="40" strokeDasharray="80,40" opacity="0.9" />

                {/* Individual Zone Boundaries & Fences Demarcation on 10km Radar */}
                {ZONE_BOUNDARIES.map((zone) => {
                  const strokeColor = '#' + zone.glowColor.toString(16).padStart(6, '0');
                  const fillColor = '#' + zone.themeColor.toString(16).padStart(6, '0');

                  if (zone.shape === 'rect' && zone.rectBounds) {
                    const [minX, maxX, minZ, maxZ] = zone.rectBounds;
                    const w = maxX - minX;
                    const h = maxZ - minZ;
                    return (
                      <g key={zone.id}>
                        {/* Zone Area Fill & Perimeter Fence */}
                        <rect
                          x={minX}
                          y={minZ}
                          width={w}
                          height={h}
                          rx="40"
                          fill={fillColor}
                          fillOpacity="0.16"
                          stroke={strokeColor}
                          strokeWidth="35"
                          strokeDasharray="140,40"
                        />
                        {/* Gate Openings */}
                        {zone.gates.map((g, gi) => (
                          <circle
                            key={gi}
                            cx={g.center[0]}
                            cy={g.center[1]}
                            r="60"
                            fill="#f59e0b"
                            stroke="#0f172a"
                            strokeWidth="20"
                          />
                        ))}
                      </g>
                    );
                  } else if (zone.shape === 'circle' && zone.circleCenter && zone.circleRadius) {
                    const [cx, cz] = zone.circleCenter;
                    return (
                      <g key={zone.id}>
                        <circle
                          cx={cx}
                          cy={cz}
                          r={zone.circleRadius}
                          fill={fillColor}
                          fillOpacity="0.12"
                          stroke={strokeColor}
                          strokeWidth="35"
                          strokeDasharray="160,40"
                        />
                        {zone.gates.map((g, gi) => (
                          <circle
                            key={gi}
                            cx={g.center[0]}
                            cy={g.center[1]}
                            r="70"
                            fill="#f59e0b"
                            stroke="#0f172a"
                            strokeWidth="20"
                          />
                        ))}
                      </g>
                    );
                  }
                  return null;
                })}

                {/* Airport Runway Strip */}
                <rect x="-4800" y="2265" width="3200" height="70" rx="10" fill="#334155" stroke="#f8fafc" strokeWidth="15" />

                {/* Olympic Stadium Oval */}
                <ellipse cx="0" cy="2300" rx="180" ry="150" fill="#059669" opacity="0.4" stroke="#10b981" strokeWidth="30" />

                {/* Landmark Pins across 10 km (if any) */}
                {COUNTRY_LANDMARKS.map((lm) => (
                  <g
                    key={lm.id}
                    className="cursor-pointer hover:opacity-100 opacity-90 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTeleportToLandmark) {
                        onTeleportToLandmark(lm);
                        setTeleportToast({ x: lm.center[0], z: lm.center[1] });
                        setTimeout(() => setTeleportToast(null), 2500);
                      }
                    }}
                  >
                    <circle cx={lm.center[0]} cy={lm.center[1]} r="240" fill="#0f172a" stroke="#38bdf8" strokeWidth="60" />
                    <text
                      x={lm.center[0]}
                      y={lm.center[1] + 80}
                      textAnchor="middle"
                      fontSize="220"
                      className="select-none"
                    >
                      {lm.icon}
                    </text>
                  </g>
                ))}

                {/* Player / Vehicle Blip on 10km map */}
                <g transform={`translate(${playerPosition[0]}, ${playerPosition[1]})`}>
                  <circle r="300" fill="#22c55e" opacity="0.5" className="animate-ping" />
                  <circle r="150" fill="#22c55e" stroke="#ffffff" strokeWidth="40" />
                </g>
              </svg>
            ) : (
              <svg viewBox="-400 -400 800 800" className="w-full h-full">
                {/* Local Precision Coordinate Grid */}
                {[-300, -200, -100, 0, 100, 200, 300].map((g) => (
                  <g key={`radar-grid-${g}`}>
                    <line x1={g} y1="-400" x2={g} y2="400" stroke="#334155" strokeWidth="1.5" strokeDasharray="10,10" opacity="0.4" />
                    <line x1="-400" y1={g} x2="400" y2={g} stroke="#334155" strokeWidth="1.5" strokeDasharray="10,10" opacity="0.4" />
                  </g>
                ))}

                {/* Center Crosshairs */}
                <circle cx="0" cy="0" r="100" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.3" />
                <circle cx="0" cy="0" r="250" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.2" />
                <line x1="0" y1="-400" x2="0" y2="400" stroke="#38bdf8" strokeWidth="2" opacity="0.4" />
                <line x1="-400" y1="0" x2="400" y2="0" stroke="#38bdf8" strokeWidth="2" opacity="0.4" />

                {/* Landmark Pins (if any) */}
                {COUNTRY_LANDMARKS.map((lm) => (
                  <g
                    key={lm.id}
                    className="cursor-pointer hover:opacity-100 opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTeleportToLandmark) {
                        onTeleportToLandmark(lm);
                        setTeleportToast({ x: lm.center[0], z: lm.center[1] });
                        setTimeout(() => setTeleportToast(null), 2500);
                      }
                    }}
                  >
                    <circle cx={lm.center[0]} cy={lm.center[1]} r="18" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
                    <text
                      x={lm.center[0]}
                      y={lm.center[1] + 6}
                      textAnchor="middle"
                      fontSize="16"
                      className="select-none"
                    >
                      {lm.icon}
                    </text>
                  </g>
                ))}

                {/* Player / Vehicle Blip */}
                <g transform={`translate(${playerPosition[0]}, ${playerPosition[1]})`}>
                  <circle r="12" fill="#22c55e" opacity="0.4" className="animate-ping" />
                  <circle r="6" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
                </g>
              </svg>
            )}
          </div>

          <div className="mt-1.5 flex items-center justify-center gap-1 text-[9px] text-cyan-400/90 font-medium">
            <span>⚡ Click map to jump</span>
          </div>
        </div>

        {/* Center: Action Controls & Vehicle Switcher */}
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          {/* Helicopter Flight Control Hint Banner */}
          {isDriving && vehicleType === 'helicopter' && (
            <div className="bg-sky-950/90 border border-sky-500/50 rounded-2xl px-4 py-1.5 shadow-xl text-sky-200 text-xs font-semibold flex items-center gap-3 backdrop-blur-md animate-pulse">
              <span className="flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/40">
                <span>⬆️ SPACE:</span> <span>Up (উপরে)</span>
              </span>
              <span className="flex items-center gap-1 text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/40">
                <span>⬇️ BACK ARROW / S:</span> <span>Down (নিচে)</span>
              </span>
              <span className="hidden sm:flex items-center gap-1 text-cyan-300">
                <span>⏩ W/UP: Forward</span>
              </span>
              <span className="hidden sm:flex items-center gap-1 text-slate-300">
                <span>🔄 A/D: Turn</span>
              </span>
            </div>
          )}

          {/* Main Enter/Exit Button */}
          <button
            id="btn-toggle-drive-walk"
            onClick={onToggleDriveMode}
            className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2.5 shadow-2xl transition-all transform active:scale-95 cursor-pointer border ${
              isDriving
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-orange-500/30 border-amber-300/40'
                : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/30 border-cyan-300/40'
            }`}
          >
            {isDriving ? (
              <>
                <Footprints className="w-5 h-5" />
                <span>EXIT VEHICLE (WALK) [F]</span>
              </>
            ) : (
              <>
                <Car className="w-5 h-5 fill-current" />
                <span>DRIVE VEHICLE [F]</span>
              </>
            )}
          </button>

          {/* Quick Vehicle Controls Bar */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-1.5 text-white shadow-xl">
            {isDriving && (
              <>
                <button
                  id="btn-honk-horn"
                  onClick={onHonk}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                  title="Honk Car Horn (H)"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Horn [H]</span>
                </button>

                <button
                  id="btn-toggle-headlights"
                  onClick={onToggleHeadlights}
                  className={`px-3 py-1.5 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors ${
                    headlightsOn ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Headlights (L)"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Lights [L]</span>
                </button>

                <button
                  id="btn-reset-car"
                  onClick={onResetVehicle}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                  title="Reset Car on Flip (R)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset [R]</span>
                </button>
              </>
            )}

            <button
              id="btn-choose-vehicle"
              onClick={() => setShowVehiclesModal(!showVehiclesModal)}
              className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 font-bold rounded-xl text-xs flex items-center gap-1 border border-cyan-500/40 transition-colors"
            >
              <span>{currentVehicleDef.icon}</span>
              <span>{currentVehicleDef.name}</span>
            </button>
          </div>
        </div>

        {/* Right: Speedometer & Altitude/RPM Gauges (when driving) */}
        {isDriving && (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-white flex flex-col items-center min-w-[160px]">
            {/* Speed Gauge Display */}
            <div className="text-center">
              <span className="text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
                {speedKmh}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block -mt-1">
                KM / H
              </span>
            </div>

            {/* Helicopter Altitude Display */}
            {vehicleType === 'helicopter' && (
              <div className="w-full mt-2 bg-sky-950/60 border border-sky-600/40 rounded-xl p-1.5 text-center">
                <div className="text-[9px] font-bold uppercase tracking-wider text-sky-400">Altitude</div>
                <div className="text-lg font-black font-mono text-sky-200">
                  {vehicleState?.altitudeMeters || 0} <span className="text-[10px] font-normal text-sky-400">meters</span>
                </div>
              </div>
            )}

            {/* RPM Radial Meter Bar */}
            <div className="w-full mt-2.5">
              <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                <span>{vehicleType === 'helicopter' ? 'ROTOR' : 'RPM'}</span>
                <span>{gear}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${Math.min(rpm * 100, 100)}%`,
                    backgroundColor: rpm > 0.85 ? '#ef4444' : (rpm > 0.6 ? '#f59e0b' : '#38bdf8'),
                  }}
                />
              </div>
            </div>

            {/* Gear / Mode Indicator */}
            <div className="flex items-center gap-2 mt-2 font-mono font-bold text-xs">
              {vehicleType === 'helicopter' ? (
                <span className="px-2 py-0.5 rounded bg-sky-500/40 text-sky-300 font-black tracking-widest text-[10px]">
                  FLIGHT MODE
                </span>
              ) : (
                <>
                  <span className={`px-1.5 py-0.5 rounded ${gear === 'P' ? 'bg-red-500/40 text-red-300 font-black' : 'text-slate-600'}`}>P</span>
                  <span className={`px-1.5 py-0.5 rounded ${gear === 'R' ? 'bg-amber-500/40 text-amber-300 font-black' : 'text-slate-600'}`}>R</span>
                  <span className={`px-1.5 py-0.5 rounded ${gear === 'D' ? 'bg-emerald-500/40 text-emerald-300 font-black' : 'text-slate-600'}`}>D</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. VEHICLE SELECTOR MODAL */}
      {showVehiclesModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-cyan-300">
                <Car className="w-5 h-5" />
                <span>Select Your Vehicle</span>
              </h3>
              <button
                onClick={() => setShowVehiclesModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {VEHICLE_CATALOG.map((veh) => {
                const isSelected = veh.id === vehicleType;
                return (
                  <button
                    key={veh.id}
                    onClick={() => {
                      onSelectVehicleType(veh.id);
                      setShowVehiclesModal(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all border ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{veh.icon}</span>
                      <div>
                        <span className="font-bold text-sm text-white block">{veh.name}</span>
                        <span className="text-xs text-slate-400">{veh.category}</span>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-bold text-cyan-400 block">{veh.topSpeedKmh} km/h</span>
                      <span className="text-[10px] text-slate-500">Top Speed</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. CONTROLS GUIDE MODAL */}
      {showControlsModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-cyan-300">
                <HelpCircle className="w-5 h-5" />
                <span>Mini Country Game Controls</span>
              </h3>
              <button
                onClick={() => setShowControlsModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-sky-400 uppercase text-[10px]">🚁 Helicopter Flight Controls</h4>
                <p><strong>Space:</strong> ⬆️ Lift UP / Climb (উপরে উঠবে)</p>
                <p><strong>Down / Back Arrow / S:</strong> ⬇️ Descend / Land (নিচে নামবে)</p>
                <p><strong>Up Arrow / W:</strong> ⏩ Fly Forward (সামনে যাবে)</p>
                <p><strong>Left / Right Arrow (A/D):</strong> 🔄 Rotate / Turn</p>
                <p><strong>L:</strong> Searchlight</p>
                <p><strong>F / Enter:</strong> Exit Helicopter</p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-cyan-400 uppercase text-[10px]">🚗 Car, Train & Metro Driving</h4>
                <p><strong>W / Up Arrow:</strong> Accelerate / Throttle Notch</p>
                <p><strong>S / Down Arrow:</strong> Brake / Train Air Brake</p>
                <p><strong>A / D / Left / Right:</strong> Steer / Switch Track Direction</p>
                <p><strong>Space:</strong> Emergency Brake / Handbrake</p>
                <p><strong>F / Enter:</strong> Exit Vehicle / Switch to Walk</p>
                <p><strong>H:</strong> Honk Train Horn / Metro Chime</p>
                <p><strong>L:</strong> High-Beam Headlights</p>
                <p><strong>R:</strong> Reset Vehicle if Stuck</p>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <h4 className="font-bold text-emerald-400 uppercase text-[10px]">🚶 Walking Controls</h4>
              <div className="grid grid-cols-2 gap-2">
                <p><strong>W, A, S, D:</strong> Move Character</p>
                <p><strong>Shift:</strong> Sprint / Fast Run</p>
                <p><strong>Space:</strong> Jump</p>
                <p><strong>F / Enter:</strong> Enter Vehicle / Train / Helicopter</p>
              </div>
            </div>

            <div className="bg-cyan-950/40 p-3 rounded-xl border border-cyan-800/40 text-xs text-cyan-200">
              💡 <strong>Engineering Multi-Modal Network:</strong> Experience 30+ road types (Flyovers, Expressways, Cloverleaf Interchanges, Tunnels, Roundabouts) alongside an active double-track Railway and elevated MRT Line-6 Metro Rail system with automated trains and interactive drive controls!
            </div>
          </div>
        </div>
      )}

      {/* 6. CINEMATIC LANDMARK HELICOPTER FLYOVERS MODAL */}
      {showCinematicModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-pink-400">
                <span className="text-xl">🚁</span>
                <span>Helicopter Landmark Flyover Tours</span>
              </h3>
              <button
                onClick={() => setShowCinematicModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-sky-950/40 p-2.5 rounded-xl border border-sky-800/40">
              🚁 <strong>Interactive Helicopter Transit:</strong> Click any site below to board the executive helicopter. It will spool up rotors at your exact current position and fly you over the country to that landmark!
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {CINEMATIC_TOUR_PRESETS.map((tour) => (
                <button
                  key={tour.id}
                  onClick={() => {
                    if (onStartHelicopterTour) {
                      onStartHelicopterTour([tour.startPos.x, tour.startPos.z], tour.name);
                    } else if (onTeleportToLandmark) {
                      onTeleportToLandmark([tour.startPos.x, tour.startPos.z]);
                      onChangeCameraView('drone');
                    }
                    setShowCinematicModal(false);
                  }}
                  className="w-full p-3 bg-slate-950/60 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/60 rounded-2xl flex items-center justify-between text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tour.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                        {tour.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{tour.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold shrink-0 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all">
                    <span>🚁 Fly</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 text-center">
              The helicopter will calculate real-time flight telemetry from your current coordinates.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
