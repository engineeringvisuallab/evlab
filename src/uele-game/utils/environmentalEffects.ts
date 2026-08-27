import * as THREE from 'three';

export type TimePreset = 'dawn' | 'day' | 'golden' | 'night';
export type WeatherPreset = 'clear' | 'clouds' | 'rain' | 'storm' | 'fog';

export interface EnvironmentFXInstance {
  group: THREE.Group;
  update: (delta: number, time: number, timePreset: TimePreset, weather: string) => void;
  triggerLightning: () => void;
  setLightingParams: (
    scene: THREE.Scene,
    dirLight: THREE.DirectionalLight,
    ambientLight: THREE.AmbientLight,
    hemiLight: THREE.HemisphereLight,
    timePreset: TimePreset,
    weather: string
  ) => void;
}

export interface CinematicCameraPreset {
  id: string;
  name: string;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  duration: number; // in seconds
  description: string;
  icon: string;
}

export const CINEMATIC_TOUR_PRESETS: CinematicCameraPreset[] = [
  {
    id: 'ayt_hub_orbit',
    name: 'AYT Engineering Hub Flyby',
    startPos: new THREE.Vector3(250, 160, 250),
    targetPos: new THREE.Vector3(0, 80, 0),
    duration: 15,
    description: '360° aerial orbit around the twin towers and central knowledge dome.',
    icon: '🏛️',
  },
  {
    id: 'airport_runway_glide',
    name: 'Airport Runway Low Pass',
    startPos: new THREE.Vector3(-4600, 35, 2300),
    targetPos: new THREE.Vector3(-1800, 15, 2300),
    duration: 18,
    description: 'High-speed glide along the 3.2 km international jet runway.',
    icon: '✈️',
  },
  {
    id: 'olympic_stadium_swoop',
    name: 'Olympic Stadium Aerial Sweep',
    startPos: new THREE.Vector3(0, 120, 2700),
    targetPos: new THREE.Vector3(0, 35, 2300),
    duration: 12,
    description: 'Panoramic sweep over the Olympic sports bowl and athletic complex.',
    icon: '🏟️',
  },
  {
    id: 'wind_farm_ridge',
    name: 'Mountain Wind Farm Ridge',
    startPos: new THREE.Vector3(-4500, 220, -4200),
    targetPos: new THREE.Vector3(-3200, 120, -3800),
    duration: 16,
    description: 'Scenic ridge cruise through the hill & eco renewable wind turbines.',
    icon: '⚡',
  },
  {
    id: 'reservoir_dam_vista',
    name: 'Karatoya Reservoir & Dam',
    startPos: new THREE.Vector3(1200, 150, -4800),
    targetPos: new THREE.Vector3(2600, 45, -3400),
    duration: 18,
    description: 'Serene pass over the reservoir spillway, lake surface, and river gates.',
    icon: '🌊',
  },
  {
    id: 'river_shipping_channel',
    name: 'Karatoya River Shipping Channel',
    startPos: new THREE.Vector3(-1800, 45, -800),
    targetPos: new THREE.Vector3(1400, 30, -700),
    duration: 20,
    description: 'Cruising pass along the carved river canyon with moving freighters, ferries, and bridges.',
    icon: '🚢',
  },
  {
    id: 'forestry_biosphere_reserve',
    name: 'Forestry Reserve & Biosphere',
    startPos: new THREE.Vector3(2600, 110, 3400),
    targetPos: new THREE.Vector3(4200, 35, 4400),
    duration: 16,
    description: 'Lush tree canopy flyover across the protected biosphere forest and lake.',
    icon: '🌲',
  },
];

/**
 * Builds Advanced Atmospheric Effects & Lighting Manager (Part 8):
 * 1. Fluffy Cumulus Cloud Decks (drifting across 10 km sky at 350m altitude)
 * 2. Airport Runway Strobe Approach Sequence & Skyscraper Hazard Beacons
 * 3. Dynamic Thunderstorm Lightning Flash Controller
 * 4. River & Valley Mist
 * 5. Sun & Moon Celestial Sphere
 */
