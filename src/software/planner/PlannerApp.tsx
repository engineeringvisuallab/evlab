import React, { useState } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Header } from './components/layout/Header';
import { NavigationSidebar } from './components/layout/NavigationSidebar';
import { StatusBar } from './components/layout/StatusBar';

import { DashboardView } from './components/views/DashboardView';
import { GanttView } from './components/views/GanttView';
import { TaskSheetView } from './components/views/TaskSheetView';
import { WBSView } from './components/views/WBSView';
import { ResourceView } from './components/views/ResourceView';
import { CalendarView } from './components/views/CalendarView';
import { CostView } from './components/views/CostView';
import { EVMView } from './components/views/EVMView';
import { LookAheadView } from './components/views/LookAheadView';
import { BaselineView } from './components/views/BaselineView';
import { CriticalPathView } from './components/views/CriticalPathView';
import { RisksIssuesView } from './components/views/RisksIssuesView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

import { ProjectWizardModal } from './components/modals/ProjectWizardModal';
import { TaskDetailsModal } from './components/modals/TaskDetailsModal';
import { ExportModal } from './components/modals/ExportModal';
import { ScheduleDoctorModal } from './components/modals/ScheduleDoctorModal';

const MainContent: React.FC = () => {
  const { currentView } = useProject();
  const [searchQuery, setSearchQuery] = useState('');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <DashboardView />;
      case 'gantt':
        return <GanttView searchQuery={searchQuery} />;
      case 'tasks':
        return <TaskSheetView searchQuery={searchQuery} />;
      case 'wbs':
        return <WBSView />;
      case 'resources':
        return <ResourceView />;
      case 'calendar':
        return <CalendarView />;
      case 'costs':
        return <CostView />;
      case 'evm':
        return <EVMView />;
      case 'lookahead':
        return <LookAheadView />;
      case 'baseline':
        return <BaselineView />;
      case 'critical-path':
        return <CriticalPathView />;
      case 'risks':
        return <RisksIssuesView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
      case 'project':
        return <SettingsView />;
      default:
        return <GanttView searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Top Application Header */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main Workspace Area (Sidebar + Active View) */}
      <div className="flex-1 flex overflow-hidden">
        <NavigationSidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
          {renderView()}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Modals */}
      <ProjectWizardModal />
      <TaskDetailsModal />
      <ExportModal />
      <ScheduleDoctorModal />
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <MainContent />
    </ProjectProvider>
  );
}
