import React, { useEffect, useRef } from 'react';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  label?: string;
  type?: 'reactantA' | 'reactantB' | 'product' | 'ionPos' | 'ionNeg' | 'neutral' | 'electron';
}

interface ParticleCanvasProps {
  particleCount?: number;
  temperature?: number; // Kelvin (controls velocity scale)
  particleType?: 'gas' | 'ions' | 'kinetics' | 'electrons';
  collisionThresholdEa?: number; // Activation energy threshold for kinetics
  onReactionEvent?: () => void;
  height?: number;
  className?: string;
  customParticles?: Particle[];
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  particleCount = 40,
  temperature = 300,
  particleType = 'gas',
  collisionThresholdEa = 50,
  onReactionEvent,
  height = 280,
  className = '',
  customParticles
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animIdRef = useRef<number | null>(null);

  // Initialize particles
  useEffect(() => {
    if (customParticles && customParticles.length > 0) {
      particlesRef.current = customParticles;
      return;
    }

    const particles: Particle[] = [];
    const speedScale = Math.sqrt(temperature / 300) * 1.8;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 1.5 + 0.5) * speedScale;

      if (particleType === 'gas') {
        particles.push({
          x: Math.random() * 400 + 20,
          y: Math.random() * (height - 40) + 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 5,
          color: '#38bdf8', // Cyan gas particle
          type: 'neutral'
        });
      } else if (particleType === 'ions') {
        const isPos = i % 2 === 0;
        particles.push({
          x: Math.random() * 400 + 20,
          y: Math.random() * (height - 40) + 20,
          vx: Math.cos(angle) * speed * 0.6,
          vy: Math.sin(angle) * speed * 0.6,
          radius: isPos ? 6 : 8,
          color: isPos ? '#f43f5e' : '#3b82f6', // H+ red, OH-/Cl- blue
          label: isPos ? 'H⁺' : 'OH⁻',
          type: isPos ? 'ionPos' : 'ionNeg'
        });
      } else if (particleType === 'kinetics') {
        const isReactantA = i % 2 === 0;
        particles.push({
          x: Math.random() * 400 + 20,
          y: Math.random() * (height - 40) + 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 6,
          color: isReactantA ? '#f59e0b' : '#06b6d4', // Reactant A amber, Reactant B teal
          label: isReactantA ? 'A' : 'B',
          type: isReactantA ? 'reactantA' : 'reactantB'
        });
      } else if (particleType === 'electrons') {
        particles.push({
          x: Math.random() * 400 + 20,
          y: Math.random() * (height - 40) + 20,
          vx: Math.cos(angle) * speed * 2.2,
          vy: Math.sin(angle) * speed * 2.2,
          radius: 3,
          color: '#facc15', // Yellow delocalized electron
          type: 'electron'
        });
      }
    }

    particlesRef.current = particles;
  }, [particleCount, temperature, particleType, height, customParticles]);

  // Main Canvas Rendering & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let canvasHeight = canvas.height;

    const render = () => {
      ctx.clearRect(0, 0, width, canvasHeight);

      // Background styling
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, canvasHeight);

      // Subtle grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y < canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const speedFactor = Math.sqrt(temperature / 300);
      const particles = particlesRef.current;

      // Update and Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;

        // Bounce on borders
        if (p.x - p.radius < 0) {
          p.x = p.radius;
          p.vx = -p.vx;
        } else if (p.x + p.radius > width) {
          p.x = width - p.radius;
          p.vx = -p.vx;
        }

        if (p.y - p.radius < 0) {
          p.y = p.radius;
          p.vy = -p.vy;
        } else if (p.y + p.radius > canvasHeight) {
          p.y = canvasHeight - p.radius;
          p.vy = -p.vy;
        }

        // Kinetic collision checks between particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < p.radius + p2.radius && dist > 0) {
            // Elastic collision bounce
            const nx = dx / dist;
            const ny = dy / dist;
            const kx = p.vx - p2.vx;
            const ky = p.vy - p2.vy;
            const pVal = 2 * (nx * kx + ny * ky) / 2;

            p.vx -= pVal * nx;
            p.vy -= pVal * ny;
            p2.vx += pVal * nx;
            p2.vy += pVal * ny;

            // Chemical Reaction Condition check
            if (
              particleType === 'kinetics' &&
              ((p.type === 'reactantA' && p2.type === 'reactantB') || (p.type === 'reactantB' && p2.type === 'reactantA'))
            ) {
              const relVelocity = Math.hypot(kx, ky);
              const collisionEnergy = 0.5 * relVelocity * relVelocity * 20;

              if (collisionEnergy >= collisionThresholdEa) {
                // Successful effective collision -> Form Product C!
                p.type = 'product';
                p.color = '#10b981'; // Emerald product
                p.label = 'C';
                p.radius = 7;

                // Eliminate reactant B
                particles.splice(j, 1);
                if (onReactionEvent) onReactionEvent();
                break;
              }
            }
          }
        }

        // Draw particle glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();

        // Label if present
        if (p.label) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.label, p.x, p.y);
        }
        ctx.restore();
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [temperature, particleType, collisionThresholdEa, onReactionEvent]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 ${className}`}>
      <canvas
        ref={canvasRef}
        width={500}
        height={height}
        className="w-full h-full block"
      />
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-cyan-400">
        Particle Sim (T = {temperature} K)
      </div>
    </div>
  );
};
