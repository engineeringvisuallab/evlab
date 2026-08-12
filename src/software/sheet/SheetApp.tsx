import React from 'react';
import { useSpreadsheetStore } from './store/useSpreadsheetStore';
import { darkTheme } from './theme/dark';
import { lightTheme } from './theme/light';
import { AppHeader } from './components/layout/AppHeader';
import { RibbonToolbar } from './components/toolbar/RibbonToolbar';
import { FormulaBar } from './components/formula/FormulaBar';
import { ProjectExplorer } from './components/sidebar/ProjectExplorer';
import { SpreadsheetGrid } from './components/grid/SpreadsheetGrid';
import { SheetTabBar } from './components/sheets/SheetTabBar';
import { StatusBar } from './components/statusbar/StatusBar';

export default function App() {
  const { theme } = useSpreadsheetStore();
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden font-sans antialiased select-none"
      style={{
        backgroundColor: currentTheme.bgApp,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Top Application Header */}
      <AppHeader />

      {/* Ribbon Toolbar */}
      <RibbonToolbar />

      {/* Name Box and Formula Bar */}
      <FormulaBar />

      {/* Main Spreadsheet Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        <ProjectExplorer />
        <SpreadsheetGrid />
      </div>

      {/* Bottom Sheet Tabs Bar */}
      <SheetTabBar />

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
}
