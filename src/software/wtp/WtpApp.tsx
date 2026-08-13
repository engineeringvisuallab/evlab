import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar, ViewTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProjectManagementView } from './components/ProjectManagementView';
import { DesignBasisView } from './components/DesignBasisView';
import { WaterQualityView } from './components/WaterQualityView';
import { ProcessSelectionView } from './components/ProcessSelectionView';
import { ProcessDesignView } from './components/ProcessDesignView';
import { FormulaExplorerView } from './components/FormulaExplorerView';
import { DesignAlternativesView } from './components/DesignAlternativesView';
import { HydraulicsView } from './components/HydraulicsView';
import { ChemicalDosingView } from './components/ChemicalDosingView';
import { EquipmentView } from './components/EquipmentView';
import { SludgeView } from './components/SludgeView';
import { WaterBalanceView } from './components/WaterBalanceView';
import { ElectricalView } from './components/ElectricalView';
import { InstrumentationScadaView } from './components/InstrumentationScadaView';
import { StructuralView } from './components/StructuralView';
import { BoqCostView } from './components/BoqCostView';
import { DrawingsView } from './components/DrawingsView';
import { ValidationMatrixView } from './components/ValidationMatrixView';
import { CompletenessAuditView } from './components/CompletenessAuditView';
import { StandardsLibraryView } from './components/StandardsLibraryView';
import { ReportsView } from './components/ReportsView';
import { Phase12View } from './components/Phase12View';

import { FormulaInspectorModal } from './components/FormulaInspectorModal';
import { AiAssistantModal } from './components/AiAssistantModal';

import { calculateWtpState } from './core/dependencyEngine';
import { validateWtpDesign } from './core/validationEngine';
import { generate3DDigitalTwinScene } from './core/threeDEngine';
import { ProjectMetadata, RawWaterQualityItem, PopulationProjections, WaterDemandBreakdown, RevisionRecord } from './types/wtp';
import { publishToBim } from '../bim/bimModel';
import { fromWtpScene } from '../bim/fromWtp';

const INITIAL_PROJECT: ProjectMetadata = {
  id: 'PRJ-2026-EVL-001',
  name: 'EVL Central Water Treatment Plant',
  client: 'Department of Public Health Engineering (DPHE)',
  consultant: 'Engineering Visual Lab (EVL) Process Group',
  contractor: 'EVL Infrastructure Ltd.',
  location: 'Chittagong Industrial Zone',
  country: 'Bangladesh',
  coordinates: { lat: 22.3569, lng: 91.7832 },
  baseYear: 2026,
  designYear: 2051,
  designPeriodYears: 25,
  existingOrProposed: 'Proposed',
  plantCapacityMLD: 50,
  designPopulation: 250000,
  designStandard: 'CPHEEO',
  unitSystem: 'SI',
  currency: 'USD',
  datum: 'MSL',
  groundLevelm: 12.5,
  drawingScale: '1:100',
  revision: 'Rev-0',
  preparedBy: 'Lead Process Engineer',
  checkedBy: 'Principal Hydraulic Engineer',
  approvedBy: 'Director of Engineering',
  date: '2026-08-11',
  notes: 'Design complies with CPHEEO 2021 Manual and WHO 2022 Drinking Water Guidelines.'
};

const INITIAL_POPULATION: PopulationProjections = {
  basePopulation: 180000,
  growthRatePercent: 2.1,
  designYears: 25,
  arithmetic: 245000,
  geometric: 302000,
  incremental: 278000,
  logistic: 260000,
  selectedPopulation: 250000
};

const INITIAL_DEMAND: WaterDemandBreakdown = {
  perCapitaLpcd: 150,
  domesticLpcd: 110,
  commercialLpcd: 15,
  institutionalLpcd: 10,
  industrialLpcd: 10,
  publicLpcd: 5,
  unaccountedForWaterPercent: 15,
  fireDemandMethod: 'Kuichling',
  fireDemandM3day: 2500,
  peakFactorDay: 1.5,
  peakFactorHour: 2.25,
  averageDemandMLD: 37.5,
  maxDayDemandMLD: 50,
  peakHourDemandM3hr: 4687.5,
  wtpDesignCapacityMLD: 50
};

