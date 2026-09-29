/**
 * EVLab WaterFlow - 3D WebGL Water Network Visualization Engine
 * Renders 3D extruded pipe tubes, junction spheres, storage tanks, and pump stations using Three.js.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { Pipe, Junction, Tank, Reservoir, getNodesList, getLinksList } from '../../types/waterflow';

export const Canvas3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { model, setViewMode } = useWaterFlow();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');
    scene.fog = new THREE.FogExp2('#090d16', 0.0008);

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    camera.position.set(500, 600, 800);
    camera.lookAt(500, 0, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.2);
    dirLight.position.set(400, 1000, 500);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 3. Ground Plane Grid
    const gridHelper = new THREE.GridHelper(3000, 60, '#1e293b', '#0f172a');
    gridHelper.position.set(500, -5, 200);
    scene.add(gridHelper);

    // Extract nodes and links
    const nodes = getNodesList(model.nodes);
    const links = getLinksList(model.links);
    const nodesMap = new Map(nodes.map(n => [n.id, n]));

    // 4. Render 3D NODES
    nodes.forEach(node => {
      if (!node || node.x === undefined || node.y === undefined) return;
      const zHeight = node.elevation || 0;

      if (node.type === 'junction') {
        const j = node as Junction;
        // Sphere for junction
        const geom = new THREE.SphereGeometry(12, 16, 16);
        let matColor = '#38bdf8';
        if (j.pressure !== undefined) {
          matColor = j.pressure < 100 ? '#ef4444' : j.pressure < 400 ? '#22c55e' : '#3b82f6';
        }
        const mat = new THREE.MeshStandardMaterial({ color: matColor, roughness: 0.3 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(node.x, zHeight, node.y);
        scene.add(mesh);
      } else if (node.type === 'reservoir') {
        // Reservoir Water Block
        const geom = new THREE.BoxGeometry(40, 30, 40);
        const mat = new THREE.MeshStandardMaterial({ color: '#0284c7', transparent: true, opacity: 0.8 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(node.x, zHeight + 15, node.y);
        scene.add(mesh);
      } else if (node.type === 'tank') {
        const t = node as Tank;
        // Cylindrical Tank
        const tankRadius = Math.max(15, (t.diameter || 12) * 1.5);
        const tankHeight = Math.max(30, (t.maxLevel || 10) * 4);
        const geom = new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight, 24);
        const mat = new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.2 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(node.x, zHeight + tankHeight / 2, node.y);
        scene.add(mesh);
      }
    });

    // 5. Render 3D PIPES (Cylinders connecting node 1 -> node 2)
    links.forEach(link => {
      const start = nodesMap.get(link.startNodeId);
      const end = nodesMap.get(link.endNodeId);
      if (!start || !end || start.x === undefined || start.y === undefined || end.x === undefined || end.y === undefined) return;

      const p1 = new THREE.Vector3(start.x, start.elevation || 0, start.y);
      const p2 = new THREE.Vector3(end.x, end.elevation || 0, end.y);

      const distance = p1.distanceTo(p2);
      if (distance <= 0) return;

      let radius = 4;
      if (link.type === 'pipe') {
        radius = Math.max(2, Math.min(10, ((link as Pipe).diameter || 200) / 40));
      }

      const geom = new THREE.CylinderGeometry(radius, radius, distance, 12);

      let pipeColor = '#3b82f6';
      if (link.type === 'pipe') {
        const pipe = link as Pipe;
        if (pipe.velocity !== undefined) {
          pipeColor = pipe.velocity < 1.0 ? '#38bdf8' : pipe.velocity < 2.0 ? '#22c55e' : '#ef4444';
        }
      } else if (link.type === 'pump') {
        pipeColor = '#f59e0b';
      } else if (link.type === 'valve') {
        pipeColor = '#a855f7';
      }

      const mat = new THREE.MeshStandardMaterial({ color: pipeColor, roughness: 0.4 });
      const mesh = new THREE.Mesh(geom, mat);

      // Position cylinder at midpoint and orient along vector p1 -> p2
      const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mesh.position.copy(midPoint);

      const orientation = new THREE.Matrix4();
      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      orientation.lookAt(p1, p2, up);

      mesh.quaternion.setFromRotationMatrix(
        new THREE.Matrix4().makeRotationX(Math.PI / 2).multiply(
          new THREE.Matrix4().lookAt(p1, p2, new THREE.Vector3(0, 1, 0))
        )
      );

      scene.add(mesh);
    });

    // 6. Simple Mouse Drag Orbit Controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;

      // Rotate camera around center (500, 0, 200)
      const radius = camera.position.distanceTo(new THREE.Vector3(500, 0, 200));
      const theta = Math.atan2(camera.position.x - 500, camera.position.z - 200) - deltaX * 0.005;
      const phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, Math.acos(camera.position.y / radius) + deltaY * 0.005));

      camera.position.x = 500 + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = 200 + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(500, 0, 200);

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [model]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D View Controls Banner */}
      <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-800 p-2.5 rounded shadow-2xl text-slate-200 text-xs flex items-center gap-3">
        <span className="font-bold text-cyan-400">3D WebGL Network View</span>
        <span className="text-[11px] text-slate-400">Drag mouse to orbit camera</span>
        <button
          onClick={() => setViewMode('2D')}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1 rounded font-semibold text-[11px] transition"
        >
          Return to 2D CAD
        </button>
      </div>
    </div>
  );
};
