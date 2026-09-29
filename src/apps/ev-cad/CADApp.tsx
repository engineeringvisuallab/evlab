/**
 * EV Mini CAD - Limited Working Sibling Application Subset
 * Demonstrates 2D drafting, layer hierarchy, engineering snapping,
 * and interoperable Data Exchange with EV Software Core.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Layers,
  ArrowDownLeft,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Move,
  Maximize2,
  Grid,
  ShieldAlert,
} from 'lucide-react';
import { useEVAppSDK } from '../../sdk/useEVAppSDK';
import { CADDatasetPayload, CADEntityItem, GISDatasetPayload } from '../../types/dataset';
import { Transfer } from '../../types/transfer';

interface CADAppProps {
  embeddedInProvingBench?: boolean;
  activeTransferId?: string | null;
  onUpdateRequested?: (transferId: string) => void;
}

export const CADApp: React.FC<CADAppProps> = ({
  embeddedInProvingBench = false,
  activeTransferId,
  onUpdateRequested,
}) => {
  const { sdk, activeProject, currentUser } = useEVAppSDK('app-ev-mini-cad', '1.0.0');

  const [cadDataset, setCadDataset] = useState<any | null>(null);
  const [entities, setEntities] = useState<CADEntityItem[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [incomingTransfers, setIncomingTransfers] = useState<Transfer[]>([]);
  const [activeLayer, setActiveLayer] = useState<string>('C-PIPE-MAIN');
  const [snapGrid, setSnapGrid] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load CAD dataset & incoming transfers
  const loadCADData = async () => {
    if (!activeProject) return;
    try {
      const datasets = await sdk.getDatasetsByProject(activeProject.projectId);
      const cadDs = datasets.find((d) => d.ownerApplicationId === 'app-ev-mini-cad' || d.datasetType === 'cad_drawing');
      if (cadDs) {
        setCadDataset(cadDs);
        const revs = await sdk.getRevisions(cadDs.datasetId);
        const latest = revs[0];
        if (latest && 'entities' in latest.payload) {
          const payload = latest.payload as CADDatasetPayload;
          setEntities(payload.entities || []);
        }
      }

      // Check incoming transfers destined for EV Mini CAD
      const allTransfers = await sdk.listTransfers(activeProject.projectId);
      const forCAD = allTransfers.filter(
        (t) => t.destinationApplicationId === 'app-ev-mini-cad' && (t.state === 'sent' || t.state === 'prepared')
      );
      setIncomingTransfers(forCAD);
    } catch (err) {
      console.error('Failed to load CAD data:', err);
    }
  };

  useEffect(() => {
    loadCADData();
  }, [activeProject]);

  // Import GIS Transfer Package into CAD Drawing Canvas
  const handleImportTransfer = async (transfer: Transfer) => {
    try {
      // Advance transfer state to 'imported'
      await sdk.updateTransferState(transfer.transferId, 'imported', {
        notes: 'Imported by CAD drafter into working drafting session.',
      });

      const payload = transfer.package.payload as GISDatasetPayload;
      if (payload && payload.elements) {
        const convertedEntities: CADEntityItem[] = payload.elements.map((el) => ({
          id: `cad-${el.id}`,
          layer: el.diameterMm >= 600 ? 'C-PIPE-MAIN' : 'C-PIPE-BRANCH',
          type: 'LINE',
          points: [el.startCoords, el.endCoords],
          properties: {
            strokeColor: el.diameterMm >= 600 ? '#3b82f6' : '#10b981',
            strokeWidth: Math.max(2, Math.round(el.diameterMm / 150)),
            diameterMm: el.diameterMm,
            material: el.material,
            tag: el.name,
            nominalPressureBar: el.nominalPressureBar,
            invertElevationM: el.invertElevationM,
            sourceApp: 'app-ev-gis',
            sourceDatasetId: transfer.sourceDatasetId,
            sourceRevisionId: transfer.package.sourceRevisionId,
            sourceObjectId: el.id,
            transferId: transfer.transferId,
            originalDiameterMm: el.diameterMm,
            originalMaterial: el.material,
            originalPoints: [el.startCoords, el.endCoords],
            isModifiedInCAD: false,
          },
        }));

        setEntities(convertedEntities);
        setStatusMessage(`Successfully imported ${convertedEntities.length} GIS elements into CAD session! Lineage preserved from Revision ${transfer.package.sourceRevisionId || 'Latest'}.`);
        loadCADData();
      }
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    }
  };

  // Modify diameter / alignment in CAD
  const handleModifyDiameter = (newDiameterMm: number) => {
    if (!selectedEntityId) return;
    setEntities(
      entities.map((e) =>
        e.id === selectedEntityId
          ? {
              ...e,
              properties: {
                ...e.properties,
                diameterMm: newDiameterMm,
                strokeWidth: Math.max(2, Math.round(newDiameterMm / 150)),
                isModifiedInCAD: newDiameterMm !== e.properties.originalDiameterMm,
              },
            }
          : e
      )
    );
  };

  // Request Update back to GIS (Reverse Controlled Transfer)
  const handleRequestUpdateToGIS = async () => {
    if (!activeProject) return;
    setIsExporting(true);
    try {
      const selected = entities.find((e) => e.id === selectedEntityId);
      const targetSourceDatasetId = selected?.properties.sourceDatasetId || 'ds-gis-trunk-mains';
      const targetSourceRevisionId = selected?.properties.sourceRevisionId;

      // Convert CAD entities back to GIS payload format for proposal
      const convertedGisElements = entities.map((ent) => {
        const p1 = ent.points[0] || [0, 0];
        const p2 = ent.points[1] || [100, 100];
        // Calculate true Euclidean segment length from drafting points
        const derivedLengthM = Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 10) / 10;

        return {
          id: ent.properties.sourceObjectId || ent.id.replace('cad-', ''),
          name: ent.properties.tag || 'Aligned Trunk Pipe',
          type: 'pipeline' as const,
          diameterMm: ent.properties.diameterMm || 600,
          material: (ent.properties.material as any) || 'Ductile Iron',
          lengthM: derivedLengthM > 0 ? derivedLengthM : 100.0,
          nominalPressureBar: ent.properties.nominalPressureBar ?? 'NOT_AVAILABLE',
          startCoords: p1,
          endCoords: p2,
          invertElevationM: ent.properties.invertElevationM !== undefined ? ent.properties.invertElevationM : 'NOT_AVAILABLE',
          sourceApplication: 'app-ev-mini-cad',
          sourceDatasetId: targetSourceDatasetId,
          sourceRevisionId: targetSourceRevisionId,
          status: 'modified' as const,
        };
      });

      const totalLengthKm =
        Math.round((convertedGisElements.reduce((acc, el) => acc + (el.lengthM || 0), 0) / 1000) * 100) / 100;

      const gisPayload: GISDatasetPayload = {
        crs: { code: 'EPSG:3857', name: 'WGS 84 / Pseudo-Mercator', unit: 'meters' },
        layerName: 'Trunk_Water_Mains_Sector_4',
        elements: convertedGisElements,
        metadata: {
          totalLengthKm,
          elementCount: convertedGisElements.length,
          lastEditorApp: 'app-ev-mini-cad',
        },
      };

      const transfer = await sdk.initiateTransfer({
        projectId: activeProject.projectId,
        sourceDatasetId: targetSourceDatasetId,
        destinationAppId: 'app-ev-gis',
        changeSummary: `CAD Engineering Alignment & Diameter Optimization (DN${selected?.properties.diameterMm || 750}mm upgrade requested from CAD drafting).`,
        payload: gisPayload,
        units: 'meters',
        crs: 'EPSG:3857',
      });

      // Advance to 'sent'
      await sdk.updateTransferState(transfer.transferId, 'sent');

      setStatusMessage(`Update request package '${transfer.transferId}' dispatched to Core with Base Revision reference '${targetSourceRevisionId || 'Current'}'.`);
      if (onUpdateRequested) onUpdateRequested(transfer.transferId);
    } catch (err: any) {
      alert(`Update request failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Dark CAD drafting background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // CAD Drafting Dot/Cross Grid
    if (snapGrid) {
      ctx.fillStyle = '#1e293b';
      for (let x = 20; x < width; x += 30) {
        for (let y = 20; y < height; y += 30) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }
    }

    // Draw CAD entities
    for (const ent of entities) {
      const isSelected = ent.id === selectedEntityId;
      if (ent.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(ent.points[0][0], ent.points[0][1]);
        ctx.lineTo(ent.points[1][0], ent.points[1][1]);
        ctx.strokeStyle = isSelected ? '#38bdf8' : ent.properties.strokeColor || '#3b82f6';
        ctx.lineWidth = isSelected ? ent.properties.strokeWidth + 2 : ent.properties.strokeWidth;
        ctx.stroke();

        // Dimension text
        const midX = (ent.points[0][0] + ent.points[1][0]) / 2;
        const midY = (ent.points[0][1] + ent.points[1][1]) / 2;

        ctx.fillStyle = isSelected ? '#38bdf8' : '#cbd5e1';
        ctx.font = '10px monospace';
        ctx.fillText(`Ø${ent.properties.diameterMm || 600} [${ent.properties.tag || ''}]`, midX - 25, midY - 6);

        // Snapping vertex grips
        ctx.fillStyle = isSelected ? '#38bdf8' : '#ef4444';
        ctx.fillRect(ent.points[0][0] - 3, ent.points[0][1] - 3, 6, 6);
        ctx.fillRect(ent.points[1][0] - 3, ent.points[1][1] - 3, 6, 6);
      }
    }
  }, [entities, selectedEntityId, snapGrid]);

  const selectedEntity = entities.find((e) => e.id === selectedEntityId);

  return (
    <div className={`flex flex-col h-full bg-slate-950 text-slate-100 ${embeddedInProvingBench ? '' : 'rounded-xl border border-slate-800'}`}>
      {/* CAD Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-slate-200">EV Mini CAD</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono">v1.0.0</span>
              <span className="text-[10px] text-slate-400">Scale: 1:1000 | Precision: 0.001mm</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Drawing: <span className="text-slate-300 font-mono">{cadDataset?.name || 'DWG-WSP-0201'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSnapGrid(!snapGrid)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${snapGrid ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            title="Toggle Snap Grid"
          >
            <Grid className="w-3.5 h-3.5" /> Grid Snap
          </button>
          <button
            onClick={handleRequestUpdateToGIS}
            disabled={isExporting || entities.length === 0}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            {isExporting ? 'Packaging Update...' : 'Request Update to GIS'}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {statusMessage && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-emerald-200 font-mono text-[10px]">✕</button>
        </div>
      )}

      {/* Incoming Transfer Banner */}
      {incomingTransfers.length > 0 && (
        <div className="px-4 py-2 bg-blue-950/60 border-b border-blue-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-300">
            <ArrowDownLeft className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>
              Incoming Transfer Package Available from <strong>EV GIS</strong> ({incomingTransfers[0].transferId})
            </span>
          </div>
          <button
            onClick={() => handleImportTransfer(incomingTransfers[0])}
            className="px-2.5 py-1 text-[11px] font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow-sm transition-all"
          >
            Review & Import Package
          </button>
        </div>
      )}

      {/* Main Drafting Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* CAD Canvas */}
        <div className="flex-1 relative bg-black overflow-hidden flex flex-col">
          <canvas
            ref={canvasRef}
            width={640}
            height={420}
            className="w-full h-full cursor-crosshair"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickY = e.clientY - rect.top;

              for (const ent of entities) {
                if (ent.points.length >= 2) {
                  const x1 = ent.points[0][0];
                  const y1 = ent.points[0][1];
                  const x2 = ent.points[1][0];
                  const y2 = ent.points[1][1];

                  // Distance from point to line segment
                  const dist = Math.abs((y2 - y1) * clickX - (x2 - x1) * clickY + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
                  if (dist < 15) {
                    setSelectedEntityId(ent.id);
                    return;
                  }
                }
              }
            }}
          />

          {/* Layer Indicator Bar */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 shadow-lg">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-400">Active Layer:</span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">{activeLayer}</span>
          </div>
        </div>

        {/* CAD Properties & Modification Tool */}
        <div className="w-64 border-l border-slate-800 bg-slate-900/95 flex flex-col p-3 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <span className="text-xs font-semibold text-slate-200">Entity Properties</span>
            <span className="text-[10px] font-mono text-slate-400">{entities.length} CAD entities</span>
          </div>

          {selectedEntity ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Entity Tag</label>
                <div className="px-2 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-slate-200 text-[11px]">
                  {selectedEntity.properties.tag || selectedEntity.id}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Drafting Layer</label>
                <select
                  value={selectedEntity.layer}
                  onChange={(e) => {
                    setEntities(entities.map(ent => ent.id === selectedEntity.id ? { ...ent, layer: e.target.value } : ent));
                  }}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200"
                >
                  <option value="C-PIPE-MAIN">C-PIPE-MAIN (Trunk Feeder)</option>
                  <option value="C-PIPE-BRANCH">C-PIPE-BRANCH (Distribution)</option>
                  <option value="C-VALV-CHMB">C-VALV-CHMB (Valve Chamber)</option>
                </select>
              </div>

              {/* Engineering Modification Tool */}
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-300">Pipe Diameter (mm)</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">DN{selectedEntity.properties.diameterMm || 600}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Modify nominal bore diameter in CAD drawing to test Core conflict comparison and update request.
                </p>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[600, 750, 900].map((dia) => (
                    <button
                      key={dia}
                      onClick={() => handleModifyDiameter(dia)}
                      className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                        selectedEntity.properties.diameterMm === dia
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      DN{dia}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div>Material: {selectedEntity.properties.material || 'Ductile Iron'}</div>
                <div>Grip 1: [{selectedEntity.points[0]?.join(', ')}]</div>
                <div>Grip 2: [{selectedEntity.points[1]?.join(', ')}]</div>
              </div>

              {/* Source Lineage Metadata */}
              {selectedEntity.properties.sourceApp && (
                <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/60 text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-blue-300 font-semibold">
                    <span>Source Lineage</span>
                    <span className="font-mono">{selectedEntity.properties.sourceApp}</span>
                  </div>
                  <div className="text-slate-400">Dataset: <span className="text-slate-200 font-mono">{selectedEntity.properties.sourceDatasetId}</span></div>
                  <div className="text-slate-400">Base Rev: <span className="text-slate-200 font-mono">{selectedEntity.properties.sourceRevisionId || 'rev-001'}</span></div>
                  <div className="text-slate-400">Original Ø: <span className="text-slate-200 font-mono">{selectedEntity.properties.originalDiameterMm || selectedEntity.properties.diameterMm}mm</span></div>
                  {selectedEntity.properties.isModifiedInCAD && (
                    <div className="text-amber-400 font-semibold mt-1">Status: Modified in CAD (Pending Update Request)</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              Click a pipeline entity in the CAD canvas to modify dimensions or properties.
            </div>
          )}

          {/* Sibling Boundary Note */}
          <div className="mt-auto pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-start gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>EV Mini CAD maintains independent drafting geometry. Changes require explicit Core validation & review before commit.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