const INITIAL_WATER_QUALITY: RawWaterQualityItem[] = [
  { id: 'wq-1', name: 'Turbidity', symbol: 'NTU', category: 'Physical', unit: 'NTU', rawValue: 120, whoTarget: 1, bdTarget: 10, epaTarget: 1, euTarget: 1, requiredRemovalPercent: 99.1, achievedRemovalPercent: 99.5, finalValue: 0.6, complianceStatus: 'PASS', requiredProcesses: ['Coagulation', 'Flocculation', 'Clarification', 'Filtration'] },
  { id: 'wq-2', name: 'Color', symbol: 'TCU', category: 'Physical', unit: 'TCU', rawValue: 45, whoTarget: 15, bdTarget: 15, epaTarget: 15, euTarget: 15, requiredRemovalPercent: 66.7, achievedRemovalPercent: 88.9, finalValue: 5, complianceStatus: 'PASS', requiredProcesses: ['Coagulation', 'Chlorination'] },
  { id: 'wq-3', name: 'pH', symbol: 'pH', category: 'Physical', unit: '-', rawValue: 6.8, whoTarget: 7.5, bdTarget: 7.5, epaTarget: 7.5, euTarget: 7.5, requiredRemovalPercent: 0, achievedRemovalPercent: 100, finalValue: 7.4, complianceStatus: 'PASS', requiredProcesses: ['Lime Addition'] },
  { id: 'wq-4', name: 'Iron (Fe)', symbol: 'Fe', category: 'Metals', unit: 'mg/L', rawValue: 2.8, whoTarget: 0.3, bdTarget: 0.3, epaTarget: 0.3, euTarget: 0.2, requiredRemovalPercent: 89.3, achievedRemovalPercent: 96.4, finalValue: 0.1, complianceStatus: 'PASS', requiredProcesses: ['Aeration', 'Clarification', 'Filtration'] },
  { id: 'wq-5', name: 'Manganese (Mn)', symbol: 'Mn', category: 'Metals', unit: 'mg/L', rawValue: 0.45, whoTarget: 0.1, bdTarget: 0.1, epaTarget: 0.05, euTarget: 0.05, requiredRemovalPercent: 77.8, achievedRemovalPercent: 88.9, finalValue: 0.05, complianceStatus: 'PASS', requiredProcesses: ['Aeration', 'Pre-chlorination'] },
  { id: 'wq-6', name: 'E. Coli / Total Coliform', symbol: 'MPN', category: 'Microbiology', unit: 'MPN/100ml', rawValue: 4500, whoTarget: 0, bdTarget: 0, epaTarget: 0, euTarget: 0, requiredRemovalPercent: 100, achievedRemovalPercent: 100, finalValue: 0, complianceStatus: 'PASS', requiredProcesses: ['Disinfection (Gas Chlorine)'] }
];

