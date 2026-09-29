import React from 'react';
import {
  Play,
  Pause,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Volume2,
  VolumeX,
  Compass,
  RotateCcw,
  Languages,
  Activity,
  Droplets,
  Layers
} from 'lucide-react';
import { PlantState, TimeOfDay, PlantScenario } from '../types';

interface HeaderProps {
  plantState: PlantState;
  onToggleMaster: () => void;
  onChangeSpeed: (speed: number) => void;
  onChangeTimeOfDay: (time: TimeOfDay) => void;
  onChangeScenario: (scenario: PlantScenario) => void;
  onToggleSound: () => void;
  onToggleLanguage: () => void;
  onStartTour: () => void;
  onResetCamera: () => void;
  onToggleScada: () => void;
  scadaOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  plantState,
  onToggleMaster,
  onChangeSpeed,
  onChangeTimeOfDay,
  onChangeScenario,
  onToggleSound,
  onToggleLanguage,
  onStartTour,
  onResetCamera,
  onToggleScada,
  scadaOpen,
}) => {
  const isBn = plantState.language === 'bn';

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/85 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white shadow-md shadow-sky-500/20">
          <Droplets className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
              {isBn ? 'ওয়াটার ট্রিটমেন্ট প্লান্ট ৩ডি সিমুলেশন' : 'City Water Treatment Plant 3D'}
            </h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
              plantState.isMasterRunning
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${plantState.isMasterRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              {plantState.isMasterRunning ? (isBn ? 'লাইভ সচল' : 'ONLINE') : (isBn ? 'স্থগিত' : 'PAUSED')}
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            {isBn ? 'নদী থেকে বিশুদ্ধ খাবার পানি প্রস্তুত প্রণালী' : 'Interactive River-to-Potable Water Engineering System'}
          </p>
        </div>
      </div>

      {/* Center Controls: Master Run/Stop, Speed, Guided Tour */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Play/Pause Button */}
        <button
          id="master-run-toggle-btn"
          onClick={onToggleMaster}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 ${
            plantState.isMasterRunning
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/40'
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
          }`}
          title={plantState.isMasterRunning ? 'Pause Simulation' : 'Start Simulation'}
        >
          {plantState.isMasterRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{plantState.isMasterRunning ? (isBn ? 'পজ করুন' : 'Pause') : (isBn ? 'চালান' : 'Run Live')}</span>
        </button>

        {/* Speed Controls */}
        <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => onChangeSpeed(speed)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                plantState.simSpeed === speed
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Guided Tour Button */}
        <button
          id="guided-tour-btn"
          onClick={onStartTour}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            plantState.tourActive
              ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-500/40 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>{isBn ? 'অটো-ট্যুর' : 'Guided Tour'}</span>
        </button>

        {/* SCADA Dashboard Toggle */}
        <button
          id="scada-dashboard-toggle-btn"
          onClick={onToggleScada}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            scadaOpen
              ? 'bg-sky-600 text-white border-sky-400'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span>{isBn ? 'স্ক্যাডা প্যানেল' : 'SCADA'}</span>
        </button>
      </div>

      {/* Right Controls: Weather, Sound, Language, Camera Reset */}
      <div className="flex items-center gap-2">
        {/* Weather / Lighting Mode */}
        <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
          <button
            onClick={() => onChangeTimeOfDay('day')}
            className={`p-1.5 rounded transition-all ${plantState.timeOfDay === 'day' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            title="Day Lighting"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeTimeOfDay('sunset')}
            className={`p-1.5 rounded transition-all ${plantState.timeOfDay === 'sunset' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Golden Hour / Sunset"
          >
            <Sunset className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeTimeOfDay('night')}
            className={`p-1.5 rounded transition-all ${plantState.timeOfDay === 'night' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Night Mode with Floodlights"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              onChangeTimeOfDay('storm');
              onChangeScenario('monsoon_turbidity');
            }}
            className={`p-1.5 rounded transition-all ${plantState.timeOfDay === 'storm' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Monsoon Storm (High River Turbidity)"
          >
            <CloudRain className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-lg border transition-all ${
            plantState.soundEnabled
              ? 'bg-sky-600/30 text-sky-300 border-sky-500/50'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title={plantState.soundEnabled ? 'Mute Plant Audio' : 'Enable Industrial Sound Engine'}
        >
          {plantState.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Camera Reset */}
        <button
          onClick={onResetCamera}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          title="Reset Camera View to Full Plant Overview"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Language Switch */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          title="Switch Language / ভাষা পরিবর্তন"
        >
          <Languages className="w-3.5 h-3.5 text-sky-400" />
          <span>{isBn ? 'English' : 'বাংলা'}</span>
        </button>
      </div>
    </header>
  );
};
