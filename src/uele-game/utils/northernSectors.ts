import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';

export interface NorthernSectorsResult {
  group: THREE.Group;
  landmarks: { name: string; position: THREE.Vector3; icon: string }[];
  update: (time: number, delta: number) => void;
}

/**
 * Creates a high-security Restricted Zone warning sign texture
 */
function createSolarRestrictedSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 492, 236);

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(20, 20, 472, 65);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 34px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DANGER - HIGH VOLTAGE', 256, 52);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('RESTRICTED SOLAR POWER GRID', 256, 125);
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('500kV TRANSFORMER SUBSTATION', 256, 165);
  ctx.fillStyle = '#dc2626';
  ctx.fillText('DO NOT TOUCH FENCE - KEEP OUT', 256, 205);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Builds the Northern Sectors matching UELE Master Plan:
 * 1. North-West Hill & Eco Zone: Wind Turbines on mountain ridges (X: -5000 to -2500, Z: -5000 to -3000)
 * 2. Agriculture & Agro-Engineering Zone: Greenhouses, Silos, Barns (X: -2500 to 0, Z: -5000 to -3000)
 * 3. University / R&D Campus: Academic buildings, circular halls (X: +3000 to +5000, Z: -5000 to -3000)
 * 4. Low-Density Residential Zone: Modern homes & tree-lined streets (X: 0 to +3000, Z: -3000 to -1000)
 * 5. Solar Farm Renewable Grid & Restricted Security Boundary (X: +3000 to +5000, Z: -3000 to -1000)
 */
