import React, { useRef, useEffect } from 'react';
import { ExperimentMetadata } from '../../types/physics';
import { drawVector } from '../../utils/physicsMath';

interface SimulationCanvasProps {
  experiment: ExperimentMetadata;
  params: Record<string, number>;
  isRunning: boolean;
  simulationTime: number;
  onObservablesUpdate: (observables: Record<string, any>) => void;
  showVectors?: boolean;
  showGrid?: boolean;
  showTrails?: boolean;
  onCanvasClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  experiment,
  params,
  isRunning,
  simulationTime,
  onObservablesUpdate,
  showVectors = true,
  showGrid = true,
  showTrails = true,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number }[]>([]);

  // Clear trail when parameters reset
  useEffect(() => {
    trailRef.current = [];
  }, [experiment.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Clear frame
    ctx.clearRect(0, 0, width, height);

    // Draw Scientific Laboratory Grid Background
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // DISPATCH BASED ON EXPERIMENT ID
    switch (experiment.id) {
      case 'newtons-second-law': {
        const mass = params.mass ?? 5;
        const appliedForce = params.appliedForce ?? 25;
        const frictionCoeff = params.frictionCoeff ?? 0.2;
        const inclineAngle = (params.inclineAngle ?? 0) * (Math.PI / 180);
        const gravity = params.gravity ?? 9.81;

        // Physics equations
        const normalForce = mass * gravity * Math.cos(inclineAngle);
        const maxStaticFriction = frictionCoeff * normalForce;
        const gravityParallel = mass * gravity * Math.sin(inclineAngle);
        const netDriving = appliedForce - gravityParallel;
        let frictionForce = 0;
        let accel = 0;

        if (Math.abs(netDriving) > maxStaticFriction) {
          frictionForce = frictionCoeff * normalForce * Math.sign(netDriving);
          accel = (netDriving - frictionForce) / mass;
        } else {
          frictionForce = netDriving;
          accel = 0;
        }

        const velocity = Math.max(0, accel * simulationTime);
        const positionMeters = Math.max(0, 0.5 * accel * simulationTime * simulationTime);

        onObservablesUpdate({
          acceleration: accel,
          velocity,
          position: positionMeters,
          frictionForce,
          normalForce,
          appliedForce,
          netForce: mass * accel,
          kineticEnergy: 0.5 * mass * velocity * velocity,
        });

        // Render Incline and Block
        ctx.save();
        const originX = 120;
        const originY = height - 100;
        const planeLength = 550;

        // Draw Incline Plane
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX + planeLength * Math.cos(-inclineAngle), originY + planeLength * Math.sin(-inclineAngle));
        ctx.lineTo(originX + planeLength * Math.cos(-inclineAngle), originY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw Block
        const blockPosPixels = (positionMeters * 35) % (planeLength - 80);
        const blockCenterX = originX + (blockPosPixels + 40) * Math.cos(-inclineAngle);
        const blockCenterY = originY + (blockPosPixels + 40) * Math.sin(-inclineAngle) - 25;

        ctx.translate(blockCenterX, blockCenterY);
        ctx.rotate(-inclineAngle);

        ctx.fillStyle = '#0ea5e9';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.fillRect(-35, -25, 70, 50);
        ctx.strokeRect(-35, -25, 70, 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${mass.toFixed(1)} kg`, 0, 4);

        // Draw Free-Body Diagram Vectors
        if (showVectors) {
          drawVector(ctx, 0, 0, appliedForce * 2.5, 0, '#10b981', `F_app=${appliedForce}N`);
          if (frictionForce > 0) {
            drawVector(ctx, 0, 24, -frictionForce * 2.5, 0, '#f43f5e', `f_k=${frictionForce.toFixed(1)}N`);
          }
          drawVector(ctx, 0, 0, 0, -normalForce * 1.5, '#38bdf8', `N=${normalForce.toFixed(1)}N`);
          drawVector(ctx, 0, 0, gravityParallel * 2, normalForce * 1.5, '#f59e0b', `W=mg`);
        }

        ctx.restore();
        break;
      }

      case 'projectile-motion': {
        const v0 = params.launchSpeed ?? 30;
        const angleDeg = params.launchAngle ?? 45;
        const angleRad = (angleDeg * Math.PI) / 180;
        const launchHeight = params.launchHeight ?? 0;
        const gravity = params.gravity ?? 9.81;
        const airDragCoeff = params.airResistance ?? 0;

        // Kinematic variables
        const vx0 = v0 * Math.cos(angleRad);
        const vy0 = v0 * Math.sin(angleRad);
        const tTotal = (vy0 + Math.sqrt(vy0 * vy0 + 2 * gravity * launchHeight)) / gravity;
        const clampedT = Math.min(simulationTime, tTotal);

        let currentX = 0;
        let currentY = launchHeight;
        let currentVx = vx0;
        let currentVy = vy0;

        if (airDragCoeff > 0) {
          // Numerical integration step
          const dt = 0.02;
          let simT = 0;
          while (simT < clampedT) {
            const vSpeed = Math.sqrt(currentVx * currentVx + currentVy * currentVy);
            const dragForceX = -0.5 * airDragCoeff * vSpeed * currentVx;
            const dragForceY = -0.5 * airDragCoeff * vSpeed * currentVy - gravity;
            currentVx += dragForceX * dt;
            currentVy += dragForceY * dt;
            currentX += currentVx * dt;
            currentY += currentVy * dt;
            simT += dt;
            if (currentY <= 0) {
              currentY = 0;
              break;
            }
          }
        } else {
          currentX = vx0 * clampedT;
          currentY = Math.max(0, launchHeight + vy0 * clampedT - 0.5 * gravity * clampedT * clampedT);
          currentVx = vx0;
          currentVy = vy0 - gravity * clampedT;
        }

        const maxH = launchHeight + (vy0 * vy0) / (2 * gravity);
        const totalRange = vx0 * tTotal;

        onObservablesUpdate({
          time: clampedT,
          distance: currentX,
          height: currentY,
          vx: currentVx,
          vy: currentVy,
          velocity: Math.sqrt(currentVx * currentVx + currentVy * currentVy),
          maxHeight: maxH,
          totalRange: totalRange,
          flightTime: tTotal,
        });

        // Coordinates origin
        const startCanvasX = 80;
        const groundY = height - 80;
        const scale = 5.0; // pixels per meter

        // Draw Ground
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(width, groundY);
        ctx.stroke();

        // Draw Trajectory Parabolic Arc
        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let t = 0; t <= tTotal; t += 0.05) {
          const px = startCanvasX + vx0 * t * scale;
          const py = groundY - (launchHeight + vy0 * t - 0.5 * gravity * t * t) * scale;
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        // Draw Cannon Launcher
        ctx.save();
        ctx.translate(startCanvasX, groundY - launchHeight * scale);
        ctx.rotate(-angleRad);
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.fillRect(0, -10, 45, 20);
        ctx.strokeRect(0, -10, 45, 20);
        ctx.restore();

        // Projectile Ball
        const ballCanvasX = startCanvasX + currentX * scale;
        const ballCanvasY = groundY - currentY * scale;

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(ballCanvasX, ballCanvasY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Vectors
        if (showVectors) {
          drawVector(ctx, ballCanvasX, ballCanvasY, currentVx * 2.0, -currentVy * 2.0, '#10b981', `v=${Math.sqrt(currentVx**2 + currentVy**2).toFixed(1)}m/s`);
          drawVector(ctx, ballCanvasX, ballCanvasY, 0, gravity * 3.5, '#f59e0b', `g=9.8m/s²`);
        }

        break;
      }

      case 'momentum-collision': {
        const m1 = params.mass1 ?? 3;
        const m2 = params.mass2 ?? 5;
        const u1 = params.velocity1 ?? 10;
        const u2 = params.velocity2 ?? -4;
        const e = params.restitution ?? 1.0; // 1 = elastic, 0 = inelastic

        // 1D Collision Physics
        const v1_final = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);
        const v2_final = ((1 + e) * m1 * u1 + (m2 - e * m1) * u2) / (m1 + m2);

        const initialMomentum = m1 * u1 + m2 * u2;
        const finalMomentum = m1 * v1_final + m2 * v2_final;
        const initialKE = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
        const finalKE = 0.5 * m1 * v1_final * v1_final + 0.5 * m2 * v2_final * v2_final;

        const collisionTime = 2.0; // collision happens at t = 2.0s
        const isPostCollision = simulationTime >= collisionTime;

        const curV1 = isPostCollision ? v1_final : u1;
        const curV2 = isPostCollision ? v2_final : u2;

        const cart1X = isPostCollision
          ? 320 + v1_final * (simulationTime - collisionTime) * 15
          : 120 + u1 * simulationTime * 15;
        const cart2X = isPostCollision
          ? 390 + v2_final * (simulationTime - collisionTime) * 15
          : 500 + u2 * simulationTime * 15;

        onObservablesUpdate({
          velocity1: curV1,
          velocity2: curV2,
          momentum1: m1 * curV1,
          momentum2: m2 * curV2,
          totalMomentum: m1 * curV1 + m2 * curV2,
          totalKineticEnergy: 0.5 * m1 * curV1 * curV1 + 0.5 * m2 * curV2 * curV2,
          initialMomentum,
          finalMomentum,
          energyLossPercent: ((initialKE - finalKE) / (initialKE || 1)) * 100,
        });

        // Draw Air Track
        const trackY = height / 2 + 50;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(40, trackY);
        ctx.lineTo(width - 40, trackY);
        ctx.stroke();

        // Draw Cart 1
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(cart1X - 35, trackY - 35, 70, 30);
        ctx.strokeStyle = '#22d3ee';
        ctx.strokeRect(cart1X - 35, trackY - 35, 70, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Fira Code"';
        ctx.textAlign = 'center';
        ctx.fillText(`m1=${m1}kg`, cart1X, trackY - 16);

        // Draw Cart 2
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cart2X - 35, trackY - 35, 70, 30);
        ctx.strokeStyle = '#fbbf24';
        ctx.strokeRect(cart2X - 35, trackY - 35, 70, 30);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`m2=${m2}kg`, cart2X, trackY - 16);

        if (showVectors) {
          drawVector(ctx, cart1X, trackY - 45, curV1 * 5, 0, '#06b6d4', `v1=${curV1.toFixed(1)}m/s`);
          drawVector(ctx, cart2X, trackY - 45, curV2 * 5, 0, '#f59e0b', `v2=${curV2.toFixed(1)}m/s`);
        }

        break;
      }

      case 'simple-pendulum': {
        const length = params.length ?? 1.5;
        const initialAngleDeg = params.initialAngle ?? 30;
        const initialAngleRad = (initialAngleDeg * Math.PI) / 180;
        const damping = params.damping ?? 0.05;
        const gravity = params.gravity ?? 9.81;
        const bobMass = params.bobMass ?? 1.0;

        const omega0 = Math.sqrt(gravity / length);
        const currentTheta = initialAngleRad * Math.exp(-damping * simulationTime) * Math.cos(omega0 * simulationTime);
        const angularVelocity = -initialAngleRad * omega0 * Math.exp(-damping * simulationTime) * Math.sin(omega0 * simulationTime);
        const linearVelocity = length * angularVelocity;
        const period = 2 * Math.PI * Math.sqrt(length / gravity);
        const heightMeters = length * (1 - Math.cos(currentTheta));
        const pe = bobMass * gravity * heightMeters;
        const ke = 0.5 * bobMass * linearVelocity * linearVelocity;

        onObservablesUpdate({
          angle: (currentTheta * 180) / Math.PI,
          angularVelocity,
          velocity: linearVelocity,
          period,
          potentialEnergy: pe,
          kineticEnergy: ke,
          totalEnergy: pe + ke,
        });

        // Pivot point
        const pivotX = width / 2;
        const pivotY = 70;
        const visualLength = length * 120;
        const bobX = pivotX + visualLength * Math.sin(currentTheta);
        const bobY = pivotY + visualLength * Math.cos(currentTheta);

        // Draw Pivot
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(pivotX - 30, pivotY - 10, 60, 10);

        // Draw String
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        // Draw Bob
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c4b5fd';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Bob label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Fira Code"';
        ctx.textAlign = 'center';
        ctx.fillText(`${bobMass}kg`, bobX, bobY + 3);

        if (showVectors) {
          drawVector(ctx, bobX, bobY, linearVelocity * 15 * Math.cos(currentTheta), -linearVelocity * 15 * Math.sin(currentTheta), '#10b981', `v=${linearVelocity.toFixed(2)}m/s`);
        }

        break;
      }

      case 'free-fall-gravity': {
        const heightM = params.dropHeight ?? 50;
        const gravity = params.gravity ?? 9.81;
        const airResistance = params.airResistance ?? 0;
        const objectMass = params.mass ?? 2;

        const terminalVel = airResistance > 0 ? Math.sqrt((objectMass * gravity) / airResistance) : Infinity;
        const tDrop = Math.sqrt((2 * heightM) / gravity);
        const clampedT = Math.min(simulationTime, tDrop);

        const currentPos = Math.min(heightM, 0.5 * gravity * clampedT * clampedT);
        const currentVel = Math.min(terminalVel, gravity * clampedT);

        onObservablesUpdate({
          distanceFallen: currentPos,
          currentHeight: heightM - currentPos,
          velocity: currentVel,
          acceleration: gravity,
          terminalVelocity: terminalVel === Infinity ? 999 : terminalVel,
          timeToImpact: tDrop,
        });

        // Draw Dual Vacuum vs Air Tube
        const chamberY = 60;
        const chamberH = height - 120;
        const tube1X = width / 2 - 120;
        const tube2X = width / 2 + 60;

        // Tube 1: Vacuum
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(tube1X, chamberY, 100, chamberH);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.fillRect(tube1X, chamberY, 100, chamberH);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('VACUUM (No Drag)', tube1X + 50, chamberY - 10);

        // Falling Ball
        const ballY = chamberY + (currentPos / heightM) * (chamberH - 40) + 20;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(tube1X + 50, ballY, 14, 0, Math.PI * 2);
        ctx.fill();

        // Tube 2: Atmospheric Air
        ctx.strokeStyle = '#10b981';
        ctx.strokeRect(tube2X, chamberY, 100, chamberH);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
        ctx.fillRect(tube2X, chamberY, 100, chamberH);
        ctx.fillStyle = '#10b981';
        ctx.fillText('AIR RESISTANCE', tube2X + 50, chamberY - 10);

        const airDragPos = Math.min(heightM, 0.5 * (gravity / (1 + airResistance * 0.5)) * clampedT * clampedT);
        const featherY = chamberY + (airDragPos / heightM) * (chamberH - 40) + 20;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(tube2X + 50, featherY, 14, 0, Math.PI * 2);
        ctx.fill();

        break;
      }

      case 'fluid-pressure': {
        const fluidDensity = params.fluidDensity ?? 1000;
        const probeDepth = params.depth ?? 2.5;
        const gravity = params.gravity ?? 9.81;
        const atmosphericPressure = params.atmosphericPressure ?? 101.325;

        const gaugePressureKPa = (fluidDensity * gravity * probeDepth) / 1000;
        const totalPressureKPa = atmosphericPressure + gaugePressureKPa;

        onObservablesUpdate({
          depth: probeDepth,
          density: fluidDensity,
          gaugePressure: gaugePressureKPa,
          pressure: totalPressureKPa,
          buoyantForce: fluidDensity * gravity * 0.001,
        });

        // Draw Tank of Liquid
        const tankX = width / 2 - 160;
        const tankY = 80;
        const tankW = 320;
        const tankH = height - 140;

        ctx.fillStyle = fluidDensity > 1200 ? 'rgba(148, 163, 184, 0.4)' : 'rgba(6, 182, 212, 0.25)';
        ctx.fillRect(tankX, tankY + 30, tankW, tankH - 30);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.strokeRect(tankX, tankY + 30, tankW, tankH - 30);

        // Fluid Surface
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(tankX, tankY + 28, tankW, 4);

        // Hydrostatic Probe Sensor
        const sensorY = tankY + 30 + (probeDepth / 5.0) * (tankH - 60);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(tankX + tankW / 2, tankY - 10);
        ctx.lineTo(tankX + tankW / 2, sensorY);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(tankX + tankW / 2, sensorY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Fira Code"';
        ctx.textAlign = 'center';
        ctx.fillText(`P = ${totalPressureKPa.toFixed(2)} kPa`, tankX + tankW / 2, sensorY - 18);

        break;
      }

      case 'continuity-bernoulli': {
        const d1 = params.diameter1 ?? 0.1;
        const d2 = params.diameter2 ?? 0.05;
        const v1 = params.inletVelocity ?? 2.0;
        const fluidDensity = params.fluidDensity ?? 1000;
        const p1_kPa = params.inletPressure ?? 150;

        const a1 = Math.PI * (d1 / 2) ** 2;
        const a2 = Math.PI * (d2 / 2) ** 2;
        const v2 = (a1 / a2) * v1;
        const deltaP = 0.5 * fluidDensity * (v2 * v2 - v1 * v1);
        const p2_kPa = p1_kPa - deltaP / 1000;

        onObservablesUpdate({
          inletVelocity: v1,
          throatVelocity: v2,
          velocityRatio: v2 / (v1 || 1),
          inletPressure: p1_kPa,
          throatPressure: p2_kPa,
          pressureDifferential: deltaP / 1000,
          flowRate: a1 * v1 * 1000, // L/s
        });

        // Draw Venturi Constriction Tube
        const pipeY = height / 2;
        const pipeLen = 500;
        const startX = (width - pipeLen) / 2;

        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 3;

        // Draw upper and lower walls
        ctx.beginPath();
        ctx.moveTo(startX, pipeY - 60);
        ctx.lineTo(startX + 180, pipeY - 60);
        ctx.lineTo(startX + 250, pipeY - 25);
        ctx.lineTo(startX + 320, pipeY - 25);
        ctx.lineTo(startX + 390, pipeY - 60);
        ctx.lineTo(startX + pipeLen, pipeY - 60);
        ctx.lineTo(startX + pipeLen, pipeY + 60);
        ctx.lineTo(startX + 390, pipeY + 60);
        ctx.lineTo(startX + 320, pipeY + 25);
        ctx.lineTo(startX + 250, pipeY + 25);
        ctx.lineTo(startX + 180, pipeY + 60);
        ctx.lineTo(startX, pipeY + 60);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Flow Streamline animated particles
        for (let i = 0; i < 8; i++) {
          const offsetT = (simulationTime * v1 * 60 + i * 60) % pipeLen;
          const px = startX + offsetT;
          let py = pipeY;
          if (px > startX + 180 && px < startX + 390) {
            py = pipeY + Math.sin(simulationTime * 5 + i) * 10;
          }
          ctx.fillStyle = '#00f2fe';
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Piezometer Tubes
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(startX + 90, pipeY - 140, 20, 80);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.fillRect(startX + 92, pipeY - 120, 16, 60);

        ctx.strokeRect(startX + 275, pipeY - 140, 20, 115);
        ctx.fillRect(startX + 277, pipeY - 80, 16, 55);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Fira Code"';
        ctx.textAlign = 'center';
        ctx.fillText(`v1=${v1.toFixed(1)}m/s`, startX + 90, pipeY + 80);
        ctx.fillText(`v2=${v2.toFixed(1)}m/s (Faster, Low P)`, startX + 285, pipeY + 50);

        ctx.restore();
        break;
      }

      case 'snells-law-optics': {
        const theta1Deg = params.incidentAngle ?? 45;
        const theta1Rad = (theta1Deg * Math.PI) / 180;
        const n1 = params.medium1Index ?? 1.0;
        const n2 = params.medium2Index ?? 1.52;

        const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
        const isTIR = sinTheta2 > 1.0;
        const theta2Rad = isTIR ? 0 : Math.asin(sinTheta2);
        const theta2Deg = (theta2Rad * 180) / Math.PI;
        const criticalAngleDeg = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : 90;

        onObservablesUpdate({
          incidentAngle: theta1Deg,
          refractedAngle: isTIR ? 90 : theta2Deg,
          sinTheta1: Math.sin(theta1Rad),
          sinTheta2: isTIR ? 1.0 : sinTheta2,
          criticalAngle: criticalAngleDeg,
          isTotalInternalReflection: isTIR,
          reflectance: isTIR ? 100 : 4.0,
        });

        // Medium Boundary
        const boundaryY = height / 2;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(0, 0, width, boundaryY);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fillRect(0, boundaryY, width, height - boundaryY);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, boundaryY);
        ctx.lineTo(width, boundaryY);
        ctx.stroke();

        // Normal Line
        const centerX = width / 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(centerX, 40);
        ctx.lineTo(centerX, height - 40);
        ctx.stroke();
        ctx.setLineDash([]);

        // Incident Ray
        const rayLen = 180;
        const srcX = centerX - rayLen * Math.sin(theta1Rad);
        const srcY = boundaryY - rayLen * Math.cos(theta1Rad);

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(srcX, srcY);
        ctx.lineTo(centerX, boundaryY);
        ctx.stroke();

        // Refracted / TIR Ray
        if (isTIR) {
          // Total Internal Reflection Ray
          const reflX = centerX + rayLen * Math.sin(theta1Rad);
          const reflY = boundaryY - rayLen * Math.cos(theta1Rad);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(centerX, boundaryY);
          ctx.lineTo(reflX, reflY);
          ctx.stroke();

          ctx.fillStyle = '#f43f5e';
          ctx.font = 'bold 12px "Fira Code"';
          ctx.fillText('100% TOTAL INTERNAL REFLECTION', centerX, boundaryY - 40);
        } else {
          // Refracted Ray into medium 2
          const refrX = centerX + rayLen * Math.sin(theta2Rad);
          const refrY = boundaryY + rayLen * Math.cos(theta2Rad);
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(centerX, boundaryY);
          ctx.lineTo(refrX, refrY);
          ctx.stroke();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`Medium 1 (n = ${n1.toFixed(2)})`, 30, boundaryY - 20);
        ctx.fillText(`Medium 2 (n = ${n2.toFixed(2)})`, 30, boundaryY + 30);

        break;
      }

      case 'standing-waves-resonance': {
        const stringLen = params.stringLength ?? 1.5;
        const tension = params.tension ?? 50;
        const mu = params.linearDensity ?? 0.005;
        const nMode = params.harmonicNumber ?? 2;
        const amp = params.driverAmplitude ?? 0.04;

        const waveSpeed = Math.sqrt(tension / mu);
        const wavelength = (2 * stringLen) / nMode;
        const frequency = (nMode * waveSpeed) / (2 * stringLen);
        const omega = 2 * Math.PI * frequency;

        onObservablesUpdate({
          frequency,
          waveSpeed,
          wavelength,
          harmonic: nMode,
          period: 1 / (frequency || 1),
          nodesCount: nMode + 1,
          antinodesCount: nMode,
        });

        // Draw Standing Wave String
        const startX = 100;
        const endX = width - 100;
        const stringPixelW = endX - startX;
        const waveCenterY = height / 2;

        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let px = 0; px <= stringPixelW; px += 2) {
          const xRatio = px / stringPixelW;
          const k = (nMode * Math.PI) / stringPixelW;
          const yDisp = amp * 900 * Math.sin(k * px) * Math.cos(simulationTime * 8);
          const py = waveCenterY + yDisp;
          if (px === 0) ctx.moveTo(startX + px, py);
          else ctx.lineTo(startX + px, py);
        }
        ctx.stroke();

        // Draw Node markers
        for (let nodeIdx = 0; nodeIdx <= nMode; nodeIdx++) {
          const nodeX = startX + (nodeIdx / nMode) * stringPixelW;
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(nodeX, waveCenterY, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Fira Code"';
        ctx.textAlign = 'center';
        ctx.fillText(`Harmonic n = ${nMode} | f = ${frequency.toFixed(1)} Hz | v = ${waveSpeed.toFixed(1)} m/s`, width / 2, waveCenterY - 60);

        break;
      }

      case 'ohms-law-dc-circuit': {
        const voltage = params.voltage ?? 12;
        const r1 = params.resistor1 ?? 10;
        const r2 = params.resistor2 ?? 20;
        const topology = params.circuitTopology ?? 1; // 0=single, 1=series, 2=parallel

        let req = r1;
        if (topology === 1) req = r1 + r2;
        if (topology === 2) req = (r1 * r2) / (r1 + r2);

        const current = voltage / req;
        const power = voltage * current;

        onObservablesUpdate({
          voltage,
          resistance: req,
          current,
          power,
          r1Current: topology === 2 ? voltage / r1 : current,
          r2Current: topology === 2 ? voltage / r2 : current,
        });

        // Draw Circuit Loop
        const circuitX = 140;
        const circuitY = 80;
        const circuitW = 440;
        const circuitH = 220;

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3;
        ctx.strokeRect(circuitX, circuitY, circuitW, circuitH);

        // Battery symbol on Left wire
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(circuitX - 10, circuitY + circuitH / 2 - 30, 20, 60);
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(circuitX - 25, circuitY + circuitH / 2 - 15);
        ctx.lineTo(circuitX + 25, circuitY + circuitH / 2 - 15);
        ctx.moveTo(circuitX - 15, circuitY + circuitH / 2 + 15);
        ctx.lineTo(circuitX + 15, circuitY + circuitH / 2 + 15);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px "Fira Code"';
        ctx.fillText(`+ ${voltage}V -`, circuitX - 40, circuitY + circuitH / 2 + 5);

        // Resistors on Top wire
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(circuitX + 160, circuitY - 15, 80, 30);
        ctx.strokeStyle = '#f59e0b';
        ctx.strokeRect(circuitX + 160, circuitY - 15, 80, 30);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`R1 = ${r1}Ω`, circuitX + 200, circuitY + 4);

        if (topology === 1) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(circuitX + 280, circuitY - 15, 80, 30);
          ctx.strokeStyle = '#f59e0b';
          ctx.strokeRect(circuitX + 280, circuitY - 15, 80, 30);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`R2 = ${r2}Ω`, circuitX + 320, circuitY + 4);
        }

        // Drifting electron charges animation
        const electronSpeed = (current * 40 * simulationTime) % (2 * (circuitW + circuitH));
        for (let eIdx = 0; eIdx < 12; eIdx++) {
          const ePos = (electronSpeed + eIdx * 70) % (2 * (circuitW + circuitH));
          let ex = circuitX;
          let ey = circuitY;
          if (ePos < circuitW) {
            ex = circuitX + ePos;
            ey = circuitY;
          } else if (ePos < circuitW + circuitH) {
            ex = circuitX + circuitW;
            ey = circuitY + (ePos - circuitW);
          } else if (ePos < 2 * circuitW + circuitH) {
            ex = circuitX + circuitW - (ePos - (circuitW + circuitH));
            ey = circuitY + circuitH;
          } else {
            ex = circuitX;
            ey = circuitY + circuitH - (ePos - (2 * circuitW + circuitH));
          }

          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(ex, ey, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px "Fira Code"';
        ctx.fillText(`I = ${current.toFixed(3)} A | P = ${power.toFixed(2)} W`, circuitX + circuitW / 2, circuitY + circuitH + 30);

        break;
      }

      default:
        break;
    }
  }, [experiment.id, params, isRunning, simulationTime, showVectors, showGrid, showTrails]);

  return (
    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        width={760}
        height={420}
        onClick={onCanvasClick}
        className="w-full h-full max-h-[500px] object-contain cursor-crosshair"
      />
    </div>
  );
};
