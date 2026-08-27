import React, { useState } from 'react';
import {
  X,
  Power,
  Sliders,
  Gauge,
  Activity,
  Zap,
  RotateCw,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Thermometer,
  ShieldCheck,
  Flame,
  ArrowDownToLine,
  RefreshCw,
} from 'lucide-react';
import { EQUIPMENT_LIST, PROCESS_STAGES_ORDER } from '../data/plantData';
import { EquipmentId, EquipmentRuntimeState, Language } from '../types';

interface EquipmentDetailModalProps {
  equipmentId: EquipmentId;
  runtimeState: EquipmentRuntimeState;
  language: Language;
  onClose: () => void;
  onNavigate: (id: EquipmentId) => void;
  onUpdateState: (id: EquipmentId, updates: Partial<EquipmentRuntimeState>) => void;
  onTriggerBackwash?: () => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipmentId,
  runtimeState,
  language,
  onClose,
  onNavigate,
  onUpdateState,
  onTriggerBackwash,
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'controls' | 'specs' | 'process'>('telemetry');
  const [isBackwashing, setIsBackwashing] = useState(false);

  const eq = EQUIPMENT_LIST.find((item) => item.id === equipmentId);
  if (!eq) return null;

  const isBn = language === 'bn';
  const currentIndex = PROCESS_STAGES_ORDER.indexOf(equipmentId);
  const prevId = currentIndex > 0 ? PROCESS_STAGES_ORDER[currentIndex - 1] : null;
  const nextId = currentIndex < PROCESS_STAGES_ORDER.length - 1 ? PROCESS_STAGES_ORDER[currentIndex + 1] : null;

  const handleTogglePower = () => {
    onUpdateState(equipmentId, {
      isRunning: !runtimeState.isRunning,
      status: !runtimeState.isRunning ? 'running' : 'stopped',
    });
  };

  const handleRpmChange = (newRpm: number) => {
    onUpdateState(equipmentId, {
      motorRpm: newRpm,
      telemetry: {
        ...runtimeState.telemetry,
        motorRpm: newRpm,
        flowRate: Math.round((newRpm / 1500) * eq.defaultTelemetry.flowRate),
      },
    });
  };

  const handleDoseChange = (newDose: number) => {
    onUpdateState(equipmentId, {
      chemicalDosingRate: newDose,
      telemetry: {
        ...runtimeState.telemetry,
        chemicalDose: newDose,
      },
    });
  };

  const handleBackwashClick = () => {
    setIsBackwashing(true);
    if (onTriggerBackwash) onTriggerBackwash();
    setTimeout(() => {
      setIsBackwashing(false);
    }, 4000);
  };

