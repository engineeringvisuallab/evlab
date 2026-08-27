import * as THREE from 'three';

/**
 * Shared 3D model builder for the "SkyHawk Aerial Inspection Helicopter".
 *
 * This is the SAME helicopter the player can select and drive from the
 * vehicle switcher (see VEHICLE_CATALOG in vehicleController.ts). It is
 * factored out into its own module so that:
 *   1. PlayableVehicle (driving mode) can build it, and
 *   2. The Site-Visit Air Transit system (helicopterTransit.ts) can build
 *      an identical instance for the cinematic "fly me to this site" tour,
 *
 * ...without duplicating the mesh geometry in two places. There is only
 * ever one helicopter design in the game: the SkyHawk.
 *
 * Local orientation convention: the nose points toward -Z, the tail/rotor
 * boom points toward +Z (matches how the drivable vehicle is built).
 */

export interface SkyHawkHelicopterModel {
  /** Root group containing the entire helicopter (add this to your scene/parent). */
  root: THREE.Group;
  /** Main lift rotor group — spin this (rotation.y) each frame. */
  mainRotor: THREE.Group;
  /** Tail anti-torque rotor group — spin this (rotation.x) each frame. */
  tailRotor: THREE.Group;
  /** White tail strobe mesh — flash this for an anti-collision beacon effect. */
  strobeLight: THREE.Mesh;
  /** Forward landing/search spotlight. */
  searchLight: THREE.SpotLight;
}

export function buildSkyHawkHelicopterMesh(bodyColorHex: number = 0x0284c7): SkyHawkHelicopterModel {
  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColorHex,
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

  const root = new THREE.Group();
  root.name = 'skyhawk_helicopter';

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

  const tailStrobeMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const tailStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), tailStrobeMat);
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

  root.add(heliBody);

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
  root.add(mainRotor);

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
  root.add(tailRotor);

  // 7. HIGH-POWER FORWARD SEARCHLIGHT / LANDING LIGHT
  const searchLight = new THREE.SpotLight(0xfef08a, 4.0, 180, Math.PI / 3.2, 0.35, 1.2);
  searchLight.position.set(0, 1.0, -2.4);
  searchLight.target.position.set(0, -20, -60);
  root.add(searchLight);
  root.add(searchLight.target);

  const searchBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.0 })
  );
  searchBulb.position.set(0, 0.9, -2.45);
  root.add(searchBulb);

  return { root, mainRotor, tailRotor, strobeLight: tailStrobe, searchLight };
}
