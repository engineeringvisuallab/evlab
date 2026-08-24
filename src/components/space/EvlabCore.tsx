import React from 'react';
import { EVLAB_CORE_DATA } from '../../data/spaceData';

interface EvlabCoreProps {
  isRotating?: boolean;
  onClick?: () => void;
}

export const EvlabCore: React.FC<EvlabCoreProps> = React.memo(({ isRotating = true, onClick }) => {
  return (
    <g className="evlab-core-group cursor-pointer group" onClick={onClick}>
      {/* ========================================================================= */}
      {/* 1. OUTER AMBIENT CORONA & VOLUMETRIC GLOW                                 */}
      {/* ========================================================================= */}
      <circle cx="0" cy="0" r="160" fill="url(#core-corona-gradient)" opacity="0.6" />
      <circle cx="0" cy="0" r="110" fill="#38bdf8" opacity="0.15" filter="url(#core-glow)" />

      {/* Outer Rotating Measurement Ring (Clockwise) */}
      <g
        className={isRotating ? 'animate-spin-slow' : ''}
        style={{ transformOrigin: '0px 0px', animationDuration: '60s' }}
      >
        <circle cx="0" cy="0" r="130" fill="none" stroke="#0ea5e9" strokeWidth="0.75" strokeDasharray="3, 9" opacity="0.4" />
        <circle cx="0" cy="0" r="142" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1, 14" opacity="0.3" />

        {/* Outer Orbiting Micro-Data Particles */}
        <circle cx="130" cy="0" r="2.5" fill="#38bdf8" filter="url(#atmosphere-glow)" />
        <circle cx="-130" cy="0" r="2" fill="#7dd3fc" />
        <circle cx="0" cy="130" r="2" fill="#a5f3fc" />
        <circle cx="0" cy="-130" r="2.5" fill="#38bdf8" />
      </g>

      {/* Middle Counter-Rotating Technical Ring (Counter-Clockwise) */}
      <g
        className={isRotating ? 'animate-spin-reverse' : ''}
        style={{ transformOrigin: '0px 0px', animationDuration: '45s' }}
      >
        <circle cx="0" cy="0" r="105" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="8, 6, 2, 6" opacity="0.55" />
        <circle cx="0" cy="0" r="95" fill="none" stroke="#0284c7" strokeWidth="0.75" opacity="0.35" />

        {/* 4 Cardinal Coordinate Ticks */}
        {[0, 90, 180, 270].map((deg) => (
          <line
            key={`core-tick-${deg}`}
            x1="92"
            y1="0"
            x2="108"
            y2="0"
            stroke="#7dd3fc"
            strokeWidth="1.2"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>

      {/* ========================================================================= */}
      {/* 2. ARTIFICIAL SUN NUCLEUS SPHERE                                          */}
      {/* ========================================================================= */}
      {/* Solid Radiating Core */}
      <circle cx="0" cy="0" r="80" fill="url(#core-sun-gradient)" filter="url(#atmosphere-glow)" />

      {/* Internal Rotating Latitude & Longitude Wireframe Grid */}
      <g
        className={isRotating ? 'animate-spin-slow' : ''}
        style={{ transformOrigin: '0px 0px', animationDuration: '30s' }}
        opacity="0.45"
      >
        <ellipse cx="0" cy="0" rx="78" ry="24" fill="none" stroke="#e0f2fe" strokeWidth="0.75" />
        <ellipse cx="0" cy="0" rx="78" ry="50" fill="none" stroke="#bae6fd" strokeWidth="0.5" />
        <ellipse cx="0" cy="0" rx="24" ry="78" fill="none" stroke="#e0f2fe" strokeWidth="0.75" />
        <ellipse cx="0" cy="0" rx="50" ry="78" fill="none" stroke="#bae6fd" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="78" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
      </g>

      {/* Inner Energy Pulse Halo */}
      <circle cx="0" cy="0" r="65" fill="#0284c7" opacity="0.2" className="animate-pulse" />

      {/* ========================================================================= */}
      {/* 3. CORE TYPOGRAPHY & BRANDING DISPLAY                                     */}
      {/* ========================================================================= */}
      <g className="core-branding select-none pointer-events-none" textAnchor="middle">
        {/* EVLab Typography */}
        <text
          x="0"
          y="-4"
          fill="#ffffff"
          fontSize="24"
          fontWeight="900"
          letterSpacing="2"
          fontFamily="system-ui, -apple-system, sans-serif"
          filter="drop-shadow(0 2px 8px rgba(2,132,199,0.8))"
        >
          EVLab
        </text>

        {/* Subtitle */}
        <text
          x="0"
          y="18"
          fill="#a5f3fc"
          fontSize="8"
          fontWeight="700"
          letterSpacing="3.5"
          fontFamily="monospace"
          opacity="0.9"
        >
          {EVLAB_CORE_DATA.subtitle}
        </text>

        {/* Active Node Status Badge Below */}
        <text
          x="0"
          y="32"
          fill="#38bdf8"
          fontSize="6.5"
          fontWeight="600"
          letterSpacing="1.5"
          fontFamily="monospace"
          opacity="0.75"
        >
          12 DOMAINS • DIGITAL TWIN
        </text>
      </g>

      {/* ========================================================================= */}
      {/* 4. BRAND MESSAGE SUBTLE TAG NEAR CORE                                     */}
      {/* ========================================================================= */}
      <g transform="translate(0, 185)" className="select-none pointer-events-none" textAnchor="middle">
        <rect
          x="-150"
          y="-14"
          width="300"
          height="28"
          rx="14"
          fill="#030712"
          fillOpacity="0.75"
          stroke="#0ea5e9"
          strokeWidth="0.75"
          strokeOpacity="0.4"
          filter="url(#holo-glow)"
        />
        <text
          x="0"
          y="-1"
          fill="#ffffff"
          fontSize="10"
          fontWeight="700"
          letterSpacing="1.2"
          fontFamily="system-ui, sans-serif"
        >
          {EVLAB_CORE_DATA.name}
        </text>
        <text
          x="0"
          y="10"
          fill="#7dd3fc"
          fontSize="7.5"
          fontWeight="500"
          letterSpacing="0.8"
          fontFamily="system-ui, sans-serif"
          opacity="0.85"
        >
          {EVLAB_CORE_DATA.brandMessage}
        </text>
      </g>
    </g>
  );
});
