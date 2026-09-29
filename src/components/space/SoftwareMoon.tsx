import React from 'react';
import { SoftwareMoon as SoftwareMoonType } from '../../types/space';

interface SoftwareMoonProps {
  moon: SoftwareMoonType;
  planetColor: string;
  planetGlow: string;
  planetAccent: string;
  isSelected?: boolean;
  isHovered?: boolean;
  angle: number; // Current orbital angle in degrees
  distance: number; // Current orbital radius in pixels
  onClick?: (moon: SoftwareMoonType) => void;
  onHover?: (moonId: string | null) => void;
}

export const SoftwareMoon: React.FC<SoftwareMoonProps> = React.memo(({
  moon,
  planetColor,
  planetGlow,
  planetAccent,
  isSelected = false,
  isHovered = false,
  angle,
  distance,
  onClick,
  onHover,
}) => {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * distance;
  const y = Math.sin(rad) * distance;

  // Dynamic pill sizing for crystal-clear readability
  const nameLength = moon.name.length;
  const badgeWidth = Math.max(nameLength * 8.8 + 32, 105);
  const badgeHeight = isSelected || isHovered ? 34 : 26;
  const sphereRadius = isSelected ? 16 : isHovered ? 14 : 11;

  return (
    <g
      className="software-moon-group cursor-pointer select-none"
      transform={`translate(${x}, ${y})`}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick(moon);
      }}
      onMouseEnter={() => onHover && onHover(moon.id)}
      onMouseLeave={() => onHover && onHover(null)}
    >
      {/* 1. Ambient Glow on Hover / Select */}
      {(isHovered || isSelected) && (
        <circle cx="0" cy="0" r={sphereRadius * 2.2} fill={planetGlow} opacity="0.8" filter="url(#atmosphere-glow)" />
      )}

      {/* 2. Target reticle / radar bracket on hover/select */}
      {(isHovered || isSelected) && (
        <circle
          cx="0"
          cy="0"
          r={sphereRadius + 6}
          fill="none"
          stroke={planetAccent}
          strokeWidth="1.5"
          strokeDasharray="4, 4"
          opacity="0.8"
        />
      )}

      {/* 3. Moon Body Sphere */}
      <circle
        cx="0"
        cy="0"
        r={sphereRadius}
        fill="#020617"
        stroke={isSelected ? '#ffffff' : planetAccent}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />
      <circle
        cx="0"
        cy="0"
        r={sphereRadius - 2.5}
        fill={planetColor}
        fillOpacity={isSelected ? 0.95 : 0.8}
      />

      {/* 4. Small Inner Core Light */}
      <circle cx="0" cy="0" r="3" fill="#ffffff" opacity="0.95" />

      {/* 5. Pointer Anchor Stem to Label */}
      <line
        x1="0"
        y1={sphereRadius}
        x2="0"
        y2={sphereRadius + 10}
        stroke={isSelected ? '#ffffff' : planetAccent}
        strokeWidth="1.2"
        opacity={isHovered || isSelected ? 0.9 : 0.6}
      />

      {/* 6. Software Label Badge Pill */}
      <g
        transform={`translate(0, ${sphereRadius + 10 + badgeHeight / 2})`}
        textAnchor="middle"
        className="pointer-events-none"
      >
        {/* Background Pill */}
        <rect
          x={-badgeWidth / 2}
          y={-badgeHeight / 2}
          width={badgeWidth}
          height={badgeHeight}
          rx="6"
          fill="#020617"
          fillOpacity={isSelected || isHovered ? "0.96" : "0.88"}
          stroke={isSelected ? '#ffffff' : isHovered ? planetAccent : planetColor}
          strokeWidth={isSelected ? "1.8" : "1.2"}
          filter={isSelected || isHovered ? "url(#holo-glow)" : undefined}
        />

        {/* Software Name */}
        <text
          x="0"
          y={isSelected || isHovered ? -3 : 4}
          fill="#ffffff"
          fontSize="13"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.3"
        >
          {moon.name}
        </text>

        {/* Sub-label (ShortCode / Category on hover or select) */}
        {(isSelected || isHovered) && (
          <text
            x="0"
            y="11"
            fill={planetAccent}
            fontSize="9"
            fontWeight="700"
            fontFamily="monospace"
            letterSpacing="0.8"
          >
            {moon.shortCode} • {moon.category}
          </text>
        )}
      </g>
    </g>
  );
});
