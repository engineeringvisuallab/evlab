import React from 'react';

export const SpaceSvgDefs: React.FC = () => {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        {/* ========================================================================= */}
        {/* 1. ATMOSPHERIC & SPHERICAL SHADING FILTERS                                */}
        {/* ========================================================================= */}

        {/* Deep Core Glow */}
        <filter id="core-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="32" result="blur2" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="64" result="blur3" />
          <feMerge>
            <feMergeNode in="blur3" />
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Planet Atmospheric Glow */}
        <filter id="atmosphere-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle Orbital Line Glow */}
        <filter id="orbit-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Holographic HUD Glow */}
        <filter id="holo-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feComponentTransfer in="blur" result="boost">
            <feFuncA type="linear" slope="1.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="boost" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ========================================================================= */}
        {/* 2. CORE NUCLEUS RADIAL GRADIENTS                                          */}
        {/* ========================================================================= */}

        <radialGradient id="core-sun-gradient" cx="50%" cy="50%" r="50%" fx="42%" fy="42%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="15%" stopColor="#a5f3fc" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#0284c7" stopOpacity="0.6" />
          <stop offset="85%" stopColor="#0369a1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#082f49" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="core-corona-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#0284c7" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="nebula-cyan-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#082f49" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#030712" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="nebula-indigo-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4338ca" stopOpacity="0.3" />
          <stop offset="55%" stopColor="#1e1b4b" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#030712" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="nebula-purple-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6b21a8" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#3b0764" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#030712" stopOpacity="0" />
        </radialGradient>

        {/* ========================================================================= */}
        {/* 3. 2.5D PLANETARY SHADOW & ILLUMINATION MASKS                              */}
        {/* ========================================================================= */}

        {/* Spherical Shadow Hemisphere: Left illuminated by Core (x=0, y=0), Right in shadow */}
        <linearGradient id="sphere-shadow-overlay" x1="15%" y1="20%" x2="90%" y2="85%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.0" />
          <stop offset="65%" stopColor="#000000" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
        </linearGradient>

        <radialGradient id="sphere-specular-highlight" cx="30%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="80%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* ========================================================================= */}
        {/* 4. VECTOR ENGINEERING TEXTURE PATTERNS                                    */}
        {/* ========================================================================= */}

        {/* BIM Wireframe Texture */}
        <pattern id="pat-bim" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#60a5fa" strokeWidth="0.75" strokeOpacity="0.35" />
          <rect x="2" y="2" width="6" height="6" fill="none" stroke="#93c5fd" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="8" y1="2" x2="16" y2="8" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.3" />
          <circle cx="10" cy="10" r="1" fill="#bfdbfe" fillOpacity="0.6" />
        </pattern>

        {/* CAD Geometry Texture */}
        <pattern id="pat-cad" width="24" height="24" patternUnits="userSpaceOnUse">
          <line x1="0" y1="12" x2="24" y2="12" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="3,2" strokeOpacity="0.4" />
          <line x1="12" y1="0" x2="12" y2="24" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="3,2" strokeOpacity="0.4" />
          <circle cx="12" cy="12" r="6" fill="none" stroke="#67e8f9" strokeWidth="0.5" strokeOpacity="0.35" />
          <circle cx="12" cy="12" r="1" fill="#cffafe" fillOpacity="0.8" />
        </pattern>

        {/* GIS Terrain Contours Texture */}
        <pattern id="pat-gis" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 0 15 Q 8 8, 15 15 T 30 15" fill="none" stroke="#34d399" strokeWidth="0.75" strokeOpacity="0.45" />
          <path d="M 0 6 Q 10 2, 18 8 T 30 6" fill="none" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.3" />
          <path d="M 0 24 Q 12 28, 20 22 T 30 24" fill="none" stroke="#059669" strokeWidth="0.5" strokeOpacity="0.35" />
          <circle cx="15" cy="15" r="1.5" fill="#6ee7b7" fillOpacity="0.7" />
        </pattern>

        {/* Water Pipelines Texture */}
        <pattern id="pat-water" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M 0 14 H 28 M 14 0 V 28" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.4" />
          <circle cx="14" cy="14" r="3.5" fill="none" stroke="#0ea5e9" strokeWidth="0.75" strokeOpacity="0.5" />
          <path d="M 4 8 L 8 4 M 20 24 L 24 20" stroke="#7dd3fc" strokeWidth="0.6" strokeOpacity="0.4" />
          <circle cx="14" cy="14" r="1" fill="#e0f2fe" fillOpacity="0.9" />
        </pattern>

        {/* Sewer Network Texture */}
        <pattern id="pat-sewer" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 0 0 L 24 24 M 24 0 L 0 24" stroke="#a78bfa" strokeWidth="0.6" strokeOpacity="0.35" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="#8b5cf6" strokeWidth="0.75" strokeOpacity="0.5" />
          <circle cx="12" cy="12" r="1.5" fill="#c4b5fd" fillOpacity="0.8" />
        </pattern>

        {/* Structure Truss & Steel Frame Texture */}
        <pattern id="pat-structure" width="26" height="26" patternUnits="userSpaceOnUse">
          <polygon points="0,0 26,0 13,26" fill="none" stroke="#fbbf24" strokeWidth="0.6" strokeOpacity="0.4" />
          <polygon points="0,26 26,26 13,0" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.3" />
          <circle cx="13" cy="13" r="1.5" fill="#fde68a" fillOpacity="0.85" />
        </pattern>

        {/* Hydraulic Vector Field Texture */}
        <pattern id="pat-hydraulics" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 2 12 Q 12 4, 22 12" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.4" />
          <polygon points="22,12 18,9 18,15" fill="#38bdf8" fillOpacity="0.5" />
          <circle cx="6" cy="18" r="1" fill="#bae6fd" fillOpacity="0.7" />
        </pattern>

        {/* Simulation Mesh Texture */}
        <pattern id="pat-simulation" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M 0 0 L 22 11 L 0 22 Z M 22 0 L 0 11 L 22 22 Z" fill="none" stroke="#f472b6" strokeWidth="0.5" strokeOpacity="0.35" />
          <circle cx="11" cy="11" r="1.2" fill="#fbcfe8" fillOpacity="0.8" />
        </pattern>

        {/* Material Crystal Lattice Texture */}
        <pattern id="pat-materials" width="24" height="24" patternUnits="userSpaceOnUse">
          <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="none" stroke="#94a3b8" strokeWidth="0.6" strokeOpacity="0.4" />
          <line x1="12" y1="2" x2="12" y2="22" stroke="#64748b" strokeWidth="0.4" strokeOpacity="0.3" />
          <circle cx="12" cy="12" r="1.5" fill="#cbd5e1" fillOpacity="0.8" />
        </pattern>

        {/* AI Neural Nodes Texture */}
        <pattern id="pat-ai" width="28" height="28" patternUnits="userSpaceOnUse">
          <line x1="4" y1="6" x2="24" y2="22" stroke="#c4b5fd" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="4" y1="22" x2="24" y2="6" stroke="#c4b5fd" strokeWidth="0.5" strokeOpacity="0.4" />
          <circle cx="4" cy="6" r="2" fill="#a78bfa" fillOpacity="0.7" />
          <circle cx="24" cy="22" r="2" fill="#8b5cf6" fillOpacity="0.7" />
          <circle cx="14" cy="14" r="2.5" fill="#ddd6fe" fillOpacity="0.9" />
        </pattern>

        {/* UELE Engineering Diagram Texture */}
        <pattern id="pat-uele" width="26" height="26" patternUnits="userSpaceOnUse">
          <rect x="3" y="3" width="20" height="20" rx="3" fill="none" stroke="#2dd4bf" strokeWidth="0.6" strokeOpacity="0.35" />
          <circle cx="13" cy="13" r="5" fill="none" stroke="#14b8a6" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="3" y1="13" x2="23" y2="13" stroke="#5eead4" strokeWidth="0.5" strokeOpacity="0.3" />
        </pattern>

        {/* Projects Blocks Texture */}
        <pattern id="pat-projects" width="28" height="28" patternUnits="userSpaceOnUse">
          <rect x="2" y="2" width="10" height="7" rx="1" fill="none" stroke="#818cf8" strokeWidth="0.6" strokeOpacity="0.4" />
          <rect x="15" y="2" width="10" height="7" rx="1" fill="none" stroke="#6366f1" strokeWidth="0.6" strokeOpacity="0.4" />
          <rect x="5" y="14" width="18" height="9" rx="1" fill="none" stroke="#a5b4fc" strokeWidth="0.6" strokeOpacity="0.4" />
          <circle cx="14" cy="18" r="1.5" fill="#c7d2fe" fillOpacity="0.8" />
        </pattern>

        {/* ========================================================================= */}
        {/* 5. SPACECRAFT, SATELLITES & COMET ASSET GRADIENTS & PATTERNS              */}
        {/* ========================================================================= */}

        {/* Solar Cell Grid Pattern for Satellites & Space Stations */}
        <pattern id="pat-solar-cells" width="12" height="8" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="12" height="8" fill="#0f172a" stroke="#0284c7" strokeWidth="0.5" />
          <line x1="6" y1="0" x2="6" y2="8" stroke="#38bdf8" strokeWidth="0.4" strokeOpacity="0.7" />
          <line x1="0" y1="4" x2="12" y2="4" stroke="#38bdf8" strokeWidth="0.4" strokeOpacity="0.7" />
          <circle cx="6" cy="4" r="0.8" fill="#38bdf8" fillOpacity="0.9" />
        </pattern>

        {/* Satellite Gold Thermal Foil Pattern */}
        <pattern id="pat-gold-foil" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="10" height="10" fill="#78350f" />
          <line x1="0" y1="0" x2="10" y2="10" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.6" />
          <line x1="0" y1="10" x2="10" y2="0" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.6" />
        </pattern>

        {/* Rocket Plasma Exhaust Flame Gradient (Cyan Ion / Fusion Drive) */}
        <linearGradient id="rocket-ion-flame" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="20%" stopColor="#67e8f9" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.75" />
          <stop offset="80%" stopColor="#0284c7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#082f49" stopOpacity="0" />
        </linearGradient>

        {/* Heavy Rocket Chemical / Kerolox Flame Gradient */}
        <linearGradient id="rocket-chemical-flame" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="15%" stopColor="#fef08a" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#f97316" stopOpacity="0.8" />
          <stop offset="75%" stopColor="#dc2626" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
        </linearGradient>

        {/* Spacecraft Metallic Hull Gradient */}
        <linearGradient id="hull-metal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="30%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Comet Glowing Particle Tail Gradient */}
        <linearGradient id="comet-tail-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="15%" stopColor="#67e8f9" stopOpacity="0.8" />
          <stop offset="45%" stopColor="#0284c7" stopOpacity="0.4" />
          <stop offset="80%" stopColor="#0369a1" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#082f49" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};
