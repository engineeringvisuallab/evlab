/**
 * 3D Water Treatment Plant Visualization & Interactive Engineering Simulation
 * Built with Three.js, React, Tailwind CSS, and Web Audio Synthesizer
 */

import React, { useState, useEffect, useCallback } from 'react';
import { EQUIPMENT_LIST, PROCESS_STAGES_ORDER } from './data/plantData';
import { EquipmentId, EquipmentRuntimeState, Language, PlantScenario, PlantState, TimeOfDay } from './types';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Header } from './components/Header';
import { ProcessFlowBanner } from './components/ProcessFlowBanner';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { ScadaDashboard } from './components/ScadaDashboard';
import { GuidedTour } from './components/GuidedTour';
import { WaterQualityBar } from './components/WaterQualityBar';
import { plantAudio } from './utils/audio';
import confetti from 'canvas-confetti';

export default function App() {
  // Initialize equipment runtime states
  const initialEquipmentStates = EQUIPMENT_LIST.reduce((acc, eq) => {
    acc[eq.id] = {
      id: eq.id,
      isRunning: true,
      status: 'running',
      motorRpm: eq.defaultTelemetry.motorRpm,
      flowRate: eq.defaultTelemetry.flowRate,
      tankLevel: eq.defaultTelemetry.tankLevel,
      chemicalDosingRate: eq.defaultTelemetry.chemicalDose,
      valveOpen: true,
      telemetry: { ...eq.defaultTelemetry },
    };
    return acc;
  }, {} as Record<EquipmentId, EquipmentRuntimeState>);

  const [plantState, setPlantState] = useState<PlantState>({
    isMasterRunning: true,
    simSpeed: 1,
    timeOfDay: 'day',
    scenario: 'normal',
    language: 'bn', // Bengali by default as requested
    soundEnabled: false,
    activeEquipmentId: null,
    cameraView: 'overview',
    tourActive: false,
    tourStep: 0,
    equipmentStates: initialEquipmentStates,
    waterQuality: {
      rawRiverTurbidity: 165,
      coagulatedTurbidity: 140,
      settledTurbidity: 8.5,
      filteredTurbidity: 0.28,
      finishedWaterTurbidity: 0.18,
      finishedPh: 7.35,
      finishedChlorine: 0.68,
      totalTreatedToday: 52480,
      activeAlarms: [],
    },
  });

  const [scadaOpen, setScadaOpen] = useState(false);
  const [hoveredEquipment, setHoveredEquipment] = useState<EquipmentId | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Audio Sync
  const handleToggleSound = () => {
    const nextSound = !plantState.soundEnabled;
    setPlantState((prev) => ({ ...prev, soundEnabled: nextSound }));
    plantAudio.setEnabled(nextSound);
    if (nextSound) {
      plantAudio.playClickSound();
      showToast(plantState.language === 'bn' ? 'সাউন্ড সিস্টেম সক্রিয় করা হয়েছে' : 'Industrial sound engine activated');
    }
  };

  // Master Power Run/Stop
  const handleToggleMaster = () => {
    const nextRunning = !plantState.isMasterRunning;
    setPlantState((prev) => ({ ...prev, isMasterRunning: nextRunning }));
    plantAudio.playToggleSound(nextRunning);
    showToast(
      plantState.language === 'bn'
        ? nextRunning
          ? 'প্লান্টের সকল পাম্প ও পানি পরিশোধন সক্রিয়'
          : 'প্লান্ট সাময়িকভাবে স্থগিত করা হয়েছে'
        : nextRunning
        ? 'Plant operations resumed'
        : 'Plant simulation paused'
    );
  };

  // Simulation Speed
  const handleChangeSpeed = (speed: number) => {
    setPlantState((prev) => ({ ...prev, simSpeed: speed }));
    plantAudio.playClickSound();
  };

  // Weather / Time of Day
  const handleChangeTimeOfDay = (time: TimeOfDay) => {
    setPlantState((prev) => ({ ...prev, timeOfDay: time }));
    plantAudio.playClickSound();
  };

  // Scenario Changer
  const handleChangeScenario = (sc: PlantScenario) => {
    setPlantState((prev) => {
      let rawNTU = 165;
      if (sc === 'monsoon_turbidity') rawNTU = 285;
      return {
        ...prev,
        scenario: sc,
        waterQuality: {
          ...prev.waterQuality,
          rawRiverTurbidity: rawNTU,
        },
      };
    });
    plantAudio.playInspectChime();
    showToast(
      plantState.language === 'bn'
        ? `সিনারিও সক্রিয়: ${sc === 'monsoon_turbidity' ? 'বর্ষার অতিরিক্ত ঘোলা পানি' : sc === 'filter_backwash' ? 'ফিল্টার ব্যাকওয়াশ সাইকেল' : sc === 'power_saving' ? 'বিদ্যুৎ সাশ্রয়ী মোড' : 'স্বাভাবিক চালনা'}`
        : `Scenario switched: ${sc}`
    );
  };

  // Language Switcher
  const handleToggleLanguage = () => {
    setPlantState((prev) => {
      const nextLang: Language = prev.language === 'bn' ? 'en' : 'bn';
      return { ...prev, language: nextLang };
    });
    plantAudio.playClickSound();
  };

  // Equipment Selection
  const handleSelectEquipment = (id: EquipmentId) => {
    setPlantState((prev) => ({
      ...prev,
      activeEquipmentId: id,
      tourActive: false, // Cancel auto tour if manual clicked
    }));
    plantAudio.playInspectChime();
  };

  const handleCloseEquipment = () => {
    setPlantState((prev) => ({ ...prev, activeEquipmentId: null }));
    plantAudio.playClickSound();
  };

  // Reset Camera View
  const handleResetCamera = () => {
    setPlantState((prev) => ({
      ...prev,
      activeEquipmentId: null,
      tourActive: false,
    }));
    plantAudio.playClickSound();
    showToast(plantState.language === 'bn' ? 'ক্যামেরা ওভারভিউ ভিউতে রিসেট করা হয়েছে' : 'Camera reset to plant overview');
  };

  // Update Individual Equipment State
  const handleUpdateEquipmentState = (id: EquipmentId, updates: Partial<EquipmentRuntimeState>) => {
    setPlantState((prev) => ({
      ...prev,
      equipmentStates: {
        ...prev.equipmentStates,
        [id]: {
          ...prev.equipmentStates[id],
          ...updates,
        },
      },
    }));
    plantAudio.playClickSound();
  };

  // Trigger Backwash
  const handleTriggerBackwash = () => {
    plantAudio.playToggleSound(true);
    showToast(plantState.language === 'bn' ? 'ফিল্ট্রেশন বেডে রিভার্স ওয়াটার ব্যাকওয়াশ শুরু হয়েছে' : 'Air scour & reverse backwash initiated');
  };

  // Guided Tour Handlers
  const handleStartTour = () => {
    setPlantState((prev) => ({
      ...prev,
      tourActive: true,
      tourStep: 0,
      activeEquipmentId: PROCESS_STAGES_ORDER[0],
    }));
    plantAudio.playInspectChime();
  };

  const handleNextTourStep = () => {
    setPlantState((prev) => {
      const nextStep = prev.tourStep + 1;
      if (nextStep >= PROCESS_STAGES_ORDER.length) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        return { ...prev, tourActive: false, activeEquipmentId: null };
      }
      return {
        ...prev,
        tourStep: nextStep,
        activeEquipmentId: PROCESS_STAGES_ORDER[nextStep],
      };
    });
    plantAudio.playInspectChime();
  };

  const handlePrevTourStep = () => {
    setPlantState((prev) => {
      const prevStep = Math.max(0, prev.tourStep - 1);
      return {
        ...prev,
        tourStep: prevStep,
        activeEquipmentId: PROCESS_STAGES_ORDER[prevStep],
      };
    });
    plantAudio.playInspectChime();
  };

  const handleSelectTourStep = (step: number) => {
    setPlantState((prev) => ({
      ...prev,
      tourStep: step,
      activeEquipmentId: PROCESS_STAGES_ORDER[step],
    }));
    plantAudio.playInspectChime();
  };

  const handleCloseTour = () => {
    setPlantState((prev) => ({
      ...prev,
      tourActive: false,
    }));
    plantAudio.playClickSound();
  };

  // Real-time telemetry oscillation loop
  useEffect(() => {
    if (!plantState.isMasterRunning) return;

    const interval = setInterval(() => {
      setPlantState((prev) => {
        const nextStates = { ...prev.equipmentStates };
        Object.keys(nextStates).forEach((key) => {
          const eqId = key as EquipmentId;
          const st = nextStates[eqId];
          if (!st || !st.isRunning) return;

          const jitter = (Math.random() - 0.5) * 0.05;
          const newFlow = Math.round(st.telemetry.flowRate * (1 + jitter * 0.02));
          const newPh = Number((st.telemetry.phLevel + jitter * 0.04).toFixed(2));

          nextStates[eqId] = {
            ...st,
            telemetry: {
              ...st.telemetry,
              flowRate: newFlow,
              phLevel: Math.max(6.8, Math.min(7.8, newPh)),
            },
          };
        });

        return {
          ...prev,
          equipmentStates: nextStates,
        };
      });
    }, 2000 / plantState.simSpeed);

    return () => clearInterval(interval);
  }, [plantState.isMasterRunning, plantState.simSpeed]);

  const activeEquipmentState = plantState.activeEquipmentId
    ? plantState.equipmentStates[plantState.activeEquipmentId]
    : null;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Header Navigation Bar */}
      <Header
        plantState={plantState}
        onToggleMaster={handleToggleMaster}
        onChangeSpeed={handleChangeSpeed}
        onChangeTimeOfDay={handleChangeTimeOfDay}
        onChangeScenario={handleChangeScenario}
        onToggleSound={handleToggleSound}
        onToggleLanguage={handleToggleLanguage}
        onStartTour={handleStartTour}
        onResetCamera={handleResetCamera}
        onToggleScada={() => setScadaOpen(!scadaOpen)}
        scadaOpen={scadaOpen}
      />

      {/* 2. Water Quality Widget (Top Left) */}
      <WaterQualityBar plantState={plantState} language={plantState.language} />

      {/* 3. Main 3D WebGL Canvas */}
      <ThreeCanvas
        plantState={plantState}
        onSelectEquipment={handleSelectEquipment}
        hoveredEquipment={hoveredEquipment}
        setHoveredEquipment={setHoveredEquipment}
      />

      {/* 4. Sequential Process Flow Bar (Bottom) */}
      <ProcessFlowBanner
        activeEquipmentId={plantState.activeEquipmentId}
        onSelectEquipment={handleSelectEquipment}
        language={plantState.language}
      />

      {/* 5. Equipment Inspection Drawer / Modal */}
      {plantState.activeEquipmentId && activeEquipmentState && !plantState.tourActive && (
        <EquipmentDetailModal
          equipmentId={plantState.activeEquipmentId}
          runtimeState={activeEquipmentState}
          language={plantState.language}
          onClose={handleCloseEquipment}
          onNavigate={handleSelectEquipment}
          onUpdateState={handleUpdateEquipmentState}
          onTriggerBackwash={handleTriggerBackwash}
        />
      )}

      {/* 6. Central SCADA Dashboard Panel */}
      {scadaOpen && (
        <ScadaDashboard
          plantState={plantState}
          onClose={() => setScadaOpen(false)}
          onChangeScenario={handleChangeScenario}
        />
      )}

      {/* 7. Guided Tour Mode Overlay */}
      {plantState.tourActive && (
        <GuidedTour
          currentStep={plantState.tourStep}
          onNext={handleNextTourStep}
          onPrev={handlePrevTourStep}
          onClose={handleCloseTour}
          onSelectStep={handleSelectTourStep}
          language={plantState.language}
        />
      )}

      {/* Toast Notifications */}
      {toastMessage && (
        <div className="absolute top-20 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-slate-900/95 border border-sky-500/50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            {toastMessage}
          </div>
        </div>
      )}
    </main>
  );
}
