import React, { useState, useMemo } from 'react';
import { Layers, Box, Globe, ShieldCheck, CheckCircle2, AlertTriangle, Cpu, Ruler, RefreshCw, ZoomIn, ZoomOut, Compass, Eye, Filter, Sliders, ChevronRight } from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';
import { getEngineeringModelRegistry, EngineeringObject } from '../core/engineeringModelRegistry';
import { generateDrawingRegister, CAD_LAYERS, CadLayer, calculateUnitElevations, generatePidControlLoops } from '../core/drawingEngine';
import { generate3DDigitalTwinScene, VisualizationMode, calculate3DDistance, getObjectColorForMode } from '../core/threeDEngine';
import { generateGisMapFeatures, generateTerrainContours, calculateEarthworkCutFill, transformLocalToGis, CoordinateSystem } from '../core/gisEngine';
import { generateBimHierarchyTree, validateBimModel, BimNode } from '../core/bimEngine';
import { runEngineeringTestSuite, TestCaseResult } from '../core/engineeringTests';

interface DrawingsViewProps {
  state: CalculatedWtpState;
}

export const DrawingsView: React.FC<DrawingsViewProps> = ({ state }) => {
  const [activeMainTab, setActiveMainTab] = useState<'cad2d' | 'twin3d' | 'gis' | 'bim' | 'asbuilt' | 'validation' | 'tests'>('twin3d');
  
  // 2D CAD State
  const [selectedDrawingId, setSelectedDrawingId] = useState<string>('DWG-SITE-001');
  const [cadLayers, setCadLayers] = useState<CadLayer[]>(CAD_LAYERS);
  const [zoomLevel, setZoomLevel] = useState(100);

  // 3D Digital Twin State
  const [visMode, setVisMode] = useState<VisualizationMode>('PROCESS');
  const [selected3DObjectId, setSelected3DObjectId] = useState<string>('RWP-001');
  const [measurePointA, setMeasurePointA] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 10 });
  const [measurePointB, setMeasurePointB] = useState<{ x: number; y: number; z: number }>({ x: 30, y: 40, z: 10 });

  // GIS State
  const [selectedCrs, setSelectedCrs] = useState<CoordinateSystem>('EPSG_32645_UTM_ZONE_45N');
  const [proposedGradingM, setProposedGradingM] = useState<number>(11.5);

  // BIM State
  const [selectedBimNodeId, setSelectedBimNodeId] = useState<string>('BIM-ELEM-INT-001');

  // Test Suite State
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);

  // Derived Data
  const modelRegistry = useMemo(() => getEngineeringModelRegistry(state), [state]);
  const drawingRegister = useMemo(() => generateDrawingRegister(state), [state]);
  const scene3D = useMemo(() => generate3DDigitalTwinScene(state, visMode), [state, visMode]);
  const gisFeatures = useMemo(() => generateGisMapFeatures(state, selectedCrs), [state, selectedCrs]);
  const contours = useMemo(() => generateTerrainContours(8.0, 18.0, 0.5), []);
  const earthwork = useMemo(() => calculateEarthworkCutFill(modelRegistry, proposedGradingM), [modelRegistry, proposedGradingM]);
  const bimTree = useMemo(() => generateBimHierarchyTree(state), [state]);
  const bimValidation = useMemo(() => validateBimModel(state), [state]);
  const distance3D = useMemo(() => calculate3DDistance(measurePointA, measurePointB), [measurePointA, measurePointB]);
  const pidLoops = useMemo(() => generatePidControlLoops(modelRegistry), [modelRegistry]);

  const selectedDrawing = drawingRegister.find(d => d.metadata.drawingId === selectedDrawingId) || drawingRegister[0];
  const selectedObject = modelRegistry.find(o => o.objectId === selected3DObjectId) || modelRegistry[0];
  const selectedBimNode = bimTree.find(n => n.nodeId === selectedBimNodeId) || bimTree[3];

  const toggleLayerVisibility = (layerId: string) => {
    setCadLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l));
  };

  const handleRunTests = () => {
    const results = runEngineeringTestSuite();
    setTestResults(results);
  };

  const phase11Tests = testResults ? testResults.filter(t => parseInt(t.id.replace('TEST-', '')) >= 85) : [];

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Box className="w-6 h-6 text-cyan-400" />
            <span>Phase 11 — Engineering Drawings, BIM, GIS & 3D Digital Twin Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Data-driven spatial modeling, 2D CAD generation, 3D parametric meshes, GIS terrain grading & BIM property sets.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveMainTab('twin3d')}
            className={`px-4 py-2 rounded-lg font-bold border transition flex items-center gap-1.5 ${
              activeMainTab === 'twin3d' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Box className="w-4 h-4" /> 3D Digital Twin
          </button>
          <button
            onClick={() => setActiveMainTab('cad2d')}
            className={`px-4 py-2 rounded-lg font-bold border transition flex items-center gap-1.5 ${
              activeMainTab === 'cad2d' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" /> 2D CAD Drawings
          </button>
          <button
            onClick={() => setActiveMainTab('gis')}
            className={`px-4 py-2 rounded-lg font-bold border transition flex items-center gap-1.5 ${
              activeMainTab === 'gis' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Globe className="w-4 h-4" /> GIS & Terrain
          </button>
          <button
            onClick={() => setActiveMainTab('bim')}
            className={`px-4 py-2 rounded-lg font-bold border transition flex items-center gap-1.5 ${
              activeMainTab === 'bim' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Cpu className="w-4 h-4" /> BIM Hierarchy
          </button>
          <button
            onClick={() => setActiveMainTab('asbuilt')}
            className={`px-4 py-2 rounded-lg font-bold border transition flex items-center gap-1.5 ${
              activeMainTab === 'asbuilt' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Ruler className="w-4 h-4" /> As-Built Diff
          </button>
          <button
            onClick={() => setActiveMainTab('validation')}
            className={`px-4 py-2 rounded-lg font-bold border transition flex items-center gap-1.5 ${
              activeMainTab === 'validation' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> BIM Audit ({bimValidation.issues.length})
          </button>
          <button
            onClick={() => { setActiveMainTab('tests'); if (!testResults) handleRunTests(); }}
            className={`px-4 py-2 rounded-lg font-bold border transition flex items-center gap-1.5 ${
              activeMainTab === 'tests' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Test Suite
          </button>
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-2xs uppercase">Registered Model Objects</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">{modelRegistry.length} Units</div>
          <div className="text-2xs text-slate-500 mt-1">Single Source of Truth</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-2xs uppercase">Generated CAD Drawings</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{drawingRegister.length} Sets</div>
          <div className="text-2xs text-slate-500 mt-1">19 Layer Standards</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-2xs uppercase">3D Parametric Meshes</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{scene3D.meshes.length} Meshes</div>
          <div className="text-2xs text-slate-500 mt-1">8 Color Mode Matrix</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-2xs uppercase">GIS Projected CRS</div>
          <div className="text-xl font-bold text-purple-400 mt-1">UTM Zone 45N</div>
          <div className="text-2xs text-slate-500 mt-1">EPSG:32645 & WGS84</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-2xs uppercase">Earthwork Grading Net</div>
          <div className="text-xl font-bold text-blue-400 mt-1">{earthwork.netEarthworkM3} m³</div>
          <div className="text-2xs text-slate-500 mt-1">Status: {earthwork.status}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-2xs uppercase">BIM Validation Status</div>
          <div className={`text-xl font-bold mt-1 ${bimValidation.status === 'PASSED' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {bimValidation.status}
          </div>
          <div className="text-2xs text-slate-500 mt-1">{bimValidation.linkedObjectsCount}/{bimValidation.totalObjectsCount} Traceable</div>
        </div>
      </div>

      {/* TAB 1: 3D DIGITAL TWIN VIEWER */}
      {activeMainTab === 'twin3d' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6 relative min-h-[550px] flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-center z-10 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="flex gap-2 items-center">
                <span className="text-slate-400 text-2xs font-bold uppercase">Visualization Mode:</span>
                {(['ENGINEERING', 'PROCESS', 'HYDRAULIC', 'EQUIPMENT', 'CONSTRUCTION', 'PROCUREMENT', 'QAQC', 'AS_BUILT'] as VisualizationMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setVisMode(m)}
                    className={`px-2.5 py-1 rounded text-2xs font-bold border transition ${
                      visMode === m ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D SCENE VISUALIZATION CANVAS */}
            <div className="my-6 relative h-[380px] bg-slate-950 rounded-lg border border-slate-800/80 p-4 flex items-center justify-center overflow-hidden">
              <svg width="100%" height="100%" viewBox="-50 -100 450 300" className="w-full h-full">
                {/* Grid Lines */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <line key={`grid-x-${i}`} x1={i * 40 - 50} y1="-100" x2={i * 40 - 50} y2="200" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`grid-y-${i}`} x1="-50" y1={i * 40 - 100} x2="400" y2={i * 40 - 100} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                ))}

                {/* 3D Meshes Rendered Isometric View */}
                {scene3D.meshes.map((mesh) => {
                  const isSelected = mesh.associatedObjectId === selected3DObjectId;
                  return (
                    <g key={mesh.meshId} onClick={() => setSelected3DObjectId(mesh.associatedObjectId)} className="cursor-pointer">
                      <rect
                        x={mesh.position.x - mesh.dimensions.lengthM / 2}
                        y={mesh.position.y - mesh.dimensions.widthM / 2}
                        width={mesh.dimensions.lengthM}
                        height={mesh.dimensions.widthM}
                        fill={mesh.materialColorHex}
                        fillOpacity={isSelected ? 0.9 : 0.6}
                        stroke={isSelected ? '#ffffff' : '#38bdf8'}
                        strokeWidth={isSelected ? 2.5 : 1}
                        rx={mesh.geometryType === 'CYLINDER' ? mesh.dimensions.radiusM : 2}
                      />
                      <text
                        x={mesh.position.x}
                        y={mesh.position.y}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="6"
                        fontWeight="bold"
                      >
                        {mesh.associatedObjectId}
                      </text>
                    </g>
                  );
                })}

                {/* 3D Measurement Vector Line */}
                <line x1={measurePointA.x} y1={measurePointA.y} x2={measurePointB.x} y2={measurePointB.y} stroke="#facc15" strokeWidth="2" strokeDasharray="4 2" />
                <circle cx={measurePointA.x} cy={measurePointA.y} r="3" fill="#facc15" />
                <circle cx={measurePointB.x} cy={measurePointB.y} r="3" fill="#facc15" />
                <text x={(measurePointA.x + measurePointB.x) / 2} y={(measurePointA.y + measurePointB.y) / 2 - 5} fill="#facc15" fontSize="8" fontWeight="bold">
                  {distance3D.direct3DDistanceM.toFixed(1)}m 3D Distance
                </text>
              </svg>
            </div>

            {/* SCENE FOOTER METRICS */}
            <div className="flex justify-between items-center text-2xs text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
              <div>Active Mode: <span className="text-cyan-400 font-bold">{visMode}</span></div>
              <div>Parametric Objects: <span className="text-emerald-400 font-bold">{scene3D.meshes.length} Registered</span></div>
              <div>Clipping Planes: <span className="text-slate-300">X: Off, Y: Off, Z: Off</span></div>
            </div>
          </div>

          {/* OBJECT INSPECTOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>3D Object Inspector</span>
            </h3>

            <div className="space-y-3">
              <label className="text-2xs text-slate-400 uppercase font-bold">Select Plant Unit:</label>
              <select
                value={selected3DObjectId}
                onChange={e => setSelected3DObjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs"
              >
                {modelRegistry.map(o => (
                  <option key={o.objectId} value={o.objectId}>{o.equipmentTag} - {o.name}</option>
                ))}
              </select>

              {selectedObject && (
                <div className="space-y-2.5 bg-slate-950 p-3.5 rounded border border-slate-800 text-2xs">
                  <div><span className="text-slate-500">Object ID:</span> <span className="text-cyan-400 font-bold">{selectedObject.objectId}</span></div>
                  <div><span className="text-slate-500">Equipment Tag:</span> <span className="text-amber-400 font-bold">{selectedObject.equipmentTag}</span></div>
                  <div><span className="text-slate-500">IFC GUID:</span> <span className="text-purple-400 font-mono">{selectedObject.ifcGuid}</span></div>
                  <div><span className="text-slate-500">IFC Class:</span> <span className="text-slate-300">{selectedObject.ifcType}</span></div>
                  <div><span className="text-slate-500">Coordinates (X,Y,Z):</span> <span className="text-emerald-400 font-bold">{selectedObject.coordinates.x}m, {selectedObject.coordinates.y}m, {selectedObject.coordinates.z}m</span></div>
                  <div><span className="text-slate-500">Dimensions (L x W x H):</span> <span className="text-slate-300">{selectedObject.dimensions.lengthM}m x {selectedObject.dimensions.widthM}m x {selectedObject.dimensions.heightM}m</span></div>
                  <div><span className="text-slate-500">Material:</span> <span className="text-slate-300">{selectedObject.material}</span></div>
                  <div><span className="text-slate-500">Status:</span> <span className="text-emerald-400 font-bold">{selectedObject.status}</span></div>
                  <div className="border-t border-slate-800 pt-2 text-slate-400">
                    <div className="font-bold text-slate-300 mb-1">Process Relationships:</div>
                    <div>Upstream: {selectedObject.processRelationship.upstreamObjectIds.join(', ') || 'None'}</div>
                    <div>Downstream: {selectedObject.processRelationship.downstreamObjectIds.join(', ') || 'None'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* 3D MEASUREMENT ENGINE BOX */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded space-y-2 text-2xs">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" /> 3D Measurement Engine
              </div>
              <div>Direct 3D Distance: <span className="text-slate-200 font-bold">{distance3D.direct3DDistanceM.toFixed(2)} m</span></div>
              <div>Horizontal Distance: <span className="text-slate-200 font-bold">{distance3D.horizontalDistanceM.toFixed(2)} m</span></div>
              <div>Elevation Delta (ΔZ): <span className="text-slate-200 font-bold">{distance3D.elevationDifferenceM.toFixed(2)} m</span></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 2D CAD DRAWINGS */}
      {activeMainTab === 'cad2d' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6 relative min-h-[550px] flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-center z-10 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="flex gap-2 items-center">
                <span className="text-slate-400 text-2xs font-bold uppercase">Drawing Sheet:</span>
                {drawingRegister.map(d => (
                  <button
                    key={d.metadata.drawingId}
                    onClick={() => setSelectedDrawingId(d.metadata.drawingId)}
                    className={`px-3 py-1 rounded text-2xs font-bold border transition ${
                      selectedDrawingId === d.metadata.drawingId ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {d.metadata.title}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 items-center bg-slate-900 p-1 rounded border border-slate-800">
                <button onClick={() => setZoomLevel(prev => Math.min(prev + 20, 200))} className="p-1 text-slate-300 hover:bg-slate-800 rounded"><ZoomIn className="w-4 h-4" /></button>
                <span className="text-2xs text-slate-400 font-bold px-1">{zoomLevel}%</span>
                <button onClick={() => setZoomLevel(prev => Math.max(prev - 20, 60))} className="p-1 text-slate-300 hover:bg-slate-800 rounded"><ZoomOut className="w-4 h-4" /></button>
                <button onClick={() => setZoomLevel(100)} className="p-1 text-slate-300 hover:bg-slate-800 rounded"><RefreshCw className="w-4 h-4" /></button>
              </div>
            </div>

            {/* CAD VIEWPORT */}
            <div className="my-6 relative h-[380px] bg-slate-950 rounded-lg border border-slate-800 p-4 flex items-center justify-center overflow-hidden">
              <div style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }} className="transition-transform duration-200 w-full h-full flex items-center justify-center">
                {selectedDrawing.metadata.discipline === 'SITE_PLAN' && (
                  <svg width="700" height="300" viewBox="-20 -50 420 220" className="text-slate-200">
                    <rect x="-20" y="-50" width="420" height="220" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
                    {modelRegistry.map(o => (
                      <g key={o.objectId}>
                        <rect
                          x={o.coordinates.x - o.dimensions.lengthM / 2}
                          y={o.coordinates.y - o.dimensions.widthM / 2}
                          width={o.dimensions.lengthM}
                          height={o.dimensions.widthM}
                          fill="#0f172a"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                        />
                        <text x={o.coordinates.x} y={o.coordinates.y + 3} textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold">
                          {o.equipmentTag}
                        </text>
                      </g>
                    ))}
                  </svg>
                )}

                {selectedDrawing.metadata.discipline === 'PROCESS_FLOW_DIAGRAM' && (
                  <svg width="750" height="250" viewBox="0 0 750 250">
                    <rect x="20" y="80" width="80" height="70" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" rx="6" />
                    <text x="60" y="120" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">INTAKE</text>
                    <line x1="100" y1="115" x2="160" y2="115" stroke="#0284c7" strokeWidth="3" />

                    <rect x="160" y="80" width="80" height="70" fill="#0f172a" stroke="#a855f7" strokeWidth="2" rx="6" />
                    <text x="200" y="120" textAnchor="middle" fill="#a855f7" fontSize="9" fontWeight="bold">AERATOR</text>
                    <line x1="240" y1="115" x2="300" y2="115" stroke="#0284c7" strokeWidth="3" />

                    <rect x="300" y="80" width="80" height="70" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="6" />
                    <text x="340" y="120" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">MIX / FLOCC</text>
                    <line x1="380" y1="115" x2="440" y2="115" stroke="#0284c7" strokeWidth="3" />

                    <rect x="440" y="80" width="90" height="70" fill="#0f172a" stroke="#10b981" strokeWidth="2" rx="6" />
                    <text x="485" y="120" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">CLARIFIERS</text>
                    <line x1="530" y1="115" x2="590" y2="115" stroke="#0284c7" strokeWidth="3" />

                    <rect x="590" y="80" width="90" height="70" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" rx="6" />
                    <text x="635" y="120" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">GRAVITY FILTERS</text>
                  </svg>
                )}

                {selectedDrawing.metadata.discipline === 'HYDRAULIC_PROFILE' && (
                  <svg width="750" height="250" viewBox="0 0 750 250">
                    <polyline points="30,60 160,80 300,105 450,135 600,165 720,200" fill="none" stroke="#38bdf8" strokeWidth="3" />
                    {modelRegistry.slice(0, 6).map((o, idx) => {
                      const elevs = calculateUnitElevations(o, state);
                      return (
                        <g key={o.objectId}>
                          <rect x={30 + idx * 115} y={100 + idx * 15} width="75" height="100" fill="#0284c7" fillOpacity="0.25" stroke="#0284c7" />
                          <text x={67 + idx * 115} y={120 + idx * 15} textAnchor="middle" fill="#e0f2fe" fontSize="8" fontWeight="bold">
                            {o.equipmentTag} ({elevs.maxWaterLevelM.toFixed(1)}m)
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

            {/* TITLE BLOCK METADATA */}
            <div className="bg-slate-950 p-3.5 rounded border border-slate-800 grid grid-cols-2 md:grid-cols-6 gap-3 text-2xs">
              <div><span className="text-slate-500">Drawing No:</span> <span className="text-cyan-400 font-bold">{selectedDrawing.metadata.drawingNumber}</span></div>
              <div><span className="text-slate-500">Scale:</span> <span className="text-slate-200">{selectedDrawing.metadata.scale}</span></div>
              <div><span className="text-slate-500">Sheet Size:</span> <span className="text-amber-400 font-bold">{selectedDrawing.metadata.sheetSize}</span></div>
              <div><span className="text-slate-500">Revision:</span> <span className="text-emerald-400 font-bold">{selectedDrawing.metadata.revision}</span></div>
              <div><span className="text-slate-500">Author:</span> <span className="text-slate-300">{selectedDrawing.metadata.author}</span></div>
              <div><span className="text-slate-500">Status:</span> <span className="text-purple-400 font-bold">{selectedDrawing.metadata.status}</span></div>
            </div>
          </div>

          {/* LAYER CONTROL PANEL */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>19 CAD Layer Manager</span>
            </h3>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {cadLayers.map(layer => (
                <div key={layer.id} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800/80 text-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-slate-700" style={{ backgroundColor: layer.colorHex }}></span>
                    <span className="text-slate-200 font-bold">{layer.name}</span>
                  </div>
                  <button
                    onClick={() => toggleLayerVisibility(layer.id)}
                    className={`px-2 py-0.5 rounded text-2xs font-bold border transition ${
                      layer.visible ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}
                  >
                    {layer.visible ? 'VISIBLE' : 'HIDDEN'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GIS & TERRAIN */}
      {activeMainTab === 'gis' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>GIS Spatial Mapping & DEM Terrain Contour Engine</span>
              </h3>

              <div className="flex gap-2 items-center">
                <span className="text-slate-400 text-2xs font-bold uppercase">Coordinate Reference System:</span>
                <select
                  value={selectedCrs}
                  onChange={e => setSelectedCrs(e.target.value as CoordinateSystem)}
                  className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200 font-bold"
                >
                  <option value="EPSG_32645_UTM_ZONE_45N">EPSG:32645 - UTM Zone 45N</option>
                  <option value="EPSG_4326_WGS84">EPSG:4326 - WGS84 Geographic</option>
                </select>
              </div>
            </div>

            {/* GIS MAP CANVAS */}
            <div className="h-[380px] bg-slate-950 rounded-lg border border-slate-800 p-4 relative overflow-hidden flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="-80 -120 520 300">
                {/* Site Outer Boundary Polygon */}
                <polygon points="-50,-100 400,-100 400,150 -50,150" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
                <text x="-40" y="-85" fill="#ef4444" fontSize="8" fontWeight="bold">PLANT SITE BOUNDARY (11.25 Ha)</text>

                {/* DEM Contours */}
                {contours.map(c => (
                  <polyline
                    key={c.contourId}
                    points={c.points.map(p => `${p.easting - 542000},${p.northing - 2633000}`).join(' ')}
                    fill="none"
                    stroke={c.isMajor ? '#3b82f6' : '#1e3a8a'}
                    strokeWidth={c.isMajor ? '1.5' : '0.5'}
                  />
                ))}

                {/* GIS Objects */}
                {gisFeatures.filter(f => f.properties.category !== 'SITE_BOUNDARY').map(f => (
                  <circle
                    key={f.featureId}
                    cx={f.geometry[0].easting - 542000}
                    cy={f.geometry[0].northing - 2633000}
                    r="8"
                    fill="#38bdf8"
                    fillOpacity="0.8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>

            {/* GIS FEATURE TABLE */}
            <div className="overflow-x-auto bg-slate-950 rounded border border-slate-800">
              <table className="w-full text-left text-2xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-2.5">Feature ID</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">UTM Easting</th>
                    <th className="p-2.5">UTM Northing</th>
                    <th className="p-2.5">WGS84 Lat</th>
                    <th className="p-2.5">WGS84 Lon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {gisFeatures.slice(0, 6).map(f => (
                    <tr key={f.featureId} className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-bold text-cyan-400">{f.featureId}</td>
                      <td className="p-2.5 text-slate-200">{f.properties.name}</td>
                      <td className="p-2.5 text-slate-400">{f.properties.category}</td>
                      <td className="p-2.5 text-emerald-400 font-mono">{f.geometry[0].easting.toFixed(1)} mE</td>
                      <td className="p-2.5 text-emerald-400 font-mono">{f.geometry[0].northing.toFixed(1)} mN</td>
                      <td className="p-2.5 text-purple-400 font-mono">{f.geometry[0].lat.toFixed(6)}° N</td>
                      <td className="p-2.5 text-purple-400 font-mono">{f.geometry[0].lon.toFixed(6)}° E</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* EARTHWORK CUT & FILL CALCULATOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Earthwork Cut & Fill Balance</span>
            </h3>

            <div className="space-y-3 text-2xs">
              <label className="text-slate-400 uppercase font-bold block">Proposed Site Grading Level (m):</label>
              <input
                type="number"
                step="0.1"
                value={proposedGradingM}
                onChange={e => setProposedGradingM(parseFloat(e.target.value) || 11.5)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-bold"
              />

              <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2">
                <div>Existing Ground Mean: <span className="text-slate-300 font-bold">{earthwork.existingGroundMeanElevationM} m MSL</span></div>
                <div>Proposed Grading Level: <span className="text-cyan-400 font-bold">{earthwork.proposedGradingElevationM} m MSL</span></div>
                <div>Excavation Cut Volume: <span className="text-red-400 font-bold">{earthwork.cutVolumeM3} m³</span></div>
                <div>Backfill Volume: <span className="text-emerald-400 font-bold">{earthwork.fillVolumeM3} m³</span></div>
                <div className="border-t border-slate-800 pt-2 font-bold text-amber-400">
                  Net Balance: {earthwork.netEarthworkM3} m³ ({earthwork.status})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BIM HIERARCHY */}
      {activeMainTab === 'bim' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>BIM Tree Navigation</span>
            </h3>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {bimTree.map(node => (
                <button
                  key={node.nodeId}
                  onClick={() => setSelectedBimNodeId(node.nodeId)}
                  className={`w-full text-left p-2 rounded text-2xs font-bold transition flex items-center gap-2 border ${
                    selectedBimNodeId === node.nodeId ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                  style={{ paddingLeft: node.level === 'PROJECT' ? '8px' : node.level === 'SITE' ? '16px' : node.level === 'FACILITY' ? '24px' : '32px' }}
                >
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                  <span>[{node.level}] {node.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>BIM Property Set Inspector — {selectedBimNode?.name}</span>
            </h3>

            {selectedBimNode?.propertySet ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-2xs">
                <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-400 border-b border-slate-800 pb-1">1. General IFC Attributes</div>
                  <div>IFC GUID: <span className="text-purple-400 font-mono">{selectedBimNode.propertySet.general.ifcGuid}</span></div>
                  <div>IFC Class: <span className="text-slate-300">{selectedBimNode.propertySet.general.ifcType}</span></div>
                  <div>Discipline: <span className="text-slate-300">{selectedBimNode.propertySet.general.discipline}</span></div>
                </div>

                <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-400 border-b border-slate-800 pb-1">2. Process & Hydraulics</div>
                  <div>Capacity: <span className="text-slate-300">{selectedBimNode.propertySet.process.designCapacityMLD} MLD</span></div>
                  <div>Design Flow: <span className="text-slate-300">{selectedBimNode.propertySet.hydraulic.designFlowM3hr} m³/hr</span></div>
                  <div>Top Elevation: <span className="text-slate-300">{selectedBimNode.propertySet.hydraulic.topElevationM} m MSL</span></div>
                  <div>Max Water Level: <span className="text-emerald-400 font-bold">{selectedBimNode.propertySet.hydraulic.maxWaterLevelM} m MSL</span></div>
                </div>

                <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                  <div className="font-bold text-emerald-400 border-b border-slate-800 pb-1">3. Civil & Structural</div>
                  <div>Concrete Volume: <span className="text-slate-300">{selectedBimNode.propertySet.civil.concreteVolumeM3} m³</span></div>
                  <div>Rebar Weight: <span className="text-slate-300">{selectedBimNode.propertySet.civil.rebarWeightTons} Tonnes</span></div>
                  <div>Structure Material: <span className="text-slate-300">{selectedBimNode.propertySet.civil.structureMaterial}</span></div>
                </div>

                <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                  <div className="font-bold text-purple-400 border-b border-slate-800 pb-1">4. Electrical & Controls</div>
                  <div>Voltage: <span className="text-slate-300">{selectedBimNode.propertySet.electrical.voltageV} V</span></div>
                  <div>Control Panel: <span className="text-slate-300">{selectedBimNode.propertySet.electrical.controlMccPanel}</span></div>
                  <div>PLC Tag: <span className="text-slate-300">{selectedBimNode.propertySet.instrumentation.plcIoTag}</span></div>
                </div>

                <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                  <div className="font-bold text-blue-400 border-b border-slate-800 pb-1">5. Cost & BOQ Reference</div>
                  <div>BOQ Code: <span className="text-cyan-400 font-bold">{selectedBimNode.propertySet.cost.boqRefCode}</span></div>
                  <div>Estimated Cost: <span className="text-emerald-400 font-bold">${selectedBimNode.propertySet.cost.totalPriceUSD.toLocaleString()}</span></div>
                </div>

                <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                  <div className="font-bold text-red-400 border-b border-slate-800 pb-1">6. Procurement & Construction</div>
                  <div>Package Ref: <span className="text-slate-300">{selectedBimNode.propertySet.construction.procurementPkg}</span></div>
                  <div>Activity ID: <span className="text-slate-300">{selectedBimNode.propertySet.construction.activityId}</span></div>
                  <div>Status: <span className="text-emerald-400 font-bold">{selectedBimNode.propertySet.construction.status}</span></div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 italic p-6">Select an ELEMENT level node to inspect property set metadata.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: AS-BUILT DIFF */}
      {activeMainTab === 'asbuilt' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-purple-400" />
            <span>Design vs As-Built Measurement Comparison & Variance Tracker</span>
          </h3>

          <div className="overflow-x-auto bg-slate-950 rounded border border-slate-800">
            <table className="w-full text-left text-2xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-2.5">Object ID</th>
                  <th className="p-2.5">Equipment Tag</th>
                  <th className="p-2.5">Parameter</th>
                  <th className="p-2.5">Designed Value</th>
                  <th className="p-2.5">As-Built Value</th>
                  <th className="p-2.5">Difference</th>
                  <th className="p-2.5">Unit</th>
                  <th className="p-2.5">Tolerance Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {modelRegistry.filter(o => o.asBuiltData && o.asBuiltData.length > 0).flatMap(o =>
                  o.asBuiltData!.map((d, idx) => (
                    <tr key={`${o.objectId}-${idx}`} className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-bold text-cyan-400">{o.objectId}</td>
                      <td className="p-2.5 text-amber-400 font-bold">{o.equipmentTag}</td>
                      <td className="p-2.5 text-slate-200">{d.parameter}</td>
                      <td className="p-2.5 text-slate-300">{d.designedValue}</td>
                      <td className="p-2.5 text-emerald-400 font-bold">{d.asBuiltValue}</td>
                      <td className="p-2.5 text-purple-400 font-bold">{d.difference}</td>
                      <td className="p-2.5 text-slate-400">{d.unit}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500">
                          APPROVED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: BIM MODEL VALIDATION REPORT */}
      {activeMainTab === 'validation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Automated 14-Check BIM Model Integrity Validation Audit</span>
            </h3>

            <div className="flex gap-4 text-2xs">
              <div>Total Objects: <span className="text-cyan-400 font-bold">{bimValidation.totalObjectsCount}</span></div>
              <div>Traceable: <span className="text-emerald-400 font-bold">{bimValidation.linkedObjectsCount}</span></div>
              <div>Issues: <span className="text-amber-400 font-bold">{bimValidation.issues.length}</span></div>
            </div>
          </div>

          <div className="space-y-3">
            {bimValidation.issues.length === 0 ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300 text-center font-bold">
                100% Model Integrity Passed. Zero critical discrepancies detected across 3D, 2D, GIS, and BOQ links.
              </div>
            ) : (
              bimValidation.issues.map(iss => (
                <div key={iss.issueId} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center text-2xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-200 font-bold">[{iss.objectId}]</span>
                    <span className="text-slate-400">{iss.message}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-2xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500">
                    {iss.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: PHASE 11 TEST SUITE */}
      {activeMainTab === 'tests' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Phase 11 Deterministic Engineering Test Suite (TEST-85 to TEST-104)</span>
            </h3>

            <button
              onClick={handleRunTests}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500 rounded font-bold transition flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-Run Phase 11 Test Suite
            </button>
          </div>

          <div className="space-y-3">
            {phase11Tests.map(test => (
              <div key={test.id} className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2 text-2xs">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-cyan-400">{test.id}:</span>
                    <span className="text-slate-200">{test.name}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded font-bold border ${test.passed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' : 'bg-red-500/20 text-red-300 border-red-500'}`}>
                    {test.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="text-slate-400">{test.description}</div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-slate-300 flex flex-wrap gap-4">
                  {Object.entries(test.metrics).map(([k, v]) => (
                    <div key={k}><span className="text-slate-500">{k}:</span> <span className="text-emerald-400 font-bold">{String(v)}</span></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
