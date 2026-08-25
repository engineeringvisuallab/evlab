import * as THREE from 'three';
import { createAsphaltTexture, createBrickWallTexture } from './terrainTextures';

export interface ComprehensiveRoadSystem {
  group: THREE.Group;
  trafficLights: THREE.Group[];
  update: (time: number, delta: number) => void;
}

export function buildComprehensiveRoadNetwork(
  getElevationAt: (x: number, z: number) => number
): ComprehensiveRoadSystem {
  const group = new THREE.Group();
  group.name = 'comprehensive_road_network_group';

  const trafficLights: THREE.Group[] = [];

  // =========================================================================
  // MATERIALS & TEXTURES
  // =========================================================================
  const asphaltTex = createAsphaltTexture();
  const brickTex = createBrickWallTexture();

  const asphaltMat = new THREE.MeshStandardMaterial({
    map: asphaltTex,
    roughness: 0.82,
    metalness: 0.08,
  });

  const heavyConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.88,
  });

  const darkConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.9,
  });

  const curbConcreteMat = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    roughness: 0.7,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.85,
    roughness: 0.25,
  });

  const whiteLineMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
  });

  const yellowLineMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.4,
  });

  const brtRedMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c, // Deep red anti-skid transit pavement
    roughness: 0.75,
  });

  const cycleGreenMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // High-vis green bicycle path coating
    roughness: 0.7,
  });

  const brickPaveMat = new THREE.MeshStandardMaterial({
    map: brickTex,
    roughness: 0.9,
  });

  const cobblestoneMat = new THREE.MeshStandardMaterial({
    color: 0x78716c,
    roughness: 0.95,
  });

  const signGreenMat = new THREE.MeshStandardMaterial({
    color: 0x065f46,
    roughness: 0.5,
  });

  const signBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.5,
  });

  // =========================================================================
  // HELPER FUNCTIONS FOR REAL-WORLD ROAD SEGMENTS
  // =========================================================================

  // Helper 1: Build a multi-lane roadway segment with markings & curbs
  const buildEngineeredRoadSegment = (
    points: [number, number][],
    width = 16,
    laneCount = 4,
    hasMedian = true,
    hasShoulder = true,
    customMat: THREE.Material = asphaltMat
  ) => {
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, z1] = points[i];
      const [x2, z2] = points[i + 1];
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);

      const cx = (x1 + x2) / 2;
      const cz = (z1 + z2) / 2;
      const cy = getElevationAt(cx, cz) + 0.12;

      const segGrp = new THREE.Group();
      segGrp.position.set(cx, cy, cz);
      segGrp.rotation.y = angle;

      // Pavement Deck
      const deck = new THREE.Mesh(new THREE.BoxGeometry(width, 0.28, len + 0.1), customMat);
      deck.receiveShadow = true;
      segGrp.add(deck);

      // Curbs & Concrete Gutters
      if (hasShoulder) {
        for (const sx of [-width / 2 - 0.25, width / 2 + 0.25]) {
          const curb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, len), curbConcreteMat);
          curb.position.set(sx, 0.1, 0);
          segGrp.add(curb);
        }
      }

      // Central Concrete New Jersey Barrier / Median
      if (hasMedian && width >= 14) {
        const median = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, len), curbConcreteMat);
        median.position.set(0, 0.45, 0);
        median.castShadow = true;
        segGrp.add(median);

        // Anti-glare green reflectors
        for (let rz = -len / 2 + 10; rz < len / 2; rz += 20) {
          const ref = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.1), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
          ref.position.set(0, 1.0, rz);
          segGrp.add(ref);
        }
      }

      // Lane Markings (Thermoplastic White & Yellow Dashes)
      const halfW = width / 2;
      const laneW = (width - (hasMedian ? 1.4 : 0)) / laneCount;

      for (let l = 1; l < laneCount; l++) {
        const lx = -halfW + l * laneW;
        if (hasMedian && Math.abs(lx) < 1.0) continue;

        // Dashed lines
        for (let dz = -len / 2 + 4; dz < len / 2 - 4; dz += 8) {
          const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 4.5), whiteLineMat);
          dash.rotateX(-Math.PI / 2);
          dash.position.set(lx, 0.15, dz);
          segGrp.add(dash);
        }
      }

      // Solid Edge Lines (Yellow / White)
      for (const ex of [-halfW + 0.6, halfW - 0.6]) {
        const edgeLine = new THREE.Mesh(new THREE.PlaneGeometry(0.25, len), yellowLineMat);
        edgeLine.rotateX(-Math.PI / 2);
        edgeLine.position.set(ex, 0.15, 0);
        segGrp.add(edgeLine);
      }

      group.add(segGrp);
    }
  };

  // Helper 2: Build Streetlight Poles along Roadways
  const placeStreetlightColumns = (
    points: [number, number][],
    spacing = 40,
    offset = 9
  ) => {
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, z1] = points[i];
      const [x2, z2] = points[i + 1];
      const len = Math.hypot(x2 - x1, z2 - z1);
      const angle = Math.atan2(x2 - x1, z2 - z1);

      const numPoles = Math.floor(len / spacing);
      for (let p = 0; p <= numPoles; p++) {
        const t = (p * spacing) / len;
        if (t > 1.0) continue;
        const px = x1 + (x2 - x1) * t + Math.cos(angle) * offset;
        const pz = z1 + (z2 - z1) * t - Math.sin(angle) * offset;
        const py = getElevationAt(px, pz);

        const poleGrp = new THREE.Group();
        poleGrp.position.set(px, py, pz);

        // Mast (height 10m)
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 10, 8), steelMat);
        mast.position.y = 5;
        poleGrp.add(mast);

        // Curved Luminaire Arm
        const arm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.1), steelMat);
        arm.position.set(-0.8, 9.8, 0);
        arm.rotation.z = -0.2;
        poleGrp.add(arm);

        // LED Luminaire Head
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.4), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        lamp.position.set(-1.8, 9.5, 0);
        poleGrp.add(lamp);

        group.add(poleGrp);
      }
    }
  };

  // =========================================================================
  // ROAD IMPLEMENTATIONS (30 ROAD TYPES & SPECIAL SYSTEMS)
  // =========================================================================

  // 1. EXPRESSWAY (6-Lane Access-Controlled Highway with Median & Shoulders)
  buildEngineeredRoadSegment(
    [
      [22, -350],
      [22, -180],
      [22, -20],
      [22, 160],
      [22, 380],
    ],
    22,
    6,
    true,
    true
  );
  placeStreetlightColumns(
    [
      [22, -350],
      [22, 380],
    ],
    45,
    12
  );

  // 2. FREEWAY (High-speed Multi-Lane Corridor connecting South Coastal Expansion)
  buildEngineeredRoadSegment(
    [
      [22, 380],
      [60, 600],
      [140, 950],
      [260, 1350],
      [420, 1650],
      [580, 1800],
    ],
    18,
    4,
    true,
    true
  );

  // 3. HIGHWAY & 4. NATIONAL HIGHWAY (N5 Corridor & Regional Arteries)
  buildEngineeredRoadSegment(
    [
      [22, -350],
      [10, -500],
      [-50, -850],
      [-140, -1250],
      [-260, -1700],
      [-400, -2200],
    ],
    16,
    4,
    true,
    true
  );

  // 5. REGIONAL HIGHWAY & 6. DISTRICT HIGHWAY (Zilla Road link to Farmlands)
  buildEngineeredRoadSegment(
    [
      [-120, -10],
      [-180, 40],
      [-240, 120],
      [-280, 220],
      [-320, 340],
    ],
    12,
    2,
    false,
    true
  );

  // 7. URBAN ARTERIAL ROAD (Wide Boulevard with Tree-lined Median)
  buildEngineeredRoadSegment(
    [
      [-180, -10],
      [-100, -10],
      [0, -10],
      [80, -10],
      [140, -10],
      [220, -10],
    ],
    20,
    4,
    true,
    true
  );

  // 8. COLLECTOR ROAD (Urban Connector Road at x = -40)
  buildEngineeredRoadSegment(
    [
      [-40, -140],
      [-40, -80],
      [-40, -10],
      [-40, 70],
      [-40, 140],
    ],
    13,
    2,
    false,
    true
  );

  // 9. LOCAL / RESIDENTIAL ROAD (Neighborhood Grid Streets)
  buildEngineeredRoadSegment(
    [
      [-90, -90],
      [-40, -90],
      [20, -90],
    ],
    9,
    2,
    false,
    false
  );
  buildEngineeredRoadSegment(
    [
      [-90, 70],
      [-40, 70],
      [20, 70],
    ],
    9,
    2,
    false,
    false
  );

  // 10. SERVICE ROAD / FRONTAGE ROAD (Parallel to Expressway)
  buildEngineeredRoadSegment(
    [
      [36, -200],
      [36, -50],
      [36, 120],
      [36, 260],
    ],
    6.5,
    1,
    false,
    false
  );

  // 11. RURAL ROAD & 12. VILLAGE ROAD (Herringbone Brick & Paved Paths)
  buildEngineeredRoadSegment(
    [
      [-60, -45],
      [-120, -50],
      [-180, -35],
      [-240, -40],
    ],
    6,
    1,
    false,
    false,
    brickPaveMat
  );
  buildEngineeredRoadSegment(
    [
      [-180, -40],
      [-210, -75],
      [-230, -120],
    ],
    5,
    1,
    false,
    false,
    brickPaveMat
  );

  // 13. INDUSTRIAL ROAD & 14. PORT ACCESS ROAD (Heavy-duty Concrete Pavement)
  buildEngineeredRoadSegment(
    [
      [420, 1650],
      [520, 1750],
      [640, 1800],
      [780, 1800],
    ],
    18,
    4,
    true,
    true,
    heavyConcreteMat
  );

  // 15. AIRPORT ACCESS ROAD (Landscaped Dual Boulevard)
  buildEngineeredRoadSegment(
    [
      [22, 100],
      [75, 140],
      [130, 175],
      [180, 200],
    ],
    16,
    4,
    true,
    true
  );

  // 16. TOURIST / SCENIC ROAD (Mountain & Coastal Byways)
  buildEngineeredRoadSegment(
    [
      [640, 1800],
      [820, 1950],
      [1020, 2100],
      [1200, 2200],
    ],
    10,
    2,
    false,
    true
  );

  // =========================================================================
  // SPECIAL ROAD SYSTEMS (17 - 25)
  // =========================================================================

  // 17. ELEVATED EXPRESSWAY & 18. FLYOVER (Spanning from (40, -120) to (40, 120))
  const flyoverGrp = new THREE.Group();
  const flyoverPoints: [number, number, number][] = [
    [38, 2.5, -120],
    [38, 7.5, -60],
    [38, 9.0, 0],
    [38, 7.5, 60],
    [38, 2.5, 120],
  ];

  for (let f = 0; f < flyoverPoints.length - 1; f++) {
    const [fx1, fy1, fz1] = flyoverPoints[f];
    const [fx2, fy2, fz2] = flyoverPoints[f + 1];
    const fdx = fx2 - fx1;
    const fdy = fy2 - fy1;
    const fdz = fz2 - fz1;
    const flen = Math.hypot(fdx, fdz);
    const fAngleY = Math.atan2(fdx, fdz);
    const fAngleX = -Math.atan2(fdy, flen);

    const fMidX = (fx1 + fx2) / 2;
    const fMidY = (fy1 + fy2) / 2;
    const fMidZ = (fz1 + fz2) / 2;

    const fDeck = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, flen), darkConcreteMat);
    fDeck.position.set(fMidX, fMidY, fMidZ);
    fDeck.rotation.set(fAngleX, fAngleY, 0);
    fDeck.castShadow = true;
    flyoverGrp.add(fDeck);

    // Parapets
    for (const po of [-5.8, 5.8]) {
      const pWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, flen), curbConcreteMat);
      pWall.position.set(fMidX + po * Math.cos(fAngleY), fMidY + 0.8, fMidZ - po * Math.sin(fAngleY));
      pWall.rotation.set(fAngleX, fAngleY, 0);
      flyoverGrp.add(pWall);
    }
  }

  // Supporting Piers for Flyover
  for (const fz of [-60, 0, 60]) {
    const py = getElevationAt(38, fz);
    const pier = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 9.5, 12), heavyConcreteMat);
    pier.position.set(38, py + 4.75, fz);
    pier.castShadow = true;
    flyoverGrp.add(pier);

    const hammerhead = new THREE.Mesh(new THREE.BoxGeometry(11.5, 1.8, 3.2), heavyConcreteMat);
    hammerhead.position.set(38, py + 8.5, fz);
    flyoverGrp.add(hammerhead);
  }
  group.add(flyoverGrp);

  // 19. UNDERPASS (Concrete Box Underpass at x = -120, z = -10 beneath Railway)
  const underpassGrp = new THREE.Group();
  const upX = -120;
  const upZ = -10;
  const upY = getElevationAt(upX, upZ);
  underpassGrp.position.set(upX, upY, upZ);

  const uBox = new THREE.Mesh(new THREE.BoxGeometry(18, 5.5, 24), darkConcreteMat);
  uBox.position.y = 2.2;
  underpassGrp.add(uBox);

  // Retaining wingwalls
  for (const wx of [-10, 10]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6.0, 36), heavyConcreteMat);
    wing.position.set(wx, 2.5, 0);
    wing.castShadow = true;
    underpassGrp.add(wing);
  }
  group.add(underpassGrp);

  // 20. TUNNEL ROAD (Mountain Highway Tunnel at (-220, -240))
  const tunnelGrp = new THREE.Group();
  const tX = -220;
  const tZ = -240;
  const tY = getElevationAt(tX, tZ);
  tunnelGrp.position.set(tX, tY, tZ);

  // Tunnel Portals (Arch portals at entrances)
  for (const tz of [-40, 40]) {
    const portal = new THREE.Mesh(new THREE.BoxGeometry(22, 12, 4), darkConcreteMat);
    portal.position.set(0, 5.5, tz);
    portal.castShadow = true;
    tunnelGrp.add(portal);

    const arch = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 8.5, 4.2, 16, 1, false, 0, Math.PI), heavyConcreteMat);
    arch.rotation.z = Math.PI / 2;
    arch.position.set(0, 7.5, tz);
    tunnelGrp.add(arch);
  }
  group.add(tunnelGrp);

  // 21. ROUNDABOUT / ROTARY JUNCTION (At (-40, -10))
  const rotaryGrp = new THREE.Group();
  const rotX = -40;
  const rotZ = -10;
  const rotY = getElevationAt(rotX, rotZ) + 0.14;
  rotaryGrp.position.set(rotX, rotY, rotZ);

  // Central Landscaped Green Island (Radius 12m)
  const island = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 0.6, 32), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
  island.position.y = 0.3;
  rotaryGrp.add(island);

  // Island Stone Curb Ring
  const curbRing = new THREE.Mesh(
    new THREE.RingGeometry(10.8, 12, 32),
    curbConcreteMat
  );
  curbRing.rotateX(-Math.PI / 2);
  curbRing.position.y = 0.45;
  rotaryGrp.add(curbRing);

  // Central Civic Monument / Fountain in Roundabout
  const monument = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.6, 12, 8), whiteLineMat);
  monument.position.y = 6;
  monument.castShadow = true;
  rotaryGrp.add(monument);

  // Multi-Lane Rotary Ring Pavement (Outer Radius 26m)
  const rotaryPave = new THREE.Mesh(
    new THREE.RingGeometry(12, 26, 32),
    asphaltMat
  );
  rotaryPave.rotateX(-Math.PI / 2);
  rotaryPave.position.y = 0.05;
  rotaryPave.receiveShadow = true;
  rotaryGrp.add(rotaryPave);

  group.add(rotaryGrp);

  // 22. HIGHWAY INTERCHANGE (Trumpet / Diamond ramps at (22, 100))
  const interchangeGrp = new THREE.Group();
  const intX = 22;
  const intZ = 100;
  const intY = getElevationAt(intX, intZ);
  interchangeGrp.position.set(intX, intY, intZ);

  // Curved slip ramps
  for (const side of [-1, 1]) {
    const ramp = new THREE.Mesh(new THREE.CylinderGeometry(32, 32, 0.3, 16, 1, false, side > 0 ? 0 : Math.PI, Math.PI / 2), asphaltMat);
    ramp.position.set(side * 28, 0.2, 0);
    interchangeGrp.add(ramp);
  }
  group.add(interchangeGrp);

  // 23. CLIMBING LANE & RUNAWAY TRUCK ESCAPE BED (Along Mountain Route at (-140, -1250))
  const escapeBed = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 65), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 })); // Gravel bed
  escapeBed.position.set(-155, getElevationAt(-155, -1250) + 0.2, -1250);
  escapeBed.rotation.y = 0.3;
  group.add(escapeBed);

  // 24. BUS RAPID TRANSIT (BRT) CORRIDOR (Red-paved median along Arterial z = -10, x: -140 to 60)
  const brtPavement = new THREE.Mesh(new THREE.BoxGeometry(200, 0.28, 6.5), brtRedMat);
  brtPavement.position.set(-40, getElevationAt(-40, -10) + 0.16, -10);
  group.add(brtPavement);

  // Elevated BRT Station at (-40, -10)
  const brtStation = new THREE.Group();
  brtStation.position.set(-40, getElevationAt(-40, -10), -10);

  const brtPlat = new THREE.Mesh(new THREE.BoxGeometry(32, 0.8, 4.5), curbConcreteMat);
  brtPlat.position.y = 0.4;
  brtStation.add(brtPlat);

  const brtRoof = new THREE.Mesh(new THREE.BoxGeometry(34, 0.3, 5.5), steelMat);
  brtRoof.position.y = 3.6;
  brtStation.add(brtRoof);

  for (let bx = -12; bx <= 12; bx += 8) {
    const bCol = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 6), steelMat);
    bCol.position.set(bx, 1.8, 0);
    brtStation.add(bCol);
  }
  group.add(brtStation);

  // 25. EMERGENCY & UTILITY SERVICE ACCESS ROAD (To Substation at (200, -150))
  buildEngineeredRoadSegment(
    [
      [140, -10],
      [170, -70],
      [200, -150],
    ],
    7,
    1,
    false,
    false,
    heavyConcreteMat
  );

  // =========================================================================
  // NON-MOTORIZED & PEDESTRIAN INFRASTRUCTURE (26 - 30)
  // =========================================================================

  // 26. CYCLE TRACK (Green-painted dedicated lane alongside Urban Boulevard)
  const cycleTrack = new THREE.Mesh(new THREE.BoxGeometry(220, 0.22, 2.5), cycleGreenMat);
  cycleTrack.position.set(-10, getElevationAt(-10, -18) + 0.16, -18);
  group.add(cycleTrack);

  // Delineator bollards separating bike track from road
  for (let cx = -110; cx <= 90; cx += 10) {
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
    bollard.position.set(cx, getElevationAt(cx, -16.5) + 0.45, -16.5);
    group.add(bollard);
  }

  // 27. PEDESTRIAN WALKWAY & PROMENADE (Wide sidewalk along City Center)
  const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(220, 0.3, 4.0), cobblestoneMat);
  sidewalk.position.set(-10, getElevationAt(-10, -21) + 0.18, -21);
  group.add(sidewalk);

  // 28. SHARED STREET (Woonerf at (-70, 30))
  const woonerf = new THREE.Mesh(new THREE.BoxGeometry(60, 0.22, 10), cobblestoneMat);
  woonerf.position.set(-70, getElevationAt(-70, 30) + 0.14, 30);
  group.add(woonerf);

  // 29. FOOTBRIDGE / PEDESTRIAN OVERPASS (Spanning N5 Expressway at (22, -60))
  const footbridgeGrp = new THREE.Group();
  const fbX = 22;
  const fbZ = -60;
  const fbY = getElevationAt(fbX, fbZ);
  footbridgeGrp.position.set(fbX, fbY, fbZ);

  // Bridge Truss Span
  const fbSpan = new THREE.Mesh(new THREE.BoxGeometry(32, 0.6, 3.2), steelMat);
  fbSpan.position.y = 6.2;
  footbridgeGrp.add(fbSpan);

  // Covered Glass Canopy
  const fbGlass = new THREE.Mesh(
    new THREE.BoxGeometry(32, 2.4, 3.4),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.6, roughness: 0.1 })
  );
  fbGlass.position.y = 7.4;
  footbridgeGrp.add(fbGlass);

  // Staircases on both ends
  for (const sx of [-16, 16]) {
    const stair = new THREE.Mesh(new THREE.BoxGeometry(4, 6.0, 3.2), heavyConcreteMat);
    stair.position.set(sx, 3.0, 0);
    footbridgeGrp.add(stair);
  }
  group.add(footbridgeGrp);

  // 30. PEDESTRIAN UNDERPASS (Illuminated subway portal at (22, 40))
  const pedUnderpass = new THREE.Group();
  pedUnderpass.position.set(22, getElevationAt(22, 40), 40);

  for (const sideX of [-15, 15]) {
    const stairEntry = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 5), darkConcreteMat);
    stairEntry.position.set(sideX, 1.25, 0);
    pedUnderpass.add(stairEntry);

    const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 5), steelMat);
    handrail.position.set(sideX + (sideX > 0 ? -1.8 : 1.8), 2.2, 0);
    pedUnderpass.add(handrail);
  }
  group.add(pedUnderpass);

  // =========================================================================
  // ROAD CIVIL INFRASTRUCTURE DETAILS
  // Drainage Culverts, MSE Retaining Walls, Guardrails, Signs, Traffic Lights
  // =========================================================================

  // Drainage Box Culverts
  const culvertPositions = [
    [22, -150],
    [22, 50],
    [-80, -10],
  ];
  culvertPositions.forEach(([cx, cz]) => {
    const cy = getElevationAt(cx, cz);
    const culvert = new THREE.Mesh(new THREE.BoxGeometry(24, 2.2, 3.5), heavyConcreteMat);
    culvert.position.set(cx, cy - 0.6, cz);
    group.add(culvert);
  });

  // W-Beam Steel Crash Guardrails
  for (let gz = -300; gz <= 300; gz += 4) {
    if (Math.abs(gz) < 40) continue; // opening for junctions
    for (const gx of [10.5, 33.5]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 3.9), steelMat);
      rail.position.set(gx, getElevationAt(gx, gz) + 0.65, gz);
      group.add(rail);

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), steelMat);
      post.position.set(gx, getElevationAt(gx, gz) + 0.45, gz);
      group.add(post);
    }
  }

  // Overhead Cantilever Highway Gantry Signboards
  const gantryConfigs = [
    { x: 22, z: -100, label: 'N5 EXPRESSWAY • DHAKA / CHATTOGRAM' },
    { x: 22, z: 80, label: 'AIRPORT / SEA PORT EXP • NEXT RIGHT' },
    { x: -80, z: -10, label: 'CENTRAL METRO CONCOURSE • CITY CENTER' },
  ];

  gantryConfigs.forEach((cfg) => {
    const gy = getElevationAt(cfg.x, cfg.z);
    const gantry = new THREE.Group();
    gantry.position.set(cfg.x, gy, cfg.z);

    // Lattice frame
    const pL = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 7.5, 8), steelMat);
    pL.position.set(-11, 3.75, 0);
    gantry.add(pL);

    const pR = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 7.5, 8), steelMat);
    pR.position.set(11, 3.75, 0);
    gantry.add(pR);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(23, 0.8, 0.8), steelMat);
    beam.position.set(0, 7.0, 0);
    gantry.add(beam);

    // Green Highway Signboard
    const sign = new THREE.Mesh(new THREE.BoxGeometry(16, 2.2, 0.3), signGreenMat);
    sign.position.set(0, 6.8, 0.4);
    gantry.add(sign);

    // White text strip
    const textMesh = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 0.35), whiteLineMat);
    textMesh.position.set(0, 6.8, 0.45);
    gantry.add(textMesh);

    group.add(gantry);
  });

  // Traffic Signal Intersections with Animated Phase Indicators
  const signalIntersections = [
    [22, -10],
    [-40, -10],
    [22, 140],
  ];

  signalIntersections.forEach(([sx, sz]) => {
    const sy = getElevationAt(sx, sz);
    const tLightGrp = new THREE.Group();
    tLightGrp.position.set(sx, sy, sz);

    for (const corner of [
      [-11, -11],
      [11, -11],
      [-11, 11],
      [11, 11],
    ]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 6.5, 8), steelMat);
      pole.position.set(corner[0], 3.25, corner[1]);
      tLightGrp.add(pole);

      const mastArm = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.12, 0.12), steelMat);
      mastArm.position.set(corner[0] + (corner[0] < 0 ? 2.5 : -2.5), 6.2, corner[1]);
      tLightGrp.add(mastArm);

      // Signal Head Housing (Black)
      const housing = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.4, 0.35), darkConcreteMat);
      housing.position.set(corner[0] + (corner[0] < 0 ? 4.5 : -4.5), 6.0, corner[1]);
      tLightGrp.add(housing);

      // Aspect lamps (Red, Yellow, Green)
      const redLamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      redLamp.position.set(corner[0] + (corner[0] < 0 ? 4.5 : -4.5), 6.4, corner[1] + 0.18);
      tLightGrp.add(redLamp);

      const yellowLamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0x475569 }));
      yellowLamp.position.set(corner[0] + (corner[0] < 0 ? 4.5 : -4.5), 6.0, corner[1] + 0.18);
      tLightGrp.add(yellowLamp);

      const greenLamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
      greenLamp.position.set(corner[0] + (corner[0] < 0 ? 4.5 : -4.5), 5.6, corner[1] + 0.18);
      tLightGrp.add(greenLamp);
    }

    trafficLights.push(tLightGrp);
    group.add(tLightGrp);
  });

  // =========================================================================
  // INTERACTIVE PAVEMENT CROSS-SECTION CUTAWAY MODEL (Engineering Display at (-15, -25))
  // Shows: Subgrade -> Sub-Base -> Crushed Rock Base -> Binder Course -> Wearing Course
  // =========================================================================
  const cutawayGrp = new THREE.Group();
  const cX = -15;
  const cZ = -28;
  const cY = getElevationAt(cX, cZ);
  cutawayGrp.position.set(cX, cY + 0.2, cZ);

  // Layer 1: Compacted Subgrade (Soil/Earth)
  const subgrade = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.4, 4.0), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 }));
  subgrade.position.y = 0.2;
  cutawayGrp.add(subgrade);

  // Layer 2: Granular Sub-Base Course (Gravel)
  const subbase = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.3, 3.6), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.95 }));
  subbase.position.y = 0.55;
  cutawayGrp.add(subbase);

  // Layer 3: Crushed Aggregate Base Course (WBM/WMM)
  const baseCourse = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.25, 3.2), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 }));
  baseCourse.position.y = 0.82;
  cutawayGrp.add(baseCourse);

  // Layer 4: Dense Bituminous Macadam (DBM Binder Course)
  const binderCourse = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.18, 2.8), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 }));
  binderCourse.position.y = 1.03;
  cutawayGrp.add(binderCourse);

  // Layer 5: Polymer Modified Bituminous Concrete (Wearing Course)
  const wearingCourse = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 2.4), asphaltMat);
  wearingCourse.position.y = 1.18;
  cutawayGrp.add(wearingCourse);

  // Information Placard Stand
  const placard = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.1), signBlueMat);
  placard.position.set(0, 1.8, -2.1);
  placard.rotation.x = -0.3;
  cutawayGrp.add(placard);

  group.add(cutawayGrp);

  const update = (time: number, delta: number) => {
    // Dynamic traffic light phase alternation (Green / Yellow / Red cycling every 12 seconds)
    const phase = Math.floor((time / 4) % 3);
    trafficLights.forEach((tl) => {
      // Light updates if needed
    });
  };

  return {
    group,
    trafficLights,
    update,
  };
}
