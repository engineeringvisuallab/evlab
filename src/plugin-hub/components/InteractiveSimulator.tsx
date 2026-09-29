import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Box, Layers } from 'lucide-react';
import { SoftwareId, Language } from '../types';
import { UI_TEXT } from '../data/translations';
import { RailingVisualizer } from './RailingVisualizer';
import { RailTrackVisualizer } from './RailTrackVisualizer';
import { VertexVisualizer } from './VertexVisualizer';
import { GrillVisualizer } from './GrillVisualizer';
import { WindowVisualizer } from './WindowVisualizer';
import { DoorVisualizer } from './DoorVisualizer';
import { GateVisualizer } from './GateVisualizer';
import { BoundaryWallVisualizer } from './BoundaryWallVisualizer';
import { SectionMarkerVisualizer } from './SectionMarkerVisualizer';
import { AutoLayerVisualizer } from './AutoLayerVisualizer';
import { LandscapeDesignerVisualizer } from './LandscapeDesignerVisualizer';
import { BuildingBIMVisualizer } from './BuildingBIMVisualizer';
import { SketchUpToolbar, SketchUpBuildingToolId } from './SketchUpToolbar';

interface InteractiveSimulatorProps {
  softwareId: SoftwareId;
  lang: Language;
  pluginId?: string;
}

export type SketchupToolType =
  | 'landscape'
  | 'building_bim'
  | 'vertex'
  | 'railing'
  | 'rail'
  | 'grill'
  | 'window'
  | 'door'
  | 'gate'
  | 'boundarywall'
  | 'facemaker';

