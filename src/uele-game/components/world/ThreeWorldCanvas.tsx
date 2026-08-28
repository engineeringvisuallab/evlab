import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';
import { TimeOfDay, WeatherType } from '../../types/game';
import { buildMiniCountryTerrain, getNearbyLandmark, LandmarkZone, COUNTRY_LANDMARKS } from '../../utils/miniCountryTerrain';
import { buildMasterPlanWaterSystems, WaterSystemInstance } from '../../utils/waterSystems';
import { buildMasterPlanRoadNetwork, MasterPlanRoadSystemResult } from '../../utils/masterPlanRoads';
import { buildCentralCityCore, CentralCityResult } from '../../utils/centralCityCore';
import { buildNorthernSectors, NorthernSectorsResult } from '../../utils/northernSectors';
import { buildSouthernSectors, SouthernSectorsResult } from '../../utils/southernSectors';
import { buildTrafficTransitSystem, TrafficTransitInstance } from '../../utils/trafficTransitSystem';
import { buildEnvironmentalEffects, EnvironmentFXInstance, TimePreset } from '../../utils/environmentalEffects';
import { buildRiverVesselsSystem, RiverVesselInstance } from '../../utils/riverVessels';
import { buildVegetationSystem, VegetationSystemInstance } from '../../utils/vegetationSystem';
import { buildHelicopterTransitSystem, HelicopterTransitInstance, HelicopterFlightInfo } from '../../utils/helicopterTransit';
import { buildSiteBoundariesSystem, SiteBoundaryResult } from '../../utils/siteBoundariesSystem';
import { buildMapWideRailwaySystem, MapWideRailwaySystem } from '../../utils/mapWideRailwaySystem';
import { buildSpaceFlightSystem, SpaceEnvironment } from '../../utils/spaceFlightSystem';
import { buildWildlifeAnimalsSystem, WildlifeSystemInstance } from '../../utils/wildlifeAnimalsSystem';
import { buildRuralVillageArea, RuralVillageInstance } from '../../utils/ruralVillageArea';
import { buildUtilityInfrastructureZones, UtilityInfrastructureInstance } from '../../utils/utilityInfrastructureZones';
import { PlayableVehicle, VehicleTypeId, VehiclePhysicsState } from '../../utils/vehicleController';
import { PlayableCharacter } from '../../utils/characterController';
import { audioEngine } from '../../utils/audioEngine';

interface ThreeWorldCanvasProps {
  isDriving: boolean;
  onToggleDriveMode: () => void;
  vehicleType: VehicleTypeId;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  cameraView: 'chase' | 'hood' | 'orbit' | 'drone' | 'walk';
  onChangeCameraView: (cam: 'chase' | 'hood' | 'orbit' | 'drone' | 'walk') => void;
  onVehicleStateUpdate: (state: VehiclePhysicsState) => void;
  onPlayerPositionUpdate: (pos: [number, number]) => void;
  onLandmarkEnter: (lm: LandmarkZone | null) => void;
  onCanEnterVehicleChange: (canEnter: boolean) => void;
  onSelectEngineeringObject?: (landmark: LandmarkZone) => void;
  teleportTarget: LandmarkZone | [number, number] | null;
  onTeleportComplete: () => void;
  helicopterFlightTarget?: { targetPos: [number, number]; destinationName: string } | null;
  onHelicopterFlightUpdate?: (info: HelicopterFlightInfo | null) => void;
  onHelicopterFlightComplete?: () => void;
  onHelicopterFlightLanded?: () => void;
  helicopterActionRef?: React.MutableRefObject<{ skipFlight: () => void } | null>;
  vehicleActionRef?: React.MutableRefObject<{
    honk: () => void;
    toggleHeadlights: () => void;
    resetVehicle: () => void;
  } | null>;
  /** Lightweight homepage-hero preview: disables keyboard/player input and
   *  slowly auto-rotates the orbit camera instead. */
  previewMode?: boolean;
  /** Called when the user clicks/taps the canvas while in previewMode. */
  onPreviewClick?: () => void;
}

