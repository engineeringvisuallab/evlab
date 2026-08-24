export type PlanetId =
  | 'bim'
  | 'cad'
  | 'gis'
  | 'water'
  | 'sewer'
  | 'structure'
  | 'hydraulics'
  | 'simulation'
  | 'materials'
  | 'ai'
  | 'uele'
  | 'projects';

export interface SoftwareMoon {
  id: string;
  name: string;
  shortCode: string;
  category: string;
  description: string;
  icon: string;
  orbitDistance: number; // in pixels relative to planet center in focus mode
  orbitSpeed: number; // speed coefficient in seconds per revolution
  orbitAngle: number; // starting angle in degrees
  status: 'active' | 'in_development' | 'planned' | 'core_connected';
  integrationTags: string[];
  features?: string[];
  externalRoute?: string;
}

export interface PlanetData {
  id: PlanetId;
  name: string;
  subtitle: string;
  domain: string;
  description: string;
  color: {
    primary: string;
    secondary: string;
    glow: string;
    atmosphere: string;
    accent: string;
    orbitLine: string;
    darkSurface: string;
  };
  // Planetary Orbital Mechanics in Space Universe View
  orbit: {
    radiusX: number; // Semi-major axis
    radiusY: number; // Semi-minor axis (gives 2.5D perspective inclination)
    baseAngle: number; // Initial radian / degree offset
    speed: number; // Orbit period in seconds
    inclination: number; // Tilt angle in degrees
    depthScale: number; // Pseudo-3D size scaling factor
    zTier: number; // Visual depth layering (1 = background, 3 = foreground)
  };
  size: number; // Base SVG radius
  textureType:
    | 'bim_wireframe'
    | 'cad_geometry'
    | 'gis_terrain'
    | 'water_pipelines'
    | 'sewer_network'
    | 'structure_truss'
    | 'hydraulic_vectors'
    | 'simulation_mesh'
    | 'crystal_lattice'
    | 'neural_network'
    | 'uele_diagrams'
    | 'projects_blocks';
  ringSystem?: {
    radiusInner: number;
    radiusOuter: number;
    tiltDeg: number;
    color: string;
    strokeDasharray?: string;
  };
  specs: {
    moduleCount: number;
    toolCount: number;
    integrations: string[];
    standardFormats: string[];
    telemetryCode: string;
    engineeringDomain: string;
    precisionRating: string;
  };
  moons: SoftwareMoon[];
}

export type SpaceViewMode = 'universe' | 'planet_focus' | 'orbit_matrix';

// Keys for the real, already-built EVLab sibling applications (EV Software
// Core) that a planet's "Enter Studio" action can navigate into directly,
// plus the generic EV Software Workspace destinations.
export type StudioKey =
  | 'bim'
  | 'gis'
  | 'cad'
  | 'wtp'
  | 'stp'
  | 'waterflow'
  | 'planner'
  | 'uele'
  | 'proving_bench'
  | 'dashboard';

export interface SpaceViewportState {
  viewMode: SpaceViewMode;
  selectedPlanetId: PlanetId | null;
  selectedMoonId: string | null;
  zoom: number;
  pan: { x: number; y: number };
  isRotating: boolean;
  speedMultiplier: number;
  showOrbits: boolean;
  showLabels: boolean;
  showTelemetry: boolean;
  showStarfield: boolean;
  showGrid: boolean;
  hoveredPlanetId: PlanetId | null;
}
