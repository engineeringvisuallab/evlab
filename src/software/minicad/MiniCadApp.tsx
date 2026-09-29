import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CADObject,
  Layer,
  TransformState,
  ToolType,
  SnapSettings,
  Point2D,
  CommandLog,
  ViewMode,
} from './types/cad';
import { TopMenuBar } from './components/TopMenuBar';
import { Toolbar } from './components/Toolbar';
import { LeftToolPanel } from './components/LeftToolPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { StatusBar } from './components/StatusBar';
import { Canvas2D } from './components/Canvas2D';
import { Canvas3D } from './components/Canvas3D';
import { ShortcutsModal } from './components/ShortcutsModal';
import { SAMPLE_DRAWINGS, SampleDrawing } from './utils/sampleDrawings';
import {
  exportToJSON,
  exportToSVG,
  exportToDXF,
  exportToPNG,
  exportToStandaloneHTML,
  downloadFile,
} from './utils/cadExport';
import { publishToBim } from '../bim/bimModel';
import { fromMiniCadObjects } from '../bim/fromMiniCad';

const INITIAL_LAYERS: Layer[] = [
  { id: 'outline', name: 'Outline (0)', color: '#00ffff', visible: true, locked: false, lineWeight: 2, lineType: 'solid' },
  { id: 'features', name: 'Features', color: '#00ff66', visible: true, locked: false, lineWeight: 1.5, lineType: 'solid' },
  { id: 'centerlines', name: 'Centerlines', color: '#ff5555', visible: true, locked: false, lineWeight: 1, lineType: 'dashed' },
  { id: 'dims', name: 'Dimensions', color: '#ffb703', visible: true, locked: false, lineWeight: 1, lineType: 'solid' },
];

