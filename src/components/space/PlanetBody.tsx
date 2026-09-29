import React from 'react';
import { PlanetData } from '../../types/space';

interface PlanetBodyProps {
  planet: PlanetData;
  x: number;
  y: number;
  isHovered?: boolean;
  isSelected?: boolean;
  isDimmed?: boolean;
  showLabels?: boolean;
  onHover?: (id: PlanetData['id'] | null) => void;
  onClick?: (planet: PlanetData) => void;
}

export const PlanetBody: React.FC<PlanetBodyProps> = React.memo(({
  planet,
  x,
  y,
  isHovered = false,
  isSelected = false,
  isDimmed = false,
  showLabels = true,
  onHover,
  onClick,
}) => {
  const { color, size, name, subtitle, textureType, ringSystem, specs } = planet;
  const radius = size * (isSelected ? 1.3 : isHovered ? 1.15 : 1);

  // Determine lighting angle from EVLab Core (at 0,0) to Planet (x,y)
  const angleToCore = Math.atan2(0 - y, 0 - x) * (180 / Math.PI);

  return (
    <g
      className={`planet-entity-group cursor-pointer transition-opacity duration-500 ${
        isDimmed ? 'opacity-25' : 'opacity-100'
      }`}
      transform={`translate(${x}, ${y})`}
      onMouseEnter={() => onHover && onHover(planet.id)}
      onMouseLeave={() => onHover && onHover(null)}
      onClick={() => onClick && onClick(planet)}
    >
      {/* ========================================================================= */}
      {/* 1. OUTER ATMOSPHERIC RIM GLOW                                             */}
      {/* ========================================================================= */}
      <circle
        cx="0"
        cy="0"
        r={radius * 1.3}
        fill={color.glow}
        opacity={isHovered || isSelected ? 0.75 : 0.4}
        filter="url(#atmosphere-glow)"
      />

      {/* ========================================================================= */}
      {/* 2. PLANETARY RING SYSTEM (IF DEFINED) - REAR PASS                         */}
      {/* ========================================================================= */}
      {ringSystem && (
        <g transform={`rotate(${ringSystem.tiltDeg})`}>
          <ellipse
            cx="0"
            cy="0"
            rx={radius * 1.7}
            ry={radius * 0.45}
            fill="none"
            stroke={ringSystem.color}
            strokeWidth="2"
            strokeDasharray={ringSystem.strokeDasharray || 'none'}
            opacity="0.6"
          />
        </g>
      )}

      {/* ========================================================================= */}
      {/* 3. 2.5D PSEUDO-3D SPHERICAL BODY WITH SVG MASK                            */}
      {/* ========================================================================= */}
      <g>
        {/* Base Solid Planetary Core */}
        <circle cx="0" cy="0" r={radius} fill={color.darkSurface} stroke={color.primary} strokeWidth="1" />

        {/* Vector Engineering Texture Surface */}
        <circle
          cx="0"
          cy="0"
          r={radius}
          fill={`url(#pat-${textureType.split('_')[0]})`}
          opacity="0.85"
        />

        {/* Technical Latitude / Longitude Arc Grids */}
        <g opacity="0.35" transform={`rotate(${angleToCore})`}>
          <ellipse cx="0" cy="0" rx={radius * 0.95} ry={radius * 0.35} fill="none" stroke={color.accent} strokeWidth="0.6" />
          <ellipse cx="0" cy="0" rx={radius * 0.95} ry={radius * 0.65} fill="none" stroke={color.accent} strokeWidth="0.5" />
          <line x1={-radius} y1="0" x2={radius} y2="0" stroke={color.accent} strokeWidth="0.5" strokeDasharray="3, 3" />
        </g>

        {/* Spherical Directional Shadow (Dark hemisphere away from Core) */}
        <circle
          cx="0"
          cy="0"
          r={radius}
          fill="url(#sphere-shadow-overlay)"
          transform={`rotate(${angleToCore + 180})`}
        />

        {/* Specular Highlight on Core-Facing Limb */}
        <circle
          cx="0"
          cy="0"
          r={radius}
          fill="url(#sphere-specular-highlight)"
          transform={`rotate(${angleToCore})`}
          opacity="0.7"
        />

        {/* Atmospheric Rim Edge Line */}
        <circle
          cx="0"
          cy="0"
          r={radius}
          fill="none"
          stroke={color.accent}
          strokeWidth={isHovered || isSelected ? 1.8 : 0.8}
          opacity={isHovered || isSelected ? 0.9 : 0.6}
        />
      </g>

      {/* ========================================================================= */}
      {/* 4. PLANETARY RING SYSTEM - FOREGROUND PASS                                */}
      {/* ========================================================================= */}
      {ringSystem && (
        <g transform={`rotate(${ringSystem.tiltDeg})`}>
          <path
            d={`M ${-radius * 1.7} 0 A ${radius * 1.7} ${radius * 0.45} 0 0 0 ${radius * 1.7} 0`}
            fill="none"
            stroke={ringSystem.color}
            strokeWidth="2.5"
            opacity="0.85"
          />
        </g>
      )}

      {/* ========================================================================= */}
      {/* 5. ORBITING MICRO-PARTICLES AROUND PLANET                                 */}
      {/* ========================================================================= */}
      {(isHovered || isSelected) && (
        <g className="animate-spin-slow" style={{ transformOrigin: '0 0', animationDuration: '12s' }}>
          <circle cx={radius + 14} cy="0" r="1.5" fill={color.accent} />
          <circle cx={-(radius + 18)} cy="6" r="1" fill="#ffffff" />
          <circle cx="4" cy={radius + 16} r="1.2" fill={color.primary} />
        </g>
      )}

      {/* ========================================================================= */}
      {/* 6. HOLOGRAPHIC SCIENTIFIC LABEL & TELEMETRY HUD                           */}
      {/* ========================================================================= */}
      {showLabels && (
        <g
          transform={`translate(0, ${radius + 20})`}
          className="select-none transition-all duration-300"
          textAnchor="middle"
        >
          {/* Always-on High-Contrast Backdrop Pill */}
          <rect
            x={isSelected || isHovered ? -85 : -70}
            y={isSelected || isHovered ? -16 : -14}
            width={isSelected || isHovered ? 170 : 140}
            height={isSelected || isHovered ? 48 : 36}
            rx="8"
            fill="#020617"
            fillOpacity={isSelected || isHovered ? "0.95" : "0.82"}
            stroke={isSelected ? '#ffffff' : isHovered ? color.accent : color.primary}
            strokeWidth={isSelected ? "2" : "1"}
            filter={isSelected || isHovered ? "url(#holo-glow)" : undefined}
          />

          {/* Primary Name */}
          <text
            x="0"
            y={isSelected || isHovered ? -1 : 1}
            fill="#ffffff"
            fontSize={isSelected || isHovered ? "17" : "15"}
            fontWeight="900"
            letterSpacing="2"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {name}
          </text>

          {/* Subtitle / Engineering Domain */}
          <text
            x="0"
            y={isSelected || isHovered ? 14 : 14}
            fill={color.accent}
            fontSize="10"
            fontWeight="700"
            letterSpacing="0.8"
            fontFamily="monospace"
            opacity="0.95"
          >
            {subtitle.toUpperCase()}
          </text>

          {/* Telemetry Tag on Hover/Select */}
          {(isHovered || isSelected) && (
            <text
              x="0"
              y="26"
              fill="#94a3b8"
              fontSize="8.5"
              fontWeight="600"
              fontFamily="monospace"
              opacity="0.9"
            >
              {specs.moduleCount} MODS • {specs.toolCount} TOOLS
            </text>
          )}
        </g>
      )}
    </g>
  );
});
