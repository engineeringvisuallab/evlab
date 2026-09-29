import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGIS } from '../../context/GISContext';
import { RotateCw, Maximize2, Sun, Layers, Eye } from 'lucide-react';

export const MapCanvas3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { project, setViewMode } = useGIS();

  const [exaggeration, setExaggeration] = useState(2.5);
  const [showWireframe, setShowWireframe] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712'); // Deep slate dark
    scene.fog = new THREE.FogExp2('#030712', 0.0015);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 150, 220);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#38bdf8', 1.5);
    dirLight.position.set(100, 200, 100);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(400, 40, '#0284c7', '#1e293b');
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Terrain Geometry
    const terrainSize = 300;
    const terrainSegments = 60;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      // Realistic undulating terrain mesh function
      const y = (Math.sin(x * 0.03) * Math.cos(z * 0.03) * 12 + Math.sin(x * 0.08) * 4) * (exaggeration / 2);
      posAttr.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.8,
      metalness: 0.2,
      wireframe: showWireframe,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // Render 3D GIS Features from Project Layers
    const centerLng = project.center[0];
    const centerLat = project.center[1];

    const projectCoordsTo3D = (lng: number, lat: number): [number, number] => {
      const x = (lng - centerLng) * 12000;
      const z = -(lat - centerLat) * 12000;
      return [x, z];
    };

    project.layers.forEach((layer) => {
      if (!layer.visible) return;

      layer.features.forEach((feat) => {
        const geom = feat.geometry as any;
        if (!geom) return;

        // 1. Point 3D Render (Valves, Hydrants, Water Towers, Spot Elevation)
        if (geom.type === 'Point') {
          const [x, z] = projectCoordsTo3D(geom.coordinates[0], geom.coordinates[1]);
          const cat = feat.properties?.Category || feat.properties?.Type || '';

          if (cat.includes('Water Tank') || cat.includes('Tower')) {
            // Elevated Overhead Tank Cylinder
            const tankGeo = new THREE.CylinderGeometry(8, 8, 14, 16);
            const tankMat = new THREE.MeshStandardMaterial({ color: '#06b6d4', metalness: 0.8, roughness: 0.2 });
            const tankMesh = new THREE.Mesh(tankGeo, tankMat);
            tankMesh.position.set(x, 25, z);
            tankMesh.castShadow = true;
            scene.add(tankMesh);

            // Tank Support Leg
            const legGeo = new THREE.CylinderGeometry(1.5, 1.5, 18, 8);
            const legMat = new THREE.MeshStandardMaterial({ color: '#475569' });
            const legMesh = new THREE.Mesh(legGeo, legMat);
            legMesh.position.set(x, 9, z);
            scene.add(legMesh);
          } else {
            // Control Valve / Marker Sphere
            const sphereGeo = new THREE.SphereGeometry(3, 16, 16);
            const color = layer.symbology.fillColor || '#ef4444';
            const sphereMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
            const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
            sphereMesh.position.set(x, 4, z);
            scene.add(sphereMesh);
          }
        }

        // 2. LineString 3D Pipe Extrusion
        if (geom.type === 'LineString') {
          const coords = geom.coordinates as [number, number][];
          if (coords.length >= 2) {
            const curvePoints: THREE.Vector3[] = coords.map(([lng, lat]) => {
              const [x, z] = projectCoordsTo3D(lng, lat);
              return new THREE.Vector3(x, 2, z);
            });

            const curve = new THREE.CatmullRomCurve3(curvePoints);
            const diam = feat.properties?.Diameter_mm || 250;
            const tubeRadius = Math.max(0.8, (diam / 600) * 2.5);

            const tubeGeo = new THREE.TubeGeometry(curve, 32, tubeRadius, 8, false);
            const pipeColor = layer.symbology.strokeColor || '#0284c7';
            const tubeMat = new THREE.MeshStandardMaterial({
              color: pipeColor,
              metalness: 0.6,
              roughness: 0.3,
            });

            const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
            tubeMesh.castShadow = true;
            scene.add(tubeMesh);
          }
        }

        // 3. Polygon 3D Reservoir / Zone Extrusion
        if (geom.type === 'Polygon') {
          const coords = geom.coordinates[0] as [number, number][];
          if (coords.length > 3) {
            const shape = new THREE.Shape();
            coords.forEach(([lng, lat], idx) => {
              const [x, z] = projectCoordsTo3D(lng, lat);
              if (idx === 0) shape.moveTo(x, z);
              else shape.lineTo(x, z);
            });

            const extrudeSettings = {
              steps: 1,
              depth: feat.properties?.Type?.includes('Reservoir') ? 6 : 2,
              bevelEnabled: false,
            };

            const geom3D = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geom3D.rotateX(Math.PI / 2);

            const polyColor = layer.symbology.fillColor || '#0ea5e9';
            const mat3D = new THREE.MeshStandardMaterial({
              color: polyColor,
              transparent: true,
              opacity: 0.75,
              roughness: 0.1,
            });

            const mesh3D = new THREE.Mesh(geom3D, mat3D);
            mesh3D.position.y = 1;
            scene.add(mesh3D);
          }
        }
      });
    });

    // Orbit Controls Handling via Mouse
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      // Rotate camera around target
      const radius = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
      let theta = Math.atan2(camera.position.x, camera.position.z) - deltaX * 0.005;
      let phi = Math.acos(camera.position.y / radius) - deltaY * 0.005;

      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi));

      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);

      camera.lookAt(0, 0, 0);

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.multiplyScalar(e.deltaY > 0 ? 1.08 : 0.92);
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('wheel', handleWheel);
      if (renderer.domElement) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [project, exaggeration, showWireframe]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Viewport Controls Overlay */}
      <div className="absolute top-4 right-4 z-20 bg-slate-900/90 border border-slate-800 backdrop-blur text-slate-200 px-3 py-2.5 rounded-lg shadow-2xl flex flex-col gap-3 text-xs w-56">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-semibold text-cyan-400">
          <span className="flex items-center gap-1.5">
            <Maximize2 size={14} /> 3D GIS Viewport
          </span>
          <button
            onClick={() => setViewMode('2D')}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider transition"
          >
            2D Map
          </button>
        </div>

        {/* Vertical Exaggeration Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Vertical Exaggeration:</span>
            <span className="font-mono text-cyan-300">{exaggeration}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="0.5"
            value={exaggeration}
            onChange={(e) => setExaggeration(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* Wireframe toggle */}
        <button
          onClick={() => setShowWireframe(!showWireframe)}
          className={`w-full py-1.5 px-2 rounded border flex items-center justify-center gap-2 text-xs transition ${
            showWireframe
              ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
              : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <Layers size={13} />
          {showWireframe ? 'Hide Mesh Wireframe' : 'Show Terrain Wireframe'}
        </button>

        <div className="text-[10px] text-slate-500 leading-tight">
          Left Click + Drag: Orbit Camera
          <br />
          Scroll Wheel: Zoom In / Out
        </div>
      </div>
    </div>
  );
};
