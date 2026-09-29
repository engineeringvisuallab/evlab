/**
 * EVLab WaterFlow - Interactive 2D Engineering Canvas
 * Professional HTML5 Canvas & SVG drawing workspace with pan, zoom, snapping, thematic rendering, flow arrows.
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import {
  NetworkNode,
  NetworkLink,
  Junction,
  Reservoir,
  Tank,
  Pipe,
  Pump,
  Valve,
  ResultTheme
} from '../../types/waterflow';
import { UnitConverter } from '../../core/units/unitConverter';

export const Canvas2D: React.FC = () => {
  const {
    model,
    activeTool,
    setActiveTool,
    selectedIds,
    selectElement,
    clearSelection,
    resultTheme,
    gridSnap,
    nodeSnap,
    orthoMode,
    drawingStartNodeId,
    setDrawingStartNodeId,
    addElement,
    updateElement,
    settings,
    profileNodeIds,
    toggleProfileNode
  } = useWaterFlow();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pan and Zoom Transformation State
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse cursor canvas coordinates
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Extract Nodes and Links arrays
  const nodes = useMemo(() => {
    return model.nodes instanceof Map ? Array.from(model.nodes.values()) : Object.values(model.nodes);
  }, [model.nodes]);

  const links = useMemo(() => {
    return model.links instanceof Map ? Array.from(model.links.values()) : Object.values(model.links);
  }, [model.links]);

  const nodesMap = useMemo(() => {
    const map = new Map<string, NetworkNode>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Screen to Canvas coordinate conversion
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const relX = screenX - rect.left;
    const relY = screenY - rect.top;

    let canvasX = (relX - pan.x) / zoom;
    let canvasY = (relY - pan.y) / zoom;

    // Apply Snapping if enabled
    if (gridSnap) {
      const gridSize = 20;
      canvasX = Math.round(canvasX / gridSize) * gridSize;
      canvasY = Math.round(canvasY / gridSize) * gridSize;
    }

    return { x: canvasX, y: canvasY };
  }, [pan, zoom, gridSnap]);

  // Find nearest node within snap radius
  const findSnapNode = useCallback((x: number, y: number, radius = 25) => {
    if (!nodeSnap) return null;
    let closest: NetworkNode | null = null;
    let minDist = radius / zoom;

    for (const node of nodes) {
      const dist = Math.hypot(node.x - x, node.y - y);
      if (dist < minDist) {
        minDist = dist;
        closest = node;
      }
    }
    return closest;
  }, [nodes, nodeSnap, zoom]);

  // Handle Canvas Zoom (Wheel)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(Math.max(0.15, zoom * zoomFactor), 8.0);

    // Zoom towards mouse pointer
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setPan(prev => ({
        x: mouseX - (mouseX - prev.x) * (newZoom / zoom),
        y: mouseY - (mouseY - prev.y) * (newZoom / zoom)
      }));
    }

    setZoom(newZoom);
  };

  // Mouse Down Event
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    const snapNode = findSnapNode(x, y);

    // Pan with Middle Click or Hand tool
    if (e.button === 1 || activeTool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return; // Left click only

    // 1. SELECT Tool Mode
    if (activeTool === 'select') {
      // Check if clicked a node
      if (snapNode) {
        selectElement(snapNode.id, e.shiftKey || e.ctrlKey);
        setDraggingNodeId(snapNode.id);
        return;
      }

      // Check if clicked a link
      let clickedLinkId: string | null = null;
      for (const link of links) {
        const start = nodesMap.get(link.startNodeId);
        const end = nodesMap.get(link.endNodeId);
        if (!start || !end) continue;

        // Point to line segment distance
        const dist = pointToSegmentDistance(x, y, start.x, start.y, end.x, end.y);
        if (dist < 10 / zoom) {
          clickedLinkId = link.id;
          break;
        }
      }

      if (clickedLinkId) {
        selectElement(clickedLinkId, e.shiftKey || e.ctrlKey);
      } else if (!e.shiftKey && !e.ctrlKey) {
        clearSelection();
      }
    }

    // 2. JUNCTION / RESERVOIR / TANK Creation
    else if (['junction', 'reservoir', 'tank'].includes(activeTool)) {
      const idPrefix = activeTool === 'junction' ? 'J' : activeTool === 'reservoir' ? 'R' : 'TANK';
      const count = nodes.filter(n => n.type === activeTool).length + 1;
      const newId = `${idPrefix}-${count < 10 ? '0' + count : count}`;

      let newNode: NetworkNode;

      if (activeTool === 'junction') {
        newNode = {
          id: newId,
          label: `Junction ${newId}`,
          type: 'junction',
          x,
          y,
          elevation: 50,
          baseDemand: 10.0,
          demandPatternId: 'pat-residential'
        } as Junction;
      } else if (activeTool === 'reservoir') {
        newNode = {
          id: newId,
          label: `Reservoir ${newId}`,
          type: 'reservoir',
          x,
          y,
          elevation: 80,
          totalHead: 110
        } as Reservoir;
      } else {
        newNode = {
          id: newId,
          label: `Tank ${newId}`,
          type: 'tank',
          x,
          y,
          elevation: 70,
          minLevel: 1.0,
          initLevel: 5.0,
          maxLevel: 10.0,
          diameter: 12.0
        } as Tank;
      }

      addElement(newNode);
      selectElement(newId);
    }

    // 3. PIPE / PUMP / VALVE Link Creation
    else if (['pipe', 'pump', 'valve'].includes(activeTool)) {
      if (!drawingStartNodeId) {
        // Step 1: Select start node
        if (snapNode) {
          setDrawingStartNodeId(snapNode.id);
        } else {
          // Create junction at click location to serve as start node
          const count = nodes.length + 1;
          const newJuncId = `J-${count < 10 ? '0' + count : count}`;
          const newJunc: Junction = {
            id: newJuncId,
            label: `Junction ${newJuncId}`,
            type: 'junction',
            x,
            y,
            elevation: 50,
            baseDemand: 10.0
          };
          addElement(newJunc);
          setDrawingStartNodeId(newJuncId);
        }
      } else {
        // Step 2: Complete link at end node
        let endNodeId = snapNode?.id;

        let createdEndNode: Junction | null = null;

        if (!endNodeId) {
          // Create new node at endpoint
          const count = nodes.length + 1;
          endNodeId = `J-${count < 10 ? '0' + count : count}`;
          createdEndNode = {
            id: endNodeId,
            label: `Junction ${endNodeId}`,
            type: 'junction',
            x,
            y,
            elevation: 50,
            baseDemand: 10.0
          };
          addElement(createdEndNode);
        }

        if (endNodeId !== drawingStartNodeId) {
          const linkCount = links.length + 1;
          const prefix = activeTool === 'pipe' ? 'P' : activeTool === 'pump' ? 'PUMP' : 'VALVE';
          const linkId = `${prefix}-${linkCount < 10 ? '0' + linkCount : linkCount}`;

          const startNode = nodesMap.get(drawingStartNodeId);
          const endNode = nodesMap.get(endNodeId) || createdEndNode;

          const startX = startNode?.x ?? x;
          const startY = startNode?.y ?? y;
          const endX = endNode?.x ?? x;
          const endY = endNode?.y ?? y;

          const calcLength = Math.round(Math.hypot(endX - startX, endY - startY));

          let newLink: NetworkLink;

          if (activeTool === 'pipe') {
            newLink = {
              id: linkId,
              label: `Pipe ${linkId}`,
              type: 'pipe',
              startNodeId: drawingStartNodeId,
              endNodeId,
              length: Math.max(10, calcLength),
              diameter: 200,
              material: 'Ductile Iron',
              roughness: 130,
              minorLoss: 0,
              status: 'OPEN'
            } as Pipe;
          } else if (activeTool === 'pump') {
            newLink = {
              id: linkId,
              label: `Pump ${linkId}`,
              type: 'pump',
              startNodeId: drawingStartNodeId,
              endNodeId,
              curveType: 'DESIGN_POINT',
              designFlow: 60,
              designHead: 40,
              speed: 100,
              status: 'ON',
              efficiency: 75
            } as Pump;
          } else {
            newLink = {
              id: linkId,
              label: `Valve ${linkId}`,
              type: 'valve',
              startNodeId: drawingStartNodeId,
              endNodeId,
              valveType: 'PRV',
              setting: 300,
              status: 'ACTIVE',
              minorLoss: 1.0
            } as Valve;
          }

          addElement(newLink);
          selectElement(linkId);
          setDrawingStartNodeId(null); // Finish drawing
        }
      }
    }
  };

  // Mouse Move Event
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    setMouseCanvasPos({ x, y });

    // Drag Node
    if (draggingNodeId) {
      updateElement(draggingNodeId, { x, y });
      return;
    }

    // Hover detection
    const snapNode = findSnapNode(x, y);
    if (snapNode) {
      setHoveredElementId(snapNode.id);
      return;
    }

    let hoverLink: string | null = null;
    for (const link of links) {
      const start = nodesMap.get(link.startNodeId);
      const end = nodesMap.get(link.endNodeId);
      if (!start || !end) continue;

      const dist = pointToSegmentDistance(x, y, start.x, start.y, end.x, end.y);
      if (dist < 10 / zoom) {
        hoverLink = link.id;
        break;
      }
    }
    setHoveredElementId(hoverLink);
  };

  // Mouse Up Event
  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Helper: Point to segment distance
  function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  // Draw 2D Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    canvas.width = width;
    canvas.height = height;

    // Clear Canvas
    ctx.fillStyle = '#0f172a'; // Deep dark workspace
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. Draw Grid Lines
    const gridSize = 40;
    const startX = Math.floor((-pan.x / zoom) / gridSize) * gridSize;
    const endX = startX + (width / zoom) + gridSize;
    const startY = Math.floor((-pan.y / zoom) / gridSize) * gridSize;
    const endY = startY + (height / zoom) + gridSize;

    ctx.lineWidth = 0.5 / zoom;
    ctx.strokeStyle = '#1e293b';

    for (let gx = startX; gx <= endX; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, startY);
      ctx.lineTo(gx, endY);
      ctx.stroke();
    }
    for (let gy = startY; gy <= endY; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, gy);
      ctx.lineTo(endX, gy);
      ctx.stroke();
    }

    // 2. Render LINKS (Pipes, Pumps, Valves)
    links.forEach(link => {
      const start = nodesMap.get(link.startNodeId);
      const end = nodesMap.get(link.endNodeId);
      if (!start || !end) return;

      const isSelected = selectedIds.includes(link.id);
      const isHovered = hoveredElementId === link.id;

      // Color Theme determination for Links
      let strokeColor = '#3b82f6'; // Default Blue
      let lineWidth = 3 / zoom;

      if (link.type === 'pipe') {
        const pipe = link as Pipe;
        if (pipe.status === 'CLOSED') {
          strokeColor = '#64748b'; // Gray for closed
        } else if (resultTheme === 'velocity' && pipe.velocity !== undefined) {
          // Velocity mode: Blue (safe <1.5m/s) -> Green (1.5-2.5m/s) -> Red (>2.5m/s)
          strokeColor = pipe.velocity < 1.0 ? '#38bdf8' : pipe.velocity < 2.0 ? '#22c55e' : '#ef4444';
        } else if (resultTheme === 'flow' && pipe.flow !== undefined) {
          strokeColor = Math.abs(pipe.flow) > 30 ? '#06b6d4' : '#3b82f6';
        } else if (resultTheme === 'headloss' && pipe.headloss !== undefined) {
          strokeColor = pipe.headloss > 5.0 ? '#f59e0b' : '#38bdf8';
        }

        // Scale line width with pipe diameter
        lineWidth = Math.max(2, Math.min(8, pipe.diameter / 40)) / zoom;
      } else if (link.type === 'pump') {
        strokeColor = '#f59e0b'; // Amber for Pump
        lineWidth = 4 / zoom;
      } else if (link.type === 'valve') {
        strokeColor = '#a855f7'; // Purple for Valve
        lineWidth = 4 / zoom;
      }

      if (isSelected) strokeColor = '#38bdf8'; // Highlight Cyan
      if (isHovered) strokeColor = '#67e8f9';

      // Draw Link Line
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isSelected ? lineWidth + (2 / zoom) : lineWidth;
      ctx.stroke();

      // Flow direction arrow
      if (link.type === 'pipe') {
        const pipe = link as Pipe;
        if (pipe.flow !== undefined && Math.abs(pipe.flow) > 0.01) {
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          const drawAngle = pipe.flow >= 0 ? angle : angle + Math.PI;

          ctx.save();
          ctx.translate(midX, midY);
          ctx.rotate(drawAngle);
          ctx.fillStyle = strokeColor;
          ctx.beginPath();
          ctx.moveTo(6 / zoom, 0);
          ctx.lineTo(-6 / zoom, -4 / zoom);
          ctx.lineTo(-6 / zoom, 4 / zoom);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      // Link Label / Results text
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${Math.max(9, 11 / zoom)}px sans-serif`;
      ctx.textAlign = 'center';

      let labelText = link.label;
      if (link.type === 'pipe' && (link as Pipe).flow !== undefined) {
        const p = link as Pipe;
        if (resultTheme === 'velocity') labelText += ` (${p.velocity?.toFixed(2)} m/s)`;
        else if (resultTheme === 'flow') labelText += ` (${p.flow?.toFixed(1)} L/s)`;
      }
      ctx.fillText(labelText, midX, midY - 6 / zoom);
    });

    // 3. Render NODES (Junctions, Reservoirs, Tanks)
    nodes.forEach(node => {
      const isSelected = selectedIds.includes(node.id);
      const isHovered = hoveredElementId === node.id;
      const isProfilePath = profileNodeIds.includes(node.id);

      ctx.save();
      ctx.translate(node.x, node.y);

      // Node Result Color
      let nodeColor = '#38bdf8'; // Cyan
      if (node.type === 'junction') {
        const j = node as Junction;
        if (resultTheme === 'pressure' && j.pressure !== undefined) {
          // Low pressure = Red (<150kPa), Good = Green (150-400), High = Blue (>400)
          nodeColor = j.pressure < 100 ? '#ef4444' : j.pressure < 400 ? '#22c55e' : '#3b82f6';
        }
      } else if (node.type === 'reservoir') {
        nodeColor = '#06b6d4';
      } else if (node.type === 'tank') {
        nodeColor = '#10b981';
      }

      // Selection Glow
      if (isSelected || isProfilePath) {
        ctx.beginPath();
        ctx.arc(0, 0, 14 / zoom, 0, Math.PI * 2);
        ctx.fillStyle = isProfilePath ? 'rgba(234, 179, 8, 0.4)' : 'rgba(56, 189, 248, 0.4)';
        ctx.fill();
      }

      // Render Node Symbols
      if (node.type === 'junction') {
        // Circle Node
        ctx.beginPath();
        ctx.arc(0, 0, 7 / zoom, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
        ctx.lineWidth = 1.5 / zoom;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      } else if (node.type === 'reservoir') {
        // Diamond Symbol
        const r = 9 / zoom;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r, 0);
        ctx.closePath();
        ctx.fillStyle = nodeColor;
        ctx.fill();
        ctx.lineWidth = 2 / zoom;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      } else if (node.type === 'tank') {
        // Tank Cylinder / Square Symbol
        const w = 16 / zoom;
        const h = 16 / zoom;
        ctx.fillStyle = nodeColor;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
      }

      // Node Label and Pressure display
      ctx.fillStyle = '#f8fafc';
      ctx.font = `bold ${Math.max(10, 11 / zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(node.label, 0, 18 / zoom);

      if (node.type === 'junction' && (node as Junction).pressure !== undefined) {
        const p = (node as Junction).pressure!;
        const pStr = settings.unitSystem === 'US' ? `${(p * 0.145).toFixed(1)} psi` : `${p.toFixed(0)} kPa`;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = `${Math.max(9, 10 / zoom)}px sans-serif`;
        ctx.fillText(pStr, 0, 28 / zoom);
      }

      ctx.restore();
    });

    // 4. Draw Active Link Rubberband while drawing
    if (drawingStartNodeId) {
      const startNode = nodesMap.get(drawingStartNodeId);
      if (startNode) {
        ctx.beginPath();
        ctx.moveTo(startNode.x, startNode.y);
        ctx.lineTo(mouseCanvasPos.x, mouseCanvasPos.y);
        ctx.strokeStyle = '#38bdf8';
        ctx.setLineDash([5 / zoom, 5 / zoom]);
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.restore();
  }, [
    pan,
    zoom,
    nodes,
    links,
    nodesMap,
    selectedIds,
    hoveredElementId,
    drawingStartNodeId,
    mouseCanvasPos,
    resultTheme,
    settings,
    profileNodeIds
  ]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full h-full overflow-hidden select-none bg-slate-950 ${
        activeTool === 'pan' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Floating Canvas Controls Overlay */}
      <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded p-1.5 flex flex-col gap-1 shadow-xl text-slate-300 text-xs">
        <button
          onClick={() => setZoom(prev => Math.min(prev * 1.25, 8.0))}
          className="p-1 hover:bg-slate-800 rounded font-bold"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.15))}
          className="p-1 hover:bg-slate-800 rounded font-bold"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1.0);
            setPan({ x: 50, y: 50 });
          }}
          className="p-1 hover:bg-slate-800 rounded font-semibold text-[10px]"
          title="Reset Zoom Extents"
        >
          1:1
        </button>
      </div>

      {/* Active Result Theme Legend */}
      {resultTheme !== 'none' && (
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-md p-2.5 shadow-2xl text-xs text-slate-200 min-w-[170px]">
          <div className="font-bold text-[11px] uppercase tracking-wider text-cyan-400 mb-1">
            Legend: {resultTheme}
          </div>
          {resultTheme === 'pressure' && (
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Low (&lt;100 kPa)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Optimal (100-400)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> High (&gt;400 kPa)</span>
              </div>
            </div>
          )}
          {resultTheme === 'velocity' && (
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span> Low (&lt;1.0 m/s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Safe (1.0-2.0 m/s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Critical (&gt;2.0 m/s)</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
