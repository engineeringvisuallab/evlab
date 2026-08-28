import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';

export interface SiteBoundaryResult {
  group: THREE.Group;
  update: (time: number, delta: number) => void;
}

export interface ZoneBoundaryConfig {
  id: string;
  name: string;
  category: 'residential' | 'industrial' | 'airport' | 'solar' | 'wind' | 'agriculture' | 'university' | 'stadium' | 'construction' | 'sez' | 'forestry' | 'wetland' | 'commercial';
  shape: 'rect' | 'circle';
  // If rect: [minX, maxX, minZ, maxZ]
  rectBounds?: [number, number, number, number];
  // If circle: center [x, z], radius
  circleCenter?: [number, number];
  circleRadius?: number;
  // Gate openings in the fence where roads cross: array of { center: [x,z], width: number, label: string }
  gates: { center: [number, number]; width: number; label: string }[];
  fenceStyle: 'security_mesh' | 'residential_hedge_wall' | 'industrial_concrete' | 'high_voltage' | 'airport_security' | 'campus_perimeter' | 'nature_wood';
  themeColor: number;
  glowColor: number;
}

// Complete Master Plan Zone Boundary Definitions for all isolated districts & sites
export const ZONE_BOUNDARIES: ZoneBoundaryConfig[] = [
  // 1. LOW-DENSITY RESIDENTIAL SECTOR (Residential boundary & community gates)
  {
    id: 'residential_zone_boundary',
    name: 'Green Suburban Residential Community',
    category: 'residential',
    shape: 'rect',
    rectBounds: [800, 2900, -2800, -1100],
    gates: [
      { center: [1800, -1100], width: 34, label: 'RESIDENTIAL MAIN NORTH GATE' },
      { center: [1800, -2800], width: 30, label: 'RESIDENTIAL SOUTH GATE' },
      { center: [800, -1950], width: 28, label: 'RESIDENTIAL WEST BOULEVARD GATE' },
      { center: [2900, -1950], width: 28, label: 'RESIDENTIAL EAST GATE' },
    ],
    fenceStyle: 'residential_hedge_wall',
    themeColor: 0x10b981,
    glowColor: 0x34d399,
  },

  // 2. HIGH-CAPACITY PHOTOVOLTAIC SOLAR FARM (High voltage perimeter security)
  {
    id: 'solar_farm_boundary',
    name: '500kV Solar Power Grid & Substation',
    category: 'solar',
    shape: 'rect',
    rectBounds: [3100, 4800, -2600, -1100],
    gates: [
      { center: [4000, -1100], width: 26, label: 'SOLAR GRID MAIN SECURITY ACCESS' },
      { center: [3100, -1800], width: 24, label: 'TRANSFORMER SUBSTATION GATE' },
    ],
    fenceStyle: 'high_voltage',
    themeColor: 0xf59e0b,
    glowColor: 0xfbbf24,
  },

  // 3. UNIVERSITY & R&D CAMPUS (Academic boundary wall & archways)
  {
    id: 'university_campus_boundary',
    name: 'University & Innovation Science Park',
    category: 'university',
    shape: 'rect',
    rectBounds: [3200, 4800, -4900, -3200],
    gates: [
      { center: [4100, -3200], width: 36, label: 'UNIVERSITY GRAND ACADEMIC ARCH' },
      { center: [3200, -4100], width: 28, label: 'R&D CAMPUS WEST ENTRANCE' },
    ],
    fenceStyle: 'campus_perimeter',
    themeColor: 0x6366f1,
    glowColor: 0x818cf8,
  },

  // 4. AGRICULTURE & AGRO-ENGINEERING SECTOR (Farming perimeter fence)
  {
    id: 'agro_engineering_boundary',
    name: 'Precision Farming & Agro-Engineering Zone',
    category: 'agriculture',
    shape: 'rect',
    rectBounds: [-2600, -700, -4900, -3300],
    gates: [
      { center: [-1600, -3300], width: 32, label: 'AGRO-ENGINEERING MAIN LOGISTICS GATE' },
      { center: [-2600, -4100], width: 26, label: 'SILO HARVEST TRUCK ENTRY' },
    ],
    fenceStyle: 'security_mesh',
    themeColor: 0x84cc16,
    glowColor: 0xa3e635,
  },

  // 5. HILL & ECO WIND TURBINE ZONE (Mountain renewable reserve boundary)
  {
    id: 'wind_energy_boundary',
    name: 'Mountain Crest Wind Turbine Reserve',
    category: 'wind',
    shape: 'rect',
    rectBounds: [-4800, -2800, -4900, -2900],
    gates: [
      { center: [-3500, -2900], width: 30, label: 'WIND FARM SERVICE ACCESS ROAD' },
      { center: [-2800, -3900], width: 26, label: 'MOUNTAIN ECO CREST CHECKPOINT' },
    ],
    fenceStyle: 'security_mesh',
    themeColor: 0x06b6d4,
    glowColor: 0x22d3ee,
  },

  // 6. HEAVY INDUSTRIAL & LOGISTICS HUB (Reinforced concrete boundary wall & crash gates)
  {
    id: 'industrial_zone_boundary',
    name: 'Heavy Industrial & Manufacturing Park',
    category: 'industrial',
    shape: 'rect',
    rectBounds: [-4900, -2800, -1100, 1100],
    gates: [
      { center: [-2800, 0], width: 38, label: 'INDUSTRIAL SECTOR MAIN CARGO GATEWAY' },
      { center: [-3800, -1100], width: 30, label: 'CHEMICAL DEPOT SOUTH GATE' },
      { center: [-3800, 1100], width: 30, label: 'FREIGHT YARD NORTH GATE' },
    ],
    fenceStyle: 'industrial_concrete',
    themeColor: 0xef4444,
    glowColor: 0xf87171,
  },

  // 7. AYT INTERNATIONAL AIRPORT (Restricted aviation perimeter fence)
  {
    id: 'airport_security_boundary',
    name: 'AYT International Airport Security Perimeter',
    category: 'airport',
    shape: 'rect',
    rectBounds: [-4800, -1800, 1300, 3400],
    gates: [
      { center: [-2500, 2300], width: 44, label: 'AIRPORT TERMINAL CONCOURSE GATES' },
      { center: [-3200, 1300], width: 32, label: 'AIR CARGO LOGISTICS SECURITY GATE' },
      { center: [-3200, 3400], width: 30, label: 'RUNWAY EMERGENCY AIRSIDE POST' },
    ],
    fenceStyle: 'airport_security',
    themeColor: 0x0284c7,
    glowColor: 0x38bdf8,
  },

  // 8. OLYMPIC SPORTS STADIUM & RECREATION COMPLEX (Civic decorative promenade fence)
  {
    id: 'sports_stadium_boundary',
    name: 'Olympic Sports Stadium & Aquatic Arena',
    category: 'stadium',
    shape: 'rect',
    rectBounds: [-900, 900, 1400, 3200],
    gates: [
      { center: [0, 1400], width: 42, label: 'OLYMPIC PLAZA GRAND SPECTATOR GATE' },
      { center: [0, 3200], width: 36, label: 'STADIUM ATHLETE & VIP ENTRANCE' },
      { center: [-900, 2300], width: 28, label: 'WEST AQUATIC CENTER GATE' },
      { center: [900, 2300], width: 28, label: 'EAST ATHLETIC PAVILION GATE' },
    ],
    fenceStyle: 'campus_perimeter',
    themeColor: 0x8b5cf6,
    glowColor: 0xa78bfa,
  },

  // 9. HEAVY EQUIPMENT & CONSTRUCTION DEPOT (Industrial wire & barricade fence)
  {
    id: 'construction_yard_boundary',
    name: 'Heavy Equipment & Staging Depot',
    category: 'construction',
    shape: 'rect',
    rectBounds: [1900, 3800, 1400, 3200],
    gates: [
      { center: [2800, 1400], width: 36, label: 'CONSTRUCTION YARD NORTH HEAVY VEHICLE GATE' },
      { center: [1900, 2300], width: 30, label: 'EQUIPMENT STAGING WEST ENTRY' },
      { center: [2800, 3200], width: 32, label: 'EARTHMOVING SOUTH GATE' },
    ],
    fenceStyle: 'industrial_concrete',
    themeColor: 0xf97316,
    glowColor: 0xfb923c,
  },

  // 10. SPECIAL ECONOMIC ZONE (SEZ BUSINESS PARK)
  {
    id: 'sez_business_boundary',
    name: 'Special Economic Zone (SEZ) Enterprise District',
    category: 'sez',
    shape: 'rect',
    rectBounds: [-1000, 1000, 3500, 4900],
    gates: [
      { center: [0, 3500], width: 40, label: 'SEZ CORPORATE PLAZA SECURITY GATE' },
      { center: [-1000, 4400], width: 28, label: 'SEZ LOGISTICS WEST ACCESS' },
      { center: [1000, 4400], width: 28, label: 'SEZ TECH PARK EAST ACCESS' },
    ],
    fenceStyle: 'campus_perimeter',
    themeColor: 0x3b82f6,
    glowColor: 0x60a5fa,
  },

  // 11. FORESTRY & BIOSPHERE NATURE RESERVE (Timber & Eco boundary)
  {
    id: 'forestry_reserve_boundary',
    name: 'Protected Biosphere Reserve & Botanical Forestry',
    category: 'forestry',
    shape: 'rect',
    rectBounds: [2700, 4800, 3400, 4900],
    gates: [
      { center: [3800, 3400], width: 32, label: 'NATURE RESERVE BOTANICAL GATE' },
      { center: [2700, 4200], width: 26, label: 'FORESTRY RANGER STATION ENTRY' },
    ],
    fenceStyle: 'nature_wood',
    themeColor: 0x059669,
    glowColor: 0x10b981,
  },

  // 12. CENTRAL METROPOLITAN DOWNTOWN INNER CORE (Urban Parkway ring perimeter)
  {
    id: 'central_downtown_boundary',
    name: 'UELE Central City & AYT Civic Center',
    category: 'commercial',
    shape: 'circle',
    circleCenter: [0, 0],
    circleRadius: 1850,
    gates: [
      { center: [0, -1850], width: 50, label: 'CENTRAL NORTH BOULEVARD GATEWAY' },
      { center: [0, 1850], width: 50, label: 'CENTRAL SOUTH EXPRESSWAY GATEWAY' },
      { center: [-1850, 0], width: 50, label: 'CENTRAL WEST METRO GATEWAY' },
      { center: [1850, 0], width: 50, label: 'CENTRAL EAST HIGHWAY GATEWAY' },
    ],
    fenceStyle: 'campus_perimeter',
    themeColor: 0x0ea5e9,
    glowColor: 0x38bdf8,
  },
];

