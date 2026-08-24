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
      <header className="pointer-events-auto flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2.5 shadow-2xl text-white">
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
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3 shadow-2xl text-white flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-1.5 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span>Mini Country Radar</span>
            </span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-36 h-36 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <svg viewBox="-400 -400 800 800" className="w-full h-full">
              {/* Rivers */}
              <path
                d="M 180 -220 Q 220 -100 170 0 Q 140 100 230 20 Q 260 200 160 360"
                fill="none"
                stroke="#0284c7"
                strokeWidth="28"
                opacity="0.8"
              />
              {/* Roads */}
              {/* Expressway N5 */}
              <line x1="20" y1="-370" x2="20" y2="370" stroke="#64748b" strokeWidth="18" strokeLinecap="round" />
              {/* City Boulevard */}
              <line x1="-140" y1="-10" x2="210" y2="-10" stroke="#64748b" strokeWidth="16" />
              {/* Airport Connector */}
              <line x1="20" y1="100" x2="180" y2="200" stroke="#64748b" strokeWidth="14" />
              {/* Mountain road */}
              <path d="M 20 -10 Q -60 -100 -220 -250" fill="none" stroke="#475569" strokeWidth="12" />

              {/* Landmark Pins */}
              {COUNTRY_LANDMARKS.map((lm) => (
                <g
                  key={lm.id}
                  className="cursor-pointer hover:opacity-100 opacity-80 transition-opacity"
                  onClick={() => onTeleportToLandmark && onTeleportToLandmark(lm)}
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

        {/* Right: Speedometer & RPM Gauges (when driving) */}
        {isDriving && (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-white flex flex-col items-center min-w-[150px]">
            {/* Speed Gauge Display */}
            <div className="text-center">
              <span className="text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
                {speedKmh}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block -mt-1">
                KM / H
              </span>
            </div>

            {/* RPM Radial Meter Bar */}
            <div className="w-full mt-2.5">
              <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                <span>RPM</span>
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

            {/* Gear Indicator */}
            <div className="flex items-center gap-2 mt-2 font-mono font-bold text-xs">
              <span className={`px-1.5 py-0.5 rounded ${gear === 'P' ? 'bg-red-500/40 text-red-300 font-black' : 'text-slate-600'}`}>P</span>
              <span className={`px-1.5 py-0.5 rounded ${gear === 'R' ? 'bg-amber-500/40 text-amber-300 font-black' : 'text-slate-600'}`}>R</span>
              <span className={`px-1.5 py-0.5 rounded ${gear === 'D' ? 'bg-emerald-500/40 text-emerald-300 font-black' : 'text-slate-600'}`}>D</span>
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