export function buildNorthernSectors(): NorthernSectorsResult {
  const group = new THREE.Group();
  group.name = 'northern_sectors_group';

  const landmarks: { name: string; position: THREE.Vector3; icon: string }[] = [];
  const windTurbineRotors: THREE.Group[] = [];

  // =========================================================================
  // 1. NORTH-WEST HILL & ECO ZONE: WIND FARM ON MOUNTAIN CRESTS
  // =========================================================================
  const windFarmGroup = new THREE.Group();
  windFarmGroup.name = 'wind_farm_renewable_grid';

  const turbineTowerGeo = new THREE.CylinderGeometry(1.2, 2.5, 55, 12);
  const turbineMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.2 });
  const nacelleGeo = new THREE.BoxGeometry(4, 3.5, 7);
  const bladeGeo = new THREE.BoxGeometry(0.8, 26, 0.25);
  bladeGeo.translate(0, 13, 0); // Pivot at hub

  const windTurbineCoords = [
    [-4200, -4400], [-3700, -4600], [-3200, -4200], [-4500, -3800],
    [-3900, -3500], [-3400, -3300], [-4700, -4600], [-2800, -4500],
  ];

  windTurbineCoords.forEach(([tx, tz]) => {
    const ty = calcMasterPlanElevation(tx, tz);
    const turbine = new THREE.Group();
    turbine.position.set(tx, ty, tz);

    // Tower
    const tower = new THREE.Mesh(turbineTowerGeo, turbineMat);
    tower.position.y = 27.5;
    tower.castShadow = true;
    turbine.add(tower);

    // Nacelle
    const nacelle = new THREE.Mesh(nacelleGeo, turbineMat);
    nacelle.position.set(0, 55, 0);
    turbine.add(nacelle);

    // Rotor Hub + 3 Blades
    const rotorGroup = new THREE.Group();
    rotorGroup.position.set(0, 55, 3.5);

    const hubGeo = new THREE.SphereGeometry(1.5, 12, 12);
    const hub = new THREE.Mesh(hubGeo, turbineMat);
    rotorGroup.add(hub);

    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(bladeGeo, turbineMat);
      blade.rotation.z = (b * Math.PI * 2) / 3;
      blade.castShadow = true;
      rotorGroup.add(blade);
    }

    turbine.add(rotorGroup);
    windTurbineRotors.push(rotorGroup);
    windFarmGroup.add(turbine);
  });

  group.add(windFarmGroup);
  landmarks.push({
    name: 'Hill & Eco Wind Farm',
    position: new THREE.Vector3(-3800, calcMasterPlanElevation(-3800, -4000), -4000),
    icon: '⚡',
  });

  // =========================================================================
  // 2. AGRICULTURE & AGRO-ENGINEERING ZONE (X: -2500 to 0, Z: -5000 to -3000)
  // =========================================================================
  const agriGroup = new THREE.Group();
  agriGroup.name = 'agro_engineering_zone';

  // Greenhouses (Translucent arched glass structures)
  const ghGeo = new THREE.CylinderGeometry(14, 14, 55, 16, 1, false, 0, Math.PI);
  ghGeo.rotateZ(Math.PI / 2);
  const ghMat = new THREE.MeshStandardMaterial({
    color: 0x86efac,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.4,
  });

  const ghCoords = [
    [-2100, -4400], [-1950, -4400], [-1800, -4400],
    [-2100, -4100], [-1950, -4100], [-1800, -4100],
    [-1500, -4500], [-1350, -4500], [-1200, -4500],
    [-1500, -4200], [-1350, -4200], [-1200, -4200],
  ];

  ghCoords.forEach(([gx, gz]) => {
    const gy = calcMasterPlanElevation(gx, gz);
    const gh = new THREE.Mesh(ghGeo, ghMat);
    gh.position.set(gx, gy + 7, gz);
    agriGroup.add(gh);
  });

  // Grain Storage Silos
  const siloGeo = new THREE.CylinderGeometry(7, 7, 28, 16);
  const siloCapGeo = new THREE.ConeGeometry(7, 4, 16);
  const siloMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.3 });

  const siloPositions = [
    [-800, -4500], [-780, -4500], [-800, -4480], [-780, -4480],
    [-600, -4200], [-580, -4200], [-600, -4180], [-580, -4180],
  ];

  siloPositions.forEach(([sx, sz]) => {
    const sy = calcMasterPlanElevation(sx, sz);
    const silo = new THREE.Mesh(siloGeo, siloMat);
    silo.position.set(sx, sy + 14, sz);
    const cap = new THREE.Mesh(siloCapGeo, siloMat);
    cap.position.set(sx, sy + 30, sz);
    agriGroup.add(silo, cap);
  });

  // Agro-Logistics Center Warehouse
  const agroBarnGeo = new THREE.BoxGeometry(85, 16, 50);
  const agroBarnMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
  const barn = new THREE.Mesh(agroBarnGeo, agroBarnMat);
  barn.position.set(-1400, calcMasterPlanElevation(-1400, -3600) + 8, -3600);
  agriGroup.add(barn);

  group.add(agriGroup);
  landmarks.push({
    name: 'Agro-Engineering & Greenhouses',
    position: new THREE.Vector3(-1600, calcMasterPlanElevation(-1600, -4200), -4200),
    icon: '🌱',
  });

  // =========================================================================
  // 3. R&D & UNIVERSITY CAMPUS ZONE (X: +3000 to +5000, Z: -5000 to -3000)
  // =========================================================================
  const uniGroup = new THREE.Group();
  uniGroup.name = 'university_rd_campus';

  // Circular Academic Hall (Main Senate)
  const senateGeo = new THREE.CylinderGeometry(48, 55, 24, 32);
  const senateMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4, metalness: 0.3 });
  const senateDomeGeo = new THREE.SphereGeometry(30, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });

  const senateX = 4100;
  const senateZ = -4200;
  const senateY = calcMasterPlanElevation(senateX, senateZ);

  const senate = new THREE.Mesh(senateGeo, senateMat);
  senate.position.set(senateX, senateY + 12, senateZ);
  const senateDome = new THREE.Mesh(senateDomeGeo, glassMat);
  senateDome.position.set(senateX, senateY + 24, senateZ);
  uniGroup.add(senate, senateDome);

  // Faculty Wings & Research Labs
  const labWings = [
    { x: 3750, z: -4400, w: 75, d: 35, h: 22 },
    { x: 4450, z: -4400, w: 75, d: 35, h: 22 },
    { x: 3750, z: -3800, w: 75, d: 35, h: 22 },
    { x: 4450, z: -3800, w: 75, d: 35, h: 22 },
  ];

  labWings.forEach((wing) => {
    const wy = calcMasterPlanElevation(wing.x, wing.z);
    const labMesh = new THREE.Mesh(
      new THREE.BoxGeometry(wing.w, wing.h, wing.d),
      senateMat
    );
    labMesh.position.set(wing.x, wy + wing.h / 2, wing.z);
    labMesh.castShadow = true;
    uniGroup.add(labMesh);
  });

  group.add(uniGroup);
  landmarks.push({
    name: 'UELE University & R&D Campus',
    position: new THREE.Vector3(4100, senateY, -4200),
    icon: '🎓',
  });

  // =========================================================================
  // 4. LOW-DENSITY RESIDENTIAL ZONE (X: 0 to +3000, Z: -3000 to -1000)
  // =========================================================================
  const resGroup = new THREE.Group();
  resGroup.name = 'low_density_residential_zone';

  const houseGeo = new THREE.BoxGeometry(16, 8, 14);
  const houseMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8 });
  const roofGeo = new THREE.ConeGeometry(12, 5, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 });

  // Grid layout for 48 residential suburban houses
  for (let rx = 0; rx < 8; rx++) {
    for (let rz = 0; rz < 6; rz++) {
      const hx = 600 + rx * 280;
      const hz = -2700 + rz * 250;

      const hy = calcMasterPlanElevation(hx, hz);
      const house = new THREE.Mesh(houseGeo, houseMat);
      house.position.set(hx, hy + 4, hz);

      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(hx, hy + 10.5, hz);

      resGroup.add(house, roof);
    }
  }

  group.add(resGroup);
  landmarks.push({
    name: 'Residential Green Community',
    position: new THREE.Vector3(1800, calcMasterPlanElevation(1800, -2000), -2000),
    icon: '🏡',
  });

  // =========================================================================
  // 5. SOLAR FARM & HIGH-VOLTAGE SUBSTATION WITH RESTRICTED BOUNDARY WALL
  //    (X: +3200 to +4800, Z: -2600 to -1200)
  // =========================================================================
  const solarGroup = new THREE.Group();
  solarGroup.name = 'photovoltaic_solar_farm';

  // Perimeter Security Wall around Solar Farm
  const solarWallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
  const solarMeshTopMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, wireframe: true });
  const solarSignMat = new THREE.MeshBasicMaterial({ map: createSolarRestrictedSignTexture() });

  const minX = 3150, maxX = 4850, minZ = -2650, maxZ = -1150;
  const solarWallHeight = 3.5;

  const wallEdges = [
    { start: [minX, minZ], end: [maxX, minZ], isX: true, isNorth: true },
    { start: [minX, maxZ], end: [maxX, maxZ], isX: true, isNorth: false },
    { start: [minX, minZ], end: [minX, maxZ], isX: false, isWest: true },
    { start: [maxX, minZ], end: [maxX, maxZ], isX: false, isWest: false },
  ];

  wallEdges.forEach((edge) => {
    const length = edge.isX ? Math.abs(edge.end[0] - edge.start[0]) : Math.abs(edge.end[1] - edge.start[1]);
    const step = 80;
    const count = Math.ceil(length / step);

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const x = edge.isX ? edge.start[0] + (edge.end[0] - edge.start[0]) * t + step / 2 : edge.start[0];
      const z = !edge.isX ? edge.start[1] + (edge.end[1] - edge.start[1]) * t + step / 2 : edge.start[1];
      const y = calcMasterPlanElevation(x, z);

      const wallGeo = new THREE.BoxGeometry(edge.isX ? step : 0.8, solarWallHeight + 1.0, edge.isX ? 0.8 : step);
      const wallMesh = new THREE.Mesh(wallGeo, solarWallMat);
      wallMesh.position.set(x, y + solarWallHeight / 2 - 0.5, z);
      solarGroup.add(wallMesh);

      const meshGeo = new THREE.BoxGeometry(edge.isX ? step : 0.2, 0.8, edge.isX ? 0.2 : step);
      const mesh = new THREE.Mesh(meshGeo, solarMeshTopMat);
      mesh.position.set(x, y + solarWallHeight + 0.4, z);
      solarGroup.add(mesh);

      if (i % 4 === 1) {
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1.8), solarSignMat);
        if (edge.isX) {
          sign.position.set(x, y + 2.0, edge.isNorth ? z - 0.45 : z + 0.45);
          if (edge.isNorth) sign.rotation.y = Math.PI;
        } else {
          sign.position.set(edge.isWest ? x - 0.45 : x + 0.45, y + 2.0, z);
          sign.rotation.y = edge.isWest ? -Math.PI / 2 : Math.PI / 2;
        }
        solarGroup.add(sign);
      }
    }
  });

  // Solar Panel Tile Arrays (Tilted 20 deg South)
  const panelGeo = new THREE.BoxGeometry(14, 0.4, 8);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.15,
    metalness: 0.95,
  });

  const panelRows = 10;
  const panelCols = 12;
  const solarInst = new THREE.InstancedMesh(panelGeo, panelMat, panelRows * panelCols);
  const dummySolar = new THREE.Object3D();

  let sIdx = 0;
  for (let r = 0; r < panelRows; r++) {
    for (let c = 0; c < panelCols; c++) {
      const sx = 3300 + c * 110;
      const sz = -2500 + r * 110;
      const sy = calcMasterPlanElevation(sx, sz);

      dummySolar.position.set(sx, sy + 2.0, sz);
      dummySolar.rotation.x = -0.35; // 20 deg tilt facing South
      dummySolar.updateMatrix();
      solarInst.setMatrixAt(sIdx++, dummySolar.matrix);
    }
  }
  solarInst.instanceMatrix.needsUpdate = true;
  solarGroup.add(solarInst);

  // Electrical Inverter & Grid Substation
  const subStationGeo = new THREE.BoxGeometry(45, 12, 35);
  const subStationMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
  const subStation = new THREE.Mesh(subStationGeo, subStationMat);
  subStation.position.set(4000, calcMasterPlanElevation(4000, -1800) + 6, -1800);
  solarGroup.add(subStation);

  group.add(solarGroup);
  landmarks.push({
    name: 'High-Capacity Solar Farm (Restricted)',
    position: new THREE.Vector3(4000, calcMasterPlanElevation(4000, -1800), -1800),
    icon: '☀️',
  });

  // Dynamic animation update (wind turbine rotor rotation)
  const update = (_time: number, delta: number) => {
    windTurbineRotors.forEach((rotor, idx) => {
      rotor.rotation.z += delta * (1.2 + (idx % 3) * 0.15);
    });
  };

  return {
    group,
    landmarks,
    update,
  };
}