/**
 * Procedural Signboard Generator for Zone Entrance Gates
 */
function createGateSignTexture(zoneName: string, gateLabel: string, themeColorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 1024, 256);

  // Border with zone theme
  ctx.strokeStyle = themeColorHex;
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, 1004, 236);

  // Accent Header
  ctx.fillStyle = themeColorHex;
  ctx.fillRect(20, 20, 984, 48);

  ctx.fillStyle = '#090d16';
  ctx.font = '900 28px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OFFICIAL DESIGNATED ZONE PERIMETER', 512, 44);

  // Main Zone Name
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px "Arial Black", sans-serif';
  ctx.shadowColor = themeColorHex;
  ctx.shadowBlur = 16;
  ctx.fillText(zoneName.toUpperCase(), 512, 125);

  // Gate specific subtitle
  ctx.shadowBlur = 0;
  ctx.fillStyle = themeColorHex;
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(`• ${gateLabel} •`, 512, 185);

  // Safety / Security Subtext
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('SPEED LIMIT 40 KM/H • 24/7 SURVEILLANCE & AUTHORIZED ACCESS', 512, 222);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Builds all standalone perimeter fencing, boundary walls, entry gates, and LED boundary lights
 * across all individual sites in the 10 km x 10 km Master Plan.
 */