export default function WtpApp() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard' as ViewTab);
  const [project, setProject] = useState<ProjectMetadata>(INITIAL_PROJECT);
  const [customParams, setCustomParams] = useState<Record<string, number>>({});
  const [waterQualityList, setWaterQualityList] = useState<RawWaterQualityItem[]>(INITIAL_WATER_QUALITY);
  const [population, setPopulation] = useState<PopulationProjections>(INITIAL_POPULATION);
  const [demand, setDemand] = useState<WaterDemandBreakdown>(INITIAL_DEMAND);

  const [inspectorParamId, setInspectorParamId] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  const [revisions, setRevisions] = useState<RevisionRecord[]>([
    { revId: 'REV-00', date: '2026-08-01', author: 'Principal Process Engineer', description: 'Initial Baseline Design', changesCount: 12, status: 'Approved' },
    { revId: 'REV-01', date: '2026-08-05', author: 'Senior Hydraulics Engineer', description: 'Updated Filter Backwash & SOR', changesCount: 5, status: 'Approved' }
  ]);

  const handleCreateNewRevision = (desc: string) => {
    const newRev: RevisionRecord = {
      revId: `REV-0${revisions.length}`,
      date: new Date().toISOString().split('T')[0],
      author: project.preparedBy || 'Lead Engineer',
      description: desc,
      changesCount: 1,
      status: 'Draft'
    };
    setRevisions(prev => [newRev, ...prev]);
    setProject(prev => ({ ...prev, revision: newRev.revId }));
  };

  // Compute calculated state
  const calculatedState = useMemo(() => {
    return calculateWtpState(project.plantCapacityMLD, customParams);
  }, [project.plantCapacityMLD, customParams]);

  // Compute validation matrix
  const validationMatrix = useMemo(() => {
    return validateWtpDesign(calculatedState);
  }, [calculatedState]);

  const handleUpdateParam = (key: string, val: number) => {
    setCustomParams(prev => ({ ...prev, [key]: val }));
  };

  const handleCapacityChange = (newCapacity: number) => {
    setProject(prev => ({ ...prev, plantCapacityMLD: newCapacity }));
  };

  const handlePublishToBim = () => {
    const scene = generate3DDigitalTwinScene(calculatedState, 'ENGINEERING');
    publishToBim({
      sourceTool: 'wtp',
      toolLabel: 'EVLab WTP Design',
      objects: fromWtpScene(scene),
      meta: { plantCapacityMLD: calculatedState.plantCapacityMLD, project: project.name },
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-mono text-xs overflow-hidden select-none">
      {/* Top Header */}
      <Header
        project={project}
        state={calculatedState}
        validations={validationMatrix}
        onUpdateProject={(p) => setProject(prev => ({ ...prev, ...p }))}
        onOpenFormulaInspector={(paramId) => setInspectorParamId(paramId || 'DES-CAP-001')}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onPublishToBim={handlePublishToBim}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activeTab === 'dashboard' && (
            <DashboardView
              project={project}
              state={calculatedState}
              validations={validationMatrix}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectManagementView
              project={project}
              revisions={revisions}
              onUpdateProject={(p) => setProject(prev => ({ ...prev, ...p }))}
              onCreateNewRevision={handleCreateNewRevision}
            />
          )}

          {activeTab === 'designBasis' && (
            <DesignBasisView
              project={project}
              population={population}
              demand={demand}
              onUpdatePopulation={(p) => setPopulation(prev => ({ ...prev, ...p }))}
              onUpdateDemand={(d) => setDemand(prev => ({ ...prev, ...d }))}
              onUpdateCapacity={handleCapacityChange}
            />
          )}

          {activeTab === 'waterQuality' && (
            <WaterQualityView
              waterQualityList={waterQualityList}
              selectedStandard={project.designStandard}
              onUpdateWaterQuality={(id, rawVal) => {
                setWaterQualityList(prev => prev.map(item => item.id === id ? { ...item, rawValue: rawVal } : item));
              }}
              onAddCustomParameter={(newItem) => {
                setWaterQualityList(prev => [...prev, newItem]);
              }}
            />
          )}

          {activeTab === 'processSelection' && (
            <ProcessSelectionView
              waterQualityList={waterQualityList}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'processDesign' && (
            <ProcessDesignView
              state={calculatedState}
              customParams={customParams}
              onUpdateParam={handleUpdateParam}
              onOpenFormulaInspector={(paramId) => setInspectorParamId(paramId)}
            />
          )}

          {activeTab === 'formulaExplorer' && (
            <FormulaExplorerView
              project={project}
              state={calculatedState}
              onOpenFormulaInspector={(paramId) => setInspectorParamId(paramId)}
            />
          )}

          {activeTab === 'designAlternatives' && (
            <DesignAlternativesView
              project={project}
              state={calculatedState}
              waterQuality={waterQualityList}
            />
          )}

          {activeTab === 'hydraulics' && (
            <HydraulicsView state={calculatedState} />
          )}

          {activeTab === 'chemical' && (
            <ChemicalDosingView
              state={calculatedState}
              customParams={customParams}
              onUpdateParam={handleUpdateParam}
            />
          )}

          {activeTab === 'equipment' && (
            <EquipmentView state={calculatedState} />
          )}

          {activeTab === 'sludge' && (
            <SludgeView state={calculatedState} />
          )}

          {activeTab === 'waterBalance' && (
            <WaterBalanceView state={calculatedState} />
          )}

          {activeTab === 'electrical' && (
            <ElectricalView state={calculatedState} />
          )}

          {activeTab === 'instrumentation' && (
            <InstrumentationScadaView state={calculatedState} />
          )}

          {activeTab === 'structural' && (
            <StructuralView state={calculatedState} />
          )}

          {activeTab === 'boqCost' && (
            <BoqCostView state={calculatedState} currency={project.currency} />
          )}

          {activeTab === 'drawings' && (
            <DrawingsView state={calculatedState} />
          )}

          {activeTab === 'validation' && (
            <ValidationMatrixView validations={validationMatrix} />
          )}

          {activeTab === 'completeness' && (
            <CompletenessAuditView />
          )}

          {activeTab === 'standards' && (
            <StandardsLibraryView />
          )}

          {activeTab === 'reports' && (
            <ReportsView project={project} state={calculatedState} />
          )}

          {activeTab === 'phase12' && (
            <Phase12View state={calculatedState} />
          )}
        </main>
      </div>

      {/* Formula Inspector Modal */}
      <FormulaInspectorModal
        paramId={inspectorParamId}
        onClose={() => setInspectorParamId(null)}
      />

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        state={calculatedState}
      />
    </div>
  );
}
