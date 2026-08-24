import React, { useMemo } from 'react';

interface SpaceBackgroundProps {
  showGrid?: boolean;
  showStarfield?: boolean;
}

interface Star {
  x: number;
  y: number;
  r: number;
  opacity: number;
  color: string;
  twinkleDuration?: number;
}

export const SpaceBackground: React.FC<SpaceBackgroundProps> = React.memo(({
  showGrid = true,
  showStarfield = true,
}) => {
  // Generate deterministic, elegant mathematical stars across the universe coordinate frame (-1600 to +1600)
  const stars: Star[] = useMemo(() => {
    const starList: Star[] = [];
    const colors = ['#ffffff', '#bae6fd', '#c7d2fe', '#e0f2fe', '#f8fafc', '#a5f3fc'];

    // Seeded pseudo-random generator
    let seed = 42893;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Distribute 380 clean, sharp stars across the universe canvas
    for (let i = 0; i < 380; i++) {
      const x = (random() - 0.5) * 3600;
      const y = (random() - 0.5) * 2600;
      const r = random() < 0.85 ? 0.6 + random() * 0.7 : 1.4 + random() * 0.8;
      const opacity = 0.2 + random() * 0.75;
      const color = colors[Math.floor(random() * colors.length)];
      const twinkleDuration = 3 + random() * 6;

      starList.push({ x, y, r, opacity, color, twinkleDuration });
    }

    return starList;
  }, []);

  return (
    <g className="space-background-layer pointer-events-none select-none">
      {/* 1. Deep Space Base Solid Void */}
      <rect x="-2400" y="-1800" width="4800" height="3600" fill="#030712" />

      {/* 2. Soft Volumetric Nebula Clouds (GPU Accelerated Radial Gradients) */}
      <g className="nebula-clouds mix-blend-screen pointer-events-none">
        <ellipse cx="-400" cy="-250" rx="900" ry="600" fill="url(#nebula-cyan-gradient)" />
        <ellipse cx="600" cy="350" rx="1100" ry="750" fill="url(#nebula-cyan-gradient)" />
        <ellipse cx="-600" cy="400" rx="850" ry="550" fill="url(#nebula-indigo-gradient)" />
        <ellipse cx="450" cy="-450" rx="750" ry="480" fill="url(#nebula-purple-gradient)" />
        <ellipse cx="0" cy="0" rx="700" ry="480" fill="url(#nebula-cyan-gradient)" />
      </g>

      {/* 3. Astronomical Coordinate Grids & Polar Degrees */}
      {showGrid && (
        <g className="engineering-grids opacity-20">
          {/* Concentric Galactic Distance Rings */}
          {[300, 600, 900, 1200, 1500, 1800].map((radius) => (
            <circle
              key={`grid-r-${radius}`}
              cx="0"
              cy="0"
              r={radius}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.6"
              strokeDasharray="4, 12"
            />
          ))}

          {/* Coordinate Axes */}
          <line x1="-2000" y1="0" x2="2000" y2="0" stroke="#0ea5e9" strokeWidth="0.75" strokeDasharray="6, 6" />
          <line x1="0" y1="-1400" x2="0" y2="1400" stroke="#0ea5e9" strokeWidth="0.75" strokeDasharray="6, 6" />

          {/* Radial Degree Guides (Every 30 degrees) */}
          {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x2 = Math.cos(rad) * 1600;
            const y2 = Math.sin(rad) * 1600;
            return (
              <g key={`radial-deg-${deg}`}>
                <line x1="0" y1="0" x2={x2} y2={y2} stroke="#0284c7" strokeWidth="0.4" strokeDasharray="2, 8" />
                <text
                  x={Math.cos(rad) * 1620}
                  y={Math.sin(rad) * 1620}
                  fill="#7dd3fc"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  opacity="0.6"
                >
                  {deg}°
                </text>
              </g>
            );
          })}

          {/* Technical Telemetry Crosshairs in Corners */}
          {[-1200, 1200].map((cx) =>
            [-800, 800].map((cy) => (
              <g key={`cross-${cx}-${cy}`} transform={`translate(${cx}, ${cy})`}>
                <line x1="-15" y1="0" x2="15" y2="0" stroke="#38bdf8" strokeWidth="1" />
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#38bdf8" strokeWidth="1" />
                <rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2, 2" />
                <text x="14" y="14" fill="#0284c7" fontSize="8" fontFamily="monospace">
                  X:{cx} Y:{cy}
                </text>
              </g>
            ))
          )}
        </g>
      )}

      {/* 4. Thousands of Subtle Stars */}
      {showStarfield && (
        <g className="starfield-layer">
          {stars.map((star, idx) => (
            <circle
              key={`star-${idx}`}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill={star.color}
              opacity={star.opacity}
              style={{
                animation: star.r > 1.2 ? `starTwinkle ${star.twinkleDuration}s infinite ease-in-out` : undefined,
              }}
            />
          ))}

          {/* Shooting Stars / Meteor Streaks */}
          <g className="shooting-stars-layer opacity-70">
            <line x1="-800" y1="-500" x2="-680" y2="-420" stroke="url(#rocket-ion-flame)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <circle cx="-680" cy="-420" r="1.5" fill="#ffffff" filter="url(#holo-glow)" />

            <line x1="700" y1="-300" x2="850" y2="-210" stroke="url(#rocket-ion-flame)" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
            <circle cx="850" cy="-210" r="2" fill="#ffffff" filter="url(#holo-glow)" />

            <line x1="-400" y1="600" x2="-260" y2="680" stroke="url(#rocket-ion-flame)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            <circle cx="-260" cy="680" r="1.2" fill="#ffffff" />
          </g>
        </g>
      )}
    </g>
  );
});
