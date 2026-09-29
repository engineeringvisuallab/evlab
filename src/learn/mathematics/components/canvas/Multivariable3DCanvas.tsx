import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { RotateCcw } from "lucide-react";

interface Props {
  variables: Record<string, number>;
  onVariableChange: (id: string, value: number) => void;
}

export const Multivariable3DCanvas: React.FC<Props> = ({
  variables,
  onVariableChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const x0 = variables.x0 ?? 0.8;
  const y0 = variables.y0 ?? 0.6;
  const a = variables.a ?? 0.5;
  const b = variables.b ?? 0.5;
  const surfaceType = variables.surfaceType ?? 0; // 0: Paraboloid, 1: Saddle, 2: Ripple

  const evalZ = (x: number, y: number): number => {
    if (surfaceType === 0) return a * x * x + b * y * y;
    if (surfaceType === 1) return a * x * x - b * y * y;
    const r = Math.sqrt(x * x + y * y);
    return Math.sin(r * 2.5) * 0.8;
  };

  const evalGrad = (x: number, y: number): { dfdx: number; dfdy: number } => {
    const h = 0.001;
    const dfdx = (evalZ(x + h, y) - evalZ(x - h, y)) / (2 * h);
    const dfdy = (evalZ(x, y + h) - evalZ(x, y - h)) / (2 * h);
    return { dfdx, dfdy };
  };

  const z0 = evalZ(x0, y0);
  const { dfdx, dfdy } = evalGrad(x0, y0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 380;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 6, 7);
    camera.lookAt(0, 0.5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xfbbf24, 0.8);
    pointLight.position.set(-5, 8, -5);
    scene.add(pointLight);

    // 3D Grid Helper
    const gridHelper = new THREE.GridHelper(6, 12, 0x475569, 0x334155);
    scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(3.5);
    scene.add(axesHelper);

    // 1. Build Surface Geometry
    const segments = 40;
    const size = 4.0;
    const geom = new THREE.PlaneGeometry(size, size, segments, segments);
    geom.rotateX(-Math.PI / 2); // Lay flat on X-Z plane

    const posAttr = geom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getZ(i); // In three.js geometry plane, Z acts as 2nd dimension
      const z = evalZ(x, y);
      posAttr.setY(i, z); // Set elevation on Y axis
    }
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.3,
      metalness: 0.2,
      wireframe: false,
      side: THREE.DoubleSide,
    });
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    const mesh = new THREE.Mesh(geom, mat);
    const wireMesh = new THREE.Mesh(geom, wireMat);
    scene.add(mesh);
    scene.add(wireMesh);

    // 2. Point of Tangency (Sphere)
    const sphereGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.5 });
    const pointSphere = new THREE.Mesh(sphereGeom, sphereMat);
    pointSphere.position.set(x0, z0, y0);
    scene.add(pointSphere);

    // 3. Tangent Plane Patch
    const tPlaneSize = 1.6;
    const tPlaneGeom = new THREE.PlaneGeometry(tPlaneSize, tPlaneSize);
    tPlaneGeom.rotateX(-Math.PI / 2);

    // Tangent plane normal: (-dfdx, 1, -dfdy)
    const normal = new THREE.Vector3(-dfdx, 1, -dfdy).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);

    const tPlaneMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const tPlaneMesh = new THREE.Mesh(tPlaneGeom, tPlaneMat);
    tPlaneMesh.position.set(x0, z0, y0);
    tPlaneMesh.setRotationFromQuaternion(quaternion);
    scene.add(tPlaneMesh);

    // 4. Gradient Vector Arrow on Surface
    const gradDir = new THREE.Vector3(dfdx, 0, dfdy).normalize();
    const gradArrow = new THREE.ArrowHelper(gradDir, new THREE.Vector3(x0, z0 + 0.05, y0), 1.2, 0x34d399, 0.25, 0.15);
    scene.add(gradArrow);

    // Interaction / Orbit
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let cameraAngleX = 0.8;
    let cameraAngleY = 0.7;
    let cameraDist = 9.5;

    const updateCameraPos = () => {
      camera.position.x = cameraDist * Math.cos(cameraAngleX) * Math.cos(cameraAngleY);
      camera.position.z = cameraDist * Math.sin(cameraAngleX) * Math.cos(cameraAngleY);
      camera.position.y = cameraDist * Math.sin(cameraAngleY);
      camera.lookAt(0, 0.5, 0);
      renderer.render(scene, camera);
    };

    updateCameraPos();

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      cameraAngleX += dx * 0.01;
      cameraAngleY = Math.max(0.1, Math.min(1.4, cameraAngleY + dy * 0.01));
      updateCameraPos();
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      domElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      renderer.dispose();
    };
  }, [x0, y0, a, b, surfaceType, z0, dfdx, dfdy]);

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">3D Multivariable Surface & Tangent Plane</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center bg-slate-800 rounded p-0.5">
            {["Paraboloid", "Saddle", "Ripple"].map((name, idx) => (
              <button
                key={name}
                onClick={() => onVariableChange("surfaceType", idx)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  surfaceType === idx ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-2 py-0.5 rounded text-slate-200 font-mono-math text-[11px]">
            <span className="text-amber-400">P₀ = ({x0.toFixed(2)}, {y0.toFixed(2)}, {z0.toFixed(2)})</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">∇f = ({dfdx.toFixed(2)}, {dfdy.toFixed(2)})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 italic text-[11px]">Click & drag to rotate 3D view</span>
          <button
            onClick={() => {
              onVariableChange("x0", 0.8);
              onVariableChange("y0", 0.6);
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="relative flex-1 min-h-[360px] w-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
