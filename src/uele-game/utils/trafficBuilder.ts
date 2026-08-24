import * as THREE from 'three';

export interface TrafficVehicle {
  group: THREE.Group;
  speed: number;
  direction: 1 | -1; // 1 = Southbound, -1 = Northbound
  laneX: number;
  headlights: THREE.SpotLight[];
}

export interface TrafficSystem {
  group: THREE.Group;
  updateTraffic: (delta: number, isNight: boolean, getElevationAt: (x: number, z: number) => number) => void;
}

export function buildHighwayTraffic(getElevationAt: (x: number, z: number) => number): TrafficSystem {
  const group = new THREE.Group();
  group.name = 'traffic_system_group';
  const vehicles: TrafficVehicle[] = [];

  const metalMat = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.6 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9 });

  // 1. Bangladesh Inter-District Coach Bus
  const createBus = (colorHex: number): THREE.Group => {
    const bus = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });

    // Main Bus Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 9.2), bodyMat);
    body.position.y = 1.6;
    body.castShadow = true;
    bus.add(body);

    // Window Strip
    const winStrip = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.8, 8.4), glassMat);
    winStrip.position.y = 2.0;
    bus.add(winStrip);

    // Roof Carrier
    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.3, 6.0),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 })
    );
    rack.position.y = 2.95;
    bus.add(rack);

    // Wheels (4 pairs)
    for (const wz of [-3.0, 3.0]) {
      for (const wx of [-1.15, 1.15]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 12), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.45, wz);
        wheel.castShadow = true;
        bus.add(wheel);
      }
    }

    return bus;
  };

  // 2. Decorated Tata Cargo Truck
  const createTruck = (colorHex: number): THREE.Group => {
    const truck = new THREE.Group();
    const cabMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
    const woodBedMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }); // Decorated wood sideboard

    // Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.3, 2.5), cabMat);
    cab.position.set(0, 1.6, -2.6);
    cab.castShadow = true;
    truck.add(cab);

    // Cargo Bed
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 5.4), woodBedMat);
    bed.position.set(0, 1.5, 1.4);
    bed.castShadow = true;
    truck.add(bed);

    // Wheels
    for (const wz of [-2.6, 1.4, 3.2]) {
      for (const wx of [-1.15, 1.15]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 12), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.45, wz);
        wheel.castShadow = true;
        truck.add(wheel);
      }
    }

    return truck;
  };

  // 3. Green CNG Auto-Rickshaw
  const createCNG = (): THREE.Group => {
    const cng = new THREE.Group();
    const cngBodyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 }); // Green body
    const cngRoofMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }); // Yellow roof

    // Lower Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 2.4), cngBodyMat);
    chassis.position.y = 0.65;
    chassis.castShadow = true;
    cng.add(chassis);

    // Yellow Canopy Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.7, 2.0), cngRoofMat);
    roof.position.set(0, 1.35, 0.1);
    roof.castShadow = true;
    cng.add(roof);

    // 3 Wheels (1 front, 2 rear)
    const fWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.18, 10), wheelMat);
    fWheel.rotation.z = Math.PI / 2;
    fWheel.position.set(0, 0.25, -1.0);
    cng.add(fWheel);

    for (const wx of [-0.65, 0.65]) {
      const rWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.18, 10), wheelMat);
      rWheel.rotation.z = Math.PI / 2;
      rWheel.position.set(wx, 0.25, 0.8);
      cng.add(rWheel);
    }

    return cng;
  };

  // Spawn Fleet of Highway Traffic
  // Southbound lane: x = 42.5 (direction = 1)
  // Northbound lane: x = 47.5 (direction = -1)
  const initialVehicles = [
    { type: 'bus', color: 0x2563eb, z: -140, laneX: 42.5, dir: 1 as const, speed: 18 },
    { type: 'truck', color: 0xd97706, z: -60, laneX: 42.5, dir: 1 as const, speed: 14 },
    { type: 'cng', color: 0x15803d, z: 20, laneX: 42.5, dir: 1 as const, speed: 11 },
    { type: 'bus', color: 0xdc2626, z: 120, laneX: 47.5, dir: -1 as const, speed: 19 },
    { type: 'truck', color: 0x059669, z: 40, laneX: 47.5, dir: -1 as const, speed: 13 },
    { type: 'cng', color: 0x15803d, z: -80, laneX: 47.5, dir: -1 as const, speed: 12 },
  ];

  initialVehicles.forEach((v) => {
    let vGroup: THREE.Group;
    if (v.type === 'bus') vGroup = createBus(v.color);
    else if (v.type === 'truck') vGroup = createTruck(v.color);
    else vGroup = createCNG();

    vGroup.position.set(v.laneX, getElevationAt(v.laneX, v.z) + 0.1, v.z);
    if (v.dir === -1) {
      vGroup.rotation.y = Math.PI; // Face north
    }

    // Headlights
    const hLights: THREE.SpotLight[] = [];
    const light1 = new THREE.SpotLight(0xfffbeb, 2.0, 30, Math.PI / 6, 0.4);
    light1.position.set(0.6, 0.8, v.dir === 1 ? -4.5 : 4.5);
    light1.target.position.set(0.6, 0, v.dir === 1 ? -25 : 25);
    vGroup.add(light1);
    vGroup.add(light1.target);
    hLights.push(light1);

    const light2 = new THREE.SpotLight(0xfffbeb, 2.0, 30, Math.PI / 6, 0.4);
    light2.position.set(-0.6, 0.8, v.dir === 1 ? -4.5 : 4.5);
    light2.target.position.set(-0.6, 0, v.dir === 1 ? -25 : 25);
    vGroup.add(light2);
    vGroup.add(light2.target);
    hLights.push(light2);

    group.add(vGroup);
    vehicles.push({
      group: vGroup,
      speed: v.speed,
      direction: v.dir,
      laneX: v.laneX,
      headlights: hLights,
    });
  });

  const updateTraffic = (delta: number, isNight: boolean, getElevation: (x: number, z: number) => number) => {
    vehicles.forEach((veh) => {
      // Move vehicle along road
      veh.group.position.z += veh.speed * veh.direction * delta;

      // Wrap around road bounds
      if (veh.group.position.z > 175) {
        veh.group.position.z = -175;
      } else if (veh.group.position.z < -175) {
        veh.group.position.z = 175;
      }

      // Snap Y to road elevation
      const curY = getElevation(veh.laneX, veh.group.position.z);
      veh.group.position.y = curY + 0.1;

      // Toggle headlights
      veh.headlights.forEach((h) => {
        h.intensity = isNight ? 2.5 : 0;
      });
    });
  };

  return {
    group,
    updateTraffic,
  };
}
