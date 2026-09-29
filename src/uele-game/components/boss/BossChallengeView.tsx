import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Zap,
  Activity,
  Flame,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';
import confetti from 'canvas-confetti';

interface BossChallengeViewProps {
  onClose: () => void;
  onBossVictory: (rewards: { xp: number; budget: number }) => void;
}

export const BossChallengeView: React.FC<BossChallengeViewProps> = ({
  onClose,
  onBossVictory,
}) => {
  // Flood Boss Emergency Parameters
  const [weirGatePct, setWeirGatePct] = useState(30);
  const [pumpsOnline, setPumpsOnline] = useState(2);
  const [sandbagElevationM, setSandbagElevationM] = useState(0.4);
  const [retentionTransferM3s, setRetentionTransferM3s] = useState(45);

  const [isSimulating, setIsSimulating] = useState(false);
  const [surgeStep, setSurgeStep] = useState(0);
  const [battleState, setBattleState] = useState<'briefing' | 'surging' | 'victory' | 'breach'>('briefing');

  // Real-time hydrograph physics
  const riverInflow = 420; // m3/s peak monsoon storm
  const riverWallBaseCap = 280; // m3/s
  const effectiveCapacity =
    riverWallBaseCap + (weirGatePct / 100) * 80 + pumpsOnline * 20 + retentionTransferM3s;
  const floodSurplus = Math.max(0, riverInflow - effectiveCapacity);
  const peakRiverStage = 16.0 + floodSurplus * 0.035 - sandbagElevationM * 0.5;
  const leveeOvertoppingRisk = peakRiverStage > 16.85;

  const handleLaunchEmergencyResponse = () => {
    setIsSimulating(true);
    setBattleState('surging');
    audioEngine.playStressAlert();

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setSurgeStep(step);

      if (step >= 5) {
        clearInterval(interval);
        setIsSimulating(false);

        if (leveeOvertoppingRisk || effectiveCapacity < riverInflow * 0.92) {
          setBattleState('breach');
          audioEngine.playStressAlert();
        } else {
          setBattleState('victory');
          audioEngine.playSuccessChime();
          confetti({ particleCount: 120, spread: 80 });
          onBossVictory({ xp: 1500, budget: 100000 });
        }
      }
    }, 600);
  };

  return (
    <div id="boss-challenge-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Boss Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-500/30 bg-rose-950/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-500/30 animate-pulse">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold text-rose-400 tracking-wider">
                  MEGA-ENGINEERING BOSS CRISIS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-900/80 text-rose-200 border border-rose-500/40 font-bold">
                  Catastrophe Level 5
                </span>
              </div>
              <h2 className="font-black text-lg text-slate-100">The Great Karatoya River Monsoon Surge</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boss Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Situation Card */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between">
            <div className="space-y-1.5 flex-1 text-xs">
              <span className="text-rose-400 font-bold uppercase text-[10px] tracking-wider block">Crisis Alert</span>
              <p className="text-slate-200 leading-relaxed">
                A 50-year return period cyclone has generated an unprecedented flood surge of <strong>420 m³/s</strong> in the Karatoya River.
                Without precise multi-district engineering intervention, 12,000 homes in Bhabanipur and Mirzapur will be inundated.
              </p>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center min-w-[170px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Bounty Contract</span>
              <div className="text-lg font-black text-amber-400">+$100,000</div>
              <span className="text-[10px] font-bold text-purple-400">+1,500 Master XP</span>
            </div>
          </div>

          {/* Real-time Dynamic Hydrograph Simulation Canvas */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 relative">
            <svg viewBox="0 0 500 160" className="w-full h-40">
              {/* River Channel Bed & Levee */}
              <polygon points="20,120 120,120 140,70 160,70 180,120 320,120 340,70 360,70 380,120 480,120" fill="#1e293b" />
              {/* Sandbag crest extensions */}
              <rect x="140" y={70 - sandbagElevationM * 20} width="20" height={sandbagElevationM * 20} fill="#d97706" />
              <rect x="340" y={70 - sandbagElevationM * 20} width="20" height={sandbagElevationM * 20} fill="#d97706" />

              {/* Water Stage */}
              <rect
                x="142"
                y={120 - (peakRiverStage - 14.5) * 16}
                width="216"
                height={(peakRiverStage - 14.5) * 16}
                fill="#0284c7"
                opacity="0.85"
                className={isSimulating ? 'animate-pulse' : ''}
              />

              {/* Weir Diverter & Pump Discharge indicators */}
              <text x="70" y="145" fill="#38bdf8" fontSize="10" textAnchor="middle">Weir Gate: {weirGatePct}%</text>
              <text x="250" y="50" fill={leveeOvertoppingRisk ? '#f43f5e' : '#38bdf8'} fontSize="11" fontWeight="bold" textAnchor="middle">
                Stage Level: {peakRiverStage.toFixed(2)} m (Crest: {(16.85 + sandbagElevationM * 0.5).toFixed(2)} m)
              </text>
              <text x="430" y="145" fill="#a855f7" fontSize="10" textAnchor="middle">Pumps: {pumpsOnline}/4 Online</text>
            </svg>

            {isSimulating && (
              <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-rose-400 font-black text-sm tracking-widest animate-bounce">
                    CRITICAL SURGE PROPAGATING • STEP {surgeStep}/5
                  </div>
                  <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden mx-auto">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(surgeStep / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Emergency Dispatch Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Weir Spillway Gate Aperture</span>
                <span className="font-mono text-cyan-400 font-bold">{weirGatePct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                disabled={isSimulating}
                value={weirGatePct}
                onChange={(e) => setWeirGatePct(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Auxiliary Storm Pumps Online</span>
                <span className="font-mono text-purple-400 font-bold">{pumpsOnline} / 4 Units</span>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    disabled={isSimulating}
                    onClick={() => setPumpsOnline(n)}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold border ${
                      pumpsOnline === n ? 'bg-purple-600 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Geotextile Sandbag Crest Height</span>
                <span className="font-mono text-amber-400 font-bold">+{sandbagElevationM} m</span>
              </div>
              <input
                type="range"
                min={0}
                max={1.0}
                step={0.1}
                disabled={isSimulating}
                value={sandbagElevationM}
                onChange={(e) => setSandbagElevationM(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Retention Basin Transfer Rate</span>
                <span className="font-mono text-emerald-400 font-bold">{retentionTransferM3s} m³/s</span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                step={5}
                disabled={isSimulating}
                value={retentionTransferM3s}
                onChange={(e) => setRetentionTransferM3s(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </div>

          {/* Outcome Status Banners */}
          {battleState === 'breach' && (
            <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/60 text-white space-y-1 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>CATASTROPHIC LEVEE BREACH</span>
              </div>
              <p className="text-xs text-slate-300">
                Inflow (420 m³/s) exceeded active diversion capacity ({effectiveCapacity.toFixed(0)} m³/s). Peak water level overtopped the embankment.
                Increase weir gate opening, spin up auxiliary pumps, and add sandbag crest freeboard.
              </p>
            </div>
          )}

          {battleState === 'victory' && (
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/60 text-white space-y-1 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>BOSS OVERCOME — SHERPUR BASIN DEFENDED</span>
              </div>
              <p className="text-xs text-slate-300">
                Peak flood volume routed safely into retention basins. River stage contained at {peakRiverStage.toFixed(2)}m without overtopping.
                You have received the Master Flood Mitigation Citation and +$100,000 capital.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={() => {
              setWeirGatePct(30);
              setPumpsOnline(2);
              setSandbagElevationM(0.4);
              setRetentionTransferM3s(45);
              setBattleState('briefing');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
          >
            Reset
          </button>
          <button
            id="btn-deploy-boss-emergency"
            disabled={isSimulating}
            onClick={handleLaunchEmergencyResponse}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isSimulating ? 'Surge In Progress...' : 'Execute Emergency Defense Protocol'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
