import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';

export interface TrafficTransitInstance {
  group: THREE.Group;
  update: (delta: number, time: number) => void;
  getNearbyVehiclesCount: (pos: THREE.Vector3, radius: number) => number;
}

interface AiTrafficAgent {
  mesh: THREE.Group;
  type: 'sedan' | 'truck' | 'bus';
  route: 'ring_clockwise' | 'ring_counter' | 'expressway_east' | 'expressway_west' | 'highway_north' | 'highway_south';
  progress: number;
  speed: number;
  laneOffset: number;
}

/**
 * Creates vehicle body geometry for AI cars, delivery trucks, and buses
 */
function createAiVehicleMesh(type: 'sedan' | 'truck' | 'bus', colorHex: number): THREE.Group {
  const root = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.3,
    metalness: 0.7,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.1,
    metalness: 0.9,
  });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  const headLightMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
  const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  if (type === 'sedan') {
    // Car Chassis
    const chassisGeo = new THREE.BoxGeometry(2.4, 0.8, 4.8);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.6;
    chassis.castShadow = true;
    root.add(chassis);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(2.1, 0.7, 2.5);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.25, -0.2);
    root.add(cabin);

    // Headlights
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), headLightMat);
    hl1.position.set(-0.8, 0.6, 2.41);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), headLightMat);
    hl2.position.set(0.8, 0.6, 2.41);
    // Taillights
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), tailLightMat);
    tl1.position.set(-0.8, 0.6, -2.41);
    const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), tailLightMat);
    tl2.position.set(0.8, 0.6, -2.41);
    root.add(hl1, hl2, tl1, tl2);

  } else if (type === 'truck') {
    // Heavy Truck Cab
    const cabGeo = new THREE.BoxGeometry(2.8, 2.4, 2.4);
    const cab = new THREE.Mesh(cabGeo, bodyMat);
    cab.position.set(0, 1.6, 2.4);
    cab.castShadow = true;

    // Cargo Container Trailer
    const trailerGeo = new THREE.BoxGeometry(3.0, 2.8, 6.5);
    const trailerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6, metalness: 0.3 });
    const trailer = new THREE.Mesh(trailerGeo, trailerMat);
    trailer.position.set(0, 1.9, -2.4);
    trailer.castShadow = true;
    root.add(cab, trailer);

    // Headlights
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), headLightMat);
    hl1.position.set(-1.0, 0.9, 3.61);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), headLightMat);
    hl2.position.set(1.0, 0.9, 3.61);
    // Taillights
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), tailLightMat);
    tl1.position.set(-1.1, 0.9, -5.66);
    const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), tailLightMat);
    tl2.position.set(1.1, 0.9, -5.66);
    root.add(hl1, hl2, tl1, tl2);

  } else {
    // City Bus
    const busGeo = new THREE.BoxGeometry(3.0, 2.6, 10.5);
    const bus = new THREE.Mesh(busGeo, bodyMat);
    bus.position.y = 1.65;
    bus.castShadow = true;

    // Windows band
    const winGeo = new THREE.BoxGeometry(3.05, 0.8, 9.8);
    const win = new THREE.Mesh(winGeo, glassMat);
    win.position.y = 2.0;
    root.add(bus, win);

    // Headlights
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), headLightMat);
    hl1.position.set(-1.0, 0.8, 5.26);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), headLightMat);
    hl2.position.set(1.0, 0.8, 5.26);
    // Taillights
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), tailLightMat);
    tl1.position.set(-1.0, 0.8, -5.26);
    const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), tailLightMat);
    tl2.position.set(1.0, 0.8, -5.26);
    root.add(hl1, hl2, tl1, tl2);
  }

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  const w1 = new THREE.Mesh(wheelGeo, wheelMat);
  w1.position.set(-1.1, 0.45, 1.5);
  const w2 = new THREE.Mesh(wheelGeo, wheelMat);
  w2.position.set(1.1, 0.45, 1.5);
  const w3 = new THREE.Mesh(wheelGeo, wheelMat);
  w3.position.set(-1.1, 0.45, -1.5);
  const w4 = new THREE.Mesh(wheelGeo, wheelMat);
  w4.position.set(1.1, 0.45, -1.5);
  root.add(w1, w2, w3, w4);

  return root;
}