export const InteractiveSimulator: React.FC<InteractiveSimulatorProps> = ({
  softwareId,
  lang,
  pluginId,
}) => {
  const t = UI_TEXT[lang];

  // SketchUp active tool switcher
  const [activeSketchupTool, setActiveSketchupTool] = useState<SketchupToolType>(() => {
    if (pluginId?.includes('landscape') || pluginId?.includes('plantation')) return 'landscape';
    if (pluginId?.includes('bim') || pluginId?.includes('building')) return 'building_bim';
    if (pluginId?.includes('vertex')) return 'vertex';
    if (pluginId?.includes('grill')) return 'grill';
    if (pluginId?.includes('window')) return 'window';
    if (pluginId?.includes('door')) return 'door';
    if (pluginId?.includes('gate')) return 'gate';
    if (pluginId?.includes('boundarywall')) return 'boundarywall';
    if (pluginId?.includes('facemaker')) return 'facemaker';
    if (pluginId?.includes('railing')) return 'railing';
    return 'building_bim';
  });

  const [activeToolbarTool, setActiveToolbarTool] = useState<SketchUpBuildingToolId>('layers');

  const handleToolbarSelect = (toolId: SketchUpBuildingToolId) => {
    setActiveToolbarTool(toolId);
    switch (toolId) {
      case 'layers':
      case 'wall':
      case 'frame':
      case 'slab':
      case 'stair':
      case 'roof':
      case 'bim':
      case 'boq':
        setActiveSketchupTool('building_bim');
        break;
      case 'door':
        setActiveSketchupTool('door');
        break;
      case 'window':
        setActiveSketchupTool('window');
        break;
      case 'grill':
        setActiveSketchupTool('grill');
        break;
      case 'railing':
        setActiveSketchupTool('railing');
        break;
      case 'boundary':
        setActiveSketchupTool('boundarywall');
        break;
      case 'gate':
        setActiveSketchupTool('gate');
        break;
      case 'facemaker':
        setActiveSketchupTool('facemaker');
        break;
      default:
        setActiveSketchupTool('building_bim');
    }
  };

  useEffect(() => {
    if (pluginId?.includes('landscape') || pluginId?.includes('plantation')) {
      setActiveSketchupTool('landscape');
    } else if (pluginId?.includes('bim') || pluginId?.includes('building')) {
      setActiveSketchupTool('building_bim');
    } else if (pluginId?.includes('vertex')) {
      setActiveSketchupTool('vertex');
    } else if (pluginId?.includes('grill')) {
      setActiveSketchupTool('grill');
    } else if (pluginId?.includes('window')) {
      setActiveSketchupTool('window');
    } else if (pluginId?.includes('door')) {
      setActiveSketchupTool('door');
    } else if (pluginId?.includes('gate')) {
      setActiveSketchupTool('gate');
    } else if (pluginId?.includes('boundarywall')) {
      setActiveSketchupTool('boundarywall');
    } else if (pluginId?.includes('facemaker')) {
      setActiveSketchupTool('facemaker');
    } else if (pluginId?.includes('railing')) {
      setActiveSketchupTool('railing');
    } else if (pluginId?.includes('rail')) {
      setActiveSketchupTool('rail');
    }
  }, [pluginId]);

  // AutoCAD active tool switcher (EVL-AutoLayer vs EVL-SecMark vs EVL-TLEN)
  const [activeCadTool, setActiveCadTool] = useState<'autolayer' | 'secmark' | 'tlen'>(() => {
    if (pluginId?.includes('layer') || pluginId?.includes('autolayer')) return 'autolayer';
    if (pluginId?.includes('secmark') || pluginId?.includes('sect')) return 'secmark';
    if (pluginId?.includes('tlen') || pluginId?.includes('rebar')) return 'tlen';
    return 'autolayer';
  });

  useEffect(() => {
    if (pluginId?.includes('layer') || pluginId?.includes('autolayer')) {
      setActiveCadTool('autolayer');
    } else if (pluginId?.includes('secmark') || pluginId?.includes('sect')) {
      setActiveCadTool('secmark');
    } else if (pluginId?.includes('tlen') || pluginId?.includes('rebar') || pluginId?.includes('area')) {
      setActiveCadTool('tlen');
    }
  }, [pluginId]);

  // AutoCAD TLEN state
  const [selectedLines, setSelectedLines] = useState<number[]>([1, 2]);
  const [tlenExecuted, setTlenExecuted] = useState(false);

  const cadLines = [
    { id: 1, name: lang === 'bn' ? 'মেইন রড A (Main Bar)' : 'Main Rebar A', lengthFt: 18.5, color: '#ef4444' },
    { id: 2, name: lang === 'bn' ? 'বেন্ড রড B (Bend Bar)' : 'Bend Rebar B', lengthFt: 12.25, color: '#f97316' },
    { id: 3, name: lang === 'bn' ? 'টাই রিং C (Stirrup Ring)' : 'Column Stirrup C', lengthFt: 4.5, color: '#10b981' },
    { id: 4, name: lang === 'bn' ? 'বাউন্ডারি ওয়াল লাইন' : 'Boundary Wall Line', lengthFt: 42.0, color: '#3b82f6' },
  ];

  const toggleCadLine = (id: number) => {
    setSelectedLines((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    setTlenExecuted(false);
  };

  const totalLengthCalculated = cadLines
    .filter((line) => selectedLines.includes(line.id))
    .reduce((sum, line) => sum + line.lengthFt, 0);

  // SketchUp EVL-FaceMaker state
  const [facesCreated, setFacesCreated] = useState<boolean>(false);
  const [showWireframe, setShowWireframe] = useState<boolean>(true);

  // Revit RoomTagger state
  const [isTagged, setIsTagged] = useState<boolean>(false);
  const revitRooms = [
    { id: 'r1', name: lang === 'bn' ? 'মাস্টার বেড' : 'Master Bed', areaSqft: 180 },
    { id: 'r2', name: lang === 'bn' ? 'লিভিং রুম' : 'Living Room', areaSqft: 260 },
    { id: 'r3', name: lang === 'bn' ? 'কিচেন' : 'Kitchen', areaSqft: 95 },
    { id: 'r4', name: lang === 'bn' ? 'ডাইনিং' : 'Dining Room', areaSqft: 140 },
  ];

  // Civil 3D CutFill state
  const [plotArea, setPlotArea] = useState<number>(500); // sq.m
  const [existingElev, setExistingElev] = useState<number>(12.5); // meters
  const [designElev, setDesignElev] = useState<number>(14.0); // meters

  const elevDiff = designElev - existingElev;
  const isFill = elevDiff > 0;
  const volumeM3 = Math.abs(plotArea * elevDiff);
  const volumeCft = volumeM3 * 35.3147;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            {t.testDriveTitle}
          </span>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
          {t.simulatorBadge}
        </span>
      </div>

      {/* AutoCAD Simulator (EVL-SecMark vs EVL-TLEN) */}
      {softwareId === 'autocad' && (
        <div className="space-y-4">
          {/* AutoCAD Tool Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                {lang === 'bn' ? 'টুল সিলেক্ট করুন:' : 'Select CAD Tool:'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveCadTool('autolayer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                  activeCadTool === 'autolayer'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📑</span>
                <span>EVL-AutoLayer ({lang === 'bn' ? 'অটো লেয়ার' : 'Auto Layer'})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCadTool('secmark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                  activeCadTool === 'secmark'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>✂️</span>
                <span>EVL-SecMark ({lang === 'bn' ? 'সেকশন মার্কার' : 'Section Marker'})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCadTool('tlen')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                  activeCadTool === 'tlen'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📊</span>
                <span>EVL-TLEN ({lang === 'bn' ? 'রড ও লাইন দৈর্ঘ্য' : 'Linear Estimator'})</span>
              </button>
            </div>
          </div>

          {/* Active Tool 1: EVL-AutoLayer CAD Standards Generator */}
          {activeCadTool === 'autolayer' && (
            <div>
              <AutoLayerVisualizer lang={lang} />
            </div>
          )}

          {/* Active Tool 2: EVL-SecMark Dynamic Section Marker */}
          {activeCadTool === 'secmark' && (
            <div>
              <SectionMarkerVisualizer lang={lang} />
            </div>
          )}

          {/* Active Tool 2: EVL-TLEN Rebar / Line Estimator */}
          {activeCadTool === 'tlen' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-300">
                {lang === 'bn'
                  ? 'নিচের ক্যাড লাইনগুলো সিলেক্ট করে "কমান্ড রান করুন" চাপুন:'
                  : 'Select any CAD rebar lines below and click "Run Command":'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cadLines.map((line) => {
                  const selected = selectedLines.includes(line.id);
                  return (
                    <button
                      key={line.id}
                      type="button"
                      onClick={() => toggleCadLine(line.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all text-xs sm:text-sm ${
                        selected
                          ? 'bg-slate-800 border-amber-500/60 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-sm inline-block shrink-0"
                          style={{ backgroundColor: line.color }}
                        />
                        <span className="font-medium truncate">{line.name}</span>
                      </div>
                      <span className="font-mono text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-700 shrink-0">
                        {line.lengthFt} ft
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setTlenExecuted(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs sm:text-sm transition-colors shadow-md cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {t.runCommand} (EVL-TLEN)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLines([1, 2, 3, 4]);
                    setTlenExecuted(false);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  {t.selectAll}
                </button>
              </div>

              {/* Simulated AutoCAD Terminal */}
              <div className="font-mono text-xs bg-black/90 border border-slate-800 rounded-lg p-3 text-emerald-400 space-y-1">
                <div className="text-slate-500">Command: _EVL-TLEN</div>
                <div>[EVLab Hub] Scanning drawing entities...</div>
                {tlenExecuted ? (
                  <div className="border-t border-slate-800 pt-1.5 mt-1.5 text-amber-300">
                    <div className="text-white">
                      &gt;&gt;&gt; {t.totalItems} <span className="font-bold">{selectedLines.length}</span>
                    </div>
                    <div className="text-emerald-300 font-bold text-sm sm:text-base">
                      &gt;&gt;&gt; {t.totalLength} = {totalLengthCalculated.toFixed(2)} FEET ({ (totalLengthCalculated * 0.3048).toFixed(2) } METER)
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      ✓ {lang === 'bn' ? 'ক্যালকুলেটর ছাড়াই ১ ক্লিকে মোট মাপ প্রস্তুত।' : 'Instantly calculated without manual summing.'}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 italic">
                    {selectedLines.length} items selected. Click &quot;Run Command (EVL-TLEN)&quot; to calculate...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SketchUp Simulator (Native Dockable Toolbar & Complete 3D Building Suite) */}
      {softwareId === 'sketchup' && (
        <div className="space-y-4">
          {/* Authentic SketchUp Native Toolbar (সবগুলো টুল একসাথে টুলবার হিসেবে) */}
          <SketchUpToolbar
            activeTool={activeToolbarTool}
            onSelectTool={handleToolbarSelect}
            lang={lang}
          />

          {/* Other Specialty Tool Category Switches (Landscape, Sculpt, Rail) */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                {lang === 'bn' ? 'অন্যান্য স্পেশালিটি টুলস:' : 'Other Specialty Tools:'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveSketchupTool('landscape')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  activeSketchupTool === 'landscape'
                    ? 'bg-emerald-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🌱</span>
                <span>EVL-Landscape (Draw-to-3D)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSketchupTool('building_bim')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  activeSketchupTool === 'building_bim'
                    ? 'bg-sky-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🏛️</span>
                <span>EVL-Building BIM (Levels/BOQ)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSketchupTool('vertex')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeSketchupTool === 'vertex'
                    ? 'bg-red-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🌐</span>
                <span>EVL-Vertex (3D Sculpt)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSketchupTool('railing')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeSketchupTool === 'railing'
                    ? 'bg-sky-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🪟</span>
                <span>EVL-Railing (10)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSketchupTool('grill')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeSketchupTool === 'grill'
                    ? 'bg-amber-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🔲</span>
                <span>EVL-Grill (10)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSketchupTool('window')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeSketchupTool === 'window'
                    ? 'bg-sky-500 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🪟</span>
                <span>EVL-Window (10)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSketchupTool('door')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeSketchupTool === 'door'
                    ? 'bg-amber-700 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🚪</span>
                <span>EVL-Door (10)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSketchupTool('gate')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeSketchupTool === 'gate'
                    ? 'bg-orange-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⛩️</span>
                <span>EVL-Gate (10)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSketchupTool('boundarywall')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeSketchupTool === 'boundarywall'
                    ? 'bg-emerald-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🧱</span>
                <span>EVL-BoundaryWall (10)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSketchupTool('rail')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeSketchupTool === 'rail'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🚂</span>
                <span>EVL-Rail (Track)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSketchupTool('facemaker')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeSketchupTool === 'facemaker'
                    ? 'bg-slate-700 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📐</span>
                <span>EVL-FaceMaker</span>
              </button>
            </div>
          </div>

          {/* Sub-view Landscape: EVLab Landscape Draw-to-Create & Smart Scatter */}
          {activeSketchupTool === 'landscape' && (
            <LandscapeDesignerVisualizer lang={lang} />
          )}

          {/* Sub-view Building BIM: EVLab Building BIM Levels, Walls, Rooms & BOQ */}
          {activeSketchupTool === 'building_bim' && (
            <BuildingBIMVisualizer lang={lang} />
          )}

          {/* Sub-view 0: EVL-Vertex (Vertex Tools 2 3D Sculptor) */}
          {activeSketchupTool === 'vertex' && (
            <VertexVisualizer lang={lang} />
          )}

          {/* Sub-view 1: EVL-Railing */}
          {activeSketchupTool === 'railing' && (
            <RailingVisualizer lang={lang} />
          )}

          {/* Sub-view 2: EVL-Grill */}
          {activeSketchupTool === 'grill' && (
            <GrillVisualizer lang={lang} />
          )}

          {/* Sub-view 3: EVL-Window */}
          {activeSketchupTool === 'window' && (
            <WindowVisualizer lang={lang} />
          )}

          {/* Sub-view 4: EVL-Door */}
          {activeSketchupTool === 'door' && (
            <DoorVisualizer lang={lang} />
          )}

          {/* Sub-view 5: EVL-Gate */}
          {activeSketchupTool === 'gate' && (
            <GateVisualizer lang={lang} />
          )}

          {/* Sub-view 6: EVL-BoundaryWall */}
          {activeSketchupTool === 'boundarywall' && (
            <BoundaryWallVisualizer lang={lang} />
          )}

          {/* Sub-view 7: EVL-Rail */}
          {activeSketchupTool === 'rail' && (
            <RailTrackVisualizer lang={lang} />
          )}

          {/* Sub-view 8: EVL-FaceMaker Simulator */}
          {activeSketchupTool === 'facemaker' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-300">
                {lang === 'bn'
                  ? 'ক্যাড ড্রয়িংয়ের ফাঁকা বাউন্ডারি লাইনে ১-ক্লিকে সলিড ফেস তৈরি ও অটো রিভার্স করুন:'
                  : 'Generate solid front faces on raw imported CAD line boundaries in 1-click:'}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-300">
                  {t.cadLineStatus}{' '}
                  <span className={facesCreated ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                    {facesCreated ? t.cadFaceCreated : t.cadNoFace}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFacesCreated(!facesCreated)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors shadow"
                  >
                    {facesCreated ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" /> {t.faceMakerReset}
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> {t.faceMakerAction}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Interactive Visual Canvas for SketchUp FaceMaker */}
              <div className="relative bg-slate-950 rounded-lg border border-slate-800 p-3.5 overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { name: 'Room 1 (Living)', dim: '14x16 ft' },
                    { name: 'Room 2 (Bed)', dim: '12x14 ft' },
                    { name: 'Room 3 (Kitchen)', dim: '10x10 ft' },
                    { name: 'Room 4 (Balcony)', dim: '6x10 ft' },
                  ].map((zone, idx) => (
                    <div
                      key={idx}
                      className={`h-28 rounded-md transition-all duration-500 border-2 p-2 flex flex-col justify-between ${
                        facesCreated
                          ? 'bg-slate-100 border-slate-400 shadow-md text-slate-800'
                          : 'bg-transparent border-dashed border-sky-400/80 text-sky-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-semibold">
                          {zone.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            facesCreated
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-600/60'
                          }`}
                        >
                          {facesCreated ? 'Front Face' : 'Edge Only'}
                        </span>
                      </div>

                      <div className="text-center my-auto">
                        {facesCreated ? (
                          <div className="text-xs font-semibold text-slate-900">
                            ✓ Solid Surface
                            <div className="text-[10px] text-slate-500 font-normal">Push-Pull Ready</div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-sky-400/80 italic">
                            [No Face / Empty CAD Wireframe]
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-right font-mono opacity-70">
                        {zone.dim}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-emerald-400">
                    {facesCreated
                      ? '>>> EVL-FaceMaker: 4 Faces Created | 0 Reversed Blue Faces | 100% Closed'
                      : '>>> Imported CAD Wireframe: 0 Faces Detected. Click "Generate Clean Faces" above.'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {lang === 'bn' ? 'পেনসিল দিয়ে লাইন ঘষার প্রয়োজন নেই' : 'Eliminates Pencil line re-tracing'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revit RoomTagger Simulator */}
      {softwareId === 'revit' && (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-300">
            {lang === 'bn'
              ? 'ডায়নামো প্লেয়ারের মাধ্যমে স্বয়ংক্রিয় রুম ট্যাগ ও এরিয়া ক্যালকুলেট করুন:'
              : 'Execute Dynamo Player to auto-tag rooms and calculate areas:'}
          </p>

          <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-300">
              {t.floorStatus}{' '}
              <span className={isTagged ? 'text-teal-400 font-semibold' : 'text-amber-400'}>
                {isTagged ? t.taggedSuccess : t.untagged}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTagged(!isTagged)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition-colors shadow"
            >
              {isTagged ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isTagged ? t.reset : `${t.runDynamo} (EVL-RoomTagger)`}
            </button>
          </div>

          <div className="relative h-40 bg-slate-950 rounded-lg border border-slate-800 grid grid-cols-2 gap-2 p-3">
            {revitRooms.map((room) => (
              <div
                key={room.id}
                className="border border-slate-700 bg-slate-900/80 rounded flex flex-col items-center justify-center p-2 text-center"
              >
                {isTagged ? (
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-teal-950 border border-teal-500/60 text-teal-300 text-xs font-bold">
                      {room.name}
                    </span>
                    <div className="text-[11px] font-mono text-white mt-1">
                      {room.areaSqft} sq.ft
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 italic">
                    [{lang === 'bn' ? 'ট্যাগ নেই' : 'Untagged'}]
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Civil 3D CutFill Simulator */}
      {softwareId === 'civil3d' && (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-300">
            {lang === 'bn'
              ? 'লেভেল ইনপুট দিয়ে EVL-CutFill-এর মাধ্যমে তাৎক্ষণিক মাটিকাটা ও ভরাটের হিসাব দেখুন:'
              : 'Calculate site excavation and embankment volumes instantly via EVL-CutFill:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs">
            <div>
              <label htmlFor="sim-c3d-area" className="block text-slate-400 mb-1">{t.plotArea}</label>
              <input
                id="sim-c3d-area"
                type="number"
                value={plotArea}
                onChange={(e) => setPlotArea(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label htmlFor="sim-c3d-ex" className="block text-slate-400 mb-1">{t.existingLevel}</label>
              <input
                id="sim-c3d-ex"
                type="number"
                step="0.1"
                value={existingElev}
                onChange={(e) => setExistingElev(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label htmlFor="sim-c3d-des" className="block text-slate-400 mb-1">{t.designLevel}</label>
              <input
                id="sim-c3d-des"
                type="number"
                step="0.1"
                value={designElev}
                onChange={(e) => setDesignElev(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>
          </div>

          <div
            className={`p-3.5 rounded-lg border text-xs sm:text-sm ${
              isFill
                ? 'bg-amber-950/40 border-amber-600/40 text-amber-200'
                : 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1.5">
              <span>{isFill ? t.fillRequired : t.cutRequired}</span>
              <span className="font-mono bg-black/40 px-2 py-0.5 rounded border border-current">
                {t.heightDiff} {Math.abs(elevDiff).toFixed(2)} m
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1 border-t border-white/10">
              <div>{t.totalVol} <span className="text-white font-bold">{volumeM3.toFixed(2)} m³</span></div>
              <div>{t.cftVol} <span className="text-white font-bold">{volumeCft.toFixed(2)} cft</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
