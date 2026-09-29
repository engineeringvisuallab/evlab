import React, { useState } from 'react';
import {
  X,
  FlaskConical,
  Play,
  RotateCcw,
  Activity,
  Layers,
  Droplets,
  Building2,
  Zap,
  CheckCircle2,
  Gauge,
  Sliders,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface EngineeringLabViewProps {
  onClose: () => void;
  onEarnLabXp: (xp: number) => void;
}

type LabType = 'concrete' | 'soil' | 'fluid' | 'structural' | 'solar';

export const EngineeringLabView: React.FC<EngineeringLabViewProps> = ({
  onClose,
  onEarnLabXp,
}) => {
  const [activeLab, setActiveLab] = useState<LabType>('concrete');

  // Concrete Lab State
  const [wcRatio, setWcRatio] = useState(0.45);
  const [cureDays, setCureDays] = useState(28);
  const [appliedLoadKn, setAppliedLoadKn] = useState(0);
  const [isCrushed, setIsCrushed] = useState(false);

  // Soil Lab State
  const [moisturePct, setMoisturePct] = useState(14);
  const [compactionEffort, setCompactionEffort] = useState<'standard' | 'modified'>('standard');

  // Fluid Lab State
  const [fluidFlowLps, setFluidFlowLps] = useState(65);
  const [pipeDiameterMm, setPipeDiameterMm] = useState(150);

  // Structural Lab State
  const [beamSpanM, setBeamSpanM] = useState(6.0);
  const [pointLoadKn, setPointLoadKn] = useState(45);
  const [sectionHeightMm, setSectionHeightMm] = useState(400);

  // Solar MPPT State
  const [irradiance, setIrradiance] = useState(850);
  const [cellTempC, setCellTempC] = useState(35);

  // Concrete Calculations
  const calcConcreteMaxStrength = () => {
    const base = 75 / Math.pow(2.1, wcRatio * 3.5);
    const ageFactor = Math.log(cureDays + 1) / Math.log(29);
    return Math.round(base * Math.min(1.2, ageFactor));
  };
  const concretePeakMpa = calcConcreteMaxStrength();

  // Soil Proctor Density
  const calcDryDensity = () => {
    const optMoisture = compactionEffort === 'standard' ? 14.5 : 11.5;
    const maxDensity = compactionEffort === 'standard' ? 1.85 : 2.05;
    const diff = Math.abs(moisturePct - optMoisture);
    return (maxDensity - 0.0035 * Math.pow(diff, 2)).toFixed(3);
  };

  // Fluid Reynolds & Flow Regime
  const calcReynoldsNumber = () => {
    const d = pipeDiameterMm / 1000;
    const q = fluidFlowLps / 1000;
    const v = q / (Math.PI * Math.pow(d / 2, 2));
    const kinematicViscosity = 1e-6; // m2/s for water at 20C
    return Math.round((v * d) / kinematicViscosity);
  };
  const reynolds = calcReynoldsNumber();
  const flowRegime = reynolds < 2000 ? 'Laminar (Smooth Streamlines)' : reynolds < 4000 ? 'Transitional' : 'Turbulent (High Mixing Vortex)';

  // Structural Deflection: δ = (P*L^3)/(48*E*I)
  const calcBeamDeflection = () => {
    const L = beamSpanM * 1000; // mm
    const P = pointLoadKn * 1000; // N
    const E = 30000; // MPa
    const b = 250; // mm
    const h = sectionHeightMm; // mm
    const I = (b * Math.pow(h, 3)) / 12; // mm4
    const delta = (P * Math.pow(L, 3)) / (48 * E * I);
    const moment = (pointLoadKn * beamSpanM) / 4; // kNm
    return { deltaMm: delta.toFixed(2), momentKnM: moment.toFixed(1) };
  };
  const beamStats = calcBeamDeflection();

  // Solar MPPT Power
  const calcSolarPower = () => {
    const pMax = (irradiance / 1000) * 450 * (1 - (cellTempC - 25) * 0.004);
    return Math.max(0, pMax).toFixed(1);
  };

  const handleTestConcreteCrush = () => {
    audioEngine.playHydraulicPump();
    let current = 0;
    const interval = setInterval(() => {
      current += 60;
      setAppliedLoadKn(current);
      // 150mm cube area = 22500 mm2. 1 MPa = 22.5 kN
      const currentStress = current / 22.5;
      if (currentStress >= concretePeakMpa) {
        clearInterval(interval);
        setIsCrushed(true);
        audioEngine.playStressAlert();
        onEarnLabXp(120);
      }
    }, 50);
  };

  return (
    <div id="engineering-lab-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-slate-950 shadow-md">
              <FlaskConical className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">Virtual Engineering Research Laboratory</h2>
              <p className="text-xs text-slate-400">Garidaha Material Science & Physical Simulation Rig</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lab Switcher Tabs */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'concrete', label: '1. Concrete UTM Crush Test', icon: FlaskConical },
            { id: 'soil', label: '2. Soil Proctor Compaction', icon: Layers },
            { id: 'fluid', label: '3. Fluid Reynolds Flow Tube', icon: Droplets },
            { id: 'structural', label: '4. Beam Flexure & Bending', icon: Building2 },
            { id: 'solar', label: '5. Photovoltaic MPPT Curve', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeLab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  audioEngine.playClick(500, 0.02);
                  setActiveLab(tab.id as LabType);
                  setIsCrushed(false);
                  setAppliedLoadKn(0);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Lab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Concrete Universal Testing Machine */}
          {activeLab === 'concrete' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* SVG Hydraulic UTM Frame & Cube Specimen */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[240px]">
                  <svg viewBox="0 0 300 220" className="w-full max-w-xs">
                    {/* Machine Steel Columns */}
                    <rect x="50" y="20" width="16" height="180" fill="#475569" />
                    <rect x="234" y="20" width="16" height="180" fill="#475569" />
                    <rect x="40" y="10" width="220" height="25" fill="#334155" rx="4" />
                    <rect x="40" y="185" width="220" height="25" fill="#334155" rx="4" />

                    {/* Hydraulic Piston */}
                    <rect x="130" y="35" width="40" height={40 + (appliedLoadKn / 1000) * 8} fill="#94a3b8" />
                    <rect x="110" y={75 + (appliedLoadKn / 1000) * 8} width="80" height="15" fill="#64748b" />

                    {/* Concrete 150mm Cube Specimen */}
                    <rect
                      x="115"
                      y="92"
                      width="70"
                      height="70"
                      fill={isCrushed ? '#78716c' : '#a8a29e'}
                      stroke="#57534e"
                      strokeWidth="2"
                    />

                    {/* Fracture Shear Cracks */}
                    {isCrushed && (
                      <path
                        d="M 120 95 L 145 125 L 135 140 L 175 160 M 170 95 L 140 135 L 165 160"
                        stroke="#dc2626"
                        strokeWidth="3"
                        fill="none"
                      />
                    )}

                    <text x="150" y="215" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                      {isCrushed
                        ? `FAILED AT ${(appliedLoadKn / 22.5).toFixed(1)} MPa`
                        : `Applied Load: ${appliedLoadKn} kN (${(appliedLoadKn / 22.5).toFixed(1)} MPa)`}
                    </text>
                  </svg>
                </div>

                {/* Lab Controls & Formula Box */}
                <div className="space-y-4">
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">Water-to-Cement Ratio (w/c)</span>
                      <span className="font-mono text-cyan-400 font-bold">{wcRatio}</span>
                    </div>
                    <input
                      type="range"
                      min={0.32}
                      max={0.65}
                      step={0.01}
                      disabled={isCrushed}
                      value={wcRatio}
                      onChange={(e) => setWcRatio(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />

                    <div className="flex justify-between items-center text-xs pt-2">
                      <span className="font-bold text-slate-300">Curing Water Bath Age</span>
                      <span className="font-mono text-emerald-400 font-bold">{cureDays} Days</span>
                    </div>
                    <div className="flex gap-2">
                      {[3, 7, 14, 28, 56].map((d) => (
                        <button
                          key={d}
                          onClick={() => setCureDays(d)}
                          className={`flex-1 py-1 text-xs font-semibold rounded-lg border ${
                            cureDays === d ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 block text-[10px]">Predicted Compressive Target (Abrams Rule):</span>
                    <div className="text-base font-bold text-emerald-400">{concretePeakMpa} MPa ({Math.round(concretePeakMpa * 22.5)} kN Peak)</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleTestConcreteCrush}
                      disabled={isCrushed}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isCrushed ? 'Cube Specimen Crushed' : 'Apply Hydraulic Compression Load'}</span>
                    </button>
                    {isCrushed && (
                      <button
                        onClick={() => {
                          setIsCrushed(false);
                          setAppliedLoadKn(0);
                        }}
                        className="p-2.5 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300"
                        title="Load New Specimen"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Soil Proctor Compaction */}
          {activeLab === 'soil' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 min-h-[220px] flex items-center justify-center">
                <svg viewBox="0 0 300 180" className="w-full max-w-xs">
                  {/* Proctor Mold */}
                  <rect x="90" y="40" width="120" height="110" fill="#334155" stroke="#64748b" strokeWidth="2" rx="4" />
                  {/* Compacted Soil Lift Layers */}
                  <rect x="94" y="115" width="112" height="32" fill="#78350f" />
                  <rect x="94" y="80" width="112" height="32" fill="#92400e" />
                  <rect x="94" y="45" width="112" height="32" fill="#b45309" />
                  {/* Drop Hammer */}
                  <rect x="144" y="10" width="12" height="60" fill="#94a3b8" />
                  <text x="150" y="170" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Dry Density ρ_d = {calcDryDensity()} g/cm³
                  </text>
                </svg>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Moisture Content (w)</span>
                    <span className="font-mono text-cyan-400 font-bold">{moisturePct}%</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={22}
                    step={0.5}
                    value={moisturePct}
                    onChange={(e) => setMoisturePct(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />

                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="font-bold text-slate-300">Compaction Standard</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCompactionEffort('standard')}
                        className={`px-3 py-1 text-xs rounded-lg border ${
                          compactionEffort === 'standard' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        Standard (2.5kg)
                      </button>
                      <button
                        onClick={() => setCompactionEffort('modified')}
                        className={`px-3 py-1 text-xs rounded-lg border ${
                          compactionEffort === 'modified' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        Modified (4.5kg)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-slate-300">
                  <span className="text-emerald-400 font-bold">Zero Air Voids Line (ZAV): </span>
                  Optimal moisture for maximum soil particle interlock is reached at ~14.5% moisture under standard compaction.
                </div>
              </div>
            </div>
          )}

          {/* 3. Fluid Reynolds Flow Tube */}
          {activeLab === 'fluid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 min-h-[220px] flex items-center justify-center">
                <svg viewBox="0 0 320 180" className="w-full max-w-xs">
                  {/* Acrylic Transparent Tube */}
                  <rect x="20" y="55" width="280" height="70" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" rx="6" />

                  {/* Dye Filament Line: Straight if Laminar, Swirling if Turbulent */}
                  {reynolds < 2000 ? (
                    <line x1="25" y1="90" x2="295" y2="90" stroke="#f43f5e" strokeWidth="3" />
                  ) : (
                    <path
                      d="M 25 90 Q 90 75 140 105 T 220 80 T 295 100"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="3.5"
                      className="animate-pulse"
                    />
                  )}

                  {/* Water Flow Arrow particles */}
                  <polygon points="120,70 135,75 120,80" fill="#0284c7" />
                  <polygon points="200,100 215,105 200,110" fill="#0284c7" />

                  <text x="160" y="150" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Re = {reynolds.toLocaleString()}
                  </text>
                  <text x="160" y="168" fill="#f43f5e" fontSize="10" textAnchor="middle">
                    {flowRegime}
                  </text>
                </svg>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Flow Discharge (Q)</span>
                    <span className="font-mono text-cyan-400 font-bold">{fluidFlowLps} L/s</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={1}
                    value={fluidFlowLps}
                    onChange={(e) => setFluidFlowLps(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />

                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="font-bold text-slate-300">Pipe Diameter (D)</span>
                    <span className="font-mono text-cyan-400 font-bold">{pipeDiameterMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={300}
                    step={10}
                    value={pipeDiameterMm}
                    onChange={(e) => setPipeDiameterMm(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-xs text-slate-300">
                  <span className="text-cyan-400 font-bold">Reynolds Criterion: </span>
                  Re = (v × D)/ν. Critical threshold Re &lt; 2300 ensures smooth laminar flow with predictable friction factor f = 64/Re.
                </div>
              </div>
            </div>
          )}

          {/* 4. Structural Beam Flexure */}
          {activeLab === 'structural' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 min-h-[220px] flex items-center justify-center">
                <svg viewBox="0 0 320 180" className="w-full max-w-xs">
                  {/* Pin and Roller Supports */}
                  <polygon points="35,120 45,135 25,135" fill="#64748b" />
                  <polygon points="285,120 295,135 275,135" fill="#64748b" />
                  <circle cx="285" cy="138" r="3" fill="#94a3b8" />

                  {/* Beam with deflected curvature */}
                  <path
                    d={`M 35 110 Q 160 ${110 + parseFloat(beamStats.deltaMm) * 3.5} 285 110`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="12"
                  />

                  {/* Applied Point Load Arrow */}
                  <line x1="160" y1="45" x2="160" y2="100" stroke="#f43f5e" strokeWidth="3.5" />
                  <polygon points="155,90 160,105 165,90" fill="#f43f5e" />
                  <text x="160" y="38" fill="#f43f5e" fontSize="11" fontWeight="bold" textAnchor="middle">
                    P = {pointLoadKn} kN
                  </text>

                  <text x="160" y="160" fill="#facc15" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Max Deflection: {beamStats.deltaMm} mm | M_max: {beamStats.momentKnM} kN·m
                  </text>
                </svg>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Beam Span (L)</span>
                    <span className="font-mono text-purple-400 font-bold">{beamSpanM} m</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    step={0.5}
                    value={beamSpanM}
                    onChange={(e) => setBeamSpanM(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />

                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="font-bold text-slate-300">Point Load (P)</span>
                    <span className="font-mono text-rose-400 font-bold">{pointLoadKn} kN</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={5}
                    value={pointLoadKn}
                    onChange={(e) => setPointLoadKn(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. Photovoltaic MPPT Curve */}
          {activeLab === 'solar' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 min-h-[220px] flex items-center justify-center">
                <svg viewBox="0 0 300 180" className="w-full max-w-xs">
                  {/* Axis */}
                  <line x1="40" y1="140" x2="270" y2="140" stroke="#64748b" strokeWidth="1.5" />
                  <line x1="40" y1="140" x2="40" y2="20" stroke="#64748b" strokeWidth="1.5" />

                  {/* I-V Characteristic Curve */}
                  <path
                    d={`M 40 40 Q 200 45 230 140`}
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="3"
                  />

                  {/* Maximum Power Point (MPP) Dot */}
                  <circle cx="195" cy="58" r="5.5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="195" y="48" fill="#f97316" fontSize="10" fontWeight="bold" textAnchor="middle">MPP</text>

                  <text x="160" y="165" fill="#eab308" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Peak Power Yield: {calcSolarPower()} Watts
                  </text>
                </svg>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Solar Irradiance (G)</span>
                    <span className="font-mono text-amber-400 font-bold">{irradiance} W/m²</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={1200}
                    step={25}
                    value={irradiance}
                    onChange={(e) => setIrradiance(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />

                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="font-bold text-slate-300">Cell Temperature (T_cell)</span>
                    <span className="font-mono text-orange-400 font-bold">{cellTempC} °C</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={65}
                    step={1}
                    value={cellTempC}
                    onChange={(e) => setCellTempC(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
