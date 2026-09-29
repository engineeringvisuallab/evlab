import React, { useState, useRef, useEffect } from 'react';
import { Rotate3d, Box, Maximize2, Minimize2, ZoomIn, ZoomOut, Layers, Eye, RefreshCw } from 'lucide-react';

interface Model3DViewerProps {
  modelType?: 'building' | 'chamber' | 'pipeline';
  title?: string;
}

export function Model3DViewer({ modelType = 'building', title = 'Interactive 3D Engineering Model' }: Model3DViewerProps) {
  const [rotation, setRotation] = useState({ x: -20, y: 35 });
  const [zoom, setZoom] = useState(1);
  const [wireframe, setWireframe] = useState(false);
  const [viewPreset, setViewPreset] = useState<'iso' | 'top' | 'front'>('iso');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotation((prev) => ({
      x: Math.max(-85, Math.min(85, prev.x - deltaY * 0.5)),
      y: (prev.y + deltaX * 0.5) % 360
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setRotation({ x: -20, y: 35 });
    setZoom(1);
    setViewPreset('iso');
    setWireframe(false);
  };

  const handlePreset = (preset: 'iso' | 'top' | 'front') => {
    setViewPreset(preset);
    if (preset === 'iso') setRotation({ x: -25, y: 45 });
    if (preset === 'top') setRotation({ x: -90, y: 0 });
    if (preset === 'front') setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl bg-[#060b17] border border-cyan-900/60 overflow-hidden shadow-2xl ${
        isFullscreen ? 'fixed inset-4 z-50 max-w-none max-h-none' : 'h-[360px] sm:h-[460px]'
      }`}
    >
      {/* CAD Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#091122]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono pointer-events-auto">
          <Rotate3d className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span className="font-semibold text-white">{title}</span>
          <span className="text-slate-500">·</span>
          <span className="text-cyan-300">Orbit Active</span>
        </div>

        {/* View Preset Controls */}
        <div className="flex items-center gap-1.5 bg-[#091122]/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 pointer-events-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => handlePreset('iso')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              viewPreset === 'iso' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            ISO
          </button>
          <button
            type="button"
            onClick={() => handlePreset('top')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              viewPreset === 'top' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            TOP
          </button>
          <button
            type="button"
            onClick={() => handlePreset('front')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              viewPreset === 'front' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            FRONT
          </button>

          <button
            type="button"
            onClick={() => setWireframe(!wireframe)}
            title="Toggle Wireframe Mode"
            className={`p-1.5 rounded-lg transition-colors ${
              wireframe ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="Reset View"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Fullscreen"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing select-none relative flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Engineering 3D Grid */}
        <div className="absolute inset-0 bg-cad-grid opacity-40 pointer-events-none" />

        {/* 3D Object Transform Container */}
        <div
          style={{
            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="relative w-64 h-64 flex items-center justify-center pointer-events-none"
        >
          {/* Floor / Ground Plane */}
          <div
            style={{
              transform: 'rotateX(90deg) translateZ(-80px)',
              width: '280px',
              height: '280px'
            }}
            className="absolute rounded-2xl border border-cyan-500/20 bg-cyan-950/10 shadow-inner flex items-center justify-center"
          >
            <div className="w-full h-full bg-cad-grid opacity-60" />
          </div>

          {/* Model Geometry: Building or Chamber */}
          {modelType === 'building' ? (
            /* Multi-Story Building Geometry */
            <div className="relative w-40 h-52 preserve-3d">
              {/* Main Building Tower Block */}
              <div
                style={{ transform: 'translateZ(30px)' }}
                className={`absolute inset-0 rounded-lg ${
                  wireframe
                    ? 'border-2 border-cyan-400 bg-transparent'
                    : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950/80 border border-cyan-500/40 shadow-2xl'
                } p-3 flex flex-col justify-between`}
              >
                {/* Floor slabs & glass balcony bands */}
                {[1, 2, 3, 4, 5].map((fl) => (
                  <div
                    key={fl}
                    className="w-full h-5 border-b border-cyan-400/30 flex items-center justify-between px-1"
                  >
                    <span className="text-[8px] font-mono text-cyan-300">L0{fl}</span>
                    <div className="flex gap-1">
                      <div className="w-5 h-2.5 bg-cyan-400/20 border border-cyan-400/40 rounded-sm" />
                      <div className="w-5 h-2.5 bg-cyan-400/20 border border-cyan-400/40 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Side facade extrusion */}
              <div
                style={{ transform: 'rotateY(90deg) translateZ(80px)', width: '60px', height: '208px' }}
                className={`absolute top-0 right-0 ${
                  wireframe ? 'border border-cyan-400 bg-transparent' : 'bg-slate-900/90 border border-cyan-500/30'
                }`}
              />

              {/* Roof Elevator Penthouse */}
              <div
                style={{ transform: 'translateZ(45px) translateY(-24px)', width: '50px', height: '24px' }}
                className={`absolute left-4 top-0 ${
                  wireframe ? 'border border-cyan-300' : 'bg-cyan-900/60 border border-cyan-400/50'
                }`}
              />
            </div>
          ) : (
            /* Valve Chamber & Pipe Assembly Geometry */
            <div className="relative w-48 h-36 preserve-3d">
              {/* Chamber Wall Box */}
              <div
                style={{ transform: 'translateZ(20px)' }}
                className={`absolute inset-0 rounded-xl ${
                  wireframe
                    ? 'border-2 border-cyan-400 bg-transparent'
                    : 'bg-[#091326] border border-cyan-500/50 shadow-2xl'
                } p-4 flex flex-col justify-between`}
              >
                {/* Horizontal Pipe Header */}
                <div className="relative w-full h-8 bg-cyan-500/20 border-y-2 border-cyan-400 flex items-center justify-between px-2 my-auto">
                  <div className="w-3 h-10 -ml-2 bg-cyan-400 rounded-sm border border-white" />
                  <span className="text-[9px] font-mono text-cyan-300 font-bold">DN300 DI</span>
                  {/* Central Butterfly Valve Body */}
                  <div className="w-8 h-10 bg-amber-500/30 border-2 border-amber-400 rounded flex items-center justify-center">
                    <div className="w-1.5 h-6 bg-amber-300" />
                  </div>
                  <span className="text-[9px] font-mono text-cyan-300 font-bold">ISOLATION</span>
                  <div className="w-3 h-10 -mr-2 bg-cyan-400 rounded-sm border border-white" />
                </div>

                <div className="text-[9px] font-mono text-slate-400 text-center">
                  RCC CHAMBER WALL: 250mm · SUMP LEVEL: -2.40m
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orbit Helper Cue */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none bg-slate-950/70 backdrop-blur-sm p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">Click & Drag:</span>
            <span>Rotate 360°</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">Pitch:</span>
            <span>{Math.round(rotation.x)}°</span>
            <span className="text-cyan-400">Yaw:</span>
            <span>{Math.round(rotation.y)}°</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1 hover:text-white text-slate-400 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-cyan-300">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              className="p-1 hover:text-white text-slate-400 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
