import React, { useState, useMemo } from 'react';
import { 
  CalculationState, 
  CalculationTrace, 
  ColumnEndCondition, 
  LabMode, 
  Material, 
  PointLoad, 
  SectionProperties, 
  TopicId, 
  UnitSystem, 
  VisualMode 
} from './types';
import { STANDARD_MATERIALS, getMaterialById } from './core/materials';
import { STANDARD_SECTIONS, getSectionById } from './core/sections';
import { TOPICS_DATA, getTopicById } from './core/topics';
import { 
  calculateAxialStress, 
  calculateBeam, 
  calculateTorsion, 
  calculateMohrCircle, 
  calculateColumnBuckling 
} from './engines/calculationEngine';
import { formatEngValue } from './core/units';

// UI Components
import { Header } from './components/Header';
import { SidebarTopicNav } from './components/SidebarTopicNav';
import { LearnPanel } from './components/LearnPanel';
import { CalculatorPanel } from './components/CalculatorPanel';
import { Visualizer2D3D } from './components/Visualizer2D3D';
import { UnderstandPanel } from './components/UnderstandPanel';

// Specialized Modal Laboratories
import { WhatIfLabModal } from './components/WhatIfLabModal';
import { ComparisonLab } from './components/ComparisonLab';
import { EducationalLabMode } from './components/EducationalLabMode';
import { ReportModal } from './components/ReportModal';
import { AIMechanicsModal } from './components/AIMechanicsModal';

