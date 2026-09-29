import React, { useState, useRef, useMemo } from 'react';
import { Language } from '../types';
import {
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  Sliders,
  Maximize2,
  Box,
  Compass,
  FileCode,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  triggerPluginDownload,
  triggerSpecificSoftwareDownload,
} from '../utils/fileDownloader';
import { PLUGINS_DATA } from '../data/plugins';

interface VertexVisualizerProps {
  lang: Language;
}

interface MeshVertex {
  id: number;
  gx: number; // grid coordinate (0..cols)
  gy: number; // grid coordinate (0..rows)
  x: number;  // 3D world x
  y: number;  // 3D world y
  z: number;  // 3D world z (elevation)
}

type FalloffCurveType = 'gaussian' | 'cosine' | 'linear' | 'spike';
type PresetType = 'canopy' | 'sine_roof' | 'terrain' | 'saddle' | 'dome' | 'flat';

export const VertexVisualizer: React.FC<VertexVisualizerProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // Grid dimensions
  const COLS = 13;
  const ROWS = 9;
  const CELL_SIZE = 22; // spacing in 3D world units

  // Presets calculation
  const getPresetMesh = (preset: PresetType): MeshVertex[] => {
    const list: MeshVertex[] = [];
    let id = 0;
    const midX = (COLS - 1) / 2;
    const midY = (ROWS - 1) / 2;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const worldX = (c - midX) * CELL_SIZE;
        const worldY = (r - midY) * CELL_SIZE;
        let worldZ = 0;

        if (preset === 'canopy') {
          // Tensile wave canopy directly inspired by Vertex Tools 2 hero image
          const wave1 = Math.sin((c / (COLS - 1)) * Math.PI * 2.2);
          const wave2 = Math.cos((r / (ROWS - 1)) * Math.PI * 1.5);
          worldZ = (wave1 * 34 + wave2 * 18);
        } else if (preset === 'sine_roof') {
          worldZ = Math.sin((c / (COLS - 1)) * Math.PI * 3.0) * 28;
        } else if (preset === 'terrain') {
          const dist = Math.hypot(c - midX, r - midY) / Math.hypot(midX, midY);
          worldZ = Math.max(0, (1 - dist) * 48) + Math.sin(c * 0.8) * 8;
        } else if (preset === 'saddle') {
          const u = (c - midX) / midX;
          const v = (r - midY) / midY;
          worldZ = (u * u - v * v) * 26;
        } else if (preset === 'dome') {
          const dist = Math.hypot(c - midX, r - midY) / Math.hypot(midX, midY);
          worldZ = Math.max(0, Math.cos(dist * Math.PI * 0.5) * 42);
        } else {
          worldZ = 0;
        }

        list.push({ id: id++, gx: c, gy: r, x: worldX, y: worldY, z: worldZ });
      }
    }
    return list;
  };

  // State
  const [currentPreset, setCurrentPreset] = useState<PresetType>('canopy');
  const [vertices, setVertices] = useState<MeshVertex[]>(() => getPresetMesh('canopy'));
  const [selectedVertexId, setSelectedVertexId] = useState<number>(45); // center-ish vertex
  const [falloffRadius, setFalloffRadius] = useState<number>(75); // soft selection radius
  const [falloffCurve, setFalloffCurve] = useState<FalloffCurveType>('gaussian');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showWireframe, setShowWireframe] = useState<boolean>(true);
  const [showFaces, setShowFaces] = useState<boolean>(true);
  const [cameraRotX, setCameraRotX] = useState<number>(34); // tilt in deg
  const [cameraRotZ, setCameraRotZ] = useState<number>(-38); // yaw in deg
  const [cameraZoom, setCameraZoom] = useState<number>(1.15);

  // Interaction dragging
  const [isDraggingGizmo, setIsDraggingGizmo] = useState<'z' | 'x' | 'y' | null>(null);
  const [isRotatingCamera, setIsRotatingCamera] = useState<boolean>(false);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [dragStartX, setDragStartX] = useState<number>(0);

  // Download states
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [softwareDropdownOpen, setSoftwareDropdownOpen] = useState<boolean>(false);

  const vertexPlugin = useMemo(() => {
    return PLUGINS_DATA.find((p) => p.id === 'sketchup-evl-vertex') || PLUGINS_DATA[0];
  }, []);

  // Selected vertex object
  const activeVertex = useMemo(() => {
    return vertices.find((v) => v.id === selectedVertexId) || vertices[0];
  }, [vertices, selectedVertexId]);

  // Compute soft selection weight for all vertices relative to activeVertex
  const vertexWeights = useMemo(() => {
    if (!activeVertex) return new Map<number, number>();
    const map = new Map<number, number>();

    vertices.forEach((v) => {
      const dist = Math.hypot(v.x - activeVertex.x, v.y - activeVertex.y, v.z - activeVertex.z);
      if (dist > falloffRadius) {
        map.set(v.id, 0);
        return;
      }
      const ratio = dist / falloffRadius;
      let w = 0;
      if (falloffCurve === 'gaussian') {
        w = Math.exp(-3.0 * (ratio * ratio));
      } else if (falloffCurve === 'cosine') {
        w = (Math.cos(ratio * Math.PI) + 1.0) * 0.5;
      } else if (falloffCurve === 'spike') {
        w = Math.pow(1.0 - ratio, 2);
      } else {
        w = 1.0 - ratio;
      }
      map.set(v.id, Math.max(0, Math.min(1, w)));
    });
    return map;
  }, [vertices, activeVertex, falloffRadius, falloffCurve]);

  // 3D Isometric projection math
  const project3D = (x: number, y: number, z: number) => {
    const radZ = (cameraRotZ * Math.PI) / 180;
    const radX = (cameraRotX * Math.PI) / 180;

    // Yaw around Z axis
    const x1 = x * Math.cos(radZ) - y * Math.sin(radZ);
    const y1 = x * Math.sin(radZ) + y * Math.cos(radZ);
    const z1 = z;

    // Pitch around X axis
    const x2 = x1;
    const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

    // Center screen offset
    const scale = 2.4 * cameraZoom;
    const screenX = 360 + x2 * scale;
    const screenY = 220 - y2 * scale; // invert Y for screen coords

    return { sx: screenX, sy: screenY, depth: z2 };
  };

  // Color heatmap based on weight (Red -> Yellow -> Green -> Cyan -> Blue)
  const getHeatmapColor = (weight: number) => {
    if (weight > 0.8) return '#ef4444'; // Red (100% influence)
    if (weight > 0.6) return '#f97316'; // Orange
    if (weight > 0.4) return '#eab308'; // Yellow
    if (weight > 0.2) return '#22c55e'; // Green
    if (weight > 0.02) return '#06b6d4'; // Cyan
    return '#3b82f6'; // Blue (0% influence)
  };

  // Handle vertex displacement when user drags gizmo
  const handleApplyDisplacement = (dz: number, dx: number = 0, dy: number = 0) => {
    if (!activeVertex) return;
    setVertices((prev) =>
      prev.map((v) => {
        const weight = vertexWeights.get(v.id) || 0;
        if (weight <= 0) return v;
        return {
          ...v,
          x: v.x + dx * weight,
          y: v.y + dy * weight,
          z: v.z + dz * weight,
        };
      }),
    );
  };

  // Mouse handlers for Gizmo and 3D viewport
  const handleMouseDownSvg = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDraggingGizmo) return;
    setIsRotatingCamera(true);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
  };

  const handleMouseMoveSvg = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDraggingGizmo) {
      const deltaY = dragStartY - e.clientY;
      const deltaX = e.clientX - dragStartX;

      if (isDraggingGizmo === 'z') {
        handleApplyDisplacement(deltaY * 0.4, 0, 0);
      } else if (isDraggingGizmo === 'x') {
        handleApplyDisplacement(0, deltaX * 0.4, 0);
      } else if (isDraggingGizmo === 'y') {
        handleApplyDisplacement(0, 0, deltaY * 0.4);
      }
      setDragStartX(e.clientX);
      setDragStartY(e.clientY);
      return;
    }

    if (isRotatingCamera) {
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      setCameraRotZ((prev) => (prev + dx * 0.5) % 360);
      setCameraRotX((prev) => Math.max(10, Math.min(85, prev - dy * 0.5)));
      setDragStartX(e.clientX);
      setDragStartY(e.clientY);
    }
  };

  const handleMouseUpSvg = () => {
    setIsDraggingGizmo(null);
    setIsRotatingCamera(false);
  };

  const handleResetMesh = (preset: PresetType) => {
    setCurrentPreset(preset);
    setVertices(getPresetMesh(preset));
  };

  const handleDownload = async (format: 'sketchup' | 'blender' | 'autocad' | '3dsmax' | 'rhino' | 'obj') => {
    setIsDownloading(true);
    setSoftwareDropdownOpen(false);
    const ok = await triggerSpecificSoftwareDownload(vertexPlugin, format);
    setIsDownloading(false);
    if (ok) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }
  };

  // Project Gizmo position
  const activeProj = activeVertex
    ? project3D(activeVertex.x, activeVertex.y, activeVertex.z)
    : { sx: 360, sy: 220, depth: 0 };

  const gizmoZ = activeVertex ? project3D(activeVertex.x, activeVertex.y, activeVertex.z + 55) : activeProj;
  const gizmoX = activeVertex ? project3D(activeVertex.x + 55, activeVertex.y, activeVertex.z) : activeProj;
  const gizmoY = activeVertex ? project3D(activeVertex.x, activeVertex.y + 55, activeVertex.z) : activeProj;

  // Render 3D Quad Faces
  const quadFaces = useMemo(() => {
    const faces = [];
    for (let r = 0; r < ROWS - 1; r++) {
      for (let c = 0; c < COLS - 1; c++) {
        const v1 = vertices[r * COLS + c];
        const v2 = vertices[r * COLS + (c + 1)];
        const v3 = vertices[(r + 1) * COLS + (c + 1)];
        const v4 = vertices[(r + 1) * COLS + c];

        const p1 = project3D(v1.x, v1.y, v1.z);
        const p2 = project3D(v2.x, v2.y, v2.z);
        const p3 = project3D(v3.x, v3.y, v3.z);
        const p4 = project3D(v4.x, v4.y, v4.z);

        const avgDepth = (p1.depth + p2.depth + p3.depth + p4.depth) / 4;
        const avgZ = (v1.z + v2.z + v3.z + v4.z) / 4;

        // Gradient shading based on height
        const normalShade = Math.sin((v1.z - v3.z) * 0.05 + 0.5);
        const lightness = Math.min(88, Math.max(30, 65 + normalShade * 18));
        const color = `hsl(215, 20%, ${lightness}%)`;

        faces.push({
          id: `${r}-${c}`,
          d: `M ${p1.sx},${p1.sy} L ${p2.sx},${p2.sy} L ${p3.sx},${p3.sy} L ${p4.sx},${p4.sy} Z`,
          depth: avgDepth,
          fill: color,
        });
      }
    }
    // Sort back-to-front painter's algorithm
    return faces.sort((a, b) => a.depth - b.depth);
  }, [vertices, cameraRotX, cameraRotZ, cameraZoom]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl space-y-6">
      {/* 1. Header Banner styled like Vertex Tools 2 Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Vertex Tools</span>
              <span className="text-red-500 font-extrabold text-3xl">2</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider">
              EVL-Vertex
            </span>
            <span className="px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold">
              Multi-Software
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {isBn
              ? '৩ডি ম্যাশ ভার্টেক্স এডিটর, কোঅর্ডিনেট গিজমো, সফট সিলেকশন ফলঅফ এবং অর্গানিক কার্ভড ক্যানোপি জেনারেটর।'
              : 'Powerful 3D Vertex & Mesh Editor with Coordinate Transformation Gizmo, Soft Selection Falloff & Organic Canopy.'}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Trimble SketchUp (.rbz)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Blender 3D (.py)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">AutoCAD (.lsp)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">3ds Max (.ms)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Rhino / Grasshopper (.py)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Universal (.obj)</span>
          </div>
        </div>

        {/* 1-Click Multi-Software Download Menu */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload('sketchup')}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? (isBn ? 'প্রস্তুত হচ্ছে...' : 'Building...') : 'Download .RBZ (SketchUp)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSoftwareDropdownOpen(!softwareDropdownOpen)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-colors"
              title="More Software Formats"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Software Dropdown */}
          {softwareDropdownOpen && (
            <div className="absolute right-0 top-12 z-50 w-64 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                {isBn ? 'সফটওয়্যার ফরম্যাট বাছাই করুন' : 'Select Software Target'}
              </div>
              <button
                type="button"
                onClick={() => handleDownload('sketchup')}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-xs flex items-center justify-between transition-colors"
              >
                <span className="font-semibold text-white">Trimble SketchUp</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-900/60 text-sky-300 font-mono">.rbz</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('blender')}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-xs flex items-center justify-between transition-colors"
              >
                <span className="font-semibold text-white">Blender 3D Addon</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 font-mono">.py</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('autocad')}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-xs flex items-center justify-between transition-colors"
              >
                <span className="font-semibold text-white">AutoCAD 3DMesh</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/60 text-red-300 font-mono">.lsp</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('3dsmax')}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-xs flex items-center justify-between transition-colors"
              >
                <span className="font-semibold text-white">3ds Max Editable Poly</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 font-mono">.ms</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('rhino')}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-xs flex items-center justify-between transition-colors"
              >
                <span className="font-semibold text-white">Rhino 3D Python</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono">.py</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('obj')}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-xs flex items-center justify-between transition-colors"
              >
                <span className="font-semibold text-white">Universal 3D Mesh</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 font-mono">.obj</span>
              </button>
            </div>
          )}

          {downloadSuccess && (
            <div className="absolute right-0 top-12 mt-1 px-3 py-1.5 bg-emerald-950 border border-emerald-600 rounded-lg text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-lg whitespace-nowrap">
              <Check className="w-3.5 h-3.5" />
              <span>{isBn ? 'ডাউনলোড সফল হয়েছে!' : 'Download Complete!'}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Presets Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isBn ? 'প্যারামেট্রিক প্রিসেটস:' : 'Mesh Presets:'}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'canopy', labelEn: 'Tensile Wave Canopy', labelBn: 'কার্ভড ওয়েভ ক্যানোপি' },
              { id: 'sine_roof', labelEn: 'Sine Wave Roof', labelBn: 'সাইন ওয়েভ রুফ' },
              { id: 'terrain', labelEn: 'Landscape Mountain', labelBn: 'পাহাড়ি ভূখণ্ড' },
              { id: 'saddle', labelEn: 'Saddle Shell', labelBn: 'স্যাডেল ক্যানোপি' },
              { id: 'dome', labelEn: 'Parametric Dome', labelBn: 'প্যারামেট্রিক ডোম' },
              { id: 'flat', labelEn: 'Flat Grid', labelBn: 'ফ্ল্যাট গ্রিড' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleResetMesh(p.id as PresetType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPreset === p.id
                    ? 'bg-red-600 text-white font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {isBn ? p.labelBn : p.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Camera Quick Controls */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => {
              setCameraRotX(34);
              setCameraRotZ(-38);
              setCameraZoom(1.15);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset 3D View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isBn ? 'রিসেট ভিউ' : 'Reset View'}</span>
          </button>
        </div>
      </div>

      {/* 3. Main 3D Canvas + Interactive Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive 3D Canvas Area */}
        <div className="lg:col-span-3 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden select-none min-h-[440px] flex flex-col items-center justify-center">
          {/* Top overlay hints */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 text-[11px] bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <span>●</span> Z-Axis Gizmo Drag (উঁচু-নিচু করুন)
            </span>
            <span className="text-slate-500">|</span>
            <span>রোটেট করতে ক্যানভাসে ড্র্যাগ করুন</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-300 font-mono">
              Active Vertex: #{activeVertex ? activeVertex.id : 0} (Z: {activeVertex ? activeVertex.z.toFixed(1) : 0})
            </span>
          </div>

          {/* View Toggles Overlay */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                showHeatmap ? 'bg-amber-600/80 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'হিটম্যাপ' : 'Heatmap'}
            </button>
            <button
              type="button"
              onClick={() => setShowWireframe(!showWireframe)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                showWireframe ? 'bg-sky-600/80 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'ওয়্যারফ্রেম' : 'Wireframe'}
            </button>
            <button
              type="button"
              onClick={() => setShowFaces(!showFaces)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                showFaces ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'ফেস' : 'Shaded'}
            </button>
          </div>

          {/* SVG 3D Canvas */}
          <svg
            className="w-full h-[460px] cursor-grab active:cursor-grabbing"
            viewBox="0 0 720 460"
            onMouseDown={handleMouseDownSvg}
            onMouseMove={handleMouseMoveSvg}
            onMouseUp={handleMouseUpSvg}
          >
            {/* Background Grid Floor (Subtle CAD Grid) */}
            <g opacity="0.15">
              {[-120, -60, 0, 60, 120].map((gx) => {
                const pA = project3D(gx, -120, 0);
                const pB = project3D(gx, 120, 0);
                return <line key={`gx-${gx}`} x1={pA.sx} y1={pA.sy} x2={pB.sx} y2={pB.sy} stroke="#94a3b8" strokeWidth="1" />;
              })}
              {[-120, -60, 0, 60, 120].map((gy) => {
                const pA = project3D(-120, gy, 0);
                const pB = project3D(120, gy, 0);
                return <line key={`gy-${gy}`} x1={pA.sx} y1={pA.sy} x2={pB.sx} y2={pB.sy} stroke="#94a3b8" strokeWidth="1" />;
              })}
            </g>

            {/* 3D Quad Faces (Shaded) */}
            {showFaces && (
              <g>
                {quadFaces.map((f) => (
                  <path
                    key={f.id}
                    d={f.d}
                    fill={f.fill}
                    stroke={showWireframe ? '#1e293b' : 'none'}
                    strokeWidth={showWireframe ? 0.75 : 0}
                    opacity="0.88"
                  />
                ))}
              </g>
            )}

            {/* Wireframe Mesh Lines if Faces are hidden */}
            {!showFaces && showWireframe && (
              <g stroke="#64748b" strokeWidth="1.2" fill="none">
                {/* Rows */}
                {Array.from({ length: ROWS }).map((_, r) => {
                  const pts = Array.from({ length: COLS }).map((_, c) => {
                    const v = vertices[r * COLS + c];
                    const p = project3D(v.x, v.y, v.z);
                    return `${p.sx},${p.sy}`;
                  });
                  return <polyline key={`r-${r}`} points={pts.join(' ')} />;
                })}
                {/* Columns */}
                {Array.from({ length: COLS }).map((_, c) => {
                  const pts = Array.from({ length: ROWS }).map((_, r) => {
                    const v = vertices[r * COLS + c];
                    const p = project3D(v.x, v.y, v.z);
                    return `${p.sx},${p.sy}`;
                  });
                  return <polyline key={`c-${c}`} points={pts.join(' ')} />;
                })}
              </g>
            )}

            {/* Vertices Dots with Temperature Heatmap */}
            <g>
              {vertices.map((v) => {
                const p = project3D(v.x, v.y, v.z);
                const isSelected = v.id === selectedVertexId;
                const weight = vertexWeights.get(v.id) || 0;
                const color = showHeatmap ? getHeatmapColor(weight) : '#38bdf8';

                return (
                  <circle
                    key={v.id}
                    cx={p.sx}
                    cy={p.sy}
                    r={isSelected ? 6.5 : weight > 0.1 ? 4.5 : 3}
                    fill={isSelected ? '#ffffff' : color}
                    stroke={isSelected ? '#ef4444' : '#0f172a'}
                    strokeWidth={isSelected ? 2.5 : 1}
                    className="cursor-pointer transition-transform hover:scale-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVertexId(v.id);
                    }}
                  />
                );
              })}
            </g>

            {/* 3D TRANSFORMATION GIZMO (Matching Vertex Tools 2 Hero Image) */}
            {activeVertex && (
              <g className="select-none pointer-events-auto">
                {/* Rotation Arcs */}
                <ellipse
                  cx={activeProj.sx}
                  cy={activeProj.sy}
                  rx="36"
                  ry="16"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.8"
                />

                {/* X-Axis Arrow (Red) */}
                <line
                  x1={activeProj.sx}
                  y1={activeProj.sy}
                  x2={gizmoX.sx}
                  y2={gizmoX.sy}
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle
                  cx={gizmoX.sx}
                  cy={gizmoX.sy}
                  r="6"
                  fill="#ef4444"
                  className="cursor-ew-resize hover:scale-125"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDraggingGizmo('x');
                    setDragStartX(e.clientX);
                    setDragStartY(e.clientY);
                  }}
                />
                <text x={gizmoX.sx + 8} y={gizmoX.sy + 4} fill="#ef4444" fontSize="11" fontWeight="bold">
                  +X
                </text>

                {/* Y-Axis Arrow (Green) */}
                <line
                  x1={activeProj.sx}
                  y1={activeProj.sy}
                  x2={gizmoY.sx}
                  y2={gizmoY.sy}
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle
                  cx={gizmoY.sx}
                  cy={gizmoY.sy}
                  r="6"
                  fill="#22c55e"
                  className="cursor-ns-resize hover:scale-125"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDraggingGizmo('y');
                    setDragStartX(e.clientX);
                    setDragStartY(e.clientY);
                  }}
                />
                <text x={gizmoY.sx + 8} y={gizmoY.sy + 4} fill="#22c55e" fontSize="11" fontWeight="bold">
                  +Y
                </text>

                {/* Z-Axis Arrow (Blue - Vertical Lift) */}
                <line
                  x1={activeProj.sx}
                  y1={activeProj.sy}
                  x2={gizmoZ.sx}
                  y2={gizmoZ.sy}
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Arrowhead */}
                <polygon
                  points={`${gizmoZ.sx},${gizmoZ.sy - 8} ${gizmoZ.sx - 6},${gizmoZ.sy + 4} ${gizmoZ.sx + 6},${gizmoZ.sy + 4}`}
                  fill="#3b82f6"
                  className="cursor-ns-resize hover:scale-125"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDraggingGizmo('z');
                    setDragStartX(e.clientX);
                    setDragStartY(e.clientY);
                  }}
                />
                <text x={gizmoZ.sx + 10} y={gizmoZ.sy} fill="#3b82f6" fontSize="12" fontWeight="bold">
                  +Z (Lift)
                </text>

                {/* Center Gizmo Pivot Node */}
                <circle cx={activeProj.sx} cy={activeProj.sy} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              </g>
            )}
          </svg>

          {/* Quick Elevation +/- Buttons */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold px-2">
              {isBn ? 'ভার্টেক্স উচ্চতা:' : 'Z-Elevate:'}
            </span>
            <button
              type="button"
              onClick={() => handleApplyDisplacement(8, 0, 0)}
              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow"
            >
              ▲ +8"
            </button>
            <button
              type="button"
              onClick={() => handleApplyDisplacement(-8, 0, 0)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              ▼ -8"
            </button>
            <button
              type="button"
              onClick={() => handleResetMesh(currentPreset)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-900/80 text-slate-300 hover:text-red-200 text-xs transition-colors"
              title="Reset to preset original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Parameters Sidebar */}
        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {isBn ? 'সফট সিলেকশন প্যারামিটার' : 'Soft Selection Tools'}
            </h3>
          </div>

          {/* Falloff Radius Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                {isBn ? 'ফলঅফ রেডিয়াস (ব্যাসার্ধ):' : 'Falloff Radius:'}
              </span>
              <span className="font-mono font-bold text-amber-400">{falloffRadius}"</span>
            </div>
            <input
              type="range"
              min="20"
              max="160"
              step="5"
              value={falloffRadius}
              onChange={(e) => setFalloffRadius(Number(e.target.value))}
              className="w-full accent-red-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>20" (Tight)</span>
              <span>160" (Wide Canopy)</span>
            </div>
          </div>

          {/* Falloff Curve Type */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium block">
              {isBn ? 'ফলঅফ কার্ভ প্রোফাইল:' : 'Curve Profile:'}
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'gaussian', label: 'Gaussian (Bell)', desc: 'Smooth Curve' },
                { id: 'cosine', label: 'Cosine (Dome)', desc: 'Rounded' },
                { id: 'linear', label: 'Linear', desc: 'Pyramid' },
                { id: 'spike', label: 'Spike', desc: 'Sharp Peak' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFalloffCurve(c.id as FalloffCurveType)}
                  className={`p-2 rounded-xl text-left transition-all border ${
                    falloffCurve === c.id
                      ? 'bg-red-950/60 border-red-500 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-[11px] font-bold">{c.label}</div>
                  <div className="text-[9px] text-slate-500">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Heatmap Legend */}
          <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block">
              {isBn ? 'হিটম্যাপ প্রভাব সূচক:' : 'Influence Weight Legend:'}
            </span>
            <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 via-emerald-400 via-amber-400 to-red-600 w-full" />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Rigid)</span>
              <span>50%</span>
              <span>100% (Full Lift)</span>
            </div>
          </div>

          {/* Multi-Software Export Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              {isBn ? 'সফটওয়্যার স্ক্রিপ্ট এক্সপোর্ট:' : 'Export for Software:'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDownload('sketchup')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs transition-colors group"
              >
                <div className="font-bold text-white group-hover:text-red-400">SketchUp</div>
                <div className="text-[10px] text-slate-500">.rbz Extension</div>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('blender')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs transition-colors group"
              >
                <div className="font-bold text-white group-hover:text-amber-400">Blender</div>
                <div className="text-[10px] text-slate-500">.py Addon</div>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('autocad')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs transition-colors group"
              >
                <div className="font-bold text-white group-hover:text-red-400">AutoCAD</div>
                <div className="text-[10px] text-slate-500">.lsp Routine</div>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('3dsmax')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs transition-colors group"
              >
                <div className="font-bold text-white group-hover:text-teal-400">3ds Max</div>
                <div className="text-[10px] text-slate-500">.ms MaxScript</div>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('rhino')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs transition-colors group"
              >
                <div className="font-bold text-white group-hover:text-emerald-400">Rhino</div>
                <div className="text-[10px] text-slate-500">.py Script</div>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('obj')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs transition-colors group"
              >
                <div className="font-bold text-white group-hover:text-purple-400">3D OBJ</div>
                <div className="text-[10px] text-slate-500">Universal Mesh</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
