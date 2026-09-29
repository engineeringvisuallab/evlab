import React, { useState } from 'react';
import { AcademicLevel } from './types/chemistry';
import { Navbar } from './components/Navbar';

// Views
import { HomeView } from './components/views/HomeView';
import { LearnView } from './components/views/LearnView';
import { MolecularLabView } from './components/views/MolecularLabView';
import { CalculatorView } from './components/views/CalculatorView';
import { ExperimentsView } from './components/views/ExperimentsView';

// Lab Experiments
import { TitrationLab } from './components/experiments/TitrationLab';
import { AtomicStructureLab } from './components/experiments/AtomicStructureLab';
import { PeriodicTableLab } from './components/experiments/PeriodicTableLab';
import { GasLawLab } from './components/experiments/GasLawLab';
import { AcidBaseLab } from './components/experiments/AcidBaseLab';
import { StoichiometryLab } from './components/experiments/StoichiometryLab';
import { KineticsLab } from './components/experiments/KineticsLab';
import { EquilibriumLab } from './components/experiments/EquilibriumLab';
import { ElectrochemistryLab } from './components/experiments/ElectrochemistryLab';
import { OrganicChemistryLab } from './components/experiments/OrganicChemistryLab';
import { BondingLab } from './components/experiments/BondingLab';
import { ThermochemistryLab } from './components/experiments/ThermochemistryLab';
import { EquationBalancerLab } from './components/experiments/EquationBalancerLab';

import { ArrowLeft } from 'lucide-react';

export function ChemistryLab() {
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('College / AP Chemistry');
  const [currentTab, setCurrentTab] = useState<'home' | 'experiments' | 'molecules' | 'learn' | 'calculator'>('home');
  const [activeLabId, setActiveLabId] = useState<string | null>(null);
  const [selectedLearnTopicId, setSelectedLearnTopicId] = useState<string | undefined>(undefined);

  const handleLaunchLab = (labId: string) => {
    setActiveLabId(labId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLearn = (topicId?: string) => {
    setSelectedLearnTopicId(topicId);
    setCurrentTab('learn');
    setActiveLabId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setActiveLabId(null);
  };

  const renderActiveLab = () => {
    switch (activeLabId) {
      case 'titration':
        return <TitrationLab academicLevel={academicLevel} />;
      case 'atomic_structure':
        return <AtomicStructureLab academicLevel={academicLevel} />;
      case 'periodic_table':
        return <PeriodicTableLab academicLevel={academicLevel} />;
      case 'gas_law':
        return <GasLawLab academicLevel={academicLevel} />;
      case 'acid_base':
        return <AcidBaseLab academicLevel={academicLevel} />;
      case 'stoichiometry':
        return <StoichiometryLab academicLevel={academicLevel} />;
      case 'kinetics':
        return <KineticsLab academicLevel={academicLevel} />;
      case 'equilibrium':
        return <EquilibriumLab academicLevel={academicLevel} />;
      case 'electrochemistry':
        return <ElectrochemistryLab academicLevel={academicLevel} />;
      case 'organic':
        return <OrganicChemistryLab academicLevel={academicLevel} />;
      case 'bonding':
        return <BondingLab academicLevel={academicLevel} />;
      case 'thermochemistry':
        return <ThermochemistryLab academicLevel={academicLevel} />;
      case 'equation_balancer':
        return <EquationBalancerLab academicLevel={academicLevel} />;
      default:
        return <TitrationLab academicLevel={academicLevel} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Main Navigation Bar */}
      <Navbar
        academicLevel={academicLevel}
        onAcademicLevelChange={setAcademicLevel}
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setActiveLabId(null);
        }}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeLabId ? (
          <div className="space-y-6">
            {/* Back to Catalog Breadcrumb */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToCatalog}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#111A2E] hover:bg-slate-800 border border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-teal-400" />
                <span>Return to Experiments Catalog</span>
              </button>
            </div>

            {/* Active Lab Component */}
            {renderActiveLab()}
          </div>
        ) : (
          <div>
            {currentTab === 'home' && (
              <HomeView
                academicLevel={academicLevel}
                onLaunchLab={handleLaunchLab}
                onOpenLearn={handleOpenLearn}
              />
            )}
            {currentTab === 'experiments' && (
              <ExperimentsView
                academicLevel={academicLevel}
                onLaunchLab={handleLaunchLab}
              />
            )}
            {currentTab === 'molecules' && (
              <MolecularLabView academicLevel={academicLevel} />
            )}
            {currentTab === 'learn' && (
              <LearnView
                academicLevel={academicLevel}
                onLaunchLab={handleLaunchLab}
                selectedTopicId={selectedLearnTopicId}
              />
            )}
            {currentTab === 'calculator' && (
              <CalculatorView academicLevel={academicLevel} />
            )}
          </div>
        )}
      </main>

      {/* Technical Dashboard Footer */}
      <footer className="h-8 bg-[#0B1121] border-t border-slate-800 px-6 flex items-center justify-between text-[10px] text-slate-500 shrink-0 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
          <span>ENVIRONMENT: STANDARD TEMP & PRESSURE (STP)</span>
        </div>
        <div className="hidden sm:flex gap-6">
          <span>SENSORS: ONLINE</span>
          <span>DATA LOGGING: ACTIVE</span>
          <span>SYSTEM: EVLAB-CHEM-V1.0.4</span>
        </div>
      </footer>
    </div>
  );
}

export default ChemistryLab;
