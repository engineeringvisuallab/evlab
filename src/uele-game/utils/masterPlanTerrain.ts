import * as THREE from 'three';

/**
 * Creates the photorealistic ground texture map corresponding to the
 * UELE World 10km x 10km Master Plan zones:
 * - Center: (0,0), Bounds: (-5000 to +5000)
 * - North-West: Hills & Eco Zone (Forest / lush mountain greens)
 * - North-Mid: Agriculture & Agro-Engineering plots
 * - North-East: Reservoir Basin bed & University green campus
 * - Central Core: Graded urban bedrock and boulevards
 * - Mid-West: Heavy Industrial & Logistics zone ground
 * - Mid-East: Residential & Solar Farm zone
 * - South-West: Coastal / Wetland & Floodplain silt & estuary marsh
 * - South-Mid: Sports, Culture, Medium Housing & Townships
 * - South-East: SEZ Industrial ground, Forestry & Nature Reserve
 */
export function createMasterPlanTerrainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Helper coordinate mapper: World (-5000..5000, -5000..5000) -> Canvas (0..2048, 0..2048)
  const toCanvasX = (wx: number) => ((wx + 5000) / 10000) * 2048;
  const toCanvasY = (wz: number) => ((wz + 5000) / 10000) * 2048;
  const toCanvasSize = (wSize: number) => (wSize / 10000) * 2048;

  // 1. Base Meadow Green Canvas
  ctx.fillStyle = '#2f5728';
  ctx.fillRect(0, 0, 2048, 2048);

  // 2. Zone-Specific Ground Base Tints based on Master Plan

  // Zone 1: North-West Hill & Eco Zone (x: -5000 to -2200, z: -5000 to -2500)
  const nwGradient = ctx.createRadialGradient(
    toCanvasX(-3800), toCanvasY(-3800), 20,
    toCanvasX(-3800), toCanvasY(-3800), toCanvasSize(2600)
  );
  nwGradient.addColorStop(0, '#1a4314'); // Deep alpine forest green
  nwGradient.addColorStop(0.6, '#24521d');
  nwGradient.addColorStop(1, '#2f5728');
  ctx.fillStyle = nwGradient;
  ctx.fillRect(toCanvasX(-5000), toCanvasY(-5000), toCanvasSize(3000), toCanvasSize(2800));

  // Zone 2: Agriculture & Agro-Engineering Zone (x: -2200 to 0, z: -5000 to -2500)
  // Agricultural plot mosaic
  const agriX0 = toCanvasX(-2200);
  const agriY0 = toCanvasY(-5000);
  const agriW = toCanvasSize(2200);
  const agriH = toCanvasSize(2500);
  const agriColors = ['#3d6a2f', '#4f7d38', '#5b853f', '#6c8846', '#4a6b32'];
  const plotsX = 14;
  const plotsY = 16;
  const plotW = agriW / plotsX;
  const plotH = agriH / plotsY;

  for (let py = 0; py < plotsY; py++) {
    for (let px = 0; px < plotsX; px++) {
      ctx.fillStyle = agriColors[(py * 7 + px * 11) % agriColors.length];
      ctx.fillRect(agriX0 + px * plotW + 1, agriY0 + py * plotH + 1, plotW - 2, plotH - 2);
      ctx.strokeStyle = '#27431b';
      ctx.lineWidth = 1;
      ctx.strokeRect(agriX0 + px * plotW, agriY0 + py * plotH, plotW, plotH);
    }
  }

  // Zone 3: Reservoir Basin Bed (x: +1000 to +3800, z: -5000 to -3200)
  const resGradient = ctx.createRadialGradient(
    toCanvasX(2400), toCanvasY(-4100), 30,
    toCanvasX(2400), toCanvasY(-4100), toCanvasSize(1500)
  );
  resGradient.addColorStop(0, '#2d4b5a'); // Deep clay/silt reservoir lakebed
  resGradient.addColorStop(0.7, '#3c5a61');
  resGradient.addColorStop(1, '#2f5728');
  ctx.fillStyle = resGradient;
  ctx.beginPath();
  ctx.arc(toCanvasX(2400), toCanvasY(-4100), toCanvasSize(1450), 0, Math.PI * 2);
  ctx.fill();

  // Zone 4: R&D University Campus (x: +3500 to +5000, z: -5000 to -2800)
  ctx.fillStyle = '#395e34';
  ctx.fillRect(toCanvasX(3500), toCanvasY(-5000), toCanvasSize(1500), toCanvasSize(2200));

  // Zone 5: Heavy Industrial & Logistics Zone (x: -5000 to -500, z: -2500 to -500)
  ctx.fillStyle = '#444d47'; // Industrial concrete/graded gravel base
  ctx.fillRect(toCanvasX(-5000), toCanvasY(-2500), toCanvasSize(4500), toCanvasSize(2000));

  // Zone 6: Residential & Solar Farm (x: +500 to +5000, z: -2500 to -500)
  ctx.fillStyle = '#3b6133'; // Residential parks
  ctx.fillRect(toCanvasX(500), toCanvasY(-2500), toCanvasSize(4500), toCanvasSize(2000));
  // Solar Farm plot base (x: 3200..4800, z: -2500..-800)
  ctx.fillStyle = '#2d3e4a';
  ctx.fillRect(toCanvasX(3200), toCanvasY(-2500), toCanvasSize(1600), toCanvasSize(1700));

  // Zone 7: Central City Core (0,0) with R=2000m circle
  ctx.fillStyle = '#3e4844'; // Urban foundational grading
  ctx.beginPath();
  ctx.arc(toCanvasX(0), toCanvasY(0), toCanvasSize(2000), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#27302c';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Zone 8: International Airport & Aerospace (x: -5000 to -1200, z: +1200 to +3800)
  ctx.fillStyle = '#3b4344'; // Airport tarmac/graded airfield
  ctx.fillRect(toCanvasX(-5000), toCanvasY(1200), toCanvasSize(3800), toCanvasSize(2600));

  // Zone 9: Sports & Recreation Hub (x: -1200 to +800, z: +1200 to +3500)
  ctx.fillStyle = '#34612e';
  ctx.fillRect(toCanvasX(-1200), toCanvasY(1200), toCanvasSize(2000), toCanvasSize(2300));

  // Zone 10: Construction & Heavy Equipment Zone (x: +1500 to +5000, z: +1200 to +3500)
  ctx.fillStyle = '#5a4d3a'; // Earthwork, clay, quarry sand base
  ctx.fillRect(toCanvasX(1500), toCanvasY(1200), toCanvasSize(3500), toCanvasSize(2300));

  // Zone 11: South-West Coastal Wetland & Floodplain (x: -5000 to -1800, z: +3500 to +5000)
  const wetlandGrad = ctx.createRadialGradient(
    toCanvasX(-3800), toCanvasY(4400), 30,
    toCanvasX(-3800), toCanvasY(4400), toCanvasSize(2200)
  );
  wetlandGrad.addColorStop(0, '#1d3e2b'); // Saturated tidal mangrove & estuary green
  wetlandGrad.addColorStop(0.5, '#284d34');
  wetlandGrad.addColorStop(1, '#2f5728');
  ctx.fillStyle = wetlandGrad;
  ctx.fillRect(toCanvasX(-5000), toCanvasY(3500), toCanvasSize(3200), toCanvasSize(1500));

  // Zone 12: Housing & Townships Medium Density (x: -1800 to +800, z: +3500 to +5000)
  ctx.fillStyle = '#385532';
  ctx.fillRect(toCanvasX(-1800), toCanvasY(3500), toCanvasSize(2600), toCanvasSize(1500));

  // Zone 13: SEZ Economic Zone (x: +800 to +2800, z: +3500 to +5000)
  ctx.fillStyle = '#484d4b';
  ctx.fillRect(toCanvasX(800), toCanvasY(3500), toCanvasSize(2000), toCanvasSize(1500));

  // Zone 14: Forestry & Nature Reserve (x: +2800 to +5000, z: +3500 to +5000)
  const forestGrad = ctx.createRadialGradient(
    toCanvasX(3900), toCanvasY(4200), 20,
    toCanvasX(3900), toCanvasY(4200), toCanvasSize(1600)
  );
  forestGrad.addColorStop(0, '#183815'); // Deep botanical reserve canopy
  forestGrad.addColorStop(0.7, '#24491e');
  forestGrad.addColorStop(1, '#2f5728');
  ctx.fillStyle = forestGrad;
  ctx.fillRect(toCanvasX(2800), toCanvasY(3500), toCanvasSize(2200), toCanvasSize(1500));

  // 3. Karatoya-Style Urban River Corridor (Carved River Silt Bed)
  // Winding from West (-5000, -800) through (0, -600) to East (+5000, -800)
  ctx.strokeStyle = '#274b57'; // Riverbed silt/gravel
  ctx.lineWidth = toCanvasSize(320);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(toCanvasX(-5000), toCanvasY(-800));
  ctx.bezierCurveTo(
    toCanvasX(-2500), toCanvasY(-1200),
    toCanvasX(-1200), toCanvasY(-500),
    toCanvasX(0), toCanvasY(-600)
  );
  ctx.bezierCurveTo(
    toCanvasX(1400), toCanvasY(-700),
    toCanvasX(2800), toCanvasY(-400),
    toCanvasX(5000), toCanvasY(-800)
  );
  ctx.stroke();

  // 4. Subtle Perlin-style Organic Micro-Texture
  const imgData = ctx.getImageData(0, 0, 2048, 2048);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 1.2));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.8));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createMasterPlanNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(512, 512);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const nx = (Math.random() - 0.5) * 45;
    const ny = (Math.random() - 0.5) * 45;
    data[i] = Math.min(255, Math.max(0, 128 + nx));
    data[i + 1] = Math.min(255, Math.max(0, 128 + ny));
    data[i + 2] = 255;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(24, 24);
  return tex;
}