export function buildSiteBoundariesSystem(): SiteBoundaryResult {
  const group = new THREE.Group();
  group.name = 'master_site_boundaries_and_fencing_system';

  const animatedBeacons: THREE.Mesh[] = [];

  // Common Materials
  const concreteBaseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
  const concretePillarMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.85 });
  const steelMeshMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.3,
    metalness: 0.9,
    wireframe: true,
  });
  const hedgeGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
  const cautionYellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
  const woodLogMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.95 });

  // Reusable Geometries
  const postGeo = new THREE.BoxGeometry(1.2, 4.2, 1.2);
  const tallPostGeo = new THREE.BoxGeometry(1.4, 6.0, 1.4);
  const gateArchPostGeo = new THREE.BoxGeometry(2.5, 9.0, 2.5);

  // Helper to test if a point (x, z) falls inside any gate opening of a zone
  const isInsideGate = (x: number, z: number, gates: { center: [number, number]; width: number }[]): boolean => {
    for (const g of gates) {
      const dist = Math.hypot(x - g.center[0], z - g.center[1]);
      if (dist < g.width / 2) {
        return true;
      }
    }
    return false;
  };

  // Helper to build a continuous segmented boundary fence line from P1 to P2
  const buildFenceSegment = (
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    zone: ZoneBoundaryConfig,
    zoneGroup: THREE.Group
  ) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const totalDist = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);

    const segmentLen = 20; // 20m per fence panel span
    const steps = Math.ceil(totalDist / segmentLen);

    const themeHexStr = '#' + zone.themeColor.toString(16).padStart(6, '0');
    const glowMat = new THREE.MeshBasicMaterial({ color: zone.glowColor });

    for (let s = 0; s < steps; s++) {
      const tStart = s / steps;
      const tEnd = (s + 1) / steps;
      const tMid = (tStart + tEnd) / 2;

      const px = x1 + dx * tMid;
      const pz = z1 + dz * tMid;

      // Skip fence if inside a gate roadway opening
      if (isInsideGate(px, pz, zone.gates)) {
        continue;
      }

      const py = calcMasterPlanElevation(px, pz);
      const spanActual = totalDist / steps;

      const panel = new THREE.Group();
      panel.position.set(px, py, pz);
      panel.rotation.y = angle;

      // Build style-specific fence structure
      switch (zone.fenceStyle) {
        case 'residential_hedge_wall': {
          // Low stone wall base + dense sculpted hedge + modern stainless posts
          const wallBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, spanActual), concreteBaseMat);
          wallBase.position.y = 0.6;
          panel.add(wallBase);

          const hedge = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, spanActual * 0.98), hedgeGreenMat);
          hedge.position.y = 2.0;
          hedge.castShadow = true;
          panel.add(hedge);

          // LED top cap accent light
          const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, spanActual), glowMat);
          ledStrip.position.y = 1.25;
          panel.add(ledStrip);
          break;
        }

        case 'airport_security': {
          // Heavy perimeter chain-link & concrete jersey barrier with razor barb top & blue strobe beacon
          const jersey = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, spanActual), concreteBaseMat);
          jersey.position.y = 0.75;
          panel.add(jersey);

          const fenceMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.2, spanActual), steelMeshMat);
          fenceMesh.position.y = 3.0;
          panel.add(fenceMesh);

          const post = new THREE.Mesh(tallPostGeo, darkMetalMat);
          post.position.set(0, 3.0, spanActual / 2);
          panel.add(post);

          // Red/Blue aviation perimeter beacon every 60m
          if (s % 3 === 0) {
            const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), glowMat);
            beacon.position.set(0, 6.2, spanActual / 2);
            panel.add(beacon);
            animatedBeacons.push(beacon);
          }
          break;
        }

        case 'high_voltage': {
          // Electric fence with high-voltage warning insulators and steel mesh
          const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, spanActual), concreteBaseMat);
          base.position.y = 0.4;
          panel.add(base);

          const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.8, spanActual), steelMeshMat);
          mesh.position.y = 2.4;
          panel.add(mesh);

          const yellowBar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, spanActual), cautionYellowMat);
          yellowBar.position.y = 4.2;
          panel.add(yellowBar);

          const post = new THREE.Mesh(postGeo, darkMetalMat);
          post.position.set(0, 2.1, spanActual / 2);
          panel.add(post);
          break;
        }

        case 'industrial_concrete': {
          // Heavy reinforced precast concrete security slabs with metal brackets
          const slab = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.6, spanActual * 0.96), concretePillarMat);
          slab.position.y = 1.8;
          slab.castShadow = true;
          panel.add(slab);

          const post = new THREE.Mesh(tallPostGeo, concreteBaseMat);
          post.position.set(0, 2.1, spanActual / 2);
          panel.add(post);

          // Red accent line on top
          const topRim = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, spanActual), cautionYellowMat);
          topRim.position.y = 3.7;
          panel.add(topRim);
          break;
        }

        case 'campus_perimeter': {
          // High-tech decorative black steel vertical balustrades with glowing illuminated piers
          const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, spanActual), concreteBaseMat);
          base.position.y = 0.3;
          panel.add(base);

          const balustrade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.0, spanActual), darkMetalMat);
          balustrade.position.y = 1.9;
          panel.add(balustrade);

          const post = new THREE.Mesh(tallPostGeo, concretePillarMat);
          post.position.set(0, 2.0, spanActual / 2);
          panel.add(post);

          // Glow light on pier top
          const lightCap = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), glowMat);
          lightCap.position.set(0, 4.3, spanActual / 2);
          panel.add(lightCap);
          break;
        }

        case 'nature_wood': {
          // Rustic timber posts and natural split-rail logs for forestry/nature reserve
          const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, spanActual, 8), woodLogMat);
          log1.rotation.x = Math.PI / 2;
          log1.position.set(0, 1.0, 0);
          panel.add(log1);

          const log2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, spanActual, 8), woodLogMat);
          log2.rotation.x = Math.PI / 2;
          log2.position.set(0, 2.0, 0);
          panel.add(log2);

          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 2.8, 8), woodLogMat);
          post.position.set(0, 1.4, spanActual / 2);
          panel.add(post);
          break;
        }

        case 'security_mesh':
        default: {
          // Standard security galvanized mesh fence
          const base = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, spanActual), concreteBaseMat);
          base.position.y = 0.25;
          panel.add(base);

          const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.8, spanActual), steelMeshMat);
          mesh.position.y = 1.75;
          panel.add(mesh);

          const post = new THREE.Mesh(postGeo, darkMetalMat);
          post.position.set(0, 1.8, spanActual / 2);
          panel.add(post);
          break;
        }
      }

      zoneGroup.add(panel);
    }
  };

  // Helper to build Grand Entrance Gates with overhead arched gantry and illuminated sign
  const buildZoneGate = (gate: { center: [number, number]; width: number; label: string }, zone: ZoneBoundaryConfig, zoneGroup: THREE.Group) => {
    const gx = gate.center[0];
    const gz = gate.center[1];
    const gy = calcMasterPlanElevation(gx, gz);

    const gateGroup = new THREE.Group();
    gateGroup.position.set(gx, gy, gz);

    // Determine orientation based on bounding center
    const zoneCenterX = zone.rectBounds ? (zone.rectBounds[0] + zone.rectBounds[1]) / 2 : (zone.circleCenter?.[0] || 0);
    const zoneCenterZ = zone.rectBounds ? (zone.rectBounds[2] + zone.rectBounds[3]) / 2 : (zone.circleCenter?.[1] || 0);
    const angleToCenter = Math.atan2(gx - zoneCenterX, gz - zoneCenterZ);
    // Gate faces perpendicular to the boundary wall
    gateGroup.rotation.y = angleToCenter;

    const span = gate.width;
    const halfSpan = span / 2;

    const themeHexStr = '#' + zone.themeColor.toString(16).padStart(6, '0');
    const signTex = createGateSignTexture(zone.name, gate.label, themeHexStr);
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.3,
      metalness: 0.2,
    });

    const glowMat = new THREE.MeshBasicMaterial({ color: zone.glowColor });

    // Left and Right Giant Gate Pillars / Security Checkpoint Towers
    for (const side of [-1, 1]) {
      const px = side * (halfSpan + 2.0);
      const pillar = new THREE.Mesh(gateArchPostGeo, concretePillarMat);
      pillar.position.set(px, 4.5, 0);
      pillar.castShadow = true;
      gateGroup.add(pillar);

      // Guardhouse / Security Booth
      const guardBooth = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.2, 5.0), darkMetalMat);
      guardBooth.position.set(px + side * 3.0, 1.6, 0);
      gateGroup.add(guardBooth);

      // Guardhouse glass
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(4.1, 1.4, 4.2),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
      );
      glass.position.set(px + side * 3.0, 2.1, 0);
      gateGroup.add(glass);

      // High-vis Warning LED Beacon on top
      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.8, 12), glowMat);
      beacon.position.set(px, 9.4, 0);
      gateGroup.add(beacon);
      animatedBeacons.push(beacon);

      // Automatic Boom Barrier (Drop Arm)
      const barrierBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 1.0), cautionYellowMat);
      barrierBase.position.set(px - side * 1.5, 0.7, 1.0);
      gateGroup.add(barrierBase);

      const barrierArm = new THREE.Mesh(new THREE.BoxGeometry(halfSpan * 0.8, 0.2, 0.2), cautionYellowMat);
      barrierArm.position.set(px - side * (1.5 + halfSpan * 0.4), 1.0, 1.0);
      gateGroup.add(barrierArm);
    }

    // Overhead Structural Truss Arch across the roadway
    const archTruss = new THREE.Mesh(new THREE.BoxGeometry(span + 6.0, 1.5, 2.2), darkMetalMat);
    archTruss.position.set(0, 8.5, 0);
    gateGroup.add(archTruss);

    // Double-sided 3D Illuminated Entrance Signboard
    const signMeshFront = new THREE.Mesh(new THREE.BoxGeometry(Math.min(span * 0.75, 28), 3.2, 0.4), signMat);
    signMeshFront.position.set(0, 8.5, 1.2);
    gateGroup.add(signMeshFront);

    const signMeshBack = new THREE.Mesh(new THREE.BoxGeometry(Math.min(span * 0.75, 28), 3.2, 0.4), signMat);
    signMeshBack.position.set(0, 8.5, -1.2);
    signMeshBack.rotation.y = Math.PI;
    gateGroup.add(signMeshBack);

    // Overhead Illuminating Spotlights
    for (const lx of [-halfSpan * 0.35, 0, halfSpan * 0.35]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), glowMat);
      lamp.position.set(lx, 9.4, 0);
      gateGroup.add(lamp);
    }

    zoneGroup.add(gateGroup);
  };

  // Build fences and gates for each defined zone
  ZONE_BOUNDARIES.forEach((zone) => {
    const zoneGroup = new THREE.Group();
    zoneGroup.name = `boundary_${zone.id}`;

    if (zone.shape === 'rect' && zone.rectBounds) {
      const [minX, maxX, minZ, maxZ] = zone.rectBounds;

      // 4 perimeter sides of rectangle:
      // Side 1: North boundary (minX, minZ) -> (maxX, minZ)
      buildFenceSegment(minX, minZ, maxX, minZ, zone, zoneGroup);
      // Side 2: East boundary (maxX, minZ) -> (maxX, maxZ)
      buildFenceSegment(maxX, minZ, maxX, maxZ, zone, zoneGroup);
      // Side 3: South boundary (maxX, maxZ) -> (minX, maxZ)
      buildFenceSegment(maxX, maxZ, minX, maxZ, zone, zoneGroup);
      // Side 4: West boundary (minX, maxZ) -> (minX, minZ)
      buildFenceSegment(minX, maxZ, minX, minZ, zone, zoneGroup);

    } else if (zone.shape === 'circle' && zone.circleCenter && zone.circleRadius) {
      const [cx, cz] = zone.circleCenter;
      const r = zone.circleRadius;
      const segments = 48;

      for (let i = 0; i < segments; i++) {
        const theta1 = (i / segments) * Math.PI * 2;
        const theta2 = ((i + 1) / segments) * Math.PI * 2;

        const x1 = cx + Math.sin(theta1) * r;
        const z1 = cz + Math.cos(theta1) * r;
        const x2 = cx + Math.sin(theta2) * r;
        const z2 = cz + Math.cos(theta2) * r;

        buildFenceSegment(x1, z1, x2, z2, zone, zoneGroup);
      }
    }

    // Build Entry Gates for this zone
    zone.gates.forEach((gate) => {
      buildZoneGate(gate, zone, zoneGroup);
    });

    group.add(zoneGroup);
  });

  const update = (time: number, delta: number) => {
    // Pulse security gate LED beacons
    const pulse = 0.5 + Math.sin(time * 6) * 0.5;
    for (let i = 0; i < animatedBeacons.length; i++) {
      const b = animatedBeacons[i];
      if (b.material instanceof THREE.MeshBasicMaterial) {
        b.material.opacity = 0.6 + pulse * 0.4;
      }
    }
  };

  return {
    group,
    update,
  };
}
