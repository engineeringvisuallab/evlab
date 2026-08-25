import * as THREE from 'three';
import { audioEngine } from './audioEngine';

export type VehicleTypeId = 'helicopter' | 'suv' | 'sports' | 'cng' | 'truck' | 'train' | 'metro';

export interface VehicleDefinition {
  id: VehicleTypeId;
  name: string;
  category: string;
  topSpeedKmh: number;
  acceleration: number;
  braking: number;
  handling: number;
  bodyColor: number;
  icon: string;
}

export const VEHICLE_CATALOG: VehicleDefinition[] = [
  {
    id: 'helicopter',
    name: 'SkyHawk Aerial Inspection Helicopter',
    category: 'Turbine Helicopter / Aerial',
    topSpeedKmh: 240,
    acceleration: 38,
    braking: 28,
    handling: 3.2,
    bodyColor: 0x0284c7, // Sky Blue & High-Vis Aviation Livery
    icon: '🚁',
  },
  {
    id: 'train',
    name: 'Intercity Diesel Locomotive & Coaches',
    category: 'Heavy Rail Transport',
    topSpeedKmh: 120,
    acceleration: 20,
    braking: 25,
    handling: 1.2,
    bodyColor: 0x0284c7,
    icon: '🚆',
  },
  {
    id: 'metro',
    name: 'MRT Line-6 Rapid Transit Metro Train',
    category: 'Elevated Rapid Rail',
    topSpeedKmh: 95,
    acceleration: 30,
    braking: 35,
    handling: 1.5,
    bodyColor: 0x0d9488,
    icon: '🚈',
  },
  {
    id: 'suv',
    name: '4x4 Off-Road Explorer',
    category: 'All-Terrain SUV',
    topSpeedKmh: 125,
    acceleration: 28,
    braking: 35,
    handling: 2.8,
    bodyColor: 0x0284c7, // Sky Blue
    icon: '🚙',
  },
  {
    id: 'sports',
    name: 'Apex GT Cruiser',
    category: 'Performance Sedan',
    topSpeedKmh: 175,
    acceleration: 42,
    braking: 45,
    handling: 3.4,
    bodyColor: 0xdc2626, // Crimson Red
    icon: '🏎️',
  },
  {
    id: 'cng',
    name: 'Green CNG Auto-Rickshaw',
    category: 'Bangla 3-Wheeler',
    topSpeedKmh: 75,
    acceleration: 22,
    braking: 30,
    handling: 3.8,
    bodyColor: 0x16a34a, // Bangladesh Green
    icon: '🛺',
  },
  {
    id: 'truck',
    name: 'Titan Heavy Pickup',
    category: 'Worksite Utility',
    topSpeedKmh: 110,
    acceleration: 25,
    braking: 38,
    handling: 2.4,
    bodyColor: 0xeab308, // Safety Yellow
    icon: '🛻',
  },
];

export interface VehiclePhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  speedKmh: number;
  rpm: number; // 0 to 1
  gear: 'P' | 'D' | 'R' | 'FLY';
  steerAngle: number; // radians
  heading: number; // yaw angle radians
  pitch: number;
  roll: number;
  altitudeMeters: number;
  headlightsOn: boolean;
  isBraking: boolean;
  isReversing: boolean;
  isDrifting: boolean;
  isAirborne: boolean;
}

export class PlayableVehicle {
  public type: VehicleTypeId;
  public group: THREE.Group;
  public state: VehiclePhysicsState;
  private def: VehicleDefinition;

  // Visual sub-meshes for animation
  private frontLeftWheel: THREE.Object3D | null = null;
  private frontRightWheel: THREE.Object3D | null = null;
  private rearLeftWheel: THREE.Object3D | null = null;
  private rearRightWheel: THREE.Object3D | null = null;
  private mainRotorGroup: THREE.Group | null = null;
  private tailRotorGroup: THREE.Group | null = null;
  private headlights: THREE.SpotLight[] = [];
  private taillights: THREE.Mesh[] = [];
  private chassisMesh: THREE.Object3D | null = null;
  private verticalVelocity: number = 0;
  private trainLinearSpeed: number = 0;
  private targetTrackX: number = -122.0;
  private metroLinearSpeed: number = 0;
  private targetTrackZ: number = -47.2;

  constructor(type: VehicleTypeId, initialPos = new THREE.Vector3(20, 2.5, 50), initialHeading = 0) {
    this.type = type;
    this.def = VEHICLE_CATALOG.find((v) => v.id === type) || VEHICLE_CATALOG[0];
    this.group = new THREE.Group();
    this.group.name = `playable_vehicle_${type}`;

    let startPos = initialPos.clone();
    let startHeading = initialHeading;

    if (type === 'train') {
      startPos.set(-122.0, 1.2, 25);
      startHeading = 0;
    } else if (type === 'metro') {
      startPos.set(15, 14.9, -47.2);
      startHeading = -Math.PI / 2;
    }

    this.state = {
      position: startPos,
      velocity: new THREE.Vector3(),
      speedKmh: 0,
      rpm: 0.15,
      gear: type === 'helicopter' ? 'FLY' : 'D',
      steerAngle: 0,
      heading: startHeading,
      pitch: 0,
      roll: 0,
      altitudeMeters: type === 'metro' ? 15 : 0,
      headlightsOn: false,
      isBraking: false,
      isReversing: false,
      isDrifting: false,
      isAirborne: false,
    };

    this.buildVehicleMesh();
    this.updateTransform();
  }

