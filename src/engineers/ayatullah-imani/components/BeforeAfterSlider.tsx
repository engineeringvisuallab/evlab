import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight, Layers, Sparkles } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  beforeLabel?: string;
  afterImage: string;
  afterLabel?: string;
  title?: string;
  description?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  beforeLabel = '2D CAD Engineering Blueprint',
  afterImage,
  afterLabel = '3D Photorealistic Rendered Reality',
  title = '2D Drafting to 3D Visualization Comparison',
  description = 'Drag the slider to inspect the precise translation from multi-layered AutoCAD drawings to high-end architectural rendering.'
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div className="w-full rounded-2xl bg-[#070d1c] border border-cyan-950/80 p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/40 shrink-0">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Interactive Split Slider</span>
        </div>
      </div>

      {/* Slider Viewport Container */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[280px] sm:h-[400px] rounded-xl overflow-hidden cursor-ew-resize select-none border border-slate-800"
      >
        {/* Background Layer: AFTER (3D Render) */}
        <div className="absolute inset-0">
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono text-cyan-300 border border-cyan-500/30">
            {afterLabel}
          </div>
        </div>

        {/* Foreground Layer: BEFORE (2D CAD Blueprint) clipped */}
        <div
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          className="absolute inset-0 transition-none"
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-cover filter contrast-125"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3 bg-[#080d1a]/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono text-amber-300 border border-amber-500/30">
            {beforeLabel}
          </div>
        </div>

        {/* Draggable Divider Line & Handle */}
        <div
          style={{ left: `${sliderPosition}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] flex items-center justify-center pointer-events-none"
        >
          <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xl border-2 border-white pointer-events-auto cursor-grab active:cursor-grabbing">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-500">
        <span>← Drag left for 3D Render</span>
        <span>Drag right for 2D CAD Blueprint →</span>
      </div>
    </div>
  );
}
