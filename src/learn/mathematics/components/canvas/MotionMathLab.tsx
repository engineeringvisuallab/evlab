import React, { useState, useEffect } from "react";
import { MathFormula } from "../MathFormula";
import { Gauge, Play, Pause, RotateCcw, Zap, Car, TrendingUp } from "lucide-react";
import { MathEngine } from "../../engine/mathEngine";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const MotionMathLab: React.FC<Props> = ({ variables, onVariableChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const initialPos = variables.initialPos ?? 0;
  const initialVel = variables.initialVel ?? 10;
  const acceleration = variables.acceleration ?? 2.0;
  const vehicleMass = variables.vehicleMass ?? 1500; // kg (Tesla/EV sedan)

  // Simulation time max: 10 seconds
  const T_MAX = 10;

  // Animation Loop
  useEffect(() => {
    let animId: number;
    let lastStamp = performance.now();

    const updateFrame = (stamp: number) => {
      const dt = (stamp - lastStamp) / 1000;
      lastStamp = stamp;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + dt;
          if (next >= T_MAX) {
            setIsPlaying(false);
            return T_MAX;
          }
          return next;
        });
      }
      if (isPlaying) {
        animId = requestAnimationFrame(updateFrame);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(updateFrame);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Current kinematic values at currentTime
  const currentS = initialPos + initialVel * currentTime + 0.5 * acceleration * currentTime * currentTime;
  const currentV = Math.max(0, initialVel + acceleration * currentTime);
  const currentA = acceleration;
  const kineticEnergyKJ = (0.5 * vehicleMass * currentV * currentV) / 1000;
  const powerKW = (vehicleMass * currentA * currentV) / 1000;

  // Profile data for graphs
  const profileData = MathEngine.computeKinematicsProfile(initialPos, initialVel, acceleration, T_MAX, 40);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Car className="text-cyan-400" size={18} />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Motion Mathematics & EV Kinematics Lab
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/50">
            s(t) → v(t) → a(t)
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md ${
              isPlaying ? "bg-amber-600 text-white" : "bg-cyan-600 text-white hover:bg-cyan-500"
            }`}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "Pause" : "Simulate EV Run"}</span>
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset Time"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main Visual Stage: Road & Vehicle Animation */}
      <div className="p-4 bg-slate-950 flex flex-col space-y-4">
        {/* Road Track View */}
        <div className="relative w-full h-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-end pb-3 px-4">
          {/* Distance Ticks on Road */}
          <div className="absolute left-0 right-0 bottom-7 h-0.5 bg-slate-700" />
          <div className="absolute left-0 right-0 bottom-4 flex justify-between px-4 text-[10px] font-mono text-slate-400">
            <span>0 m</span>
            <span>50 m</span>
            <span>100 m</span>
            <span>150 m</span>
            <span>200+ m</span>
          </div>

          {/* Moving EV Vehicle Body */}
          <div
            className="relative transition-transform duration-75 flex items-center gap-2"
            style={{
              transform: `translateX(${Math.min(520, (currentS / 200) * 520)}px)`,
            }}
          >
            <div className="p-2 rounded-lg bg-cyan-600 border border-cyan-400 text-white shadow-lg flex items-center gap-1.5">
              <Car size={20} className="text-cyan-200 animate-pulse" />
              <div className="text-[10px] font-mono font-bold">
                {currentV.toFixed(1)} m/s
              </div>
            </div>
          </div>
        </div>

        {/* Triple Synchronized Graphs: s(t), v(t), a(t) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Position s(t) */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-blue-400 font-bold">Position s(t) = ∫ v dt</span>
              <span className="text-white font-bold">{currentS.toFixed(1)} m</span>
            </div>
            <div className="h-16 bg-slate-950 rounded border border-slate-800 relative flex items-end p-1">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  points={profileData.map((d) => `${(d.t / T_MAX) * 100},${40 - (d.s / 200) * 35}`).join(" ")}
                />
                <circle cx={(currentTime / T_MAX) * 100} cy={40 - (currentS / 200) * 35} r="3" fill="#ffffff" />
              </svg>
            </div>
          </div>

          {/* Velocity v(t) */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-emerald-400 font-bold">Velocity v(t) = s'(t)</span>
              <span className="text-white font-bold">{(currentV * 3.6).toFixed(1)} km/h</span>
            </div>
            <div className="h-16 bg-slate-950 rounded border border-slate-800 relative flex items-end p-1">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  points={profileData.map((d) => `${(d.t / T_MAX) * 100},${40 - (d.v / 40) * 35}`).join(" ")}
                />
                <circle cx={(currentTime / T_MAX) * 100} cy={40 - (currentV / 40) * 35} r="3" fill="#ffffff" />
              </svg>
            </div>
          </div>

          {/* Acceleration a(t) */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-amber-400 font-bold">Acceleration a(t) = v'(t)</span>
              <span className="text-white font-bold">{currentA.toFixed(1)} m/s²</span>
            </div>
            <div className="h-16 bg-slate-950 rounded border border-slate-800 relative flex items-end p-1">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  points={profileData.map((d) => `${(d.t / T_MAX) * 100},${40 - (d.a / 8) * 35}`).join(" ")}
                />
                <circle cx={(currentTime / T_MAX) * 100} cy={40 - (currentA / 8) * 35} r="3" fill="#ffffff" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Time Scrubber & Live Energy Breakdown */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Scrubber */}
        <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex justify-between text-[11px] font-mono text-slate-300">
            <span>Time Scrubber t</span>
            <span className="text-cyan-400 font-bold">{currentTime.toFixed(2)} s / {T_MAX} s</span>
          </div>
          <input
            type="range"
            min="0"
            max={T_MAX}
            step="0.05"
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>Initial Velocity v₀ = {initialVel} m/s</span>
            <span>Accel a = {acceleration} m/s²</span>
          </div>
        </div>

        {/* EV Energy & Power Card */}
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold flex items-center gap-1">
              <Zap size={13} className="text-amber-400" />
              <span>EV Kinetic Energy & Mechanical Power</span>
            </span>
            <div className="text-slate-200 text-[11px]">
              <MathFormula formula={`E_k = \\frac{1}{2}mv^2 = ${kineticEnergyKJ.toFixed(1)}\\text{ kJ}, \\quad P = F \\cdot v = ${powerKW.toFixed(1)}\\text{ kW}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
