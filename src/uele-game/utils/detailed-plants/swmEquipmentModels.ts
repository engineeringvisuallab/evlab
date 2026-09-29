import * as THREE from 'three';
import { EquipmentId } from './types';

export interface SwmAnimatedObjects {
  trommelDrum?: THREE.Group;
  magneticBelt?: THREE.Mesh;
  opticalLasers: THREE.Mesh[];
  balerRam?: THREE.Mesh;
  biogasFlare?: THREE.PointLight;
  compostTurner?: THREE.Group;
  rdfDryer?: THREE.Mesh;
  landfillGasFlare?: THREE.PointLight;
}

export function buildSwmCampus(
  scene: THREE.Scene,
  registerInteractive: (group: THREE.Group, id: EquipmentId) => void
): SwmAnimatedObjects {
  const animated: SwmAnimatedObjects = {
    opticalLasers: [],
  };

  // -------------------------------------------------------------
  // SHARED MATERIALS
  // -------------------------------------------------------------
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85, metalness: 0.1 });
  const concreteDarkMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, metalness: 0.1 });
  const steelFrameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.7 });
  const industrialYellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4, metalness: 0.3 });
  const safetyOrangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4, metalness: 0.3 });
  const emeraldGreenMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4, metalness: 0.3 });
  const blueTechMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.6,
  });
  const rubberBeltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95, metalness: 0.05 });
  const hdpeLinerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 });
  const compostSoilMat = new THREE.MeshStandardMaterial({ color: 0x2e1f14, roughness: 0.95, metalness: 0.05 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.85 });

  // -------------------------------------------------------------
  // 1. SWM WEIGHBRIDGE & INBOUND TIPPING HALL
  // -------------------------------------------------------------
  const weighbridgeGroup = new THREE.Group();
  weighbridgeGroup.position.set(136, 0, -12);

  // Concrete Weighbridge Platform (Dual 60-Ton Scale)
  const scalePlatform1 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 3.5), concreteDarkMat);
  scalePlatform1.position.set(-6, 0.2, -2.5);
  scalePlatform1.castShadow = true;
  weighbridgeGroup.add(scalePlatform1);

  const scalePlatform2 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 3.5), concreteDarkMat);
  scalePlatform2.position.set(-6, 0.2, 2.5);
  scalePlatform2.castShadow = true;
  weighbridgeGroup.add(scalePlatform2);

  // Yellow Guide Guardrails
  const railMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.5 });
  [-4.2, -0.8, 0.8, 4.2].forEach((z) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 0.15), railMat);
    rail.position.set(-6, 0.6, z);
    weighbridgeGroup.add(rail);
  });

  // Weighbridge Operator Control Booth
  const booth = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.0, 2.5), blueTechMat);
  booth.position.set(-6, 1.5, 0);
  booth.castShadow = true;
  weighbridgeGroup.add(booth);

  const boothWindow = new THREE.Mesh(new THREE.BoxGeometry(2.52, 1.2, 2.0), glassMat);
  boothWindow.position.set(-6, 1.8, 0);
  weighbridgeGroup.add(boothWindow);

  // Enclosed High-Clearance Tipping Hall Building
  const tippingHall = new THREE.Mesh(new THREE.BoxGeometry(12, 8.5, 14), concreteMat);
  tippingHall.position.set(5, 4.25, 0);
  tippingHall.castShadow = true;
  weighbridgeGroup.add(tippingHall);

  // Roll-up Shutter Bay Doors
  [-3.5, 3.5].forEach((z) => {
    const bayDoor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.0, 4.0), steelFrameMat);
    bayDoor.position.set(-1.01, 2.5, z);
    weighbridgeGroup.add(bayDoor);
  });

  // Odor Control Bio-Scrubber Rooftop Stacks
  const scrubberStack = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 3.5, 12), emeraldGreenMat);
  scrubberStack.position.set(8, 9.5, -4);
  weighbridgeGroup.add(scrubberStack);

  scene.add(weighbridgeGroup);
  registerInteractive(weighbridgeGroup, 'swm_weighbridge_tipping');

  // -------------------------------------------------------------
  // 2. ROTARY TROMMEL SCREEN & SIZE CLASSIFIER
  // -------------------------------------------------------------
  const trommelGroup = new THREE.Group();
  trommelGroup.position.set(150, 0, -12);

  // Infeed Apron Conveyor from Tipping Hall
  const infeedConveyor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 1.8), rubberBeltMat);
  infeedConveyor.position.set(-5, 3.2, 0);
  infeedConveyor.rotation.z = -0.25;
  infeedConveyor.castShadow = true;
  trommelGroup.add(infeedConveyor);

  // A-Frame Steel Support Trusses
  const trussL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.5, 4.2), steelFrameMat);
  trussL.position.set(-1.5, 2.75, 0);
  trommelGroup.add(trussL);

  const trussR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.5, 4.2), steelFrameMat);
  trussR.position.set(4.5, 2.25, 0);
  trommelGroup.add(trussR);

  // Rotating Cylindrical Trommel Drum
  const trommelDrumGroup = new THREE.Group();
  trommelDrumGroup.position.set(1.5, 4.2, 0);
  trommelDrumGroup.rotation.z = -0.12; // 7-degree slant

  const drumCylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 1.8, 7.5, 24, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.3,
      metalness: 0.7,
      wireframe: false,
      side: THREE.DoubleSide,
    })
  );
  drumCylinder.rotation.z = Math.PI / 2;
  trommelDrumGroup.add(drumCylinder);

  // Perforated Screen Ring Reinforcements
  for (let i = -3; i <= 3; i += 1.5) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.08, 8, 24), chromeMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.x = i;
    trommelDrumGroup.add(ring);
  }

  trommelGroup.add(trommelDrumGroup);
  animated.trommelDrum = trommelDrumGroup;

  // 3-Chute Sorting Collection Hoppers underneath
  const hopperGeo = new THREE.CylinderGeometry(1.4, 0.6, 2.2, 4);
  hopperGeo.rotateY(Math.PI / 4);

  const hopperOrganics = new THREE.Mesh(hopperGeo, industrialYellowMat);
  hopperOrganics.position.set(-0.5, 1.2, 0);
  hopperOrganics.castShadow = true;
  trommelGroup.add(hopperOrganics);

  const hopperMid = new THREE.Mesh(hopperGeo, safetyOrangeMat);
  hopperMid.position.set(2.5, 1.2, 0);
  hopperMid.castShadow = true;
  trommelGroup.add(hopperMid);

  scene.add(trommelGroup);
  registerInteractive(trommelGroup, 'swm_trommel_screen');

  // -------------------------------------------------------------
  // 3. MAGNETIC & EDDY CURRENT METAL SEPARATOR
  // -------------------------------------------------------------
  const magneticGroup = new THREE.Group();
  magneticGroup.position.set(164, 0, -12);

  // Main High-Speed Belt Conveyor
  const mainBelt = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 2.0), rubberBeltMat);
  mainBelt.position.set(0, 2.5, 0);
  mainBelt.castShadow = true;
  magneticGroup.add(mainBelt);

  // Support Legs
  [-3.5, 3.5].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 2.2), steelFrameMat);
    leg.position.set(x, 1.25, 0);
    magneticGroup.add(leg);
  });

  // Overhead Cross-Belt Neodymium Magnetic Separator
  const magSuspension = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 3.6), industrialYellowMat);
  magSuspension.position.set(-1.2, 4.2, 0);
  magSuspension.castShadow = true;
  magneticGroup.add(magSuspension);

  // Ferrous Scrap Collection Skip / Bin
  const scrapBin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.4), concreteDarkMat);
  scrapBin.position.set(-1.2, 0.9, -2.8);
  scrapBin.castShadow = true;
  magneticGroup.add(scrapBin);

  // Eddy Current Rotor & Aluminum Deflection Splitter
  const eddyRotor = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 2.2, 16), chromeMat);
  eddyRotor.rotation.x = Math.PI / 2;
  eddyRotor.position.set(3.8, 2.5, 0);
  magneticGroup.add(eddyRotor);

  const aluminumBin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.4), safetyOrangeMat);
  aluminumBin.position.set(5.2, 0.9, 0);
  aluminumBin.castShadow = true;
  magneticGroup.add(aluminumBin);

  scene.add(magneticGroup);
  registerInteractive(magneticGroup, 'swm_magnetic_separator');

  // -------------------------------------------------------------
  // 4. AI OPTICAL SORTER & MRF CABIN
  // -------------------------------------------------------------
  const opticalGroup = new THREE.Group();
  opticalGroup.position.set(178, 0, -12);

  // Enclosed High-Tech MRF Sorting Cabin
  const mrfCabin = new THREE.Mesh(new THREE.BoxGeometry(10, 5.5, 7), steelFrameMat);
  mrfCabin.position.set(0, 3.5, 0);
  mrfCabin.castShadow = true;
  opticalGroup.add(mrfCabin);

  // Upper Glass Observation QC Window
  const obsWindow = new THREE.Mesh(new THREE.BoxGeometry(8, 1.8, 0.2), glassMat);
  obsWindow.position.set(0, 4.6, 3.51);
  opticalGroup.add(obsWindow);

  // NIR Laser Scanner Bridge & Pulsing Optical Rays
  const scannerBar = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 0.8), blueTechMat);
  scannerBar.position.set(0, 2.6, 0);
  opticalGroup.add(scannerBar);

  const laserPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 1.8),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
  );
  laserPlane.position.set(0, 1.7, 0);
  opticalGroup.add(laserPlane);
  animated.opticalLasers.push(laserPlane);

  // Pneumatic Air Jet Solenoid Manifold Tube
  const airTank = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4, 12), chromeMat);
  airTank.rotation.z = Math.PI / 2;
  airTank.position.set(0, 6.6, -2);
  opticalGroup.add(airTank);

  scene.add(opticalGroup);
  registerInteractive(opticalGroup, 'swm_optical_sorter');

  // -------------------------------------------------------------
  // 5. HYDRAULIC BALING & HIGH-DENSITY COMPACTOR
  // -------------------------------------------------------------
  const balerGroup = new THREE.Group();
  balerGroup.position.set(178, 0, 7);

  // Horizontal Hydraulic Press Frame
  const balerChassis = new THREE.Mesh(new THREE.BoxGeometry(9, 3.0, 3.2), concreteDarkMat);
  balerChassis.position.set(0, 1.5, 0);
  balerChassis.castShadow = true;
  balerGroup.add(balerChassis);

  // Hydraulic Ram Cylinder
  const ramCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 4.5, 16), chromeMat);
  ramCylinder.rotation.z = Math.PI / 2;
  ramCylinder.position.set(-2, 1.8, 0);
  balerGroup.add(ramCylinder);

  // Hydraulic Power Pack & Oil Reservoir
  const powerPack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.4, 2.0), industrialYellowMat);
  powerPack.position.set(-2.8, 1.2, -2.5);
  powerPack.castShadow = true;
  balerGroup.add(powerPack);

  // Stacked Finished Bales of Recycled Materials
  const baleGeo = new THREE.BoxGeometry(1.4, 1.2, 1.4);
  const petMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
  const cardMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
  const aluMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.8 });

  // PET Bales Stack
  const bale1 = new THREE.Mesh(baleGeo, petMat);
  bale1.position.set(3.5, 0.6, 2.4);
  bale1.castShadow = true;
  balerGroup.add(bale1);

  const bale2 = new THREE.Mesh(baleGeo, petMat);
  bale2.position.set(3.5, 1.8, 2.4);
  bale2.castShadow = true;
  balerGroup.add(bale2);

  // Cardboard OCC Bales Stack
  const bale3 = new THREE.Mesh(baleGeo, cardMat);
  bale3.position.set(1.8, 0.6, 2.4);
  bale3.castShadow = true;
  balerGroup.add(bale3);

  const bale4 = new THREE.Mesh(baleGeo, aluMat);
  bale4.position.set(1.8, 1.8, 2.4);
  bale4.castShadow = true;
  balerGroup.add(bale4);

  scene.add(balerGroup);
  registerInteractive(balerGroup, 'swm_bailing_compactor');

  // -------------------------------------------------------------
  // 6. AEROBIC WINDROW COMPOSTING YARD
  // -------------------------------------------------------------
  const compostingGroup = new THREE.Group();
  compostingGroup.position.set(164, 0, 7);

  // Sealed Concrete Composting Pad
  const compostPad = new THREE.Mesh(new THREE.BoxGeometry(11, 0.2, 12), concreteDarkMat);
  compostPad.position.set(0, 0.1, 0);
  compostPad.receiveShadow = true;
  compostingGroup.add(compostPad);

  // 3 Trapezoidal Windrow Compost Piles
  const windrowGeo = new THREE.CylinderGeometry(0.8, 1.8, 9.5, 8);
  windrowGeo.rotateZ(Math.PI / 2);

  [-3.6, 0, 3.6].forEach((z) => {
    const windrow = new THREE.Mesh(windrowGeo, compostSoilMat);
    windrow.position.set(0, 0.9, z);
    windrow.castShadow = true;
    compostingGroup.add(windrow);
  });

  // Mechanical Windrow Turner Machine on Tracks
  const turnerGroup = new THREE.Group();
  turnerGroup.position.set(0, 0, 0);

  const turnerChassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 4.2), emeraldGreenMat);
  turnerChassis.position.set(0, 1.8, 0);
  turnerChassis.castShadow = true;
  turnerGroup.add(turnerChassis);

  // Turner Rotating Agitation Drum
  const turnerDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.8, 12), chromeMat);
  turnerDrum.rotation.x = Math.PI / 2;
  turnerDrum.position.set(0, 1.0, 0);
  turnerGroup.add(turnerDrum);

  compostingGroup.add(turnerGroup);
  animated.compostTurner = turnerGroup;

  scene.add(compostingGroup);
  registerInteractive(compostingGroup, 'swm_organic_composting');

  // -------------------------------------------------------------
  // 7. REFUSE DERIVED FUEL (RDF) SHREDDER & PELLETIZER
  // -------------------------------------------------------------
  const rdfGroup = new THREE.Group();
  rdfGroup.position.set(150, 0, 7);

  // Heavy Industrial Dual-Shaft Shredder
  const shredderHousing = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.5, 3.5), industrialYellowMat);
  shredderHousing.position.set(-3.5, 1.75, 0);
  shredderHousing.castShadow = true;
  rdfGroup.add(shredderHousing);

  // Infeed Funnel Hopper
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.0, 1.5, 4), safetyOrangeMat);
  funnel.rotation.y = Math.PI / 4;
  funnel.position.set(-3.5, 4.25, 0);
  rdfGroup.add(funnel);

  // Rotary Thermal Drying Drum
  const dryerDrum = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 5.5, 16), chromeMat);
  dryerDrum.rotation.z = Math.PI / 2;
  dryerDrum.position.set(1.5, 2.5, 0);
  dryerDrum.castShadow = true;
  rdfGroup.add(dryerDrum);

  // RDF Pellet Extruder & Vertical Storage Silo
  const pelletSilo = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 6.5, 20), concreteMat);
  pelletSilo.position.set(5.5, 3.25, 0);
  pelletSilo.castShadow = true;
  rdfGroup.add(pelletSilo);

  const siloCap = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.2, 20), blueTechMat);
  siloCap.position.set(5.5, 7.1, 0);
  rdfGroup.add(siloCap);

  scene.add(rdfGroup);
  registerInteractive(rdfGroup, 'swm_refuse_derived_fuel');

  // -------------------------------------------------------------
  // 8. BIOMETHANATION & WET CSTR DIGESTER PLANT
  // -------------------------------------------------------------
  const biomethGroup = new THREE.Group();
  biomethGroup.position.set(136, 0, 7);

  // Large Anaerobic Wet Digester CSTR Tank
  const digesterTank = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 6.0, 24), concreteMat);
  digesterTank.position.y = 3.0;
  digesterTank.castShadow = true;
  biomethGroup.add(digesterTank);

  // Center Mechanical Agitator Motor on Top
  const agitatorMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.2, 12), industrialYellowMat);
  agitatorMotor.position.y = 6.6;
  biomethGroup.add(agitatorMotor);

  // Spherical Biogas Storage Balloon Dome
  const gasDome = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, metalness: 0.4 })
  );
  gasDome.position.set(-6.5, 0, 0);
  gasDome.castShadow = true;
  biomethGroup.add(gasDome);

  // 1.5 MW Combined Heat & Power (CHP) Engine House
  const chpHouse = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 3.8), concreteDarkMat);
  chpHouse.position.set(5.5, 1.6, 0);
  chpHouse.castShadow = true;
  biomethGroup.add(chpHouse);

  // Flare Stack with Flickering Light
  const biomethFlare = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 7.5, 8), steelFrameMat);
  biomethFlare.position.set(-6.5, 3.75, 4.5);
  biomethGroup.add(biomethFlare);

  const flareLight = new THREE.PointLight(0xf97316, 2, 12);
  flareLight.position.set(-6.5, 7.8, 4.5);
  biomethGroup.add(flareLight);
  animated.biogasFlare = flareLight;

  scene.add(biomethGroup);
  registerInteractive(biomethGroup, 'swm_biomethanation_plant');

  // -------------------------------------------------------------
  // 9. ENGINEERED SANITARY LANDFILL & LEACHATE ETP
  // -------------------------------------------------------------
  const landfillGroup = new THREE.Group();
  landfillGroup.position.set(164, 0, 22);

  // Terraced Landfill Cell with Impermeable HDPE Geomembrane
  const linerBase = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 12), hdpeLinerMat);
  linerBase.position.y = 0.2;
  linerBase.receiveShadow = true;
  landfillGroup.add(linerBase);

  // Terraced Compacted Waste Lift Layers
  const lift1 = new THREE.Mesh(new THREE.BoxGeometry(15, 1.4, 9.5), compostSoilMat);
  lift1.position.y = 0.9;
  lift1.castShadow = true;
  landfillGroup.add(lift1);

  const lift2 = new THREE.Mesh(new THREE.BoxGeometry(11, 1.4, 6.5), compostSoilMat);
  lift2.position.y = 2.3;
  lift2.castShadow = true;
  landfillGroup.add(lift2);

  // Landfill Gas (LFG) Extraction Vertical Wells
  [-4, 0, 4].forEach((x) => {
    const lfgWell = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.2, 8), industrialYellowMat);
    lfgWell.position.set(x, 2.1, 0);
    landfillGroup.add(lfgWell);
  });

  // Containerized Disc-Tube RO Leachate ETP Unit
  const leachateETP = new THREE.Mesh(new THREE.BoxGeometry(6.5, 2.6, 2.8), blueTechMat);
  leachateETP.position.set(0, 1.3, -5.2);
  leachateETP.castShadow = true;
  landfillGroup.add(leachateETP);

  scene.add(landfillGroup);
  registerInteractive(landfillGroup, 'swm_sanitary_landfill');

  // -------------------------------------------------------------
  // 10. CENTRAL SWM COMMAND & CIRCULAR ECONOMY HQ
  // -------------------------------------------------------------
  const swmAdminGroup = new THREE.Group();
  swmAdminGroup.position.set(136, 0, 22);

  // 2-Story Modern Architectural Complex
  const adminBuilding = new THREE.Mesh(new THREE.BoxGeometry(14, 7.8, 10), concreteMat);
  adminBuilding.position.y = 3.9;
  adminBuilding.castShadow = true;
  swmAdminGroup.add(adminBuilding);

  // Panoramic Glass Observation Bay
  const glassFacade = new THREE.Mesh(new THREE.BoxGeometry(12, 5.0, 0.4), glassMat);
  glassFacade.position.set(0, 4.2, 5.1);
  swmAdminGroup.add(glassFacade);

  // Rooftop Solar Photovoltaic Array
  const solarPanelGeo = new THREE.BoxGeometry(3.5, 0.1, 2.2);
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });

  [-4, 0, 4].forEach((x) => {
    [-2, 2].forEach((z) => {
      const panel = new THREE.Mesh(solarPanelGeo, solarMat);
      panel.position.set(x, 8.0, z);
      panel.rotation.x = -0.15;
      swmAdminGroup.add(panel);
    });
  });

  scene.add(swmAdminGroup);
  registerInteractive(swmAdminGroup, 'swm_admin_control');

  return animated;
}
