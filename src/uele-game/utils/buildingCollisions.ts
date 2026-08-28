import * as THREE from 'three';

export interface SolidBuildingBox {
  id: string;
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  baseY: number;
  topY: number;
  hasHelipad?: boolean;
}

/**
 * Registers a new solid building box dynamically into the global collision registry
 */
export function registerSolidBuilding(building: SolidBuildingBox) {
  SOLID_BUILDINGS_REGISTRY.push(building);
}

/**
 * Global registry of major solid buildings across the 10km x 10km Master Plan
 */
export const SOLID_BUILDINGS_REGISTRY: SolidBuildingBox[] = [
  // =========================================================================
  // 1. UELE CENTRAL CITY CORE SKYSCRAPERS & CIVIC COMPLEXES
  // =========================================================================
  // AYT Mart Luxury Shopping Mall & Hypermarket
  {
    id: 'ayt_mart_mall',
    name: 'AYT Mart Shopping Mall',
    minX: 45,
    maxX: 125,
    minZ: 20,
    maxZ: 90,
    baseY: 0.5,
    topY: 34.0,
    hasHelipad: true,
  },
  // AYT Public Library & Knowledge Hub
  {
    id: 'ayt_library',
    name: 'AYT Central Library',
    minX: 45,
    maxX: 125,
    minZ: -90,
    maxZ: -20,
    baseY: 0.5,
    topY: 29.0,
    hasHelipad: true,
  },
  // AYT Twin Tower 1 (North)
  {
    id: 'ayt_twin_tower_1',
    name: 'AYT Financial Twin Tower North',
    minX: -110,
    maxX: -60,
    minZ: 30,
    maxZ: 80,
    baseY: 0.5,
    topY: 180.0,
    hasHelipad: true,
  },
  // AYT Twin Tower 2 (South)
  {
    id: 'ayt_twin_tower_2',
    name: 'AYT Financial Twin Tower South',
    minX: -110,
    maxX: -60,
    minZ: -80,
    maxZ: -30,
    baseY: 0.5,
    topY: 180.0,
    hasHelipad: true,
  },
  // Central Civic Center & Cultural Auditorium
  {
    id: 'civic_center',
    name: 'Central Civic Center & Auditorium',
    minX: -290,
    maxX: -210,
    minZ: -45,
    maxZ: 45,
    baseY: 0.5,
    topY: 36.0,
    hasHelipad: true,
  },
  // Central City Ring Skyscraper Ring (12 Major High-Rise Towers at R=320m)
  ...Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * Math.PI * 2) / 12;
    const cx = Math.cos(angle) * 320;
    const cz = Math.sin(angle) * 320;
    const height = 75 + (i % 4) * 25; // 75m to 150m
    return {
      id: `central_ring_tower_${i}`,
      name: `Central Skyline High-Rise Tower ${i + 1}`,
      minX: cx - 22,
      maxX: cx + 22,
      minZ: cz - 22,
      maxZ: cz + 22,
      baseY: 0.5,
      topY: height,
      hasHelipad: i % 2 === 0,
    };
  }),

  // =========================================================================
  // 2. INTERNATIONAL AIRPORT TERMINALS & FACILITIES
  // =========================================================================
  {
    id: 'airport_main_terminal',
    name: 'AYT International Airport Passenger Terminal',
    minX: -3320,
    maxX: -3080,
    minZ: 1940,
    maxZ: 2060,
    baseY: 0.5,
    topY: 26.0,
    hasHelipad: true,
  },
  {
    id: 'airport_atc_tower',
    name: 'ATC Radar Control Tower',
    minX: -3220,
    maxX: -3180,
    minZ: 1830,
    maxZ: 1870,
    baseY: 0.5,
    topY: 68.0,
    hasHelipad: false,
  },
  {
    id: 'airport_hangar_west',
    name: 'Aviation Maintenance Hangar West',
    minX: -2620,
    maxX: -2480,
    minZ: 1940,
    maxZ: 2060,
    baseY: 0.5,
    topY: 22.0,
  },

  // =========================================================================
  // 3. UNIVERSITY & R&D CAMPUS
  // =========================================================================
  {
    id: 'university_main_hall',
    name: 'Central University Academic Hall',
    minX: 4030,
    maxX: 4170,
    minZ: -4270,
    maxZ: -4130,
    baseY: 0.5,
    topY: 38.0,
    hasHelipad: true,
  },
  {
    id: 'university_science_lab',
    name: 'Nanotechnology & AI Laboratory Wing',
    minX: 4220,
    maxX: 4340,
    minZ: -4170,
    maxZ: -4070,
    baseY: 0.5,
    topY: 28.0,
  },

  // =========================================================================
  // 4. SPECIAL ECONOMIC ZONE (SEZ) ENTERPRISE TOWERS
  // =========================================================================
  {
    id: 'sez_tower_alpha',
    name: 'SEZ Corporate Enterprise Tower Alpha',
    minX: -60,
    maxX: 60,
    minZ: 4340,
    maxZ: 4460,
    baseY: 0.5,
    topY: 82.0,
    hasHelipad: true,
  },
  {
    id: 'sez_logistics_hub',
    name: 'Global Freight & Logistics Center',
    minX: 120,
    maxX: 260,
    minZ: 4320,
    maxZ: 4480,
    baseY: 0.5,
    topY: 24.0,
  },

  // =========================================================================
  // 5. OLYMPIC SPORTS STADIUM COMPLEX
  // =========================================================================
  {
    id: 'olympic_stadium_arena',
    name: 'Grand Olympic Stadium Arena Bowl',
    minX: -160,
    maxX: 160,
    minZ: 2180,
    maxZ: 2420,
    baseY: 0.5,
    topY: 42.0,
    hasHelipad: true,
  },

  // =========================================================================
  // 6. HEAVY INDUSTRIAL ZONE FACTORIES
  // =========================================================================
  {
    id: 'industrial_plant_1',
    name: 'Heavy Steel & Machinery Fabrication Plant',
    minX: -3950,
    maxX: -3750,
    minZ: -120,
    maxZ: 80,
    baseY: 0.5,
    topY: 26.0,
  },
  {
    id: 'industrial_plant_2',
    name: 'Chemical & Polymer Processing Facility',
    minX: -3700,
    maxX: -3550,
    minZ: -80,
    maxZ: 100,
    baseY: 0.5,
    topY: 22.0,
  },
];