  public setVehicleType(newType: VehicleTypeId, getElevationAt?: (x: number, z: number) => number) {
    this.type = newType;
    this.def = VEHICLE_CATALOG.find((v) => v.id === newType) || VEHICLE_CATALOG[0];

    // Clear old mesh
    while (this.group.children.length > 0) {
      const obj = this.group.children[0];
      this.group.remove(obj);
    }
    this.headlights = [];
    this.taillights = [];
    this.frontLeftWheel = null;
    this.frontRightWheel = null;
    this.rearLeftWheel = null;
    this.rearRightWheel = null;
    this.mainRotorGroup = null;
    this.tailRotorGroup = null;
    this.verticalVelocity = 0;
    this.trainLinearSpeed = 0;
    this.metroLinearSpeed = 0;

    if (newType === 'train') {
      // Reposition directly on the railway mainline (Grand Central Terminal platform or current Z)
      const currentZ = THREE.MathUtils.clamp(this.state.position.z, -2300, 2300);
      const targetZ = Math.abs(currentZ) < 50 ? 25 : currentZ;
      this.targetTrackX = -122.0;
      const elev = getElevationAt ? getElevationAt(this.targetTrackX, targetZ) + 0.6 : 1.2;
      this.state.position.set(this.targetTrackX, elev, targetZ);
      this.state.velocity.set(0, 0, 0);
      this.state.heading = 0; // Pointing along rail axis
      this.state.pitch = 0;
      this.state.roll = 0;
      this.state.speedKmh = 0;
      this.state.gear = 'D';
    } else if (newType === 'metro') {
      // Reposition directly on the elevated MRT Line-6 viaduct (Metropolitan Central station or current X)
      const currentX = THREE.MathUtils.clamp(this.state.position.x, -400, 850);
      const targetX = Math.abs(currentX) < 60 ? 15 : currentX;
      this.targetTrackZ = -47.2;
      this.state.position.set(targetX, 14.9, this.targetTrackZ);
      this.state.velocity.set(0, 0, 0);
      this.state.heading = -Math.PI / 2; // Facing +X along viaduct
      this.state.pitch = 0;
      this.state.roll = 0;
      this.state.speedKmh = 0;
      this.state.altitudeMeters = 15;
      this.state.gear = 'D';
    } else if (newType === 'helicopter') {
      const elev = getElevationAt ? getElevationAt(this.state.position.x, this.state.position.z) + 0.65 : 10;
      this.state.position.y = Math.max(this.state.position.y, elev);
      this.state.gear = 'FLY';
    } else {
      // Ground car
      const elev = getElevationAt ? getElevationAt(this.state.position.x, this.state.position.z) + 0.25 : 0.5;
      this.state.position.y = elev;
      this.state.gear = 'D';
    }

    this.buildVehicleMesh();
    this.updateTransform();
  }

