import * as THREE from 'three';
import { calcMasterPlanElevation } from './miniCountryTerrain';
import { getBridgeDeckElevation } from './riverAndBridges';

function getVehicleElevation(x: number, z: number): number {
  const bElev = getBridgeDeckElevation(x, z);
  if (bElev !== null) {
    return bElev;
  }
  return calcMasterPlanElevation(x, z);
}

export interface TrafficTransitInstance {
  group: THREE.Group;
  update: (delta: number, time: number) => void;
  getNearbyVehiclesCount: (pos: THREE.Vector3, radius: number) => number;
}

interface AiTrafficAgent {
  mesh: THREE.Group;
  type: 'sedan' | 'truck' | 'bus';
  route:
    | 'expressway_ew_east'
    | 'expressway_ew_west'
    | 'highway_ns_north'
    | 'highway_ns_south'
    | 'west_expwy_south'
    | 'west_expwy_north'
    | 'east_expwy_south'
    | 'east_expwy_north'
    | 'downtown_east'
    | 'downtown_west'
    | 'coastal_east'
    | 'coastal_west';
  progress: number;
  speed: number;
  laneOffset: number;
}

/**
 * Procedural low-poly AI vehicle meshes (Sedans, Heavy Cargo Trucks, Long-Distance Buses)
 */
function createAiVehicleMesh(type: 'sedan' | 'truck' | 'bus', colorHex: number): THREE.Group {
  const root = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.8,
    roughness: 0.3,
  });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  const headLightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  if (type === 'sedan') {
    const chassisGeo = new THREE.BoxGeometry(2.4, 0.8, 4.8);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.6;
    chassis.castShadow = true;
    root.add(chassis);

    const cabinGeo = new THREE.BoxGeometry(2.1, 0.7, 2.5);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.25, -0.2);
    root.add(cabin);

    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), headLightMat);
    hl1.position.set(-0.8, 0.6, 2.41);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), headLightMat);
    hl2.position.set(0.8, 0.6, 2.41);
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), tailLightMat);
    tl1.position.set(-0.8, 0.6, -2.41);
    const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), tailLightMat);
    tl2.position.set(0.8, 0.6, -2.41);
    root.add(hl1, hl2, tl1, tl2);

  } else if (type === 'truck') {
    const cabGeo = new THREE.BoxGeometry(2.8, 2.4, 2.4);
    const cab = new THREE.Mesh(cabGeo, bodyMat);
    cab.position.set(0, 1.6, 2.4);
    cab.castShadow = true;

    const trailerGeo = new THREE.BoxGeometry(3.0, 2.8, 6.5);
    const trailerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6, metalness: 0.3 });
    const trailer = new THREE.Mesh(trailerGeo, trailerMat);
    trailer.position.set(0, 1.9, -2.4);
    trailer.castShadow = true;
    root.add(cab, trailer);

    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), headLightMat);
    hl1.position.set(-1.0, 0.9, 3.61);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), headLightMat);
    hl2.position.set(1.0, 0.9, 3.61);
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), tailLightMat);
    tl1.position.set(-1.1, 0.9, -5.66);
    const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), tailLightMat);
    tl2.position.set(1.1, 0.9, -5.66);
    root.add(hl1, hl2, tl1, tl2);

  } else {
    const busGeo = new THREE.BoxGeometry(3.0, 2.6, 10.5);
    const bus = new THREE.Mesh(busGeo, bodyMat);
    bus.position.y = 1.65;
    bus.castShadow = true;

    const winGeo = new THREE.BoxGeometry(3.05, 0.8, 9.8);
    const win = new THREE.Mesh(winGeo, glassMat);
    win.position.y = 2.0;
    root.add(bus, win);

    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), headLightMat);
    hl1.position.set(-1.0, 0.8, 5.26);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), headLightMat);
    hl2.position.set(1.0, 0.8, 5.26);
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), tailLightMat);
    tl1.position.set(-1.0, 0.8, -5.26);
    const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), tailLightMat);
    tl2.position.set(1.0, 0.8, -5.26);
    root.add(hl1, hl2, tl1, tl2);
  }

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
 * Builds the Dynamic Multi-Modal Traffic & Autonomous Transit System across Classified Roads:
 * - East-West Northern Super-Expressway
 * - North-South Grand National Highway
 * - Western Airport-Seaport Expressway
 * - Eastern Innovation & SEZ Expressway
 * - Downtown Central Grand Boulevard
 * - Southern Coastal Marine Highway
 */
