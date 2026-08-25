import * as THREE from 'three';

export interface RichInfrastructureResult {
  group: THREE.Group;
  smokeParticles: THREE.Points[];
  updateAnimation: (time: number, delta: number) => void;
}

export function buildRichInfrastructure(
  getElevationAt: (x: number, z: number) => number
): RichInfrastructureResult {
  const group = new THREE.Group();
  group.name = 'rich_reference_infrastructure_group';

  // Shared Realistic Materials
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.1 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
  const darkConcreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.7 });
  const yellowCraneMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4, metalness: 0.5 });
  const glassBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });
  const redCrossMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
  const greenFieldMat1 = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.9 });
  const greenFieldMat2 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.85 });
  const goldenPaddyMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.8 });
  const waterBasinMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.4 });
  const brickTerracottaMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

  const smokeParticlesList: THREE.Points[] = [];

  // =========================================================================
  // 1. GENERAL HOSPITAL & MEDICAL TRAUMA CENTER (At (-75, -55))
  // =========================================================================
  const hospGrp = new THREE.Group();
  const hx = -75;
  const hz = -55;
  const hy = getElevationAt(hx, hz);

  // Main Multi-Wing Hospital Building
  const hospMain = new THREE.Mesh(new THREE.BoxGeometry(28, 20, 22), whiteMat);
  hospMain.position.set(0, 10, 0);
  hospMain.castShadow = true;
  hospMain.receiveShadow = true;
  hospGrp.add(hospMain);

  // Side Ward Wing
  const hospSide = new THREE.Mesh(new THREE.BoxGeometry(20, 14, 18), whiteMat);
  hospSide.position.set(-20, 7, 2);
  hospSide.castShadow = true;
  hospGrp.add(hospSide);

  // Glass Ribbon Windows
  for (let f = 1; f <= 4; f++) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(28.2, 1.6, 22.2), glassBlueMat);
    strip.position.set(0, f * 4.2, 0);
    hospGrp.add(strip);
  }

  // Emergency Drop-off Portico & Canopy
  const erCanopy = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 10), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
  erCanopy.position.set(0, 4.2, 14);
  erCanopy.castShadow = true;
  hospGrp.add(erCanopy);

  for (const cx of [-6, 6]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4.2, 8), steelMat);
    col.position.set(cx, 2.1, 17);
    hospGrp.add(col);
  }

  // Hospital Sign & Red Cross Emblem
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 0.3), redCrossMat);
  crossH.position.set(0, 18, 11.2);
  hospGrp.add(crossH);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.2, 0.3), redCrossMat);
  crossV.position.set(0, 18, 11.2);
  hospGrp.add(crossV);

  // Rooftop Emergency Helipad
  const helipad = new THREE.Mesh(
    new THREE.RingGeometry(2.8, 5.2, 16),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
  );
  helipad.rotateX(-Math.PI / 2);
  helipad.position.set(0, 20.1, 0);
  hospGrp.add(helipad);

  // Parked Ambulances in ER Bay
  for (const ax of [-4, 4]) {
    const amb = new THREE.Group();
    const ambBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 6.2), whiteMat);
    ambBody.position.y = 1.1;
    amb.add(ambBody);

    const ambStripe = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.4, 6.3), redCrossMat);
    ambStripe.position.y = 1.1;
    amb.add(ambStripe);

    const siren = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.3, 1.2),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
    );
    siren.position.set(0, 2.15, 0);
    amb.add(siren);

    amb.position.set(ax, 0, 14);
    hospGrp.add(amb);
  }

  // Hospital Parking Lot with Paved Spaces & Parked Cars
  const hospPave = new THREE.Mesh(new THREE.BoxGeometry(45, 0.2, 22), asphaltMat);
  hospPave.position.set(-8, 0.1, 22);
  hospPave.receiveShadow = true;
  hospGrp.add(hospPave);

  const carColors = [0x2563eb, 0xdc2626, 0xf8fafc, 0x16a34a, 0x475569, 0x0284c7];
  for (let c = 0; c < 6; c++) {
    const car = new THREE.Group();
    const carMat = new THREE.MeshStandardMaterial({ color: carColors[c % carColors.length], roughness: 0.3 });
    const cBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 4.4), carMat);
    cBody.position.y = 0.55;
    car.add(cBody);
    const cCabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.75, 2.4), glassBlueMat);
    cCabin.position.set(0, 1.25, -0.3);
    car.add(cCabin);
    car.position.set(-24 + c * 5.2, 0.1, 24);
    hospGrp.add(car);
  }

  hospGrp.position.set(hx, hy, hz);
  group.add(hospGrp);

  // =========================================================================
  // 2. ACTIVE CIVIL CONSTRUCTION SITE & TOWER CRANE (At (-30, -55))
  // =========================================================================
  const siteGrp = new THREE.Group();
  const sx = -30;
  const sz = -55;
  const sy = getElevationAt(sx, sz);

  // Excavation Pit / Earthen Foundation Slope (Width 42m, Depth 3.5m)
  const pitSoil = new THREE.Mesh(
    new THREE.BoxGeometry(38, 0.3, 34),
    new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.95 })
  );
  pitSoil.position.set(0, 0.05, 0);
  pitSoil.receiveShadow = true;
  siteGrp.add(pitSoil);

  // Perimeter Corrugated Construction Hoarding Fence (Blue & Galvanized metal)
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
  for (const fz of [-17.5, 17.5]) {
    const fWall = new THREE.Mesh(new THREE.BoxGeometry(39, 2.6, 0.4), fenceMat);
    fWall.position.set(0, 1.3, fz);
    fWall.castShadow = true;
    siteGrp.add(fWall);
  }
  for (const fx of [-19.5, 19.5]) {
    const fWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.6, 35), fenceMat);
    fWall.position.set(fx, 1.3, 0);
    fWall.castShadow = true;
    siteGrp.add(fWall);
  }

  // Giant Yellow Lattice Tower Crane
  const crane = new THREE.Group();
  // Mast (Height 42m)
  const mast = new THREE.Mesh(new THREE.BoxGeometry(1.6, 42, 1.6), yellowCraneMat);
  mast.position.y = 21;
  mast.castShadow = true;
  crane.add(mast);

  // Operator Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.2), glassBlueMat);
  cabin.position.set(0.8, 39, 0);
  crane.add(cabin);

  // Horizontal Jib Boom (Extends 38m forward)
  const jib = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 46), yellowCraneMat);
  jib.position.set(0, 42, 14);
  jib.castShadow = true;
  crane.add(jib);

  // Counterweight Blocks
  const cWeight = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 4.5), darkConcreteMat);
  cWeight.position.set(0, 42, -7.5);
  cWeight.castShadow = true;
  crane.add(cWeight);

  // Hoist Cable & Hook Assembly
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 18, 4), steelMat);
  cable.position.set(0, 32, 18);
  crane.add(cable);

  const hook = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), yellowCraneMat);
  hook.position.set(0, 23, 18);
  crane.add(hook);

  crane.position.set(6, 0, -4);
  siteGrp.add(crane);

  // Concrete Foundation Pillars & Rebar Cages in Pit
  const rebarMat = new THREE.MeshStandardMaterial({ color: 0x475569, wireframe: true });
  for (let px = -12; px <= 12; px += 8) {
    for (let pz = -8; pz <= 8; pz += 8) {
      const colBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.2, 2.8), concreteMat);
      colBase.position.set(px, 1.6, pz);
      colBase.castShadow = true;
      siteGrp.add(colBase);

      const rebar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 5.5, 2.4), rebarMat);
      rebar.position.set(px, 4.5, pz);
      siteGrp.add(rebar);
    }
  }

  // Hydraulic Crawler Excavator (Yellow)
  const exc = new THREE.Group();
  const excTracks = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.0, 5.2), darkConcreteMat);
  excTracks.position.y = 0.5;
  exc.add(excTracks);

  const excBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.0, 3.6), yellowCraneMat);
  excBody.position.set(0, 1.8, -0.4);
  exc.add(excBody);

  const excBoom = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 6.5), yellowCraneMat);
  excBoom.position.set(0, 3.2, 2.6);
  excBoom.rotation.x = -0.6;
  exc.add(excBoom);

  const excBucket = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.4), darkConcreteMat);
  excBucket.position.set(0, 1.2, 5.8);
  exc.add(excBucket);

  exc.position.set(-10, 0, 8);
  exc.rotation.y = 0.45;
  siteGrp.add(exc);

  // Concrete Transit Mixer Truck
  const mixer = new THREE.Group();
  const mChassis = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 7.5), whiteMat);
  mChassis.position.y = 0.8;
  mixer.add(mChassis);

  const mDrum = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 4.5, 12), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }));
  mDrum.rotation.x = Math.PI / 2 + 0.3;
  mDrum.position.set(0, 2.4, -0.8);
  mixer.add(mDrum);

  mixer.position.set(12, 0, 6);
  mixer.rotation.y = -0.6;
  siteGrp.add(mixer);

  // Gravel & Sand Aggregate Mounds
  for (const mx of [-14, 14]) {
    const mound = new THREE.Mesh(
      new THREE.ConeGeometry(3.6, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 })
    );
    mound.position.set(mx, 1.1, -10);
    siteGrp.add(mound);
  }

  siteGrp.position.set(sx, sy, sz);
  group.add(siteGrp);

  // =========================================================================
  // 3. GRAND MOSQUE & HISTORIC TERRACOTTA TEMPLE COMPLEX (At (70, -50))
  // =========================================================================
  const heritageGrp = new THREE.Group();
  const hmx = 70;
  const hmz = -50;
  const hmy = getElevationAt(hmx, hmz);

  // Landscaped Courtyard Plinth
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(46, 0.8, 38),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
  );
  plinth.position.y = 0.4;
  plinth.receiveShadow = true;
  heritageGrp.add(plinth);

  // Main Prayer Hall Structure (White polished marble look)
  const prayerHall = new THREE.Mesh(new THREE.BoxGeometry(24, 11, 20), whiteMat);
  prayerHall.position.set(-6, 6.3, 0);
  prayerHall.castShadow = true;
  heritageGrp.add(prayerHall);

  // Central Grand White Dome with Gold Finial
  const domeGeo = new THREE.SphereGeometry(6.5, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, whiteMat);
  dome.position.set(-6, 11.8, 0);
  dome.castShadow = true;
  heritageGrp.add(dome);

  const domeSpire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.4, 3.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 })
  );
  domeSpire.position.set(-6, 19.5, 0);
  heritageGrp.add(domeSpire);

  // 4 Corner Slender Minarets (Height 26m)
  const minaretCoords = [
    [-18, -10],
    [-18, 10],
    [6, -10],
    [6, 10],
  ];
  minaretCoords.forEach(([mx, mz]) => {
    const minaret = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 24, 12), whiteMat);
    shaft.position.y = 12;
    shaft.castShadow = true;
    minaret.add(shaft);

    const mDome = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), whiteMat);
    mDome.position.y = 24;
    minaret.add(mDome);

    const mFinial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.2, 2.4, 6),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 })
    );
    mFinial.position.y = 26.2;
    minaret.add(mFinial);

    minaret.position.set(mx, 0.8, mz);
    heritageGrp.add(minaret);
  });

  // Ancient Terracotta Heritage Temple (Right side of plaza)
  const temple = new THREE.Group();
  const tBase = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 10), brickTerracottaMat);
  tBase.position.y = 3;
  tBase.castShadow = true;
  temple.add(tBase);

  // Tiered Sikhara Curved Spire
  for (let s = 1; s <= 4; s++) {
    const tTier = new THREE.Mesh(
      new THREE.BoxGeometry(10 - s * 1.8, 2.4, 10 - s * 1.8),
      brickTerracottaMat
    );
    tTier.position.y = 6 + (s - 0.5) * 2.2;
    tTier.castShadow = true;
    temple.add(tTier);
  }

  const kalasha = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 })
  );
  kalasha.position.y = 15.5;
  temple.add(kalasha);

  temple.position.set(16, 0.8, 0);
  heritageGrp.add(temple);

  heritageGrp.position.set(hmx, hmy, hmz);
  group.add(heritageGrp);

  // =========================================================================
  // 4. CENTRAL URBAN PARK & CHILDREN'S PLAYGROUND (At (-30, -20))
  // =========================================================================
  const parkGrp = new THREE.Group();
  const pkX = -30;
  const pkZ = -20;
  const pkY = getElevationAt(pkX, pkZ);

  // Manicured Grass Lawn (Width 32m, Depth 22m)
  const parkLawn = new THREE.Mesh(new THREE.BoxGeometry(30, 0.2, 20), greenFieldMat1);
  parkLawn.position.y = 0.1;
  parkLawn.receiveShadow = true;
  parkGrp.add(parkLawn);

  // Stone Walking Path Loop
  const pathMesh = new THREE.Mesh(
    new THREE.RingGeometry(5.5, 7.5, 20),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8, side: THREE.DoubleSide })
  );
  pathMesh.rotateX(-Math.PI / 2);
  pathMesh.position.set(0, 0.22, 0);
  parkGrp.add(pathMesh);

  // Playground Slide (Yellow & Red)
  const slide = new THREE.Group();
  const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.5, 0.4), steelMat);
  ladder.position.set(-1.8, 1.25, 0);
  slide.add(ladder);

  const chute = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 0.9), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
  chute.position.set(0, 1.25, 0);
  chute.rotation.z = -0.45;
  slide.add(chute);
  slide.position.set(-6, 0.2, 3);
  parkGrp.add(slide);

  // Children's Swing Set
  const swing = new THREE.Group();
  const sFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.6, 1.8), steelMat);
  sFrame.position.y = 1.3;
  swing.add(sFrame);
  swing.position.set(6, 0.2, 3);
  parkGrp.add(swing);

  // Park Shaded Gazebo Pavilion
  const gazebo = new THREE.Group();
  for (let g = 0; g < 4; g++) {
    const angle = (g * Math.PI) / 2;
    const gCol = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 6), steelMat);
    gCol.position.set(Math.cos(angle) * 2.2, 1.6, Math.sin(angle) * 2.2);
    gazebo.add(gCol);
  }
  const gRoof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 1.4, 4), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
  gRoof.position.y = 3.8;
  gRoof.rotation.y = Math.PI / 4;
  gazebo.add(gRoof);
  gazebo.position.set(0, 0.2, -4);
  parkGrp.add(gazebo);

  // Park Benches & Flowering Trees
  for (const bx of [-8, 8]) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.8), new THREE.MeshStandardMaterial({ color: 0x854d0e }));
    bench.position.set(bx, 0.4, -4);
    parkGrp.add(bench);
  }

  parkGrp.position.set(pkX, pkY, pkZ);
  group.add(parkGrp);

  // =========================================================================
  // 5. URBAN GAS & FUEL SERVICE STATION (At (-12, -22))
  // =========================================================================
  const gasGrp = new THREE.Group();
  const gx = -12;
  const gz = -22;
  const gy = getElevationAt(gx, gz);

  // Station Pavement Forecourt
  const forecourt = new THREE.Mesh(new THREE.BoxGeometry(22, 0.2, 18), asphaltMat);
  forecourt.position.y = 0.1;
  forecourt.receiveShadow = true;
  gasGrp.add(forecourt);

  // Overhead Illuminated Fuel Canopy
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.9, 11),
    new THREE.MeshStandardMaterial({ color: 0x16a34a }) // Green Brand
  );
  canopy.position.set(0, 4.5, 2);
  canopy.castShadow = true;
  gasGrp.add(canopy);

  // Canopy Support Columns
  for (const cx of [-5.5, 5.5]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4.5, 8), whiteMat);
    col.position.set(cx, 2.25, 2);
    gasGrp.add(col);
  }

  // 4 Fuel Dispenser Pumps
  for (const px of [-3.5, 3.5]) {
    for (const pz of [0, 4]) {
      const pump = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 1.8, 1.4),
        new THREE.MeshStandardMaterial({ color: 0xdc2626 })
      );
      pump.position.set(px, 1.0, pz);
      gasGrp.add(pump);
    }
  }

  // Convenience Mart Shop
  const shop = new THREE.Mesh(new THREE.BoxGeometry(12, 4.2, 6), whiteMat);
  shop.position.set(0, 2.1, -6);
  shop.castShadow = true;
  gasGrp.add(shop);

  const shopGlass = new THREE.Mesh(new THREE.BoxGeometry(10, 2.6, 0.3), glassBlueMat);
  shopGlass.position.set(0, 2.0, -2.9);
  gasGrp.add(shopGlass);

  // Tall Illuminated Price Totem Sign
  const totem = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7.5, 0.6), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
  totem.position.set(-9, 3.75, 7);
  gasGrp.add(totem);

  const totemLed = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 2.4, 0.7),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 1.2 })
  );
  totemLed.position.set(-9, 5.5, 7);
  gasGrp.add(totemLed);

  gasGrp.position.set(gx, gy, gz);
  group.add(gasGrp);

  // =========================================================================
  // 6. MULTI-LEVEL HIGHWAY INTERCHANGE & CURVED FLYOVER RAMP (At (38, -22))
  // =========================================================================
  const flyoverGrp = new THREE.Group();
  const foX = 38;
  const foZ = -22;
  const foY = getElevationAt(foX, foZ);

  // Elevated Curved Flyover Ramp using CatmullRom Curve
  const rampPoints = [
    new THREE.Vector3(-25, 0.5, -20),
    new THREE.Vector3(-5, 4.5, -12),
    new THREE.Vector3(15, 8.5, 0),
    new THREE.Vector3(25, 8.5, 20),
    new THREE.Vector3(15, 5.5, 40),
    new THREE.Vector3(-10, 1.2, 45),
  ];
  const rampCurve = new THREE.CatmullRomCurve3(rampPoints);
  const rampGeo = new THREE.TubeGeometry(rampCurve, 40, 4.2, 4, false);
  rampGeo.scale(1, 0.12, 1);
  const rampMesh = new THREE.Mesh(rampGeo, concreteMat);
  rampMesh.castShadow = true;
  flyoverGrp.add(rampMesh);

  // Concrete Bridge Support Piers along the Flyover
  for (let t = 0.2; t <= 0.8; t += 0.2) {
    const u = Math.max(0, Math.min(1, t));
    const pt = rampCurve.getPointAt(u);
    if (pt) {
      const pierHeight = pt.y;
      const pier = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, pierHeight, 10), concreteMat);
      pier.position.set(pt.x, pierHeight / 2, pt.z);
      pier.castShadow = true;
      flyoverGrp.add(pier);
    }
  }

  // Crash Barrier Guardrails
  const barrierGeo = new THREE.TubeGeometry(rampCurve, 40, 0.35, 6, false);
  const barrierMesh = new THREE.Mesh(barrierGeo, new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
  barrierMesh.position.y = 0.5;
  flyoverGrp.add(barrierMesh);

  flyoverGrp.position.set(foX, foY, foZ);
  group.add(flyoverGrp);

  // =========================================================================
  // 7. HEAVY INDUSTRIAL POWER GENERATION COMPLEX & SUBSTATION (At (200, -150))
  // =========================================================================
  const powerGrp = new THREE.Group();
  const pwX = 200;
  const pwZ = -150;
  const pwY = getElevationAt(pwX, pwZ);

  // Main Generator Turbine Hall Building
  const genBuilding = new THREE.Mesh(
    new THREE.BoxGeometry(45, 16, 26),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 })
  );
  genBuilding.position.set(-15, 8, 0);
  genBuilding.castShadow = true;
  powerGrp.add(genBuilding);

  // Twin Tall Industrial Exhaust Chimney Stacks (With Red/White Aviation Warning Rings)
  const chimneyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const redBandMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });

  for (const cx of [-25, -5]) {
    const chimney = new THREE.Group();
    const mainStack = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 3.4, 46, 16), chimneyMat);
    mainStack.position.y = 23;
    mainStack.castShadow = true;
    chimney.add(mainStack);

    // Red warning rings
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(2.1 + r * 0.2, 2.3 + r * 0.2, 4.5, 16), redBandMat);
      ring.position.y = 30 + r * 5.5;
      chimney.add(ring);
    }

    // Animated Steam / Smoke Particle Cloud from Chimneys
    const smokeCount = 45;
    const smokeGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      sPos[i * 3] = (Math.random() - 0.5) * 3;
      sPos[i * 3 + 1] = 46 + Math.random() * 26;
      sPos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 7.5,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const smokePoints = new THREE.Points(smokeGeo, smokeMat);
    chimney.add(smokePoints);
    smokeParticlesList.push(smokePoints);

    chimney.position.set(cx, 0, 16);
    powerGrp.add(chimney);
  }

  // High-Voltage 230kV Electrical Substation Yard
  const subYard = new THREE.Mesh(new THREE.BoxGeometry(45, 0.2, 34), darkConcreteMat);
  subYard.position.set(30, 0.1, 0);
  subYard.receiveShadow = true;
  powerGrp.add(subYard);

  // Step-up Power Transformers with Radiators & Bushings
  for (let tx = 18; tx <= 42; tx += 12) {
    const trafo = new THREE.Group();
    const tTank = new THREE.Mesh(new THREE.BoxGeometry(5.2, 4.5, 4.2), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    tTank.position.y = 2.25;
    trafo.add(tTank);

    // High voltage ceramic bushings
    for (const bx of [-1.5, 0, 1.5]) {
      const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 2.4, 6), new THREE.MeshStandardMaterial({ color: 0xb45309 }));
      bushing.position.set(bx, 5.5, 0);
      trafo.add(bushing);
    }
    trafo.position.set(tx, 0.2, -6);
    powerGrp.add(trafo);
  }

  // Steel Lattice High-Tension Transmission Pylon Towers
  for (const px of [15, 45]) {
    const pylon = new THREE.Group();
    // Lattice mast
    const pMast = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 2.6, 36, 4), steelMat);
    pMast.position.y = 18;
    pylon.add(pMast);

    // Cross-arms
    for (const cy of [24, 30, 35]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(14 - (cy - 24) * 0.8, 0.6, 0.6), steelMat);
      arm.position.y = cy;
      pylon.add(arm);
    }
    pylon.position.set(px, 0.2, 14);
    powerGrp.add(pylon);
  }

  // Water Treatment Rectangular Aeration Settling Basins
  for (const bz of [-22, 22]) {
    const basinWall = new THREE.Mesh(new THREE.BoxGeometry(32, 2.6, 12), concreteMat);
    basinWall.position.set(-15, 1.3, bz);
    powerGrp.add(basinWall);

    const basinWater = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), waterBasinMat);
    basinWater.rotateX(-Math.PI / 2);
    basinWater.position.set(-15, 2.2, bz);
    powerGrp.add(basinWater);
  }

  powerGrp.position.set(pwX, pwY, pwZ);
  group.add(powerGrp);

  // =========================================================================
  // 8. DELTA FARMLANDS & PRECISION AGRICULTURE (At (90, 60))
  // =========================================================================
  const farmGrp = new THREE.Group();
  const fmX = 90;
  const fmZ = 60;
  const fmY = getElevationAt(fmX, fmZ);

  // Geometric Plots of Rice Paddies & Farmland Terraces
  const plotsData = [
    { px: -25, pz: -20, w: 22, d: 18, mat: greenFieldMat1 },
    { px: 0, pz: -20, w: 24, d: 18, mat: goldenPaddyMat },
    { px: 26, pz: -20, w: 22, d: 18, mat: greenFieldMat2 },
    { px: -25, pz: 5, w: 22, d: 24, mat: goldenPaddyMat },
    { px: 0, pz: 5, w: 24, d: 24, mat: greenFieldMat1 },
    { px: 26, pz: 5, w: 22, d: 24, mat: greenFieldMat2 },
  ];

  plotsData.forEach(({ px, pz, w, d, mat }) => {
    const plot = new THREE.Mesh(new THREE.BoxGeometry(w, 0.4, d), mat);
    plot.position.set(px, 0.2, pz);
    plot.receiveShadow = true;
    farmGrp.add(plot);

    // Earthen Irrigation Berm boundary
    const berm = new THREE.Mesh(
      new THREE.BoxGeometry(w + 1.2, 0.6, d + 1.2),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 })
    );
    berm.position.set(px, 0.15, pz);
    farmGrp.add(berm);
  });

  // Arched Greenhouse Polytunnels
  for (let gx = -28; gx <= -18; gx += 5) {
    const tunnel = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.2, 16, 12, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.75 })
    );
    tunnel.rotation.z = Math.PI / 2;
    tunnel.position.set(gx, 1.2, 26);
    tunnel.castShadow = true;
    farmGrp.add(tunnel);
  }

  // Red & Green Farm Tractors in Fields
  const createTractor = (tx: number, tz: number, col: number) => {
    const tr = new THREE.Group();
    const tMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 3.2), tMat);
    body.position.y = 1.0;
    tr.add(body);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.4), glassBlueMat);
    cab.position.set(0, 1.8, -0.6);
    tr.add(cab);

    // Big rear wheels & small front wheels
    for (const wx of [-1.1, 1.1]) {
      const rWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.5, 12), darkConcreteMat);
      rWheel.rotation.z = Math.PI / 2;
      rWheel.position.set(wx, 0.9, -0.8);
      tr.add(rWheel);

      const fWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), darkConcreteMat);
      fWheel.rotation.z = Math.PI / 2;
      fWheel.position.set(wx, 0.5, 1.1);
      tr.add(fWheel);
    }
    tr.position.set(tx, 0.3, tz);
    farmGrp.add(tr);
  };

  createTractor(4, -18, 0xdc2626); // Red Tractor
  createTractor(22, 8, 0x16a34a); // Green Tractor

  // Aquaculture Fish Farming Pond with Aeration Water Wheel
  const pond = new THREE.Mesh(new THREE.BoxGeometry(22, 0.8, 16), waterBasinMat);
  pond.position.set(15, 0.1, 28);
  farmGrp.add(pond);

  // Grazing Dairy Cows in Pasture
  for (let c = 0; c < 5; c++) {
    const cow = new THREE.Group();
    const cowBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 1.8), whiteMat);
    cowBody.position.y = 0.9;
    cow.add(cowBody);

    const cowHead = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.8), darkConcreteMat);
    cowHead.position.set(0, 1.2, 1.0);
    cow.add(cowHead);

    cow.position.set(-15 + c * 4.5, 0.2, 30 + Math.sin(c * 2) * 3);
    cow.rotation.y = c * 1.2;
    farmGrp.add(cow);
  }

  farmGrp.position.set(fmX, fmY, fmZ);
  group.add(farmGrp);

  const updateAnimation = (time: number, delta: number) => {
    // Animate industrial steam plumes
    smokeParticlesList.forEach((smoke) => {
      const pos = smoke.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + 12 * delta;
        let x = pos.getX(i) + (Math.sin(time * 2 + i) * 0.4) * delta;
        if (y > 75) {
          y = 46;
          x = (Math.random() - 0.5) * 3;
        }
        pos.setY(i, y);
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
    });
  };

  return {
    group,
    smokeParticles: smokeParticlesList,
    updateAnimation,
  };
}
