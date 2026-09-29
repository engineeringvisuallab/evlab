/**
 * EV GIS - Limited Working Sibling Application Subset
 * Demonstrates geospatial asset modeling, spatial coordinate display,
 * and controlled integration with EV Software Core via useEVAppSDK.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Globe2,
  Layers,
  Send,
  Plus,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCode,
  ArrowRight,
  Database,
  Compass,
  ArrowDownLeft,
  Eye,
} from 'lucide-react';
import { useEVAppSDK } from '../../sdk/useEVAppSDK';
import { GISDatasetPayload, PipelineGeometryItem } from '../../types/dataset';
import { Transfer } from '../../types/transfer';

interface GISAppProps {
  embeddedInProvingBench?: boolean;
  onTransferDispatched?: (transferId: string) => void;
}

export const GISApp: React.FC<GISAppProps> = ({ embeddedInProvingBench = false, onTransferDispatched }) => {
  const { sdk, activeProject, currentUser } = useEVAppSDK('app-ev-gis', '1.0.0');

  const [gisDataset, setGisDataset] = useState<any | null>(null);
  const [elements, setElements] = useState<PipelineGeometryItem[]>([]);
  const [incomingTransfers, setIncomingTransfers] = useState<Transfer[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>('pipe-001');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isSendingTransfer, setIsSendingTransfer] = useState<boolean>(false);
  const [transferSuccessMessage, setTransferSuccessMessage] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<{ trunk: boolean; branch: boolean; junctions: boolean }>({
    trunk: true,
    branch: true,
    junctions: true,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load GIS dataset from Core
  const loadDataset = async () => {
    if (!activeProject) return;
    try {
      const datasets = await sdk.getDatasetsByProject(activeProject.projectId);
      const gisDs = datasets.find((d) => d.ownerApplicationId === 'app-ev-gis' || d.datasetType === 'gis_network');
      if (gisDs) {
        setGisDataset(gisDs);
        const revisions = await sdk.getRevisions(gisDs.datasetId);
        const latestRev = revisions[0];
        if (latestRev && 'elements' in latestRev.payload) {
          const payload = latestRev.payload as GISDatasetPayload;
          setElements(payload.elements || []);
        }
      }

      // Check incoming transfers destined for EV GIS (e.g. from CAD)
      const allTransfers = await sdk.listTransfers(activeProject.projectId);
      const incoming = allTransfers.filter(
        (t) => t.destinationApplicationId === 'app-ev-gis' && (t.state === 'sent' || t.state === 'prepared' || t.state === 'reviewed' || t.state === 'validated')
      );
      setIncomingTransfers(incoming);
    } catch (err) {
      console.error('Failed to load GIS dataset:', err);
    }
  };

  useEffect(() => {
    loadDataset();
  }, [activeProject]);

  // Subscribe to Core revision events to stay synchronized without silent mutation
  useEffect(() => {
    const unsub = sdk.subscribe('transfer:committed', (payload: any) => {
      loadDataset();
      setTransferSuccessMessage('Core revision committed. Synchronized updated dataset!');
      setTimeout(() => setTransferSuccessMessage(null), 5000);
    });
    return () => unsub();
  }, [sdk]);

  // Selected element
  const selectedElement = useMemo(() => {
    return elements.find((e) => e.id === selectedElementId) || null;
  }, [elements, selectedElementId]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Coordinate Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 40 * zoom;
    const offsetX = pan.x % gridSize;
    const offsetY = pan.y % gridSize;

    for (let x = offsetX; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw GIS elements
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    for (const el of elements) {
      const isSelected = el.id === selectedElementId;

      if (el.type === 'pipeline') {
        const isTrunk = el.diameterMm >= 600;
        if (isTrunk && !activeLayers.trunk) continue;
        if (!isTrunk && !activeLayers.branch) continue;

        ctx.beginPath();
        ctx.moveTo(el.startCoords[0], el.startCoords[1]);
        ctx.lineTo(el.endCoords[0], el.endCoords[1]);

        ctx.strokeStyle = isSelected
          ? '#38bdf8'
          : isTrunk
          ? '#2563eb'
          : '#10b981';
        ctx.lineWidth = Math.max(3, el.diameterMm / 100);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Direction Arrow & Label
        const midX = (el.startCoords[0] + el.endCoords[0]) / 2;
        const midY = (el.startCoords[1] + el.endCoords[1]) / 2;

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`DN${el.diameterMm} ${el.material}`, midX - 30, midY - 8);
      }

      // Draw start / end nodes
      ctx.beginPath();
      ctx.arc(el.startCoords[0], el.startCoords[1], isSelected ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#38bdf8' : '#64748b';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(el.endCoords[0], el.endCoords[1], isSelected ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#38bdf8' : '#64748b';
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }, [elements, selectedElementId, zoom, pan, activeLayers]);

  // Handle Send to Mini CAD
  const handleSendToCAD = async () => {
    if (!activeProject || !gisDataset) return;
    setIsSendingTransfer(true);
    try {
      const payload: GISDatasetPayload = {
        crs: {
          code: 'EPSG:3857',
          name: 'WGS 84 / Pseudo-Mercator',
          unit: 'meters',
        },
        layerName: 'Trunk_Water_Mains_Sector_4',
        elements,
        metadata: {
          totalLengthKm: elements.reduce((acc, el) => acc + (el.lengthM || 0), 0) / 1000,
          elementCount: elements.length,
          lastEditorApp: 'app-ev-gis',
        },
      };

      const transfer = await sdk.initiateTransfer({
        projectId: activeProject.projectId,
        sourceDatasetId: gisDataset.datasetId,
        destinationAppId: 'app-ev-mini-cad',
        changeSummary: `Exported ${elements.length} GIS pipeline alignment entities with EPSG:3857 coordinates for CAD road crossing review.`,
        payload,
        units: 'meters',
        crs: 'EPSG:3857',
      });

      // Advance to 'sent' state
      await sdk.updateTransferState(transfer.transferId, 'sent');

      setTransferSuccessMessage(`Transfer Package '${transfer.transferId}' dispatched to EV Mini CAD!`);
      if (onTransferDispatched) onTransferDispatched(transfer.transferId);
    } catch (err: any) {
      alert(`Transfer failed: ${err.message}`);
    } finally {
      setIsSendingTransfer(false);
    }
  };

  // Add new pipeline in GIS
  const handleAddPipeline = () => {
    const newId = `pipe-${Date.now().toString(36).slice(-4)}`;
    const lastEl = elements[elements.length - 1];
    const startX = lastEl ? lastEl.endCoords[0] : 100;
    const startY = lastEl ? lastEl.endCoords[1] : 100;

    const newPipe: PipelineGeometryItem = {
      id: newId,
      name: `Offtake Extension ${elements.length + 1}`,
      type: 'pipeline',
      diameterMm: 450,
      material: 'Ductile Iron',
      lengthM: 210.0,
      nominalPressureBar: 16,
      startCoords: [startX, startY],
      endCoords: [startX + 140, startY + 60],
      invertElevationM: 41.0,
      status: 'proposed',
    };

    setElements([...elements, newPipe]);
    setSelectedElementId(newId);
  };

  return (
    <div className={`flex flex-col h-full bg-slate-900 text-slate-100 ${embeddedInProvingBench ? '' : 'rounded-xl border border-slate-800'}`}>
      {/* Top Application Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-slate-200">EV GIS</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">v1.0.0</span>
              <span className="text-[10px] text-slate-400">EPSG:3857 Pseudo-Mercator</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Dataset: <span className="text-slate-300 font-mono">{gisDataset?.name || 'Trunk Water Mains'}</span> (Rev #{gisDataset?.currentRevisionNumber || 1})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDataset}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reload from Core"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleAddPipeline}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Segment
          </button>
          <button
            onClick={handleSendToCAD}
            disabled={isSendingTransfer || elements.length === 0}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            {isSendingTransfer ? 'Packaging...' : 'Send to EV Mini CAD'}
          </button>
        </div>
      </div>

      {/* Banner */}
      {transferSuccessMessage && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{transferSuccessMessage}</span>
          </div>
          <button onClick={() => setTransferSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200 font-mono text-[10px]">✕</button>
        </div>
      )}

      {/* Incoming CAD Update Banner */}
      {incomingTransfers.length > 0 && (
        <div className="px-4 py-2 bg-blue-950/60 border-b border-blue-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-300">
            <ArrowDownLeft className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>
              Update Request from <strong>EV Mini CAD</strong> ({incomingTransfers[0].transferId}): {incomingTransfers[0].package.changeSummary}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
            Status: {incomingTransfers[0].state.toUpperCase()}
          </span>
        </div>
      )}

      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Spatial Canvas */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col">
          <canvas
            ref={canvasRef}
            width={640}
            height={420}
            className="w-full h-full cursor-crosshair"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = (e.clientX - rect.left - pan.x) / zoom;
              const clickY = (e.clientY - rect.top - pan.y) / zoom;

              // Check hit on element
              for (const el of elements) {
                const dx = el.startCoords[0] - clickX;
                const dy = el.startCoords[1] - clickY;
                if (Math.sqrt(dx * dx + dy * dy) < 20) {
                  setSelectedElementId(el.id);
                  return;
                }
              }
            }}
          />

          {/* Canvas Controls Overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-1 text-slate-300 shadow-lg">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
              className="p-1 hover:bg-slate-800 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
              className="p-1 hover:bg-slate-800 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 40, y: 30 });
              }}
              className="p-1 hover:bg-slate-800 rounded text-[10px] font-mono"
              title="Reset View"
            >
              100%
            </button>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 shadow-lg">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.trunk}
                onChange={(e) => setActiveLayers({ ...activeLayers, trunk: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-blue-500"
              />
              <span className="text-[11px]">Trunk (≥600mm)</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={activeLayers.branch}
                onChange={(e) => setActiveLayers({ ...activeLayers, branch: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500"
              />
              <span className="text-[11px]">Branch (&lt;600mm)</span>
            </label>
          </div>
        </div>

        {/* Right Attribute Panel */}
        <div className="w-64 border-l border-slate-800 bg-slate-900/95 flex flex-col p-3 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <span className="text-xs font-semibold text-slate-200">Feature Attributes</span>
            <span className="text-[10px] font-mono text-slate-400">{elements.length} features</span>
          </div>

          {selectedElement ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Feature Name</label>
                <input
                  type="text"
                  value={selectedElement.name}
                  onChange={(e) => {
                    setElements(elements.map((el) => (el.id === selectedElement.id ? { ...el, name: e.target.value } : el)));
                  }}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Diameter (mm)</label>
                  <input
                    type="number"
                    value={selectedElement.diameterMm}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setElements(elements.map((el) => (el.id === selectedElement.id ? { ...el, diameterMm: val } : el)));
                    }}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Material</label>
                  <select
                    value={selectedElement.material}
                    onChange={(e) => {
                      const mat = e.target.value as PipelineGeometryItem['material'];
                      setElements(elements.map((el) => (el.id === selectedElement.id ? { ...el, material: mat } : el)));
                    }}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Ductile Iron">Ductile Iron</option>
                    <option value="HDPE">HDPE</option>
                    <option value="Steel">Steel</option>
                    <option value="PVC">PVC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Length (m)</label>
                  <input
                    type="number"
                    value={selectedElement.lengthM}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setElements(elements.map((el) => (el.id === selectedElement.id ? { ...el, lengthM: val } : el)));
                    }}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">PN Rating (bar)</label>
                  <input
                    type="number"
                    value={selectedElement.nominalPressureBar}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setElements(elements.map((el) => (el.id === selectedElement.id ? { ...el, nominalPressureBar: val } : el)));
                    }}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div>Start: [{selectedElement.startCoords.join(', ')}]</div>
                <div>End: [{selectedElement.endCoords.join(', ')}]</div>
                <div>Invert: {selectedElement.invertElevationM || 41.8} m</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              Select a pipeline element in the canvas to inspect attributes.
            </div>
          )}

          {/* Sibling Application Boundary Note */}
          <div className="mt-auto pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <span>EV GIS owns spatial topology. Changes are shared via Core Data Exchange without direct database mutation.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
