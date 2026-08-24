import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Gauge,
  Timer,
  Ruler,
  Compass,
  Zap,
  Activity,
  Maximize2,
  Settings2,
  Layers,
  Sparkles,
  Eye,
  Grid,
  Sliders,
} from 'lucide-react';
import { ExperimentMetadata, EducationLevel } from '../../types/physics';
import { SimulationCanvas } from './SimulationCanvas';
import { MeasurementToolsOverlay } from './MeasurementToolsOverlay';
import { formatValue } from '../../utils/physicsMath';

interface SimulationWorkspaceProps {
  experiment: ExperimentMetadata;
  educationLevel: EducationLevel;
  params: Record<string, number>;
  onParamChange: (paramId: string, value: number) => void;
  observables: Record<string, any>;
  onObservablesUpdate: (observables: Record<string, any>) => void;
  calculatedValues: Record<string, any>;
}

export const SimulationWorkspace: React.FC<SimulationWorkspaceProps> = ({
  experiment,
  educationLevel,
  params,
  onParamChange,
  observables,
  onObservablesUpdate,
  calculatedValues,
}) => {
  // Playback state
  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 0.25, 0.5, 1.0, 2.0
  const [showVectors, setShowVectors] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showTrails, setShowTrails] = useState(true);

  // Active measurement tools overlay
  const [activeTools, setActiveTools] = useState<string[]>(['stopwatch']);

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // 60FPS Physics Simulation Clock Loop
  useEffect(() => {
    if (!isRunning) {
      lastTimeRef.current = null;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const stepSimulation = (time: number) => {
      if (lastTimeRef.current !== null) {
        const dt = ((time - lastTimeRef.current) / 1000) * playbackSpeed;
        setSimulationTime((prev) => prev + Math.min(dt, 0.1));
      }
      lastTimeRef.current = time;
      animFrameRef.current = requestAnimationFrame(stepSimulation);
    };

    animFrameRef.current = requestAnimationFrame(stepSimulation);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, playbackSpeed]);

  const handleTogglePlay = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSimulationTime(0);
  };

  const handleStepForward = () => {
    setIsRunning(false);
    setSimulationTime((prev) => prev + 0.05);
  };

  const toggleTool = (toolId: string) => {
    setActiveTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  };

  return (
    <div
      id="simulation-workspace"
      className="relative flex flex-col h-full bg-[#080808] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
    >
      {/* Top Laboratory Toolbar - Elegant Dark */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0A0A0A] border-b border-white/10 z-20">
        {/* Left: Experiment Title & Subtitle */}
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              {experiment.title}
            </h2>
            <span className="text-[10px] text-white/40 font-mono tracking-wide">{experiment.subCategory}</span>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-2 bg-[#050505] px-2.5 py-1 rounded-lg border border-white/10">
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              isRunning
                ? 'bg-orange-500 hover:bg-orange-400 text-black'
                : 'bg-cyan-600 hover:bg-cyan-500 text-black'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isRunning ? 'PAUSE' : 'PLAY SIMULATION'}
          </button>

          <button
            onClick={handleStepForward}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors"
            title="Step Forward (+0.05s)"
          >
            <StepForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors"
            title="Reset Environment"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Time Display */}
          <div className="px-2.5 py-0.5 bg-[#0A0A0A] border border-white/10 rounded text-center min-w-[72px]">
            <span className="font-mono text-xs font-bold text-cyan-400">
              {simulationTime.toFixed(2)}
            </span>
            <span className="text-[10px] text-white/40 ml-0.5 font-mono">s</span>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 pl-1 border-l border-white/10">
            {[0.25, 0.5, 1.0, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  playbackSpeed === spd
                    ? 'bg-cyan-600/20 text-cyan-400 font-bold border border-cyan-500/40'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Overlay Toggles & Measurement Tools */}
        <div className="flex items-center gap-1.5">
          {/* Visual vector & grid toggles */}
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`p-1.5 rounded border text-xs transition-colors ${
              showVectors
                ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500/40'
                : 'bg-[#050505] text-white/40 border-white/10'
            }`}
            title="Toggle Force/Velocity Vectors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded border text-xs transition-colors ${
              showGrid
                ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500/40'
                : 'bg-[#050505] text-white/40 border-white/10'
            }`}
            title="Toggle Coordinate Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Measurement Tools Group */}
          <div className="flex items-center gap-1 bg-[#050505] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => toggleTool('stopwatch')}
              className={`p-1 rounded text-xs transition-colors ${
                activeTools.includes('stopwatch')
                  ? 'bg-cyan-600/30 text-cyan-300'
                  : 'text-white/40 hover:text-white'
              }`}
              title="Stopwatch"
            >
              <Timer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleTool('ruler')}
              className={`p-1 rounded text-xs transition-colors ${
                activeTools.includes('ruler')
                  ? 'bg-orange-500/30 text-orange-300'
                  : 'text-white/40 hover:text-white'
              }`}
              title="Metric Ruler"
            >
              <Ruler className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleTool('protractor')}
              className={`p-1 rounded text-xs transition-colors ${
                activeTools.includes('protractor')
                  ? 'bg-cyan-600/30 text-cyan-300'
                  : 'text-white/40 hover:text-white'
              }`}
              title="Protractor"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleTool('voltmeter')}
              className={`p-1 rounded text-xs transition-colors ${
                activeTools.includes('voltmeter')
                  ? 'bg-yellow-500/30 text-yellow-300'
                  : 'text-white/40 hover:text-white'
              }`}
              title="Multimeter"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleTool('pressureGauge')}
              className={`p-1 rounded text-xs transition-colors ${
                activeTools.includes('pressureGauge')
                  ? 'bg-cyan-600/30 text-cyan-300'
                  : 'text-white/40 hover:text-white'
              }`}
              title="Pressure Transducer"
            >
              <Gauge className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleTool('speedRadar')}
              className={`p-1 rounded text-xs transition-colors ${
                activeTools.includes('speedRadar')
                  ? 'bg-emerald-500/30 text-emerald-300'
                  : 'text-white/40 hover:text-white'
              }`}
              title="Kinematic Radar"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Parameter Control Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative">
        {/* Left: Simulation Canvas (8 Columns on desktop) */}
        <div className="lg:col-span-8 relative flex flex-col bg-[#020202] border-r border-white/10 min-h-[320px]">
          {/* Measurement Tools Floating Draggable Layer */}
          <MeasurementToolsOverlay
            activeTools={activeTools}
            onToggleTool={toggleTool}
            simulationTime={simulationTime}
            currentObservables={observables}
          />

          {/* Real-time HTML5 Physics Canvas Engine */}
          <SimulationCanvas
            experiment={experiment}
            params={params}
            isRunning={isRunning}
            simulationTime={simulationTime}
            onObservablesUpdate={onObservablesUpdate}
            showVectors={showVectors}
            showGrid={showGrid}
            showTrails={showTrails}
          />

          {/* Quick Real-Time Status Ticker - Elegant Dark */}
          <div className="bg-[#0A0A0A] border-t border-white/10 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-white/50">
            <div className="flex items-center gap-3">
              <span>
                SIM STATUS:{' '}
                <strong className={isRunning ? 'text-cyan-400' : 'text-orange-400'}>
                  {isRunning ? 'RUNNING' : 'PAUSED'}
                </strong>
              </span>
              <span>
                INTEGRATION: <strong className="text-white/70">60 HZ RK4</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {Object.entries(observables)
                .slice(0, 3)
                .map(([k, v]) => (
                  <span key={k} className="flex items-center gap-1">
                    <span className="text-white/40">{k}:</span>
                    <span className="text-cyan-400 font-bold">
                      {typeof v === 'number' ? formatValue(v, 2) : String(v)}
                    </span>
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Right: Parameter Sliders & System Controls (4 Columns on desktop) */}
        <div className="lg:col-span-4 bg-[#080808] flex flex-col overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-[10px] uppercase font-bold text-cyan-500 flex items-center gap-1.5 tracking-widest">
              <Sliders className="w-3.5 h-3.5 text-cyan-500" /> Physical Parameters
            </h3>
            <span className="text-[10px] text-white/40 font-mono">Real-Time Binding</span>
          </div>

          {/* Sliders List */}
          <div className="space-y-4 flex-1">
            {experiment.parameters.map((param) => {
              const currentValue = params[param.id] ?? param.defaultValue;
              return (
                <div
                  key={param.id}
                  className="bg-[#050505] border border-white/10 rounded-lg p-3.5 space-y-2 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-white/80">
                        {param.name}
                      </span>
                      {param.symbol && (
                        <span className="text-[11px] font-mono text-cyan-500 ml-1.5">
                          ({param.symbol})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-[#0A0A0A] border border-white/10 px-2 py-0.5 rounded text-xs font-mono font-bold text-cyan-400">
                      {formatValue(currentValue, 2)}
                      <span className="text-[10px] text-white/40 font-normal">{param.unit}</span>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={currentValue}
                    onChange={(e) => onParamChange(param.id, Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full accent-cyan-500 cursor-pointer"
                  />

                  {/* Min / Max labels */}
                  <div className="flex justify-between text-[10px] font-mono text-white/40">
                    <span>
                      {param.min} {param.unit}
                    </span>
                    <span>
                      {param.max} {param.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Tip Box */}
          <div className="p-3 bg-cyan-900/10 border border-cyan-800/30 rounded mt-auto">
            <div className="text-[9px] uppercase font-bold text-cyan-400 mb-1 font-mono tracking-widest">
              Physical Law Verification
            </div>
            <p className="text-[10px] text-cyan-200/70 italic leading-relaxed">
              Adjust parameters in real-time to observe the instantaneous dynamic response of the physical system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
