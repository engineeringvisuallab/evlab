import React, { useState } from 'react';

interface SpaceCosmicAssetsProps {
  orbitalTime: number;
  isRotating: boolean;
}

interface TelemetryInfo {
  name: string;
  type: 'satellite' | 'rocket' | 'station' | 'comet' | 'probe';
  code: string;
  speed: string;
  altitude: string;
  status: string;
  purpose: string;
}

export const SpaceCosmicAssets: React.FC<SpaceCosmicAssetsProps> = React.memo(({
  orbitalTime,
  isRotating,
}) => {
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 1. Orbital Math Calculations
  // ---------------------------------------------------------------------------

  // Satellite 1: GeoSync Telemetry Relay (Mid Orbit: R=480, Inclined)
  const sat1Angle = (120 + (orbitalTime / 45) * 360) % 360;
  const sat1Rad = (sat1Angle * Math.PI) / 180;
  const sat1X = Math.cos(sat1Rad) * 520;
  const sat1Y = Math.sin(sat1Rad) * 320 - 40;

  // Satellite 2: Quantum CubeSat Duo (Inner Orbit: R=280)
  const sat2Angle = (45 - (orbitalTime / 30) * 360) % 360;
  const sat2Rad = (sat2Angle * Math.PI) / 180;
  const sat2X = Math.cos(sat2Rad) * 320;
  const sat2Y = Math.sin(sat2Rad) * 190;

  // Space Station: EVLab Orbital Nexus (R=650, Circular-ish)
  const stationAngle = (230 + (orbitalTime / 90) * 360) % 360;
  const stationRad = (stationAngle * Math.PI) / 180;
  const stationX = Math.cos(stationRad) * 680;
  const stationY = Math.sin(stationRad) * 440;

  // Rocket 1: EVLab Interplanetary Explorer Rocket (Hyperbolic Cruise Trajectory)
  // Glides in a grand sweeping path across the solar system
  const rocketCycle = ((orbitalTime / 50) % 1 + 1) % 1; // 0 to 1
  const rocketT = rocketCycle * 2 * Math.PI;
  const rocketX = Math.sin(rocketT) * 1100 + 100;
  const rocketY = Math.cos(rocketT * 2) * 450 - 50;
  // Calculate rocket heading angle
  const nextRocketT = ((rocketCycle + 0.01) % 1) * 2 * Math.PI;
  const nextRocketX = Math.sin(nextRocketT) * 1100 + 100;
  const nextRocketY = Math.cos(nextRocketT * 2) * 450 - 50;
  const rocketHeadingDeg = (Math.atan2(nextRocketY - rocketY, nextRocketX - rocketX) * 180) / Math.PI + 90;

  // Rocket 2: Heavy Booster Orbital Insertion Vehicle
  const rocket2Cycle = ((orbitalTime / 70 + 0.5) % 1 + 1) % 1;
  const r2T = rocket2Cycle * Math.PI * 2;
  const rocket2X = Math.cos(r2T) * 920 - 150;
  const rocket2Y = Math.sin(r2T) * 580 + 100;
  const nextR2T = ((rocket2Cycle + 0.01) % 1) * Math.PI * 2;
  const nextR2X = Math.cos(nextR2T) * 920 - 150;
  const nextR2Y = Math.sin(nextR2T) * 580 + 100;
  const rocket2HeadingDeg = (Math.atan2(nextR2Y - rocket2Y, nextR2X - rocket2X) * 180) / Math.PI + 90;

  // Deep Space Interstellar Probe (Voyager style - Outer System Escaping)
  const probeT = ((orbitalTime / 120 + 0.3) % 1 + 1) % 1;
  const probeX = -1300 + probeT * 2600;
  const probeY = -600 + Math.sin(probeT * 3.14) * 300;

  // Cosmic Comet with Glowing Tail (Transiting outer space)
  const cometCycle = ((orbitalTime / 40 + 0.7) % 1 + 1) % 1;
  const cometX = 1400 - cometCycle * 2800;
  const cometY = -750 + cometCycle * 600;

  return (
    <g className="cosmic-assets-layer select-none">
      {/* ========================================================================= */}
      {/* 1. COMET HALLEY-EVLAB (GLOWING ION & DUST TAIL)                           */}
      {/* ========================================================================= */}
      <g
        className="cosmic-comet cursor-pointer"
        transform={`translate(${cometX}, ${cometY}) rotate(-25)`}
        onMouseEnter={() => setHoveredAsset('comet')}
        onMouseLeave={() => setHoveredAsset(null)}
      >
        {/* Sweeping Radiant Ion Gas Tail */}
        <path
          d="M 0 -2 L 320 -28 L 340 0 L 320 28 L 0 2 Z"
          fill="url(#comet-tail-gradient)"
          opacity="0.7"
          filter="url(#atmosphere-glow)"
        />
        <path
          d="M 0 -1 L 220 -12 L 230 0 L 220 12 L 0 1 Z"
          fill="#cffafe"
          opacity="0.85"
        />

        {/* Comet Nucleus Head */}
        <circle cx="0" cy="0" r="7" fill="#ffffff" filter="url(#holo-glow)" />
        <circle cx="0" cy="0" r="3.5" fill="#a5f3fc" />
        <circle cx="-1" cy="-1" r="1.5" fill="#ffffff" />

        {/* Telemetry Tag on Hover */}
        {hoveredAsset === 'comet' && (
          <g transform="translate(0, 22)" className="pointer-events-none">
            <rect
              x="-65"
              y="-10"
              width="130"
              height="20"
              rx="4"
              fill="#020617"
              fillOpacity="0.95"
              stroke="#38bdf8"
              strokeWidth="1"
              filter="url(#holo-glow)"
            />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="9"
              fontWeight="800"
              fontFamily="monospace"
            >
              ☄ COMET C/EV-2026 • 58.4 km/s
            </text>
          </g>
        )}
      </g>

      {/* ========================================================================= */}
      {/* 2. EVLAB GEOSYNC TELEMETRY RELAY SATELLITE (SAT-01)                       */}
      {/* ========================================================================= */}
      <g
        className="satellite-geosync cursor-pointer"
        transform={`translate(${sat1X}, ${sat1Y})`}
        onMouseEnter={() => setHoveredAsset('sat1')}
        onMouseLeave={() => setHoveredAsset(null)}
      >
        {/* Pulsing Data Radio Arcs */}
        <circle
          cx="0"
          cy="0"
          r="28"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeDasharray="4, 6"
          opacity="0.6"
          className="animate-spin-slow"
        />
        <circle
          cx="0"
          cy="0"
          r="42"
          fill="none"
          stroke="#0284c7"
          strokeWidth="0.5"
          strokeDasharray="2, 8"
          opacity="0.4"
        />

        {/* Left Solar Panel Array Wing */}
        <g transform="translate(-24, -7)">
          <rect x="0" y="0" width="16" height="14" rx="1.5" fill="url(#pat-solar-cells)" stroke="#38bdf8" strokeWidth="0.75" />
          <line x1="16" y1="7" x2="20" y2="7" stroke="#94a3b8" strokeWidth="1.5" />
        </g>

        {/* Right Solar Panel Array Wing */}
        <g transform="translate(8, -7)">
          <line x1="-4" y1="7" x2="0" y2="7" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="0" y="0" width="16" height="14" rx="1.5" fill="url(#pat-solar-cells)" stroke="#38bdf8" strokeWidth="0.75" />
        </g>

        {/* Satellite Central Bus Body (Gold Thermal Foil) */}
        <rect
          x="-5"
          y="-6"
          width="10"
          height="12"
          rx="2"
          fill="url(#pat-gold-foil)"
          stroke="#f59e0b"
          strokeWidth="1"
        />

        {/* Parabolic High-Gain Dish Antenna */}
        <path
          d="M -6 -8 Q 0 -13 6 -8"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        <line x1="0" y1="-8" x2="0" y2="-12" stroke="#38bdf8" strokeWidth="1" />
        <circle cx="0" cy="-12" r="1.5" fill="#38bdf8" filter="url(#holo-glow)" />

        {/* Blinking Status LED */}
        <circle cx="2" cy="2" r="1.2" fill="#22c55e" filter="url(#atmosphere-glow)" />

        {/* Telemetry Tag */}
        {hoveredAsset === 'sat1' && (
          <g transform="translate(0, 24)" className="pointer-events-none">
            <rect
              x="-68"
              y="-12"
              width="136"
              height="24"
              rx="5"
              fill="#020617"
              fillOpacity="0.95"
              stroke="#38bdf8"
              strokeWidth="1.2"
              filter="url(#holo-glow)"
            />
            <text
              x="0"
              y="-1"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
            >
              EVLab GeoSync Relay-1
            </text>
            <text
              x="0"
              y="8"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="7.5"
              fontWeight="700"
              fontFamily="monospace"
            >
              RELAY-ACTIVE • ALT: 35,786 km
            </text>
          </g>
        )}
      </g>

      {/* ========================================================================= */}
      {/* 3. QUANTUM CUBESAT FORMATION (DUO PROBES)                                */}
      {/* ========================================================================= */}
      <g
        className="cubesat-formation cursor-pointer"
        transform={`translate(${sat2X}, ${sat2Y})`}
        onMouseEnter={() => setHoveredAsset('cubesat')}
        onMouseLeave={() => setHoveredAsset(null)}
      >
        {/* Laser Link Communication Beam between cubesats */}
        <line
          x1="-14"
          y1="-6"
          x2="14"
          y2="6"
          stroke="#a855f7"
          strokeWidth="0.8"
          strokeDasharray="2, 4"
          opacity="0.8"
        />

        {/* CubeSat Alpha */}
        <g transform="translate(-14, -6)">
          <rect x="-4" y="-4" width="8" height="8" rx="1" fill="#1e1b4b" stroke="#c084fc" strokeWidth="0.8" />
          <line x1="-8" y1="0" x2="-4" y2="0" stroke="#c084fc" strokeWidth="0.8" />
          <line x1="4" y1="0" x2="8" y2="0" stroke="#c084fc" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="1.2" fill="#a855f7" />
        </g>

        {/* CubeSat Beta */}
        <g transform="translate(14, 6)">
          <rect x="-4" y="-4" width="8" height="8" rx="1" fill="#1e1b4b" stroke="#c084fc" strokeWidth="0.8" />
          <line x1="-8" y1="0" x2="-4" y2="0" stroke="#c084fc" strokeWidth="0.8" />
          <line x1="4" y1="0" x2="8" y2="0" stroke="#c084fc" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="1.2" fill="#a855f7" />
        </g>

        {/* Hover Telemetry */}
        {hoveredAsset === 'cubesat' && (
          <g transform="translate(0, 20)" className="pointer-events-none">
            <rect
              x="-60"
              y="-10"
              width="120"
              height="20"
              rx="4"
              fill="#020617"
              fillOpacity="0.95"
              stroke="#c084fc"
              strokeWidth="1"
              filter="url(#holo-glow)"
            />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              fill="#e9d5ff"
              fontSize="8.5"
              fontWeight="800"
              fontFamily="monospace"
            >
              QUANTUM CUBESAT DUO
            </text>
          </g>
        )}
      </g>

      {/* ========================================================================= */}
      {/* 4. EVLAB ORBITAL NEXUS SPACE STATION                                      */}
      {/* ========================================================================= */}
      <g
        className="space-station cursor-pointer"
        transform={`translate(${stationX}, ${stationY})`}
        onMouseEnter={() => setHoveredAsset('station')}
        onMouseLeave={() => setHoveredAsset(null)}
      >
        {/* Outer Rotating Habitation Ring */}
        <circle
          cx="0"
          cy="0"
          r="22"
          fill="none"
          stroke="#475569"
          strokeWidth="3.5"
          strokeDasharray="12, 4"
          className="animate-spin-slow"
        />
        <circle
          cx="0"
          cy="0"
          r="22"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="0.8"
        />

        {/* Central Core Spoke Truss */}
        <line x1="-22" y1="0" x2="22" y2="0" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="0" y1="-22" x2="0" y2="22" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Quad Solar Array Wings (Top & Bottom Cross) */}
        {/* Top Solar Wing */}
        <rect x="-16" y="-38" width="32" height="12" rx="1.5" fill="url(#pat-solar-cells)" stroke="#0ea5e9" strokeWidth="0.8" />
        <line x1="0" y1="-26" x2="0" y2="-22" stroke="#64748b" strokeWidth="2" />

        {/* Bottom Solar Wing */}
        <rect x="-16" y="26" width="32" height="12" rx="1.5" fill="url(#pat-solar-cells)" stroke="#0ea5e9" strokeWidth="0.8" />
        <line x1="0" y1="22" x2="0" y2="26" stroke="#64748b" strokeWidth="2" />

        {/* Central Hub & Science Laboratory Module */}
        <circle cx="0" cy="0" r="9" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="5" fill="#38bdf8" opacity="0.8" filter="url(#holo-glow)" />
        <circle cx="0" cy="0" r="2" fill="#ffffff" />

        {/* Docking Navigation Lights (Red Port, Green Starboard) */}
        <circle cx="-18" cy="0" r="1.5" fill="#ef4444" filter="url(#atmosphere-glow)" />
        <circle cx="18" cy="0" r="1.5" fill="#22c55e" filter="url(#atmosphere-glow)" />

        {/* Station Hover Telemetry HUD */}
        {hoveredAsset === 'station' && (
          <g transform="translate(0, 50)" className="pointer-events-none">
            <rect
              x="-75"
              y="-14"
              width="150"
              height="28"
              rx="6"
              fill="#020617"
              fillOpacity="0.95"
              stroke="#38bdf8"
              strokeWidth="1.2"
              filter="url(#holo-glow)"
            />
            <text
              x="0"
              y="-2"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
            >
              EVLab Orbital Nexus Station
            </text>
            <text
              x="0"
              y="9"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="8"
              fontWeight="700"
              fontFamily="monospace"
            >
              HABITAT • 8 CREW • DOCKING OPEN
            </text>
          </g>
        )}
      </g>

      {/* ========================================================================= */}
      {/* 5. EVLAB EXPLORER HEAVY ROCKET (INTERPLANETARY TRANSPORT)                 */}
      {/* ========================================================================= */}
      <g
        className="heavy-rocket cursor-pointer"
        transform={`translate(${rocketX}, ${rocketY}) rotate(${rocketHeadingDeg})`}
        onMouseEnter={() => setHoveredAsset('rocket1')}
        onMouseLeave={() => setHoveredAsset(null)}
      >
        {/* Animated Ion Plasma Engine Flame */}
        <g transform="translate(0, 18)">
          <polygon
            points="-4,0 0,32 4,0"
            fill="url(#rocket-ion-flame)"
            filter="url(#atmosphere-glow)"
          />
          <polygon
            points="-2,0 0,20 2,0"
            fill="#ffffff"
          />
          {/* Engine Exhaust Glow Particle Rings */}
          <ellipse cx="0" cy="12" rx="3" ry="1.5" fill="none" stroke="#67e8f9" strokeWidth="0.8" opacity="0.8" />
          <ellipse cx="0" cy="22" rx="4" ry="2" fill="none" stroke="#06b6d4" strokeWidth="0.6" opacity="0.5" />
        </g>

        {/* Rocket Main Fuselage Body */}
        <path
          d="M 0 -22 L 5 -10 L 5 16 L -5 16 L -5 -10 Z"
          fill="url(#hull-metal)"
          stroke="#e2e8f0"
          strokeWidth="1"
        />

        {/* Nose Cone / Cockpit Visor */}
        <path
          d="M 0 -22 L 3.5 -12 L -3.5 -12 Z"
          fill="#0284c7"
          stroke="#38bdf8"
          strokeWidth="0.5"
        />
        <circle cx="0" cy="-14" r="1.5" fill="#38bdf8" filter="url(#holo-glow)" />

        {/* Dual Side Booster Pods */}
        {/* Left Booster */}
        <g transform="translate(-7, 2)">
          <rect x="-2" y="0" width="4" height="14" rx="1.5" fill="#334155" stroke="#94a3b8" strokeWidth="0.75" />
          <polygon points="-2,14 0,22 2,14" fill="url(#rocket-ion-flame)" opacity="0.85" />
        </g>

        {/* Right Booster */}
        <g transform="translate(7, 2)">
          <rect x="-2" y="0" width="4" height="14" rx="1.5" fill="#334155" stroke="#94a3b8" strokeWidth="0.75" />
          <polygon points="-2,14 0,22 2,14" fill="url(#rocket-ion-flame)" opacity="0.85" />
        </g>

        {/* Aerodynamic Grid Fins */}
        <line x1="-8" y1="12" x2="-5" y2="10" stroke="#cbd5e1" strokeWidth="1.2" />
        <line x1="8" y1="12" x2="5" y2="10" stroke="#cbd5e1" strokeWidth="1.2" />

        {/* Rocket Hull Decal / EVLab Stripe */}
        <rect x="-4" y="-4" width="8" height="3" fill="#0284c7" />
        <line x1="-3" y1="4" x2="3" y2="4" stroke="#e2e8f0" strokeWidth="0.6" />

        {/* Rocket Telemetry Tag */}
        {hoveredAsset === 'rocket1' && (
          <g transform={`rotate(${-rocketHeadingDeg}) translate(0, 36)`} className="pointer-events-none">
            <rect
              x="-75"
              y="-12"
              width="150"
              height="24"
              rx="5"
              fill="#020617"
              fillOpacity="0.95"
              stroke="#06b6d4"
              strokeWidth="1.2"
              filter="url(#holo-glow)"
            />
            <text
              x="0"
              y="-1"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
            >
              🚀 EVLab Explorer Heavy
            </text>
            <text
              x="0"
              y="8"
              textAnchor="middle"
              fill="#06b6d4"
              fontSize="7.5"
              fontWeight="700"
              fontFamily="monospace"
            >
              CRUISING • VEL: 24.8 km/s • ION-DRIVE
            </text>
          </g>
        )}
      </g>

      {/* ========================================================================= */}
      {/* 6. SECOND ROCKET: STARSHIP-STYLE HEAVY LAUNCH VEHICLE                     */}
      {/* ========================================================================= */}
      <g
        className="launch-vehicle cursor-pointer"
        transform={`translate(${rocket2X}, ${rocket2Y}) rotate(${rocket2HeadingDeg})`}
        onMouseEnter={() => setHoveredAsset('rocket2')}
        onMouseLeave={() => setHoveredAsset(null)}
      >
        {/* Fire / Chemical Exhaust Trail */}
        <g transform="translate(0, 16)">
          <polygon
            points="-3.5,0 0,26 3.5,0"
            fill="url(#rocket-chemical-flame)"
            filter="url(#atmosphere-glow)"
          />
          <polygon
            points="-1.5,0 0,14 1.5,0"
            fill="#ffffff"
          />
        </g>

        {/* Cylindrical Stainless Steel Fuselage */}
        <path
          d="M 0 -18 Q 4 -12 4 0 L 4 14 L -4 14 L -4 0 Q -4 -12 0 -18 Z"
          fill="url(#hull-metal)"
          stroke="#f1f5f9"
          strokeWidth="0.8"
        />

        {/* Forward Actuated Flaps */}
        <polygon points="-4,-10 -8,-7 -4,-6" fill="#64748b" stroke="#cbd5e1" strokeWidth="0.6" />
        <polygon points="4,-10 8,-7 4,-6" fill="#64748b" stroke="#cbd5e1" strokeWidth="0.6" />

        {/* Aft Steering Flaps */}
        <polygon points="-4,8 -9,14 -4,14" fill="#64748b" stroke="#cbd5e1" strokeWidth="0.6" />
        <polygon points="4,8 9,14 4,14" fill="#64748b" stroke="#cbd5e1" strokeWidth="0.6" />

        {/* Cockpit / Cargo Bay Window Line */}
        <line x1="-2" y1="-8" x2="2" y2="-8" stroke="#38bdf8" strokeWidth="1" />

        {/* Hover Telemetry Tag */}
        {hoveredAsset === 'rocket2' && (
          <g transform={`rotate(${-rocket2HeadingDeg}) translate(0, 32)`} className="pointer-events-none">
            <rect
              x="-68"
              y="-12"
              width="136"
              height="24"
              rx="5"
              fill="#020617"
              fillOpacity="0.95"
              stroke="#f97316"
              strokeWidth="1.2"
              filter="url(#holo-glow)"
            />
            <text
              x="0"
              y="-1"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
            >
              🚀 Starliner Heavy Mk-IV
            </text>
            <text
              x="0"
              y="8"
              textAnchor="middle"
              fill="#fb923c"
              fontSize="7.5"
              fontWeight="700"
              fontFamily="monospace"
            >
              ORBITAL INSERTION • 11.2 km/s
            </text>
          </g>
        )}
      </g>

      {/* ========================================================================= */}
      {/* 7. DEEP SPACE VOYAGER-STYLE INTERSTELLAR PROBE                            */}
      {/* ========================================================================= */}
      <g
        className="deep-probe cursor-pointer"
        transform={`translate(${probeX}, ${probeY}) rotate(15)`}
        onMouseEnter={() => setHoveredAsset('probe')}
        onMouseLeave={() => setHoveredAsset(null)}
      >
        {/* Large Gold High-Gain Radio Dish */}
        <ellipse cx="0" cy="0" rx="14" ry="7" fill="url(#pat-gold-foil)" stroke="#fbbf24" strokeWidth="1" />
        <ellipse cx="0" cy="0" rx="4" ry="2" fill="#78350f" />
        <line x1="0" y1="0" x2="0" y2="-8" stroke="#f1f5f9" strokeWidth="1.2" />
        <circle cx="0" cy="-8" r="1.5" fill="#38bdf8" filter="url(#holo-glow)" />

        {/* Magnetometer Instrument Boom */}
        <line x1="0" y1="7" x2="22" y2="24" stroke="#94a3b8" strokeWidth="1" />
        <rect x="20" y="22" width="4" height="4" fill="#38bdf8" />

        {/* RTG Power Generator Boom */}
        <line x1="0" y1="7" x2="-18" y2="20" stroke="#94a3b8" strokeWidth="1" />
        <rect x="-22" y="18" width="5" height="5" fill="#f59e0b" />

        {/* Probe Hover Telemetry */}
        {hoveredAsset === 'probe' && (
          <g transform="translate(0, 36)" className="pointer-events-none">
            <rect
              x="-65"
              y="-12"
              width="130"
              height="24"
              rx="5"
              fill="#020617"
              fillOpacity="0.95"
              stroke="#fbbf24"
              strokeWidth="1.2"
              filter="url(#holo-glow)"
            />
            <text
              x="0"
              y="-1"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
            >
              🛰 EVLab Deep-Probe 1
            </text>
            <text
              x="0"
              y="8"
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="7.5"
              fontWeight="700"
              fontFamily="monospace"
            >
              INTERSTELLAR ESCAPE • HELIOS
            </text>
          </g>
        )}
      </g>
    </g>
  );
});
