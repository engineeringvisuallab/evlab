import * as THREE from 'three';

// Generates procedural realistic photorealistic textures using HTML5 Canvas

// 1. Photorealistic Alluvial Grass & Field Soil Texture
export function createBangladeshTerrainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Rich lush meadow base
  ctx.fillStyle = '#3c6631';
  ctx.fillRect(0, 0, 2048, 2048);

  // 1. Organic Perlin-like biological micro-noise
  const imgData = ctx.getImageData(0, 0, 2048, 2048);
  const data = imgData.data;

  for (let y = 0; y < 2048; y++) {
    for (let x = 0; x < 2048; x++) {
      const idx = (y * 2048 + x) * 4;
      // Multi-frequency noise
      const n1 = Math.sin(x * 0.02) * Math.cos(y * 0.02);
      const n2 = Math.sin(x * 0.08 + y * 0.04) * 0.5;
      const n3 = (Math.random() - 0.5) * 22;
      const blend = (n1 + n2) * 28 + n3;

      data[idx] = Math.min(255, Math.max(0, 52 + blend * 0.6));     // Red (soil tint)
      data[idx + 1] = Math.min(255, Math.max(0, 102 + blend * 1.1)); // Green (foliage)
      data[idx + 2] = Math.min(255, Math.max(0, 42 + blend * 0.4));  // Blue
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // 2. Agricultural Paddy Mosaic Plots
  const cols = 24;
  const rows = 24;
  const cellW = 2048 / cols;
  const cellH = 2048 / rows;

  const paddyPalettes = [
    { fill: '#34612b', border: '#223819' }, // vibrant green crop
    { fill: '#467537', border: '#2d4a22' }, // young emerald crop
    { fill: '#578841', border: '#3b5c2a' }, // sunlit grass
    { fill: '#5e7b39', border: '#3f5224' }, // ripening field
    { fill: '#6e7a4b', border: '#4a532f' }, // alluvial silt soil
    { fill: '#476338', border: '#2f4323' }, // moist meadow
    { fill: '#2e4f25', border: '#1c3316' }, // deep wetland grass
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW;
      const y = r * cellH;
      const palette = paddyPalettes[(r * 11 + c * 17) % paddyPalettes.length];

      ctx.fillStyle = palette.fill;
      ctx.fillRect(x + 4, y + 4, cellW - 8, cellH - 8);

      // Paddy bund / embankment borders (mud ridge)
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 2, y + 2, cellW - 4, cellH - 4);

      // Fine grass blade micro-striations inside plots
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1.5;
      for (let line = 8; line < cellH - 8; line += 8) {
        ctx.beginPath();
        ctx.moveTo(x + 6, y + line);
        ctx.lineTo(x + cellW - 6, y + line);
        ctx.stroke();
      }
    }
  }

  // 3. Meandering River Silt Shoreline (Sand & fertile clay)
  const riverGrad = ctx.createLinearGradient(1200, 0, 1700, 2048);
  riverGrad.addColorStop(0, 'rgba(195, 175, 140, 0.92)'); // Alluvial sand
  riverGrad.addColorStop(0.3, 'rgba(150, 130, 95, 0.88)'); // Wet mud
  riverGrad.addColorStop(0.7, 'rgba(175, 155, 120, 0.92)');
  riverGrad.addColorStop(1, 'rgba(145, 125, 90, 0.88)');

  ctx.fillStyle = riverGrad;
  ctx.beginPath();
  ctx.moveTo(1120, 0);
  ctx.bezierCurveTo(1240, 600, 1440, 1400, 1600, 2048);
  ctx.lineTo(1840, 2048);
  ctx.bezierCurveTo(1680, 1400, 1480, 600, 1360, 0);
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// 2. Realistic Grass & Soil Roughness/Normal Map
export function createGrassGroundNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(512, 512);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const nx = (Math.random() - 0.5) * 60;
    const ny = (Math.random() - 0.5) * 60;
    data[i] = Math.min(255, Math.max(0, 128 + nx));     // Normal X
    data[i + 1] = Math.min(255, Math.max(0, 128 + ny)); // Normal Y
    data[i + 2] = 255;                                  // Normal Z (up)
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  return tex;
}

// 3. Highway Asphalt with Markings and Gravel Shoulder
export function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Asphalt base
  ctx.fillStyle = '#2b2e33';
  ctx.fillRect(0, 0, 512, 512);

  // Asphalt aggregate noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 24;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Highway Shoulders
  ctx.fillStyle = '#6b5742';
  ctx.fillRect(0, 0, 45, 512);
  ctx.fillRect(467, 0, 45, 512);

  // Solid white shoulder edge lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(55, 0);
  ctx.lineTo(55, 512);
  ctx.moveTo(457, 0);
  ctx.lineTo(457, 512);
  ctx.stroke();

  // Dashed center yellow line
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 6;
  ctx.setLineDash([32, 24]);
  ctx.beginPath();
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 512);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 16);
  return texture;
}

// 4. Corrugated Tin Roof
export function createCorrugatedTinTexture(tint: 'silver' | 'blue' | 'rust' = 'silver'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const baseColors = {
    silver: { bg: '#8a949e', dark: '#5d6874', light: '#b8c2cc' },
    blue: { bg: '#2b5876', dark: '#1c394d', light: '#4e82a6' },
    rust: { bg: '#8b4513', dark: '#5c2c09', light: '#b2591b' },
  };

  const palette = baseColors[tint];
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, 256, 256);

  const ridgeWidth = 8;
  for (let x = 0; x < 256; x += ridgeWidth) {
    const grad = ctx.createLinearGradient(x, 0, x + ridgeWidth, 0);
    grad.addColorStop(0, palette.dark);
    grad.addColorStop(0.5, palette.light);
    grad.addColorStop(1, palette.dark);
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, ridgeWidth, 256);
  }

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 85);
  ctx.lineTo(256, 85);
  ctx.moveTo(0, 170);
  ctx.lineTo(256, 170);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 5. Bangladesh Brick Masonry
export function createBrickWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#b0a99f';
  ctx.fillRect(0, 0, 256, 256);

  const brickH = 16;
  const brickW = 36;
  const mortar = 3;

  for (let y = 0; y < 256; y += brickH + mortar) {
    const row = Math.floor(y / (brickH + mortar));
    const offsetX = (row % 2) * (brickW / 2);

    for (let x = -brickW; x < 256 + brickW; x += brickW + mortar) {
      const rx = x + offsetX;
      const red = 165 + Math.floor((Math.random() - 0.5) * 35);
      const green = 65 + Math.floor((Math.random() - 0.5) * 20);
      const blue = 45 + Math.floor((Math.random() - 0.5) * 15);
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.fillRect(rx, y, brickW, brickH);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 6. Water Normal Bump Map
export function createWaterNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 40; i++) {
    const cx = Math.random() * 256;
    const cy = Math.random() * 256;
    const rad = 15 + Math.random() * 30;

    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rad);
    grad.addColorStop(0, 'rgba(160, 160, 255, 0.5)');
    grad.addColorStop(0.5, 'rgba(128, 128, 240, 0.3)');
    grad.addColorStop(1, 'rgba(128, 128, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}