/**
 * Builds the Dynamic Multi-Modal Traffic & Autonomous Transit System (Part 7):
 * 1. AI Road Vehicles (Cars, Trucks, Buses) on Ring Road, Expressway, and Highway
 * 2. High-Speed Intercity Express Train (Dual East-West railway tracks)
 * 3. Elevated Circular Metro Rail (MRT) Electric Train on the elevated viaduct (+8.5m)
 */
export function buildTrafficTransitSystem(): TrafficTransitInstance {
  const group = new THREE.Group();
  group.name = 'traffic_transit_system';

  const agents: AiTrafficAgent[] = [];
  const carColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0xf8fafc, 0x1e293b, 0x8b5cf6, 0x06b6d4];

  // =========================================================================
  // 1. AUTONOMOUS ROAD VEHICLES (RING ROAD, EXPRESSWAY, HIGHWAY)
  // =========================================================================
  // 1a. Ring Road (Clockwise & Counter-Clockwise)
  const ringRadius = 2000;
  for (let i = 0; i < 28; i++) {
    const isClockwise = i % 2 === 0;
    const type: 'sedan' | 'truck' | 'bus' = i % 5 === 0 ? 'bus' : (i % 3 === 0 ? 'truck' : 'sedan');
    const color = carColors[i % carColors.length];
    const mesh = createAiVehicleMesh(type, color);
    group.add(mesh);

    agents.push({
      mesh,
      type,
      route: isClockwise ? 'ring_clockwise' : 'ring_counter',
      progress: (i / 28) * Math.PI * 2,
      speed: 25 + Math.random() * 8, // ~90 - 120 km/h
      laneOffset: isClockwise ? 8 : -8,
    });
  }

  // 1b. East-West Expressway (Z = -3000m)
  for (let i = 0; i < 20; i++) {
    const isEast = i % 2 === 0;
    const type: 'sedan' | 'truck' | 'bus' = i % 4 === 0 ? 'truck' : 'sedan';
    const color = carColors[(i + 3) % carColors.length];
    const mesh = createAiVehicleMesh(type, color);
    group.add(mesh);

    agents.push({
      mesh,
      type,
      route: isEast ? 'expressway_east' : 'expressway_west',
      progress: -4800 + (i / 20) * 9600,
      speed: 32 + Math.random() * 10, // ~115 - 150 km/h
      laneOffset: isEast ? 12 : -12,
    });
  }

  // 1c. North-South National Highway (X = 0)
  for (let i = 0; i < 18; i++) {
    const isNorth = i % 2 === 0;
    const type: 'sedan' | 'truck' | 'bus' = i % 4 === 0 ? 'bus' : 'sedan';
    const color = carColors[(i + 5) % carColors.length];
    const mesh = createAiVehicleMesh(type, color);
    group.add(mesh);

    agents.push({
      mesh,
      type,
      route: isNorth ? 'highway_north' : 'highway_south',
      progress: -4800 + (i / 18) * 9600,
      speed: 24 + Math.random() * 6, // ~85 - 110 km/h
      laneOffset: isNorth ? 8 : -8,
    });
  }

  // =========================================================================
  // 2. HIGH-SPEED RAILWAY TRAINS (DUAL TRACKS AT Z = 0)
  // =========================================================================
  function createBulletTrainMesh(): THREE.Group {
    const train = new THREE.Group();
    const trainMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.8,
      roughness: 0.2,
    });
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.3,
    });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });

    const carLength = 24;
    const carWidth = 3.6;
    const carHeight = 3.8;

    // 5 Cars consist (Lead + 3 Coaches + Rear)
    for (let c = 0; c < 5; c++) {
      const coach = new THREE.Group();
      coach.position.x = (c - 2) * (carLength + 1.2);

      const bodyGeo = new THREE.BoxGeometry(carLength, carHeight, carWidth);
      const body = new THREE.Mesh(bodyGeo, trainMat);
      body.position.y = carHeight / 2 + 0.8;
      body.castShadow = true;
      coach.add(body);

      // Blue aerodynamic stripe
      const stripeGeo = new THREE.BoxGeometry(carLength + 0.05, 0.6, carWidth + 0.05);
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = carHeight * 0.45 + 0.8;
      coach.add(stripe);

      // Windows band
      const winGeo = new THREE.BoxGeometry(carLength - 4, 0.7, carWidth + 0.1);
      const win = new THREE.Mesh(winGeo, glassMat);
      win.position.y = carHeight * 0.65 + 0.8;
      coach.add(win);

      // Aerodynamic Nose Cone on Lead & Rear cars
      if (c === 4) {
        const noseGeo = new THREE.ConeGeometry(carWidth * 0.5, 6, 16);
        noseGeo.rotateZ(-Math.PI / 2);
        const nose = new THREE.Mesh(noseGeo, trainMat);
        nose.position.set(carLength / 2 + 2.5, carHeight / 2 + 0.8, 0);
        coach.add(nose);
      } else if (c === 0) {
        const noseGeo = new THREE.ConeGeometry(carWidth * 0.5, 6, 16);
        noseGeo.rotateZ(Math.PI / 2);
        const nose = new THREE.Mesh(noseGeo, trainMat);
        nose.position.set(-carLength / 2 - 2.5, carHeight / 2 + 0.8, 0);
        coach.add(nose);
      }

      train.add(coach);
    }

    return train;
  }

  const train1 = createBulletTrainMesh();
  const train2 = createBulletTrainMesh();
  group.add(train1, train2);

  let train1X = -4500;
  let train2X = 4500;
  const trainSpeed = 75; // ~270 km/h high-speed rail

  // =========================================================================
  // 3. ELEVATED CIRCULAR METRO RAIL (MRT) TRAIN (+8.5m ELEVATION)
  // =========================================================================
  function createMetroTrainMesh(): THREE.Group {
    const metro = new THREE.Group();
    const metroMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, // Vibrant purple-violet MRT livery
      metalness: 0.7,
      roughness: 0.3,
    });
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.2,
    });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });

    for (let c = 0; c < 3; c++) {
      const car = new THREE.Group();
      car.position.z = (c - 1) * 16;

      const bodyGeo = new THREE.BoxGeometry(3.2, 3.2, 14.5);
      const body = new THREE.Mesh(bodyGeo, metroMat);
      body.position.y = 1.6;
      body.castShadow = true;

      const roofGeo = new THREE.BoxGeometry(3.25, 0.4, 14.5);
      const roof = new THREE.Mesh(roofGeo, silverMat);
      roof.position.y = 3.2;

      const winGeo = new THREE.BoxGeometry(3.3, 0.9, 12);
      const win = new THREE.Mesh(winGeo, glassMat);
      win.position.y = 1.8;

      car.add(body, roof, win);
      metro.add(car);
    }
    return metro;
  }

  const metroTrain1 = createMetroTrainMesh();
  const metroTrain2 = createMetroTrainMesh();
  group.add(metroTrain1, metroTrain2);

  let metroAngle1 = 0;
  let metroAngle2 = Math.PI;
  const metroAngularSpeed = 0.045; // Smooth loop around R=2022m

  // =========================================================================
  // UPDATE LOOP (DYNAMICS & TRAFFIC DISPATCH)
  // =========================================================================
  const update = (delta: number, _time: number) => {
    // 1. Update AI Road Vehicles
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      if (agent.route === 'ring_clockwise') {
        agent.progress -= (agent.speed / (ringRadius + agent.laneOffset)) * delta;
        if (agent.progress < 0) agent.progress += Math.PI * 2;

        const rad = ringRadius + agent.laneOffset;
        const px = Math.cos(agent.progress) * rad;
        const pz = Math.sin(agent.progress) * rad;
        const py = calcMasterPlanElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        // Tangent heading
        agent.mesh.rotation.y = -agent.progress - Math.PI / 2;

      } else if (agent.route === 'ring_counter') {
        agent.progress += (agent.speed / (ringRadius + agent.laneOffset)) * delta;
        if (agent.progress > Math.PI * 2) agent.progress -= Math.PI * 2;

        const rad = ringRadius + agent.laneOffset;
        const px = Math.cos(agent.progress) * rad;
        const pz = Math.sin(agent.progress) * rad;
        const py = calcMasterPlanElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = -agent.progress + Math.PI / 2;

      } else if (agent.route === 'expressway_east') {
        agent.progress += agent.speed * delta;
        if (agent.progress > 4900) agent.progress = -4900;

        const px = agent.progress;
        const pz = -3000 + agent.laneOffset;
        const py = calcMasterPlanElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = Math.PI / 2; // Facing East

      } else if (agent.route === 'expressway_west') {
        agent.progress -= agent.speed * delta;
        if (agent.progress < -4900) agent.progress = 4900;

        const px = agent.progress;
        const pz = -3000 + agent.laneOffset;
        const py = calcMasterPlanElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = -Math.PI / 2; // Facing West

      } else if (agent.route === 'highway_north') {
        agent.progress -= agent.speed * delta;
        if (agent.progress < -4900) agent.progress = 4900;

        const px = agent.laneOffset;
        const pz = agent.progress;
        const py = calcMasterPlanElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = Math.PI; // Facing North

      } else if (agent.route === 'highway_south') {
        agent.progress += agent.speed * delta;
        if (agent.progress > 4900) agent.progress = -4900;

        const px = agent.laneOffset;
        const pz = agent.progress;
        const py = calcMasterPlanElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = 0; // Facing South
      }
    }

    // 2. Update High-Speed Railway Trains
    train1X += trainSpeed * delta;
    if (train1X > 5000) train1X = -5000;
    const train1Y = calcMasterPlanElevation(train1X, -2.5) + 0.3;
    train1.position.set(train1X, train1Y, -2.5);
    train1.rotation.y = 0; // Eastbound

    train2X -= trainSpeed * delta;
    if (train2X < -5000) train2X = 5000;
    const train2Y = calcMasterPlanElevation(train2X, 2.5) + 0.3;
    train2.position.set(train2X, train2Y, 2.5);
    train2.rotation.y = Math.PI; // Westbound

    // 3. Update Elevated Metro (MRT) Trains
    metroAngle1 += metroAngularSpeed * delta;
    if (metroAngle1 > Math.PI * 2) metroAngle1 -= Math.PI * 2;
    const m1X = Math.cos(metroAngle1) * 2022;
    const m1Z = Math.sin(metroAngle1) * 2022;
    metroTrain1.position.set(m1X, 8.6, m1Z);
    metroTrain1.rotation.y = -metroAngle1 - Math.PI / 2;

    metroAngle2 += metroAngularSpeed * delta;
    if (metroAngle2 > Math.PI * 2) metroAngle2 -= Math.PI * 2;
    const m2X = Math.cos(metroAngle2) * 2022;
    const m2Z = Math.sin(metroAngle2) * 2022;
    metroTrain2.position.set(m2X, 8.6, m2Z);
    metroTrain2.rotation.y = -metroAngle2 - Math.PI / 2;
  };

  const getNearbyVehiclesCount = (pos: THREE.Vector3, radius: number): number => {
    let count = 0;
    for (let i = 0; i < agents.length; i++) {
      if (agents[i].mesh.position.distanceTo(pos) <= radius) {
        count++;
      }
    }
    return count;
  };

  return {
    group,
    update,
    getNearbyVehiclesCount,
  };
}
