import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  CADObject,
  Layer,
  TransformState,
  ToolType,
  SnapSettings,
  SnapPoint,
  Point2D,
  LineObject,
  RectangleObject,
  CircleObject,
  ArcObject,
  PolylineObject,
  TextObject,
  DimensionObject,
  Box3DObject,
  Cylinder3DObject,
  Sphere3DObject,
  Cone3DObject,
  ActiveGrip,
  GripPoint,
} from '../types/cad';
import {
  screenToWorld,
  worldToScreen,
  findSnapPoint,
  hitTestObject,
  distance,
  midpoint,
  angleBetweenDeg,
  applyOrtho,
  isObjectInsideWindow,
  isObjectCrossingWindow,
  getGripPoints,
  translateObject,
  rotateObject,
  mirrorObject,
  scaleObject,
  getObjectIntersections,
  isAngleInArc,
  filletLines,
  chamferLines,
  explodeObject,
  joinObjects,
} from '../utils/cadMath';

// Helper function to draw CAD objects in 2D canvas
function drawCADObjectHelper(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  toScreen: (p: Point2D) => Point2D,
  zoom: number,
  overrideStyle?: { strokeStyle?: string; setLineDash?: number[]; globalAlpha?: number }
) {
  ctx.save();
  if (overrideStyle) {
    if (overrideStyle.strokeStyle) ctx.strokeStyle = overrideStyle.strokeStyle;
    if (overrideStyle.setLineDash) ctx.setLineDash(overrideStyle.setLineDash);
    if (overrideStyle.globalAlpha !== undefined) ctx.globalAlpha = overrideStyle.globalAlpha;
  }

  if (obj.type === 'line') {
    const l = obj as LineObject;
    const p1 = toScreen({ x: l.startX, y: l.startY });
    const p2 = toScreen({ x: l.endX, y: l.endY });
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  } else if (obj.type === 'rectangle') {
    const r = obj as RectangleObject;
    const p1 = toScreen({ x: r.x, y: r.y });
    const p2 = toScreen({ x: r.x + r.width, y: r.y + r.height });
    const x = Math.min(p1.x, p2.x);
    const y = Math.min(p1.y, p2.y);
    const w = Math.abs(p1.x - p2.x);
    const h = Math.abs(p1.y - p2.y);
    ctx.strokeRect(x, y, w, h);
  } else if (obj.type === 'circle') {
    const c = obj as CircleObject;
    const centerScr = toScreen({ x: c.centerX, y: c.centerY });
    const rScr = c.radius * zoom;
    ctx.beginPath();
    ctx.arc(centerScr.x, centerScr.y, rScr, 0, Math.PI * 2);
    ctx.stroke();
  } else if (obj.type === 'arc') {
    const arc = obj as ArcObject;
    const centerScr = toScreen({ x: arc.centerX, y: arc.centerY });
    const rScr = arc.radius * zoom;
    ctx.beginPath();
    ctx.arc(centerScr.x, centerScr.y, rScr, -arc.endAngle, -arc.startAngle);
    ctx.stroke();
  } else if (obj.type === 'polyline') {
    const poly = obj as PolylineObject;
    if (poly.points.length > 1) {
      ctx.beginPath();
      const startP = toScreen(poly.points[0]);
      ctx.moveTo(startP.x, startP.y);
      for (let i = 1; i < poly.points.length; i++) {
        const p = toScreen(poly.points[i]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  } else if (obj.type === 'dimension') {
    const dim = obj as DimensionObject;
    const p1 = toScreen({ x: dim.startX, y: dim.startY });
    const p2 = toScreen({ x: dim.endX, y: dim.endY });
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  } else if (obj.type === 'text') {
    const t = obj as TextObject;
    const p = toScreen({ x: t.x, y: t.y });
    ctx.font = `${(t.fontSize || 14) * zoom}px sans-serif`;
    ctx.fillText(t.text, p.x, p.y);
  } else if (obj.type === 'box_3d' || obj.type === 'cylinder_3d' || obj.type === 'sphere_3d' || obj.type === 'cone_3d') {
    const b = obj as any;
    const p = toScreen({ x: b.x, y: b.y });
    const size = 12 * zoom;
    ctx.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
  }
  ctx.restore();
}

interface Canvas2DProps {
  objects: CADObject[];
  layers: Layer[];
  transform: TransformState;
  onTransformChange: (t: TransformState) => void;
  activeTool: ToolType;
  activeLayerId: string;
  activeColor: string;
  activeLineWeight: number;
  snapSettings: SnapSettings;
  snapEnabled: boolean;
  gridEnabled: boolean;
  orthoEnabled: boolean;
  onAddObject: (obj: CADObject) => void;
  onBatchAddObjects?: (objs: CADObject[]) => void;
  onUpdateObject: (obj: CADObject) => void;
  onBatchUpdateObjects?: (objs: CADObject[]) => void;
  selectedObjectIds: string[];
  onSelectObjects: (ids: string[]) => void;
  onCursorMove: (worldPt: Point2D | null) => void;
  setStatusInstruction: (msg: string) => void;
  logMessage: (msg: string, type?: 'info' | 'success' | 'warn' | 'cmd') => void;
}

export const Canvas2D: React.FC<Canvas2DProps> = ({
  objects,
  layers,
  transform,
  onTransformChange,
  activeTool,
  activeLayerId,
  activeColor,
  activeLineWeight,
  snapSettings,
  snapEnabled,
  gridEnabled,
  orthoEnabled,
  onAddObject,
  onBatchAddObjects,
  onUpdateObject,
  onBatchUpdateObjects,
  selectedObjectIds,
  onSelectObjects,
  onCursorMove,
  setStatusInstruction,
  logMessage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interaction State
  const [drawingStart, setDrawingStart] = useState<Point2D | null>(null);
  const [polylinePoints, setPolylinePoints] = useState<Point2D[]>([]);
  const [currentCursorWorld, setCurrentCursorWorld] = useState<Point2D>({ x: 0, y: 0 });
  const [activeSnap, setActiveSnap] = useState<SnapPoint | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point2D>({ x: 0, y: 0 });

  // Window Box Selection State
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [boxSelectStart, setBoxSelectStart] = useState<Point2D | null>(null);
  const [boxSelectCurrent, setBoxSelectCurrent] = useState<Point2D | null>(null);
  const [boxSelectIsShift, setBoxSelectIsShift] = useState(false);

  // Grip handle dragging state
  const [activeGrip, setActiveGrip] = useState<ActiveGrip | null>(null);

  // Phase 1B & 1C Modify engine state
  const [modifyBasePoint, setModifyBasePoint] = useState<Point2D | null>(null);
  const [modifyAxisPoint1, setModifyAxisPoint1] = useState<Point2D | null>(null);
  const [modifyFirstObject, setModifyFirstObject] = useState<CADObject | null>(null);
  const [breakPoint1, setBreakPoint1] = useState<Point2D | null>(null);

  // Reset modify points when tool changes
  useEffect(() => {
    setModifyBasePoint(null);
    setModifyAxisPoint1(null);
    setModifyFirstObject(null);
    setBreakPoint1(null);
  }, [activeTool]);

  // Update dynamic status instructions for active tools
  useEffect(() => {
    if (activeTool === 'move') {
      if (selectedObjectIds.length === 0) {
        setStatusInstruction('MOVE: Click object(s) to select, or select objects first.');
      } else if (!modifyBasePoint) {
        setStatusInstruction('MOVE: Click Base Point');
      } else {
        setStatusInstruction('MOVE: Click Destination Point [Esc to cancel]');
      }
    } else if (activeTool === 'copy') {
      if (selectedObjectIds.length === 0) {
        setStatusInstruction('COPY: Click object(s) to select, or select objects first.');
      } else if (!modifyBasePoint) {
        setStatusInstruction('COPY: Click Base Point');
      } else {
        setStatusInstruction('COPY: Click Destination Point (Repeat or press Esc to finish)');
      }
    } else if (activeTool === 'rotate') {
      if (selectedObjectIds.length === 0) {
        setStatusInstruction('ROTATE: Click object(s) to select, or select objects first.');
      } else if (!modifyBasePoint) {
        setStatusInstruction('ROTATE: Click Base Point');
      } else {
        setStatusInstruction('ROTATE: Click Rotation Angle point [Esc to cancel]');
      }
    } else if (activeTool === 'scale') {
      if (selectedObjectIds.length === 0) {
        setStatusInstruction('SCALE: Click object(s) to select, or select objects first.');
      } else if (!modifyBasePoint) {
        setStatusInstruction('SCALE: Click Base Point');
      } else {
        setStatusInstruction('SCALE: Click point to set Scale Factor [Esc to cancel]');
      }
    } else if (activeTool === 'mirror') {
      if (selectedObjectIds.length === 0) {
        setStatusInstruction('MIRROR: Click object(s) to select, or select objects first.');
      } else if (!modifyAxisPoint1) {
        setStatusInstruction('MIRROR: Click First point of Mirror Axis');
      } else {
        setStatusInstruction('MIRROR: Click Second point of Mirror Axis [Esc to cancel]');
      }
    } else if (activeTool === 'erase') {
      if (selectedObjectIds.length > 0) {
        setStatusInstruction('ERASE: Click canvas or press Delete to erase selected objects');
      } else {
        setStatusInstruction('ERASE: Click object to erase');
      }
    } else if (activeTool === 'trim') {
      setStatusInstruction('TRIM: Click segment to trim at cutting boundary [Esc to exit]');
    } else if (activeTool === 'extend') {
      setStatusInstruction('EXTEND: Click line/arc near endpoint to extend to boundary [Esc to exit]');
    } else if (activeTool === 'offset') {
      if (!modifyFirstObject) {
        setStatusInstruction('OFFSET: Click object to offset');
      } else {
        setStatusInstruction('OFFSET: Click side to offset [Esc to cancel]');
      }
    } else if (activeTool === 'fillet') {
      if (!modifyFirstObject) {
        setStatusInstruction('FILLET: Click first line segment');
      } else {
        setStatusInstruction('FILLET: Click second line segment to apply fillet arc [Esc to cancel]');
      }
    } else if (activeTool === 'chamfer') {
      if (!modifyFirstObject) {
        setStatusInstruction('CHAMFER: Click first line segment');
      } else {
        setStatusInstruction('CHAMFER: Click second line segment to apply bevel chamfer [Esc to cancel]');
      }
    } else if (activeTool === 'break') {
      if (!breakPoint1) {
        setStatusInstruction('BREAK: Click line object at first break point');
      } else {
        setStatusInstruction('BREAK: Click second break point [Esc to cancel]');
      }
    } else if (activeTool === 'join') {
      setStatusInstruction('JOIN: Click to join selected connected lines / polylines into polyline');
    } else if (activeTool === 'explode') {
      setStatusInstruction('EXPLODE: Click rectangle or polyline to explode into individual lines');
    }
  }, [activeTool, selectedObjectIds.length, modifyBasePoint, modifyAxisPoint1, modifyFirstObject, breakPoint1, setStatusInstruction]);

  // Map layers for quick lookup
  const layerMap = new Map<string, Layer>();
  layers.forEach((l) => layerMap.set(l.id, l));

  // Handle Canvas Resizing
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  // Handle ESC key cancellation within canvas focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modifyBasePoint || modifyAxisPoint1 || modifyFirstObject || breakPoint1) {
          setModifyBasePoint(null);
          setModifyAxisPoint1(null);
          setModifyFirstObject(null);
          setBreakPoint1(null);
          logMessage('Modification operation cancelled', 'info');
        } else if (activeGrip) {
          // Restore original object state
          onUpdateObject(activeGrip.originalObject);
          setActiveGrip(null);
          logMessage('Grip drag cancelled', 'info');
        } else if (drawingStart || polylinePoints.length > 0) {
          setDrawingStart(null);
          setPolylinePoints([]);
          logMessage('Active drawing cancelled', 'info');
        } else if (isBoxSelecting) {
          setIsBoxSelecting(false);
          setBoxSelectStart(null);
          setBoxSelectCurrent(null);
          logMessage('Box selection cancelled', 'info');
        } else if (selectedObjectIds.length > 0) {
          onSelectObjects([]);
          logMessage('Selection cleared', 'info');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modifyBasePoint, modifyAxisPoint1, activeGrip, drawingStart, polylinePoints, isBoxSelecting, selectedObjectIds, onUpdateObject, onSelectObjects, logMessage]);

  // MAIN RENDERING LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background
      ctx.fillStyle = '#121417';
      ctx.fillRect(0, 0, width, height);

      const toScreen = (pt: Point2D) => worldToScreen(pt, transform, width, height);

      // 1. Grid
      if (gridEnabled) {
        ctx.save();
        ctx.strokeStyle = '#22262f';
        ctx.lineWidth = 1;

        const gridSize = snapSettings.gridSize; // e.g., 10mm
        const origin = toScreen({ x: 0, y: 0 });

        const startX = (origin.x % (gridSize * transform.zoom)) - gridSize * transform.zoom;
        const startY = (origin.y % (gridSize * transform.zoom)) - gridSize * transform.zoom;

        for (let x = startX; x < width; x += gridSize * transform.zoom) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        for (let y = startY; y < height; y += gridSize * transform.zoom) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Major Grid Lines (every 100mm)
        ctx.strokeStyle = '#2e3440';
        for (let x = (origin.x % (100 * transform.zoom)) - 100 * transform.zoom; x < width; x += 100 * transform.zoom) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = (origin.y % (100 * transform.zoom)) - 100 * transform.zoom; y < height; y += 100 * transform.zoom) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 2. Origin Axes (X: Red, Y: Green)
      const originScr = toScreen({ x: 0, y: 0 });
      ctx.save();
      ctx.lineWidth = 2;

      // X-Axis (Red)
      ctx.strokeStyle = '#e06c75';
      ctx.beginPath();
      ctx.moveTo(0, originScr.y);
      ctx.lineTo(width, originScr.y);
      ctx.stroke();

      // Y-Axis (Green)
      ctx.strokeStyle = '#98c379';
      ctx.beginPath();
      ctx.moveTo(originScr.x, 0);
      ctx.lineTo(originScr.x, height);
      ctx.stroke();

      ctx.restore();

      // Filter visible objects only
      const visibleObjects = objects.filter((o) => {
        const layer = layerMap.get(o.layerId);
        return layer ? layer.visible : true;
      });

      // 3. Render CAD Objects
      visibleObjects.forEach((obj) => {
        const isSelected = selectedObjectIds.includes(obj.id);
        const layer = layerMap.get(obj.layerId);
        const drawColor = obj.color || layer?.color || '#00ffff';
        const isLocked = layer?.locked || false;

        ctx.save();
        ctx.strokeStyle = isSelected ? '#00ffff' : drawColor;
        ctx.fillStyle = drawColor;
        ctx.lineWidth = isSelected ? (obj.lineWeight || 2) + 1.5 : obj.lineWeight || 2;
        if (isLocked) ctx.globalAlpha = 0.5;

        if (isSelected) {
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 6;
        }

        if (obj.type === 'line') {
          const line = obj as LineObject;
          const p1 = toScreen({ x: line.startX, y: line.startY });
          const p2 = toScreen({ x: line.endX, y: line.endY });

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        } else if (obj.type === 'rectangle') {
          const rect = obj as RectangleObject;
          const p1 = toScreen({ x: rect.x, y: rect.y });
          const p2 = toScreen({ x: rect.x + rect.width, y: rect.y + rect.height });

          const x = Math.min(p1.x, p2.x);
          const y = Math.min(p1.y, p2.y);
          const w = Math.abs(p1.x - p2.x);
          const h = Math.abs(p1.y - p2.y);

          ctx.strokeRect(x, y, w, h);
        } else if (obj.type === 'circle') {
          const circle = obj as CircleObject;
          const centerScr = toScreen({ x: circle.centerX, y: circle.centerY });
          const rScr = circle.radius * transform.zoom;

          ctx.beginPath();
          ctx.arc(centerScr.x, centerScr.y, rScr, 0, Math.PI * 2);
          ctx.stroke();
        } else if (obj.type === 'polyline') {
          const poly = obj as PolylineObject;
          if (poly.points.length > 1) {
            ctx.beginPath();
            const startP = toScreen(poly.points[0]);
            ctx.moveTo(startP.x, startP.y);
            for (let i = 1; i < poly.points.length; i++) {
              const p = toScreen(poly.points[i]);
              ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
          }
        } else if (obj.type === 'dimension') {
          const dim = obj as DimensionObject;
          const p1 = toScreen({ x: dim.startX, y: dim.startY });
          const p2 = toScreen({ x: dim.endX, y: dim.endY });

          ctx.save();
          ctx.strokeStyle = isSelected ? '#00ffff' : '#e5c07b';
          ctx.lineWidth = 1;

          // Dimension main line
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Arrowheads
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          const arrowSize = 6;

          const drawArrow = (pt: Point2D, a: number) => {
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x - arrowSize * Math.cos(a - Math.PI / 6), pt.y - arrowSize * Math.sin(a - Math.PI / 6));
            ctx.lineTo(pt.x - arrowSize * Math.cos(a + Math.PI / 6), pt.y - arrowSize * Math.sin(a + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fill();
          };

          drawArrow(p1, angle + Math.PI);
          drawArrow(p2, angle);

          // Dimension text
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const distVal = distance({ x: dim.startX, y: dim.startY }, { x: dim.endX, y: dim.endY });

          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#e5c07b';
          ctx.textAlign = 'center';
          ctx.fillText(`${distVal.toFixed(1)} mm`, midX, midY - 6);

          ctx.restore();
        } else if (obj.type === 'text') {
          const txt = obj as TextObject;
          const p = toScreen({ x: txt.x, y: txt.y });

          ctx.save();
          ctx.font = `${txt.fontSize * transform.zoom}px sans-serif`;
          ctx.fillStyle = isSelected ? '#00ffff' : drawColor;
          ctx.fillText(txt.text, p.x, p.y);
          ctx.restore();
        } else if (obj.type.includes('3d')) {
          // Render 2D Projection Footprint of 3D Objects
          const o3d = obj as Box3DObject;
          const p1 = toScreen({ x: o3d.x, y: o3d.y });
          const p2 = toScreen({ x: o3d.x + (o3d.width || 50), y: o3d.y + (o3d.length || 50) });

          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = isSelected ? '#00ffff' : '#61afef';
          ctx.strokeRect(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
          ctx.font = '10px monospace';
          ctx.fillStyle = '#61afef';
          ctx.fillText(`[3D ${obj.type.replace('_3d', '').toUpperCase()}]`, p1.x + 4, p1.y + 14);
          ctx.restore();
        }

        ctx.restore();
      });

      // 4. Render Grip Handles for Selected Objects
      visibleObjects.forEach((obj) => {
        if (selectedObjectIds.includes(obj.id)) {
          const grips = getGripPoints(obj);
          grips.forEach((grip) => {
            const pScr = toScreen(grip.point);
            ctx.save();

            const gripSize = 8;
            ctx.fillStyle = grip.type === 'center' ? '#00ffff' : '#00ff66';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;

            if (grip.type === 'midpoint') {
              // Draw Triangle Grip Handle for Midpoint
              ctx.beginPath();
              ctx.moveTo(pScr.x, pScr.y - gripSize);
              ctx.lineTo(pScr.x - gripSize, pScr.y + gripSize);
              ctx.lineTo(pScr.x + gripSize, pScr.y + gripSize);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            } else if (grip.type === 'center') {
              // Draw Circle Grip Handle for Center
              ctx.beginPath();
              ctx.arc(pScr.x, pScr.y, gripSize / 1.3, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            } else {
              // Draw Square Grip Handle for Endpoints / Vertices / Corners
              ctx.fillRect(pScr.x - gripSize / 2, pScr.y - gripSize / 2, gripSize, gripSize);
              ctx.strokeRect(pScr.x - gripSize / 2, pScr.y - gripSize / 2, gripSize, gripSize);
            }

            ctx.restore();
          });
        }
      });

      // 5. Active Tool Rubberband Previews
      if (drawingStart) {
        const pStart = toScreen(drawingStart);
        const pCurr = toScreen(
          orthoEnabled ? applyOrtho(drawingStart, currentCursorWorld) : currentCursorWorld
        );

        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.lineWidth = activeLineWeight;
        ctx.setLineDash([6, 6]);

        if (activeTool === 'line') {
          ctx.beginPath();
          ctx.moveTo(pStart.x, pStart.y);
          ctx.lineTo(pCurr.x, pCurr.y);
          ctx.stroke();

          // Live Distance & Angle Tooltip
          const distVal = distance(drawingStart, currentCursorWorld);
          const angleVal = angleBetweenDeg(drawingStart, currentCursorWorld);

          ctx.font = '11px monospace';
          ctx.fillStyle = '#00ffff';
          ctx.fillText(
            `Len: ${distVal.toFixed(1)}mm  Ang: ${angleVal.toFixed(1)}°`,
            (pStart.x + pCurr.x) / 2 + 10,
            (pStart.y + pCurr.y) / 2 - 10
          );
        } else if (activeTool === 'rectangle') {
          const w = pCurr.x - pStart.x;
          const h = pCurr.y - pStart.y;
          ctx.strokeRect(pStart.x, pStart.y, w, h);

          const wVal = Math.abs(currentCursorWorld.x - drawingStart.x);
          const hVal = Math.abs(currentCursorWorld.y - drawingStart.y);

          ctx.font = '11px monospace';
          ctx.fillStyle = '#00ffff';
          ctx.fillText(
            `Size: ${wVal.toFixed(1)} x ${hVal.toFixed(1)} mm`,
            pStart.x + 10,
            pStart.y - 10
          );
        } else if (activeTool === 'circle') {
          const rad = distance(drawingStart, currentCursorWorld);
          const rScr = rad * transform.zoom;

          ctx.beginPath();
          ctx.arc(pStart.x, pStart.y, rScr, 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = '11px monospace';
          ctx.fillStyle = '#00ffff';
          ctx.fillText(`R: ${rad.toFixed(1)} mm`, pStart.x + rScr + 10, pStart.y);
        } else if (activeTool === 'dimension') {
          ctx.beginPath();
          ctx.moveTo(pStart.x, pStart.y);
          ctx.lineTo(pCurr.x, pCurr.y);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Polyline continuous preview
      if (activeTool === 'polyline' && polylinePoints.length > 0) {
        ctx.save();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = activeLineWeight;

        ctx.beginPath();
        const p0 = toScreen(polylinePoints[0]);
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < polylinePoints.length; i++) {
          const p = toScreen(polylinePoints[i]);
          ctx.lineTo(p.x, p.y);
        }
        const pLast = toScreen(currentCursorWorld);
        ctx.lineTo(pLast.x, pLast.y);
        ctx.stroke();

        ctx.restore();
      }

      // 5.5. Phase 1B Real-Time Transformed Modify Ghosts
      if ((activeTool === 'move' || activeTool === 'copy') && modifyBasePoint) {
        const dx = currentCursorWorld.x - modifyBasePoint.x;
        const dy = currentCursorWorld.y - modifyBasePoint.y;
        selectedObjectIds.forEach((id) => {
          const obj = objects.find((o) => o.id === id);
          if (!obj) return;
          const tr = translateObject(obj, dx, dy);
          drawCADObjectHelper(ctx, tr, toScreen, transform.zoom, {
            strokeStyle: '#00e5ff',
            setLineDash: [4, 4],
          });
        });
        // Base point marker and displacement line
        const pBase = toScreen(modifyBasePoint);
        const pCurr = toScreen(currentCursorWorld);
        ctx.save();
        ctx.strokeStyle = '#00e5ff';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(pBase.x, pBase.y);
        ctx.lineTo(pCurr.x, pCurr.y);
        ctx.stroke();
        ctx.font = '11px monospace';
        ctx.fillStyle = '#00e5ff';
        const distVal = distance(modifyBasePoint, currentCursorWorld);
        ctx.fillText(`Dist: ${distVal.toFixed(1)} mm`, (pBase.x + pCurr.x) / 2 + 10, (pBase.y + pCurr.y) / 2 - 10);
        ctx.restore();
      } else if (activeTool === 'rotate' && modifyBasePoint) {
        const angle = angleBetweenDeg(modifyBasePoint, currentCursorWorld);
        selectedObjectIds.forEach((id) => {
          const obj = objects.find((o) => o.id === id);
          if (!obj) return;
          const tr = rotateObject(obj, modifyBasePoint, angle);
          drawCADObjectHelper(ctx, tr, toScreen, transform.zoom, {
            strokeStyle: '#00e5ff',
            setLineDash: [4, 4],
          });
        });
        const pBase = toScreen(modifyBasePoint);
        const pCurr = toScreen(currentCursorWorld);
        ctx.save();
        ctx.strokeStyle = '#ffc107';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(pBase.x, pBase.y);
        ctx.lineTo(pCurr.x, pCurr.y);
        ctx.stroke();
        ctx.font = '11px monospace';
        ctx.fillStyle = '#ffc107';
        ctx.fillText(`Angle: ${angle.toFixed(1)}°`, (pBase.x + pCurr.x) / 2 + 10, (pBase.y + pCurr.y) / 2 - 10);
        ctx.restore();
      } else if (activeTool === 'scale' && modifyBasePoint) {
        const distVal = distance(modifyBasePoint, currentCursorWorld);
        const s = Math.max(0.01, distVal / 20);
        selectedObjectIds.forEach((id) => {
          const obj = objects.find((o) => o.id === id);
          if (!obj) return;
          const tr = scaleObject(obj, modifyBasePoint, s);
          drawCADObjectHelper(ctx, tr, toScreen, transform.zoom, {
            strokeStyle: '#00e5ff',
            setLineDash: [4, 4],
          });
        });
        const pBase = toScreen(modifyBasePoint);
        const pCurr = toScreen(currentCursorWorld);
        ctx.save();
        ctx.strokeStyle = '#ffc107';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(pBase.x, pBase.y);
        ctx.lineTo(pCurr.x, pCurr.y);
        ctx.stroke();
        ctx.font = '11px monospace';
        ctx.fillStyle = '#ffc107';
        ctx.fillText(`Scale: ${s.toFixed(2)}x`, (pBase.x + pCurr.x) / 2 + 10, (pBase.y + pCurr.y) / 2 - 10);
        ctx.restore();
      } else if (activeTool === 'mirror' && modifyAxisPoint1) {
        selectedObjectIds.forEach((id) => {
          const obj = objects.find((o) => o.id === id);
          if (!obj) return;
          const tr = mirrorObject(obj, modifyAxisPoint1, currentCursorWorld);
          drawCADObjectHelper(ctx, tr, toScreen, transform.zoom, {
            strokeStyle: '#00e5ff',
            setLineDash: [4, 4],
          });
        });
        const pAxis1 = toScreen(modifyAxisPoint1);
        const pAxis2 = toScreen(currentCursorWorld);
        ctx.save();
        ctx.strokeStyle = '#ff3366';
        ctx.setLineDash([6, 3]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pAxis1.x, pAxis1.y);
        ctx.lineTo(pAxis2.x, pAxis2.y);
        ctx.stroke();
        ctx.font = '11px monospace';
        ctx.fillStyle = '#ff3366';
        ctx.fillText('MIRROR AXIS', (pAxis1.x + pAxis2.x) / 2 + 10, (pAxis1.y + pAxis2.y) / 2 - 10);
        ctx.restore();
      }

      // 6. Window Selection Box (Blue = Window L->R, Green = Crossing R->L)
      if (isBoxSelecting && boxSelectStart && boxSelectCurrent) {
        const p1 = toScreen(boxSelectStart);
        const p2 = toScreen(boxSelectCurrent);

        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const w = Math.abs(p1.x - p2.x);
        const h = Math.abs(p1.y - p2.y);

        const isWindowSelection = boxSelectCurrent.x >= boxSelectStart.x; // Left to Right

        ctx.save();
        if (isWindowSelection) {
          // Window Selection (Blue)
          ctx.fillStyle = 'rgba(0, 120, 212, 0.2)';
          ctx.strokeStyle = '#0078d4';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        } else {
          // Crossing Selection (Green)
          ctx.fillStyle = 'rgba(0, 204, 102, 0.2)';
          ctx.strokeStyle = '#00cc66';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
        }

        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);

        ctx.font = '10px monospace';
        ctx.fillStyle = isWindowSelection ? '#0078d4' : '#00cc66';
        ctx.fillText(
          isWindowSelection ? 'WINDOW (Enclosed)' : 'CROSSING (Intersecting)',
          x + 6,
          y + 14
        );

        ctx.restore();
      }

      // 7. Snap Marker
      if (activeSnap) {
        const pSnap = toScreen(activeSnap.point);
        ctx.save();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;

        const size = 6;
        if (activeSnap.type === 'endpoint') {
          ctx.strokeRect(pSnap.x - size, pSnap.y - size, size * 2, size * 2);
        } else if (activeSnap.type === 'midpoint') {
          ctx.beginPath();
          ctx.moveTo(pSnap.x, pSnap.y - size);
          ctx.lineTo(pSnap.x - size, pSnap.y + size);
          ctx.lineTo(pSnap.x + size, pSnap.y + size);
          ctx.closePath();
          ctx.stroke();
        } else if (activeSnap.type === 'center') {
          ctx.beginPath();
          ctx.arc(pSnap.x, pSnap.y, size, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Snap Label Tooltip
        ctx.font = '10px monospace';
        ctx.fillStyle = '#00ff66';
        ctx.fillText(activeSnap.label, pSnap.x + 10, pSnap.y - 5);
        ctx.restore();
      }

      // 8. AutoCAD Style Crosshair Cursor
      const cScr = toScreen(currentCursorWorld);
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;

      // Full screen crosshair lines
      ctx.beginPath();
      ctx.moveTo(0, cScr.y);
      ctx.lineTo(width, cScr.y);
      ctx.moveTo(cScr.x, 0);
      ctx.lineTo(cScr.x, height);
      ctx.stroke();

      // Center Pickbox
      ctx.strokeRect(cScr.x - 4, cScr.y - 4, 8, 8);
      ctx.restore();

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [
    objects,
    layers,
    transform,
    gridEnabled,
    snapSettings,
    selectedObjectIds,
    activeTool,
    drawingStart,
    polylinePoints,
    currentCursorWorld,
    activeSnap,
    snapEnabled,
    orthoEnabled,
    isBoxSelecting,
    boxSelectStart,
    boxSelectCurrent,
    activeLineWeight,
  ]);

  // MOUSE EVENTS
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenPt = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const worldPt = screenToWorld(screenPt, transform, rect.width, rect.height);
    setCurrentCursorWorld(worldPt);
    onCursorMove(worldPt);

    // Pan canvas if middle mouse or pan tool
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      onTransformChange({
        ...transform,
        panX: transform.panX + dx,
        panY: transform.panY + dy,
      });
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Dragging Active Grip Handle
    if (activeGrip) {
      const targetObj = objects.find((o) => o.id === activeGrip.objectId);
      if (targetObj) {
        const orig = activeGrip.originalObject;
        const dx = worldPt.x - activeGrip.startPt.x;
        const dy = worldPt.y - activeGrip.startPt.y;

        if (targetObj.type === 'line') {
          const lOrig = orig as LineObject;
          if (activeGrip.gripType === 'start') {
            onUpdateObject({ ...targetObj, startX: worldPt.x, startY: worldPt.y });
          } else if (activeGrip.gripType === 'end') {
            onUpdateObject({ ...targetObj, endX: worldPt.x, endY: worldPt.y });
          } else if (activeGrip.gripType === 'midpoint') {
            onUpdateObject({
              ...targetObj,
              startX: lOrig.startX + dx,
              startY: lOrig.startY + dy,
              endX: lOrig.endX + dx,
              endY: lOrig.endY + dy,
            });
          }
        } else if (targetObj.type === 'circle') {
          const cOrig = orig as CircleObject;
          if (activeGrip.gripType === 'center') {
            onUpdateObject({ ...targetObj, centerX: cOrig.centerX + dx, centerY: cOrig.centerY + dy });
          } else if (activeGrip.gripType === 'quadrant') {
            const newRadius = distance({ x: targetObj.centerX, y: targetObj.centerY }, worldPt);
            onUpdateObject({ ...targetObj, radius: Math.max(1, newRadius) });
          }
        } else if (targetObj.type === 'rectangle') {
          const rOrig = orig as RectangleObject;
          if (activeGrip.gripType === 'corner') {
            if (activeGrip.pointIndex === 0) {
              onUpdateObject({ ...targetObj, x: worldPt.x, y: worldPt.y, width: rOrig.width - dx, height: rOrig.height - dy });
            } else {
              onUpdateObject({ ...targetObj, width: Math.max(1, rOrig.width + dx), height: Math.max(1, rOrig.height + dy) });
            }
          } else if (activeGrip.gripType === 'center') {
            onUpdateObject({ ...targetObj, x: rOrig.x + dx, y: rOrig.y + dy });
          }
        } else if (targetObj.type === 'polyline') {
          const pOrig = orig as PolylineObject;
          if (activeGrip.gripType === 'vertex' && activeGrip.pointIndex !== undefined) {
            const updatedPts = [...pOrig.points];
            updatedPts[activeGrip.pointIndex] = worldPt;
            onUpdateObject({ ...targetObj, points: updatedPts });
          }
        } else if (targetObj.type === 'dimension') {
          const dOrig = orig as DimensionObject;
          if (activeGrip.gripType === 'start') {
            onUpdateObject({ ...targetObj, startX: worldPt.x, startY: worldPt.y });
          } else if (activeGrip.gripType === 'end') {
            onUpdateObject({ ...targetObj, endX: worldPt.x, endY: worldPt.y });
          }
        } else if (targetObj.type === 'text') {
          const tOrig = orig as TextObject;
          onUpdateObject({ ...targetObj, x: tOrig.x + dx, y: tOrig.y + dy });
        }
      }
      return;
    }

    // Box Selection update
    if (isBoxSelecting) {
      setBoxSelectCurrent(worldPt);
      return;
    }

    // Find snap point
    if (snapEnabled) {
      const snap = findSnapPoint(worldPt, objects, snapSettings, transform.zoom);
      setActiveSnap(snap);
    } else {
      setActiveSnap(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || activeTool === 'pan') {
      // Middle Mouse / Pan
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (e.button !== 0) return; // Left click only below

    const cursorTarget = activeSnap ? activeSnap.point : currentCursorWorld;
    let effectiveCursor = cursorTarget;

    if (orthoEnabled && drawingStart) {
      effectiveCursor = applyOrtho(drawingStart, effectiveCursor);
    }

    // Check if clicking a Grip Handle of selected objects
    if (activeTool === 'select' && selectedObjectIds.length > 0) {
      const hitGripTolerance = 10 / transform.zoom;
      for (const id of selectedObjectIds) {
        const obj = objects.find((o) => o.id === id);
        if (!obj) continue;
        const grips = getGripPoints(obj);
        for (const grip of grips) {
          if (distance(effectiveCursor, grip.point) < hitGripTolerance) {
            setActiveGrip({
              objectId: obj.id,
              gripType: grip.type as any,
              pointIndex: grip.pointIndex,
              startPt: effectiveCursor,
              originalObject: JSON.parse(JSON.stringify(obj)),
            });
            logMessage(`Grip selected: ${grip.label || grip.type}`, 'cmd');
            return;
          }
        }
      }
    }

    // Check layer restrictions for drawing tools
    const isModifyTool = [
      'move',
      'copy',
      'rotate',
      'scale',
      'mirror',
      'erase',
      'trim',
      'extend',
      'offset',
      'fillet',
      'chamfer',
      'break',
      'join',
      'explode',
    ].includes(activeTool);
    const currentLayer = layerMap.get(activeLayerId);
    if (currentLayer && currentLayer.locked && activeTool !== 'select' && !isModifyTool) {
      logMessage(`Current layer "${currentLayer.name}" is locked. Cannot draw on locked layer.`, 'warn');
      return;
    }

    // DRAWING & MODIFY TOOLS
    if (activeTool === 'erase') {
      const hitTolerance = 12 / transform.zoom;
      let hitObj: CADObject | null = null;
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        const layer = layerMap.get(obj.layerId);
        if (layer && (!layer.visible || layer.locked)) continue;
        if (hitTestObject(effectiveCursor, obj, hitTolerance)) {
          hitObj = obj;
          break;
        }
      }

      if (hitObj) {
        const updated = objects.filter((o) => o.id !== hitObj!.id);
        if (onBatchUpdateObjects) {
          onBatchUpdateObjects(updated);
        } else {
          onUpdateObject(hitObj);
        }
        logMessage(`Erased object: ${hitObj.id.slice(0, 8)}`, 'warn');
      } else if (selectedObjectIds.length > 0) {
        const lockedOrHidden = new Set(layers.filter((l) => l.locked || !l.visible).map((l) => l.id));
        const toDelete = selectedObjectIds.filter((id) => {
          const obj = objects.find((o) => o.id === id);
          return obj && !lockedOrHidden.has(obj.layerId);
        });
        if (toDelete.length > 0) {
          const updated = objects.filter((o) => !toDelete.includes(o.id));
          if (onBatchUpdateObjects) {
            onBatchUpdateObjects(updated);
          }
          logMessage(`Erased ${toDelete.length} selected object(s)`, 'warn');
          onSelectObjects([]);
        }
      }
    } else if (activeTool === 'move') {
      if (selectedObjectIds.length === 0) {
        const hitTolerance = 12 / transform.zoom;
        let hitId: string | null = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          const layer = layerMap.get(obj.layerId);
          if (layer && (!layer.visible || layer.locked)) continue;
          if (hitTestObject(effectiveCursor, obj, hitTolerance)) {
            hitId = obj.id;
            break;
          }
        }
        if (hitId) {
          onSelectObjects([hitId]);
          logMessage(`Selected object for MOVE: ${hitId.slice(0, 8)}`, 'cmd');
        } else {
          setIsBoxSelecting(true);
          setBoxSelectStart(effectiveCursor);
          setBoxSelectCurrent(effectiveCursor);
        }
      } else {
        if (!modifyBasePoint) {
          setModifyBasePoint(effectiveCursor);
          logMessage('MOVE Base Point set. Click Destination Point.', 'info');
        } else {
          const dx = effectiveCursor.x - modifyBasePoint.x;
          const dy = effectiveCursor.y - modifyBasePoint.y;
          const lockedOrHidden = new Set(layers.filter((l) => l.locked || !l.visible).map((l) => l.id));
          const validSelected = selectedObjectIds
            .map((id) => objects.find((o) => o.id === id))
            .filter((o) => o && !lockedOrHidden.has(o.layerId)) as CADObject[];

          if (validSelected.length > 0) {
            const updated = validSelected.map((o) => translateObject(o, dx, dy));
            if (onBatchUpdateObjects) {
              onBatchUpdateObjects(updated);
            } else {
              updated.forEach((o) => onUpdateObject(o));
            }
            logMessage(`Moved ${validSelected.length} object(s) by (${dx.toFixed(1)}, ${dy.toFixed(1)}) mm`, 'success');
          }
          setModifyBasePoint(null);
        }
      }
    } else if (activeTool === 'copy') {
      if (selectedObjectIds.length === 0) {
        const hitTolerance = 12 / transform.zoom;
        let hitId: string | null = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          const layer = layerMap.get(obj.layerId);
          if (layer && (!layer.visible || layer.locked)) continue;
          if (hitTestObject(effectiveCursor, obj, hitTolerance)) {
            hitId = obj.id;
            break;
          }
        }
        if (hitId) {
          onSelectObjects([hitId]);
          logMessage(`Selected object for COPY: ${hitId.slice(0, 8)}`, 'cmd');
        } else {
          setIsBoxSelecting(true);
          setBoxSelectStart(effectiveCursor);
          setBoxSelectCurrent(effectiveCursor);
        }
      } else {
        if (!modifyBasePoint) {
          setModifyBasePoint(effectiveCursor);
          logMessage('COPY Base Point set. Click Destination Point(s).', 'info');
        } else {
          const dx = effectiveCursor.x - modifyBasePoint.x;
          const dy = effectiveCursor.y - modifyBasePoint.y;
          const lockedOrHidden = new Set(layers.filter((l) => l.locked || !l.visible).map((l) => l.id));
          const validSelected = selectedObjectIds
            .map((id) => objects.find((o) => o.id === id))
            .filter((o) => o && !lockedOrHidden.has(o.layerId)) as CADObject[];

          if (validSelected.length > 0) {
            const copies = validSelected.map((o) => {
              const tr = translateObject(o, dx, dy);
              return {
                ...tr,
                id: o.type + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              };
            });
            if (onBatchAddObjects) {
              onBatchAddObjects(copies);
            } else {
              copies.forEach((o) => onAddObject(o));
            }
            logMessage(`Copied ${copies.length} object(s) to destination`, 'success');
          }
        }
      }
    } else if (activeTool === 'rotate') {
      if (selectedObjectIds.length === 0) {
        const hitTolerance = 12 / transform.zoom;
        let hitId: string | null = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          const layer = layerMap.get(obj.layerId);
          if (layer && (!layer.visible || layer.locked)) continue;
          if (hitTestObject(effectiveCursor, obj, hitTolerance)) {
            hitId = obj.id;
            break;
          }
        }
        if (hitId) {
          onSelectObjects([hitId]);
          logMessage(`Selected object for ROTATE: ${hitId.slice(0, 8)}`, 'cmd');
        } else {
          setIsBoxSelecting(true);
          setBoxSelectStart(effectiveCursor);
          setBoxSelectCurrent(effectiveCursor);
        }
      } else {
        if (!modifyBasePoint) {
          setModifyBasePoint(effectiveCursor);
          logMessage('ROTATE Base Point set. Click angle point.', 'info');
        } else {
          const angle = angleBetweenDeg(modifyBasePoint, effectiveCursor);
          const lockedOrHidden = new Set(layers.filter((l) => l.locked || !l.visible).map((l) => l.id));
          const validSelected = selectedObjectIds
            .map((id) => objects.find((o) => o.id === id))
            .filter((o) => o && !lockedOrHidden.has(o.layerId)) as CADObject[];

          if (validSelected.length > 0) {
            const updated = validSelected.map((o) => rotateObject(o, modifyBasePoint, angle));
            if (onBatchUpdateObjects) {
              onBatchUpdateObjects(updated);
            } else {
              updated.forEach((o) => onUpdateObject(o));
            }
            logMessage(`Rotated ${validSelected.length} object(s) by ${angle.toFixed(1)}°`, 'success');
          }
          setModifyBasePoint(null);
        }
      }
    } else if (activeTool === 'scale') {
      if (selectedObjectIds.length === 0) {
        const hitTolerance = 12 / transform.zoom;
        let hitId: string | null = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          const layer = layerMap.get(obj.layerId);
          if (layer && (!layer.visible || layer.locked)) continue;
          if (hitTestObject(effectiveCursor, obj, hitTolerance)) {
            hitId = obj.id;
            break;
          }
        }
        if (hitId) {
          onSelectObjects([hitId]);
          logMessage(`Selected object for SCALE: ${hitId.slice(0, 8)}`, 'cmd');
        } else {
          setIsBoxSelecting(true);
          setBoxSelectStart(effectiveCursor);
          setBoxSelectCurrent(effectiveCursor);
        }
      } else {
        if (!modifyBasePoint) {
          setModifyBasePoint(effectiveCursor);
          logMessage('SCALE Base Point set. Click scale factor point.', 'info');
        } else {
          const distVal = distance(modifyBasePoint, effectiveCursor);
          const scaleFactor = Math.max(0.01, distVal / 20);
          const lockedOrHidden = new Set(layers.filter((l) => l.locked || !l.visible).map((l) => l.id));
          const validSelected = selectedObjectIds
            .map((id) => objects.find((o) => o.id === id))
            .filter((o) => o && !lockedOrHidden.has(o.layerId)) as CADObject[];

          if (validSelected.length > 0) {
            const updated = validSelected.map((o) => scaleObject(o, modifyBasePoint, scaleFactor));
            if (onBatchUpdateObjects) {
              onBatchUpdateObjects(updated);
            } else {
              updated.forEach((o) => onUpdateObject(o));
            }
            logMessage(`Scaled ${validSelected.length} object(s) by ${scaleFactor.toFixed(2)}x`, 'success');
          }
          setModifyBasePoint(null);
        }
      }
    } else if (activeTool === 'mirror') {
      if (selectedObjectIds.length === 0) {
        const hitTolerance = 12 / transform.zoom;
        let hitId: string | null = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          const layer = layerMap.get(obj.layerId);
          if (layer && (!layer.visible || layer.locked)) continue;
          if (hitTestObject(effectiveCursor, obj, hitTolerance)) {
            hitId = obj.id;
            break;
          }
        }
        if (hitId) {
          onSelectObjects([hitId]);
          logMessage(`Selected object for MIRROR: ${hitId.slice(0, 8)}`, 'cmd');
        } else {
          setIsBoxSelecting(true);
          setBoxSelectStart(effectiveCursor);
          setBoxSelectCurrent(effectiveCursor);
        }
      } else {
        if (!modifyAxisPoint1) {
          setModifyAxisPoint1(effectiveCursor);
          logMessage('MIRROR First Axis Point set. Click Second Axis Point.', 'info');
        } else {
          const lockedOrHidden = new Set(layers.filter((l) => l.locked || !l.visible).map((l) => l.id));
          const validSelected = selectedObjectIds
            .map((id) => objects.find((o) => o.id === id))
            .filter((o) => o && !lockedOrHidden.has(o.layerId)) as CADObject[];

          if (validSelected.length > 0) {
            const mirrored = validSelected.map((o) => mirrorObject(o, modifyAxisPoint1, effectiveCursor));
            if (onBatchUpdateObjects) {
              onBatchUpdateObjects(mirrored);
            } else {
              mirrored.forEach((o) => onUpdateObject(o));
            }
            logMessage(`Mirrored ${validSelected.length} object(s) across mirror axis`, 'success');
          }
          setModifyAxisPoint1(null);
        }
      }
    } else if (activeTool === 'trim') {
      const hitTolerance = 12 / transform.zoom;
      let targetObj: CADObject | null = null;
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        const layer = layerMap.get(obj.layerId);
        if (layer && (!layer.visible || layer.locked)) continue;
        if (hitTestObject(effectiveCursor, obj, hitTolerance)) {
          targetObj = obj;
          break;
        }
      }

      if (!targetObj) {
        logMessage('TRIM: Select object to trim', 'info');
        return;
      }

      const boundaries = objects.filter((o) => {
        if (o.id === targetObj!.id) return false;
        const l = layerMap.get(o.layerId);
        return !l || (l.visible && !l.locked);
      });

      const interPts: Point2D[] = [];
      for (const b of boundaries) {
        const pts = getObjectIntersections(targetObj, b);
        interPts.push(...pts);
      }

      if (interPts.length === 0) {
        logMessage('TRIM: No valid cutting boundary found intersecting this object', 'warn');
        return;
      }

      if (targetObj.type === 'line') {
        const l = targetObj as LineObject;
        const p1 = { x: l.startX, y: l.startY };
        const p2 = { x: l.endX, y: l.endY };
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lenSq = dx * dx + dy * dy;

        if (lenSq > 1e-6) {
          const tList: number[] = [0, 1];
          for (const pt of interPts) {
            const t = ((pt.x - p1.x) * dx + (pt.y - p1.y) * dy) / lenSq;
            if (t > 1e-5 && t < 1 - 1e-5) {
              tList.push(t);
            }
          }
          tList.sort((a, b) => a - b);

          const tClick = ((effectiveCursor.x - p1.x) * dx + (effectiveCursor.y - p1.y) * dy) / lenSq;

          let removeIdx = -1;
          for (let i = 0; i < tList.length - 1; i++) {
            if (tClick >= tList[i] - 1e-3 && tClick <= tList[i + 1] + 1e-3) {
              removeIdx = i;
              break;
            }
          }

          if (removeIdx !== -1) {
            const newLines: LineObject[] = [];
            for (let i = 0; i < tList.length - 1; i++) {
              if (i === removeIdx) continue;
              const subP1 = { x: p1.x + tList[i] * dx, y: p1.y + tList[i] * dy };
              const subP2 = { x: p1.x + tList[i + 1] * dx, y: p1.y + tList[i + 1] * dy };
              if (distance(subP1, subP2) > 0.001) {
                newLines.push({
                  ...l,
                  id: 'line_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                  startX: subP1.x,
                  startY: subP1.y,
                  endX: subP2.x,
                  endY: subP2.y,
                });
              }
            }

            const updatedObjects = objects.filter((o) => o.id !== targetObj!.id);
            updatedObjects.push(...newLines);
            if (onBatchUpdateObjects) {
              onBatchUpdateObjects(updatedObjects);
            }
            logMessage('Trimmed line object segment', 'success');
          }
        }
      } else if (targetObj.type === 'circle') {
        const c = targetObj as CircleObject;
        if (interPts.length < 2) {
          logMessage('TRIM: Need at least 2 cutting intersections to trim circle into arc', 'warn');
          return;
        }
        const angles = interPts.map((pt) => Math.atan2(pt.y - c.centerY, pt.x - c.centerX)).sort((a, b) => a - b);
        const clickAng = Math.atan2(effectiveCursor.y - c.centerY, effectiveCursor.x - c.centerX);

        let sAng = angles[angles.length - 1];
        let eAng = angles[0];
        for (let i = 0; i < angles.length; i++) {
          const nextAng = angles[(i + 1) % angles.length];
          if (isAngleInArc(clickAng, angles[i], nextAng)) {
            sAng = angles[i];
            eAng = nextAng;
            break;
          }
        }

        const arcObj: ArcObject = {
          id: 'arc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          type: 'arc',
          layerId: c.layerId,
          color: c.color,
          lineWeight: c.lineWeight,
          lineType: c.lineType,
          centerX: c.centerX,
          centerY: c.centerY,
          radius: c.radius,
          startAngle: eAng,
          endAngle: sAng,
        };

        const updatedObjects = objects.filter((o) => o.id !== targetObj!.id);
        updatedObjects.push(arcObj);
        if (onBatchUpdateObjects) {
          onBatchUpdateObjects(updatedObjects);
        }
        logMessage('Trimmed circle into arc', 'success');
      } else {
        logMessage('TRIM: Selected object type not supported for trim', 'warn');
      }
    } else if (activeTool === 'extend') {
      const hitTolerance = 12 / transform.zoom;
      let targetObj: CADObject | null = null;
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        const layer = layerMap.get(obj.layerId);
        if (layer && (!layer.visible || layer.locked)) continue;
        if (hitTestObject(effectiveCursor, obj, hitTolerance)) {
          targetObj = obj;
          break;
        }
      }

      if (!targetObj || targetObj.type !== 'line') {
        logMessage('EXTEND: Click a line near the endpoint you wish to extend', 'info');
        return;
      }

      const line = targetObj as LineObject;
      const p1 = { x: line.startX, y: line.startY };
      const p2 = { x: line.endX, y: line.endY };

      const dStart = distance(effectiveCursor, p1);
      const dEnd = distance(effectiveCursor, p2);
      const extendStart = dStart < dEnd;

      const rayOrigin = extendStart ? p1 : p2;
      const rayDirection = extendStart
        ? { x: p1.x - p2.x, y: p1.y - p2.y }
        : { x: p2.x - p1.x, y: p2.y - p1.y };

      const len = Math.hypot(rayDirection.x, rayDirection.y);
      if (len > 1e-6) {
        const u = { x: rayDirection.x / len, y: rayDirection.y / len };
        const rayFar = { x: rayOrigin.x + u.x * 5000, y: rayOrigin.y + u.y * 5000 };

        const boundaries = objects.filter((o) => {
          if (o.id === targetObj!.id) return false;
          const l = layerMap.get(o.layerId);
          return !l || (l.visible && !l.locked);
        });

        let nearestPt: Point2D | null = null;
        let minDistance = Infinity;

        for (const b of boundaries) {
          const dummyLine: LineObject = {
            ...line,
            startX: rayOrigin.x,
            startY: rayOrigin.y,
            endX: rayFar.x,
            endY: rayFar.y,
          };
          const pts = getObjectIntersections(dummyLine, b);
          for (const pt of pts) {
            const d = distance(rayOrigin, pt);
            if (d > 0.001 && d < minDistance) {
              minDistance = d;
              nearestPt = pt;
            }
          }
        }

        if (nearestPt) {
          const updatedLine: LineObject = extendStart
            ? { ...line, startX: nearestPt.x, startY: nearestPt.y }
            : { ...line, endX: nearestPt.x, endY: nearestPt.y };

          if (onUpdateObject) onUpdateObject(updatedLine);
          logMessage(`Extended line to boundary endpoint (${nearestPt.x.toFixed(1)}, ${nearestPt.y.toFixed(1)}) mm`, 'success');
        } else {
          logMessage('EXTEND: No boundary object found along extension path', 'warn');
        }
      }
    } else if (activeTool === 'offset') {
      const hitTolerance = 12 / transform.zoom;
      if (!modifyFirstObject) {
        let targetObj: CADObject | null = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          const layer = layerMap.get(obj.layerId);
          if (layer && (!layer.visible || layer.locked)) continue;
          if (hitTestObject(effectiveCursor, obj, hitTolerance)) {
            targetObj = obj;
            break;
          }
        }
        if (targetObj) {
          setModifyFirstObject(targetObj);
          logMessage(`OFFSET: Object selected (${targetObj.type}). Click side to offset.`, 'info');
        } else {
          logMessage('OFFSET: Click object to offset', 'info');
        }
      } else {
        const targetObj = modifyFirstObject;
        if (targetObj.type === 'line') {
          const l = targetObj as LineObject;
          const dx = l.endX - l.startX;
          const dy = l.endY - l.startY;
          const len = Math.hypot(dx, dy);
          if (len > 1e-6) {
            const nx = -dy / len;
            const ny = dx / len;
            const side = (effectiveCursor.x - l.startX) * nx + (effectiveCursor.y - l.startY) * ny;
            const sign = side >= 0 ? 1 : -1;
            const offsetDist = 10 * sign;

            const newLine: LineObject = {
              ...l,
              id: 'line_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              startX: l.startX + nx * offsetDist,
              startY: l.startY + ny * offsetDist,
              endX: l.endX + nx * offsetDist,
              endY: l.endY + ny * offsetDist,
            };
            if (onAddObject) onAddObject(newLine);
            logMessage(`Created OFFSET line by 10mm`, 'success');
          }
        } else if (targetObj.type === 'circle') {
          const c = targetObj as CircleObject;
          const dCenter = distance(effectiveCursor, { x: c.centerX, y: c.centerY });
          const newRadius = dCenter > c.radius ? c.radius + 10 : Math.max(1, c.radius - 10);
          const newCircle: CircleObject = {
            ...c,
            id: 'circle_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            radius: newRadius,
          };
          if (onAddObject) onAddObject(newCircle);
          logMessage(`Created OFFSET circle (Radius: ${newRadius.toFixed(1)}mm)`, 'success');
        } else if (targetObj.type === 'rectangle') {
          const r = targetObj as RectangleObject;
          const center = { x: r.x + r.width / 2, y: r.y + r.height / 2 };
          const dCenter = distance(effectiveCursor, center);
          const isOut = dCenter > Math.hypot(r.width, r.height) / 2;
          const off = isOut ? 10 : -10;

          const newRect: RectangleObject = {
            ...r,
            id: 'rect_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            x: r.x - off,
            y: r.y - off,
            width: Math.max(1, r.width + 2 * off),
            height: Math.max(1, r.height + 2 * off),
          };
          if (onAddObject) onAddObject(newRect);
          logMessage(`Created OFFSET rectangle`, 'success');
        }
        setModifyFirstObject(null);
      }
    } else if (activeTool === 'fillet') {
      const hitTolerance = 12 / transform.zoom;
      if (!modifyFirstObject) {
        let targetObj: CADObject | null = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          const layer = layerMap.get(obj.layerId);
          if (layer && (!layer.visible || layer.locked)) continue;
          if (obj.type === 'line' && hitTestObject(effectiveCursor, obj, hitTolerance)) {
            targetObj = obj;
            break;
          }
        }
        if (targetObj) {
          setModifyFirstObject(targetObj);
          logMessage('FILLET: First line selected. Click second line.', 'info');
        } else {
          logMessage('FILLET: Click first line segment', 'info');
        }
      } else {
        let secondObj: CADObject | null = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          if (obj.id === modifyFirstObject.id) continue;
          const layer = layerMap.get(obj.layerId);
          if (layer && (!layer.visible || layer.locked)) continue;
          if (obj.type === 'line' && hitTestObject(effectiveCursor, obj, hitTolerance)) {
            secondObj = obj;
            break;
          }
        }
        if (secondObj) {
          try {
            const radius = 10;
            const res = filletLines(modifyFirstObject as LineObject, secondObj as LineObject, radius);
            const updatedObjects = objects.filter((o) => o.id !== modifyFirstObject.id && o.id !== secondObj!.id);
            updatedObjects.push(res.line1, res.line2);
            if (res.arc) updatedObjects.push(res.arc);

            if (onBatchUpdateObjects) onBatchUpdateObjects(updatedObjects);
            logMessage(`Created FILLET with R=${radius}mm`, 'success');
          } catch (err: any) {
            logMessage(`FILLET error: ${err.message}`, 'warn');
          }
        } else {
          logMessage('FILLET: Click second line segment', 'info');
        }
        setModifyFirstObject(null);
      }
    } else if (activeTool === 'chamfer') {
      const hitTolerance = 12 / transform.zoom;
      if (!modifyFirstObject) {
        let targetObj: CADObject | null = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          const layer = layerMap.get(obj.layerId);
          if (layer && (!layer.visible || layer.locked)) continue;
          if (obj.type === 'line' && hitTestObject(effectiveCursor, obj, hitTolerance)) {
            targetObj = obj;
            break;
          }
        }
        if (targetObj) {
          setModifyFirstObject(targetObj);
          logMessage('CHAMFER: First line selected. Click second line.', 'info');
        } else {
          logMessage('CHAMFER: Click first line segment', 'info');
        }
      } else {
        let secondObj: CADObject | null = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          if (obj.id === modifyFirstObject.id) continue;
          const layer = layerMap.get(obj.layerId);
          if (layer && (!layer.visible || layer.locked)) continue;
          if (obj.type === 'line' && hitTestObject(effectiveCursor, obj, hitTolerance)) {
            secondObj = obj;
            break;
          }
        }
        if (secondObj) {
          try {
            const d1 = 10;
            const d2 = 10;
            const res = chamferLines(modifyFirstObject as LineObject, secondObj as LineObject, d1, d2);
            const updatedObjects = objects.filter((o) => o.id !== modifyFirstObject.id && o.id !== secondObj!.id);
            updatedObjects.push(res.line1, res.line2, res.chamferLine);

            if (onBatchUpdateObjects) onBatchUpdateObjects(updatedObjects);
            logMessage(`Created CHAMFER bevel (${d1}x${d2}mm)`, 'success');
          } catch (err: any) {
            logMessage(`CHAMFER error: ${err.message}`, 'warn');
          }
        } else {
          logMessage('CHAMFER: Click second line segment', 'info');
        }
        setModifyFirstObject(null);
      }
    } else if (activeTool === 'break') {
      const hitTolerance = 12 / transform.zoom;
      if (!breakPoint1 || !modifyFirstObject) {
        let targetObj: CADObject | null = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          const layer = layerMap.get(obj.layerId);
          if (layer && (!layer.visible || layer.locked)) continue;
          if (hitTestObject(effectiveCursor, obj, hitTolerance)) {
            targetObj = obj;
            break;
          }
        }
        if (targetObj && targetObj.type === 'line') {
          setModifyFirstObject(targetObj);
          setBreakPoint1(effectiveCursor);
          logMessage('BREAK: First point set. Click second break point.', 'info');
        } else {
          logMessage('BREAK: Click line object at first break point', 'info');
        }
      } else {
        const l = modifyFirstObject as LineObject;
        const pt1 = breakPoint1;
        const pt2 = effectiveCursor;

        const p1 = { x: l.startX, y: l.startY };
        const p2 = { x: l.endX, y: l.endY };
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lenSq = dx * dx + dy * dy;

        if (lenSq > 1e-6) {
          const t1 = Math.max(0, Math.min(1, ((pt1.x - p1.x) * dx + (pt1.y - p1.y) * dy) / lenSq));
          const t2 = Math.max(0, Math.min(1, ((pt2.x - p1.x) * dx + (pt2.y - p1.y) * dy) / lenSq));

          const minT = Math.min(t1, t2);
          const maxT = Math.max(t1, t2);

          const newLines: LineObject[] = [];
          if (minT > 0.001) {
            newLines.push({
              ...l,
              id: 'line_' + Date.now() + '_1',
              endX: p1.x + minT * dx,
              endY: p1.y + minT * dy,
            });
          }
          if (maxT < 0.999) {
            newLines.push({
              ...l,
              id: 'line_' + Date.now() + '_2',
              startX: p1.x + maxT * dx,
              startY: p1.y + maxT * dy,
            });
          }

          const updatedObjects = objects.filter((o) => o.id !== l.id);
          updatedObjects.push(...newLines);

          if (onBatchUpdateObjects) onBatchUpdateObjects(updatedObjects);
          logMessage('Broke line into separate segments', 'success');
        }
        setModifyFirstObject(null);
        setBreakPoint1(null);
      }
    } else if (activeTool === 'join') {
      const lockedOrHidden = new Set(layers.filter((l) => l.locked || !l.visible).map((l) => l.id));
      const candidateObjs = (
        selectedObjectIds.length > 0
          ? selectedObjectIds.map((id) => objects.find((o) => o.id === id)).filter((o) => o && !lockedOrHidden.has(o.layerId))
          : objects.filter((o) => !lockedOrHidden.has(o.layerId) && (o.type === 'line' || o.type === 'polyline'))
      ) as CADObject[];

      try {
        const res = joinObjects(candidateObjs);
        const updatedObjects = objects.filter((o) => !res.removedIds.includes(o.id));
        updatedObjects.push(...res.joined);

        if (onBatchUpdateObjects) onBatchUpdateObjects(updatedObjects);
        logMessage(`Joined ${res.removedIds.length} segments into Polyline`, 'success');
      } catch (err: any) {
        logMessage(`JOIN error: ${err.message}`, 'warn');
      }
    } else if (activeTool === 'explode') {
      const hitTolerance = 12 / transform.zoom;
      const lockedOrHidden = new Set(layers.filter((l) => l.locked || !l.visible).map((l) => l.id));

      let targets: CADObject[] = [];
      if (selectedObjectIds.length > 0) {
        targets = selectedObjectIds
          .map((id) => objects.find((o) => o.id === id))
          .filter((o) => o && !lockedOrHidden.has(o.layerId) && (o.type === 'rectangle' || o.type === 'polyline')) as CADObject[];
      } else {
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          if (!lockedOrHidden.has(obj.layerId) && (obj.type === 'rectangle' || obj.type === 'polyline')) {
            if (hitTestObject(effectiveCursor, obj, hitTolerance)) {
              targets = [obj];
              break;
            }
          }
        }
      }

      if (targets.length === 0) {
        logMessage('EXPLODE: Select rectangle or polyline to explode into individual line segments', 'info');
        return;
      }

      let explodedLines: CADObject[] = [];
      const removedIds: string[] = [];
      for (const t of targets) {
        const lines = explodeObject(t);
        explodedLines.push(...lines);
        removedIds.push(t.id);
      }

      const updatedObjects = objects.filter((o) => !removedIds.includes(o.id));
      updatedObjects.push(...explodedLines);

      if (onBatchUpdateObjects) onBatchUpdateObjects(updatedObjects);
      logMessage(`Exploded ${targets.length} object(s) into ${explodedLines.length} individual lines`, 'success');
    } else if (activeTool === 'line') {
      if (!drawingStart) {
        setDrawingStart(effectiveCursor);
      } else {
        const newLine: LineObject = {
          id: 'line_' + Date.now(),
          type: 'line',
          layerId: activeLayerId,
          color: activeColor,
          lineWeight: activeLineWeight,
          startX: drawingStart.x,
          startY: drawingStart.y,
          endX: effectiveCursor.x,
          endY: effectiveCursor.y,
        };
        onAddObject(newLine);
        logMessage(`Created LINE: (${drawingStart.x.toFixed(1)}, ${drawingStart.y.toFixed(1)}) to (${effectiveCursor.x.toFixed(1)}, ${effectiveCursor.y.toFixed(1)})`, 'success');
        setDrawingStart(null);
      }
    } else if (activeTool === 'polyline') {
      const newPts = [...polylinePoints, effectiveCursor];
      setPolylinePoints(newPts);
      logMessage(`Added Polyline vertex #${newPts.length}`, 'info');
    } else if (activeTool === 'rectangle') {
      if (!drawingStart) {
        setDrawingStart(effectiveCursor);
      } else {
        const w = effectiveCursor.x - drawingStart.x;
        const h = effectiveCursor.y - drawingStart.y;

        const newRect: RectangleObject = {
          id: 'rect_' + Date.now(),
          type: 'rectangle',
          layerId: activeLayerId,
          color: activeColor,
          lineWeight: activeLineWeight,
          x: drawingStart.x,
          y: drawingStart.y,
          width: w,
          height: h,
        };
        onAddObject(newRect);
        logMessage(`Created RECTANGLE: ${Math.abs(w).toFixed(1)} x ${Math.abs(h).toFixed(1)} mm`, 'success');
        setDrawingStart(null);
      }
    } else if (activeTool === 'circle') {
      if (!drawingStart) {
        setDrawingStart(effectiveCursor);
      } else {
        const rad = distance(drawingStart, effectiveCursor);
        const newCircle: CircleObject = {
          id: 'circle_' + Date.now(),
          type: 'circle',
          layerId: activeLayerId,
          color: activeColor,
          lineWeight: activeLineWeight,
          centerX: drawingStart.x,
          centerY: drawingStart.y,
          radius: Math.max(1, rad),
        };
        onAddObject(newCircle);
        logMessage(`Created CIRCLE: Radius ${rad.toFixed(1)} mm`, 'success');
        setDrawingStart(null);
      }
    } else if (activeTool === 'dimension') {
      if (!drawingStart) {
        setDrawingStart(effectiveCursor);
      } else {
        const newDim: DimensionObject = {
          id: 'dim_' + Date.now(),
          type: 'dimension',
          layerId: activeLayerId,
          color: activeColor,
          lineWeight: 1,
          startX: drawingStart.x,
          startY: drawingStart.y,
          endX: effectiveCursor.x,
          endY: effectiveCursor.y,
          offset: 15,
        };
        onAddObject(newDim);
        logMessage(`Created DIMENSION line`, 'success');
        setDrawingStart(null);
      }
    } else if (activeTool === 'select') {
      // Hit test single object
      const hitTolerance = 12 / transform.zoom;
      let hitId: string | null = null;

      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        const layer = layerMap.get(obj.layerId);
        // Skip hidden layers
        if (layer && !layer.visible) continue;

        if (hitTestObject(effectiveCursor, obj, hitTolerance)) {
          if (layer && layer.locked) {
            logMessage(`Layer "${layer.name}" is locked. Cannot select or edit.`, 'warn');
            return;
          }
          hitId = obj.id;
          break;
        }
      }

      if (hitId) {
        if (e.shiftKey) {
          // Toggle selection
          if (selectedObjectIds.includes(hitId)) {
            onSelectObjects(selectedObjectIds.filter((id) => id !== hitId));
            logMessage(`Deselected object: ${hitId.slice(0, 8)}`, 'cmd');
          } else {
            onSelectObjects([...selectedObjectIds, hitId]);
            logMessage(`Added object to selection: ${hitId.slice(0, 8)}`, 'cmd');
          }
        } else {
          onSelectObjects([hitId]);
          logMessage(`Selected object: ${hitId.slice(0, 8)}`, 'cmd');
        }
      } else {
        // Start Box Selection
        setIsBoxSelecting(true);
        setBoxSelectStart(effectiveCursor);
        setBoxSelectCurrent(effectiveCursor);
        setBoxSelectIsShift(e.shiftKey);
      }
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (activeGrip) {
      logMessage(`Completed grip modification`, 'success');
      setActiveGrip(null);
    }

    if (isBoxSelecting && boxSelectStart && boxSelectCurrent) {
      const minX = Math.min(boxSelectStart.x, boxSelectCurrent.x);
      const maxX = Math.max(boxSelectStart.x, boxSelectCurrent.x);
      const minY = Math.min(boxSelectStart.y, boxSelectCurrent.y);
      const maxY = Math.max(boxSelectStart.y, boxSelectCurrent.y);
      const selBox = { minX, minY, maxX, maxY };

      const isWindowSelection = boxSelectCurrent.x >= boxSelectStart.x; // Left to Right = Window, Right to Left = Crossing

      const newlySelected: string[] = [];
      for (const obj of objects) {
        const layer = layerMap.get(obj.layerId);
        if (layer && (!layer.visible || layer.locked)) continue;

        if (isWindowSelection) {
          if (isObjectInsideWindow(obj, selBox)) newlySelected.push(obj.id);
        } else {
          if (isObjectCrossingWindow(obj, selBox)) newlySelected.push(obj.id);
        }
      }

      if (boxSelectIsShift) {
        const combined = Array.from(new Set([...selectedObjectIds, ...newlySelected]));
        onSelectObjects(combined);
        logMessage(`${isWindowSelection ? 'Window' : 'Crossing'} selected +${newlySelected.length} object(s) (Total: ${combined.length})`, 'cmd');
      } else {
        onSelectObjects(newlySelected);
        if (newlySelected.length > 0) {
          logMessage(`${isWindowSelection ? 'Window' : 'Crossing'} selected ${newlySelected.length} object(s)`, 'cmd');
        } else {
          onSelectObjects([]);
        }
      }

      setIsBoxSelecting(false);
      setBoxSelectStart(null);
      setBoxSelectCurrent(null);
    }
  };

  const handleDoubleClick = () => {
    if (activeTool === 'polyline' && polylinePoints.length > 1) {
      const newPoly: PolylineObject = {
        id: 'poly_' + Date.now(),
        type: 'polyline',
        layerId: activeLayerId,
        color: activeColor,
        lineWeight: activeLineWeight,
        points: polylinePoints,
      };
      onAddObject(newPoly);
      logMessage(`Completed POLYLINE with ${polylinePoints.length} vertices`, 'success');
      setPolylinePoints([]);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenPt = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(20, Math.max(0.05, transform.zoom * zoomFactor));

    // Zoom towards mouse cursor position
    const originX = rect.width / 2 + transform.panX;
    const originY = rect.height / 2 + transform.panY;

    const mouseOffsetX = screenPt.x - originX;
    const mouseOffsetY = screenPt.y - originY;

    const newPanX = transform.panX - mouseOffsetX * (zoomFactor - 1);
    const newPanY = transform.panY - mouseOffsetY * (zoomFactor - 1);

    onTransformChange({
      zoom: newZoom,
      panX: newPanX,
      panY: newPanY,
    });
  };

  return (
    <div className="flex-1 h-full w-full relative overflow-hidden bg-[#121417] cursor-crosshair select-none">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        className="w-full h-full block"
      />
    </div>
  );
};

