import React, { useState, useEffect, useRef } from 'react';
import { AcademicLevel, LabViewMode, ExperimentExecutionMode, WhyExplanation } from '../../types/chemistry';
import { ChemistryEngines } from '../../engines/ChemistryEngines';
import {
  getStandardTier,
  getTierLabel,
  WhyEngine,
  WhatIfEngine,
  FormulaExplanationEngine,
  MistakeFeedbackEngine,
  ProgressEngine
} from '../../engines/AdaptiveLearningEngine';

// Common & Adaptive UI
import { ChartPlotter } from '../common/ChartPlotter';
import { ParticleCanvas, Particle } from '../common/ParticleCanvas';
import { ModeViewSelector } from '../adaptive/ModeViewSelector';
import { WhyModal } from '../adaptive/WhyModal';
import { WhatIfPanel } from '../adaptive/WhatIfPanel';
import { AdaptiveFormulaCard } from '../adaptive/AdaptiveFormulaCard';
import { GuidedLabSteppers } from '../adaptive/GuidedLabSteppers';
import { ExperimentResultPanel } from '../adaptive/ExperimentResultPanel';
import { MistakeFeedbackBanner } from '../adaptive/MistakeFeedbackBanner';
import { RealWorldApplicationCard } from '../adaptive/RealWorldApplicationCard';
import { RelatedConceptsGraph } from '../adaptive/RelatedConceptsGraph';