  private buildVehicleMesh() {
    const bodyColor = this.def.bodyColor;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.35,
      metalness: 0.55,
    });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const blackTrimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.08,
      metalness: 0.95,
      opacity: 0.85,
      transparent: true,
    });
    const rotorBladeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 });
    const yellowTipMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.2, metalness: 0.8 });

    const createWheel = (radius = 0.42, width = 0.3): THREE.Group => {
      const wheelGrp = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 16), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGrp.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width + 0.02, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGrp.add(rim);
      return wheelGrp;
    };

    if (this.type === 'helicopter') {
      // =========================================================================
      // HIGH-FIDELITY TURBINE INSPECTION HELICOPTER (SkyHawk)
      // =========================================================================
      const heliBody = new THREE.Group();

      // 1. Aerodynamic Main Fuselage Pod
      const fuselage = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 5.2), bodyMat);
      fuselage.position.set(0, 1.8, 0.4);
      fuselage.castShadow = true;
      heliBody.add(fuselage);

      // Rounded Front Nose
      const nose = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 16), bodyMat);
      nose.rotation.x = -Math.PI / 2;
      nose.position.set(0, 1.8, -2.5);
      nose.scale.set(1.0, 1.0, 0.9);
      heliBody.add(nose);

      // Panoramic Cockpit Bubble Windshield Glass
      const cockpitGlass = new THREE.Mesh(new THREE.BoxGeometry(2.32, 1.6, 2.4), glassMat);
      cockpitGlass.position.set(0, 2.1, -1.2);
      heliBody.add(cockpitGlass);

      // Pilot Seats & Dashboard inside
      const seatL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.9, 0.7), blackTrimMat);
      seatL.position.set(-0.55, 1.5, -0.9);
      heliBody.add(seatL);

      const seatR = seatL.clone();
      seatR.position.x = 0.55;
      heliBody.add(seatR);

      const avionics = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.5, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.6 })
      );
      avionics.position.set(0, 1.5, -1.8);
      heliBody.add(avionics);

      // High-vis Contrast Stripe (Red & White VIP / Inspection livery)
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.4, 5.24), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
      stripe.position.set(0, 1.5, 0.4);
      heliBody.add(stripe);

      // 2. Overhead Turboshaft Engine Cowling & Air Intakes
      const engineCowling = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 2.8), whiteMat);
      engineCowling.position.set(0, 3.0, 0.5);
      heliBody.add(engineCowling);

      // Dual Jet Air Intakes
      for (const ox of [-0.55, 0.55]) {
        const intake = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.8, 12), blackTrimMat);
        intake.rotation.x = Math.PI / 2;
        intake.position.set(ox, 3.1, -0.9);
        heliBody.add(intake);

        // Stainless Exhaust Nozzles
        const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.7, 10), chromeMat);
        exhaust.rotation.x = -Math.PI / 4;
        exhaust.position.set(ox, 3.1, 1.9);
        heliBody.add(exhaust);
      }

      // 3. Tail Boom & Empennage
      const tailBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.65, 6.2, 8), bodyMat);
      tailBoom.rotation.x = Math.PI / 2;
      tailBoom.position.set(0, 2.3, 5.8);
      heliBody.add(tailBoom);

      // Horizontal Stabilizer Wing
      const horizStab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 0.6), whiteMat);
      horizStab.position.set(0, 2.3, 7.5);
      heliBody.add(horizStab);

      // Vertical Tail Fin
      const vertFin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.2, 1.2), bodyMat);
      vertFin.position.set(0, 3.1, 8.8);
      vertFin.rotation.x = -0.2;
      heliBody.add(vertFin);

      // Aviation Navigation & Strobe Lights
      const navRed = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      navRed.position.set(-1.25, 1.8, 0.5);
      heliBody.add(navRed);

      const navGreen = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
      navGreen.position.set(1.25, 1.8, 0.5);
      heliBody.add(navGreen);

      const tailStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf8fafc }));
      tailStrobe.position.set(0, 4.2, 8.7);
      heliBody.add(tailStrobe);

      // 4. Tubular Skid Landing Gear
      const skidMat = chromeMat;
      for (const sx of [-1.15, 1.15]) {
        // Longitudinal Skid Tube
        const skidTube = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5.0, 8), skidMat);
        skidTube.rotation.x = Math.PI / 2;
        skidTube.position.set(sx, 0.25, 0.2);
        heliBody.add(skidTube);

        // Curved Front Toe
        const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8), skidMat);
        toe.rotation.x = Math.PI / 3;
        toe.position.set(sx, 0.45, -2.4);
        heliBody.add(toe);

        // Front Cross-Strut
        const frontStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 8), skidMat);
        frontStrut.rotation.z = sx > 0 ? -0.4 : 0.4;
        frontStrut.position.set(sx * 0.7, 0.65, -1.2);
        heliBody.add(frontStrut);

        // Rear Cross-Strut
        const rearStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 8), skidMat);
        rearStrut.rotation.z = sx > 0 ? -0.4 : 0.4;
        rearStrut.position.set(sx * 0.7, 0.65, 1.6);
        heliBody.add(rearStrut);
      }

      this.chassisMesh = heliBody;
      this.group.add(heliBody);

      // 5. MAIN ROTOR SYSTEM (4 Blades with Yellow Tips)
      const mainRotor = new THREE.Group();
      mainRotor.position.set(0, 3.65, 0.3);

      // Rotor Mast & Swashplate Hub
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.8, 12), chromeMat);
      mast.position.y = -0.15;
      mainRotor.add(mast);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.25, 16), blackTrimMat);
      hub.position.y = 0.25;
      mainRotor.add(hub);

      // 4 High-Aspect Rotor Blades (Diameter 11m)
      const bladeLen = 5.2;
      for (let b = 0; b < 4; b++) {
        const bladeArm = new THREE.Group();
        bladeArm.rotation.y = (b * Math.PI) / 2;

        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, bladeLen), rotorBladeMat);
        blade.position.set(0, 0.25, bladeLen / 2 + 0.3);
        blade.castShadow = true;
        bladeArm.add(blade);

        // High-vis Yellow Blade Tip
        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.05, 0.6), yellowTipMat);
        tip.position.set(0, 0.25, bladeLen + 0.05);
        bladeArm.add(tip);

        mainRotor.add(bladeArm);
      }
      this.mainRotorGroup = mainRotor;
      this.group.add(mainRotor);

      // 6. TAIL ANTI-TORQUE ROTOR (2 Blades)
      const tailRotor = new THREE.Group();
      tailRotor.position.set(0.22, 3.4, 8.8);

      const tailHub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 10), chromeMat);
      tailHub.rotation.z = Math.PI / 2;
      tailRotor.add(tailHub);

      for (let tb = 0; tb < 2; tb++) {
        const tBlade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.03), rotorBladeMat);
        tBlade.rotation.x = (tb * Math.PI) / 2;
        tailRotor.add(tBlade);
      }
      this.tailRotorGroup = tailRotor;
      this.group.add(tailRotor);

      // 7. HIGH-POWER FORWARD SEARCHLIGHT / LANDING LIGHT
      const searchLight = new THREE.SpotLight(0xfef08a, 4.0, 180, Math.PI / 3.2, 0.35, 1.2);
      searchLight.position.set(0, 1.0, -2.4);
      searchLight.target.position.set(0, -20, -60);
      this.group.add(searchLight);
      this.group.add(searchLight.target);
      this.headlights.push(searchLight);

      const searchBulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.0 })
      );
      searchBulb.position.set(0, 0.9, -2.45);
      this.group.add(searchBulb);

    } else if (this.type === 'suv') {
      // 1. 4x4 Safari SUV
      const body = new THREE.Group();

      const lower = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.9, 4.4), bodyMat);
      lower.position.y = 0.85;
      lower.castShadow = true;
      body.add(lower);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.95, 2.6), bodyMat);
      cabin.position.set(0, 1.7, -0.2);
      cabin.castShadow = true;
      body.add(cabin);

      const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.75, 2.5), glassMat);
      windshield.position.set(0, 1.72, -0.2);
      body.add(windshield);

      const roofRack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 2.2), blackTrimMat);
      roofRack.position.set(0, 2.25, -0.2);
      body.add(roofRack);

      const spare = createWheel(0.38, 0.25);
      spare.rotation.y = Math.PI / 2;
      spare.position.set(0, 1.2, 2.25);
      body.add(spare);

      const bullBar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.3), blackTrimMat);
      bullBar.position.set(0, 0.7, -2.25);
      body.add(bullBar);

      this.chassisMesh = body;
      this.group.add(body);

      this.frontLeftWheel = createWheel(0.44, 0.32);
      this.frontLeftWheel.position.set(-1.08, 0.44, -1.35);
      this.group.add(this.frontLeftWheel);

      this.frontRightWheel = createWheel(0.44, 0.32);
      this.frontRightWheel.position.set(1.08, 0.44, -1.35);
      this.group.add(this.frontRightWheel);

      this.rearLeftWheel = createWheel(0.44, 0.32);
      this.rearLeftWheel.position.set(-1.08, 0.44, 1.35);
      this.group.add(this.rearLeftWheel);

      this.rearRightWheel = createWheel(0.44, 0.32);
      this.rearRightWheel.position.set(1.08, 0.44, 1.35);
      this.group.add(this.rearRightWheel);

    } else if (this.type === 'sports') {
      // 2. Performance GT Cruiser
      const body = new THREE.Group();

      const lower = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.65, 4.6), bodyMat);
      lower.position.y = 0.55;
      lower.castShadow = true;
      body.add(lower);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.7, 2.4), glassMat);
      roof.position.set(0, 1.15, 0.1);
      body.add(roof);

      const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.4), blackTrimMat);
      spoilerWing.position.set(0, 1.15, 2.05);
      body.add(spoilerWing);

      const spoilerLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.1), blackTrimMat);
      spoilerLeg1.position.set(-0.6, 1.0, 2.05);
      body.add(spoilerLeg1);
      const spoilerLeg2 = spoilerLeg1.clone();
      spoilerLeg2.position.x = 0.6;
      body.add(spoilerLeg2);

      this.chassisMesh = body;
      this.group.add(body);

      this.frontLeftWheel = createWheel(0.38, 0.28);
      this.frontLeftWheel.position.set(-1.02, 0.38, -1.35);
      this.group.add(this.frontLeftWheel);

      this.frontRightWheel = createWheel(0.38, 0.28);
      this.frontRightWheel.position.set(1.02, 0.38, -1.35);
      this.group.add(this.frontRightWheel);

      this.rearLeftWheel = createWheel(0.4, 0.32);
      this.rearLeftWheel.position.set(-1.02, 0.4, 1.35);
      this.group.add(this.rearLeftWheel);

      this.rearRightWheel = createWheel(0.4, 0.32);
      this.rearRightWheel.position.set(1.02, 0.4, 1.35);
      this.group.add(this.rearRightWheel);

    } else if (this.type === 'cng') {
      // 3. Green CNG Auto-Rickshaw
      const body = new THREE.Group();

      const base = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.4, 2.6), bodyMat);
      base.position.y = 0.45;
      base.castShadow = true;
      body.add(base);

      const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 2.2), bodyMat);
      canopy.position.set(0, 1.15, 0.1);
      body.add(canopy);

      const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.1), glassMat);
      frontGlass.position.set(0, 1.25, -0.98);
      body.add(frontGlass);

      const grill = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.1), blackTrimMat);
      grill.position.set(0, 0.55, -1.3);
      body.add(grill);

      this.chassisMesh = body;
      this.group.add(body);

      this.frontLeftWheel = createWheel(0.3, 0.18);
      this.frontLeftWheel.position.set(0, 0.3, -1.1);
      this.group.add(this.frontLeftWheel);

      this.rearLeftWheel = createWheel(0.32, 0.2);
      this.rearLeftWheel.position.set(-0.72, 0.32, 0.9);
      this.group.add(this.rearLeftWheel);

      this.rearRightWheel = createWheel(0.32, 0.2);
      this.rearRightWheel.position.set(0.72, 0.32, 0.9);
      this.group.add(this.rearRightWheel);

    } else if (this.type === 'train') {
      // 5. Intercity Diesel-Electric Locomotive + Passenger Coaches
      const body = new THREE.Group();

      // Locomotive Body
      const loco = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 4.2, 14.5),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.35 })
      );
      loco.position.set(0, 2.5, 0);
      loco.castShadow = true;
      body.add(loco);

      // Red Contrast Livery
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(3.64, 0.7, 14.6),
        new THREE.MeshStandardMaterial({ color: 0xdc2626 })
      );
      stripe.position.set(0, 2.2, 0);
      body.add(stripe);

      // Cab Windshield
      const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.3, 0.3), glassMat);
      cabGlass.position.set(0, 3.6, -7.2);
      body.add(cabGlass);

      // Two Passenger Coaches Behind
      for (let c = 1; c <= 2; c++) {
        const coach = new THREE.Group();
        coach.position.z = c * 16;

        const cBody = new THREE.Mesh(
          new THREE.BoxGeometry(3.4, 3.9, 14.5),
          new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 })
        );
        cBody.position.y = 2.4;
        coach.add(cBody);

        const cStripe = new THREE.Mesh(
          new THREE.BoxGeometry(3.44, 0.8, 14.6),
          new THREE.MeshStandardMaterial({ color: 0xdc2626 })
        );
        cStripe.position.set(0, 2.3, 0);
        coach.add(cStripe);

        for (let wz = -4.5; wz <= 4.5; wz += 2.2) {
          const pWin = new THREE.Mesh(
            new THREE.BoxGeometry(3.48, 0.9, 1.3),
            new THREE.MeshBasicMaterial({ color: 0xfef08a })
          );
          pWin.position.set(0, 2.8, wz);
          coach.add(pWin);
        }

        body.add(coach);
      }

      this.chassisMesh = body;
      this.group.add(body);

      this.frontLeftWheel = createWheel(0.55, 0.25);
      this.frontLeftWheel.position.set(-1.4, 0.55, -4.5);
      this.group.add(this.frontLeftWheel);

      this.frontRightWheel = createWheel(0.55, 0.25);
      this.frontRightWheel.position.set(1.4, 0.55, -4.5);
      this.group.add(this.frontRightWheel);

      this.rearLeftWheel = createWheel(0.55, 0.25);
      this.rearLeftWheel.position.set(-1.4, 0.55, 4.5);
      this.group.add(this.rearLeftWheel);

      this.rearRightWheel = createWheel(0.55, 0.25);
      this.rearRightWheel.position.set(1.4, 0.55, 4.5);
      this.group.add(this.rearRightWheel);

    } else if (this.type === 'metro') {
      // 6. MRT Line-6 Aerodynamic Rapid Transit Metro Train
      const body = new THREE.Group();
      const metroMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.75, roughness: 0.25 });
      const metroTeal = new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.4 });

      for (let m = 0; m < 2; m++) {
        const mCar = new THREE.Group();
        mCar.position.z = m * 15;

        const mBody = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.2, 14.0), metroMat);
        mBody.position.y = 1.9;
        mCar.add(mBody);

        const mBand = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.75, 14.05), metroTeal);
        mBand.position.set(0, 1.9, 0);
        mCar.add(mBand);

        for (let wz = -4.2; wz <= 4.2; wz += 2.6) {
          const mWin = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.1, 1.8), glassMat);
          mWin.position.set(0, 2.2, wz);
          mCar.add(mWin);
        }

        body.add(mCar);
      }

      // Streamlined Nose
      const nose = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.4, 16), metroMat);
      nose.rotation.x = -Math.PI / 2;
      nose.position.set(0, 1.9, -7.8);
      body.add(nose);

      this.chassisMesh = body;
      this.group.add(body);

      this.frontLeftWheel = createWheel(0.48, 0.22);
      this.frontLeftWheel.position.set(-1.3, 0.48, -4.0);
      this.group.add(this.frontLeftWheel);

      this.frontRightWheel = createWheel(0.48, 0.22);
      this.frontRightWheel.position.set(1.3, 0.48, -4.0);
      this.group.add(this.frontRightWheel);

      this.rearLeftWheel = createWheel(0.48, 0.22);
      this.rearLeftWheel.position.set(-1.3, 0.48, 4.0);
      this.group.add(this.rearLeftWheel);

      this.rearRightWheel = createWheel(0.48, 0.22);
      this.rearRightWheel.position.set(1.3, 0.48, 4.0);
      this.group.add(this.rearRightWheel);

    } else {
      // 4. Heavy Worksite Pickup Truck
      const body = new THREE.Group();

      const cab = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.1, 2.2), bodyMat);
      cab.position.set(0, 1.2, -0.9);
      cab.castShadow = true;
      body.add(cab);

      const glass = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.65, 1.8), glassMat);
      glass.position.set(0, 1.35, -0.9);
      body.add(glass);

      const bed = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 2.4), blackTrimMat);
      bed.position.set(0, 0.9, 1.25);
      bed.castShadow = true;
      body.add(bed);

      const beacon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.15, 8),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.8 })
      );
      beacon.position.set(0, 1.85, -0.9);
      body.add(beacon);

      this.chassisMesh = body;
      this.group.add(body);

      this.frontLeftWheel = createWheel(0.45, 0.34);
      this.frontLeftWheel.position.set(-1.1, 0.45, -1.45);
      this.group.add(this.frontLeftWheel);

      this.frontRightWheel = createWheel(0.45, 0.34);
      this.frontRightWheel.position.set(1.1, 0.45, -1.45);
      this.group.add(this.frontRightWheel);

      this.rearLeftWheel = createWheel(0.45, 0.34);
      this.rearLeftWheel.position.set(-1.1, 0.45, 1.45);
      this.group.add(this.rearLeftWheel);

      this.rearRightWheel = createWheel(0.45, 0.34);
      this.rearRightWheel.position.set(1.1, 0.45, 1.45);
      this.group.add(this.rearRightWheel);
    }

    if (this.type !== 'helicopter') {
      // Add Dual Headlights Spotlights & Glow Emissives
      const head1 = new THREE.SpotLight(0xffedd5, 2.5, 55, Math.PI / 4, 0.35, 1.5);
      head1.position.set(-0.7, 0.85, -2.1);
      head1.target.position.set(-0.7, 0.2, -18);
      this.group.add(head1);
      this.group.add(head1.target);
      this.headlights.push(head1);

      const head2 = new THREE.SpotLight(0xffedd5, 2.5, 55, Math.PI / 4, 0.35, 1.5);
      head2.position.set(0.7, 0.85, -2.1);
      head2.target.position.set(0.7, 0.2, -18);
      this.group.add(head2);
      this.group.add(head2.target);
      this.headlights.push(head2);

      const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9 });
      const bulbL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.1), bulbMat);
      bulbL.position.set(-0.7, 0.8, -2.15);
      this.group.add(bulbL);
      const bulbR = bulbL.clone();
      bulbR.position.x = 0.7;
      this.group.add(bulbR);

      // Taillights
      const tailMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x7f1d1d, emissiveIntensity: 0.4 });
      const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.1), tailMat);
      tailL.position.set(-0.7, 0.8, 2.15);
      this.group.add(tailL);
      this.taillights.push(tailL);
      const tailR = tailL.clone();
      tailR.position.x = 0.7;
      this.group.add(tailR);
      this.taillights.push(tailR);
    }
  }

  public setHeadlights(on: boolean) {
    this.state.headlightsOn = on;
    this.headlights.forEach((hl) => {
      hl.visible = on;
    });
  }

  public honk() {
    if (this.type === 'train') {
      audioEngine.playTrainHorn();
    } else if (this.type === 'metro') {
      audioEngine.playMetroChime();
    } else {
      audioEngine.playHorn();
    }
  }

  public resetPosition(elevationAtPos: number) {
    this.state.velocity.set(0, 0, 0);
    this.verticalVelocity = 0;
    this.state.speedKmh = 0;
    this.state.pitch = 0;
    this.state.roll = 0;
    this.state.position.y = elevationAtPos + (this.type === 'helicopter' ? 0.65 : 0.4);
    audioEngine.playDoorThud();
  }

  public updatePhysics(
    delta: number,
    inputs: { throttle: number; steer: number; brake: boolean; handbrake: boolean; liftUp?: boolean; descend?: boolean },
    getElevationAt: (x: number, z: number) => number
  ) {
    const dt = Math.min(delta, 0.1);
    const def = this.def;

    if (this.type === 'helicopter') {
      // =======================================================================
      // HELICOPTER AERIAL FLIGHT SIMULATOR (6-DOF AERODYNAMICS)
      // Controls:
      //   - Space / liftUp: Lift UP (ascend)
      //   - Shift / descend / brake: Descend
      //   - ArrowUp / W (throttle > 0): Pitch forward & fly forward
      //   - ArrowDown / S (throttle < 0): Pitch up & fly backward
      //   - ArrowLeft / A (steer < 0): Turn & roll left
      //   - ArrowRight / D (steer > 0): Turn & roll right
      // =======================================================================
      const groundY = getElevationAt(this.state.position.x, this.state.position.z);
      const minLandingY = groundY + 0.65;
      const currentAltitude = Math.max(0, this.state.position.y - minLandingY);
      this.state.altitudeMeters = Math.round(currentAltitude);
      const isAirborne = currentAltitude > 0.3;
      this.state.isAirborne = isAirborne;
      this.state.gear = 'FLY';

      // 1. VERTICAL LIFT & ALTITUDE
      const liftForce = inputs.liftUp ? 24 : 0;
      const descendForce = (inputs.descend || (inputs.brake && isAirborne)) ? 16 : 0;
      
      if (inputs.liftUp) {
        this.verticalVelocity += (liftForce - 9.8) * dt;
      } else if (descendForce > 0) {
        this.verticalVelocity -= (descendForce + 6.0) * dt;
      } else if (isAirborne) {
        // Aerodynamic hover dampening
        this.verticalVelocity = THREE.MathUtils.lerp(this.verticalVelocity, 0, 3.5 * dt);
      } else {
        this.verticalVelocity = 0;
      }

      // Clamp vertical speeds
      this.verticalVelocity = THREE.MathUtils.clamp(this.verticalVelocity, -25, 32);
      this.state.position.y += this.verticalVelocity * dt;

      // Ground touchdown / collision
      if (this.state.position.y < minLandingY) {
        this.state.position.y = minLandingY;
        this.verticalVelocity = 0;
      }

      // Max flight ceiling (1,400 meters)
      if (this.state.position.y > 1400) {
        this.state.position.y = 1400;
        this.verticalVelocity = Math.min(0, this.verticalVelocity);
      }

      // 2. YAW STEERING (Turning left/right)
      const turnRate = 2.4; // rad/s
      if (Math.abs(inputs.steer) > 0.05) {
        this.state.heading -= inputs.steer * turnRate * dt;
      }

      // 3. HORIZONTAL FLIGHT (Pitch & Forward/Backward thrust)
      const forwardVec = new THREE.Vector3(-Math.sin(this.state.heading), 0, -Math.cos(this.state.heading));

      const maxSpeedMs = (def.topSpeedKmh * 1000) / 3600; // ~66.7 m/s (240 km/h)
      let currentHorizSpeed = this.state.velocity.dot(forwardVec);

      // Pitch tilt when accelerating forward or backward
      let targetPitch = 0;
      if (inputs.throttle > 0) {
        targetPitch = -0.28; // nose down forward
        currentHorizSpeed += def.acceleration * inputs.throttle * dt;
      } else if (inputs.throttle < 0) {
        targetPitch = 0.22; // nose up braking/backward
        currentHorizSpeed += def.acceleration * inputs.throttle * dt * 0.7;
      } else {
        // Air resistance dampening
        targetPitch = 0;
        currentHorizSpeed = THREE.MathUtils.lerp(currentHorizSpeed, 0, 1.8 * dt);
      }

      currentHorizSpeed = THREE.MathUtils.clamp(currentHorizSpeed, -25, maxSpeedMs);

      // Bank Roll when turning
      const targetRoll = -inputs.steer * (0.35 + (Math.abs(currentHorizSpeed) / maxSpeedMs) * 0.2);

      this.state.pitch = THREE.MathUtils.lerp(this.state.pitch, targetPitch, 5 * dt);
      this.state.roll = THREE.MathUtils.lerp(this.state.roll, targetRoll, 5 * dt);

      // Update horizontal velocity & position
      this.state.velocity.copy(forwardVec).multiplyScalar(currentHorizSpeed);
      this.state.position.x += this.state.velocity.x * dt;
      this.state.position.z += this.state.velocity.z * dt;

      this.state.speedKmh = Math.round(Math.abs(currentHorizSpeed) * 3.6);
      this.state.rpm = Math.min(1.0, 0.4 + (Math.abs(currentHorizSpeed) / maxSpeedMs) * 0.6);

      // 4. ANIMATE ROTORS
      const rotorSpeed = (isAirborne || inputs.liftUp || Math.abs(inputs.throttle) > 0.05) ? 45 : 20;
      if (this.mainRotorGroup) {
        this.mainRotorGroup.rotation.y += rotorSpeed * dt;
      }
      if (this.tailRotorGroup) {
        this.tailRotorGroup.rotation.x += rotorSpeed * 2.2 * dt;
      }

      // Audio engine helicopter turboshaft sound
      audioEngine.updateEngineSound(this.state.rpm, true, true);

      this.updateTransform();
      return;
    }

    if (this.type === 'train') {
      // =======================================================================
      // HEAVY RAILWAY SIMULATION (STRICTLY LOCKED TO DUAL TRACKS ALONG x = -120)
      // Track 1 (Up Line): x = -122.0
      // Track 2 (Down Line): x = -118.0
      // Mainline Corridor: z = -2400 to +2400 (North-South)
      // =======================================================================
      const maxSpeedMs = (def.topSpeedKmh * 1000) / 3600; // ~33.3 m/s (120 km/h)

      // 1. Dual-Track Crossover Switching (A/D or Steer)
      if (inputs.steer < -0.25) {
        this.targetTrackX = -122.0; // Left / Up Line
      } else if (inputs.steer > 0.25) {
        this.targetTrackX = -118.0; // Right / Down Line
      }
      this.state.position.x = THREE.MathUtils.lerp(this.state.position.x, this.targetTrackX, 2.8 * dt);

      // 2. Locomotive Diesel-Electric Throttle & Air Brake Dynamics
      if (inputs.throttle > 0) {
        this.state.gear = 'D';
        this.state.isBraking = false;
        this.trainLinearSpeed += def.acceleration * inputs.throttle * dt * 0.45;
      } else if (inputs.throttle < 0) {
        if (this.trainLinearSpeed > 0.4) {
          // Pneumatic train air brake deceleration
          this.trainLinearSpeed -= def.braking * 0.65 * dt;
          this.state.isBraking = true;
        } else {
          // Reversing along tracks
          this.state.gear = 'R';
          this.state.isBraking = false;
          this.trainLinearSpeed -= def.acceleration * 0.3 * dt;
        }
      } else if (inputs.brake || inputs.handbrake) {
        // Emergency Pneumatic Train Air Brake
        this.trainLinearSpeed = THREE.MathUtils.lerp(this.trainLinearSpeed, 0, (inputs.handbrake ? 3.5 : 2.2) * dt);
        this.state.isBraking = true;
      } else {
        this.state.isBraking = false;
        // Heavy steel wheel rolling friction
        this.trainLinearSpeed = THREE.MathUtils.lerp(this.trainLinearSpeed, 0, 0.1 * dt);
      }

      this.trainLinearSpeed = THREE.MathUtils.clamp(this.trainLinearSpeed, -maxSpeedMs * 0.35, maxSpeedMs);
      if (Math.abs(this.trainLinearSpeed) < 0.05 && Math.abs(inputs.throttle) < 0.05) {
        this.trainLinearSpeed = 0;
      }

      // 3. Move Train strictly along Railway Mainline (Heading 0 points along -Z)
      this.state.position.z -= this.trainLinearSpeed * dt;

      // Loop around at railway terminal boundaries
      if (this.state.position.z < -2400) {
        this.state.position.z = 2400;
      } else if (this.state.position.z > 2400) {
        this.state.position.z = -2400;
      }

      // 4. Trackbed Elevation & Gradient Pitch
      const groundY = getElevationAt(this.state.position.x, this.state.position.z) + 0.6;
      const frontY = getElevationAt(this.state.position.x, this.state.position.z - 8.0) + 0.6;
      const targetPitch = Math.atan2(frontY - groundY, 8.0);

      this.state.position.y = groundY;
      this.state.pitch = THREE.MathUtils.lerp(this.state.pitch, targetPitch, 6 * dt);
      this.state.roll = 0;
      this.state.heading = 0; // Strictly locked along railway line
      this.state.steerAngle = 0;
      this.state.altitudeMeters = 0;
      this.state.isAirborne = false;

      this.state.speedKmh = Math.round(Math.abs(this.trainLinearSpeed) * 3.6);
      this.state.rpm = Math.min(1.0, 0.2 + (Math.abs(this.trainLinearSpeed) / maxSpeedMs) * 0.8);

      // Taillights and brake lights
      this.taillights.forEach((tl) => {
        const mat = tl.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.emissiveIntensity = this.state.isBraking ? 1.6 : (this.state.headlightsOn ? 0.7 : 0.25);
        }
      });

      // Animate heavy locomotive wheels
      const wheelRotDelta = (this.trainLinearSpeed / (0.55 * 2 * Math.PI)) * dt * Math.PI * 2;
      if (this.frontLeftWheel && this.frontLeftWheel.children[0]) this.frontLeftWheel.children[0].rotation.x += wheelRotDelta;
      if (this.frontRightWheel && this.frontRightWheel.children[0]) this.frontRightWheel.children[0].rotation.x += wheelRotDelta;
      if (this.rearLeftWheel && this.rearLeftWheel.children[0]) this.rearLeftWheel.children[0].rotation.x += wheelRotDelta;
      if (this.rearRightWheel && this.rearRightWheel.children[0]) this.rearRightWheel.children[0].rotation.x += wheelRotDelta;

      audioEngine.updateEngineSound(this.state.rpm, true, false);
      this.updateTransform();
      return;
    }

    if (this.type === 'metro') {
      // =======================================================================
      // ELEVATED METRO RAIL MRT LINE-6 SIMULATION (STRICTLY LOCKED TO VIADUCT)
      // Track 1 (Westbound): z = -47.2
      // Track 2 (Eastbound): z = -42.8
      // Viaduct Corridor: x = -450 to +900 (East-West)
      // Viaduct Deck Height: 14.9m
      // =======================================================================
      const maxSpeedMs = (def.topSpeedKmh * 1000) / 3600; // ~26.4 m/s (95 km/h)

      // 1. Viaduct Dual-Track Switch (A/D or Steer)
      if (inputs.steer < -0.25) {
        this.targetTrackZ = -47.2; // Westbound Track 1
      } else if (inputs.steer > 0.25) {
        this.targetTrackZ = -42.8; // Eastbound Track 2
      }
      this.state.position.z = THREE.MathUtils.lerp(this.state.position.z, this.targetTrackZ, 2.8 * dt);

      // 2. Electric Traction Motor & Regenerative Braking
      if (inputs.throttle > 0) {
        this.state.gear = 'D';
        this.state.isBraking = false;
        this.metroLinearSpeed += def.acceleration * inputs.throttle * dt * 0.65;
      } else if (inputs.throttle < 0) {
        if (this.metroLinearSpeed > 0.4) {
          // Regenerative electric braking
          this.metroLinearSpeed -= def.braking * 0.85 * dt;
          this.state.isBraking = true;
        } else {
          // Reversing along viaduct
          this.state.gear = 'R';
          this.state.isBraking = false;
          this.metroLinearSpeed -= def.acceleration * 0.45 * dt;
        }
      } else if (inputs.brake || inputs.handbrake) {
        // Station precision platform / emergency magnetic brake
        this.metroLinearSpeed = THREE.MathUtils.lerp(this.metroLinearSpeed, 0, (inputs.handbrake ? 4.2 : 2.8) * dt);
        this.state.isBraking = true;
      } else {
        this.state.isBraking = false;
        // Low-friction steel rail glide
        this.metroLinearSpeed = THREE.MathUtils.lerp(this.metroLinearSpeed, 0, 0.08 * dt);
      }

      this.metroLinearSpeed = THREE.MathUtils.clamp(this.metroLinearSpeed, -maxSpeedMs * 0.4, maxSpeedMs);
      if (Math.abs(this.metroLinearSpeed) < 0.05 && Math.abs(inputs.throttle) < 0.05) {
        this.metroLinearSpeed = 0;
      }

      // 3. Move Metro strictly along Elevated Viaduct (+X forward)
      this.state.position.x += this.metroLinearSpeed * dt;

      // Loop around at viaduct termini
      if (this.state.position.x > 900) {
        this.state.position.x = -450;
      } else if (this.state.position.x < -450) {
        this.state.position.x = 900;
      }

      // 4. Elevated Viaduct Deck Height (14.9m fixed grade)
      this.state.position.y = 14.9;
      this.state.pitch = 0;
      this.state.roll = 0;
      this.state.heading = -Math.PI / 2; // Locked facing +X along the elevated viaduct
      this.state.steerAngle = 0;
      this.state.altitudeMeters = 15;
      this.state.isAirborne = false;

      this.state.speedKmh = Math.round(Math.abs(this.metroLinearSpeed) * 3.6);
      this.state.rpm = Math.min(1.0, 0.15 + (Math.abs(this.metroLinearSpeed) / maxSpeedMs) * 0.85);

      // Taillights
      this.taillights.forEach((tl) => {
        const mat = tl.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.emissiveIntensity = this.state.isBraking ? 1.6 : (this.state.headlightsOn ? 0.7 : 0.25);
        }
      });

      // Wheel animations
      const wheelRotDelta = (this.metroLinearSpeed / (0.48 * 2 * Math.PI)) * dt * Math.PI * 2;
      if (this.frontLeftWheel && this.frontLeftWheel.children[0]) this.frontLeftWheel.children[0].rotation.x += wheelRotDelta;
      if (this.frontRightWheel && this.frontRightWheel.children[0]) this.frontRightWheel.children[0].rotation.x += wheelRotDelta;
      if (this.rearLeftWheel && this.rearLeftWheel.children[0]) this.rearLeftWheel.children[0].rotation.x += wheelRotDelta;
      if (this.rearRightWheel && this.rearRightWheel.children[0]) this.rearRightWheel.children[0].rotation.x += wheelRotDelta;

      audioEngine.updateEngineSound(this.state.rpm, true, false);
      this.updateTransform();
      return;
    }

    // =========================================================================
    // GROUND 4-WHEEL VEHICLE SIMULATION (SUV, SEDAN, CNG, TRUCK)
    // =========================================================================
    // 1. Steering calculations
    const maxSteer = 0.58; // ~33 degrees
    const steerSpeed = 4.5;
    const targetSteer = -inputs.steer * maxSteer;
    this.state.steerAngle = THREE.MathUtils.lerp(this.state.steerAngle, targetSteer, steerSpeed * dt);

    // 2. Acceleration / Braking
    const forwardVec = new THREE.Vector3(-Math.sin(this.state.heading), 0, -Math.cos(this.state.heading));
    const currentSpeed = this.state.velocity.dot(forwardVec); // speed in m/s (positive = forward)

    let accelForce = 0;
    if (inputs.throttle > 0) {
      this.state.gear = 'D';
      accelForce = inputs.throttle * def.acceleration;
    } else if (inputs.throttle < 0) {
      if (currentSpeed > 0.5) {
        // Braking forward motion
        accelForce = -def.braking * 1.4;
        this.state.isBraking = true;
      } else {
        // Reversing
        this.state.gear = 'R';
        accelForce = inputs.throttle * (def.acceleration * 0.5);
      }
    } else if (inputs.brake || inputs.handbrake) {
      accelForce = -Math.sign(currentSpeed) * (inputs.handbrake ? def.braking * 1.8 : def.braking);
      this.state.isBraking = true;
    } else {
      this.state.isBraking = false;
      // Rolling resistance
      accelForce = -Math.sign(currentSpeed) * 4.5;
    }

    // Apply acceleration along heading
    const maxSpeedMs = (def.topSpeedKmh * 1000) / 3600;
    let newSpeed = currentSpeed + accelForce * dt;

    if (newSpeed > maxSpeedMs) newSpeed = maxSpeedMs;
    if (newSpeed < -maxSpeedMs * 0.4) newSpeed = -maxSpeedMs * 0.4;
    if (Math.abs(newSpeed) < 0.15 && Math.abs(inputs.throttle) < 0.05) newSpeed = 0;

    // Turn vehicle yaw based on steering and velocity
    const turnFactor = (newSpeed / maxSpeedMs) * def.handling;
    this.state.heading += this.state.steerAngle * turnFactor * dt * 3.2;

    // Recalculate forward vector with new heading
    const updatedForward = new THREE.Vector3(-Math.sin(this.state.heading), 0, -Math.cos(this.state.heading));
    this.state.velocity.copy(updatedForward).multiplyScalar(newSpeed);

    // Drifting lateral slip reduction
    this.state.isDrifting = inputs.handbrake && Math.abs(newSpeed) > 5;
    if (this.state.isDrifting) {
      audioEngine.playSkid();
    }

    // Update position
    this.state.position.x += this.state.velocity.x * dt;
    this.state.position.z += this.state.velocity.z * dt;

    // Ground elevation & slope pitch/roll calculation
    const groundY = getElevationAt(this.state.position.x, this.state.position.z);
    const frontGroundY = getElevationAt(
      this.state.position.x + updatedForward.x * 2.0,
      this.state.position.z + updatedForward.z * 2.0
    );
    const rightVec = new THREE.Vector3(Math.cos(this.state.heading), 0, -Math.sin(this.state.heading));
    const rightGroundY = getElevationAt(
      this.state.position.x + rightVec.x * 1.2,
      this.state.position.z + rightVec.z * 1.2
    );

    const targetPitch = Math.atan2(frontGroundY - groundY, 2.0);
    const targetRoll = Math.atan2(rightGroundY - groundY, 1.2);

    this.state.pitch = THREE.MathUtils.lerp(this.state.pitch, targetPitch, 8 * dt);
    this.state.roll = THREE.MathUtils.lerp(this.state.roll, targetRoll, 8 * dt);
    this.state.position.y = THREE.MathUtils.lerp(this.state.position.y, groundY + 0.1, 14 * dt);
    this.state.altitudeMeters = 0;
    this.state.isAirborne = false;

    this.state.speedKmh = Math.round(Math.abs(newSpeed) * 3.6);
    this.state.rpm = Math.min(1.0, 0.15 + (Math.abs(newSpeed) / maxSpeedMs) * 0.85);

    // Engine Audio Feedback
    audioEngine.updateEngineSound(this.state.rpm, true, false);

    // Taillight glow on braking
    const isBrakingActive = inputs.brake || (inputs.throttle < 0 && currentSpeed > 0.5);
    this.taillights.forEach((tl) => {
      const mat = tl.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = isBrakingActive ? 1.5 : (this.state.headlightsOn ? 0.6 : 0.2);
      }
    });

    // Update wheel animations
    const wheelRotDelta = (newSpeed / (0.42 * 2 * Math.PI)) * dt * Math.PI * 2;
    if (this.frontLeftWheel) {
      this.frontLeftWheel.rotation.y = this.state.steerAngle;
      if (this.frontLeftWheel.children && this.frontLeftWheel.children[0]?.rotation) {
        this.frontLeftWheel.children[0].rotation.x += wheelRotDelta;
      }
    }
    if (this.frontRightWheel) {
      this.frontRightWheel.rotation.y = this.state.steerAngle;
      if (this.frontRightWheel.children && this.frontRightWheel.children[0]?.rotation) {
        this.frontRightWheel.children[0].rotation.x += wheelRotDelta;
      }
    }
    if (this.rearLeftWheel && this.rearLeftWheel.children && this.rearLeftWheel.children[0]?.rotation) {
      this.rearLeftWheel.children[0].rotation.x += wheelRotDelta;
    }
    if (this.rearRightWheel && this.rearRightWheel.children && this.rearRightWheel.children[0]?.rotation) {
      this.rearRightWheel.children[0].rotation.x += wheelRotDelta;
    }

    this.updateTransform();
  }

  private updateTransform() {
    this.group.position.copy(this.state.position);
    this.group.rotation.set(0, 0, 0);
    this.group.rotation.y = this.state.heading;
    this.group.rotateX(-this.state.pitch);
    this.group.rotateZ(this.state.roll);
  }
}