  // Water purification percentage calculation
  const turbIn = runtimeState.telemetry.turbidityIn;
  const turbOut = runtimeState.telemetry.turbidityOut;
  const removalRate = turbIn > 0 ? Math.max(0, ((turbIn - turbOut) / turbIn) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] lg:w-[540px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Top Navigation & Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Previous / Next buttons */}
          <div className="flex items-center gap-1">
            <button
              disabled={!prevId}
              onClick={() => prevId && onNavigate(prevId)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition-all"
              title="Previous Process Stage"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 px-1">
              {currentIndex + 1} / {PROCESS_STAGES_ORDER.length}
            </span>
            <button
              disabled={!nextId}
              onClick={() => nextId && onNavigate(nextId)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition-all"
              title="Next Process Stage"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Close Button */}
          <button
            id="close-equipment-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 hover:text-rose-400 text-slate-400 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block text-[11px] font-semibold tracking-wider text-sky-400 uppercase mb-1">
              {isBn ? eq.categoryBn : eq.categoryEn}
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
              {isBn ? eq.nameBn : eq.nameEn}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                runtimeState.isRunning
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full mr-1.5 ${runtimeState.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {runtimeState.isRunning ? (isBn ? 'সচল (RUNNING)' : 'ACTIVE') : (isBn ? 'বন্ধ (STOPPED)' : 'OFFLINE')}
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="grid grid-cols-4 gap-1 mt-4 p-1 bg-slate-900 rounded-xl border border-slate-800">
          {[
            { id: 'telemetry', labelBn: 'লাইভ ডাটা', labelEn: 'Telemetry', icon: Activity },
            { id: 'controls', labelBn: 'কন্ট্রোল', labelEn: 'Controls', icon: Sliders },
            { id: 'process', labelBn: 'কার্যপদ্ধতি', labelEn: 'Process', icon: Layers },
            { id: 'specs', labelBn: 'স্পেসিফিকেশন', labelEn: 'Specs', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                  isTabActive
                    ? 'bg-sky-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isBn ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
        {/* TAB 1: TELEMETRY & LIVE SENSOR METRICS */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            {/* Quick Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80">
              <p className="text-xs text-slate-300 leading-relaxed">
                {isBn ? eq.shortDescBn : eq.shortDescEn}
              </p>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Flow Rate */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    {isBn ? 'পানি প্রবাহ (Flow)' : 'Flow Rate'}
                  </span>
                  <span className="text-[10px] text-emerald-400">Normal</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  {runtimeState.isRunning ? runtimeState.telemetry.flowRate : 0}{' '}
                  <span className="text-xs font-normal text-slate-400">m³/hr</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (runtimeState.telemetry.flowRate / 3000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Turbidity Comparison (In vs Out) */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    {isBn ? 'টার্বিডিটি (ঘোলাত্ব)' : 'Turbidity'}
                  </span>
                  <span className="text-[10px] text-sky-400">-{removalRate}%</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white font-mono">{runtimeState.telemetry.turbidityOut}</span>
                  <span className="text-xs text-slate-400">NTU</span>
                  <span className="text-[10px] text-slate-500 line-through">({runtimeState.telemetry.turbidityIn})</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (runtimeState.telemetry.turbidityOut / 100) * 100)}%` }}
                  />
                </div>
              </div>

              {/* pH Level */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
                    {isBn ? 'পিএইচ মান (pH)' : 'pH Level'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {runtimeState.telemetry.phLevel >= 6.5 && runtimeState.telemetry.phLevel <= 8.5 ? 'Balanced' : 'Check'}
                  </span>
                </div>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  {runtimeState.telemetry.phLevel}
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-2">
                  <span>6.5 Acidic</span>
                  <span className="text-emerald-300 font-bold">7.2 Neutral</span>
                  <span>8.5 Alkaline</span>
                </div>
              </div>

              {/* Operating Pressure */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-blue-400" />
                    {isBn ? 'ইন-লাইন প্রেশার' : 'Pressure'}
                  </span>
                  <span className="text-[10px] text-slate-400">Head</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  {runtimeState.isRunning ? runtimeState.telemetry.pressure : 0}{' '}
                  <span className="text-xs font-normal text-slate-400">Bar</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (runtimeState.telemetry.pressure / 10) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Motor / Agitator RPM */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                    {isBn ? 'মোটর গতি (RPM)' : 'Motor Speed'}
                  </span>
                  <span className="text-[10px] text-purple-300">{runtimeState.isRunning ? 'VFD Active' : 'Idle'}</span>
                </div>
                <div className="text-xl font-bold text-purple-300 font-mono">
                  {runtimeState.isRunning ? runtimeState.motorRpm : 0}{' '}
                  <span className="text-xs font-normal text-slate-400">RPM</span>
                </div>
              </div>

              {/* Power Consumption */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    {isBn ? 'বিদ্যুৎ খরচ' : 'Power Usage'}
                  </span>
                  <span className="text-[10px] text-yellow-400">Online</span>
                </div>
                <div className="text-xl font-bold text-yellow-300 font-mono">
                  {runtimeState.isRunning ? runtimeState.telemetry.energyConsumption : 0}{' '}
                  <span className="text-xs font-normal text-slate-400">kW</span>
                </div>
              </div>
            </div>

            {/* Additional Stage-Specific Quality Badges */}
            {runtimeState.telemetry.freeChlorine !== undefined && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-xs font-semibold text-cyan-200">
                      {isBn ? 'রেসিডুয়াল ফ্রি ক্লোরিন সুরক্ষা' : 'Residual Free Chlorine'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isBn ? 'জীবাণুনাশক মান বিশ্ব স্বাস্থ্য সংস্থার মানসম্মত' : 'WHO Potable Chlorine Guideline Standard'}
                    </div>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono text-cyan-300">
                  {runtimeState.telemetry.freeChlorine} mg/L
                </span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERACTIVE CONTROLS & OVERRIDES */}
        {activeTab === 'controls' && (
          <div className="space-y-5">
            {/* Master Power Toggle for this Equipment */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${runtimeState.isRunning ? 'bg-emerald-600/30 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {isBn ? 'যন্ত্রাংশ পাওয়ার অন/অফ' : 'Equipment Power Switch'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {isBn ? 'পাম্প বা মোটরের সঞ্চলন সক্রিয় অথবা বন্ধ করুন' : 'Engage or isolate mechanical operation'}
                  </div>
                </div>
              </div>

              <button
                id="equipment-power-toggle"
                onClick={handleTogglePower}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                  runtimeState.isRunning
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40'
                }`}
              >
                {runtimeState.isRunning ? (isBn ? 'বন্ধ করুন' : 'STOP') : (isBn ? 'চালু করুন' : 'START')}
              </button>
            </div>

            {/* Motor / Agitator Speed Slider (VFD) */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-sky-400" />
                  {isBn ? 'মোটর গতি নিয়ন্ত্রণ (VFD RPM Slider)' : 'Drive Motor Speed (RPM)'}
                </label>
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
                  {runtimeState.motorRpm} RPM
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={equipmentId === 'coagulation' ? 600 : equipmentId === 'flocculation' ? 40 : 1800}
                step={equipmentId === 'flocculation' ? 1 : 25}
                value={runtimeState.motorRpm}
                onChange={(e) => handleRpmChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 RPM (Idle)</span>
                <span>50%</span>
                <span>Max RPM</span>
              </div>
            </div>

            {/* Chemical Dosing Control (for Coagulation / UV-Chlorination) */}
            {(equipmentId === 'coagulation' || equipmentId === 'chlorination' || equipmentId === 'sludge_treatment') && (
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-amber-400" />
                    {isBn ? 'রাসায়নিক ডোজিং রেট (Chemical Dosing)' : 'Chemical Dosing Rate (mg/L)'}
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                    {runtimeState.chemicalDosingRate || eq.defaultTelemetry.chemicalDose} mg/L
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={equipmentId === 'coagulation' ? 80 : 10}
                  step="0.5"
                  value={runtimeState.chemicalDosingRate || eq.defaultTelemetry.chemicalDose}
                  onChange={(e) => handleDoseChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-[11px] text-slate-400">
                  {isBn
                    ? 'নদীর পানির ঘোলাত্ব অনুযায়ী ডোজিং বাড়ালে দ্রুত কণা থিতিয়ে পড়ে।'
                    : 'Adjust coagulant/disinfectant flow to optimize clarification kinetics.'}
                </p>
              </div>
            )}

            {/* Filter Backwash Trigger Button (For Filtration Building) */}
            {equipmentId === 'filtration' && (
              <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-sky-200">
                      {isBn ? 'স্বয়ংক্রিয় ব্যাকওয়াশ প্রসেস' : 'Automated Media Backwash'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {isBn ? 'বালু ও কার্বন ফিল্টারের বর্জ্য উল্টো পানির চাপে ধুয়ে ফেলুন' : 'Reverse fluidize sand/carbon bed to purge trapped silt'}
                    </div>
                  </div>
                  <button
                    disabled={isBackwashing}
                    onClick={handleBackwashClick}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white transition-all shadow-md"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isBackwashing ? 'animate-spin' : ''}`} />
                    <span>{isBackwashing ? (isBn ? 'ব্যাকওয়াশ চলছে...' : 'Flushing...') : (isBn ? 'ব্যাকওয়াশ শুরু' : 'Start Backwash')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STEP BY STEP PROCESS & SCIENTIFIC PRINCIPLE */}
        {activeTab === 'process' && (
          <div className="space-y-4">
            {/* Scientific Principle Card */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {isBn ? 'কাজের বৈজ্ঞানিক ভিত্তি (Working Principle)' : 'Scientific Operating Principle'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isBn ? eq.workingPrincipleBn : eq.workingPrincipleEn}
              </p>
            </div>

            {/* Full Explanation */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {isBn ? 'বিস্তারিত বর্ণনা (Detailed Overview)' : 'Comprehensive Overview'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isBn ? eq.fullDescBn : eq.fullDescEn}
              </p>
            </div>

            {/* Step by Step Execution Chain */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                {isBn ? 'পরিশোধন প্রক্রিয়ার ৪টি মূল ধাপ' : 'Operational Sequence Steps'}
              </h3>
              <div className="space-y-2.5">
                {(isBn ? eq.processStepsBn : eq.processStepsEn).map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-sky-600/30 text-sky-400 border border-sky-500/40 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KEY ENGINEERING SPECIFICATIONS */}
        {activeTab === 'specs' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                {isBn ? 'ইঞ্জিনিয়ারিং স্পেসিফিকেশন ও ডাটা' : 'Design & Engineering Parameters'}
              </h3>
              <div className="divide-y divide-slate-700/60">
                {eq.keySpecs.map((spec, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{isBn ? spec.labelBn : spec.labelEn}</span>
                    <span className="font-semibold text-white font-mono">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Close/Action Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
        <span>{isBn ? '৩ডি ভিউতে ক্যামেরা ফোকাস করা হয়েছে' : 'Camera locked on 3D coordinates'}</span>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all"
        >
          {isBn ? 'বন্ধ করুন' : 'Close Drawer'}
        </button>
      </div>
    </div>
  );
};
