/**
 * EVLab 3D Physical Conduit & Flume Simulator
 * Three.js WebGL rendering with 3D particles, acrylic refractive material,
 * section cutaway, and camera orbital control.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LabTopicId, SimulationControls, FluidProperty } from '../../types';

interface ThreeDConduitSimulatorProps {
  labId: LabTopicId;
  parameters: Record<string, any>;
  results: Record<string, any>;
  fluid: FluidProperty;
  controls: SimulationControls;
}

export const ThreeDConduitSimulator: React.FC<ThreeDConduitSimulatorProps> = ({
  labId,
  parameters,
  results,
  fluid,
  controls,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const particlePositionsRef = useRef<Float32Array | null>(null);
  const particleVelocitiesRef = useRef<Float32Array | null>(null);
  const isInteractingRef = useRef<boolean>(false);
  const mousePrevRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Three.js Scene, Camera, Renderer
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // slate-950
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x0ea5e9, 1.0);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 3. Coordinate Grid
    const gridHelper = new THREE.GridHelper(16, 16, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -1.5;
    scene.add(gridHelper);

    // 4. Conduit / Flume 3D Solid Geometry
    const conduitGroup = new THREE.Group();
    scene.add(conduitGroup);

    // Create Conduit based on active lab
    const pipeMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: controls.cutaway3D ? 0.35 : 0.65,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
    });

    const flangeMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.4,
      metalness: 0.8,
    });

    if (labId === 'continuity' || labId === 'venturi') {
      // Contraction / Venturi Tube Geometry
      const geomInlet = new THREE.CylinderGeometry(1.2, 1.2, 3.5, 32, 1, true);
      geomInlet.rotateZ(Math.PI / 2);
      const meshInlet = new THREE.Mesh(geomInlet, pipeMat);
      meshInlet.position.x = -3.25;
      conduitGroup.add(meshInlet);

      const geomThroat = new THREE.CylinderGeometry(0.6, 1.2, 2.5, 32, 1, true);
      geomThroat.rotateZ(Math.PI / 2);
      const meshThroat = new THREE.Mesh(geomThroat, pipeMat);
      meshThroat.position.x = -0.25;
      conduitGroup.add(meshThroat);

      const geomOutlet = new THREE.CylinderGeometry(0.6, 0.6, 3.5, 32, 1, true);
      geomOutlet.rotateZ(Math.PI / 2);
      const meshOutlet = new THREE.Mesh(geomOutlet, pipeMat);
      meshOutlet.position.x = 2.75;
      conduitGroup.add(meshOutlet);
    } else if (labId === 'open-channel' || labId === 'hydraulic-jump') {
      // Open Flume U-Channel
      const flumeGeom = new THREE.BoxGeometry(9.0, 1.8, 2.2);
      const flumeMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.4,
        roughness: 0.2,
      });
      const flumeMesh = new THREE.Mesh(flumeGeom, flumeMat);
      flumeMesh.position.y = -0.4;
      conduitGroup.add(flumeMesh);
    } else {
      // Standard Straight Pipe
      const pipeGeom = new THREE.CylinderGeometry(1.0, 1.0, 8.5, 32, 1, true);
      pipeGeom.rotateZ(Math.PI / 2);
      const pipeMesh = new THREE.Mesh(pipeGeom, pipeMat);
      conduitGroup.add(pipeMesh);

      // Flanges at ends
      const flangeGeom1 = new THREE.TorusGeometry(1.05, 0.12, 16, 32);
      flangeGeom1.rotateY(Math.PI / 2);
      const f1 = new THREE.Mesh(flangeGeom1, flangeMat);
      f1.position.x = -4.25;
      conduitGroup.add(f1);

      const f2 = new THREE.Mesh(flangeGeom1, flangeMat);
      f2.position.x = 4.25;
      conduitGroup.add(f2);
    }

    // 5. 3D Particle Swarm
    const numParticles = controls.particleDensity === 'low' ? 300 : controls.particleDensity === 'medium' ? 750 : 1500;
    const positions = new Float32Array(numParticles * 3);
    const velocities = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);

    const baseSpeed = (results.velocity || results.v1 || 2.0) * 1.5;

    for (let i = 0; i < numParticles; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 8.0; // X
      positions[idx + 1] = (Math.random() - 0.5) * 1.4; // Y
      positions[idx + 2] = (Math.random() - 0.5) * 1.4; // Z

      velocities[idx] = baseSpeed * (0.8 + Math.random() * 0.4);
      velocities[idx + 1] = (Math.random() - 0.5) * 0.05;
      velocities[idx + 2] = (Math.random() - 0.5) * 0.05;

      // Color (cyan to bright blue)
      colors[idx] = 0.22;
      colors[idx + 1] = 0.74;
      colors[idx + 2] = 0.97;
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particleMesh = new THREE.Points(particleGeom, particleMat);
    scene.add(particleMesh);

    particlesMeshRef.current = particleMesh;
    particlePositionsRef.current = positions;
    particleVelocitiesRef.current = velocities;

    // 6. Interactive Orbit & Drag Handlers
    const onMouseDown = (e: MouseEvent) => {
      isInteractingRef.current = true;
      mousePrevRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isInteractingRef.current || !cameraRef.current) return;
      const dx = e.clientX - mousePrevRef.current.x;
      const dy = e.clientY - mousePrevRef.current.y;
      mousePrevRef.current = { x: e.clientX, y: e.clientY };

      const cam = cameraRef.current;
      const rotSpeed = 0.005;

      const radius = cam.position.length();
      let theta = Math.atan2(cam.position.x, cam.position.z);
      let phi = Math.acos(Math.max(-1, Math.min(1, cam.position.y / radius)));

      theta -= dx * rotSpeed;
      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - dy * rotSpeed));

      cam.position.x = radius * Math.sin(phi) * Math.sin(theta);
      cam.position.y = radius * Math.cos(phi);
      cam.position.z = radius * Math.sin(phi) * Math.cos(theta);
      cam.lookAt(0, 0, 0);
    };

    const onMouseUp = () => {
      isInteractingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const cam = cameraRef.current;
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      cam.position.multiplyScalar(zoomFactor);
      cam.position.clampLength(3.0, 25.0);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // 7. Animation Loop
    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (controls.isPlaying && particlePositionsRef.current && particleVelocitiesRef.current && particleMesh) {
        const pos = particlePositionsRef.current;
        const vel = particleVelocitiesRef.current;
        const count = pos.length / 3;

        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          pos[idx] += vel[idx] * controls.speed * dt;

          if (pos[idx] > 4.25) {
            pos[idx] = -4.25;
            pos[idx + 1] = (Math.random() - 0.5) * 1.3;
            pos[idx + 2] = (Math.random() - 0.5) * 1.3;
          }
        }

        particleMesh.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0] || !renderer || !camera) return;
      const { width: newW, height: newH } = entries[0].contentRect;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [labId, controls.particleDensity, controls.cutaway3D]);

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 4, 10);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full" />
      {/* 3D Viewport Controls HUD */}
      <div className="absolute top-3 right-3 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
        <button
          onClick={resetCamera}
          className="hover:text-sky-400 transition-colors cursor-pointer flex items-center space-x-1"
          title="Reset 3D View"
        >
          <span>Reset Camera</span>
        </button>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">Orbit: Drag • Zoom: Scroll</span>
      </div>
    </div>
  );
};
