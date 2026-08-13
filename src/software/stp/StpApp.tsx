/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Master Application Entry Shell (embedded module)
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProjectState } from './types/stp';
import { PersistenceEngine } from './engine/persistence';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { DashboardPanel } from './components/DashboardPanel';
import { DesignBasisPanel } from './components/DesignBasisPanel';
import { WastewaterQualityPanel } from './components/WastewaterQualityPanel';
import { ParameterRegistryPanel } from './components/ParameterRegistryPanel';
import { ScenariosAlternativesPanel } from './components/ScenariosAlternativesPanel';
import { CalculationsInspectorPanel } from './components/CalculationsInspectorPanel';
import { ValidationAuditPanel } from './components/ValidationAuditPanel';
import { TestRunnerModal } from './components/TestRunnerModal';
import { AssumptionEngine } from './engine/assumptions';

export default function StpApp() {
  const [project, setProject] = useState<ProjectState>(() => PersistenceEngine.loadFromLocalStorage());
  const [activeTab, setActiveTab] = useState<TabKey>('DASHBOARD');
  const [selectedCalcId, setSelectedCalcId] = useState<string>('');
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);

  // Auto-save state to localStorage whenever project changes
  useEffect(() => {
    PersistenceEngine.saveToLocalStorage(project);
  }, [project]);

  const handleUpdateProject = (updated: ProjectState) => {
    setProject(updated);
  };

  const handleSave = () => {
    PersistenceEngine.saveToLocalStorage(project);
    alert('STP Project state successfully saved to browser local persistence.');
  };

  const handleExport = () => {
    PersistenceEngine.exportProjectToFile(project);
  };

  const handleSwitchScenario = (scenId: string) => {
    if (project.scenarios[scenId]) {
      const updated: ProjectState = { ...project, activeScenarioId: scenId };
      setProject(updated);
    }
  };

  const handleInspectCalculation = (calcId: string) => {
    setSelectedCalcId(calcId);
    setActiveTab('CALCULATIONS');
  };

  const unresolvedCount = AssumptionEngine.getUnresolvedInputs(project).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-900 selection:text-cyan-200">
      {/* Header */}
      <Header
        project={project}
        onSave={handleSave}
        onExport={handleExport}
        onOpenTests={() => setIsTestModalOpen(true)}
        onSwitchScenario={handleSwitchScenario}
      />

      {/* Navigation Tabs Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unresolvedCount={unresolvedCount}
      />

      {/* Active Tab View Body */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'DASHBOARD' && <DashboardPanel project={project} />}

        {activeTab === 'DESIGN_BASIS' && (
          <DesignBasisPanel
            project={project}
            onUpdateProject={handleUpdateProject}
            onInspectCalculation={handleInspectCalculation}
          />
        )}

        {activeTab === 'WASTEWATER_QUALITY' && (
          <WastewaterQualityPanel project={project} onUpdateProject={handleUpdateProject} />
        )}

        {activeTab === 'PARAMETER_REGISTRY' && <ParameterRegistryPanel project={project} />}

        {activeTab === 'SCENARIOS_ALTERNATIVES' && (
          <ScenariosAlternativesPanel
            project={project}
            onUpdateProject={handleUpdateProject}
            onSwitchScenario={handleSwitchScenario}
          />
        )}

        {activeTab === 'CALCULATIONS' && (
          <CalculationsInspectorPanel project={project} selectedCalcId={selectedCalcId} />
        )}

        {activeTab === 'VALIDATION_AUDIT' && <ValidationAuditPanel project={project} />}
      </main>

      {/* Automated Unit Test Runner Modal */}
      <TestRunnerModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} />
    </div>
  );
}
