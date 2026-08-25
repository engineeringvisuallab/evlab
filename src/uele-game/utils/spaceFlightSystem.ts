import * as THREE from 'three';

export interface SpaceEnvironment {
  group: THREE.Group;
  updateAnimation: (time: number, delta: number, isNight: boolean, timeOfDay: string) => void;
  setSpaceVisibility: (isNight: boolean, timeOfDay: string) => void;
}

export function buildSpaceFlightSystem(): SpaceEnvironment {
  const group = new THREE.Group();
  group.name = 'space_night_flight_system';

  // 1. HIGH-ALTITUDE CELESTIAL DOME & STARFIELD (Deep space galaxy cluster & nebula)
  const starCount = 3500;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);

  const starPalettes = [
    new THREE.Color(0xffffff), // Pure white
    new THREE.Color(0x93c5fd), // Blue-white giant
    new THREE.Color(0xfef08a), // Golden dwarf
    new THREE.Color(0xf472b6), // Nebula pink
    new THREE.Color(0x67e8f9), // Cyan star
  ];

  for (let i = 0; i < starCount; i++) {
    // Generate upper hemisphere dome for 10km country expanse
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.95 + 0.05); // Above horizon
    const radius = 9000 + Math.random() * 3000;

    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = radius * Math.cos(phi) + 150;
    starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const c = starPalettes[Math.floor(Math.random() * starPalettes.length)];
    starColors[i * 3] = c.r;
    starColors[i * 3 + 1] = c.g;
    starColors[i * 3 + 2] = c.b;
    starSizes[i] = Math.random() * 3.5 + 1.2;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  // Canvas texture for glowing star billboard
  const starCanvas = document.createElement('canvas');
  starCanvas.width = 64;
  starCanvas.height = 64;
  const sCtx = starCanvas.getContext('2d');
  if (sCtx) {
    const sGrad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 30);
    sGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sGrad.addColorStop(0.3, 'rgba(220, 240, 255, 0.8)');
    sGrad.addColorStop(0.7, 'rgba(160, 200, 255, 0.2)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 64, 64);
  }
  const starTexture = new THREE.CanvasTexture(starCanvas);

  const starMat = new THREE.PointsMaterial({
    size: 4.5,
    vertexColors: true,
    map: starTexture,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const starField = new THREE.Points(starGeo, starMat);
  group.add(starField);

  // 2. DETAILED 3D ORBITAL MOON (With Lunar Craters & Glow Halo)
  const moonGroup = new THREE.Group();
  const moonGeo = new THREE.SphereGeometry(28, 32, 32);
  const moonCanvas = document.createElement('canvas');
  moonCanvas.width = 512;
  moonCanvas.height = 512;
  const mCtx = moonCanvas.getContext('2d');
  if (mCtx) {
    mCtx.fillStyle = '#f8fafc';
    mCtx.fillRect(0, 0, 512, 512);
    // Darker maria patches
    mCtx.fillStyle = '#cbd5e1';
    for (let m = 0; m < 16; m++) {
      mCtx.beginPath();
      mCtx.arc(Math.random() * 512, Math.random() * 512, 30 + Math.random() * 60, 0, Math.PI * 2);
      mCtx.fill();
    }
    // Craters
    mCtx.fillStyle = '#94a3b8';
    for (let c = 0; c < 35; c++) {
      mCtx.beginPath();
      mCtx.arc(Math.random() * 512, Math.random() * 512, 6 + Math.random() * 18, 0, Math.PI * 2);
      mCtx.fill();
    }
  }
  const moonTex = new THREE.CanvasTexture(moonCanvas);
  const moonMat = new THREE.MeshBasicMaterial({ map: moonTex });
  const moonMesh = new THREE.Mesh(moonGeo, moonMat);
  moonGroup.add(moonMesh);

  // Moon Glow Halo Billboard
  const haloGeo = new THREE.PlaneGeometry(95, 95);
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = 128;
  haloCanvas.height = 128;
  const hCtx = haloCanvas.getContext('2d');
  if (hCtx) {
    const hGrad = hCtx.createRadialGradient(64, 64, 18, 64, 64, 62);
    hGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    hGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.2)');
    hGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    hCtx.fillStyle = hGrad;
    hCtx.fillRect(0, 0, 128, 128);
  }
  const haloTex = new THREE.CanvasTexture(haloCanvas);
  const haloMat = new THREE.MeshBasicMaterial({
    map: haloTex,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  moonGroup.add(haloMesh);

  moonGroup.scale.set(6, 6, 6);
  moonGroup.position.set(2800, 3200, -4500);
  group.add(moonGroup);

  // 3. LAUNCHING & ORBITING SPACE ROCKET (Bangabandhu Satellite / Artemis class Rocket)
  const rocketGroup = new THREE.Group();
  rocketGroup.name = 'space_rocket';

  // Rocket Core Fuselage (Cylinder)
  const rocketWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.6 });
  const rocketBlack = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
  const rocketFireMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
  const rocketGlowFire = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.9 });

  const stage1 = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 26, 24), rocketWhite);
  stage1.position.y = 13;
  stage1.castShadow = true;
  rocketGroup.add(stage1);

  // Interstage ring
  const interstage = new THREE.Mesh(new THREE.CylinderGeometry(2.42, 2.42, 2.2, 24), rocketBlack);
  interstage.position.y = 26.5;
  rocketGroup.add(interstage);

  // Stage 2
  const stage2 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 14, 24), rocketWhite);
  stage2.position.y = 34.5;
  rocketGroup.add(stage2);

  // Payload Fairing / Nose Cone (with National Green & Red Stripe)
  const noseCone = new THREE.Mesh(new THREE.ConeGeometry(2.2, 8.5, 24), rocketWhite);
  noseCone.position.y = 45.75;
  rocketGroup.add(noseCone);

  const bdGreenStripe = new THREE.Mesh(
    new THREE.CylinderGeometry(2.22, 2.22, 1.2, 24),
    new THREE.MeshBasicMaterial({ color: 0x006a4e })
  );
  bdGreenStripe.position.y = 40;
  rocketGroup.add(bdGreenStripe);

  const bdRedRoundel = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xf42a41 })
  );
  bdRedRoundel.position.set(0, 40, 2.15);
  bdRedRoundel.scale.set(1, 1, 0.2);
  rocketGroup.add(bdRedRoundel);

  // 4 Grid Fins & 4 Base Aerodynamic Stabilizers
  for (let f = 0; f < 4; f++) {
    const angle = (f * Math.PI) / 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.5, 2.6), rocketBlack);
    fin.position.set(Math.cos(angle) * 2.8, 3.5, Math.sin(angle) * 2.8);
    fin.rotation.y = angle;
    rocketGroup.add(fin);
  }

  // 2 Side Boosters
  for (const bx of [-3.8, 3.8]) {
    const booster = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 20, 16), rocketWhite);
    booster.position.set(bx, 10, 0);
    rocketGroup.add(booster);

    const bNose = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4, 16), rocketWhite);
    bNose.position.set(bx, 22, 0);
    rocketGroup.add(bNose);

    // Booster Exhaust Flame
    const bPlume = new THREE.Mesh(new THREE.ConeGeometry(1.3, 12, 12), rocketFireMat);
    bPlume.position.set(bx, -6, 0);
    bPlume.rotation.x = Math.PI;
    rocketGroup.add(bPlume);
  }

  // Main Engine Exhaust Rocket Plume (Glowing Jet Flames & Mach Diamonds)
  const mainPlume = new THREE.Mesh(new THREE.ConeGeometry(2.6, 24, 16), rocketFireMat);
  mainPlume.position.set(0, -12, 0);
  mainPlume.rotation.x = Math.PI;
  rocketGroup.add(mainPlume);

  const innerCorePlume = new THREE.Mesh(new THREE.ConeGeometry(1.6, 16, 16), rocketGlowFire);
  innerCorePlume.position.set(0, -8, 0);
  innerCorePlume.rotation.x = Math.PI;
  rocketGroup.add(innerCorePlume);

  // Rocket Point Light (Casts dramatic night ground & cloud illumination)
  const rocketLight = new THREE.PointLight(0xf97316, 4.5, 350, 1.2);
  rocketLight.position.set(0, -6, 0);
  rocketGroup.add(rocketLight);

  rocketGroup.scale.set(0.65, 0.65, 0.65);
  rocketGroup.position.set(220, 40, -150);
  group.add(rocketGroup);

  // 4. COMMERCIAL PASSENGER AIRLINER (Biman Bangladesh Airlines Boeing 787 Dreamliner)
  const airplaneGroup = new THREE.Group();
  airplaneGroup.name = 'sky_airliner_flight';

  // Fuselage (Length 46m)
  const planeWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.4 });
  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 42, 24), planeWhite);
  fuselage.rotation.x = Math.PI / 2;
  fuselage.castShadow = true;
  airplaneGroup.add(fuselage);

  // Aerodynamic Cockpit Nose
  const cockpitNose = new THREE.Mesh(new THREE.SphereGeometry(2.3, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), planeWhite);
  cockpitNose.position.set(0, 0, 21);
  cockpitNose.scale.set(1, 0.85, 2.2);
  airplaneGroup.add(cockpitNose);

  // Cockpit Tinted Windows
  const cockpitGlass = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.8, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 })
  );
  cockpitGlass.position.set(0, 0.9, 21.2);
  airplaneGroup.add(cockpitGlass);

  // Main Swept Wings (Span 44m)
  const wingShape = new THREE.BoxGeometry(44, 0.35, 6.5);
  const wings = new THREE.Mesh(wingShape, planeWhite);
  wings.position.set(0, -0.4, 2);
  wings.rotation.y = 0.12;
  wings.castShadow = true;
  airplaneGroup.add(wings);

  // Winglets (Curved tips)
  for (const wx of [-22, 22]) {
    const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 2.2), planeWhite);
    winglet.position.set(wx, 0.9, 2);
    airplaneGroup.add(winglet);
  }

  // Jet Turbofan Engines under wings
  const jetMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
  const jetGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  for (const jx of [-9.5, 9.5]) {
    const engineNacelle = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.4, 7, 16), jetMat);
    engineNacelle.rotation.x = Math.PI / 2;
    engineNacelle.position.set(jx, -1.8, 4);
    airplaneGroup.add(engineNacelle);

    // Jet Exhaust
    const jetFlame = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5, 12), jetGlowMat);
    jetFlame.rotation.x = -Math.PI / 2;
    jetFlame.position.set(jx, -1.8, -0.5);
    airplaneGroup.add(jetFlame);
  }

  // Tail Vertical Stabilizer Fin (with National flag color)
  const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.35, 9, 7), planeWhite);
  tailFin.position.set(0, 4.8, -18);
  tailFin.rotation.x = -0.38;
  airplaneGroup.add(tailFin);

  const tailGreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 4, 4),
    new THREE.MeshBasicMaterial({ color: 0x006a4e })
  );
  tailGreen.position.set(0, 6.2, -18.5);
  airplaneGroup.add(tailGreen);

  // Horizontal Tailplane Elevators
  const elevators = new THREE.Mesh(new THREE.BoxGeometry(16, 0.25, 3.5), planeWhite);
  elevators.position.set(0, 0.8, -19.5);
  airplaneGroup.add(elevators);

  // Navigation & Strobe Lights (Red port wing, Green starboard wing, White flashing strobes)
  const navRed = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  navRed.position.set(-22, 0.2, 2);
  airplaneGroup.add(navRed);

  const navGreen = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x22c55e })
  );
  navGreen.position.set(22, 0.2, 2);
  airplaneGroup.add(navGreen);

  const strobeWhite = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  strobeWhite.position.set(0, 9.2, -19.5);
  airplaneGroup.add(strobeWhite);

  airplaneGroup.scale.set(0.7, 0.7, 0.7);
  airplaneGroup.position.set(0, 160, 0);
  group.add(airplaneGroup);

  // 5. SHOOTING STARS / METEOR SYSTEM (Dynamic streaks at night)
  const meteorCanvas = document.createElement('canvas');
  meteorCanvas.width = 128;
  meteorCanvas.height = 16;
  const metCtx = meteorCanvas.getContext('2d');
  if (metCtx) {
    const metGrad = metCtx.createLinearGradient(0, 8, 128, 8);
    metGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    metGrad.addColorStop(0.3, 'rgba(147, 197, 253, 0.8)');
    metGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    metCtx.fillStyle = metGrad;
    metCtx.fillRect(0, 0, 128, 16);
  }
  const meteorTex = new THREE.CanvasTexture(meteorCanvas);
  const meteorMat = new THREE.MeshBasicMaterial({
    map: meteorTex,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const meteorMesh = new THREE.Mesh(new THREE.PlaneGeometry(80, 4), meteorMat);
  meteorMesh.position.set(-150, 420, -250);
  meteorMesh.rotation.z = -0.55;
  group.add(meteorMesh);

  let meteorTimer = 0;
  let meteorActive = false;
  let meteorProgress = 0;

  // Space flight animation loop
  const updateAnimation = (time: number, delta: number, isNight: boolean, timeOfDay: string) => {
    // 1. Starfield slow celestial rotation
    starField.rotation.y = time * 0.003;
    starField.rotation.x = Math.sin(time * 0.001) * 0.02;

    // 2. Space Rocket Ascent Physics Trajectory
    // Continuous launch into upper space / mesosphere loop
    const rocketLoopPeriod = 48; // seconds per cycle
    const cycleTime = (time % rocketLoopPeriod) / rocketLoopPeriod;

    // Launch Pad coordinates at space center pad (x=210, z=-140)
    let launchX = 210;
    let launchY = 12;
    let launchZ = -140;
    let pitchAngle = 0;

    if (cycleTime < 0.12) {
      // Countdown / Pad ignition phase
      launchY = 12 + Math.sin(time * 30) * 0.1;
      pitchAngle = 0;
    } else {
      // Ascent phase
      const ascentProgress = (cycleTime - 0.12) / 0.88;
      launchY = 12 + Math.pow(ascentProgress, 1.8) * 850;
      launchX = 210 - Math.pow(ascentProgress, 2.2) * 500;
      launchZ = -140 - Math.pow(ascentProgress, 2.2) * 600;
      pitchAngle = Math.min(Math.PI / 2.2, ascentProgress * 1.35);
    }
    rocketGroup.position.set(launchX, launchY, launchZ);
    rocketGroup.rotation.x = -pitchAngle * 0.8;
    rocketGroup.rotation.z = pitchAngle * 0.6;
    rocketGroup.rotation.y = time * 0.15;

    // Engine exhaust pulse
    const flicker = 1 + (Math.sin(time * 50) + Math.cos(time * 70)) * 0.15;
    mainPlume.scale.set(flicker, flicker * 1.15, flicker);
    innerCorePlume.scale.set(flicker, flicker, flicker);

    // 3. Commercial Airplane Runway Takeoff, Initial Climb & Sky Cruising Cycle
    // Runway extends along Z axis at X = 180, from Z = 90 (start) to Z = 280 (end)
    const flightLoopPeriod = 60; // 60 seconds full flight loop
    const fPhase = (time % flightLoopPeriod) / flightLoopPeriod;

    let pX = 180;
    let pY = 2.4;
    let pZ = 90;
    let pPitch = 0;
    let pRoll = 0;
    let pYaw = 0;

    if (fPhase < 0.18) {
      // Phase 1: Takeoff Ground Roll (accelerating from z = 90 to z = 250)
      const rollFrac = fPhase / 0.18;
      pZ = 90 + Math.pow(rollFrac, 1.5) * 160;
      pY = 2.4;
      pX = 180;
      pYaw = 0; // facing +Z along runway
      pPitch = rollFrac > 0.7 ? (rollFrac - 0.7) * 0.35 : 0; // Rotate nose up near V1/Vr
    } else if (fPhase < 0.35) {
      // Phase 2: Liftoff & Initial High Climb over delta
      const climbFrac = (fPhase - 0.18) / 0.17;
      pZ = 250 + climbFrac * 180;
      pX = 180 + Math.sin(climbFrac * Math.PI * 0.5) * 80;
      pY = 2.4 + Math.pow(climbFrac, 1.2) * 160;
      pPitch = 0.22 - climbFrac * 0.12;
      pRoll = -climbFrac * 0.25; // Gentle left bank
      pYaw = climbFrac * 0.45;
    } else if (fPhase < 0.82) {
      // Phase 3: High Altitude Cruising Orbit around the 10km Country Airspace
      const cruiseFrac = (fPhase - 0.35) / 0.47;
      const angle = 0.45 + cruiseFrac * Math.PI * 2;
      pX = Math.cos(angle) * 380;
      pZ = Math.sin(angle) * 350;
      pY = 165 + Math.sin(cruiseFrac * Math.PI * 4) * 15;

      const tangX = -Math.sin(angle) * 380;
      const tangZ = Math.cos(angle) * 350;
      pYaw = Math.atan2(tangX, tangZ);
      pRoll = -0.25; // Continuous banking in turn
      pPitch = Math.cos(cruiseFrac * Math.PI * 4) * 0.04;
    } else {
      // Phase 4: Final Approach & Runway Alignment Landing
      const landFrac = (fPhase - 0.82) / 0.18;
      pX = THREE.MathUtils.lerp(180 + Math.sin(landFrac * Math.PI) * 40, 180, landFrac);
      pZ = THREE.MathUtils.lerp(-150, 90, landFrac);
      pY = THREE.MathUtils.lerp(165, 2.4, Math.pow(landFrac, 1.4));
      pYaw = 0;
      pPitch = -0.05 + (1 - landFrac) * 0.08;
      pRoll = (1 - landFrac) * -0.15;
    }

    airplaneGroup.position.set(pX, pY, pZ);
    airplaneGroup.rotation.set(pPitch, pYaw, pRoll);

    // Wing Strobe flash (1.2 Hz strobe burst)
    const strobeFlash = Math.sin(time * 7) > 0.82 ? 2.8 : 0.05;
    strobeWhite.scale.setScalar(strobeFlash);

    // 4. Shooting Star / Meteor Event
    meteorTimer += delta;
    if (!meteorActive && meteorTimer > 7 && Math.random() < 0.03) {
      meteorActive = true;
      meteorProgress = 0;
      meteorTimer = 0;
      meteorMesh.position.set(
        -200 + (Math.random() - 0.5) * 300,
        380 + Math.random() * 80,
        -300 + (Math.random() - 0.5) * 300
      );
      meteorMesh.rotation.z = -0.4 - Math.random() * 0.4;
    }

    if (meteorActive) {
      meteorProgress += delta * 1.8;
      meteorMesh.position.x += 160 * delta;
      meteorMesh.position.y -= 90 * delta;

      if (meteorProgress < 0.5) {
        meteorMat.opacity = meteorProgress * 2;
      } else {
        meteorMat.opacity = Math.max(0, (1 - meteorProgress) * 2);
      }

      if (meteorProgress >= 1) {
        meteorActive = false;
        meteorMat.opacity = 0;
      }
    }

    // Visibility blending depending on day/night
    setSpaceVisibility(isNight, timeOfDay);
  };

  const setSpaceVisibility = (isNight: boolean, timeOfDay: string) => {
    if (timeOfDay === 'night') {
      starMat.opacity = 0.95;
      moonGroup.visible = true;
      haloMat.opacity = 0.8;
      rocketLight.intensity = 5.0;
    } else if (timeOfDay === 'dawn' || timeOfDay === 'golden') {
      starMat.opacity = 0.25;
      moonGroup.visible = true;
      haloMat.opacity = 0.35;
      rocketLight.intensity = 3.0;
    } else {
      // Day
      starMat.opacity = 0.0;
      moonGroup.visible = false;
      haloMat.opacity = 0.0;
      rocketLight.intensity = 1.8;
    }
  };

  return {
    group,
    updateAnimation,
    setSpaceVisibility,
  };
}
