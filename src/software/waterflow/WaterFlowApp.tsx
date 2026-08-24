/**
 * EVLab WaterFlow - Main Application Layout
 * Professional Water Distribution Network Modeling & Engineering Workstation
 */

import React from 'react';
import { WaterFlowProvider, useWaterFlow } from './context/WaterFlowContext';
import { HeaderNavbar } from './components/layout/HeaderNavbar';
import { MainToolbar } from './components/layout/MainToolbar';
import { StatusBar } from './components/layout/StatusBar';
import { ModelExplorer } from './components/panels/ModelExplorer';
import { PropertyInspector } from './components/panels/PropertyInspector';
import { Canvas2D } from './components/canvas/Canvas2D';
import { Canvas3D } from './components/canvas/Canvas3D';
import { NetworkTable } from './components/tables/NetworkTable';
import { ValidationDialog } from './components/dialogs/ValidationDialog';
import { ScenarioManagerDialog } from './components/dialogs/ScenarioManagerDialog';
import { ProfileViewDialog } from './components/dialogs/ProfileViewDialog';
import { SystemCurveDialog } from './components/dialogs/SystemCurveDialog';
import { ResultsDashboardDialog } from './components/dialogs/ResultsDashboardDialog';
import { ReportGeneratorDialog } from './components/dialogs/ReportGeneratorDialog';
import { ImportExportDialog } from './components/dialogs/ImportExportDialog';
import { SettingsDialog } from './components/dialogs/SettingsDialog';

const MainWorkstation: React.FC = () => {
  const { viewMode, activeDialog } = useWaterFlow();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Top Header Navigation */}
      <HeaderNavbar />

      {/* Main Engineering CAD Toolbar */}
      <MainToolbar />

      {/* Center Engineering Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Dockable Model Explorer */}
        <ModelExplorer />

        {/* Center Canvas Workspace (2D CAD or 3D WebGL) */}
        <main className="flex-1 relative overflow-hidden bg-slate-950">
          {viewMode === '2D' ? <Canvas2D /> : <Canvas3D />}
        </main>

        {/* Right Dockable Dynamic Property Inspector */}
        <PropertyInspector />
      </div>

      {/* Bottom Status Bar & Command Line */}
      <StatusBar />

      {/* Modal Dialog Windows */}
      {activeDialog === 'table' && <NetworkTable />}
      {activeDialog === 'validation' && <ValidationDialog />}
      {activeDialog === 'scenario' && <ScenarioManagerDialog />}
      {activeDialog === 'profile' && <ProfileViewDialog />}
      {activeDialog === 'system_curve' && <SystemCurveDialog />}
      {activeDialog === 'dashboard' && <ResultsDashboardDialog />}
      {activeDialog === 'report' && <ReportGeneratorDialog />}
      {activeDialog === 'import_export' && <ImportExportDialog />}
      {activeDialog === 'settings' && <SettingsDialog />}
    </div>
  );
};

export default function App() {
  return (
    <WaterFlowProvider>
      <MainWorkstation />
    </WaterFlowProvider>
  );
}
