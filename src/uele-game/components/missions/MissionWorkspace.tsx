import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  Info,
  Award,
  Sparkles,
} from 'lucide-react';
import { Mission, FailureReport, TargetCriterion } from '../../types/game';
import { audioEngine } from '../../utils/audioEngine';
import confetti from 'canvas-confetti';

interface MissionWorkspaceProps {
  mission: Mission;
  onClose: () => void;
  onMissionSuccess: (missionId: string, rewards: { xp: Record<string, number>; budget: number }) => void;
}

export const MissionWorkspace: React.FC<MissionWorkspaceProps> = ({
  mission,
  onClose,
  onMissionSuccess,
}) => {
  const [params, setParams] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    Object.entries(mission.initialParameters).forEach(([k, v]) => {
      init[k] = typeof v === 'number' ? v : 0;
    });
    return init;
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [outcome, setOutcome] = useState<'idle' | 'success' | 'failure'>('idle');
  const [failureReport, setFailureReport] = useState<FailureReport | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<Record<string, number>>({});
  const [showHint, setShowHint] = useState(false);

  // Compute real engineering formulas depending on mission type
  const calculateEngineeringMetrics = (currentParams: Record<string, number>) => {
    const metrics: Record<string, number> = {};

    if (mission.interactiveType === 'water_network') {
      const D = currentParams.pipeDiameterMm / 1000; // meters
      const Q = currentParams.flowRateLps / 1000; // m3/s
      const H_pump = currentParams.pumpHeadMeters;
      const C = currentParams.pipeRoughnessC;
      const L = 1450; // meters
      const elevationGain = 8.5; // meters

      const area = Math.PI * Math.pow(D / 2, 2);
      const velocity = Q / area;
      // Hazen-Williams head loss
      const h_f = (10.67 * L * Math.pow(Q, 1.852)) / (Math.pow(C, 1.852) * Math.pow(D, 4.87));
      const residualHead = H_pump - elevationGain - h_f;
      const terminalPressureKpa = Math.max(0, residualHead * 9.81);
      const powerKw = (9.81 * Q * H_pump) / 0.78; // 78% pump efficiency

      metrics.velocity = Number(velocity.toFixed(2));
      metrics.frictionHeadLoss = Number(h_f.toFixed(2));
      metrics.terminalPressure = Number(terminalPressureKpa.toFixed(1));
      metrics.pumpPowerKw = Number(powerKw.toFixed(1));
    } else if (mission.interactiveType === 'drainage_hydraulic') {
      const W = currentParams.culvertWidthM;
      const H = currentParams.culvertHeightM;
      const S = currentParams.channelSlopePct / 100;
      const n = currentParams.manningRoughness;
      const I = currentParams.stormIntensityMmHr;
      const A_catchment = 14.5; // ha
      const C_runoff = 0.65;

      // Peak Runoff Q = C*I*A / 360
      const Q_peak = (C_runoff * I * A_catchment) / 360; // m3/s
      // Full flow capacity
      const Area_full = W * H;
      const P_wetted = W + 2 * H;
      const R_h = Area_full / P_wetted;
      const V_full = (1 / n) * Math.pow(R_h, 2 / 3) * Math.pow(S, 0.5);
      const Q_cap = Area_full * V_full;

      const waterDepthRatio = Math.min(1.2, Q_peak / Math.max(0.1, Q_cap));
      const actualWaterDepth = H * Math.min(1.0, waterDepthRatio);
      const freeboardMm = Math.max(0, (H - actualWaterDepth) * 1000);
      const velocity = Math.min(V_full, Q_peak / (W * Math.max(0.1, actualWaterDepth)));

      metrics.culvertCapacity = Number(Q_cap.toFixed(2));
      metrics.waterDepthRatio = Number(waterDepthRatio.toFixed(2));
      metrics.flowVelocity = Number(velocity.toFixed(2));
      metrics.freeboardMm = Number(freeboardMm.toFixed(0));
    } else if (mission.interactiveType === 'bridge_structural') {
      const depth = currentParams.girderDepthMm / 1000;
      const width = currentParams.flangeWidthMm / 1000;
      const P_eff = currentParams.prestressForceKn;
      const girders = currentParams.numberOfGirders;
      const e = currentParams.tendonEccentricityMm / 1000;
      const L = 36.0;
      const M_live = 4850 / girders;

      // Section properties
      const A_section = width * 0.25 + 0.2 * (depth - 0.5) + width * 0.25;
      const I_section = (width * Math.pow(depth, 3)) / 12;
      const Z_bottom = I_section / (depth / 2);

      // Stress at bottom fiber: σ_b = P/A + P*e/Z - M/Z
      const sigma_bottom = P_eff / (A_section * 1000) + (P_eff * e) / (Z_bottom * 1000) - M_live / (Z_bottom * 1000);
      // Deflection δ = 5*w*L^4 / (384*E*I) - P*e*L^2 / (8*E*I)
      const E = 35000; // MPa
      const delta_live = ((5 * (M_live / 8) * Math.pow(L, 2)) / (48 * E * (I_section * 1e6))) * 1000;
      const deflectionMm = Math.max(2, delta_live * 1.5);
      const fos = (P_eff * depth * 0.9) / (M_live + 500);

      metrics.factorOfSafety = Number(Math.max(0.8, fos).toFixed(2));
      metrics.midspanDeflectionMm = Number(deflectionMm.toFixed(1));
      metrics.bottomTensileStressMpa = Number(Math.max(0, -sigma_bottom).toFixed(2));
      metrics.steelTensionRatio = Number((P_eff / (girders * 1860 * 2.5)).toFixed(2));
    } else if (mission.interactiveType === 'concrete_mix') {
      const wc = currentParams.waterCementRatio;
      const cement = currentParams.cementKgM3;
      const admixture = currentParams.admixturePct;

      // Compressive strength formula
      const strength = (85 / Math.pow(1.9, wc * 3.2)) * (1 + (cement - 350) * 0.001);
      // Slump
      const slump = (wc - 0.38) * 450 + admixture * 70;
      const economy = cement / Math.max(1, strength);
      const bleed = Math.max(2, (wc - 0.45) * 60 - admixture * 10);

      metrics.strength28DayMpa = Number(strength.toFixed(1));
      metrics.slumpMm = Number(Math.max(10, slump).toFixed(0));
      metrics.cementEconomyKgMpa = Number(economy.toFixed(2));
      metrics.bleedingRiskScore = Number(Math.max(1, bleed).toFixed(1));
    } else if (mission.interactiveType === 'column_shear') {
      const s = currentParams.stirrupSpacingMm;
      const d_v = currentParams.stirrupDiameterMm;
      const A_v = 2 * (Math.PI * Math.pow(d_v / 2, 2)); // 2 legs
      const f_yt = 420;
      const d = 540; // mm effective depth
      const V_c = 185; // kN concrete shear contribution
      const V_s = (A_v * f_yt * d) / (s * 1000); // kN
      const V_n = (V_c + V_s) * 0.75; // phi = 0.75
      const V_u = 480; // kN demand

      metrics.totalShearCapacityKn = Number(V_n.toFixed(1));
      metrics.tieSpacingConfinement = Number(s.toFixed(0));
      metrics.shearDemandCapacityRatio = Number((V_u / Math.max(1, V_n)).toFixed(2));
      metrics.rebarBucklingSafety = Number(((16 * 25) / Math.max(1, s)).toFixed(2));
    } else if (mission.interactiveType === 'survey_leveling') {
      const bs = currentParams.backsightM;
      const fs = currentParams.foresightM;
      const targetRL = 16.425;
      const closingErr = Math.abs(bs - fs + 0.373) * 1000;

      metrics.closingErrorMm = Number(closingErr.toFixed(1));
      metrics.collimationAccuracySec = Number((currentParams.instrumentHeightCorrectionMm * 0.8).toFixed(1));
      metrics.benchmarkElevationCheck = Number((targetRL + (closingErr / 1000) * 0.5).toFixed(3));
    } else if (mission.interactiveType === 'pump_curve') {
      const rpm = currentParams.pumpRpm;
      const suctionDia = currentParams.suctionPipeDiaMm / 1000;
      const suctionLift = currentParams.suctionLiftM;
      const v_suction = (350 / 3600) / (Math.PI * Math.pow(suctionDia / 2, 2));
      const h_fs = (0.02 * (15 / suctionDia) * Math.pow(v_suction, 2)) / 19.62;
      const npsha = (101.3 - 4.8) / 9.81 - suctionLift - h_fs;
      const npshr = 3.2 * Math.pow(rpm / 1450, 1.6);
      const margin = npsha - npshr;
      const efficiency = 86 - Math.abs(rpm - 1480) * 0.04 - Math.max(0, -margin * 10);

      metrics.npshMarginM = Number(margin.toFixed(2));
      metrics.pumpEfficiencyPct = Number(Math.max(40, efficiency).toFixed(1));
      metrics.powerConsumptionKw = Number(((9.81 * (350 / 3600) * 45) / (efficiency / 100)).toFixed(1));
      metrics.cavitationIndex = Number((npsha / Math.max(0.5, npshr)).toFixed(2));
    } else if (mission.interactiveType === 'solar_grid') {
      const pf = currentParams.inverterPowerFactor;
      const tension = currentParams.conductorTensionKn;
      const tap = currentParams.substationTapRatio;
      const sagM = (1.8 * Math.pow(280, 2)) / (8 * tension * 1000);
      const groundClearance = 16.5 - sagM;
      const v_ratio = (tap * (1 + (1 - pf) * 0.15)) * 100;

      metrics.gridVoltageStabilityPct = Number(v_ratio.toFixed(1));
      metrics.minGroundClearanceM = Number(groundClearance.toFixed(2));
      metrics.conductorTensionSafetyRatio = Number((140 / tension).toFixed(2));
      metrics.transmissionLossPct = Number((2.1 + (1 - pf) * 8).toFixed(2));
    } else if (mission.interactiveType === 'traffic_signal') {
      const C = currentParams.cycleLengthSec;
      const g1 = currentParams.phase1GreenSec;
      const g2 = currentParams.phase2GreenSec;
      const satRatio = 950 / 1800 + 620 / 1750;
      const delay = (C * Math.pow(1 - g1 / C, 2)) / (2 * (1 - (950 / 1800) * (g1 / C))) + (g2 / C) * 8;
      const queue = (950 / 3600) * (C - g1) * 7.5;

      metrics.averageDelaySec = Number(Math.max(12, delay).toFixed(1));
      metrics.levelOfService = delay <= 20 ? 1 : delay <= 35 ? 2 : delay <= 55 ? 3 : 4;
      metrics.queueLengthM = Number(Math.max(20, queue).toFixed(0));
      metrics.degreeOfSaturation = Number(satRatio.toFixed(2));
    } else {
      // Boss flood
      const gateOpen = currentParams.weirGateOpenPct;
      const pumps = currentParams.pumpsOnlineCount;
      const sandbag = currentParams.sandbagCrestHeightM;
      const stage = 18.2 - (gateOpen / 100) * 1.6 - pumps * 0.35 - sandbag * 0.4;
      const floodedHa = Math.max(0.2, (stage - 16.5) * 4.5);

      metrics.riverPeakStageM = Number(stage.toFixed(2));
      metrics.floodedAreaHectares = Number(floodedHa.toFixed(1));
      metrics.embankmentSafetyFactor = Number((1.2 + sandbag * 0.6 - (stage - 16.0) * 0.15).toFixed(2));
      metrics.evacuationDelayMinutes = floodedHa > 2.0 ? 45 : 0;
    }

    return metrics;
  };

  // Recalculate metrics as parameters adjust
  useEffect(() => {
    const computed = calculateEngineeringMetrics(params);
    setLiveMetrics(computed);
  }, [params]);

  const handleParamChange = (key: string, value: number) => {
    audioEngine.playClick(450, 0.02);
    setParams((prev) => ({ ...prev, [key]: value }));
    setOutcome('idle');
    setFailureReport(null);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimStep(0);
    audioEngine.playHydraulicPump();

    const interval = setInterval(() => {
      setSimStep((s) => {
        if (s >= 3) {
          clearInterval(interval);
          setIsSimulating(false);
          evaluateOutcome();
          return 4;
        }
        return s + 1;
      });
    }, 450);
  };

  const evaluateOutcome = () => {
    const metrics = calculateEngineeringMetrics(params);
    const criteria = mission.targetCriteria;
    let failedKey: string | null = null;
    let failureDetail: FailureReport | null = null;

    for (const [key, rawRule] of Object.entries(criteria)) {
      const rule = rawRule as TargetCriterion;
      const val = metrics[key];
      if (val === undefined) continue;

      if (rule.min !== undefined && val < rule.min) {
        failedKey = key;
        failureDetail = {
          title: `Non-Compliant Parameter: ${rule.label}`,
          parameterName: rule.label,
          actualValue: `${val} ${rule.unit}`,
          requiredValue: `≥ ${rule.min} ${rule.unit}`,
          physicalConsequence: getPhysicalConsequence(mission.interactiveType, key, 'low'),
          safetyImpact: 'High risk of operational shutdown, structural overload, or environmental penalty.',
          economicImpact: 'Estimated remediation and downtime cost: $45,000 - $120,000.',
          remedyAction: `Increase design parameter to ensure ${rule.label} satisfies minimum requirement.`,
          governingFormula: mission.briefing.technicalHint,
        };
        break;
      }
      if (rule.max !== undefined && val > rule.max) {
        failedKey = key;
        failureDetail = {
          title: `Exceeded Allowable Limit: ${rule.label}`,
          parameterName: rule.label,
          actualValue: `${val} ${rule.unit}`,
          requiredValue: `≤ ${rule.max} ${rule.unit}`,
          physicalConsequence: getPhysicalConsequence(mission.interactiveType, key, 'high'),
          safetyImpact: 'Severe violation of serviceability limit state (SLS) and building code provisions.',
          economicImpact: 'Risk of infrastructure damage, water loss, or traffic congestion gridlock.',
          remedyAction: `Optimize design sizing to bring ${rule.label} within safe statutory limits.`,
          governingFormula: mission.briefing.technicalHint,
        };
        break;
      }
    }

    if (failedKey && failureDetail) {
      audioEngine.playStressAlert();
      setOutcome('failure');
      setFailureReport(failureDetail);
    } else {
      audioEngine.playSuccessChime();
      setOutcome('success');
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      onMissionSuccess(mission.id, { xp: mission.rewardXp, budget: mission.rewardBudget });
    }
  };

  const getPhysicalConsequence = (type: string, key: string, dir: 'high' | 'low'): string => {
    if (type === 'drainage_hydraulic') {
      return dir === 'high'
        ? 'Rainfall discharge exceeds culvert capacity → stormwater backs up → 150mm overland flow inundates road shoulder → severe pavement sub-base erosion occurs.'
        : 'Culvert velocity is below 1.2 m/s self-cleansing threshold → sediment and debris will choke the channel during dry spells.';
    }
    if (type === 'water_network') {
      return dir === 'low'
        ? 'Friction head loss dissipates gradient → residual pressure at customer taps drops below 140 kPa → upper floors receive zero flow.'
        : 'Fluid velocity exceeds 2.2 m/s → severe pipe wall scouring and violent hydraulic water hammer during sudden valve closure.';
    }
    if (type === 'bridge_structural') {
      return dir === 'high'
        ? 'Live load deflection exceeds L/800 limit → dynamic vehicle resonance induces excessive vibration and micro-cracking in concrete deck.'
        : 'Factor of safety under ULS is insufficient → structural plastic deformation under 70R military heavy vehicle loading.';
    }
    if (type === 'column_shear') {
      return 'Stirrup tie spacing too wide → column core lacks seismic confinement → diagonal 45° shear cracks propagate under cyclic lateral loads.';
    }
    if (type === 'pump_curve') {
      return 'NPSHa is lower than NPSHr → localized pressure drops below vapor pressure → explosive cavitation bubbles implode on impeller blades, pitting steel.';
    }
    return 'Engineering parameter deviated outside allowable physical safety envelopes, leading to system failure.';
  };

  return (
    <div id="mission-workspace-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 shadow-md">
              <Activity className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                  {mission.discipline.toUpperCase()} MISSION
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-semibold border border-slate-700">
                  {mission.difficulty}
                </span>
              </div>
              <h2 className="font-bold text-base text-slate-100">{mission.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                showHint ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Hint</span>
            </button>
            <button
              id="btn-close-mission-workspace"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Briefing Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4.5">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Site Situation & Design Requirements</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{mission.briefing.situation}</p>
                <div className="text-[11px] text-slate-400 font-mono bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-cyan-400 font-semibold">Conditions: </span>
                  {mission.briefing.siteCondition}
                </div>
              </div>

              {/* Reward Badge */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between min-w-[200px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Contract Rewards</span>
                <div className="text-lg font-black text-amber-400 mb-1">+${mission.rewardBudget.toLocaleString()}</div>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-md">+{mission.rewardXp.knowledge} K-XP</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md">+{mission.rewardXp.practical} P-XP</span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-md">+{mission.rewardXp.design} D-XP</span>
                </div>
              </div>
            </div>

            {/* Technical Hint Toggle */}
            {showHint && (
              <div className="mt-3.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 animate-in fade-in duration-200">
                <span className="font-bold">Standard Reference: </span>
                <span>{mission.briefing.engineeringStandard}</span>
                <p className="mt-1 text-[11px] text-amber-300/90 font-mono">{mission.briefing.technicalHint}</p>
              </div>
            )}
          </div>

          {/* Interactive Technical SVG Visualizer & Simulation Canvas */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden relative shadow-inner min-h-[220px] flex items-center justify-center">
            {/* Custom SVG Render based on mission interactive type */}
            <div className="w-full max-w-2xl h-48 flex items-center justify-center">
              {mission.interactiveType === 'water_network' && (
                <svg viewBox="0 0 500 160" className="w-full h-full">
                  {/* WTP Pump Station */}
                  <rect x="20" y="50" width="55" height="60" rx="6" fill="#1e293b" stroke="#0284c7" strokeWidth="2" />
                  <circle cx="47" cy="80" r="16" fill="#0369a1" className={isSimulating ? 'animate-spin' : ''} />
                  <text x="47" y="125" fill="#94a3b8" fontSize="10" textAnchor="middle">WTP Pump</text>

                  {/* Pipeline */}
                  <path
                    d="M 75 80 L 400 80"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth={Math.max(6, (params.pipeDiameterMm / 500) * 22)}
                    strokeDasharray={isSimulating ? '8 4' : 'none'}
                    className={isSimulating ? 'animate-pulse' : ''}
                  />

                  {/* Flow velocity arrows */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <polygon
                      key={i}
                      points={`${120 + i * 60},75 ${130 + i * 60},80 ${120 + i * 60},85`}
                      fill="#38bdf8"
                      opacity="0.8"
                    />
                  ))}

                  {/* Residential End Tap / Pressure Gauge */}
                  <rect x="400" y="40" width="70" height="80" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="435" cy="75" r="20" fill="#0f172a" stroke="#64748b" />
                  {/* Gauge Needle */}
                  <line
                    x1="435"
                    y1="75"
                    x2={435 + Math.cos(((liveMetrics.terminalPressure || 100) / 300) * Math.PI - Math.PI / 2) * 16}
                    y2={75 + Math.sin(((liveMetrics.terminalPressure || 100) / 300) * Math.PI - Math.PI / 2) * 16}
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />
                  <text x="435" y="105" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {liveMetrics.terminalPressure || 0} kPa
                  </text>
                  <text x="435" y="135" fill="#94a3b8" fontSize="10" textAnchor="middle">Sector 4 Tap</text>
                </svg>
              )}

              {mission.interactiveType === 'drainage_hydraulic' && (
                <svg viewBox="0 0 500 160" className="w-full h-full">
                  {/* Road Shoulder & Subbase */}
                  <polygon points="20,50 480,50 480,75 20,75" fill="#334155" />
                  <polygon points="20,75 480,75 480,140 20,140" fill="#1e293b" />
                  <text x="250" y="42" fill="#94a3b8" fontSize="10" textAnchor="middle">Road Camber (Elevated Highway)</text>

                  {/* Concrete Box Culvert Opening */}
                  <rect x="180" y="60" width="140" height="75" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" rx="4" />

                  {/* Stormwater Flow Level inside culvert */}
                  <rect
                    x="182"
                    y={60 + (1 - Math.min(1, liveMetrics.waterDepthRatio || 0.5)) * 73}
                    width="136"
                    height={Math.min(1, liveMetrics.waterDepthRatio || 0.5) * 73}
                    fill="#0284c7"
                    opacity="0.85"
                  />

                  {/* Overtopping flood visual if water depth ratio > 1 */}
                  {(liveMetrics.waterDepthRatio || 0) > 1 && (
                    <rect x="20" y="40" width="460" height="20" fill="#0284c7" opacity="0.6" className="animate-pulse" />
                  )}

                  <text x="250" y="152" fill="#38bdf8" fontSize="10" textAnchor="middle">
                    Freeboard: {liveMetrics.freeboardMm || 0} mm | Capacity: {liveMetrics.culvertCapacity || 0} m³/s
                  </text>
                </svg>
              )}

              {mission.interactiveType === 'bridge_structural' && (
                <svg viewBox="0 0 500 160" className="w-full h-full">
                  {/* Bridge Abutments */}
                  <polygon points="30,130 90,130 80,70 30,70" fill="#475569" />
                  <polygon points="410,130 470,130 470,70 420,70" fill="#475569" />

                  {/* Prestressed Girder Deck with Deflection curve */}
                  <path
                    d={`M 80 75 Q 250 ${75 + (liveMetrics.midspanDeflectionMm || 10) * 0.4} 420 75`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="10"
                  />

                  {/* Prestressing Tendon Parabolic Profile */}
                  <path
                    d="M 85 73 Q 250 84 415 73"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />

                  {/* River beneath */}
                  <path d="M 0 135 Q 250 130 500 135 L 500 160 L 0 160 Z" fill="#0284c7" opacity="0.6" />

                  <text x="250" y="55" fill="#facc15" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Max Deflection: {liveMetrics.midspanDeflectionMm || 0} mm (Limit: 45 mm)
                  </text>
                  <text x="250" y="115" fill="#38bdf8" fontSize="10" textAnchor="middle">
                    Factor of Safety: {liveMetrics.factorOfSafety || 0}
                  </text>
                </svg>
              )}

              {mission.interactiveType === 'column_shear' && (
                <svg viewBox="0 0 500 160" className="w-full h-full">
                  {/* Concrete Column Outline */}
                  <rect x="180" y="10" width="140" height="140" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />

                  {/* Longitudinal Bars */}
                  {Array.from({ length: 4 }).map((_, r) =>
                    Array.from({ length: 4 }).map((_, c) => {
                      if (r > 0 && r < 3 && c > 0 && c < 3) return null;
                      return (
                        <circle
                          key={`${r}-${c}`}
                          cx={198 + c * 34}
                          cy={28 + r * 34}
                          r="5.5"
                          fill="#38bdf8"
                          stroke="#0369a1"
                        />
                      );
                    })
                  )}

                  {/* Outer Stirrup Tie */}
                  <rect x="192" y="22" width="116" height="116" fill="none" stroke="#f59e0b" strokeWidth="3" rx="2" />

                  <text x="380" y="70" fill="#94a3b8" fontSize="11">Tie Spacing: {params.stirrupSpacingMm} mm</text>
                  <text x="380" y="90" fill="#38bdf8" fontSize="11">Capacity: {liveMetrics.totalShearCapacityKn} kN</text>
                  <text x="380" y="110" fill={liveMetrics.shearDemandCapacityRatio > 0.85 ? '#f87171' : '#4ade80'} fontSize="11" fontWeight="bold">
                    Demand/Cap: {liveMetrics.shearDemandCapacityRatio}
                  </text>
                </svg>
              )}

              {/* Default Graphic for other interactive types */}
              {!['water_network', 'drainage_hydraulic', 'bridge_structural', 'column_shear'].includes(mission.interactiveType) && (
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    <Activity className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    {mission.title} Telemetry Simulation Active
                  </div>
                  <div className="flex justify-center gap-4 text-xs font-bold text-cyan-400">
                    {Object.entries(liveMetrics).map(([k, v]) => (
                      <span key={k} className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Simulation Status Badge */}
            {isSimulating && (
              <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-xs font-bold text-cyan-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Simulating Step {simStep}/4...</span>
              </div>
            )}
          </div>

          {/* Interactive Parameters Adjustment Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Engineering Design Parameters</span>
              </span>
              <span className="text-[11px] text-slate-400">Adjust variables and test physical response</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {Object.entries(params).map(([key, val]) => {
                const isMm = key.includes('Mm');
                const isPct = key.includes('Pct');
                const min = isMm ? 100 : isPct ? 1 : 0.1;
                const max = isMm ? 1000 : isPct ? 100 : 100;
                const step = isMm ? 10 : isPct ? 1 : 0.05;

                return (
                  <div key={key} className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-mono font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {val} {isMm ? 'mm' : isPct ? '%' : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={val}
                      onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Performance Criteria Evaluator */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Design Constraints Compliance
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(mission.targetCriteria).map(([key, rawRule]) => {
                const rule = rawRule as TargetCriterion;
                const currentVal = liveMetrics[key] ?? 0;
                const isPassed =
                  (rule.min === undefined || currentVal >= rule.min) &&
                  (rule.max === undefined || currentVal <= rule.max);

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-xl border transition-all ${
                      isPassed
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-medium truncate">{rule.label}</span>
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <div className="text-sm font-bold font-mono">
                      {currentVal} <span className="text-[10px] font-normal text-slate-400">{rule.unit}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      Req: {rule.min !== undefined ? `≥${rule.min}` : ''} {rule.max !== undefined ? `≤${rule.max}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Educational Engineering Failure Diagnostic */}
          {outcome === 'failure' && failureReport && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/60 text-white space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>ENGINEERING FAILURE REPORT</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-rose-500/20">
                  <span className="text-slate-400 block text-[10px]">Parameter Deviation</span>
                  <span className="font-semibold text-rose-300">{failureReport.parameterName}: {failureReport.actualValue} (Target {failureReport.requiredValue})</span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-rose-500/20">
                  <span className="text-slate-400 block text-[10px]">Physical Consequence</span>
                  <span className="text-slate-200">{failureReport.physicalConsequence}</span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-rose-500/20">
                  <span className="text-slate-400 block text-[10px]">Safety & Code Impact</span>
                  <span className="text-slate-300">{failureReport.safetyImpact}</span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-rose-500/20">
                  <span className="text-slate-400 block text-[10px]">Remedial Engineering Action</span>
                  <span className="text-cyan-300 font-medium">{failureReport.remedyAction}</span>
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {outcome === 'success' && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/60 text-white flex items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-300">Engineering Solution Approved</h4>
                  <p className="text-xs text-slate-300">All statutory design constraints, safety limits, and physical tolerances satisfied.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs whitespace-nowrap shadow-lg shadow-emerald-500/20 transition-all"
              >
                Return to World
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setParams(() => {
                const init: Record<string, number> = {};
                Object.entries(mission.initialParameters).forEach(([k, v]) => {
                  init[k] = typeof v === 'number' ? v : 0;
                });
                return init;
              });
              setOutcome('idle');
              setFailureReport(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            id="btn-run-simulation-test"
            disabled={isSimulating}
            onClick={handleRunSimulation}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isSimulating ? 'Simulating Physics...' : 'Run Simulation & Verify'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