import { 
  Sliders, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Settings2, 
  Sparkles,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';

export default function StrengthLab() {
  // Navigation & Mode State
  const [currentTopicId, setCurrentTopicId] = useState<TopicId>('beam_bending');
  const [currentMode, setCurrentMode] = useState<LabMode>('simulate');
  const [visualMode, setVisualMode] = useState<VisualMode>('stress');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('SI');
  const [deformationScale, setDeformationScale] = useState<number>(100);

  // Active Material & Section Geometry
  const [materialId, setMaterialId] = useState<string>('structural_steel_a36');
  const [sectionId, setSectionId] = useState<string>('w200_46_1');

  const material: Material = useMemo(() => getMaterialById(materialId), [materialId]);
  const section: SectionProperties = useMemo(() => getSectionById(sectionId), [sectionId]);
  const currentTopic = useMemo(() => getTopicById(currentTopicId), [currentTopicId]);

  // Physical Experiment Parameters
  // 1. Axial Stress & Elongation
  const [axialLoadKN, setAxialLoadKN] = useState<number>(120);
  const [axialLengthM, setAxialLengthM] = useState<number>(2.5);

  // 2. Beam Flexure, Shear & Deflection
  const [beamSpanLengthM, setBeamSpanLengthM] = useState<number>(6.0);
  const [beamSupportType, setBeamSupportType] = useState<'simply_supported' | 'cantilever' | 'fixed_fixed'>('simply_supported');
  const [beamPointLoads, setBeamPointLoads] = useState<PointLoad[]>([
    { id: '1', position: 3.0, magnitude: 45.0 },
  ]);
  const [beamUDL, setBeamUDL] = useState<number>(12.0);

  // 3. Torsion of Circular Shafts
  const [torsionTorqueKNm, setTorsionTorqueKNm] = useState<number>(15.0);
  const [torsionLengthM, setTorsionLengthM] = useState<number>(3.0);

  // 4. Mohr's Circle & Stress Transformation
  const [mohrSigmaX, setMohrSigmaX] = useState<number>(80.0);
  const [mohrSigmaY, setMohrSigmaY] = useState<number>(-40.0);
  const [mohrTauXY, setMohrTauXY] = useState<number>(50.0);
  const [mohrRotationDeg, setMohrRotationDeg] = useState<number>(0.0);

  // 5. Column Stability & Euler Buckling
  const [columnLengthM, setColumnLengthM] = useState<number>(4.5);
  const [columnAxialLoadKN, setColumnAxialLoadKN] = useState<number>(180.0);
  const [columnEndCondition, setColumnEndCondition] = useState<ColumnEndCondition>('pin_pin');

  // Modal Dialogs
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isGuidedLabOpen, setIsGuidedLabOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Real-Time Calculation Engine Execution
  const calcState: CalculationState = useMemo(() => {
    const axial = calculateAxialStress(axialLoadKN, axialLengthM, material, section);
    const beam = calculateBeam(beamSupportType, beamSpanLengthM, beamPointLoads, beamUDL, material, section);
    const torsion = calculateTorsion(torsionTorqueKNm, torsionLengthM, material, section);
    const mohr = calculateMohrCircle(mohrSigmaX, mohrSigmaY, mohrTauXY, mohrRotationDeg, material);
    const buckling = calculateColumnBuckling(columnEndCondition, columnLengthM, columnAxialLoadKN, material, section);

    return {
      axialLoadKN,
      axialLengthM,
      axial,
      beamSpanLengthM,
      beamSupportType,
      beamPointLoads,
      beamUDL,
      beam,
      torsionTorqueKNm,
      torsionLengthM,
      torsion,
      mohrSigmaX,
      mohrSigmaY,
      mohrTauXY,
      mohrRotationDeg,
      mohr,
      columnLengthM,
      columnAxialLoadKN,
      columnEndCondition,
      buckling,
    };
  }, [
    axialLoadKN,
    axialLengthM,
    beamSpanLengthM,
    beamSupportType,
    beamPointLoads,
    beamUDL,
    torsionTorqueKNm,
    torsionLengthM,
    mohrSigmaX,
    mohrSigmaY,
    mohrTauXY,
    mohrRotationDeg,
    columnLengthM,
    columnAxialLoadKN,
    columnEndCondition,
    material,
    section,
  ]);

  // Aggregate Calculation Traces for current topic
  const activeTraces: CalculationTrace[] = useMemo(() => {
    switch (currentTopicId) {
      case 'axial_stress':
      case 'axial_deformation':
      case 'hookes_law':
      case 'stress_strain_lab':
        return [calcState.axial.trace];
      case 'torsion':
        return [calcState.torsion.trace];
      case 'mohrs_circle':
      case 'principal_stress':
        return [calcState.mohr.trace];
      case 'columns_buckling':
        return [calcState.buckling.trace];
      case 'beam_bending':
      case 'flexural_stress':
      case 'beam_shear_stress':
      case 'beam_deflection':
      case 'neutral_axis':
      default:
        return [calcState.beam.trace];
    }
  }, [currentTopicId, calcState]);

  // Reset experiment to default initial baseline
  const handleResetExperiment = () => {
    setAxialLoadKN(120);
    setAxialLengthM(2.5);
    setBeamSpanLengthM(6.0);
    setBeamSupportType('simply_supported');
    setBeamPointLoads([{ id: '1', position: 3.0, magnitude: 45.0 }]);
    setBeamUDL(12.0);
    setTorsionTorqueKNm(15.0);
    setTorsionLengthM(3.0);
    setMohrSigmaX(80.0);
    setMohrSigmaY(-40.0);
    setMohrTauXY(50.0);
    setMohrRotationDeg(0.0);
    setColumnLengthM(4.5);
    setColumnAxialLoadKN(180.0);
    setColumnEndCondition('pin_pin');
    setMaterialId('structural_steel_a36');
    setSectionId('w200_46_1');
    setDeformationScale(100);
    setVisualMode('stress');
  };

  // Quick summary metric computation for header banner & inspection panel
  const activeSafetyFactor = useMemo(() => {
    if (currentTopicId === 'torsion') return calcState.torsion.safetyFactor;
    if (currentTopicId === 'mohrs_circle' || currentTopicId === 'principal_stress') return calcState.mohr.safetyFactor;
    if (currentTopicId === 'columns_buckling') return calcState.buckling.bucklingSafetyFactor;
    if (currentTopicId === 'axial_stress' || currentTopicId === 'axial_deformation') return calcState.axial.safetyFactor;
    return calcState.beam.safetyFactor;
  }, [currentTopicId, calcState]);

  const activeStatus = useMemo(() => {
    if (activeSafetyFactor < 1.0) return 'failure';
    if (activeSafetyFactor < 1.2) return 'yield';
    if (activeSafetyFactor < 1.8) return 'warning';
    return 'safe';
  }, [activeSafetyFactor]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* 1. Global Header Bar */}
      <Header
        currentTopicId={currentTopicId}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        visualMode={visualMode}
        onVisualModeChange={setVisualMode}
        unitSystem={unitSystem}
        onUnitSystemToggle={() => setUnitSystem(prev => prev === 'SI' ? 'US' : 'SI')}
        deformationScale={deformationScale}
        onDeformationScaleChange={setDeformationScale}
        onOpenWhatIf={() => setIsWhatIfOpen(true)}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenGuidedLab={() => setIsGuidedLabOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onResetExperiment={handleResetExperiment}
      />

      {/* 2. Main Workbench Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Topic Navigation Bar */}
        <div className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0">
          <SidebarTopicNav
            currentTopicId={currentTopicId}
            onSelectTopic={id => {
              if (id === 'what_if_lab') {
                setIsWhatIfOpen(true);
              } else if (id === 'comparison_lab') {
                setIsComparisonOpen(true);
              } else if (id === 'educational_lab') {
                setIsGuidedLabOpen(true);
              } else {
                setCurrentTopicId(id);
              }
            }}
          />
        </div>

        {/* Center Primary Workspace Display */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* Active Topic Subheader & Quick Parameter Control Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 shrink-0 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-200 text-sm">
                {currentTopic.title}
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                ({currentTopic.governingFormula})
              </span>
            </div>

            {/* Quick Material & Section Selectors */}
            <div className="flex items-center space-x-3">
              {/* Material Selector */}
              <div className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Mat:</span>
                <select
                  value={materialId}
                  onChange={e => setMaterialId(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  {STANDARD_MATERIALS.map(m => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                      {m.name} (σy = {m.yieldStrength} MPa)
                    </option>
                  ))}
                </select>
              </div>

              {/* Cross-Section Geometry Selector */}
              <div className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Sec:</span>
                <select
                  value={sectionId}
                  onChange={e => setSectionId(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer max-w-[170px] truncate"
                >
                  {STANDARD_SECTIONS.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Safety Factor Live Indicator */}
              <div
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border font-mono font-bold text-xs ${
                  activeStatus === 'failure'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                    : activeStatus === 'yield'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                    : activeStatus === 'warning'
                    ? 'bg-yellow-950/80 text-yellow-300 border-yellow-700/60'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                }`}
              >
                {activeStatus === 'failure' ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>SF: {formatEngValue(activeSafetyFactor, 2)}</span>
              </div>
            </div>
          </div>

          {/* Active Mode Dynamic Canvas / Panel View */}
          <div className="flex-1 overflow-hidden relative">
            {currentMode === 'learn' && (
              <LearnPanel topic={currentTopic} />
            )}

            {currentMode === 'calculate' && (
              <CalculatorPanel
                topicId={currentTopicId}
                traces={activeTraces}
                unitSystem={unitSystem}
                onOpenReport={() => setIsReportOpen(true)}
              />
            )}

            {currentMode === 'simulate' && (
              <Visualizer2D3D
                topicId={currentTopicId}
                calcState={calcState}
                material={material}
                onMaterialChange={m => setMaterialId(m.id)}
                section={section}
                visualMode={visualMode}
                deformationScale={deformationScale}
                onPointLoadsChange={setBeamPointLoads}
                onUDLChange={setBeamUDL}
                onBeamSupportChange={setBeamSupportType}
                onTorqueChange={setTorsionTorqueKNm}
                onLengthChange={val => {
                  setBeamSpanLengthM(val);
                  setTorsionLengthM(val);
                  setColumnLengthM(val);
                  setAxialLengthM(val);
                }}
                onAxialLoadChange={setColumnAxialLoadKN}
                onColumnEndChange={setColumnEndCondition}
                onMohrRotationChange={setMohrRotationDeg}
              />
            )}

            {currentMode === 'understand' && (
              <UnderstandPanel
                topicId={currentTopicId}
                activeMetrics={{
                  safetyFactor: activeSafetyFactor,
                  material: material.name,
                  section: section.name,
                }}
                onOpenWhatIf={() => setIsWhatIfOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* 3. Modal Lab Engines */}
      {isWhatIfOpen && (
        <WhatIfLabModal
          isOpen={isWhatIfOpen}
          onClose={() => setIsWhatIfOpen(false)}
          topicId={currentTopicId}
          material={material}
          section={section}
          calcState={calcState}
        />
      )}

      {isComparisonOpen && (
        <ComparisonLab
          isOpen={isComparisonOpen}
          onClose={() => setIsComparisonOpen(false)}
          topicId={currentTopicId}
        />
      )}

      {isGuidedLabOpen && (
        <EducationalLabMode
          isOpen={isGuidedLabOpen}
          onClose={() => setIsGuidedLabOpen(false)}
        />
      )}

      {isReportOpen && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          topic={currentTopic}
          material={material}
          section={section}
          traces={activeTraces}
          calcState={calcState}
          unitSystem={unitSystem}
        />
      )}

      {isAIOpen && (
        <AIMechanicsModal
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
          topic={currentTopic}
          material={material}
          section={section}
          calcState={calcState}
        />
      )}
    </div>
  );
}