export const ThreeWorldCanvas: React.FC<ThreeWorldCanvasProps> = ({
  isDriving,
  onToggleDriveMode,
  vehicleType,
  timeOfDay,
  weather,
  cameraView,
  onChangeCameraView,
  onVehicleStateUpdate,
  onPlayerPositionUpdate,
  onLandmarkEnter,
  onCanEnterVehicleChange,
  onSelectEngineeringObject,
  teleportTarget,
  onTeleportComplete,
  helicopterFlightTarget,
  onHelicopterFlightUpdate,
  onHelicopterFlightComplete,
  onHelicopterFlightLanded,
  helicopterActionRef,
  vehicleActionRef,
  previewMode,
  onPreviewClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Entities
  const vehicleRef = useRef<PlayableVehicle | null>(null);
  const characterRef = useRef<PlayableCharacter | null>(null);
  const elevationSamplerRef = useRef<((x: number, z: number) => number) | null>(null);

  // Systems
  const waterSystemsRef = useRef<WaterSystemInstance | null>(null);
  const roadNetworkRef = useRef<MasterPlanRoadSystemResult | null>(null);
  const centralCityRef = useRef<CentralCityResult | null>(null);
  const northernSectorsRef = useRef<NorthernSectorsResult | null>(null);
  const southernSectorsRef = useRef<SouthernSectorsResult | null>(null);
  const trafficTransitRef = useRef<TrafficTransitInstance | null>(null);
  const environmentFXRef = useRef<EnvironmentFXInstance | null>(null);
  const riverVesselsRef = useRef<RiverVesselInstance | null>(null);
  const vegetationRef = useRef<VegetationSystemInstance | null>(null);
  const helicopterTransitRef = useRef<HelicopterTransitInstance | null>(null);
  // Tracks which flight target we last actually started, so that if this
  // effect ever re-runs while the SAME flight is still in progress (e.g. a
  // parent re-render passing a fresh-but-equivalent callback), we don't
  // restart the flight from scratch and reset it back to spoolup/0m.
  const activeFlightKeyRef = useRef<string | null>(null);
  const siteBoundariesRef = useRef<SiteBoundaryResult | null>(null);
  const mapWideRailwayRef = useRef<MapWideRailwaySystem | null>(null);
  const spaceFlightRef = useRef<SpaceEnvironment | null>(null);
  const wildlifeAnimalsRef = useRef<WildlifeSystemInstance | null>(null);
  const ruralVillageRef = useRef<RuralVillageInstance | null>(null);
  const utilityInfrastructureRef = useRef<UtilityInfrastructureInstance | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Props ref to keep render loop decoupled from React state churn
  const propsRef = useRef({
    isDriving,
    vehicleType,
    timeOfDay,
    weather,
    cameraView,
    onVehicleStateUpdate,
    onPlayerPositionUpdate,
    onLandmarkEnter,
    onCanEnterVehicleChange,
    onToggleDriveMode,
    onSelectEngineeringObject,
    previewMode,
    onPreviewClick,
  });

  useEffect(() => {
    propsRef.current = {
      isDriving,
      vehicleType,
      timeOfDay,
      weather,
      cameraView,
      onVehicleStateUpdate,
      onPlayerPositionUpdate,
      onLandmarkEnter,
      onCanEnterVehicleChange,
      onToggleDriveMode,
      onSelectEngineeringObject,
      previewMode,
      onPreviewClick,
    };
  }, [
    isDriving,
    vehicleType,
    timeOfDay,
    weather,
    cameraView,
    onVehicleStateUpdate,
    onPlayerPositionUpdate,
    onLandmarkEnter,
    onCanEnterVehicleChange,
    onToggleDriveMode,
    onSelectEngineeringObject,
    previewMode,
    onPreviewClick,
  ]);

  // Input Tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Orbit / Camera drag controls
  const isDragging = useRef(false);
  const mouseDownStartPos = useRef({ x: 0, y: 0 });
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const orbitTheta = useRef(0);
  const orbitPhi = useRef(0.35);
  const orbitDistance = useRef(40);

  // Primary Scene, Renderer, Entities & Animation Lifecycle
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Initial Dimensions with Safe Fallbacks
    const initWidth = container.clientWidth || window.innerWidth || 800;
    const initHeight = container.clientHeight || window.innerHeight || 600;
    const aspect = initWidth / Math.max(initHeight, 1);

    // 2. Three.js Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x87ceeb); // Daytime sky
    scene.fog = new THREE.FogExp2(0xcde3f5, 0.00015); // Atmospheric perspective for 10 km expanse

    const camera = new THREE.PerspectiveCamera(55, aspect, 0.5, 25000);
    camera.position.set(6, 10, 60);
    cameraRef.current = camera;

    // 3. WebGL Renderer Initialization
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(initWidth, initHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Clear any previous child nodes and attach canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.7);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.65);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.5);
    dirLight.position.set(250, 450, 250);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 1200;
    dirLight.shadow.camera.left = -320;
    dirLight.shadow.camera.right = 320;
    dirLight.shadow.camera.top = 320;
    dirLight.shadow.camera.bottom = -320;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 5. Build Mini Country Terrain (10,000m x 10,000m / 10 km x 10 km True Scale)
    const terrain = buildMiniCountryTerrain();
    scene.add(terrain.mesh);
    elevationSamplerRef.current = terrain.getElevationAt;

    // 6. Master Plan Part 2: Hydrography & Water Systems
    const waterSystems = buildMasterPlanWaterSystems();
    scene.add(waterSystems.group);
    waterSystemsRef.current = waterSystems;

    // 6b. Master Plan Part 3: Civil Transport & Road Network
    const roadNetwork = buildMasterPlanRoadNetwork();
    scene.add(roadNetwork.group);
    roadNetworkRef.current = roadNetwork;

    // 6c. Master Plan Part 4: UELE Central City Core (0,0 to R=2.0km)
    const centralCity = buildCentralCityCore();
    scene.add(centralCity.group);
    centralCityRef.current = centralCity;

    // 6d. Master Plan Part 5: Northern Sectors (Renewable Wind, Agriculture, University R&D, Residential, Solar Farm)
    const northernSectors = buildNorthernSectors();
    scene.add(northernSectors.group);
    northernSectorsRef.current = northernSectors;

    // 6e. Master Plan Part 6: Western & Southern Sectors (Industrial, Airport, Sports Stadium, Construction, SEZ & Forestry)
    const southernSectors = buildSouthernSectors();
    scene.add(southernSectors.group);
    southernSectorsRef.current = southernSectors;

    // 6f. Master Plan Part 7: Dynamic Traffic & Autonomous Transit System
    const trafficTransit = buildTrafficTransitSystem();
    scene.add(trafficTransit.group);
    trafficTransitRef.current = trafficTransit;

    // 6g. Master Plan Part 8: Advanced Environmental Atmosphere & Weather FX
    const envFX = buildEnvironmentalEffects();
    scene.add(envFX.group);
    environmentFXRef.current = envFX;

    // 6h. Master Plan Part 9: Active River Vessels, Ferries, Freighters & Shipping Ports
    const riverVessels = buildRiverVesselsSystem();
    scene.add(riverVessels.group);
    riverVesselsRef.current = riverVessels;

    // 6i. Master Plan Part 10: Non-Overlapping Procedural Vegetation & Forestry Reserve Biosphere
    const vegetation = buildVegetationSystem();
    scene.add(vegetation.group);
    vegetationRef.current = vegetation;

    // 6j. Master Plan Part 11: Helicopter Air Transit & Flyover System
    const heliTransit = buildHelicopterTransitSystem();
    scene.add(heliTransit.group);
    helicopterTransitRef.current = heliTransit;

    // 6k. Master Plan Part 12: Individual Site Boundaries & Perimeter Fencing System
    const siteBoundaries = buildSiteBoundariesSystem();
    scene.add(siteBoundaries.group);
    siteBoundariesRef.current = siteBoundaries;

    // 6l. Master Plan Part 13: Map-Wide Dual Railway Network & Autonomous Moving Trains
    const mapRailway = buildMapWideRailwaySystem();
    scene.add(mapRailway.group);
    mapWideRailwayRef.current = mapRailway;

    // 6m. Master Plan Part 14: Aerospace Spaceport & Autonomous Rocket Flight / Airliner Runway Takeoff
    const spaceFlight = buildSpaceFlightSystem();
    scene.add(spaceFlight.group);
    spaceFlightRef.current = spaceFlight;

    // 6n. Master Plan Part 15: Forest Biosphere Wildlife & Fauna (Deer, Tigers, Elephants, Birds)
    const wildlifeAnimals = buildWildlifeAnimalsSystem();
    scene.add(wildlifeAnimals.group);
    wildlifeAnimalsRef.current = wildlifeAnimals;

    // 6o. Master Plan Part 16: Traditional Rural Village & Agricultural Landscape (Paddy fields, Tin homesteads, Pond ghat)
    const ruralVillage = buildRuralVillageArea();
    scene.add(ruralVillage.group);
    ruralVillageRef.current = ruralVillage;

    // 6p. Master Plan Part 17: Municipal & Environmental Treatment Plants (WTP, STP, ETP, SWM)
    const utilityInfrastructure = buildUtilityInfrastructureZones();
    scene.add(utilityInfrastructure.group);
    utilityInfrastructureRef.current = utilityInfrastructure;

    // 7. Initialize Playable Vehicle & Character
    const initialVehiclePos = new THREE.Vector3(6, terrain.getElevationAt(6, 40) + 0.25, 40);
    const vehicle = new PlayableVehicle(vehicleType, initialVehiclePos, 0);
    scene.add(vehicle.group);
    vehicleRef.current = vehicle;

    const initialCharPos = new THREE.Vector3(14, terrain.getElevationAt(14, 40), 40);
    const character = new PlayableCharacter(initialCharPos, 0);
    scene.add(character.group);
    characterRef.current = character;

    // 9. Rain Particles System
    const rainCount = 2000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPos[i] = (Math.random() - 0.5) * 260;
      rainPos[i + 1] = Math.random() * 120;
      rainPos[i + 2] = (Math.random() - 0.5) * 260;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.6,
      transparent: true,
      opacity: 0.75,
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainPoints.visible = false;
    scene.add(rainPoints);
    rainParticlesRef.current = rainPoints;

    // 10. Responsive Canvas Resizing with ResizeObserver
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Initial warm render call
    renderer.render(scene, camera);

    // 11. Physics & Animation Render Loop
    let animId: number;
    let lastTime = performance.now();
    let lastHudUpdateTime = 0;

    const animate = (timeNow: number) => {
      const delta = Math.min((timeNow - lastTime) / 1000, 0.1);
      lastTime = timeNow;

      const keys = keysPressed.current;
      const getElevation = elevationSamplerRef.current;
      const currentProps = propsRef.current;

      // Homepage-hero preview: slow auto-rotate instead of taking player input
      if (currentProps.previewMode) {
        orbitTheta.current += delta * 0.15;
      }

      // 0. Check for Active Helicopter Air Transit
      let isFlightCamActive = false;
      if (helicopterTransitRef.current) {
        const flightResult = helicopterTransitRef.current.update(delta, timeNow * 0.001);
        if (flightResult && flightResult.isFlightActive) {
          isFlightCamActive = true;
          camera.position.lerp(flightResult.cameraPosition, 8 * delta);
          camera.lookAt(flightResult.cameraLookAt);

          // Temporarily hide ground vehicle and character during air transit
          if (vehicleRef.current) vehicleRef.current.group.visible = false;
          if (characterRef.current) characterRef.current.group.visible = false;

          currentProps.onPlayerPositionUpdate([
            flightResult.info.currentPos.x,
            flightResult.info.currentPos.z,
          ]);

          if (onHelicopterFlightUpdate) {
            onHelicopterFlightUpdate(flightResult.info);
          }
        }
      }

      if (!isFlightCamActive && getElevation && vehicleRef.current && characterRef.current) {
        const activeVehicle = vehicleRef.current;
        const activeChar = characterRef.current;

        if (currentProps.isDriving) {
          // 1. VEHICLE DRIVING & HELICOPTER FLIGHT PHYSICS
          const isHeli = activeVehicle.type === 'helicopter';

          let throttle = 0;
          if (keys['KeyW'] || keys['ArrowUp']) throttle += 1;
          if (!isHeli && (keys['KeyS'] || keys['ArrowDown'])) throttle -= 1;

          let steer = 0;
          if (keys['KeyA'] || keys['ArrowLeft']) steer -= 1;
          if (keys['KeyD'] || keys['ArrowRight']) steer += 1;

          const brake = !isHeli && (keys['KeyS'] || keys['ArrowDown'] || false);
          const handbrake = !isHeli && (keys['Space'] || false);

          // Helicopter specific vertical flight controls:
          // Space: Lift UP (Ascend / উপরে উঠবে)
          // Down Arrow / S / Shift / C: Descend (নিচে নামবে)
          const liftUp = isHeli ? Boolean(keys['Space']) : false;
          const descend = isHeli
            ? Boolean(keys['ArrowDown'] || keys['KeyS'] || keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyC'] || keys['KeyZ'])
            : false;

          activeVehicle.updatePhysics(
            delta,
            { throttle, steer, brake, handbrake, liftUp, descend },
            getElevation
          );

          // Throttled HUD dispatch (~15-20 updates/sec) to keep React thread super responsive
          if (timeNow - lastHudUpdateTime > 50) {
            lastHudUpdateTime = timeNow;
            currentProps.onVehicleStateUpdate(activeVehicle.state);
            currentProps.onPlayerPositionUpdate([activeVehicle.state.position.x, activeVehicle.state.position.z]);

            const nearbyLandmark = getNearbyLandmark(activeVehicle.state.position.x, activeVehicle.state.position.z);
            currentProps.onLandmarkEnter(nearbyLandmark);
          }

        } else {
          // 2. CHARACTER WALKING PHYSICS
          let moveX = 0;
          let moveZ = 0;
          if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
          if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
          if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
          if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

          const sprint = keys['ShiftLeft'] || keys['ShiftRight'] || false;
          const jump = keys['Space'] || false;

          const camYaw = orbitTheta.current;
          activeChar.updatePhysics(delta, { moveX, moveZ, sprint, jump, cameraYaw: camYaw }, getElevation);

          if (timeNow - lastHudUpdateTime > 50) {
            lastHudUpdateTime = timeNow;
            currentProps.onPlayerPositionUpdate([activeChar.state.position.x, activeChar.state.position.z]);

            const distToCar = activeChar.state.position.distanceTo(activeVehicle.state.position);
            currentProps.onCanEnterVehicleChange(distToCar < 4.8);

            const nearbyLandmark = getNearbyLandmark(activeChar.state.position.x, activeChar.state.position.z);
            currentProps.onLandmarkEnter(nearbyLandmark);
          }
        }

        // 3. DYNAMIC CAMERA FOLLOW RIG
        const targetPos = currentProps.isDriving
          ? (activeVehicle.state?.position || activeChar.state?.position)
          : (activeChar.state?.position || activeVehicle.state?.position);

        if (!targetPos) return;

        if (currentProps.cameraView === 'chase' && currentProps.isDriving) {
          // Chase Cam
          const heading = activeVehicle.state.heading;
          const isHeli = activeVehicle.type === 'helicopter';
          const camDist = isHeli ? 18.0 : 9.5;
          const camHeight = isHeli ? 6.5 : 3.8;
          const camOffset = new THREE.Vector3(
            Math.sin(heading) * camDist,
            camHeight,
            Math.cos(heading) * camDist
          );

          const desiredCamPos = targetPos.clone().add(camOffset);
          camera.position.lerp(desiredCamPos, isHeli ? 5 * delta : 8 * delta);
          camera.lookAt(targetPos.x, targetPos.y + (isHeli ? 1.8 : 1.2), targetPos.z);

        } else if (currentProps.cameraView === 'hood' && currentProps.isDriving) {
          // First-person Hood / Cockpit View
          const heading = activeVehicle.state.heading;
          const isHeli = activeVehicle.type === 'helicopter';
          const hoodOffset = isHeli
            ? new THREE.Vector3(-Math.sin(heading) * 0.6, 2.0, -Math.cos(heading) * 0.6)
            : new THREE.Vector3(-Math.sin(heading) * 1.4, 1.2, -Math.cos(heading) * 1.4);
          camera.position.copy(targetPos).add(hoodOffset);

          const lookDir = new THREE.Vector3(
            -Math.sin(heading) * 20,
            isHeli ? -2 : 0,
            -Math.cos(heading) * 20
          );
          camera.lookAt(targetPos.clone().add(lookDir));

        } else if (currentProps.cameraView === 'walk' || !currentProps.isDriving) {
          // Third-person Walk Cam
          const phi = Math.max(0.1, orbitPhi.current);
          const dist = Math.min(orbitDistance.current, 18);
          const cx = targetPos.x + dist * Math.sin(orbitTheta.current) * Math.cos(phi);
          const cy = targetPos.y + dist * Math.sin(phi) + 1.8;
          const cz = targetPos.z + dist * Math.cos(orbitTheta.current) * Math.cos(phi);

          camera.position.lerp(new THREE.Vector3(cx, cy, cz), 12 * delta);
          camera.lookAt(targetPos.x, targetPos.y + 1.4, targetPos.z);

        } else if (currentProps.cameraView === 'drone') {
          // Drone Survey Cam
          const dronePos = targetPos.clone().add(new THREE.Vector3(30, 75, 40));
          camera.position.lerp(dronePos, 4 * delta);
          camera.lookAt(targetPos);

        } else {
          // Free Orbit Cam
          const phi = Math.max(0.05, orbitPhi.current);
          const cx = targetPos.x + orbitDistance.current * Math.sin(orbitTheta.current) * Math.cos(phi);
          const cy = targetPos.y + orbitDistance.current * Math.sin(phi);
          const cz = targetPos.z + orbitDistance.current * Math.cos(orbitTheta.current) * Math.cos(phi);

          camera.position.lerp(new THREE.Vector3(cx, cy, cz), 10 * delta);
          camera.lookAt(targetPos);
        }
      }

      // Subsystems Animation Updates
      if (waterSystemsRef.current) {
        waterSystemsRef.current.update(delta, timeNow * 0.001);
      }
      if (centralCityRef.current) {
        centralCityRef.current.update(timeNow * 0.001, delta);
      }
      if (northernSectorsRef.current) {
        northernSectorsRef.current.update(timeNow * 0.001, delta);
      }
      if (southernSectorsRef.current) {
        southernSectorsRef.current.update(timeNow * 0.001, delta);
      }
      if (trafficTransitRef.current) {
        trafficTransitRef.current.update(delta, timeNow * 0.001);
      }
      if (environmentFXRef.current) {
        environmentFXRef.current.update(delta, timeNow * 0.001, currentProps.timeOfDay, currentProps.weather);
      }
      if (riverVesselsRef.current) {
        riverVesselsRef.current.update(delta, timeNow * 0.001);
      }
      if (vegetationRef.current) {
        vegetationRef.current.update(delta, timeNow * 0.001);
      }
      if (siteBoundariesRef.current) {
        siteBoundariesRef.current.update(timeNow * 0.001, delta);
      }
      if (mapWideRailwayRef.current) {
        mapWideRailwayRef.current.update(delta, timeNow * 0.001);
      }
      if (spaceFlightRef.current) {
        spaceFlightRef.current.updateAnimation(
          timeNow * 0.001,
          delta,
          currentProps.timeOfDay === 'night',
          currentProps.timeOfDay
        );
      }
      if (wildlifeAnimalsRef.current) {
        wildlifeAnimalsRef.current.update(timeNow * 0.001, delta);
      }
      if (ruralVillageRef.current) {
        ruralVillageRef.current.update(timeNow * 0.001, delta);
      }
      if (utilityInfrastructureRef.current) {
        utilityInfrastructureRef.current.update(timeNow * 0.001, delta);
      }
      if (rainParticlesRef.current && rainParticlesRef.current.visible) {
        const positions = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
        const camPos = camera.position;
        rainParticlesRef.current.position.set(camPos.x, 0, camPos.z);

        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 85 * delta;
          if (positions[i] < 0) {
            positions[i] = 120;
          }
        }
        rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Final Frame Render
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Vehicle Model when changed in HUD
  useEffect(() => {
    if (vehicleRef.current && vehicleRef.current.type !== vehicleType) {
      vehicleRef.current.setVehicleType(vehicleType);
    }
  }, [vehicleType]);

  // Bind Vehicle Action Ref (Horn, Lights, Reset)
  useEffect(() => {
    if (vehicleActionRef) {
      vehicleActionRef.current = {
        honk: () => vehicleRef.current?.honk(),
        toggleHeadlights: () => {
          if (vehicleRef.current?.state) {
            vehicleRef.current.setHeadlights(!vehicleRef.current.state.headlightsOn);
          }
        },
        resetVehicle: () => {
          if (vehicleRef.current?.state?.position && elevationSamplerRef.current) {
            const posX = vehicleRef.current.state.position.x ?? 20;
            const posZ = vehicleRef.current.state.position.z ?? 50;
            const elev = elevationSamplerRef.current(posX, posZ);
            vehicleRef.current.resetPosition(elev);
          }
        },
      };
    }
  }, [vehicleActionRef]);

  // Handle Teleportation when requested via Map
  useEffect(() => {
    if (teleportTarget && elevationSamplerRef.current) {
      let tx = 20;
      let tz = 50;
      if (Array.isArray(teleportTarget)) {
        tx = typeof teleportTarget[0] === 'number' ? teleportTarget[0] : 20;
        tz = typeof teleportTarget[1] === 'number' ? teleportTarget[1] : 50;
      } else if (teleportTarget && typeof teleportTarget === 'object') {
        const targetObj = teleportTarget as unknown as Record<string, unknown>;
        if (Array.isArray(targetObj.center)) {
          tx = typeof targetObj.center[0] === 'number' ? targetObj.center[0] : 20;
          tz = typeof targetObj.center[1] === 'number' ? targetObj.center[1] : 50;
        } else if (typeof targetObj.x === 'number' && typeof targetObj.z === 'number') {
          tx = targetObj.x;
          tz = targetObj.z;
        }
      }

      const ty = elevationSamplerRef.current(tx, tz);

      if (isDriving && vehicleRef.current?.state?.position) {
        vehicleRef.current.state.position.set(tx, ty + 0.6, tz);
        vehicleRef.current.state.velocity.set(0, 0, 0);
        vehicleRef.current.state.speedKmh = 0;
      } else if (characterRef.current?.state?.position) {
        characterRef.current.state.position.set(tx, ty, tz);
        characterRef.current.state.velocity.set(0, 0, 0);
      }
      onTeleportComplete();
    }
  }, [teleportTarget, isDriving, onTeleportComplete]);

  // Handle Helicopter Air Transit from current player position to landmark
  useEffect(() => {
    if (helicopterFlightTarget && helicopterTransitRef.current && elevationSamplerRef.current) {
      // Guard: don't restart a flight that's already headed to this exact
      // destination — only (re)start when the target actually changed.
      const flightKey = `${helicopterFlightTarget.destinationName}:${helicopterFlightTarget.targetPos[0]}:${helicopterFlightTarget.targetPos[1]}`;
      const alreadyFlyingThere =
        activeFlightKeyRef.current === flightKey && helicopterTransitRef.current.getCurrentInfo().isActive;
      if (alreadyFlyingThere) {
        return;
      }
      activeFlightKeyRef.current = flightKey;

      let startX = 20;
      let startZ = 50;

      // If the SkyHawk is already mid-flight (player clicked a new site while
      // en route to a previous one), redirect from its CURRENT in-air
      // position — not the player's stale pre-flight ground position, which
      // would otherwise cause the helicopter to visually snap back to where
      // it originally took off from.
      const existingFlight = helicopterTransitRef.current.getCurrentInfo();
      if (existingFlight.isActive) {
        startX = existingFlight.currentPos.x;
        startZ = existingFlight.currentPos.z;
      } else if (isDriving && vehicleRef.current?.state?.position) {
        startX = vehicleRef.current.state.position.x;
        startZ = vehicleRef.current.state.position.z;
      } else if (characterRef.current?.state?.position) {
        startX = characterRef.current.state.position.x;
        startZ = characterRef.current.state.position.z;
      }

      const startY = elevationSamplerRef.current(startX, startZ);
      const startVec = new THREE.Vector3(startX, startY, startZ);

      const targetX = helicopterFlightTarget.targetPos[0];
      const targetZ = helicopterFlightTarget.targetPos[1];
      const targetY = elevationSamplerRef.current(targetX, targetZ);
      const targetVec = new THREE.Vector3(targetX, targetY, targetZ);

      audioEngine.playHelicopterTakeoffChime();

      helicopterTransitRef.current.startTransit(
        startVec,
        targetVec,
        helicopterFlightTarget.destinationName,
        (landingPos) => {
          // Landing complete — clear the guard so a future click on this
          // same destination is able to start a fresh flight.
          activeFlightKeyRef.current = null;

          // Landing complete — the SkyHawk sets down at the site and the
          // player is dropped off on foot beside it, ready to inspect.
          if (vehicleRef.current?.state?.position) {
            vehicleRef.current.state.position.copy(landingPos).add(new THREE.Vector3(0, 0.6, 0));
            vehicleRef.current.state.velocity.set(0, 0, 0);
            vehicleRef.current.state.speedKmh = 0;
            vehicleRef.current.group.visible = true;
          }
          if (characterRef.current?.state?.position) {
            // Step out a couple meters clear of the parked rotor disc
            characterRef.current.state.position.set(landingPos.x + 2.5, landingPos.y, landingPos.z + 2.5);
            characterRef.current.state.velocity.set(0, 0, 0);
            characterRef.current.group.visible = true;
          }

          if (onHelicopterFlightComplete) {
            onHelicopterFlightComplete();
          }
          if (onHelicopterFlightUpdate) {
            onHelicopterFlightUpdate(null);
          }
          if (onHelicopterFlightLanded) {
            // Tell the parent to exit drive mode — player is now on foot.
            onHelicopterFlightLanded();
          }
          audioEngine.playDoorThud();
        }
      );
    }
  }, [helicopterFlightTarget, isDriving, onHelicopterFlightComplete, onHelicopterFlightUpdate, onHelicopterFlightLanded]);

  // Bind Helicopter Action Ref (Skip Flight)
  useEffect(() => {
    if (helicopterActionRef) {
      helicopterActionRef.current = {
        skipFlight: () => helicopterTransitRef.current?.skipTransit(),
      };
    }
  }, [helicopterActionRef]);

  // Environmental Lighting & Weather Dynamics
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current || !ambientLightRef.current) return;

    if (environmentFXRef.current) {
      environmentFXRef.current.setLightingParams(
        sceneRef.current,
        dirLightRef.current,
        ambientLightRef.current,
        hemiLightRef.current,
        timeOfDay as TimePreset,
        weather
      );
    }

    if (timeOfDay === 'night') {
      vehicleRef.current?.setHeadlights(true);
    }

    if (rainParticlesRef.current) {
      rainParticlesRef.current.visible = weather === 'rain' || weather === 'storm';
    }
  }, [timeOfDay, weather]);

  // Toggle Character Visibility when entering/exiting car
  useEffect(() => {
    if (characterRef.current && vehicleRef.current && elevationSamplerRef.current) {
      if (isDriving) {
        characterRef.current.group.visible = false;
        audioEngine.playDoorThud();
      } else {
        const carPos = vehicleRef.current.state?.position;
        const carHeading = vehicleRef.current.state?.heading ?? 0;
        const doorOffset = new THREE.Vector3(Math.cos(carHeading) * 2.2, 0, -Math.sin(carHeading) * 2.2);

        const spawnX = (carPos?.x ?? 20) + (doorOffset?.x ?? 0);
        const spawnZ = (carPos?.z ?? 50) + (doorOffset?.z ?? 0);
        const spawnY = elevationSamplerRef.current(spawnX, spawnZ);

        if (characterRef.current.state?.position) {
          characterRef.current.state.position.set(spawnX, spawnY, spawnZ);
          characterRef.current.state.heading = carHeading;
          characterRef.current.group.visible = true;
        }
        audioEngine.playDoorThud();
      }
    }
  }, [isDriving]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Preview mode (homepage hero) ignores all keyboard input.
      if (propsRef.current.previewMode) return;

      // Prevent scrolling on space / arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      keysPressed.current[e.code] = true;

      // 'F' or 'Enter' = Toggle Drive/Walk
      if (e.code === 'KeyF' || e.code === 'Enter') {
        propsRef.current.onToggleDriveMode();
      }

      // 'H' = Honk
      if (e.code === 'KeyH' && propsRef.current.isDriving) {
        vehicleRef.current?.honk();
      }

      // 'L' = Toggle Headlights
      if (e.code === 'KeyL' && propsRef.current.isDriving && vehicleRef.current?.state) {
        vehicleRef.current.setHeadlights(!vehicleRef.current.state.headlightsOn);
      }

      // 'R' = Reset Car
      if (e.code === 'KeyR' && propsRef.current.isDriving && vehicleRef.current && elevationSamplerRef.current) {
        const pos = vehicleRef.current.state?.position;
        if (pos && typeof pos.x === 'number' && typeof pos.z === 'number') {
          const elev = elevationSamplerRef.current(pos.x, pos.z);
          vehicleRef.current.resetPosition(elev);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse Orbit Drag Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    mouseDownStartPos.current = { x: e.clientX, y: e.clientY };
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !previousMousePosition.current) return;
    const prevX = previousMousePosition.current?.x ?? e.clientX;
    const prevY = previousMousePosition.current?.y ?? e.clientY;
    const deltaX = e.clientX - prevX;
    const deltaY = e.clientY - prevY;

    orbitTheta.current -= deltaX * 0.006;
    orbitPhi.current = Math.max(0.05, Math.min(Math.PI / 2.1, orbitPhi.current + deltaY * 0.006));

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // If it was a quick click (not a long drag), perform 3D raycast to detect clicked landmark
    if (isDragging.current && mouseDownStartPos.current) {
      const startX = mouseDownStartPos.current?.x ?? e.clientX;
      const startY = mouseDownStartPos.current?.y ?? e.clientY;
      const clickDist = Math.hypot(e.clientX - startX, e.clientY - startY);

      // Preview mode (homepage hero): any quick click just enters the full game.
      if (clickDist < 8 && propsRef.current.previewMode) {
        propsRef.current.onPreviewClick?.();
        isDragging.current = false;
        return;
      }

      if (clickDist < 8 && cameraRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

        // Check against terrain / landmark centers
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(plane, intersectPoint) && intersectPoint) {
          // Find closest engineering landmark within range
          let closestLm: LandmarkZone | null = null;
          let minDist = 110;
          for (const lm of COUNTRY_LANDMARKS) {
            const lmX = lm.center?.[0] ?? 0;
            const lmZ = lm.center?.[1] ?? 0;
            const d = Math.hypot((intersectPoint.x ?? 0) - lmX, (intersectPoint.z ?? 0) - lmZ);
            if (d < lm.radius && d < minDist) {
              minDist = d;
              closestLm = lm;
            }
          }
          if (closestLm && propsRef.current.onSelectEngineeringObject) {
            propsRef.current.onSelectEngineeringObject(closestLm);
          }
        }
      }
    }
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    orbitDistance.current = Math.max(8, Math.min(180, orbitDistance.current + e.deltaY * 0.05));
  };

  return (
    <div
      ref={containerRef}
      id="three-world-canvas-container"
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing outline-none overflow-hidden bg-sky-300"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      tabIndex={0}
    />
  );
};
