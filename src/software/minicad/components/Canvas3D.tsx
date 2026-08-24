import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  CADObject,
  Layer,
  Point3D,
  ToolType,
  View3DPreset,
  Shading3DMode,
  Box3DObject,
  Cylinder3DObject,
  Sphere3DObject,
  Cone3DObject,
  RectangleObject,
  CircleObject,
  LineObject,
} from '../types/cad';
import {
  Box,
  Eye,
  Grid,
  Maximize2,
  Move,
  RotateCcw,
  Sparkles,
  BoxSelect,
  Compass,
  ArrowUp,
  Sliders,
  Layers2,
  Trash2,
} from 'lucide-react';

interface Canvas3DProps {
  objects: CADObject[];
  layers: Layer[];
  activeTool: ToolType;
  activeLayerId: string;
  activeColor: string;
  selectedObjectIds: string[];
  onSelectObjects: (ids: string[]) => void;
  onAddObject: (obj: CADObject) => void;
  onUpdateObject: (obj: CADObject) => void;
  onCursorMove?: (pt: Point3D | null) => void;
  setStatusInstruction: (text: string) => void;
  logMessage: (text: string, type?: 'info' | 'success' | 'warn' | 'cmd') => void;
}

export const Canvas3D: React.FC<Canvas3DProps> = ({
  objects,
  layers,
  activeTool,
  activeLayerId,
  activeColor,
  selectedObjectIds,
  onSelectObjects,
  onAddObject,
  onUpdateObject,
  onCursorMove,
  setStatusInstruction,
  logMessage,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Scene & Three.js Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesGroupRef = useRef<THREE.Group | null>(null);
  const gizmoGroupRef = useRef<THREE.Group | null>(null);
  const previewMeshRef = useRef<THREE.Mesh | THREE.LineSegments | null>(null);

  // View States
  const [shadingMode, setShadingMode] = useState<Shading3DMode>('shaded_wire');
  const [viewPreset, setViewPreset] = useState<View3DPreset>('isometric');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showShadows, setShowShadows] = useState<boolean>(true);
  const [useOrthographic, setUseOrthographic] = useState<boolean>(false);

  // Drag creation and extrusion state
  const isCreatingRef = useRef<boolean>(false);
  const creationStartPoint = useRef<Point3D | null>(null);
  const currentCursor3D = useRef<Point3D | null>(null);
  const activeExtrudeObjRef = useRef<CADObject | null>(null);
  const extrudeStartPointRef = useRef<Point3D | null>(null);

  // Live dimensions overlay state
  const [liveDimensionText, setLiveDimensionText] = useState<string | null>(null);

  // Color lookup helper
  const getObjectColor = useCallback(
    (obj: CADObject): string => {
      if (obj.color) return obj.color;
      const layer = layers.find((l) => l.id === obj.layerId);
      return layer ? layer.color : '#00e5ff';
    },
    [layers]
  );

  // Set Camera Presets smoothly
  const applyViewPreset = useCallback((preset: View3DPreset) => {
    setViewPreset(preset);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const target = controls.target;
    const dist = camera.position.distanceTo(target) || 160;

    let newPos = new THREE.Vector3();
    if (preset === 'isometric') {
      newPos.set(target.x + dist * 0.7, target.y - dist * 0.7, target.z + dist * 0.7);
    } else if (preset === 'top') {
      newPos.set(target.x, target.y + 0.001, target.z + dist);
    } else if (preset === 'front') {
      newPos.set(target.x, target.y - dist, target.z);
    } else if (preset === 'right') {
      newPos.set(target.x + dist, target.y, target.z);
    }

    camera.position.copy(newPos);
    controls.update();
    logMessage(`Switched 3D View: ${preset.toUpperCase()}`, 'info');
  }, [logMessage]);

  // Setup Three.js Scene and OrbitControls
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#121418');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    camera.up.set(0, 0, 1); // Z is UP in CAD!
    camera.position.set(120, -140, 110);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(150, -150, 250);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    dirLight1.shadow.camera.near = 10;
    dirLight1.shadow.camera.far = 1000;
    const d = 200;
    dirLight1.shadow.camera.left = -d;
    dirLight1.shadow.camera.right = d;
    dirLight1.shadow.camera.top = d;
    dirLight1.shadow.camera.bottom = -d;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x80d8ff, 0.4);
    dirLight2.position.set(-150, 150, -100);
    scene.add(dirLight2);

    // 6. CAD 3D Workplane Grid
    const gridHelper = new THREE.GridHelper(400, 40, 0x00e5ff, 0x2d323e);
    gridHelper.rotation.x = Math.PI / 2; // XY plane orientation
    gridHelper.position.z = -0.05;
    scene.add(gridHelper);

    // 7. Ground Plane for Shadows
    const shadowPlaneGeom = new THREE.PlaneGeometry(600, 600);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeom, shadowPlaneMat);
    shadowPlane.position.z = -0.1;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 8. Axis Triad at Origin
    const axesHelper = new THREE.AxesHelper(40);
    scene.add(axesHelper);

    // 9. Groups
    const meshesGroup = new THREE.Group();
    scene.add(meshesGroup);
    meshesGroupRef.current = meshesGroup;

    const gizmoGroup = new THREE.Group();
    scene.add(gizmoGroup);
    gizmoGroupRef.current = gizmoGroup;

    // 10. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update OrbitControls behavior when tools change
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.enabled = true;

    // Custom OrbitControls Mouse Button mapping:
    // When in drawing mode: Left Click = Custom CAD Drawing, Right Click = Rotate Orbit, Middle = Pan
    // When in orbit/select mode: Left Click = Rotate Orbit, Right Click = Pan, Middle = Zoom
    if (activeTool === 'orbit_3d' || activeTool === 'select' || activeTool === 'pan') {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
    } else {
      // Drawing tools active: disable Left Click orbit so left mouse drags create 3D solids smoothly,
      // but keep Right Click and Middle Click for Orbit & Pan!
      controls.mouseButtons = {
        LEFT: -1 as unknown as THREE.MOUSE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
    }
  }, [activeTool]);

  // Render CAD Objects into Three.js Scene
  useEffect(() => {
    const group = meshesGroupRef.current;
    if (!group) return;

    // Clear previous meshes
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
      group.remove(child);
    }

    const createMaterial = (hexColor: string, isSelected: boolean) => {
      const col = isSelected ? new THREE.Color('#00ffff') : new THREE.Color(hexColor);

      if (shadingMode === 'pure_wire') {
        return new THREE.MeshBasicMaterial({ color: col, wireframe: true });
      } else if (shadingMode === 'flat') {
        return new THREE.MeshLambertMaterial({ color: col, flatShading: true });
      } else if (shadingMode === 'xray') {
        return new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.4, depthWrite: false });
      } else if (shadingMode === 'matcap') {
        return new THREE.MeshStandardMaterial({ color: col, metalness: 0.85, roughness: 0.15 });
      } else {
        // 'shaded_wire' - Pro CAD standard with crisp edge lines
        return new THREE.MeshStandardMaterial({ color: col, roughness: 0.35, metalness: 0.2 });
      }
    };

    objects.forEach((obj) => {
      const isSelected = selectedObjectIds.includes(obj.id);
      const colorHex = getObjectColor(obj);
      const mat = createMaterial(colorHex, isSelected);

      let mesh: THREE.Object3D | null = null;
      let edgesMesh: THREE.LineSegments | null = null;

      if (obj.type === 'box_3d') {
        const box = obj as Box3DObject;
        const geom = new THREE.BoxGeometry(box.width, box.length, box.height);
        geom.translate(box.width / 2, box.length / 2, box.height / 2);

        mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(box.x, box.y, box.z || 0);

        const edgesGeom = new THREE.EdgesGeometry(geom);
        edgesMesh = new THREE.LineSegments(
          edgesGeom,
          new THREE.LineBasicMaterial({ color: isSelected ? 0x00ffff : 0xffffff, linewidth: 2 })
        );
        mesh.add(edgesMesh);
      } else if (obj.type === 'cylinder_3d') {
        const cyl = obj as Cylinder3DObject;
        const geom = new THREE.CylinderGeometry(cyl.radius, cyl.radius, cyl.height, cyl.segments || 36);
        geom.rotateX(Math.PI / 2);
        geom.translate(0, 0, cyl.height / 2);

        mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(cyl.x, cyl.y, cyl.z || 0);

        const edgesGeom = new THREE.EdgesGeometry(geom);
        edgesMesh = new THREE.LineSegments(
          edgesGeom,
          new THREE.LineBasicMaterial({ color: isSelected ? 0x00ffff : 0xffffff })
        );
        mesh.add(edgesMesh);
      } else if (obj.type === 'sphere_3d') {
        const sph = obj as Sphere3DObject;
        const geom = new THREE.SphereGeometry(sph.radius, 28, 28);
        geom.translate(0, 0, sph.radius);

        mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(sph.x, sph.y, sph.z || 0);
      } else if (obj.type === 'cone_3d') {
        const cone = obj as Cone3DObject;
        const geom = new THREE.ConeGeometry(cone.radius, cone.height, 28);
        geom.rotateX(Math.PI / 2);
        geom.translate(0, 0, cone.height / 2);

        mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(cone.x, cone.y, cone.z || 0);

        const edgesGeom = new THREE.EdgesGeometry(geom);
        edgesMesh = new THREE.LineSegments(
          edgesGeom,
          new THREE.LineBasicMaterial({ color: isSelected ? 0x00ffff : 0xffffff })
        );
        mesh.add(edgesMesh);
      } else if (obj.type === 'rectangle') {
        const rect = obj as RectangleObject;
        const extrudeH = rect.extrudeHeight || 0;

        if (extrudeH > 0) {
          const shape = new THREE.Shape();
          shape.moveTo(0, 0);
          shape.lineTo(rect.width, 0);
          shape.lineTo(rect.width, rect.height);
          shape.lineTo(0, rect.height);
          shape.closePath();

          const geom = new THREE.ExtrudeGeometry(shape, { depth: extrudeH, bevelEnabled: false });
          mesh = new THREE.Mesh(geom, mat);
          mesh.position.set(rect.x, rect.y, rect.zPos || 0);

          const edgesGeom = new THREE.EdgesGeometry(geom);
          edgesMesh = new THREE.LineSegments(
            edgesGeom,
            new THREE.LineBasicMaterial({ color: isSelected ? 0x00ffff : 0xffffff, linewidth: 2 })
          );
          mesh.add(edgesMesh);
        } else {
          // Flat 2D shape in 3D
          const points = [
            new THREE.Vector3(rect.x, rect.y, rect.zPos || 0),
            new THREE.Vector3(rect.x + rect.width, rect.y, rect.zPos || 0),
            new THREE.Vector3(rect.x + rect.width, rect.y + rect.height, rect.zPos || 0),
            new THREE.Vector3(rect.x, rect.y + rect.height, rect.zPos || 0),
            new THREE.Vector3(rect.x, rect.y, rect.zPos || 0),
          ];
          const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
          mesh = new THREE.Line(
            lineGeom,
            new THREE.LineBasicMaterial({ color: isSelected ? 0x00ffff : colorHex, linewidth: 3 })
          );
        }
      } else if (obj.type === 'circle') {
        const circle = obj as CircleObject;
        const extrudeH = circle.extrudeHeight || 0;

        if (extrudeH > 0) {
          const geom = new THREE.CylinderGeometry(circle.radius, circle.radius, extrudeH, 36);
          geom.rotateX(Math.PI / 2);
          geom.translate(0, 0, extrudeH / 2);

          mesh = new THREE.Mesh(geom, mat);
          mesh.position.set(circle.centerX, circle.centerY, circle.zPos || 0);

          const edgesGeom = new THREE.EdgesGeometry(geom);
          edgesMesh = new THREE.LineSegments(
            edgesGeom,
            new THREE.LineBasicMaterial({ color: isSelected ? 0x00ffff : 0xffffff })
          );
          mesh.add(edgesMesh);
        } else {
          const curve = new THREE.EllipseCurve(
            circle.centerX,
            circle.centerY,
            circle.radius,
            circle.radius,
            0,
            2 * Math.PI,
            false,
            0
          );
          const points = curve.getPoints(64).map((p) => new THREE.Vector3(p.x, p.y, circle.zPos || 0));
          const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
          mesh = new THREE.Line(
            lineGeom,
            new THREE.LineBasicMaterial({ color: isSelected ? 0x00ffff : colorHex, linewidth: 3 })
          );
        }
      } else if (obj.type === 'line') {
        const line = obj as LineObject;
        const extrudeH = line.extrudeHeight || 0;

        if (extrudeH > 0) {
          const p1 = new THREE.Vector3(line.startX, line.startY, line.zPos || 0);
          const p2 = new THREE.Vector3(line.endX, line.endY, line.zPos || 0);
          const p3 = new THREE.Vector3(line.endX, line.endY, (line.zPos || 0) + extrudeH);
          const p4 = new THREE.Vector3(line.startX, line.startY, (line.zPos || 0) + extrudeH);

          const geom = new THREE.BufferGeometry().setFromPoints([p1, p2, p3, p1, p3, p4]);
          geom.computeVertexNormals();

          mesh = new THREE.Mesh(geom, mat);
          const edgesGeom = new THREE.EdgesGeometry(geom);
          edgesMesh = new THREE.LineSegments(
            edgesGeom,
            new THREE.LineBasicMaterial({ color: isSelected ? 0x00ffff : 0xffffff })
          );
          mesh.add(edgesMesh);
        } else {
          const points = [
            new THREE.Vector3(line.startX, line.startY, line.zPos || 0),
            new THREE.Vector3(line.endX, line.endY, line.zPos || 0),
          ];
          const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
          mesh = new THREE.Line(
            lineGeom,
            new THREE.LineBasicMaterial({ color: isSelected ? 0x00ffff : colorHex, linewidth: 3 })
          );
        }
      }

      if (mesh) {
        mesh.userData = { id: obj.id, obj };
        if (mesh instanceof THREE.Mesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
        group.add(mesh);
      }
    });
  }, [objects, selectedObjectIds, shadingMode, getObjectColor]);

  // Raycast against ground plane Z = 0
  const getGround3DPoint = (e: React.MouseEvent<HTMLDivElement>): Point3D | null => {
    if (!mountRef.current || !cameraRef.current) return null;

    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const target = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(plane, target)) {
      return { x: target.x, y: target.y, z: target.z };
    }
    return null;
  };

  // Mouse Down Event
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only process left click

    const pt3d = getGround3DPoint(e);
    if (!pt3d) return;

    if (activeTool === 'box_3d' || activeTool === 'cylinder_3d' || activeTool === 'sphere_3d' || activeTool === 'cone_3d') {
      isCreatingRef.current = true;
      creationStartPoint.current = pt3d;
      setLiveDimensionText(`Click & drag mouse to dimension 3D ${activeTool.replace('_3d', '')}`);
    } else if (activeTool === 'extrude_tool') {
      // Raycast object to extrude
      if (!mountRef.current || !cameraRef.current || !meshesGroupRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

      const intersects = raycaster.intersectObjects(meshesGroupRef.current.children, true);
      if (intersects.length > 0) {
        let topObj = intersects[0].object;
        while (topObj && !topObj.userData?.id && topObj.parent) {
          topObj = topObj.parent;
        }
        if (topObj && topObj.userData?.obj) {
          const cadObj = topObj.userData.obj as CADObject;
          activeExtrudeObjRef.current = cadObj;
          extrudeStartPointRef.current = pt3d;
          isCreatingRef.current = true;
          logMessage(`Started Extrude action on ${cadObj.type}`, 'info');
        }
      }
    } else if (activeTool === 'select') {
      // Object Selection Raycasting
      if (!mountRef.current || !cameraRef.current || !meshesGroupRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

      const intersects = raycaster.intersectObjects(meshesGroupRef.current.children, true);
      if (intersects.length > 0) {
        let topObj = intersects[0].object;
        while (topObj && !topObj.userData?.id && topObj.parent) {
          topObj = topObj.parent;
        }
        if (topObj && topObj.userData?.id) {
          onSelectObjects([topObj.userData.id]);
          logMessage(`Selected 3D Object: ${topObj.userData.obj.type}`, 'info');
        }
      } else {
        onSelectObjects([]);
      }
    }
  };

  // Clear Gizmo Live Preview
  const clearGizmoPreview = useCallback(() => {
    const gizmoGroup = gizmoGroupRef.current;
    if (!gizmoGroup) return;
    while (gizmoGroup.children.length > 0) {
      const child = gizmoGroup.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
      gizmoGroup.remove(child);
    }
  }, []);

  // Quick Insert Primitive Helpers
  const handleQuickInsert = (type: 'box' | 'cylinder' | 'sphere' | 'cone') => {
    const offset = (objects.filter((o) => o.type.includes('3d')).length + 1) * 20;
    if (type === 'box') {
      const newBox: Box3DObject = {
        id: 'box_' + Date.now(),
        type: 'box_3d',
        layerId: activeLayerId,
        color: activeColor,
        x: -25 + offset,
        y: -25 + offset,
        z: 0,
        width: 50,
        length: 50,
        height: 40,
      };
      onAddObject(newBox);
      logMessage('Quick-inserted 3D Box Block (50x50x40mm)', 'success');
    } else if (type === 'cylinder') {
      const newCyl: Cylinder3DObject = {
        id: 'cyl_' + Date.now(),
        type: 'cylinder_3d',
        layerId: activeLayerId,
        color: activeColor,
        x: offset,
        y: offset,
        z: 0,
        radius: 25,
        height: 50,
      };
      onAddObject(newCyl);
      logMessage('Quick-inserted 3D Cylinder Column (R:25, H:50mm)', 'success');
    } else if (type === 'sphere') {
      const newSph: Sphere3DObject = {
        id: 'sph_' + Date.now(),
        type: 'sphere_3d',
        layerId: activeLayerId,
        color: activeColor,
        x: offset,
        y: offset,
        z: 0,
        radius: 25,
      };
      onAddObject(newSph);
      logMessage('Quick-inserted 3D Sphere Dome (R:25mm)', 'success');
    } else if (type === 'cone') {
      const newCone: Cone3DObject = {
        id: 'cone_' + Date.now(),
        type: 'cone_3d',
        layerId: activeLayerId,
        color: activeColor,
        x: offset,
        y: offset,
        z: 0,
        radius: 25,
        height: 50,
      };
      onAddObject(newCone);
      logMessage('Quick-inserted 3D Cone Pyramid (R:25, H:50mm)', 'success');
    }
  };

  // Mouse Move Event
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pt3d = getGround3DPoint(e);
    if (pt3d) {
      currentCursor3D.current = pt3d;
      if (onCursorMove) onCursorMove(pt3d);
    }

    if (!isCreatingRef.current || !pt3d) return;

    const gizmoGroup = gizmoGroupRef.current;
    if (gizmoGroup) clearGizmoPreview();

    const previewMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.65,
      wireframe: false,
    });

    if (activeTool === 'extrude_tool' && activeExtrudeObjRef.current && extrudeStartPointRef.current) {
      const dy = Math.abs(pt3d.y - extrudeStartPointRef.current.y);
      const extrudeH = Math.max(5, Math.round(dy * 1.5));
      setLiveDimensionText(`Extrude Height: ${extrudeH} mm`);
    } else if (creationStartPoint.current && gizmoGroup) {
      const start = creationStartPoint.current;
      const dx = Math.abs(pt3d.x - start.x);
      const dy = Math.abs(pt3d.y - start.y);
      const dist = Math.hypot(pt3d.x - start.x, pt3d.y - start.y);

      if (activeTool === 'box_3d') {
        const width = Math.max(5, dx);
        const length = Math.max(5, dy);
        const height = Math.max(15, Math.round((dx + dy) / 2));
        setLiveDimensionText(`Width: ${width.toFixed(1)}mm  Length: ${length.toFixed(1)}mm  Height: ${height}mm`);

        const geom = new THREE.BoxGeometry(width, length, height);
        geom.translate(width / 2, length / 2, height / 2);
        const mesh = new THREE.Mesh(geom, previewMat);
        mesh.position.set(Math.min(start.x, pt3d.x), Math.min(start.y, pt3d.y), 0);
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(geom),
          new THREE.LineBasicMaterial({ color: 0xffffff })
        );
        mesh.add(edges);
        gizmoGroup.add(mesh);
      } else if (activeTool === 'cylinder_3d') {
        const radius = Math.max(5, Math.round(dist));
        const height = Math.max(20, Math.round(dist * 1.5));
        setLiveDimensionText(`Radius: ${radius}mm  Height: ${height}mm`);

        const geom = new THREE.CylinderGeometry(radius, radius, height, 32);
        geom.rotateX(Math.PI / 2);
        geom.translate(0, 0, height / 2);
        const mesh = new THREE.Mesh(geom, previewMat);
        mesh.position.set(start.x, start.y, 0);
        gizmoGroup.add(mesh);
      } else if (activeTool === 'sphere_3d') {
        const radius = Math.max(5, Math.round(dist));
        setLiveDimensionText(`Radius: ${radius}mm`);

        const geom = new THREE.SphereGeometry(radius, 24, 24);
        geom.translate(0, 0, radius);
        const mesh = new THREE.Mesh(geom, previewMat);
        mesh.position.set(start.x, start.y, 0);
        gizmoGroup.add(mesh);
      } else if (activeTool === 'cone_3d') {
        const radius = Math.max(5, Math.round(dist));
        const height = Math.max(20, Math.round(dist * 1.5));
        setLiveDimensionText(`Radius: ${radius}mm  Height: ${height}mm`);

        const geom = new THREE.ConeGeometry(radius, height, 24);
        geom.rotateX(Math.PI / 2);
        geom.translate(0, 0, height / 2);
        const mesh = new THREE.Mesh(geom, previewMat);
        mesh.position.set(start.x, start.y, 0);
        gizmoGroup.add(mesh);
      }
    }
  };

  // Mouse Up Event
  const handleMouseUp = () => {
    clearGizmoPreview();

    if (isCreatingRef.current && activeTool === 'extrude_tool' && activeExtrudeObjRef.current && currentCursor3D.current && extrudeStartPointRef.current) {
      const dy = Math.abs(currentCursor3D.current.y - extrudeStartPointRef.current.y);
      const extrudeH = Math.max(10, Math.round(dy * 1.5));
      onUpdateObject({ ...activeExtrudeObjRef.current, extrudeHeight: extrudeH });
      logMessage(`Successfully Extruded shape to ${extrudeH}mm solid`, 'success');
    } else if (isCreatingRef.current && creationStartPoint.current && currentCursor3D.current) {
      const start = creationStartPoint.current;
      const end = currentCursor3D.current;

      const dx = Math.abs(end.x - start.x);
      const dy = Math.abs(end.y - start.y);
      const dist = Math.hypot(end.x - start.x, end.y - start.y);

      if (dist > 2) {
        if (activeTool === 'box_3d') {
          const newBox: Box3DObject = {
            id: 'box_' + Date.now(),
            type: 'box_3d',
            layerId: activeLayerId,
            color: activeColor,
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            z: 0,
            width: Math.max(5, Math.round(dx)),
            length: Math.max(5, Math.round(dy)),
            height: Math.max(15, Math.round((dx + dy) / 2)),
          };
          onAddObject(newBox);
          logMessage(`Created 3D Box Block: ${newBox.width} x ${newBox.length} x ${newBox.height}mm`, 'success');
        } else if (activeTool === 'cylinder_3d') {
          const newCyl: Cylinder3DObject = {
            id: 'cyl_' + Date.now(),
            type: 'cylinder_3d',
            layerId: activeLayerId,
            color: activeColor,
            x: start.x,
            y: start.y,
            z: 0,
            radius: Math.max(5, Math.round(dist)),
            height: Math.max(20, Math.round(dist * 1.5)),
          };
          onAddObject(newCyl);
          logMessage(`Created 3D Cylinder: Radius ${newCyl.radius}mm, Height ${newCyl.height}mm`, 'success');
        } else if (activeTool === 'sphere_3d') {
          const newSph: Sphere3DObject = {
            id: 'sph_' + Date.now(),
            type: 'sphere_3d',
            layerId: activeLayerId,
            color: activeColor,
            x: start.x,
            y: start.y,
            z: 0,
            radius: Math.max(5, Math.round(dist)),
          };
          onAddObject(newSph);
          logMessage(`Created 3D Sphere Dome: Radius ${newSph.radius}mm`, 'success');
        } else if (activeTool === 'cone_3d') {
          const newCone: Cone3DObject = {
            id: 'cone_' + Date.now(),
            type: 'cone_3d',
            layerId: activeLayerId,
            color: activeColor,
            x: start.x,
            y: start.y,
            z: 0,
            radius: Math.max(5, Math.round(dist)),
            height: Math.max(20, Math.round(dist * 1.5)),
          };
          onAddObject(newCone);
          logMessage(`Created 3D Cone Pyramid: Radius ${newCone.radius}mm, Height ${newCone.height}mm`, 'success');
        }
      }
    }

    isCreatingRef.current = false;
    creationStartPoint.current = null;
    activeExtrudeObjRef.current = null;
    extrudeStartPointRef.current = null;
    setLiveDimensionText(null);
  };

  // Status Instructions
  useEffect(() => {
    if (activeTool === 'box_3d') setStatusInstruction('PRO 3D CAD: Click and drag on 3D plane to draw 3D Box');
    else if (activeTool === 'cylinder_3d') setStatusInstruction('PRO 3D CAD: Click center and drag outward to create 3D Cylinder column');
    else if (activeTool === 'sphere_3d') setStatusInstruction('PRO 3D CAD: Click center and drag outward to draw 3D Sphere dome');
    else if (activeTool === 'cone_3d') setStatusInstruction('PRO 3D CAD: Click center and drag outward to draw 3D Cone pyramid');
    else if (activeTool === 'extrude_tool') setStatusInstruction('PRO 3D EXTRUDE: Click 2D profile shape in 3D view & drag mouse up to pull 3D solid model');
    else setStatusInstruction('PRO 3D CAD Active: Left Drag = Orbit Camera | Right Drag = Pan | Scroll = Zoom to Cursor');
  }, [activeTool, setStatusInstruction]);

  return (
    <div className="flex-1 relative w-full h-full overflow-hidden select-none bg-[#121418]">
      {/* Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Floating 3D Navigation ViewCube / Camera Panel (Top Right) */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 bg-[#181b22]/90 backdrop-blur border border-[#2e3340] rounded-xl p-2.5 text-xs shadow-2xl z-20 min-w-[190px]">
        <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1 px-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" /> ViewCube Orientation
          </span>
          <Sparkles className="w-3 h-3 text-cyan-300" />
        </div>

        {/* View Presets */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => applyViewPreset('isometric')}
            className={`px-2 py-1.5 rounded-lg text-left transition-all flex items-center gap-1.5 ${
              viewPreset === 'isometric'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md ring-1 ring-cyan-300'
                : 'bg-[#222630] hover:bg-[#2c3240] text-gray-300'
            }`}
          >
            <BoxSelect className="w-3.5 h-3.5 text-cyan-300" /> Isometric
          </button>
          <button
            onClick={() => applyViewPreset('top')}
            className={`px-2 py-1.5 rounded-lg text-left transition-all flex items-center gap-1.5 ${
              viewPreset === 'top'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md ring-1 ring-cyan-300'
                : 'bg-[#222630] hover:bg-[#2c3240] text-gray-300'
            }`}
          >
            <Layers2 className="w-3.5 h-3.5 text-green-400" /> Top (XY)
          </button>
          <button
            onClick={() => applyViewPreset('front')}
            className={`px-2 py-1.5 rounded-lg text-left transition-all flex items-center gap-1.5 ${
              viewPreset === 'front'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md ring-1 ring-cyan-300'
                : 'bg-[#222630] hover:bg-[#2c3240] text-gray-300'
            }`}
          >
            <Move className="w-3.5 h-3.5 text-amber-400" /> Front (XZ)
          </button>
          <button
            onClick={() => applyViewPreset('right')}
            className={`px-2 py-1.5 rounded-lg text-left transition-all flex items-center gap-1.5 ${
              viewPreset === 'right'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md ring-1 ring-cyan-300'
                : 'bg-[#222630] hover:bg-[#2c3240] text-gray-300'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-purple-400" /> Right (YZ)
          </button>
        </div>

        <hr className="border-[#2e3340] my-1" />

        {/* Shading Style Selectors */}
        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 px-1">
          Material & Edge Rendering
        </div>
        <div className="grid grid-cols-2 gap-1">
          {(
            [
              ['shaded_wire', 'Solid + Edges'],
              ['pure_wire', 'Wireframe'],
              ['flat', 'Flat Shaded'],
              ['xray', 'X-Ray Translucent'],
              ['matcap', 'Metallic Chrome'],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setShadingMode(mode)}
              className={`px-1.5 py-1 rounded text-[10px] text-center transition-colors ${
                shadingMode === mode
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'bg-[#20242e] hover:bg-[#2c3240] text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <hr className="border-[#2e3340] my-1" />

        <div className="flex items-center justify-between text-gray-300 px-1 pt-0.5">
          <button
            onClick={() => {
              const controls = controlsRef.current;
              if (controls) {
                controls.target.set(0, 0, 0);
                controls.update();
              }
              applyViewPreset('isometric');
            }}
            className="flex items-center gap-1 text-[11px] hover:text-cyan-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Reset View Target
          </button>
        </div>
      </div>

      {/* Floating Live Dimensions Badge on Bottom Center */}
      {liveDimensionText && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#091828]/95 border-2 border-cyan-400 text-cyan-200 px-4 py-2 rounded-xl font-mono text-xs font-bold shadow-2xl flex items-center gap-2 z-30 animate-pulse">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{liveDimensionText}</span>
        </div>
      )}

      {/* Top Left Workspace Indicator & Quick Primitives Insertion */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
        <div className="flex items-center gap-2.5 bg-[#181b22]/90 backdrop-blur border border-[#2e3340] rounded-xl px-3 py-2 text-xs shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold text-white uppercase tracking-wide">3D Solid Engine</span>
          <span className="text-cyan-300 font-mono text-[11px] border-l border-[#3a3f4d] pl-2.5">
            Right Drag = Orbit Camera | Scroll = Zoom
          </span>
        </div>

        {/* Quick Insert 3D Primitives Toolbar */}
        <div className="flex items-center gap-1.5 bg-[#181b22]/95 backdrop-blur border border-[#2e3340] rounded-xl p-1.5 shadow-2xl">
          <span className="text-[10px] uppercase font-bold text-gray-400 px-1.5 flex items-center gap-1">
            <Box className="w-3.5 h-3.5 text-cyan-400" /> Insert 3D:
          </span>
          <button
            onClick={() => handleQuickInsert('box')}
            className="bg-[#222632] hover:bg-cyan-600 hover:text-white text-cyan-300 text-[11px] font-medium px-2 py-1 rounded-lg border border-[#343b4d] transition-all flex items-center gap-1"
            title="Quick Insert 3D Box Block"
          >
            + 3D Box
          </button>
          <button
            onClick={() => handleQuickInsert('cylinder')}
            className="bg-[#222632] hover:bg-cyan-600 hover:text-white text-cyan-300 text-[11px] font-medium px-2 py-1 rounded-lg border border-[#343b4d] transition-all flex items-center gap-1"
            title="Quick Insert 3D Cylinder Column"
          >
            + Cylinder
          </button>
          <button
            onClick={() => handleQuickInsert('sphere')}
            className="bg-[#222632] hover:bg-cyan-600 hover:text-white text-cyan-300 text-[11px] font-medium px-2 py-1 rounded-lg border border-[#343b4d] transition-all flex items-center gap-1"
            title="Quick Insert 3D Sphere Dome"
          >
            + Sphere
          </button>
          <button
            onClick={() => handleQuickInsert('cone')}
            className="bg-[#222632] hover:bg-cyan-600 hover:text-white text-cyan-300 text-[11px] font-medium px-2 py-1 rounded-lg border border-[#343b4d] transition-all flex items-center gap-1"
            title="Quick Insert 3D Cone Pyramid"
          >
            + Cone
          </button>
        </div>
      </div>
    </div>
  );
};