export default function MiniCadApp() {
  // 2D vs 3D Mode State
  const [viewMode, setViewMode] = useState<ViewMode>('2d');

  // CAD Objects & Layers State
  const [objects, setObjects] = useState<CADObject[]>(SAMPLE_DRAWINGS[0].objects);
  const [layers, setLayers] = useState<Layer[]>(SAMPLE_DRAWINGS[0].layers);

  // Undo / Redo History Stack (snapshots both objects and layers)
  const [history, setHistory] = useState<{ objects: CADObject[]; layers: Layer[] }[]>([
    { objects: SAMPLE_DRAWINGS[0].objects, layers: SAMPLE_DRAWINGS[0].layers },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Canvas View Transform
  const [transform, setTransform] = useState<TransformState>({
    panX: 0,
    panY: 0,
    zoom: 1.2,
  });

  // Active Tool & Styling
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeLayerId, setActiveLayerId] = useState<string>('outline');
  const [activeColor, setActiveColor] = useState<string>('#00ffff');
  const [activeLineWeight, setActiveLineWeight] = useState<number>(2);

  // Precision Toggles
  const [gridEnabled, setGridEnabled] = useState<boolean>(true);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const [orthoEnabled, setOrthoEnabled] = useState<boolean>(false);
  const [snapSettings, setSnapSettings] = useState<SnapSettings>({
    grid: false,
    endpoint: true,
    midpoint: true,
    center: true,
    gridSize: 10,
  });

  // Selection & Cursor
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [cursorWorld, setCursorWorld] = useState<Point2D | null>(null);
  const [statusInstruction, setStatusInstruction] = useState<string>('');

  // Command History Console
  const [commandLogs, setCommandLogs] = useState<CommandLog[]>([
    { id: '1', text: 'Pro CAD Studio Initialized.', type: 'info', timestamp: '00:00' },
    { id: '2', text: 'Loaded sample drawing: Mechanical Mounting Flange', type: 'success', timestamp: '00:00' },
  ]);

  // Modal State
  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false);

  // Hidden File Input Ref for JSON import
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Logger helper
  const logMessage = useCallback((text: string, type: 'info' | 'success' | 'warn' | 'cmd' = 'info') => {
    const timeStr = new Date().toLocaleTimeString().split(' ')[0];
    setCommandLogs((prev) => [
      ...prev,
      { id: 'log_' + Date.now(), text, type, timestamp: timeStr },
    ]);
  }, []);

  // Commit history snapshot (Max 50 history steps)
  const commitState = useCallback(
    (newObjs: CADObject[], newLayers?: Layer[]) => {
      const activeLayers = newLayers || layers;
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        const nextStack = [...sliced, { objects: newObjs, layers: activeLayers }];
        // Limit max history to 50 entries
        if (nextStack.length > 50) {
          return nextStack.slice(nextStack.length - 50);
        }
        return nextStack;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
      setObjects(newObjs);
      if (newLayers) setLayers(newLayers);
    },
    [historyIndex, layers]
  );

  // UNDO / REDO Handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      const snapshot = history[prevIdx];
      if (snapshot) {
        setObjects(snapshot.objects);
        setLayers(snapshot.layers);
        setSelectedObjectIds([]);
        logMessage(`Undo executed (${prevIdx + 1}/${history.length})`, 'cmd');
      }
    }
  }, [historyIndex, history, logMessage]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const snapshot = history[nextIdx];
      if (snapshot) {
        setObjects(snapshot.objects);
        setLayers(snapshot.layers);
        setSelectedObjectIds([]);
        logMessage(`Redo executed (${nextIdx + 1}/${history.length})`, 'cmd');
      }
    }
  }, [historyIndex, history, logMessage]);

  // CAD OBJECT MANIPULATION
  const handleAddObject = useCallback(
    (newObj: CADObject) => {
      const updated = [...objects, newObj];
      commitState(updated);
    },
    [objects, commitState]
  );

  const handleBatchAddObjects = useCallback(
    (newObjs: CADObject[]) => {
      if (newObjs.length === 0) return;
      const updated = [...objects, ...newObjs];
      commitState(updated);
    },
    [objects, commitState]
  );

  const handleUpdateObject = useCallback(
    (updatedObj: CADObject) => {
      const updated = objects.map((o) => (o.id === updatedObj.id ? updatedObj : o));
      commitState(updated);
    },
    [objects, commitState]
  );

  const handleBatchUpdateObjects = useCallback(
    (updatedObjs: CADObject[]) => {
      if (updatedObjs.length === 0) return;
      const updatedMap = new Map(updatedObjs.map((o) => [o.id, o]));
      const updated = objects.map((o) => updatedMap.get(o.id) || o);
      commitState(updated);
    },
    [objects, commitState]
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedObjectIds.length === 0) return;

    // Filter out locked layer objects and hidden layer objects
    const lockedLayerIds = new Set(layers.filter((l) => l.locked).map((l) => l.id));
    const hiddenLayerIds = new Set(layers.filter((l) => !l.visible).map((l) => l.id));

    const toDelete = selectedObjectIds.filter((id) => {
      const obj = objects.find((o) => o.id === id);
      return obj && !lockedLayerIds.has(obj.layerId) && !hiddenLayerIds.has(obj.layerId);
    });

    const protectedCount = selectedObjectIds.length - toDelete.length;
    if (protectedCount > 0) {
      logMessage(`${protectedCount} selected object(s) are on locked or hidden layers and were not deleted.`, 'warn');
    }

    if (toDelete.length === 0) return;

    const updated = objects.filter((o) => !toDelete.includes(o.id));
    commitState(updated);
    logMessage(`Deleted ${toDelete.length} object(s)`, 'warn');
    setSelectedObjectIds([]);
  }, [selectedObjectIds, objects, layers, commitState, logMessage]);

  const handleSelectAll = useCallback(() => {
    // Exclude hidden layers & locked layers from Select All if needed, or select all visible non-locked
    const hiddenLayerIds = new Set(layers.filter((l) => !l.visible).map((l) => l.id));
    const selectable = objects.filter((o) => !hiddenLayerIds.has(o.layerId));
    const selectableIds = selectable.map((o) => o.id);
    setSelectedObjectIds(selectableIds);
    logMessage(`Selected all ${selectableIds.length} visible object(s)`, 'cmd');
  }, [objects, layers, logMessage]);

  const handleClearAll = useCallback(() => {
    if (confirm('Clear entire drawing workspace?')) {
      commitState([]);
      setSelectedObjectIds([]);
      logMessage('Cleared workspace', 'warn');
    }
  }, [commitState, logMessage]);

  const handleZoomExtents = useCallback(() => {
    if (objects.length === 0) {
      setTransform({ panX: 0, panY: 0, zoom: 1.0 });
      return;
    }
    // Zoom extents logic
    setTransform({ panX: 0, panY: 0, zoom: 1.0 });
    logMessage('Zoom Extents applied', 'info');
  }, [objects, logMessage]);

  // FILE IMPORT / EXPORT HANDLERS
  const handleNew = () => {
    if (confirm('Create new empty drawing? Unsaved changes will be cleared.')) {
      setObjects([]);
      setHistory([{ objects: [], layers }]);
      setHistoryIndex(0);
      setSelectedObjectIds([]);
      logMessage('New drawing created', 'info');
    }
  };

  const handleSaveJSON = () => {
    const jsonStr = exportToJSON(objects, layers, transform);
    downloadFile(jsonStr, 'drawing.json', 'application/json');
    logMessage('Saved CAD project to JSON file', 'success');
  };

  const handleOpenJSONClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleJSONFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.objects && Array.isArray(data.objects)) {
          setObjects(data.objects);
          if (data.layers) setLayers(data.layers);
          if (data.transform) setTransform(data.transform);
          setHistory([data.objects]);
          setHistoryIndex(0);
          setSelectedObjectIds([]);
          logMessage(`Opened drawing file: ${file.name}`, 'success');
        }
      } catch (err) {
        logMessage('Failed to parse JSON file', 'warn');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportSVG = () => {
    const svgStr = exportToSVG(objects, layers);
    downloadFile(svgStr, 'drawing.svg', 'image/svg+xml');
    logMessage('Exported vector SVG file', 'success');
  };

  const handleExportDXF = () => {
    const dxfStr = exportToDXF(objects);
    downloadFile(dxfStr, 'drawing.dxf', 'text/plain');
    logMessage('Exported AutoCAD DXF file', 'success');
  };

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      exportToPNG(canvas, 'drawing.png');
      logMessage('Exported PNG image file', 'success');
    }
  };

  const handleExportHTML = () => {
    const htmlContent = exportToStandaloneHTML(objects, layers);
    downloadFile(htmlContent, 'evl-mini-cad-standalone.html', 'text/html');
    logMessage('Exported Standalone Offline HTML CAD File', 'success');
  };

  const handlePublishToBim = () => {
    const bimObjects = fromMiniCadObjects(objects, layers);
    publishToBim({
      sourceTool: 'minicad',
      toolLabel: 'EVLab Mini CAD',
      objects: bimObjects,
      meta: { totalObjects: objects.length, published3DObjects: bimObjects.length },
    });
    logMessage(`Published ${bimObjects.length} object(s) to EVLab BIM`, 'success');
  };

  const handleLoadSample = (sample: SampleDrawing) => {
    setObjects(sample.objects);
    setLayers(sample.layers);
    setHistory([{ objects: sample.objects, layers: sample.layers }]);
    setHistoryIndex(0);
    setSelectedObjectIds([]);
    setTransform({ panX: 0, panY: 0, zoom: 1.2 });
    logMessage(`Loaded sample: ${sample.name}`, 'success');
  };

  // COMMAND CONSOLE EXECUTOR
  const handleExecuteCommand = (cmdText: string) => {
    logMessage(`> ${cmdText}`, 'cmd');
    const lower = cmdText.toLowerCase().trim();

    if (lower === 'line' || lower === 'l') setActiveTool('line');
    else if (lower === 'circle' || lower === 'c') setActiveTool('circle');
    else if (lower === 'rect' || lower === 'r') setActiveTool('rectangle');
    else if (lower === 'poly' || lower === 'p') setActiveTool('polyline');
    else if (lower === 'dim' || lower === 'd') setActiveTool('dimension');
    else if (lower === 'select' || lower === 's') setActiveTool('select');
    else if (lower === 'pan' || lower === 'h') setActiveTool('pan');
    else if (lower === 'erase' || lower === 'e') {
      if (selectedObjectIds.length > 0) {
        handleDeleteSelected();
      } else {
        setActiveTool('erase');
      }
    } else if (lower === 'move' || lower === 'm') setActiveTool('move');
    else if (lower === 'copy' || lower === 'co') setActiveTool('copy');
    else if (lower === 'rotate' || lower === 'ro') setActiveTool('rotate');
    else if (lower === 'mirror' || lower === 'mi') setActiveTool('mirror');
    else if (lower === 'scale' || lower === 'sc') setActiveTool('scale');
    else if (lower === 'trim' || lower === 'tr') setActiveTool('trim');
    else if (lower === 'extend' || lower === 'ex') setActiveTool('extend');
    else if (lower === 'offset' || lower === 'o') setActiveTool('offset');
    else if (lower === 'fillet' || lower === 'f') setActiveTool('fillet');
    else if (lower === 'chamfer' || lower === 'cha') setActiveTool('chamfer');
    else if (lower === 'break' || lower === 'br') setActiveTool('break');
    else if (lower === 'join' || lower === 'j') setActiveTool('join');
    else if (lower === 'explode' || lower === 'x') setActiveTool('explode');
    else if (lower === 'clear') handleClearAll();
    else if (lower === 'zoom' || lower === 'z') handleZoomExtents();
    else if (lower === 'grid') setGridEnabled((g) => !g);
    else if (lower === 'snap') setSnapEnabled((s) => !s);
    else if (lower === 'ortho') setOrthoEnabled((o) => !o);
    else if (lower === 'help') setShortcutsOpen(true);
    else logMessage(`Unknown command: "${cmdText}". Type "help" for key shortcuts.`, 'warn');
  };

  // LAYER MANAGEMENT
  const handleAddLayer = (name: string, color: string) => {
    const newLayer: Layer = {
      id: 'layer_' + Date.now(),
      name,
      color,
      visible: true,
      locked: false,
      lineWeight: 1.5,
      lineType: 'solid',
    };
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    logMessage(`Created layer: ${name}`, 'success');
  };

  const handleToggleLayerVisibility = (layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleToggleLayerLock = (layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l))
    );
  };

  const handleDeleteLayer = (layerId: string) => {
    if (layers.length <= 1) return;
    setLayers((prev) => prev.filter((l) => l.id !== layerId));
    if (activeLayerId === layerId) {
      setActiveLayerId(layers[0].id);
    }
  };

  // GLOBAL KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key shortcuts if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          handleSelectAll();
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          handleSaveJSON();
        } else if (e.key === 'o' || e.key === 'O') {
          e.preventDefault();
          handleOpenJSONClick();
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleNew();
        }
        return;
      }

      // Function key shortcuts
      if (e.key === 'F3') {
        e.preventDefault();
        setSnapEnabled((s) => !s);
      } else if (e.key === 'F7') {
        e.preventDefault();
        setGridEnabled((g) => !g);
      } else if (e.key === 'F8') {
        e.preventDefault();
        setOrthoEnabled((o) => !o);
      }

      // Single character tool keys
      const k = e.key.toLowerCase();
      if (k === 'l') setActiveTool('line');
      else if (k === 'p') setActiveTool('polyline');
      else if (k === 'r') setActiveTool('rectangle');
      else if (k === 'c') setActiveTool('circle');
      else if (k === 'a') setActiveTool('arc');
      else if (k === 't') setActiveTool('text');
      else if (k === 'd') setActiveTool('dimension');
      else if (k === 's') setActiveTool('select');
      else if (k === 'h') setActiveTool('pan');
      else if (k === 'm') setActiveTool('move');
      else if (k === 'e') {
        if (selectedObjectIds.length > 0) {
          handleDeleteSelected();
        } else {
          setActiveTool('erase');
        }
      }
      else if (e.key === 'Delete' || e.key === 'Backspace') handleDeleteSelected();
      else if (e.key === 'Escape') {
        setSelectedObjectIds([]);
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSelectAll, handleDeleteSelected]);

  const selectedObjects = objects.filter((o) => selectedObjectIds.includes(o.id));

  return (
    <div className="w-screen h-screen flex flex-col bg-[#121417] text-white font-sans overflow-hidden select-none">
      {/* Hidden File Input for JSON Load */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleJSONFileChange}
      />

      {/* Top Menu Bar */}
      <TopMenuBar
        onNew={handleNew}
        onOpenJSON={handleOpenJSONClick}
        onSaveJSON={handleSaveJSON}
        onExportSVG={handleExportSVG}
        onExportDXF={handleExportDXF}
        onExportPNG={handleExportPNG}
        onExportHTML={handleExportHTML}
        onLoadSample={handleLoadSample}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onDeleteSelected={handleDeleteSelected}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        onZoomExtents={handleZoomExtents}
        onResetView={() => setTransform({ panX: 0, panY: 0, zoom: 1.0 })}
        gridEnabled={gridEnabled}
        onToggleGrid={() => setGridEnabled((g) => !g)}
        snapEnabled={snapEnabled}
        onToggleSnap={() => setSnapEnabled((s) => !s)}
        orthoEnabled={orthoEnabled}
        onToggleOrtho={() => setOrthoEnabled((o) => !o)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onPublishToBim={handlePublishToBim}
      />

      {/* Main CAD Action Toolbar */}
      <Toolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        viewMode={viewMode}
        onSelectViewMode={(mode) => {
          setViewMode(mode);
          logMessage(`Switched CAD viewport to ${mode.toUpperCase()} mode`, 'info');
        }}
        onNew={handleNew}
        onOpenJSON={handleOpenJSONClick}
        onSaveJSON={handleSaveJSON}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onDeleteSelected={handleDeleteSelected}
        hasSelection={selectedObjectIds.length > 0}
        onZoomExtents={handleZoomExtents}
        layers={layers}
        activeLayerId={activeLayerId}
        onSelectLayer={setActiveLayerId}
        activeColor={activeColor}
        onChangeColor={setActiveColor}
        activeLineWeight={activeLineWeight}
        onChangeLineWeight={setActiveLineWeight}
      />

      {/* Middle Layout: Left Tool Panel, Main Canvas, Right Properties Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        <LeftToolPanel activeTool={activeTool} onSelectTool={setActiveTool} viewMode={viewMode} />

        {viewMode === '3d' ? (
          <Canvas3D
            objects={objects}
            layers={layers}
            activeTool={activeTool}
            activeLayerId={activeLayerId}
            activeColor={activeColor}
            selectedObjectIds={selectedObjectIds}
            onSelectObjects={setSelectedObjectIds}
            onAddObject={handleAddObject}
            onUpdateObject={handleUpdateObject}
            logMessage={logMessage}
            setStatusInstruction={setStatusInstruction}
          />
        ) : (
          <Canvas2D
            objects={objects}
            layers={layers}
            transform={transform}
            onTransformChange={setTransform}
            activeTool={activeTool}
            activeLayerId={activeLayerId}
            activeColor={activeColor}
            activeLineWeight={activeLineWeight}
            snapSettings={snapSettings}
            snapEnabled={snapEnabled}
            gridEnabled={gridEnabled}
            orthoEnabled={orthoEnabled}
            onAddObject={handleAddObject}
            onBatchAddObjects={handleBatchAddObjects}
            onUpdateObject={handleUpdateObject}
            onBatchUpdateObjects={handleBatchUpdateObjects}
            selectedObjectIds={selectedObjectIds}
            onSelectObjects={setSelectedObjectIds}
            onCursorMove={setCursorWorld}
            setStatusInstruction={setStatusInstruction}
            logMessage={logMessage}
          />
        )}

        <PropertiesPanel
          selectedObjects={selectedObjects}
          onUpdateObject={handleUpdateObject}
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={setActiveLayerId}
          onAddLayer={handleAddLayer}
          onToggleLayerVisibility={handleToggleLayerVisibility}
          onToggleLayerLock={handleToggleLayerLock}
          onDeleteLayer={handleDeleteLayer}
          commandLogs={commandLogs}
          onExecuteCommand={handleExecuteCommand}
        />
      </div>

      {/* Bottom CAD Status Bar */}
      <StatusBar
        cursorWorld={cursorWorld}
        zoomPercent={transform.zoom * 100}
        activeTool={activeTool}
        gridEnabled={gridEnabled}
        onToggleGrid={() => setGridEnabled((g) => !g)}
        snapEnabled={snapEnabled}
        onToggleSnap={() => setSnapEnabled((s) => !s)}
        orthoEnabled={orthoEnabled}
        onToggleOrtho={() => setOrthoEnabled((o) => !o)}
        objectCount={objects.length}
        statusInstruction={statusInstruction}
      />

      {/* Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