export function buildTrafficTransitSystem(): TrafficTransitInstance {
  const group = new THREE.Group();
  group.name = 'traffic_transit_system';

  const agents: AiTrafficAgent[] = [];
  const carColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0xf8fafc, 0x1e293b, 0x8b5cf6, 0x06b6d4];

  // Helper to add agent fleet
  const addTrafficFleet = (
    count: number,
    route: AiTrafficAgent['route'],
    startProgress: number,
    endProgress: number,
    baseSpeed: number,
    laneOffset: number
  ) => {
    for (let i = 0; i < count; i++) {
      const type: 'sedan' | 'truck' | 'bus' = i % 4 === 0 ? 'truck' : (i % 3 === 0 ? 'bus' : 'sedan');
      const color = carColors[(i * 3 + agents.length) % carColors.length];
      const mesh = createAiVehicleMesh(type, color);
      group.add(mesh);

      const span = endProgress - startProgress;
      const progress = startProgress + (i / count) * span;

      agents.push({
        mesh,
        type,
        route,
        progress,
        speed: baseSpeed + (Math.random() - 0.5) * 6,
        laneOffset,
      });
    }
  };

  // 1. East-West Super-Expressway (Z = -3000)
  addTrafficFleet(14, 'expressway_ew_east', -4800, 4800, 34, 10);
  addTrafficFleet(14, 'expressway_ew_west', 4800, -4800, 34, -10);

  // 2. North-South Grand National Highway (X = 0)
  addTrafficFleet(16, 'highway_ns_north', 4800, -4800, 26, -8);
  addTrafficFleet(16, 'highway_ns_south', -4800, 4800, 26, 8);

  // 3. Western Airport-Seaport Expressway (X = -3200)
  addTrafficFleet(12, 'west_expwy_south', -2800, 4400, 30, 8);
  addTrafficFleet(12, 'west_expwy_north', 4400, -2800, 30, -8);

  // 4. Eastern Innovation Expressway (X = +3200)
  addTrafficFleet(12, 'east_expwy_south', -2800, 4400, 30, 8);
  addTrafficFleet(12, 'east_expwy_north', 4400, -2800, 30, -8);

  // 5. Downtown Central Grand Boulevard (Z = 0)
  addTrafficFleet(12, 'downtown_east', -3000, 3000, 20, 6);
  addTrafficFleet(12, 'downtown_west', 3000, -3000, 20, -6);

  // 6. Southern Coastal Marine Highway (Z = +4500)
  addTrafficFleet(10, 'coastal_east', -4600, 4600, 24, 7);
  addTrafficFleet(10, 'coastal_west', 4600, -4600, 24, -7);

  // =========================================================================
  // UPDATE LOOP (DYNAMICS & TRAFFIC DISPATCH)
  // =========================================================================
  const update = (delta: number, _time: number) => {
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      // Route 1: Expressway East / West (Z = -3000)
      if (agent.route === 'expressway_ew_east') {
        agent.progress += agent.speed * delta;
        if (agent.progress > 4900) agent.progress = -4900;

        const px = agent.progress;
        const pz = -3000 + agent.laneOffset;
        const py = getVehicleElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = Math.PI / 2; // Facing East

      } else if (agent.route === 'expressway_ew_west') {
        agent.progress -= agent.speed * delta;
        if (agent.progress < -4900) agent.progress = 4900;

        const px = agent.progress;
        const pz = -3000 + agent.laneOffset;
        const py = getVehicleElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = -Math.PI / 2; // Facing West

      // Route 2: Highway North / South (X = 0)
      } else if (agent.route === 'highway_ns_north') {
        agent.progress -= agent.speed * delta;
        if (agent.progress < -4900) agent.progress = 4900;

        const px = agent.laneOffset;
        const pz = agent.progress;
        const py = getVehicleElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = Math.PI; // Facing North

      } else if (agent.route === 'highway_ns_south') {
        agent.progress += agent.speed * delta;
        if (agent.progress > 4900) agent.progress = -4900;

        const px = agent.laneOffset;
        const pz = agent.progress;
        const py = getVehicleElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = 0; // Facing South

      // Route 3: Western Airport-Seaport Expressway (X = -3200)
      } else if (agent.route === 'west_expwy_south') {
        agent.progress += agent.speed * delta;
        if (agent.progress > 4500) agent.progress = -2900;

        const px = -3200 + agent.laneOffset;
        const pz = agent.progress;
        const py = getVehicleElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = 0;

      } else if (agent.route === 'west_expwy_north') {
        agent.progress -= agent.speed * delta;
        if (agent.progress < -2900) agent.progress = 4500;

        const px = -3200 + agent.laneOffset;
        const pz = agent.progress;
        const py = getVehicleElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = Math.PI;

      // Route 4: Eastern Innovation Expressway (X = +3200)
      } else if (agent.route === 'east_expwy_south') {
        agent.progress += agent.speed * delta;
        if (agent.progress > 4500) agent.progress = -2900;

        const px = 3200 + agent.laneOffset;
        const pz = agent.progress;
        const py = getVehicleElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = 0;

      } else if (agent.route === 'east_expwy_north') {
        agent.progress -= agent.speed * delta;
        if (agent.progress < -2900) agent.progress = 4500;

        const px = 3200 + agent.laneOffset;
        const pz = agent.progress;
        const py = getVehicleElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = Math.PI;

      // Route 5: Downtown Central Boulevard (Z = 0)
      } else if (agent.route === 'downtown_east') {
        agent.progress += agent.speed * delta;
        if (agent.progress > 3100) agent.progress = -3100;

        const px = agent.progress;
        const pz = agent.laneOffset;
        const py = getVehicleElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = Math.PI / 2;

      } else if (agent.route === 'downtown_west') {
        agent.progress -= agent.speed * delta;
        if (agent.progress < -3100) agent.progress = 3100;

        const px = agent.progress;
        const pz = agent.laneOffset;
        const py = getVehicleElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = -Math.PI / 2;

      // Route 6: Southern Coastal Marine Highway (Z = +4500)
      } else if (agent.route === 'coastal_east') {
        agent.progress += agent.speed * delta;
        if (agent.progress > 4700) agent.progress = -4700;

        const px = agent.progress;
        const pz = 4500 + agent.laneOffset;
        const py = getVehicleElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = Math.PI / 2;

      } else if (agent.route === 'coastal_west') {
        agent.progress -= agent.speed * delta;
        if (agent.progress < -4700) agent.progress = 4700;

        const px = agent.progress;
        const pz = 4500 + agent.laneOffset;
        const py = getVehicleElevation(px, pz);

        agent.mesh.position.set(px, py + 0.1, pz);
        agent.mesh.rotation.y = -Math.PI / 2;
      }
    }
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
