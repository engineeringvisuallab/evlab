import katex from 'katex';

/**
 * Safely renders LaTeX string to HTML using KaTeX
 */
export function renderLatex(latex: string, displayMode = false): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
    });
  } catch (err) {
    console.warn('KaTeX rendering error:', err);
    return `<span class="font-mono text-slate-300">${latex}</span>`;
  }
}

/**
 * Format numbers with scientific precision and appropriate units
 */
export function formatValue(val: number, decimals = 2): string {
  if (Math.abs(val) === 0) return '0';
  if (Math.abs(val) >= 10000 || (Math.abs(val) < 0.001 && Math.abs(val) > 0)) {
    return val.toExponential(decimals);
  }
  return val.toFixed(decimals);
}

/**
 * Standard 4th Order Runge-Kutta (RK4) ODE solver step
 */
export function rk4Step(
  derivFunc: (t: number, y: number[]) => number[],
  t: number,
  y: number[],
  dt: number
): number[] {
  const n = y.length;
  const k1 = derivFunc(t, y);
  
  const y2 = new Array(n);
  for (let i = 0; i < n; i++) y2[i] = y[i] + 0.5 * dt * k1[i];
  const k2 = derivFunc(t + 0.5 * dt, y2);

  const y3 = new Array(n);
  for (let i = 0; i < n; i++) y3[i] = y[i] + 0.5 * dt * k2[i];
  const k3 = derivFunc(t + 0.5 * dt, y3);

  const y4 = new Array(n);
  for (let i = 0; i < n; i++) y4[i] = y[i] + dt * k3[i];
  const k4 = derivFunc(t + dt, y4);

  const yNext = new Array(n);
  for (let i = 0; i < n; i++) {
    yNext[i] = y[i] + (dt / 6.0) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  }
  return yNext;
}

/**
 * Draw a scientific vector arrow on 2D canvas with label and magnitude
 */
export function drawVector(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  vx: number,
  vy: number,
  color: string,
  label?: string,
  scale = 1.0
) {
  const len = Math.sqrt(vx * vx + vy * vy);
  if (len < 0.001) return;

  const endX = startX + vx * scale;
  const endY = startY + vy * scale;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  // Draw main shaft
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Arrowhead
  const headLen = Math.min(12, Math.max(6, len * scale * 0.2));
  const angle = Math.atan2(vy, vx);

  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLen * Math.cos(angle - Math.PI / 6),
    endY - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    endX - headLen * Math.cos(angle + Math.PI / 6),
    endY - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  // Label
  if (label) {
    ctx.font = 'bold 11px "Fira Code", monospace';
    ctx.fillStyle = color;
    const textOffsetX = Math.cos(angle + Math.PI / 2) * 14;
    const textOffsetY = Math.sin(angle + Math.PI / 2) * 14;
    ctx.fillText(label, (startX + endX) / 2 + textOffsetX, (startY + endY) / 2 + textOffsetY);
  }

  ctx.restore();
}
