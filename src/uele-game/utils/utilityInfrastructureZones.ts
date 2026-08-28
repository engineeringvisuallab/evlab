import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';
import { registerSolidBuilding } from './buildingCollisions';

export interface UtilityInfrastructureInstance {
  group: THREE.Group;
  update: (time: number, delta: number) => void;
}

/**
 * Essential Environmental & Municipal Utility Infrastructure System:
 * 1. WTP (Water Treatment Plant) - Upstream Karatoya River (X: 3800, Z: -1200)
 * 2. STP (Sewage Treatment Plant) - Downstream Karatoya River (X: -4200, Z: -350)
 * 3. ETP (Effluent Treatment Plant) - Heavy Industrial SEZ (X: -3600, Z: 300)
 * 4. SWM (Solid Waste Management & Engineered Landfill) - Eco Utility Sector (X: 3200, Z: 1200)
 */
export function buildUtilityInfrastructureZones(): UtilityInfrastructureInstance {
  const group = new THREE.Group();
  group.name = 'environmental_utility_infrastructure_zones';

  // =========================================================================
  // SHARED MATERIALS
  // =========================================================================
  const concreteBaseMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // Reinforced civil concrete
    roughness: 0.85,
  });

  const tankConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Light grey water-tight tank wall
    roughness: 0.6,
  });

  const waterCleanMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9, // Clean treated azure water
    roughness: 0.15,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
  });

  const wastewaterMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6, // Aeration biological basin water
    roughness: 0.3,
    transparent: true,
    opacity: 0.9,
  });

  const chemicalMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Chemical dosing unit
    roughness: 0.4,
    metalness: 0.5,
  });

  const steelPipeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // Sky-blue process piping
    roughness: 0.3,
    metalness: 0.8,
  });

  const industrialSheetMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Dark slate industrial cladding
    roughness: 0.5,
  });

  const warningYellowMat = new THREE.MeshStandardMaterial({
    color: 0xeab308, // Safety yellow handrails & gantries
    roughness: 0.4,
  });

  const wasteEarthMat = new THREE.MeshStandardMaterial({
    color: 0x573a1c, // Landfill engineered clay cap
    roughness: 0.95,
  });

  // Animated clarifier arms & aerators
  const clarifierArms: THREE.Object3D[] = [];
  const aeratorImpellers: THREE.Object3D[] = [];

  // =========================================================================
  // 1. WTP (WATER TREATMENT PLANT) - RIVER UPSTREAM (X: 3800, Z: -1200)
  // =========================================================================
  const buildWTP = () => {
    const wtpX = 3800;
    const wtpZ = -1200;
    const wtpY = calcMasterPlanElevation(wtpX, wtpZ);
    const wtpGrp = new THREE.Group();
    wtpGrp.position.set(wtpX, wtpY, wtpZ);

    // Main Perimeter Base Foundation Platform (180m x 140m)
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(180, 2.5, 140), concreteBaseMat);
    baseMesh.position.y = 1.25;
    baseMesh.receiveShadow = true;
    wtpGrp.add(baseMesh);

    // 1a. Raw Water River Intake Pump House
    const intakeHouse = new THREE.Mesh(new THREE.BoxGeometry(32, 14, 22), chemicalMat);
    intakeHouse.position.set(-60, 9.5, -45);
    intakeHouse.castShadow = true;
    wtpGrp.add(intakeHouse);

    // 1b. Circular Primary Clariflocculator Tanks (2 Units, Diameter 38m)
    for (const tx of [-25, 35]) {
      const tankWall = new THREE.Mesh(new THREE.CylinderGeometry(19, 19, 7.5, 32, 1, true), tankConcreteMat);
      tankWall.position.set(tx, 6.25, -25);
      tankWall.castShadow = true;
      wtpGrp.add(tankWall);

      const waterSurf = new THREE.Mesh(new THREE.CircleGeometry(18.6, 32), waterCleanMat);
      waterSurf.position.set(tx, 8.5, -25);
      waterSurf.rotation.x = -Math.PI / 2;
      wtpGrp.add(waterSurf);

      // Rotating bridge scraper arm
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(37, 1.2, 2.2), warningYellowMat);
      bridge.position.set(tx, 9.4, -25);
      bridge.castShadow = true;
      wtpGrp.add(bridge);
      clarifierArms.push(bridge);
    }

    // 1c. Rapid Sand Filter Basins (Grid of rectangular cells)
    const filterMesh = new THREE.Mesh(new THREE.BoxGeometry(55, 6.5, 36), tankConcreteMat);
    filterMesh.position.set(10, 5.75, 35);
    filterMesh.castShadow = true;
    wtpGrp.add(filterMesh);

    const filterWater = new THREE.Mesh(new THREE.PlaneGeometry(51, 32), waterCleanMat);
    filterWater.position.set(10, 8.2, 35);
    filterWater.rotation.x = -Math.PI / 2;
    wtpGrp.add(filterWater);

    // 1d. Chemical Dosing & Ozone Disinfection Building
    const chemBldg = new THREE.Mesh(new THREE.BoxGeometry(42, 16, 26), industrialSheetMat);
    chemBldg.position.set(-50, 10.5, 35);
    chemBldg.castShadow = true;
    wtpGrp.add(chemBldg);

    // 1e. Clear Water Underground Reservoir High-Lift Pump Station
    const pumpStation = new THREE.Mesh(new THREE.BoxGeometry(36, 12, 28), chemicalMat);
    pumpStation.position.set(65, 8.5, 35);
    pumpStation.castShadow = true;
    wtpGrp.add(pumpStation);

    // Process Piping interconnects
    const mainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 140, 16), steelPipeMat);
    mainPipe.position.set(5, 7.5, 0);
    mainPipe.rotation.z = Math.PI / 2;
    wtpGrp.add(mainPipe);

    // Register Solid Building
    registerSolidBuilding({
      id: 'utility_wtp_plant',
      name: 'Central Water Treatment Plant (WTP - Upstream)',
      minX: wtpX - 90,
      maxX: wtpX + 90,
      minZ: wtpZ - 70,
      maxZ: wtpZ + 70,
      topY: wtpY + 18,
      baseY: wtpY,
    });

    group.add(wtpGrp);
  };

  // =========================================================================
  // 2. STP (SEWAGE TREATMENT PLANT) - RIVER DOWNSTREAM (X: -4200, Z: -350)
  // =========================================================================
  const buildSTP = () => {
    const stpX = -4200;
    const stpZ = -350;
    const stpY = calcMasterPlanElevation(stpX, stpZ);
    const stpGrp = new THREE.Group();
    stpGrp.position.set(stpX, stpY, stpZ);

    // Platform (190m x 150m)
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(190, 2.5, 150), concreteBaseMat);
    baseMesh.position.y = 1.25;
    baseMesh.receiveShadow = true;
    stpGrp.add(baseMesh);

    // 2a. Inlet Works & Mechanical Screen Chamber
    const screenChamber = new THREE.Mesh(new THREE.BoxGeometry(26, 10, 32), tankConcreteMat);
    screenChamber.position.set(-65, 7.5, -45);
    screenChamber.castShadow = true;
    stpGrp.add(screenChamber);

    // 2b. Biological Activated Sludge Aeration Basins (Long deep tanks with bubble aerators)
    const aerationTanks = new THREE.Mesh(new THREE.BoxGeometry(85, 7.0, 42), tankConcreteMat);
    aerationTanks.position.set(-10, 6.0, -35);
    aerationTanks.castShadow = true;
    stpGrp.add(aerationTanks);

    const aeroWater = new THREE.Mesh(new THREE.PlaneGeometry(81, 38), wastewaterMat);
    aeroWater.position.set(-10, 8.2, -35);
    aeroWater.rotation.x = -Math.PI / 2;
    stpGrp.add(aeroWater);

    // Aerator Impeller Rotors
    for (let ax = -40; ax <= 20; ax += 20) {
      const aerator = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.6, 12), warningYellowMat);
      aerator.position.set(ax, 8.8, -35);
      stpGrp.add(aerator);
      aeratorImpellers.push(aerator);
    }

    // 2c. Secondary Clarifier Settling Basins (2 Large Circular Tanks, Diameter 44m)
    for (const cz of [25, -25]) {
      const clarifier = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 7.0, 32, 1, true), tankConcreteMat);
      clarifier.position.set(55, 6.0, cz);
      clarifier.castShadow = true;
      stpGrp.add(clarifier);

      const clarWater = new THREE.Mesh(new THREE.CircleGeometry(21.6, 32), wastewaterMat);
      clarWater.position.set(55, 8.0, cz);
      clarWater.rotation.x = -Math.PI / 2;
      stpGrp.add(clarWater);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(43, 1.2, 2.2), warningYellowMat);
      arm.position.set(55, 8.8, cz);
      stpGrp.add(arm);
      clarifierArms.push(arm);
    }

    // 2d. Anaerobic Sludge Digester Domes (2 Spherical/Cylindrical Domes, Dia 24m)
    for (const dz of [20, -20]) {
      const digesterCyl = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 16, 24), tankConcreteMat);
      digesterCyl.position.set(-60, 10.5, dz);
      digesterCyl.castShadow = true;
      stpGrp.add(digesterCyl);

      const digesterDome = new THREE.Mesh(new THREE.SphereGeometry(12, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), chemicalMat);
      digesterDome.position.set(-60, 18.5, dz);
      digesterDome.castShadow = true;
      stpGrp.add(digesterDome);
    }

    // 2e. UV & Chlorine Disinfection Channel & Outfall
    const outfall = new THREE.Mesh(new THREE.BoxGeometry(32, 6, 22), tankConcreteMat);
    outfall.position.set(60, 5.5, -55);
    stpGrp.add(outfall);

    // Register Solid Building
    registerSolidBuilding({
      id: 'utility_stp_plant',
      name: 'Sewage Treatment Plant (STP - Downstream)',
      minX: stpX - 95,
      maxX: stpX + 95,
      minZ: stpZ - 75,
      maxZ: stpZ + 75,
      topY: stpY + 22,
      baseY: stpY,
    });

    group.add(stpGrp);
  };

  // =========================================================================
  // 3. ETP (EFFLUENT TREATMENT PLANT) - INDUSTRIAL SEZ (X: -3600, Z: 300)
  // =========================================================================
  const buildETP = () => {
    const etpX = -3600;
    const etpZ = 300;
    const etpY = calcMasterPlanElevation(etpX, etpZ);
    const etpGrp = new THREE.Group();
    etpGrp.position.set(etpX, etpY, etpZ);

    // Platform (160m x 120m)
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(160, 2.5, 120), concreteBaseMat);
    baseMesh.position.y = 1.25;
    baseMesh.receiveShadow = true;
    etpGrp.add(baseMesh);

    // 3a. Equalization & Neutralization Mixing Tanks
    const eqTank = new THREE.Mesh(new THREE.BoxGeometry(50, 8.0, 36), tankConcreteMat);
    eqTank.position.set(-45, 6.5, -30);
    eqTank.castShadow = true;
    etpGrp.add(eqTank);

    // 3b. Dissolved Air Flotation (DAF) Unit & Chemical Flocculators
    const dafUnit = new THREE.Mesh(new THREE.BoxGeometry(42, 10, 26), industrialSheetMat);
    dafUnit.position.set(20, 7.5, -30);
    dafUnit.castShadow = true;
    etpGrp.add(dafUnit);

    // 3c. Industrial Bioreactor Towers (3 Tall Steel Vessels)
    for (let b = 0; b < 3; b++) {
      const bioTower = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 22, 20), chemicalMat);
      bioTower.position.set(-45 + b * 20, 13.5, 25);
      bioTower.castShadow = true;
      etpGrp.add(bioTower);
    }

    // 3d. Sludge Filter Press House & Dewatering Facility
    const filterPressHouse = new THREE.Mesh(new THREE.BoxGeometry(45, 14, 28), industrialSheetMat);
    filterPressHouse.position.set(40, 9.5, 25);
    filterPressHouse.castShadow = true;
    etpGrp.add(filterPressHouse);

    // Register Solid Building
    registerSolidBuilding({
      id: 'utility_etp_plant',
      name: 'Industrial Effluent Treatment Plant (ETP)',
      minX: etpX - 80,
      maxX: etpX + 80,
      minZ: etpZ - 60,
      maxZ: etpZ + 60,
      topY: etpY + 24,
      baseY: etpY,
    });

    group.add(etpGrp);
  };

  // =========================================================================
  // 4. SWM (SOLID WASTE MANAGEMENT & LANDFILL) (X: 3200, Z: 1200)
  // =========================================================================
  const buildSWM = () => {
    const swmX = 3200;
    const swmZ = 1200;
    const swmY = calcMasterPlanElevation(swmX, swmZ);
    const swmGrp = new THREE.Group();
    swmGrp.position.set(swmX, swmY, swmZ);

    // Landfill Boundary Ground Base (220m x 180m)
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(220, 2.5, 180), concreteBaseMat);
    baseMesh.position.y = 1.25;
    baseMesh.receiveShadow = true;
    swmGrp.add(baseMesh);

    // 4a. Material Recovery Facility (MRF Sorting Shed - 65m x 40m)
    const mrfShed = new THREE.Mesh(new THREE.BoxGeometry(65, 16, 40), industrialSheetMat);
    mrfShed.position.set(-60, 10.5, -45);
    mrfShed.castShadow = true;
    swmGrp.add(mrfShed);

    // 4b. Organic Waste Composting Windrows (Linear Aerobic Compost Ridges)
    for (let w = -15; w <= 35; w += 12) {
      const windrow = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.5, 70, 8), wasteEarthMat);
      windrow.position.set(35, 3.5, w);
      windrow.rotation.z = Math.PI / 2;
      windrow.castShadow = true;
      swmGrp.add(windrow);
    }

    // 4c. Engineered Sanitary Landfill Terraced Cell (Mound with geomembrane liner)
    const landfillMound = new THREE.Mesh(new THREE.ConeGeometry(48, 22, 6), wasteEarthMat);
    landfillMound.position.set(-45, 12, 35);
    landfillMound.scale.set(1.4, 1.0, 1.0);
    landfillMound.castShadow = true;
    swmGrp.add(landfillMound);

    // 4d. Methane Gas Flare Stack
    const flareStack = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 32, 12), chemicalMat);
    flareStack.position.set(65, 17.5, 55);
    flareStack.castShadow = true;
    swmGrp.add(flareStack);

    // Flare Flame
    const flareFlame = new THREE.Mesh(
      new THREE.ConeGeometry(1.4, 4.5, 8),
      new THREE.MeshBasicMaterial({ color: 0xf97316 })
    );
    flareFlame.position.set(65, 35, 55);
    swmGrp.add(flareFlame);

    // 4e. Leachate Treatment Retention Pond
    const leachatePond = new THREE.Mesh(new THREE.BoxGeometry(45, 5.0, 30), tankConcreteMat);
    leachatePond.position.set(45, 4.0, -55);
    swmGrp.add(leachatePond);

    const leachateWater = new THREE.Mesh(new THREE.PlaneGeometry(41, 26), wastewaterMat);
    leachateWater.position.set(45, 6.0, -55);
    leachateWater.rotation.x = -Math.PI / 2;
    swmGrp.add(leachateWater);

    // Register Solid Building
    registerSolidBuilding({
      id: 'utility_swm_plant',
      name: 'Solid Waste Management Facility & Engineered Landfill (SWM)',
      minX: swmX - 110,
      maxX: swmX + 110,
      minZ: swmZ - 90,
      maxZ: swmZ + 90,
      topY: swmY + 26,
      baseY: swmY,
    });

    group.add(swmGrp);
  };

  // Build all 4 treatment plants
  buildWTP();
  buildSTP();
  buildETP();
  buildSWM();

  // Animation loop for rotating clarifier arms and surface aerators
  const update = (time: number, _delta: number) => {
    clarifierArms.forEach((arm, i) => {
      arm.rotation.y = time * 0.12 * (i % 2 === 0 ? 1 : -1);
    });

    aeratorImpellers.forEach((imp) => {
      imp.rotation.y = time * 4.5;
    });
  };

  return {
    group,
    update,
  };
}