export function buildEnvironmentalEffects(): EnvironmentFXInstance {
  const group = new THREE.Group();
  group.name = 'environmental_fx_group';

  // =========================================================================
  // 1. VOLUMETRIC CUMULUS CLOUD DECK (Alt = 320m to 480m)
  // =========================================================================
  const cloudsGroup = new THREE.Group();
  cloudsGroup.name = 'cloud_deck';

  const cloudPuffGeo = new THREE.DodecahedronGeometry(1, 1);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.95,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85,
    flatShading: true,
  });

  const cloudClusters = 36;
  for (let c = 0; c < cloudClusters; c++) {
    const cluster = new THREE.Group();
    const cx = -4500 + Math.random() * 9000;
    const cz = -4500 + Math.random() * 9000;
    const cy = 340 + Math.random() * 120;
    cluster.position.set(cx, cy, cz);

    const puffsInCluster = 6 + Math.floor(Math.random() * 8);
    const clusterScale = 40 + Math.random() * 60;

    for (let p = 0; p < puffsInCluster; p++) {
      const puff = new THREE.Mesh(cloudPuffGeo, cloudMat);
      const px = (Math.random() - 0.5) * clusterScale * 1.5;
      const py = (Math.random() - 0.5) * clusterScale * 0.4;
      const pz = (Math.random() - 0.5) * clusterScale * 1.5;
      const pScale = clusterScale * (0.4 + Math.random() * 0.5);

      puff.position.set(px, py, pz);
      puff.scale.set(pScale, pScale * 0.6, pScale);
      cluster.add(puff);
    }

    cloudsGroup.add(cluster);
  }
  group.add(cloudsGroup);

  // =========================================================================
  // 2. CELESTIAL ORB (SUN & MOON VISUAL MESHES)
  // =========================================================================
  const celestialGroup = new THREE.Group();

  // Sun
  const sunGeo = new THREE.SphereGeometry(65, 16, 16);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  celestialGroup.add(sunMesh);

  // Moon
  const moonGeo = new THREE.SphereGeometry(45, 16, 16);
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
  const moonMesh = new THREE.Mesh(moonGeo, moonMat);
  celestialGroup.add(moonMesh);

  group.add(celestialGroup);

  // =========================================================================
  // 3. AIRPORT APPROACH STROBES & RED BEACONS
  // =========================================================================
  const airportStrobesGroup = new THREE.Group();
  const strobeGeo = new THREE.SphereGeometry(1.2, 8, 8);
  const strobeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const redBeaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  const approachStrobes: THREE.Mesh[] = [];
  // Runway 27 West Approach Rabbit Strobes (lead-in line)
  for (let s = 0; s < 12; s++) {
    const strobe = new THREE.Mesh(strobeGeo, strobeMat);
    strobe.position.set(-5100 + s * 30, 2.5, 2300);
    airportStrobesGroup.add(strobe);
    approachStrobes.push(strobe);
  }

  // Skyscraper Hazard Red Beacons
  const redBeacons: THREE.Mesh[] = [];
  const beaconCoords = [
    [-65, 212, 0], [65, 212, 0], // AYT Twin Towers Apex
    [-3400, 85, 2050], // Airport ATC Tower Top
    [3600, 68, 2200], // Tower Crane
  ];

  beaconCoords.forEach(([bx, by, bz]) => {
    const beacon = new THREE.Mesh(strobeGeo, redBeaconMat);
    beacon.position.set(bx, by, bz);
    airportStrobesGroup.add(beacon);
    redBeacons.push(beacon);
  });

  group.add(airportStrobesGroup);

  // =========================================================================
  // 4. DYNAMIC THUNDERSTORM LIGHTNING SYSTEM
  // =========================================================================
  const lightningLight = new THREE.PointLight(0xdbeafe, 0, 8000, 1.2);
  lightningLight.position.set(0, 600, 0);
  group.add(lightningLight);

  let lightningTimer = 0;
  let isLightningActive = false;
  let flashCountdown = 0;

  const triggerLightning = () => {
    lightningLight.intensity = 8.0;
    lightningLight.position.set(
      (Math.random() - 0.5) * 6000,
      450 + Math.random() * 200,
      (Math.random() - 0.5) * 6000
    );
    isLightningActive = true;
    flashCountdown = 0.12; // 120ms burst
  };

  // =========================================================================
  // LIGHTING PARAMS CONTROLLER (24-HOUR CELESTIAL CYCLE)
  // =========================================================================
  const setLightingParams = (
    scene: THREE.Scene,
    dirLight: THREE.DirectionalLight,
    ambientLight: THREE.AmbientLight,
    hemiLight: THREE.HemisphereLight,
    timePreset: TimePreset,
    weather: string
  ) => {
    const isRainOrStorm = weather === 'rain' || weather === 'storm';

    if (timePreset === 'dawn') {
      scene.background = new THREE.Color(isRainOrStorm ? 0x64748b : 0xf43f5e);
      scene.fog = new THREE.FogExp2(isRainOrStorm ? 0x94a3b8 : 0xfda4af, 0.00022);
      dirLight.color.setHex(0xfb7185);
      dirLight.intensity = isRainOrStorm ? 0.6 : 1.1;
      dirLight.position.set(-3500, 1200, 1500);
      ambientLight.color.setHex(0xffe4e6);
      ambientLight.intensity = 0.55;
      hemiLight.color.setHex(0xfecdd3);
      hemiLight.groundColor.setHex(0x334155);

      sunMesh.position.set(-4200, 1400, 1800);
      moonMesh.position.set(4200, -1400, -1800);

    } else if (timePreset === 'golden') {
      scene.background = new THREE.Color(isRainOrStorm ? 0x475569 : 0xf59e0b);
      scene.fog = new THREE.FogExp2(isRainOrStorm ? 0x64748b : 0xfef3c7, 0.0002);
      dirLight.color.setHex(0xfbbf24);
      dirLight.intensity = isRainOrStorm ? 0.7 : 1.35;
      dirLight.position.set(3200, 1100, -2200);
      ambientLight.color.setHex(0xfef3c7);
      ambientLight.intensity = 0.65;
      hemiLight.color.setHex(0xfde68a);
      hemiLight.groundColor.setHex(0x1e293b);

      sunMesh.position.set(3800, 1300, -2600);
      moonMesh.position.set(-3800, -1300, 2600);

    } else if (timePreset === 'night') {
      scene.background = new THREE.Color(0x030712);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.0003);
      dirLight.color.setHex(0x38bdf8);
      dirLight.intensity = 0.3;
      dirLight.position.set(1500, 3500, 1500);
      ambientLight.color.setHex(0x1e293b);
      ambientLight.intensity = 0.35;
      hemiLight.color.setHex(0x1e293b);
      hemiLight.groundColor.setHex(0x020617);

      sunMesh.position.set(0, -4000, 0);
      moonMesh.position.set(2000, 4200, 2000);

    } else {
      // Day (Clear / Overcast)
      const skyHex = isRainOrStorm ? 0x64748b : 0x7dd3fc;
      const fogHex = isRainOrStorm ? 0x94a3b8 : 0xbae6fd;
      scene.background = new THREE.Color(skyHex);
      scene.fog = new THREE.FogExp2(fogHex, isRainOrStorm ? 0.00028 : 0.00016);
      dirLight.color.setHex(0xfff7ed);
      dirLight.intensity = isRainOrStorm ? 0.8 : 1.5;
      dirLight.position.set(1800, 4500, 1800);
      ambientLight.color.setHex(0xdbeafe);
      ambientLight.intensity = isRainOrStorm ? 0.5 : 0.7;
      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0x334155);

      sunMesh.position.set(2200, 5200, 2200);
      moonMesh.position.set(-2200, -5200, -2200);
    }
  };

  // =========================================================================
  // UPDATE TICK
  // =========================================================================
  const update = (delta: number, time: number, _timePreset: TimePreset, weather: string) => {
    // 1. Cloud Deck Drifting
    cloudsGroup.children.forEach((cluster, idx) => {
      cluster.position.x += (8 + (idx % 4) * 2) * delta;
      if (cluster.position.x > 5000) {
        cluster.position.x = -5000;
      }
    });

    // 2. Airport Strobe Sequencer (Rabbit Light Chase)
    const strobePhase = Math.floor((time * 12) % approachStrobes.length);
    approachStrobes.forEach((strobe, idx) => {
      strobe.visible = idx === strobePhase;
    });

    // 3. Hazard Beacon Flash (1 Hz pulse)
    const beaconOn = Math.sin(time * 6) > 0.1;
    redBeacons.forEach((beacon) => {
      beacon.visible = beaconOn;
    });

    // 4. Random Thunderstorm Lightning Trigger
    if (weather === 'storm') {
      lightningTimer += delta;
      if (lightningTimer > 3.5 + Math.random() * 5.0) {
        lightningTimer = 0;
        triggerLightning();
      }
    }

    if (isLightningActive) {
      flashCountdown -= delta;
      if (flashCountdown <= 0) {
        lightningLight.intensity = 0;
        isLightningActive = false;
      }
    }
  };

  return {
    group,
    update,
    triggerLightning,
    setLightingParams,
  };
}
