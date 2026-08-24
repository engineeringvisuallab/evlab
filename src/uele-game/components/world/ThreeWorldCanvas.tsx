import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import React, { useEffect, useRef } from 'react';
import { TimeOfDay, WeatherType } from '../../types/game';
import { buildMiniCountryTerrain, getNearbyLandmark, LandmarkZone } from '../../utils/miniCountryTerrain';
import { buildMiniCountryRiver } from '../../utils/miniCountryRiver';
import { buildCountrySceneObjects } from '../../utils/countryObjectsBuilder';
import { buildRealisticGrassSystem, RealisticGrassSystem } from '../../utils/realisticGrassSystem';
import { buildTrafficSystem, TrafficSystem } from '../../utils/trafficSimulation';
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
  teleportTarget: LandmarkZone | null;
  onTeleportComplete: () => void;
  vehicleActionRef?: React.MutableRefObject<{
    honk: () => void;
    toggleHeadlights: () => void;
    resetVehicle: () => void;
  } | null>;
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
  teleportTarget,
  onTeleportComplete,
  vehicleActionRef,
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
  const riverSystemRef = useRef<ReturnType<typeof buildMiniCountryRiver> | null>(null);
  const countryObjectsRef = useRef<ReturnType<typeof buildCountrySceneObjects> | null>(null);
  const grassSystemRef = useRef<RealisticGrassSystem | null>(null);
  const trafficSystemRef = useRef<TrafficSystem | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Realism upgrade: physically-based sky dome + baked IBL environment map,
  // post-processing composer (bloom / anti-aliasing / vignette / output
  // color grading), and a night starfield.
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const skyRef = useRef<Sky | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const pmremGeneratorRef = useRef<THREE.PMREMGenerator | null>(null);
  const envRenderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const updateSkyEnvRef = useRef<((preset: TimeOfDay) => void) | null>(null);

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
  ]);

  // Input Tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Orbit / Camera drag controls
  const isDragging = useRef(false);
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
    scene.fog = new THREE.FogExp2(0xcde3f5, 0.0018);

    const camera = new THREE.PerspectiveCamera(55, aspect, 0.5, 2500);
    camera.position.set(20, 15, 75);
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
    renderer.toneMappingExposure = 0.75;

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
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.5);
    dirLight.position.set(120, 220, 120);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 650;
    dirLight.shadow.camera.left = -180;
    dirLight.shadow.camera.right = 180;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = -180;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 4B. Physically-based Sky Dome (Preetham atmospheric scattering) —
    // replaces the flat solid-color background with a real sun-driven sky,
    // and doubles as the source for a baked image-based-lighting (IBL)
    // environment map so water, vehicle paint, glass & metal all pick up
    // believable reflections instead of looking flat/matte.
    scene.background = null;
    scene.fog = new THREE.FogExp2(0xcde3f5, 0.0018);

    const sky = new Sky();
    sky.scale.setScalar(8000);
    scene.add(sky);
    skyRef.current = sky;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    pmremGeneratorRef.current = pmremGenerator;

    const SKY_PRESETS: Record<
      TimeOfDay,
      {
        elevation: number;
        azimuth: number;
        turbidity: number;
        rayleigh: number;
        mieCoefficient: number;
        mieDirectionalG: number;
        sunColor: number;
        sunIntensity: number;
        hemiSky: number;
        hemiGround: number;
        hemiIntensity: number;
        ambientColor: number;
        ambientIntensity: number;
        fogColor: number;
        fogDensity: number;
        envIntensity: number;
      }
    > = {
      dawn: {
        elevation: 4, azimuth: 100, turbidity: 6, rayleigh: 1.8, mieCoefficient: 0.006, mieDirectionalG: 0.85,
        sunColor: 0xfda4af, sunIntensity: 0.75, hemiSky: 0xfecdd3, hemiGround: 0x3f3350, hemiIntensity: 0.35,
        ambientColor: 0xffe4e6, ambientIntensity: 0.3, fogColor: 0xfecdd3, fogDensity: 0.002, envIntensity: 0.4,
      },
      day: {
        elevation: 48, azimuth: 178, turbidity: 2.5, rayleigh: 0.9, mieCoefficient: 0.0018, mieDirectionalG: 0.7,
        sunColor: 0xfff7ed, sunIntensity: 0.8, hemiSky: 0xbfe0ff, hemiGround: 0x3f5468, hemiIntensity: 0.32,
        ambientColor: 0xdbeafe, ambientIntensity: 0.22, fogColor: 0xcde3f5, fogDensity: 0.0018, envIntensity: 0.35,
      },
      golden: {
        elevation: 6, azimuth: 262, turbidity: 5.5, rayleigh: 1.6, mieCoefficient: 0.006, mieDirectionalG: 0.82,
        sunColor: 0xfbbf24, sunIntensity: 0.95, hemiSky: 0xfde68a, hemiGround: 0x4a2c1a, hemiIntensity: 0.38,
        ambientColor: 0xfef3c7, ambientIntensity: 0.35, fogColor: 0xfef3c7, fogDensity: 0.0018, envIntensity: 0.4,
      },
      night: {
        elevation: -12, azimuth: 60, turbidity: 2, rayleigh: 0.6, mieCoefficient: 0.001, mieDirectionalG: 0.7,
        sunColor: 0x38bdf8, sunIntensity: 0.2, hemiSky: 0x1e2a4a, hemiGround: 0x020617, hemiIntensity: 0.28,
        ambientColor: 0x1e293b, ambientIntensity: 0.22, fogColor: 0x0f172a, fogDensity: 0.0028, envIntensity: 0.15,
      },
    };

    const sunVector = new THREE.Vector3();
    const updateSkyEnvironment = (preset: TimeOfDay) => {
      const cfg = SKY_PRESETS[preset];
      const uniforms = sky.material.uniforms;
      uniforms['turbidity'].value = cfg.turbidity;
      uniforms['rayleigh'].value = cfg.rayleigh;
      uniforms['mieCoefficient'].value = cfg.mieCoefficient;
      uniforms['mieDirectionalG'].value = cfg.mieDirectionalG;

      const phi = THREE.MathUtils.degToRad(90 - cfg.elevation);
      const theta = THREE.MathUtils.degToRad(cfg.azimuth);
      sunVector.setFromSphericalCoords(1, phi, theta);
      uniforms['sunPosition'].value.copy(sunVector);

      if (dirLightRef.current) {
        dirLightRef.current.position.copy(sunVector).multiplyScalar(220);
        dirLightRef.current.color.setHex(cfg.sunColor);
        dirLightRef.current.intensity = cfg.sunIntensity;
      }
      if (hemiLightRef.current) {
        hemiLightRef.current.color.setHex(cfg.hemiSky);
        hemiLightRef.current.groundColor.setHex(cfg.hemiGround);
        hemiLightRef.current.intensity = cfg.hemiIntensity;
      }
      if (ambientLightRef.current) {
        ambientLightRef.current.color.setHex(cfg.ambientColor);
        ambientLightRef.current.intensity = cfg.ambientIntensity;
      }
      scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.fogDensity);

      // Bake a fresh IBL environment map from the current sky so every
      // MeshStandardMaterial / MeshPhysicalMaterial in the scene (water,
      // car paint, chrome, glass, wet roads) reflects the current sky
      // instead of looking flat. Cheap enough to only run on time-of-day
      // changes (not every frame).
      envRenderTargetRef.current?.dispose();
      const renderTarget = pmremGenerator.fromScene(sky as unknown as THREE.Scene, 0.02);
      envRenderTargetRef.current = renderTarget;
      scene.environment = renderTarget.texture;
      // Without this, the baked sky IBL lights every material at full
      // strength ON TOP of the sun/hemi/ambient lights above, which is
      // what was washing the whole scene out to white. Scaling it down
      // keeps reflections/ambient fill subtle instead of a second sun.
      scene.environmentIntensity = cfg.envIntensity;

      if (starsRef.current) {
        starsRef.current.visible = preset === 'night';
      }
    };
    updateSkyEnvRef.current = updateSkyEnvironment;
    updateSkyEnvironment('day');

    // 4C. Night starfield (only visible once time-of-day switches to night)
    const starCount = 1400;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 3200 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.85); // keep mostly above horizon
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = Math.abs(r * Math.cos(phi));
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3.2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.85,
      fog: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    stars.visible = false;
    scene.add(stars);
    starsRef.current = stars;

    // 4D. Post-processing composer — subtle bloom (sun glints, headlights,
    // neon signage), SMAA anti-aliasing, a soft cinematic vignette, and a
    // final output pass that restores correct ACES tone-mapping / color
    // space (required whenever rendering goes through a composer instead
    // of straight to the canvas).
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(initWidth, initHeight), 0.07, 0.3, 0.98);
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;

    composer.addPass(new SMAAPass());

    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms['offset'].value = 1.05;
    vignettePass.uniforms['darkness'].value = 1.1;
    composer.addPass(vignettePass);

    composer.addPass(new OutputPass());
    composerRef.current = composer;

    // 5. Build Mini Country Terrain (800m x 800m)
    const terrain = buildMiniCountryTerrain();
    scene.add(terrain.mesh);
    elevationSamplerRef.current = terrain.getElevationAt;

    // 6. Build Karatoya River & Reservoir
    const river = buildMiniCountryRiver();
    scene.add(river.waterMesh);
    scene.add(river.lakeMesh);
    river.pondWaterMeshes.forEach((p) => scene.add(p));
    riverSystemRef.current = river;

    // 7. Build Country 3D Structures (Wind Turbines, Hydro Dam, City, Airport, Solar Farm, Villages, Trees)
    const countryObjects = buildCountrySceneObjects(terrain.getElevationAt);
    scene.add(countryObjects.group);
    countryObjectsRef.current = countryObjects;

    // 8. Build Realistic 3D Grass Blades, Wildflowers & Kashful Reeds Field
    const grassSys = buildRealisticGrassSystem(terrain.getElevationAt, terrain.isPointOnRoad);
    scene.add(grassSys.mesh);
    scene.add(grassSys.flowerMesh);
    scene.add(grassSys.kashfulMesh);
    grassSystemRef.current = grassSys;

    // 8B. Autonomous Traffic System (Buses, Trucks, CNGs, Sedans on Roads & Bridges)
    const trafficSys = buildTrafficSystem(terrain.getElevationAt);
    scene.add(trafficSys.group);
    trafficSystemRef.current = trafficSys;

    // 9. Initialize Playable Vehicle & Character
    const initialVehiclePos = new THREE.Vector3(20, terrain.getElevationAt(20, 50) + 0.25, 50);
    const vehicle = new PlayableVehicle(vehicleType, initialVehiclePos, 0);
    scene.add(vehicle.group);
    vehicleRef.current = vehicle;

    const initialCharPos = new THREE.Vector3(22.5, terrain.getElevationAt(22.5, 50), 50);
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
        composerRef.current?.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          composerRef.current?.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Initial warm render call
    composer.render();

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

      if (getElevation && vehicleRef.current && characterRef.current) {
        const activeVehicle = vehicleRef.current;
        const activeChar = characterRef.current;

        if (currentProps.isDriving) {
          // 1. VEHICLE DRIVING PHYSICS
          let throttle = 0;
          if (keys['KeyW'] || keys['ArrowUp']) throttle += 1;
          if (keys['KeyS'] || keys['ArrowDown']) throttle -= 1;

          let steer = 0;
          if (keys['KeyA'] || keys['ArrowLeft']) steer -= 1;
          if (keys['KeyD'] || keys['ArrowRight']) steer += 1;

          const brake = keys['KeyS'] || keys['ArrowDown'];
          const handbrake = keys['Space'] || false;

          activeVehicle.updatePhysics(delta, { throttle, steer, brake, handbrake }, getElevation);

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
        const targetPos = currentProps.isDriving ? activeVehicle.state.position : activeChar.state.position;

        if (currentProps.cameraView === 'chase' && currentProps.isDriving) {
          // Chase Cam
          const heading = activeVehicle.state.heading;
          const camDist = 9.5;
          const camHeight = 3.8;
          const camOffset = new THREE.Vector3(
            Math.sin(heading) * camDist,
            camHeight,
            Math.cos(heading) * camDist
          );

          const desiredCamPos = targetPos.clone().add(camOffset);
          camera.position.lerp(desiredCamPos, 8 * delta);
          camera.lookAt(targetPos.x, targetPos.y + 1.2, targetPos.z);

        } else if (currentProps.cameraView === 'hood' && currentProps.isDriving) {
          // First-person Hood View
          const heading = activeVehicle.state.heading;
          const hoodOffset = new THREE.Vector3(
            -Math.sin(heading) * 1.4,
            1.2,
            -Math.cos(heading) * 1.4
          );
          camera.position.copy(targetPos).add(hoodOffset);

          const lookDir = new THREE.Vector3(
            -Math.sin(heading) * 20,
            0,
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
      if (countryObjectsRef.current) {
        countryObjectsRef.current.updateAnimations(timeNow * 0.001, delta);
      }
      if (grassSystemRef.current) {
        grassSystemRef.current.updateAnimation(timeNow * 0.001);
      }
      if (trafficSystemRef.current) {
        trafficSystemRef.current.update(delta);
      }
      if (riverSystemRef.current) {
        const monsoon = currentProps.weather === 'rain' ? 0.65 : 0;
        riverSystemRef.current.updateAnimation(timeNow * 0.001, monsoon, 0);
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
      composer.render();
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
      composerRef.current?.dispose();
      envRenderTargetRef.current?.dispose();
      pmremGeneratorRef.current?.dispose();
      sky.geometry.dispose();
      (sky.material as THREE.Material).dispose();
      starGeo.dispose();
      starMat.dispose();
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
          if (vehicleRef.current) {
            vehicleRef.current.setHeadlights(!vehicleRef.current.state.headlightsOn);
          }
        },
        resetVehicle: () => {
          if (vehicleRef.current && elevationSamplerRef.current) {
            const elev = elevationSamplerRef.current(vehicleRef.current.state.position.x, vehicleRef.current.state.position.z);
            vehicleRef.current.resetPosition(elev);
          }
        },
      };
    }
  }, [vehicleActionRef]);

  // Handle Teleportation when requested via Map
  useEffect(() => {
    if (teleportTarget && elevationSamplerRef.current) {
      const [tx, tz] = teleportTarget.center;
      const ty = elevationSamplerRef.current(tx, tz);

      if (isDriving && vehicleRef.current) {
        vehicleRef.current.state.position.set(tx, ty + 0.5, tz);
        vehicleRef.current.state.velocity.set(0, 0, 0);
      } else if (characterRef.current) {
        characterRef.current.state.position.set(tx, ty, tz);
      }
      onTeleportComplete();
    }
  }, [teleportTarget, isDriving, onTeleportComplete]);

  // Environmental Lighting & Weather Dynamics — driven by the physically
  // based Sky dome (sun position/color/fog/hemisphere all update together,
  // plus the IBL environment map gets re-baked so reflections stay in sync).
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current || !ambientLightRef.current) return;

    updateSkyEnvRef.current?.(timeOfDay);

    if (timeOfDay === 'night') {
      vehicleRef.current?.setHeadlights(true);
    }

    if (rainParticlesRef.current) {
      rainParticlesRef.current.visible = weather === 'rain';
    }

    // Overcast/rainy weather thickens the haze and mutes the bloom a touch,
    // regardless of time of day — keeps storms from looking blown out.
    if (bloomPassRef.current) {
      bloomPassRef.current.strength = weather === 'rain' ? 0.04 : 0.07;
    }
    if (sceneRef.current.fog instanceof THREE.FogExp2 && weather === 'rain') {
      sceneRef.current.fog.density *= 1.6;
    }
  }, [timeOfDay, weather]);

  // Toggle Character Visibility when entering/exiting car
  useEffect(() => {
    if (characterRef.current && vehicleRef.current && elevationSamplerRef.current) {
      if (isDriving) {
        characterRef.current.group.visible = false;
        audioEngine.playDoorThud();
      } else {
        const carPos = vehicleRef.current.state.position;
        const carHeading = vehicleRef.current.state.heading;
        const doorOffset = new THREE.Vector3(Math.cos(carHeading) * 2.2, 0, -Math.sin(carHeading) * 2.2);

        const spawnX = carPos.x + doorOffset.x;
        const spawnZ = carPos.z + doorOffset.z;
        const spawnY = elevationSamplerRef.current(spawnX, spawnZ);

        characterRef.current.state.position.set(spawnX, spawnY, spawnZ);
        characterRef.current.state.heading = carHeading;
        characterRef.current.group.visible = true;
        audioEngine.playDoorThud();
      }
    }
  }, [isDriving]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      if (e.code === 'KeyL' && propsRef.current.isDriving && vehicleRef.current) {
        vehicleRef.current.setHeadlights(!vehicleRef.current.state.headlightsOn);
      }

      // 'R' = Reset Car
      if (e.code === 'KeyR' && propsRef.current.isDriving && vehicleRef.current && elevationSamplerRef.current) {
        const elev = elevationSamplerRef.current(vehicleRef.current.state.position.x, vehicleRef.current.state.position.z);
        vehicleRef.current.resetPosition(elev);
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
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    orbitTheta.current -= deltaX * 0.006;
    orbitPhi.current = Math.max(0.05, Math.min(Math.PI / 2.1, orbitPhi.current + deltaY * 0.006));

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
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
