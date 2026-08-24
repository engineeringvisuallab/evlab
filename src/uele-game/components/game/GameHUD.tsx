import * as THREE from 'three';
import React, { useState } from 'react';
import {
  Car,
  Compass,
  Sun,
  Moon,
  CloudRain,
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
} from 'lucide-react';
import { TimeOfDay, WeatherType } from '../../types/game';
import { VehicleTypeId, VEHICLE_CATALOG, VehiclePhysicsState } from '../../utils/vehicleController';
import { LandmarkZone, COUNTRY_LANDMARKS } from '../../utils/miniCountryTerrain';

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
  onTeleportToLandmark?: (lm: LandmarkZone) => void;
}

// Shared "premium glass" depth treatment — a soft inner top highlight plus a
// deep drop shadow, applied to every floating HUD panel so the whole cluster
// reads as one coherent dashboard instead of flat cards.
const GLASS_PANEL_SHADOW = 'shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_20px_45px_-14px_rgba(0,0,0,0.65)]';

// Radial speedometer + RPM dial — replaces the old flat number + linear
// bar with an analog gauge cluster (tick marks, sweeping needle, redline
// RPM arc) for a more premium/realistic driving-sim feel.
const DashboardGauge: React.FC<{
  speedKmh: number;
  topSpeedKmh: number;
  rpm: number;
  gear: string;
}> = ({ speedKmh, topSpeedKmh, rpm, gear }) => {
  const R = 50;
  const RPM_R = 40;
  const CX = 60;
  const CY = 60;
  const CIRC = 2 * Math.PI * R;
  const RPM_CIRC = 2 * Math.PI * RPM_R;
  const GAUGE_FRACTION = 0.75; // 270° sweep
  const START_ROTATE = 135; // bottom-left start, opens at the bottom
  const speedFrac = Math.max(0, Math.min(1, speedKmh / Math.max(topSpeedKmh, 1)));
  const rpmFrac = Math.max(0, Math.min(1, rpm));
  const needleAngle = START_ROTATE + speedFrac * GAUGE_FRACTION * 360;
  const rpmColor = rpmFrac > 0.85 ? '#ef4444' : rpmFrac > 0.6 ? '#f59e0b' : '#22d3ee';

  const ticks = Array.from({ length: 6 }, (_, i) => {
    const t = i / 5;
    const angleDeg = START_ROTATE + t * GAUGE_FRACTION * 360;
    const angleRad = (angleDeg * Math.PI) / 180;
    const inner = R - 9;
    const outer = R - 3;
    return {
      key: i,
      x1: CX + inner * Math.cos(angleRad),
      y1: CY + inner * Math.sin(angleRad),
      x2: CX + outer * Math.cos(angleRad),
      y2: CY + outer * Math.sin(angleRad),
      label: Math.round(t * topSpeedKmh),
      lx: CX + (R - 17) * Math.cos(angleRad),
      ly: CY + (R - 17) * Math.sin(angleRad),
    };
  });

  return (
    <div className={`pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3 text-white flex flex-col items-center ${GLASS_PANEL_SHADOW}`}>
      <div className="relative w-[132px] h-[132px]">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-0">
          <defs>
            <linearGradient id="speedArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="60%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Outer speed track */}
          <circle
            cx={CX} cy={CY} r={R} fill="none" stroke="#0f172a" strokeWidth={7}
            strokeDasharray={`${CIRC * GAUGE_FRACTION} ${CIRC}`}
            strokeLinecap="round"
            transform={`rotate(${START_ROTATE} ${CX} ${CY})`}
          />
          {/* Speed value arc */}
          <circle
            cx={CX} cy={CY} r={R} fill="none" stroke="url(#speedArcGradient)" strokeWidth={7}
            strokeDasharray={`${CIRC * GAUGE_FRACTION * speedFrac} ${CIRC}`}
            strokeLinecap="round"
            transform={`rotate(${START_ROTATE} ${CX} ${CY})`}
            style={{ transition: 'stroke-dasharray 100ms linear' }}
          />
          {/* Inner RPM track + value (redlines past 85%) */}
          <circle
            cx={CX} cy={CY} r={RPM_R} fill="none" stroke="#0f172a" strokeWidth={4}
            strokeDasharray={`${RPM_CIRC * GAUGE_FRACTION} ${RPM_CIRC}`}
            strokeLinecap="round"
            transform={`rotate(${START_ROTATE} ${CX} ${CY})`}
          />
          <circle
            cx={CX} cy={CY} r={RPM_R} fill="none" stroke={rpmColor} strokeWidth={4}
            strokeDasharray={`${RPM_CIRC * GAUGE_FRACTION * rpmFrac} ${RPM_CIRC}`}
            strokeLinecap="round"
            transform={`rotate(${START_ROTATE} ${CX} ${CY})`}
            style={{ transition: 'stroke-dasharray 75ms linear' }}
          />

          {/* Tick marks + km/h labels */}
          {ticks.map((t) => (
            <g key={t.key}>
              <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#475569" strokeWidth={1.5} />
              <text x={t.lx} y={t.ly} fontSize="6" fill="#64748b" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
                {t.label}
              </text>
            </g>
          ))}

          {/* Needle */}
          <g transform={`rotate(${needleAngle} ${CX} ${CY})`} style={{ transition: 'transform 100ms linear' }}>
            <line x1={CX} y1={CY} x2={CX + (R - 12)} y2={CY} stroke="#f8fafc" strokeWidth={2} strokeLinecap="round" />
          </g>
          <circle cx={CX} cy={CY} r={4} fill="#0f172a" stroke="#f8fafc" strokeWidth={1.5} />
        </svg>

        {/* Center digital readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 pointer-events-none">
          <span className="text-3xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
            {speedKmh}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 -mt-1">km/h</span>
        </div>
      </div>

      {/* Gear Indicator */}
      <div className="flex items-center gap-2 -mt-1 font-mono font-bold text-xs">
        <span className={`px-1.5 py-0.5 rounded ${gear === 'P' ? 'bg-red-500/40 text-red-300 font-black' : 'text-slate-600'}`}>P</span>
        <span className={`px-1.5 py-0.5 rounded ${gear === 'R' ? 'bg-amber-500/40 text-amber-300 font-black' : 'text-slate-600'}`}>R</span>
        <span className={`px-1.5 py-0.5 rounded ${gear === 'D' ? 'bg-emerald-500/40 text-emerald-300 font-black' : 'text-slate-600'}`}>D</span>
      </div>
    </div>
  );
};

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
}) => {
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [showVehiclesModal, setShowVehiclesModal] = useState(false);

  const speedKmh = vehicleState ? vehicleState.speedKmh : 0;
  const rpm = vehicleState ? vehicleState.rpm : 0;
  const gear = vehicleState ? vehicleState.gear : 'P';
  const headlightsOn = vehicleState ? vehicleState.headlightsOn : false;

  const currentVehicleDef = VEHICLE_CATALOG.find((v) => v.id === vehicleType) || VEHICLE_CATALOG[0];

  return (
    <div id="uele-game-hud" className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 md:p-5 select-none overflow-hidden font-sans">
      {/* 1. TOP BAR: Title, Active Landmark, Camera, Time/Weather & Audio */}
      <header className={`pointer-events-auto flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2.5 text-white ${GLASS_PANEL_SHADOW}`}>
        {/* Left: Brand Identity & Location */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-300/40">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">
                UELE: 3D MINI COUNTRY
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Open World 3D</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
              <span>{currentLandmark ? `${currentLandmark.icon} ${currentLandmark.name}` : '🗺️ Open Highway Network'}</span>
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

        {/* Right: Environment Toggles & Help */}
        <div className="flex items-center gap-2">
          {/* Time of Day */}
          <div className="flex items-center bg-slate-950/80 rounded-xl p-1 border border-slate-800 gap-1 text-xs">
            <button
              title="Daylight"
              onClick={() => onSetTimeOfDay('day')}
              className={`p-1.5 rounded-lg transition-colors ${timeOfDay === 'day' ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50' : 'text-slate-400 hover:text-white'}`}
            >
              <Sun className="w-4 h-4 text-sky-400" />
            </button>
            <button
              title="Sunset / Golden Hour"
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
            <button
              title="Toggle Rain"
              onClick={() => onSetWeather(weather === 'rain' ? 'clear' : 'rain')}
              className={`p-1.5 rounded-lg transition-colors ${weather === 'rain' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'}`}
            >
              <CloudRain className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              onClick={onToggleMute}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          <button
            onClick={() => setShowControlsModal(true)}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
            title="Controls & Map Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MIDDLE AREA: Interactive Prompt Toast (When near car or entering a new landmark) */}
      <div className="flex flex-col items-center gap-3">
        {/* Drive/Exit Prompt */}
        {!isDriving && canEnterVehicle && (
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
        {currentLandmark && (
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
        <div className={`pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3 text-white flex flex-col items-center ${GLASS_PANEL_SHADOW}`}>
          <div className="flex items-center justify-between w-full mb-1.5 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span>Mini Country Map</span>
            </span>
          </div>

          {/* SVG Map Canvas — realistic terrain-style minimap (not a sci-fi radar) */}
          <div className="relative w-36 h-36 bg-[#5c7a4a] rounded-xl border border-slate-800 overflow-hidden">
            <svg viewBox="-400 -400 800 800" className="w-full h-full">
              <defs>
                <radialGradient id="mapVignette" cx="50%" cy="50%" r="70%">
                  <stop offset="60%" stopColor="#000000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
                </radialGradient>
                <linearGradient id="riverShade" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0e5e73" />
                  <stop offset="45%" stopColor="#2f96b4" />
                  <stop offset="55%" stopColor="#5ec4de" />
                  <stop offset="100%" stopColor="#0e5e73" />
                </linearGradient>
                <radialGradient id="youAreHereGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Base terrain — soft grassland fill */}
              <rect x="-400" y="-400" width="800" height="800" fill="#5c7a4a" />

              {/* Farmland patchwork (agricultural south-west) */}
              <g opacity="0.5">
                <rect x="-320" y="-60" width="90" height="70" rx="4" fill="#6f8f4e" />
                <rect x="-320" y="20" width="70" height="80" rx="4" fill="#65834a" />
                <rect x="-230" y="10" width="80" height="60" rx="4" fill="#6f8f4e" />
              </g>

              {/* Forested mountain ridge (north-west) */}
              <g opacity="0.85">
                <ellipse cx="-230" cy="-230" rx="120" ry="95" fill="#3f5a3a" />
                <ellipse cx="-160" cy="-270" rx="70" ry="55" fill="#46633f" />
                <ellipse cx="-270" cy="-160" rx="60" ry="50" fill="#3a5335" />
              </g>

              {/* Urban core tint (center) */}
              <rect x="-40" y="-90" width="150" height="160" rx="18" fill="#8a8f7a" opacity="0.45" />

              {/* Industrial zone tint (south-east) */}
              <rect x="90" y="150" width="120" height="100" rx="10" fill="#8f7a5c" opacity="0.4" />

              {/* River — natural winding blue channel */}
              <path
                d="M 180 -400 Q 210 -260 175 -170 Q 140 -80 220 -10 Q 280 60 195 140 Q 150 220 200 400"
                fill="none"
                stroke="url(#riverShade)"
                strokeWidth="26"
                strokeLinecap="round"
                opacity="0.95"
              />
              <path
                d="M 180 -400 Q 210 -260 175 -170 Q 140 -80 220 -10 Q 280 60 195 140 Q 150 220 200 400"
                fill="none"
                stroke="#bff0ff"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* Roads — asphalt base + dashed centerline, like a real street map */}
              {[
                { d: 'M 20 -370 L 20 370', w: 16 },
                { d: 'M -140 -10 L 210 -10', w: 14 },
                { d: 'M 20 100 L 180 200', w: 12 },
                { d: 'M 20 -10 Q -60 -100 -220 -250', w: 11, curve: true },
                { d: 'M -320 -15 L 20 -10', w: 10 },
                { d: 'M 100 150 L 210 150', w: 10 },
              ].map((road, i) => (
                <g key={i}>
                  <path d={road.d} fill="none" stroke="#3f3f46" strokeWidth={road.w} strokeLinecap="round" opacity="0.9" />
                  <path
                    d={road.d}
                    fill="none"
                    stroke="#f5d24a"
                    strokeWidth="1.6"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </g>
              ))}

              {/* Landmark Pins — map-style teardrop markers, colored by category */}
              {COUNTRY_LANDMARKS.map((lm) => {
                const categoryColor: Record<string, string> = {
                  city: '#64748b',
                  mountain: '#78716c',
                  energy: '#f59e0b',
                  transport: '#3b82f6',
                  water: '#0ea5e9',
                  agriculture: '#65a30d',
                  industry: '#ea580c',
                };
                const fill = categoryColor[lm.category] || '#64748b';
                return (
                  <g
                    key={lm.id}
                    className="cursor-pointer hover:opacity-100 opacity-90 transition-opacity"
                    onClick={() => onTeleportToLandmark && onTeleportToLandmark(lm)}
                    transform={`translate(${lm.center[0]}, ${lm.center[1]})`}
                  >
                    <ellipse cx="0" cy="16" rx="9" ry="3" fill="#000000" opacity="0.25" />
                    <path
                      d="M 0 -20 C 10 -20 17 -13 17 -4 C 17 8 0 22 0 22 C 0 22 -17 8 -17 -4 C -17 -13 -10 -20 0 -20 Z"
                      fill={fill}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    <circle cx="0" cy="-4" r="9" fill="#0f172a" />
                    <text x="0" y="0" textAnchor="middle" fontSize="11" className="select-none">
                      {lm.icon}
                    </text>
                  </g>
                );
              })}

              {/* "You are here" — GPS-style location dot (not a radar ping) */}
              <g transform={`translate(${playerPosition[0]}, ${playerPosition[1]})`}>
                <circle r="26" fill="url(#youAreHereGlow)" />
                <circle r="9" fill="#3b82f6" opacity="0.25" className="animate-ping" />
                <circle r="6.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
              </g>

              {/* Map vignette for depth, like a real GPS display */}
              <rect x="-400" y="-400" width="800" height="800" fill="url(#mapVignette)" />
            </svg>

            {/* Compass */}
            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-slate-950/70 border border-slate-600/60 flex items-center justify-center">
              <span className="text-[8px] font-black text-red-400">N</span>
            </div>

            {/* Glass sheen overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />
          </div>
        </div>

        {/* Center: Action Controls & Vehicle Switcher */}
        <div className="pointer-events-auto flex flex-col items-center gap-2">
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
          <div className={`flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-1.5 text-white ${GLASS_PANEL_SHADOW}`}>
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

        {/* Right: Speedometer & RPM Gauges (when driving) */}
        {isDriving && (
          <DashboardGauge
            speedKmh={speedKmh}
            topSpeedKmh={currentVehicleDef.topSpeedKmh}
            rpm={rpm}
            gear={gear}
          />
        )}
      </div>

      {/* 4. VEHICLE SELECTOR MODAL */}
      {showVehiclesModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className={`bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-white space-y-4 ${GLASS_PANEL_SHADOW}`}>
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
          <div className={`bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full text-white space-y-4 ${GLASS_PANEL_SHADOW}`}>
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
                <h4 className="font-bold text-cyan-400 uppercase text-[10px]">🚗 Driving Controls</h4>
                <p><strong>W / Up Arrow:</strong> Accelerate</p>
                <p><strong>S / Down Arrow:</strong> Brake / Reverse</p>
                <p><strong>A / D / Left / Right:</strong> Steer Left / Right</p>
                <p><strong>Space:</strong> Handbrake / Drift</p>
                <p><strong>F / Enter:</strong> Exit Car to Walk on Foot</p>
                <p><strong>H:</strong> Honk Car Horn</p>
                <p><strong>L:</strong> Toggle Night Headlights</p>
                <p><strong>R:</strong> Reset Car if Flipped</p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-400 uppercase text-[10px]">🚶 Walking Controls</h4>
                <p><strong>W, A, S, D:</strong> Move Character</p>
                <p><strong>Shift:</strong> Sprint / Fast Run</p>
                <p><strong>Space:</strong> Jump</p>
                <p><strong>F / Enter:</strong> Enter Vehicle when near</p>
                <p><strong>Mouse Drag:</strong> Rotate Camera Angle</p>
                <p><strong>Scroll Wheel:</strong> Zoom In / Out</p>
              </div>
            </div>

            <div className="bg-cyan-950/40 p-3 rounded-xl border border-cyan-800/40 text-xs text-cyan-200">
              💡 <strong>Explore the Country:</strong> Drive across the Highway N5, climb the Mountain Wind Energy Ridge, visit the Hydro Dam Reservoir, explore the Smart City Core skyscrapers, and speed down the 240m Airport Runway!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
