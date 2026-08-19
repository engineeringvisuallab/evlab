import React, { useState } from 'react';
import { heroDiorama } from '@/assets/images';

export interface Hero3DCanvasProps {
  onNavigate: (sectionId: string, param?: string) => void;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ onNavigate }) => {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  // 6 Sectors with exact positions matching reference image
  const sectors = [
    {
      id: 'water',
      title: 'WATER',
      subtitle: 'TREATMENT PLANT',
      coords: 'top-[18%] left-[10%]',
      dotColor: 'bg-blue-400',
      ueleParam: 'focus=water-wtp',
    },
    {
      id: 'smart-city',
      title: 'SMART CITY',
      subtitle: 'INFRASTRUCTURE',
      coords: 'top-[10%] right-[22%]',
      dotColor: 'bg-cyan-400',
      ueleParam: 'focus=urban',
    },
    {
      id: 'energy',
      title: 'ENERGY',
      subtitle: 'GRID',
      coords: 'top-[28%] right-[2%]',
      dotColor: 'bg-amber-400',
      ueleParam: 'focus=power',
    },
    {
      id: 'transportation',
      title: 'TRANSPORTATION',
      subtitle: 'SYSTEMS',
      coords: 'bottom-[36%] left-[8%]',
      dotColor: 'bg-purple-400',
      ueleParam: 'focus=transportation',
    },
    {
      id: 'agriculture',
      title: 'AGRICULTURE',
      subtitle: '& IRRIGATION',
      coords: 'bottom-[10%] right-[32%]',
      dotColor: 'bg-emerald-400',
      ueleParam: 'focus=agricultural',
    },
    {
      id: 'industrial',
      title: 'INDUSTRIAL',
      subtitle: 'PLANTS',
      coords: 'bottom-[22%] right-[4%]',
      dotColor: 'bg-sky-400',
      ueleParam: 'focus=industrial',
    },
  ];

  return (
    <div
      id="hero-3d-holographic-diorama"
      className="relative w-full max-w-[720px] aspect-[1.38/1] mx-auto flex items-center justify-center select-none"
    >
      {/* Ambient background glow behind 3D render */}
      <div className="absolute inset-x-8 bottom-6 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* 3D Photorealistic Island Render */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 bg-[#050811]">
        <img
          src={heroDiorama}
          alt="EVLab 3D Engineering Digital Twin Universe"
          className="w-full h-full object-cover filter contrast-[1.05] brightness-[1.02]"
          referrerPolicy="no-referrer"
        />

        {/* 6 FLOATING HUD CALLOUT BADGES EXACTLY AS IN REFERENCE IMAGE */}
        {sectors.map((sec) => {
          const isHovered = hoveredSector === sec.id;
          return (
            <div
              key={sec.id}
              className={`absolute ${sec.coords} z-20 transition-all duration-300 transform`}
              onMouseEnter={() => setHoveredSector(sec.id)}
              onMouseLeave={() => setHoveredSector(null)}
            >
              <button
                type="button"
                onClick={() => onNavigate('uele', sec.ueleParam)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#070D1C]/90 border backdrop-blur-md shadow-2xl transition-all cursor-pointer group ${
                  isHovered
                    ? 'border-cyan-400 scale-105 shadow-cyan-500/30'
                    : 'border-slate-700/80 hover:border-slate-500 shadow-black/80'
                }`}
              >
                {/* Glowing Dot */}
                <span className={`w-2 h-2 rounded-full ${sec.dotColor} shadow-[0_0_8px_currentColor] animate-pulse`} />

                {/* Text Label */}
                <div className="text-left font-sans">
                  <div className="text-[11px] font-bold text-slate-100 tracking-wider group-hover:text-cyan-300 transition-colors leading-tight">
                    {sec.title}
                  </div>
                  <div className="text-[8px] font-mono text-slate-400 font-semibold tracking-widest leading-none">
                    {sec.subtitle}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
