import * as THREE from 'three';
import { audioEngine } from './audioEngine';
import { calcMasterPlanElevation } from './miniCountryTerrain';
import { buildSkyHawkHelicopterMesh } from './skyhawkHelicopterModel';
import { VEHICLE_CATALOG } from './vehicleController';

// The Site-Visit Air Transit tour flies the player's own SkyHawk helicopter —
// the same vehicle from the vehicle switcher — at a fixed survey altitude
// and at the aircraft's rated top speed, never a different "taxi" model.
const SKYHAWK_DEF = VEHICLE_CATALOG.find((v) => v.id === 'helicopter')!;
const TOUR_CRUISE_ALTITUDE_M = 150; // Fixed AGL cruise altitude for the site-visit tour
const TOUR_TOP_SPEED_KMH = SKYHAWK_DEF.topSpeedKmh; // Fly at the SkyHawk's rated max speed

// --- Smoothed trapezoidal velocity profile -------------------------------
// Fraction of the flight (at each end) spent accelerating / decelerating.
const RAMP_FRACTION = 0.2;

// Cubic smoothstep, 0 -> 1, with ZERO slope at both ends.
function smoothstep01(u: number): number {
  const c = THREE.MathUtils.clamp(u, 0, 1);
  return c * c * (3 - 2 * c);
}

// Antiderivative of smoothstep01 over [0, u] (u in [0,1]).
function smoothstepIntegral(u: number): number {
  const c = THREE.MathUtils.clamp(u, 0, 1);
  return c * c * c - 0.5 * c * c * c * c;
}

// Normalized velocity fraction (0..1 of cruise speed) at a given progress.
// This is smoothstep-shaped during accel/decel, so it has ZERO slope right
// where it meets the constant-speed cruise segment (which also has zero
// slope) — no stall-then-snap discontinuity, and it can never exceed 1.
function flightVelocityFraction(progress: number, r: number): number {
  if (progress < r) {
    return smoothstep01(progress / r);
  } else if (progress > 1 - r) {
    return smoothstep01((1 - progress) / r);
  }
  return 1;
}

// Normalized position fraction (0..1) obtained by integrating the velocity
// profile above, so the on-screen motion's actual derivative matches the
// speed we report (and never dips to zero right before "cruise" speed).
function flightPositionFraction(progress: number, r: number): number {
  const k = 1 / (1 - r); // normalizes total integral to exactly 1
  if (progress < r) {
    return k * r * smoothstepIntegral(progress / r);
  } else if (progress > 1 - r) {
    return 1 - k * r * smoothstepIntegral((1 - progress) / r);
  }
  return k * r * smoothstepIntegral(1) + k * (progress - r);
}

export type HelicopterFlightPhase =
  | 'idle'
  | 'spoolup'
  | 'takeoff'
  | 'climb'
  | 'cruise'
  | 'approach'
  | 'descent'
  | 'touchdown';

export interface HelicopterFlightInfo {
  isActive: boolean;
  phase: HelicopterFlightPhase;
  progress: number; // 0 to 1
  destinationName: string;
  speedKmh: number;
  altitudeAgl: number;
  distRemainingM: number;
  currentPos: THREE.Vector3;
}

export interface HelicopterTransitInstance {
  group: THREE.Group;
  helicopterMesh: THREE.Group;
  startTransit: (
    startPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    destinationName: string,
    onComplete: (landingPos: THREE.Vector3) => void
  ) => void;
  skipTransit: () => void;
  update: (delta: number, elapsed: number) => {
    isFlightActive: boolean;
    cameraPosition: THREE.Vector3;
    cameraLookAt: THREE.Vector3;
    info: HelicopterFlightInfo;
  } | null;
  getCurrentInfo: () => HelicopterFlightInfo;
}


/**
 * Builds the complete Helicopter Air Transit & Flyover System
 */
