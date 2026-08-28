import * as THREE from 'three';
import { audioEngine } from './audioEngine';
import { resolveBuildingObstacleCollision } from './buildingCollisions';

export interface CharacterState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  heading: number; // yaw angle
  isWalking: boolean;
  isRunning: boolean;
  isGrounded: boolean;
  verticalVelocity: number;
}

export class PlayableCharacter {
  public group: THREE.Group;
  public state: CharacterState;

  // Visual sub-meshes for walking limb swing animations
  private leftLeg: THREE.Object3D | null = null;
  private rightLeg: THREE.Object3D | null = null;
  private leftArm: THREE.Object3D | null = null;
  private rightArm: THREE.Object3D | null = null;
  private animTimer = 0;
  private footstepTimer = 0;

  constructor(initialPos = new THREE.Vector3(22, 2.5, 52), initialHeading = 0) {
    this.group = new THREE.Group();
    this.group.name = 'playable_engineer_character';

    this.state = {
      position: initialPos.clone(),
      velocity: new THREE.Vector3(),
      heading: initialHeading,
      isWalking: false,
      isRunning: false,
      isGrounded: true,
      verticalVelocity: 0,
    };

    this.buildCharacterMesh();
    this.updateTransform();
  }

  private buildCharacterMesh() {
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });
    const vestMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 }); // High-vis neon orange
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, emissive: 0x94a3b8, emissiveIntensity: 0.4 }); // Reflective silver tape
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }); // Navy work trousers
    const bootsMat = new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.9 }); // Work boots
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3, metalness: 0.2 }); // Yellow safety hardhat

    // 1. Torso & Vest
    const torsoGrp = new THREE.Group();
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.65, 0.28), vestMat);
    torso.position.y = 1.05;
    torso.castShadow = true;
    torsoGrp.add(torso);

    // Reflective stripes
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.08, 0.29), stripeMat);
    stripe.position.y = 1.05;
    torsoGrp.add(stripe);
    this.group.add(torsoGrp);

    // 2. Head & Safety Hardhat
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), skinMat);
    head.position.y = 1.52;
    head.castShadow = true;
    this.group.add(head);

    const helmet = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.16, 12), helmetMat);
    helmet.position.y = 1.62;
    helmet.castShadow = true;
    this.group.add(helmet);

    const helmetBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 12), helmetMat);
    helmetBrim.position.y = 1.56;
    this.group.add(helmetBrim);

    // 3. Arms
    const armGeo = new THREE.BoxGeometry(0.14, 0.55, 0.14);

    this.leftArm = new THREE.Group();
    const leftArmMesh = new THREE.Mesh(armGeo, vestMat);
    leftArmMesh.position.y = -0.22;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    this.leftArm.position.set(-0.35, 1.3, 0);
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Group();
    const rightArmMesh = new THREE.Mesh(armGeo, vestMat);
    rightArmMesh.position.y = -0.22;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    this.rightArm.position.set(0.35, 1.3, 0);
    this.group.add(this.rightArm);

    // 4. Legs & Boots
    const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
    const bootGeo = new THREE.BoxGeometry(0.2, 0.15, 0.28);

    this.leftLeg = new THREE.Group();
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.position.y = -0.3;
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);

    const leftBoot = new THREE.Mesh(bootGeo, bootsMat);
    leftBoot.position.set(0, -0.62, 0.04);
    leftBoot.castShadow = true;
    this.leftLeg.add(leftBoot);
    this.leftLeg.position.set(-0.16, 0.72, 0);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.position.y = -0.3;
    rightLegMesh.castShadow = true;
    this.rightLeg.add(rightLegMesh);

    const rightBoot = new THREE.Mesh(bootGeo, bootsMat);
    rightBoot.position.set(0, -0.62, 0.04);
    rightBoot.castShadow = true;
    this.rightLeg.add(rightBoot);
    this.rightLeg.position.set(0.16, 0.72, 0);
    this.group.add(this.rightLeg);
  }

  public updatePhysics(
    delta: number,
    inputs: { moveX: number; moveZ: number; sprint: boolean; jump: boolean; cameraYaw: number },
    getElevationAt: (x: number, z: number) => number
  ) {
    const dt = Math.min(delta, 0.1);

    const isMoving = Math.abs(inputs.moveX) > 0.1 || Math.abs(inputs.moveZ) > 0.1;
    this.state.isWalking = isMoving;
    this.state.isRunning = isMoving && inputs.sprint;

    // Movement speed
    const baseSpeed = inputs.sprint ? 9.5 : 4.8; // m/s

    if (isMoving) {
      // inputs.moveZ: -1 for forward (W / UpArrow), +1 for backward (S / DownArrow)
      // inputs.moveX: -1 for left (A / LeftArrow), +1 for right (D / RightArrow)
      
      // Calculate movement angle in world space relative to camera view yaw
      const inputHeading = Math.atan2(inputs.moveX, -inputs.moveZ);
      const targetHeading = inputs.cameraYaw + inputHeading;

      // Smoothly rotate character mesh towards movement heading
      this.state.heading = THREE.MathUtils.lerp(
        this.state.heading,
        targetHeading,
        18 * dt
      );

      // Apply forward velocity in the computed direction
      const moveX = Math.sin(targetHeading) * baseSpeed;
      const moveZ = -Math.cos(targetHeading) * baseSpeed;

      this.state.position.x += moveX * dt;
      this.state.position.z += moveZ * dt;

      // Solid Building Obstacle Collision for pedestrian
      resolveBuildingObstacleCollision(this.state.position, 0.45);

      // Limb swing animation
      this.animTimer += dt * (inputs.sprint ? 14 : 8);
      const swing = Math.sin(this.animTimer) * 0.65;

      if (this.leftLeg) this.leftLeg.rotation.x = swing;
      if (this.rightLeg) this.rightLeg.rotation.x = -swing;
      if (this.leftArm) this.leftArm.rotation.x = -swing * 0.8;
      if (this.rightArm) this.rightArm.rotation.x = swing * 0.8;

      // Footstep audio
      this.footstepTimer += dt;
      const stepInterval = inputs.sprint ? 0.28 : 0.45;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        audioEngine.playFootstep();
      }
    } else {
      // Idle pose
      if (this.leftLeg) this.leftLeg.rotation.x = 0;
      if (this.rightLeg) this.rightLeg.rotation.x = 0;
      if (this.leftArm) this.leftArm.rotation.x = 0;
      if (this.rightArm) this.rightArm.rotation.x = 0;
    }

    // Jump & Gravity physics
    const groundY = getElevationAt(this.state.position.x, this.state.position.z);
    const gravity = -24;

    if (this.state.isGrounded) {
      if (inputs.jump) {
        this.state.verticalVelocity = 8.5;
        this.state.isGrounded = false;
        audioEngine.playClick(400, 0.05);
      } else {
        this.state.position.y = groundY;
        this.state.verticalVelocity = 0;
      }
    } else {
      this.state.verticalVelocity += gravity * dt;
      this.state.position.y += this.state.verticalVelocity * dt;

      if (this.state.position.y <= groundY) {
        this.state.position.y = groundY;
        this.state.isGrounded = true;
        this.state.verticalVelocity = 0;
        audioEngine.playFootstep();
      }
    }

    this.updateTransform();
  }

  private updateTransform() {
    this.group.position.copy(this.state.position);
    this.group.rotation.y = this.state.heading + Math.PI;
  }
}
