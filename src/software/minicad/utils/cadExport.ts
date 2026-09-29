import { CADObject, Layer, TransformState } from '../types/cad';

// Export Project to JSON
export function exportToJSON(objects: CADObject[], layers: Layer[], transform: TransformState): string {
  const data = {
    appName: 'EVL Mini CAD',
    version: '1.0',
    createdAt: new Date().toISOString(),
    transform,
    layers,
    objects,
  };
  return JSON.stringify(data, null, 2);
}

// Download file helper
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export to SVG
export function exportToSVG(objects: CADObject[], layers: Layer[]): string {
  // Find bounding box
  let minX = -100, minY = -100, maxX = 100, maxY = 100;
  if (objects.length > 0) {
    minX = Infinity; minY = Infinity; maxX = -Infinity; maxY = -Infinity;
    for (const obj of objects) {
      if (obj.type === 'line') {
        minX = Math.min(minX, obj.startX, obj.endX);
        minY = Math.min(minY, obj.startY, obj.endY);
        maxX = Math.max(maxX, obj.startX, obj.endX);
        maxY = Math.max(maxY, obj.startY, obj.endY);
      } else if (obj.type === 'rectangle') {
        minX = Math.min(minX, obj.x, obj.x + obj.width);
        minY = Math.min(minY, obj.y, obj.y + obj.height);
        maxX = Math.max(maxX, obj.x, obj.x + obj.width);
        maxY = Math.max(maxY, obj.y, obj.y + obj.height);
      } else if (obj.type === 'circle') {
        minX = Math.min(minX, obj.centerX - obj.radius);
        minY = Math.min(minY, obj.centerY - obj.radius);
        maxX = Math.max(maxX, obj.centerX + obj.radius);
        maxY = Math.max(maxY, obj.centerY + obj.radius);
      }
    }
    const margin = 20;
    minX -= margin; minY -= margin; maxX += margin; maxY += margin;
  }

  const width = Math.max(200, maxX - minX);
  const height = Math.max(200, maxY - minY);

  const layerMap = new Map<string, Layer>();
  layers.forEach((l) => layerMap.set(l.id, l));

  let svgElements = '';

  for (const obj of objects) {
    const layer = layerMap.get(obj.layerId);
    const color = obj.color || layer?.color || '#ffffff';
    const strokeWidth = obj.lineWeight || layer?.lineWeight || 1;

    if (obj.type === 'line') {
      svgElements += `  <line x1="${obj.startX}" y1="${-obj.startY}" x2="${obj.endX}" y2="${-obj.endY}" stroke="${color}" stroke-width="${strokeWidth}" />\n`;
    } else if (obj.type === 'rectangle') {
      const topY = -(obj.y + Math.max(0, obj.height));
      svgElements += `  <rect x="${Math.min(obj.x, obj.x + obj.width)}" y="${topY}" width="${Math.abs(obj.width)}" height="${Math.abs(obj.height)}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />\n`;
    } else if (obj.type === 'circle') {
      svgElements += `  <circle cx="${obj.centerX}" cy="${-obj.centerY}" r="${obj.radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />\n`;
    } else if (obj.type === 'polyline') {
      const pts = obj.points.map((p) => `${p.x},${-p.y}`).join(' ');
      svgElements += `  <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />\n`;
    } else if (obj.type === 'text') {
      svgElements += `  <text x="${obj.x}" y="${-obj.y}" fill="${color}" font-size="${obj.fontSize}">${obj.text}</text>\n`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${-maxY} ${width} ${height}" style="background-color: #121417;">\n${svgElements}</svg>`;
}

// Minimal DXF R12 generator
export function exportToDXF(objects: CADObject[]): string {
  let dxf = `0\nSECTION\n2\nENTITIES\n`;

  for (const obj of objects) {
    if (obj.type === 'line') {
      dxf += `0\nLINE\n8\n0\n10\n${obj.startX}\n20\n${obj.startY}\n30\n0.0\n11\n${obj.endX}\n21\n${obj.endY}\n31\n0.0\n`;
    } else if (obj.type === 'circle') {
      dxf += `0\nCIRCLE\n8\n0\n10\n${obj.centerX}\n20\n${obj.centerY}\n30\n0.0\n40\n${obj.radius}\n`;
    } else if (obj.type === 'rectangle') {
      const x1 = obj.x, y1 = obj.y, x2 = obj.x + obj.width, y2 = obj.y + obj.height;
      dxf += `0\nLINE\n8\n0\n10\n${x1}\n20\n${y1}\n30\n0.0\n11\n${x2}\n21\n${y1}\n31\n0.0\n`;
      dxf += `0\nLINE\n8\n0\n10\n${x2}\n20\n${y1}\n30\n0.0\n11\n${x2}\n21\n${y2}\n31\n0.0\n`;
      dxf += `0\nLINE\n8\n0\n10\n${x2}\n20\n${y2}\n30\n0.0\n11\n${x1}\n21\n${y2}\n31\n0.0\n`;
      dxf += `0\nLINE\n8\n0\n10\n${x1}\n20\n${y2}\n30\n0.0\n11\n${x1}\n21\n${y1}\n31\n0.0\n`;
    }
  }

  dxf += `0\nENDSEC\n0\nEOF\n`;
  return dxf;
}

// Export PNG image
export function exportToPNG(canvas: HTMLCanvasElement, filename = 'drawing.png') {
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Export self-contained single HTML file running offline with vanilla JS
export function exportToStandaloneHTML(objects: CADObject[], layers: Layer[]): string {
  const dataJSON = JSON.stringify(objects);
  const layersJSON = JSON.stringify(layers);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EVL Mini CAD - Offline Deliverable</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body { background: #121417; color: #e0e0e0; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; height: 100vh; display: flex; flex-direction: column; }
    #toolbar { background: #1a1c22; border-bottom: 1px solid #2d3139; height: 40px; display: flex; items-center; padding: 0 12px; gap: 12px; font-size: 12px; }
    .btn { background: #282c35; border: 1px solid #3a3f4d; color: #fff; padding: 4px 10px; border-radius: 4px; cursor: pointer; }
    .btn.active { background: #0078d4; border-color: #0078d4; font-weight: bold; }
    #canvas-container { flex: 1; position: relative; }
    canvas { width: 100%; height: 100%; display: block; background: #121417; cursor: crosshair; }
    #statusbar { background: #16181d; border-top: 1px solid #2d3139; height: 28px; display: flex; align-items: center; justify-content: space-between; px: 12px; font-family: monospace; font-size: 11px; color: #a0a5b2; padding: 0 12px; }
  </style>
</head>
<body>
  <div id="toolbar">
    <strong style="color:#00ffff; font-size: 14px;">EVL Mini CAD</strong>
    <button class="btn active" id="btn-select" onclick="setTool('select')">Select [S]</button>
    <button class="btn" id="btn-line" onclick="setTool('line')">Line [L]</button>
    <button class="btn" id="btn-rect" onclick="setTool('rectangle')">Rect [R]</button>
    <button class="btn" id="btn-circle" onclick="setTool('circle')">Circle [C]</button>
    <button class="btn" onclick="clearWorkspace()">Clear</button>
  </div>
  <div id="canvas-container">
    <canvas id="cadCanvas"></canvas>
  </div>
  <div id="statusbar">
    <span id="instruction">Click first point</span>
    <span id="coords">X: 0.00 | Y: 0.00</span>
  </div>
  <script>
    let objects = ${dataJSON};
    let layers = ${layersJSON};
    let activeTool = 'select';
    let transform = { panX: 0, panY: 0, zoom: 1.2 };
    let startPt = null;
    let cursorWorld = { x: 0, y: 0 };

    const canvas = document.getElementById('cadCanvas');
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      draw();
    }
    window.addEventListener('resize', resize);
    setTimeout(resize, 100);

    function setTool(tool) {
      activeTool = tool;
      startPt = null;
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById('btn-' + tool);
      if (activeBtn) activeBtn.classList.add('active');
      draw();
    }

    function clearWorkspace() {
      if (confirm('Clear workspace?')) { objects = []; draw(); }
    }

    function worldToScreen(pt) {
      return {
        x: canvas.width / 2 + transform.panX + pt.x * transform.zoom,
        y: canvas.height / 2 + transform.panY - pt.y * transform.zoom
      };
    }

    function screenToWorld(pt) {
      return {
        x: (pt.x - (canvas.width / 2 + transform.panX)) / transform.zoom,
        y: ((canvas.height / 2 + transform.panY) - pt.y) / transform.zoom
      };
    }

    function draw() {
      ctx.fillStyle = '#121417';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const ox = canvas.width / 2 + transform.panX;
      const oy = canvas.height / 2 + transform.panY;

      // Axis
      ctx.strokeStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(canvas.width, oy); ctx.stroke();
      ctx.strokeStyle = '#2ecc71'; ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, canvas.height); ctx.stroke();

      // Draw Objects
      for (const obj of objects) {
        ctx.strokeStyle = obj.color || '#00ffff';
        ctx.lineWidth = obj.lineWeight || 2;
        if (obj.type === 'line') {
          const p1 = worldToScreen({x: obj.startX, y: obj.startY});
          const p2 = worldToScreen({x: obj.endX, y: obj.endY});
          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        } else if (obj.type === 'rectangle') {
          const p1 = worldToScreen({x: obj.x, y: obj.y});
          const p2 = worldToScreen({x: obj.x + obj.width, y: obj.y + obj.height});
          ctx.strokeRect(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
        } else if (obj.type === 'circle') {
          const c = worldToScreen({x: obj.centerX, y: obj.centerY});
          ctx.beginPath(); ctx.arc(c.x, c.y, obj.radius * transform.zoom, 0, Math.PI * 2); ctx.stroke();
        }
      }

      // Preview
      if (startPt) {
        const p1 = worldToScreen(startPt);
        const p2 = worldToScreen(cursorWorld);
        ctx.strokeStyle = '#00ffff';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      cursorWorld = screenToWorld({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      document.getElementById('coords').innerText = 'X: ' + cursorWorld.x.toFixed(2) + ' | Y: ' + cursorWorld.y.toFixed(2);
      draw();
    });

    canvas.addEventListener('mousedown', (e) => {
      if (activeTool === 'line') {
        if (!startPt) { startPt = cursorWorld; }
        else {
          objects.push({ id: 'l_'+Date.now(), type: 'line', startX: startPt.x, startY: startPt.y, endX: cursorWorld.x, endY: cursorWorld.y, color: '#00ffff', lineWeight: 2 });
          startPt = null; draw();
        }
      } else if (activeTool === 'rectangle') {
        if (!startPt) { startPt = cursorWorld; }
        else {
          objects.push({ id: 'r_'+Date.now(), type: 'rectangle', x: startPt.x, y: startPt.y, width: cursorWorld.x - startPt.x, height: cursorWorld.y - startPt.y, color: '#00ffff', lineWeight: 2 });
          startPt = null; draw();
        }
      } else if (activeTool === 'circle') {
        if (!startPt) { startPt = cursorWorld; }
        else {
          const rad = Math.hypot(cursorWorld.x - startPt.x, cursorWorld.y - startPt.y);
          objects.push({ id: 'c_'+Date.now(), type: 'circle', centerX: startPt.x, centerY: startPt.y, radius: rad, color: '#00ffff', lineWeight: 2 });
          startPt = null; draw();
        }
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'l') setTool('line');
      else if (e.key === 'r') setTool('rectangle');
      else if (e.key === 'c') setTool('circle');
      else if (e.key === 's') setTool('select');
    });
  </script>
</body>
</html>`;
}