import {
  Pipette,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Droplet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Award,
  HelpCircle,
  Layers,
  Atom,
  Binary,
  Trophy,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TitrationLabProps {
  academicLevel: AcademicLevel;
}

export const TitrationLab: React.FC<TitrationLabProps> = ({ academicLevel }) => {
  const tier = getStandardTier(academicLevel);

  // View Mode: Lab (Macroscopic) | Molecular (Microscopic) | Math (Calculus / ICE)
  const [viewMode, setViewMode] = useState<LabViewMode>('lab');
  // Execution Mode: Guided | Free | Challenge
  const [executionMode, setExecutionMode] = useState<ExperimentExecutionMode>('guided');
  const [guidedStepIndex, setGuidedStepIndex] = useState<number>(0);

  // Analyte in Flask: HCl (Strong Acid) or Acetic Acid (Weak Acid)
  const [analyteType, setAnalyteType] = useState<'HCl' | 'CH3COOH'>('HCl');
  const [analyteVol, setAnalyteVol] = useState(25.0); // mL
  const [analyteConc, setAnalyteConc] = useState(0.1); // M

  // Titrant in Burette: NaOH (Strong Base)
  const [titrantConc, setTitrantConc] = useState(0.1); // M
  const [titrantAdded, setTitrantAdded] = useState(0.0); // mL

  // Indicator
  const [indicator, setIndicator] = useState<'phenolphthalein' | 'bromothymol' | 'methyl_orange'>('phenolphthalein');

  // Simulation Flow Control
  const [isRunning, setIsRunning] = useState(false);
  const [flowRate, setFlowRate] = useState<number>(0.2); // mL per tick
  const [stirrerOn, setStirrerOn] = useState(true);

  // Curve Data History
  const [curveData, setCurveData] = useState<Array<{ x: number; y: number; theoreticalY?: number }>>([
    { x: 0, y: 1.0, theoreticalY: 1.0 }
  ]);
  const [trials, setTrials] = useState<Array<{ trialNum: number; titre: number; calculatedMolarity: number }>>([]);
  const [concordantAverage, setConcordantAverage] = useState<number | null>(null);

  // Challenge Mode State
  const [challengeUnknownMolarity, setChallengeUnknownMolarity] = useState<number>(0.125);
  const [userGuessMolarity, setUserGuessMolarity] = useState<string>('');
  const [challengeSolved, setChallengeSolved] = useState<boolean>(false);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  // Why Explanation Modal State
  const [activeWhyExplanation, setActiveWhyExplanation] = useState<WhyExplanation | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);

  // Calculate live current pH and volume equivalence
  const equivalenceVolume = (analyteConc * analyteVol) / titrantConc;
  const totalVolume_L = (analyteVol + titrantAdded) / 1000;

  let currentPH = 7.0;
  if (analyteType === 'HCl') {
    if (titrantAdded < equivalenceVolume) {
      const unreactedMoles = (analyteConc * analyteVol - titrantConc * titrantAdded) / 1000;
      const hConc = unreactedMoles / totalVolume_L;
      currentPH = ChemistryEngines.acidBase.pHFromH(hConc);
    } else if (Math.abs(titrantAdded - equivalenceVolume) < 0.04) {
      currentPH = 7.0;
    } else {
      const excessMoles = (titrantConc * (titrantAdded - equivalenceVolume)) / 1000;
      const ohConc = excessMoles / totalVolume_L;
      currentPH = 14.0 - ChemistryEngines.acidBase.pHFromH(ohConc);
    }
  } else {
    // Acetic acid (Weak Acid Ka = 1.8e-5)
    const Ka = 1.8e-5;
    const pKa = 4.74;
    if (titrantAdded === 0) {
      currentPH = ChemistryEngines.acidBase.weakAcidPH(analyteConc, Ka).pH;
    } else if (titrantAdded < equivalenceVolume) {
      const molesAcidRemaining = (analyteConc * analyteVol - titrantConc * titrantAdded) / 1000;
      const molesSaltFormed = (titrantConc * titrantAdded) / 1000;
      currentPH = ChemistryEngines.acidBase.bufferPH(pKa, molesSaltFormed, molesAcidRemaining);
    } else if (Math.abs(titrantAdded - equivalenceVolume) < 0.05) {
      // Equivalence salt hydrolysis pH
      const saltConc = (analyteConc * analyteVol) / 1000 / totalVolume_L;
      const Kb = 1e-14 / Ka;
      const ohConc = Math.sqrt(Kb * saltConc);
      currentPH = 14.0 - ChemistryEngines.acidBase.pHFromH(ohConc);
    } else {
      const excessMoles = (titrantConc * (titrantAdded - equivalenceVolume)) / 1000;
      const ohConc = excessMoles / totalVolume_L;
      currentPH = 14.0 - ChemistryEngines.acidBase.pHFromH(ohConc);
    }
  }
  currentPH = Math.max(0.1, Math.min(13.9, currentPH));

  // Determine solution visual color based on pH & indicator
  const getSolutionColor = () => {
    if (indicator === 'phenolphthalein') {
      if (currentPH < 8.2) return 'rgba(240, 249, 255, 0.25)'; // Colorless
      if (currentPH <= 10.0) {
        const opacity = Math.min(0.85, (currentPH - 8.2) / 1.8);
        return `rgba(244, 63, 94, ${opacity})`; // Pink
      }
      return 'rgba(225, 29, 72, 0.9)'; // Vivid Magenta
    }
    if (indicator === 'bromothymol') {
      if (currentPH < 6.0) return 'rgba(234, 179, 8, 0.8)'; // Yellow
      if (currentPH <= 7.6) return 'rgba(34, 197, 94, 0.85)'; // Green (Neutral)
      return 'rgba(59, 130, 246, 0.9)'; // Blue
    }
    if (indicator === 'methyl_orange') {
      if (currentPH < 3.1) return 'rgba(239, 68, 68, 0.85)'; // Red
      if (currentPH <= 4.4) return 'rgba(249, 115, 22, 0.85)'; // Orange
      return 'rgba(234, 179, 8, 0.85)'; // Yellow
    }
    return 'rgba(240, 249, 255, 0.25)';
  };

  // Timer loop for continuous titration flow
  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        setTitrantAdded((prev) => {
          const next = Number((prev + flowRate).toFixed(2));
          if (next >= 50) {
            setIsRunning(false);
            return 50;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isRunning, flowRate]);

  // Update Graph on titration volume change
  useEffect(() => {
    const theoreticalCurve = ChemistryEngines.acidBase.generateTitrationCurve(
      analyteVol,
      analyteConc,
      titrantConc,
      true
    );
    const currTheor =
      theoreticalCurve.find((p) => Math.abs(p.volAdded_mL - titrantAdded) < 0.25)?.pH ?? currentPH;

    setCurveData((prev) => {
      if (prev.length > 0 && Math.abs(prev[prev.length - 1].x - titrantAdded) < 0.1) {
        return prev;
      }
      return [
        ...prev,
        {
          x: titrantAdded,
          y: Number(currentPH.toFixed(2)),
          theoreticalY: Number(currTheor.toFixed(2))
        }
      ];
    });

    // Check endpoint reached celebration
    if (Math.abs(titrantAdded - equivalenceVolume) <= 0.1 && !isRunning && titrantAdded > 0) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      ProgressEngine.markLabCompleted('titration');
    }
  }, [titrantAdded, currentPH, analyteVol, analyteConc, titrantConc, equivalenceVolume, isRunning]);

  // Guided Steps Definition
  const guidedSteps = [
    {
      title: 'Read Objective',
      desc: 'Understand the goal of determining unknown acid concentration via controlled base addition.',
      isCompleted: true
    },
    {
      title: 'Inspect Glassware & Reagents',
      desc: 'Check the 50 mL burette filled with 0.1 M NaOH and 25 mL HCl sample in the Erlenmeyer flask.',
      isCompleted: true
    },
    {
      title: 'Select Indicator',
      desc: 'Ensure Phenolphthalein is selected (colorless in acid, turning faint pink at pH 8.2).',
      isCompleted: indicator === 'phenolphthalein'
    },
    {
      title: 'Open Valve (Coarse Addition)',
      desc: 'Open the burette valve to add titrant smoothly while watching the live pH meter rise.',
      isCompleted: titrantAdded >= 10.0
    },
    {
      title: 'Slow Near Equivalence',
      desc: 'When approaching 20–24 mL, switch to slow or "+1 Drop" mode to avoid overshooting.',
      isCompleted: titrantAdded >= 22.0
    },
    {
      title: 'Detect Inflection Endpoint',
      desc: 'Stop at the first permanent pale pink hue (pH ~7.0–8.5). Note your exact burette volume.',
      isCompleted: Math.abs(titrantAdded - equivalenceVolume) <= 0.5
    },
    {
      title: 'Log Concordant Trial',
      desc: 'Click "Log Trial Result" to record your titre volume and compute acid molarity via C₁V₁ = C₂V₂.',
      isCompleted: trials.length > 0
    },
    {
      title: 'Analyze Curve & Derivatives',
      desc: 'Switch to "MATH VIEW" to inspect the sigmoidal inflection and first derivative peak.',
      isCompleted: viewMode === 'math'
    },
    {
      title: 'Review "Why?" Explanation',
      desc: 'Click any "Why?" trigger or particle to understand the sub-microscopic neutralization kinetics.',
      isCompleted: trials.length > 0
    },
    {
      title: 'Submit Lab Conclusion',
      desc: 'Review the finalized analytical result panel and industrial applications.',
      isCompleted: trials.length > 0 && Math.abs(titrantAdded - equivalenceVolume) <= 0.5
    }
  ];

  const handleAddSingleDrop = () => {
    setTitrantAdded((prev) => Number((prev + 0.05).toFixed(2)));
  };

  const handleRecordTrial = () => {
    const calcM = (titrantConc * titrantAdded) / analyteVol;
    const newTrials = [
      ...trials,
      {
        trialNum: trials.length + 1,
        titre: titrantAdded,
        calculatedMolarity: Number(calcM.toFixed(4))
      }
    ];
    setTrials(newTrials);
    ProgressEngine.logTrial();

    const titres = newTrials.map((t) => t.titre);
    const avg = titres.reduce((a, b) => a + b, 0) / titres.length;
    setConcordantAverage(Number(avg.toFixed(2)));
  };

  const handleReset = () => {
    setIsRunning(false);
    setTitrantAdded(0);
    setCurveData([{ x: 0, y: 1.0, theoreticalY: 1.0 }]);
  };

  const handleOpenWhy = (contextEvent?: string) => {
    const exp = WhyEngine.generateWhyExplanation(
      'titration',
      contextEvent || `Titrated ${analyteVol} mL ${analyteType} with ${titrantAdded} mL NaOH (pH = ${currentPH.toFixed(2)})`,
      academicLevel
    );
    setActiveWhyExplanation(exp);
    setIsWhyModalOpen(true);
  };

  const handleCheckChallenge = () => {
    const guess = parseFloat(userGuessMolarity);
    if (isNaN(guess)) {
      setChallengeFeedback('Please enter a valid numeric molarity value.');
      return;
    }
    const diffPct = Math.abs((guess - challengeUnknownMolarity) / challengeUnknownMolarity) * 100;
    if (diffPct <= 2.0) {
      setChallengeSolved(true);
      setChallengeFeedback(
        `Outstanding! Your calculated molarity of ${guess} M is within ${diffPct.toFixed(2)}% of the true value (${challengeUnknownMolarity} M).`
      );
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      ProgressEngine.markChallengeSolved('titration_unknown');
    } else {
      setChallengeFeedback(
        `Incorrect (${guess} M). True value was ${challengeUnknownMolarity} M (${diffPct.toFixed(1)}% error). Review your concordant titres and recalculate C₁ = (C₂ · V₂) / V₁.`
      );
    }
  };

  // Generate particle set for Molecular View
  const generateMolecularParticles = (): Particle[] => {
    const particles: Particle[] = [];
    const hCount = Math.max(0, Math.round(20 * (1 - titrantAdded / equivalenceVolume)));
    const ohCount = titrantAdded > equivalenceVolume ? Math.round(15 * ((titrantAdded - equivalenceVolume) / 10)) : 0;
    const h2oCount = Math.min(30, Math.round(30 * (titrantAdded / equivalenceVolume)));

    // H+ (Hydronium) ions - Red
    for (let i = 0; i < hCount; i++) {
      particles.push({
        x: Math.random() * 400 + 20,
        y: Math.random() * 200 + 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 6,
        color: '#f43f5e',
        label: 'H⁺',
        type: 'ionPos'
      });
    }

    // OH- ions - Blue
    for (let i = 0; i < ohCount; i++) {
      particles.push({
        x: Math.random() * 400 + 20,
        y: Math.random() * 200 + 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 7,
        color: '#3b82f6',
        label: 'OH⁻',
        type: 'ionNeg'
      });
    }

    // Formed neutral H2O molecules - Emerald
    for (let i = 0; i < h2oCount; i++) {
      particles.push({
        x: Math.random() * 400 + 20,
        y: Math.random() * 200 + 20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: 5,
        color: '#10b981',
        label: 'H₂O',
        type: 'neutral'
      });
    }

    return particles;
  };

  // Mistake Feedback
  const mistake = MistakeFeedbackEngine.analyzeTitrationMistake(
    titrantAdded,
    equivalenceVolume,
    indicator,
    currentPH
  );

  // Result Breakdown
  const resultBreakdown = {
    inputs: {
      analyteVol: { label: 'Analyte Volume (V₁)', value: analyteVol, unit: 'mL' },
      titrantConc: { label: 'Titrant Concentration (C₂)', value: titrantConc, unit: 'M NaOH' },
      titreAdded: { label: 'Titre Added (V₂)', value: titrantAdded, unit: 'mL' },
      indicator: { label: 'Indicator Dye', value: indicator }
    },
    observation: `Liquid in Erlenmeyer flask transitioned according to indicator pH equilibrium. Live pH reading is ${currentPH.toFixed(2)}.`,
    molecularSummary: `Hydroxide ions (OH⁻) continuously bonded with hydronium ions (H₃O⁺) forming neutral water molecules (H₂O).`,
    calculatedValues: {
      calculatedMolarity: {
        label: 'Calculated Acid Molarity',
        value: ((titrantConc * titrantAdded) / analyteVol).toFixed(4),
        unit: 'M',
        formulaUsed: 'C₁ = (C₂ · V₂) / V₁'
      },
      neutralizationRatio: {
        label: 'Stoichiometric Neutralization',
        value: `${Math.min(100, Math.round((titrantAdded / equivalenceVolume) * 100))}%`,
        unit: 'complete'
      },
      excessIonConc: {
        label: titrantAdded < equivalenceVolume ? 'Unreacted [H⁺]' : 'Excess [OH⁻]',
        value:
          titrantAdded < equivalenceVolume
            ? ChemistryEngines.acidBase.hFromPH(currentPH).toExponential(3)
            : ChemistryEngines.acidBase.ohFromPOH(14 - currentPH).toExponential(3),
        unit: 'mol/L'
      }
    },
    interpretation:
      Math.abs(titrantAdded - equivalenceVolume) <= 0.5
        ? 'Solution is at exact stoichiometric equivalence point. Moles of base added equal initial moles of acid.'
        : titrantAdded < equivalenceVolume
        ? 'Acid is in excess. Solution remains in acidic domain.'
        : 'Base is in excess. Solution has crossed over into alkaline domain.',
    realWorldApplication:
      'Used across the chemical industry for quality control of pharmaceutical APIs, monitoring acidity in wine & dairy fermentations, and calibrating wastewater effluent pH before river discharge.',
    assumptions: [
      'Activity coefficients are assumed unity (γ ≈ 1.0) under dilute conditions (< 0.1 M).',
      'Temperature is constant at 25°C (Kw = 1.0 × 10⁻¹⁴).',
      'Volumetric thermal expansion of aqueous solution is negligible.'
    ],
    uncertaintyEstimate: '±0.05 mL standard burette reading uncertainty (Class A glassware).'
  };

  return (
    <div className="space-y-6" id="titration-lab">
      {/* Top Banner & Mode Switchers */}
      <div className="bg-[#111A2E] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <Pipette className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                    Precision Titration Virtual Laboratory
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-teal-400 font-bold">
                    {getTierLabel(tier)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Volumetric acid-base neutralization with synchronized macroscopic glassware, sub-microscopic ion kinetics, and live mathematical curves.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics & "Why?" Trigger */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0B1121] border border-slate-800 text-center font-mono text-xs">
              <div className="text-[10px] text-slate-400 uppercase">Live pH Meter</div>
              <div className="text-lg font-bold text-teal-400">{currentPH.toFixed(2)}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0B1121] border border-slate-800 text-center font-mono text-xs">
              <div className="text-[10px] text-slate-400 uppercase">Titre Volume</div>
              <div className="text-lg font-bold text-white">{titrantAdded.toFixed(2)} mL</div>
            </div>

            <button
              onClick={() => handleOpenWhy()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0"
              id="btn-titration-why"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Why? Explain</span>
            </button>
          </div>
        </div>

        {/* 3-View Switcher: LAB VIEW | MOLECULAR VIEW | MATH VIEW */}
        <ModeViewSelector currentMode={viewMode} onChangeMode={setViewMode} />
      </div>

      {/* Guided Lab Stepper (if in guided mode) */}
      <GuidedLabSteppers
        executionMode={executionMode}
        onChangeExecutionMode={setExecutionMode}
        currentStepIndex={guidedStepIndex}
        steps={guidedSteps}
        onSelectStep={setGuidedStepIndex}
        onNextStep={() => setGuidedStepIndex((prev) => Math.min(guidedSteps.length - 1, prev + 1))}
        onResetGuide={() => {
          setGuidedStepIndex(0);
          handleReset();
        }}
      />

      {/* Challenge Mode Card (if in challenge mode) */}
      {executionMode === 'challenge' && (
        <div className="bg-[#111A2E] border border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Challenge Mission: Determine Unknown Acid Molarity
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-amber-500/30">
              Tolerance: ±2.0%
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Titrate the unknown HCl sample in the flask using 0.100 M standard NaOH until the endpoint is reached. Calculate and enter the unknown concentration.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Your Calculated Molarity:</span>
              <input
                type="number"
                step="0.001"
                placeholder="e.g. 0.125"
                value={userGuessMolarity}
                onChange={(e) => setUserGuessMolarity(e.target.value)}
                className="w-32 bg-[#0B1121] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-teal-400"
              />
              <span className="text-xs text-slate-400 font-mono">M</span>
            </div>

            <button
              onClick={handleCheckChallenge}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Verify Answer
            </button>
          </div>

          {challengeFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-mono ${
                challengeSolved
                  ? 'bg-emerald-950/60 border border-emerald-500 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500 text-rose-300'
              }`}
            >
              {challengeFeedback}
            </div>
          )}
        </div>
      )}

      {/* Main Simulation Viewport (Synchronized across 3 modes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Glassware Stage OR Molecular Canvas OR Math Formulas (5 Cols) */}
        <div className="lg:col-span-5 bg-[#111A2E] border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between min-h-[490px]">
          {/* Mode 1: LAB VIEW (Macroscopic Glassware) */}
          {viewMode === 'lab' && (
            <div className="flex flex-col items-center justify-between h-full space-y-4">
              <div className="relative w-full max-w-[260px] h-[340px] flex justify-center items-center">
                <svg viewBox="0 0 200 360" className="w-full h-full">
                  {/* Stand */}
                  <rect x="35" y="10" width="6" height="340" fill="#334155" rx="2" />
                  <rect x="15" y="340" width="90" height="10" fill="#1e293b" rx="3" />
                  {/* Clamp Arms */}
                  <rect x="40" y="80" width="35" height="5" fill="#475569" />
                  <rect x="40" y="180" width="35" height="5" fill="#475569" />

                  {/* Burette Glass Tube (50 mL capacity) */}
                  <rect
                    x="70"
                    y="20"
                    width="16"
                    height="200"
                    fill="rgba(255,255,255,0.06)"
                    stroke="#64748b"
                    strokeWidth="1.2"
                    rx="2"
                  />
                  {/* Liquid inside Burette (NaOH) */}
                  {(() => {
                    const remainingHeight = Math.max(0, 190 * (1 - titrantAdded / 50));
                    return (
                      <rect
                        x="71"
                        y={20 + (190 - remainingHeight)}
                        width="14"
                        height={remainingHeight}
                        fill="rgba(45, 212, 191, 0.45)"
                      />
                    );
                  })()}

                  {/* Burette Volume Graduation Ticks */}
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line
                      key={`tick-${i}`}
                      x1="70"
                      y1={25 + i * 18}
                      x2="76"
                      y2={25 + i * 18}
                      stroke="#94a3b8"
                      strokeWidth="0.8"
                    />
                  ))}

                  {/* Burette Stopcock Valve */}
                  <circle
                    cx="78"
                    cy="225"
                    r="5"
                    fill={isRunning ? '#10b981' : '#ef4444'}
                    stroke="#ffffff"
                    strokeWidth="1"
                    className="cursor-pointer"
                    onClick={() => setIsRunning(!isRunning)}
                  />
                  {/* Burette Tip */}
                  <polygon points="75,225 81,225 79,245 77,245" fill="#64748b" />

                  {/* Falling Drops Animation */}
                  {isRunning && (
                    <circle cx="78" cy="255" r="2.5" fill="#2dd4bf" className="animate-bounce" />
                  )}

                  {/* Erlenmeyer Flask */}
                  <polygon
                    points="72,260 84,260 84,280 120,330 36,330 72,280"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                  {/* Liquid in Flask with dynamic color shift */}
                  <polygon
                    points="62,295 94,295 116,328 40,328"
                    fill={getSolutionColor()}
                    className="transition-colors duration-300"
                  />

                  {/* Magnetic Stirrer Bar */}
                  {stirrerOn && (
                    <rect
                      x="73"
                      y="322"
                      width="10"
                      height="3"
                      fill="#ffffff"
                      rx="1.5"
                      className="animate-spin origin-center"
                    />
                  )}
                </svg>

                {/* Clickable "Explain Glassware" Pin */}
                <button
                  onClick={() => handleOpenWhy('Burette Meniscus Reading and Stopcock Flow')}
                  className="absolute top-10 right-2 px-2 py-1 rounded bg-[#0B1121]/90 border border-slate-700 text-[10px] text-teal-400 font-mono flex items-center gap-1 hover:border-teal-400 transition-all shadow-md"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Explain Glassware</span>
                </button>
              </div>

              {/* Burette Control Valves */}
              <div className="w-full space-y-3 bg-[#0B1121] p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Burette Valve Regulation:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { label: 'Drop (0.05mL)', rate: 0.05 },
                      { label: 'Slow (0.1mL/s)', rate: 0.1 },
                      { label: 'Fast (0.5mL/s)', rate: 0.5 }
                    ].map((m) => (
                      <button
                        key={m.label}
                        onClick={() => setFlowRate(m.rate)}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                          flowRate === m.rate
                            ? 'bg-teal-600 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                      isRunning
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-teal-600 hover:bg-teal-500 text-slate-950'
                    }`}
                    id="btn-toggle-titration"
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isRunning ? 'Close Stopcock' : 'Open Stopcock'}</span>
                  </button>

                  <button
                    onClick={handleAddSingleDrop}
                    disabled={isRunning}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold flex items-center gap-1 font-mono"
                    id="btn-add-drop"
                  >
                    <Droplet className="w-4 h-4 text-teal-400" />
                    <span>+1 Drop</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    title="Reset Burette & Flask"
                    id="btn-reset-titration"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: MOLECULAR VIEW (Particle Kinetics & Neutralization) */}
          {viewMode === 'molecular' && (
            <div className="space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                    Sub-Microscopic Ion Neutralization
                  </span>
                  <button
                    onClick={() => handleOpenWhy('Molecular Neutralization Kinetics')}
                    className="text-[10px] text-teal-300 hover:underline flex items-center gap-1 font-mono"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Why H⁺ + OH⁻ → H₂O?</span>
                  </button>
                </div>

                {/* Particle Canvas showing real-time ion population */}
                <ParticleCanvas
                  customParticles={generateMolecularParticles()}
                  height={250}
                  particleType="ions"
                  temperature={298}
                />

                {/* Particle Legend & Counts */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                  <div className="p-2 rounded-lg bg-[#0F172A] border border-rose-500/30">
                    <div className="text-[10px] text-rose-400 font-bold">H₃O⁺ (Acid)</div>
                    <div className="text-sm font-bold text-white">
                      {Math.max(0, Math.round(20 * (1 - titrantAdded / equivalenceVolume)))}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0F172A] border border-blue-500/30">
                    <div className="text-[10px] text-blue-400 font-bold">OH⁻ (Base)</div>
                    <div className="text-sm font-bold text-white">
                      {titrantAdded > equivalenceVolume
                        ? Math.round(15 * ((titrantAdded - equivalenceVolume) / 10))
                        : 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0F172A] border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-400 font-bold">H₂O (Water)</div>
                    <div className="text-sm font-bold text-white">
                      {Math.min(30, Math.round(30 * (titrantAdded / equivalenceVolume)))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Molecular Controls */}
              <div className="p-3 bg-[#0B1121] rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Inject Reactant Particles:</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSingleDrop}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-slate-950 font-bold uppercase tracking-wider"
                  >
                    Inject OH⁻ Drop
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: MATH VIEW (Governing Equations, ICE Table & Calculus) */}
          {viewMode === 'math' && (
            <div className="space-y-3 h-full flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                  Mathematical Equilibrium & Derivatives
                </span>

                {/* Adaptive Formula Card */}
                {(() => {
                  const f = FormulaExplanationEngine.getFormulaDetails('molarity');
                  return f ? <AdaptiveFormulaCard formula={f} academicLevel={academicLevel} /> : null;
                })()}

                {/* Live Concentration Substitution */}
                <div className="p-3.5 rounded-xl bg-[#0B1121] border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">
                    Equivalence Equation:
                  </div>
                  <div className="text-teal-300 font-bold text-sm">
                    C₁(acid) · V₁(acid) = C₂(base) · V₂(base)
                  </div>
                  <div className="text-slate-300 pt-1">
                    C₁ = ({titrantConc} M · {titrantAdded.toFixed(2)} mL) / {analyteVol} mL
                  </div>
                  <div className="text-white font-bold">
                    = {((titrantConc * titrantAdded) / analyteVol).toFixed(4)} M
                  </div>
                </div>

                {tier >= 4 && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs font-mono">
                    <span className="text-amber-400 font-bold uppercase text-[10px]">
                      First Derivative Equivalence Peak:
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      Inflection point occurs where d²(pH)/dV² = 0 and d(pH)/dV reaches its maximum asymptote.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleOpenWhy('Mathematical Derivation of pH Equivalence')}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-wider text-teal-400"
              >
                Inspect Complete Mathematical Derivation
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Titration Curve & Volumetric Analysis (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Live Titration Curve Plotter */}
          <div className="bg-[#111A2E] border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Titration Curve (pH vs Titrant Volume)</span>
                  {Math.abs(titrantAdded - equivalenceVolume) < 0.5 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
                      Equivalence Inflection!
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {tier === 1
                    ? 'Watch how the line leaps upward when the acid is completely neutralized.'
                    : 'Sigmoidal inflection curve plotting live pH trajectory against added base.'}
                </p>
              </div>

              {/* Indicator Picker */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px]">Indicator:</span>
                <select
                  value={indicator}
                  onChange={(e) => setIndicator(e.target.value as any)}
                  className="bg-[#0B1121] border border-slate-800 rounded-lg px-2 py-1 text-xs text-teal-300 focus:outline-none"
                  id="select-indicator"
                >
                  <option value="phenolphthalein">Phenolphthalein (8.2 - 10.0)</option>
                  <option value="bromothymol">Bromothymol Blue (6.0 - 7.6)</option>
                  <option value="methyl_orange">Methyl Orange (3.1 - 4.4)</option>
                </select>
              </div>
            </div>

            <ChartPlotter
              data={curveData}
              xLabel="Volume of NaOH Added"
              xUnit="mL"
              yLabel="pH"
              height={230}
              color="#2dd4bf"
            />
          </div>

          {/* Experimental Trials & Concordant Titres Card */}
          <div className="bg-[#111A2E] border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Volumetric Analysis & Unknown Concentration</span>
              </h3>
              <button
                onClick={handleRecordTrial}
                className="px-3 py-1 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 border border-teal-500/40 text-xs font-semibold uppercase tracking-wider"
                id="btn-record-trial"
              >
                Log Trial Result
              </button>
            </div>

            {/* Formula Breakdown: C1 V1 = C2 V2 */}
            <div className="p-3.5 rounded-xl bg-[#0B1121] border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-slate-400">Equivalence Formula:</div>
                <div className="font-mono text-teal-400 font-bold text-sm">
                  C₁ · V₁ (Acid) = C₂ · V₂ (Base)
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400">Calculated Acid Molarity:</div>
                <div className="font-mono text-white font-bold text-sm">
                  {concordantAverage
                    ? `${((titrantConc * concordantAverage) / analyteVol).toFixed(4)} M`
                    : 'Log at least 1 trial'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400">Theoretical Target:</div>
                <div className="font-mono text-emerald-400 font-bold text-sm">
                  {analyteConc.toFixed(4)} M
                </div>
              </div>
            </div>

            {/* Trial Table */}
            {trials.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="py-1.5 font-medium">Trial #</th>
                      <th className="py-1.5 font-medium">Titre (mL)</th>
                      <th className="py-1.5 font-medium">Calculated Molarity</th>
                      <th className="py-1.5 font-medium">Error (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {trials.map((t) => {
                      const errorPct = Math.abs(((t.calculatedMolarity - analyteConc) / analyteConc) * 100);
                      return (
                        <tr key={t.trialNum}>
                          <td className="py-1.5">Trial {t.trialNum}</td>
                          <td className="py-1.5 text-white">{t.titre.toFixed(2)} mL</td>
                          <td className="py-1.5 text-teal-400">{t.calculatedMolarity} M</td>
                          <td className="py-1.5 text-emerald-400">{errorPct.toFixed(2)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mistake Feedback Banner (if user overshot or stopped early) */}
      <MistakeFeedbackBanner feedback={mistake} onRetry={handleReset} />

      {/* "What-If" Dynamic Causality Chain */}
      <WhatIfPanel scenarios={WhatIfEngine.getScenariosForLab('titration')} />

      {/* Experiment Result Panel (Separates Input, Calculation, Observation, Result, Application, Traceability) */}
      <ExperimentResultPanel breakdown={resultBreakdown} academicLevel={academicLevel} />

      {/* Real-World Connections & Knowledge Graph */}
      <RealWorldApplicationCard
        topicTitle="Acid-Base Titrations"
        applications={[
          {
            title: 'Pharmaceutical Assay Testing',
            field: 'Healthcare & Pharma',
            description: 'Purity and active ingredient content verification in aspirins, antibiotics, and intravenous fluids.'
          },
          {
            title: 'Wastewater Effluent Neutralization',
            field: 'Environmental Engineering',
            description: 'Automated continuous base injection to neutralize acidic industrial effluents prior to municipal discharge.'
          },
          {
            title: 'Food & Dairy Acidity Quality Control',
            field: 'Food Science',
            description: 'Titration of lactic acid in milk and acetic acid in vinegar to verify freshness and fermentation standards.'
          }
        ]}
      />

      <RelatedConceptsGraph
        currentConcept="Titration & Neutralization"
        relatedConcepts={[
          { id: 'acid_base', name: 'Acid-Base pH Dynamics', relation: 'Foundation', category: 'Analytical' },
          { id: 'stoichiometry', name: 'Stoichiometric Moles', relation: 'Mathematical Law', category: 'Physical' },
          { id: 'equilibrium', name: 'Weak Acid Ka & Buffers', relation: 'Equilibrium', category: 'General' },
          { id: 'kinetics', name: 'Neutralization Kinetics', relation: 'Rate', category: 'Physical' }
        ]}
      />

      {/* Interactive "Why?" Explanation Modal */}
      {activeWhyExplanation && (
        <WhyModal
          isOpen={isWhyModalOpen}
          onClose={() => setIsWhyModalOpen(false)}
          explanation={activeWhyExplanation}
          academicLevel={academicLevel}
        />
      )}
    </div>
  );
};
