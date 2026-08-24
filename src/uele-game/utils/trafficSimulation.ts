import * as THREE from 'three';

export interface TrafficVehicle {
  group: THREE.Group;
  type: 'bus' | 'truck' | 'cng' | 'car' | 'rickshaw';
  route: 'n5_south' | 'n5_north' | 'boulevard_east' | 'boulevard_west' | 'airport_route' | 'mountain_tunnel';
  progress: number;
  speed: number;
  wheels: THREE.Mesh[];
  headlights: THREE.Mesh[];
}

export interface TrafficSystem {
  group: THREE.Group;
  update: (delta: number) => void;
}

export function buildTrafficSystem(getElevationAt: (x: number, z: number) => number): TrafficSystem {
  const group = new THREE.Group();
  group.name = 'traffic_system';

  // Common materials
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  const wheelHubMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });
  const headlightGlow = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.2 });
  const taillightGlow = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.2 });

  // 1. Vehicle Builders
  const createLocalBus = (colorHex: number): { group: THREE.Group; wheels: THREE.Mesh[]; headlights: THREE.Mesh[] } => {
    const vGrp = new THREE.Group();
    const wheels: THREE.Mesh[] = [];
    const headlights: THREE.Mesh[] = [];

    // Bus Body (Length 11m, Width 3m, Height 3.4m)
    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4, metalness: 0.2 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.6, 10.5), bodyMat);
    body.position.y = 1.8;
    body.castShadow = true;
    vGrp.add(body);

    // Roof Luggage Carrier
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 7), rackMat);
    rack.position.set(0, 3.3, -0.5);
    vGrp.add(rack);

    // Luggage items on top
    const lug1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.2), new THREE.MeshStandardMaterial({ color: 0x1d4ed8 }));
    lug1.position.set(0, 3.7, 0);
    vGrp.add(lug1);

    // Windows
    const winSide = new THREE.Mesh(new THREE.BoxGeometry(2.86, 0.9, 8.5), glassMat);
    winSide.position.set(0, 2.1, -0.2);
    vGrp.add(winSide);

    // Front Windshield
    const windShield = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.1, 0.2), glassMat);
    windShield.position.set(0, 2.1, 5.26);
    vGrp.add(windShield);

    // Headlights
    for (const hx of [-1.1, 1.1]) {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.1), headlightGlow);
      hl.position.set(hx, 1.1, 5.28);
      vGrp.add(hl);
      headlights.push(hl);

      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.1), taillightGlow);
      tl.position.set(hx, 1.1, -5.28);
      vGrp.add(tl);
    }

    // Wheels (4 dual sets)
    const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    for (const wz of [3.2, -3.2]) {
      for (const wx of [-1.45, 1.45]) {
        const wheel = new THREE.Mesh(wheelGeo, tireMat);
        wheel.position.set(wx, 0.6, wz);
        wheel.castShadow = true;
        vGrp.add(wheel);
        wheels.push(wheel);
      }
    }

    return { group: vGrp, wheels, headlights };
  };

  const createCNG = (): { group: THREE.Group; wheels: THREE.Mesh[]; headlights: THREE.Mesh[] } => {
    const vGrp = new THREE.Group();
    const wheels: THREE.Mesh[] = [];
    const headlights: THREE.Mesh[] = [];

    // Green CNG Auto-Rickshaw Body
    const cngGreen = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 2.6), cngGreen);
    cabin.position.y = 1.0;
    cabin.castShadow = true;
    vGrp.add(cabin);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 2.4), hoodMat);
    roof.position.set(0, 1.75, 0);
    vGrp.add(roof);

    // Front Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.6, 0.1), glassMat);
    windshield.position.set(0, 1.25, 1.31);
    vGrp.add(windshield);

    // Single Front Light
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12), headlightGlow);
    hl.rotateX(Math.PI / 2);
    hl.position.set(0, 0.75, 1.35);
    vGrp.add(hl);
    headlights.push(hl);

    // 3 Wheels
    const wGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
    wGeo.rotateZ(Math.PI / 2);

    const frontWheel = new THREE.Mesh(wGeo, tireMat);
    frontWheel.position.set(0, 0.35, 1.1);
    vGrp.add(frontWheel);
    wheels.push(frontWheel);

    for (const wx of [-0.8, 0.8]) {
      const rw = new THREE.Mesh(wGeo, tireMat);
      rw.position.set(wx, 0.35, -0.9);
      vGrp.add(rw);
      wheels.push(rw);
    }

    return { group: vGrp, wheels, headlights };
  };

  const createTruck = (colorHex: number): { group: THREE.Group; wheels: THREE.Mesh[]; headlights: THREE.Mesh[] } => {
    const vGrp = new THREE.Group();
    const wheels: THREE.Mesh[] = [];
    const headlights: THREE.Mesh[] = [];

    // Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.5, 3.2), new THREE.MeshStandardMaterial({ color: colorHex }));
    cab.position.set(0, 1.75, 2.8);
    cab.castShadow = true;
    vGrp.add(cab);

    // Wooden Cargo Bed (Typical Bengal Truck with painted bumper)
    const cargo = new THREE.Mesh(new THREE.BoxGeometry(2.7, 2.0, 6.5), new THREE.MeshStandardMaterial({ color: 0x92400e }));
    cargo.position.set(0, 1.9, -2.0);
    cargo.castShadow = true;
    vGrp.add(cargo);

    // Headlights
    for (const hx of [-1.0, 1.0]) {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.1), headlightGlow);
      hl.position.set(hx, 1.1, 4.41);
      vGrp.add(hl);
      headlights.push(hl);
    }

    // 6 Wheels
    const wGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.45, 14);
    wGeo.rotateZ(Math.PI / 2);

    for (const wz of [2.8, -1.8, -3.8]) {
      for (const wx of [-1.4, 1.4]) {
        const wheel = new THREE.Mesh(wGeo, tireMat);
        wheel.position.set(wx, 0.65, wz);
        wheel.castShadow = true;
        vGrp.add(wheel);
        wheels.push(wheel);
      }
    }

    return { group: vGrp, wheels, headlights };
  };

  const createSedan = (colorHex: number): { group: THREE.Group; wheels: THREE.Mesh[]; headlights: THREE.Mesh[] } => {
    const vGrp = new THREE.Group();
    const wheels: THREE.Mesh[] = [];
    const headlights: THREE.Mesh[] = [];

    const carMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.6, roughness: 0.25 });
    const lower = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 4.6), carMat);
    lower.position.y = 0.65;
    lower.castShadow = true;
    vGrp.add(lower);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.75, 2.5), carMat);
    cabin.position.set(0, 1.35, -0.2);
    cabin.castShadow = true;
    vGrp.add(cabin);

    // Headlights
    for (const hx of [-0.8, 0.8]) {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.1), headlightGlow);
      hl.position.set(hx, 0.65, 2.31);
      vGrp.add(hl);
      headlights.push(hl);
    }

    const wGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14);
    wGeo.rotateZ(Math.PI / 2);

    for (const wz of [1.4, -1.4]) {
      for (const wx of [-1.08, 1.08]) {
        const wheel = new THREE.Mesh(wGeo, tireMat);
        wheel.position.set(wx, 0.42, wz);
        vGrp.add(wheel);
        wheels.push(wheel);
      }
    }

    return { group: vGrp, wheels, headlights };
  };

  // 2. Define Road Waypoint Routes
  const routes = {
    // Highway N5 Southbound (Lane at x = 22.8)
    n5_south: [
      new THREE.Vector3(22.8, 0, -360),
      new THREE.Vector3(22.8, 0, -100),
      new THREE.Vector3(22.8, 0, 0),
      new THREE.Vector3(22.8, 0, 150),
      new THREE.Vector3(22.8, 0, 360),
    ],
    // Highway N5 Northbound (Lane at x = 17.2)
    n5_north: [
      new THREE.Vector3(17.2, 0, 360),
      new THREE.Vector3(17.2, 0, 150),
      new THREE.Vector3(17.2, 0, 0),
      new THREE.Vector3(17.2, 0, -100),
      new THREE.Vector3(17.2, 0, -360),
    ],
    // City Central Boulevard Eastbound (z = -7.5, x: -140 -> 210 over River Bridge)
    boulevard_east: [
      new THREE.Vector3(-140, 0, -7.5),
      new THREE.Vector3(-40, 0, -7.5),
      new THREE.Vector3(20, 0, -7.5),
      new THREE.Vector3(100, 0, -7.5),
      new THREE.Vector3(160, 0, -7.5), // over River Bridge
      new THREE.Vector3(220, 0, -7.5),
    ],
    // City Central Boulevard Westbound (z = -12.5, x: 220 -> -140)
    boulevard_west: [
      new THREE.Vector3(220, 0, -12.5),
      new THREE.Vector3(160, 0, -12.5),
      new THREE.Vector3(100, 0, -12.5),
      new THREE.Vector3(20, 0, -12.5),
      new THREE.Vector3(-40, 0, -12.5),
      new THREE.Vector3(-140, 0, -12.5),
    ],
    // Airport connector route
    airport_route: [
      new THREE.Vector3(20, 0, 100),
      new THREE.Vector3(80, 0, 140),
      new THREE.Vector3(140, 0, 175),
      new THREE.Vector3(180, 0, 200),
      new THREE.Vector3(140, 0, 175),
      new THREE.Vector3(80, 0, 140),
      new THREE.Vector3(20, 0, 100),
    ],
    // Mountain Highway & Tunnel Loop Route (through Mountain pass at -200, -220)
    mountain_tunnel: [
      new THREE.Vector3(20, 0, -180),
      new THREE.Vector3(-60, 0, -200),
      new THREE.Vector3(-150, 0, -230), // Tunnel Entrance
      new THREE.Vector3(-220, 0, -245), // Inside Tunnel
      new THREE.Vector3(-280, 0, -230), // Tunnel Exit
      new THREE.Vector3(-250, 0, -170),
      new THREE.Vector3(-120, 0, -120),
      new THREE.Vector3(20, 0, -180),
    ],
  };

  const curves: { [k: string]: THREE.CatmullRomCurve3 } = {};
  for (const [key, pts] of Object.entries(routes)) {
    curves[key] = new THREE.CatmullRomCurve3(pts, false);
  }

  // 3. Populate Default Traffic Fleet (24+ Live AI Vehicles)
  const trafficVehicles: TrafficVehicle[] = [];

  const fleetConfigs: {
    type: TrafficVehicle['type'];
    route: TrafficVehicle['route'];
    progress: number;
    speed: number;
    color: number;
  }[] = [
    // N5 Southbound Vehicles
    { type: 'bus', route: 'n5_south', progress: 0.1, speed: 0.035, color: 0xef4444 }, // Red Hanif Bus
    { type: 'truck', route: 'n5_south', progress: 0.35, speed: 0.028, color: 0x0284c7 },
    { type: 'cng', route: 'n5_south', progress: 0.6, speed: 0.032, color: 0x16a34a },
    { type: 'car', route: 'n5_south', progress: 0.85, speed: 0.045, color: 0xf8fafc },

    // N5 Northbound Vehicles
    { type: 'bus', route: 'n5_north', progress: 0.15, speed: 0.036, color: 0x15803d }, // Green Shyamoli Bus
    { type: 'car', route: 'n5_north', progress: 0.45, speed: 0.042, color: 0x0f172a },
    { type: 'truck', route: 'n5_north', progress: 0.7, speed: 0.027, color: 0xd97706 },
    { type: 'cng', route: 'n5_north', progress: 0.92, speed: 0.031, color: 0x16a34a },

    // Boulevard Eastbound (City to River Bridge)
    { type: 'bus', route: 'boulevard_east', progress: 0.05, speed: 0.038, color: 0xf59e0b }, // Yellow City Bus
    { type: 'cng', route: 'boulevard_east', progress: 0.3, speed: 0.033, color: 0x16a34a },
    { type: 'car', route: 'boulevard_east', progress: 0.55, speed: 0.044, color: 0xdc2626 },
    { type: 'truck', route: 'boulevard_east', progress: 0.8, speed: 0.026, color: 0x475569 },

    // Boulevard Westbound (River Bridge to City Center & Bazaar)
    { type: 'cng', route: 'boulevard_west', progress: 0.1, speed: 0.034, color: 0x16a34a },
    { type: 'car', route: 'boulevard_west', progress: 0.4, speed: 0.042, color: 0x0284c7 },
    { type: 'bus', route: 'boulevard_west', progress: 0.65, speed: 0.036, color: 0x7c3aed }, // Purple Eagle Bus
    { type: 'truck', route: 'boulevard_west', progress: 0.9, speed: 0.029, color: 0x059669 },

    // Airport Expressway Connector
    { type: 'car', route: 'airport_route', progress: 0.2, speed: 0.04, color: 0xf8fafc },
    { type: 'cng', route: 'airport_route', progress: 0.6, speed: 0.03, color: 0x16a34a },

    // Mountain Tunnel Route
    { type: 'truck', route: 'mountain_tunnel', progress: 0.15, speed: 0.028, color: 0xb91c1c },
    { type: 'car', route: 'mountain_tunnel', progress: 0.5, speed: 0.038, color: 0x3b82f6 },
    { type: 'bus', route: 'mountain_tunnel', progress: 0.8, speed: 0.03, color: 0x047857 },
  ];

  fleetConfigs.forEach((cfg) => {
    let vehObj;
    if (cfg.type === 'bus') vehObj = createLocalBus(cfg.color);
    else if (cfg.type === 'truck') vehObj = createTruck(cfg.color);
    else if (cfg.type === 'cng') vehObj = createCNG();
    else vehObj = createSedan(cfg.color);

    group.add(vehObj.group);
    trafficVehicles.push({
      group: vehObj.group,
      type: cfg.type,
      route: cfg.route,
      progress: cfg.progress,
      speed: cfg.speed,
      wheels: vehObj.wheels,
      headlights: vehObj.headlights,
    });
  });

  // 4. Traffic Simulation Update Loop
  const update = (delta: number) => {
    trafficVehicles.forEach((v) => {
      v.progress += v.speed * delta;
      if (v.progress > 1) v.progress -= 1;

      const curve = curves[v.route];
      if (!curve) return;

      const pos = curve.getPointAt(v.progress);
      const tangent = curve.getTangentAt(v.progress);

      // Align elevation to road/bridge surface
      let elev = getElevationAt(pos.x, pos.z);
      // If crossing river bridge
      if (v.route.includes('boulevard') && pos.x > 135 && pos.x < 185) {
        elev = Math.max(elev, 3.2);
      }
      // If inside Mountain Tunnel (-280 < x < -150)
      if (v.route === 'mountain_tunnel' && pos.x >= -280 && pos.x <= -150) {
        elev = 6.5; // smooth flat tunnel bore through mountain
      }

      v.group.position.set(pos.x, elev + 0.05, pos.z);

      // Rotate towards driving direction
      const angle = Math.atan2(tangent.x, tangent.z);
      v.group.rotation.y = angle;

      // Spin wheels
      const spin = v.speed * 85 * delta;
      v.wheels.forEach((w) => {
        w.rotation.x += spin;
      });
    });
  };

  return { group, update };
}