/**
 * Returns solid rooftop elevation when helicopter or aircraft is directly over a building.
 * Returns null if not over any registered building.
 */
export function getBuildingRooftopElevation(x: number, z: number): number | null {
  for (let i = 0; i < SOLID_BUILDINGS_REGISTRY.length; i++) {
    const b = SOLID_BUILDINGS_REGISTRY[i];
    if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) {
      return b.topY + 0.25; // 0.25m pad surface offset
    }
  }
  return null;
}

/**
 * Checks horizontal obstacle collision for ground vehicles (cars, buses, trucks, bikes, characters).
 * Pushes the vehicle out smoothly if attempting to penetrate building walls.
 */
export function resolveBuildingObstacleCollision(
  pos: { x: number; z: number },
  radius = 2.4
): boolean {
  let collided = false;

  for (let i = 0; i < SOLID_BUILDINGS_REGISTRY.length; i++) {
    const b = SOLID_BUILDINGS_REGISTRY[i];

    // Check 2D bounding box expansion with vehicle radius
    if (
      pos.x >= b.minX - radius &&
      pos.x <= b.maxX + radius &&
      pos.z >= b.minZ - radius &&
      pos.z <= b.maxZ + radius
    ) {
      collided = true;

      // Find shortest penetration depth to push vehicle out to nearest exterior wall
      const dLeft = Math.abs(pos.x - (b.minX - radius));
      const dRight = Math.abs(pos.x - (b.maxX + radius));
      const dTop = Math.abs(pos.z - (b.minZ - radius));
      const dBottom = Math.abs(pos.z - (b.maxZ + radius));

      const minOverlap = Math.min(dLeft, dRight, dTop, dBottom);

      if (minOverlap === dLeft) {
        pos.x = b.minX - radius - 0.05;
      } else if (minOverlap === dRight) {
        pos.x = b.maxX + radius + 0.05;
      } else if (minOverlap === dTop) {
        pos.z = b.minZ - radius - 0.05;
      } else {
        pos.z = b.maxZ + radius + 0.05;
      }
    }
  }

  return collided;
}
