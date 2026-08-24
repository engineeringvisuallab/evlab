import React from 'react';
import {
  Camera,
  Eye,
  Layers,
  Compass,
  Zap,
  Droplets,
  Sun,
  Moon,
  CloudRain,
  Volume2,
  VolumeX,
  Hammer,
  GraduationCap,
  FlaskConical,
  Award,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { CameraViewMode, EngineerProfile, EngineeringDistrictId, TimeOfDay, WeatherType } from '../../types/game';
import { DISTRICT_REGISTRY } from '../../data/geoData';
import { CAREER_RANKS } from '../../data/geoData';

interface WorldNavigationHUDProps {
  profile: EngineerProfile;
  cameraMode: CameraViewMode;
  onSetCameraMode: (mode: CameraViewMode) => void;
  timeOfDay: TimeOfDay;
  onSetTimeOfDay: (time: TimeOfDay) => void;
  weather: WeatherType;
  onSetWeather: (weather: WeatherType) => void;
  selectedDistrict: EngineeringDistrictId | null;
  onSelectDistrict: (id: EngineeringDistrictId | null) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenMissions: () => void;
  onOpenSkills: () => void;
  onOpenProfile: () => void;
  onOpenBuildMode: () => void;
  onOpenLab: () => void;
  onOpenBoss: () => void;
  isBuildModeActive: boolean;
}

export const WorldNavigationHUD: React.FC<WorldNavigationHUDProps> = ({
  profile,
  cameraMode,
  onSetCameraMode,
  timeOfDay,
  onSetTimeOfDay,
  weather,
  onSetWeather,
  selectedDistrict,
  onSelectDistrict,
  isMuted,
  onToggleMute,
  onOpenMissions,
  onOpenSkills,
  onOpenProfile,
  onOpenBuildMode,
  onOpenLab,
  onOpenBoss,
  isBuildModeActive,
}) => {
  const currentRank = CAREER_RANKS[profile.rankIndex] || CAREER_RANKS[0];
  const nextRank = CAREER_RANKS[profile.rankIndex + 1];
  const xpNeeded = nextRank ? nextRank.minXp - currentRank.minXp : 10000;
  const currentProgress = nextRank ? ((profile.totalXp - currentRank.minXp) / xpNeeded) * 100 : 100;

  const activeDistInfo = selectedDistrict ? DISTRICT_REGISTRY[selectedDistrict] : null;

  return (
    <div id="uele-navigation-hud" className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-6 overflow-hidden">
      {/* Top Header Bar */}
      <header className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_20px_45px_-14px_rgba(0,0,0,0.65)] text-white">
        {/* Left: Brand Identity & Coordinates */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-300/30">
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">
                UELE
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 rounded-full">
                Engineering World
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <span>Sherpur Geodetic Zone</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400/90 font-medium">UTM 45N (Bangladesh)</span>
            </p>
          </div>
        </div>

        {/* Center: Quick Mode Toggles */}
        <div className="hidden lg:flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800 gap-1 text-xs">
          {(
            [
              { id: 'world', label: 'World Strategic', icon: Eye },
              { id: 'walk', label: 'Site Inspection', icon: Compass },
              { id: 'engineer', label: 'Isometric FEA', icon: Layers },
              { id: 'design', label: 'Top-Down Grid', icon: Hammer },
              { id: 'cinematic', label: 'Cinematic', icon: Camera },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = cameraMode === item.id;
            return (
              <button
                key={item.id}
                id={`btn-cam-mode-${item.id}`}
                onClick={() => onSetCameraMode(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  active
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Engineer Profile & Quick Stats */}
        <div className="flex items-center gap-3">
          {/* Time & Weather */}
          <div className="hidden sm:flex items-center bg-slate-950/70 rounded-xl p-1 border border-slate-800 gap-1 text-xs">
            <button
              title="Dawn"
              onClick={() => onSetTimeOfDay('dawn')}
              className={`p-1.5 rounded-lg transition-colors ${timeOfDay === 'dawn' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              <Sun className="w-4 h-4 text-pink-400" />
            </button>
            <button
              title="Daylight"
              onClick={() => onSetTimeOfDay('day')}
              className={`p-1.5 rounded-lg transition-colors ${timeOfDay === 'day' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              <Sun className="w-4 h-4 text-sky-400" />
            </button>
            <button
              title="Night"
              onClick={() => onSetTimeOfDay('night')}
              className={`p-1.5 rounded-lg transition-colors ${timeOfDay === 'night' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
            </button>
            <div className="w-px h-4 bg-slate-800 mx-0.5" />
            <button
              title="Toggle Rain/Storm"
              onClick={() => onSetWeather(weather === 'rain' ? 'clear' : 'rain')}
              className={`p-1.5 rounded-lg transition-colors ${weather === 'rain' || weather === 'storm' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              <CloudRain className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              onClick={onToggleMute}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Engineer Profile Chip */}
          <button
            id="btn-engineer-profile"
            onClick={onOpenProfile}
            className="flex items-center gap-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-1.5 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
              L{profile.level}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {profile.name}
                </span>
                <span className="text-[10px] font-medium text-amber-400">
                  {currentRank.title}
                </span>
              </div>
              {/* Mini XP Bar */}
              <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(currentProgress, 100)}%` }}
                />
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* Middle Floating District Inspector Panel (Appears when a district is selected) */}
      {activeDistInfo && (
        <div className="pointer-events-auto self-start max-w-sm w-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-2xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_20px_45px_-14px_rgba(0,0,0,0.65)] text-white animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-md"
                style={{ backgroundColor: `${activeDistInfo.color}30`, borderColor: activeDistInfo.color, borderWidth: 1 }}
              >
                <Compass className="w-5 h-5" style={{ color: activeDistInfo.color }} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">{activeDistInfo.name}</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {activeDistInfo.title}
                </span>
              </div>
            </div>
            <button
              onClick={() => onSelectDistrict(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800/80 rounded-lg"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
            {activeDistInfo.description}
          </p>

          {/* Infrastructure Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Water Net</span>
              <span className="text-xs font-bold text-cyan-400">{activeDistInfo.infrastructureStatus.waterSupply}%</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Power Grid</span>
              <span className="text-xs font-bold text-amber-400">{activeDistInfo.infrastructureStatus.powerGrid}%</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Road Health</span>
              <span className="text-xs font-bold text-emerald-400">{activeDistInfo.infrastructureStatus.roadQuality}%</span>
            </div>
          </div>

          {/* Key Facilities list */}
          <div className="mt-3">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block mb-1.5">
              Active Engineering Facilities
            </span>
            <div className="space-y-1">
              {activeDistInfo.keyFacilities.slice(0, 2).map((fac, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-950/40 px-2 py-1 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="truncate">{fac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="mt-4 flex gap-2">
            <button
              id="btn-inspect-district-missions"
              onClick={onOpenMissions}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <span>Explore Missions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenBuildMode}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
              title="Construct in this district"
            >
              <Hammer className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Main Action Bar */}
      <footer className="pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_20px_45px_-14px_rgba(0,0,0,0.65)] text-white">
        {/* District Fast Navigator */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] uppercase font-bold text-slate-400 px-2 hidden xl:inline">
            Districts:
          </span>
          {Object.values(DISTRICT_REGISTRY).map((dist) => {
            const isSelected = selectedDistrict === dist.id;
            return (
              <button
                key={dist.id}
                id={`btn-nav-district-${dist.id}`}
                onClick={() => onSelectDistrict(dist.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-100 text-slate-900 shadow-md font-bold'
                    : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dist.color }} />
                <span>{dist.name.replace(' District', '')}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Interactive Module Launcher Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            id="btn-open-missions-modal"
            onClick={onOpenMissions}
            className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Missions (10)</span>
          </button>

          <button
            id="btn-open-lab-modal"
            onClick={onOpenLab}
            className="px-3.5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Virtual Lab</span>
          </button>

          <button
            id="btn-open-build-mode"
            onClick={onOpenBuildMode}
            className={`px-3.5 py-2.5 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
              isBuildModeActive
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
            }`}
          >
            <Hammer className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Build Mode</span>
          </button>

          <button
            id="btn-open-skills-modal"
            onClick={onOpenSkills}
            className="px-3.5 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Skill Tree</span>
          </button>

          <button
            id="btn-open-boss-modal"
            onClick={onOpenBoss}
            className="px-3.5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="hidden sm:inline">Boss Event</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