export function buildHelicopterTransitSystem(): HelicopterTransitInstance {
  const group = new THREE.Group();
  group.name = 'helicopter_air_transit_system';

  const { root: heliMesh, mainRotor, tailRotor, strobeLight } = buildSkyHawkHelicopterMesh(SKYHAWK_DEF.bodyColor);
  group.add(heliMesh);
  heliMesh.visible = false;

  // Local orientation note: the SkyHawk model's nose points toward local -Z
  // (see skyhawkHelicopterModel.ts), so every heading/yaw value computed
  // below is offset by Math.PI to keep the nose pointed at the destination.

  let isFlightActive = false;
  let flightPhase: HelicopterFlightPhase = 'idle';
  let flightTime = 0;
  let totalFlightDuration = 18; // Seconds
  let startPos = new THREE.Vector3();
  let targetPos = new THREE.Vector3();
  let destinationName = '';
  let onFlightComplete: ((pos: THREE.Vector3) => void) | null = null;

  // Real-time Flight Metrics
  let currentPos = new THREE.Vector3();
  let speedKmh = 0;
  let altitudeAgl = 0;
  let distRemainingM = 0;
  let rotorRpmNormalized = 0;

  // Transit Camera Interpolations
  const cameraPos = new THREE.Vector3();
  const cameraLookAt = new THREE.Vector3();

  const startTransit = (
    start: THREE.Vector3,
    target: THREE.Vector3,
    destName: string,
    onComplete: (landingPos: THREE.Vector3) => void
  ) => {
    startPos.copy(start);
    targetPos.copy(target);
    destinationName = destName;
    onFlightComplete = onComplete;

    // Calculate flight duration from distance so the cruise speed lands
    // exactly at (never above) the SkyHawk's rated top speed. With the
    // smoothed ramp taking up RAMP_FRACTION at each end, the average speed
    // over the whole flight is topSpeed * (1 - RAMP_FRACTION), so:
    const dist = startPos.distanceTo(targetPos);
    const topSpeedMs = (TOUR_TOP_SPEED_KMH * 1000) / 3600;
    const requiredDuration = dist / (topSpeedMs * (1 - RAMP_FRACTION));
    // Keep a floor so very short hops don't feel instantaneous; no ceiling,
    // since capping duration for long trips is what forced speed above 240.
    totalFlightDuration = Math.max(10, requiredDuration);

    flightTime = 0;
    isFlightActive = true;
    flightPhase = 'spoolup';
    heliMesh.visible = true;

    // Position helicopter exactly at start position ground
    const startGroundY = calcMasterPlanElevation(startPos.x, startPos.z);
    startPos.y = startGroundY;
    currentPos.copy(startPos);
    heliMesh.position.copy(currentPos);

    // Initial heading towards target (+ PI to correct for the SkyHawk's
    // nose pointing toward local -Z instead of +Z)
    const initHeading = Math.atan2(targetPos.x - startPos.x, targetPos.z - startPos.z) + Math.PI;
    heliMesh.rotation.set(0, initHeading, 0);

    audioEngine.playBuildThud();
  };

  const skipTransit = () => {
    if (!isFlightActive) return;
    isFlightActive = false;
    flightPhase = 'complete' as HelicopterFlightPhase;
    heliMesh.visible = false;
    audioEngine.stopEngineSound();

    const finalLandingY = calcMasterPlanElevation(targetPos.x, targetPos.z);
    const finalPos = new THREE.Vector3(targetPos.x, finalLandingY, targetPos.z);
    if (onFlightComplete) {
      onFlightComplete(finalPos);
    }
  };

  const getCurrentInfo = (): HelicopterFlightInfo => {
    return {
      isActive: isFlightActive,
      phase: flightPhase,
      progress: Math.min(1, flightTime / totalFlightDuration),
      destinationName,
      speedKmh: Math.round(speedKmh),
      altitudeAgl: Math.round(altitudeAgl),
      distRemainingM: Math.round(distRemainingM),
      currentPos,
    };
  };

  const update = (delta: number, elapsed: number) => {
    if (!isFlightActive) {
      return null;
    }

    flightTime += delta;
    const progress = Math.min(1, flightTime / totalFlightDuration);

    // 1. Spin Rotors & Audio Simulation
    if (flightPhase === 'spoolup') {
      rotorRpmNormalized = Math.min(1, flightTime / 1.5);
      if (flightTime >= 1.5) {
        flightPhase = 'takeoff';
      }
    } else if (flightPhase === 'touchdown') {
      rotorRpmNormalized = Math.max(0, 1 - (flightTime - (totalFlightDuration - 1.2)) / 1.2);
    } else {
      rotorRpmNormalized = 1.0;
    }

    const mainSpinRate = 42 * rotorRpmNormalized;
    mainRotor.rotation.y += mainSpinRate * delta;
    tailRotor.rotation.x += mainSpinRate * 1.8 * delta;

    // Helicopter Audio Update
    audioEngine.updateEngineSound(rotorRpmNormalized, true, true);

    // Strobe Beacon Flash (tail anti-collision strobe)
    (strobeLight.material as THREE.MeshBasicMaterial).color.setHex(
      Math.sin(elapsed * 12) > 0.6 ? 0xffffff : 0x334155
    );

    // 2. Flight Trajectory Curve (3D Bezier / Parabolic Cruise Arc)
    // Fixed 150m AGL site-survey cruise altitude for every tour, regardless of distance.
    const cruiseAltitudeOffset = TOUR_CRUISE_ALTITUDE_M;

    // Linear X, Z interpolation
    // Position fraction from the smoothed velocity profile (see helpers
    // above) — its derivative matches cruise speed at both seams, so there
    // is no stall-then-snap near the ends of takeoff/landing.
    const easedT = flightPositionFraction(progress, RAMP_FRACTION);

    const curX = THREE.MathUtils.lerp(startPos.x, targetPos.x, easedT);
    const curZ = THREE.MathUtils.lerp(startPos.z, targetPos.z, easedT);

    // Ground elevation below current position
    const groundY = calcMasterPlanElevation(curX, curZ);

    // Parabolic altitude arc
    // Altitude rises quickly from start, cruises high, then descends smoothly
    let altitudeArc = 0;
    if (progress < 0.15) {
      // Takeoff phase (0 -> Cruise)
      const t = progress / 0.15;
      altitudeArc = (t * t * (3 - 2 * t)) * cruiseAltitudeOffset;
      flightPhase = 'takeoff';
    } else if (progress > 0.82) {
      // Descent phase (Cruise -> Landing)
      const t = (1 - progress) / 0.18;
      altitudeArc = (t * t * (3 - 2 * t)) * cruiseAltitudeOffset;
      flightPhase = progress > 0.96 ? 'touchdown' : 'descent';
    } else {
      // Cruise phase — hold exactly at the fixed 150m AGL survey altitude
      altitudeArc = cruiseAltitudeOffset;
      flightPhase = 'cruise';
    }

    const curY = groundY + Math.max(0.4, altitudeArc);
    currentPos.set(curX, curY, curZ);
    heliMesh.position.copy(currentPos);

    // Calculate Speed & Metrics
    const remainingVec = new THREE.Vector2(targetPos.x - curX, targetPos.z - curZ);
    distRemainingM = remainingVec.length();
    altitudeAgl = curY - groundY;

    // Flight Speed calculation (km/h) — driven by the exact same profile
    // used for the actual on-screen motion above, so the number reported
    // always matches what's visually happening and never exceeds the
    // SkyHawk's rated top speed.
    speedKmh = flightVelocityFraction(progress, RAMP_FRACTION) * TOUR_TOP_SPEED_KMH;

    // 3. Helicopter Aerodynamic Banking, Pitch & Yaw
    // travelHeading = actual direction of travel (used for the camera).
    // meshYaw = travelHeading + PI, since the SkyHawk model's nose points
    // toward local -Z instead of +Z — this keeps the nose pointed forward.
    const travelHeading = Math.atan2(targetPos.x - startPos.x, targetPos.z - startPos.z);
    const meshYaw = travelHeading + Math.PI;

    // Forward tilt (pitch down during forward acceleration)
    let pitch = 0;
    if (flightPhase === 'cruise' || flightPhase === 'takeoff') {
      pitch = 0.14 + Math.sin(elapsed * 3) * 0.02;
    } else if (flightPhase === 'descent') {
      pitch = -0.05; // Flare back during descent deceleration
    }

    // Gentle aerodynamic sway & banking
    const roll = Math.sin(elapsed * 2.2) * 0.04;
    const yaw = meshYaw + Math.sin(elapsed * 1.5) * 0.02;

    heliMesh.rotation.set(pitch, yaw, roll);

    // 4. Cinematic Dynamic Flight Camera (Follow / Helicopter Chase + Orbit)
    // Camera sits behind and above the helicopter looking slightly ahead
    const camDistance = 24 + (1 - Math.sin(progress * Math.PI)) * 8;
    const camHeight = 8 + (1 - Math.sin(progress * Math.PI)) * 5;

    // Camera offset behind the direction of travel
    const camOffsetX = -Math.sin(travelHeading) * camDistance + Math.cos(elapsed * 0.3) * 4;
    const camOffsetZ = -Math.cos(travelHeading) * camDistance + Math.sin(elapsed * 0.3) * 4;

    cameraPos.set(curX + camOffsetX, curY + camHeight, curZ + camOffsetZ);
    // Camera looks at helicopter + slight forward lookahead
    cameraLookAt.set(
      curX + Math.sin(travelHeading) * 15,
      curY + 1.5,
      curZ + Math.cos(travelHeading) * 15
    );

    // 5. Completion Check
    if (progress >= 1.0) {
      isFlightActive = false;
      flightPhase = 'idle';
      heliMesh.visible = false;
      audioEngine.stopEngineSound();

      const finalLandingY = calcMasterPlanElevation(targetPos.x, targetPos.z);
      const finalPos = new THREE.Vector3(targetPos.x, finalLandingY, targetPos.z);

      if (onFlightComplete) {
        onFlightComplete(finalPos);
      }
    }

    return {
      isFlightActive,
      cameraPosition: cameraPos,
      cameraLookAt,
      info: getCurrentInfo(),
    };
  };

  return {
    group,
    helicopterMesh: heliMesh,
    startTransit,
    skipTransit,
    update,
    getCurrentInfo,
  };
}
