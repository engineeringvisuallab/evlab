import React, { useState } from 'react';
import { GISProvider, useGIS } from './context/GISContext';
import { TopRibbon } from './components/layout/TopRibbon';
import { StatusBar } from './components/layout/StatusBar';
import { MapCanvas2D } from './components/map/MapCanvas2D';
import { MapCanvas3D } from './components/map/MapCanvas3D';
import { LayerManager } from './components/panels/LayerManager';
import { BasemapGallery } from './components/panels/BasemapGallery';
import { PropertiesPanel } from './components/panels/PropertiesPanel';
import { AttributeTable } from './components/panels/AttributeTable';
import { AddDataModal } from './components/panels/AddDataModal';
import { AnalysisToolboxModal } from './components/panels/AnalysisToolbox';
import { SymbologyModal } from './components/panels/SymbologyModal';
import { QueryBuilderModal } from './components/panels/QueryBuilderPanel';
import { CommandPaletteModal } from './components/panels/CommandPalette';
import { ElevationProfileModal } from './components/map/ElevationProfile';
import { HistoryPanelModal } from './components/panels/HistoryPanel';
import { MapLayoutEditorModal } from './components/layout/MapLayoutEditor';
import { FieldManagerModal } from './components/modals/FieldManagerModal';
import { GeometryValidationModal } from './components/modals/GeometryValidationModal';
import { Layers, Map, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';

const GISWorkspace: React.FC = () => {
  const { viewMode } = useGIS();

  // Panels collapse & tab state
  const [leftTab, setLeftTab] = useState<'layers' | 'basemaps'>('layers');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const [mouseCoords, setMouseCoords] = useState<{ lng: number; lat: number; zoom: number; scaleStr: string } | undefined>(undefined);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 font-sans text-slate-100 overflow-hidden select-none">
      {/* 1. TOP RIBBON */}
      <TopRibbon />

      {/* 2. MAIN WORKSPACE CANVAS & PANELS */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* LEFT PANEL */}
        <div
          className={`relative flex transition-all duration-200 z-20 ${
            isLeftPanelOpen ? 'w-72' : 'w-10'
          }`}
        >
          {isLeftPanelOpen ? (
            <div className="flex flex-col w-full h-full bg-slate-900 border-r border-slate-800">
              {/* Left Panel Tabs Header */}
              <div className="flex bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400">
                <button
                  onClick={() => setLeftTab('layers')}
                  className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition ${
                    leftTab === 'layers'
                      ? 'bg-slate-900 text-cyan-400 border-b-2 border-cyan-400 font-bold'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Layers size={14} />
                  <span>Layers</span>
                </button>
                <button
                  onClick={() => setLeftTab('basemaps')}
                  className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition ${
                    leftTab === 'basemaps'
                      ? 'bg-slate-900 text-cyan-400 border-b-2 border-cyan-400 font-bold'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Map size={14} />
                  <span>Basemaps</span>
                </button>
              </div>

              {/* Left Tab Body */}
              <div className="flex-1 overflow-hidden">
                {leftTab === 'layers' ? <LayerManager /> : <BasemapGallery />}
              </div>
            </div>
          ) : (
            <div className="w-10 h-full bg-slate-950 border-r border-slate-800 flex flex-col items-center py-4 gap-4 text-slate-400">
              <button
                onClick={() => {
                  setIsLeftPanelOpen(true);
                  setLeftTab('layers');
                }}
                className="p-1.5 hover:text-cyan-400 hover:bg-slate-800 rounded"
                title="Layers"
              >
                <Layers size={18} />
              </button>
              <button
                onClick={() => {
                  setIsLeftPanelOpen(true);
                  setLeftTab('basemaps');
                }}
                className="p-1.5 hover:text-cyan-400 hover:bg-slate-800 rounded"
                title="Basemaps"
              >
                <Map size={18} />
              </button>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white p-0.5 rounded-full shadow-lg transition"
          >
            {isLeftPanelOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* CENTER MAP CANVAS */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
          <div className="flex-1 relative">
            {viewMode === '2D' ? (
              <MapCanvas2D onMouseMoveCoords={setMouseCoords} />
            ) : (
              <MapCanvas3D />
            )}
          </div>

          {/* Bottom Attribute Table Drawer */}
          <AttributeTable />
        </div>

        {/* RIGHT PANEL (PROPERTIES / INSPECTOR) */}
        <div
          className={`relative flex transition-all duration-200 z-20 ${
            isRightPanelOpen ? 'w-80' : 'w-10'
          }`}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white p-0.5 rounded-full shadow-lg transition"
          >
            {isRightPanelOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {isRightPanelOpen ? (
            <div className="w-full h-full">
              <PropertiesPanel />
            </div>
          ) : (
            <div className="w-10 h-full bg-slate-950 border-l border-slate-800 flex flex-col items-center py-4 text-slate-400">
              <button
                onClick={() => setIsRightPanelOpen(true)}
                className="p-1.5 hover:text-cyan-400 hover:bg-slate-800 rounded"
                title="Inspector"
              >
                <Sliders size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM STATUS BAR */}
      <StatusBar coords={mouseCoords} />

      {/* MODALS */}
      <AddDataModal />
      <AnalysisToolboxModal />
      <SymbologyModal />
      <QueryBuilderModal />
      <CommandPaletteModal />
      <ElevationProfileModal />
      <HistoryPanelModal />
      <MapLayoutEditorModal />
      <FieldManagerModal />
      <GeometryValidationModal />
    </div>
  );
};

export default function GisApp() {
  return (
    <GISProvider>
      <GISWorkspace />
    </GISProvider>
  );
}
