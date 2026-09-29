import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EQUIPMENT_LIST } from '../data/plantData';
import { EquipmentId, PlantState, TimeOfDay } from '../types';

interface ThreeCanvasProps {
  plantState: PlantState;
  onSelectEquipment: (id: EquipmentId) => void;
  hoveredEquipment: EquipmentId | null;
  setHoveredEquipment: (id: EquipmentId | null) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  plantState,
  onSelectEquipment,
  hoveredEquipment,
  setHoveredEquipment,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Interactive Meshes Map
  const interactiveObjectsRef = useRef<Map<string, EquipmentId>>(new Map());
  const animatedObjectsRef = useRef<{
    waterSurfaces: THREE.Mesh[];
    riverMesh?: THREE.Mesh;
    scrapers: THREE.Group[];
    paddles: THREE.Group[];
    mixers: THREE.Group[];
    flowParticles: THREE.Points[];
    uvLamps: THREE.Mesh[];
    rainParticles?: THREE.Points;
  }>({
    waterSurfaces: [],
    scrapers: [],
    paddles: [],
    mixers: [],
    flowParticles: [],
    uvLamps: [],
  });

  // Lighting References
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const nightLightsRef = useRef<THREE.Light[]>([]);

  // Camera Target Interpolation
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(-15, 28, 42));
  const targetCamLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Orbit controls state (custom lightweight smooth orbit)
  const isDragging = useRef(false);
  const isRightDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const sphericalCoords = useRef({ radius: 55, phi: Math.PI / 3.4, theta: Math.PI / 4.2 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd7e9f7);
    scene.fog = new THREE.FogExp2(0xd7e9f7, 0.007);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 500);
    camera.position.set(-15, 28, 42);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting System
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x5a7888, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff7e8, 1.3);
    dirLight.position.set(-35, 45, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 160;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xddeeff, 0.35);
    scene.add(ambientLight);

    // 5. Materials Factory
    const materials = {
      grass: new THREE.MeshStandardMaterial({ color: 0x4a7c43, roughness: 0.85, metalness: 0.05 }),
      riverbank: new THREE.MeshStandardMaterial({ color: 0xb59e78, roughness: 0.9 }),
      concrete: new THREE.MeshStandardMaterial({ color: 0xc8ced4, roughness: 0.7, metalness: 0.1 }),
      concreteDark: new THREE.MeshStandardMaterial({ color: 0x949da6, roughness: 0.8 }),
      asphalt: new THREE.MeshStandardMaterial({ color: 0x3d434a, roughness: 0.9 }),
      roadLines: new THREE.MeshStandardMaterial({ color: 0xf4d03f, roughness: 0.5 }),
      pipeBlue: new THREE.MeshStandardMaterial({ color: 0x0088dd, roughness: 0.3, metalness: 0.6 }),
      pipeSilver: new THREE.MeshStandardMaterial({ color: 0xd0d8e0, roughness: 0.25, metalness: 0.85 }),
      steel: new THREE.MeshStandardMaterial({ color: 0x7b8893, roughness: 0.4, metalness: 0.7 }),
      tankDome: new THREE.MeshStandardMaterial({ color: 0xe6edf2, roughness: 0.35, metalness: 0.3 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0x2288bb, transparent: true, opacity: 0.75, roughness: 0.1, transmission: 0.6, thickness: 0.5 }),
      greenRoof: new THREE.MeshStandardMaterial({ color: 0x3d6b38, roughness: 0.9 }),
      sludge: new THREE.MeshStandardMaterial({ color: 0x5a4430, roughness: 0.95 }),
      uvGlow: new THREE.MeshBasicMaterial({ color: 0xaa33ff }),
      waterRaw: new THREE.MeshStandardMaterial({ color: 0x7a8360, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.88 }),
      waterCoagulated: new THREE.MeshStandardMaterial({ color: 0x5e958f, roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.85 }),
      waterClarified: new THREE.MeshStandardMaterial({ color: 0x2d9bbb, roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.82 }),
      waterFiltered: new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.05, metalness: 0.7, transparent: true, opacity: 0.78 }),
      waterPure: new THREE.MeshStandardMaterial({ color: 0x00bfff, roughness: 0.04, metalness: 0.8, transparent: true, opacity: 0.75 }),
      hazardYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 }),
      treeFoliage: new THREE.MeshStandardMaterial({ color: 0x2e5c2b, roughness: 0.9 }),
      treeTrunk: new THREE.MeshStandardMaterial({ color: 0x5a3e28, roughness: 0.9 }),
      highlight: new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5, roughness: 0.2 }),
    };

    // Helper: Register Interactive Object
    const registerInteractive = (mesh: THREE.Object3D, eqId: EquipmentId) => {
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.userData = { equipmentId: eqId, originalMaterial: child.material };
          interactiveObjectsRef.current.set(child.uuid, eqId);
        }
      });
    };

    // -------------------------------------------------------------
    // BUILD SCENERY & TERRAIN
    // -------------------------------------------------------------
    // Main Plant Foundation Ground
    const groundGeo = new THREE.PlaneGeometry(80, 70);
    const groundMesh = new THREE.Mesh(groundGeo, materials.concrete);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(2, 0, 0);
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Green Grass Surrounding Land
    const grassGeo = new THREE.PlaneGeometry(160, 140);
    const grassMesh = new THREE.Mesh(grassGeo, materials.grass);
    grassMesh.rotation.x = -Math.PI / 2;
    grassMesh.position.set(15, -0.05, 0);
    grassMesh.receiveShadow = true;
    scene.add(grassMesh);

    // River Water Plane on the left
    const riverGeo = new THREE.PlaneGeometry(45, 140, 40, 40);
    const riverWaterMat = new THREE.MeshStandardMaterial({
      color: 0x487569,
      roughness: 0.15,
      metalness: 0.45,
      transparent: true,
      opacity: 0.92,
    });
    const riverMesh = new THREE.Mesh(riverGeo, riverWaterMat);
    riverMesh.rotation.x = -Math.PI / 2;
    riverMesh.position.set(-42, -0.5, 0);
    riverMesh.receiveShadow = true;
    scene.add(riverMesh);
    animatedObjectsRef.current.riverMesh = riverMesh;

    // River Bank Sloped Shoreline
    const bankGeo = new THREE.BoxGeometry(7, 1.2, 140);
    const bankMesh = new THREE.Mesh(bankGeo, materials.riverbank);
    bankMesh.position.set(-22, -0.3, 0);
    bankMesh.rotation.z = -0.05;
    scene.add(bankMesh);

    // Perimeter Roads & Walkways
    const roadPerimeterGeo = new THREE.PlaneGeometry(74, 64);
    const roadPerimeterMesh = new THREE.Mesh(roadPerimeterGeo, materials.asphalt);
    roadPerimeterMesh.rotation.x = -Math.PI / 2;
    roadPerimeterMesh.position.set(2, 0.02, 0);
    roadPerimeterMesh.receiveShadow = true;
    scene.add(roadPerimeterMesh);

    // Inner Plant Concrete Slabs
    const slab1 = new THREE.Mesh(new THREE.BoxGeometry(34, 0.3, 24), materials.concreteDark);
    slab1.position.set(-10, 0.15, -7);
    slab1.receiveShadow = true;
    scene.add(slab1);

    const slab2 = new THREE.Mesh(new THREE.BoxGeometry(26, 0.3, 26), materials.concreteDark);
    slab2.position.set(10, 0.15, 8);
    slab2.receiveShadow = true;
    scene.add(slab2);

    // Add trees and landscaping
    const addTree = (x: number, z: number, scale = 1) => {
      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.4 * scale, 2.5 * scale, 6), materials.treeTrunk);
      trunk.position.y = (2.5 * scale) / 2;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const foliage1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8 * scale, 1), materials.treeFoliage);
      foliage1.position.y = 2.8 * scale;
      foliage1.castShadow = true;
      treeGroup.add(foliage1);

      const foliage2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3 * scale, 1), materials.treeFoliage);
      foliage2.position.set(0.4 * scale, 3.8 * scale, 0);
      foliage2.castShadow = true;
      treeGroup.add(foliage2);

      treeGroup.position.set(x, 0, z);
      scene.add(treeGroup);
    };

    // Plant Perimeter Trees
    for (let i = -60; i <= 60; i += 12) {
      addTree(-18, i, 0.8 + Math.random() * 0.4);
      addTree(42, i, 0.9 + Math.random() * 0.4);
    }
    for (let i = -15; i <= 40; i += 10) {
      addTree(i, -32, 0.85 + Math.random() * 0.3);
      addTree(i, 32, 0.85 + Math.random() * 0.3);
    }

    // -------------------------------------------------------------
    // 1. RIVER WATER INTAKE & PUMPING STATION ("নদীর পানি উত্তোলন")
    // -------------------------------------------------------------
    const intakeGroup = new THREE.Group();
    intakeGroup.position.set(-28, 0, 5);

    // Intake Concrete Pier into River
    const pierGeo = new THREE.BoxGeometry(9, 2.4, 8);
    const pier = new THREE.Mesh(pierGeo, materials.concreteDark);
    pier.position.set(0, 0.6, 0);
    pier.castShadow = true;
    pier.receiveShadow = true;
    intakeGroup.add(pier);

    // Intake Sluice Water Screens (Bar Screen Structure)
    for (let i = -2.5; i <= 2.5; i += 2.5) {
      const screenChamber = new THREE.Mesh(new THREE.BoxGeometry(2, 2.2, 1.8), materials.concrete);
      screenChamber.position.set(-3.8, 0.4, i);
      intakeGroup.add(screenChamber);

      // Bar Screen Grate
      const grate = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 1.4), materials.steel);
      grate.position.set(-4.85, 0.2, i);
      intakeGroup.add(grate);
    }

    // 3 Heavy Duty Vertical Turbine Pumps
    for (let i = -2.5; i <= 2.5; i += 2.5) {
      // Pump base
      const pBase = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.6, 16), materials.pipeBlue);
      pBase.position.set(1.5, 2.0, i);
      pBase.castShadow = true;
      intakeGroup.add(pBase);

      // Electric Motor top
      const pMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.2, 16), materials.pipeBlue);
      pMotor.position.set(1.5, 2.9, i);
      pMotor.castShadow = true;
      intakeGroup.add(pMotor);

      // Motor top cap
      const pCap = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 0.3, 16), materials.pipeSilver);
      pCap.position.set(1.5, 3.65, i);
      intakeGroup.add(pCap);

      // Suction downpipe into river
      const suctionPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3, 12), materials.pipeBlue);
      suctionPipe.position.set(-1.8, 0.2, i);
      intakeGroup.add(suctionPipe);

      // Discharge elbow to header
      const dischargePipe = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.2, 12), materials.pipeBlue);
      dischargePipe.rotation.z = Math.PI / 2;
      dischargePipe.position.set(2.6, 2.2, i);
      intakeGroup.add(dischargePipe);
    }

    // Header manifold pipe
    const intakeHeader = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 7.5, 16), materials.pipeBlue);
    intakeHeader.position.set(3.7, 2.2, 0);
    intakeGroup.add(intakeHeader);

    // Safety Railings around pier
    const railMat = materials.hazardYellow;
    const railFront = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 7.8), railMat);
    railFront.position.set(-4.4, 2.1, 0);
    intakeGroup.add(railFront);

    scene.add(intakeGroup);
    registerInteractive(intakeGroup, 'river_intake');

    // -------------------------------------------------------------
    // 2. COAGULATION RAPID FLASH MIXER ("কোয়াগুলেশন")
    // -------------------------------------------------------------
    const coagGroup = new THREE.Group();
    coagGroup.position.set(-14, 0, -9);

    // Coagulation Basin Concrete
    const coagBasinGeo = new THREE.BoxGeometry(6.5, 3.2, 6.5);
    const coagBasin = new THREE.Mesh(coagBasinGeo, materials.concreteDark);
    coagBasin.position.set(0, 1.6, 0);
    coagBasin.castShadow = true;
    coagBasin.receiveShadow = true;
    coagGroup.add(coagBasin);

    // Inner water surface
    const coagWaterGeo = new THREE.BoxGeometry(5.8, 0.2, 5.8);
    const coagWater = new THREE.Mesh(coagWaterGeo, materials.waterCoagulated);
    coagWater.position.set(0, 2.9, 0);
    coagGroup.add(coagWater);
    animatedObjectsRef.current.waterSurfaces.push(coagWater);

    // Flash Mixer Motor & Vertical Shaft
    const mixerPlatform = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 6.4), materials.steel);
    mixerPlatform.position.set(0, 3.4, 0);
    coagGroup.add(mixerPlatform);

    const mixerMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 1.1, 12), materials.pipeBlue);
    mixerMotor.position.set(0, 4.1, 0);
    mixerMotor.castShadow = true;
    coagGroup.add(mixerMotor);

    // Rotating Mixer Impeller Group
    const mixerShaftGroup = new THREE.Group();
    mixerShaftGroup.position.set(0, 3.4, 0);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), materials.steel);
    shaft.position.set(0, -1.3, 0);
    mixerShaftGroup.add(shaft);

    // Impeller blades
    for (let b = 0; b < 4; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.05), materials.steel);
      blade.rotation.y = (b * Math.PI) / 2;
      blade.position.set(0, -2.1, 0);
      mixerShaftGroup.add(blade);
    }
    coagGroup.add(mixerShaftGroup);
    animatedObjectsRef.current.mixers.push(mixerShaftGroup);

    // Chemical Dosing Line & Tank
    const chemDoseTank = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.2, 16), materials.pipeSilver);
    chemDoseTank.position.set(-4.2, 1.1, 1.5);
    coagGroup.add(chemDoseTank);

    const chemPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.2, 8), materials.pipeSilver);
    chemPipe.rotation.z = Math.PI / 2;
    chemPipe.position.set(-2.0, 3.2, 1.5);
    coagGroup.add(chemPipe);

    scene.add(coagGroup);
    registerInteractive(coagGroup, 'coagulation');

    // -------------------------------------------------------------
    // 3. FLOCCULATION BASIN & PADDLES ("ফ্লোকুলশন")
    // -------------------------------------------------------------
    const flocGroup = new THREE.Group();
    flocGroup.position.set(-6, 0, -9);

    // Flocculation Multi-Chamber Basin
    const flocBasin = new THREE.Mesh(new THREE.BoxGeometry(9.5, 3.2, 6.5), materials.concrete);
    flocBasin.position.set(0, 1.6, 0);
    flocBasin.castShadow = true;
    flocBasin.receiveShadow = true;
    flocGroup.add(flocBasin);

    // Floc water surface
    const flocWater = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.2, 5.8), materials.waterCoagulated);
    flocWater.position.set(0, 2.85, 0);
    flocGroup.add(flocWater);
    animatedObjectsRef.current.waterSurfaces.push(flocWater);

    // Baffle Dividers
    for (let bx = -2.2; bx <= 2.2; bx += 4.4) {
      const baffle = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.8, 4.6), materials.concreteDark);
      baffle.position.set(bx, 1.6, 0);
      flocGroup.add(baffle);
    }

    // 3 Slow-Revolving Paddle Flocculators
    for (let px = -3; px <= 3; px += 3) {
      const paddleGroup = new THREE.Group();
      paddleGroup.position.set(px, 2.3, 0);

      // Horizontal central axle
      const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.8, 8), materials.steel);
      axle.rotation.x = Math.PI / 2;
      paddleGroup.add(axle);

      // Paddle blades
      for (let p = 0; p < 4; p++) {
        const bladeArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.3), materials.steel);
        bladeArm.rotation.z = (p * Math.PI) / 2;
        paddleGroup.add(bladeArm);

        const paddleBoard = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 4.2), materials.concreteDark);
        paddleBoard.position.set(0, 0.85 * (p % 2 === 0 ? 1 : -1), 0);
        paddleBoard.rotation.z = (p * Math.PI) / 2;
        paddleGroup.add(paddleBoard);
      }

      // Overhead Drive Motor
      const pMotor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.8), materials.pipeBlue);
      pMotor.position.set(px, 3.6, 0);
      flocGroup.add(pMotor);

      flocGroup.add(paddleGroup);
      animatedObjectsRef.current.paddles.push(paddleGroup);
    }

    scene.add(flocGroup);
    registerInteractive(flocGroup, 'flocculation');

    // -------------------------------------------------------------
    // 4. PRIMARY CLARIFIER 1 ("থিতানো ট্যাংক ১")
    // -------------------------------------------------------------
    const createClarifier = (x: number, z: number, eqId: EquipmentId) => {
      const clarGroup = new THREE.Group();
      clarGroup.position.set(x, 0, z);

      // Outer cylindrical concrete wall
      const wallGeo = new THREE.CylinderGeometry(7.2, 7.2, 2.8, 36, 1, true);
      const wallMesh = new THREE.Mesh(wallGeo, materials.concrete);
      wallMesh.position.set(0, 1.4, 0);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      clarGroup.add(wallMesh);

      // Bottom cone base
      const bottomMesh = new THREE.Mesh(new THREE.CylinderGeometry(7.1, 7.1, 0.3, 36), materials.concreteDark);
      bottomMesh.position.set(0, 0.15, 0);
      bottomMesh.receiveShadow = true;
      clarGroup.add(bottomMesh);

      // Clarified water surface
      const waterMesh = new THREE.Mesh(new THREE.CylinderGeometry(6.9, 6.9, 0.1, 36), materials.waterClarified);
      waterMesh.position.set(0, 2.4, 0);
      clarGroup.add(waterMesh);
      animatedObjectsRef.current.waterSurfaces.push(waterMesh);

      // Central Inflow Stilling Well
      const centerWell = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.4, 20, 1, true), materials.pipeBlue);
      centerWell.position.set(0, 1.7, 0);
      clarGroup.add(centerWell);

      // Central Pillar
      const centerPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 3.2, 16), materials.concreteDark);
      centerPillar.position.set(0, 1.6, 0);
      clarGroup.add(centerPillar);

      // Rotating Scraper Bridge Truss
      const scraperGroup = new THREE.Group();
      scraperGroup.position.set(0, 2.7, 0);

      // Bridge Walkway
      const bridgeWalkway = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.2, 1.1), materials.steel);
      bridgeWalkway.position.set(0, 0.1, 0);
      bridgeWalkway.castShadow = true;
      scraperGroup.add(bridgeWalkway);

      // Handrails on bridge
      const rail1 = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.6, 0.05), materials.hazardYellow);
      rail1.position.set(0, 0.5, 0.5);
      scraperGroup.add(rail1);
      const rail2 = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.6, 0.05), materials.hazardYellow);
      rail2.position.set(0, 0.5, -0.5);
      scraperGroup.add(rail2);

      // Submerged Bottom Scraper Blades & Vertical Supports
      for (let s = -5.5; s <= 5.5; s += 1.8) {
        if (Math.abs(s) < 1.0) continue;
        const vArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), materials.steel);
        vArm.position.set(s, -1.1, 0);
        scraperGroup.add(vArm);

        const bBlade = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.05), materials.steel);
        bBlade.position.set(s, -2.1, 0);
        bBlade.rotation.y = Math.PI / 4;
        scraperGroup.add(bBlade);
      }

      // Center Drive Motor on bridge
      const centerMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.7, 12), materials.pipeBlue);
      centerMotor.position.set(0, 0.6, 0);
      scraperGroup.add(centerMotor);

      clarGroup.add(scraperGroup);
      animatedObjectsRef.current.scrapers.push(scraperGroup);

      // Peripheral Effluent V-Notch Weir Ring
      const weirMesh = new THREE.Mesh(new THREE.TorusGeometry(6.6, 0.12, 8, 36), materials.steel);
      weirMesh.rotation.x = Math.PI / 2;
      weirMesh.position.set(0, 2.5, 0);
      clarGroup.add(weirMesh);

      scene.add(clarGroup);
      registerInteractive(clarGroup, eqId);
      return clarGroup;
    };

    createClarifier(-8, 4, 'clarifier_1');
    createClarifier(5, -4, 'clarifier_2');

    // -------------------------------------------------------------
    // 5. FILTRATION FACILITY ("ফিল্ট্রেশন ভবন")
    // -------------------------------------------------------------
    const filtGroup = new THREE.Group();
    filtGroup.position.set(9, 0, 7);

    // Filtration Main Building Foundation / Gallery
    const filtBase = new THREE.Mesh(new THREE.BoxGeometry(16, 2.8, 14), materials.concrete);
    filtBase.position.set(0, 1.4, 0);
    filtBase.castShadow = true;
    filtBase.receiveShadow = true;
    filtGroup.add(filtBase);

    // Modern Green Roof Canopy Section
    const canopyMesh = new THREE.Mesh(new THREE.BoxGeometry(16.2, 0.6, 6.5), materials.concreteDark);
    canopyMesh.position.set(0, 4.4, -3.8);
    filtGroup.add(canopyMesh);

    const greenRoof = new THREE.Mesh(new THREE.BoxGeometry(15.8, 0.2, 6.1), materials.greenRoof);
    greenRoof.position.set(0, 4.75, -3.8);
    filtGroup.add(greenRoof);

    // Canopy Pillar columns
    for (let cx = -7; cx <= 7; cx += 14) {
      for (let cz = -6.5; cz <= -1; cz += 5.5) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4.0, 0.6), materials.concrete);
        pillar.position.set(cx, 2.2, cz);
        filtGroup.add(pillar);
      }
    }

    // Rapid Gravity Sand Filter Open Chambers
    for (let fx = -5.5; fx <= 5.5; fx += 5.5) {
      // Concrete basin walls
      const fChamber = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.2, 5.8), materials.concreteDark);
      fChamber.position.set(fx, 2.2, 3.5);
      filtGroup.add(fChamber);

      // Sand Filter Media Bed
      const sandBed = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.2, 5.4), materials.riverbank);
      sandBed.position.set(fx, 2.1, 3.5);
      filtGroup.add(sandBed);

      // Filter Water Layer
      const fWater = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.3, 5.4), materials.waterFiltered);
      fWater.position.set(fx, 2.65, 3.5);
      filtGroup.add(fWater);
      animatedObjectsRef.current.waterSurfaces.push(fWater);
    }

    // Pressurized Activated Carbon Filter Vessels (Horizontal Cylinders)
    for (let cz = -5.2; cz <= -2.2; cz += 3) {
      const vessel = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 13, 24), materials.pipeSilver);
      vessel.rotation.z = Math.PI / 2;
      vessel.position.set(0, 2.2, cz);
      vessel.castShadow = true;
      filtGroup.add(vessel);

      // End caps
      const cap1 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), materials.pipeSilver);
      cap1.position.set(-6.5, 2.2, cz);
      filtGroup.add(cap1);
      const cap2 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), materials.pipeSilver);
      cap2.position.set(6.5, 2.2, cz);
      filtGroup.add(cap2);

      // Support saddles
      const saddle1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1.4), materials.concreteDark);
      saddle1.position.set(-4, 0.8, cz);
      filtGroup.add(saddle1);
      const saddle2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1.4), materials.concreteDark);
      saddle2.position.set(4, 0.8, cz);
      filtGroup.add(saddle2);
    }

    // Pipe Gallery Blue Manifolds along front
    const filtPipe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 14, 16), materials.pipeBlue);
    filtPipe1.rotation.z = Math.PI / 2;
    filtPipe1.position.set(0, 1.8, 6.8);
    filtGroup.add(filtPipe1);

    scene.add(filtGroup);
    registerInteractive(filtGroup, 'filtration');

    // -------------------------------------------------------------
    // 6. UV & CHLORINATION DISINFECTION ("ক্লোরিনেশন")
    // -------------------------------------------------------------
    const uvGroup = new THREE.Group();
    uvGroup.position.set(19, 0, -4);

    // Concrete platform
    const uvPlatform = new THREE.Mesh(new THREE.BoxGeometry(8, 0.8, 7.5), materials.concreteDark);
    uvPlatform.position.set(0, 0.4, 0);
    uvPlatform.castShadow = true;
    uvPlatform.receiveShadow = true;
    uvGroup.add(uvPlatform);

    // UV Reactor Stainless Steel Chamber
    const uvReactor = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.2, 2.2), materials.pipeSilver);
    uvReactor.position.set(-1.8, 1.8, 0);
    uvReactor.castShadow = true;
    uvGroup.add(uvReactor);

    // Glowing UV Lamps Inside / Inspection Window
    const uvWindow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), materials.uvGlow);
    uvWindow.position.set(-1.8, 1.8, 1.12);
    uvGroup.add(uvWindow);
    animatedObjectsRef.current.uvLamps.push(uvWindow);

    // Sodium Hypochlorite / Chlorine Bulk Storage Tanks
    for (let cx = 1.2; cx <= 2.8; cx += 1.6) {
      const chemTank = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.8, 16), materials.pipeSilver);
      chemTank.position.set(cx, 2.0, 1.2);
      chemTank.castShadow = true;
      uvGroup.add(chemTank);

      const chemCap = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), materials.pipeSilver);
      chemCap.position.set(cx, 3.4, 1.2);
      uvGroup.add(chemCap);
    }

    // Chlorine Contact Maze Basin (baffled)
    const mazeBasin = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.6, 3), materials.concrete);
    mazeBasin.position.set(1.5, 1.2, -1.8);
    uvGroup.add(mazeBasin);

    const mazeWater = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.1, 2.6), materials.waterPure);
    mazeWater.position.set(1.5, 1.8, -1.8);
    uvGroup.add(mazeWater);
    animatedObjectsRef.current.waterSurfaces.push(mazeWater);

    scene.add(uvGroup);
    registerInteractive(uvGroup, 'chlorination');

    // -------------------------------------------------------------
    // 7. PURE WATER STORAGE TANKS ("বিশুদ্ধ পানির STORAGE TANKS")
    // -------------------------------------------------------------
    const storageGroup = new THREE.Group();
    storageGroup.position.set(27, 0, 3);

    const createStorageTank = (x: number, z: number) => {
      const tGroup = new THREE.Group();
      tGroup.position.set(x, 0, z);

      // Main Cylinder Body
      const bodyGeo = new THREE.CylinderGeometry(5.2, 5.2, 5.5, 32);
      const body = new THREE.Mesh(bodyGeo, materials.concrete);
      body.position.set(0, 2.75, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      tGroup.add(body);

      // Geodesic / Smooth Dome Cap
      const domeGeo = new THREE.SphereGeometry(5.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.8);
      const dome = new THREE.Mesh(domeGeo, materials.tankDome);
      dome.position.set(0, 5.5, 0);
      dome.castShadow = true;
      tGroup.add(dome);

      // Outer access staircase spiral / ladder
      const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.8, 0.4), materials.hazardYellow);
      ladder.position.set(5.3, 2.9, 0);
      tGroup.add(ladder);

      // Level Indicator Gauge on side
      const gauge = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4.2, 0.4), materials.steel);
      gauge.position.set(5.25, 2.8, 1.2);
      tGroup.add(gauge);

      const gaugeFill = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 0.3), materials.waterPure);
      gaugeFill.position.set(5.26, 2.4, 1.2);
      tGroup.add(gaugeFill);

      return tGroup;
    };

    const tank1 = createStorageTank(0, -5.5);
    const tank2 = createStorageTank(0, 5.5);
    storageGroup.add(tank1);
    storageGroup.add(tank2);

    // High Lift Distribution Pump Station Building
    const pumpHouse = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.6, 4.5), materials.concreteDark);
    pumpHouse.position.set(-6, 1.3, 0);
    pumpHouse.castShadow = true;
    storageGroup.add(pumpHouse);

    // Heavy distribution pipes running out
    const distPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 8, 16), materials.pipeBlue);
    distPipe.rotation.z = Math.PI / 2;
    distPipe.position.set(-8, 1.5, 0);
    storageGroup.add(distPipe);

    scene.add(storageGroup);
    registerInteractive(storageGroup, 'storage_tanks');

    // -------------------------------------------------------------
    // 8. SLUDGE TREATMENT FACILITY ("স্লাজ ট্রিটমেন্ট")
    // -------------------------------------------------------------
    const sludgeGroup = new THREE.Group();
    sludgeGroup.position.set(19, 0, 15);

    // Concrete retaining pit
    const pit = new THREE.Mesh(new THREE.BoxGeometry(11, 1.8, 9), materials.concreteDark);
    pit.position.set(0, 0.9, 0);
    pit.castShadow = true;
    pit.receiveShadow = true;
    sludgeGroup.add(pit);

    // Gravity Sludge Thickener Circular Tank
    const thickenerWall = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 2.0, 24, 1, true), materials.concrete);
    thickenerWall.position.set(-2.8, 1.8, -1.8);
    thickenerWall.castShadow = true;
    sludgeGroup.add(thickenerWall);

    const thickenerSludge = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.2, 24), materials.sludge);
    thickenerSludge.position.set(-2.8, 2.5, -1.8);
    sludgeGroup.add(thickenerSludge);

    // Center rake motor
    const rakeMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.8, 12), materials.pipeBlue);
    rakeMotor.position.set(-2.8, 3.2, -1.8);
    sludgeGroup.add(rakeMotor);

    // Plate-and-Frame Filter Press Machine
    const pressGroup = new THREE.Group();
    pressGroup.position.set(0, 1.8, 2.2);

    // Machine frame
    const frameHead = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.0, 1.8), materials.steel);
    frameHead.position.set(-3.5, 0, 0);
    pressGroup.add(frameHead);

    const frameEnd = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.0, 1.8), materials.steel);
    frameEnd.position.set(3.5, 0, 0);
    pressGroup.add(frameEnd);

    // Tie bars
    for (let ty = -0.7; ty <= 0.7; ty += 1.4) {
      for (let tz = -0.7; tz <= 0.7; tz += 1.4) {
        const tieBar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 7.2, 8), materials.pipeSilver);
        tieBar.rotation.z = Math.PI / 2;
        tieBar.position.set(0, ty, tz);
        pressGroup.add(tieBar);
      }
    }

    // Filter press plates
    for (let px = -2.8; px <= 2.8; px += 0.28) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 1.4), materials.concreteDark);
      plate.position.set(px, 0, 0);
      pressGroup.add(plate);
    }

    // Sludge Cake Discharge Chute & Dumpster Bin
    const dumpster = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.0, 2.2), materials.steel);
    dumpster.position.set(0, -1.2, 0);
    pressGroup.add(dumpster);

    const driedCake = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.6, 1.8), materials.sludge);
    driedCake.position.set(0, -0.7, 0);
    pressGroup.add(driedCake);

    sludgeGroup.add(pressGroup);

    scene.add(sludgeGroup);
    registerInteractive(sludgeGroup, 'sludge_treatment');

    // -------------------------------------------------------------
    // 9. CENTRAL SCADA ADMINISTRATION BUILDING ("City Water Treatment Plant")
    // -------------------------------------------------------------
    const adminGroup = new THREE.Group();
    adminGroup.position.set(16, 0, -15);

    // Main 2-Story Building Structure
    const adminBody = new THREE.Mesh(new THREE.BoxGeometry(14, 5.5, 9), materials.concrete);
    adminBody.position.set(0, 2.75, 0);
    adminBody.castShadow = true;
    adminBody.receiveShadow = true;
    adminGroup.add(adminBody);

    // Large Blue Tinted Glass Facade Windows
    const windowFront = new THREE.Mesh(new THREE.PlaneGeometry(11, 3.8), materials.glass);
    windowFront.position.set(0, 3.0, 4.52);
    adminGroup.add(windowFront);

    // Window Mullions (Horizontal and Vertical Framing)
    for (let my = 1.6; my <= 4.4; my += 1.4) {
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.08, 0.05), materials.steel);
      hBar.position.set(0, my, 4.54);
      adminGroup.add(hBar);
    }
    for (let mx = -4.5; mx <= 4.5; mx += 2.25) {
      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.9, 0.05), materials.steel);
      vBar.position.set(mx, 3.0, 4.54);
      adminGroup.add(vBar);
    }

    // Modern Entrance Portico Canopy
    const portico = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.3, 3.5), materials.concreteDark);
    portico.position.set(0, 2.8, 5.5);
    adminGroup.add(portico);

    for (let cx = -2.4; cx <= 2.4; cx += 4.8) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.8, 12), materials.pipeSilver);
      col.position.set(cx, 1.4, 6.8);
      adminGroup.add(col);
    }

    // Roof HVAC and Antenna units
    const hvac = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 2), materials.pipeSilver);
    hvac.position.set(-3.5, 6.1, -1.5);
    adminGroup.add(hvac);

    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 3.5, 8), materials.steel);
    antenna.position.set(4.5, 7.2, -2.5);
    adminGroup.add(antenna);

    scene.add(adminGroup);
    registerInteractive(adminGroup, 'admin_building');

    // -------------------------------------------------------------
    // VEHICLES & OPERATOR FIGURES
    // -------------------------------------------------------------
    // Chemical / Delivery Truck
    const createTruck = (x: number, z: number, angle: number) => {
      const t = new THREE.Group();
      t.position.set(x, 0, z);
      t.rotation.y = angle;

      // Cabin
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), materials.concrete);
      cab.position.set(0, 1.2, 1.8);
      cab.castShadow = true;
      t.add(cab);

      // Windshield
      const wShield = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8), materials.glass);
      wShield.position.set(0, 1.5, 2.71);
      t.add(wShield);

      // Cargo Container / Tanker
      const cargo = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.2, 4.2), materials.pipeBlue);
      cargo.position.set(0, 1.5, -1.2);
      cargo.castShadow = true;
      t.add(cargo);

      // Wheels
      for (let wx = -0.95; wx <= 0.95; wx += 1.9) {
        for (let wz = -2.4; wz <= 2.0; wz += 1.8) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12), materials.asphalt);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.4, wz);
          t.add(wheel);
        }
      }
      scene.add(t);
    };

    createTruck(6, -18, -Math.PI / 3);
    createTruck(25, -16, Math.PI / 6);
    createTruck(26, 17, Math.PI / 2);

    // Operator Human 3D Figures (Hardhat + Vest)
    const createWorker = (x: number, z: number) => {
      const w = new THREE.Group();
      w.position.set(x, 0, z);

      // Body / Vest
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8), materials.hazardYellow);
      body.position.set(0, 0.9, 0);
      w.add(body);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), materials.concrete);
      head.position.set(0, 1.42, 0);
      w.add(head);

      // White/Yellow Hardhat
      const hat = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), materials.pipeSilver);
      hat.position.set(0, 1.48, 0);
      w.add(hat);

      // Legs
      const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), materials.asphalt);
      leg1.position.set(-0.1, 0.3, 0);
      w.add(leg1);
      const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), materials.asphalt);
      leg2.position.set(0.1, 0.3, 0);
      w.add(leg2);

      scene.add(w);
    };

    createWorker(-25, 5); // near intake
    createWorker(-8, 3.5); // near clarifier 1
    createWorker(7, 9); // filtration
    createWorker(17, 14); // sludge press
    createWorker(14, -10); // admin road

    // -------------------------------------------------------------
    // INTERCONNECTING PIPELINE NETWORK & FLOW PARTICLES
    // -------------------------------------------------------------
    const createPipeRun = (points: [number, number, number][], color: number, particleColor: number) => {
      const curvePoints = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.1);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.2, 10, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.6,
        transparent: true,
        opacity: 0.85,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tubeMesh);

      // Animated Water Flow Particles along curve
      const particleCount = 45;
      const particlePositions = new Float32Array(particleCount * 3);
      const particleOffsets = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        particleOffsets[i] = i / particleCount;
        const pt = curve.getPoint(particleOffsets[i]);
        particlePositions[i * 3] = pt.x;
        particlePositions[i * 3 + 1] = pt.y;
        particlePositions[i * 3 + 2] = pt.z;
      }

      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      pGeo.setAttribute('offset', new THREE.BufferAttribute(particleOffsets, 1));

      const pMat = new THREE.PointsMaterial({
        color: particleColor,
        size: 0.38,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });

      const pPoints = new THREE.Points(pGeo, pMat);
      pPoints.userData = { curve: curve, offsets: particleOffsets };
      scene.add(pPoints);
      animatedObjectsRef.current.flowParticles.push(pPoints);
    };

    // 1. Raw River Intake -> Coagulation Mixer
    createPipeRun(
      [
        [-24, 2.2, 5],
        [-20, 2.2, 5],
        [-20, 1.2, -4],
        [-20, 3.2, -9],
        [-17, 3.2, -9],
      ],
      0x0077b6,
      0x8b6508 // Raw turbid particle
    );

    // 2. Coagulation -> Flocculation (Over weirs / short channel)
    createPipeRun(
      [
        [-11, 2.8, -9],
        [-8.5, 2.8, -9],
      ],
      0x0088cc,
      0x5e958f
    );

    // 3. Flocculation -> Clarifier 1 & Clarifier 2
    createPipeRun(
      [
        [-3.5, 2.6, -9],
        [-2.0, 1.5, -9],
        [-2.0, 1.5, 0],
        [-5.0, 1.5, 2.0],
        [-8.0, 2.5, 4.0],
      ],
      0x0099dd,
      0x38bdf8
    );

    createPipeRun(
      [
        [-2.0, 1.5, -9],
        [2.0, 1.5, -9],
        [3.5, 1.5, -6.0],
        [5.0, 2.5, -4.0],
      ],
      0x0099dd,
      0x38bdf8
    );

    // 4. Clarifiers -> Filtration Gallery
    createPipeRun(
      [
        [-3.5, 2.4, 4],
        [0, 1.2, 4],
        [3, 1.2, 7],
        [6, 2.2, 7],
      ],
      0x00aaff,
      0x00e5ff
    );

    // 5. Filtration -> UV & Chlorination
    createPipeRun(
      [
        [12, 2.0, 3],
        [15, 1.2, 0],
        [17, 2.0, -3],
      ],
      0x00bbee,
      0xa855f7
    );

    // 6. UV / Chlorination -> Storage Domed Tanks
    createPipeRun(
      [
        [21, 2.0, -3],
        [23, 1.5, 0],
        [25, 2.2, 2],
        [27, 2.8, 3],
      ],
      0x00ccff,
      0x38bdf8
    );

    // 7. Clarifier Underflow Sludge -> Sludge Treatment Facility
    createPipeRun(
      [
        [-8, 0.4, 4],
        [2, 0.4, 6],
        [10, 0.4, 12],
        [16, 1.6, 14],
      ],
      0x4a3525,
      0x78350f
    );

    // -------------------------------------------------------------
    // NIGHT LIGHTS & GLOWING EFFECTS
    // -------------------------------------------------------------
    const createFloodLight = (x: number, y: number, z: number, color = 0xfff0dd) => {
      const light = new THREE.PointLight(color, 0, 25);
      light.position.set(x, y, z);
      scene.add(light);
      nightLightsRef.current.push(light);

      // Light post fixture
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, y, 8), materials.steel);
      post.position.set(x, y / 2, z);
      scene.add(post);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.4), materials.pipeSilver);
      head.position.set(x, y, z);
      scene.add(head);
    };

    createFloodLight(-18, 6, 8);
    createFloodLight(-10, 6, -14);
    createFloodLight(0, 7, 0);
    createFloodLight(12, 7, -8);
    createFloodLight(22, 8, 8);
    createFloodLight(12, 6, 20);

    // -------------------------------------------------------------
    // RAIN PARTICLE SYSTEM (For Storm scenario)
    // -------------------------------------------------------------
    const rainCount = 1500;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 120;
      rainPos[i * 3 + 1] = Math.random() * 40;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x90cdf4,
      size: 0.2,
      transparent: true,
      opacity: 0,
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);
    animatedObjectsRef.current.rainParticles = rainParticles;

    // -------------------------------------------------------------
    // EVENT LISTENERS: RESIZE, RAYCASTING & ORBIT
    // -------------------------------------------------------------
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging.current = true;
      } else if (e.button === 2) {
        isRightDragging.current = true;
      }
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Handle Camera Orbit Rotation
      if (isDragging.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;

        sphericalCoords.current.theta -= deltaX * 0.006;
        sphericalCoords.current.phi = Math.max(0.1, Math.min(Math.PI / 2.1, sphericalCoords.current.phi - deltaY * 0.006));

        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      } else if (isRightDragging.current) {
        // Pan
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;

        const panSpeed = 0.05;
        targetCamLookAt.current.x -= deltaX * panSpeed;
        targetCamLookAt.current.z -= deltaY * panSpeed;

        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      } else {
        // Hover Raycast
        if (cameraRef.current) {
          raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
          const intersects = raycasterRef.current.intersectObjects(scene.children, true);
          let foundEq: EquipmentId | null = null;
          for (const hit of intersects) {
            const eqId = interactiveObjectsRef.current.get(hit.object.uuid);
            if (eqId) {
              foundEq = eqId;
              break;
            }
          }
          setHoveredEquipment(foundEq);
        }
      }
    };

    const handlePointerUp = () => {
      isDragging.current = false;
      isRightDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalCoords.current.radius = Math.max(12, Math.min(100, sphericalCoords.current.radius + e.deltaY * 0.05));
    };

    const handleClick = (e: MouseEvent) => {
      if (!cameraRef.current) return;
      const rect = container.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(new THREE.Vector2(clickX, clickY), cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        const eqId = interactiveObjectsRef.current.get(hit.object.uuid);
        if (eqId) {
          onSelectEquipment(eqId);
          break;
        }
      }
    };

    // Touch handlers for mobile
    let touchStartDist = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging.current) {
        const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.current.y;
        sphericalCoords.current.theta -= deltaX * 0.008;
        sphericalCoords.current.phi = Math.max(0.1, Math.min(Math.PI / 2.1, sphericalCoords.current.phi - deltaY * 0.008));
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const diff = touchStartDist - dist;
        sphericalCoords.current.radius = Math.max(12, Math.min(100, sphericalCoords.current.radius + diff * 0.1));
        touchStartDist = dist;
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleClick);
    container.addEventListener('contextmenu', (e) => e.preventDefault());
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    // -------------------------------------------------------------
    // ANIMATION LOOP
    // -------------------------------------------------------------
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const speedMult = plantState.isMasterRunning ? plantState.simSpeed : 0;

      // 1. Water River Wave Distortions
      if (animatedObjectsRef.current.riverMesh) {
        const riverMat = animatedObjectsRef.current.riverMesh.material as THREE.MeshStandardMaterial;
        riverMat.opacity = 0.88 + Math.sin(time * 1.5) * 0.04;
      }

      // Water basins subtle shimmering
      animatedObjectsRef.current.waterSurfaces.forEach((surf, idx) => {
        surf.position.y += Math.sin(time * 3 + idx) * 0.0004 * speedMult;
      });

      // 2. Rotating Clarifier Scrapers (Slow)
      animatedObjectsRef.current.scrapers.forEach((scr) => {
        scr.rotation.y += 0.04 * delta * speedMult;
      });

      // 3. Flocculator Paddles (Gentle medium rotation)
      animatedObjectsRef.current.paddles.forEach((pad, idx) => {
        pad.rotation.z += (0.6 + idx * 0.1) * delta * speedMult;
      });

      // 4. Coagulation Flash Mixer (High Speed rotation)
      animatedObjectsRef.current.mixers.forEach((mix) => {
        mix.rotation.y += 6.5 * delta * speedMult;
      });

      // 5. Pipe Water Flow Particles
      animatedObjectsRef.current.flowParticles.forEach((pts) => {
        const curve = pts.userData.curve as THREE.CatmullRomCurve3;
        const offsets = pts.userData.offsets as Float32Array;
        const posAttr = pts.geometry.attributes.position as THREE.BufferAttribute;

        for (let i = 0; i < offsets.length; i++) {
          offsets[i] = (offsets[i] + delta * 0.25 * speedMult) % 1.0;
          const point = curve.getPoint(offsets[i]);
          posAttr.setXYZ(i, point.x, point.y, point.z);
        }
        posAttr.needsUpdate = true;
      });

      // 6. UV Lamps Pulsing Glow
      animatedObjectsRef.current.uvLamps.forEach((lamp) => {
        const mat = lamp.material as THREE.MeshBasicMaterial;
        mat.color.setHSL(0.78, 1.0, 0.5 + Math.sin(time * 6) * 0.15);
      });

      // 7. Rain Particles for Storm Scenario
      if (animatedObjectsRef.current.rainParticles) {
        const rainPos = animatedObjectsRef.current.rainParticles.geometry.attributes.position as THREE.BufferAttribute;
        const isStorm = plantState.timeOfDay === 'storm' || plantState.scenario === 'monsoon_turbidity';
        const rainMat = animatedObjectsRef.current.rainParticles.material as THREE.PointsMaterial;
        rainMat.opacity = isStorm ? 0.65 : 0;

        if (isStorm) {
          for (let i = 0; i < rainPos.count; i++) {
            let y = rainPos.getY(i);
            y -= delta * 35;
            if (y < 0) y = 40;
            rainPos.setY(i, y);
          }
          rainPos.needsUpdate = true;
        }
      }

      // 8. Camera Smooth Orbit & Interpolation
      if (!isDragging.current && !isRightDragging.current) {
        if (plantState.activeEquipmentId) {
          const eq = EQUIPMENT_LIST.find((item) => item.id === plantState.activeEquipmentId);
          if (eq) {
            targetCamLookAt.current.set(...eq.cameraTarget);
            targetCamPos.current.set(...eq.cameraPosition);
          }
        } else {
          // Free Orbit calculations
          const x = targetCamLookAt.current.x + sphericalCoords.current.radius * Math.sin(sphericalCoords.current.phi) * Math.sin(sphericalCoords.current.theta);
          const y = targetCamLookAt.current.y + sphericalCoords.current.radius * Math.cos(sphericalCoords.current.phi);
          const z = targetCamLookAt.current.z + sphericalCoords.current.radius * Math.sin(sphericalCoords.current.phi) * Math.cos(sphericalCoords.current.theta);
          targetCamPos.current.set(x, y, z);
        }
      }

      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.06);
        currentLookAt.current.lerp(targetCamLookAt.current, 0.06);
        cameraRef.current.lookAt(currentLookAt.current);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handle Time of Day & Weather Lighting Changes
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current) return;
    const scene = sceneRef.current;
    const dir = dirLightRef.current;
    const hemi = hemiLightRef.current;

    switch (plantState.timeOfDay) {
      case 'day':
        scene.background = new THREE.Color(0xd7e9f7);
        if (scene.fog) (scene.fog as THREE.FogExp2).color = new THREE.Color(0xd7e9f7);
        dir.color.setHex(0xfff7e8);
        dir.intensity = 1.35;
        dir.position.set(-35, 45, 25);
        hemi.intensity = 0.75;
        nightLightsRef.current.forEach((l) => (l.intensity = 0));
        break;
      case 'sunset':
        scene.background = new THREE.Color(0xef9a76);
        if (scene.fog) (scene.fog as THREE.FogExp2).color = new THREE.Color(0xef9a76);
        dir.color.setHex(0xff7733);
        dir.intensity = 1.6;
        dir.position.set(-50, 20, 10);
        hemi.intensity = 0.55;
        nightLightsRef.current.forEach((l) => (l.intensity = 1.5));
        break;
      case 'night':
        scene.background = new THREE.Color(0x0c1322);
        if (scene.fog) (scene.fog as THREE.FogExp2).color = new THREE.Color(0x0c1322);
        dir.color.setHex(0x3b82f6);
        dir.intensity = 0.25;
        dir.position.set(10, 40, -10);
        hemi.intensity = 0.15;
        nightLightsRef.current.forEach((l) => (l.intensity = 4.5));
        break;
      case 'storm':
        scene.background = new THREE.Color(0x334155);
        if (scene.fog) (scene.fog as THREE.FogExp2).color = new THREE.Color(0x334155);
        dir.color.setHex(0x94a3b8);
        dir.intensity = 0.45;
        hemi.intensity = 0.35;
        nightLightsRef.current.forEach((l) => (l.intensity = 2.0));
        break;
    }
  }, [plantState.timeOfDay, plantState.scenario]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-900">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Equipment Badges / Hotspots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {EQUIPMENT_LIST.map((eq) => {
          const isHovered = hoveredEquipment === eq.id;
          const isSelected = plantState.activeEquipmentId === eq.id;

          return (
            <button
              key={eq.id}
              onClick={() => onSelectEquipment(eq.id)}
              className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-300 ring-4 ring-blue-500/40 scale-110'
                  : isHovered
                  ? 'bg-slate-900/90 text-sky-400 border-sky-400 scale-105'
                  : 'bg-slate-900/75 text-slate-200 border-slate-700/80 hover:bg-slate-900 hover:text-white'
              }`}
              style={{
                // Approximate screen anchor projection
                display: 'none', // Screen labels are managed dynamically in UI or process flow
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {plantState.language === 'bn' ? eq.nameBn : eq.nameEn}
            </button>
          );
        })}
      </div>
    </div>
  );
};
