import * as THREE from 'three';
import { audioEngine } from './audioEngine';

export type VehicleTypeId = 'suv' | 'sports' | 'cng' | 'truck';

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
  gear: 'P' | 'D' | 'R';
  steerAngle: number; // radians
  heading: number; // yaw angle radians
  pitch: number;
  roll: number;
  headlightsOn: boolean;
  isBraking: boolean;
  isReversing: boolean;
  isDrifting: boolean;
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
  private headlights: THREE.SpotLight[] = [];
  private taillights: THREE.Mesh[] = [];
  private chassisMesh: THREE.Object3D | null = null;

  constructor(type: VehicleTypeId, initialPos = new THREE.Vector3(20, 2.5, 50), initialHeading = 0) {
    this.type = type;
    this.def = VEHICLE_CATALOG.find((v) => v.id === type) || VEHICLE_CATALOG[0];
    this.group = new THREE.Group();
    this.group.name = `playable_vehicle_${type}`;

    this.state = {
      position: initialPos.clone(),
      velocity: new THREE.Vector3(),
      speedKmh: 0,
      rpm: 0.15,
      gear: 'D',
      steerAngle: 0,
      heading: initialHeading,
      pitch: 0,
      roll: 0,
      headlightsOn: false,
      isBraking: false,
      isReversing: false,
      isDrifting: false,
    };

    this.buildVehicleMesh();
    this.updateTransform();
  }

  public setVehicleType(newType: VehicleTypeId) {
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

    this.buildVehicleMesh();
    this.updateTransform();
  }

  private buildVehicleMesh() {
    const bodyColor = this.def.bodyColor;
    // Physical (clearcoat) paint — picks up real sky/environment reflections
    // via scene.environment instead of looking like flat matte plastic.
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: bodyColor,
      roughness: 0.28,
      metalness: 0.6,
      clearcoat: 0.65,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.1,
    });
    const blackTrimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8, roughness: 0.05, metalness: 0.1, opacity: 0.82, transparent: true,
      transmission: 0.35, ior: 1.5, envMapIntensity: 1.2,
    });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.98, envMapIntensity: 1.3 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.18, metalness: 0.85, envMapIntensity: 1.2 });

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

    if (this.type === 'suv') {
      // 1. 4x4 Safari SUV
      const body = new THREE.Group();

      // Lower chassis & bumpers
      const lower = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.9, 4.4), bodyMat);
      lower.position.y = 0.85;
      lower.castShadow = true;
      body.add(lower);

      // Cabin greenhouse
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.95, 2.6), bodyMat);
      cabin.position.set(0, 1.7, -0.2);
      cabin.castShadow = true;
      body.add(cabin);

      // Windows
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.75, 2.5), glassMat);
      windshield.position.set(0, 1.72, -0.2);
      body.add(windshield);

      // Roof rack
      const roofRack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 2.2), blackTrimMat);
      roofRack.position.set(0, 2.25, -0.2);
      body.add(roofRack);

      // Spare tire on back
      const spare = createWheel(0.38, 0.25);
      spare.rotation.y = Math.PI / 2;
      spare.position.set(0, 1.2, 2.25);
      body.add(spare);

      // Bull-bar bumper
      const bullBar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.3), blackTrimMat);
      bullBar.position.set(0, 0.7, -2.25);
      body.add(bullBar);

      this.chassisMesh = body;
      this.group.add(body);

      // Wheels
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

      // Rear Spoiler
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

      // Low-profile Wheels
      this.frontLeftWheel = createWheel(0.36, 0.28);
      this.frontLeftWheel.position.set(-1.02, 0.36, -1.4);
      this.group.add(this.frontLeftWheel);

      this.frontRightWheel = createWheel(0.36, 0.28);
      this.frontRightWheel.position.set(1.02, 0.36, -1.4);
      this.group.add(this.frontRightWheel);

      this.rearLeftWheel = createWheel(0.36, 0.28);
      this.rearLeftWheel.position.set(-1.02, 0.36, 1.4);
      this.group.add(this.rearLeftWheel);

      this.rearRightWheel = createWheel(0.36, 0.28);
      this.rearRightWheel.position.set(1.02, 0.36, 1.4);
      this.group.add(this.rearRightWheel);

    } else if (this.type === 'cng') {
      // 3. Green CNG Auto-Rickshaw (Bangla 3-Wheeler)
      const body = new THREE.Group();

      const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 2.6), bodyMat);
      base.position.y = 0.55;
      base.castShadow = true;
      body.add(base);

      // Yellow canvas roof
      const roofMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.9, 2.2), roofMat);
      roof.position.set(0, 1.25, 0.1);
      roof.castShadow = true;
      body.add(roof);

      // Windshield & cage bars
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.1), glassMat);
      win.position.set(0, 1.15, -0.95);
      body.add(win);

      this.chassisMesh = body;
      this.group.add(body);

      // Single Front Wheel
      this.frontLeftWheel = createWheel(0.32, 0.2);
      this.frontLeftWheel.position.set(0, 0.32, -1.1);
      this.group.add(this.frontLeftWheel);

      // Rear Wheels
      this.rearLeftWheel = createWheel(0.32, 0.2);
      this.rearLeftWheel.position.set(-0.72, 0.32, 0.9);
      this.group.add(this.rearLeftWheel);

      this.rearRightWheel = createWheel(0.32, 0.2);
      this.rearRightWheel.position.set(0.72, 0.32, 0.9);
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

      // Amber beacon on roof
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

    // Headlight mesh bulbs
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

  public setHeadlights(on: boolean) {
    this.state.headlightsOn = on;
    this.headlights.forEach((hl) => {
      hl.visible = on;
    });
  }

  public honk() {
    audioEngine.playHorn();
  }

  public resetPosition(elevationAtPos: number) {
    this.state.velocity.set(0, 0, 0);
    this.state.speedKmh = 0;
    this.state.pitch = 0;
    this.state.roll = 0;
    this.state.position.y = elevationAtPos + 0.4;
    audioEngine.playDoorThud();
  }

  public updatePhysics(
    delta: number,
    inputs: { throttle: number; steer: number; brake: boolean; handbrake: boolean },
    getElevationAt: (x: number, z: number) => number
  ) {
    const dt = Math.min(delta, 0.1);
    const def = this.def;

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

    this.state.speedKmh = Math.round(Math.abs(newSpeed) * 3.6);
    this.state.rpm = Math.min(1.0, 0.15 + (Math.abs(newSpeed) / maxSpeedMs) * 0.85);

    // Engine Audio Feedback
    audioEngine.updateEngineSound(this.state.rpm, true);

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
      this.frontLeftWheel.children[0].rotation.x += wheelRotDelta;
    }
    if (this.frontRightWheel) {
      this.frontRightWheel.rotation.y = this.state.steerAngle;
      this.frontRightWheel.children[0].rotation.x += wheelRotDelta;
    }
    if (this.rearLeftWheel) {
      this.rearLeftWheel.children[0].rotation.x += wheelRotDelta;
    }
    if (this.rearRightWheel) {
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
