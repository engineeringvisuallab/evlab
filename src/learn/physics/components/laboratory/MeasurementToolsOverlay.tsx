import React, { useState, useRef } from 'react';
import { Timer, Ruler, RotateCcw, Play, Pause, Flag, X, Compass, Gauge, Zap, Activity } from 'lucide-react';
import { formatValue } from '../../utils/physicsMath';

interface MeasurementToolsOverlayProps {
  activeTools: string[];
  onToggleTool: (toolId: string) => void;
  simulationTime: number;
  currentObservables?: Record<string, any>;
}

export const MeasurementToolsOverlay: React.FC<MeasurementToolsOverlayProps> = ({
  activeTools,
  onToggleTool,
  simulationTime,
  currentObservables = {},
}) => {
  const obs = (currentObservables || {}) as Record<string, any>;

  // Draggable tool positions
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({
    stopwatch: { x: 20, y: 30 },
    ruler: { x: 120, y: 160 },
    protractor: { x: 280, y: 80 },
    pressureGauge: { x: 20, y: 220 },
    voltmeter: { x: 240, y: 60 },
    speedRadar: { x: 340, y: 220 },
  });

  // Stopwatch state
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchElapsed, setStopwatchElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  // Ruler state
  const [rulerLength, setRulerLength] = useState(300); // pixels
  const [rulerAngle, setRulerAngle] = useState(0); // degrees

  // Protractor angle
  const [protractorAngle, setProtractorAngle] = useState(45);

  // Dragging logic
  const [draggingTool, setDraggingTool] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({
    mouseX: 0,
    mouseY: 0,
    initialX: 0,
    initialY: 0,
  });

  const handleMouseDown = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingTool(toolId);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: positions[toolId]?.x || 20,
      initialY: positions[toolId]?.y || 20,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingTool) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    setPositions((prev) => ({
      ...prev,
      [draggingTool]: {
        x: Math.max(10, Math.min(window.innerWidth - 300, dragStartRef.current.initialX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 200, dragStartRef.current.initialY + dy)),
      },
    }));
  };

  const handleMouseUp = () => {
    setDraggingTool(null);
  };

  // Stopwatch Controls
  const toggleStopwatch = () => {
    if (stopwatchRunning) {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
      setStopwatchRunning(false);
    } else {
      setStopwatchRunning(true);
      const startTime = Date.now() - stopwatchElapsed * 1000;
      stopwatchRef.current = setInterval(() => {
        setStopwatchElapsed((Date.now() - startTime) / 1000);
      }, 10);
    }
  };

  const resetStopwatch = () => {
    if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    setStopwatchRunning(false);
    setStopwatchElapsed(0);
    setLaps([]);
  };

  const addLap = () => {
    setLaps((prev) => [stopwatchElapsed, ...prev.slice(0, 3)]);
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 1. Precision Digital Stopwatch */}
      {activeTools.includes('stopwatch') && (
        <div
          id="tool-stopwatch"
          style={{ left: positions.stopwatch.x, top: positions.stopwatch.y }}
          className="absolute pointer-events-auto w-56 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md text-[#E0E0E0] p-3 select-none"
        >
          <div
            className="flex items-center justify-between cursor-move pb-2 mb-2 border-b border-white/10 text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase"
            onMouseDown={(e) => handleMouseDown('stopwatch', e)}
          >
            <span className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-cyan-400" /> Digital Chrono
            </span>
            <button
              onClick={() => onToggleTool('stopwatch')}
              className="text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time Display */}
          <div className="bg-[#050505] border border-white/10 rounded-lg p-2 text-center mb-2 font-mono">
            <div className="text-xl font-bold text-cyan-400 tracking-wider">
              {stopwatchElapsed.toFixed(2)}
              <span className="text-xs text-white/40 ml-1">s</span>
            </div>
            <div className="text-[10px] text-white/40 mt-0.5">
              SIM CLOCK: {simulationTime.toFixed(2)}s
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-3 gap-1 mb-2 font-mono">
            <button
              onClick={toggleStopwatch}
              className={`py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                stopwatchRunning
                  ? 'bg-orange-500 hover:bg-orange-400 text-black'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-black'
              }`}
            >
              {stopwatchRunning ? 'PAUSE' : 'START'}
            </button>
            <button
              onClick={addLap}
              disabled={!stopwatchRunning}
              className="py-1 bg-[#050505] hover:bg-white/5 border border-white/10 disabled:opacity-30 rounded text-[10px] text-white/80"
            >
              LAP
            </button>
            <button
              onClick={resetStopwatch}
              className="py-1 bg-[#050505] hover:bg-white/5 border border-white/10 rounded text-[10px] text-white/80"
            >
              RESET
            </button>
          </div>

          {/* Laps List */}
          {laps.length > 0 && (
            <div className="space-y-0.5 border-t border-white/5 pt-1 text-[10px] font-mono text-white/60">
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between">
                  <span>Lap {laps.length - i}:</span>
                  <span className="text-cyan-400">{lap.toFixed(2)}s</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Interactive Precision Ruler */}
      {activeTools.includes('ruler') && (
        <div
          id="tool-ruler"
          style={{
            left: positions.ruler.x,
            top: positions.ruler.y,
            transform: `rotate(${rulerAngle}deg)`,
            transformOrigin: '0 0',
          }}
          className="absolute pointer-events-auto bg-[#0A0A0A] border border-white/10 shadow-2xl rounded-lg text-[#E0E0E0] select-none p-2"
        >
          <div
            className="flex items-center justify-between cursor-move pb-1 mb-1 border-b border-white/10 text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wider"
            onMouseDown={(e) => handleMouseDown('ruler', e)}
          >
            <span className="flex items-center gap-1">
              <Ruler className="w-3 h-3 text-orange-400" /> Metric Ruler
            </span>
            <button
              onClick={() => onToggleTool('ruler')}
              className="text-white/40 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Scaled tick marks */}
          <div
            style={{ width: `${rulerLength}px` }}
            className="h-10 bg-[#050505] border border-white/10 rounded relative flex items-end overflow-hidden"
          >
            {Array.from({ length: 31 }).map((_, i) => (
              <div
                key={i}
                style={{ left: `${(i / 30) * 100}%` }}
                className={`absolute bottom-0 bg-white/40 ${
                  i % 10 === 0 ? 'h-5 w-0.5 bg-orange-400' : i % 5 === 0 ? 'h-3.5 w-0.5' : 'h-2 w-px'
                }`}
              >
                {i % 10 === 0 && (
                  <span className="absolute -top-4 -left-1 text-[8px] font-mono text-orange-400">
                    {i / 10}m
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-white/40">
            <span>Length: 3.0 m (300px)</span>
            <span
              className="text-cyan-400 cursor-pointer hover:underline"
              onClick={() => setRulerAngle((a) => (a + 45) % 360)}
            >
              Rotate: {rulerAngle}°
            </span>
          </div>
        </div>
      )}

      {/* 3. Protractor */}
      {activeTools.includes('protractor') && (
        <div
          id="tool-protractor"
          style={{ left: positions.protractor.x, top: positions.protractor.y }}
          className="absolute pointer-events-auto w-56 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md text-[#E0E0E0] p-3 select-none"
        >
          <div
            className="flex items-center justify-between cursor-move pb-2 mb-2 border-b border-white/10 text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase"
            onMouseDown={(e) => handleMouseDown('protractor', e)}
          >
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" /> Digital Protractor
            </span>
            <button
              onClick={() => onToggleTool('protractor')}
              className="text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative w-48 h-24 mx-auto border-b-2 border-cyan-500 flex items-end justify-center overflow-hidden">
            <div className="absolute inset-0 border-t-2 border-x-2 border-cyan-500/40 rounded-t-full" />
            <div
              style={{
                transform: `rotate(${-protractorAngle}deg)`,
                transformOrigin: 'bottom center',
              }}
              className="w-0.5 h-20 bg-orange-400 transition-transform duration-75 shadow-lg"
            />
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full z-10" />
          </div>

          <div className="mt-3 flex items-center justify-between bg-[#050505] border border-white/10 rounded px-2.5 py-1.5 font-mono">
            <span className="text-xs text-white/40">ANGLE:</span>
            <span className="text-sm font-bold text-cyan-400">
              {protractorAngle.toFixed(1)}°
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            value={protractorAngle}
            onChange={(e) => setProtractorAngle(Number(e.target.value))}
            className="w-full mt-2 h-1.5 accent-cyan-500 bg-white/10 rounded-full cursor-pointer"
          />
        </div>
      )}

      {/* 4. Pressure Gauge Sensor */}
      {activeTools.includes('pressureGauge') && (
        <div
          id="tool-pressure"
          style={{ left: positions.pressureGauge.x, top: positions.pressureGauge.y }}
          className="absolute pointer-events-auto w-60 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md text-[#E0E0E0] p-3 select-none"
        >
          <div
            className="flex items-center justify-between cursor-move pb-2 mb-2 border-b border-white/10 text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase"
            onMouseDown={(e) => handleMouseDown('pressureGauge', e)}
          >
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Hydrostatic Probe
            </span>
            <button
              onClick={() => onToggleTool('pressureGauge')}
              className="text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-lg p-2.5 text-center font-mono">
            <div className="text-[10px] text-white/40 uppercase">Absolute Pressure (P)</div>
            <div className="text-lg font-bold text-cyan-400">
              {formatValue(obs.pressure || 101.3, 2)}
              <span className="text-xs text-white/40 ml-1">kPa</span>
            </div>
            <div className="text-[10px] text-white/40 mt-1 flex justify-between px-1">
              <span>Gauge: {formatValue((obs.pressure || 101.3) - 101.325, 2)} kPa</span>
              <span>Depth: {formatValue(obs.depth || 0, 1)} cm</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Multimeter / Voltmeter */}
      {activeTools.includes('voltmeter') && (
        <div
          id="tool-voltmeter"
          style={{ left: positions.voltmeter.x, top: positions.voltmeter.y }}
          className="absolute pointer-events-auto w-64 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md text-[#E0E0E0] p-3 select-none"
        >
          <div
            className="flex items-center justify-between cursor-move pb-2 mb-2 border-b border-white/10 text-xs font-mono font-bold text-yellow-400 tracking-wider uppercase"
            onMouseDown={(e) => handleMouseDown('voltmeter', e)}
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Digital Multimeter
            </span>
            <button
              onClick={() => onToggleTool('voltmeter')}
              className="text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-[#050505] border border-white/10 rounded-lg p-2 text-center font-mono">
            <div>
              <div className="text-[9px] text-white/40 uppercase">Voltage (V)</div>
              <div className="text-base font-bold text-yellow-400">
                {formatValue(obs.voltage || 0, 2)} V
              </div>
            </div>
            <div>
              <div className="text-[9px] text-white/40 uppercase">Current (I)</div>
              <div className="text-base font-bold text-cyan-400">
                {formatValue(obs.current || 0, 3)} A
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Speed & Acceleration Radar */}
      {activeTools.includes('speedRadar') && (
        <div
          id="tool-speedRadar"
          style={{ left: positions.speedRadar.x, top: positions.speedRadar.y }}
          className="absolute pointer-events-auto w-60 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md text-[#E0E0E0] p-3 select-none"
        >
          <div
            className="flex items-center justify-between cursor-move pb-2 mb-2 border-b border-white/10 text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase"
            onMouseDown={(e) => handleMouseDown('speedRadar', e)}
          >
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Kinematic Radar
            </span>
            <button
              onClick={() => onToggleTool('speedRadar')}
              className="text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-[#050505] border border-white/10 rounded-lg p-2 text-center font-mono">
            <div>
              <div className="text-[9px] text-white/40 uppercase">Instant Speed</div>
              <div className="text-sm font-bold text-cyan-400">
                {formatValue(obs.velocity || 0, 2)}
                <span className="text-[9px] text-white/40 ml-0.5">m/s</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-white/40 uppercase">Acceleration</div>
              <div className="text-sm font-bold text-orange-400">
                {formatValue(obs.acceleration || 0, 2)}
                <span className="text-[9px] text-white/40 ml-0.5">m/s²</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
