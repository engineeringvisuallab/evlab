import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MoleculeData } from '../../types/chemistry';
import { RotateCw, ZoomIn, ZoomOut, Eye, Layers } from 'lucide-react';

interface ThreeMoleculeViewerProps {
  molecule: MoleculeData;
  height?: number;
  showLabels?: boolean;
}

// CPK Element Colors
const ELEMENT_COLORS: Record<string, number> = {
  H: 0xffffff,
  C: 0x4a4a4a,
  N: 0x3050f8,
  O: 0xff2020,
  F: 0x70d050,
  Cl: 0x1ff01f,
  Br: 0xa62929,
  I: 0x940094,
  S: 0xffff30,
  P: 0xff8000,
  Na: 0xab5cf2,
  K: 0x8f40d4,
  Ca: 0x3dff00,
  Fe: 0xe06633,
  Cu: 0xc88033,
  Zn: 0x7d80b0
};

// Covalent Radii (scaled)
const ELEMENT_RADII: Record<string, number> = {
  H: 0.35,
  C: 0.65,
  N: 0.60,
  O: 0.58,
  F: 0.55,
  Cl: 0.75,
  Br: 0.85,
  I: 0.95,
  S: 0.80,
  P: 0.80,
  DEFAULT: 0.60
};

export const ThreeMoleculeViewer: React.FC<ThreeMoleculeViewerProps> = ({
  molecule,
  height = 360,
  showLabels = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderMode, setRenderMode] = useState<'ball_and_stick' | 'space_filling' | 'wireframe'>('ball_and_stick');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [selectedAtom, setSelectedAtom] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const currentHeight = height;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Deep slate
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / currentHeight, 0.1, 1000);
    camera.position.set(0, 0, 7);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, currentHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-5, -5, -3);
    scene.add(dirLight2);

    // Build Molecule Group
    const group = new THREE.Group();
    moleculeGroupRef.current = group;
    scene.add(group);

    // Atoms
    const atomRadiusMultiplier = renderMode === 'space_filling' ? 1.6 : renderMode === 'wireframe' ? 0.3 : 0.9;

    molecule.atoms.forEach((atom) => {
      const radius = (ELEMENT_RADII[atom.element] || ELEMENT_RADII.DEFAULT) * atomRadiusMultiplier;
      const color = ELEMENT_COLORS[atom.element] || 0xcccccc;

      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.15,
        wireframe: renderMode === 'wireframe'
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(atom.x, atom.y, atom.z);
      mesh.userData = { atomId: atom.id, element: atom.element };
      group.add(mesh);
    });

    // Bonds
    if (renderMode !== 'space_filling') {
      const atomMap = new Map<string, (typeof molecule.atoms)[number]>(
        molecule.atoms.map((a) => [a.id, a])
      );

      molecule.bonds.forEach((bond) => {
        const atomA = atomMap.get(bond.from);
        const atomB = atomMap.get(bond.to);
        if (!atomA || !atomB) return;

        const vA = new THREE.Vector3(atomA.x, atomA.y, atomA.z);
        const vB = new THREE.Vector3(atomB.x, atomB.y, atomB.z);
        const distance = vA.distanceTo(vB);
        const midPoint = new THREE.Vector3().addVectors(vA, vB).multiplyScalar(0.5);

        const bondRadius = bond.order === 3 ? 0.14 : bond.order === 2 ? 0.11 : 0.08;
        const bondGeom = new THREE.CylinderGeometry(bondRadius, bondRadius, distance, 16);
        const bondMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.4,
          metalness: 0.2
        });

        const cylinder = new THREE.Mesh(bondGeom, bondMat);
        cylinder.position.copy(midPoint);
        cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(vB, vA).normalize());
        group.add(cylinder);
      });
    }

    // Interactive Drag Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const domElement = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !group) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      group.rotation.y += deltaX * 0.01;
      group.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z += e.deltaY * 0.005;
      cameraRef.current.position.z = Math.max(3, Math.min(15, cameraRef.current.position.z));
    };

    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      if (autoRotate && group && !isDragging) {
        group.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const newWidth = containerRef.current.clientWidth;
      camera.aspect = newWidth / currentHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, currentHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [molecule, renderMode, autoRotate, height]);

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z += delta;
    cameraRef.current.position.z = Math.max(3, Math.min(15, cameraRef.current.position.z));
  };

  const handleResetRotation = () => {
    if (moleculeGroupRef.current) {
      moleculeGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900 shadow-xl" id={`molecule-viewer-${molecule.id}`}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full cursor-grab active:cursor-grabbing" style={{ height: `${height}px` }} />

      {/* Floating Toolbar Controls */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-md">
        <span className="text-xs font-semibold text-cyan-400 mr-1.5">{molecule.formula}</span>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">({molecule.vseprGeometry})</span>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-md">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-lg text-xs transition-colors ${autoRotate ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
          title="Toggle Auto Rotation"
          id="btn-toggle-autorotate"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(-1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          title="Zoom In"
          id="btn-zoom-in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          title="Zoom Out"
          id="btn-zoom-out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-700 mx-0.5" />

        <div className="flex bg-slate-900/80 rounded-lg p-0.5">
          <button
            onClick={() => setRenderMode('ball_and_stick')}
            className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${renderMode === 'ball_and_stick' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            id="mode-ball-stick"
          >
            Ball & Stick
          </button>
          <button
            onClick={() => setRenderMode('space_filling')}
            className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${renderMode === 'space_filling' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            id="mode-space-filling"
          >
            Space-Fill
          </button>
          <button
            onClick={() => setRenderMode('wireframe')}
            className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${renderMode === 'wireframe' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            id="mode-wireframe"
          >
            Wireframe
          </button>
        </div>
      </div>

      {/* Bottom Properties Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-800/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/70 text-xs">
        <div className="flex items-center gap-4 text-slate-300">
          <div><span className="text-slate-400">Molar Mass:</span> <strong className="text-white">{molecule.molarMass} g/mol</strong></div>
          <div><span className="text-slate-400">Bond Angle:</span> <strong className="text-white">{molecule.bondAngle}°</strong></div>
          <div><span className="text-slate-400">Dipole:</span> <strong className="text-white">{molecule.dipoleMoment} D</strong></div>
          <div><span className="text-slate-400">Hybridization:</span> <strong className="text-cyan-300">{molecule.hybridization}</strong></div>
        </div>
        <button
          onClick={handleResetRotation}
          className="text-slate-400 hover:text-cyan-300 transition-colors font-medium ml-auto"
          id="btn-reset-view"
        >
          Reset View
        </button>
      </div>
    </div>
  );
};
