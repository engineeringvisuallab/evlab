/**
 * EVLab BOQ - Professional Civil Engineering Bill of Quantities Application Entry
 */

import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BoqPage } from './pages/BoqPage';
import { TakeoffPage } from './pages/TakeoffPage';
import { RateAnalysisPage } from './pages/RateAnalysisPage';
import { EstimatePage } from './pages/EstimatePage';
import { AbstractPage } from './pages/AbstractPage';
import { MeasurementPage } from './pages/MeasurementPage';
import { BillingPage } from './pages/BillingPage';
import { VariationsPage } from './pages/VariationsPage';
import { CostControlPage } from './pages/CostControlPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { LabourPage } from './pages/LabourPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { RateDatabasePage } from './pages/RateDatabasePage';
import { ReportsPage } from './pages/ReportsPage';
import { LibrariesPage } from './pages/LibrariesPage';
import { SettingsPage } from './pages/SettingsPage';

export default function BoqApp() {
  const { isInitialized, initApp, currentView, isSearchOpen, setIsSearchOpen } = useAppStore();

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-mono space-y-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="font-bold text-cyan-400 text-sm tracking-wider">EVLab BOQ ENGINE INITIALIZING</p>
          <p className="text-xs text-slate-500">Loading IndexedDB storage and civil rate databases...</p>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'boq':
        return <BoqPage />;
      case 'takeoff':
        return <TakeoffPage />;
      case 'rate-analysis':
        return <RateAnalysisPage />;
      case 'estimate':
        return <EstimatePage />;
      case 'abstract':
        return <AbstractPage />;
      case 'measurement':
        return <MeasurementPage />;
      case 'billing':
        return <BillingPage />;
      case 'variations':
        return <VariationsPage />;
      case 'cost-control':
        return <CostControlPage />;
      case 'materials':
        return <MaterialsPage />;
      case 'labour':
        return <LabourPage />;
      case 'equipment':
        return <EquipmentPage />;
      case 'rate-database':
        return <RateDatabasePage />;
      case 'reports':
        return <ReportsPage />;
      case 'libraries':
        return <LibrariesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <BoqPage />;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-950">{renderActiveView()}</main>
      </div>

      {isSearchOpen && <CommandPalette onClose={() => setIsSearchOpen(false)} />}
    </div>
  );
}
