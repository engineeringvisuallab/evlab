/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * EVLab Fluid Mechanics Virtual Lab
 * "From Equation to Real Flow"
 */

import React, { useState } from 'react';
import { LabTopicId, UnitSystem, FluidProperty } from './types';
import { getFluidProperties } from './core/fluidEngine';
import { ExperimentPreset } from './core/experimentPresets';
import { EquationDefinition } from './core/equationRegistry';
import { LabTopicNavbar } from './components/navigation/LabTopicNavbar';
import { LabsCatalogDashboard } from './components/dashboard/LabsCatalogDashboard';
import { MasterSimulationWorkspace } from './components/simulation/MasterSimulationWorkspace';
import { EquationExplorerModal } from './components/panels/EquationExplorerModal';
import { PresetSelectorModal } from './components/panels/PresetSelectorModal';
import { FluidPropertiesModal } from './components/panels/FluidPropertiesModal';
import { EngineeringReportModal } from './components/panels/EngineeringReportModal';
import { AiFluidTutorPanel } from './components/panels/AiFluidTutorPanel';
import { X, Sparkles, Bot } from 'lucide-react';

export default function FluidMechanicsLab() {
  const [currentLabId, setCurrentLabId] = useState<LabTopicId | 'dashboard'>('dashboard');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('SI');
  const [fluid, setFluid] = useState<FluidProperty>(() => getFluidProperties('water', 20));

  // Modal Controls
  const [isEquationsOpen, setIsEquationsOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isFluidModalOpen, setIsFluidModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);

  const handleSelectPreset = (preset: ExperimentPreset) => {
    setCurrentLabId(preset.labId);
  };

  const handleSelectEquation = (eq: EquationDefinition) => {
    // Navigate or inspect equation
    setIsEquationsOpen(false);
  };

  const handleToggleUnits = () => {
    setUnitSystem((prev) => (prev === 'SI' ? 'US' : 'SI'));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-slate-950">
      {/* Top Engineering Navbar */}
      <LabTopicNavbar
        currentLabId={currentLabId}
        onSelectLab={(id) => setCurrentLabId(id)}
        unitSystem={unitSystem}
        onToggleUnitSystem={handleToggleUnits}
        fluid={fluid}
        onOpenFluidModal={() => setIsFluidModalOpen(true)}
        onOpenEquationsModal={() => setIsEquationsOpen(true)}
        onOpenPresetsModal={() => setIsPresetsOpen(true)}
        onOpenAiTutor={() => setIsAiTutorOpen(true)}
        onGenerateReport={() => setIsReportOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentLabId === 'dashboard' ? (
          <LabsCatalogDashboard
            onSelectLab={(id) => setCurrentLabId(id)}
            onOpenPresets={() => setIsPresetsOpen(true)}
            onOpenEquations={() => setIsEquationsOpen(true)}
            onOpenAiTutor={() => setIsAiTutorOpen(true)}
          />
        ) : (
          <MasterSimulationWorkspace
            labId={currentLabId}
            fluid={fluid}
            unitSystem={unitSystem}
          />
        )}
      </main>

      {/* Floating AI Assistant Quick Trigger (if not open) */}
      {!isAiTutorOpen && (
        <button
          onClick={() => setIsAiTutorOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 border border-sky-300/30 transition-all hover:scale-105 cursor-pointer"
        >
          <Bot className="w-4 h-4 text-slate-950" />
          <span className="text-xs font-extrabold">Ask AI Fluid Tutor</span>
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
        </button>
      )}

      {/* AI Tutor Drawer / Overlay Modal */}
      {isAiTutorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end sm:p-6 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setIsAiTutorOpen(false)}
              className="absolute -top-3 -right-3 z-50 w-7 h-7 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <AiFluidTutorPanel
              labId={currentLabId === 'dashboard' ? 'continuity' : currentLabId}
              parameters={{}}
              results={{}}
              fluid={fluid}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <EquationExplorerModal
        isOpen={isEquationsOpen}
        onClose={() => setIsEquationsOpen(false)}
        onSelectEquation={handleSelectEquation}
      />

      <PresetSelectorModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
        currentLabId={currentLabId === 'dashboard' ? undefined : currentLabId}
      />

      <FluidPropertiesModal
        isOpen={isFluidModalOpen}
        onClose={() => setIsFluidModalOpen(false)}
        currentFluid={fluid}
        onSelectFluid={(f) => setFluid(f)}
      />

      <EngineeringReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        labId={currentLabId}
        fluid={fluid}
        unitSystem={unitSystem}
      />
    </div>
  );
}
